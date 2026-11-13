import { z } from 'zod';
import { InterviewType, InterviewStatus, Recommendation } from '@prisma/client';

export const scheduleInterviewSchema = z.object({
  body: z.object({
    applicationId: z.string().min(1, 'Invalid application ID format'),
    interviewerId: z.string().min(1, 'Invalid interviewer user ID'),
    scheduledAt: z.string().datetime('Must be valid ISO datetime string'),
    duration: z.number().int().min(15).max(300).default(45),
    interviewType: z.nativeEnum(InterviewType).default(InterviewType.TECHNICAL),
    meetingLink: z.string().url('Invalid meeting link').optional().or(z.literal('')),
    location: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateInterviewSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid interview ID'),
  }),
  body: z.object({
    scheduledAt: z.string().datetime().optional(),
    duration: z.number().int().min(15).max(300).optional(),
    interviewType: z.nativeEnum(InterviewType).optional(),
    meetingLink: z.string().url().optional().or(z.literal('')),
    location: z.string().optional(),
    notes: z.string().optional(),
    status: z.nativeEnum(InterviewStatus).optional(),
  }),
});

export const submitFeedbackSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid interview ID'),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5),
    technicalSkills: z.number().int().min(1).max(5).optional(),
    communicationSkills: z.number().int().min(1).max(5).optional(),
    strengths: z.string().optional(),
    weaknesses: z.string().optional(),
    comments: z.string().min(5, 'Comments must be at least 5 characters'),
    recommendation: z.nativeEnum(Recommendation).default(Recommendation.NEUTRAL),
  }),
});

