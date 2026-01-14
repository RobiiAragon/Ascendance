// ==========================================
// POD MATCHER MODULE - AI-Powered Pod/Coil Finder
// Supports 1 or 2 device comparison
// ==========================================

let podMatcherState = {
    isAnalyzing: false,
    images: [null, null],           // Support 2 images
    identifiedDevices: [null, null], // Support 2 devices
    compatibleProducts: [],
    comparisonMode: false,
    analysisHistory: []
};

// Render Pod Matcher page
function renderPodMatcher() {
    const dashboard = document.querySelector('.dashboard');

    dashboard.innerHTML = `
        <div class="page-header">
            <div class="page-header-left">
                <h2 class="section-title"><i class="fas fa-search-plus" style="margin-right: 10px; color: #8b5cf6;"></i>Pod Matcher</h2>
                <p class="section-subtitle">AI-powered pod and coil compatibility finder</p>
            </div>
            <div class="page-header-right">
                <button onclick="togglePodMatcherMode()" id="podMatcherModeBtn" class="btn-secondary" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-exchange-alt"></i>
                    <span id="podMatcherModeText">Compare 2 Devices</span>
                </button>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div id="podMatcherMainGrid" class="pod-matcher-container">
            <!-- Upload Section -->
            <div id="podMatcherUploadSection" class="pod-matcher-upload-section">
                ${renderUploadZone(0)}
                <div id="podMatcherUploadZone2" class="pod-matcher-upload-zone-2" style="display: none;">
                    ${renderUploadZone(1)}
                </div>
            </div>

            <!-- Results Section -->
            <div class="pod-matcher-results-section">
                <div class="card" style="padding: 0; overflow: hidden; height: 100%;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 16px 20px; color: white;">
                        <h3 style="margin: 0; font-size: 16px;"><i class="fas fa-check-circle"></i> Compatible Products</h3>
                        <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 12px;">Pods and coils from your inventory</p>
                    </div>
                    <div id="podMatcherResults" style="padding: 20px; min-height: 300px; max-height: calc(100vh - 400px); overflow-y: auto;">
                        <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                            <i class="fas fa-search" style="font-size: 48px; opacity: 0.3; margin-bottom: 12px;"></i>
                            <h3 style="margin: 0 0 8px 0; color: var(--text-secondary); font-size: 16px;">Ready to Scan</h3>
                            <p style="margin: 0; font-size: 13px;">Upload a photo of a vape device to find compatible pods</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Analyze Button (Fixed at bottom on mobile) -->
        <div class="pod-matcher-action-bar">
            <button id="podMatcherAnalyzeBtn" onclick="analyzePodMatcherImages()" disabled class="pod-matcher-analyze-btn">
                <i class="fas fa-magic"></i> <span id="analyzeBtnText">Identify Device & Find Pods</span>
            </button>
        </div>

        <!-- How it Works Section -->
        <div class="card pod-matcher-how-it-works" style="margin-top: 20px;">
            <h3 style="margin: 0 0 16px 0; font-size: 16px;"><i class="fas fa-lightbulb" style="color: #f59e0b; margin-right: 8px;"></i> How Pod Matcher Works</h3>
            <div class="pod-matcher-steps">
                <div class="pod-matcher-step">
                    <div class="pod-matcher-step-icon" style="background: linear-gradient(135deg, #8b5cf6, #6366f1);">
                        <i class="fas fa-camera"></i>
                    </div>
                    <h4>1. Capture</h4>
                    <p>Take a photo of the vape device</p>
                </div>
                <div class="pod-matcher-step">
                    <div class="pod-matcher-step-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                        <i class="fas fa-brain"></i>
                    </div>
                    <h4>2. Identify</h4>
                    <p>AI identifies the device model</p>
                </div>
                <div class="pod-matcher-step">
                    <div class="pod-matcher-step-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                        <i class="fas fa-search"></i>
                    </div>
                    <h4>3. Match</h4>
                    <p>Find compatible pods & coils</p>
                </div>
                <div class="pod-matcher-step">
                    <div class="pod-matcher-step-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                        <i class="fas fa-box"></i>
                    </div>
                    <h4>4. Inventory</h4>
                    <p>Show products in stock</p>
                </div>
            </div>
        </div>

        <!-- Hidden camera inputs -->
        <input type="file" id="podMatcherFileInput0" accept="image/*" style="display: none;" onchange="handlePodMatcherFileSelect(event, 0)">
        <input type="file" id="podMatcherFileInput1" accept="image/*" style="display: none;" onchange="handlePodMatcherFileSelect(event, 1)">
        <input type="file" id="podMatcherCameraInput0" accept="image/*" capture="environment" style="display: none;" onchange="handlePodMatcherFileSelect(event, 0)">
        <input type="file" id="podMatcherCameraInput1" accept="image/*" capture="environment" style="display: none;" onchange="handlePodMatcherFileSelect(event, 1)">

        <style>
            .pod-matcher-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 20px;
            }

            .pod-matcher-upload-section {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .pod-matcher-upload-zone-2 {
                animation: slideDown 0.3s ease;
            }

            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .pod-matcher-results-section {
                min-height: 400px;
            }

            .pod-matcher-action-bar {
                margin-top: 16px;
            }

            .pod-matcher-analyze-btn {
                width: 100%;
                padding: 16px;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 700;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }

            .pod-matcher-analyze-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .pod-matcher-analyze-btn:not(:disabled):hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
            }

            .pod-matcher-upload-card {
                background: var(--bg-primary);
                border-radius: 16px;
                overflow: hidden;
                border: 1px solid var(--border-color);
            }

            .pod-matcher-upload-header {
                background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
                padding: 14px 18px;
                color: white;
            }

            .pod-matcher-upload-header h3 {
                margin: 0;
                font-size: 15px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .pod-matcher-upload-body {
                padding: 16px;
            }

            .pod-matcher-dropzone {
                border: 2px dashed var(--border-color);
                border-radius: 12px;
                padding: 30px 20px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;
                background: var(--bg-secondary);
            }

            .pod-matcher-dropzone:hover {
                border-color: #8b5cf6;
                background: rgba(139, 92, 246, 0.05);
            }

            .pod-matcher-dropzone.dragover {
                border-color: #8b5cf6;
                background: rgba(139, 92, 246, 0.1);
            }

            .pod-matcher-dropzone-icon {
                font-size: 40px;
                color: #8b5cf6;
                margin-bottom: 10px;
            }

            .pod-matcher-preview {
                display: none;
            }

            .pod-matcher-preview img {
                max-width: 100%;
                max-height: 200px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }

            .pod-matcher-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-top: 12px;
            }

            .pod-matcher-btn {
                padding: 12px;
                border-radius: 10px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                transition: all 0.2s;
            }

            .pod-matcher-btn-primary {
                background: linear-gradient(135deg, #8b5cf6, #6366f1);
                color: white;
                border: none;
            }

            .pod-matcher-btn-secondary {
                background: var(--bg-tertiary);
                color: var(--text-primary);
                border: 1px solid var(--border-color);
            }

            .pod-matcher-how-it-works {
                padding: 20px;
            }

            .pod-matcher-steps {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
            }

            .pod-matcher-step {
                text-align: center;
                padding: 12px;
            }

            .pod-matcher-step-icon {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 10px;
            }

            .pod-matcher-step-icon i {
                color: white;
                font-size: 20px;
            }

            .pod-matcher-step h4 {
                margin: 0 0 4px 0;
                font-size: 13px;
            }

            .pod-matcher-step p {
                margin: 0;
                font-size: 11px;
                color: var(--text-muted);
            }

            /* Device Card in Results */
            .pod-matcher-device-card {
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1));
                border: 2px solid #8b5cf6;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 16px;
            }

            .pod-matcher-device-card.device-2 {
                background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(219, 39, 119, 0.1));
                border-color: #ec4899;
            }

            .pod-matcher-pods-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 10px;
            }

            .pod-matcher-pod-tag {
                background: rgba(139, 92, 246, 0.2);
                color: #8b5cf6;
                padding: 3px 10px;
                border-radius: 15px;
                font-size: 11px;
                font-weight: 600;
            }

            .pod-matcher-pod-tag.device-2 {
                background: rgba(236, 72, 153, 0.2);
                color: #ec4899;
            }

            /* Responsive Styles */
            @media (max-width: 900px) {
                .pod-matcher-container {
                    grid-template-columns: 1fr;
                }

                .pod-matcher-results-section {
                    order: 2;
                }

                .pod-matcher-upload-section {
                    order: 1;
                }
            }

            @media (max-width: 600px) {
                .page-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 12px;
                }

                .page-header-right {
                    width: 100%;
                }

                .page-header-right button {
                    width: 100%;
                    justify-content: center;
                }

                .pod-matcher-steps {
                    grid-template-columns: repeat(2, 1fr);
                }

                .pod-matcher-dropzone {
                    padding: 20px 15px;
                }

                .pod-matcher-dropzone-icon {
                    font-size: 32px;
                }

                .pod-matcher-preview img {
                    max-height: 150px;
                }

                .pod-matcher-action-bar {
                    position: sticky;
                    bottom: 0;
                    background: var(--bg-primary);
                    padding: 12px 0;
                    margin: 0 -16px;
                    padding: 12px 16px;
                    border-top: 1px solid var(--border-color);
                    z-index: 10;
                }

                .pod-matcher-how-it-works {
                    margin-bottom: 80px;
                }
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    `;

    updateAnalyzeButton();
}

// Render individual upload zone
function renderUploadZone(index) {
    const isSecond = index === 1;
    const color = isSecond ? '#ec4899' : '#8b5cf6';
    const gradient = isSecond
        ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
        : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)';

    return `
        <div class="pod-matcher-upload-card">
            <div class="pod-matcher-upload-header" style="background: ${gradient};">
                <h3><i class="fas fa-camera"></i> ${isSecond ? 'Device 2' : 'Scan Your Device'}</h3>
            </div>
            <div class="pod-matcher-upload-body">
                <div id="podMatcherUploadArea${index}"
                     class="pod-matcher-dropzone"
                     onclick="document.getElementById('podMatcherFileInput${index}').click()"
                     ondragover="handlePodMatcherDragOver(event)"
                     ondragleave="handlePodMatcherDragLeave(event)"
                     ondrop="handlePodMatcherDrop(event, ${index})">
                    <div id="podMatcherPreview${index}" class="pod-matcher-preview">
                        <img id="podMatcherImage${index}">
                        <button onclick="event.stopPropagation(); clearPodMatcherImage(${index});"
                                style="margin-top: 12px; padding: 6px 14px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">
                            <i class="fas fa-times"></i> Remove
                        </button>
                    </div>
                    <div id="podMatcherPlaceholder${index}">
                        <i class="fas fa-cloud-upload-alt pod-matcher-dropzone-icon" style="color: ${color};"></i>
                        <p style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0;">
                            ${isSecond ? 'Drop second device image' : 'Drop image here or click to upload'}
                        </p>
                        <p style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">JPG, PNG, HEIC</p>
                    </div>
                </div>
                <div class="pod-matcher-buttons">
                    <button onclick="openPodMatcherCamera(${index})" class="pod-matcher-btn pod-matcher-btn-primary">
                        <i class="fas fa-camera"></i> Photo
                    </button>
                    <button onclick="document.getElementById('podMatcherFileInput${index}').click()" class="pod-matcher-btn pod-matcher-btn-secondary">
                        <i class="fas fa-folder-open"></i> Browse
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Toggle between single and comparison mode
function togglePodMatcherMode() {
    podMatcherState.comparisonMode = !podMatcherState.comparisonMode;

    const zone2 = document.getElementById('podMatcherUploadZone2');
    const modeText = document.getElementById('podMatcherModeText');
    const modeBtn = document.getElementById('podMatcherModeBtn');

    if (podMatcherState.comparisonMode) {
        zone2.style.display = 'block';
        zone2.innerHTML = renderUploadZone(1);
        modeText.textContent = 'Single Device';
        modeBtn.classList.remove('btn-secondary');
        modeBtn.classList.add('btn-primary');
        modeBtn.style.background = 'linear-gradient(135deg, #ec4899, #db2777)';
    } else {
        zone2.style.display = 'none';
        modeText.textContent = 'Compare 2 Devices';
        modeBtn.classList.remove('btn-primary');
        modeBtn.classList.add('btn-secondary');
        modeBtn.style.background = '';
        // Clear second image
        podMatcherState.images[1] = null;
        podMatcherState.identifiedDevices[1] = null;
    }

    updateAnalyzeButton();
}

// Handle drag over
function handlePodMatcherDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

// Handle drag leave
function handlePodMatcherDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
}

// Handle drop
function handlePodMatcherDrop(event, index = 0) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');

    const files = event.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        loadPodMatcherImage(files[0], index);
    }
}

// Handle file select
function handlePodMatcherFileSelect(event, index = 0) {
    const files = event.target.files;
    if (files.length > 0) {
        loadPodMatcherImage(files[0], index);
    }
}

// Open camera (mobile)
function openPodMatcherCamera(index = 0) {
    document.getElementById(`podMatcherCameraInput${index}`).click();
}

// Load and preview image
function loadPodMatcherImage(file, index = 0) {
    const reader = new FileReader();
    reader.onload = function(e) {
        podMatcherState.images[index] = e.target.result;

        const preview = document.getElementById(`podMatcherPreview${index}`);
        const placeholder = document.getElementById(`podMatcherPlaceholder${index}`);
        const img = document.getElementById(`podMatcherImage${index}`);

        if (preview && placeholder && img) {
            img.src = e.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        }

        updateAnalyzeButton();
    };
    reader.readAsDataURL(file);
}

// Clear image
function clearPodMatcherImage(index = 0) {
    podMatcherState.images[index] = null;
    podMatcherState.identifiedDevices[index] = null;

    const preview = document.getElementById(`podMatcherPreview${index}`);
    const placeholder = document.getElementById(`podMatcherPlaceholder${index}`);

    if (preview && placeholder) {
        preview.style.display = 'none';
        placeholder.style.display = 'block';
    }

    // Clear file inputs
    const fileInput = document.getElementById(`podMatcherFileInput${index}`);
    const cameraInput = document.getElementById(`podMatcherCameraInput${index}`);
    if (fileInput) fileInput.value = '';
    if (cameraInput) cameraInput.value = '';

    updateAnalyzeButton();
}

// Update analyze button state
function updateAnalyzeButton() {
    const btn = document.getElementById('podMatcherAnalyzeBtn');
    const btnText = document.getElementById('analyzeBtnText');
    if (!btn) return;

    const hasImage1 = !!podMatcherState.images[0];
    const hasImage2 = !!podMatcherState.images[1];

    if (podMatcherState.comparisonMode) {
        // Need both images for comparison
        btn.disabled = !hasImage1 || !hasImage2;
        btnText.textContent = hasImage1 && hasImage2
            ? 'Compare Both Devices'
            : 'Upload Both Device Photos';
    } else {
        // Single mode - need just one image
        btn.disabled = !hasImage1;
        btnText.textContent = 'Identify Device & Find Pods';
    }
}

// Analyze image(s) with OpenAI Vision
async function analyzePodMatcherImages() {
    const hasImage1 = !!podMatcherState.images[0];
    const hasImage2 = podMatcherState.comparisonMode && !!podMatcherState.images[1];

    if (!hasImage1 || podMatcherState.isAnalyzing) return;
    if (podMatcherState.comparisonMode && !hasImage2) return;

    podMatcherState.isAnalyzing = true;
    const resultsDiv = document.getElementById('podMatcherResults');
    const analyzeBtn = document.getElementById('podMatcherAnalyzeBtn');

    // Show loading state
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

    resultsDiv.innerHTML = `
        <div style="text-align: center; padding: 50px 20px;">
            <div style="width: 60px; height: 60px; border: 4px solid var(--border-color); border-top-color: #8b5cf6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
            <h3 style="margin: 0 0 8px 0; color: var(--text-primary); font-size: 16px;">Analyzing ${podMatcherState.comparisonMode ? 'Devices' : 'Device'}...</h3>
            <p style="margin: 0; color: var(--text-muted); font-size: 13px;">AI is identifying your ${podMatcherState.comparisonMode ? 'devices' : 'device'}</p>
        </div>
    `;

    try {
        // Analyze first image
        const result1 = await analyzeOneImage(podMatcherState.images[0]);
        podMatcherState.identifiedDevices[0] = result1;

        // Analyze second image if in comparison mode
        if (podMatcherState.comparisonMode && podMatcherState.images[1]) {
            const result2 = await analyzeOneImage(podMatcherState.images[1]);
            podMatcherState.identifiedDevices[1] = result2;
        }

        // Search inventory for compatible products
        await findCompatibleProducts();

    } catch (error) {
        console.error('Pod Matcher Error:', error);
        resultsDiv.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #ef4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 40px; margin-bottom: 12px;"></i>
                <h3 style="margin: 0 0 8px 0; font-size: 16px;">Analysis Failed</h3>
                <p style="margin: 0; font-size: 13px;">${error.message || 'Could not identify the device. Please try a clearer photo.'}</p>
                <button onclick="analyzePodMatcherImages()" style="margin-top: 16px; padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    } finally {
        podMatcherState.isAnalyzing = false;
        updateAnalyzeButton();
        const btn = document.getElementById('podMatcherAnalyzeBtn');
        if (btn) {
            btn.innerHTML = `<i class="fas fa-magic"></i> <span id="analyzeBtnText">${podMatcherState.comparisonMode ? 'Compare Both Devices' : 'Identify Device & Find Pods'}</span>`;
        }
    }
}

// Analyze a single image
async function analyzeOneImage(imageData) {
    const response = await fetch('https://us-central1-vapesupplyusa.cloudfunctions.net/podMatcherAnalyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
    });

    if (!response.ok) {
        throw new Error('Failed to analyze image');
    }

    return await response.json();
}

// Find compatible products from Shopify inventory
async function findCompatibleProducts() {
    const resultsDiv = document.getElementById('podMatcherResults');

    resultsDiv.innerHTML = `
        <div style="text-align: center; padding: 30px 20px;">
            <div style="width: 50px; height: 50px; border: 3px solid var(--border-color); border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px;"></div>
            <p style="margin: 0; color: var(--text-muted); font-size: 13px;">Searching inventory...</p>
        </div>
    `;

    try {
        // Fetch inventory from both stores
        const [vsuInventory, lvInventory] = await Promise.all([
            fetchStoreInventory('vsu', 500).catch(() => []),
            fetchStoreInventory('loyalvaper', 500).catch(() => [])
        ]);

        const allInventory = [...vsuInventory, ...lvInventory];

        // Get devices
        const device1 = podMatcherState.identifiedDevices[0];
        const device2 = podMatcherState.comparisonMode ? podMatcherState.identifiedDevices[1] : null;

        // Filter products for each device
        const products1 = filterCompatibleProducts(allInventory, device1);
        const products2 = device2 ? filterCompatibleProducts(allInventory, device2) : [];

        // Merge and tag products
        const mergedProducts = mergeProductResults(products1, products2);
        podMatcherState.compatibleProducts = mergedProducts;

        // Render results
        renderPodMatcherResults(device1, device2, mergedProducts);

    } catch (error) {
        console.error('Error fetching inventory:', error);
        renderPodMatcherResults(podMatcherState.identifiedDevices[0], podMatcherState.identifiedDevices[1], []);
    }
}

// Filter products based on device info
function filterCompatibleProducts(inventory, deviceInfo) {
    if (!deviceInfo || !deviceInfo.compatiblePods || !Array.isArray(deviceInfo.compatiblePods)) {
        return [];
    }

    const searchTerms = deviceInfo.compatiblePods.map(term => term.toLowerCase());
    const brandName = (deviceInfo.brand || '').toLowerCase();

    return inventory.filter(product => {
        const productName = (product.productName || product.title || product.name || '').toLowerCase();
        const sku = (product.sku || '').toLowerCase();

        return searchTerms.some(term => {
            return productName.includes(term) || sku.includes(term);
        });
    }).slice(0, 30);
}

// Merge products from both devices
function mergeProductResults(products1, products2) {
    const productMap = new Map();

    // Add products from device 1
    products1.forEach(p => {
        const key = p.sku || p.productName || p.title;
        productMap.set(key, { ...p, compatibleWith: [1] });
    });

    // Add/merge products from device 2
    products2.forEach(p => {
        const key = p.sku || p.productName || p.title;
        if (productMap.has(key)) {
            productMap.get(key).compatibleWith.push(2);
        } else {
            productMap.set(key, { ...p, compatibleWith: [2] });
        }
    });

    // Convert to array and sort (both devices first)
    return Array.from(productMap.values()).sort((a, b) => {
        const aScore = a.compatibleWith.length === 2 ? 100 : 0;
        const bScore = b.compatibleWith.length === 2 ? 100 : 0;
        return bScore - aScore;
    }).slice(0, 25);
}

// Render Pod Matcher results
function renderPodMatcherResults(device1, device2, products) {
    const resultsDiv = document.getElementById('podMatcherResults');
    const isComparison = podMatcherState.comparisonMode && device2;

    // Device card(s)
    let deviceCards = '';

    if (device1) {
        deviceCards += renderDeviceCard(device1, 1);
    }

    if (isComparison && device2) {
        deviceCards += renderDeviceCard(device2, 2);
    }

    if (products.length === 0) {
        resultsDiv.innerHTML = `
            ${deviceCards}
            <div style="text-align: center; padding: 30px 20px; color: var(--text-muted);">
                <i class="fas fa-box-open" style="font-size: 40px; opacity: 0.3; margin-bottom: 12px;"></i>
                <h3 style="margin: 0 0 8px 0; color: var(--text-secondary); font-size: 15px;">No Products in Stock</h3>
                <p style="margin: 0; font-size: 13px;">No compatible pods found in inventory.</p>
            </div>
        `;
        return;
    }

    resultsDiv.innerHTML = `
        ${deviceCards}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h4 style="margin: 0; color: var(--text-primary); font-size: 14px;">
                <i class="fas fa-box" style="color: #10b981; margin-right: 6px;"></i>In Stock (${products.length})
            </h4>
            ${isComparison ? `
                <div style="display: flex; gap: 8px; font-size: 11px;">
                    <span style="display: flex; align-items: center; gap: 4px;">
                        <span style="width: 10px; height: 10px; background: #8b5cf6; border-radius: 50%;"></span> Device 1
                    </span>
                    <span style="display: flex; align-items: center; gap: 4px;">
                        <span style="width: 10px; height: 10px; background: #ec4899; border-radius: 50%;"></span> Device 2
                    </span>
                    <span style="display: flex; align-items: center; gap: 4px;">
                        <span style="width: 10px; height: 10px; background: linear-gradient(135deg, #8b5cf6, #ec4899); border-radius: 50%;"></span> Both
                    </span>
                </div>
            ` : ''}
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            ${products.map(product => renderProductCard(product, isComparison)).join('')}
        </div>
    `;
}

// Render device identification card
function renderDeviceCard(device, deviceNumber) {
    const isSecond = deviceNumber === 2;
    const color = isSecond ? '#ec4899' : '#8b5cf6';
    const bgGradient = isSecond
        ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(219, 39, 119, 0.1))'
        : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))';

    return `
        <div class="pod-matcher-device-card ${isSecond ? 'device-2' : ''}" style="background: ${bgGradient}; border-color: ${color};">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 45px; height: 45px; background: ${color}; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class="fas fa-check" style="color: white; font-size: 18px;"></i>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 11px; color: ${color}; font-weight: 600; text-transform: uppercase;">
                        ${podMatcherState.comparisonMode ? `Device ${deviceNumber}` : 'Device Identified'}
                    </div>
                    <div style="font-size: 16px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${device.brand || 'Unknown'} ${device.model || 'Device'}
                    </div>
                    ${device.coilType ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;"><i class="fas fa-cog"></i> ${device.coilType}</div>` : ''}
                </div>
            </div>
            ${device.compatiblePods && device.compatiblePods.length > 0 ? `
                <div class="pod-matcher-pods-tags">
                    ${device.compatiblePods.slice(0, 5).map(pod => `
                        <span class="pod-matcher-pod-tag ${isSecond ? 'device-2' : ''}" style="background: ${isSecond ? 'rgba(236, 72, 153, 0.2)' : 'rgba(139, 92, 246, 0.2)'}; color: ${color};">${pod}</span>
                    `).join('')}
                    ${device.compatiblePods.length > 5 ? `<span style="font-size: 11px; color: var(--text-muted);">+${device.compatiblePods.length - 5} more</span>` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

// Render product card
function renderProductCard(product, isComparison) {
    const qty = product.inventoryQuantity || product.stock || product.quantity || 0;
    const qtyColor = qty < 5 ? '#ef4444' : qty < 15 ? '#f59e0b' : '#10b981';
    const store = product.store || 'VSU';

    // Compatibility indicator
    let compatIndicator = '';
    if (isComparison && product.compatibleWith) {
        if (product.compatibleWith.length === 2) {
            compatIndicator = `<div style="width: 8px; height: 8px; background: linear-gradient(135deg, #8b5cf6, #ec4899); border-radius: 50%; flex-shrink: 0;" title="Compatible with both"></div>`;
        } else if (product.compatibleWith.includes(1)) {
            compatIndicator = `<div style="width: 8px; height: 8px; background: #8b5cf6; border-radius: 50%; flex-shrink: 0;" title="Device 1"></div>`;
        } else {
            compatIndicator = `<div style="width: 8px; height: 8px; background: #ec4899; border-radius: 50%; flex-shrink: 0;" title="Device 2"></div>`;
        }
    }

    return `
        <div style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--bg-secondary); border-radius: 10px; border: 1px solid var(--border-color);">
            ${compatIndicator}
            <div style="width: 40px; height: 40px; background: var(--bg-tertiary); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="fas fa-cube" style="color: var(--text-muted); font-size: 16px;"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 600; font-size: 13px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${product.productName || product.title || product.name}
                </div>
                <div style="font-size: 11px; color: var(--text-muted); display: flex; gap: 10px; margin-top: 2px;">
                    <span><i class="fas fa-store"></i> ${store}</span>
                    ${product.sku ? `<span>${product.sku}</span>` : ''}
                </div>
            </div>
            <div style="text-align: right; flex-shrink: 0;">
                <div style="font-size: 16px; font-weight: 700; color: ${qtyColor};">${qty}</div>
                <div style="font-size: 10px; color: var(--text-muted);">in stock</div>
            </div>
        </div>
    `;
}

// Make functions globally available
window.renderPodMatcher = renderPodMatcher;
window.togglePodMatcherMode = togglePodMatcherMode;
window.handlePodMatcherDragOver = handlePodMatcherDragOver;
window.handlePodMatcherDragLeave = handlePodMatcherDragLeave;
window.handlePodMatcherDrop = handlePodMatcherDrop;
window.handlePodMatcherFileSelect = handlePodMatcherFileSelect;
window.openPodMatcherCamera = openPodMatcherCamera;
window.loadPodMatcherImage = loadPodMatcherImage;
window.clearPodMatcherImage = clearPodMatcherImage;
window.analyzePodMatcherImages = analyzePodMatcherImages;

// ==========================================
// END POD MATCHER MODULE
// ==========================================

// ==========================================
// ANNOUNCEMENT LIKES & COMMENTS (GLOBAL)
// ==========================================

/**
 * Toggle like on an announcement
 */
window.toggleAnnouncementLike = async function(announcementId) {
    const user = window.authManager?.getCurrentUser();
    if (!user) {
        alert('Please log in to like announcements');
        return;
    }

    // Find announcement in global announcements array
    const announcement = window.announcements?.find(a =>
        a.id === announcementId ||
        a.firestoreId === announcementId ||
        String(a.id) === String(announcementId) ||
        String(a.firestoreId) === String(announcementId)
    );
    if (!announcement) {
        console.error('Announcement not found:', announcementId, 'Available:', window.announcements?.map(a => ({id: a.id, firestoreId: a.firestoreId})));
        return;
    }

    // Get the correct ID for Firebase update
    const firestoreId = announcement.firestoreId || announcement.id;

    const likes = announcement.likes || [];
    const currentUserId = user.id || user.odooId || user.email;
    const existingLikeIndex = likes.findIndex(l => l.odooId === currentUserId || l.odooId === user.odooId || l.userId === currentUserId);

    let updatedLikes;
    if (existingLikeIndex > -1) {
        // Remove like
        updatedLikes = likes.filter((_, i) => i !== existingLikeIndex);
    } else {
        // Add like
        updatedLikes = [...likes, {
            odooId: user.odooId || currentUserId,
            userId: currentUserId,
            name: user.name || user.email?.split('@')[0] || 'Unknown',
            date: new Date().toISOString()
        }];
    }

    // Update in Firebase
    try {
        if (window.firebaseAnnouncementsManager?.isInitialized) {
            const success = await window.firebaseAnnouncementsManager.updateAnnouncement(firestoreId, { likes: updatedLikes });
            if (success) {
                // Reload announcements
                const updated = await window.firebaseAnnouncementsManager.loadAnnouncements();
                if (updated) window.announcements = updated;
            } else {
                console.error('Failed to update announcement');
            }
        } else {
            // Local update
            announcement.likes = updatedLikes;
        }
        if (typeof window.renderAnnouncements === 'function') {
            window.renderAnnouncements();
        }
    } catch (error) {
        console.error('Error toggling like:', error);
    }
};

/**
 * Toggle comments section visibility
 */
window.toggleAnnouncementComments = function(announcementId) {
    const commentsSection = document.getElementById(`comments-${announcementId}`);
    if (commentsSection) {
        const isHidden = commentsSection.style.display === 'none';
        commentsSection.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            // Focus on comment input
            const input = document.getElementById(`comment-input-${announcementId}`);
            if (input) input.focus();
        }
    }
};

/**
 * Add a comment to an announcement
 */
window.addAnnouncementComment = async function(announcementId) {
    const user = window.authManager?.getCurrentUser();
    if (!user) {
        alert('Please log in to comment');
        return;
    }

    const input = document.getElementById(`comment-input-${announcementId}`);
    const text = input?.value?.trim();
    if (!text) return;

    const announcement = window.announcements?.find(a =>
        a.id === announcementId ||
        a.firestoreId === announcementId ||
        String(a.id) === String(announcementId) ||
        String(a.firestoreId) === String(announcementId)
    );
    if (!announcement) return;

    const firestoreId = announcement.firestoreId || announcement.id;

    const currentUserId = user.id || user.odooId || user.email;
    const newComment = {
        id: 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        odooId: user.odooId || currentUserId,
        userId: currentUserId,
        author: user.name || user.email?.split('@')[0] || 'Unknown',
        text: text,
        date: new Date().toISOString()
    };

    const updatedComments = [...(announcement.comments || []), newComment];

    // Update in Firebase
    try {
        if (window.firebaseAnnouncementsManager?.isInitialized) {
            await window.firebaseAnnouncementsManager.updateAnnouncement(firestoreId, { comments: updatedComments });
            // Reload announcements
            const updated = await window.firebaseAnnouncementsManager.loadAnnouncements();
            if (updated) window.announcements = updated;
        } else {
            announcement.comments = updatedComments;
        }
        if (typeof window.renderAnnouncements === 'function') {
            window.renderAnnouncements();
        }
        // Re-open comments section after render
        setTimeout(() => {
            const commentsSection = document.getElementById(`comments-${announcementId}`);
            if (commentsSection) commentsSection.style.display = 'block';
        }, 50);
    } catch (error) {
        console.error('Error adding comment:', error);
    }
};

/**
 * Delete a comment from an announcement
 */
window.deleteAnnouncementComment = async function(announcementId, commentId) {
    const announcement = window.announcements?.find(a =>
        a.id === announcementId ||
        a.firestoreId === announcementId ||
        String(a.id) === String(announcementId) ||
        String(a.firestoreId) === String(announcementId)
    );
    if (!announcement) return;

    const firestoreId = announcement.firestoreId || announcement.id;
    const updatedComments = (announcement.comments || []).filter(c => c.id !== commentId);

    try {
        if (window.firebaseAnnouncementsManager?.isInitialized) {
            await window.firebaseAnnouncementsManager.updateAnnouncement(firestoreId, { comments: updatedComments });
            const updated = await window.firebaseAnnouncementsManager.loadAnnouncements();
            if (updated) window.announcements = updated;
        } else {
            announcement.comments = updatedComments;
        }
        if (typeof window.renderAnnouncements === 'function') {
            window.renderAnnouncements();
        }
        // Re-open comments section after render
        setTimeout(() => {
            const commentsSection = document.getElementById(`comments-${announcementId}`);
            if (commentsSection) commentsSection.style.display = 'block';
        }, 50);
    } catch (error) {
        console.error('Error deleting comment:', error);
    }
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
window.formatRelativeTime = function(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ==========================================
// END ANNOUNCEMENT LIKES & COMMENTS
// ==========================================
