import React, { useState, useEffect, useRef } from 'react';
import {
  EmblemIcon,
  HomeIcon,
  ConsumerIcon,
  ProviderIcon,
  AdminIcon,
  RegulatorIcon,
  PlumbingIcon,
  ElectricalIcon,
  CarpentryIcon,
  ApplianceIcon,
  ChevronDownIcon,
  IndianFlagIcon,
} from './Icons';

interface HeaderProps {
  currentLang: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
  activeNav: string;
  onSelectNav: (navId: string) => void;
  currentUser?: any | null;
  onSwitchPersona?: () => void;
  theme: 'light' | 'dark' | 'contrast' | 'high-contrast';
  onThemeChange: (theme: 'light' | 'dark' | 'contrast') => void;
  fontChoice?: 'sm' | 'md' | 'lg';
  onFontChoiceChange?: (choice: 'sm' | 'md' | 'lg') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  activeNav,
  onSelectNav,
  currentUser,
  onSwitchPersona,
  theme,
  onThemeChange,
  fontChoice = 'md',
  onFontChoiceChange,
}) => {
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setServicesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const normalizedTheme = theme === 'high-contrast' ? 'contrast' : theme;

  const tradePortalsList = [
    {
      id: 'portal:plumbing',
      label: currentLang === 'hi' ? 'नलसाजी एवं स्वच्छता पोर्टल' : 'Plumbing & Sanitary Works Portal',
      sublabel: 'PSCS-DEL-PLUMB-01 | BIS 12183',
      Icon: PlumbingIcon,
    },
    {
      id: 'portal:electrical',
      label: currentLang === 'hi' ? 'विद्युत एवं वायरमैन पोर्टल' : 'Electrical & Wiremen Portal',
      sublabel: 'PSCS-DEL-ELEC-02 | CEA / IS 732',
      Icon: ElectricalIcon,
    },
    {
      id: 'portal:carpentry',
      label: currentLang === 'hi' ? 'काष्ठशिल्प एवं बढ़ईगीरी पोर्टल' : 'Woodcraft & Carpentry Portal',
      sublabel: 'PSCS-DEL-CARP-03 | BIS IS 2202',
      Icon: CarpentryIcon,
    },
    {
      id: 'portal:appliances',
      label: currentLang === 'hi' ? 'उपकरण मरम्मत पोर्टल' : 'Appliance Repair Cooperative',
      sublabel: 'PSCS-DEL-APPL-04 | BEE Star / MoEFCC',
      Icon: ApplianceIcon,
    },
  ];

  const isConsumerActive = activeNav === 'consumer' || activeNav.startsWith('portal:');

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/* ================= UTILITY TOPBAR ================= */}
      <div className="topbar">
        <div className="container topbar-row">
          <div className="topbar-left">
            <span className="topbar-badge">GIGW 3.0 / WCAG 2.1 AA</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <IndianFlagIcon width={18} height={12} />
              <span>Government of India | भारत सरकार</span>
            </span>
          </div>

          <div className="topbar-right">
            {/* Font scaling switcher */}
            <div className="font-switch" role="group" aria-label="Text size">
              <button
                type="button"
                onClick={() => onFontChoiceChange?.('sm')}
                aria-pressed={fontChoice === 'sm'}
                title="Small text"
              >
                A−
              </button>
              <button
                type="button"
                onClick={() => onFontChoiceChange?.('md')}
                aria-pressed={fontChoice === 'md'}
                title="Default text"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => onFontChoiceChange?.('lg')}
                aria-pressed={fontChoice === 'lg'}
                title="Large text"
              >
                A+
              </button>
            </div>

            {/* Colour theme switcher */}
            <div className="theme-switch" role="group" aria-label="Colour theme">
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                aria-pressed={normalizedTheme === 'light'}
                title="Light mode"
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                aria-pressed={normalizedTheme === 'dark'}
                title="Dark mode"
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => onThemeChange('contrast')}
                aria-pressed={normalizedTheme === 'contrast'}
                title="High contrast mode"
              >
                Contrast
              </button>
            </div>

            {/* Language selector */}
            <select
              className="lang-select"
              value={currentLang}
              onChange={(e) => onLanguageChange(e.target.value as 'en' | 'hi')}
              aria-label="Select language"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <header className="site-header">
        <div className="container header-row">
          <div
            className="emblem"
            aria-hidden="true"
            onClick={() => onSelectNav('home')}
            style={{ cursor: 'pointer' }}
          >
            <EmblemIcon size={24} />
          </div>
          <div
            className="header-text-block"
            onClick={() => onSelectNav('home')}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectNav('home')}
          >
            <div className="ministry-line">
              {currentLang === 'hi' ? 'सहकारिता मंत्रालय' : 'MINISTRY OF COOPERATION'}
            </div>
            <div className="council-line">
              {currentLang === 'hi'
                ? 'राष्ट्रीय सहकारी प्रशिक्षण परिषद (NCCT)'
                : 'National Council for Cooperative Training (NCCT)'}
            </div>
            <div className="brand-row">
              <span className="brand-name">SahakarConnect</span>
              <span className="brand-tag">PSCS Platform</span>
            </div>
          </div>
        </div>
      </header>

      {/* ================= PRIMARY NAV ================= */}
      <nav className="site-nav" aria-label="Primary">
        <div className="container">
          <div className="nav-row" id="nav-row">
            {/* Home / Overview */}
            <button
              type="button"
              className="nav-link"
              onClick={() => onSelectNav('home')}
              aria-current={activeNav === 'home' ? 'page' : undefined}
            >
              <HomeIcon size={16} />
              <span>{currentLang === 'hi' ? 'मुखपृष्ठ' : 'Home / Overview'}</span>
            </button>

            {/* Citizen Services with Dropdown */}
            <div className="nav-dropdown-wrapper" ref={dropdownRef}>
              <button
                type="button"
                className="nav-link"
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                aria-current={isConsumerActive ? 'page' : undefined}
                aria-expanded={servicesDropdownOpen}
                aria-haspopup="true"
              >
                <ConsumerIcon size={16} />
                <span>{currentLang === 'hi' ? 'नागरिक सेवाएं' : 'Citizen Services'}</span>
                <ChevronDownIcon size={12} />
              </button>

              {servicesDropdownOpen && (
                <div className="nav-dropdown-menu" role="menu">
                  <div
                    style={{
                      padding: 'var(--ux4g-sp-2) var(--ux4g-sp-6)',
                      fontSize: '11px',
                      color: 'var(--ux4g-text-tertiary)',
                      fontWeight: 'var(--ux4g-fw-semibold)',
                      letterSpacing: '.02em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {currentLang === 'hi' ? 'विशिष्ट सहकारी सेवा पोर्टल' : 'Dedicated Cooperative Portals'}
                  </div>
                  {tradePortalsList.map((tp) => (
                    <button
                      key={tp.id}
                      type="button"
                      className="nav-dropdown-item"
                      onClick={() => {
                        onSelectNav(tp.id);
                        setServicesDropdownOpen(false);
                      }}
                      aria-current={activeNav === tp.id ? 'page' : undefined}
                      role="menuitem"
                    >
                      <tp.Icon size={16} />
                      <div style={{ flex: 1 }}>
                        <div>{tp.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--ux4g-text-tertiary)' }}>{tp.sublabel}</div>
                      </div>
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid var(--ux4g-border-subtle)', margin: 'var(--ux4g-sp-2) 0' }} />
                  <button
                    type="button"
                    className="nav-dropdown-item"
                    onClick={() => {
                      onSelectNav('consumer');
                      setServicesDropdownOpen(false);
                    }}
                    aria-current={activeNav === 'consumer' ? 'page' : undefined}
                    role="menuitem"
                  >
                    <ConsumerIcon size={16} />
                    <div style={{ flex: 1 }}>
                      <div>{currentLang === 'hi' ? 'सभी सेवाएं (कैटलॉग)' : 'All Services Catalog'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--ux4g-text-tertiary)' }}>
                        {currentLang === 'hi' ? 'समस्त 20+ सेवाएं देखें' : 'Browse full 20+ service directory'}
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Tradesman Workplace */}
            <button
              type="button"
              className="nav-link"
              onClick={() => onSelectNav('provider')}
              aria-current={activeNav === 'provider' ? 'page' : undefined}
            >
              <ProviderIcon size={16} />
              <span>{currentLang === 'hi' ? 'श्रमयोगी कार्यक्षेत्र' : 'Tradesman Workplace'}</span>
            </button>

            {/* Cooperative Admin */}
            <button
              type="button"
              className="nav-link"
              onClick={() => onSelectNav('coop_admin')}
              aria-current={activeNav === 'coop_admin' ? 'page' : undefined}
            >
              <AdminIcon size={16} />
              <span>{currentLang === 'hi' ? 'समिति प्रशासन' : 'Cooperative Admin'}</span>
            </button>

            {/* Regulatory Terminal */}
            <button
              type="button"
              className="nav-link"
              onClick={() => onSelectNav('regulator')}
              aria-current={activeNav === 'regulator' ? 'page' : undefined}
            >
              <RegulatorIcon size={16} />
              <span>{currentLang === 'hi' ? 'विनियामक निरीक्षण' : 'Regulatory Terminal'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Environment status strip */}
      <div className="container">
        <div
          className="env-strip"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ux4g-sp-4)' }}>
            <span>Statutory Demo Environment</span>
            <span className="badge badge-live">Live API</span>
          </div>

          {activeNav !== 'home' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ux4g-sp-3)' }}>
              <span className="badge badge-primary">
                {activeNav === 'portal:plumbing'
                  ? 'PLUMBING'
                  : activeNav === 'portal:electrical'
                  ? 'ELECTRICAL'
                  : activeNav === 'portal:carpentry'
                  ? 'CARPENTRY'
                  : activeNav === 'portal:appliances'
                  ? 'APPLIANCES'
                  : currentUser?.role || activeNav.toUpperCase()}
              </span>
              <span style={{ fontSize: 'var(--ux4g-fs-12)', color: 'var(--ux4g-text-secondary)' }}>
                {currentUser?.name || (activeNav.startsWith('portal:') ? 'Citizen Session' : 'Active Session')}
              </span>
              {onSwitchPersona && (
                <button
                  type="button"
                  onClick={onSwitchPersona}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '1px var(--ux4g-sp-3)', fontSize: '11px' }}
                >
                  Switch
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
