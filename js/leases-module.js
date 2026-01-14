// =====================================================
// LEASES MODULE
// =====================================================

let firebaseLeases = [];
let leaseSearchTerm = '';
let leaseStoreFilter = 'all';

const STORE_LOCATIONS = [
    { id: 'miramar', name: 'Miramar', type: 'vape' },
    { id: 'morena', name: 'Morena', type: 'vape' },
    { id: 'kearny-mesa', name: 'Kearny Mesa', type: 'vape' },
    { id: 'chula-vista', name: 'Chula Vista', type: 'vape' },
    { id: 'north-park', name: 'North Park', type: 'vape' },
    { id: 'miramar-wine-liquor', name: 'Miramar Wine & Liquor', type: 'liquor' }
];

async function initLeases() {
    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('leases').orderBy('storeName', 'asc').get();
        firebaseLeases = snapshot.docs.map(doc => ({
            firestoreId: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error loading leases:', error);
        firebaseLeases = [];
    }
}

async function renderLeases() {
    const dashboard = document.querySelector('.dashboard');
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

    // Load leases from Firebase
    try {
        await initLeases();
    } catch (error) {
        console.error('Error initializing leases:', error);
    }

    const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager');

    // Calculate summary stats
    const today = new Date();
    const activeLeases = firebaseLeases.filter(l => {
        if (!l.endDate) return true;
        const end = new Date(l.endDate);
        const days = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        return days > 90;
    });
    const expiringLeases = firebaseLeases.filter(l => {
        if (!l.endDate) return false;
        const end = new Date(l.endDate);
        const days = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        return days > 0 && days <= 90;
    });
    const expiredLeases = firebaseLeases.filter(l => {
        if (!l.endDate) return false;
        const end = new Date(l.endDate);
        return end < today;
    });

    // Calculate total monthly rent
    const totalMonthlyRent = firebaseLeases.reduce((sum, l) => sum + (parseFloat(l.monthlyRent) || 0), 0);

    dashboard.innerHTML = `
        <!-- Leases Header Banner -->
        <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%); border-radius: 16px; padding: 32px; margin-bottom: 24px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; right: 0; width: 300px; height: 100%; opacity: 0.1;">
                <i class="fas fa-file-contract" style="font-size: 200px; position: absolute; right: -30px; top: 50%; transform: translateY(-50%); color: white;"></i>
            </div>
            <div style="position: relative; z-index: 1;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;">
                    <div>
                        <h1 style="font-size: 28px; font-weight: 700; color: white; margin: 0 0 8px 0;">
                            <i class="fas fa-file-contract" style="margin-right: 12px;"></i>Lease Contracts
                        </h1>
                        <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 15px;">Manage all store lease agreements and contracts</p>
                    </div>
                    ${isAdmin ? `
                        <button class="btn-primary" onclick="openAddLeaseModal()" style="background: white; color: #4c1d95; border: none; font-weight: 600;">
                            <i class="fas fa-plus"></i> Add Lease
                        </button>
                    ` : ''}
                </div>
                <div style="display: flex; gap: 32px; margin-top: 24px; flex-wrap: wrap;">
                    <div>
                        <div style="font-size: 32px; font-weight: 700; color: white;">${firebaseLeases.length}</div>
                        <div style="font-size: 13px; color: rgba(255,255,255,0.6);">Total Leases</div>
                    </div>
                    <div>
                        <div style="font-size: 32px; font-weight: 700; color: #4ade80;">${activeLeases.length}</div>
                        <div style="font-size: 13px; color: rgba(255,255,255,0.6);">Active</div>
                    </div>
                    <div>
                        <div style="font-size: 32px; font-weight: 700; color: #fbbf24;">${expiringLeases.length}</div>
                        <div style="font-size: 13px; color: rgba(255,255,255,0.6);">Expiring Soon</div>
                    </div>
                    <div>
                        <div style="font-size: 32px; font-weight: 700; color: #f87171;">${expiredLeases.length}</div>
                        <div style="font-size: 13px; color: rgba(255,255,255,0.6);">Expired</div>
                    </div>
                    <div style="border-left: 1px solid rgba(255,255,255,0.2); padding-left: 32px;">
                        <div style="font-size: 32px; font-weight: 700; color: white;">$${totalMonthlyRent.toLocaleString()}</div>
                        <div style="font-size: 13px; color: rgba(255,255,255,0.6);">Monthly Rent Total</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="license-stores-grid">
            ${STORE_LOCATIONS.map(store => {
                const storeLeases = firebaseLeases.filter(l => l.storeId === store.id);
                const isLiquor = store.type === 'liquor';
                return `
                    <div class="license-store-zone" data-store="${store.id}">
                        <div class="license-store-header">
                            <div class="license-store-title">
                                <i class="fas ${isLiquor ? 'fa-wine-bottle' : 'fa-store'}"></i>
                                <span>${store.name}</span>
                            </div>
                            <div class="license-store-count">
                                <span class="count-badge">${storeLeases.length}</span>
                            </div>
                        </div>
                        <div class="license-drop-area">
                            ${storeLeases.length === 0 ? `
                                <div class="license-empty-state">
                                    <i class="fas fa-file-contract"></i>
                                    <span>No lease contracts</span>
                                </div>
                            ` : ''}
                            ${storeLeases.map(lease => {
                                const hasPdf = lease.pdfUrl;
                                // Calculate status
                                let status = 'valid';
                                let statusTitle = 'Active';
                                if (lease.endDate) {
                                    const endDate = new Date(lease.endDate);
                                    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                                    if (daysLeft < 0) {
                                        status = 'expired';
                                        statusTitle = 'Expired';
                                    } else if (daysLeft <= 90) {
                                        status = 'expiring';
                                        statusTitle = 'Expiring Soon';
                                    }
                                }
                                return `
                                <div class="license-item" style="cursor: pointer;" onclick="viewLeaseDetails('${lease.firestoreId}')">
                                    <div class="license-item-header">
                                        <div class="license-item-name">
                                            <i class="fas fa-file-contract"></i>
                                            <span>Lease Contract</span>
                                        </div>
                                        <div class="license-item-status">
                                            <div class="status-dot ${status}" title="${statusTitle}"></div>
                                        </div>
                                    </div>
                                    <div style="padding: 8px 12px; font-size: 12px; color: var(--text-muted);">
                                        ${lease.landlord ? `<div><i class="fas fa-user-tie" style="width: 14px;"></i> ${lease.landlord}</div>` : ''}
                                        ${lease.monthlyRent ? `<div><i class="fas fa-dollar-sign" style="width: 14px;"></i> $${parseFloat(lease.monthlyRent).toLocaleString()}/mo</div>` : ''}
                                    </div>
                                    <div class="license-item-footer">
                                        <span class="license-expires">
                                            <i class="fas fa-calendar"></i>
                                            ${lease.endDate ? formatLeaseDate(lease.endDate) : 'No end date'}
                                        </span>
                                        <div class="license-item-actions" style="pointer-events: auto;">
                                            ${hasPdf ? `
                                                <a href="${lease.pdfUrl}" target="_blank" class="btn-icon-sm" onclick="event.stopPropagation();" title="View PDF" style="pointer-events: auto;">
                                                    <i class="fas fa-file-pdf"></i>
                                                </a>
                                            ` : ''}
                                            ${isAdmin ? `
                                                <button class="btn-icon-sm" onclick="event.stopPropagation(); deleteLease('${lease.firestoreId}')" title="Delete" style="pointer-events: auto;">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function formatLeaseDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderLeasesList() {
    let filteredLeases = firebaseLeases;

    // Apply store filter
    if (leaseStoreFilter !== 'all') {
        filteredLeases = filteredLeases.filter(l => l.storeId === leaseStoreFilter);
    }

    // Apply search filter
    if (leaseSearchTerm) {
        const term = leaseSearchTerm.toLowerCase();
        filteredLeases = filteredLeases.filter(l =>
            l.storeName.toLowerCase().includes(term) ||
            (l.address && l.address.toLowerCase().includes(term)) ||
            (l.landlord && l.landlord.toLowerCase().includes(term))
        );
    }

    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager');

    if (filteredLeases.length === 0) {
        return `
            <div class="card">
                <div class="card-body" style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-file-contract" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px; display: block;"></i>
                    <div style="font-size: 16px; color: var(--text-muted);">No leases found</div>
                    <div style="font-size: 14px; color: var(--text-muted); margin-top: 8px;">
                        ${isAdmin ? 'Click "Add Lease" to add a new lease contract' : 'No lease contracts have been added yet'}
                    </div>
                </div>
            </div>
        `;
    }

    const storeColors = {
        'miramar': '#6366f1',
        'morena': '#8b5cf6',
        'kearny-mesa': '#3b82f6',
        'chula-vista': '#10b981',
        'north-park': '#f59e0b',
        'miramar-wine-liquor': '#ef4444'
    };

    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px;">
            ${filteredLeases.map(lease => {
                const storeColor = storeColors[lease.storeId] || 'var(--accent-primary)';
                const storeInfo = STORE_LOCATIONS.find(s => s.id === lease.storeId);
                const isLiquor = storeInfo && storeInfo.type === 'liquor';

                // Calculate lease status
                const today = new Date();
                const endDate = lease.endDate ? new Date(lease.endDate) : null;
                const daysUntilEnd = endDate ? Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)) : null;
                let statusBadge = '';
                if (daysUntilEnd !== null) {
                    if (daysUntilEnd < 0) {
                        statusBadge = '<span class="badge" style="background: #ef4444;">Expired</span>';
                    } else if (daysUntilEnd <= 90) {
                        statusBadge = '<span class="badge" style="background: #f59e0b;">Expiring Soon</span>';
                    } else {
                        statusBadge = '<span class="badge" style="background: #10b981;">Active</span>';
                    }
                }

                return `
                <div class="card" style="cursor: pointer; transition: all 0.2s; border-left: 4px solid ${storeColor};" onclick="viewLeaseDetails('${lease.firestoreId}')">
                    <div class="card-body">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                            <div style="display: flex; align-items: start; gap: 14px; flex: 1;">
                                <div style="width: 56px; height: 56px; border-radius: 10px; background: linear-gradient(135deg, ${storeColor}, ${storeColor}88); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <i class="fas ${isLiquor ? 'fa-wine-bottle' : 'fa-store'}" style="font-size: 22px; color: white;"></i>
                                </div>
                                <div style="flex: 1; min-width: 0;">
                                    <h3 style="font-size: 17px; font-weight: 600; margin-bottom: 6px; color: var(--text-primary);">
                                        ${lease.storeName}
                                    </h3>
                                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                        ${statusBadge}
                                        <span class="badge" style="background: ${isLiquor ? '#a855f7' : '#6366f1'};">
                                            ${isLiquor ? 'Liquor Store' : 'Vape Shop'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <i class="fas fa-chevron-right" style="color: var(--text-muted); font-size: 14px;"></i>
                        </div>

                        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);">
                            <div style="display: grid; gap: 8px;">
                                ${lease.address ? `
                                    <div style="display: flex; align-items: start; gap: 8px; font-size: 14px;">
                                        <i class="fas fa-map-marker-alt" style="width: 16px; color: var(--text-muted); margin-top: 2px;"></i>
                                        <span style="color: var(--text-secondary);">${lease.address}</span>
                                    </div>
                                ` : ''}
                                ${lease.landlord ? `
                                    <div style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
                                        <i class="fas fa-user-tie" style="width: 16px; color: var(--text-muted);"></i>
                                        <span style="color: var(--text-secondary);">${lease.landlord}</span>
                                    </div>
                                ` : ''}
                                ${lease.monthlyRent ? `
                                    <div style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
                                        <i class="fas fa-dollar-sign" style="width: 16px; color: var(--text-muted);"></i>
                                        <span style="color: var(--text-secondary);">$${parseFloat(lease.monthlyRent).toLocaleString()}/month</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 12px; color: var(--text-muted);">
                                ${lease.startDate ? `${formatDate(lease.startDate)}` : 'No start date'}
                                ${lease.endDate ? ` - ${formatDate(lease.endDate)}` : ''}
                            </div>
                            ${lease.pdfUrl ? `
                                <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--accent-primary);">
                                    <i class="fas fa-file-pdf"></i>
                                    <span>PDF</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
}

function searchLeases(searchTerm) {
    leaseSearchTerm = searchTerm;
    const leasesList = document.getElementById('leases-list');
    if (leasesList) {
        leasesList.innerHTML = renderLeasesList();
    }
}

function filterLeasesByStore(storeId) {
    leaseStoreFilter = storeId;
    const leasesList = document.getElementById('leases-list');
    if (leasesList) {
        leasesList.innerHTML = renderLeasesList();
    }
}

function formatDate(dateStr) {
    if (!dateStr) return 'Not Specified';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Not Specified';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function closeLeaseModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Add lease modal styles if not exists
if (!document.getElementById('lease-modal-styles')) {
    const leaseModalStyles = document.createElement('style');
    leaseModalStyles.id = 'lease-modal-styles';
    leaseModalStyles.textContent = `
        .lease-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s;
        }
        .lease-modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        .lease-modal-overlay .lease-modal {
            background: var(--bg-card, #1e1e2e);
            border-radius: 16px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow: hidden;
            transform: scale(0.9);
            transition: transform 0.3s;
            box-shadow: 0 25px 80px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
        }
        .lease-modal-overlay.active .lease-modal {
            transform: scale(1);
        }
        .lease-modal .modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid var(--border-color, #333);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .lease-modal .modal-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary, #fff);
        }
        .lease-modal .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--text-muted, #888);
            padding: 0;
            line-height: 1;
        }
        .lease-modal .modal-close:hover {
            color: var(--text-primary, #fff);
        }
        .lease-modal .modal-body {
            padding: 24px;
            overflow-y: auto;
            flex: 1;
        }
        .lease-modal .modal-footer {
            padding: 16px 24px;
            border-top: 1px solid var(--border-color, #333);
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }
    `;
    document.head.appendChild(leaseModalStyles);
}

function openAddLeaseModal() {
    const modal = document.createElement('div');
    modal.className = 'lease-modal-overlay';
    modal.id = 'add-lease-modal';
    modal.innerHTML = `
        <div class="lease-modal">
            <div class="modal-header">
                <h3>Add New Lease</h3>
                <button class="modal-close" onclick="closeLeaseModal('add-lease-modal')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Store Location *</label>
                    <select class="form-input" id="lease-store" required>
                        <option value="">Select Store</option>
                        ${STORE_LOCATIONS.map(store => `
                            <option value="${store.id}">${store.name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Property Address</label>
                    <input type="text" class="form-input" id="lease-address" placeholder="Full property address">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Lease Start Date</label>
                        <input type="date" class="form-input" id="lease-start-date">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Lease End Date</label>
                        <input type="date" class="form-input" id="lease-end-date">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Monthly Rent ($)</label>
                        <input type="number" class="form-input" id="lease-rent" placeholder="0.00" step="0.01">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Security Deposit ($)</label>
                        <input type="number" class="form-input" id="lease-deposit" placeholder="0.00" step="0.01">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Landlord / Property Manager</label>
                    <input type="text" class="form-input" id="lease-landlord" placeholder="Name of landlord or property management company">
                </div>
                <div class="form-group">
                    <label class="form-label">Landlord Phone</label>
                    <input type="tel" class="form-input" id="lease-landlord-phone" placeholder="(555) 123-4567">
                </div>
                <div class="form-group">
                    <label class="form-label">Landlord Email</label>
                    <input type="email" class="form-input" id="lease-landlord-email" placeholder="landlord@example.com">
                </div>
                <div class="form-group">
                    <label class="form-label">Lease Contract (PDF)</label>
                    <div style="border: 2px dashed var(--border-color); border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s;"
                         id="pdf-upload-area"
                         onclick="document.getElementById('lease-pdf-input').click()">
                        <i class="fas fa-file-pdf" style="font-size: 32px; color: var(--text-muted); margin-bottom: 8px;"></i>
                        <div style="color: var(--text-secondary); font-size: 14px;">Click to upload PDF</div>
                        <div style="color: var(--text-muted); font-size: 12px; margin-top: 4px;">Max file size: 10MB</div>
                        <input type="file" id="lease-pdf-input" accept=".pdf" style="display: none;" onchange="handleLeasePdfSelect(this)">
                    </div>
                    <div id="pdf-file-name" style="margin-top: 8px; font-size: 14px; color: var(--accent-primary); display: none;">
                        <i class="fas fa-check-circle"></i> <span></span>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea class="form-input" id="lease-notes" rows="3" placeholder="Additional notes about this lease..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeLeaseModal('add-lease-modal')">Cancel</button>
                <button class="btn-primary" onclick="saveLease()">
                    <i class="fas fa-save"></i> Save Lease
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

let selectedLeasePdf = null;

function handleLeasePdfSelect(input) {
    const file = input.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            showToast('File too large. Maximum size is 10MB.', 'error');
            return;
        }
        if (file.type !== 'application/pdf') {
            showToast('Please select a PDF file.', 'error');
            return;
        }
        selectedLeasePdf = file;
        const fileName = document.getElementById('pdf-file-name');
        fileName.style.display = 'block';
        fileName.querySelector('span').textContent = file.name;
        document.getElementById('pdf-upload-area').style.borderColor = 'var(--accent-primary)';
        document.getElementById('pdf-upload-area').style.background = 'rgba(99, 102, 241, 0.1)';
    }
}

async function uploadLeasePdf(file, leaseId) {
    try {
        const storage = firebase.storage();
        const fileRef = storage.ref(`leases/${leaseId}/${file.name}`);
        const snapshot = await fileRef.put(file);
        const downloadUrl = await snapshot.ref.getDownloadURL();
        return downloadUrl;
    } catch (error) {
        console.error('Error uploading PDF:', error);
        throw error;
    }
}

async function saveLease() {
    const db = firebase.firestore();
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

    const storeId = document.getElementById('lease-store').value;
    if (!storeId) {
        showToast('Please select a store location', 'error');
        return;
    }

    const store = STORE_LOCATIONS.find(s => s.id === storeId);

    const leaseData = {
        storeId: storeId,
        storeName: store.name,
        storeType: store.type,
        address: document.getElementById('lease-address').value.trim(),
        startDate: document.getElementById('lease-start-date').value,
        endDate: document.getElementById('lease-end-date').value,
        monthlyRent: document.getElementById('lease-rent').value,
        securityDeposit: document.getElementById('lease-deposit').value,
        landlord: document.getElementById('lease-landlord').value.trim(),
        landlordPhone: document.getElementById('lease-landlord-phone').value.trim(),
        landlordEmail: document.getElementById('lease-landlord-email').value.trim(),
        notes: document.getElementById('lease-notes').value.trim(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: currentUser?.uid || 'unknown'
    };

    try {
        // Save lease to Firestore first
        const docRef = await db.collection('leases').add(leaseData);

        // Upload PDF if selected
        if (selectedLeasePdf) {
            showToast('Uploading PDF...', 'info');
            const pdfUrl = await uploadLeasePdf(selectedLeasePdf, docRef.id);
            await db.collection('leases').doc(docRef.id).update({
                pdfUrl: pdfUrl,
                pdfFileName: selectedLeasePdf.name
            });
        }

        selectedLeasePdf = null;
        closeLeaseModal('add-lease-modal');
        showToast('Lease saved successfully!', 'success');
        renderLeases();
    } catch (error) {
        console.error('Error saving lease:', error);
        showToast('Error saving lease. Please try again.', 'error');
    }
}

async function viewLeaseDetails(leaseId) {
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

    const lease = firebaseLeases.find(l => l.firestoreId === leaseId);
    if (!lease) {
        showToast('Lease not found', 'error');
        return;
    }

    const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager');
    const storeInfo = STORE_LOCATIONS.find(s => s.id === lease.storeId);
    const isLiquor = storeInfo && storeInfo.type === 'liquor';

    // Calculate lease status
    const today = new Date();
    const endDate = lease.endDate ? new Date(lease.endDate) : null;
    const daysUntilEnd = endDate ? Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)) : null;
    let statusBadge = '';
    let statusText = '';
    if (daysUntilEnd !== null) {
        if (daysUntilEnd < 0) {
            statusBadge = '<span class="badge" style="background: #ef4444; font-size: 14px; padding: 6px 12px;">Expired</span>';
            statusText = `Expired ${Math.abs(daysUntilEnd)} days ago`;
        } else if (daysUntilEnd <= 90) {
            statusBadge = '<span class="badge" style="background: #f59e0b; font-size: 14px; padding: 6px 12px;">Expiring Soon</span>';
            statusText = `Expires in ${daysUntilEnd} days`;
        } else {
            statusBadge = '<span class="badge" style="background: #10b981; font-size: 14px; padding: 6px 12px;">Active</span>';
            statusText = `${daysUntilEnd} days remaining`;
        }
    }

    const modal = document.createElement('div');
    modal.className = 'lease-modal-overlay';
    modal.id = 'view-lease-modal';
    modal.innerHTML = `
        <div class="lease-modal" style="max-width: 700px;">
            <div class="modal-header">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 48px; height: 48px; border-radius: 10px; background: linear-gradient(135deg, var(--accent-primary), #7c3aed); display: flex; align-items: center; justify-content: center;">
                        <i class="fas ${isLiquor ? 'fa-wine-bottle' : 'fa-store'}" style="font-size: 20px; color: white;"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0;">${lease.storeName}</h3>
                        <div style="display: flex; gap: 8px; margin-top: 4px;">
                            ${statusBadge}
                        </div>
                    </div>
                </div>
                <button class="modal-close" onclick="closeLeaseModal('view-lease-modal')">&times;</button>
            </div>
            <div class="modal-body" style="padding: 0;">
                <!-- Status Banner -->
                ${statusText ? `
                    <div style="background: var(--bg-secondary); padding: 16px 24px; border-bottom: 1px solid var(--border-color);">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-calendar-alt" style="color: var(--text-muted);"></i>
                            <span style="color: var(--text-secondary);">${statusText}</span>
                        </div>
                    </div>
                ` : ''}

                <div style="padding: 24px;">
                    <!-- Property Details -->
                    <div style="margin-bottom: 24px;">
                        <h4 style="font-size: 14px; color: var(--text-muted); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Property Details</h4>
                        <div class="card" style="background: var(--bg-secondary);">
                            <div class="card-body" style="padding: 16px;">
                                <div style="display: grid; gap: 12px;">
                                    ${lease.address ? `
                                        <div style="display: flex; align-items: start; gap: 12px;">
                                            <i class="fas fa-map-marker-alt" style="width: 20px; color: var(--accent-primary); margin-top: 2px;"></i>
                                            <div>
                                                <div style="font-size: 12px; color: var(--text-muted);">Address</div>
                                                <div style="color: var(--text-primary);">${lease.address}</div>
                                            </div>
                                        </div>
                                    ` : ''}
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                        <div style="display: flex; align-items: start; gap: 12px;">
                                            <i class="fas fa-calendar-check" style="width: 20px; color: var(--accent-primary); margin-top: 2px;"></i>
                                            <div>
                                                <div style="font-size: 12px; color: var(--text-muted);">Start Date</div>
                                                <div style="color: var(--text-primary);">${lease.startDate ? formatDate(lease.startDate) : 'Not set'}</div>
                                            </div>
                                        </div>
                                        <div style="display: flex; align-items: start; gap: 12px;">
                                            <i class="fas fa-calendar-times" style="width: 20px; color: var(--accent-primary); margin-top: 2px;"></i>
                                            <div>
                                                <div style="font-size: 12px; color: var(--text-muted);">End Date</div>
                                                <div style="color: var(--text-primary);">${lease.endDate ? formatDate(lease.endDate) : 'Not set'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Financial Details -->
                    <div style="margin-bottom: 24px;">
                        <h4 style="font-size: 14px; color: var(--text-muted); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Financial Details</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="card" style="background: var(--bg-secondary);">
                                <div class="card-body" style="padding: 16px; text-align: center;">
                                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Monthly Rent</div>
                                    <div style="font-size: 24px; font-weight: 700; color: var(--accent-primary);">
                                        ${lease.monthlyRent ? '$' + parseFloat(lease.monthlyRent).toLocaleString() : 'N/A'}
                                    </div>
                                </div>
                            </div>
                            <div class="card" style="background: var(--bg-secondary);">
                                <div class="card-body" style="padding: 16px; text-align: center;">
                                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Security Deposit</div>
                                    <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">
                                        ${lease.securityDeposit ? '$' + parseFloat(lease.securityDeposit).toLocaleString() : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Landlord Info -->
                    ${(lease.landlord || lease.landlordPhone || lease.landlordEmail) ? `
                        <div style="margin-bottom: 24px;">
                            <h4 style="font-size: 14px; color: var(--text-muted); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Landlord Information</h4>
                            <div class="card" style="background: var(--bg-secondary);">
                                <div class="card-body" style="padding: 16px;">
                                    <div style="display: grid; gap: 12px;">
                                        ${lease.landlord ? `
                                            <div style="display: flex; align-items: center; gap: 12px;">
                                                <i class="fas fa-user-tie" style="width: 20px; color: var(--accent-primary);"></i>
                                                <div>
                                                    <div style="font-size: 12px; color: var(--text-muted);">Name</div>
                                                    <div style="color: var(--text-primary);">${lease.landlord}</div>
                                                </div>
                                            </div>
                                        ` : ''}
                                        ${lease.landlordPhone ? `
                                            <div style="display: flex; align-items: center; gap: 12px;">
                                                <i class="fas fa-phone" style="width: 20px; color: var(--accent-primary);"></i>
                                                <div>
                                                    <div style="font-size: 12px; color: var(--text-muted);">Phone</div>
                                                    <a href="tel:${lease.landlordPhone}" style="color: var(--accent-primary);">${lease.landlordPhone}</a>
                                                </div>
                                            </div>
                                        ` : ''}
                                        ${lease.landlordEmail ? `
                                            <div style="display: flex; align-items: center; gap: 12px;">
                                                <i class="fas fa-envelope" style="width: 20px; color: var(--accent-primary);"></i>
                                                <div>
                                                    <div style="font-size: 12px; color: var(--text-muted);">Email</div>
                                                    <a href="mailto:${lease.landlordEmail}" style="color: var(--accent-primary);">${lease.landlordEmail}</a>
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Lease Contract PDF -->
                    ${lease.pdfUrl ? `
                        <div style="margin-bottom: 24px;">
                            <h4 style="font-size: 14px; color: var(--text-muted); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Lease Contract</h4>
                            <div class="card" style="background: var(--bg-secondary);">
                                <div class="card-body" style="padding: 16px;">
                                    <div style="display: flex; align-items: center; justify-content: space-between;">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <div style="width: 44px; height: 44px; border-radius: 8px; background: linear-gradient(135deg, #ef4444, #dc2626); display: flex; align-items: center; justify-content: center;">
                                                <i class="fas fa-file-pdf" style="font-size: 20px; color: white;"></i>
                                            </div>
                                            <div>
                                                <div style="font-weight: 600; color: var(--text-primary);">${lease.pdfFileName || 'Lease Contract.pdf'}</div>
                                                <div style="font-size: 12px; color: var(--text-muted);">PDF Document</div>
                                            </div>
                                        </div>
                                        <div style="display: flex; gap: 8px;">
                                            <a href="${lease.pdfUrl}" target="_blank" class="btn-secondary" style="text-decoration: none;">
                                                <i class="fas fa-external-link-alt"></i> View
                                            </a>
                                            <a href="${lease.pdfUrl}" download="${lease.pdfFileName || 'lease.pdf'}" class="btn-primary" style="text-decoration: none;">
                                                <i class="fas fa-download"></i> Download
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Notes -->
                    ${lease.notes ? `
                        <div>
                            <h4 style="font-size: 14px; color: var(--text-muted); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Notes</h4>
                            <div class="card" style="background: var(--bg-secondary);">
                                <div class="card-body" style="padding: 16px;">
                                    <p style="color: var(--text-secondary); line-height: 1.6; margin: 0; white-space: pre-wrap;">${lease.notes}</p>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="modal-footer" style="display: flex; justify-content: space-between;">
                <div>
                    ${isAdmin ? `
                        <button class="btn-secondary" style="color: #ef4444;" onclick="deleteLease('${lease.firestoreId}')">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    ` : ''}
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-secondary" onclick="closeLeaseModal('view-lease-modal')">Close</button>
                    ${isAdmin ? `
                        <button class="btn-primary" onclick="editLease('${lease.firestoreId}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

async function editLease(leaseId) {
    closeLeaseModal('view-lease-modal');

    const lease = firebaseLeases.find(l => l.firestoreId === leaseId);
    if (!lease) {
        showToast('Lease not found', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'lease-modal-overlay';
    modal.id = 'edit-lease-modal';
    modal.innerHTML = `
        <div class="lease-modal">
            <div class="modal-header">
                <h3>Edit Lease</h3>
                <button class="modal-close" onclick="closeLeaseModal('edit-lease-modal')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Store Location *</label>
                    <select class="form-input" id="edit-lease-store" required>
                        <option value="">Select Store</option>
                        ${STORE_LOCATIONS.map(store => `
                            <option value="${store.id}" ${lease.storeId === store.id ? 'selected' : ''}>${store.name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Property Address</label>
                    <input type="text" class="form-input" id="edit-lease-address" placeholder="Full property address" value="${lease.address || ''}">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Lease Start Date</label>
                        <input type="date" class="form-input" id="edit-lease-start-date" value="${lease.startDate || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Lease End Date</label>
                        <input type="date" class="form-input" id="edit-lease-end-date" value="${lease.endDate || ''}">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Monthly Rent ($)</label>
                        <input type="number" class="form-input" id="edit-lease-rent" placeholder="0.00" step="0.01" value="${lease.monthlyRent || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Security Deposit ($)</label>
                        <input type="number" class="form-input" id="edit-lease-deposit" placeholder="0.00" step="0.01" value="${lease.securityDeposit || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Landlord / Property Manager</label>
                    <input type="text" class="form-input" id="edit-lease-landlord" placeholder="Name of landlord or property management company" value="${lease.landlord || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Landlord Phone</label>
                    <input type="tel" class="form-input" id="edit-lease-landlord-phone" placeholder="(555) 123-4567" value="${lease.landlordPhone || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Landlord Email</label>
                    <input type="email" class="form-input" id="edit-lease-landlord-email" placeholder="landlord@example.com" value="${lease.landlordEmail || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Lease Contract (PDF)</label>
                    ${lease.pdfUrl ? `
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                            <i class="fas fa-file-pdf" style="font-size: 24px; color: #ef4444;"></i>
                            <div style="flex: 1;">
                                <div style="font-size: 14px; color: var(--text-primary);">${lease.pdfFileName || 'Lease Contract.pdf'}</div>
                                <div style="font-size: 12px; color: var(--text-muted);">Current document</div>
                            </div>
                            <a href="${lease.pdfUrl}" target="_blank" class="btn-secondary" style="font-size: 12px; padding: 6px 12px;">
                                <i class="fas fa-eye"></i> View
                            </a>
                        </div>
                    ` : ''}
                    <div style="border: 2px dashed var(--border-color); border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s;"
                         id="edit-pdf-upload-area"
                         onclick="document.getElementById('edit-lease-pdf-input').click()">
                        <i class="fas fa-file-pdf" style="font-size: 32px; color: var(--text-muted); margin-bottom: 8px;"></i>
                        <div style="color: var(--text-secondary); font-size: 14px;">${lease.pdfUrl ? 'Upload new PDF (replaces current)' : 'Click to upload PDF'}</div>
                        <div style="color: var(--text-muted); font-size: 12px; margin-top: 4px;">Max file size: 10MB</div>
                        <input type="file" id="edit-lease-pdf-input" accept=".pdf" style="display: none;" onchange="handleEditLeasePdfSelect(this)">
                    </div>
                    <div id="edit-pdf-file-name" style="margin-top: 8px; font-size: 14px; color: var(--accent-primary); display: none;">
                        <i class="fas fa-check-circle"></i> <span></span>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea class="form-input" id="edit-lease-notes" rows="3" placeholder="Additional notes about this lease...">${lease.notes || ''}</textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeLeaseModal('edit-lease-modal')">Cancel</button>
                <button class="btn-primary" onclick="updateLease('${leaseId}')">
                    <i class="fas fa-save"></i> Update Lease
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

let editSelectedLeasePdf = null;

function handleEditLeasePdfSelect(input) {
    const file = input.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            showToast('File too large. Maximum size is 10MB.', 'error');
            return;
        }
        if (file.type !== 'application/pdf') {
            showToast('Please select a PDF file.', 'error');
            return;
        }
        editSelectedLeasePdf = file;
        const fileName = document.getElementById('edit-pdf-file-name');
        fileName.style.display = 'block';
        fileName.querySelector('span').textContent = file.name;
        document.getElementById('edit-pdf-upload-area').style.borderColor = 'var(--accent-primary)';
        document.getElementById('edit-pdf-upload-area').style.background = 'rgba(99, 102, 241, 0.1)';
    }
}

async function updateLease(leaseId) {
    const db = firebase.firestore();
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

    const storeId = document.getElementById('edit-lease-store').value;
    if (!storeId) {
        showToast('Please select a store location', 'error');
        return;
    }

    const store = STORE_LOCATIONS.find(s => s.id === storeId);

    const leaseData = {
        storeId: storeId,
        storeName: store.name,
        storeType: store.type,
        address: document.getElementById('edit-lease-address').value.trim(),
        startDate: document.getElementById('edit-lease-start-date').value,
        endDate: document.getElementById('edit-lease-end-date').value,
        monthlyRent: document.getElementById('edit-lease-rent').value,
        securityDeposit: document.getElementById('edit-lease-deposit').value,
        landlord: document.getElementById('edit-lease-landlord').value.trim(),
        landlordPhone: document.getElementById('edit-lease-landlord-phone').value.trim(),
        landlordEmail: document.getElementById('edit-lease-landlord-email').value.trim(),
        notes: document.getElementById('edit-lease-notes').value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: currentUser?.uid || 'unknown'
    };

    try {
        // Upload new PDF if selected
        if (editSelectedLeasePdf) {
            showToast('Uploading PDF...', 'info');
            const pdfUrl = await uploadLeasePdf(editSelectedLeasePdf, leaseId);
            leaseData.pdfUrl = pdfUrl;
            leaseData.pdfFileName = editSelectedLeasePdf.name;
        }

        await db.collection('leases').doc(leaseId).update(leaseData);

        editSelectedLeasePdf = null;
        closeLeaseModal('edit-lease-modal');
        showToast('Lease updated successfully!', 'success');
        renderLeases();
    } catch (error) {
        console.error('Error updating lease:', error);
        showToast('Error updating lease. Please try again.', 'error');
    }
}

async function deleteLease(leaseId) {
    if (!confirm('Are you sure you want to delete this lease? This action cannot be undone.')) {
        return;
    }

    try {
        const db = firebase.firestore();
        await db.collection('leases').doc(leaseId).delete();
        closeLeaseModal('view-lease-modal');
        showToast('Lease deleted successfully', 'success');
        renderLeases();
    } catch (error) {
        console.error('Error deleting lease:', error);
        showToast('Error deleting lease. Please try again.', 'error');
    }
}

