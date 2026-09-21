import React, { useState, useEffect } from 'react';

export type LegalDocType =
  | 'terms'
  | 'privacy'
  | 'hyperlink'
  | 'disclaimer'
  | 'mscs-act'
  | 'welfare-fund'
  | 'statutory-reserves'
  | 'grievance';

interface LegalModalProps {
  docId: LegalDocType | null;
  onClose: () => void;
  lang: 'en' | 'hi';
}

export const LegalModal: React.FC<LegalModalProps> = ({ docId, onClose, lang }) => {
  const [activeTab, setActiveTab] = useState<LegalDocType>(docId || 'terms');

  useEffect(() => {
    if (docId) {
      setActiveTab(docId);
    }
  }, [docId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (docId) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [docId, onClose]);

  if (!docId) return null;

  const tabs = [
    { id: 'terms' as LegalDocType, label: lang === 'hi' ? 'सेवा की शर्तें' : 'Terms of service' },
    { id: 'privacy' as LegalDocType, label: lang === 'hi' ? 'गोपनीयता (DPDP 2023)' : 'Privacy (DPDP 2023)' },
    { id: 'hyperlink' as LegalDocType, label: lang === 'hi' ? 'हाइपरलिंक नीति' : 'Hyperlink policy' },
    { id: 'disclaimer' as LegalDocType, label: lang === 'hi' ? 'कॉपीराइट' : 'Copyright' },
    { id: 'mscs-act' as LegalDocType, label: lang === 'hi' ? 'एमएससीएस अधिनियम 2023' : 'MSCS Act 2023' },
    { id: 'welfare-fund' as LegalDocType, label: lang === 'hi' ? 'कल्याण निधि' : 'Welfare fund' },
    { id: 'statutory-reserves' as LegalDocType, label: lang === 'hi' ? 'आरक्षित दिशानिर्देश' : 'Reserve guidelines' },
    { id: 'grievance' as LegalDocType, label: lang === 'hi' ? 'नागरिक अधिकार पत्र' : 'Citizen charter' },
  ];

  return (
    <div
      className="modal-overlay is-open"
      id="legal-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        {/* Modal Header */}
        <div className="modal-header">
          <h2 id="legal-modal-title">
            {lang === 'hi' ? 'सांविधिक नीतियां व नागरिक अधिकार पत्र' : 'Statutory policies'}
          </h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="modal-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className="modal-tab"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {activeTab === 'terms' && (
            <div className="modal-panel is-active">
              <h3>{lang === 'hi' ? 'सेवा की शर्तें' : 'Terms of service'}</h3>
              <p>
                Use of SahakarConnect is governed by the Multi-State Co-operative Societies (MSCS) Act, 2023
                and byelaws of the relevant Primary Service Cooperative Society (PSCS). Citizens booking a service
                agree to statutory escrow terms: funds release only on entry of the 4-digit completion PIN.
              </p>
              <p>
                Tradesmen registering as PSCS members agree to NSQF skill certification requirements, periodic
                e-KYC renewal, and the cooperative&apos;s one-member-one-vote governance byelaws.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="modal-panel is-active">
              <h3>{lang === 'hi' ? 'गोपनीयता नीति — DPDP अधिनियम 2023' : 'Privacy policy — DPDP Act 2023'}</h3>
              <p>
                Personal data (Aadhaar e-KYC, contact details, service history) is processed strictly for
                service fulfilment, statutory audit, and welfare fund administration, consistent with the
                Digital Personal Data Protection Act, 2023.
              </p>
              <p>
                Data is not shared with private commercial aggregators. Citizens may request access,
                correction, or erasure of their data through the grievance redressal channel.
              </p>
            </div>
          )}

          {activeTab === 'hyperlink' && (
            <div className="modal-panel is-active">
              <h3>{lang === 'hi' ? 'हाइपरलिंक नीति' : 'Hyperlink policy'}</h3>
              <p>
                SahakarConnect may link to external cooperative society and government resources for reference.
                Such links do not constitute an endorsement of the content, products, or services on those sites.
              </p>
            </div>
          )}

          {activeTab === 'disclaimer' && (
            <div className="modal-panel is-active">
              <h3>{lang === 'hi' ? 'कॉपीराइट व अस्वीकरण' : 'Copyright & disclaimer'}</h3>
              <p>
                Content on this platform is owned by SahakarConnect Technologies Platform and participating
                Primary Service Cooperative Societies, unless otherwise stated, and may be referenced with attribution.
              </p>
            </div>
          )}

          {activeTab === 'mscs-act' && (
            <div className="modal-panel is-active">
              <h3>{lang === 'hi' ? 'सहकारी अधिनियम व संगठनात्मक ढांचा' : 'Cooperative Framework'}</h3>
              <p>
                SahakarConnect operates in harmony with the provisions of the Multi-State Co-operative Societies Act,
                2002 (as amended in 2023), which governs the registration, byelaws, and democratic administration of
                participating service cooperatives.
              </p>
              <p>
                The 88/8/4 payment structure is established under the platform&apos;s cooperative fair-share charter,
                guaranteeing that 88% is directly disbursed to skilled tradespeople, 8% is credited to member welfare funds,
                and platform operations are capped at 4%.
              </p>
            </div>
          )}

          {activeTab === 'welfare-fund' && (
            <div className="modal-panel is-active">
              <h3>{lang === 'hi' ? 'कल्याण निधि नियम' : 'Welfare fund rules'}</h3>
              <p>
                The 8% cooperative welfare contribution accumulates in each tradesman&apos;s individual welfare
                account, administered by the cooperative society. Funds cover healthcare, accident insurance,
                pension contributions, and emergency aid, disbursed under society byelaws approved by member vote.
              </p>
            </div>
          )}

          {activeTab === 'statutory-reserves' && (
            <div className="modal-panel is-active">
              <h3>{lang === 'hi' ? 'आरक्षित निधि दिशानिर्देश' : 'Reserve guidelines'}</h3>
              <p>
                Each cooperative society maintains a reserve ratio, audited periodically in accordance with
                cooperative regulations, to guarantee the solvency of the welfare fund and timely member payouts.
              </p>
            </div>
          )}

          {activeTab === 'grievance' && (
            <div className="modal-panel is-active">
              <h3>{lang === 'hi' ? 'नागरिक अधिकार पत्र व शिकायत निवारण' : 'Citizen charter & grievance redressal'}</h3>
              <p>
                Citizens and tradesmen may raise a grievance through our dedicated support desk. In accordance with
                the Consumer Protection (E-Commerce) Rules, 2020, all grievances are acknowledged within 48 hours
                and resolved within 15 working days by our designated Grievance Officer (grievance@sahakarconnect.in).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
