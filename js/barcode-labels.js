/**
 * Barcode Labels Module
 * Generates and prints EAN-13 barcode labels for product traceability
 * Integrates with Shopify products
 */

// Label configuration
const LABEL_CONFIG = {
    width: 25.4,  // 1 inch in mm
    height: 12.7, // 0.5 inch in mm
    fontSize: 8,
    barcodeHeight: 8,
    padding: 2
};

// Labels state
let labelProducts = [];
let labelQueue = [];
let selectedStore = 'vsu';

/**
 * Generate EAN-13 checksum digit
 */
function calculateEAN13Checksum(digits) {
    if (digits.length !== 12) return null;

    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
    }
    return (10 - (sum % 10)) % 10;
}

/**
 * Generate a valid EAN-13 barcode from product data
 * Format: 200 + store(2) + product(6) + checksum(1) = 13 digits
 */
function generateEAN13(productId, storeCode = '01') {
    // Use prefix 200-299 for internal use (in-store)
    const prefix = '200';

    // Store code: 2 digits
    const store = storeCode.padStart(2, '0').substring(0, 2);

    // Product ID: 6 digits (hash if needed)
    let productNum;
    if (typeof productId === 'number') {
        productNum = (productId % 1000000).toString().padStart(6, '0');
    } else {
        // Hash string ID to number
        let hash = 0;
        for (let i = 0; i < productId.length; i++) {
            hash = ((hash << 5) - hash) + productId.charCodeAt(i);
            hash = hash & hash;
        }
        productNum = Math.abs(hash % 1000000).toString().padStart(6, '0');
    }

    const partialCode = prefix + store + productNum;
    const checksum = calculateEAN13Checksum(partialCode);

    return partialCode + checksum;
}

/**
 * EAN-13 encoding patterns
 */
const EAN13_PATTERNS = {
    L: ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'],
    G: ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'],
    R: ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100']
};

const EAN13_FIRST_DIGIT = [
    'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
    'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'
];

/**
 * Encode EAN-13 to binary pattern
 */
function encodeEAN13(code) {
    if (code.length !== 13) return null;

    const firstDigit = parseInt(code[0]);
    const pattern = EAN13_FIRST_DIGIT[firstDigit];

    let binary = '101'; // Start guard

    // Left side (digits 1-6)
    for (let i = 0; i < 6; i++) {
        const digit = parseInt(code[i + 1]);
        const encoding = pattern[i] === 'L' ? 'L' : 'G';
        binary += EAN13_PATTERNS[encoding][digit];
    }

    binary += '01010'; // Center guard

    // Right side (digits 7-12)
    for (let i = 0; i < 6; i++) {
        const digit = parseInt(code[i + 7]);
        binary += EAN13_PATTERNS.R[digit];
    }

    binary += '101'; // End guard

    return binary;
}

/**
 * Draw EAN-13 barcode on canvas
 */
function drawEAN13(canvas, code, options = {}) {
    const ctx = canvas.getContext('2d');
    const {
        width = 150,
        height = 50,
        barWidth = 1.5,
        showText = true,
        textSize = 10
    } = options;

    canvas.width = width;
    canvas.height = height;

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    const binary = encodeEAN13(code);
    if (!binary) return;

    const barcodeWidth = binary.length * barWidth;
    const startX = (width - barcodeWidth) / 2;
    const barcodeHeight = showText ? height - textSize - 4 : height - 4;

    ctx.fillStyle = '#000000';

    // Draw bars
    for (let i = 0; i < binary.length; i++) {
        if (binary[i] === '1') {
            ctx.fillRect(startX + (i * barWidth), 2, barWidth, barcodeHeight);
        }
    }

    // Draw text
    if (showText) {
        ctx.font = `${textSize}px "Space Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';

        // Format: X XXXXXX XXXXXX
        const formattedCode = code[0] + ' ' + code.substring(1, 7) + ' ' + code.substring(7);
        ctx.fillText(formattedCode, width / 2, height - 2);
    }
}

/**
 * Search products from Shopify
 */
async function searchShopifyProducts(query, store = 'vsu') {
    const storeConfig = STORES_CONFIG[store];
    if (!storeConfig) {
        console.error('Store not found:', store);
        return [];
    }

    try {
        const response = await fetchShopifyAPI('products.json', {
            limit: 50,
            title: query
        }, storeConfig);

        return response.products || [];
    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
}

/**
 * Get all products from Shopify (paginated)
 */
async function getAllShopifyProducts(store = 'vsu', limit = 250) {
    const storeConfig = STORES_CONFIG[store];
    if (!storeConfig) {
        console.error('Store not found:', store);
        return [];
    }

    try {
        const response = await fetchShopifyAPI('products.json', {
            limit: limit,
            status: 'active'
        }, storeConfig);

        return response.products || [];
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

/**
 * Add product to label queue
 */
function addToLabelQueue(product, quantity = 1, variant = null) {
    const existingIndex = labelQueue.findIndex(item =>
        item.product.id === product.id &&
        (!variant || item.variant?.id === variant?.id)
    );

    if (existingIndex >= 0) {
        labelQueue[existingIndex].quantity += quantity;
    } else {
        labelQueue.push({
            product,
            variant: variant || product.variants?.[0],
            quantity
        });
    }

    updateLabelQueueUI();
}

/**
 * Remove product from label queue
 */
function removeFromLabelQueue(index) {
    labelQueue.splice(index, 1);
    updateLabelQueueUI();
}

/**
 * Update quantity in label queue
 */
function updateLabelQuantity(index, quantity) {
    if (quantity <= 0) {
        removeFromLabelQueue(index);
    } else {
        labelQueue[index].quantity = quantity;
        updateLabelQueueUI();
    }
}

/**
 * Clear label queue
 */
function clearLabelQueue() {
    labelQueue = [];
    updateLabelQueueUI();
}

/**
 * Update label queue UI
 */
function updateLabelQueueUI() {
    const queueContainer = document.getElementById('label-queue-list');
    const queueCount = document.getElementById('label-queue-count');
    const totalLabels = document.getElementById('total-labels-count');

    if (queueCount) {
        queueCount.textContent = labelQueue.length;
    }

    if (totalLabels) {
        const total = labelQueue.reduce((sum, item) => sum + item.quantity, 0);
        totalLabels.textContent = total;
    }

    if (!queueContainer) return;

    if (labelQueue.length === 0) {
        queueContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fas fa-barcode" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p>No labels in queue</p>
                <p style="font-size: 12px;">Search and add products to generate labels</p>
            </div>
        `;
        return;
    }

    queueContainer.innerHTML = labelQueue.map((item, index) => {
        const product = item.product;
        const variant = item.variant;
        const price = variant?.price || product.variants?.[0]?.price || '0.00';
        const sku = variant?.sku || product.variants?.[0]?.sku || 'N/A';
        const image = product.image?.src || product.images?.[0]?.src || '';
        const storeCode = getStoreCode(selectedStore);
        const barcode = generateEAN13(product.id, storeCode);

        return `
            <div class="label-queue-item" style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: var(--bg-secondary);
                border-radius: 8px;
                margin-bottom: 8px;
            ">
                ${image ? `<img src="${image}" alt="${product.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">` :
                `<div style="width: 50px; height: 50px; background: var(--bg-tertiary); border-radius: 6px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-box" style="color: var(--text-muted);"></i></div>`}

                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 500; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${product.title}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">SKU: ${sku}</div>
                    <div style="font-size: 12px; color: var(--accent-primary); font-weight: 600;">$${parseFloat(price).toFixed(2)}</div>
                    <div style="font-size: 10px; color: var(--text-muted); font-family: 'Space Mono', monospace;">${barcode}</div>
                </div>

                <div style="display: flex; align-items: center; gap: 8px;">
                    <button onclick="updateLabelQuantity(${index}, ${item.quantity - 1})" class="btn-icon-sm" style="
                        width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border-color);
                        background: var(--bg-primary); cursor: pointer; display: flex; align-items: center; justify-content: center;
                    "><i class="fas fa-minus" style="font-size: 10px;"></i></button>

                    <input type="number" value="${item.quantity}" min="1" max="999"
                        onchange="updateLabelQuantity(${index}, parseInt(this.value) || 1)"
                        style="width: 50px; text-align: center; padding: 4px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-size: 13px;">

                    <button onclick="updateLabelQuantity(${index}, ${item.quantity + 1})" class="btn-icon-sm" style="
                        width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border-color);
                        background: var(--bg-primary); cursor: pointer; display: flex; align-items: center; justify-content: center;
                    "><i class="fas fa-plus" style="font-size: 10px;"></i></button>
                </div>

                <button onclick="removeFromLabelQueue(${index})" class="btn-icon-sm" style="
                    width: 32px; height: 32px; border-radius: 6px; border: none;
                    background: rgba(239, 68, 68, 0.1); color: #ef4444; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                "><i class="fas fa-trash"></i></button>
            </div>
        `;
    }).join('');
}

/**
 * Get store code for barcode
 */
function getStoreCode(store) {
    const codes = {
        'vsu': '01',
        'loyalvaper': '02',
        'miramarwine': '03'
    };
    return codes[store] || '01';
}

/**
 * Generate label preview
 */
function generateLabelPreview(product, variant, showPreview = true) {
    const price = variant?.price || product.variants?.[0]?.price || '0.00';
    const storeCode = getStoreCode(selectedStore);
    const barcode = generateEAN13(product.id, storeCode);

    // Create canvas for barcode
    const canvas = document.createElement('canvas');
    drawEAN13(canvas, barcode, {
        width: 120,
        height: 40,
        barWidth: 1.2,
        showText: true,
        textSize: 8
    });

    if (showPreview) {
        const previewContainer = document.getElementById('label-preview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div class="label-preview-card" style="
                    width: 180px;
                    padding: 8px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    text-align: center;
                    font-family: Arial, sans-serif;
                ">
                    <div style="font-size: 9px; font-weight: bold; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #000;">
                        ${product.title.substring(0, 30)}${product.title.length > 30 ? '...' : ''}
                    </div>
                    <div style="font-size: 14px; font-weight: bold; color: #000; margin-bottom: 4px;">
                        $${parseFloat(price).toFixed(2)}
                    </div>
                    <img src="${canvas.toDataURL()}" style="max-width: 100%;">
                </div>
            `;
        }
    }

    return { canvas, barcode };
}

/**
 * Print labels using thermal printer format
 */
async function printLabels() {
    if (labelQueue.length === 0) {
        alert('No labels in queue to print');
        return;
    }

    // Create print window
    const printWindow = window.open('', '_blank', 'width=400,height=600');

    let labelsHtml = '';

    for (const item of labelQueue) {
        const product = item.product;
        const variant = item.variant;
        const price = variant?.price || product.variants?.[0]?.price || '0.00';
        const storeCode = getStoreCode(selectedStore);
        const barcode = generateEAN13(product.id, storeCode);

        // Create barcode canvas
        const canvas = document.createElement('canvas');
        drawEAN13(canvas, barcode, {
            width: 140,
            height: 45,
            barWidth: 1.3,
            showText: true,
            textSize: 9
        });

        const barcodeDataUrl = canvas.toDataURL();

        // Generate label HTML for each quantity
        for (let i = 0; i < item.quantity; i++) {
            labelsHtml += `
                <div class="label" style="
                    width: 1in;
                    height: 0.5in;
                    padding: 2px 4px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    page-break-inside: avoid;
                    border: 1px dashed #ccc;
                    margin: 2px;
                ">
                    <div style="font-size: 6pt; font-weight: bold; text-align: center; line-height: 1.1; max-height: 12px; overflow: hidden; width: 100%;">
                        ${product.title.substring(0, 25)}
                    </div>
                    <div style="font-size: 8pt; font-weight: bold; margin: 1px 0;">
                        $${parseFloat(price).toFixed(2)}
                    </div>
                    <img src="${barcodeDataUrl}" style="width: 90%; height: auto; max-height: 20px;">
                </div>
            `;
        }
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Labels</title>
            <style>
                @page {
                    size: 1in 0.5in;
                    margin: 0;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .label {
                        border: none !important;
                        margin: 0 !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 10px;
                    background: #f5f5f5;
                }
                .labels-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    justify-content: flex-start;
                }
                .print-controls {
                    margin-bottom: 20px;
                    padding: 15px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .print-controls button {
                    padding: 10px 20px;
                    font-size: 14px;
                    cursor: pointer;
                    border: none;
                    border-radius: 6px;
                    margin-right: 10px;
                }
                .print-btn {
                    background: #10b981;
                    color: white;
                }
                .close-btn {
                    background: #6b7280;
                    color: white;
                }
            </style>
        </head>
        <body>
            <div class="print-controls no-print">
                <h3 style="margin: 0 0 10px 0;">Label Preview</h3>
                <p style="margin: 0 0 15px 0; color: #666;">Total labels: ${labelQueue.reduce((sum, item) => sum + item.quantity, 0)}</p>
                <button class="print-btn" onclick="window.print()">
                    <i class="fas fa-print"></i> Print Labels
                </button>
                <button class="close-btn" onclick="window.close()">Close</button>
            </div>
            <div class="labels-container">
                ${labelsHtml}
            </div>
        </body>
        </html>
    `);

    printWindow.document.close();
}

/**
 * Export labels as PDF (for standard printers)
 */
async function exportLabelsPDF() {
    if (labelQueue.length === 0) {
        alert('No labels in queue to export');
        return;
    }

    // Check if jsPDF is available
    if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
        alert('PDF library not loaded. Please refresh the page.');
        return;
    }

    const { jsPDF } = window.jspdf;

    // Create PDF with label sheet layout (Avery 5160 compatible: 1" x 2-5/8" labels, 30 per sheet)
    // We'll use a 3 column x 10 row layout
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
    });

    const pageWidth = 215.9; // Letter width in mm
    const pageHeight = 279.4; // Letter height in mm
    const labelWidth = 66.7; // ~2.625 inches
    const labelHeight = 25.4; // 1 inch
    const marginLeft = 4.8;
    const marginTop = 12.7;
    const colGap = 3.2;

    const labelsPerRow = 3;
    const labelsPerCol = 10;
    const labelsPerPage = labelsPerRow * labelsPerCol;

    let labelIndex = 0;
    let allLabels = [];

    // Flatten queue to individual labels
    for (const item of labelQueue) {
        for (let i = 0; i < item.quantity; i++) {
            allLabels.push(item);
        }
    }

    for (let i = 0; i < allLabels.length; i++) {
        if (i > 0 && i % labelsPerPage === 0) {
            pdf.addPage();
        }

        const pageIndex = i % labelsPerPage;
        const row = Math.floor(pageIndex / labelsPerRow);
        const col = pageIndex % labelsPerRow;

        const x = marginLeft + (col * (labelWidth + colGap));
        const y = marginTop + (row * labelHeight);

        const item = allLabels[i];
        const product = item.product;
        const variant = item.variant;
        const price = variant?.price || product.variants?.[0]?.price || '0.00';
        const storeCode = getStoreCode(selectedStore);
        const barcode = generateEAN13(product.id, storeCode);

        // Draw label border (optional, for cutting guide)
        pdf.setDrawColor(200);
        pdf.setLineWidth(0.1);
        pdf.rect(x, y, labelWidth, labelHeight);

        // Product name
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        const title = product.title.substring(0, 35);
        pdf.text(title, x + 2, y + 5);

        // Price
        pdf.setFontSize(12);
        pdf.text(`$${parseFloat(price).toFixed(2)}`, x + 2, y + 11);

        // Barcode
        const canvas = document.createElement('canvas');
        drawEAN13(canvas, barcode, {
            width: 180,
            height: 50,
            barWidth: 1.8,
            showText: true,
            textSize: 10
        });

        const barcodeImg = canvas.toDataURL('image/png');
        pdf.addImage(barcodeImg, 'PNG', x + 15, y + 13, 40, 11);
    }

    pdf.save('product-labels.pdf');
}

/**
 * Render the Labels page
 */
function renderLabelsPage() {
    return `
        <div class="labels-page">
            <!-- Header Actions -->
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-body" style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
                    <div class="form-group" style="margin: 0; flex: 1; min-width: 200px;">
                        <div style="position: relative;">
                            <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                            <input type="text" id="label-product-search" class="form-input" placeholder="Search products by name or SKU..."
                                style="padding-left: 40px;" oninput="handleLabelProductSearch(this.value)">
                        </div>
                    </div>

                    <div class="form-group" style="margin: 0; min-width: 150px;">
                        <select id="label-store-select" class="form-input" onchange="handleLabelStoreChange(this.value)">
                            <option value="vsu">VSU Stores</option>
                            <option value="loyalvaper">Loyal Vaper</option>
                            <option value="miramarwine">Miramar Wine</option>
                        </select>
                    </div>

                    <button class="btn-secondary" onclick="loadRecentProducts()">
                        <i class="fas fa-sync-alt"></i> Load Products
                    </button>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 400px; gap: 20px;">
                <!-- Products List -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-boxes"></i> Products
                        </h3>
                        <span id="products-count" style="color: var(--text-muted); font-size: 13px;">0 products</span>
                    </div>
                    <div class="card-body" style="max-height: 600px; overflow-y: auto;" id="label-products-list">
                        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                            <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                            <p>Search for products or click "Load Products"</p>
                        </div>
                    </div>
                </div>

                <!-- Label Queue -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-tags"></i> Label Queue
                            <span id="label-queue-count" class="nav-badge" style="margin-left: 8px;">0</span>
                        </h3>
                        <button class="btn-secondary" onclick="clearLabelQueue()" style="padding: 6px 12px; font-size: 12px;">
                            <i class="fas fa-trash"></i> Clear
                        </button>
                    </div>
                    <div class="card-body" style="max-height: 400px; overflow-y: auto;" id="label-queue-list">
                        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                            <i class="fas fa-barcode" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                            <p>No labels in queue</p>
                            <p style="font-size: 12px;">Search and add products to generate labels</p>
                        </div>
                    </div>

                    <!-- Label Preview -->
                    <div style="padding: 16px; border-top: 1px solid var(--border-color);">
                        <h4 style="margin: 0 0 12px 0; font-size: 13px; color: var(--text-muted);">
                            <i class="fas fa-eye"></i> Label Preview
                        </h4>
                        <div id="label-preview" style="display: flex; justify-content: center; padding: 16px; background: var(--bg-tertiary); border-radius: 8px;">
                            <div style="color: var(--text-muted); font-size: 12px;">Select a product to preview</div>
                        </div>
                    </div>

                    <!-- Print Actions -->
                    <div style="padding: 16px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 14px;">Total Labels:</span>
                            <span id="total-labels-count" style="font-size: 18px; font-weight: 600; color: var(--accent-primary);">0</span>
                        </div>

                        <button class="btn-primary" onclick="printLabels()" style="width: 100%;">
                            <i class="fas fa-print"></i> Print Labels (Thermal)
                        </button>

                        <button class="btn-secondary" onclick="exportLabelsPDF()" style="width: 100%;">
                            <i class="fas fa-file-pdf"></i> Export PDF (Sheet Labels)
                        </button>
                    </div>
                </div>
            </div>

            <!-- Manual Entry Section -->
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-edit"></i> Manual Label Entry
                    </h3>
                </div>
                <div class="card-body">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        <div class="form-group" style="margin: 0;">
                            <label>Product Name *</label>
                            <input type="text" id="manual-product-name" class="form-input" placeholder="Enter product name">
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label>Price *</label>
                            <input type="number" id="manual-product-price" class="form-input" placeholder="0.00" step="0.01" min="0">
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label>SKU (optional)</label>
                            <input type="text" id="manual-product-sku" class="form-input" placeholder="SKU-001">
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label>Quantity</label>
                            <input type="number" id="manual-product-qty" class="form-input" value="1" min="1">
                        </div>
                    </div>
                    <div style="margin-top: 16px;">
                        <button class="btn-primary" onclick="addManualLabel()">
                            <i class="fas fa-plus"></i> Add to Queue
                        </button>
                    </div>
                </div>
            </div>

            <!-- Barcode Scanner Section -->
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-camera"></i> Scan Existing Barcode
                    </h3>
                    <button class="btn-secondary" onclick="toggleLabelScanner()" id="label-scanner-btn">
                        <i class="fas fa-qrcode"></i> Start Scanner
                    </button>
                </div>
                <div class="card-body">
                    <div id="label-scanner-container" style="display: none;">
                        <video id="label-scanner-video" style="width: 100%; max-width: 400px; border-radius: 12px; margin: 0 auto; display: block;"></video>
                        <div id="label-scanner-result" style="margin-top: 12px; text-align: center;"></div>
                    </div>
                    <div id="label-scanner-placeholder" style="text-align: center; padding: 20px; color: var(--text-muted);">
                        <p>Click "Start Scanner" to scan existing product barcodes</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Handle product search for labels
 */
let labelSearchTimeout = null;
async function handleLabelProductSearch(query) {
    clearTimeout(labelSearchTimeout);

    if (query.length < 2) {
        return;
    }

    labelSearchTimeout = setTimeout(async () => {
        const productsContainer = document.getElementById('label-products-list');
        if (!productsContainer) return;

        productsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--accent-primary);"></i>
                <p style="margin-top: 12px; color: var(--text-muted);">Searching products...</p>
            </div>
        `;

        try {
            const products = await searchShopifyProducts(query, selectedStore);
            labelProducts = products;
            renderLabelProducts(products);
        } catch (error) {
            productsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--danger);">
                    <i class="fas fa-exclamation-circle" style="font-size: 32px;"></i>
                    <p style="margin-top: 12px;">Error searching products</p>
                </div>
            `;
        }
    }, 300);
}

/**
 * Handle store change
 */
function handleLabelStoreChange(store) {
    selectedStore = store;
    // Clear products and reload if there's a search query
    const searchInput = document.getElementById('label-product-search');
    if (searchInput && searchInput.value.length >= 2) {
        handleLabelProductSearch(searchInput.value);
    }
}

/**
 * Load recent products
 */
async function loadRecentProducts() {
    const productsContainer = document.getElementById('label-products-list');
    if (!productsContainer) return;

    productsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--accent-primary);"></i>
            <p style="margin-top: 12px; color: var(--text-muted);">Loading products...</p>
        </div>
    `;

    try {
        const products = await getAllShopifyProducts(selectedStore, 100);
        labelProducts = products;
        renderLabelProducts(products);
    } catch (error) {
        productsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--danger);">
                <i class="fas fa-exclamation-circle" style="font-size: 32px;"></i>
                <p style="margin-top: 12px;">Error loading products</p>
                <p style="font-size: 12px;">${error.message}</p>
            </div>
        `;
    }
}

/**
 * Render products list for label selection
 */
function renderLabelProducts(products) {
    const container = document.getElementById('label-products-list');
    const countEl = document.getElementById('products-count');

    if (countEl) {
        countEl.textContent = `${products.length} products`;
    }

    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fas fa-box-open" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p>No products found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => {
        const variant = product.variants?.[0];
        const price = variant?.price || '0.00';
        const sku = variant?.sku || 'N/A';
        const image = product.image?.src || product.images?.[0]?.src || '';
        const inventory = variant?.inventory_quantity ?? 'N/A';

        return `
            <div class="label-product-item" style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: var(--bg-secondary);
                border-radius: 8px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.2s;
            " onclick="selectLabelProduct(${product.id})" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='var(--bg-secondary)'">
                ${image ? `<img src="${image}" alt="${product.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;">` :
                `<div style="width: 60px; height: 60px; background: var(--bg-tertiary); border-radius: 6px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-box" style="color: var(--text-muted); font-size: 24px;"></i></div>`}

                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 500; font-size: 14px; margin-bottom: 4px;">${product.title}</div>
                    <div style="font-size: 12px; color: var(--text-muted);">SKU: ${sku}</div>
                    <div style="display: flex; gap: 12px; margin-top: 4px;">
                        <span style="font-size: 14px; color: var(--accent-primary); font-weight: 600;">$${parseFloat(price).toFixed(2)}</span>
                        <span style="font-size: 12px; color: var(--text-muted);">Stock: ${inventory}</span>
                    </div>
                </div>

                <button onclick="event.stopPropagation(); addProductToLabelQueue(${product.id})" class="btn-primary" style="padding: 8px 16px; font-size: 12px;">
                    <i class="fas fa-plus"></i> Add
                </button>
            </div>
        `;
    }).join('');
}

/**
 * Select product for preview
 */
function selectLabelProduct(productId) {
    const product = labelProducts.find(p => p.id === productId);
    if (product) {
        generateLabelPreview(product, product.variants?.[0]);
    }
}

/**
 * Add product to label queue from product list
 */
function addProductToLabelQueue(productId) {
    const product = labelProducts.find(p => p.id === productId);
    if (product) {
        addToLabelQueue(product, 1);
        generateLabelPreview(product, product.variants?.[0]);
    }
}

/**
 * Add manual label entry
 */
function addManualLabel() {
    const name = document.getElementById('manual-product-name')?.value?.trim();
    const price = document.getElementById('manual-product-price')?.value;
    const sku = document.getElementById('manual-product-sku')?.value?.trim();
    const qty = parseInt(document.getElementById('manual-product-qty')?.value) || 1;

    if (!name || !price) {
        alert('Please enter product name and price');
        return;
    }

    // Create a pseudo-product object
    const manualProduct = {
        id: Date.now(), // Use timestamp as unique ID
        title: name,
        variants: [{
            price: price,
            sku: sku || 'MANUAL'
        }]
    };

    addToLabelQueue(manualProduct, qty);
    generateLabelPreview(manualProduct, manualProduct.variants[0]);

    // Clear form
    document.getElementById('manual-product-name').value = '';
    document.getElementById('manual-product-price').value = '';
    document.getElementById('manual-product-sku').value = '';
    document.getElementById('manual-product-qty').value = '1';
}

/**
 * Toggle barcode scanner for labels
 */
let labelScanner = null;
async function toggleLabelScanner() {
    const container = document.getElementById('label-scanner-container');
    const placeholder = document.getElementById('label-scanner-placeholder');
    const btn = document.getElementById('label-scanner-btn');
    const video = document.getElementById('label-scanner-video');

    if (labelScanner) {
        // Stop scanner
        labelScanner.stop();
        labelScanner = null;
        container.style.display = 'none';
        placeholder.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-qrcode"></i> Start Scanner';
        return;
    }

    // Start scanner
    container.style.display = 'block';
    placeholder.style.display = 'none';
    btn.innerHTML = '<i class="fas fa-stop"></i> Stop Scanner';

    try {
        const { BrowserMultiFormatReader } = ZXing;
        labelScanner = new BrowserMultiFormatReader();

        await labelScanner.decodeFromVideoDevice(null, video, (result, error) => {
            if (result) {
                const code = result.getText();
                document.getElementById('label-scanner-result').innerHTML = `
                    <div style="padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                        <strong>Scanned:</strong> ${code}
                    </div>
                `;

                // Try to find product by barcode
                // For now, just show the code
                console.log('Scanned barcode:', code);
            }
        });
    } catch (error) {
        console.error('Scanner error:', error);
        document.getElementById('label-scanner-result').innerHTML = `
            <div style="color: var(--danger);">Error starting scanner: ${error.message}</div>
        `;
    }
}
