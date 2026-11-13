import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/index.js';
import { AuthUser } from '../types/index.js';

export function generateAccessToken(payload: AuthUser): string {
  return jwt.sign(
    {
      sub: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      organizationId: payload.organizationId,
      organizationRole: payload.organizationRole,
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn as any }
  );
}

export function generateRefreshTokenString(): string {
  return crypto.randomBytes(40).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token: string): any {
  return jwt.verify(token, config.jwt.accessSecret);
}

