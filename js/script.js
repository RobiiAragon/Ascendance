        // Activity types - defined early to avoid "before initialization" errors
        const ACTIVITY_TYPES = {
            LOGIN: 'login',
            LOGOUT: 'logout',
            CLOCK_IN: 'clock_in',
            CLOCK_OUT: 'clock_out',
            CREATE: 'create',
            UPDATE: 'update',
            DELETE: 'delete',
            VIEW: 'view',
            EXPORT: 'export',
            SCHEDULE: 'schedule',
            ANNOUNCEMENT: 'announcement',
            INVOICE: 'invoice',
            INVENTORY: 'inventory',
            RESTOCK: 'restock',
            TRANSFER: 'transfer'
        };

        // Page/View System
        const pages = {
            dashboard: document.getElementById('page-dashboard'),
            employees: null,
            training: null,
            licenses: null,
            analytics: null,
            newstuff: null,
            restock: null,
            abundancecloud: null,
            stores: null,
            announcements: null,
            tasks: null,
            schedule: null,
            settings: null,
            help: null,
            thieves: null,
            invoices: null,
            issues: null,
            gsuite: null,
            vendors: null,
            clockin: null,
            dailysales: null,
            cashout: null,
            change: null,
            projectanalytics: null,
            hrapplications: null
        };

        // Current state
        let currentPage = 'dashboard';
        let thieves = []; // Thieves database - initialized early to avoid "before initialization" errors
        let employees = [
            { id: 1, name: 'Marcus Rodriguez', initials: 'MR', role: 'Store Manager', store: 'Miramar', status: 'active', email: 'marcus@vsu.com', phone: '(619) 555-0101', emergencyContact: 'Maria Rodriguez - (619) 555-0102', allergies: 'None', hireDate: '2023-01-15', color: 'a' },
            { id: 2, name: 'Lauren Barrantes', initials: 'LB', role: 'Admin', store: 'Miramar', status: 'active', email: 'lauren@vsu.com', phone: '(619) 555-0103', emergencyContact: 'Emergency Contact - (619) 555-0104', allergies: 'None', hireDate: '2023-03-20', color: 'b' },
            { id: 3, name: 'James Thompson', initials: 'JT', role: 'Shift Lead', store: 'Kearny Mesa', status: 'active', email: 'james@vsu.com', phone: '(619) 555-0105', emergencyContact: 'Lisa Thompson - (619) 555-0106', allergies: 'None', hireDate: '2023-02-10', color: 'c' },
            { id: 4, name: 'Amanda Lopez', initials: 'AL', role: 'Sales Associate', store: 'Chula Vista', status: 'inactive', email: 'amanda@vsu.com', phone: '(619) 555-0107', emergencyContact: 'Carlos Lopez - (619) 555-0108', allergies: 'Shellfish', hireDate: '2023-05-01', color: 'd' },
            { id: 5, name: 'David Nguyen', initials: 'DN', role: 'Inventory Specialist', store: 'Miramar', status: 'active', email: 'david@vsu.com', phone: '(619) 555-0109', emergencyContact: 'Linh Nguyen - (619) 555-0110', allergies: 'None', hireDate: '2023-04-15', color: 'e' }
        ];

        let trainings = [
            { id: 1, title: 'Product Knowledge 101', type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '45 min', completion: 92, required: true },
            { id: 2, title: 'Customer Service Excellence', type: 'video', url: 'https://vimeo.com/148751763', duration: '30 min', completion: 78, required: true },
            { id: 3, title: 'Safety & Compliance', type: 'document', url: '#', duration: '20 min', completion: 85, required: true },
            { id: 4, title: 'POS System Training', type: 'video', url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', duration: '60 min', completion: 64, required: true }
        ];

        // Training view mode state
        let trainingViewMode = 'grid'; // 'grid' or 'list'

        // Employee view mode state
        let employeeViewMode = localStorage.getItem('employeeViewMode') || 'grid'; // 'grid' or 'list'

        let licenses = [
            { id: 1, name: 'Business License', store: 'Miramar', expires: '2025-12-31', status: 'valid', file: 'business_license_miramar.pdf' },
            { id: 2, name: 'Tobacco License', store: 'Morena', expires: '2026-01-15', status: 'expiring', file: 'tobacco_license_morena.pdf' },
            { id: 3, name: 'Health Permit', store: 'Kearny Mesa', expires: '2026-03-20', status: 'valid', file: 'health_permit_kearny.pdf' },
            { id: 4, name: 'Fire Safety Certificate', store: 'Chula Vista', expires: '2026-02-10', status: 'expiring', file: 'fire_safety_chula.pdf' },
            { id: 5, name: 'Business License', store: 'Morena', expires: '2025-11-30', status: 'valid', file: 'business_license_morena.pdf' },
            { id: 6, name: 'Business License', store: 'Kearny Mesa', expires: '2026-06-15', status: 'valid', file: 'business_license_kearny.pdf' }
        ];

        let announcements = [
            { id: 1, date: '2025-12-02', title: 'Holiday Schedule', content: 'Holiday schedule updates have been posted. Please check your shifts for the upcoming weeks.', author: 'VSU Admin' },
            { id: 2, date: '2025-11-28', title: 'New Product Line', content: 'New product line arriving next week - mandatory training session on Thursday.', author: 'VSU Admin' },
            { id: 3, date: '2025-11-25', title: 'Q4 Achievement', content: 'Congratulations to VSU Miramar for hitting Q4 sales targets! 🎉', author: 'VSU Admin' }
        ];
        // Expose announcements globally for likes/comments functionality
        window.announcements = announcements;

        // Track which announcements the current user has read
        let readAnnouncementIds = [];

        /**
         * Show a confirmation modal dialog
         * @param {Object} options - Configuration options
         * @param {string} options.title - Modal title
         * @param {string} options.message - Confirmation message
         * @param {string} options.confirmText - Text for confirm button (default: 'Delete')
         * @param {string} options.cancelText - Text for cancel button (default: 'Cancel')
         * @param {string} options.type - Type of modal: 'danger', 'warning', 'info' (default: 'danger')
         * @param {Function} options.onConfirm - Callback function when confirmed
         * @param {Function} options.onCancel - Callback function when cancelled (optional)
         */
        function showConfirmModal(options) {
            const {
                title = 'Confirm Action',
                message = 'Are you sure you want to proceed?',
                confirmText = 'Delete',
                cancelText = 'Cancel',
                type = 'danger',
                onConfirm,
                onCancel
            } = options;

            // Define colors based on type
            const typeColors = {
                danger: { bg: '#ef4444', icon: 'fa-trash-alt' },
                warning: { bg: '#f59e0b', icon: 'fa-exclamation-triangle' },
                info: { bg: '#3b82f6', icon: 'fa-info-circle' }
            };
            const colors = typeColors[type] || typeColors.danger;

            // Create modal HTML
            const modalHtml = `
                <div id="confirm-modal-overlay" style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.2s ease;
                ">
                    <div id="confirm-modal-content" style="
                        background: var(--bg-primary);
                        border-radius: 16px;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                        max-width: 420px;
                        width: 90%;
                        overflow: hidden;
                        animation: slideUp 0.3s ease;
                    ">
                        <div style="
                            background: ${colors.bg};
                            padding: 24px;
                            text-align: center;
                        ">
                            <div style="
                                width: 64px;
                                height: 64px;
                                background: rgba(255,255,255,0.2);
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                margin: 0 auto 16px;
                            ">
                                <i class="fas ${colors.icon}" style="font-size: 28px; color: white;"></i>
                            </div>
                            <h3 style="color: white; margin: 0; font-size: 20px; font-weight: 600;">${title}</h3>
                        </div>
                        <div style="padding: 24px;">
                            <p style="
                                color: var(--text-secondary);
                                text-align: center;
                                margin: 0 0 24px 0;
                                font-size: 15px;
                                line-height: 1.6;
                            ">${message}</p>
                            <div style="display: flex; gap: 12px;">
                                <button id="confirm-modal-cancel" style="
                                    flex: 1;
                                    padding: 12px 20px;
                                    border: 1px solid var(--border-color);
                                    background: var(--bg-secondary);
                                    color: var(--text-primary);
                                    border-radius: 8px;
                                    font-size: 14px;
                                    font-weight: 500;
                                    cursor: pointer;
                                    transition: all 0.2s;
                                    font-family: Outfit, sans-serif;
                                ">${cancelText}</button>
                                <button id="confirm-modal-confirm" style="
                                    flex: 1;
                                    padding: 12px 20px;
                                    border: none;
                                    background: ${colors.bg};
                                    color: white;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    font-weight: 500;
                                    cursor: pointer;
                                    transition: all 0.2s;
                                    font-family: Outfit, sans-serif;
                                ">${confirmText}</button>
                            </div>
                        </div>
                    </div>
                </div>
                <style>
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideUp {
                        from { transform: translateY(20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    #confirm-modal-cancel:hover {
                        background: var(--bg-tertiary) !important;
                    }
                    #confirm-modal-confirm:hover {
                        filter: brightness(1.1);
                    }
                </style>
            `;

            // Remove any existing confirm modal
            const existingModal = document.getElementById('confirm-modal-overlay');
            if (existingModal) existingModal.remove();

            // Add modal to body
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Get references
            const overlay = document.getElementById('confirm-modal-overlay');
            const cancelBtn = document.getElementById('confirm-modal-cancel');
            const confirmBtn = document.getElementById('confirm-modal-confirm');

            // Close modal function
            const closeConfirmModal = () => {
                overlay.style.animation = 'fadeIn 0.2s ease reverse';
                setTimeout(() => overlay.remove(), 150);
            };

            // Event listeners
            cancelBtn.addEventListener('click', () => {
                closeConfirmModal();
                if (onCancel) onCancel();
            });

            confirmBtn.addEventListener('click', () => {
                closeConfirmModal();
                if (onConfirm) onConfirm();
            });

            // Close on overlay click
            overlay.addEventListener('mousedown', (e) => {
                if (e.target === overlay) {
                    closeConfirmModal();
                    if (onCancel) onCancel();
                }
            });

            // Close on Escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    closeConfirmModal();
                    if (onCancel) onCancel();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        }

        /**
         * Upload image to Firebase Storage (sin límite de tamaño)
         * @param {string} base64String - The base64 encoded image string
         * @param {string} storagePath - Path in Firebase Storage (e.g., 'treasury/item1.jpg')
         * @returns {Promise<string>} - Download URL from Firebase Storage
         */
        async function uploadImageToFirebaseStorage(base64String, storagePath) {
            try {
                if (!firebase || !firebase.storage) {
                    throw new Error('Firebase Storage not initialized');
                }

                // Convert base64 to Blob
                const arr = base64String.split(',');
                const mime = arr[0].match(/:(.*?);/)[1];
                const bstr = atob(arr[1]);
                const n = bstr.length;
                const u8arr = new Uint8Array(n);
                for (let i = 0; i < n; i++) {
                    u8arr[i] = bstr.charCodeAt(i);
                }
                const blob = new Blob([u8arr], { type: mime });

                // Upload to Firebase Storage
                const storage = firebase.storage();
                const fileRef = storage.ref(storagePath);
                const snapshot = await fileRef.put(blob);
                const downloadUrl = await snapshot.ref.getDownloadURL();

                return downloadUrl;
            } catch (error) {
                console.error('Error uploading image to Firebase Storage:', error);
                throw error;
            }
        }

        /**
         * Compress image to ensure it's under the specified max size
         * Uses canvas to resize and reduce quality
         * @param {string} base64String - The base64 encoded image string
         * @param {number} maxSizeKB - Maximum size in KB (default 700KB to be safe under Firestore 1MB limit)
         * @param {number} maxWidth - Maximum width in pixels (default 1200)
         * @param {number} maxHeight - Maximum height in pixels (default 1200)
         * @returns {Promise<string>} - Compressed base64 image string
         */
        async function compressImage(base64String, maxSizeKB = 700, maxWidth = 1200, maxHeight = 1200) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = function() {
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions while maintaining aspect ratio
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Start with high quality and reduce until under max size
                    let quality = 0.9;
                    let result = canvas.toDataURL('image/jpeg', quality);

                    // Iteratively reduce quality until under max size
                    while (result.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) { // 1.37 accounts for base64 overhead
                        quality -= 0.1;
                        result = canvas.toDataURL('image/jpeg', quality);
                    }

                    // If still too large, reduce dimensions further
                    if (result.length > maxSizeKB * 1024 * 1.37) {
                        const scaleFactor = 0.7;
                        canvas.width = Math.round(width * scaleFactor);
                        canvas.height = Math.round(height * scaleFactor);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        result = canvas.toDataURL('image/jpeg', 0.7);
                    }

                    console.log(`Image compressed: ${Math.round(base64String.length / 1024)}KB -> ${Math.round(result.length / 1024)}KB`);
                    resolve(result);
                };

                img.onerror = function() {
                    reject(new Error('Failed to load image for compression'));
                };

                img.src = base64String;
            });
        }

        /**
         * Generate optimized thumbnail for fast loading in grids/lists
         * @param {string} base64String - The base64 encoded image string
         * @param {number} maxSize - Maximum width/height in pixels (default 300)
         * @param {number} quality - JPEG quality 0-1 (default 0.7)
         * @returns {Promise<string>} - Thumbnail base64 image string
         */
        async function generateThumbnail(base64String, maxSize = 300, quality = 0.7) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = function() {
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions maintaining aspect ratio
                    if (width > height) {
                        if (width > maxSize) {
                            height = Math.round(height * (maxSize / width));
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = Math.round(width * (maxSize / height));
                            height = maxSize;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    // Use better image smoothing for thumbnails
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);

                    const result = canvas.toDataURL('image/jpeg', quality);
                    console.log(`📸 Thumbnail generated: ${width}x${height}, ${Math.round(result.length / 1024)}KB`);
                    resolve(result);
                };

                img.onerror = function() {
                    reject(new Error('Failed to load image for thumbnail generation'));
                };

                img.src = base64String;
            });
        }

        /**
         * Initialize Firebase and load announcements from Firestore
         */
        async function initializeFirebaseAnnouncements() {

            const initialized = await firebaseAnnouncementsManager.initialize();

            if (initialized) {
                try {
                    const firestoreAnnouncements = await firebaseAnnouncementsManager.loadAnnouncements();

                    if (firestoreAnnouncements && firestoreAnnouncements.length > 0) {
                        announcements = firestoreAnnouncements;
                        window.announcements = announcements;
                    } else {
                        console.log('No announcements in Firestore, using fallback data and migrating...');
                        // Migrate fallback data to Firebase
                        for (const announcement of announcements) {
                            await firebaseAnnouncementsManager.addAnnouncement({
                                date: announcement.date,
                                title: announcement.title,
                                content: announcement.content,
                                author: announcement.author,
                                targetStores: 'all'
                            });
                        }
                        // Reload from Firestore to get IDs
                        const migratedAnnouncements = await firebaseAnnouncementsManager.loadAnnouncements();
                        if (migratedAnnouncements && migratedAnnouncements.length > 0) {
                            announcements = migratedAnnouncements;
                            window.announcements = announcements;
                        }
                        console.log('Migrated fallback announcements to Firestore');
                    }

                    // Load read announcements for current user
                    await loadReadAnnouncementsForUser();
                } catch (error) {
                    console.error('Error loading announcements from Firestore:', error);
                }
            } else {
                console.warn('Firebase not initialized, using fallback announcement data');
            }

            // Update badges after loading announcements
            updateAnnouncementsBadge();
            populateAnnouncementsDropdown();
        }

        /**
         * Load read announcements for the current user from Firebase
         */
        async function loadReadAnnouncementsForUser() {
            const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
            const userId = user?.userId || user?.id || user?.email;

            if (!userId) {
                console.warn('No user logged in, cannot load read announcements');
                return;
            }

            try {
                if (firebaseAnnouncementsManager.isInitialized) {
                    readAnnouncementIds = await firebaseAnnouncementsManager.getReadAnnouncements(userId);
                }
            } catch (error) {
                console.error('Error loading read announcements:', error);
            }
        }
        window.initializeFirebaseAnnouncements = initializeFirebaseAnnouncements;

        // Update announcement badge counts in sidebar and header (only unread)
        function updateAnnouncementsBadge() {
            // Count only unread announcements
            const unreadCount = announcements.filter(ann => {
                const annId = ann.firestoreId || ann.id;
                return !readAnnouncementIds.includes(annId) && !readAnnouncementIds.includes(String(annId));
            }).length;

            // Update sidebar badge
            const sidebarBadge = document.getElementById('announcements-badge');
            if (sidebarBadge) {
                sidebarBadge.textContent = unreadCount;
                sidebarBadge.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
            }

            // Update header bell badge
            const headerBadge = document.getElementById('header-announcements-badge');
            if (headerBadge) {
                headerBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                headerBadge.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
            }
        }

        // Populate the announcements dropdown in the header
        function populateAnnouncementsDropdown() {
            const dropdownList = document.getElementById('announcements-dropdown-list');
            if (!dropdownList) return;

            if (announcements.length === 0) {
                dropdownList.innerHTML = `
                    <div style="padding: 24px; text-align: center; color: var(--text-muted);">
                        <i class="fas fa-bell-slash" style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;"></i>
                        <p style="margin: 0;">No announcements</p>
                    </div>
                `;
                return;
            }

            // Show latest 5 announcements
            const recentAnnouncements = announcements.slice(0, 5);

            dropdownList.innerHTML = recentAnnouncements.map(ann => `
                <div class="announcement-dropdown-item" style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="navigateTo('announcements'); closeAnnouncementsDropdown();">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
                        <span style="font-weight: 600; font-size: 13px; color: var(--text-primary);">${ann.title}</span>
                        <span style="font-size: 11px; color: var(--text-muted); white-space: nowrap; margin-left: 8px;">${formatDate(ann.date)}</span>
                    </div>
                    <p style="margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                        ${ann.content}
                    </p>
                </div>
            `).join('');
        }

        // Toggle announcements dropdown visibility
        async function toggleAnnouncementsDropdown() {
            const dropdown = document.getElementById('announcements-dropdown');
            if (dropdown) {
                const isOpening = !dropdown.classList.contains('active');
                dropdown.classList.toggle('active');

                // Mark all announcements as read when opening the dropdown
                if (isOpening) {
                    await markAllAnnouncementsAsRead();
                }
            }
        }

        // Mark all announcements as read for the current user
        async function markAllAnnouncementsAsRead() {
            const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
            const userId = user?.userId || user?.id || user?.email;

            if (!userId) {
                console.warn('No user logged in, cannot mark announcements as read');
                return;
            }

            // Get all announcement IDs
            const allAnnouncementIds = announcements.map(ann => String(ann.firestoreId || ann.id));

            // Filter out already read ones
            const newlyReadIds = allAnnouncementIds.filter(id =>
                !readAnnouncementIds.includes(id) && !readAnnouncementIds.includes(String(id))
            );

            if (newlyReadIds.length === 0) {
                return; // Nothing new to mark as read
            }

            try {
                if (firebaseAnnouncementsManager.isInitialized) {
                    await firebaseAnnouncementsManager.markAnnouncementsAsRead(userId, newlyReadIds);
                }

                // Update local state
                readAnnouncementIds = [...new Set([...readAnnouncementIds, ...newlyReadIds])];

                // Update badge to reflect read status
                updateAnnouncementsBadge();
            } catch (error) {
                console.error('Error marking announcements as read:', error);
            }
        }

        // Close announcements dropdown
        function closeAnnouncementsDropdown() {
            const dropdown = document.getElementById('announcements-dropdown');
            if (dropdown) {
                dropdown.classList.remove('active');
            }
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            const dropdown = document.getElementById('announcements-dropdown');
            const btn = document.querySelector('.header-notification-btn');
            if (dropdown && btn && !dropdown.contains(event.target) && !btn.contains(event.target)) {
                dropdown.classList.remove('active');
            }
        });

        // Mobile touch support for announcements button
        document.addEventListener('DOMContentLoaded', function() {
            const notificationBtn = document.querySelector('.header-notification-btn');
            if (notificationBtn) {
                // Add touchend event for mobile
                notificationBtn.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleAnnouncementsDropdown();
                }, { passive: false });
            }

            // Close dropdown on touch outside (mobile)
            document.addEventListener('touchend', function(event) {
                const dropdown = document.getElementById('announcements-dropdown');
                const btn = document.querySelector('.header-notification-btn');
                if (dropdown && dropdown.classList.contains('active')) {
                    if (!dropdown.contains(event.target) && !btn.contains(event.target)) {
                        dropdown.classList.remove('active');
                    }
                }
            });
        });

        async function initializeFirebaseRestockRequests() {

            const initialized = await firebaseRestockRequestsManager.initialize();

            if (initialized) {
                try {
                    const firestoreRequests = await firebaseRestockRequestsManager.loadRestockRequests();

                    if (firestoreRequests && firestoreRequests.length > 0) {
                        restockRequests = firestoreRequests;
                    } else {
                        console.log('No restock requests in Firestore, using fallback data and migrating...');
                        // Migrate fallback data to Firebase
                        for (const request of restockRequests) {
                            await firebaseRestockRequestsManager.addRestockRequest({
                                productName: request.productName,
                                quantity: request.quantity,
                                store: request.store,
                                requestedBy: request.requestedBy,
                                requestDate: request.requestDate,
                                status: request.status,
                                priority: request.priority,
                                notes: request.notes
                            });
                        }
                        // Reload from Firestore to get IDs
                        const migratedRequests = await firebaseRestockRequestsManager.loadRestockRequests();
                        if (migratedRequests && migratedRequests.length > 0) {
                            restockRequests = migratedRequests;
                        }
                        console.log('Migrated fallback restock requests to Firestore');
                    }
                } catch (error) {
                    console.error('Error loading restock requests from Firestore:', error);
                }
            } else {
                console.warn('Firebase not initialized, using fallback restock requests data');
            }
        }
        window.initializeFirebaseRestockRequests = initializeFirebaseRestockRequests;

        async function initializeFirebaseChangeRecords() {

            const initialized = await firebaseChangeRecordsManager.initialize();

            if (initialized) {
                try {
                    const firestoreRecords = await firebaseChangeRecordsManager.loadChangeRecords();

                    if (firestoreRecords && firestoreRecords.length > 0) {
                        changeRecords = firestoreRecords;
                    } else {
                        console.log('No change records in Firestore, using fallback data and migrating...');
                        // Migrate fallback data to Firebase
                        for (const record of changeRecords) {
                            await firebaseChangeRecordsManager.addChangeRecord({
                                store: record.store,
                                amount: record.amount,
                                date: record.date,
                                leftBy: record.leftBy,
                                receivedBy: record.receivedBy,
                                notes: record.notes,
                                photo: record.photo || null
                            });
                        }
                        // Reload from Firestore to get IDs
                        const migratedRecords = await firebaseChangeRecordsManager.loadChangeRecords();
                        if (migratedRecords && migratedRecords.length > 0) {
                            changeRecords = migratedRecords;
                        }
                        console.log('Migrated fallback change records to Firestore');
                    }
                } catch (error) {
                    console.error('Error loading change records from Firestore:', error);
                }
            } else {
                console.warn('Firebase not initialized, using fallback change records data');
            }
        }
        window.initializeFirebaseChangeRecords = initializeFirebaseChangeRecords;

        async function initializeFirebaseCashOut() {

            const initialized = await firebaseCashOutManager.initialize();

            if (initialized) {
                try {
                    const firestoreRecords = await firebaseCashOutManager.loadCashOutRecords();

                    if (firestoreRecords && firestoreRecords.length > 0) {
                        cashOutRecords = firestoreRecords;
                    } else {
                        console.log('No cash out records in Firestore, using fallback data and migrating...');
                        // Migrate fallback data to Firebase
                        for (const record of cashOutRecords) {
                            await firebaseCashOutManager.addCashOutRecord({
                                name: record.name,
                                amount: record.amount,
                                reason: record.reason,
                                createdDate: record.createdDate,
                                createdBy: record.createdBy,
                                store: record.store || '',
                                status: record.status || 'open',
                                closedDate: record.closedDate || null,
                                receiptPhoto: record.receiptPhoto || null,
                                amountSpent: record.amountSpent || null,
                                moneyLeft: record.moneyLeft || null,
                                hasMoneyLeft: record.hasMoneyLeft || null
                            });
                        }
                        // Reload from Firestore to get IDs
                        const migratedRecords = await firebaseCashOutManager.loadCashOutRecords();
                        if (migratedRecords && migratedRecords.length > 0) {
                            cashOutRecords = migratedRecords;
                        }
                        console.log('Migrated fallback cash out records to Firestore');
                    }
                } catch (error) {
                    console.error('Error loading cash out records from Firestore:', error);
                }
            } else {
                console.warn('Firebase not initialized, using fallback cash out records data');
            }
        }
        window.initializeFirebaseCashOut = initializeFirebaseCashOut;

        let products = [
            { id: 1, name: 'JUUL Starter Kit', category: 'Vape Devices', quantity: 24, arrivalDate: '2025-12-10', store: 'Miramar', status: 'pending', supplier: 'JUUL Labs', price: 34.99, image: 'https://images.unsplash.com/photo-1560913210-fd4c0e4c3f75?w=400&h=300&fit=crop' },
            { id: 3, name: 'Elf Bar BC5000 - Mixed Flavors', category: 'Disposables', quantity: 120, arrivalDate: '2025-12-15', store: 'Kearny Mesa', status: 'pending', supplier: 'Elf Bar', price: 15.99, image: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&h=300&fit=crop' },
            { id: 4, name: 'Marlboro Red Box', category: 'Cigarettes', quantity: 200, arrivalDate: '2025-12-12', store: 'Chula Vista', status: 'pending', supplier: 'Philip Morris', price: 8.99, image: 'https://images.unsplash.com/photo-1571941736487-969c8e1d8e9f?w=400&h=300&fit=crop' },
            { id: 5, name: 'Puff Bar Plus', category: 'Disposables', quantity: 80, arrivalDate: '2025-12-07', store: 'Miramar', status: 'arrived', supplier: 'Puff Bar', price: 13.99, image: 'https://images.unsplash.com/photo-1606235727737-4c2b7a0ecab7?w=400&h=300&fit=crop' },
            { id: 6, name: 'SMOK Nord 4 Kit', category: 'Vape Devices', quantity: 15, arrivalDate: '2025-12-20', store: 'Morena', status: 'pending', supplier: 'SMOK', price: 42.99, image: 'https://images.unsplash.com/photo-1559813114-caa66ac94942?w=400&h=300&fit=crop' }
        ];

        let inventory = [
            { id: 1, brand: 'JUUL', productName: 'JUUL Starter Kit', flavor: 'Virginia Tobacco', volume: '0.7ml', nicotine: '5%', unitPrice: 34.99, minStock: 10, stock: 5, store: 'Miramar' },
            { id: 3, brand: 'Elf Bar', productName: 'BC5000', flavor: 'Blue Razz Ice', volume: '13ml', nicotine: '50mg', unitPrice: 15.99, minStock: 50, stock: 45, store: 'Kearny Mesa' },
            { id: 4, brand: 'Marlboro', productName: 'Red Box', flavor: 'Original', volume: 'N/A', nicotine: 'Full', unitPrice: 8.99, minStock: 100, stock: 80, store: 'Chula Vista' },
            { id: 5, brand: 'Puff Bar', productName: 'Puff Plus', flavor: 'Mango', volume: '3.2ml', nicotine: '50mg', unitPrice: 13.99, minStock: 30, stock: 12, store: 'Miramar' },
            { id: 6, brand: 'SMOK', productName: 'Nord 4 Kit', flavor: 'N/A', volume: 'N/A', nicotine: 'N/A', unitPrice: 42.99, minStock: 15, stock: 8, store: 'Morena' },
            { id: 7, brand: 'Newport', productName: 'Menthol', flavor: 'Menthol', volume: 'N/A', nicotine: 'Full', unitPrice: 9.49, minStock: 100, stock: 120, store: 'Miramar' },
            { id: 8, brand: 'Hyde', productName: 'Edge Rave', flavor: 'Strawberry Kiwi', volume: '10ml', nicotine: '50mg', unitPrice: 14.99, minStock: 40, stock: 25, store: 'Kearny Mesa' },
            { id: 9, brand: 'RELX', productName: 'Infinity', flavor: 'Classic Tobacco', volume: '1.9ml', nicotine: '3%', unitPrice: 39.99, minStock: 12, stock: 3, store: 'Chula Vista' },
            { id: 10, brand: 'Camel', productName: 'Blue', flavor: 'Light', volume: 'N/A', nicotine: 'Light', unitPrice: 8.49, minStock: 80, stock: 95, store: 'Morena' },
            { id: 11, brand: 'Lost Mary', productName: 'OS5000', flavor: 'Watermelon Ice', volume: '13ml', nicotine: '50mg', unitPrice: 16.99, minStock: 35, stock: 42, store: 'Miramar' },
            { id: 12, brand: 'Geek Bar', productName: 'Pulse', flavor: 'Fcuking Fab', volume: '16ml', nicotine: '50mg', unitPrice: 18.99, minStock: 25, stock: 18, store: 'Kearny Mesa' },
            { id: 13, brand: 'JUUL', productName: 'JUUL Starter Kit', flavor: 'Virginia Tobacco', volume: '0.7ml', nicotine: '5%', unitPrice: 34.99, minStock: 10, stock: 8, store: 'Morena' },
            { id: 14, brand: 'Elf Bar', productName: 'BC5000', flavor: 'Blue Razz Ice', volume: '13ml', nicotine: '50mg', unitPrice: 15.99, minStock: 50, stock: 52, store: 'Miramar' },
            { id: 15, brand: 'Marlboro', productName: 'Red Box', flavor: 'Original', volume: 'N/A', nicotine: 'Full', unitPrice: 8.99, minStock: 100, stock: 105, store: 'Miramar' },
            { id: 16, brand: 'VUSE', productName: 'Alto Pods', flavor: 'Menthol', volume: '1.8ml', nicotine: '5%', unitPrice: 12.99, minStock: 20, stock: 22, store: 'Chula Vista' }
        ];

        let restockRequests = [
            { id: 1, productName: 'JUUL Starter Kit', quantity: 20, store: 'Miramar', requestedBy: 'Marcus Rodriguez', requestDate: '2025-12-03', status: 'pending', priority: 'high', notes: 'Running low, high demand' },
            { id: 2, productName: 'Puff Bar Plus', quantity: 30, store: 'Morena', requestedBy: 'Lauren Barrantes', requestDate: '2025-12-02', status: 'approved', priority: 'medium', notes: 'Restock for weekend rush' },
            { id: 3, productName: 'RELX Infinity', quantity: 15, store: 'Kearny Mesa', requestedBy: 'James Thompson', requestDate: '2025-12-01', status: 'pending', priority: 'high', notes: 'Stock critically low' }
        ];

        // Treasury - Select Pieces Collection
        let treasuryItems = [
            {
                id: 1,
                artworkName: 'Vintage Tobacco Advertisement',
                artist: 'Unknown',
                acquisitionDate: '2024-03-15',
                value: 2500.00,
                location: 'VSU Kearny Mesa',
                photos: [],
                description: 'Original 1940s tobacco advertisement poster in excellent condition'
            },
            {
                id: 2,
                artworkName: 'Neon Sign Collection',
                artist: 'Custom Neon Works',
                acquisitionDate: '2023-11-20',
                value: 4800.00,
                location: 'VSU Miramar',
                photos: [],
                description: 'Set of three vintage neon signs from the 1960s'
            }
        ];

        // Cash Out Records
        let currentCashOutStoreFilter = 'all';
        let cashOutViewState = {
            viewType: 'month',
            expenseAnalysisExpanded: false,
            displayMode: 'list' // 'list' or 'grid'
        };
        let cashOutCharts = {};
        let cashOutRecords = [
            {
                id: 1,
                name: 'Office Supplies',
                amount: 150.00,
                reason: 'Printer paper and ink cartridges',
                createdDate: '2025-12-08',
                createdBy: 'VSU Admin',
                status: 'open',
                closedDate: null,
                receiptPhoto: null,
                amountSpent: null,
                moneyLeft: null,
                hasMoneyLeft: null
            },
            {
                id: 2,
                name: 'Store Maintenance',
                amount: 300.00,
                reason: 'Cleaning supplies and minor repairs',
                createdDate: '2025-12-05',
                createdBy: 'Marcus Rodriguez',
                status: 'closed',
                closedDate: '2025-12-06',
                receiptPhoto: null,
                amountSpent: 285.50,
                moneyLeft: 14.50,
                hasMoneyLeft: true
            },
            {
                id: 3,
                name: 'Team Lunch',
                amount: 200.00,
                reason: 'Employee appreciation lunch',
                createdDate: '2025-12-03',
                createdBy: 'Lauren Barrantes',
                status: 'closed',
                closedDate: '2025-12-03',
                receiptPhoto: null,
                amountSpent: 200.00,
                moneyLeft: 0.00,
                hasMoneyLeft: false
            }
        ];

        // Issues Database
        let issues = [
            {
                id: 1,
                customer: 'John Smith',
                phone: '5551234567',
                type: 'In Store',
                description: 'Customer received wrong product in their order',
                incidentDate: '2025-12-08',
                perception: 2,
                status: 'open',
                createdBy: 'Marcus Rodriguez',
                createdDate: '2025-12-08',
                solution: null,
                resolvedBy: null,
                resolutionDate: null
            },
            {
                id: 2,
                customer: 'Maria Garcia',
                phone: '5559876543',
                type: 'Online',
                description: 'Payment was charged twice for the same order',
                incidentDate: '2025-12-07',
                perception: 1,
                status: 'in_progress',
                createdBy: 'Lauren Barrantes',
                createdDate: '2025-12-07',
                solution: null,
                resolvedBy: null,
                resolutionDate: null
            },
            {
                id: 3,
                customer: 'Robert Johnson',
                phone: '5555551234',
                type: 'In Store',
                description: 'Product defective - vape device not working',
                incidentDate: '2025-12-05',
                perception: 4,
                status: 'resolved',
                createdBy: 'James Thompson',
                createdDate: '2025-12-05',
                solution: 'Replaced device with new unit and tested before customer left',
                resolvedBy: 'James Thompson',
                resolutionDate: '2025-12-05'
            }
        ];

        // Vendors Database
        let vendors = [
            {
                id: 1,
                name: 'VaporHub Distributors',
                category: 'Vape Products',
                contact: 'John Martinez',
                phone: '(800) 555-0101',
                email: 'sales@vaporhub.com',
                website: 'https://www.vaporhub.com',
                access: 'Online Portal - Account #VH12345',
                products: 'Disposable vapes, Pod systems, E-liquids, Accessories',
                orderMethods: 'Online portal, Phone orders, Email orders',
                notes: 'Net 30 payment terms, Free shipping over $500'
            },
            {
                id: 2,
                name: 'Premium Tobacco Supply',
                category: 'Tobacco Products',
                contact: 'Sarah Johnson',
                phone: '(800) 555-0202',
                email: 'orders@premiumtobacco.com',
                website: 'https://www.premiumtobacco.com',
                access: 'Account Manager: Sarah - Direct line (800) 555-0203',
                products: 'Cigarettes, Cigars, Rolling papers, Lighters',
                orderMethods: 'Phone orders (preferred), Email',
                notes: 'Minimum order $1000, Weekly deliveries on Thursdays'
            },
            {
                id: 3,
                name: 'Beverage Wholesale Direct',
                category: 'Beverages',
                contact: 'Mike Chen',
                phone: '(800) 555-0303',
                email: 'info@beveragewholesale.com',
                website: 'https://www.beveragewholesale.com',
                access: 'Online ordering system - Username: VSU_Admin',
                products: 'Energy drinks, Sodas, Water, Sports drinks, Coffee',
                orderMethods: 'Online portal (24/7), Phone (business hours)',
                notes: 'Next day delivery available, Volume discounts'
            },
            {
                id: 4,
                name: 'Snack Solutions Inc',
                category: 'Snacks & Candy',
                contact: 'Lisa Rodriguez',
                phone: '(800) 555-0404',
                email: 'sales@snacksolutions.com',
                website: 'https://www.snacksolutions.com',
                access: 'Rep visits monthly, Online catalog access',
                products: 'Chips, Candy bars, Gum, Cookies, Nuts',
                orderMethods: 'Mobile app, Website, Sales rep',
                notes: 'Flexible payment terms, Returns accepted'
            },
            {
                id: 5,
                name: 'General Supplies Co',
                category: 'Store Supplies',
                contact: 'David Park',
                phone: '(800) 555-0505',
                email: 'support@generalsupplies.com',
                website: 'https://www.generalsupplies.com',
                access: 'Amazon Business account linked',
                products: 'Bags, Receipt paper, Cleaning supplies, Office supplies',
                orderMethods: 'Amazon Business, Direct website, Phone',
                notes: 'Prime shipping available, Bulk discounts'
            }
        ];

        // Change Records - Cambio dejado en Campos
        let changeRecords = [
            {
                id: 1,
                store: 'Miramar',
                amount: 500.00,
                date: '2025-12-10',
                leftBy: 'Marcus Rodriguez',
                receivedBy: 'Lauren Barrantes',
                notes: 'Left in drawer 1',
                photo: null
            },
            {
                id: 2,
                store: 'Morena',
                amount: 300.00,
                date: '2025-12-09',
                leftBy: 'James Thompson',
                receivedBy: 'Amanda Lopez',
                notes: 'Se metió extra por falta de cambio',
                photo: null
            },
            {
                id: 3,
                store: 'Kearny Mesa',
                amount: 400.00,
                date: '2025-12-08',
                leftBy: 'David Nguyen',
                receivedBy: 'Marcus Rodriguez',
                notes: '',
                photo: null
            }
        ];

        // Gifts Records - Control de Regalos en Especie
        let giftsCurrentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        let giftsRecords = [
            {
                id: 1,
                product: 'Vape Pen SMOK Nord 4',
                quantity: 1,
                value: 45.99,
                recipient: 'Juan Pérez',
                recipientType: 'customer',
                reason: 'Producto defectuoso - reemplazo por garantía',
                store: 'Miramar',
                date: '2025-12-10',
                notes: 'Cliente habitual, su vape dejó de funcionar después de 2 semanas',
                photo: null
            },
            {
                id: 2,
                product: 'E-Liquid 60ml Naked 100',
                quantity: 2,
                value: 39.98,
                recipient: 'María García',
                recipientType: 'customer',
                reason: 'Compensación por error en pedido',
                store: 'Morena',
                date: '2025-12-09',
                notes: 'Se le envió sabor equivocado, se le regaló el correcto + el erróneo',
                photo: null
            },
            {
                id: 3,
                product: 'Coils para Caliburn',
                quantity: 5,
                value: 24.95,
                recipient: 'Carlos López',
                recipientType: 'vendor',
                reason: 'Regalo a proveedor por colaboración',
                store: 'Kearny Mesa',
                date: '2025-12-08',
                notes: 'Proveedor nos ayudó con entrega urgente',
                photo: null
            }
        ];

        /**
         * Initialize Firebase and load employees from Firestore
         * This function is called when the page loads
         */
        async function initializeFirebaseEmployees() {
            
            // Initialize Firebase manager
            const initialized = await firebaseEmployeeManager.initialize();
            
            if (initialized) {
                try {
                    // Load employees from Firestore
                    const firestoreEmployees = await firebaseEmployeeManager.loadEmployees();
                    
                    if (firestoreEmployees && firestoreEmployees.length > 0) {                        
                        // Map Firestore data to the local employees array
                        // This maintains compatibility with existing code while loading from Firebase
                        employees = firestoreEmployees.map(emp => ({
                            id: emp.firestoreId || emp.id,
                            firestoreId: emp.firestoreId || emp.id,
                            name: emp.name || '',
                            authEmail: emp.authEmail || '',
                            phone: emp.phone || '',
                            store: emp.store || 'Miramar',
                            status: emp.status || 'active',
                            role: emp.role || window.EMPLOYEE_ROLES?.EMPLOYEE || 'employee', // Role from Firestore
                            employeeType: emp.employeeType || 'regular', // admin, manager, employee
                            hireDate: emp.hireDate || new Date().toISOString().split('T')[0],
                            emergencyContact: emp.emergencyContact || '',
                            allergies: emp.allergies || 'None',
                            initials: (emp.name || 'X').split(' ').map(n => n[0]).join(''),
                            color: emp.color || ['a', 'b', 'c', 'd', 'e'][Math.floor(Math.random() * 5)]
                        }));
                        
                        // Update employee count badge in sidebar
                        if (typeof updateEmployeeCountBadge === 'function') {
                            updateEmployeeCountBadge();
                        }
                        // Load PTO requests for badge
                        if (typeof loadPTORequests === 'function') {
                            loadPTORequests();
                        }
                        return true;
                    }
                } catch (error) {
                    console.error('Error loading employees from Firestore:', error);
                }
            } else {
                console.warn('Firebase not available. Using fallback data.');
            }

            return false;
        }
        window.initializeFirebaseEmployees = initializeFirebaseEmployees;

        /**
         * Save employee to Firebase
         */
        async function saveEmployeeToFirebase(employeeData) {
            if (!firebaseEmployeeManager.isInitialized) {
                console.warn('Firebase not initialized');
                return null;
            }

            try {
                if (employeeData.firestoreId) {
                    // Update existing
                    const success = await firebaseEmployeeManager.updateEmployee(
                        employeeData.firestoreId,
                        employeeData
                    );
                    return success ? employeeData.firestoreId : null;
                } else {
                    // Create new
                    const newId = await firebaseEmployeeManager.addEmployee(employeeData);
                    return newId;
                }
            } catch (error) {
                console.error('Error saving employee to Firebase:', error);
                return null;
            }
        }

        /**
         * Delete employee from Firebase
         */
        async function deleteEmployeeFromFirebase(firestoreId) {
            if (!firebaseEmployeeManager.isInitialized) {
                console.warn('Firebase not initialized');
                return false;
            }

            try {
                return await firebaseEmployeeManager.deleteEmployee(firestoreId);
            } catch (error) {
                console.error('Error deleting employee from Firebase:', error);
                return false;
            }
        }

        /**
         * Update employee role in Firebase
         */
        async function updateEmployeeRoleInFirebase(firestoreId, newRole) {
            if (!firebaseEmployeeManager.isInitialized) {
                console.warn('Firebase not initialized');
                return false;
            }

            try {
                return await firebaseEmployeeManager.updateEmployeeRole(firestoreId, newRole);
            } catch (error) {
                console.error('Error updating employee role in Firebase:', error);
                return false;
            }
        }

        // Navigation handler
        function navigateTo(page, addToHistory = true) {
            // Check if user has permission to access this page
            const user = getCurrentUser();
            const userRole = user.role || 'employee';
            const userPermissions = window.ROLE_PERMISSIONS[userRole] || window.ROLE_PERMISSIONS['employee'];
            const allowedPages = userPermissions.pages || [];

            // Special bypass for super admin pages (carlos@calidevs.com only)
            const superAdminPages = ['superadmin', 'devlog'];
            const userEmail = (user.email || user.authEmail || '').toLowerCase();
            const isSuperAdmin = userEmail === 'carlos@calidevs.com';

            // If page not in allowed list, check for super admin bypass
            if (!allowedPages.includes(page)) {
                // Allow super admin pages for carlos@calidevs.com
                if (superAdminPages.includes(page) && isSuperAdmin) {
                    console.log(`👑 Super Admin bypass for ${page}`);
                } else {
                    console.warn(`⚠️ Access denied: ${userPermissions.label} role cannot access ${page}`);
                    return;
                }
            }

            currentPage = page;

            // Log page view activity (non-blocking)
            if (typeof logActivity === 'function') {
                logActivity(ACTIVITY_TYPES.VIEW, {
                    message: `Viewed page: ${page}`,
                    page: page
                }, 'page', page).catch(err => console.warn('Failed to log page view:', err));
            }

            // Save current page to sessionStorage (persists on refresh, clears on tab close)
            sessionStorage.setItem('ascendance_current_page', page);

            // Update browser history for back/forward navigation
            if (addToHistory) {
                const url = new URL(window.location);
                url.searchParams.set('page', page);
                history.pushState({ page: page }, '', url);
            }
            
            // Update nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.page === page) {
                    item.classList.add('active');
                }
            });

            // Update page title
            const titles = {
                dashboard: 'Dashboard',
                employees: 'Employees',
                training: 'Training Center',
                licenses: 'Licenses & Documents',
                analytics: 'Sales Analytics',
                stores: 'Store Management',
                announcements: 'Announcements',
                tasks: 'Tasks & Checklists',
                schedule: 'Schedule',
                managerschedule: 'Manager View Schedule',
                settings: 'Settings',
                help: 'Help Center',
                thieves: 'Banned Customers',
                invoices: 'Invoices',
                issues: 'Customer Log',
                vendors: 'Vendors & Suppliers',
                clockin: 'Clock In/Out',
                dailysales: 'Daily Sales',
                cashout: 'Cash Removed',
                treasury: 'Heady Pieces',
                gconomics: 'Gconomics',
                gforce: 'G Force',
                abundancecloud: 'Loyal VSU',
                newstuff: 'New Stuff',
                change: 'Change Box',
                customercare: 'Comps',
                employeepurchases: 'Employee Purchases',
                incidentlog: 'Incident Log',
                passwords: 'Password Manager',
                projectanalytics: 'Project Analytics',
                thechamps: 'The Champs',
                restock: 'Product Requests',
                supplies: 'Supplies',
                dailychecklist: 'Daily Checklist',
                labels: 'Barcode Labels',
                celesteai: 'Celeste AI'
            };
            document.querySelector('.page-title').textContent = titles[page] || 'Dashboard';

            // Render page content
            renderPage(page);
        }

        // Expose navigateTo globally
        window.navigateTo = navigateTo;

        // Toggle nav category (collapsible menu sections)
        window.toggleNavCategory = function(categoryName) {
            const category = document.querySelector(`.nav-category[data-category="${categoryName}"]`);
            if (category) {
                category.classList.toggle('open');
                // Save state to localStorage
                const defaultOpen = '["team","inventory","finance","operations","security","system"]';
                const stored = localStorage.getItem('openNavCategories');
                const openCategories = (stored && stored !== '[]') ? JSON.parse(stored) : JSON.parse(defaultOpen);
                if (category.classList.contains('open')) {
                    if (!openCategories.includes(categoryName)) {
                        openCategories.push(categoryName);
                    }
                } else {
                    const index = openCategories.indexOf(categoryName);
                    if (index > -1) {
                        openCategories.splice(index, 1);
                    }
                }
                localStorage.setItem('openNavCategories', JSON.stringify(openCategories));
            }
        };

        // Restore nav category states from localStorage
        function restoreNavCategoryStates() {
            // Clear old localStorage value to fix initial state
            const stored = localStorage.getItem('openNavCategories');
            if (stored === '["team"]' || stored === '[]') {
                localStorage.removeItem('openNavCategories');
            }

            // All categories open by default - only close if user explicitly closed them
            const allCategories = ['team', 'inventory', 'finance', 'operations', 'security', 'system'];
            const openCategories = localStorage.getItem('openNavCategories')
                ? JSON.parse(localStorage.getItem('openNavCategories'))
                : allCategories;

            document.querySelectorAll('.nav-category').forEach(cat => {
                const categoryName = cat.dataset.category;
                if (openCategories.includes(categoryName)) {
                    cat.classList.add('open');
                } else {
                    cat.classList.remove('open');
                }
            });
        }

        // Call on load
        setTimeout(restoreNavCategoryStates, 50);

        // Handle browser back/forward buttons
        window.addEventListener('popstate', function(event) {
            if (event.state && event.state.page) {
                // Navigate to the page from history without adding a new history entry
                navigateTo(event.state.page, false);
            } else {
                // Fallback: check URL for page parameter
                const urlParams = new URLSearchParams(window.location.search);
                const page = urlParams.get('page') || 'dashboard';
                navigateTo(page, false);
            }
        });

        async function renderPage(page) {
            const dashboard = document.querySelector('.dashboard');

            // Stop clock in polling when navigating away from clockin page
            if (page !== 'clockin' && typeof stopClockInPolling === 'function') {
                stopClockInPolling();
            }

            // Cancel pending analytics requests when navigating away from analytics page
            if (page !== 'analytics' && typeof cancelAnalyticsRequest === 'function') {
                cancelAnalyticsRequest();
            }

            switch(page) {
                case 'dashboard':
                    renderDashboard();
                    break;
                case 'employees':
                    renderEmployees();
                    break;
                case 'training':
                    renderTraining();
                    break;
                case 'licenses':
                    renderLicenses();
                    break;
                case 'analytics':
                    if (typeof renderAnalyticsPage === 'function') { renderAnalyticsPage(); } else if (typeof renderAnalyticsWithData === 'function') { renderAnalyticsWithData(); } else { renderAnalytics(); }
                    break;
                case 'newstuff':
                    renderNewStuff();
                    break;
                case 'restock':
                    renderRestockRequests();
                    break;
                case 'supplies':
                    renderSupplies();
                    break;
                case 'dailychecklist':
                    renderDailyChecklist();
                    break;
                case 'abundancecloud':
                    renderAbundanceCloud();
                    break;
                case 'stores':
                    renderStores();
                    break;
                case 'announcements':
                    renderAnnouncements();
                    break;
                case 'schedule':
                    renderSchedule();
                    break;
                case 'managerschedule':
                    renderManagerSchedule();
                    break;
                case 'thieves':
                    renderThieves();
                    break;
                case 'invoices':
                    renderInvoices();
                    break;
                case 'issues':
                    await renderIssues();
                    break;
                case 'gconomics':
                    renderGconomics();
                    break;
                case 'vendors':
                    renderVendors();
                    break;
                case 'clockin':
                    renderClockIn();
                    break;
                case 'dailysales':
                    renderDailySales();
                    break;
                case 'cashout':
                    renderCashOut();
                    break;
                case 'treasury':
                    renderTreasury();
                    break;
                case 'change':
                    renderChange();
                    break;
                case 'customercare':
                    renderGifts();
                    break;
                case 'employeepurchases':
                    renderEmployeePurchases();
                    break;
                case 'gforce':
                    renderGForce();
                    break;
                case 'incidentlog':
                    renderIncidentLog();
                    break;
                case 'passwords':
                    await window.renderPasswordManager();
                    break;
                case 'projectanalytics':
                    window.renderProjectAnalytics();
                    break;
                case 'superadmin':
                    if (typeof window.renderSuperAdmin === 'function') {
                        await window.renderSuperAdmin();
                    }
                    break;
                case 'devlog':
                    if (typeof window.renderDevelopmentLog === 'function') {
                        await window.renderDevelopmentLog();
                    }
                    break;
                case 'labels':
                    renderLabels();
                    break;
                case 'celesteai':
                    renderCelesteAIPage();
                    break;
                case 'transfers':
                    if (typeof initializeTransfersModule === 'function') {
                        initializeTransfersModule();
                    } else {
                        console.error('Transfers module not loaded');
                        render404(page);
                    }
                    break;
                case 'hrapplications':
                    if (typeof initializeHRApplications === 'function') {
                        initializeHRApplications();
                    } else {
                        console.error('HR Applications module not loaded');
                        render404(page);
                    }
                    break;
                case 'leases':
                    renderLeases();
                    break;
                case 'glabs':
                    await renderGLabs();
                    break;
                case 'podmatcher':
                    renderPodMatcher();
                    break;
                case 'activitylog':
                    renderActivityLog();
                    break;
                case 'thechamps':
                    window.renderTheChamps();
                    break;
                case 'salesperformance':
                    renderSalesPerformance();
                    break;
                case 'timeoffrequests':
                    renderTimeOffRequests();
                    break;
                case 'shiftexchanges':
                    renderShiftExchangesPage();
                    break;
                default:
                    render404(page);
            }

            refreshFloatingAddButtons();
        }

        // Render 404 Page - Beautiful cosmic theme
        function render404(attemptedPage = '') {
            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <style>
                    .page-404 {
                        min-height: 70vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        overflow: hidden;
                    }

                    .page-404-bg {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: radial-gradient(ellipse at center, rgba(102,126,234,0.1) 0%, transparent 70%);
                        pointer-events: none;
                    }

                    .page-404-stars {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        overflow: hidden;
                        pointer-events: none;
                    }

                    .page-404-star {
                        position: absolute;
                        background: var(--accent-primary);
                        border-radius: 50%;
                        animation: twinkle404 var(--duration) ease-in-out infinite;
                    }

                    @keyframes twinkle404 {
                        0%, 100% { opacity: 0.2; transform: scale(1); }
                        50% { opacity: 0.8; transform: scale(1.3); }
                    }

                    .page-404-content {
                        position: relative;
                        z-index: 10;
                        text-align: center;
                        padding: 40px;
                        max-width: 500px;
                    }

                    .page-404-astronaut {
                        font-size: 80px;
                        margin-bottom: 24px;
                        animation: float404 4s ease-in-out infinite;
                        color: var(--accent-primary);
                        text-shadow: 0 0 40px rgba(168, 85, 247, 0.4);
                    }

                    @keyframes float404 {
                        0%, 100% { transform: translateY(0) rotate(-5deg); }
                        50% { transform: translateY(-15px) rotate(5deg); }
                    }

                    .page-404-code {
                        font-size: 120px;
                        font-weight: 800;
                        line-height: 1;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #a855f7 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        margin-bottom: 16px;
                        animation: glow404 3s ease-in-out infinite;
                    }

                    @keyframes glow404 {
                        0%, 100% { filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.3)); }
                        50% { filter: drop-shadow(0 0 25px rgba(168, 85, 247, 0.5)); }
                    }

                    .page-404-title {
                        font-size: 28px;
                        font-weight: 700;
                        color: var(--text-primary);
                        margin-bottom: 12px;
                    }

                    .page-404-subtitle {
                        font-size: 16px;
                        color: var(--text-muted);
                        margin-bottom: 8px;
                    }

                    .page-404-quote {
                        font-size: 18px;
                        font-weight: 600;
                        font-style: italic;
                        background: linear-gradient(135deg, #667eea, #a855f7);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        margin: 24px 0 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 12px;
                    }

                    .page-404-quote i {
                        -webkit-text-fill-color: #a855f7;
                        font-size: 14px;
                    }

                    .page-404-buttons {
                        display: flex;
                        gap: 16px;
                        justify-content: center;
                        flex-wrap: wrap;
                    }

                    .page-404-btn {
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                        padding: 14px 28px;
                        border-radius: 14px;
                        font-size: 15px;
                        font-weight: 600;
                        text-decoration: none;
                        transition: all 0.3s ease;
                        cursor: pointer;
                        border: none;
                    }

                    .page-404-btn-primary {
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        box-shadow: 0 6px 24px rgba(102, 126, 234, 0.4);
                    }

                    .page-404-btn-primary:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 10px 32px rgba(102, 126, 234, 0.5);
                    }

                    .page-404-btn-secondary {
                        background: var(--bg-secondary);
                        color: var(--text-primary);
                        border: 1px solid var(--border-color);
                    }

                    .page-404-btn-secondary:hover {
                        border-color: var(--accent-primary);
                        background: rgba(168, 85, 247, 0.1);
                        transform: translateY(-2px);
                    }

                    .page-404-attempted {
                        margin-top: 24px;
                        font-size: 12px;
                        color: var(--text-muted);
                        opacity: 0.6;
                    }

                    .page-404-attempted code {
                        background: var(--bg-secondary);
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-family: monospace;
                    }

                    .page-404-orbit {
                        position: absolute;
                        width: 350px;
                        height: 350px;
                        border: 1px solid rgba(168, 85, 247, 0.15);
                        border-radius: 50%;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        animation: orbit404 25s linear infinite;
                        pointer-events: none;
                    }

                    .page-404-orbit::before {
                        content: '';
                        position: absolute;
                        width: 10px;
                        height: 10px;
                        background: linear-gradient(135deg, #667eea, #a855f7);
                        border-radius: 50%;
                        top: 0;
                        left: 50%;
                        transform: translateX(-50%);
                        box-shadow: 0 0 15px rgba(168, 85, 247, 0.6);
                    }

                    @keyframes orbit404 {
                        from { transform: translate(-50%, -50%) rotate(0deg); }
                        to { transform: translate(-50%, -50%) rotate(360deg); }
                    }
                </style>

                <div class="page-404">
                    <div class="page-404-bg"></div>
                    <div class="page-404-stars" id="stars-404"></div>
                    <div class="page-404-orbit"></div>

                    <div class="page-404-content">
                        <div class="page-404-astronaut">
                            <i class="fas fa-user-astronaut"></i>
                        </div>

                        <div class="page-404-code">404</div>

                        <h1 class="page-404-title">Lost in Space</h1>
                        <p class="page-404-subtitle">This page has drifted into another dimension</p>

                        <p class="page-404-quote">
                            <i class="fas fa-star"></i>
                            "Exploring the unknown, never truly lost"
                            <i class="fas fa-star"></i>
                        </p>

                        <div class="page-404-buttons">
                            <button class="page-404-btn page-404-btn-primary" onclick="if(typeof toggleCelesteChat === 'function') toggleCelesteChat(); else navigateTo('dashboard');">
                                <i class="fas fa-stars"></i>
                                Ask Celeste AI
                            </button>
                            <button class="page-404-btn page-404-btn-secondary" onclick="navigateTo('dashboard')">
                                <i class="fas fa-rocket"></i>
                                Return to Base
                            </button>
                        </div>

                        ${attemptedPage ? `<p class="page-404-attempted">Attempted route: <code>${attemptedPage}</code></p>` : ''}
                    </div>
                </div>
            `;

            // Generate stars
            setTimeout(() => {
                const starsContainer = document.getElementById('stars-404');
                if (starsContainer) {
                    for (let i = 0; i < 50; i++) {
                        const star = document.createElement('div');
                        star.className = 'page-404-star';
                        star.style.left = Math.random() * 100 + '%';
                        star.style.top = Math.random() * 100 + '%';
                        star.style.width = Math.random() * 3 + 1 + 'px';
                        star.style.height = star.style.width;
                        star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
                        star.style.animationDelay = Math.random() * 3 + 's';
                        starsContainer.appendChild(star);
                    }
                }
            }, 100);
        }

        // G-Force inspirational quotes for dashboard banner
        const gforceDashboardQuotes = [
            { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "G-Force" },
            { quote: "The only way to do great work is to love what you do. Stay hungry, stay foolish.", author: "G-Force" },
            { quote: "Your limitation—it's only your imagination. Push beyond what you think is possible.", author: "G-Force" },
            { quote: "Dream bigger. Start smaller. Act now. The universe rewards action.", author: "G-Force" },
            { quote: "Every morning you have two choices: continue to sleep with your dreams, or wake up and chase them.", author: "G-Force" },
            { quote: "Don't watch the clock; do what it does. Keep going.", author: "G-Force" },
            { quote: "The difference between ordinary and extraordinary is that little extra.", author: "G-Force" },
            { quote: "Hustle in silence. Let your success make the noise.", author: "G-Force" },
            { quote: "Your energy introduces you before you even speak. Make it powerful.", author: "G-Force" },
            { quote: "Champions aren't made in gyms. Champions are made from something deep inside—a desire, a dream, a vision.", author: "G-Force" },
            { quote: "Be so good they can't ignore you. Excellence is the best revenge.", author: "G-Force" },
            { quote: "The grind includes days you don't feel like grinding. Show up anyway.", author: "G-Force" },
            { quote: "Small daily improvements over time lead to stunning results.", author: "G-Force" },
            { quote: "You don't have to be perfect to be amazing. Progress over perfection.", author: "G-Force" },
            { quote: "Invest in yourself. It pays the best interest.", author: "G-Force" },
            { quote: "What consumes your mind controls your life. Think abundance.", author: "G-Force" },
            { quote: "The comeback is always stronger than the setback.", author: "G-Force" },
            { quote: "Discipline is choosing between what you want now and what you want most.", author: "G-Force" },
            { quote: "You are the CEO of your life. Hire, fire, and promote accordingly.", author: "G-Force" },
            { quote: "Stop doubting yourself. Work hard and make it happen.", author: "G-Force" },
            { quote: "Your only limit is you. Break the chains of self-doubt.", author: "G-Force" },
            { quote: "Build your empire. Brick by brick, day by day.", author: "G-Force" },
            { quote: "Stay focused, go after your dreams, and keep moving toward your goals.", author: "G-Force" },
            { quote: "Success doesn't come to you. You go to it. Run.", author: "G-Force" },
            { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "G-Force" },
            { quote: "Be fearless in the pursuit of what sets your soul on fire.", author: "G-Force" },
            { quote: "Winners are not people who never fail, but people who never quit.", author: "G-Force" },
            { quote: "Turn your wounds into wisdom. Your struggles into strength.", author: "G-Force" },
            { quote: "Create the life you can't wait to wake up to.", author: "G-Force" },
            { quote: "The harder you work for something, the greater you'll feel when you achieve it.", author: "G-Force" },
            { quote: "Don't be afraid to give up the good to go for the great.", author: "G-Force" }
        ];

        // Get daily quote based on day of year (changes each day)
        function getDailyGForceQuote() {
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 0);
            const diff = now - start;
            const oneDay = 1000 * 60 * 60 * 24;
            const dayOfYear = Math.floor(diff / oneDay);
            return gforceDashboardQuotes[dayOfYear % gforceDashboardQuotes.length];
        }

        // Get random quote - uses OpenAI to generate fresh quotes
        let currentQuoteIndex = -1;
        let isGeneratingQuote = false;

        window.refreshGForceQuote = async function() {
            if (isGeneratingQuote) return;

            const quoteText = document.querySelector('.gforce-quote-banner p[style*="italic"]');
            const authorText = document.querySelector('.gforce-quote-banner p[style*="color: #10b981"]');
            const refreshBtn = document.querySelector('.gforce-quote-banner button');

            if (!quoteText || !authorText) return;

            // Show loading state
            isGeneratingQuote = true;
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: white; font-size: 14px;"></i>';
            }
            quoteText.style.transition = 'opacity 0.3s';
            quoteText.style.opacity = '0.5';

            try {
                // Try to generate with AI
                const apiKey = typeof getOpenAIKey === 'function' ? getOpenAIKey() : localStorage.getItem('openai_api_key');

                if (apiKey) {
                    const response = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: 'gpt-4o',
                            max_tokens: 150,
                            messages: [{
                                role: 'user',
                                content: `Generate ONE unique, powerful motivational quote for business owners and employees. The quote should be about success, hustle, growth mindset, discipline, or entrepreneurship. Make it punchy and memorable (1-2 sentences max). Do NOT use famous quotes - create an original one. Return ONLY the quote text, no quotation marks, no attribution.`
                            }]
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const newQuote = data.choices?.[0]?.message?.content?.trim();

                        if (newQuote && newQuote.length > 10) {
                            // Success - show AI generated quote
                            quoteText.style.opacity = '0';
                            setTimeout(() => {
                                quoteText.innerHTML = `"${newQuote}"`;
                                authorText.innerHTML = `— G-Force <i class="fas fa-bolt" style="margin-left: 4px; font-size: 10px;"></i> <span style="font-size: 9px; opacity: 0.6; margin-left: 4px;">✨ Fresh</span>`;
                                quoteText.style.opacity = '1';
                            }, 300);

                            isGeneratingQuote = false;
                            if (refreshBtn) {
                                refreshBtn.innerHTML = '<i class="fas fa-sync-alt" style="color: white; font-size: 14px;"></i>';
                            }
                            return;
                        }
                    }
                }
            } catch (error) {
                console.log('AI quote generation failed, using local quotes:', error);
            }

            // Fallback to local quotes if AI fails
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * gforceDashboardQuotes.length);
            } while (newIndex === currentQuoteIndex && gforceDashboardQuotes.length > 1);
            currentQuoteIndex = newIndex;

            const quote = gforceDashboardQuotes[newIndex];
            quoteText.style.opacity = '0';

            setTimeout(() => {
                quoteText.innerHTML = `"${quote.quote}"`;
                authorText.innerHTML = `— ${quote.author} <i class="fas fa-bolt" style="margin-left: 4px; font-size: 10px;"></i>`;
                quoteText.style.opacity = '1';
            }, 300);

            isGeneratingQuote = false;
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt" style="color: white; font-size: 14px;"></i>';
            }
        };

        function renderDashboard() {
            const dashboard = document.querySelector('.dashboard');
            const dailyQuote = getDailyGForceQuote();

            dashboard.innerHTML = `
                <!-- G-Force Daily Inspiration -->
                <div class="gforce-quote-banner" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); border-radius: 16px; padding: 24px 32px; margin-bottom: 24px; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                    <!-- Decorative elements -->
                    <div style="position: absolute; top: -20px; right: -20px; width: 120px; height: 120px; background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%); border-radius: 50%;"></div>
                    <div style="position: absolute; bottom: -30px; left: 20%; width: 80px; height: 80px; background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%); border-radius: 50%;"></div>

                    <div style="display: flex; align-items: center; gap: 20px; position: relative; z-index: 1;">
                        <!-- G-Force Avatar -->
                        <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #6366f1); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4); flex-shrink: 0;">
                            <span style="font-size: 24px; font-weight: 800; color: white;">G</span>
                        </div>

                        <!-- Quote Content -->
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #8b5cf6;">Daily Inspiration</span>
                                <span style="font-size: 10px; color: rgba(255,255,255,0.4);">•</span>
                                <span style="font-size: 10px; color: rgba(255,255,255,0.4);">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                            </div>
                            <p style="font-size: 16px; font-weight: 500; color: white; line-height: 1.6; margin: 0; font-style: italic;">
                                "${dailyQuote.quote}"
                            </p>
                            <p style="font-size: 12px; color: #10b981; margin: 8px 0 0 0; font-weight: 600;">
                                — ${dailyQuote.author} <i class="fas fa-bolt" style="margin-left: 4px; font-size: 10px;"></i>
                            </p>
                        </div>

                        <!-- Refresh button (shows new random quote) -->
                        <button onclick="refreshGForceQuote()" style="background: rgba(255,255,255,0.1); border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; flex-shrink: 0;" title="Get another quote" onmouseover="this.style.background='rgba(139, 92, 246, 0.3)'; this.style.transform='rotate(180deg)';" onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.transform='rotate(0deg)';">
                            <i class="fas fa-sync-alt" style="color: white; font-size: 14px;"></i>
                        </button>
                    </div>
                </div>

                <!-- Stats -->
                <div class="stats-grid">
                    <div class="stat-card" style="cursor: pointer;" onclick="navigateTo('employees')">
                        <div class="stat-header">
                            <div class="stat-icon purple"><i class="fas fa-users"></i></div>
                            <div class="stat-trend up"><i class="fas fa-arrow-up"></i> +2</div>
                        </div>
                        <div class="stat-value">${employees.length}</div>
                        <div class="stat-label">Total Employees</div>
                    </div>
                    <div class="stat-card" style="cursor: pointer;" onclick="navigateTo('licenses')">
                        <div class="stat-header">
                            <div class="stat-icon blue"><i class="fas fa-file-alt"></i></div>
                            <div class="stat-trend down"><i class="fas fa-exclamation"></i> 2 expiring</div>
                        </div>
                        <div class="stat-value">${licenses.length}</div>
                        <div class="stat-label">Active Licenses</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <a href="#" class="quick-action" onclick="navigateTo('employees'); setTimeout(() => openModal('add-employee'), 100); return false;">
                        <div class="quick-action-icon"><i class="fas fa-user-plus"></i></div>
                        <span class="quick-action-label">Add Employee</span>
                    </a>
                    <a href="#" class="quick-action" onclick="navigateTo('training'); setTimeout(() => openModal('add-training'), 100); return false;">
                        <div class="quick-action-icon"><i class="fas fa-video"></i></div>
                        <span class="quick-action-label">Upload Training</span>
                    </a>
                    <a href="#" class="quick-action" onclick="navigateTo('licenses'); setTimeout(() => openModal('add-license'), 100); return false;">
                        <div class="quick-action-icon"><i class="fas fa-file-upload"></i></div>
                        <span class="quick-action-label">Add License</span>
                    </a>
                    <a href="#" class="quick-action" onclick="navigateTo('analytics'); return false;">
                        <div class="quick-action-icon"><i class="fas fa-chart-bar"></i></div>
                        <span class="quick-action-label">View Reports</span>
                    </a>
                </div>

                <!-- Cards Grid -->
                <div class="cards-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-users"></i> Recent Employees</h3>
                            <button class="card-action" onclick="navigateTo('employees')">View All</button>
                        </div>
                        <div class="card-body">
                            <div class="employee-list">
                                ${employees.slice(0, 5).map(emp => `
                                    <div class="employee-item" onclick="viewEmployee('${emp.id}')">
                                        <div class="employee-avatar ${emp.color}">${emp.initials}</div>
                                        <div class="employee-info">
                                            <div class="employee-name">${emp.name}</div>
                                            <div class="employee-role">${emp.role}</div>
                                        </div>
                                        <span class="employee-store">${emp.store}</span>
                                        <div class="employee-status ${emp.status}"></div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    
                </div>

                <!-- Bottom Grid -->
                <div class="bottom-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-trophy"></i> Store Performance</h3>
                            <button class="card-action" onclick="navigateTo('analytics')">Details</button>
                        </div>
                        <div class="card-body">
                            <div class="store-performance" id="store-performance-container">
                                <div style="text-align: center; padding: 40px 20px;">
                                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: var(--accent-primary);"></i>
                                    <p style="color: var(--text-muted); margin-top: 12px; font-size: 13px;">Loading store data...</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-file-certificate"></i> Licenses Status</h3>
                            <button class="card-action" onclick="navigateTo('licenses')">Upload</button>
                        </div>
                        <div class="card-body">
                            <div class="licenses-grid">
                                ${licenses.slice(0, 4).map(lic => `
                                    <div class="license-card">
                                        <div class="license-icon ${lic.status}">
                                            <i class="fas fa-${lic.status === 'valid' ? 'check-circle' : 'clock'}"></i>
                                        </div>
                                        <div class="license-info">
                                            <div class="license-name">${lic.name} - ${lic.store}</div>
                                            <div class="license-meta">Expires: ${formatDate(lic.expires)}</div>
                                        </div>
                                        <span class="license-status ${lic.status}">${lic.status.charAt(0).toUpperCase() + lic.status.slice(1)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-bullhorn"></i> Recent Announcements</h3>
                            <button class="card-action" onclick="navigateTo('announcements')">Post New</button>
                        </div>
                        <div class="card-body">
                            <div class="announcement-list">
                                ${announcements.map(ann => `
                                    <div class="announcement-item">
                                        <div class="announcement-date">${formatDate(ann.date)}</div>
                                        <div class="announcement-text">${ann.content}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- New Dashboard Modules -->
                <div class="bottom-grid" style="margin-top: 24px;">
                    <!-- Employees Working Now -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-user-clock"></i> Working Now</h3>
                            <button class="card-action" onclick="navigateTo('clockin')">View All</button>
                        </div>
                        <div class="card-body">
                            <div id="working-now-container">
                                <div style="text-align: center; padding: 30px 20px;">
                                    <i class="fas fa-spinner fa-spin" style="font-size: 20px; color: var(--accent-primary);"></i>
                                    <p style="color: var(--text-muted); margin-top: 8px; font-size: 12px;">Loading...</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Pending Tasks -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-tasks"></i> Pending Tasks</h3>
                            <button class="card-action" onclick="navigateTo('tasks')">View All</button>
                        </div>
                        <div class="card-body">
                            <div id="pending-tasks-container">
                                <div style="text-align: center; padding: 30px 20px;">
                                    <i class="fas fa-spinner fa-spin" style="font-size: 20px; color: var(--accent-primary);"></i>
                                    <p style="color: var(--text-muted); margin-top: 8px; font-size: 12px;">Loading...</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sales Goal -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-bullseye"></i> Weekly Sales Goal</h3>
                            <button class="card-action" onclick="navigateTo('analytics')">Details</button>
                        </div>
                        <div class="card-body">
                            <div id="sales-goal-container">
                                <div style="text-align: center; padding: 30px 20px;">
                                    <i class="fas fa-spinner fa-spin" style="font-size: 20px; color: var(--accent-primary);"></i>
                                    <p style="color: var(--text-muted); margin-top: 8px; font-size: 12px;">Loading...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Third Row -->
                <div class="bottom-grid" style="margin-top: 24px;">
                    <!-- Low Stock Alerts -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-exclamation-triangle"></i> Low Stock</h3>
                            <button class="card-action" onclick="navigateTo('restock')">Restock</button>
                        </div>
                        <div class="card-body" style="padding-top: 8px;">
                            <!-- Store tabs -->
                            <div style="display: flex; gap: 4px; margin-bottom: 8px;">
                                <button onclick="setLowStockStore('vsu')" id="low-stock-store-vsu" style="padding: 4px 10px; font-size: 11px; border-radius: 5px; border: none; background: var(--accent-primary); color: white; cursor: pointer;">VSU</button>
                                <button onclick="setLowStockStore('loyalvaper')" id="low-stock-store-loyalvaper" style="padding: 4px 10px; font-size: 11px; border-radius: 5px; border: none; background: var(--bg-secondary); color: var(--text-secondary); cursor: pointer;">Loyal Vaper</button>
                            </div>
                            <!-- Level tabs -->
                            <div style="display: flex; gap: 4px; margin-bottom: 10px;">
                                <button onclick="setLowStockTab('all')" id="low-stock-tab-all" style="padding: 4px 10px; font-size: 11px; border-radius: 5px; border: none; background: var(--accent-primary); color: white; cursor: pointer;">All</button>
                                <button onclick="setLowStockTab('critical')" id="low-stock-tab-critical" style="padding: 4px 10px; font-size: 11px; border-radius: 5px; border: none; background: var(--bg-secondary); color: var(--text-secondary); cursor: pointer;">Critical</button>
                                <button onclick="setLowStockTab('low')" id="low-stock-tab-low" style="padding: 4px 10px; font-size: 11px; border-radius: 5px; border: none; background: var(--bg-secondary); color: var(--text-secondary); cursor: pointer;">Low</button>
                            </div>
                            <div id="low-stock-container" style="max-height: 160px; overflow-y: auto;">
                                <div style="text-align: center; padding: 30px 20px;">
                                    <i class="fas fa-spinner fa-spin" style="font-size: 20px; color: var(--accent-primary);"></i>
                                    <p style="color: var(--text-muted); margin-top: 8px; font-size: 12px;">Loading...</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="card" style="grid-column: span 2;">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-bell"></i> Recent Activity</h3>
                        </div>
                        <div class="card-body">
                            <div id="recent-activity-container">
                                <div style="text-align: center; padding: 30px 20px;">
                                    <i class="fas fa-spinner fa-spin" style="font-size: 20px; color: var(--accent-primary);"></i>
                                    <p style="color: var(--text-muted); margin-top: 8px; font-size: 12px;">Loading...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Load monthly revenue from Shopify API (async, updates the card when ready)
            loadMonthlyRevenueFromShopify();

            // Load store performance from Shopify API (async)
            loadStorePerformance();

            // Load new dashboard modules
            loadWorkingNow();
            loadPendingTasks();
            loadSalesGoal();
            loadLowStockAlerts();
            loadRecentActivity();
        }

        /**
         * Load monthly revenue from Shopify API and update the dashboard card
         * Uses the same API as shopify-analytics.js
         */
        async function loadMonthlyRevenueFromShopify() {
            const revenueValue = document.getElementById('revenue-value');
            const revenueTrend = document.getElementById('revenue-trend');

            if (!revenueValue || !revenueTrend) return;

            try {
                // Check if fetchSalesAnalytics is available (from shopify-analytics.js)
                if (typeof fetchSalesAnalytics === 'function') {
                    console.log('[Dashboard] Loading monthly revenue from Shopify...');

                    // Fetch monthly sales data for VSU (default store)
                    const salesData = await fetchSalesAnalytics('vsu', null, 'month');

                    if (salesData && salesData.summary) {
                        const totalSales = parseFloat(salesData.summary.totalSales);
                        const totalOrders = salesData.summary.totalOrders;

                        // Format the revenue value
                        let displayValue;
                        if (totalSales >= 1000000) {
                            displayValue = '$' + (totalSales / 1000000).toFixed(1) + 'M';
                        } else if (totalSales >= 1000) {
                            displayValue = '$' + (totalSales / 1000).toFixed(1) + 'K';
                        } else {
                            displayValue = '$' + totalSales.toFixed(0);
                        }

                        // Update the card
                        revenueValue.textContent = displayValue;
                        revenueTrend.innerHTML = `<i class="fas fa-shopping-cart"></i> ${totalOrders} orders`;
                        revenueTrend.className = 'stat-trend up';

                    }
                } else {
                    // Fallback: fetchSalesAnalytics not available
                    console.warn('[Dashboard] fetchSalesAnalytics not available, showing placeholder');
                    revenueValue.textContent = '$--';
                    revenueTrend.innerHTML = `<i class="fas fa-exclamation-circle"></i> API unavailable`;
                    revenueTrend.className = 'stat-trend';
                }
            } catch (error) {
                console.error('[Dashboard] Error loading monthly revenue:', error);
                revenueValue.textContent = '$--';
                revenueTrend.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error`;
                revenueTrend.className = 'stat-trend down';
            }
        }

        /**
         * Load store performance data from Shopify (weekly sales by store)
         */
        async function loadStorePerformance() {
            const container = document.getElementById('store-performance-container');
            if (!container) return;

            try {
                // Check if analytics fetch functions are available
                const fetchFn = typeof fetchSalesAnalyticsSmart === 'function'
                    ? fetchSalesAnalyticsSmart
                    : (typeof fetchSalesAnalyticsBulk === 'function'
                        ? fetchSalesAnalyticsBulk
                        : (typeof fetchSalesAnalytics === 'function' ? fetchSalesAnalytics : null));

                if (!fetchFn) {
                    console.warn('[Dashboard] No sales analytics function available');
                    container.innerHTML = renderStorePerformanceFallback();
                    return;
                }

                console.log('[Dashboard] Loading weekly store performance...');

                // Fetch weekly sales data for each store in parallel
                const storeKeys = ['vsu', 'miramarwine', 'loyalvaper'];
                const storeNames = {
                    'vsu': 'VSU (All Locations)',
                    'miramarwine': 'Miramar Wine & Liquor',
                    'loyalvaper': 'Loyal Vaper'
                };

                const results = await Promise.allSettled(
                    storeKeys.map(key => fetchFn(key, null, 'week'))
                );

                // Process results
                const storeData = [];
                results.forEach((result, index) => {
                    if (result.status === 'fulfilled' && result.value?.summary) {
                        storeData.push({
                            name: storeNames[storeKeys[index]],
                            sales: parseFloat(result.value.summary.totalSales || 0),
                            orders: parseInt(result.value.summary.totalOrders || 0)
                        });
                    }
                });

                // Sort by sales descending
                storeData.sort((a, b) => b.sales - a.sales);

                if (storeData.length > 0) {
                    container.innerHTML = storeData.map((store, index) => {
                        const rankClass = index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : 'fourth';
                        const formattedSales = store.sales >= 1000
                            ? '$' + (store.sales / 1000).toFixed(1) + 'K'
                            : '$' + store.sales.toFixed(0);
                        return `
                            <div class="store-item">
                                <div class="store-rank ${rankClass}">${index + 1}</div>
                                <div class="store-details">
                                    <div class="store-name">${store.name}</div>
                                    <div class="store-sales">${store.orders} orders this week</div>
                                </div>
                                <div class="store-amount">${formattedSales}</div>
                            </div>
                        `;
                    }).join('');
                } else {
                    container.innerHTML = renderStorePerformanceFallback();
                }

            } catch (error) {
                console.error('[Dashboard] Error loading store performance:', error);
                container.innerHTML = `
                    <div style="text-align: center; padding: 30px 20px; color: var(--text-muted);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 24px; color: #ef4444; margin-bottom: 8px;"></i>
                        <p style="font-size: 13px;">Could not load store data</p>
                    </div>
                `;
            }
        }

        function renderStorePerformanceFallback() {
            return `
                <div style="text-align: center; padding: 30px 20px; color: var(--text-muted);">
                    <i class="fas fa-store" style="font-size: 24px; margin-bottom: 8px;"></i>
                    <p style="font-size: 13px;">No sales data available</p>
                    <p style="font-size: 12px;">Check Analytics for details</p>
                </div>
            `;
        }

        /**
         * Load employees currently working (clocked in without clock out)
         */
        async function loadWorkingNow() {
            const container = document.getElementById('working-now-container');
            if (!container) return;

            try {
                // Get today's date
                const today = new Date().toISOString().split('T')[0];

                // Initialize firebase manager if needed
                if (typeof firebaseClockInManager !== 'undefined') {
                    if (!firebaseClockInManager.isInitialized) {
                        await firebaseClockInManager.initialize();
                    }

                    const records = await firebaseClockInManager.loadClockRecordsByDate(today);

                    // Filter employees who are clocked in but not clocked out
                    const workingNow = records.filter(r => r.clockIn && !r.clockOut);

                    if (workingNow.length > 0) {
                        container.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                                <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div>
                                <span style="font-size: 13px; color: var(--text-muted);">${workingNow.length} employee${workingNow.length !== 1 ? 's' : ''} working</span>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                ${workingNow.slice(0, 4).map(record => {
                                    const emp = employees.find(e => e.id === record.employeeId || e.firestoreId === record.employeeId);
                                    const initials = emp?.initials || record.employeeName?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
                                    const name = emp?.name || record.employeeName || 'Unknown';
                                    const store = record.store || emp?.store || '';
                                    return `
                                        <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--bg-primary); border-radius: 8px;">
                                            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 600;">${initials}</div>
                                            <div style="flex: 1; min-width: 0;">
                                                <div style="font-size: 13px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${name}</div>
                                                <div style="font-size: 11px; color: var(--text-muted);">${store} - Since ${record.clockIn}</div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                                ${workingNow.length > 4 ? `<div style="text-align: center; font-size: 12px; color: var(--text-muted);">+${workingNow.length - 4} more</div>` : ''}
                            </div>
                        `;
                    } else {
                        container.innerHTML = `
                            <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                                <i class="fas fa-moon" style="font-size: 24px; margin-bottom: 8px; opacity: 0.5;"></i>
                                <p style="font-size: 13px;">No one clocked in</p>
                            </div>
                        `;
                    }
                } else {
                    container.innerHTML = `
                        <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                            <i class="fas fa-user-clock" style="font-size: 24px; margin-bottom: 8px; opacity: 0.5;"></i>
                            <p style="font-size: 13px;">Clock-in not available</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('[Dashboard] Error loading working now:', error);
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                        <i class="fas fa-exclamation-circle" style="font-size: 20px; color: #ef4444;"></i>
                        <p style="font-size: 12px; margin-top: 8px;">Error loading data</p>
                    </div>
                `;
            }
        }

        /**
         * Load pending tasks summary
         */
        async function loadPendingTasks() {
            const container = document.getElementById('pending-tasks-container');
            if (!container) return;

            try {
                // Try to get tasks from Firebase or local
                let allTasks = [];

                if (typeof firebaseTaskManager !== 'undefined' && firebaseTaskManager.isInitialized) {
                    allTasks = await firebaseTaskManager.loadTasks();
                } else if (typeof tasks !== 'undefined') {
                    allTasks = tasks;
                }

                const pendingTasks = allTasks.filter(t => t.status === 'pending' || t.status === 'in-progress');

                if (pendingTasks.length > 0) {
                    const highPriority = pendingTasks.filter(t => t.priority === 'high').length;

                    container.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <span style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${pendingTasks.length}</span>
                            ${highPriority > 0 ? `<span style="background: #ef444420; color: #ef4444; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">${highPriority} High Priority</span>` : ''}
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            ${pendingTasks.slice(0, 3).map(task => `
                                <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: var(--bg-primary); border-radius: 6px;">
                                    <i class="fas fa-circle" style="font-size: 6px; color: ${task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981'};"></i>
                                    <span style="font-size: 12px; color: var(--text-primary); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${task.title || task.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    `;
                } else {
                    container.innerHTML = `
                        <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                            <i class="fas fa-check-circle" style="font-size: 24px; color: #10b981; margin-bottom: 8px;"></i>
                            <p style="font-size: 13px;">All tasks completed!</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('[Dashboard] Error loading tasks:', error);
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                        <i class="fas fa-tasks" style="font-size: 24px; margin-bottom: 8px; opacity: 0.5;"></i>
                        <p style="font-size: 13px;">No tasks found</p>
                    </div>
                `;
            }
        }

        /**
         * Load weekly sales goal progress
         */
        async function loadSalesGoal() {
            const container = document.getElementById('sales-goal-container');
            if (!container) return;

            try {
                // Weekly goal (configurable)
                const weeklyGoal = 50000; // $50,000 weekly goal

                if (typeof fetchSalesAnalyticsSmart === 'function' || typeof fetchSalesAnalyticsBulk === 'function' || typeof fetchSalesAnalytics === 'function') {
                    const fetchFn = typeof fetchSalesAnalyticsSmart === 'function' ? fetchSalesAnalyticsSmart : (typeof fetchSalesAnalyticsBulk === 'function' ? fetchSalesAnalyticsBulk : fetchSalesAnalytics);
                    const salesData = await fetchFn('vsu', null, 'week');

                    if (salesData?.summary) {
                        const currentSales = parseFloat(salesData.summary.totalSales || 0);
                        const percentage = Math.min(Math.round((currentSales / weeklyGoal) * 100), 100);
                        const remaining = Math.max(weeklyGoal - currentSales, 0);

                        container.innerHTML = `
                            <div style="text-align: center; margin-bottom: 16px;">
                                <div style="font-size: 32px; font-weight: 700; color: ${percentage >= 100 ? '#10b981' : 'var(--text-primary)'};">${percentage}%</div>
                                <div style="font-size: 12px; color: var(--text-muted);">of weekly goal</div>
                            </div>
                            <div style="background: var(--bg-primary); border-radius: 8px; height: 12px; overflow: hidden; margin-bottom: 12px;">
                                <div style="height: 100%; width: ${percentage}%; background: linear-gradient(90deg, var(--accent-primary), ${percentage >= 100 ? '#10b981' : 'var(--accent-secondary)'}); border-radius: 8px; transition: width 0.5s;"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 12px;">
                                <span style="color: var(--text-muted);">$${(currentSales/1000).toFixed(1)}K earned</span>
                                <span style="color: var(--text-muted);">$${(remaining/1000).toFixed(1)}K to go</span>
                            </div>
                        `;
                        return;
                    }
                }

                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                        <i class="fas fa-bullseye" style="font-size: 24px; margin-bottom: 8px; opacity: 0.5;"></i>
                        <p style="font-size: 13px;">Sales data unavailable</p>
                    </div>
                `;
            } catch (error) {
                console.error('[Dashboard] Error loading sales goal:', error);
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                        <i class="fas fa-bullseye" style="font-size: 24px; margin-bottom: 8px; opacity: 0.5;"></i>
                        <p style="font-size: 13px;">Could not load goal</p>
                    </div>
                `;
            }
        }

        /**
         * Load low stock alerts - With store tabs
         */
        window.lowStockData = {
            vsu: [],
            loyalvaper: [],
            currentTab: 'all',
            currentStore: 'vsu'
        };

        async function loadLowStockAlerts() {
            const container = document.getElementById('low-stock-container');
            if (!container) return;

            try {
                if (typeof fetchStoreInventory === 'function') {
                    // Load inventory from both stores
                    const [vsuInventory, loyalvaperInventory] = await Promise.all([
                        fetchStoreInventory('vsu', 50).catch(err => {
                            console.warn('[Dashboard] Error loading VSU inventory:', err);
                            return [];
                        }),
                        fetchStoreInventory('loyalvaper', 50).catch(err => {
                            console.warn('[Dashboard] Error loading Loyal Vaper inventory:', err);
                            return [];
                        })
                    ]);

                    // Filter low stock items (<10 units), sort by qty
                    const filterLowStock = (inventory) => {
                        return inventory.filter(item => {
                            const qty = item.inventoryQuantity || item.stock || item.quantity || 0;
                            return qty >= 0 && qty < 10;
                        }).sort((a, b) => (a.inventoryQuantity || a.stock || 0) - (b.inventoryQuantity || b.stock || 0));
                    };

                    window.lowStockData.vsu = filterLowStock(vsuInventory || []);
                    window.lowStockData.loyalvaper = filterLowStock(loyalvaperInventory || []);

                    renderLowStockItems();
                    return;
                }

                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                        <i class="fas fa-check-circle" style="font-size: 24px; color: #10b981; margin-bottom: 8px;"></i>
                        <p style="font-size: 13px;">Stock levels OK</p>
                    </div>
                `;
            } catch (error) {
                console.error('[Dashboard] Error loading low stock:', error);
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                        <i class="fas fa-box" style="font-size: 20px; margin-bottom: 8px; opacity: 0.5;"></i>
                        <p style="font-size: 12px;">Unavailable</p>
                    </div>
                `;
            }
        }

        // Set active store tab
        window.setLowStockStore = function(store) {
            window.lowStockData.currentStore = store;

            // Update store tab styles
            ['vsu', 'loyalvaper'].forEach(s => {
                const btn = document.getElementById(`low-stock-store-${s}`);
                if (btn) {
                    btn.style.background = (s === store) ? 'var(--accent-primary)' : 'var(--bg-secondary)';
                    btn.style.color = (s === store) ? 'white' : 'var(--text-secondary)';
                }
            });

            renderLowStockItems();
        };

        // Set active level tab
        window.setLowStockTab = function(tab) {
            window.lowStockData.currentTab = tab;

            // Update tab styles
            ['all', 'critical', 'low'].forEach(t => {
                const btn = document.getElementById(`low-stock-tab-${t}`);
                if (btn) {
                    btn.style.background = (t === tab) ? 'var(--accent-primary)' : 'var(--bg-secondary)';
                    btn.style.color = (t === tab) ? 'white' : 'var(--text-secondary)';
                }
            });

            renderLowStockItems();
        };

        // Render items
        function renderLowStockItems() {
            const container = document.getElementById('low-stock-container');
            if (!container) return;

            const { vsu, loyalvaper, currentTab, currentStore } = window.lowStockData;
            const storeData = currentStore === 'vsu' ? vsu : loyalvaper;

            // Filter by tab
            let filtered = storeData.filter(item => {
                const qty = item.inventoryQuantity || item.stock || item.quantity || 0;
                if (currentTab === 'critical') return qty < 3;
                if (currentTab === 'low') return qty >= 3 && qty < 6;
                return true;
            });

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 15px; color: var(--text-muted);">
                        <i class="fas fa-check-circle" style="font-size: 20px; color: #10b981;"></i>
                        <p style="font-size: 12px; margin-top: 6px;">No ${currentTab === 'all' ? 'low stock' : currentTab} items</p>
                    </div>
                `;
                return;
            }

            const storeName = currentStore === 'vsu' ? 'VSU' : 'Loyal Vaper';
            container.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    ${filtered.slice(0, 8).map(item => {
                        const qty = item.inventoryQuantity || item.stock || item.quantity || 0;
                        const color = qty < 3 ? '#ef4444' : qty < 6 ? '#f59e0b' : '#3b82f6';

                        return `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; background: var(--bg-primary); border-radius: 5px;">
                                <span style="font-size: 11px; color: var(--text-primary); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.productName || item.title || item.name}</span>
                                <span style="font-size: 10px; font-weight: 600; color: ${color}; margin-left: 8px;">${qty}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        /**
         * Load recent activity/notifications
         */
        async function loadRecentActivity() {
            const container = document.getElementById('recent-activity-container');
            if (!container) return;

            try {
                const activities = [];

                // Get recent announcements
                if (announcements && announcements.length > 0) {
                    announcements.slice(0, 2).forEach(ann => {
                        activities.push({
                            type: 'announcement',
                            icon: 'bullhorn',
                            color: '#8b5cf6',
                            title: ann.title || 'Announcement',
                            description: (ann.content || '').substring(0, 50) + (ann.content && ann.content.length > 50 ? '...' : ''),
                            time: ann.date || ''
                        });
                    });
                }

                // Get recent clock ins
                const today = new Date().toISOString().split('T')[0];
                if (typeof firebaseClockInManager !== 'undefined' && firebaseClockInManager.isInitialized) {
                    const clockRecords = await firebaseClockInManager.loadClockRecordsByDate(today);
                    clockRecords.slice(0, 2).forEach(record => {
                        const action = record.clockOut ? 'clocked out' : 'clocked in';
                        activities.push({
                            type: 'clockin',
                            icon: 'user-clock',
                            color: '#10b981',
                            title: record.employeeName || 'Employee',
                            description: `${action} at ${record.store || 'store'}`,
                            time: record.clockOut || record.clockIn
                        });
                    });
                }

                // Sort by time (most recent first)
                activities.sort((a, b) => new Date(b.time) - new Date(a.time));

                if (activities.length > 0) {
                    container.innerHTML = `
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            ${activities.slice(0, 5).map(activity => `
                                <div style="display: flex; align-items: flex-start; gap: 12px; padding: 10px; background: var(--bg-primary); border-radius: 8px;">
                                    <div style="width: 36px; height: 36px; background: ${activity.color}20; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <i class="fas fa-${activity.icon}" style="color: ${activity.color}; font-size: 14px;"></i>
                                    </div>
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="font-size: 13px; font-weight: 500; color: var(--text-primary);">${activity.title}</div>
                                        <div style="font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${activity.description}</div>
                                    </div>
                                    <div style="font-size: 11px; color: var(--text-muted); white-space: nowrap;">${activity.time}</div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                } else {
                    container.innerHTML = `
                        <div style="text-align: center; padding: 30px 20px; color: var(--text-muted);">
                            <i class="fas fa-bell-slash" style="font-size: 24px; margin-bottom: 8px; opacity: 0.5;"></i>
                            <p style="font-size: 13px;">No recent activity</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('[Dashboard] Error loading recent activity:', error);
                container.innerHTML = `
                    <div style="text-align: center; padding: 30px 20px; color: var(--text-muted);">
                        <i class="fas fa-bell" style="font-size: 24px; margin-bottom: 8px; opacity: 0.5;"></i>
                        <p style="font-size: 13px;">Activity unavailable</p>
                    </div>
                `;
            }
        }

        async function renderEmployees() {
            const dashboard = document.querySelector('.dashboard');

            // Show loading state first
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Employee Directory</h2>
                        <p class="section-subtitle">Manage your team across all stores</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-secondary" onclick="openInactiveEmployeesModal()" title="View Inactive Employees">
                            <i class="fas fa-user-slash"></i> Inactive
                        </button>
                        <button class="btn-primary floating-add-btn" onclick="openModal('add-employee')">
                            <i class="fas fa-plus"></i> Add Employee
                        </button>
                    </div>
                </div>

                <div class="filters-bar">
                    <div class="search-filter">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Search employees..." id="employee-search" onkeyup="filterEmployees()">
                    </div>
                    <select class="filter-select" id="store-filter" onchange="filterEmployees()">
                        <option value="">All Stores</option>
                        <option value="Miramar">VSU Miramar</option>
                        <option value="Morena">VSU Morena</option>
                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                        <option value="Chula Vista">VSU Chula Vista</option>
                        <option value="North Park">VSU North Park</option>
                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                    </select>
                    <select class="filter-select" id="status-filter" onchange="filterEmployees()" style="display: none;">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                    </select>
                    <div class="view-toggle" style="display: flex; gap: 4px; background: var(--bg-secondary); padding: 4px; border-radius: 8px;">
                        <button class="view-toggle-btn ${employeeViewMode === 'grid' ? 'active' : ''}" onclick="setEmployeeViewMode('grid')" title="Grid View" style="padding: 8px 12px; border: none; background: ${employeeViewMode === 'grid' ? 'var(--accent-primary)' : 'transparent'}; color: ${employeeViewMode === 'grid' ? 'white' : 'var(--text-muted)'}; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
                            <i class="fas fa-th-large"></i>
                        </button>
                        <button class="view-toggle-btn ${employeeViewMode === 'list' ? 'active' : ''}" onclick="setEmployeeViewMode('list')" title="List View" style="padding: 8px 12px; border: none; background: ${employeeViewMode === 'list' ? 'var(--accent-primary)' : 'transparent'}; color: ${employeeViewMode === 'list' ? 'white' : 'var(--text-muted)'}; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
                            <i class="fas fa-list"></i>
                        </button>
                    </div>
                    <button class="btn-secondary" onclick="refreshEmployeesFromFirebase()" title="Refresh from database">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>

                <div class="${employeeViewMode === 'list' ? 'employees-list' : 'employees-grid'}" id="employees-grid">
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading employees...</p>
                    </div>
                </div>
            `;

            // Load employees from Firebase
            await loadEmployeesFromFirebase();

            // Render employees grid
            const grid = document.getElementById('employees-grid');
            if (grid) {
                if (employees.length === 0) {
                    grid.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <h3>No employees yet</h3>
                            <p>Add your first employee to get started</p>
                            <button class="btn-primary" onclick="openModal('add-employee')">
                                <i class="fas fa-plus"></i> Add Employee
                            </button>
                        </div>
                    `;
                } else {
                    if (employeeViewMode === 'list') {
                        grid.className = 'employees-list';
                        grid.innerHTML = `
                            <style>
                                .emp-list-table {
                                    width: 100%;
                                    border-collapse: collapse;
                                }
                                .emp-list-table th {
                                    padding: 14px 12px;
                                    text-align: left;
                                    font-weight: 600;
                                    font-size: 11px;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                    color: var(--text-muted);
                                    background: var(--bg-secondary);
                                    border-bottom: 2px solid var(--border-color);
                                    white-space: nowrap;
                                }
                                .emp-list-table td {
                                    padding: 14px 12px;
                                    border-bottom: 1px solid var(--border-color);
                                    vertical-align: middle;
                                }
                                .emp-list-table tbody tr {
                                    transition: background 0.2s;
                                }
                                .emp-list-table tbody tr:hover {
                                    background: var(--bg-secondary);
                                }
                                .emp-info-cell {
                                    display: flex;
                                    align-items: center;
                                    gap: 10px;
                                    min-width: 180px;
                                }
                                .emp-info-cell .avatar {
                                    width: 40px;
                                    height: 40px;
                                    border-radius: 10px;
                                    flex-shrink: 0;
                                }
                                .emp-info-cell .details {
                                    min-width: 0;
                                    flex: 1;
                                }
                                .emp-info-cell .name {
                                    font-weight: 600;
                                    color: var(--text-primary);
                                    font-size: 14px;
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                }
                                .emp-info-cell .email {
                                    font-size: 11px;
                                    color: var(--text-muted);
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    max-width: 160px;
                                }
                                .emp-actions-cell {
                                    display: flex;
                                    gap: 6px;
                                    justify-content: flex-end;
                                }

                                /* Responsive Design */
                                @media (max-width: 1200px) {
                                    .emp-list-table th:nth-child(6),
                                    .emp-list-table td:nth-child(6) {
                                        display: none;
                                    }
                                    .emp-info-cell {
                                        min-width: 160px;
                                    }
                                }

                                @media (max-width: 1024px) {
                                    .emp-list-table th:nth-child(3),
                                    .emp-list-table td:nth-child(3) {
                                        display: none;
                                    }
                                    .emp-info-cell {
                                        min-width: 140px;
                                    }
                                    .emp-list-table th,
                                    .emp-list-table td {
                                        padding: 12px 10px;
                                    }
                                }

                                @media (max-width: 768px) {
                                    .emp-list-table th:nth-child(2),
                                    .emp-list-table td:nth-child(2) {
                                        display: none;
                                    }
                                    .emp-info-cell {
                                        min-width: 120px;
                                        gap: 8px;
                                    }
                                    .emp-info-cell .avatar {
                                        width: 36px;
                                        height: 36px;
                                    }
                                    .emp-info-cell .name {
                                        font-size: 13px;
                                    }
                                    .emp-info-cell .email {
                                        font-size: 10px;
                                        max-width: 120px;
                                    }
                                    .emp-list-table th,
                                    .emp-list-table td {
                                        padding: 10px 8px;
                                    }
                                }

                                @media (max-width: 640px) {
                                    .emp-list-table th,
                                    .emp-list-table td {
                                        padding: 8px 6px;
                                        font-size: 12px;
                                    }
                                    .emp-list-table th {
                                        font-size: 10px;
                                    }
                                    .emp-info-cell {
                                        min-width: 100px;
                                        gap: 6px;
                                    }
                                    .emp-info-cell .avatar {
                                        width: 32px;
                                        height: 32px;
                                    }
                                    .emp-info-cell .name {
                                        font-size: 12px;
                                    }
                                    .emp-actions-cell {
                                        gap: 4px;
                                    }
                                    .emp-actions-cell .btn-icon {
                                        padding: 6px;
                                        font-size: 12px;
                                    }
                                }
                            </style>
                            <div class="card" style="overflow-x: auto; border-radius: 16px;">
                                <table class="emp-list-table">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Role</th>
                                            <th>Store</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th>Phone</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${employees.filter(emp => emp.status !== 'inactive').map(emp => renderEmployeeListRow(emp)).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `;
                    } else {
                        grid.className = 'employees-grid';
                        grid.innerHTML = employees.filter(emp => emp.status !== 'inactive').map(emp => renderEmployeeCard(emp)).join('');
                    }
                }
            }
        }

        /**
         * Load employees from Firebase and update local array
         */
        async function loadEmployeesFromFirebase() {
            if (!firebaseEmployeeManager.isInitialized) {
                await firebaseEmployeeManager.initialize();
            }

            if (firebaseEmployeeManager.isInitialized) {
                try {
                    const firestoreEmployees = await firebaseEmployeeManager.loadEmployees();
                    if (firestoreEmployees && firestoreEmployees.length > 0) {
                        employees = firestoreEmployees.map(emp => ({
                            id: emp.firestoreId || emp.id,
                            firestoreId: emp.firestoreId || emp.id,
                            name: emp.name || '',
                            authEmail: emp.authEmail || '',
                            phone: emp.phone || '',
                            store: emp.store || 'Miramar',
                            status: emp.status || 'active',
                            role: emp.role || 'Sales Associate',
                            employeeType: emp.employeeType || 'employee',
                            hireDate: emp.hireDate || new Date().toISOString().split('T')[0],
                            emergencyContact: emp.emergencyContact || '',
                            allergies: emp.allergies || 'None',
                            initials: (emp.name || 'XX').split(' ').map(n => n[0] || '').join('').substring(0, 2).toUpperCase(),
                            color: emp.color || ['a', 'b', 'c', 'd', 'e'][Math.floor(Math.random() * 5)],
                            offboarding: emp.offboarding || null,
                            photo: emp.photo || null,
                            photoPath: emp.photoPath || null
                        }));
                        // Update employee count badge in sidebar
                        updateEmployeeCountBadge();
                    }

                } catch (error) {
                    console.error('Error loading employees from Firebase:', error);
                }
            }
        }

        /**
         * Update the employee count badge in the sidebar
         */
        function updateEmployeeCountBadge() {
            const badge = document.getElementById('employees-count-badge');
            if (badge) {
                badge.textContent = employees.length;
                badge.style.display = employees.length > 0 ? 'inline-flex' : 'none';
            }
        }

        /**
         * Refresh employees from Firebase (manual refresh button)
         */
        async function refreshEmployeesFromFirebase() {
            const grid = document.getElementById('employees-grid');
            if (grid) {
                grid.innerHTML = `
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Refreshing...</p>
                    </div>
                `;
            }

            await loadEmployeesFromFirebase();

            if (grid) {
                grid.innerHTML = employees.map(emp => renderEmployeeCard(emp)).join('');
            }
        }

        function renderEmployeeCard(emp) {
            // Get role badge color based on employeeType
            const getRoleColor = () => {
                const colors = {
                    'admin': '#ef4444',      // Red
                    'manager': '#f59e0b',    // Amber
                    'employee': '#3b82f6'    // Blue
                };
                return colors[emp.employeeType] || '#6b7280';
            };

            const getRoleIcon = () => {
                const icons = {
                    'admin': 'crown',
                    'manager': 'chart-bar',
                    'employee': 'user'
                };
                return icons[emp.employeeType] || 'user';
            };

            const getRoleLabel = () => {
                const labels = {
                    'admin': 'Administrator',
                    'manager': 'Manager',
                    'employee': 'Employee'
                };
                return labels[emp.employeeType] || 'Employee';
            };

            const empId = emp.firestoreId || emp.id;
            return `
                <div class="employee-card" onclick="viewEmployee('${empId}')">
                    <div class="employee-card-header">
                        ${emp.photo
                            ? `<div class="employee-avatar-lg" style="background-image: url('${emp.photo}'); background-size: cover; background-position: center;"></div>`
                            : `<div class="employee-avatar-lg ${emp.color}">${emp.initials}</div>`
                        }
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <div class="employee-status-badge ${emp.status}">${emp.status}</div>
                            <div class="badge" style="background: ${getRoleColor()}; color: white; font-size: 11px; padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px;">
                                <i class="fas fa-${getRoleIcon()}"></i>
                                ${getRoleLabel()}
                            </div>
                        </div>
                    </div>
                    <div class="employee-card-body">
                        <h3 class="employee-card-name">${emp.name}</h3>
                        <p class="employee-card-role">${emp.role}</p>
                        <div class="employee-card-store">
                            <i class="fas fa-store"></i> ${emp.store}
                        </div>
                        <div class="employee-card-meta">
                            <span><i class="fas fa-envelope"></i> ${emp.authEmail}</span>
                            <span><i class="fas fa-phone"></i> ${emp.phone}</span>
                        </div>
                    </div>
                    <div class="employee-card-footer">
                        <button class="btn-icon" onclick="event.stopPropagation(); viewEmployeePaperwork('${empId}')" title="View Documents"><i class="fas fa-file-pdf"></i></button>
                        ${emp.status === 'inactive' && emp.offboarding ? `
                            <button class="btn-icon" onclick="event.stopPropagation(); viewOffboardingDetails('${empId}')" title="View Offboarding Info" style="color: #ef4444;"><i class="fas fa-user-minus"></i></button>
                        ` : ''}
                        <button class="btn-icon" onclick="event.stopPropagation(); editEmployee('${empId}')"><i class="fas fa-edit"></i></button>
                        ${emp.status === 'inactive' ? `
                            <button class="btn-icon success" onclick="event.stopPropagation(); activateEmployee('${empId}')" title="Activate Employee"><i class="fas fa-check"></i></button>
                        ` : `
                            <button class="btn-icon danger" onclick="event.stopPropagation(); deleteEmployee('${empId}')"><i class="fas fa-trash"></i></button>
                        `}
                    </div>
                </div>
            `;
        }

        /**
         * Render employee as list row
         */
        function renderEmployeeListRow(emp) {
            const getRoleColor = () => {
                const colors = {
                    'admin': '#ef4444',
                    'manager': '#f59e0b',
                    'employee': '#3b82f6'
                };
                return colors[emp.employeeType] || '#3b82f6';
            };

            const empId = emp.firestoreId || emp.id;
            return `
                <tr onclick="viewEmployee('${empId}')" style="cursor: pointer;">
                    <td>
                        <div class="emp-info-cell">
                            ${emp.photo
                                ? `<div class="avatar" style="background-image: url('${emp.photo}'); background-size: cover; background-position: center;"></div>`
                                : `<div class="avatar employee-avatar ${emp.color}" style="display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: white;">${emp.initials}</div>`
                            }
                            <div class="details">
                                <div class="name">${emp.name}</div>
                                <div class="email">${emp.authEmail || ''}</div>
                            </div>
                        </div>
                    </td>
                    <td style="color: var(--text-secondary); white-space: nowrap;">${emp.role}</td>
                    <td>
                        <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--text-secondary); white-space: nowrap;">
                            <i class="fas fa-store" style="font-size: 11px; color: var(--text-muted);"></i> ${emp.store}
                        </span>
                    </td>
                    <td>
                        <span style="background: ${getRoleColor()}; color: white; font-size: 11px; padding: 4px 10px; border-radius: 6px; font-weight: 500;">
                            ${emp.employeeType || 'employee'}
                        </span>
                    </td>
                    <td>
                        <span class="employee-status-badge ${emp.status}" style="font-size: 11px;">${emp.status}</span>
                    </td>
                    <td style="color: var(--text-muted); font-size: 13px; white-space: nowrap;">${emp.phone || '-'}</td>
                    <td>
                        <div class="emp-actions-cell">
                            <button class="btn-icon" onclick="event.stopPropagation(); editEmployee('${empId}')" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon" onclick="event.stopPropagation(); viewEmployeePaperwork('${empId}')" title="Documents"><i class="fas fa-file-pdf"></i></button>
                            ${emp.status === 'inactive' ? `
                                <button class="btn-icon success" onclick="event.stopPropagation(); activateEmployee('${empId}')" title="Activate"><i class="fas fa-check"></i></button>
                            ` : `
                                <button class="btn-icon danger" onclick="event.stopPropagation(); deleteEmployee('${empId}')" title="Delete"><i class="fas fa-trash"></i></button>
                            `}
                        </div>
                    </td>
                </tr>
            `;
        }

        /**
         * Set employee view mode (grid or list)
         */
        window.setEmployeeViewMode = function(mode) {
            employeeViewMode = mode;
            localStorage.setItem('employeeViewMode', mode);
            renderEmployees();
        };

        /**
         * Get color for document type
         */
        function getDocumentColor(fileType) {
            if (!fileType) return '#6b7280';
            if (fileType.includes('pdf')) return '#ef4444';
            if (fileType.includes('word') || fileType.includes('doc')) return '#3b82f6';
            if (fileType.includes('image') || fileType.includes('jpg') || fileType.includes('jpeg') || fileType.includes('png')) return '#10b981';
            return '#6b7280';
        }

        /**
         * Download document
         */
        function downloadDocument(url, fileName) {
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        async function renderTraining() {
            const dashboard = document.querySelector('.dashboard');

            // Show loading state
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Training Center</h2>
                        <p class="section-subtitle">Videos, documents, and courses for your team</p>
                    </div>
                    <button class="btn-primary floating-add-btn no-float-mobile" onclick="openModal('add-training')">
                        <i class="fas fa-plus"></i> Add Training
                    </button>
                </div>
                <div style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--accent-primary);"></i>
                    <p style="color: var(--text-muted); margin-top: 16px;">Loading training materials...</p>
                </div>
            `;

            // Load trainings from Firebase
            await loadTrainingsFromFirebase();

            // Render the trainings grid
            dashboard.innerHTML = `
                <div class="page-header" style="margin-bottom: 24px;">
                    <div class="page-header-left">
                        <h2 class="section-title">Training Center</h2>
                        <p class="section-subtitle">Videos, documents, and courses for your team</p>
                    </div>
                    <div class="page-header-right" style="display: flex; gap: 12px; align-items: center;">
                        <!-- View Toggle -->
                        <div style="display: flex; background: var(--bg-secondary); border-radius: 10px; padding: 4px; border: 1px solid var(--border-color);">
                            <button onclick="setTrainingViewMode('grid')" id="training-view-grid-btn" style="width: 38px; height: 38px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; ${trainingViewMode === 'grid' ? 'background: var(--accent-primary); color: white;' : 'background: transparent; color: var(--text-muted);'}" title="Grid View">
                                <i class="fas fa-th-large"></i>
                            </button>
                            <button onclick="setTrainingViewMode('list')" id="training-view-list-btn" style="width: 38px; height: 38px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; ${trainingViewMode === 'list' ? 'background: var(--accent-primary); color: white;' : 'background: transparent; color: var(--text-muted);'}" title="List View">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                        <button class="btn-primary" onclick="openModal('add-training')">
                            <i class="fas fa-plus"></i> Add Training
                        </button>
                    </div>
                </div>

                ${trainings.length === 0 ? `
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                        <i class="fas fa-graduation-cap" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                        <div style="font-size: 16px;">No training materials yet</div>
                        <div style="font-size: 14px; margin-top: 8px;">Click "Add Training" to create your first training material</div>
                    </div>
                ` : trainingViewMode === 'grid' ? `
                    <div class="training-grid">
                        ${trainings.map(t => {
                            const thumbnail = t.type === 'video' && t.url ? getVideoThumbnail(t.url) : null;
                            const isVimeo = thumbnail && thumbnail.startsWith('vimeo:');
                            const vimeoId = isVimeo ? thumbnail.replace('vimeo:', '') : null;
                            const thumbStyle = thumbnail && !isVimeo ? `style="background-image: url('${thumbnail}'); background-size: cover; background-position: center;"` : '';
                            const vimeoAttr = isVimeo ? `data-vimeo-id="${vimeoId}"` : '';
                            return `
                            <div class="training-card" onclick="${t.type === 'video' ? `playTrainingVideo('${t.id}')` : `viewTraining('${t.id}')`}" style="cursor: pointer;">
                                <div class="training-card-thumbnail ${t.type}" ${thumbStyle} ${vimeoAttr}>
                                    ${thumbnail ? `<div style="position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas fa-play-circle" style="font-size: 48px; color: white; text-shadow: 0 2px 8px rgba(0,0,0,0.5);"></i></div>` : `<i class="fas fa-${t.type === 'video' ? 'play-circle' : 'file-pdf'}"></i>`}
                                </div>
                                <div class="training-card-body">
                                    <div class="training-card-type">${(t.type || 'document').toUpperCase()}</div>
                                    <h3 class="training-card-title">${t.title}</h3>
                                    ${t.fileName ? `
                                        <div style="margin-top: 8px; font-size: 12px; color: var(--text-muted);">
                                            <i class="fas fa-file-pdf"></i> ${t.fileName}
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="training-card-footer">
                                    <button class="btn-secondary" onclick="event.stopPropagation(); viewTraining('${t.id}')">View Details</button>
                                    <button class="btn-icon" onclick="event.stopPropagation(); editTraining('${t.id}')"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon danger" onclick="event.stopPropagation(); deleteTraining('${t.id}')"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        `;}).join('')}
                    </div>
                ` : `
                    <!-- List View -->
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${trainings.map(t => {
                            const thumbnail = t.type === 'video' && t.url ? getVideoThumbnail(t.url) : null;
                            const isVimeo = thumbnail && thumbnail.startsWith('vimeo:');
                            const vimeoId = isVimeo ? thumbnail.replace('vimeo:', '') : null;
                            const thumbUrl = thumbnail && !isVimeo ? thumbnail : null;
                            const vimeoAttr = isVimeo ? `data-vimeo-id="${vimeoId}"` : '';
                            const typeColor = t.type === 'video' ? '#ef4444' : '#3b82f6';
                            const typeIcon = t.type === 'video' ? 'play-circle' : 'file-pdf';
                            return `
                            <div class="training-list-item" onclick="${t.type === 'video' ? `playTrainingVideo('${t.id}')` : `viewTraining('${t.id}')`}" style="background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='var(--accent-primary)'" onmouseout="this.style.borderColor='var(--border-color)'">
                                <div style="display: flex; align-items: center; padding: 16px; gap: 16px;">
                                    <!-- Thumbnail -->
                                    <div style="width: 120px; height: 68px; border-radius: 8px; flex-shrink: 0; position: relative; overflow: hidden; background: linear-gradient(135deg, ${typeColor} 0%, ${typeColor}dd 100%); display: flex; align-items: center; justify-content: center;" ${thumbUrl ? `style="background-image: url('${thumbUrl}'); background-size: cover; background-position: center;"` : ''} ${vimeoAttr}>
                                        ${thumbUrl ? `
                                            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                                                <i class="fas fa-play-circle" style="font-size: 28px; color: white;"></i>
                                            </div>
                                        ` : `
                                            <i class="fas fa-${typeIcon}" style="font-size: 24px; color: white;"></i>
                                        `}
                                    </div>

                                    <!-- Info -->
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                                            <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.title}</h3>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 16px; font-size: 13px; color: var(--text-muted);">
                                            <span style="display: flex; align-items: center; gap: 4px;">
                                                <i class="fas fa-${typeIcon}" style="color: ${typeColor};"></i>
                                                ${(t.type || 'document').charAt(0).toUpperCase() + (t.type || 'document').slice(1)}
                                            </span>
                                            ${t.fileName ? `
                                                <span style="display: flex; align-items: center; gap: 4px;">
                                                    <i class="fas fa-file"></i>
                                                    ${t.fileName}
                                                </span>
                                            ` : ''}
                                        </div>
                                    </div>

                                    <!-- Actions -->
                                    <div style="display: flex; gap: 8px;" onclick="event.stopPropagation()">
                                        <button class="btn-secondary" onclick="viewTraining('${t.id}')" style="padding: 8px 16px; font-size: 13px;">
                                            <i class="fas fa-eye"></i> View
                                        </button>
                                        <button class="btn-icon" onclick="editTraining('${t.id}')" style="width: 36px; height: 36px;">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon danger" onclick="deleteTraining('${t.id}')" style="width: 36px; height: 36px;">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;}).join('')}
                    </div>
                `}
            `;

            // Load Vimeo thumbnails after render
            setTimeout(() => loadVimeoThumbnails(), 100);
        }

        function renderLicenses() {
            const stores = ['Miramar', 'Miramar Wine & Liquor', 'Morena', 'Kearny Mesa', 'Chula Vista', 'North Park'];

            const dashboard = document.querySelector('.dashboard');

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Licenses & Documents</h2>
                        <p class="section-subtitle">Drag and drop documents between stores</p>
                        <div class="licenses-controls-row">
                            <div class="edit-mode-toggle">
                                <span class="edit-mode-label">Edit Mode:</span>
                                <button onclick="toggleLicensesEditMode()" style="background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center;">
                                    <div style="width: 44px; height: 24px; background: ${licensesEditMode ? '#10b981' : '#ef4444'}; border-radius: 12px; position: relative; transition: background 0.3s;">
                                        <div style="width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; ${licensesEditMode ? 'right: 2px;' : 'left: 2px;'} transition: all 0.3s;"></div>
                                    </div>
                                </button>
                                <span class="edit-mode-status" style="color: ${licensesEditMode ? '#10b981' : '#ef4444'};">${licensesEditMode ? '✓ EDITABLE' : '✗ LOCKED'}</span>
                            </div>
                            <button class="btn-primary btn-add-document" onclick="openModal('add-license')">
                                <i class="fas fa-plus"></i> Add Document
                            </button>
                        </div>
                    </div>
                </div>

                <div class="license-summary">
                    <div class="license-summary-card valid">
                        <i class="fas fa-check-circle"></i>
                        <span class="count">${licenses.filter(l => l.status === 'valid').length}</span>
                        <span class="label">Valid</span>
                    </div>
                    <div class="license-summary-card expiring">
                        <i class="fas fa-clock"></i>
                        <span class="count">${licenses.filter(l => l.status === 'expiring').length}</span>
                        <span class="label">Expiring Soon</span>
                    </div>
                    <div class="license-summary-card expired">
                        <i class="fas fa-times-circle"></i>
                        <span class="count">${licenses.filter(l => l.status === 'expired').length}</span>
                        <span class="label">Expired</span>
                    </div>
                </div>

                <div class="license-stores-grid">
                    ${stores.map(store => {
                        const storeLicenses = licenses.filter(l => l.store === store);
                        return `
                            <div class="license-store-zone"
                                 data-store="${store}"
                                 ondrop="handleLicenseDrop(event, '${store}')"
                                 ondragover="handleLicenseDragOver(event)"
                                 ondragleave="handleLicenseDragLeave(event)">
                                <div class="license-store-header">
                                    <div class="license-store-title">
                                        <i class="fas fa-store"></i>
                                        <span>VSU ${store}</span>
                                    </div>
                                    <div class="license-store-count">
                                        <span class="count-badge">${storeLicenses.length}</span>
                                    </div>
                                </div>
                                <div class="license-drop-area">
                                    ${storeLicenses.length === 0 ? `
                                        <div class="license-empty-state">
                                            <i class="fas fa-file-upload"></i>
                                            <span>Drop documents here</span>
                                        </div>
                                    ` : ''}
                                    ${storeLicenses.map(lic => {
                                        const hasPdf = lic.fileUrl || lic.fileData;
                                        return `
                                        <div class="license-item"
                                             draggable="${licensesEditMode ? 'true' : 'false'}"
                                             data-license-id="${lic.id}"
                                             ondragstart="handleLicenseDragStart(event, '${lic.id}')"
                                             ondragend="handleLicenseDragEnd(event)"
                                             style="cursor: ${licensesEditMode ? 'grab' : 'default'};">
                                            <div class="license-item-header">
                                                <div class="license-item-name">
                                                    <i class="fas fa-file-pdf"></i>
                                                    <span>${lic.name}</span>
                                                </div>
                                                <div class="license-item-status">
                                                    <div class="status-dot ${lic.status}" title="${lic.status}"></div>
                                                </div>
                                            </div>
                                            <div class="license-item-footer">
                                                <span class="license-expires">
                                                    <i class="fas fa-calendar"></i>
                                                    ${formatDate(lic.expires)}
                                                </span>
                                                <div class="license-item-actions" style="pointer-events: auto;">
                                                    <button class="btn-icon-sm" onclick="event.stopPropagation(); viewLicense('${lic.id}')" title="View${hasPdf ? ' PDF' : ''}" style="pointer-events: auto;">
                                                        <i class="fas ${hasPdf ? 'fa-file-pdf' : 'fa-eye'}"></i>
                                                    </button>
                                                    <button class="btn-icon-sm" onclick="event.stopPropagation(); deleteLicense('${lic.id}')" title="Delete" style="${!licensesEditMode ? 'opacity: 0.4; pointer-events: none;' : 'pointer-events: auto;'}">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        // Analytics date range state - Initialize with current month dates
        const analyticsNow = new Date();
        const analyticsMonthStart = new Date(analyticsNow.getFullYear(), analyticsNow.getMonth(), 1);
        const analyticsMonthEnd = new Date(analyticsNow.getFullYear(), analyticsNow.getMonth() + 1, 0); // Last day of current month

        let analyticsDateRange = {
            startDate: analyticsMonthStart,
            endDate: analyticsNow, // Today, not future date
            period: 'month', // 'today', 'week', 'month', 'quarter', 'year', 'custom'
            calendarMonth1: new Date(),
            calendarMonth2: new Date(analyticsNow.getFullYear(), analyticsNow.getMonth() + 1, 1),
            isSelecting: false,
            tempStartDate: null
        };

        // Analytics data cache (populated by bulk operations)
        let analyticsData = {
            isLoading: false,
            lastLoaded: null,
            storeKey: 'vsu', // Default store
            data: null,      // Holds the analytics result from fetchSalesAnalyticsBulk
            error: null
        };

        /**
         * Load analytics data using GraphQL Bulk Operations
         * This fetches real order data from Shopify without the 250/page limit
         */
        async function loadAnalyticsData() {
            // Don't reload if already loading
            if (analyticsData.isLoading) {
                console.log('[Analytics] Already loading, skipping...');
                return;
            }

            analyticsData.isLoading = true;
            analyticsData.error = null;

            // Show loading state in UI
            updateAnalyticsLoadingState(true, 'Starting bulk export...');

            try {
                // Always build custom range from selected dates for smart fetch to calculate days
                let customRange = null;
                if (analyticsDateRange.startDate && analyticsDateRange.endDate) {
                    customRange = {
                        startDate: analyticsDateRange.startDate,
                        endDate: analyticsDateRange.endDate
                    };
                }

                // Progress callback to update UI
                const onProgress = (percent, message) => {
                    updateAnalyticsLoadingState(true, message, percent);
                };

                // Fetch data using smart method (REST for short periods, Bulk for long)
                const fetchFn = typeof fetchSalesAnalyticsSmart === 'function'
                    ? fetchSalesAnalyticsSmart
                    : fetchSalesAnalyticsBulk;
                const data = await fetchFn(
                    analyticsData.storeKey,
                    null, // locationId
                    analyticsDateRange.period,
                    onProgress,
                    customRange
                );

                analyticsData.data = data;
                analyticsData.lastLoaded = new Date();
                analyticsData.error = null;

                console.log(`[Analytics] Loaded ${data.summary.totalOrders} orders via bulk operation`);

                // Re-render with real data
                renderAnalyticsWithData();

            } catch (error) {
                console.error('[Analytics] Failed to load data:', error);
                analyticsData.error = error.message;
                updateAnalyticsLoadingState(false, null);
                showAnalyticsError(error.message);
            } finally {
                analyticsData.isLoading = false;
            }
        }

        /**
         * Update the loading state UI in analytics page
         */
        function updateAnalyticsLoadingState(isLoading, message = '', percent = 0) {
            const loadingOverlay = document.getElementById('analytics-loading-overlay');
            if (!loadingOverlay) return;

            if (isLoading) {
                loadingOverlay.style.display = 'flex';
                const progressBar = loadingOverlay.querySelector('.analytics-progress-bar');
                const progressText = loadingOverlay.querySelector('.analytics-progress-text');
                if (progressBar) progressBar.style.width = `${percent}%`;
                if (progressText) progressText.textContent = message;
            } else {
                loadingOverlay.style.display = 'none';
            }
        }

        /**
         * Show error message in analytics page
         */
        function showAnalyticsError(message) {
            const errorContainer = document.getElementById('analytics-error');
            if (errorContainer) {
                errorContainer.style.display = 'block';
                errorContainer.textContent = `Error: ${message}`;
            }
        }

        /**
         * Render analytics page with real Shopify data
         */
        function renderAnalyticsWithData() {
            if (!analyticsData.data) {
                renderAnalytics(); // Fall back to placeholder
                return;
            }

            const data = analyticsData.data;
            const summary = data.summary;
            const dashboard = document.querySelector('.dashboard');

            // Calculate real totals from Cash Out records
            const totalCashOut = cashOutRecords.reduce((sum, r) => sum + (r.amount || 0), 0);

            // Use real data from bulk operation
            const totalIncome = parseFloat(summary.totalSales);
            const totalTax = parseFloat(summary.totalTax);
            const netSales = parseFloat(summary.netSales);
            const totalOrders = summary.totalOrders;
            const avgOrderValue = parseFloat(summary.avgOrderValue);
            const totalCecetTax = parseFloat(summary.totalCecetTax);
            const totalSalesTax = parseFloat(summary.totalSalesTax);

            // Build monthly data from real data
            const monthlyData = Object.entries(data.monthly).map(([month, stats]) => ({
                month: month,
                income: stats.sales,
                expenses: stats.tax, // Using tax as a proxy for now
                orders: stats.orders,
                cecetTax: stats.cecetTax,
                salesTax: stats.salesTax
            })).sort((a, b) => new Date(a.month) - new Date(b.month));

            // Find max for scaling
            const maxIncome = Math.max(...monthlyData.map(m => m.income), 1);

            // Format current date range display
            const formatDateDisplay = (date) => {
                if (!date) return '';
                return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            };

            const dateRangeText = analyticsDateRange.startDate && analyticsDateRange.endDate
                ? `${formatDateDisplay(analyticsDateRange.startDate)} → ${formatDateDisplay(analyticsDateRange.endDate)}`
                : data.dateRange ? `${formatDateDisplay(new Date(data.dateRange.since))} → ${formatDateDisplay(new Date(data.dateRange.until))}` : 'Select date range';

            dashboard.innerHTML = `
                <!-- Loading Overlay -->
                <div id="analytics-loading-overlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
                    <div style="background: var(--bg-card); padding: 30px; border-radius: 12px; text-align: center; min-width: 300px;">
                        <div class="analytics-progress-text" style="margin-bottom: 15px; color: var(--text-primary);">Loading...</div>
                        <div style="background: var(--bg-secondary); border-radius: 8px; height: 8px; overflow: hidden;">
                            <div class="analytics-progress-bar" style="background: var(--accent-primary); height: 100%; width: 0%; transition: width 0.3s;"></div>
                        </div>
                    </div>
                </div>

                <!-- Error Container -->
                <div id="analytics-error" style="display: none; background: #fee; color: #c33; padding: 15px; border-radius: 8px; margin-bottom: 20px;"></div>

                <!-- Clean Header -->
                <div class="page-header" style="margin-bottom: 24px;">
                    <div class="page-header-left">
                        <h2 class="section-title">Sales Analytics</h2>
                        <p class="section-subtitle">${dateRangeText}</p>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <select id="analytics-period-select" onchange="setAnalyticsPeriodFromSelect(this.value)" class="form-input" style="min-width: 140px;">
                            <option value="today" ${analyticsDateRange.period === 'today' ? 'selected' : ''}>Today</option>
                            <option value="week" ${analyticsDateRange.period === 'week' ? 'selected' : ''}>This Week</option>
                            <option value="month" ${analyticsDateRange.period === 'month' ? 'selected' : ''}>This Month</option>
                            <option value="quarter" ${analyticsDateRange.period === 'quarter' ? 'selected' : ''}>Last 3 Months</option>
                            <option value="year" ${analyticsDateRange.period === 'year' ? 'selected' : ''}>This Year</option>
                            <option value="custom" ${analyticsDateRange.period === 'custom' ? 'selected' : ''}>Custom Range</option>
                        </select>
                        <button onclick="loadAnalyticsData()" class="btn-primary" style="padding: 10px 16px;">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                </div>

                <!-- Custom Date Range (only shown when custom is selected) -->
                <div id="analytics-custom-range" style="display: ${analyticsDateRange.period === 'custom' ? 'flex' : 'none'}; gap: 16px; align-items: center; margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%); border-radius: 16px; border: 1px solid var(--border-color); flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span style="color: var(--text-muted); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Start Date</span>
                            <button onclick="openCustomCalendar('start')" id="analytics-start-btn" style="width: 170px; padding: 12px 16px; padding-left: 40px; border-radius: 10px; font-weight: 600; background: var(--bg-card); border: 2px solid var(--border-color); color: var(--text-primary); cursor: pointer; text-align: left; position: relative; transition: all 0.2s;">
                                <i class="fas fa-calendar" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--accent-primary); font-size: 14px;"></i>
                                ${analyticsDateRange.startDate ? analyticsDateRange.startDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : 'Select date'}
                            </button>
                        </div>
                        <div style="width: 40px; height: 40px; background: var(--accent-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-top: 20px;">
                            <i class="fas fa-arrow-right" style="color: white; font-size: 14px;"></i>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span style="color: var(--text-muted); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">End Date</span>
                            <button onclick="openCustomCalendar('end')" id="analytics-end-btn" style="width: 170px; padding: 12px 16px; padding-left: 40px; border-radius: 10px; font-weight: 600; background: var(--bg-card); border: 2px solid var(--border-color); color: var(--text-primary); cursor: pointer; text-align: left; position: relative; transition: all 0.2s;">
                                <i class="fas fa-calendar-check" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #10b981; font-size: 14px;"></i>
                                ${analyticsDateRange.endDate ? analyticsDateRange.endDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : 'Select date'}
                            </button>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; margin-left: auto; flex-wrap: wrap;">
                        <button onclick="setQuickDateRange('today')" class="btn-secondary ${analyticsDateRange.period === 'today' ? 'active' : ''}" style="padding: 10px 14px; border-radius: 10px; font-size: 12px;">Today</button>
                        <button onclick="setQuickDateRange('yesterday')" class="btn-secondary ${analyticsDateRange.period === 'custom' && analyticsDateRange.startDate?.toDateString() === new Date(new Date().setDate(new Date().getDate()-1)).toDateString() ? 'active' : ''}" style="padding: 10px 14px; border-radius: 10px; font-size: 12px;">Yesterday</button>
                        <button onclick="setQuickDateRange('week')" class="btn-secondary ${analyticsDateRange.period === 'week' ? 'active' : ''}" style="padding: 10px 14px; border-radius: 10px; font-size: 12px;">This Week</button>
                        <button onclick="setQuickDateRange('month')" class="btn-secondary ${analyticsDateRange.period === 'month' ? 'active' : ''}" style="padding: 10px 14px; border-radius: 10px; font-size: 12px;">This Month</button>
                        <button onclick="setQuickDateRange('year')" class="btn-secondary ${analyticsDateRange.period === 'year' ? 'active' : ''}" style="padding: 10px 14px; border-radius: 10px; font-size: 12px;">This Year</button>
                    </div>
                </div>

                <!-- Real Data Summary Cards -->
                <div class="analytics-grid">
                    <div class="analytics-card revenue">
                        <div class="analytics-card-header">
                            <h3>Total Sales</h3>
                            <span class="trend up"><i class="fas fa-shopping-cart"></i></span>
                        </div>
                        <div class="analytics-value">$${totalIncome.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <div class="analytics-comparison">
                            <span>${totalOrders} orders</span>
                        </div>
                    </div>

                    <div class="analytics-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                        <div class="analytics-card-header">
                            <h3 style="color: white;">Total Tax</h3>
                            <span class="trend" style="background: rgba(255,255,255,0.2); color: white;"><i class="fas fa-receipt"></i></span>
                        </div>
                        <div class="analytics-value" style="color: white;">$${totalTax.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <div class="analytics-comparison" style="color: rgba(255,255,255,0.8);">
                            <span>CECET: $${totalCecetTax.toFixed(2)} | Sales: $${totalSalesTax.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="analytics-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                        <div class="analytics-card-header">
                            <h3 style="color: white;">Net Sales</h3>
                            <span class="trend" style="background: rgba(255,255,255,0.2); color: white;"><i class="fas fa-dollar-sign"></i></span>
                        </div>
                        <div class="analytics-value" style="color: white;">$${netSales.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <div class="analytics-comparison" style="color: rgba(255,255,255,0.8);">
                            <span>After tax deductions</span>
                        </div>
                    </div>

                    <div class="analytics-card orders">
                        <div class="analytics-card-header">
                            <h3>Avg Order Value</h3>
                            <span class="trend up"><i class="fas fa-chart-line"></i></span>
                        </div>
                        <div class="analytics-value">$${avgOrderValue.toFixed(2)}</div>
                        <div class="analytics-breakdown">
                            <div class="breakdown-item">
                                <span class="breakdown-label">Total Orders</span>
                                <span class="breakdown-value">${totalOrders}</span>
                            </div>
                        </div>
                    </div>
                </div>

                ${monthlyData.length > 0 ? `
                <!-- Sales by Period Chart -->
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-chart-bar"></i> Sales by ${monthlyData.length > 7 ? 'Month' : 'Day'}</h3>
                    </div>
                    <div class="card-body">
                        <div style="display: flex; gap: 24px; margin-bottom: 20px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 16px; height: 16px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 4px;"></div>
                                <span style="font-size: 13px; color: var(--text-secondary);">Sales</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 16px; height: 16px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 4px;"></div>
                                <span style="font-size: 13px; color: var(--text-secondary);">Tax</span>
                            </div>
                        </div>

                        <div style="display: flex; align-items: flex-end; gap: 8px; height: 250px; padding: 20px 0; border-bottom: 2px solid var(--border-color); overflow-x: auto;">
                            ${monthlyData.slice(-12).map(m => {
                                const incomeHeight = (m.income / maxIncome) * 100;
                                const taxHeight = (m.expenses / maxIncome) * 100;
                                return `
                                    <div style="flex: 1; min-width: 50px; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                                        <div style="font-size: 10px; color: var(--text-muted); max-width: 60px; overflow: hidden; text-overflow: ellipsis;">$${(m.income/1000).toFixed(1)}k</div>
                                        <div style="display: flex; gap: 2px; align-items: flex-end; height: 180px;">
                                            <div style="width: 18px; height: ${incomeHeight}%; background: linear-gradient(180deg, #6366f1, #8b5cf6); border-radius: 4px 4px 0 0; transition: height 0.3s;" title="Sales: $${m.income.toLocaleString()}"></div>
                                            <div style="width: 18px; height: ${Math.max(taxHeight, 2)}%; background: linear-gradient(180deg, #f59e0b, #d97706); border-radius: 4px 4px 0 0; transition: height 0.3s;" title="Tax: $${m.expenses.toLocaleString()}"></div>
                                        </div>
                                        <div style="font-size: 10px; color: var(--text-muted); font-weight: 500; white-space: nowrap;">${m.month.split(' ')[0].substring(0,3)}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>

                        <!-- Summary Table -->
                        <div style="margin-top: 20px; overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                                <thead>
                                    <tr style="background: var(--bg-secondary);">
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid var(--border-color);">Period</th>
                                        <th style="padding: 12px; text-align: right; border-bottom: 1px solid var(--border-color);">Sales</th>
                                        <th style="padding: 12px; text-align: right; border-bottom: 1px solid var(--border-color);">Orders</th>
                                        <th style="padding: 12px; text-align: right; border-bottom: 1px solid var(--border-color);">Tax</th>
                                        <th style="padding: 12px; text-align: right; border-bottom: 1px solid var(--border-color);">CECET</th>
                                        <th style="padding: 12px; text-align: right; border-bottom: 1px solid var(--border-color);">Sales Tax</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${monthlyData.slice(-12).map(m => `
                                        <tr>
                                            <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); font-weight: 500;">${m.month}</td>
                                            <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); text-align: right; color: var(--accent-primary);">$${m.income.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                            <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); text-align: right;">${m.orders}</td>
                                            <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); text-align: right; color: #f59e0b;">$${m.expenses.toFixed(2)}</td>
                                            <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); text-align: right;">$${m.cecetTax.toFixed(2)}</td>
                                            <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); text-align: right;">$${m.salesTax.toFixed(2)}</td>
                                        </tr>
                                    `).join('')}
                                    <tr style="background: var(--bg-secondary); font-weight: 700;">
                                        <td style="padding: 12px;">TOTAL</td>
                                        <td style="padding: 12px; text-align: right; color: var(--accent-primary);">$${totalIncome.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                        <td style="padding: 12px; text-align: right;">${totalOrders}</td>
                                        <td style="padding: 12px; text-align: right; color: #f59e0b;">$${totalTax.toFixed(2)}</td>
                                        <td style="padding: 12px; text-align: right;">$${totalCecetTax.toFixed(2)}</td>
                                        <td style="padding: 12px; text-align: right;">$${totalSalesTax.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                ` : `
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-body" style="text-align: center; padding: 40px;">
                        <i class="fas fa-chart-bar" style="font-size: 48px; color: var(--text-muted); margin-bottom: 15px;"></i>
                        <p style="color: var(--text-secondary);">No data available for the selected period</p>
                    </div>
                </div>
                `}

                <!-- Recent Orders -->
                ${data.recentOrders && data.recentOrders.length > 0 ? `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-list"></i> Recent Orders (${Math.min(data.recentOrders.length, 20)} of ${data.recentOrders.length})</h3>
                    </div>
                    <div class="card-body" style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <thead>
                                <tr style="background: var(--bg-secondary);">
                                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid var(--border-color);">Order</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid var(--border-color);">Date</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid var(--border-color);">Customer</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 1px solid var(--border-color);">Total</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 1px solid var(--border-color);">Tax</th>
                                    <th style="padding: 12px; text-align: center; border-bottom: 1px solid var(--border-color);">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.recentOrders.slice(0, 20).map(order => `
                                    <tr>
                                        <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); font-weight: 500;">${order.name}</td>
                                        <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color);">${new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color);">${order.customer}</td>
                                        <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); text-align: right; font-weight: 500;">$${order.total.toFixed(2)}</td>
                                        <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); text-align: right; color: #f59e0b;">$${(order.cecetTax + order.salesTax).toFixed(2)}</td>
                                        <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); text-align: center;">
                                            <span style="padding: 4px 8px; background: ${order.status === 'PAID' ? '#10b98120' : '#f59e0b20'}; color: ${order.status === 'PAID' ? '#10b981' : '#f59e0b'}; border-radius: 12px; font-size: 11px; font-weight: 600;">${order.status}</span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                ` : ''}
            `;

            // Hide loading overlay if visible
            updateAnalyticsLoadingState(false);
        }

        function renderAnalytics() {
            // If we already have data, render with data instead
            if (analyticsData.data) {
                renderAnalyticsWithData();
                return;
            }

            const dashboard = document.querySelector('.dashboard');

            // Format current date range display
            const formatDateDisplay = (date) => {
                if (!date) return '';
                return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            };

            const dateRangeText = analyticsDateRange.startDate && analyticsDateRange.endDate
                ? `${formatDateDisplay(analyticsDateRange.startDate)} → ${formatDateDisplay(analyticsDateRange.endDate)}`
                : 'Select date range';

            dashboard.innerHTML = `
                <!-- Loading Overlay -->
                <div id="analytics-loading-overlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
                    <div style="background: var(--bg-card); padding: 30px; border-radius: 12px; text-align: center; min-width: 300px;">
                        <div class="analytics-progress-text" style="margin-bottom: 15px; color: var(--text-primary);">Loading...</div>
                        <div style="background: var(--bg-secondary); border-radius: 8px; height: 8px; overflow: hidden;">
                            <div class="analytics-progress-bar" style="background: var(--accent-primary); height: 100%; width: 0%; transition: width 0.3s;"></div>
                        </div>
                    </div>
                </div>

                <!-- Error Container -->
                <div id="analytics-error" style="display: none; background: #fee; color: #c33; padding: 15px; border-radius: 8px; margin-bottom: 20px;"></div>

                <!-- Clean Header -->
                <div class="page-header" style="margin-bottom: 24px;">
                    <div class="page-header-left">
                        <h2 class="section-title">Sales Analytics</h2>
                        <p class="section-subtitle">${dateRangeText}</p>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <select id="analytics-period-select" onchange="setAnalyticsPeriodFromSelect(this.value)" class="form-input" style="min-width: 140px;">
                            <option value="today" ${analyticsDateRange.period === 'today' ? 'selected' : ''}>Today</option>
                            <option value="week" ${analyticsDateRange.period === 'week' ? 'selected' : ''}>This Week</option>
                            <option value="month" ${analyticsDateRange.period === 'month' ? 'selected' : ''}>This Month</option>
                            <option value="quarter" ${analyticsDateRange.period === 'quarter' ? 'selected' : ''}>Last 3 Months</option>
                            <option value="year" ${analyticsDateRange.period === 'year' ? 'selected' : ''}>This Year</option>
                            <option value="custom" ${analyticsDateRange.period === 'custom' ? 'selected' : ''}>Custom Range</option>
                        </select>
                        <button onclick="loadAnalyticsData()" class="btn-primary" style="padding: 10px 16px;">
                            <i class="fas fa-sync-alt"></i> Load Data
                        </button>
                    </div>
                </div>

                <!-- Custom Date Range (only shown when custom is selected) -->
                <div id="analytics-custom-range" style="display: ${analyticsDateRange.period === 'custom' ? 'flex' : 'none'}; gap: 16px; align-items: center; margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%); border-radius: 16px; border: 1px solid var(--border-color); flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span style="color: var(--text-muted); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Start Date</span>
                            <button onclick="openCustomCalendar('start')" id="analytics-start-btn" style="width: 170px; padding: 12px 16px; padding-left: 40px; border-radius: 10px; font-weight: 600; background: var(--bg-card); border: 2px solid var(--border-color); color: var(--text-primary); cursor: pointer; text-align: left; position: relative; transition: all 0.2s;">
                                <i class="fas fa-calendar" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--accent-primary); font-size: 14px;"></i>
                                ${analyticsDateRange.startDate ? analyticsDateRange.startDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : 'Select date'}
                            </button>
                        </div>
                        <div style="width: 40px; height: 40px; background: var(--accent-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-top: 20px;">
                            <i class="fas fa-arrow-right" style="color: white; font-size: 14px;"></i>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span style="color: var(--text-muted); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">End Date</span>
                            <button onclick="openCustomCalendar('end')" id="analytics-end-btn" style="width: 170px; padding: 12px 16px; padding-left: 40px; border-radius: 10px; font-weight: 600; background: var(--bg-card); border: 2px solid var(--border-color); color: var(--text-primary); cursor: pointer; text-align: left; position: relative; transition: all 0.2s;">
                                <i class="fas fa-calendar-check" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #10b981; font-size: 14px;"></i>
                                ${analyticsDateRange.endDate ? analyticsDateRange.endDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : 'Select date'}
                            </button>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; margin-left: auto; flex-wrap: wrap;">
                        <button onclick="setQuickDateRange('today')" class="btn-secondary ${analyticsDateRange.period === 'today' ? 'active' : ''}" style="padding: 10px 14px; border-radius: 10px; font-size: 12px;">Today</button>
                        <button onclick="setQuickDateRange('yesterday')" class="btn-secondary" style="padding: 10px 14px; border-radius: 10px; font-size: 12px;">Yesterday</button>
                        <button onclick="setQuickDateRange('week')" class="btn-secondary ${analyticsDateRange.period === 'week' ? 'active' : ''}" style="padding: 10px 14px; border-radius: 10px; font-size: 12px;">This Week</button>
                        <button onclick="setQuickDateRange('month')" class="btn-secondary ${analyticsDateRange.period === 'month' ? 'active' : ''}" style="padding: 10px 14px; border-radius: 10px; font-size: 12px;">This Month</button>
                        <button onclick="setQuickDateRange('year')" class="btn-secondary ${analyticsDateRange.period === 'year' ? 'active' : ''}" style="padding: 10px 14px; border-radius: 10px; font-size: 12px;">This Year</button>
                    </div>
                </div>

                <!-- Annual Totals -->
                <div class="analytics-grid">
                    <div class="analytics-card revenue">
                        <div class="analytics-card-header">
                            <h3>Total Annual Revenue</h3>
                            <span class="trend up"><i class="fas fa-arrow-up"></i> 18.2%</span>
                        </div>
                        <div class="analytics-value">$${(totalIncome / 1000).toFixed(1)}K</div>
                        <div class="analytics-comparison">
                            <span>All stores combined</span>
                        </div>
                    </div>

                    <div class="analytics-card" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                        <div class="analytics-card-header">
                            <h3 style="color: white;">Total Expenses</h3>
                            <span class="trend" style="background: rgba(255,255,255,0.2); color: white;"><i class="fas fa-chart-line"></i></span>
                        </div>
                        <div class="analytics-value" style="color: white;">$${(totalExpenses / 1000).toFixed(1)}K</div>
                        <div class="analytics-comparison" style="color: rgba(255,255,255,0.8);">
                            <span>Cash outs: $${totalCashOut.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>

                    <div class="analytics-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                        <div class="analytics-card-header">
                            <h3 style="color: white;">Net Profit</h3>
                            <span class="trend" style="background: rgba(255,255,255,0.2); color: white;"><i class="fas fa-arrow-up"></i> ${profitMargin}%</span>
                        </div>
                        <div class="analytics-value" style="color: white;">$${(netProfit / 1000).toFixed(1)}K</div>
                        <div class="analytics-comparison" style="color: rgba(255,255,255,0.8);">
                            <span>Profit margin: ${profitMargin}%</span>
                        </div>
                    </div>

                    <div class="analytics-card orders">
                        <div class="analytics-card-header">
                            <h3>Total Orders</h3>
                            <span class="trend up"><i class="fas fa-arrow-up"></i> 12.5%</span>
                        </div>
                        <div class="analytics-value">5,842</div>
                        <div class="analytics-breakdown">
                            <div class="breakdown-item">
                                <span class="breakdown-label">Avg/Month</span>
                                <span class="breakdown-value">487</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Income vs Expenses Chart -->
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-chart-bar"></i> Income vs Expenses by Month</h3>
                    </div>
                    <div class="card-body">
                        <div style="display: flex; gap: 24px; margin-bottom: 20px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 16px; height: 16px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 4px;"></div>
                                <span style="font-size: 13px; color: var(--text-secondary);">Income</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 16px; height: 16px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 4px;"></div>
                                <span style="font-size: 13px; color: var(--text-secondary);">Expenses</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 16px; height: 3px; background: #10b981; border-radius: 2px;"></div>
                                <span style="font-size: 13px; color: var(--text-secondary);">Net Profit</span>
                            </div>
                        </div>

                        <div style="display: flex; align-items: flex-end; gap: 12px; height: 250px; padding: 20px 0; border-bottom: 2px solid var(--border-color);">
                            ${monthlyData.map(m => {
                                const incomeHeight = (m.income / maxIncome) * 100;
                                const expenseHeight = (m.expenses / maxIncome) * 100;
                                const profit = m.income - m.expenses;
                                const profitPercent = ((profit / m.income) * 100).toFixed(0);
                                return `
                                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                                        <div style="font-size: 11px; color: #10b981; font-weight: 600;">+${profitPercent}%</div>
                                        <div style="display: flex; gap: 4px; align-items: flex-end; height: 180px;">
                                            <div style="width: 20px; height: ${incomeHeight}%; background: linear-gradient(180deg, #6366f1, #8b5cf6); border-radius: 4px 4px 0 0; transition: height 0.3s;" title="Income: $${m.income.toLocaleString()}"></div>
                                            <div style="width: 20px; height: ${expenseHeight}%; background: linear-gradient(180deg, #ef4444, #dc2626); border-radius: 4px 4px 0 0; transition: height 0.3s;" title="Expenses: $${m.expenses.toLocaleString()}"></div>
                                        </div>
                                        <div style="font-size: 11px; color: var(--text-muted); font-weight: 500;">${m.month}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>

                        <!-- Monthly Summary Table -->
                        <div style="margin-top: 20px; overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                                <thead>
                                    <tr style="background: var(--bg-secondary);">
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid var(--border-color);">Month</th>
                                        <th style="padding: 12px; text-align: right; border-bottom: 1px solid var(--border-color);">Income</th>
                                        <th style="padding: 12px; text-align: right; border-bottom: 1px solid var(--border-color);">Expenses</th>
                                        <th style="padding: 12px; text-align: right; border-bottom: 1px solid var(--border-color);">Net Profit</th>
                                        <th style="padding: 12px; text-align: right; border-bottom: 1px solid var(--border-color);">Margin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${monthlyData.map(m => {
                                        const profit = m.income - m.expenses;
                                        const margin = ((profit / m.income) * 100).toFixed(1);
                                        return `
                                            <tr>
                                                <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); font-weight: 500;">${m.month}</td>
                                                <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); text-align: right; color: var(--accent-primary);">$${m.income.toLocaleString()}</td>
                                                <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); text-align: right; color: #ef4444;">$${m.expenses.toLocaleString()}</td>
                                                <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); text-align: right; color: #10b981; font-weight: 600;">$${profit.toLocaleString()}</td>
                                                <td style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); text-align: right;">
                                                    <span style="padding: 4px 8px; background: ${parseFloat(margin) > 80 ? '#10b98120' : '#f59e0b20'}; color: ${parseFloat(margin) > 80 ? '#10b981' : '#f59e0b'}; border-radius: 12px; font-size: 12px; font-weight: 600;">${margin}%</span>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                    <tr style="background: var(--bg-secondary); font-weight: 700;">
                                        <td style="padding: 12px;">TOTAL</td>
                                        <td style="padding: 12px; text-align: right; color: var(--accent-primary);">$${totalIncome.toLocaleString()}</td>
                                        <td style="padding: 12px; text-align: right; color: #ef4444;">$${totalExpenses.toLocaleString()}</td>
                                        <td style="padding: 12px; text-align: right; color: #10b981;">$${netProfit.toLocaleString()}</td>
                                        <td style="padding: 12px; text-align: right;">${profitMargin}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="analytics-stores">
                    <h3 class="section-subtitle-alt">Store Performance Comparison (Annual)</h3>
                    <div class="store-bars">
                        <div class="store-bar-item">
                            <div class="store-bar-label">
                                <span>VSU Miramar</span>
                                <span>$185,040</span>
                            </div>
                            <div class="store-bar-track">
                                <div class="store-bar-fill miramar" style="width: 100%;"></div>
                            </div>
                        </div>
                        <div class="store-bar-item">
                            <div class="store-bar-label">
                                <span>VSU Kearny Mesa</span>
                                <span>$154,680</span>
                            </div>
                            <div class="store-bar-track">
                                <div class="store-bar-fill kearny" style="width: 83%;"></div>
                            </div>
                        </div>
                        <div class="store-bar-item">
                            <div class="store-bar-label">
                                <span>VSU Chula Vista</span>
                                <span>$124,080</span>
                            </div>
                            <div class="store-bar-track">
                                <div class="store-bar-fill chula" style="width: 67%;"></div>
                            </div>
                        </div>
                        <div class="store-bar-item">
                            <div class="store-bar-label">
                                <span>VSU Morena</span>
                                <span>$114,600</span>
                            </div>
                            <div class="store-bar-track">
                                <div class="store-bar-fill morena" style="width: 62%;"></div>
                            </div>
                        </div>
                        <div class="store-bar-item">
                            <div class="store-bar-label">
                                <span>VSU North Park</span>
                                <span>$33,700</span>
                            </div>
                            <div class="store-bar-track">
                                <div class="store-bar-fill" style="width: 18%; background: linear-gradient(90deg, #14b8a6, #0d9488);"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="shopify-connect">
                    <div class="shopify-icon"><i class="fab fa-shopify"></i></div>
                    <div class="shopify-text">
                        <h4>Load Shopify Data</h4>
                        <p>Fetch real sales data using GraphQL Bulk Operations (no order limit)</p>
                    </div>
                    <button class="btn-primary" onclick="loadAnalyticsData()">
                        <i class="fas fa-sync-alt"></i> Load Data
                    </button>
                </div>
            `;

            // NOTE: Auto-load disabled - user must click Apply button
            // The renderAnalyticsPage in api-client.js is now the primary entry point
        }

        // Analytics Calendar Functions
        window.toggleAnalyticsCalendar = function() {
            const container = document.getElementById('analytics-calendar-container');
            if (!container) return;

            const isVisible = container.style.display !== 'none';
            container.style.display = isVisible ? 'none' : 'block';

            if (!isVisible) {
                // Initialize calendar months
                analyticsDateRange.calendarMonth1 = new Date();
                analyticsDateRange.calendarMonth2 = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
                renderAnalyticsCalendars();
            }
        };

        window.setAnalyticsPeriod = function(period) {
            analyticsDateRange.period = period;

            // Calculate actual dates for the period
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            switch(period) {
                case 'today':
                    analyticsDateRange.startDate = new Date(today);
                    analyticsDateRange.endDate = new Date(today);
                    break;
                case 'week':
                    // Start of week (Sunday)
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    analyticsDateRange.startDate = startOfWeek;
                    analyticsDateRange.endDate = new Date(today);
                    break;
                case 'month':
                    // Start of current month
                    analyticsDateRange.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    analyticsDateRange.endDate = new Date(today);
                    break;
                case 'quarter':
                    // Last 3 months
                    const threeMonthsAgo = new Date(today);
                    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                    analyticsDateRange.startDate = threeMonthsAgo;
                    analyticsDateRange.endDate = new Date(today);
                    break;
                case 'year':
                    // Start of current year
                    analyticsDateRange.startDate = new Date(today.getFullYear(), 0, 1);
                    analyticsDateRange.endDate = new Date(today);
                    break;
                default:
                    analyticsDateRange.startDate = null;
                    analyticsDateRange.endDate = null;
            }

            // Close calendar if open
            const container = document.getElementById('analytics-calendar-container');
            if (container) container.style.display = 'none';

            // Re-render analytics with new period (don't auto-load)
            renderAnalytics();
            // NOTE: Auto-load removed - user must click Apply
        };

        // Handle period selection from dropdown
        window.setAnalyticsPeriodFromSelect = function(period) {
            analyticsDateRange.period = period;

            // Show/hide custom date range section
            const customRangeEl = document.getElementById('analytics-custom-range');
            if (customRangeEl) {
                customRangeEl.style.display = period === 'custom' ? 'flex' : 'none';
            }

            // If not custom, calculate dates and load data
            if (period !== 'custom') {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                switch(period) {
                    case 'today':
                        analyticsDateRange.startDate = new Date(today);
                        analyticsDateRange.endDate = new Date(today);
                        break;
                    case 'week':
                        const startOfWeek = new Date(today);
                        startOfWeek.setDate(today.getDate() - today.getDay());
                        analyticsDateRange.startDate = startOfWeek;
                        analyticsDateRange.endDate = new Date(today);
                        break;
                    case 'month':
                        analyticsDateRange.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                        analyticsDateRange.endDate = new Date(today);
                        break;
                    case 'quarter':
                        const threeMonthsAgo = new Date(today);
                        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                        analyticsDateRange.startDate = threeMonthsAgo;
                        analyticsDateRange.endDate = new Date(today);
                        break;
                    case 'year':
                        analyticsDateRange.startDate = new Date(today.getFullYear(), 0, 1);
                        analyticsDateRange.endDate = new Date(today);
                        break;
                }

                // Update subtitle with new date range
                const subtitleEl = document.querySelector('.page-header .section-subtitle');
                if (subtitleEl && analyticsDateRange.startDate && analyticsDateRange.endDate) {
                    const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    subtitleEl.textContent = `${formatDate(analyticsDateRange.startDate)} - ${formatDate(analyticsDateRange.endDate)}`;
                }

                // NOTE: Auto-load removed - user must click Apply
            }
        };

        // Handle custom date range changes
        window.updateCustomDateRange = function() {
            const startInput = document.getElementById('analytics-start-date');
            const endInput = document.getElementById('analytics-end-date');

            if (startInput && startInput.value) {
                analyticsDateRange.startDate = new Date(startInput.value + 'T00:00:00');
            }
            if (endInput && endInput.value) {
                analyticsDateRange.endDate = new Date(endInput.value + 'T00:00:00');
            }

            // Update subtitle
            const subtitleEl = document.querySelector('.page-header .section-subtitle');
            if (subtitleEl && analyticsDateRange.startDate && analyticsDateRange.endDate) {
                const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                subtitleEl.textContent = `${formatDate(analyticsDateRange.startDate)} - ${formatDate(analyticsDateRange.endDate)}`;
            }
        };

        // Quick date range buttons for custom range
        window.setQuickDateRange = function(range) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            let startDate, endDate;
            let period = range; // Map range to period for API

            switch(range) {
                case 'today':
                    startDate = new Date(today);
                    endDate = new Date(today);
                    period = 'today';
                    break;
                case 'yesterday':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 1);
                    endDate = new Date(startDate);
                    period = 'custom'; // Yesterday uses custom range
                    break;
                case 'week':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - today.getDay());
                    endDate = new Date(today);
                    period = 'week';
                    break;
                case 'month':
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    endDate = new Date(today);
                    period = 'month';
                    break;
                case 'year':
                    startDate = new Date(today.getFullYear(), 0, 1);
                    endDate = new Date(today);
                    period = 'year';
                    break;
                default:
                    return;
            }

            // Update state
            analyticsDateRange.startDate = startDate;
            analyticsDateRange.endDate = endDate;
            analyticsDateRange.period = period;

            // Update the input fields
            const startInput = document.getElementById('analytics-start-date');
            const endInput = document.getElementById('analytics-end-date');
            if (startInput) startInput.value = startDate.toISOString().split('T')[0];
            if (endInput) endInput.value = endDate.toISOString().split('T')[0];

            // Update subtitle
            const subtitleEl = document.querySelector('.page-header .section-subtitle');
            if (subtitleEl) {
                const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                subtitleEl.textContent = `${formatDate(startDate)} - ${formatDate(endDate)}`;
            }

            // Update buttons
            const startBtn = document.getElementById('analytics-start-btn');
            const endBtn = document.getElementById('analytics-end-btn');
            if (startBtn) startBtn.innerHTML = `<i class="fas fa-calendar" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--accent-primary); font-size: 14px;"></i>${startDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}`;
            if (endBtn) endBtn.innerHTML = `<i class="fas fa-calendar-check" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #10b981; font-size: 14px;"></i>${endDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}`;

            // Update dropdown if exists
            const periodSelect = document.getElementById('analytics-period-select');
            if (periodSelect) {
                periodSelect.value = period;
            }

            // Log selection (don't auto-load - user must click Apply)
            console.log(`📅 [QUICK SELECT] ${range} -> period: ${period}, dates: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
            // NOTE: Auto-load removed - user must click Apply
        };

        // Custom Calendar Popup State
        let customCalendarState = {
            isOpen: false,
            type: 'start', // 'start' or 'end'
            viewMonth: new Date().getMonth(),
            viewYear: new Date().getFullYear()
        };

        // Open custom calendar popup
        window.openCustomCalendar = function(type) {
            customCalendarState.type = type;
            customCalendarState.isOpen = true;

            // Set view month based on current selection
            const currentDate = type === 'start' ? analyticsDateRange.startDate : analyticsDateRange.endDate;
            if (currentDate) {
                customCalendarState.viewMonth = currentDate.getMonth();
                customCalendarState.viewYear = currentDate.getFullYear();
            } else {
                customCalendarState.viewMonth = new Date().getMonth();
                customCalendarState.viewYear = new Date().getFullYear();
            }

            renderCustomCalendarPopup();
        };

        // Render the custom calendar popup
        function renderCustomCalendarPopup() {
            // Remove existing popup
            const existing = document.getElementById('custom-calendar-popup');
            if (existing) existing.remove();

            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            const year = customCalendarState.viewYear;
            const month = customCalendarState.viewMonth;
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const selectedDate = customCalendarState.type === 'start' ? analyticsDateRange.startDate : analyticsDateRange.endDate;

            let daysHtml = '';
            // Empty cells before first day
            for (let i = 0; i < firstDay; i++) {
                daysHtml += '<div style="width: 36px; height: 36px;"></div>';
            }
            // Days of month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const isToday = date.getTime() === today.getTime();
                const isSelected = selectedDate && date.getTime() === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();
                const isFuture = date > today;
                const isDisabled = isFuture;

                daysHtml += `
                    <div onclick="${isDisabled ? '' : `selectCalendarDate(${year}, ${month}, ${day})`}"
                         style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
                                border-radius: 10px; cursor: ${isDisabled ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 14px;
                                background: ${isSelected ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : isToday ? 'rgba(99, 102, 241, 0.15)' : 'transparent'};
                                color: ${isSelected ? 'white' : isDisabled ? 'var(--text-muted)' : isToday ? '#6366f1' : 'var(--text-primary)'};
                                opacity: ${isDisabled ? '0.4' : '1'};
                                transition: all 0.15s;
                                ${!isDisabled && !isSelected ? 'hover: { background: var(--bg-hover); }' : ''}"
                         onmouseover="${!isDisabled && !isSelected ? "this.style.background='var(--bg-hover)'" : ''}"
                         onmouseout="${!isDisabled && !isSelected ? "this.style.background='transparent'" : ''}">
                        ${day}
                    </div>
                `;
            }

            const popup = document.createElement('div');
            popup.id = 'custom-calendar-popup';
            popup.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease;';
            popup.onclick = (e) => { if (e.target === popup) closeCustomCalendar(); };

            popup.innerHTML = `
                <div style="background: var(--bg-card); border-radius: 20px; padding: 24px; min-width: 320px; box-shadow: 0 25px 50px rgba(0,0,0,0.25); animation: slideUp 0.3s ease;">
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div>
                            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                                Select ${customCalendarState.type === 'start' ? 'Start' : 'End'} Date
                            </div>
                            <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">
                                ${monthNames[month]} ${year}
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="navigateCalendar(-1)" style="width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-chevron-left" style="color: var(--text-secondary); font-size: 12px;"></i>
                            </button>
                            <button onclick="navigateCalendar(1)" style="width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-chevron-right" style="color: var(--text-secondary); font-size: 12px;"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Day Names -->
                    <div style="display: grid; grid-template-columns: repeat(7, 36px); gap: 4px; margin-bottom: 8px; justify-content: center;">
                        ${dayNames.map(d => `<div style="width: 36px; text-align: center; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">${d}</div>`).join('')}
                    </div>

                    <!-- Days Grid -->
                    <div style="display: grid; grid-template-columns: repeat(7, 36px); gap: 4px; justify-content: center;">
                        ${daysHtml}
                    </div>

                    <!-- Quick Actions -->
                    <div style="display: flex; gap: 8px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color);">
                        <button onclick="selectCalendarToday()" style="flex: 1; padding: 10px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-weight: 600; cursor: pointer; font-size: 13px;">
                            Today
                        </button>
                        <button onclick="closeCustomCalendar()" style="flex: 1; padding: 10px; border-radius: 10px; border: none; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-weight: 600; cursor: pointer; font-size: 13px;">
                            Done
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(popup);
        }

        // Navigate calendar months
        window.navigateCalendar = function(direction) {
            customCalendarState.viewMonth += direction;
            if (customCalendarState.viewMonth > 11) {
                customCalendarState.viewMonth = 0;
                customCalendarState.viewYear++;
            } else if (customCalendarState.viewMonth < 0) {
                customCalendarState.viewMonth = 11;
                customCalendarState.viewYear--;
            }
            renderCustomCalendarPopup();
        };

        // Select a date from calendar
        window.selectCalendarDate = function(year, month, day) {
            const selectedDate = new Date(year, month, day);
            selectedDate.setHours(0, 0, 0, 0);

            if (customCalendarState.type === 'start') {
                analyticsDateRange.startDate = selectedDate;
                // Update button
                const btn = document.getElementById('analytics-start-btn');
                if (btn) btn.innerHTML = `<i class="fas fa-calendar" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--accent-primary); font-size: 14px;"></i>${selectedDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}`;
            } else {
                analyticsDateRange.endDate = selectedDate;
                // Update button
                const btn = document.getElementById('analytics-end-btn');
                if (btn) btn.innerHTML = `<i class="fas fa-calendar-check" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #10b981; font-size: 14px;"></i>${selectedDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}`;
            }

            // Update subtitle
            if (analyticsDateRange.startDate && analyticsDateRange.endDate) {
                const subtitleEl = document.querySelector('.page-header .section-subtitle');
                if (subtitleEl) {
                    const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    subtitleEl.textContent = `${formatDate(analyticsDateRange.startDate)} - ${formatDate(analyticsDateRange.endDate)}`;
                }
            }

            renderCustomCalendarPopup();
        };

        // Select today
        window.selectCalendarToday = function() {
            const today = new Date();
            selectCalendarDate(today.getFullYear(), today.getMonth(), today.getDate());
        };

        // Close calendar popup
        window.closeCustomCalendar = function() {
            customCalendarState.isOpen = false;
            const popup = document.getElementById('custom-calendar-popup');
            if (popup) popup.remove();
        };

        function renderAnalyticsCalendars() {
            const panel1 = document.getElementById('calendar-month-1');
            const panel2 = document.getElementById('calendar-month-2');
            if (!panel1 || !panel2) return;

            panel1.innerHTML = renderCalendarMonth(analyticsDateRange.calendarMonth1, 1);
            panel2.innerHTML = renderCalendarMonth(analyticsDateRange.calendarMonth2, 2);
        }

        function renderCalendarMonth(date, panelNum) {
            const year = date.getFullYear();
            const month = date.getMonth();
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December'];
            const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let html = `
                <div class="calendar-month-nav">
                    ${panelNum === 1 ? `<button class="calendar-nav-btn" onclick="navigateAnalyticsCalendar(-1)"><i class="fas fa-chevron-left"></i></button>` : '<div style="width: 28px;"></div>'}
                    <h4>${monthNames[month]} ${year}</h4>
                    ${panelNum === 2 ? `<button class="calendar-nav-btn" onclick="navigateAnalyticsCalendar(1)"><i class="fas fa-chevron-right"></i></button>` : '<div style="width: 28px;"></div>'}
                </div>
                <div class="calendar-weekdays">
                    ${dayNames.map(d => `<span class="calendar-weekday">${d}</span>`).join('')}
                </div>
                <div class="calendar-days">
            `;

            // Empty cells before first day
            for (let i = 0; i < firstDay; i++) {
                html += `<div class="calendar-day empty"></div>`;
            }

            // Days of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const currentDate = new Date(year, month, day);
                currentDate.setHours(0, 0, 0, 0);

                let classes = ['calendar-day'];

                // Check if today
                if (currentDate.getTime() === today.getTime()) {
                    classes.push('today');
                }

                // Check if selected start
                if (analyticsDateRange.startDate && currentDate.getTime() === analyticsDateRange.startDate.getTime()) {
                    classes.push('selected', 'range-start');
                }

                // Check if selected end
                if (analyticsDateRange.endDate && currentDate.getTime() === analyticsDateRange.endDate.getTime()) {
                    classes.push('selected', 'range-end');
                }

                // Check if in range
                if (analyticsDateRange.startDate && analyticsDateRange.endDate &&
                    currentDate > analyticsDateRange.startDate && currentDate < analyticsDateRange.endDate) {
                    classes.push('in-range');
                }

                // Check if temp selection (while selecting)
                if (analyticsDateRange.isSelecting && analyticsDateRange.tempStartDate) {
                    if (currentDate.getTime() === analyticsDateRange.tempStartDate.getTime()) {
                        classes.push('selected', 'range-start');
                    }
                }

                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                html += `<div class="${classes.join(' ')}" data-date="${dateStr}" onclick="selectAnalyticsDate('${dateStr}')">${day}</div>`;
            }

            html += `</div>`;
            return html;
        }

        window.navigateAnalyticsCalendar = function(direction) {
            // Move both months by direction
            analyticsDateRange.calendarMonth1 = new Date(
                analyticsDateRange.calendarMonth1.getFullYear(),
                analyticsDateRange.calendarMonth1.getMonth() + direction,
                1
            );
            analyticsDateRange.calendarMonth2 = new Date(
                analyticsDateRange.calendarMonth2.getFullYear(),
                analyticsDateRange.calendarMonth2.getMonth() + direction,
                1
            );
            renderAnalyticsCalendars();
        };

        window.selectAnalyticsDate = function(dateStr) {
            const selectedDate = new Date(dateStr + 'T00:00:00');

            if (!analyticsDateRange.startDate || (analyticsDateRange.startDate && analyticsDateRange.endDate)) {
                // Start new selection
                analyticsDateRange.startDate = selectedDate;
                analyticsDateRange.endDate = null;
                analyticsDateRange.isSelecting = true;
                analyticsDateRange.tempStartDate = selectedDate;
            } else if (analyticsDateRange.startDate && !analyticsDateRange.endDate) {
                // Complete selection
                if (selectedDate < analyticsDateRange.startDate) {
                    // If selected date is before start, swap
                    analyticsDateRange.endDate = analyticsDateRange.startDate;
                    analyticsDateRange.startDate = selectedDate;
                } else {
                    analyticsDateRange.endDate = selectedDate;
                }
                analyticsDateRange.isSelecting = false;
                analyticsDateRange.tempStartDate = null;
            }

            // Update display
            updateDateRangeDisplay();
            renderAnalyticsCalendars();
        };

        function updateDateRangeDisplay() {
            const display = document.getElementById('selected-range-display');
            if (!display) return;

            const formatDateDisplay = (date) => {
                if (!date) return '';
                return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            };

            if (analyticsDateRange.startDate && analyticsDateRange.endDate) {
                display.textContent = `${formatDateDisplay(analyticsDateRange.startDate)} → ${formatDateDisplay(analyticsDateRange.endDate)}`;
            } else if (analyticsDateRange.startDate) {
                display.textContent = `${formatDateDisplay(analyticsDateRange.startDate)} → Select end date`;
            } else {
                display.textContent = 'Select date range';
            }
        }

        window.clearAnalyticsDateRange = function() {
            analyticsDateRange.startDate = null;
            analyticsDateRange.endDate = null;
            analyticsDateRange.isSelecting = false;
            analyticsDateRange.tempStartDate = null;
            updateDateRangeDisplay();
            renderAnalyticsCalendars();
        };

        window.applyAnalyticsDateRange = function() {
            if (!analyticsDateRange.startDate || !analyticsDateRange.endDate) {
                alert('Please select both start and end dates');
                return;
            }

            analyticsDateRange.period = 'custom';

            // Close calendar
            const container = document.getElementById('analytics-calendar-container');
            if (container) container.style.display = 'none';

            // Re-render analytics (don't auto-load - user must click Apply)
            renderAnalytics();
            // NOTE: Auto-load removed - user must click Apply
        };

        // Close calendar when clicking outside
        document.addEventListener('click', function(e) {
            const container = document.getElementById('analytics-calendar-container');
            const customBtn = document.querySelector('.analytics-period-btn.custom');
            if (container && container.style.display !== 'none') {
                if (!container.contains(e.target) && e.target !== customBtn && !customBtn?.contains(e.target)) {
                    container.style.display = 'none';
                }
            }
        });

        function renderStores() {
            const stores = [
                { name: 'VSU Miramar', address: '8250 Camino Santa Fe, San Diego, CA 92121', manager: 'Marcus Rodriguez', employees: 6, status: 'open', isHQ: true },
                { name: 'VSU Morena', address: '5050 Morena Blvd, San Diego, CA 92117', manager: 'Lauren Barrantes', employees: 5, status: 'open', isHQ: false },
                { name: 'VSU Kearny Mesa', address: '4747 Convoy St, San Diego, CA 92111', manager: 'James Thompson', employees: 5, status: 'open', isHQ: false },
                { name: 'VSU Chula Vista', address: '555 Broadway, Chula Vista, CA 91910', manager: 'Amanda Lopez', employees: 4, status: 'open', isHQ: false },
                { name: 'VSU North Park', address: '3000 University Ave, San Diego, CA 92104', manager: 'Pending', employees: 3, status: 'open', isHQ: false }
            ];

            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Store Management</h2>
                        <p class="section-subtitle">Manage your VSU locations</p>
                    </div>
                </div>

                <div class="stores-grid">
                    ${stores.map(store => `
                        <div class="store-card ${store.isHQ ? 'hq' : ''}">
                            ${store.isHQ ? '<div class="hq-badge">HEADQUARTERS</div>' : ''}
                            <div class="store-card-header">
                                <h3>${store.name}</h3>
                                <span class="store-status ${store.status}">${store.status}</span>
                            </div>
                            <div class="store-card-body">
                                <div class="store-info-row">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${store.address}</span>
                                </div>
                                <div class="store-info-row">
                                    <i class="fas fa-user-tie"></i>
                                    <span>Manager: ${store.manager}</span>
                                </div>
                                <div class="store-info-row">
                                    <i class="fas fa-users"></i>
                                    <span>${store.employees} Employees</span>
                                </div>
                            </div>
                            <div class="store-card-footer">
                                <button class="btn-secondary">View Details</button>
                                <button class="btn-icon"><i class="fas fa-edit"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function renderAnnouncements() {
            const dashboard = document.querySelector('.dashboard');

            // Get current user for author info
            const user = authManager.getCurrentUser();
            const authorName = user?.name || user?.email?.split('@')[0] || 'Unknown';
            const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Announcements</h2>
                        <p class="section-subtitle">Company-wide communications</p>
                    </div>
                    <div class="page-header-right">
                        <button class="btn-primary floating-add-btn" onclick="openModal('add-announcement')">
                            <i class="fas fa-plus"></i> New Announcement
                        </button>
                    </div>
                </div>

                <div class="announcements-list">
                    <div class="announcement-card" style="border: 2px dashed var(--border-color); background: var(--bg-secondary);">
                        <div class="announcement-card-header">
                            <div class="announcement-author">
                                <div class="author-avatar">${authorInitials}</div>
                                <div class="author-info">
                                    <span class="author-name">${authorName}</span>
                                    <span class="announcement-date">New Announcement</span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 12px;">
                            <input type="text" class="form-input" id="new-announcement-title" placeholder="Announcement title..." style="font-size: 16px; font-weight: 600;">
                        </div>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <textarea class="form-input" id="new-announcement-content" placeholder="Write your announcement here..." style="min-height: 80px; resize: vertical;"></textarea>
                        </div>
                        <div style="display: flex; justify-content: flex-end;">
                            <button class="btn-primary" onclick="saveAnnouncementInline()">
                                <i class="fas fa-paper-plane"></i> Post Announcement
                            </button>
                        </div>
                    </div>

                    ${announcements.map(ann => {
                        const annAuthorInitials = (ann.author || 'UN').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                        const annId = ann.firestoreId || ann.id;
                        const likes = ann.likes || [];
                        const comments = ann.comments || [];
                        const currentUserId = user?.id || user?.odooId || user?.email;
                        const hasLiked = likes.some(l => l.odooId === currentUserId || l.odooId === user?.odooId || l.userId === currentUserId);
                        const likeCount = likes.length;
                        const commentCount = comments.length;
                        return `
                        <div class="announcement-card" data-id="${annId}">
                            <div class="announcement-card-header">
                                <div class="announcement-author">
                                    <div class="author-avatar">${annAuthorInitials}</div>
                                    <div class="author-info">
                                        <span class="author-name">${ann.author}</span>
                                        <span class="announcement-date">${formatDate(ann.date)}</span>
                                    </div>
                                </div>
                                <div class="announcement-actions">
                                    <button class="btn-icon" onclick="editAnnouncement('${annId}')"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon danger" onclick="deleteAnnouncement('${annId}')"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                            <h3 class="announcement-title">${ann.title}</h3>
                            <p class="announcement-content">${ann.content}</p>
                            ${ann.targetStores && ann.targetStores !== 'all' ? `<div class="announcement-stores" style="margin-top: 8px; font-size: 12px; color: var(--text-muted);"><i class="fas fa-store"></i> ${ann.targetStores}</div>` : ''}

                            <!-- Like and Comment Actions -->
                            <div class="announcement-interactions" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);">
                                <div class="interaction-buttons" style="display: flex; gap: 16px; margin-bottom: 12px;">
                                    <button class="interaction-btn ${hasLiked ? 'liked' : ''}" onclick="toggleAnnouncementLike('${annId}')" style="display: flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; color: ${hasLiked ? '#ef4444' : 'var(--text-muted)'}; font-size: 14px; padding: 8px 12px; border-radius: 8px; transition: all 0.2s;">
                                        <i class="${hasLiked ? 'fas' : 'far'} fa-heart" style="font-size: 18px;"></i>
                                        <span>${likeCount > 0 ? likeCount : ''} ${likeCount === 1 ? 'Like' : (likeCount > 1 ? 'Likes' : 'Like')}</span>
                                    </button>
                                    <button class="interaction-btn" onclick="toggleAnnouncementComments('${annId}')" style="display: flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 14px; padding: 8px 12px; border-radius: 8px; transition: all 0.2s;">
                                        <i class="far fa-comment" style="font-size: 18px;"></i>
                                        <span>${commentCount > 0 ? commentCount : ''} ${commentCount === 1 ? 'Comment' : (commentCount > 1 ? 'Comments' : 'Comment')}</span>
                                    </button>
                                </div>

                                ${likeCount > 0 ? `
                                <div class="likes-preview" style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
                                    <i class="fas fa-heart" style="color: #ef4444; margin-right: 4px;"></i>
                                    ${likes.slice(0, 3).map(l => l.name).join(', ')}${likeCount > 3 ? ` and ${likeCount - 3} more` : ''}
                                </div>
                                ` : ''}

                                <!-- Comments Section (Hidden by default) -->
                                <div class="comments-section" id="comments-${annId}" style="display: none;">
                                    <div class="comments-list" style="max-height: 300px; overflow-y: auto; margin-bottom: 12px;">
                                        ${comments.length > 0 ? comments.map(comment => {
                                            const commentInitials = (comment.author || 'UN').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                                            const isOwnComment = comment.odooId === currentUserId || comment.odooId === user?.odooId;
                                            return `
                                            <div class="comment-item" style="display: flex; gap: 10px; padding: 10px; background: var(--bg-secondary); border-radius: 10px; margin-bottom: 8px;">
                                                <div class="comment-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: var(--accent-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; flex-shrink: 0;">${commentInitials}</div>
                                                <div class="comment-content" style="flex: 1; min-width: 0;">
                                                    <div class="comment-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                                        <span class="comment-author" style="font-weight: 600; font-size: 13px; color: var(--text-primary);">${comment.author}</span>
                                                        <div style="display: flex; align-items: center; gap: 8px;">
                                                            <span class="comment-date" style="font-size: 11px; color: var(--text-muted);">${window.formatRelativeTime ? window.formatRelativeTime(comment.date) : comment.date}</span>
                                                            ${isOwnComment ? `<button onclick="deleteAnnouncementComment('${annId}', '${comment.id}')" style="background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 11px; padding: 2px;"><i class="fas fa-trash"></i></button>` : ''}
                                                        </div>
                                                    </div>
                                                    <p class="comment-text" style="margin: 0; font-size: 13px; color: var(--text-secondary); word-wrap: break-word;">${comment.text}</p>
                                                </div>
                                            </div>
                                            `;
                                        }).join('') : '<p style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 16px;">No comments yet. Be the first to comment!</p>'}
                                    </div>

                                    <!-- Add Comment Input -->
                                    <div class="add-comment" style="display: flex; gap: 10px; align-items: flex-start;">
                                        <div class="comment-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: var(--accent-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; flex-shrink: 0;">${authorInitials}</div>
                                        <div style="flex: 1; display: flex; gap: 8px;">
                                            <input type="text" class="form-input comment-input" id="comment-input-${annId}" placeholder="Write a comment..." style="flex: 1; padding: 10px 14px; font-size: 13px; border-radius: 20px;" onkeypress="if(event.key === 'Enter') addAnnouncementComment('${annId}')">
                                            <button onclick="addAnnouncementComment('${annId}')" style="background: var(--accent-primary); color: white; border: none; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                                <i class="fas fa-paper-plane" style="font-size: 14px;"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `}).join('')}
                </div>
            `;
        }
        // Expose renderAnnouncements globally for likes/comments
        window.renderAnnouncements = renderAnnouncements;

        /**
         * Delete announcement from Firebase
         */
        function deleteAnnouncement(announcementId) {
            const announcement = announcements.find(a => a.id === announcementId || a.firestoreId === announcementId);
            const title = announcement?.title || 'this announcement';

            showConfirmModal({
                title: 'Delete Announcement',
                message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
                confirmText: 'Delete',
                type: 'danger',
                onConfirm: async () => {
                    try {
                        if (firebaseAnnouncementsManager.isInitialized) {
                            const success = await firebaseAnnouncementsManager.deleteAnnouncement(announcementId);
                            if (success) {
                                // Log activity
                                if (typeof logActivity === 'function') {
                                    await logActivity(ACTIVITY_TYPES.DELETE, {
                                        message: `Deleted announcement: ${title}`,
                                        announcementTitle: title
                                    }, 'announcement', announcementId);
                                }
                                // Reload announcements from Firebase
                                const updatedAnnouncements = await firebaseAnnouncementsManager.loadAnnouncements();
                                announcements = updatedAnnouncements || [];
                                window.announcements = announcements;
                                console.log('Announcement deleted from Firebase');
                            }
                        } else {
                            // Fallback to local deletion
                            announcements = announcements.filter(a => a.id !== announcementId && a.firestoreId !== announcementId);
                        }

                        renderAnnouncements();
                        updateAnnouncementsBadge();
                        populateAnnouncementsDropdown();
                    } catch (error) {
                        console.error('Error deleting announcement:', error);
                    }
                }
            });
        }

        /**
         * Edit announcement - opens modal with pre-filled data
         */
        function editAnnouncement(announcementId) {
            const announcement = announcements.find(a => a.id === announcementId || a.firestoreId === announcementId);
            if (!announcement) {
                alert('Announcement not found');
                return;
            }

            // Open modal with edit content
            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2>Edit Announcement</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Title *</label>
                        <input type="text" class="form-input" id="edit-announcement-title" value="${announcement.title}" placeholder="Announcement title...">
                    </div>
                    <div class="form-group">
                        <label>Message *</label>
                        <textarea class="form-input" id="edit-announcement-content" rows="5" placeholder="Write your announcement...">${announcement.content}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Target Stores</label>
                        <select class="form-input" id="edit-announcement-stores">
                            <option value="all" ${announcement.targetStores === 'all' ? 'selected' : ''}>All Stores</option>
                            <option value="Miramar" ${announcement.targetStores === 'Miramar' ? 'selected' : ''}>VSU Miramar</option>
                            <option value="Morena" ${announcement.targetStores === 'Morena' ? 'selected' : ''}>VSU Morena</option>
                            <option value="Kearny Mesa" ${announcement.targetStores === 'Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                            <option value="Chula Vista" ${announcement.targetStores === 'Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                            <option value="North Park" ${announcement.targetStores === 'North Park' ? 'selected' : ''}>VSU North Park</option>
                            <option value="Santee" ${announcement.targetStores === 'Santee' ? 'selected' : ''}>VSU Santee</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                    <button class="btn-primary" onclick="updateAnnouncement('${announcementId}')">Update Announcement</button>
                </div>
            `;

            modal.classList.add('active');
        }

        /**
         * Update announcement in Firebase
         */
        async function updateAnnouncement(announcementId) {
            const title = document.getElementById('edit-announcement-title').value;
            const content = document.getElementById('edit-announcement-content').value;
            const targetStores = document.getElementById('edit-announcement-stores').value;

            if (!title || !content) {
                alert('Please fill in all required fields');
                return;
            }

            try {
                if (firebaseAnnouncementsManager.isInitialized) {
                    const success = await firebaseAnnouncementsManager.updateAnnouncement(announcementId, {
                        title,
                        content,
                        targetStores
                    });
                    if (success) {
                        // Log activity
                        if (typeof logActivity === 'function') {
                            await logActivity(ACTIVITY_TYPES.UPDATE, {
                                message: `Updated announcement: ${title}`,
                                announcementTitle: title,
                                targetStores: targetStores
                            }, 'announcement', announcementId);
                        }
                        // Reload announcements from Firebase
                        const updatedAnnouncements = await firebaseAnnouncementsManager.loadAnnouncements();
                        if (updatedAnnouncements && updatedAnnouncements.length > 0) {
                            announcements = updatedAnnouncements;
                            window.announcements = announcements;
                        }
                        console.log('Announcement updated in Firebase');
                    }
                } else {
                    // Fallback to local update
                    const index = announcements.findIndex(a => a.id === announcementId || a.firestoreId === announcementId);
                    if (index !== -1) {
                        announcements[index] = { ...announcements[index], title, content, targetStores };
                    }
                }

                closeModal();
                renderAnnouncements();
                updateAnnouncementsBadge();
                populateAnnouncementsDropdown();
            } catch (error) {
                console.error('Error updating announcement:', error);
                alert('Failed to update announcement. Please try again.');
            }
        }

        // ==========================================
        // ANNOUNCEMENT LIKES & COMMENTS
        // ==========================================

        /**
         * Toggle like on an announcement
         */
        async function toggleAnnouncementLike(announcementId) {
            const user = window.authManager?.getCurrentUser();
            if (!user) {
                alert('Please log in to like announcements');
                return;
            }

            const announcement = announcements.find(a => a.id === announcementId || a.firestoreId === announcementId);
            if (!announcement) return;

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
                    await window.firebaseAnnouncementsManager.updateAnnouncement(announcementId, { likes: updatedLikes });
                    // Reload announcements
                    const updated = await window.firebaseAnnouncementsManager.loadAnnouncements();
                    if (updated) {
                        announcements = updated;
                        window.announcements = updated;
                    }
                } else {
                    // Local update
                    announcement.likes = updatedLikes;
                }
                renderAnnouncements();
            } catch (error) {
                console.error('Error toggling like:', error);
            }
        }

        /**
         * Toggle comments section visibility
         */
        function toggleAnnouncementComments(announcementId) {
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
        }

        /**
         * Add a comment to an announcement
         */
        async function addAnnouncementComment(announcementId) {
            const user = window.authManager?.getCurrentUser();
            if (!user) {
                alert('Please log in to comment');
                return;
            }

            const input = document.getElementById(`comment-input-${announcementId}`);
            const text = input?.value?.trim();
            if (!text) return;

            const announcement = announcements.find(a => a.id === announcementId || a.firestoreId === announcementId);
            if (!announcement) return;

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
                    await window.firebaseAnnouncementsManager.updateAnnouncement(announcementId, { comments: updatedComments });
                    // Reload announcements
                    const updated = await window.firebaseAnnouncementsManager.loadAnnouncements();
                    if (updated) {
                        announcements = updated;
                        window.announcements = updated;
                    }
                } else {
                    announcement.comments = updatedComments;
                }
                renderAnnouncements();
                // Re-open comments section after render
                setTimeout(() => {
                    const commentsSection = document.getElementById(`comments-${announcementId}`);
                    if (commentsSection) commentsSection.style.display = 'block';
                }, 50);
            } catch (error) {
                console.error('Error adding comment:', error);
            }
        }

        /**
         * Delete a comment from an announcement
         */
        async function deleteAnnouncementComment(announcementId, commentId) {
            const announcement = announcements.find(a => a.id === announcementId || a.firestoreId === announcementId);
            if (!announcement) return;

            const updatedComments = (announcement.comments || []).filter(c => c.id !== commentId);

            try {
                if (window.firebaseAnnouncementsManager?.isInitialized) {
                    await window.firebaseAnnouncementsManager.updateAnnouncement(announcementId, { comments: updatedComments });
                    const updated = await window.firebaseAnnouncementsManager.loadAnnouncements();
                    if (updated) {
                        announcements = updated;
                        window.announcements = updated;
                    }
                } else {
                    announcement.comments = updatedComments;
                }
                renderAnnouncements();
                // Re-open comments section after render
                setTimeout(() => {
                    const commentsSection = document.getElementById(`comments-${announcementId}`);
                    if (commentsSection) commentsSection.style.display = 'block';
                }, 50);
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        }

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

        // Make functions globally accessible
        window.toggleAnnouncementLike = toggleAnnouncementLike;
        window.toggleAnnouncementComments = toggleAnnouncementComments;
        window.addAnnouncementComment = addAnnouncementComment;
        window.deleteAnnouncementComment = deleteAnnouncementComment;

        // ==========================================
        // CLOCK IN/OUT FUNCTIONALITY
        // ==========================================

        // Clock In attendance records storage
        let clockinAttendanceRecords = [];
        let currentClockAction = '';
        let clockInterval = null;
        let clockPollingInterval = null; // For real-time AJAX polling
        let attendanceSelectedDate = new Date(); // Selected date for attendance view

        // Load attendance records from Firebase
        async function loadAttendanceRecordsFromFirebase() {
            try {
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    const db = firebase.firestore();
                    const snapshot = await db.collection('attendanceRecords').orderBy('timestamp', 'desc').limit(500).get();
                    clockinAttendanceRecords = [];
                    snapshot.forEach(doc => {
                        clockinAttendanceRecords.push({ id: doc.id, ...doc.data() });
                    });
                    console.log('✅ Attendance records loaded from Firebase:', clockinAttendanceRecords.length);
                } else {
                    // Fallback to localStorage
                    clockinAttendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
                }
            } catch (error) {
                console.error('Error loading attendance from Firebase:', error);
                clockinAttendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
            }
        }

        // Save attendance record to Firebase
        async function saveAttendanceRecordToFirebase(record) {
            try {
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    const db = firebase.firestore();
                    const docRef = await db.collection('attendanceRecords').add({
                        ...record,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    record.id = docRef.id;
                    console.log('✅ Attendance record saved to Firebase:', docRef.id);
                }
                // Also save to localStorage as backup
                localStorage.setItem('attendanceRecords', JSON.stringify(clockinAttendanceRecords));
            } catch (error) {
                console.error('Error saving attendance to Firebase:', error);
                localStorage.setItem('attendanceRecords', JSON.stringify(clockinAttendanceRecords));
            }
        }

        // Update attendance record in Firebase
        async function updateAttendanceRecordInFirebase(recordId, updates) {
            try {
                if (typeof firebase !== 'undefined' && firebase.firestore && recordId) {
                    const db = firebase.firestore();
                    await db.collection('attendanceRecords').doc(recordId).update(updates);
                    console.log('✅ Attendance record updated in Firebase:', recordId);
                }
                localStorage.setItem('attendanceRecords', JSON.stringify(clockinAttendanceRecords));
            } catch (error) {
                console.error('Error updating attendance in Firebase:', error);
                localStorage.setItem('attendanceRecords', JSON.stringify(clockinAttendanceRecords));
            }
        }

        // Initialize attendance records on load
        loadAttendanceRecordsFromFirebase();

        // ==========================================
        // GEOFENCING FUNCTIONS FOR CLOCK IN/OUT
        // ==========================================

        /**
         * Get user's current location
         * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
         */
        async function getCurrentLocation() {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('Geolocation is not supported by this browser'));
                    return;
                }

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy
                        });
                    },
                    (error) => {
                        let errorMessage;
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = 'Location permission denied. Please enable location access.';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = 'Location information is unavailable.';
                                break;
                            case error.TIMEOUT:
                                errorMessage = 'Location request timed out.';
                                break;
                            default:
                                errorMessage = 'An unknown error occurred getting location.';
                        }
                        reject(new Error(errorMessage));
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000
                    }
                );
            });
        }

        /**
         * Calculate distance between two coordinates using Haversine formula
         * @param {number} lat1 - Latitude of point 1
         * @param {number} lon1 - Longitude of point 1
         * @param {number} lat2 - Latitude of point 2
         * @param {number} lon2 - Longitude of point 2
         * @returns {number} Distance in meters
         */
        function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371e3; // Earth's radius in meters
            const phi1 = lat1 * Math.PI / 180;
            const phi2 = lat2 * Math.PI / 180;
            const deltaPhi = (lat2 - lat1) * Math.PI / 180;
            const deltaLambda = (lon2 - lon1) * Math.PI / 180;

            const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                      Math.cos(phi1) * Math.cos(phi2) *
                      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return R * c; // Distance in meters
        }

        /**
         * Check if user is within store geofence
         * @param {string} storeName - Name of the store
         * @param {number} userLat - User's latitude
         * @param {number} userLon - User's longitude
         * @returns {{isWithinGeofence: boolean, distance: number, storeLocation: object}}
         */
        function checkGeofence(storeName, userLat, userLon) {
            const storeLocations = window.STORE_LOCATIONS || {};

            // Try to find the store location with flexible matching
            let storeLocation = storeLocations[storeName];
            let matchedStoreName = storeName;

            // If not found directly, try to match by partial name or variations
            if (!storeLocation) {
                const normalizedStoreName = storeName.toLowerCase().replace('vsu ', '').trim();

                for (const [key, location] of Object.entries(storeLocations)) {
                    const normalizedKey = key.toLowerCase().replace('vsu ', '').trim();
                    const normalizedLocationName = (location.name || '').toLowerCase().replace('vsu ', '').trim();

                    if (normalizedKey === normalizedStoreName ||
                        normalizedLocationName === normalizedStoreName ||
                        normalizedKey.includes(normalizedStoreName) ||
                        normalizedStoreName.includes(normalizedKey)) {
                        storeLocation = location;
                        matchedStoreName = key;
                        console.log(`📍 Matched store "${storeName}" to "${key}"`);
                        break;
                    }
                }
            }

            if (!storeLocation) {
                console.warn(`Store location not configured for: ${storeName}`);
                return {
                    isWithinGeofence: true, // Allow if store not configured
                    distance: 0,
                    storeLocation: null,
                    storeName: storeName,
                    error: 'Store location not configured'
                };
            }

            const distance = calculateDistance(
                userLat, userLon,
                storeLocation.latitude, storeLocation.longitude
            );

            const radius = storeLocation.radius || window.GEOFENCE_CONFIG?.defaultRadius || 100;
            const isWithinGeofence = distance <= radius;

            return {
                isWithinGeofence,
                distance: Math.round(distance),
                radius,
                storeLocation,
                storeName: matchedStoreName
            };
        }

        /**
         * Verify location for clock in/out
         * @param {string} storeName - Store to check against
         * @returns {Promise<{allowed: boolean, location: object, geofenceResult: object, message: string}>}
         */
        async function verifyClockLocation(storeName) {
            const geofenceConfig = window.GEOFENCE_CONFIG || { enabled: false };

            // If geofencing is disabled, still try to record location if configured
            if (!geofenceConfig.enabled && !geofenceConfig.recordLocationAlways) {
                return {
                    allowed: true,
                    location: null,
                    geofenceResult: null,
                    message: 'Geofencing disabled'
                };
            }

            try {
                const location = await getCurrentLocation();
                const geofenceResult = checkGeofence(storeName, location.latitude, location.longitude);

                // Get display name for store
                const displayStoreName = geofenceResult.storeLocation?.name || geofenceResult.storeName || storeName;

                if (geofenceResult.error === 'Store location not configured') {
                    // Store location not set up - allow but note it
                    return {
                        allowed: true,
                        location,
                        geofenceResult,
                        warning: true,
                        message: `Store "${displayStoreName}" location not configured. Location recorded.`
                    };
                }

                if (geofenceResult.isWithinGeofence) {
                    return {
                        allowed: true,
                        location,
                        geofenceResult,
                        message: `Location verified - you're at ${displayStoreName} (${geofenceResult.distance}m)`
                    };
                } else {
                    // Outside geofence
                    if (geofenceConfig.strictMode) {
                        return {
                            allowed: false,
                            location,
                            geofenceResult,
                            message: `You are ${geofenceResult.distance}m away from ${displayStoreName}. Must be within ${geofenceResult.radius}m to clock in.`
                        };
                    } else {
                        // Non-strict mode: warn but allow
                        return {
                            allowed: true,
                            location,
                            geofenceResult,
                            warning: true,
                            message: `Warning: You're ${geofenceResult.distance}m away from your assigned store (${displayStoreName}). This will be recorded.`
                        };
                    }
                }
            } catch (error) {
                console.error('Location error:', error);

                // If we can't get location
                if (geofenceConfig.strictMode) {
                    return {
                        allowed: false,
                        location: null,
                        geofenceResult: null,
                        message: `Location required: ${error.message}`
                    };
                } else {
                    return {
                        allowed: true,
                        location: null,
                        geofenceResult: null,
                        warning: true,
                        message: `Could not verify location: ${error.message}`
                    };
                }
            }
        }

        /**
         * Format location for display
         * @param {object} locationData - Location data from clock record
         * @returns {string} Formatted location string
         */
        function formatLocationDisplay(locationData) {
            if (!locationData) return 'No location data';

            let display = '';
            if (locationData.isWithinGeofence) {
                display = `<span style="color: var(--success);"><i class="fas fa-map-marker-alt"></i> At store (${locationData.distance}m)</span>`;
            } else {
                display = `<span style="color: var(--danger);"><i class="fas fa-exclamation-triangle"></i> Off-site (${locationData.distance}m away)</span>`;
            }
            return display;
        }

        function renderClockIn() {
            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">
                            Clock In/Out
                            <span style="
                                display: inline-flex;
                                align-items: center;
                                gap: 6px;
                                padding: 4px 12px;
                                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                                border-radius: 20px;
                                font-size: 12px;
                                font-weight: 600;
                                color: white;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                margin-left: 12px;
                                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
                            ">
                                <span style="
                                    width: 8px;
                                    height: 8px;
                                    background: white;
                                    border-radius: 50%;
                                    animation: pulse-live 2s infinite;
                                "></span>
                                Live
                            </span>
                        </h2>
                        <p class="section-subtitle">Real-time employee attendance tracking</p>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <div class="search-filter">
                            <i class="fas fa-search"></i>
                            <input type="text" placeholder="Search employees..." id="attendanceSearch" onkeyup="filterAttendanceSearch()">
                        </div>
                    </div>
                </div>
                <style>
                    @keyframes pulse-live {
                        0%, 100% {
                            opacity: 1;
                            transform: scale(1);
                        }
                        50% {
                            opacity: 0.5;
                            transform: scale(1.2);
                        }
                    }
                </style>

                <!-- Current Time Display -->
                <div class="time-display-card">
                    <div class="current-time">
                        <div class="time-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="time-info">
                            <div class="current-date" id="currentDate">Loading...</div>
                            <div class="current-clock" id="currentClock">00:00:00 AM</div>
                        </div>
                    </div>
                </div>

                <!-- Quick Clock Actions -->
                <div class="clock-quick-actions">
                    <button class="clock-action-btn clock-in" onclick="showClockModal('in')">
                        <div class="action-icon">
                            <i class="fas fa-sign-in-alt"></i>
                        </div>
                        <span>Clock In</span>
                    </button>
                    <button class="clock-action-btn lunch-start" onclick="showClockModal('lunch-start')">
                        <div class="action-icon">
                            <i class="fas fa-utensils"></i>
                        </div>
                        <span>Start Lunch</span>
                    </button>
                    <button class="clock-action-btn lunch-end" onclick="showClockModal('lunch-end')">
                        <div class="action-icon">
                            <i class="fas fa-utensils"></i>
                        </div>
                        <span>End Lunch</span>
                    </button>
                    <button class="clock-action-btn clock-out" onclick="showClockModal('out')">
                        <div class="action-icon">
                            <i class="fas fa-sign-out-alt"></i>
                        </div>
                        <span>Clock Out</span>
                    </button>
                </div>

                <!-- Stats Grid -->
                <div class="attendance-stats-grid">
                    <div class="attendance-stat-card">
                        <div class="stat-icon-container clocked-in">
                            <i class="fas fa-user-check"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="clockedInCount">0</div>
                            <div class="stat-label">Clocked In</div>
                        </div>
                    </div>
                    <div class="attendance-stat-card">
                        <div class="stat-icon-container on-lunch">
                            <i class="fas fa-coffee"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="onLunchCount">0</div>
                            <div class="stat-label">On Lunch</div>
                        </div>
                    </div>
                    <div class="attendance-stat-card">
                        <div class="stat-icon-container clocked-out">
                            <i class="fas fa-user-clock"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="clockedOutCount">0</div>
                            <div class="stat-label">Clocked Out</div>
                        </div>
                    </div>
                    <div class="attendance-stat-card">
                        <div class="stat-icon-container total">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="totalEmployeesCount">0</div>
                            <div class="stat-label">Total Employees</div>
                        </div>
                    </div>
                </div>

                <!-- Attendance Table -->
                <div class="card">
                    <div class="card-header">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <h3 class="card-title" style="margin: 0;">
                                <i class="fas fa-clipboard-list"></i>
                                <span id="attendance-date-label">Today's Attendance</span>
                            </h3>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <button onclick="changeAttendanceDate(-1)" style="padding: 8px 12px; border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 8px; cursor: pointer; color: var(--text-primary);">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <input type="date" id="attendance-date-picker" onchange="setAttendanceDate(this.value)" style="padding: 8px 12px; border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 8px; color: var(--text-primary); font-family: 'Outfit', sans-serif; cursor: pointer;">
                                <button onclick="changeAttendanceDate(1)" style="padding: 8px 12px; border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 8px; cursor: pointer; color: var(--text-primary);">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                                <button onclick="goToTodayAttendance()" style="padding: 8px 16px; border: 1px solid var(--border-color); background: var(--accent-primary); color: white; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: 'Outfit', sans-serif;">
                                    Today
                                </button>
                            </div>
                        </div>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <select id="attendance-employee-filter" onchange="filterAttendanceByEmployee()" style="padding: 8px 16px; border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 8px; color: var(--text-primary); font-family: 'Outfit', sans-serif; cursor: pointer; min-width: 180px;">
                                <option value="">All Employees</option>
                            </select>
                            <button class="btn-secondary" onclick="exportAttendance()">
                                <i class="fas fa-download"></i>
                                Export
                            </button>
                            <button class="card-action" onclick="refreshAttendance()">
                                <i class="fas fa-sync"></i> Refresh
                            </button>
                        </div>
                    </div>
                    <div class="card-body" style="padding: 0;">
                        <div id="loadingAttendance" class="loading-state">
                            <div class="spinner"></div>
                            <span>Loading attendance...</span>
                        </div>
                        <div id="attendanceTableContainer" style="display: none;">
                            <table class="attendance-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Store</th>
                                        <th>Clock In</th>
                                        <th>Lunch Start</th>
                                        <th>Lunch End</th>
                                        <th>Clock Out</th>
                                        <th>Total Hours</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="attendanceTableBody">
                                </tbody>
                            </table>
                        </div>
                        <div id="emptyAttendanceState" class="empty-state" style="display: none;">
                            <i class="fas fa-clipboard"></i>
                            <h3>No attendance records today</h3>
                            <p>Records will appear here once employees clock in</p>
                        </div>
                    </div>
                </div>
            `;

            // Initialize clock and load data
            initializeClockIn();
        }

        function initializeClockIn() {
            updateClockDisplay();
            // Clear any existing intervals
            if (clockInterval) clearInterval(clockInterval);
            if (clockPollingInterval) clearInterval(clockPollingInterval);

            // Update clock display every second
            clockInterval = setInterval(updateClockDisplay, 1000);

            // Load initial data
            loadAttendanceData();

            // Start real-time polling for clock records (every 5 seconds)
            startClockInPolling();
        }

        /**
         * Start real-time AJAX polling to check for new clock in/out records
         */
        function startClockInPolling() {
            // Clear any existing polling interval
            if (clockPollingInterval) {
                clearInterval(clockPollingInterval);
            }

            // Poll every 5 seconds for real-time updates
            clockPollingInterval = setInterval(async () => {
                await pollForClockUpdates();
            }, 5000);

        }

        /**
         * Stop real-time polling
         */
        function stopClockInPolling() {
            if (clockPollingInterval) {
                clearInterval(clockPollingInterval);
                clockPollingInterval = null;
                console.log('⏹️ Real-time clock in/out polling stopped');
            }
        }

        /**
         * Poll Firebase for clock record updates
         */
        async function pollForClockUpdates() {
            try {
                // Use local date (not UTC) for consistency
                const today = new Date();
                const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                // Initialize Firebase if needed
                if (!firebaseClockInManager.isInitialized) {
                    await firebaseClockInManager.initialize();
                }

                // Load latest records from Firebase
                const firebaseRecords = await firebaseClockInManager.loadClockRecordsByDate(dateString);

                if (firebaseRecords.length > 0) {
                    const today = new Date().toDateString();
                    let hasUpdates = false;

                    // Check if there are any new or updated records
                    firebaseRecords.forEach(fbRecord => {
                        const localRecord = clockinAttendanceRecords.find(r =>
                            r.employeeName === fbRecord.employeeName && r.date === today
                        );

                        // Check if record is new or has been updated
                        if (!localRecord ||
                            localRecord.clockIn !== fbRecord.clockIn ||
                            localRecord.lunchStart !== fbRecord.lunchStart ||
                            localRecord.lunchEnd !== fbRecord.lunchEnd ||
                            localRecord.clockOut !== fbRecord.clockOut) {
                            hasUpdates = true;
                        }
                    });

                    // If updates detected, refresh the display
                    if (hasUpdates) {
                        console.log('🔄 New clock in/out updates detected, refreshing...');

                        // Update local records
                        const updatedRecords = [];
                        const processedNames = new Set();

                        firebaseRecords.forEach(rec => {
                            processedNames.add(rec.employeeName);
                            updatedRecords.push({
                                id: rec.id || Date.now(),
                                employeeId: rec.employeeId,
                                employeeName: rec.employeeName,
                                employeeRole: rec.employeeRole,
                                employeeInitials: rec.employeeName?.substring(0, 2).toUpperCase() || '',
                                store: rec.store,
                                date: today,
                                clockIn: rec.clockIn || null,
                                lunchStart: rec.lunchStart || null,
                                lunchEnd: rec.lunchEnd || null,
                                clockOut: rec.clockOut || null,
                                notes: rec.notes || ''
                            });
                        });

                        // Add any local-only records
                        clockinAttendanceRecords.forEach(localRec => {
                            if (!processedNames.has(localRec.employeeName) && localRec.date === today) {
                                updatedRecords.push(localRec);
                            }
                        });

                        clockinAttendanceRecords = updatedRecords;
                        // Sync to Firebase in background
                        saveAttendanceRecordsToFirebaseAll();

                        // Update UI with visual feedback
                        showRealtimeUpdateNotification();
                        updateClockInUI();
                    }
                }
            } catch (error) {
                // Silently fail to avoid console spam
                console.debug('Polling update check failed:', error);
            }
        }

        /**
         * Update Clock In UI elements
         */
        function updateClockInUI() {
            const today = new Date().toDateString();
            const todayRecords = clockinAttendanceRecords.filter(r => r.date === today);

            const tableContainer = document.getElementById('attendanceTableContainer');
            const emptyState = document.getElementById('emptyAttendanceState');

            if (todayRecords.length === 0) {
                if (tableContainer) tableContainer.style.display = 'none';
                if (emptyState) emptyState.style.display = 'flex';
            } else {
                if (tableContainer) tableContainer.style.display = 'block';
                if (emptyState) emptyState.style.display = 'none';
                renderAttendanceTableRows(todayRecords);
            }

            updateAttendanceStats(todayRecords);
        }

        /**
         * Show real-time update notification
         */
        function showRealtimeUpdateNotification() {
            // Create a subtle notification indicator
            const refreshBtn = document.querySelector('.card-action');
            if (refreshBtn && refreshBtn.innerHTML.includes('Refresh')) {
                // Add a pulsing dot to indicate new data
                const originalHTML = refreshBtn.innerHTML;
                refreshBtn.innerHTML = '<i class="fas fa-sync" style="color: var(--accent-primary);"></i> Updated';
                refreshBtn.style.color = 'var(--accent-primary)';

                // Reset after 2 seconds
                setTimeout(() => {
                    refreshBtn.innerHTML = originalHTML;
                    refreshBtn.style.color = '';
                }, 2000);
            }
        }

        function updateClockDisplay() {
            const now = new Date();
            const dateEl = document.getElementById('currentDate');
            const clockEl = document.getElementById('currentClock');

            if (!dateEl || !clockEl) return;

            // Format date
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateEl.textContent = now.toLocaleDateString('en-US', options);

            // Format time
            let hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;

            clockEl.textContent = `${padZeroTime(hours)}:${padZeroTime(minutes)}:${padZeroTime(seconds)} ${ampm}`;
        }

        function padZeroTime(num) {
            return num.toString().padStart(2, '0');
        }

        function showClockModal(action) {
            // No modal - directly submit with current user and time
            submitClockAction(action);
        }

        function closeClockModal() {
            // Not needed anymore, but kept for compatibility
        }

        async function submitClockAction(action = null) {
            // Use the action passed as parameter if available
            if (action) {
                currentClockAction = action;
            }

            // Get current logged-in user
            const currentUser = getCurrentUser();
            
            if (!currentUser || (!currentUser.userId && !currentUser.id)) {
                console.error('No user logged in');
                showNotification('Error: No user logged in', 'error');
                return;
            }

            // Get current time in 12-hour format (h:MM AM/PM)
            const now = new Date();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // Convert 0 to 12
            const time = `${hours}:${minutes} ${ampm}`;

            // Get employee info from current user
            // Priority: Name (main identifier) -> ID -> Email -> Create fallback
            let employee = null;
            
            // 1. First try to find by NAME (this is the primary identifier to avoid duplicates)
            if (currentUser.name) {
                employee = employees.find(e => e.name === currentUser.name);
            }
            
            // 2. If not found by name, try by ID
            if (!employee) {
                const userId = currentUser.userId || currentUser.id;
                if (userId) {
                    employee = employees.find(e => String(e.id) === String(userId));
                }
            }

            // 3. If still not found, try by authEmail
            if (!employee && currentUser.email) {
                employee = employees.find(e => e.authEmail === currentUser.email);
            }

            // 4. If still not found, create a minimal employee object
            if (!employee) {
                const userId = currentUser.userId || currentUser.id;
                console.warn('⚠️ Employee not found in database, creating fallback record');
                employee = {
                    id: userId,
                    name: currentUser.name || 'Current User',
                    role: currentUser.role || 'Employee',
                    initials: (currentUser.name || 'CU')?.substring(0, 2).toUpperCase() || 'CU',
                    store: currentUser.store || 'VSU Miramar',
                    email: currentUser.email
                };
            }

            const store = employee.store || 'VSU Miramar';

            // ==========================================
            // GEOFENCE VERIFICATION (DISABLED)
            // ==========================================
            // Geofencing has been disabled for simplicity
            let locationData = null;

            // Format date as YYYY-MM-DD for consistency (use local date, not UTC)
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`; // YYYY-MM-DD format (local time)
            const dateDisplayString = today.toDateString();

            // Find record by EMPLOYEE NAME (primary identifier to avoid duplicates)
            let record = clockinAttendanceRecords.find(r => r.employeeName === employee.name && r.date === dateDisplayString);

            // Create new record if doesn't exist
            if (!record) {
                record = {
                    id: Date.now(),
                    employeeId: employee.id,
                    employeeName: employee.name,
                    employeeRole: employee.role,
                    employeeInitials: employee.initials || employee.name?.substring(0, 2).toUpperCase() || '',
                    store: store,
                    date: dateDisplayString,
                    clockIn: null,
                    lunchStart: null,
                    lunchEnd: null,
                    clockOut: null,
                    notes: ''
                };
                clockinAttendanceRecords.push(record);
            } else {
                // Update existing record's store
                if (store) record.store = store;
            }

            // Update record based on action
            switch(currentClockAction) {
                case 'in':
                    if (record.clockIn) {
                        console.warn('Employee already clocked in today');
                        showNotification('You are already clocked in', 'warning');
                        return;
                    }
                    record.clockIn = time;
                    console.log('⏱️ Clocking in:', record.employeeName, 'at', time);
                    break;
                case 'lunch-start':
                    if (!record.clockIn) {
                        console.warn('Lunch start attempted without clock in');
                        showNotification('Please clock in first', 'warning');
                        return;
                    }
                    if (record.lunchStart) {
                        console.warn('Lunch break already started');
                        showNotification('Lunch break already started', 'warning');
                        return;
                    }
                    record.lunchStart = time;
                    console.log('🍽️ Lunch start:', record.employeeName, 'at', time);
                    break;
                case 'lunch-end':
                    if (!record.lunchStart) {
                        console.warn('Lunch break not started yet');
                        showNotification('Lunch break not started yet', 'warning');
                        return;
                    }
                    if (record.lunchEnd) {
                        console.warn('Lunch break already ended');
                        showNotification('Lunch break already ended', 'warning');
                        return;
                    }
                    record.lunchEnd = time;
                    console.log('🍽️ Lunch end:', record.employeeName, 'at', time);
                    break;
                case 'out':
                    if (!record.clockIn) {
                        console.warn('Clock out attempted without clock in');
                        showNotification('Please clock in first', 'warning');
                        return;
                    }
                    if (record.clockOut) {
                        console.warn('Employee already clocked out today');
                        showNotification('You are already clocked out', 'warning');
                        return;
                    }
                    record.clockOut = time;
                    console.log('⏱️ Clocking out:', record.employeeName, 'at', time);
                    break;
            }

            // Save to localStorage
            localStorage.setItem('attendanceRecords', JSON.stringify(clockinAttendanceRecords));

            // Save to Firebase
            try {
                // Initialize Firebase Clock In Manager if not already done
                if (!firebaseClockInManager.isInitialized) {
                    await firebaseClockInManager.initialize();
                }

                // Prepare clock record for Firebase
                // Use firestoreId if available for better matching with employees collection
                const firebaseRecord = {
                    employeeId: employee.firestoreId || employee.id,
                    employeeName: employee.name,
                    employeeRole: employee.role,
                    store: store,
                    date: dateString, // YYYY-MM-DD format (local time)
                    clockIn: record.clockIn,
                    lunchStart: record.lunchStart,
                    lunchEnd: record.lunchEnd,
                    clockOut: record.clockOut,
                    notes: record.notes || ''
                };

                // Add location data based on action type
                if (locationData) {
                    const actionLocationKey = `${currentClockAction}Location`;
                    firebaseRecord[actionLocationKey] = locationData;

                    // Also store the most recent location for easy access
                    firebaseRecord.lastLocation = locationData;
                    firebaseRecord.lastLocationAction = currentClockAction;
                }

                // Save to Firebase
                await firebaseClockInManager.saveClockRecord(firebaseRecord);
                
                // Reload from Firebase immediately to sync state across devices/reloads
                try {
                    const updatedRecords = await firebaseClockInManager.loadClockRecordsByDate(dateString);
                    
                    if (updatedRecords.length > 0) {
                        // Update local records with Firebase data
                        const today = new Date().toDateString();
                        const updatedArray = [];
                        const processedNames = new Set();
                        
                        updatedRecords.forEach(rec => {
                            processedNames.add(rec.employeeName);
                            updatedArray.push({
                                id: rec.id || Date.now(),
                                employeeId: rec.employeeId,
                                employeeName: rec.employeeName,
                                employeeRole: rec.employeeRole,
                                employeeInitials: rec.employeeName?.substring(0, 2).toUpperCase() || '',
                                store: rec.store,
                                date: today,
                                clockIn: rec.clockIn || null,
                                lunchStart: rec.lunchStart || null,
                                lunchEnd: rec.lunchEnd || null,
                                clockOut: rec.clockOut || null,
                                notes: rec.notes || ''
                            });
                        });
                        
                        // Add any local-only records
                        clockinAttendanceRecords.forEach(localRec => {
                            if (!processedNames.has(localRec.employeeName) && localRec.date === today) {
                                updatedArray.push(localRec);
                            }
                        });
                        
                        clockinAttendanceRecords = updatedArray;
                        localStorage.setItem('attendanceRecords', JSON.stringify(clockinAttendanceRecords));
                    }
                } catch (reloadError) {
                    console.warn('⚠️ Could not reload from Firebase after save:', reloadError);
                }
            } catch (error) {
                console.error('⚠️ Error saving to Firebase:', error);
                // Don't prevent saving to localStorage if Firebase fails
                // The user will still see success message but data is local only
            }

            // Log clock in/out activity
            try {
                if (typeof logActivity === 'function') {
                    const actionTypes = {
                        'in': ACTIVITY_TYPES.CLOCK_IN,
                        'out': ACTIVITY_TYPES.CLOCK_OUT,
                        'lunch-start': 'lunch_start',
                        'lunch-end': 'lunch_end'
                    };
                    const activityType = actionTypes[currentClockAction] || currentClockAction;
                    const actionMessages = {
                        'in': 'Clocked in',
                        'out': 'Clocked out',
                        'lunch-start': 'Started lunch break',
                        'lunch-end': 'Ended lunch break'
                    };
                    await logActivity(activityType, {
                        message: actionMessages[currentClockAction] || `Clock action: ${currentClockAction}`,
                        time: time,
                        store: store
                    }, 'clockin', record.id);
                }
            } catch (logError) {
                console.warn('⚠️ Failed to log clock activity:', logError);
            }

            // Show success message and reload
            showNotification('Action recorded successfully!', 'success');

            // Reload attendance table
            setTimeout(() => {
                loadAttendanceData();
            }, 500);
        }

        async function loadAttendanceData() {
            // Use selected date instead of always today
            const selectedDate = attendanceSelectedDate;
            const displayDate = selectedDate.toDateString();
            // Use local date (not UTC) for consistency with Schedule page
            const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

            // Update date picker and label
            const datePicker = document.getElementById('attendance-date-picker');
            const dateLabel = document.getElementById('attendance-date-label');
            if (datePicker) datePicker.value = dateString;
            if (dateLabel) {
                const today = new Date();
                const isToday = selectedDate.toDateString() === today.toDateString();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const isYesterday = selectedDate.toDateString() === yesterday.toDateString();

                if (isToday) {
                    dateLabel.textContent = "Today's Attendance";
                } else if (isYesterday) {
                    dateLabel.textContent = "Yesterday's Attendance";
                } else {
                    dateLabel.textContent = selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' Attendance';
                }
            }
            
            const loadingDiv = document.getElementById('loadingAttendance');
            const tableContainer = document.getElementById('attendanceTableContainer');
            const emptyState = document.getElementById('emptyAttendanceState');

            if (!loadingDiv) return;

            // Show loading
            loadingDiv.style.display = 'flex';
            tableContainer.style.display = 'none';
            emptyState.style.display = 'none';

            try {
                // Initialize Firebase Clock In Manager if not already done
                if (!firebaseClockInManager.isInitialized) {
                    await firebaseClockInManager.initialize();
                }

                // Try to load from Firebase first
                let firebaseRecords = [];
                try {
                    firebaseRecords = await firebaseClockInManager.loadClockRecordsByDate(dateString);
                    
                    // Merge Firebase records with local records intelligently
                    if (firebaseRecords.length > 0) {
                        // Create a map of Firebase records by EMPLOYEE NAME (primary identifier)
                        const firebaseMap = {};
                        firebaseRecords.forEach(rec => {
                            firebaseMap[rec.employeeName] = rec;
                        });
                        
                        // Update or add records
                        const updatedRecords = [];
                        const processedNames = new Set();
                        
                        // First, process Firebase records (they're latest)
                        firebaseRecords.forEach(rec => {
                            processedNames.add(rec.employeeName);
                            updatedRecords.push({
                                ...rec, // Include ALL fields from Firebase record (firestoreId, editHistory, etc.)
                                id: rec.id || rec.firestoreId || Date.now(),
                                employeeInitials: rec.employeeInitials || rec.employeeName?.substring(0, 2).toUpperCase() || '',
                                date: displayDate // Use display format for local tracking
                            });
                        });

                        // Then, add any local-only records
                        clockinAttendanceRecords.forEach(localRec => {
                            if (!processedNames.has(localRec.employeeName) && localRec.date === displayDate) {
                                updatedRecords.push(localRec);
                            }
                        });

                        clockinAttendanceRecords = updatedRecords;
                        // Save merged data to localStorage for fallback
                        localStorage.setItem('attendanceRecords', JSON.stringify(clockinAttendanceRecords));
                    }
                } catch (firebaseError) {
                    console.warn('⚠️ Could not load from Firebase, using local data:', firebaseError);
                    // Fall back to localStorage - filter only selected date's records
                    clockinAttendanceRecords = clockinAttendanceRecords.filter(r => r.date === displayDate);
                }
            } catch (error) {
                console.error('Error in loadAttendanceData:', error);
            }

            // Get selected date's records
            const dateRecords = clockinAttendanceRecords.filter(r => r.date === displayDate);

            // Simulate loading delay
            setTimeout(() => {
                loadingDiv.style.display = 'none';

                if (dateRecords.length === 0) {
                    emptyState.style.display = 'flex';
                } else {
                    tableContainer.style.display = 'block';
                    renderAttendanceTableRows(dateRecords);
                }

                updateAttendanceStats(dateRecords);
                populateEmployeeFilterDropdown();
            }, 300);
        }

        function renderAttendanceTableRows(records) {
            const tableBody = document.getElementById('attendanceTableBody');
            if (!tableBody) return;

            // Check if current user is admin or manager
            const currentUser = getCurrentUser();
            const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'manager';

            tableBody.innerHTML = records.map(record => {
                const status = getAttendanceStatus(record);
                const totalHours = calculateAttendanceTotalHours(record);
                const locationDisplay = getLocationDisplayForRecord(record);

                return `
                    <tr>
                        <td>
                            <div class="employee-table-info">
                                <div class="employee-table-avatar">${record.employeeInitials}</div>
                                <div class="employee-table-details">
                                    <div class="employee-table-name">${record.employeeName}</div>
                                    <div class="employee-table-role">${record.employeeRole}</div>
                                </div>
                            </div>
                        </td>
                        <td><span class="store-badge">${record.store}</span></td>
                        <td><span class="time-cell ${!record.clockIn ? 'empty' : ''}">${record.clockIn || '-'}</span></td>
                        <td><span class="time-cell ${!record.lunchStart ? 'empty' : ''}">${record.lunchStart || '-'}</span></td>
                        <td><span class="time-cell ${!record.lunchEnd ? 'empty' : ''}">${record.lunchEnd || '-'}</span></td>
                        <td><span class="time-cell ${!record.clockOut ? 'empty' : ''}">${record.clockOut || '-'}</span></td>
                        <td><span class="total-hours">${totalHours}</span></td>
                        <td>${locationDisplay}</td>
                        <td><span class="status-badge ${status.class}">${status.text}</span></td>
                        <td style="display: flex; gap: 4px;">
                            <button class="table-action-btn" onclick="viewAttendanceDetails('${record.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${canEdit ? `
                                <button class="table-action-btn" onclick="openEditClockRecordModal('${record.id}')" style="background: var(--accent-primary); color: white;" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `;
            }).join('');
        }

        /**
         * Get location display HTML for attendance record
         * @param {object} record - Attendance record
         * @returns {string} HTML for location display
         */
        function getLocationDisplayForRecord(record) {
            // Check for location data (check inLocation first, then lastLocation)
            const locationData = record.inLocation || record.lastLocation;

            if (!locationData) {
                return '<span style="color: var(--text-muted); font-size: 12px;"><i class="fas fa-question-circle"></i> N/A</span>';
            }

            if (locationData.isWithinGeofence === true) {
                return `<span style="color: var(--success); font-size: 12px;" title="Distance: ${locationData.distance}m">
                    <i class="fas fa-map-marker-alt"></i> At store
                </span>`;
            } else if (locationData.isWithinGeofence === false) {
                return `<span style="color: var(--danger); font-size: 12px;" title="Distance: ${locationData.distance}m from store">
                    <i class="fas fa-exclamation-triangle"></i> Off-site (${locationData.distance}m)
                </span>`;
            } else if (locationData.latitude && locationData.longitude) {
                return `<span style="color: var(--warning); font-size: 12px;" title="Lat: ${locationData.latitude.toFixed(4)}, Lon: ${locationData.longitude.toFixed(4)}">
                    <i class="fas fa-map-pin"></i> Recorded
                </span>`;
            }

            return '<span style="color: var(--text-muted); font-size: 12px;"><i class="fas fa-question-circle"></i> Unknown</span>';
        }

        function getAttendanceStatus(record) {
            if (record.clockOut) {
                return { text: 'Clocked Out', class: 'clocked-out' };
            }
            if (record.lunchStart && !record.lunchEnd) {
                return { text: 'On Lunch', class: 'on-lunch' };
            }
            if (record.clockIn) {
                return { text: 'Clocked In', class: 'clocked-in' };
            }
            return { text: 'Not Started', class: 'not-started' };
        }

        function calculateAttendanceTotalHours(record) {
            if (!record.clockIn) return '-';

            const clockIn = parseAttendanceTime(record.clockIn);
            const clockOut = record.clockOut ? parseAttendanceTime(record.clockOut) : new Date();

            let totalMinutes = (clockOut - clockIn) / 1000 / 60;

            // Subtract lunch time if applicable
            if (record.lunchStart && record.lunchEnd) {
                const lunchStart = parseAttendanceTime(record.lunchStart);
                const lunchEnd = parseAttendanceTime(record.lunchEnd);
                const lunchMinutes = (lunchEnd - lunchStart) / 1000 / 60;
                totalMinutes -= lunchMinutes;
            }

            const hours = Math.floor(totalMinutes / 60);
            const minutes = Math.floor(totalMinutes % 60);

            return `${hours}h ${minutes}m`;
        }

        function parseAttendanceTime(timeString) {
            const today = new Date();
            // Handle 12-hour format (e.g., "2:30 PM") or 24-hour format (e.g., "14:30")
            const match = timeString.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
            if (!match) return today;

            let hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const period = match[3];

            if (period) {
                // 12-hour format
                if (period.toUpperCase() === 'PM' && hours !== 12) {
                    hours += 12;
                } else if (period.toUpperCase() === 'AM' && hours === 12) {
                    hours = 0;
                }
            }

            today.setHours(hours, minutes, 0, 0);
            return today;
        }

        function updateAttendanceStats(records) {
            const clockedInCount = records.filter(r => r.clockIn && !r.clockOut).length;
            const onLunchCount = records.filter(r => r.lunchStart && !r.lunchEnd).length;
            const clockedOutCount = records.filter(r => r.clockOut).length;

            const clockedInEl = document.getElementById('clockedInCount');
            const onLunchEl = document.getElementById('onLunchCount');
            const clockedOutEl = document.getElementById('clockedOutCount');
            const totalEl = document.getElementById('totalEmployeesCount');

            if (clockedInEl) clockedInEl.textContent = clockedInCount;
            if (onLunchEl) onLunchEl.textContent = onLunchCount;
            if (clockedOutEl) clockedOutEl.textContent = clockedOutCount;
            if (totalEl) totalEl.textContent = employees.length;
        }

        async function viewAttendanceDetails(recordId) {
            const record = clockinAttendanceRecords.find(r => r.id === recordId);
            if (!record) return;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');
            const status = getAttendanceStatus(record);
            const totalHours = calculateAttendanceTotalHours(record);

            // Get the week's schedule for this employee
            let weeklyScheduleHTML = '';
            let totalScheduledHours = 0;
            try {
                const weekSchedule = await getEmployeeWeekSchedule(record.employeeId, record.date);
                if (weekSchedule.length > 0) {
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    weeklyScheduleHTML = `
                        <div style="margin-top: 24px; padding: 16px; background: var(--bg-secondary); border-radius: 12px;">
                            <div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-calendar-week" style="color: var(--accent-primary);"></i>
                                This Week's Schedule
                            </div>
                            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                                <thead>
                                    <tr style="border-bottom: 1px solid var(--border-color);">
                                        <th style="text-align: left; padding: 8px 4px; color: var(--text-muted); font-weight: 500;">Day</th>
                                        <th style="text-align: left; padding: 8px 4px; color: var(--text-muted); font-weight: 500;">Scheduled</th>
                                        <th style="text-align: right; padding: 8px 4px; color: var(--text-muted); font-weight: 500;">Hours</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${weekSchedule.map(day => {
                                        const isToday = day.dateStr === record.date;
                                        const rowStyle = isToday ? 'background: rgba(79, 70, 229, 0.1);' : '';
                                        totalScheduledHours += day.hours || 0;
                                        return `
                                            <tr style="${rowStyle}">
                                                <td style="padding: 8px 4px; font-weight: ${isToday ? '600' : '400'};">
                                                    ${dayNames[day.dayOfWeek]} ${day.dayNum}
                                                    ${isToday ? '<span style="color: var(--accent-primary); font-size: 10px; margin-left: 4px;">(Today)</span>' : ''}
                                                </td>
                                                <td style="padding: 8px 4px; color: ${day.scheduled ? 'var(--text-primary)' : 'var(--text-muted)'};">
                                                    ${day.scheduled ? `${day.startTime} - ${day.endTime}` : 'Off'}
                                                </td>
                                                <td style="padding: 8px 4px; text-align: right; font-weight: 500; color: ${day.hours ? 'var(--success)' : 'var(--text-muted)'};">
                                                    ${day.hours ? day.hours.toFixed(1) + 'h' : '-'}
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                                <tfoot>
                                    <tr style="border-top: 2px solid var(--border-color);">
                                        <td colspan="2" style="padding: 10px 4px; font-weight: 600; color: var(--text-primary);">Total Scheduled</td>
                                        <td style="padding: 10px 4px; text-align: right; font-weight: 700; color: var(--accent-primary); font-size: 15px;">
                                            ${totalScheduledHours.toFixed(1)}h
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    `;
                }
            } catch (err) {
                console.error('Error loading weekly schedule:', err);
            }

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2 style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-clock" style="color: var(--accent-primary);"></i>
                        Attendance Details
                    </h2>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <!-- Employee Info Header -->
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding: 20px; background: var(--bg-secondary); border-radius: 12px;">
                        <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 700;">
                            ${record.employeeName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 4px; font-size: 18px; font-weight: 600;">${record.employeeName}</h3>
                            <div style="font-size: 14px; color: var(--text-muted);">
                                <span style="margin-right: 16px;"><i class="fas fa-briefcase"></i> ${record.employeeRole || 'Employee'}</span>
                                <span><i class="fas fa-store"></i> ${record.store}</span>
                            </div>
                        </div>
                        <span class="status-badge" style="background: ${status.color}20; color: ${status.color}; padding: 8px 16px; border-radius: 20px; font-weight: 600;">
                            ${status.text}
                        </span>
                    </div>

                    <!-- Date and Total Hours -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                        <div style="padding: 20px; background: var(--bg-secondary); border-radius: 12px; text-align: center;">
                            <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">
                                <i class="fas fa-calendar"></i> Date
                            </div>
                            <div style="font-size: 18px; font-weight: 600;">${record.date}</div>
                        </div>
                        <div style="padding: 20px; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); border-radius: 12px; text-align: center; color: white;">
                            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 8px;">
                                <i class="fas fa-hourglass-half"></i> Total Hours
                            </div>
                            <div style="font-size: 24px; font-weight: 700;">${totalHours}</div>
                        </div>
                    </div>

                    <!-- Time Details -->
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px;">
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 10px; border-left: 4px solid #10b981;">
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Clock In</div>
                            <div style="font-size: 16px; font-weight: 600; color: #10b981;">${record.clockIn || '-'}</div>
                        </div>
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 10px; border-left: 4px solid #f59e0b;">
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Lunch Start</div>
                            <div style="font-size: 16px; font-weight: 600; color: #f59e0b;">${record.lunchStart || '-'}</div>
                        </div>
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 10px; border-left: 4px solid #f59e0b;">
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Lunch End</div>
                            <div style="font-size: 16px; font-weight: 600; color: #f59e0b;">${record.lunchEnd || '-'}</div>
                        </div>
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 10px; border-left: 4px solid #ef4444;">
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Clock Out</div>
                            <div style="font-size: 16px; font-weight: 600; color: #ef4444;">${record.clockOut || '-'}</div>
                        </div>
                    </div>

                    ${record.notes ? `
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 10px;">
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
                                <i class="fas fa-sticky-note"></i> Notes
                            </div>
                            <div style="font-size: 14px; line-height: 1.6; color: var(--text-secondary);">${record.notes}</div>
                        </div>
                    ` : ''}

                    ${weeklyScheduleHTML}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                </div>
            `;

            modal.classList.add('active');
        }

        // Helper function to get employee's weekly schedule
        async function getEmployeeWeekSchedule(employeeId, currentDateStr) {
            const db = firebase.firestore();
            const currentDate = new Date(currentDateStr);

            // Get the start of the week (Sunday)
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

            // Get all days of the week
            const weekDays = [];
            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(startOfWeek);
                dayDate.setDate(startOfWeek.getDate() + i);
                weekDays.push({
                    date: dayDate,
                    dateStr: dayDate.toDateString(),
                    dayOfWeek: i,
                    dayNum: dayDate.getDate(),
                    scheduled: false,
                    startTime: null,
                    endTime: null,
                    hours: 0
                });
            }

            // Format dates for query (YYYY-MM-DD format)
            const startDateKey = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`;
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            const endDateKey = `${endOfWeek.getFullYear()}-${String(endOfWeek.getMonth() + 1).padStart(2, '0')}-${String(endOfWeek.getDate()).padStart(2, '0')}`;

            try {
                // Query schedules for this employee in the date range
                const schedulesRef = db.collection(window.FIREBASE_COLLECTIONS?.schedules || 'schedules');
                const snapshot = await schedulesRef
                    .where('employeeId', '==', employeeId)
                    .where('date', '>=', startDateKey)
                    .where('date', '<=', endDateKey)
                    .get();

                snapshot.forEach(doc => {
                    const schedule = doc.data();
                    // Find the matching day in our weekDays array
                    const scheduleDate = new Date(schedule.date + 'T00:00:00');
                    const dayIndex = weekDays.findIndex(d =>
                        d.date.getFullYear() === scheduleDate.getFullYear() &&
                        d.date.getMonth() === scheduleDate.getMonth() &&
                        d.date.getDate() === scheduleDate.getDate()
                    );

                    if (dayIndex !== -1) {
                        weekDays[dayIndex].scheduled = true;
                        weekDays[dayIndex].startTime = schedule.startTime || schedule.shiftStart || '-';
                        weekDays[dayIndex].endTime = schedule.endTime || schedule.shiftEnd || '-';

                        // Calculate hours
                        if (schedule.startTime && schedule.endTime) {
                            const start = parseTimeToMinutes(schedule.startTime || schedule.shiftStart);
                            const end = parseTimeToMinutes(schedule.endTime || schedule.shiftEnd);
                            if (start !== null && end !== null) {
                                let diff = end - start;
                                if (diff < 0) diff += 24 * 60; // Handle overnight shifts
                                weekDays[dayIndex].hours = diff / 60;
                            }
                        }
                    }
                });
            } catch (err) {
                console.error('Error fetching weekly schedule:', err);
            }

            return weekDays;
        }

        // Helper to parse time string to minutes
        function parseTimeToMinutes(timeStr) {
            if (!timeStr) return null;
            // Handle formats like "9:00 AM", "14:00", "9:00a", etc.
            let hours, minutes;
            const isPM = /pm/i.test(timeStr);
            const isAM = /am/i.test(timeStr);
            const cleaned = timeStr.replace(/[ap]m/gi, '').trim();
            const parts = cleaned.split(':');

            if (parts.length >= 2) {
                hours = parseInt(parts[0]);
                minutes = parseInt(parts[1]);
            } else {
                hours = parseInt(cleaned);
                minutes = 0;
            }

            if (isNaN(hours)) return null;

            // Convert to 24-hour format if needed
            if (isPM && hours < 12) hours += 12;
            if (isAM && hours === 12) hours = 0;

            return hours * 60 + (minutes || 0);
        }

        function refreshAttendance() {
            loadAttendanceData();
        }

        // Date navigation functions for attendance
        window.changeAttendanceDate = function(days) {
            attendanceSelectedDate.setDate(attendanceSelectedDate.getDate() + days);
            loadAttendanceData();
        };

        window.setAttendanceDate = function(dateString) {
            // Parse the date string (YYYY-MM-DD) and create date in local timezone
            const [year, month, day] = dateString.split('-').map(Number);
            attendanceSelectedDate = new Date(year, month - 1, day);
            loadAttendanceData();
        };

        window.goToTodayAttendance = function() {
            attendanceSelectedDate = new Date();
            loadAttendanceData();
        };

        function exportAttendance() {
            const selectedDate = attendanceSelectedDate.toDateString();
            const dateRecords = clockinAttendanceRecords.filter(r => r.date === selectedDate);
            const dateStringForFile = `${attendanceSelectedDate.getFullYear()}-${String(attendanceSelectedDate.getMonth() + 1).padStart(2, '0')}-${String(attendanceSelectedDate.getDate()).padStart(2, '0')}`;

            if (dateRecords.length === 0) {
                alert('No attendance records to export for this date');
                return;
            }

            // Create CSV content
            let csv = 'Employee,Role,Store,Clock In,Lunch Start,Lunch End,Clock Out,Total Hours,Status\n';

            dateRecords.forEach(record => {
                const status = getAttendanceStatus(record);
                const totalHours = calculateAttendanceTotalHours(record);

                csv += `"${record.employeeName}","${record.employeeRole}","${record.store}",`;
                csv += `"${record.clockIn || '-'}","${record.lunchStart || '-'}","${record.lunchEnd || '-'}",`;
                csv += `"${record.clockOut || '-'}","${totalHours}","${status.text}"\n`;
            });

            // Download CSV
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_${dateStringForFile}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }

        function filterAttendanceSearch() {
            const searchInput = document.getElementById('attendanceSearch');
            if (!searchInput) return;

            const searchTerm = searchInput.value.toLowerCase();
            const selectedDate = attendanceSelectedDate.toDateString();
            let records = clockinAttendanceRecords.filter(r => r.date === selectedDate);

            if (searchTerm) {
                records = records.filter(r =>
                    r.employeeName.toLowerCase().includes(searchTerm) ||
                    r.employeeRole.toLowerCase().includes(searchTerm) ||
                    r.store.toLowerCase().includes(searchTerm)
                );
            }

            renderAttendanceTableRows(records);
            updateAttendanceStats(records);
        }

        // Populate employee filter dropdown
        function populateEmployeeFilterDropdown() {
            const dropdown = document.getElementById('attendance-employee-filter');
            if (!dropdown) return;

            // Get unique employees from all records
            const uniqueEmployees = new Map();
            clockinAttendanceRecords.forEach(record => {
                if (record.employeeName && !uniqueEmployees.has(record.employeeName)) {
                    uniqueEmployees.set(record.employeeName, {
                        name: record.employeeName,
                        store: record.store || ''
                    });
                }
            });

            // Also get employees from the employees array if available
            if (typeof employees !== 'undefined' && employees.length > 0) {
                employees.forEach(emp => {
                    if (emp.name && !uniqueEmployees.has(emp.name)) {
                        uniqueEmployees.set(emp.name, {
                            name: emp.name,
                            store: emp.store || emp.assignedStore || ''
                        });
                    }
                });
            }

            // Sort employees alphabetically
            const sortedEmployees = Array.from(uniqueEmployees.values()).sort((a, b) =>
                a.name.localeCompare(b.name)
            );

            // Preserve current selection
            const currentSelection = dropdown.value;

            // Build options HTML
            let html = '<option value="">All Employees</option>';
            sortedEmployees.forEach(emp => {
                const storeInfo = emp.store ? ` (${emp.store})` : '';
                html += `<option value="${emp.name}">${emp.name}${storeInfo}</option>`;
            });

            dropdown.innerHTML = html;

            // Restore selection if it still exists
            if (currentSelection && sortedEmployees.some(e => e.name === currentSelection)) {
                dropdown.value = currentSelection;
            }
        }

        // Filter attendance by selected employee
        window.filterAttendanceByEmployee = function() {
            const dropdown = document.getElementById('attendance-employee-filter');
            const selectedEmployee = dropdown?.value || '';
            const selectedDate = attendanceSelectedDate.toDateString();

            let records = clockinAttendanceRecords.filter(r => r.date === selectedDate);

            // Apply employee filter
            if (selectedEmployee) {
                records = records.filter(r => r.employeeName === selectedEmployee);
            }

            // Also apply search filter if there's a search term
            const searchInput = document.getElementById('attendanceSearch');
            const searchTerm = searchInput?.value?.toLowerCase() || '';
            if (searchTerm) {
                records = records.filter(r =>
                    r.employeeName.toLowerCase().includes(searchTerm) ||
                    r.employeeRole.toLowerCase().includes(searchTerm) ||
                    r.store.toLowerCase().includes(searchTerm)
                );
            }

            const tableContainer = document.getElementById('attendanceTableContainer');
            const emptyState = document.getElementById('emptyAttendanceState');

            if (records.length === 0) {
                if (tableContainer) tableContainer.style.display = 'none';
                if (emptyState) emptyState.style.display = 'flex';
            } else {
                if (tableContainer) tableContainer.style.display = 'block';
                if (emptyState) emptyState.style.display = 'none';
                renderAttendanceTableRows(records);
            }

            updateAttendanceStats(records);
        };

        // ==========================================
        // CLOCK RECORD EDITING (Admin/Manager Only)
        // ==========================================

        function openEditClockRecordModal(recordId) {
            // Search by id first, then by firestoreId as fallback
            let record = clockinAttendanceRecords.find(r => r.id === recordId);
            if (!record) {
                record = clockinAttendanceRecords.find(r => r.firestoreId === recordId);
            }
            if (!record) {
                showNotification('Record not found', 'error');
                console.error('Record not found for ID:', recordId, 'Available records:', clockinAttendanceRecords.map(r => ({ id: r.id, firestoreId: r.firestoreId, name: r.employeeName })));
                return;
            }

            const currentUser = getCurrentUser();
            if (currentUser?.role !== 'admin' && currentUser?.role !== 'manager') {
                showNotification('Only admins and managers can edit clock records', 'error');
                return;
            }

            // Convert time to 24h format for input fields
            const convertTo24h = (time12h) => {
                if (!time12h) return '';
                const match = time12h.match(/(\d+):(\d+)\s*(AM|PM)/i);
                if (!match) return '';
                let hours = parseInt(match[1]);
                const minutes = match[2];
                const period = match[3].toUpperCase();
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;
                return `${String(hours).padStart(2, '0')}:${minutes}`;
            };

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-edit" style="color: var(--accent-primary);"></i> Edit Clock Record</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div style="padding: 12px 16px; background: var(--bg-main); border-radius: 8px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent-primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                            ${record.employeeInitials || '??'}
                        </div>
                        <div>
                            <div style="font-weight: 600;">${record.employeeName}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">${record.store} - ${record.date}</div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label><i class="fas fa-sign-in-alt" style="color: #10b981;"></i> Clock In</label>
                            <input type="time" class="form-input" id="edit-clock-in" value="${convertTo24h(record.clockIn)}">
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-sign-out-alt" style="color: #ef4444;"></i> Clock Out</label>
                            <input type="time" class="form-input" id="edit-clock-out" value="${convertTo24h(record.clockOut)}">
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-utensils" style="color: #f59e0b;"></i> Lunch Start</label>
                            <input type="time" class="form-input" id="edit-lunch-start" value="${convertTo24h(record.lunchStart)}">
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-utensils" style="color: #f59e0b;"></i> Lunch End</label>
                            <input type="time" class="form-input" id="edit-lunch-end" value="${convertTo24h(record.lunchEnd)}">
                        </div>
                    </div>

                    <div class="form-group" style="margin-top: 16px;">
                        <label><i class="fas fa-sticky-note"></i> Edit Note (Optional)</label>
                        <textarea class="form-input" id="edit-clock-note" rows="2" placeholder="Reason for editing...">${record.editNote || ''}</textarea>
                    </div>

                    ${record.editHistory && record.editHistory.length > 0 ? `
                        <div style="margin-top: 16px; padding: 12px; background: var(--bg-main); border-radius: 8px;">
                            <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px;">
                                <i class="fas fa-history"></i> Edit History
                            </div>
                            ${record.editHistory.slice(-3).map(edit => `
                                <div style="font-size: 11px; color: var(--text-secondary); padding: 4px 0; border-bottom: 1px solid var(--border-color);">
                                    ${edit.editedBy} - ${new Date(edit.editedAt).toLocaleDateString()} - ${edit.changes}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                    <button class="btn-primary" onclick="saveClockRecordEdit('${recordId}')" style="background: linear-gradient(135deg, var(--accent-primary) 0%, #8b5cf6 100%);">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            `;
            modal.classList.add('active');
        }

        async function saveClockRecordEdit(recordId) {
            // Search by id first, then by firestoreId as fallback
            let record = clockinAttendanceRecords.find(r => r.id === recordId);
            if (!record) {
                record = clockinAttendanceRecords.find(r => r.firestoreId === recordId);
            }
            if (!record) {
                showNotification('Record not found', 'error');
                console.error('Save failed - Record not found for ID:', recordId);
                return;
            }

            const currentUser = getCurrentUser();

            // Get values from form
            const clockIn24 = document.getElementById('edit-clock-in')?.value;
            const clockOut24 = document.getElementById('edit-clock-out')?.value;
            const lunchStart24 = document.getElementById('edit-lunch-start')?.value;
            const lunchEnd24 = document.getElementById('edit-lunch-end')?.value;
            const editNote = document.getElementById('edit-clock-note')?.value?.trim();

            // Convert 24h to 12h format
            const convertTo12h = (time24) => {
                if (!time24) return null;
                const [hours, minutes] = time24.split(':');
                let h = parseInt(hours);
                const ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12;
                return `${h}:${minutes} ${ampm}`;
            };

            const newClockIn = convertTo12h(clockIn24);
            const newClockOut = convertTo12h(clockOut24);
            const newLunchStart = convertTo12h(lunchStart24);
            const newLunchEnd = convertTo12h(lunchEnd24);

            // Track changes
            const changes = [];
            if (record.clockIn !== newClockIn) changes.push(`Clock In: ${record.clockIn || '-'} → ${newClockIn || '-'}`);
            if (record.clockOut !== newClockOut) changes.push(`Clock Out: ${record.clockOut || '-'} → ${newClockOut || '-'}`);
            if (record.lunchStart !== newLunchStart) changes.push(`Lunch Start: ${record.lunchStart || '-'} → ${newLunchStart || '-'}`);
            if (record.lunchEnd !== newLunchEnd) changes.push(`Lunch End: ${record.lunchEnd || '-'} → ${newLunchEnd || '-'}`);

            if (changes.length === 0) {
                showNotification('No changes detected', 'info');
                closeModal();
                return;
            }

            // Prepare edit history entry
            const editEntry = {
                editedBy: currentUser?.name || 'Unknown',
                editedAt: new Date().toISOString(),
                changes: changes.join(', '),
                note: editNote || ''
            };

            // Update record
            record.clockIn = newClockIn;
            record.clockOut = newClockOut;
            record.lunchStart = newLunchStart;
            record.lunchEnd = newLunchEnd;
            record.editNote = editNote;
            record.editHistory = [...(record.editHistory || []), editEntry];
            record.lastEditedBy = currentUser?.name;
            record.lastEditedAt = new Date().toISOString();

            try {
                // Save to Firebase - use firestoreId if available, otherwise use recordId
                const firebaseDocId = record.firestoreId || recordId;
                if (typeof firebaseClockInManager !== 'undefined' && firebaseClockInManager.isInitialized) {
                    await firebaseClockInManager.updateClockRecord(firebaseDocId, {
                        clockIn: newClockIn,
                        clockOut: newClockOut,
                        lunchStart: newLunchStart,
                        lunchEnd: newLunchEnd,
                        editNote: editNote,
                        editHistory: record.editHistory,
                        lastEditedBy: currentUser?.name,
                        lastEditedAt: new Date().toISOString()
                    });
                }

                // Update local storage
                localStorage.setItem('attendanceRecords', JSON.stringify(clockinAttendanceRecords));

                showNotification('Clock record updated successfully!', 'success');
                closeModal();
                updateClockInUI();
            } catch (error) {
                console.error('Error saving clock record:', error);
                showNotification('Error saving changes. Please try again.', 'error');
            }
        }

        // Make edit functions globally accessible
        window.openEditClockRecordModal = openEditClockRecordModal;
        window.saveClockRecordEdit = saveClockRecordEdit;

        // ==========================================
        // END CLOCK IN/OUT FUNCTIONALITY
        // ==========================================

        function renderNewStuff() {
            const dashboard = document.querySelector('.dashboard');

            // Show loading state
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">New Stuff</h2>
                        <p class="section-subtitle">Incoming products and inventory</p>
                    </div>
                    <button class="btn-primary floating-add-btn" onclick="openModal('add-product')">
                        <i class="fas fa-plus"></i> Add Product
                    </button>
                </div>
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 16px;"></i>
                    <p>Loading products from Firebase...</p>
                </div>
            `;

            // Load products from Firebase
            loadProductsFromFirebase().then(() => {
                dashboard.innerHTML = `
                    <div class="page-header">
                        <div class="page-header-left">
                            <h2 class="section-title">New Stuff</h2>
                            <p class="section-subtitle">Incoming products</p>
                        </div>
                        <button class="btn-primary floating-add-btn" onclick="openModal('add-product')">
                            <i class="fas fa-plus"></i> Add Product
                        </button>
                    </div>

                    ${products.length === 0 ? `
                        <div style="text-align: center; padding: 60px 20px; background: var(--bg-hover); border-radius: 12px;">
                            <i class="fas fa-box-open" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                            <h3 style="color: var(--text-secondary);">No Products Yet</h3>
                            <p style="color: var(--text-muted); margin-bottom: 20px;">Add your first product to get started</p>
                            <button class="btn-primary floating-add-btn" onclick="openModal('add-product')">
                                <i class="fas fa-plus"></i> Add First Product
                            </button>
                        </div>
                    ` : `
                        <div class="employees-grid">
                            ${products.map(product => `
                                <div class="card" onclick="viewProductDetails('${product.id}')" style="cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='';">
                                    ${product.image ? `
                                        <div class="product-image-container" style="position: relative; width: 100%; height: 180px; overflow: hidden; border-radius: 12px 12px 0 0;">
                                            <img src="${product.image}"
                                                 alt="${product.name}"
                                                 style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;"
                                                 onerror="this.parentElement.style.display='none'">
                                        </div>
                                    ` : ''}
                                    <div class="card-header" style="background: rgba(139, 92, 246, 0.1); border-radius: ${product.image ? '0' : '12px 12px 0 0'};">
                                        <h3 class="card-title" style="font-size: 16px; font-weight: 600;">
                                            ${product.name}
                                        </h3>
                                    </div>
                                    <div class="card-body">
                                        <div style="display: flex; flex-direction: column; gap: 8px;">
                                            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-color);">
                                                <span style="color: var(--text-muted); font-size: 13px;">Category:</span>
                                                <span style="font-weight: 600; font-size: 13px;">${product.category || '-'}</span>
                                            </div>
                                            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-color);">
                                                <span style="color: var(--text-muted); font-size: 13px;">Est. Price:</span>
                                                <span style="font-weight: 600; font-size: 13px; color: var(--success);">$${product.price || 0}</span>
                                            </div>
                                            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-color);">
                                                <span style="color: var(--text-muted); font-size: 13px;">Est. Arrival:</span>
                                                <span style="font-weight: 600; font-size: 13px;">${product.arrivalDate ? formatDate(product.arrivalDate) : '-'}</span>
                                            </div>
                                            ${product.url ? `
                                                <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                                                    <span style="color: var(--text-muted); font-size: 13px;">More Info:</span>
                                                    <a href="${product.url}" target="_blank" onclick="event.stopPropagation();" style="font-weight: 600; font-size: 13px; color: var(--accent-primary); text-decoration: none;">
                                                        <i class="fas fa-external-link-alt"></i> View
                                                    </a>
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                    <div class="card-footer" style="padding: 12px 16px; border-top: 1px solid var(--border-color); text-align: center;">
                                        <span style="color: var(--text-muted); font-size: 12px;">
                                            <i class="fas fa-hand-pointer"></i> Click to view details
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                `;
            });
        }

        function viewProductDetails(productId) {
            const product = products.find(p => p.id === productId);
            if (!product) return;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2 style="display: flex; align-items: center; gap: 12px; margin: 0;">
                        <i class="fas fa-box" style="color: var(--accent-primary); font-size: 24px;"></i>
                        Product Details
                    </h2>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${product.image ? `
                        <div style="
                            margin-bottom: 24px;
                            border-radius: 16px;
                            overflow: hidden;
                            background: var(--bg-secondary);
                            position: relative;
                            aspect-ratio: 16 / 10;
                        ">
                            <img 
                                src="${product.image}" 
                                alt="${product.name}" 
                                style="
                                    width: 100%;
                                    height: 100%;
                                    object-fit: cover;
                                    display: block;
                                " 
                                onerror="this.style.display='none'">
                        </div>
                    ` : `
                        <div style="
                            margin-bottom: 24px;
                            border-radius: 16px;
                            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
                            height: 200px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            <i class="fas fa-image" style="font-size: 48px; color: rgba(255,255,255,0.5);"></i>
                        </div>
                    `}

                    <div style="margin-bottom: 24px;">
                        <h3 style="
                            margin: 0 0 8px 0;
                            font-size: 24px;
                            font-weight: 700;
                            color: var(--text-primary);
                        ">${product.name}</h3>
                        <p style="
                            margin: 0;
                            color: var(--text-muted);
                            font-size: 14px;
                        ">Product Reference ID: #${product.id}</p>
                    </div>

                    <div style="
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 16px;
                        margin-bottom: 24px;
                    ">
                        <!-- Category -->
                        <div style="
                            background: var(--bg-secondary);
                            border: 1px solid var(--border-color);
                            border-radius: 14px;
                            padding: 16px;
                            transition: all 0.2s ease;
                        ">
                            <div style="
                                color: var(--text-muted);
                                font-size: 11px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                margin-bottom: 8px;
                            ">Category</div>
                            <div style="
                                font-weight: 600;
                                font-size: 15px;
                                color: var(--text-primary);
                            ">${product.category || '-'}</div>
                        </div>

                        <!-- Estimated Price -->
                        <div style="
                            background: var(--bg-secondary);
                            border: 1px solid var(--border-color);
                            border-radius: 14px;
                            padding: 16px;
                            transition: all 0.2s ease;
                        ">
                            <div style="
                                color: var(--text-muted);
                                font-size: 11px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                margin-bottom: 8px;
                            ">Estimated Price</div>
                            <div style="
                                font-weight: 600;
                                font-size: 18px;
                                color: var(--success);
                            ">$${(product.price || 0).toFixed(2)}</div>
                        </div>

                        <!-- Estimated Arrival -->
                        <div style="
                            background: var(--bg-secondary);
                            border: 1px solid var(--border-color);
                            border-radius: 14px;
                            padding: 16px;
                        ">
                            <div style="
                                color: var(--text-muted);
                                font-size: 11px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                margin-bottom: 8px;
                            ">
                                <i class="fas fa-calendar" style="margin-right: 6px; font-size: 12px;"></i>Estimated Arrival
                            </div>
                            <div style="
                                font-weight: 600;
                                font-size: 15px;
                                color: var(--text-primary);
                            ">${product.arrivalDate ? formatDate(product.arrivalDate) : '-'}</div>
                        </div>

                        <!-- Supplier -->
                        <div style="
                            background: var(--bg-secondary);
                            border: 1px solid var(--border-color);
                            border-radius: 14px;
                            padding: 16px;
                        ">
                            <div style="
                                color: var(--text-muted);
                                font-size: 11px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                margin-bottom: 8px;
                            ">
                                <i class="fas fa-truck" style="margin-right: 6px; font-size: 12px;"></i>Supplier
                            </div>
                            <div style="
                                font-weight: 600;
                                font-size: 15px;
                                color: var(--text-primary);
                            ">${product.supplier || '-'}</div>
                        </div>
                    </div>

                    ${product.url ? `
                        <div style="
                            background: var(--bg-secondary);
                            border: 1px solid var(--border-color);
                            border-radius: 14px;
                            padding: 16px;
                            margin-bottom: 24px;
                        ">
                            <div style="
                                color: var(--text-muted);
                                font-size: 11px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                margin-bottom: 8px;
                            ">
                                <i class="fas fa-link" style="margin-right: 6px; font-size: 12px;"></i>Product URL
                            </div>
                            <a href="${product.url}" target="_blank" style="
                                font-weight: 600;
                                font-size: 14px;
                                color: var(--accent-primary);
                                text-decoration: none;
                                word-break: break-all;
                            ">${product.url} <i class="fas fa-external-link-alt" style="margin-left: 6px; font-size: 12px;"></i></a>
                        </div>
                    ` : ''}

                    ${product.description ? `
                        <div style="
                            background: var(--bg-secondary);
                            border: 1px solid var(--border-color);
                            border-radius: 14px;
                            padding: 16px;
                            margin-bottom: 24px;
                        ">
                            <div style="
                                color: var(--text-muted);
                                font-size: 11px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                margin-bottom: 12px;
                            ">Description</div>
                            <p style="
                                margin: 0;
                                line-height: 1.6;
                                color: var(--text-secondary);
                                font-size: 14px;
                            ">${product.description}</p>
                        </div>
                    ` : ''}

                    <div style="display: flex; gap: 12px;">
                        <button class="btn-primary" style="
                            flex: 1;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                            padding: 12px 16px;
                            border-radius: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            border: none;
                            transition: all 0.2s ease;
                        " onclick="closeModal(); editProduct('${product.id}');">
                            <i class="fas fa-edit"></i>
                            Edit Product
                        </button>
                        <button style="
                            flex: 1;
                            background: var(--danger);
                            color: white;
                            border: none;
                            padding: 12px 16px;
                            border-radius: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                            transition: all 0.2s ease;
                        " onclick="deleteProductFromFirebase('${product.id}'); closeModal();" onhover="this.style.opacity='0.9'">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            `;

            modal.classList.add('active');
        }

        // =====================================================
        // SUPPLIES MODULE
        // =====================================================

        let suppliesData = [];
        let suppliesCurrentStore = 'all';
        let suppliesCurrentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        let suppliesViewMode = 'gallery'; // 'gallery' or 'list'

        async function initializeSupplies() {
            if (!firebaseStorageHelper.isInitialized) {
                firebaseStorageHelper.initialize();
            }
            await loadSuppliesFromFirebase();
        }

        async function loadSuppliesFromFirebase() {
            try {
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    const db = firebase.firestore();
                    const snapshot = await db.collection('supplies').get();
                    suppliesData = [];
                    snapshot.forEach(doc => {
                        suppliesData.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    // Update badge after loading
                    if (typeof updateSuppliesBadge === 'function') {
                        updateSuppliesBadge();
                    }
                }
            } catch (error) {
                console.error('Error loading supplies:', error);
            }
        }

        async function saveSupplyToFirebase(supply) {
            try {
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    const db = firebase.firestore();
                    const docRef = await db.collection('supplies').add({
                        ...supply,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    return docRef.id;
                }
            } catch (error) {
                console.error('Error saving supply:', error);
                return null;
            }
        }

        async function updateSupplyInFirebase(id, data) {
            try {
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    const db = firebase.firestore();
                    await db.collection('supplies').doc(id).update(data);
                    return true;
                }
            } catch (error) {
                console.error('Error updating supply:', error);
                return false;
            }
        }

        async function deleteSupplyFromFirebase(id) {
            try {
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    const db = firebase.firestore();
                    await db.collection('supplies').doc(id).delete();
                    return true;
                }
            } catch (error) {
                console.error('Error deleting supply:', error);
                return false;
            }
        }

        window.renderSupplies = async function() {
            const dashboard = document.querySelector('.dashboard');
            const currentUser = getCurrentUser();
            const userStore = currentUser?.store || 'Miramar';
            const isAdmin = currentUser?.role === 'admin';
            const isMiramar = userStore === 'Miramar' || isAdmin;

            // Show loading state
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Supplies</h2>
                        <p class="section-subtitle">${isMiramar ? 'Distribution Center - Manage all store requests' : 'Request supplies from Miramar'}</p>
                    </div>
                </div>
                <div class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading supplies...</p>
                </div>
            `;

            // Load data
            await loadSuppliesFromFirebase();

            // Get stores list (VSU locations + other stores)
            const vsuStores = ['Miramar', 'Morena', 'Kearny Mesa', 'Chula Vista', 'North Park'];
            const otherStores = ['Loyal Vaper', 'Miramar Wine & Liquor'];

            // Filter supplies by store and month
            const filteredSupplies = suppliesData.filter(s => {
                const matchStore = suppliesCurrentStore === 'all' || s.store === suppliesCurrentStore;
                const itemMonth = s.createdAt?.toDate ? s.createdAt.toDate().toISOString().slice(0, 7) : s.month || suppliesCurrentMonth;
                const matchMonth = itemMonth === suppliesCurrentMonth;
                return matchStore && matchMonth;
            });

            // Separate by status (in_progress items treated as pending for backwards compatibility)
            // Sort pending by priority (critical first)
            const pendingSupplies = filteredSupplies
                .filter(s => s.status === 'pending' || s.status === 'in_progress')
                .sort((a, b) => {
                    if (a.priority === 'critical' && b.priority !== 'critical') return -1;
                    if (b.priority === 'critical' && a.priority !== 'critical') return 1;
                    return 0;
                });
            const partialSupplies = filteredSupplies.filter(s => s.status === 'partial');
            const completedSupplies = filteredSupplies.filter(s => s.status === 'completed' || s.status === 'purchased');
            const cancelledSupplies = filteredSupplies.filter(s => s.status === 'cancelled');

            // Status colors and labels
            const statusConfig = {
                pending: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: 'clock', label: 'Pending' },
                in_progress: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: 'clock', label: 'Pending' },
                partial: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', icon: 'exclamation-triangle', label: 'Partial' },
                completed: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: 'check-circle', label: 'Completed' },
                purchased: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: 'check-circle', label: 'Completed' },
                cancelled: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: 'times-circle', label: 'Cancelled' }
            };

            // Helper function to render supply card
            const renderSupplyCard = (item, showActions = true) => {
                const status = statusConfig[item.status] || statusConfig.pending;
                const canProcess = isMiramar && (item.status === 'pending' || item.status === 'in_progress');
                const canConfirm = item.store === userStore && item.status === 'partial';
                const isCritical = item.priority === 'critical';
                const cardBorderColor = isCritical && item.status === 'pending' ? '#ef4444' : status.color;

                return `
                    <div class="supply-card" style="background: var(--bg-secondary); border-radius: 16px; overflow: hidden; border: 1px solid ${isCritical && item.status === 'pending' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)'}; border-left: 4px solid ${cardBorderColor}; transition: all 0.3s; ${isCritical && item.status === 'pending' ? 'box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.1);' : ''}" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 16px rgba(0,0,0,0.1)';" onmouseout="this.style.transform='none'; this.style.boxShadow='${isCritical && item.status === 'pending' ? '0 0 0 1px rgba(239, 68, 68, 0.1)' : 'none'}';">
                        <div style="padding: 16px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 6px;">
                                <div style="display: flex; gap: 6px; align-items: center;">
                                    <div style="background: ${status.bg}; color: ${status.color}; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;">
                                        <i class="fas fa-${status.icon}"></i> ${status.label}
                                    </div>
                                    ${isCritical ? `<div style="background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; animation: ${item.status === 'pending' ? 'pulse-critical 2s infinite' : 'none'};">
                                        <i class="fas fa-exclamation-triangle"></i> CRITICAL
                                    </div>` : ''}
                                </div>
                                <span style="background: var(--bg-tertiary); padding: 4px 10px; border-radius: 6px; font-size: 12px; color: var(--text-secondary);">
                                    <i class="fas fa-store"></i> ${item.store}
                                </span>
                            </div>
                            <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.5; margin-bottom: 12px; max-height: 100px; overflow-y: auto;">${item.name || item.description}</div>
                            ${item.addedBy ? `<div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;"><i class="fas fa-user"></i> ${item.addedBy}</div>` : ''}
                            ${item.notes ? `<div style="font-size: 12px; color: #f97316; background: rgba(249, 115, 22, 0.1); padding: 8px; border-radius: 6px; margin-bottom: 12px;"><i class="fas fa-sticky-note"></i> ${item.notes}</div>` : ''}
                            ${item.createdAt ? `<div style="font-size: 11px; color: var(--text-muted);"><i class="fas fa-calendar"></i> ${formatDate(item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt)}</div>` : ''}

                            ${showActions ? `
                                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                                    ${canProcess && item.status === 'pending' ? `
                                        <button onclick="markSupplyCompleted('${item.id}')" style="flex: 1; min-width: 80px; padding: 8px 12px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                            <i class="fas fa-check"></i> Complete
                                        </button>
                                        <button onclick="openPartialModal('${item.id}')" style="flex: 1; min-width: 80px; padding: 8px 12px; background: #f97316; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                            <i class="fas fa-exclamation"></i> Partial
                                        </button>
                                    ` : ''}
                                    ${canConfirm ? `
                                        <button onclick="confirmSupplyReception('${item.id}')" style="flex: 1; min-width: 100px; padding: 8px 12px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                            <i class="fas fa-box-check"></i> Confirm Reception
                                        </button>
                                    ` : ''}
                                    ${item.status === 'pending' ? `
                                        <button onclick="editSupply('${item.id}')" style="padding: 8px 12px; background: var(--bg-tertiary); color: var(--accent-primary); border: none; border-radius: 6px; cursor: pointer; font-size: 12px;" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        ${isMiramar ? `
                                            <button onclick="cancelSupply('${item.id}')" style="padding: 8px 12px; background: var(--bg-tertiary); color: #ef4444; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;" title="Cancel">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        ` : ''}
                                    ` : ''}
                                    ${item.status === 'completed' || item.status === 'purchased' || item.status === 'cancelled' ? `
                                        <button onclick="deleteSupply('${item.id}')" style="padding: 8px 12px; background: var(--bg-tertiary); color: var(--text-muted); border: none; border-radius: 6px; cursor: pointer; font-size: 12px;" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            };

            // Helper function to render supply list item
            const renderSupplyListItem = (item) => {
                const status = statusConfig[item.status] || statusConfig.pending;
                const canProcess = isMiramar && (item.status === 'pending' || item.status === 'in_progress');
                const canConfirm = item.store === userStore && item.status === 'partial';
                const isCritical = item.priority === 'critical';
                const itemBorderColor = isCritical && item.status === 'pending' ? '#ef4444' : status.color;

                return `
                    <div class="supply-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 8px; border-left: 4px solid ${itemBorderColor}; ${isCritical && item.status === 'pending' ? 'border: 1px solid rgba(239, 68, 68, 0.2); border-left: 4px solid #ef4444;' : ''}">
                        <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
                            <div style="width: 36px; height: 36px; background: ${isCritical && item.status === 'pending' ? 'rgba(239, 68, 68, 0.15)' : status.bg}; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <i class="fas fa-${isCritical && item.status === 'pending' ? 'exclamation-triangle' : status.icon}" style="color: ${isCritical && item.status === 'pending' ? '#ef4444' : status.color}; font-size: 14px;"></i>
                            </div>
                            <div style="min-width: 0; flex: 1;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${(item.name || item.description).split('\n')[0]}</span>
                                    ${isCritical ? `<span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; flex-shrink: 0;">CRITICAL</span>` : ''}
                                </div>
                                <div style="font-size: 12px; color: var(--text-muted); display: flex; flex-wrap: wrap; gap: 8px;">
                                    <span><i class="fas fa-store"></i> ${item.store}</span>
                                    ${item.addedBy ? `<span><i class="fas fa-user"></i> ${item.addedBy}</span>` : ''}
                                </div>
                                ${item.notes ? `<div style="font-size: 11px; color: #f97316; margin-top: 4px;"><i class="fas fa-sticky-note"></i> ${item.notes}</div>` : ''}
                            </div>
                        </div>
                        <div style="display: flex; gap: 6px; flex-shrink: 0;">
                            ${canProcess && item.status === 'pending' ? `
                                <button class="btn-icon" onclick="markSupplyCompleted('${item.id}')" title="Complete" style="color: #10b981;">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn-icon" onclick="openPartialModal('${item.id}')" title="Mark Partial" style="color: #f97316;">
                                    <i class="fas fa-exclamation"></i>
                                </button>
                            ` : ''}
                            ${canConfirm ? `
                                <button class="btn-icon" onclick="confirmSupplyReception('${item.id}')" title="Confirm Reception" style="color: #10b981;">
                                    <i class="fas fa-box"></i>
                                </button>
                            ` : ''}
                            ${item.status === 'pending' ? `
                                <button class="btn-icon" onclick="editSupply('${item.id}')" title="Edit" style="color: var(--accent-primary);">
                                    <i class="fas fa-edit"></i>
                                </button>
                            ` : ''}
                            <button class="btn-icon" onclick="deleteSupply('${item.id}')" title="Delete" style="color: ${item.status === 'completed' || item.status === 'cancelled' ? 'var(--text-muted)' : '#ef4444'};">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            };

            dashboard.innerHTML = `
                <style>
                    @keyframes pulse-critical {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.6; }
                    }
                </style>
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title"><i class="fas fa-${isMiramar ? 'warehouse' : 'clipboard-list'}" style="margin-right: 10px;"></i>Supplies</h2>
                        <p class="section-subtitle">${isMiramar ? 'Distribution Center - Manage all store requests' : 'Request supplies from Miramar'}</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('add-supply')">
                        <i class="fas fa-plus"></i> Request Supplies
                    </button>
                </div>

                <!-- Filters -->
                <div class="filters-bar" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                        <select class="filter-select" id="supplies-store-filter" onchange="filterSuppliesByStore(this.value)">
                            <option value="all" ${suppliesCurrentStore === 'all' ? 'selected' : ''}>All Stores</option>
                            ${vsuStores.map(store => `
                                <option value="${store}" ${suppliesCurrentStore === store ? 'selected' : ''}>VSU ${store}</option>
                            `).join('')}
                            ${otherStores.map(store => `
                                <option value="${store}" ${suppliesCurrentStore === store ? 'selected' : ''}>${store}</option>
                            `).join('')}
                        </select>
                        <input type="month" class="form-input" id="supplies-month-filter" value="${suppliesCurrentMonth}" onchange="filterSuppliesByMonth(this.value)" style="width: auto;">
                    </div>
                    <div style="display: flex; gap: 4px; background: var(--bg-secondary); padding: 4px; border-radius: 8px;">
                        <button onclick="setSuppliesViewMode('gallery')" style="padding: 8px 12px; border: none; border-radius: 6px; cursor: pointer; background: ${suppliesViewMode === 'gallery' ? 'var(--accent-primary)' : 'transparent'}; color: ${suppliesViewMode === 'gallery' ? 'white' : 'var(--text-secondary)'}; transition: all 0.2s;">
                            <i class="fas fa-th-large"></i>
                        </button>
                        <button onclick="setSuppliesViewMode('list')" style="padding: 8px 12px; border: none; border-radius: 6px; cursor: pointer; background: ${suppliesViewMode === 'list' ? 'var(--accent-primary)' : 'transparent'}; color: ${suppliesViewMode === 'list' ? 'white' : 'var(--text-secondary)'}; transition: all 0.2s;">
                            <i class="fas fa-list"></i>
                        </button>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px;">
                    <div class="stat-card" style="cursor: pointer;" onclick="filterSuppliesByStatus('pending')">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">${pendingSupplies.length}</span>
                            <span class="stat-label">Pending</span>
                        </div>
                    </div>
                    <div class="stat-card" style="cursor: pointer;" onclick="filterSuppliesByStatus('partial')">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #f97316, #ea580c);">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">${partialSupplies.length}</span>
                            <span class="stat-label">Partial</span>
                        </div>
                    </div>
                    <div class="stat-card" style="cursor: pointer;" onclick="filterSuppliesByStatus('completed')">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">${completedSupplies.length}</span>
                            <span class="stat-label">Completed</span>
                        </div>
                    </div>
                </div>

                <!-- Pending Items - Grouped by Store -->
                ${pendingSupplies.length > 0 ? `
                    <div class="card" style="margin-bottom: 24px; border: 2px solid #f59e0b;">
                        <div class="card-header" style="background: rgba(245, 158, 11, 0.1);">
                            <h3 class="card-title" style="color: #f59e0b;"><i class="fas fa-clock"></i> Pending Requests (${pendingSupplies.length})</h3>
                        </div>
                        <div class="card-body">
                            ${(() => {
                                // Group pending by store
                                const pendingByStore = {};
                                pendingSupplies.forEach(item => {
                                    const store = item.store || 'Unknown';
                                    if (!pendingByStore[store]) pendingByStore[store] = [];
                                    pendingByStore[store].push(item);
                                });

                                const storeColors = {
                                    'Miramar': '#3b82f6',
                                    'Morena': '#06b6d4',
                                    'Kearny Mesa': '#f97316',
                                    'Chula Vista': '#10b981',
                                    'North Park': '#8b5cf6',
                                    'Loyal Vaper': '#ec4899',
                                    'Miramar Wine & Liquor': '#6366f1'
                                };

                                return Object.entries(pendingByStore).map(([store, items]) => `
                                    <div style="margin-bottom: 20px;">
                                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid ${storeColors[store] || '#6b7280'};">
                                            <div style="width: 14px; height: 14px; border-radius: 50%; background: ${storeColors[store] || '#6b7280'};"></div>
                                            <span style="font-weight: 700; font-size: 16px; color: ${storeColors[store] || '#6b7280'};">${store}</span>
                                            <span style="font-size: 13px; color: var(--text-muted);">(${items.length} items)</span>
                                        </div>
                                        ${suppliesViewMode === 'gallery' ? `
                                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                                                ${items.map(item => renderSupplyCard(item)).join('')}
                                            </div>
                                        ` : `
                                            <div class="supplies-list">
                                                ${items.map(item => renderSupplyListItem(item)).join('')}
                                            </div>
                                        `}
                                    </div>
                                `).join('');
                            })()}
                        </div>
                    </div>
                ` : ''}

                <!-- Partial - Needs Attention -->
                ${partialSupplies.length > 0 ? `
                    <div class="card" style="margin-bottom: 24px; border: 2px solid #f97316;">
                        <div class="card-header" style="background: rgba(249, 115, 22, 0.1);">
                            <h3 class="card-title" style="color: #f97316;"><i class="fas fa-exclamation-triangle"></i> Partial Delivery - Confirm Reception (${partialSupplies.length})</h3>
                        </div>
                        <div class="card-body">
                            ${suppliesViewMode === 'gallery' ? `
                                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                                    ${partialSupplies.map(item => renderSupplyCard(item)).join('')}
                                </div>
                            ` : `
                                <div class="supplies-list">
                                    ${partialSupplies.map(item => renderSupplyListItem(item)).join('')}
                                </div>
                            `}
                        </div>
                    </div>
                ` : ''}

                <!-- Completed History -->
                <div class="card">
                    <div class="card-header" style="cursor: pointer;" onclick="togglePurchasedHistory()">
                        <h3 class="card-title"><i class="fas fa-history"></i> Completed (${completedSupplies.length})</h3>
                        <i class="fas fa-chevron-down" id="purchased-history-chevron"></i>
                    </div>
                    <div class="card-body" id="purchased-history-body" style="display: none;">
                        ${completedSupplies.length > 0 ? `
                            <div class="supplies-list">
                                ${completedSupplies.map(item => `
                                    <div class="supply-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 8px; opacity: 0.7;">
                                        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                                            <div style="width: 36px; height: 36px; background: rgba(16, 185, 129, 0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                                <i class="fas fa-check" style="color: #10b981;"></i>
                                            </div>
                                            <div>
                                                <div style="font-weight: 500; color: var(--text-muted);">${(item.name || item.description).split('\n')[0]}</div>
                                                <div style="font-size: 12px; color: var(--text-muted);">
                                                    ${item.store} ${item.completedAt ? ` • ${formatDate(item.completedAt.toDate ? item.completedAt.toDate() : item.completedAt)}` : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <button class="btn-icon" onclick="deleteSupply('${item.id}')" title="Delete" style="color: var(--text-muted);">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                                <p>No completed requests this month.</p>
                            </div>
                        `}
                    </div>
                </div>

                ${pendingSupplies.length === 0 && partialSupplies.length === 0 ? `
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                        <i class="fas fa-box-open" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                        <h3 style="margin-bottom: 8px;">No Active Requests</h3>
                        <p>All supply requests have been fulfilled. Click "Request Supplies" to create a new request.</p>
                    </div>
                ` : ''}
            `;

            // Update sidebar badge
            updateSuppliesBadge();
        }

        window.togglePurchasedHistory = function() {
            const body = document.getElementById('purchased-history-body');
            const chevron = document.getElementById('purchased-history-chevron');
            if (body && chevron) {
                if (body.style.display === 'none') {
                    body.style.display = 'block';
                    chevron.style.transform = 'rotate(180deg)';
                } else {
                    body.style.display = 'none';
                    chevron.style.transform = 'rotate(0deg)';
                }
            }
        }

        window.filterSuppliesByStore = function(store) {
            suppliesCurrentStore = store;
            renderSupplies();
        }

        window.filterSuppliesByMonth = function(month) {
            suppliesCurrentMonth = month;
            renderSupplies();
        }

        window.setSuppliesViewMode = function(mode) {
            suppliesViewMode = mode;
            renderSupplies();
        }

        window.addSupply = async function() {
            const description = document.getElementById('supply-description').value.trim();
            const store = document.getElementById('supply-store').value;

            if (!description) {
                showNotification('Please describe what you need', 'error');
                return;
            }

            if (!store) {
                showNotification('Please select a store', 'error');
                return;
            }

            const user = getCurrentUser();
            const supply = {
                name: description,
                description: description,
                quantity: 1,
                store,
                status: 'pending',
                month: suppliesCurrentMonth,
                addedBy: user?.name || 'Unknown'
            };

            const id = await saveSupplyToFirebase(supply);
            if (id) {
                supply.id = id;
                suppliesData.push(supply);
                closeModal();
                renderSupplies();
                showNotification('Added to supplies list!', 'success');
            } else {
                showNotification('Error adding item. Please try again.', 'error');
            }
        }

        // Adjust quantity for supply item
        window.adjustSupplyQty = function(itemId, delta) {
            const input = document.getElementById(`qty-${itemId}`);
            if (input) {
                let val = parseInt(input.value) || 1;
                val = Math.max(1, Math.min(99, val + delta));
                input.value = val;
            }
            updateSupplySelectionCount();
        }

        // Update selection count display
        function updateSupplySelectionCount() {
            const checkboxes = document.querySelectorAll('.modal-body input[type="checkbox"]:checked');
            const countEl = document.getElementById('supply-selection-count');
            if (countEl) {
                const count = checkboxes.length;
                countEl.textContent = `${count} item${count !== 1 ? 's' : ''} selected`;
            }
        }

        // Add event listener for checkbox changes (called after modal opens)
        document.addEventListener('change', function(e) {
            if (e.target.type === 'checkbox' && e.target.id?.startsWith('supply-')) {
                updateSupplySelectionCount();
            }
        });

        // Add supplies from predefined list
        window.addSupplyFromList = async function() {
            const store = document.getElementById('supply-store')?.value;
            if (!store) {
                showNotification('Please select a store', 'error');
                return;
            }

            const checkboxes = document.querySelectorAll('.modal-body input[type="checkbox"]:checked');
            if (checkboxes.length === 0) {
                showNotification('Please select at least one item', 'error');
                return;
            }

            const user = getCurrentUser();
            let addedCount = 0;
            let hasCritical = false;

            // Collect all selected items
            const selectedItems = [];
            checkboxes.forEach(cb => {
                const itemId = cb.id.replace('supply-', '');
                const itemName = cb.dataset.name;
                const priority = cb.dataset.priority;
                const qtyInput = document.getElementById(`qty-${itemId}`);
                const qty = parseInt(qtyInput?.value) || 1;

                if (priority === 'critical') hasCritical = true;

                selectedItems.push({
                    name: `${qty}x ${itemName}`,
                    description: `${qty}x ${itemName}`,
                    quantity: qty,
                    store,
                    status: 'pending',
                    priority: priority,
                    month: suppliesCurrentMonth,
                    addedBy: user?.name || 'Unknown'
                });
            });

            // Add all items to Firebase
            for (const supply of selectedItems) {
                const id = await saveSupplyToFirebase(supply);
                if (id) {
                    supply.id = id;
                    suppliesData.push(supply);
                    addedCount++;
                }
            }

            closeModal();
            renderSupplies();

            if (addedCount > 0) {
                const criticalMsg = hasCritical ? ' (includes critical items)' : '';
                showNotification(`Added ${addedCount} item${addedCount !== 1 ? 's' : ''} to supplies list${criticalMsg}!`, 'success');
            } else {
                showNotification('Error adding items. Please try again.', 'error');
            }
        }

        window.editSupply = function(id) {
            const supply = suppliesData.find(s => s.id === id);
            if (supply) {
                openModal('edit-supply', supply);
            }
        }

        window.saveSupplyEdit = async function() {
            const id = document.getElementById('edit-supply-id').value;
            const description = document.getElementById('edit-supply-description').value.trim();
            const store = document.getElementById('edit-supply-store').value;

            if (!description) {
                showNotification('Please enter a description', 'error');
                return;
            }

            const success = await updateSupplyInFirebase(id, {
                name: description,
                description: description,
                store: store,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (success) {
                const item = suppliesData.find(s => s.id === id);
                if (item) {
                    item.name = description;
                    item.description = description;
                    item.store = store;
                }
                closeModal();
                renderSupplies();
                showNotification('Supply updated!', 'success');
            } else {
                showNotification('Error updating. Please try again.', 'error');
            }
        }

        window.markSupplyPurchased = async function(id) {
            const success = await updateSupplyInFirebase(id, {
                status: 'purchased',
                purchasedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (success) {
                const item = suppliesData.find(s => s.id === id);
                if (item) {
                    item.status = 'purchased';
                    item.purchasedAt = new Date();
                }
                renderSupplies();
                showNotification('Item marked as purchased!', 'success');
            }
        }

        window.deleteSupply = async function(id) {
            if (!confirm('Delete this item?')) return;

            const success = await deleteSupplyFromFirebase(id);
            if (success) {
                suppliesData = suppliesData.filter(s => s.id !== id);
                renderSupplies();
                showNotification('Item deleted', 'success');
            }
        }

        // Process supply - Miramar starts working on the request
        window.processSupply = async function(id) {
            const user = getCurrentUser();
            const success = await updateSupplyInFirebase(id, {
                status: 'in_progress',
                processedBy: user?.name || 'Unknown',
                processedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (success) {
                const item = suppliesData.find(s => s.id === id);
                if (item) {
                    item.status = 'in_progress';
                    item.processedBy = user?.name || 'Unknown';
                    item.processedAt = new Date();
                }
                renderSupplies();
                showNotification('Request is now being processed!', 'success');
            }
        }

        // Mark supply as completed - fully delivered
        window.markSupplyCompleted = async function(id) {
            const user = getCurrentUser();
            const success = await updateSupplyInFirebase(id, {
                status: 'completed',
                completedBy: user?.name || 'Unknown',
                completedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (success) {
                const item = suppliesData.find(s => s.id === id);
                if (item) {
                    item.status = 'completed';
                    item.completedBy = user?.name || 'Unknown';
                    item.completedAt = new Date();
                }
                renderSupplies();
                showNotification('Request marked as completed!', 'success');
                updateSuppliesBadge();
            }
        }

        // Open modal to add notes for partial delivery
        window.openPartialModal = function(id) {
            const supply = suppliesData.find(s => s.id === id);
            if (supply) {
                openModal('partial-supply', supply);
            }
        }

        // Mark supply as partial with notes
        window.markSupplyPartial = async function() {
            const id = document.getElementById('partial-supply-id').value;
            const notes = document.getElementById('partial-supply-notes').value.trim();

            if (!notes) {
                showNotification('Please explain what could not be delivered', 'error');
                return;
            }

            const user = getCurrentUser();
            const success = await updateSupplyInFirebase(id, {
                status: 'partial',
                notes: notes,
                partialBy: user?.name || 'Unknown',
                partialAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (success) {
                const item = suppliesData.find(s => s.id === id);
                if (item) {
                    item.status = 'partial';
                    item.notes = notes;
                    item.partialBy = user?.name || 'Unknown';
                    item.partialAt = new Date();
                }
                closeModal();
                renderSupplies();
                showNotification('Marked as partial delivery. Store will be notified.', 'success');
            }
        }

        // Confirm reception of partial delivery - store confirms they received what was sent
        window.confirmSupplyReception = async function(id) {
            if (!confirm('Confirm you received this partial delivery?')) return;

            const user = getCurrentUser();
            const success = await updateSupplyInFirebase(id, {
                status: 'completed',
                confirmedBy: user?.name || 'Unknown',
                confirmedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (success) {
                const item = suppliesData.find(s => s.id === id);
                if (item) {
                    item.status = 'completed';
                    item.confirmedBy = user?.name || 'Unknown';
                    item.confirmedAt = new Date();
                }
                renderSupplies();
                showNotification('Reception confirmed!', 'success');
                updateSuppliesBadge();
            }
        }

        // Cancel a supply request
        window.cancelSupply = async function(id) {
            if (!confirm('Cancel this supply request?')) return;

            const user = getCurrentUser();
            const success = await updateSupplyInFirebase(id, {
                status: 'cancelled',
                cancelledBy: user?.name || 'Unknown',
                cancelledAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (success) {
                const item = suppliesData.find(s => s.id === id);
                if (item) {
                    item.status = 'cancelled';
                    item.cancelledBy = user?.name || 'Unknown';
                    item.cancelledAt = new Date();
                }
                renderSupplies();
                showNotification('Request cancelled', 'success');
                updateSuppliesBadge();
            }
        }

        // Filter supplies by status (clicking on stat cards)
        let suppliesCurrentStatus = 'all';
        window.filterSuppliesByStatus = function(status) {
            suppliesCurrentStatus = status;
            renderSupplies();
        }

        // Update supplies badge in sidebar
        window.updateSuppliesBadge = async function() {
            const currentUser = getCurrentUser();
            const isMiramar = currentUser?.store === 'Miramar' || currentUser?.role === 'admin';

            // Count pending items that need attention
            let badgeCount = 0;
            if (isMiramar) {
                // Miramar sees all pending requests
                badgeCount = suppliesData.filter(s => s.status === 'pending' || s.status === 'in_progress').length;
            } else {
                // Other stores see their partial deliveries waiting confirmation
                badgeCount = suppliesData.filter(s => s.store === currentUser?.store && s.status === 'partial').length;
            }

            // Update badge in sidebar
            const suppliesLink = document.querySelector('.sidebar a[data-page="supplies"]');
            if (suppliesLink) {
                let badge = suppliesLink.querySelector('.supplies-badge');
                if (badgeCount > 0) {
                    if (!badge) {
                        badge = document.createElement('span');
                        badge.className = 'supplies-badge';
                        badge.style.cssText = 'background: #f59e0b; color: white; font-size: 11px; padding: 2px 6px; border-radius: 10px; margin-left: 8px; font-weight: 600;';
                        suppliesLink.appendChild(badge);
                    }
                    badge.textContent = badgeCount;
                } else if (badge) {
                    badge.remove();
                }
            }
        }

        // ============================================
        // VERSION CHECK - Auto-refresh notification
        // ============================================
        (function() {
            let currentVersion = null;
            const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

            async function checkForUpdates() {
                try {
                    const response = await fetch('/version.json?t=' + Date.now());
                    if (!response.ok) return;

                    const data = await response.json();

                    if (currentVersion === null) {
                        // First load - store the version
                        currentVersion = data.version;
                        console.log('App version:', currentVersion);
                    } else if (data.version !== currentVersion) {
                        // New version available!
                        showUpdateBanner();
                    }
                } catch (error) {
                    console.log('Version check skipped:', error.message);
                }
            }

            function showUpdateBanner() {
                // Don't show multiple banners
                if (document.getElementById('update-banner')) return;

                const banner = document.createElement('div');
                banner.id = 'update-banner';
                banner.innerHTML = `
                    <div style="position: fixed; top: 0; left: 0; right: 0; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 20px; display: flex; align-items: center; justify-content: center; gap: 16px; z-index: 99999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <i class="fas fa-arrow-circle-up" style="font-size: 20px;"></i>
                        <span style="font-weight: 500;">A new version is available!</span>
                        <button onclick="location.reload()" style="background: white; color: #6366f1; border: none; padding: 8px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: transform 0.2s;">
                            Refresh Now
                        </button>
                        <button onclick="this.parentElement.parentElement.remove()" style="background: transparent; border: none; color: white; cursor: pointer; padding: 8px; opacity: 0.8;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                document.body.prepend(banner);
            }

            // Start checking after page loads
            if (document.readyState === 'complete') {
                checkForUpdates();
            } else {
                window.addEventListener('load', checkForUpdates);
            }

            // Continue checking periodically
            setInterval(checkForUpdates, CHECK_INTERVAL);
        })();

