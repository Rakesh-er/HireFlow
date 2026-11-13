import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { UserRole, OrgRole } from '@prisma/client';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../utils/errors.js';
import {
  generateAccessToken,
  generateRefreshTokenString,
  hashToken,
} from '../utils/token.js';
import { AuthUser } from '../types/index.js';
import { logger } from '../utils/logger.js';

export class AuthService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
    organizationName?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError('A user with this email address already exists.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const role = data.role || UserRole.CANDIDATE;

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash,
          role,
          phone: data.phone,
          isVerified: true, // Auto-verify in development/MVP
          isActive: true,
        },
      });

      let organizationId: string | undefined;
      let orgRole: OrgRole | undefined;

      // If Recruiter registered with an organization name, create the organization
      if (role === UserRole.RECRUITER && data.organizationName) {
        const baseSlug = data.organizationName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

        const org = await tx.organization.create({
          data: {
            name: data.organizationName,
            slug,
            members: {
              create: {
                userId: user.id,
                organizationRole: OrgRole.OWNER,
              },
            },
            subscriptions: {
              create: {
                plan: 'STARTER',
                status: 'ACTIVE',
              },
            },
          },
        });
        organizationId = org.id;
        orgRole = OrgRole.OWNER;
      }

      // If Candidate, create default candidate profile
      if (role === UserRole.CANDIDATE) {
        await tx.candidateProfile.create({
          data: {
            userId: user.id,
          },
        });
      }

      // Generate tokens
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId,
        organizationRole: orgRole,
      };

      const accessToken = generateAccessToken(authUser);
      const rawRefreshToken = generateRefreshTokenString();
      const tokenHash = hashToken(rawRefreshToken);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await tx.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      return {
        user: authUser,
        accessToken,
        refreshToken: rawRefreshToken,
      };
    });
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        organizationMembers: {
          include: {
            organization: true,
          },
        },
        candidateProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated. Please contact support.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const primaryOrgMembership = user.organizationMembers[0];

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: primaryOrgMembership?.organizationId,
      organizationRole: primaryOrgMembership?.organizationRole,
    };

    const accessToken = generateAccessToken(authUser);
    const rawRefreshToken = generateRefreshTokenString();
    const tokenHash = hashToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      user: {
        ...authUser,
        avatar: user.avatar,
        phone: user.phone,
        organization: primaryOrgMembership?.organization,
        candidateProfile: user.candidateProfile,
      },
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  async refreshToken(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw new UnauthorizedError('Refresh token required.');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            organizationMembers: true,
          },
        },
      },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token. Please log in again.');
    }

    // Revoke old refresh token (token rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const user = storedToken.user;
    if (!user.isActive) {
      throw new UnauthorizedError('User account is inactive.');
    }

    const primaryOrg = user.organizationMembers[0];
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: primaryOrg?.organizationId,
      organizationRole: primaryOrg?.organizationRole,
    };

    const newAccessToken = generateAccessToken(authUser);
    const newRawRefreshToken = generateRefreshTokenString();
    const newTokenHash = hashToken(newRawRefreshToken);

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newTokenHash,
        expiresAt: newExpiresAt,
      },
    });

    return {
      user: authUser,
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  async logout(rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return true;
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizationMembers: {
          include: {
            organization: true,
          },
        },
        candidateProfile: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const primaryOrg = user.organizationMembers[0];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      organizationId: primaryOrg?.organizationId,
      organizationRole: primaryOrg?.organizationRole,
      organization: primaryOrg?.organization,
      candidateProfile: user.candidateProfile,
    };
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found.');

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestError('Current password does not match.');
    }

    const newHash = await bcrypt.hash(newPass, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return true;
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Return success anyway to avoid user enumeration
      return { message: 'If an account exists with that email, a password reset link has been dispatched.' };
    }

    const rawToken = generateRefreshTokenString();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    logger.info(`[PasswordReset] Reset requested for ${email}. Token: ${rawToken}`);

    return {
      message: 'If an account exists with that email, a password reset link has been dispatched.',
      devToken: process.env.NODE_ENV === 'development' ? rawToken : undefined,
    };
  }

  async resetPassword(rawToken: string, newPass: string) {
    const tokenHash = hashToken(rawToken);
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.usedAt || tokenRecord.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired password reset token.');
    }

    const passwordHash = await bcrypt.hash(newPass, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return true;
  }

  async verifyEmail(rawToken: string) {
    // For MVP/Local dev, mark as verified
    return true;
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; avatar?: string }) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        updatedAt: true,
      },
    });
  }
}

export const authService = new AuthService();

