import React, { useState } from 'react';
import {
  ConsumerIcon,
  ProviderIcon,
  AdminIcon,
  RegulatorIcon,
  ScaleIcon,
  ShieldCheckIcon,
  CheckIcon,
  MapPinIcon,
  LockIcon,
  VoteIcon,
  EmblemIcon,
  PlumbingIcon,
  ElectricalIcon,
  CarpentryIcon,
  ApplianceIcon,
  StarIcon,
} from '../../components/common/Icons';

interface LandingPageProps {
  lang: 'en' | 'hi';
  onSelectPortal: (portalId: string) => void;
  backendHealth: { status: string; db: string; timestamp?: string } | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  lang,
  onSelectPortal,
  backendHealth: _backendHealth,
}) => {
  const [calcAmount, setCalcAmount] = useState<number>(1200);

  // Compute statutory 88 / 8 / 4 split with MSCS Act 2023 rounding invariant
  const gross = Math.max(0, Number(calcAmount) || 0);
  const welfare = Math.round(gross * 0.08 * 100) / 100;
  const platform = Math.round(gross * 0.04 * 100) / 100;
  const worker = Math.round((gross - welfare - platform) * 100) / 100;

  const quickAmounts = [500, 1200, 2500, 5000, 10000];

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  const tradePortals = [
    {
      id: 'portal:plumbing',
      title: lang === 'hi' ? 'नलसाजी एवं स्वच्छता पोर्टल' : 'Plumbing & Sanitary Works Portal',
      society: 'Delhi Urban Plumbing & Sanitary PSCS',
      code: 'PSCS-DEL-PLUMB-01',
      icon: PlumbingIcon,
      quality: '4.88',
      tradesmen: '42 verified',
      baseline: '₹250',
      description:
        lang === 'hi'
          ? 'पाइपलाइन लीकेज, ड्रेन सफाई, सेनेटरी फिटिंग और जल आपूर्ति प्रणाली की वैधानिक मरम्मत।'
          : 'Statutory sanitary engineering — high-pressure leak resolution, hydro-jet drain unblocking, and RO/tank installations.',
      scope: [
        'High-pressure leak diagnosis',
        'Hydro-jet drain unblocking',
        'Sanitary ware fitting (BIS 12183)',
        'Overhead tank valve overhaul',
      ],
      cta: lang === 'hi' ? 'नलसाजी पोर्टल खोलें' : 'Enter plumbing portal',
    },
    {
      id: 'portal:electrical',
      title: lang === 'hi' ? 'विद्युत एवं वायरमैन पोर्टल' : 'Electrical & Wiremen Portal',
      society: 'Delhi Certified Wiremen & Electricians PSCS',
      code: 'PSCS-DEL-ELEC-02',
      icon: ElectricalIcon,
      quality: '4.92',
      tradesmen: '38 verified',
      baseline: '₹200',
      description:
        lang === 'hi'
          ? 'एमसीबी ट्रिपिंग, वायरिंग रीकंडीशनिंग, अर्थिंग परीक्षण और प्रमाणित वायरमैन द्वारा सुरक्षा ऑडिट।'
          : 'CEA-certified wiremen for circuit load balancing, MCB trip analysis, earthing resistance audits, and surge protection.',
      scope: [
        'Circuit breaker & MCB diagnostics',
        'Complete rewiring & conduiting',
        'Earthing resistance verification',
        'Inverter & UPS panel wiring',
      ],
      cta: lang === 'hi' ? 'विद्युत पोर्टल खोलें' : 'Enter electrical portal',
    },
    {
      id: 'portal:carpentry',
      title: lang === 'hi' ? 'काष्ठशिल्प एवं बढ़ईगीरी पोर्टल' : 'Woodcraft & Carpentry Portal',
      society: 'Indraprastha Woodcraft Artisans PSCS',
      code: 'PSCS-DEL-CARP-03',
      icon: CarpentryIcon,
      quality: '4.85',
      tradesmen: '29 verified',
      baseline: '₹300',
      description:
        lang === 'hi'
          ? 'दरवाजे, खिड़कियां, मॉड्यूलर फर्नीचर संरेखण, ताला प्रतिष्ठापन और कस्टम काष्ठशिल्प सेवाएं।'
          : 'Certified joiners and carpenters for moisture-tested hardwood repairs, acoustic door alignment, modular cabinetry, and mortise locks.',
      scope: [
        'Flush door & acoustic planing',
        'Modular cabinet hinge overhaul',
        'High-security mortise lock fitting',
        'Structural timber reinforcement',
      ],
      cta: lang === 'hi' ? 'बढ़ईगीरी पोर्टल खोलें' : 'Enter carpentry portal',
    },
    {
      id: 'portal:appliances',
      title: lang === 'hi' ? 'उपकरण मरम्मत सहकारी पोर्टल' : 'Appliance Repair Cooperative',
      society: 'Capital Electro-Mechanical & Appliances PSCS',
      code: 'PSCS-DEL-APPL-04',
      icon: ApplianceIcon,
      quality: '4.81',
      tradesmen: '35 verified',
      baseline: '₹350',
      description:
        lang === 'hi'
          ? 'एसी गैस रीफिलिंग, इन्वर्टर रेफ्रिजरेटर, फ्रंट-लोड वॉशिंग मशीन और माइक्रोवेव ओवन की मरम्मत।'
          : 'MoEFCC-compliant certified technicians for inverter compressor repair, sealed R-32 refrigerant recovery, and washing machine drum balancing.',
      scope: [
        'Inverter AC sealed system servicing',
        'Frost-free fridge PCB defrosting',
        'Front-load washing machine damping',
        'Microwave magnetron calibration',
      ],
      cta: lang === 'hi' ? 'उपकरण पोर्टल खोलें' : 'Enter appliance portal',
    },
  ];

  const roleGateways = [
    {
      id: 'consumer',
      title: lang === 'hi' ? 'नागरिक सेवा पोर्टल' : 'Citizen consumer portal',
      sub: 'Statutory rate schedules & certified technicians',
      badge: 'Consumer',
      badgeClass: 'badge-primary',
      icon: ConsumerIcon,
      desc:
        lang === 'hi'
          ? 'सत्यापित सहकारी तकनीशियनों से सेवाएं प्राप्त करें। 4-अंकीय पिन सत्यापन के बाद ही राशि विमुक्त की जाती है।'
          : 'Book certified plumbers, electricians, carpenters and appliance mechanics. Payment is held in statutory escrow until you verify completion with your 4-digit PIN.',
      features: [
        'Instant H3 spatial matching to the nearest tradesman',
        'NSQF level 3–5 skill-certified tradesmen only',
        'Transparent tripartite price breakdown before booking',
        '4-digit PIN, zero-risk escrow release',
      ],
      cta: lang === 'hi' ? 'नागरिक पोर्टल खोलें' : 'Book a certified service',
    },
    {
      id: 'provider',
      title: lang === 'hi' ? 'श्रमयोगी सदस्य कार्यक्षेत्र' : 'Cooperative provider workplace',
      sub: '88% guaranteed take-home & welfare safety net',
      badge: 'Tradesman',
      badgeClass: 'badge-success',
      icon: ProviderIcon,
      desc:
        lang === 'hi'
          ? 'मध्यस्थों के कमीशन से मुक्त कार्यक्षेत्र। वास्तविक समय में कार्य सूचनाएं, त्वरित बैंक अंतरण और कल्याण निधि सुरक्षा।'
          : 'Zero intermediary exploitation. Receive real-time local job alerts, instant payout release upon customer PIN entry, and statutory welfare contributions.',
      features: [
        'Real-time duty availability toggle',
        'Guaranteed 88% direct payout, no deductions',
        'Statutory healthcare & welfare accumulation',
        'Class-A democratic voting membership',
      ],
      cta: lang === 'hi' ? 'श्रमयोगी कार्यक्षेत्र खोलें' : 'Open tradesman workplace',
    },
    {
      id: 'coop_admin',
      title: lang === 'hi' ? 'समिति प्रशासनिक केंद्र' : 'Cooperative society admin',
      sub: 'e-KYC verification & double-entry ledger',
      badge: 'Society admin',
      badgeClass: 'badge-neutral',
      icon: AdminIcon,
      desc:
        lang === 'hi'
          ? 'प्राथमिक सेवा सहकारी समिति (PSCS) का सम्पूर्ण संचालन। सदस्यों का आधार सत्यापन और बही-खाता प्रबंधन।'
          : 'Complete operational cockpit for Primary Service Cooperative Societies. Manage tradesmen e-KYC queues, audit tripartite ledger entries, and administer governance.',
      features: [
        'Tradesmen Aadhaar & police clearance e-KYC',
        'Double-entry, zero-leakage ledger inspector',
        'Statutory reserve fund balance tracking',
        'One-click statutory CSV export for audits',
      ],
      cta: lang === 'hi' ? 'समिति प्रशासन खोलें' : 'Manage society operations',
    },
    {
      id: 'regulator',
      title: lang === 'hi' ? 'सहकारिता विनियामक निरीक्षण' : 'Central / state regulator',
      sub: 'Ministry of Cooperation compliance oversight',
      badge: 'Regulator',
      badgeClass: 'badge-neutral',
      icon: RegulatorIcon,
      desc:
        lang === 'hi'
          ? 'सहकारिता मंत्रालय एवं राज्य रजिस्ट्रार कार्यालय के लिए निगरानी टर्मिनल। वैधानिक अनुपालन सुनिश्चित करें।'
          : 'Supervisory oversight terminal for the Ministry of Cooperation and State Cooperative Registrars. Audit solvency, reserve ratios, and welfare disbursements.',
      features: [
        'Multi-district society audit trails',
        'Statutory 25% reserve ratio verification',
        'Mathematical ledger invariant validation',
        'Real-time compliance monitoring under MSCS Act',
      ],
      cta: lang === 'hi' ? 'विनियामक टर्मिनल खोलें' : 'Access regulatory terminal',
    },
  ];

  const pillars = [
    {
      icon: MapPinIcon,
      title: lang === 'hi' ? 'उबर एच3 स्थानिक प्रेषण' : 'Uber H3 spatial dispatch',
      desc:
        lang === 'hi'
          ? 'रिज़ॉल्यूशन-8 हेक्सागोनल ग्रिड के माध्यम से निकटतम उपलब्ध एवं प्रमाणित श्रमयोगियों का सेकंडों में चयन।'
          : 'Resolution-8 hexagonal indexing finds and dispatches the closest active, certified tradesman within ~460m grid disks in seconds.',
    },
    {
      icon: LockIcon,
      title: lang === 'hi' ? '4-अंकीय पिन एस्क्रो संरक्षण' : 'Atomic 4-digit PIN escrow',
      desc:
        lang === 'hi'
          ? 'सेवा पूर्ण होने पर नागरिक द्वारा दिया गया 4-अंकीय पिन दर्ज करने के बाद ही राशि का परमाणु विभाजन और अंतरण।'
          : 'Citizen funds remain locked in escrow until the customer personally shares their 4-digit PIN upon inspecting the completed work.',
    },
    {
      icon: VoteIcon,
      title: lang === 'hi' ? 'लोकतांत्रिक कोरम व मतदान' : 'Democratic quorum & governance',
      desc:
        lang === 'hi'
          ? 'एक-सदस्य एक-मत के सिद्धांत पर सांविधिक प्रस्तावों, टूल सब्सिडी और कल्याणकारी योजनाओं पर सीधा मतदान।'
          : 'Statutory one-member-one-vote resolutions. Class-A voting members approve equipment grants, dividend distributions, and welfare policies.',
    },
    {
      icon: ScaleIcon,
      title: lang === 'hi' ? 'शून्य-रिसाव द्वि-प्रविष्टि बही' : 'Deterministic zero-leakage ledger',
      desc:
        lang === 'hi'
          ? 'प्रत्येक पैसे का पारदर्शी हिसाब। राउंडिंग की शेष राशि श्रमिक के पक्ष में जोड़कर सांविधिक समानता सुनिश्चित।'
          : 'Double-entry accounting guarantees Worker (88%) + Welfare (8%) + Platform (4%) = gross amount, with zero rounding leakage.',
    },
  ];

  return (
    <div className="landing-page-wrapper">
      {/* ================= 1. HERO ================= */}
      <div className="container hero-wrap" style={{ paddingTop: 'var(--ux4g-sp-6)' }}>
        <section className="hero">
          <div className="hero-tags">
            <span className="badge badge-primary">
              {lang === 'hi' ? 'सहकारिता मंत्रालय | भारत सरकार' : 'Ministry of Cooperation | Govt of India'}
            </span>
            <span className="badge badge-neutral">MSCS Act 2023</span>
          </div>

          <h1>
            {lang === 'hi' ? (
              <>
                सहकारी अवसंरचना के माध्यम से <span className="accent">श्रमयोगियों का लोकतांत्रिक सशक्तीकरण</span>
              </>
            ) : (
              <>
                Empowering urban tradesmen through{' '}
                <span className="accent">democratic cooperative infrastructure</span>
              </>
            )}
          </h1>

          <p className="lede">
            {lang === 'hi'
              ? 'बहु-राज्य सहकारी सोसायटी अधिनियम, 2023 के तहत स्थापित डिजिटल मंच। प्रत्येक नागरिक भुगतान का 88% प्रत्यक्ष भुगतान श्रमयोगी को, 8% सदस्य कल्याण निधि में, और 4% प्लेटफॉर्म आरक्षित निधि में बिना किसी छिपाव के अंतरित होता है।'
              : 'A statutory digital platform under the Multi-State Co-operative Societies (MSCS) Act, 2023. Every rupee a citizen pays splits automatically: 88% direct to the tradesman, 8% into a member welfare fund, and a 4% platform reserve — with nothing held back.'}
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onSelectPortal('consumer')}
            >
              <ConsumerIcon size={16} />
              <span>{lang === 'hi' ? 'नागरिक सेवा देखें' : 'Explore citizen services'}</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onSelectPortal('provider')}
            >
              <ProviderIcon size={16} />
              <span>{lang === 'hi' ? 'श्रमयोगी सदस्य पोर्टल' : 'Tradesman member portal'}</span>
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => onSelectPortal('coop_admin')}
            >
              <AdminIcon size={16} />
              <span>{lang === 'hi' ? 'समिति प्रशासन केंद्र' : 'Society admin hub'}</span>
            </button>
          </div>

          {/* Trust Row — Stated once */}
          <div className="trust-row">
            <div className="trust-item">
              <ShieldCheckIcon size={18} color="var(--ux4g-green-600)" />
              <span>GIGW 3.0 &amp; WCAG 2.1 AA compliant</span>
            </div>
            <div className="trust-item">
              <ShieldCheckIcon size={18} color="var(--ux4g-green-600)" />
              <span>Zero intermediary commission</span>
            </div>
            <div className="trust-item">
              <ShieldCheckIcon size={18} color="var(--ux4g-green-600)" />
              <span>Direct beneficiary transfer (DBT)</span>
            </div>
          </div>
        </section>

        {/* Inline trust stat bar — numbers that matter, stated once */}
        <div style={{ marginTop: 'var(--ux4g-sp-7)' }}>
          <div className="split-bar surface">
            <div className="split-cell">
              <div className="num brand">88%</div>
              <div className="label">{lang === 'hi' ? 'प्रत्यक्ष श्रमिक भुगतान' : 'Direct worker pay'}</div>
              <div className="sub">{lang === 'hi' ? 'सांविधिक न्यूनतम गारंटी' : 'Guaranteed statutory floor'}</div>
            </div>
            <div className="split-cell">
              <div className="num success">8%</div>
              <div className="label">{lang === 'hi' ? 'कल्याण निधि' : 'Welfare fund'}</div>
              <div className="sub">{lang === 'hi' ? 'स्वास्थ्य, पेंशन व सुरक्षा' : 'Healthcare, pension & safety'}</div>
            </div>
            <div className="split-cell">
              <div className="num">4%</div>
              <div className="label">{lang === 'hi' ? 'प्लेटफॉर्म आरक्षित निधि' : 'Platform reserve'}</div>
              <div className="sub">{lang === 'hi' ? 'सांविधिक सीमा — शून्य छिपा कमीशन' : 'Statutory cap — zero hidden margin'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. CALCULATOR ================= */}
      <section className="section" id="calculator">
        <div className="container">
          <div className="surface calc-panel">
            <span className="eyebrow">{lang === 'hi' ? 'सांविधिक एस्क्रो इंजन' : 'Statutory escrow engine'}</span>
            <h2 style={{ fontSize: 'var(--ux4g-fs-28)', margin: 'var(--ux4g-sp-4) 0 var(--ux4g-sp-3)' }}>
              {lang === 'hi' ? 'पारदर्शी त्रिपक्षीय विभाजन गणक' : 'Tripartite transparency calculator'}
            </h2>
            <p style={{ color: 'var(--ux4g-text-secondary)', maxWidth: '640px' }}>
              {lang === 'hi'
                ? 'निजी प्लेटफॉर्म 25-35% तक का छिपा हुआ कमीशन काटते हैं। सहकार कनेक्ट पर प्रत्येक सेवा शुल्क का सांविधिक 88-8-4 विभाजन वास्तविक समय में देखें।'
                : 'Commercial aggregators deduct 25–35% in opaque commission. On SahakarConnect, every service fee is split deterministically under statutory law — see it for yourself.'}
            </p>

            <div className="calc-input-row">
              <label className="amount-field" htmlFor="calc-amount" style={{ maxWidth: '280px' }}>
                <span className="prefix">₹</span>
                <input
                  type="number"
                  id="calc-amount"
                  value={calcAmount}
                  min="0"
                  step="1"
                  onChange={(e) => setCalcAmount(Number(e.target.value) || 0)}
                  aria-label="Test service amount in rupees"
                />
              </label>

              <div className="quick-select" role="group" aria-label="Quick amount select">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className="chip"
                    onClick={() => setCalcAmount(amt)}
                    aria-pressed={calcAmount === amt}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            <div className="callout">
              <p>
                <strong>MSCS Act 2023 rounding invariant:</strong> any fractional remainder from rounding is
                legally mandated to be credited to the tradesman, so the platform can never round in its own favour.
              </p>
            </div>

            <div className="split-results">
              <div className="split-card">
                <span className="badge badge-primary">88% Statutory</span>
                <div className="card-title">{lang === 'hi' ? 'श्रमिक प्रत्यक्ष भुगतान' : 'Worker direct payout'}</div>
                <div className="card-amount">₹{formatINR(worker)}</div>
                <div className="card-note">Remitted instantly on 4-digit PIN verification.</div>
              </div>

              <div className="split-card">
                <span className="badge badge-success">8% Statutory</span>
                <div className="card-title">{lang === 'hi' ? 'समिति कल्याण निधि' : 'Society welfare fund'}</div>
                <div className="card-amount">₹{formatINR(welfare)}</div>
                <div className="card-note">Healthcare, pension and emergency aid.</div>
              </div>

              <div className="split-card">
                <span className="badge badge-neutral">4% Non-profit</span>
                <div className="card-title">{lang === 'hi' ? 'प्लेटफॉर्म अवसंरचना' : 'Platform infrastructure'}</div>
                <div className="card-amount">₹{formatINR(platform)}</div>
                <div className="card-note">Server hosting, SMS gateway, spatial routing.</div>
              </div>
            </div>

            <table className="compare-table">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th>Private gig platforms</th>
                  <th className="col-sahakar">SahakarConnect PSCS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="row-label">Platform commission</td>
                  <td className="col-private">25–35% (hidden)</td>
                  <td className="col-sahakar">4.0% (statutory cap)</td>
                </tr>
                <tr>
                  <td className="row-label">Tradesman take-home</td>
                  <td className="col-private">65–75%</td>
                  <td className="col-sahakar">88.0% guaranteed</td>
                </tr>
                <tr>
                  <td className="row-label">Welfare &amp; social security</td>
                  <td className="col-private">0% (no protection)</td>
                  <td className="col-sahakar">8.0% dedicated fund</td>
                </tr>
                <tr>
                  <td className="row-label">Governance &amp; ownership</td>
                  <td className="col-private">Algorithmic, no say</td>
                  <td className="col-sahakar">1 member, 1 vote</td>
                </tr>
                <tr>
                  <td className="row-label">Payment release</td>
                  <td className="col-private">Delayed weekly payouts</td>
                  <td className="col-sahakar">Instant 4-digit PIN escrow</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ================= 3. DEDICATED TRADE PORTALS ================= */}
      <section className="section" id="services" style={{ background: 'var(--ux4g-bg-soft)' }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">
              {lang === 'hi' ? 'प्राथमिक सेवा सहकारी समितियां' : 'Primary Service Cooperative Societies'}
            </span>
            <h2>{lang === 'hi' ? 'विशिष्ट सहकारी सेवा पोर्टल' : 'Dedicated cooperative trade portals'}</h2>
            <p>
              {lang === 'hi'
                ? 'प्रत्येक सेवा एक स्वायत्त प्राथमिक सेवा सहकारी समिति द्वारा संचालित है। अपनी आवश्यकतानुसार विशिष्ट सेवा पोर्टल चुनें और सत्यापित श्रमयोगियों से कार्य कराएं।'
                : 'Every trade operates under its own registered Primary Service Cooperative Society under the MSCS Act 2023 — each with trade-specific engineering standards, statutory rate schedules, and direct member dispatch.'}
            </p>
          </div>

          <div className="portal-grid">
            {tradePortals.map((tp) => {
              const PortalIcon = tp.icon;
              return (
                <article key={tp.id} className="portal-card surface">
                  <div className="portal-head">
                    <div className="portal-icon">
                      <PortalIcon size={20} />
                    </div>
                    <span className="badge badge-neutral">{tp.code}</span>
                  </div>
                  <h3>{tp.title}</h3>
                  <div className="portal-society">{tp.society}</div>
                  <p className="portal-desc">{tp.description}</p>
                  <div className="portal-meta-row">
                    <div className="portal-meta">
                      <div className="k">Quality index</div>
                      <div className="v" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>{tp.quality}</span>
                        <StarIcon size={13} color="#eab308" />
                      </div>
                    </div>
                    <div className="portal-meta">
                      <div className="k">Active tradesmen</div>
                      <div className="v">{tp.tradesmen}</div>
                    </div>
                    <div className="portal-meta">
                      <div className="k">Starting baseline</div>
                      <div className="v">{tp.baseline}</div>
                    </div>
                  </div>
                  <ul className="portal-scope">
                    {tp.scope.map((item, idx) => (
                      <li key={idx}>
                        <CheckIcon size={14} color="var(--ux4g-green-600)" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => onSelectPortal(tp.id)}
                  >
                    {tp.cta}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 4. ROLE GATEWAYS ================= */}
      <section className="section" id="workplace">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{lang === 'hi' ? 'भूमिका-आधारित पहुंच' : 'Access terminals'}</span>
            <h2>{lang === 'hi' ? 'समर्पित भूमिका-आधारित कार्यक्षेत्र' : 'Dedicated role-based gateways'}</h2>
            <p>
              {lang === 'hi'
                ? 'नागरिकों, श्रमयोगियों, सहकारी प्रशासकों और सरकारी विनियामकों के लिए सुरक्षित, अलग-अलग पोर्टल।'
                : 'Select your operational role to enter the verified workspace with isolated data boundaries.'}
            </p>
          </div>

          <div className="role-grid">
            {roleGateways.map((rg) => {
              const RoleIcon = rg.icon;
              return (
                <article key={rg.id} className="role-card surface">
                  <div className="role-head">
                    <div className="role-icon">
                      <RoleIcon size={20} />
                    </div>
                    <span className={`badge ${rg.badgeClass}`}>{rg.badge}</span>
                  </div>
                  <h3>{rg.title}</h3>
                  <div className="role-sub">{rg.sub}</div>
                  <p className="role-desc">{rg.desc}</p>
                  <ul className="role-features">
                    {rg.features.map((feat, idx) => (
                      <li key={idx}>
                        <CheckIcon size={14} color="var(--ux4g-green-600)" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => onSelectPortal(rg.id)}
                  >
                    {rg.cta}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 5. ARCHITECTURE PILLARS ================= */}
      <section className="section" style={{ background: 'var(--ux4g-bg-soft)' }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{lang === 'hi' ? 'तकनीकी दक्षता' : 'Technical rigour'}</span>
            <h2>{lang === 'hi' ? 'सहकार कनेक्ट के प्रमुख तकनीकी स्तंभ' : 'Architectural pillars of SahakarConnect'}</h2>
            <p>
              Built on open infrastructure adhering to Government of India guidelines, zero-trust
              cryptographic verification, and spatial routing.
            </p>
          </div>
          <div className="pillar-grid">
            {pillars.map((pil, idx) => {
              const PilIcon = pil.icon;
              return (
                <div key={idx} className="pillar surface">
                  <div className="pillar-icon">
                    <PilIcon size={20} />
                  </div>
                  <h3>{pil.title}</h3>
                  <p>{pil.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 6. COMPLIANCE BANNER ================= */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="surface compliance-banner">
            <div className="icon">
              <EmblemIcon size={22} />
            </div>
            <div>
              <h3>
                {lang === 'hi'
                  ? 'वैधानिक ढांचा एवं अनुपालन संदर्भ'
                  : 'Statutory mandate & legislative compliance'}
              </h3>
              <p>
                SahakarConnect is engineered in strict accordance with the provisions of the{' '}
                <strong>Multi-State Co-operative Societies (MSCS) Act, 2023</strong>, and the statutory directives of
                the <strong>Ministry of Cooperation, Government of India</strong>. All financial transactions execute
                via double-entry ledger bookkeeping with deterministic zero-leakage parity. Digital interfaces comply with{' '}
                <strong>Guidelines for Indian Government Websites (GIGW 3.0)</strong> and WCAG 2.1 Level AA accessibility
                criteria.
              </p>
              <div className="tags">
                <span className="badge badge-neutral">MSCS Act 2023 Sec. 63</span>
                <span className="badge badge-neutral">NCCT certified syllabus</span>
                <span className="badge badge-neutral">GIGW 3.0 accessible</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
