import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/lib/prisma';
import { UserRole } from '@prisma/client';
import { credentials } from '../src/config/credentials';

describe('Regulator Analytics & Statutory Oversight Suite', () => {
  let regulatorToken: string;
  let consumerToken: string;
  let providerToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // 1. Regulator Login
    const regRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: credentials.regulator.email,
        password: credentials.defaultPassword,
      });
    regulatorToken = regRes.body.token;

    // 2. Consumer Login
    const conRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: credentials.consumer.email,
        password: credentials.defaultPassword,
      });
    consumerToken = conRes.body.token;

    // 3. Provider Login
    const provRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: credentials.provider.email,
        password: credentials.defaultPassword,
      });
    providerToken = provRes.body.token;

    // 4. Admin Login
    const admRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: credentials.admin.email,
        password: credentials.defaultPassword,
      });
    adminToken = admRes.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/regulator/analytics rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/regulator/analytics');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('GET /api/regulator/analytics rejects CONSUMER role with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/regulator/analytics')
      .set('Authorization', `Bearer ${consumerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('GET /api/regulator/analytics rejects PROVIDER role with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/regulator/analytics')
      .set('Authorization', `Bearer ${providerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('GET /api/regulator/analytics rejects COOP_ADMIN role with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/regulator/analytics')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('GET /api/regulator/analytics permits REGULATOR role and returns statutory analytics', async () => {
    const res = await request(app)
      .get('/api/regulator/analytics')
      .set('Authorization', `Bearer ${regulatorToken}`);

    expect(res.status).toBe(200);

    // 1. High-level KPIs
    const { kpis, stateRollups, cooperatives, recentAuditLedger, statutoryMandate } = res.body;
    expect(kpis).toBeDefined();
    expect(kpis.totalCooperatives).toBeGreaterThanOrEqual(2);
    expect(kpis.totalVerifiedProviders).toBeGreaterThanOrEqual(1);
    expect(kpis.grossTransactionValue).toBeGreaterThanOrEqual(0);
    expect(kpis.totalWorkerDisbursed).toBeGreaterThanOrEqual(0);
    expect(kpis.totalWelfarePoolCollected).toBeGreaterThanOrEqual(0);
    expect(kpis.totalStatutoryReserves).toBeGreaterThanOrEqual(0);
    expect(kpis.statutoryCompliancePercent).toBe(100.0);

    // 2. Pan-India State rollups
    expect(Array.isArray(stateRollups)).toBe(true);
    expect(stateRollups.length).toBeGreaterThanOrEqual(1);
    const delhiRollup = stateRollups.find((s: any) => s.state === 'Delhi');
    expect(delhiRollup).toBeDefined();
    expect(delhiRollup.districts).toContain('South Delhi');

    // 3. Cooperatives summary
    expect(Array.isArray(cooperatives)).toBe(true);
    expect(cooperatives.length).toBeGreaterThanOrEqual(2);
    for (const coop of cooperatives) {
      expect(coop.id).toBeDefined();
      expect(coop.name).toBeDefined();
      expect(coop.registrationNo).toBeDefined();
      expect(coop.complianceStatus).toBe('COMPLIANT_MSCS_2023');
    }

    // 4. Zero-leakage audit ledger
    expect(Array.isArray(recentAuditLedger)).toBe(true);
    for (const entry of recentAuditLedger) {
      expect(entry.statutoryInvariantSatisfied).toBe(true);
      const gross = Number(entry.grossAmount);
      const sum = Number(entry.workerPayout) + Number(entry.welfareShare) + Number(entry.platformShare);
      expect(Math.abs(gross - sum)).toBeLessThan(0.01);
    }

    // 5. Statutory Mandate details
    expect(statutoryMandate.act).toContain('MSCS');
    expect(statutoryMandate.regulatoryAuthority).toContain('Ministry of Cooperation');
  });
});
