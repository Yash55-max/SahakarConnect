import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import ActiveJobView from './ActiveJobView';
import ProviderEarnings from './ProviderEarnings';
import { ProviderIcon } from '../../components/common/Icons';
import { PortalSkeleton } from '../../components/common/Skeleton';

interface ProviderDashboardProps {
  onOpenAuth?: () => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ onOpenAuth }) => {
  const [profile, setProfile] = useState<any | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [incomingAlert, setIncomingAlert] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'jobs' | 'earnings'>('jobs');
  const [loading, setLoading] = useState(true);

  const { socket } = useSocket();

  const fetchProfileAndJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const [profRes, jobsRes] = await Promise.all([
        fetch('http://localhost:5000/api/providers/me', {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        }),
        fetch('http://localhost:5000/api/providers/me/jobs', {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        }),
      ]);

      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
        setIsAvailable(profData.isAvailable);
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
      }
    } catch (err) {
      console.error('Error fetching provider data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndJobs();
  }, []);

  // Socket listener for real-time dispatch alerts
  useEffect(() => {
    if (!socket) return;

    const handleNewRequest = (alert: any) => {
      console.log('[ProviderSocket] Incoming job request received:', alert);
      setIncomingAlert(alert);
      fetchProfileAndJobs();
    };

    socket.on('booking:newRequest', handleNewRequest);

    return () => {
      socket.off('booking:newRequest', handleNewRequest);
    };
  }, [socket]);

  const handleToggleAvailability = async () => {
    const nextVal = !isAvailable;
    setIsAvailable(nextVal);
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/providers/me/availability', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ isAvailable: nextVal }),
      });
    } catch (err) {
      console.error('Failed to update duty status:', err);
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/bookings/${jobId}/accept`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (res.ok) {
        const data = await res.json();
        setIncomingAlert(null);
        setSelectedJob(data.booking);
        fetchProfileAndJobs();
      }
    } catch (err) {
      console.error('Error accepting job:', err);
    }
  };

  if (loading) {
    return <PortalSkeleton title="Loading Tradesman Workplace..." />;
  }

  if (!profile) {
    return (
      <div className="card shadow-sm border p-4 p-md-5 text-center my-4 bg-white">
        <div
          className="mx-auto mb-3 p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
          style={{ background: 'var(--ux4g-bg-primary, #f2efff)', width: '64px', height: '64px' }}
        >
          <ProviderIcon size={32} color="var(--ux4g-primary-600, #4a2bc2)" />
        </div>
        <h3 className="h5 fw-bold text-dark mb-2">Skilled Tradesman Sign In Required</h3>
        <p className="text-secondary small max-w-md mx-auto mb-4" style={{ maxWidth: '520px' }}>
          Please sign in with your registered mobile number or register as a skilled artisan member with your local Primary Service Cooperative Society (PSCS) to access duty dispatch alerts, active jobs, and daily earnings.
        </p>
        <div>
          {onOpenAuth && (
            <button
              type="button"
              className="btn btn-primary btn-sm px-4 py-2 fw-semibold"
              onClick={onOpenAuth}
            >
              Sign In or Register as Tradesman
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Status Strip */}
      <div className="card shadow-sm border mb-4 bg-white">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="card-icon-wrapper">
                <ProviderIcon size={22} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h2 className="h5 fw-bold text-dark mb-0">
                    {profile?.user?.name || 'Tradesman Member'}
                  </h2>
                  <span className="badge bg-success-subtle text-success border border-success-subtle small">
                    NSQF Level {profile?.nsqfLevel || 4} Certified
                  </span>
                </div>
                <div className="text-muted small mt-1">
                  {profile?.cooperative?.name || 'Primary Service Cooperative Society'} &bull; Skills: {profile?.skills?.join(', ') || 'General Maintenance'}
                </div>
              </div>
            </div>

            {/* Duty Availability Switch */}
            <div className="d-flex align-items-center gap-3 bg-light p-2 px-3 rounded border">
              <div className="text-end">
                <div className="small fw-bold text-dark">
                  Duty Status: {isAvailable ? 'ACTIVE' : 'OFFLINE'}
                </div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                  {isAvailable ? 'Receiving Spatial Dispatch Alerts' : 'Duty Paused'}
                </div>
              </div>

              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="dutySwitch"
                  checked={isAvailable}
                  onChange={handleToggleAvailability}
                  style={{ width: '2.5rem', height: '1.25rem', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Incoming Job Alert Banner */}
      {incomingAlert && (
        <div className="alert alert-primary border-primary p-3 mb-4 rounded shadow-sm d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-danger text-white pulse">DISPATCH REQUEST</span>
              <strong className="text-dark">New Job Available in Your Local Sector!</strong>
            </div>
            <div className="small text-muted">
              Service: <strong>{incomingAlert.category}</strong> &bull; Gross Tariff: <strong>₹{incomingAlert.grossAmount}</strong> (₹{(incomingAlert.grossAmount * 0.88).toFixed(2)} Take-Home)
            </div>
            <div className="small text-muted">Location: {incomingAlert.address}</div>
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setIncomingAlert(null)}
            >
              Decline
            </button>
            <button
              type="button"
              className="btn btn-sm btn-success"
              onClick={() => handleAcceptJob(incomingAlert.bookingId)}
            >
              Accept Job
            </button>
          </div>
        </div>
      )}

      {/* Co-op Membership Info Card */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="p-3 bg-white border rounded shadow-sm">
            <div className="small text-muted mb-1">Statutory Membership</div>
            <div className="h6 fw-bold text-dark mb-1">Class A Voting Member</div>
            <div className="text-muted small">
              Share Capital: ₹{profile?.shareCapitalAmount || '500.00'} &bull; MSCS Act 2023
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="p-3 bg-white border rounded shadow-sm">
            <div className="small text-muted mb-1">Aadhaar &amp; Police Verification</div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success-subtle text-success border border-success-subtle">
                Aadhaar e-KYC: Verified
              </span>
              <span className="badge bg-success-subtle text-success border border-success-subtle">
                Police Clear: Verified
              </span>
            </div>
            <div className="text-muted small mt-1">DigiLocker Verified Badge</div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="p-3 bg-white border rounded shadow-sm">
            <div className="small text-muted mb-1">Service Zone &amp; Ward</div>
            <div className="h6 fw-bold text-dark mb-1">
              Hauz Khas Cluster
            </div>
            <div className="text-muted small">South Delhi Municipal Sector</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4 border-bottom">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${activeTab === 'jobs' ? 'active fw-bold text-primary' : 'text-secondary'}`}
            onClick={() => {
              setActiveTab('jobs');
              setSelectedJob(null);
            }}
          >
            Assigned &amp; Active Jobs ({jobs.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${activeTab === 'earnings' ? 'active fw-bold text-primary' : 'text-secondary'}`}
            onClick={() => setActiveTab('earnings')}
          >
            Earnings &amp; Tripartite Ledger
          </button>
        </li>
      </ul>

      {/* Active Job Inspector */}
      {selectedJob ? (
        <ActiveJobView
          job={selectedJob}
          onJobUpdated={() => {
            fetchProfileAndJobs();
          }}
          onClose={() => setSelectedJob(null)}
        />
      ) : activeTab === 'jobs' ? (
        <div className="card shadow-sm border bg-white">
          <div className="card-header bg-light border-bottom py-3">
            <h5 className="h6 fw-bold text-dark mb-0">Assigned Job Queue</h5>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover table-striped mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Booking ID</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Gross Tariff</th>
                    <th scope="col" className="text-success">Net Share (88%)</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length > 0 ? (
                    jobs.map((job) => (
                      <tr key={job.id}>
                        <td className="font-monospace fw-semibold">#{job.id.slice(0, 8)}</td>
                        <td>{job.consumer?.name || 'Citizen Customer'}</td>
                        <td className="fw-bold">₹{Number(job.grossAmount).toFixed(2)}</td>
                        <td className="text-success fw-bold">
                          ₹{(Number(job.grossAmount) * 0.88).toFixed(2)}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              job.status === 'COMPLETED'
                                ? 'bg-success'
                                : job.status === 'IN_PROGRESS'
                                ? 'bg-primary'
                                : 'bg-warning text-dark'
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="text-end">
                          {job.status === 'REQUESTED' ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={() => handleAcceptJob(job.id)}
                            >
                              Accept
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setSelectedJob(job)}
                            >
                              Inspect / Settle
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">
                        No active jobs assigned at the moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <ProviderEarnings />
      )}
    </div>
  );
};
export default ProviderDashboard;
