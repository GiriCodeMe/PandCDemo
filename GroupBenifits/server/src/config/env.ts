import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';

if (process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  AUTH_MODE: z.enum(['mock', 'jwt']).default('mock'),
  SEED_DIR: z.string().default('../seed'),
  FEATURE_PLAN_VERSIONING: z.coerce.boolean().default(true),
  FEATURE_LIFE_EVENTS: z.coerce.boolean().default(true),
  FEATURE_CARRIER_INTEGRATION: z.coerce.boolean().default(true),
  FEATURE_PAYROLL_INTEGRATION: z.coerce.boolean().default(true),
  FEATURE_IMPACT_ANALYSIS: z.coerce.boolean().default(false),
  FEATURE_AI_REQUIREMENTS: z.coerce.boolean().default(false),
  FEATURE_AI_DOCUMENT_INGESTION: z.coerce.boolean().default(false),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
