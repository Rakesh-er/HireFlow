import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticate, requireRole, requireOrgMember } from '../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Recruiter analytics
router.get('/recruiter/overview', requireRole(UserRole.RECRUITER, UserRole.HIRING_MANAGER), requireOrgMember, analyticsController.getRecruiterOverview);
router.get('/recruiter/jobs', requireRole(UserRole.RECRUITER, UserRole.HIRING_MANAGER), requireOrgMember, analyticsController.getJobPerformance);

// Candidate analytics
router.get('/candidate/overview', requireRole(UserRole.CANDIDATE), analyticsController.getCandidateOverview);

// Super Admin analytics
router.get('/admin/overview', requireRole(UserRole.SUPER_ADMIN), analyticsController.getSuperAdminOverview);

export default router;

