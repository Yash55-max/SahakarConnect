import React, { useState } from 'react';
import VerificationQueue from './VerificationQueue';
import TripartiteLedgerView from './TripartiteLedgerView';
import GovernancePortal from './GovernancePortal';
import { AdminIcon } from '../../components/common/Icons';

interface AdminHubProps {
  onOpenAuth?: () => void;
  currentUser?: any | null;
}

export const AdminHub: React.FC<AdminHubProps> = ({ onOpenAuth, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'verification' | 'governance'>('ledger');

  if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'COOP_ADMIN')) {
    return (
      <div className="card shadow-sm border p-4 p-md-5 text-center my-4 bg-white">
        <div
          className="mx-auto mb-3 p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
          style={{ background: 'var(--ux4g-bg-primary, #f2efff)', width: '64px', height: '64px' }}
        >
          <AdminIcon size={32} color="var(--ux4g-primary-600, #4a2bc2)" />
        </div>
        <h3 className="h5 fw-bold text-dark mb-2">Cooperative Society Administration Access</h3>
        <p className="text-secondary small max-w-md mx-auto mb-4" style={{ maxWidth: '520px' }}>
          This administrative center is designated for elected board members and society administrators of registered Primary Service Cooperative Societies (PSCS). Please sign in with your society credentials.
        </p>
        <div>
          {onOpenAuth && (
            <button
              type="button"
              className="btn btn-primary btn-sm px-4 py-2 fw-semibold"
              onClick={onOpenAuth}
            >
              Sign In with Society Admin Credentials
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Admin Title Card */}
      <div className="card shadow-sm border mb-4 bg-white">
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3">
            <div className="card-icon-wrapper">
              <AdminIcon size={22} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h2 className="h5 fw-bold text-dark mb-0">
                  Primary Service Cooperative Society Admin Portal
                </h2>
                <span className="badge bg-primary text-white small">
                  {currentUser?.name ? `${currentUser.name} (Admin)` : 'Primary Service Cooperative Society'}
                </span>
              </div>
              <p className="text-muted small mb-0 mt-1">
                Multi-tenant society operations: statutory reserve verification, zero-leakage escrow audit, and democratic governance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4 border-bottom">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${activeTab === 'ledger' ? 'active fw-bold text-primary' : 'text-secondary'}`}
            onClick={() => setActiveTab('ledger')}
          >
            Tripartite Ledger &amp; Reserves
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${activeTab === 'verification' ? 'active fw-bold text-primary' : 'text-secondary'}`}
            onClick={() => setActiveTab('verification')}
          >
            Tradesmen e-KYC Queue
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${activeTab === 'governance' ? 'active fw-bold text-primary' : 'text-secondary'}`}
            onClick={() => setActiveTab('governance')}
          >
            Democratic Governance &amp; Quorum
          </button>
        </li>
      </ul>

      {/* Tab Panels */}
      {activeTab === 'ledger' && <TripartiteLedgerView />}
      {activeTab === 'verification' && <VerificationQueue />}
      {activeTab === 'governance' && <GovernancePortal />}
    </div>
  );
};
export default AdminHub;
