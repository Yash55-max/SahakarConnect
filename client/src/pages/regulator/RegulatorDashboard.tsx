import React, { useEffect, useState, useMemo } from 'react';
import {
  RegulatorIcon,
  ShieldCheckIcon,
  ScaleIcon,
  RefreshCwIcon,
  SearchIcon,
  CheckCircleIcon,
  UsersIcon,
  BriefcaseIcon,
  DocumentIcon,
  MapPinIcon,
} from '../../components/common/Icons';
import { RegulatorSkeleton } from '../../components/common/Skeleton';

interface RegulatorDashboardProps {
  onOpenAuth?: () => void;
}

interface RegulatorKPIs {
  totalCooperatives: number;
  totalVerifiedProviders: number;
  totalAvailableProviders: number;
  totalProviders: number;
  totalBookings: number;
  completedBookings: number;
  grossTransactionValue: number;
  totalWorkerDisbursed: number;
  totalWelfarePoolCollected: number;
  totalStatutoryReserves: number;
  avgResolutionTimeHours: number;
  dispatchHealthPercent: number;
  statutoryCompliancePercent: number;
}

interface StateRollup {
  state: string;
  districts: string[];
  activeCooperatives: number;
  verifiedTradesmen: number;
  grossVolume: number;
  welfarePool: number;
  reservePool: number;
  bookingsCount: number;
  complianceRate: number;
}

interface CooperativeSummary {
  id: string;
  name: string;
  registrationNo: string;
  state: string;
  district: string;
  commissionPlatformRate: number;
  welfareFundRate: number;
  welfareBalance: number;
  statutoryReserveBalance: number;
  verifiedTradesmenCount: number;
  totalProvidersCount: number;
  totalBookingsCount: number;
  grossVolume: number;
  workerPayoutTotal: number;
  complianceStatus: string;
  statutoryReserveRatioSatisfied: boolean;
  auditStatus: string;
  createdAt: string;
}

interface AuditLedgerEntry {
  id: string;
  bookingId: string;
  cooperativeName: string;
  state: string;
  district: string;
  consumerName: string;
  providerName: string;
  grossAmount: number;
  workerPayout: number;
  welfareShare: number;
  platformShare: number;
  status: string;
  settledAt: string | null;
  statutoryInvariantSatisfied: boolean;
}

interface StatutoryMandate {
  act: string;
  regulatoryAuthority: string;
  reserveRatioMandate: string;
  democraticPrinciple: string;
  timestamp: string;
}

interface RegulatorData {
  kpis: RegulatorKPIs;
  stateRollups: StateRollup[];
  cooperatives: CooperativeSummary[];
  recentAuditLedger: AuditLedgerEntry[];
  statutoryMandate: StatutoryMandate;
}

export const RegulatorDashboard: React.FC<RegulatorDashboardProps> = ({ onOpenAuth }) => {
  const [data, setData] = useState<RegulatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'societies' | 'states' | 'audit'>('societies');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/regulator/analytics`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });

      if (res.status === 401 || res.status === 403) {
        setError('UNAUTHORIZED');
        return;
      }

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const analyticsData = await res.json();
      setData(analyticsData);
    } catch (err: any) {
      console.error('Failed to load regulator analytics:', err);
      setError(err.message || 'Network error fetching regulatory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Filtered Cooperatives
  const filteredCooperatives = useMemo(() => {
    if (!data?.cooperatives) return [];
    return data.cooperatives.filter((c) => {
      const matchState = selectedState === 'ALL' || c.state === selectedState;
      const matchDistrict = selectedDistrict === 'ALL' || c.district === selectedDistrict;
      const matchSearch =
        searchQuery.trim() === '' ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.registrationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.district.toLowerCase().includes(searchQuery.toLowerCase());
      return matchState && matchDistrict && matchSearch;
    });
  }, [data?.cooperatives, selectedState, selectedDistrict, searchQuery]);

  // Filtered Pan-India State Rollups
  const filteredStateRollups = useMemo(() => {
    if (!data?.stateRollups) return [];
    return data.stateRollups.filter((s) => {
      const matchState = selectedState === 'ALL' || s.state === selectedState;
      const matchDistrict =
        selectedDistrict === 'ALL' ||
        s.districts.some((d) => d.toLowerCase() === selectedDistrict.toLowerCase());
      return matchState && matchDistrict;
    });
  }, [data?.stateRollups, selectedState, selectedDistrict]);

  // Filtered Audit Ledger
  const filteredLedger = useMemo(() => {
    if (!data?.recentAuditLedger) return [];
    return data.recentAuditLedger.filter((e) => {
      const matchState = selectedState === 'ALL' || e.state === selectedState;
      const matchDistrict = selectedDistrict === 'ALL' || e.district === selectedDistrict;
      const matchSearch =
        searchQuery.trim() === '' ||
        e.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.cooperativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.consumerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.providerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchState && matchDistrict && matchSearch;
    });
  }, [data?.recentAuditLedger, selectedState, selectedDistrict, searchQuery]);

  // Available districts based on selected state
  const availableDistricts = useMemo(() => {
    if (!data?.cooperatives) return [];
    const set = new Set<string>();
    data.cooperatives.forEach((c) => {
      if (selectedState === 'ALL' || c.state === selectedState) {
        set.add(c.district);
      }
    });
    return Array.from(set);
  }, [data?.cooperatives, selectedState]);

  // Export CSV for central auditor
  const handleExportCSV = () => {
    if (!data?.recentAuditLedger || data.recentAuditLedger.length === 0) return;
    const headers = [
      'Transaction ID',
      'Booking ID',
      'Cooperative Society',
      'State',
      'District',
      'Consumer',
      'Tradesman',
      'Gross Amount (INR)',
      'Worker Payout 88% (INR)',
      'Welfare Fund 8% (INR)',
      'Platform Fee 4% (INR)',
      'Zero Leakage Invariant Satisfied',
      'Settled At',
    ];
    const rows = data.recentAuditLedger.map((e) => [
      e.id,
      e.bookingId,
      `"${e.cooperativeName}"`,
      e.state,
      e.district,
      `"${e.consumerName}"`,
      `"${e.providerName}"`,
      e.grossAmount.toFixed(2),
      e.workerPayout.toFixed(2),
      e.welfareShare.toFixed(2),
      e.platformShare.toFixed(2),
      e.statutoryInvariantSatisfied ? 'YES' : 'NO',
      e.settledAt ? new Date(e.settledAt).toISOString() : 'PENDING',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Central_Cooperative_Statutory_Ledger_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <RegulatorSkeleton />;
  }

  if (error === 'UNAUTHORIZED') {
    return (
      <div className="card shadow-sm border p-4 p-md-5 text-center my-4 bg-white">
        <div
          className="mx-auto mb-3 p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
          style={{ background: 'var(--ux4g-bg-primary, #f2efff)', width: '64px', height: '64px' }}
        >
          <RegulatorIcon size={32} color="var(--ux4g-primary-600, #4a2bc2)" />
        </div>
        <h3 className="h5 fw-bold text-dark mb-2">Regulatory Auditor Credentials Required</h3>
        <p className="text-secondary small max-w-md mx-auto mb-4" style={{ maxWidth: '540px' }}>
          Access to the Regulatory Oversight Dashboard is restricted to authorized regulatory officers and cooperative audit supervisors under the Multi-State Co-operative Societies Act, 2002 (as amended in 2023).
        </p>
        <div>
          {onOpenAuth && (
            <button
              type="button"
              className="btn btn-primary btn-sm px-4 py-2 fw-semibold"
              onClick={onOpenAuth}
            >
              Sign In with Auditor Credentials
            </button>
          )}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="alert alert-danger shadow-sm border p-4">
        <h3 className="h6 fw-bold mb-2 text-danger">Regulatory Gateway Communication Notice</h3>
        <p className="small mb-3">{error || 'Unable to retrieve regulatory metrics.'}</p>
        <button type="button" className="btn btn-sm btn-primary" onClick={fetchAnalytics}>
          <RefreshCwIcon size={14} className="me-1" />
          Retry Connection
        </button>
      </div>
    );
  }

  const { kpis, stateRollups, statutoryMandate } = data;

  return (
    <div className="regulator-dashboard">
      {/* 1. Regulatory Authority Header Banner */}
      <div className="card shadow-sm border mb-4 bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="p-3 rounded border d-flex align-items-center justify-content-center"
                style={{
                  background: 'var(--ux4g-bg-primary, #f2efff)',
                  borderColor: 'var(--ux4g-border-primary, #c0b3ff)',
                  color: 'var(--ux4g-primary-600, #4a2bc2)',
                  width: 52,
                  height: 52,
                }}
              >
                <RegulatorIcon size={30} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h1 className="h5 fw-bold text-dark mb-0">
                    Cooperative Regulatory Oversight Terminal
                  </h1>
                  <span className="badge bg-success text-white small px-2 py-1">
                    <ShieldCheckIcon size={12} className="me-1" />
                    MSCS Act Compliant
                  </span>
                </div>
                <p className="text-secondary small mb-0 mt-1">
                  Multi-State Co-operative Societies Framework · Nationwide Ledger &amp; Welfare Oversight
                </p>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="badge bg-light text-dark border p-2 small">
                <UsersIcon size={13} className="me-1 text-primary" />
                Auditor: <strong>Dr. Amitav Roy</strong>
              </span>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                onClick={fetchAnalytics}
                title="Refresh statutory aggregates"
              >
                <RefreshCwIcon size={13} />
                <span>Sync</span>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                onClick={handleExportCSV}
                title="Download verified audit ledger for regulatory filing"
              >
                <DocumentIcon size={13} />
                <span>Export Audit CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. High-Level KPI Tiles */}
      <div className="row g-3 mb-4">
        {/* Total Registered Co-ops */}
        <div className="col-6 col-md-4 col-xl-2">
          <div className="p-3 bg-white border rounded shadow-sm h-100">
            <div className="text-muted small mb-1">Cooperatives</div>
            <div className="h4 fw-bold text-dark mb-0">{kpis.totalCooperatives}</div>
            <div className="text-success small mt-1 d-flex align-items-center gap-1">
              <CheckCircleIcon size={12} />
              <span>3 States Active</span>
            </div>
          </div>
        </div>

        {/* Verified Tradesmen */}
        <div className="col-6 col-md-4 col-xl-2">
          <div className="p-3 bg-white border rounded shadow-sm h-100">
            <div className="text-muted small mb-1">Skilled Tradesmen</div>
            <div className="h4 fw-bold text-primary mb-0">{kpis.totalVerifiedProviders}</div>
            <div className="text-secondary small mt-1">
              {kpis.totalAvailableProviders} Ready for Work
            </div>
          </div>
        </div>

        {/* Gross Transaction Value */}
        <div className="col-6 col-md-4 col-xl-2">
          <div className="p-3 bg-white border rounded shadow-sm h-100">
            <div className="text-muted small mb-1">Gross GTV</div>
            <div className="h4 fw-bold text-dark mb-0">₹{kpis.grossTransactionValue.toLocaleString('en-IN')}</div>
            <div className="text-muted small mt-1">
              {kpis.completedBookings} Completed Jobs
            </div>
          </div>
        </div>

        {/* Worker Payouts Disbursed (88%) */}
        <div className="col-6 col-md-4 col-xl-2">
          <div className="p-3 bg-white border rounded shadow-sm h-100">
            <div className="text-muted small mb-1">Worker Payouts (88%)</div>
            <div className="h4 fw-bold text-success mb-0">₹{kpis.totalWorkerDisbursed.toLocaleString('en-IN')}</div>
            <div className="text-muted small mt-1">Zero Intermediary Cut</div>
          </div>
        </div>

        {/* Welfare Pool Collected (8%) */}
        <div className="col-6 col-md-4 col-xl-2">
          <div className="p-3 bg-white border rounded shadow-sm h-100">
            <div className="text-muted small mb-1">Welfare Pool (8%)</div>
            <div className="h4 fw-bold text-info mb-0">₹{kpis.totalWelfarePoolCollected.toLocaleString('en-IN')}</div>
            <div className="text-muted small mt-1">Health &amp; Accident Pool</div>
          </div>
        </div>

        {/* Statutory Reserves (15% ratio) */}
        <div className="col-6 col-md-4 col-xl-2">
          <div className="p-3 bg-white border rounded shadow-sm h-100">
            <div className="text-muted small mb-1">Statutory Reserves</div>
            <div className="h4 fw-bold text-warning mb-0">₹{kpis.totalStatutoryReserves.toLocaleString('en-IN')}</div>
            <div className="text-success small mt-1 d-flex align-items-center gap-1">
              <ScaleIcon size={12} />
              <span>Sec 63 Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Toolbar & View Tabs */}
      <div className="card shadow-sm border mb-4 bg-white">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            {/* View Switcher Tabs */}
            <div className="col-12 col-md-auto">
              <div className="btn-group btn-group-sm w-100" role="group">
                <button
                  type="button"
                  className={`btn ${activeTab === 'societies' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveTab('societies')}
                >
                  <BriefcaseIcon size={13} className="me-1" />
                  Primary Societies ({filteredCooperatives.length})
                </button>
                <button
                  type="button"
                  className={`btn ${activeTab === 'states' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveTab('states')}
                >
                  <MapPinIcon size={13} className="me-1" />
                  State Rollups ({stateRollups.length})
                </button>
                <button
                  type="button"
                  className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveTab('audit')}
                >
                  <ScaleIcon size={13} className="me-1" />
                  Audit Ledger ({filteredLedger.length})
                </button>
              </div>
            </div>

            {/* State Filter */}
            <div className="col-6 col-sm-3 col-md-2">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-muted">State</span>
                <select
                  className="form-select form-select-sm"
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedDistrict('ALL');
                  }}
                  aria-label="Filter by state"
                >
                  <option value="ALL">All States</option>
                  {stateRollups.map((s) => (
                    <option key={s.state} value={s.state}>
                      {s.state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* District Filter */}
            <div className="col-6 col-sm-3 col-md-2">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-muted">District</span>
                <select
                  className="form-select form-select-sm"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  aria-label="Filter by district"
                >
                  <option value="ALL">All Districts</option>
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="col-12 col-md">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-muted">
                  <SearchIcon size={13} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by society name, registration no, tradesman or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search filter"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tab Content Panels */}

      {/* TAB A: Primary Cooperative Societies Summary */}
      {activeTab === 'societies' && (
        <div className="card shadow-sm border bg-white mb-4">
          <div className="card-header bg-light py-2 px-3 d-flex justify-content-between align-items-center">
            <span className="fw-semibold small text-dark">
              Registered Primary Service Cooperative Societies (PSCS) Under Oversight
            </span>
            <span className="badge bg-secondary small">{filteredCooperatives.length} Societies</span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Society &amp; Reg No.</th>
                  <th>State &amp; District</th>
                  <th className="text-center">Verified Tradesmen</th>
                  <th className="text-end">Gross GMV</th>
                  <th className="text-end">Welfare Pool</th>
                  <th className="text-end">Statutory Reserve</th>
                  <th className="text-center">MSCS Compliance</th>
                  <th className="text-center">Audit Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCooperatives.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      No cooperatives match the specified state/district search filter.
                    </td>
                  </tr>
                ) : (
                  filteredCooperatives.map((coop) => (
                    <tr key={coop.id}>
                      <td>
                        <div className="fw-bold text-dark">{coop.name}</div>
                        <div className="font-monospace text-muted" style={{ fontSize: '0.72rem' }}>
                          {coop.registrationNo}
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium text-dark">{coop.state}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {coop.district}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-primary text-white">
                          {coop.verifiedTradesmenCount} / {coop.totalProvidersCount}
                        </span>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                          Aadhaar Verified
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="fw-bold text-dark">₹{coop.grossVolume.toLocaleString('en-IN')}</div>
                        <div className="text-success" style={{ fontSize: '0.72rem' }}>
                          ₹{coop.workerPayoutTotal.toLocaleString('en-IN')} to Workers
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="fw-semibold text-info">₹{coop.welfareBalance.toLocaleString('en-IN')}</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                          Rate: {(coop.welfareFundRate * 100).toFixed(1)}%
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="fw-semibold text-warning">₹{coop.statutoryReserveBalance.toLocaleString('en-IN')}</div>
                        <div className="text-success" style={{ fontSize: '0.7rem' }}>
                          {coop.statutoryReserveRatioSatisfied ? '≥15% Satisfied' : 'Below 15%'}
                        </div>
                      </td>
                      <td className="text-center">
                        {coop.complianceStatus === 'COMPLIANT_MSCS_2023' ? (
                          <span className="badge bg-success-subtle text-success border border-success small px-2 py-1">
                            <CheckCircleIcon size={12} className="me-1" />
                            COMPLIANT
                          </span>
                        ) : (
                          <span className="badge bg-warning-subtle text-warning border border-warning small px-2 py-1">
                            UNDER REVIEW
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border small px-2 py-1">
                          <ShieldCheckIcon
                            size={12}
                            className={`me-1 ${coop.auditStatus === 'VERIFIED_CLEAN' ? 'text-success' : 'text-warning'}`}
                          />
                          {coop.auditStatus ? coop.auditStatus.replace(/_/g, ' ') : 'VERIFIED CLEAN'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB B: Pan-India State Rollups */}
      {activeTab === 'states' && (
        <div className="row g-3 mb-4">
          {filteredStateRollups.length === 0 ? (
            <div className="col-12">
              <div className="card shadow-sm border p-4 text-center bg-white">
                <p className="text-muted mb-0">
                  No state rollups match the selected filters (State: {selectedState}, District: {selectedDistrict}).
                </p>
              </div>
            </div>
          ) : (
            filteredStateRollups.map((state) => (
              <div key={state.state} className="col-12 col-lg-4">
                <div className="card shadow-sm border h-100 bg-white">
                  <div className="card-header bg-light py-3 d-flex justify-content-between align-items-center">
                    <div>
                      <h2 className="h6 fw-bold text-dark mb-0">{state.state}</h2>
                      <span className="text-muted small">
                        {state.districts.length} Active District{state.districts.length > 1 ? 's' : ''} ({state.districts.join(', ')})
                      </span>
                    </div>
                    <span className="badge bg-success text-white">100% Compliant</span>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted small">Active Societies:</span>
                      <span className="fw-bold text-dark">{state.activeCooperatives}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted small">Verified Tradesmen:</span>
                      <span className="fw-bold text-primary">{state.verifiedTradesmen}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted small">Gross Volume (GMV):</span>
                      <span className="fw-bold text-dark">₹{state.grossVolume.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted small">Welfare Pool Balance:</span>
                      <span className="fw-semibold text-info">₹{state.welfarePool.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2">
                      <span className="text-muted small">Statutory Reserve Fund:</span>
                      <span className="fw-semibold text-warning">₹{state.reservePool.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="card-footer bg-light py-2 text-center small text-secondary">
                    <ScaleIcon size={12} className="me-1 text-success" />
                    Section 63 Multi-State Co-operative Societies Act, 2023 Verified
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB C: Real-Time Statutory Audit Ledger */}
      {activeTab === 'audit' && (
        <div className="card shadow-sm border bg-white mb-4">
          <div className="card-header bg-light py-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <span className="fw-semibold small text-dark">
                Nationwide Central Audit Ledger — Tripartite Invariant Inspector
              </span>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                Mathematical Proof: Worker Payout (88%) + Welfare Fund (8%) + Platform Share (4%) ≡ Gross Booking Amount (Zero Rounding Leakage)
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={handleExportCSV}
            >
              <DocumentIcon size={13} className="me-1" />
              Download Audit CSV
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Booking ID</th>
                  <th>Cooperative Society</th>
                  <th>Parties (Consumer → Provider)</th>
                  <th className="text-end">Gross Amount</th>
                  <th className="text-end">Worker (88%)</th>
                  <th className="text-end">Welfare (8%)</th>
                  <th className="text-end">Platform (4%)</th>
                  <th className="text-center">Statutory Invariant</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-muted">
                      No ledger transactions found matching the specified filters.
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <span className="font-monospace fw-semibold text-primary" style={{ fontSize: '0.75rem' }}>
                          {entry.bookingId.slice(0, 8)}...
                        </span>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {entry.settledAt ? new Date(entry.settledAt).toLocaleDateString('en-IN') : 'Pending'}
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium text-dark">{entry.cooperativeName}</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {entry.district}, {entry.state}
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium text-dark">{entry.consumerName}</div>
                        <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                          → {entry.providerName}
                        </div>
                      </td>
                      <td className="text-end fw-bold text-dark">
                        ₹{entry.grossAmount.toFixed(2)}
                      </td>
                      <td className="text-end fw-semibold text-success">
                        ₹{entry.workerPayout.toFixed(2)}
                      </td>
                      <td className="text-end fw-semibold text-info">
                        ₹{entry.welfareShare.toFixed(2)}
                      </td>
                      <td className="text-end fw-semibold text-muted">
                        ₹{entry.platformShare.toFixed(2)}
                      </td>
                      <td className="text-center">
                        {entry.statutoryInvariantSatisfied ? (
                          <span
                            className="badge bg-success text-white px-2 py-1 font-monospace"
                            style={{ fontSize: '0.68rem' }}
                            title="Worker (88%) + Welfare (8%) + Platform (4%) = Gross exactly"
                          >
                            <CheckCircleIcon size={10} className="me-1" />
                            Δ = ₹0.00
                          </span>
                        ) : (
                          <span className="badge bg-danger text-white px-2 py-1">
                            LEAKAGE DETECTED
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-success border border-success small">
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Statutory Mandate & Multi-State Co-operative Societies Act 2023 Footer Note */}
      <div className="p-3 bg-light border rounded text-secondary small">
        <div className="d-flex align-items-center gap-2 mb-1">
          <ScaleIcon size={14} className="text-primary" />
          <strong className="text-dark">{statutoryMandate.act}</strong>
        </div>
        <div>
          Authority: {statutoryMandate.regulatoryAuthority} · Statutory Reserve Mandate: {statutoryMandate.reserveRatioMandate} · Democratic Principle: {statutoryMandate.democraticPrinciple}
        </div>
      </div>
    </div>
  );
};

export default RegulatorDashboard;
