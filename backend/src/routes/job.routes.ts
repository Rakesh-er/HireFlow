import { Router } from 'express';
import { jobController } from '../controllers/job.controller.js';
import { applicationController } from '../controllers/application.controller.js';
import { authenticate, requireOrgMember, requireOrgRole, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { createJobSchema, updateJobSchema } from '../validators/job.validator.js';
import { UserRole, OrgRole } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRole(UserRole.RECRUITER, UserRole.HIRING_MANAGER));
router.use(requireOrgMember);

router.post('/', requireOrgRole(OrgRole.OWNER, OrgRole.ADMIN), validate(createJobSchema), jobController.createJob);
router.get('/', jobController.getOrgJobs);
router.get('/:id', jobController.getJobById);
router.patch('/:id', requireOrgRole(OrgRole.OWNER, OrgRole.ADMIN), validate(updateJobSchema), jobController.updateJob);
router.delete('/:id', requireOrgRole(OrgRole.OWNER, OrgRole.ADMIN), jobController.deleteJob);
router.patch('/:id/publish', requireOrgRole(OrgRole.OWNER, OrgRole.ADMIN), jobController.publishJob);
router.patch('/:id/close', requireOrgRole(OrgRole.OWNER, OrgRole.ADMIN), jobController.closeJob);
router.get('/:id/applications', applicationController.getApplications);

export default router;

