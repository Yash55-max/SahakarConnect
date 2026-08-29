import { Role } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('sahakar_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Auth API
  async login(email: string, password: string = 'password123') {
    return this.request<{
      message: string;
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: Role;
    cooperativeId?: string;
    skills?: string[];
    address?: string;
  }) {
    return this.request<{
      message: string;
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async getDemoAccounts() {
    return this.request<{
      users: any[];
      cooperatives: any[];
      defaultPassword: string;
    }>('/demo-accounts');
  }

  // Consumer API
  async getServices(params?: { category?: string; search?: string; district?: string; coopId?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.district) query.append('district', params.district);
    if (params?.coopId) query.append('coopId', params.coopId);

    return this.request<{
      categories: any[];
      listings: any[];
    }>(`/services?${query.toString()}`);
  }

  async createBooking(data: {
    listingId: string;
    scheduledAt: string;
    serviceAddress: string;
    notes?: string;
  }) {
    return this.request<{
      message: string;
      booking: any;
    }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyBookings() {
    return this.request<any[]>('/bookings/my');
  }

  async getBookingById(id: string) {
    return this.request<any>(`/bookings/${id}`);
  }

  async rateBooking(id: string, stars: number, comment?: string) {
    return this.request<any>(`/bookings/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ stars, comment }),
    });
  }

  async payBooking(id: string, paymentMethod: string = 'UPI_MOCK') {
    return this.request<{ message: string; ledger: any }>(`/bookings/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod }),
    });
  }

  async fileGrievance(data: { bookingId?: string; description: string }) {
    return this.request<any>('/grievances', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Provider API
  async getProviderProfile() {
    return this.request<{
      profile: any;
      stats: {
        totalJobs: number;
        completedJobs: number;
        totalEarnings: number;
        totalWelfareContributed: number;
        rating: number;
        ratingCount: number;
      };
    }>('/providers/me');
  }

  async toggleAvailability(available?: boolean) {
    return this.request<{ message: string; available: boolean }>('/providers/me/availability', {
      method: 'PATCH',
      body: JSON.stringify({ available }),
    });
  }

  async getProviderJobs() {
    return this.request<any[]>('/providers/me/jobs');
  }

  async acceptJob(jobId: string) {
    return this.request<any>(`/providers/jobs/${jobId}/accept`, {
      method: 'PATCH',
    });
  }

  async rejectJob(jobId: string) {
    return this.request<any>(`/providers/jobs/${jobId}/reject`, {
      method: 'PATCH',
    });
  }

  async startJob(jobId: string) {
    return this.request<any>(`/providers/jobs/${jobId}/start`, {
      method: 'PATCH',
    });
  }

  async completeJob(jobId: string) {
    return this.request<{ message: string; booking: any; ledger: any }>(`/providers/jobs/${jobId}/complete`, {
      method: 'PATCH',
    });
  }

  async getProviderEarnings() {
    return this.request<{
      cooperative: any;
      summary: any;
      ledgerEntries: any[];
    }>('/providers/me/earnings');
  }

  // Cooperative Admin & Governance API
  async getCoopProviders(coopId: string, status?: string) {
    const url = status ? `/coop/${coopId}/providers?status=${status}` : `/coop/${coopId}/providers`;
    return this.request<any[]>(url);
  }

  async verifyProvider(coopId: string, providerId: string, status: 'VERIFIED' | 'REJECTED') {
    return this.request<any>(`/coop/${coopId}/providers/${providerId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getCoopLedger(coopId: string) {
    return this.request<{
      cooperative: any;
      summary: any;
      ledgerEntries: any[];
    }>(`/coop/${coopId}/ledger`);
  }

  async getWelfareFund(coopId: string) {
    return this.request<{
      cooperativeId: string;
      name: string;
      welfareFundBalance: number;
      totalDisbursed: number;
      disbursements: any[];
    }>(`/coop/${coopId}/welfare-fund`);
  }

  async getCoopPolls(coopId: string) {
    return this.request<any[]>(`/coop/${coopId}/polls`);
  }

  async createPoll(coopId: string, data: {
    question: string;
    description?: string;
    category?: string;
    options: Array<{ id: string; text: string }>;
    expiresInDays?: number;
  }) {
    return this.request<any>(`/coop/${coopId}/polls`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async voteOnPoll(pollId: string, choice: string) {
    return this.request<any>(`/coop/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ choice }),
    });
  }

  // Regulator API
  async getRegulatorOverview() {
    return this.request<{
      summary: any;
      cooperatives: any[];
    }>('/regulator/overview');
  }

  async getRegulatorCoopDetail(coopId: string) {
    return this.request<{
      cooperative: any;
      ledgers: any[];
    }>(`/regulator/cooperatives/${coopId}`);
  }
}

export const api = new ApiClient();
export default api;
