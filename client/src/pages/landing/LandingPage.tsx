import React, { useState } from 'react';
import {
  PlumbingIcon,
  ElectricalIcon,
  CarpentryIcon,
  ApplianceIcon,
  ShieldCheckIcon,
  ClockIcon,
  StarIcon,
  ScaleIcon,
  CheckIcon,
  ChevronRightIcon,
  SearchIcon,
  LockIcon,
} from '../../components/common/Icons';
import { ImageWithSkeleton } from '../../components/common/Skeleton';

interface LandingPageProps {
  lang: 'en' | 'hi';
  onSelectPortal: (portalId: string) => void;
  backendHealth?: {
    status: string;
    db: string;
    timestamp: string;
    uptime?: number;
  } | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  lang,
  onSelectPortal,
}) => {
  const [heroSearch, setHeroSearch] = useState('');
  const [calcAmount, setCalcAmount] = useState<number>(1000);

  // Distribution formula: 88% technician, 8% cooperative reserve, 4% platform operations
  const worker = Math.round(calcAmount * 0.88);
  const welfare = Math.round(calcAmount * 0.08);
  const platform = Math.round(calcAmount * 0.04);

  const quickAmounts = [500, 1000, 1800, 2500];

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN').format(val);
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = heroSearch.trim().toLowerCase();
    if (!q) {
      onSelectPortal('consumer');
      return;
    }
    if (q.includes('plumb') || q.includes('pipe') || q.includes('leak') || q.includes('drain') || q.includes('नल') || q.includes('लीक')) {
      onSelectPortal('portal:plumbing');
    } else if (q.includes('elect') || q.includes('wire') || q.includes('mcb') || q.includes('fuse') || q.includes('पंखा') || q.includes('लाइट')) {
      onSelectPortal('portal:electrical');
    } else if (q.includes('carp') || q.includes('door') || q.includes('wood') || q.includes('lock') || q.includes('बढ़ई') || q.includes('ताला')) {
      onSelectPortal('portal:carpentry');
    } else if (q.includes('appl') || q.includes('ac') || q.includes('ro') || q.includes('fridge') || q.includes('एसी') || q.includes('फ्रिज')) {
      onSelectPortal('portal:appliances');
    } else {
      onSelectPortal('consumer');
    }
  };

  // 4 Primary Service Category Tiles
  const categoryTiles = [
    {
      id: 'portal:plumbing',
      title: 'Plumbing Services',
      hindiTitle: 'नलसाजी सेवाएं',
      tag: 'Pipe leaks, taps, pumps & drains',
      tagHi: 'पाइप लीकेज, नल, मोटर व सीवेज',
      icon: PlumbingIcon,
      color: '#0284c7',
      bgLight: '#f0f9ff',
      price: '₹249',
    },
    {
      id: 'portal:electrical',
      title: 'Electrical Services',
      hindiTitle: 'विद्युत सेवाएं',
      tag: 'Short circuits, wiring & switches',
      tagHi: 'शॉर्ट सर्किट, वायरिंग व एमसीबी',
      icon: ElectricalIcon,
      color: '#d97706',
      bgLight: '#fffbeb',
      price: '₹299',
    },
    {
      id: 'portal:carpentry',
      title: 'Carpentry Services',
      hindiTitle: 'बढ़ईगीरी सेवाएं',
      tag: 'Locks, doors, furniture & fittings',
      tagHi: 'ताला, दरवाजा, फर्नीचर मरम्मत',
      icon: CarpentryIcon,
      color: '#9333ea',
      bgLight: '#faf5ff',
      price: '₹349',
    },
    {
      id: 'portal:appliances',
      title: 'Appliance Repair',
      hindiTitle: 'उपकरण मरम्मत',
      tag: 'Split AC jet wash, fridge, RO',
      tagHi: 'एसी जेट सर्विस, फ्रिज, आरओ',
      icon: ApplianceIcon,
      color: '#059669',
      bgLight: '#ecfdf5',
      price: '₹399',
    },
  ];

  // 6 Popular Standardized Services
  const popularServices = [
    {
      id: 'portal:plumbing',
      title: lang === 'hi' ? 'अंडरग्राउंड पाइप लीकेज सुधार' : 'Concealed Pipeline & Leak Repair',
      society: 'Delhi Plumbers Service Cooperative Society',
      code: 'IS 12183 Standard',
      icon: PlumbingIcon,
      price: '₹649',
      duration: '45-60 mins',
      rating: '4.89',
      desc: lang === 'hi'
        ? 'गैर-विनाशकारी लीकेज डिटेक्शन, सीपीवीसी लाइन रिपेयर एवं वॉटर प्रेशर बैलेंसिंग।'
        : 'Precision acoustic leak detection and repair of concealed PPR/CPVC lines with minimal wall chipping.',
    },
    {
      id: 'portal:electrical',
      title: lang === 'hi' ? 'शॉर्ट सर्किट व एमसीबी लोड बैलेंसिंग' : 'Short Circuit & MCB Load Balancing',
      society: 'Delhi Certified Electricians Cooperative',
      code: 'IS 732 Standard',
      icon: ElectricalIcon,
      price: '₹1,200',
      duration: '60-90 mins',
      rating: '4.85',
      desc: lang === 'hi'
        ? 'थर्मल हॉटस्पॉट स्कैन, 30mA आरसीसीबी अर्थ-लीकेज टेस्ट एवं सब-सर्किट लोड पुनर्वितरण।'
        : 'Thermal scan of overloaded phases, neutral leakage check, and dual-pole RCCB / MCB replacement.',
    },
    {
      id: 'portal:carpentry',
      title: lang === 'hi' ? 'सुरक्षा लॉक व दरवाजे संरेखण' : 'High-Security Lock & Door Alignment',
      society: 'Delhi Artisans & Woodcrafts Cooperative',
      code: 'IS 2202 Standard',
      icon: CarpentryIcon,
      price: '₹850',
      duration: '45-60 mins',
      rating: '4.92',
      desc: lang === 'hi'
        ? 'मोर्टिज़ ताला, डिजिटल स्मार्ट लॉक फिटिंग, दरवाजे का संरेखण एवं हैवी-ड्यूटी कब्जे।'
        : 'Mortise lock routing, smart biometric lock installation, door planer leveling, and heavy-duty hinges.',
    },
    {
      id: 'portal:appliances',
      title: lang === 'hi' ? 'इन्वर्टर स्प्लिट एसी फोम जेट वाश' : 'Inverter Split AC Foam Jet Deep Service',
      society: 'Delhi Home Appliance Technicians Cooperative',
      code: 'BEE Guidelines',
      icon: ApplianceIcon,
      price: '₹799',
      duration: '60-80 mins',
      rating: '4.88',
      desc: lang === 'hi'
        ? 'वाटरप्रूफ जैकेट, बायोडिग्रेडेबल फोम कॉइल वाश, कंडेनसर प्रेशर क्लीनिंग व कूलिंग टेस्ट।'
        : 'Indoor jacket protection, biodegradable foam coil wash, outdoor pressure jetting, and cooling delta test.',
    },
    {
      id: 'portal:appliances',
      title: lang === 'hi' ? 'आरओ वाटर प्यूरीफायर मेंब्रेन सर्विस' : 'Multi-Stage RO Water Purifier Service',
      society: 'Delhi Home Appliance Technicians Cooperative',
      code: 'Safety Verified',
      icon: ApplianceIcon,
      price: '₹950',
      duration: '45-60 mins',
      rating: '4.84',
      desc: lang === 'hi'
        ? 'सेडिमेंट व कार्बन प्री-फ़िल्टर नवीनीकरण, 80 GPD मेंब्रेन जांच और टीडीएस कमी परीक्षण।'
        : 'Pre-filter replacement, 80 GPD membrane performance check, booster pump pressure test, and food-grade flush.',
    },
    {
      id: 'portal:carpentry',
      title: lang === 'hi' ? 'मॉड्यूलर किचन चैनल व हाइड्रोलिक रिपेयर' : 'Modular Kitchen Channel & Hydraulic Repair',
      society: 'Delhi Artisans & Woodcrafts Cooperative',
      code: 'Quality Assured',
      icon: CarpentryIcon,
      price: '₹1,350',
      duration: '90-120 mins',
      rating: '4.90',
      desc: lang === 'hi'
        ? 'टैंडेम बॉक्स संरेखण, सॉफ्ट-क्लोज हाइड्रोलिक स्ट्रट प्रतिस्थापन एवं वॉटर-रेसिस्टेंट सील।'
        : 'Tandem drawer slide leveling, soft-close gas strut renewal, and water-resistant edge protection.',
    },
  ];

  // 4 Customer Trust Pillars
  const trustPillars = [
    {
      icon: ShieldCheckIcon,
      title: lang === 'hi' ? 'सत्यापित स्थानीय कारीगर' : 'Verified Local Technicians',
      desc: lang === 'hi'
        ? 'प्रत्येक तकनीशियन पृष्ठभूमि-सत्यापित, प्राथमिक सहकारी समिति का सदस्य और प्रमाणित विशेषज्ञ है।'
        : 'Background-verified, identity-checked tradespeople belonging to registered neighborhood service cooperatives.',
    },
    {
      icon: ScaleIcon,
      title: lang === 'hi' ? 'पारदर्शी upfront दरें' : 'Upfront & Transparent Rates',
      desc: lang === 'hi'
        ? 'कोई छिपा हुआ शुल्क नहीं। स्पष्ट श्रम शुल्क और सामग्री का वास्तविक बिल पर भुगतान।'
        : 'Standardized rate cards for labour. Spare parts charged at actual retail prices with receipt.',
    },
    {
      icon: LockIcon,
      title: lang === 'hi' ? 'काम पूरा होने पर 4-अंकीय पिन से भुगतान' : 'Pay After Work with 4-Digit PIN',
      desc: lang === 'hi'
        ? 'भुगतान सुरक्षित रहता है। काम का निरीक्षण कर संतुष्ट होने पर ही 4-अंकीय पिन देकर भुगतान जारी करें।'
        : 'Your payment is released only after the job is completed and you share your 4-digit completion PIN.',
    },
    {
      icon: ClockIcon,
      title: lang === 'hi' ? '30-दिन की कार्य वारंटी' : '30-Day Workmanship Warranty',
      desc: lang === 'hi'
        ? 'सेवा के बाद 30 दिनों के भीतर किसी भी संबंधित समस्या पर निःशुल्क पुनः निरीक्षण एवं समाधान।'
        : 'Comprehensive 30-day warranty on all completed jobs with prompt doorstep resolution if any issue recurs.',
    },
  ];

  // Community Portal Routes
  const communityCards = [
    {
      id: 'consumer',
      badge: lang === 'hi' ? 'नागरिक व परिवार' : 'Households & Consumers',
      title: lang === 'hi' ? 'विश्वसनीय घरेलू सेवाएं' : 'Verified Home Services',
      desc: lang === 'hi'
        ? 'नलसाजी, विद्युत, बढ़ईगीरी और उपकरण मरम्मत के लिए त्वरित स्थानीय बुकिंग।'
        : 'Book trusted plumbers, electricians, carpenters, and appliance experts with OTP-verified completion.',
      cta: lang === 'hi' ? 'सेवाएं बुक करें →' : 'Book Services →',
      image: '/images/citizen-family.jpg',
    },
    {
      id: 'login:provider',
      badge: lang === 'hi' ? 'कुशल कारीगर' : 'Skilled Technicians',
      title: lang === 'hi' ? 'सहकारी साथी बनें' : 'Join as a Service Partner',
      desc: lang === 'hi'
        ? 'बिना किसी अनुचित कटौती के 88% प्रत्यक्ष पारिश्रमिक और सहकारी कल्याण लाभ प्राप्त करें।'
        : 'Earn 88% direct payout with prompt daily settlements, accident cover, and cooperative ownership.',
      cta: lang === 'hi' ? 'पार्टनर साइन इन →' : 'Partner Sign In →',
      image: '/images/artisan-worker.jpg',
    },
    {
      id: 'login:coop_admin',
      badge: lang === 'hi' ? 'समिति प्रबंधन' : 'Society Administrators',
      title: lang === 'hi' ? 'सहकारी समिति केंद्र' : 'Cooperative Society Hub',
      desc: lang === 'hi'
        ? 'कारीगरों का सत्यापन, क्षेत्र आवंटन, कल्याण निधि एवं बही-खाता प्रबंधन।'
        : 'Manage technician queues, review regional dispatch schedules, and oversee member welfare accounts.',
      cta: lang === 'hi' ? 'समिति लॉगिन →' : 'Admin Hub →',
      image: '/images/coop-leaders.jpg',
    },
  ];

  return (
    <div className="landing-page">
      {/* ==========================================================================
          1. HERO SECTION: Customer-First Search & Direct Categories
          ========================================================================== */}
      <section className="py-4 py-md-5 bg-light border-bottom">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-7">
              <h1 className="display-6 fw-bold text-dark mb-3" style={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {lang === 'hi' ? (
                  <>
                    आपके मुहल्ले के <span className="text-primary">सत्यापित कारीगर</span>, उचित मूल्य पर।
                  </>
                ) : (
                  <>
                    Book <span className="text-primary">Verified Technicians</span> You Can Trust.
                  </>
                )}
              </h1>

              <p className="lead text-secondary mb-4" style={{ maxWidth: '65ch', fontSize: '1.05rem', lineHeight: 1.6 }}>
                {lang === 'hi'
                  ? 'नलसाजी, विद्युत, बढ़ईगीरी और उपकरण मरम्मत के लिए स्थानीय प्राथमिक सहकारी समितियों के अनुभवी कारीगर। काम पूरा होने पर 4-अंकीय पिन द्वारा सुरक्षित भुगतान।'
                  : 'Reliable plumbers, electricians, carpenters, and appliance repair experts from verified local cooperatives. Transparent labour rates, 30-day warranty, and pay only after satisfaction.'}
              </p>

              {/* Large Search Box */}
              <form onSubmit={handleHeroSearch} className="p-2 border shadow-xs mb-4 bg-white rounded-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="ps-2 text-muted">
                    <SearchIcon size={20} />
                  </div>
                  <input
                    type="text"
                    className="form-control border-0 shadow-none px-2"
                    style={{ fontSize: '1rem' }}
                    placeholder={
                      lang === 'hi'
                        ? 'सेवा या समस्या खोजें (उदा. लीकेज, एमसीबी, ताला, एसी सर्विस)...'
                        : 'What service do you need? (e.g. AC service, pipe leak, fan repair)...'
                    }
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    aria-label="Search home services"
                  />
                  <button type="submit" className="btn btn-primary px-4 py-2 fw-semibold rounded-2 text-nowrap">
                    {lang === 'hi' ? 'खोजें' : 'Find Help'}
                  </button>
                </div>
              </form>

              {/* Trust Badges Row */}
              <div className="d-flex align-items-center gap-3 flex-wrap small text-muted">
                <span className="d-inline-flex align-items-center gap-1">
                  <CheckIcon size={14} color="#16a34a" />
                  <span>{lang === 'hi' ? 'पृष्ठभूमि सत्यापित' : 'Background Verified'}</span>
                </span>
                <span className="d-inline-flex align-items-center gap-1">
                  <CheckIcon size={14} color="#16a34a" />
                  <span>{lang === 'hi' ? 'पारदर्शी दरें' : 'No Hidden Charges'}</span>
                </span>
                <span className="d-inline-flex align-items-center gap-1">
                  <CheckIcon size={14} color="#16a34a" />
                  <span>{lang === 'hi' ? '30-दिन वारंटी' : '30-Day Warranty'}</span>
                </span>
              </div>
            </div>

            {/* Right Column: 4 Category Quick-Cards */}
            <div className="col-12 col-lg-5">
              <div className="row g-3">
                {categoryTiles.map((cat) => {
                  const CatIcon = cat.icon;
                  return (
                    <div key={cat.id} className="col-6">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectPortal(cat.id)}
                        onKeyDown={(e) => e.key === 'Enter' && onSelectPortal(cat.id)}
                        className="card h-100 border shadow-xs p-3 transition-all cursor-pointer bg-white text-decoration-none"
                        style={{
                          borderRadius: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <span
                          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                          style={{
                            width: '44px',
                            height: '44px',
                            backgroundColor: cat.bgLight,
                            color: cat.color,
                          }}
                        >
                          <CatIcon size={24} />
                        </span>
                        <h2 className="h6 fw-bold text-dark mb-1">
                          {lang === 'hi' ? cat.hindiTitle : cat.title}
                        </h2>
                        <div className="small text-muted mb-2" style={{ fontSize: '0.8rem', lineHeight: 1.35 }}>
                          {lang === 'hi' ? cat.tagHi : cat.tag}
                        </div>
                        <div className="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                          <span className="small text-muted" style={{ fontSize: '0.82rem' }}>Starting</span>
                          <span className="fw-bold text-primary" style={{ fontSize: '0.92rem' }}>{cat.price}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          2. POPULAR SERVICES WITH TRANSPARENT RATES (IS / BIS Standards)
          ========================================================================== */}
      <section className="py-5" id="services">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
            <div>
              <h2 className="h3 fw-bold text-dark mb-1">
                {lang === 'hi' ? 'लोकप्रिय सहकारी सेवाएं' : 'Popular Services & Transparent Rates'}
              </h2>
              <p className="text-muted small mb-0" style={{ maxWidth: '65ch' }}>
                {lang === 'hi'
                  ? 'सभी दरें पारदर्शी हैं। सामग्री का भुगतान वास्तविक बिल पर, श्रम शुल्क निर्धारित।'
                  : 'Labour charges shown upfront. Spares charged at actuals with receipt. +18% GST applicable.'}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-pill px-3"
              onClick={() => onSelectPortal('consumer')}
            >
              {lang === 'hi' ? 'सभी 20+ सेवाएं देखें →' : 'View All 20+ Services →'}
            </button>
          </div>

          <div className="row g-4">
            {popularServices.map((service, index) => {
              const SIcon = service.icon;
              return (
                <div key={index} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 border shadow-xs p-3 bg-white d-flex flex-column" style={{ borderRadius: '12px' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span
                        className="p-2 rounded-circle bg-light text-primary d-inline-flex align-items-center justify-content-center"
                        style={{ width: '38px', height: '38px' }}
                      >
                        <SIcon size={18} />
                      </span>
                      <span className="badge bg-light text-secondary" style={{ fontSize: '0.82rem' }}>
                        {service.code}
                      </span>
                    </div>

                    <h3 className="h6 fw-bold text-dark mb-1">{service.title}</h3>
                    <div className="small text-muted mb-2" style={{ fontSize: '0.8rem' }}>
                      {service.society}
                    </div>
                    <p className="small text-secondary mb-3 flex-grow-1" style={{ fontSize: '0.85rem', lineHeight: 1.45 }}>
                      {service.desc}
                    </p>

                    <div className="d-flex align-items-center gap-3 mb-3 small text-muted" style={{ fontSize: '0.8rem' }}>
                      <span className="d-inline-flex align-items-center gap-1">
                        <ClockIcon size={12} />
                        <span>{service.duration}</span>
                      </span>
                      <span className="d-inline-flex align-items-center gap-1">
                        <StarIcon size={12} color="#eab308" />
                        <span className="fw-semibold text-dark">{service.rating}</span>
                        <span>rating</span>
                      </span>
                    </div>

                    <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                      <div>
                        <div className="h5 fw-bold text-primary mb-0">{service.price}</div>
                        <div className="text-muted" style={{ fontSize: '0.82rem' }}>Labour only · Spares extra</div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm btn-primary rounded-pill px-3"
                        onClick={() => onSelectPortal(service.id)}
                      >
                        {lang === 'hi' ? 'बुक करें' : 'Book Service'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================================================
          3. HOW IT WORKS & 4 TRUST PILLARS
          ========================================================================== */}
      <section className="py-5 bg-light border-top border-bottom">
        <div className="container">
          <div className="text-center mb-5" style={{ maxWidth: '640px', margin: '0 auto' }}>
            <h2 className="h3 fw-bold text-dark mb-2">
              {lang === 'hi' ? 'सहकार कनेक्ट क्यों चुनें?' : 'Why Choose SahakarConnect?'}
            </h2>
            <p className="text-muted small mb-0" style={{ maxWidth: '65ch', margin: '0 auto' }}>
              {lang === 'hi'
                ? 'स्थानीय कारीगरों के सशक्तिकरण और नागरिकों की सुरक्षा के लिए निर्मित पारदर्शी सहकारी मंच।'
                : 'A community cooperative platform built on direct accountability, fair technician earnings, and customer protection.'}
            </p>
          </div>

          <div className="row g-4">
            {trustPillars.map((tp, idx) => {
              const TPIcon = tp.icon;
              return (
                <div key={idx} className="col-12 col-sm-6 col-lg-3">
                  <div className="p-4 text-center h-100">
                    <span
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                      style={{
                        width: '54px',
                        height: '54px',
                        backgroundColor: 'var(--ux4g-bg-primary, #f2efff)',
                        color: 'var(--ux4g-primary-600, #4a2bc2)',
                      }}
                    >
                      <TPIcon size={24} />
                    </span>
                    <h3 className="h6 fw-bold text-dark mb-2">{tp.title}</h3>
                    <p className="small text-muted mb-0" style={{ fontSize: '0.84rem', lineHeight: 1.55 }}>
                      {tp.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================================================
          4. FAIR-SHARE COOPERATIVE TRANSPARENCY (Positive Value Proposition)
          ========================================================================== */}
      <section className="py-5" id="calculator">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6">
              <h2 className="h3 fw-bold text-dark mb-3">
                {lang === 'hi' ? '100% पारदर्शी शुल्क विभाजन' : 'Transparent Cooperative Distribution'}
              </h2>
              <p className="text-muted mb-4" style={{ fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '65ch' }}>
                {lang === 'hi'
                  ? 'सहकार कनेक्ट पर आपके द्वारा भुगतान किए गए प्रत्येक रुपये का 88% सीधे कामगार को जाता है, 8% उनके कल्याण व बीमा कोष में, और मात्र 4% न्यूनतम प्लेटफ़ॉर्म परिचालन में। जब कारीगर को उचित पारिश्रमिक मिलता है, तो आपको सर्वोत्तम सेवा मिलती है।'
                  : 'When skilled tradespeople earn fair compensation without heavy intermediary cuts, service quality increases. On SahakarConnect, 88% goes directly to the technician, 8% to their cooperative healthcare & welfare fund, and just 4% covers essential platform operations.'}
              </p>

              {/* Amount quick select */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">
                  {lang === 'hi' ? 'सेवा राशि का परीक्षण करें:' : 'Test with a service bill amount:'}
                </label>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="input-group input-group-sm" style={{ maxWidth: '160px' }}>
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                      className="form-control"
                      value={calcAmount}
                      min="100"
                      step="50"
                      onChange={(e) => setCalcAmount(Number(e.target.value) || 0)}
                    />
                  </div>
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 ${
                        calcAmount === amt ? 'btn-primary' : 'btn-outline-secondary'
                      }`}
                      onClick={() => setCalcAmount(amt)}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="small text-muted" style={{ fontSize: '0.8rem' }}>
                ✓ {lang === 'hi' ? 'दैनिक प्रत्यक्ष बैंक निपटान' : 'Daily direct settlement to technician'}
                {' · '}
                ✓ {lang === 'hi' ? 'दुर्घटना व स्वास्थ्य बीमा' : 'Cooperative healthcare fund'}
              </div>
            </div>

            {/* Transparent Distribution Ledger */}
            <div className="col-12 col-lg-6">
              <div className="border rounded-3 p-4 bg-white shadow-xs">
                <div className="d-flex justify-content-between align-items-center pb-3 border-bottom">
                  <div>
                    <div className="small fw-bold text-success text-uppercase" style={{ letterSpacing: '0.04em' }}>
                      88% Direct Payout
                    </div>
                    <div className="fw-semibold text-dark">
                      {lang === 'hi' ? 'कारीगर को प्रत्यक्ष पारिश्रमिक' : 'Direct Worker Payout'}
                    </div>
                    <div className="small text-muted" style={{ fontSize: '0.8rem' }}>
                      Released instantly upon your 4-digit PIN verification
                    </div>
                  </div>
                  <div className="h4 fw-bold text-success mb-0">₹{formatINR(worker)}</div>
                </div>

                <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                  <div>
                    <div className="small fw-bold text-primary text-uppercase" style={{ letterSpacing: '0.04em' }}>
                      8% Cooperative Fund
                    </div>
                    <div className="fw-semibold text-dark">
                      {lang === 'hi' ? 'कल्याण, स्वास्थ्य व बीमा कोष' : 'Welfare & Emergency Cover'}
                    </div>
                    <div className="small text-muted" style={{ fontSize: '0.8rem' }}>
                      Administered democratically by primary cooperative society
                    </div>
                  </div>
                  <div className="h4 fw-bold text-primary mb-0">₹{formatINR(welfare)}</div>
                </div>

                <div className="d-flex justify-content-between align-items-center pt-3">
                  <div>
                    <div className="small fw-bold text-secondary text-uppercase" style={{ letterSpacing: '0.04em' }}>
                      4% Platform Operations
                    </div>
                    <div className="fw-semibold text-dark">
                      {lang === 'hi' ? 'प्लेटफॉर्म रखरखाव व सहायता' : 'Platform Hosting & Support'}
                    </div>
                    <div className="small text-muted" style={{ fontSize: '0.8rem' }}>
                      Customer support, cloud routing, and SMS gateway
                    </div>
                  </div>
                  <div className="h4 fw-bold text-secondary mb-0">₹{formatINR(platform)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          5. COMMUNITY PORTALS (Clean Persona Cards)
          ========================================================================== */}
      <section className="py-5 bg-light border-top">
        <div className="container">
          <div className="text-center mb-5" style={{ maxWidth: '640px', margin: '0 auto' }}>
            <h2 className="h3 fw-bold text-dark mb-2">
              {lang === 'hi' ? 'सहकार कनेक्ट सभी के लिए' : 'Built for Households, Technicians & Cooperatives'}
            </h2>
            <p className="text-muted small mb-0" style={{ maxWidth: '65ch', margin: '0 auto' }}>
              {lang === 'hi'
                ? 'नागरिकों के लिए आसान बुकिंग और कुशल कामगारों के लिए सम्मानजनक आजीविका।'
                : 'Connecting neighborhoods with skilled tradespeople through structured, self-governed service cooperatives.'}
            </p>
          </div>

          <div className="row g-4">
            {communityCards.map((p) => (
              <div key={p.id} className="col-12 col-md-4">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectPortal(p.id)}
                  onKeyDown={(e) => e.key === 'Enter' && onSelectPortal(p.id)}
                  className="card h-100 border shadow-xs overflow-hidden cursor-pointer bg-white d-flex flex-column"
                  style={{ borderRadius: '14px', cursor: 'pointer' }}
                >
                  <div style={{ height: '170px', overflow: 'hidden' }}>
                    <ImageWithSkeleton
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      decoding="async"
                      containerStyle={{ width: '100%', height: '100%' }}
                    />
                  </div>
                  <div className="p-4 d-flex flex-column flex-grow-1">
                    <span className="badge bg-light text-primary align-self-start mb-2" style={{ fontSize: '0.82rem' }}>
                      {p.badge}
                    </span>
                    <h3 className="h6 fw-bold text-dark mb-2">{p.title}</h3>
                    <p className="small text-muted mb-3 flex-grow-1" style={{ fontSize: '0.84rem', lineHeight: 1.5 }}>
                      {p.desc}
                    </p>
                    <div className="pt-2 border-top d-flex justify-content-between align-items-center">
                      <span className="small fw-semibold text-primary">{p.cta}</span>
                      <ChevronRightIcon size={14} color="var(--ux4g-primary, #4a2bc2)" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
