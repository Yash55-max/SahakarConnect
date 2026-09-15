import { prisma } from '../lib/prisma';
import * as h3 from 'h3-js';

export interface ProviderCandidate {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  cooperativeId: string;
  membershipClass: string;
  skills: string[];
  nsqfLevel: number;
  ratingAverage: number;
  isAvailable: boolean;
  isAadhaarVerified: boolean;
  isPoliceClearVerified: boolean;
  h3IndexRes8: string | null;
  gridDistance: number;
}

/**
 * Finds and ranks available, verified cooperative providers near a consumer location
 * using Uber H3 Resolution-8 spatial grid disks.
 */
export async function findNearbyProviders(
  cooperativeId: string,
  serviceCategoryId: string,
  consumerH3Index: string,
  kRingRadius: number = 2
): Promise<ProviderCandidate[]> {
  // 1. Resolve category name if ID provided
  let categoryName = serviceCategoryId;
  const category = await prisma.serviceCategory.findUnique({
    where: { id: serviceCategoryId },
  });
  if (category) {
    categoryName = category.name;
  }

  // 2. Compute the H3 Resolution-8 spatial disk
  let nearbyCells: string[] = [];
  try {
    nearbyCells = h3.gridDisk(consumerH3Index, kRingRadius);
  } catch (err) {
    console.warn(`[Dispatch] Invalid consumer H3 index: ${consumerH3Index}, falling back to k-ring 0`);
    nearbyCells = [consumerH3Index];
  }

  // 3. Fetch candidate providers in this cooperative who are available and Aadhaar verified
  const candidates = await prisma.providerProfile.findMany({
    where: {
      cooperativeId,
      isAvailable: true,
      isAadhaarVerified: true,
    },
    include: {
      user: {
        select: {
          name: true,
          phone: true,
          email: true,
        },
      },
    },
  });

  // 4. Filter by skill match and compute spatial distance
  const filteredCandidates: ProviderCandidate[] = [];

  for (const p of candidates) {
    // Check if provider skills match the service category
    const matchesSkill = p.skills.some((skill) => {
      const s = skill.toLowerCase();
      const c = categoryName.toLowerCase();
      return (
        s.includes(c) ||
        c.includes(s) ||
        (c.includes('plumb') && s.includes('plumb')) ||
        (c.includes('electr') && s.includes('electr')) ||
        (c.includes('carpent') && s.includes('carpent')) ||
        (c.includes('appliance') && (s.includes('appliance') || s.includes('repair')))
      );
    });

    if (!matchesSkill) {
      continue;
    }

    // Calculate H3 grid distance
    let distance = 999;
    if (p.h3IndexRes8) {
      try {
        distance = h3.gridDistance(consumerH3Index, p.h3IndexRes8);
      } catch {
        distance = nearbyCells.includes(p.h3IndexRes8) ? 1 : 999;
      }
    }

    // Include if within kRingRadius or if fallback is required
    filteredCandidates.push({
      id: p.id,
      userId: p.userId,
      name: p.user.name,
      phone: p.user.phone,
      email: p.user.email,
      cooperativeId: p.cooperativeId,
      membershipClass: p.membershipClass,
      skills: p.skills,
      nsqfLevel: p.nsqfLevel,
      ratingAverage: p.ratingAverage,
      isAvailable: p.isAvailable,
      isAadhaarVerified: p.isAadhaarVerified,
      isPoliceClearVerified: p.isPoliceClearVerified,
      h3IndexRes8: p.h3IndexRes8,
      gridDistance: distance,
    });
  }

  // 5. Rank candidates:
  // Primary: Lowest spatial grid distance
  // Secondary: Highest NSQF skilling certification level (5 -> 1)
  // Tertiary: Highest average customer rating
  filteredCandidates.sort((a, b) => {
    if (a.gridDistance !== b.gridDistance) {
      return a.gridDistance - b.gridDistance;
    }
    if (b.nsqfLevel !== a.nsqfLevel) {
      return b.nsqfLevel - a.nsqfLevel;
    }
    return b.ratingAverage - a.ratingAverage;
  });

  return filteredCandidates;
}
