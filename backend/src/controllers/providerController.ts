import { Response } from 'express';
import { BookingStatus, PaymentStatus, Role } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middlewares/auth';
import { notifyBookingStatusChange } from '../lib/socket';
import { paymentService } from '../services/paymentService';

// 1. Get Provider's Own Profile
export const getMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const profile = await prisma.providerProfile.findUnique({
      where: { userId: req.user.userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        cooperative: true,
        listings: {
          include: { category: true },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ error: 'Provider profile not found for this account' });
      return;
    }

    // Summary stats
    const totalJobs = await prisma.booking.count({
      where: { providerId: profile.id },
    });

    const completedJobs = await prisma.booking.count({
      where: { providerId: profile.id, status: BookingStatus.COMPLETED },
    });

    const ledgers = await prisma.paymentLedgerEntry.findMany({
      where: {
        booking: { providerId: profile.id },
        status: PaymentStatus.SETTLED,
      },
    });

    const totalEarnings = ledgers.reduce((sum, l) => sum + l.providerShare, 0);
    const totalWelfareContributed = ledgers.reduce((sum, l) => sum + l.cooperativeFundShare, 0);

    res.json({
      profile,
      stats: {
        totalJobs,
        completedJobs,
        totalEarnings,
        totalWelfareContributed,
        rating: profile.rating,
        ratingCount: profile.ratingCount,
      },
    });
  } catch (error) {
    console.error('getMyProfile error:', error);
    res.status(500).json({ error: 'Failed to fetch provider profile' });
  }
};

// 2. Toggle Availability
export const toggleAvailability = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { available } = req.body;

    const profile = await prisma.providerProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) {
      res.status(404).json({ error: 'Provider profile not found' });
      return;
    }

    const updated = await prisma.providerProfile.update({
      where: { id: profile.id },
      data: {
        available: typeof available === 'boolean' ? available : !profile.available,
      },
    });

    res.json({
      message: `Availability updated to ${updated.available ? 'Online' : 'Offline'}`,
      available: updated.available,
    });
  } catch (error) {
    console.error('toggleAvailability error:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
};

// 3. Get Provider's Jobs (Inbox + Active + Completed)
export const getMyJobs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const profile = await prisma.providerProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) {
      res.status(404).json({ error: 'Provider profile not found' });
      return;
    }

    const jobs = await prisma.booking.findMany({
      where: { providerId: profile.id },
      include: {
        listing: {
          include: { category: true },
        },
        consumer: {
          select: { id: true, name: true, phone: true, email: true, avatarUrl: true },
        },
        ledgerEntry: true,
        rating: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(jobs);
  } catch (error) {
    console.error('getMyJobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// 4. Accept Job
export const acceptJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { provider: true, consumer: true },
    });

    if (!booking) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.ACCEPTED },
      include: {
        listing: { include: { category: true } },
        consumer: { select: { id: true, name: true, phone: true, avatarUrl: true } },
        provider: { include: { user: true, cooperative: true } },
      },
    });

    notifyBookingStatusChange(id, updated);

    res.json({
      message: 'Job accepted successfully',
      booking: updated,
    });
  } catch (error) {
    console.error('acceptJob error:', error);
    res.status(500).json({ error: 'Failed to accept job' });
  }
};

// 5. Reject Job
export const rejectJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: {
        listing: { include: { category: true } },
        consumer: { select: { id: true, name: true, phone: true, avatarUrl: true } },
        provider: { include: { user: true, cooperative: true } },
      },
    });

    notifyBookingStatusChange(id, updated);

    res.json({
      message: 'Job rejected',
      booking: updated,
    });
  } catch (error) {
    console.error('rejectJob error:', error);
    res.status(500).json({ error: 'Failed to reject job' });
  }
};

// 6. Start Job (In Progress)
export const startJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.IN_PROGRESS },
      include: {
        listing: { include: { category: true } },
        consumer: { select: { id: true, name: true, phone: true, avatarUrl: true } },
        provider: { include: { user: true, cooperative: true } },
      },
    });

    notifyBookingStatusChange(id, updated);

    res.json({
      message: 'Job started and marked as in progress',
      booking: updated,
    });
  } catch (error) {
    console.error('startJob error:', error);
    res.status(500).json({ error: 'Failed to start job' });
  }
};

// 7. Complete Job (Calculates Revenue Ledger automatically)
export const completeJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { provider: { include: { cooperative: true } } },
    });

    if (!booking) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.COMPLETED,
        completedAt: new Date(),
      },
      include: {
        listing: { include: { category: true } },
        consumer: { select: { id: true, name: true, phone: true, avatarUrl: true } },
        provider: { include: { user: true, cooperative: true } },
      },
    });

    // Process payment & create ledger entry
    const ledger = await paymentService.processPayment({
      bookingId: id,
      amount: updated.totalAmount,
      paymentMethod: 'UPI_MOCK',
    });

    notifyBookingStatusChange(id, { ...updated, ledgerEntry: ledger });

    res.json({
      message: 'Job completed successfully. Revenue split credited to ledger.',
      booking: updated,
      ledger,
    });
  } catch (error) {
    console.error('completeJob error:', error);
    res.status(500).json({ error: 'Failed to complete job' });
  }
};

// 8. Get Provider Earnings & Ledger Entries
export const getMyEarnings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const profile = await prisma.providerProfile.findUnique({
      where: { userId: req.user.userId },
      include: { cooperative: true },
    });

    if (!profile) {
      res.status(404).json({ error: 'Provider profile not found' });
      return;
    }

    const ledgerEntries = await prisma.paymentLedgerEntry.findMany({
      where: {
        booking: { providerId: profile.id },
      },
      include: {
        booking: {
          include: {
            listing: true,
            consumer: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalGross = ledgerEntries.reduce((sum, e) => sum + e.totalAmount, 0);
    const totalProviderShare = ledgerEntries.reduce((sum, e) => sum + e.providerShare, 0);
    const totalWelfareShare = ledgerEntries.reduce((sum, e) => sum + e.cooperativeFundShare, 0);
    const totalPlatformShare = ledgerEntries.reduce((sum, e) => sum + e.platformShare, 0);

    res.json({
      cooperative: profile.cooperative,
      summary: {
        totalGross,
        totalProviderShare,
        totalWelfareShare,
        totalPlatformShare,
        takeHomePercent: 100 - profile.cooperative.commissionRatePercent,
        welfarePercent: profile.cooperative.commissionRatePercent - 2,
        platformPercent: 2.0,
      },
      ledgerEntries,
    });
  } catch (error) {
    console.error('getMyEarnings error:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
};
