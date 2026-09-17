import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, CheckIcon, RefreshCwIcon } from '../../components/common/Icons';
import { offlineQueue, QueuedOfflineAction } from '../../services/offlineQueue';

interface ActiveJobViewProps {
  job: any;
  onJobUpdated: () => void;
  onClose: () => void;
}

export const ActiveJobView: React.FC<ActiveJobViewProps> = ({
  job,
  onJobUpdated,
  onClose,
}) => {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [settlementResult, setSettlementResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const [queuedCount, setQueuedCount] = useState<number>(0);

  useEffect(() => {
    const unsub = offlineQueue.subscribe((queue: QueuedOfflineAction[]) => {
      setQueuedCount(queue.filter((q) => q.bookingId === job.id).length);
    });
    return unsub;
  }, [job.id]);

  const handleStartJob = async () => {
    const token = localStorage.getItem('token');
    if (!offlineQueue.isOnline()) {
      offlineQueue.enqueue({
        type: 'START_JOB',
        bookingId: job.id,
        payload: {},
        token,
      });
      setOfflineNotice('Job start update queued locally (Offline Mode). Will sync once cell signal is restored.');
      onJobUpdated();
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${job.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      });
      if (res.ok) {
        onJobUpdated();
      }
    } catch (err) {
      console.warn('Network error starting job, buffering in offline queue:', err);
      offlineQueue.enqueue({
        type: 'START_JOB',
        bookingId: job.id,
        payload: {},
        token,
      });
      setOfflineNotice('Signal lost in basement. Job start update buffered in offline queue.');
      onJobUpdated();
    }
  };

  const handleCompleteWithPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('Please enter a valid 4-digit PIN');
      return;
    }

    setSubmitting(true);
    setError(null);
    const token = localStorage.getItem('token');

    if (!offlineQueue.isOnline()) {
      offlineQueue.enqueue({
        type: 'COMPLETE_WITH_PIN',
        bookingId: job.id,
        payload: { completionOtp: pin },
        token,
      });
      setOfflineNotice('Completion PIN buffered in offline queue! Tripartite escrow settlement will process automatically upon signal recovery.');
      setIsPinModalOpen(false);
      setSubmitting(false);
      onJobUpdated();
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${job.id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ completionOtp: pin }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete job');
      }

      setSettlementResult(data);
      onJobUpdated();
    } catch (err: any) {
      if (err.message?.includes('fetch') || !navigator.onLine) {
        offlineQueue.enqueue({
          type: 'COMPLETE_WITH_PIN',
          bookingId: job.id,
          payload: { completionOtp: pin },
          token,
        });
        setOfflineNotice('Signal interrupted. Completion PIN buffered safely in offline queue.');
        setIsPinModalOpen(false);
        onJobUpdated();
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSync = async () => {
    const res = await offlineQueue.flush();
    if (res.syncedCount > 0) {
      setOfflineNotice(`Synchronized ${res.syncedCount} queued action(s) with central server!`);
      onJobUpdated();
    }
  };

  return (
    <div className="card shadow-sm border mb-4 bg-white">
      <div className="card-header bg-light border-bottom d-flex justify-content-between align-items-center py-3">
        <div>
          <span className="badge bg-primary text-uppercase me-2">{job.status}</span>
          <span className="fw-bold text-dark">Job Dispatch #{job.id.slice(0, 8)}</span>
        </div>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
          Back to Dashboard
        </button>
      </div>

      <div className="card-body p-4">
        {/* Offline Action Queue Banner */}
        {offlineNotice && (
          <div className="alert alert-info border d-flex justify-content-between align-items-center mb-4 p-3 rounded">
            <div className="small">
              <RefreshCwIcon size={14} className="me-2 text-primary" />
              <strong>Offline Resilience:</strong> {offlineNotice}
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={handleManualSync}
            >
              Sync Now
            </button>
          </div>
        )}

        {queuedCount > 0 && !offlineNotice && (
          <div className="alert alert-warning border d-flex justify-content-between align-items-center mb-4 p-3 rounded">
            <div className="small">
              <RefreshCwIcon size={14} className="me-2 text-warning" />
              <strong>{queuedCount} update(s)</strong> buffered offline for this job. Will sync automatically once online.
            </div>
            <button
              type="button"
              className="btn btn-sm btn-warning"
              onClick={handleManualSync}
            >
              Flush Queue
            </button>
          </div>
        )}

        {/* Customer & Location Overview */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-6">
            <h5 className="h6 fw-bold text-dark mb-3">Consumer &amp; Location Details</h5>
            <div className="p-3 bg-light rounded border small">
              <div className="mb-2">
                <span className="text-muted">Customer Name:</span>{' '}
                <strong className="text-dark">{job.consumer?.name || 'Citizen Consumer'}</strong>
              </div>
              <div className="mb-2">
                <span className="text-muted">Contact Phone:</span>{' '}
                <strong className="text-dark">{job.consumer?.phone || '+91 98765 43210'}</strong>
              </div>
              <div className="mb-2">
                <span className="text-muted">Service Location:</span>{' '}
                <span className="text-dark">{job.address || 'Hauz Khas Sector 3, South Delhi'}</span>
              </div>
              <div>
                <span className="text-muted">Spatial Index:</span>{' '}
                <code className="text-dark">Res-8: 8861969527fffff</code>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <h5 className="h6 fw-bold text-dark mb-3">Job Scope &amp; Statutory Tariff</h5>
            <div className="p-3 bg-light rounded border small">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Gross Amount:</span>
                <span className="h6 fw-bold text-dark mb-0">₹{Number(job.grossAmount).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 text-success">
                <span>Worker Take-Home (88%):</span>
                <strong className="fw-bold">₹{(Number(job.grossAmount) * 0.88).toFixed(2)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2 text-muted">
                <span>Welfare Fund Contribution (8%):</span>
                <span>₹{(Number(job.grossAmount) * 0.08).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between text-muted">
                <span>Platform Maintenance Fee (4%):</span>
                <span>₹{(Number(job.grossAmount) * 0.04).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Successful Settlement Notification */}
        {settlementResult && (
          <div className="alert alert-success border-success p-3 mb-4 rounded shadow-sm">
            <div className="d-flex align-items-center gap-2 mb-2">
              <CheckIcon size={18} color="#137333" />
              <strong className="text-dark">Escrow Released! Wallet Credited:</strong>
              <span className="h6 mb-0 text-success fw-bold">
                ₹{settlementResult.split?.workerPayout?.toFixed(2)}
              </span>
            </div>
            <p className="small text-muted mb-0">
              Deterministic tripartite ledger entry #{settlementResult.ledgerEntry?.id.slice(0, 8)} successfully settled under MSCS Act 2023 statutory guidelines.
            </p>
          </div>
        )}

        {/* Job Actions */}
        {job.status === 'ACCEPTED' && (
          <div className="d-flex gap-3">
            <button type="button" className="btn btn-primary" onClick={handleStartJob}>
              Start Job (Mark In-Progress)
            </button>
          </div>
        )}

        {job.status === 'IN_PROGRESS' && !settlementResult && (
          <div className="p-3 border rounded bg-light d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div className="fw-bold text-dark small">Job Underway</div>
              <div className="text-muted small">
                Collect the 4-digit verification PIN from the customer upon work completion.
              </div>
            </div>
            <button
              type="button"
              className="btn btn-success"
              onClick={() => setIsPinModalOpen(true)}
            >
              Enter Customer PIN &amp; Settle
            </button>
          </div>
        )}

        {job.status === 'COMPLETED' && !settlementResult && (
          <div className="badge bg-success-subtle text-success border border-success-subtle p-2">
            This job has been completed and payment has been credited to your cooperative account.
          </div>
        )}
      </div>

      {/* Completion PIN Modal */}
      {isPinModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <ShieldCheckIcon size={20} color="#0b417b" />
                  <h6 className="modal-title fw-bold text-dark mb-0">
                    Verify Customer 4-Digit Completion PIN
                  </h6>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsPinModalOpen(false)}
                />
              </div>

              <form onSubmit={handleCompleteWithPin}>
                <div className="modal-body p-4 text-center">
                  {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

                  <p className="text-muted small mb-3">
                    Please ask the customer for their 4-digit completion PIN to release the escrow.
                  </p>

                  <input
                    type="text"
                    className="form-control form-control-lg text-center font-monospace mb-3"
                    style={{ letterSpacing: '0.5em', fontSize: '1.8rem' }}
                    maxLength={4}
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                    required
                  />

                  <div className="text-muted small">
                    Immediate Tripartite Split: ₹{(Number(job.grossAmount) * 0.88).toFixed(2)} net payout.
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setIsPinModalOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-success" disabled={submitting}>
                    {submitting ? 'Verifying PIN...' : 'Verify & Release Escrow'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ActiveJobView;
