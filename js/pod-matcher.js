// ==========================================
// POD MATCHER MODULE - AI-Powered Pod/Coil Finder
// Device vs Multiple Pods comparison
// ==========================================

let podMatcherState = {
    isAnalyzing: false,
    deviceImage: null,
    podImages: [null, null, null, null], // Support up to 4 pod images
    identifiedDevice: null,
    identifiedPods: [null, null, null, null],
    matchResults: []
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
                <button onclick="clearAllPodMatcher()" class="btn-secondary" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-redo"></i> Start Over
                </button>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="pod-matcher-container">
            <!-- Device Upload Section -->
            <div class="pod-matcher-device-section">
                <div class="pod-matcher-upload-card device">
                    <div class="pod-matcher-upload-header" style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);">
                        <h3><i class="fas fa-mobile-alt"></i> Customer's Device</h3>
                        <span class="pod-matcher-step-badge">Step 1</span>
                    </div>
                    <div class="pod-matcher-upload-body">
                        <div id="podMatcherDeviceArea"
                             class="pod-matcher-dropzone"
                             onclick="document.getElementById('podMatcherDeviceInput').click()"
                             ondragover="handlePodMatcherDragOver(event)"
                             ondragleave="handlePodMatcherDragLeave(event)"
                             ondrop="handlePodMatcherDeviceDrop(event)">
                            <div id="podMatcherDevicePreview" class="pod-matcher-preview" style="display: none;">
                                <img id="podMatcherDeviceImage">
                                <button onclick="event.stopPropagation(); clearDeviceImage();" class="pod-matcher-remove-btn">
                                    <i class="fas fa-times"></i> Remove
                                </button>
                            </div>
                            <div id="podMatcherDevicePlaceholder">
                                <i class="fas fa-mobile-alt pod-matcher-dropzone-icon" style="color: #8b5cf6;"></i>
                                <p class="pod-matcher-dropzone-text">Upload device photo</p>
                                <p class="pod-matcher-dropzone-hint">JPG, PNG, HEIC</p>
                            </div>
                        </div>
                        <div class="pod-matcher-buttons">
                            <button onclick="document.getElementById('podMatcherDeviceCameraInput').click()" class="pod-matcher-btn pod-matcher-btn-primary">
                                <i class="fas fa-camera"></i> Photo
                            </button>
                            <button onclick="document.getElementById('podMatcherDeviceInput').click()" class="pod-matcher-btn pod-matcher-btn-secondary">
                                <i class="fas fa-folder-open"></i> Browse
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pods Upload Section -->
            <div class="pod-matcher-pods-section">
                <div class="pod-matcher-upload-card pods">
                    <div class="pod-matcher-upload-header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                        <h3><i class="fas fa-box-open"></i> Available Pods</h3>
                        <span class="pod-matcher-step-badge">Step 2</span>
                    </div>
                    <div class="pod-matcher-upload-body">
                        <p style="font-size: 13px; color: var(--text-muted); margin: 0 0 12px 0; text-align: center;">
                            Upload photos of the pods you have available (up to 4)
                        </p>
                        <div class="pod-matcher-pods-grid">
                            ${[0, 1, 2, 3].map(i => renderPodUploadSlot(i)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Analyze Button -->
        <div class="pod-matcher-action-bar">
            <button id="podMatcherAnalyzeBtn" onclick="analyzePodMatcherImages()" disabled class="pod-matcher-analyze-btn">
                <i class="fas fa-magic"></i> <span id="analyzeBtnText">Find Best Match</span>
            </button>
        </div>

        <!-- Results Section -->
        <div id="podMatcherResultsSection" class="pod-matcher-results-section" style="display: none;">
            <div class="card" style="padding: 0; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 16px 20px; color: white;">
                    <h3 style="margin: 0; font-size: 16px;"><i class="fas fa-check-circle"></i> Compatibility Results</h3>
                    <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 12px;">AI analysis of your pods</p>
                </div>
                <div id="podMatcherResults" style="padding: 20px;">
                </div>
            </div>
        </div>

        <!-- How it Works Section -->
        <div class="card pod-matcher-how-it-works" style="margin-top: 20px;">
            <h3 style="margin: 0 0 16px 0; font-size: 16px;"><i class="fas fa-lightbulb" style="color: #f59e0b; margin-right: 8px;"></i> How It Works</h3>
            <div class="pod-matcher-steps">
                <div class="pod-matcher-step">
                    <div class="pod-matcher-step-icon" style="background: linear-gradient(135deg, #8b5cf6, #6366f1);">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <h4>1. Scan Device</h4>
                    <p>Photo of customer's vape</p>
                </div>
                <div class="pod-matcher-step">
                    <div class="pod-matcher-step-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                        <i class="fas fa-box-open"></i>
                    </div>
                    <h4>2. Add Pods</h4>
                    <p>Photos of available pods</p>
                </div>
                <div class="pod-matcher-step">
                    <div class="pod-matcher-step-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                        <i class="fas fa-brain"></i>
                    </div>
                    <h4>3. AI Analysis</h4>
                    <p>Smart compatibility check</p>
                </div>
                <div class="pod-matcher-step">
                    <div class="pod-matcher-step-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <h4>4. Best Match</h4>
                    <p>Get the right pod</p>
                </div>
            </div>
        </div>

        <!-- Hidden file inputs -->
        <input type="file" id="podMatcherDeviceInput" accept="image/*" style="display: none;" onchange="handleDeviceFileSelect(event)">
        <input type="file" id="podMatcherDeviceCameraInput" accept="image/*" capture="environment" style="display: none;" onchange="handleDeviceFileSelect(event)">
        ${[0, 1, 2, 3].map(i => `
            <input type="file" id="podMatcherPodInput${i}" accept="image/*" style="display: none;" onchange="handlePodFileSelect(event, ${i})">
            <input type="file" id="podMatcherPodCameraInput${i}" accept="image/*" capture="environment" style="display: none;" onchange="handlePodFileSelect(event, ${i})">
        `).join('')}

        <style>
            .pod-matcher-container {
                display: grid;
                grid-template-columns: 1fr 1.5fr;
                gap: 20px;
                margin-top: 20px;
            }

            .pod-matcher-upload-card {
                background: var(--bg-primary);
                border-radius: 16px;
                overflow: hidden;
                border: 1px solid var(--border-color);
            }

            .pod-matcher-upload-header {
                padding: 14px 18px;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .pod-matcher-upload-header h3 {
                margin: 0;
                font-size: 15px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .pod-matcher-step-badge {
                background: rgba(255,255,255,0.2);
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
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
                min-height: 150px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
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
                font-size: 36px;
                margin-bottom: 12px;
                opacity: 0.8;
            }

            .pod-matcher-dropzone-text {
                font-size: 14px;
                font-weight: 600;
                color: var(--text-primary);
                margin: 0;
            }

            .pod-matcher-dropzone-hint {
                font-size: 12px;
                color: var(--text-muted);
                margin-top: 6px;
            }

            .pod-matcher-preview {
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .pod-matcher-preview img {
                max-width: 100%;
                max-height: 200px;
                border-radius: 8px;
                object-fit: contain;
            }

            .pod-matcher-remove-btn {
                margin-top: 10px;
                padding: 6px 14px;
                background: #ef4444;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
            }

            .pod-matcher-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-top: 12px;
            }

            .pod-matcher-btn {
                padding: 12px 16px;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s;
            }

            .pod-matcher-btn-primary {
                background: linear-gradient(135deg, #8b5cf6, #6366f1);
                color: white;
                border: none;
            }

            .pod-matcher-btn-secondary {
                background: var(--bg-secondary);
                color: var(--text-primary);
                border: 1px solid var(--border-color);
            }

            /* Pods Grid */
            .pod-matcher-pods-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }

            .pod-matcher-pod-slot {
                border: 2px dashed var(--border-color);
                border-radius: 12px;
                padding: 16px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;
                background: var(--bg-secondary);
                min-height: 120px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
            }

            .pod-matcher-pod-slot:hover {
                border-color: #10b981;
                background: rgba(16, 185, 129, 0.05);
            }

            .pod-matcher-pod-slot.has-image {
                border-style: solid;
                border-color: #10b981;
            }

            .pod-matcher-pod-slot .slot-number {
                position: absolute;
                top: 8px;
                left: 8px;
                width: 24px;
                height: 24px;
                background: var(--bg-tertiary);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 700;
                color: var(--text-muted);
            }

            .pod-matcher-pod-slot.has-image .slot-number {
                background: #10b981;
                color: white;
            }

            .pod-matcher-pod-slot img {
                max-width: 100%;
                max-height: 80px;
                border-radius: 6px;
                object-fit: contain;
            }

            .pod-matcher-pod-slot .remove-pod-btn {
                position: absolute;
                top: 6px;
                right: 6px;
                width: 24px;
                height: 24px;
                background: #ef4444;
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 10px;
                display: none;
            }

            .pod-matcher-pod-slot.has-image .remove-pod-btn {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .pod-matcher-pod-slot .add-icon {
                font-size: 24px;
                color: var(--text-muted);
                margin-bottom: 8px;
            }

            .pod-matcher-pod-slot .add-text {
                font-size: 12px;
                color: var(--text-muted);
            }

            /* Action Bar */
            .pod-matcher-action-bar {
                margin-top: 20px;
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

            /* Results Section */
            .pod-matcher-results-section {
                margin-top: 20px;
            }

            .pod-matcher-result-card {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px;
                background: var(--bg-secondary);
                border-radius: 12px;
                margin-bottom: 12px;
                border: 2px solid transparent;
            }

            .pod-matcher-result-card.compatible {
                border-color: #10b981;
                background: rgba(16, 185, 129, 0.1);
            }

            .pod-matcher-result-card.not-compatible {
                border-color: #ef4444;
                background: rgba(239, 68, 68, 0.05);
            }

            .pod-matcher-result-card.maybe-compatible {
                border-color: #f59e0b;
                background: rgba(245, 158, 11, 0.05);
            }

            .pod-matcher-result-card .result-image {
                width: 70px;
                height: 70px;
                border-radius: 10px;
                object-fit: cover;
                flex-shrink: 0;
            }

            .pod-matcher-result-card .result-badge {
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 700;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }

            .pod-matcher-result-card.compatible .result-badge {
                background: #10b981;
                color: white;
            }

            .pod-matcher-result-card.not-compatible .result-badge {
                background: #ef4444;
                color: white;
            }

            .pod-matcher-result-card.maybe-compatible .result-badge {
                background: #f59e0b;
                color: white;
            }

            .pod-matcher-result-card .result-rank {
                font-size: 24px;
                font-weight: 800;
                color: var(--text-muted);
                width: 40px;
                text-align: center;
            }

            .pod-matcher-result-card.compatible .result-rank {
                color: #10b981;
            }

            /* How it Works */
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
            }

            .pod-matcher-step-icon {
                width: 50px;
                height: 50px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 10px;
                color: white;
                font-size: 20px;
            }

            .pod-matcher-step h4 {
                margin: 0 0 4px 0;
                font-size: 13px;
                color: var(--text-primary);
            }

            .pod-matcher-step p {
                margin: 0;
                font-size: 11px;
                color: var(--text-muted);
            }

            /* Responsive */
            @media (max-width: 900px) {
                .pod-matcher-container {
                    grid-template-columns: 1fr;
                }

                .pod-matcher-steps {
                    grid-template-columns: repeat(2, 1fr);
                }
            }

            @media (max-width: 600px) {
                .pod-matcher-pods-grid {
                    grid-template-columns: repeat(2, 1fr);
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
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    `;

    updateAnalyzeButton();
}

// Render a pod upload slot
function renderPodUploadSlot(index) {
    return `
        <div id="podSlot${index}"
             class="pod-matcher-pod-slot"
             onclick="document.getElementById('podMatcherPodInput${index}').click()"
             ondragover="handlePodMatcherDragOver(event)"
             ondragleave="handlePodMatcherDragLeave(event)"
             ondrop="handlePodDrop(event, ${index})">
            <span class="slot-number">${index + 1}</span>
            <button onclick="event.stopPropagation(); clearPodImage(${index});" class="remove-pod-btn">
                <i class="fas fa-times"></i>
            </button>
            <div id="podPreview${index}" style="display: none;">
                <img id="podImage${index}">
            </div>
            <div id="podPlaceholder${index}">
                <i class="fas fa-plus-circle add-icon"></i>
                <span class="add-text">Add Pod ${index + 1}</span>
            </div>
        </div>
    `;
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

// Handle device drop
function handlePodMatcherDeviceDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    const files = event.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        loadDeviceImage(files[0]);
    }
}

// Handle pod drop
function handlePodDrop(event, index) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    const files = event.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        loadPodImage(files[0], index);
    }
}

// Handle device file select
function handleDeviceFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        loadDeviceImage(files[0]);
    }
}

// Handle pod file select
function handlePodFileSelect(event, index) {
    const files = event.target.files;
    if (files.length > 0) {
        loadPodImage(files[0], index);
    }
}

// Load device image
function loadDeviceImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        podMatcherState.deviceImage = e.target.result;

        const preview = document.getElementById('podMatcherDevicePreview');
        const placeholder = document.getElementById('podMatcherDevicePlaceholder');
        const img = document.getElementById('podMatcherDeviceImage');

        if (preview && placeholder && img) {
            img.src = e.target.result;
            preview.style.display = 'flex';
            placeholder.style.display = 'none';
        }

        updateAnalyzeButton();
    };
    reader.readAsDataURL(file);
}

// Load pod image
function loadPodImage(file, index) {
    const reader = new FileReader();
    reader.onload = function(e) {
        podMatcherState.podImages[index] = e.target.result;

        const slot = document.getElementById(`podSlot${index}`);
        const preview = document.getElementById(`podPreview${index}`);
        const placeholder = document.getElementById(`podPlaceholder${index}`);
        const img = document.getElementById(`podImage${index}`);

        if (slot && preview && placeholder && img) {
            img.src = e.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
            slot.classList.add('has-image');
        }

        updateAnalyzeButton();
    };
    reader.readAsDataURL(file);
}

// Clear device image
function clearDeviceImage() {
    podMatcherState.deviceImage = null;
    podMatcherState.identifiedDevice = null;

    const preview = document.getElementById('podMatcherDevicePreview');
    const placeholder = document.getElementById('podMatcherDevicePlaceholder');

    if (preview && placeholder) {
        preview.style.display = 'none';
        placeholder.style.display = 'flex';
    }

    document.getElementById('podMatcherDeviceInput').value = '';
    document.getElementById('podMatcherDeviceCameraInput').value = '';

    updateAnalyzeButton();
}

// Clear pod image
function clearPodImage(index) {
    podMatcherState.podImages[index] = null;
    podMatcherState.identifiedPods[index] = null;

    const slot = document.getElementById(`podSlot${index}`);
    const preview = document.getElementById(`podPreview${index}`);
    const placeholder = document.getElementById(`podPlaceholder${index}`);

    if (slot && preview && placeholder) {
        preview.style.display = 'none';
        placeholder.style.display = 'flex';
        slot.classList.remove('has-image');
    }

    document.getElementById(`podMatcherPodInput${index}`).value = '';
    document.getElementById(`podMatcherPodCameraInput${index}`).value = '';

    updateAnalyzeButton();
}

// Clear all
function clearAllPodMatcher() {
    clearDeviceImage();
    for (let i = 0; i < 4; i++) {
        clearPodImage(i);
    }
    podMatcherState.matchResults = [];
    document.getElementById('podMatcherResultsSection').style.display = 'none';
}

// Update analyze button state
function updateAnalyzeButton() {
    const btn = document.getElementById('podMatcherAnalyzeBtn');
    const btnText = document.getElementById('analyzeBtnText');
    if (!btn) return;

    const hasDevice = !!podMatcherState.deviceImage;
    const podCount = podMatcherState.podImages.filter(p => p !== null).length;

    if (!hasDevice) {
        btn.disabled = true;
        btnText.textContent = 'Upload Device Photo First';
    } else if (podCount === 0) {
        btn.disabled = true;
        btnText.textContent = 'Add at Least One Pod';
    } else {
        btn.disabled = false;
        btnText.textContent = `Find Best Match (${podCount} pod${podCount > 1 ? 's' : ''})`;
    }
}

// Analyze images with OpenAI Vision
async function analyzePodMatcherImages() {
    if (!podMatcherState.deviceImage || podMatcherState.isAnalyzing) return;

    const podCount = podMatcherState.podImages.filter(p => p !== null).length;
    if (podCount === 0) return;

    podMatcherState.isAnalyzing = true;
    const analyzeBtn = document.getElementById('podMatcherAnalyzeBtn');
    const resultsSection = document.getElementById('podMatcherResultsSection');
    const resultsDiv = document.getElementById('podMatcherResults');

    // Show loading
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    resultsSection.style.display = 'block';

    resultsDiv.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <div style="width: 60px; height: 60px; border: 4px solid var(--border-color); border-top-color: #8b5cf6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
            <h3 style="margin: 0 0 8px 0; color: var(--text-primary); font-size: 16px;">Analyzing Compatibility...</h3>
            <p style="margin: 0; color: var(--text-muted); font-size: 13px;">AI is checking which pods work with your device</p>
        </div>
    `;

    try {
        // Collect pod images that are uploaded
        const podData = [];
        for (let i = 0; i < 4; i++) {
            if (podMatcherState.podImages[i]) {
                podData.push({
                    index: i,
                    image: podMatcherState.podImages[i]
                });
            }
        }

        // Call the API with device and all pod images
        const response = await fetch('https://us-central1-vapesupplyusa.cloudfunctions.net/podMatcherAnalyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deviceImage: podMatcherState.deviceImage,
                podImages: podData.map(p => p.image),
                mode: 'compatibility_check'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to analyze images');
        }

        const result = await response.json();

        // Store identified device
        podMatcherState.identifiedDevice = result.device;

        // Map results back to pod indices
        podMatcherState.matchResults = (result.pods || []).map((pod, idx) => ({
            ...pod,
            originalIndex: podData[idx]?.index,
            image: podData[idx]?.image
        }));

        // Render results
        renderCompatibilityResults();

    } catch (error) {
        console.error('Pod Matcher Error:', error);
        resultsDiv.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #ef4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 40px; margin-bottom: 12px;"></i>
                <h3 style="margin: 0 0 8px 0; font-size: 16px;">Analysis Failed</h3>
                <p style="margin: 0; font-size: 13px;">${error.message || 'Could not analyze images. Please try again.'}</p>
                <button onclick="analyzePodMatcherImages()" style="margin-top: 16px; padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    } finally {
        podMatcherState.isAnalyzing = false;
        updateAnalyzeButton();
    }
}

// Render compatibility results
function renderCompatibilityResults() {
    const resultsDiv = document.getElementById('podMatcherResults');
    const device = podMatcherState.identifiedDevice;
    const results = podMatcherState.matchResults;

    // Sort results: compatible first, then maybe, then not compatible
    const sortedResults = [...results].sort((a, b) => {
        const order = { 'compatible': 0, 'maybe': 1, 'not_compatible': 2 };
        return (order[a.compatibility] || 2) - (order[b.compatibility] || 2);
    });

    let html = '';

    // Device card
    if (device) {
        html += `
            <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1)); border: 2px solid #8b5cf6; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 50px; height: 50px; background: #8b5cf6; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-mobile-alt" style="color: white; font-size: 20px;"></i>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: #8b5cf6; font-weight: 600; text-transform: uppercase;">Device Identified</div>
                        <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">${device.brand || 'Unknown'} ${device.model || 'Device'}</div>
                        ${device.type ? `<div style="font-size: 12px; color: var(--text-muted);"><i class="fas fa-info-circle"></i> ${device.type}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Results header
    html += `
        <h4 style="margin: 0 0 16px 0; color: var(--text-primary); font-size: 15px;">
            <i class="fas fa-list-ol" style="color: #10b981; margin-right: 8px;"></i>Pod Rankings
        </h4>
    `;

    // Pod results
    if (sortedResults.length === 0) {
        html += `
            <div style="text-align: center; padding: 30px; color: var(--text-muted);">
                <i class="fas fa-box-open" style="font-size: 40px; opacity: 0.3; margin-bottom: 12px;"></i>
                <p>No pods were analyzed</p>
            </div>
        `;
    } else {
        sortedResults.forEach((pod, idx) => {
            const isCompatible = pod.compatibility === 'compatible';
            const isMaybe = pod.compatibility === 'maybe';
            const cardClass = isCompatible ? 'compatible' : isMaybe ? 'maybe-compatible' : 'not-compatible';
            const badgeIcon = isCompatible ? 'fa-check' : isMaybe ? 'fa-question' : 'fa-times';
            const badgeText = isCompatible ? 'Compatible' : isMaybe ? 'Maybe' : 'Not Compatible';

            html += `
                <div class="pod-matcher-result-card ${cardClass}">
                    <div class="result-rank">#${idx + 1}</div>
                    <img src="${pod.image}" class="result-image">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
                            ${pod.name || `Pod ${pod.originalIndex + 1}`}
                        </div>
                        <span class="result-badge">
                            <i class="fas ${badgeIcon}"></i> ${badgeText}
                        </span>
                        ${pod.reason ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">${pod.reason}</div>` : ''}
                    </div>
                </div>
            `;
        });
    }

    // Best recommendation
    const bestMatch = sortedResults.find(p => p.compatibility === 'compatible');
    if (bestMatch) {
        html += `
            <div style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; padding: 16px; margin-top: 20px; color: white; text-align: center;">
                <i class="fas fa-trophy" style="font-size: 24px; margin-bottom: 8px;"></i>
                <h3 style="margin: 0 0 4px 0; font-size: 16px;">Best Match: ${bestMatch.name || `Pod ${bestMatch.originalIndex + 1}`}</h3>
                <p style="margin: 0; opacity: 0.9; font-size: 13px;">This pod is compatible with the customer's device</p>
            </div>
        `;
    } else if (sortedResults.length > 0) {
        html += `
            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 12px; padding: 16px; margin-top: 20px; color: white; text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 8px;"></i>
                <h3 style="margin: 0 0 4px 0; font-size: 16px;">No Compatible Pods Found</h3>
                <p style="margin: 0; opacity: 0.9; font-size: 13px;">None of these pods appear to be compatible with the device</p>
            </div>
        `;
    }

    resultsDiv.innerHTML = html;
}

// Make functions globally available
window.renderPodMatcher = renderPodMatcher;
window.handlePodMatcherDragOver = handlePodMatcherDragOver;
window.handlePodMatcherDragLeave = handlePodMatcherDragLeave;
window.handlePodMatcherDeviceDrop = handlePodMatcherDeviceDrop;
window.handlePodDrop = handlePodDrop;
window.handleDeviceFileSelect = handleDeviceFileSelect;
window.handlePodFileSelect = handlePodFileSelect;
window.loadDeviceImage = loadDeviceImage;
window.loadPodImage = loadPodImage;
window.clearDeviceImage = clearDeviceImage;
window.clearPodImage = clearPodImage;
window.clearAllPodMatcher = clearAllPodMatcher;
window.analyzePodMatcherImages = analyzePodMatcherImages;

// ==========================================
// END POD MATCHER MODULE
// ==========================================

// ==========================================
// ANNOUNCEMENT LIKES & COMMENTS
// Note: These functions are now defined in script.js
// to avoid sync issues between local and window.announcements
// ==========================================

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(dateString) {
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
}
