import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyRiskAssessmentEntity } from '../../database/entities/property-risk-assessment.entity';
import { PropertyReportEntity } from '../../database/entities/property-report.entity';
import { PropertyEntity } from '../../database/entities/property.entity';
import { ModerationLogEntity } from '../../database/entities/moderation-log.entity';
import { FraudDetectorService } from './fraud-detector.service';
import {
  CreateReportDto,
  ReviewRiskAssessmentDto,
  FraudQueueQueryDto
} from './fraud-protection.types';
import {
  TrustDetails,
  VerificationTier,
  ListingStatus,
  PropertyRiskAssessment
} from '@uytop/shared-types';

@Injectable()
export class FraudProtectionService {
  // In-memory rate limiting map: phone/IP -> timestamp[]
  private reportRateLimits = new Map<string, number[]>();

  constructor(
    @InjectRepository(PropertyRiskAssessmentEntity)
    private riskRepository: Repository<PropertyRiskAssessmentEntity>,
    @InjectRepository(PropertyReportEntity)
    private reportRepository: Repository<PropertyReportEntity>,
    @InjectRepository(PropertyEntity)
    private propertyRepository: Repository<PropertyEntity>,
    @InjectRepository(ModerationLogEntity)
    private moderationLogRepository: Repository<ModerationLogEntity>,
    private fraudDetector: FraudDetectorService
  ) {}

  /**
   * Run automated risk assessment for a property listing
   */
  async assessProperty(propertyId: string): Promise<PropertyRiskAssessmentEntity> {
    const property = await this.propertyRepository.findOne({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Mulk topilmadi');

    // Get nearby/recent published properties for duplicate detection
    const existing = await this.propertyRepository.find({
      where: { status: ListingStatus.PUBLISHED },
      take: 150
    });

    const result = this.fraudDetector.evaluateListing(property, existing);

    // Save or update assessment
    let assessment = await this.riskRepository.findOne({ where: { propertyId } });
    if (!assessment) {
      assessment = this.riskRepository.create({
        propertyId,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        signals: result.signals,
        aiExplanation: result.aiExplanation,
        duplicateOfPropertyId: result.duplicateOfPropertyId,
        status: result.riskLevel === 'CRITICAL' ? 'FLAGGED' : result.riskLevel === 'HIGH' ? 'PENDING_REVIEW' : 'AUTO_APPROVED'
      });
    } else {
      assessment.riskScore = result.riskScore;
      assessment.riskLevel = result.riskLevel;
      assessment.signals = result.signals;
      assessment.aiExplanation = result.aiExplanation;
      assessment.duplicateOfPropertyId = result.duplicateOfPropertyId;
      if (result.riskLevel === 'CRITICAL' && assessment.status !== 'RESOLVED') {
        assessment.status = 'FLAGGED';
      }
    }

    return this.riskRepository.save(assessment);
  }

  /**
   * User reporting endpoint with abuse & spam prevention rate-limiting
   */
  async reportProperty(
    propertyId: string,
    dto: CreateReportDto,
    clientIp?: string
  ): Promise<{ success: boolean; message: string }> {
    const property = await this.propertyRepository.findOne({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Mulk topilmadi');

    // Rate limiting: Max 5 reports per phone/IP per hour
    const rateKey = dto.reporterPhone || clientIp || 'anonymous';
    const now = Date.now();
    const timestamps = (this.reportRateLimits.get(rateKey) || []).filter(
      (t) => now - t < 3600_000
    );

    if (timestamps.length >= 5) {
      throw new BadRequestException(
        "Siz qisqa vaqt ichida juda ko'p shikoyat yubordingiz. Iltimos, keyinroq urinib ko'ring."
      );
    }

    timestamps.push(now);
    this.reportRateLimits.set(rateKey, timestamps);

    // Save report
    const report = this.reportRepository.create({
      propertyId,
      reporterPhone: dto.reporterPhone,
      reason: dto.reason,
      description: dto.description,
      status: 'OPEN'
    });
    await this.reportRepository.save(report);

    // Update risk assessment to escalate priority
    let assessment = await this.riskRepository.findOne({ where: { propertyId } });
    if (assessment) {
      assessment.riskScore = Math.min(100, assessment.riskScore + 15);
      if (assessment.riskScore >= 70 && assessment.riskLevel !== 'CRITICAL') {
        assessment.riskLevel = 'HIGH';
        assessment.status = 'PENDING_REVIEW';
      }
      assessment.signals = [
        ...(assessment.signals || []),
        {
          type: 'REPORTS_ACCUMULATED',
          severity: 'HIGH',
          weight: 15,
          messageUz: `Foydalanuvchi shikoyati kelib tushdi: ${dto.reason}`,
          messageRu: `Поступила жалоба пользователя: ${dto.reason}`,
          evidence: { reason: dto.reason, description: dto.description }
        }
      ];
      await this.riskRepository.save(assessment);
    }

    return {
      success: true,
      message: "Shikoyatingiz qabul qilindi va moderatorlar tomonidan tekshiriladi."
    };
  }

  /**
   * Public Trust & Verification details for a property
   */
  async getTrustDetails(propertyId: string): Promise<TrustDetails> {
    const property = await this.propertyRepository.findOne({ where: { id: propertyId } });
    if (!property) {
      return {
        phoneVerified: true,
        docsVerified: false,
        inspected: false,
        verificationTier: VerificationTier.UNVERIFIED,
        publicBadge: 'STANDARD',
        summaryUz: "E'lon standart tekshiruvdan o'tgan.",
        summaryRu: "Объявление прошло стандартную проверку."
      };
    }

    const tier = property.verificationTier || VerificationTier.UNVERIFIED;
    const isInspected = tier === VerificationTier.INSPECTED;
    const isDocsVerified = tier === VerificationTier.DOCS_VERIFIED || isInspected;
    const isPhoneVerified = Boolean(property.ownerPhone);

    let publicBadge: 'VERIFIED' | 'STANDARD' | 'REVIEW_RECOMMENDED' = 'STANDARD';
    let summaryUz = "E'lon e'lon egasining tasdiqlangan raqami orqali joylashtirilgan.";
    let summaryRu = "Объявление размещено с подтвержденного номера владельца.";

    if (isInspected) {
      publicBadge = 'VERIFIED';
      summaryUz = "UyTop mutaxassisi tomonidan joyida ko'rikdan o'tkazilgan va hujjatlari to'liq tasdiqlangan.";
      summaryRu = "Проверено специалистом UyTop на месте, документы подтверждены.";
    } else if (isDocsVerified) {
      publicBadge = 'VERIFIED';
      summaryUz = "Mulk egalik huquqi hujjatlari moderatorlar tomonidan tekshirilgan.";
      summaryRu = "Правоустанавливающие документы проверены модераторами.";
    }

    return {
      phoneVerified: isPhoneVerified,
      docsVerified: isDocsVerified,
      inspected: isInspected,
      verificationTier: tier,
      publicBadge,
      verifiedDate: property.publishedAt ? new Date(property.publishedAt).toISOString() : property.createdAt.toISOString(),
      summaryUz,
      summaryRu
    };
  }

  /**
   * Moderator Review Queue with evidence and signals
   */
  async getFraudQueue(query: FraudQueueQueryDto): Promise<{
    items: Array<{
      assessment: PropertyRiskAssessmentEntity;
      property: PropertyEntity;
      reportsCount: number;
    }>;
    total: number;
  }> {
    const qb = this.riskRepository
      .createQueryBuilder('ra')
      .leftJoinAndSelect('ra.property', 'p')
      .leftJoinAndSelect('p.images', 'img')
      .orderBy('ra.riskScore', 'DESC')
      .addOrderBy('ra.createdAt', 'DESC');

    if (query.riskLevel) {
      qb.andWhere('ra.riskLevel = :riskLevel', { riskLevel: query.riskLevel });
    }

    if (query.status) {
      qb.andWhere('ra.status = :status', { status: query.status });
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    qb.skip((page - 1) * limit).take(limit);

    const [assessments, total] = await qb.getManyAndCount();

    const items = await Promise.all(
      assessments.map(async (ra) => {
        const reportsCount = await this.reportRepository.count({
          where: { propertyId: ra.propertyId }
        });
        return {
          assessment: ra,
          property: ra.property,
          reportsCount
        };
      })
    );

    return { items, total };
  }

  /**
   * Moderator Review Action Execution (Audit Logged)
   */
  async reviewRiskAssessment(
    assessmentId: string,
    dto: ReviewRiskAssessmentDto,
    moderatorId: string
  ): Promise<{ success: boolean; assessment: PropertyRiskAssessmentEntity }> {
    const assessment = await this.riskRepository.findOne({
      where: { id: assessmentId },
      relations: ['property']
    });
    if (!assessment) throw new NotFoundException("Xavf baholash yozuvi topilmadi");

    const property = assessment.property;

    if (dto.action === 'APPROVE') {
      assessment.status = 'RESOLVED';
      assessment.riskScore = Math.min(25, assessment.riskScore);
      assessment.riskLevel = 'LOW';
      if (property) {
        property.status = ListingStatus.PUBLISHED;
        await this.propertyRepository.save(property);
      }
    } else if (dto.action === 'REJECT') {
      assessment.status = 'RESOLVED';
      if (property) {
        property.status = ListingStatus.REJECTED;
        await this.propertyRepository.save(property);
      }
    } else if (dto.action === 'SUSPEND') {
      assessment.status = 'FLAGGED';
      if (property) {
        property.status = ListingStatus.SUSPENDED;
        await this.propertyRepository.save(property);
      }
    } else if (dto.action === 'REQUEST_VERIFICATION') {
      assessment.status = 'PENDING_REVIEW';
      if (property) {
        property.verificationTier = VerificationTier.UNVERIFIED;
        await this.propertyRepository.save(property);
      }
    }

    assessment.reviewedBy = moderatorId;
    assessment.reviewedAt = new Date().toISOString();
    const updated = await this.riskRepository.save(assessment);

    // Write audit log
    const log = this.moderationLogRepository.create({
      propertyId: assessment.propertyId,
      moderatorId,
      action: dto.action === 'APPROVE' ? 'APPROVED' : dto.action === 'REJECT' ? 'REJECTED' : 'SUSPENDED',
      reason: dto.reason || "Firibgarlikdan himoya tizimi orqali ko'rib chiqildi",
      metadata: { riskScore: assessment.riskScore, signals: assessment.signals }
    });
    await this.moderationLogRepository.save(log);

    return { success: true, assessment: updated };
  }
}
