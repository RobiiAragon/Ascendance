/**
 * Firebase Cloud Functions - Automated Shopify Analytics Sync
 *
 * This module runs scheduled jobs to fetch analytics from Shopify
 * and store them in Firestore for instant access from the frontend.
 *
 * Schedule: Every night at midnight (Pacific Time)
 * Also runs: Every 6 hours for fresher data
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// =============================================================================
// CONFIGURATION
// =============================================================================

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

// Firestore collection for cached analytics
const ANALYTICS_COLLECTION = 'shopify_analytics_cache';
const SYNC_LOG_COLLECTION = 'shopify_sync_logs';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get date range for a given period
 */
function getDateRange(period) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let since, until;

    switch (period) {
        case 'today':
            since = new Date(today);
            until = new Date(today);
            until.setHours(23, 59, 59, 999);
            break;
        case 'week':
            since = new Date(today);
            since.setDate(today.getDate() - today.getDay());
            until = new Date(today);
            until.setHours(23, 59, 59, 999);
            break;
        case 'month':
            since = new Date(today.getFullYear(), today.getMonth(), 1);
            until = new Date(today);
            until.setHours(23, 59, 59, 999);
            break;
        case 'quarter':
            since = new Date(today);
            since.setMonth(today.getMonth() - 3);
            until = new Date(today);
            until.setHours(23, 59, 59, 999);
            break;
        case 'year':
            since = new Date(today.getFullYear(), 0, 1);
            until = new Date(today);
            until.setHours(23, 59, 59, 999);
            break;
        default:
            since = new Date(today.getFullYear(), today.getMonth(), 1);
            until = new Date(today);
            until.setHours(23, 59, 59, 999);
    }

    return {
        since: since.toISOString(),
        until: until.toISOString()
    };
}

/**
 * Build GraphQL query for bulk orders export
 */
function buildBulkOrdersQuery(startDate, endDate) {
    return `
        {
            orders(query: "created_at:>='${startDate}' AND created_at:<='${endDate}' AND financial_status:paid") {
                edges {
                    node {
                        id
                        name
                        createdAt
                        totalPriceSet {
                            shopMoney {
                                amount
                                currencyCode
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
                        taxLines {
                            title
                            rate
                            priceSet {
                                shopMoney {
                                    amount
                                }
                            }
                        }
                        paymentGatewayNames
                        fulfillmentOrders(first: 5) {
                            edges {
                                node {
                                    assignedLocation {
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
    `;
}

/**
 * Fetch from Shopify GraphQL API
 */
async function fetchShopifyGraphQL(query, storeConfig) {
    const url = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'X-Shopify-Access-Token': storeConfig.accessToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
    });

    if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Start bulk operation
 */
async function startBulkOperation(startDate, endDate, storeConfig) {
    const innerQuery = buildBulkOrdersQuery(startDate, endDate);

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

    const result = await fetchShopifyGraphQL(mutation, storeConfig);

    if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    const { bulkOperation, userErrors } = result.data.bulkOperationRunQuery;

    if (userErrors && userErrors.length > 0) {
        throw new Error(`User errors: ${userErrors.map(e => e.message).join(', ')}`);
    }

    return bulkOperation;
}

/**
 * Poll bulk operation until complete
 */
async function pollBulkOperation(storeConfig, maxAttempts = 60) {
    const query = `
        query {
            currentBulkOperation {
                id
                status
                errorCode
                objectCount
                fileSize
                url
                createdAt
            }
        }
    `;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const result = await fetchShopifyGraphQL(query, storeConfig);
        const op = result.data?.currentBulkOperation;

        if (!op) {
            throw new Error('No bulk operation found');
        }

        if (op.status === 'COMPLETED') {
            return op;
        }

        if (op.status === 'FAILED') {
            throw new Error(`Bulk operation failed: ${op.errorCode}`);
        }

        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    throw new Error('Bulk operation timed out');
}

/**
 * Download and parse NDJSON bulk data
 */
async function downloadBulkData(url) {
    const response = await fetch(url);
    const text = await response.text();

    const orders = [];
    const lines = text.trim().split('\n');

    for (const line of lines) {
        if (line.trim()) {
            try {
                const obj = JSON.parse(line);
                if (obj.id && obj.id.includes('/Order/')) {
                    orders.push(obj);
                }
            } catch (e) {
                console.warn('Failed to parse line:', e);
            }
        }
    }

    return orders;
}

/**
 * Process orders into analytics summary
 */
function processOrdersToAnalytics(orders, storeConfig, period, dateRange) {
    let totalSales = 0;
    let totalTax = 0;
    let totalCecetTax = 0;
    let totalSalesTax = 0;
    let cashSales = 0;
    let cardSales = 0;
    const dailyData = {};
    const hourlyData = {};

    for (const order of orders) {
        const amount = parseFloat(order.totalPriceSet?.shopMoney?.amount || 0);
        const tax = parseFloat(order.totalTaxSet?.shopMoney?.amount || 0);

        totalSales += amount;
        totalTax += tax;

        // Parse tax lines
        if (order.taxLines) {
            for (const taxLine of order.taxLines) {
                const taxAmount = parseFloat(taxLine.priceSet?.shopMoney?.amount || 0);
                const taxTitle = (taxLine.title || '').toLowerCase();

                if (taxTitle.includes('cecet') || taxTitle.includes('excise')) {
                    totalCecetTax += taxAmount;
                } else {
                    totalSalesTax += taxAmount;
                }
            }
        }

        // Payment method
        const gateways = order.paymentGatewayNames || [];
        const isCash = gateways.some(g =>
            g.toLowerCase().includes('cash') ||
            g.toLowerCase().includes('manual')
        );

        if (isCash) {
            cashSales += amount;
        } else {
            cardSales += amount;
        }

        // Daily aggregation
        const orderDate = new Date(order.createdAt);
        const dateKey = orderDate.toISOString().split('T')[0];

        if (!dailyData[dateKey]) {
            dailyData[dateKey] = { sales: 0, orders: 0, tax: 0 };
        }
        dailyData[dateKey].sales += amount;
        dailyData[dateKey].orders += 1;
        dailyData[dateKey].tax += tax;

        // Hourly aggregation
        const hour = orderDate.getHours();
        if (!hourlyData[hour]) {
            hourlyData[hour] = { sales: 0, orders: 0 };
        }
        hourlyData[hour].sales += amount;
        hourlyData[hour].orders += 1;
    }

    const totalOrders = orders.length;

    return {
        summary: {
            totalSales: totalSales.toFixed(2),
            netSales: (totalSales - totalTax).toFixed(2),
            totalTax: totalTax.toFixed(2),
            totalCecetTax: totalCecetTax.toFixed(2),
            totalSalesTax: totalSalesTax.toFixed(2),
            totalOrders,
            avgOrderValue: totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : '0.00',
            totalCashSales: cashSales.toFixed(2),
            totalCardSales: cardSales.toFixed(2),
            currency: 'USD'
        },
        daily: dailyData,
        hourly: hourlyData,
        storeInfo: {
            key: storeConfig.key,
            name: storeConfig.name,
            shortName: storeConfig.shortName
        },
        dateRange: {
            period,
            since: dateRange.since,
            until: dateRange.until
        },
        syncedAt: new Date().toISOString()
    };
}

/**
 * Fetch analytics for a single store
 */
async function fetchStoreAnalytics(storeKey, period) {
    const storeConfig = STORES_CONFIG[storeKey];
    if (!storeConfig) {
        throw new Error(`Invalid store key: ${storeKey}`);
    }

    const dateRange = getDateRange(period);
    console.log(`📊 [${storeConfig.name}] Fetching ${period} analytics...`);

    // Start bulk operation
    await startBulkOperation(dateRange.since, dateRange.until, storeConfig);

    // Poll until complete
    const completedOp = await pollBulkOperation(storeConfig);

    if (!completedOp.url) {
        // No orders in range
        return {
            summary: {
                totalSales: '0.00',
                netSales: '0.00',
                totalTax: '0.00',
                totalCecetTax: '0.00',
                totalSalesTax: '0.00',
                totalOrders: 0,
                avgOrderValue: '0.00',
                totalCashSales: '0.00',
                totalCardSales: '0.00',
                currency: 'USD'
            },
            daily: {},
            hourly: {},
            storeInfo: {
                key: storeConfig.key,
                name: storeConfig.name,
                shortName: storeConfig.shortName
            },
            dateRange: {
                period,
                since: dateRange.since,
                until: dateRange.until
            },
            syncedAt: new Date().toISOString()
        };
    }

    // Download and parse data
    const orders = await downloadBulkData(completedOp.url);
    console.log(`📦 [${storeConfig.name}] Downloaded ${orders.length} orders`);

    // Process into analytics
    return processOrdersToAnalytics(orders, storeConfig, period, dateRange);
}

/**
 * Save analytics to Firestore
 */
async function saveAnalyticsToFirestore(storeKey, period, analytics) {
    const docId = `${storeKey}_${period}`;

    await db.collection(ANALYTICS_COLLECTION).doc(docId).set({
        ...analytics,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`💾 Saved ${docId} to Firestore`);
}

/**
 * Log sync operation
 */
async function logSyncOperation(status, details) {
    await db.collection(SYNC_LOG_COLLECTION).add({
        status,
        details,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
}

// =============================================================================
// CLOUD FUNCTIONS
// =============================================================================

/**
 * Scheduled function: Runs every night at midnight (Pacific Time)
 * Syncs all stores for all periods
 */
exports.scheduledAnalyticsSync = functions
    .runWith({ timeoutSeconds: 540, memory: '1GB' })
    .pubsub.schedule('0 0 * * *')
    .timeZone('America/Los_Angeles')
    .onRun(async (context) => {
        console.log('🌙 Starting nightly analytics sync...');

        const stores = Object.keys(STORES_CONFIG);
        const periods = ['today', 'week', 'month', 'quarter', 'year'];
        const results = { success: [], failed: [] };

        for (const storeKey of stores) {
            for (const period of periods) {
                try {
                    console.log(`⏳ Syncing ${storeKey} - ${period}...`);
                    const analytics = await fetchStoreAnalytics(storeKey, period);
                    await saveAnalyticsToFirestore(storeKey, period, analytics);
                    results.success.push(`${storeKey}_${period}`);
                } catch (error) {
                    console.error(`❌ Failed ${storeKey} - ${period}:`, error.message);
                    results.failed.push({ store: storeKey, period, error: error.message });
                }

                // Small delay between requests to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        await logSyncOperation('completed', results);
        console.log('✅ Nightly sync completed:', results);

        return null;
    });

/**
 * Scheduled function: Runs every 6 hours for fresher data
 * Only syncs today, week, and month (most viewed periods)
 */
exports.frequentAnalyticsSync = functions
    .runWith({ timeoutSeconds: 300, memory: '512MB' })
    .pubsub.schedule('0 */6 * * *')
    .timeZone('America/Los_Angeles')
    .onRun(async (context) => {
        console.log('🔄 Starting 6-hour analytics sync...');

        const stores = Object.keys(STORES_CONFIG);
        const periods = ['today', 'week', 'month']; // Only frequent periods
        const results = { success: [], failed: [] };

        for (const storeKey of stores) {
            for (const period of periods) {
                try {
                    const analytics = await fetchStoreAnalytics(storeKey, period);
                    await saveAnalyticsToFirestore(storeKey, period, analytics);
                    results.success.push(`${storeKey}_${period}`);
                } catch (error) {
                    console.error(`❌ Failed ${storeKey} - ${period}:`, error.message);
                    results.failed.push({ store: storeKey, period, error: error.message });
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        await logSyncOperation('frequent_sync', results);
        console.log('✅ 6-hour sync completed');

        return null;
    });

/**
 * HTTP function: Manual trigger for immediate sync
 * Usage: Call this endpoint to force a sync
 */
exports.manualAnalyticsSync = functions
    .runWith({ timeoutSeconds: 540, memory: '1GB' })
    .https.onRequest(async (req, res) => {
        // CORS headers
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST');

        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        const storeKey = req.query.store || 'all';
        const period = req.query.period || 'month';

        console.log(`🔧 Manual sync triggered: store=${storeKey}, period=${period}`);

        try {
            const stores = storeKey === 'all' ? Object.keys(STORES_CONFIG) : [storeKey];
            const results = [];

            for (const store of stores) {
                const analytics = await fetchStoreAnalytics(store, period);
                await saveAnalyticsToFirestore(store, period, analytics);
                results.push({ store, period, success: true });
            }

            res.json({ success: true, results });
        } catch (error) {
            console.error('Manual sync failed:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

/**
 * HTTP function: Get cached analytics from Firestore
 * This is what the frontend calls instead of hitting Shopify directly
 */
exports.getCachedAnalytics = functions.https.onRequest(async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    const storeKey = req.query.store || 'vsu';
    const period = req.query.period || 'month';
    const docId = `${storeKey}_${period}`;

    try {
        const doc = await db.collection(ANALYTICS_COLLECTION).doc(docId).get();

        if (!doc.exists) {
            res.status(404).json({ error: 'No cached data found', docId });
            return;
        }

        const data = doc.data();
        data.fromCache = true;
        // Calculate cache age in minutes from syncedAt ISO string
        if (data.syncedAt) {
            const syncTime = new Date(data.syncedAt).getTime();
            data.cacheAge = Math.round((Date.now() - syncTime) / (1000 * 60)); // in minutes
        } else {
            data.cacheAge = 999; // Unknown age, treat as old
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching cached analytics:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * HTTP function: Get all stores analytics at once
 */
exports.getAllStoresAnalytics = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    const period = req.query.period || 'month';

    try {
        const stores = Object.keys(STORES_CONFIG);
        const results = { stores: {}, summary: { totalSales: 0, totalOrders: 0, totalTax: 0 } };

        for (const storeKey of stores) {
            const docId = `${storeKey}_${period}`;
            const doc = await db.collection(ANALYTICS_COLLECTION).doc(docId).get();

            if (doc.exists) {
                const data = doc.data();
                results.stores[storeKey] = data;
                results.summary.totalSales += parseFloat(data.summary?.totalSales || 0);
                results.summary.totalOrders += data.summary?.totalOrders || 0;
                results.summary.totalTax += parseFloat(data.summary?.totalTax || 0);
            }
        }

        results.summary.totalSales = results.summary.totalSales.toFixed(2);
        results.summary.totalTax = results.summary.totalTax.toFixed(2);
        results.period = period;
        results.fromCache = true;

        res.json(results);
    } catch (error) {
        console.error('Error fetching all stores:', error);
        res.status(500).json({ error: error.message });
    }
});

// =============================================================================
// POD MATCHER - OpenAI Vision API Integration
// =============================================================================

/**
 * HTTP function: Analyze vape device image using OpenAI Vision API
 * Returns device identification and compatible pods/coils
 */
exports.podMatcherAnalyze = functions.https.onRequest(async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { image } = req.body;

        if (!image) {
            res.status(400).json({ error: 'No image provided' });
            return;
        }

        // OpenAI API Key (store in Firebase config: firebase functions:config:set openai.key="YOUR_KEY")
        const OPENAI_API_KEY = functions.config().openai?.key;

        if (!OPENAI_API_KEY) {
            console.error('OpenAI API key not configured');
            res.status(500).json({ error: 'OpenAI API key not configured' });
            return;
        }

        // Call OpenAI Vision API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `You are a vape device identification expert. When shown an image of a vape device, you must:
1. Identify the brand and exact model name
2. Identify what type of coils or pods it uses
3. List ALL compatible replacement pods and coils by their product names

You must respond ONLY with valid JSON in this exact format:
{
    "brand": "SMOK",
    "model": "Nord 4",
    "coilType": "RPM/RPM2",
    "compatiblePods": ["Nord 4 RPM Pod", "Nord 4 RPM 2 Pod", "RPM Coil", "RPM 2 Coil", "RPM Mesh 0.4ohm", "RPM Triple Coil"],
    "confidence": "high",
    "notes": "Any additional compatibility notes"
}

For the compatiblePods array, include:
- The exact pod/cartridge names that fit this device
- All compatible coil series (RPM, GTX, PnP, etc.)
- Specific coil resistances when known (0.4ohm, 0.8ohm, etc.)
- Cross-compatible coils from other brands if applicable

Common vape brands: SMOK, Voopoo, Vaporesso, GeekVape, Uwell, Freemax, Lost Vape, Aspire, Innokin
Common coil series: RPM, RPM2, LP2, GTX, PnP, G-Coil, B-Series, Aegis Boost, UN2

If you cannot identify the device, still provide your best guess with confidence: "low".`
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Identify this vape device and list all compatible pods and coils. Respond only with JSON.'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: image,
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
            const errorData = await response.json().catch(() => ({}));
            console.error('OpenAI API error:', response.status, errorData);
            res.status(500).json({ error: 'Failed to analyze image', details: errorData });
            return;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            res.status(500).json({ error: 'No response from AI' });
            return;
        }

        // Parse JSON response from OpenAI
        let result;
        try {
            // Remove any markdown code blocks if present
            const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            result = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error('Failed to parse OpenAI response:', content);
            res.status(500).json({
                error: 'Failed to parse AI response',
                raw: content
            });
            return;
        }

        // Log successful analysis
        console.log('Pod Matcher Analysis:', {
            brand: result.brand,
            model: result.model,
            compatiblePods: result.compatiblePods?.length || 0
        });

        res.json(result);

    } catch (error) {
        console.error('Pod Matcher error:', error);
        res.status(500).json({ error: error.message });
    }
});


