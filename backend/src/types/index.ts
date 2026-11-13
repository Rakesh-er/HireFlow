import { Request } from 'express';
import { UserRole, OrgRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  organizationId?: string;
  organizationRole?: OrgRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  organizationId?: string;
  organizationRole?: OrgRole;
}

