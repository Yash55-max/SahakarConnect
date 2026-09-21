import React, { useState, useEffect, useRef } from 'react';
import {
  CoopLogoIcon,
  SearchIcon,
  TranslateIcon,
  ChevronDownIcon,
  LockIcon,
  MapPinIcon,
  PlumbingIcon,
  ElectricalIcon,
  CarpentryIcon,
  ApplianceIcon,
} from './Icons';
import AuthModal from './AuthModal';

interface HeaderProps {
  currentLang: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
  activeNav: string;
  onSelectNav: (navId: string) => void;
  currentUser?: any | null;
  onSwitchPersona?: () => void;
  onLogout?: () => void;
  onLoginSuccess?: (token: string, user: any) => void;
  theme: 'light' | 'dark' | 'contrast' | 'high-contrast';
  onThemeChange: (theme: 'light' | 'dark' | 'contrast') => void;
  fontChoice?: 'sm' | 'md' | 'lg';
  onFontChoiceChange?: (choice: 'sm' | 'md' | 'lg') => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'हिन्दी', native: 'Hindi' },
  { code: 'mr', label: 'मराठी', native: 'Marathi' },
  { code: 'ta', label: 'தமிழ்', native: 'Tamil' },
  { code: 'te', label: 'తెలుగు', native: 'Telugu' },
  { code: 'kn', label: 'ಕನ್ನಡ', native: 'Kannada' },
];

const CITIES = ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai'];

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  activeNav,
  onSelectNav,
  currentUser,
  onLogout,
  onLoginSuccess,
  theme,
  onThemeChange,
  fontChoice = 'md',
  onFontChoiceChange,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [langMenuOpen, setLangMenuOpen] = useState<boolean>(false);
  const [cityMenuOpen, setCityMenuOpen] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string>('Delhi NCR');
  const [selectedLangCode, setSelectedLangCode] = useState<string>(currentLang);

  const langRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setCityMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSelectedLangCode(currentLang);
  }, [currentLang]);

  const normalizedTheme = theme === 'high-contrast' ? 'contrast' : theme;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('plumb') || q.includes('pipe') || q.includes('leak') || q.includes('drain')) {
      onSelectNav('portal:plumbing');
    } else if (q.includes('elect') || q.includes('wire') || q.includes('fuse') || q.includes('mcb') || q.includes('light')) {
      onSelectNav('portal:electrical');
    } else if (q.includes('carp') || q.includes('wood') || q.includes('door') || q.includes('lock')) {
      onSelectNav('portal:carpentry');
    } else if (q.includes('appl') || q.includes('ac') || q.includes('fridge') || q.includes('ro') || q.includes('wash')) {
      onSelectNav('portal:appliances');
    } else if (q.includes('partner') || q.includes('join') || q.includes('worker') || q.includes('technician')) {
      onSelectNav('provider');
    } else {
      onSelectNav('consumer');
    }
  };

  const handleLanguageSelect = (code: string) => {
    setSelectedLangCode(code);
    if (code === 'hi') {
      onLanguageChange('hi');
    } else {
      onLanguageChange('en');
    }
    setLangMenuOpen(false);
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLangCode) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/* ================= 1. COMPACT UTILITY TOPBAR ================= */}
      <div className="topbar py-1" style={{ fontSize: '0.78rem' }}>
        <div className="container d-flex justify-content-between align-items-center flex-wrap gap-2">
          {/* Location Selector */}
          <div className="d-flex align-items-center gap-2 position-relative" ref={cityRef}>
            <button
              type="button"
              className="btn btn-sm btn-link p-0 text-decoration-none d-flex align-items-center gap-1"
              style={{ color: 'inherit', fontSize: '0.78rem' }}
              onClick={() => setCityMenuOpen(!cityMenuOpen)}
              aria-expanded={cityMenuOpen}
              title="Select your city"
            >
              <MapPinIcon size={14} color="var(--ux4g-primary, #4a2bc2)" />
              <span className="fw-semibold">{selectedCity}</span>
              <ChevronDownIcon size={11} />
            </button>

            {cityMenuOpen && (
              <div
                className="position-absolute bg-white text-dark border rounded shadow-sm py-1"
                style={{ top: '100%', left: 0, zIndex: 1100, minWidth: '150px' }}
              >
                {CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`dropdown-item btn btn-sm w-100 text-start px-3 py-1 ${
                      selectedCity === c ? 'fw-bold text-primary bg-light' : 'text-dark'
                    }`}
                    style={{ fontSize: '0.8rem' }}
                    onClick={() => {
                      setSelectedCity(c);
                      setCityMenuOpen(false);
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            <span className="text-muted d-none d-md-inline">|</span>
            <span className="text-muted d-none d-md-inline" style={{ fontSize: '0.75rem' }}>
              {currentLang === 'hi' ? 'सत्यापित स्थानीय सहकारी नेटवर्क' : 'Verified Local Cooperative Network'}
            </span>
          </div>

          {/* Accessibility Controls & Help */}
          <div className="d-flex align-items-center gap-3">
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

      {/* ================= 2. MAIN CUSTOMER HEADER ================= */}
      <header className="site-header bg-white border-bottom shadow-xs sticky-top" style={{ zIndex: 1040 }}>
        <div className="container py-2 py-md-3">
          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
            {/* Brand Logo & Tagline */}
            <div
              className="d-flex align-items-center gap-2 cursor-pointer text-decoration-none"
              onClick={() => onSelectNav('home')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectNav('home')}
              style={{ cursor: 'pointer' }}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-primary text-white p-2"
                style={{ width: '42px', height: '42px', boxShadow: '0 2px 6px rgba(74,43,194,0.2)' }}
              >
                <CoopLogoIcon size={26} color="#ffffff" />
              </div>
              <div>
                <div className="h5 fw-bold text-dark mb-0 lh-1" style={{ letterSpacing: '-0.02em' }}>
                  Sahakar<span className="text-primary">Connect</span>
                </div>
                <div className="text-muted small" style={{ fontSize: '0.72rem', marginTop: '2px' }}>
                  {currentLang === 'hi' ? 'सामुदायिक गृह सेवाएं' : 'Community Home Services'}
                </div>
              </div>
            </div>

            {/* Central Customer Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-grow-1 mx-lg-4" style={{ maxWidth: '460px' }} role="search">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control rounded-pill pe-5 ps-3"
                  style={{ height: '42px', fontSize: '0.88rem', borderColor: '#cbd5e1' }}
                  placeholder={
                    currentLang === 'hi'
                      ? 'प्लंबर, इलेक्ट्रीशियन, बढ़ई या एसी मरम्मत खोजें...'
                      : 'Search for plumber, electrician, carpenter, AC repair...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search home services"
                />
                <button
                  type="submit"
                  className="btn btn-primary rounded-circle position-absolute end-0 top-50 translate-middle-y me-1 d-flex align-items-center justify-content-center"
                  style={{ width: '34px', height: '34px', padding: 0 }}
                  aria-label="Submit search"
                >
                  <SearchIcon size={15} color="#ffffff" />
                </button>
              </div>
            </form>

            {/* Right Tools: Language + Partner Link + Login Pill */}
            <div className="d-flex align-items-center gap-2 gap-md-3">
              {/* Multi-Language Dropdown */}
              <div className="position-relative" ref={langRef}>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1 px-3 py-1"
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  aria-expanded={langMenuOpen}
                  aria-label="Select language"
                >
                  <TranslateIcon size={14} />
                  <span>{currentLangObj.label}</span>
                  <ChevronDownIcon size={11} />
                </button>

                {langMenuOpen && (
                  <div
                    className="position-absolute end-0 bg-white text-dark border rounded shadow py-1 mt-1"
                    style={{ minWidth: '160px', zIndex: 1100 }}
                  >
                    <div className="px-3 py-1 text-muted fw-bold" style={{ fontSize: '0.7rem', borderBottom: '1px solid #e2e8f0' }}>
                      Select Language / भाषा
                    </div>
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        className={`dropdown-item btn btn-sm w-100 text-start px-3 py-2 d-flex justify-content-between align-items-center ${
                          selectedLangCode === l.code ? 'bg-light text-primary fw-bold' : 'text-dark'
                        }`}
                        style={{ fontSize: '0.8rem' }}
                        onClick={() => handleLanguageSelect(l.code)}
                      >
                        <span>{l.label}</span>
                        <span className="text-muted small" style={{ fontSize: '0.7rem' }}>{l.native}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Partner CTA */}
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none text-dark fw-semibold d-none d-lg-inline-block px-2"
                style={{ fontSize: '0.84rem' }}
                onClick={() => onSelectNav('provider')}
              >
                {currentLang === 'hi' ? 'कारीगर बनें' : 'Become a Partner'}
              </button>

              {/* User Session / Sign In Button */}
              {currentUser ? (
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary rounded-pill d-flex align-items-center gap-1 px-3 py-1"
                    style={{ fontSize: '0.82rem' }}
                    onClick={() =>
                      onSelectNav(
                        currentUser.role === 'PROVIDER'
                          ? 'provider'
                          : currentUser.role === 'COOP_ADMIN' || currentUser.role === 'ADMIN'
                          ? 'coop_admin'
                          : currentUser.role === 'REGULATOR'
                          ? 'regulator'
                          : 'consumer'
                      )
                    }
                    title={`Logged in as ${currentUser.name} (${currentUser.role})`}
                  >
                    <LockIcon size={12} color="#fff" />
                    <span className="text-truncate" style={{ maxWidth: '110px' }}>
                      {currentUser.name.split(' ')[0]}
                    </span>
                  </button>
                  {onLogout && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger rounded-pill px-2 py-1"
                      style={{ fontSize: '0.75rem' }}
                      onClick={onLogout}
                      title={currentLang === 'hi' ? 'लॉगआउट' : 'Sign Out'}
                    >
                      {currentLang === 'hi' ? 'लॉगआउट' : 'Sign Out'}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm btn-primary rounded-pill d-flex align-items-center gap-1 px-3 py-1"
                  style={{ fontSize: '0.84rem', fontWeight: 600 }}
                  onClick={() => onSelectNav('login')}
                  aria-label="Sign in"
                >
                  <LockIcon size={13} color="#fff" />
                  <span>{currentLang === 'hi' ? 'साइन इन' : 'Sign In'}</span>
                </button>
              )}
            </div>
          </div>

          {/* ================= CATEGORY QUICK SHORTCUTS STRIP ================= */}
          <div className="d-flex align-items-center gap-2 mt-2 pt-2 border-top overflow-auto text-nowrap" style={{ scrollbarWidth: 'none' }}>
            <span className="small text-muted me-1 d-none d-sm-inline" style={{ fontSize: '0.75rem' }}>
              {currentLang === 'hi' ? 'श्रेणियां:' : 'Categories:'}
            </span>

            <button
              type="button"
              className={`btn btn-sm py-1 px-3 rounded-pill d-inline-flex align-items-center gap-1 ${
                activeNav === 'home' ? 'btn-primary text-white' : 'btn-light text-dark'
              }`}
              style={{ fontSize: '0.78rem' }}
              onClick={() => onSelectNav('home')}
            >
              <span>{currentLang === 'hi' ? 'सभी सेवाएं' : 'All Services'}</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm py-1 px-3 rounded-pill d-inline-flex align-items-center gap-1 ${
                activeNav === 'portal:plumbing' ? 'btn-primary text-white' : 'btn-light text-dark'
              }`}
              style={{ fontSize: '0.78rem' }}
              onClick={() => onSelectNav('portal:plumbing')}
            >
              <PlumbingIcon size={13} />
              <span>{currentLang === 'hi' ? 'नलसाजी' : 'Plumbing'}</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm py-1 px-3 rounded-pill d-inline-flex align-items-center gap-1 ${
                activeNav === 'portal:electrical' ? 'btn-primary text-white' : 'btn-light text-dark'
              }`}
              style={{ fontSize: '0.78rem' }}
              onClick={() => onSelectNav('portal:electrical')}
            >
              <ElectricalIcon size={13} />
              <span>{currentLang === 'hi' ? 'विद्युत' : 'Electrical'}</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm py-1 px-3 rounded-pill d-inline-flex align-items-center gap-1 ${
                activeNav === 'portal:carpentry' ? 'btn-primary text-white' : 'btn-light text-dark'
              }`}
              style={{ fontSize: '0.78rem' }}
              onClick={() => onSelectNav('portal:carpentry')}
            >
              <CarpentryIcon size={13} />
              <span>{currentLang === 'hi' ? 'बढ़ईगीरी' : 'Carpentry'}</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm py-1 px-3 rounded-pill d-inline-flex align-items-center gap-1 ${
                activeNav === 'portal:appliances' ? 'btn-primary text-white' : 'btn-light text-dark'
              }`}
              style={{ fontSize: '0.78rem' }}
              onClick={() => onSelectNav('portal:appliances')}
            >
              <ApplianceIcon size={13} />
              <span>{currentLang === 'hi' ? 'उपकरण मरम्मत' : 'Appliance Repair'}</span>
            </button>

            <div className="ms-auto d-flex align-items-center gap-2">
              <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.7rem' }}>
                ✓ {currentLang === 'hi' ? 'सत्यापित कारीगर' : 'Verified Tradesmen'}
              </span>
              <span className="badge bg-light text-secondary border" style={{ fontSize: '0.7rem' }}>
                {currentLang === 'hi' ? '30-दिन वारंटी' : '30-Day Warranty'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Authentic Citizen & Member Auth Modal */}
      <AuthModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(token, user) => {
          onLoginSuccess?.(token, user);
          setLoginModalOpen(false);
        }}
        lang={currentLang}
      />
    </>
  );
};

export default Header;
