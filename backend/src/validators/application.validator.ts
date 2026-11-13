import { z } from 'zod';
import { ApplicationStage } from '@prisma/client';

export const submitApplicationSchema = z.object({
  body: z.object({
    jobId: z.string().min(1, 'Invalid job ID format'),
    resumeUrl: z.string().min(1, 'Resume is required'),
    coverLetter: z.string().optional(),
    source: z.string().optional().default('CAREERS_PAGE'),
  }),
});

export const updateApplicationStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid application ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(ApplicationStage, {
      errorMap: () => ({ message: 'Invalid recruitment stage' }),
    }),
    notes: z.string().optional(),
  }),
});

export const addApplicationNotesSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid application ID format'),
  }),
  body: z.object({
    notes: z.string().min(1, 'Notes cannot be empty'),
  }),
});

