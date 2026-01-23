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
// CONFIGURATION (Tokens stored in .env file)
// =============================================================================

// Get stores config with tokens from environment variables
const getStoresConfig = () => {
    return {
        vsu: {
            key: 'vsu',
            name: 'Vape Smoke Universe',
            shortName: 'VSU',
            storeUrl: 'v-s-u.myshopify.com',
            accessToken: process.env.SHOPIFY_VSU_TOKEN || '',
            hasMultipleLocations: true,
            locations: ['Miramar', 'Chula Vista', 'Morena', 'North Park', 'Kearny Mesa']
        },
        loyalvaper: {
            key: 'loyalvaper',
            name: 'Loyal Vaper',
            shortName: 'Loyal Vaper',
            storeUrl: 'k1xm3v-v0.myshopify.com',
            accessToken: process.env.SHOPIFY_LOYALVAPER_TOKEN || '',
            hasMultipleLocations: false
        },
        miramarwine: {
            key: 'miramarwine',
            name: 'Miramar Wine & Liquor',
            shortName: 'Miramar Wine & Liquor',
            storeUrl: 'a43265-2.myshopify.com',
            accessToken: process.env.SHOPIFY_MIRAMARWINE_TOKEN || '',
            hasMultipleLocations: false
        }
    };
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
    const STORES_CONFIG = getStoresConfig();
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

        const STORES_CONFIG = getStoresConfig();
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

        const STORES_CONFIG = getStoresConfig();
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
            const STORES_CONFIG = getStoresConfig();
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
        const STORES_CONFIG = getStoresConfig();
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

        // OpenAI API Key (stored in .env file)
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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


// =============================================================================
// PUSH NOTIFICATIONS - FCM Integration
// =============================================================================

/**
 * Process notification queue - triggered when new notification is added
 * Sends push notifications via FCM and marks as processed
 * Uses deduplication to prevent duplicate notifications
 */
exports.processNotificationQueue = functions.firestore
    .document('notification_queue/{docId}')
    .onCreate(async (snap, context) => {
        const notification = snap.data();
        const docId = context.params.docId;

        console.log(`📬 Processing notification: ${docId}`, notification.type);

        // Skip if already processed (deduplication)
        if (notification.status === 'sent' || notification.status === 'processed') {
            console.log(`⏭️ Notification ${docId} already processed, skipping`);
            return null;
        }

        try {
            const tokens = [];
            const targetType = notification.type;

            // Get target tokens based on notification type
            if (targetType === 'single' && notification.targetUserId) {
                // Single user notification
                const userTokens = await getTokensForUser(notification.targetUserId);
                tokens.push(...userTokens);
            } else if (targetType === 'role' && notification.targetRole) {
                // Role-based notification (e.g., all employees)
                const roleTokens = await getTokensForRole(notification.targetRole);
                tokens.push(...roleTokens);
            } else if (targetType === 'store' && notification.targetStoreId) {
                // Store-based notification
                const storeTokens = await getTokensForStore(notification.targetStoreId);
                tokens.push(...storeTokens);
            }

            if (tokens.length === 0) {
                console.log(`⚠️ No tokens found for notification ${docId}`);
                await snap.ref.update({
                    status: 'no_tokens',
                    processedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                return null;
            }

            // Prepare FCM message
            const message = {
                notification: {
                    title: notification.notification?.title || 'Ascendance',
                    body: notification.notification?.body || ''
                },
                data: {
                    type: notification.notification?.type || 'general',
                    page: notification.notification?.page || 'dashboard',
                    notificationId: docId,
                    timestamp: new Date().toISOString()
                },
                // Android specific
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    }
                },
                // iOS specific
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1
                        }
                    }
                },
                // Web specific
                webpush: {
                    notification: {
                        icon: '/img/icon-192.png',
                        badge: '/img/icon-192.png'
                    },
                    fcmOptions: {
                        link: `https://ascendancehub.com/index.html?page=${notification.notification?.page || 'dashboard'}`
                    }
                }
            };

            // Send to all tokens (batch, max 500 per call)
            const results = await sendToTokens(tokens, message);

            // Update notification status
            await snap.ref.update({
                status: 'sent',
                processedAt: admin.firestore.FieldValue.serverTimestamp(),
                tokensSent: results.successCount,
                tokensFailed: results.failureCount,
                totalTokens: tokens.length
            });

            console.log(`✅ Notification ${docId} sent to ${results.successCount}/${tokens.length} devices`);

            // Clean up invalid tokens
            if (results.failedTokens.length > 0) {
                await cleanupInvalidTokens(results.failedTokens);
            }

            return null;
        } catch (error) {
            console.error(`❌ Error processing notification ${docId}:`, error);
            await snap.ref.update({
                status: 'error',
                error: error.message,
                processedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return null;
        }
    });

/**
 * Process scheduled notifications - runs every minute
 * Checks for notifications that are due and sends them
 */
exports.processScheduledNotifications = functions
    .runWith({ timeoutSeconds: 60, memory: '256MB' })
    .pubsub.schedule('* * * * *') // Every minute
    .timeZone('America/Los_Angeles')
    .onRun(async (context) => {
        const now = new Date();
        console.log(`⏰ Checking scheduled notifications at ${now.toISOString()}`);

        try {
            // Get pending notifications that are due
            const snapshot = await db.collection('scheduled_notifications')
                .where('status', '==', 'pending')
                .where('scheduledFor', '<=', now.toISOString())
                .limit(50) // Process max 50 at a time
                .get();

            if (snapshot.empty) {
                return null;
            }

            console.log(`📋 Found ${snapshot.size} scheduled notifications to process`);

            const batch = db.batch();
            const notificationsToSend = [];

            for (const doc of snapshot.docs) {
                const data = doc.data();

                // Check if this is a clock-out reminder and user already clocked out
                if (data.type === 'clockout_reminder') {
                    const alreadyClockedOut = await checkIfClockedOut(data.employeeId, data.shiftEnd);
                    if (alreadyClockedOut) {
                        batch.update(doc.ref, {
                            status: 'skipped',
                            reason: 'already_clocked_out',
                            processedAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                        continue;
                    }
                }

                // Check if this is a clock-in reminder and user already clocked in
                if (data.type === 'clockin_reminder') {
                    const alreadyClockedIn = await checkIfClockedIn(data.employeeId, data.shiftStart);
                    if (alreadyClockedIn) {
                        batch.update(doc.ref, {
                            status: 'skipped',
                            reason: 'already_clocked_in',
                            processedAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                        continue;
                    }
                }

                // Queue the notification
                notificationsToSend.push({
                    docRef: doc.ref,
                    employeeId: data.employeeId,
                    notification: data.notification
                });

                // Mark as processing to prevent duplicate sends
                batch.update(doc.ref, { status: 'processing' });
            }

            await batch.commit();

            // Send notifications
            for (const item of notificationsToSend) {
                try {
                    const tokens = await getTokensForUser(item.employeeId);

                    if (tokens.length > 0) {
                        const message = {
                            notification: {
                                title: item.notification.title,
                                body: item.notification.body
                            },
                            data: {
                                type: item.notification.type,
                                page: item.notification.page || 'clockin',
                                timestamp: new Date().toISOString()
                            },
                            android: { priority: 'high', notification: { sound: 'default' } },
                            apns: { payload: { aps: { sound: 'default' } } },
                            webpush: { notification: { icon: '/img/icon-192.png' } }
                        };

                        await sendToTokens(tokens, message);
                        await item.docRef.update({
                            status: 'sent',
                            sentAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                        console.log(`✅ Sent scheduled notification to employee ${item.employeeId}`);
                    } else {
                        await item.docRef.update({
                            status: 'no_tokens',
                            processedAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                    }
                } catch (err) {
                    console.error(`❌ Failed to send to ${item.employeeId}:`, err);
                    await item.docRef.update({
                        status: 'error',
                        error: err.message
                    });
                }
            }

            return null;
        } catch (error) {
            console.error('❌ Error processing scheduled notifications:', error);
            return null;
        }
    });

/**
 * Send weekly schedule notification - runs every Sunday at 6 PM
 */
exports.sendWeeklyScheduleNotification = functions
    .runWith({ timeoutSeconds: 120, memory: '256MB' })
    .pubsub.schedule('0 18 * * 0') // Sundays at 6 PM
    .timeZone('America/Los_Angeles')
    .onRun(async (context) => {
        console.log('📅 Sending weekly schedule notifications...');

        try {
            // Get all employee tokens
            const tokensSnapshot = await db.collection('push_tokens').get();

            if (tokensSnapshot.empty) {
                console.log('⚠️ No push tokens found');
                return null;
            }

            const tokens = tokensSnapshot.docs.map(doc => doc.data().token).filter(t => t);

            const message = {
                notification: {
                    title: 'Weekly Schedule Available',
                    body: 'Your schedule for this week has been posted. Tap to view your shifts.'
                },
                data: {
                    type: 'schedule',
                    page: 'schedule',
                    timestamp: new Date().toISOString()
                },
                android: { priority: 'high', notification: { sound: 'default' } },
                apns: { payload: { aps: { sound: 'default' } } },
                webpush: {
                    notification: { icon: '/img/icon-192.png' },
                    fcmOptions: { link: 'https://ascendancehub.com/index.html?page=schedule' }
                }
            };

            const results = await sendToTokens(tokens, message);
            console.log(`✅ Weekly schedule notification sent to ${results.successCount}/${tokens.length} devices`);

            // Log to Firestore
            await db.collection('notification_logs').add({
                type: 'weekly_schedule',
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                successCount: results.successCount,
                failureCount: results.failureCount,
                totalTokens: tokens.length
            });

            return null;
        } catch (error) {
            console.error('❌ Error sending weekly schedule notification:', error);
            return null;
        }
    });

/**
 * HTTP endpoint: Send manual notification (admin only)
 */
exports.sendManualNotification = functions.https.onRequest(async (req, res) => {
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
        const { title, body, targetType, targetId } = req.body;

        if (!title || !body) {
            res.status(400).json({ error: 'Title and body are required' });
            return;
        }

        // Queue the notification
        const notificationRef = await db.collection('notification_queue').add({
            type: targetType || 'role',
            targetRole: targetType === 'role' ? (targetId || 'employee') : null,
            targetUserId: targetType === 'single' ? targetId : null,
            targetStoreId: targetType === 'store' ? targetId : null,
            notification: {
                title,
                body,
                type: 'manual',
                page: 'announcements'
            },
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            source: 'manual_api'
        });

        res.json({
            success: true,
            message: 'Notification queued',
            notificationId: notificationRef.id
        });
    } catch (error) {
        console.error('Error sending manual notification:', error);
        res.status(500).json({ error: error.message });
    }
});

// =============================================================================
// HELPER FUNCTIONS FOR NOTIFICATIONS
// =============================================================================

/**
 * Get FCM tokens for a specific user
 */
async function getTokensForUser(userId) {
    const tokens = [];

    // Try to find by odooId first
    const tokensByOdoo = await db.collection('push_tokens')
        .where('odooId', '==', userId)
        .get();

    tokensByOdoo.forEach(doc => {
        if (doc.data().token) tokens.push(doc.data().token);
    });

    // Also check employees collection
    try {
        const employeeDoc = await db.collection('employees').doc(userId).get();
        if (employeeDoc.exists && employeeDoc.data().pushToken) {
            const token = employeeDoc.data().pushToken;
            if (!tokens.includes(token)) tokens.push(token);
        }
    } catch (e) {
        // Ignore errors
    }

    return [...new Set(tokens)]; // Remove duplicates
}

/**
 * Get FCM tokens for all users with a specific role
 */
async function getTokensForRole(role) {
    const tokens = [];

    // Get tokens from push_tokens collection
    const snapshot = await db.collection('push_tokens')
        .where('role', '==', role)
        .get();

    snapshot.forEach(doc => {
        if (doc.data().token) tokens.push(doc.data().token);
    });

    // For 'employee' role, get all tokens (most common case)
    if (role === 'employee') {
        const allTokens = await db.collection('push_tokens').get();
        allTokens.forEach(doc => {
            if (doc.data().token && !tokens.includes(doc.data().token)) {
                tokens.push(doc.data().token);
            }
        });
    }

    return [...new Set(tokens)];
}

/**
 * Get FCM tokens for users in a specific store
 */
async function getTokensForStore(storeId) {
    const tokens = [];

    const snapshot = await db.collection('push_tokens')
        .where('storeId', '==', storeId)
        .get();

    snapshot.forEach(doc => {
        if (doc.data().token) tokens.push(doc.data().token);
    });

    return [...new Set(tokens)];
}

/**
 * Send FCM message to multiple tokens (handles batching)
 */
async function sendToTokens(tokens, message) {
    if (!tokens || tokens.length === 0) {
        return { successCount: 0, failureCount: 0, failedTokens: [] };
    }

    const uniqueTokens = [...new Set(tokens)];
    let successCount = 0;
    let failureCount = 0;
    const failedTokens = [];

    // FCM allows max 500 tokens per multicast
    const batchSize = 500;

    for (let i = 0; i < uniqueTokens.length; i += batchSize) {
        const batch = uniqueTokens.slice(i, i + batchSize);

        try {
            const response = await admin.messaging().sendEachForMulticast({
                tokens: batch,
                ...message
            });

            successCount += response.successCount;
            failureCount += response.failureCount;

            // Track failed tokens for cleanup
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const errorCode = resp.error?.code;
                    // These error codes indicate invalid/expired tokens
                    if (errorCode === 'messaging/invalid-registration-token' ||
                        errorCode === 'messaging/registration-token-not-registered') {
                        failedTokens.push(batch[idx]);
                    }
                }
            });
        } catch (error) {
            console.error('Error sending batch:', error);
            failureCount += batch.length;
        }
    }

    return { successCount, failureCount, failedTokens };
}

/**
 * Clean up invalid tokens from database
 */
async function cleanupInvalidTokens(tokens) {
    if (!tokens || tokens.length === 0) return;

    const batch = db.batch();
    let count = 0;

    for (const token of tokens) {
        try {
            const snapshot = await db.collection('push_tokens')
                .where('token', '==', token)
                .get();

            snapshot.forEach(doc => {
                batch.delete(doc.ref);
                count++;
            });
        } catch (e) {
            console.warn('Error finding token to delete:', e);
        }
    }

    if (count > 0) {
        await batch.commit();
        console.log(`🧹 Cleaned up ${count} invalid tokens`);
    }
}

/**
 * Check if employee already clocked in for the shift
 */
async function checkIfClockedIn(employeeId, shiftStart) {
    try {
        const shiftDate = new Date(shiftStart).toISOString().split('T')[0];

        const snapshot = await db.collection('clockin')
            .where('odooId', '==', employeeId)
            .where('date', '==', shiftDate)
            .where('type', '==', 'in')
            .limit(1)
            .get();

        return !snapshot.empty;
    } catch (e) {
        return false; // If error, send notification anyway
    }
}

/**
 * Check if employee already clocked out for the shift
 */
async function checkIfClockedOut(employeeId, shiftEnd) {
    try {
        const shiftDate = new Date(shiftEnd).toISOString().split('T')[0];

        const snapshot = await db.collection('clockin')
            .where('odooId', '==', employeeId)
            .where('date', '==', shiftDate)
            .where('type', '==', 'out')
            .limit(1)
            .get();

        return !snapshot.empty;
    } catch (e) {
        return false;
    }
}

