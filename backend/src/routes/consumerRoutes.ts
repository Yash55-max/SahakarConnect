import { Router } from 'express';
import {
  getServices,
  createBooking,
  getBookingById,
  getMyBookings,
  rateBooking,
  payBooking,
  fileGrievance,
} from '../controllers/consumerController';
import { authenticate, optionalAuth, requireRole } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

// Public / Optional auth service catalog
router.get('/services', optionalAuth, getServices);

// Consumer bookings
router.post('/bookings', authenticate, requireRole([Role.CONSUMER, Role.COOP_ADMIN, Role.PROVIDER]), createBooking);
router.get('/bookings/my', authenticate, getMyBookings);
router.get('/bookings/:id', authenticate, getBookingById);
router.post('/bookings/:id/rate', authenticate, rateBooking);
router.post('/bookings/:id/pay', authenticate, payBooking);
router.post('/grievances', authenticate, fileGrievance);

export default router;
