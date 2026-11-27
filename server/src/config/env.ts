import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  APP_NAME: z.string().trim().min(1).default('Zero Compile'),
  REF_CODE_PREFIX: z.string().trim().min(2).max(10).default('ZRC'),
  AUTH_URL: z.string().trim().default('http://localhost:5173'),
  CLIENT_ORIGIN: z.string().trim().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  AUTH_SECRET: z.string().min(16, 'AUTH_SECRET must be at least 16 characters'),
  COOKIE_NAME: z.string().trim().min(1).default('zrc_session'),
  TRUST_PROXY: z.enum(['true', 'false', 'vercel', 'cloudflare']).default('false'),
  RATE_LIMIT_STORE: z.enum(['postgres', 'redis', 'memory']).default('postgres'),
  DISABLE_INQUIRY_RATE_LIMIT: z
    .enum(['true', 'false', ''])
    .optional()
    .transform((v) => v === 'true'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  EMAIL_PROVIDER: z.enum(['console', 'resend', 'smtp']).default('console'),
  EMAIL_FROM: z.string().default('Zero Compile <no-reply@zerocompile.example>'),
  RESEND_API_KEY: z.string().optional().default(''),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
