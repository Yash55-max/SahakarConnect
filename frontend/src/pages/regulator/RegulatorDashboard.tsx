import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Landmark,
  Building2,
  Users,
  Coins,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  MapPin,
  ExternalLink,
  Receipt,
  HeartHandshake,
} from 'lucide-react';

export const RegulatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [overviewData, setOverviewData] = useState<any>(null);
  const [selectedCoopDetail, setSelectedCoopDetail] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRegulatorData = async () => {
    try {
      const data = await api.getRegulatorOverview();
      setOverviewData(data);
    } catch (e) {
      console.error('Failed to load regulator data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegulatorData();
  }, []);

  const handleOpenDetail = async (coopId: string) => {
    try {
      const detail = await api.getRegulatorCoopDetail(coopId);
      setSelectedCoopDetail(detail);
      setIsDetailModalOpen(true);
    } catch (e) {
      alert('Failed to load cooperative drill-down');
    }
  };

  const summary = overviewData?.summary;
  const cooperatives = overviewData?.cooperatives || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Regulator Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white border border-blue-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-400/30">
              Government Regulatory Portal
            </span>
            <span className="text-xs text-slate-400">Ministry of Cooperation (Govt. of India)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            National Primary Service Cooperatives (PSCS) Registry
          </h1>
          <p className="text-xs text-slate-300">
            Real-time compliance monitoring, democratic governance audits & welfare fund reserve tracking across all states.
          </p>
        </div>

        <div className="bg-slate-800/90 px-4 py-3 rounded-2xl border border-slate-700 text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Auditor</span>
          <p className="text-sm font-bold text-white">{user?.name || 'Dr. Rajeshwari Nair'}</p>
          <p className="text-[10px] text-blue-400">Joint Registrar of Cooperative Societies</p>
        </div>
      </div>

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cooperatives */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Registered Societies</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{summary?.totalCooperatives || 0}</p>
          <p className="text-[10px] text-blue-700 font-semibold">Delhi, Maharashtra & Karnataka</p>
        </div>

        {/* Total Welfare Funds Accumulated */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>National Welfare Pool</span>
            <HeartHandshake className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            ₹{(summary?.totalWelfareFundAccumulated || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-amber-700 font-semibold">Protected worker emergency reserves</p>
        </div>

        {/* Total Worker Take-Home Volume */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Provider Direct Pay</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            ₹{(summary?.totalProviderEarnings || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-700 font-semibold">
            Gross Volume: ₹{(summary?.totalTransactionVolume || 0).toLocaleString()}
          </p>
        </div>

        {/* Verification Compliance Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>KYC Compliance Rate</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{summary?.verificationRate || 0}%</p>
          <p className="text-[10px] text-purple-700 font-semibold">
            {summary?.verifiedProviders || 0} of {summary?.totalProviders || 0} verified
          </p>
        </div>
      </div>

      {/* State & District Benchmark Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Primary Service Cooperative Societies (PSCS)</h2>
            <p className="text-xs text-slate-500">
              Comparative benchmark across districts for commission rates, member ratings, and welfare reserves
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Cooperative Society</th>
                  <th className="p-4">District / State</th>
                  <th className="p-4">Commission %</th>
                  <th className="p-4 text-amber-700">Welfare Fund Pool</th>
                  <th className="p-4">Active Members</th>
                  <th className="p-4">Avg Worker Rating</th>
                  <th className="p-4">Active Polls</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cooperatives.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{c.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{c.registrationNumber}</p>
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {c.district}, {c.state}
                      </span>
                    </td>
                    <td className="p-4 font-black text-slate-800">{c.commissionRatePercent}%</td>
                    <td className="p-4 font-bold text-amber-700">
                      ₹{c.welfareFundBalance.toLocaleString()}
                    </td>
                    <td className="p-4 font-semibold text-slate-900">
                      {c.verifiedProviders} Verified <span className="text-slate-400">({c.pendingProviders} pending)</span>
                    </td>
                    <td className="p-4 font-bold text-amber-800">★ {c.averageRating}</td>
                    <td className="p-4">
                      <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded text-[10px] border border-purple-200">
                        {c.activePolls} Open
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleOpenDetail(c.id)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                      >
                        <span>Audit Drill-Down</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Drill-down Modal */}
      {selectedCoopDetail && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Regulator Audit: ${selectedCoopDetail.cooperative?.name}`}
          subtitle={`Registration: ${selectedCoopDetail.cooperative?.registrationNumber} • District: ${selectedCoopDetail.cooperative?.district}`}
          maxWidth="xl"
        >
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 font-medium">Welfare Balance:</span>
                <p className="text-base font-bold text-amber-700">
                  ₹{selectedCoopDetail.cooperative?.welfareFundBalance.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Commission Split:</span>
                <p className="text-base font-bold text-slate-800">
                  {selectedCoopDetail.cooperative?.commissionRatePercent}%
                </p>
              </div>
            </div>

            {/* Disbursements */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Verified Welfare Disbursements</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {selectedCoopDetail.cooperative?.welfareDisbursements?.map((d: any) => (
                  <div key={d.id} className="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{d.title}</p>
                      <p className="text-[10px] text-slate-500">Beneficiary: {d.beneficiary} ({d.category})</p>
                    </div>
                    <span className="font-bold text-amber-700">₹{d.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
