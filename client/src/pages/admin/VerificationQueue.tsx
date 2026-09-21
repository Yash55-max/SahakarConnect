import React, { useEffect, useState } from 'react';
import { CardGridSkeleton } from '../../components/common/Skeleton';

export const VerificationQueue: React.FC = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/providers', {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      if (res.ok) {
        const data = await res.json();
        setProviders(data);
      }
    } catch (err) {
      console.error('Failed to load verification queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleVerify = async (providerId: string, approve: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/providers/${providerId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          isAadhaarVerified: approve,
          isPoliceClearVerified: approve,
          membershipClass: approve ? 'CLASS_A_VOTING' : 'NOMINAL',
        }),
      });

      if (res.ok) {
        setActionMessage(
          approve
            ? 'Provider credentials verified. Class A voting membership confirmed under MSCS Act 2023.'
            : 'Provider application flagged for resubmission.'
        );
        fetchProviders();
      }
    } catch (err) {
      console.error('Error updating provider status:', err);
    }
  };

  if (loading) {
    return <CardGridSkeleton count={4} />;
  }

  return (
    <div className="card shadow-sm border bg-white mb-4">
      <div className="card-header bg-light border-bottom d-flex justify-content-between align-items-center py-3">
        <div>
          <h5 className="h6 fw-bold text-dark mb-0">
            Tradesmen Statutory Verification &amp; e-KYC Queue
          </h5>
          <span className="text-muted small">
            Verify DigiLocker credentials, police clearance, and NSQF level prior to Class-A voting enrollment.
          </span>
        </div>
        <span className="badge bg-primary px-3 py-2 small">
          {providers.length} Enrolled Providers
        </span>
      </div>

      {actionMessage && (
        <div className="alert alert-info border-info py-2 px-3 m-3 small mb-0 rounded">
          {actionMessage}
        </div>
      )}

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-striped mb-0 small">
            <thead className="table-light">
              <tr>
                <th scope="col">Provider Name</th>
                <th scope="col">Cooperative</th>
                <th scope="col">Trade Skills</th>
                <th scope="col">NSQF Level</th>
                <th scope="col">Aadhaar e-KYC</th>
                <th scope="col">Police Clear</th>
                <th scope="col">Membership</th>
                <th scope="col" className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="fw-semibold text-dark">{p.user?.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {p.user?.phone} &bull; {p.user?.email}
                    </div>
                  </td>
                  <td>{p.cooperative?.name || 'South Delhi PSCS'}</td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      {p.skills?.slice(0, 2).map((s: string, idx: number) => (
                        <span key={idx} className="badge bg-light text-dark border">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle">
                      Level {p.nsqfLevel}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        p.isAadhaarVerified
                          ? 'bg-success-subtle text-success border border-success-subtle'
                          : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                      }`}
                    >
                      {p.isAadhaarVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        p.isPoliceClearVerified
                          ? 'bg-success-subtle text-success border border-success-subtle'
                          : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                      }`}
                    >
                      {p.isPoliceClearVerified ? 'Clear' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span className="fw-semibold text-dark">{p.membershipClass}</span>
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleVerify(p.id, true)}
                        title="Approve as Class A Voting Member"
                      >
                        Approve Class A
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleVerify(p.id, false)}
                        title="Flag for Resubmission"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default VerificationQueue;
