// ==========================================
// BULK INVOICE UPLOAD MODULE
// ==========================================

// State for bulk upload
let bulkInvoiceFiles = [];
let bulkProcessedInvoices = [];
let bulkProcessingIndex = 0;

/**
 * Open bulk invoice upload modal
 */
function openBulkInvoiceUpload() {
    bulkInvoiceFiles = [];
    bulkProcessedInvoices = [];
    bulkProcessingIndex = 0;

    const modal = document.createElement('div');
    modal.id = 'bulk-invoice-modal';
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
            border-radius: 20px;
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            animation: slideUp 0.4s ease-out;
            box-shadow: 0 25px 50px rgba(0,0,0,0.3);
        ">
            <!-- Header -->
            <div style="
                padding: 20px 24px;
                background: linear-gradient(135deg, #8b5cf6, #6366f1);
                display: flex;
                align-items: center;
                justify-content: space-between;
            ">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-layer-group" style="font-size: 20px; color: white;"></i>
                    </div>
                    <div>
                        <h2 style="margin: 0; color: white; font-size: 18px; font-weight: 700;">Bulk Invoice Upload</h2>
                        <p style="margin: 4px 0 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">Upload multiple invoices and process with AI</p>
                    </div>
                </div>
                <button onclick="closeBulkInvoiceModal()" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    cursor: pointer;
                    color: white;
                    font-size: 16px;
                ">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- Content -->
            <div id="bulk-upload-content" style="flex: 1; overflow-y: auto; padding: 24px;">
                <!-- Step 1: Upload -->
                <div id="bulk-step-upload">
                    <div id="bulk-drop-zone" style="
                        border: 3px dashed var(--border-color);
                        border-radius: 16px;
                        padding: 48px 24px;
                        text-align: center;
                        background: var(--bg-secondary);
                        cursor: pointer;
                        transition: all 0.3s;
                    " onclick="document.getElementById('bulk-file-input').click()"
                       ondragover="handleBulkDragOver(event)"
                       ondragleave="handleBulkDragLeave(event)"
                       ondrop="handleBulkDrop(event)">
                        <input type="file" id="bulk-file-input" multiple accept="image/*,.pdf,application/pdf" style="display: none;" onchange="handleBulkFileSelect(event)">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                            <i class="fas fa-cloud-upload-alt" style="font-size: 36px; color: white;"></i>
                        </div>
                        <h3 style="margin: 0 0 8px 0; color: var(--text-primary); font-size: 18px;">Drop files here or click to upload</h3>
                        <p style="margin: 0; color: var(--text-muted); font-size: 14px;">Supports multiple images, PDFs, or multi-page PDFs</p>
                        <p style="margin: 8px 0 0 0; color: var(--text-muted); font-size: 12px;">Each file/page will be processed as a separate invoice</p>
                    </div>

                    <!-- Selected Files Preview -->
                    <div id="bulk-files-preview" style="display: none; margin-top: 20px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                            <h4 style="margin: 0; color: var(--text-primary);"><i class="fas fa-file-alt"></i> Selected Files (<span id="bulk-file-count">0</span>)</h4>
                            <button onclick="clearBulkFiles()" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 13px;">
                                <i class="fas fa-trash"></i> Clear All
                            </button>
                        </div>
                        <div id="bulk-files-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; max-height: 200px; overflow-y: auto;"></div>
                    </div>
                </div>

                <!-- Step 2: Processing -->
                <div id="bulk-step-processing" style="display: none; text-align: center; padding: 40px 0;">
                    <div style="width: 80px; height: 80px; margin: 0 auto 20px;">
                        <div class="bulk-spinner" style="width: 100%; height: 100%; border: 4px solid var(--border-color); border-top-color: #8b5cf6; border-radius: 50%; animation: bulkSpin 1s linear infinite;"></div>
                    </div>
                    <h3 style="margin: 0 0 8px 0; color: var(--text-primary);">Processing Invoices with AI...</h3>
                    <p id="bulk-progress-text" style="margin: 0; color: var(--text-muted);">Analyzing file 1 of 5</p>
                    <div style="margin-top: 20px; background: var(--bg-secondary); border-radius: 8px; height: 8px; overflow: hidden;">
                        <div id="bulk-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #8b5cf6, #6366f1); transition: width 0.3s;"></div>
                    </div>
                </div>

                <!-- Step 3: Review -->
                <div id="bulk-step-review" style="display: none;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                        <h3 style="margin: 0; color: var(--text-primary);"><i class="fas fa-check-circle" style="color: #10b981;"></i> Review Processed Invoices</h3>
                        <span id="bulk-review-count" style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">0 invoices</span>
                    </div>
                    <p style="margin: 0 0 16px 0; color: var(--text-muted); font-size: 13px;">Review and edit the extracted data before saving. Click on any field to edit.</p>
                    <div id="bulk-invoices-list" style="display: flex; flex-direction: column; gap: 16px; max-height: 400px; overflow-y: auto;"></div>
                </div>
            </div>

            <!-- Footer -->
            <div id="bulk-footer" style="padding: 16px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <button onclick="closeBulkInvoiceModal()" style="padding: 10px 20px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-weight: 600; cursor: pointer;">
                    Cancel
                </button>
                <div style="display: flex; gap: 10px;">
                    <button id="bulk-process-btn" onclick="startBulkProcessing()" style="padding: 10px 24px; border-radius: 8px; border: none; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; font-weight: 600; cursor: pointer; display: none;">
                        <i class="fas fa-magic"></i> Process with AI
                    </button>
                    <button id="bulk-save-btn" onclick="saveBulkInvoices()" style="padding: 10px 24px; border-radius: 8px; border: none; background: linear-gradient(135deg, #10b981, #059669); color: white; font-weight: 600; cursor: pointer; display: none;">
                        <i class="fas fa-save"></i> Save All Invoices
                    </button>
                </div>
            </div>
        </div>
        <style>
            @keyframes bulkSpin { to { transform: rotate(360deg); } }
        </style>
    `;

    document.body.appendChild(modal);
}

/**
 * Close bulk invoice modal
 */
function closeBulkInvoiceModal() {
    const modal = document.getElementById('bulk-invoice-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.2s ease-out forwards';
        setTimeout(() => modal.remove(), 200);
    }
    bulkInvoiceFiles = [];
    bulkProcessedInvoices = [];
}

/**
 * Handle drag over
 */
function handleBulkDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const zone = document.getElementById('bulk-drop-zone');
    if (zone) {
        zone.style.borderColor = '#8b5cf6';
        zone.style.background = 'rgba(139, 92, 246, 0.1)';
    }
}

/**
 * Handle drag leave
 */
function handleBulkDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const zone = document.getElementById('bulk-drop-zone');
    if (zone) {
        zone.style.borderColor = 'var(--border-color)';
        zone.style.background = 'var(--bg-secondary)';
    }
}

/**
 * Handle file drop
 */
function handleBulkDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    handleBulkDragLeave(e);
    const files = Array.from(e.dataTransfer.files);
    addBulkFiles(files);
}

/**
 * Handle file selection
 */
function handleBulkFileSelect(e) {
    const files = Array.from(e.target.files);
    addBulkFiles(files);
}

/**
 * Add files to bulk upload list
 */
function addBulkFiles(files) {
    const validFiles = files.filter(f =>
        f.type.startsWith('image/') ||
        f.type === 'application/pdf' ||
        f.name.toLowerCase().endsWith('.pdf')
    );
    bulkInvoiceFiles = [...bulkInvoiceFiles, ...validFiles];
    updateBulkFilesPreview();
}

/**
 * Update files preview
 */
function updateBulkFilesPreview() {
    const preview = document.getElementById('bulk-files-preview');
    const list = document.getElementById('bulk-files-list');
    const count = document.getElementById('bulk-file-count');
    const processBtn = document.getElementById('bulk-process-btn');

    if (bulkInvoiceFiles.length === 0) {
        preview.style.display = 'none';
        processBtn.style.display = 'none';
        return;
    }

    preview.style.display = 'block';
    processBtn.style.display = 'inline-flex';
    count.textContent = bulkInvoiceFiles.length;

    list.innerHTML = bulkInvoiceFiles.map((file, index) => {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        return `
            <div style="background: var(--bg-secondary); border-radius: 12px; padding: 12px; text-align: center; position: relative;">
                <button onclick="removeBulkFile(${index})" style="position: absolute; top: 4px; right: 4px; background: #ef4444; border: none; width: 20px; height: 20px; border-radius: 50%; color: white; font-size: 10px; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
                <div style="width: 50px; height: 50px; margin: 0 auto 8px; background: ${isPdf ? '#ef4444' : '#3b82f6'}; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-${isPdf ? 'file-pdf' : 'file-image'}" style="font-size: 20px; color: white;"></i>
                </div>
                <p style="margin: 0; font-size: 11px; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${file.name}">${file.name.substring(0, 15)}${file.name.length > 15 ? '...' : ''}</p>
                <p style="margin: 2px 0 0 0; font-size: 10px; color: var(--text-muted);">${(file.size / 1024).toFixed(1)} KB</p>
            </div>
        `;
    }).join('');
}

/**
 * Remove file from list
 */
function removeBulkFile(index) {
    bulkInvoiceFiles.splice(index, 1);
    updateBulkFilesPreview();
}

/**
 * Clear all files
 */
function clearBulkFiles() {
    bulkInvoiceFiles = [];
    updateBulkFilesPreview();
}

/**
 * Start bulk processing with AI
 */
async function startBulkProcessing() {
    if (bulkInvoiceFiles.length === 0) {
        showNotification('Please select files to process', 'warning');
        return;
    }

    document.getElementById('bulk-step-upload').style.display = 'none';
    document.getElementById('bulk-step-processing').style.display = 'block';
    document.getElementById('bulk-process-btn').style.display = 'none';

    bulkProcessedInvoices = [];
    const totalFiles = bulkInvoiceFiles.length;

    for (let i = 0; i < totalFiles; i++) {
        const file = bulkInvoiceFiles[i];
        document.getElementById('bulk-progress-text').textContent = `Analyzing file ${i + 1} of ${totalFiles}: ${file.name}`;
        document.getElementById('bulk-progress-bar').style.width = `${((i) / totalFiles) * 100}%`;

        try {
            const result = await processSingleInvoiceWithAI(file, i);
            if (result) bulkProcessedInvoices.push(result);
        } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            bulkProcessedInvoices.push({
                originalFile: file,
                invoiceNumber: '',
                vendor: file.name.replace(/\.[^/.]+$/, ''),
                product: '',
                category: '',
                store: '',
                amount: 0,
                invoiceDate: new Date().toISOString().split('T')[0],
                dueDate: '',
                status: 'pending',
                description: '',
                notes: 'Failed to process with AI - please fill manually',
                error: true
            });
        }
        document.getElementById('bulk-progress-bar').style.width = `${((i + 1) / totalFiles) * 100}%`;
    }

    document.getElementById('bulk-step-processing').style.display = 'none';
    document.getElementById('bulk-step-review').style.display = 'block';
    document.getElementById('bulk-save-btn').style.display = 'inline-flex';
    renderBulkInvoicesReview();
}

/**
 * Process single invoice with AI
 */
async function processSingleInvoiceWithAI(file, index) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const base64Data = e.target.result;
            try {
                const apiKey = getOpenAIKey();
                if (!apiKey) {
                    resolve({
                        originalFile: file, fileData: base64Data, invoiceNumber: '', vendor: file.name.replace(/\.[^/.]+$/, ''),
                        product: '', category: '', store: '', amount: 0, invoiceDate: new Date().toISOString().split('T')[0],
                        dueDate: '', status: 'pending', description: '', notes: 'OpenAI API key not configured', error: true
                    });
                    return;
                }

                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o',
                        max_tokens: 1024,
                        messages: [{
                            role: 'user',
                            content: [
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: base64Data
                                    }
                                },
                                {
                                    type: 'text',
                                    text: `Analyze this invoice image and extract the following information. Return ONLY a valid JSON object with these fields (use empty string for any field you cannot determine):
{
    "invoiceNumber": "invoice number or reference",
    "vendor": "vendor/supplier name",
    "product": "main product or service",
    "category": "one of: Inventory, Services, Utilities, Rent, Supplies, Equipment, Marketing, Other",
    "amount": number (just the number, no currency symbol),
    "invoiceDate": "YYYY-MM-DD format",
    "dueDate": "YYYY-MM-DD format or empty",
    "description": "brief description",
    "notes": "any additional relevant info"
}
Return ONLY the JSON object, no other text.`
                                }
                            ]
                        }]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const content = data.choices[0].message.content;
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        resolve({
                            originalFile: file,
                            fileData: base64Data,
                            invoiceNumber: parsed.invoiceNumber || '',
                            vendor: parsed.vendor || '',
                            product: parsed.product || '',
                            category: parsed.category || '',
                            store: '',
                            amount: parseFloat(parsed.amount) || 0,
                            invoiceDate: parsed.invoiceDate || new Date().toISOString().split('T')[0],
                            dueDate: parsed.dueDate || '',
                            status: 'pending',
                            description: parsed.description || '',
                            notes: parsed.notes || '',
                            error: false
                        });
                        return;
                    }
                }
                resolve({
                    originalFile: file, fileData: base64Data, invoiceNumber: '', vendor: file.name.replace(/\.[^/.]+$/, ''),
                    product: '', category: '', store: '', amount: 0, invoiceDate: new Date().toISOString().split('T')[0],
                    dueDate: '', status: 'pending', description: '', notes: 'Could not extract data - please fill manually', error: true
                });
            } catch (error) {
                resolve({
                    originalFile: file, fileData: base64Data, invoiceNumber: '', vendor: file.name.replace(/\.[^/.]+$/, ''),
                    product: '', category: '', store: '', amount: 0, invoiceDate: new Date().toISOString().split('T')[0],
                    dueDate: '', status: 'pending', description: '', notes: 'AI processing failed - please fill manually', error: true
                });
            }
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Render bulk invoices review
 */
function renderBulkInvoicesReview() {
    const list = document.getElementById('bulk-invoices-list');
    const countEl = document.getElementById('bulk-review-count');
    countEl.textContent = `${bulkProcessedInvoices.length} invoices`;

    list.innerHTML = bulkProcessedInvoices.map((inv, index) => `
        <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; border-left: 4px solid ${inv.error ? '#ef4444' : '#10b981'};">
            <div style="display: flex; align-items: start; gap: 16px;">
                <div style="width: 80px; height: 80px; background: var(--bg-tertiary); border-radius: 8px; overflow: hidden; flex-shrink: 0;">
                    ${inv.fileData && inv.originalFile.type.startsWith('image/') ?
                        `<img src="${inv.fileData}" style="width: 100%; height: 100%; object-fit: cover;">` :
                        `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"><i class="fas fa-file-pdf" style="font-size: 32px; color: #ef4444;"></i></div>`}
                </div>
                <div style="flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                    <div>
                        <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Invoice #</label>
                        <input type="text" value="${inv.invoiceNumber || ''}" onchange="updateBulkInvoice(${index}, 'invoiceNumber', this.value)" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); font-size: 13px;">
                    </div>
                    <div>
                        <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Vendor</label>
                        <input type="text" value="${inv.vendor || ''}" onchange="updateBulkInvoice(${index}, 'vendor', this.value)" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); font-size: 13px;">
                    </div>
                    <div>
                        <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Amount</label>
                        <input type="number" step="0.01" value="${inv.amount || 0}" onchange="updateBulkInvoice(${index}, 'amount', parseFloat(this.value))" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); font-size: 13px;">
                    </div>
                    <div>
                        <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Category</label>
                        <select onchange="updateBulkInvoice(${index}, 'category', this.value)" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); font-size: 13px;">
                            <option value="">Select...</option>
                            <option value="Inventory" ${inv.category === 'Inventory' ? 'selected' : ''}>Inventory</option>
                            <option value="Services" ${inv.category === 'Services' ? 'selected' : ''}>Services</option>
                            <option value="Utilities" ${inv.category === 'Utilities' ? 'selected' : ''}>Utilities</option>
                            <option value="Rent" ${inv.category === 'Rent' ? 'selected' : ''}>Rent</option>
                            <option value="Supplies" ${inv.category === 'Supplies' ? 'selected' : ''}>Supplies</option>
                            <option value="Equipment" ${inv.category === 'Equipment' ? 'selected' : ''}>Equipment</option>
                            <option value="Marketing" ${inv.category === 'Marketing' ? 'selected' : ''}>Marketing</option>
                            <option value="Other" ${inv.category === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Store</label>
                        <select onchange="updateBulkInvoice(${index}, 'store', this.value)" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); font-size: 13px;">
                            <option value="">Unassigned</option>
                            <option value="Miramar" ${inv.store === 'Miramar' ? 'selected' : ''}>VSU Miramar</option>
                            <option value="Morena" ${inv.store === 'Morena' ? 'selected' : ''}>VSU Morena</option>
                            <option value="Kearny Mesa" ${inv.store === 'Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                            <option value="Chula Vista" ${inv.store === 'Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                            <option value="North Park" ${inv.store === 'North Park' ? 'selected' : ''}>VSU North Park</option>
                            <option value="Miramar Wine & Liquor" ${inv.store === 'Miramar Wine & Liquor' ? 'selected' : ''}>MW&L</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Date</label>
                        <input type="date" value="${inv.invoiceDate || ''}" onchange="updateBulkInvoice(${index}, 'invoiceDate', this.value)" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); font-size: 13px;">
                    </div>
                </div>
                <button onclick="removeBulkInvoice(${index})" style="background: #ef4444; border: none; width: 32px; height: 32px; border-radius: 8px; color: white; cursor: pointer; flex-shrink: 0;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            ${inv.error ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #ef4444;"><i class="fas fa-exclamation-triangle"></i> ${inv.notes}</p>` : ''}
        </div>
    `).join('');
}

/**
 * Update bulk invoice field
 */
function updateBulkInvoice(index, field, value) {
    if (bulkProcessedInvoices[index]) {
        bulkProcessedInvoices[index][field] = value;
    }
}

/**
 * Remove invoice from review
 */
function removeBulkInvoice(index) {
    bulkProcessedInvoices.splice(index, 1);
    renderBulkInvoicesReview();
}

/**
 * Save all bulk invoices
 */
async function saveBulkInvoices() {
    if (bulkProcessedInvoices.length === 0) {
        showNotification('No invoices to save', 'warning');
        return;
    }

    const saveBtn = document.getElementById('bulk-save-btn');
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;

    let savedCount = 0;
    let errorCount = 0;

    for (const inv of bulkProcessedInvoices) {
        try {
            let fileUrl = null;
            let filePath = null;

            if (inv.originalFile && typeof firebaseStorageHelper !== 'undefined' && firebaseStorageHelper.isInitialized) {
                try {
                    const uploadResult = await firebaseStorageHelper.uploadDocument(
                        inv.originalFile,
                        'invoices/attachments',
                        (inv.invoiceNumber || 'bulk').replace(/[^a-zA-Z0-9]/g, '_') + '_'
                    );
                    fileUrl = uploadResult.url;
                    filePath = uploadResult.path;
                } catch (uploadError) {
                    console.error('Error uploading file:', uploadError);
                }
            }

            const invoiceData = {
                invoiceNumber: inv.invoiceNumber || '',
                vendor: inv.vendor || '',
                product: inv.product || '',
                category: inv.category || '',
                categories: inv.category ? [inv.category] : [],
                store: inv.store || null,
                amount: parseFloat(inv.amount) || 0,
                invoiceDate: inv.invoiceDate || '',
                dueDate: inv.dueDate || '',
                status: inv.status || 'pending',
                description: inv.description || '',
                notes: inv.notes || '',
                photo: fileUrl,
                filePath: filePath,
                recurring: false,
                paymentAccount: ''
            };

            if (typeof firebaseInvoiceManager !== 'undefined' && firebaseInvoiceManager.isInitialized) {
                const docId = await firebaseInvoiceManager.addInvoice(invoiceData);
                if (docId) {
                    invoiceData.id = docId;
                    invoiceData.firestoreId = docId;
                    invoices.unshift(invoiceData);
                    savedCount++;
                    if (typeof logActivity === 'function') {
                        await logActivity(ACTIVITY_TYPES.CREATE, {
                            message: `Bulk uploaded invoice: ${inv.invoiceNumber || 'No number'}`,
                            invoiceNumber: inv.invoiceNumber,
                            vendor: inv.vendor,
                            amount: inv.amount
                        }, 'invoice', docId);
                    }
                } else {
                    errorCount++;
                }
            } else {
                invoiceData.id = invoices.length + 1;
                invoices.unshift(invoiceData);
                savedCount++;
            }
        } catch (error) {
            console.error('Error saving invoice:', error);
            errorCount++;
        }
    }

    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save All Invoices';
    saveBtn.disabled = false;

    closeBulkInvoiceModal();
    renderInvoices();

    if (errorCount > 0) {
        showNotification(`Saved ${savedCount} invoices. ${errorCount} failed.`, 'warning');
    } else {
        showNotification(`Successfully saved ${savedCount} invoices!`, 'success');
    }
}

// Make bulk upload functions globally available
window.openBulkInvoiceUpload = openBulkInvoiceUpload;
window.closeBulkInvoiceModal = closeBulkInvoiceModal;
window.handleBulkDragOver = handleBulkDragOver;
window.handleBulkDragLeave = handleBulkDragLeave;
window.handleBulkDrop = handleBulkDrop;
window.handleBulkFileSelect = handleBulkFileSelect;
window.removeBulkFile = removeBulkFile;
window.clearBulkFiles = clearBulkFiles;
window.startBulkProcessing = startBulkProcessing;
window.updateBulkInvoice = updateBulkInvoice;
window.removeBulkInvoice = removeBulkInvoice;
window.saveBulkInvoices = saveBulkInvoices;

// ==========================================
