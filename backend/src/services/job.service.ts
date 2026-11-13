import { prisma } from '../config/prisma.js';
import { JobStatus, EmploymentType, WorkplaceType, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export class JobService {
  async createJob(orgId: string, creatorId: string, data: any) {
    const baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    return await prisma.job.create({
      data: {
        organizationId: orgId,
        createdBy: creatorId,
        title: data.title,
        slug,
        description: data.description,
        requirements: data.requirements,
        responsibilities: data.responsibilities,
        employmentType: data.employmentType || EmploymentType.FULL_TIME,
        workplaceType: data.workplaceType || WorkplaceType.ON_SITE,
        experienceMin: data.experienceMin ?? 0,
        experienceMax: data.experienceMax,
        salaryMin: data.salaryMin ? Number(data.salaryMin) : null,
        salaryMax: data.salaryMax ? Number(data.salaryMax) : null,
        location: data.location,
        department: data.department,
        openings: data.openings ?? 1,
        status: data.status || JobStatus.DRAFT,
        applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
        publishedAt: data.status === JobStatus.PUBLISHED ? new Date() : null,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async getOrgJobs(orgId: string, query: {
    status?: JobStatus;
    department?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {
      organizationId: orgId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.department ? { department: query.department } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { id: true, name: true } },
          _count: {
            select: { applications: true },
          },
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

  async getJobById(orgId: string, jobId: string) {
    const job = await prisma.job.findFirst({
      where: { id: jobId, organizationId: orgId },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundError('Job opening not found.');
    }

    return job;
  }

  async updateJob(orgId: string, jobId: string, data: any) {
    await this.getJobById(orgId, jobId);

    return await prisma.job.update({
      where: { id: jobId },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(data.requirements ? { requirements: data.requirements } : {}),
        ...(data.responsibilities !== undefined ? { responsibilities: data.responsibilities } : {}),
        ...(data.employmentType ? { employmentType: data.employmentType } : {}),
        ...(data.workplaceType ? { workplaceType: data.workplaceType } : {}),
        ...(data.experienceMin !== undefined ? { experienceMin: data.experienceMin } : {}),
        ...(data.experienceMax !== undefined ? { experienceMax: data.experienceMax } : {}),
        ...(data.salaryMin !== undefined ? { salaryMin: data.salaryMin ? Number(data.salaryMin) : null } : {}),
        ...(data.salaryMax !== undefined ? { salaryMax: data.salaryMax ? Number(data.salaryMax) : null } : {}),
        ...(data.location ? { location: data.location } : {}),
        ...(data.department ? { department: data.department } : {}),
        ...(data.openings !== undefined ? { openings: data.openings } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.applicationDeadline !== undefined ? { applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null } : {}),
      },
    });
  }

  async deleteJob(orgId: string, jobId: string) {
    await this.getJobById(orgId, jobId);

    await prisma.job.delete({
      where: { id: jobId },
    });

    return true;
  }

  async publishJob(orgId: string, jobId: string) {
    const job = await this.getJobById(orgId, jobId);

    return await prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.PUBLISHED,
        publishedAt: job.publishedAt || new Date(),
      },
    });
  }

  async closeJob(orgId: string, jobId: string) {
    await this.getJobById(orgId, jobId);

    return await prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.CLOSED,
      },
    });
  }

  async getPublicJobs(query: {
    keyword?: string;
    location?: string;
    department?: string;
    employmentType?: EmploymentType;
    workplaceType?: WorkplaceType;
    experienceMin?: number;
    page?: number;
    limit?: number;
    sort?: 'newest' | 'salary_high' | 'salary_low';
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {
      status: JobStatus.PUBLISHED,
      organization: {
        status: 'ACTIVE',
      },
      ...(query.location ? { location: { contains: query.location, mode: 'insensitive' } } : {}),
      ...(query.department ? { department: { contains: query.department, mode: 'insensitive' } } : {}),
      ...(query.employmentType ? { employmentType: query.employmentType } : {}),
      ...(query.workplaceType ? { workplaceType: query.workplaceType } : {}),
      ...(query.experienceMin !== undefined ? { experienceMin: { lte: query.experienceMin } } : {}),
      ...(query.keyword
        ? {
            OR: [
              { title: { contains: query.keyword, mode: 'insensitive' } },
              { description: { contains: query.keyword, mode: 'insensitive' } },
              { requirements: { contains: query.keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    let orderBy: Prisma.JobOrderByWithRelationInput = { publishedAt: 'desc' };
    if (query.sort === 'salary_high') {
      orderBy = { salaryMax: 'desc' };
    } else if (query.sort === 'salary_low') {
      orderBy = { salaryMin: 'asc' };
    }

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              industry: true,
              location: true,
            },
          },
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

  async getPublicJobBySlug(slug: string) {
    const job = await prisma.job.findFirst({
      where: {
        slug,
        status: JobStatus.PUBLISHED,
        organization: { status: 'ACTIVE' },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            website: true,
            industry: true,
            companySize: true,
            logo: true,
            location: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundError('Job posting not found or is no longer active.');
    }

    return job;
  }
}

export const jobService = new JobService();

