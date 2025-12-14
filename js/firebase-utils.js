/**
 * Firebase Utilities
 * Handles Firebase Firestore operations for employees and roles management
 */

// ==================== BUTTON LOCK UTILITY ====================

/**
 * Global Button Lock Manager
 * Prevents double-clicks on save/add/update buttons to avoid duplicate records
 */
class ButtonLockManager {
    constructor() {
        this.lockedButtons = new Set();
        this.defaultLockDuration = 5000; // 5 seconds
    }

    /**
     * Lock a button to prevent double-clicks
     * @param {HTMLElement|string} button - Button element or selector
     * @param {number} duration - Lock duration in milliseconds (default: 5000ms)
     * @returns {boolean} - True if button was locked, false if already locked
     */
    lock(button, duration = this.defaultLockDuration) {
        const btn = typeof button === 'string' ? document.querySelector(button) : button;
        if (!btn) return false;

        // Generate unique ID for tracking
        const btnId = btn.id || btn.dataset.lockId || `btn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        btn.dataset.lockId = btnId;

        // Check if already locked
        if (this.lockedButtons.has(btnId)) {
            return false;
        }

        // Lock the button
        this.lockedButtons.add(btnId);
        btn.disabled = true;
        btn.classList.add('btn-locked');

        // Store original content
        const originalContent = btn.innerHTML;
        const originalText = btn.textContent.trim();
        btn.dataset.originalContent = originalContent;

        // Show loading state
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${this._getLoadingText(originalText)}`;

        // Auto-unlock after duration
        setTimeout(() => {
            this.unlock(btn);
        }, duration);

        return true;
    }

    /**
     * Get appropriate loading text based on original button text
     */
    _getLoadingText(originalText) {
        const lowerText = originalText.toLowerCase();
        if (lowerText.includes('save') || lowerText.includes('guardar')) return 'Saving...';
        if (lowerText.includes('add') || lowerText.includes('añadir') || lowerText.includes('agregar')) return 'Adding...';
        if (lowerText.includes('update') || lowerText.includes('actualizar')) return 'Updating...';
        if (lowerText.includes('create') || lowerText.includes('crear')) return 'Creating...';
        if (lowerText.includes('submit') || lowerText.includes('enviar')) return 'Submitting...';
        if (lowerText.includes('delete') || lowerText.includes('eliminar') || lowerText.includes('borrar')) return 'Deleting...';
        if (lowerText.includes('confirm') || lowerText.includes('confirmar')) return 'Processing...';
        return 'Processing...';
    }

    /**
     * Unlock a button
     * @param {HTMLElement|string} button - Button element or selector
     */
    unlock(button) {
        const btn = typeof button === 'string' ? document.querySelector(button) : button;
        if (!btn) return;

        const btnId = btn.dataset.lockId;
        if (btnId) {
            this.lockedButtons.delete(btnId);
        }

        btn.disabled = false;
        btn.classList.remove('btn-locked');

        // Restore original content
        if (btn.dataset.originalContent) {
            btn.innerHTML = btn.dataset.originalContent;
            delete btn.dataset.originalContent;
        }
    }

    /**
     * Check if a button is locked
     * @param {HTMLElement|string} button - Button element or selector
     * @returns {boolean}
     */
    isLocked(button) {
        const btn = typeof button === 'string' ? document.querySelector(button) : button;
        if (!btn) return false;
        const btnId = btn.dataset.lockId;
        return btnId ? this.lockedButtons.has(btnId) : false;
    }

    /**
     * Wrap a function to automatically lock the button during execution
     * @param {HTMLElement} button - Button element
     * @param {Function} asyncFn - Async function to execute
     * @param {number} minLockDuration - Minimum lock duration in ms (default: 2000)
     */
    async withLock(button, asyncFn, minLockDuration = 2000) {
        if (!this.lock(button, 30000)) { // Lock for max 30 seconds
            return; // Button already locked
        }

        const startTime = Date.now();

        try {
            await asyncFn();
        } finally {
            // Ensure minimum lock duration
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minLockDuration - elapsed);

            setTimeout(() => {
                this.unlock(button);
            }, remaining);
        }
    }
}

// Global instance
const buttonLockManager = new ButtonLockManager();

/**
 * Helper function to lock a button (can be called from onclick)
 * @param {Event|HTMLElement} eventOrButton - Click event or button element
 * @param {number} duration - Lock duration in ms
 * @returns {boolean} - True if locked successfully, false if already locked
 */
function lockButton(eventOrButton, duration = 5000) {
    const button = eventOrButton?.target || eventOrButton?.currentTarget || eventOrButton;
    return buttonLockManager.lock(button, duration);
}

/**
 * Helper function to unlock a button
 * @param {HTMLElement|string} button - Button element or selector
 */
function unlockButton(button) {
    buttonLockManager.unlock(button);
}

// Add CSS for locked buttons
(function addButtonLockStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .btn-locked {
            opacity: 0.7 !important;
            cursor: not-allowed !important;
            pointer-events: none !important;
        }

        .btn-locked i.fa-spinner {
            margin-right: 6px;
        }
    `;
    document.head.appendChild(style);
})();

// ==================== FORM PROTECTION SYSTEM ====================

/**
 * Form Protection Manager
 * Prevents accidental form closure when data has been entered
 * Users must click the X button or Cancel to close
 */
class FormProtectionManager {
    constructor() {
        this.isInitialized = false;
        this.formHasData = false;
        this.protectedModals = new Set();
    }

    /**
     * Initialize the form protection system
     */
    initialize() {
        if (this.isInitialized) return;

        // Add styles for protection indicator
        const style = document.createElement('style');
        style.textContent = `
            /* Disable clicking outside modal when form has data */
            .modal.form-protected::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: -1;
                cursor: not-allowed;
            }

            /* Visual indicator that form has unsaved data */
            .modal.form-has-data .modal-content {
                box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.5), 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }

            .modal.form-has-data .modal-header {
                border-bottom-color: #f59e0b;
            }

            /* Unsaved indicator badge */
            .unsaved-indicator {
                display: none;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                background: #f59e0b20;
                color: #f59e0b;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                margin-left: auto;
                animation: pulseUnsaved 2s ease-in-out infinite;
            }

            .modal.form-has-data .unsaved-indicator {
                display: flex;
            }

            @keyframes pulseUnsaved {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }

            /* Confirmation overlay */
            .form-close-confirm-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(4px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100001;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.2s, visibility 0.2s;
            }

            .form-close-confirm-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            .form-close-confirm-box {
                background: var(--bg-primary, #1a1a2e);
                border-radius: 16px;
                padding: 24px;
                max-width: 400px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                border: 1px solid var(--border-color, rgba(255,255,255,0.1));
                transform: scale(0.9);
                transition: transform 0.2s;
            }

            .form-close-confirm-overlay.active .form-close-confirm-box {
                transform: scale(1);
            }

            .form-close-confirm-icon {
                width: 64px;
                height: 64px;
                background: #f59e0b20;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 16px;
            }

            .form-close-confirm-icon i {
                font-size: 28px;
                color: #f59e0b;
            }

            .form-close-confirm-title {
                font-size: 18px;
                font-weight: 600;
                color: var(--text-primary, #fff);
                margin-bottom: 8px;
            }

            .form-close-confirm-message {
                font-size: 14px;
                color: var(--text-muted, #888);
                margin-bottom: 20px;
                line-height: 1.5;
            }

            .form-close-confirm-buttons {
                display: flex;
                gap: 12px;
                justify-content: center;
            }

            .form-close-confirm-buttons button {
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
                border: none;
            }

            .form-close-confirm-buttons .btn-stay {
                background: var(--accent-primary, #6366f1);
                color: white;
            }

            .form-close-confirm-buttons .btn-stay:hover {
                background: var(--accent-secondary, #8b5cf6);
            }

            .form-close-confirm-buttons .btn-discard {
                background: var(--bg-secondary, #252542);
                color: var(--text-primary, #fff);
                border: 1px solid var(--border-color, rgba(255,255,255,0.1));
            }

            .form-close-confirm-buttons .btn-discard:hover {
                background: #ef4444;
                border-color: #ef4444;
            }
        `;
        document.head.appendChild(style);

        // Create confirmation overlay
        this.createConfirmOverlay();

        // Listen for input changes in modals
        document.addEventListener('input', (e) => this.handleInput(e), true);
        document.addEventListener('change', (e) => this.handleInput(e), true);

        // Intercept modal backdrop clicks
        this.interceptModalClicks();

        // Intercept Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.formHasData) {
                e.preventDefault();
                e.stopPropagation();
                this.showConfirmDialog();
            }
        }, true);

        this.isInitialized = true;
    }

    /**
     * Create the confirmation dialog overlay
     */
    createConfirmOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'form-close-confirm-overlay';
        overlay.id = 'form-close-confirm';
        overlay.innerHTML = `
            <div class="form-close-confirm-box">
                <div class="form-close-confirm-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="form-close-confirm-title">Unsaved Changes</div>
                <div class="form-close-confirm-message">
                    You have unsaved changes in this form. Are you sure you want to close without saving?
                </div>
                <div class="form-close-confirm-buttons">
                    <button class="btn-discard" onclick="formProtectionManager.confirmDiscard()">
                        <i class="fas fa-trash"></i> Discard
                    </button>
                    <button class="btn-stay" onclick="formProtectionManager.cancelDiscard()">
                        <i class="fas fa-edit"></i> Keep Editing
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        this.confirmOverlay = overlay;
    }

    /**
     * Get the currently active modal
     */
    getActiveModal() {
        // Check main modal first
        const mainModal = document.getElementById('modal');
        if (mainModal && mainModal.classList.contains('active')) {
            return mainModal;
        }

        // Check expense modal
        const expenseModal = document.getElementById('expenseModal');
        if (expenseModal && expenseModal.classList.contains('active')) {
            return expenseModal;
        }

        // Check for any other modals with .modal.active class
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            return activeModal;
        }

        return null;
    }

    /**
     * Handle input events to detect form data
     */
    handleInput(e) {
        const modal = this.getActiveModal();
        if (!modal) return;

        const target = e.target;

        // Check if input is inside modal
        if (!modal.contains(target)) return;

        // Check if it's a form input
        const isFormInput = target.matches('input, textarea, select');
        if (!isFormInput) return;

        // Check if form has any data
        this.checkFormData(modal);
    }

    /**
     * Check if form has data
     */
    checkFormData(modal) {
        const inputs = modal.querySelectorAll('input:not([type="hidden"]):not([type="button"]):not([type="submit"]), textarea, select');
        let hasData = false;

        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                // Skip checkboxes/radios for now
                return;
            }
            if (input.type === 'file') {
                if (input.files && input.files.length > 0) {
                    hasData = true;
                }
                return;
            }
            if (input.value && input.value.trim() !== '') {
                // Check if it's a default/placeholder value
                const defaultValue = input.getAttribute('data-default') || input.defaultValue || '';
                if (input.value !== defaultValue) {
                    hasData = true;
                }
            }
        });

        this.setFormHasData(hasData);
    }

    /**
     * Set form has data state
     */
    setFormHasData(hasData) {
        this.formHasData = hasData;
        const modal = this.getActiveModal();
        if (modal) {
            if (hasData) {
                modal.classList.add('form-has-data', 'form-protected');
            } else {
                modal.classList.remove('form-has-data', 'form-protected');
            }
        }
    }

    /**
     * Intercept modal backdrop clicks
     */
    interceptModalClicks() {
        // Intercept both click and mousedown (some handlers use mousedown)
        const interceptHandler = (e) => {
            const modal = this.getActiveModal();
            if (!modal) return;

            // Check if clicking on modal backdrop (not content)
            const isBackdropClick = e.target === modal ||
                                    e.target.classList.contains('modal-overlay') ||
                                    (e.target.classList.contains('modal') && e.target === modal);

            if (isBackdropClick && this.formHasData) {
                e.preventDefault();
                e.stopPropagation();
                this.showConfirmDialog();
                return false;
            }
        };

        document.addEventListener('click', interceptHandler, true);
        document.addEventListener('mousedown', interceptHandler, true);
    }

    /**
     * Show confirmation dialog
     */
    showConfirmDialog() {
        if (this.confirmOverlay) {
            this.confirmOverlay.classList.add('active');
        }
    }

    /**
     * Hide confirmation dialog
     */
    hideConfirmDialog() {
        if (this.confirmOverlay) {
            this.confirmOverlay.classList.remove('active');
        }
    }

    /**
     * Confirm discard - close form without saving
     */
    confirmDiscard() {
        // Store which modal was active before hiding dialog
        const activeModal = this.getActiveModal();
        const isExpenseModal = activeModal && activeModal.id === 'expenseModal';

        this.hideConfirmDialog();
        this.resetProtection();

        // Close the appropriate modal
        if (isExpenseModal && typeof closeExpenseModal === 'function') {
            closeExpenseModal();
        } else if (typeof closeModal === 'function') {
            closeModal(true);
        }
    }

    /**
     * Cancel discard - keep editing
     */
    cancelDiscard() {
        this.hideConfirmDialog();
    }

    /**
     * Reset protection state (call when form is saved or properly closed)
     */
    resetProtection() {
        this.formHasData = false;
        // Reset main modal
        const mainModal = document.getElementById('modal');
        if (mainModal) {
            mainModal.classList.remove('form-has-data', 'form-protected');
        }
        // Reset expense modal
        const expenseModal = document.getElementById('expenseModal');
        if (expenseModal) {
            expenseModal.classList.remove('form-has-data', 'form-protected');
        }
        // Reset any other active modal
        document.querySelectorAll('.modal.form-has-data, .modal.form-protected').forEach(m => {
            m.classList.remove('form-has-data', 'form-protected');
        });
    }

    /**
     * Check if form needs protection before closing
     * Returns true if should show confirmation, false if can close
     */
    shouldPreventClose() {
        return this.formHasData;
    }

    /**
     * Force close without confirmation (for cancel buttons)
     */
    forceClose() {
        this.resetProtection();
        if (typeof closeModal === 'function') {
            closeModal(true);
        }
    }
}

// Global instance
const formProtectionManager = new FormProtectionManager();

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => formProtectionManager.initialize());
} else {
    formProtectionManager.initialize();
}

/**
 * Safe close modal function - shows confirmation if form has data
 */
function safeCloseModal() {
    if (formProtectionManager.shouldPreventClose()) {
        formProtectionManager.showConfirmDialog();
    } else {
        formProtectionManager.resetProtection();
        if (typeof closeModal === 'function') {
            closeModal(true);
        }
    }
}

/**
 * Force close modal - bypasses protection (for cancel/X buttons)
 */
function forceCloseModal() {
    formProtectionManager.forceClose();
}

/**
 * Auto-lock buttons on click for save/add/create/update/submit actions
 * This prevents double-clicks and duplicate records
 */
(function initAutoButtonLock() {
    // Keywords that indicate a save/submit action
    const actionKeywords = [
        'save', 'guardar', 'add', 'añadir', 'agregar', 'create', 'crear',
        'submit', 'enviar', 'update', 'actualizar', 'post', 'publicar',
        'upload', 'subir', 'request', 'solicitar'
    ];

    // Function patterns to detect in onclick handlers
    const functionPatterns = [
        /^save/i, /^create/i, /^add/i, /^submit/i, /^update/i, /^post/i,
        /guardar/i, /crear/i, /agregar/i, /añadir/i, /enviar/i, /actualizar/i
    ];

    /**
     * Check if a button should be auto-locked
     */
    function shouldAutoLock(button) {
        // Skip if already has no-auto-lock class
        if (button.classList.contains('no-auto-lock')) return false;

        // Skip if it's a cancel/close button
        const text = button.textContent.toLowerCase();
        if (text.includes('cancel') || text.includes('close') || text.includes('cancelar') || text.includes('cerrar')) {
            return false;
        }

        // Check button text for action keywords
        for (const keyword of actionKeywords) {
            if (text.includes(keyword)) return true;
        }

        // Check onclick attribute for function patterns
        const onclick = button.getAttribute('onclick') || '';
        for (const pattern of functionPatterns) {
            if (pattern.test(onclick)) return true;
        }

        // Check if it's a btn-primary with likely action
        if (button.classList.contains('btn-primary')) {
            // Check if inside a modal (likely a save action)
            const modal = button.closest('.modal-content, .modal-body, .modal-footer, #modal');
            if (modal) return true;
        }

        return false;
    }

    /**
     * Handle click events on buttons
     */
    function handleButtonClick(event) {
        const button = event.target.closest('button, .btn-primary, .btn-secondary');
        if (!button) return;

        // Check if button should be auto-locked
        if (!shouldAutoLock(button)) return;

        // Check if already locked
        if (buttonLockManager.isLocked(button) || button.classList.contains('btn-locked')) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }

        // Lock the button
        buttonLockManager.lock(button, 5000);
    }

    // Add global click listener (capture phase to intercept before onclick handlers)
    document.addEventListener('click', handleButtonClick, true);

})();

// ==================== UPLOAD LOADING OVERLAY ====================

/**
 * Global Upload Loading Overlay Manager
 * Shows a loading indicator during file uploads to Firebase Storage
 */
class UploadLoadingOverlay {
    constructor() {
        this.overlay = null;
        this.progressBar = null;
        this.progressText = null;
        this.statusText = null;
        this.isVisible = false;
    }

    /**
     * Create the overlay element if it doesn't exist
     */
    createOverlay() {
        if (this.overlay) return;

        this.overlay = document.createElement('div');
        this.overlay.id = 'upload-loading-overlay';
        this.overlay.innerHTML = `
            <div class="upload-loading-content">
                <div class="upload-loading-icon">
                    <svg class="upload-spinner" viewBox="0 0 50 50">
                        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle>
                    </svg>
                    <i class="fas fa-cloud-upload-alt upload-cloud-icon"></i>
                </div>
                <div class="upload-loading-text">
                    <h3 id="upload-status-text">Uploading file...</h3>
                    <p id="upload-progress-text">Please wait while we upload your file</p>
                </div>
                <div class="upload-progress-container">
                    <div class="upload-progress-bar" id="upload-progress-bar"></div>
                </div>
                <div class="upload-progress-percent" id="upload-progress-percent">0%</div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #upload-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }

            #upload-loading-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            .upload-loading-content {
                background: var(--bg-primary, #1a1a2e);
                border-radius: 20px;
                padding: 40px 50px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                border: 1px solid var(--border-color, rgba(255,255,255,0.1));
                max-width: 400px;
                width: 90%;
                animation: uploadSlideUp 0.4s ease;
            }

            @keyframes uploadSlideUp {
                from {
                    transform: translateY(30px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .upload-loading-icon {
                position: relative;
                width: 100px;
                height: 100px;
                margin: 0 auto 24px;
            }

            .upload-spinner {
                width: 100px;
                height: 100px;
                animation: uploadRotate 1.5s linear infinite;
            }

            .upload-spinner .path {
                stroke: var(--accent-primary, #6366f1);
                stroke-linecap: round;
                animation: uploadDash 1.5s ease-in-out infinite;
            }

            @keyframes uploadRotate {
                100% {
                    transform: rotate(360deg);
                }
            }

            @keyframes uploadDash {
                0% {
                    stroke-dasharray: 1, 150;
                    stroke-dashoffset: 0;
                }
                50% {
                    stroke-dasharray: 90, 150;
                    stroke-dashoffset: -35;
                }
                100% {
                    stroke-dasharray: 90, 150;
                    stroke-dashoffset: -124;
                }
            }

            .upload-cloud-icon {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 36px;
                color: var(--accent-primary, #6366f1);
                animation: uploadPulse 1.5s ease-in-out infinite;
            }

            @keyframes uploadPulse {
                0%, 100% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                50% {
                    opacity: 0.7;
                    transform: translate(-50%, -50%) scale(1.1);
                }
            }

            .upload-loading-text h3 {
                color: var(--text-primary, #fff);
                font-size: 20px;
                font-weight: 600;
                margin: 0 0 8px 0;
            }

            .upload-loading-text p {
                color: var(--text-muted, #888);
                font-size: 14px;
                margin: 0 0 24px 0;
            }

            .upload-progress-container {
                background: var(--bg-secondary, #252542);
                border-radius: 10px;
                height: 8px;
                overflow: hidden;
                margin-bottom: 12px;
            }

            .upload-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7);
                background-size: 200% 100%;
                border-radius: 10px;
                width: 0%;
                transition: width 0.3s ease;
                animation: uploadGradient 2s linear infinite;
            }

            @keyframes uploadGradient {
                0% {
                    background-position: 0% 50%;
                }
                100% {
                    background-position: 200% 50%;
                }
            }

            .upload-progress-percent {
                color: var(--accent-primary, #6366f1);
                font-size: 24px;
                font-weight: 700;
            }

            /* Success state */
            #upload-loading-overlay.success .upload-spinner {
                animation: none;
            }

            #upload-loading-overlay.success .upload-spinner .path {
                stroke: #10b981;
                animation: none;
                stroke-dasharray: 150;
                stroke-dashoffset: 0;
            }

            #upload-loading-overlay.success .upload-cloud-icon {
                animation: none;
                color: #10b981;
            }

            #upload-loading-overlay.success .upload-cloud-icon::before {
                content: "\\f00c";
            }

            #upload-loading-overlay.success .upload-progress-bar {
                background: #10b981;
                animation: none;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(this.overlay);

        this.progressBar = document.getElementById('upload-progress-bar');
        this.progressText = document.getElementById('upload-progress-percent');
        this.statusText = document.getElementById('upload-status-text');
        this.descriptionText = document.getElementById('upload-progress-text');
    }

    /**
     * Show the loading overlay
     * @param {string} message - Custom status message
     * @param {string} description - Custom description
     */
    show(message = 'Uploading file...', description = 'Please wait while we upload your file') {
        this.createOverlay();
        this.overlay.classList.remove('success');
        this.statusText.textContent = message;
        this.descriptionText.textContent = description;
        this.updateProgress(0);
        this.overlay.classList.add('active');
        this.isVisible = true;
    }

    /**
     * Update progress bar
     * @param {number} percent - Progress percentage (0-100)
     */
    updateProgress(percent) {
        if (!this.progressBar || !this.progressText) return;
        const clampedPercent = Math.min(100, Math.max(0, percent));
        this.progressBar.style.width = `${clampedPercent}%`;
        this.progressText.textContent = `${Math.round(clampedPercent)}%`;
    }

    /**
     * Show success state briefly before hiding
     * @param {string} message - Success message
     */
    showSuccess(message = 'Upload complete!') {
        if (!this.overlay) return;
        this.statusText.textContent = message;
        this.descriptionText.textContent = 'File uploaded successfully';
        this.updateProgress(100);
        this.overlay.classList.add('success');

        setTimeout(() => {
            this.hide();
        }, 1200);
    }

    /**
     * Hide the loading overlay
     */
    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
            this.overlay.classList.remove('success');
            this.isVisible = false;
        }
    }

    /**
     * Show error and hide
     * @param {string} message - Error message
     */
    showError(message = 'Upload failed') {
        if (!this.overlay) return;
        this.statusText.textContent = message;
        this.descriptionText.textContent = 'Please try again';

        setTimeout(() => {
            this.hide();
        }, 2000);
    }
}

// Global instance
const uploadLoadingOverlay = new UploadLoadingOverlay();

// ==================== FIREBASE STORAGE HELPER ====================

/**
 * Global Firebase Storage Helper
 * Handles all file uploads to Firebase Storage
 */
class FirebaseStorageHelper {
    constructor() {
        this.storage = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase Storage
     */
    initialize() {
        try {
            if (typeof firebase !== 'undefined' && firebase.storage) {
                this.storage = firebase.storage();
                this.isInitialized = true;
                return true;
            } else {
                console.error('Firebase Storage not available');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Storage:', error);
            return false;
        }
    }

    /**
     * Upload a file to Firebase Storage (internal - no loading overlay)
     * @param {File|Blob|string} file - File object, Blob, or base64 string
     * @param {string} path - Storage path (e.g., 'employees/photos/employeeId.jpg')
     * @param {Function} onProgress - Optional progress callback
     * @returns {Promise<{url: string, path: string}>} Download URL and storage path
     */
    async _uploadFileInternal(file, path, onProgress = null) {
        if (!this.isInitialized) {
            this.initialize();
        }

        if (!this.storage) {
            throw new Error('Firebase Storage not initialized');
        }

        try {
            const storageRef = this.storage.ref(path);
            let uploadTask;

            // Handle base64 string
            if (typeof file === 'string' && file.startsWith('data:')) {
                uploadTask = storageRef.putString(file, 'data_url');
            } else {
                uploadTask = storageRef.put(file);
            }

            // Handle progress updates
            if (onProgress) {
                uploadTask.on('state_changed', (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress(progress);
                });
            }

            // Wait for upload to complete
            await uploadTask;

            // Get download URL
            const downloadURL = await storageRef.getDownloadURL();

            return {
                url: downloadURL,
                path: path
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    /**
     * Upload a file to Firebase Storage with loading overlay
     * @param {File|Blob|string} file - File object, Blob, or base64 string
     * @param {string} path - Storage path (e.g., 'employees/photos/employeeId.jpg')
     * @param {Function} onProgress - Optional progress callback
     * @param {boolean} showOverlay - Whether to show loading overlay (default: true)
     * @returns {Promise<{url: string, path: string}>} Download URL and storage path
     */
    async uploadFile(file, path, onProgress = null, showOverlay = true) {
        if (!this.isInitialized) {
            this.initialize();
        }

        if (!this.storage) {
            throw new Error('Firebase Storage not initialized');
        }

        // Show loading overlay
        if (showOverlay) {
            uploadLoadingOverlay.show('Uploading file...', 'Please wait while we upload your file');
        }

        try {
            const storageRef = this.storage.ref(path);
            let uploadTask;

            // Handle base64 string
            if (typeof file === 'string' && file.startsWith('data:')) {
                uploadTask = storageRef.putString(file, 'data_url');
            } else {
                uploadTask = storageRef.put(file);
            }

            // Handle progress updates - always update overlay
            uploadTask.on('state_changed', (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (showOverlay) {
                    uploadLoadingOverlay.updateProgress(progress);
                }
                if (onProgress) {
                    onProgress(progress);
                }
            });

            // Wait for upload to complete
            await uploadTask;

            // Get download URL
            const downloadURL = await storageRef.getDownloadURL();


            // Show success
            if (showOverlay) {
                uploadLoadingOverlay.showSuccess('Upload complete!');
            }

            return {
                url: downloadURL,
                path: path
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            if (showOverlay) {
                uploadLoadingOverlay.showError('Upload failed');
            }
            throw error;
        }
    }

    /**
     * Upload an image with compression and loading overlay
     * @param {string} base64Image - Base64 encoded image
     * @param {string} folder - Storage folder (e.g., 'employees/photos')
     * @param {string} fileName - File name without extension
     * @param {number} maxSizeKB - Maximum size in KB (default 500KB)
     * @param {boolean} showOverlay - Whether to show loading overlay (default: true)
     * @returns {Promise<{url: string, path: string}>}
     */
    async uploadImage(base64Image, folder, fileName, maxSizeKB = 500, showOverlay = true) {
        if (!base64Image || !base64Image.startsWith('data:')) {
            throw new Error('Invalid base64 image');
        }

        // Initialize storage if needed
        if (!this.isInitialized) {
            this.initialize();
        }

        // Show loading overlay
        if (showOverlay) {
            uploadLoadingOverlay.show('Uploading image...', 'Please wait while we upload your image');
        }

        try {
            if (!this.storage) {
                throw new Error('Firebase Storage not initialized');
            }

            // Generate unique filename with timestamp
            const timestamp = Date.now();
            const extension = base64Image.includes('image/png') ? 'png' : 'jpg';
            const path = `${folder}/${fileName}_${timestamp}.${extension}`;


            // Use internal upload without showing overlay again
            const result = await this._uploadFileInternal(base64Image, path, (progress) => {
                if (showOverlay) {
                    uploadLoadingOverlay.updateProgress(progress);
                }
            });


            // Show success
            if (showOverlay) {
                uploadLoadingOverlay.showSuccess('Image uploaded!');
            }

            return result;
        } catch (error) {
            console.error('Error uploading image:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            if (showOverlay) {
                uploadLoadingOverlay.showError('Image upload failed: ' + error.message);
            }

            // Log detailed error info
            if (error.code === 'storage/project-not-found') {
                console.error('❌ Firebase Storage bucket not found - check Firebase console');
            } else if (error.code === 'storage/permission-denied') {
                console.error('❌ Permission denied to upload - check Storage rules');
            } else if (error.code === 'storage/unknown') {
                console.error('❌ Unknown Storage error - check Firebase setup and network');
            }

            throw error;
        }
    }

    /**
     * Upload a document (PDF, etc.) with loading overlay
     * @param {File} file - File object
     * @param {string} folder - Storage folder
     * @param {string} prefix - Optional prefix for filename
     * @param {boolean} showOverlay - Whether to show loading overlay (default: true)
     * @returns {Promise<{url: string, path: string, fileName: string, fileSize: number, fileType: string}>}
     */
    async uploadDocument(file, folder, prefix = '', showOverlay = true) {
        // Show loading overlay
        if (showOverlay) {
            uploadLoadingOverlay.show('Uploading document...', `Uploading ${file.name}`);
        }

        try {
            const timestamp = Date.now();
            const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const path = `${folder}/${prefix}${timestamp}_${safeFileName}`;

            // Use internal upload without showing overlay again
            const result = await this._uploadFileInternal(file, path, (progress) => {
                if (showOverlay) {
                    uploadLoadingOverlay.updateProgress(progress);
                }
            });

            // Show success
            if (showOverlay) {
                uploadLoadingOverlay.showSuccess('Document uploaded!');
            }

            return {
                ...result,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
            };
        } catch (error) {
            if (showOverlay) {
                uploadLoadingOverlay.showError('Document upload failed');
            }
            throw error;
        }
    }

    /**
     * Delete a file from Firebase Storage
     * @param {string} path - Storage path to delete
     * @returns {Promise<boolean>}
     */
    async deleteFile(path) {
        if (!this.isInitialized || !this.storage) {
            console.error('Firebase Storage not initialized');
            return false;
        }

        try {
            const storageRef = this.storage.ref(path);
            await storageRef.delete();
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }

    /**
     * Get download URL for a file
     * @param {string} path - Storage path
     * @returns {Promise<string>} Download URL
     */
    async getDownloadURL(path) {
        if (!this.isInitialized || !this.storage) {
            throw new Error('Firebase Storage not initialized');
        }

        try {
            const storageRef = this.storage.ref(path);
            return await storageRef.getDownloadURL();
        } catch (error) {
            console.error('Error getting download URL:', error);
            throw error;
        }
    }
}

// Global instance
const firebaseStorageHelper = new FirebaseStorageHelper();

// ==================== END FIREBASE STORAGE HELPER ====================

class FirebaseEmployeeManager {
    constructor() {
        this.db = null;
        this.currentUser = null;
        this.currentUserRole = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase
     */
    async initialize() {
        try {
            // Import Firebase modules
            if (typeof firebase !== 'undefined' && firebase.initializeApp) {
                const config = window.FIREBASE_CONFIG;
                
                // Check if already initialized
                if (!firebase.apps || firebase.apps.length === 0) {
                    firebase.initializeApp(config);
                }
                
                this.db = firebase.firestore();
                this.isInitialized = true;
                return true;
            } else {
                console.error('Firebase not loaded. Make sure to include Firebase scripts in your HTML.');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase:', error);
            return false;
        }
    }

    /**
     * Load employees from Firestore
     * @returns {Promise<Array>} Array of employees with their roles
     */
    async loadEmployees() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase not initialized. Using fallback data.');
                return [];
            }

            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            const snapshot = await this.db.collection(employeesCollection).get();
            
            const employees = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                employees.push({
                    id: doc.id,
                    ...data,
                    firestoreId: doc.id
                });
            });

            return employees;
        } catch (error) {
            console.error('Error loading employees from Firestore:', error);
            return [];
        }
    }

    /**
     * Load a specific employee by ID
     * @param {string} employeeId - Employee ID from Firestore
     * @returns {Promise<Object>} Employee data with role
     */
    async getEmployee(employeeId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase not initialized.');
                return null;
            }

            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            const doc = await this.db.collection(employeesCollection).doc(employeeId).get();
            
            if (doc.exists) {
                return {
                    id: doc.id,
                    ...doc.data(),
                    firestoreId: doc.id
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting employee:', error);
            return null;
        }
    }

    /**
     * Add new employee to Firestore
     * @param {Object} employeeData - Employee data to add
     * @returns {Promise<string>} New document ID
     */
    async addEmployee(employeeData, email = null, password = null) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return null;
            }

            // Set default role if not provided
            if (!employeeData.role) {
                employeeData.role = window.EMPLOYEE_ROLES?.EMPLOYEE || 'employee';
            }

            employeeData.createdAt = new Date();
            employeeData.updatedAt = new Date();

            // Create user in Firebase Authentication if email and password provided
            if (email && password) {
                try {
                    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                    const userId = userCredential.user.uid;
                    
                    // Add the Firebase Auth UID to the employee data
                    employeeData.firebaseUid = userId;
                    employeeData.authEmail = email;
                    
                } catch (authError) {
                    // Check if email already exists or other auth errors
                    if (authError.code === 'auth/email-already-in-use') {
                        throw new Error('Email already registered. Please use a different email or login with existing account.');
                    } else if (authError.code === 'auth/weak-password') {
                        throw new Error('Password is too weak. Please use a stronger password (minimum 6 characters).');
                    } else if (authError.code === 'auth/invalid-email') {
                        throw new Error('Invalid email format. Please provide a valid email address.');
                    } else {
                        throw new Error(`Authentication error: ${authError.message}`);
                    }
                }
            }

            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            const docRef = await this.db.collection(employeesCollection).add(employeeData);
            
            return docRef.id;
        } catch (error) {
            console.error('Error adding employee:', error);
            throw error; // Re-throw to let caller handle it
        }
    }

    /**
     * Update employee in Firestore
     * @param {string} employeeId - Employee Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateEmployee(employeeId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            await this.db.collection(employeesCollection).doc(employeeId).update(updateData);
            
            return true;
        } catch (error) {
            console.error('Error updating employee:', error);
            return false;
        }
    }

    /**
     * Delete employee from Firestore
     * @param {string} employeeId - Employee Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteEmployee(employeeId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return false;
            }

            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            await this.db.collection(employeesCollection).doc(employeeId).delete();
            
            return true;
        } catch (error) {
            console.error('Error deleting employee:', error);
            return false;
        }
    }

    /**
     * Get employees by role
     * @param {string} role - Role to filter by (admin, manager, employee)
     * @returns {Promise<Array>} Filtered employees
     */
    async getEmployeesByRole(role) {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase not initialized.');
                return [];
            }

            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            const snapshot = await this.db.collection(employeesCollection)
                .where('role', '==', role)
                .get();
            
            const employees = [];
            snapshot.forEach(doc => {
                employees.push({
                    id: doc.id,
                    ...doc.data(),
                    firestoreId: doc.id
                });
            });

            return employees;
        } catch (error) {
            console.error('Error getting employees by role:', error);
            return [];
        }
    }

    /**
     * Update employee role
     * @param {string} employeeId - Employee Firestore ID
     * @param {string} newRole - New role (admin, manager, employee)
     * @returns {Promise<boolean>} Success status
     */
    async updateEmployeeRole(employeeId, newRole) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return false;
            }

            // Validate role
            const validRoles = Object.values(window.EMPLOYEE_ROLES || {});
            if (!validRoles.includes(newRole)) {
                console.error('Invalid role:', newRole);
                return false;
            }

            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            await this.db.collection(employeesCollection).doc(employeeId).update({
                role: newRole,
                updatedAt: new Date()
            });
            
            return true;
        } catch (error) {
            console.error('Error updating employee role:', error);
            return false;
        }
    }

    /**
     * Set up real-time listener for employees
     * @param {Function} callback - Function to call when data changes
     * @returns {Function} Unsubscribe function
     */
    onEmployeesChange(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return null;
            }

            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            return this.db.collection(employeesCollection).onSnapshot(snapshot => {
                const employees = [];
                snapshot.forEach(doc => {
                    employees.push({
                        id: doc.id,
                        ...doc.data(),
                        firestoreId: doc.id
                    });
                });
                callback(employees);
            }, error => {
                console.error('Error listening to employees:', error);
            });
        } catch (error) {
            console.error('Error setting up listener:', error);
            return null;
        }
    }

    /**
     * Check if user has permission
     * @param {string} permission - Permission to check (e.g., 'canEditAllEmployees')
     * @param {string} role - User's role
     * @returns {boolean} Whether user has permission
     */
    hasPermission(permission, role) {
        const rolePermissions = window.ROLE_PERMISSIONS?.[role];
        if (!rolePermissions) {
            return false;
        }
        return rolePermissions[permission] === true;
    }

    /**
     * Get role label
     * @param {string} role - Role key
     * @returns {string} Readable role label
     */
    getRoleLabel(role) {
        return window.ROLE_PERMISSIONS?.[role]?.label || role;
    }

    /**
     * Get role color (for UI purposes)
     * @param {string} role - Role key
     * @returns {string} Color code or CSS variable
     */
    getRoleColor(role) {
        const colors = {
            'admin': '#ef4444',      // Red
            'manager': '#f59e0b',    // Amber
            'employee': '#3b82f6'    // Blue
        };
        return colors[role] || '#6b7280';
    }

    /**
     * Upload employee paperwork file to Firebase Storage
     * @param {string} employeeId - Employee Firestore ID
     * @param {File} file - File to upload
     * @param {string} documentType - Type of document (e.g., 'ID', 'Contract', 'Certificate')
     * @returns {Promise<Object>} Upload result with URL and metadata
     */
    async uploadPaperwork(employeeId, file, documentType = 'Other') {
        try {
            if (!this.isInitialized) {
                console.error('Firebase not initialized.');
                return null;
            }

            // Initialize storage if not already done
            if (!this.storage) {
                this.storage = firebase.storage();
            }

            // Create a unique filename with timestamp
            const timestamp = Date.now();
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const storagePath = `employee-paperwork/${employeeId}/${timestamp}_${sanitizedFileName}`;

            // Upload file to Firebase Storage
            const storageRef = this.storage.ref(storagePath);
            const uploadTask = await storageRef.put(file);

            // Get download URL
            const downloadURL = await uploadTask.ref.getDownloadURL();

            // Create paperwork metadata
            const paperworkData = {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                documentType: documentType,
                storagePath: storagePath,
                downloadURL: downloadURL,
                uploadedAt: new Date(),
                uploadedBy: this.currentUser?.uid || 'unknown'
            };

            // Add paperwork metadata to employee document
            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            const employeeDoc = await this.db.collection(employeesCollection).doc(employeeId).get();

            if (employeeDoc.exists) {
                const currentPaperwork = employeeDoc.data().paperwork || [];
                currentPaperwork.push(paperworkData);

                await this.db.collection(employeesCollection).doc(employeeId).update({
                    paperwork: currentPaperwork,
                    updatedAt: new Date()
                });
            }

            return paperworkData;
        } catch (error) {
            console.error('Error uploading paperwork:', error);
            throw error;
        }
    }

    /**
     * Delete employee paperwork file from Firebase Storage
     * @param {string} employeeId - Employee Firestore ID
     * @param {string} storagePath - Storage path of the file to delete
     * @returns {Promise<boolean>} Success status
     */
    async deletePaperwork(employeeId, storagePath) {
        try {
            if (!this.isInitialized) {
                console.error('Firebase not initialized.');
                return false;
            }

            // Initialize storage if not already done
            if (!this.storage) {
                this.storage = firebase.storage();
            }

            // Delete file from Firebase Storage
            const storageRef = this.storage.ref(storagePath);
            await storageRef.delete();

            // Remove paperwork metadata from employee document
            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            const employeeDoc = await this.db.collection(employeesCollection).doc(employeeId).get();

            if (employeeDoc.exists) {
                const currentPaperwork = employeeDoc.data().paperwork || [];
                const updatedPaperwork = currentPaperwork.filter(p => p.storagePath !== storagePath);

                await this.db.collection(employeesCollection).doc(employeeId).update({
                    paperwork: updatedPaperwork,
                    updatedAt: new Date()
                });
            }

            return true;
        } catch (error) {
            console.error('Error deleting paperwork:', error);
            return false;
        }
    }

    /**
     * Get all paperwork for an employee
     * @param {string} employeeId - Employee Firestore ID
     * @returns {Promise<Array>} Array of paperwork metadata
     */
    async getPaperwork(employeeId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase not initialized.');
                return [];
            }

            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            const employeeDoc = await this.db.collection(employeesCollection).doc(employeeId).get();

            if (employeeDoc.exists) {
                return employeeDoc.data().paperwork || [];
            }
            return [];
        } catch (error) {
            console.error('Error getting paperwork:', error);
            return [];
        }
    }

    /**
     * Save day off request to Firestore
     * @param {Object} dayOffData - Day off request data
     * @returns {Promise<string>} Request ID
     */
    async saveDayOffRequest(dayOffData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return null;
            }

            const dayOffsCollection = window.FIREBASE_COLLECTIONS?.dayOffRequests || 'dayOffRequests';
            
            const docRef = await this.db.collection(dayOffsCollection).add({
                ...dayOffData,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            return docRef.id;
        } catch (error) {
            console.error('Error saving day off request:', error);
            throw error;
        }
    }

    /**
     * Get day off requests for an employee
     * @param {string} employeeId - Employee ID
     * @returns {Promise<Array>} Array of day off requests
     */
    async getDayOffRequests(employeeId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase not initialized.');
                return [];
            }

            const dayOffsCollection = window.FIREBASE_COLLECTIONS?.dayOffRequests || 'dayOffRequests';
            const snapshot = await this.db.collection(dayOffsCollection)
                .where('employeeId', '==', employeeId)
                .get();

            const requests = [];
            snapshot.forEach(doc => {
                requests.push({
                    id: doc.id,
                    ...doc.data(),
                    firestoreId: doc.id
                });
            });

            return requests;
        } catch (error) {
            console.error('Error getting day off requests:', error);
            return [];
        }
    }

    /**
     * Get all day off requests from Firestore
     * @returns {Promise<Array>} Array of all day off requests
     */
    async getAllDayOffRequests() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase not initialized.');
                return [];
            }

            const dayOffsCollection = window.FIREBASE_COLLECTIONS?.dayOffRequests || 'dayOffRequests';
            const snapshot = await this.db.collection(dayOffsCollection).get();

            const requests = [];
            snapshot.forEach(doc => {
                requests.push({
                    id: doc.id,
                    ...doc.data(),
                    firestoreId: doc.id
                });
            });

            return requests;
        } catch (error) {
            console.error('Error getting all day off requests:', error);
            return [];
        }
    }

    /**
     * Delete day off request from Firestore
     * @param {string} requestId - Request ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteDayOffRequest(requestId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return false;
            }

            const dayOffsCollection = window.FIREBASE_COLLECTIONS?.dayOffRequests || 'dayOffRequests';
            await this.db.collection(dayOffsCollection).doc(requestId).delete();

            return true;
        } catch (error) {
            console.error('Error deleting day off request:', error);
            return false;
        }
    }

    /**
     * Update day off request status
     * @param {string} requestId - Request ID
     * @param {string} status - New status (pending, approved, denied)
     * @returns {Promise<boolean>} Success status
     */
    async updateDayOffRequestStatus(requestId, status) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return false;
            }

            const dayOffsCollection = window.FIREBASE_COLLECTIONS?.dayOffRequests || 'dayOffRequests';
            await this.db.collection(dayOffsCollection).doc(requestId).update({
                status: status,
                updatedAt: new Date()
            });

            return true;
        } catch (error) {
            console.error('Error updating day off request status:', error);
            return false;
        }
    }
}

// Initialize global Firebase manager
const firebaseEmployeeManager = new FirebaseEmployeeManager();

/**
 * Firebase Thieves Manager
 * Handles Firebase Firestore operations for thieves database
 */
class FirebaseThievesManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase (uses shared Firebase instance)
     */
    async initialize() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                this.db = firebase.firestore();
                this.isInitialized = true;
                return true;
            } else {
                console.error('Firebase not loaded for Thieves Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Thieves Manager:', error);
            return false;
        }
    }

    /**
     * Load thieves from Firestore
     * @returns {Promise<Array>} Array of thief records
     */
    async loadThieves() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Thieves Manager not initialized. Using fallback data.');
                return [];
            }

            const thievesCollection = window.FIREBASE_COLLECTIONS?.thieves || 'thieves';
            const snapshot = await this.db.collection(thievesCollection)
                .orderBy('date', 'desc')
                .get();

            const thieves = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                thieves.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    name: data.name || '',
                    photo: data.photo || null,
                    date: data.date || '',
                    store: data.store || '',
                    crimeType: data.crimeType || '',
                    itemsStolen: data.itemsStolen || '',
                    estimatedValue: data.estimatedValue || 0,
                    description: data.description || '',
                    policeReport: data.policeReport || null,
                    banned: data.banned !== undefined ? data.banned : true
                });
            });

            return thieves;
        } catch (error) {
            console.error('Error loading thieves from Firestore:', error);
            return [];
        }
    }

    /**
     * Add new thief record to Firestore
     * @param {Object} thiefData - Thief data to add
     * @returns {Promise<string>} New document ID
     */
    async addThief(thiefData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Thieves Manager not initialized.');
                return null;
            }

            thiefData.createdAt = new Date();
            thiefData.updatedAt = new Date();

            const thievesCollection = window.FIREBASE_COLLECTIONS?.thieves || 'thieves';
            const docRef = await this.db.collection(thievesCollection).add(thiefData);

            return docRef.id;
        } catch (error) {
            console.error('Error adding thief record:', error);
            return null;
        }
    }

    /**
     * Update thief record in Firestore
     * @param {string} thiefId - Thief Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateThief(thiefId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Thieves Manager not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const thievesCollection = window.FIREBASE_COLLECTIONS?.thieves || 'thieves';
            await this.db.collection(thievesCollection).doc(thiefId).update(updateData);

            return true;
        } catch (error) {
            console.error('Error updating thief record:', error);
            return false;
        }
    }

    /**
     * Delete thief record from Firestore
     * @param {string} thiefId - Thief Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteThief(thiefId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Thieves Manager not initialized.');
                return false;
            }

            const thievesCollection = window.FIREBASE_COLLECTIONS?.thieves || 'thieves';
            await this.db.collection(thievesCollection).doc(thiefId).delete();

            return true;
        } catch (error) {
            console.error('Error deleting thief record:', error);
            return false;
        }
    }
}

// Initialize global Firebase Thieves manager
const firebaseThievesManager = new FirebaseThievesManager();

/**
 * Firebase Clock In/Out Manager
 * Handles Firebase Firestore operations for clock in/out attendance records
 */
class FirebaseClockInManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase (uses shared Firebase instance)
     */
    async initialize() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                this.db = firebase.firestore();
                this.isInitialized = true;
                return true;
            } else {
                console.error('Firebase not loaded for Clock In Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Clock In Manager:', error);
            return false;
        }
    }

    /**
     * Save clock in/out record to Firestore
     * @param {Object} clockRecord - Clock record data
     * @returns {Promise<Object>} Saved record with ID
     */
    async saveClockRecord(clockRecord) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Clock In Manager not initialized.');
                throw new Error('Firebase not initialized');
            }

            // Prepare record data
            const recordData = {
                employeeId: clockRecord.employeeId,
                employeeName: clockRecord.employeeName,
                employeeRole: clockRecord.employeeRole,
                store: clockRecord.store,
                date: clockRecord.date, // Store date as string (YYYY-MM-DD)
                timestamp: new Date(), // Server timestamp for ordering
                clockIn: clockRecord.clockIn || null,
                lunchStart: clockRecord.lunchStart || null,
                lunchEnd: clockRecord.lunchEnd || null,
                clockOut: clockRecord.clockOut || null,
                notes: clockRecord.notes || '',
                updatedAt: new Date()
            };

            const clockinCollection = window.FIREBASE_COLLECTIONS?.clockin || 'clockin';
            
            // Try to find existing record for this employee on this date
            const snapshot = await this.db.collection(clockinCollection)
                .where('employeeId', '==', clockRecord.employeeId)
                .where('date', '==', clockRecord.date)
                .get();

            let docRef;
            if (snapshot.empty) {
                // Create new record
                recordData.createdAt = new Date();
                docRef = await this.db.collection(clockinCollection).add(recordData);
                return {
                    id: docRef.id,
                    ...recordData
                };
            } else {
                // Update existing record
                const existingDoc = snapshot.docs[0];
                await existingDoc.ref.update(recordData);
                return {
                    id: existingDoc.id,
                    ...recordData
                };
            }
        } catch (error) {
            console.error('Error saving clock record to Firebase:', error);
            throw error;
        }
    }

    /**
     * Load clock in/out records from Firestore for a specific date
     * @param {string} date - Date string (YYYY-MM-DD format)
     * @returns {Promise<Array>} Array of clock records
     */
    async loadClockRecordsByDate(date) {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Clock In Manager not initialized. Using fallback data.');
                return [];
            }

            const clockinCollection = window.FIREBASE_COLLECTIONS?.clockin || 'clockin';
            const snapshot = await this.db.collection(clockinCollection)
                .where('date', '==', date)
                .get();

            const records = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                records.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    ...data
                });
            });

            // Sort by updatedAt in memory instead of in query
            records.sort((a, b) => {
                const timeA = a.updatedAt?.toDate?.() || new Date(0);
                const timeB = b.updatedAt?.toDate?.() || new Date(0);
                return timeB - timeA;
            });

            return records;
        } catch (error) {
            console.error('Error loading clock records from Firestore:', error);
            return [];
        }
    }

    /**
     * Load clock in/out records for a specific employee
     * @param {string} employeeId - Employee ID
     * @param {string} startDate - Start date (YYYY-MM-DD format)
     * @param {string} endDate - End date (YYYY-MM-DD format)
     * @returns {Promise<Array>} Array of clock records
     */
    async loadEmployeeClockRecords(employeeId, startDate, endDate) {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Clock In Manager not initialized.');
                return [];
            }

            const clockinCollection = window.FIREBASE_COLLECTIONS?.clockin || 'clockin';
            const snapshot = await this.db.collection(clockinCollection)
                .where('employeeId', '==', employeeId)
                .get();

            const records = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // Filter by date range in memory
                if (data.date >= startDate && data.date <= endDate) {
                    records.push({
                        id: doc.id,
                        firestoreId: doc.id,
                        ...data
                    });
                }
            });

            // Sort by date in memory
            records.sort((a, b) => {
                return b.date.localeCompare(a.date);
            });

            return records;
        } catch (error) {
            console.error('Error loading employee clock records:', error);
            return [];
        }
    }

    /**
     * Delete clock record from Firestore
     * @param {string} recordId - Record Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteClockRecord(recordId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Clock In Manager not initialized.');
                return false;
            }

            const clockinCollection = window.FIREBASE_COLLECTIONS?.clockin || 'clockin';
            await this.db.collection(clockinCollection).doc(recordId).delete();

            return true;
        } catch (error) {
            console.error('Error deleting clock record:', error);
            return false;
        }
    }

    /**
     * Set up real-time listener for clock records of a specific date
     * @param {string} date - Date string (YYYY-MM-DD format)
     * @param {Function} callback - Function to call when data changes
     * @returns {Function} Unsubscribe function
     */
    onClockRecordsChange(date, callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Clock In Manager not initialized.');
                return null;
            }

            const clockinCollection = window.FIREBASE_COLLECTIONS?.clockin || 'clockin';
            return this.db.collection(clockinCollection)
                .where('date', '==', date)
                .onSnapshot(snapshot => {
                    const records = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        records.push({
                            id: doc.id,
                            firestoreId: doc.id,
                            ...data
                        });
                    });
                    callback(records);
                }, error => {
                    console.error('Error listening to clock records:', error);
                });
        } catch (error) {
            console.error('Error setting up clock records listener:', error);
            return null;
        }
    }
}

/**
 * Firebase Product Manager
 * Handles Firestore operations for products and image uploads to Storage
 */
class FirebaseProductManager {
    constructor() {
        this.db = null;
        this.storage = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase
     */
    async initialize() {
        try {
            if (typeof firebase !== 'undefined') {
                const config = window.FIREBASE_CONFIG;
                
                // Check if already initialized
                if (!firebase.apps || firebase.apps.length === 0) {
                    firebase.initializeApp(config);
                }
                
                // Get references to Firestore and Storage
                this.db = firebase.firestore();
                
                // Initialize Firebase Storage - compat version
                try {
                    this.storage = firebase.storage();
                } catch (storageError) {
                    console.warn('⚠️ Firebase Storage initialization failed:', storageError.message);
                    console.warn('   Make sure Firebase Storage is enabled in your Firebase project');
                    console.warn('   Go to: https://console.firebase.google.com/ → Storage');
                    this.storage = null;
                }
                
                this.isInitialized = true;
                return true;
            } else {
                console.error('Firebase not loaded');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Product Manager:', error);
            return false;
        }
    }

    /**
     * Upload product image to Firebase Storage
     * @param {File} imageFile - Image file to upload
     * @param {string} productName - Product name for file naming
     * @returns {Promise<string>} Download URL of the uploaded image
     */
    async uploadProductImage(imageFile, productName) {
        try {
            if (!this.isInitialized) {
                console.error('Firebase not initialized');
                return null;
            }
            
            if (!this.storage) {
                console.error('Firebase Storage not available');
                return null;
            }

            if (!imageFile) {
                console.warn('No image file provided');
                return null;
            }

            // Create a unique filename
            const timestamp = Date.now();
            const sanitizedName = productName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const filename = `products/${sanitizedName}_${timestamp}.${imageFile.name.split('.').pop()}`;


            // Upload to Storage
            const storageRef = this.storage.ref(filename);
            const snapshot = await storageRef.put(imageFile);

            // Get download URL
            const downloadUrl = await snapshot.ref.getDownloadURL();

            return downloadUrl;
        } catch (error) {
            console.error('Error uploading product image:', error);
            return null;
        }
    }

    /**
     * Save product to Firestore
     * @param {Object} productData - Product data to save
     * @returns {Promise<Object>} Saved product with Firestore ID
     */
    async saveProduct(productData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firestore not initialized');
                return null;
            }

            const productsCollection = window.FIREBASE_COLLECTIONS?.products || 'products';

            // Add timestamp
            const dataWithTimestamp = {
                ...productData,
                createdAt: new Date(),
                updatedAt: new Date()
            };


            // Save to Firestore
            const docRef = await this.db.collection(productsCollection).add(dataWithTimestamp);


            return {
                id: docRef.id,
                firestoreId: docRef.id,
                ...dataWithTimestamp
            };
        } catch (error) {
            console.error('Error saving product to Firestore:', error);
            return null;
        }
    }

    /**
     * Load all products from Firestore
     * @returns {Promise<Array>} Array of products
     */
    async loadProducts() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firestore not initialized');
                return [];
            }

            const productsCollection = window.FIREBASE_COLLECTIONS?.products || 'products';
            const snapshot = await this.db.collection(productsCollection).get();

            const products = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                products.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    ...data
                });
            });

            return products;
        } catch (error) {
            console.error('Error loading products from Firestore:', error);
            return [];
        }
    }

    /**
     * Get a single product by ID
     * @param {string} productId - Product ID from Firestore
     * @returns {Promise<Object>} Product data
     */
    async getProduct(productId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firestore not initialized');
                return null;
            }

            const productsCollection = window.FIREBASE_COLLECTIONS?.products || 'products';
            const doc = await this.db.collection(productsCollection).doc(productId).get();

            if (doc.exists) {
                return {
                    id: doc.id,
                    firestoreId: doc.id,
                    ...doc.data()
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting product:', error);
            return null;
        }
    }

    /**
     * Update a product in Firestore
     * @param {string} productId - Product ID from Firestore
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated product
     */
    async updateProduct(productId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firestore not initialized');
                return null;
            }

            const productsCollection = window.FIREBASE_COLLECTIONS?.products || 'products';

            const dataWithTimestamp = {
                ...updateData,
                updatedAt: new Date()
            };

            await this.db.collection(productsCollection).doc(productId).update(dataWithTimestamp);

            return await this.getProduct(productId);
        } catch (error) {
            console.error('Error updating product:', error);
            return null;
        }
    }

    /**
     * Delete a product from Firestore
     * @param {string} productId - Product ID from Firestore
     * @returns {Promise<boolean>} Success status
     */
    async deleteProduct(productId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firestore not initialized');
                return false;
            }

            const productsCollection = window.FIREBASE_COLLECTIONS?.products || 'products';

            await this.db.collection(productsCollection).doc(productId).delete();

            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            return false;
        }
    }

    /**
     * Set up real-time listener for products
     * @param {Function} callback - Function to call when products change
     * @returns {Function} Unsubscribe function
     */
    onProductsChange(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firestore not initialized');
                return null;
            }

            const productsCollection = window.FIREBASE_COLLECTIONS?.products || 'products';
            return this.db.collection(productsCollection).onSnapshot(snapshot => {
                const products = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    products.push({
                        id: doc.id,
                        firestoreId: doc.id,
                        ...data
                    });
                });
                callback(products);
            }, error => {
                console.error('Error listening to products:', error);
            });
        } catch (error) {
            console.error('Error setting up products listener:', error);
            return null;
        }
    }
}

// Initialize global Firebase Product Manager
const firebaseProductManager = new FirebaseProductManager();

// Initialize global Firebase Clock In Manager
const firebaseClockInManager = new FirebaseClockInManager();

/**
 * Firebase Training Manager
 * Handles Firebase Firestore and Storage operations for training materials
 */
class FirebaseTrainingManager {
    constructor() {
        this.db = null;
        this.storage = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase (uses shared Firebase instance)
     */
    async initialize() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                this.db = firebase.firestore();
                this.storage = firebase.storage();
                this.isInitialized = true;
                return true;
            } else {
                console.error('Firebase not loaded for Training Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Training Manager:', error);
            return false;
        }
    }

    /**
     * Load trainings from Firestore
     * @returns {Promise<Array>} Array of training records
     */
    async loadTrainings() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Training Manager not initialized. Using fallback data.');
                return [];
            }

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';
            const snapshot = await this.db.collection(trainingsCollection)
                .orderBy('createdAt', 'desc')
                .get();

            const trainings = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                trainings.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    title: data.title || '',
                    type: data.type || 'video',
                    url: data.url || '',
                    fileUrl: data.fileUrl || null,
                    fileName: data.fileName || null,
                    fileSize: data.fileSize || null,
                    duration: data.duration || '30 min',
                    completion: data.completion || 0,
                    required: data.required !== undefined ? data.required : false,
                    description: data.description || '',
                    completions: data.completions || [],
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                });
            });

            return trainings;
        } catch (error) {
            console.error('Error loading trainings from Firestore:', error);
            return [];
        }
    }

    /**
     * Upload file to Firebase Storage
     * @param {File} file - File to upload
     * @param {string} trainingId - Training ID for path organization
     * @returns {Promise<Object>} Upload result with URL and metadata
     */
    async uploadFile(file, trainingId = null) {
        try {
            if (!this.isInitialized || !this.storage) {
                throw new Error('Firebase Storage not initialized');
            }

            // Generate unique filename
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const path = `trainings/${trainingId || 'temp'}/${timestamp}_${safeName}`;


            const storageRef = this.storage.ref(path);

            // Set custom metadata
            const metadata = {
                contentType: file.type,
                customMetadata: {
                    'uploadedAt': new Date().toISOString(),
                    'originalName': file.name
                }
            };

            // Upload file with progress tracking
            const uploadTask = storageRef.put(file, metadata);

            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Progress tracking
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                        // Dispatch custom event for progress UI
                        window.dispatchEvent(new CustomEvent('uploadProgress', {
                            detail: { progress, fileName: file.name }
                        }));
                    },
                    (error) => {
                        console.error('❌ Upload error:', error);
                        console.error('Error code:', error.code);
                        console.error('Error message:', error.message);

                        // Provide more detailed error info
                        if (error.code === 'storage/unauthorized') {
                            reject(new Error('Storage permission denied. Please check Firebase Storage rules.'));
                        } else if (error.code === 'storage/canceled') {
                            reject(new Error('Upload was canceled.'));
                        } else if (error.code === 'storage/unknown') {
                            reject(new Error('Unknown error occurred. Firebase Storage might not be enabled.'));
                        } else {
                            reject(error);
                        }
                    },
                    async () => {
                        try {
                            // Get download URL
                            const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();

                            resolve({
                                url: downloadUrl,
                                path: path,
                                fileName: file.name,
                                fileSize: file.size,
                                fileType: file.type
                            });
                        } catch (urlError) {
                            console.error('❌ Error getting download URL:', urlError);
                            reject(urlError);
                        }
                    }
                );
            });
        } catch (error) {
            console.error('❌ Error uploading file:', error);
            throw error;
        }
    }

    /**
     * Add new training record to Firestore
     * @param {Object} trainingData - Training data to add
     * @param {File} file - Optional PDF file to upload
     * @returns {Promise<string>} New document ID
     */
    async addTraining(trainingData, file = null) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Training Manager not initialized.');
                return null;
            }

            // If there's a file, upload it first
            if (file) {
                const tempId = Date.now().toString();
                const uploadResult = await this.uploadFile(file, tempId);
                trainingData.fileUrl = uploadResult.url;
                trainingData.filePath = uploadResult.path;
                trainingData.fileName = uploadResult.fileName;
                trainingData.fileSize = uploadResult.fileSize;
                trainingData.fileType = uploadResult.fileType;
            }

            trainingData.createdAt = new Date();
            trainingData.updatedAt = new Date();

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';
            const docRef = await this.db.collection(trainingsCollection).add(trainingData);

            // If we uploaded to a temp path, we could move it here (optional optimization)
            return docRef.id;
        } catch (error) {
            console.error('Error adding training record:', error);
            throw error;
        }
    }

    /**
     * Update training record in Firestore
     * @param {string} trainingId - Training Firestore ID
     * @param {Object} updateData - Data to update
     * @param {File} newFile - Optional new PDF file to upload
     * @returns {Promise<boolean>} Success status
     */
    async updateTraining(trainingId, updateData, newFile = null) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Training Manager not initialized.');
                return false;
            }

            // If there's a new file, upload it
            if (newFile) {
                const uploadResult = await this.uploadFile(newFile, trainingId);
                updateData.fileUrl = uploadResult.url;
                updateData.filePath = uploadResult.path;
                updateData.fileName = uploadResult.fileName;
                updateData.fileSize = uploadResult.fileSize;
                updateData.fileType = uploadResult.fileType;
            }

            updateData.updatedAt = new Date();

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';
            await this.db.collection(trainingsCollection).doc(trainingId).update(updateData);

            return true;
        } catch (error) {
            console.error('Error updating training record:', error);
            return false;
        }
    }

    /**
     * Delete training record from Firestore (and associated file)
     * @param {string} trainingId - Training Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteTraining(trainingId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Training Manager not initialized.');
                return false;
            }

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';

            // Get the training to check for associated file
            const doc = await this.db.collection(trainingsCollection).doc(trainingId).get();
            if (doc.exists) {
                const data = doc.data();

                // Delete associated file from Storage if exists
                if (data.filePath && this.storage) {
                    try {
                        await this.storage.ref(data.filePath).delete();
                    } catch (fileError) {
                        console.warn('Could not delete associated file:', fileError);
                    }
                }
            }

            // Delete the Firestore document
            await this.db.collection(trainingsCollection).doc(trainingId).delete();

            return true;
        } catch (error) {
            console.error('Error deleting training record:', error);
            return false;
        }
    }

    /**
     * Get a single training by ID
     * @param {string} trainingId - Training Firestore ID
     * @returns {Promise<Object>} Training data
     */
    async getTraining(trainingId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Training Manager not initialized.');
                return null;
            }

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';
            const doc = await this.db.collection(trainingsCollection).doc(trainingId).get();

            if (doc.exists) {
                const data = doc.data();
                return {
                    id: doc.id,
                    firestoreId: doc.id,
                    ...data
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting training:', error);
            return null;
        }
    }

    /**
     * Update training completion percentage
     * @param {string} trainingId - Training Firestore ID
     * @param {number} completion - Completion percentage (0-100)
     * @returns {Promise<boolean>} Success status
     */
    async updateCompletion(trainingId, completion) {
        try {
            if (!this.isInitialized || !this.db) {
                return false;
            }

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';
            await this.db.collection(trainingsCollection).doc(trainingId).update({
                completion: Math.min(100, Math.max(0, completion)),
                updatedAt: new Date()
            });

            return true;
        } catch (error) {
            console.error('Error updating completion:', error);
            return false;
        }
    }

    /**
     * Set up real-time listener for trainings
     * @param {Function} callback - Function to call when data changes
     * @returns {Function} Unsubscribe function
     */
    onTrainingsChange(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Training Manager not initialized.');
                return null;
            }

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';
            return this.db.collection(trainingsCollection)
                .orderBy('createdAt', 'desc')
                .onSnapshot(snapshot => {
                    const trainings = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        trainings.push({
                            id: doc.id,
                            firestoreId: doc.id,
                            ...data
                        });
                    });
                    callback(trainings);
                }, error => {
                    console.error('Error listening to trainings:', error);
                });
        } catch (error) {
            console.error('Error setting up trainings listener:', error);
            return null;
        }
    }

    /**
     * Mark employee as completed for a training
     * @param {string} trainingId - Training ID
     * @param {string} employeeId - Employee ID
     * @returns {Promise<boolean>} Success status
     */
    async markEmployeeCompleted(trainingId, employeeId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Training Manager not initialized');
                return false;
            }

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';
            const trainingRef = this.db.collection(trainingsCollection).doc(trainingId);

            // Get current training data
            const trainingDoc = await trainingRef.get();
            if (!trainingDoc.exists) {
                console.error('Training not found');
                return false;
            }

            const completions = trainingDoc.data().completions || [];

            // Check if employee already completed
            const existingIndex = completions.findIndex(c => c.employeeId === employeeId);

            if (existingIndex >= 0) {
                // Update existing completion
                completions[existingIndex].completedAt = new Date();
            } else {
                // Add new completion
                completions.push({
                    employeeId: employeeId,
                    completedAt: new Date()
                });
            }

            // Calculate completion percentage based on total employees
            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            const employeesSnapshot = await this.db.collection(employeesCollection).get();
            const totalEmployees = employeesSnapshot.size;
            const completionPercentage = totalEmployees > 0 ? Math.round((completions.length / totalEmployees) * 100) : 0;

            await trainingRef.update({
                completions: completions,
                completion: completionPercentage,
                updatedAt: new Date()
            });

            return true;
        } catch (error) {
            console.error('Error marking employee as completed:', error);
            return false;
        }
    }

    /**
     * Remove employee completion for a training
     * @param {string} trainingId - Training ID
     * @param {string} employeeId - Employee ID
     * @returns {Promise<boolean>} Success status
     */
    async removeEmployeeCompletion(trainingId, employeeId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Training Manager not initialized');
                return false;
            }

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';
            const trainingRef = this.db.collection(trainingsCollection).doc(trainingId);

            // Get current training data
            const trainingDoc = await trainingRef.get();
            if (!trainingDoc.exists) {
                console.error('Training not found');
                return false;
            }

            const completions = trainingDoc.data().completions || [];
            const updatedCompletions = completions.filter(c => c.employeeId !== employeeId);

            // Calculate completion percentage based on total employees
            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            const employeesSnapshot = await this.db.collection(employeesCollection).get();
            const totalEmployees = employeesSnapshot.size;
            const completionPercentage = totalEmployees > 0 ? Math.round((updatedCompletions.length / totalEmployees) * 100) : 0;

            await trainingRef.update({
                completions: updatedCompletions,
                completion: completionPercentage,
                updatedAt: new Date()
            });

            return true;
        } catch (error) {
            console.error('Error removing employee completion:', error);
            return false;
        }
    }

    /**
     * Get completion stats for a training
     * @param {string} trainingId - Training ID
     * @returns {Promise<Object>} Completion stats
     */
    async getCompletionStats(trainingId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Training Manager not initialized');
                return null;
            }

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';
            const trainingDoc = await this.db.collection(trainingsCollection).doc(trainingId).get();

            if (!trainingDoc.exists) {
                return null;
            }

            const completions = trainingDoc.data().completions || [];

            return {
                totalCompleted: completions.length,
                completions: completions
            };
        } catch (error) {
            console.error('Error getting completion stats:', error);
            return null;
        }
    }

    /**
     * Get all mandatory trainings with completion status
     * @returns {Promise<Array>} Array of mandatory trainings with completion data
     */
    async getMandatoryTrainings() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Training Manager not initialized');
                return [];
            }

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';
            const snapshot = await this.db.collection(trainingsCollection)
                .where('required', '==', true)
                .orderBy('createdAt', 'desc')
                .get();

            const trainings = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                trainings.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    title: data.title || '',
                    type: data.type || 'video',
                    required: data.required !== undefined ? data.required : true,
                    completions: data.completions || [],
                    createdAt: data.createdAt
                });
            });

            return trainings;
        } catch (error) {
            console.error('Error loading mandatory trainings:', error);
            return [];
        }
    }
}

/**
 * Firebase Vendors Manager
 * Handles Firestore operations for vendors management
 */
class FirebaseVendorsManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.vendorsListener = null;
    }

    /**
     * Initialize Firebase
     */
    async initialize() {
        try {
            if (typeof firebase !== 'undefined' && firebase.initializeApp) {
                const config = window.FIREBASE_CONFIG;
                
                if (!firebase.apps || firebase.apps.length === 0) {
                    firebase.initializeApp(config);
                }
                
                this.db = firebase.firestore();
                this.isInitialized = true;
                return true;
            } else {
                console.error('Firebase not loaded');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase:', error);
            return false;
        }
    }

    /**
     * Load vendors from Firestore
     * @returns {Promise<Array>} Array of vendors
     */
    async loadVendors() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase not initialized. Using fallback data.');
                return [];
            }

            const vendorsCollection = window.FIREBASE_COLLECTIONS?.vendors || 'vendors';
            const snapshot = await this.db.collection(vendorsCollection).get();
            
            const vendors = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                vendors.push({
                    firestoreId: doc.id,
                    ...data
                });
            });

            return vendors;
        } catch (error) {
            console.error('Error loading vendors from Firestore:', error);
            return [];
        }
    }

    /**
     * Get a single vendor by Firestore ID
     * @param {string} vendorId - Vendor Firestore ID
     * @returns {Promise<Object>} Vendor data
     */
    async getVendor(vendorId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase not initialized.');
                return null;
            }

            const vendorsCollection = window.FIREBASE_COLLECTIONS?.vendors || 'vendors';
            const doc = await this.db.collection(vendorsCollection).doc(vendorId).get();
            
            if (doc.exists) {
                return {
                    firestoreId: doc.id,
                    ...doc.data()
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting vendor:', error);
            return null;
        }
    }

    /**
     * Add new vendor to Firestore
     * @param {Object} vendorData - Vendor data to add
     * @returns {Promise<string>} New document ID
     */
    async addVendor(vendorData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return null;
            }

            vendorData.createdAt = new Date();
            vendorData.updatedAt = new Date();

            const vendorsCollection = window.FIREBASE_COLLECTIONS?.vendors || 'vendors';
            const docRef = await this.db.collection(vendorsCollection).add(vendorData);
            
            return docRef.id;
        } catch (error) {
            console.error('Error adding vendor:', error);
            throw error;
        }
    }

    /**
     * Update vendor in Firestore
     * @param {string} vendorId - Vendor Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateVendor(vendorId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const vendorsCollection = window.FIREBASE_COLLECTIONS?.vendors || 'vendors';
            await this.db.collection(vendorsCollection).doc(vendorId).update(updateData);
            
            return true;
        } catch (error) {
            console.error('Error updating vendor:', error);
            return false;
        }
    }

    /**
     * Delete vendor from Firestore
     * @param {string} vendorId - Vendor Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteVendor(vendorId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return false;
            }

            const vendorsCollection = window.FIREBASE_COLLECTIONS?.vendors || 'vendors';
            await this.db.collection(vendorsCollection).doc(vendorId).delete();
            
            return true;
        } catch (error) {
            console.error('Error deleting vendor:', error);
            return false;
        }
    }

    /**
     * Set up real-time listener for vendors
     * @param {Function} callback - Callback function when vendors change
     * @returns {Function} Unsubscribe function
     */
    setupVendorsListener(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase not initialized.');
                return null;
            }

            const vendorsCollection = window.FIREBASE_COLLECTIONS?.vendors || 'vendors';
            this.vendorsListener = this.db.collection(vendorsCollection)
                .onSnapshot(snapshot => {
                    const vendors = [];
                    snapshot.forEach(doc => {
                        vendors.push({
                            firestoreId: doc.id,
                            ...doc.data()
                        });
                    });
                    callback(vendors);
                });

            return () => {
                if (this.vendorsListener) {
                    this.vendorsListener();
                }
            };
        } catch (error) {
            console.error('Error setting up vendors listener:', error);
            return null;
        }
    }

    /**
     * Create sample vendors for testing (if collection is empty)
     * @returns {Promise<void>}
     */
    async createSampleVendors() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase not initialized.');
                return;
            }

            const vendorsCollection = window.FIREBASE_COLLECTIONS?.vendors || 'vendors';
            
            try {
                const snapshot = await this.db.collection(vendorsCollection).get();

                // Only add samples if collection is empty
                if (snapshot.empty) {
                    this.addSampleVendorsToCollection(vendorsCollection);
                }
            } catch (err) {
                // Collection doesn't exist, create it with sample data
                this.addSampleVendorsToCollection(vendorsCollection);
            }
        } catch (error) {
            console.error('Error in createSampleVendors:', error);
        }
    }

    /**
     * Helper function to add sample vendors to collection
     * @private
     */
    async addSampleVendorsToCollection(vendorsCollection) {
        try {
            const sampleVendors = [
                {
                    name: 'VaporHub Distributors',
                    category: 'Vape Products',
                    contact: 'John Martinez',
                    phone: '(800) 555-0101',
                    email: 'sales@vaporhub.com',
                    website: 'https://www.vaporhub.com',
                    access: 'Online Portal - Account #VH12345',
                    products: 'Disposable vapes, Pod systems, E-liquids, Accessories',
                    orderMethods: 'Online portal, Phone orders, Email orders',
                    notes: 'Net 30 payment terms, Free shipping over $500',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: 'Premium Tobacco Supply',
                    category: 'Tobacco Products',
                    contact: 'Sarah Johnson',
                    phone: '(800) 555-0202',
                    email: 'orders@premiumtobacco.com',
                    website: 'https://www.premiumtobacco.com',
                    access: 'Account Manager: Sarah - Direct line (800) 555-0203',
                    products: 'Cigarettes, Cigars, Rolling papers, Lighters',
                    orderMethods: 'Phone orders (preferred), Email',
                    notes: 'Minimum order $1000, Weekly deliveries on Thursdays',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: 'Beverage Wholesale Direct',
                    category: 'Beverages',
                    contact: 'Mike Chen',
                    phone: '(800) 555-0303',
                    email: 'info@beveragewholesale.com',
                    website: 'https://www.beveragewholesale.com',
                    access: 'Online ordering system - Username: VSU_Admin',
                    products: 'Energy drinks, Sodas, Water, Sports drinks, Coffee',
                    orderMethods: 'Online portal (24/7), Phone (business hours)',
                    notes: 'Next day delivery available, Volume discounts',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: 'Snack Solutions Inc',
                    category: 'Snacks & Candy',
                    contact: 'Lisa Rodriguez',
                    phone: '(800) 555-0404',
                    email: 'sales@snacksolutions.com',
                    website: 'https://www.snacksolutions.com',
                    access: 'Rep visits monthly, Online catalog access',
                    products: 'Chips, Candy bars, Gum, Cookies, Nuts',
                    orderMethods: 'Mobile app, Website, Sales rep',
                    notes: 'Flexible payment terms, Returns accepted',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: 'General Supplies Co',
                    category: 'Store Supplies',
                    contact: 'David Park',
                    phone: '(800) 555-0505',
                    email: 'support@generalsupplies.com',
                    website: 'https://www.generalsupplies.com',
                    access: 'Amazon Business account linked',
                    products: 'Bags, Receipt paper, Cleaning supplies, Office supplies',
                    orderMethods: 'Amazon Business, Direct website, Phone',
                    notes: 'Prime shipping available, Bulk discounts',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            // Add each sample vendor - this will create the collection if it doesn't exist
            let count = 0;
            for (const vendor of sampleVendors) {
                await this.db.collection(vendorsCollection).add(vendor);
                count++;
            }

        } catch (error) {
            console.error('Error adding sample vendors to collection:', error);
        }
    }
}

// Initialize global Firebase Vendors Manager
const firebaseVendorsManager = new FirebaseVendorsManager();

// Initialize global Firebase Training Manager
const firebaseTrainingManager = new FirebaseTrainingManager();

/**
 * Firebase Invoice Manager
 * Handles Firebase Firestore operations for invoice management with Base64 image storage
 */
class FirebaseInvoiceManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase (uses shared Firebase instance)
     */
    async initialize() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                this.db = firebase.firestore();
                this.isInitialized = true;
                return true;
            } else {
                console.error('Firebase not loaded for Invoice Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Invoice Manager:', error);
            return false;
        }
    }

    /**
     * Load invoices from Firestore
     * @returns {Promise<Array>} Array of invoice records
     */
    async loadInvoices() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Invoice Manager not initialized. Using fallback data.');
                return [];
            }

            const invoicesCollection = window.FIREBASE_COLLECTIONS?.invoices || 'invoices';
            const snapshot = await this.db.collection(invoicesCollection)
                .orderBy('createdAt', 'desc')
                .get();

            const invoices = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                invoices.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    invoiceNumber: data.invoiceNumber || '',
                    vendor: data.vendor || '',
                    category: data.category || '',
                    description: data.description || '',
                    amount: data.amount || 0,
                    dueDate: data.dueDate || '',
                    paidDate: data.paidDate || null,
                    status: data.status || 'pending',
                    paymentAccount: data.paymentAccount || '',
                    recurring: data.recurring || false,
                    store: data.store || null,  // Store assignment
                    notes: data.notes || '',
                    photo: data.photo || null,
                    fileType: data.fileType || null,  // 'pdf' or 'image' or null
                    fileName: data.fileName || null,  // Original filename for PDFs
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                });
            });

            return invoices;
        } catch (error) {
            console.error('Error loading invoices from Firestore:', error);
            return [];
        }
    }

    /**
     * Add new invoice record to Firestore
     * @param {Object} invoiceData - Invoice data to add (with Base64 photo)
     * @returns {Promise<string>} New document ID
     */
    async addInvoice(invoiceData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Invoice Manager not initialized.');
                return null;
            }

            invoiceData.createdAt = new Date();
            invoiceData.updatedAt = new Date();

            const invoicesCollection = window.FIREBASE_COLLECTIONS?.invoices || 'invoices';
            const docRef = await this.db.collection(invoicesCollection).add(invoiceData);

            return docRef.id;
        } catch (error) {
            console.error('Error adding invoice record:', error);
            return null;
        }
    }

    /**
     * Update invoice record in Firestore
     * @param {string} invoiceId - Invoice Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateInvoice(invoiceId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Invoice Manager not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const invoicesCollection = window.FIREBASE_COLLECTIONS?.invoices || 'invoices';
            await this.db.collection(invoicesCollection).doc(invoiceId).update(updateData);

            return true;
        } catch (error) {
            console.error('Error updating invoice record:', error);
            return false;
        }
    }

    /**
     * Delete invoice record from Firestore
     * @param {string} invoiceId - Invoice Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteInvoice(invoiceId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Invoice Manager not initialized.');
                return false;
            }

            const invoicesCollection = window.FIREBASE_COLLECTIONS?.invoices || 'invoices';
            await this.db.collection(invoicesCollection).doc(invoiceId).delete();

            return true;
        } catch (error) {
            console.error('Error deleting invoice record:', error);
            return false;
        }
    }

    /**
     * Mark invoice as paid in Firestore
     * @param {string} invoiceId - Invoice Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async markInvoicePaid(invoiceId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Invoice Manager not initialized.');
                return false;
            }

            const updateData = {
                status: 'paid',
                paidDate: new Date().toISOString().split('T')[0],
                updatedAt: new Date()
            };

            const invoicesCollection = window.FIREBASE_COLLECTIONS?.invoices || 'invoices';
            await this.db.collection(invoicesCollection).doc(invoiceId).update(updateData);

            return true;
        } catch (error) {
            console.error('Error marking invoice as paid:', error);
            return false;
        }
    }

    /**
     * Listen to invoices collection for real-time updates
     * @param {Function} callback - Function to call with updated invoices array
     * @returns {Function} Unsubscribe function
     */
    listenToInvoices(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Invoice Manager not initialized.');
                return null;
            }

            const invoicesCollection = window.FIREBASE_COLLECTIONS?.invoices || 'invoices';
            return this.db.collection(invoicesCollection)
                .orderBy('createdAt', 'desc')
                .onSnapshot(snapshot => {
                    const invoices = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        invoices.push({
                            id: doc.id,
                            firestoreId: doc.id,
                            invoiceNumber: data.invoiceNumber || '',
                            vendor: data.vendor || '',
                            category: data.category || '',
                            description: data.description || '',
                            amount: data.amount || 0,
                            dueDate: data.dueDate || '',
                            paidDate: data.paidDate || null,
                            status: data.status || 'pending',
                            recurring: data.recurring || false,
                            notes: data.notes || '',
                            photo: data.photo || null,
                            fileType: data.fileType || null,
                            fileName: data.fileName || null,
                            createdAt: data.createdAt,
                            updatedAt: data.updatedAt
                        });
                    });
                    callback(invoices);
                }, error => {
                    console.error('Error listening to invoices:', error);
                });
        } catch (error) {
            console.error('Error setting up invoices listener:', error);
            return null;
        }
    }
}

// Initialize global Firebase Invoice Manager
const firebaseInvoiceManager = new FirebaseInvoiceManager();

/**
 * Firebase Announcements Manager
 * Handles Firebase Firestore operations for announcements
 */
class FirebaseAnnouncementsManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase (uses shared Firebase instance)
     */
    async initialize() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                this.db = firebase.firestore();
                this.isInitialized = true;
                return true;
            } else {
                console.error('Firebase not loaded for Announcements Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Announcements Manager:', error);
            return false;
        }
    }

    /**
     * Load announcements from Firestore
     * @returns {Promise<Array>} Array of announcement records
     */
    async loadAnnouncements() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Announcements Manager not initialized. Using fallback data.');
                return [];
            }

            const announcementsCollection = window.FIREBASE_COLLECTIONS?.announcements || 'announcements';
            const snapshot = await this.db.collection(announcementsCollection)
                .orderBy('date', 'desc')
                .get();

            const announcements = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                announcements.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    date: data.date || '',
                    title: data.title || '',
                    content: data.content || '',
                    author: data.author || 'Unknown',
                    targetStores: data.targetStores || 'all',
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                });
            });

            return announcements;
        } catch (error) {
            console.error('Error loading announcements from Firestore:', error);
            return [];
        }
    }

    /**
     * Add new announcement to Firestore
     * @param {Object} announcementData - Announcement data to add
     * @returns {Promise<string>} New document ID
     */
    async addAnnouncement(announcementData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Announcements Manager not initialized.');
                return null;
            }

            announcementData.createdAt = new Date();
            announcementData.updatedAt = new Date();

            const announcementsCollection = window.FIREBASE_COLLECTIONS?.announcements || 'announcements';
            const docRef = await this.db.collection(announcementsCollection).add(announcementData);

            return docRef.id;
        } catch (error) {
            console.error('Error adding announcement:', error);
            return null;
        }
    }

    /**
     * Update announcement in Firestore
     * @param {string} announcementId - Announcement Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateAnnouncement(announcementId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Announcements Manager not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const announcementsCollection = window.FIREBASE_COLLECTIONS?.announcements || 'announcements';
            await this.db.collection(announcementsCollection).doc(announcementId).update(updateData);

            return true;
        } catch (error) {
            console.error('Error updating announcement:', error);
            return false;
        }
    }

    /**
     * Delete announcement from Firestore
     * @param {string} announcementId - Announcement Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteAnnouncement(announcementId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Announcements Manager not initialized.');
                return false;
            }

            const announcementsCollection = window.FIREBASE_COLLECTIONS?.announcements || 'announcements';
            await this.db.collection(announcementsCollection).doc(announcementId).delete();

            return true;
        } catch (error) {
            console.error('Error deleting announcement:', error);
            return false;
        }
    }

    /**
     * Get read announcements for a specific user
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of read announcement IDs
     */
    async getReadAnnouncements(userId) {
        try {
            if (!this.isInitialized || !this.db || !userId) {
                return [];
            }

            const readAnnouncementsCollection = window.FIREBASE_COLLECTIONS?.readAnnouncements || 'readAnnouncements';
            const doc = await this.db.collection(readAnnouncementsCollection).doc(userId).get();

            if (doc.exists) {
                const data = doc.data();
                return data.readIds || [];
            }
            return [];
        } catch (error) {
            console.error('Error getting read announcements:', error);
            return [];
        }
    }

    /**
     * Mark announcements as read for a specific user
     * @param {string} userId - User ID
     * @param {Array} announcementIds - Array of announcement IDs to mark as read
     * @returns {Promise<boolean>} Success status
     */
    async markAnnouncementsAsRead(userId, announcementIds) {
        try {
            if (!this.isInitialized || !this.db || !userId || !announcementIds.length) {
                return false;
            }

            const readAnnouncementsCollection = window.FIREBASE_COLLECTIONS?.readAnnouncements || 'readAnnouncements';
            const docRef = this.db.collection(readAnnouncementsCollection).doc(userId);
            const doc = await docRef.get();

            let existingIds = [];
            if (doc.exists) {
                existingIds = doc.data().readIds || [];
            }

            // Merge existing and new IDs (avoid duplicates)
            const mergedIds = [...new Set([...existingIds, ...announcementIds])];

            await docRef.set({
                readIds: mergedIds,
                updatedAt: new Date()
            });

            return true;
        } catch (error) {
            console.error('Error marking announcements as read:', error);
            return false;
        }
    }

    /**
     * Listen to announcements collection for real-time updates
     * @param {Function} callback - Function to call with updated announcements array
     * @returns {Function} Unsubscribe function
     */
    listenToAnnouncements(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Announcements Manager not initialized.');
                return null;
            }

            const announcementsCollection = window.FIREBASE_COLLECTIONS?.announcements || 'announcements';
            return this.db.collection(announcementsCollection)
                .orderBy('date', 'desc')
                .onSnapshot(snapshot => {
                    const announcements = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        announcements.push({
                            id: doc.id,
                            firestoreId: doc.id,
                            date: data.date || '',
                            title: data.title || '',
                            content: data.content || '',
                            author: data.author || 'Unknown',
                            targetStores: data.targetStores || 'all',
                            createdAt: data.createdAt,
                            updatedAt: data.updatedAt
                        });
                    });
                    callback(announcements);
                }, error => {
                    console.error('Error listening to announcements:', error);
                });
        } catch (error) {
            console.error('Error setting up announcements listener:', error);
            return null;
        }
    }
}

// Initialize global Firebase Announcements Manager
const firebaseAnnouncementsManager = new FirebaseAnnouncementsManager();

class FirebaseRestockRequestsManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase (uses shared Firebase instance)
     */
    async initialize() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                this.db = firebase.firestore();
                this.isInitialized = true;
                return true;
            } else {
                console.error('Firebase not loaded for Restock Requests Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Restock Requests Manager:', error);
            return false;
        }
    }

    /**
     * Load restock requests from Firestore
     * @returns {Promise<Array>} Array of restock requests
     */
    async loadRestockRequests() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Restock Requests Manager not initialized. Using fallback data.');
                return [];
            }

            const requestsCollection = window.FIREBASE_COLLECTIONS?.restockRequests || 'restockRequests';
            const snapshot = await this.db.collection(requestsCollection)
                .orderBy('requestDate', 'desc')
                .get();

            const requests = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                requests.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    productName: data.productName || '',
                    itemType: data.itemType || 'product',
                    quantity: data.quantity || 0,
                    store: data.store || '',
                    requestedBy: data.requestedBy || '',
                    requestDate: data.requestDate || '',
                    status: data.status || 'pending',
                    priority: data.priority || 'medium',
                    notes: data.notes || ''
                });
            });

            return requests;
        } catch (error) {
            console.error('Error loading restock requests from Firestore:', error);
            return [];
        }
    }

    /**
     * Add new restock request to Firestore
     * @param {Object} requestData - Request data to add
     * @returns {Promise<string>} New document ID
     */
    async addRestockRequest(requestData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Restock Requests Manager not initialized.');
                return null;
            }

            requestData.createdAt = new Date();
            requestData.updatedAt = new Date();

            const requestsCollection = window.FIREBASE_COLLECTIONS?.restockRequests || 'restockRequests';
            const docRef = await this.db.collection(requestsCollection).add(requestData);

            return docRef.id;
        } catch (error) {
            console.error('Error adding restock request:', error);
            return null;
        }
    }

    /**
     * Update restock request in Firestore
     * @param {string} requestId - Request Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateRestockRequest(requestId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Restock Requests Manager not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const requestsCollection = window.FIREBASE_COLLECTIONS?.restockRequests || 'restockRequests';
            await this.db.collection(requestsCollection).doc(requestId).update(updateData);

            return true;
        } catch (error) {
            console.error('Error updating restock request:', error);
            return false;
        }
    }

    /**
     * Delete restock request from Firestore
     * @param {string} requestId - Request Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteRestockRequest(requestId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Restock Requests Manager not initialized.');
                return false;
            }

            const requestsCollection = window.FIREBASE_COLLECTIONS?.restockRequests || 'restockRequests';
            await this.db.collection(requestsCollection).doc(requestId).delete();

            return true;
        } catch (error) {
            console.error('Error deleting restock request:', error);
            return false;
        }
    }

    /**
     * Listen to real-time updates for restock requests
     * @param {Function} callback - Callback function to handle updates
     * @returns {Function} Unsubscribe function
     */
    listenToRestockRequests(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Restock Requests Manager not initialized.');
                return null;
            }

            const requestsCollection = window.FIREBASE_COLLECTIONS?.restockRequests || 'restockRequests';
            return this.db.collection(requestsCollection)
                .orderBy('requestDate', 'desc')
                .onSnapshot(snapshot => {
                    const requests = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        requests.push({
                            id: doc.id,
                            firestoreId: doc.id,
                            productName: data.productName || '',
                            quantity: data.quantity || 0,
                            store: data.store || '',
                            requestedBy: data.requestedBy || '',
                            requestDate: data.requestDate || '',
                            status: data.status || 'pending',
                            priority: data.priority || 'medium',
                            notes: data.notes || ''
                        });
                    });
                    callback(requests);
                }, error => {
                    console.error('Error listening to restock requests:', error);
                });
        } catch (error) {
            console.error('Error setting up restock requests listener:', error);
            return null;
        }
    }
}

// Initialize global Firebase Restock Requests Manager
const firebaseRestockRequestsManager = new FirebaseRestockRequestsManager();

/**
 * Firebase Change Records Manager
 * Handles Firebase Firestore operations for change records (cambio dejado en Campos)
 */
class FirebaseChangeRecordsManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase (uses shared Firebase instance)
     */
    async initialize() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                this.db = firebase.firestore();
                this.isInitialized = true;
                return true;
            } else {
                console.error('Firebase not loaded for Change Records Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Change Records Manager:', error);
            return false;
        }
    }

    /**
     * Load change records from Firestore
     * @returns {Promise<Array>} Array of change records
     */
    async loadChangeRecords() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Change Records Manager not initialized. Using fallback data.');
                return [];
            }

            const changeCollection = window.FIREBASE_COLLECTIONS?.changeRecords || 'changeRecords';
            const snapshot = await this.db.collection(changeCollection)
                .orderBy('date', 'desc')
                .get();

            const records = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                records.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    store: data.store || '',
                    amount: data.amount || 0,
                    date: data.date || '',
                    leftBy: data.leftBy || '',
                    receivedBy: data.receivedBy || '',
                    recordedBy: data.recordedBy || '',
                    notes: data.notes || '',
                    photo: data.photo || null,
                    photoPath: data.photoPath || null,
                    denominations: data.denominations || {},
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                });
            });

            return records;
        } catch (error) {
            console.error('Error loading change records from Firestore:', error);
            return [];
        }
    }

    /**
     * Add new change record to Firestore
     * @param {Object} recordData - Record data to add
     * @returns {Promise<string>} New document ID
     */
    async addChangeRecord(recordData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Change Records Manager not initialized.');
                return null;
            }

            recordData.createdAt = new Date();
            recordData.updatedAt = new Date();

            const changeCollection = window.FIREBASE_COLLECTIONS?.changeRecords || 'changeRecords';
            const docRef = await this.db.collection(changeCollection).add(recordData);

            return docRef.id;
        } catch (error) {
            console.error('Error adding change record:', error);
            return null;
        }
    }

    /**
     * Update change record in Firestore
     * @param {string} recordId - Record Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateChangeRecord(recordId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Change Records Manager not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const changeCollection = window.FIREBASE_COLLECTIONS?.changeRecords || 'changeRecords';
            await this.db.collection(changeCollection).doc(recordId).update(updateData);

            return true;
        } catch (error) {
            console.error('Error updating change record:', error);
            return false;
        }
    }

    /**
     * Delete change record from Firestore
     * @param {string} recordId - Record Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteChangeRecord(recordId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Change Records Manager not initialized.');
                return false;
            }

            const changeCollection = window.FIREBASE_COLLECTIONS?.changeRecords || 'changeRecords';
            await this.db.collection(changeCollection).doc(recordId).delete();

            return true;
        } catch (error) {
            console.error('Error deleting change record:', error);
            return false;
        }
    }

    /**
     * Listen to real-time updates for change records
     * @param {Function} callback - Callback function to handle updates
     * @returns {Function} Unsubscribe function
     */
    listenToChangeRecords(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Change Records Manager not initialized.');
                return null;
            }

            const changeCollection = window.FIREBASE_COLLECTIONS?.changeRecords || 'changeRecords';
            return this.db.collection(changeCollection)
                .orderBy('date', 'desc')
                .onSnapshot(snapshot => {
                    const records = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        records.push({
                            id: doc.id,
                            firestoreId: doc.id,
                            store: data.store || '',
                            amount: data.amount || 0,
                            date: data.date || '',
                            leftBy: data.leftBy || '',
                            receivedBy: data.receivedBy || '',
                            recordedBy: data.recordedBy || '',
                            notes: data.notes || '',
                            photo: data.photo || null,
                            photoPath: data.photoPath || null,
                            denominations: data.denominations || {},
                            createdAt: data.createdAt,
                            updatedAt: data.updatedAt
                        });
                    });
                    callback(records);
                }, error => {
                    console.error('Error listening to change records:', error);
                });
        } catch (error) {
            console.error('Error setting up change records listener:', error);
            return null;
        }
    }
}

// Initialize global Firebase Change Records Manager
const firebaseChangeRecordsManager = new FirebaseChangeRecordsManager();

/**
 * Firebase Cash Out Manager
 * Handles Firebase Firestore operations for cash out records
 */
class FirebaseCashOutManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase (uses shared Firebase instance)
     */
    async initialize() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                this.db = firebase.firestore();
                this.isInitialized = true;
                return true;
            } else {
                console.error('Firebase not loaded for Cash Out Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Cash Out Manager:', error);
            return false;
        }
    }

    /**
     * Load cash out records from Firestore
     * @returns {Promise<Array>} Array of cash out records
     */
    async loadCashOutRecords() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Cash Out Manager not initialized. Using fallback data.');
                return [];
            }

            const cashOutCollection = window.FIREBASE_COLLECTIONS?.cashOut || 'cashOut';
            const snapshot = await this.db.collection(cashOutCollection)
                .orderBy('createdDate', 'desc')
                .get();

            const records = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                records.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    name: data.name || '',
                    amount: data.amount || 0,
                    reason: data.reason || '',
                    createdDate: data.createdDate || '',
                    createdBy: data.createdBy || '',
                    store: data.store || '',
                    status: data.status || 'open',
                    closedDate: data.closedDate || null,
                    receiptPhoto: data.receiptPhoto || null,
                    amountSpent: data.amountSpent || null,
                    moneyLeft: data.moneyLeft || null,
                    hasMoneyLeft: data.hasMoneyLeft || null,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                });
            });

            return records;
        } catch (error) {
            console.error('Error loading cash out records from Firestore:', error);
            return [];
        }
    }

    /**
     * Add new cash out record to Firestore
     * @param {Object} recordData - Record data to add
     * @returns {Promise<string>} New document ID
     */
    async addCashOutRecord(recordData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Cash Out Manager not initialized.');
                return null;
            }

            recordData.createdAt = new Date();
            recordData.updatedAt = new Date();

            const cashOutCollection = window.FIREBASE_COLLECTIONS?.cashOut || 'cashOut';
            const docRef = await this.db.collection(cashOutCollection).add(recordData);

            return docRef.id;
        } catch (error) {
            console.error('Error adding cash out record:', error);
            return null;
        }
    }

    /**
     * Update cash out record in Firestore
     * @param {string} recordId - Record Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateCashOutRecord(recordId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Cash Out Manager not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const cashOutCollection = window.FIREBASE_COLLECTIONS?.cashOut || 'cashOut';
            await this.db.collection(cashOutCollection).doc(recordId).update(updateData);

            return true;
        } catch (error) {
            console.error('Error updating cash out record:', error);
            return false;
        }
    }

    /**
     * Delete cash out record from Firestore
     * @param {string} recordId - Record Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteCashOutRecord(recordId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Cash Out Manager not initialized.');
                return false;
            }

            const cashOutCollection = window.FIREBASE_COLLECTIONS?.cashOut || 'cashOut';
            await this.db.collection(cashOutCollection).doc(recordId).delete();

            return true;
        } catch (error) {
            console.error('Error deleting cash out record:', error);
            return false;
        }
    }

    /**
     * Listen to real-time updates for cash out records
     * @param {Function} callback - Callback function to handle updates
     * @returns {Function} Unsubscribe function
     */
    listenToCashOutRecords(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Cash Out Manager not initialized.');
                return null;
            }

            const cashOutCollection = window.FIREBASE_COLLECTIONS?.cashOut || 'cashOut';
            return this.db.collection(cashOutCollection)
                .orderBy('createdDate', 'desc')
                .onSnapshot(snapshot => {
                    const records = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        records.push({
                            id: doc.id,
                            firestoreId: doc.id,
                            name: data.name || '',
                            amount: data.amount || 0,
                            reason: data.reason || '',
                            createdDate: data.createdDate || '',
                            createdBy: data.createdBy || '',
                            store: data.store || '',
                            status: data.status || 'open',
                            closedDate: data.closedDate || null,
                            receiptPhoto: data.receiptPhoto || null,
                            amountSpent: data.amountSpent || null,
                            moneyLeft: data.moneyLeft || null,
                            hasMoneyLeft: data.hasMoneyLeft || null,
                            createdAt: data.createdAt,
                            updatedAt: data.updatedAt
                        });
                    });
                    callback(records);
                }, error => {
                    console.error('Error listening to cash out records:', error);
                });
        } catch (error) {
            console.error('Error setting up cash out records listener:', error);
            return null;
        }
    }
}

// Initialize global Firebase Cash Out Manager
const firebaseCashOutManager = new FirebaseCashOutManager();

/**
 * Firebase Gifts Manager
 * Handles all gifts (Control de Regalos en Especie) operations with Firestore
 */
class FirebaseGiftsManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase (uses shared Firebase instance)
     */
    async initialize() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                this.db = firebase.firestore();
                this.isInitialized = true;
                return true;
            } else {
                console.error('Firebase not loaded for Gifts Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Gifts Manager:', error);
            return false;
        }
    }

    /**
     * Load gifts from Firestore
     * @returns {Promise<Array>} Array of gift records
     */
    async loadGifts() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Gifts Manager not initialized. Using fallback data.');
                return [];
            }

            const giftsCollection = window.FIREBASE_COLLECTIONS?.gifts || 'gifts';
            const snapshot = await this.db.collection(giftsCollection)
                .orderBy('date', 'desc')
                .get();

            const gifts = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                gifts.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    product: data.product || '',
                    quantity: data.quantity || 0,
                    value: data.value || 0,
                    recipient: data.recipient || '',
                    recipientType: data.recipientType || 'customer',
                    reason: data.reason || '',
                    store: data.store || '',
                    date: data.date || '',
                    notes: data.notes || '',
                    photo: data.photo || null,
                    photoPath: data.photoPath || null
                });
            });

            return gifts;
        } catch (error) {
            console.error('Error loading gifts from Firestore:', error);
            return [];
        }
    }

    /**
     * Add new gift record to Firestore
     * @param {Object} giftData - Gift data to add
     * @returns {Promise<string>} New document ID
     */
    async addGift(giftData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Gifts Manager not initialized.');
                return null;
            }

            giftData.createdAt = new Date();
            giftData.updatedAt = new Date();

            const giftsCollection = window.FIREBASE_COLLECTIONS?.gifts || 'gifts';
            const docRef = await this.db.collection(giftsCollection).add(giftData);

            return docRef.id;
        } catch (error) {
            console.error('Error adding gift record:', error);
            return null;
        }
    }

    /**
     * Update gift record in Firestore
     * @param {string} giftId - Gift Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateGift(giftId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Gifts Manager not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const giftsCollection = window.FIREBASE_COLLECTIONS?.gifts || 'gifts';
            await this.db.collection(giftsCollection).doc(giftId).update(updateData);

            return true;
        } catch (error) {
            console.error('Error updating gift record:', error);
            return false;
        }
    }

    /**
     * Delete gift record from Firestore
     * @param {string} giftId - Gift Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteGift(giftId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Gifts Manager not initialized.');
                return false;
            }

            const giftsCollection = window.FIREBASE_COLLECTIONS?.gifts || 'gifts';
            await this.db.collection(giftsCollection).doc(giftId).delete();

            return true;
        } catch (error) {
            console.error('Error deleting gift record:', error);
            return false;
        }
    }
}

// Initialize global Firebase Gifts Manager
const firebaseGiftsManager = new FirebaseGiftsManager();

/**
 * Firebase Issues Manager
 * Handles Firebase Firestore operations for issues registry
 */
class FirebaseIssuesManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase (uses shared Firebase instance)
     */
    async initialize() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                this.db = firebase.firestore();
                this.isInitialized = true;
                return true;
            } else {
                console.error('Firebase not loaded for Issues Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Issues Manager:', error);
            return false;
        }
    }

    /**
     * Load issues from Firestore
     * @returns {Promise<Array>} Array of issue records
     */
    async loadIssues() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Issues Manager not initialized. Using fallback data.');
                return [];
            }

            const issuesCollection = window.FIREBASE_COLLECTIONS?.issues || 'issues';
            const snapshot = await this.db.collection(issuesCollection)
                .orderBy('incidentDate', 'desc')
                .get();

            const issues = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                issues.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    customer: data.customer || 'Anonymous',
                    phone: data.phone || '',
                    type: data.type || 'In Store',
                    store: data.store || '',
                    description: data.description || '',
                    incidentDate: data.incidentDate || '',
                    perception: data.perception || null,
                    status: data.status || 'open',
                    createdBy: data.createdBy || '',
                    createdDate: data.createdDate || '',
                    solution: data.solution || null,
                    resolvedBy: data.resolvedBy || null,
                    resolutionDate: data.resolutionDate || null,
                    followUpNotes: data.followUpNotes || '',
                    statusHistory: data.statusHistory || [],
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                });
            });

            return issues;
        } catch (error) {
            console.error('Error loading issues from Firestore:', error);
            return [];
        }
    }

    /**
     * Add new issue to Firestore
     * @param {Object} issueData - Issue data to add
     * @returns {Promise<string>} New document ID
     */
    async addIssue(issueData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Issues Manager not initialized.');
                return null;
            }

            issueData.createdAt = new Date();
            issueData.updatedAt = new Date();

            const issuesCollection = window.FIREBASE_COLLECTIONS?.issues || 'issues';
            const docRef = await this.db.collection(issuesCollection).add(issueData);

            return docRef.id;
        } catch (error) {
            console.error('Error adding issue:', error);
            return null;
        }
    }

    /**
     * Update issue in Firestore
     * @param {string} issueId - Issue Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateIssue(issueId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Issues Manager not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const issuesCollection = window.FIREBASE_COLLECTIONS?.issues || 'issues';
            await this.db.collection(issuesCollection).doc(issueId).update(updateData);

            return true;
        } catch (error) {
            console.error('Error updating issue:', error);
            return false;
        }
    }

    /**
     * Delete issue from Firestore
     * @param {string} issueId - Issue Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteIssue(issueId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Issues Manager not initialized.');
                return false;
            }

            const issuesCollection = window.FIREBASE_COLLECTIONS?.issues || 'issues';
            await this.db.collection(issuesCollection).doc(issueId).delete();

            return true;
        } catch (error) {
            console.error('Error deleting issue:', error);
            return false;
        }
    }

    /**
     * Listen to real-time updates for issues
     * @param {Function} callback - Callback function to handle updates
     * @returns {Function} Unsubscribe function
     */
    listenToIssues(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Issues Manager not initialized.');
                return null;
            }

            const issuesCollection = window.FIREBASE_COLLECTIONS?.issues || 'issues';
            return this.db.collection(issuesCollection)
                .orderBy('incidentDate', 'desc')
                .onSnapshot(snapshot => {
                    const issues = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        issues.push({
                            id: doc.id,
                            firestoreId: doc.id,
                            customer: data.customer || 'Anonymous',
                            phone: data.phone || '',
                            type: data.type || 'In Store',
                            description: data.description || '',
                            incidentDate: data.incidentDate || '',
                            perception: data.perception || null,
                            status: data.status || 'open',
                            createdBy: data.createdBy || '',
                            createdDate: data.createdDate || '',
                            solution: data.solution || null,
                            resolvedBy: data.resolvedBy || null,
                            resolutionDate: data.resolutionDate || null,
                            createdAt: data.createdAt,
                            updatedAt: data.updatedAt
                        });
                    });
                    callback(issues);
                }, error => {
                    console.error('Error listening to issues:', error);
                });
        } catch (error) {
            console.error('Error setting up issues listener:', error);
            return null;
        }
    }
}

// Initialize global Firebase Issues Manager
const firebaseIssuesManager = new FirebaseIssuesManager();

/**
 * Firebase Licenses Manager
 * Handles Firestore operations for licenses and documents with PDF support
 */
class FirebaseLicensesManager {
    constructor() {
        this.db = null;
        this.rtdb = null; // Realtime Database
        this.storage = null;
        this.isInitialized = false;
        this.collectionName = 'licenses';
    }

    /**
     * Initialize Firebase connection
     */
    async initialize() {
        try {
            if (typeof firebase === 'undefined' || !firebase.initializeApp) {
                console.error('Firebase SDK not loaded');
                return false;
            }

            if (firebase.apps && firebase.apps.length > 0) {
                this.db = firebase.firestore();
                this.storage = firebase.storage();
                // Initialize Realtime Database
                if (firebase.database) {
                    this.rtdb = firebase.database();
                }
                this.isInitialized = true;
                return true;
            }

            const config = window.FIREBASE_CONFIG;
            if (!config) {
                console.error('Firebase config not found');
                return false;
            }

            firebase.initializeApp(config);
            this.db = firebase.firestore();
            this.storage = firebase.storage();
            // Initialize Realtime Database
            if (firebase.database) {
                this.rtdb = firebase.database();
            }
            this.isInitialized = true;

            return true;
        } catch (error) {
            console.error('Error initializing Firebase Licenses Manager:', error);
            return false;
        }
    }

    /**
     * Upload PDF file to Firebase Storage
     * @param {File} file - PDF file to upload
     * @param {string} licenseId - License ID for path organization
     * @returns {Promise<Object>} Upload result with URL and metadata
     */
    async uploadFile(file, licenseId = null) {
        try {
            if (!this.isInitialized || !this.storage) {
                throw new Error('Firebase Storage not initialized');
            }

            // Generate unique filename
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const path = `licenses/${licenseId || timestamp}/${timestamp}_${safeName}`;


            const storageRef = this.storage.ref(path);

            // Set custom metadata
            const metadata = {
                contentType: file.type,
                customMetadata: {
                    'uploadedAt': new Date().toISOString(),
                    'originalName': file.name
                }
            };

            // Upload file with progress tracking
            const uploadTask = storageRef.put(file, metadata);

            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Progress tracking
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                        // Dispatch custom event for progress UI
                        window.dispatchEvent(new CustomEvent('licenseUploadProgress', {
                            detail: { progress, fileName: file.name }
                        }));
                    },
                    (error) => {
                        console.error('❌ License upload error:', error);
                        console.error('Error code:', error.code);
                        console.error('Error message:', error.message);

                        if (error.code === 'storage/unauthorized') {
                            reject(new Error('Storage permission denied. Please check Firebase Storage rules.'));
                        } else if (error.code === 'storage/canceled') {
                            reject(new Error('Upload was canceled.'));
                        } else if (error.code === 'storage/unknown') {
                            reject(new Error('Unknown error occurred. Firebase Storage might not be enabled.'));
                        } else {
                            reject(error);
                        }
                    },
                    async () => {
                        try {
                            // Get download URL
                            const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();

                            resolve({
                                url: downloadUrl,
                                path: path,
                                fileName: file.name,
                                fileSize: file.size,
                                fileType: file.type
                            });
                        } catch (urlError) {
                            console.error('❌ Error getting download URL:', urlError);
                            reject(urlError);
                        }
                    }
                );
            });
        } catch (error) {
            console.error('❌ Error uploading license file:', error);
            throw error;
        }
    }

    /**
     * Load all licenses from Firestore
     */
    async loadLicenses() {
        if (!this.isInitialized || !this.db) {
            console.warn('Firebase Licenses not initialized');
            return [];
        }

        try {
            const collectionName = window.FIREBASE_COLLECTIONS?.licenses || this.collectionName;
            const snapshot = await this.db.collection(collectionName).orderBy('createdAt', 'desc').get();

            const licenses = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                licenses.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    name: data.name || '',
                    store: data.store || '',
                    expires: data.expires || '',
                    status: data.status || 'valid',
                    file: data.file || null,
                    // Support both legacy base64 and new Storage URL
                    fileData: data.fileData || null,
                    fileUrl: data.fileUrl || null,
                    filePath: data.filePath || null,
                    fileName: data.fileName || null,
                    fileType: data.fileType || null,
                    fileSize: data.fileSize || null,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    uploadedBy: data.uploadedBy || null
                });
            });

            return licenses;
        } catch (error) {
            console.error('Error loading licenses:', error);
            return [];
        }
    }

    /**
     * Add a new license to Firestore with optional file upload
     * Also creates a record in Realtime Database for tracking
     * @param {Object} licenseData - License metadata
     * @param {File} file - Optional PDF file to upload to Storage
     * @returns {Promise<string>} Document ID
     */
    async addLicense(licenseData, file = null) {
        if (!this.isInitialized || !this.db) {
            console.warn('Firebase Licenses not initialized');
            return null;
        }

        try {
            const collectionName = window.FIREBASE_COLLECTIONS?.licenses || this.collectionName;

            // If there's a file, upload it to Storage first
            if (file) {
                const tempId = Date.now().toString();
                const uploadResult = await this.uploadFile(file, tempId);

                // Update licenseData with Storage info
                licenseData.fileUrl = uploadResult.url;
                licenseData.filePath = uploadResult.path;
                licenseData.fileName = uploadResult.fileName;
                licenseData.fileSize = uploadResult.fileSize;
                licenseData.fileType = uploadResult.fileType;
                // Don't save base64 fileData if using Storage
                delete licenseData.fileData;
            }

            const dataToSave = {
                name: licenseData.name,
                store: licenseData.store,
                expires: licenseData.expires,
                status: licenseData.status,
                file: licenseData.file || null,
                fileName: licenseData.fileName || null,
                fileType: licenseData.fileType || null,
                fileUrl: licenseData.fileUrl || null,
                filePath: licenseData.filePath || null,
                fileSize: licenseData.fileSize || null,
                fileData: licenseData.fileData || null, // Legacy support for base64
                uploadedBy: licenseData.uploadedBy || null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Remove undefined values
            Object.keys(dataToSave).forEach(key => {
                if (dataToSave[key] === undefined) {
                    delete dataToSave[key];
                }
            });

            const docRef = await this.db.collection(collectionName).add(dataToSave);

            // Also save to Realtime Database for tracking
            if (this.rtdb) {
                try {
                    const rtdbData = {
                        firestoreId: docRef.id,
                        name: licenseData.name,
                        store: licenseData.store,
                        expires: licenseData.expires,
                        status: licenseData.status,
                        fileName: licenseData.fileName || null,
                        fileUrl: licenseData.fileUrl || null,
                        uploadedBy: licenseData.uploadedBy || null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    await this.rtdb.ref('licenses/' + docRef.id).set(rtdbData);
                } catch (rtdbError) {
                    console.warn('⚠️ Could not save to Realtime Database:', rtdbError.message);
                    // Don't fail the operation if RTDB fails, Firestore is primary
                }
            }

            return docRef.id;
        } catch (error) {
            console.error('Error adding license:', error);
            throw error;
        }
    }

    /**
     * Update an existing license
     */
    async updateLicense(licenseId, updates) {
        if (!this.isInitialized || !this.db) {
            console.warn('Firebase Licenses not initialized');
            return false;
        }

        try {
            const collectionName = window.FIREBASE_COLLECTIONS?.licenses || this.collectionName;

            const dataToUpdate = {
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Remove undefined values
            Object.keys(dataToUpdate).forEach(key => {
                if (dataToUpdate[key] === undefined) {
                    delete dataToUpdate[key];
                }
            });

            await this.db.collection(collectionName).doc(licenseId).update(dataToUpdate);
            return true;
        } catch (error) {
            console.error('Error updating license:', error);
            return false;
        }
    }

    /**
     * Delete a license from Firestore
     */
    async deleteLicense(licenseId) {
        if (!this.isInitialized || !this.db) {
            console.warn('Firebase Licenses not initialized');
            return false;
        }

        try {
            const collectionName = window.FIREBASE_COLLECTIONS?.licenses || this.collectionName;
            await this.db.collection(collectionName).doc(licenseId).delete();
            return true;
        } catch (error) {
            console.error('Error deleting license:', error);
            return false;
        }
    }

    /**
     * Get a single license by ID
     */
    async getLicense(licenseId) {
        if (!this.isInitialized || !this.db) {
            console.warn('Firebase Licenses not initialized');
            return null;
        }

        try {
            const collectionName = window.FIREBASE_COLLECTIONS?.licenses || this.collectionName;
            const doc = await this.db.collection(collectionName).doc(licenseId).get();

            if (doc.exists) {
                const data = doc.data();
                return {
                    id: doc.id,
                    firestoreId: doc.id,
                    ...data
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting license:', error);
            return null;
        }
    }

    /**
     * Listen to real-time updates for licenses
     */
    listenToLicenses(callback) {
        if (!this.isInitialized || !this.db) {
            console.warn('Firebase Licenses not initialized');
            return null;
        }

        try {
            const collectionName = window.FIREBASE_COLLECTIONS?.licenses || this.collectionName;

            return this.db.collection(collectionName)
                .orderBy('createdAt', 'desc')
                .onSnapshot(snapshot => {
                    const licenses = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        licenses.push({
                            id: doc.id,
                            firestoreId: doc.id,
                            name: data.name || '',
                            store: data.store || '',
                            expires: data.expires || '',
                            status: data.status || 'valid',
                            file: data.file || null,
                            fileData: data.fileData || null,
                            fileName: data.fileName || null,
                            fileType: data.fileType || null,
                            createdAt: data.createdAt,
                            updatedAt: data.updatedAt,
                            uploadedBy: data.uploadedBy || null
                        });
                    });
                    callback(licenses);
                }, error => {
                    console.error('Error listening to licenses:', error);
                });
        } catch (error) {
            console.error('Error setting up licenses listener:', error);
            return null;
        }
    }

    /**
     * Get licenses by store
     */
    async getLicensesByStore(store) {
        if (!this.isInitialized || !this.db) {
            console.warn('Firebase Licenses not initialized');
            return [];
        }

        try {
            const collectionName = window.FIREBASE_COLLECTIONS?.licenses || this.collectionName;
            const snapshot = await this.db.collection(collectionName)
                .where('store', '==', store)
                .get();

            const licenses = [];
            snapshot.forEach(doc => {
                licenses.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    ...doc.data()
                });
            });

            return licenses;
        } catch (error) {
            console.error('Error getting licenses by store:', error);
            return [];
        }
    }

    /**
     * Get licenses by status
     */
    async getLicensesByStatus(status) {
        if (!this.isInitialized || !this.db) {
            console.warn('Firebase Licenses not initialized');
            return [];
        }

        try {
            const collectionName = window.FIREBASE_COLLECTIONS?.licenses || this.collectionName;
            const snapshot = await this.db.collection(collectionName)
                .where('status', '==', status)
                .get();

            const licenses = [];
            snapshot.forEach(doc => {
                licenses.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    ...doc.data()
                });
            });

            return licenses;
        } catch (error) {
            console.error('Error getting licenses by status:', error);
            return [];
        }
    }
}

// Initialize global Firebase Licenses Manager
const firebaseLicensesManager = new FirebaseLicensesManager();
