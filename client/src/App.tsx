import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import type { LegalDocType } from './components/common/LegalModal';
import { SocketProvider, useSocket } from './context/SocketContext';
import LandingPage from './pages/landing/LandingPage';
import {
  PortalSkeleton,
  ServiceCatalogSkeleton,
  RegulatorSkeleton,
} from './components/common/Skeleton';
import AuthModal from './components/common/AuthModal';
import { offlineQueue } from './services/offlineQueue';

// Lazy load portal views, auth pages, and modals for performance & smooth skeleton transitions
const ServiceCatalog = lazy(() => import('./pages/consumer/ServiceCatalog'));
const ProviderDashboard = lazy(() => import('./pages/provider/ProviderDashboard'));
const AdminHub = lazy(() => import('./pages/admin/AdminHub'));
const RegulatorDashboard = lazy(() => import('./pages/regulator/RegulatorDashboard'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const LegalModal = lazy(() => import('./components/common/LegalModal'));
import { HomeIcon } from './components/common/Icons';

interface HealthStatus {
  status: string;
  db: string;
  timestamp: string;
  uptime?: number;
}

export const AppContent: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [activeNav, setActiveNav] = useState<string>('home');
  const [backendHealth, setBackendHealth] = useState<HealthStatus | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [loginInitialRole, setLoginInitialRole] = useState<'consumer' | 'provider' | 'coop_admin' | 'regulator'>('consumer');
  const [theme, setTheme] = useState<'light' | 'dark' | 'contrast'>(() => {
    const saved = localStorage.getItem('sahakar_theme');
    if (saved === 'high-contrast' || saved === 'contrast') return 'contrast';
    return (saved as any) || 'light';
  });
  const [fontChoice, setFontChoice] = useState<'sm' | 'md' | 'lg'>(() => {
    const saved = localStorage.getItem('sahakar_font_choice');
    return (saved as any) || 'md';
  });
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType | null>(null);

  const { connectWithToken } = useSocket();

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'contrast') {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    localStorage.setItem('sahakar_theme', theme);
  }, [theme]);

  // Apply UX4G font scaling
  useEffect(() => {
    const scaleMap: Record<'sm' | 'md' | 'lg', string> = {
      sm: '0.9375',
      md: '1',
      lg: '1.125',
    };
    document.documentElement.style.setProperty('--ux4g-font-scale', scaleMap[fontChoice]);
    localStorage.setItem('sahakar_font_choice', fontChoice);
  }, [fontChoice]);

  // Fetch backend health status
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiBase}/api/health`)
      .then((res) => res.json())
      .then((data) => {
        setBackendHealth(data);
      })
      .catch((_err) => {
        setBackendHealth({ status: 'offline', db: 'unreachable', timestamp: new Date().toISOString() });
      });
  }, []);

  // Restore authenticated session on initial mount
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      fetch(`${apiBase}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Session expired');
        })
        .then((data) => {
          if (data.user) {
            setCurrentUser(data.user);
            connectWithToken(token);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setCurrentUser(null);
        });
    }
  }, []);

  const handleLoginSuccess = (token: string, user: any) => {
    localStorage.setItem('token', token);
    setCurrentUser(user);
    connectWithToken(token);
    setAuthModalOpen(false);

    if (user.role === 'PROVIDER') {
      setActiveNav('provider');
    } else if (user.role === 'COOP_ADMIN' || user.role === 'ADMIN') {
      setActiveNav('coop_admin');
    } else if (user.role === 'REGULATOR') {
      setActiveNav('regulator');
    } else {
      setActiveNav('consumer');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    offlineQueue.clear();
    setCurrentUser(null);
    setActiveNav('home');
  };

  // Handle portal selection & role-based routing
  const handleSelectNav = (navId: string) => {
    if (navId === 'home') {
      setActiveNav('home');
      return;
    }

    // Direct Login / Portal Access Gateway
    if (navId === 'login' || navId.startsWith('login:')) {
      const parts = navId.split(':');
      const role = parts[1] as any;
      if (role && ['consumer', 'provider', 'coop_admin', 'regulator'].includes(role)) {
        setLoginInitialRole(role);
      } else {
        setLoginInitialRole('consumer');
      }
      setActiveNav('login');
      return;
    }

    // Public / consumer catalogs are accessible without mandatory login
    if (navId === 'consumer' || navId.startsWith('portal:')) {
      setActiveNav(navId);
      return;
    }

    // Role-protected workspaces: navigate if authorized, else redirect to classified login
    if (navId === 'provider') {
      if (currentUser && currentUser.role === 'PROVIDER') {
        setActiveNav('provider');
      } else {
        setLoginInitialRole('provider');
        setActiveNav('login');
      }
      return;
    }

    if (navId === 'coop_admin') {
      if (currentUser && (currentUser.role === 'COOP_ADMIN' || currentUser.role === 'ADMIN')) {
        setActiveNav('coop_admin');
      } else {
        setLoginInitialRole('coop_admin');
        setActiveNav('login');
      }
      return;
    }

    if (navId === 'regulator') {
      if (currentUser && currentUser.role === 'REGULATOR') {
        setActiveNav('regulator');
      } else {
        setLoginInitialRole('regulator');
        setActiveNav('login');
      }
      return;
    }

    setActiveNav(navId);
  };

  const getPortalTitle = (nav: string) => {
    switch (nav) {
      case 'login':
        return lang === 'hi' ? 'राष्ट्रीय सहकारिता प्रवेश द्वार' : 'National Portal Sign In';
      case 'consumer':
        return lang === 'hi' ? 'समस्त नागरिक सेवाएं' : 'Citizen Consumer Portal';
      case 'portal:plumbing':
        return lang === 'hi' ? 'नलसाजी एवं स्वच्छता सहकारी पोर्टल' : 'Plumbing & Sanitary Works Cooperative';
      case 'portal:electrical':
        return lang === 'hi' ? 'विद्युत अभियांत्रिकी सहकारी पोर्टल' : 'Electrical & Wiremen Cooperative';
      case 'portal:carpentry':
        return lang === 'hi' ? 'काष्ठशिल्प एवं बढ़ईगीरी सहकारी पोर्टल' : 'Woodcraft & Carpentry Cooperative';
      case 'portal:appliances':
        return lang === 'hi' ? 'उपकरण मरम्मत सहकारी पोर्टल' : 'Appliance Repair Cooperative';
      case 'provider':
        return lang === 'hi' ? 'श्रमयोगी सदस्य कार्यक्षेत्र' : 'Tradesman Provider Workplace';
      case 'coop_admin':
        return lang === 'hi' ? 'समिति प्रशासनिक केंद्र' : 'Cooperative Society Admin Hub';
      case 'regulator':
        return lang === 'hi' ? 'सहकारिता विनियामक निरीक्षण' : 'Central Cooperative Regulator Hub';
      default:
        return 'Overview';
    }
  };

  const isConsumerView = activeNav === 'consumer' || activeNav.startsWith('portal:');

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Institutional UX4G Accessible Header & Navigation */}
      <Header
        currentLang={lang}
        onLanguageChange={setLang}
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
        currentUser={currentUser}
        onSwitchPersona={() => setActiveNav('home')}
        onLogout={handleLogout}
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        onThemeChange={setTheme}
        fontChoice={fontChoice}
        onFontChoiceChange={setFontChoice}
      />

      <main id="main-content" className={`flex-grow-1 ${activeNav === 'home' ? '' : 'py-3 py-md-4'}`} role="main">
        {activeNav === 'home' ? (
          <LandingPage
            lang={lang}
            onSelectPortal={handleSelectNav}
            backendHealth={backendHealth}
          />
        ) : activeNav === 'login' ? (
          <Suspense fallback={<PortalSkeleton title={lang === 'hi' ? 'राष्ट्रीय सहकारिता प्रवेश द्वार' : 'Authentication Gateway'} />}>
            <LoginPage
              initialRole={loginInitialRole}
              onLoginSuccess={handleLoginSuccess}
              onBackToHome={() => setActiveNav('home')}
              lang={lang}
            />
          </Suspense>
        ) : (
          <div className="container-fluid px-2 px-sm-3 px-md-4">
            {/* Clean Breadcrumb Navigation */}
            <div className="d-flex justify-content-between align-items-center mb-3 py-1">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0 small">
                  <li className="breadcrumb-item">
                    <button
                      type="button"
                      className="btn btn-sm btn-link p-0 text-decoration-none text-secondary d-inline-flex align-items-center gap-1"
                      onClick={() => setActiveNav('home')}
                    >
                      <HomeIcon size={13} />
                      <span>{lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</span>
                    </button>
                  </li>
                  <li className="breadcrumb-item active fw-semibold text-dark" aria-current="page">
                    {getPortalTitle(activeNav)}
                  </li>
                </ol>
              </nav>

              {currentUser && (
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary text-uppercase" style={{ fontSize: '0.68rem' }}>
                    {currentUser.role}
                  </span>
                  <span className="small text-muted">{currentUser.name}</span>
                </div>
              )}
            </div>

            <Suspense
              fallback={
                isConsumerView ? (
                  <ServiceCatalogSkeleton />
                ) : activeNav === 'regulator' ? (
                  <RegulatorSkeleton />
                ) : (
                  <PortalSkeleton title={getPortalTitle(activeNav)} />
                )
              }
            >
              {isConsumerView && (
                <ServiceCatalog
                  initialTrade={
                    activeNav === 'portal:electrical'
                      ? 'electrical'
                      : activeNav === 'portal:carpentry'
                      ? 'carpentry'
                      : activeNav === 'portal:appliances'
                      ? 'appliances'
                      : 'plumbing'
                  }
                  lang={lang}
                  onSelectTrade={(trade) => setActiveNav(`portal:${trade}`)}
                />
              )}

              {activeNav === 'provider' && (
                <ProviderDashboard
                  onOpenAuth={() => handleSelectNav('login:provider')}
                />
              )}

              {activeNav === 'coop_admin' && (
                <AdminHub
                  currentUser={currentUser}
                  onOpenAuth={() => handleSelectNav('login:coop_admin')}
                />
              )}

              {activeNav === 'regulator' && (
                <RegulatorDashboard
                  onOpenAuth={() => handleSelectNav('login:regulator')}
                />
              )}
            </Suspense>
          </div>
        )}
      </main>

      {/* Cooperative Community Footer */}
      <Footer
        currentLang={lang}
        onOpenLegal={(docId) => setActiveLegalDoc(docId)}
        onSelectNav={handleSelectNav}
      />

      {/* Statutory & Legal Policy Modal */}
      {activeLegalDoc && (
        <Suspense fallback={null}>
          <LegalModal
            docId={activeLegalDoc}
            onClose={() => setActiveLegalDoc(null)}
            lang={lang}
          />
        </Suspense>
      )}

      {/* Authentic Citizen & Member Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRole={loginInitialRole}
        lang={lang}
      />
    </div>
  );
};

export const App: React.FC = () => (
  <SocketProvider>
    <AppContent />
  </SocketProvider>
);

export default App;
