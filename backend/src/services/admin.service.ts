import { prisma, checkDatabaseConnection } from '../config/prisma.js';
import { OrgStatus, UserRole, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export class AdminService {
  async getOrganizations(query: {
    search?: string;
    status?: OrgStatus;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.OrganizationWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { slug: { contains: query.search, mode: 'insensitive' } },
              { industry: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, organizations] = await Promise.all([
      prisma.organization.count({ where }),
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { members: true, jobs: true },
          },
          subscriptions: {
            where: { status: 'ACTIVE' },
            take: 1,
          },
        },
      }),
    ]);

    return {
      organizations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateOrganizationStatus(orgId: string, status: OrgStatus) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundError('Organization not found.');
    }

    return await prisma.organization.update({
      where: { id: orgId },
      data: { status },
    });
  }

  async getUsers(query: {
    search?: string;
    role?: UserRole;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          isVerified: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          organizationMembers: {
            include: {
              organization: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
      }),
    ]);

    return {
      users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found.');

    if (user.role === UserRole.SUPER_ADMIN && !isActive) {
      throw new BadRequestError('Cannot deactivate a Super Administrator.');
    }

    return await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        role: true,
      },
    });
  }

  async getAllJobs(query: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { organization: { name: { contains: query.search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          organization: { select: { id: true, name: true, slug: true } },
          _count: { select: { applications: true } },
        },
      }),
    ]);

    return {
      jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getActivityLogs(query: {
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      prisma.activityLog.count(),
      prisma.activityLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          organization: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSystemHealth() {
    const dbConnected = await checkDatabaseConnection();
    const memoryUsage = process.memoryUsage();

    return {
      status: dbConnected ? 'HEALTHY' : 'DEGRADED',
      database: dbConnected ? 'CONNECTED' : 'DISCONNECTED',
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      memory: {
        rssMb: (memoryUsage.rss / 1024 / 1024).toFixed(2),
        heapUsedMb: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
        heapTotalMb: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
      },
      timestamp: new Date().toISOString(),
    };
  }
}

export const adminService = new AdminService();

