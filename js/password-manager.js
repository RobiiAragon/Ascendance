// ============================================
// PASSWORD MANAGER MODULE
// ============================================

// Password Manager View State
let passwordViewMode = 'list'; // 'list' or 'grid'

// Firebase Password Manager
var firebasePasswords = [];

var firebasePasswordsManager = {
    isInitialized: false,
    db: null,

    async initialize() {
        try {
            if (typeof firebase === 'undefined' || !firebase.firestore) {
                console.warn('Firebase not available for Passwords');
                return false;
            }
            this.db = firebase.firestore();
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing Password Manager Firebase:', error);
            return false;
        }
    },

    async loadPasswords() {
        if (!this.isInitialized || !this.db) {
            console.warn('Passwords Firebase not initialized');
            return [];
        }

        try {
            const collectionName = window.FIREBASE_COLLECTIONS?.passwords || 'passwords';
            const snapshot = await this.db.collection(collectionName)
                .orderBy('createdAt', 'desc')
                .get();

            const passwords = [];
            snapshot.forEach(doc => {
                passwords.push({
                    firestoreId: doc.id,
                    ...doc.data()
                });
            });
            return passwords;
        } catch (error) {
            console.error('Error loading passwords:', error);
            return [];
        }
    },

    async addPassword(passwordData) {
        if (!this.isInitialized || !this.db) {
            throw new Error('Passwords Firebase not initialized');
        }

        try {
            const collectionName = window.FIREBASE_COLLECTIONS?.passwords || 'passwords';
            const docRef = await this.db.collection(collectionName).add({
                ...passwordData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('Password added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding password:', error);
            throw error;
        }
    },

    async updatePassword(firestoreId, updateData) {
        if (!this.isInitialized || !this.db) {
            throw new Error('Passwords Firebase not initialized');
        }

        try {
            const collectionName = window.FIREBASE_COLLECTIONS?.passwords || 'passwords';
            await this.db.collection(collectionName).doc(firestoreId).update({
                ...updateData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('Password updated:', firestoreId);
            return true;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    },

    async deletePassword(firestoreId) {
        if (!this.isInitialized || !this.db) {
            throw new Error('Passwords Firebase not initialized');
        }

        try {
            const collectionName = window.FIREBASE_COLLECTIONS?.passwords || 'passwords';
            await this.db.collection(collectionName).doc(firestoreId).delete();

            console.log('Password deleted:', firestoreId);
            return true;
        } catch (error) {
            console.error('Error deleting password:', error);
            throw error;
        }
    }
};

// Initialize Firebase Passwords
async function initializeFirebasePasswords() {
    // Guard against firebasePasswordsManager not yet initialized
    if (typeof firebasePasswordsManager === 'undefined' || !firebasePasswordsManager) {
        console.warn('Firebase Passwords Manager not yet initialized');
        return;
    }

    try {
        await firebasePasswordsManager.initialize();
        firebasePasswords = await firebasePasswordsManager.loadPasswords();

    } catch (error) {
        console.error('Error initializing Firebase Passwords:', error);
    }
}
window.initializeFirebasePasswords = initializeFirebasePasswords;

// Password categories with icons and colors
var passwordCategories = {
    'gas': { label: 'Gas & Utilities', icon: 'fa-fire-flame-curved', color: '#f97316' },
    'suppliers': { label: 'Suppliers', icon: 'fa-truck', color: '#8b5cf6' },
    'email': { label: 'Email Accounts', icon: 'fa-envelope', color: '#3b82f6' },
    'banking': { label: 'Banking & Finance', icon: 'fa-building-columns', color: '#10b981' },
    'software': { label: 'Software & Apps', icon: 'fa-laptop-code', color: '#ec4899' },
    'social': { label: 'Social Media', icon: 'fa-share-nodes', color: '#06b6d4' },
    'pos': { label: 'POS & Sales', icon: 'fa-cash-register', color: '#eab308' },
    'security': { label: 'Security Systems', icon: 'fa-shield-halved', color: '#ef4444' },
    'personal': { label: 'Personal', icon: 'fa-user-lock', color: '#6366f1' },
    'other': { label: 'Other', icon: 'fa-ellipsis', color: '#71717a' }
};

// Generate random password
function generateRandomPassword(length = 16) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Copy to clipboard
async function copyPasswordToClipboard(text, fieldName = 'Text') {
    try {
        await navigator.clipboard.writeText(text);
        showPasswordToast(`${fieldName} copied to clipboard!`, 'success');
    } catch (error) {
        console.error('Failed to copy:', error);
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showPasswordToast(`${fieldName} copied to clipboard!`, 'success');
        } catch (err) {
            showPasswordToast('Failed to copy to clipboard', 'error');
        }
        document.body.removeChild(textArea);
    }
}

// Toggle password visibility
function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Render Password Manager Page
window.renderPasswordManager = async function renderPasswordManager() {
    const dashboard = document.querySelector('.dashboard');

    // Check if user is administrator
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() :
                        (window.authManager?.getCurrentUser?.() || { role: 'employee' });
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'administrator';

    if (!isAdmin) {
        dashboard.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; padding: 40px;">
                <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 20px 40px rgba(239, 68, 68, 0.3);">
                    <i class="fas fa-lock" style="font-size: 48px; color: white;"></i>
                </div>
                <h2 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">Access Restricted</h2>
                <p style="font-size: 16px; color: var(--text-muted); max-width: 400px; line-height: 1.6; margin-bottom: 24px;">
                    The Password Manager is only accessible to Administrators.<br>
                    Please contact your system administrator if you need access.
                </p>
                <div style="padding: 16px 24px; background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color);">
                    <p style="font-size: 14px; color: var(--text-muted); margin: 0;">
                        <i class="fas fa-user" style="margin-right: 8px;"></i>
                        Logged in as: <strong style="color: var(--text-primary);">${currentUser?.name || 'Unknown'}</strong>
                        <span style="margin-left: 12px; padding: 4px 10px; background: var(--bg-tertiary); border-radius: 6px; font-size: 12px;">
                            ${currentUser?.role || 'Employee'}
                        </span>
                    </p>
                </div>
            </div>
        `;
        return;
    }

    // Initialize if not already done
    if (!firebasePasswordsManager.isInitialized) {
        await initializeFirebasePasswords();
    }

    const categoryOptions = Object.entries(passwordCategories)
        .map(([value, cat]) => `<option value="${value}">${cat.label}</option>`)
        .join('');

    dashboard.innerHTML = `
        <div class="page-header" style="margin-bottom: 24px;">
            <div class="page-header-left">
                <h2 class="section-title" style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-key" style="color: white; font-size: 20px;"></i>
                    </div>
                    Password Manager
                </h2>
                <p class="section-subtitle">Securely store and manage all your business passwords</p>
            </div>
            <div class="page-header-right" style="display: flex; gap: 12px; align-items: center;">
                <!-- View Toggle -->
                <div style="display: flex; background: var(--bg-secondary); border-radius: 10px; padding: 4px; border: 1px solid var(--border-color);">
                    <button onclick="setPasswordViewMode('list')" id="pwd-view-list-btn" style="width: 38px; height: 38px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; ${passwordViewMode === 'list' ? 'background: var(--accent-primary); color: white;' : 'background: transparent; color: var(--text-muted);'}" title="List View">
                        <i class="fas fa-list"></i>
                    </button>
                    <button onclick="setPasswordViewMode('grid')" id="pwd-view-grid-btn" style="width: 38px; height: 38px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; ${passwordViewMode === 'grid' ? 'background: var(--accent-primary); color: white;' : 'background: transparent; color: var(--text-muted);'}" title="Grid View">
                        <i class="fas fa-th-large"></i>
                    </button>
                </div>
                <button class="btn-primary" onclick="toggleAddPasswordInline()" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-plus"></i>
                    Add Password
                </button>
            </div>
        </div>

        <!-- Inline Add Form (hidden by default) -->
        <div id="inline-add-password" style="display: none; margin-bottom: 24px;">
            <div class="card" style="border: 2px solid var(--accent-primary); background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, var(--bg-secondary) 100%);">
                <div class="card-header" style="background: transparent; border-bottom: 1px solid var(--border-color);">
                    <h3 class="card-title" style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-plus-circle" style="color: var(--accent-primary);"></i>
                        Add New Password
                    </h3>
                    <button onclick="toggleAddPasswordInline()" style="background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 8px;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="card-body" style="padding: 24px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px;">
                        <div>
                            <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Service Name</label>
                            <input type="text" id="inline-pwd-name" class="form-input" placeholder="e.g., AT&T Business">
                        </div>
                        <div>
                            <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Category</label>
                            <select id="inline-pwd-category" class="form-input">
                                <option value="">Select category</option>
                                ${categoryOptions}
                            </select>
                        </div>
                        <div>
                            <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Store</label>
                            <select id="inline-pwd-store" class="form-input">
                                <option value="">Select store...</option>
                                <option value="All Stores">All Stores</option>
                                <option value="Miramar">VSU Miramar</option>
                                <option value="Morena">VSU Morena</option>
                                <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                <option value="Chula Vista">VSU Chula Vista</option>
                                <option value="North Park">VSU North Park</option>
                                <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Username</label>
                            <input type="text" id="inline-pwd-username" class="form-input" placeholder="Username or ID">
                        </div>
                        <div>
                            <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Email</label>
                            <input type="email" id="inline-pwd-email" class="form-input" placeholder="email@example.com">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                        <div>
                            <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Password</label>
                            <div style="display: flex; gap: 8px;">
                                <div style="flex: 1; position: relative;">
                                    <input type="password" id="inline-pwd-password" class="form-input" placeholder="Enter password" style="padding-right: 44px;">
                                    <button type="button" onclick="togglePasswordVisibility('inline-pwd-password', 'inline-pwd-toggle-icon')" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted);">
                                        <i class="fas fa-eye" id="inline-pwd-toggle-icon"></i>
                                    </button>
                                </div>
                                <button type="button" onclick="generateInlinePassword()" class="btn-secondary" title="Generate">
                                    <i class="fas fa-wand-magic-sparkles"></i>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Website URL</label>
                            <input type="url" id="inline-pwd-url" class="form-input" placeholder="https://example.com">
                        </div>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Notes</label>
                        <textarea id="inline-pwd-notes" class="form-input" placeholder="Additional notes..." style="min-height: 60px; resize: vertical;"></textarea>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 12px;">
                        <button class="btn-secondary" onclick="toggleAddPasswordInline()">Cancel</button>
                        <button class="btn-primary" onclick="saveInlinePassword()">
                            <i class="fas fa-save"></i> Save Password
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Search Bar -->
        <div class="password-filter-bar" style="margin-bottom: 20px;">
            <div class="password-filters" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                <div class="password-search-wrapper" style="flex: 1; position: relative; min-width: 200px;">
                    <i class="fas fa-search" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                    <input type="text" id="password-search" class="form-input" placeholder="Search passwords..."
                        style="padding-left: 46px; height: 48px; font-size: 15px; border-radius: 12px; width: 100%;" oninput="filterPasswords()">
                </div>
                <select id="password-store-filter" class="form-input" onchange="filterPasswords()" style="min-width: 150px; height: 48px; border-radius: 12px;">
                    <option value="">All Stores</option>
                    <option value="Miramar">VSU Miramar</option>
                    <option value="Morena">VSU Morena</option>
                    <option value="Kearny Mesa">VSU Kearny Mesa</option>
                    <option value="Chula Vista">VSU Chula Vista</option>
                    <option value="North Park">VSU North Park</option>
                    <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                </select>
                <select id="password-category-filter" class="form-input" onchange="filterPasswords()" style="min-width: 150px; height: 48px; border-radius: 12px;">
                    <option value="">All Categories</option>
                    ${categoryOptions}
                </select>
            </div>
        </div>

        <!-- Passwords List/Grid -->
        <div id="passwords-container">
            ${passwordViewMode === 'grid' ? renderPasswordsGridView() : renderPasswordsList()}
        </div>
    `;
}

// Render passwords as expandable list
function renderPasswordsList() {
    if (firebasePasswords.length === 0) {
        return `
            <div class="card">
                <div class="card-body" style="text-align: center; padding: 60px 20px;">
                    <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); border-radius: 20px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-key" style="font-size: 32px; color: white;"></i>
                    </div>
                    <h3 style="color: var(--text-primary); margin-bottom: 8px;">No Passwords Yet</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">Start adding your business passwords to keep them organized and secure.</p>
                    <button class="btn-primary" onclick="toggleAddPasswordInline()">
                        <i class="fas fa-plus"></i> Add Your First Password
                    </button>
                </div>
            </div>
        `;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';

    firebasePasswords.forEach(pwd => {
        const catInfo = passwordCategories[pwd.category] || passwordCategories.other;
        const escapedPassword = (pwd.password || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

        html += `
            <div class="password-list-item" data-id="${pwd.firestoreId}" style="background: var(--bg-secondary); border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); transition: all 0.2s;">
                <!-- Main Row (always visible) -->
                <div onclick="togglePasswordExpand('${pwd.firestoreId}')" style="display: flex; align-items: center; padding: 16px 20px; gap: 16px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='transparent'">
                    <!-- Icon -->
                    <div style="width: 48px; height: 48px; background: ${catInfo.color}15; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas ${catInfo.icon}" style="color: ${catInfo.color}; font-size: 20px;"></i>
                    </div>

                    <!-- Info -->
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; font-size: 15px; color: var(--text-primary); margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
                            ${pwd.name || 'Unnamed'}
                            ${pwd.url ? `<a href="${pwd.url.startsWith('http') ? pwd.url : 'https://' + pwd.url}" target="_blank" onclick="event.stopPropagation()" style="color: var(--accent-primary); font-size: 12px;"><i class="fas fa-external-link-alt"></i></a>` : ''}
                        </div>
                        <div style="font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                            ${pwd.username ? `<span><i class="fas fa-user" style="margin-right: 4px; opacity: 0.6;"></i>${pwd.username}</span>` : ''}
                            ${pwd.email ? `<span><i class="fas fa-envelope" style="margin-right: 4px; opacity: 0.6;"></i>${pwd.email}</span>` : ''}
                        </div>
                    </div>

                    <!-- Store Badge -->
                    ${pwd.store ? `
                    <div style="background: var(--bg-primary); color: var(--text-secondary); padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 500; display: flex; align-items: center; gap: 4px;">
                        <i class="fas fa-store" style="font-size: 10px;"></i>
                        ${pwd.store}
                    </div>
                    ` : ''}

                    <!-- Category Badge -->
                    <div style="background: ${catInfo.color}15; color: ${catInfo.color}; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        ${catInfo.label}
                    </div>

                    <!-- Quick Actions -->
                    <div style="display: flex; gap: 6px;" onclick="event.stopPropagation()">
                        <button onclick="copyPasswordToClipboard('${escapedPassword}', 'Password')" style="width: 38px; height: 38px; border-radius: 10px; border: none; background: var(--accent-primary); cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; transition: all 0.2s;" title="Copy Password">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>

                    <!-- Expand Arrow -->
                    <div style="color: var(--text-muted); transition: transform 0.3s;" id="arrow-${pwd.firestoreId}">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>

                <!-- Expanded Details (hidden by default) -->
                <div id="expand-${pwd.firestoreId}" style="display: none; padding: 0 20px 20px; border-top: 1px solid var(--border-color); margin-top: 0;">
                    <div style="padding-top: 20px;">
                        <!-- Password Display -->
                        <div style="background: var(--bg-primary); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div>
                                    <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Password</div>
                                    <div style="font-family: 'Space Mono', monospace; font-size: 16px; color: var(--text-primary);" id="pwd-display-${pwd.firestoreId}">••••••••••••</div>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button onclick="togglePasswordDisplay('${pwd.firestoreId}', '${escapedPassword}')" style="width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-secondary);" title="Show/Hide">
                                        <i class="fas fa-eye" id="pwd-icon-${pwd.firestoreId}"></i>
                                    </button>
                                    <button onclick="copyPasswordToClipboard('${escapedPassword}', 'Password')" style="width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-secondary);" title="Copy">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Details Grid -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px;">
                            ${pwd.username ? `
                                <div style="background: var(--bg-primary); border-radius: 10px; padding: 12px;">
                                    <div style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Username</div>
                                    <div style="font-size: 14px; color: var(--text-primary); display: flex; align-items: center; justify-content: space-between;">
                                        <span>${pwd.username}</span>
                                        <button onclick="copyPasswordToClipboard('${pwd.username}', 'Username')" style="background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px;">
                                            <i class="fas fa-copy" style="font-size: 12px;"></i>
                                        </button>
                                    </div>
                                </div>
                            ` : ''}
                            ${pwd.email ? `
                                <div style="background: var(--bg-primary); border-radius: 10px; padding: 12px;">
                                    <div style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Email</div>
                                    <div style="font-size: 14px; color: var(--text-primary); display: flex; align-items: center; justify-content: space-between;">
                                        <span style="overflow: hidden; text-overflow: ellipsis;">${pwd.email}</span>
                                        <button onclick="copyPasswordToClipboard('${pwd.email}', 'Email')" style="background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px;">
                                            <i class="fas fa-copy" style="font-size: 12px;"></i>
                                        </button>
                                    </div>
                                </div>
                            ` : ''}
                            ${pwd.url ? `
                                <div style="background: var(--bg-primary); border-radius: 10px; padding: 12px;">
                                    <div style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Website</div>
                                    <div style="font-size: 14px;">
                                        <a href="${pwd.url.startsWith('http') ? pwd.url : 'https://' + pwd.url}" target="_blank" style="color: var(--accent-primary); text-decoration: none; display: flex; align-items: center; gap: 6px;">
                                            <i class="fas fa-external-link-alt" style="font-size: 10px;"></i>
                                            Open Site
                                        </a>
                                    </div>
                                </div>
                            ` : ''}
                        </div>

                        ${pwd.notes ? `
                            <div style="background: var(--bg-primary); border-radius: 10px; padding: 12px; margin-bottom: 16px;">
                                <div style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Notes</div>
                                <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">${pwd.notes}</div>
                            </div>
                        ` : ''}

                        <!-- Action Buttons -->
                        <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 12px; border-top: 1px solid var(--border-color);">
                            <button onclick="startEditPasswordInline('${pwd.firestoreId}')" class="btn-secondary" style="font-size: 13px;">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button onclick="deletePasswordConfirm('${pwd.firestoreId}')" class="btn-secondary" style="font-size: 13px; color: #ef4444; border-color: #ef444450;">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

// Render passwords as grid/mosaic view
function renderPasswordsGridView() {
    if (firebasePasswords.length === 0) {
        return `
            <div class="card">
                <div class="card-body" style="text-align: center; padding: 60px 20px;">
                    <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); border-radius: 20px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-key" style="font-size: 32px; color: white;"></i>
                    </div>
                    <h3 style="color: var(--text-primary); margin-bottom: 8px;">No Passwords Yet</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">Start adding your business passwords to keep them organized and secure.</p>
                    <button class="btn-primary" onclick="toggleAddPasswordInline()">
                        <i class="fas fa-plus"></i> Add Your First Password
                    </button>
                </div>
            </div>
        `;
    }

    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">';

    firebasePasswords.forEach(pwd => {
        const catInfo = passwordCategories[pwd.category] || passwordCategories.other;
        const escapedPassword = (pwd.password || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

        html += `
            <div class="password-grid-card" style="background: var(--bg-secondary); border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; transition: all 0.2s; display: flex; flex-direction: column;">
                <!-- Card Header -->
                <div style="padding: 20px; border-bottom: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: flex-start; gap: 14px;">
                        <!-- Icon -->
                        <div style="width: 52px; height: 52px; background: ${catInfo.color}15; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas ${catInfo.icon}" style="color: ${catInfo.color}; font-size: 22px;"></i>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 600; font-size: 16px; color: var(--text-primary); margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${pwd.name || 'Unnamed'}</span>
                                ${pwd.url ? `<a href="${pwd.url}" target="_blank" onclick="event.stopPropagation()" style="color: var(--accent-primary); font-size: 12px; flex-shrink: 0;"><i class="fas fa-external-link-alt"></i></a>` : ''}
                            </div>
                            <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
                                <div style="background: ${catInfo.color}15; color: ${catInfo.color}; padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;">
                                    ${catInfo.label}
                                </div>
                                ${pwd.store ? `
                                <div style="background: var(--bg-primary); color: var(--text-secondary); padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 500; display: inline-flex; align-items: center; gap: 4px;">
                                    <i class="fas fa-store" style="font-size: 9px;"></i>
                                    ${pwd.store}
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card Body -->
                <div style="padding: 16px 20px; flex: 1;">
                    ${pwd.username ? `
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Username</div>
                            <div style="font-size: 14px; color: var(--text-primary); display: flex; align-items: center; justify-content: space-between;">
                                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${pwd.username}</span>
                                <button onclick="copyPasswordToClipboard('${pwd.username}', 'Username')" style="background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; flex-shrink: 0;">
                                    <i class="fas fa-copy" style="font-size: 12px;"></i>
                                </button>
                            </div>
                        </div>
                    ` : ''}
                    ${pwd.email ? `
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Email</div>
                            <div style="font-size: 14px; color: var(--text-primary); display: flex; align-items: center; justify-content: space-between;">
                                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${pwd.email}</span>
                                <button onclick="copyPasswordToClipboard('${pwd.email}', 'Email')" style="background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; flex-shrink: 0;">
                                    <i class="fas fa-copy" style="font-size: 12px;"></i>
                                </button>
                            </div>
                        </div>
                    ` : ''}
                    <!-- Password -->
                    <div style="background: var(--bg-primary); border-radius: 10px; padding: 12px;">
                        <div style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Password</div>
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                            <div style="font-family: 'Space Mono', monospace; font-size: 14px; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis;" id="grid-pwd-display-${pwd.firestoreId}">••••••••••••</div>
                            <div style="display: flex; gap: 4px; flex-shrink: 0;">
                                <button onclick="toggleGridPasswordDisplay('${pwd.firestoreId}', '${escapedPassword}')" style="width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-secondary);" title="Show/Hide">
                                    <i class="fas fa-eye" id="grid-pwd-icon-${pwd.firestoreId}" style="font-size: 12px;"></i>
                                </button>
                                <button onclick="copyPasswordToClipboard('${escapedPassword}', 'Password')" style="width: 32px; height: 32px; border-radius: 8px; border: none; background: var(--accent-primary); cursor: pointer; display: flex; align-items: center; justify-content: center; color: white;" title="Copy Password">
                                    <i class="fas fa-copy" style="font-size: 12px;"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card Footer -->
                <div style="padding: 12px 20px; border-top: 1px solid var(--border-color); display: flex; gap: 8px; justify-content: flex-end;">
                    <button onclick="startEditPasswordInline('${pwd.firestoreId}')" class="btn-secondary" style="font-size: 12px; padding: 8px 14px;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deletePasswordConfirm('${pwd.firestoreId}')" class="btn-secondary" style="font-size: 12px; padding: 8px 14px; color: #ef4444; border-color: #ef444450;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

// Toggle password visibility in grid view
function toggleGridPasswordDisplay(id, password) {
    const display = document.getElementById(`grid-pwd-display-${id}`);
    const icon = document.getElementById(`grid-pwd-icon-${id}`);

    if (display.textContent === '••••••••••••') {
        display.textContent = password;
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        display.textContent = '••••••••••••';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Set password view mode (list or grid)
function setPasswordViewMode(mode) {
    passwordViewMode = mode;

    // Update button styles
    const listBtn = document.getElementById('pwd-view-list-btn');
    const gridBtn = document.getElementById('pwd-view-grid-btn');

    if (listBtn && gridBtn) {
        if (mode === 'list') {
            listBtn.style.background = 'var(--accent-primary)';
            listBtn.style.color = 'white';
            gridBtn.style.background = 'transparent';
            gridBtn.style.color = 'var(--text-muted)';
        } else {
            gridBtn.style.background = 'var(--accent-primary)';
            gridBtn.style.color = 'white';
            listBtn.style.background = 'transparent';
            listBtn.style.color = 'var(--text-muted)';
        }
    }

    // Re-render the passwords container
    const container = document.getElementById('passwords-container');
    if (container) {
        container.innerHTML = mode === 'grid' ? renderPasswordsGridView() : renderPasswordsList();
    }
}

// For backwards compatibility
function renderPasswordsGrid() {
    return renderPasswordsList();
}

// Toggle password expand/collapse
function togglePasswordExpand(id) {
    const expandDiv = document.getElementById(`expand-${id}`);
    const arrow = document.getElementById(`arrow-${id}`);

    if (expandDiv.style.display === 'none') {
        // Collapse all others first
        document.querySelectorAll('[id^="expand-"]').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('[id^="arrow-"]').forEach(el => {
            el.style.transform = 'rotate(0deg)';
        });

        // Expand this one
        expandDiv.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
    } else {
        expandDiv.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    }
}

// Toggle add password inline form
function toggleAddPasswordInline() {
    const form = document.getElementById('inline-add-password');
    if (form.style.display === 'none') {
        form.style.display = 'block';
        document.getElementById('inline-pwd-name').focus();
    } else {
        form.style.display = 'none';
        // Clear form
        document.getElementById('inline-pwd-name').value = '';
        document.getElementById('inline-pwd-category').value = '';
        document.getElementById('inline-pwd-username').value = '';
        document.getElementById('inline-pwd-email').value = '';
        document.getElementById('inline-pwd-password').value = '';
        document.getElementById('inline-pwd-url').value = '';
        document.getElementById('inline-pwd-notes').value = '';
    }
}

// Generate password for inline form
function generateInlinePassword() {
    const password = generateRandomPassword(16);
    const input = document.getElementById('inline-pwd-password');
    input.value = password;
    input.type = 'text';
    document.getElementById('inline-pwd-toggle-icon').classList.remove('fa-eye');
    document.getElementById('inline-pwd-toggle-icon').classList.add('fa-eye-slash');
}

// Save password from inline form
async function saveInlinePassword() {
    const name = document.getElementById('inline-pwd-name').value.trim();
    const category = document.getElementById('inline-pwd-category').value;
    const store = document.getElementById('inline-pwd-store').value;
    const username = document.getElementById('inline-pwd-username').value.trim();
    const email = document.getElementById('inline-pwd-email').value.trim();
    const password = document.getElementById('inline-pwd-password').value;
    const url = document.getElementById('inline-pwd-url').value.trim();
    const notes = document.getElementById('inline-pwd-notes').value.trim();

    if (!name) {
        showPasswordToast('Please enter a service name', 'error');
        return;
    }

    if (!password) {
        showPasswordToast('Please enter a password', 'error');
        return;
    }

    if (email && !isValidEmail(email)) {
        showPasswordToast('Please enter a valid email address', 'error');
        return;
    }

    if (url && !isValidUrl(url)) {
        showPasswordToast('Please enter a valid URL (e.g., https://example.com)', 'error');
        return;
    }

    try {
        const newPassword = {
            name,
            category: category || 'other',
            store: store || 'All Stores',
            username,
            email,
            password,
            url,
            notes
        };

        await firebasePasswordsManager.addPassword(newPassword);
        firebasePasswords = await firebasePasswordsManager.loadPasswords();

        toggleAddPasswordInline();
        renderPasswordManager();
        showPasswordToast('Password saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving password:', error);
        showPasswordToast('Error saving password. Please try again.', 'error');
    }
}

// Start inline edit
function startEditPasswordInline(firestoreId) {
    const pwd = firebasePasswords.find(p => p.firestoreId === firestoreId);
    if (!pwd) return;

    const categoryOptions = Object.entries(passwordCategories)
        .map(([value, cat]) => `<option value="${value}" ${pwd.category === value ? 'selected' : ''}>${cat.label}</option>`)
        .join('');

    const storeOptions = ['All Stores', 'Miramar', 'Morena', 'Kearny Mesa', 'Chula Vista', 'North Park', 'Miramar Wine & Liquor']
        .map(store => `<option value="${store}" ${pwd.store === store ? 'selected' : ''}>${store === 'All Stores' ? 'All Stores' : 'VSU ' + store}</option>`)
        .join('');

    const expandDiv = document.getElementById(`expand-${firestoreId}`);
    expandDiv.innerHTML = `
        <div style="padding-top: 20px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
                <div>
                    <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Service Name</label>
                    <input type="text" id="edit-inline-name-${firestoreId}" class="form-input" value="${pwd.name || ''}">
                </div>
                <div>
                    <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Category</label>
                    <select id="edit-inline-category-${firestoreId}" class="form-input">
                        ${categoryOptions}
                    </select>
                </div>
                <div>
                    <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Store</label>
                    <select id="edit-inline-store-${firestoreId}" class="form-input">
                        ${storeOptions}
                    </select>
                </div>
                <div>
                    <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Username</label>
                    <input type="text" id="edit-inline-username-${firestoreId}" class="form-input" value="${pwd.username || ''}">
                </div>
                <div>
                    <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Email</label>
                    <input type="email" id="edit-inline-email-${firestoreId}" class="form-input" value="${pwd.email || ''}">
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                <div>
                    <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Password</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="edit-inline-password-${firestoreId}" class="form-input" value="${pwd.password || ''}" style="flex: 1;">
                        <button type="button" onclick="document.getElementById('edit-inline-password-${firestoreId}').value = generateRandomPassword(16)" class="btn-secondary" title="Generate">
                            <i class="fas fa-wand-magic-sparkles"></i>
                        </button>
                    </div>
                </div>
                <div>
                    <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Website URL</label>
                    <input type="url" id="edit-inline-url-${firestoreId}" class="form-input" value="${pwd.url || ''}">
                </div>
            </div>
            <div style="margin-bottom: 16px;">
                <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Notes</label>
                <textarea id="edit-inline-notes-${firestoreId}" class="form-input" style="min-height: 60px; resize: vertical;">${pwd.notes || ''}</textarea>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="renderPasswordManager()" class="btn-secondary" style="font-size: 13px;">Cancel</button>
                <button onclick="saveEditPasswordInline('${firestoreId}')" class="btn-primary" style="font-size: 13px;">
                    <i class="fas fa-save"></i> Save Changes
                </button>
            </div>
        </div>
    `;
}

// Save inline edit
async function saveEditPasswordInline(firestoreId) {
    const name = document.getElementById(`edit-inline-name-${firestoreId}`).value.trim();
    const category = document.getElementById(`edit-inline-category-${firestoreId}`).value;
    const store = document.getElementById(`edit-inline-store-${firestoreId}`).value;
    const username = document.getElementById(`edit-inline-username-${firestoreId}`).value.trim();
    const email = document.getElementById(`edit-inline-email-${firestoreId}`).value.trim();
    const password = document.getElementById(`edit-inline-password-${firestoreId}`).value;
    const url = document.getElementById(`edit-inline-url-${firestoreId}`).value.trim();
    const notes = document.getElementById(`edit-inline-notes-${firestoreId}`).value.trim();

    if (!name) {
        showPasswordToast('Please enter a service name', 'error');
        return;
    }

    if (email && !isValidEmail(email)) {
        showPasswordToast('Please enter a valid email address', 'error');
        return;
    }

    if (url && !isValidUrl(url)) {
        showPasswordToast('Please enter a valid URL (e.g., https://example.com)', 'error');
        return;
    }

    try {
        const updatedData = {
            name,
            category: category || 'other',
            store: store || 'All Stores',
            username,
            email,
            password,
            url,
            notes
        };

        await firebasePasswordsManager.updatePassword(firestoreId, updatedData);
        firebasePasswords = await firebasePasswordsManager.loadPasswords();

        renderPasswordManager();
        showPasswordToast('Password updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating password:', error);
        showPasswordToast('Error updating password. Please try again.', 'error');
    }
}

// Toggle password display in list
function togglePasswordDisplay(id, password) {
    const display = document.getElementById(`pwd-display-${id}`);
    const icon = document.getElementById(`pwd-icon-${id}`);

    if (display.textContent === '••••••••••••') {
        display.textContent = password;
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        display.textContent = '••••••••••••';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Filter passwords
function filterPasswords() {
    const searchTerm = document.getElementById('password-search')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('password-category-filter')?.value || '';
    const storeFilter = document.getElementById('password-store-filter')?.value || '';

    // Get items based on current view mode
    const itemSelector = passwordViewMode === 'grid' ? '.password-grid-card' : '.password-list-item';
    const items = document.querySelectorAll(itemSelector);

    items.forEach((item, index) => {
        const pwd = firebasePasswords[index];
        if (!pwd) return;

        const matchesSearch = !searchTerm ||
            pwd.name?.toLowerCase().includes(searchTerm) ||
            pwd.username?.toLowerCase().includes(searchTerm) ||
            pwd.email?.toLowerCase().includes(searchTerm) ||
            pwd.url?.toLowerCase().includes(searchTerm) ||
            pwd.notes?.toLowerCase().includes(searchTerm) ||
            pwd.store?.toLowerCase().includes(searchTerm);

        const matchesCategory = !categoryFilter || pwd.category === categoryFilter;
        const matchesStore = !storeFilter || pwd.store === storeFilter || (!pwd.store && storeFilter === 'All Stores');

        if (matchesSearch && matchesCategory && matchesStore) {
            item.style.display = passwordViewMode === 'grid' ? 'flex' : 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Open Add Password Modal
function openAddPasswordModal() {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    const categoryOptions = Object.entries(passwordCategories)
        .map(([value, cat]) => `<option value="${value}">${cat.label}</option>`)
        .join('');

    modalContent.innerHTML = `
        <div class="modal-header">
            <h2 style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-plus" style="color: white;"></i>
                </div>
                Add New Password
            </h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <form id="add-password-form" style="display: grid; gap: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <label class="form-label">Service Name</label>
                        <input type="text" id="pwd-name" class="form-input" placeholder="e.g., AT&T Business">
                    </div>
                    <div>
                        <label class="form-label">Category</label>
                        <select id="pwd-category" class="form-input">
                            <option value="">Select category</option>
                            ${categoryOptions}
                        </select>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <label class="form-label">Username</label>
                        <input type="text" id="pwd-username" class="form-input" placeholder="Username or account ID">
                    </div>
                    <div>
                        <label class="form-label">Email</label>
                        <input type="email" id="pwd-email" class="form-input" placeholder="Associated email">
                    </div>
                </div>

                <div>
                    <label class="form-label">Password</label>
                    <div style="display: flex; gap: 8px;">
                        <div style="flex: 1; position: relative;">
                            <input type="password" id="pwd-password" class="form-input" placeholder="Enter password" style="padding-right: 44px;">
                            <button type="button" onclick="togglePasswordVisibility('pwd-password', 'pwd-toggle-icon')" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px;">
                                <i class="fas fa-eye" id="pwd-toggle-icon"></i>
                            </button>
                        </div>
                        <button type="button" onclick="fillGeneratedPassword()" class="btn-secondary" style="white-space: nowrap;" title="Generate strong password">
                            <i class="fas fa-wand-magic-sparkles"></i> Generate
                        </button>
                    </div>
                </div>

                <div>
                    <label class="form-label">Website URL</label>
                    <input type="url" id="pwd-url" class="form-input" placeholder="https://example.com">
                </div>

                <div>
                    <label class="form-label">Notes</label>
                    <textarea id="pwd-notes" class="form-input" placeholder="Additional notes, security questions, account number, etc." style="min-height: 80px; resize: vertical;"></textarea>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn-primary" onclick="saveNewPassword()">
                <i class="fas fa-save"></i> Save Password
            </button>
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
        </div>
    `;

    modal.classList.add('active');
}

// Fill generated password
function fillGeneratedPassword() {
    const password = generateRandomPassword(16);
    const input = document.getElementById('pwd-password');
    input.value = password;
    input.type = 'text'; // Show the generated password
    document.getElementById('pwd-toggle-icon').classList.remove('fa-eye');
    document.getElementById('pwd-toggle-icon').classList.add('fa-eye-slash');
}

// Save new password
async function saveNewPassword() {
    const name = document.getElementById('pwd-name').value.trim();
    const category = document.getElementById('pwd-category').value;
    const username = document.getElementById('pwd-username').value.trim();
    const email = document.getElementById('pwd-email').value.trim();
    const password = document.getElementById('pwd-password').value;
    const url = document.getElementById('pwd-url').value.trim();
    const notes = document.getElementById('pwd-notes').value.trim();

    if (!name) {
        showPasswordToast('Please enter a service name', 'error');
        return;
    }

    if (!password) {
        showPasswordToast('Please enter a password', 'error');
        return;
    }

    if (email && !isValidEmail(email)) {
        showPasswordToast('Please enter a valid email address', 'error');
        return;
    }

    if (url && !isValidUrl(url)) {
        showPasswordToast('Please enter a valid URL (e.g., https://example.com)', 'error');
        return;
    }

    try {
        const newPassword = {
            name,
            category: category || 'other',
            username,
            email,
            password,
            url,
            notes
        };

        await firebasePasswordsManager.addPassword(newPassword);
        firebasePasswords = await firebasePasswordsManager.loadPasswords();

        closeModal();
        renderPasswordManager();
        showPasswordToast('Password saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving password:', error);
        showPasswordToast('Error saving password. Please try again.', 'error');
    }
}

// Open Edit Password Modal
function openEditPasswordModal(firestoreId) {
    const pwd = firebasePasswords.find(p => p.firestoreId === firestoreId);
    if (!pwd) return;

    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    const categoryOptions = Object.entries(passwordCategories)
        .map(([value, cat]) => `<option value="${value}" ${pwd.category === value ? 'selected' : ''}>${cat.label}</option>`)
        .join('');

    modalContent.innerHTML = `
        <div class="modal-header">
            <h2 style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-edit" style="color: white;"></i>
                </div>
                Edit Password
            </h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <form id="edit-password-form" style="display: grid; gap: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <label class="form-label">Service Name</label>
                        <input type="text" id="edit-pwd-name" class="form-input" value="${pwd.name || ''}" placeholder="e.g., AT&T Business">
                    </div>
                    <div>
                        <label class="form-label">Category</label>
                        <select id="edit-pwd-category" class="form-input">
                            <option value="">Select category</option>
                            ${categoryOptions}
                        </select>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <label class="form-label">Username</label>
                        <input type="text" id="edit-pwd-username" class="form-input" value="${pwd.username || ''}" placeholder="Username or account ID">
                    </div>
                    <div>
                        <label class="form-label">Email</label>
                        <input type="email" id="edit-pwd-email" class="form-input" value="${pwd.email || ''}" placeholder="Associated email">
                    </div>
                </div>

                <div>
                    <label class="form-label">Password</label>
                    <div style="display: flex; gap: 8px;">
                        <div style="flex: 1; position: relative;">
                            <input type="password" id="edit-pwd-password" class="form-input" value="${pwd.password || ''}" placeholder="Enter password" style="padding-right: 44px;">
                            <button type="button" onclick="togglePasswordVisibility('edit-pwd-password', 'edit-pwd-toggle-icon')" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px;">
                                <i class="fas fa-eye" id="edit-pwd-toggle-icon"></i>
                            </button>
                        </div>
                        <button type="button" onclick="fillEditGeneratedPassword()" class="btn-secondary" style="white-space: nowrap;" title="Generate strong password">
                            <i class="fas fa-wand-magic-sparkles"></i> Generate
                        </button>
                    </div>
                </div>

                <div>
                    <label class="form-label">Website URL</label>
                    <input type="url" id="edit-pwd-url" class="form-input" value="${pwd.url || ''}" placeholder="https://example.com">
                </div>

                <div>
                    <label class="form-label">Notes</label>
                    <textarea id="edit-pwd-notes" class="form-input" placeholder="Additional notes, security questions, account number, etc." style="min-height: 80px; resize: vertical;">${pwd.notes || ''}</textarea>
                </div>
            </form>
        </div>
        <div class="modal-footer" style="justify-content: space-between;">
            <div style="display: flex; gap: 8px;">
                <button class="btn-primary" onclick="updatePassword('${firestoreId}')">
                    <i class="fas fa-save"></i> Save Changes
                </button>
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
            <button class="btn-danger" onclick="deletePasswordConfirm('${firestoreId}')" style="background: #ef4444; color: white; border: none;">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;

    modal.classList.add('active');
}

// Fill generated password for edit form
function fillEditGeneratedPassword() {
    const password = generateRandomPassword(16);
    const input = document.getElementById('edit-pwd-password');
    input.value = password;
    input.type = 'text';
    document.getElementById('edit-pwd-toggle-icon').classList.remove('fa-eye');
    document.getElementById('edit-pwd-toggle-icon').classList.add('fa-eye-slash');
}

// Update password
async function updatePassword(firestoreId) {
    const name = document.getElementById('edit-pwd-name').value.trim();
    const category = document.getElementById('edit-pwd-category').value;
    const username = document.getElementById('edit-pwd-username').value.trim();
    const email = document.getElementById('edit-pwd-email').value.trim();
    const password = document.getElementById('edit-pwd-password').value;
    const url = document.getElementById('edit-pwd-url').value.trim();
    const notes = document.getElementById('edit-pwd-notes').value.trim();

    if (!name) {
        showPasswordToast('Please enter a service name', 'error');
        return;
    }

    if (!password) {
        showPasswordToast('Please enter a password', 'error');
        return;
    }

    try {
        const updateData = {
            name,
            category: category || 'other',
            username,
            email,
            password,
            url,
            notes
        };

        await firebasePasswordsManager.updatePassword(firestoreId, updateData);
        firebasePasswords = await firebasePasswordsManager.loadPasswords();

        closeModal();
        renderPasswordManager();
        showPasswordToast('Password updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating password:', error);
        showPasswordToast('Error updating password. Please try again.', 'error');
    }
}

// Delete password confirmation
function deletePasswordConfirm(firestoreId) {
    const pwd = firebasePasswords.find(p => p.firestoreId === firestoreId);
    if (!pwd) return;

    if (confirm(`Are you sure you want to delete "${pwd.name}"?\n\nThis action cannot be undone.`)) {
        deletePassword(firestoreId);
    }
}

// Delete password
async function deletePassword(firestoreId) {
    try {
        await firebasePasswordsManager.deletePassword(firestoreId);
        firebasePasswords = await firebasePasswordsManager.loadPasswords();

        closeModal();
        renderPasswordManager();
        showPasswordToast('Password deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting password:', error);
        showPasswordToast('Error deleting password. Please try again.', 'error');
    }
}

// Toast notification for password manager
function showPasswordToast(message, type = 'info') {
    // Check if toast container exists
    let toastContainer = document.getElementById('password-toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'password-toast-container';
        toastContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px;';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };

    toast.style.cssText = `
        padding: 14px 20px;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: 10px;
        font-weight: 500;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        animation: pwdSlideIn 0.3s ease;
    `;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    toastContainer.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'pwdSlideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

