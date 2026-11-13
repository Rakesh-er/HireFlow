import { Router } from 'express';
import { applicationController } from '../controllers/application.controller.js';
import { authenticate, requireRole, requireOrgMember } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import {
  submitApplicationSchema,
  updateApplicationStatusSchema,
  addApplicationNotesSchema,
} from '../validators/application.validator.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Candidate applies
router.post('/', requireRole(UserRole.CANDIDATE), validate(submitApplicationSchema), applicationController.submitApplication);
router.post('/:id/withdraw', requireRole(UserRole.CANDIDATE), applicationController.withdrawApplication);

// Recruiter / Org access
router.get('/', requireRole(UserRole.RECRUITER, UserRole.HIRING_MANAGER), requireOrgMember, applicationController.getApplications);
router.get('/kanban', requireRole(UserRole.RECRUITER, UserRole.HIRING_MANAGER), requireOrgMember, applicationController.getKanbanBoard);
router.get('/:id', requireRole(UserRole.RECRUITER, UserRole.HIRING_MANAGER), requireOrgMember, applicationController.getApplicationById);
router.patch('/:id/status', requireRole(UserRole.RECRUITER, UserRole.HIRING_MANAGER), requireOrgMember, validate(updateApplicationStatusSchema), applicationController.updateStatus);
router.post('/:id/notes', requireRole(UserRole.RECRUITER, UserRole.HIRING_MANAGER), requireOrgMember, validate(addApplicationNotesSchema), applicationController.addNotes);

export default router;

