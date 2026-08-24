import { PropertyReportReason, RiskLevel } from '@uytop/shared-types';

export interface CreateReportDto {
  reason: PropertyReportReason;
  description?: string;
  reporterPhone?: string;
}

export interface ReviewRiskAssessmentDto {
  action: 'APPROVE' | 'REJECT' | 'REQUEST_VERIFICATION' | 'SUSPEND';
  reason?: string;
}

export interface FraudQueueQueryDto {
  riskLevel?: RiskLevel;
  status?: string;
  page?: number;
  limit?: number;
}
