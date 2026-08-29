import { Router } from 'express';
import {
  getCoopProviders,
  verifyProvider,
  getCoopLedger,
  getWelfareFund,
  createPoll,
  getCoopPolls,
  voteOnPoll,
} from '../controllers/coopController';
import { authenticate, optionalAuth, requireRole } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

// Public or member accessible poll list
router.get('/:id/polls', optionalAuth, getCoopPolls);
router.get('/:id/ledger', optionalAuth, getCoopLedger);
router.get('/:id/welfare-fund', optionalAuth, getWelfareFund);
router.get('/:id/providers', optionalAuth, getCoopProviders);

// Admin-gated actions
router.patch('/:id/providers/:providerId/verify', authenticate, requireRole([Role.COOP_ADMIN, Role.REGULATOR]), verifyProvider);
router.post('/:id/polls', authenticate, requireRole([Role.COOP_ADMIN]), createPoll);

// Provider vote action
router.post('/polls/:pollId/vote', authenticate, voteOnPoll);

export default router;
