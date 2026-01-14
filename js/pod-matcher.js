// END BULK INVOICE UPLOAD MODULE
// ==========================================

// ==========================================
// POD MATCHER MODULE - AI-Powered Pod/Coil Finder
// ==========================================

let podMatcherState = {
    isAnalyzing: false,
    currentImage: null,
    identifiedDevice: null,
    compatibleProducts: [],
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
        </div>

        <div class="pod-matcher-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-top: 20px;">
            <!-- Left Column - Camera/Upload -->
            <div class="card" style="padding: 0; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 20px; color: white;">
                    <h3 style="margin: 0; font-size: 18px;"><i class="fas fa-camera"></i> Scan Your Device</h3>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 13px;">Take a photo or upload an image of your vape device</p>
                </div>

                <div style="padding: 24px;">
                    <!-- Upload Area -->
                    <div id="podMatcherUploadArea"
                         style="border: 3px dashed var(--border-color); border-radius: 16px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.3s; background: var(--bg-secondary);"
                         onclick="document.getElementById('podMatcherFileInput').click()"
                         ondragover="handlePodMatcherDragOver(event)"
                         ondragleave="handlePodMatcherDragLeave(event)"
                         ondrop="handlePodMatcherDrop(event)">
                        <div id="podMatcherPreview" style="display: none;">
                            <img id="podMatcherImage" style="max-width: 100%; max-height: 300px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                            <button onclick="event.stopPropagation(); clearPodMatcherImage();" style="margin-top: 16px; padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                                <i class="fas fa-times"></i> Remove Image
                            </button>
                        </div>
                        <div id="podMatcherPlaceholder">
                            <i class="fas fa-cloud-upload-alt" style="font-size: 64px; color: #8b5cf6; margin-bottom: 16px;"></i>
                            <p style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0;">Drop image here or click to upload</p>
                            <p style="font-size: 13px; color: var(--text-muted); margin-top: 8px;">Supports JPG, PNG, HEIC</p>
                        </div>
                    </div>
                    <input type="file" id="podMatcherFileInput" accept="image/*" style="display: none;" onchange="handlePodMatcherFileSelect(event)">

                    <!-- Camera Button (Mobile) -->
                    <div style="display: flex; gap: 12px; margin-top: 16px;">
                        <button onclick="openPodMatcherCamera()" style="flex: 1; padding: 14px; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 600;">
                            <i class="fas fa-camera"></i> Take Photo
                        </button>
                        <button onclick="document.getElementById('podMatcherFileInput').click()" style="flex: 1; padding: 14px; background: var(--bg-tertiary); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 600;">
                            <i class="fas fa-folder-open"></i> Browse Files
                        </button>
                    </div>

                    <!-- Analyze Button -->
                    <button id="podMatcherAnalyzeBtn" onclick="analyzePodMatcherImage()" disabled style="width: 100%; margin-top: 16px; padding: 16px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 16px; font-weight: 700; opacity: 0.5; transition: all 0.3s;">
                        <i class="fas fa-magic"></i> Identify Device & Find Pods
                    </button>
                </div>
            </div>

            <!-- Right Column - Results -->
            <div class="card" style="padding: 0; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; color: white;">
                    <h3 style="margin: 0; font-size: 18px;"><i class="fas fa-check-circle"></i> Compatible Products</h3>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 13px;">Pods and coils from your inventory that match</p>
                </div>

                <div id="podMatcherResults" style="padding: 24px; min-height: 400px;">
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                        <i class="fas fa-search" style="font-size: 64px; opacity: 0.3; margin-bottom: 16px;"></i>
                        <h3 style="margin: 0 0 8px 0; color: var(--text-secondary);">Ready to Scan</h3>
                        <p style="margin: 0; font-size: 14px;">Upload a photo of a vape device to find compatible pods</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- How it Works Section -->
        <div class="card" style="margin-top: 24px;">
            <h3 style="margin: 0 0 20px 0;"><i class="fas fa-lightbulb" style="color: #f59e0b; margin-right: 8px;"></i> How Pod Matcher Works</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 20px;">
                <div style="text-align: center; padding: 20px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
                        <i class="fas fa-camera" style="color: white; font-size: 24px;"></i>
                    </div>
                    <h4 style="margin: 0 0 8px 0; font-size: 14px;">1. Capture</h4>
                    <p style="margin: 0; font-size: 12px; color: var(--text-muted);">Take a photo of the vape device</p>
                </div>
                <div style="text-align: center; padding: 20px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
                        <i class="fas fa-brain" style="color: white; font-size: 24px;"></i>
                    </div>
                    <h4 style="margin: 0 0 8px 0; font-size: 14px;">2. Identify</h4>
                    <p style="margin: 0; font-size: 12px; color: var(--text-muted);">AI identifies the device model</p>
                </div>
                <div style="text-align: center; padding: 20px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
                        <i class="fas fa-search" style="color: white; font-size: 24px;"></i>
                    </div>
                    <h4 style="margin: 0 0 8px 0; font-size: 14px;">3. Match</h4>
                    <p style="margin: 0; font-size: 12px; color: var(--text-muted);">Find compatible pods & coils</p>
                </div>
                <div style="text-align: center; padding: 20px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
                        <i class="fas fa-box" style="color: white; font-size: 24px;"></i>
                    </div>
                    <h4 style="margin: 0 0 8px 0; font-size: 14px;">4. Inventory</h4>
                    <p style="margin: 0; font-size: 12px; color: var(--text-muted);">Show products in your stock</p>
                </div>
            </div>
        </div>

        <!-- Hidden camera input for mobile -->
        <input type="file" id="podMatcherCameraInput" accept="image/*" capture="environment" style="display: none;" onchange="handlePodMatcherFileSelect(event)">
    `;
}

// Handle drag over
function handlePodMatcherDragOver(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#8b5cf6';
    event.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
}

// Handle drag leave
function handlePodMatcherDragLeave(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = 'var(--border-color)';
    event.currentTarget.style.background = 'var(--bg-secondary)';
}

// Handle drop
function handlePodMatcherDrop(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = 'var(--border-color)';
    event.currentTarget.style.background = 'var(--bg-secondary)';

    const files = event.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        loadPodMatcherImage(files[0]);
    }
}

// Handle file select
function handlePodMatcherFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        loadPodMatcherImage(files[0]);
    }
}

// Open camera (mobile)
function openPodMatcherCamera() {
    document.getElementById('podMatcherCameraInput').click();
}

// Load and preview image
function loadPodMatcherImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        podMatcherState.currentImage = e.target.result;

        const preview = document.getElementById('podMatcherPreview');
        const placeholder = document.getElementById('podMatcherPlaceholder');
        const img = document.getElementById('podMatcherImage');
        const analyzeBtn = document.getElementById('podMatcherAnalyzeBtn');

        img.src = e.target.result;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
        analyzeBtn.disabled = false;
        analyzeBtn.style.opacity = '1';
    };
    reader.readAsDataURL(file);
}

// Clear image
function clearPodMatcherImage() {
    podMatcherState.currentImage = null;
    podMatcherState.identifiedDevice = null;

    const preview = document.getElementById('podMatcherPreview');
    const placeholder = document.getElementById('podMatcherPlaceholder');
    const analyzeBtn = document.getElementById('podMatcherAnalyzeBtn');

    preview.style.display = 'none';
    placeholder.style.display = 'block';
    analyzeBtn.disabled = true;
    analyzeBtn.style.opacity = '0.5';

    // Clear file inputs
    document.getElementById('podMatcherFileInput').value = '';
    document.getElementById('podMatcherCameraInput').value = '';
}

// Analyze image with OpenAI Vision
async function analyzePodMatcherImage() {
    if (!podMatcherState.currentImage || podMatcherState.isAnalyzing) return;

    podMatcherState.isAnalyzing = true;
    const resultsDiv = document.getElementById('podMatcherResults');
    const analyzeBtn = document.getElementById('podMatcherAnalyzeBtn');

    // Show loading state
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

    resultsDiv.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="width: 80px; height: 80px; border: 4px solid var(--border-color); border-top-color: #8b5cf6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <h3 style="margin: 0 0 8px 0; color: var(--text-primary);">Analyzing Image...</h3>
            <p style="margin: 0; color: var(--text-muted);">AI is identifying your device</p>
        </div>
        <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    `;

    try {
        // Call OpenAI Vision API via Firebase function
        const response = await fetch('https://us-central1-vapesupplyusa.cloudfunctions.net/podMatcherAnalyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: podMatcherState.currentImage
            })
        });

        if (!response.ok) {
            throw new Error('Failed to analyze image');
        }

        const result = await response.json();
        podMatcherState.identifiedDevice = result;

        // Now search inventory for compatible products
        await findCompatibleProducts(result);

    } catch (error) {
        console.error('Pod Matcher Error:', error);
        resultsDiv.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #ef4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
                <h3 style="margin: 0 0 8px 0;">Analysis Failed</h3>
                <p style="margin: 0; font-size: 14px;">${error.message || 'Could not identify the device. Please try a clearer photo.'}</p>
                <button onclick="analyzePodMatcherImage()" style="margin-top: 20px; padding: 12px 24px; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    } finally {
        podMatcherState.isAnalyzing = false;
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-magic"></i> Identify Device & Find Pods';
    }
}

// Find compatible products from Shopify inventory
async function findCompatibleProducts(deviceInfo) {
    const resultsDiv = document.getElementById('podMatcherResults');

    resultsDiv.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <div style="width: 60px; height: 60px; border: 3px solid var(--border-color); border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
            <p style="margin: 0; color: var(--text-muted);">Searching inventory for compatible products...</p>
        </div>
    `;

    try {
        // Fetch inventory from both VSU and Loyal Vaper
        const [vsuInventory, lvInventory] = await Promise.all([
            fetchStoreInventory('vsu', 500).catch(() => []),
            fetchStoreInventory('loyalvaper', 500).catch(() => [])
        ]);

        const allInventory = [...vsuInventory, ...lvInventory];

        // Filter products based on device compatibility
        const compatibleProducts = filterCompatibleProducts(allInventory, deviceInfo);

        podMatcherState.compatibleProducts = compatibleProducts;

        // Render results
        renderPodMatcherResults(deviceInfo, compatibleProducts);

    } catch (error) {
        console.error('Error fetching inventory:', error);
        renderPodMatcherResults(deviceInfo, []);
    }
}

// Filter products based on device info
function filterCompatibleProducts(inventory, deviceInfo) {
    if (!deviceInfo || !deviceInfo.compatiblePods || !Array.isArray(deviceInfo.compatiblePods)) {
        return [];
    }

    const searchTerms = deviceInfo.compatiblePods.map(term => term.toLowerCase());
    const brandName = (deviceInfo.brand || '').toLowerCase();
    const modelName = (deviceInfo.model || '').toLowerCase();

    return inventory.filter(product => {
        const productName = (product.productName || product.title || product.name || '').toLowerCase();
        const sku = (product.sku || '').toLowerCase();

        // Check if product matches any compatible pod/coil
        return searchTerms.some(term => {
            return productName.includes(term) || sku.includes(term);
        });
    }).slice(0, 20); // Limit to 20 results
}

// Render Pod Matcher results
function renderPodMatcherResults(deviceInfo, products) {
    const resultsDiv = document.getElementById('podMatcherResults');

    const deviceCard = deviceInfo ? `
        <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1)); border: 2px solid #8b5cf6; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-check" style="color: white; font-size: 24px;"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 12px; color: #8b5cf6; font-weight: 600; text-transform: uppercase;">Device Identified</div>
                    <div style="font-size: 20px; font-weight: 700; color: var(--text-primary);">${deviceInfo.brand || 'Unknown'} ${deviceInfo.model || 'Device'}</div>
                    ${deviceInfo.coilType ? `<div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;"><i class="fas fa-cog"></i> Coil Type: ${deviceInfo.coilType}</div>` : ''}
                </div>
            </div>
            ${deviceInfo.compatiblePods && deviceInfo.compatiblePods.length > 0 ? `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(139, 92, 246, 0.3);">
                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Compatible Pod/Coil Types:</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${deviceInfo.compatiblePods.map(pod => `
                            <span style="background: rgba(139, 92, 246, 0.2); color: #8b5cf6; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${pod}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    ` : '';

    if (products.length === 0) {
        resultsDiv.innerHTML = `
            ${deviceCard}
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                <i class="fas fa-box-open" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i>
                <h3 style="margin: 0 0 8px 0; color: var(--text-secondary);">No Products in Stock</h3>
                <p style="margin: 0; font-size: 14px;">We don't currently have compatible pods for this device in inventory.</p>
            </div>
        `;
        return;
    }

    resultsDiv.innerHTML = `
        ${deviceCard}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h4 style="margin: 0; color: var(--text-primary);"><i class="fas fa-box" style="color: #10b981; margin-right: 8px;"></i>In Stock (${products.length})</h4>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto;">
            ${products.map(product => {
                const qty = product.inventoryQuantity || product.stock || product.quantity || 0;
                const qtyColor = qty < 5 ? '#ef4444' : qty < 15 ? '#f59e0b' : '#10b981';
                const store = product.store || 'VSU';

                return `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color);">
                        <div style="width: 50px; height: 50px; background: var(--bg-tertiary); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-cube" style="color: var(--text-muted); font-size: 20px;"></i>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 600; font-size: 14px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${product.productName || product.title || product.name}</div>
                            <div style="font-size: 12px; color: var(--text-muted); display: flex; gap: 12px; margin-top: 4px;">
                                <span><i class="fas fa-store"></i> ${store}</span>
                                ${product.sku ? `<span><i class="fas fa-barcode"></i> ${product.sku}</span>` : ''}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 18px; font-weight: 700; color: ${qtyColor};">${qty}</div>
                            <div style="font-size: 11px; color: var(--text-muted);">in stock</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Make functions globally available
window.renderPodMatcher = renderPodMatcher;
window.handlePodMatcherDragOver = handlePodMatcherDragOver;
window.handlePodMatcherDragLeave = handlePodMatcherDragLeave;
window.handlePodMatcherDrop = handlePodMatcherDrop;
window.handlePodMatcherFileSelect = handlePodMatcherFileSelect;
window.openPodMatcherCamera = openPodMatcherCamera;
window.loadPodMatcherImage = loadPodMatcherImage;
window.clearPodMatcherImage = clearPodMatcherImage;
window.analyzePodMatcherImage = analyzePodMatcherImage;

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

