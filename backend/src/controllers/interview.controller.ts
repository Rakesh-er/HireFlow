import { Response, NextFunction } from 'express';
import { interviewService } from '../services/interview.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class InterviewController {
  async scheduleInterview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const interview = await interviewService.scheduleInterview(
        req.user!.organizationId!,
        req.body
      );
      return sendSuccess(res, interview, 'Interview scheduled successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getInterviews(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await interviewService.getInterviews(req.user!.organizationId!, {
        status: req.query.status as any,
        interviewerId: req.query.interviewerId as string,
        applicationId: req.query.applicationId as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      });
      return sendSuccess(res, result.interviews, 'Interviews retrieved', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async getInterviewById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const interview = await interviewService.getInterviewById(
        req.user!.organizationId!,
        req.params.id
      );
      return sendSuccess(res, interview, 'Interview retrieved');
    } catch (err) {
      next(err);
    }
  }

  async updateInterview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await interviewService.updateInterview(
        req.user!.organizationId!,
        req.params.id,
        req.body
      );
      return sendSuccess(res, updated, 'Interview updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteInterview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await interviewService.deleteInterview(req.user!.organizationId!, req.params.id);
      return sendSuccess(res, null, 'Interview cancelled successfully');
    } catch (err) {
      next(err);
    }
  }

  async submitFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const feedback = await interviewService.submitFeedback(
        req.user!.organizationId!,
        req.params.id,
        req.user!.id,
        req.body
      );
      return sendSuccess(res, feedback, 'Interview feedback submitted successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const feedback = await interviewService.getFeedback(
        req.user!.organizationId!,
        req.params.id
      );
      return sendSuccess(res, feedback, 'Feedback retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const interviewController = new InterviewController();

