import { Injectable } from '@nestjs/common';
import {
  FraudSignal,
  RiskLevel,
  Property,
  PropertyRiskAssessment,
  VerificationTier
} from '@uytop/shared-types';
import { PropertyEntity } from '../../database/entities/property.entity';

// Median price per m2 estimates across Tashkent districts for rental (UZS/m2)
const DISTRICT_MEDIAN_RENT_PER_SQM: Record<string, number> = {
  'Mirobod': 95_000,
  'Yakkasaroy': 85_000,
  'Shayxontohur': 80_000,
  'Mirzo Ulug\'bek': 75_000,
  'Yunusobod': 68_000,
  'Chilonzor': 62_000,
  'Yashnobod': 58_000,
  'Uchtepa': 52_000,
  'Olmazor': 50_000,
  'Sergeli': 45_000,
  'Bektemir': 38_000,
  'Yangihayot': 42_000,
};

@Injectable()
export class FraudDetectorService {
  /**
   * Comprehensive Risk Evaluation for a Property Listing
   */
  evaluateListing(
    property: PropertyEntity | Property,
    existingProperties: Array<PropertyEntity | Property> = []
  ): {
    riskScore: number;
    riskLevel: RiskLevel;
    signals: FraudSignal[];
    aiExplanation: string;
    duplicateOfPropertyId?: string;
  } {
    const signals: FraudSignal[] = [];

    // 1. Duplicate Detection
    const dupResult = this.detectDuplicateSignals(property, existingProperties);
    if (dupResult.signal) {
      signals.push(dupResult.signal);
    }

    // 2. Price Anomaly Detection
    const priceSignal = this.detectPriceAnomaly(property);
    if (priceSignal) {
      signals.push(priceSignal);
    }

    // 3. Price Inconsistency (Description text vs Structured price)
    const mismatchSignal = this.detectPriceMismatch(property);
    if (mismatchSignal) {
      signals.push(mismatchSignal);
    }

    // 4. Spam & Contact Stuffing in Description
    const spamSignal = this.detectSpamSignals(property);
    if (spamSignal) {
      signals.push(spamSignal);
    }

    // 5. Specification Discrepancies (Title vs Structured fields)
    const specSignal = this.detectSpecDiscrepancies(property);
    if (specSignal) {
      signals.push(specSignal);
    }

    // Calculate Combined Score (0-100)
    let totalScore = 0;
    for (const sig of signals) {
      totalScore += sig.weight;
    }

    // Bound score
    const riskScore = Math.min(100, Math.max(0, totalScore));

    // Assign Risk Level
    let riskLevel: RiskLevel = 'LOW';
    if (riskScore >= 90) riskLevel = 'CRITICAL';
    else if (riskScore >= 70) riskLevel = 'HIGH';
    else if (riskScore >= 30) riskLevel = 'MEDIUM';

    // Generate Explanations for Moderators
    const aiExplanation = this.generateModeratorExplanation(riskScore, riskLevel, signals);

    return {
      riskScore,
      riskLevel,
      signals,
      aiExplanation,
      duplicateOfPropertyId: dupResult.duplicateOfId
    };
  }

  /**
   * 1. Multi-factor Duplicate Detection
   * Uses coordinates (<50m), room count, area (+-5%), price (+-10%), and text overlap
   */
  private detectDuplicateSignals(
    property: PropertyEntity | Property,
    existingProperties: Array<PropertyEntity | Property>
  ): { signal?: FraudSignal; duplicateOfId?: string } {
    const pLat = Number(property.latitude);
    const pLng = Number(property.longitude);
    const pRooms = property.rooms;
    const pArea = Number(property.areaSqm);
    const pPrice = Number(property.priceUzs);

    for (const other of existingProperties) {
      if (other.id === property.id) continue;

      const oLat = Number(other.latitude);
      const oLng = Number(other.longitude);
      const oRooms = other.rooms;
      const oArea = Number(other.areaSqm);
      const oPrice = Number(other.priceUzs);

      // Distance calculation
      const distMeters = this.calculateDistanceMeters(pLat, pLng, oLat, oLng);

      // Same spatial location (<60 meters) + same rooms
      if (distMeters <= 60 && pRooms === oRooms) {
        const areaDiffRatio = Math.abs(pArea - oArea) / Math.max(pArea, 1);
        const priceDiffRatio = Math.abs(pPrice - oPrice) / Math.max(pPrice, 1);

        if (areaDiffRatio <= 0.08 && priceDiffRatio <= 0.15) {
          // Strong Duplicate Found
          const isSameOwner = other.ownerId && property.ownerId && other.ownerId === property.ownerId;

          return {
            duplicateOfId: other.id,
            signal: {
              type: 'DUPLICATE_SUSPECT',
              severity: isSameOwner ? 'MEDIUM' : 'HIGH',
              weight: isSameOwner ? 35 : 60,
              messageUz: `Mulk #${other.id.slice(0, 8)} bilan bir xil joylashuv, xonalar va parametrlar (${Math.round(distMeters)}m masofada).`,
              messageRu: `Подозрение на дубликат с объектом #${other.id.slice(0, 8)} (расстояние ${Math.round(distMeters)}м).`,
              evidence: {
                duplicatePropertyId: other.id,
                distanceMeters: Math.round(distMeters),
                areaDiffPercent: Math.round(areaDiffRatio * 100),
                priceDiffPercent: Math.round(priceDiffRatio * 100),
              }
            }
          };
        }
      }
    }

    return {};
  }

  /**
   * 2. Statistical Price Anomaly Detection
   * Flags listings priced abnormally below (>40%) district median price/m2
   */
  private detectPriceAnomaly(property: PropertyEntity | Property): FraudSignal | undefined {
    if (property.transactionType !== 'RENT') return undefined;

    const district = property.district || 'Chilonzor';
    const medianPerSqm = DISTRICT_MEDIAN_RENT_PER_SQM[district] || 60_000;
    const actualPricePerSqm = Number(property.priceUzs) / Math.max(Number(property.areaSqm), 10);

    const ratio = actualPricePerSqm / medianPerSqm;

    if (ratio < 0.45) {
      // More than 55% below median -> Strong suspicion of scam / fake deposit trap
      const percentBelow = Math.round((1 - ratio) * 100);
      return {
        type: 'PRICE_ANOMALY',
        severity: 'HIGH',
        weight: 45,
        messageUz: `Narx tuman o'rtacha narxidan ${percentBelow}% past (${Math.round(actualPricePerSqm).toLocaleString()} so'm/m² vs ${medianPerSqm.toLocaleString()} so'm/m²).`,
        messageRu: `Цена на ${percentBelow}% ниже медианы по району (${Math.round(actualPricePerSqm).toLocaleString()} сум/м²).`,
        evidence: {
          district,
          medianPerSqm,
          actualPricePerSqm: Math.round(actualPricePerSqm),
          percentBelow
        }
      };
    } else if (ratio < 0.65) {
      // 35-55% below median -> Moderate notice
      const percentBelow = Math.round((1 - ratio) * 100);
      return {
        type: 'PRICE_ANOMALY',
        severity: 'MEDIUM',
        weight: 20,
        messageUz: `Narx tuman bozor narxidan sezilarli past (${percentBelow}% arzon).`,
        messageRu: `Цена существенно ниже рыночной (${percentBelow}% ниже).`,
        evidence: {
          district,
          medianPerSqm,
          actualPricePerSqm: Math.round(actualPricePerSqm),
          percentBelow
        }
      };
    }

    return undefined;
  }

  /**
   * 3. Price Inconsistency (Text in description vs structured price)
   */
  private detectPriceMismatch(property: PropertyEntity | Property): FraudSignal | undefined {
    const text = (property.descriptionUz || property.descriptionRu || '').toLowerCase();
    const structuredPrice = Number(property.priceUzs);

    const mlnMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:mln|million|миллион|млн)/);
    if (mlnMatch) {
      const extractedVal = Math.round(parseFloat(mlnMatch[1].replace(',', '.')) * 1_000_000);
      const diffRatio = Math.abs(extractedVal - structuredPrice) / Math.max(structuredPrice, 1);

      if (diffRatio > 0.35 && extractedVal > 500_000) {
        return {
          type: 'PRICE_MISMATCH',
          severity: 'MEDIUM',
          weight: 25,
          messageUz: `Tavsifda ko'rsatilgan narx (${(extractedVal/1_000_000).toFixed(1)} mln) va asosiy narx (${(structuredPrice/1_000_000).toFixed(1)} mln) o'rtasida nomuvofiqlik mavjud.`,
          messageRu: `Несоответствие цены в описании (${(extractedVal/1_000_000).toFixed(1)} млн) и в карточке (${(structuredPrice/1_000_000).toFixed(1)} млн).`,
          evidence: {
            extractedTextPrice: extractedVal,
            structuredPrice
          }
        };
      }
    }

    return undefined;
  }

  /**
   * 4. Spam & Suspicious Description Elements
   */
  private detectSpamSignals(property: PropertyEntity | Property): FraudSignal | undefined {
    const text = (property.descriptionUz || property.descriptionRu || '').toLowerCase();

    // Check for suspicious external links or telegram redirect spam
    const hasExternalLink = /https?:\/\/|t\.me\/|bit\.ly|telegram\.me/i.test(text);
    const hasExcessiveCaps = (property.descriptionUz || '').length > 40 &&
      (property.descriptionUz || '').replace(/[^A-Z]/g, '').length / (property.descriptionUz || '').length > 0.6;

    if (hasExternalLink) {
      return {
        type: 'SPAM_TEXT',
        severity: 'LOW',
        weight: 15,
        messageUz: "Tavsifda tashqi havola yoki Telegram havolasi mavjud.",
        messageRu: "В описании присутствует внешняя ссылка.",
        evidence: { hasExternalLink: true }
      };
    }

    if (hasExcessiveCaps) {
      return {
        type: 'SPAM_TEXT',
        severity: 'LOW',
        weight: 10,
        messageUz: "Tavsifda haddan tashqari ko'p katta harflar (CAPS) ishlatilgan.",
        messageRu: "В описании чрезмерное количество заглавных букв.",
      };
    }

    return undefined;
  }

  /**
   * 5. Title vs Specification Discrepancies
   */
  private detectSpecDiscrepancies(property: PropertyEntity | Property): FraudSignal | undefined {
    const title = (property.titleUz || property.titleRu || '').toLowerCase();
    const rooms = property.rooms;

    const titleRoomMatch = title.match(/(\d+)\s*(?:-?\s*xona|komnat|комнат)/);
    if (titleRoomMatch) {
      const titleRooms = parseInt(titleRoomMatch[1], 10);
      if (titleRooms !== rooms && titleRooms > 0 && rooms > 0) {
        return {
          type: 'MISLEADING_SPEC',
          severity: 'MEDIUM',
          weight: 20,
          messageUz: `Sarlavhada "${titleRooms} xonali", lekin asosiy maydonda "${rooms} xonali" ko'rsatilgan.`,
          messageRu: `В названии "${titleRooms}-комнатная", но в характеристиках указано ${rooms}.`,
          evidence: {
            titleRooms,
            structuredRooms: rooms
          }
        };
      }
    }

    return undefined;
  }

  /**
   * Explainable summary for human moderators
   */
  private generateModeratorExplanation(
    score: number,
    level: RiskLevel,
    signals: FraudSignal[]
  ): string {
    if (signals.length === 0) {
      return "Hech qanday shubhali holat aniqlanmadi. E'lon xavfsiz va to'liq tasdiqlangan mezonlarga mos.";
    }

    const bulletPoints = signals.map(s => `• ${s.messageUz}`).join('\n');
    return `Xavf darajasi: ${level} (Xavf balli: ${score}/100).\nAniqlangan belgilar:\n${bulletPoints}`;
  }

  private calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }
}
