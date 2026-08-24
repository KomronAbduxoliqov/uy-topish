import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyRiskAssessmentEntity } from '../../database/entities/property-risk-assessment.entity';
import { PropertyReportEntity } from '../../database/entities/property-report.entity';
import { PropertyEntity } from '../../database/entities/property.entity';
import { ModerationLogEntity } from '../../database/entities/moderation-log.entity';
import { FraudDetectorService } from './fraud-detector.service';
import { FraudProtectionService } from './fraud-protection.service';
import { FraudProtectionController } from './fraud-protection.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertyRiskAssessmentEntity,
      PropertyReportEntity,
      PropertyEntity,
      ModerationLogEntity
    ])
  ],
  controllers: [FraudProtectionController],
  providers: [FraudDetectorService, FraudProtectionService],
  exports: [FraudDetectorService, FraudProtectionService]
})
export class FraudProtectionModule {}
