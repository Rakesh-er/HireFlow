import { Response, NextFunction } from 'express';
import { applicationService } from '../services/application.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class ApplicationController {
  async submitApplication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const application = await applicationService.submitApplication(req.user!.id, req.body);
      return sendSuccess(res, application, 'Application submitted successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await applicationService.getApplications(req.user!.organizationId!, {
        jobId: req.query.jobId as string,
        status: req.query.status as any,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      });
      return sendSuccess(res, result.applications, 'Applications retrieved', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async getKanbanBoard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const board = await applicationService.getKanbanBoard(
        req.user!.organizationId!,
        req.query.jobId as string
      );
      return sendSuccess(res, board, 'Kanban board retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getApplicationById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const application = await applicationService.getApplicationById(
        req.user!.organizationId!,
        req.params.id
      );
      return sendSuccess(res, application, 'Application details retrieved');
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, notes } = req.body;
      const updated = await applicationService.updateStatus(
        req.user!.organizationId!,
        req.params.id,
        req.user!.id,
        status,
        notes
      );
      return sendSuccess(res, updated, 'Application status updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async addNotes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const history = await applicationService.addNotes(
        req.user!.organizationId!,
        req.params.id,
        req.user!.id,
        req.body.notes
      );
      return sendSuccess(res, history, 'Notes added successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async withdrawApplication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await applicationService.withdrawApplication(req.user!.id, req.params.id);
      return sendSuccess(res, updated, 'Application withdrawn successfully');
    } catch (err) {
      next(err);
    }
  }

  async getCandidateApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const applications = await applicationService.getCandidateApplications(req.user!.id);
      return sendSuccess(res, applications, 'My applications retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const applicationController = new ApplicationController();

