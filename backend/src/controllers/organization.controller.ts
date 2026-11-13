import { Response, NextFunction } from 'express';
import { organizationService } from '../services/organization.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class OrganizationController {
  async createOrganization(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const org = await organizationService.createOrganization(req.user!.id, req.body);
      return sendSuccess(res, org, 'Organization created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getCurrentOrganization(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const org = await organizationService.getCurrentOrganization(req.user!.organizationId!);
      return sendSuccess(res, org, 'Current organization retrieved');
    } catch (err) {
      next(err);
    }
  }

  async updateCurrentOrganization(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await organizationService.updateCurrentOrganization(req.user!.organizationId!, req.body);
      return sendSuccess(res, updated, 'Organization updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async getMembers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const members = await organizationService.getMembers(req.user!.organizationId!);
      return sendSuccess(res, members, 'Organization members retrieved');
    } catch (err) {
      next(err);
    }
  }

  async inviteMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.inviteMember(
        req.user!.organizationId!,
        req.user!.id,
        req.body
      );
      return sendSuccess(res, result, 'Invitation sent successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async acceptInvitation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const member = await organizationService.acceptInvitation(req.user!.id, req.body.token);
      return sendSuccess(res, member, 'Invitation accepted successfully');
    } catch (err) {
      next(err);
    }
  }

  async updateMemberRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await organizationService.updateMemberRole(
        req.user!.organizationId!,
        req.params.id,
        req.body.role
      );
      return sendSuccess(res, updated, 'Member role updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await organizationService.removeMember(
        req.user!.organizationId!,
        req.params.id,
        req.user!.id
      );
      return sendSuccess(res, null, 'Member removed successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const organizationController = new OrganizationController();

