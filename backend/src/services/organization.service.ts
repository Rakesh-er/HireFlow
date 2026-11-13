import { prisma } from '../config/prisma.js';
import { OrgRole, OrgStatus, InvitationStatus } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import { generateRefreshTokenString, hashToken } from '../utils/token.js';
import { logger } from '../utils/logger.js';

export class OrganizationService {
  async createOrganization(userId: string, data: {
    name: string;
    slug?: string;
    description?: string;
    website?: string;
    industry?: string;
    companySize?: string;
    location?: string;
  }) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

    return await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
          website: data.website,
          industry: data.industry,
          companySize: data.companySize,
          location: data.location,
          members: {
            create: {
              userId,
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

      return org;
    });
  }

  async getCurrentOrganization(orgId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
        _count: {
          select: {
            members: true,
            jobs: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundError('Organization not found.');
    }

    return org;
  }

  async updateCurrentOrganization(orgId: string, data: any) {
    return await prisma.organization.update({
      where: { id: orgId },
      data,
    });
  }

  async getMembers(orgId: string) {
    return await prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async inviteMember(orgId: string, inviterId: string, data: { email: string; role: OrgRole }) {
    const email = data.email.toLowerCase();

    // Check if user is already a member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: orgId,
        user: { email },
      },
    });

    if (existingMember) {
      throw new BadRequestError('User is already a member of this organization.');
    }

    const rawToken = generateRefreshTokenString();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days valid

    const invitation = await prisma.invitation.create({
      data: {
        organizationId: orgId,
        email,
        role: data.role || OrgRole.MEMBER,
        tokenHash,
        expiresAt,
        createdBy: inviterId,
      },
    });

    logger.info(`[Invitation] Member invited to ${orgId}: ${email}. Token: ${rawToken}`);

    return {
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
      devInviteToken: process.env.NODE_ENV === 'development' ? rawToken : undefined,
    };
  }

  async acceptInvitation(userId: string, rawToken: string) {
    const tokenHash = hashToken(rawToken);
    const invitation = await prisma.invitation.findUnique({
      where: { tokenHash },
    });

    if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired invitation token.');
    }

    return await prisma.$transaction(async (tx) => {
      // Create member
      const member = await tx.organizationMember.create({
        data: {
          organizationId: invitation.organizationId,
          userId,
          organizationRole: invitation.role,
          invitationStatus: InvitationStatus.ACCEPTED,
        },
      });

      // Mark invitation accepted
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      });

      return member;
    });
  }

  async updateMemberRole(orgId: string, memberId: string, role: OrgRole) {
    const member = await prisma.organizationMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.organizationId !== orgId) {
      throw new NotFoundError('Member not found in organization.');
    }

    return await prisma.organizationMember.update({
      where: { id: memberId },
      data: { organizationRole: role },
    });
  }

  async removeMember(orgId: string, memberId: string, requesterUserId: string) {
    const member = await prisma.organizationMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.organizationId !== orgId) {
      throw new NotFoundError('Member not found in organization.');
    }

    if (member.userId === requesterUserId) {
      throw new BadRequestError('You cannot remove yourself from the organization.');
    }

    // Ensure we do not remove the last OWNER
    if (member.organizationRole === OrgRole.OWNER) {
      const ownerCount = await prisma.organizationMember.count({
        where: { organizationId: orgId, organizationRole: OrgRole.OWNER },
      });
      if (ownerCount <= 1) {
        throw new BadRequestError('Cannot remove the only organization owner.');
      }
    }

    await prisma.organizationMember.delete({
      where: { id: memberId },
    });

    return true;
  }
}

export const organizationService = new OrganizationService();

