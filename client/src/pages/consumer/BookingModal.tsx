import React, { useState } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: string;
    name: string;
    baseRate: number;
    category: string;
  } | null;
  onBookingSuccess: (booking: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  service,
  onBookingSuccess,
}) => {
  const [address, setAddress] = useState('Flat 402, Sector 3, Hauz Khas, New Delhi');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState('Standard electrical/plumbing inspection and maintenance');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !service) return null;

  const grossAmount = service.baseRate;
  const workerPayout = Number((grossAmount * 0.88).toFixed(2));
  const welfareContribution = Number((grossAmount * 0.08).toFixed(2));
  const platformFee = Number((grossAmount * 0.04).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          serviceCategoryId: service.id,
          serviceCategoryName: service.name,
          grossAmount,
          address,
          scheduledDate,
          notes,
          consumerH3Index: '8861969527fffff', // Hauz Khas spatial resolution-8
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      onBookingSuccess(data.booking);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-labelledby="booking-modal-title"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-light border-bottom">
            <h5 className="modal-title h6 fw-bold text-dark" id="booking-modal-title">
              Request Cooperative Service: {service.name}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
              disabled={loading}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && (
                <div className="alert alert-danger py-2 small mb-3" role="alert">
                  {error}
                </div>
              )}

              {/* Service Address */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Service Location / Address</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              {/* Scheduled Time */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Requested Service Time</label>
                <input
                  type="datetime-local"
                  className="form-control form-control-sm"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                />
              </div>

              {/* Work Notes */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Scope of Work / Instructions</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Transparent Split Ledger Preview */}
              <div className="p-3 bg-light border rounded mb-2">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small fw-bold text-dark">Statutory Rate Schedule:</span>
                  <span className="h6 mb-0 fw-bold text-primary">₹{grossAmount.toFixed(2)}</span>
                </div>

                <div className="border-top pt-2 small text-muted">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Estimated Worker Payout (88%):</span>
                    <span className="fw-semibold text-dark">₹{workerPayout.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Statutory Welfare Fund (8%):</span>
                    <span className="fw-semibold text-dark">₹{welfareContribution.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Platform Operations &amp; Audit (4%):</span>
                    <span className="fw-semibold text-dark">₹{platformFee.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-2 text-secondary" style={{ fontSize: '0.72rem' }}>
                  Statutory Guarantee: Escrow is held safely until you provide your 4-digit PIN upon service satisfaction.
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light border-top">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-sm btn-primary" disabled={loading}>
                {loading ? 'Dispatching...' : `Confirm Booking (₹${grossAmount})`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default BookingModal;
