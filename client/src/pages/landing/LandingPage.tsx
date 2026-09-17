import React, { useState } from 'react';
import {
  ScaleIcon,
  ShieldCheckIcon,
  MapPinIcon,
  LockIcon,
  VoteIcon,
  EmblemIcon,
  PlumbingIcon,
  ElectricalIcon,
  CarpentryIcon,
  ApplianceIcon,
  StarIcon,
  IndianFlagIcon,
  SearchIcon,
  ChevronRightIcon,
  FingerprintIcon,
  InfoIcon,
  QrCodeIcon,
} from '../../components/common/Icons';
import { ImageWithSkeleton } from '../../components/common/Skeleton';

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
  const [heroSearch, setHeroSearch] = useState<string>('');

  // Compute statutory 88 / 8 / 4 split with MSCS Act 2023 rounding invariant
  const gross = Math.max(0, Number(calcAmount) || 0);
  const welfare = Math.round(gross * 0.08 * 100) / 100;
  const platform = Math.round(gross * 0.04 * 100) / 100;
  const worker = Math.round((gross - welfare - platform) * 100) / 100;

  const quickAmounts = [500, 1200, 2500, 5000, 10000];

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearch.trim()) return;
    const q = heroSearch.toLowerCase();
    if (q.includes('plumb') || q.includes('pipe') || q.includes('leak') || q.includes('drain')) {
      onSelectPortal('portal:plumbing');
    } else if (q.includes('elect') || q.includes('wire') || q.includes('mcb') || q.includes('light')) {
      onSelectPortal('portal:electrical');
    } else if (q.includes('carp') || q.includes('wood') || q.includes('door') || q.includes('lock')) {
      onSelectPortal('portal:carpentry');
    } else if (q.includes('appl') || q.includes('ac') || q.includes('fridge') || q.includes('wash')) {
      onSelectPortal('portal:appliances');
    } else {
      onSelectPortal('consumer');
    }
  };

  // Popular Services Grid (matching the UIDAI myAadhaar Card Grid)
  const popularServices = [
    {
      id: 'portal:plumbing',
      title: lang === 'hi' ? 'नलसाजी एवं स्वच्छता अभियांत्रिकी' : 'Plumbing & Sanitary Engineering',
      society: 'Delhi Urban Plumbing & Sanitary PSCS',
      code: 'BIS 12183',
      icon: PlumbingIcon,
      price: '₹250',
      quality: '4.88',
      desc: lang === 'hi'
        ? 'पाइपलाइन रिसाव, ड्रेन ब्लॉकेज एवं वॉटर टैंक वाल्व की वैधानिक मरम्मत।'
        : 'High-pressure pipe leak resolution, hydro-jet drain unblocking, and RO/tank overhaul.',
    },
    {
      id: 'portal:electrical',
      title: lang === 'hi' ? 'विद्युत एवं वायरमैन सेवाएं' : 'Electrical & Certified Wiremen',
      society: 'Delhi Certified Wiremen & Electricians PSCS',
      code: 'CEA / IS 732',
      icon: ElectricalIcon,
      price: '₹200',
      quality: '4.92',
      desc: lang === 'hi'
        ? 'एमसीबी ट्रिपिंग, वायरिंग रीकंडीशनिंग, अर्थिंग और सर्ज प्रोटेक्शन ऑडिट।'
        : 'CEA-certified wiremen for circuit load balancing, MCB trip analysis, and earthing audits.',
    },
    {
      id: 'portal:carpentry',
      title: lang === 'hi' ? 'काष्ठशिल्प एवं मॉड्यूलर फर्नीचर' : 'Woodcraft & Modular Carpentry',
      society: 'Indraprastha Woodcraft Artisans PSCS',
      code: 'BIS IS 2202',
      icon: CarpentryIcon,
      price: '₹300',
      quality: '4.85',
      desc: lang === 'hi'
        ? 'दरवाजे, कब्जे, खिड़की संरेखण, मॉड्यूलर कैबिनेटरी और मोर्टिज़ ताले।'
        : 'Flush door alignment, acoustic planing, modular cabinet overhaul, and mortise locks.',
    },
    {
      id: 'portal:appliances',
      title: lang === 'hi' ? 'घरेलू उपकरण मरम्मत' : 'Home Appliance Repair Cooperative',
      society: 'Capital Electro-Mechanical & Appliances PSCS',
      code: 'BEE Star / MoEFCC',
      icon: ApplianceIcon,
      price: '₹350',
      quality: '4.81',
      desc: lang === 'hi'
        ? 'इन्वर्टर एसी सीलबंद गैस रिकवरी, रेफ्रिजरेटर पीसीबी और वॉशिंग मशीन डैम्पिंग।'
        : 'MoEFCC-compliant certified technicians for inverter compressor repair and sealed gas servicing.',
    },
    {
      id: 'portal:electrical',
      title: lang === 'hi' ? 'रूफटॉप सोलर एवं हरित ऊर्जा' : 'Rooftop Solar & Renewable Energy',
      society: 'Clean Energy Technicians Cooperative',
      code: 'MNRE / BIS',
      icon: ElectricalIcon,
      price: '₹499',
      quality: '4.94',
      desc: lang === 'hi'
        ? 'रूफटॉप सोलर पैनल इंस्टालेशन, इन्वर्टर ग्रिड सिंक्रोनाइज़ेशन व ऑडिट।'
        : 'MNRE-certified technicians for solar rooftop inspection, panel wiring, and net-metering setup.',
    },
    {
      id: 'portal:plumbing',
      title: lang === 'hi' ? 'आपातकालीन रिसाव एवं जल संरक्षण' : 'Emergency Leakage & Water Safety',
      society: 'Delhi Urban Rapid Response PSCS',
      code: 'Urgent Dispatch',
      icon: PlumbingIcon,
      price: '₹299',
      quality: '4.90',
      desc: lang === 'hi'
        ? 'अतिशीघ्र स्थानिक प्रेषण (H3 स्थानिक ग्रिड), मुख्य वॉल्व एवं सीवेज राहत।'
        : 'Instant Uber H3 spatial dispatch within ~460m hexagonal radius for emergency domestic floods.',
    },
  ];

  // 4 Persona Carousel Cards with Authentic Photography
  const personaCards = [
    {
      id: 'consumer',
      image: '/images/citizen-family.jpg',
      badge: lang === 'hi' ? 'नागरिक व परिवार' : 'Household & Citizens',
      title: lang === 'hi' ? 'निष्पक्ष-व्यापार नागरिक सेवाएं' : 'Fair-Trade Citizen Services',
      desc: lang === 'hi'
        ? 'सत्यापित सहकारी तकनीशियनों से पारदर्शी सेवाएं। 4-अंकीय पिन सत्यापन के बाद ही एस्क्रो राशि विमुक्त होती है।'
        : 'Book certified plumbers, electricians, and mechanics. Funds stay in statutory escrow until you release them with your 4-digit PIN.',
      cta: lang === 'hi' ? 'नागरिक पोर्टल खोलें' : 'Enter Citizen Portal',
    },
    {
      id: 'provider',
      image: '/images/artisan-worker.jpg',
      badge: lang === 'hi' ? 'प्रमाणित श्रमयोगी' : 'Skilled Tradespeople',
      title: lang === 'hi' ? 'शून्य-कमीशन श्रमयोगी कार्यक्षेत्र' : '0% Commission Workplace',
      desc: lang === 'hi'
        ? 'निजी बिचौलियों के कमीशन से मुक्त कार्यक्षेत्र। 88% प्रत्यक्ष दैनिक बैंक अंतरण, कल्याण निधि एवं सहकारी मताधिकार।'
        : 'Zero intermediary commission. Guaranteed 88% direct pay, 8% healthcare & pension welfare, and Class-A democratic voting shares.',
      cta: lang === 'hi' ? 'श्रमयोगी पोर्टल खोलें' : 'Enter Provider Portal',
    },
    {
      id: 'coop_admin',
      image: '/images/coop-leaders.jpg',
      badge: lang === 'hi' ? 'सहकारी समितियां एवं पैक्स' : 'Cooperative Societies & PACS',
      title: lang === 'hi' ? 'समिति प्रशासनिक केंद्र' : 'Society Administration Hub',
      desc: lang === 'hi'
        ? 'प्राथमिक सेवा सहकारी समिति (PSCS) का सम्पूर्ण संचालन। सदस्यों का आधार सत्यापन, डिजिटल उप-नियम और बही-खाता।'
        : 'Operational hub for Primary Service Cooperatives. Manage tradesmen e-KYC queues, audit tripartite ledgers, and manage governance.',
      cta: lang === 'hi' ? 'समिति प्रशासन खोलें' : 'Enter Society Admin',
    },
    {
      id: 'regulator',
      image: null, // Renders Ashoka Emblem & State Crest
      badge: lang === 'hi' ? 'केंद्रीय व राज्य विनियामक' : 'Central & State Regulators',
      title: lang === 'hi' ? 'सहकारिता विनियामक निरीक्षण' : 'Regulatory Oversight Terminal',
      desc: lang === 'hi'
        ? 'सहकारिता मंत्रालय एवं राज्य रजिस्ट्रार कार्यालय के लिए निगरानी टर्मिनल। 15% आरक्षित निधि एवं साल्वेंसी ऑडिट।'
        : 'Supervisory oversight terminal for the Ministry of Cooperation. Audit statutory solvency, reserve ratios, and welfare disbursements.',
      cta: lang === 'hi' ? 'विनियामक टर्मिनल खोलें' : 'Enter Regulator Hub',
    },
  ];

  const pillars = [
    {
      icon: MapPinIcon,
      title: lang === 'hi' ? 'उबर एच3 स्थानिक प्रेषण' : 'Uber H3 spatial dispatch',
      desc: lang === 'hi'
        ? 'रिज़ॉल्यूशन-8 हेक्सागोनल ग्रिड के माध्यम से निकटतम उपलब्ध एवं प्रमाणित श्रमयोगियों का सेकंडों में चयन।'
        : 'Resolution-8 hexagonal indexing finds and dispatches the closest active, certified tradesman within ~460m grid disks in seconds.',
    },
    {
      icon: LockIcon,
      title: lang === 'hi' ? '4-अंकीय पिन एस्क्रो संरक्षण' : 'Atomic 4-digit PIN escrow',
      desc: lang === 'hi'
        ? 'सेवा पूर्ण होने पर नागरिक द्वारा दिया गया 4-अंकीय पिन दर्ज करने के बाद ही राशि का परमाणु विभाजन और अंतरण।'
        : 'Citizen funds remain locked in escrow until the customer personally shares their 4-digit PIN upon inspecting the completed work.',
    },
    {
      icon: VoteIcon,
      title: lang === 'hi' ? 'लोकतांत्रिक कोरम व मतदान' : 'Democratic quorum & governance',
      desc: lang === 'hi'
        ? 'एक-सदस्य एक-मत के सिद्धांत पर सांविधिक प्रस्तावों, टूल सब्सिडी और कल्याणकारी योजनाओं पर सीधा मतदान।'
        : 'Statutory one-member-one-vote resolutions. Class-A voting members approve equipment grants, dividend distributions, and welfare policies.',
    },
    {
      icon: ScaleIcon,
      title: lang === 'hi' ? 'शून्य-रिसाव द्वि-प्रविष्टि बही' : 'Deterministic zero-leakage ledger',
      desc: lang === 'hi'
        ? 'प्रत्येक पैसे का पारदर्शी हिसाब। राउंडिंग की शेष राशि श्रमिक के पक्ष में जोड़कर सांविधिक समानता सुनिश्चित।'
        : 'Double-entry accounting guarantees Worker (88%) + Welfare (8%) + Platform (4%) = gross amount, with zero rounding leakage.',
    },
  ];

  return (
    <div className="myaadhaar-page">
      {/* ==========================================================================
          1. HERO SECTION (UIDAI myAadhaar Layout: Left Hero Search + Right 3-Card Stack)
          ========================================================================== */}
      <section className="container">
        <div className="myaadhaar-hero-grid">
          {/* Left Column: Heading, Search Pill, 4 Circular Quick Action Buttons */}
          <div className="myaadhaar-hero-left">
            <div className="myaadhaar-hero-heading">
              <span className="myaadhaar-hero-welcome">
                {lang === 'hi' ? 'सहकार कनेक्ट में आपका स्वागत है' : 'Welcome to SahakarConnect'}
              </span>
              <span className="myaadhaar-hero-question">
                {lang === 'hi' ? 'आज आप क्या सेवा प्राप्त करना चाहते हैं?' : 'What do you want to do today?'}
              </span>
            </div>

            {/* Rounded Search Pill */}
            <form onSubmit={handleHeroSearch} className="myaadhaar-search-pill" role="search">
              <input
                type="text"
                placeholder={
                  lang === 'hi'
                    ? 'सेवा, सहकारी समिति, या कौशल दर्ज करें (उदा. विद्युत, नलसाजी, काष्ठशिल्प)...'
                    : 'Enter service, cooperative PACS, or trade skill (e.g. Electrical, Plumbing, Solar)...'
                }
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                aria-label="Search cooperative services"
              />
              <button type="submit" className="search-action-btn" aria-label="Search">
                <SearchIcon size={18} color="#ffffff" />
              </button>
            </form>

            {/* 4 Circular Action Buttons (Matching Screenshot 1) */}
            <div className="myaadhaar-quick-circles">
              <button
                type="button"
                className="myaadhaar-circle-item"
                onClick={() => onSelectPortal('portal:plumbing')}
                title={lang === 'hi' ? 'नलसाजी सेवा' : 'Plumbing Works'}
              >
                <div className="myaadhaar-circle-btn">
                  <PlumbingIcon size={28} />
                </div>
                <span className="myaadhaar-circle-label">{lang === 'hi' ? 'नलसाजी' : 'Plumbing'}</span>
              </button>

              <button
                type="button"
                className="myaadhaar-circle-item"
                onClick={() => onSelectPortal('portal:electrical')}
                title={lang === 'hi' ? 'विद्युत सेवा' : 'Electrical Works'}
              >
                <div className="myaadhaar-circle-btn">
                  <ElectricalIcon size={28} />
                </div>
                <span className="myaadhaar-circle-label">{lang === 'hi' ? 'विद्युत' : 'Electrical'}</span>
              </button>

              <button
                type="button"
                className="myaadhaar-circle-item"
                onClick={() => onSelectPortal('portal:carpentry')}
                title={lang === 'hi' ? 'काष्ठशिल्प सेवा' : 'Carpentry Works'}
              >
                <div className="myaadhaar-circle-btn">
                  <CarpentryIcon size={28} />
                </div>
                <span className="myaadhaar-circle-label">{lang === 'hi' ? 'काष्ठशिल्प' : 'Carpentry'}</span>
              </button>

              <button
                type="button"
                className="myaadhaar-circle-item"
                onClick={() => onSelectPortal('portal:appliances')}
                title={lang === 'hi' ? 'उपकरण सेवा' : 'Appliance Repair'}
              >
                <div className="myaadhaar-circle-btn">
                  <ApplianceIcon size={28} />
                </div>
                <span className="myaadhaar-circle-label">{lang === 'hi' ? 'उपकरण' : 'Appliances'}</span>
              </button>
            </div>

            {/* Statutory Guarantee Badge */}
            <div style={{ marginTop: '28px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div className="badge badge-primary d-inline-flex align-items-center gap-2" style={{ padding: '6px 12px' }}>
                <IndianFlagIcon width={16} height={11} />
                <span>{lang === 'hi' ? 'सहकारिता मंत्रालय | भारत सरकार' : 'Ministry of Cooperation | Govt of India'}</span>
              </div>
              <div className="badge badge-success d-inline-flex align-items-center gap-1" style={{ padding: '6px 12px' }}>
                <ShieldCheckIcon size={14} color="#128937" />
                <span>{lang === 'hi' ? '88% प्रत्यक्ष पारिश्रमिक गारंटी' : '88% Direct Worker Pay Guaranteed'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Stack of 3 Cards */}
          <div className="myaadhaar-hero-right">
            {/* Card 1: Login Card with Indian Tricolour Accent */}
            <div className="myaadhaar-card-login">
              <div className="myaadhaar-tricolour-stripe" />
              <div className="myaadhaar-card-login-body">
                <div className="myaadhaar-card-login-header">
                  <div className="myaadhaar-card-login-icon">
                    <FingerprintIcon size={24} />
                  </div>
                  <div>
                    <h3 className="myaadhaar-card-login-title">
                      {lang === 'hi' ? 'सहकार कनेक्ट पोर्टल प्रवेश' : 'Access SahakarConnect'}
                    </h3>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {lang === 'hi' ? 'नागरिक, श्रमयोगी या समिति' : 'Citizen, Tradesman or Society'}
                    </div>
                  </div>
                </div>

                <p className="myaadhaar-card-login-desc">
                  {lang === 'hi'
                    ? 'मोबाइल ओटीपी, आधार ई-केवाईसी या समिति पंजीयन संख्या से तुरंत अपने डैशबोर्ड में लॉगिन करें।'
                    : 'Login with Mobile OTP or Society ID to book, track daily payouts, and audit transactions.'}
                </p>

                <button
                  type="button"
                  className="myaadhaar-card-login-action"
                  onClick={() => onSelectPortal('consumer')}
                >
                  <span>{lang === 'hi' ? 'ओटीपी द्वारा लॉगिन करें' : 'Login with OTP'}</span>
                  <ChevronRightIcon size={16} color="#ffffff" />
                </button>
              </div>
            </div>

            {/* Card 2: "Did you know?" Card */}
            <div className="myaadhaar-card-dyk">
              <div className="myaadhaar-dyk-title">
                <InfoIcon size={18} color="#c2410c" />
                <span>{lang === 'hi' ? 'क्या आप जानते हैं?' : 'Did you know?'}</span>
              </div>
              <p className="myaadhaar-dyk-content">
                {lang === 'hi'
                  ? 'निजी एग्रीगेटर 25-35% तक का छिपा हुआ कमीशन काटते हैं। सहकार कनेक्ट पर प्रत्येक सेवा शुल्क का 88% सीधे कामगार को और 8% कल्याण कोष में जाता है। 0% कॉर्पोरेट बिचौलिया कटौती।'
                  : 'Every rupee paid on SahakarConnect distributes 88% directly to skilled workers and 8% to statutory welfare reserves. 0% is extracted by commercial aggregators.'}
              </p>
              <a
                href="#calculator"
                className="myaadhaar-dyk-link"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>{lang === 'hi' ? 'त्रिपक्षीय अर्थशास्त्र देखें →' : 'Explore Tripartite Economics →'}</span>
              </a>
            </div>

            {/* Card 3: Mobile App Strip Card */}
            <div className="myaadhaar-card-app">
              <div className="myaadhaar-app-card-row">
                <div className="myaadhaar-phone-mockup" style={{ width: '44px', height: '68px' }}>
                  <div className="myaadhaar-phone-screen">
                    <EmblemIcon size={14} color="#ffffff" />
                    <div style={{ fontSize: '6px', fontWeight: 'bold' }}>App</div>
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                    {lang === 'hi' ? 'सहकार ऐप डाउनलोड करें' : 'Keep SahakarConnect handy'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 6px' }}>
                    {lang === 'hi' ? 'एंड्रॉइड व आईओएस के लिए उपलब्ध' : 'Available for Android & iOS'}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Google Play</span>
                    <span className="badge badge-neutral" style={{ fontSize: '10px' }}>App Store</span>
                  </div>
                </div>

                <QrCodeIcon size={36} color="#334155" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          2. FIND SERVICES RELEVANT TO YOU (PERSONA CARDS WITH AUTHENTIC PHOTOGRAPHY)
          ========================================================================== */}
      <section className="container myaadhaar-persona-section">
        <div className="myaadhaar-section-header">
          <h2>{lang === 'hi' ? 'आपके लिए प्रासंगिक सेवाएं खोजें' : 'Find Services relevant to you'}</h2>
          <p>
            {lang === 'hi'
              ? 'नागरिकों, कुशल श्रमयोगियों, प्राथमिक सहकारी समितियों एवं सरकारी विनियामकों के लिए विशेष रूप से तैयार कार्यप्रवाह।'
              : 'Tailored workflows for citizens, skilled tradesmen, primary cooperative societies, and statutory authorities.'}
          </p>
        </div>

        <div className="myaadhaar-persona-grid">
          {personaCards.map((p) => (
            <div
              key={p.id}
              className="myaadhaar-persona-card"
              onClick={() => onSelectPortal(p.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectPortal(p.id)}
            >
              <div className="myaadhaar-persona-img-wrap">
                {p.image ? (
                  <ImageWithSkeleton
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                    containerStyle={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #24145c 0%, #4a2bc2 100%)',
                      color: '#ffffff',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <EmblemIcon size={52} color="#ffffff" />
                    <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>
                      MINISTRY OF COOPERATION
                    </span>
                  </div>
                )}
              </div>

              <div className="myaadhaar-persona-body">
                <span className="myaadhaar-persona-badge">{p.badge}</span>
                <h3 className="myaadhaar-persona-title">{p.title}</h3>
                <p className="myaadhaar-persona-desc">{p.desc}</p>
                <div className="myaadhaar-persona-footer">
                  <button
                    type="button"
                    className="myaadhaar-circle-arrow-btn"
                    aria-label={`Open ${p.title}`}
                  >
                    <ChevronRightIcon size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================================================
          3. POPULAR COOPERATIVE SERVICES (GRID MATCHING IMAGE 1)
          ========================================================================== */}
      <section className="container myaadhaar-popular-section" id="services">
        <div className="myaadhaar-section-header">
          <h2>{lang === 'hi' ? 'लोकप्रिय सहकारी सेवाएं' : 'Popular Cooperative Services'}</h2>
          <p>
            {lang === 'hi'
              ? 'प्रमाणित प्राथमिक सेवा सहकारी समितियों (PSCS) द्वारा अनुमोदित दर सूची व त्वरित स्थानिक प्रेषण।'
              : 'Direct booking from certified Primary Service Cooperative Societies with statutory rates and zero price gouging.'}
          </p>
        </div>

        <div className="myaadhaar-popular-grid">
          {popularServices.map((service, index) => {
            const SIcon = service.icon;
            return (
              <div key={index} className="myaadhaar-service-card">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="myaadhaar-service-icon-wrap">
                    <SIcon size={22} />
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                    {service.code}
                  </span>
                </div>

                <h3 className="myaadhaar-service-title">{service.title}</h3>
                <div className="myaadhaar-service-society">{service.society}</div>
                <p className="myaadhaar-service-desc">{service.desc}</p>

                <div className="myaadhaar-service-footer">
                  <div>
                    <div className="myaadhaar-service-price">
                      {service.price} <span>baseline</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
                      <span>{service.quality}</span>
                      <StarIcon size={12} color="#eab308" />
                      <span>verified</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="myaadhaar-service-btn"
                    onClick={() => onSelectPortal(service.id)}
                  >
                    {lang === 'hi' ? 'सेवा चुनें →' : 'Book Now →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==========================================================================
          4. NATIONAL LEADERSHIP & COOPERATIVE VISION (PM NARENDRA MODI & INDIAN FLAG)
          ========================================================================== */}
      <section className="section" style={{ paddingTop: '24px', paddingBottom: '32px' }}>
        <div className="container">
          <div className="dignitary-section">
            <div className="tricolour-stripe" />
            <div className="dignitary-card">
              <div className="dignitary-photo-wrap">
                <ImageWithSkeleton
                  src="/images/pm-narendra-modi.jpg"
                  alt={lang === 'hi' ? 'माननीय प्रधानमंत्री श्री नरेन्द्र मोदी' : "Shri Narendra Modi, Hon'ble Prime Minister of India"}
                  width={200}
                  height={240}
                  className="dignitary-photo"
                  loading="lazy"
                  decoding="async"
                />
                <div className="dignitary-flag-badge" title={lang === 'hi' ? 'भारत का राष्ट्रीय ध्वज' : 'National Flag of India'}>
                  <IndianFlagIcon width={20} height={14} />
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#111' }}>भारत</span>
                </div>
              </div>

              <div className="dignitary-content">
                <div className="dignitary-motto">
                  <IndianFlagIcon width={16} height={11} />
                  <span>{lang === 'hi' ? 'सहकार से समृद्धि' : 'Sahakar Se Samriddhi'}</span>
                </div>

                <blockquote className="dignitary-quote">
                  {lang === 'hi'
                    ? '“सहकारिता केवल एक व्यवसाय मॉडल नहीं है, यह भारत के करोड़ों कामगारों के स्वावलंबन और आर्थिक लोकतंत्र का सबसे सशक्त माध्यम है। सहकार कनेक्ट के माध्यम से प्रत्येक श्रमयोगी को उसका उचित 88% प्रत्यक्ष पारिश्रमिक और सामाजिक सुरक्षा कवच सुनिश्चित हो रहा है।”'
                    : '“The cooperative movement is the foundation of economic democracy and self-reliance in India. By organizing urban tradesmen into democratic cooperatives with guaranteed 88% direct payouts and statutory welfare, SahakarConnect realizes the vision of Sahakar Se Samriddhi — empowering every tradesman with ownership and national dignity.”'}
                </blockquote>

                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mt-3">
                  <div>
                    <div className="dignitary-name">
                      {lang === 'hi' ? 'श्री नरेन्द्र मोदी' : 'Shri Narendra Modi'}
                    </div>
                    <div className="dignitary-title">
                      {lang === 'hi' ? 'माननीय प्रधानमंत्री, भारत' : "Hon'ble Prime Minister of India"}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 p-2 rounded border bg-light">
                    <img
                      src="/images/flag-of-india.svg"
                      alt="Flag of India"
                      width="38"
                      height="25"
                      loading="lazy"
                      decoding="async"
                      style={{
                        borderRadius: '3px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                    <div style={{ fontSize: '11px', lineHeight: 1.25 }}>
                      <div className="fw-semibold text-dark">{lang === 'hi' ? 'भारत सरकार' : 'Government of India'}</div>
                      <div className="text-muted">{lang === 'hi' ? 'सहकारिता मंत्रालय' : 'Ministry of Cooperation'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          5. TRIPARTITE TRANSPARENCY CALCULATOR
          ========================================================================== */}
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

            <div className="table-responsive-wrapper" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', marginTop: 'var(--ux4g-sp-8)' }}>
              <table className="compare-table" style={{ minWidth: '560px', marginTop: 0 }}>
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
                    <td className="col-private">0% (zero protection)</td>
                    <td className="col-sahakar">8.0% dedicated fund</td>
                  </tr>
                  <tr>
                    <td className="row-label">Governance &amp; ownership</td>
                    <td className="col-private">Algorithmic deprioritization</td>
                    <td className="col-sahakar">1-member-1-vote democratic</td>
                  </tr>
                  <tr>
                    <td className="row-label">Payment release mechanism</td>
                    <td className="col-private">Delayed weekly payouts</td>
                    <td className="col-sahakar">Instant 4-digit PIN escrow</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          6. ARCHITECTURE PILLARS
          ========================================================================== */}
      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{lang === 'hi' ? 'तकनीकी दक्षता' : 'Technical rigour'}</span>
            <h2>{lang === 'hi' ? 'सहकार कनेक्ट के प्रमुख तकनीकी स्तंभ' : 'Architectural pillars of SahakarConnect'}</h2>
            <p>
              Built on open digital public infrastructure adhering to Government of India guidelines, zero-trust
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

      {/* ==========================================================================
          7. STATUTORY MANDATE & COMPLIANCE BANNER
          ========================================================================== */}
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
              <div className="tags align-items-center">
                <span className="badge badge-neutral d-inline-flex align-items-center gap-1">
                  <IndianFlagIcon width={16} height={11} />
                  <span>Republic of India</span>
                </span>
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
