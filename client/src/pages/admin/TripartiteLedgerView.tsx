import React, { useEffect, useState } from 'react';
import { LedgerSkeleton } from '../../components/common/Skeleton';

export const TripartiteLedgerView: React.FC = () => {
  const [ledgerData, setLedgerData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLedger = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/ledger', {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      if (res.ok) {
        const data = await res.json();
        setLedgerData(data);
      }
    } catch (err) {
      console.error('Failed to load ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleExportCSV = () => {
    if (!ledgerData?.entries || ledgerData.entries.length === 0) return;

    const headers = ['Entry ID', 'Booking ID', 'Settled Date', 'Customer', 'Provider', 'Gross Amount', 'Worker Payout (88%)', 'Welfare Fund (8%)', 'Platform Fee (4%)', 'Status'];
    const rows = ledgerData.entries.map((e: any) => [
      e.id,
      e.bookingId,
      e.settledAt ? new Date(e.settledAt).toISOString() : 'Pending',
      `"${e.booking?.consumer?.name || 'Consumer'}"`,
      `"${e.booking?.provider?.user?.name || 'Provider'}"`,
      e.totalGross,
      e.workerPayout,
      e.welfareFundShare,
      e.platformShare,
      e.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tripartite_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <LedgerSkeleton />;
  }

  const metrics = ledgerData?.metrics || {
    totalGrossGMV: 0,
    totalWorkerPayouts: 0,
    welfareFundBalance: 0,
    statutoryReserveBalance: 0,
  };

  const entries = ledgerData?.entries || [];

  return (
    <div>
      {/* Metric Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="p-3 bg-white border rounded shadow-sm">
            <div className="small text-muted mb-1">Gross Booking Volume (GMV)</div>
            <div className="h4 fw-bold text-dark mb-0">₹{metrics.totalGrossGMV.toFixed(2)}</div>
            <div className="text-muted" style={{ fontSize: '0.72rem' }}>Total Processed Bookings</div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="p-3 bg-white border rounded shadow-sm">
            <div className="small text-muted mb-1">Cumulative Worker Payouts</div>
            <div className="h4 fw-bold text-success mb-0">₹{metrics.totalWorkerPayouts.toFixed(2)}</div>
            <div className="text-muted" style={{ fontSize: '0.72rem' }}>Direct Disbursed Payouts</div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="p-3 bg-white border rounded shadow-sm">
            <div className="small text-muted mb-1">Society Welfare Fund Balance</div>
            <div className="h4 fw-bold text-primary mb-0">₹{metrics.welfareFundBalance.toFixed(2)}</div>
            <div className="text-muted" style={{ fontSize: '0.72rem' }}>Deductible Health &amp; Pension</div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="p-3 bg-white border rounded shadow-sm">
            <div className="small text-muted mb-1">Statutory Reserve Fund</div>
            <div className="h4 fw-bold text-dark mb-0">₹{metrics.statutoryReserveBalance.toFixed(2)}</div>
            <div className="text-success" style={{ fontSize: '0.72rem' }}>25% Compliant (MSCS Act 2023)</div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card shadow-sm border bg-white mb-4">
        <div className="card-header bg-light border-bottom d-flex justify-content-between align-items-center py-3">
          <div>
            <h5 className="h6 fw-bold text-dark mb-0">Tripartite Zero-Leakage Escrow Ledger</h5>
            <span className="text-muted small">
              Immutable split audit entries satisfying: W(worker) + F(welfare) + P(platform) ≡ Gross Amount
            </span>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={handleExportCSV}
            disabled={entries.length === 0}
          >
            Export Statutory CSV
          </button>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped mb-0 small">
              <thead className="table-light">
                <tr>
                  <th scope="col">Entry ID</th>
                  <th scope="col">Booking</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Provider</th>
                  <th scope="col" className="text-end">Gross (₹)</th>
                  <th scope="col" className="text-end text-success">Worker Share (88%)</th>
                  <th scope="col" className="text-end text-primary">Welfare Fund (8%)</th>
                  <th scope="col" className="text-end text-muted">Platform (4%)</th>
                  <th scope="col" className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.length > 0 ? (
                  entries.map((e: any) => (
                    <tr key={e.id}>
                      <td className="font-monospace fw-semibold">#{e.id.slice(0, 8)}</td>
                      <td className="font-monospace">#{e.bookingId.slice(0, 8)}</td>
                      <td>{e.booking?.consumer?.name || 'Citizen Consumer'}</td>
                      <td>{e.booking?.provider?.user?.name || 'Cooperative Provider'}</td>
                      <td className="text-end fw-bold">₹{Number(e.totalGross).toFixed(2)}</td>
                      <td className="text-end text-success fw-bold">₹{Number(e.workerPayout).toFixed(2)}</td>
                      <td className="text-end text-primary">₹{Number(e.welfareFundShare).toFixed(2)}</td>
                      <td className="text-end text-muted">₹{Number(e.platformShare).toFixed(2)}</td>
                      <td className="text-center">
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-muted">
                      No escrow ledger records found.
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
export default TripartiteLedgerView;
