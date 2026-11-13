import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config();

export interface Config {
  env: string;
  port: number;
  frontendUrl: string;
  apiBaseUrl: string;
  database: {
    url?: string;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  cookie: {
    secret: string;
  };
  storage: {
    provider: 'local' | 'cloud';
    uploadDir: string;
    maxFileSizeMb: number;
  };
  smtp: {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    from: string;
    isConfigured: boolean;
  };
  redis: {
    url?: string;
    isConfigured: boolean;
  };
}

const isProduction = process.env.NODE_ENV === 'production';

// Safe development fallback secrets if not specified in .env
const defaultDevSecret = 'dev_secret_key_hireflow_enterprise_development_only_12345';

export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api/v1',
  database: {
    url: process.env.DATABASE_URL || undefined,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || (isProduction ? '' : defaultDevSecret + '_access'),
    refreshSecret: process.env.JWT_REFRESH_SECRET || (isProduction ? '' : defaultDevSecret + '_refresh'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cookie: {
    secret: process.env.COOKIE_SECRET || (isProduction ? '' : defaultDevSecret + '_cookie'),
  },
  storage: {
    provider: (process.env.STORAGE_PROVIDER as 'local' | 'cloud') || 'local',
    uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  },
  smtp: {
    host: process.env.SMTP_HOST || undefined,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
    user: process.env.SMTP_USER || undefined,
    password: process.env.SMTP_PASSWORD || undefined,
    from: process.env.SMTP_FROM || 'noreply@hireflow.io',
    isConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
  },
  redis: {
    url: process.env.REDIS_URL || undefined,
    isConfigured: Boolean(process.env.REDIS_URL),
  },
};

export function validateConfig() {
  if (isProduction) {
    const requiredEnv = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'COOKIE_SECRET'];
    const missing = requiredEnv.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      console.warn(`⚠️ Warning: Missing production security variables: ${missing.join(', ')}`);
    }
  }

  if (!config.database.url) {
    console.warn('⚠️ Warning: DATABASE_URL is not set. Database operations will require PostgreSQL configuration.');
  }

  if (!config.smtp.isConfigured) {
    console.info('ℹ️ SMTP is not configured. Email notifications will be logged to console in development mode.');
  }

  if (!config.redis.isConfigured) {
    console.info('ℹ️ Redis is not configured. Real-time notifications will use direct in-memory WebSockets.');
  }
}

