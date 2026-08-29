import React, { useState } from 'react';
import { useAuth, DEMO_PERSONAS } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Users, LogIn, ShieldCheck, Building2, Landmark, UserCheck, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, switchPersona } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('rahul.sharma@example.com');
  const [password, setPassword] = useState<string>('password123');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/services');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (key: 'consumer' | 'provider' | 'admin' | 'regulator') => {
    setIsLoading(true);
    try {
      await switchPersona(key);
      if (key === 'consumer') navigate('/services');
      else if (key === 'provider') navigate('/provider');
      else if (key === 'admin') navigate('/admin');
      else if (key === 'regulator') navigate('/regulator');
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-md">
          <Users className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Sign in to SahakarConnect</h1>
        <p className="text-xs text-slate-500">
          Cooperative gig marketplace powered by Primary Service Cooperatives
        </p>
      </div>

      {/* 1-Click Demo Persona Login Box for Hackathon Judges */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl text-white space-y-3 shadow-xl border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-coop-400">
            Hackathon Judge Quick Sign-In
          </span>
          <span className="text-[10px] text-slate-400">1-Click Auth</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin('consumer')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 hover:border-emerald-500 transition-all flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-100">Consumer</p>
              <p className="text-[10px] text-slate-400">Rahul Sharma</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('provider')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 hover:border-emerald-500 transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-100">Provider</p>
              <p className="text-[10px] text-slate-400">Ramesh (Plumber)</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 hover:border-amber-500 transition-all flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-100">Coop Admin</p>
              <p className="text-[10px] text-slate-400">Suresh Kumar</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('regulator')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 hover:border-blue-500 transition-all flex items-center gap-2"
          >
            <Landmark className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-100">Regulator</p>
              <p className="text-[10px] text-slate-400">Dr. Rajeshwari</p>
            </div>
          </button>
        </div>
      </div>

      {/* Manual Login Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-700 font-bold hover:underline">
            Register new member
          </Link>
        </div>
      </div>
    </div>
  );
};
