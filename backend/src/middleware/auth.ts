import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AuthUser } from '../types/index.js';
import { verifyAccessToken } from '../utils/token.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { UserRole, OrgRole } from '@prisma/client';

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new UnauthorizedError('Authentication token is missing.'));
  }

  try {
    const decoded: any = verifyAccessToken(token);
    const user: AuthUser = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
      organizationId: decoded.organizationId,
      organizationRole: decoded.organizationRole,
    };

    req.user = user;
    req.organizationId = user.organizationId;
    req.organizationRole = user.organizationRole;

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Access token has expired. Please refresh.'));
    }
    return next(new UnauthorizedError('Invalid access token.'));
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    // Super Admin has universal override
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError(`Requires one of roles: ${allowedRoles.join(', ')}`));
    }

    next();
  };
}

export function requireOrgMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError());
  }

  if (req.user.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  if (!req.user.organizationId) {
    return next(new ForbiddenError('You are not associated with any active organization.'));
  }

  next();
}

export function requireOrgRole(...allowedOrgRoles: OrgRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    if (!req.user.organizationId || !req.user.organizationRole) {
      return next(new ForbiddenError('Organization access required.'));
    }

    if (!allowedOrgRoles.includes(req.user.organizationRole)) {
      return next(new ForbiddenError(`Requires organization role: ${allowedOrgRoles.join(', ')}`));
    }

    next();
  };
}

