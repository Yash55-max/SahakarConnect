import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { ProviderProfile, GovernancePoll, WelfareDisbursement } from '../../types';
import api from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SplitVisualizer } from '../../components/ui/SplitVisualizer';
import {
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Coins,
  HeartHandshake,
  Vote,
  PlusCircle,
  TrendingUp,
  Receipt,
  FileCheck2,
  Search,
  Filter,
  Check,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { lastEvent } = useSocket();

  // Delhi Coop is default active coop for demo
  const [coopId, setCoopId] = useState<string>('6586af1d-12d0-455c-b107-bac524adcc88');
  const [allCoops, setAllCoops] = useState<any[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [welfareData, setWelfareData] = useState<any>(null);
  const [polls, setPolls] = useState<GovernancePoll[]>([]);
  const [activeTab, setActiveTab] = useState<'verification' | 'ledger' | 'welfare' | 'polls'>('verification');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // New Poll Modal state
  const [isPollModalOpen, setIsPollModalOpen] = useState<boolean>(false);
  const [newPollQuestion, setNewPollQuestion] = useState<string>('');
  const [newPollDesc, setNewPollDesc] = useState<string>('');
  const [newPollCategory, setNewPollCategory] = useState<string>('COMMISSION_RATE');
  const [pollOption1, setPollOption1] = useState<string>('Approve proposed change');
  const [pollOption2, setPollOption2] = useState<string>('Maintain current rate / Reject');
  const [isSubmittingPoll, setIsSubmittingPoll] = useState<boolean>(false);

  // Verification action state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      // Get all demo cooperatives to populate dropdown
      const demoRes = await api.getDemoAccounts();
      setAllCoops(demoRes.cooperatives || []);
      const targetCoopId = coopId || demoRes.cooperatives[0]?.id;
      if (targetCoopId) setCoopId(targetCoopId);

      const [provRes, ledgRes, welfRes, pollRes] = await Promise.all([
        api.getCoopProviders(targetCoopId),
        api.getCoopLedger(targetCoopId),
        api.getWelfareFund(targetCoopId),
        api.getCoopPolls(targetCoopId),
      ]);

      setProviders(provRes || []);
      setLedgerData(ledgRes);
      setWelfareData(welfRes);
      setPolls(pollRes || []);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [coopId, user]);

  // Real-time updates for votes and status
  useEffect(() => {
    if (lastEvent?.eventName === 'poll:voteUpdate' || lastEvent?.eventName === 'booking:statusChanged') {
      fetchAdminData();
    }
  }, [lastEvent]);

  const handleVerify = async (providerId: string, status: 'VERIFIED' | 'REJECTED') => {
    setActionLoadingId(providerId);
    try {
      await api.verifyProvider(coopId, providerId, status);
      await fetchAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to update verification status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollQuestion || !pollOption1 || !pollOption2) return;
    setIsSubmittingPoll(true);
    try {
      await api.createPoll(coopId, {
        question: newPollQuestion,
        description: newPollDesc,
        category: newPollCategory,
        options: [
          { id: 'opt_1', text: pollOption1 },
          { id: 'opt_2', text: pollOption2 },
        ],
        expiresInDays: 7,
      });
      await fetchAdminData();
      setIsPollModalOpen(false);
      setNewPollQuestion('');
      setNewPollDesc('');
    } catch (e: any) {
      alert(e.message || 'Failed to create poll');
    } finally {
      setIsSubmittingPoll(false);
    }
  };

  const pendingProviders = providers.filter((p) => p.verificationStatus === 'PENDING');
  const verifiedProviders = providers.filter((p) => p.verificationStatus === 'VERIFIED');

  const coopName = ledgerData?.cooperative?.name || 'Primary Service Cooperative Society';
  const commissionRate = ledgerData?.cooperative?.commissionRatePercent || 8;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white border border-amber-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-400/30">
              Cooperative Administration Portal
            </span>
            <span className="text-xs text-slate-400">SIH26089 Multi-Stakeholder Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">{coopName}</h1>
          <p className="text-xs text-slate-300">
            Reg. No: <strong>{ledgerData?.cooperative?.registrationNumber || 'DL/COOP/2021/8842'}</strong> • District: {ledgerData?.cooperative?.district}, {ledgerData?.cooperative?.state}
          </p>
        </div>

        {/* Cooperative Selector for Multi-Society Simulation */}
        <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700 space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Select Cooperative Society
          </label>
          <select
            value={coopId}
            onChange={(e) => setCoopId(e.target.value)}
            className="bg-slate-900 text-white rounded-xl px-3 py-2 text-xs border border-slate-700 focus:ring-2 focus:ring-amber-500"
          >
            {allCoops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Welfare Fund Balance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Welfare Fund Pool</span>
            <HeartHandshake className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            ₹{(welfareData?.welfareFundBalance || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-amber-700 font-semibold">
            ₹{(welfareData?.totalDisbursed || 0).toLocaleString()} disbursed for health & tools
          </p>
        </div>

        {/* Total Verified Members */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Registered Members</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {verifiedProviders.length} Active
          </p>
          <p className="text-[10px] text-emerald-700 font-semibold">
            {pendingProviders.length} pending KYC verification
          </p>
        </div>

        {/* Total Society Volume */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Gross Platform Volume</span>
            <Coins className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            ₹{(ledgerData?.summary?.totalGross || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-blue-700 font-semibold">
            {ledgerData?.summary?.totalTransactions || 0} completed bookings
          </p>
        </div>

        {/* Commission Rate & Democracy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Commission Split</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{commissionRate}%</p>
          <p className="text-[10px] text-purple-700 font-semibold">
            {100 - commissionRate}% Provider • {commissionRate - 2}% Welfare • 2% Tech
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'verification'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Provider Verification ({pendingProviders.length})
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'ledger'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Transparent Split Ledger
        </button>

        <button
          onClick={() => setActiveTab('welfare')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'welfare'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          Welfare Fund & Aid
        </button>

        <button
          onClick={() => setActiveTab('polls')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'polls'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Vote className="w-4 h-4" />
          Member Governance Polls ({polls.length})
        </button>
      </div>

      {/* Tab 1: Provider Verification Queue */}
      {activeTab === 'verification' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Provider KYC & Onboarding Queue</h2>
              <p className="text-xs text-slate-500">
                Primary cooperative societies verify local worker credentials, identity, and trade skills.
              </p>
            </div>
          </div>

          {pendingProviders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-xs text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="font-bold text-slate-800">All Provider Applications Processed</p>
              <p>No new verification requests pending in queue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingProviders.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border-2 border-amber-200 p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {p.user?.avatarUrl ? (
                        <img
                          src={p.user.avatarUrl}
                          alt={p.user.name}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-400"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-amber-700 text-white font-bold flex items-center justify-center">
                          {p.user?.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{p.user?.name}</h3>
                        <p className="text-xs text-slate-500">{p.address || 'Delhi NCR'}</p>
                        <p className="text-[11px] text-slate-500 font-mono">Mock Aadhaar: {p.aadharMockNumber}</p>
                      </div>
                    </div>
                    <Badge variant="amber" size="sm">KYC Pending</Badge>
                  </div>

                  {/* Skills */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Declared Trade Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {p.skills.map((s, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleVerify(p.id, 'VERIFIED')}
                      disabled={actionLoadingId === p.id}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {actionLoadingId === p.id ? 'Approving...' : 'Approve & Verify Member'}
                    </button>

                    <button
                      onClick={() => handleVerify(p.id, 'REJECTED')}
                      disabled={actionLoadingId === p.id}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Verified Members List */}
          <div className="pt-6">
            <h3 className="text-base font-bold text-slate-900 mb-3">Active Verified Providers ({verifiedProviders.length})</h3>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-4">Provider</th>
                      <th className="p-4">Phone / Contact</th>
                      <th className="p-4">Skills</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {verifiedProviders.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          {p.user?.name}
                        </td>
                        <td className="p-4 text-slate-600">{p.user?.phone}</td>
                        <td className="p-4 text-slate-600">{p.skills.slice(0, 2).join(', ')}</td>
                        <td className="p-4 font-bold text-amber-700">★ {p.rating} ({p.ratingCount})</td>
                        <td className="p-4">
                          <Badge variant="green" size="sm">Active Member</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: Transparent Split Ledger */}
      {activeTab === 'ledger' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Transparent Revenue-Split Ledger</h2>
              <p className="text-xs text-slate-500">
                Every rupee is deterministically accounted for and verifiable by all cooperative members
              </p>
            </div>
          </div>

          {/* Grand Split Visualizer Banner */}
          <SplitVisualizer
            totalAmount={ledgerData?.summary?.totalGross || 5000}
            providerShare={ledgerData?.summary?.totalProviderShare}
            welfareShare={ledgerData?.summary?.totalWelfareFundShare}
            platformShare={ledgerData?.summary?.totalPlatformShare}
            commissionRatePercent={commissionRate}
            showComparison={true}
          />

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Txn Ref & Date</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Provider</th>
                    <th className="p-4">Gross Billed</th>
                    <th className="p-4 text-emerald-700">Provider Share ({100 - commissionRate}%)</th>
                    <th className="p-4 text-amber-700">Welfare Fund ({commissionRate - 2}%)</th>
                    <th className="p-4 text-blue-700">Platform Fee (2%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerData?.ledgerEntries?.map((entry: any) => (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <p className="font-mono font-bold text-slate-800">{entry.transactionRef}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-4 font-semibold text-slate-900">
                        {entry.booking?.listing?.title}
                      </td>
                      <td className="p-4 text-slate-700">
                        {entry.booking?.provider?.user?.name}
                      </td>
                      <td className="p-4 font-black text-slate-900">₹{entry.totalAmount}</td>
                      <td className="p-4 font-bold text-emerald-700">₹{entry.providerShare}</td>
                      <td className="p-4 font-bold text-amber-700">₹{entry.cooperativeFundShare}</td>
                      <td className="p-4 text-slate-500">₹{entry.platformShare}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Welfare Fund & Disbursements */}
      {activeTab === 'welfare' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Cooperative Welfare & Emergency Fund</h2>
              <p className="text-xs text-slate-500">
                Funded by the {commissionRate - 2}% gig fee split — deployed for member healthcare, tool subsidies, and education.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-md md:col-span-1 space-y-3">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                Current Available Pool
              </span>
              <p className="text-3xl font-black">
                ₹{(welfareData?.welfareFundBalance || 0).toLocaleString()}
              </p>
              <p className="text-xs text-emerald-200">
                100% Cashless Emergency Reserves for {verifiedProviders.length} member families
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs md:col-span-2 space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Fund Disbursement Guidelines</h3>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                <li>Immediate 100% reimbursement for on-duty workplace accident and medical emergencies.</li>
                <li>50% annual tool modernization and safety equipment purchase subsidy.</li>
                <li>Zero-interest emergency family welfare loans decided by peer committee vote.</li>
              </ul>
            </div>
          </div>

          {/* Disbursement History Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-slate-900">Recent Transparent Welfare Disbursements</h3>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-4">Disbursement Title</th>
                      <th className="p-4">Beneficiary Member</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-amber-700">Amount Granted</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {welfareData?.disbursements?.map((d: any) => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">{d.title}</td>
                        <td className="p-4 text-slate-700">{d.beneficiary}</td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[10px]">
                            {d.category}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-amber-700">₹{d.amount.toLocaleString()}</td>
                        <td className="p-4 text-slate-500">
                          {new Date(d.disbursedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 4: Governance Polls & Democratic Referendums */}
      {activeTab === 'polls' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Cooperative Democratic Referendums</h2>
              <p className="text-xs text-slate-500">
                Create and monitor real-time member votes on commission splits and welfare allocations
              </p>
            </div>

            <button
              onClick={() => setIsPollModalOpen(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Create Member Referendum
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {polls.map((poll) => (
              <div
                key={poll.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                    {poll.category.replace('_', ' ')}
                  </span>
                  <Badge variant="green" size="sm">
                    {poll.totalVotes || 0} Votes Cast
                  </Badge>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">
                  {poll.question}
                </h3>
                {poll.description && (
                  <p className="text-xs text-slate-500 leading-relaxed">{poll.description}</p>
                )}

                {/* Vote Progress Bars */}
                <div className="space-y-3 pt-2">
                  {poll.options.map((opt) => (
                    <div key={opt.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800">{opt.text}</span>
                        <span className="text-amber-800 font-bold">
                          {opt.voteCount} votes ({opt.percentage || 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${opt.percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Create Poll Modal */}
      {isPollModalOpen && (
        <Modal
          isOpen={isPollModalOpen}
          onClose={() => !isSubmittingPoll && setIsPollModalOpen(false)}
          title="Create New Member Referendum"
          subtitle={`Submit a democratic proposal to all verified members of ${coopName}`}
        >
          <form onSubmit={handleCreatePoll} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Referendum Category</label>
              <select
                value={newPollCategory}
                onChange={(e) => setNewPollCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
              >
                <option value="COMMISSION_RATE">Commission Rate Adjustment</option>
                <option value="WELFARE_BUDGET">Welfare Fund Budget Allocation</option>
                <option value="GOVERNANCE_RULE">General Governance Rule</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proposal Question</label>
              <textarea
                rows={2}
                required
                value={newPollQuestion}
                onChange={(e) => setNewPollQuestion(e.target.value)}
                placeholder="e.g. Should the cooperative lower commission to 6% for the winter festival season?"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description / Rationale</label>
              <textarea
                rows={2}
                value={newPollDesc}
                onChange={(e) => setNewPollDesc(e.target.value)}
                placeholder="Explain the background and expected impact on member take-home earnings."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Option 1 Text</label>
                <input
                  type="text"
                  required
                  value={pollOption1}
                  onChange={(e) => setPollOption1(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Option 2 Text</label>
                <input
                  type="text"
                  required
                  value={pollOption2}
                  onChange={(e) => setPollOption2(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPollModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingPoll}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                {isSubmittingPoll ? 'Publishing Referendum...' : 'Publish to Members'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
