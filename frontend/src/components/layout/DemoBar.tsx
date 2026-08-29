import React from 'react';
import { useAuth, DEMO_PERSONAS } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { ShieldCheck, UserCheck, Building2, Landmark, Radio, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoBar: React.FC = () => {
  const { user, role, switchPersona, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const handlePersonaSwitch = async (key: 'consumer' | 'provider' | 'admin' | 'regulator') => {
    await switchPersona(key);
    if (key === 'consumer') navigate('/services');
    else if (key === 'provider') navigate('/provider');
    else if (key === 'admin') navigate('/admin');
    else if (key === 'regulator') navigate('/regulator');
  };

  return (
    <header className="bg-slate-950 text-slate-200 text-xs border-b border-slate-800 sticky top-0 z-50 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-md">
      {/* Left: Hackathon Persona Switcher */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-bold uppercase tracking-wider text-coop-400 flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-coop-400 animate-pulse" />
          Judge Demo Switcher:
        </span>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Consumer */}
          <button
            onClick={() => handlePersonaSwitch('consumer')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
              role === 'CONSUMER'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
            }`}
            title="Log in as Rahul Sharma (Consumer)"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>1. Consumer (Rahul)</span>
          </button>

          {/* Provider */}
          <button
            onClick={() => handlePersonaSwitch('provider')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
              role === 'PROVIDER'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
            }`}
            title="Log in as Ramesh Yadav (Coop Provider & Plumber)"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. Provider (Ramesh)</span>
          </button>

          {/* Coop Admin */}
          <button
            onClick={() => handlePersonaSwitch('admin')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
              role === 'COOP_ADMIN'
                ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
            }`}
            title="Log in as Suresh Kumar (Admin - Delhi Coop Society)"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>3. Coop Admin (Suresh)</span>
          </button>

          {/* Regulator */}
          <button
            onClick={() => handlePersonaSwitch('regulator')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
              role === 'REGULATOR'
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
            }`}
            title="Log in as Dr. Rajeshwari Nair (Ministry Regulator)"
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>4. Regulator (Ministry)</span>
          </button>
        </div>
      </div>

      {/* Right: Live socket status & Active persona indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`} />
          <span className="hidden sm:inline text-[11px]">
            {isConnected ? 'Real-Time Sync Online' : 'Connecting...'}
          </span>
        </div>

        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <span className="text-slate-300 font-medium truncate max-w-[130px]">
              {user.name}
            </span>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};
