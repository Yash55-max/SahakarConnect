import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/lib/prisma';
import { signToken } from '../src/middleware/auth';
import { UserRole, BookingStatus, PaymentStatus } from '@prisma/client';

describe('Booking Lifecycle & PIN Escrow Settlement Suite', () => {
  let consumerToken: string;
  let providerToken: string;
  let providerId: string;
  let consumerUserId: string;
  let delhiCoopId: string;
  let createdBookingId: string;
  let validOtp: string;

  beforeAll(async () => {
    // 1. Fetch Delhi cooperative
    const delhiCoop = await prisma.cooperative.findFirst({
      where: { district: 'South Delhi' },
    });
    delhiCoopId = delhiCoop!.id;

    // 2. Fetch Consumer (Vikram Malhotra)
    const consumer = await prisma.user.findFirst({
      where: { email: 'vikram.consumer@gmail.com' },
    });
    consumerUserId = consumer!.id;
    consumerToken = signToken({
      userId: consumer!.id,
      role: UserRole.CONSUMER,
      cooperativeId: delhiCoopId,
      email: consumer!.email,
      name: consumer!.name,
    });

    // 3. Fetch Provider (Ramesh Kumar - Plumber)
    const providerUser = await prisma.user.findFirst({
      where: { email: 'ramesh.plumber@sahakar.org' },
      include: { providerProfile: true },
    });
    providerId = providerUser!.providerProfile!.id;
    providerToken = signToken({
      userId: providerUser!.id,
      role: UserRole.PROVIDER,
      cooperativeId: delhiCoopId,
      email: providerUser!.email,
      name: providerUser!.name,
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Consumer creates a new booking request via POST /api/bookings', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({
        grossAmount: 1200,
        serviceCategoryName: 'Plumbing Services',
        address: 'B-12, Hauz Khas Enclave, New Delhi',
        notes: 'Emergency pipeline water leak',
        consumerH3Index: '8861969527fffff',
      });

    expect(res.status).toBe(201);
    expect(res.body.booking).toBeDefined();
    expect(res.body.booking.status).toBe(BookingStatus.REQUESTED);
    expect(res.body.completionOtp).toBeDefined();
    expect(res.body.completionOtp.length).toBe(4);

    createdBookingId = res.body.booking.id;
    validOtp = res.body.completionOtp;
  });

  it('Provider accepts the open booking via PATCH /api/bookings/:id/accept', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${createdBookingId}/accept`)
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe(BookingStatus.ACCEPTED);
    expect(res.body.booking.providerId).toBe(providerId);
  });

  it('Provider updates status to IN_PROGRESS via PATCH /api/bookings/:id/status', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${createdBookingId}/status`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ status: BookingStatus.IN_PROGRESS });

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe(BookingStatus.IN_PROGRESS);
  });

  it('Provider submits INCORRECT PIN and receives 400 Bad Request', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${createdBookingId}/complete`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ completionOtp: '0000' }); // Wrong PIN

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid completion PIN');
  });

  it('Provider submits VALID 4-digit PIN, triggers atomic escrow settlement and ledger entry', async () => {
    // Record initial cooperative welfare fund balance
    const coopBefore = await prisma.cooperative.findUnique({
      where: { id: delhiCoopId },
    });
    const initialWelfareBalance = Number(coopBefore!.welfareBalance);

    const res = await request(app)
      .patch(`/api/bookings/${createdBookingId}/complete`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ completionOtp: validOtp });

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe(BookingStatus.COMPLETED);
    expect(res.body.ledgerEntry).toBeDefined();
    expect(res.body.ledgerEntry.status).toBe(PaymentStatus.SETTLED);

    // Verify tripartite split on ₹1,200 (88% worker, 8% welfare, 4% platform)
    expect(Number(res.body.ledgerEntry.totalGross)).toBe(1200.00);
    expect(Number(res.body.ledgerEntry.workerPayout)).toBe(1056.00);
    expect(Number(res.body.ledgerEntry.welfareFundShare)).toBe(96.00);
    expect(Number(res.body.ledgerEntry.platformShare)).toBe(48.00);

    // Verify cooperative welfare balance was incremented by exactly ₹96.00
    const coopAfter = await prisma.cooperative.findUnique({
      where: { id: delhiCoopId },
    });
    const expectedWelfare = Number((initialWelfareBalance + 96.00).toFixed(2));
    expect(Number(coopAfter!.welfareBalance)).toBe(expectedWelfare);
  });
});
