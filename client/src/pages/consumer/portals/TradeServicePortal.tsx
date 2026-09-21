import React, { useState, useEffect } from 'react';
import { TRADE_PORTALS, TradePortalConfig, ServicePackage } from './portalData';
import BookingModal from '../BookingModal';
import LiveBookingTracker from '../LiveBookingTracker';
import {
  ShieldCheckIcon,
  CheckIcon,
  ScaleIcon,
  MapPinIcon,
  ArrowRightIcon,
  PlumbingIcon,
  ElectricalIcon,
  CarpentryIcon,
  ApplianceIcon,
  StarIcon,
  ClockIcon,
} from '../../../components/common/Icons';
import { ServiceCatalogSkeleton } from '../../../components/common/Skeleton';

interface TradeServicePortalProps {
  portalId: 'plumbing' | 'electrical' | 'carpentry' | 'appliances';
  onSwitchPortal: (portalId: 'plumbing' | 'electrical' | 'carpentry' | 'appliances') => void;
  lang?: 'en' | 'hi';
}

export const TradeServicePortal: React.FC<TradeServicePortalProps> = ({
  portalId,
  onSwitchPortal,
  lang = 'en',
}) => {
  const portal: TradePortalConfig = TRADE_PORTALS[portalId] || TRADE_PORTALS.plumbing;
  const IconComponent = portal.icon;

  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeBooking, setActiveBooking] = useState<any | null>(null);
  const [isSwitchingTrade, setIsSwitchingTrade] = useState<boolean>(false);


  // Fetch consumer's bookings
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/bookings/my', {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (res.ok) {
        const data = await res.json();
        // Find if any booking matches this category and is pending/active
        const matchingPending = data.find(
          (b: any) =>
            b.status !== 'COMPLETED' &&
            b.status !== 'CANCELLED'
        );
        if (matchingPending && !activeBooking) {
          setActiveBooking(matchingPending);
        }
      }
    } catch (_err) {
      // silent fallback
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [portalId]);

  const handleBookClick = (pkg: ServicePackage) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleBookingCreated = (booking: any) => {
    setActiveBooking(booking);
    setIsModalOpen(false);
    fetchBookings();
  };

  const portalNavList: Array<{ id: 'plumbing' | 'electrical' | 'carpentry' | 'appliances'; label: string; Icon: any }> = [
    { id: 'plumbing', label: lang === 'hi' ? 'नलसाजी पोर्टल' : 'Plumbing Portal', Icon: PlumbingIcon },
    { id: 'electrical', label: lang === 'hi' ? 'विद्युत पोर्टल' : 'Electrical Portal', Icon: ElectricalIcon },
    { id: 'carpentry', label: lang === 'hi' ? 'बढ़ईगीरी पोर्टल' : 'Carpentry Portal', Icon: CarpentryIcon },
    { id: 'appliances', label: lang === 'hi' ? 'उपकरण पोर्टल' : 'Appliance Portal', Icon: ApplianceIcon },
  ];

  const handleTradeNavClick = (newId: 'plumbing' | 'electrical' | 'carpentry' | 'appliances') => {
    if (newId === portalId) return;
    setIsSwitchingTrade(true);
    setTimeout(() => {
      onSwitchPortal(newId);
      setIsSwitchingTrade(false);
    }, 180);
  };

  return (
    <div className="service-portal-wrapper">
      {/* 1. Quick Trade Switcher Strip */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4 bg-white border p-2 rounded shadow-sm">
        <div className="d-flex align-items-center gap-2">
          <span className="small fw-bold text-muted text-uppercase me-2 d-none d-md-inline" style={{ fontSize: '0.72rem' }}>
            {lang === 'hi' ? 'विशिष्ट सेवा पोर्टल चुनें:' : 'Select Trade Portal:'}
          </span>
          <div className="btn-group btn-group-sm" role="group" aria-label="Trade portals">
            {portalNavList.map((pNav) => {
              const NavIcon = pNav.Icon;
              const isCurrent = portalId === pNav.id;
              return (
                <button
                  key={pNav.id}
                  type="button"
                  className={`btn d-inline-flex align-items-center gap-1 ${
                    isCurrent ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                  onClick={() => handleTradeNavClick(pNav.id)}
                >
                  <NavIcon size={14} />
                  <span>{pNav.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-success" style={{ fontSize: '0.68rem' }}>
            {portal.activeTradesmen} {lang === 'hi' ? 'सत्यापित तकनीशियन सक्रिय' : 'Tradesmen Available'}
          </span>
          <span className="badge bg-light text-dark border" style={{ fontSize: '0.68rem' }}>
            {portal.inspectionWarrantyDays}-Day Warranty
          </span>
        </div>
      </div>

      {isSwitchingTrade ? (
        <ServiceCatalogSkeleton />
      ) : (
        <>
          {/* 2. Dedicated Portal Hero Header */}
          <div className="card shadow-sm border mb-4 bg-white overflow-hidden" style={{ borderLeft: `6px solid ${portal.accentColor}` }}>
        <div className="card-body p-4 p-md-5">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-8">
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <div
                  className="card-icon-wrapper"
                  style={{ backgroundColor: `${portal.accentColor}15`, color: portal.accentColor, borderColor: portal.accentColor }}
                >
                  <IconComponent size={24} />
                </div>
                <div>
                  <span className="badge bg-light text-dark border px-2 py-1 me-2" style={{ fontSize: '0.7rem' }}>
                    {portal.societyName}
                  </span>
                  <span className="badge bg-success text-white" style={{ fontSize: '0.7rem' }}>
                    Verified Cooperative
                  </span>
                </div>
              </div>

              <h1 className="h3 fw-bold text-dark mb-2">
                {lang === 'hi' ? portal.hindiName : portal.name}
              </h1>
              <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                Verified cooperative service portal adhering to{' '}
                <strong>{portal.statutoryCode}</strong>. Technicians are skilled member-owners of the cooperative society, delivering high workmanship standards with transparent pricing.
              </p>

              <div className="d-flex align-items-center gap-3 flex-wrap">
                <div className="d-inline-flex align-items-center gap-1 small text-dark fw-semibold">
                  <MapPinIcon size={15} color="var(--ux4g-primary)" />
                  <span>Prompt Neighborhood Dispatch</span>
                </div>
                <div className="d-inline-flex align-items-center gap-1 small text-dark fw-semibold">
                  <ShieldCheckIcon size={15} color="var(--ux4g-green)" />
                  <span>Pay After Service with 4-Digit PIN</span>
                </div>
                <div className="d-inline-flex align-items-center gap-1 small text-dark fw-semibold">
                  <ScaleIcon size={15} color="var(--ux4g-primary)" />
                  <span>88% Direct Technician Pay</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4 text-lg-end">
              <div className="p-3 bg-light border rounded">
                <div className="small text-muted mb-1">Cooperative Performance</div>
                <div className="d-flex justify-content-around text-center mt-2">
                  <div>
                    <div className="h4 fw-bold text-primary mb-0 d-inline-flex align-items-center justify-content-center gap-1">
                      <span>{portal.averageRating}</span>
                      <StarIcon size={16} color="#eab308" />
                    </div>
                    <div className="small text-muted" style={{ fontSize: '0.72rem' }}>Avg Rating</div>
                  </div>
                  <div className="border-end" />
                  <div>
                    <div className="h4 fw-bold text-success mb-0">{portal.completedJobsCount}+</div>
                    <div className="small text-muted" style={{ fontSize: '0.72rem' }}>Jobs Completed</div>
                  </div>
                  <div className="border-end" />
                  <div>
                    <div className="h4 fw-bold text-dark mb-0">{portal.inspectionWarrantyDays}d</div>
                    <div className="small text-muted" style={{ fontSize: '0.72rem' }}>Workmanship Warranty</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Live Active Booking Tracker Banner (if consumer has a job in progress) */}
      {activeBooking && (
        <div className="mb-4">
          <LiveBookingTracker
            booking={activeBooking}
            onBackToCatalog={() => {
              setActiveBooking(null);
              fetchBookings();
            }}
          />
        </div>
      )}

      {/* 4. Domain Packages Grid */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <h2 className="h5 fw-bold text-dark mb-1">
              {lang === 'hi' ? 'मानकीकृत सेवा पैकेज एवं पारदर्शी दरें' : 'Standardized Service Packages & Upfront Rates'}
            </h2>
            <p className="text-muted small mb-0">
              {lang === 'hi'
                ? 'स्पष्ट श्रम शुल्क। सामग्री वास्तविक बिल पर। 88% सीधे कामगार को, 8% कल्याण निधि में।'
                : 'Transparent labour charges. Required replacement spares charged at actuals with receipt. +18% GST.'}
            </p>
          </div>
          <span className="badge bg-light text-dark border px-3 py-2">
            Showing {portal.packages.length} Verified Packages
          </span>
        </div>

        <div className="row g-4">
          {portal.packages.map((pkg) => {
            const workerPay = Math.round(pkg.baseRate * 0.88 * 100) / 100;
            const welfareShare = Math.round(pkg.baseRate * 0.08 * 100) / 100;

            return (
              <div key={pkg.id} className="col-12 col-md-6 col-xl-4">
                <div className="persona-card p-4 d-flex flex-column h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-light text-primary border" style={{ fontSize: '0.72rem' }}>
                      Skill Level {pkg.nsqfLevel} Certified
                    </span>
                    <span className="small text-muted d-inline-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                      <ClockIcon size={13} color="currentColor" />
                      <span>{pkg.turnaroundTime}</span>
                    </span>
                  </div>

                  <h3 className="h6 fw-bold text-dark mb-1">
                    {lang === 'hi' ? pkg.hindiName : pkg.name}
                  </h3>
                  <p className="small text-muted mb-3 flex-grow-1" style={{ fontSize: '0.84rem' }}>
                    {pkg.description}
                  </p>

                  {/* Pricing Breakdown */}
                  <div className="p-2 mb-3 bg-light border rounded">
                    <div className="d-flex justify-content-between align-items-baseline mb-1">
                      <span className="small fw-bold text-dark">Labour Rate:</span>
                      <div>
                        <span className="h5 fw-bold text-primary mb-0">₹{pkg.baseRate}</span>
                        <span className="text-muted small ms-1" style={{ fontSize: '0.72rem' }}>+18% GST</span>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between small text-muted" style={{ fontSize: '0.74rem' }}>
                      <span>Labour only · Spares at actuals</span>
                      <span title="88% to technician, 8% to welfare fund">Fair Split: ₹{workerPay.toFixed(0)} tech / ₹{welfareShare.toFixed(0)} fund</span>
                    </div>
                  </div>

                  {/* Included Scope */}
                  <div className="small fw-bold text-uppercase text-secondary mb-2" style={{ fontSize: '0.68rem' }}>
                    Service Scope & Included Work
                  </div>
                  <ul className="feature-list mb-4">
                    {pkg.includes.map((inc, i) => (
                      <li key={i} style={{ fontSize: '0.8rem' }}>
                        <span className="check-icon">
                          <CheckIcon size={12} />
                        </span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-2 border-top">
                    <button
                      type="button"
                      className="btn btn-primary w-100 d-flex justify-content-between align-items-center"
                      onClick={() => handleBookClick(pkg)}
                    >
                      <span className="fw-semibold">
                        {lang === 'hi' ? 'सेवा बुक करें' : 'Book This Service'}
                      </span>
                      <ArrowRightIcon size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Trade Safety & Quality Standards */}
      <div className="card border shadow-sm p-4 mb-4 bg-white">
        <div className="d-flex align-items-center gap-2 mb-3">
          <ShieldCheckIcon size={20} className="text-success" />
          <h3 className="h6 fw-bold mb-0 text-dark">
            {lang === 'hi' ? 'सुरक्षा व गुणवत्ता मानक' : 'Workmanship & Safety Standards'}
          </h3>
        </div>
        <p className="small text-muted mb-3">
          All service packages booked under this cooperative follow standard safety and quality assurance procedures:
        </p>
        <div className="row g-2">
          {portal.safetyChecklist.map((item, idx) => (
            <div key={idx} className="col-12 col-md-6">
              <div className="d-flex align-items-center gap-2 p-2 bg-light border rounded small">
                <CheckIcon size={14} color="var(--ux4g-green)" />
                <span className="text-dark">{item}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}

      {/* 6. Booking Modal */}
      {isModalOpen && selectedPackage && (
        <BookingModal
          isOpen={isModalOpen}
          service={{
            id: selectedPackage.id,
            name: selectedPackage.name,
            category: selectedPackage.category,
            baseRate: selectedPackage.baseRate,
          }}
          onClose={() => setIsModalOpen(false)}
          onBookingSuccess={handleBookingCreated}
        />
      )}
    </div>
  );
};

export default TradeServicePortal;
