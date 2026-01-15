/**
 * Transfers Module JavaScript
 * Handles store-to-store inventory transfers
 */

// Transfers State
let transfersState = {
    transfers: [],
    currentFilter: 'all',
    selectedProduct: null,
    productsCache: [],
    isLoadingProducts: false,
    viewMode: 'table', // 'table' or 'grid'
    currentStore: 'vsu' // 'vsu' or 'loyalvaper'
};

// Set transfer store mode (VSU or Loyal Vaper)
function setTransferStore(store) {
    transfersState.currentStore = store;
    transfersState.productsCache = []; // Clear cache to reload products for selected store
    console.log('🏪 Transfer store set to:', store);
}
window.setTransferStore = setTransferStore;

// Switch transfer store and reload page
function switchTransferStore(store) {
    transfersState.currentStore = store;
    transfersState.productsCache = []; // Clear cache to reload products for selected store
    console.log('🏪 Switching to:', store);
    renderTransfersPage();
}
window.switchTransferStore = switchTransferStore;

// Store names mapping
const STORE_NAMES = {
    '1': 'Miramar',
    '2': 'Morena',
    '3': 'Kearny Mesa',
    '4': 'Chula Vista',
    '5': 'North Park',
    '6': 'Loyal Vaper',
    'loyalvaper': 'Loyal Vaper',
    'Miramar': 'Miramar',
    'Morena': 'Morena',
    'Kearny Mesa': 'Kearny Mesa',
    'Chula Vista': 'Chula Vista',
    'North Park': 'North Park',
    'Loyal Vaper': 'Loyal Vaper'
};

// Get store name from ID
function getStoreName(storeId) {
    return STORE_NAMES[storeId] || storeId;
}

// Show styled toast notification
function showTransferToast(message, type = 'info') {
    // Remove ALL existing toasts (both types)
    document.querySelectorAll('.transfer-toast, #transferToast').forEach(t => t.remove());

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const colors = {
        success: { bg: '#10b981', icon: '#fff' },
        error: { bg: '#ef4444', icon: '#fff' },
        warning: { bg: '#f59e0b', icon: '#fff' },
        info: { bg: '#6366f1', icon: '#fff' }
    };

    const toast = document.createElement('div');
    toast.className = 'transfer-toast';
    toast.id = 'transferToast';
    toast.innerHTML = `
        <i class="fas ${icons[type]}" style="font-size: 18px;"></i>
        <span>${message}</span>
    `;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type].bg};
        color: white;
        padding: 14px 20px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 10001;
        animation: slideInToast 0.3s ease-out;
        max-width: 350px;
    `;

    // Add animation styles if not exists
    if (!document.getElementById('transfer-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'transfer-toast-styles';
        style.textContent = `
            @keyframes slideInToast {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutToast {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutToast 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Generate unique transfer folio
function generateTransferFolio() {
    try {
        // Use current transfers in state first, fallback to localStorage
        const transfers = transfersState.transfers.length > 0
            ? transfersState.transfers
            : JSON.parse(localStorage.getItem('storeTransfers') || '[]');

        const lastFolio = transfers.length > 0
            ? parseInt(transfers[transfers.length - 1].folio.replace('TR-', ''))
            : 0;
        const newNumber = (lastFolio + 1).toString().padStart(4, '0');
        const folio = `TR-${newNumber}`;
        console.log('📋 Generated folio:', folio);
        return folio;
    } catch (error) {
        console.error('Error generating folio:', error);
        // Fallback to timestamp-based folio
        return `TR-${Date.now()}`;
    }
}

// Initialize Transfers Module
async function initializeTransfersModule() {
    console.log('🔄 Initializing Transfers Module...');

    // Wait a bit for DOM to be fully ready
    setTimeout(async () => {
        await loadTransfers();
        renderTransfersPage();
        setupProductSearch();
        setDefaultDate();
        setDefaultSentBy();
        console.log('✅ Transfers Module ready!');

        // Make submitTransfer globally accessible for debugging
        window.debugSubmitTransfer = submitTransfer;
        console.log('🔧 Debug: window.debugSubmitTransfer() is available for testing');
    }, 100);
}

// Set default date to today
function setDefaultDate() {
    const dateInput = document.getElementById('transferShipDate');
    if (dateInput) {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        dateInput.value = formattedDate;
    }
}

// Set default sent by to current user
function setDefaultSentBy() {
    const sentByInput = document.getElementById('transferSentBy');
    if (sentByInput) {
        try {
            const user = JSON.parse(localStorage.getItem('ascendance_user') || '{}');
            sentByInput.value = user.name || user.email || '';
        } catch (e) {
            console.warn('Could not get current user for sent by field');
        }
    }
}

// Load transfers from Firebase (with localStorage fallback)
async function loadTransfers() {
    try {
        // Try to load from Firebase first
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            const snapshot = await db.collection('transfers').orderBy('createdAt', 'desc').get();

            if (!snapshot.empty) {
                transfersState.transfers = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                console.log('✅ Loaded', transfersState.transfers.length, 'transfers from Firebase');

                // Also save to localStorage as backup
                localStorage.setItem('storeTransfers', JSON.stringify(transfersState.transfers));
                return;
            }
        }

        // Fallback to localStorage if Firebase is not available or empty
        const savedTransfers = localStorage.getItem('storeTransfers');
        transfersState.transfers = savedTransfers ? JSON.parse(savedTransfers) : [];
        console.log('📦 Loaded', transfersState.transfers.length, 'transfers from localStorage');
    } catch (e) {
        console.error('Error loading transfers:', e);
        // Final fallback to localStorage
        try {
            const savedTransfers = localStorage.getItem('storeTransfers');
            transfersState.transfers = savedTransfers ? JSON.parse(savedTransfers) : [];
        } catch (localError) {
            console.error('Error loading from localStorage:', localError);
            transfersState.transfers = [];
        }
    }
}

// Save transfers to localStorage
function saveTransfers() {
    try {
        localStorage.setItem('storeTransfers', JSON.stringify(transfersState.transfers));
    } catch (e) {
        console.error('Error saving transfers:', e);
    }
}

// Render the transfers page content
function renderTransfersPage() {
    console.log('📝 renderTransfersPage called');
    const dashboard = document.querySelector('.dashboard');
    if (!dashboard) {
        console.error('❌ Dashboard element not found!');
        return;
    }
    console.log('✅ Dashboard found, rendering transfers...');

    // Calculate stats
    const stats = calculateTransferStats();
    const isLoyalVaper = transfersState.currentStore === 'loyalvaper';

    dashboard.innerHTML = `
        <!-- Page Header -->
        <div class="page-header">
            <div class="page-header-left">
                <h2 class="section-title">Store Transfers</h2>
                <p class="section-subtitle">Manage inventory movement between locations</p>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                <button onclick="openTransferReports()" style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 12px 16px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
                    <i class="fas fa-chart-bar" style="color: #8b5cf6;"></i> Reports
                </button>
                <button class="btn-secondary" onclick="loadTransfers(); renderTransfersPage();">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
                <button onclick="openUnifiedTransferModal()" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-plus"></i> New Transfer
                </button>
            </div>
        </div>

        <!-- Store Tabs -->
        <div style="display: flex; gap: 8px; margin-bottom: 20px; background: var(--bg-secondary); padding: 6px; border-radius: 14px; width: fit-content;">
            <button onclick="switchTransferStore('vsu')" style="padding: 12px 24px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: all 0.2s; ${!isLoyalVaper ? 'background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;' : 'background: transparent; color: var(--text-muted);'}">
                <i class="fas fa-store"></i> VSU
            </button>
            <button onclick="switchTransferStore('loyalvaper')" style="padding: 12px 24px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: all 0.2s; ${isLoyalVaper ? 'background: linear-gradient(135deg, #f59e0b, #d97706); color: white;' : 'background: transparent; color: var(--text-muted);'}">
                <i class="fas fa-store"></i> Loyal Vaper
            </button>
        </div>

        <!-- Stats Cards -->
        <div class="transfer-stats">
            <div class="transfer-stat-card">
                <div class="stat-icon total">
                    <i class="fas fa-exchange-alt"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${stats.total}</div>
                    <div class="stat-label">Total Transfers</div>
                </div>
            </div>
            <div class="transfer-stat-card">
                <div class="stat-icon pending">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${stats.pending}</div>
                    <div class="stat-label">Pending</div>
                </div>
            </div>
            <div class="transfer-stat-card">
                <div class="stat-icon received">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${stats.received}</div>
                    <div class="stat-label">Received</div>
                </div>
            </div>
        </div>

        <!-- Filter Tabs & View Toggle -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div class="transfers-filter-tabs" style="margin-bottom: 0;">
                <button class="filter-tab ${transfersState.currentFilter === 'all' ? 'active' : ''}" onclick="filterTransfers('all')">
                    <i class="fas fa-border-all"></i>
                    <span>All</span>
                </button>
                <button class="filter-tab ${transfersState.currentFilter === 'pending' ? 'active' : ''}" onclick="filterTransfers('pending')">
                    <i class="fas fa-clock"></i>
                    <span>Pending</span>
                </button>
                <button class="filter-tab ${transfersState.currentFilter === 'received' ? 'active' : ''}" onclick="filterTransfers('received')">
                    <i class="fas fa-check-circle"></i>
                    <span>Received</span>
                </button>
            </div>
            <div style="display: flex; gap: 4px; background: var(--bg-secondary); padding: 4px; border-radius: 10px;">
                <button onclick="setTransferViewMode('table')" style="padding: 8px 12px; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; ${transfersState.viewMode === 'table' ? 'background: var(--accent-primary); color: white;' : 'background: transparent; color: var(--text-muted);'}">
                    <i class="fas fa-list"></i>
                </button>
                <button onclick="setTransferViewMode('grid')" style="padding: 8px 12px; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; ${transfersState.viewMode === 'grid' ? 'background: var(--accent-primary); color: white;' : 'background: transparent; color: var(--text-muted);'}">
                    <i class="fas fa-th-large"></i>
                </button>
            </div>
        </div>

        <!-- Transfers Content -->
        ${transfersState.viewMode === 'table' ? `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-list"></i>
                        Transfer History
                    </h3>
                </div>
                <div class="card-body" style="padding: 0;">
                    ${renderTransfersTable()}
                </div>
            </div>
        ` : `
            <div class="transfers-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                ${renderTransfersGrid()}
            </div>
        `}

        <!-- New Transfer Modal - Redesigned -->
        <div class="modal" id="transferModal">
            <div class="modal-content" style="max-width: 550px; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                <!-- Header with gradient -->
                <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 24px; position: relative;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-exchange-alt" style="color: white; font-size: 20px;"></i>
                        </div>
                        <div>
                            <h3 style="margin: 0; color: white; font-size: 20px; font-weight: 700;">New Transfer</h3>
                            <p style="margin: 4px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">Move inventory between stores</p>
                        </div>
                    </div>
                    <button onclick="closeTransferModal()" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.2); border: none; width: 32px; height: 32px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                        <i class="fas fa-times" style="color: white;"></i>
                    </button>
                </div>

                <div style="padding: 24px; background: var(--bg-primary);">
                    <div id="transferMessage" style="display: none; padding: 12px 16px; border-radius: 12px; margin-bottom: 20px; font-size: 13px;"></div>

                    <form id="transferForm" onsubmit="event.preventDefault(); console.log('Form submitted!'); submitTransfer(); return false;">
                        <!-- Store Selection with Visual Route -->
                        <div style="margin-bottom: 24px;">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                                <i class="fas fa-route" style="margin-right: 6px;"></i>Transfer Route
                            </label>
                            <div style="display: flex; align-items: center; gap: 12px; background: var(--bg-secondary); padding: 16px; border-radius: 14px; border: 2px solid var(--border-color);">
                                <div style="flex: 1;">
                                    <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase;">From</div>
                                    <select id="transferStoreOrigin" onchange="handleOriginStoreChange()" required style="width: 100%; padding: 10px 12px; border: 2px solid var(--border-color); border-radius: 10px; background: var(--bg-primary); color: var(--text-primary); font-size: 14px; font-weight: 600; cursor: pointer; transition: border-color 0.2s;" onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='var(--border-color)'">
                                        <option value="">Select Origin</option>
                                        <optgroup label="VSU">
                                            <option value="1">Miramar</option>
                                            <option value="2">Morena</option>
                                            <option value="3">Kearny Mesa</option>
                                            <option value="4">Chula Vista</option>
                                            <option value="5">North Park</option>
                                        </optgroup>
                                        <optgroup label="Loyal Vaper">
                                            <option value="6">Loyal Vaper</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                    <i class="fas fa-arrow-right" style="color: #8b5cf6; font-size: 18px;"></i>
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase;">To</div>
                                    <select id="transferStoreDestination" required style="width: 100%; padding: 10px 12px; border: 2px solid var(--border-color); border-radius: 10px; background: var(--bg-primary); color: var(--text-primary); font-size: 14px; font-weight: 600; cursor: pointer; transition: border-color 0.2s;" onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'">
                                        <option value="">Select Destination</option>
                                        <optgroup label="VSU">
                                            <option value="1">Miramar</option>
                                            <option value="2">Morena</option>
                                            <option value="3">Kearny Mesa</option>
                                            <option value="4">Chula Vista</option>
                                            <option value="5">North Park</option>
                                        </optgroup>
                                        <optgroup label="Loyal Vaper">
                                            <option value="6">Loyal Vaper</option>
                                        </optgroup>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Product Search -->
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                                <i class="fas fa-box" style="margin-right: 6px;"></i>Product
                            </label>
                            <div style="position: relative;">
                                <div style="position: relative;">
                                    <i class="fas fa-search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                                    <input type="text" id="transferProductSearch" placeholder="Search by name, SKU, or brand..." autocomplete="off" style="width: 100%; padding: 14px 14px 14px 42px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; transition: all 0.2s; box-sizing: border-box;" onfocus="this.style.borderColor='#8b5cf6'; this.style.background='var(--bg-primary)'" onblur="this.style.borderColor='var(--border-color)'; this.style.background='var(--bg-secondary)'">
                                    <div id="productSearchLoading" style="display: none; position: absolute; right: 14px; top: 50%; transform: translateY(-50%);">
                                        <i class="fas fa-spinner fa-spin" style="color: #8b5cf6;"></i>
                                    </div>
                                </div>
                                <div id="productSearchResults" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--bg-primary); border: 2px solid var(--border-color); border-radius: 12px; max-height: 240px; overflow-y: auto; z-index: 1000; box-shadow: 0 10px 40px rgba(0,0,0,0.15);"></div>
                            </div>
                            <div id="selectedProductDisplay" style="display: none; margin-top: 10px;"></div>
                            <input type="hidden" id="transferProductId">
                        </div>

                        <!-- Quantity -->
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                                <i class="fas fa-hashtag" style="margin-right: 6px;"></i>Quantity
                            </label>
                            <div style="display: flex; align-items: center; background: var(--bg-secondary); border: 2px solid var(--border-color); border-radius: 12px; overflow: hidden; max-width: 200px;">
                                <button type="button" onclick="adjustQuantity(-1)" style="width: 50px; height: 52px; border: none; background: none; cursor: pointer; color: var(--text-muted); font-size: 20px; transition: all 0.2s;" onmouseover="this.style.background='var(--bg-tertiary)'; this.style.color='#ef4444'" onmouseout="this.style.background='none'; this.style.color='var(--text-muted)'">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="number" id="transferQuantity" min="1" value="1" required style="flex: 1; text-align: center; border: none; background: none; font-size: 22px; font-weight: 700; color: var(--text-primary); padding: 12px 0; -moz-appearance: textfield;" oninput="this.value = Math.max(1, parseInt(this.value) || 1)">
                                <button type="button" onclick="adjustQuantity(1)" style="width: 50px; height: 52px; border: none; background: none; cursor: pointer; color: var(--text-muted); font-size: 20px; transition: all 0.2s;" onmouseover="this.style.background='var(--bg-tertiary)'; this.style.color='#10b981'" onmouseout="this.style.background='none'; this.style.color='var(--text-muted)'">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Notes (Collapsible) -->
                        <div style="margin-bottom: 24px;">
                            <button type="button" onclick="toggleTransferNotes()" style="display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 0;">
                                <i class="fas fa-plus-circle" id="notesToggleIcon"></i> Add Notes (Optional)
                            </button>
                            <div id="transferNotesContainer" style="display: none; margin-top: 10px;">
                                <textarea id="transferNotes" rows="2" placeholder="Additional notes..." style="width: 100%; padding: 12px 14px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; resize: vertical; box-sizing: border-box;" onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'"></textarea>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div style="display: flex; gap: 12px;">
                            <button type="button" onclick="closeTransferModal()" style="flex: 1; padding: 14px 20px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='var(--bg-secondary)'">
                                Cancel
                            </button>
                            <button type="submit" id="submitTransferBtn" onclick="console.log('Button clicked directly!'); submitTransfer(); return false;" style="flex: 2; padding: 14px 20px; border: none; border-radius: 12px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(99, 102, 241, 0.4)'" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 15px rgba(99, 102, 241, 0.3)'">
                                <i class="fas fa-paper-plane"></i> Create Transfer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Transfer Details Modal -->
        <div class="modal" id="transferDetailsModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="transferDetailsTitle">Transfer Details</h3>
                    <button class="close-modal" onclick="closeTransferDetailsModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-muted); padding: 8px; border-radius: 8px; transition: all 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='none'"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body" id="transferDetailsBody"></div>
            </div>
        </div>
    `;
}

// Calculate transfer statistics
function calculateTransferStats() {
    const transfers = transfersState.transfers;
    return {
        total: transfers.length,
        pending: transfers.filter(t => t.status === 'pending').length,
        received: transfers.filter(t => t.status === 'received').length
    };
}

// Render transfers table
function renderTransfersTable() {
    let transfers = [...transfersState.transfers];

    // Apply filter
    if (transfersState.currentFilter !== 'all') {
        transfers = transfers.filter(t => t.status === transfersState.currentFilter);
    }

    // Sort by date (newest first)
    transfers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (transfers.length === 0) {
        return `
            <div class="empty-state">
                <i class="fas fa-exchange-alt"></i>
                <h3>No transfers</h3>
                <p>Transfers will appear here once created</p>
            </div>
        `;
    }

    return `
        <table class="transfers-table">
            <thead>
                <tr>
                    <th>Folio</th>
                    <th>Route</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Date</th>
                    <th>Sent by</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${transfers.map(transfer => renderTransferRow(transfer)).join('')}
            </tbody>
        </table>
    `;
}

// Set view mode (table or grid)
function setTransferViewMode(mode) {
    transfersState.viewMode = mode;
    renderTransfersPage();
}

// Render transfers grid view
function renderTransfersGrid() {
    let transfers = [...transfersState.transfers];

    // Apply filter
    if (transfersState.currentFilter !== 'all') {
        transfers = transfers.filter(t => t.status === transfersState.currentFilter);
    }

    // Sort by date (newest first)
    transfers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (transfers.length === 0) {
        return `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-exchange-alt"></i>
                <h3>No transfers</h3>
                <p>Transfers will appear here once created</p>
            </div>
        `;
    }

    return transfers.map(transfer => renderTransferCard(transfer)).join('');
}

// Render single transfer card for grid view
function renderTransferCard(transfer) {
    const statusLabels = {
        'pending': 'Pending',
        'received': 'Received'
    };

    const statusColors = {
        'pending': { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: 'fa-clock' },
        'received': { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', icon: 'fa-check-circle' }
    };

    const status = statusColors[transfer.status] || statusColors.pending;

    const formattedDate = new Date(transfer.shipDate).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short'
    });

    // Check if new multi-item format or old single-item format
    const hasMultipleItems = transfer.items && transfer.items.length > 0;
    const totalQty = hasMultipleItems ? transfer.totalItems : transfer.quantity;
    const productCount = hasMultipleItems ? transfer.items.length : 1;

    // Calculate boxes
    let totalBoxes = 0;
    if (hasMultipleItems) {
        transfer.items.forEach(item => {
            const name = (item.productName || '').toUpperCase();
            const isLargeBoxBrand = name.includes('GEEK BAR') || name.includes('FOGER') || name.includes('SUONON') || name.includes('KRAZE');
            if (isLargeBoxBrand && item.quantity >= 5) {
                totalBoxes += Math.round(item.quantity / 5);
            } else {
                totalBoxes += item.quantity;
            }
        });
    } else {
        totalBoxes = transfer.quantity || 1;
    }

    // Product display
    let productName = '';
    if (hasMultipleItems) {
        productName = productCount === 1
            ? transfer.items[0].productName
            : `${productCount} flavors`;
    } else {
        productName = transfer.productName;
    }

    return `
        <div class="transfer-card" style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 16px; padding: 20px; transition: all 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='none'; this.style.boxShadow='none'" onclick="viewTransferDetails('${transfer.id}')">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                <div>
                    <div style="font-weight: 700; color: var(--accent-primary); font-size: 14px; font-family: 'Space Mono', monospace;">${transfer.folio}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${formattedDate}</div>
                </div>
                <div style="background: ${status.bg}; color: ${status.color}; padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                    <i class="fas ${status.icon}"></i>
                    ${statusLabels[transfer.status]}
                </div>
            </div>

            <!-- Route -->
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 12px; background: var(--bg-secondary); border-radius: 10px;">
                <div style="flex: 1; text-align: center;">
                    <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px;">From</div>
                    <div style="font-weight: 600; font-size: 13px; color: var(--text-primary);">${getStoreName(transfer.storeOrigin)}</div>
                </div>
                <i class="fas fa-arrow-right" style="color: var(--accent-primary);"></i>
                <div style="flex: 1; text-align: center;">
                    <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px;">To</div>
                    <div style="font-weight: 600; font-size: 13px; color: #10b981;">${getStoreName(transfer.storeDestination)}</div>
                </div>
            </div>

            <!-- Product Info -->
            <div style="margin-bottom: 16px;">
                <div style="font-weight: 600; color: var(--text-primary); font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${productName}</div>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
                    <span style="background: linear-gradient(135deg, #667eea20, #764ba220); color: #667eea; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 14px;">${totalQty} vapes</span>
                    <span style="font-size: 12px; color: var(--text-muted);">${totalBoxes} box${totalBoxes !== 1 ? 'es' : ''}</span>
                </div>
            </div>

            <!-- Footer Actions -->
            <div style="display: flex; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 12px;" onclick="event.stopPropagation()">
                ${transfer.status !== 'received' ? `
                    <button onclick="confirmReceiveTransfer('${transfer.id}')" style="flex: 1; padding: 10px; border: none; border-radius: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; font-weight: 600; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <i class="fas fa-check"></i> Receive
                    </button>
                ` : `
                    <div style="flex: 1; padding: 10px; text-align: center; color: var(--text-muted); font-size: 12px;">
                        <i class="fas fa-check-circle" style="color: #10b981; margin-right: 4px;"></i> Received
                    </div>
                `}
                <button onclick="confirmDeleteTransfer('${transfer.id}')" style="padding: 10px 14px; border: none; border-radius: 8px; background: rgba(239,68,68,0.1); color: #ef4444; cursor: pointer;" onmouseover="this.style.background='#ef4444'; this.style.color='white'" onmouseout="this.style.background='rgba(239,68,68,0.1)'; this.style.color='#ef4444'">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Render single transfer row - supports both old (single product) and new (multiple items) format
function renderTransferRow(transfer) {
    const statusClass = transfer.status;
    const statusLabels = {
        'pending': 'Pending',
                'received': 'Received'
    };

    const formattedDate = new Date(transfer.shipDate).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    // Check if new multi-item format or old single-item format
    const hasMultipleItems = transfer.items && transfer.items.length > 0;
    const totalQty = hasMultipleItems ? transfer.totalItems : transfer.quantity;
    const productCount = hasMultipleItems ? transfer.items.length : 1;

    // Calculate total boxes (each item tracks its own quantity which may be boxes×5 or individual)
    // For display, we show: flavors, boxes, total vapes
    let totalBoxes = 0;
    if (hasMultipleItems) {
        // Each item.quantity is already the total vapes (e.g., 10 = 2 boxes × 5)
        // We need to figure out boxes - assume large box brands are ×5
        transfer.items.forEach(item => {
            const name = (item.productName || '').toUpperCase();
            const isLargeBoxBrand = name.includes('GEEK BAR') || name.includes('FOGER') || name.includes('SUONON') || name.includes('KRAZE');
            if (isLargeBoxBrand && item.quantity >= 5) {
                totalBoxes += Math.round(item.quantity / 5);
            } else {
                totalBoxes += item.quantity;
            }
        });
    } else {
        totalBoxes = transfer.quantity || 1;
    }

    // Product display - show summary for multi-item transfers
    let productDisplay;
    if (hasMultipleItems) {
        if (productCount === 1) {
            productDisplay = `
                <div style="font-weight: 600;">${transfer.items[0].productName}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${transfer.items[0].productSku || ''}</div>
            `;
        } else {
            productDisplay = `
                <div style="font-weight: 600;">${productCount} flavors</div>
                <div style="font-size: 11px; color: var(--text-muted);">${transfer.items.slice(0, 2).map(i => i.productName).join(', ')}${productCount > 2 ? '...' : ''}</div>
            `;
        }
    } else {
        productDisplay = `
            <div style="font-weight: 600;">${transfer.productName}</div>
            ${transfer.productSku ? `<div style="font-size: 11px; color: var(--text-muted); font-family: 'Space Mono', monospace;">${transfer.productSku}</div>` : ''}
        `;
    }

    return `
        <tr>
            <td>
                <span class="transfer-folio">${transfer.folio}</span>
            </td>
            <td>
                <div class="transfer-route">
                    <span class="store-name">${getStoreName(transfer.storeOrigin)}</span>
                    <i class="fas fa-arrow-right route-arrow"></i>
                    <span class="store-name">${getStoreName(transfer.storeDestination)}</span>
                </div>
            </td>
            <td>
                ${productDisplay}
            </td>
            <td>
                <span style="font-weight: 700; font-size: 16px;">${totalQty}</span>
                <div style="font-size: 10px; color: var(--text-muted);">${totalBoxes} box${totalBoxes !== 1 ? 'es' : ''}</div>
            </td>
            <td>
                ${formattedDate}
            </td>
            <td>
                ${transfer.sentBy}
            </td>
            <td>
                <span class="transfer-status-badge ${statusClass}">
                    ${statusLabels[transfer.status] || transfer.status}
                </span>
            </td>
            <td>
                <div class="order-actions">
                    <button class="order-action-btn view" onclick="viewTransferDetails('${transfer.id}')">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    ${transfer.status !== 'received' ? `
                        <button class="confirm-receive-btn" onclick="confirmReceiveTransfer('${transfer.id}')">
                            <i class="fas fa-check"></i>
                            Receive
                        </button>
                    ` : ''}
                    <button class="order-action-btn delete" onclick="confirmDeleteTransfer('${transfer.id}')" style="background: rgba(239,68,68,0.1); color: #ef4444;" onmouseover="this.style.background='#ef4444'; this.style.color='white'" onmouseout="this.style.background='rgba(239,68,68,0.1)'; this.style.color='#ef4444'">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Confirm delete transfer with modal
function confirmDeleteTransfer(transferId) {
    const transfer = transfersState.transfers.find(t => t.id === transferId);
    if (!transfer) {
        showTransferToast('Transfer not found', 'error');
        return;
    }

    // Create confirmation modal
    const existingModal = document.getElementById('deleteTransferModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'deleteTransferModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px; border-radius: 20px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 24px; text-align: center;">
                <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
                    <i class="fas fa-trash-alt" style="color: white; font-size: 24px;"></i>
                </div>
                <h3 style="margin: 0; color: white; font-size: 18px;">Delete Transfer?</h3>
            </div>
            <div style="padding: 24px; text-align: center;">
                <p style="margin: 0 0 8px; color: var(--text-primary); font-weight: 600;">${transfer.folio}</p>
                <p style="margin: 0 0 20px; color: var(--text-muted); font-size: 14px;">
                    ${getStoreName(transfer.storeOrigin)} → ${getStoreName(transfer.storeDestination)}
                </p>
                <p style="margin: 0 0 24px; color: var(--text-muted); font-size: 13px;">
                    This action cannot be undone
                </p>
                <div style="display: flex; gap: 12px;">
                    <button onclick="closeDeleteModal()" style="flex: 1; padding: 12px; border: 2px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-weight: 600; cursor: pointer;">
                        Cancel
                    </button>
                    <button onclick="executeDeleteTransfer('${transferId}')" style="flex: 1; padding: 12px; border: none; border-radius: 10px; background: #ef4444; color: white; font-weight: 600; cursor: pointer;">
                        <i class="fas fa-trash" style="margin-right: 6px;"></i>Delete
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Close delete confirmation modal
function closeDeleteModal() {
    const modal = document.getElementById('deleteTransferModal');
    if (modal) modal.remove();
}

// Execute delete transfer
async function executeDeleteTransfer(transferId) {
    const transfer = transfersState.transfers.find(t => t.id === transferId);
    if (!transfer) {
        showTransferToast('Transfer not found', 'error');
        closeDeleteModal();
        return;
    }

    const folio = transfer.folio;

    // Remove from state
    transfersState.transfers = transfersState.transfers.filter(t => t.id !== transferId);

    // Save to localStorage
    saveTransfers();

    // Try to delete from Firebase
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            await db.collection('transfers').doc(transferId).delete();
            console.log('✅ Transfer deleted from Firebase');
        }
    } catch (error) {
        console.warn('⚠️ Could not delete from Firebase:', error.message);
    }

    // Close modal and refresh
    closeDeleteModal();
    renderTransfersPage();
    showTransferToast(`Transfer ${folio} deleted`, 'success');
}

// Filter transfers
function filterTransfers(filter) {
    transfersState.currentFilter = filter;
    renderTransfersPage();
}

// Open transfer modal
function openTransferModal() {
    const modal = document.getElementById('transferModal');
    if (modal) {
        modal.classList.add('active');
        resetTransferForm();
        setDefaultDate();
        setDefaultSentBy();
    }
}

// Close transfer modal
function closeTransferModal() {
    const modal = document.getElementById('transferModal');
    if (modal) {
        modal.classList.remove('active');
        resetTransferForm();
    }
}

// Reset transfer form
function resetTransferForm() {
    const form = document.getElementById('transferForm');
    if (form) {
        form.reset();
    }
    transfersState.selectedProduct = null;

    const selectedDisplay = document.getElementById('selectedProductDisplay');
    if (selectedDisplay) {
        selectedDisplay.style.display = 'none';
    }

    const searchInput = document.getElementById('transferProductSearch');
    if (searchInput) {
        searchInput.style.display = 'block';
        searchInput.value = '';
    }

    const results = document.getElementById('productSearchResults');
    if (results) {
        results.style.display = 'none';
    }

    const message = document.getElementById('transferMessage');
    if (message) {
        message.style.display = 'none';
    }
}

// Handle origin store change - disable same destination
function handleOriginStoreChange() {
    const originSelect = document.getElementById('transferStoreOrigin');
    const destSelect = document.getElementById('transferStoreDestination');

    if (!originSelect || !destSelect) return;

    const originValue = originSelect.value;

    // Enable all options first
    Array.from(destSelect.options).forEach(option => {
        option.disabled = false;
    });

    // Disable the same store in destination
    if (originValue) {
        Array.from(destSelect.options).forEach(option => {
            if (option.value === originValue) {
                option.disabled = true;
            }
        });

        // If destination is same as origin, reset it
        if (destSelect.value === originValue) {
            destSelect.value = '';
        }
    }
}

// Setup product search functionality
function setupProductSearch() {
    const searchInput = document.getElementById('transferProductSearch');
    const resultsContainer = document.getElementById('productSearchResults');

    if (!searchInput || !resultsContainer) return;

    let debounceTimer;

    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();

        clearTimeout(debounceTimer);

        if (query.length < 2) {
            resultsContainer.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(() => {
            searchProducts(query);
        }, 300);
    });

    // Close results when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.product-search-container')) {
            resultsContainer.style.display = 'none';
        }
    });
}

// Search products from Shopify
async function searchProducts(query) {
    const resultsContainer = document.getElementById('productSearchResults');
    const loadingIndicator = document.getElementById('productSearchLoading');

    if (!resultsContainer) return;

    // Show loading indicator
    if (loadingIndicator) loadingIndicator.style.display = 'block';

    // Show loading in results
    resultsContainer.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-muted);">
            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #8b5cf6; margin-bottom: 10px; display: block;"></i>
            <span style="font-size: 13px;">Searching products...</span>
        </div>
    `;
    resultsContainer.style.display = 'block';

    try {
        // Check if we have cached products
        if (transfersState.productsCache.length === 0) {
            // Fetch products from selected store only
            if (typeof fetchStoreInventory === 'function') {
                const storeKey = transfersState.currentStore || 'vsu';
                const storeName = storeKey === 'loyalvaper' ? 'Loyal Vaper' : 'VSU';
                console.log('🔄 Fetching products from', storeName + '...');
                transfersState.productsCache = await fetchStoreInventory(storeKey, 250);
                transfersState.productsCache.forEach(p => p.sourceStore = storeName);
                console.log('✅ Loaded', transfersState.productsCache.length, storeName, 'products');
            } else {
                throw new Error('fetchStoreInventory function not available');
            }
        }

        // Filter products by query
        const queryLower = query.toLowerCase();
        const filteredProducts = transfersState.productsCache.filter(product => {
            return (
                (product.productName && product.productName.toLowerCase().includes(queryLower)) ||
                (product.sku && product.sku.toLowerCase().includes(queryLower)) ||
                (product.brand && product.brand.toLowerCase().includes(queryLower)) ||
                (product.flavor && product.flavor.toLowerCase().includes(queryLower))
            );
        }).slice(0, 15); // Limit to 15 results

        if (loadingIndicator) loadingIndicator.style.display = 'none';

        if (filteredProducts.length === 0) {
            resultsContainer.innerHTML = `
                <div style="padding: 24px; text-align: center; color: var(--text-muted);">
                    <i class="fas fa-box-open" style="font-size: 32px; margin-bottom: 12px; display: block; opacity: 0.5;"></i>
                    <div style="font-size: 14px; font-weight: 500;">No products found</div>
                    <div style="font-size: 12px; margin-top: 4px;">Try a different search term</div>
                </div>
            `;
            return;
        }

        // Render results with improved styling
        resultsContainer.innerHTML = filteredProducts.map(product => {
            const productData = encodeURIComponent(JSON.stringify(product));
            const stockColor = parseInt(product.stock) <= 5 ? '#ef4444' : parseInt(product.stock) <= 20 ? '#f59e0b' : '#10b981';
            const storeColor = product.sourceStore === 'Loyal Vaper' ? '#f59e0b' : '#6366f1';
            const storeBadge = product.sourceStore ? `<span style="font-size: 10px; color: white; background: ${storeColor}; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${product.sourceStore}</span>` : '';

            return `
                <div onclick="selectProductFromSearch('${productData}')" style="padding: 12px 16px; cursor: pointer; border-bottom: 1px solid var(--border-color); transition: all 0.15s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 600; color: var(--text-primary); font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${product.productName}${product.flavor && product.flavor !== 'N/A' ? ` - ${product.flavor}` : ''}
                            </div>
                            <div style="display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
                                ${storeBadge}
                                ${product.sku ? `<span style="font-size: 11px; color: var(--text-muted); background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px;">SKU: ${product.sku}</span>` : ''}
                                ${product.brand ? `<span style="font-size: 11px; color: #8b5cf6; background: rgba(139,92,246,0.1); padding: 2px 6px; border-radius: 4px;">${product.brand}</span>` : ''}
                            </div>
                        </div>
                        <div style="text-align: right; flex-shrink: 0;">
                            <div style="font-size: 14px; font-weight: 700; color: ${stockColor};">${product.stock}</div>
                            <div style="font-size: 10px; color: var(--text-muted);">in stock</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error searching products:', error);
        const loadingIndicator = document.getElementById('productSearchLoading');
        if (loadingIndicator) loadingIndicator.style.display = 'none';

        resultsContainer.innerHTML = `
            <div style="padding: 24px; text-align: center; color: var(--text-muted);">
                <i class="fas fa-exclamation-triangle" style="font-size: 32px; margin-bottom: 12px; display: block; color: #ef4444;"></i>
                <div style="font-size: 14px; font-weight: 500; color: #ef4444;">Error loading products</div>
                <div style="font-size: 12px; margin-top: 4px;">Check your connection and try again</div>
            </div>
        `;
    }
}

// Select product from encoded search data
function selectProductFromSearch(encodedProduct) {
    try {
        const product = JSON.parse(decodeURIComponent(encodedProduct));
        selectProduct(product);
    } catch (e) {
        console.error('Error parsing product:', e);
    }
}

// Select a product from search results
function selectProduct(product) {
    transfersState.selectedProduct = product;

    // Hide search input and results
    const searchInput = document.getElementById('transferProductSearch');
    const resultsContainer = document.getElementById('productSearchResults');

    if (searchInput) searchInput.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'none';

    // Set hidden product ID
    const productIdInput = document.getElementById('transferProductId');
    if (productIdInput) {
        productIdInput.value = product.id;
    }

    // Show selected product display with improved styling
    const selectedDisplay = document.getElementById('selectedProductDisplay');
    if (selectedDisplay) {
        const stockColor = parseInt(product.stock) <= 5 ? '#ef4444' : parseInt(product.stock) <= 20 ? '#f59e0b' : '#10b981';

        selectedDisplay.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%); border: 2px solid rgba(139,92,246,0.3); border-radius: 12px;">
                <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class="fas fa-box" style="color: white; font-size: 18px;"></i>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; color: var(--text-primary); font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${product.productName}${product.flavor && product.flavor !== 'N/A' ? ` - ${product.flavor}` : ''}
                    </div>
                    <div style="display: flex; gap: 8px; margin-top: 4px; align-items: center; flex-wrap: wrap;">
                        ${product.sku ? `<span style="font-size: 11px; color: var(--text-muted);">SKU: ${product.sku}</span>` : ''}
                        ${product.brand ? `<span style="font-size: 11px; color: #8b5cf6;">• ${product.brand}</span>` : ''}
                        <span style="font-size: 11px; color: ${stockColor}; font-weight: 600;">• Stock: ${product.stock}</span>
                    </div>
                </div>
                <button type="button" onclick="clearSelectedProduct()" style="width: 32px; height: 32px; border-radius: 8px; border: none; background: rgba(239,68,68,0.1); color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0;" onmouseover="this.style.background='#ef4444'; this.style.color='white'" onmouseout="this.style.background='rgba(239,68,68,0.1)'; this.style.color='#ef4444'">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        selectedDisplay.style.display = 'block';
    }
}

// Clear selected product
function clearSelectedProduct() {
    transfersState.selectedProduct = null;

    const searchInput = document.getElementById('transferProductSearch');
    const selectedDisplay = document.getElementById('selectedProductDisplay');
    const productIdInput = document.getElementById('transferProductId');

    if (searchInput) {
        searchInput.style.display = 'block';
        searchInput.value = '';
        searchInput.focus();
    }
    if (selectedDisplay) {
        selectedDisplay.style.display = 'none';
    }
    if (productIdInput) {
        productIdInput.value = '';
    }
}

// Adjust quantity with +/- buttons
function adjustQuantity(delta) {
    const input = document.getElementById('transferQuantity');
    if (input) {
        const newValue = Math.max(1, (parseInt(input.value) || 1) + delta);
        input.value = newValue;
    }
}

// Toggle notes section
function toggleTransferNotes() {
    const container = document.getElementById('transferNotesContainer');
    const icon = document.getElementById('notesToggleIcon');

    if (container && icon) {
        if (container.style.display === 'none') {
            container.style.display = 'block';
            icon.className = 'fas fa-minus-circle';
        } else {
            container.style.display = 'none';
            icon.className = 'fas fa-plus-circle';
        }
    }
}

// Submit transfer
async function submitTransfer() {
    console.log('🚀 submitTransfer() called');

    const form = document.getElementById('transferForm');
    const messageEl = document.getElementById('transferMessage');
    const submitBtn = document.getElementById('submitTransferBtn');

    console.log('📋 Form elements:', { form, messageEl, submitBtn });

    // Validate form
    const storeOrigin = document.getElementById('transferStoreOrigin')?.value;
    const storeDestination = document.getElementById('transferStoreDestination')?.value;
    const quantity = document.getElementById('transferQuantity')?.value;
    const notes = document.getElementById('transferNotes')?.value || '';

    // Auto-fill date (today) and sentBy (logged in user)
    const shipDate = new Date().toISOString().split('T')[0];
    const currentUser = window.authManager?.getCurrentUser?.();
    const sentBy = currentUser?.name || currentUser?.email || 'System';

    console.log('📝 Form values:', { storeOrigin, storeDestination, quantity, shipDate, sentBy, notes });

    // Validation
    if (!storeOrigin) {
        showTransferMessage('Please select origin store', 'error');
        return;
    }

    if (!storeDestination) {
        showTransferMessage('Please select destination store', 'error');
        return;
    }

    if (storeOrigin === storeDestination) {
        showTransferMessage('Origin and destination stores cannot be the same', 'error');
        return;
    }

    console.log('🔍 Selected product:', transfersState.selectedProduct);

    if (!transfersState.selectedProduct) {
        showTransferMessage('Please select a product', 'error');
        console.log('❌ No product selected!');
        return;
    }

    if (!quantity || parseInt(quantity) < 1) {
        showTransferMessage('Please enter a valid quantity', 'error');
        return;
    }

    console.log('✅ All validations passed! Creating transfer...');

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

    try {
        // Create transfer object
        const transfer = {
            id: Date.now().toString(),
            folio: generateTransferFolio(),
            storeOrigin: storeOrigin,
            storeDestination: storeDestination,
            productId: transfersState.selectedProduct.id,
            productName: transfersState.selectedProduct.productName + (transfersState.selectedProduct.flavor && transfersState.selectedProduct.flavor !== 'N/A' ? ` - ${transfersState.selectedProduct.flavor}` : ''),
            productSku: transfersState.selectedProduct.sku || '',
            quantity: parseInt(quantity),
            shipDate: shipDate,
            sentBy: sentBy,
            notes: notes,
            status: 'pending',
            createdAt: new Date().toISOString(),
            receivedAt: null,
            receivedBy: null
        };

        // Add to transfers array
        transfersState.transfers.push(transfer);
        console.log('📦 Added to transfers array. Total transfers:', transfersState.transfers.length);

        // Save to localStorage
        saveTransfers();
        console.log('💾 Saved to localStorage');

        // Try to save to Firebase if available
        await saveTransferToFirebase(transfer);

        console.log('✅ Transfer created successfully:', transfer);

        // Show success message
        showTransferMessage(`Transfer ${transfer.folio} created successfully!`, 'success');

        // Close modal and refresh after delay
        setTimeout(() => {
            console.log('🔄 Closing modal and refreshing page...');
            closeTransferModal();
            renderTransfersPage();
        }, 1500);

    } catch (error) {
        console.error('❌ Error creating transfer:', error);
        showTransferMessage('Error creating transfer. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Create Transfer';
    }
}

// Save transfer to Firebase
async function saveTransferToFirebase(transfer) {
    try {
        // Check if Firebase is available
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            await db.collection('transfers').doc(transfer.id).set(transfer);
            console.log('✅ Transfer saved to Firebase:', transfer.folio);
        } else {
            console.warn('⚠️ Firebase not available, using localStorage only');
        }
    } catch (error) {
        console.warn('⚠️ Could not save transfer to Firebase (blocked or error):', error.message);
        // Continue anyway - localStorage has the data
    }
}

// Show transfer form message
function showTransferMessage(message, type) {
    const messageEl = document.getElementById('transferMessage');
    if (messageEl) {
        messageEl.className = `alert ${type}`;
        messageEl.textContent = message;
        messageEl.style.display = 'block';
    }
}

// View transfer details - supports both old (single product) and new (multiple items) format
function viewTransferDetails(transferId) {
    const transfer = transfersState.transfers.find(t => t.id === transferId);
    if (!transfer) return;

    const modal = document.getElementById('transferDetailsModal');
    const title = document.getElementById('transferDetailsTitle');
    const body = document.getElementById('transferDetailsBody');

    if (!modal || !title || !body) return;

    const statusLabels = {
        'pending': 'Pending',
                'received': 'Received'
    };

    const hasMultipleItems = transfer.items && transfer.items.length > 0;
    const totalQty = hasMultipleItems ? transfer.totalItems : transfer.quantity;
    const productCount = hasMultipleItems ? transfer.items.length : 1;

    // Calculate boxes for detail view
    let totalBoxes = 0;
    if (hasMultipleItems) {
        transfer.items.forEach(item => {
            const name = (item.productName || '').toUpperCase();
            const isLargeBoxBrand = name.includes('GEEK BAR') || name.includes('FOGER') || name.includes('SUONON') || name.includes('KRAZE');
            if (isLargeBoxBrand && item.quantity >= 5) {
                totalBoxes += Math.round(item.quantity / 5);
            } else {
                totalBoxes += item.quantity;
            }
        });
    } else {
        totalBoxes = transfer.quantity || 1;
    }

    title.innerHTML = `<i class="fas fa-exchange-alt" style="color: var(--accent-primary); margin-right: 10px;"></i> ${transfer.folio}`;

    // Build items list HTML for multi-item transfers
    let itemsHtml = '';
    if (hasMultipleItems) {
        itemsHtml = `
            <div class="order-detail-section">
                <h3 style="display: flex; align-items: center; justify-content: space-between;">
                    <span>Products (${productCount} flavors)</span>
                    <span style="font-size: 14px; color: var(--accent-primary);">${totalQty} vapes · ${totalBoxes} boxes</span>
                </h3>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${transfer.items.map(item => `
                        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 10px; margin-bottom: 8px;">
                            <div style="min-width: 40px; height: 40px; background: linear-gradient(135deg, #667eea20, #764ba220); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #667eea;">
                                ${item.quantity}x
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: var(--text-primary);">${item.productName}</div>
                                <div style="font-size: 11px; color: var(--text-muted);">${item.productSku || ''}</div>
                            </div>
                            ${transfer.status !== 'received' ? `
                                <div style="display: flex; align-items: center; gap: 4px;">
                                    ${item.received ? '<i class="fas fa-check-circle" style="color: #10b981;"></i>' : '<i class="fas fa-clock" style="color: #f59e0b;"></i>'}
                                </div>
                            ` : '<i class="fas fa-check-circle" style="color: #10b981;"></i>'}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        // Old single-product format
        itemsHtml = `
            <div class="order-detail-section">
                <h3>Product</h3>
                <div class="order-detail-grid">
                    <div class="order-detail-item" style="grid-column: 1 / -1;">
                        <span class="order-detail-label">Name</span>
                        <span class="order-detail-value">${transfer.productName}</span>
                    </div>
                    ${transfer.productSku ? `
                        <div class="order-detail-item">
                            <span class="order-detail-label">SKU</span>
                            <span class="order-detail-value" style="font-family: 'Space Mono', monospace;">${transfer.productSku}</span>
                        </div>
                    ` : ''}
                    <div class="order-detail-item">
                        <span class="order-detail-label">Quantity</span>
                        <span class="order-detail-value" style="font-size: 24px; font-weight: 700; color: var(--accent-primary);">${transfer.quantity}</span>
                    </div>
                </div>
            </div>
        `;
    }

    body.innerHTML = `
        <div class="order-detail-section">
            <h3>Transfer Information</h3>
            <div class="order-detail-grid">
                <div class="order-detail-item">
                    <span class="order-detail-label">Folio</span>
                    <span class="order-detail-value transfer-folio">${transfer.folio}</span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Status</span>
                    <span class="order-detail-value">
                        <span class="transfer-status-badge ${transfer.status}">${statusLabels[transfer.status]}</span>
                    </span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">From</span>
                    <span class="order-detail-value">${getStoreName(transfer.storeOrigin)}</span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">To</span>
                    <span class="order-detail-value">${getStoreName(transfer.storeDestination)}</span>
                </div>
            </div>
        </div>

        ${itemsHtml}

        <div class="order-detail-section">
            <h3>Shipping</h3>
            <div class="order-detail-grid">
                <div class="order-detail-item">
                    <span class="order-detail-label">Ship Date</span>
                    <span class="order-detail-value">${new Date(transfer.shipDate).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Sent by</span>
                    <span class="order-detail-value">${transfer.sentBy}</span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Created</span>
                    <span class="order-detail-value">${new Date(transfer.createdAt).toLocaleString('en-US')}</span>
                </div>
                ${transfer.receivedAt ? `
                    <div class="order-detail-item">
                        <span class="order-detail-label">Received</span>
                        <span class="order-detail-value">${new Date(transfer.receivedAt).toLocaleString('en-US')}</span>
                    </div>
                    <div class="order-detail-item">
                        <span class="order-detail-label">Received by</span>
                        <span class="order-detail-value">${transfer.receivedBy}</span>
                    </div>
                ` : ''}
            </div>
        </div>

        ${transfer.notes ? `
            <div class="order-detail-section">
                <h3>Notes</h3>
                <div class="order-detail-item">
                    <span class="order-detail-value">${transfer.notes}</span>
                </div>
            </div>
        ` : ''}

        ${transfer.photo ? `
            <div class="order-detail-section">
                <h3>Photo</h3>
                <div style="border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color);">
                    <img src="${transfer.photo}" alt="Transfer photo" style="width: 100%; height: auto; display: block; cursor: pointer;" onclick="window.open(this.src, '_blank')">
                </div>
            </div>
        ` : ''}

        ${transfer.status !== 'received' ? `
            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-color);">
                <button class="btn-primary" onclick="confirmReceiveTransfer('${transfer.id}'); closeTransferDetailsModal();" style="width: 100%;">
                    <i class="fas fa-check"></i>
                    Confirm Receipt of All Items
                </button>
            </div>
        ` : ''}
    `;

    modal.classList.add('active');
}

// Close transfer details modal
function closeTransferDetailsModal() {
    const modal = document.getElementById('transferDetailsModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Open receive transfer modal with photo capture
function confirmReceiveTransfer(transferId) {
    const transfer = transfersState.transfers.find(t => t.id === transferId);
    if (!transfer) {
        showTransferToast('Transfer not found', 'error');
        return;
    }

    if (transfer.status === 'received') {
        showTransferToast('This transfer has already been received', 'warning');
        return;
    }

    const hasMultipleItems = transfer.items && transfer.items.length > 0;
    const totalQty = hasMultipleItems ? transfer.totalItems : transfer.quantity;
    const productCount = hasMultipleItems ? transfer.items.length : 1;

    // Build items list
    let itemsHtml = '';
    if (hasMultipleItems) {
        itemsHtml = transfer.items.map(item => `
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 6px;">
                <div style="min-width: 35px; height: 35px; background: linear-gradient(135deg, #10b98120, #05966920); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; color: #10b981;">
                    ${item.quantity}x
                </div>
                <div style="flex: 1; font-size: 13px; font-weight: 500;">${item.productName}</div>
            </div>
        `).join('');
    } else {
        itemsHtml = `
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-secondary); border-radius: 8px;">
                <div style="min-width: 35px; height: 35px; background: linear-gradient(135deg, #10b98120, #05966920); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; color: #10b981;">
                    ${transfer.quantity}x
                </div>
                <div style="flex: 1; font-size: 13px; font-weight: 500;">${transfer.productName}</div>
            </div>
        `;
    }

    // Create modal
    let modal = document.getElementById('receiveTransferModal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'receiveTransferModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 450px; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px 24px; position: relative;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-box-open" style="color: white; font-size: 20px;"></i>
                    </div>
                    <div>
                        <h3 style="color: white; margin: 0; font-size: 18px; font-weight: 700;">Receive Transfer</h3>
                        <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 12px;">${transfer.folio} • ${productCount} product${productCount > 1 ? 's' : ''}</p>
                    </div>
                </div>
                <button onclick="closeReceiveModal()" style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.2); border: none; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-times" style="color: white; font-size: 16px;"></i>
                </button>
            </div>

            <div style="padding: 20px;">
                <!-- Transfer Info -->
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 12px; background: var(--bg-secondary); border-radius: 10px;">
                    <span style="font-size: 13px; color: var(--text-muted);">From</span>
                    <span style="font-weight: 600; color: var(--text-primary);">${getStoreName(transfer.storeOrigin)}</span>
                    <i class="fas fa-arrow-right" style="color: var(--text-muted); margin: 0 4px;"></i>
                    <span style="font-weight: 600; color: #10b981;">${getStoreName(transfer.storeDestination)}</span>
                </div>

                <!-- Items List -->
                <div style="margin-bottom: 16px;">
                    <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase;">Products to receive (${totalQty} units)</div>
                    <div style="max-height: 150px; overflow-y: auto;">
                        ${itemsHtml}
                    </div>
                </div>

                <!-- Photo Capture -->
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase;">
                        <i class="fas fa-camera"></i> Photo Confirmation
                    </div>
                    <div id="receivePhotoSection" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.08)); border: 2px dashed rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 20px; text-align: center; cursor: pointer;" onclick="document.getElementById('receivePhotoInput').click()">
                        <input type="file" id="receivePhotoInput" accept="image/*" capture="environment" style="display: none;" onchange="previewReceivePhoto(this)">
                        <div id="receivePhotoPreview" style="display: none;">
                            <img id="receivePhotoImg" style="max-width: 100%; max-height: 150px; border-radius: 8px; margin-bottom: 8px;">
                            <div style="font-size: 12px; color: #10b981;"><i class="fas fa-check-circle"></i> Photo added</div>
                        </div>
                        <div id="receivePhotoPlaceholder">
                            <i class="fas fa-camera" style="font-size: 32px; color: #10b981; margin-bottom: 8px;"></i>
                            <div style="font-weight: 600; color: var(--text-primary);">Take photo of received products</div>
                            <div style="font-size: 12px; color: var(--text-muted);">Tap to open camera</div>
                        </div>
                    </div>
                </div>

                <!-- Confirm Button -->
                <button onclick="processReceiveTransfer('${transferId}')" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <i class="fas fa-check-circle"></i> Confirm Receipt
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Preview receive photo
function previewReceivePhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('receivePhotoImg').src = e.target.result;
            document.getElementById('receivePhotoPreview').style.display = 'block';
            document.getElementById('receivePhotoPlaceholder').style.display = 'none';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Close receive modal
function closeReceiveModal() {
    const modal = document.getElementById('receiveTransferModal');
    if (modal) modal.remove();
}

// Process the actual receive
async function processReceiveTransfer(transferId) {
    const transfer = transfersState.transfers.find(t => t.id === transferId);
    if (!transfer) return;

    // Get photo if taken
    const photoInput = document.getElementById('receivePhotoInput');
    let receivePhotoUrl = null;

    if (photoInput && photoInput.files && photoInput.files[0]) {
        // Convert to base64 for storage
        receivePhotoUrl = document.getElementById('receivePhotoImg').src;
    }

    // Get current user
    let receivedBy = 'Staff';
    try {
        const user = JSON.parse(localStorage.getItem('ascendance_user') || '{}');
        receivedBy = user.name || user.email || 'Staff';
    } catch (e) {
        console.warn('Could not get current user');
    }

    // Update transfer
    transfer.status = 'received';
    transfer.receivedAt = new Date().toISOString();
    transfer.receivedBy = receivedBy;
    if (receivePhotoUrl) {
        transfer.receivePhoto = receivePhotoUrl;
    }

    // Save to localStorage
    saveTransfers();

    // Try to update in Firebase
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            const updateData = {
                status: 'received',
                receivedAt: transfer.receivedAt,
                receivedBy: transfer.receivedBy
            };
            // Don't save base64 photo to Firebase (too large), just mark as hasPhoto
            if (receivePhotoUrl) {
                updateData.hasReceivePhoto = true;
            }
            await db.collection('transfers').doc(transfer.id).update(updateData);
            console.log('✅ Transfer received in Firebase:', transfer.folio);
        }
    } catch (error) {
        console.warn('⚠️ Could not update transfer in Firebase:', error);
    }

    // Send notification to sender (Loyal Vaper)
    await sendTransferNotification(transfer, 'received');

    // Close modal
    closeReceiveModal();
    closeTransferDetailsModal();

    // Show success
    if (typeof showNotification === 'function') {
        showNotification(`Transfer ${transfer.folio} received!`, 'success');
    } else {
        showTransferToast(`Transfer ${transfer.folio} received!`, 'success');
    }

    // Refresh page
    renderTransfersPage();
}

// Check URL params and show transfers page if needed
function checkTransfersPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');

    if (page === 'transfers') {
        showTransfersPage();
    }
}

// Show transfers page (hide orders, show transfers)
function showTransfersPage() {
    // Update page title
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = 'Store Transfers';
    }

    // Update search placeholder
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        searchInput.placeholder = 'Search transfers...';
    }

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === 'transfers') {
            item.classList.add('active');
        }
    });

    // Initialize and render transfers
    initializeTransfersModule();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we should show transfers page
    setTimeout(checkTransfersPage, 100);
});

// ========================================
// AI TRANSFER ASSISTANT
// ========================================

// State for AI transfer
let aiTransferState = {
    parsedItems: [],
    isProcessing: false,
    mediaFiles: [], // Store multiple media files (images, videos, audio)
    processedPhoto: null // Store the photo after processing for transfer record
};

// Open AI Transfer Modal
function openAITransferModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('aiTransferModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'aiTransferModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 520px; max-height: 90vh; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); display: flex; flex-direction: column;">
                <div class="modal-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px 24px; position: relative;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-wand-magic-sparkles" style="color: white; font-size: 20px;"></i>
                        </div>
                        <div>
                            <h3 style="color: white; margin: 0; font-size: 18px; font-weight: 700;">AI Transfer</h3>
                            <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 12px;">Scan products with AI vision</p>
                        </div>
                    </div>
                    <button onclick="closeAITransferModal()" style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.2); border: none; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                            <i class="fas fa-times" style="color: white; font-size: 16px;"></i>
                        </button>
                </div>
                <div class="modal-body" style="padding: 24px; overflow-y: auto; flex: 1;">
                    <!-- Location Selectors -->
                    <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: end; margin-bottom: 24px;">
                        <div>
                            <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">From</label>
                            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px 14px; display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-warehouse" style="color: #667eea; font-size: 16px;"></i>
                                <select id="aiTransferOrigin" style="background: transparent; border: none; color: var(--text-primary); font-size: 13px; font-weight: 600; width: 100%; cursor: pointer; outline: none;">
                                    <option value="loyalvaper" selected>Loyal Vaper</option>
                                </select>
                            </div>
                        </div>
                        <div style="padding-bottom: 8px;">
                            <i class="fas fa-arrow-right" style="color: var(--text-muted); font-size: 14px;"></i>
                        </div>
                        <div>
                            <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">To</label>
                            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px 14px; display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-store" style="color: #10b981; font-size: 16px;"></i>
                                <select id="aiTransferDestination" style="background: transparent; border: none; color: var(--text-primary); font-size: 13px; font-weight: 600; width: 100%; cursor: pointer; outline: none;">
                                    <option value="">Select store</option>
                                    <option value="2">Morena</option>
                                    <option value="3">Kearny Mesa</option>
                                    <option value="4">Chula Vista</option>
                                    <option value="5">North Park</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Media Scan Section - Photos, Videos, Audio with DRAG & DROP -->
                    <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08)); border: 2px dashed rgba(102, 126, 234, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 20px; transition: all 0.3s ease;" id="aiTransferMediaSection"
                         ondragover="handleDragOver(event)"
                         ondragleave="handleDragLeave(event)"
                         ondrop="handleDrop(event)">
                        <input type="file" id="aiTransferMediaInput" accept="image/*,image/heic,image/heif,.heic,.heif,video/*,audio/*" multiple style="display: none;" onchange="processTransferMedia(this)">

                        <!-- Preview Container for multiple files -->
                        <div id="aiTransferMediaPreview" style="display: none; margin-bottom: 16px;">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                <span style="font-size: 12px; font-weight: 600; color: var(--text-primary);" id="aiTransferMediaCount">0 files</span>
                                <button onclick="clearTransferMedia()" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: 600;">
                                    <i class="fas fa-trash"></i> Clear All
                                </button>
                            </div>
                            <div id="aiTransferMediaGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px; max-height: 150px; overflow-y: auto;"></div>
                        </div>

                        <!-- Upload Placeholder -->
                        <div id="aiTransferMediaPlaceholder">
                            <label for="aiTransferMediaInput" style="cursor: pointer; display: block; text-align: center;">
                                <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 12px;">
                                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-camera" style="color: white; font-size: 18px;"></i>
                                    </div>
                                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-video" style="color: white; font-size: 18px;"></i>
                                    </div>
                                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-microphone" style="color: white; font-size: 18px;"></i>
                                    </div>
                                </div>
                                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">Scan Products</div>
                                <div style="font-size: 12px; color: var(--text-muted);">Tap to select files</div>
                            </label>

                            <!-- Quick action buttons for mobile -->
                            <div style="display: flex; gap: 10px; margin-top: 12px; justify-content: center;">
                                <button onclick="openCameraForTransfer()" style="flex: 1; max-width: 140px; padding: 12px 16px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; font-size: 13px;">
                                    <i class="fas fa-camera"></i> Camera
                                </button>
                                <button onclick="document.getElementById('aiTransferMediaInput').click()" style="flex: 1; max-width: 140px; padding: 12px 16px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; font-size: 13px;">
                                    <i class="fas fa-images"></i> Gallery
                                </button>
                            </div>
                        </div>

                        <!-- Hidden camera input -->
                        <input type="file" id="aiTransferCameraInput" accept="image/*" capture="environment" style="display: none;" onchange="processTransferMedia(this)">

                        <!-- Drag overlay indicator -->
                        <div id="aiTransferDragOverlay" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(102, 126, 234, 0.15); border-radius: 14px; display: none; align-items: center; justify-content: center; pointer-events: none;">
                            <div style="text-align: center;">
                                <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #667eea; margin-bottom: 8px;"></i>
                                <div style="font-weight: 600; color: #667eea;">Drop files here!</div>
                            </div>
                        </div>

                        <!-- Process Button -->
                        <button id="aiTransferProcessBtn" onclick="processAllTransferMedia()" style="display: none; width: 100%; margin-top: 12px; padding: 12px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">
                            <i class="fas fa-wand-magic-sparkles"></i> Analyze with AI
                        </button>
                    </div>

                    <!-- Manual Input (Collapsed) -->
                    <details style="margin-bottom: 20px;">
                        <summary style="font-size: 12px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                            <i class="fas fa-keyboard"></i> Or type manually
                        </summary>
                        <div style="display: flex; gap: 8px; margin-top: 12px;">
                            <textarea id="aiTransferInput" placeholder="5 Lost Mary Watermelon&#10;10 Elf Bar Blueberry..." style="flex: 1; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px; font-size: 13px; resize: none; height: 80px; color: var(--text-primary);"></textarea>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <button onclick="parseAITransferInput()" style="width: 44px; height: 44px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Parse">
                                    <i class="fas fa-wand-magic-sparkles"></i>
                                </button>
                                <button onclick="startVoiceInput()" style="width: 44px; height: 36px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Voice">
                                    <i class="fas fa-microphone" style="color: var(--text-muted);"></i>
                                </button>
                            </div>
                        </div>
                    </details>

                    <!-- Results Section -->
                    <div id="aiTransferResults" style="display: none;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                            <h4 style="margin: 0; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-box-open" style="color: #10b981;"></i> Products Found
                            </h4>
                            <span id="aiTransferItemCount" style="background: var(--bg-secondary); padding: 4px 10px; border-radius: 20px; font-size: 12px; color: var(--text-muted);"></span>
                        </div>
                        <div id="aiTransferItemsList" style="max-height: 200px; overflow-y: auto; margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px;"></div>

                        <!-- Action Buttons - Mobile friendly (min 48px height) -->
                        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                            <button onclick="closeAITransferModal()" style="padding: 16px; min-height: 52px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; font-weight: 600; font-size: 15px; color: var(--text-secondary); cursor: pointer; -webkit-tap-highlight-color: transparent;">Cancel</button>
                            <button id="aiTransferSubmitBtn" onclick="createAITransfers()" style="padding: 16px; min-height: 52px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 12px; font-weight: 600; font-size: 15px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; -webkit-tap-highlight-color: transparent;">
                                <i class="fas fa-check-circle"></i> Create Transfer
                            </button>
                        </div>
                    </div>

                    <div id="aiTransferLoading" style="display: none; text-align: center; padding: 20px;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #8b5cf6;"></i>
                        <p style="margin-top: 10px; color: var(--text-muted);">Processing with AI...</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Reset state
    aiTransferState.parsedItems = [];
    aiTransferState.mediaFiles.forEach(m => URL.revokeObjectURL(m.url));
    aiTransferState.mediaFiles = [];
    aiTransferState.processedPhoto = null;

    document.getElementById('aiTransferInput').value = '';
    document.getElementById('aiTransferResults').style.display = 'none';
    document.getElementById('aiTransferLoading').style.display = 'none';

    // Reset media section
    const mediaPreview = document.getElementById('aiTransferMediaPreview');
    const mediaPlaceholder = document.getElementById('aiTransferMediaPlaceholder');
    const mediaInput = document.getElementById('aiTransferMediaInput');
    const processBtn = document.getElementById('aiTransferProcessBtn');

    if (mediaPreview) mediaPreview.style.display = 'none';
    if (mediaPlaceholder) mediaPlaceholder.style.display = 'block';
    if (mediaInput) mediaInput.value = '';
    if (processBtn) processBtn.style.display = 'none';

    modal.classList.add('active');
}

// Close AI Transfer Modal
function closeAITransferModal() {
    const modal = document.getElementById('aiTransferModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ========================================
// UNIFIED TRANSFER MODAL
// ========================================

// State for unified transfer
let unifiedTransferState = {
    items: [],
    activeTab: 'ai', // 'ai' or 'search'
    mediaFiles: [],
    processedPhoto: null
};

// Open Unified Transfer Modal
function openUnifiedTransferModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('unifiedTransferModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'unifiedTransferModal';
        modal.className = 'modal';
        modal.innerHTML = getUnifiedTransferModalHTML();
        document.body.appendChild(modal);
    }

    // Reset state
    unifiedTransferState.items = [];
    unifiedTransferState.mediaFiles = [];
    unifiedTransferState.processedPhoto = null;
    unifiedTransferState.activeTab = 'ai';

    // Reset form fields
    const modal2 = document.getElementById('unifiedTransferModal');
    if (modal2) {
        const textInput = modal2.querySelector('#unifiedTransferInput');
        if (textInput) textInput.value = '';

        const searchInput = modal2.querySelector('#unifiedProductSearch');
        if (searchInput) searchInput.value = '';

        const searchResults = modal2.querySelector('#unifiedSearchResults');
        if (searchResults) searchResults.style.display = 'none';
    }

    // Render items and update UI
    renderUnifiedItems();
    updateUnifiedTabUI();

    // Reset media section
    resetUnifiedMediaSection();

    modal.classList.add('active');
}

// Get HTML for unified modal
function getUnifiedTransferModalHTML() {
    return `
        <style>
            @media (max-width: 480px) {
                #unifiedTransferModal .modal-content { margin: 10px; max-height: calc(100vh - 20px) !important; }
                #unifiedTransferModal .store-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
                #unifiedTransferModal .store-arrow { display: none !important; }
                #unifiedTransferModal .tab-buttons { flex-wrap: wrap; }
                #unifiedTransferModal .tab-buttons button { flex: 1 1 30%; min-width: 90px; padding: 8px 10px !important; font-size: 11px !important; }
                #unifiedTransferModal .tab-buttons button i { display: none; }
            }
        </style>
        <div class="modal-content" style="max-width: 560px; max-height: 90vh; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); display: flex; flex-direction: column; margin: 20px;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 16px 20px; position: relative;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-exchange-alt" style="color: white; font-size: 16px;"></i>
                    </div>
                    <div>
                        <h3 style="color: white; margin: 0; font-size: 16px; font-weight: 700;">New Transfer</h3>
                        <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 11px;">AI scan, search or manual</p>
                    </div>
                </div>
                <button onclick="closeUnifiedTransferModal()" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.2); border: none; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-times" style="color: white; font-size: 16px;"></i>
                </button>
            </div>

            <div class="modal-body" style="padding: 16px 20px; overflow-y: auto; flex: 1;">
                <!-- Store Selection -->
                <div class="store-grid" style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px; align-items: end; margin-bottom: 16px;">
                    <div>
                        <label style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">From</label>
                        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; padding: 8px 10px; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-warehouse" style="color: #6366f1; font-size: 12px;"></i>
                            <select id="unifiedTransferOrigin" onchange="handleUnifiedOriginChange()" style="background: transparent; border: none; color: var(--text-primary); font-size: 12px; font-weight: 600; width: 100%; cursor: pointer; outline: none;">
                                <option value="">Select</option>
                                <option value="1">Miramar</option>
                                <option value="2">Morena</option>
                                <option value="3">Kearny Mesa</option>
                                <option value="4">Chula Vista</option>
                                <option value="5">North Park</option>
                                <option value="6">Loyal Vaper</option>
                            </select>
                        </div>
                    </div>
                    <div class="store-arrow" style="padding-bottom: 6px;">
                        <i class="fas fa-arrow-right" style="color: var(--text-muted); font-size: 12px;"></i>
                    </div>
                    <div>
                        <label style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">To</label>
                        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; padding: 8px 10px; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-store" style="color: #10b981; font-size: 12px;"></i>
                            <select id="unifiedTransferDestination" style="background: transparent; border: none; color: var(--text-primary); font-size: 12px; font-weight: 600; width: 100%; cursor: pointer; outline: none;">
                                <option value="">Select</option>
                                <option value="1">Miramar</option>
                                <option value="2">Morena</option>
                                <option value="3">Kearny Mesa</option>
                                <option value="4">Chula Vista</option>
                                <option value="5">North Park</option>
                                <option value="6">Loyal Vaper</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Tabs - 3 options -->
                <div class="tab-buttons" style="display: flex; gap: 6px; margin-bottom: 14px; background: var(--bg-secondary); padding: 4px; border-radius: 10px;">
                    <button id="unifiedTabAI" onclick="switchUnifiedTab('ai')" style="flex: 1; padding: 10px 12px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;">
                        <i class="fas fa-wand-magic-sparkles"></i> AI Scan
                    </button>
                    <button id="unifiedTabSearch" onclick="switchUnifiedTab('search')" style="flex: 1; padding: 10px 12px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; background: transparent; color: var(--text-muted);">
                        <i class="fas fa-search"></i> Search
                    </button>
                    <button id="unifiedTabManual" onclick="switchUnifiedTab('manual')" style="flex: 1; padding: 10px 12px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; background: transparent; color: var(--text-muted);">
                        <i class="fas fa-keyboard"></i> Manual
                    </button>
                </div>

                <!-- AI Scan Section -->
                <div id="unifiedAISection">
                    <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08)); border: 2px dashed rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 14px; position: relative;" id="unifiedMediaDropzone"
                         ondragover="handleUnifiedDragOver(event)"
                         ondragleave="handleUnifiedDragLeave(event)"
                         ondrop="handleUnifiedDrop(event)">

                        <input type="file" id="unifiedMediaInput" accept="image/*,image/heic,image/heif,.heic,.heif,video/*,audio/*" multiple style="display: none;" onchange="processUnifiedMedia(this)">
                        <input type="file" id="unifiedCameraInput" accept="image/*" capture="environment" style="display: none;" onchange="processUnifiedMedia(this)">

                        <!-- Media Preview -->
                        <div id="unifiedMediaPreview" style="display: none; margin-bottom: 10px;">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                                <span style="font-size: 11px; font-weight: 600; color: var(--text-primary);" id="unifiedMediaCount">0 files</span>
                                <button onclick="clearUnifiedMedia()" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 600;">
                                    <i class="fas fa-trash"></i> Clear
                                </button>
                            </div>
                            <div id="unifiedMediaGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 6px; max-height: 100px; overflow-y: auto;"></div>
                        </div>

                        <!-- Upload Placeholder -->
                        <div id="unifiedMediaPlaceholder">
                            <div style="text-align: center; padding: 6px 0;">
                                <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 8px;">
                                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-camera" style="color: white; font-size: 14px;"></i>
                                    </div>
                                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-video" style="color: white; font-size: 14px;"></i>
                                    </div>
                                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-microphone" style="color: white; font-size: 14px;"></i>
                                    </div>
                                </div>
                                <div style="font-weight: 600; color: var(--text-primary); font-size: 12px;">Scan with AI</div>
                                <div style="font-size: 10px; color: var(--text-muted);">Photos, videos, or audio</div>
                            </div>
                            <div style="display: flex; gap: 8px; margin-top: 10px;">
                                <button onclick="openUnifiedCamera()" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 600; font-size: 13px; min-height: 48px;">
                                    <i class="fas fa-camera"></i> Camera
                                </button>
                                <button onclick="document.getElementById('unifiedMediaInput').click()" style="flex: 1; padding: 12px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 600; font-size: 13px; min-height: 48px;">
                                    <i class="fas fa-images"></i> Gallery
                                </button>
                            </div>
                        </div>

                        <!-- Process Button -->
                        <button id="unifiedProcessBtn" onclick="processUnifiedWithAI()" style="display: none; width: 100%; margin-top: 10px; padding: 14px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 14px; min-height: 48px;">
                            <i class="fas fa-wand-magic-sparkles"></i> Analyze with AI
                        </button>
                    </div>
                </div>

                <!-- Search Section -->
                <div id="unifiedSearchSection" style="display: none;">
                    <div style="position: relative; margin-bottom: 12px;">
                        <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 14px;"></i>
                        <input type="text" id="unifiedProductSearch" placeholder="Search by name, SKU, or brand..." autocomplete="off" style="width: 100%; padding: 14px 14px 14px 40px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; box-sizing: border-box; transition: all 0.2s;" onfocus="this.style.borderColor='#8b5cf6'; this.style.background='var(--bg-primary)'" onblur="this.style.borderColor='var(--border-color)'; this.style.background='var(--bg-secondary)'" oninput="searchUnifiedProducts(this.value)">
                        <div id="unifiedSearchLoading" style="display: none; position: absolute; right: 14px; top: 50%; transform: translateY(-50%);">
                            <i class="fas fa-spinner fa-spin" style="color: #8b5cf6;"></i>
                        </div>
                    </div>
                    <div id="unifiedSearchResults" style="display: none; background: var(--bg-primary); border: 2px solid var(--border-color); border-radius: 12px; max-height: 200px; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.15);"></div>
                </div>

                <!-- Manual Section -->
                <div id="unifiedManualSection" style="display: none;">
                    <div style="margin-bottom: 12px;">
                        <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">
                            <i class="fas fa-edit" style="margin-right: 4px;"></i> Type products manually
                        </label>
                        <textarea id="unifiedTransferInput" placeholder="Enter products with quantities:&#10;&#10;5 Lost Mary Watermelon&#10;10 Elf Bar Blueberry&#10;3 Geek Bar Strawberry" style="width: 100%; background: var(--bg-secondary); border: 2px solid var(--border-color); border-radius: 12px; padding: 14px; font-size: 14px; resize: none; height: 120px; color: var(--text-primary); box-sizing: border-box; font-family: inherit; line-height: 1.5;" onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'"></textarea>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="parseUnifiedTextInput()" style="flex: 1; padding: 14px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; font-size: 14px; min-height: 48px;">
                            <i class="fas fa-plus-circle"></i> Add Products
                        </button>
                        <button onclick="startUnifiedVoiceInput()" style="width: 52px; min-height: 48px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Voice Input">
                            <i class="fas fa-microphone" style="color: var(--text-muted); font-size: 18px;"></i>
                        </button>
                    </div>
                </div>

                <!-- Loading Indicator -->
                <div id="unifiedLoading" style="display: none; text-align: center; padding: 20px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #8b5cf6;"></i>
                    <p style="margin-top: 10px; color: var(--text-muted); font-size: 13px;">Processing with AI...</p>
                </div>

                <!-- Items List -->
                <div id="unifiedItemsSection" style="display: none; margin-top: 16px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                        <h4 style="margin: 0; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-box-open" style="color: #10b981;"></i> Products to Transfer
                        </h4>
                        <span id="unifiedItemCount" style="background: var(--bg-secondary); padding: 3px 10px; border-radius: 20px; font-size: 11px; color: var(--text-muted);"></span>
                    </div>
                    <div id="unifiedItemsList" style="max-height: 160px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;"></div>
                </div>

                <!-- Action Buttons -->
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-color);">
                    <button onclick="closeUnifiedTransferModal()" style="padding: 14px; min-height: 52px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; font-weight: 600; font-size: 14px; color: var(--text-secondary); cursor: pointer;">Cancel</button>
                    <button id="unifiedSubmitBtn" onclick="createUnifiedTransfer()" style="padding: 14px; min-height: 52px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 12px; font-weight: 600; font-size: 14px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; opacity: 0.5;" disabled>
                        <i class="fas fa-paper-plane"></i> Create Transfer
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Close Unified Transfer Modal
function closeUnifiedTransferModal() {
    const modal = document.getElementById('unifiedTransferModal');
    if (modal) {
        modal.classList.remove('active');
    }
    // Clean up media URLs
    unifiedTransferState.mediaFiles.forEach(m => {
        if (m.url) URL.revokeObjectURL(m.url);
    });
}

// Switch tabs in unified modal
function switchUnifiedTab(tab) {
    unifiedTransferState.activeTab = tab;
    updateUnifiedTabUI();
}

// Update tab UI
function updateUnifiedTabUI() {
    const aiTab = document.getElementById('unifiedTabAI');
    const searchTab = document.getElementById('unifiedTabSearch');
    const manualTab = document.getElementById('unifiedTabManual');
    const aiSection = document.getElementById('unifiedAISection');
    const searchSection = document.getElementById('unifiedSearchSection');
    const manualSection = document.getElementById('unifiedManualSection');

    // Reset all tabs
    [aiTab, searchTab, manualTab].forEach(tab => {
        if (tab) {
            tab.style.background = 'transparent';
            tab.style.color = 'var(--text-muted)';
        }
    });

    // Hide all sections
    if (aiSection) aiSection.style.display = 'none';
    if (searchSection) searchSection.style.display = 'none';
    if (manualSection) manualSection.style.display = 'none';

    // Show active tab and section
    if (unifiedTransferState.activeTab === 'ai') {
        if (aiTab) {
            aiTab.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
            aiTab.style.color = 'white';
        }
        if (aiSection) aiSection.style.display = 'block';
    } else if (unifiedTransferState.activeTab === 'search') {
        if (searchTab) {
            searchTab.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
            searchTab.style.color = 'white';
        }
        if (searchSection) searchSection.style.display = 'block';
    } else if (unifiedTransferState.activeTab === 'manual') {
        if (manualTab) {
            manualTab.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
            manualTab.style.color = 'white';
        }
        if (manualSection) manualSection.style.display = 'block';
    }
}

// Handle origin store change
function handleUnifiedOriginChange() {
    const origin = document.getElementById('unifiedTransferOrigin')?.value;
    const destSelect = document.getElementById('unifiedTransferDestination');

    if (!destSelect) return;

    // Enable all options first
    Array.from(destSelect.options).forEach(option => {
        option.disabled = false;
    });

    // Disable same store
    if (origin) {
        Array.from(destSelect.options).forEach(option => {
            if (option.value === origin) {
                option.disabled = true;
            }
        });
        if (destSelect.value === origin) {
            destSelect.value = '';
        }
    }
}

// Reset media section
function resetUnifiedMediaSection() {
    const preview = document.getElementById('unifiedMediaPreview');
    const placeholder = document.getElementById('unifiedMediaPlaceholder');
    const processBtn = document.getElementById('unifiedProcessBtn');
    const mediaInput = document.getElementById('unifiedMediaInput');

    if (preview) preview.style.display = 'none';
    if (placeholder) placeholder.style.display = 'block';
    if (processBtn) processBtn.style.display = 'none';
    if (mediaInput) mediaInput.value = '';

    unifiedTransferState.mediaFiles = [];
}

// Open camera for unified modal
function openUnifiedCamera() {
    document.getElementById('unifiedCameraInput')?.click();
}

// Process unified media files
function processUnifiedMedia(input) {
    const files = Array.from(input.files);
    if (!files.length) return;

    files.forEach(file => {
        const fileType = file.type.startsWith('image/') ? 'image' :
                        file.type.startsWith('video/') ? 'video' :
                        file.type.startsWith('audio/') ? 'audio' : 'unknown';

        const mediaObj = {
            file: file,
            type: fileType,
            name: file.name,
            url: URL.createObjectURL(file)
        };

        unifiedTransferState.mediaFiles.push(mediaObj);
    });

    renderUnifiedMediaPreview();
    input.value = '';
}

// Render media preview
function renderUnifiedMediaPreview() {
    const preview = document.getElementById('unifiedMediaPreview');
    const placeholder = document.getElementById('unifiedMediaPlaceholder');
    const grid = document.getElementById('unifiedMediaGrid');
    const count = document.getElementById('unifiedMediaCount');
    const processBtn = document.getElementById('unifiedProcessBtn');

    if (!unifiedTransferState.mediaFiles.length) {
        if (preview) preview.style.display = 'none';
        if (placeholder) placeholder.style.display = 'block';
        if (processBtn) processBtn.style.display = 'none';
        return;
    }

    if (preview) preview.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
    if (processBtn) processBtn.style.display = 'block';
    if (count) count.textContent = `${unifiedTransferState.mediaFiles.length} file${unifiedTransferState.mediaFiles.length > 1 ? 's' : ''}`;

    if (grid) {
        grid.innerHTML = unifiedTransferState.mediaFiles.map((media, index) => {
            if (media.type === 'image') {
                return `<div style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: var(--bg-tertiary);">
                    <img src="${media.url}" style="width: 100%; height: 100%; object-fit: cover;">
                    <button onclick="removeUnifiedMedia(${index})" style="position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; background: rgba(0,0,0,0.6); border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 10px;">×</button>
                </div>`;
            } else if (media.type === 'video') {
                return `<div style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-video" style="color: white; font-size: 20px;"></i>
                    <button onclick="removeUnifiedMedia(${index})" style="position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; background: rgba(0,0,0,0.6); border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 10px;">×</button>
                </div>`;
            } else {
                return `<div style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-microphone" style="color: white; font-size: 20px;"></i>
                    <button onclick="removeUnifiedMedia(${index})" style="position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; background: rgba(0,0,0,0.6); border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 10px;">×</button>
                </div>`;
            }
        }).join('');
    }
}

// Remove media file
function removeUnifiedMedia(index) {
    const media = unifiedTransferState.mediaFiles[index];
    if (media && media.url) {
        URL.revokeObjectURL(media.url);
    }
    unifiedTransferState.mediaFiles.splice(index, 1);
    renderUnifiedMediaPreview();
}

// Clear all media
function clearUnifiedMedia() {
    unifiedTransferState.mediaFiles.forEach(m => {
        if (m.url) URL.revokeObjectURL(m.url);
    });
    unifiedTransferState.mediaFiles = [];
    renderUnifiedMediaPreview();
}

// Handle drag and drop
function handleUnifiedDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = document.getElementById('unifiedMediaDropzone');
    if (dropzone) {
        dropzone.style.borderColor = '#6366f1';
        dropzone.style.background = 'rgba(99, 102, 241, 0.15)';
    }
}

function handleUnifiedDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = document.getElementById('unifiedMediaDropzone');
    if (dropzone) {
        dropzone.style.borderColor = 'rgba(99, 102, 241, 0.3)';
        dropzone.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08))';
    }
}

function handleUnifiedDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    const dropzone = document.getElementById('unifiedMediaDropzone');
    if (dropzone) {
        dropzone.style.borderColor = 'rgba(99, 102, 241, 0.3)';
        dropzone.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08))';
    }

    const files = Array.from(event.dataTransfer.files);
    files.forEach(file => {
        const fileType = file.type.startsWith('image/') ? 'image' :
                        file.type.startsWith('video/') ? 'video' :
                        file.type.startsWith('audio/') ? 'audio' : 'unknown';

        if (fileType !== 'unknown') {
            unifiedTransferState.mediaFiles.push({
                file: file,
                type: fileType,
                name: file.name,
                url: URL.createObjectURL(file)
            });
        }
    });

    renderUnifiedMediaPreview();
}

// Process media with AI (uses existing AI transfer functions)
async function processUnifiedWithAI() {
    const loading = document.getElementById('unifiedLoading');
    const processBtn = document.getElementById('unifiedProcessBtn');

    if (!unifiedTransferState.mediaFiles.length) {
        showTransferToast('Please add photos, videos, or audio first', 'warning');
        return;
    }

    if (loading) loading.style.display = 'block';
    if (processBtn) processBtn.style.display = 'none';

    try {
        // Store processed photo before clearing
        if (unifiedTransferState.mediaFiles.length > 0) {
            const firstImage = unifiedTransferState.mediaFiles.find(m => m.type === 'image');
            if (firstImage) {
                const base64 = await fileToBase64(firstImage.file);
                unifiedTransferState.processedPhoto = base64;
            }
        }

        // Use existing AI processing function
        aiTransferState.mediaFiles = unifiedTransferState.mediaFiles.map(m => ({...m}));
        await processAllTransferMedia();

        // Copy parsed items to unified state
        unifiedTransferState.items = [...aiTransferState.parsedItems];

        renderUnifiedItems();

        // Clear media after processing
        clearUnifiedMedia();

    } catch (error) {
        console.error('Error processing media:', error);
        showTransferToast('Error processing media: ' + error.message, 'error');
    }

    if (loading) loading.style.display = 'none';
}

// Parse manual text input
function parseUnifiedTextInput() {
    const input = document.getElementById('unifiedTransferInput')?.value.trim();
    if (!input) {
        showTransferToast('Please enter products to add', 'warning');
        return;
    }

    const items = simpleParseTransferInput(input);
    if (items.length === 0) {
        showTransferToast('Could not parse any items', 'error');
        return;
    }

    // Add to existing items
    unifiedTransferState.items.push(...items);
    renderUnifiedItems();

    // Clear input
    document.getElementById('unifiedTransferInput').value = '';
    showTransferToast(`Added ${items.length} product${items.length > 1 ? 's' : ''}`, 'success');
}

// Voice input for unified modal
function startUnifiedVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showTransferToast('Voice recognition not supported. Try Chrome.', 'warning');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('unifiedTransferInput');
        if (input) {
            input.value = (input.value ? input.value + '\n' : '') + transcript;
        }
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        showTransferToast('Voice recognition error', 'error');
    };

    recognition.start();
    showTransferToast('Listening...', 'info');
}

// Search products in unified modal
let unifiedSearchDebounce;
async function searchUnifiedProducts(query) {
    const resultsContainer = document.getElementById('unifiedSearchResults');
    const loading = document.getElementById('unifiedSearchLoading');

    clearTimeout(unifiedSearchDebounce);

    if (query.length < 2) {
        if (resultsContainer) resultsContainer.style.display = 'none';
        return;
    }

    unifiedSearchDebounce = setTimeout(async () => {
        if (loading) loading.style.display = 'block';
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
            resultsContainer.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-muted);"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
        }

        try {
            // Use cached products or fetch from BOTH stores
            if (transfersState.productsCache.length === 0 && typeof fetchStoreInventory === 'function') {
                console.log('🔄 Fetching products from VSU and Loyal Vaper...');
                const [vsuProducts, loyalProducts] = await Promise.all([
                    fetchStoreInventory('vsu', 250).catch(e => { console.warn('VSU fetch failed:', e); return []; }),
                    fetchStoreInventory('loyalvaper', 250).catch(e => { console.warn('Loyal Vaper fetch failed:', e); return []; })
                ]);
                vsuProducts.forEach(p => p.sourceStore = 'VSU');
                loyalProducts.forEach(p => p.sourceStore = 'Loyal Vaper');
                transfersState.productsCache = [...vsuProducts, ...loyalProducts];
                console.log('✅ Loaded', vsuProducts.length, 'VSU +', loyalProducts.length, 'Loyal Vaper products');
            }

            const queryLower = query.toLowerCase();
            const filtered = transfersState.productsCache.filter(p =>
                (p.productName && p.productName.toLowerCase().includes(queryLower)) ||
                (p.sku && p.sku.toLowerCase().includes(queryLower)) ||
                (p.brand && p.brand.toLowerCase().includes(queryLower))
            ).slice(0, 10);

            if (loading) loading.style.display = 'none';

            if (filtered.length === 0) {
                resultsContainer.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-muted);"><i class="fas fa-box-open" style="font-size: 24px; display: block; margin-bottom: 8px; opacity: 0.5;"></i>No products found</div>';
                return;
            }

            resultsContainer.innerHTML = filtered.map(product => {
                const stockColor = parseInt(product.stock) <= 5 ? '#ef4444' : parseInt(product.stock) <= 20 ? '#f59e0b' : '#10b981';
                const storeColor = product.sourceStore === 'Loyal Vaper' ? '#f59e0b' : '#6366f1';
                const storeBadge = product.sourceStore ? `<span style="font-size: 9px; color: white; background: ${storeColor}; padding: 1px 5px; border-radius: 3px; font-weight: 600; margin-right: 6px;">${product.sourceStore === 'Loyal Vaper' ? 'LV' : 'VSU'}</span>` : '';
                return `
                    <div onclick="addUnifiedProduct('${encodeURIComponent(JSON.stringify(product))}')" style="padding: 10px 14px; cursor: pointer; border-bottom: 1px solid var(--border-color); transition: all 0.15s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: 600; font-size: 13px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${storeBadge}${product.productName}${product.flavor && product.flavor !== 'N/A' ? ` - ${product.flavor}` : ''}
                                </div>
                                <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                                    ${product.sku ? `SKU: ${product.sku}` : ''}${product.brand ? ` • ${product.brand}` : ''}
                                </div>
                            </div>
                            <div style="font-size: 13px; font-weight: 700; color: ${stockColor}; margin-left: 10px;">${product.stock}</div>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Search error:', error);
            if (loading) loading.style.display = 'none';
            resultsContainer.innerHTML = '<div style="padding: 16px; text-align: center; color: #ef4444;"><i class="fas fa-exclamation-circle"></i> Error loading products</div>';
        }
    }, 300);
}

// Add product from search
function addUnifiedProduct(encodedProduct) {
    try {
        const product = JSON.parse(decodeURIComponent(encodedProduct));

        // Check if already in list
        const existingIndex = unifiedTransferState.items.findIndex(item =>
            item.productName === product.productName ||
            (item.matchedProduct && item.matchedProduct.id === product.id)
        );

        if (existingIndex >= 0) {
            // Increment quantity
            unifiedTransferState.items[existingIndex].quantity += 1;
        } else {
            // Add new item
            unifiedTransferState.items.push({
                productName: product.productName + (product.flavor && product.flavor !== 'N/A' ? ` - ${product.flavor}` : ''),
                name: product.productName + (product.flavor && product.flavor !== 'N/A' ? ` - ${product.flavor}` : ''),
                quantity: 1,
                sku: product.sku,
                matchedProduct: product,
                matched: true
            });
        }

        renderUnifiedItems();

        // Clear search
        const searchInput = document.getElementById('unifiedProductSearch');
        const resultsContainer = document.getElementById('unifiedSearchResults');
        if (searchInput) searchInput.value = '';
        if (resultsContainer) resultsContainer.style.display = 'none';

        showTransferToast(`Added ${product.productName}`, 'success');

    } catch (error) {
        console.error('Error adding product:', error);
    }
}

// Render items list
function renderUnifiedItems() {
    const section = document.getElementById('unifiedItemsSection');
    const list = document.getElementById('unifiedItemsList');
    const count = document.getElementById('unifiedItemCount');
    const submitBtn = document.getElementById('unifiedSubmitBtn');

    if (!unifiedTransferState.items.length) {
        if (section) section.style.display = 'none';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
        }
        return;
    }

    if (section) section.style.display = 'block';
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    }

    const totalUnits = unifiedTransferState.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    if (count) {
        count.textContent = `${unifiedTransferState.items.length} product${unifiedTransferState.items.length > 1 ? 's' : ''} · ${totalUnits} units`;
    }

    if (list) {
        list.innerHTML = unifiedTransferState.items.map((item, index) => `
            <div style="padding: 10px 12px; background: var(--bg-secondary); border-radius: 10px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <div style="flex: 1; min-width: 0; padding-right: 8px;">
                        <div style="font-weight: 600; font-size: 13px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name || item.productName}</div>
                    </div>
                    <button onclick="removeUnifiedItem(${index})" style="width: 32px; height: 32px; background: rgba(239,68,68,0.1); border: none; cursor: pointer; color: #ef4444; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas fa-trash-alt" style="font-size: 11px;"></i>
                    </button>
                </div>
                <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <button onclick="updateUnifiedQty(${index}, -1)" style="width: 42px; height: 42px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-primary); font-size: 16px; font-weight: bold;">−</button>
                    <input type="number" value="${item.quantity}" min="1" onchange="setUnifiedQty(${index}, this.value)" style="width: 60px; height: 42px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 10px; text-align: center; font-weight: 700; font-size: 18px; color: white;">
                    <button onclick="updateUnifiedQty(${index}, 1)" style="width: 42px; height: 42px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-primary); font-size: 16px; font-weight: bold;">+</button>
                </div>
            </div>
        `).join('');
    }
}

// Remove item from list
function removeUnifiedItem(index) {
    unifiedTransferState.items.splice(index, 1);
    renderUnifiedItems();
}

// Update item quantity
function updateUnifiedQty(index, delta) {
    const item = unifiedTransferState.items[index];
    if (item) {
        item.quantity = Math.max(1, (item.quantity || 1) + delta);
        renderUnifiedItems();
    }
}

// Set item quantity
function setUnifiedQty(index, value) {
    const item = unifiedTransferState.items[index];
    if (item) {
        item.quantity = Math.max(1, parseInt(value) || 1);
        renderUnifiedItems();
    }
}

// Create transfer from unified modal
async function createUnifiedTransfer() {
    const origin = document.getElementById('unifiedTransferOrigin')?.value;
    const destination = document.getElementById('unifiedTransferDestination')?.value;

    if (!origin) {
        showTransferToast('Please select origin store', 'warning');
        return;
    }

    if (!destination) {
        showTransferToast('Please select destination store', 'warning');
        return;
    }

    if (origin === destination) {
        showTransferToast('Origin and destination cannot be the same', 'error');
        return;
    }

    if (!unifiedTransferState.items.length) {
        showTransferToast('Please add at least one product', 'warning');
        return;
    }

    const submitBtn = document.getElementById('unifiedSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    }

    try {
        // Get current user
        let sentBy = 'Staff';
        try {
            const user = JSON.parse(localStorage.getItem('ascendance_user') || '{}');
            sentBy = user.name || user.email || 'Staff';
        } catch (e) {}

        const today = new Date().toISOString().split('T')[0];
        const totalItems = unifiedTransferState.items.reduce((sum, item) => sum + (item.quantity || 1), 0);

        // Create transfer
        const transfer = {
            id: Date.now().toString(),
            folio: generateTransferFolio(),
            storeType: transfersState.currentStore || 'vsu', // 'vsu' or 'loyalvaper'
            storeOrigin: origin,
            storeDestination: destination,
            items: unifiedTransferState.items.map(item => ({
                productId: item.matchedProduct?.id || null,
                productName: item.name || item.productName || 'Unknown Product',
                productSku: item.sku || item.matchedProduct?.sku || 'MANUAL',
                quantity: item.quantity || 1,
                received: false,
                receivedQty: 0
            })),
            totalItems: totalItems,
            totalProducts: unifiedTransferState.items.length,
            shipDate: today,
            sentBy: sentBy,
            notes: 'Created via Unified Transfer',
            status: 'pending',
            createdAt: new Date().toISOString(),
            receivedAt: null,
            receivedBy: null,
            photo: unifiedTransferState.processedPhoto || null
        };

        // Add to state
        transfersState.transfers.unshift(transfer);
        saveTransfers();

        try {
            await saveTransferToFirebase(transfer);
        } catch (e) {
            console.warn('Firebase save failed:', e);
        }

        try {
            await sendTransferNotification(transfer, 'created');
        } catch (e) {
            console.warn('Notification failed:', e);
        }

        closeUnifiedTransferModal();
        renderTransfersPage();

        showTransferToast(`Transfer ${transfer.folio} created! ${transfer.totalProducts} products → ${getStoreName(destination)}`, 'success');

    } catch (error) {
        console.error('Error creating transfer:', error);
        showTransferToast('Error creating transfer: ' + error.message, 'error');

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Create Transfer';
        }
    }
}

// Parse AI Transfer Input
async function parseAITransferInput() {
    const input = document.getElementById('aiTransferInput').value.trim();
    const origin = document.getElementById('aiTransferOrigin').value;
    const destination = document.getElementById('aiTransferDestination').value;

    if (!input) {
        showTransferToast('Please enter the products to transfer', 'warning');
        return;
    }

    if (!origin || !destination) {
        showTransferToast('Please select origin and destination stores', 'warning');
        return;
    }

    if (origin === destination) {
        showTransferToast('Origin and destination cannot be the same', 'error');
        return;
    }

    // Show loading
    document.getElementById('aiTransferLoading').style.display = 'block';
    document.getElementById('aiTransferResults').style.display = 'none';

    try {
        // Try to use AI to parse, or fallback to simple parsing
        const items = await parseTransferWithAI(input);

        if (items.length === 0) {
            showTransferToast('Could not parse any items. Check the format.', 'error');
            document.getElementById('aiTransferLoading').style.display = 'none';
            return;
        }

        aiTransferState.parsedItems = items;
        renderParsedItems();

    } catch (error) {
        console.error('Error parsing input:', error);
        // Fallback to simple parsing
        const items = simpleParseTransferInput(input);
        if (items.length > 0) {
            aiTransferState.parsedItems = items;
            renderParsedItems();
        } else {
            showTransferToast('Error parsing items. Please try again.', 'error');
        }
    }

    document.getElementById('aiTransferLoading').style.display = 'none';
}

// Simple parsing without AI (fallback)
function simpleParseTransferInput(input) {
    const lines = input.split(/[\n,]+/).map(l => l.trim()).filter(l => l);
    const items = [];

    for (const line of lines) {
        // Try to extract quantity and product name
        // Format: "5 Lost Mary Watermelon" or "Lost Mary x5" or "Lost Mary (5)"
        let quantity = 1;
        let productName = line;

        // Match "5 Product Name" format
        const match1 = line.match(/^(\d+)\s+(.+)$/);
        if (match1) {
            quantity = parseInt(match1[1]);
            productName = match1[2];
        }

        // Match "Product Name x5" format
        const match2 = line.match(/^(.+)\s*[xX]\s*(\d+)$/);
        if (match2) {
            productName = match2[1].trim();
            quantity = parseInt(match2[2]);
        }

        // Match "Product Name (5)" format
        const match3 = line.match(/^(.+)\s*\((\d+)\)$/);
        if (match3) {
            productName = match3[1].trim();
            quantity = parseInt(match3[2]);
        }

        if (productName && quantity > 0) {
            items.push({
                productName: productName.trim(),
                quantity: quantity,
                matched: false,
                matchedProduct: null
            });
        }
    }

    return items;
}

// Parse with AI
async function parseTransferWithAI(input) {
    // First try simple parsing
    const simpleItems = simpleParseTransferInput(input);

    // Try to match with actual products from BOTH Shopify stores
    if (transfersState.productsCache.length === 0) {
        try {
            if (typeof fetchStoreInventory === 'function') {
                console.log('🔄 Fetching products from VSU and Loyal Vaper...');
                const [vsuProducts, loyalProducts] = await Promise.all([
                    fetchStoreInventory('vsu', 250).catch(e => { console.warn('VSU fetch failed:', e); return []; }),
                    fetchStoreInventory('loyalvaper', 250).catch(e => { console.warn('Loyal Vaper fetch failed:', e); return []; })
                ]);
                vsuProducts.forEach(p => p.sourceStore = 'VSU');
                loyalProducts.forEach(p => p.sourceStore = 'Loyal Vaper');
                transfersState.productsCache = [...vsuProducts, ...loyalProducts];
                console.log('✅ Loaded', vsuProducts.length, 'VSU +', loyalProducts.length, 'Loyal Vaper products');
            }
        } catch (e) {
            console.warn('Could not load products:', e);
        }
    }

    // Match items with products
    for (const item of simpleItems) {
        const searchTerm = item.productName.toLowerCase();
        const matchedProduct = transfersState.productsCache.find(p => {
            const productStr = `${p.productName} ${p.flavor || ''} ${p.brand || ''}`.toLowerCase();
            return productStr.includes(searchTerm) || searchTerm.includes(p.productName.toLowerCase());
        });

        if (matchedProduct) {
            item.matched = true;
            item.matchedProduct = matchedProduct;
        }
    }

    return simpleItems;
}

// Render parsed items
function renderParsedItems() {
    const listEl = document.getElementById('aiTransferItemsList');
    const resultsEl = document.getElementById('aiTransferResults');
    const countEl = document.getElementById('aiTransferItemCount');

    if (!listEl || !resultsEl) return;

    // Update count badge
    const totalItems = aiTransferState.parsedItems.reduce((sum, item) => sum + item.quantity, 0);
    if (countEl) {
        countEl.textContent = `${aiTransferState.parsedItems.length} items · ${totalItems} units`;
    }

    // Mobile-friendly layout - product name on top, controls below
    listEl.innerHTML = aiTransferState.parsedItems.map((item, index) => `
        <div style="padding: 12px; background: var(--bg-secondary); border-radius: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <div style="flex: 1; min-width: 0; padding-right: 10px;">
                    <div style="font-weight: 600; font-size: 14px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name || item.productName}</div>
                </div>
                <button onclick="removeAIParsedItem(${index})" style="width: 36px; height: 36px; background: rgba(239,68,68,0.1); border: none; cursor: pointer; color: #ef4444; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; -webkit-tap-highlight-color: transparent;">
                    <i class="fas fa-trash-alt" style="font-size: 12px;"></i>
                </button>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <button onclick="updateAIItemQty(${index}, -1)" style="width: 48px; height: 48px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-primary); font-size: 18px; font-weight: bold; -webkit-tap-highlight-color: transparent;">
                    −
                </button>
                <input type="number" value="${item.quantity}" min="1" onchange="setAIItemQty(${index}, this.value)" style="width: 70px; height: 48px; background: linear-gradient(135deg, #667eea, #764ba2); border: none; border-radius: 12px; text-align: center; font-weight: 700; font-size: 20px; color: white;">
                <button onclick="updateAIItemQty(${index}, 1)" style="width: 48px; height: 48px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-primary); font-size: 18px; font-weight: bold; -webkit-tap-highlight-color: transparent;">
                    +
                </button>
            </div>
        </div>
    `).join('');

    resultsEl.style.display = 'block';
}

// Remove parsed item
function removeAIParsedItem(index) {
    aiTransferState.parsedItems.splice(index, 1);
    if (aiTransferState.parsedItems.length === 0) {
        document.getElementById('aiTransferResults').style.display = 'none';
    } else {
        renderParsedItems();
    }
}

// Update item quantity with +/- buttons
function updateAIItemQty(index, delta) {
    const item = aiTransferState.parsedItems[index];
    if (item) {
        item.quantity = Math.max(1, item.quantity + delta);
        renderParsedItems();
    }
}

// Set item quantity directly from input
function setAIItemQty(index, value) {
    const item = aiTransferState.parsedItems[index];
    if (item) {
        const qty = parseInt(value) || 1;
        item.quantity = Math.max(1, qty);
        renderParsedItems();
    }
}

// Create transfers from parsed items - NOW CREATES A SINGLE TRANSFER WITH MULTIPLE ITEMS
async function createAITransfers() {
    try {
        const origin = document.getElementById('aiTransferOrigin')?.value || 'LoyalVaper';
        const destination = document.getElementById('aiTransferDestination')?.value;

        if (!destination) {
            showTransferToast('Please select a destination store', 'warning');
            return;
        }

        if (!aiTransferState.parsedItems || aiTransferState.parsedItems.length === 0) {
            showTransferToast('No items to transfer', 'warning');
            return;
        }

        // Disable button to prevent double-click
        const submitBtn = document.getElementById('aiTransferSubmitBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        }

        // Get current user
        let sentBy = 'Staff';
        try {
            const user = JSON.parse(localStorage.getItem('ascendance_user') || '{}');
            sentBy = user.name || user.email || 'Staff';
        } catch (e) {
            console.warn('Could not get current user');
        }

        const today = new Date().toISOString().split('T')[0];
        const totalItems = aiTransferState.parsedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

        // Use the processed photo that was saved before clearing mediaFiles
        const transferPhoto = aiTransferState.processedPhoto || null;

        // Create a SINGLE transfer with multiple items
        const transfer = {
            id: Date.now().toString(),
            folio: generateTransferFolio(),
            storeOrigin: origin,
            storeDestination: destination,
            // Array of items
            items: aiTransferState.parsedItems.map(item => ({
                productId: item.matchedProduct?.id || null,
                productName: item.name || item.matchedProduct?.productName || item.productName || 'Unknown Product',
                productSku: item.sku || item.matchedProduct?.sku || 'SCAN',
                quantity: item.quantity || 1,
                received: false,
                receivedQty: 0
            })),
            totalItems: totalItems,
            totalProducts: aiTransferState.parsedItems.length,
            shipDate: today,
            sentBy: sentBy,
            notes: 'Created via AI Transfer',
            status: 'pending',
            createdAt: new Date().toISOString(),
            receivedAt: null,
            receivedBy: null,
            photo: transferPhoto // Store the photo
        };

        console.log('Creating transfer:', transfer);

        // Add transfer to state
        transfersState.transfers.unshift(transfer);

        // Save to localStorage and Firebase
        saveTransfers();

        try {
            await saveTransferToFirebase(transfer);
        } catch (fbError) {
            console.warn('Firebase save failed, but localStorage saved:', fbError);
        }

        // Send notification to destination store
        try {
            await sendTransferNotification(transfer, 'created');
        } catch (notifError) {
            console.warn('Notification failed:', notifError);
        }

        // Close modal and refresh
        closeAITransferModal();
        renderTransfersPage();

        // Show success message
        showTransferToast(`Transfer ${transfer.folio} created! ${transfer.totalProducts} products → ${getStoreName(destination)}`, 'success');

    } catch (error) {
        console.error('Error creating transfer:', error);
        showTransferToast('Error creating transfer: ' + error.message, 'error');

        // Re-enable button
        const submitBtn = document.getElementById('aiTransferSubmitBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Create Transfer';
        }
    }
}

// Voice input for AI transfer
function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showTransferToast('Voice recognition not supported. Try Chrome.', 'warning');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = function() {
        const btn = document.querySelector('#aiTransferModal .fa-microphone').parentElement;
        btn.style.background = '#ef4444';
        btn.innerHTML = '<i class="fas fa-stop" style="color: white;"></i>';
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('aiTransferInput');
        if (input) {
            input.value = (input.value ? input.value + '\n' : '') + transcript;
        }
    };

    recognition.onend = function() {
        const btn = document.querySelector('#aiTransferModal .fa-microphone, #aiTransferModal .fa-stop')?.parentElement;
        if (btn) {
            btn.style.background = 'var(--bg-secondary)';
            btn.innerHTML = '<i class="fas fa-microphone" style="color: var(--accent-primary);"></i>';
        }
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        const voiceErr = event?.error || 'Unknown error';
        showTransferToast('Voice recognition error: ' + voiceErr, 'error');
    };

    recognition.start();
}

// ========================================
// PHOTO VISION AI FOR TRANSFERS
// ========================================

// Process photo with OpenAI Vision
async function processTransferPhoto(input) {
    const file = input.files[0];
    if (!file) return;

    const origin = document.getElementById('aiTransferOrigin').value;
    const destination = document.getElementById('aiTransferDestination').value;

    if (!origin || !destination) {
        showTransferToast('Please select origin and destination stores first', 'warning');
        input.value = '';
        return;
    }

    if (origin === destination) {
        showTransferToast('Origin and destination cannot be the same', 'error');
        input.value = '';
        return;
    }

    // Show preview
    const preview = document.getElementById('aiTransferPhotoPreview');
    const placeholder = document.getElementById('aiTransferPhotoPlaceholder');
    const img = document.getElementById('aiTransferPhotoImg');
    const reader = new FileReader();

    reader.onload = async function(e) {
        const base64Image = e.target.result;
        img.src = base64Image;
        preview.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';

        // Show loading
        document.getElementById('aiTransferLoading').style.display = 'block';
        document.getElementById('aiTransferResults').style.display = 'none';

        try {
            // Get API key
            const apiKey = await getOpenAIKeyForTransfers();
            if (!apiKey) {
                showTransferToast('OpenAI API key not configured. Go to Settings > Celeste AI', 'error');
                document.getElementById('aiTransferLoading').style.display = 'none';
                return;
            }

            // Call OpenAI Vision
            const items = await analyzeTransferPhotoWithVision(base64Image, apiKey);

            if (items.length === 0) {
                showTransferToast('No products detected. Try a clearer photo.', 'warning');
                document.getElementById('aiTransferLoading').style.display = 'none';
                return;
            }

            aiTransferState.parsedItems = items;
            renderParsedItems();

        } catch (error) {
            console.error('Photo analysis error:', error);
            const photoErr = error?.message || error || 'Unknown error';
            showTransferToast('Error analyzing photo: ' + photoErr, 'error');
        }

        document.getElementById('aiTransferLoading').style.display = 'none';
    };

    reader.readAsDataURL(file);
}

// Clear transfer photo
function clearTransferPhoto() {
    const preview = document.getElementById('aiTransferPhotoPreview');
    const placeholder = document.getElementById('aiTransferPhotoPlaceholder');
    const input = document.getElementById('aiTransferPhotoInput');
    if (preview) preview.style.display = 'none';
    if (placeholder) placeholder.style.display = 'block';
    if (input) input.value = '';
}

// ========================================
// MULTI-MEDIA SUPPORT (Photos, Videos, Audio)
// ========================================

// Process multiple media files when selected
function processTransferMedia(input) {
    const files = Array.from(input.files);
    if (files.length === 0) return;

    // Add files to state
    for (const file of files) {
        const fileData = {
            file: file,
            type: file.type.split('/')[0], // image, video, audio
            name: file.name,
            url: URL.createObjectURL(file)
        };
        aiTransferState.mediaFiles.push(fileData);
    }

    renderMediaPreview();
}

// Render media preview grid
function renderMediaPreview() {
    const preview = document.getElementById('aiTransferMediaPreview');
    const placeholder = document.getElementById('aiTransferMediaPlaceholder');
    const grid = document.getElementById('aiTransferMediaGrid');
    const count = document.getElementById('aiTransferMediaCount');
    const processBtn = document.getElementById('aiTransferProcessBtn');

    if (aiTransferState.mediaFiles.length === 0) {
        preview.style.display = 'none';
        placeholder.style.display = 'block';
        processBtn.style.display = 'none';
        return;
    }

    preview.style.display = 'block';
    placeholder.style.display = 'none';
    processBtn.style.display = 'block';

    const images = aiTransferState.mediaFiles.filter(f => f.type === 'image').length;
    const videos = aiTransferState.mediaFiles.filter(f => f.type === 'video').length;
    const audios = aiTransferState.mediaFiles.filter(f => f.type === 'audio').length;

    let countText = [];
    if (images) countText.push(`${images} foto${images > 1 ? 's' : ''}`);
    if (videos) countText.push(`${videos} video${videos > 1 ? 's' : ''}`);
    if (audios) countText.push(`${audios} audio${audios > 1 ? 's' : ''}`);
    count.textContent = countText.join(', ');

    grid.innerHTML = aiTransferState.mediaFiles.map((media, index) => {
        if (media.type === 'image') {
            return `<div style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: var(--bg-secondary);">
                <img src="${media.url}" style="width: 100%; height: 100%; object-fit: cover;">
                <button onclick="removeTransferMedia(${index})" style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: white; border: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; font-size: 10px;">×</button>
            </div>`;
        } else if (media.type === 'video') {
            return `<div style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-video" style="color: white; font-size: 24px;"></i>
                <button onclick="removeTransferMedia(${index})" style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: white; border: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; font-size: 10px;">×</button>
                <span style="position: absolute; bottom: 4px; left: 4px; right: 4px; font-size: 8px; color: white; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${media.name}</span>
            </div>`;
        } else {
            return `<div style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-microphone" style="color: white; font-size: 24px;"></i>
                <button onclick="removeTransferMedia(${index})" style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: white; border: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; font-size: 10px;">×</button>
                <span style="position: absolute; bottom: 4px; left: 4px; right: 4px; font-size: 8px; color: white; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${media.name}</span>
            </div>`;
        }
    }).join('');
}

// Remove single media file
function removeTransferMedia(index) {
    URL.revokeObjectURL(aiTransferState.mediaFiles[index].url);
    aiTransferState.mediaFiles.splice(index, 1);
    renderMediaPreview();
}

// Clear all media
function clearTransferMedia() {
    aiTransferState.mediaFiles.forEach(m => URL.revokeObjectURL(m.url));
    aiTransferState.mediaFiles = [];
    document.getElementById('aiTransferMediaInput').value = '';
    renderMediaPreview();
}

// ========================================
// DRAG & DROP HANDLERS
// ========================================

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const section = document.getElementById('aiTransferMediaSection');
    if (section) {
        section.style.borderColor = '#667eea';
        section.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))';
        section.style.transform = 'scale(1.02)';
    }
}

// Open camera directly for photo
function openCameraForTransfer() {
    const cameraInput = document.getElementById('aiTransferCameraInput');
    if (cameraInput) {
        cameraInput.click();
    }
}

// Handle drag leave
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const section = document.getElementById('aiTransferMediaSection');
    if (section) {
        section.style.borderColor = 'rgba(102, 126, 234, 0.3)';
        section.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))';
        section.style.transform = 'scale(1)';
    }
}

// Handle drop
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    // Reset styles
    const section = document.getElementById('aiTransferMediaSection');
    if (section) {
        section.style.borderColor = 'rgba(102, 126, 234, 0.3)';
        section.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))';
        section.style.transform = 'scale(1)';
    }

    // Get dropped files
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Filter for valid file types
    const validFiles = files.filter(file => {
        const type = file.type.split('/')[0];
        return type === 'image' || type === 'video' || type === 'audio';
    });

    if (validFiles.length === 0) {
        showTransferToast('Please drop image, video, or audio files only', 'warning');
        return;
    }

    // Add files to state
    for (const file of validFiles) {
        const fileData = {
            file: file,
            type: file.type.split('/')[0],
            name: file.name,
            url: URL.createObjectURL(file)
        };
        aiTransferState.mediaFiles.push(fileData);
    }

    renderMediaPreview();
    console.log(`[AI Transfer] Dropped ${validFiles.length} files`);
}

// Process all media with AI
async function processAllTransferMedia() {
    if (aiTransferState.mediaFiles.length === 0) {
        showTransferToast('No files to process', 'warning');
        return;
    }

    const apiKey = await getOpenAIKeyForTransfers();
    if (!apiKey) {
        showTransferToast('OpenAI API key not configured. Go to Settings > Celeste AI', 'error');
        return;
    }

    // Clear previous results before processing new files
    aiTransferState.parsedItems = [];

    const loadingEl = document.getElementById('aiTransferLoading');
    const resultsEl = document.getElementById('aiTransferResults');

    loadingEl.style.display = 'block';
    resultsEl.style.display = 'none';

    let allItems = [];
    const totalFiles = aiTransferState.mediaFiles.length;

    try {
        // Process each media file with progress updates
        for (let i = 0; i < aiTransferState.mediaFiles.length; i++) {
            const media = aiTransferState.mediaFiles[i];
            let items = [];

            // Update loading message
            loadingEl.innerHTML = `
                <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #8b5cf6;"></i>
                <p style="margin-top: 10px; color: var(--text-muted);">Processing ${i + 1}/${totalFiles}...</p>
                <p style="font-size: 11px; color: var(--text-muted);">${media.type === 'image' ? 'Analyzing image' : media.type === 'video' ? 'Processing video' : 'Transcribing audio'}</p>
            `;

            // Allow UI to update
            await new Promise(r => setTimeout(r, 50));

            if (media.type === 'image') {
                // Process image with Vision
                // Store base64 for later use (photo in transfer)
                media.base64 = await fileToBase64(media.file);
                items = await analyzeTransferPhotoWithVision(media.base64, apiKey);
            } else if (media.type === 'video') {
                // Extract frames from video and analyze + transcribe audio
                items = await analyzeTransferVideo(media.file, apiKey);
            } else if (media.type === 'audio') {
                // Transcribe audio and parse products
                items = await analyzeTransferAudio(media.file, apiKey);
            }

            allItems = mergeTransferItems(allItems, items);

            // Allow UI to breathe between files
            await new Promise(r => setTimeout(r, 50));
        }

        if (allItems.length === 0) {
            showTransferToast('No products detected. Try clearer images or clearer audio.', 'warning');
        } else {
            aiTransferState.parsedItems = allItems;

            // Save the first image's base64 for the transfer record BEFORE clearing
            const imageFile = aiTransferState.mediaFiles.find(m => m.type === 'image' && m.base64);
            if (imageFile) {
                aiTransferState.processedPhoto = await compressImageForStorage(imageFile.base64);
            }

            renderParsedItems();

            // Clear media files after successful processing to avoid re-processing
            aiTransferState.mediaFiles.forEach(m => URL.revokeObjectURL(m.url));
            aiTransferState.mediaFiles = [];
            renderMediaPreview();
        }

    } catch (error) {
        console.error('Media analysis error:', error);
        const errorMsg = error?.message || error || 'Unknown error';
        showTransferToast('Error analyzing media: ' + errorMsg, 'error');
    }

    document.getElementById('aiTransferLoading').style.display = 'none';
}

// Convert file to base64 (handles HEIC conversion)
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        // Check if HEIC - need to convert to JPEG via canvas
        const isHeic = file.type === 'image/heic' || file.type === 'image/heif' ||
                       file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');

        if (isHeic) {
            // Convert HEIC to JPEG using canvas
            convertHeicToJpeg(file).then(resolve).catch(reject);
        } else {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        }
    });
}

// Convert HEIC to JPEG and compress large images
async function convertHeicToJpeg(file) {
    console.log(`[HEIC] Processing ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    // First try native browser support (Safari/iOS)
    try {
        const result = await tryNativeHeicConversion(file);
        if (result) return result;
    } catch (e) {
        console.log('[HEIC] Native conversion failed, trying heic2any library');
    }

    // Try heic2any library if available
    if (typeof heic2any !== 'undefined') {
        try {
            const blob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.8
            });
            const result = await blobToBase64(blob);
            console.log('[HEIC] Converted via heic2any');
            return result;
        } catch (e) {
            console.log('[HEIC] heic2any failed:', e.message);
        }
    }

    // Load heic2any dynamically if not available
    if (typeof heic2any === 'undefined') {
        try {
            await loadHeic2AnyLibrary();
            const blob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.8
            });
            const result = await blobToBase64(blob);
            console.log('[HEIC] Converted via dynamically loaded heic2any');
            return result;
        } catch (e) {
            console.log('[HEIC] Dynamic heic2any failed:', e.message);
        }
    }

    // Last resort - just read as-is and hope the API can handle it
    console.log('[HEIC] All conversions failed, sending raw file');
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Try native HEIC conversion (works on Safari/iOS)
function tryNativeHeicConversion(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        const timeout = setTimeout(() => {
            URL.revokeObjectURL(url);
            reject(new Error('Timeout'));
        }, 10000); // 10 second timeout

        img.onload = () => {
            clearTimeout(timeout);
            // Resize if too large (max 2048px on longest side for API)
            let width = img.width;
            let height = img.height;
            const maxSize = 2048;

            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = Math.round((height * maxSize) / width);
                    width = maxSize;
                } else {
                    width = Math.round((width * maxSize) / height);
                    height = maxSize;
                }
                console.log(`[HEIC] Resizing from ${img.width}x${img.height} to ${width}x${height}`);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(url);

            // Compress to 80% quality JPEG
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };

        img.onerror = () => {
            clearTimeout(timeout);
            URL.revokeObjectURL(url);
            reject(new Error('Cannot decode HEIC'));
        };

        img.src = url;
    });
}

// Load heic2any library dynamically
function loadHeic2AnyLibrary() {
    return new Promise((resolve, reject) => {
        if (typeof heic2any !== 'undefined') {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/heic2any/0.0.4/heic2any.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load heic2any'));
        document.head.appendChild(script);
    });
}

// Convert blob to base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Merge items, combining quantities for same products
function mergeTransferItems(existing, newItems) {
    const merged = [...existing];
    for (const item of newItems) {
        const existingItem = merged.find(e =>
            e.name.toLowerCase().replace(/\s+/g, '') === item.name.toLowerCase().replace(/\s+/g, '')
        );
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            merged.push(item);
        }
    }
    return merged;
}

// Analyze video - extract frames + transcribe audio
async function analyzeTransferVideo(file, apiKey) {
    let allItems = [];
    let frameErrors = [];

    // 1. Extract frames from video and analyze
    try {
        const frames = await extractVideoFrames(file, 3); // Extract 3 frames (start, middle, end)
        console.log(`[AI Transfer] Extracted ${frames.length} frames from video`);

        // Collect results from each frame separately
        let frameResults = [];

        for (let i = 0; i < frames.length; i++) {
            try {
                // Use permissive analysis for video frames (they're often blurry)
                const items = await analyzeVideoFramePermissive(frames[i], apiKey);
                if (items && items.length > 0) {
                    frameResults.push(items);
                    console.log(`[AI Transfer] Frame ${i + 1}: Found ${items.length} products`);
                }
            } catch (frameError) {
                // Don't fail on individual frame errors
                console.warn(`[AI Transfer] Frame ${i + 1} skipped:`, frameError.message);
                frameErrors.push(frameError.message);
            }
        }

        // For video: take the BEST frame result (most items detected) instead of merging/summing
        // This avoids counting the same products multiple times across frames
        if (frameResults.length > 0) {
            // Pick the frame with the most products detected
            const bestFrame = frameResults.reduce((best, current) =>
                current.length > best.length ? current : best
            , frameResults[0]);
            allItems = bestFrame;
            console.log(`[AI Transfer] Using best frame with ${allItems.length} products`);
        }
    } catch (e) {
        console.warn('Could not extract video frames:', e.message);
    }

    // 2. Extract and transcribe audio from video
    try {
        const audioBlob = await extractAudioFromVideo(file);
        if (audioBlob) {
            console.log('[AI Transfer] Extracted audio from video, transcribing...');
            const transcript = await transcribeAudio(audioBlob, apiKey);
            if (transcript) {
                console.log('[AI Transfer] Transcription:', transcript);
                const items = await parseProductsFromText(transcript, apiKey);
                if (items && items.length > 0) {
                    allItems = mergeTransferItems(allItems, items);
                    console.log(`[AI Transfer] Audio: Found ${items.length} products`);
                }
            }
        }
    } catch (e) {
        console.warn('Could not extract video audio:', e.message);
    }

    // If no items found and all frames had errors, show a helpful message
    if (allItems.length === 0 && frameErrors.length > 0) {
        console.log('[AI Transfer] No products found. Frame issues:', frameErrors);
    }

    return allItems;
}

// Compress image for storage (smaller than API version)
function compressImageForStorage(base64Image) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const maxSize = 800; // Smaller for storage
            let width = img.width;
            let height = img.height;

            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = Math.round((height * maxSize) / width);
                    width = maxSize;
                } else {
                    width = Math.round((width * maxSize) / height);
                    height = maxSize;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.6)); // 60% quality for storage
        };
        img.onerror = () => resolve(null);
        img.src = base64Image;
    });
}

// Extract frames from video
function extractVideoFrames(file, numFrames) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;

        video.onloadedmetadata = async () => {
            const duration = video.duration;
            const frames = [];
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            for (let i = 0; i < numFrames; i++) {
                const time = (duration / (numFrames + 1)) * (i + 1);
                video.currentTime = time;

                await new Promise(r => video.onseeked = r);

                ctx.drawImage(video, 0, 0);
                frames.push(canvas.toDataURL('image/jpeg', 0.8));
            }

            URL.revokeObjectURL(video.src);
            resolve(frames);
        };

        video.onerror = reject;
        video.src = URL.createObjectURL(file);
    });
}

// Extract audio from video file
async function extractAudioFromVideo(file) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.muted = false;

        video.onloadedmetadata = async () => {
            try {
                const audioContext = new AudioContext();
                const response = await fetch(video.src);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                // Convert to WAV blob
                const wavBlob = audioBufferToWav(audioBuffer);
                URL.revokeObjectURL(video.src);
                resolve(wavBlob);
            } catch (e) {
                console.warn('Audio extraction failed:', e);
                URL.revokeObjectURL(video.src);
                resolve(null);
            }
        };

        video.onerror = () => {
            URL.revokeObjectURL(video.src);
            resolve(null);
        };
    });
}

// Convert AudioBuffer to WAV Blob
function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const samples = buffer.length;
    const dataSize = samples * blockAlign;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    // WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Audio data
    const channelData = [];
    for (let i = 0; i < numChannels; i++) {
        channelData.push(buffer.getChannelData(i));
    }

    let offset = 44;
    for (let i = 0; i < samples; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            const sample = Math.max(-1, Math.min(1, channelData[ch][i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// Analyze audio file
async function analyzeTransferAudio(file, apiKey) {
    const transcript = await transcribeAudio(file, apiKey);
    if (!transcript) return [];

    return await parseProductsFromText(transcript, apiKey);
}

// Transcribe audio using OpenAI Whisper
async function transcribeAudio(audioFile, apiKey) {
    const formData = new FormData();
    formData.append('file', audioFile, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', 'es'); // Spanish

    try {
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Transcription failed');
        }

        const data = await response.json();
        console.log('[AI Transfer] Transcription:', data.text);
        return data.text;
    } catch (e) {
        console.error('Transcription error:', e);
        return null;
    }
}

// Parse products from transcribed text using GPT
async function parseProductsFromText(text, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are parsing spoken inventory transfer information for a vape shop.
The user is dictating products they are transferring. Extract product names and quantities.

IMPORTANT PACKAGING MULTIPLIERS:
- FOGER products: 5 vapes per box
- Kraze HD 2.0: 5 vapes per box
- Most other vapes: 1 per box

When someone says "3 cajas de FOGER mint" = 15 units (3 boxes × 5)
When someone says "5 Lost Mary watermelon" = 5 units

Return ONLY a JSON array:
[{"name": "Product Name Flavor", "quantity": X}]

If no products found, return: []`
                },
                {
                    role: 'user',
                    content: `Parse products from this spoken inventory: "${text}"`
                }
            ],
            max_tokens: 500,
            temperature: 0.3
        })
    });

    if (!response.ok) return [];

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '[]';

    try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const items = JSON.parse(jsonMatch[0]);
            return items.map(item => ({
                name: item.name || 'Unknown Product',
                quantity: parseInt(item.quantity) || 1,
                sku: 'VOICE-SCAN'
            }));
        }
    } catch (e) {
        console.error('Parse error:', e);
    }

    return [];
}

// Get OpenAI API key
async function getOpenAIKeyForTransfers() {
    // Try from Firebase settings first
    if (window.celesteFirebaseSettings?.openai_api_key) {
        return window.celesteFirebaseSettings.openai_api_key;
    }
    // Try from localStorage
    const localKey = localStorage.getItem('openai_api_key_custom');
    if (localKey) return localKey;
    // Try from window
    if (window.OPENAI_API_KEY) return window.OPENAI_API_KEY;
    return null;
}

// Analyze VIDEO FRAME with permissive settings (video frames are often blurry/motion-blurred)
async function analyzeVideoFramePermissive(base64Image, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `Count vape BOXES in this video frame for inventory. May be blurry - do your best.

=== LARGE BOX (tall, no WARNING) = 5 vapes ===
=== SMALL BOX (compact, white WARNING label) = 1 vape ===

FOGER, GEEK BAR, SUONON, KRAZE - check box SIZE:
- LARGE (tall, ~15-20cm) = 5 vapes
- SMALL (compact with WARNING, ~8-10cm) = 1 vape

OTHER BRANDS (Lost Mary, Elf Bar, etc.) = always 1 vape

EXAMPLES:
2 LARGE BOX FOGER = 10 vapes (2 × 5)
3 SMALL BOX Geek Bar = 3 vapes (3 × 1)
1 LARGE + 2 SMALL same flavor = 7 vapes (5 + 2)

Return JSON: [{"name": "Brand Flavor", "quantity": TOTAL_VAPES}]
If nothing visible: []`
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'What vape products do you see? Best guess is fine.' },
                        { type: 'image_url', image_url: { url: base64Image, detail: 'high' } }
                    ]
                }
            ],
            max_tokens: 500,
            temperature: 0.5
        })
    });

    if (!response.ok) {
        return []; // Don't throw on API errors for video frames
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '[]';

    try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const items = JSON.parse(jsonMatch[0]);
            return items.map(item => ({
                name: item.name || 'Unknown Product',
                quantity: parseInt(item.quantity) || 1,
                sku: 'VIDEO-SCAN'
            }));
        }
    } catch (e) {
        console.warn('Could not parse video frame response');
    }

    return [];
}

// Analyze photo with OpenAI Vision API (strict mode for photos)
async function analyzeTransferPhotoWithVision(base64Image, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert vape product counter for inventory management. Count ALL boxes visible with precision.

=== CRITICAL: COUNT BY BOX SIZE/DIMENSIONS ===

LARGE BOX (5 vapes):
- Tall rectangular box (approximately 15-20cm tall)
- Usually has product info/puffs on TOP of box
- NO white WARNING label at bottom
- Contains 5 individual vapes inside

SMALL BOX (1 vape):
- Compact square-ish box (approximately 8-10cm tall)
- Has white WARNING label at bottom: "This product contains nicotine..."
- About HALF the height of large box
- Contains 1 single vape

=== COUNTING METHODOLOGY ===
1. Look at PHYSICAL SIZE of each box
2. LARGE/TALL box = 5 vapes
3. SMALL box (with WARNING label) = 1 vape
4. Count rows × columns when stacked
5. Group by brand + flavor

=== FOGER SWITCH PRO ===
LARGE BOX = 5 vapes | SMALL BOX = 1 vape
FLAVORS BY COLOR:
- Purple/Green gradient = Watermelon Ice
- Orange/Yellow sunset = Meta Moon
- Teal/Turquoise = Pineapple Coconut
- Purple/Pink = Grape Slush
- Pink/Magenta = Watermelon Bubble Gum
- Peach/Brown = Juicy Peach Ice
- Rainbow/Holographic silver = Coffee
- Purple/Red dragon = Kiwi Dragon Berry
- Yellow/Orange = Banana Taffy Freeze
- Blue gradient = Blue Rancher B-Pop
- Red/Dark red = Cola Slush
- Green/Lime = Sour Apple Ice
- Red/Pink = Strawberry Cupcake
- Mint green/Teal = Miami Mint
- Red/Orange bomb = Cherry Bomb
- Multicolor candy = Gummy Bear
- White/Gray = White Gummy

=== GEEK BAR ===
CRITICAL: GEEK BAR PULSE boxes showing "7500 PUFFS" or "15000 PUFFS" = LARGE BOX = 5 vapes each!
These are tall boxes with vape device image on front and 21+ indicator.

LARGE BOX (5 vapes): Tall, shows "7500/15000 PUFFS", NO warning label at bottom
SMALL BOX (1 vape): Compact, has white WARNING label at bottom

GEEK BAR PULSE X FLAVORS (LARGE = 5 vapes each):
- Green/Rainbow holographic = Dualicious
- Orange/Black with dragon = Orange Dragon
- Yellow/Black = Lemon Heads
- Purple/Rainbow gradient = Orange Mint
- Black/Red-Yellow gradient = Strawberry Colada
- Blue/Black = Blue Rancher
- Pink/Black = Strawberry Watermelon
- Green/Black = Sour Apple Ice
- Purple/Black = Grape Ice

GEEK BAR PULSE FLAVORS (LARGE = 5 vapes each):
- Blue/Pink gradient with "7500 PUFFS" = Fcuking Fab → COUNT AS 5 VAPES PER BOX
- Yellow/Green gradient with "7500 PUFFS" = Pineapple Savers → COUNT AS 5 VAPES PER BOX
- Blue = Blue Rancher
- Green = Sour Apple Ice
- Pink = Strawberry
- Purple = Grape
- Orange = Orange Creamsicle
- Red = Watermelon Ice

=== SUONON DONETE ===
LARGE BOX = 5 vapes | SMALL BOX = 1 vape
Colorful boxes with "SUONON Donete" branding, "50K PUFFS" indicator
- Pink/Yellow drip design = The Mighty Peach
- Pink/Magenta = B Burst
- Green/Turquoise mint = Miami Mint
- Blue/Yellow = Fizz
- Purple = Grape
- Red = Strawberry
- Orange = Orange Creamsicle

=== KRAZE HD 2.0 ===
LARGE BOX = 5 vapes | SMALL BOX = 1 vape

=== OTHER BRANDS ===
Lost Mary, Elf Bar, SWFT, Breeze, Puff Bar, Hyde, Vuse, NJOY = 1 vape per box (usually only small boxes)

=== COUNTING RULES ===
1. Look at PHYSICAL DIMENSIONS of each box
2. LARGE/TALL box = 5 vapes
3. SMALL/COMPACT box (with WARNING label) = 1 vape
4. Count PHYSICAL BOXES only - NOT images printed on packaging
5. Do NOT count reflections or shadows
6. OPEN/DISPLAY BOXES: If a box is open (showing the vape inside, lid open, or used as display), STILL COUNT IT but add "hasOpenBoxes": true to the response

=== OUTPUT FORMAT ===
Return JSON: {"items": [{"name": "Brand Flavor", "quantity": TOTAL_VAPES}], "hasOpenBoxes": true/false, "openBoxNote": "X open/display boxes detected"}

If no open boxes, just return: [{"name": "Brand Flavor", "quantity": TOTAL_VAPES}]

EXAMPLE 1 - Large boxes only:
See 2 LARGE boxes of FOGER Coffee (tall, no WARNING) → 2 × 5 = {"name": "FOGER Coffee", "quantity": 10}

EXAMPLE 2 - Small boxes only:
See 3 SMALL boxes (compact, with WARNING label) Geek Bar Blue Rancher → 3 × 1 = {"name": "GEEK BAR Blue Rancher", "quantity": 3}

EXAMPLE 3 - Mixed large and small:
See 1 LARGE FOGER Strawberry (tall) + 2 SMALL FOGER Coffee (compact with WARNING):
[
  {"name": "FOGER Strawberry Cupcake", "quantity": 5},
  {"name": "FOGER Coffee", "quantity": 2}
]

EXAMPLE 4 - Multiple brands:
See 2 LARGE Geek Bar Lemon Heads (tall) + 3 SMALL SUONON Mighty Peach (compact with WARNING):
[
  {"name": "GEEK BAR Lemon Heads", "quantity": 10},
  {"name": "SUONON The Mighty Peach", "quantity": 3}
]

EXAMPLE 5 - Geek Bar Pulse (CRITICAL):
See 2 LARGE Geek Bar Pulse Fcuking Fab (blue/pink, shows "7500 PUFFS") + 3 LARGE Geek Bar Pulse Pineapple Savers (yellow/green, shows "7500 PUFFS"):
[
  {"name": "GEEK BAR Pulse Fcuking Fab", "quantity": 10},
  {"name": "GEEK BAR Pulse Pineapple Savers", "quantity": 15}
]
Total = 25 vapes because ALL are LARGE boxes (5 each)

If blurry: {"error": "NEED_BETTER_PHOTO", "reason": "..."}
If nothing visible: []`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Identify all vape products in this image for an inventory transfer. List each product with quantity.'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: base64Image,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000,
            temperature: 0.3
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '[]';

    // Parse JSON from response
    try {
        // Check for NEED_BETTER_PHOTO error first
        if (content.includes('NEED_BETTER_PHOTO')) {
            const errorMatch = content.match(/\{[^}]*"error"[^}]*\}/);
            if (errorMatch) {
                const errorObj = JSON.parse(errorMatch[0]);
                throw new Error(`📸 ${errorObj.reason || 'Please take a clearer photo'}`);
            }
            throw new Error('📸 Photo quality is too low. Please take a clearer photo with better lighting.');
        }

        // Check for new format with hasOpenBoxes
        const objectMatch = content.match(/\{[\s\S]*"items"[\s\S]*\}/);
        if (objectMatch) {
            const parsed = JSON.parse(objectMatch[0]);
            if (parsed.items) {
                // Show warning if open boxes detected
                if (parsed.hasOpenBoxes && parsed.openBoxNote) {
                    showTransferToast(`⚠️ ${parsed.openBoxNote}`, 'warning');
                }
                return parsed.items.map(item => ({
                    name: item.name || 'Unknown Product',
                    quantity: parseInt(item.quantity) || 1,
                    sku: 'PHOTO-SCAN'
                }));
            }
        }

        // Fallback: Extract JSON array from response (might have extra text)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const items = JSON.parse(jsonMatch[0]);
            return items.map(item => ({
                name: item.name || 'Unknown Product',
                quantity: parseInt(item.quantity) || 1,
                sku: 'PHOTO-SCAN'
            }));
        }
    } catch (parseError) {
        // Re-throw if it's our custom error
        if (parseError.message.startsWith('📸')) {
            throw parseError;
        }
        console.error('Error parsing AI response:', parseError, content);
    }

    return [];
}

// ========================================
// NOTIFICATIONS SYSTEM
// ========================================

// Send transfer notification (creates in-app notification)
async function sendTransferNotification(transfer, type) {
    const hasMultipleItems = transfer.items && transfer.items.length > 0;
    const totalQty = hasMultipleItems ? transfer.totalItems : transfer.quantity;
    const productCount = hasMultipleItems ? transfer.items.length : 1;

    let notification = {
        id: Date.now().toString(),
        type: 'transfer',
        transferId: transfer.id,
        folio: transfer.folio,
        createdAt: new Date().toISOString(),
        read: false
    };

    if (type === 'created') {
        // Notification for destination store
        notification.title = '📦 Transfer incoming!';
        notification.message = `${transfer.folio}: ${productCount} product${productCount > 1 ? 's' : ''} (${totalQty} units) from ${STORE_NAMES[transfer.storeOrigin] || transfer.storeOrigin}`;
        notification.targetStore = transfer.storeDestination;
        notification.icon = 'fa-truck';
        notification.color = '#667eea';
    } else if (type === 'received') {
        // Notification for sender (Loyal Vaper)
        notification.title = '✅ Transfer received!';
        notification.message = `${transfer.folio} received by ${transfer.receivedBy} at ${STORE_NAMES[transfer.storeDestination] || transfer.storeDestination}`;
        notification.targetStore = transfer.storeOrigin;
        notification.icon = 'fa-check-circle';
        notification.color = '#10b981';
    }

    // Save notification to Firebase
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            await db.collection('transfer_notifications').add(notification);
            console.log('✅ Notification saved:', notification.title);
        }
    } catch (error) {
        console.warn('Could not save notification to Firebase:', error);
    }

    // Also save locally
    const notifications = JSON.parse(localStorage.getItem('transfer_notifications') || '[]');
    notifications.unshift(notification);
    localStorage.setItem('transfer_notifications', JSON.stringify(notifications.slice(0, 100))); // Keep last 100

    // Don't show popup here - the calling function shows its own toast
    // showTransferNotificationPopup is only for incoming transfers from other stores

    return notification;
}

// Show notification popup (for transfer notifications with title/message)
function showTransferNotificationPopup(notification) {
    // Validate notification object has required fields
    if (!notification || !notification.title || !notification.message) {
        console.warn('Invalid notification object:', notification);
        return;
    }

    // Remove existing toast
    const existingToast = document.getElementById('transferToast');
    if (existingToast) existingToast.remove();

    // Default values for optional fields
    const color = notification.color || '#667eea';
    const icon = notification.icon || 'fa-bell';

    const toast = document.createElement('div');
    toast.id = 'transferToast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 350px;
        border-left: 4px solid ${color};
    `;

    toast.innerHTML = `
        <div style="width: 40px; height: 40px; background: ${color}20; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
            <i class="fas ${icon}" style="color: ${color}; font-size: 18px;"></i>
        </div>
        <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 14px; color: #1f2937;">${notification.title}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${notification.message}</div>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; cursor: pointer; color: #9ca3af; padding: 4px;">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add animation styles if not exists
    if (!document.getElementById('toastStyles')) {
        const style = document.createElement('style');
        style.id = 'toastStyles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// ========================================
// REPORTS SYSTEM
// ========================================

// Open reports modal
function openTransferReports() {
    let modal = document.getElementById('transferReportsModal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'transferReportsModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px; max-height: 90vh; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); display: flex; flex-direction: column;">
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 20px 24px; position: relative;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-chart-bar" style="color: white; font-size: 20px;"></i>
                    </div>
                    <div>
                        <h3 style="color: white; margin: 0; font-size: 18px; font-weight: 700;">Transfer Reports</h3>
                        <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 12px;">View history and export data</p>
                    </div>
                </div>
                <button onclick="closeTransferReports()" style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.2); border: none; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-times" style="color: white; font-size: 16px;"></i>
                </button>
            </div>

            <div style="padding: 20px; overflow-y: auto; flex: 1;">
                <!-- Filters -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                    <div>
                        <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 6px;">Store</label>
                        <select id="reportFilterStore" onchange="updateTransferReport()" style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-size: 13px;">
                            <option value="all">All Stores</option>
                            <option value="1">Miramar</option>
                            <option value="2">Morena</option>
                            <option value="3">Kearny Mesa</option>
                            <option value="4">Chula Vista</option>
                            <option value="5">North Park</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 6px;">From</label>
                        <input type="date" id="reportFilterFrom" onchange="updateTransferReport()" style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-size: 13px;">
                    </div>
                    <div>
                        <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 6px;">To</label>
                        <input type="date" id="reportFilterTo" onchange="updateTransferReport()" style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-size: 13px;">
                    </div>
                </div>

                <!-- Summary Cards -->
                <div id="reportSummary" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
                    <!-- Filled by JS -->
                </div>

                <!-- Results Table -->
                <div id="reportResults" style="background: var(--bg-secondary); border-radius: 12px; overflow: hidden;">
                    <!-- Filled by JS -->
                </div>

                <!-- Export Button -->
                <div style="margin-top: 16px; display: flex; gap: 12px;">
                    <button onclick="exportTransferReport('csv')" style="flex: 1; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--text-primary);">
                        <i class="fas fa-file-csv" style="color: #10b981;"></i> Export CSV
                    </button>
                    <button onclick="exportTransferReport('print')" style="flex: 1; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--text-primary);">
                        <i class="fas fa-print" style="color: #6366f1;"></i> Print
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    document.getElementById('reportFilterTo').value = today.toISOString().split('T')[0];
    document.getElementById('reportFilterFrom').value = thirtyDaysAgo.toISOString().split('T')[0];

    updateTransferReport();
}

// Update report based on filters
function updateTransferReport() {
    const storeFilter = document.getElementById('reportFilterStore').value;
    const fromDate = document.getElementById('reportFilterFrom').value;
    const toDate = document.getElementById('reportFilterTo').value;

    // Filter transfers
    let filtered = transfersState.transfers.filter(t => {
        // Store filter
        if (storeFilter !== 'all' && t.storeDestination !== storeFilter) {
            return false;
        }
        // Date filter
        if (fromDate && t.shipDate < fromDate) return false;
        if (toDate && t.shipDate > toDate) return false;
        return true;
    });

    // Calculate summary
    const totalTransfers = filtered.length;
    const totalProducts = filtered.reduce((sum, t) => {
        if (t.items) return sum + t.items.length;
        return sum + 1;
    }, 0);
    const totalUnits = filtered.reduce((sum, t) => {
        if (t.totalItems) return sum + t.totalItems;
        return sum + (t.quantity || 0);
    }, 0);
    const pendingCount = filtered.filter(t => t.status === 'pending').length;
    const receivedCount = filtered.filter(t => t.status === 'received').length;

    // Render summary
    document.getElementById('reportSummary').innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea20, #764ba220); padding: 16px; border-radius: 12px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #667eea;">${totalTransfers}</div>
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Transfers</div>
        </div>
        <div style="background: linear-gradient(135deg, #8b5cf620, #6366f120); padding: 16px; border-radius: 12px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #8b5cf6;">${totalProducts}</div>
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Products</div>
        </div>
        <div style="background: linear-gradient(135deg, #10b98120, #05966920); padding: 16px; border-radius: 12px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #10b981;">${totalUnits}</div>
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Units</div>
        </div>
        <div style="background: linear-gradient(135deg, #f59e0b20, #d9770620); padding: 16px; border-radius: 12px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${pendingCount}</div>
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Pending</div>
        </div>
    `;

    // Render table
    if (filtered.length === 0) {
        document.getElementById('reportResults').innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                <i class="fas fa-search" style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;"></i>
                <div>No transfers found for selected filters</div>
            </div>
        `;
        return;
    }

    document.getElementById('reportResults').innerHTML = `
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
                <tr style="background: var(--bg-primary);">
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Folio</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 11px; text-transform: uppercase;">To</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Products</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Units</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Date</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Status</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.slice(0, 50).map(t => {
                    const hasItems = t.items && t.items.length > 0;
                    const productName = hasItems
                        ? (t.items.length === 1 ? t.items[0].productName : `${t.items.length} products`)
                        : t.productName;
                    const units = hasItems ? t.totalItems : t.quantity;
                    const statusColor = t.status === 'received' ? '#10b981' : '#f59e0b';
                    const statusBg = t.status === 'received' ? '#10b98120' : '#f59e0b20';

                    return `
                        <tr style="border-top: 1px solid var(--border-color);">
                            <td style="padding: 12px; font-weight: 600; color: #667eea;">${t.folio}</td>
                            <td style="padding: 12px;">${STORE_NAMES[t.storeDestination] || t.storeDestination}</td>
                            <td style="padding: 12px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${productName}</td>
                            <td style="padding: 12px; text-align: center; font-weight: 600;">${units}</td>
                            <td style="padding: 12px; color: var(--text-muted);">${new Date(t.shipDate).toLocaleDateString()}</td>
                            <td style="padding: 12px; text-align: center;">
                                <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase;">${t.status}</span>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        ${filtered.length > 50 ? `<div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 12px;">Showing 50 of ${filtered.length} transfers</div>` : ''}
    `;
}

// Export report
function exportTransferReport(format) {
    const storeFilter = document.getElementById('reportFilterStore').value;
    const fromDate = document.getElementById('reportFilterFrom').value;
    const toDate = document.getElementById('reportFilterTo').value;

    let filtered = transfersState.transfers.filter(t => {
        if (storeFilter !== 'all' && t.storeDestination !== storeFilter) return false;
        if (fromDate && t.shipDate < fromDate) return false;
        if (toDate && t.shipDate > toDate) return false;
        return true;
    });

    if (format === 'csv') {
        // Build CSV
        let csv = 'Folio,From,To,Products,Units,Date,Status,Sent By,Received By\n';

        filtered.forEach(t => {
            const hasItems = t.items && t.items.length > 0;
            const products = hasItems ? t.items.map(i => `${i.productName} (${i.quantity})`).join('; ') : t.productName;
            const units = hasItems ? t.totalItems : t.quantity;

            csv += `"${t.folio}","${STORE_NAMES[t.storeOrigin] || t.storeOrigin}","${STORE_NAMES[t.storeDestination] || t.storeDestination}","${products}",${units},"${t.shipDate}","${t.status}","${t.sentBy || ''}","${t.receivedBy || ''}"\n`;
        });

        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transfers_report_${fromDate}_to_${toDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        if (typeof showNotification === 'function') {
            showNotification('Report exported!', 'success');
        }
    } else if (format === 'print') {
        // Open print dialog
        const printContent = document.getElementById('reportResults').innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Transfer Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #f3f4f6; font-weight: 600; }
                    h1 { font-size: 18px; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <h1>Transfer Report (${fromDate} to ${toDate})</h1>
                ${printContent}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

// Close reports modal
function closeTransferReports() {
    const modal = document.getElementById('transferReportsModal');
    if (modal) modal.remove();
}

// Make functions globally available
window.processTransferPhoto = processTransferPhoto;
window.clearTransferPhoto = clearTransferPhoto;
window.processTransferMedia = processTransferMedia;
window.clearTransferMedia = clearTransferMedia;
window.removeTransferMedia = removeTransferMedia;
window.processAllTransferMedia = processAllTransferMedia;
window.updateAIItemQty = updateAIItemQty;
window.setAIItemQty = setAIItemQty;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;
window.previewReceivePhoto = previewReceivePhoto;
window.closeReceiveModal = closeReceiveModal;
window.processReceiveTransfer = processReceiveTransfer;
window.sendTransferNotification = sendTransferNotification;
window.openTransferReports = openTransferReports;
window.closeTransferReports = closeTransferReports;
window.updateTransferReport = updateTransferReport;
window.exportTransferReport = exportTransferReport;
