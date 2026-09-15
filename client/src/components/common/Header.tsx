import React, { useState, useEffect, useRef } from 'react';
import {
  EmblemIcon,
  HomeIcon,
  ConsumerIcon,
  ProviderIcon,
  AdminIcon,
  RegulatorIcon,
  SearchIcon,
  TranslateIcon,
  HelpCircleIcon,
  RefreshCwIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  IndianFlagIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  ScaleIcon,
  LockIcon,
  CalculatorIcon,
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
  const [megaMenuOpen, setMegaMenuOpen] = useState<boolean>(false);
  const [guidesDropdownOpen, setGuidesDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const guidesRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setMegaMenuOpen(false);
      }
      if (guidesRef.current && !guidesRef.current.contains(event.target as Node)) {
        setGuidesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const normalizedTheme = theme === 'high-contrast' ? 'contrast' : theme;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('plumb') || q.includes('pipe') || q.includes('leak')) {
      onSelectNav('portal:plumbing');
    } else if (q.includes('elect') || q.includes('wire') || q.includes('fuse')) {
      onSelectNav('portal:electrical');
    } else if (q.includes('carp') || q.includes('wood') || q.includes('door')) {
      onSelectNav('portal:carpentry');
    } else if (q.includes('appl') || q.includes('ac') || q.includes('fridge')) {
      onSelectNav('portal:appliances');
    } else if (q.includes('provid') || q.includes('worker') || q.includes('artisan')) {
      onSelectNav('provider');
    } else if (q.includes('society') || q.includes('pacs') || q.includes('admin')) {
      onSelectNav('coop_admin');
    } else if (q.includes('regulat') || q.includes('ministry') || q.includes('audit')) {
      onSelectNav('regulator');
    } else {
      onSelectNav('consumer');
    }
    setMegaMenuOpen(false);
  };

  const isConsumerActive = activeNav === 'consumer' || activeNav.startsWith('portal:');

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/* ================= UTILITY TOPBAR (GIGW 3.0 & ACCESSIBILITY) ================= */}
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
          </div>
        </div>
      </div>

      {/* ================= HEADER BRANDING ROW (UIDAI myAadhaar Style) ================= */}
      <header className="site-header">
        <div className="container">
          <div className="myaadhaar-branding-row">
            {/* Left: National Emblem Lockup */}
            <div
              className="myaadhaar-emblem-lockup"
              onClick={() => onSelectNav('home')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectNav('home')}
            >
              <div className="myaadhaar-emblem-badge" aria-label="National Emblem of India">
                <EmblemIcon size={26} color="currentColor" />
              </div>
              <div className="myaadhaar-emblem-text">
                <div className="gov-line">
                  {currentLang === 'hi' ? 'भारत सरकार' : 'GOVERNMENT OF INDIA'}
                </div>
                <div className="ministry-line">
                  {currentLang === 'hi'
                    ? 'सहकारिता मंत्रालय | सहकार से समृद्धि'
                    : 'MINISTRY OF COOPERATION'}
                </div>
                <div className="brand-sub">
                  {currentLang === 'hi'
                    ? 'सहकार कनेक्ट — प्राथमिक सेवा सहकारी समिति डिजिटल मंच'
                    : 'SahakarConnect — Primary Service Cooperative Portal'}
                </div>
              </div>
            </div>

            {/* Middle & Right: Search Bar + Language Selector */}
            <div className="myaadhaar-header-tools">
              <form onSubmit={handleSearchSubmit} className="myaadhaar-header-search" role="search">
                <input
                  type="text"
                  placeholder={
                    currentLang === 'hi'
                      ? 'सेवाएं, समितियां, या कौशल खोजें...'
                      : 'Search Services, Hubs, or Schemes...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search services"
                />
                <button type="submit" className="search-btn" aria-label="Submit search">
                  <SearchIcon size={14} color="#ffffff" />
                </button>
              </form>

              {/* Language Selector Pill */}
              <button
                type="button"
                className="myaadhaar-lang-btn"
                onClick={() => onLanguageChange(currentLang === 'en' ? 'hi' : 'en')}
                aria-label="Toggle language between English and Hindi"
                title="Change language"
              >
                <TranslateIcon size={16} />
                <span>{currentLang === 'en' ? 'हिन्दी' : 'English'}</span>
                <ChevronDownIcon size={12} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= SECONDARY NAVIGATION (myAadhaar Style) ================= */}
      <nav className="myaadhaar-navbar" aria-label="Main Navigation" ref={megaMenuRef}>
        <div className="container">
          <div className="myaadhaar-nav-row">
            <div className="myaadhaar-nav-links">
              {/* Home */}
              <button
                type="button"
                className={`myaadhaar-nav-btn ${activeNav === 'home' ? 'active' : ''}`}
                onClick={() => {
                  onSelectNav('home');
                  setMegaMenuOpen(false);
                }}
              >
                <HomeIcon size={16} />
                <span>{currentLang === 'hi' ? 'मुखपृष्ठ' : 'Home'}</span>
              </button>

              {/* Services ∨ (Toggles 5-Column Mega Menu) */}
              <button
                type="button"
                className={`myaadhaar-nav-btn ${megaMenuOpen || isConsumerActive ? 'active' : ''}`}
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                aria-expanded={megaMenuOpen}
                aria-haspopup="true"
              >
                <ConsumerIcon size={16} />
                <span>{currentLang === 'hi' ? 'सेवाएं' : 'Services'}</span>
                <ChevronDownIcon size={12} />
              </button>

              {/* Cooperative Hubs */}
              <button
                type="button"
                className={`myaadhaar-nav-btn ${activeNav === 'coop_admin' ? 'active' : ''}`}
                onClick={() => {
                  onSelectNav('coop_admin');
                  setMegaMenuOpen(false);
                }}
              >
                <AdminIcon size={16} />
                <span>{currentLang === 'hi' ? 'सहकारी केंद्र' : 'Cooperative Hubs'}</span>
              </button>

              {/* Tradesman Workplace */}
              <button
                type="button"
                className={`myaadhaar-nav-btn ${activeNav === 'provider' ? 'active' : ''}`}
                onClick={() => {
                  onSelectNav('provider');
                  setMegaMenuOpen(false);
                }}
              >
                <ProviderIcon size={16} />
                <span>{currentLang === 'hi' ? 'श्रमयोगी कार्यक्षेत्र' : 'Tradesman Workplace'}</span>
              </button>

              {/* Statutory Guides ∨ */}
              <div style={{ position: 'relative' }} ref={guidesRef}>
                <button
                  type="button"
                  className="myaadhaar-nav-btn"
                  onClick={() => setGuidesDropdownOpen(!guidesDropdownOpen)}
                  aria-expanded={guidesDropdownOpen}
                >
                  <ScaleIcon size={16} />
                  <span>{currentLang === 'hi' ? 'मार्गदर्शिकाएं' : 'Guides'}</span>
                  <ChevronDownIcon size={12} />
                </button>

                {guidesDropdownOpen && (
                  <div
                    className="nav-dropdown-menu"
                    style={{ position: 'absolute', top: '100%', left: 0, minWidth: '240px' }}
                  >
                    <a
                      href="#calculator"
                      className="nav-dropdown-item"
                      onClick={() => {
                        onSelectNav('home');
                        setGuidesDropdownOpen(false);
                      }}
                    >
                      <CalculatorIcon size={16} />
                      <span>{currentLang === 'hi' ? 'सांविधिक एस्क्रो गणक' : 'Tripartite Escrow Guide'}</span>
                    </a>
                    <button
                      type="button"
                      className="nav-dropdown-item"
                      onClick={() => {
                        onSelectNav('regulator');
                        setGuidesDropdownOpen(false);
                      }}
                    >
                      <RegulatorIcon size={16} />
                      <span>{currentLang === 'hi' ? 'MSCS अधिनियम 2023 दिशानिर्देश' : 'MSCS Act 2023 Compliance'}</span>
                    </button>
                    <button
                      type="button"
                      className="nav-dropdown-item"
                      onClick={() => {
                        onSelectNav('consumer');
                        setGuidesDropdownOpen(false);
                      }}
                    >
                      <ShieldCheckIcon size={16} />
                      <span>{currentLang === 'hi' ? 'नागरिक अधिकार व सुरक्षा' : 'Consumer Protection Charter'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Switch Portal ↻ */}
              <button
                type="button"
                className="myaadhaar-nav-btn"
                onClick={() => onSwitchPersona?.() || onSelectNav('home')}
                title="Switch between Citizen, Tradesman, Admin, and Regulator roles"
              >
                <RefreshCwIcon size={15} />
                <span>{currentLang === 'hi' ? 'पोर्टल बदलें ↻' : 'Switch Portal ↻'}</span>
              </button>

              {/* Help Icon */}
              <button
                type="button"
                className="myaadhaar-nav-btn"
                onClick={() => {
                  onSelectNav('home');
                  const el = document.getElementById('services');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                title="Help & FAQs"
                aria-label="Help"
              >
                <HelpCircleIcon size={16} />
              </button>
            </div>

            {/* Right Action: [ Login ] Pill Button */}
            <div>
              {currentUser ? (
                <button
                  type="button"
                  className="myaadhaar-login-pill"
                  onClick={() => onSelectNav(currentUser.role === 'provider' ? 'provider' : currentUser.role === 'admin' ? 'coop_admin' : 'consumer')}
                  title={`Logged in as ${currentUser.name}`}
                >
                  <LockIcon size={14} color="#fff" />
                  <span>{currentUser.name || 'Dashboard'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="myaadhaar-login-pill"
                  onClick={() => setLoginModalOpen(true)}
                  aria-label="Login to SahakarConnect"
                >
                  <span>{currentLang === 'hi' ? 'लॉग इन' : 'Login'}</span>
                  <ChevronRightIcon size={14} color="#fff" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================= 5-COLUMN MEGA MENU (Faithful myAadhaar Layout) ================= */}
        {megaMenuOpen && (
          <div className="myaadhaar-mega-menu" role="region" aria-label="All Services Directory">
            <div className="container">
              <div className="myaadhaar-mega-cols">
                {/* Column 1: Citizen Services */}
                <div className="myaadhaar-mega-col">
                  <h4>{currentLang === 'hi' ? 'नागरिक सेवाएं' : 'Direct Services'}</h4>
                  <ul>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('portal:plumbing'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'नलसाजी एवं स्वच्छता सेवा' : 'Plumbing & Sanitary Works'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('portal:electrical'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'विद्युत एवं वायरमैन सेवा' : 'Electrical & Wiremen Works'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('portal:carpentry'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'काष्ठशिल्प एवं बढ़ईगीरी' : 'Woodcraft & Carpentry'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('portal:appliances'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'उपकरण मरम्मत सेवा' : 'Appliance Repair Works'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('consumer'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'पारदर्शी एस्क्रो भुगतान' : 'Escrow Payment & PIN'}
                      </button>
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="view-all-link"
                    onClick={() => { onSelectNav('consumer'); setMegaMenuOpen(false); }}
                  >
                    {currentLang === 'hi' ? 'समस्त 20+ सेवाएं देखें →' : 'View All Services →'}
                  </button>
                </div>

                {/* Column 2: Tradesman Workplace */}
                <div className="myaadhaar-mega-col">
                  <h4>{currentLang === 'hi' ? 'श्रमयोगी कार्यक्षेत्र' : 'Tradesman Services'}</h4>
                  <ul>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('provider'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'श्रमयोगी सदस्यता पंजीकरण' : 'Artisan / Provider e-KYC'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('provider'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'कौशल प्रमाणन (BIS/CEA)' : 'Skill Certification (BIS)'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('provider'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? '88% प्रत्यक्ष दैनिक भुगतान' : '88% Daily Direct Payout'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('provider'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'टूल किट एवं सुरक्षा सहायता' : 'Tool Grants & Insurance'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('provider'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'सहकारी मताधिकार व लाभांश' : 'Democratic Voting Shares'}
                      </button>
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="view-all-link"
                    onClick={() => { onSelectNav('provider'); setMegaMenuOpen(false); }}
                  >
                    {currentLang === 'hi' ? 'श्रमयोगी पोर्टल खोलें →' : 'Open Workplace →'}
                  </button>
                </div>

                {/* Column 3: Cooperative Societies */}
                <div className="myaadhaar-mega-col">
                  <h4>{currentLang === 'hi' ? 'सहकारी समितियां' : 'Cooperative Societies'}</h4>
                  <ul>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('coop_admin'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'प्राथमिक सेवा समिति संबद्धता' : 'Primary Society Affiliation'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('coop_admin'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'उप-नियम अनुपालन फाइलिंग' : 'Digital Bylaw Filings'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('coop_admin'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'पैक्स (PACS) आधुनिकीकरण' : 'PACS Digitization'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('coop_admin'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'सदस्य कल्याण निधि प्रबंधन' : 'Welfare Fund (8%) Audit'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('coop_admin'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'सांविधिक बही-खाता निरीक्षण' : 'Double-Entry Ledger Hub'}
                      </button>
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="view-all-link"
                    onClick={() => { onSelectNav('coop_admin'); setMegaMenuOpen(false); }}
                  >
                    {currentLang === 'hi' ? 'समिति केंद्र खोलें →' : 'Open Society Hub →'}
                  </button>
                </div>

                {/* Column 4: Compliance & Regulator */}
                <div className="myaadhaar-mega-col">
                  <h4>{currentLang === 'hi' ? 'सांविधिक विनियामक' : 'Statutory & Audit'}</h4>
                  <ul>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('regulator'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'सहकारिता मंत्रालय डैशबोर्ड' : 'Ministry Compliance Hub'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('regulator'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'वास्तविक समय आरक्षित अनुपात' : 'Reserve Ratio (15%) Check'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('regulator'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'शून्य-कमीशन ऑडिट लेजर' : 'Zero-Leakage Ledger Audit'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('regulator'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'विवाद निवारण व मध्यस्थता' : 'Dispute Arbitration Desk'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('regulator'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'एंटी-सर्ज मूल्य अनुपालन' : 'Anti-Surge Price Auditor'}
                      </button>
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="view-all-link"
                    onClick={() => { onSelectNav('regulator'); setMegaMenuOpen(false); }}
                  >
                    {currentLang === 'hi' ? 'विनियामक टर्मिनल →' : 'Regulator Terminal →'}
                  </button>
                </div>

                {/* Column 5: Check Status & Verification */}
                <div className="myaadhaar-mega-col">
                  <h4>{currentLang === 'hi' ? 'स्थिति जांचें' : 'Check Status'}</h4>
                  <ul>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('consumer'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'सेवा बुकिंग स्थिति' : 'Check Service Status'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('provider'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'श्रमयोगी साख सत्यापन' : 'Verify Worker Credential'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('coop_admin'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'समिति पंजीकरण स्थिति' : 'Check Society Reg Status'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('regulator'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'सांविधिक जीएसटी चालान' : 'Statutory Invoice & Tax'}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { onSelectNav('consumer'); setMegaMenuOpen(false); }}>
                        {currentLang === 'hi' ? 'निष्पक्ष-व्यापार शिकायत' : 'File Consumer Grievance'}
                      </button>
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="view-all-link"
                    onClick={() => { onSelectNav('consumer'); setMegaMenuOpen(false); }}
                  >
                    {currentLang === 'hi' ? 'सहायता केंद्र →' : 'Citizen Grievance Desk →'}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Banner Strip: App Download */}
            <div className="myaadhaar-mega-download-strip">
              <div className="container">
                <div className="myaadhaar-download-container">
                  <div className="myaadhaar-download-mockup-wrap">
                    {/* CSS Smartphone Mockup */}
                    <div className="myaadhaar-phone-mockup" aria-hidden="true">
                      <div className="myaadhaar-phone-screen">
                        <div style={{ width: '8px', height: '2px', background: '#ffffff', borderRadius: '1px', marginBottom: '4px' }} />
                        <EmblemIcon size={16} color="#ffffff" />
                        <div style={{ fontSize: '7px', fontWeight: 'bold', marginTop: '2px' }}>Sahakar</div>
                      </div>
                    </div>

                    <div className="myaadhaar-download-text">
                      <div className="title">
                        {currentLang === 'hi'
                          ? 'सहकार कनेक्ट ऐप सदैव अपने पास रखें'
                          : 'Keep SahakarConnect always handy'}
                      </div>
                      <div className="sub">
                        {currentLang === 'hi'
                          ? 'सहकार कनेक्ट मोबाइल ऐप डाउनलोड करने के लिए क्यूआर कोड स्कैन करें या स्टोर से इंस्टॉल करें'
                          : 'Scan the QR code or install directly from official application stores'}
                      </div>
                      <div className="myaadhaar-store-badges">
                        <span className="myaadhaar-store-btn">
                          <span>GET IT ON</span>
                          <strong>Google Play</strong>
                        </span>
                        <span className="myaadhaar-store-btn">
                          <span>Download on</span>
                          <strong>App Store</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="myaadhaar-qr-box">
                    <QrCodeIcon size={44} color="#1e293b" />
                    <div style={{ fontSize: '11px', lineHeight: 1.3 }}>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>Official App</div>
                      <div style={{ color: '#64748b' }}>Android &amp; iOS</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ================= DEMO / ACTIVE SESSION STRIP ================= */}
      <div className="container">
        <div
          className="env-strip"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ux4g-sp-4)' }}>
            <span>Statutory Demo Environment</span>
            <span className="badge badge-live">Live API</span>
            <span style={{ fontSize: '11px', color: 'var(--ux4g-text-tertiary)' }}>
              MSCS Act 2023 Parity
            </span>
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

      {/* Quick Login Modal */}
      {loginModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setLoginModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal"
            style={{ maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <EmblemIcon size={20} color="var(--ux4g-primary-600)" />
                <h3 style={{ margin: 0, fontSize: '18px' }}>
                  {currentLang === 'hi' ? 'सहकार कनेक्ट लॉगिन' : 'Login to SahakarConnect'}
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setLoginModalOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                {currentLang === 'hi'
                  ? 'अपनी भूमिका चुनें और तत्काल प्रमाणित कार्यक्षेत्र में प्रवेश करें:'
                  : 'Select your operational role to enter your verified workspace:'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
                  onClick={() => {
                    onSelectNav('consumer');
                    setLoginModalOpen(false);
                  }}
                >
                  <ConsumerIcon size={18} />
                  <div style={{ textAlign: 'left', marginLeft: '8px' }}>
                    <div style={{ fontWeight: 600 }}>Citizen Consumer (OTP Login)</div>
                    <div style={{ fontSize: '11px', opacity: 0.85 }}>Book fair-trade services & verify with 4-digit PIN</div>
                  </div>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
                  onClick={() => {
                    onSelectNav('provider');
                    setLoginModalOpen(false);
                  }}
                >
                  <ProviderIcon size={18} />
                  <div style={{ textAlign: 'left', marginLeft: '8px' }}>
                    <div style={{ fontWeight: 600 }}>Tradesman Member (Aadhaar e-KYC)</div>
                    <div style={{ fontSize: '11px', opacity: 0.85 }}>88% instant daily payout & welfare accumulation</div>
                  </div>
                </button>

                <button
                  type="button"
                  className="btn btn-ghost btn-block"
                  style={{ justifyContent: 'flex-start', padding: '12px 16px', border: '1px solid #cbd5e1' }}
                  onClick={() => {
                    onSelectNav('coop_admin');
                    setLoginModalOpen(false);
                  }}
                >
                  <AdminIcon size={18} />
                  <div style={{ textAlign: 'left', marginLeft: '8px' }}>
                    <div style={{ fontWeight: 600 }}>Cooperative Society Admin (PSCS)</div>
                    <div style={{ fontSize: '11px', opacity: 0.85 }}>Bylaw compliance, e-KYC approvals & ledger</div>
                  </div>
                </button>

                <button
                  type="button"
                  className="btn btn-ghost btn-block"
                  style={{ justifyContent: 'flex-start', padding: '12px 16px', border: '1px solid #cbd5e1' }}
                  onClick={() => {
                    onSelectNav('regulator');
                    setLoginModalOpen(false);
                  }}
                >
                  <RegulatorIcon size={18} />
                  <div style={{ textAlign: 'left', marginLeft: '8px' }}>
                    <div style={{ fontWeight: 600 }}>Central / State Regulator</div>
                    <div style={{ fontSize: '11px', opacity: 0.85 }}>Solvency audit, 15% reserve ratios & oversight</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
