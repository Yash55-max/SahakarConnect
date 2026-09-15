import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { UserRole, BookingStatus, PaymentStatus } from '@prisma/client';

const router = Router();

// GET /api/providers/me - Provider profile details
router.get('/me', requireAuth, requireRole([UserRole.PROVIDER]), async (req: Request, res: Response) => {
  try {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId: req.user!.userId },
      include: {
        cooperative: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    return res.status(200).json(profile);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/providers/me/availability - Duty availability toggle
router.patch(
  '/me/availability',
  requireAuth,
  requireRole([UserRole.PROVIDER]),
  async (req: Request, res: Response) => {
    try {
      const { isAvailable } = req.body;
      if (typeof isAvailable !== 'boolean') {
        return res.status(400).json({ error: 'isAvailable boolean is required' });
      }

      const updated = await prisma.providerProfile.update({
        where: { userId: req.user!.userId },
        data: { isAvailable },
      });

      return res.status(200).json({
        message: `Duty availability updated to ${isAvailable ? 'ONLINE' : 'OFFLINE'}`,
        isAvailable: updated.isAvailable,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/providers/me/jobs - Current active and pending jobs
router.get(
  '/me/jobs',
  requireAuth,
  requireRole([UserRole.PROVIDER]),
  async (req: Request, res: Response) => {
    try {
      const profile = await prisma.providerProfile.findUnique({
        where: { userId: req.user!.userId },
      });

      if (!profile) {
        return res.status(404).json({ error: 'Provider profile not found' });
      }

      const jobs = await prisma.booking.findMany({
        where: {
          OR: [
            { providerId: profile.id },
            // Available open dispatch requests in this cooperative
            { cooperativeId: profile.cooperativeId, status: BookingStatus.REQUESTED, providerId: null },
          ],
        },
        include: {
          consumer: { select: { name: true, phone: true } },
          cooperative: { select: { name: true, welfareFundRate: true, commissionPlatformRate: true } },
          paymentLedgerEntry: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(jobs);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/providers/me/earnings - Earnings summary and completed job ledger
router.get(
  '/me/earnings',
  requireAuth,
  requireRole([UserRole.PROVIDER]),
  async (req: Request, res: Response) => {
    try {
      const profile = await prisma.providerProfile.findUnique({
        where: { userId: req.user!.userId },
      });

      if (!profile) {
        return res.status(404).json({ error: 'Provider profile not found' });
      }

      const completedBookings = await prisma.booking.findMany({
        where: {
          providerId: profile.id,
          status: BookingStatus.COMPLETED,
        },
        include: {
          paymentLedgerEntry: true,
          consumer: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      let totalGross = 0;
      let totalWorkerPayout = 0;
      let totalWelfareDeduction = 0;
      let totalPlatformFee = 0;

      const items = completedBookings.map((b) => {
        const gross = Number(b.paymentLedgerEntry?.totalGross || b.grossAmount);
        const payout = Number(b.paymentLedgerEntry?.workerPayout || 0);
        const welfare = Number(b.paymentLedgerEntry?.welfareFundShare || 0);
        const platform = Number(b.paymentLedgerEntry?.platformShare || 0);

        totalGross += gross;
        totalWorkerPayout += payout;
        totalWelfareDeduction += welfare;
        totalPlatformFee += platform;

        return {
          bookingId: b.id,
          date: b.paymentLedgerEntry?.settledAt || b.createdAt,
          consumerName: b.consumer.name,
          grossAmount: gross,
          workerPayout: payout,
          welfareFundShare: welfare,
          platformShare: platform,
          status: b.paymentLedgerEntry?.status || PaymentStatus.SETTLED,
        };
      });

      return res.status(200).json({
        summary: {
          totalCompletedJobs: completedBookings.length,
          totalGrossVolume: totalGross,
          netTakeHomePayout: totalWorkerPayout,
          accumulatedWelfareContribution: totalWelfareDeduction,
          patronageDividendEligibleBalance: totalGross * 0.05, // 5% patronage dividend eligibility estimation
        },
        recentSettlements: items,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
);

export default router;
