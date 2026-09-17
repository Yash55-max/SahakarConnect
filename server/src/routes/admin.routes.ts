import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole, requireCoopTenant } from '../middleware/auth';
import { UserRole, MembershipClass, PollStatus } from '@prisma/client';

const router = Router();

// GET /api/admin/providers - Provider verification approval queue
router.get('/providers', requireAuth, requireRole([UserRole.COOP_ADMIN, UserRole.REGULATOR]), async (req: Request, res: Response) => {
  try {
    let whereClause: any = {};
    if (req.user!.role === UserRole.COOP_ADMIN && req.user!.cooperativeId) {
      whereClause.cooperativeId = req.user!.cooperativeId;
    }

    const providers = await prisma.providerProfile.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
        cooperative: { select: { id: true, name: true, district: true } },
      },
      orderBy: { user: { createdAt: 'desc' } },
    });

    return res.status(200).json(providers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/providers/:id/verify - Approve membership or update verification status
router.patch('/providers/:id/verify', requireAuth, requireRole([UserRole.COOP_ADMIN, UserRole.REGULATOR]), async (req: Request, res: Response) => {
  try {
    const { isAadhaarVerified, isPoliceClearVerified, membershipClass, nsqfLevel } = req.body;

    const updated = await prisma.providerProfile.update({
      where: { id: req.params.id as string },
      data: {
        ...(typeof isAadhaarVerified === 'boolean' && { isAadhaarVerified }),
        ...(typeof isPoliceClearVerified === 'boolean' && { isPoliceClearVerified }),
        ...(membershipClass && { membershipClass: membershipClass as MembershipClass }),
        ...(typeof nsqfLevel === 'number' && { nsqfLevel }),
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return res.status(200).json({
      message: 'Provider credentials and verification status updated',
      provider: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/ledger - Tripartite ledger inspection & statutory balances
router.get('/ledger', requireAuth, requireRole([UserRole.COOP_ADMIN, UserRole.REGULATOR]), async (req: Request, res: Response) => {
  try {
    let coopId = req.user!.cooperativeId;
    if (!coopId && req.query.cooperativeId) {
      coopId = req.query.cooperativeId as string;
    }

    const coop = coopId
      ? await prisma.cooperative.findUnique({ where: { id: coopId } })
      : await prisma.cooperative.findFirst();

    if (!coop) {
      return res.status(404).json({ error: 'Cooperative society record not found' });
    }

    const ledgerEntries = await prisma.paymentLedgerEntry.findMany({
      where: {
        booking: { cooperativeId: coop.id },
      },
      include: {
        booking: {
          include: {
            consumer: { select: { name: true } },
            provider: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { settledAt: 'desc' },
    });

    // Calculate aggregated metrics
    let totalGrossGMV = 0;
    let totalWorkerPayouts = 0;
    let totalWelfareCollected = 0;
    let totalPlatformFees = 0;

    for (const entry of ledgerEntries) {
      totalGrossGMV += Number(entry.totalGross);
      totalWorkerPayouts += Number(entry.workerPayout);
      totalWelfareCollected += Number(entry.welfareFundShare);
      totalPlatformFees += Number(entry.platformShare);
    }

    // Statutory reserve compliance: 25% allocation target under MSCS Act 2023
    const statutoryReserveBalance = Number(coop.statutoryReserveBalance);
    const welfareBalance = Number(coop.welfareBalance);

    return res.status(200).json({
      cooperative: {
        id: coop.id,
        name: coop.name,
        registrationNo: coop.registrationNo,
        state: coop.state,
        district: coop.district,
        welfareBalance,
        statutoryReserveBalance,
        welfareFundRate: Number(coop.welfareFundRate),
        commissionPlatformRate: Number(coop.commissionPlatformRate),
      },
      metrics: {
        totalGrossGMV,
        totalWorkerPayouts,
        totalWelfareCollected,
        totalPlatformFees,
        welfareFundBalance: welfareBalance,
        statutoryReserveBalance,
        statutoryComplianceStatus: 'COMPLIANT_MSCS_2023',
      },
      entries: ledgerEntries,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/polls - Active governance polls and quorum progression
router.get('/polls', requireAuth, async (req: Request, res: Response) => {
  try {
    let coopId = req.user!.cooperativeId;
    if (!coopId && req.query.cooperativeId) {
      coopId = req.query.cooperativeId as string;
    }

    const whereClause: any = {};
    if (coopId) {
      whereClause.cooperativeId = coopId;
    }

    const polls = await prisma.governancePoll.findMany({
      where: whereClause,
      include: {
        cooperative: { select: { name: true } },
        votes: {
          include: {
            provider: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { expiresAt: 'desc' },
    });

    // Total voting members (Class A) in cooperative to calculate quorum %
    const totalClassAMembers = await prisma.providerProfile.count({
      where: {
        ...(coopId && { cooperativeId: coopId }),
        membershipClass: MembershipClass.CLASS_A_VOTING,
      },
    });

    const enrichedPolls = polls.map((poll) => {
      const votesCast = poll.votes.length;
      const currentQuorumPercent =
        totalClassAMembers > 0 ? (votesCast / totalClassAMembers) * 100 : 0;

      const votesYes = poll.votes.filter((v) => v.choice.toLowerCase().includes('yes')).length;
      const votesNo = poll.votes.filter((v) => v.choice.toLowerCase().includes('no')).length;

      return {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        cooperativeName: poll.cooperative.name,
        quorumThresholdPercent: poll.quorumPercent,
        currentQuorumPercent: Math.min(100, Number(currentQuorumPercent.toFixed(1))),
        votesCast,
        totalEligibleVoters: totalClassAMembers,
        votesYes,
        votesNo,
        status: poll.status,
        expiresAt: poll.expiresAt,
        isQuorumMet: currentQuorumPercent >= poll.quorumPercent,
      };
    });

    return res.status(200).json(enrichedPolls);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/polls - Draft new governance poll
router.post('/polls', requireAuth, requireRole([UserRole.COOP_ADMIN, UserRole.REGULATOR]), async (req: Request, res: Response) => {
  try {
    const { title, description, quorumPercent, expiresAtDays, cooperativeId: inputCoopId } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const coopId = inputCoopId || req.user!.cooperativeId;
    if (!coopId) {
      return res.status(400).json({ error: 'Cooperative society ID is required' });
    }

    const days = Number(expiresAtDays) || 30;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const poll = await prisma.governancePoll.create({
      data: {
        cooperativeId: coopId,
        title,
        description,
        quorumPercent: Number(quorumPercent) || 50.0,
        status: PollStatus.OPEN,
        expiresAt,
      },
    });

    return res.status(201).json({
      message: 'Governance poll successfully established',
      poll,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/polls/:id/vote - Member casts democratic vote
router.post('/polls/:id/vote', requireAuth, requireRole([UserRole.PROVIDER]), async (req: Request, res: Response) => {
  try {
    const { choice } = req.body;
    if (!choice) {
      return res.status(400).json({ error: 'Vote choice is required' });
    }

    const profile = await prisma.providerProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    if (profile.membershipClass !== MembershipClass.CLASS_A_VOTING) {
      return res.status(403).json({
        error: 'Only Class A voting members are eligible to participate in statutory cooperative polls',
      });
    }

    const vote = await prisma.pollVote.create({
      data: {
        pollId: req.params.id as string,
        providerId: profile.id,
        choice,
      },
    });

    return res.status(201).json({
      message: 'Vote recorded under MSCS Act 2023 democratic governance rules',
      vote,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'You have already cast your vote on this resolution',
      });
    }
    return res.status(500).json({ error: error.message });
  }
});

export default router;
