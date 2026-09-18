import { PrismaClient, UserRole, MembershipClass, BookingStatus, PaymentStatus, PollStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { credentials } from '../src/config/credentials';

const prisma = new PrismaClient();

// Zero-leakage calculation matching statutory ledger service
function calculateSplit(gross: number, welfareRate: number, platformRate: number) {
  const g = Math.round(gross * 100) / 100;
  const welfare = Math.round(g * welfareRate * 100) / 100;
  const platform = Math.round(g * platformRate * 100) / 100;
  const worker = Number((g - welfare - platform).toFixed(2));
  return { gross: g, welfare, platform, worker };
}

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

  const defaultPasswordHash = bcrypt.hashSync(credentials.defaultPassword, 10);

  // 1. Seed 4 Cooperatives across 3 States (Delhi, Maharashtra, Karnataka)
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
      commissionPlatformRate: 0.04,  // 4% statutory platform maintenance
      welfareFundRate: 0.08,         // 8% statutory welfare fund
      welfareBalance: 42350.00,
      statutoryReserveBalance: 20000.00,
    },
  });

  const mumbaiCoop = await prisma.cooperative.create({
    data: {
      name: 'Mumbai Suburban Labour & Trades Cooperative',
      registrationNo: 'MH-PSCS-2024-089',
      state: 'Maharashtra',
      district: 'Mumbai Suburban',
      commissionPlatformRate: 0.04,
      welfareFundRate: 0.08,
      welfareBalance: 64500.00,
      statutoryReserveBalance: 28000.00,
    },
  });

  const blrCoop = await prisma.cooperative.create({
    data: {
      name: 'Bengaluru Urban Home Services Co-op Society Ltd',
      registrationNo: 'KA-PSCS-2024-019',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      commissionPlatformRate: 0.04,
      welfareFundRate: 0.08,
      welfareBalance: 78200.00,
      statutoryReserveBalance: 32500.00,
    },
  });

  const cooperatives = [delhiCoop, puneCoop, mumbaiCoop, blrCoop];
  console.log(`[Seed] Created 4 Cooperatives across 3 States`);

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
  await prisma.user.create({
    data: {
      name: 'Rajesh Sharma (Admin)',
      email: 'admin.delhi@sahakar.gov.in',
      phone: '+919810011001',
      passwordHash: defaultPasswordHash,
      role: UserRole.COOP_ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Suresh Patil (Admin)',
      email: 'admin.pune@sahakar.gov.in',
      phone: '+919820022002',
      passwordHash: defaultPasswordHash,
      role: UserRole.COOP_ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Vikas Kadam (Admin)',
      email: 'admin.mumbai@sahakar.gov.in',
      phone: '+919830033003',
      passwordHash: defaultPasswordHash,
      role: UserRole.COOP_ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Ananth Gowda (Admin)',
      email: 'admin.bengaluru@sahakar.gov.in',
      phone: '+919840044004',
      passwordHash: defaultPasswordHash,
      role: UserRole.COOP_ADMIN,
    },
  });

  // Central / State Regulator (Ministry of Cooperation)
  await prisma.user.create({
    data: {
      name: 'Dr. Amitav Roy, IAS (Coop Registrar)',
      email: 'regulator@cooperation.gov.in',
      phone: '+919811199999',
      passwordHash: defaultPasswordHash,
      role: UserRole.REGULATOR,
    },
  });

  // Seed Consumers
  const consumerUsersData = [
    { name: 'Vikram Malhotra', email: 'vikram.consumer@gmail.com', phone: '+919876543210' },
    { name: 'Pooja Verma', email: 'pooja.verma@outlook.com', phone: '+919876543211' },
    { name: 'Ananya Sen', email: 'ananya.sen@gmail.com', phone: '+919876543212' },
    { name: 'Kavita Rao', email: 'kavita.rao@gmail.com', phone: '+919876543213' },
    { name: 'Rahul Deshmukh', email: 'rahul.deshmukh@gmail.com', phone: '+919876543214' },
  ];

  const consumers = [];
  for (const c of consumerUsersData) {
    const user = await prisma.user.create({
      data: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        passwordHash: defaultPasswordHash,
        role: UserRole.CONSUMER,
      },
    });
    consumers.push(user);
  }

  // Seed Providers across the 4 cooperatives
  const providersRawData = [
    // Delhi Providers (6)
    {
      coop: delhiCoop,
      name: 'Ramesh Kumar (Plumber)',
      email: 'ramesh.plumber@sahakar.org',
      phone: '+919811100001',
      skills: ['Plumbing', 'Pipe Fitting', 'Sanitary Maintenance'],
      h3IndexRes8: '8861969527fffff', // South Delhi (Hauz Khas)
      nsqfLevel: 4,
      membershipClass: MembershipClass.CLASS_A_VOTING,
      rating: 4.9,
    },
    {
      coop: delhiCoop,
      name: 'Mohammad Imran (Electrician)',
      email: 'imran.electrician@sahakar.org',
      phone: '+919811100002',
      skills: ['Electrical Repair', 'Short Circuit Diagnosis', 'Wiring'],
      h3IndexRes8: '8861969521fffff', // South Delhi (GK)
      nsqfLevel: 5,
      membershipClass: MembershipClass.CLASS_A_VOTING,
      rating: 4.8,
    },
    {
      coop: delhiCoop,
      name: 'Dinesh Vishwakarma (Carpenter)',
      email: 'dinesh.carpenter@sahakar.org',
      phone: '+919811100003',
      skills: ['Carpentry', 'Furniture Assembly', 'Door Locks'],
      h3IndexRes8: '8861969523fffff', // South Delhi (Saket)
      nsqfLevel: 4,
      membershipClass: MembershipClass.CLASS_A_VOTING,
      rating: 4.95,
    },
    {
      coop: delhiCoop,
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
      coop: delhiCoop,
      name: 'Ashok Mehra (Electrician)',
      email: 'ashok.electrician@sahakar.org',
      phone: '+919811100005',
      skills: ['Electrical Wiring', 'MCB Installation', 'Inverter Setup'],
      h3IndexRes8: '886196952bfffff', // South Delhi (Nehru Place)
      nsqfLevel: 4,
      membershipClass: MembershipClass.CLASS_A_VOTING,
      rating: 4.85,
    },
    {
      coop: delhiCoop,
      name: 'Santosh Kumar (Carpenter)',
      email: 'santosh.carpenter@sahakar.org',
      phone: '+919811100006',
      skills: ['Carpentry', 'Modular Kitchen Repair', 'Polishing'],
      h3IndexRes8: '886196952dfffff', // South Delhi (Lajpat Nagar)
      nsqfLevel: 3,
      membershipClass: MembershipClass.NOMINAL,
      rating: 4.6,
    },
    // Pune Providers (3)
    {
      coop: puneCoop,
      name: 'Ganesh Shinde (Plumber)',
      email: 'ganesh.plumber@sahakar.org',
      phone: '+919822200001',
      skills: ['Plumbing', 'Solar Water Heater Repair', 'Drainage Unclogging'],
      h3IndexRes8: '8860145217fffff', // Pune Kothrud
      nsqfLevel: 4,
      membershipClass: MembershipClass.CLASS_A_VOTING,
      rating: 4.88,
    },
    {
      coop: puneCoop,
      name: 'Prakash More (Electrician)',
      email: 'prakash.electrician@sahakar.org',
      phone: '+919822200002',
      skills: ['Electrical Repair', 'Motor Rewinding', 'Three Phase Wiring'],
      h3IndexRes8: '8860145213fffff', // Pune Shivajinagar
      nsqfLevel: 5,
      membershipClass: MembershipClass.CLASS_A_VOTING,
      rating: 4.92,
    },
    {
      coop: puneCoop,
      name: 'Nitin Pawar (Appliance Repair)',
      email: 'nitin.appliance@sahakar.org',
      phone: '+919822200003',
      skills: ['Home Appliance Repair', 'AC Servicing', 'Washing Machine Repair'],
      h3IndexRes8: '8860145215fffff', // Pune Viman Nagar
      nsqfLevel: 4,
      membershipClass: MembershipClass.CLASS_A_VOTING,
      rating: 4.75,
    },
    // Mumbai Providers (3)
    {
      coop: mumbaiCoop,
      name: 'Ajay Sawant (Plumber)',
      email: 'ajay.plumber@sahakar.org',
      phone: '+919833300001',
      skills: ['Plumbing', 'Pressure Booster Pumps', 'Sanitary Fittings'],
      h3IndexRes8: '8861892547fffff', // Andheri West
      nsqfLevel: 4,
      membershipClass: MembershipClass.CLASS_A_VOTING,
      rating: 4.85,
    },
    {
      coop: mumbaiCoop,
      name: 'Haresh Solanki (Electrician)',
      email: 'haresh.electrician@sahakar.org',
      phone: '+919833300002',
      skills: ['Electrical Wiring', 'Distribution Board', 'Earth Pit Testing'],
      h3IndexRes8: '8861892543fffff', // Bandra West
      nsqfLevel: 5,
      membershipClass: MembershipClass.CLASS_A_VOTING,
      rating: 4.9,
    },
    {
      coop: mumbaiCoop,
      name: 'Mahesh Jadhav (Carpenter)',
      email: 'mahesh.carpenter@sahakar.org',
      phone: '+919833300003',
      skills: ['Carpentry', 'Acoustic Paneling', 'Custom Cabinets'],
      h3IndexRes8: '8861892545fffff', // Borivali
      nsqfLevel: 4,
      membershipClass: MembershipClass.CLASS_A_VOTING,
      rating: 4.79,
    },
    // Bengaluru Providers (3)
    {
      coop: blrCoop,
      name: 'Manjunath Swamy (Plumber)',
      email: 'manjunath.plumber@sahakar.org',
      phone: '+919844400001',
      skills: ['Plumbing', 'Hydro-pneumatic Systems', 'RO Plant Servicing'],
      h3IndexRes8: '88618c4d27fffff', // Koramangala
      nsqfLevel: 5,
      membershipClass: MembershipClass.CLASS_A_VOTING,
      rating: 4.94,
    },
    {
      coop: blrCoop,
      name: 'Basavaraj Patil (Electrician)',
      email: 'basavaraj.electrician@sahakar.org',
      phone: '+919844400002',
      skills: ['Electrical Repair', 'Smart Home Automation', 'UPS Installation'],
      h3IndexRes8: '88618c4d23fffff', // Indiranagar
      nsqfLevel: 5,
      membershipClass: MembershipClass.CLASS_A_VOTING,
      rating: 4.91,
    },
    {
      coop: blrCoop,
      name: 'Venkatesh Murthy (Appliance Repair)',
      email: 'venkatesh.appliance@sahakar.org',
      phone: '+919844400003',
      skills: ['Home Appliance Repair', 'Refrigerator Gas Refill', 'Microwave Repair'],
      h3IndexRes8: '88618c4d25fffff', // HSR Layout
      nsqfLevel: 4,
      membershipClass: MembershipClass.CLASS_A_VOTING,
      rating: 4.82,
    },
  ];

  const createdProviders = [];
  for (const p of providersRawData) {
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
        cooperativeId: p.coop.id,
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

    createdProviders.push({ ...profile, coop: p.coop, user });
  }
  console.log(`[Seed] Created ${createdProviders.length} Providers across 4 cooperatives`);

  // 4. Seed 34 Completed Bookings (varying ₹350–₹4,500) with Settled Payment Ledger Entries
  const bookingAmounts = [
    350.00, 450.00, 500.00, 650.00, 750.00, 800.00, 950.00, 1000.00,
    1150.00, 1200.00, 1350.00, 1500.00, 1650.00, 1800.00, 1950.00, 2100.00,
    2250.00, 2400.00, 2500.00, 2750.00, 2900.00, 3100.00, 3250.00, 3400.00,
    3500.00, 3650.00, 3800.00, 3950.00, 4100.00, 4200.00, 4350.00, 4500.00,
    1000.00, 850.00
  ];

  let settledGrossTotal = 0;
  for (let i = 0; i < bookingAmounts.length; i++) {
    const gross = bookingAmounts[i];
    const provider = createdProviders[i % createdProviders.length];
    const consumer = consumers[i % consumers.length];
    const coop = provider.coop;

    // Time distributed over the past 28 days
    const daysAgo = Math.floor((34 - i) * 0.8);
    const bookingDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - (i * 1800000));

    const booking = await prisma.booking.create({
      data: {
        consumerId: consumer.id,
        providerId: provider.id,
        cooperativeId: coop.id,
        status: BookingStatus.COMPLETED,
        completionOtp: `${1000 + (i * 137) % 9000}`,
        grossAmount: gross,
        createdAt: bookingDate,
      },
    });

    const split = calculateSplit(
      gross,
      Number(coop.welfareFundRate),
      Number(coop.commissionPlatformRate)
    );

    await prisma.paymentLedgerEntry.create({
      data: {
        bookingId: booking.id,
        totalGross: split.gross,
        workerPayout: split.worker,
        welfareFundShare: split.welfare,
        platformShare: split.platform,
        status: PaymentStatus.SETTLED,
        settledAt: bookingDate,
      },
    });

    settledGrossTotal += split.gross;
  }

  // Plus 2 Active/Pending sample bookings
  await prisma.booking.create({
    data: {
      consumerId: consumers[0].id,
      providerId: null, // Awaiting assignment
      cooperativeId: delhiCoop.id,
      status: BookingStatus.REQUESTED,
      completionOtp: '9153',
      grossAmount: 1500.00,
    },
  });

  await prisma.booking.create({
    data: {
      consumerId: consumers[1].id,
      providerId: createdProviders[0].id,
      cooperativeId: delhiCoop.id,
      status: BookingStatus.ACCEPTED,
      completionOtp: '7412',
      grossAmount: 850.00,
    },
  });

  console.log(`[Seed] Created 34 Completed Bookings (Gross ₹${settledGrossTotal}) + 2 Active Bookings`);

  // 5. Seed 3 Governance Polls (2 Resolved, 1 Open) under MSCS Act 2023

  // Poll 1: Delhi Coop (OPEN)
  const openMonsoonPoll = await prisma.governancePoll.create({
    data: {
      cooperativeId: delhiCoop.id,
      title: 'Increase Monsoon Welfare Fund Deduction from 8% to 10% for Group Health Insurance',
      description: 'Resolution under MSCS Act 2023 Sec 63: Increase worker welfare deduction from 8% to 10% during July-September to subsidize universal group dengue and monsoon illness insurance for all active Class-A voting members.',
      quorumPercent: 50.0,
      status: PollStatus.OPEN,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Votes on Poll 1
  await prisma.pollVote.create({
    data: {
      pollId: openMonsoonPoll.id,
      providerId: createdProviders[0].id,
      choice: 'YES_IN_FAVOR',
    },
  });
  await prisma.pollVote.create({
    data: {
      pollId: openMonsoonPoll.id,
      providerId: createdProviders[1].id,
      choice: 'YES_IN_FAVOR',
    },
  });

  // Poll 2: Pune Coop (RESOLVED / CLOSED - PASSED)
  const resolvedToolBankPoll = await prisma.governancePoll.create({
    data: {
      cooperativeId: puneCoop.id,
      title: 'Establish Cooperative Tool Bank and Equipment Leasing Pool',
      description: 'Allocate ₹15,000 from accumulated welfare surplus to procure high-grade specialized tools (rotary hammers, drain inspection cameras) available for zero-interest rental to Class-A members.',
      quorumPercent: 60.0,
      status: PollStatus.CLOSED,
      expiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Ended 7 days ago
    },
  });

  const puneProviders = createdProviders.filter((p) => p.cooperativeId === puneCoop.id);
  for (const p of puneProviders) {
    await prisma.pollVote.create({
      data: {
        pollId: resolvedToolBankPoll.id,
        providerId: p.id,
        choice: 'YES_IN_FAVOR',
      },
    });
  }

  // Poll 3: Bengaluru Coop (RESOLVED / CLOSED - PASSED)
  const resolvedTrainingPoll = await prisma.governancePoll.create({
    data: {
      cooperativeId: blrCoop.id,
      title: 'Mandatory NSQF Level 5 Up-skilling Subsidy & Certification Drive',
      description: 'Adopt cooperative sponsorship covering 70% of NSQF Level 5 certification costs for registered technicians in smart-home electricals and heat pump plumbing.',
      quorumPercent: 55.0,
      status: PollStatus.CLOSED,
      expiresAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Ended 14 days ago
    },
  });

  const blrProviders = createdProviders.filter((p) => p.cooperativeId === blrCoop.id);
  for (const p of blrProviders) {
    await prisma.pollVote.create({
      data: {
        pollId: resolvedTrainingPoll.id,
        providerId: p.id,
        choice: 'YES_IN_FAVOR',
      },
    });
  }

  console.log(`[Seed] Created 3 Governance Polls (2 RESOLVED, 1 OPEN) with member votes`);
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
