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
    isLoadingProducts: false
};

// Generate unique transfer folio
function generateTransferFolio() {
    const transfers = JSON.parse(localStorage.getItem('storeTransfers') || '[]');
    const lastFolio = transfers.length > 0
        ? parseInt(transfers[transfers.length - 1].folio.replace('TR-', ''))
        : 0;
    const newNumber = (lastFolio + 1).toString().padStart(4, '0');
    return `TR-${newNumber}`;
}

// Initialize Transfers Module
function initializeTransfersModule() {
    console.log('🔄 Initializing Transfers Module...');

    // Wait a bit for DOM to be fully ready
    setTimeout(() => {
        loadTransfers();
        renderTransfersPage();
        setupProductSearch();
        setDefaultDate();
        setDefaultSentBy();
        console.log('✅ Transfers Module ready!');
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

// Load transfers from localStorage/Firebase
function loadTransfers() {
    try {
        const savedTransfers = localStorage.getItem('storeTransfers');
        transfersState.transfers = savedTransfers ? JSON.parse(savedTransfers) : [];
    } catch (e) {
        console.error('Error loading transfers:', e);
        transfersState.transfers = [];
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

    dashboard.innerHTML = `
        <!-- Page Header -->
        <div class="page-header">
            <div class="page-header-left">
                <h2 class="section-title">Store Transfers</h2>
                <p class="section-subtitle">Manage inventory movement between locations</p>
            </div>
            <div style="display: flex; gap: 12px;">
                <button class="btn-secondary" onclick="loadTransfers(); renderTransfersPage();">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
                <button onclick="openAITransferModal()" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-robot"></i> AI Transfer
                </button>
                <button class="btn-primary" onclick="openTransferModal()">
                    <i class="fas fa-plus"></i> New Transfer
                </button>
            </div>
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
                <div class="stat-icon transit">
                    <i class="fas fa-truck"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${stats.inTransit}</div>
                    <div class="stat-label">In Transit</div>
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

        <!-- Filter Tabs -->
        <div class="transfers-filter-tabs">
            <button class="filter-tab ${transfersState.currentFilter === 'all' ? 'active' : ''}" onclick="filterTransfers('all')">
                <i class="fas fa-border-all"></i>
                <span>All</span>
            </button>
            <button class="filter-tab ${transfersState.currentFilter === 'pending' ? 'active' : ''}" onclick="filterTransfers('pending')">
                <i class="fas fa-clock"></i>
                <span>Pending</span>
            </button>
            <button class="filter-tab ${transfersState.currentFilter === 'in-transit' ? 'active' : ''}" onclick="filterTransfers('in-transit')">
                <i class="fas fa-truck"></i>
                <span>In Transit</span>
            </button>
            <button class="filter-tab ${transfersState.currentFilter === 'received' ? 'active' : ''}" onclick="filterTransfers('received')">
                <i class="fas fa-check-circle"></i>
                <span>Received</span>
            </button>
        </div>

        <!-- Transfers Table -->
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

        <!-- New Transfer Modal -->
        <div class="modal" id="transferModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>New Transfer</h3>
                    <button class="close-modal" onclick="closeTransferModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="transferMessage" class="alert" style="display: none;"></div>
                    <form id="transferForm" onsubmit="event.preventDefault(); submitTransfer();">
                        <div class="form-row" style="display: flex; gap: 15px; margin-bottom: 15px;">
                            <div class="form-group" style="flex: 1;">
                                <label class="form-label">Origin Store</label>
                                <select id="transferStoreOrigin" class="form-control" onchange="handleOriginStoreChange()" required>
                                    <option value="">Select Store</option>
                                    <option value="1">VSU 1</option>
                                    <option value="2">VSU 2</option>
                                    <option value="3">VSU 3</option>
                                    <option value="4">VSU 4</option>
                                    <option value="5">VSU 5</option>
                                </select>
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label class="form-label">Destination Store</label>
                                <select id="transferStoreDestination" class="form-control" required>
                                    <option value="">Select Store</option>
                                    <option value="1">VSU 1</option>
                                    <option value="2">VSU 2</option>
                                    <option value="3">VSU 3</option>
                                    <option value="4">VSU 4</option>
                                    <option value="5">VSU 5</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 15px;">
                            <label class="form-label">Product</label>
                            <div class="product-search-container" style="position: relative;">
                                <input type="text" id="transferProductSearch" class="form-control" placeholder="Search product..." autocomplete="off">
                                <div id="productSearchResults" class="product-search-results" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--card-bg, #fff); border: 1px solid var(--border-color, #ddd); border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 100; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>
                            </div>
                            <div id="selectedProductDisplay" class="selected-product-display" style="display: none; background: var(--bg-secondary, #f5f5f5); padding: 10px; border-radius: 8px; align-items: center; justify-content: space-between;"></div>
                            <input type="hidden" id="transferProductId">
                        </div>

                        <div class="form-row" style="display: flex; gap: 15px; margin-bottom: 15px;">
                            <div class="form-group" style="flex: 1;">
                                <label class="form-label">Quantity</label>
                                <input type="number" id="transferQuantity" class="form-control" min="1" value="1" required>
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label class="form-label">Ship Date</label>
                                <input type="date" id="transferShipDate" class="form-control" required>
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 15px;">
                            <label class="form-label">Sent By</label>
                            <input type="text" id="transferSentBy" class="form-control" required>
                        </div>

                        <div class="form-group" style="margin-bottom: 20px;">
                            <label class="form-label">Notes</label>
                            <textarea id="transferNotes" class="form-control" rows="2"></textarea>
                        </div>

                        <div class="form-actions" style="display: flex; justify-content: flex-end; gap: 10px;">
                            <button type="button" class="btn-secondary" onclick="closeTransferModal()">Cancel</button>
                            <button type="submit" id="submitTransferBtn" class="btn-primary">Create Transfer</button>
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
                    <button class="close-modal" onclick="closeTransferDetailsModal()">&times;</button>
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
        inTransit: transfers.filter(t => t.status === 'in-transit').length,
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

// Render single transfer row
function renderTransferRow(transfer) {
    const statusClass = transfer.status;
    const statusLabels = {
        'pending': 'Pending',
        'in-transit': 'In Transit',
        'received': 'Received'
    };

    const formattedDate = new Date(transfer.shipDate).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    return `
        <tr>
            <td>
                <span class="transfer-folio">${transfer.folio}</span>
            </td>
            <td>
                <div class="transfer-route">
                    <span class="store-name">${transfer.storeOrigin}</span>
                    <i class="fas fa-arrow-right route-arrow"></i>
                    <span class="store-name">${transfer.storeDestination}</span>
                </div>
            </td>
            <td>
                <div style="font-weight: 600;">${transfer.productName}</div>
                ${transfer.productSku ? `<div style="font-size: 11px; color: var(--text-muted); font-family: 'Space Mono', monospace;">${transfer.productSku}</div>` : ''}
            </td>
            <td>
                <span style="font-weight: 700; font-size: 16px;">${transfer.quantity}</span>
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
                </div>
            </td>
        </tr>
    `;
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

    if (!resultsContainer) return;

    // Show loading
    resultsContainer.innerHTML = `
        <div class="product-search-loading">
            <i class="fas fa-spinner fa-spin"></i>
            Searching products...
        </div>
    `;
    resultsContainer.style.display = 'block';

    try {
        // Check if we have cached products
        if (transfersState.productsCache.length === 0) {
            // Fetch products from Shopify using the existing function
            if (typeof fetchStoreInventory === 'function') {
                transfersState.productsCache = await fetchStoreInventory('vsu', 250);
            } else {
                throw new Error('fetchStoreInventory function not available');
            }
        }

        // Filter products by query
        const queryLower = query.toLowerCase();
        const filteredProducts = transfersState.productsCache.filter(product => {
            return (
                product.productName.toLowerCase().includes(queryLower) ||
                (product.sku && product.sku.toLowerCase().includes(queryLower)) ||
                (product.brand && product.brand.toLowerCase().includes(queryLower)) ||
                (product.flavor && product.flavor.toLowerCase().includes(queryLower))
            );
        }).slice(0, 20); // Limit to 20 results

        if (filteredProducts.length === 0) {
            resultsContainer.innerHTML = `
                <div class="product-search-no-results">
                    <i class="fas fa-search"></i>
                    No products found for "${query}"
                </div>
            `;
            return;
        }

        // Render results
        resultsContainer.innerHTML = filteredProducts.map(product => `
            <div class="product-search-item" onclick='selectProduct(${JSON.stringify(product).replace(/'/g, "\\'")})'>
                <div class="product-name">${product.productName}${product.flavor && product.flavor !== 'N/A' ? ` - ${product.flavor}` : ''}</div>
                <div class="product-details">
                    ${product.sku ? `<span class="product-sku">SKU: ${product.sku}</span>` : ''}
                    <span>Stock: ${product.stock}</span>
                    ${product.brand ? `<span>${product.brand}</span>` : ''}
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error searching products:', error);
        resultsContainer.innerHTML = `
            <div class="product-search-no-results">
                <i class="fas fa-exclamation-triangle" style="color: var(--danger);"></i>
                Error searching products. Please try again.
            </div>
        `;
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

    // Show selected product display
    const selectedDisplay = document.getElementById('selectedProductDisplay');
    if (selectedDisplay) {
        selectedDisplay.innerHTML = `
            <div class="product-info">
                <div class="product-name">${product.productName}${product.flavor && product.flavor !== 'N/A' ? ` - ${product.flavor}` : ''}</div>
                <div class="product-meta">
                    ${product.sku ? `SKU: ${product.sku} • ` : ''}
                    Stock: ${product.stock}
                    ${product.brand ? ` • ${product.brand}` : ''}
                </div>
            </div>
            <button type="button" class="remove-product" onclick="clearSelectedProduct()">
                <i class="fas fa-times"></i>
            </button>
        `;
        selectedDisplay.style.display = 'flex';
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
    }
    if (selectedDisplay) {
        selectedDisplay.style.display = 'none';
    }
    if (productIdInput) {
        productIdInput.value = '';
    }
}

// Submit transfer
async function submitTransfer() {
    const form = document.getElementById('transferForm');
    const messageEl = document.getElementById('transferMessage');
    const submitBtn = document.getElementById('submitTransferBtn');

    // Validate form
    const storeOrigin = document.getElementById('transferStoreOrigin').value;
    const storeDestination = document.getElementById('transferStoreDestination').value;
    const quantity = document.getElementById('transferQuantity').value;
    const shipDate = document.getElementById('transferShipDate').value;
    const sentBy = document.getElementById('transferSentBy').value;
    const notes = document.getElementById('transferNotes').value;

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

    if (!transfersState.selectedProduct) {
        showTransferMessage('Please select a product', 'error');
        return;
    }

    if (!quantity || parseInt(quantity) < 1) {
        showTransferMessage('Please enter a valid quantity', 'error');
        return;
    }

    if (!shipDate) {
        showTransferMessage('Please select a ship date', 'error');
        return;
    }

    if (!sentBy) {
        showTransferMessage('Please enter who is sending', 'error');
        return;
    }

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

        // Save to localStorage
        saveTransfers();

        // Try to save to Firebase if available
        await saveTransferToFirebase(transfer);

        // Show success message
        showTransferMessage(`Transfer ${transfer.folio} created successfully!`, 'success');

        // Close modal and refresh after delay
        setTimeout(() => {
            closeTransferModal();
            renderTransfersPage();
        }, 1500);

    } catch (error) {
        console.error('Error creating transfer:', error);
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
            console.log('Transfer saved to Firebase:', transfer.folio);
        }
    } catch (error) {
        console.warn('Could not save transfer to Firebase:', error);
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

// View transfer details
function viewTransferDetails(transferId) {
    const transfer = transfersState.transfers.find(t => t.id === transferId);
    if (!transfer) return;

    const modal = document.getElementById('transferDetailsModal');
    const title = document.getElementById('transferDetailsTitle');
    const body = document.getElementById('transferDetailsBody');

    if (!modal || !title || !body) return;

    const statusLabels = {
        'pending': 'Pending',
        'in-transit': 'In Transit',
        'received': 'Received'
    };

    title.innerHTML = `<i class="fas fa-exchange-alt" style="color: var(--accent-primary); margin-right: 10px;"></i> ${transfer.folio}`;

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
                    <span class="order-detail-label">Origin Store</span>
                    <span class="order-detail-value">VSU ${transfer.storeOrigin}</span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Destination Store</span>
                    <span class="order-detail-value">VSU ${transfer.storeDestination}</span>
                </div>
            </div>
        </div>

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

        ${transfer.status !== 'received' ? `
            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-color);">
                <button class="btn-primary" onclick="confirmReceiveTransfer('${transfer.id}'); closeTransferDetailsModal();" style="width: 100%;">
                    <i class="fas fa-check"></i>
                    Confirm Receipt
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

// Confirm receive transfer
async function confirmReceiveTransfer(transferId) {
    const transfer = transfersState.transfers.find(t => t.id === transferId);
    if (!transfer) {
        alert('Transfer not found');
        return;
    }

    if (transfer.status === 'received') {
        alert('This transfer has already been received');
        return;
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

    // Save to localStorage
    saveTransfers();

    // Try to update in Firebase
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            await db.collection('transfers').doc(transfer.id).update({
                status: 'received',
                receivedAt: transfer.receivedAt,
                receivedBy: transfer.receivedBy
            });
        }
    } catch (error) {
        console.warn('Could not update transfer in Firebase:', error);
    }

    // Show confirmation
    alert(`Transfer ${transfer.folio} received successfully!`);

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
    isProcessing: false
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
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
                    <h3 style="color: white; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-robot"></i> AI Transfer Assistant
                    </h3>
                    <button class="close-modal" onclick="closeAITransferModal()" style="color: white;">&times;</button>
                </div>
                <div class="modal-body" style="padding: 24px;">
                    <div style="margin-bottom: 20px;">
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">
                            Describe your transfer naturally. Example:<br>
                            <em style="color: var(--accent-primary);">"5 Lost Mary Watermelon, 10 Elf Bar Blueberry, 3 Geek Bar from VSU 2 to VSU 4"</em>
                        </p>

                        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                            <div style="flex: 1;">
                                <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">From</label>
                                <select id="aiTransferOrigin" class="form-control" style="width: 100%;">
                                    <option value="">Select Origin</option>
                                    <option value="1">VSU 1</option>
                                    <option value="2">VSU 2</option>
                                    <option value="3">VSU 3</option>
                                    <option value="4">VSU 4</option>
                                    <option value="5">VSU 5</option>
                                </select>
                            </div>
                            <div style="flex: 1;">
                                <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">To</label>
                                <select id="aiTransferDestination" class="form-control" style="width: 100%;">
                                    <option value="">Select Destination</option>
                                    <option value="1">VSU 1</option>
                                    <option value="2">VSU 2</option>
                                    <option value="3">VSU 3</option>
                                    <option value="4">VSU 4</option>
                                    <option value="5">VSU 5</option>
                                </select>
                            </div>
                        </div>

                        <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Products (one per line or comma separated)</label>
                        <textarea id="aiTransferInput" class="form-control" rows="4" placeholder="5 Lost Mary Watermelon&#10;10 Elf Bar Blueberry&#10;3 Geek Bar Grape..." style="font-size: 14px; resize: vertical;"></textarea>
                    </div>

                    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                        <button onclick="parseAITransferInput()" style="flex: 1; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <i class="fas fa-magic"></i> Parse Items
                        </button>
                        <button onclick="startVoiceInput()" style="width: 48px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Voice Input">
                            <i class="fas fa-microphone" style="color: var(--accent-primary);"></i>
                        </button>
                    </div>

                    <div id="aiTransferResults" style="display: none;">
                        <h4 style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-clipboard-list" style="color: #10b981;"></i> Parsed Items
                        </h4>
                        <div id="aiTransferItemsList" style="max-height: 250px; overflow-y: auto; margin-bottom: 16px;"></div>

                        <div style="display: flex; gap: 10px;">
                            <button onclick="closeAITransferModal()" class="btn-secondary" style="flex: 1;">Cancel</button>
                            <button onclick="createAITransfers()" class="btn-primary" style="flex: 1; background: #10b981;">
                                <i class="fas fa-check"></i> Create Transfers
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
    document.getElementById('aiTransferInput').value = '';
    document.getElementById('aiTransferResults').style.display = 'none';
    document.getElementById('aiTransferLoading').style.display = 'none';

    modal.classList.add('active');
}

// Close AI Transfer Modal
function closeAITransferModal() {
    const modal = document.getElementById('aiTransferModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Parse AI Transfer Input
async function parseAITransferInput() {
    const input = document.getElementById('aiTransferInput').value.trim();
    const origin = document.getElementById('aiTransferOrigin').value;
    const destination = document.getElementById('aiTransferDestination').value;

    if (!input) {
        alert('Please enter the products to transfer');
        return;
    }

    if (!origin || !destination) {
        alert('Please select origin and destination stores');
        return;
    }

    if (origin === destination) {
        alert('Origin and destination cannot be the same');
        return;
    }

    // Show loading
    document.getElementById('aiTransferLoading').style.display = 'block';
    document.getElementById('aiTransferResults').style.display = 'none';

    try {
        // Try to use AI to parse, or fallback to simple parsing
        const items = await parseTransferWithAI(input);

        if (items.length === 0) {
            alert('Could not parse any items. Please check the format.');
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
            alert('Error parsing items. Please try again.');
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

    // Try to match with actual products from Shopify
    if (transfersState.productsCache.length === 0) {
        try {
            if (typeof fetchStoreInventory === 'function') {
                transfersState.productsCache = await fetchStoreInventory('vsu', 250);
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

    if (!listEl || !resultsEl) return;

    listEl.innerHTML = aiTransferState.parsedItems.map((item, index) => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 10px; margin-bottom: 8px; border-left: 4px solid ${item.matched ? '#10b981' : '#f59e0b'};">
            <div style="width: 40px; height: 40px; background: ${item.matched ? '#10b98120' : '#f59e0b20'}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: ${item.matched ? '#10b981' : '#f59e0b'};">
                ${item.quantity}
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 600; color: var(--text-primary);">${item.productName}</div>
                ${item.matched ? `
                    <div style="font-size: 12px; color: #10b981;"><i class="fas fa-check-circle"></i> Matched: ${item.matchedProduct.productName}</div>
                ` : `
                    <div style="font-size: 12px; color: #f59e0b;"><i class="fas fa-exclamation-triangle"></i> No exact match - will create as entered</div>
                `}
            </div>
            <button onclick="removeAIParsedItem(${index})" style="background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px;">
                <i class="fas fa-times"></i>
            </button>
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

// Create transfers from parsed items
async function createAITransfers() {
    const origin = document.getElementById('aiTransferOrigin').value;
    const destination = document.getElementById('aiTransferDestination').value;

    if (aiTransferState.parsedItems.length === 0) {
        alert('No items to transfer');
        return;
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
    let createdCount = 0;

    for (const item of aiTransferState.parsedItems) {
        const transfer = {
            id: Date.now().toString() + '_' + createdCount,
            folio: generateTransferFolio(),
            storeOrigin: origin,
            storeDestination: destination,
            productId: item.matchedProduct?.id || null,
            productName: item.matchedProduct?.productName || item.productName,
            productSku: item.matchedProduct?.sku || '',
            quantity: item.quantity,
            shipDate: today,
            sentBy: sentBy,
            notes: 'Created via AI Transfer',
            status: 'pending',
            createdAt: new Date().toISOString(),
            receivedAt: null,
            receivedBy: null
        };

        transfersState.transfers.push(transfer);
        createdCount++;

        // Small delay to ensure unique IDs
        await new Promise(r => setTimeout(r, 10));
    }

    // Save to localStorage
    saveTransfers();

    // Close modal and refresh
    closeAITransferModal();
    renderTransfersPage();

    // Show success message
    alert(`${createdCount} transfer(s) created successfully!`);
}

// Voice input for AI transfer
function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Voice recognition is not supported in this browser. Try Chrome.');
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
        alert('Voice recognition error: ' + event.error);
    };

    recognition.start();
}
