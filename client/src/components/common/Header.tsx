import React, { useState } from 'react';
import { EmblemIcon } from './Icons';

interface HeaderProps {
  currentLang: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentLang, onLanguageChange }) => {
  const [fontSize, setFontSize] = useState<number>(100);
  const [highContrast, setHighContrast] = useState<boolean>(false);

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

  return (
    <header className="ux4g-header-wrapper" role="banner">
      {/* Top GIGW Accessibility Strip */}
      <div className="accessibility-strip py-1 px-3 border-bottom">
        <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap">
          <div className="d-flex align-items-center gap-2">
            <a href="#main-content" className="visually-hidden-focusable">
              Skip to Main Content
            </a>
            <span className="badge bg-secondary text-uppercase" style={{ fontSize: '0.7rem' }}>
              GIGW 3.0 / WCAG 2.1 AA
            </span>
            <span className="d-none d-md-inline" style={{ fontSize: '0.8rem' }}>
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
          <div className="d-flex align-items-center gap-3">
            <div className="emblem-badge pe-2">
              <EmblemIcon size={26} />
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
    </header>
  );
};
export default Header;
