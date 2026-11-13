import { prisma } from '../config/prisma.js';
import { ApplicationStage, JobStatus, InterviewStatus, UserRole } from '@prisma/client';

export class AnalyticsService {
  async getRecruiterOverview(orgId: string) {
    const [
      activeJobsCount,
      totalApplicationsCount,
      interviewsScheduledCount,
      hiredCount,
      rejectedCount,
      recentApplications,
      upcomingInterviews,
      funnelGroup,
    ] = await Promise.all([
      // Total active jobs
      prisma.job.count({
        where: { organizationId: orgId, status: JobStatus.PUBLISHED },
      }),
      // Total applications
      prisma.application.count({
        where: { job: { organizationId: orgId } },
      }),
      // Interviews scheduled
      prisma.interview.count({
        where: {
          application: { job: { organizationId: orgId } },
          status: InterviewStatus.SCHEDULED,
        },
      }),
      // Hired candidates
      prisma.application.count({
        where: { job: { organizationId: orgId }, status: ApplicationStage.HIRED },
      }),
      // Rejected candidates
      prisma.application.count({
        where: { job: { organizationId: orgId }, status: ApplicationStage.REJECTED },
      }),
      // Recent applications
      prisma.application.findMany({
        where: { job: { organizationId: orgId } },
        take: 5,
        orderBy: { appliedAt: 'desc' },
        include: {
          job: { select: { id: true, title: true } },
          candidate: {
            include: {
              user: { select: { id: true, name: true, email: true, avatar: true } },
            },
          },
        },
      }),
      // Upcoming interviews
      prisma.interview.findMany({
        where: {
          application: { job: { organizationId: orgId } },
          scheduledAt: { gte: new Date() },
          status: InterviewStatus.SCHEDULED,
        },
        take: 5,
        orderBy: { scheduledAt: 'asc' },
        include: {
          interviewer: { select: { id: true, name: true, avatar: true } },
          application: {
            select: {
              job: { select: { id: true, title: true } },
              candidate: {
                include: { user: { select: { id: true, name: true } } },
              },
            },
          },
        },
      }),
      // Recruitment funnel
      prisma.application.groupBy({
        by: ['status'],
        where: { job: { organizationId: orgId } },
        _count: { id: true },
      }),
    ]);

    // Format funnel data with all stages represented
    const stagesOrder: ApplicationStage[] = [
      ApplicationStage.APPLIED,
      ApplicationStage.SCREENING,
      ApplicationStage.SHORTLISTED,
      ApplicationStage.INTERVIEW,
      ApplicationStage.ASSESSMENT,
      ApplicationStage.OFFERED,
      ApplicationStage.HIRED,
      ApplicationStage.REJECTED,
    ];

    const funnelMap: Record<string, number> = {};
    for (const group of funnelGroup) {
      funnelMap[group.status] = group._count.id;
    }

    const funnel = stagesOrder.map((stage) => ({
      stage,
      count: funnelMap[stage] || 0,
    }));

    // Applications trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const rawRecentApps = await prisma.application.findMany({
      where: {
        job: { organizationId: orgId },
        appliedAt: { gte: sevenDaysAgo },
      },
      select: { appliedAt: true },
    });

    const trendMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      trendMap[key] = 0;
    }

    for (const app of rawRecentApps) {
      const key = app.appliedAt.toISOString().split('T')[0];
      if (trendMap[key] !== undefined) {
        trendMap[key]++;
      }
    }

    const applicationTrends = Object.entries(trendMap).map(([date, count]) => ({
      date,
      applications: count,
    }));

    return {
      metrics: {
        activeJobs: activeJobsCount,
        totalApplications: totalApplicationsCount,
        interviewsScheduled: interviewsScheduledCount,
        hiredCandidates: hiredCount,
        rejectedApplications: rejectedCount,
      },
      funnel,
      applicationTrends,
      recentApplications,
      upcomingInterviews,
    };
  }

  async getJobPerformance(orgId: string) {
    const jobs = await prisma.job.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        title: true,
        department: true,
        status: true,
        openings: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return jobs.map((j) => ({
      id: j.id,
      title: j.title,
      department: j.department,
      status: j.status,
      openings: j.openings,
      applicationsCount: j._count.applications,
    }));
  }

  async getCandidateOverview(userId: string) {
    const candidate = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidate) {
      return {
        totalApplications: 0,
        underReview: 0,
        interviewsScheduled: 0,
        shortlisted: 0,
        recentActivity: [],
      };
    }

    const [
      totalApplications,
      underReview,
      shortlisted,
      interviewsScheduled,
      recentApplications,
    ] = await Promise.all([
      prisma.application.count({ where: { candidateId: candidate.id } }),
      prisma.application.count({
        where: {
          candidateId: candidate.id,
          status: { in: [ApplicationStage.APPLIED, ApplicationStage.SCREENING, ApplicationStage.ASSESSMENT] },
        },
      }),
      prisma.application.count({
        where: {
          candidateId: candidate.id,
          status: ApplicationStage.SHORTLISTED,
        },
      }),
      prisma.interview.count({
        where: {
          application: { candidateId: candidate.id },
          status: InterviewStatus.SCHEDULED,
        },
      }),
      prisma.application.findMany({
        where: { candidateId: candidate.id },
        take: 5,
        orderBy: { appliedAt: 'desc' },
        include: {
          job: {
            include: {
              organization: {
                select: { id: true, name: true, logo: true, location: true },
              },
            },
          },
        },
      }),
    ]);

    return {
      metrics: {
        totalApplications,
        underReview,
        shortlisted,
        interviewsScheduled,
      },
      recentActivity: recentApplications,
    };
  }

  async getSuperAdminOverview() {
    const [
      totalOrganizations,
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalJobs,
      totalApplications,
      recentOrganizations,
      recentUsers,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.CANDIDATE } }),
      prisma.user.count({ where: { role: { in: [UserRole.RECRUITER, UserRole.HIRING_MANAGER] } } }),
      prisma.job.count({ where: { status: JobStatus.PUBLISHED } }),
      prisma.application.count(),
      prisma.organization.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { members: true, jobs: true },
          },
        },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      metrics: {
        totalOrganizations,
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalJobs,
        totalApplications,
      },
      recentOrganizations,
      recentUsers,
    };
  }
}

export const analyticsService = new AnalyticsService();

