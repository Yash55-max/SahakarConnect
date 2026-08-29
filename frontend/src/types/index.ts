export type Role = 'CONSUMER' | 'PROVIDER' | 'COOP_ADMIN' | 'REGULATOR';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type BookingStatus = 'REQUESTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'SETTLED';

export type PollStatus = 'OPEN' | 'CLOSED';

export type GrievanceStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatarUrl?: string;
  providerProfile?: ProviderProfile;
}

export interface Cooperative {
  id: string;
  name: string;
  registrationNumber: string;
  district: string;
  state: string;
  commissionRatePercent: number;
  welfareFundBalance: number;
  totalMembers: number;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  user?: User;
  cooperativeId: string;
  cooperative?: Cooperative;
  skills: string[];
  verified: boolean;
  verificationStatus: VerificationStatus;
  rating: number;
  ratingCount: number;
  available: boolean;
  lat: number;
  lng: number;
  address?: string;
  aadharMockNumber?: string;
  listings?: ServiceListing[];
  _count?: {
    jobs: number;
    ratingsReceived: number;
  };
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  _count?: {
    listings: number;
  };
}

export interface ServiceListing {
  id: string;
  categoryId: string;
  category?: ServiceCategory;
  providerId: string;
  provider?: ProviderProfile;
  title: string;
  description: string;
  basePrice: number;
  unit: string;
}

export interface PaymentLedgerEntry {
  id: string;
  bookingId: string;
  totalAmount: number;
  providerShare: number;
  cooperativeFundShare: number;
  platformShare: number;
  status: PaymentStatus;
  paymentMethod: string;
  transactionRef: string;
  createdAt: string;
}

export interface Rating {
  id: string;
  bookingId: string;
  consumerId: string;
  consumer?: { name: string };
  providerId: string;
  stars: number;
  comment?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  consumerId: string;
  consumer?: User;
  providerId: string;
  provider?: ProviderProfile;
  listingId: string;
  listing?: ServiceListing;
  status: BookingStatus;
  scheduledAt: string;
  totalAmount: number;
  serviceAddress?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  ledgerEntry?: PaymentLedgerEntry;
  rating?: Rating;
}

export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  percentage?: number;
}

export interface GovernancePoll {
  id: string;
  cooperativeId: string;
  question: string;
  description?: string;
  options: PollOption[];
  status: PollStatus;
  category: string;
  expiresAt?: string;
  createdAt: string;
  totalVotes?: number;
  votes?: Array<{
    id: string;
    choice: string;
    providerId: string;
    provider?: { user: { name: string } };
  }>;
}

export interface WelfareDisbursement {
  id: string;
  cooperativeId: string;
  title: string;
  beneficiary: string;
  amount: number;
  category: string;
  disbursedAt: string;
}

export interface GrievanceTicket {
  id: string;
  raisedById: string;
  bookingId?: string;
  description: string;
  status: GrievanceStatus;
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}
