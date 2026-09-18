import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/lib/prisma';
import { signToken } from '../src/middleware/auth';
import { UserRole, BookingStatus } from '@prisma/client';
import { credentials } from '../src/config/credentials';

describe('System Boundaries, Idempotency & Interface Contracts Suite', () => {
  let consumerToken: string;
  let providerToken: string;
  let delhiCoopId: string;
  let createdBookingId: string;
  let validOtp: string;

  beforeAll(async () => {
    const testCoop = await prisma.cooperative.create({
      data: {
        name: 'Contracts Verification PSCS',
        registrationNo: `TEST-CONTRACTS-${Date.now()}`,
        state: 'Delhi',
        district: 'North Delhi',
        welfareBalance: 10000,
        statutoryReserveBalance: 20000,
      },
    });
    delhiCoopId = testCoop.id;

    const consumer = await prisma.user.findFirst({
      where: { email: credentials.consumer.email },
    });
    consumerToken = signToken({
      userId: consumer!.id,
      role: UserRole.CONSUMER,
      cooperativeId: delhiCoopId,
      email: consumer!.email,
      name: consumer!.name,
    });

    const providerUser = await prisma.user.findFirst({
      where: { email: credentials.provider.email },
      include: { providerProfile: true },
    });
    providerToken = signToken({
      userId: providerUser!.id,
      role: UserRole.PROVIDER,
      cooperativeId: delhiCoopId,
      email: providerUser!.email,
      name: providerUser!.name,
    });
  });

  afterAll(async () => {
    await prisma.paymentLedgerEntry.deleteMany({ where: { booking: { cooperativeId: delhiCoopId } } });
    await prisma.booking.deleteMany({ where: { cooperativeId: delhiCoopId } });
    await prisma.cooperative.deleteMany({ where: { id: delhiCoopId } });
    await prisma.$disconnect();
  });

  // Health & Catalog Public Contracts
  it('GET /api/health returns standardized health payload', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.db).toBe('connected');
    expect(typeof res.body.uptime).toBe('number');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/categories returns array of registered service categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('iconName');
  });

  // Boundary Input Validation (Zod)
  it('POST /api/bookings rejects negative grossAmount with 400 Validation failed', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({
        grossAmount: -500,
        serviceCategoryName: 'Plumbing',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details).toBeDefined();
  });

  it('PATCH /api/bookings/:id/status rejects invalid enum status with 400', async () => {
    const res = await request(app)
      .patch('/api/bookings/non-existent-id/status')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ status: 'SUPER_COMPLETED_INVALID' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.message).toContain('Invalid status');
  });

  // Idempotency Key Contracts
  const idempotencyKey = 'test-idempotency-' + Date.now();
  const getBookingPayload = () => ({
    grossAmount: 1500,
    serviceCategoryName: 'Plumbing Services',
    address: 'C-8, Vasant Kunj, New Delhi',
    cooperativeId: delhiCoopId,
  });

  it('POST /api/bookings honours Idempotency-Key on first attempt', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${consumerToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send(getBookingPayload());

    expect(res.status).toBe(201);
    expect(res.body.booking).toBeDefined();
    createdBookingId = res.body.booking.id;
    validOtp = res.body.completionOtp;
  });

  it('POST /api/bookings safely replays existing response on identical retry with same Idempotency-Key', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${consumerToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send(getBookingPayload()); // Exact same payload

    expect(res.status).toBe(201);
    expect(res.body.booking.id).toBe(createdBookingId);
    expect(res.body.completionOtp).toBe(validOtp);
  });

  it('POST /api/bookings rejects Idempotency-Key reuse with different payload with 422 Conflict', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${consumerToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        ...getBookingPayload(),
        grossAmount: 3000, // Divergent payload
      });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('Idempotency conflict');
    expect(res.body.message).toContain('different payload');
  });

  // State Transition Conflict Contracts
  it('Provider accepts the booking for state machine progression', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${createdBookingId}/accept`)
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe(BookingStatus.ACCEPTED);
  });

  it('PATCH /api/bookings/:id/accept rejects already accepted booking with 409 Conflict', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${createdBookingId}/accept`)
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('State conflict');
    expect(res.body.message).toContain('ACCEPTED status');
  });

  it('Provider completes booking with valid PIN', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${createdBookingId}/complete`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ completionOtp: validOtp });

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe(BookingStatus.COMPLETED);
  });

  it('PATCH /api/bookings/:id/complete rejects already completed booking with 409 Conflict', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${createdBookingId}/complete`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ completionOtp: validOtp });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('State conflict');
    expect(res.body.message).toContain('already been completed');
  });

  afterAll(async () => {
    if (delhiCoopId) {
      await prisma.paymentLedgerEntry.deleteMany({
        where: { booking: { cooperativeId: delhiCoopId } },
      });
      await prisma.booking.deleteMany({
        where: { cooperativeId: delhiCoopId },
      });
      await prisma.cooperative.deleteMany({
        where: { id: delhiCoopId },
      });
    }
    await prisma.$disconnect();
  });
});
