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

// Analytics request tracking - used to cancel/ignore stale requests
let analyticsRequestId = 0;
let currentAnalyticsPage = false;

// Cancel any pending analytics request by incrementing the request ID
function cancelAnalyticsRequest() {
    analyticsRequestId++;
}

// Run analytics query - called when user clicks "Run Query" button
function runAnalyticsQuery() {
    const periodSelect = document.getElementById('period-select');
    const period = periodSelect ? periodSelect.value : 'month';

    // Validate custom range if selected
    if (period === 'custom') {
        const { startDate, endDate } = window.analyticsCustomRange || {};
        if (!startDate || !endDate) {
            showToast('Please select a custom date range first', 'error');
            toggleAnalyticsCalendarPopup();
            return;
        }
    }

    console.log(`[Analytics] Running query - Store: ${selectedStore}, Period: ${period}`);
    renderAnalyticsWithData(period, selectedStore, selectedLocation);
}

// Check if we're still on the analytics page
function isOnAnalyticsPage() {
    const dashboard = document.querySelector('.dashboard');
    if (!dashboard) return false;
    // Check if the page still has analytics content or loading indicator
    return dashboard.querySelector('.section-title')?.textContent?.includes('Sales') ||
           dashboard.querySelector('#analytics-content') !== null ||
           dashboard.querySelector('#store-selector-container') !== null;
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

// Global state for selected store and location
let selectedStore = 'vsu';
let selectedLocation = null;
let vsuLocations = [];

// Pagination state for Recent Orders
let analyticsOrdersPage = 1;
const ORDERS_PER_PAGE = 15;
let currentSalesData = null; // Store sales data for re-rendering orders table

// Initialize VSU locations on page load
async function initializeVSULocations() {
    if (vsuLocations.length === 0) {
        try {
            vsuLocations = await fetchStoreLocations('vsu');
        } catch (error) {
            console.error('Failed to load VSU locations:', error);
        }
    }
}

// Helper function to render store selector (persistent component)
function renderStoreSelector() {
    // Location dropdown embedded inside VSU button
    const locationDropdownHTML = vsuLocations.length > 0 ? `
        <div class="vsu-location-dropdown" id="vsu-location-dropdown" onclick="event.stopPropagation();">
            <select id="location-select" onchange="event.stopPropagation(); handleLocationChange(this.value)" style="
                width: 100%;
                padding: 4px 8px;
                font-family: 'Outfit', sans-serif;
                font-size: 12px;
                font-weight: 500;
                color: inherit;
                cursor: pointer;
            ">
                <option value="">All Locations</option>
                ${vsuLocations.map(loc => `
                    <option value="${loc.id}" ${selectedLocation == loc.id ? 'selected' : ''}>
                        ${loc.name}
                    </option>
                `).join('')}
            </select>
        </div>
    ` : '';

    return `
        <div class="store-selector-container" id="store-selector-container">
            <div class="store-toggle-buttons">
                <div class="store-toggle-btn ${selectedStore === 'vsu' ? 'active' : ''}" id="store-btn-vsu" onclick="handleStoreChange('vsu')">
                    <div class="store-toggle-main">
                        <i class="fas fa-store store-toggle-icon"></i>
                        <div class="store-toggle-name">
                            <div class="store-toggle-name-line">Vape Smoke</div>
                            <div class="store-toggle-name-line">Universe</div>
                        </div>
                    </div>
                    ${locationDropdownHTML}
                </div>

                <button onclick="handleStoreChange('loyalvaper')" class="lv-toggle store-toggle-btn ${selectedStore === 'loyalvaper' ? 'active' : ''}" id="store-btn-loyalvaper">
                    <i class="fas fa-smoking store-toggle-icon"></i>
                    <div class="store-toggle-name">
                        <div class="store-toggle-name-line">Loyal</div>
                        <div class="store-toggle-name-line">Vaper</div>
                    </div>
                </button>

                <button onclick="handleStoreChange('miramarwine')" class="mw-toggle store-toggle-btn ${selectedStore === 'miramarwine' ? 'active' : ''}" id="store-btn-miramarwine">
                    <i class="fas fa-wine-bottle store-toggle-icon"></i>
                    <div class="store-toggle-name">
                        <div class="store-toggle-name-line">Miramar Wine</div>
                        <div class="store-toggle-name-line">& Liquor</div>
                    </div>
                </button>
            </div>
        </div>
    `;
}

// Helper function to update store selector state (without recreating it)
function updateStoreSelectorState() {
    // Update button states
    ['vsu', 'loyalvaper', 'miramarwine'].forEach(storeKey => {
        const btn = document.getElementById(`store-btn-${storeKey}`);
        if (btn) {
            if (storeKey === selectedStore) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });

    // Update location dropdown inside VSU button
    const vsuBtn = document.getElementById('store-btn-vsu');
    const locationDropdown = document.getElementById('vsu-location-dropdown');

    if (vsuBtn && vsuLocations.length > 0 && !locationDropdown) {
        // Create the dropdown if it doesn't exist
        const dropdownDiv = document.createElement('div');
        dropdownDiv.className = 'vsu-location-dropdown';
        dropdownDiv.id = 'vsu-location-dropdown';
        dropdownDiv.onclick = (e) => e.stopPropagation();
        dropdownDiv.innerHTML = `
            <select id="location-select" onchange="event.stopPropagation(); handleLocationChange(this.value)" style="
                width: 100%;
                padding: 4px 8px;
                font-family: 'Outfit', sans-serif;
                font-size: 12px;
                font-weight: 500;
                color: inherit;
                cursor: pointer;
            ">
                <option value="">All Locations</option>
                ${vsuLocations.map(loc => `
                    <option value="${loc.id}" ${selectedLocation == loc.id ? 'selected' : ''}>
                        ${loc.name}
                    </option>
                `).join('')}
            </select>
        `;
        vsuBtn.appendChild(dropdownDiv);
    } else if (locationDropdown) {
        // Update the dropdown selection
        const locationSelect = document.getElementById('location-select');
        if (locationSelect) {
            locationSelect.value = selectedLocation || '';
        }
    }
}

// Render Analytics Page without auto-running query (user must click "Apply")
async function renderAnalyticsPage(period = 'month') {
    console.log('[Analytics] Rendering page - waiting for user to click "Apply"');

    // Initialize VSU locations if needed
    await initializeVSULocations();

    const dashboard = document.querySelector('.dashboard');

    // Build custom date text if applicable
    let customDateText = 'Pick dates';
    if (period === 'custom' && window.analyticsCustomRange?.startDate && window.analyticsCustomRange?.endDate) {
        const formatDate = (date) => date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        customDateText = `${formatDate(window.analyticsCustomRange.startDate)} → ${formatDate(window.analyticsCustomRange.endDate)}`;
    }

    // Get date values for inputs
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    let fromDateStr = todayStr;
    let toDateStr = todayStr;

    if (period === 'custom' && window.analyticsCustomRange?.startDate && window.analyticsCustomRange?.endDate) {
        fromDateStr = window.analyticsCustomRange.startDate.toISOString().split('T')[0];
        toDateStr = window.analyticsCustomRange.endDate.toISOString().split('T')[0];
    } else if (period === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        fromDateStr = weekStart.toISOString().split('T')[0];
    } else if (period === 'month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        fromDateStr = monthStart.toISOString().split('T')[0];
    } else if (period === 'year') {
        const yearStart = new Date(today.getFullYear(), 0, 1);
        fromDateStr = yearStart.toISOString().split('T')[0];
    }

    // Render page with new sales-report.html inspired layout
    dashboard.innerHTML = `
        <div class="page-header" style="margin-bottom: 0;">
            <div class="page-header-left">
                <h2 class="section-title">Sales & Analytics</h2>
                <p class="section-subtitle">Select filters and click "Apply" to load data</p>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                <div style="position: relative;">
                    <button class="btn-primary" onclick="toggleExportDropdown()" id="exportBtn">
                        <i class="fas fa-download"></i> Export
                        <i class="fas fa-chevron-down" style="margin-left: 4px; font-size: 10px;"></i>
                    </button>
                    <div id="exportDropdown" style="display: none; position: absolute; top: 100%; right: 0; margin-top: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); min-width: 160px; z-index: 1000;">
                        <button onclick="exportToPDF()" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='none'" style="width: 100%; padding: 10px 16px; text-align: left; background: none; border: none; cursor: pointer; font-family: 'Outfit', sans-serif; color: var(--text-primary); display: flex; align-items: center; gap: 10px; border-radius: 8px 8px 0 0; transition: background 0.2s;">
                            <i class="fas fa-file-pdf" style="color: #ef4444; width: 16px;"></i>
                            Export as PDF
                        </button>
                        <button onclick="exportToExcel()" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='none'" style="width: 100%; padding: 10px 16px; text-align: left; background: none; border: none; cursor: pointer; font-family: 'Outfit', sans-serif; color: var(--text-primary); display: flex; align-items: center; gap: 10px; border-radius: 0 0 8px 8px; transition: background 0.2s;">
                            <i class="fas fa-file-excel" style="color: #10b981; width: 16px;"></i>
                            Export as Excel
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filters Section - Inspired by sales-report.html -->
        <div class="analytics-filters-card" style="background: var(--bg-secondary); border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid var(--border-color);">
            <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 24px; align-items: end;">
                <!-- Quick Select Presets -->
                <div class="filter-group">
                    <label style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600; margin-bottom: 8px; display: block;">Quick Select</label>
                    <div class="analytics-presets" style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="preset-btn ${period === 'today' ? 'active' : ''}" onclick="setAnalyticsPreset('today')" style="background: ${period === 'today' ? 'var(--accent-primary)' : 'var(--bg-tertiary)'}; border: 1px solid ${period === 'today' ? 'var(--accent-primary)' : 'var(--border-color)'}; color: ${period === 'today' ? 'white' : 'var(--text-primary)'}; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">Today</button>
                        <button class="preset-btn ${period === 'yesterday' ? 'active' : ''}" onclick="setAnalyticsPreset('yesterday')" style="background: ${period === 'yesterday' ? 'var(--accent-primary)' : 'var(--bg-tertiary)'}; border: 1px solid ${period === 'yesterday' ? 'var(--accent-primary)' : 'var(--border-color)'}; color: ${period === 'yesterday' ? 'white' : 'var(--text-primary)'}; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">Yesterday</button>
                        <button class="preset-btn ${period === 'week' ? 'active' : ''}" onclick="setAnalyticsPreset('week')" style="background: ${period === 'week' ? 'var(--accent-primary)' : 'var(--bg-tertiary)'}; border: 1px solid ${period === 'week' ? 'var(--accent-primary)' : 'var(--border-color)'}; color: ${period === 'week' ? 'white' : 'var(--text-primary)'}; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">This Week</button>
                        <button class="preset-btn ${period === 'month' ? 'active' : ''}" onclick="setAnalyticsPreset('month')" style="background: ${period === 'month' ? 'var(--accent-primary)' : 'var(--bg-tertiary)'}; border: 1px solid ${period === 'month' ? 'var(--accent-primary)' : 'var(--border-color)'}; color: ${period === 'month' ? 'white' : 'var(--text-primary)'}; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">This Month</button>
                        <button class="preset-btn ${period === 'year' ? 'active' : ''}" onclick="setAnalyticsPreset('year')" style="background: ${period === 'year' ? 'var(--accent-primary)' : 'var(--bg-tertiary)'}; border: 1px solid ${period === 'year' ? 'var(--accent-primary)' : 'var(--border-color)'}; color: ${period === 'year' ? 'white' : 'var(--text-primary)'}; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">This Year</button>
                        <button class="preset-btn ${period === 'custom' ? 'active' : ''}" onclick="setAnalyticsPreset('custom')" style="background: ${period === 'custom' ? 'var(--accent-primary)' : 'var(--bg-tertiary)'}; border: 1px solid ${period === 'custom' ? 'var(--accent-primary)' : 'var(--border-color)'}; color: ${period === 'custom' ? 'white' : 'var(--text-primary)'}; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">Custom</button>
                    </div>
                </div>

                <!-- Store Selection -->
                <div class="filter-group">
                    <label style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600; margin-bottom: 8px; display: block;">Store</label>
                    <div class="store-chips" style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <div class="store-chip ${selectedStore === 'vsu' ? 'selected' : ''}" onclick="handleStoreChipClick('vsu')" style="background: ${selectedStore === 'vsu' ? '#1e3a5f' : 'var(--bg-tertiary)'}; border: 1px solid ${selectedStore === 'vsu' ? 'var(--accent-primary)' : 'var(--border-color)'}; color: ${selectedStore === 'vsu' ? '#60a5fa' : 'var(--text-primary)'}; padding: 8px 14px; border-radius: 20px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">
                            <span style="width: 8px; height: 8px; border-radius: 50%; background: #8b5cf6;"></span>
                            VSU
                        </div>
                        <div class="store-chip ${selectedStore === 'loyalvaper' ? 'selected' : ''}" onclick="handleStoreChipClick('loyalvaper')" style="background: ${selectedStore === 'loyalvaper' ? '#1e3a5f' : 'var(--bg-tertiary)'}; border: 1px solid ${selectedStore === 'loyalvaper' ? 'var(--accent-primary)' : 'var(--border-color)'}; color: ${selectedStore === 'loyalvaper' ? '#60a5fa' : 'var(--text-primary)'}; padding: 8px 14px; border-radius: 20px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">
                            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
                            Loyal Vaper
                        </div>
                        <div class="store-chip ${selectedStore === 'miramarwine' ? 'selected' : ''}" onclick="handleStoreChipClick('miramarwine')" style="background: ${selectedStore === 'miramarwine' ? '#1e3a5f' : 'var(--bg-tertiary)'}; border: 1px solid ${selectedStore === 'miramarwine' ? 'var(--accent-primary)' : 'var(--border-color)'}; color: ${selectedStore === 'miramarwine' ? '#60a5fa' : 'var(--text-primary)'}; padding: 8px 14px; border-radius: 20px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">
                            <span style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;"></span>
                            Miramar Wine
                        </div>
                        ${selectedStore === 'vsu' && vsuLocations.length > 0 ? `
                        <select id="location-select" onchange="handleLocationChange(this.value)" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px 14px; border-radius: 20px; font-size: 13px; font-family: 'Outfit', sans-serif; cursor: pointer;">
                            <option value="">All Locations</option>
                            ${vsuLocations.map(loc => `<option value="${loc.id}" ${selectedLocation == loc.id ? 'selected' : ''}>${loc.name}</option>`).join('')}
                        </select>
                        ` : ''}
                    </div>
                </div>

                <!-- Date Range & Apply -->
                <div class="filter-group">
                    <label style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600; margin-bottom: 8px; display: block;">Date Range</label>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <input type="date" id="analytics-date-from" value="${fromDateStr}" class="analytics-date-input" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 14px; border-radius: 8px; font-size: 13px; font-family: 'Outfit', sans-serif;">
                        <span style="color: var(--text-muted);">→</span>
                        <input type="date" id="analytics-date-to" value="${toDateStr}" class="analytics-date-input" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 14px; border-radius: 8px; font-size: 13px; font-family: 'Outfit', sans-serif;">
                        <button onclick="applyAnalyticsFilters()" class="btn-primary" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 10px 24px; font-size: 14px;">
                            <i class="fas fa-play"></i> Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="analytics-content">
            <div style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
                <div style="text-align: center; max-width: 500px;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
                        <i class="fas fa-chart-line" style="font-size: 32px; color: white;"></i>
                    </div>
                    <h3 style="color: var(--text-primary); margin-bottom: 12px; font-size: 20px;">Ready to Load Analytics</h3>
                    <p style="color: var(--text-muted); margin-bottom: 24px; font-size: 14px; line-height: 1.6;">
                        Select a <strong>store</strong> and <strong>date range</strong> above, then click the
                        <span style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 2px 8px; border-radius: 4px; font-weight: 600;">
                            <i class="fas fa-play"></i> Apply
                        </span> button to fetch analytics data.
                    </p>
                    <p style="color: var(--text-muted); font-size: 12px;">
                        <i class="fas fa-info-circle"></i> Using GraphQL Bulk Operations - no order limits!
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Handle store chip click
function handleStoreChipClick(storeKey) {
    selectedStore = storeKey;
    selectedLocation = null;

    // Cancel any in-progress operation
    cancelAnalyticsRequest();
    cancelBulkOperation(storeKey);

    // Re-render page to update chip states
    const periodSelect = document.querySelector('.preset-btn.active');
    let period = 'month';
    if (periodSelect) {
        const text = periodSelect.textContent.trim().toLowerCase();
        if (text === 'today') period = 'today';
        else if (text === 'yesterday') period = 'yesterday';
        else if (text === 'this week') period = 'week';
        else if (text === 'this month') period = 'month';
        else if (text === 'this year') period = 'year';
        else if (text === 'custom') period = 'custom';
    }

    renderAnalyticsPage(period);
    console.log(`[Analytics] Store changed to: ${storeKey} - Click "Apply" to load data`);
}

// Set analytics preset (quick select)
function setAnalyticsPreset(preset) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let fromDate = new Date(today);
    let toDate = new Date(today);

    switch(preset) {
        case 'today':
            break;
        case 'yesterday':
            fromDate.setDate(fromDate.getDate() - 1);
            toDate.setDate(toDate.getDate() - 1);
            break;
        case 'week':
            fromDate.setDate(fromDate.getDate() - fromDate.getDay());
            break;
        case 'month':
            fromDate.setDate(1);
            break;
        case 'year':
            fromDate.setMonth(0, 1);
            break;
        case 'custom':
            // Just update UI, don't change dates
            break;
    }

    // Update date inputs
    const fromInput = document.getElementById('analytics-date-from');
    const toInput = document.getElementById('analytics-date-to');

    if (fromInput && toInput && preset !== 'custom') {
        fromInput.value = fromDate.toISOString().split('T')[0];
        toInput.value = toDate.toISOString().split('T')[0];
    }

    // Update custom range state
    if (preset !== 'custom') {
        window.analyticsCustomRange.startDate = fromDate;
        window.analyticsCustomRange.endDate = toDate;
    }

    // Re-render to update button states
    renderAnalyticsPage(preset);
}

// Apply analytics filters (run query)
function applyAnalyticsFilters() {
    const fromInput = document.getElementById('analytics-date-from');
    const toInput = document.getElementById('analytics-date-to');

    if (!fromInput || !toInput || !fromInput.value || !toInput.value) {
        showToast('Please select a date range', 'error');
        return;
    }

    // Update custom range
    window.analyticsCustomRange.startDate = new Date(fromInput.value);
    window.analyticsCustomRange.endDate = new Date(toInput.value);

    // Set end date to end of day
    window.analyticsCustomRange.endDate.setHours(23, 59, 59, 999);

    console.log(`[Analytics] Applying filters - Store: ${selectedStore}, Date: ${fromInput.value} to ${toInput.value}`);

    // Run the query with custom period
    renderAnalyticsWithData('custom', selectedStore, selectedLocation);
}

// Render Analytics Page with Real Data
async function renderAnalyticsWithData(period = 'month', storeKey = null, locationId = null) {
    // Cancel any previous pending request and get a new request ID
    cancelAnalyticsRequest();
    const thisRequestId = analyticsRequestId;

    console.log(`[Analytics] Starting request #${thisRequestId} - Period: ${period}, Store: ${storeKey || selectedStore}, Location: ${locationId}`);

    // Update global state if parameters provided
    if (storeKey) {
        selectedStore = storeKey;
    }
    if (locationId !== null) {
        selectedLocation = locationId;
    }

    // Initialize VSU locations if needed
    await initializeVSULocations();

    // Check if this request is still valid
    if (thisRequestId !== analyticsRequestId) {
        console.log(`[Analytics] Request #${thisRequestId} cancelled (newer request exists)`);
        return;
    }

    const dashboard = document.querySelector('.dashboard');

    // Get current date values from inputs or use defaults
    const fromInput = document.getElementById('analytics-date-from');
    const toInput = document.getElementById('analytics-date-to');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    let fromDateStr = fromInput?.value || todayStr;
    let toDateStr = toInput?.value || todayStr;

    // Show loading state with filters preserved
    dashboard.innerHTML = `
        <div class="page-header" style="margin-bottom: 0;">
            <div class="page-header-left">
                <h2 class="section-title">Sales & Analytics</h2>
                <p class="section-subtitle">Loading data from Shopify...</p>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                <div style="position: relative;">
                    <button class="btn-primary" onclick="toggleExportDropdown()" id="exportBtn" disabled style="opacity: 0.5;">
                        <i class="fas fa-download"></i> Export
                        <i class="fas fa-chevron-down" style="margin-left: 4px; font-size: 10px;"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Filters Section - Keep visible during loading -->
        <div class="analytics-filters-card" style="background: var(--bg-secondary); border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid var(--border-color); opacity: 0.7; pointer-events: none;">
            <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 24px; align-items: end;">
                <div class="filter-group">
                    <label style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600; margin-bottom: 8px; display: block;">Quick Select</label>
                    <div class="analytics-presets" style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="preset-btn" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px 16px; border-radius: 6px; font-size: 13px;">Loading...</button>
                    </div>
                </div>
                <div class="filter-group">
                    <label style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600; margin-bottom: 8px; display: block;">Store</label>
                    <div class="store-chips" style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <div class="store-chip" style="background: #1e3a5f; border: 1px solid var(--accent-primary); color: #60a5fa; padding: 8px 14px; border-radius: 20px; font-size: 13px;">${selectedStore.toUpperCase()}</div>
                    </div>
                </div>
                <div class="filter-group">
                    <label style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600; margin-bottom: 8px; display: block;">Date Range</label>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="color: var(--text-muted);">${fromDateStr} → ${toDateStr}</span>
                    </div>
                </div>
            </div>
        </div>

        <div id="analytics-content">
            <div style="display: flex; justify-content: center; align-items: center; min-height: 300px;">
                <div style="text-align: center;">
                    <div style="width: 48px; height: 48px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
                    <p style="color: var(--text-muted);" id="analytics-loading-text">Fetching analytics data...</p>
                    <div style="background: var(--bg-tertiary); border-radius: 10px; height: 30px; width: 300px; margin: 20px auto; overflow: hidden;">
                        <div id="analytics-progress-bar" style="background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); height: 100%; width: 0%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.9em;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    try {
        // Build custom range if period is 'custom'
        let customRange = null;
        if (period === 'custom' && window.analyticsCustomRange) {
            const { startDate, endDate } = window.analyticsCustomRange;
            if (startDate && endDate) {
                customRange = {
                    startDate: startDate,
                    endDate: endDate
                };
            }
        }

        // Cancel any existing bulk operation before starting a new one
        console.log('[Analytics] Cancelling any existing bulk operation...');
        await cancelBulkOperation(selectedStore);

        // Use GraphQL Bulk Operations API for unlimited order fetching (no 2500 cap)
        console.log('[Analytics] Starting GraphQL Bulk Operations fetch...');
        const salesData = await fetchSalesAnalyticsBulk(selectedStore, selectedLocation, period, (progress, text) => {
            // Check if this request is still valid before updating progress
            if (thisRequestId !== analyticsRequestId) return;

            const progressBar = document.getElementById('analytics-progress-bar');
            const loadingText = document.getElementById('analytics-loading-text');
            if (progressBar) {
                progressBar.style.width = progress + '%';
                progressBar.textContent = progress + '%';
            }
            if (loadingText) {
                loadingText.textContent = text;
            }
        }, customRange);

        // Check if this request is still valid after data fetch
        if (thisRequestId !== analyticsRequestId) {
            console.log(`[Analytics] Request #${thisRequestId} cancelled after fetch (newer request exists)`);
            return;
        }

        // Check if user navigated away from analytics page
        if (!isOnAnalyticsPage()) {
            console.log(`[Analytics] Request #${thisRequestId} ignored - user left analytics page`);
            return;
        }

        console.log(`[Analytics] Request #${thisRequestId} completed - rendering data`);

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

        // Format custom date range display
        const formatDateDisplay = (date) => {
            if (!date) return '';
            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        };
        const customDateText = window.analyticsCustomRange && window.analyticsCustomRange.startDate && window.analyticsCustomRange.endDate
            ? `${formatDateDisplay(window.analyticsCustomRange.startDate)} → ${formatDateDisplay(window.analyticsCustomRange.endDate)}`
            : 'Select date range';

        // Get cash and card totals from API response (pre-computed from paymentGatewayNames)
        const cashTotal = parseFloat(salesData.summary.totalCashSales || 0);
        const cardTotal = parseFloat(salesData.summary.totalCardSales || 0);
        const cashOrders = salesData.summary.totalCashOrders || 0;
        const cardOrders = salesData.summary.totalCardOrders || 0;
        const totalPayments = cashTotal + cardTotal;
        const cashPercent = totalPayments > 0 ? ((cashTotal / totalPayments) * 100).toFixed(1) : '0';
        const cardPercent = totalPayments > 0 ? ((cardTotal / totalPayments) * 100).toFixed(1) : '0';

        // Calculate days in period for orders/day avg
        const daysInPeriod = Object.keys(salesData.daily).length || 1;
        const ordersPerDay = (salesData.summary.totalOrders / daysInPeriod).toFixed(1);

        // Get date range for display
        const dateFrom = window.analyticsCustomRange?.startDate || new Date();
        const dateTo = window.analyticsCustomRange?.endDate || new Date();
        const fromDateStr = dateFrom.toISOString().split('T')[0];
        const toDateStr = dateTo.toISOString().split('T')[0];

        // Render full page with new layout
        dashboard.innerHTML = `
            <div class="page-header" style="margin-bottom: 0;">
                <div class="page-header-left">
                    <h2 class="section-title">Sales & Analytics</h2>
                    <p class="section-subtitle">Live data from ${salesData.storeInfo.name}</p>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <div style="position: relative;">
                        <button class="btn-primary" onclick="toggleExportDropdown()" id="exportBtn">
                            <i class="fas fa-download"></i> Export
                            <i class="fas fa-chevron-down" style="margin-left: 4px; font-size: 10px;"></i>
                        </button>
                        <div id="exportDropdown" style="display: none; position: absolute; top: 100%; right: 0; margin-top: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); min-width: 160px; z-index: 1000;">
                            <button onclick="exportToPDF()" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='none'" style="width: 100%; padding: 10px 16px; text-align: left; background: none; border: none; cursor: pointer; font-family: 'Outfit', sans-serif; color: var(--text-primary); display: flex; align-items: center; gap: 10px; border-radius: 8px 8px 0 0; transition: background 0.2s;">
                                <i class="fas fa-file-pdf" style="color: #ef4444; width: 16px;"></i>
                                Export as PDF
                            </button>
                            <button onclick="exportToExcel()" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='none'" style="width: 100%; padding: 10px 16px; text-align: left; background: none; border: none; cursor: pointer; font-family: 'Outfit', sans-serif; color: var(--text-primary); display: flex; align-items: center; gap: 10px; border-radius: 0 0 8px 8px; transition: background 0.2s;">
                                <i class="fas fa-file-excel" style="color: #10b981; width: 16px;"></i>
                                Export as Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filters Section -->
            <div class="analytics-filters-card" style="background: var(--bg-secondary); border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid var(--border-color);">
                <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 24px; align-items: end;">
                    <!-- Quick Select Presets -->
                    <div class="filter-group">
                        <label style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600; margin-bottom: 8px; display: block;">Quick Select</label>
                        <div class="analytics-presets" style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="preset-btn" onclick="setAnalyticsPreset('today')" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">Today</button>
                            <button class="preset-btn" onclick="setAnalyticsPreset('yesterday')" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">Yesterday</button>
                            <button class="preset-btn" onclick="setAnalyticsPreset('week')" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">This Week</button>
                            <button class="preset-btn" onclick="setAnalyticsPreset('month')" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">This Month</button>
                            <button class="preset-btn" onclick="setAnalyticsPreset('year')" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">This Year</button>
                            <button class="preset-btn active" style="background: var(--accent-primary); border: 1px solid var(--accent-primary); color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">Custom</button>
                        </div>
                    </div>

                    <!-- Store Selection -->
                    <div class="filter-group">
                        <label style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600; margin-bottom: 8px; display: block;">Store</label>
                        <div class="store-chips" style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <div class="store-chip ${selectedStore === 'vsu' ? 'selected' : ''}" onclick="handleStoreChipClick('vsu')" style="background: ${selectedStore === 'vsu' ? '#1e3a5f' : 'var(--bg-tertiary)'}; border: 1px solid ${selectedStore === 'vsu' ? 'var(--accent-primary)' : 'var(--border-color)'}; color: ${selectedStore === 'vsu' ? '#60a5fa' : 'var(--text-primary)'}; padding: 8px 14px; border-radius: 20px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: #8b5cf6;"></span>
                                VSU
                            </div>
                            <div class="store-chip ${selectedStore === 'loyalvaper' ? 'selected' : ''}" onclick="handleStoreChipClick('loyalvaper')" style="background: ${selectedStore === 'loyalvaper' ? '#1e3a5f' : 'var(--bg-tertiary)'}; border: 1px solid ${selectedStore === 'loyalvaper' ? 'var(--accent-primary)' : 'var(--border-color)'}; color: ${selectedStore === 'loyalvaper' ? '#60a5fa' : 'var(--text-primary)'}; padding: 8px 14px; border-radius: 20px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
                                Loyal Vaper
                            </div>
                            <div class="store-chip ${selectedStore === 'miramarwine' ? 'selected' : ''}" onclick="handleStoreChipClick('miramarwine')" style="background: ${selectedStore === 'miramarwine' ? '#1e3a5f' : 'var(--bg-tertiary)'}; border: 1px solid ${selectedStore === 'miramarwine' ? 'var(--accent-primary)' : 'var(--border-color)'}; color: ${selectedStore === 'miramarwine' ? '#60a5fa' : 'var(--text-primary)'}; padding: 8px 14px; border-radius: 20px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px; font-family: 'Outfit', sans-serif; transition: all 0.2s;">
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;"></span>
                                Miramar Wine
                            </div>
                            ${selectedStore === 'vsu' && vsuLocations.length > 0 ? `
                            <select id="location-select" onchange="handleLocationChange(this.value)" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px 14px; border-radius: 20px; font-size: 13px; font-family: 'Outfit', sans-serif; cursor: pointer;">
                                <option value="">All Locations</option>
                                ${vsuLocations.map(loc => `<option value="${loc.id}" ${selectedLocation == loc.id ? 'selected' : ''}>${loc.name}</option>`).join('')}
                            </select>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Date Range & Apply -->
                    <div class="filter-group">
                        <label style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600; margin-bottom: 8px; display: block;">Date Range</label>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <input type="date" id="analytics-date-from" value="${fromDateStr}" class="analytics-date-input" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 14px; border-radius: 8px; font-size: 13px; font-family: 'Outfit', sans-serif;">
                            <span style="color: var(--text-muted);">→</span>
                            <input type="date" id="analytics-date-to" value="${toDateStr}" class="analytics-date-input" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 14px; border-radius: 8px; font-size: 13px; font-family: 'Outfit', sans-serif;">
                            <button onclick="applyAnalyticsFilters()" class="btn-primary" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 10px 24px; font-size: 14px;">
                                <i class="fas fa-play"></i> Apply
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="analytics-content">
                <!-- Summary Cards Grid - Inspired by sales-report.html -->
                <div class="summary-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div class="summary-card" style="background: var(--bg-secondary); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color);">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px; font-weight: 600;">Total Orders</div>
                        <div style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${salesData.summary.totalOrders}</div>
                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${ordersPerDay} orders/day avg</div>
                    </div>
                    <div class="summary-card" style="background: var(--bg-secondary); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color);">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px; font-weight: 600;">Gross Sales</div>
                        <div style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${formatCurrency(salesData.summary.totalSales)}</div>
                    </div>
                    <div class="summary-card" style="background: var(--bg-secondary); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color);">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px; font-weight: 600;">CECET Tax (12.5%)</div>
                        <div style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${formatCurrency(salesData.summary.totalCecetTax || 0)}</div>
                    </div>
                    <div class="summary-card" style="background: var(--bg-secondary); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color);">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px; font-weight: 600;">CA Tax (7.5%)</div>
                        <div style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${formatCurrency(salesData.summary.totalSalesTax || 0)}</div>
                    </div>
                    <div class="summary-card" style="background: var(--bg-secondary); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color);">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px; font-weight: 600;">Total Taxes</div>
                        <div style="font-size: 1.5rem; font-weight: 600; color: #ef4444;">${formatCurrency(salesData.summary.totalTax)}</div>
                    </div>
                    <div class="summary-card" style="background: var(--bg-secondary); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color);">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px; font-weight: 600;">Net Sales</div>
                        <div style="font-size: 1.5rem; font-weight: 600; color: #10b981;">${formatCurrency(salesData.summary.netSales || (parseFloat(salesData.summary.totalSales) - parseFloat(salesData.summary.totalTax)))}</div>
                    </div>
                    <div class="summary-card" style="background: var(--bg-secondary); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color);">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px; font-weight: 600;">Cash</div>
                        <div style="font-size: 1.5rem; font-weight: 600; color: #86efac;">${formatCurrency(cashTotal)}</div>
                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${cashOrders} orders (${cashPercent}%)</div>
                    </div>
                    <div class="summary-card" style="background: var(--bg-secondary); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color);">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px; font-weight: 600;">Card</div>
                        <div style="font-size: 1.5rem; font-weight: 600; color: #93c5fd;">${formatCurrency(cardTotal)}</div>
                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${cardOrders} orders (${cardPercent}%)</div>
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

                <!-- Sales Transactions Table - Inspired by sales-report.html -->
                <div class="card" style="margin-top: 24px; background: var(--bg-secondary); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color);">
                    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border-color);">
                        <h3 class="card-title" style="font-size: 1rem; font-weight: 600;"><i class="fas fa-receipt"></i> Sales Transactions</h3>
                        <span style="font-size: 13px; color: var(--text-muted);">${salesData.summary.totalOrders} transactions</span>
                    </div>
                    <div class="card-body" style="padding: 0; max-height: 600px; overflow-y: auto;">
                        <div id="sales-transactions-container">
                            ${renderSalesTransactionsTable(salesData.recentOrders || [])}
                        </div>
                    </div>
                </div>

                <!-- Connected Status -->
                <div class="shopify-connect" style="background: linear-gradient(135deg, var(--success), #2ecc71); margin-top: 24px;">
                    <div class="shopify-icon"><i class="fab fa-shopify"></i></div>
                    <div class="shopify-text">
                        <h4 style="color: white;">Connected to Shopify</h4>
                        <p style="color: rgba(255,255,255,0.8);">
                            Showing live data from <strong>${salesData.storeInfo.name}</strong>
                            ${selectedLocation && vsuLocations.length > 0 ? ` - ${vsuLocations.find(l => l.id == selectedLocation)?.name || 'Location'}` : ''}
                            (${salesData.summary.totalOrders} orders loaded via GraphQL Bulk Operations)
                        </p>
                    </div>
                    <button class="btn-primary" onclick="applyAnalyticsFilters()" style="background: white; color: var(--success);">
                        <i class="fas fa-sync-alt"></i> Refresh Data
                    </button>
                </div>
            </div>
        `;

        // Store chart data globally for switching between views
        window.analyticsChartData = {
            daily: salesData.daily,
            hourly: salesData.hourly
        };

        // Store sales data for orders table re-rendering (pagination)
        currentSalesData = salesData;
        analyticsOrdersPage = 1; // Reset to page 1 on new data load

        // Initialize the chart with daily view
        displaySalesChart('daily', SHOW_ORDERS_IN_CHART, SHOW_TAX_IN_CHART);

    } catch (error) {
        // Check if request was cancelled or user left page - don't show error
        if (thisRequestId !== analyticsRequestId) {
            console.log(`[Analytics] Request #${thisRequestId} error ignored (request was cancelled)`);
            return;
        }
        if (!isOnAnalyticsPage()) {
            console.log(`[Analytics] Request #${thisRequestId} error ignored (user left page)`);
            return;
        }

        console.error('Failed to load analytics:', error);

        // Update page header
        const pageHeader = document.querySelector('.page-header');
        if (pageHeader) {
            pageHeader.innerHTML = `
                <div class="page-header-left">
                    <h2 class="section-title">Sales & Analytics</h2>
                    <p class="section-subtitle">Unable to load data</p>
                </div>
            `;
        }

        // Show error in content area
        const contentArea = document.getElementById('analytics-content');
        if (contentArea) {
            contentArea.innerHTML = `
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

// FEATURE TOGGLES: Set to false to show only sales data (rollback)
const SHOW_ORDERS_IN_CHART = true;
const SHOW_TAX_IN_CHART = true;

let salesChart = null;

function displaySalesChart(type, showOrders = true, showTax = true) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    let labels, salesData, ordersData, taxData, labelText, ordersLabelText, taxLabelText;

    if (type === 'hourly') {
        // Generate 24 hour labels
        labels = Array.from({length: 24}, (_, i) => {
            const hour = i;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour} ${ampm}`;
        });

        // Map hourly data for sales and orders
        salesData = Array.from({length: 24}, (_, i) => {
            return window.analyticsChartData.hourly[i] ? window.analyticsChartData.hourly[i].sales : 0;
        });

        ordersData = Array.from({length: 24}, (_, i) => {
            return window.analyticsChartData.hourly[i] ? window.analyticsChartData.hourly[i].orders : 0;
        });

        taxData = Array.from({length: 24}, (_, i) => {
            return window.analyticsChartData.hourly[i] ? window.analyticsChartData.hourly[i].tax : 0;
        });

        labelText = 'Sales by Hour ($)';
        ordersLabelText = 'Orders by Hour';
        taxLabelText = 'Tax by Hour ($)';
    } else {
        // Daily view
        const dailyData = window.analyticsChartData.daily;
        const sortedDates = Object.keys(dailyData).sort();
        labels = sortedDates.map(date => {
            return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        salesData = sortedDates.map(date => dailyData[date].sales);
        ordersData = sortedDates.map(date => dailyData[date].orders);
        taxData = sortedDates.map(date => dailyData[date].tax);
        labelText = 'Sales by Day ($)';
        ordersLabelText = 'Orders by Day';
        taxLabelText = 'Tax by Day ($)';
    }

    // Destroy existing chart if it exists
    if (salesChart) {
        salesChart.destroy();
    }

    // Build datasets array - always include sales, conditionally include orders
    const datasets = [{
        label: labelText,
        data: salesData,
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
        pointHoverBorderWidth: 3,
        yAxisID: 'y'
    }];

    // Add orders dataset if enabled
    if (showOrders) {
        datasets.push({
            label: ordersLabelText,
            data: ordersData,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: type === 'hourly' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: type === 'hourly',
            borderWidth: 2,
            pointRadius: type === 'hourly' ? 0 : 5,
            pointHoverRadius: type === 'hourly' ? 0 : 7,
            pointBackgroundColor: 'rgb(239, 68, 68)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverBorderWidth: 3,
            yAxisID: 'y1'
        });
    }

    // Add tax dataset if enabled
    if (showTax) {
        datasets.push({
            label: taxLabelText,
            data: taxData,
            borderColor: 'rgb(245, 158, 11)',
            backgroundColor: type === 'hourly' ? 'rgba(245, 158, 11, 0.7)' : 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: type === 'hourly',
            borderWidth: 2,
            pointRadius: type === 'hourly' ? 0 : 5,
            pointHoverRadius: type === 'hourly' ? 0 : 7,
            pointBackgroundColor: 'rgb(245, 158, 11)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverBorderWidth: 3,
            yAxisID: 'y'
        });
    }

    // Create new chart
    salesChart = new Chart(ctx, {
        type: type === 'hourly' ? 'bar' : 'line',
        data: {
            labels: labels,
            datasets: datasets
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
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;

                            // If it's orders, show count without currency
                            if (label.includes('Orders')) {
                                return label + ': ' + Math.round(value);
                            }
                            // For sales and tax, show currency
                            return label + ': $' + value.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
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
                    },
                    title: {
                        display: showOrders,
                        text: 'Sales ($)',
                        font: {
                            family: "'Outfit', sans-serif",
                            size: 12,
                            weight: '600'
                        },
                        color: 'rgb(102, 126, 234)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: showOrders,
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        font: {
                            family: "'Outfit', sans-serif",
                            size: 11
                        },
                        callback: function(value) {
                            return value;
                        }
                    },
                    title: {
                        display: showOrders,
                        text: 'Orders',
                        font: {
                            family: "'Outfit', sans-serif",
                            size: 12,
                            weight: '600'
                        },
                        color: 'rgb(239, 68, 68)'
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
    displaySalesChart(chartType, SHOW_ORDERS_IN_CHART, SHOW_TAX_IN_CHART);
}

// =============================================================================
// Sales Transactions Table with Date Grouping & Expandable Rows
// =============================================================================

/**
 * Render Sales Transactions table with date grouping (like sales-report.html)
 * Groups orders by date with subtotals, expandable rows for product details
 */
function renderSalesTransactionsTable(orders) {
    console.log('[renderSalesTransactionsTable] Starting with', orders?.length, 'orders');

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
        return `
            <div style="padding: 48px; text-align: center; color: var(--text-muted);">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p>No transactions found for this period</p>
            </div>
        `;
    }

    // Sort orders by date (newest first)
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Group orders by date
    const ordersByDate = {};
    sortedOrders.forEach(order => {
        const dateKey = new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        if (!ordersByDate[dateKey]) {
            ordersByDate[dateKey] = [];
        }
        ordersByDate[dateKey].push(order);
    });

    let tableHTML = `
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
                <tr style="background: var(--bg-tertiary); position: sticky; top: 0; z-index: 10;">
                    <th style="text-align: left; padding: 14px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600; width: 30px;"></th>
                    <th style="text-align: left; padding: 14px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Time</th>
                    <th style="text-align: left; padding: 14px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Order #</th>
                    <th style="text-align: left; padding: 14px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Customer</th>
                    <th style="text-align: left; padding: 14px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Payment</th>
                    <th style="text-align: right; padding: 14px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Gross</th>
                    <th style="text-align: right; padding: 14px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">CECET 12.5%</th>
                    <th style="text-align: right; padding: 14px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">CA Tax 7.5%</th>
                    <th style="text-align: right; padding: 14px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Total Tax</th>
                    <th style="text-align: right; padding: 14px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Net Sales</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Render each date group
    Object.entries(ordersByDate).forEach(([dateKey, dateOrders]) => {
        // Calculate date subtotals
        const dateTotals = dateOrders.reduce((acc, order) => {
            acc.gross += parseFloat(order.total) || 0;
            acc.cecetTax += parseFloat(order.cecetTax) || 0;
            acc.salesTax += parseFloat(order.salesTax) || 0;
            acc.totalTax += (parseFloat(order.cecetTax) || 0) + (parseFloat(order.salesTax) || 0);
            return acc;
        }, { gross: 0, cecetTax: 0, salesTax: 0, totalTax: 0 });
        dateTotals.netSales = dateTotals.gross - dateTotals.totalTax;

        // Date group header
        tableHTML += `
            <tr style="background: var(--bg-tertiary);">
                <td colspan="10" style="padding: 10px 16px; font-weight: 600; color: #60a5fa; border-bottom: 1px solid var(--border-color);">
                    <i class="fas fa-calendar-alt" style="margin-right: 8px;"></i> ${dateKey}
                </td>
            </tr>
        `;

        // Render each order in the date group
        dateOrders.forEach(order => {
            const orderTime = new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const hasLineItems = order.lineItems && order.lineItems.length > 0;
            const itemCount = hasLineItems ? order.lineItems.length : 0;
            const orderTotal = parseFloat(order.total) || 0;
            const orderCecetTax = parseFloat(order.cecetTax) || 0;
            const orderSalesTax = parseFloat(order.salesTax) || 0;
            const orderTotalTax = orderCecetTax + orderSalesTax;
            const orderNetSales = orderTotal - orderTotalTax;

            // Use isCashPayment from API (based on paymentGatewayNames)
            const isCash = order.isCashPayment === true;
            const paymentBadge = isCash
                ? '<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; font-size: 11px; background: #1e3a1e; color: #86efac;"><i class="fas fa-money-bill-wave"></i> Cash</span>'
                : '<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; font-size: 11px; background: #1e2a4a; color: #93c5fd;"><i class="fas fa-credit-card"></i> Card</span>';

            // Order row (clickable to expand)
            tableHTML += `
                <tr onclick="toggleTransactionDetails('txn-${order.id}')" style="border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 14px 16px; text-align: center;">
                        <i class="fas fa-chevron-right txn-chevron" id="chevron-txn-${order.id}" style="color: var(--text-muted); transition: transform 0.2s; font-size: 11px;"></i>
                    </td>
                    <td style="padding: 14px 16px;">${orderTime}</td>
                    <td style="padding: 14px 16px;">
                        <strong>${order.name || 'N/A'}</strong>
                        ${hasLineItems ? `<span style="font-size: 11px; color: var(--text-muted); margin-left: 6px;">(${itemCount} item${itemCount !== 1 ? 's' : ''})</span>` : ''}
                    </td>
                    <td style="padding: 14px 16px; color: var(--text-secondary);">${order.customer || 'Guest'}</td>
                    <td style="padding: 14px 16px;">${paymentBadge}</td>
                    <td style="padding: 14px 16px; text-align: right;">${formatCurrency(orderTotal)}</td>
                    <td style="padding: 14px 16px; text-align: right; color: var(--text-muted);">${orderCecetTax > 0 ? formatCurrency(orderCecetTax) : '-'}</td>
                    <td style="padding: 14px 16px; text-align: right; color: var(--text-muted);">${orderSalesTax > 0 ? formatCurrency(orderSalesTax) : '-'}</td>
                    <td style="padding: 14px 16px; text-align: right; color: #ef4444;">${formatCurrency(orderTotalTax)}</td>
                    <td style="padding: 14px 16px; text-align: right; font-weight: 600; color: #10b981;">${formatCurrency(orderNetSales)}</td>
                </tr>
            `;

            // Expandable details row with product breakdown
            let lineItemsHTML = '';
            if (hasLineItems) {
                lineItemsHTML = order.lineItems.map(item => `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 10px 12px; color: var(--text-primary);">${item.name || 'Unknown'}</td>
                        <td style="padding: 10px 12px; color: var(--text-muted); font-family: monospace; font-size: 12px;">${item.sku || '-'}</td>
                        <td style="padding: 10px 12px; text-align: center; color: var(--text-secondary);">${item.quantity || 0}</td>
                        <td style="padding: 10px 12px; text-align: right; color: var(--text-secondary);">${formatCurrency(item.price || 0)}</td>
                        <td style="padding: 10px 12px; text-align: right; font-weight: 500; color: var(--text-primary);">${formatCurrency((item.price || 0) * (item.quantity || 0))}</td>
                    </tr>
                `).join('');
            } else {
                lineItemsHTML = `
                    <tr>
                        <td colspan="5" style="padding: 20px; text-align: center; color: var(--text-muted);">
                            <i class="fas fa-box-open" style="margin-right: 8px;"></i>
                            No line items available for this order
                        </td>
                    </tr>
                `;
            }

            tableHTML += `
                <tr id="txn-${order.id}" style="display: none;">
                    <td colspan="10" style="padding: 0; background: var(--bg-tertiary);">
                        <div style="padding: 16px 24px 16px 48px;">
                            <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 12px; font-size: 13px;">
                                <i class="fas fa-box" style="margin-right: 8px; color: var(--accent-primary);"></i>
                                Products in Order ${order.name}
                            </div>
                            <table style="width: 100%; border-collapse: collapse; background: var(--bg-primary); border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <thead>
                                    <tr style="background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
                                        <th style="text-align: left; padding: 10px 12px; color: var(--text-muted); font-weight: 500; font-size: 11px; text-transform: uppercase;">Product</th>
                                        <th style="text-align: left; padding: 10px 12px; color: var(--text-muted); font-weight: 500; font-size: 11px; text-transform: uppercase;">SKU</th>
                                        <th style="text-align: center; padding: 10px 12px; color: var(--text-muted); font-weight: 500; font-size: 11px; text-transform: uppercase;">Qty</th>
                                        <th style="text-align: right; padding: 10px 12px; color: var(--text-muted); font-weight: 500; font-size: 11px; text-transform: uppercase;">Unit Price</th>
                                        <th style="text-align: right; padding: 10px 12px; color: var(--text-muted); font-weight: 500; font-size: 11px; text-transform: uppercase;">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${lineItemsHTML}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            `;
        });

        // Date subtotal row
        tableHTML += `
            <tr style="background: var(--bg-hover);">
                <td colspan="5" style="padding: 10px 16px; text-align: right; font-weight: 600; border-bottom: 2px solid var(--border-color);">
                    Subtotal (${dateOrders.length} orders)
                </td>
                <td style="padding: 10px 16px; text-align: right; font-weight: 600; border-bottom: 2px solid var(--border-color);">${formatCurrency(dateTotals.gross)}</td>
                <td style="padding: 10px 16px; text-align: right; font-weight: 600; border-bottom: 2px solid var(--border-color); color: var(--text-muted);">${dateTotals.cecetTax > 0 ? formatCurrency(dateTotals.cecetTax) : '-'}</td>
                <td style="padding: 10px 16px; text-align: right; font-weight: 600; border-bottom: 2px solid var(--border-color); color: var(--text-muted);">${dateTotals.salesTax > 0 ? formatCurrency(dateTotals.salesTax) : '-'}</td>
                <td style="padding: 10px 16px; text-align: right; font-weight: 600; border-bottom: 2px solid var(--border-color); color: #ef4444;">${formatCurrency(dateTotals.totalTax)}</td>
                <td style="padding: 10px 16px; text-align: right; font-weight: 600; border-bottom: 2px solid var(--border-color); color: #10b981;">${formatCurrency(dateTotals.netSales)}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    return tableHTML;
}

/**
 * Toggle transaction details expansion
 */
function toggleTransactionDetails(rowId) {
    const detailsRow = document.getElementById(rowId);
    const chevron = document.getElementById(`chevron-${rowId}`);

    if (!detailsRow || !chevron) return;

    if (detailsRow.style.display === 'none' || detailsRow.style.display === '') {
        detailsRow.style.display = 'table-row';
        chevron.style.transform = 'rotate(90deg)';
    } else {
        detailsRow.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
    }
}

// =============================================================================
// Recent Orders Table with Expandable Rows & Pagination (Legacy)
// =============================================================================

/**
 * Render the analytics orders table with expandable rows and pagination
 */
function renderAnalyticsOrdersTable(orders) {
    console.log('[renderOrdersTable] Starting with', orders?.length, 'orders');

    // Defensive check for undefined/null/non-array orders
    if (!orders || !Array.isArray(orders)) {
        console.warn('[renderOrdersTable] Invalid orders data:', orders);
        return `
            <div style="padding: 48px; text-align: center; color: var(--text-muted);">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p>No orders data available</p>
            </div>
        `;
    }

    if (orders.length === 0) {
        return `
            <div style="padding: 48px; text-align: center; color: var(--text-muted);">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p>No orders found for this period</p>
            </div>
        `;
    }

    const totalOrders = orders.length;
    const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);
    const startIndex = (analyticsOrdersPage - 1) * ORDERS_PER_PAGE;
    const endIndex = Math.min(startIndex + ORDERS_PER_PAGE, totalOrders);
    const paginatedOrders = orders.slice(startIndex, endIndex);

    console.log('[renderOrdersTable] Paginated orders:', paginatedOrders.length, 'of', totalOrders);

    let tableHTML = `
        <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
            <table style="width: 100%; min-width: 900px; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <th style="text-align: left; padding: 12px 8px; color: var(--text-muted); font-weight: 500; width: 40px;"></th>
                        <th style="text-align: left; padding: 12px 8px; color: var(--text-muted); font-weight: 500;">Order</th>
                        <th style="text-align: left; padding: 12px 8px; color: var(--text-muted); font-weight: 500;">Customer</th>
                        <th style="text-align: left; padding: 12px 8px; color: var(--text-muted); font-weight: 500;">Date</th>
                        <th style="text-align: left; padding: 12px 8px; color: var(--text-muted); font-weight: 500;">Status</th>
                        <th style="text-align: left; padding: 12px 8px; color: var(--text-muted); font-weight: 500;">Fulfillment</th>
                        <th style="text-align: right; padding: 12px 8px; color: var(--text-muted); font-weight: 500;">CECET Tax</th>
                        <th style="text-align: right; padding: 12px 8px; color: var(--text-muted); font-weight: 500;">Sales Tax</th>
                        <th style="text-align: right; padding: 12px 8px; color: var(--text-muted); font-weight: 500;">Total</th>
                    </tr>
                </thead>
                <tbody>
    `;

    for (let i = 0; i < paginatedOrders.length; i++) {
        const order = paginatedOrders[i];
        const hasLineItems = order.lineItems && order.lineItems.length > 0;
        const itemCount = hasLineItems ? order.lineItems.length : 0;

        // Main order row
        tableHTML += `
            <tr onclick="toggleOrderDetails('${order.id}')" style="border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='transparent'">
                <td style="padding: 12px 8px; text-align: center;">
                    <i class="fas fa-chevron-right order-chevron" id="chevron-${order.id}" style="color: var(--text-muted); transition: transform 0.2s; font-size: 12px;"></i>
                </td>
                <td style="padding: 12px 8px; font-weight: 500;">
                    ${order.name || 'N/A'}
                    ${hasLineItems ? `<span style="font-size: 11px; color: var(--text-muted); margin-left: 6px;">(${itemCount} item${itemCount !== 1 ? 's' : ''})</span>` : ''}
                </td>
                <td style="padding: 12px 8px; color: var(--text-secondary);">${order.customer || 'Guest'}</td>
                <td style="padding: 12px 8px; color: var(--text-secondary);">${order.createdAt ? formatDateTime(order.createdAt) : 'N/A'}</td>
                <td style="padding: 12px 8px;">
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${order.status === 'PAID' ? 'var(--success)' : 'var(--warning)'}; color: white;">
                        ${order.status || 'PENDING'}
                    </span>
                </td>
                <td style="padding: 12px 8px;">
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${order.fulfillment === 'FULFILLED' ? 'var(--success)' : 'var(--accent-primary)'}; color: white;">
                        ${order.fulfillment || 'UNFULFILLED'}
                    </span>
                </td>
                <td style="padding: 12px 8px; text-align: right; color: var(--text-secondary);">${order.cecetTax > 0 ? formatCurrency(order.cecetTax) : ''}</td>
                <td style="padding: 12px 8px; text-align: right; color: var(--text-secondary);">${order.salesTax > 0 ? formatCurrency(order.salesTax) : ''}</td>
                <td style="padding: 12px 8px; text-align: right; font-weight: 600; color: var(--success);">${formatCurrency(order.total || 0)}</td>
            </tr>
        `;

        // Expandable details row with line items
        let lineItemsHTML = '';
        if (hasLineItems) {
            lineItemsHTML = order.lineItems.map(function(item) {
                return `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 10px 12px; color: var(--text-primary);">${item.name || 'Unknown'}</td>
                        <td style="padding: 10px 12px; color: var(--text-muted); font-family: monospace; font-size: 12px;">${item.sku || '-'}</td>
                        <td style="padding: 10px 12px; text-align: center; color: var(--text-secondary);">${item.quantity || 0}</td>
                        <td style="padding: 10px 12px; text-align: right; color: var(--text-secondary);">${formatCurrency(item.price || 0)}</td>
                        <td style="padding: 10px 12px; text-align: right; font-weight: 500; color: var(--text-primary);">${formatCurrency((item.price || 0) * (item.quantity || 0))}</td>
                    </tr>
                `;
            }).join('');
        } else {
            lineItemsHTML = `
                <tr>
                    <td colspan="5" style="padding: 20px; text-align: center; color: var(--text-muted);">
                        <i class="fas fa-box-open" style="margin-right: 8px;"></i>
                        No line items available for this order
                    </td>
                </tr>
            `;
        }

        tableHTML += `
            <tr id="details-${order.id}" style="display: none;">
                <td colspan="9" style="padding: 0; background: var(--bg-tertiary);">
                    <div style="padding: 16px 24px 16px 48px;">
                        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 12px; font-size: 13px;">
                            <i class="fas fa-box" style="margin-right: 8px; color: var(--accent-primary);"></i>
                            Order Items
                        </div>
                        <table style="width: 100%; border-collapse: collapse; background: var(--bg-primary); border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <thead>
                                <tr style="background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
                                    <th style="text-align: left; padding: 10px 12px; color: var(--text-muted); font-weight: 500; font-size: 12px;">Product</th>
                                    <th style="text-align: left; padding: 10px 12px; color: var(--text-muted); font-weight: 500; font-size: 12px;">SKU</th>
                                    <th style="text-align: center; padding: 10px 12px; color: var(--text-muted); font-weight: 500; font-size: 12px;">Qty</th>
                                    <th style="text-align: right; padding: 10px 12px; color: var(--text-muted); font-weight: 500; font-size: 12px;">Unit Price</th>
                                    <th style="text-align: right; padding: 10px 12px; color: var(--text-muted); font-weight: 500; font-size: 12px;">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${lineItemsHTML}
                            </tbody>
                        </table>
                    </div>
                </td>
            </tr>
        `;
    }

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;

    // Add pagination controls if more than one page
    if (totalPages > 1) {
        tableHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-top: 1px solid var(--border-color); background: var(--bg-secondary);">
                <span style="color: var(--text-muted); font-size: 13px;">
                    Showing ${startIndex + 1}-${endIndex} of ${totalOrders} orders
                </span>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button onclick="changeOrdersPage(-1)" ${analyticsOrdersPage === 1 ? 'disabled' : ''} class="btn-secondary" style="padding: 8px 12px; font-size: 13px; ${analyticsOrdersPage === 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                        <i class="fas fa-chevron-left" style="margin-right: 4px;"></i> Prev
                    </button>
                    <span style="color: var(--text-primary); font-weight: 500; padding: 0 12px;">
                        Page ${analyticsOrdersPage} of ${totalPages}
                    </span>
                    <button onclick="changeOrdersPage(1)" ${analyticsOrdersPage === totalPages ? 'disabled' : ''} class="btn-secondary" style="padding: 8px 12px; font-size: 13px; ${analyticsOrdersPage === totalPages ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                        Next <i class="fas fa-chevron-right" style="margin-left: 4px;"></i>
                    </button>
                </div>
            </div>
        `;
    }

    console.log('[renderOrdersTable] Returning HTML, length:', tableHTML.length);
    return tableHTML;
}

/**
 * Toggle order details expansion
 */
function toggleOrderDetails(orderId) {
    const detailsRow = document.getElementById(`details-${orderId}`);
    const chevron = document.getElementById(`chevron-${orderId}`);

    if (!detailsRow || !chevron) return;

    if (detailsRow.style.display === 'none' || detailsRow.style.display === '') {
        detailsRow.style.display = 'table-row';
        chevron.style.transform = 'rotate(90deg)';
    } else {
        detailsRow.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
    }
}

/**
 * Change orders page (pagination)
 */
function changeOrdersPage(delta) {
    if (!currentSalesData || !currentSalesData.recentOrders) return;

    const totalOrders = currentSalesData.recentOrders.length;
    const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);
    const newPage = analyticsOrdersPage + delta;

    if (newPage < 1 || newPage > totalPages) return;

    analyticsOrdersPage = newPage;

    // Re-render just the orders table
    const container = document.getElementById('recent-orders-container');
    if (container) {
        container.innerHTML = renderAnalyticsOrdersTable(currentSalesData.recentOrders);
    }
}

// =============================================================================
// Export Functions
// =============================================================================

function toggleExportDropdown() {
    const dropdown = document.getElementById('exportDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const exportBtn = document.getElementById('exportBtn');
    const dropdown = document.getElementById('exportDropdown');
    if (exportBtn && dropdown && !exportBtn.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

function exportToPDF() {
    toggleExportDropdown();

    if (!window.analyticsChartData) {
        alert('No data available to export. Please load analytics data first.');
        return;
    }

    // Get the period
    const periodSelect = document.getElementById('period-select');
    const period = periodSelect ? periodSelect.value : 'month';
    const periodLabel = period === 'today' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Year';

    // Get store info
    const storeConfig = STORES_CONFIG[selectedStore];
    const storeName = storeConfig ? storeConfig.name : 'Unknown Store';

    // Get location name if applicable
    let locationName = '';
    if (selectedLocation && vsuLocations.length > 0) {
        const location = vsuLocations.find(l => l.id == selectedLocation);
        locationName = location ? ` - ${location.name}` : '';
    }

    // Prepare data
    const dailyData = window.analyticsChartData.daily;
    const sortedDates = Object.keys(dailyData).sort();

    // Calculate totals
    let totalSales = 0;
    let totalOrders = 0;
    let totalTax = 0;
    let totalCecetTax = 0;
    let totalSalesTax = 0;

    sortedDates.forEach(date => {
        totalSales += dailyData[date].sales;
        totalOrders += dailyData[date].orders;
        totalTax += dailyData[date].tax;
        totalCecetTax += dailyData[date].cecetTax || 0;
        totalSalesTax += dailyData[date].salesTax || 0;
    });

    const hasTaxBreakdown = totalCecetTax > 0 || totalSalesTax > 0;

    // Create PDF content
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Set default font to a clean sans-serif (closest to Outfit)
    doc.setFont('helvetica', 'normal');

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text('Sales & Analytics Report', 14, 20);

    // Store and Period
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Store: ${storeName}${locationName}`, 14, 28);
    doc.text(`Period: ${periodLabel}`, 14, 34);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 40);

    // Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Summary', 14, 51);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    let summaryY = 59;
    doc.text(`Total Sales: $${totalSales.toFixed(2)}`, 14, summaryY);
    summaryY += 7;
    doc.text(`Total Orders: ${totalOrders}`, 14, summaryY);
    summaryY += 7;
    doc.text(`Total Tax: $${totalTax.toFixed(2)}`, 14, summaryY);
    summaryY += 7;
    if (hasTaxBreakdown) {
        if (totalCecetTax > 0) {
            doc.text(`  - CECET Tax: $${totalCecetTax.toFixed(2)}`, 14, summaryY);
            summaryY += 7;
        }
        if (totalSalesTax > 0) {
            doc.text(`  - Sales Tax: $${totalSalesTax.toFixed(2)}`, 14, summaryY);
            summaryY += 7;
        }
    }
    doc.text(`Average Order Value: $${(totalSales / totalOrders).toFixed(2)}`, 14, summaryY);

    // Daily breakdown table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Daily Breakdown', 14, summaryY + 14);

    // Table headers - include tax breakdown if available
    const tableHeaders = hasTaxBreakdown
        ? [['Date', 'Sales', 'Orders', 'CECET Tax', 'Sales Tax', 'Total Tax', 'Avg Order']]
        : [['Date', 'Sales', 'Orders', 'Tax', 'Avg Order']];

    doc.autoTable({
        startY: summaryY + 18,
        head: tableHeaders,
        body: sortedDates.map(date => {
            const data = dailyData[date];
            const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            if (hasTaxBreakdown) {
                return [
                    formattedDate,
                    `$${data.sales.toFixed(2)}`,
                    data.orders,
                    data.cecetTax > 0 ? `$${data.cecetTax.toFixed(2)}` : '',
                    data.salesTax > 0 ? `$${data.salesTax.toFixed(2)}` : '',
                    `$${data.tax.toFixed(2)}`,
                    `$${(data.sales / data.orders).toFixed(2)}`
                ];
            } else {
                return [
                    formattedDate,
                    `$${data.sales.toFixed(2)}`,
                    data.orders,
                    `$${data.tax.toFixed(2)}`,
                    `$${(data.sales / data.orders).toFixed(2)}`
                ];
            }
        }),
        theme: 'striped',
        headStyles: {
            fillColor: [102, 126, 234],
            font: 'helvetica',
            fontStyle: 'bold'
        },
        styles: {
            font: 'helvetica',
            fontSize: 10,
            cellPadding: 4
        },
        bodyStyles: {
            font: 'helvetica',
            fontStyle: 'normal'
        }
    });

    // Save with store name in filename
    const storeSlug = selectedStore;
    const locationSlug = selectedLocation && vsuLocations.length > 0
        ? `-${vsuLocations.find(l => l.id == selectedLocation)?.name.toLowerCase().replace(/\s+/g, '-') || 'location'}`
        : '';
    doc.save(`sales-analytics-${storeSlug}${locationSlug}-${period}-${new Date().toISOString().split('T')[0]}.pdf`);
}

function exportToExcel() {
    toggleExportDropdown();

    if (!window.analyticsChartData) {
        alert('No data available to export. Please load analytics data first.');
        return;
    }

    // Get the period
    const periodSelect = document.getElementById('period-select');
    const period = periodSelect ? periodSelect.value : 'month';
    const periodLabel = period === 'today' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Year';

    // Get store info
    const storeConfig = STORES_CONFIG[selectedStore];
    const storeName = storeConfig ? storeConfig.name : 'Unknown Store';

    // Get location name if applicable
    let locationName = '';
    if (selectedLocation && vsuLocations.length > 0) {
        const location = vsuLocations.find(l => l.id == selectedLocation);
        locationName = location ? ` - ${location.name}` : '';
    }

    // Prepare data
    const dailyData = window.analyticsChartData.daily;
    const sortedDates = Object.keys(dailyData).sort();

    // Calculate totals
    let totalSales = 0;
    let totalOrders = 0;
    let totalTax = 0;
    let totalCecetTax = 0;
    let totalSalesTax = 0;

    sortedDates.forEach(date => {
        totalSales += dailyData[date].sales;
        totalOrders += dailyData[date].orders;
        totalTax += dailyData[date].tax;
        totalCecetTax += dailyData[date].cecetTax || 0;
        totalSalesTax += dailyData[date].salesTax || 0;
    });

    const hasTaxBreakdown = totalCecetTax > 0 || totalSalesTax > 0;

    // Build summary rows
    const summaryRows = [
        ['Summary'],
        ['Total Sales', `$${totalSales.toFixed(2)}`],
        ['Total Orders', totalOrders],
        ['Total Tax', `$${totalTax.toFixed(2)}`]
    ];

    if (hasTaxBreakdown) {
        if (totalCecetTax > 0) {
            summaryRows.push(['  - CECET Tax', `$${totalCecetTax.toFixed(2)}`]);
        }
        if (totalSalesTax > 0) {
            summaryRows.push(['  - Sales Tax', `$${totalSalesTax.toFixed(2)}`]);
        }
    }

    summaryRows.push(['Average Order Value', `$${(totalSales / totalOrders).toFixed(2)}`]);

    // Build daily breakdown headers and rows
    const dailyHeaders = hasTaxBreakdown
        ? ['Date', 'Sales', 'Orders', 'CECET Tax', 'Sales Tax', 'Total Tax', 'Avg Order Value']
        : ['Date', 'Sales', 'Orders', 'Tax', 'Avg Order Value'];

    const dailyRows = sortedDates.map(date => {
        const data = dailyData[date];
        const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        if (hasTaxBreakdown) {
            return [
                formattedDate,
                data.sales.toFixed(2),
                data.orders,
                data.cecetTax > 0 ? data.cecetTax.toFixed(2) : '',
                data.salesTax > 0 ? data.salesTax.toFixed(2) : '',
                data.tax.toFixed(2),
                (data.sales / data.orders).toFixed(2)
            ];
        } else {
            return [
                formattedDate,
                data.sales.toFixed(2),
                data.orders,
                data.tax.toFixed(2),
                (data.sales / data.orders).toFixed(2)
            ];
        }
    });

    // Create Excel data
    const excelData = [
        ['Sales & Analytics Report'],
        [`Store: ${storeName}${locationName}`],
        [`Period: ${periodLabel}`],
        [`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`],
        [],
        ...summaryRows,
        [],
        ['Daily Breakdown'],
        dailyHeaders,
        ...dailyRows
    ];

    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Analytics');

    // Style the header - adjust column widths for tax breakdown
    ws['!cols'] = hasTaxBreakdown
        ? [
            { wch: 15 },
            { wch: 12 },
            { wch: 10 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 15 }
        ]
        : [
            { wch: 15 },
            { wch: 12 },
            { wch: 10 },
            { wch: 12 },
            { wch: 15 }
        ];

    // Save with store name in filename
    const storeSlug = selectedStore;
    const locationSlug = selectedLocation && vsuLocations.length > 0
        ? `-${vsuLocations.find(l => l.id == selectedLocation)?.name.toLowerCase().replace(/\s+/g, '-') || 'location'}`
        : '';
    XLSX.writeFile(wb, `sales-analytics-${storeSlug}${locationSlug}-${period}-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// =============================================================================
// Multi-Store Handler Functions
// =============================================================================

function handleStoreChange(storeKey) {
    selectedStore = storeKey;
    selectedLocation = null; // Reset location when changing stores

    // Update UI to show selected store (toggle active class)
    document.querySelectorAll('.store-toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`store-btn-${storeKey}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Cancel any in-progress bulk operation when changing stores
    cancelAnalyticsRequest();
    cancelBulkOperation(storeKey);

    console.log(`[Analytics] Store changed to: ${storeKey} - Click "Run Query" to load data`);
}

function handleLocationChange(locationId) {
    selectedLocation = locationId === '' ? null : locationId;

    // Cancel any in-progress bulk operation when changing location
    cancelAnalyticsRequest();

    console.log(`[Analytics] Location changed to: ${locationId || 'All Locations'} - Click "Run Query" to load data`);
}

// =============================================================================
// Analytics Custom Date Range Calendar Functions
// =============================================================================

// Initialize custom range state
// currentMonth represents the LEFT panel month (previous month)
// so the RIGHT panel will show current month
(function() {
    const now = new Date();
    let prevMonth = now.getMonth() - 1;
    let prevYear = now.getFullYear();
    if (prevMonth < 0) {
        prevMonth = 11;
        prevYear--;
    }
    window.analyticsCustomRange = {
        startDate: null,
        endDate: null,
        currentMonth: prevMonth,
        currentYear: prevYear
    };
})();

// Handle period dropdown change
function handlePeriodChange(value) {
    const calendarBtn = document.getElementById('calendar-btn');

    // Cancel any in-progress bulk operation when changing period
    cancelAnalyticsRequest();

    if (value === 'custom') {
        // Show calendar button
        if (calendarBtn) {
            calendarBtn.style.display = 'inline-flex';
        }
        // Auto-open calendar popup if no dates selected
        if (!window.analyticsCustomRange.startDate) {
            toggleAnalyticsCalendarPopup();
        }
    } else {
        // Hide calendar button and popup
        if (calendarBtn) {
            calendarBtn.style.display = 'none';
        }
        const popup = document.getElementById('analytics-calendar-popup');
        if (popup) {
            popup.style.display = 'none';
        }
        // Do NOT auto-fetch - user must click "Run Query" button
        console.log(`[Analytics] Period changed to: ${value} - Click "Run Query" to load data`);
    }
}

// Toggle calendar popup visibility
function toggleAnalyticsCalendarPopup() {
    const popup = document.getElementById('analytics-calendar-popup');
    if (!popup) return;

    const isVisible = popup.style.display !== 'none';
    popup.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
        renderAnalyticsCalendars();
    }
}

// Render both month calendars
function renderAnalyticsCalendars() {
    const month1Container = document.getElementById('calendar-month-1');
    const month2Container = document.getElementById('calendar-month-2');

    if (!month1Container || !month2Container) return;

    const { currentMonth, currentYear } = window.analyticsCustomRange;

    // Month 1: Current month
    month1Container.innerHTML = renderCalendarMonth(currentYear, currentMonth, 1);

    // Month 2: Next month
    let nextMonth = currentMonth + 1;
    let nextYear = currentYear;
    if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
    }
    month2Container.innerHTML = renderCalendarMonth(nextYear, nextMonth, 2);
}

// Render a single month calendar
function renderCalendarMonth(year, month, panelId) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { startDate, endDate } = window.analyticsCustomRange;

    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            ${panelId === 1 ? `<button onclick="event.stopPropagation(); navigateAnalyticsCalendar(-1)" style="background: none; border: none; cursor: pointer; padding: 8px; color: var(--text-secondary); font-size: 16px; border-radius: 8px; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'"><i class="fas fa-chevron-left"></i></button>` : '<div style="width: 32px;"></div>'}
            <span style="font-weight: 600; color: var(--text-primary); font-size: 15px;">${monthNames[month]} ${year}</span>
            ${panelId === 2 ? `<button onclick="event.stopPropagation(); navigateAnalyticsCalendar(1)" style="background: none; border: none; cursor: pointer; padding: 8px; color: var(--text-secondary); font-size: 16px; border-radius: 8px; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'"><i class="fas fa-chevron-right"></i></button>` : '<div style="width: 32px;"></div>'}
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center;">
    `;

    // Day headers
    dayNames.forEach(day => {
        html += `<div style="padding: 8px 4px; font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase;">${day}</div>`;
    });

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        html += `<div style="padding: 8px;"></div>`;
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
        const isFuture = date > today;

        // Check selection states
        let isSelected = false;
        let isStart = false;
        let isEnd = false;
        let isInRange = false;

        if (startDate) {
            const startTime = new Date(startDate).setHours(0, 0, 0, 0);
            isStart = date.getTime() === startTime;
            isSelected = isStart;

            if (endDate) {
                const endTime = new Date(endDate).setHours(0, 0, 0, 0);
                isEnd = date.getTime() === endTime;
                isSelected = isSelected || isEnd;
                isInRange = date.getTime() > startTime && date.getTime() < endTime;
            }
        }

        // Build styles
        let bgColor = 'transparent';
        let textColor = isFuture ? '#d1d5db' : '#374151';
        let fontWeight = '400';
        let borderRadius = '8px';

        if (isStart || isEnd) {
            bgColor = 'var(--accent-primary)';
            textColor = 'white';
            fontWeight = '600';
            borderRadius = isStart ? '8px 0 0 8px' : '0 8px 8px 0';
            if (isStart && isEnd) borderRadius = '8px';
        } else if (isInRange) {
            bgColor = 'rgba(99, 102, 241, 0.15)';
            textColor = 'var(--accent-primary)';
            borderRadius = '0';
        }

        const cursor = isFuture ? 'not-allowed' : 'pointer';
        const hoverBg = !isFuture && !isSelected && !isInRange ? 'onmouseover="this.style.background=\'#f3f4f6\'" onmouseout="this.style.background=\'transparent\'"' : '';

        html += `
            <div onclick="${isFuture ? '' : `event.stopPropagation(); selectAnalyticsDate(${year}, ${month}, ${day})`}"
                 style="padding: 10px 4px; cursor: ${cursor}; background: ${bgColor}; color: ${textColor}; font-weight: ${fontWeight}; border-radius: ${borderRadius}; font-size: 14px; transition: all 0.15s;"
                 ${hoverBg}>
                ${day}
            </div>
        `;
    }

    html += '</div>';
    return html;
}

// Navigate between months
function navigateAnalyticsCalendar(direction) {
    let { currentMonth, currentYear } = window.analyticsCustomRange;

    currentMonth += direction;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    window.analyticsCustomRange.currentMonth = currentMonth;
    window.analyticsCustomRange.currentYear = currentYear;

    renderAnalyticsCalendars();
}

// Handle date selection
function selectAnalyticsDate(year, month, day) {
    const clickedDate = new Date(year, month, day);
    clickedDate.setHours(0, 0, 0, 0);

    const { startDate, endDate } = window.analyticsCustomRange;

    if (!startDate || (startDate && endDate)) {
        // Start new selection
        window.analyticsCustomRange.startDate = clickedDate;
        window.analyticsCustomRange.endDate = null;
    } else {
        // Complete the range
        if (clickedDate < startDate) {
            // Clicked date is before start, swap them
            window.analyticsCustomRange.endDate = startDate;
            window.analyticsCustomRange.startDate = clickedDate;
        } else {
            window.analyticsCustomRange.endDate = clickedDate;
        }
    }

    updateSelectedRangeDisplay();
    renderAnalyticsCalendars();
}

// Update the range display text
function updateSelectedRangeDisplay() {
    const display = document.getElementById('selected-range-display');
    const btnText = document.getElementById('calendar-btn-text');
    const { startDate, endDate } = window.analyticsCustomRange;

    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    let text = 'Select date range';
    if (startDate && endDate) {
        text = `${formatDate(startDate)} → ${formatDate(endDate)}`;
    } else if (startDate) {
        text = `${formatDate(startDate)} → Select end date`;
    }

    if (display) display.textContent = text;
    if (btnText && startDate && endDate) btnText.textContent = text;
}

// Clear custom range selection
function clearAnalyticsCustomRange() {
    window.analyticsCustomRange.startDate = null;
    window.analyticsCustomRange.endDate = null;

    // Reset to show previous month on left, current month on right
    const now = new Date();
    let prevMonth = now.getMonth() - 1;
    let prevYear = now.getFullYear();
    if (prevMonth < 0) {
        prevMonth = 11;
        prevYear--;
    }
    window.analyticsCustomRange.currentMonth = prevMonth;
    window.analyticsCustomRange.currentYear = prevYear;

    updateSelectedRangeDisplay();
    renderAnalyticsCalendars();

    const btnText = document.getElementById('calendar-btn-text');
    if (btnText) btnText.textContent = 'Pick dates';
}

// Apply custom range (just save selection, don't fetch data)
function applyAnalyticsCustomRange() {
    const { startDate, endDate } = window.analyticsCustomRange;

    if (!startDate || !endDate) {
        showToast('Please select both start and end dates', 'error');
        return;
    }

    // Close popup
    const popup = document.getElementById('analytics-calendar-popup');
    if (popup) popup.style.display = 'none';

    // Update button text
    const btnText = document.getElementById('calendar-btn-text');
    const formatDate = (date) => date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    if (btnText) btnText.textContent = `${formatDate(startDate)} → ${formatDate(endDate)}`;

    // Do NOT auto-fetch - user must click "Run Query" button
    console.log(`[Analytics] Custom range set: ${formatDate(startDate)} → ${formatDate(endDate)} - Click "Run Query" to load data`);
}

// Close popup when clicking outside
// Using mousedown instead of click to avoid conflicts with calendar interactions
document.addEventListener('mousedown', function(e) {
    const popup = document.getElementById('analytics-calendar-popup');
    const wrapper = document.getElementById('custom-calendar-wrapper');

    if (popup && wrapper && popup.style.display !== 'none') {
        // Check if click is inside the popup or wrapper
        if (!wrapper.contains(e.target) && !popup.contains(e.target)) {
            popup.style.display = 'none';
        }
    }
});

