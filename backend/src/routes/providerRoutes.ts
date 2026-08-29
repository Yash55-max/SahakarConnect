import { Router } from 'express';
import {
  getMyProfile,
  toggleAvailability,
  getMyJobs,
  acceptJob,
  rejectJob,
  startJob,
  completeJob,
  getMyEarnings,
} from '../controllers/providerController';
import { authenticate, requireRole } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

// Provider-only endpoints (and COOP_ADMIN for simulation)
router.use(authenticate);

router.get('/me', getMyProfile);
router.patch('/me/availability', toggleAvailability);
router.get('/me/jobs', getMyJobs);
router.patch('/jobs/:id/accept', acceptJob);
router.patch('/jobs/:id/reject', rejectJob);
router.patch('/jobs/:id/start', startJob);
router.patch('/jobs/:id/complete', completeJob);
router.get('/me/earnings', getMyEarnings);

export default router;
