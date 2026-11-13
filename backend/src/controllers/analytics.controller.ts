import { Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AnalyticsController {
  async getRecruiterOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getRecruiterOverview(req.user!.organizationId!);
      return sendSuccess(res, data, 'Recruiter analytics overview retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getJobPerformance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getJobPerformance(req.user!.organizationId!);
      return sendSuccess(res, data, 'Job performance metrics retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getCandidateOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getCandidateOverview(req.user!.id);
      return sendSuccess(res, data, 'Candidate analytics overview retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getSuperAdminOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getSuperAdminOverview();
      return sendSuccess(res, data, 'Super Admin analytics overview retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const analyticsController = new AnalyticsController();

