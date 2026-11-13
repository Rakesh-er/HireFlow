import { prisma } from '../config/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import { Prisma } from '@prisma/client';

export class CandidateService {
  async getCandidateDirectory(query: {
    search?: string;
    skills?: string[];
    minExperience?: number;
    location?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.CandidateProfileWhereInput = {
      ...(query.minExperience ? { experienceYears: { gte: query.minExperience } } : {}),
      ...(query.location ? { location: { contains: query.location, mode: 'insensitive' } } : {}),
      ...(query.search
        ? {
            OR: [
              { headline: { contains: query.search, mode: 'insensitive' } },
              { currentPosition: { contains: query.search, mode: 'insensitive' } },
              { currentCompany: { contains: query.search, mode: 'insensitive' } },
              { user: { name: { contains: query.search, mode: 'insensitive' } } },
              { user: { email: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
      ...(query.skills && query.skills.length > 0
        ? {
            skills: {
              some: {
                skill: {
                  name: { in: query.skills, mode: 'insensitive' },
                },
              },
            },
          }
        : {}),
    };

    const [total, candidates] = await Promise.all([
      prisma.candidateProfile.count({ where }),
      prisma.candidateProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatar: true },
          },
          skills: {
            include: { skill: true },
          },
          _count: {
            select: { applications: true },
          },
        },
      }),
    ]);

    return {
      candidates,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCandidateById(candidateId: string) {
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        skills: { include: { skill: true } },
        applications: {
          include: {
            job: {
              select: { id: true, title: true, department: true, location: true, organizationId: true },
            },
          },
          orderBy: { appliedAt: 'desc' },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundError('Candidate not found.');
    }

    return candidate;
  }

  async getCurrentProfile(userId: string) {
    let candidate = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        skills: { include: { skill: true } },
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
      },
    });

    if (!candidate) {
      candidate = await prisma.candidateProfile.create({
        data: { userId },
        include: {
          skills: { include: { skill: true } },
          user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        },
      });
    }

    return candidate;
  }

  async updateCurrentProfile(userId: string, data: any) {
    const candidate = await this.getCurrentProfile(userId);

    return await prisma.candidateProfile.update({
      where: { id: candidate.id },
      data: {
        ...(data.headline !== undefined ? { headline: data.headline } : {}),
        ...(data.summary !== undefined ? { summary: data.summary } : {}),
        ...(data.location !== undefined ? { location: data.location } : {}),
        ...(data.experienceYears !== undefined ? { experienceYears: data.experienceYears } : {}),
        ...(data.currentCompany !== undefined ? { currentCompany: data.currentCompany } : {}),
        ...(data.currentPosition !== undefined ? { currentPosition: data.currentPosition } : {}),
        ...(data.expectedSalary !== undefined ? { expectedSalary: data.expectedSalary ? Number(data.expectedSalary) : null } : {}),
        ...(data.noticePeriod !== undefined ? { noticePeriod: data.noticePeriod } : {}),
        ...(data.portfolioUrl !== undefined ? { portfolioUrl: data.portfolioUrl } : {}),
        ...(data.linkedinUrl !== undefined ? { linkedinUrl: data.linkedinUrl } : {}),
        ...(data.githubUrl !== undefined ? { githubUrl: data.githubUrl } : {}),
      },
      include: {
        skills: { include: { skill: true } },
      },
    });
  }

  async updateResume(userId: string, resumeUrl: string) {
    const candidate = await this.getCurrentProfile(userId);

    return await prisma.candidateProfile.update({
      where: { id: candidate.id },
      data: { resumeUrl },
    });
  }

  async updateSkills(userId: string, skills: Array<{ name: string; proficiency?: string }>) {
    const candidate = await this.getCurrentProfile(userId);

    return await prisma.$transaction(async (tx) => {
      // Remove current candidate skills
      await tx.candidateSkill.deleteMany({
        where: { candidateId: candidate.id },
      });

      // Add each skill
      for (const item of skills) {
        const skillRecord = await tx.skill.upsert({
          where: { name: item.name.trim() },
          update: {},
          create: { name: item.name.trim() },
        });

        await tx.candidateSkill.create({
          data: {
            candidateId: candidate.id,
            skillId: skillRecord.id,
            proficiency: item.proficiency || 'Intermediate',
          },
        });
      }

      return await tx.candidateProfile.findUnique({
        where: { id: candidate.id },
        include: {
          skills: { include: { skill: true } },
        },
      });
    });
  }
}

export const candidateService = new CandidateService();

