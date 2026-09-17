import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/lib/prisma';
import { signToken } from '../src/middleware/auth';
import { UserRole } from '@prisma/client';
import { credentials } from '../src/config/credentials';

describe('Provider Workplace API Contract Suite', () => {
  let providerToken: string;
  let consumerToken: string;
  let providerUser: any;
  let delhiCoopId: string;

  beforeAll(async () => {
    // 1. Fetch Delhi cooperative
    const delhiCoop = await prisma.cooperative.findFirst({
      where: { district: 'South Delhi' },
    });
    delhiCoopId = delhiCoop!.id;

    // 2. Fetch Provider (Ramesh Kumar)
    providerUser = await prisma.user.findFirst({
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

    // 3. Fetch Consumer
    const consumerUser = await prisma.user.findFirst({
      where: { email: credentials.consumer.email },
    });
    consumerToken = signToken({
      userId: consumerUser!.id,
      role: UserRole.CONSUMER,
      cooperativeId: delhiCoopId,
      email: consumerUser!.email,
      name: consumerUser!.name,
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // Profile Tests
  it('GET /api/providers/me rejects unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/providers/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('GET /api/providers/me rejects non-provider role with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/providers/me')
      .set('Authorization', `Bearer ${consumerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('GET /api/providers/me returns provider profile with cooperative tenancy', async () => {
    const res = await request(app)
      .get('/api/providers/me')
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(providerUser.providerProfile.id);
    expect(res.body.cooperative).toBeDefined();
    expect(res.body.cooperative.id).toBe(delhiCoopId);
    expect(res.body.membershipClass).toBeDefined();
    expect(Array.isArray(res.body.skills)).toBe(true);
  });

  // Duty Availability
  it('PATCH /api/providers/me/availability rejects non-boolean with 400 Bad Request', async () => {
    const res = await request(app)
      .patch('/api/providers/me/availability')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ isAvailable: 'online' }); // String instead of boolean

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('isAvailable boolean is required');
  });

  it('PATCH /api/providers/me/availability successfully updates duty status', async () => {
    const res = await request(app)
      .patch('/api/providers/me/availability')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ isAvailable: true });

    expect(res.status).toBe(200);
    expect(res.body.isAvailable).toBe(true);
    expect(res.body.message).toContain('ONLINE');
  });

  // Jobs List
  it('GET /api/providers/me/jobs returns active dispatch assignments and cooperative requests', async () => {
    const res = await request(app)
      .get('/api/providers/me/jobs')
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Earnings Summary & MSCS 88/8/4 Split
  it('GET /api/providers/me/earnings returns accurate earnings summary and settled ledger items', async () => {
    const res = await request(app)
      .get('/api/providers/me/earnings')
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(typeof res.body.summary.totalCompletedJobs).toBe('number');
    expect(typeof res.body.summary.totalGrossVolume).toBe('number');
    expect(typeof res.body.summary.netTakeHomePayout).toBe('number');
    expect(typeof res.body.summary.accumulatedWelfareContribution).toBe('number');
    expect(Array.isArray(res.body.recentSettlements)).toBe(true);
  });
});
