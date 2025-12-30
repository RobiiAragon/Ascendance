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

// CORS Proxy Configuration
const CORS_PROXY = 'https://corsproxy.io/?';

/**
 * Helper function to format a date as YYYY-MM-DD in LOCAL timezone
 * This avoids timezone conversion issues with toISOString()
 */
function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

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
 * Check current bulk operation status
 */
async function checkBulkOperationStatus(storeConfig) {
    const graphqlUrl = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;

    const query = `
        query {
            currentBulkOperation {
                id
                status
                errorCode
                objectCount
                url
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
            body: JSON.stringify({ query })
        });

        if (!response.ok) return null;

        const result = await response.json();
        return result.data?.currentBulkOperation || null;
    } catch (error) {
        console.error('[BULK] Failed to check status:', error);
        return null;
    }
}

/**
 * Cancel the current bulk operation for a store
 * Always attempts to cancel to ensure a clean slate for new operations
 * Can also cancel a specific operation by ID
 */
async function cancelBulkOperation(storeKey = 'vsu', operationId = null) {
    const storeConfig = STORES_CONFIG[storeKey];
    if (!storeConfig) {
        console.warn('[BULK CANCEL] Invalid store key:', storeKey);
        return false;
    }

    const graphqlUrl = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;

    // First check if there's an operation
    const currentOp = await checkBulkOperationStatus(storeConfig);

    if (!currentOp) {
        console.log('[BULK CANCEL] No bulk operation exists');
        return true;
    }

    const targetId = operationId || currentOp.id;
    console.log(`[BULK CANCEL] Current operation: ${currentOp.id} - Status: ${currentOp.status}`);

    // If already canceled or failed, no need to cancel
    if (currentOp.status === 'CANCELED' || currentOp.status === 'FAILED') {
        console.log(`[BULK CANCEL] Operation already ${currentOp.status}, no cancel needed`);
        return true;
    }

    // For COMPLETED operations, we're ready for a new one
    if (currentOp.status === 'COMPLETED') {
        console.log('[BULK CANCEL] Previous operation completed, ready for new operation');
        return true;
    }

    // For RUNNING or CREATED operations, we MUST cancel to start a new one
    console.log(`[BULK CANCEL] Found active operation (${currentOp.status}), must cancel it first`);

    // Use the specific cancel mutation with the operation ID
    const mutation = `
        mutation {
            bulkOperationCancel(id: "${targetId}") {
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
        console.log('[BULK CANCEL] Canceling bulk operation for:', storeConfig.name);

        const response = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': storeConfig.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: mutation })
        });

        if (!response.ok) {
            console.warn('[BULK CANCEL] Request failed:', response.status);
            return false;
        }

        const result = await response.json();

        if (result.errors) {
            console.warn('[BULK CANCEL] GraphQL errors:', result.errors);
            return false;
        }

        const { bulkOperation, userErrors } = result.data.bulkOperationCancel;

        if (userErrors && userErrors.length > 0) {
            const noOpError = userErrors.find(e => e.message.includes('No bulk operation'));
            if (noOpError) {
                console.log('[BULK CANCEL] No bulk operation was in progress');
                return true;
            }
            console.warn('[BULK CANCEL] User errors:', userErrors);
            return false;
        }

        if (bulkOperation) {
            console.log(`[BULK CANCEL] Canceled: ${bulkOperation.id} (${bulkOperation.status})`);
        }

        // Wait and verify the operation is truly canceled/completed
        console.log('[BULK CANCEL] Waiting for operation to fully cancel...');
        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const status = await checkBulkOperationStatus(storeConfig);
            if (!status || status.status === 'COMPLETED' || status.status === 'CANCELED' || status.status === 'FAILED') {
                console.log(`[BULK CANCEL] Operation is now ${status?.status || 'cleared'}`);
                return true;
            }
            console.log(`[BULK CANCEL] Still waiting... Status: ${status.status}`);
        }

        console.warn('[BULK CANCEL] Operation did not fully cancel in time');
        return false;

    } catch (error) {
        console.error('[BULK CANCEL] Failed:', error);
        return false;
    }
}

/**
 * Force cancel a bulk operation by ID without checking status first
 * This is used when Shopify reports a conflict but status check shows COMPLETED
 * @param {Object} storeConfig - Store configuration
 * @param {string} operationId - The operation ID to cancel (gid://shopify/BulkOperation/xxx)
 */
async function forceCancelBulkOperation(storeConfig, operationId) {
    const graphqlUrl = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;

    console.log(`[BULK FORCE CANCEL] Attempting to force cancel: ${operationId}`);

    const mutation = `
        mutation {
            bulkOperationCancel(id: "${operationId}") {
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
        // Add cache-busting timestamp to avoid CORS proxy cache issues
        const response = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': storeConfig.accessToken,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            body: JSON.stringify({
                query: mutation,
                _nocache: Date.now() // Cache buster in body
            })
        });

        if (!response.ok) {
            console.warn('[BULK FORCE CANCEL] Request failed:', response.status);
            return false;
        }

        const result = await response.json();
        console.log('[BULK FORCE CANCEL] Response:', JSON.stringify(result, null, 2));

        if (result.errors) {
            console.warn('[BULK FORCE CANCEL] GraphQL errors:', result.errors);
            return false;
        }

        const { bulkOperation, userErrors } = result.data?.bulkOperationCancel || {};

        if (userErrors && userErrors.length > 0) {
            // Check if the error is because there's no operation (which is fine)
            const noOpError = userErrors.find(e =>
                e.message.includes('No bulk operation') ||
                e.message.includes('no existe') ||
                e.message.includes('not found')
            );
            if (noOpError) {
                console.log('[BULK FORCE CANCEL] No active operation found (already canceled or completed)');
                return true;
            }
            console.warn('[BULK FORCE CANCEL] User errors:', userErrors);
            return false;
        }

        if (bulkOperation) {
            console.log(`[BULK FORCE CANCEL] Result: ${bulkOperation.id} - Status: ${bulkOperation.status}`);
        }

        // Wait a bit for Shopify to process the cancellation
        await new Promise(resolve => setTimeout(resolve, 2000));

        return true;
    } catch (error) {
        console.error('[BULK FORCE CANCEL] Failed:', error);
        return false;
    }
}

// =============================================================================
// BULK OPERATIONS API - For fetching large datasets efficiently
// =============================================================================

/**
 * Build GraphQL query for bulk orders export
 * Uses ISO 8601 format with timezone for accurate date filtering
 */
function buildBulkOrdersQuery(startDate, endDate) {
    // startDate: inclusive (>=) - start of day in local timezone
    // endDate: inclusive, so we query up to end of that day

    // Parse the dates to get local date components
    let startYear, startMonth, startDay;
    let endYear, endMonth, endDay;

    if (typeof startDate === 'string') {
        [startYear, startMonth, startDay] = startDate.split('T')[0].split('-').map(Number);
    } else {
        startYear = startDate.getFullYear();
        startMonth = startDate.getMonth() + 1;
        startDay = startDate.getDate();
    }

    if (typeof endDate === 'string') {
        [endYear, endMonth, endDay] = endDate.split('T')[0].split('-').map(Number);
    } else {
        endYear = endDate.getFullYear();
        endMonth = endDate.getMonth() + 1;
        endDay = endDate.getDate();
    }

    // Create Date objects at LOCAL midnight for start and end+1 day
    const startLocal = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
    const endLocalPlusOne = new Date(endYear, endMonth - 1, endDay + 1, 0, 0, 0, 0);

    // Format as ISO 8601 with timezone offset for Shopify
    // This ensures Shopify knows exactly what timezone we mean
    const formatWithTimezone = (date) => {
        const offset = -date.getTimezoneOffset();
        const sign = offset >= 0 ? '+' : '-';
        const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
        const minutes = String(Math.abs(offset) % 60).padStart(2, '0');
        return `${formatLocalDate(date)}T00:00:00${sign}${hours}:${minutes}`;
    };

    const startISO = formatWithTimezone(startLocal);
    const endISO = formatWithTimezone(endLocalPlusOne);

    console.log(`[BULK] Date range: ${formatLocalDate(startLocal)} to ${formatLocalDate(new Date(endYear, endMonth - 1, endDay))}`);
    console.log(`[BULK] Query timestamps: >= ${startISO} AND < ${endISO}`);

    const query = `
        {
            orders(query: "created_at:>=${startISO} AND created_at:<${endISO}") {
                edges {
                    node {
                        id
                        name
                        createdAt
                        displayFinancialStatus
                        displayFulfillmentStatus
                        totalPriceSet {
                            shopMoney {
                                amount
                                currencyCode
                            }
                        }
                        totalTaxSet {
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
                        customer {
                            firstName
                            lastName
                        }
                        lineItems(first: 50) {
                            edges {
                                node {
                                    name
                                    sku
                                    quantity
                                    originalUnitPriceSet {
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
    `;

    return query;
}

/**
 * Start a bulk operation query
 */
async function startBulkOperation(startDate, endDate, storeConfig) {
    const graphqlUrl = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;
    const innerQuery = buildBulkOrdersQuery(startDate, endDate);

    const mutation = `
        mutation {
            bulkOperationRunQuery(
                query: """${innerQuery}"""
            ) {
                bulkOperation {
                    id
                    status
                    errorCode
                    objectCount
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `;

    console.log('[BULK] Starting bulk operation...');
    console.log('[BULK] GraphQL URL:', graphqlUrl);

    const response = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
        method: 'POST',
        headers: {
            'X-Shopify-Access-Token': storeConfig.accessToken,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        body: JSON.stringify({
            query: mutation,
            _nocache: Date.now() // Cache buster to avoid CORS proxy cache issues
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[BULK] Start failed - Status:', response.status, 'Response:', errorText);
        throw new Error(`Bulk operation start failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('[BULK] Start response:', JSON.stringify(result, null, 2));

    if (result.errors) {
        console.error('[BULK] GraphQL errors:', result.errors);
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    const { bulkOperation, userErrors } = result.data.bulkOperationRunQuery;

    if (userErrors && userErrors.length > 0) {
        console.error('[BULK] User errors:', userErrors);
        // Check if error is about existing operation (in English or Spanish)
        const existingOpError = userErrors.find(e =>
            e.message.toLowerCase().includes('already') ||
            e.message.toLowerCase().includes('in progress') ||
            e.message.toLowerCase().includes('running') ||
            e.message.toLowerCase().includes('en curso') ||
            e.message.includes('gid://shopify/BulkOperation/')
        );
        if (existingOpError) {
            console.warn('[BULK] Another operation is already running. Need to cancel first.');
            throw new Error(`EXISTING_OPERATION: ${existingOpError.message}`);
        }
        throw new Error(`User errors: ${userErrors.map(e => e.message).join(', ')}`);
    }

    if (!bulkOperation || !bulkOperation.id) {
        console.error('[BULK] No bulk operation returned');
        throw new Error('No bulk operation was created');
    }

    console.log('[BULK] Operation started successfully:', bulkOperation);
    console.log('[BULK] New operation ID:', bulkOperation.id);
    return bulkOperation;
}

/**
 * Poll bulk operation until complete
 * Uses currentBulkOperation as primary (recommended for API 2024-01)
 * Falls back to direct ID query if needed
 *
 * @param {Object} storeConfig - Store configuration
 * @param {string} expectedOperationId - The ID of the operation we started
 * @param {Function} onProgress - Progress callback
 * @param {number} maxAttempts - Maximum polling attempts
 */
async function pollBulkOperation(storeConfig, expectedOperationId = null, onProgress = null, maxAttempts = 120) {
    const graphqlUrl = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;

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
                completedAt
            }
        }
    `;

    let zeroObjectCount = 0;
    const maxZeroAttempts = 60; // If 0 objects for 60 polls (~3 min), something is wrong

    // Wait a moment before first poll to give Shopify time to register the new operation
    console.log('[BULK] Waiting for Shopify to process new operation...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            // ALWAYS query our specific operation directly by ID first
            // This is more reliable than currentBulkOperation which can have caching issues
            if (expectedOperationId) {
                const ourOp = await queryBulkOperationById(storeConfig, expectedOperationId);
                if (ourOp) {
                    const shortId = expectedOperationId.split('/').pop();
                    console.log(`[BULK] Poll #${attempt + 1}: Direct query - Status: ${ourOp.status}, Objects: ${ourOp.objectCount || 0}, ID: ${shortId}`);

                    // Update progress
                    if (onProgress) {
                        const progress = Math.min(20 + (attempt), 85);
                        const objectInfo = ourOp.objectCount > 0 ? ` - ${ourOp.objectCount} objects` : '';
                        onProgress(progress, `Processing${objectInfo}...`);
                    }

                    if (ourOp.status === 'COMPLETED') {
                        console.log('[BULK] Operation completed!');
                        console.log('[BULK] URL:', ourOp.url ? 'Available' : 'Not available');
                        console.log('[BULK] Object count:', ourOp.objectCount);
                        return ourOp;
                    }
                    if (ourOp.status === 'FAILED') {
                        throw new Error(`Bulk operation failed: ${ourOp.errorCode}`);
                    }
                    if (ourOp.status === 'CANCELED') {
                        throw new Error('Bulk operation was canceled');
                    }

                    // Track if stuck at 0 objects for too long
                    if (ourOp.status === 'RUNNING' && (ourOp.objectCount || 0) === 0) {
                        zeroObjectCount++;
                        // After 20 polls with 0 objects, also check currentBulkOperation
                        if (zeroObjectCount > 20 && zeroObjectCount % 10 === 0) {
                            console.log('[BULK] Checking currentBulkOperation as fallback...');
                            const response = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
                                method: 'POST',
                                headers: {
                                    'X-Shopify-Access-Token': storeConfig.accessToken,
                                    'Content-Type': 'application/json',
                                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                                    'Pragma': 'no-cache'
                                },
                                body: JSON.stringify({ query, variables: { _nocache: Date.now() } })
                            });
                            const result = await response.json();
                            const currentOp = result.data?.currentBulkOperation;
                            if (currentOp) {
                                console.log(`[BULK] currentBulkOperation: ${currentOp.status}, objects: ${currentOp.objectCount}, id: ${currentOp.id.split('/').pop()}`);
                                // If currentBulkOperation shows completed with same or different ID, check if it has our data
                                if (currentOp.status === 'COMPLETED' && currentOp.url) {
                                    console.log('[BULK] Found completed operation in currentBulkOperation!');
                                    return currentOp;
                                }
                            }
                        }

                        if (zeroObjectCount >= maxZeroAttempts) {
                            console.warn('[BULK] Operation stuck at 0 objects for too long');
                            // One final check via currentBulkOperation
                            const response = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
                                method: 'POST',
                                headers: {
                                    'X-Shopify-Access-Token': storeConfig.accessToken,
                                    'Content-Type': 'application/json',
                                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                                    'Pragma': 'no-cache'
                                },
                                body: JSON.stringify({ query, variables: { _nocache: Date.now() } })
                            });
                            const result = await response.json();
                            const currentOp = result.data?.currentBulkOperation;
                            if (currentOp && currentOp.status === 'COMPLETED' && currentOp.url) {
                                console.log('[BULK] Final check found completed operation!');
                                return currentOp;
                            }
                            return { status: 'COMPLETED', url: null, objectCount: 0 };
                        }
                    } else {
                        zeroObjectCount = 0; // Reset if we see objects
                    }

                    // Wait before next poll (3 seconds)
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    continue;
                }
            }

            // Fallback: use currentBulkOperation if direct query failed
            const response = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
                method: 'POST',
                headers: {
                    'X-Shopify-Access-Token': storeConfig.accessToken,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                },
                body: JSON.stringify({ query, variables: { _nocache: Date.now() } })
            });

            if (!response.ok) {
                console.warn(`[BULK] Poll request failed: ${response.status}, retrying...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                continue;
            }

            const result = await response.json();
            const op = result.data?.currentBulkOperation;

            if (!op) {
                console.log('[BULK] No bulk operation found');
                return { status: 'COMPLETED', url: null, objectCount: 0 };
            }

            const shortId = op.id.split('/').pop();
            console.log(`[BULK] Poll #${attempt + 1} (fallback): ${op.status} - Objects: ${op.objectCount || 0} - ID: ${shortId}`);

            if (op.status === 'COMPLETED') {
                console.log('[BULK] Operation completed!');
                return op;
            }

            if (op.status === 'FAILED') {
                throw new Error(`Bulk operation failed: ${op.errorCode}`);
            }

            if (op.status === 'CANCELED') {
                throw new Error('Bulk operation was canceled');
            }

            // Wait before next poll (3 seconds)
            await new Promise(resolve => setTimeout(resolve, 3000));

        } catch (error) {
            console.error(`[BULK] Poll error:`, error);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    throw new Error('Bulk operation timed out after ' + maxAttempts + ' attempts');
}

/**
 * Query a specific bulk operation by ID
 * This is useful when currentBulkOperation returns an old operation
 */
async function queryBulkOperationById(storeConfig, operationId) {
    const graphqlUrl = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;

    const query = `
        query getBulkOperation($id: ID!) {
            node(id: $id) {
                ... on BulkOperation {
                    id
                    status
                    errorCode
                    objectCount
                    fileSize
                    url
                    createdAt
                    completedAt
                }
            }
        }
    `;

    try {
        // Add cache-busting via a random variable in the GraphQL query
        const response = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': storeConfig.accessToken,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            },
            body: JSON.stringify({
                query,
                variables: { id: operationId, _nocache: Date.now() }
            })
        });

        if (!response.ok) {
            console.error('[BULK] Direct query failed:', response.status);
            return null;
        }

        const result = await response.json();
        const node = result.data?.node || null;

        // Log detailed info when operation is complete
        if (node && node.status === 'COMPLETED') {
            console.log('[BULK] Direct query found COMPLETED operation:');
            console.log('  - Object count:', node.objectCount);
            console.log('  - File size:', node.fileSize);
            console.log('  - URL available:', !!node.url);
        }

        return node;
    } catch (error) {
        console.error('[BULK] Failed to query operation by ID:', error);
        return null;
    }
}

/**
 * Download and parse NDJSON bulk data from Shopify
 */
async function downloadBulkData(url, onProgress = null) {
    console.log('📥 [BULK] Downloading data from:', url);

    if (onProgress) {
        onProgress(85, 'Downloading orders...');
    }

    // Shopify bulk operation URLs are pre-signed and don't need CORS proxy
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to download bulk data: ${response.status}`);
    }

    const text = await response.text();
    const orders = [];
    const lines = text.trim().split('\n');

    console.log(`📊 [BULK] Parsing ${lines.length} lines...`);

    for (const line of lines) {
        if (line.trim()) {
            try {
                const obj = JSON.parse(line);
                // Only include Order objects (not LineItem children)
                if (obj.id && obj.id.includes('/Order/') && !obj.__parentId) {
                    orders.push(obj);
                }
            } catch (e) {
                console.warn('[BULK] Failed to parse line:', e);
            }
        }
    }

    console.log(`✅ [BULK] Parsed ${orders.length} orders`);
    return orders;
}

/**
 * Process bulk orders data into analytics format
 */
function processBulkOrdersData(orders) {
    let totalSales = 0;
    let totalTax = 0;
    let totalCecetTax = 0;
    let totalSalesTax = 0;
    let totalOrders = orders.length;
    const dailyData = {};
    const hourlyData = {};
    const monthlyData = {};

    orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        // Use LOCAL date for grouping so it matches user's timezone
        const day = formatLocalDate(orderDate);
        const hour = orderDate.getHours();
        const month = orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

        const amount = parseFloat(order.totalPriceSet?.shopMoney?.amount || 0);
        const tax = parseFloat(order.totalTaxSet?.shopMoney?.amount || 0);

        // Parse tax breakdown
        let cecetTax = 0;
        let salesTax = 0;
        if (order.taxLines && order.taxLines.length > 0) {
            order.taxLines.forEach(taxLine => {
                const taxAmount = parseFloat(taxLine.priceSet?.shopMoney?.amount || 0);
                const rate = parseFloat(taxLine.rate || 0);

                // CECET tax is 12.5% (0.125)
                if (Math.abs(rate - 0.125) < 0.0001) {
                    cecetTax += taxAmount;
                } else {
                    salesTax += taxAmount;
                }
            });
        }

        totalSales += amount;
        totalTax += tax;
        totalCecetTax += cecetTax;
        totalSalesTax += salesTax;

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

    return {
        summary: {
            totalSales: totalSales.toFixed(2),
            netSales: (totalSales - totalTax).toFixed(2),
            totalTax: totalTax.toFixed(2),
            totalCecetTax: totalCecetTax.toFixed(2),
            totalSalesTax: totalSalesTax.toFixed(2),
            totalOrders,
            avgOrderValue: totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : '0.00',
            currency: orders.length > 0 ? (orders[0].totalPriceSet?.shopMoney?.currencyCode || 'USD') : 'USD'
        },
        daily: dailyData,
        hourly: hourlyData,
        monthly: monthlyData,
        // Sort orders by date (newest first) and include all orders for the transactions table
        recentOrders: [...orders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(order => {
                // Parse tax breakdown for each order
                let orderCecetTax = 0;
                let orderSalesTax = 0;
                if (order.taxLines && order.taxLines.length > 0) {
                    order.taxLines.forEach(taxLine => {
                        const taxAmount = parseFloat(taxLine.priceSet?.shopMoney?.amount || 0);
                        const rate = parseFloat(taxLine.rate || 0);
                        if (Math.abs(rate - 0.125) < 0.0001) {
                            orderCecetTax += taxAmount;
                        } else {
                            orderSalesTax += taxAmount;
                        }
                    });
                }

                return {
                    id: order.id.split('/').pop(),
                    name: order.name,
                    createdAt: order.createdAt,
                    status: (order.displayFinancialStatus || 'PENDING').toUpperCase(),
                    fulfillment: (order.displayFulfillmentStatus || 'UNFULFILLED').toUpperCase(),
                    total: parseFloat(order.totalPriceSet?.shopMoney?.amount || 0),
                    customer: order.customer ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() : 'Guest',
                    cecetTax: orderCecetTax,
                    salesTax: orderSalesTax,
                    lineItems: (order.lineItems?.edges || []).map(edge => ({
                        name: edge.node.name,
                        sku: edge.node.sku || '-',
                        quantity: edge.node.quantity,
                        price: parseFloat(edge.node.originalUnitPriceSet?.shopMoney?.amount || 0)
                    }))
                };
            })
    };
}

/**
 * Fetch sales analytics using GraphQL Bulk Operations
 * This is the main function for fetching large datasets efficiently
 */
async function fetchSalesAnalyticsBulkOperation(storeKey = 'vsu', locationId = null, period = 'month', onProgress = null, customRange = null) {
    const storeConfig = STORES_CONFIG[storeKey];

    if (!storeConfig) {
        throw new Error(`Invalid store key: ${storeKey}`);
    }

    const dateRange = getDateRange(period, customRange);

    console.log(`📊 [BULK] Fetching ${period} analytics for ${storeConfig.name}`);
    console.log(`📊 [BULK] Date range: ${dateRange.since} to ${dateRange.until}`);

    if (onProgress) {
        onProgress(5, 'Checking for existing operations...');
    }

    // Cancel any existing bulk operation first and wait for it to clear
    let cancelled = await cancelBulkOperation(storeKey);
    if (!cancelled) {
        console.warn('[BULK] Could not cancel existing operation on first attempt, retrying...');
        // Wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 5000));
        cancelled = await cancelBulkOperation(storeKey);
        if (!cancelled) {
            console.warn('[BULK] Still could not cancel existing operation after retry');
        }
    }

    // Wait a bit more to ensure Shopify is ready for a new operation
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (onProgress) {
        onProgress(10, 'Starting bulk data export...');
    }

    // Start bulk operation with retry logic
    let startedOperation;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
        try {
            startedOperation = await startBulkOperation(dateRange.since, dateRange.until, storeConfig);
            break; // Success, exit loop
        } catch (error) {
            retryCount++;
            console.warn(`[BULK] Start failed (attempt ${retryCount}/${maxRetries}):`, error.message);

            // If it's an existing operation error, we need to cancel and retry
            if (error.message.includes('EXISTING_OPERATION') ||
                error.message.toLowerCase().includes('already') ||
                error.message.toLowerCase().includes('en curso') ||
                error.message.includes('gid://shopify/BulkOperation/')) {
                console.log('[BULK] Detected existing operation conflict, force canceling...');

                // Try to extract the operation ID from the error message
                const idMatch = error.message.match(/gid:\/\/shopify\/BulkOperation\/\d+/);
                const extractedId = idMatch ? idMatch[0] : null;

                if (extractedId) {
                    console.log(`[BULK] Extracted stuck operation ID from error: ${extractedId}`);
                    // Force cancel using the extracted ID
                    await forceCancelBulkOperation(storeConfig, extractedId);
                } else {
                    // Fallback to checking current operation
                    const currentOp = await checkBulkOperationStatus(storeConfig);
                    if (currentOp && currentOp.id) {
                        console.log(`[BULK] Canceling operation: ${currentOp.id} (Status: ${currentOp.status})`);
                        await forceCancelBulkOperation(storeConfig, currentOp.id);
                    }
                }

                // Wait for cancellation to complete
                await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
                // Other error, wait and retry
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            if (retryCount >= maxRetries) {
                throw new Error(`Failed to start bulk operation after ${maxRetries} attempts: ${error.message}`);
            }
        }
    }

    if (onProgress) {
        onProgress(15, 'Waiting for Shopify to process...');
    }

    // Poll until complete - pass the operation ID to ensure we're polling the right one
    let completedOp = await pollBulkOperation(storeConfig, startedOperation?.id, onProgress);

    // If polling failed to get the right operation, try direct query as final fallback
    if (!completedOp.url && startedOperation?.id) {
        console.log('[BULK] Attempting direct query for operation result...');
        const directOp = await queryBulkOperationById(storeConfig, startedOperation.id);
        if (directOp && directOp.status === 'COMPLETED' && directOp.url) {
            console.log('[BULK] Found completed operation via direct query');
            completedOp = directOp;
        }
    }

    let orders = [];

    if (completedOp.url) {
        // Download and parse the data
        orders = await downloadBulkData(completedOp.url, onProgress);
    } else {
        console.log('ℹ️ [BULK] No orders found in date range');
    }

    if (onProgress) {
        onProgress(92, 'Processing orders...');
    }

    // Process orders into analytics format
    const analytics = processBulkOrdersData(orders);

    // Add store info
    analytics.storeInfo = {
        key: storeKey,
        name: storeConfig.name,
        shortName: storeConfig.shortName,
        locationId: locationId
    };

    // Add date range info
    analytics.dateRange = {
        period: period,
        since: dateRange.since,
        until: dateRange.until
    };

    if (onProgress) {
        onProgress(100, 'Complete!');
    }

    console.log(`✅ [BULK] Analytics complete: ${analytics.summary.totalOrders} orders, $${analytics.summary.totalSales} total`);

    return analytics;
}

/**
 * Fetch locations for a store
 */
async function fetchStoreLocations(storeKey) {
    const storeConfig = STORES_CONFIG[storeKey];

    if (!storeConfig) {
        throw new Error(`Invalid store key: ${storeKey}`);
    }

    // Return cached locations if available
    if (locationCache[storeKey]) {
        return locationCache[storeKey];
    }

    try {
        const data = await fetchShopifyAPI('locations.json', {}, storeConfig);

        // Map locations to a more usable format
        const locations = data.locations.map(loc => ({
            id: loc.id,
            name: loc.name,
            active: loc.active
        }));

        // Cache the results
        locationCache[storeKey] = locations;

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

/**
 * Get date range based on period selection
 * Supports custom date ranges when customRange object is provided
 * IMPORTANT: Returns dates as YYYY-MM-DD strings to avoid timezone conversion issues
 * @param {string} period - 'today', 'week', 'month', 'year', or 'custom'
 * @param {Object} customRange - Optional { startDate: Date, endDate: Date } for custom ranges
 */
function getDateRange(period, customRange = null) {
    const now = new Date();
    let since, until;

    // Handle custom date range
    if (period === 'custom' && customRange && customRange.startDate && customRange.endDate) {
        since = new Date(customRange.startDate);
        until = new Date(customRange.endDate);

        // Use local date format to avoid timezone shifts
        const sinceStr = formatLocalDate(since);
        const untilStr = formatLocalDate(until);

        console.log(`[getDateRange] Custom range (local): ${sinceStr} to ${untilStr}`);

        return {
            since: sinceStr,
            until: untilStr
        };
    }

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

    // Use local date format to avoid timezone shifts
    return {
        since: formatLocalDate(since),
        until: formatLocalDate(until)
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
 */
async function fetchStoreInventory(storeKey = 'vsu', limit = 100) {
    const storeConfig = STORES_CONFIG[storeKey];

    if (!storeConfig) {
        throw new Error(`Invalid store key: ${storeKey}`);
    }

    console.log(`📦 [Inventory] Fetching inventory from ${storeConfig.name}...`);

    const graphqlUrl = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;

    // For stores with multiple locations (VSU), fetch inventory levels per location
    if (storeConfig.hasMultipleLocations && storeConfig.locations) {
        try {
            return await fetchStoreInventoryWithLocations(storeConfig, storeKey, limit);
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
                    imageUrl: imageUrl
                };
            });
        }).flat();

        console.log(`✅ [Inventory] Loaded ${products.length} items from ${storeConfig.name}`);
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
 */
async function fetchAllStoresInventory(onProgress = null) {
    const allInventory = [];
    const storeKeys = Object.keys(STORES_CONFIG);
    let completed = 0;

    console.log(`📦 [Inventory] Fetching inventory from ${storeKeys.length} stores...`);

    for (const storeKey of storeKeys) {
        try {
            if (onProgress) {
                const progress = Math.round((completed / storeKeys.length) * 100);
                onProgress(progress, `Loading ${STORES_CONFIG[storeKey].name}...`);
            }

            const storeInventory = await fetchStoreInventory(storeKey);
            allInventory.push(...storeInventory);
            completed++;
        } catch (error) {
            console.error(`Failed to fetch inventory from ${storeKey}:`, error);
            completed++;
        }
    }

    if (onProgress) {
        onProgress(100, 'Complete!');
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
// DEBUG / TEST FUNCTIONS
// =============================================================================

/**
 * Test function to run a simple GraphQL query (non-bulk) to verify orders exist
 * Run from console: testOrdersQuery('vsu', '2024-12-01', '2024-12-30')
 */
async function testOrdersQuery(storeKey = 'vsu', startDate = null, endDate = null) {
    const storeConfig = STORES_CONFIG[storeKey];
    if (!storeConfig) {
        console.error('Invalid store key:', storeKey);
        return;
    }

    // Default to this month if no dates provided
    if (!startDate) {
        const now = new Date();
        startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    }
    if (!endDate) {
        const now = new Date();
        now.setDate(now.getDate() + 1);
        endDate = now.toISOString().split('T')[0];
    }

    const graphqlUrl = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;

    // Simple query to test if orders exist in the date range
    const query = `
        query {
            orders(first: 10, query: "created_at:>=${startDate} AND created_at:<${endDate}") {
                edges {
                    node {
                        id
                        name
                        createdAt
                        totalPriceSet {
                            shopMoney {
                                amount
                            }
                        }
                    }
                }
                pageInfo {
                    hasNextPage
                }
            }
        }
    `;

    console.log('=== TEST ORDERS QUERY ===');
    console.log('Store:', storeConfig.name);
    console.log('Date range:', `created_at:>=${startDate} AND created_at:<${endDate}`);
    console.log('Query:', query);

    try {
        const response = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': storeConfig.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        const result = await response.json();
        console.log('Response:', JSON.stringify(result, null, 2));

        if (result.data?.orders?.edges) {
            console.log(`Found ${result.data.orders.edges.length} orders`);
            result.data.orders.edges.forEach((edge, i) => {
                const order = edge.node;
                console.log(`  ${i + 1}. ${order.name} - $${order.totalPriceSet?.shopMoney?.amount} - ${order.createdAt}`);
            });
            if (result.data.orders.pageInfo?.hasNextPage) {
                console.log('  ... and more (hasNextPage: true)');
            }
        } else {
            console.log('No orders found or error in response');
        }

        return result;
    } catch (error) {
        console.error('Test query failed:', error);
        return null;
    }
}

/**
 * Test function to check current bulk operation status
 * Run from console: checkBulkStatus('vsu')
 */
async function checkBulkStatus(storeKey = 'vsu') {
    const storeConfig = STORES_CONFIG[storeKey];
    if (!storeConfig) {
        console.error('Invalid store key:', storeKey);
        return;
    }

    const graphqlUrl = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;

    const query = `
        query {
            currentBulkOperation {
                id
                status
                errorCode
                objectCount
                fileSize
                url
                partialDataUrl
                query
                createdAt
                completedAt
            }
        }
    `;

    console.log('=== BULK OPERATION STATUS ===');
    console.log('Store:', storeConfig.name);

    try {
        const response = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': storeConfig.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        const result = await response.json();
        console.log('Current Bulk Operation:', JSON.stringify(result, null, 2));

        if (result.data?.currentBulkOperation) {
            const op = result.data.currentBulkOperation;
            console.log('Status:', op.status);
            console.log('Error Code:', op.errorCode);
            console.log('Object Count:', op.objectCount);
            console.log('URL:', op.url);
            console.log('Query used:', op.query);
        } else {
            console.log('No bulk operation in progress');
        }

        return result;
    } catch (error) {
        console.error('Status check failed:', error);
        return null;
    }
}

// =============================================================================
// EXPORT FUNCTIONS TO WINDOW (for use by api-client.js)
// =============================================================================
window.cancelBulkOperation = cancelBulkOperation;
window.fetchSalesAnalytics = fetchSalesAnalytics; // REST API fallback (may have 403 issues with CORS proxy)
window.fetchSalesAnalyticsBulk = fetchSalesAnalyticsBulkOperation; // GraphQL Bulk Operations (recommended)
window.fetchStoreLocations = fetchStoreLocations;
window.fetchStoreInventory = fetchStoreInventory;
window.fetchAllStoresInventory = fetchAllStoresInventory;
window.getStoresConfig = getStoresConfig;
window.STORES_CONFIG = STORES_CONFIG;

// Debug functions
window.testOrdersQuery = testOrdersQuery;
window.checkBulkStatus = checkBulkStatus;

/**
 * DIAGNOSTIC: Full bulk operation diagnosis
 * Run from console: diagnoseBulkOperation('vsu')
 */
async function diagnoseBulkOperation(storeKey = 'vsu') {
    const storeConfig = STORES_CONFIG[storeKey];
    if (!storeConfig) {
        console.error('Invalid store key:', storeKey);
        return;
    }

    console.log('='.repeat(60));
    console.log('BULK OPERATION DIAGNOSTIC');
    console.log('='.repeat(60));
    console.log('Store:', storeConfig.name);
    console.log('API Version:', API_VERSION);
    console.log('');

    const graphqlUrl = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;

    // 1. Check current bulk operation with ALL fields
    console.log('1. CURRENT BULK OPERATION STATUS:');
    console.log('-'.repeat(40));

    const currentOpQuery = `
        query {
            currentBulkOperation {
                id
                status
                errorCode
                objectCount
                fileSize
                url
                partialDataUrl
                query
                rootObjectCount
                type
                createdAt
                completedAt
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
            body: JSON.stringify({ query: currentOpQuery })
        });

        const result = await response.json();

        if (result.errors) {
            console.error('GraphQL Errors:', result.errors);
        }

        const op = result.data?.currentBulkOperation;
        if (op) {
            console.log('ID:', op.id);
            console.log('Status:', op.status);
            console.log('Error Code:', op.errorCode || 'none');
            console.log('Object Count:', op.objectCount);
            console.log('Root Object Count:', op.rootObjectCount);
            console.log('File Size:', op.fileSize);
            console.log('Type:', op.type);
            console.log('URL:', op.url || 'not available yet');
            console.log('Partial URL:', op.partialDataUrl || 'none');
            console.log('Created At:', op.createdAt);
            console.log('Completed At:', op.completedAt || 'not completed');
            console.log('');
            console.log('QUERY USED:');
            console.log(op.query || 'not available');
        } else {
            console.log('No current bulk operation found');
        }
    } catch (error) {
        console.error('Failed to check current operation:', error);
    }

    console.log('');

    // 2. Test simple orders query (non-bulk) to verify data exists
    console.log('2. TESTING SIMPLE ORDERS QUERY (non-bulk):');
    console.log('-'.repeat(40));

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startDate = startOfMonth.toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];

    const simpleQuery = `
        query {
            orders(first: 5, query: "created_at:>=${startDate} AND created_at:<=${endDate}") {
                edges {
                    node {
                        id
                        name
                        createdAt
                        totalPriceSet {
                            shopMoney {
                                amount
                            }
                        }
                    }
                }
                pageInfo {
                    hasNextPage
                }
            }
        }
    `;

    console.log('Query date range:', `${startDate} to ${endDate}`);

    try {
        const response = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': storeConfig.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: simpleQuery })
        });

        const result = await response.json();

        if (result.errors) {
            console.error('GraphQL Errors:', result.errors);
        }

        const orders = result.data?.orders?.edges || [];
        console.log('Orders found:', orders.length);
        console.log('Has more pages:', result.data?.orders?.pageInfo?.hasNextPage);

        if (orders.length > 0) {
            console.log('Sample orders:');
            orders.forEach((edge, i) => {
                const o = edge.node;
                console.log(`  ${i + 1}. ${o.name} - $${o.totalPriceSet?.shopMoney?.amount} - ${o.createdAt}`);
            });
        }
    } catch (error) {
        console.error('Failed to query orders:', error);
    }

    console.log('');

    // 3. Test starting a NEW bulk operation with minimal query
    console.log('3. TESTING MINIMAL BULK OPERATION:');
    console.log('-'.repeat(40));
    console.log('This will attempt to start a simple bulk operation...');

    const minimalBulkQuery = `
        mutation {
            bulkOperationRunQuery(
                query: """
                {
                    orders(first: 10, query: "created_at:>=${startDate}") {
                        edges {
                            node {
                                id
                                name
                            }
                        }
                    }
                }
                """
            ) {
                bulkOperation {
                    id
                    status
                    errorCode
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
            body: JSON.stringify({ query: minimalBulkQuery })
        });

        const result = await response.json();
        console.log('Full response:', JSON.stringify(result, null, 2));

        if (result.data?.bulkOperationRunQuery?.userErrors?.length > 0) {
            console.log('USER ERRORS:', result.data.bulkOperationRunQuery.userErrors);
        }

        if (result.data?.bulkOperationRunQuery?.bulkOperation) {
            const newOp = result.data.bulkOperationRunQuery.bulkOperation;
            console.log('New operation started:');
            console.log('  ID:', newOp.id);
            console.log('  Status:', newOp.status);
            console.log('  Error:', newOp.errorCode || 'none');
        }
    } catch (error) {
        console.error('Failed to start minimal bulk operation:', error);
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('DIAGNOSTIC COMPLETE');
    console.log('='.repeat(60));
    console.log('');
    console.log('NEXT STEPS:');
    console.log('1. If there is a RUNNING operation, run: cancelBulkOperation("vsu")');
    console.log('2. Wait 10 seconds');
    console.log('3. Run this diagnostic again');
    console.log('4. Share the output with the developer');

    return 'Diagnostic complete - check console output above';
}

window.diagnoseBulkOperation = diagnoseBulkOperation;

