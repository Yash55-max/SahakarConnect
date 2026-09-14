import { PrismaClient, Prisma, BookingStatus, PaymentStatus } from '@prisma/client';
import { prisma as defaultPrisma } from '../lib/prisma';

export interface CoopRateConfig {
  commissionPlatformRate: number | Prisma.Decimal;
  welfareFundRate: number | Prisma.Decimal;
  [key: string]: any;
}

export interface BookingSplitResult {
  grossAmount: number;
  workerPayout: number;
  welfareFundShare: number;
  platformShare: number;
  rates: {
    welfareFundRate: number;
    commissionPlatformRate: number;
  };
}

/**
 * Calculates deterministic tripartite split with zero rounding leakage:
 * W(worker) + F(welfare) + P(platform) ≡ Gross Booking Amount
 * Any fractional delta is credited to the worker payout.
 */
export function calculateBookingSplit(
  grossAmount: number,
  coop: CoopRateConfig
): BookingSplitResult {
  if (grossAmount < 0) {
    throw new Error('Gross booking amount cannot be negative');
  }

  // Ensure gross is rounded to 2 decimal places
  const gross = Math.round(grossAmount * 100) / 100;

  const welfareRate =
    typeof coop.welfareFundRate === 'number'
      ? coop.welfareFundRate
      : Number(coop.welfareFundRate);

  const platformRate =
    typeof coop.commissionPlatformRate === 'number'
      ? coop.commissionPlatformRate
      : Number(coop.commissionPlatformRate);

  if (welfareRate < 0 || platformRate < 0 || welfareRate + platformRate > 1) {
    throw new Error('Invalid rate configuration for cooperative');
  }

  // Calculate welfare share rounded to 2 decimals
  const welfareFundShare = Math.round(gross * welfareRate * 100) / 100;

  // Calculate platform share rounded to 2 decimals
  const platformShare = Math.round(gross * platformRate * 100) / 100;

  // Zero-leakage: Credit remaining fractional delta to worker payout
  const workerPayout = Number((gross - welfareFundShare - platformShare).toFixed(2));

  // Mathematical assertion
  const sum = Number((workerPayout + welfareFundShare + platformShare).toFixed(2));
  if (sum !== gross) {
    throw new Error(
      `Zero-leakage invariant violated: sum (${sum}) !== gross (${gross})`
    );
  }

  return {
    grossAmount: gross,
    workerPayout,
    welfareFundShare,
    platformShare,
    rates: {
      welfareFundRate: welfareRate,
      commissionPlatformRate: platformRate,
    },
  };
}

/**
 * Settles an escrow transaction atomically:
 * 1. Verifies 4-digit PIN against Booking.completionOtp
 * 2. Marks Booking as COMPLETED
 * 3. Creates settled PaymentLedgerEntry
 * 4. Increments Cooperative welfare balance by the welfare share
 */
export async function settleEscrowTransaction(
  bookingId: string,
  completionPin: string,
  tx: PrismaClient | Prisma.TransactionClient = defaultPrisma
) {
  // If tx has $transaction method, execute inside an atomic transaction
  if ('$transaction' in tx && typeof tx.$transaction === 'function') {
    return (tx as PrismaClient).$transaction(async (prismaTx) => {
      return executeSettlement(bookingId, completionPin, prismaTx);
    });
  }

  return executeSettlement(bookingId, completionPin, tx as Prisma.TransactionClient);
}

async function executeSettlement(
  bookingId: string,
  completionPin: string,
  db: Prisma.TransactionClient
) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { cooperative: true, paymentLedgerEntry: true },
  });

  if (!booking) {
    throw new Error(`Booking not found: ${bookingId}`);
  }

  if (booking.status === BookingStatus.COMPLETED) {
    throw new Error(`Booking ${bookingId} is already completed`);
  }

  if (booking.completionOtp !== completionPin.trim()) {
    throw new Error(`Invalid completion PIN provided: ${completionPin}`);
  }

  // Calculate zero-leakage split
  const split = calculateBookingSplit(Number(booking.grossAmount), booking.cooperative);

  // 1. Mark booking completed
  const updatedBooking = await db.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.COMPLETED },
  });

  // 2. Create settled PaymentLedgerEntry
  const ledgerEntry = await db.paymentLedgerEntry.create({
    data: {
      bookingId: booking.id,
      totalGross: split.grossAmount,
      workerPayout: split.workerPayout,
      welfareFundShare: split.welfareFundShare,
      platformShare: split.platformShare,
      status: PaymentStatus.SETTLED,
      settledAt: new Date(),
    },
  });

  // 3. Increment Cooperative welfareBalance atomically
  await db.cooperative.update({
    where: { id: booking.cooperativeId },
    data: {
      welfareBalance: {
        increment: split.welfareFundShare,
      },
    },
  });

  return {
    booking: updatedBooking,
    ledgerEntry,
    split,
  };
}
