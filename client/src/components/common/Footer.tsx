import React from 'react';
import { ShieldCheckIcon, ScaleIcon, CheckIcon } from './Icons';
import { LegalDocType } from './LegalModal';

interface FooterProps {
  currentLang?: 'en' | 'hi';
  onOpenLegal?: (docId: LegalDocType) => void;
  onSelectNav?: (navId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ currentLang = 'en', onOpenLegal, onSelectNav }) => {
  const handleLinkClick = (e: React.MouseEvent, docId: LegalDocType) => {
    e.preventDefault();
    if (onOpenLegal) {
      onOpenLegal(docId);
    }
  };

  return (
    <footer className="site-footer bg-dark text-light pt-5 pb-4 mt-auto" role="contentinfo">
      <div className="container">
        {/* Trust & E-Commerce Compliance Banner */}
        <div className="p-3 mb-4 rounded-3 border border-secondary border-opacity-25" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
          <div className="row align-items-center g-2 small">
            <div className="col-12 col-md-8">
              <span className="text-warning fw-semibold me-2">
                {currentLang === 'hi' ? 'सहकारी मंच परिचय:' : 'Platform Transparency:'}
              </span>
              <span className="text-secondary">
                {currentLang === 'hi'
                  ? 'सहकार कनेक्ट एक स्वतंत्र सामुदायिक सेवा मंच है जो नागरिकों को पंजीकृत प्राथमिक सेवा सहकारी समितियों (PSCS) के सत्यापित स्थानीय कारीगरों से जोड़ता है। बहु-राज्य सहकारी सोसायटी अधिनियम, 2002 (यथासंशोधित 2023) के सहकारी सिद्धांतों के अनुरूप संचालित।'
                  : 'SahakarConnect is a community digital platform connecting households with verified local tradespeople from registered Primary Service Cooperatives under the Multi-State Co-operative Societies Act, 2002 (as amended in 2023).'}
              </span>
            </div>
            <div className="col-12 col-md-4 text-md-end">
              <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-25">
                E-Commerce Rules 2020 Compliant
              </span>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="footer-grid">
          {/* Col 1: Entity Info */}
          <div className="footer-col">
            <h4 className="text-white h6 fw-bold mb-3">
              {currentLang === 'hi' ? 'सहकार कनेक्ट' : 'SahakarConnect Platform'}
            </h4>
            <p className="text-secondary small mb-2" style={{ lineHeight: 1.6 }}>
              {currentLang === 'hi'
                ? 'शहरी घरेलू सेवाओं (नलसाजी, विद्युत, बढ़ईगीरी एवं उपकरण) के लिए भारत का पारदर्शी सहकारी मंच। 88% प्रत्यक्ष कामगार पारिश्रमिक और 30-दिन की कार्य वारंटी।'
                : 'A community-powered platform for household trade services (plumbing, electrical, carpentry, appliances) ensuring 88% direct worker pay and 30-day workmanship warranty.'}
            </p>
            <div className="text-secondary small">
              <strong>Support:</strong> support@sahakarconnect.in<br />
              <strong>Helpdesk:</strong> 1800-202-3000 (Mon-Sat, 9AM-7PM)
            </div>
          </div>

          {/* Col 2: Mandatory Policies */}
          <div className="footer-col">
            <h4 className="text-white h6 fw-bold mb-3">
              {currentLang === 'hi' ? 'अनिवार्य नीतियां' : 'Mandatory Policies'}
            </h4>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <a href="#terms" className="text-secondary text-decoration-none" onClick={(e) => handleLinkClick(e, 'terms')}>
                  {currentLang === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service'}
                </a>
              </li>
              <li className="mb-2">
                <a href="#privacy" className="text-secondary text-decoration-none" onClick={(e) => handleLinkClick(e, 'privacy')}>
                  {currentLang === 'hi' ? 'गोपनीयता नीति (DPDP 2023)' : 'Privacy Policy (DPDP Act 2023)'}
                </a>
              </li>
              <li className="mb-2">
                <a href="#hyperlink" className="text-secondary text-decoration-none" onClick={(e) => handleLinkClick(e, 'hyperlink')}>
                  {currentLang === 'hi' ? 'हाइपरलिंक व अस्वीकरण' : 'Hyperlink Policy & Disclaimers'}
                </a>
              </li>
              <li className="mb-2">
                <a href="#disclaimer" className="text-secondary text-decoration-none" onClick={(e) => handleLinkClick(e, 'disclaimer')}>
                  {currentLang === 'hi' ? 'कॉपीराइट नीति' : 'Intellectual Property & Content'}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Grievance Officer Details */}
          <div className="footer-col">
            <h4 className="text-white h6 fw-bold mb-3">
              {currentLang === 'hi' ? 'शिकायत निवारण अधिकारी' : 'Grievance Redressal'}
            </h4>
            <div className="text-secondary small mb-2">
              <strong>Officer:</strong> Sh. R. K. Sharma<br />
              <strong>Email:</strong> grievance@sahakarconnect.in<br />
              <strong>Address:</strong> SahakarConnect Platform Desk, Connaught Place, New Delhi 110001
            </div>
            <div className="text-secondary small">
              Per Consumer Protection (E-Commerce) Rules, 2020:
              <ul className="ps-3 mt-1 mb-0">
                <li>Acknowledgment within 48 hours</li>
                <li>Resolution within 15 working days</li>
              </ul>
            </div>
          </div>

          {/* Col 4: Consumer Protection & Cooperative Principles */}
          <div className="footer-col">
            <h4 className="text-white h6 fw-bold mb-3">
              {currentLang === 'hi' ? 'सुरक्षा व मानक' : 'Trust & Safety Standards'}
            </h4>
            <ul className="list-unstyled small">
              <li className="mb-2 d-flex align-items-center gap-2 text-secondary">
                <ShieldCheckIcon size={14} color="#22c55e" />
                <span>{currentLang === 'hi' ? 'सत्यापित सहकारी कारीगर' : 'Verified Cooperative Tradespeople'}</span>
              </li>
              <li className="mb-2 d-flex align-items-center gap-2 text-secondary">
                <ScaleIcon size={14} color="#22c55e" />
                <span>{currentLang === 'hi' ? '4-अंकीय पिन से सुरक्षित भुगतान' : 'Pay After Work with 4-Digit PIN'}</span>
              </li>
              <li className="mb-2 d-flex align-items-center gap-2 text-secondary">
                <CheckIcon size={14} color="#22c55e" />
                <span>{currentLang === 'hi' ? '30-दिवसीय कार्य वारंटी' : '30-Day Workmanship Warranty'}</span>
              </li>
            </ul>

            {/* Subtle Partner Access Link */}
            <div className="pt-2 border-top border-secondary border-opacity-25 mt-3">
              <a
                href="#login"
                className="text-secondary small text-decoration-none d-inline-flex align-items-center gap-1"
                onClick={(e) => {
                  e.preventDefault();
                  if (onSelectNav) onSelectNav('login');
                  else window.location.href = '#login';
                }}
              >
                <span>🔒 Partner &amp; Admin Sign In →</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom border-top border-secondary border-opacity-25 pt-3 mt-4 d-flex justify-content-between align-items-center flex-wrap gap-2 text-secondary small">
          <div>
            © 2026 SahakarConnect Technologies Platform. All rights reserved.
          </div>
          <div className="small text-secondary">
            Multi-State Co-operative Societies Act, 2002 (as amended in 2023) Compliant Architecture
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
