import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LegalModal, { LegalDocType } from './components/common/LegalModal';
import { SocketProvider, useSocket } from './context/SocketContext';
import ServiceCatalog from './pages/consumer/ServiceCatalog';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import AdminHub from './pages/admin/AdminHub';
import LandingPage from './pages/landing/LandingPage';
import {
  ConsumerIcon,
  ProviderIcon,
  AdminIcon,
  RegulatorIcon,
  HomeIcon,
  PlumbingIcon,
  ElectricalIcon,
  CarpentryIcon,
  ApplianceIcon,
} from './components/common/Icons';

interface HealthStatus {
  status: string;
  db: string;
  timestamp: string;
  uptime?: number;
}

const PERSONA_CREDENTIALS: Record<string, { email: string; pass: string }> = {
  consumer: { email: 'vikram.consumer@gmail.com', pass: 'Password@123' },
  'portal:plumbing': { email: 'vikram.consumer@gmail.com', pass: 'Password@123' },
  'portal:electrical': { email: 'vikram.consumer@gmail.com', pass: 'Password@123' },
  'portal:carpentry': { email: 'vikram.consumer@gmail.com', pass: 'Password@123' },
  'portal:appliances': { email: 'vikram.consumer@gmail.com', pass: 'Password@123' },
  provider: { email: 'ramesh.plumber@sahakar.org', pass: 'Password@123' },
  coop_admin: { email: 'admin.delhi@sahakar.gov.in', pass: 'Password@123' },
  regulator: { email: 'regulator@cooperation.gov.in', pass: 'Password@123' },
};


export const AppContent: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [activeNav, setActiveNav] = useState<string>('home');
  const [backendHealth, setBackendHealth] = useState<HealthStatus | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
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
    fetch('http://localhost:5000/api/health')
      .then((res) => res.json())
      .then((data) => {
        setBackendHealth(data);
      })
      .catch((_err) => {
        setBackendHealth({ status: 'offline', db: 'unreachable', timestamp: new Date().toISOString() });
      });
  }, []);

  // Handle portal selection & automatic authentication
  const handleSelectNav = async (navId: string) => {
    setActiveNav(navId);

    if (navId === 'home') {
      return;
    }

    const creds = PERSONA_CREDENTIALS[navId];
    if (creds) {
      try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: creds.email, password: creds.pass }),
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('token', data.token);
          setCurrentUser(data.user);
          connectWithToken(data.token);
        }
      } catch (err) {
        console.error('Auto login error:', err);
      }
    }
  };

  const getPortalTitle = (nav: string) => {
    switch (nav) {
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
        theme={theme}
        onThemeChange={setTheme}
        fontChoice={fontChoice}
        onFontChoiceChange={setFontChoice}
      />

      <main id="main-content" className="flex-grow-1 py-4" role="main">
        <div className="container-fluid px-4">
          {/* Breadcrumb & Quick Switcher Strip when inside a portal */}
          {activeNav !== 'home' && (
            <div className="card shadow-sm border mb-4 bg-white">
              <div className="card-body py-2 px-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-sm btn-link p-0 text-decoration-none text-secondary d-flex align-items-center gap-1"
                      onClick={() => setActiveNav('home')}
                    >
                      <HomeIcon size={14} />
                      <span>{lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</span>
                    </button>
                    <span className="text-muted">/</span>
                    <span className="fw-bold text-dark small">{getPortalTitle(activeNav)}</span>
                    <span className="badge bg-primary text-uppercase ms-1" style={{ fontSize: '0.68rem' }}>
                      {activeNav === 'portal:plumbing'
                        ? 'PLUMBING'
                        : activeNav === 'portal:electrical'
                        ? 'ELECTRICAL'
                        : activeNav === 'portal:carpentry'
                        ? 'CARPENTRY'
                        : activeNav === 'portal:appliances'
                        ? 'APPLIANCES'
                        : currentUser?.role || activeNav}
                    </span>

                    {/* Quick Trade Selector in Breadcrumb Strip */}
                    {isConsumerView && (
                      <div className="btn-group btn-group-sm ms-2 d-none d-md-inline-flex" role="group" aria-label="Trade portals quick switcher">
                        <button
                          type="button"
                          className={`btn py-0 px-2 ${activeNav === 'portal:plumbing' || activeNav === 'consumer' ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => handleSelectNav('portal:plumbing')}
                          title="Plumbing Portal"
                        >
                          <PlumbingIcon size={12} className="me-1" />
                          Plumbing
                        </button>
                        <button
                          type="button"
                          className={`btn py-0 px-2 ${activeNav === 'portal:electrical' ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => handleSelectNav('portal:electrical')}
                          title="Electrical Portal"
                        >
                          <ElectricalIcon size={12} className="me-1" />
                          Electrical
                        </button>
                        <button
                          type="button"
                          className={`btn py-0 px-2 ${activeNav === 'portal:carpentry' ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => handleSelectNav('portal:carpentry')}
                          title="Carpentry Portal"
                        >
                          <CarpentryIcon size={12} className="me-1" />
                          Carpentry
                        </button>
                        <button
                          type="button"
                          className={`btn py-0 px-2 ${activeNav === 'portal:appliances' ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => handleSelectNav('portal:appliances')}
                          title="Appliance Portal"
                        >
                          <ApplianceIcon size={12} className="me-1" />
                          Appliances
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted d-none d-md-inline">Switch Portal:</span>
                    <div className="btn-group btn-group-sm" role="group" aria-label="Portal switcher">
                      <button
                        type="button"
                        className={`btn ${isConsumerView ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => handleSelectNav('consumer')}
                        title="Citizen Consumer"
                      >
                        <ConsumerIcon size={13} className="me-1" />
                        Citizen
                      </button>
                      <button
                        type="button"
                        className={`btn ${activeNav === 'provider' ? 'btn-success' : 'btn-outline-secondary'}`}
                        onClick={() => handleSelectNav('provider')}
                        title="Tradesman Provider"
                      >
                        <ProviderIcon size={13} className="me-1" />
                        Tradesman
                      </button>
                      <button
                        type="button"
                        className={`btn ${activeNav === 'coop_admin' ? 'btn-dark' : 'btn-outline-secondary'}`}
                        onClick={() => handleSelectNav('coop_admin')}
                        title="Society Admin"
                      >
                        <AdminIcon size={13} className="me-1" />
                        Admin
                      </button>
                      <button
                        type="button"
                        className={`btn ${activeNav === 'regulator' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                        onClick={() => handleSelectNav('regulator')}
                        title="Regulator"
                      >
                        <RegulatorIcon size={13} className="me-1" />
                        Regulator
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => setActiveNav('home')}
                      title="Exit to Landing Page"
                    >
                      Exit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active View Router */}
          {activeNav === 'home' && (
            <LandingPage
              lang={lang}
              onSelectPortal={handleSelectNav}
              backendHealth={backendHealth}
            />
          )}

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

          {activeNav === 'provider' && <ProviderDashboard />}

          {(activeNav === 'coop_admin' || activeNav === 'regulator') && <AdminHub />}

        </div>
      </main>

      {/* Official Government of India Accessible Footer */}
      <Footer currentLang={lang} onOpenLegal={(docId) => setActiveLegalDoc(docId)} />

      {/* Statutory & Legal Policy Modal */}
      {activeLegalDoc && (
        <LegalModal
          docId={activeLegalDoc}
          onClose={() => setActiveLegalDoc(null)}
          lang={lang}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => (
  <SocketProvider>
    <AppContent />
  </SocketProvider>
);

export default App;
