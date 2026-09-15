import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  ScaleIcon,
  DocumentIcon,
  EmblemIcon,
} from './Icons';

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

  if (!docId) return null;

  const docs = [
    { id: 'terms' as LegalDocType, title: lang === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service' },
    { id: 'privacy' as LegalDocType, title: lang === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy' },
    { id: 'hyperlink' as LegalDocType, title: lang === 'hi' ? 'हाइपरलिंकिंग नीति' : 'Hyperlink Policy' },
    { id: 'disclaimer' as LegalDocType, title: lang === 'hi' ? 'कॉपीराइट व अस्वीकरण' : 'Copyright & Disclaimer' },
    { id: 'mscs-act' as LegalDocType, title: lang === 'hi' ? 'एमएससीएस अधिनियम 2023' : 'MSCS Act 2023 Provisions' },
    { id: 'welfare-fund' as LegalDocType, title: lang === 'hi' ? 'कल्याण निधि नियम' : 'Welfare Fund Rules' },
    { id: 'statutory-reserves' as LegalDocType, title: lang === 'hi' ? 'सांविधिक आरक्षित दिशानिर्देश' : 'Statutory Reserve Rules' },
    { id: 'grievance' as LegalDocType, title: lang === 'hi' ? 'शिकायत निवारण तंत्र' : 'Grievance Redressal' },
  ];

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1060 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0">
          {/* Header */}
          <div className="modal-header bg-dark text-white border-bottom border-secondary py-3 px-4">
            <div className="d-flex align-items-center gap-3">
              <div className="emblem-badge" style={{ width: '36px', height: '36px' }}>
                <EmblemIcon size={22} />
              </div>
              <div>
                <h5 className="modal-title h6 fw-bold mb-0 text-white" id="legal-modal-title">
                  {lang === 'hi'
                    ? 'सहकारिता मंत्रालय - सांविधिक नीतियां एवं नागरिक अधिकार पत्र'
                    : 'Ministry of Cooperation — Statutory Policies & Citizen Charter'}
                </h5>
                <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                  Multi-State Co-operative Societies Act, 2023 | GIGW 3.0 / WCAG 2.1 AA
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          {/* Sub-navigation tabs */}
          <div className="bg-light border-bottom px-3 py-2 d-flex gap-2 overflow-auto">
            {docs.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`btn btn-sm text-nowrap ${
                  activeTab === d.id ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                style={{ fontSize: '0.78rem' }}
                onClick={() => setActiveTab(d.id)}
              >
                {d.title}
              </button>
            ))}
          </div>

          {/* Body content */}
          <div className="modal-body p-4 text-dark" style={{ lineHeight: 1.65, fontSize: '0.92rem' }}>
            {activeTab === 'terms' && (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <ScaleIcon size={22} className="text-primary" />
                  <h4 className="h5 fw-bold mb-0 text-dark">
                    {lang === 'hi' ? 'सहकार कनेक्ट सेवा की शर्तें' : 'SahakarConnect Statutory Terms of Service'}
                  </h4>
                </div>

                <div className="alert alert-light border mb-4">
                  <strong>Statutory Scope:</strong> These Terms of Service constitute a legally binding agreement under the{' '}
                  <em>Multi-State Co-operative Societies (MSCS) Act, 2023</em> between the Citizen Consumer, the Primary Service Cooperative Society (PSCS), and the Member Tradesman.
                </div>

                <h6 className="fw-bold text-dark mt-4">1. Tripartite Escrow Architecture</h6>
                <p className="text-secondary">
                  All booking fees remitted by the citizen are held in an atomic statutory escrow ledger. Payments are strictly allocated according to the transparent tripartite formula:
                </p>
                <ul>
                  <li><strong>88% Direct Remittance:</strong> Guaranteed direct take-home pay to the certified tradesman.</li>
                  <li><strong>8% Statutory Welfare Fund:</strong> Allocated directly to the Cooperative Society’s dedicated Welfare and Social Security account (covering member health, pension, and insurance).</li>
                  <li><strong>4% Platform Reserve Cap:</strong> Strict, non-profit cost-recovery fee for server operations, spatial mapping, and SMS gateways.</li>
                  <li><strong>Deterministic Parity Rule:</strong> Any fractional remainder paisa resulting from division is legally assigned to the tradesman payout. Zero leakage to the platform.</li>
                </ul>

                <h6 className="fw-bold text-dark mt-4">2. Zero-Trust 4-Digit Completion PIN Validation</h6>
                <p className="text-secondary">
                  Escrow release occurs strictly upon the citizen sharing their unique 4-digit verification PIN with the technician following satisfactory service execution. The tradesman submits this PIN via the workplace portal to trigger the atomic double-entry ledger settlement. Neither the society nor the platform can release escrow funds without this customer-generated cryptographic token.
                </p>

                <h6 className="fw-bold text-dark mt-4">3. Cancellation & Refund Policy</h6>
                <p className="text-secondary">
                  Citizens may cancel service requests prior to technician dispatch with a 100% full refund credited to source within 2 hours. If cancelled after technician arrival, a statutory conveyance reimbursement of ₹100 is disbursed to the tradesman from the escrow, with the remaining balance remitted to the citizen.
                </p>

                <h6 className="fw-bold text-dark mt-4">4. Dispute Resolution & Arbitration</h6>
                <p className="text-secondary">
                  In the event of unresolved disputes regarding quality or non-completion, either party may escalate to the Cooperative Society Grievance Redressal Committee. Unresolved disputes shall be subject to statutory arbitration under Section 84 of the MSCS Act, 2023, before the Central Registrar of Cooperative Societies.
                </p>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <ShieldCheckIcon size={22} className="text-success" />
                  <h4 className="h5 fw-bold mb-0 text-dark">
                    {lang === 'hi' ? 'गोपनीयता नीति (DPDP अधिनियम 2023)' : 'Privacy Policy (DPDP Act 2023 Compliance)'}
                  </h4>
                </div>

                <div className="alert alert-light border mb-4">
                  <strong>Digital Personal Data Protection Act, 2023:</strong> SahakarConnect operates as a sovereign government data fiduciary committed to complete citizen and tradesman privacy.
                </div>

                <h6 className="fw-bold text-dark mt-4">1. Data Collected & Lawful Purpose</h6>
                <p className="text-secondary">
                  We process only the minimum necessary information: mobile numbers for OTP authentication, addresses for localized service delivery, and tradesman Aadhaar/police e-KYC credentials for public safety verification.
                </p>

                <h6 className="fw-bold text-dark mt-4">2. Uber H3 Spatial Privacy Masking</h6>
                <p className="text-secondary">
                  Citizen exact coordinates are transformed into Uber H3 Resolution-8 hexagonal grid indexes (~460-meter radius). Precise street-level coordinates are exposed only to the single accepted tradesman dispatched to the job, and expunged from the real-time dispatch index upon job completion.
                </p>

                <h6 className="fw-bold text-dark mt-4">3. Non-Monetization Guarantee</h6>
                <p className="text-secondary">
                  Personal data is never monetized, profiled for commercial advertising, or transferred to private aggregators. All data resides within MeitY-empanelled sovereign cloud infrastructure on Indian territory.
                </p>

                <h6 className="fw-bold text-dark mt-4">4. Citizen Rights</h6>
                <p className="text-secondary">
                  Users possess statutory rights to review their processed records, request correction of inaccuracies, and file grievances with our Data Protection Officer at <code>dpo@sahakar.gov.in</code>.
                </p>
              </div>
            )}

            {activeTab === 'hyperlink' && (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <DocumentIcon size={22} className="text-secondary" />
                  <h4 className="h5 fw-bold mb-0 text-dark">
                    {lang === 'hi' ? 'हाइपरलिंकिंग नीति' : 'Official Hyperlinking Policy'}
                  </h4>
                </div>
                <h6 className="fw-bold text-dark mt-4">1. Links to External Websites/Portals</h6>
                <p className="text-secondary">
                  At various places on this portal, you will find links to other government websites/portals (e.g., Ministry of Cooperation, India.gov.in, UX4G). These links are placed for citizen convenience. SahakarConnect is not responsible for the contents or reliability of the linked websites and does not necessarily endorse the views expressed within them.
                </p>

                <h6 className="fw-bold text-dark mt-4">2. Links to SahakarConnect from Other Sites</h6>
                <p className="text-secondary">
                  We do not object to you linking directly to the information hosted on this portal and no prior permission is required for that. However, we do not permit our pages to be loaded into frames on your site. The pages belonging to this portal must load into a newly opened browser window of the user.
                </p>
              </div>
            )}

            {activeTab === 'disclaimer' && (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <DocumentIcon size={22} className="text-secondary" />
                  <h4 className="h5 fw-bold mb-0 text-dark">
                    {lang === 'hi' ? 'कॉपीराइट व अस्वीकरण' : 'Copyright & Statutory Disclaimer'}
                  </h4>
                </div>
                <h6 className="fw-bold text-dark mt-4">1. Copyright Policy</h6>
                <p className="text-secondary">
                  Material featured on this portal may be reproduced free of charge in any format or media without requiring specific permission, subject to the material being reproduced accurately and not being used in a derogatory or misleading context. Where the material is published or issued to others, the source must be prominently acknowledged. The permission to reproduce this material does not extend to any material on this site which is identified as being the copyright of a third party.
                </p>

                <h6 className="fw-bold text-dark mt-4">2. State Emblem Protection</h6>
                <p className="text-secondary">
                  Use of the State Emblem of India on this portal is governed by the <em>State Emblem of India (Prohibition of Improper Use) Act, 2005</em>. Unauthorized reproduction, copying, or commercial exploitation is strictly prohibited and punishable under law.
                </p>

                <h6 className="fw-bold text-dark mt-4">3. Disclaimer of Operational Warranty</h6>
                <p className="text-secondary">
                  While every effort is made to ensure tradesman skill qualifications through NSQF Level certification checks and police verification, the cooperative society acts as an institutional facilitator. Technicians operate as autonomous member-owners.
                </p>
              </div>
            )}

            {activeTab === 'mscs-act' && (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <ScaleIcon size={22} className="text-primary" />
                  <h4 className="h5 fw-bold mb-0 text-dark">
                    {lang === 'hi' ? 'बहु-राज्य सहकारी सोसायटी अधिनियम 2023 विनिर्देश' : 'Multi-State Co-operative Societies Act, 2023 Provisions'}
                  </h4>
                </div>
                <h6 className="fw-bold text-dark mt-4">Statutory Sections & Mandates</h6>
                <div className="table-responsive border rounded bg-white mt-3">
                  <table className="table table-bordered mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th>Act Section</th>
                        <th>Statutory Mandate</th>
                        <th>Implementation in SahakarConnect</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="fw-bold">Section 63</td>
                        <td>Mandatory reserve fund allocation (minimum 25% of net cooperative surplus).</td>
                        <td>Automated ledger rules reserve 25% of society surplus before member dividends.</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Section 84</td>
                        <td>Settlement of cooperative disputes via designated statutory arbitration.</td>
                        <td>Online dispute escalation to District Registrar with immutable ledger logs.</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Section 39</td>
                        <td>Democratic member control: One member, one vote principle.</td>
                        <td>Cryptographically enforced polling portal preventing double voting.</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Section 70</td>
                        <td>Statutory audit and annual accounts presentation to General Body.</td>
                        <td>One-click CSV ledger export for certified cooperative auditors.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'welfare-fund' && (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <ShieldCheckIcon size={22} className="text-success" />
                  <h4 className="h5 fw-bold mb-0 text-dark">
                    {lang === 'hi' ? 'सहकारी कल्याण निधि लेखांकन नियम' : 'Welfare Fund Accounting & Disbursement Rules'}
                  </h4>
                </div>
                <h6 className="fw-bold text-dark mt-4">1. Accumulation Architecture</h6>
                <p className="text-secondary">
                  8% of gross service volume on every completed job is deducted prior to tradesman payout and credited to the Primary Service Cooperative Society Welfare Fund account.
                </p>

                <h6 className="fw-bold text-dark mt-4">2. Permissible Welfare Disbursements</h6>
                <p className="text-secondary">
                  Under society bylaws, the Welfare Fund is strictly earmarked for:
                </p>
                <ul>
                  <li><strong>Medical Emergency Assistance:</strong> Up to ₹35,000 per member annum for hospitalization.</li>
                  <li><strong>Group Term Life & Accident Cover:</strong> Subsidized insurance coverage of ₹5,00,000 per active tradesman.</li>
                  <li><strong>Tool & Equipment Upgrade Subsidy:</strong> 50% matching grant for NSQF-certified tool purchase.</li>
                  <li><strong>Retirement Gratuity:</strong> Long-term cooperative tenure gratuity upon reaching 60 years of age.</li>
                </ul>
              </div>
            )}

            {activeTab === 'statutory-reserves' && (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <ScaleIcon size={22} className="text-dark" />
                  <h4 className="h5 fw-bold mb-0 text-dark">
                    {lang === 'hi' ? 'सांविधिक आरक्षित निधि दिशानिर्देश' : 'Statutory Reserve Accounting Guidelines'}
                  </h4>
                </div>
                <p className="text-secondary">
                  Every Primary Service Cooperative Society registered under MSCS Act 2023 must maintain a <strong>Statutory Reserve Fund</strong> to safeguard member capital against operational distress:
                </p>
                <ul>
                  <li>No distribution of dividends or patronage refunds can occur until the statutory 25% allocation is satisfied.</li>
                  <li>Statutory reserve balances are locked in RBI-approved nationalized banks or District Central Cooperative Banks (DCCB).</li>
                  <li>Reserve balances are subject to bi-annual audit by the Central Registrar of Cooperative Societies.</li>
                </ul>
              </div>
            )}

            {activeTab === 'grievance' && (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <DocumentIcon size={22} className="text-danger" />
                  <h4 className="h5 fw-bold mb-0 text-dark">
                    {lang === 'hi' ? 'नागरिक अधिकार पत्र व शिकायत निवारण' : 'Citizen Charter & Grievance Redressal Mechanism'}
                  </h4>
                </div>
                <h6 className="fw-bold text-dark mt-4">Service Level Agreements (SLA)</h6>
                <div className="table-responsive border rounded bg-white mt-3">
                  <table className="table table-bordered mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th>Grievance Category</th>
                        <th>First Acknowledgment</th>
                        <th>Target Resolution SLA</th>
                        <th>Escalation Officer</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Billing / Escrow Mismatch</td>
                        <td>2 Hours</td>
                        <td>24 Hours</td>
                        <td>Society Financial Secretary</td>
                      </tr>
                      <tr>
                        <td>Service Quality & Incomplete Work</td>
                        <td>4 Hours</td>
                        <td>48 Hours</td>
                        <td>District Trades Quality Committee</td>
                      </tr>
                      <tr>
                        <td>Tradesman Verification / e-KYC Appeal</td>
                        <td>12 Hours</td>
                        <td>7 Days</td>
                        <td>Cooperative Society Registrar</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h6 className="fw-bold text-dark mt-4">Contacting the Grievance Redressal Officer (GRO)</h6>
                <p className="text-secondary small">
                  Address: Ministry of Cooperation, Atal Akshay Urja Bhawan, Pragati Vihar, New Delhi - 110003<br />
                  Email: <code>grievance.coop@gov.in</code> | Toll-Free Helpline: <strong>1800-11-2026</strong> (09:00 AM – 06:00 PM, Mon–Sat)
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="modal-footer bg-light border-top d-flex justify-content-between">
            <div className="small text-muted">
              Official Publication — Ministry of Cooperation, Government of India
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => window.print()}
              >
                Print / Save Document
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary px-4"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
