// Abundance Cloud JavaScript
// This file handles all Shopify order management functionality

// Configuration
// Now uses the Next.js backend via api-client.js
const ABUNDANCE_CONFIG = window.ABUNDANCE_CONFIG || {
    shopifyUrl: 'k1xm3v-v0',
    shopifyAdminUrl: 'https://admin.shopify.com/store/k1xm3v-v0',
    storeName: 'Loyal Vaper',
    organizationName: 'Abundance Cloud Engine',
    features: {
        autoRefresh: true,
        refreshInterval: 120000, // 2 minutes
        barcodeScanner: true,
        debugMode: true,
        useBackendAPI: true // Use Next.js backend via api-client.js
    }
};

// Use config values or defaults
const refreshInterval = ABUNDANCE_CONFIG.features?.refreshInterval || ABUNDANCE_CONFIG.refreshInterval || 120000;

// State Management
let abundanceState = {
    orders: [],
    selectedOrders: [],
    currentFilter: 'all',
    currentMarkAsType: null,
    barcodeScanner: null,
    videoStream: null,
    authToken: null, // You'll need to integrate with your auth system
    refreshIntervalId: null
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Abundance Cloud initialized');
    initializeAbundanceCloud();
});

function initializeAbundanceCloud() {
    // Load initial orders
    loadOrders();

    // Set up auto-refresh if enabled
    if (ABUNDANCE_CONFIG.features?.autoRefresh !== false) {
        abundanceState.refreshIntervalId = setInterval(() => {
            loadOrders(true); // Silent refresh
        }, refreshInterval);
    }

    // Set up search
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
}

// API Functions
async function loadOrders(silent = false) {
    if (!silent) {
        showLoading();
    }

    try {
        // This would connect to your actual API
        // For now, we'll use mock data
        const response = await fetchOrders(abundanceState.currentFilter);
        abundanceState.orders = response.orders || [];
        renderOrdersTable();

        if (!silent) {
            hideLoading();
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        if (!silent) {
            showEmptyState();
        }
    }
}

async function fetchOrders(filterType = 'all') {
    // Use Next.js backend API via api-client.js
    if (ABUNDANCE_CONFIG.features.useBackendAPI && typeof fetchOrdersFromAPI === 'function') {
        try {
            console.log(`[Abundance Cloud] Fetching orders via backend API (filter: ${filterType})`);
            const data = await fetchOrdersFromAPI(filterType);
            return {
                orders: data.orders || [],
                pageInfo: data.pageInfo || {}
            };
        } catch (error) {
            console.error('Error fetching orders from backend:', error);
            // Fallback to local storage if backend fails
            return getLocalOrders(filterType);
        }
    }

    // Fallback to local storage
    console.log('[Abundance Cloud] Using local storage fallback');
    return getLocalOrders(filterType);
}

// Direct Shopify API Functions
async function fetchOrdersFromShopify(filterType = 'all') {
    try {
        console.log('Fetching orders from Shopify...');

        // Build GraphQL query
        const query = `
            query getOrders {
                orders(first: 50, reverse: true) {
                    edges {
                        node {
                            id
                            name
                            createdAt
                            displayFinancialStatus
                            displayFulfillmentStatus
                            customer {
                                displayName
                            }
                            totalPriceSet {
                                shopMoney {
                                    amount
                                }
                            }
                            subtotalPriceSet {
                                shopMoney {
                                    amount
                                }
                            }
                            totalTaxSet {
                                shopMoney {
                                    amount
                                }
                            }
                            shippingAddress {
                                address1
                                address2
                                city
                                province
                                zip
                            }
                            lineItems(first: 20) {
                                edges {
                                    node {
                                        id
                                        name
                                        quantity
                                    }
                                }
                            }
                            taxLines {
                                title
                                priceSet {
                                    shopMoney {
                                        amount
                                    }
                                }
                            }
                            customAttributes {
                                key
                                value
                            }
                            metafields(first: 10) {
                                edges {
                                    node {
                                        key
                                        value
                                    }
                                }
                            }
                            note
                            tags
                            sourceName
                            shippingLines(first: 1) {
                                edges {
                                    node {
                                        title
                                    }
                                }
                            }
                            fulfillmentOrders(first: 5) {
                                edges {
                                    node {
                                        status
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        const response = await fetch(
            `https://${ABUNDANCE_CONFIG.shopifyDomain}/admin/api/2024-10/graphql.json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': ABUNDANCE_CONFIG.shopifyAccessToken
                },
                body: JSON.stringify({ query })
            }
        );

        if (!response.ok) {
            throw new Error(`Shopify API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.errors) {
            console.error('GraphQL errors:', data.errors);
            throw new Error('GraphQL query failed');
        }

        // Transform Shopify data to our format
        const orders = data.data.orders.edges.map(edge => transformShopifyOrder(edge.node));

        // Apply filter
        let filteredOrders = orders;
        if (filterType === 'shipping') {
            filteredOrders = orders.filter(o => o.isDelivery === true);
        } else if (filterType === 'pickup') {
            filteredOrders = orders.filter(o => o.isDelivery === false);
        } else if (filterType === 'manual') {
            filteredOrders = orders.filter(o => o.sourceName === 'shopify_draft_order');
        }

        console.log(`Loaded ${filteredOrders.length} orders from Shopify`);

        return {
            orders: filteredOrders,
            pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false
            }
        };
    } catch (error) {
        console.error('Error fetching from Shopify:', error);
        // Fallback to local storage if Shopify fails
        return getLocalOrders(filterType);
    }
}

function transformShopifyOrder(shopifyOrder) {
    // Determine if it's delivery or pickup
    const hasShippingAddress = shopifyOrder.shippingAddress !== null;
    const isPickup = shopifyOrder.customAttributes?.some(attr =>
        attr.key === 'Pickup-Location-Company'
    );

    // Parse note attributes from tags or note
    const noteAttributes = [];
    if (shopifyOrder.tags) {
        shopifyOrder.tags.forEach(tag => {
            if (tag.includes('Fulfillment by')) {
                noteAttributes.push({ name: 'Fulfillment by', value: tag });
            }
            if (tag.includes('Received in shop by')) {
                noteAttributes.push({ name: 'Received in shop by', value: tag });
            }
            if (tag.includes('Delivered by')) {
                noteAttributes.push({ name: 'Delivered by', value: tag });
            }
        });
    }

    return {
        id: shopifyOrder.id,
        name: shopifyOrder.name,
        customer: shopifyOrder.customer?.displayName || null,
        createdAt: shopifyOrder.createdAt,
        displayFinancialStatus: shopifyOrder.displayFinancialStatus,
        displayFulfillmentStatus: shopifyOrder.displayFulfillmentStatus,
        isDelivery: hasShippingAddress && !isPickup,
        sourceName: shopifyOrder.sourceName || 'web',
        lineItems: shopifyOrder.lineItems.edges.map(edge => ({
            id: edge.node.id,
            name: edge.node.name,
            quantity: edge.node.quantity
        })),
        taxLines: shopifyOrder.taxLines || [],
        subtotal: shopifyOrder.subtotalPriceSet.shopMoney.amount,
        totalTax: shopifyOrder.totalTaxSet.shopMoney.amount,
        total: shopifyOrder.totalPriceSet.shopMoney.amount,
        shippingAddress: shopifyOrder.shippingAddress,
        customAttributes: shopifyOrder.customAttributes || [],
        metafields: shopifyOrder.metafields?.edges.map(edge => ({
            key: edge.node.key,
            value: edge.node.value
        })) || [],
        noteAttributes: noteAttributes,
        fulfillmentOrders: shopifyOrder.fulfillmentOrders?.edges.map(edge => ({
            status: edge.node.status
        })) || [],
        shippingLines: shopifyOrder.shippingLines?.edges.map(edge => ({
            title: edge.node.title
        })) || []
    };
}

async function getAuthToken() {
    // Integrate with your Firebase auth or authentication system
    // This should return the Firebase ID token
    return 'mock-token';
}

// Local Storage Functions
function initializeLocalStorage() {
    if (!localStorage.getItem('abundanceOrders')) {
        const initialOrders = generateSampleOrders();
        saveOrdersToLocal(initialOrders);
    }
}

function saveOrdersToLocal(orders) {
    localStorage.setItem('abundanceOrders', JSON.stringify(orders));
}

function getLocalOrders(filterType = 'all') {
    initializeLocalStorage();

    const allOrders = JSON.parse(localStorage.getItem('abundanceOrders') || '[]');

    let filteredOrders = allOrders;

    // Apply filter
    if (filterType === 'shipping') {
        filteredOrders = allOrders.filter(o => o.isDelivery === true);
    } else if (filterType === 'pickup') {
        filteredOrders = allOrders.filter(o => o.isDelivery === false);
    } else if (filterType === 'manual') {
        filteredOrders = allOrders.filter(o => o.sourceName === 'shopify_draft_order');
    }

    return {
        orders: filteredOrders,
        pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false
        }
    };
}

function updateOrderInLocal(orderId, updates) {
    const allOrders = JSON.parse(localStorage.getItem('abundanceOrders') || '[]');
    const orderIndex = allOrders.findIndex(o => o.id === orderId);

    if (orderIndex > -1) {
        allOrders[orderIndex] = { ...allOrders[orderIndex], ...updates };
        saveOrdersToLocal(allOrders);
        return true;
    }
    return false;
}

function generateSampleOrders() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    return [
        {
            id: 'gid://shopify/Order/1001',
            name: '#1001',
            customer: 'John Doe',
            createdAt: now.toISOString(),
            displayFinancialStatus: 'PAID',
            displayFulfillmentStatus: 'UNFULFILLED',
            isDelivery: false,
            sourceName: 'web',
            lineItems: [
                { id: '1', name: 'Vape Pen Starter Kit', quantity: 1 },
                { id: '2', name: 'E-Liquid Berry Blast 30ml', quantity: 2 }
            ],
            taxLines: [
                { title: 'CA Sales Tax', priceSet: { shopMoney: { amount: '8.25' } } }
            ],
            subtotal: '89.99',
            totalTax: '8.25',
            total: '98.24',
            shippingAddress: null,
            customAttributes: [
                { key: 'Pickup-Location-Company', value: 'VSU Miramar' }
            ],
            metafields: [],
            noteAttributes: [],
            fulfillmentOrders: [{ status: 'OPEN' }],
            shippingLines: [{ title: 'Local Pickup - VSU Miramar' }]
        },
        {
            id: 'gid://shopify/Order/1002',
            name: '#1002',
            customer: 'Jane Smith',
            createdAt: yesterday.toISOString(),
            displayFinancialStatus: 'PAID',
            displayFulfillmentStatus: 'UNFULFILLED',
            isDelivery: true,
            sourceName: 'web',
            lineItems: [
                { id: '3', name: 'Premium Mod Kit', quantity: 1 },
                { id: '4', name: 'Replacement Coils (5-pack)', quantity: 2 }
            ],
            taxLines: [
                { title: 'CA Sales Tax', priceSet: { shopMoney: { amount: '12.50' } } }
            ],
            subtotal: '149.99',
            totalTax: '12.50',
            total: '162.49',
            shippingAddress: {
                address1: '456 Oak Avenue',
                address2: 'Apt 2B',
                city: 'San Diego',
                province: 'CA',
                zip: '92101'
            },
            customAttributes: [],
            metafields: [
                { key: 'date', value: now.toISOString() },
                { key: 'time-slot', value: '2:00 PM - 4:00 PM' }
            ],
            noteAttributes: [],
            fulfillmentOrders: [{ status: 'OPEN' }],
            shippingLines: [{ title: 'Standard Shipping' }]
        },
        {
            id: 'gid://shopify/Order/1003',
            name: '#1003',
            customer: 'Robert Johnson',
            createdAt: yesterday.toISOString(),
            displayFinancialStatus: 'PAID',
            displayFulfillmentStatus: 'UNFULFILLED',
            isDelivery: false,
            sourceName: 'web',
            lineItems: [
                { id: '5', name: 'Pod System Device', quantity: 1 },
                { id: '6', name: 'E-Liquid Mango Ice 30ml', quantity: 3 }
            ],
            taxLines: [
                { title: 'CA Sales Tax', priceSet: { shopMoney: { amount: '6.75' } } }
            ],
            subtotal: '74.99',
            totalTax: '6.75',
            total: '81.74',
            shippingAddress: null,
            customAttributes: [
                { key: 'Pickup-Location-Company', value: 'VSU Kearny Mesa' }
            ],
            metafields: [],
            noteAttributes: [],
            fulfillmentOrders: [{ status: 'OPEN' }],
            shippingLines: [{ title: 'Local Pickup - VSU Kearny Mesa' }]
        },
        {
            id: 'gid://shopify/Order/1004',
            name: '#1004',
            customer: 'Maria Garcia',
            createdAt: twoDaysAgo.toISOString(),
            displayFinancialStatus: 'PAID',
            displayFulfillmentStatus: 'UNFULFILLED',
            isDelivery: true,
            sourceName: 'web',
            lineItems: [
                { id: '7', name: 'Disposable Vape 3-pack', quantity: 2 },
                { id: '8', name: 'Charging Cable', quantity: 1 }
            ],
            taxLines: [
                { title: 'CA Sales Tax', priceSet: { shopMoney: { amount: '5.50' } } }
            ],
            subtotal: '64.99',
            totalTax: '5.50',
            total: '70.49',
            shippingAddress: {
                address1: '789 Pine Street',
                address2: '',
                city: 'Chula Vista',
                province: 'CA',
                zip: '91910'
            },
            customAttributes: [],
            metafields: [
                { key: 'date', value: now.toISOString() },
                { key: 'time-slot', value: '10:00 AM - 12:00 PM' }
            ],
            noteAttributes: [],
            fulfillmentOrders: [{ status: 'OPEN' }],
            shippingLines: [{ title: 'Express Shipping' }]
        },
        {
            id: 'gid://shopify/Order/1005',
            name: '#1005',
            customer: 'Michael Chen',
            createdAt: twoDaysAgo.toISOString(),
            displayFinancialStatus: 'PENDING',
            displayFulfillmentStatus: 'UNFULFILLED',
            isDelivery: false,
            sourceName: 'shopify_draft_order',
            lineItems: [
                { id: '9', name: 'Coil Building Kit', quantity: 1 },
                { id: '10', name: 'Organic Cotton', quantity: 1 }
            ],
            taxLines: [
                { title: 'CA Sales Tax', priceSet: { shopMoney: { amount: '4.25' } } }
            ],
            subtotal: '49.99',
            totalTax: '4.25',
            total: '54.24',
            shippingAddress: null,
            customAttributes: [
                { key: 'Pickup-Location-Company', value: 'VSU Morena' }
            ],
            metafields: [],
            noteAttributes: [],
            fulfillmentOrders: [{ status: 'OPEN' }],
            shippingLines: [{ title: 'Local Pickup - VSU Morena' }]
        },
        {
            id: 'gid://shopify/Order/1006',
            name: '#1006',
            customer: 'Sarah Williams',
            createdAt: now.toISOString(),
            displayFinancialStatus: 'PAID',
            displayFulfillmentStatus: 'UNFULFILLED',
            isDelivery: true,
            sourceName: 'web',
            lineItems: [
                { id: '11', name: 'Battery Pack 18650 (2-pack)', quantity: 1 },
                { id: '12', name: 'E-Liquid Tobacco Gold 60ml', quantity: 1 }
            ],
            taxLines: [
                { title: 'CA Sales Tax', priceSet: { shopMoney: { amount: '7.00' } } }
            ],
            subtotal: '84.99',
            totalTax: '7.00',
            total: '91.99',
            shippingAddress: {
                address1: '321 Elm Drive',
                address2: 'Unit 5',
                city: 'La Jolla',
                province: 'CA',
                zip: '92037'
            },
            customAttributes: [],
            metafields: [
                { key: 'date', value: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() },
                { key: 'time-slot', value: '4:00 PM - 6:00 PM' }
            ],
            noteAttributes: [],
            fulfillmentOrders: [{ status: 'OPEN' }],
            shippingLines: [{ title: 'Standard Shipping' }]
        }
    ];
}

// UI Rendering Functions
function renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    const tableContainer = document.getElementById('ordersTableContainer');
    const emptyState = document.getElementById('emptyState');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (abundanceState.orders.length === 0) {
        tableContainer.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }

    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';

    abundanceState.orders.forEach(order => {
        const row = createOrderRow(order);
        tbody.appendChild(row);
    });

    updateSelectedCount();
}

function createOrderRow(order) {
    const row = document.createElement('tr');
    const orderId = order.id.replace('gid://shopify/Order/', '');
    const isSelected = abundanceState.selectedOrders.some(o => o.id === order.id);

    row.innerHTML = `
        <td>
            <input type="checkbox"
                   class="order-checkbox"
                   data-order-id="${order.id}"
                   ${isSelected ? 'checked' : ''}
                   onchange="toggleOrderSelection('${order.id}')">
        </td>
        <td>
            <a href="https://admin.shopify.com/store/${ABUNDANCE_CONFIG.shopifyUrl}/orders/${orderId}"
               target="_blank"
               class="order-link">
                ${order.name}
            </a>
            <div class="order-date">${formatDate(order.createdAt)}</div>
            <div class="order-id-small">ID: ${orderId}</div>
        </td>
        <td>
            <div class="customer-name">${order.customer || 'GUEST'}</div>
        </td>
        <td>
            <div class="line-items-list">
                ${order.lineItems.map(item => `
                    <div class="line-item">${item.quantity} x ${item.name}</div>
                `).join('')}
            </div>
        </td>
        <td>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <span class="order-status-badge ${getOrderStatusClass(order)}">
                    ${getOrderDisplayStatus(order)}
                </span>
                <span class="order-status-badge ${order.displayFinancialStatus === 'PAID' ? 'paid' : 'unpaid'}">
                    ${order.displayFinancialStatus}
                </span>
            </div>
        </td>
        <td>
            <div class="order-type-badge ${order.isDelivery ? 'shipping' : 'pickup'}">
                <i class="fas fa-${order.isDelivery ? 'truck' : 'store'}"></i>
                ${order.isDelivery ? 'Shipping' : 'Pickup'}
            </div>
            ${renderShippingInfo(order)}
        </td>
        <td>
            <div class="tax-info">
                ${order.taxLines.map(tax => `
                    <div class="tax-line">
                        <span class="tax-title">${tax.title}:</span>
                        <span class="tax-amount">${formatCurrency(tax.priceSet.shopMoney.amount)}</span>
                    </div>
                `).join('')}
            </div>
        </td>
        <td>
            <div class="order-total">
                <div class="order-total-main">${formatCurrency(order.total)}</div>
                <div class="order-total-detail">Subtotal: ${formatCurrency(order.subtotal)}</div>
                <div class="order-total-detail">Taxes: ${formatCurrency(order.totalTax)}</div>
            </div>
        </td>
        <td>
            <div class="order-actions">
                <button class="order-action-btn print" onclick="printSingleOrder('${order.id}')">
                    <i class="fas fa-print"></i>
                    Print
                </button>
                <button class="order-action-btn view" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i>
                    Show
                </button>
            </div>
        </td>
    `;

    return row;
}

function renderShippingInfo(order) {
    if (order.isDelivery && order.shippingAddress) {
        return `
            <div class="shipping-address">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <rect x="3" y="7" width="18" height="13" rx="2" fill="#f97316"/>
                    <rect x="7" y="3" width="10" height="4" rx="1" fill="#ff8111"/>
                    <rect x="7" y="11" width="2" height="2" rx="0.5" fill="#fff"/>
                    <rect x="11" y="11" width="2" height="2" rx="0.5" fill="#fff"/>
                    <rect x="15" y="11" width="2" height="2" rx="0.5" fill="#fff"/>
                    <rect x="7" y="15" width="2" height="2" rx="0.5" fill="#fff"/>
                    <rect x="11" y="15" width="2" height="2" rx="0.5" fill="#fff"/>
                    <rect x="15" y="15" width="2" height="2" rx="0.5" fill="#fff"/>
                </svg>
                <span class="address-text">
                    To: ${order.shippingAddress.address1} ${order.shippingAddress.address2 || ''}, ${order.shippingAddress.city}
                </span>
            </div>
            ${renderMetafields(order)}
        `;
    } else {
        const pickupLocation = getPickupLocation(order);
        return `
            <div class="shipping-address">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <rect x="3" y="7" width="18" height="13" rx="2" fill="#3b82f6"/>
                    <rect x="7" y="3" width="10" height="4" rx="1" fill="#60a5fa"/>
                    <rect x="7" y="11" width="2" height="2" rx="0.5" fill="#fff"/>
                    <rect x="11" y="11" width="2" height="2" rx="0.5" fill="#fff"/>
                    <rect x="15" y="11" width="2" height="2" rx="0.5" fill="#fff"/>
                    <rect x="7" y="15" width="2" height="2" rx="0.5" fill="#fff"/>
                    <rect x="11" y="15" width="2" height="2" rx="0.5" fill="#fff"/>
                    <rect x="15" y="15" width="2" height="2" rx="0.5" fill="#fff"/>
                </svg>
                <span class="address-text">${pickupLocation}</span>
            </div>
        `;
    }
}

function renderMetafields(order) {
    if (!order.metafields || order.metafields.length === 0) return '';

    return `
        <div class="order-metafields">
            ${order.metafields.map(field => `
                <div class="metafield-item">
                    <span class="metafield-key">${field.key.replaceAll('-', ' ')}:</span>
                    <span class="metafield-value">
                        ${field.key === 'date' ? formatDate(field.value) : field.value}
                    </span>
                </div>
            `).join('')}
        </div>
    `;
}

// Helper Functions
function getOrderStatusClass(order) {
    if (order.noteAttributes?.some(attr => attr.name === 'Delivered by')) {
        return 'delivered';
    }
    if (order.noteAttributes?.some(attr => attr.name === 'Received in shop by')) {
        return 'ready';
    }
    if (order.noteAttributes?.some(attr => attr.name === 'Fulfillment by')) {
        return 'prepared';
    }
    return 'pending';
}

function getOrderDisplayStatus(order) {
    if (order.noteAttributes?.some(attr => attr.name === 'Delivered by')) {
        return 'Delivered';
    }
    if (order.noteAttributes?.some(attr => attr.name === 'Received in shop by')) {
        return 'Ready for Pickup';
    }
    if (order.noteAttributes?.some(attr => attr.name === 'Fulfillment by')) {
        return 'Prepared';
    }
    if (order.fulfillmentOrders?.[0]?.status === 'OPEN') {
        return 'Pending';
    }
    return order.displayFulfillmentStatus || 'Pending';
}

function getPickupLocation(order) {
    const pickupAttr = order.customAttributes?.find(attr => attr.key === 'Pickup-Location-Company');
    if (pickupAttr) return pickupAttr.value;

    if (order.shippingLines && order.shippingLines.length > 0) {
        return order.shippingLines[0].title;
    }

    return 'Pickup';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

function formatCurrency(amount) {
    return Number(amount).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    });
}

// Filter Functions
function filterOrders(filterType) {
    abundanceState.currentFilter = filterType;

    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filterType}"]`)?.classList.add('active');

    // Reload orders with filter
    loadOrders();
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();

    const filteredOrders = abundanceState.orders.filter(order => {
        return (
            order.name.toLowerCase().includes(searchTerm) ||
            order.customer?.toLowerCase().includes(searchTerm) ||
            order.id.includes(searchTerm)
        );
    });

    // Temporarily update state and render
    const originalOrders = abundanceState.orders;
    abundanceState.orders = filteredOrders;
    renderOrdersTable();
    abundanceState.orders = originalOrders;
}

// Selection Functions
function toggleOrderSelection(orderId) {
    const order = abundanceState.orders.find(o => o.id === orderId);
    if (!order) return;

    const index = abundanceState.selectedOrders.findIndex(o => o.id === orderId);

    if (index > -1) {
        abundanceState.selectedOrders.splice(index, 1);
    } else {
        abundanceState.selectedOrders.push(order);
    }

    updateSelectedCount();
}

function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');

    if (selectAllCheckbox.checked) {
        abundanceState.selectedOrders = [...abundanceState.orders];
    } else {
        abundanceState.selectedOrders = [];
    }

    // Update all checkboxes
    document.querySelectorAll('.order-checkbox').forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });

    updateSelectedCount();
}

function updateSelectedCount() {
    const count = abundanceState.selectedOrders.length;
    const selectedCountEl = document.getElementById('selectedCount');
    const selectedNumEl = document.getElementById('selectedNum');
    const printBtn = document.getElementById('printSelectedBtn');

    if (count > 0) {
        selectedCountEl.style.display = 'inline';
        printBtn.style.display = 'inline-flex';
        selectedNumEl.textContent = count;
    } else {
        selectedCountEl.style.display = 'none';
        printBtn.style.display = 'none';
    }
}

// Mark As Functions
function showMarkAsSection(type) {
    abundanceState.currentMarkAsType = type;

    const modal = document.getElementById('markAsModal');
    const title = document.getElementById('markAsTitle');
    const submitText = document.getElementById('markAsSubmitText');

    let titleText = '';
    let submitTextContent = '';

    switch(type) {
        case 'shipping':
            titleText = 'Mark as Prepared';
            submitTextContent = 'Mark as Prepared';
            break;
        case 'pickup':
            titleText = 'Mark Ready for Pickup';
            submitTextContent = 'Mark Ready for Pickup';
            break;
        case 'delivered':
            titleText = 'Mark Delivered';
            submitTextContent = 'Mark Delivered';
            break;
    }

    title.textContent = titleText;
    submitText.textContent = submitTextContent;

    // Clear form
    document.getElementById('markAsOrderInput').value = '';
    document.getElementById('markAsMessage').style.display = 'none';

    // Show modal
    modal.classList.add('active');
}

function closeMarkAsModal() {
    const modal = document.getElementById('markAsModal');
    modal.classList.remove('active');

    // Stop scanner if active
    if (abundanceState.videoStream) {
        stopBarcodeScanner();
    }
}

async function submitMarkAs() {
    const orderInput = document.getElementById('markAsOrderInput').value.trim();
    const messageEl = document.getElementById('markAsMessage');
    const submitBtn = document.getElementById('markAsSubmitBtn');

    if (!orderInput) {
        showMessage('Please enter an order ID', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    try {
        let result;
        switch(abundanceState.currentMarkAsType) {
            case 'shipping':
                result = await markOrderAsShipping(orderInput);
                break;
            case 'pickup':
                result = await markOrderAsPickup(orderInput);
                break;
            case 'delivered':
                result = await markOrderAsDeliveredAction(orderInput);
                break;
        }

        if (result.success) {
            showMessage(result.message || 'Order updated successfully!', 'success');
            setTimeout(() => {
                closeMarkAsModal();
                loadOrders(); // Refresh orders
            }, 1500);
        } else {
            showMessage(result.message || 'Failed to update order', 'error');
        }
    } catch (error) {
        console.error('Error marking order:', error);
        showMessage('An error occurred. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fas fa-check"></i> ${document.getElementById('markAsSubmitText').textContent}`;
    }
}

async function markOrderAsShipping(orderId) {
    // Use Next.js backend API via api-client.js
    if (ABUNDANCE_CONFIG.features.useBackendAPI && typeof markOrderAsPrepared === 'function') {
        try {
            console.log(`[Abundance Cloud] Marking order ${orderId} as prepared via backend API`);
            return await markOrderAsPrepared(orderId);
        } catch (error) {
            console.error('Error marking as prepared via backend:', error);
            return { success: false, message: error.message || 'Failed to mark order as prepared' };
        }
    }

    // Fallback to local storage
    return markOrderLocally(orderId, 'shipping');
}

async function markOrderAsPickup(orderId) {
    // Use Next.js backend API via api-client.js
    if (ABUNDANCE_CONFIG.features.useBackendAPI && typeof markOrderAsReadyForPickup === 'function') {
        try {
            console.log(`[Abundance Cloud] Marking order ${orderId} as ready for pickup via backend API`);
            return await markOrderAsReadyForPickup(orderId);
        } catch (error) {
            console.error('Error marking as ready for pickup via backend:', error);
            return { success: false, message: error.message || 'Failed to mark order as ready for pickup' };
        }
    }

    // Fallback to local storage
    return markOrderLocally(orderId, 'pickup');
}

async function markOrderAsDeliveredAction(orderId) {
    // Use Next.js backend API via api-client.js
    if (ABUNDANCE_CONFIG.features.useBackendAPI && typeof markOrderAsDelivered === 'function') {
        try {
            console.log(`[Abundance Cloud] Marking order ${orderId} as delivered via backend API`);
            return await markOrderAsDelivered(orderId);
        } catch (error) {
            console.error('Error marking as delivered via backend:', error);
            return { success: false, message: error.message || 'Failed to mark order as delivered' };
        }
    }

    // Fallback to local storage
    return markOrderLocally(orderId, 'delivered');
}

function markOrderLocally(orderId, markType) {
    const allOrders = JSON.parse(localStorage.getItem('abundanceOrders') || '[]');
    const order = allOrders.find(o => o.id === `gid://shopify/Order/${orderId}` || o.id === orderId);

    if (!order) {
        return {
            success: false,
            message: 'Order not found'
        };
    }

    // Check if already marked
    const alreadyMarked = {
        'shipping': order.noteAttributes?.some(attr => attr.name === 'Fulfillment by'),
        'pickup': order.noteAttributes?.some(attr => attr.name === 'Received in shop by'),
        'delivered': order.noteAttributes?.some(attr => attr.name === 'Delivered by')
    };

    if (alreadyMarked[markType]) {
        return {
            success: false,
            message: `Order already marked as ${markType}`
        };
    }

    // Check payment status for delivery
    if (markType === 'delivered' && order.displayFinancialStatus !== 'PAID') {
        return {
            success: false,
            message: 'Order must be paid before marking as delivered'
        };
    }

    // Add the note attribute
    if (!order.noteAttributes) {
        order.noteAttributes = [];
    }

    const attributeName = {
        'shipping': 'Fulfillment by',
        'pickup': 'Received in shop by',
        'delivered': 'Delivered by'
    }[markType];

    order.noteAttributes.push({
        name: attributeName,
        value: `Staff - ${new Date().toISOString()}`
    });

    // Update order status
    if (markType === 'shipping' || markType === 'pickup') {
        order.displayFulfillmentStatus = 'FULFILLED';
    }

    // Save back to localStorage
    const orderIndex = allOrders.findIndex(o => o.id === order.id);
    if (orderIndex > -1) {
        allOrders[orderIndex] = order;
        saveOrdersToLocal(allOrders);
    }

    const messages = {
        'shipping': 'Order marked as prepared successfully!',
        'pickup': 'Order marked ready for pickup successfully!',
        'delivered': 'Order marked as delivered successfully!'
    };

    return {
        success: true,
        message: messages[markType]
    };
}

function showMessage(message, type) {
    const messageEl = document.getElementById('markAsMessage');
    messageEl.className = `alert ${type}`;
    messageEl.textContent = message;
    messageEl.style.display = 'block';
}

// Barcode Scanner Functions
function toggleBarcodeScanner() {
    const container = document.getElementById('barcodeScannerContainer');
    const btnText = document.getElementById('scannerBtnText');

    if (container.style.display === 'none') {
        startBarcodeScanner();
        container.style.display = 'block';
        btnText.textContent = 'Stop Scanner';
    } else {
        stopBarcodeScanner();
        container.style.display = 'none';
        btnText.textContent = 'Scan with Camera';
    }
}

async function startBarcodeScanner() {
    const video = document.getElementById('barcodeVideo');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });

        video.srcObject = stream;
        video.play();
        abundanceState.videoStream = stream;

        // Use ZXing library to scan barcodes
        if (typeof ZXing !== 'undefined') {
            const codeReader = new ZXing.BrowserBarcodeReader();
            abundanceState.barcodeScanner = codeReader;

            codeReader.decodeFromVideoDevice(null, 'barcodeVideo', (result, err) => {
                if (result) {
                    document.getElementById('markAsOrderInput').value = result.text;
                    stopBarcodeScanner();
                    document.getElementById('barcodeScannerContainer').style.display = 'none';
                    document.getElementById('scannerBtnText').textContent = 'Scan with Camera';
                }
            });
        }
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please check permissions.');
    }
}

function stopBarcodeScanner() {
    if (abundanceState.videoStream) {
        abundanceState.videoStream.getTracks().forEach(track => track.stop());
        abundanceState.videoStream = null;
    }

    if (abundanceState.barcodeScanner) {
        abundanceState.barcodeScanner.reset();
        abundanceState.barcodeScanner = null;
    }
}

// Order Details Functions
function viewOrderDetails(orderId) {
    const order = abundanceState.orders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById('orderDetailsModal');
    const title = document.getElementById('orderDetailsTitle');
    const body = document.getElementById('orderDetailsBody');

    title.textContent = `Order ${order.name} Details`;

    body.innerHTML = `
        <div class="order-detail-section">
            <h3>Order Information</h3>
            <div class="order-detail-grid">
                <div class="order-detail-item">
                    <span class="order-detail-label">Order Number</span>
                    <span class="order-detail-value">${order.name}</span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Date</span>
                    <span class="order-detail-value">${formatDate(order.createdAt)}</span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Customer</span>
                    <span class="order-detail-value">${order.customer || 'Guest'}</span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Payment Status</span>
                    <span class="order-detail-value">${order.displayFinancialStatus}</span>
                </div>
            </div>
        </div>

        <div class="order-detail-section">
            <h3>Items</h3>
            ${order.lineItems.map(item => `
                <div class="order-detail-grid" style="margin-bottom: 12px;">
                    <div class="order-detail-item">
                        <span class="order-detail-label">Product</span>
                        <span class="order-detail-value">${item.name}</span>
                    </div>
                    <div class="order-detail-item">
                        <span class="order-detail-label">Quantity</span>
                        <span class="order-detail-value">${item.quantity}</span>
                    </div>
                </div>
            `).join('')}
        </div>

        ${order.shippingAddress ? `
            <div class="order-detail-section">
                <h3>Shipping Address</h3>
                <div class="order-detail-item">
                    <span class="order-detail-value">
                        ${order.shippingAddress.address1}<br>
                        ${order.shippingAddress.address2 ? order.shippingAddress.address2 + '<br>' : ''}
                        ${order.shippingAddress.city}
                    </span>
                </div>
            </div>
        ` : ''}

        <div class="order-detail-section">
            <h3>Pricing</h3>
            <div class="order-detail-grid">
                <div class="order-detail-item">
                    <span class="order-detail-label">Subtotal</span>
                    <span class="order-detail-value">${formatCurrency(order.subtotal)}</span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Tax</span>
                    <span class="order-detail-value">${formatCurrency(order.totalTax)}</span>
                </div>
                <div class="order-detail-item" style="grid-column: 1 / -1;">
                    <span class="order-detail-label">Total</span>
                    <span class="order-detail-value" style="font-size: 18px; color: var(--success);">
                        ${formatCurrency(order.total)}
                    </span>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function closeOrderDetailsModal() {
    const modal = document.getElementById('orderDetailsModal');
    modal.classList.remove('active');
}

// Print Functions
function printSelected() {
    if (abundanceState.selectedOrders.length === 0) {
        alert('Please select orders to print');
        return;
    }

    // Open print window with selected orders
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatePrintHTML(abundanceState.selectedOrders));
    printWindow.document.close();
    printWindow.print();
}

function printSingleOrder(orderId) {
    const order = abundanceState.orders.find(o => o.id === orderId);
    if (!order) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatePrintHTML([order]));
    printWindow.document.close();
    printWindow.print();
}

function printOrder() {
    // This is called from the order details modal
    closeOrderDetailsModal();
}

function generatePrintHTML(orders) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Orders</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .order { page-break-after: always; margin-bottom: 40px; border: 2px solid #000; padding: 20px; }
                .order:last-child { page-break-after: auto; }
                h1 { margin-top: 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .total { font-weight: bold; font-size: 18px; }
            </style>
        </head>
        <body>
            ${orders.map(order => `
                <div class="order">
                    <h1>Order ${order.name}</h1>
                    <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
                    <p><strong>Customer:</strong> ${order.customer || 'Guest'}</p>

                    ${order.shippingAddress ? `
                        <p><strong>Shipping Address:</strong><br>
                        ${order.shippingAddress.address1}<br>
                        ${order.shippingAddress.address2 ? order.shippingAddress.address2 + '<br>' : ''}
                        ${order.shippingAddress.city}</p>
                    ` : ''}

                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.lineItems.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <p><strong>Subtotal:</strong> ${formatCurrency(order.subtotal)}</p>
                    <p><strong>Tax:</strong> ${formatCurrency(order.totalTax)}</p>
                    <p class="total"><strong>Total:</strong> ${formatCurrency(order.total)}</p>
                </div>
            `).join('')}
        </body>
        </html>
    `;
}

// Utility Functions
function refreshOrders() {
    loadOrders();
}

function showLoading() {
    document.getElementById('loadingOrders').style.display = 'flex';
    document.getElementById('ordersTableContainer').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loadingOrders').style.display = 'none';
}

function showEmptyState() {
    document.getElementById('loadingOrders').style.display = 'none';
    document.getElementById('ordersTableContainer').style.display = 'none';
    document.getElementById('emptyState').style.display = 'flex';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (abundanceState.refreshIntervalId) {
        clearInterval(abundanceState.refreshIntervalId);
    }

    if (abundanceState.videoStream) {
        stopBarcodeScanner();
    }
});

// Thief Report Functions
let thiefPhotoData = null;

function openThiefReportModal() {
    const modal = document.getElementById('thiefReportModal');
    modal.classList.add('active');

    // Reset form
    document.getElementById('thiefReportForm').reset();
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('photoUploadArea').style.display = 'flex';
    document.getElementById('thiefReportMessage').style.display = 'none';
    thiefPhotoData = null;

    // Set today's date as default (use local date to avoid timezone issues)
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    document.getElementById('incidentDate').value = today;
}

function closeThiefReportModal() {
    const modal = document.getElementById('thiefReportModal');
    modal.classList.remove('active');
    thiefPhotoData = null;
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG, JPG, etc.)');
        return;
    }

    // Read and preview the image
    const reader = new FileReader();
    reader.onload = function(e) {
        thiefPhotoData = e.target.result;

        // Show preview
        document.getElementById('photoPreviewImg').src = e.target.result;
        document.getElementById('photoPreview').style.display = 'block';
        document.getElementById('photoUploadArea').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removePhoto() {
    thiefPhotoData = null;
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('photoUploadArea').style.display = 'flex';
    document.getElementById('thiefPhotoInput').value = '';
}

async function submitThiefReport() {
    const form = document.getElementById('thiefReportForm');
    const messageEl = document.getElementById('thiefReportMessage');
    const submitBtn = document.getElementById('submitThiefReportBtn');

    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    if (!thiefPhotoData) {
        messageEl.className = 'alert error';
        messageEl.textContent = 'Please upload a photo of the suspect';
        messageEl.style.display = 'block';
        return;
    }

    // Gather form data
    const reportData = {
        photo: thiefPhotoData,
        storeLocation: document.getElementById('storeLocation').value,
        incidentDate: document.getElementById('incidentDate').value,
        incidentTime: document.getElementById('incidentTime').value,
        identifyingCharacteristics: document.getElementById('identifyingMarks').value,
        additionalNotes: document.getElementById('additionalNotes').value,
        reportedBy: 'Current User', // You can integrate with your auth system
        reportedAt: new Date().toISOString()
    };

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    try {
        // Here you would send the data to your backend
        // For now, we'll save to localStorage
        saveThiefReportLocally(reportData);

        // Show success message
        messageEl.className = 'alert success';
        messageEl.textContent = 'Theft incident reported successfully!';
        messageEl.style.display = 'block';

        // Close modal after 2 seconds
        setTimeout(() => {
            closeThiefReportModal();
        }, 2000);

    } catch (error) {
        console.error('Error submitting thief report:', error);
        messageEl.className = 'alert error';
        messageEl.textContent = 'Failed to submit report. Please try again.';
        messageEl.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Report';
    }
}

function saveThiefReportLocally(reportData) {
    // Get existing reports from localStorage
    const existingReports = JSON.parse(localStorage.getItem('thiefReports') || '[]');

    // Add new report with unique ID
    const newReport = {
        id: Date.now().toString(),
        ...reportData
    };

    existingReports.push(newReport);

    // Save back to localStorage
    localStorage.setItem('thiefReports', JSON.stringify(existingReports));

    console.log('Thief report saved:', newReport);
}

// Alternative: Send to backend API
async function sendThiefReportToBackend(reportData) {
    const token = abundanceState.authToken || await getAuthToken();

    const response = await fetch(`${ABUNDANCE_CONFIG.apiUri}report-theft`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportData)
    });

    if (!response.ok) {
        throw new Error('Failed to submit report');
    }

    return await response.json();
}
