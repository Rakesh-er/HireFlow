import { prisma } from '../config/prisma.js';
import { InterviewType, InterviewStatus, Recommendation, ApplicationStage, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors.js';
import { notificationService } from './notification.service.js';

export class InterviewService {
  async scheduleInterview(orgId: string, data: {
    applicationId: string;
    interviewerId: string;
    scheduledAt: string;
    duration: number;
    interviewType: InterviewType;
    meetingLink?: string;
    location?: string;
    notes?: string;
  }) {
    // 1. Check application exists in organization
    const application = await prisma.application.findFirst({
      where: {
        id: data.applicationId,
        job: { organizationId: orgId },
      },
      include: {
        job: true,
        candidate: { include: { user: true } },
      },
    });

    if (!application) {
      throw new NotFoundError('Application not found in your organization.');
    }

    // 2. Check interviewer is in the organization
    const interviewer = await prisma.user.findFirst({
      where: {
        id: data.interviewerId,
        organizationMembers: {
          some: { organizationId: orgId },
        },
      },
    });

    if (!interviewer) {
      throw new BadRequestError('Assigned interviewer is not an active member of this organization.');
    }

    const scheduledDate = new Date(data.scheduledAt);
    const duration = data.duration || 45;
    const endDate = new Date(scheduledDate.getTime() + duration * 60 * 1000);

    // 3. Conflict Check: Prevent interviewer double-booking
    // Find any existing non-cancelled interview for this interviewer that overlaps
    const conflicting = await prisma.interview.findFirst({
      where: {
        interviewerId: data.interviewerId,
        status: { in: [InterviewStatus.SCHEDULED, InterviewStatus.RESCHEDULED] },
        scheduledAt: {
          lt: endDate,
          gte: new Date(scheduledDate.getTime() - 240 * 60 * 1000), // Check within reasonable window
        },
      },
    });

    if (conflicting) {
      const conflictEnd = new Date(conflicting.scheduledAt.getTime() + conflicting.duration * 60 * 1000);
      if (scheduledDate < conflictEnd && endDate > conflicting.scheduledAt) {
        throw new ConflictError(
          `Interviewer scheduling conflict: The interviewer is already scheduled for an interview between ${conflicting.scheduledAt.toLocaleTimeString()} and ${conflictEnd.toLocaleTimeString()}.`
        );
      }
    }

    return await prisma.$transaction(async (tx) => {
      const interview = await tx.interview.create({
        data: {
          applicationId: data.applicationId,
          interviewerId: data.interviewerId,
          scheduledAt: scheduledDate,
          duration,
          interviewType: data.interviewType || InterviewType.TECHNICAL,
          meetingLink: data.meetingLink,
          location: data.location,
          notes: data.notes,
          status: InterviewStatus.SCHEDULED,
        },
        include: {
          interviewer: { select: { id: true, name: true, email: true } },
          application: {
            include: {
              job: true,
              candidate: { include: { user: true } },
            },
          },
        },
      });

      // Update application stage to INTERVIEW if in previous stages
      const previousStages: ApplicationStage[] = [ApplicationStage.APPLIED, ApplicationStage.SCREENING, ApplicationStage.SHORTLISTED];
      if (previousStages.includes(application.status)) {
        await tx.application.update({
          where: { id: application.id },
          data: {
            status: ApplicationStage.INTERVIEW,
            stageHistory: {
              create: {
                previousStage: application.status,
                newStage: ApplicationStage.INTERVIEW,
                notes: `Interview scheduled for ${scheduledDate.toLocaleDateString()}.`,
              },
            },
          },
        });
      }

      // Notify candidate
      await notificationService.createNotification({
        userId: application.candidate.userId,
        title: 'Interview Scheduled',
        message: `An interview for "${application.job.title}" has been scheduled on ${scheduledDate.toLocaleString()}.`,
        type: 'INTERVIEW_SCHEDULED',
        relatedEntityId: interview.id,
      });

      // Notify interviewer
      await notificationService.createNotification({
        userId: interviewer.id,
        title: 'New Interview Assigned',
        message: `You have been assigned to interview ${application.candidate.user.name} on ${scheduledDate.toLocaleString()}.`,
        type: 'INTERVIEW_ASSIGNED',
        relatedEntityId: interview.id,
      });

      return interview;
    });
  }

  async getInterviews(orgId: string, query: {
    status?: InterviewStatus;
    interviewerId?: string;
    applicationId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.InterviewWhereInput = {
      application: {
        job: { organizationId: orgId },
      },
      ...(query.status ? { status: query.status } : {}),
      ...(query.interviewerId ? { interviewerId: query.interviewerId } : {}),
      ...(query.applicationId ? { applicationId: query.applicationId } : {}),
    };

    const [total, interviews] = await Promise.all([
      prisma.interview.count({ where }),
      prisma.interview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'asc' },
        include: {
          interviewer: { select: { id: true, name: true, email: true, avatar: true } },
          feedback: true,
          application: {
            select: {
              id: true,
              status: true,
              job: { select: { id: true, title: true, department: true } },
              candidate: {
                include: {
                  user: { select: { id: true, name: true, email: true, avatar: true } },
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      interviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getInterviewById(orgId: string, interviewId: string) {
    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        application: { job: { organizationId: orgId } },
      },
      include: {
        interviewer: { select: { id: true, name: true, email: true, avatar: true } },
        feedback: {
          include: {
            interviewer: { select: { id: true, name: true, email: true } },
          },
        },
        application: {
          include: {
            job: true,
            candidate: {
              include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
                skills: { include: { skill: true } },
              },
            },
          },
        },
      },
    });

    if (!interview) {
      throw new NotFoundError('Interview not found.');
    }

    return interview;
  }

  async updateInterview(orgId: string, interviewId: string, data: any) {
    const interview = await this.getInterviewById(orgId, interviewId);

    const scheduledDate = data.scheduledAt ? new Date(data.scheduledAt) : interview.scheduledAt;
    const duration = data.duration ?? interview.duration;

    // Check conflicts if schedule time changed
    if (data.scheduledAt) {
      const endDate = new Date(scheduledDate.getTime() + duration * 60 * 1000);
      const conflicting = await prisma.interview.findFirst({
        where: {
          id: { not: interviewId },
          interviewerId: interview.interviewerId,
          status: { in: [InterviewStatus.SCHEDULED, InterviewStatus.RESCHEDULED] },
          scheduledAt: {
            lt: endDate,
            gte: new Date(scheduledDate.getTime() - 240 * 60 * 1000),
          },
        },
      });

      if (conflicting) {
        const conflictEnd = new Date(conflicting.scheduledAt.getTime() + conflicting.duration * 60 * 1000);
        if (scheduledDate < conflictEnd && endDate > conflicting.scheduledAt) {
          throw new ConflictError('Interviewer scheduling conflict with an existing appointment.');
        }
      }
    }

    const updated = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        ...(data.scheduledAt ? { scheduledAt: scheduledDate, status: InterviewStatus.RESCHEDULED } : {}),
        ...(data.duration !== undefined ? { duration } : {}),
        ...(data.interviewType ? { interviewType: data.interviewType } : {}),
        ...(data.meetingLink !== undefined ? { meetingLink: data.meetingLink } : {}),
        ...(data.location !== undefined ? { location: data.location } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.status ? { status: data.status } : {}),
      },
      include: {
        interviewer: { select: { id: true, name: true, email: true } },
        application: {
          include: { candidate: { include: { user: true } }, job: true },
        },
      },
    });

    if (data.scheduledAt || data.status === InterviewStatus.RESCHEDULED) {
      await notificationService.createNotification({
        userId: updated.application.candidate.userId,
        title: 'Interview Rescheduled',
        message: `Your interview for "${updated.application.job.title}" has been rescheduled to ${scheduledDate.toLocaleString()}.`,
        type: 'INTERVIEW_RESCHEDULED',
        relatedEntityId: interviewId,
      });
    }

    return updated;
  }

  async deleteInterview(orgId: string, interviewId: string) {
    const interview = await this.getInterviewById(orgId, interviewId);

    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: InterviewStatus.CANCELLED },
    });

    await notificationService.createNotification({
      userId: interview.application.candidate.userId,
      title: 'Interview Cancelled',
      message: `Your interview for "${interview.application.job.title}" has been cancelled.`,
      type: 'INTERVIEW_CANCELLED',
      relatedEntityId: interviewId,
    });

    return true;
  }

  async submitFeedback(orgId: string, interviewId: string, interviewerUserId: string, data: {
    rating: number;
    technicalSkills?: number;
    communicationSkills?: number;
    strengths?: string;
    weaknesses?: string;
    comments: string;
    recommendation: Recommendation;
  }) {
    const interview = await this.getInterviewById(orgId, interviewId);

    return await prisma.$transaction(async (tx) => {
      const feedback = await tx.interviewFeedback.create({
        data: {
          interviewId,
          interviewerId: interviewerUserId,
          rating: data.rating,
          technicalSkills: data.technicalSkills,
          communicationSkills: data.communicationSkills,
          strengths: data.strengths,
          weaknesses: data.weaknesses,
          comments: data.comments,
          recommendation: data.recommendation,
        },
      });

      // Mark interview completed
      await tx.interview.update({
        where: { id: interviewId },
        data: { status: InterviewStatus.COMPLETED },
      });

      // Notify job creator / recruiter
      await notificationService.createNotification({
        userId: interview.application.job.createdBy,
        title: 'Interview Feedback Submitted',
        message: `Interview feedback submitted for ${interview.application.candidate.user.name}.`,
        type: 'FEEDBACK_SUBMITTED',
        relatedEntityId: interviewId,
      });

      return feedback;
    });
  }

  async getFeedback(orgId: string, interviewId: string) {
    await this.getInterviewById(orgId, interviewId);

    return await prisma.interviewFeedback.findMany({
      where: { interviewId },
      include: {
        interviewer: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const interviewService = new InterviewService();

