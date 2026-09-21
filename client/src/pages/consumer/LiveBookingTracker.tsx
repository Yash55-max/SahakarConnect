import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { ShieldCheckIcon, CheckIcon } from '../../components/common/Icons';

interface BookingTrackerProps {
  booking: any;
  onBackToCatalog: () => void;
}

export const LiveBookingTracker: React.FC<BookingTrackerProps> = ({
  booking: initialBooking,
  onBackToCatalog,
}) => {
  const [booking, setBooking] = useState(initialBooking);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleStatusChange = (data: any) => {
      if (data.bookingId === booking.id || data.id === booking.id) {
        console.log('[LiveTracker] Received booking update:', data);
        setBooking((prev: any) => ({
          ...prev,
          ...data,
          status: data.status,
          provider: data.provider || prev.provider,
        }));
      }
    };

    socket.on('booking:statusChanged', handleStatusChange);

    return () => {
      socket.off('booking:statusChanged', handleStatusChange);
    };
  }, [socket, booking.id]);

  // Periodic polling fallback to guarantee status synchronization
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/bookings/${booking.id}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (res.ok) {
          const data = await res.json();
          setBooking(data);
        }
      } catch (err) {
        // silent fallback
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [booking.id]);

  const steps = [
    { key: 'REQUESTED', label: '1. Requested', desc: 'Spatial matching active' },
    { key: 'ACCEPTED', label: '2. Accepted', desc: 'Provider assigned' },
    { key: 'IN_PROGRESS', label: '3. In Progress', desc: 'Work underway' },
    { key: 'COMPLETED', label: '4. Completed', desc: 'Escrow released' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === booking.status);

  return (
    <div className="container-fluid px-0">
      {/* Header bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary mb-2"
            onClick={onBackToCatalog}
          >
            ← Back to Service Catalog
          </button>
          <h3 className="h5 fw-bold text-dark mb-0">
            Live Booking Dispatch: #{booking.id.slice(0, 8)}
          </h3>
          <span className="text-muted small">
            Created on {new Date(booking.createdAt).toLocaleTimeString()}
          </span>
        </div>

        <div className="text-end">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 small">
            Status: {booking.status}
          </span>
        </div>
      </div>

      {/* Status Stepper */}
      <div className="card shadow-sm border mb-4 bg-white">
        <div className="card-body p-4">
          <div className="row g-2 text-center">
            {steps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.key} className="col-6 col-md-3">
                  <div
                    className={`p-3 rounded border ${
                      isCurrent
                        ? 'border-primary bg-light'
                        : isPast
                        ? 'border-success bg-white text-muted'
                        : 'border-light-subtle bg-light text-muted'
                    }`}
                  >
                    <div className="d-flex justify-content-center mb-1">
                      {isPast ? (
                        <span className="badge bg-success rounded-circle p-1">
                          <CheckIcon size={12} color="#fff" />
                        </span>
                      ) : (
                        <span
                          className={`badge ${
                            isCurrent ? 'bg-primary' : 'bg-secondary'
                          } rounded-circle px-2 py-1 small`}
                        >
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className={`small fw-bold ${isCurrent ? 'text-primary' : 'text-dark'}`}>
                      {step.label}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Security Completion PIN Card */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border border-warning h-100 bg-white">
            <div className="card-header bg-warning-subtle border-warning-subtle py-3">
              <div className="d-flex align-items-center gap-2">
                <ShieldCheckIcon size={20} className="text-warning-emphasis" color="currentColor" />
                <span className="fw-bold text-warning-emphasis small text-uppercase">
                  Statutory Completion Security PIN
                </span>
              </div>
            </div>

            <div className="card-body p-4 text-center">
              <div className="text-muted small mb-2">Your 4-Digit Job Verification PIN</div>
              <div
                className="display-4 fw-bold text-primary font-monospace bg-light py-3 px-4 rounded border d-inline-block letter-spacing-lg mb-3"
                style={{ letterSpacing: '0.3em' }}
              >
                {booking.completionOtp || '••••'}
              </div>

              <div className="alert alert-warning text-start small mb-0 border">
                <strong>Customer Payment Protection:</strong>
                <p className="mb-0 mt-1" style={{ fontSize: '0.82rem' }}>
                  Share this 4-digit PIN with your technician <strong>ONLY</strong> after the work has been completed to your satisfaction. Providing this PIN authorizes the payment release to the technician.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Provider Details Card */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border h-100 bg-white">
            <div className="card-header bg-light border-bottom py-3">
              <span className="fw-bold text-dark small text-uppercase">
                Assigned Cooperative Tradesman
              </span>
            </div>

            <div className="card-body p-4">
              {booking.provider ? (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h4 className="h6 fw-bold mb-1 text-dark">
                        {booking.provider.user?.name || 'Verified Cooperative Member'}
                      </h4>
                      <div className="text-muted small">
                        Phone: {booking.provider.user?.phone || '+91 98111 00001'}
                      </div>
                    </div>
                    <span className="badge bg-success text-white px-2 py-1 small">
                      NSQF Level {booking.provider.nsqfLevel || 4} Certified
                    </span>
                  </div>

                  <div className="border-top pt-3 small text-muted">
                    <div className="mb-1">
                      <strong>Cooperative Society:</strong> {booking.cooperative?.name || 'South Delhi PSCS'}
                    </div>
                    <div className="mb-1">
                      <strong>Rating:</strong> {booking.provider.ratingAverage || 4.9} / 5.0
                    </div>
                    <div>
                      <strong>Membership:</strong> Class-A Voting Member (MSCS Act 2023)
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
                  <div className="fw-semibold text-dark small">
                    Searching for nearby verified cooperative providers...
                  </div>
                  <div className="text-muted small mt-1">
                    Matching with verified cooperative tradesmen in your immediate sector.
                  </div>
                </div>
              )}
            </div>

            <div className="card-footer bg-light border-top small text-muted d-flex justify-content-between">
              <span>Gross Booking Amount:</span>
              <span className="fw-bold text-dark">₹{Number(booking.grossAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LiveBookingTracker;
