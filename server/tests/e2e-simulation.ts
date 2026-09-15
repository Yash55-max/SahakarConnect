import http from 'http';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { app, httpServer } from '../src/index';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function runE2ESimulation() {
  console.log('===============================================================');
  console.log('[E2E] Starting SahakarConnect Day 2 Full Lifecycle Simulation');
  console.log('===============================================================');

  // 1. Start ephemeral HTTP and Socket.io server
  let port = 5000;
  if (!httpServer.listening) {
    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const addr = httpServer.address() as any;
        port = addr.port;
        resolve();
      });
    });
  }
  console.log(`[E2E] Test server active on port ${port}`);

  const baseUrl = `http://localhost:${port}`;

  // 2. Consumer Login
  console.log('[E2E] Step 1: Logging in as Citizen Consumer (Vikram Malhotra)...');
  const consumerLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'vikram.consumer@gmail.com',
      password: 'Password@123',
    }),
  });
  if (!consumerLoginRes.ok) {
    throw new Error(`Consumer login failed: ${await consumerLoginRes.text()}`);
  }
  const consumerData = (await consumerLoginRes.json()) as any;
  const consumerToken = consumerData.token;
  console.log(`[E2E] ✓ Consumer authenticated: ${consumerData.user.name}`);

  // 3. Connect Consumer Socket
  const consumerSocket: ClientSocket = Client(baseUrl, {
    auth: { token: consumerToken },
    transports: ['websocket'],
  });

  await new Promise<void>((resolve, reject) => {
    consumerSocket.on('connect', () => {
      console.log('[E2E] ✓ Consumer WebSocket connected & joined direct alert room');
      resolve();
    });
    consumerSocket.on('connect_error', reject);
  });

  // Track real-time events on Consumer side
  const receivedStatusUpdates: string[] = [];
  consumerSocket.on('booking:statusChanged', (data: any) => {
    console.log(`[E2E][Socket Event] Consumer received status update: ${data.status}`);
    receivedStatusUpdates.push(data.status);
  });

  // 4. Consumer Creates Booking (₹1,200 for Electrical Repair)
  console.log('[E2E] Step 2: Consumer creating booking request for ₹1,200...');
  const createBookingRes = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${consumerToken}`,
    },
    body: JSON.stringify({
      grossAmount: 1200,
      serviceCategoryName: 'Electrical Repair & Wiring',
      address: 'A-45, Greater Kailash Part 1, New Delhi',
      consumerH3Index: '8861969521fffff',
      notes: 'Main distribution board circuit breaker tripping',
    }),
  });
  if (!createBookingRes.ok) {
    throw new Error(`Booking creation failed: ${await createBookingRes.text()}`);
  }
  const bookingData = (await createBookingRes.json()) as any;
  const booking = bookingData.booking;
  const completionOtp = bookingData.completionOtp;

  console.log(`[E2E] ✓ Booking #${booking.id.slice(0, 8)} created in REQUESTED status`);
  console.log(`[E2E] ✓ Generated 4-digit completion PIN: ${completionOtp}`);
  console.log(`[E2E] ✓ Spatial candidates matched within H3 Res-8 k-ring: ${bookingData.candidatesFound}`);

  // 5. Provider Login (Ramesh Kumar / Mohammad Imran)
  console.log('[E2E] Step 3: Logging in as Cooperative Provider (Ramesh Kumar)...');
  const providerLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'ramesh.plumber@sahakar.org',
      password: 'Password@123',
    }),
  });
  if (!providerLoginRes.ok) {
    throw new Error(`Provider login failed: ${await providerLoginRes.text()}`);
  }
  const providerData = (await providerLoginRes.json()) as any;
  const providerToken = providerData.token;
  console.log(`[E2E] ✓ Provider authenticated: ${providerData.user.name}`);

  // 6. Provider Accepts Job
  console.log('[E2E] Step 4: Provider accepting booking via PATCH /api/bookings/:id/accept...');
  const acceptRes = await fetch(`${baseUrl}/api/bookings/${booking.id}/accept`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${providerToken}`,
    },
  });
  if (!acceptRes.ok) {
    throw new Error(`Provider accept failed: ${await acceptRes.text()}`);
  }
  console.log('[E2E] ✓ Provider accepted booking');

  // Wait briefly for WebSocket sync
  await new Promise((r) => setTimeout(r, 400));
  if (!receivedStatusUpdates.includes('ACCEPTED')) {
    throw new Error('Consumer failed to receive real-time ACCEPTED WebSocket status event');
  }
  console.log('[E2E] ✓ Consumer verified receipt of ACCEPTED status over WebSocket');

  // 7. Provider Marks Job IN_PROGRESS
  console.log('[E2E] Step 5: Provider marking job IN_PROGRESS...');
  const progressRes = await fetch(`${baseUrl}/api/bookings/${booking.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${providerToken}`,
    },
    body: JSON.stringify({ status: 'IN_PROGRESS' }),
  });
  if (!progressRes.ok) {
    throw new Error(`Provider progress update failed: ${await progressRes.text()}`);
  }
  await new Promise((r) => setTimeout(r, 300));
  if (!receivedStatusUpdates.includes('IN_PROGRESS')) {
    throw new Error('Consumer failed to receive real-time IN_PROGRESS WebSocket status event');
  }
  console.log('[E2E] ✓ Consumer verified receipt of IN_PROGRESS status over WebSocket');

  // 8. Record South Delhi PSCS initial welfare balance
  const coopBefore = await prisma.cooperative.findFirst({
    where: { district: 'South Delhi' },
  });
  const initialWelfareBalance = Number(coopBefore!.welfareBalance);

  // 9. Provider Submits Correct 4-Digit Completion PIN
  console.log(`[E2E] Step 6: Provider submitting customer PIN (${completionOtp}) for escrow release...`);
  const completeRes = await fetch(`${baseUrl}/api/bookings/${booking.id}/complete`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${providerToken}`,
    },
    body: JSON.stringify({ completionOtp }),
  });
  if (!completeRes.ok) {
    throw new Error(`Completion settlement failed: ${await completeRes.text()}`);
  }
  const completeData = (await completeRes.json()) as any;
  console.log('[E2E] ✓ PIN verified and job completed');

  await new Promise((r) => setTimeout(r, 300));
  if (!receivedStatusUpdates.includes('COMPLETED')) {
    throw new Error('Consumer failed to receive real-time COMPLETED WebSocket status event');
  }

  // 10. Verify Tripartite Ledger & Balance Invariants
  console.log('[E2E] Step 7: Verifying atomic zero-leakage accounting and welfare increment...');
  const ledger = completeData.ledgerEntry;
  const workerPayout = Number(ledger.workerPayout);
  const welfareShare = Number(ledger.welfareFundShare);
  const platformShare = Number(ledger.platformShare);
  const totalGross = Number(ledger.totalGross);

  if (totalGross !== 1200.00) {
    throw new Error(`Expected gross 1200.00, got ${totalGross}`);
  }
  if (workerPayout !== 1056.00) {
    throw new Error(`Expected worker payout 1056.00 (88%), got ${workerPayout}`);
  }
  if (welfareShare !== 96.00) {
    throw new Error(`Expected welfare fund share 96.00 (8%), got ${welfareShare}`);
  }
  if (platformShare !== 48.00) {
    throw new Error(`Expected platform fee 48.00 (4%), got ${platformShare}`);
  }

  const coopAfter = await prisma.cooperative.findFirst({
    where: { district: 'South Delhi' },
  });
  const updatedWelfareBalance = Number(coopAfter!.welfareBalance);
  const expectedWelfare = Number((initialWelfareBalance + 96.00).toFixed(2));

  if (updatedWelfareBalance !== expectedWelfare) {
    throw new Error(`Welfare balance mismatch: expected ${expectedWelfare}, got ${updatedWelfareBalance}`);
  }
  console.log(`[E2E] ✓ Society welfare fund balance successfully incremented from ₹${initialWelfareBalance.toFixed(2)} to ₹${updatedWelfareBalance.toFixed(2)} (+₹96.00)`);

  // Cleanup
  consumerSocket.disconnect();
  if (httpServer.listening) {
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  }
  await prisma.$disconnect();

  console.log('========================================================================================');
  console.log('[E2E] Full Lifecycle Passed: Booking -> Dispatch -> Socket Sync -> PIN Verification -> Escrow Release verified with 0 errors!');
  console.log('========================================================================================');
}

runE2ESimulation().catch((err) => {
  console.error('[E2E Simulation Failed]', err);
  process.exit(1);
});
