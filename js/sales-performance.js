// =====================================================
// SALES PERFORMANCE MODULE
// Correlates Shopify sales with employee schedules
// =====================================================

// Sales Performance state
let salesPerfData = {
    orders: [],
    schedules: [],
    employees: [],
    dateRange: { start: null, end: null },
    selectedStore: 'all',
    storeLocations: {}
};

// Map Shopify location names to our store names
const STORE_LOCATION_MAP = {
    'miramar': 'Miramar',
    'chula vista': 'Chula Vista',
    'morena': 'Morena',
    'north park': 'North Park',
    'kearny mesa': 'Kearny Mesa'
};

/**
 * Main render function for Sales Performance module
 */
async function renderSalesPerformance() {
    const dashboard = document.querySelector('.dashboard');

    // Reset and set default date range to this week (Sunday to today)
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    salesPerfData.dateRange.start = startOfWeek;
    salesPerfData.dateRange.end = today;
    salesPerfData.selectedStore = 'all'; // Reset store filter

    dashboard.innerHTML = `
        <style>
            /* WIP Banner with animation */
            .wip-banner {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 12px;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 14px;
                animation: slideDown 0.5s ease-out;
            }

            .wip-banner i {
                font-size: 20px;
                animation: pulse-icon 2s ease-in-out infinite;
            }

            @keyframes pulse-icon {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .sales-perf-container {
                max-width: 1400px;
                margin: 0 auto;
            }

            .sales-perf-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
                flex-wrap: wrap;
                gap: 16px;
                animation: fadeIn 0.6s ease-out;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .sales-perf-title {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .sales-perf-title h2 {
                font-size: 24px;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0;
            }

            .sales-perf-title .subtitle {
                color: var(--text-muted);
                font-size: 14px;
            }

            .sales-perf-filters {
                display: flex;
                gap: 12px;
                align-items: center;
                flex-wrap: wrap;
            }

            .sales-perf-filters select,
            .sales-perf-filters input {
                padding: 10px 14px;
                border-radius: 10px;
                border: 1px solid var(--border-color);
                background: var(--bg-card);
                color: var(--text-primary);
                font-size: 14px;
                font-family: inherit;
                transition: all 0.2s;
            }

            .sales-perf-filters select:hover,
            .sales-perf-filters input:hover {
                border-color: var(--accent-primary);
            }

            .sales-perf-summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }

            .summary-card {
                background: var(--bg-card);
                border-radius: 16px;
                padding: 20px;
                border: 1px solid var(--border-color);
                transition: all 0.3s ease;
                animation: cardSlideUp 0.5s ease-out backwards;
            }

            .summary-card:nth-child(1) { animation-delay: 0.1s; }
            .summary-card:nth-child(2) { animation-delay: 0.2s; }
            .summary-card:nth-child(3) { animation-delay: 0.3s; }
            .summary-card:nth-child(4) { animation-delay: 0.4s; }

            @keyframes cardSlideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .summary-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 24px rgba(0,0,0,0.1);
            }

            .summary-card.highlight {
                background: linear-gradient(135deg, var(--accent-primary) 0%, #8b5cf6 100%);
                border: none;
                position: relative;
                overflow: hidden;
            }

            .summary-card.highlight::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                animation: shimmer 3s infinite;
            }

            @keyframes shimmer {
                0% { transform: translateX(-100%) rotate(45deg); }
                100% { transform: translateX(100%) rotate(45deg); }
            }

            .summary-card.highlight .summary-label,
            .summary-card.highlight .summary-value {
                color: white;
                position: relative;
            }

            .summary-label {
                font-size: 12px;
                color: var(--text-muted);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
            }

            .summary-value {
                font-size: 28px;
                font-weight: 700;
                color: var(--text-primary);
            }

            .summary-change {
                font-size: 12px;
                margin-top: 8px;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .summary-change.up { color: #10b981; }
            .summary-change.down { color: #ef4444; }

            .sales-perf-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
                margin-bottom: 24px;
            }

            @media (max-width: 1024px) {
                .sales-perf-grid {
                    grid-template-columns: 1fr;
                }
            }

            .perf-card {
                background: var(--bg-card);
                border-radius: 16px;
                border: 1px solid var(--border-color);
                overflow: hidden;
                transition: all 0.3s ease;
                animation: cardSlideUp 0.6s ease-out backwards;
            }

            .perf-card:hover {
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }

            .perf-card-header {
                padding: 16px 20px;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .perf-card-title {
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary);
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .perf-card-body {
                padding: 20px;
            }

            .hourly-chart {
                display: flex;
                align-items: flex-end;
                gap: 4px;
                height: 200px;
                padding: 0 10px;
            }

            .hourly-bar {
                flex: 1;
                min-width: 20px;
                background: linear-gradient(180deg, var(--accent-primary) 0%, #8b5cf6 100%);
                border-radius: 6px 6px 0 0;
                position: relative;
                cursor: pointer;
                transition: all 0.3s ease;
                animation: barGrow 0.8s ease-out backwards;
            }

            .hourly-bar:nth-child(1) { animation-delay: 0.05s; }
            .hourly-bar:nth-child(2) { animation-delay: 0.1s; }
            .hourly-bar:nth-child(3) { animation-delay: 0.15s; }
            .hourly-bar:nth-child(4) { animation-delay: 0.2s; }
            .hourly-bar:nth-child(5) { animation-delay: 0.25s; }
            .hourly-bar:nth-child(6) { animation-delay: 0.3s; }
            .hourly-bar:nth-child(7) { animation-delay: 0.35s; }
            .hourly-bar:nth-child(8) { animation-delay: 0.4s; }
            .hourly-bar:nth-child(9) { animation-delay: 0.45s; }
            .hourly-bar:nth-child(10) { animation-delay: 0.5s; }
            .hourly-bar:nth-child(11) { animation-delay: 0.55s; }
            .hourly-bar:nth-child(12) { animation-delay: 0.6s; }
            .hourly-bar:nth-child(13) { animation-delay: 0.65s; }
            .hourly-bar:nth-child(14) { animation-delay: 0.7s; }
            .hourly-bar:nth-child(15) { animation-delay: 0.75s; }

            @keyframes barGrow {
                from { transform: scaleY(0); transform-origin: bottom; }
                to { transform: scaleY(1); transform-origin: bottom; }
            }

            .hourly-bar:hover {
                filter: brightness(1.15);
                transform: scaleY(1.05);
                box-shadow: 0 -4px 12px rgba(139, 92, 246, 0.3);
            }

            .hourly-bar .tooltip {
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%) translateY(-8px);
                background: var(--bg-primary);
                padding: 10px 14px;
                border-radius: 10px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: all 0.2s;
                box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                z-index: 10;
                border: 1px solid var(--border-color);
            }

            .hourly-bar:hover .tooltip {
                opacity: 1;
                transform: translateX(-50%) translateY(-12px);
            }

            .hourly-labels {
                display: flex;
                justify-content: space-between;
                margin-top: 12px;
                padding: 0 10px;
            }

            .hourly-label {
                font-size: 10px;
                color: var(--text-muted);
            }

            .employee-ranking {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .ranking-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px;
                background: var(--bg-secondary);
                border-radius: 14px;
                transition: all 0.3s ease;
                animation: rankSlideIn 0.5s ease-out backwards;
                cursor: pointer;
            }

            .ranking-item:nth-child(1) { animation-delay: 0.1s; }
            .ranking-item:nth-child(2) { animation-delay: 0.15s; }
            .ranking-item:nth-child(3) { animation-delay: 0.2s; }
            .ranking-item:nth-child(4) { animation-delay: 0.25s; }
            .ranking-item:nth-child(5) { animation-delay: 0.3s; }

            @keyframes rankSlideIn {
                from { opacity: 0; transform: translateX(-20px); }
                to { opacity: 1; transform: translateX(0); }
            }

            .ranking-item:hover {
                background: var(--bg-tertiary);
                transform: translateX(8px);
                box-shadow: -4px 4px 12px rgba(0,0,0,0.05);
            }

            .ranking-item.first-place {
                background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1));
                border: 1px solid rgba(251, 191, 36, 0.3);
                position: relative;
                overflow: hidden;
            }

            .ranking-item.first-place::after {
                content: '👑';
                position: absolute;
                right: 16px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 24px;
                animation: crownBounce 2s ease-in-out infinite;
            }

            @keyframes crownBounce {
                0%, 100% { transform: translateY(-50%) rotate(-5deg); }
                50% { transform: translateY(-55%) rotate(5deg); }
            }

            .ranking-position {
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 10px;
                font-weight: 700;
                font-size: 14px;
                flex-shrink: 0;
            }

            .ranking-position.gold {
                background: linear-gradient(135deg, #fbbf24, #f59e0b);
                color: white;
                box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
            }
            .ranking-position.silver {
                background: linear-gradient(135deg, #9ca3af, #6b7280);
                color: white;
                box-shadow: 0 4px 12px rgba(156, 163, 175, 0.4);
            }
            .ranking-position.bronze {
                background: linear-gradient(135deg, #d97706, #b45309);
                color: white;
                box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
            }
            .ranking-position.normal {
                background: var(--bg-card);
                color: var(--text-muted);
            }

            .ranking-avatar {
                width: 56px;
                height: 56px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                color: white;
                font-size: 18px;
                flex-shrink: 0;
                overflow: hidden;
                border: 3px solid rgba(255,255,255,0.2);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }

            .ranking-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .ranking-info {
                flex: 1;
                min-width: 0;
            }

            .ranking-name {
                font-weight: 600;
                color: var(--text-primary);
                font-size: 14px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .ranking-store {
                font-size: 12px;
                color: var(--text-muted);
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .ranking-stats {
                text-align: right;
                flex-shrink: 0;
            }

            .ranking-sales {
                font-weight: 700;
                color: var(--accent-primary);
                font-size: 16px;
            }

            .ranking-hours {
                font-size: 11px;
                color: var(--text-muted);
                background: var(--bg-card);
                padding: 2px 8px;
                border-radius: 10px;
                display: inline-block;
                margin-top: 4px;
            }

            .store-comparison {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 16px;
            }

            .store-stat {
                text-align: center;
                padding: 20px 16px;
                background: var(--bg-secondary);
                border-radius: 14px;
                transition: all 0.3s ease;
                animation: cardSlideUp 0.5s ease-out backwards;
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }

            .store-stat::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, var(--accent-primary), #8b5cf6);
                transform: scaleX(0);
                transition: transform 0.3s ease;
            }

            .store-stat:hover::before {
                transform: scaleX(1);
            }

            .store-stat:hover {
                transform: translateY(-4px);
                background: var(--bg-tertiary);
            }

            .store-name {
                font-size: 12px;
                color: var(--text-muted);
                margin-bottom: 8px;
                font-weight: 500;
            }

            .store-value {
                font-size: 22px;
                font-weight: 700;
                color: var(--text-primary);
                background: linear-gradient(135deg, var(--accent-primary), #8b5cf6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .store-orders {
                font-size: 12px;
                color: var(--text-muted);
                margin-top: 6px;
            }

            .loading-overlay {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 80px;
                gap: 20px;
            }

            .loading-spinner {
                width: 56px;
                height: 56px;
                border: 4px solid var(--border-color);
                border-top-color: var(--accent-primary);
                border-right-color: #8b5cf6;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .perf-table {
                width: 100%;
                border-collapse: collapse;
            }

            .perf-table th,
            .perf-table td {
                padding: 14px 12px;
                text-align: left;
                border-bottom: 1px solid var(--border-color);
            }

            .perf-table th {
                font-size: 11px;
                color: var(--text-muted);
                text-transform: uppercase;
                font-weight: 600;
                letter-spacing: 0.5px;
            }

            .perf-table tbody tr {
                transition: all 0.2s ease;
            }

            .perf-table tbody tr:hover {
                background: var(--bg-secondary);
            }

            .table-avatar {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                color: white;
                font-size: 14px;
                margin-right: 12px;
                vertical-align: middle;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .table-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .shift-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 500;
            }

            .shift-badge.opening {
                background: #fef3c7;
                color: #d97706;
            }

            .shift-badge.closing {
                background: #dbeafe;
                color: #2563eb;
            }

            /* Confetti animation for #1 */
            @keyframes confetti-fall {
                0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }

            .confetti-piece {
                position: fixed;
                width: 10px;
                height: 10px;
                top: 0;
                animation: confetti-fall 3s linear forwards;
                z-index: 9999;
                pointer-events: none;
            }

            /* Mobile Responsive - Sales Performance */
            @media (max-width: 768px) {
                .sales-perf-header {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 12px;
                }
                .sales-perf-title {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }
                .sales-perf-title h2 {
                    font-size: 20px;
                }
                .sales-perf-filters {
                    flex-direction: column;
                    gap: 10px;
                }
                .sales-perf-filters select,
                .sales-perf-filters input {
                    width: 100%;
                    padding: 12px;
                }
                .sales-perf-filters .btn-primary {
                    width: 100%;
                }
                .sales-perf-summary {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
                .summary-card {
                    padding: 14px;
                }
                .summary-value {
                    font-size: 22px;
                }
                .summary-label {
                    font-size: 11px;
                }
                .hourly-chart {
                    height: 150px;
                    overflow-x: auto;
                    padding-bottom: 8px;
                }
                .hourly-bar {
                    min-width: 16px;
                }
                .hourly-label {
                    font-size: 9px;
                }
                .ranking-item {
                    padding: 12px;
                    gap: 10px;
                }
                .ranking-avatar {
                    width: 44px;
                    height: 44px;
                    font-size: 14px;
                }
                .ranking-position {
                    width: 30px;
                    height: 30px;
                    font-size: 12px;
                }
                .ranking-name {
                    font-size: 13px;
                }
                .ranking-sales {
                    font-size: 14px;
                }
                .ranking-item.first-place::after {
                    font-size: 18px;
                    right: 10px;
                }
                .store-comparison {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }
                .store-stat {
                    padding: 14px 10px;
                }
                .store-value {
                    font-size: 18px;
                }
                .perf-card-header {
                    padding: 12px 16px;
                }
                .perf-card-body {
                    padding: 14px;
                }
                .perf-table th,
                .perf-table td {
                    padding: 10px 8px;
                    font-size: 12px;
                }
                .table-avatar {
                    width: 32px;
                    height: 32px;
                    font-size: 12px;
                    margin-right: 8px;
                }
                /* Hide less important columns on mobile */
                .perf-table th:nth-child(4),
                .perf-table td:nth-child(4),
                .perf-table th:nth-child(5),
                .perf-table td:nth-child(5) {
                    display: none;
                }
                .wip-banner {
                    padding: 12px 14px;
                    font-size: 12px;
                }
            }
            @media (max-width: 480px) {
                .sales-perf-title h2 {
                    font-size: 18px;
                }
                .sales-perf-summary {
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                .summary-card {
                    padding: 12px;
                }
                .summary-value {
                    font-size: 18px;
                }
                .ranking-avatar {
                    width: 36px;
                    height: 36px;
                    font-size: 12px;
                }
                .ranking-item.first-place::after {
                    display: none;
                }
                .store-comparison {
                    grid-template-columns: 1fr 1fr;
                }
                .store-value {
                    font-size: 16px;
                }
                .store-name {
                    font-size: 11px;
                }
                .perf-table th:nth-child(3),
                .perf-table td:nth-child(3) {
                    display: none;
                }
            }
        </style>

        <div class="sales-perf-container">
            <!-- Work in Progress Banner -->
            <div class="wip-banner">
                <i class="fas fa-flask"></i>
                <div>
                    <strong>Beta Feature</strong> — We're actively building this module. Sales are attributed to employees based on their scheduled shifts. More insights coming soon!
                </div>
            </div>

            <div class="sales-perf-header">
                <div class="sales-perf-title">
                    <div>
                        <h2><i class="fas fa-ranking-star" style="color: var(--accent-primary);"></i> Sales Performance</h2>
                        <div class="subtitle">Employee sales attribution based on schedules</div>
                    </div>
                </div>

                <div class="sales-perf-filters">
                    <select id="sales-perf-store" onchange="updateSalesPerfStore(this.value)">
                        <option value="all">All Stores</option>
                        <option value="Miramar">VSU Miramar</option>
                        <option value="Chula Vista">VSU Chula Vista</option>
                        <option value="Morena">VSU Morena</option>
                        <option value="North Park">VSU North Park</option>
                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                    </select>

                    <input type="date" id="sales-perf-start" onchange="updateSalesPerfDateRange()" value="${formatDateInput(salesPerfData.dateRange.start)}">
                    <span style="color: var(--text-muted);">to</span>
                    <input type="date" id="sales-perf-end" onchange="updateSalesPerfDateRange()" value="${formatDateInput(salesPerfData.dateRange.end)}">

                    <button class="btn-primary" onclick="loadSalesPerformanceData()">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            </div>

            <div id="sales-perf-content">
                <div class="loading-overlay">
                    <div class="loading-spinner"></div>
                    <div style="color: var(--text-muted);">Loading sales performance data...</div>
                </div>
            </div>
        </div>
    `;

    // Load data
    await loadSalesPerformanceData();
}

/**
 * Format date for input field
 */
function formatDateInput(date) {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Update store filter
 */
function updateSalesPerfStore(store) {
    salesPerfData.selectedStore = store;
    renderSalesPerformanceContent();
}

/**
 * Update date range
 */
function updateSalesPerfDateRange() {
    const startInput = document.getElementById('sales-perf-start');
    const endInput = document.getElementById('sales-perf-end');

    if (startInput && endInput) {
        salesPerfData.dateRange.start = new Date(startInput.value);
        salesPerfData.dateRange.end = new Date(endInput.value);
        loadSalesPerformanceData();
    }
}

/**
 * Load all sales performance data
 */
async function loadSalesPerformanceData() {
    const content = document.getElementById('sales-perf-content');
    if (!content) return;

    content.innerHTML = `
        <div class="loading-overlay">
            <div class="loading-spinner"></div>
            <div id="sales-perf-status" style="color: var(--text-muted);">Loading sales data from Shopify...</div>
        </div>
    `;

    try {
        // 1. Load Shopify orders for the date range using bulk API
        const statusEl = document.getElementById('sales-perf-status');

        // Get date range strings
        const startStr = formatDateInput(salesPerfData.dateRange.start);
        const endStr = formatDateInput(salesPerfData.dateRange.end);

        if (statusEl) statusEl.textContent = 'Fetching sales from Shopify...';

        // Use the bulk operation API from shopify-analytics.js
        const analytics = await window.fetchSalesAnalyticsBulk('vsu', null, 'custom', (progress, msg) => {
            if (statusEl) statusEl.textContent = msg;
        }, {
            startDate: salesPerfData.dateRange.start,
            endDate: salesPerfData.dateRange.end
        });

        salesPerfData.orders = analytics.recentOrders || [];

        if (statusEl) statusEl.textContent = 'Loading employee schedules...';

        // 2. Load schedules from Firebase
        const db = firebase.firestore();
        const schedulesRef = db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules');
        const schedulesSnapshot = await schedulesRef
            .where('date', '>=', startStr)
            .where('date', '<=', endStr)
            .get();

        salesPerfData.schedules = [];
        schedulesSnapshot.forEach(doc => {
            salesPerfData.schedules.push({ id: doc.id, ...doc.data() });
        });

        // 3. Load employees
        if (statusEl) statusEl.textContent = 'Loading employees...';
        const employeesRef = db.collection(window.FIREBASE_COLLECTIONS.employees || 'employees');
        const employeesSnapshot = await employeesRef.get();

        salesPerfData.employees = [];
        employeesSnapshot.forEach(doc => {
            salesPerfData.employees.push({ id: doc.id, ...doc.data() });
        });

        // 4. Fetch Shopify locations for mapping
        if (statusEl) statusEl.textContent = 'Loading store locations...';
        try {
            const locations = await window.fetchStoreLocations('vsu');
            salesPerfData.storeLocations = {};
            locations.forEach(loc => {
                // Map location name to our standard names
                const lowerName = loc.name.toLowerCase();
                for (const [key, value] of Object.entries(STORE_LOCATION_MAP)) {
                    if (lowerName.includes(key)) {
                        salesPerfData.storeLocations[loc.id] = value;
                        break;
                    }
                }
            });
        } catch (e) {
            console.warn('Could not fetch locations:', e);
        }

        // 5. Render the content
        renderSalesPerformanceContent();

    } catch (error) {
        console.error('Error loading sales performance data:', error);
        content.innerHTML = `
            <div class="loading-overlay">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ef4444;"></i>
                <div style="color: var(--text-primary); font-weight: 600;">Error Loading Data</div>
                <div style="color: var(--text-muted);">${error.message}</div>
                <button class="btn-primary" onclick="loadSalesPerformanceData()" style="margin-top: 16px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

/**
 * Process and render the sales performance content
 */
function renderSalesPerformanceContent() {
    const content = document.getElementById('sales-perf-content');
    if (!content) return;

    const orders = salesPerfData.orders;
    const schedules = salesPerfData.schedules;
    const employees = salesPerfData.employees;
    const selectedStore = salesPerfData.selectedStore;

    // Calculate hourly sales
    const hourlySales = {};
    for (let i = 0; i < 24; i++) {
        hourlySales[i] = { sales: 0, orders: 0 };
    }

    // Calculate sales by store
    const storeStats = {};

    // Calculate employee performance based on schedule attribution
    const employeePerf = {};

    // Process orders
    orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const hour = orderDate.getHours();
        const dateKey = formatDateInput(orderDate);
        const total = order.total || 0;

        // Add to hourly stats
        hourlySales[hour].sales += total;
        hourlySales[hour].orders += 1;

        // Find which store this order belongs to (from location or default)
        // For now, we'll attribute based on schedules for that time

        // Find employees who were scheduled during this order
        const orderTimeMinutes = hour * 60 + orderDate.getMinutes();

        // Get order location and normalize it for matching
        const orderLocation = order.location || null;
        const normalizeLocation = (loc) => {
            if (!loc) return '';
            return loc.toLowerCase().replace(/[^a-z0-9]/g, '');
        };
        const normalizedOrderLocation = normalizeLocation(orderLocation);

        // First, find ALL employees working during this order time AT THE SAME STORE
        const workingEmployees = schedules.filter(s => {
            if (s.date !== dateKey) return false;
            if (selectedStore !== 'all' && s.store !== selectedStore) return false;

            const startMinutes = timeToMinutes(s.startTime);
            const endMinutes = timeToMinutes(s.endTime);
            const isWorkingAtTime = orderTimeMinutes >= startMinutes && orderTimeMinutes < endMinutes;

            if (!isWorkingAtTime) return false;

            // If order has a location, only match employees at that location
            if (orderLocation) {
                const normalizedScheduleStore = normalizeLocation(s.store);
                // Check if the store names match (flexible matching)
                return normalizedScheduleStore.includes(normalizedOrderLocation) ||
                       normalizedOrderLocation.includes(normalizedScheduleStore);
            }

            return true;
        });

        // Divide the sale equally among working employees
        const numWorking = workingEmployees.length;
        if (numWorking > 0) {
            const salesPerEmployee = total / numWorking;
            const ordersPerEmployee = 1 / numWorking;

            workingEmployees.forEach(schedule => {
                const empId = schedule.employeeId;
                if (!employeePerf[empId]) {
                    const emp = employees.find(e => e.id === empId);
                    employeePerf[empId] = {
                        id: empId,
                        name: emp?.name || 'Unknown',
                        store: schedule.store,
                        sales: 0,
                        orders: 0,
                        hoursWorked: 0,
                        shifts: []
                    };
                }

                // Attribute proportional sale to the employee
                employeePerf[empId].sales += salesPerEmployee;
                employeePerf[empId].orders += ordersPerEmployee;

                // Track store stats (full amount per store, not divided)
                const store = schedule.store;
                if (!storeStats[store]) {
                    storeStats[store] = { sales: 0, orders: 0 };
                }
            });

            // Store stats - attribute to first employee's store (or could be based on order location)
            const primaryStore = workingEmployees[0].store;
            if (storeStats[primaryStore]) {
                storeStats[primaryStore].sales += total;
                storeStats[primaryStore].orders += 1;
            }
        }
    });

    // Calculate hours worked for each employee
    const processedShifts = new Set();
    schedules.forEach(schedule => {
        if (selectedStore !== 'all' && schedule.store !== selectedStore) return;

        const shiftKey = `${schedule.employeeId}-${schedule.date}-${schedule.shiftType}`;
        if (processedShifts.has(shiftKey)) return;
        processedShifts.add(shiftKey);

        const empId = schedule.employeeId;
        if (!employeePerf[empId]) {
            const emp = employees.find(e => e.id === empId);
            employeePerf[empId] = {
                id: empId,
                name: emp?.name || 'Unknown',
                store: schedule.store,
                sales: 0,
                orders: 0,
                hoursWorked: 0,
                shifts: []
            };
        }

        const hours = calculateShiftHours(schedule.startTime, schedule.endTime);
        employeePerf[empId].hoursWorked += hours;
        employeePerf[empId].shifts.push(schedule);
    });

    // Calculate totals
    const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Sort employees by sales for ranking
    const rankedEmployees = Object.values(employeePerf)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10);

    // Find peak hour
    let peakHour = 0;
    let peakSales = 0;
    Object.entries(hourlySales).forEach(([hour, data]) => {
        if (data.sales > peakSales) {
            peakSales = data.sales;
            peakHour = parseInt(hour);
        }
    });

    // Find max hourly sales for chart scaling
    const maxHourlySales = Math.max(...Object.values(hourlySales).map(h => h.sales), 1);

    // Generate colors for employees
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];

    content.innerHTML = `
        <!-- Summary Cards -->
        <div class="sales-perf-summary">
            <div class="summary-card highlight">
                <div class="summary-label">Total Sales</div>
                <div class="summary-value">$${totalSales.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Total Orders</div>
                <div class="summary-value">${totalOrders.toLocaleString()}</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Avg Order Value</div>
                <div class="summary-value">$${avgOrderValue.toFixed(2)}</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Peak Hour</div>
                <div class="summary-value">${formatHour(peakHour)}</div>
                <div class="summary-change">${hourlySales[peakHour].orders} orders</div>
            </div>
        </div>

        <div class="sales-perf-grid">
            <!-- Hourly Sales Chart -->
            <div class="perf-card">
                <div class="perf-card-header">
                    <div class="perf-card-title">
                        <i class="fas fa-clock" style="color: var(--accent-primary);"></i>
                        Sales by Hour
                    </div>
                </div>
                <div class="perf-card-body">
                    <div class="hourly-chart">
                        ${Object.entries(hourlySales).filter(([h]) => h >= 8 && h <= 22).map(([hour, data]) => {
                            const heightPercent = maxHourlySales > 0 ? (data.sales / maxHourlySales) * 100 : 0;
                            return `
                                <div class="hourly-bar" style="height: ${Math.max(heightPercent, 2)}%;">
                                    <div class="tooltip">
                                        <strong>${formatHour(parseInt(hour))}</strong><br>
                                        $${data.sales.toFixed(2)}<br>
                                        ${data.orders} orders
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="hourly-labels">
                        <span class="hourly-label">8am</span>
                        <span class="hourly-label">12pm</span>
                        <span class="hourly-label">4pm</span>
                        <span class="hourly-label">8pm</span>
                        <span class="hourly-label">10pm</span>
                    </div>
                </div>
            </div>

            <!-- Employee Ranking -->
            <div class="perf-card">
                <div class="perf-card-header">
                    <div class="perf-card-title">
                        <i class="fas fa-trophy" style="color: #fbbf24;"></i>
                        Top Performers
                    </div>
                </div>
                <div class="perf-card-body">
                    <div class="employee-ranking">
                        ${rankedEmployees.length > 0 ? rankedEmployees.map((emp, idx) => {
                            const posClass = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'normal';
                            const colorIndex = emp.name ? emp.name.charCodeAt(0) % colors.length : 0;
                            const initials = emp.name ? emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
                            const salesPerHour = emp.hoursWorked > 0 ? emp.sales / emp.hoursWorked : 0;
                            const isFirstPlace = idx === 0;

                            // Get employee photo from Firebase data
                            const fullEmp = employees.find(e => e.id === emp.id);
                            const hasPhoto = fullEmp?.photoURL || fullEmp?.photo;
                            const photoUrl = hasPhoto || null;

                            return `
                                <div class="ranking-item ${isFirstPlace ? 'first-place' : ''}" onclick="openEmployeePerformanceModal('${emp.id}')">
                                    <div class="ranking-position ${posClass}">${idx + 1}</div>
                                    <div class="ranking-avatar" style="background: ${colors[colorIndex]};">
                                        ${photoUrl ? `<img src="${photoUrl}" alt="${emp.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><span style="display:none;">${initials}</span>` : initials}
                                    </div>
                                    <div class="ranking-info">
                                        <div class="ranking-name">${emp.name}</div>
                                        <div class="ranking-store"><i class="fas fa-store" style="font-size: 10px;"></i> ${emp.store} · <i class="fas fa-clock" style="font-size: 10px;"></i> ${emp.hoursWorked.toFixed(1)}h</div>
                                    </div>
                                    <div class="ranking-stats">
                                        <div class="ranking-sales">$${emp.sales.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                        <div class="ranking-hours">$${salesPerHour.toFixed(2)}/hr</div>
                                    </div>
                                    <i class="fas fa-chevron-right" style="color: var(--text-muted); font-size: 12px; margin-left: 8px;"></i>
                                </div>
                            `;
                        }).join('') : `
                            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                                <i class="fas fa-users" style="font-size: 32px; margin-bottom: 12px; display: block;"></i>
                                No employee data for selected period
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>

        <!-- Store Comparison -->
        <div class="perf-card" style="margin-bottom: 24px;">
            <div class="perf-card-header">
                <div class="perf-card-title">
                    <i class="fas fa-store" style="color: #10b981;"></i>
                    Store Comparison
                </div>
            </div>
            <div class="perf-card-body">
                <div class="store-comparison">
                    ${Object.keys(storeStats).length > 0 ? Object.entries(storeStats)
                        .sort((a, b) => b[1].sales - a[1].sales)
                        .map(([store, stats]) => `
                            <div class="store-stat">
                                <div class="store-name">${store}</div>
                                <div class="store-value">$${stats.sales.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                <div class="store-orders">${stats.orders} orders</div>
                            </div>
                        `).join('') : `
                        <div style="text-align: center; padding: 20px; color: var(--text-muted); grid-column: 1 / -1;">
                            <i class="fas fa-store-slash" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                            No store data available. Make sure employees have schedules assigned.
                        </div>
                    `}
                </div>
            </div>
        </div>

        <!-- Detailed Schedule/Sales Table -->
        <div class="perf-card">
            <div class="perf-card-header">
                <div class="perf-card-title">
                    <i class="fas fa-table" style="color: var(--accent-primary);"></i>
                    Detailed Attribution
                </div>
            </div>
            <div class="perf-card-body" style="overflow-x: auto;">
                <table class="perf-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Store</th>
                            <th>Shifts</th>
                            <th>Hours</th>
                            <th style="text-align: right;">Sales</th>
                            <th style="text-align: right;">Orders</th>
                            <th style="text-align: right;">$/Hour</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.values(employeePerf).length > 0 ? Object.values(employeePerf)
                            .sort((a, b) => b.sales - a.sales)
                            .map((emp, idx) => {
                                const salesPerHour = emp.hoursWorked > 0 ? emp.sales / emp.hoursWorked : 0;
                                const shiftCount = emp.shifts.length;
                                const colorIndex = emp.name ? emp.name.charCodeAt(0) % colors.length : 0;
                                const initials = emp.name ? emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

                                // Get employee photo
                                const fullEmp = employees.find(e => e.id === emp.id);
                                const photoUrl = fullEmp?.photoURL || fullEmp?.photo || null;

                                // Rank medal
                                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';

                                return `
                                    <tr>
                                        <td>
                                            <div class="table-avatar" style="background: ${colors[colorIndex]};">
                                                ${photoUrl ? `<img src="${photoUrl}" alt="${emp.name}" onerror="this.style.display='none';" />` : initials}
                                            </div>
                                            <span style="font-weight: 600;">${medal} ${emp.name}</span>
                                        </td>
                                        <td><i class="fas fa-map-marker-alt" style="color: var(--text-muted); margin-right: 6px;"></i>${emp.store}</td>
                                        <td><span style="background: var(--bg-secondary); padding: 4px 8px; border-radius: 6px;">${shiftCount} shifts</span></td>
                                        <td>${emp.hoursWorked.toFixed(1)}h</td>
                                        <td style="text-align: right; font-weight: 700; color: var(--accent-primary);">$${emp.sales.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        <td style="text-align: right;">${emp.orders}</td>
                                        <td style="text-align: right; font-weight: 500;">$${salesPerHour.toFixed(2)}</td>
                                    </tr>
                                `;
                            }).join('') : `
                            <tr>
                                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                                    No schedule data found for the selected period.<br>
                                    <small>Add employee schedules in the Schedule module to see attribution.</small>
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Trigger confetti if we have a top performer with sales
    if (rankedEmployees.length > 0 && rankedEmployees[0].sales > 0) {
        setTimeout(() => triggerSalesPerfConfetti(), 800);
    }
}

/**
 * Convert time string (HH:MM) to minutes
 */
function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60) + (minutes || 0);
}

/**
 * Calculate hours between two times
 */
function calculateShiftHours(startTime, endTime) {
    if (!startTime || !endTime) return 0;
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    return (endMinutes - startMinutes) / 60;
}

/**
 * Format hour for display
 */
function formatHour(hour) {
    if (hour === 0) return '12am';
    if (hour === 12) return '12pm';
    if (hour < 12) return `${hour}am`;
    return `${hour - 12}pm`;
}

/**
 * Trigger confetti celebration for top performer
 */
function triggerSalesPerfConfetti() {
    const colors = ['#fbbf24', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#3b82f6'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

            // Random shapes
            if (Math.random() > 0.5) {
                confetti.style.borderRadius = '50%';
            }

            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

/**
 * Open employee performance detail modal
 */
function openEmployeePerformanceModal(employeeId) {
    const employees = salesPerfData.employees;
    const orders = salesPerfData.orders;
    const schedules = salesPerfData.schedules;

    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    // Get employee's schedules for the period
    const empSchedules = schedules.filter(s => s.employeeId === employeeId);

    // Calculate sales by day
    const salesByDay = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Initialize days
    dayNames.forEach(day => {
        salesByDay[day] = { sales: 0, orders: 0 };
    });

    // Calculate hourly sales for this employee
    const hourlyEmpSales = {};
    for (let i = 0; i < 24; i++) {
        hourlyEmpSales[i] = { sales: 0, orders: 0 };
    }

    // Process orders and attribute to this employee based on schedules
    let totalEmpSales = 0;
    let totalEmpOrders = 0;

    orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const hour = orderDate.getHours();
        const dateKey = formatDateInput(orderDate);
        const dayOfWeek = dayNames[orderDate.getDay()];
        const total = order.total || 0;
        const orderTimeMinutes = hour * 60 + orderDate.getMinutes();

        // Check if employee was working during this order
        const wasWorking = empSchedules.some(schedule => {
            if (schedule.date !== dateKey) return false;
            const startMinutes = timeToMinutes(schedule.startTime);
            const endMinutes = timeToMinutes(schedule.endTime);
            return orderTimeMinutes >= startMinutes && orderTimeMinutes < endMinutes;
        });

        if (wasWorking) {
            salesByDay[dayOfWeek].sales += total;
            salesByDay[dayOfWeek].orders += 1;
            hourlyEmpSales[hour].sales += total;
            hourlyEmpSales[hour].orders += 1;
            totalEmpSales += total;
            totalEmpOrders += 1;
        }
    });

    // Calculate total hours worked
    let totalHours = 0;
    empSchedules.forEach(schedule => {
        totalHours += calculateShiftHours(schedule.startTime, schedule.endTime);
    });

    const salesPerHour = totalHours > 0 ? totalEmpSales / totalHours : 0;

    // Find best day
    let bestDay = 'N/A';
    let bestDaySales = 0;
    Object.entries(salesByDay).forEach(([day, data]) => {
        if (data.sales > bestDaySales) {
            bestDaySales = data.sales;
            bestDay = day;
        }
    });

    // Find peak hour
    let peakHour = 0;
    let peakHourSales = 0;
    Object.entries(hourlyEmpSales).forEach(([hour, data]) => {
        if (data.sales > peakHourSales) {
            peakHourSales = data.sales;
            peakHour = parseInt(hour);
        }
    });

    // Get employee photo and color
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
    const colorIndex = employee.name ? employee.name.charCodeAt(0) % colors.length : 0;
    const initials = employee.name ? employee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
    const photoUrl = employee.photoURL || employee.photo || null;

    // Max for day chart scaling
    const maxDaySales = Math.max(...Object.values(salesByDay).map(d => d.sales), 1);
    const maxHourSales = Math.max(...Object.values(hourlyEmpSales).map(h => h.sales), 1);

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'employee-perf-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        backdrop-filter: blur(8px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: fadeIn 0.3s ease-out;
    `;

    modal.innerHTML = `
        <div style="
            background: var(--bg-card);
            border-radius: 24px;
            max-width: 700px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            animation: slideUp 0.4s ease-out;
            box-shadow: 0 25px 50px rgba(0,0,0,0.3);
        ">
            <!-- Header -->
            <div style="
                padding: 24px;
                background: linear-gradient(135deg, ${colors[colorIndex]}22, ${colors[colorIndex]}11);
                border-bottom: 1px solid var(--border-color);
                display: flex;
                align-items: center;
                gap: 16px;
                position: relative;
            ">
                <button onclick="closeEmployeePerformanceModal()" style="
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: var(--bg-secondary);
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    cursor: pointer;
                    color: var(--text-muted);
                    font-size: 16px;
                    transition: all 0.2s;
                " onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='var(--bg-secondary)'">
                    <i class="fas fa-times"></i>
                </button>

                <div style="
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    background: ${colors[colorIndex]};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    font-weight: 700;
                    color: white;
                    overflow: hidden;
                    box-shadow: 0 8px 24px ${colors[colorIndex]}44;
                ">
                    ${photoUrl ? `<img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none';" />` : ''}
                    <span style="${photoUrl ? 'display:none;' : ''}">${initials}</span>
                </div>

                <div>
                    <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: var(--text-primary);">${employee.name}</h2>
                    <div style="color: var(--text-muted); font-size: 14px; margin-top: 4px;">
                        <i class="fas fa-store"></i> ${employee.store || 'Multiple Stores'} · <i class="fas fa-calendar"></i> ${empSchedules.length} shifts
                    </div>
                </div>
            </div>

            <!-- Stats Summary -->
            <div style="
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
                padding: 20px 24px;
                background: var(--bg-secondary);
            ">
                <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: var(--accent-primary);">$${totalEmpSales.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Total Sales</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${totalEmpOrders}</div>
                    <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Orders</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${totalHours.toFixed(1)}h</div>
                    <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Hours</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: #10b981;">$${salesPerHour.toFixed(2)}</div>
                    <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Per Hour</div>
                </div>
            </div>

            <!-- Sales by Day -->
            <div style="padding: 24px;">
                <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-calendar-week" style="color: var(--accent-primary);"></i>
                    Sales by Day
                </h3>
                <div style="display: flex; align-items: flex-end; gap: 8px; height: 120px;">
                    ${dayNames.map(day => {
                        const data = salesByDay[day];
                        const heightPercent = maxDaySales > 0 ? (data.sales / maxDaySales) * 100 : 0;
                        const isToday = dayNames[new Date().getDay()] === day;
                        return `
                            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                <div style="font-size: 10px; color: var(--text-muted);">$${data.sales.toFixed(0)}</div>
                                <div style="
                                    width: 100%;
                                    height: ${Math.max(heightPercent, 4)}%;
                                    background: ${isToday ? 'linear-gradient(180deg, #10b981, #059669)' : 'linear-gradient(180deg, var(--accent-primary), #8b5cf6)'};
                                    border-radius: 6px 6px 0 0;
                                    transition: all 0.3s;
                                "></div>
                                <div style="font-size: 11px; font-weight: ${isToday ? '700' : '500'}; color: ${isToday ? '#10b981' : 'var(--text-muted)'};">${day}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Peak Performance -->
            <div style="padding: 0 24px 24px;">
                <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                ">
                    <div style="
                        background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05));
                        border: 1px solid rgba(251, 191, 36, 0.2);
                        border-radius: 16px;
                        padding: 16px;
                        text-align: center;
                    ">
                        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Best Day</div>
                        <div style="font-size: 20px; font-weight: 700; color: #f59e0b;">${bestDay}</div>
                        <div style="font-size: 12px; color: var(--text-muted);">$${bestDaySales.toFixed(2)}</div>
                    </div>
                    <div style="
                        background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05));
                        border: 1px solid rgba(139, 92, 246, 0.2);
                        border-radius: 16px;
                        padding: 16px;
                        text-align: center;
                    ">
                        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Peak Hour</div>
                        <div style="font-size: 20px; font-weight: 700; color: #8b5cf6;">${formatHour(peakHour)}</div>
                        <div style="font-size: 12px; color: var(--text-muted);">$${peakHourSales.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <!-- Shifts Worked -->
            <div style="padding: 0 24px 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-clock" style="color: #10b981;"></i>
                    Shifts This Period
                </h3>
                <div style="display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto;">
                    ${empSchedules.length > 0 ? empSchedules.map(shift => {
                        const shiftDate = new Date(shift.date + 'T12:00:00');
                        const dayName = shiftDate.toLocaleDateString('en-US', { weekday: 'short' });
                        const dateStr = shiftDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        const hours = calculateShiftHours(shift.startTime, shift.endTime);
                        const isOpening = shift.shiftType === 'opening';

                        // Calculate sales during this shift
                        let shiftSales = 0;
                        orders.forEach(order => {
                            const orderDate = new Date(order.createdAt);
                            const orderDateKey = formatDateInput(orderDate);
                            if (orderDateKey !== shift.date) return;
                            const orderTimeMinutes = orderDate.getHours() * 60 + orderDate.getMinutes();
                            const startMinutes = timeToMinutes(shift.startTime);
                            const endMinutes = timeToMinutes(shift.endTime);
                            if (orderTimeMinutes >= startMinutes && orderTimeMinutes < endMinutes) {
                                shiftSales += order.total || 0;
                            }
                        });

                        return `
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 12px;
                                padding: 12px;
                                background: var(--bg-secondary);
                                border-radius: 12px;
                            ">
                                <div style="
                                    width: 44px;
                                    height: 44px;
                                    background: ${isOpening ? '#fef3c7' : '#dbeafe'};
                                    border-radius: 10px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    flex-direction: column;
                                ">
                                    <div style="font-size: 12px; font-weight: 700; color: ${isOpening ? '#d97706' : '#2563eb'};">${dayName}</div>
                                    <div style="font-size: 10px; color: ${isOpening ? '#d97706' : '#2563eb'};">${dateStr.split(' ')[1]}</div>
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">${shift.store}</div>
                                    <div style="font-size: 12px; color: var(--text-muted);">
                                        ${shift.startTime} - ${shift.endTime} · ${hours.toFixed(1)}h
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 14px; font-weight: 700; color: var(--accent-primary);">$${shiftSales.toFixed(2)}</div>
                                    <div style="font-size: 10px; color: var(--text-muted);">${(shiftSales / hours).toFixed(2)}/hr</div>
                                </div>
                            </div>
                        `;
                    }).join('') : `
                        <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                            No shifts recorded for this period
                        </div>
                    `}
                </div>
            </div>
        </div>

        <style>
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
    `;

    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeEmployeePerformanceModal();
        }
    });

    // Close on Escape
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeEmployeePerformanceModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

/**
 * Close employee performance modal
 */
function closeEmployeePerformanceModal() {
    const modal = document.getElementById('employee-perf-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.2s ease-out forwards';
        setTimeout(() => modal.remove(), 200);
    }
}

// Make functions globally available
window.renderSalesPerformance = renderSalesPerformance;
window.loadSalesPerformanceData = loadSalesPerformanceData;
window.updateSalesPerfStore = updateSalesPerfStore;
window.updateSalesPerfDateRange = updateSalesPerfDateRange;
window.triggerSalesPerfConfetti = triggerSalesPerfConfetti;
window.openEmployeePerformanceModal = openEmployeePerformanceModal;
window.closeEmployeePerformanceModal = closeEmployeePerformanceModal;

