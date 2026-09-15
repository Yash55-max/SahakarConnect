import React from 'react';
import { ShieldCheckIcon, ScaleIcon, CheckIcon } from './Icons';
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
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        {/* Statutory Compliance Notice Banner */}
        <div className="footer-notice">
          <span>
            <strong>
              {currentLang === 'hi' ? 'वैधानिक अनुपालन:' : 'Statutory compliance:'}
            </strong>{' '}
            {currentLang === 'hi'
              ? 'बहु-राज्य सहकारी सोसायटी अधिनियम, 2023 और सहकारिता मंत्रालय, भारत सरकार के दिशा-निर्देशों के अनुसार संचालित।'
              : 'Operating under the provisions of the Multi-State Co-operative Societies Act, 2023, Ministry of Cooperation, Government of India.'}
          </span>
        </div>

        {/* Links Grid */}
        <div className="footer-grid">
          <div className="footer-col">
            <h4>{currentLang === 'hi' ? 'सहकार कनेक्ट परिचय' : 'About SahakarConnect'}</h4>
            <p>
              {currentLang === 'hi'
                ? 'प्राथमिक सेवा सहकारी समितियों (PSCS) के लिए राष्ट्रीय डिजिटल अवसंरचना। द्वि-प्रविष्टि बही-खाता, श्रमयोगी ई-केवाईसी और लोकतांत्रिक शासन प्रदान करता है।'
                : 'National statutory digital infrastructure for Primary Service Cooperative Societies (PSCS). Provides multi-tenant double-entry ledger accounting, tradesman e-KYC, and democratic governance.'}
            </p>
            <p>
              {currentLang === 'hi'
                ? 'GIGW 3.0 दिशानिर्देशों और आधिकारिक UX4G डिजाइन विनिर्देशों के तहत मानकीकृत।'
                : 'Standardised under GIGW 3.0 guidelines and official UX4G design specifications.'}
            </p>
          </div>

          <div className="footer-col">
            <h4>{currentLang === 'hi' ? 'अनिवार्य नीतियां' : 'Mandatory policies'}</h4>
            <ul>
              <li>
                <a href="#terms" onClick={(e) => handleLinkClick(e, 'terms')}>
                  {currentLang === 'hi' ? 'सेवा की शर्तें' : 'Terms of service'}
                </a>
              </li>
              <li>
                <a href="#privacy" onClick={(e) => handleLinkClick(e, 'privacy')}>
                  {currentLang === 'hi' ? 'गोपनीयता नीति (DPDP 2023)' : 'Privacy policy (DPDP 2023)'}
                </a>
              </li>
              <li>
                <a href="#hyperlink" onClick={(e) => handleLinkClick(e, 'hyperlink')}>
                  {currentLang === 'hi' ? 'हाइपरलिंक नीति' : 'Hyperlink policy'}
                </a>
              </li>
              <li>
                <a href="#copyright" onClick={(e) => handleLinkClick(e, 'disclaimer')}>
                  {currentLang === 'hi' ? 'कॉपीराइट व अस्वीकरण' : 'Copyright & disclaimer'}
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{currentLang === 'hi' ? 'वैधानिक ढांचा' : 'Statutory framework'}</h4>
            <ul>
              <li>
                <a href="#mscs" onClick={(e) => handleLinkClick(e, 'mscs-act')}>
                  {currentLang === 'hi' ? 'एमएससीएस अधिनियम 2023 प्रावधान' : 'MSCS Act 2023 provisions'}
                </a>
              </li>
              <li>
                <a href="#welfare" onClick={(e) => handleLinkClick(e, 'welfare-fund')}>
                  {currentLang === 'hi' ? 'कल्याण निधि नियम' : 'Welfare fund rules'}
                </a>
              </li>
              <li>
                <a href="#reserve" onClick={(e) => handleLinkClick(e, 'statutory-reserves')}>
                  {currentLang === 'hi' ? 'सांविधिक आरक्षित दिशानिर्देश' : 'Statutory reserve guidelines'}
                </a>
              </li>
              <li>
                <a href="#grievance" onClick={(e) => handleLinkClick(e, 'grievance')}>
                  {currentLang === 'hi' ? 'नागरिक अधिकार पत्र' : 'Citizen charter & grievance'}
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{currentLang === 'hi' ? 'सुरक्षा व मानक' : 'Security & standards'}</h4>
            <ul>
              <li className="with-icon">
                <ShieldCheckIcon size={14} color="var(--ux4g-green-300, #80da88)" />
                <span>{currentLang === 'hi' ? 'शून्य-रिसाव त्रिपक्षीय एस्क्रो' : 'Zero-leakage tripartite escrow'}</span>
              </li>
              <li className="with-icon">
                <ScaleIcon size={14} color="var(--ux4g-green-300, #80da88)" />
                <span>{currentLang === 'hi' ? 'द्वि-प्रविष्टि निर्धारक बही' : 'Double-entry deterministic ledger'}</span>
              </li>
              <li className="with-icon">
                <CheckIcon size={14} color="var(--ux4g-green-300, #80da88)" />
                <span>{currentLang === 'hi' ? 'WCAG 2.1 लेवल AA अनुपालन' : 'WCAG 2.1 level AA compliant'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Ministry of Cooperation, Government of India.</p>
          <p>Content managed by National Council for Cooperative Training (NCCT).</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
