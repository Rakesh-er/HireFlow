import { Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AdminController {
  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const health = await adminService.getSystemHealth();
      return sendSuccess(res, { health }, 'Admin dashboard data retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getOrganizations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getOrganizations({
        search: req.query.search as string,
        status: req.query.status as any,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      });
      return sendSuccess(res, result.organizations, 'Organizations retrieved', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async updateOrganizationStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await adminService.updateOrganizationStatus(req.params.id, req.body.status);
      return sendSuccess(res, updated, 'Organization status updated');
    } catch (err) {
      next(err);
    }
  }

  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
      const result = await adminService.getUsers({
        search: req.query.search as string,
        role: req.query.role as any,
        isActive,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      });
      return sendSuccess(res, result.users, 'Users retrieved', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await adminService.updateUserStatus(req.params.id, req.body.isActive);
      return sendSuccess(res, updated, 'User status updated');
    } catch (err) {
      next(err);
    }
  }

  async getAllJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getAllJobs({
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      });
      return sendSuccess(res, result.jobs, 'All platform jobs retrieved', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async getActivityLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getActivityLogs({
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      });
      return sendSuccess(res, result.logs, 'Activity logs retrieved', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async getSystemHealth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const health = await adminService.getSystemHealth();
      return sendSuccess(res, health, 'System health retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();

