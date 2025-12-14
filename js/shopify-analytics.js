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
        console.log(`🔍 Fetching tax details for ${orderIds.length} orders via GraphQL...`);

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
        console.log('📦 GraphQL Response:', result);
        console.log(`✅ Received tax data for ${result.data?.nodes?.length || 0} orders`);

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

    console.log(`💰 Parsing ${taxLines.length} tax lines:`, taxLines);

    taxLines.forEach(taxLine => {
        const title = taxLine.title || '';
        const rate = parseFloat(taxLine.rate || 0);
        const amount = parseFloat(taxLine.priceSet?.shopMoney?.amount || 0);

        console.log(`  - Tax Line: "${title}" | Rate: ${rate} (${(rate * 100).toFixed(2)}%) | Amount: $${amount}`);

        // Check if this is CECET tax by rate (12.5% = 0.125)
        // Using a small tolerance for floating point comparison
        if (Math.abs(rate - 0.125) < 0.0001) {
            cecetTax += amount;
            console.log(`    ✅ Identified as CECET Tax (12.5%)`);
        } else {
            // All other taxes are considered sales tax
            salesTax += amount;
            console.log(`    ✅ Identified as Sales Tax (${(rate * 100).toFixed(2)}%)`);
        }
    });

    console.log(`📊 Tax Breakdown Result: CECET = $${cecetTax.toFixed(2)}, Sales = $${salesTax.toFixed(2)}`);

    return { cecetTax, salesTax };
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
 * @param {string} period - 'today', 'week', 'month', 'year', or 'custom'
 * @param {Object} customRange - Optional { startDate: Date, endDate: Date } for custom ranges
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
            console.log(`📋 Processing ${orders.length} orders, fetching tax data in batches...`);

            // GraphQL has a 250 item limit, so we need to batch the requests
            const batchSize = 250;
            const totalBatches = Math.ceil(orderIds.length / batchSize);

            for (let i = 0; i < orderIds.length; i += batchSize) {
                const batchNumber = Math.floor(i / batchSize) + 1;
                const batchIds = orderIds.slice(i, i + batchSize);

                console.log(`🔄 Fetching tax batch ${batchNumber}/${totalBatches} (${batchIds.length} orders)...`);

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

            console.log(`✅ Tax data map created with ${Object.keys(taxDataMap).length} entries from ${totalBatches} batches`);
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
        recentOrders: orders.slice(0, 10).map(order => ({
            name: order.name,
            createdAt: order.created_at,
            status: order.financial_status?.toUpperCase() || 'PENDING',
            fulfillment: order.fulfillment_status?.toUpperCase() || 'UNFULFILLED',
            total: parseFloat(order.total_price),
            customer: order.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : 'Guest',
            cecetTax: order._taxBreakdown?.cecetTax || 0,
            salesTax: order._taxBreakdown?.salesTax || 0
        }))
    };

    console.log('🎯 FINAL TAX SUMMARY:');
    console.log(`  Total Tax: $${totalTax.toFixed(2)}`);
    console.log(`  CECET Tax: $${totalCecetTax.toFixed(2)}`);
    console.log(`  Sales Tax: $${totalSalesTax.toFixed(2)}`);
    console.log('  Recent Orders with Tax Breakdown:', result.recentOrders.map(o => ({
        name: o.name,
        cecetTax: o.cecetTax,
        salesTax: o.salesTax
    })));

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
                    status: product.status
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
                        status: product.status
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
                        status: product.status
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

    console.log(`✅ [Inventory] Total: ${allInventory.length} items from all stores`);
    return allInventory;
}

/**
 * Get stores config (for external use)
 */
function getStoresConfig() {
    return STORES_CONFIG;
}

console.log('✅ Shopify Analytics loaded - Frontend API connection ready');
