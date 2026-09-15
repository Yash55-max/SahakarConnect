import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { SocketProvider, useSocket } from './context/SocketContext';
import ServiceCatalog from './pages/consumer/ServiceCatalog';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import AdminHub from './pages/admin/AdminHub';
import {
  ConsumerIcon,
  ProviderIcon,
  AdminIcon,
  RegulatorIcon,
  CheckIcon,
  ScaleIcon,
} from './components/common/Icons';

interface HealthStatus {
  status: string;
  db: string;
  timestamp: string;
  uptime?: number;
}

const PERSONA_CREDENTIALS: Record<string, { email: string; pass: string }> = {
  consumer: { email: 'vikram.consumer@gmail.com', pass: 'Password@123' },
  provider: { email: 'ramesh.plumber@sahakar.org', pass: 'Password@123' },
  coop_admin: { email: 'admin.delhi@sahakar.gov.in', pass: 'Password@123' },
  regulator: { email: 'regulator@cooperation.gov.in', pass: 'Password@123' },
};

export const AppContent: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [backendHealth, setBackendHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const { connectWithToken } = useSocket();

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then((res) => res.json())
      .then((data) => {
        setBackendHealth(data);
        setLoadingHealth(false);
      })
      .catch((_err) => {
        setBackendHealth({ status: 'offline', db: 'unreachable', timestamp: new Date().toISOString() });
        setLoadingHealth(false);
      });
  }, []);

  const handleSelectPersona = async (personaId: string) => {
    setSelectedPersona(personaId);
    const creds = PERSONA_CREDENTIALS[personaId];
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

  const personas = [
    {
      id: 'consumer',
      title: lang === 'hi' ? 'नागरिक सेवा पोर्टल' : 'Citizen Consumer Portal',
      role: 'CONSUMER',
      IconComponent: ConsumerIcon,
      badgeClass: 'bg-primary text-white',
      description:
        lang === 'hi'
          ? 'सत्यापित सहकारी तकनीशियनों से निर्धारित दरों पर घरेलू व व्यावसायिक सेवाएं प्राप्त करें।'
          : 'Service booking for verified cooperative technicians with statutory rate schedules.',
      features: [
        'Booking dispatch requests',
        'NSQF skill certification verification',
        'Escrow held until 4-digit PIN completion',
        'Direct receipt with breakdown',
      ],
      action: 'Enter Consumer Portal',
    },
    {
      id: 'provider',
      title: lang === 'hi' ? 'श्रमयोगी सदस्य कार्यक्षेत्र' : 'Cooperative Provider Workplace',
      role: 'PROVIDER',
      IconComponent: ProviderIcon,
      badgeClass: 'bg-success text-white',
      description:
        lang === 'hi'
          ? 'कार्य आवंटन, प्रत्यक्ष कल्याण निधि क्रेडिट और पारदर्शी भुगतान विवरण।'
          : 'Job assignment, welfare fund contributions, share capital balance, and payouts.',
      features: [
        'Spatial availability status',
        'Class-A voting status in cooperative',
        'Statutory welfare fund allocation',
        'Instant settlement upon OTP verification',
      ],
      action: 'Open Provider Workplace',
    },
    {
      id: 'coop_admin',
      title: lang === 'hi' ? 'समिति प्रशासनिक केंद्र' : 'Cooperative Society Admin',
      role: 'COOP_ADMIN',
      IconComponent: AdminIcon,
      badgeClass: 'bg-dark text-white',
      description:
        lang === 'hi'
          ? 'प्राथमिक सेवा सहकारी समिति का लेखा-जोखा, सदस्य सत्यापन और मतदान प्रबंधन।'
          : 'Primary Service Cooperative Society administration, member checks, and polls.',
      features: [
        'Tripartite escrow ledger records',
        'Member Aadhaar and police verification',
        'Statutory governance resolutions',
        'Reserve fund accounting balance',
      ],
      action: 'Manage Society Operations',
    },
    {
      id: 'regulator',
      title: lang === 'hi' ? 'सहकारिता विनियामक निरीक्षण' : 'Central Cooperative Regulator',
      role: 'REGULATOR',
      IconComponent: RegulatorIcon,
      badgeClass: 'bg-secondary text-white',
      description:
        lang === 'hi'
          ? 'सहकारिता मंत्रालय और राज्य रजिस्ट्रार के लिए अंतर-जिला लेखापरीक्षा।'
          : 'Ministry of Cooperation audit access across district cooperative societies.',
      features: [
        'Multi-district society audit logs',
        'Statutory reserve ratio validation',
        'Zero-leakage ledger accounting audits',
        'Compliance reports under MSCS Act 2023',
      ],
      action: 'Access Regulatory Terminal',
    },
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header currentLang={lang} onLanguageChange={setLang} />

      <main id="main-content" className="flex-grow-1 py-4" role="main">
        <div className="container-fluid px-4">
          {/* Main Title Section */}
          <div className="card shadow-sm border mb-4 bg-white">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <span className="badge bg-light text-dark border px-2 py-1 mb-2" style={{ fontSize: '0.72rem' }}>
                    UX4G Design System / GIGW 3.0
                  </span>
                  <h2 className="h4 fw-bold mb-1 text-dark">
                    {lang === 'hi'
                      ? 'सहकार कनेक्ट: प्राथमिक सेवा सहकारी समिति मंच'
                      : 'SahakarConnect: Primary Service Cooperative Society (PSCS) Platform'}
                  </h2>
                  <p className="text-secondary small mb-0">
                    {lang === 'hi'
                      ? 'बहु-राज्य सहकारी सोसायटी अधिनियम, 2023 के तहत वैधानिक डिजिटल अवसंरचना।'
                      : 'Statutory digital infrastructure established under the Multi-State Co-operative Societies Act, 2023.'}
                  </p>
                </div>

                {/* System Diagnostics */}
                <div className="text-end">
                  <div className="d-inline-flex align-items-center gap-2 px-3 py-2 bg-light border rounded">
                    <span
                      className={`badge ${
                        backendHealth?.status === 'ok' ? 'bg-success' : 'bg-danger'
                      }`}
                      style={{ width: '8px', height: '8px', padding: 0, borderRadius: '50%' }}
                      aria-hidden="true"
                    />
                    <div className="text-start">
                      <div className="small fw-semibold text-dark">
                        API Status:{' '}
                        <span>
                          {loadingHealth
                            ? 'Checking...'
                            : backendHealth?.status === 'ok'
                            ? 'Online'
                            : 'Offline'}
                        </span>
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Database: {backendHealth?.db === 'connected' ? 'Connected' : 'Disconnected'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Persona Switcher Bar if active */}
          {selectedPersona && (
            <div className="alert alert-light border shadow-sm mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary text-uppercase">{currentUser?.role || selectedPersona}</span>
                <span className="small fw-semibold text-dark">
                  Active Persona: {currentUser?.name || selectedPersona} ({currentUser?.email})
                </span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSelectedPersona(null)}
              >
                ← Switch Persona
              </button>
            </div>
          )}

          {/* Active Persona Workspace View */}
          {selectedPersona === 'consumer' && <ServiceCatalog />}
          {selectedPersona === 'provider' && <ProviderDashboard />}
          {(selectedPersona === 'coop_admin' || selectedPersona === 'regulator') && <AdminHub />}

          {/* Home Landing View */}
          {!selectedPersona && (
            <>
              {/* Statutory Escrow Split Box */}
              <div className="statutory-banner p-3 mb-4 shadow-sm">
                <div className="d-flex align-items-center gap-3">
                  <div className="text-primary">
                    <ScaleIcon size={28} />
                  </div>
                  <div>
                    <div className="small fw-bold text-dark">Statutory Split Invariant:</div>
                    <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
                      <code className="formula-code">
                        Worker Payout (W) + Welfare Fund (F) + Platform Fee (P) = Gross Amount
                      </code>
                      <span className="text-muted small">
                        Enforces deterministic zero-leakage accounting. Rounding fractional remainder credited to worker.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Persona Card Grid */}
              <div className="row g-4">
                {personas.map((p) => {
                  const IconComp = p.IconComponent;
                  return (
                    <div key={p.id} className="col-12 col-md-6 col-xl-3">
                      <div className="persona-card p-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="card-icon-wrapper">
                            <IconComp size={22} />
                          </div>
                          <span className={`badge ${p.badgeClass} text-uppercase px-2 py-1`} style={{ fontSize: '0.7rem' }}>
                            {p.role}
                          </span>
                        </div>

                        <h3 className="h6 fw-bold mb-2 text-dark">{p.title}</h3>
                        <p className="small text-muted mb-3 flex-grow-1">{p.description}</p>

                        <div className="small fw-semibold text-uppercase text-secondary mb-2" style={{ fontSize: '0.72rem' }}>
                          Key Capabilities
                        </div>
                        <ul className="feature-list mb-4">
                          {p.features.map((feat, idx) => (
                            <li key={idx}>
                              <span className="check-icon">
                                <CheckIcon size={13} />
                              </span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-auto">
                          <button
                            type="button"
                            className="btn btn-sm btn-primary w-100"
                            onClick={() => handleSelectPersona(p.id)}
                          >
                            {p.action}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer currentLang={lang} />
    </div>
  );
};

export const App: React.FC = () => (
  <SocketProvider>
    <AppContent />
  </SocketProvider>
);

export default App;
