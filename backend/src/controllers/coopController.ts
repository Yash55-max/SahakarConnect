import { Response } from 'express';
import { z } from 'zod';
import { VerificationStatus, PollStatus, PaymentStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middlewares/auth';
import { notifyPollUpdated } from '../lib/socket';

// 1. List Providers in Cooperative
export const getCoopProviders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const whereClause: any = { cooperativeId: id };
    if (status) {
      whereClause.verificationStatus = status as VerificationStatus;
    }

    const providers = await prisma.providerProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatarUrl: true, createdAt: true },
        },
        listings: {
          include: { category: true },
        },
        _count: {
          select: { jobs: true, ratingsReceived: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(providers);
  } catch (error) {
    console.error('getCoopProviders error:', error);
    res.status(500).json({ error: 'Failed to fetch cooperative providers' });
  }
};

// 2. Verify / Approve / Reject Provider
const verifySchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED', 'PENDING']),
  notes: z.string().optional(),
});

export const verifyProvider = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, providerId } = req.params;
    const { status } = verifySchema.parse(req.body);

    const isVerified = status === 'VERIFIED';

    const provider = await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        verificationStatus: status as VerificationStatus,
        verified: isVerified,
      },
      include: {
        user: true,
        cooperative: true,
      },
    });

    // If verified, increment cooperative member count
    if (isVerified) {
      await prisma.cooperative.update({
        where: { id },
        data: {
          totalMembers: { increment: 1 },
        },
      });
    }

    res.json({
      message: `Provider status updated to ${status}`,
      provider,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('verifyProvider error:', error);
    res.status(500).json({ error: 'Failed to update provider status' });
  }
};

// 3. Get Full Cooperative Revenue Ledger
export const getCoopLedger = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const cooperative = await prisma.cooperative.findUnique({
      where: { id },
    });

    if (!cooperative) {
      res.status(404).json({ error: 'Cooperative society not found' });
      return;
    }

    const ledgerEntries = await prisma.paymentLedgerEntry.findMany({
      where: {
        booking: {
          provider: {
            cooperativeId: id,
          },
        },
      },
      include: {
        booking: {
          include: {
            provider: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
            consumer: {
              select: { name: true, email: true },
            },
            listing: {
              include: { category: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalGross = ledgerEntries.reduce((sum, e) => sum + e.totalAmount, 0);
    const totalProviderShare = ledgerEntries.reduce((sum, e) => sum + e.providerShare, 0);
    const totalWelfareFundShare = ledgerEntries.reduce((sum, e) => sum + e.cooperativeFundShare, 0);
    const totalPlatformShare = ledgerEntries.reduce((sum, e) => sum + e.platformShare, 0);

    res.json({
      cooperative,
      summary: {
        totalGross,
        totalProviderShare,
        totalWelfareFundShare,
        totalPlatformShare,
        providerPercentage: 100 - cooperative.commissionRatePercent,
        welfareFundPercentage: cooperative.commissionRatePercent - 2.0,
        platformPercentage: 2.0,
        totalTransactions: ledgerEntries.length,
      },
      ledgerEntries,
    });
  } catch (error) {
    console.error('getCoopLedger error:', error);
    res.status(500).json({ error: 'Failed to fetch cooperative ledger' });
  }
};

// 4. Get Welfare Fund Details & Disbursements
export const getWelfareFund = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const cooperative = await prisma.cooperative.findUnique({
      where: { id },
      include: {
        welfareDisbursements: {
          orderBy: { disbursedAt: 'desc' },
        },
      },
    });

    if (!cooperative) {
      res.status(404).json({ error: 'Cooperative not found' });
      return;
    }

    const totalDisbursed = cooperative.welfareDisbursements.reduce(
      (sum, d) => sum + d.amount,
      0
    );

    res.json({
      cooperativeId: cooperative.id,
      name: cooperative.name,
      welfareFundBalance: cooperative.welfareFundBalance,
      totalDisbursed,
      disbursements: cooperative.welfareDisbursements,
    });
  } catch (error) {
    console.error('getWelfareFund error:', error);
    res.status(500).json({ error: 'Failed to fetch welfare fund details' });
  }
};

// 5. Create Governance Poll
const createPollSchema = z.object({
  question: z.string().min(10, 'Poll question must be at least 10 characters'),
  description: z.string().optional(),
  category: z.string().default('COMMISSION_RATE'),
  options: z.array(
    z.object({
      id: z.string(),
      text: z.string().min(1, 'Option text is required'),
    })
  ).min(2, 'At least 2 poll options required'),
  expiresInDays: z.number().default(7),
});

export const createPoll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { question, description, category, options, expiresInDays } = createPollSchema.parse(
      req.body
    );

    const formattedOptions = options.map((opt) => ({
      ...opt,
      voteCount: 0,
    }));

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const poll = await prisma.governancePoll.create({
      data: {
        cooperativeId: id,
        question,
        description,
        category,
        options: formattedOptions,
        expiresAt,
        status: PollStatus.OPEN,
      },
    });

    notifyPollUpdated(id, poll);

    res.status(201).json({
      message: 'Governance poll created for cooperative members',
      poll,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('createPoll error:', error);
    res.status(500).json({ error: 'Failed to create governance poll' });
  }
};

// 6. List Governance Polls
export const getCoopPolls = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const polls = await prisma.governancePoll.findMany({
      where: { cooperativeId: id },
      include: {
        votes: {
          include: {
            provider: {
              include: { user: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute live vote counts
    const enrichedPolls = polls.map((poll) => {
      const options = poll.options as Array<{ id: string; text: string; voteCount?: number }>;
      const totalVotes = poll.votes.length;

      const tallyMap: Record<string, number> = {};
      poll.votes.forEach((v) => {
        tallyMap[v.choice] = (tallyMap[v.choice] || 0) + 1;
      });

      const optionsWithLiveTally = options.map((opt) => ({
        ...opt,
        voteCount: tallyMap[opt.id] || 0,
        percentage: totalVotes > 0 ? Math.round(((tallyMap[opt.id] || 0) / totalVotes) * 100) : 0,
      }));

      return {
        ...poll,
        options: optionsWithLiveTally,
        totalVotes,
      };
    });

    res.json(enrichedPolls);
  } catch (error) {
    console.error('getCoopPolls error:', error);
    res.status(500).json({ error: 'Failed to fetch governance polls' });
  }
};

// 7. Vote on a Governance Poll (by Provider/Member)
const voteSchema = z.object({
  choice: z.string().min(1, 'Choice is required'),
});

export const voteOnPoll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { pollId } = req.params;
    const { choice } = voteSchema.parse(req.body);

    // Find provider profile
    let providerId = req.user.providerProfileId;
    if (!providerId) {
      const profile = await prisma.providerProfile.findUnique({
        where: { userId: req.user.userId },
      });
      if (profile) providerId = profile.id;
    }

    if (!providerId) {
      res.status(403).json({ error: 'Only registered cooperative provider members can vote' });
      return;
    }

    const poll = await prisma.governancePoll.findUnique({
      where: { id: pollId },
      include: { cooperative: true },
    });

    if (!poll) {
      res.status(404).json({ error: 'Poll not found' });
      return;
    }

    if (poll.status !== PollStatus.OPEN) {
      res.status(400).json({ error: 'This governance poll is closed' });
      return;
    }

    // Upsert vote
    const vote = await prisma.pollVote.upsert({
      where: {
        pollId_providerId: {
          pollId,
          providerId,
        },
      },
      update: { choice },
      create: {
        pollId,
        providerId,
        choice,
      },
    });

    // Notify real-time update
    notifyPollUpdated(poll.cooperativeId, { pollId, choice, providerId });

    res.json({
      message: 'Vote recorded on democratic cooperative ledger',
      vote,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('voteOnPoll error:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
};
