import React from 'react';
import { ShieldCheckIcon, ScaleIcon, DocumentIcon } from './Icons';
import { LegalDocType } from './LegalModal';

interface FooterProps {
  currentLang?: 'en' | 'hi';
  onOpenLegal?: (docId: LegalDocType) => void;
}

export const Footer: React.FC<FooterProps> = ({ currentLang = 'en', onOpenLegal }) => {
  const handleLinkClick = (e: React.MouseEvent, docId: LegalDocType) => {
    e.preventDefault();
    if (onOpenLegal) {
      onOpenLegal(docId);
    }
  };

  return (
    <footer className="ux4g-footer pt-4 pb-3 mt-auto" role="contentinfo">
      <div className="container-fluid px-4">
        {/* Compliance Notice Banner */}
        <div className="compliance-box py-2 px-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="small">
            <span className="fw-bold">
              {currentLang === 'hi' ? 'वैधानिक अनुपालन:' : 'Statutory Compliance:'}
            </span>{' '}
            {currentLang === 'hi'
              ? 'बहु-राज्य सहकारी सोसायटी अधिनियम, 2023 और सहकारिता मंत्रालय, भारत सरकार के दिशा-निर्देशों के अनुसार संचालित।'
              : 'Operating under the provisions of the Multi-State Co-operative Societies Act, 2023, Ministry of Cooperation, Government of India.'}
          </div>
          <span className="badge bg-secondary">Government of India Standard</span>
        </div>

        {/* Links Grid */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-4">
            <div className="text-uppercase fw-bold text-light small mb-2">
              {currentLang === 'hi' ? 'सहकार कनेक्ट परिचय' : 'About SahakarConnect'}
            </div>
            <p className="small footer-subtext mb-2">
              National statutory digital infrastructure for Primary Service Cooperative Societies (PSCS). Provides multi-tenant double-entry ledger accounting, tradesmen e-KYC, and democratic governance.
            </p>
            <div className="small footer-subtext">
              Standardized under GIGW 3.0 guidelines and official UX4G design specifications.
            </div>
          </div>

          <div className="col-6 col-md-2">
            <div className="text-uppercase fw-bold text-light small mb-2">
              {currentLang === 'hi' ? 'अनिवार्य नीतियां' : 'Mandatory Policies'}
            </div>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={(e) => handleLinkClick(e, 'terms')}
                >
                  {currentLang === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service'}
                </button>
              </li>
              <li className="mb-2">
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={(e) => handleLinkClick(e, 'privacy')}
                >
                  {currentLang === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}
                </button>
              </li>
              <li className="mb-2">
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={(e) => handleLinkClick(e, 'hyperlink')}
                >
                  {currentLang === 'hi' ? 'हाइपरलिंकिंग नीति' : 'Hyperlink Policy'}
                </button>
              </li>
              <li className="mb-2">
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={(e) => handleLinkClick(e, 'disclaimer')}
                >
                  {currentLang === 'hi' ? 'कॉपीराइट व अस्वीकरण' : 'Copyright & Disclaimer'}
                </button>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <div className="text-uppercase fw-bold text-light small mb-2">
              {currentLang === 'hi' ? 'वैधानिक ढांचा' : 'Statutory Framework'}
            </div>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={(e) => handleLinkClick(e, 'mscs-act')}
                >
                  {currentLang === 'hi' ? 'एमएससीएस अधिनियम 2023' : 'MSCS Act 2023 Provisions'}
                </button>
              </li>
              <li className="mb-2">
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={(e) => handleLinkClick(e, 'welfare-fund')}
                >
                  {currentLang === 'hi' ? 'कल्याण निधि नियम' : 'Welfare Fund Rules'}
                </button>
              </li>
              <li className="mb-2">
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={(e) => handleLinkClick(e, 'statutory-reserves')}
                >
                  {currentLang === 'hi' ? 'सांविधिक आरक्षित दिशानिर्देश' : 'Statutory Reserve Guidelines'}
                </button>
              </li>
              <li className="mb-2">
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={(e) => handleLinkClick(e, 'grievance')}
                >
                  {currentLang === 'hi' ? 'शिकायत निवारण तंत्र' : 'Grievance Redressal'}
                </button>
              </li>
            </ul>
          </div>

          <div className="col-12 col-md-3">
            <div className="text-uppercase fw-bold text-light small mb-2">
              {currentLang === 'hi' ? 'सुरक्षा व मानक' : 'Security & Standards'}
            </div>
            <div className="small footer-subtext mb-2 d-flex align-items-center gap-2">
              <ShieldCheckIcon size={16} />
              <span>Zero-Leakage Tripartite Escrow</span>
            </div>
            <div className="small footer-subtext mb-2 d-flex align-items-center gap-2">
              <ScaleIcon size={16} />
              <span>Double-Entry Deterministic Ledger</span>
            </div>
            <div className="small footer-subtext mb-2 d-flex align-items-center gap-2">
              <DocumentIcon size={16} />
              <span>WCAG 2.1 Level AA Compliant</span>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="border-top border-secondary pt-3 mt-3 d-flex justify-content-between align-items-center flex-wrap small footer-subtext">
          <div>
            &copy; {new Date().getFullYear()} Ministry of Cooperation, Government of India.
          </div>
          <div>
            Content managed by National Council for Cooperative Training (NCCT).
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
