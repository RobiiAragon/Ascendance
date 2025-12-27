/**
 * Shopify Sales Analytics - Frontend API Connection
 * Direct connection to Shopify REST API from frontend (for testing purposes)
 *
 * IMPORTANT: This keeps API credentials in frontend code.
 * Only use for testing/development. For production, use a backend proxy.
 */

// Multi-Store Configuration
const STORES_CONFIG = {
    vsu: {
        key: 'vsu',
        name: 'Vape Smoke Universe',
        shortName: 'VSU',
        storeUrl: 'v-s-u.myshopify.com',
        accessToken: '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',
        hasMultipleLocations: true,
        locations: ['Miramar', 'Chula Vista', 'Morena', 'North Park', 'Kearny Mesa']
    },
    loyalvaper: {
        key: 'loyalvaper',
        name: 'Loyal Vaper',
        shortName: 'Loyal Vaper',
        storeUrl: 'k1xm3v-v0.myshopify.com',
        accessToken: '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',
        hasMultipleLocations: false
    },
    miramarwine: {
        key: 'miramarwine',
        name: 'Miramar Wine & Liquor',
        shortName: 'Miramar Wine & Liquor',
        storeUrl: 'a43265-2.myshopify.com',
        accessToken: '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',
        hasMultipleLocations: false
    }
};

const API_VERSION = '2024-01';

// Store location ID cache
const locationCache = {};

// =============================================================================
// LOCAL CACHE SYSTEM
// =============================================================================
//
// Caches API responses in localStorage to reduce API calls and improve performance.
// Each cache entry has a TTL (Time-To-Live) after which it's considered stale.
//
// Cache keys format: 'shopify_cache_{type}_{storeKey}_{params}'
// Cache structure: { data: <response>, timestamp: <unix_ms>, ttl: <ms> }
//
// =============================================================================

const CACHE_CONFIG = {
    // TTL values in milliseconds
    TTL: {
        analytics: 5 * 60 * 1000,      // 5 minutes for analytics (sales data changes frequently)
        analyticsBulk: 10 * 60 * 1000, // 10 minutes for bulk analytics (large queries)
        inventory: 15 * 60 * 1000,     // 15 minutes for inventory
        locations: 60 * 60 * 1000      // 1 hour for locations (rarely changes)
    },
    // Prefix for all cache keys
    PREFIX: 'shopify_cache_',
    // Max cache entries before cleanup
    MAX_ENTRIES: 50
};

/**
 * Generate a cache key from parameters
 * @param {string} type - Cache type (analytics, inventory, locations)
 * @param {Object} params - Parameters to include in key
 * @returns {string} Cache key
 */
function generateCacheKey(type, params = {}) {
    const paramStr = Object.entries(params)
        .filter(([_, v]) => v !== null && v !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('_');
    return `${CACHE_CONFIG.PREFIX}${type}_${paramStr}`;
}

/**
 * Get data from cache if valid
 * @param {string} key - Cache key
 * @returns {Object|null} Cached data or null if not found/expired
 */
function getFromCache(key) {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp, ttl } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        if (age > ttl) {
            console.log(`🗑️ [CACHE] Expired: ${key} (age: ${Math.round(age / 1000)}s, ttl: ${Math.round(ttl / 1000)}s)`);
            localStorage.removeItem(key);
            return null;
        }

        console.log(`✅ [CACHE] Hit: ${key} (age: ${Math.round(age / 1000)}s)`);
        return { data, fromCache: true, cacheAge: age };
    } catch (error) {
        console.warn('⚠️ [CACHE] Error reading cache:', error);
        return null;
    }
}

/**
 * Save data to cache
 * @param {string} key - Cache key
 * @param {*} data - Data to cache
 * @param {number} ttl - Time-to-live in milliseconds
 */
function saveToCache(key, data, ttl) {
    try {
        const cacheEntry = {
            data,
            timestamp: Date.now(),
            ttl
        };
        localStorage.setItem(key, JSON.stringify(cacheEntry));
        console.log(`💾 [CACHE] Saved: ${key} (ttl: ${Math.round(ttl / 1000)}s)`);

        // Cleanup old entries if needed
        cleanupCache();
    } catch (error) {
        console.warn('⚠️ [CACHE] Error saving to cache:', error);
        // If localStorage is full, clear old cache entries
        if (error.name === 'QuotaExceededError') {
            clearAllCache();
        }
    }
}

/**
 * Clear all Shopify cache entries
 */
function clearAllCache() {
    try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_CONFIG.PREFIX));
        keys.forEach(k => localStorage.removeItem(k));
        console.log(`🧹 [CACHE] Cleared ${keys.length} cache entries`);
    } catch (error) {
        console.warn('⚠️ [CACHE] Error clearing cache:', error);
    }
}

/**
 * Clear cache for a specific store
 * @param {string} storeKey - Store identifier
 */
function clearStoreCache(storeKey) {
    try {
        const keys = Object.keys(localStorage).filter(k =>
            k.startsWith(CACHE_CONFIG.PREFIX) && k.includes(storeKey)
        );
        keys.forEach(k => localStorage.removeItem(k));
        console.log(`🧹 [CACHE] Cleared ${keys.length} cache entries for store: ${storeKey}`);
    } catch (error) {
        console.warn('⚠️ [CACHE] Error clearing store cache:', error);
    }
}

/**
 * Cleanup old cache entries to stay under MAX_ENTRIES
 */
function cleanupCache() {
    try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_CONFIG.PREFIX));

        if (keys.length <= CACHE_CONFIG.MAX_ENTRIES) return;

        // Get entries with timestamps
        const entries = keys.map(key => {
            try {
                const cached = JSON.parse(localStorage.getItem(key));
                return { key, timestamp: cached?.timestamp || 0 };
            } catch {
                return { key, timestamp: 0 };
            }
        });

        // Sort by timestamp (oldest first) and remove excess
        entries.sort((a, b) => a.timestamp - b.timestamp);
        const toRemove = entries.slice(0, entries.length - CACHE_CONFIG.MAX_ENTRIES);

        toRemove.forEach(({ key }) => localStorage.removeItem(key));
        console.log(`🧹 [CACHE] Cleaned up ${toRemove.length} old entries`);
    } catch (error) {
        console.warn('⚠️ [CACHE] Error during cleanup:', error);
    }
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
function getCacheStats() {
    try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_CONFIG.PREFIX));
        let totalSize = 0;
        let validEntries = 0;
        let expiredEntries = 0;

        keys.forEach(key => {
            const item = localStorage.getItem(key);
            totalSize += item ? item.length : 0;

            try {
                const { timestamp, ttl } = JSON.parse(item);
                if (Date.now() - timestamp <= ttl) {
                    validEntries++;
                } else {
                    expiredEntries++;
                }
            } catch {
                expiredEntries++;
            }
        });

        return {
            totalEntries: keys.length,
            validEntries,
            expiredEntries,
            totalSizeKB: Math.round(totalSize / 1024 * 100) / 100
        };
    } catch (error) {
        return { error: error.message };
    }
}

// =============================================================================
// GRAPHQL BULK OPERATIONS
// =============================================================================
//
// GraphQL Bulk Operations allow fetching large datasets (unlimited orders) without
// hitting Shopify's 250-per-page or 25,000 pagination caps.
//
// How it works:
// 1. Start a bulk operation with bulkOperationRunQuery mutation
// 2. Poll currentBulkOperation until status is COMPLETED
// 3. Download NDJSON file from the returned URL
// 4. Parse each line (one JSON object per order) and aggregate
//
// Benefits:
// - No order count limits
// - Handles months/years of data
// - Preserves full order detail (taxes, line items, etc.)
// =============================================================================

/**
 * Build the GraphQL query string for bulk order export
 *
 * @param {string} startDate - ISO date string for start of range
 * @param {string} endDate - ISO date string for end of range
 * @returns {string} GraphQL query string for bulk operation
 *
 * This query fetches:
 * - Order basics (id, name, createdAt, financial status, fulfillment status)
 * - Customer info
 * - Totals (currentTotalPriceSet, currentTotalTaxSet) - reflects refunds/edits
 * - Order-level tax lines (for CECET vs Sales Tax breakdown)
 * - Line items with their tax lines (for detailed per-product breakdown)
 */
function buildBulkOrdersQuery(startDate, endDate) {
    // Format dates for Shopify search syntax
    const startISO = new Date(startDate).toISOString().split('T')[0];
    const endISO = new Date(endDate).toISOString().split('T')[0];

    return `
        {
            orders(query: "created_at:>=${startISO} created_at:<=${endISO}") {
                edges {
                    node {
                        id
                        name
                        createdAt
                        displayFinancialStatus
                        displayFulfillmentStatus
                        currencyCode
                        paymentGatewayNames

                        customer {
                            firstName
                            lastName
                            email
                        }

                        currentTotalPriceSet {
                            shopMoney {
                                amount
                                currencyCode
                            }
                        }

                        currentTotalTaxSet {
                            shopMoney {
                                amount
                                currencyCode
                            }
                        }

                        taxLines {
                            title
                            rate
                            priceSet {
                                shopMoney {
                                    amount
                                    currencyCode
                                }
                            }
                        }

                        fulfillmentOrders(first: 5) {
                            edges {
                                node {
                                    id
                                    assignedLocation {
                                        location {
                                            id
                                            name
                                        }
                                    }
                                }
                            }
                        }

                        lineItems(first: 50) {
                            edges {
                                node {
                                    id
                                    name
                                    sku
                                    quantity
                                    originalUnitPriceSet {
                                        shopMoney {
                                            amount
                                            currencyCode
                                        }
                                    }
                                    taxLines {
                                        title
                                        rate
                                        priceSet {
                                            shopMoney {
                                                amount
                                                currencyCode
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;
}

/**
 * Cancel the current bulk operation for a store
 *
 * @param {string} storeKey - Store identifier ('vsu', 'loyalvaper', etc.)
 * @returns {Promise<boolean>} True if cancelled successfully, false otherwise
 */
async function cancelBulkOperation(storeKey = 'vsu') {
    const storeConfig = STORES_CONFIG[storeKey];
    if (!storeConfig) {
        console.warn('⚠️ [BULK CANCEL] Invalid store key:', storeKey);
        return false;
    }

    const graphqlUrl = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;

    const mutation = `
        mutation {
            bulkOperationCancel {
                bulkOperation {
                    id
                    status
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `;

    try {
        console.log('🛑 [BULK CANCEL] Cancelling bulk operation for:', storeConfig.name);

        const response = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': storeConfig.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: mutation })
        });

        if (!response.ok) {
            console.warn('⚠️ [BULK CANCEL] Request failed:', response.status);
            return false;
        }

        const result = await response.json();

        if (result.errors) {
            console.warn('⚠️ [BULK CANCEL] GraphQL errors:', result.errors);
            return false;
        }

        const { bulkOperation, userErrors } = result.data.bulkOperationCancel;

        if (userErrors && userErrors.length > 0) {
            // "No bulk operation in progress" is not really an error
            const noOpError = userErrors.find(e => e.message.includes('No bulk operation'));
            if (noOpError) {
                console.log('ℹ️ [BULK CANCEL] No bulk operation was in progress');
                return true;
            }
            console.warn('⚠️ [BULK CANCEL] User errors:', userErrors);
            return false;
        }

        if (bulkOperation) {
            console.log(`✅ [BULK CANCEL] Cancelled: ${bulkOperation.id} (${bulkOperation.status})`);
        }

        return true;

    } catch (error) {
        console.error('❌ [BULK CANCEL] Failed:', error);
        return false;
    }
}

/**
 * Start a GraphQL Bulk Operation to export orders
 * Automatically cancels any existing bulk operation before starting a new one
 *
 * @param {string} startDate - Start of date range (ISO string)
 * @param {string} endDate - End of date range (ISO string)
 * @param {Object} storeConfig - Store configuration object
 * @returns {Promise<Object>} Bulk operation info { id, status } or throws error
 */
async function startBulkOrdersExport(startDate, endDate, storeConfig) {
    console.log('📦 [BULK START] Starting bulk export for:', { startDate, endDate, store: storeConfig.name });

    const graphqlUrl = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;

    // Auto-cancel any existing bulk operation first
    console.log('🛑 [BULK START] Checking for existing bulk operation...');
    await cancelBulkOperation(storeConfig.key);

    const innerQuery = buildBulkOrdersQuery(startDate, endDate);
    console.log('📝 [BULK START] GraphQL query built for date range');

    const mutation = `
        mutation {
            bulkOperationRunQuery(
                query: """${innerQuery}"""
            ) {
                bulkOperation {
                    id
                    status
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `;

    try {
        const response = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': storeConfig.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: mutation })
        });

        if (!response.ok) {
            throw new Error(`Bulk operation start failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (result.errors) {
            throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
        }

        const { bulkOperation, userErrors } = result.data.bulkOperationRunQuery;

        if (userErrors && userErrors.length > 0) {
            // Check if it's a "bulk operation already in progress" error
            const inProgressError = userErrors.find(e =>
                e.message.toLowerCase().includes('already') ||
                e.message.toLowerCase().includes('in progress')
            );
            if (inProgressError) {
                console.log('⏳ [BULK START] Another operation in progress, waiting and retrying...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                await cancelBulkOperation(storeConfig.key);
                // Retry once
                return startBulkOrdersExport(startDate, endDate, storeConfig);
            }
            throw new Error(`User errors: ${userErrors.map(e => e.message).join(', ')}`);
        }

        if (!bulkOperation) {
            throw new Error('No bulk operation returned');
        }

        console.log(`📦 Bulk operation started: ${bulkOperation.id} (${bulkOperation.status})`);
        return bulkOperation;

    } catch (error) {
        console.error('❌ Failed to start bulk operation:', error);
        throw error;
    }
}

/**
 * Poll the current bulk operation status until completion
 *
 * @param {Object} storeConfig - Store configuration object
 * @param {Function} onProgress - Progress callback (percent, message)
 * @param {number} maxAttempts - Maximum polling attempts (default: 360 = ~30 minutes)
 * @param {number} pollInterval - Milliseconds between polls (default: 5000 = 5 seconds)
 * @returns {Promise<Object>} Completed bulk operation { id, status, url, objectCount }
 */
async function pollBulkOperation(storeConfig, onProgress = null, maxAttempts = 360, pollInterval = 5000) {
    const graphqlUrl = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;

    const query = `
        query {
            currentBulkOperation {
                id
                status
                errorCode
                url
                objectCount
                fileSize
                createdAt
                completedAt
            }
        }
    `;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const response = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
                method: 'POST',
                headers: {
                    'X-Shopify-Access-Token': storeConfig.accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });

            if (!response.ok) {
                throw new Error(`Poll request failed: ${response.status}`);
            }

            const result = await response.json();
            const operation = result.data?.currentBulkOperation;

            if (!operation) {
                throw new Error('No bulk operation found');
            }

            const { status, url, objectCount, errorCode } = operation;

            // Report progress
            if (onProgress) {
                const progressPercent = Math.min(10 + (attempt / maxAttempts) * 70, 80);
                onProgress(Math.round(progressPercent), `Bulk export: ${status} (${objectCount || 0} objects)...`);
            }

            console.log(`📊 Bulk operation status: ${status} (attempt ${attempt}/${maxAttempts})`);

            // Check completion states
            if (status === 'COMPLETED') {
                console.log(`✅ Bulk operation completed! URL: ${url}, Objects: ${objectCount}`);
                return operation;
            }

            if (status === 'FAILED') {
                throw new Error(`Bulk operation failed: ${errorCode || 'Unknown error'}`);
            }

            if (status === 'CANCELED') {
                throw new Error('Bulk operation was canceled');
            }

            // Still running, wait and poll again
            await new Promise(resolve => setTimeout(resolve, pollInterval));

        } catch (error) {
            console.error(`❌ Poll attempt ${attempt} failed:`, error);
            if (attempt === maxAttempts) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
    }

    throw new Error('Bulk operation timed out');
}

/**
 * Download and parse NDJSON file from bulk operation
 *
 * @param {string} url - URL to the NDJSON file
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} Array of order objects
 *
 * NDJSON format: Each line is a separate JSON object
 * For orders with line items, Shopify outputs:
 * - Parent order object (with __parentId: null)
 * - Child line item objects (with __parentId: order gid)
 */
async function downloadAndParseBulkData(url, onProgress = null) {
    console.log('📥 [BULK DOWNLOAD] Starting download from:', url);

    if (onProgress) {
        onProgress(82, 'Downloading bulk data...');
    }

    // List of CORS proxies to try (some work better with Google Cloud Storage URLs)
    const corsProxies = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://cors-anywhere.herokuapp.com/',
        '' // Try direct fetch as last resort (may work if CORS headers are present)
    ];

    let lastError = null;
    let text = null;

    for (const proxy of corsProxies) {
        try {
            const fetchUrl = proxy ? proxy + encodeURIComponent(url) : url;
            console.log(`📥 [BULK DOWNLOAD] Trying proxy: ${proxy || '(direct)'}`);

            const response = await fetch(fetchUrl);

            if (!response.ok) {
                console.warn(`⚠️ [BULK DOWNLOAD] Proxy failed (${response.status}): ${proxy || '(direct)'}`);
                lastError = new Error(`Download failed: ${response.status}`);
                continue;
            }

            text = await response.text();
            console.log(`✅ [BULK DOWNLOAD] Success with proxy: ${proxy || '(direct)'}`);
            break;

        } catch (proxyError) {
            console.warn(`⚠️ [BULK DOWNLOAD] Proxy error: ${proxy || '(direct)'}`, proxyError.message);
            lastError = proxyError;
        }
    }

    if (!text) {
        console.error('❌ [BULK DOWNLOAD] All proxies failed');
        throw lastError || new Error('All CORS proxies failed to download bulk data');
    }

    try {
        console.log(`📄 [BULK DOWNLOAD] Received ${text.length} bytes`);

        const lines = text.trim().split('\n').filter(line => line.trim());
        console.log(`📋 [BULK DOWNLOAD] Total NDJSON lines: ${lines.length}`);

        if (onProgress) {
            onProgress(85, `Parsing ${lines.length} records...`);
        }

        // Parse NDJSON - each line is a JSON object
        // Shopify bulk returns orders and their nested objects as separate lines:
        // - Orders have no __parentId (or __parentId = null)
        // - Line items have __parentId = order gid
        // - Fulfillment orders have __parentId = order gid
        const ordersMap = new Map();
        const childObjectsBuffer = [];

        for (const line of lines) {
            try {
                const obj = JSON.parse(line);

                if (obj.__parentId) {
                    // This is a child object (line item, fulfillment order, etc.) - buffer it
                    childObjectsBuffer.push(obj);
                } else if (obj.id && obj.id.includes('Order') && !obj.id.includes('FulfillmentOrder')) {
                    // This is the main order object
                    ordersMap.set(obj.id, {
                        ...obj,
                        _lineItems: [],
                        _fulfillmentOrders: []
                    });
                }
            } catch (parseError) {
                console.warn('Failed to parse line:', line, parseError);
            }
        }

        // Associate child objects with their parent orders
        for (const childObj of childObjectsBuffer) {
            const parentOrder = ordersMap.get(childObj.__parentId);
            if (parentOrder) {
                // Determine type of child object
                if (childObj.id && childObj.id.includes('FulfillmentOrder')) {
                    // This is a fulfillment order
                    parentOrder._fulfillmentOrders.push(childObj);
                } else if (childObj.id && childObj.id.includes('LineItem')) {
                    // This is a line item
                    parentOrder._lineItems.push(childObj);
                } else if (childObj.name || childObj.sku || childObj.quantity !== undefined) {
                    // Fallback: looks like a line item based on properties
                    parentOrder._lineItems.push(childObj);
                } else if (childObj.assignedLocation) {
                    // Fallback: looks like a fulfillment order based on properties
                    parentOrder._fulfillmentOrders.push(childObj);
                }
            }
        }

        const orders = Array.from(ordersMap.values());
        console.log(`📦 Parsed ${orders.length} orders from bulk data`);

        // Log sample for debugging location data
        if (orders.length > 0) {
            const sampleOrder = orders[0];
            console.log(`📍 Sample order fulfillment data:`, {
                orderName: sampleOrder.name,
                fulfillmentOrders: sampleOrder._fulfillmentOrders?.length || 0,
                hasInlineData: !!sampleOrder.fulfillmentOrders?.nodes
            });
        }

        return orders;

    } catch (error) {
        console.error('❌ Failed to download/parse bulk data:', error);
        throw error;
    }
}

/**
 * Transform bulk GraphQL order data to match existing analytics format
 *
 * @param {Array} bulkOrders - Orders from bulk operation
 * @param {string|null} locationId - Optional location ID to filter by (e.g., "gid://shopify/Location/12345")
 * @returns {Object} Analytics data in existing format
 *
 * This ensures backward compatibility with the existing UI that expects:
 * - summary: { totalSales, netSales, totalTax, totalCecetTax, totalSalesTax, totalOrders, avgOrderValue, currency }
 * - daily: { [date]: { sales, orders, tax, cecetTax, salesTax } }
 * - hourly: { [hour]: { sales, orders, cecetTax, salesTax } }
 * - monthly: { [month]: { sales, orders, tax, cecetTax, salesTax } }
 * - recentOrders: Array of order objects with detailed info
 */
function transformBulkDataToAnalytics(bulkOrders, locationId = null) {
    let totalSales = 0;
    let totalTax = 0;
    let totalCecetTax = 0;
    let totalSalesTax = 0;
    let totalCashSales = 0;
    let totalCardSales = 0;
    let totalCashOrders = 0;
    let totalCardOrders = 0;
    const dailyData = {};
    const hourlyData = {};
    const monthlyData = {};

    /**
     * Determine if payment gateways indicate a cash payment
     * @param {Array<string>} gateways - Array of payment gateway names
     * @returns {boolean} True if payment was cash
     */
    function isCashPayment(gateways) {
        if (!gateways || !Array.isArray(gateways) || gateways.length === 0) {
            return false;
        }
        // Check if any gateway name indicates cash payment
        return gateways.some(name => {
            const lower = (name || '').toLowerCase();
            return lower.includes('cash') ||
                   lower.includes('cod') ||
                   lower.includes('manual') ||
                   lower.includes('efectivo'); // Spanish for cash
        });
    }

    /**
     * Check if an order is fulfilled from the specified location
     * @param {Object} order - Order object with fulfillmentOrders
     * @param {string} targetLocationId - Location ID to match (can be numeric or full gid)
     * @returns {boolean} True if order is from the specified location
     */
    function isOrderFromLocation(order, targetLocationId) {
        if (!targetLocationId) return true; // No filter = include all

        // Get fulfillment orders from various possible sources:
        // 1. _fulfillmentOrders - parsed from NDJSON child objects
        // 2. fulfillmentOrders.edges - inline GraphQL response (edges > node format)
        // 3. fulfillmentOrders.nodes - inline GraphQL response (nodes format, legacy)
        let fulfillmentOrders = [];

        if (order._fulfillmentOrders && order._fulfillmentOrders.length > 0) {
            fulfillmentOrders = order._fulfillmentOrders;
        } else if (order.fulfillmentOrders?.edges) {
            // Extract nodes from edges format
            fulfillmentOrders = order.fulfillmentOrders.edges.map(edge => edge.node);
        } else if (order.fulfillmentOrders?.nodes) {
            fulfillmentOrders = order.fulfillmentOrders.nodes;
        }

        if (fulfillmentOrders.length === 0) {
            // No fulfillment orders - this order won't match any location filter
            return false;
        }

        // Normalize the target location ID for comparison
        // User might pass "12345" or "gid://shopify/Location/12345"
        const normalizedTarget = targetLocationId.includes('gid://')
            ? targetLocationId
            : `gid://shopify/Location/${targetLocationId}`;
        const numericTarget = targetLocationId.replace(/\D/g, ''); // Extract just numbers

        // Check if any fulfillment order is assigned to the target location
        return fulfillmentOrders.some(fo => {
            const locationGid = fo.assignedLocation?.location?.id;
            if (!locationGid) return false;

            // Match by full gid or numeric ID
            const numericLocation = locationGid.replace(/\D/g, '');
            return locationGid === normalizedTarget || numericLocation === numericTarget;
        });
    }

    // Filter orders by location if specified
    let filteredOrders = bulkOrders;
    if (locationId) {
        const originalCount = bulkOrders.length;
        filteredOrders = bulkOrders.filter(order => isOrderFromLocation(order, locationId));
        console.log(`📍 [LOCATION FILTER] Filtered ${originalCount} orders → ${filteredOrders.length} orders for location ${locationId}`);
    }

    const recentOrders = filteredOrders.map(order => {
        const orderDate = new Date(order.createdAt);
        const day = orderDate.toISOString().split('T')[0];
        const hour = orderDate.getHours();
        const month = orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

        // Get totals from GraphQL response
        const amount = parseFloat(order.currentTotalPriceSet?.shopMoney?.amount || 0);
        const tax = parseFloat(order.currentTotalTaxSet?.shopMoney?.amount || 0);

        // Parse tax breakdown from taxLines
        const taxBreakdown = parseTaxBreakdown(order.taxLines || []);
        const cecetTax = taxBreakdown.cecetTax;
        const salesTax = taxBreakdown.salesTax;

        // Determine payment method from paymentGatewayNames
        const paymentGateways = order.paymentGatewayNames || [];
        const isCash = isCashPayment(paymentGateways);

        // Accumulate totals
        totalSales += amount;
        totalTax += tax;
        totalCecetTax += cecetTax;
        totalSalesTax += salesTax;

        // Track cash vs card
        if (isCash) {
            totalCashSales += amount;
            totalCashOrders += 1;
        } else {
            totalCardSales += amount;
            totalCardOrders += 1;
        }

        // Daily aggregation
        if (!dailyData[day]) {
            dailyData[day] = { sales: 0, orders: 0, tax: 0, cecetTax: 0, salesTax: 0, cashSales: 0, cardSales: 0 };
        }
        dailyData[day].sales += amount;
        dailyData[day].orders += 1;
        dailyData[day].tax += tax;
        dailyData[day].cecetTax += cecetTax;
        dailyData[day].salesTax += salesTax;
        if (isCash) {
            dailyData[day].cashSales += amount;
        } else {
            dailyData[day].cardSales += amount;
        }

        // Hourly aggregation
        if (!hourlyData[hour]) {
            hourlyData[hour] = { sales: 0, orders: 0, cecetTax: 0, salesTax: 0, cashSales: 0, cardSales: 0 };
        }
        hourlyData[hour].sales += amount;
        hourlyData[hour].orders += 1;
        hourlyData[hour].cecetTax += cecetTax;
        hourlyData[hour].salesTax += salesTax;
        if (isCash) {
            hourlyData[hour].cashSales += amount;
        } else {
            hourlyData[hour].cardSales += amount;
        }

        // Monthly aggregation
        if (!monthlyData[month]) {
            monthlyData[month] = { sales: 0, orders: 0, tax: 0, cecetTax: 0, salesTax: 0, cashSales: 0, cardSales: 0 };
        }
        monthlyData[month].sales += amount;
        monthlyData[month].orders += 1;
        monthlyData[month].tax += tax;
        monthlyData[month].cecetTax += cecetTax;
        monthlyData[month].salesTax += salesTax;
        if (isCash) {
            monthlyData[month].cashSales += amount;
        } else {
            monthlyData[month].cardSales += amount;
        }

        // Transform line items from bulk format
        // Bulk operation returns line items either in _lineItems (associated by us)
        // or in lineItems.edges (if not exploded)
        let lineItems = [];
        if (order._lineItems && order._lineItems.length > 0) {
            // Line items were associated from NDJSON __parentId
            lineItems = order._lineItems.map(item => ({
                name: item.name || item.title,
                sku: item.sku || '-',
                quantity: item.quantity,
                price: parseFloat(item.originalUnitPriceSet?.shopMoney?.amount || 0)
            }));
        } else if (order.lineItems?.edges) {
            // Line items are in nested GraphQL format
            lineItems = order.lineItems.edges.map(edge => ({
                name: edge.node.name || edge.node.title,
                sku: edge.node.sku || '-',
                quantity: edge.node.quantity,
                price: parseFloat(edge.node.originalUnitPriceSet?.shopMoney?.amount || 0)
            }));
        }

        // Build customer name
        const customer = order.customer
            ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
            : 'Guest';

        return {
            id: order.id.split('/').pop(), // Extract numeric ID from gid://shopify/Order/123
            name: order.name,
            createdAt: order.createdAt,
            status: (order.displayFinancialStatus || 'PENDING').toUpperCase(),
            fulfillment: (order.displayFulfillmentStatus || 'UNFULFILLED').toUpperCase(),
            total: amount,
            customer: customer || 'Guest',
            cecetTax: cecetTax,
            salesTax: salesTax,
            lineItems: lineItems,
            // Payment method from Shopify paymentGatewayNames
            paymentGateway: isCash ? 'cash' : (paymentGateways.length > 0 ? paymentGateways[0] : 'card'),
            paymentGatewayNames: paymentGateways,
            isCashPayment: isCash
        };
    });

    // Sort recent orders by date descending
    recentOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate total orders from filtered results
    const totalOrders = recentOrders.length;

    return {
        summary: {
            totalSales: totalSales.toFixed(2),
            netSales: (totalSales - totalTax).toFixed(2),
            totalTax: totalTax.toFixed(2),
            totalCecetTax: totalCecetTax.toFixed(2),
            totalSalesTax: totalSalesTax.toFixed(2),
            totalOrders,
            avgOrderValue: totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : '0.00',
            currency: filteredOrders.length > 0 ? (filteredOrders[0].currencyCode || 'USD') : 'USD',
            // Cash vs Card breakdown
            totalCashSales: totalCashSales.toFixed(2),
            totalCardSales: totalCardSales.toFixed(2),
            totalCashOrders,
            totalCardOrders
        },
        daily: dailyData,
        hourly: hourlyData,
        monthly: monthlyData,
        recentOrders
    };
}

// =============================================================================
// SMART ANALYTICS - AUTO-SELECT REST vs BULK
// =============================================================================

/**
 * Smart analytics fetch - automatically chooses REST or Bulk based on date range
 *
 * Decision logic:
 * - 'today' or 'week' → REST API (faster for small ranges, ~250 order limit ok)
 * - 'month', 'quarter', 'year', 'custom' → Bulk API (no limits, better for large ranges)
 *
 * @param {string} storeKey - Store identifier
 * @param {string|null} locationId - Optional location filter
 * @param {string} period - Period identifier
 * @param {Function|null} onProgress - Progress callback
 * @param {Object|null} customRange - Custom date range
 * @param {boolean} forceRefresh - Bypass cache
 * @returns {Promise<Object>} Analytics data
 */
async function fetchSalesAnalyticsSmart(storeKey = 'vsu', locationId = null, period = 'month', onProgress = null, customRange = null, forceRefresh = false) {
    // Determine which API to use based on period
    const useRestApi = (period === 'today' || period === 'week');

    console.log(`🧠 [SMART] Auto-selecting API: ${useRestApi ? 'REST' : 'BULK'} for period: ${period}`);

    if (useRestApi) {
        // REST API is faster for small date ranges
        return fetchSalesAnalytics(storeKey, locationId, period, onProgress, customRange);
    } else {
        // Bulk API for larger ranges (no order limits)
        return fetchSalesAnalyticsBulk(storeKey, locationId, period, onProgress, customRange, forceRefresh);
    }
}

/**
 * Fetch analytics from multiple stores in parallel
 * Each store has its own bulk operation queue, so they can run simultaneously
 *
 * @param {Array<string>} storeKeys - Array of store identifiers ['vsu', 'loyalvaper', 'miramarwine']
 * @param {string} period - Period identifier
 * @param {Function|null} onProgress - Progress callback (receives combined progress)
 * @param {Object|null} customRange - Custom date range
 * @param {boolean} forceRefresh - Bypass cache
 * @returns {Promise<Object>} Combined analytics data with per-store breakdown
 */
async function fetchMultiStoreAnalytics(storeKeys = ['vsu', 'loyalvaper', 'miramarwine'], period = 'month', onProgress = null, customRange = null, forceRefresh = false) {
    console.log(`🏪 [MULTI-STORE] Fetching analytics for ${storeKeys.length} stores in parallel...`);

    const storeProgress = {};
    storeKeys.forEach(key => storeProgress[key] = 0);

    // Progress aggregator
    const updateProgress = (storeKey, percent, message) => {
        storeProgress[storeKey] = percent;
        const avgProgress = Object.values(storeProgress).reduce((a, b) => a + b, 0) / storeKeys.length;
        if (onProgress) {
            onProgress(Math.round(avgProgress), `${storeKey}: ${message}`);
        }
    };

    // Fetch all stores in parallel
    const promises = storeKeys.map(storeKey =>
        fetchSalesAnalyticsSmart(
            storeKey,
            null, // No location filter for multi-store
            period,
            (percent, msg) => updateProgress(storeKey, percent, msg),
            customRange,
            forceRefresh
        ).catch(error => {
            console.error(`❌ [MULTI-STORE] Failed to fetch ${storeKey}:`, error);
            return null; // Return null for failed stores instead of failing all
        })
    );

    const results = await Promise.all(promises);

    // Combine results
    const combined = {
        stores: {},
        summary: {
            totalSales: 0,
            totalOrders: 0,
            totalTax: 0,
            totalCecetTax: 0,
            totalSalesTax: 0,
            totalCashSales: 0,
            totalCardSales: 0
        },
        period,
        fetchedAt: new Date().toISOString()
    };

    storeKeys.forEach((storeKey, index) => {
        const result = results[index];
        if (result) {
            combined.stores[storeKey] = result;
            // Aggregate summary
            combined.summary.totalSales += parseFloat(result.summary.totalSales) || 0;
            combined.summary.totalOrders += result.summary.totalOrders || 0;
            combined.summary.totalTax += parseFloat(result.summary.totalTax) || 0;
            combined.summary.totalCecetTax += parseFloat(result.summary.totalCecetTax) || 0;
            combined.summary.totalSalesTax += parseFloat(result.summary.totalSalesTax) || 0;
            combined.summary.totalCashSales += parseFloat(result.summary.totalCashSales) || 0;
            combined.summary.totalCardSales += parseFloat(result.summary.totalCardSales) || 0;
        }
    });

    // Format summary values
    combined.summary.totalSales = combined.summary.totalSales.toFixed(2);
    combined.summary.totalTax = combined.summary.totalTax.toFixed(2);
    combined.summary.totalCecetTax = combined.summary.totalCecetTax.toFixed(2);
    combined.summary.totalSalesTax = combined.summary.totalSalesTax.toFixed(2);
    combined.summary.totalCashSales = combined.summary.totalCashSales.toFixed(2);
    combined.summary.totalCardSales = combined.summary.totalCardSales.toFixed(2);
    combined.summary.avgOrderValue = combined.summary.totalOrders > 0
        ? (parseFloat(combined.summary.totalSales) / combined.summary.totalOrders).toFixed(2)
        : '0.00';

    console.log(`✅ [MULTI-STORE] Combined analytics ready:`, combined.summary);

    if (onProgress) {
        onProgress(100, 'All stores loaded');
    }

    return combined;
}

/**
 * Fetch sales analytics using GraphQL Bulk Operations
 *
 * This is the recommended approach for large date ranges (> 1 month) or high-volume stores.
 * No order count limits - handles unlimited orders.
 *
 * @param {string} storeKey - Store identifier ('vsu', 'loyalvaper', etc.)
 * @param {string|null} locationId - Optional location ID (not supported in bulk, ignored)
 * @param {string} period - 'today', 'week', 'month', 'quarter', 'year', or 'custom'
 * @param {Function|null} onProgress - Progress callback (percent, message)
 * @param {Object|null} customRange - { startDate: Date, endDate: Date } for custom ranges
 * @param {boolean} forceRefresh - Force refresh from API, bypassing cache (default: false)
 * @returns {Promise<Object>} Analytics data in standard format
 */
async function fetchSalesAnalyticsBulk(storeKey = 'vsu', locationId = null, period = 'month', onProgress = null, customRange = null, forceRefresh = false) {
    console.log('🚀 [BULK] fetchSalesAnalyticsBulk called with:', { storeKey, locationId, period, customRange, forceRefresh });

    const storeConfig = STORES_CONFIG[storeKey];

    if (!storeConfig) {
        console.error('❌ [BULK] Invalid store key:', storeKey);
        throw new Error(`Invalid store key: ${storeKey}`);
    }

    console.log('✅ [BULK] Store config found:', storeConfig.name);

    // Generate cache key for this request
    const dateRange = getDateRange(period, customRange);
    const cacheKey = generateCacheKey('analyticsBulk', {
        store: storeKey,
        location: locationId,
        period: period,
        since: dateRange.since.split('T')[0], // Just date part for cache key
        until: dateRange.until.split('T')[0]
    });

    // Check cache first (unless forceRefresh)
    if (!forceRefresh) {
        const cached = getFromCache(cacheKey);
        if (cached) {
            console.log('📦 [BULK] Returning cached data');
            if (onProgress) {
                onProgress(100, 'Loaded from cache');
            }
            // Add cache metadata to response
            cached.data.fromCache = true;
            cached.data.cacheAge = cached.cacheAge;
            cached.data.cacheAgeFormatted = formatCacheAge(cached.cacheAge);
            return cached.data;
        }
    } else {
        console.log('🔄 [BULK] Force refresh requested, bypassing cache');
    }

    // Location filtering is now supported - we fetch all orders and filter by fulfillment location
    if (locationId) {
        console.log('📍 [BULK] Location filter active:', locationId);
    }

    console.log('📅 [BULK] Date range:', dateRange);

    if (onProgress) {
        onProgress(5, 'Starting bulk export...');
    }

    // Step 1: Start bulk operation
    console.log('📦 [BULK] Step 1: Starting bulk export...');
    await startBulkOrdersExport(dateRange.since, dateRange.until, storeConfig);

    if (onProgress) {
        onProgress(10, 'Bulk operation queued...');
    }

    // Step 2: Poll until completion
    console.log('⏳ [BULK] Step 2: Polling for completion...');
    const completedOp = await pollBulkOperation(storeConfig, onProgress);
    console.log('✅ [BULK] Poll completed:', completedOp);

    if (!completedOp.url) {
        // No data returned (empty result)
        console.log('📭 Bulk operation completed but no data URL - likely no orders in range');
        const emptyResult = {
            summary: {
                totalSales: '0.00',
                netSales: '0.00',
                totalTax: '0.00',
                totalCecetTax: '0.00',
                totalSalesTax: '0.00',
                totalOrders: 0,
                avgOrderValue: '0.00',
                currency: 'USD'
            },
            daily: {},
            hourly: {},
            monthly: {},
            recentOrders: [],
            storeInfo: {
                key: storeKey,
                name: storeConfig.name,
                shortName: storeConfig.shortName,
                locationId: null
            },
            dateRange: {
                period,
                since: dateRange.since,
                until: dateRange.until
            },
            fromCache: false
        };
        // Cache empty result too (shorter TTL)
        saveToCache(cacheKey, emptyResult, CACHE_CONFIG.TTL.analytics);
        return emptyResult;
    }

    // Step 3: Download and parse NDJSON
    console.log('📥 [BULK] Step 3: Downloading and parsing NDJSON from:', completedOp.url);
    const bulkOrders = await downloadAndParseBulkData(completedOp.url, onProgress);
    console.log(`📊 [BULK] Downloaded ${bulkOrders.length} orders (NO 2500 LIMIT!)`);

    if (onProgress) {
        onProgress(90, 'Processing analytics...');
    }

    // Step 4: Transform to analytics format (with location filtering if specified)
    console.log('🔄 [BULK] Step 4: Transforming data to analytics format...');
    if (locationId) {
        console.log(`📍 [BULK] Filtering orders by location ID: ${locationId}`);
    }
    const analytics = transformBulkDataToAnalytics(bulkOrders, locationId);
    console.log('✅ [BULK] Analytics complete:', {
        totalOrders: analytics.summary.totalOrders,
        totalSales: analytics.summary.totalSales,
        totalTax: analytics.summary.totalTax,
        locationFiltered: !!locationId
    });

    // Add store and date info
    analytics.storeInfo = {
        key: storeKey,
        name: storeConfig.name,
        shortName: storeConfig.shortName,
        locationId: locationId || null
    };

    analytics.dateRange = {
        period,
        since: dateRange.since,
        until: dateRange.until
    };

    analytics.fromCache = false;

    // Save to cache
    saveToCache(cacheKey, analytics, CACHE_CONFIG.TTL.analyticsBulk);

    if (onProgress) {
        onProgress(100, 'Complete!');
    }

    return analytics;
}

/**
 * Format cache age for display
 * @param {number} ageMs - Age in milliseconds
 * @returns {string} Formatted age string
 */
function formatCacheAge(ageMs) {
    const seconds = Math.floor(ageMs / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}

// CORS Proxy Configuration
const CORS_PROXY = 'https://corsproxy.io/?';

/**
 * Fetch data from Shopify API with CORS proxy
 */
async function fetchShopifyAPI(endpoint, params = {}, storeConfig) {
    const queryString = new URLSearchParams(params).toString();
    const url = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/${endpoint}${queryString ? '?' + queryString : ''}`;

    try {
        const response = await fetch(CORS_PROXY + encodeURIComponent(url), {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': storeConfig.accessToken
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
 * Fetch detailed tax data using GraphQL API
 */
async function fetchOrderTaxDetailsGraphQL(orderIds, storeConfig) {
    const graphqlUrl = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;

    // Build GraphQL query for multiple orders
    const query = `
        query getOrdersTaxDetails($ids: [ID!]!) {
            nodes(ids: $ids) {
                ... on Order {
                    id
                    name
                    taxLines {
                        title
                        rate
                        priceSet {
                            shopMoney {
                                amount
                            }
                        }
                    }
                }
            }
        }
    `;

    try {

        const response = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': storeConfig.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                variables: {
                    ids: orderIds.map(id => `gid://shopify/Order/${id}`)
                }
            })
        });

        if (!response.ok) {
            throw new Error(`GraphQL API Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        return result.data?.nodes || [];
    } catch (error) {
        console.error('❌ GraphQL tax fetch failed:', error);
        return []; // Return empty array on error (fallback to estimation)
    }
}

/**
 * Parse tax breakdown from GraphQL tax lines
 * Returns { cecetTax, salesTax } for an order
 */
function parseTaxBreakdown(taxLines) {
    let cecetTax = 0;
    let salesTax = 0;

    if (!taxLines || taxLines.length === 0) {
        return { cecetTax, salesTax };
    }


    taxLines.forEach(taxLine => {
        const title = taxLine.title || '';
        const rate = parseFloat(taxLine.rate || 0);
        const amount = parseFloat(taxLine.priceSet?.shopMoney?.amount || 0);


        // Check if this is CECET tax by rate (12.5% = 0.125)
        // Using a small tolerance for floating point comparison
        if (Math.abs(rate - 0.125) < 0.0001) {
            cecetTax += amount;
        } else {
            // All other taxes are considered sales tax
            salesTax += amount;
        }
    });


    return { cecetTax, salesTax };
}

/**
 * Fetch locations for a store
 * Uses localStorage cache with 1 hour TTL (locations rarely change)
 *
 * @param {string} storeKey - Store identifier
 * @param {boolean} forceRefresh - Force refresh from API
 * @returns {Promise<Array>} Array of location objects
 */
async function fetchStoreLocations(storeKey, forceRefresh = false) {
    const storeConfig = STORES_CONFIG[storeKey];

    if (!storeConfig) {
        throw new Error(`Invalid store key: ${storeKey}`);
    }

    // Generate cache key
    const cacheKey = generateCacheKey('locations', { store: storeKey });

    // Check localStorage cache first (unless forceRefresh)
    if (!forceRefresh) {
        const cached = getFromCache(cacheKey);
        if (cached) {
            console.log(`📍 [Locations] Returning cached locations for ${storeConfig.name}`);
            // Also update memory cache
            locationCache[storeKey] = cached.data;
            return cached.data;
        }

        // Fallback to memory cache
        if (locationCache[storeKey]) {
            return locationCache[storeKey];
        }
    }

    try {
        console.log(`📍 [Locations] Fetching locations for ${storeConfig.name}...`);
        const data = await fetchShopifyAPI('locations.json', {}, storeConfig);

        // Map locations to a more usable format
        const locations = data.locations.map(loc => ({
            id: loc.id,
            name: loc.name,
            active: loc.active
        }));

        // Cache in memory
        locationCache[storeKey] = locations;

        // Cache in localStorage
        saveToCache(cacheKey, locations, CACHE_CONFIG.TTL.locations);

        console.log(`✅ [Locations] Loaded ${locations.length} locations for ${storeConfig.name}`);
        return locations;
    } catch (error) {
        console.error('Failed to fetch locations:', error);
        return [];
    }
}

/**
 * Fetch all orders within a date range
 * Uses chunking to avoid 250 order limit
 */
async function fetchAllOrders(createdAtMin, createdAtMax, storeConfig, locationId = null, onProgress = null) {
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
            const params = {
                status: 'any',
                created_at_min: blockStart,
                created_at_max: blockEnd,
                limit: 250
            };

            // Add location_id filter if specified
            if (locationId) {
                params.location_id = locationId;
            }

            const data = await fetchShopifyAPI('orders.json', params, storeConfig);

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

// =============================================================================
// DATE RANGE FILTERS
// =============================================================================
//
// Supported period values and their behavior:
//
// | Period    | Description                | Start Date                    | End Date    |
// |-----------|----------------------------|-------------------------------|-------------|
// | today     | Current day only           | Today at 00:00:00             | Now         |
// | week      | Current week (Sun-Sat)     | Last Sunday at 00:00:00       | Now         |
// | month     | Current calendar month     | 1st of current month          | Now         |
// | quarter   | Last 3 months              | 3 months ago, 1st of month    | Now         |
// | year      | Current calendar year      | January 1st of current year   | Now         |
// | custom    | User-defined range         | customRange.startDate         | customRange.endDate |
//
// Custom Range Object:
// {
//   startDate: Date | string,  // Start of the custom range
//   endDate: Date | string     // End of the custom range
// }
//
// For Shopify API queries, dates are formatted as ISO 8601 strings.
// The 'since' date is set to 00:00:00.000 of the start day.
// The 'until' date is set to 23:59:59.999 of the end day.
//
// =============================================================================

/**
 * Calculate date range based on period selection
 *
 * @param {string} period - Period identifier:
 *   - 'today': Current day from midnight to now
 *   - 'week': Current week starting from Sunday
 *   - 'month': Current calendar month from the 1st
 *   - 'quarter': Last 3 months (e.g., if Dec, shows Oct 1 - Now)
 *   - 'year': Current year from January 1st
 *   - 'custom': Use customRange parameter
 *
 * @param {Object|null} customRange - Required when period='custom':
 *   - startDate: {Date|string} Start of range (will be set to 00:00:00)
 *   - endDate: {Date|string} End of range (will be set to 23:59:59)
 *
 * @returns {Object} Date range object:
 *   - since: {string} ISO 8601 start date
 *   - until: {string} ISO 8601 end date
 *
 * @example
 * // Get this month's range
 * const range = getDateRange('month');
 * // { since: "2024-12-01T00:00:00.000Z", until: "2024-12-15T..." }
 *
 * @example
 * // Get custom range
 * const range = getDateRange('custom', {
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-06-30')
 * });
 */
function getDateRange(period, customRange = null) {
    const now = new Date();
    let since, until;

    // Handle custom date range
    if (period === 'custom' && customRange && customRange.startDate && customRange.endDate) {
        since = new Date(customRange.startDate);
        since.setHours(0, 0, 0, 0);
        until = new Date(customRange.endDate);
        until.setHours(23, 59, 59, 999);
        return {
            since: since.toISOString(),
            until: until.toISOString()
        };
    }

    switch(period) {
        case 'today':
            // Today: from midnight to now
            since = new Date(now);
            since.setHours(0, 0, 0, 0);
            until = new Date();
            break;

        case 'week':
            // This week: from last Sunday to now
            since = new Date(now);
            since.setDate(now.getDate() - now.getDay()); // Go back to Sunday
            since.setHours(0, 0, 0, 0);
            until = new Date();
            break;

        case 'month':
            // Last 30 days rolling (full month of sales)
            since = new Date(now);
            since.setDate(now.getDate() - 30);
            since.setHours(0, 0, 0, 0);
            until = new Date();
            break;

        case 'quarter':
            // Last 3 months: from 1st of the month 3 months ago to now
            // Example: If today is Dec 15, range is Oct 1 - Dec 15
            since = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            since.setHours(0, 0, 0, 0);
            until = new Date();
            break;

        case 'year':
            // This year: from January 1st to now
            since = new Date(now.getFullYear(), 0, 1);
            since.setHours(0, 0, 0, 0);
            until = new Date();
            break;

        default:
            // Default to current month
            since = new Date(now.getFullYear(), now.getMonth(), 1);
            since.setHours(0, 0, 0, 0);
            until = new Date();
    }

    return {
        since: since.toISOString(),
        until: until.toISOString()
    };
}

/**
 * Process orders data into analytics format
 * Now async to fetch detailed tax breakdown via GraphQL
 */
async function processOrdersData(orders, storeConfig) {
    let totalSales = 0;
    let totalTax = 0;
    let totalCecetTax = 0;
    let totalSalesTax = 0;
    let totalOrders = orders.length;
    const dailyData = {};
    const hourlyData = {};
    const monthlyData = {};

    // Fetch detailed tax data via GraphQL for all orders (in batches of 250)
    let taxDataMap = {};
    if (orders.length > 0 && storeConfig) {
        try {
            const orderIds = orders.map(order => order.id);

            // GraphQL has a 250 item limit, so we need to batch the requests
            const batchSize = 250;
            const totalBatches = Math.ceil(orderIds.length / batchSize);

            for (let i = 0; i < orderIds.length; i += batchSize) {
                const batchNumber = Math.floor(i / batchSize) + 1;
                const batchIds = orderIds.slice(i, i + batchSize);


                const taxData = await fetchOrderTaxDetailsGraphQL(batchIds, storeConfig);

                // Create a map of order ID to tax breakdown for quick lookup
                taxData.forEach(orderTaxData => {
                    if (orderTaxData && orderTaxData.id) {
                        // Extract numeric ID from GraphQL global ID (gid://shopify/Order/12345)
                        const numericId = orderTaxData.id.split('/').pop();
                        const breakdown = parseTaxBreakdown(orderTaxData.taxLines);
                        taxDataMap[numericId] = breakdown;
                    }
                });

                // Small delay to avoid rate limiting
                if (i + batchSize < orderIds.length) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }

        } catch (error) {
            console.error('❌ Failed to fetch tax breakdown, using totals only:', error);
            // Continue without breakdown - backward compatibility
        }
    }

    orders.forEach(order => {
        const orderDate = new Date(order.created_at);
        const day = orderDate.toISOString().split('T')[0];
        const hour = orderDate.getHours();
        const month = orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        const amount = parseFloat(order.total_price);
        const tax = parseFloat(order.total_tax || 0);

        // Get tax breakdown for this order (if available)
        const taxBreakdown = taxDataMap[order.id] || { cecetTax: 0, salesTax: 0 };
        const cecetTax = taxBreakdown.cecetTax;
        const salesTax = taxBreakdown.salesTax;

        totalSales += amount;
        totalTax += tax;
        totalCecetTax += cecetTax;
        totalSalesTax += salesTax;

        // Attach tax breakdown to order for later use
        order._taxBreakdown = taxBreakdown;

        // Daily aggregation
        if (!dailyData[day]) {
            dailyData[day] = { sales: 0, orders: 0, tax: 0, cecetTax: 0, salesTax: 0 };
        }
        dailyData[day].sales += amount;
        dailyData[day].orders += 1;
        dailyData[day].tax += tax;
        dailyData[day].cecetTax += cecetTax;
        dailyData[day].salesTax += salesTax;

        // Hourly aggregation
        if (!hourlyData[hour]) {
            hourlyData[hour] = { sales: 0, orders: 0, cecetTax: 0, salesTax: 0 };
        }
        hourlyData[hour].sales += amount;
        hourlyData[hour].orders += 1;
        hourlyData[hour].cecetTax += cecetTax;
        hourlyData[hour].salesTax += salesTax;

        // Monthly aggregation
        if (!monthlyData[month]) {
            monthlyData[month] = { sales: 0, orders: 0, tax: 0, cecetTax: 0, salesTax: 0 };
        }
        monthlyData[month].sales += amount;
        monthlyData[month].orders += 1;
        monthlyData[month].tax += tax;
        monthlyData[month].cecetTax += cecetTax;
        monthlyData[month].salesTax += salesTax;
    });

    const result = {
        summary: {
            totalSales: totalSales.toFixed(2),
            netSales: (totalSales - totalTax).toFixed(2),
            totalTax: totalTax.toFixed(2),
            totalCecetTax: totalCecetTax.toFixed(2),
            totalSalesTax: totalSalesTax.toFixed(2),
            totalOrders,
            avgOrderValue: totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : '0.00',
            currency: orders.length > 0 ? orders[0].currency : 'USD'
        },
        daily: dailyData,
        hourly: hourlyData,
        monthly: monthlyData,
        recentOrders: orders.map(order => ({
            id: order.id,
            name: order.name,
            createdAt: order.created_at,
            status: order.financial_status?.toUpperCase() || 'PENDING',
            fulfillment: order.fulfillment_status?.toUpperCase() || 'UNFULFILLED',
            total: parseFloat(order.total_price),
            customer: order.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : 'Guest',
            cecetTax: order._taxBreakdown?.cecetTax || 0,
            salesTax: order._taxBreakdown?.salesTax || 0,
            lineItems: order.line_items?.map(item => ({
                name: item.name,
                sku: item.sku || '-',
                quantity: item.quantity,
                price: parseFloat(item.price)
            })) || []
        }))
    };

    return result;
}

/**
 * Fetch and process sales analytics
 * @param {string} storeKey - Store identifier ('vsu', 'loyalvaper', etc.)
 * @param {string|null} locationId - Optional location ID for filtering
 * @param {string} period - 'today', 'week', 'month', 'year', or 'custom'
 * @param {Function|null} onProgress - Optional progress callback
 * @param {Object|null} customRange - Optional { startDate: Date, endDate: Date } for custom ranges
 */
async function fetchSalesAnalytics(storeKey = 'vsu', locationId = null, period = 'month', onProgress = null, customRange = null) {
    const storeConfig = STORES_CONFIG[storeKey];

    if (!storeConfig) {
        throw new Error(`Invalid store key: ${storeKey}`);
    }

    const dateRange = getDateRange(period, customRange);

    if (onProgress) {
        onProgress(10, 'Connecting to Shopify...');
    }

    const orders = await fetchAllOrders(dateRange.since, dateRange.until, storeConfig, locationId, onProgress);

    if (onProgress) {
        onProgress(92, 'Fetching tax details...');
    }

    const analytics = await processOrdersData(orders, storeConfig);

    // Add store info to analytics
    analytics.storeInfo = {
        key: storeKey,
        name: storeConfig.name,
        shortName: storeConfig.shortName,
        locationId: locationId
    };

    // Add date range info to analytics
    analytics.dateRange = {
        period: period,
        since: dateRange.since,
        until: dateRange.until
    };

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

/**
 * Fetch products/inventory from a Shopify store
 * Uses GraphQL for better performance and data quality
 * For VSU: fetches inventory levels per location
 *
 * @param {string} storeKey - Store identifier
 * @param {number} limit - Max products to fetch
 * @param {boolean} forceRefresh - Force refresh from API, bypassing cache
 * @returns {Promise<Array>} Array of inventory items
 */
async function fetchStoreInventory(storeKey = 'vsu', limit = 100, forceRefresh = false) {
    const storeConfig = STORES_CONFIG[storeKey];

    if (!storeConfig) {
        throw new Error(`Invalid store key: ${storeKey}`);
    }

    // Generate cache key
    const cacheKey = generateCacheKey('inventory', { store: storeKey, limit });

    // Check cache first (unless forceRefresh)
    if (!forceRefresh) {
        const cached = getFromCache(cacheKey);
        if (cached) {
            console.log(`📦 [Inventory] Returning cached data for ${storeConfig.name}`);
            // Add cache metadata
            cached.data.forEach(item => {
                item.fromCache = true;
                item.cacheAge = cached.cacheAge;
            });
            return cached.data;
        }
    } else {
        console.log(`🔄 [Inventory] Force refresh requested for ${storeConfig.name}`);
    }

    console.log(`📦 [Inventory] Fetching inventory from ${storeConfig.name}...`);

    const graphqlUrl = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;

    // For stores with multiple locations (VSU), fetch inventory levels per location
    if (storeConfig.hasMultipleLocations && storeConfig.locations) {
        try {
            const inventory = await fetchStoreInventoryWithLocations(storeConfig, storeKey, limit);
            // Save to cache
            saveToCache(cacheKey, inventory, CACHE_CONFIG.TTL.inventory);
            return inventory;
        } catch (error) {
            console.warn(`⚠️ [Inventory] Location-based fetch failed for ${storeConfig.name}, falling back to standard fetch:`, error);
            // Fall through to standard fetch
        }
    }

    const query = `
        query getProducts($first: Int!) {
            products(first: $first) {
                edges {
                    node {
                        id
                        title
                        vendor
                        productType
                        status
                        totalInventory
                        images(first: 1) {
                            nodes {
                                url
                            }
                        }
                        variants(first: 50) {
                            edges {
                                node {
                                    id
                                    title
                                    sku
                                    price
                                    inventoryQuantity
                                    inventoryItem {
                                        id
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    try {
        const response = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': storeConfig.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                variables: { first: limit }
            })
        });

        if (!response.ok) {
            throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.errors) {
            console.error('GraphQL errors:', data.errors);
            throw new Error('GraphQL query failed');
        }

        // Transform to inventory format
        const products = data.data.products.edges.map(edge => {
            const product = edge.node;
            const imageUrl = product.images?.nodes?.[0]?.url || null;
            return product.variants.edges.map(variantEdge => {
                const variant = variantEdge.node;
                return {
                    id: variant.id,
                    productId: product.id,
                    store: storeConfig.shortName,
                    storeKey: storeKey,
                    brand: product.vendor || 'Unknown',
                    productName: product.title,
                    flavor: variant.title !== 'Default Title' ? variant.title : 'N/A',
                    sku: variant.sku || '',
                    unitPrice: parseFloat(variant.price) || 0,
                    stock: variant.inventoryQuantity || 0,
                    minStock: 10, // Default min stock
                    productType: product.productType || 'General',
                    status: product.status,
                    imageUrl: imageUrl,
                    fromCache: false
                };
            });
        }).flat();

        console.log(`✅ [Inventory] Loaded ${products.length} items from ${storeConfig.name}`);

        // Save to cache
        saveToCache(cacheKey, products, CACHE_CONFIG.TTL.inventory);

        return products;
    } catch (error) {
        console.error(`❌ [Inventory] Error fetching from ${storeConfig.name}:`, error);
        throw error;
    }
}

/**
 * Fetch inventory with location-level detail for multi-location stores (VSU)
 * Returns separate inventory items per location
 */
async function fetchStoreInventoryWithLocations(storeConfig, storeKey, limit = 100) {
    const graphqlUrl = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;

    // First, fetch locations
    const locationsQuery = `
        query getLocations {
            locations(first: 10) {
                edges {
                    node {
                        id
                        name
                        address {
                            city
                        }
                    }
                }
            }
        }
    `;

    try {
        // Get locations
        console.log(`📍 [Inventory] Fetching locations for ${storeConfig.name}...`);
        const locResponse = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': storeConfig.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: locationsQuery })
        });

        if (!locResponse.ok) {
            throw new Error(`Shopify API error: ${locResponse.status}`);
        }

        const locData = await locResponse.json();

        if (locData.errors) {
            console.error('GraphQL errors (locations):', locData.errors);
            throw new Error('GraphQL query failed for locations');
        }

        const locations = locData.data?.locations?.edges?.map(e => e.node) || [];
        console.log(`📍 [Inventory] Found ${locations.length} locations for ${storeConfig.name}:`, locations.map(l => l.name));

        // Fetch products with inventory levels per location
        // Using a simpler query that's more compatible
        const productsQuery = `
            query getProductsWithInventory($first: Int!) {
                products(first: $first) {
                    edges {
                        node {
                            id
                            title
                            vendor
                            productType
                            status
                            images(first: 1) {
                                nodes {
                                    url
                                }
                            }
                            variants(first: 50) {
                                edges {
                                    node {
                                        id
                                        title
                                        sku
                                        price
                                        inventoryQuantity
                                        inventoryItem {
                                            id
                                            inventoryLevels(first: 10) {
                                                edges {
                                                    node {
                                                        id
                                                        available
                                                        location {
                                                            id
                                                            name
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        console.log(`📦 [Inventory] Fetching products with inventory levels for ${storeConfig.name}...`);
        const prodResponse = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': storeConfig.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: productsQuery,
                variables: { first: limit }
            })
        });

        if (!prodResponse.ok) {
            throw new Error(`Shopify API error: ${prodResponse.status}`);
        }

        const prodData = await prodResponse.json();

        if (prodData.errors) {
            console.error('GraphQL errors (products):', prodData.errors);
            throw new Error('GraphQL query failed for products');
        }

        // Transform to inventory format with location-level detail
        const allInventory = [];

        prodData.data.products.edges.forEach(productEdge => {
            const product = productEdge.node;

            product.variants.edges.forEach(variantEdge => {
                const variant = variantEdge.node;
                const inventoryLevels = variant.inventoryItem?.inventoryLevels?.edges || [];

                // Get product image URL from images array
                const imageUrl = product.images?.nodes?.[0]?.url || null;

                // If no inventory levels, use total inventory quantity with store name
                if (inventoryLevels.length === 0) {
                    allInventory.push({
                        id: variant.id,
                        productId: product.id,
                        store: storeConfig.shortName,
                        storeKey: storeKey,
                        locationName: null,
                        brand: product.vendor || 'Unknown',
                        productName: product.title,
                        flavor: variant.title !== 'Default Title' ? variant.title : 'N/A',
                        sku: variant.sku || '',
                        unitPrice: parseFloat(variant.price) || 0,
                        stock: variant.inventoryQuantity || 0,
                        minStock: 10,
                        productType: product.productType || 'General',
                        status: product.status,
                        imageUrl: imageUrl
                    });
                    return;
                }

                // Create one entry per location
                inventoryLevels.forEach(levelEdge => {
                    const level = levelEdge.node;
                    const locationName = level.location?.name || 'Unknown';
                    // Use 'available' field (older API) or 'quantities' (newer API)
                    const availableQty = level.available ??
                        (level.quantities?.find(q => q.name === 'available')?.quantity) ?? 0;

                    // Map Shopify location name to our store location names
                    const mappedLocationName = mapVSULocationName(locationName);

                    allInventory.push({
                        id: `${variant.id}-${level.location?.id}`,
                        productId: product.id,
                        store: `VSU ${mappedLocationName}`,
                        storeKey: storeKey,
                        locationName: mappedLocationName,
                        brand: product.vendor || 'Unknown',
                        productName: product.title,
                        flavor: variant.title !== 'Default Title' ? variant.title : 'N/A',
                        sku: variant.sku || '',
                        unitPrice: parseFloat(variant.price) || 0,
                        stock: availableQty,
                        minStock: 10,
                        productType: product.productType || 'General',
                        status: product.status,
                        imageUrl: imageUrl
                    });
                });
            });
        });

        console.log(`✅ [Inventory] Loaded ${allInventory.length} items across ${locations.length} locations from ${storeConfig.name}`);
        return allInventory;
    } catch (error) {
        console.error(`❌ [Inventory] Error fetching multi-location inventory from ${storeConfig.name}:`, error);
        throw error;
    }
}

/**
 * Map Shopify location names to friendly VSU location names
 */
function mapVSULocationName(shopifyLocationName) {
    const locationMap = {
        'miramar': 'Miramar',
        'chula vista': 'Chula Vista',
        'morena': 'Morena',
        'north park': 'North Park',
        'kearny mesa': 'Kearny Mesa'
    };

    const lowerName = shopifyLocationName.toLowerCase();

    // Try exact match first
    for (const [key, value] of Object.entries(locationMap)) {
        if (lowerName.includes(key)) {
            return value;
        }
    }

    // Return original name if no match
    return shopifyLocationName;
}

/**
 * Fetch inventory from all configured stores
 *
 * @param {Function|null} onProgress - Progress callback
 * @param {boolean} forceRefresh - Force refresh from API, bypassing cache
 * @returns {Promise<Array>} Combined inventory from all stores
 */
async function fetchAllStoresInventory(onProgress = null, forceRefresh = false) {
    const allInventory = [];
    const storeKeys = Object.keys(STORES_CONFIG);
    let completed = 0;
    let fromCache = true;

    console.log(`📦 [Inventory] Fetching inventory from ${storeKeys.length} stores...`);

    for (const storeKey of storeKeys) {
        try {
            if (onProgress) {
                const progress = Math.round((completed / storeKeys.length) * 100);
                onProgress(progress, `Loading ${STORES_CONFIG[storeKey].name}...`);
            }

            const storeInventory = await fetchStoreInventory(storeKey, 100, forceRefresh);
            allInventory.push(...storeInventory);

            // Check if any item was not from cache
            if (storeInventory.some(item => !item.fromCache)) {
                fromCache = false;
            }

            completed++;
        } catch (error) {
            console.error(`Failed to fetch inventory from ${storeKey}:`, error);
            completed++;
        }
    }

    if (onProgress) {
        const message = fromCache ? 'Loaded from cache' : 'Complete!';
        onProgress(100, message);
    }

    return allInventory;
}

/**
 * Get stores config (for external use)
 */
function getStoresConfig() {
    return STORES_CONFIG;
}

// =============================================================================
// CACHE UTILITY EXPORTS
// =============================================================================
// Expose cache utilities for external use (e.g., manual refresh, stats display)

/**
 * Get cache configuration
 */
function getCacheConfig() {
    return CACHE_CONFIG;
}

/**
 * Force refresh all cached data for a specific store
 * @param {string} storeKey - Store identifier
 */
async function refreshStoreData(storeKey) {
    console.log(`🔄 [CACHE] Refreshing all data for store: ${storeKey}`);
    clearStoreCache(storeKey);

    // Pre-fetch fresh data
    try {
        await fetchStoreLocations(storeKey, true);
        await fetchStoreInventory(storeKey, 100, true);
        console.log(`✅ [CACHE] Store data refreshed: ${storeKey}`);
    } catch (error) {
        console.error(`❌ [CACHE] Error refreshing store data:`, error);
    }
}

/**
 * Force refresh all cached analytics data
 */
function refreshAnalyticsCache() {
    console.log('🔄 [CACHE] Clearing all analytics cache');
    const keys = Object.keys(localStorage).filter(k =>
        k.startsWith(CACHE_CONFIG.PREFIX) && k.includes('analytics')
    );
    keys.forEach(k => localStorage.removeItem(k));
    console.log(`🧹 [CACHE] Cleared ${keys.length} analytics cache entries`);
}


