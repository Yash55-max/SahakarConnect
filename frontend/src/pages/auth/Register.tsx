import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Role } from '../../types';
import api from '../../lib/api';
import { Users, UserPlus, ShieldCheck, UserCheck } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('password123');
  const [role, setRole] = useState<Role>('CONSUMER');
  const [cooperativeId, setCooperativeId] = useState<string>('');
  const [skills, setSkills] = useState<string>('Plumbing, Pipe Fitting');
  const [address, setAddress] = useState<string>('New Delhi');
  const [allCoops, setAllCoops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    api.getDemoAccounts().then((res) => {
      setAllCoops(res.cooperatives || []);
      if (res.cooperatives?.length > 0) {
        setCooperativeId(res.cooperatives[0].id);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await register({
        name,
        email,
        phone,
        password,
        role,
        cooperativeId: role === 'PROVIDER' ? cooperativeId : undefined,
        skills: role === 'PROVIDER' ? skills.split(',').map((s) => s.trim()) : undefined,
        address: role === 'PROVIDER' ? address : undefined,
      });

      if (role === 'PROVIDER') navigate('/provider');
      else navigate('/services');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-md">
          <Users className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Create SahakarConnect Account</h1>
        <p className="text-xs text-slate-500">
          Join India's Cooperative Gig Economy Platform
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Role selector buttons */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">I want to register as:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('CONSUMER')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  role === 'CONSUMER'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-400'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold">Household Consumer</p>
                  <p className="text-[10px] text-slate-500 font-normal">Book trusted home services</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('PROVIDER')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  role === 'PROVIDER'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-400'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold">Cooperative Provider</p>
                  <p className="text-[10px] text-slate-500 font-normal">Direct gigs & democratic pay</p>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anjali Sharma"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Phone</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anjali@example.com"
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
          </div>

          {/* Provider Specific Section */}
          {role === 'PROVIDER' && (
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-3">
              <span className="text-[11px] font-bold text-emerald-900 block">
                Primary Service Cooperative Society (PSCS) Onboarding
              </span>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Affiliate Cooperative Society</label>
                <select
                  value={cooperativeId}
                  onChange={(e) => setCooperativeId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  {allCoops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trade Skills (Comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Electrical Wiring, Inverter Repair"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Area / City</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. South Delhi"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {isLoading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-700 font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
