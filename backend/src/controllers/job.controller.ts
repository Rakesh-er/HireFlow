import { Request, Response, NextFunction } from 'express';
import { jobService } from '../services/job.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class JobController {
  async createJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const job = await jobService.createJob(
        req.user!.organizationId!,
        req.user!.id,
        req.body
      );
      return sendSuccess(res, job, 'Job opening created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getOrgJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await jobService.getOrgJobs(req.user!.organizationId!, {
        status: req.query.status as any,
        department: req.query.department as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      });
      return sendSuccess(res, result.jobs, 'Jobs retrieved successfully', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async getJobById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const job = await jobService.getJobById(req.user!.organizationId!, req.params.id);
      return sendSuccess(res, job, 'Job retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async updateJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await jobService.updateJob(req.user!.organizationId!, req.params.id, req.body);
      return sendSuccess(res, updated, 'Job opening updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await jobService.deleteJob(req.user!.organizationId!, req.params.id);
      return sendSuccess(res, null, 'Job opening deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  async publishJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await jobService.publishJob(req.user!.organizationId!, req.params.id);
      return sendSuccess(res, updated, 'Job opening published successfully');
    } catch (err) {
      next(err);
    }
  }

  async closeJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await jobService.closeJob(req.user!.organizationId!, req.params.id);
      return sendSuccess(res, updated, 'Job opening closed successfully');
    } catch (err) {
      next(err);
    }
  }

  async getPublicJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobService.getPublicJobs(req.query as any);
      return sendSuccess(res, result.jobs, 'Public jobs retrieved successfully', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async getPublicJobBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobService.getPublicJobBySlug(req.params.slug);
      return sendSuccess(res, job, 'Job details retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const jobController = new JobController();

