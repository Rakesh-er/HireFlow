import { z } from 'zod';
import { EmploymentType, WorkplaceType, JobStatus } from '@prisma/client';

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Job title must be at least 3 characters'),
    description: z.string().min(10, 'Job description must be at least 10 characters'),
    requirements: z.string().min(10, 'Requirements must be at least 10 characters'),
    responsibilities: z.string().optional(),
    employmentType: z.nativeEnum(EmploymentType).default(EmploymentType.FULL_TIME),
    workplaceType: z.nativeEnum(WorkplaceType).default(WorkplaceType.ON_SITE),
    experienceMin: z.number().int().min(0).default(0),
    experienceMax: z.number().int().min(0).optional(),
    salaryMin: z.number().positive().optional(),
    salaryMax: z.number().positive().optional(),
    location: z.string().min(2, 'Location is required'),
    department: z.string().min(2, 'Department is required'),
    openings: z.number().int().min(1).default(1),
    applicationDeadline: z.string().datetime().optional().nullable(),
    status: z.nativeEnum(JobStatus).optional().default(JobStatus.DRAFT),
  }),
});

export const updateJobSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid job ID format'),
  }),
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    requirements: z.string().min(10).optional(),
    responsibilities: z.string().optional(),
    employmentType: z.nativeEnum(EmploymentType).optional(),
    workplaceType: z.nativeEnum(WorkplaceType).optional(),
    experienceMin: z.number().int().min(0).optional(),
    experienceMax: z.number().int().min(0).optional(),
    salaryMin: z.number().positive().optional(),
    salaryMax: z.number().positive().optional(),
    location: z.string().min(2).optional(),
    department: z.string().min(2).optional(),
    openings: z.number().int().min(1).optional(),
    status: z.nativeEnum(JobStatus).optional(),
    applicationDeadline: z.string().datetime().optional().nullable(),
  }),
});

export const getPublicJobsSchema = z.object({
  query: z.object({
    keyword: z.string().optional(),
    location: z.string().optional(),
    department: z.string().optional(),
    employmentType: z.nativeEnum(EmploymentType).optional(),
    workplaceType: z.nativeEnum(WorkplaceType).optional(),
    experienceMin: z.coerce.number().int().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sort: z.enum(['newest', 'salary_high', 'salary_low']).default('newest'),
  }),
});

