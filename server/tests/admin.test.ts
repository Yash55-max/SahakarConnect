import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/lib/prisma';
import { signToken } from '../src/middleware/auth';
import { UserRole, MembershipClass } from '@prisma/client';
import { credentials } from '../src/config/credentials';

describe('Admin Hub & Cooperative Governance API Contract Suite', () => {
  let adminToken: string;
  let consumerToken: string;
  let providerToken: string;
  let testProviderId: string;
  let delhiCoopId: string;

  beforeAll(async () => {
    // 1. Fetch Delhi cooperative
    const delhiCoop = await prisma.cooperative.findFirst({
      where: { district: 'South Delhi' },
    });
    delhiCoopId = delhiCoop!.id;

    // 2. Admin token
    const adminUser = await prisma.user.findFirst({
      where: { email: credentials.admin.email },
    });
    adminToken = signToken({
      userId: adminUser!.id,
      role: UserRole.COOP_ADMIN,
      cooperativeId: delhiCoopId,
      email: adminUser!.email,
      name: adminUser!.name,
    });

    // 3. Consumer token
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

    // 4. Provider token
    const providerUser = await prisma.user.findFirst({
      where: { email: credentials.provider.email },
      include: { providerProfile: true },
    });
    // Ensure Ramesh is restored to NSQF Level 4
    await prisma.providerProfile.update({
      where: { id: providerUser!.providerProfile!.id },
      data: { nsqfLevel: 4 },
    });

    providerToken = signToken({
      userId: providerUser!.id,
      role: UserRole.PROVIDER,
      cooperativeId: delhiCoopId,
      email: providerUser!.email,
      name: providerUser!.name,
    });

    // 5. Create an isolated ephemeral provider candidate for verification testing
    const ephemUser = await prisma.user.create({
      data: {
        name: 'Sanjay Apprentice Plumber',
        email: `sanjay.apprentice.${Date.now()}@sahakar.org`,
        phone: `98${Date.now().toString().slice(-8)}`,
        passwordHash: 'dummy_hash',
        role: UserRole.PROVIDER,
      },
    });
    const ephemProfile = await prisma.providerProfile.create({
      data: {
        userId: ephemUser.id,
        cooperativeId: delhiCoopId,
        membershipClass: MembershipClass.NOMINAL,
        shareCapitalAmount: 100,
        skills: ['Plumbing'],
        nsqfLevel: 2,
      },
    });
    testProviderId = ephemProfile.id;
  });

  afterAll(async () => {
    // Clean up ephemeral provider
    await prisma.providerProfile.deleteMany({ where: { id: testProviderId } });
    await prisma.user.deleteMany({ where: { email: { contains: 'sanjay.apprentice' } } });
    await prisma.$disconnect();
  });

  // Boundary & RBAC Tests
  it('GET /api/admin/providers rejects unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/admin/providers');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('GET /api/admin/providers rejects CONSUMER role with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/providers')
      .set('Authorization', `Bearer ${consumerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('GET /api/admin/providers rejects PROVIDER role with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/providers')
      .set('Authorization', `Bearer ${providerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('GET /api/admin/providers permits COOP_ADMIN role and returns provider queue', async () => {
    const res = await request(app)
      .get('/api/admin/providers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('user');
    expect(res.body[0]).toHaveProperty('membershipClass');
  });

  // Verification & Status Updates
  it('PATCH /api/admin/providers/:id/verify updates provider credentials and NSQF rating', async () => {
    const res = await request(app)
      .patch(`/api/admin/providers/${testProviderId}/verify`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        isAadhaarVerified: true,
        isPoliceClearVerified: true,
        membershipClass: 'CLASS_A_VOTING',
        nsqfLevel: 5,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('credentials and verification status updated');
    expect(res.body.provider.nsqfLevel).toBe(5);
    expect(res.body.provider.isAadhaarVerified).toBe(true);
    expect(res.body.provider.membershipClass).toBe('CLASS_A_VOTING');
  });

  // Tripartite Ledger & Statutory Balances
  it('GET /api/admin/ledger returns aggregated GMV, worker payouts, and MSCS 2023 reserves', async () => {
    const res = await request(app)
      .get('/api/admin/ledger')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.cooperative).toBeDefined();
    expect(res.body.cooperative.id).toBe(delhiCoopId);
    expect(res.body.metrics).toBeDefined();
    expect(res.body.metrics.statutoryComplianceStatus).toBe('COMPLIANT_MSCS_2023');
    expect(typeof res.body.metrics.totalGrossGMV).toBe('number');
    expect(typeof res.body.metrics.totalWorkerPayouts).toBe('number');
    expect(Array.isArray(res.body.entries)).toBe(true);
  });

  // Governance Polls & Democratic Quorum
  let createdPollId: string;

  it('POST /api/admin/polls establishes a new democratic resolution under MSCS Act 2023', async () => {
    const res = await request(app)
      .post('/api/admin/polls')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Emergency Health & Tool Subsidy Scheme 2026',
        description: 'Authorize allocation of ₹50,000 from Society Welfare Reserve for artisan health insurance coverage.',
        quorumPercent: 40.0,
        expiresAtDays: 14,
      });

    expect(res.status).toBe(201);
    expect(res.body.poll).toBeDefined();
    expect(res.body.poll.title).toContain('Emergency Health & Tool Subsidy Scheme 2026');
    expect(res.body.poll.quorumPercent).toBe(40.0);
    expect(res.body.poll.status).toBe('OPEN');

    createdPollId = res.body.poll.id;
  });

  it('GET /api/admin/polls lists active governance resolutions with quorum progression', async () => {
    const res = await request(app)
      .get('/api/admin/polls')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const target = res.body.find((p: any) => p.id === createdPollId);
    expect(target).toBeDefined();
    expect(target.quorumThresholdPercent).toBe(40.0);
    expect(target.votesCast).toBeDefined();
    expect(typeof target.isQuorumMet).toBe('boolean');
  });

  it('POST /api/admin/polls/:id/vote records member democratic vote', async () => {
    const res = await request(app)
      .post(`/api/admin/polls/${createdPollId}/vote`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ choice: 'Yes, Approve Resolution' });

    expect(res.status).toBe(201);
    expect(res.body.message).toContain('democratic governance rules');
    expect(res.body.vote.choice).toBe('Yes, Approve Resolution');
  });

  it('POST /api/admin/polls/:id/vote rejects duplicate vote with 409 Conflict', async () => {
    const res = await request(app)
      .post(`/api/admin/polls/${createdPollId}/vote`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ choice: 'Yes, Approve Resolution' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Conflict');
    expect(res.body.message).toContain('already cast your vote');
  });
});
