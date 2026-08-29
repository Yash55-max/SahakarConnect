import prisma from '../lib/prisma';
import { PaymentStatus, BookingStatus } from '@prisma/client';

export interface PaymentIntentRequest {
  bookingId: string;
  amount: number;
  paymentMethod?: string;
}

export interface PaymentLedgerResult {
  ledgerId: string;
  bookingId: string;
  totalAmount: number;
  providerShare: number;
  cooperativeFundShare: number;
  platformShare: number;
  commissionRatePercent: number;
  transactionRef: string;
  status: PaymentStatus;
}

export interface IPaymentService {
  processPayment(params: PaymentIntentRequest): Promise<PaymentLedgerResult>;
}

export class MockCooperativePaymentService implements IPaymentService {
  /**
   * Calculates the exact transparent cooperative revenue split:
   * 1. Platform maintenance & cloud fee: 2% flat
   * 2. Cooperative Society Welfare Fund: (Cooperative Commission % - 2%)
   * 3. Direct Provider Take-Home: (100% - Cooperative Commission %)
   */
  async processPayment(params: PaymentIntentRequest): Promise<PaymentLedgerResult> {
    const { bookingId, amount, paymentMethod = 'UPI_MOCK' } = params;

    // Fetch booking details including provider's cooperative
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: {
          include: {
            cooperative: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    const commissionRate = booking.provider.cooperative.commissionRatePercent || 10.0;
    const totalAmount = amount || booking.totalAmount;

    // Platform share: 2%
    const platformRate = 2.0;
    const platformShare = Math.round((totalAmount * (platformRate / 100)) * 100) / 100;

    // Cooperative welfare fund share: (commissionRate - platformRate)
    const coopFundRate = Math.max(0, commissionRate - platformRate);
    const cooperativeFundShare = Math.round((totalAmount * (coopFundRate / 100)) * 100) / 100;

    // Provider take-home share: remainder
    const providerShare = Math.round((totalAmount - platformShare - cooperativeFundShare) * 100) / 100;

    const transactionRef = `UPI-TXN-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Create or update PaymentLedgerEntry & update Cooperative Welfare Fund balance in transaction
    const [ledgerEntry] = await prisma.$transaction([
      prisma.paymentLedgerEntry.upsert({
        where: { bookingId },
        update: {
          totalAmount,
          providerShare,
          cooperativeFundShare,
          platformShare,
          status: PaymentStatus.SETTLED,
          paymentMethod,
          transactionRef,
        },
        create: {
          bookingId,
          totalAmount,
          providerShare,
          cooperativeFundShare,
          platformShare,
          status: PaymentStatus.SETTLED,
          paymentMethod,
          transactionRef,
        },
      }),
      // Credit the welfare fund balance of the Primary Service Cooperative Society
      prisma.cooperative.update({
        where: { id: booking.provider.cooperativeId },
        data: {
          welfareFundBalance: {
            increment: cooperativeFundShare,
          },
        },
      }),
    ]);

    return {
      ledgerId: ledgerEntry.id,
      bookingId: ledgerEntry.bookingId,
      totalAmount: ledgerEntry.totalAmount,
      providerShare: ledgerEntry.providerShare,
      cooperativeFundShare: ledgerEntry.cooperativeFundShare,
      platformShare: ledgerEntry.platformShare,
      commissionRatePercent: commissionRate,
      transactionRef: ledgerEntry.transactionRef,
      status: ledgerEntry.status,
    };
  }
}

export const paymentService = new MockCooperativePaymentService();
