import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/lib/prisma';
import { signToken, requireRole, requireCoopTenant, AuthenticatedUser } from '../src/middleware/auth';
import { UserRole } from '@prisma/client';
import express, { Request, Response } from 'express';

describe('Auth & Multi-Tenant Role Gateways', () => {
  let delhiAdminToken: string;
  let providerToken: string;
  let delhiCoopId: string;
  let puneCoopId: string;

  beforeAll(async () => {
    const delhiCoop = await prisma.cooperative.findFirst({ where: { district: 'South Delhi' } });
    const puneCoop = await prisma.cooperative.findFirst({ where: { district: 'Pune' } });
    delhiCoopId = delhiCoop!.id;
    puneCoopId = puneCoop!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('POST /api/auth/login successfully logs in Coop Admin and returns JWT with tenancy', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin.delhi@sahakar.gov.in',
        password: 'Password@123',
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe(UserRole.COOP_ADMIN);
    expect(res.body.user.cooperativeId).toBe(delhiCoopId);

    delhiAdminToken = res.body.token;
  });

  it('POST /api/auth/login logs in Provider and includes provider cooperativeId in token payload', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'ramesh.plumber@sahakar.org',
        password: 'Password@123',
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe(UserRole.PROVIDER);
    expect(res.body.user.cooperativeId).toBe(delhiCoopId);

    providerToken = res.body.token;
  });

  it('POST /api/auth/login rejects incorrect password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin.delhi@sahakar.gov.in',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('GET /api/auth/me returns authenticated user details', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${delhiAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('admin.delhi@sahakar.gov.in');
    expect(res.body.user.cooperativeId).toBe(delhiCoopId);
  });

  it('GET /api/auth/me rejects unauthorized request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('requireRole middleware blocks non-permitted roles with 403', () => {
    const testApp = express();
    testApp.use(express.json());

    // Mock user attachment
    testApp.use((req, _res, next) => {
      req.user = {
        userId: 'test-user',
        role: UserRole.CONSUMER,
        cooperativeId: null,
        email: 'consumer@test.com',
        name: 'Consumer',
      };
      next();
    });

    testApp.get('/admin-only', requireRole([UserRole.COOP_ADMIN]), (_req: Request, res: Response) => {
      res.json({ ok: true });
    });

    return request(testApp)
      .get('/admin-only')
      .expect(403)
      .expect((res) => {
        expect(res.body.error).toBe('Forbidden');
      });
  });

  it('requireCoopTenant isolates cooperative boundaries and blocks cross-tenant access', () => {
    const testApp = express();
    testApp.use(express.json());

    // Attach user belonging to Delhi
    testApp.use((req, _res, next) => {
      req.user = {
        userId: 'admin-1',
        role: UserRole.COOP_ADMIN,
        cooperativeId: delhiCoopId,
        email: 'admin@delhi.org',
        name: 'Delhi Admin',
      };
      next();
    });

    testApp.get('/coop/:cooperativeId/stats', requireCoopTenant, (_req: Request, res: Response) => {
      res.json({ accessible: true });
    });

    // 1. Same tenant access -> allowed (200)
    return request(testApp)
      .get(`/coop/${delhiCoopId}/stats`)
      .expect(200)
      .then(() => {
        // 2. Cross-tenant access to Pune -> blocked with 403
        return request(testApp)
          .get(`/coop/${puneCoopId}/stats`)
          .expect(403)
          .expect((res) => {
            expect(res.body.message).toContain('Cross-tenant access violation');
          });
      });
  });
});
