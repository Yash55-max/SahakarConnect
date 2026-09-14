import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';

interface HealthStatus {
  status: string;
  db: string;
  timestamp: string;
  uptime?: number;
}

export const App: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [backendHealth, setBackendHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);

  useEffect(() => {
    // Query backend health endpoint
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

  const personas = [
    {
      id: 'consumer',
      title: lang === 'hi' ? 'नागरिक सेवा पोर्टल (उपभोक्ता)' : 'Citizen Consumer Portal',
      role: 'CONSUMER',
      icon: '🛒',
      badgeColor: 'bg-primary',
      description:
        lang === 'hi'
          ? 'सत्यापित सहकारी तकनीशियनों से पारदर्शी मूल्य पर घरेलू और व्यावसायिक सेवाएं प्राप्त करें।'
          : 'Book verified skilled cooperative tradesmen with transparent statutory pricing and instant spatial matching.',
      features: [
        'On-Demand Booking Dispatch',
        'Verified NSQF-Certified Workers',
        'Secure Escrow & 4-Digit PIN Completion',
        'Transparent Bill Breakdown',
      ],
      action: 'Enter Consumer Portal',
    },
    {
      id: 'provider',
      title: lang === 'hi' ? 'श्रमयोगी सहकारी सदस्य पोर्टल' : 'Cooperative Provider Portal',
      role: 'PROVIDER',
      icon: '🛠️',
      badgeColor: 'bg-success',
      description:
        lang === 'hi'
          ? 'निष्पक्ष मजदूरी, प्रत्यक्ष कल्याण निधि अंशदान और वास्तविक समय कार्य स्वीकृति।'
          : 'Fair algorithmic dispatch, direct welfare fund crediting, share capital ownership, and transparent payouts.',
      features: [
        'Uber H3 Spatial Availability Toggle',
        'Class A Voting Rights & Governance',
        '8% Welfare Fund & Insurance Allocation',
        'Instant Completion OTP Settlement',
      ],
      action: 'Open Provider Workplace',
    },
    {
      id: 'coop_admin',
      title: lang === 'hi' ? 'समिति प्रबंधक डैशबोर्ड' : 'Cooperative Admin Hub',
      role: 'COOP_ADMIN',
      icon: '🏛️',
      badgeColor: 'bg-warning text-dark',
      description:
        lang === 'hi'
          ? 'प्राथमिक सेवा सहकारी समिति (PSCS) का त्रिस्तरीय खाता बही, सदस्य सत्यापन और प्रस्ताव प्रबंधन।'
          : 'Multi-tenant society governance, tripartite zero-leakage ledger oversight, and statutory reserve management.',
      features: [
        'Live Tripartite Escrow Inspection',
        'Aadhaar & Police Verification Queue',
        'Democratic Poll Creation & Quorum Tracking',
        'District Statutory Reserve Monitoring',
      ],
      action: 'Manage Society Operations',
    },
    {
      id: 'regulator',
      title: lang === 'hi' ? 'सरकारी विनियामक व रजिस्ट्रार' : 'Central Cooperative Regulator',
      role: 'REGULATOR',
      icon: '⚖️',
      badgeColor: 'bg-info text-dark',
      description:
        lang === 'hi'
          ? 'सहकारिता मंत्रालय और राज्य रजिस्ट्रार के लिए अंतर-जिला अनुपालन और वित्तीय लेखापरीक्षा।'
          : 'Ministry of Cooperation oversight, inter-district audit trails, statutory ratio enforcement, and MSCS compliance.',
      features: [
        'Cross-District Multi-Tenant Analytics',
        'Statutory Reserve Ratio Validation',
        'Zero-Leakage Mathematical Proof Auditing',
        'Autonomous Fraud & Anomaly Detection',
      ],
      action: 'Access Regulatory Terminal',
    },
  ];

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header currentLang={lang} onLanguageChange={setLang} />

      <main id="main-content" className="flex-grow-1 py-4" role="main">
        <div className="container-fluid px-4">
          {/* Welcome Banner */}
          <div className="card shadow-sm border-0 mb-4 bg-white">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 mb-2">
                    UX4G Design Standard 3.x
                  </span>
                  <h2 className="fw-bold mb-1">
                    {lang === 'hi'
                      ? 'सहकार कनेक्ट: प्राथमिक सेवा सहकारी समिति डिजिटल मंच'
                      : 'SahakarConnect: Primary Service Cooperative Society (PSCS) Platform'}
                  </h2>
                  <p className="text-secondary mb-0">
                    {lang === 'hi'
                      ? 'श्रमयोगियों का सशक्तिकरण, पारदर्शी सेवा वितरण, और वैधानिक शून्य-रिसाव बहीखाता प्रणाली।'
                      : 'Empowering skilled tradesmen through sovereign digital cooperatives, democratic ownership, and zero-leakage accounting.'}
                  </p>
                </div>

                {/* System Health Badge */}
                <div className="text-end">
                  <div className="d-inline-flex align-items-center gap-2 px-3 py-2 bg-light border rounded">
                    <span
                      className={`spinner-grow spinner-grow-sm ${
                        backendHealth?.status === 'ok' ? 'text-success' : 'text-danger'
                      }`}
                      role="status"
                    />
                    <div className="text-start">
                      <div className="small fw-bold">
                        Backend Status:{' '}
                        <span className={backendHealth?.status === 'ok' ? 'text-success' : 'text-danger'}>
                          {loadingHealth
                            ? 'Checking...'
                            : backendHealth?.status === 'ok'
                            ? 'Online'
                            : 'Offline'}
                        </span>
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        PostgreSQL 16: {backendHealth?.db === 'connected' ? 'Connected' : 'Disconnected'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Guarantee Box */}
          <div className="alert alert-info border-info-subtle shadow-sm mb-4">
            <div className="d-flex align-items-center gap-3">
              <div style={{ fontSize: '1.8rem' }}>📐</div>
              <div>
                <strong className="d-block">Statutory Escrow Guarantee Formula:</strong>
                <code className="text-dark bg-white px-2 py-1 rounded border">
                  W(worker) + F(welfare) + P(platform) ≡ Gross Booking Amount
                </code>
                <span className="ms-3 text-secondary small">
                  Enforces deterministic zero-leakage accounting across all cooperative transactions.
                </span>
              </div>
            </div>
          </div>

          {/* Persona Card Grid */}
          <div className="row g-4">
            {personas.map((p) => (
              <div key={p.id} className="col-12 col-md-6 col-xl-3">
                <div
                  className={`card h-100 shadow-sm border ${
                    selectedPersona === p.id ? 'border-primary border-2 ring' : 'border-secondary-subtle'
                  }`}
                  style={{ transition: 'transform 0.15s ease-in-out' }}
                >
                  <div className="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                    <span style={{ fontSize: '2rem' }}>{p.icon}</span>
                    <span className={`badge ${p.badgeColor} text-uppercase px-2 py-1`}>
                      {p.role}
                    </span>
                  </div>
                  <div className="card-body">
                    <h3 className="card-title h5 fw-bold mb-2">{p.title}</h3>
                    <p className="card-text text-secondary small mb-3">{p.description}</p>

                    <h6 className="fw-semibold small text-uppercase text-muted mb-2">Key Capabilities</h6>
                    <ul className="list-unstyled small mb-0">
                      {p.features.map((feat, idx) => (
                        <li key={idx} className="mb-1 text-secondary d-flex align-items-baseline">
                          <span className="text-success me-2">✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="card-footer bg-white border-top-0 pb-3 pt-0">
                    <button
                      type="button"
                      className={`btn w-100 ${
                        selectedPersona === p.id ? 'btn-primary' : 'btn-outline-primary'
                      }`}
                      onClick={() => setSelectedPersona(p.id)}
                    >
                      {p.action}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Persona Active View Modal/Banner */}
          {selectedPersona && (
            <div className="alert alert-primary mt-4 shadow-sm d-flex justify-content-between align-items-center">
              <div>
                <strong>Active Portal View:</strong> Switched to{' '}
                <span className="badge bg-primary">
                  {personas.find((p) => p.id === selectedPersona)?.title}
                </span>
                . In Day 2, detailed interactive workflows will mount directly into this view.
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => setSelectedPersona(null)}
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer currentLang={lang} />
    </div>
  );
};
export default App;
