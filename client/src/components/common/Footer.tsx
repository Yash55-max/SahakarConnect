import React from 'react';

interface FooterProps {
  currentLang?: 'en' | 'hi';
}

export const Footer: React.FC<FooterProps> = ({ currentLang = 'en' }) => {
  return (
    <footer className="ux4g-footer bg-dark text-white pt-4 pb-3 mt-auto border-top border-primary border-4" role="contentinfo">
      <div className="container-fluid px-4">
        {/* Compliance Notice Banner */}
        <div className="alert alert-secondary text-dark py-2 px-3 mb-4 rounded border-0 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="small">
            <strong>{currentLang === 'hi' ? 'वैधानिक अनुपालन सूचना:' : 'Statutory Compliance Notice:'}</strong>{' '}
            {currentLang === 'hi'
              ? 'बहु-राज्य सहकारी सोसायटी अधिनियम, 2023 और सहकारिता मंत्रालय, भारत सरकार के दिशा-निर्देशों के अनुसार संचालित।'
              : 'Operating in strict conformity with the Multi-State Co-operative Societies Act, 2023 and the guidelines issued by the Ministry of Cooperation, Government of India.'}
          </div>
          <span className="badge bg-primary">Govt. of India Standard</span>
        </div>

        {/* Links Grid */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-4">
            <h6 className="text-uppercase fw-bold text-light mb-3">About SahakarConnect</h6>
            <p className="small text-secondary mb-2">
              SahakarConnect is a unified digital infrastructure empowering Primary Service Cooperative Societies (PSCS) across India with algorithmic job matching, statutory reserve accounting, and transparent democratic governance.
            </p>
            <div className="small text-secondary">
              Designed according to GIGW 3.0 standards and powered by the UX4G Design System.
            </div>
          </div>

          <div className="col-6 col-md-2">
            <h6 className="text-uppercase fw-bold text-light mb-3">Mandatory Policies</h6>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <a href="#terms" className="text-secondary text-decoration-none hover-link">
                  Terms of Service
                </a>
              </li>
              <li className="mb-2">
                <a href="#privacy" className="text-secondary text-decoration-none hover-link">
                  Privacy Policy
                </a>
              </li>
              <li className="mb-2">
                <a href="#hyperlink-policy" className="text-secondary text-decoration-none hover-link">
                  Hyperlink Policy
                </a>
              </li>
              <li className="mb-2">
                <a href="#disclaimer" className="text-secondary text-decoration-none hover-link">
                  Disclaimer &amp; Copyright
                </a>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <h6 className="text-uppercase fw-bold text-light mb-3">Cooperative Governance</h6>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <a href="#ms-coop-act" className="text-secondary text-decoration-none hover-link">
                  MSCS Act 2023 Compliance
                </a>
              </li>
              <li className="mb-2">
                <a href="#welfare-fund" className="text-secondary text-decoration-none hover-link">
                  Worker Welfare Fund Rules
                </a>
              </li>
              <li className="mb-2">
                <a href="#statutory-reserves" className="text-secondary text-decoration-none hover-link">
                  Statutory Reserve Allocations
                </a>
              </li>
              <li className="mb-2">
                <a href="#grievance" className="text-secondary text-decoration-none hover-link">
                  National Cooperative Grievance Cell
                </a>
              </li>
            </ul>
          </div>

          <div className="col-12 col-md-3">
            <h6 className="text-uppercase fw-bold text-light mb-3">Security &amp; Standards</h6>
            <div className="small text-secondary mb-2">
              🔒 End-to-End Escrow &amp; Split-Ledger
            </div>
            <div className="small text-secondary mb-2">
              🇮🇳 Hosted on Secure Sovereign Cloud Infrastructure
            </div>
            <div className="small text-secondary">
              Accessibility: WCAG 2.1 AA Compliant
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="border-top border-secondary pt-3 mt-3 d-flex justify-content-between align-items-center flex-wrap small text-secondary">
          <div>
            &copy; {new Date().getFullYear()} Ministry of Cooperation, Government of India. All rights reserved.
          </div>
          <div>
            Last Updated: September 2026 | Content Managed by National Council for Cooperative Training (NCCT)
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
