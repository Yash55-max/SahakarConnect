import React, { useEffect, useState } from 'react';

export const ProviderEarnings: React.FC = () => {
  const [earningsData, setEarningsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/providers/me/earnings', {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (res.ok) {
          const data = await res.json();
          setEarningsData(data);
        }
      } catch (err) {
        console.error('Failed to load earnings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  const summary = earningsData?.summary || {
    totalCompletedJobs: 0,
    totalGrossVolume: 0,
    netTakeHomePayout: 0,
    accumulatedWelfareContribution: 0,
    patronageDividendEligibleBalance: 0,
  };

  const settlements = earningsData?.recentSettlements || [];

  return (
    <div>
      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="p-3 bg-white border rounded shadow-sm">
            <div className="small text-muted mb-1">Total Completed Jobs</div>
            <div className="h4 fw-bold text-dark mb-0">{summary.totalCompletedJobs}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Settled via PIN</div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="p-3 bg-white border rounded shadow-sm">
            <div className="small text-muted mb-1">Net Take-Home Payout (88%)</div>
            <div className="h4 fw-bold text-success mb-0">₹{summary.netTakeHomePayout.toFixed(2)}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Instant Direct Wallet Credit</div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="p-3 bg-white border rounded shadow-sm">
            <div className="small text-muted mb-1">Welfare Fund Balance (8%)</div>
            <div className="h4 fw-bold text-primary mb-0">
              ₹{summary.accumulatedWelfareContribution.toFixed(2)}
            </div>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Health &amp; Accident Coverage</div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="p-3 bg-white border rounded shadow-sm">
            <div className="small text-muted mb-1">Patronage Dividend Eligibility</div>
            <div className="h4 fw-bold text-dark mb-0">
              ₹{summary.patronageDividendEligibleBalance.toFixed(2)}
            </div>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Annual AGM Distribution</div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card shadow-sm border bg-white">
        <div className="card-header bg-light border-bottom py-3">
          <h5 className="h6 fw-bold text-dark mb-0">Recent Completed Settlements &amp; Tripartite Split</h5>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped mb-0 small">
              <thead className="table-light">
                <tr>
                  <th scope="col">Booking ID</th>
                  <th scope="col">Date</th>
                  <th scope="col">Customer</th>
                  <th scope="col" className="text-end">Gross Amount</th>
                  <th scope="col" className="text-end text-success">Worker Share (88%)</th>
                  <th scope="col" className="text-end text-primary">Welfare Fund (8%)</th>
                  <th scope="col" className="text-end text-muted">Platform Fee (4%)</th>
                  <th scope="col" className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {settlements.length > 0 ? (
                  settlements.map((item: any) => (
                    <tr key={item.bookingId}>
                      <td className="font-monospace fw-semibold">#{item.bookingId.slice(0, 8)}</td>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td>{item.consumerName}</td>
                      <td className="text-end fw-bold">₹{item.grossAmount.toFixed(2)}</td>
                      <td className="text-end text-success fw-bold">₹{item.workerPayout.toFixed(2)}</td>
                      <td className="text-end text-primary">₹{item.welfareFundShare.toFixed(2)}</td>
                      <td className="text-end text-muted">₹{item.platformShare.toFixed(2)}</td>
                      <td className="text-center">
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      No completed jobs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProviderEarnings;
