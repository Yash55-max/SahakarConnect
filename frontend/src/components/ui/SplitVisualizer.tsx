import React from 'react';
import { UserCheck, HeartHandshake, Cpu, ArrowRight } from 'lucide-react';

interface SplitVisualizerProps {
  totalAmount: number;
  commissionRatePercent?: number; // e.g. 10.0
  providerShare?: number;
  welfareShare?: number;
  platformShare?: number;
  showComparison?: boolean;
}

export const SplitVisualizer: React.FC<SplitVisualizerProps> = ({
  totalAmount,
  commissionRatePercent = 10,
  providerShare,
  welfareShare,
  platformShare,
  showComparison = false,
}) => {
  // Calculations if not passed directly
  const platformPercent = 2.0;
  const welfarePercent = Math.max(0, commissionRatePercent - platformPercent);
  const providerPercent = 100 - commissionRatePercent;

  const actualProviderAmount = providerShare ?? Math.round((totalAmount * (providerPercent / 100)) * 100) / 100;
  const actualWelfareAmount = welfareShare ?? Math.round((totalAmount * (welfarePercent / 100)) * 100) / 100;
  const actualPlatformAmount = platformShare ?? Math.round((totalAmount * (platformPercent / 100)) * 100) / 100;

  // Traditional gig app comparison numbers (30% platform fee, 0% welfare, 70% provider)
  const tradProviderAmount = Math.round(totalAmount * 0.70);
  const tradPlatformFee = Math.round(totalAmount * 0.30);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
            Transparent Cooperative Split
          </span>
          <h4 className="text-base font-bold text-slate-100">
            Total Value: ₹{totalAmount.toLocaleString()}
          </h4>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Worker Share</span>
          <p className="text-lg font-extrabold text-emerald-400">{providerPercent}%</p>
        </div>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="w-full h-3 rounded-full bg-slate-800 flex overflow-hidden p-0.5 border border-slate-700">
        <div
          style={{ width: `${providerPercent}%` }}
          className="bg-emerald-500 rounded-l-full transition-all duration-500"
          title={`Provider Take-Home: ${providerPercent}%`}
        />
        <div
          style={{ width: `${welfarePercent}%` }}
          className="bg-amber-500 transition-all duration-500"
          title={`Cooperative Welfare Fund: ${welfarePercent}%`}
        />
        <div
          style={{ width: `${platformPercent}%` }}
          className="bg-blue-500 rounded-r-full transition-all duration-500"
          title={`Platform Tech Fee: ${platformPercent}%`}
        />
      </div>

      {/* 3 Pillars Breakdown */}
      <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
        {/* Provider Share */}
        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-emerald-500/30">
          <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span className="font-semibold">Provider Direct</span>
          </div>
          <p className="text-sm font-bold text-white">₹{actualProviderAmount.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{providerPercent}% Take-Home</p>
        </div>

        {/* Welfare Fund */}
        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-amber-500/30">
          <div className="flex items-center gap-1.5 text-amber-400 mb-1">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span className="font-semibold">Coop Welfare</span>
          </div>
          <p className="text-sm font-bold text-white">₹{actualWelfareAmount.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{welfarePercent}% Health & Aid</p>
        </div>

        {/* Platform Tech */}
        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-blue-500/30">
          <div className="flex items-center gap-1.5 text-blue-400 mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span className="font-semibold">Platform Fee</span>
          </div>
          <p className="text-sm font-bold text-white">₹{actualPlatformAmount.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{platformPercent}% Server/SMS</p>
        </div>
      </div>

      {/* Traditional Aggregator Comparison Callout */}
      {showComparison && (
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 text-xs">
          <div className="flex items-center justify-between text-slate-300 mb-1.5">
            <span className="font-medium">vs Traditional Corporate Platform (UrbanCompany/Swiggy):</span>
            <span className="text-rose-400 font-bold">25–30% Cut</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Provider receives only <strong className="text-slate-200">₹{tradProviderAmount}</strong></span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              Worker earns +₹{actualProviderAmount - tradProviderAmount} more <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
