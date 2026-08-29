import { Response } from 'express';
import { VerificationStatus, BookingStatus, PaymentStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middlewares/auth';

// 1. National / Multi-Cooperative Overview
export const getRegulatorOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const cooperatives = await prisma.cooperative.findMany({
      include: {
        _count: {
          select: {
            providers: true,
            polls: true,
            welfareDisbursements: true,
          },
        },
        providers: {
          select: {
            verificationStatus: true,
            rating: true,
          },
        },
      },
    });

    const allLedger = await prisma.paymentLedgerEntry.findMany({
      where: { status: PaymentStatus.SETTLED },
      include: {
        booking: {
          include: {
            provider: {
              include: { cooperative: true },
            },
          },
        },
      },
    });

    const totalTransactionVolume = allLedger.reduce((sum, l) => sum + l.totalAmount, 0);
    const totalProviderEarnings = allLedger.reduce((sum, l) => sum + l.providerShare, 0);
    const totalWelfareFundAccumulated = cooperatives.reduce((sum, c) => sum + c.welfareFundBalance, 0);
    const totalPlatformFeeCollected = allLedger.reduce((sum, l) => sum + l.platformShare, 0);

    const totalProviders = await prisma.providerProfile.count();
    const verifiedProviders = await prisma.providerProfile.count({
      where: { verificationStatus: VerificationStatus.VERIFIED },
    });
    const pendingProviders = await prisma.providerProfile.count({
      where: { verificationStatus: VerificationStatus.PENDING },
    });

    const totalBookings = await prisma.booking.count();
    const completedBookings = await prisma.booking.count({
      where: { status: BookingStatus.COMPLETED },
    });

    // Per cooperative breakdown
    const coopSummaries = cooperatives.map((c) => {
      const coopLedgers = allLedger.filter((l) => l.booking.provider.cooperativeId === c.id);
      const coopVolume = coopLedgers.reduce((sum, l) => sum + l.totalAmount, 0);
      const verifiedCount = c.providers.filter((p) => p.verificationStatus === VerificationStatus.VERIFIED).length;
      const avgRating =
        c.providers.reduce((sum, p) => sum + p.rating, 0) / (c.providers.length || 1);

      return {
        id: c.id,
        name: c.name,
        registrationNumber: c.registrationNumber,
        district: c.district,
        state: c.state,
        commissionRatePercent: c.commissionRatePercent,
        welfareFundBalance: c.welfareFundBalance,
        totalMembers: c.totalMembers || c._count.providers,
        verifiedProviders: verifiedCount,
        pendingProviders: c._count.providers - verifiedCount,
        transactionVolume: coopVolume,
        averageRating: Math.round(avgRating * 10) / 10,
        activePolls: c._count.polls,
        welfareDisbursementsCount: c._count.welfareDisbursements,
      };
    });

    res.json({
      summary: {
        totalCooperatives: cooperatives.length,
        totalTransactionVolume,
        totalProviderEarnings,
        totalWelfareFundAccumulated,
        totalPlatformFeeCollected,
        totalProviders,
        verifiedProviders,
        pendingProviders,
        verificationRate: totalProviders > 0 ? Math.round((verifiedProviders / totalProviders) * 100) : 0,
        totalBookings,
        completedBookings,
        completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
      },
      cooperatives: coopSummaries,
    });
  } catch (error) {
    console.error('getRegulatorOverview error:', error);
    res.status(500).json({ error: 'Failed to fetch regulator overview' });
  }
};

// 2. Cooperative Drill-Down for Regulator
export const getRegulatorCooperativeDetail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const cooperative = await prisma.cooperative.findUnique({
      where: { id },
      include: {
        providers: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
            listings: true,
          },
        },
        welfareDisbursements: {
          orderBy: { disbursedAt: 'desc' },
        },
        polls: {
          include: { votes: true },
        },
      },
    });

    if (!cooperative) {
      res.status(404).json({ error: 'Cooperative not found' });
      return;
    }

    const ledgers = await prisma.paymentLedgerEntry.findMany({
      where: {
        booking: {
          provider: { cooperativeId: id },
        },
      },
      include: {
        booking: {
          include: {
            provider: { include: { user: true } },
            consumer: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      cooperative,
      ledgers,
    });
  } catch (error) {
    console.error('getRegulatorCooperativeDetail error:', error);
    res.status(500).json({ error: 'Failed to fetch cooperative details' });
  }
};
