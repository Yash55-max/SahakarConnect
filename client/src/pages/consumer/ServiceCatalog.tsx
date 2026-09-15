import React, { useState, useEffect } from 'react';
import BookingModal from './BookingModal';
import LiveBookingTracker from './LiveBookingTracker';
import { ConsumerIcon } from '../../components/common/Icons';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  baseRate: number;
  nsqfLevel: number;
  description: string;
  turnaroundTime: string;
}

const SAMPLE_SERVICES: ServiceItem[] = [
  {
    id: 'plumbing-standard',
    name: 'Sanitary & Pipe Leakage Repair',
    category: 'Plumbing',
    baseRate: 800,
    nsqfLevel: 4,
    description: 'Diagnosis and repair of bathroom/kitchen pipelines, pressure joints, and drain lines.',
    turnaroundTime: '60-90 mins',
  },
  {
    id: 'electrical-repair',
    name: 'Electrical Short Circuit & MCB Setup',
    category: 'Electrical',
    baseRate: 1200,
    nsqfLevel: 5,
    description: 'Precision wiring diagnosis, circuit breaker repair, and inverter line load balancing.',
    turnaroundTime: '45-60 mins',
  },
  {
    id: 'carpentry-work',
    name: 'Furniture Assembly & Lock Fitting',
    category: 'Carpentry',
    baseRate: 950,
    nsqfLevel: 4,
    description: 'Hardware installation, security deadbolt alignment, and modular woodwork assembly.',
    turnaroundTime: '60-120 mins',
  },
  {
    id: 'appliance-service',
    name: 'Water Purifier & Geyser Overhaul',
    category: 'Appliances',
    baseRate: 1100,
    nsqfLevel: 4,
    description: 'Comprehensive component sanitization, heating coil testing, and filter membrane replacement.',
    turnaroundTime: '60-90 mins',
  },
];

export const ServiceCatalog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeBooking, setActiveBooking] = useState<any | null>(null);
  const [pastBookings, setPastBookings] = useState<any[]>([]);

  const categories = ['All', 'Plumbing', 'Electrical', 'Carpentry', 'Appliances'];

  // Load existing bookings on mount
  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/bookings/my', {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (res.ok) {
          const data = await res.json();
          setPastBookings(data);
          // If there is an active incomplete booking, focus on it
          const pending = data.find((b: any) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
          if (pending && !activeBooking) {
            setActiveBooking(pending);
          }
        }
      } catch (err) {
        // silent fallback
      }
    };
    fetchMyBookings();
  }, []);

  const filteredServices =
    selectedCategory === 'All'
      ? SAMPLE_SERVICES
      : SAMPLE_SERVICES.filter((s) => s.category === selectedCategory);

  const handleBookClick = (service: ServiceItem) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleBookingCreated = (booking: any) => {
    setActiveBooking(booking);
    setPastBookings((prev) => [booking, ...prev]);
  };

  if (activeBooking) {
    return (
      <LiveBookingTracker
        booking={activeBooking}
        onBackToCatalog={() => setActiveBooking(null)}
      />
    );
  }

  return (
    <div>
      {/* Header Banner */}
      <div className="card shadow-sm border mb-4 bg-white">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="card-icon-wrapper">
                <ConsumerIcon size={22} />
              </div>
              <div>
                <h2 className="h5 fw-bold text-dark mb-1">Citizen Consumer Service Catalog</h2>
                <p className="text-muted small mb-0">
                  Book verified tradesmen accredited by South Delhi Urban Tradesmen PSCS under statutory tariffs.
                </p>
              </div>
            </div>

            {pastBookings.length > 0 && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setActiveBooking(pastBookings[0])}
              >
                Track Recent Booking ({pastBookings[0].status})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
        <span className="small fw-semibold text-secondary me-2">Filter Trade:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`btn btn-sm ${
              selectedCategory === cat ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="row g-4 mb-4">
        {filteredServices.map((service) => (
          <div key={service.id} className="col-12 col-md-6 col-xl-3">
            <div className="persona-card p-3 h-100 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-light text-dark border small">{service.category}</span>
                <span className="badge bg-success-subtle text-success border border-success-subtle small">
                  NSQF Lvl {service.nsqfLevel}
                </span>
              </div>

              <h3 className="h6 fw-bold text-dark mb-2">{service.name}</h3>
              <p className="small text-muted mb-3 flex-grow-1">{service.description}</p>

              <div className="border-top pt-2 mb-3 small text-muted d-flex justify-content-between">
                <span>Standard Rate:</span>
                <span className="fw-bold text-dark h6 mb-0">₹{service.baseRate}</span>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-primary w-100 mt-auto"
                onClick={() => handleBookClick(service)}
              >
                Book Now (₹{service.baseRate})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={selectedService}
        onBookingSuccess={handleBookingCreated}
      />
    </div>
  );
};
export default ServiceCatalog;
