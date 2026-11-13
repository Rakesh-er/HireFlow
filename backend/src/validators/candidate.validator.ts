import { z } from 'zod';

export const updateCandidateProfileSchema = z.object({
  body: z.object({
    headline: z.string().max(255).optional(),
    summary: z.string().optional(),
    location: z.string().max(100).optional(),
    experienceYears: z.number().int().min(0).max(60).optional(),
    currentCompany: z.string().max(100).optional(),
    currentPosition: z.string().max(100).optional(),
    expectedSalary: z.number().positive().optional().nullable(),
    noticePeriod: z.string().max(50).optional(),
    portfolioUrl: z.string().url().optional().or(z.literal('')),
    linkedinUrl: z.string().url().optional().or(z.literal('')),
    githubUrl: z.string().url().optional().or(z.literal('')),
  }),
});

export const updateCandidateSkillsSchema = z.object({
  body: z.object({
    skills: z.array(
      z.object({
        name: z.string().min(1, 'Skill name is required').max(50),
        proficiency: z.enum(['Beginner', 'Intermediate', 'Expert']).optional().default('Intermediate'),
      })
    ),
  }),
});

