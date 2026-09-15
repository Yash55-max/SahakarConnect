import React, { useState } from 'react';
import VerificationQueue from './VerificationQueue';
import TripartiteLedgerView from './TripartiteLedgerView';
import GovernancePortal from './GovernancePortal';
import { AdminIcon } from '../../components/common/Icons';

export const AdminHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'verification' | 'governance'>('ledger');

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
                  South Delhi Urban Tradesmen PSCS
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
