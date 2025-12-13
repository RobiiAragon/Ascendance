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

// Fetch Sales Analytics (LEGACY - uses backend API)
async function fetchSalesAnalyticsBackend() {
    return await fetchAPI('/api/analytics/sales');
}

// Fetch Products Analytics (LEGACY - uses backend API)
async function fetchProductsAnalyticsBackend() {
    return await fetchAPI('/api/analytics/products');
}

// Fetch Customers Analytics (LEGACY - uses backend API)
async function fetchCustomersAnalyticsBackend() {
    return await fetchAPI('/api/analytics/customers');
}

// NOTE: The main fetchSalesAnalytics() function is now defined in shopify-analytics.js
// and connects directly to Shopify's API (frontend implementation)

// Render Analytics Page with Real Data
async function renderAnalyticsWithData(period = 'month') {
    const dashboard = document.querySelector('.dashboard');

    // Show loading state
    dashboard.innerHTML = `
        <div class="page-header">
            <div class="page-header-left">
                <h2 class="section-title">Sales & Analytics</h2>
                <p class="section-subtitle">Loading data from Shopify...</p>
            </div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; min-height: 300px;">
            <div style="text-align: center;">
                <div style="width: 48px; height: 48px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
                <p style="color: var(--text-muted);" id="analytics-loading-text">Fetching analytics data...</p>
                <div style="background: var(--bg-tertiary); border-radius: 10px; height: 30px; width: 300px; margin: 20px auto; overflow: hidden;">
                    <div id="analytics-progress-bar" style="background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); height: 100%; width: 0%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.9em;"></div>
                </div>
            </div>
        </div>
    `;

    try {
        // Use the new frontend Shopify API
        const salesData = await fetchSalesAnalytics(period, (progress, text) => {
            const progressBar = document.getElementById('analytics-progress-bar');
            const loadingText = document.getElementById('analytics-loading-text');
            if (progressBar) {
                progressBar.style.width = progress + '%';
                progressBar.textContent = progress + '%';
            }
            if (loadingText) {
                loadingText.textContent = text;
            }
        });

        // Calculate average order value
        const avgOrderValue = salesData.summary.avgOrderValue;

        // Generate daily chart bars (max height based on highest day)
        const dailyDataArray = Object.entries(salesData.daily).map(([date, data]) => ({
            date,
            sales: data.sales,
            orders: data.orders,
            tax: data.tax
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        const maxSales = Math.max(...dailyDataArray.map(d => d.sales), 1);
        const chartBars = dailyDataArray.map((day, index) => {
            const height = (day.sales / maxSales) * 100;
            const isLast = index === dailyDataArray.length - 1;
            const formattedDate = new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return `<div class="chart-bar ${isLast ? 'active' : ''}" style="height: ${height}%;" title="${formattedDate}: ${formatCurrency(day.sales)}"></div>`;
        }).join('');

        // Render the analytics page
        dashboard.innerHTML = `
            <div class="page-header">
                <div class="page-header-left">
                    <h2 class="section-title">Sales & Analytics</h2>
                    <p class="section-subtitle">Live data from Shopify</p>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <select id="period-select" onchange="renderAnalyticsWithData(this.value)" class="btn-secondary" style="padding: 10px 16px; font-family: 'Outfit', sans-serif; font-weight: 500;">
                        <option value="today" ${period === 'today' ? 'selected' : ''}>Today</option>
                        <option value="week" ${period === 'week' ? 'selected' : ''}>This Week</option>
                        <option value="month" ${period === 'month' ? 'selected' : ''}>This Month</option>
                        <option value="year" ${period === 'year' ? 'selected' : ''}>This Year</option>
                    </select>
                    <button class="btn-secondary" onclick="renderAnalyticsWithData('${period}')">
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

            </div>

            <!-- Sales Chart -->
            <div class="card" style="margin-top: 24px;">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 class="card-title"><i class="fas fa-chart-line"></i> Sales Chart</h3>
                    <select id="chartTypeSelect" onchange="updateChartView()" class="btn-secondary" style="padding: 8px 16px; font-family: 'Outfit', sans-serif; font-weight: 500;">
                        <option value="daily">By Day</option>
                        <option value="hourly">By Hour</option>
                    </select>
                </div>
                <div class="card-body">
                    <div style="height: 300px; position: relative;">
                        <canvas id="salesChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Daily Breakdown -->
            <div class="analytics-stores">
                <h3 class="section-subtitle-alt">Daily Sales Breakdown</h3>
                <div class="store-bars">
                    ${dailyDataArray.slice(-10).map(day => {
                        const formattedDate = new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        return `
                        <div class="store-bar-item" style="margin-bottom: 12px;">
                            <div class="store-bar-label" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-weight: 500;">${formattedDate}</span>
                                    <span style="font-size: 12px; color: var(--text-muted);">${day.orders} orders • Tax: ${formatCurrency(day.tax)}</span>
                                </div>
                                <span style="font-weight: 600;">${formatCurrency(day.sales)}</span>
                            </div>
                            <div class="store-bar-track">
                                <div class="store-bar-fill miramar" style="width: ${(day.sales / maxSales) * 100}%;"></div>
                            </div>
                        </div>
                    `}).join('')}
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
                                    <th style="text-align: left; padding: 12px 8px; color: var(--text-muted); font-weight: 500;">Customer</th>
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
                                        <td style="padding: 12px 8px; color: var(--text-secondary);">${order.customer}</td>
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

            <div class="shopify-connect" style="background: linear-gradient(135deg, var(--success), #2ecc71); margin-top: 24px;">
                <div class="shopify-icon"><i class="fab fa-shopify"></i></div>
                <div class="shopify-text">
                    <h4 style="color: white;">Connected to Shopify</h4>
                    <p style="color: rgba(255,255,255,0.8);">Showing live data from your store (${salesData.summary.totalOrders} orders loaded)</p>
                </div>
                <button class="btn-primary" onclick="renderAnalyticsWithData('${period}')" style="background: white; color: var(--success);">
                    <i class="fas fa-sync-alt"></i> Refresh Data
                </button>
            </div>
        `;

        // Store chart data globally for switching between views
        window.analyticsChartData = {
            daily: salesData.daily,
            hourly: salesData.hourly
        };

        // Initialize the chart with daily view
        displaySalesChart('daily');

    } catch (error) {
        console.error('Failed to load analytics:', error);

        // Show error state
        dashboard.innerHTML = `
            <div class="page-header">
                <div class="page-header-left">
                    <h2 class="section-title">Sales & Analytics</h2>
                    <p class="section-subtitle">Unable to load data</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body" style="text-align: center; padding: 48px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--warning); margin-bottom: 16px;"></i>
                    <h3 style="margin-bottom: 8px;">Failed to Load Analytics</h3>
                    <p style="color: var(--text-muted); margin-bottom: 24px;">${error.message}</p>
                    <p style="color: var(--text-muted); margin-bottom: 24px; font-size: 13px;">
                        Check the console for more details. Make sure the Shopify API credentials are correct.
                    </p>
                    <button class="btn-primary" onclick="renderAnalyticsWithData('month')">
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

// =============================================================================
// Sales Chart Functions
// =============================================================================

let salesChart = null;

function displaySalesChart(type) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    let labels, data, labelText;

    if (type === 'hourly') {
        // Generate 24 hour labels
        labels = Array.from({length: 24}, (_, i) => {
            const hour = i;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour} ${ampm}`;
        });

        // Map hourly data
        data = Array.from({length: 24}, (_, i) => {
            return window.analyticsChartData.hourly[i] ? window.analyticsChartData.hourly[i].sales : 0;
        });

        labelText = 'Sales by Hour ($)';
    } else {
        // Daily view
        const dailyData = window.analyticsChartData.daily;
        const sortedDates = Object.keys(dailyData).sort();
        labels = sortedDates.map(date => {
            return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        data = sortedDates.map(date => dailyData[date].sales);
        labelText = 'Sales by Day ($)';
    }

    // Destroy existing chart if it exists
    if (salesChart) {
        salesChart.destroy();
    }

    // Create new chart
    salesChart = new Chart(ctx, {
        type: type === 'hourly' ? 'bar' : 'line',
        data: {
            labels: labels,
            datasets: [{
                label: labelText,
                data: data,
                borderColor: 'rgb(102, 126, 234)',
                backgroundColor: type === 'hourly' ? 'rgba(102, 126, 234, 0.7)' : 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 2,
                pointRadius: type === 'hourly' ? 0 : 6,
                pointHoverRadius: type === 'hourly' ? 0 : 8,
                pointBackgroundColor: 'rgb(102, 126, 234)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            family: "'Outfit', sans-serif",
                            size: 12
                        },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        family: "'Outfit', sans-serif",
                        size: 13
                    },
                    bodyFont: {
                        family: "'Outfit', sans-serif",
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            family: "'Outfit', sans-serif",
                            size: 11
                        },
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Outfit', sans-serif",
                            size: 11
                        },
                        maxRotation: type === 'hourly' ? 45 : 0,
                        minRotation: type === 'hourly' ? 45 : 0
                    }
                }
            }
        }
    });
}

function updateChartView() {
    const chartType = document.getElementById('chartTypeSelect').value;
    displaySalesChart(chartType);
}

console.log('API Client loaded - use renderAnalyticsWithData() to fetch live Shopify data');
console.log('Abundance Cloud API available: fetchOrdersFromAPI(), markOrderAsPrepared(), markOrderAsReadyForPickup(), markOrderAsDelivered()');
