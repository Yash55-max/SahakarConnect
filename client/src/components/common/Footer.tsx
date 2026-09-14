import React from 'react';
import { ShieldCheckIcon } from './Icons';

interface FooterProps {
  currentLang?: 'en' | 'hi';
}

export const Footer: React.FC<FooterProps> = ({ currentLang = 'en' }) => {
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
            <div className="text-uppercase fw-bold text-light small mb-2">About SahakarConnect</div>
            <p className="small text-muted mb-2">
              National digital platform for Primary Service Cooperative Societies (PSCS). Provides multi-tenant ledger accounting, member verification, and governance operations.
            </p>
            <div className="small text-muted">
              Standardized under GIGW 3.0 guidelines and UX4G design specifications.
            </div>
          </div>

          <div className="col-6 col-md-2">
            <div className="text-uppercase fw-bold text-light small mb-2">Mandatory Policies</div>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <a href="#terms">Terms of Service</a>
              </li>
              <li className="mb-2">
                <a href="#privacy">Privacy Policy</a>
              </li>
              <li className="mb-2">
                <a href="#hyperlink-policy">Hyperlink Policy</a>
              </li>
              <li className="mb-2">
                <a href="#disclaimer">Copyright &amp; Disclaimer</a>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <div className="text-uppercase fw-bold text-light small mb-2">Statutory Framework</div>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <a href="#ms-coop-act">Multi-State Co-operative Societies Act, 2023</a>
              </li>
              <li className="mb-2">
                <a href="#welfare-fund">Welfare Fund Accounting Rules</a>
              </li>
              <li className="mb-2">
                <a href="#statutory-reserves">Statutory Reserve Guidelines</a>
              </li>
              <li className="mb-2">
                <a href="#grievance">Grievance Redressal Mechanism</a>
              </li>
            </ul>
          </div>

          <div className="col-12 col-md-3">
            <div className="text-uppercase fw-bold text-light small mb-2">Security &amp; Standards</div>
            <div className="small text-muted mb-2 d-flex align-items-center gap-2">
              <ShieldCheckIcon size={16} />
              <span>Zero-Leakage Tripartite Escrow</span>
            </div>
            <div className="small text-muted mb-2">
              Sovereign Cloud Infrastructure
            </div>
            <div className="small text-muted">
              WCAG 2.1 Level AA Compliant
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="border-top border-secondary pt-3 mt-3 d-flex justify-content-between align-items-center flex-wrap small text-muted">
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
