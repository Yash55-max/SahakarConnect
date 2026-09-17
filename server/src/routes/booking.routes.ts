import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { UserRole, BookingStatus } from '@prisma/client';
import { settleEscrowTransaction } from '../services/ledger.service';
import { findNearbyProviders } from '../services/dispatch.service';
import { broadcastBookingStatus, emitToProviders, emitToUser } from '../services/socket.service';
import { getIdempotentRecord, setIdempotentRecord, hashPayload } from '../lib/idempotency';

const router = Router();

const createBookingSchema = z.object({
  grossAmount: z.number().positive('grossAmount must be greater than 0'),
  serviceCategoryId: z.string().optional(),
  serviceCategoryName: z.string().optional(),
  cooperativeId: z.string().optional(),
  consumerH3Index: z.string().optional(),
  scheduledDate: z.string().optional(),
  notes: z.string().optional(),
  address: z.string().optional(),
});

// POST /api/bookings - Consumer creates a booking request
router.post('/', requireAuth, requireRole([UserRole.CONSUMER]), async (req: Request, res: Response) => {
  try {
    const parsed = createBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid booking parameters',
        details: parsed.error.issues.map((i) => i.message),
      });
    }

    // Check Idempotency-Key to prevent duplicate dispatches
    const idempotencyKey = (req.headers['idempotency-key'] || req.headers['x-idempotency-key']) as string | undefined;
    if (idempotencyKey) {
      const currentHash = hashPayload(req.body);
      const existing = getIdempotentRecord(idempotencyKey);
      if (existing) {
        if (existing.requestHash !== currentHash) {
          return res.status(422).json({
            error: 'Idempotency conflict',
            message: 'Idempotency key reused with a different payload',
          });
        }
        return res.status(existing.responseStatus).json(existing.responseBody);
      }
    }

    const {
      serviceCategoryId,
      serviceCategoryName,
      grossAmount,
      cooperativeId: inputCoopId,
      consumerH3Index,
      scheduledDate,
      notes,
      address,
    } = parsed.data;

    // Default cooperative (South Delhi PSCS) if not provided
    let cooperativeId = inputCoopId;
    if (!cooperativeId) {
      const defaultCoop = await prisma.cooperative.findFirst({
        where: { district: 'South Delhi' },
      });
      cooperativeId = defaultCoop?.id;
    }

    if (!cooperativeId) {
      return res.status(400).json({ error: 'Cooperative society not found' });
    }

    // Generate secure 4-digit PIN for completion verification
    const completionOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // Create booking record
    const booking = await prisma.booking.create({
      data: {
        consumerId: req.user!.userId,
        cooperativeId,
        status: BookingStatus.REQUESTED,
        completionOtp,
        grossAmount: Number(grossAmount),
      },
      include: {
        cooperative: true,
        consumer: { select: { id: true, name: true, phone: true } },
      },
    });

    // 4. Find nearby candidate providers via Uber H3 spatial indexing
    const searchH3Index = consumerH3Index || '8861969527fffff'; // South Delhi Hauz Khas
    const categoryQuery = serviceCategoryId || serviceCategoryName || 'Plumbing';
    const nearbyProviders = await findNearbyProviders(cooperativeId, categoryQuery, searchH3Index, 2);

    // 5. Broadcast real-time dispatch alerts to candidate providers
    const dispatchAlertPayload = {
      bookingId: booking.id,
      grossAmount: booking.grossAmount,
      category: categoryQuery,
      address: address || 'South Delhi Residential Zone',
      scheduledDate: scheduledDate || new Date().toISOString(),
      notes: notes || 'Standard Cooperative Service Request',
      consumerName: booking.consumer.name,
      createdAt: booking.createdAt,
    };

    // Emit to all providers in cooperative
    emitToProviders(cooperativeId, 'booking:newRequest', dispatchAlertPayload);

    // Emit directly to ranked candidates
    for (const cand of nearbyProviders.slice(0, 3)) {
      emitToUser(cand.userId, 'booking:newRequest', {
        ...dispatchAlertPayload,
        gridDistance: cand.gridDistance,
      });
    }

    const responsePayload = {
      booking,
      completionOtp: booking.completionOtp,
      candidatesFound: nearbyProviders.length,
      topCandidates: nearbyProviders.slice(0, 3),
    };

    if (idempotencyKey) {
      setIdempotentRecord(idempotencyKey, hashPayload(req.body), 201, responsePayload);
    }

    return res.status(201).json(responsePayload);
  } catch (error: any) {
    console.error('[Booking Create Error]', error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/bookings/my - Consumer's bookings
router.get('/my', requireAuth, requireRole([UserRole.CONSUMER]), async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { consumerId: req.user!.userId },
      include: {
        cooperative: true,
        provider: {
          include: {
            user: { select: { name: true, phone: true, email: true } },
          },
        },
        paymentLedgerEntry: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(bookings);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/bookings/:id - Booking details
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id as string },
      include: {
        cooperative: true,
        consumer: { select: { id: true, name: true, phone: true } },
        provider: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
        paymentLedgerEntry: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.status(200).json(booking);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/bookings/:id/accept - Provider accepts booking
router.patch('/:id/accept', requireAuth, requireRole([UserRole.PROVIDER]), async (req: Request, res: Response) => {
  try {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: req.user!.userId },
      include: { user: { select: { id: true, name: true, phone: true } } },
    });

    if (!providerProfile) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id as string },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== BookingStatus.REQUESTED) {
      return res.status(409).json({
        error: 'State conflict',
        message: `Cannot accept booking in ${booking.status} status`,
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.ACCEPTED,
        providerId: providerProfile.id,
      },
      include: {
        cooperative: true,
        consumer: { select: { id: true, name: true, phone: true } },
        provider: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
      },
    });

    // Real-time broadcast: update consumer and cooperative
    broadcastBookingStatus(updatedBooking);

    return res.status(200).json({
      message: 'Booking successfully accepted',
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error('[Booking Accept Error]', error);
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/bookings/:id/status - Update booking status (e.g., IN_PROGRESS)
router.patch('/:id/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !Object.values(BookingStatus).includes(status)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: `Invalid status: ${status}. Must be one of: ${Object.values(BookingStatus).join(', ')}`,
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id as string },
      data: { status },
      include: {
        cooperative: true,
        consumer: { select: { id: true, name: true, phone: true } },
        provider: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
      },
    });

    broadcastBookingStatus(updatedBooking);

    return res.status(200).json({
      message: `Booking status updated to ${status}`,
      booking: updatedBooking,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/bookings/:id/complete - Complete job with 4-digit PIN and trigger escrow settlement
router.patch('/:id/complete', requireAuth, requireRole([UserRole.PROVIDER]), async (req: Request, res: Response) => {
  try {
    const { completionOtp, pin } = req.body;
    const otpToVerify = completionOtp || pin;

    if (!otpToVerify) {
      return res.status(400).json({
        error: 'Validation failed',
        message: '4-digit completion PIN is required',
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id as string },
    });

    if (!booking) {
      return res.status(404).json({
        error: 'Resource not found',
        message: 'Booking not found',
      });
    }

    if (booking.status === BookingStatus.COMPLETED) {
      return res.status(409).json({
        error: 'State conflict',
        message: `Booking ${req.params.id} has already been completed and settled`,
      });
    }

    // Execute atomic escrow settlement with zero rounding leakage
    const settlement = await settleEscrowTransaction(req.params.id as string, otpToVerify, prisma);

    const fullBooking = await prisma.booking.findUnique({
      where: { id: req.params.id as string },
      include: {
        cooperative: true,
        consumer: { select: { id: true, name: true, phone: true } },
        provider: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
        paymentLedgerEntry: true,
      },
    });

    broadcastBookingStatus(fullBooking);

    return res.status(200).json({
      message: 'Job completed and escrow settled successfully',
      booking: fullBooking,
      ledgerEntry: settlement.ledgerEntry,
      split: settlement.split,
    });
  } catch (error: any) {
    console.error('[Booking Complete Error]', error);
    if (error.message && error.message.includes('Invalid completion PIN')) {
      return res.status(400).json({
        error: 'Invalid completion PIN',
        message: error.message,
      });
    }
    return res.status(500).json({ error: error.message });
  }
});

export default router;
