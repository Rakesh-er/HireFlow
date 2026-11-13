import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return prismaInstance;
}

export const prisma = getPrismaClient();

export async function checkDatabaseConnection(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    logger.warn('DATABASE_URL is not set. Database features are currently in pending configuration mode.');
    return false;
  }
  try {
    await prisma.$connect();
    await prisma.$runCommandRaw({ ping: 1 });
    logger.info('✅ MongoDB Database connected successfully.');
    return true;
  } catch (error: any) {
    logger.warn(`⚠️ MongoDB connection attempt failed: ${error.message || error}. Please ensure MongoDB is reachable and DATABASE_URL is configured.`);
    return false;
  }
}

