import { Router } from 'express';
import { jobController } from '../controllers/job.controller.js';
import { validate } from '../middleware/validator.js';
import { getPublicJobsSchema } from '../validators/job.validator.js';

const router = Router();

router.get('/jobs', validate(getPublicJobsSchema), jobController.getPublicJobs);
router.get('/jobs/:slug', jobController.getPublicJobBySlug);

export default router;

