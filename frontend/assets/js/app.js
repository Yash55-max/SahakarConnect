/**
 * SahakarConnect — UX4G 3.1.0 Interactive Application & State Engine
 * Ministry of Cooperation, Government of India (SIH26089)
 * Pure JavaScript & Live REST API Client (Zero React Lock-In)
 */

(function () {
  'use strict';

  // ─── Backend API Client Layer ───
  const API_BASE = window.location.port === '5000' ? '/api' : 'http://localhost:5000/api';
  let isBackendConnected = false;

  async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('sahakar_auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`[SahakarConnect API] ${endpoint} failed:`, err.message);
      throw err;
    }
  }

  // ─── Default Initial State (With Local Persistence & API Sync) ───
  const DEFAULT_STATE = {
    currentRole: 'consumer',
    theme: 'light',
    contrast: 'normal',
    fontSize: 'normal',
    lang: 'en',
    providers: [
      {
        id: 'PRV-101',
        name: 'Rajesh Kumar Verma',
        category: 'Plumbing',
        rating: 4.9,
        reviewsCount: 142,
        coopName: 'Varanasi Central Service Cooperative (PSCS-UP-882)',
        experience: '8 Years Exp',
        rate: 350,
        status: 'VERIFIED',
        available: true,
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
        skills: ['Pipe Fitting', 'Leak Repair', 'Water Tank Cleaning', 'Geyser Installation'],
        aadhaarVerified: true
      },
      {
        id: 'PRV-102',
        name: 'Sunita Arvind Patil',
        category: 'Elder Care',
        rating: 5.0,
        reviewsCount: 98,
        coopName: 'Pune Metro Mahila Artisan & Care PSCS',
        experience: '6 Years Exp',
        rate: 450,
        status: 'VERIFIED',
        available: true,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        skills: ['Elderly Assistance', 'Physiotherapy Aid', 'Post-Op Care', 'Medication Mgmt'],
        aadhaarVerified: true
      },
      {
        id: 'PRV-103',
        name: 'Mohammad Imran Ali',
        category: 'Electrical',
        rating: 4.8,
        reviewsCount: 215,
        coopName: 'Delhi North Progressive Artisan Cooperative',
        experience: '10 Years Exp',
        rate: 400,
        status: 'VERIFIED',
        available: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        skills: ['Short Circuit Repair', 'Inverter Wiring', 'MCB Replacement', 'Fan/Light Fixes'],
        aadhaarVerified: true
      },
      {
        id: 'PRV-104',
        name: 'Lakshmi Narayana Rao',
        category: 'Carpentry',
        rating: 4.7,
        reviewsCount: 76,
        coopName: 'Hyderabad Artisan Guild Cooperative',
        experience: '12 Years Exp',
        rate: 500,
        status: 'VERIFIED',
        available: false,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        skills: ['Furniture Repair', 'Door Lock Installation', 'Modular Kitchen Work'],
        aadhaarVerified: true
      },
      {
        id: 'PRV-105',
        name: 'Anita Devi Shinde',
        category: 'House Cleaning',
        rating: 4.9,
        reviewsCount: 164,
        coopName: 'Pune Metro Mahila Artisan & Care PSCS',
        experience: '5 Years Exp',
        rate: 300,
        status: 'VERIFIED',
        available: true,
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        skills: ['Deep Home Cleaning', 'Kitchen Sanitization', 'Bathroom Scrubbing'],
        aadhaarVerified: true
      },
      {
        id: 'PRV-106',
        name: 'Rameshwar Lal Gurjar',
        category: 'Cooking',
        rating: 4.8,
        reviewsCount: 89,
        coopName: 'Jaipur Heritage Cooperative Society',
        experience: '9 Years Exp',
        rate: 450,
        status: 'PENDING_VERIFICATION',
        available: false,
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        skills: ['North Indian Cuisine', 'Dietary Meal Prep', 'Party Catering'],
        aadhaarVerified: false
      }
    ],
    bookings: [
      {
        id: 'BKG-8839',
        serviceTitle: 'Emergency Pipe Leakage & Water Pressure Rectification',
        providerName: 'Rajesh Kumar Verma',
        providerId: 'PRV-101',
        category: 'Plumbing',
        amount: 850,
        providerShare: 680,
        welfareShare: 127.5,
        platformShare: 42.5,
        status: 'IN_PROGRESS',
        address: 'B-402, Shanti Kunj, Assi Ghat, Varanasi',
        date: 'Today, 2:30 PM',
        stepIndex: 3
      },
      {
        id: 'BKG-8838',
        serviceTitle: 'Main Board MCB Tripping & Inverter Line Overhaul',
        providerName: 'Mohammad Imran Ali',
        providerId: 'PRV-103',
        category: 'Electrical',
        amount: 600,
        providerShare: 480,
        welfareShare: 90,
        platformShare: 30,
        status: 'COMPLETED',
        address: 'Flat 12, Block C, Civil Lines, New Delhi',
        date: 'Yesterday, 11:00 AM',
        stepIndex: 4
      }
    ],
    governancePolls: [
      {
        id: 'RES-2026-04',
        title: 'Resolution #2026-04: Allocation of Society Welfare Reserve for Monsoon Healthcare & Dengue Insurance Coverage',
        description: 'Proposal to allocate ₹1,25,000 from the accumulated Cooperative Welfare Fund towards 100% cashless outpatient coverage and rain gear allowance for all 142 registered gig workers of Varanasi PSCS.',
        proposer: 'Cooperative Managing Committee (PSCS-UP-882)',
        status: 'OPEN',
        deadline: '3 Days Remaining',
        votesFor: 118,
        votesAgainst: 12,
        votesAbstain: 6,
        quorumMet: true,
        userVoted: null
      },
      {
        id: 'RES-2026-05',
        title: 'Resolution #2026-05: Revision of Cooperative Commission Split — Cap Platform Fee at 3% and Increase Worker Payout to 82%',
        description: 'Democratic petition to renegotiate centralized platform technology fees down to 3%, directly raising worker gig earnings to 82% while retaining 15% for member pension endowments.',
        proposer: 'All-India Gig Workers Cooperative Federation',
        status: 'OPEN',
        deadline: '6 Days Remaining',
        votesFor: 342,
        votesAgainst: 28,
        votesAbstain: 14,
        quorumMet: true,
        userVoted: null
      }
    ],
    coopStats: {
      totalMembers: 142,
      activeJobsToday: 38,
      welfareFundBalance: 482500,
      totalGmvMonthly: 1245000,
      dividendDistributed: 215000,
      commissionRates: {
        provider: 80,
        welfare: 15,
        platform: 5
      }
    }
  };

  const STORAGE_KEY = 'SAHAKAR_UX4G_APP_STATE_V1';

  function loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load state from localStorage', e);
    }
    return DEFAULT_STATE;
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state', e);
    }
  }

  const appState = loadState();

  // ─── Check Live Backend Connectivity ───
  async function checkBackendConnection() {
    try {
      const health = await apiFetch('/health');
      if (health && (health.status === 'healthy' || health.status === 'sandbox_mode')) {
        isBackendConnected = true;
        console.log('✅ Connected to SahakarConnect Backend REST API:', health.app);
        
        // Sync live service categories & demo data from backend
        const demoData = await apiFetch('/demo-accounts').catch(() => null);
        if (demoData && demoData.users && demoData.users.length > 0) {
          console.log(`📡 Synced ${demoData.users.length} live members from database.`);
        }
      }
    } catch (e) {
      isBackendConnected = false;
      console.log('ℹ️ Operating in Standalone UX4G Local Mode.');
    }
  }

  // ─── Accessibility & Theme Controller ───
  function applyThemeSettings() {
    const html = document.documentElement;
    if (appState.theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }

    if (appState.contrast === 'high') {
      html.setAttribute('data-contrast', 'high');
    } else {
      html.removeAttribute('data-contrast');
    }

    html.setAttribute('data-font-size', appState.fontSize || 'normal');
  }

  function initAccessibilityBar() {
    applyThemeSettings();

    const btnDec = document.querySelector('[data-acc="font-decrease"]');
    const btnReset = document.querySelector('[data-acc="font-reset"]');
    const btnInc = document.querySelector('[data-acc="font-increase"]');
    const btnContrast = document.querySelector('[data-acc="contrast-toggle"]');
    const btnTheme = document.querySelector('[data-acc="theme-toggle"]');
    const btnLang = document.querySelector('[data-acc="lang-toggle"]');

    if (btnDec) {
      btnDec.addEventListener('click', () => {
        appState.fontSize = 'small';
        saveState(appState);
        applyThemeSettings();
        showToast('Text size set to Small (A-)', 'info');
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        appState.fontSize = 'normal';
        saveState(appState);
        applyThemeSettings();
        showToast('Text size reset to Default (A)', 'info');
      });
    }

    if (btnInc) {
      btnInc.addEventListener('click', () => {
        appState.fontSize = 'large';
        saveState(appState);
        applyThemeSettings();
        showToast('Text size set to Large (A+)', 'info');
      });
    }

    if (btnContrast) {
      btnContrast.addEventListener('click', () => {
        appState.contrast = appState.contrast === 'high' ? 'normal' : 'high';
        saveState(appState);
        applyThemeSettings();
        showToast(appState.contrast === 'high' ? 'High Contrast Mode Enabled' : 'High Contrast Mode Disabled', 'info');
      });
    }

    if (btnTheme) {
      btnTheme.addEventListener('click', () => {
        appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
        saveState(appState);
        applyThemeSettings();
        showToast(appState.theme === 'dark' ? 'Dark Theme Activated' : 'Standard Light Theme Activated', 'info');
      });
    }

    if (btnLang) {
      btnLang.addEventListener('click', () => {
        appState.lang = appState.lang === 'en' ? 'hi' : 'en';
        saveState(appState);
        showToast(appState.lang === 'hi' ? 'भाषा: हिन्दी (Hindi Selected)' : 'Language: English', 'info');
        updateBilingualLabels();
      });
    }
  }

  function updateBilingualLabels() {
    const isHi = appState.lang === 'hi';
    const langSpan = document.getElementById('current-lang-text');
    if (langSpan) {
      langSpan.textContent = isHi ? 'हिन्दी (Hindi)' : 'English';
    }
  }

  // ─── Toast Notifications ───
  function showToast(message, type = 'info') {
    let container = document.getElementById('ux4g-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ux4g-toast-container';
      container.className = 'ux4g-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `ux4g-toast ${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check_circle';
    if (type === 'warning') iconName = 'warning';
    if (type === 'danger') iconName = 'error';

    toast.innerHTML = `
      <span class="ux4g-icon-outlined" style="color: ${type === 'success' ? 'var(--ux4g-gov-green)' : (type === 'danger' ? 'var(--ux4g-color-danger-500)' : 'var(--ux4g-gov-blue)')};">${iconName}</span>
      <div style="flex: 1;">
        <p style="margin: 0; font-size: 0.875rem; font-weight: 600;">${message}</p>
        <span style="font-size: 0.75rem; color: var(--ux4g-text-tertiary);">Cooperative Gateway • Live Sync</span>
      </div>
      <button type="button" style="background:none; border:none; color:var(--ux4g-text-tertiary); cursor:pointer; font-size:1.1rem;" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 4500);
  }

  // ─── Booking Modal Engine ───
  let selectedProvider = null;

  function openBookingModal(providerId) {
    const provider = appState.providers.find(p => p.id === providerId) || appState.providers[0];
    selectedProvider = provider;

    const modal = document.getElementById('booking-modal');
    if (!modal) return;

    const provNameEl = document.getElementById('modal-provider-name');
    const provCoopEl = document.getElementById('modal-provider-coop');
    const provRateEl = document.getElementById('modal-provider-rate');
    const provCatEl = document.getElementById('modal-provider-category');
    
    if (provNameEl) provNameEl.textContent = provider.name;
    if (provCoopEl) provCoopEl.textContent = provider.coopName;
    if (provRateEl) provRateEl.textContent = `₹${provider.rate} / visit`;
    if (provCatEl) provCatEl.textContent = provider.category;

    updateBookingSplitCalculation(provider.rate);
    modal.classList.add('open');
  }

  function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) modal.classList.remove('open');
  }

  function updateBookingSplitCalculation(baseAmount) {
    const total = Number(baseAmount) || 500;
    const provShare = (total * 0.80).toFixed(0);
    const welfareShare = (total * 0.15).toFixed(0);
    const platShare = (total * 0.05).toFixed(0);

    const totalEl = document.getElementById('calc-total');
    const provEl = document.getElementById('calc-prov-share');
    const welfEl = document.getElementById('calc-welf-share');
    const platEl = document.getElementById('calc-plat-share');

    if (totalEl) totalEl.textContent = `₹${total}`;
    if (provEl) provEl.textContent = `₹${provShare} (80%)`;
    if (welfEl) welfEl.textContent = `₹${welfareShare} (15%)`;
    if (platEl) platEl.textContent = `₹${platShare} (5%)`;
  }

  async function confirmBooking(e) {
    if (e) e.preventDefault();
    if (!selectedProvider) return;

    const baseAmount = selectedProvider.rate || 500;
    const bookingId = `BKG-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = {
      id: bookingId,
      serviceTitle: `${selectedProvider.category} Service Call & Diagnostics`,
      providerName: selectedProvider.name,
      providerId: selectedProvider.id,
      category: selectedProvider.category,
      amount: baseAmount,
      providerShare: baseAmount * 0.80,
      welfareShare: baseAmount * 0.15,
      platformShare: baseAmount * 0.05,
      status: 'REQUESTED',
      address: 'House No 44, Gomti Nagar Sector 4, Lucknow',
      date: 'Scheduled for Today',
      stepIndex: 1
    };

    // Attempt backend sync
    try {
      await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          listingId: selectedProvider.id,
          scheduledAt: new Date().toISOString(),
          serviceAddress: newBooking.address,
          notes: newBooking.serviceTitle
        })
      });
      console.log('✅ Booking synced with backend database.');
    } catch (err) {
      console.log('ℹ️ Booking stored in client ledger.');
    }

    appState.bookings.unshift(newBooking);
    saveState(appState);
    closeBookingModal();
    showToast(`Booking ${newBooking.id} created! Routed to ${selectedProvider.coopName}`, 'success');

    renderConsumerBookings();
  }

  // ─── Consumer Services Search & Filter ───
  function filterProviders(category = 'ALL', searchQuery = '') {
    const grid = document.getElementById('providers-grid');
    if (!grid) return;

    const filtered = appState.providers.filter(p => {
      const matchCat = category === 'ALL' || p.category.toLowerCase() === category.toLowerCase();
      const matchQuery = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()) || p.coopName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; background: var(--ux4g-bg-surface); border: 1px dashed var(--ux4g-border-strong); border-radius: var(--ux4g-radius-lg);">
          <span class="ux4g-icon-outlined" style="font-size: 48px; color: var(--ux4g-text-tertiary);">search_off</span>
          <h4 style="margin: 0.75rem 0 0.25rem 0; font-size: 1.125rem;">No verified cooperative providers found</h4>
          <p style="color: var(--ux4g-text-secondary); font-size: 0.875rem;">Try selecting another category or clear your search term.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(p => `
      <div class="ux4g-card ux4g-card-interactive" id="card-${p.id}">
        <div class="ux4g-card-header">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <img src="${p.avatar}" alt="${p.name}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--ux4g-gov-blue-light);">
            <div>
              <div style="display: flex; align-items: center; gap: 0.35rem;">
                <h4 style="font-size: 1rem; font-weight: 700; color: var(--ux4g-gov-blue);">${p.name}</h4>
                ${p.aadhaarVerified ? `<span class="ux4g-badge ux4g-badge-success" title="Aadhaar e-KYC Verified PSCS Member"><span class="ux4g-icon-outlined" style="font-size:14px;">verified</span> KYC</span>` : ''}
              </div>
              <span style="font-size: 0.75rem; color: var(--ux4g-text-tertiary); display: block;">${p.coopName}</span>
            </div>
          </div>
          <span class="ux4g-badge ${p.available ? 'ux4g-badge-success' : 'ux4g-badge-neutral'}">
            ${p.available ? '● Available' : '○ Busy'}
          </span>
        </div>
        <div class="ux4g-card-body">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
            <span class="ux4g-badge ux4g-badge-primary">${p.category}</span>
            <div style="display: flex; align-items: center; gap: 0.25rem; font-weight: 700; color: #D97706;">
              <span class="ux4g-icon-outlined" style="font-size: 18px; color: #F59E0B;">star</span>
              <span>${p.rating}</span>
              <span style="font-size: 0.75rem; color: var(--ux4g-text-tertiary); font-weight: 500;">(${p.reviewsCount})</span>
            </div>
          </div>
          
          <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1rem;">
            ${p.skills.map(s => `<span style="font-size: 0.75rem; background: var(--ux4g-bg-subtle); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--ux4g-border-default);">${s}</span>`).join('')}
          </div>

          <div style="background: var(--ux4g-gov-blue-light); padding: 0.65rem 0.85rem; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.8125rem; color: var(--ux4g-gov-blue); font-weight: 600;">Cooperative Standard Rate:</span>
            <span style="font-size: 1.125rem; font-weight: 800; color: var(--ux4g-gov-blue);">₹${p.rate} <small style="font-size: 0.75rem; font-weight: 500;">/ visit</small></span>
          </div>
        </div>
        <div class="ux4g-card-footer">
          <span style="font-size: 0.75rem; color: var(--ux4g-gov-green); font-weight: 600;">
            <span class="ux4g-icon-outlined" style="font-size:14px;">savings</span> 15% goes to Member Welfare Fund
          </span>
          <button type="button" class="ux4g-btn ux4g-btn-primary ux4g-btn-sm" onclick="window.SahakarApp.openBookingModal('${p.id}')">
            Book Service
            <span class="ux4g-icon-outlined" style="font-size: 16px;">arrow_forward</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  function renderConsumerBookings() {
    const listEl = document.getElementById('consumer-bookings-list');
    if (!listEl) return;

    if (appState.bookings.length === 0) {
      listEl.innerHTML = `<p style="color: var(--ux4g-text-tertiary); text-align: center; padding: 2rem;">No active bookings found.</p>`;
      return;
    }

    listEl.innerHTML = appState.bookings.map(b => {
      let statusBadge = 'ux4g-badge-primary';
      let statusText = 'Request Placed';
      if (b.status === 'ACCEPTED') { statusBadge = 'ux4g-badge-saffron'; statusText = 'Provider Assigned'; }
      if (b.status === 'IN_PROGRESS') { statusBadge = 'ux4g-badge-warning'; statusText = 'Service In Progress'; }
      if (b.status === 'COMPLETED') { statusBadge = 'ux4g-badge-success'; statusText = 'Completed & Settled'; }

      return `
        <div class="ux4g-card" style="margin-bottom: 1.25rem;">
          <div class="ux4g-card-header">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-weight: 700; font-size: 1.05rem; color: var(--ux4g-gov-blue);">${b.id}</span>
                <span class="ux4g-badge ${statusBadge}">${statusText}</span>
              </div>
              <p style="margin-top: 0.25rem; font-weight: 600; font-size: 0.9375rem;">${b.serviceTitle}</p>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 1.25rem; font-weight: 800; color: var(--ux4g-gov-blue);">₹${b.amount}</span>
              <span style="font-size: 0.75rem; color: var(--ux4g-text-tertiary); display: block;">${b.date}</span>
            </div>
          </div>
          <div class="ux4g-card-body">
            <div class="ux4g-stepper">
              <div class="ux4g-step ${b.stepIndex >= 1 ? (b.stepIndex === 1 ? 'active' : 'completed') : ''}">
                <div class="ux4g-step-circle">${b.stepIndex > 1 ? '✓' : '1'}</div>
                <span class="ux4g-step-label">1. Requested</span>
              </div>
              <div class="ux4g-step ${b.stepIndex >= 2 ? (b.stepIndex === 2 ? 'active' : 'completed') : ''}">
                <div class="ux4g-step-circle">${b.stepIndex > 2 ? '✓' : '2'}</div>
                <span class="ux4g-step-label">2. Provider Assigned</span>
              </div>
              <div class="ux4g-step ${b.stepIndex >= 3 ? (b.stepIndex === 3 ? 'active' : 'completed') : ''}">
                <div class="ux4g-step-circle">${b.stepIndex > 3 ? '✓' : '3'}</div>
                <span class="ux4g-step-label">3. In Progress</span>
              </div>
              <div class="ux4g-step ${b.stepIndex >= 4 ? 'completed' : ''}">
                <div class="ux4g-step-circle">${b.stepIndex >= 4 ? '✓' : '4'}</div>
                <span class="ux4g-step-label">4. Settled</span>
              </div>
            </div>

            <div style="margin-top: 1.25rem; background: var(--ux4g-bg-subtle); padding: 1rem; border-radius: var(--ux4g-radius-md); border: 1px solid var(--ux4g-border-default);">
              <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.35rem;">
                <span>Transparent Cooperative Split Ledger:</span>
                <span style="color: var(--ux4g-gov-green);">Total: ₹${b.amount}</span>
              </div>
              <div class="sahakar-split-bar">
                <div class="split-segment split-provider" style="width: 80%;">₹${b.providerShare} (Worker 80%)</div>
                <div class="split-segment split-welfare" style="width: 15%;">₹${b.welfareShare} (Welfare 15%)</div>
                <div class="split-segment split-platform" style="width: 5%;">₹${b.platformShare} (Platform 5%)</div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--ux4g-text-tertiary); margin-top: 0.35rem;">
                <span>👨‍🔧 Provider: ${b.providerName}</span>
                <span>📍 ${b.address}</span>
              </div>
            </div>
          </div>
          <div class="ux4g-card-footer">
            <span style="font-size: 0.8125rem; color: var(--ux4g-text-secondary);">Need assistance? Contact Cooperative Helpline: <strong>1800-180-COOP</strong></span>
            ${b.status !== 'COMPLETED' ? `
              <button type="button" class="ux4g-btn ux4g-btn-outline-neutral ux4g-btn-sm" onclick="window.SahakarApp.advanceBookingStatus('${b.id}')">
                Simulate Live Step →
              </button>
            ` : `<span class="ux4g-badge ux4g-badge-success">Paid via Cooperative UPI Gateway</span>`}
          </div>
        </div>
      `;
    }).join('');
  }

  async function advanceBookingStatus(bookingId) {
    const booking = appState.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (booking.status === 'REQUESTED') {
      booking.status = 'ACCEPTED';
      booking.stepIndex = 2;
      showToast(`Provider accepted Booking ${booking.id}!`, 'info');
    } else if (booking.status === 'ACCEPTED') {
      booking.status = 'IN_PROGRESS';
      booking.stepIndex = 3;
      showToast(`Work started on Booking ${booking.id}`, 'warning');
    } else if (booking.status === 'IN_PROGRESS') {
      booking.status = 'COMPLETED';
      booking.stepIndex = 4;
      showToast(`Booking ${booking.id} completed! ₹${booking.providerShare} credited to Provider & ₹${booking.welfareShare} to Society Welfare Fund.`, 'success');
    }

    saveState(appState);
    renderConsumerBookings();
    renderProviderDashboard();
  }

  // ─── Provider Dashboard Handlers ───
  async function toggleProviderAvailability() {
    const toggle = document.getElementById('provider-avail-toggle');
    if (!toggle) return;
    const isAvail = toggle.checked;

    try {
      await apiFetch('/providers/availability', {
        method: 'PATCH',
        body: JSON.stringify({ available: isAvail })
      });
    } catch (e) {
      // Local fallback
    }

    showToast(isAvail ? 'You are now ONLINE. Ready to receive cooperative service jobs.' : 'You are now OFFLINE. No incoming job alerts.', isAvail ? 'success' : 'info');
  }

  function renderProviderDashboard() {
    const jobListEl = document.getElementById('provider-active-jobs');
    if (!jobListEl) return;

    const activeJobs = appState.bookings.filter(b => b.status !== 'COMPLETED');
    if (activeJobs.length === 0) {
      jobListEl.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; background: var(--ux4g-bg-surface); border: 1px dashed var(--ux4g-border-strong); border-radius: var(--ux4g-radius-lg);">
          <span class="ux4g-icon-outlined" style="font-size: 42px; color: var(--ux4g-gov-green);">task_alt</span>
          <h4 style="margin: 0.5rem 0 0.25rem 0;">No Pending Jobs in Queue</h4>
          <p style="color: var(--ux4g-text-secondary); font-size: 0.875rem;">Your availability is ON. New cooperative job requests will appear here instantly.</p>
        </div>
      `;
      return;
    }

    jobListEl.innerHTML = activeJobs.map(j => `
      <div class="ux4g-card" style="margin-bottom: 1rem; border-left: 4px solid var(--ux4g-gov-saffron);">
        <div class="ux4g-card-header">
          <div>
            <span class="ux4g-badge ux4g-badge-saffron">${j.status}</span>
            <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--ux4g-gov-blue); margin-top: 0.35rem;">${j.serviceTitle}</h4>
            <p style="font-size: 0.8125rem; color: var(--ux4g-text-tertiary);">📍 ${j.address}</p>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 1.35rem; font-weight: 800; color: var(--ux4g-gov-green);">₹${j.providerShare}</span>
            <span style="font-size: 0.75rem; color: var(--ux4g-text-tertiary); display: block;">Your 80% Net Take-Home</span>
          </div>
        </div>
        <div class="ux4g-card-body">
          <div style="display: flex; gap: 1rem; background: var(--ux4g-bg-subtle); padding: 0.75rem; border-radius: 6px; font-size: 0.8125rem;">
            <div><strong>Total Bill:</strong> ₹${j.amount}</div>
            <div><strong>Welfare Contribution:</strong> ₹${j.welfareShare} (15%)</div>
            <div><strong>Platform Fee:</strong> ₹${j.platformShare} (5%)</div>
          </div>
        </div>
        <div class="ux4g-card-footer">
          <span style="font-size: 0.75rem; color: var(--ux4g-text-tertiary);">Customer OTP verification required upon completion</span>
          <div style="display: flex; gap: 0.5rem;">
            ${j.status === 'REQUESTED' ? `
              <button type="button" class="ux4g-btn ux4g-btn-success ux4g-btn-sm" onclick="window.SahakarApp.advanceBookingStatus('${j.id}')">
                <span class="ux4g-icon-outlined" style="font-size:16px;">check</span> Accept Gig
              </button>
            ` : ''}
            ${j.status === 'ACCEPTED' ? `
              <button type="button" class="ux4g-btn ux4g-btn-primary ux4g-btn-sm" onclick="window.SahakarApp.advanceBookingStatus('${j.id}')">
                <span class="ux4g-icon-outlined" style="font-size:16px;">play_arrow</span> Start Job
              </button>
            ` : ''}
            ${j.status === 'IN_PROGRESS' ? `
              <button type="button" class="ux4g-btn ux4g-btn-success ux4g-btn-sm" onclick="window.SahakarApp.advanceBookingStatus('${j.id}')">
                <span class="ux4g-icon-outlined" style="font-size:16px;">verified</span> Complete & Settle
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  // ─── Admin Verification & Ledger Handlers ───
  async function approveProviderKYC(providerId) {
    const p = appState.providers.find(prov => prov.id === providerId);
    if (p) {
      p.status = 'VERIFIED';
      p.aadhaarVerified = true;
      p.available = true;

      try {
        await apiFetch(`/coop/default/providers/${providerId}/verify`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'VERIFIED' })
        });
      } catch (e) {
        // Local fallback
      }

      saveState(appState);
      showToast(`Provider ${p.name} (${p.id}) verified & enrolled in PSCS Welfare Registry!`, 'success');
      renderAdminVerificationTable();
    }
  }

  function renderAdminVerificationTable() {
    const tableBody = document.getElementById('admin-prov-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = appState.providers.map(p => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <img src="${p.avatar}" alt="${p.name}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
            <div>
              <div style="font-weight: 700; color: var(--ux4g-gov-blue);">${p.name}</div>
              <div style="font-size: 0.75rem; color: var(--ux4g-text-tertiary);">${p.id}</div>
            </div>
          </div>
        </td>
        <td><span class="ux4g-badge ux4g-badge-primary">${p.category}</span></td>
        <td>${p.coopName}</td>
        <td>
          ${p.aadhaarVerified ? `<span class="ux4g-badge ux4g-badge-success">e-KYC Passed</span>` : `<span class="ux4g-badge ux4g-badge-warning">Pending Aadhaar</span>`}
        </td>
        <td>
          ${p.status === 'VERIFIED' ? `<span class="ux4g-badge ux4g-badge-success">Active Member</span>` : `
            <button type="button" class="ux4g-btn ux4g-btn-success ux4g-btn-sm" onclick="window.SahakarApp.approveProviderKYC('${p.id}')">
              Approve Verification
            </button>
          `}
        </td>
      </tr>
    `).join('');
  }

  // ─── Governance Democratic Voting Handlers ───
  async function castGovernanceVote(pollId, voteType) {
    const poll = appState.governancePolls.find(p => p.id === pollId);
    if (!poll) return;

    if (poll.userVoted) {
      showToast(`You have already voted '${poll.userVoted}' on this resolution.`, 'warning');
      return;
    }

    if (voteType === 'FOR') poll.votesFor++;
    if (voteType === 'AGAINST') poll.votesAgainst++;
    if (voteType === 'ABSTAIN') poll.votesAbstain++;

    poll.userVoted = voteType;

    try {
      await apiFetch(`/coop/polls/${pollId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ choice: voteType })
      });
    } catch (e) {
      // Local fallback
    }

    saveState(appState);
    showToast(`Vote '${voteType}' recorded on ${poll.id}! Cryptographic Receipt: #TX-GOV-${Math.floor(100000 + Math.random() * 900000)}`, 'success');
    renderGovernancePolls();
  }

  function renderGovernancePolls() {
    const pollsEl = document.getElementById('governance-polls-container');
    if (!pollsEl) return;

    pollsEl.innerHTML = appState.governancePolls.map(poll => {
      const totalVotes = poll.votesFor + poll.votesAgainst + poll.votesAbstain;
      const forPercent = totalVotes > 0 ? Math.round((poll.votesFor / totalVotes) * 100) : 0;
      const againstPercent = totalVotes > 0 ? Math.round((poll.votesAgainst / totalVotes) * 100) : 0;
      const abstainPercent = totalVotes > 0 ? Math.round((poll.votesAbstain / totalVotes) * 100) : 0;

      return `
        <div class="ux4g-card" style="margin-bottom: 1.5rem;">
          <div class="ux4g-card-header">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="ux4g-badge ux4g-badge-primary">${poll.id}</span>
                <span class="ux4g-badge ux4g-badge-success">${poll.status}</span>
                <span style="font-size: 0.75rem; color: var(--ux4g-gov-saffron); font-weight: 600;">⏱ ${poll.deadline}</span>
              </div>
              <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--ux4g-gov-blue); margin-top: 0.5rem;">${poll.title}</h3>
            </div>
          </div>
          <div class="ux4g-card-body">
            <p style="color: var(--ux4g-text-secondary); font-size: 0.9375rem; line-height: 1.6; margin-bottom: 1.25rem;">${poll.description}</p>
            
            <div style="background: var(--ux4g-bg-subtle); padding: 1.25rem; border-radius: var(--ux4g-radius-md); border: 1px solid var(--ux4g-border-default);">
              <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.875rem; margin-bottom: 0.5rem;">
                <span>Democratic Tally (${totalVotes} Total Member Votes Cast)</span>
                <span style="color: var(--ux4g-gov-green);">Quorum Reached (94% Turnout)</span>
              </div>

              <div style="height: 22px; display: flex; border-radius: 9999px; overflow: hidden; margin-bottom: 0.75rem;">
                <div style="width: ${forPercent}%; background: var(--ux4g-gov-green);" title="FOR: ${poll.votesFor}"></div>
                <div style="width: ${againstPercent}%; background: var(--ux4g-color-danger-500);" title="AGAINST: ${poll.votesAgainst}"></div>
                <div style="width: ${abstainPercent}%; background: #94A3B8;" title="ABSTAIN: ${poll.votesAbstain}"></div>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; font-weight: 600;">
                <span style="color: var(--ux4g-gov-green);">● FOR: ${poll.votesFor} (${forPercent}%)</span>
                <span style="color: var(--ux4g-color-danger-500);">● AGAINST: ${poll.votesAgainst} (${againstPercent}%)</span>
                <span style="color: #64748B;">● ABSTAIN: ${poll.votesAbstain} (${abstainPercent}%)</span>
              </div>
            </div>
          </div>
          <div class="ux4g-card-footer">
            <span style="font-size: 0.8125rem; color: var(--ux4g-text-tertiary);">Proposer: <strong>${poll.proposer}</strong></span>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              ${poll.userVoted ? `
                <span class="ux4g-badge ux4g-badge-success" style="font-size:0.8125rem; padding: 0.4rem 0.8rem;">
                  ✓ Your Vote: ${poll.userVoted}
                </span>
              ` : `
                <button type="button" class="ux4g-btn ux4g-btn-success ux4g-btn-sm" onclick="window.SahakarApp.castGovernanceVote('${poll.id}', 'FOR')">
                  Vote FOR
                </button>
                <button type="button" class="ux4g-btn ux4g-btn-danger ux4g-btn-sm" onclick="window.SahakarApp.castGovernanceVote('${poll.id}', 'AGAINST')">
                  Vote AGAINST
                </button>
                <button type="button" class="ux4g-btn ux4g-btn-outline-neutral ux4g-btn-sm" onclick="window.SahakarApp.castGovernanceVote('${poll.id}', 'ABSTAIN')">
                  Abstain
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ─── Export Public API to Window ───
  window.SahakarApp = {
    state: appState,
    saveState,
    showToast,
    apiFetch,
    openBookingModal,
    closeBookingModal,
    updateBookingSplitCalculation,
    confirmBooking,
    filterProviders,
    renderConsumerBookings,
    advanceBookingStatus,
    toggleProviderAvailability,
    renderProviderDashboard,
    approveProviderKYC,
    renderAdminVerificationTable,
    castGovernanceVote,
    renderGovernancePolls,
    init: function () {
      initAccessibilityBar();
      updateBilingualLabels();
      checkBackendConnection();

      if (document.getElementById('providers-grid')) {
        filterProviders('ALL');
        renderConsumerBookings();
      }
      if (document.getElementById('provider-active-jobs')) {
        renderProviderDashboard();
      }
      if (document.getElementById('admin-prov-table-body')) {
        renderAdminVerificationTable();
      }
      if (document.getElementById('governance-polls-container')) {
        renderGovernancePolls();
      }

      const modalBackdrop = document.getElementById('booking-modal');
      if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
          if (e.target === modalBackdrop) closeBookingModal();
        });
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.SahakarApp.init();
  });
})();
