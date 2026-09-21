import React, { useEffect, useState } from 'react';
import { CardGridSkeleton } from '../../components/common/Skeleton';

export const GovernancePortal: React.FC = () => {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quorumPercent, setQuorumPercent] = useState(50);
  const [expiresAtDays, setExpiresAtDays] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const fetchPolls = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/polls', {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      if (res.ok) {
        const data = await res.json();
        setPolls(data);
      }
    } catch (err) {
      console.error('Failed to load governance polls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          title,
          description,
          quorumPercent,
          expiresAtDays,
        }),
      });

      if (res.ok) {
        setIsDraftModalOpen(false);
        setTitle('');
        setDescription('');
        fetchPolls();
      }
    } catch (err) {
      console.error('Failed to draft poll:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <CardGridSkeleton count={3} />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h5 className="h6 fw-bold text-dark mb-1">
            Democratic Governance &amp; Statutory Resolutions
          </h5>
          <span className="text-muted small">
            Empowering Class-A voting members under MSCS Act 2023 Sec 63 with transparent quorum tracking.
          </span>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => setIsDraftModalOpen(true)}
        >
          Draft New Statutory Resolution
        </button>
      </div>

      {/* Active Polls List */}
      <div className="row g-4 mb-4">
        {polls.map((poll) => (
          <div key={poll.id} className="col-12 col-lg-6">
            <div className="card shadow-sm border h-100 bg-white">
              <div className="card-header bg-light border-bottom d-flex justify-content-between align-items-center py-3">
                <span className="badge bg-primary text-uppercase small">{poll.status}</span>
                <span className="text-muted small">
                  Expires: {new Date(poll.expiresAt).toLocaleDateString()}
                </span>
              </div>

              <div className="card-body p-4">
                <h3 className="h6 fw-bold text-dark mb-2">{poll.title}</h3>
                <p className="small text-muted mb-3">{poll.description}</p>

                {/* Quorum Progression Bar */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center small mb-1">
                    <span className="fw-semibold text-dark">
                      Class-A Quorum Progression: {poll.currentQuorumPercent}%
                    </span>
                    <span className="text-muted">
                      Threshold: {poll.quorumThresholdPercent}% required
                    </span>
                  </div>

                  <div className="progress" style={{ height: '10px' }}>
                    <div
                      className={`progress-bar ${
                        poll.isQuorumMet ? 'bg-success' : 'bg-warning'
                      }`}
                      role="progressbar"
                      style={{ width: `${poll.currentQuorumPercent}%` }}
                      aria-valuenow={poll.currentQuorumPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>

                  <div className="d-flex justify-content-between mt-1 text-muted" style={{ fontSize: '0.8rem' }}>
                    <span>
                      {poll.votesCast} of {poll.totalEligibleVoters} voting members participated
                    </span>
                    <span className={poll.isQuorumMet ? 'text-success fw-bold' : 'text-warning-emphasis'}>
                      {poll.isQuorumMet ? 'Quorum Met' : 'Awaiting Quorum'}
                    </span>
                  </div>
                </div>

                {/* Vote Breakdown */}
                <div className="p-2 bg-light rounded border d-flex justify-content-around text-center small">
                  <div>
                    <span className="text-success fw-bold">{poll.votesYes} Votes</span>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>In Favor (Yes)</div>
                  </div>
                  <div className="border-end" />
                  <div>
                    <span className="text-danger fw-bold">{poll.votesNo} Votes</span>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>Against (No)</div>
                  </div>
                </div>
              </div>

              <div className="card-footer bg-light border-top small text-muted">
                Cooperative: <strong>{poll.cooperativeName}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Draft New Policy Poll Modal */}
      {isDraftModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light border-bottom">
                <h6 className="modal-title fw-bold text-dark mb-0">
                  Draft New Statutory Resolution Poll
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsDraftModalOpen(false)}
                />
              </div>

              <form onSubmit={handleCreatePoll}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Resolution Title</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Allocation of Statutory Reserves for Equipment Subsidies"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Full Resolution Text</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={3}
                      placeholder="Specify the policy mandate, relevant MSCS Act section, and target voting members."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark">
                        Quorum Threshold (%)
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        min={10}
                        max={100}
                        value={quorumPercent}
                        onChange={(e) => setQuorumPercent(Number(e.target.value))}
                        required
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark">
                        Voting Window (Days)
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        min={1}
                        max={90}
                        value={expiresAtDays}
                        onChange={(e) => setExpiresAtDays(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setIsDraftModalOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary" disabled={submitting}>
                    {submitting ? 'Publishing...' : 'Publish Resolution'}
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
export default GovernancePortal;
