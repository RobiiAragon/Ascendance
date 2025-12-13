/**
 * Shopify Sales Analytics - Frontend API Connection
 * Direct connection to Shopify REST API from frontend (for testing purposes)
 *
 * IMPORTANT: This keeps API credentials in frontend code.
 * Only use for testing/development. For production, use a backend proxy.
 */

// Shopify API Configuration
const SHOPIFY_CONFIG = {
    storeUrl: 'k1xm3v-v0.myshopify.com',
    accessToken: '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',
    apiVersion: '2024-01'
};

// CORS Proxy Configuration
const CORS_PROXY = 'https://corsproxy.io/?';

/**
 * Fetch data from Shopify API with CORS proxy
 */
async function fetchShopifyAPI(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `https://${SHOPIFY_CONFIG.storeUrl}/admin/api/${SHOPIFY_CONFIG.apiVersion}/${endpoint}${queryString ? '?' + queryString : ''}`;

    try {
        const response = await fetch(CORS_PROXY + encodeURIComponent(url), {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_CONFIG.accessToken
            }
        });

        if (!response.ok) {
            throw new Error(`Shopify API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Shopify API request failed:', error);
        throw error;
    }
}

/**
 * Fetch all orders within a date range
 * Uses chunking to avoid 250 order limit
 */
async function fetchAllOrders(createdAtMin, createdAtMax, onProgress = null) {
    const allOrders = [];
    const start = new Date(createdAtMin);
    const end = new Date(createdAtMax);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    // Determine chunk size based on total days
    let daysPerBlock;
    if (totalDays <= 1) {
        daysPerBlock = 1;
    } else if (totalDays <= 7) {
        daysPerBlock = Math.ceil(totalDays / 3);
    } else {
        daysPerBlock = Math.ceil(totalDays / 10);
    }

    let currentStart = new Date(start);
    let blockNumber = 0;
    const totalBlocks = Math.ceil(totalDays / daysPerBlock);

    while (currentStart < end) {
        blockNumber++;

        let currentEnd = new Date(currentStart);
        currentEnd.setDate(currentEnd.getDate() + daysPerBlock);

        if (currentEnd > end) {
            currentEnd = new Date(end);
        }

        const blockStart = currentStart.toISOString();
        const blockEnd = currentEnd.toISOString();

        // Report progress
        if (onProgress) {
            const progress = Math.round((blockNumber / totalBlocks) * 90);
            onProgress(progress, `Loading block ${blockNumber} of ${totalBlocks}...`);
        }

        try {
            const data = await fetchShopifyAPI('orders.json', {
                status: 'any',
                created_at_min: blockStart,
                created_at_max: blockEnd,
                limit: 250
            });

            allOrders.push(...data.orders);

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error) {
            console.error(`Error fetching block ${blockNumber}:`, error);
        }

        currentStart = new Date(currentEnd);
    }

    return allOrders;
}

/**
 * Get date range based on period selection
 */
function getDateRange(period) {
    const now = new Date();
    let since, until;

    switch(period) {
        case 'month':
            since = new Date(now.getFullYear(), now.getMonth(), 1);
            until = new Date();
            break;
        case 'week':
            since = new Date(now);
            since.setDate(now.getDate() - now.getDay());
            since.setHours(0, 0, 0, 0);
            until = new Date();
            break;
        case 'today':
            since = new Date(now);
            since.setHours(0, 0, 0, 0);
            until = new Date();
            break;
        case 'year':
            since = new Date(now.getFullYear(), 0, 1);
            until = new Date();
            break;
        default:
            since = new Date(now.getFullYear(), now.getMonth(), 1);
            until = new Date();
    }

    return {
        since: since.toISOString(),
        until: until.toISOString()
    };
}

/**
 * Process orders data into analytics format
 */
function processOrdersData(orders) {
    let totalSales = 0;
    let totalTax = 0;
    let totalOrders = orders.length;
    const dailyData = {};
    const hourlyData = {};
    const monthlyData = {};

    orders.forEach(order => {
        const orderDate = new Date(order.created_at);
        const day = orderDate.toISOString().split('T')[0];
        const hour = orderDate.getHours();
        const month = orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        const amount = parseFloat(order.total_price);
        const tax = parseFloat(order.total_tax || 0);

        totalSales += amount;
        totalTax += tax;

        // Daily aggregation
        if (!dailyData[day]) {
            dailyData[day] = { sales: 0, orders: 0, tax: 0 };
        }
        dailyData[day].sales += amount;
        dailyData[day].orders += 1;
        dailyData[day].tax += tax;

        // Hourly aggregation
        if (!hourlyData[hour]) {
            hourlyData[hour] = { sales: 0, orders: 0 };
        }
        hourlyData[hour].sales += amount;
        hourlyData[hour].orders += 1;

        // Monthly aggregation
        if (!monthlyData[month]) {
            monthlyData[month] = { sales: 0, orders: 0, tax: 0 };
        }
        monthlyData[month].sales += amount;
        monthlyData[month].orders += 1;
        monthlyData[month].tax += tax;
    });

    return {
        summary: {
            totalSales: totalSales.toFixed(2),
            netSales: (totalSales - totalTax).toFixed(2),
            totalTax: totalTax.toFixed(2),
            totalOrders,
            avgOrderValue: totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : '0.00',
            currency: orders.length > 0 ? orders[0].currency : 'USD'
        },
        daily: dailyData,
        hourly: hourlyData,
        monthly: monthlyData,
        recentOrders: orders.slice(0, 10).map(order => ({
            name: order.name,
            createdAt: order.created_at,
            status: order.financial_status?.toUpperCase() || 'PENDING',
            fulfillment: order.fulfillment_status?.toUpperCase() || 'UNFULFILLED',
            total: parseFloat(order.total_price),
            customer: order.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : 'Guest'
        }))
    };
}

/**
 * Fetch and process sales analytics
 */
async function fetchSalesAnalytics(period = 'month', onProgress = null) {
    const dateRange = getDateRange(period);

    if (onProgress) {
        onProgress(10, 'Connecting to Shopify...');
    }

    const orders = await fetchAllOrders(dateRange.since, dateRange.until, onProgress);

    if (onProgress) {
        onProgress(95, 'Processing data...');
    }

    const analytics = processOrdersData(orders);

    if (onProgress) {
        onProgress(100, 'Complete!');
    }

    return analytics;
}

/**
 * Format currency helper
 */
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(parseFloat(amount));
}

/**
 * Format date and time helper
 */
function formatDateTime(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

console.log('✅ Shopify Analytics loaded - Frontend API connection ready');
