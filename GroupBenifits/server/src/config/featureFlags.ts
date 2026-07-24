import { env } from './env';

export const featureFlags = {
  planVersioning: env.FEATURE_PLAN_VERSIONING,
  lifeEvents: env.FEATURE_LIFE_EVENTS,
  carrierIntegration: env.FEATURE_CARRIER_INTEGRATION,
  payrollIntegration: env.FEATURE_PAYROLL_INTEGRATION,
  impactAnalysis: env.FEATURE_IMPACT_ANALYSIS,
  aiRequirements: env.FEATURE_AI_REQUIREMENTS,
  aiDocumentIngestion: env.FEATURE_AI_DOCUMENT_INGESTION,
};
