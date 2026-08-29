import { PrismaClient, Role, VerificationStatus, BookingStatus, PaymentStatus, PollStatus, GrievanceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SahakarConnect database seed...');

  // Clear existing data
  await prisma.pollVote.deleteMany();
  await prisma.governancePoll.deleteMany();
  await prisma.welfareDisbursement.deleteMany();
  await prisma.paymentLedgerEntry.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.grievanceTicket.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.serviceListing.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.cooperative.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Create Cooperatives (PSCS)
  const coopDelhi = await prisma.cooperative.create({
    data: {
      name: 'Delhi Shramik Sahakari Samiti (DSSS)',
      registrationNumber: 'DL/COOP/2021/8842',
      district: 'South Delhi',
      state: 'Delhi',
      commissionRatePercent: 8.0,
      welfareFundBalance: 145200.0,
      totalMembers: 48,
    },
  });

  const coopPune = await prisma.cooperative.create({
    data: {
      name: 'Pune Seva Sahakar Sanstha (PSSS)',
      registrationNumber: 'MH/PUN/2019/3319',
      district: 'Pune',
      state: 'Maharashtra',
      commissionRatePercent: 10.0,
      welfareFundBalance: 210000.0,
      totalMembers: 64,
    },
  });

  const coopBengaluru = await prisma.cooperative.create({
    data: {
      name: 'Bengaluru Karmika Sangha (BKS)',
      registrationNumber: 'KA/BLR/2022/9012',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      commissionRatePercent: 9.0,
      welfareFundBalance: 185500.0,
      totalMembers: 52,
    },
  });

  console.log('✅ Cooperatives created');

  // 2. Create Welfare Disbursements
  await prisma.welfareDisbursement.createMany({
    data: [
      {
        cooperativeId: coopDelhi.id,
        title: 'Emergency Medical Assistance for Heat Stroke',
        beneficiary: 'Ramesh Yadav',
        amount: 15000,
        category: 'HEALTHCARE',
      },
      {
        cooperativeId: coopDelhi.id,
        title: 'Safety Gear & Modern Tool Subsidy (Batch 1)',
        beneficiary: '5 Registered Electricians',
        amount: 25000,
        category: 'TOOL_SUBSIDY',
      },
      {
        cooperativeId: coopPune.id,
        title: 'Accidental Injury Hospitalization Cover',
        beneficiary: 'Deepak Gaikwad',
        amount: 20000,
        category: 'ACCIDENT_COVER',
      },
      {
        cooperativeId: coopPune.id,
        title: 'Member Children Skill Scholarship Scheme',
        beneficiary: '8 Provider Families',
        amount: 40000,
        category: 'EDUCATION',
      },
      {
        cooperativeId: coopBengaluru.id,
        title: 'Electric Vehicle Two-Wheeler Downpayment Aid',
        beneficiary: 'Anand Gowda',
        amount: 30000,
        category: 'TOOL_SUBSIDY',
      },
    ],
  });

  // 3. Create Service Categories
  const catPlumbing = await prisma.serviceCategory.create({
    data: {
      name: 'Plumbing & Drainage',
      slug: 'plumbing',
      icon: 'Wrench',
      description: 'Pipe repairs, bathroom fitting, drainage, tap installation & water tanks.',
    },
  });

  const catElectrical = await prisma.serviceCategory.create({
    data: {
      name: 'Electrical & Wiring',
      slug: 'electrical',
      icon: 'Zap',
      description: 'Wiring check, switchboard repair, MCB fix, fan installation & smart lighting.',
    },
  });

  const catCleaning = await prisma.serviceCategory.create({
    data: {
      name: 'Home Deep Cleaning',
      slug: 'cleaning',
      icon: 'Sparkles',
      description: 'Full home sanitization, kitchen chimney, bathroom scrub & sofa shampooing.',
    },
  });

  const catAppliance = await prisma.serviceCategory.create({
    data: {
      name: 'Appliance Repair',
      slug: 'appliance-repair',
      icon: 'Cpu',
      description: 'AC servicing & gas refill, washing machine, refrigerator & microwave repair.',
    },
  });

  const catCarpentry = await prisma.serviceCategory.create({
    data: {
      name: 'Carpentry & Woodwork',
      slug: 'carpentry',
      icon: 'Hammer',
      description: 'Furniture assembly, modular kitchen fixes, lock repair & custom fittings.',
    },
  });

  const catElderCare = await prisma.serviceCategory.create({
    data: {
      name: 'Elderly & Patient Care',
      slug: 'elder-care',
      icon: 'HeartHandshake',
      description: 'Attentive companionship, mobility support, medication management & checkups.',
    },
  });

  const catTutoring = await prisma.serviceCategory.create({
    data: {
      name: 'Academic Home Tutoring',
      slug: 'tutoring',
      icon: 'GraduationCap',
      description: 'Personalized Math, Science & English tuition for Class 1-12 students.',
    },
  });

  const catCooking = await prisma.serviceCategory.create({
    data: {
      name: 'Home Cook & Chef',
      slug: 'cooking',
      icon: 'UtensilsCrossed',
      description: 'Hygienic daily home-style meals, party catering & regional Indian cuisines.',
    },
  });

  console.log('✅ Service Categories created');

  // 4. Create Users (Regulator, Admins, Consumers, Providers)
  
  // Regulator
  const regulatorUser = await prisma.user.create({
    data: {
      name: 'Dr. Rajeshwari Nair',
      email: 'regulator@cooperation.gov.in',
      phone: '+919810011001',
      passwordHash: defaultPassword,
      role: Role.REGULATOR,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Cooperative Admins
  const adminDelhiUser = await prisma.user.create({
    data: {
      name: 'Suresh Kumar (Admin)',
      email: 'admin.delhi@sahakar.coop',
      phone: '+919810022002',
      passwordHash: defaultPassword,
      role: Role.COOP_ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
  });

  const adminPuneUser = await prisma.user.create({
    data: {
      name: 'Sunita Deshmukh (Admin)',
      email: 'admin.pune@sahakar.coop',
      phone: '+919810033003',
      passwordHash: defaultPassword,
      role: Role.COOP_ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Consumers
  const consumerRahul = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+919820011111',
      passwordHash: defaultPassword,
      role: Role.CONSUMER,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
  });

  const consumerPriya = await prisma.user.create({
    data: {
      name: 'Priya Verma',
      email: 'priya.verma@example.com',
      phone: '+919820022222',
      passwordHash: defaultPassword,
      role: Role.CONSUMER,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  });

  const consumerAmit = await prisma.user.create({
    data: {
      name: 'Amit Patel',
      email: 'amit.patel@example.com',
      phone: '+919820033333',
      passwordHash: defaultPassword,
      role: Role.CONSUMER,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 5. Create Providers + ProviderProfiles
  const providerData = [
    {
      name: 'Ramesh Yadav',
      email: 'ramesh.yadav@sahakar.coop',
      phone: '+919876500001',
      coopId: coopDelhi.id,
      skills: ['Plumbing', 'Pipe Fitting', 'Bathroom Overhaul', 'Water Pump Repair'],
      verified: true,
      verificationStatus: VerificationStatus.VERIFIED,
      rating: 4.9,
      ratingCount: 38,
      lat: 28.5355,
      lng: 77.2410,
      address: 'Saket, New Delhi',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      listings: [
        { categoryId: catPlumbing.id, title: 'Complete Bathroom Leak & Pipe Fitting', basePrice: 450, desc: 'Diagnostic check and comprehensive repair for leaking pipes, showers and taps.' },
        { categoryId: catPlumbing.id, title: 'Water Tank & Booster Pump Installation', basePrice: 850, desc: 'Professional installation of overhead tanks and automatic pressure pumps.' }
      ]
    },
    {
      name: 'Satish Chand',
      email: 'satish.chand@sahakar.coop',
      phone: '+919876500002',
      coopId: coopDelhi.id,
      skills: ['Electrical Wiring', 'MCB Tripping Fix', 'Inverter Installation'],
      verified: true,
      verificationStatus: VerificationStatus.VERIFIED,
      rating: 4.8,
      ratingCount: 42,
      lat: 28.5500,
      lng: 77.2600,
      address: 'Kalkaji, New Delhi',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      listings: [
        { categoryId: catElectrical.id, title: 'House Electrical Safety Inspection & Wiring Fix', basePrice: 500, desc: 'Thorough short-circuit detection, earthing check and wire replacements.' },
        { categoryId: catElectrical.id, title: 'Inverter & Battery Backup Setup', basePrice: 650, desc: 'End-to-end wiring, battery water check and heavy load testing.' }
      ]
    },
    {
      name: 'Sunita Devi',
      email: 'sunita.devi@sahakar.coop',
      phone: '+919876500003',
      coopId: coopDelhi.id,
      skills: ['Deep Cleaning', 'Sanitization', 'Kitchen Degreasing'],
      verified: true,
      verificationStatus: VerificationStatus.VERIFIED,
      rating: 4.95,
      ratingCount: 56,
      lat: 28.5200,
      lng: 77.2100,
      address: 'Malviya Nagar, New Delhi',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      listings: [
        { categoryId: catCleaning.id, title: 'Eco-Friendly Kitchen & Chimney Deep Clean', basePrice: 799, desc: 'Steam degreasing of tiles, chimney mesh, cabinets and gas stove.' },
        { categoryId: catCleaning.id, title: 'Intense Bathroom Sanitization & Anti-Scale', basePrice: 599, desc: 'Tile de-scaling, chrome polish, toilet disinfection and exhaust cleaning.' }
      ]
    },
    {
      name: 'Mohammad Arif',
      email: 'arif.tech@sahakar.coop',
      phone: '+919876500004',
      coopId: coopDelhi.id,
      skills: ['AC Repair', 'Refrigerator Gas Refill', 'Washing Machine Drum Fix'],
      verified: true,
      verificationStatus: VerificationStatus.VERIFIED,
      rating: 4.75,
      ratingCount: 29,
      lat: 28.5700,
      lng: 77.2300,
      address: 'Lajpat Nagar, New Delhi',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      listings: [
        { categoryId: catAppliance.id, title: 'Split / Window AC Jet Service & Gas Check', basePrice: 699, desc: 'High-pressure water jet cleaning of cooling coils and filter sanitization.' }
      ]
    },
    {
      name: 'Deepak Gaikwad',
      email: 'deepak.gaikwad@sahakar.coop',
      phone: '+919876500005',
      coopId: coopPune.id,
      skills: ['Plumbing', 'Sanitaryware', 'Pipeline Hydro-Jetting'],
      verified: true,
      verificationStatus: VerificationStatus.VERIFIED,
      rating: 4.85,
      ratingCount: 31,
      lat: 18.5204,
      lng: 73.8567,
      address: 'Shivaji Nagar, Pune',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      listings: [
        { categoryId: catPlumbing.id, title: 'Express Leak Rectification & Faucet Mounting', basePrice: 399, desc: 'Quick fix for dripping faucets, flush valves and angle cocks.' }
      ]
    },
    {
      name: 'Kavita Patil',
      email: 'kavita.patil@sahakar.coop',
      phone: '+919876500006',
      coopId: coopPune.id,
      skills: ['Maharashtrian Cuisine', 'North Indian Cooking', 'Nutritious Diet Planning'],
      verified: true,
      verificationStatus: VerificationStatus.VERIFIED,
      rating: 5.0,
      ratingCount: 45,
      lat: 18.5314,
      lng: 73.8446,
      address: 'Kothrud, Pune',
      avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
      listings: [
        { categoryId: catCooking.id, title: 'Authentic 3-Course Home Meal Preparation', basePrice: 600, desc: 'Fresh, warm, hygienic home meal tailored to your family taste and diet preferences.' }
      ]
    },
    {
      name: 'Ganesh Shinde',
      email: 'ganesh.shinde@sahakar.coop',
      phone: '+919876500007',
      coopId: coopPune.id,
      skills: ['Carpentry', 'Modular Kitchen Repair', 'Antique Wood Restoration'],
      verified: true,
      verificationStatus: VerificationStatus.VERIFIED,
      rating: 4.7,
      ratingCount: 22,
      lat: 18.5089,
      lng: 73.8324,
      address: 'Deccan Gymkhana, Pune',
      avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
      listings: [
        { categoryId: catCarpentry.id, title: 'Door Lock Replacement & Hinge Alignment', basePrice: 450, desc: 'Precision fitting for Godrej/Yale deadbolts and wardrobe hydraulic hinges.' }
      ]
    },
    {
      name: 'Nitin Jadhav',
      email: 'nitin.jadhav@sahakar.coop',
      phone: '+919876500008',
      coopId: coopPune.id,
      skills: ['Solar Inverter Setup', 'Industrial Wiring', 'Smart Meter Fixing'],
      verified: false,
      verificationStatus: VerificationStatus.PENDING,
      rating: 5.0,
      ratingCount: 0,
      lat: 18.5600,
      lng: 73.8100,
      address: 'Aundh, Pune',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      listings: [
        { categoryId: catElectrical.id, title: 'Rooftop Solar Electrical Setup & Inverter Grid', basePrice: 1200, desc: 'Net-metering cable routing and heavy duty breaker safety box.' }
      ]
    },
    {
      name: 'Anand Gowda',
      email: 'anand.gowda@sahakar.coop',
      phone: '+919876500009',
      coopId: coopBengaluru.id,
      skills: ['Inverter AC Servicing', 'PCB Board Repair', 'Refrigerator Compressor'],
      verified: true,
      verificationStatus: VerificationStatus.VERIFIED,
      rating: 4.9,
      ratingCount: 60,
      lat: 12.9716,
      lng: 77.5946,
      address: 'Indiranagar, Bengaluru',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      listings: [
        { categoryId: catAppliance.id, title: 'Comprehensive Inverter Refrigerator & AC Repair', basePrice: 750, desc: 'PCB diagnostic scanner, capillary tube de-clogging and original OEM spare replacements.' }
      ]
    },
    {
      name: 'Lakshmi Narayana',
      email: 'lakshmi.n@sahakar.coop',
      phone: '+919876500010',
      coopId: coopBengaluru.id,
      skills: ['Elder Companion', 'Post-Op Physical Mobility', 'Vitals Monitoring'],
      verified: true,
      verificationStatus: VerificationStatus.VERIFIED,
      rating: 5.0,
      ratingCount: 34,
      lat: 12.9352,
      lng: 77.6245,
      address: 'Koramangala, Bengaluru',
      avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
      listings: [
        { categoryId: catElderCare.id, title: 'Dedicated 4-Hour Elderly Support & Mobility Aid', basePrice: 850, desc: 'Compassionate assistance with walking, physiotherapy exercises, medication reminder and conversation.' }
      ]
    },
    {
      name: 'Meenakshi Sundaram',
      email: 'meenakshi.s@sahakar.coop',
      phone: '+919876500011',
      coopId: coopBengaluru.id,
      skills: ['Class 8-10 CBSE Mathematics', 'Physics & Chemistry Basics', 'Exam Coaching'],
      verified: true,
      verificationStatus: VerificationStatus.VERIFIED,
      rating: 4.95,
      ratingCount: 28,
      lat: 12.9856,
      lng: 77.6050,
      address: 'MG Road, Bengaluru',
      avatarUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80',
      listings: [
        { categoryId: catTutoring.id, title: 'High School Mathematics & Science Concept Mastery', basePrice: 550, desc: 'One-on-one conceptual clarification, problem solving techniques and weekly assessments.' }
      ]
    },
    {
      name: 'Raju Naik',
      email: 'raju.naik@sahakar.coop',
      phone: '+919876500012',
      coopId: coopBengaluru.id,
      skills: ['Plumbing', 'Solar Water Heater Plumbing', 'Drain Camera Inspection'],
      verified: false,
      verificationStatus: VerificationStatus.PENDING,
      rating: 5.0,
      ratingCount: 0,
      lat: 12.9200,
      lng: 77.6100,
      address: 'BTM Layout, Bengaluru',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      listings: [
        { categoryId: catPlumbing.id, title: 'Solar Water Heater Pipe Connection & Flushing', basePrice: 600, desc: 'High-temperature CPVC pipe routing and heat valve replacement.' }
      ]
    }
  ];

  const createdProviders = [];

  for (const p of providerData) {
    const user = await prisma.user.create({
      data: {
        name: p.name,
        email: p.email,
        phone: p.phone,
        passwordHash: defaultPassword,
        role: Role.PROVIDER,
        avatarUrl: p.avatarUrl,
      },
    });

    const profile = await prisma.providerProfile.create({
      data: {
        userId: user.id,
        cooperativeId: p.coopId,
        skills: p.skills,
        verified: p.verified,
        verificationStatus: p.verificationStatus,
        rating: p.rating,
        ratingCount: p.ratingCount,
        available: true,
        lat: p.lat,
        lng: p.lng,
        address: p.address,
        aadharMockNumber: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    });

    for (const l of p.listings) {
      await prisma.serviceListing.create({
        data: {
          categoryId: l.categoryId,
          providerId: profile.id,
          title: l.title,
          description: l.desc,
          basePrice: l.basePrice,
        },
      });
    }

    createdProviders.push({ profile, user, coopId: p.coopId });
  }

  console.log('✅ Providers, Profiles and Service Listings created');

  // 6. Create Seed Bookings, Completed Jobs, Payment Ledger Entries and Ratings
  const ramesh = createdProviders[0];
  const satish = createdProviders[1];
  const sunita = createdProviders[2];
  const arif = createdProviders[3];
  const deepak = createdProviders[4];
  const kavita = createdProviders[5];

  const rameshListings = await prisma.serviceListing.findMany({ where: { providerId: ramesh.profile.id } });
  const satishListings = await prisma.serviceListing.findMany({ where: { providerId: satish.profile.id } });
  const sunitaListings = await prisma.serviceListing.findMany({ where: { providerId: sunita.profile.id } });
  const deepakListings = await prisma.serviceListing.findMany({ where: { providerId: deepak.profile.id } });
  const kavitaListings = await prisma.serviceListing.findMany({ where: { providerId: kavita.profile.id } });

  // Function to create a settled completed booking with exact cooperative revenue split
  async function createCompletedBookingWithLedger(
    consumer: any,
    provider: any,
    listing: any,
    coopCommissionRate: number,
    totalAmount: number,
    stars: number,
    comment: string,
    scheduledDaysAgo: number
  ) {
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() - scheduledDaysAgo);
    const completedAt = new Date(scheduledAt.getTime() + 2 * 3600 * 1000);

    const booking = await prisma.booking.create({
      data: {
        consumerId: consumer.id,
        providerId: provider.profile.id,
        listingId: listing.id,
        status: BookingStatus.COMPLETED,
        scheduledAt,
        completedAt,
        totalAmount,
        serviceAddress: 'Flat 402, Green Park Residency, South Delhi',
        notes: 'Cooperative verified service delivered on time.',
      },
    });

    // Calculate transparent revenue split:
    // Platform Share: 2% flat tech overhead
    // Cooperative Welfare Fund: (coopCommissionRate - 2)%
    // Provider Take-Home Share: (100 - coopCommissionRate)%
    const platformShare = Math.round((totalAmount * 0.02) * 100) / 100;
    const cooperativeFundShare = Math.round((totalAmount * ((coopCommissionRate - 2) / 100)) * 100) / 100;
    const providerShare = Math.round((totalAmount - platformShare - cooperativeFundShare) * 100) / 100;

    await prisma.paymentLedgerEntry.create({
      data: {
        bookingId: booking.id,
        totalAmount,
        providerShare,
        cooperativeFundShare,
        platformShare,
        status: PaymentStatus.SETTLED,
        paymentMethod: 'UPI_MOCK',
        transactionRef: `UPI-TXN-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: completedAt,
      },
    });

    await prisma.rating.create({
      data: {
        bookingId: booking.id,
        consumerId: consumer.id,
        providerId: provider.profile.id,
        stars,
        comment,
        createdAt: completedAt,
      },
    });

    return booking;
  }

  // Completed bookings
  await createCompletedBookingWithLedger(consumerRahul, ramesh, rameshListings[0], 8.0, 450, 5, 'Ramesh arrived within 25 minutes and fixed the concealed pipe leak cleanly. Fair pricing through the cooperative society!', 5);
  await createCompletedBookingWithLedger(consumerPriya, ramesh, rameshListings[1], 8.0, 850, 5, 'Excellent water booster pump installation. Fully verified cooperative member, very respectful.', 8);
  await createCompletedBookingWithLedger(consumerAmit, satish, satishListings[0], 8.0, 500, 5, 'Satish did a thorough check of our tripping MCBs. Transparent billing without hidden charges.', 3);
  await createCompletedBookingWithLedger(consumerRahul, satish, satishListings[1], 8.0, 650, 4, 'Inverter battery setup completed cleanly. Good work.', 10);
  await createCompletedBookingWithLedger(consumerPriya, sunita, sunitaListings[0], 8.0, 799, 5, 'Sunita did a fabulous job on our kitchen chimney and countertops. Sparkly clean!', 2);
  await createCompletedBookingWithLedger(consumerAmit, sunita, sunitaListings[1], 8.0, 599, 5, 'Bathroom scale removal was 100% effective. Best cooperative service experience.', 7);
  await createCompletedBookingWithLedger(consumerRahul, deepak, deepakListings[0], 10.0, 399, 5, 'Deepak in Pune replaced our kitchen tap valve effortlessly.', 4);
  await createCompletedBookingWithLedger(consumerPriya, kavita, kavitaListings[0], 10.0, 600, 5, 'Kavita cooked an authentic Maharashtrian feast for our guests. Very hygienic and tasty!', 6);

  // Active / In-Progress & Requested Bookings for Live Demo
  const activeBooking1 = await prisma.booking.create({
    data: {
      consumerId: consumerRahul.id,
      providerId: ramesh.profile.id,
      listingId: rameshListings[0].id,
      status: BookingStatus.IN_PROGRESS,
      scheduledAt: new Date(),
      totalAmount: 450,
      serviceAddress: 'Block C-12, Hauz Khas Enclave, New Delhi',
      notes: 'Water dripping under sink counter.',
    },
  });

  const requestedBooking1 = await prisma.booking.create({
    data: {
      consumerId: consumerPriya.id,
      providerId: ramesh.profile.id,
      listingId: rameshListings[1].id,
      status: BookingStatus.REQUESTED,
      scheduledAt: new Date(Date.now() + 4 * 3600 * 1000),
      totalAmount: 850,
      serviceAddress: 'Tower 4, Green Glen Heights, Saket, New Delhi',
      notes: 'Need water booster pump installed on terrace.',
    },
  });

  const requestedBooking2 = await prisma.booking.create({
    data: {
      consumerId: consumerAmit.id,
      providerId: satish.profile.id,
      listingId: satishListings[0].id,
      status: BookingStatus.REQUESTED,
      scheduledAt: new Date(Date.now() + 2 * 3600 * 1000),
      totalAmount: 500,
      serviceAddress: 'House 88, Kalkaji Extension, New Delhi',
      notes: 'Main hallway switchboard sparked.',
    },
  });

  console.log('✅ Seed Bookings, Ratings and Ledger Entries populated');

  // 7. Create Governance Polls (The Core Differentiator!)
  const poll1 = await prisma.governancePoll.create({
    data: {
      cooperativeId: coopDelhi.id,
      question: 'Should DSSS allocate ₹60,000 from the Welfare Fund for Monsoon Health & Accident Insurance for all active member workers?',
      description: 'The executive committee proposes 100% cashless emergency cover for monsoon injuries and hospitalizations.',
      category: 'WELFARE_BUDGET',
      status: PollStatus.OPEN,
      options: [
        { id: 'opt_yes', text: 'Yes, Approve 100% Cashless Monsoon Cover (₹60k Allocation)', voteCount: 28 },
        { id: 'opt_partial', text: 'Approve 50% Co-pay Cover (₹30k Allocation)', voteCount: 8 },
        { id: 'opt_no', text: 'Defer to Annual General Meeting', voteCount: 3 },
      ],
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    },
  });

  const poll2 = await prisma.governancePoll.create({
    data: {
      cooperativeId: coopDelhi.id,
      question: 'Vote on Commission Split Adjustment for Q3: Reduce Cooperative Commission from 8% to 6%?',
      description: 'Given our surplus welfare fund balance, members are voting whether to lower commission to maximize direct provider take-home earnings.',
      category: 'COMMISSION_RATE',
      status: PollStatus.OPEN,
      options: [
        { id: 'opt_lower', text: 'Reduce Commission to 6% (Providers keep 92%)', voteCount: 34 },
        { id: 'opt_maintain', text: 'Keep at 8% (Provider keeps 90%, 6% to Welfare Fund)', voteCount: 11 },
      ],
      expiresAt: new Date(Date.now() + 10 * 24 * 3600 * 1000),
    },
  });

  // Seed votes for poll 1 and poll 2
  await prisma.pollVote.create({
    data: {
      pollId: poll1.id,
      providerId: ramesh.profile.id,
      choice: 'opt_yes',
    },
  });

  await prisma.pollVote.create({
    data: {
      pollId: poll1.id,
      providerId: satish.profile.id,
      choice: 'opt_yes',
    },
  });

  await prisma.pollVote.create({
    data: {
      pollId: poll1.id,
      providerId: sunita.profile.id,
      choice: 'opt_yes',
    },
  });

  console.log('✅ Governance Polls and Democratic Votes created');

  // 8. Create Grievance Ticket sample
  await prisma.grievanceTicket.create({
    data: {
      raisedById: consumerAmit.id,
      description: 'Provider was delayed by 15 minutes due to heavy rain. Resolved amicably on arrival.',
      status: GrievanceStatus.RESOLVED,
      resolutionNotes: 'Cooperative coordinator spoke with both parties; verified delay reason was traffic waterlogging.',
      resolvedAt: new Date(),
    },
  });

  console.log('🎉 SahakarConnect database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
