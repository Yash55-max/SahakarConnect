import { PrismaClient, UserRole, MembershipClass, BookingStatus, PaymentStatus, PollStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting statutory database seeding for SahakarConnect...');

  // Clear existing records in reverse dependency order
  await prisma.pollVote.deleteMany();
  await prisma.governancePoll.deleteMany();
  await prisma.paymentLedgerEntry.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cooperative.deleteMany();

  const defaultPasswordHash = bcrypt.hashSync('Password@123', 10);

  // 1. Seed Two Cooperatives
  const delhiCoop = await prisma.cooperative.create({
    data: {
      name: 'South Delhi Urban Tradesmen PSCS',
      registrationNo: 'DL-PSCS-2024-001',
      state: 'Delhi',
      district: 'South Delhi',
      commissionPlatformRate: 0.04, // 4% platform commission
      welfareFundRate: 0.08,        // 8% welfare fund
      welfareBalance: 58400.00,
      statutoryReserveBalance: 25000.00,
    },
  });

  const puneCoop = await prisma.cooperative.create({
    data: {
      name: 'Pune District Shramik Cooperative Society',
      registrationNo: 'MH-PSCS-2024-042',
      state: 'Maharashtra',
      district: 'Pune',
      commissionPlatformRate: 0.035, // 3.5% platform commission
      welfareFundRate: 0.07,         // 7% welfare fund
      welfareBalance: 42350.00,
      statutoryReserveBalance: 20000.00,
    },
  });

  console.log(`[Seed] Created 2 Cooperatives: ${delhiCoop.name} & ${puneCoop.name}`);

  // 2. Seed Service Categories
  const categories = await Promise.all([
    prisma.serviceCategory.create({ data: { name: 'Plumbing Services', iconName: 'pipe-wrench' } }),
    prisma.serviceCategory.create({ data: { name: 'Electrical Repair & Wiring', iconName: 'bolt' } }),
    prisma.serviceCategory.create({ data: { name: 'Carpentry & Woodwork', iconName: 'hammer' } }),
    prisma.serviceCategory.create({ data: { name: 'Home Appliance Repair', iconName: 'cpu' } }),
  ]);
  console.log(`[Seed] Created ${categories.length} Service Categories`);

  // 3. Seed Users & Profiles

  // Cooperative Admins (1 per cooperative)
  const delhiAdminUser = await prisma.user.create({
    data: {
      name: 'Rajesh Sharma (Admin)',
      email: 'admin.delhi@sahakar.gov.in',
      phone: '+919810011001',
      passwordHash: defaultPasswordHash,
      role: UserRole.COOP_ADMIN,
    },
  });

  const puneAdminUser = await prisma.user.create({
    data: {
      name: 'Suresh Patil (Admin)',
      email: 'admin.pune@sahakar.gov.in',
      phone: '+919820022002',
      passwordHash: defaultPasswordHash,
      role: UserRole.COOP_ADMIN,
    },
  });

  // Central / State Regulator
  const regulatorUser = await prisma.user.create({
    data: {
      name: 'Dr. Amitav Roy, IAS (Coop Registrar)',
      email: 'regulator@cooperation.gov.in',
      phone: '+919811199999',
      passwordHash: defaultPasswordHash,
      role: UserRole.REGULATOR,
    },
  });

  // 2 Consumers
  const consumer1 = await prisma.user.create({
    data: {
      name: 'Vikram Malhotra',
      email: 'vikram.consumer@gmail.com',
      phone: '+919876543210',
      passwordHash: defaultPasswordHash,
      role: UserRole.CONSUMER,
    },
  });

  const consumer2 = await prisma.user.create({
    data: {
      name: 'Pooja Verma',
      email: 'pooja.verma@outlook.com',
      phone: '+919876543211',
      passwordHash: defaultPasswordHash,
      role: UserRole.CONSUMER,
    },
  });

  // 6 Verified Providers for South Delhi PSCS with Uber H3 Resolution-8 Indexes
  const providersData = [
    {
      name: 'Ramesh Kumar (Plumber)',
      email: 'ramesh.plumber@sahakar.org',
      phone: '+919811100001',
      skills: ['Plumbing', 'Pipe Fitting', 'Sanitary Maintenance'],
      h3IndexRes8: '8861969527fffff', // South Delhi (Hauz Khas area)
      nsqfLevel: 4,
      membershipClass: MembershipClass.CLASS_A_VOTING,
      rating: 4.9,
    },
    {
      name: 'Mohammad Imran (Electrician)',
      email: 'imran.electrician@sahakar.org',
      phone: '+919811100002',
      skills: ['Electrical Repair', 'Short Circuit Diagnosis', 'Wiring'],
      h3IndexRes8: '8861969521fffff', // South Delhi (Greater Kailash area)
      nsqfLevel: 5,
      membershipClass: MembershipClass.CLASS_A_VOTING,
      rating: 4.8,
    },
    {
      name: 'Dinesh Vishwakarma (Carpenter)',
      email: 'dinesh.carpenter@sahakar.org',
      phone: '+919811100003',
      skills: ['Carpentry', 'Furniture Assembly', 'Door Locks'],
      h3IndexRes8: '8861969523fffff', // South Delhi (Saket area)
      nsqfLevel: 4,
      membershipClass: MembershipClass.CLASS_A_VOTING,
      rating: 4.95,
    },
    {
      name: 'Sunil Yadav (Plumber)',
      email: 'sunil.plumber@sahakar.org',
      phone: '+919811100004',
      skills: ['Plumbing', 'Water Tank Cleaning', 'Leakage Repair'],
      h3IndexRes8: '8861969525fffff', // South Delhi (Malviya Nagar)
      nsqfLevel: 3,
      membershipClass: MembershipClass.CLASS_B_NON_VOTING,
      rating: 4.7,
    },
    {
      name: 'Ashok Mehra (Electrician)',
      email: 'ashok.electrician@sahakar.org',
      phone: '+919811100005',
      skills: ['Electrical Wiring', 'MCB Installation', 'Inverter Setup'],
      h3IndexRes8: '886196952bfffff', // South Delhi (Nehru Place area)
      nsqfLevel: 4,
      membershipClass: MembershipClass.CLASS_A_VOTING,
      rating: 4.85,
    },
    {
      name: 'Santosh Kumar (Carpenter)',
      email: 'santosh.carpenter@sahakar.org',
      phone: '+919811100006',
      skills: ['Carpentry', 'Modular Kitchen Repair', 'Polishing'],
      h3IndexRes8: '886196952dfffff', // South Delhi (Lajpat Nagar)
      nsqfLevel: 3,
      membershipClass: MembershipClass.NOMINAL,
      rating: 4.6,
    },
  ];

  const createdProviders = [];
  for (const p of providersData) {
    const user = await prisma.user.create({
      data: {
        name: p.name,
        email: p.email,
        phone: p.phone,
        passwordHash: defaultPasswordHash,
        role: UserRole.PROVIDER,
      },
    });

    const profile = await prisma.providerProfile.create({
      data: {
        userId: user.id,
        cooperativeId: delhiCoop.id,
        membershipClass: p.membershipClass,
        shareCapitalAmount: 500.00,
        skills: p.skills,
        isAadhaarVerified: true,
        isPoliceClearVerified: true,
        nsqfLevel: p.nsqfLevel,
        ratingAverage: p.rating,
        isAvailable: true,
        h3IndexRes8: p.h3IndexRes8,
      },
    });

    createdProviders.push(profile);
  }

  console.log(`[Seed] Created 6 Providers with Uber H3 Res-8 spatial indexes`);

  // 4. Seed Two Sample Bookings:
  // (a) 1 in COMPLETED status with settled PaymentLedgerEntry
  const completedBooking = await prisma.booking.create({
    data: {
      consumerId: consumer1.id,
      providerId: createdProviders[0].id,
      cooperativeId: delhiCoop.id,
      status: BookingStatus.COMPLETED,
      completionOtp: '4829',
      grossAmount: 1000.00,
    },
  });

  // Settled PaymentLedgerEntry for the ₹1,000 completed booking:
  // Worker: 1000 * (1 - 0.08 - 0.04) = ₹880.00
  // Welfare: 1000 * 0.08 = ₹80.00
  // Platform: 1000 * 0.04 = ₹40.00
  await prisma.paymentLedgerEntry.create({
    data: {
      bookingId: completedBooking.id,
      totalGross: 1000.00,
      workerPayout: 880.00,
      welfareFundShare: 80.00,
      platformShare: 40.00,
      status: PaymentStatus.SETTLED,
      settledAt: new Date(),
    },
  });

  // (b) 1 in REQUESTED status awaiting assignment
  await prisma.booking.create({
    data: {
      consumerId: consumer2.id,
      providerId: null, // Awaiting assignment
      cooperativeId: delhiCoop.id,
      status: BookingStatus.REQUESTED,
      completionOtp: '9153',
      grossAmount: 1500.00,
    },
  });

  console.log(`[Seed] Created 2 sample bookings (1 COMPLETED with settled ledger entry, 1 REQUESTED)`);

  // 5. Seed Active Governance Poll
  const monsoonPoll = await prisma.governancePoll.create({
    data: {
      cooperativeId: delhiCoop.id,
      title: 'Increase Monsoon Welfare Fund Deduction from 8% to 10% for Group Health Insurance',
      description: 'Resolution under MSCS Act 2023 Sec 63: Increase worker welfare deduction from 8% to 10% during July-September to subsidize universal group dengue and monsoon illness insurance for all active Class-A voting members.',
      quorumPercent: 50.0,
      status: PollStatus.OPEN,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  // Seed 2 initial votes on the poll by Class A members
  await prisma.pollVote.create({
    data: {
      pollId: monsoonPoll.id,
      providerId: createdProviders[0].id,
      choice: 'YES_IN_FAVOR',
    },
  });

  await prisma.pollVote.create({
    data: {
      pollId: monsoonPoll.id,
      providerId: createdProviders[1].id,
      choice: 'YES_IN_FAVOR',
    },
  });

  console.log(`[Seed] Created active GovernancePoll and initial member votes`);
  console.log('[Seed] Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('[Seed] Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
