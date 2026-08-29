import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Compass,
  CalendarCheck,
  Vote,
  LayoutDashboard,
  Coins,
  ShieldCheck,
  Building,
  Landmark,
  LogIn,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Navbar: React.FC = () => {
  const { user, role } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-[37px] z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">
                    Sahakar<span className="text-emerald-600">Connect</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    PSCS
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Cooperative Gig Platform • SIH26089
                </p>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* Common / Consumer Links */}
            <Link
              to="/services"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/services') || isActive('/')
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4" />
              Services Catalog
            </Link>

            <Link
              to="/bookings"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/bookings')
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              My Bookings
            </Link>

            <Link
              to="/governance"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/governance')
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Vote className="w-4 h-4" />
              Coop Governance
            </Link>

            {/* Provider portal shortcut */}
            {(role === 'PROVIDER' || role === 'COOP_ADMIN') && (
              <Link
                to="/provider"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/provider')
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Provider Studio
              </Link>
            )}

            {/* Admin portal shortcut */}
            {(role === 'COOP_ADMIN' || role === 'REGULATOR') && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'bg-amber-50 text-amber-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Building className="w-4 h-4" />
                Coop Admin
              </Link>
            )}

            {/* Regulator portal shortcut */}
            {role === 'REGULATOR' && (
              <Link
                to="/regulator"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/regulator')
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Landmark className="w-4 h-4" />
                Regulator Portal
              </Link>
            )}
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                    {user.name}
                  </p>
                  <div className="mt-0.5">
                    {role === 'PROVIDER' && <Badge variant="green" size="sm">Provider Member</Badge>}
                    {role === 'COOP_ADMIN' && <Badge variant="amber" size="sm">Society Admin</Badge>}
                    {role === 'REGULATOR' && <Badge variant="blue" size="sm">Ministry Regulator</Badge>}
                    {role === 'CONSUMER' && <Badge variant="gray" size="sm">Consumer</Badge>}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
