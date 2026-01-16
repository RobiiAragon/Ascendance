// ==========================================
// SHIFT EXCHANGE / COVERAGE REQUEST SYSTEM
// ==========================================

const SHIFT_EXCHANGE_STATUS = {
    pending: { label: 'Looking for Coverage', color: '#f59e0b', icon: 'fa-clock', description: 'Waiting for someone to cover' },
    accepted: { label: 'Coverage Found', color: '#3b82f6', icon: 'fa-user-check', description: 'Someone agreed to cover, awaiting approval' },
    approved: { label: 'Approved', color: '#10b981', icon: 'fa-check-circle', description: 'Manager approved the exchange' },
    rejected: { label: 'Rejected', color: '#ef4444', icon: 'fa-times-circle', description: 'Request was rejected' },
    cancelled: { label: 'Cancelled', color: '#6b7280', icon: 'fa-ban', description: 'Request was cancelled' }
};

const SHIFT_URGENCY = {
    normal: { label: 'Normal', color: '#6b7280', icon: 'fa-clock' },
    urgent: { label: 'Urgent', color: '#f59e0b', icon: 'fa-exclamation-triangle' },
    emergency: { label: 'Emergency', color: '#ef4444', icon: 'fa-exclamation-circle' }
};

let shiftExchanges = [];
let shiftExchangeFilter = 'all';

/**
 * Parse a YYYY-MM-DD date string as LOCAL time (not UTC)
 */
function parseLocalDateSE(dateString) {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Format date for display
 */
function formatDateSE(dateString) {
    if (!dateString) return 'N/A';
    const date = parseLocalDateSE(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Format time for display (24h to 12h)
 */
function formatTimeSE(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Initialize Shift Exchange Manager
 */
async function initializeShiftExchangeManager() {
    try {
        if (typeof firebaseShiftExchangeManager !== 'undefined') {
            await firebaseShiftExchangeManager.initialize();
            console.log('Shift Exchange Manager initialized');
        }
    } catch (error) {
        console.error('Error initializing Shift Exchange Manager:', error);
    }
}

/**
 * Load shift exchanges from Firestore
 */
async function loadShiftExchanges() {
    try {
        if (typeof firebaseShiftExchangeManager !== 'undefined' && firebaseShiftExchangeManager.isInitialized) {
            shiftExchanges = await firebaseShiftExchangeManager.loadShiftExchanges();
        }
        return shiftExchanges;
    } catch (error) {
        console.error('Error loading shift exchanges:', error);
        return [];
    }
}

/**
 * Get pending count for badge
 */
function getShiftExchangePendingCount() {
    const currentUser = getCurrentUser();
    if (!currentUser) return 0;

    const isManager = currentUser.role === 'admin' || currentUser.role === 'manager';

    if (isManager) {
        // Managers see count of requests awaiting their approval
        return shiftExchanges.filter(e => e.status === 'accepted').length;
    } else {
        // Employees see count of open requests they could cover
        return shiftExchanges.filter(e => e.status === 'pending' && e.requesterId !== currentUser.odooEmployeeId).length;
    }
}

/**
 * Update badge in navigation
 */
function updateShiftExchangeBadge() {
    const badge = document.getElementById('shift-exchange-badge');
    if (badge) {
        const count = getShiftExchangePendingCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
}

/**
 * Render Shift Exchanges Page
 */
async function renderShiftExchangesPage() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    await loadShiftExchanges();
    const currentUser = getCurrentUser();
    const isManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';

    // Filter exchanges
    let filteredExchanges = [...shiftExchanges];
    if (shiftExchangeFilter !== 'all') {
        filteredExchanges = filteredExchanges.filter(e => e.status === shiftExchangeFilter);
    }

    // Count by status
    const pendingCount = shiftExchanges.filter(e => e.status === 'pending').length;
    const acceptedCount = shiftExchanges.filter(e => e.status === 'accepted').length;
    const approvedCount = shiftExchanges.filter(e => e.status === 'approved').length;
    const rejectedCount = shiftExchanges.filter(e => e.status === 'rejected').length;

    mainContent.innerHTML = `
        <div class="page-container">
            <div class="page-header" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 16px;">
                <div class="page-title">
                    <h1><i class="fas fa-people-arrows" style="color: #8b5cf6;"></i> Shift Exchanges <span style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; font-size: 11px; padding: 3px 8px; border-radius: 4px; margin-left: 8px; font-weight: 600; vertical-align: middle;">BETA</span></h1>
                    <p class="page-subtitle">Request coverage for your shifts or help cover for others <span style="color: var(--text-muted); font-style: italic;">- Feature in testing, full launch coming soon!</span></p>
                </div>
                <div class="page-actions">
                    <button class="btn-primary" onclick="openRequestCoverageModal()" style="white-space: nowrap;">
                        <i class="fas fa-plus"></i> Request Coverage
                    </button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                <div class="stat-card" style="background: var(--bg-card); border-radius: 12px; padding: 16px; border: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas fa-clock" style="color: #f59e0b; font-size: 18px;"></i>
                        </div>
                        <div style="min-width: 0;">
                            <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${pendingCount}</div>
                            <div style="font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Looking</div>
                        </div>
                    </div>
                </div>
                <div class="stat-card" style="background: var(--bg-card); border-radius: 12px; padding: 16px; border: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas fa-user-check" style="color: #3b82f6; font-size: 18px;"></i>
                        </div>
                        <div style="min-width: 0;">
                            <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${acceptedCount}</div>
                            <div style="font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Pending Approval</div>
                        </div>
                    </div>
                </div>
                <div class="stat-card" style="background: var(--bg-card); border-radius: 12px; padding: 16px; border: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas fa-check-circle" style="color: #10b981; font-size: 18px;"></i>
                        </div>
                        <div style="min-width: 0;">
                            <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${approvedCount}</div>
                            <div style="font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Approved</div>
                        </div>
                    </div>
                </div>
                <div class="stat-card" style="background: var(--bg-card); border-radius: 12px; padding: 16px; border: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(239, 68, 68, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas fa-times-circle" style="color: #ef4444; font-size: 18px;"></i>
                        </div>
                        <div style="min-width: 0;">
                            <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${rejectedCount}</div>
                            <div style="font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Rejected</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filter Tabs -->
            <div class="filter-tabs" style="display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;">
                <button class="filter-tab ${shiftExchangeFilter === 'all' ? 'active' : ''}" onclick="setShiftExchangeFilter('all')">
                    All
                </button>
                <button class="filter-tab ${shiftExchangeFilter === 'pending' ? 'active' : ''}" onclick="setShiftExchangeFilter('pending')">
                    <i class="fas fa-clock"></i> Looking
                </button>
                <button class="filter-tab ${shiftExchangeFilter === 'accepted' ? 'active' : ''}" onclick="setShiftExchangeFilter('accepted')">
                    <i class="fas fa-user-check"></i> Pending Approval
                </button>
                <button class="filter-tab ${shiftExchangeFilter === 'approved' ? 'active' : ''}" onclick="setShiftExchangeFilter('approved')">
                    <i class="fas fa-check-circle"></i> Approved
                </button>
                <button class="filter-tab ${shiftExchangeFilter === 'rejected' ? 'active' : ''}" onclick="setShiftExchangeFilter('rejected')">
                    <i class="fas fa-times-circle"></i> Rejected
                </button>
            </div>

            <!-- Exchanges List -->
            <div class="exchanges-list">
                ${filteredExchanges.length === 0 ? `
                    <div class="empty-state" style="text-align: center; padding: 60px 20px; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color);">
                        <i class="fas fa-people-arrows" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                        <h3 style="color: var(--text-primary); margin-bottom: 8px;">No Requests</h3>
                        <p style="color: var(--text-muted);">No shift exchange requests found${shiftExchangeFilter !== 'all' ? ' with this filter' : ''}.</p>
                    </div>
                ` : filteredExchanges.map(exchange => renderShiftExchangeCard(exchange, currentUser, isManager)).join('')}
            </div>
        </div>

        <style>
            .filter-tab {
                padding: 8px 16px;
                border: 1px solid var(--border-color);
                background: var(--bg-card);
                color: var(--text-secondary);
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
            }
            .filter-tab:hover {
                background: var(--bg-main);
                border-color: var(--accent-primary);
            }
            .filter-tab.active {
                background: var(--accent-primary);
                color: white;
                border-color: var(--accent-primary);
            }
            .exchange-card {
                background: var(--bg-card);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 16px;
                border: 1px solid var(--border-color);
                transition: all 0.2s;
            }
            .exchange-card:hover {
                border-color: var(--accent-primary);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .exchange-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 16px;
                flex-wrap: wrap;
                gap: 12px;
            }
            .exchange-status {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                white-space: nowrap;
            }
            .exchange-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 16px;
            }
            .detail-item {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .detail-icon {
                width: 36px;
                height: 36px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                flex-shrink: 0;
            }
            .exchange-actions {
                display: flex;
                gap: 8px;
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid var(--border-color);
                flex-wrap: wrap;
            }
            .btn-cover {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .btn-approve {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .btn-reject {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .btn-cancel {
                background: var(--bg-main);
                color: var(--text-secondary);
                border: 1px solid var(--border-color);
                padding: 8px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .stats-grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                }
                .page-header {
                    flex-direction: column;
                    align-items: stretch !important;
                }
                .page-actions {
                    width: 100%;
                }
                .page-actions button {
                    width: 100%;
                    justify-content: center;
                }
                .exchange-details {
                    grid-template-columns: 1fr !important;
                }
                .exchange-actions {
                    flex-direction: column;
                }
                .exchange-actions button {
                    width: 100%;
                    justify-content: center;
                }
            }

            @media (max-width: 480px) {
                .stats-grid {
                    grid-template-columns: 1fr !important;
                }
                .filter-tabs {
                    flex-direction: column;
                }
                .filter-tab {
                    width: 100%;
                    justify-content: center;
                }
            }
        </style>
    `;

    updateShiftExchangeBadge();
}

/**
 * Render individual exchange card
 */
function renderShiftExchangeCard(exchange, currentUser, isManager) {
    const status = SHIFT_EXCHANGE_STATUS[exchange.status] || SHIFT_EXCHANGE_STATUS.pending;
    const urgency = SHIFT_URGENCY[exchange.urgency] || SHIFT_URGENCY.normal;

    const isRequester = currentUser?.odooEmployeeId === exchange.requesterId;
    const canCover = !isRequester && exchange.status === 'pending';
    const canApprove = isManager && exchange.status === 'accepted';
    const canCancel = isRequester && (exchange.status === 'pending' || exchange.status === 'accepted');

    return `
        <div class="exchange-card">
            <div class="exchange-header">
                <div>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px; flex-shrink: 0;">
                            ${exchange.requesterName?.substring(0, 2).toUpperCase() || '??'}
                        </div>
                        <div style="min-width: 0;">
                            <div style="font-weight: 600; color: var(--text-primary);">${exchange.requesterName || 'Unknown'}</div>
                            <div style="font-size: 13px; color: var(--text-muted);">${exchange.requesterStore || 'No store'}</div>
                        </div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    ${exchange.urgency !== 'normal' ? `
                        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: ${urgency.color}20; color: ${urgency.color};">
                            <i class="fas ${urgency.icon}"></i> ${urgency.label}
                        </span>
                    ` : ''}
                    <span class="exchange-status" style="background: ${status.color}20; color: ${status.color};">
                        <i class="fas ${status.icon}"></i> ${status.label}
                    </span>
                </div>
            </div>

            <div class="exchange-details">
                <div class="detail-item">
                    <div class="detail-icon" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">
                        <i class="fas fa-calendar"></i>
                    </div>
                    <div style="min-width: 0;">
                        <div style="font-size: 12px; color: var(--text-muted);">Shift Date</div>
                        <div style="font-weight: 600; color: var(--text-primary);">${formatDateSE(exchange.originalDate)}</div>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-icon" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6;">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div style="min-width: 0;">
                        <div style="font-size: 12px; color: var(--text-muted);">Shift Time</div>
                        <div style="font-weight: 600; color: var(--text-primary);">${formatTimeSE(exchange.originalStartTime)} - ${formatTimeSE(exchange.originalEndTime)}</div>
                    </div>
                </div>
                ${exchange.coverEmployeeName ? `
                    <div class="detail-item">
                        <div class="detail-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
                            <i class="fas fa-user-check"></i>
                        </div>
                        <div style="min-width: 0;">
                            <div style="font-size: 12px; color: var(--text-muted);">Covered By</div>
                            <div style="font-weight: 600; color: var(--text-primary);">${exchange.coverEmployeeName}</div>
                        </div>
                    </div>
                ` : ''}
            </div>

            ${exchange.reason ? `
                <div style="margin-top: 16px; padding: 12px; background: var(--bg-main); border-radius: 8px;">
                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Reason</div>
                    <div style="color: var(--text-secondary);">${exchange.reason}</div>
                </div>
            ` : ''}

            ${exchange.reviewNotes && (exchange.status === 'approved' || exchange.status === 'rejected') ? `
                <div style="margin-top: 12px; padding: 12px; background: ${exchange.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border-radius: 8px; border-left: 3px solid ${exchange.status === 'approved' ? '#10b981' : '#ef4444'};">
                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Manager Notes (${exchange.reviewedBy || 'Unknown'})</div>
                    <div style="color: var(--text-secondary);">${exchange.reviewNotes}</div>
                </div>
            ` : ''}

            ${(canCover || canApprove || canCancel) ? `
                <div class="exchange-actions">
                    ${canCover ? `
                        <button class="btn-cover" onclick="offerToCover('${exchange.id}')">
                            <i class="fas fa-hand-paper"></i> I'll Cover This Shift
                        </button>
                    ` : ''}
                    ${canApprove ? `
                        <button class="btn-approve" onclick="approveShiftExchange('${exchange.id}')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn-reject" onclick="rejectShiftExchange('${exchange.id}')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    ` : ''}
                    ${canCancel ? `
                        <button class="btn-cancel" onclick="cancelShiftExchange('${exchange.id}')">
                            <i class="fas fa-ban"></i> Cancel Request
                        </button>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Set filter for shift exchanges
 */
function setShiftExchangeFilter(filter) {
    shiftExchangeFilter = filter;
    renderShiftExchangesPage();
}

/**
 * Open modal to request coverage
 */
function openRequestCoverageModal() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Please log in to request coverage', 'error');
        return;
    }

    // Get current employee info
    const emp = employees.find(e => e.id === currentUser.odooEmployeeId || e.firestoreId === currentUser.odooEmployeeId);

    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    // Minimum date is tomorrow
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minDateStr = minDate.toISOString().split('T')[0];

    modalContent.innerHTML = `
        <div class="modal-header">
            <h2><i class="fas fa-people-arrows" style="color: #8b5cf6;"></i> Request Shift Coverage</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <div style="padding: 12px 16px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-info-circle" style="color: #8b5cf6; font-size: 18px;"></i>
                    <div>
                        <div style="font-weight: 600; color: #8b5cf6;">How It Works</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">Submit your request, wait for someone to cover, then a manager will approve it.</div>
                    </div>
                </div>
            </div>

            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 12px; background: var(--bg-main); border-radius: 8px;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; flex-shrink: 0;">
                    ${currentUser.name?.substring(0, 2).toUpperCase() || '??'}
                </div>
                <div style="min-width: 0;">
                    <div style="font-weight: 600;">${currentUser.name || 'Unknown'}</div>
                    <div style="font-size: 13px; color: var(--text-muted);">${emp?.store || currentUser.store || 'No store'}</div>
                </div>
            </div>

            <div class="form-group">
                <label>Urgency Level</label>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    ${Object.entries(SHIFT_URGENCY).map(([key, config]) => `
                        <label class="urgency-option" style="display: flex; align-items: center; gap: 8px; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                            <input type="radio" name="urgency" value="${key}" ${key === 'normal' ? 'checked' : ''} style="display: none;">
                            <i class="fas ${config.icon}" style="color: ${config.color};"></i>
                            <span>${config.label}</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <div class="form-group">
                <label>Shift Date *</label>
                <input type="date" class="form-input" id="exchange-date" min="${minDateStr}" required>
            </div>

            <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group">
                    <label>Start Time *</label>
                    <input type="time" class="form-input" id="exchange-start-time" required>
                </div>
                <div class="form-group">
                    <label>End Time *</label>
                    <input type="time" class="form-input" id="exchange-end-time" required>
                </div>
            </div>

            <div class="form-group">
                <label>Reason / Notes *</label>
                <textarea class="form-input" id="exchange-reason" rows="3" placeholder="Please explain why you need coverage for this shift..." required></textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="submitCoverageRequest()" style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);">
                <i class="fas fa-paper-plane"></i> Submit Request
            </button>
        </div>

        <style>
            .urgency-option:has(input:checked) {
                background: var(--bg-main);
                border-color: var(--accent-primary);
            }
            .urgency-option:hover {
                background: var(--bg-main);
            }
            @media (max-width: 480px) {
                .form-row {
                    grid-template-columns: 1fr !important;
                }
                .urgency-option span {
                    font-size: 12px;
                }
            }
        </style>
    `;

    modal.classList.add('active');

    // Add click handlers for urgency options
    document.querySelectorAll('.urgency-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.urgency-option').forEach(o => o.style.borderColor = 'var(--border-color)');
            option.style.borderColor = 'var(--accent-primary)';
        });
    });
}

/**
 * Submit coverage request
 */
async function submitCoverageRequest() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Please log in to submit a request', 'error');
        return;
    }

    const urgency = document.querySelector('input[name="urgency"]:checked')?.value || 'normal';
    const date = document.getElementById('exchange-date')?.value;
    const startTime = document.getElementById('exchange-start-time')?.value;
    const endTime = document.getElementById('exchange-end-time')?.value;
    const reason = document.getElementById('exchange-reason')?.value;

    if (!date || !startTime || !endTime) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }

    if (!reason?.trim()) {
        showNotification('Please provide a reason for your request', 'warning');
        return;
    }

    const emp = employees.find(e => e.id === currentUser.odooEmployeeId || e.firestoreId === currentUser.odooEmployeeId);

    const requestData = {
        requesterId: currentUser.odooEmployeeId || currentUser.odooEmployeeId,
        requesterName: currentUser.name,
        requesterStore: emp?.store || currentUser.store || '',
        originalDate: date,
        originalStartTime: startTime,
        originalEndTime: endTime,
        urgency: urgency,
        reason: reason.trim(),
        status: 'pending',
        coverEmployeeId: null,
        coverEmployeeName: null,
        acceptedAt: null,
        reviewedAt: null,
        reviewedBy: null,
        reviewNotes: ''
    };

    try {
        const docId = await firebaseShiftExchangeManager.addShiftExchange(requestData);
        if (docId) {
            showNotification('Coverage request submitted successfully!', 'success');
            closeModal();
            await renderShiftExchangesPage();
        } else {
            showNotification('Failed to submit request', 'error');
        }
    } catch (error) {
        console.error('Error submitting coverage request:', error);
        showNotification('Error submitting request', 'error');
    }
}

/**
 * Offer to cover a shift
 */
async function offerToCover(exchangeId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Please log in to offer coverage', 'error');
        return;
    }

    const exchange = shiftExchanges.find(e => e.id === exchangeId);
    if (!exchange) {
        showNotification('Request not found', 'error');
        return;
    }

    const confirmed = await showConfirmModal(
        'Confirm Coverage',
        `Are you sure you want to cover this shift for ${exchange.requesterName}?<br><br>
        <strong>Date:</strong> ${formatDateSE(exchange.originalDate)}<br>
        <strong>Time:</strong> ${formatTimeSE(exchange.originalStartTime)} - ${formatTimeSE(exchange.originalEndTime)}<br><br>
        A manager will need to approve this exchange.`
    );

    if (!confirmed) return;

    try {
        const success = await firebaseShiftExchangeManager.updateShiftExchange(exchangeId, {
            status: 'accepted',
            coverEmployeeId: currentUser.odooEmployeeId,
            coverEmployeeName: currentUser.name,
            acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        if (success) {
            showNotification('You have offered to cover this shift! Waiting for manager approval.', 'success');
            await renderShiftExchangesPage();
        } else {
            showNotification('Failed to submit coverage offer', 'error');
        }
    } catch (error) {
        console.error('Error offering coverage:', error);
        showNotification('Error submitting coverage offer', 'error');
    }
}

/**
 * Approve shift exchange (manager only)
 */
async function approveShiftExchange(exchangeId) {
    const currentUser = getCurrentUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
        showNotification('Only managers can approve exchanges', 'error');
        return;
    }

    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    modalContent.innerHTML = `
        <div class="modal-header">
            <h2><i class="fas fa-check-circle" style="color: #10b981;"></i> Approve Exchange</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Approval Notes (Optional)</label>
                <textarea class="form-input" id="approval-notes" rows="3" placeholder="Add any notes about this approval..."></textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="confirmApproveExchange('${exchangeId}')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                <i class="fas fa-check"></i> Approve Exchange
            </button>
        </div>
    `;

    modal.classList.add('active');
}

/**
 * Confirm approval
 */
async function confirmApproveExchange(exchangeId) {
    const currentUser = getCurrentUser();
    const notes = document.getElementById('approval-notes')?.value || '';

    try {
        const success = await firebaseShiftExchangeManager.updateShiftExchange(exchangeId, {
            status: 'approved',
            reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
            reviewedBy: currentUser.name,
            reviewNotes: notes.trim()
        });

        if (success) {
            showNotification('Shift exchange approved!', 'success');
            closeModal();
            await renderShiftExchangesPage();
        } else {
            showNotification('Failed to approve exchange', 'error');
        }
    } catch (error) {
        console.error('Error approving exchange:', error);
        showNotification('Error approving exchange', 'error');
    }
}

/**
 * Reject shift exchange (manager only)
 */
async function rejectShiftExchange(exchangeId) {
    const currentUser = getCurrentUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
        showNotification('Only managers can reject exchanges', 'error');
        return;
    }

    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    modalContent.innerHTML = `
        <div class="modal-header">
            <h2><i class="fas fa-times-circle" style="color: #ef4444;"></i> Reject Exchange</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Rejection Reason *</label>
                <textarea class="form-input" id="rejection-notes" rows="3" placeholder="Please provide a reason for rejection..." required></textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="confirmRejectExchange('${exchangeId}')" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                <i class="fas fa-times"></i> Reject Exchange
            </button>
        </div>
    `;

    modal.classList.add('active');
}

/**
 * Confirm rejection
 */
async function confirmRejectExchange(exchangeId) {
    const currentUser = getCurrentUser();
    const notes = document.getElementById('rejection-notes')?.value;

    if (!notes?.trim()) {
        showNotification('Please provide a reason for rejection', 'warning');
        return;
    }

    try {
        const success = await firebaseShiftExchangeManager.updateShiftExchange(exchangeId, {
            status: 'rejected',
            reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
            reviewedBy: currentUser.name,
            reviewNotes: notes.trim()
        });

        if (success) {
            showNotification('Shift exchange rejected', 'success');
            closeModal();
            await renderShiftExchangesPage();
        } else {
            showNotification('Failed to reject exchange', 'error');
        }
    } catch (error) {
        console.error('Error rejecting exchange:', error);
        showNotification('Error rejecting exchange', 'error');
    }
}

/**
 * Cancel shift exchange request
 */
async function cancelShiftExchange(exchangeId) {
    const confirmed = await showConfirmModal(
        'Cancel Request',
        'Are you sure you want to cancel this coverage request?'
    );

    if (!confirmed) return;

    try {
        const success = await firebaseShiftExchangeManager.updateShiftExchange(exchangeId, {
            status: 'cancelled'
        });

        if (success) {
            showNotification('Request cancelled', 'success');
            await renderShiftExchangesPage();
        } else {
            showNotification('Failed to cancel request', 'error');
        }
    } catch (error) {
        console.error('Error cancelling request:', error);
        showNotification('Error cancelling request', 'error');
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeShiftExchangeManager();
});
