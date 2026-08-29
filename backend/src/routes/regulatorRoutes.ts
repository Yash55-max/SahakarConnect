import { Router } from 'express';
import {
  getRegulatorOverview,
  getRegulatorCooperativeDetail,
} from '../controllers/regulatorController';
import { optionalAuth } from '../middlewares/auth';

const router = Router();

// Regulator endpoints
router.get('/overview', optionalAuth, getRegulatorOverview);
router.get('/cooperatives/:id', optionalAuth, getRegulatorCooperativeDetail);

export default router;
