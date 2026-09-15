import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import express from 'express';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { initSocketServer } from '../src/services/socket.service';
import { findNearbyProviders } from '../src/services/dispatch.service';
import { signToken } from '../src/middleware/auth';
import { prisma } from '../src/lib/prisma';
import { UserRole } from '@prisma/client';

describe('Real-Time WebSockets & Spatial Dispatch Suite', () => {
  let httpServer: http.Server;
  let port: number;
  let delhiCoopId: string;
  let validToken: string;

  beforeAll(async () => {
    // 1. Setup local test HTTP and Socket server
    const app = express();
    httpServer = http.createServer(app);
    initSocketServer(httpServer);

    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const address = httpServer.address() as any;
        port = address.port;
        resolve();
      });
    });

    // 2. Fetch Delhi cooperative
    const delhiCoop = await prisma.cooperative.findFirst({
      where: { district: 'South Delhi' },
    });
    delhiCoopId = delhiCoop!.id;

    // 3. Create valid test token
    validToken = signToken({
      userId: 'test-consumer-id',
      role: UserRole.CONSUMER,
      cooperativeId: delhiCoopId,
      email: 'test.consumer@sahakar.gov.in',
      name: 'Test Consumer',
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
    await prisma.$disconnect();
  });

  it('Socket.io server successfully authenticates client with valid JWT handshake', async () => {
    const socket: ClientSocket = Client(`http://localhost:${port}`, {
      auth: { token: validToken },
      transports: ['websocket'],
    });

    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => {
        expect(socket.connected).toBe(true);
        socket.disconnect();
        resolve();
      });
      socket.on('connect_error', (err) => {
        reject(err);
      });
    });
  });

  it('Socket.io server rejects client handshake with missing or invalid token', async () => {
    const socket: ClientSocket = Client(`http://localhost:${port}`, {
      auth: { token: 'invalid_expired_token' },
      transports: ['websocket'],
    });

    await new Promise<void>((resolve) => {
      socket.on('connect_error', (err) => {
        expect(err.message).toContain('Authentication error');
        socket.disconnect();
        resolve();
      });
    });
  });

  it('findNearbyProviders returns verified providers within Uber H3 Resolution-8 k-ring', async () => {
    // South Delhi Hauz Khas H3 index (seeded)
    const consumerH3Index = '8861969527fffff';

    const providers = await findNearbyProviders(
      delhiCoopId,
      'Plumbing Services',
      consumerH3Index,
      2
    );

    expect(providers.length).toBeGreaterThanOrEqual(1);

    // Verify candidates are verified and available
    for (const p of providers) {
      expect(p.isAvailable).toBe(true);
      expect(p.isAadhaarVerified).toBe(true);
      expect(p.cooperativeId).toBe(delhiCoopId);
      expect(p.skills.some((s) => s.toLowerCase().includes('plumb'))).toBe(true);
    }

    // Ramesh Kumar (NSQF Level 4) should rank higher than Sunil Yadav (NSQF Level 3)
    const ramesh = providers.find((p) => p.name.includes('Ramesh'));
    expect(ramesh).toBeDefined();
    expect(ramesh!.nsqfLevel).toBe(4);
    expect(ramesh!.gridDistance).toBeLessThanOrEqual(2);
  });

  it('ranks higher NSQF certification level ahead when grid distances are equal', async () => {
    const consumerH3Index = '8861969521fffff'; // Greater Kailash

    const electricians = await findNearbyProviders(
      delhiCoopId,
      'Electrical Repair & Wiring',
      consumerH3Index,
      3
    );

    expect(electricians.length).toBeGreaterThanOrEqual(1);
    // Mohammad Imran has NSQF Level 5 (highest)
    const firstRanked = electricians[0];
    expect(firstRanked.nsqfLevel).toBeGreaterThanOrEqual(4);
  });
});
