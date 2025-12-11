/**
 * Ascendance Hub - API Client
 * Connects to the Next.js backend for Shopify data
 */

// API Configuration
const API_CONFIG = {
    baseUrl: 'http://localhost:3000',
    internalKey: 'abundance1189'
};

// API Helper Function for GET requests
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-key': API_CONFIG.internalKey
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// API Helper Function for POST requests
async function postAPI(endpoint, data) {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-key': API_CONFIG.internalKey
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// Format currency helper
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(parseFloat(amount));
}

// Format date helper
function formatDateTime(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Fetch Sales Analytics
async function fetchSalesAnalytics() {
    return await fetchAPI('/api/analytics/sales');
}

// Fetch Products Analytics
async function fetchProductsAnalytics() {
    return await fetchAPI('/api/analytics/products');
}

// Fetch Customers Analytics
async function fetchCustomersAnalytics() {
    return await fetchAPI('/api/analytics/customers');
}

// Render Analytics Page with Real Data
async function renderAnalyticsWithData() {
    const dashboard = document.querySelector('.dashboard');

    // Show loading state
    dashboard.innerHTML = `
        <div class="page-header">
            <div class="page-header-left">
                <h2 class="section-title">Sales Analytics</h2>
                <p class="section-subtitle">Loading data from Shopify...</p>
            </div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; min-height: 300px;">
            <div style="text-align: center;">
                <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: var(--accent-primary); margin-bottom: 16px;"></i>
                <p style="color: var(--text-muted);">Fetching analytics data...</p>
            </div>
        </div>
    `;

    try {
        // Fetch all data in parallel
        const [salesData, customersData, productsData] = await Promise.all([
            fetchSalesAnalytics(),
            fetchCustomersAnalytics(),
            fetchProductsAnalytics()
        ]);

        // Calculate average order value
        const avgOrderValue = salesData.summary.totalOrders > 0
            ? (parseFloat(salesData.summary.totalSales) / salesData.summary.totalOrders).toFixed(2)
            : '0.00';

        // Generate monthly chart bars (max height based on highest month)
        const maxSales = Math.max(...salesData.byMonth.map(m => parseFloat(m.totalSales)), 1);
        const chartBars = salesData.byMonth.map((month, index) => {
            const height = (parseFloat(month.totalSales) / maxSales) * 100;
            const isLast = index === salesData.byMonth.length - 1;
            return `<div class="chart-bar ${isLast ? 'active' : ''}" style="height: ${height}%;" title="${month.month}: ${formatCurrency(month.totalSales)}"></div>`;
        }).join('');

        // Render the analytics page
        dashboard.innerHTML = `
            <div class="page-header">
                <div class="page-header-left">
                    <h2 class="section-title">Sales Analytics</h2>
                    <p class="section-subtitle">Live data from Shopify (${salesData.summary.period})</p>
                </div>
                <div class="date-range-picker">
                    <button class="date-btn" onclick="renderAnalyticsWithData()">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            </div>

            <div class="analytics-grid">
                <div class="analytics-card revenue">
                    <div class="analytics-card-header">
                        <h3>Total Sales</h3>
                        <span class="trend up"><i class="fas fa-check-circle"></i> Live</span>
                    </div>
                    <div class="analytics-value">${formatCurrency(salesData.summary.totalSales)}</div>
                    <div class="analytics-comparison">
                        <span>Net Sales: ${formatCurrency(salesData.summary.netSales || (parseFloat(salesData.summary.totalSales) - parseFloat(salesData.summary.totalTax)))}</span>
                    </div>
                    <div class="analytics-chart">
                        ${chartBars || '<div class="chart-bar active" style="height: 100%;"></div>'}
                    </div>
                </div>

                <div class="analytics-card orders">
                    <div class="analytics-card-header">
                        <h3>Total Orders</h3>
                        <span class="trend up"><i class="fas fa-check-circle"></i> Live</span>
                    </div>
                    <div class="analytics-value">${salesData.summary.totalOrders}</div>
                    <div class="analytics-breakdown">
                        <div class="breakdown-item">
                            <span class="breakdown-label">Tax Collected</span>
                            <span class="breakdown-value">${formatCurrency(salesData.summary.totalTax)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Currency</span>
                            <span class="breakdown-value">${salesData.summary.currency}</span>
                        </div>
                    </div>
                </div>

                <div class="analytics-card aov">
                    <div class="analytics-card-header">
                        <h3>Avg. Order Value</h3>
                        <span class="trend up"><i class="fas fa-calculator"></i></span>
                    </div>
                    <div class="analytics-value">${formatCurrency(avgOrderValue)}</div>
                    <div class="analytics-comparison">
                        <span>Based on ${salesData.summary.totalOrders} orders</span>
                    </div>
                </div>

                <div class="analytics-card customers">
                    <div class="analytics-card-header">
                        <h3>Customers</h3>
                        <span class="trend up"><i class="fas fa-check-circle"></i> Live</span>
                    </div>
                    <div class="analytics-value">${customersData.summary.totalCustomers}</div>
                    <div class="analytics-comparison">
                        <span>New: ${customersData.summary.newCustomers} | Returning: ${customersData.summary.returningCustomers}</span>
                    </div>
                </div>
            </div>

            <!-- Monthly Breakdown -->
            <div class="analytics-stores">
                <h3 class="section-subtitle-alt">Monthly Sales Breakdown</h3>
                <div class="store-bars">
                    ${salesData.byMonth.map(month => `
                        <div class="store-bar-item">
                            <div class="store-bar-label">
                                <span>${month.month}</span>
                                <span>${formatCurrency(month.totalSales)}</span>
                            </div>
                            <div class="store-bar-track">
                                <div class="store-bar-fill miramar" style="width: ${(parseFloat(month.totalSales) / maxSales) * 100}%;"></div>
                            </div>
                            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                                ${month.orders} orders | Tax: ${formatCurrency(month.tax)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Recent Orders -->
            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-shopping-cart"></i> Recent Orders</h3>
                </div>
                <div class="card-body">
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <th style="text-align: left; padding: 12px 8px; color: var(--text-muted); font-weight: 500;">Order</th>
                                    <th style="text-align: left; padding: 12px 8px; color: var(--text-muted); font-weight: 500;">Date</th>
                                    <th style="text-align: left; padding: 12px 8px; color: var(--text-muted); font-weight: 500;">Status</th>
                                    <th style="text-align: left; padding: 12px 8px; color: var(--text-muted); font-weight: 500;">Fulfillment</th>
                                    <th style="text-align: right; padding: 12px 8px; color: var(--text-muted); font-weight: 500;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${salesData.recentOrders.map(order => `
                                    <tr style="border-bottom: 1px solid var(--border-color);">
                                        <td style="padding: 12px 8px; font-weight: 500;">${order.name}</td>
                                        <td style="padding: 12px 8px; color: var(--text-secondary);">${formatDateTime(order.createdAt)}</td>
                                        <td style="padding: 12px 8px;">
                                            <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${order.status === 'PAID' ? 'var(--success)' : 'var(--warning)'}; color: white;">
                                                ${order.status}
                                            </span>
                                        </td>
                                        <td style="padding: 12px 8px;">
                                            <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${order.fulfillment === 'FULFILLED' ? 'var(--success)' : 'var(--accent-primary)'}; color: white;">
                                                ${order.fulfillment}
                                            </span>
                                        </td>
                                        <td style="padding: 12px 8px; text-align: right; font-weight: 600; color: var(--success);">${formatCurrency(order.total)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Top Customers -->
            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-users"></i> Top Customers by Spending</h3>
                </div>
                <div class="card-body">
                    <div style="display: grid; gap: 12px;">
                        ${customersData.topCustomers.slice(0, 5).map((customer, index) => `
                            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-tertiary); border-radius: 8px;">
                                <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--accent-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                                    ${index + 1}
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 500;">${customer.name}</div>
                                    <div style="font-size: 12px; color: var(--text-muted);">${customer.email || 'No email'} • ${customer.orders} orders</div>
                                </div>
                                <div style="font-weight: 600; color: var(--success);">${formatCurrency(customer.totalSpent)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="shopify-connect" style="background: linear-gradient(135deg, var(--success), #2ecc71); margin-top: 24px;">
                <div class="shopify-icon"><i class="fab fa-shopify"></i></div>
                <div class="shopify-text">
                    <h4 style="color: white;">Connected to Shopify</h4>
                    <p style="color: rgba(255,255,255,0.8);">Showing live data from your store</p>
                </div>
                <button class="btn-primary" onclick="renderAnalyticsWithData()" style="background: white; color: var(--success);">
                    <i class="fas fa-sync-alt"></i> Refresh Data
                </button>
            </div>
        `;

    } catch (error) {
        console.error('Failed to load analytics:', error);

        // Show error state
        dashboard.innerHTML = `
            <div class="page-header">
                <div class="page-header-left">
                    <h2 class="section-title">Sales Analytics</h2>
                    <p class="section-subtitle">Unable to load data</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body" style="text-align: center; padding: 48px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--warning); margin-bottom: 16px;"></i>
                    <h3 style="margin-bottom: 8px;">Failed to Load Analytics</h3>
                    <p style="color: var(--text-muted); margin-bottom: 24px;">${error.message}</p>
                    <p style="color: var(--text-muted); margin-bottom: 24px; font-size: 13px;">
                        Make sure the Next.js backend is running on <code>http://localhost:3000</code>
                    </p>
                    <button class="btn-primary" onclick="renderAnalyticsWithData()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            </div>
        `;
    }
}

// =============================================================================
// Abundance Cloud API Functions
// =============================================================================

// Fetch Orders from Shopify via backend
async function fetchOrdersFromAPI(filterType = 'all', cursor = null) {
    let endpoint = `/api/orders?type=${filterType}`;
    if (cursor) {
        endpoint += `&cursor=${cursor}`;
    }
    return await fetchAPI(endpoint);
}

// Mark order as prepared (shipping)
async function markOrderAsPrepared(orderId, preparedBy = null) {
    return await postAPI('/api/orders/mark-prepared', {
        orderId,
        preparedBy: preparedBy || getCurrentUserName()
    });
}

// Mark order as ready for pickup
async function markOrderAsReadyForPickup(orderId, receivedBy = null) {
    return await postAPI('/api/orders/mark-pickup', {
        orderId,
        receivedBy: receivedBy || getCurrentUserName()
    });
}

// Mark order as delivered
async function markOrderAsDelivered(orderId, deliveredBy = null, skipPaymentCheck = false) {
    return await postAPI('/api/orders/mark-delivered', {
        orderId,
        deliveredBy: deliveredBy || getCurrentUserName(),
        skipPaymentCheck
    });
}

// Helper to get current user name
function getCurrentUserName() {
    try {
        if (typeof authManager !== 'undefined' && authManager.getCurrentUser) {
            const user = authManager.getCurrentUser();
            return user?.displayName || user?.email || 'Staff';
        }
    } catch (e) {
        console.warn('Could not get current user name:', e);
    }
    return 'Staff';
}

console.log('API Client loaded - use renderAnalyticsWithData() to fetch live Shopify data');
console.log('Abundance Cloud API available: fetchOrdersFromAPI(), markOrderAsPrepared(), markOrderAsReadyForPickup(), markOrderAsDelivered()');
