import { z } from 'zod';
import { OrgRole, OrgStatus } from '@prisma/client';

export const createOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Organization name must be at least 2 characters'),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
    description: z.string().optional(),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    industry: z.string().optional(),
    companySize: z.string().optional(),
    location: z.string().optional(),
  }),
});

export const updateOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    industry: z.string().optional(),
    companySize: z.string().optional(),
    location: z.string().optional(),
    logo: z.string().optional(),
  }),
});

export const inviteMemberSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    role: z.nativeEnum(OrgRole).default(OrgRole.MEMBER),
  }),
});

export const acceptInvitationSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Invitation token is required'),
    name: z.string().min(2).optional(),
    password: z.string().min(8).optional(),
  }),
});

export const updateMemberRoleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid member ID'),
  }),
  body: z.object({
    role: z.nativeEnum(OrgRole),
  }),
});

