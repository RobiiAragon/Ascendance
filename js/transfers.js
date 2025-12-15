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
    const dashboard = document.querySelector('.dashboard');
    if (!dashboard) return;

    // Calculate stats
    const stats = calculateTransferStats();

    dashboard.innerHTML = `
        <!-- Page Header -->
        <div class="page-header">
            <div class="page-header-left">
                <h2 class="section-title">Transferencias entre Tiendas</h2>
                <p class="section-subtitle">Gestiona el movimiento de inventario entre ubicaciones</p>
            </div>
            <div style="display: flex; gap: 12px;">
                <button class="btn-secondary" onclick="loadTransfers(); renderTransfersPage();">
                    <i class="fas fa-sync-alt"></i> Actualizar
                </button>
                <button class="btn-primary" onclick="openTransferModal()">
                    <i class="fas fa-plus"></i> Nueva Transferencia
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
                    <div class="stat-label">Total Transferencias</div>
                </div>
            </div>
            <div class="transfer-stat-card">
                <div class="stat-icon pending">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${stats.pending}</div>
                    <div class="stat-label">Pendientes</div>
                </div>
            </div>
            <div class="transfer-stat-card">
                <div class="stat-icon transit">
                    <i class="fas fa-truck"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${stats.inTransit}</div>
                    <div class="stat-label">En Transito</div>
                </div>
            </div>
            <div class="transfer-stat-card">
                <div class="stat-icon received">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${stats.received}</div>
                    <div class="stat-label">Recibidas</div>
                </div>
            </div>
        </div>

        <!-- Filter Tabs -->
        <div class="transfers-filter-tabs">
            <button class="filter-tab ${transfersState.currentFilter === 'all' ? 'active' : ''}" onclick="filterTransfers('all')">
                <i class="fas fa-border-all"></i>
                <span>Todas</span>
            </button>
            <button class="filter-tab ${transfersState.currentFilter === 'pending' ? 'active' : ''}" onclick="filterTransfers('pending')">
                <i class="fas fa-clock"></i>
                <span>Pendientes</span>
            </button>
            <button class="filter-tab ${transfersState.currentFilter === 'in-transit' ? 'active' : ''}" onclick="filterTransfers('in-transit')">
                <i class="fas fa-truck"></i>
                <span>En Transito</span>
            </button>
            <button class="filter-tab ${transfersState.currentFilter === 'received' ? 'active' : ''}" onclick="filterTransfers('received')">
                <i class="fas fa-check-circle"></i>
                <span>Recibidas</span>
            </button>
        </div>

        <!-- Transfers Table -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-list"></i>
                    Historial de Transferencias
                </h3>
            </div>
            <div class="card-body" style="padding: 0;">
                ${renderTransfersTable()}
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
                <h3>No hay transferencias</h3>
                <p>Las transferencias apareceran aqui una vez creadas</p>
            </div>
        `;
    }

    return `
        <table class="transfers-table">
            <thead>
                <tr>
                    <th>Folio</th>
                    <th>Ruta</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Fecha</th>
                    <th>Enviado por</th>
                    <th>Estado</th>
                    <th>Acciones</th>
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
        'pending': 'Pendiente',
        'in-transit': 'En Transito',
        'received': 'Recibida'
    };

    const formattedDate = new Date(transfer.shipDate).toLocaleDateString('es-MX', {
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
                        Ver
                    </button>
                    ${transfer.status !== 'received' ? `
                        <button class="confirm-receive-btn" onclick="confirmReceiveTransfer('${transfer.id}')">
                            <i class="fas fa-check"></i>
                            Recibir
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
            Buscando productos...
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
                    No se encontraron productos para "${query}"
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
                Error al buscar productos. Intenta de nuevo.
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
        showTransferMessage('Por favor selecciona la tienda origen', 'error');
        return;
    }

    if (!storeDestination) {
        showTransferMessage('Por favor selecciona la tienda destino', 'error');
        return;
    }

    if (storeOrigin === storeDestination) {
        showTransferMessage('La tienda origen y destino no pueden ser la misma', 'error');
        return;
    }

    if (!transfersState.selectedProduct) {
        showTransferMessage('Por favor selecciona un producto', 'error');
        return;
    }

    if (!quantity || parseInt(quantity) < 1) {
        showTransferMessage('Por favor ingresa una cantidad valida', 'error');
        return;
    }

    if (!shipDate) {
        showTransferMessage('Por favor selecciona la fecha de envio', 'error');
        return;
    }

    if (!sentBy) {
        showTransferMessage('Por favor ingresa quien envia', 'error');
        return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando...';

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
        showTransferMessage(`Transferencia ${transfer.folio} creada exitosamente!`, 'success');

        // Close modal and refresh after delay
        setTimeout(() => {
            closeTransferModal();
            renderTransfersPage();
        }, 1500);

    } catch (error) {
        console.error('Error creating transfer:', error);
        showTransferMessage('Error al crear la transferencia. Intenta de nuevo.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Crear Transferencia';
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
        'pending': 'Pendiente',
        'in-transit': 'En Transito',
        'received': 'Recibida'
    };

    title.innerHTML = `<i class="fas fa-exchange-alt" style="color: var(--accent-primary); margin-right: 10px;"></i> ${transfer.folio}`;

    body.innerHTML = `
        <div class="order-detail-section">
            <h3>Informacion de Transferencia</h3>
            <div class="order-detail-grid">
                <div class="order-detail-item">
                    <span class="order-detail-label">Folio</span>
                    <span class="order-detail-value transfer-folio">${transfer.folio}</span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Estado</span>
                    <span class="order-detail-value">
                        <span class="transfer-status-badge ${transfer.status}">${statusLabels[transfer.status]}</span>
                    </span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Tienda Origen</span>
                    <span class="order-detail-value">VSU ${transfer.storeOrigin}</span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Tienda Destino</span>
                    <span class="order-detail-value">VSU ${transfer.storeDestination}</span>
                </div>
            </div>
        </div>

        <div class="order-detail-section">
            <h3>Producto</h3>
            <div class="order-detail-grid">
                <div class="order-detail-item" style="grid-column: 1 / -1;">
                    <span class="order-detail-label">Nombre</span>
                    <span class="order-detail-value">${transfer.productName}</span>
                </div>
                ${transfer.productSku ? `
                    <div class="order-detail-item">
                        <span class="order-detail-label">SKU</span>
                        <span class="order-detail-value" style="font-family: 'Space Mono', monospace;">${transfer.productSku}</span>
                    </div>
                ` : ''}
                <div class="order-detail-item">
                    <span class="order-detail-label">Cantidad</span>
                    <span class="order-detail-value" style="font-size: 24px; font-weight: 700; color: var(--accent-primary);">${transfer.quantity}</span>
                </div>
            </div>
        </div>

        <div class="order-detail-section">
            <h3>Envio</h3>
            <div class="order-detail-grid">
                <div class="order-detail-item">
                    <span class="order-detail-label">Fecha de Envio</span>
                    <span class="order-detail-value">${new Date(transfer.shipDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Enviado por</span>
                    <span class="order-detail-value">${transfer.sentBy}</span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Creado</span>
                    <span class="order-detail-value">${new Date(transfer.createdAt).toLocaleString('es-MX')}</span>
                </div>
                ${transfer.receivedAt ? `
                    <div class="order-detail-item">
                        <span class="order-detail-label">Recibido</span>
                        <span class="order-detail-value">${new Date(transfer.receivedAt).toLocaleString('es-MX')}</span>
                    </div>
                    <div class="order-detail-item">
                        <span class="order-detail-label">Recibido por</span>
                        <span class="order-detail-value">${transfer.receivedBy}</span>
                    </div>
                ` : ''}
            </div>
        </div>

        ${transfer.notes ? `
            <div class="order-detail-section">
                <h3>Notas</h3>
                <div class="order-detail-item">
                    <span class="order-detail-value">${transfer.notes}</span>
                </div>
            </div>
        ` : ''}

        ${transfer.status !== 'received' ? `
            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-color);">
                <button class="btn-primary" onclick="confirmReceiveTransfer('${transfer.id}'); closeTransferDetailsModal();" style="width: 100%;">
                    <i class="fas fa-check"></i>
                    Confirmar Recepcion
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
        alert('Transferencia no encontrada');
        return;
    }

    if (transfer.status === 'received') {
        alert('Esta transferencia ya fue recibida');
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
    alert(`Transferencia ${transfer.folio} recibida exitosamente!`);

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
    // Hide main dashboard content
    const dashboard = document.querySelector('.dashboard');
    const transfersSection = document.getElementById('transfersSection');

    // Update page title
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = 'Transferencias entre Tiendas';
    }

    // Update search placeholder
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        searchInput.placeholder = 'Buscar transferencias...';
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
