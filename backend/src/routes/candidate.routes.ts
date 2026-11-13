import { Router } from 'express';
import { candidateController } from '../controllers/candidate.controller.js';
import { applicationController } from '../controllers/application.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';
import { validate } from '../middleware/validator.js';
import { updateCandidateProfileSchema, updateCandidateSkillsSchema } from '../validators/candidate.validator.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Candidate self profile & resume (registered before /:id to prevent route shadowing)
router.get('/profile/me', candidateController.getCurrentProfile);
router.patch('/profile', validate(updateCandidateProfileSchema), candidateController.updateCurrentProfile);
router.post('/resume', uploadResume.single('resume'), candidateController.uploadResume);
router.put('/skills', validate(updateCandidateSkillsSchema), candidateController.updateSkills);
router.get('/me/applications', applicationController.getCandidateApplications);

// Recruiter access to candidate directory
router.get('/', requireRole(UserRole.RECRUITER, UserRole.HIRING_MANAGER), candidateController.getCandidateDirectory);
router.get('/:id', requireRole(UserRole.RECRUITER, UserRole.HIRING_MANAGER), candidateController.getCandidateById);

export default router;

