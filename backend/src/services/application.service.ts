import { prisma } from '../config/prisma.js';
import { ApplicationStage, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors.js';
import { notificationService } from './notification.service.js';

export class ApplicationService {
  async submitApplication(userId: string, data: {
    jobId: string;
    resumeUrl: string;
    coverLetter?: string;
    source?: string;
  }) {
    // 1. Get or create candidate profile
    let candidate = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidate) {
      candidate = await prisma.candidateProfile.create({
        data: {
          userId,
          resumeUrl: data.resumeUrl,
        },
      });
    }

    // 2. Check if job exists and is open
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
      include: {
        organization: true,
      },
    });

    if (!job || job.status !== 'PUBLISHED') {
      throw new BadRequestError('This job opening is not accepting applications.');
    }

    // 3. Prevent duplicate applications
    const existing = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId: data.jobId,
          candidateId: candidate.id,
        },
      },
    });

    if (existing) {
      throw new ConflictError('You have already submitted an application for this position.');
    }

    return await prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: {
          jobId: data.jobId,
          candidateId: candidate.id,
          resumeUrl: data.resumeUrl,
          coverLetter: data.coverLetter,
          source: data.source || 'CAREERS_PAGE',
          status: ApplicationStage.APPLIED,
          stageHistory: {
            create: {
              previousStage: null,
              newStage: ApplicationStage.APPLIED,
              notes: 'Application submitted successfully.',
            },
          },
        },
        include: {
          job: true,
          candidate: {
            include: { user: true },
          },
        },
      });

      // Notify organization recruiter/creator
      await notificationService.createNotification({
        userId: job.createdBy,
        title: 'New Candidate Application',
        message: `${application.candidate.user.name} applied for "${job.title}".`,
        type: 'APPLICATION',
        relatedEntityId: application.id,
      });

      return application;
    });
  }

  async getApplications(orgId: string, query: {
    jobId?: string;
    status?: ApplicationStage;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ApplicationWhereInput = {
      job: { organizationId: orgId },
      ...(query.jobId ? { jobId: query.jobId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            candidate: {
              user: {
                OR: [
                  { name: { contains: query.search, mode: 'insensitive' } },
                  { email: { contains: query.search, mode: 'insensitive' } },
                ],
              },
            },
          }
        : {}),
    };

    const [total, applications] = await Promise.all([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appliedAt: 'desc' },
        include: {
          job: {
            select: { id: true, title: true, department: true, location: true },
          },
          candidate: {
            include: {
              user: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
              skills: { include: { skill: true } },
            },
          },
          interviews: {
            select: { id: true, scheduledAt: true, status: true, interviewType: true },
          },
        },
      }),
    ]);

    return {
      applications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getKanbanBoard(orgId: string, jobId?: string) {
    const where: Prisma.ApplicationWhereInput = {
      job: { organizationId: orgId },
      ...(jobId ? { jobId } : {}),
    };

    const applications = await prisma.application.findMany({
      where,
      orderBy: { appliedAt: 'desc' },
      include: {
        job: { select: { id: true, title: true, department: true } },
        candidate: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
            skills: { include: { skill: true } },
          },
        },
        interviews: {
          select: { id: true, scheduledAt: true, status: true, interviewType: true },
        },
      },
    });

    const stages: ApplicationStage[] = [
      ApplicationStage.APPLIED,
      ApplicationStage.SCREENING,
      ApplicationStage.SHORTLISTED,
      ApplicationStage.INTERVIEW,
      ApplicationStage.ASSESSMENT,
      ApplicationStage.OFFERED,
      ApplicationStage.HIRED,
      ApplicationStage.REJECTED,
    ];

    const grouped: Record<ApplicationStage, typeof applications> = {
      APPLIED: [],
      SCREENING: [],
      SHORTLISTED: [],
      INTERVIEW: [],
      ASSESSMENT: [],
      OFFERED: [],
      HIRED: [],
      REJECTED: [],
    };

    for (const app of applications) {
      if (grouped[app.status]) {
        grouped[app.status].push(app);
      }
    }

    return grouped;
  }

  async getApplicationById(orgId: string, applicationId: string) {
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: { organizationId: orgId },
      },
      include: {
        job: true,
        candidate: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
            skills: { include: { skill: true } },
          },
        },
        stageHistory: {
          orderBy: { createdAt: 'desc' },
          include: {
            changer: { select: { id: true, name: true, role: true } },
          },
        },
        interviews: {
          orderBy: { scheduledAt: 'desc' },
          include: {
            interviewer: { select: { id: true, name: true, email: true } },
            feedback: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundError('Application not found.');
    }

    return application;
  }

  async updateStatus(
    orgId: string,
    applicationId: string,
    changerUserId: string,
    newStage: ApplicationStage,
    notes?: string
  ) {
    const application = await this.getApplicationById(orgId, applicationId);

    if (application.status === newStage) {
      return application;
    }

    const previousStage = application.status;

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id: applicationId },
        data: {
          status: newStage,
          stageHistory: {
            create: {
              previousStage,
              newStage,
              changedBy: changerUserId,
              notes: notes || `Moved from ${previousStage} to ${newStage}`,
            },
          },
        },
        include: {
          job: true,
          candidate: { include: { user: true } },
        },
      });

      // Notify candidate
      await notificationService.createNotification({
        userId: updated.candidate.userId,
        title: 'Application Status Updated',
        message: `Your application for "${updated.job.title}" has been updated to ${newStage}.`,
        type: 'STATUS_UPDATE',
        relatedEntityId: applicationId,
      });

      return updated;
    });
  }

  async addNotes(orgId: string, applicationId: string, changerUserId: string, notes: string) {
    const application = await this.getApplicationById(orgId, applicationId);

    return await prisma.applicationStageHistory.create({
      data: {
        applicationId,
        previousStage: application.status,
        newStage: application.status,
        changedBy: changerUserId,
        notes,
      },
      include: {
        changer: { select: { id: true, name: true } },
      },
    });
  }

  async withdrawApplication(candidateUserId: string, applicationId: string) {
    const candidate = await prisma.candidateProfile.findUnique({
      where: { userId: candidateUserId },
    });

    if (!candidate) {
      throw new NotFoundError('Candidate profile not found.');
    }

    const application = await prisma.application.findFirst({
      where: { id: applicationId, candidateId: candidate.id },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundError('Application not found.');
    }

    if (application.status === ApplicationStage.HIRED || application.status === ApplicationStage.REJECTED) {
      throw new BadRequestError(`Cannot withdraw application in ${application.status} stage.`);
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStage.REJECTED,
          stageHistory: {
            create: {
              previousStage: application.status,
              newStage: ApplicationStage.REJECTED,
              notes: 'Candidate withdrew application.',
            },
          },
        },
      });

      // Notify recruiter
      await notificationService.createNotification({
        userId: application.job.createdBy,
        title: 'Application Withdrawn',
        message: `A candidate has withdrawn their application for "${application.job.title}".`,
        type: 'APPLICATION',
        relatedEntityId: applicationId,
      });

      return updated;
    });
  }

  async getCandidateApplications(userId: string) {
    const candidate = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidate) {
      return [];
    }

    return await prisma.application.findMany({
      where: { candidateId: candidate.id },
      orderBy: { appliedAt: 'desc' },
      include: {
        job: {
          include: {
            organization: {
              select: { id: true, name: true, logo: true, location: true },
            },
          },
        },
        interviews: {
          orderBy: { scheduledAt: 'asc' },
          select: {
            id: true,
            scheduledAt: true,
            duration: true,
            interviewType: true,
            meetingLink: true,
            status: true,
          },
        },
        stageHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }
}

export const applicationService = new ApplicationService();

