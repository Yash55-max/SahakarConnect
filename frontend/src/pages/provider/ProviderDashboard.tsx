import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Booking, GovernancePoll } from '../../types';
import api from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import { StarRating } from '../../components/ui/StarRating';
import { SplitVisualizer } from '../../components/ui/SplitVisualizer';
import {
  Power,
  CheckCircle2,
  XCircle,
  Play,
  CheckCheck,
  TrendingUp,
  HeartHandshake,
  Vote,
  Calendar,
  MapPin,
  Clock,
  Phone,
  Radio,
  Coins,
  Receipt,
  UserCheck,
} from 'lucide-react';

export const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const { lastEvent } = useSocket();

  const [profileData, setProfileData] = useState<any>(null);
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [earningsData, setEarningsData] = useState<any>(null);
  const [polls, setPolls] = useState<GovernancePoll[]>([]);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchProviderData = async () => {
    try {
      const [pRes, jRes, eRes] = await Promise.all([
        api.getProviderProfile(),
        api.getProviderJobs(),
        api.getProviderEarnings(),
      ]);

      setProfileData(pRes);
      setJobs(jRes || []);
      setEarningsData(eRes);
      setIsAvailable(pRes?.profile?.available ?? true);

      // Fetch polls for provider's cooperative
      if (pRes?.profile?.cooperativeId) {
        const pollRes = await api.getCoopPolls(pRes.profile.cooperativeId);
        setPolls(pollRes || []);
      }
    } catch (e) {
      console.error('Failed to load provider data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
  }, [user]);

  // Real-time socket updates for new jobs or status changes
  useEffect(() => {
    if (
      lastEvent?.eventName === 'booking:newRequest' ||
      lastEvent?.eventName === 'booking:statusChanged' ||
      lastEvent?.eventName === 'poll:voteUpdate'
    ) {
      fetchProviderData();
    }
  }, [lastEvent]);

  const handleToggleAvailability = async () => {
    try {
      const res = await api.toggleAvailability(!isAvailable);
      setIsAvailable(res.available);
    } catch (e: any) {
      alert(e.message || 'Failed to update availability');
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    setActionLoadingId(jobId);
    try {
      await api.acceptJob(jobId);
      await fetchProviderData();
    } catch (e: any) {
      alert(e.message || 'Failed to accept job');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectJob = async (jobId: string) => {
    setActionLoadingId(jobId);
    try {
      await api.rejectJob(jobId);
      await fetchProviderData();
    } catch (e: any) {
      alert(e.message || 'Failed to reject job');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartJob = async (jobId: string) => {
    setActionLoadingId(jobId);
    try {
      await api.startJob(jobId);
      await fetchProviderData();
    } catch (e: any) {
      alert(e.message || 'Failed to start job');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompleteJob = async (jobId: string) => {
    setActionLoadingId(jobId);
    try {
      await api.completeJob(jobId);
      await fetchProviderData();
    } catch (e: any) {
      alert(e.message || 'Failed to complete job');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleVote = async (pollId: string, choice: string) => {
    try {
      await api.voteOnPoll(pollId, choice);
      await fetchProviderData();
    } catch (e: any) {
      alert(e.message || 'Failed to cast vote');
    }
  };

  const requestedJobs = jobs.filter((j) => j.status === 'REQUESTED');
  const activeJobs = jobs.filter((j) => j.status === 'ACCEPTED' || j.status === 'IN_PROGRESS');
  const completedJobs = jobs.filter((j) => j.status === 'COMPLETED');

  const profile = profileData?.profile;
  const stats = profileData?.stats;
  const coop = profile?.cooperative;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Provider Identity Card */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-emerald-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {profile?.user?.avatarUrl ? (
            <img
              src={profile.user.avatarUrl}
              alt={profile.user.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-400 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white font-extrabold text-2xl flex items-center justify-center">
              {profile?.user?.name?.charAt(0) || 'P'}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-100">{profile?.user?.name || user?.name}</h1>
              <Badge variant={profile?.verified ? 'green' : 'amber'} size="sm">
                {profile?.verified ? 'Verified Coop Member' : 'KYC Pending'}
              </Badge>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              Member of <strong>{coop?.name || 'Delhi Shramik Sahakari Samiti'}</strong>
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <StarRating rating={stats?.rating || 4.9} showNumber count={stats?.ratingCount || 0} size="sm" />
              <span>•</span>
              <span>{stats?.completedJobs || 0} Jobs Completed</span>
            </div>
          </div>
        </div>

        {/* Availability Toggle Switch */}
        <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 flex items-center gap-4 shadow-inner">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Duty Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-sm font-bold text-white">
                {isAvailable ? 'Available for Jobs' : 'Offline / On Leave'}
              </span>
            </div>
          </div>

          <button
            onClick={handleToggleAvailability}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
              isAvailable
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
            }`}
          >
            <Power className="w-4 h-4" />
            {isAvailable ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Take-Home Earnings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Direct Take-Home</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            ₹{(earningsData?.summary?.totalProviderShare || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-700 font-semibold">
            {earningsData?.summary?.takeHomePercent || 90}% of Gross Value (0% platform gouging)
          </p>
        </div>

        {/* Welfare Fund Contributed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Welfare Fund Built</span>
            <HeartHandshake className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            ₹{(earningsData?.summary?.totalWelfareShare || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-amber-700 font-semibold">
            Your emergency health & tool safety pool
          </p>
        </div>

        {/* Active Jobs */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active & Queued</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {activeJobs.length + requestedJobs.length}
          </p>
          <p className="text-[10px] text-blue-700 font-semibold">
            {requestedJobs.length} pending your confirmation
          </p>
        </div>

        {/* Coop Commission Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Coop Society Rate</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {coop?.commissionRatePercent || 8}%
          </p>
          <p className="text-[10px] text-purple-700 font-semibold">
            Decided democratically by members
          </p>
        </div>
      </div>

      {/* Incoming Job Requests (Real-Time Socket Alerts) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Incoming Job Requests</h2>
            {requestedJobs.length > 0 && (
              <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center animate-bounce">
                {requestedJobs.length}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" /> Live Socket Inbox
          </span>
        </div>

        {requestedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 text-slate-500 text-xs">
            No incoming pending job requests. Keep duty status <strong>Online</strong> to receive new requests.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requestedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-amber-50/60 rounded-2xl p-5 border-2 border-amber-300 shadow-md space-y-3 animate-slide-in"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      New Booking Request
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {job.listing?.title}
                    </h3>
                  </div>
                  <span className="text-lg font-black text-slate-900">₹{job.totalAmount}</span>
                </div>

                <div className="text-xs text-slate-700 space-y-1 bg-white/80 p-3 rounded-xl border border-amber-200">
                  <p className="font-semibold text-slate-900">Consumer: {job.consumer?.name}</p>
                  <p className="flex items-center gap-1.5 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    Scheduled: {new Date(job.scheduledAt).toLocaleString()}
                  </p>
                  <p className="flex items-start gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    {job.serviceAddress}
                  </p>
                  {job.notes && (
                    <p className="text-[11px] text-slate-500 italic">"{job.notes}"</p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAcceptJob(job.id)}
                    disabled={actionLoadingId === job.id}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {actionLoadingId === job.id ? 'Accepting...' : 'Accept Job'}
                  </button>

                  <button
                    onClick={() => handleRejectJob(job.id)}
                    disabled={actionLoadingId === job.id}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Jobs in Progress */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Active & In-Progress Jobs</h2>

        {activeJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 text-slate-500 text-xs">
            No active jobs currently in execution.
          </div>
        ) : (
          <div className="space-y-4">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">{job.listing?.title}</h3>
                    <Badge variant={job.status === 'IN_PROGRESS' ? 'purple' : 'blue'} size="sm">
                      {job.status === 'IN_PROGRESS' ? 'Worker On-Site' : 'Accepted / En Route'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      Client: <strong>{job.consumer?.name}</strong>
                    </p>
                    {job.consumer?.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`tel:${job.consumer.phone}`} className="text-emerald-700 font-semibold hover:underline">
                          {job.consumer.phone}
                        </a>
                      </p>
                    )}
                    <p className="flex items-start gap-1.5 sm:col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{job.serviceAddress}</span>
                    </p>
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {job.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleStartJob(job.id)}
                      disabled={actionLoadingId === job.id}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-4 h-4" />
                      {actionLoadingId === job.id ? 'Updating...' : 'Start Job / On-Site'}
                    </button>
                  )}

                  {job.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleCompleteJob(job.id)}
                      disabled={actionLoadingId === job.id}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                    >
                      <CheckCheck className="w-4 h-4" />
                      {actionLoadingId === job.id ? 'Settling Split...' : 'Mark Job Completed'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Member Governance Polls (The Core Differentiator!) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Vote className="w-5 h-5 text-emerald-600" /> Cooperative Member Governance
            </h2>
            <p className="text-xs text-slate-500">
              One-Worker-One-Vote: Cast your vote on commission rates and welfare fund deployment
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {poll.category.replace('_', ' ')}
                </span>
                <Badge variant="green" size="sm">Open Member Referendum</Badge>
              </div>

              <h3 className="font-bold text-sm text-slate-900 leading-snug">
                {poll.question}
              </h3>
              {poll.description && (
                <p className="text-xs text-slate-500 leading-relaxed">{poll.description}</p>
              )}

              {/* Poll Options & Vote Buttons */}
              <div className="space-y-2.5 pt-2">
                {poll.options.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1">
                      <span className="font-semibold text-slate-800 block">{opt.text}</span>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${opt.percentage || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-500 text-[11px]">
                        {opt.voteCount} votes ({opt.percentage || 0}%)
                      </span>
                      <button
                        onClick={() => handleVote(poll.id, opt.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-transform active:scale-95"
                      >
                        Vote
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Completed Jobs & Earnings Ledger Breakdown */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-emerald-600" /> Completed Jobs & Transparent Ledger
        </h2>

        {completedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 text-slate-500 text-xs">
            No completed jobs yet. Completed jobs will generate transparent ledger split receipts here.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Service & Date</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Total Billed</th>
                    <th className="p-4 text-emerald-700">Your Take-Home (90%)</th>
                    <th className="p-4 text-amber-700">Coop Welfare (8%)</th>
                    <th className="p-4 text-blue-700">Tech Fee (2%)</th>
                    <th className="p-4">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedJobs.map((job) => {
                    const l = job.ledgerEntry;
                    return (
                      <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{job.listing?.title}</p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(job.completedAt || job.scheduledAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-4 font-medium text-slate-700">{job.consumer?.name}</td>
                        <td className="p-4 font-bold text-slate-900">₹{job.totalAmount}</td>
                        <td className="p-4 font-bold text-emerald-700">
                          ₹{l?.providerShare || Math.round(job.totalAmount * 0.9)}
                        </td>
                        <td className="p-4 font-semibold text-amber-700">
                          ₹{l?.cooperativeFundShare || Math.round(job.totalAmount * 0.08)}
                        </td>
                        <td className="p-4 text-slate-500">
                          ₹{l?.platformShare || Math.round(job.totalAmount * 0.02)}
                        </td>
                        <td className="p-4">
                          {job.rating ? (
                            <StarRating rating={job.rating.stars} size="sm" showNumber />
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
