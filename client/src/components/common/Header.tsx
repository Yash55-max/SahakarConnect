import React, { useState } from 'react';
import {
  EmblemIcon,
  HomeIcon,
  ConsumerIcon,
  ProviderIcon,
  AdminIcon,
  RegulatorIcon,
} from './Icons';

interface HeaderProps {
  currentLang: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
  activeNav: string;
  onSelectNav: (navId: string) => void;
  currentUser?: any | null;
  onSwitchPersona?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  activeNav,
  onSelectNav,
  currentUser,
  onSwitchPersona,
}) => {
  const [fontSize, setFontSize] = useState<number>(100);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleFontSizeChange = (delta: number) => {
    let newSize = fontSize + delta;
    if (delta === 0) newSize = 100;
    if (newSize < 80) newSize = 80;
    if (newSize > 130) newSize = 130;
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
  };

  const toggleHighContrast = () => {
    const nextVal = !highContrast;
    setHighContrast(nextVal);
    if (nextVal) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  };

  const navLinks = [
    {
      id: 'home',
      label: currentLang === 'hi' ? 'मुखपृष्ठ' : 'Home / Overview',
      Icon: HomeIcon,
    },
    {
      id: 'consumer',
      label: currentLang === 'hi' ? 'नागरिक सेवाएं' : 'Citizen Services',
      Icon: ConsumerIcon,
    },
    {
      id: 'provider',
      label: currentLang === 'hi' ? 'श्रमयोगी कार्यक्षेत्र' : 'Tradesman Workplace',
      Icon: ProviderIcon,
    },
    {
      id: 'coop_admin',
      label: currentLang === 'hi' ? 'समिति प्रशासन' : 'Cooperative Admin',
      Icon: AdminIcon,
    },
    {
      id: 'regulator',
      label: currentLang === 'hi' ? 'विनियामक निरीक्षण' : 'Regulatory Terminal',
      Icon: RegulatorIcon,
    },
  ];

  return (
    <header className="ux4g-header-wrapper" role="banner">
      {/* Top GIGW Accessibility Strip */}
      <div className="accessibility-strip py-1 px-3 border-bottom">
        <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <a href="#main-content" className="visually-hidden-focusable">
              Skip to Main Content
            </a>
            <span className="badge bg-secondary text-uppercase" style={{ fontSize: '0.7rem' }}>
              GIGW 3.0 / WCAG 2.1 AA
            </span>
            <span className="d-none d-md-inline text-white" style={{ fontSize: '0.8rem' }}>
              Government of India | भारत सरकार
            </span>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Font Size Scaling Controls */}
            <div className="btn-group btn-group-sm" role="group" aria-label="Font Size Controls">
              <button
                type="button"
                className="btn btn-outline-light btn-sm py-0 px-2"
                onClick={() => handleFontSizeChange(-10)}
                title="Decrease Font Size"
                aria-label="Decrease Font Size"
              >
                A-
              </button>
              <button
                type="button"
                className="btn btn-outline-light btn-sm py-0 px-2"
                onClick={() => handleFontSizeChange(0)}
                title="Default Font Size"
                aria-label="Default Font Size"
              >
                A
              </button>
              <button
                type="button"
                className="btn btn-outline-light btn-sm py-0 px-2"
                onClick={() => handleFontSizeChange(10)}
                title="Increase Font Size"
                aria-label="Increase Font Size"
              >
                A+
              </button>
            </div>

            {/* High Contrast Mode Toggle */}
            <button
              type="button"
              className={`btn btn-sm py-0 px-2 ${highContrast ? 'btn-warning' : 'btn-outline-light'}`}
              onClick={toggleHighContrast}
              title="Toggle High Contrast"
              aria-label="Toggle High Contrast"
            >
              {highContrast ? 'Standard View' : 'High Contrast'}
            </button>

            {/* Language Selector */}
            <div className="d-flex align-items-center">
              <label htmlFor="lang-selector" className="visually-hidden">
                Select Language
              </label>
              <select
                id="lang-selector"
                className="form-select form-select-sm py-0 bg-dark text-white border-secondary"
                value={currentLang}
                onChange={(e) => onLanguageChange(e.target.value as 'en' | 'hi')}
                aria-label="Language Selector"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Ministry Branding Header */}
      <div className="branding-section py-3 px-3">
        <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div
            className="d-flex align-items-center gap-3"
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectNav('home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectNav('home')}
            aria-label="Go to SahakarConnect Homepage"
          >
            <div className="emblem-badge pe-2">
              <EmblemIcon size={28} />
            </div>

            <div className="ministry-title">
              <div className="ministry-heading">
                {currentLang === 'hi' ? 'सहकारिता मंत्रालय' : 'Ministry of Cooperation'}
              </div>
              <div className="council-subheading">
                {currentLang === 'hi'
                  ? 'राष्ट्रीय सहकारी प्रशिक्षण परिषद (NCCT)'
                  : 'National Council for Cooperative Training (NCCT)'}
              </div>
              <div className="platform-title mt-1">
                SahakarConnect
                <span className="badge bg-light text-dark border ms-2" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                  PSCS Platform
                </span>
              </div>
            </div>
          </div>

          <div className="d-none d-lg-flex align-items-center gap-4 text-end">
            <div className="border-end pe-3">
              <div className="fw-semibold text-dark small">Primary Service Cooperative Societies</div>
              <div className="text-muted small">Multi-State Co-operative Societies Act, 2023</div>
            </div>
            <div className="text-center bg-light px-3 py-2 rounded border">
              <div className="small fw-semibold text-dark">Tripartite Escrow Ledger</div>
              <div className="small text-muted" style={{ fontSize: '0.72rem' }}>Zero-Leakage Accounting</div>
            </div>
          </div>
        </div>
      </div>

      {/* National Tricolor Accent */}
      <div className="tricolor-stripe" aria-hidden="true" />

      {/* Primary UX4G Navigation Bar */}
      <nav className="ux4g-navbar py-0 px-3" aria-label="Primary Navigation">
        <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap">
          {/* Mobile menu toggle */}
          <div className="d-flex d-md-none py-2 justify-content-between w-100 align-items-center">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              Menu
            </button>
            <span className="small fw-bold text-primary text-uppercase">
              {navLinks.find((l) => l.id === activeNav)?.label || 'Overview'}
            </span>
          </div>

          {/* Desktop Nav Items */}
          <div className={`d-md-flex align-items-center flex-wrap ${mobileMenuOpen ? 'd-flex flex-column w-100 py-2' : 'd-none'}`}>
            {navLinks.map((item) => {
              const ItemIcon = item.Icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`ux4g-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onSelectNav(item.id);
                    setMobileMenuOpen(false);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <ItemIcon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Persona / Session Context Controls */}
          <div className="d-none d-md-flex align-items-center gap-2 py-1">
            {activeNav !== 'home' ? (
              <div className="d-flex align-items-center gap-2 bg-light border px-2 py-1 rounded">
                <span className="badge bg-primary text-uppercase" style={{ fontSize: '0.7rem' }}>
                  {currentUser?.role || activeNav}
                </span>
                <span className="small text-dark fw-semibold" style={{ fontSize: '0.8rem' }}>
                  {currentUser?.name || 'Active Session'}
                </span>
                {onSwitchPersona && (
                  <button
                    type="button"
                    className="btn btn-sm btn-link p-0 text-decoration-none ms-1 text-secondary"
                    style={{ fontSize: '0.75rem' }}
                    onClick={onSwitchPersona}
                  >
                    [Switch]
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary py-0 px-2 ms-2"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => onSelectNav('home')}
                >
                  ← Home
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted" style={{ fontSize: '0.78rem' }}>
                  Statutory Demo Environment
                </span>
                <span className="badge bg-success" style={{ fontSize: '0.68rem' }}>
                  Live API
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
