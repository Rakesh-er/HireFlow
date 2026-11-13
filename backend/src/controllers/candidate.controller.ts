import { Response, NextFunction } from 'express';
import { candidateService } from '../services/candidate.service.js';
import { storageService } from '../services/storage.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';
import { BadRequestError } from '../utils/errors.js';

export class CandidateController {
  async getCandidateDirectory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const skills = req.query.skills ? (req.query.skills as string).split(',') : undefined;
      const minExperience = req.query.minExperience ? parseInt(req.query.minExperience as string, 10) : undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const result = await candidateService.getCandidateDirectory({
        search: req.query.search as string,
        location: req.query.location as string,
        skills,
        minExperience,
        page,
        limit,
      });

      return sendSuccess(res, result.candidates, 'Candidates retrieved', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async getCandidateById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const candidate = await candidateService.getCandidateById(req.params.id);
      return sendSuccess(res, candidate, 'Candidate retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getCurrentProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const profile = await candidateService.getCurrentProfile(req.user!.id);
      return sendSuccess(res, profile, 'Profile retrieved');
    } catch (err) {
      next(err);
    }
  }

  async updateCurrentProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await candidateService.updateCurrentProfile(req.user!.id, req.body);
      return sendSuccess(res, updated, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async uploadResume(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('No resume file provided');
      }

      const fileUrl = await storageService.saveFile(req.file, 'resumes');
      const updated = await candidateService.updateResume(req.user!.id, fileUrl);

      return sendSuccess(res, { resumeUrl: fileUrl, profile: updated }, 'Resume uploaded successfully');
    } catch (err) {
      next(err);
    }
  }

  async updateSkills(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await candidateService.updateSkills(req.user!.id, req.body.skills);
      return sendSuccess(res, updated, 'Skills updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const candidateController = new CandidateController();

