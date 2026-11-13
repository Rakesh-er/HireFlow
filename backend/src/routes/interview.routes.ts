import { Router } from 'express';
import { interviewController } from '../controllers/interview.controller.js';
import { authenticate, requireRole, requireOrgMember } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import {
  scheduleInterviewSchema,
  updateInterviewSchema,
  submitFeedbackSchema,
} from '../validators/interview.validator.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Organization members (Recruiter, Hiring Manager)
router.post('/', requireRole(UserRole.RECRUITER, UserRole.HIRING_MANAGER), requireOrgMember, validate(scheduleInterviewSchema), interviewController.scheduleInterview);
router.get('/', requireRole(UserRole.RECRUITER, UserRole.HIRING_MANAGER), requireOrgMember, interviewController.getInterviews);
router.get('/:id', requireRole(UserRole.RECRUITER, UserRole.HIRING_MANAGER), requireOrgMember, interviewController.getInterviewById);
router.patch('/:id', requireRole(UserRole.RECRUITER, UserRole.HIRING_MANAGER), requireOrgMember, validate(updateInterviewSchema), interviewController.updateInterview);
router.delete('/:id', requireRole(UserRole.RECRUITER, UserRole.HIRING_MANAGER), requireOrgMember, interviewController.deleteInterview);
router.post('/:id/feedback', requireRole(UserRole.RECRUITER, UserRole.HIRING_MANAGER), requireOrgMember, validate(submitFeedbackSchema), interviewController.submitFeedback);
router.get('/:id/feedback', requireRole(UserRole.RECRUITER, UserRole.HIRING_MANAGER), requireOrgMember, interviewController.getFeedback);

export default router;

