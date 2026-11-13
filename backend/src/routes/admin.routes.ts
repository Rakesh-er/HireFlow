import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRole(UserRole.SUPER_ADMIN));

router.get('/dashboard', adminController.getDashboard);
router.get('/organizations', adminController.getOrganizations);
router.patch('/organizations/:id/status', adminController.updateOrganizationStatus);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.get('/jobs', adminController.getAllJobs);
router.get('/activity-logs', adminController.getActivityLogs);
router.get('/system-health', adminController.getSystemHealth);

export default router;

