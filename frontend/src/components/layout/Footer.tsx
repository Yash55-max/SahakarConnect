import React from 'react';
import { Users, ShieldCheck, HeartHandshake, FileCheck2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Platform identity */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Users className="w-4 h-4" />
              </div>
              <span>SahakarConnect</span>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              Empowering household gig service providers through democratic Primary Service Cooperative Societies (PSCS).
              Eliminating predatory platform commissions with verifiable ledger transparency and direct worker welfare backing.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-emerald-400 font-medium pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Cooperative Verified
              </span>
              <span className="flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5" /> Direct Worker Welfare Fund
              </span>
            </div>
          </div>

          {/* Col 2: Cooperative Pillars */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-3">
              Cooperative Pillars
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-white transition-colors">Democratic One-Worker-One-Vote</li>
              <li className="hover:text-white transition-colors">90%+ Direct Take-Home Earnings</li>
              <li className="hover:text-white transition-colors">Emergency Health & Tool Subsidies</li>
              <li className="hover:text-white transition-colors">Ministry of Cooperation Regulatory Audit</li>
            </ul>
          </div>

          {/* Col 3: Hackathon Details */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-3">
              SIH26089 Hackathon
            </h4>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1.5">
              <p className="text-white font-semibold flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                Problem Statement SIH26089
              </p>
              <p className="text-[11px] text-slate-400">
                Ministry of Cooperation, Government of India
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                Architecture: React + Express + Prisma + PostgreSQL + Socket.io
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© 2026 SahakarConnect Platform. Developed for Smart India Hackathon.</p>
          <p className="text-slate-500">
            Powered by Primary Service Cooperative Societies (PSCS) Governance Engine
          </p>
        </div>
      </div>
    </footer>
  );
};
