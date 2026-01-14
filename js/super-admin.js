// ============================================
// SUPER ADMIN MODULE - GOD MODE
// Only accessible by carlos@calidevs.com
// ============================================

const SUPER_ADMIN_EMAIL = 'carlos@calidevs.com';
let godModeActive = false;
let originalUser = null;
let impersonatedUser = null;

// Check if current user is super admin
function isSuperAdmin() {
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() :
        (window.authManager?.getCurrentUser?.() || null);

    if (!currentUser) return false;

    // Check original user if in god mode
    if (godModeActive && originalUser) {
        return originalUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    }

    const userEmail = currentUser.email || currentUser.authEmail || '';
    return userEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

// Render Super Admin Panel
window.renderSuperAdmin = async function() {
    const dashboard = document.querySelector('.dashboard');

    // Security check
    if (!isSuperAdmin()) {
        dashboard.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; padding: 40px;">
                <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 20px 40px rgba(239, 68, 68, 0.3);">
                    <i class="fas fa-skull-crossbones" style="font-size: 48px; color: white;"></i>
                </div>
                <h2 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">Access Denied</h2>
                <p style="font-size: 16px; color: var(--text-muted); max-width: 400px; line-height: 1.6;">
                    This area is restricted to the system developer only.
                </p>
            </div>
        `;
        return;
    }

    dashboard.innerHTML = `
        <div class="page-header" style="margin-bottom: 24px;">
            <div class="page-header-left">
                <h2 class="section-title" style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ef4444, #b91c1c); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-crown" style="color: gold; font-size: 20px;"></i>
                    </div>
                    God Mode Panel
                </h2>
                <p class="section-subtitle">Unlimited power - Carlos exclusive</p>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                ${godModeActive ? `
                    <div style="background: #fbbf24; color: #000; padding: 8px 16px; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-mask"></i> Viewing as: ${impersonatedUser?.name || 'Unknown'}
                    </div>
                    <button onclick="exitGodMode()" class="btn-primary" style="background: #ef4444;">
                        <i class="fas fa-times"></i> Exit God Mode
                    </button>
                ` : ''}
            </div>
        </div>

        <!-- God Mode Banner -->
        ${godModeActive ? `
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #f59e0b; border-radius: 16px; padding: 16px 20px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-eye" style="font-size: 24px; color: #d97706;"></i>
                <div>
                    <div style="font-weight: 700; color: #92400e;">God Mode Active</div>
                    <div style="color: #a16207; font-size: 14px;">You are viewing the app as <strong>${impersonatedUser?.name}</strong> (${impersonatedUser?.email})</div>
                </div>
            </div>
        ` : ''}

        <!-- Power Tabs -->
        <div style="display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap;">
            <button onclick="loadSuperAdminTab('godmode')" id="sa-tab-godmode" class="btn-primary" style="display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #8b5cf6, #6366f1);">
                <i class="fas fa-mask"></i> God Mode
            </button>
            <button onclick="loadSuperAdminTab('employees')" id="sa-tab-employees" class="btn-secondary" style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-users"></i> Employees
            </button>
            <button onclick="loadSuperAdminTab('database')" id="sa-tab-database" class="btn-secondary" style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-database"></i> Database
            </button>
            <button onclick="loadSuperAdminTab('live')" id="sa-tab-live" class="btn-secondary" style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-satellite-dish"></i> Live Monitor
            </button>
            <button onclick="loadSuperAdminTab('emergency')" id="sa-tab-emergency" class="btn-secondary" style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-radiation"></i> Emergency
            </button>
            <button onclick="loadSuperAdminTab('mass')" id="sa-tab-mass" class="btn-secondary" style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-bolt"></i> Mass Ops
            </button>
            <button onclick="loadSuperAdminTab('features')" id="sa-tab-features" class="btn-secondary" style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-toggle-on"></i> Features
            </button>
            <button onclick="loadSuperAdminTab('tools')" id="sa-tab-tools" class="btn-secondary" style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-toolbox"></i> Tools
            </button>
        </div>

        <!-- Content Area -->
        <div id="super-admin-content">
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px;"></i>
                <p style="margin-top: 16px;">Loading...</p>
            </div>
        </div>
    `;

    // Load default tab
    await loadSuperAdminTab('godmode');
}

// Load tab content
async function loadSuperAdminTab(tab) {
    // Update tab buttons
    document.querySelectorAll('[id^="sa-tab-"]').forEach(btn => {
        btn.className = 'btn-secondary';
        btn.style.background = '';
    });
    const activeTab = document.getElementById(`sa-tab-${tab}`);
    if (activeTab) {
        activeTab.classList.replace('btn-secondary', 'btn-primary');
        if (tab === 'godmode') activeTab.style.background = 'linear-gradient(135deg, #8b5cf6, #6366f1)';
        if (tab === 'emergency') activeTab.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    }

    const content = document.getElementById('super-admin-content');

    switch(tab) {
        case 'godmode':
            await loadGodModeTab(content);
            break;
        case 'employees':
            await loadEmployeesTab(content);
            break;
        case 'database':
            await loadDatabaseTab(content);
            break;
        case 'live':
            await loadLiveMonitorTab(content);
            break;
        case 'emergency':
            loadEmergencyTab(content);
            break;
        case 'mass':
            loadMassOpsTab(content);
            break;
        case 'features':
            await loadFeaturesTab(content);
            break;
        case 'tools':
            loadToolsTab(content);
            break;
    }
}

// ============================================
// GOD MODE - IMPERSONATE USERS
// ============================================
async function loadGodModeTab(container) {
    const db = firebase.firestore();
    const snapshot = await db.collection('employees').where('status', '!=', 'inactive').get();

    let employees = [];
    snapshot.forEach(doc => employees.push({ id: doc.id, ...doc.data() }));
    employees.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    container.innerHTML = `
        <div style="display: grid; gap: 20px;">
            <!-- God Mode Explanation -->
            <div style="background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.1)); border: 1px solid rgba(139,92,246,0.3); border-radius: 16px; padding: 24px;">
                <h3 style="color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-mask" style="color: #8b5cf6;"></i>
                    Impersonate Any User
                </h3>
                <p style="color: var(--text-muted); margin-bottom: 16px;">
                    View the app exactly as any employee sees it. Perfect for debugging, support, and testing permissions.
                    Your actions will still be logged as YOU (Carlos), not as the impersonated user.
                </p>
                <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                    <select id="godmode-user-select" class="form-input" style="min-width: 250px;">
                        <option value="">Select user to impersonate...</option>
                        ${employees.map(e => `
                            <option value="${e.id}" data-name="${e.name}" data-email="${e.email}" data-role="${e.employeeType || e.role}" data-store="${e.store}">
                                ${e.name} (${e.employeeType || e.role || 'employee'}) - ${e.store || 'No store'}
                            </option>
                        `).join('')}
                    </select>
                    <button onclick="activateGodMode()" class="btn-primary" style="background: linear-gradient(135deg, #8b5cf6, #6366f1);">
                        <i class="fas fa-mask"></i> Become This User
                    </button>
                </div>
            </div>

            <!-- Quick Impersonate Cards -->
            <div>
                <h4 style="color: var(--text-primary); margin-bottom: 12px;">Quick Impersonate</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
                    ${employees.slice(0, 12).map(e => `
                        <div onclick="quickImpersonate('${e.id}', '${(e.name || '').replace(/'/g, "\\'")}', '${e.email || ''}', '${e.employeeType || e.role || 'employee'}', '${e.store || ''}')"
                             style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s;"
                             onmouseover="this.style.borderColor='#8b5cf6'; this.style.transform='translateY(-2px)'"
                             onmouseout="this.style.borderColor='var(--border-color)'; this.style.transform='none'">
                            <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${e.name || 'Unknown'}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">${e.employeeType || e.role || 'employee'}</div>
                            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                                <i class="fas fa-store" style="margin-right: 4px;"></i>${e.store || 'No store'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Current Session Info -->
            <div style="background: var(--bg-secondary); border-radius: 16px; padding: 20px;">
                <h4 style="color: var(--text-primary); margin-bottom: 12px;">Current Session</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                    <div>
                        <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Real User</div>
                        <div style="font-weight: 600; color: var(--text-primary);">${SUPER_ADMIN_EMAIL}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">God Mode</div>
                        <div style="font-weight: 600; color: ${godModeActive ? '#f59e0b' : '#10b981'};">${godModeActive ? 'ACTIVE' : 'Inactive'}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Viewing As</div>
                        <div style="font-weight: 600; color: var(--text-primary);">${godModeActive ? impersonatedUser?.name : 'Yourself'}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function activateGodMode() {
    const select = document.getElementById('godmode-user-select');
    if (!select || !select.value) {
        alert('Please select a user to impersonate');
        return;
    }

    const option = select.selectedOptions[0];
    quickImpersonate(
        select.value,
        option.dataset.name,
        option.dataset.email,
        option.dataset.role,
        option.dataset.store
    );
}

function quickImpersonate(id, name, email, role, store) {
    // Save original user
    if (!godModeActive) {
        originalUser = typeof getCurrentUser === 'function' ? getCurrentUser() :
            (window.authManager?.getCurrentUser?.() || null);
    }

    // Set impersonated user
    impersonatedUser = { id, name, email, role, store };
    godModeActive = true;

    // Override getCurrentUser
    window._originalGetCurrentUser = window._originalGetCurrentUser || window.getCurrentUser;
    window.getCurrentUser = function() {
        if (godModeActive && impersonatedUser) {
            return {
                id: impersonatedUser.id,
                odooId: impersonatedUser.id,
                name: impersonatedUser.name,
                email: impersonatedUser.email,
                authEmail: impersonatedUser.email,
                role: impersonatedUser.role,
                employeeType: impersonatedUser.role,
                store: impersonatedUser.store,
                _isImpersonated: true,
                _realUser: SUPER_ADMIN_EMAIL
            };
        }
        return window._originalGetCurrentUser ? window._originalGetCurrentUser() : null;
    };

    // Also override authManager if exists
    if (window.authManager && window.authManager.getCurrentUser) {
        window.authManager._originalGetCurrentUser = window.authManager._originalGetCurrentUser || window.authManager.getCurrentUser;
        window.authManager.getCurrentUser = window.getCurrentUser;
    }

    // Show notification
    showGodModeNotification(`Now viewing as: ${name}`);

    // Refresh current page to apply god mode
    console.log(`🎭 GOD MODE ACTIVATED - Viewing as ${name} (${email})`);

    // Reload the super admin page to show the banner
    window.renderSuperAdmin();
}

function exitGodMode() {
    godModeActive = false;
    impersonatedUser = null;

    // Restore original getCurrentUser
    if (window._originalGetCurrentUser) {
        window.getCurrentUser = window._originalGetCurrentUser;
    }
    if (window.authManager && window.authManager._originalGetCurrentUser) {
        window.authManager.getCurrentUser = window.authManager._originalGetCurrentUser;
    }

    showGodModeNotification('God Mode deactivated - Back to Carlos');
    console.log('🎭 GOD MODE DEACTIVATED');

    window.renderSuperAdmin();
}

function showGodModeNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #8b5cf6, #6366f1);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 10px 40px rgba(139, 92, 246, 0.4);
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `<i class="fas fa-mask"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ============================================
// DATABASE EXPLORER
// ============================================
async function loadDatabaseTab(container) {
    const collections = [
        'employees', 'schedules', 'clockin', 'announcements', 'dayOffRequests',
        'daysOff', 'thieves', 'issues', 'gifts', 'changeRecords', 'cashOut',
        'transfers', 'vendors', 'passwords', 'trainings', 'treasury',
        'checklistTasks', 'checklistCompletions', 'incidentLogs', 'gconomics',
        'invoices', 'leases', 'licenses', 'job_applications', 'users'
    ];

    container.innerHTML = `
        <div style="display: grid; gap: 20px;">
            <div style="background: var(--bg-secondary); border-radius: 16px; padding: 24px;">
                <h3 style="color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-database" style="color: #3b82f6;"></i>
                    Database Explorer
                </h3>
                <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 20px;">
                    <select id="db-collection-select" class="form-input" style="min-width: 200px;" onchange="loadCollectionData()">
                        <option value="">Select collection...</option>
                        ${collections.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <input type="text" id="db-doc-id" class="form-input" placeholder="Document ID (optional)" style="min-width: 200px;">
                    <button onclick="loadCollectionData()" class="btn-primary">
                        <i class="fas fa-search"></i> Load
                    </button>
                    <button onclick="exportCollectionData()" class="btn-secondary">
                        <i class="fas fa-download"></i> Export JSON
                    </button>
                </div>
                <div id="db-results" style="background: var(--bg-primary); border-radius: 12px; padding: 16px; max-height: 500px; overflow: auto;">
                    <div style="color: var(--text-muted); text-align: center;">Select a collection to view data</div>
                </div>
            </div>

            <!-- Quick Stats -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                ${collections.slice(0, 8).map(c => `
                    <div onclick="document.getElementById('db-collection-select').value='${c}'; loadCollectionData();"
                         style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; cursor: pointer; text-align: center; transition: all 0.2s;"
                         onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                        <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">${c}</div>
                        <div id="count-${c}" style="font-size: 24px; font-weight: 700; color: var(--text-primary);">-</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Load counts
    for (const col of collections.slice(0, 8)) {
        try {
            const snap = await firebase.firestore().collection(col).get();
            const countEl = document.getElementById(`count-${col}`);
            if (countEl) countEl.textContent = snap.size;
        } catch (e) {
            console.log(`Could not count ${col}`);
        }
    }
}

async function loadCollectionData() {
    const collection = document.getElementById('db-collection-select')?.value;
    const docId = document.getElementById('db-doc-id')?.value.trim();
    const results = document.getElementById('db-results');

    if (!collection) {
        results.innerHTML = '<div style="color: var(--text-muted); text-align: center;">Select a collection</div>';
        return;
    }

    results.innerHTML = '<div style="color: var(--text-muted); text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

    try {
        const db = firebase.firestore();
        let data = [];

        if (docId) {
            const doc = await db.collection(collection).doc(docId).get();
            if (doc.exists) {
                data = [{ id: doc.id, ...doc.data() }];
            }
        } else {
            const snapshot = await db.collection(collection).limit(100).get();
            snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
        }

        if (data.length === 0) {
            results.innerHTML = '<div style="color: var(--text-muted); text-align: center;">No documents found</div>';
            return;
        }

        // Store for export
        window._lastDbData = { collection, data };

        results.innerHTML = `
            <div style="margin-bottom: 12px; color: var(--text-muted); font-size: 13px;">
                Showing ${data.length} documents from <strong>${collection}</strong>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${data.map(doc => `
                    <details style="background: var(--bg-secondary); border-radius: 8px; padding: 12px;">
                        <summary style="cursor: pointer; font-weight: 600; color: var(--text-primary);">
                            ${doc.name || doc.title || doc.email || doc.id}
                            <span style="font-weight: 400; color: var(--text-muted); font-size: 12px; margin-left: 8px;">${doc.id}</span>
                        </summary>
                        <pre style="margin-top: 12px; font-size: 12px; overflow-x: auto; color: var(--text-secondary);">${JSON.stringify(doc, null, 2)}</pre>
                        <div style="margin-top: 12px; display: flex; gap: 8px;">
                            <button onclick="editDocument('${collection}', '${doc.id}')" class="btn-secondary" style="font-size: 12px;">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button onclick="deleteDocument('${collection}', '${doc.id}')" class="btn-secondary" style="font-size: 12px; color: #ef4444;">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </details>
                `).join('')}
            </div>
        `;
    } catch (error) {
        results.innerHTML = `<div style="color: #ef4444;">Error: ${error.message}</div>`;
    }
}

function exportCollectionData() {
    if (!window._lastDbData) {
        alert('Load some data first');
        return;
    }

    const { collection, data } = window._lastDbData;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection}_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

async function editDocument(collection, docId) {
    const db = firebase.firestore();
    const doc = await db.collection(collection).doc(docId).get();

    if (!doc.exists) {
        alert('Document not found');
        return;
    }

    const data = doc.data();
    const newData = prompt('Edit JSON (be careful!):', JSON.stringify(data, null, 2));

    if (newData === null) return;

    try {
        const parsed = JSON.parse(newData);
        await db.collection(collection).doc(docId).update(parsed);
        alert('Document updated!');
        loadCollectionData();
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

async function deleteDocument(collection, docId) {
    if (!confirm(`Delete document ${docId} from ${collection}?`)) return;

    try {
        await firebase.firestore().collection(collection).doc(docId).delete();
        alert('Document deleted!');
        loadCollectionData();
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

// ============================================
// LIVE MONITOR
// ============================================
let liveMonitorInterval = null;

async function loadLiveMonitorTab(container) {
    container.innerHTML = `
        <div style="display: grid; gap: 20px;">
            <div style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 style="color: var(--text-primary); display: flex; align-items: center; gap: 10px; margin: 0;">
                        <i class="fas fa-satellite-dish" style="color: #10b981;"></i>
                        Live Activity Monitor
                    </h3>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="startLiveMonitor()" class="btn-primary" style="background: #10b981;">
                            <i class="fas fa-play"></i> Start
                        </button>
                        <button onclick="stopLiveMonitor()" class="btn-secondary">
                            <i class="fas fa-stop"></i> Stop
                        </button>
                    </div>
                </div>
                <div id="live-feed" style="background: var(--bg-primary); border-radius: 12px; padding: 16px; max-height: 400px; overflow-y: auto; font-family: monospace; font-size: 13px;">
                    <div style="color: var(--text-muted);">Click "Start" to begin monitoring...</div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div style="background: var(--bg-secondary); border-radius: 16px; padding: 24px;">
                <h4 style="color: var(--text-primary); margin-bottom: 16px;">Recent Clock-ins Today</h4>
                <div id="recent-clockins">Loading...</div>
            </div>
        </div>
    `;

    // Load recent clockins
    await loadRecentClockins();
}

async function loadRecentClockins() {
    const container = document.getElementById('recent-clockins');
    const today = new Date().toISOString().split('T')[0];

    try {
        const snapshot = await firebase.firestore().collection('clockin')
            .where('date', '==', today)
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();

        if (snapshot.empty) {
            container.innerHTML = '<div style="color: var(--text-muted);">No clock-ins today</div>';
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';
        snapshot.forEach(doc => {
            const data = doc.data();
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-primary); border-radius: 8px;">
                    <div>
                        <div style="font-weight: 600; color: var(--text-primary);">${data.employeeName || 'Unknown'}</div>
                        <div style="font-size: 12px; color: var(--text-muted);">${data.store || 'No store'}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 14px; color: var(--text-primary);">
                            ${data.clockIn ? `In: ${data.clockIn}` : ''}
                            ${data.clockOut ? ` | Out: ${data.clockOut}` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div style="color: #ef4444;">Error: ${e.message}</div>`;
    }
}

function startLiveMonitor() {
    const feed = document.getElementById('live-feed');
    feed.innerHTML = '<div style="color: #10b981;">[MONITOR STARTED] Listening for changes...</div>';

    // Monitor multiple collections
    const collections = ['clockin', 'announcements', 'schedules', 'dayOffRequests'];

    window._liveUnsubscribes = collections.map(col => {
        return firebase.firestore().collection(col)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added' || change.type === 'modified') {
                        const data = change.doc.data();
                        const time = new Date().toLocaleTimeString();
                        const entry = document.createElement('div');
                        entry.style.cssText = 'padding: 8px; border-bottom: 1px solid var(--border-color); color: var(--text-secondary);';
                        entry.innerHTML = `
                            <span style="color: #10b981;">[${time}]</span>
                            <span style="color: #3b82f6;">[${col}]</span>
                            <span style="color: #f59e0b;">[${change.type}]</span>
                            ${data.employeeName || data.name || data.title || change.doc.id}
                        `;
                        feed.insertBefore(entry, feed.firstChild);
                    }
                });
            });
    });
}

function stopLiveMonitor() {
    if (window._liveUnsubscribes) {
        window._liveUnsubscribes.forEach(unsub => unsub());
        window._liveUnsubscribes = null;
    }
    const feed = document.getElementById('live-feed');
    if (feed) {
        const entry = document.createElement('div');
        entry.style.cssText = 'padding: 8px; color: #ef4444;';
        entry.textContent = `[${new Date().toLocaleTimeString()}] MONITOR STOPPED`;
        feed.insertBefore(entry, feed.firstChild);
    }
}

// ============================================
// EMERGENCY CONTROLS
// ============================================
function loadEmergencyTab(container) {
    container.innerHTML = `
        <div style="display: grid; gap: 20px;">
            <!-- Warning -->
            <div style="background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 2px solid #ef4444; border-radius: 16px; padding: 24px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <i class="fas fa-radiation" style="font-size: 32px; color: #ef4444;"></i>
                    <div>
                        <div style="font-weight: 700; color: #b91c1c; font-size: 18px;">Emergency Controls</div>
                        <div style="color: #dc2626;">These actions affect ALL users immediately</div>
                    </div>
                </div>
            </div>

            <!-- Maintenance Mode -->
            <div style="background: var(--bg-secondary); border-radius: 16px; padding: 24px;">
                <h4 style="color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-tools" style="color: #f59e0b;"></i>
                    Maintenance Mode
                </h4>
                <p style="color: var(--text-muted); margin-bottom: 16px;">
                    Enable maintenance mode to prevent users from making changes. Only you will have full access.
                </p>
                <div style="display: flex; gap: 12px;">
                    <button onclick="toggleMaintenanceMode(true)" class="btn-primary" style="background: #f59e0b;">
                        <i class="fas fa-lock"></i> Enable Maintenance
                    </button>
                    <button onclick="toggleMaintenanceMode(false)" class="btn-secondary">
                        <i class="fas fa-lock-open"></i> Disable Maintenance
                    </button>
                </div>
            </div>

            <!-- Broadcast Message -->
            <div style="background: var(--bg-secondary); border-radius: 16px; padding: 24px;">
                <h4 style="color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-bullhorn" style="color: #3b82f6;"></i>
                    Broadcast Message
                </h4>
                <p style="color: var(--text-muted); margin-bottom: 16px;">
                    Send an instant announcement to all users. Will appear as a popup.
                </p>
                <div style="display: grid; gap: 12px;">
                    <input type="text" id="broadcast-title" class="form-input" placeholder="Title">
                    <textarea id="broadcast-message" class="form-input" placeholder="Message..." style="min-height: 80px;"></textarea>
                    <select id="broadcast-type" class="form-input">
                        <option value="info">Info (Blue)</option>
                        <option value="warning">Warning (Yellow)</option>
                        <option value="error">Urgent (Red)</option>
                        <option value="success">Good News (Green)</option>
                    </select>
                    <button onclick="sendBroadcast()" class="btn-primary">
                        <i class="fas fa-paper-plane"></i> Send Broadcast
                    </button>
                </div>
            </div>

            <!-- Force Actions -->
            <div style="background: var(--bg-secondary); border-radius: 16px; padding: 24px;">
                <h4 style="color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-bomb" style="color: #ef4444;"></i>
                    Force Actions
                </h4>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <button onclick="forceRefreshAll()" class="btn-secondary">
                        <i class="fas fa-sync"></i> Force Refresh All Clients
                    </button>
                    <button onclick="clearAllCache()" class="btn-secondary">
                        <i class="fas fa-broom"></i> Clear All Cache
                    </button>
                    <button onclick="resetAllSessions()" class="btn-secondary" style="color: #ef4444; border-color: #ef4444;">
                        <i class="fas fa-sign-out-alt"></i> Force Logout Everyone
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function toggleMaintenanceMode(enable) {
    try {
        await firebase.firestore().collection('system').doc('config').set({
            maintenanceMode: enable,
            maintenanceBy: SUPER_ADMIN_EMAIL,
            maintenanceAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        alert(`Maintenance mode ${enable ? 'ENABLED' : 'DISABLED'}`);
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

async function sendBroadcast() {
    const title = document.getElementById('broadcast-title')?.value.trim();
    const message = document.getElementById('broadcast-message')?.value.trim();
    const type = document.getElementById('broadcast-type')?.value;

    if (!title || !message) {
        alert('Please fill in title and message');
        return;
    }

    try {
        await firebase.firestore().collection('broadcasts').add({
            title,
            message,
            type,
            sentBy: SUPER_ADMIN_EMAIL,
            sentAt: firebase.firestore.FieldValue.serverTimestamp(),
            active: true
        });
        alert('Broadcast sent!');
        document.getElementById('broadcast-title').value = '';
        document.getElementById('broadcast-message').value = '';
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

async function forceRefreshAll() {
    await firebase.firestore().collection('system').doc('config').set({
        forceRefresh: Date.now()
    }, { merge: true });
    alert('Force refresh signal sent to all clients');
}

async function clearAllCache() {
    localStorage.clear();
    sessionStorage.clear();
    alert('Local cache cleared. Refreshing...');
    location.reload();
}

async function resetAllSessions() {
    if (!confirm('This will force logout ALL users. Are you sure?')) return;

    await firebase.firestore().collection('system').doc('config').set({
        forceLogout: Date.now()
    }, { merge: true });
    alert('Force logout signal sent');
}

// ============================================
// MASS OPERATIONS
// ============================================
function loadMassOpsTab(container) {
    container.innerHTML = `
        <div style="display: grid; gap: 20px;">
            <!-- Mass Update -->
            <div style="background: var(--bg-secondary); border-radius: 16px; padding: 24px;">
                <h4 style="color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-edit" style="color: #8b5cf6;"></i>
                    Mass Update Field
                </h4>
                <p style="color: var(--text-muted); margin-bottom: 16px;">
                    Update a field across all documents in a collection
                </p>
                <div style="display: grid; gap: 12px;">
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <input type="text" id="mass-collection" class="form-input" placeholder="Collection name" style="flex: 1;">
                        <input type="text" id="mass-field" class="form-input" placeholder="Field name" style="flex: 1;">
                        <input type="text" id="mass-value" class="form-input" placeholder="New value" style="flex: 1;">
                    </div>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <input type="text" id="mass-where-field" class="form-input" placeholder="Where field (optional)" style="flex: 1;">
                        <input type="text" id="mass-where-value" class="form-input" placeholder="Equals value" style="flex: 1;">
                    </div>
                    <button onclick="executeMassUpdate()" class="btn-primary" style="background: #8b5cf6;">
                        <i class="fas fa-bolt"></i> Execute Mass Update
                    </button>
                </div>
            </div>

            <!-- Mass Delete -->
            <div style="background: var(--bg-secondary); border-radius: 16px; padding: 24px;">
                <h4 style="color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-trash-alt" style="color: #ef4444;"></i>
                    Mass Delete
                </h4>
                <p style="color: var(--text-muted); margin-bottom: 16px;">
                    Delete all documents matching criteria
                </p>
                <div style="display: grid; gap: 12px;">
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <input type="text" id="delete-collection" class="form-input" placeholder="Collection name" style="flex: 1;">
                        <input type="text" id="delete-where-field" class="form-input" placeholder="Where field" style="flex: 1;">
                        <input type="text" id="delete-where-value" class="form-input" placeholder="Equals value" style="flex: 1;">
                    </div>
                    <button onclick="executeMassDelete()" class="btn-primary" style="background: #ef4444;">
                        <i class="fas fa-skull"></i> Execute Mass Delete
                    </button>
                </div>
            </div>

            <!-- Clone Collection -->
            <div style="background: var(--bg-secondary); border-radius: 16px; padding: 24px;">
                <h4 style="color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-clone" style="color: #10b981;"></i>
                    Clone/Backup Collection
                </h4>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <input type="text" id="clone-source" class="form-input" placeholder="Source collection" style="flex: 1;">
                    <input type="text" id="clone-dest" class="form-input" placeholder="Destination collection" style="flex: 1;">
                    <button onclick="cloneCollection()" class="btn-primary" style="background: #10b981;">
                        <i class="fas fa-copy"></i> Clone
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function executeMassUpdate() {
    const collection = document.getElementById('mass-collection')?.value.trim();
    const field = document.getElementById('mass-field')?.value.trim();
    const value = document.getElementById('mass-value')?.value.trim();
    const whereField = document.getElementById('mass-where-field')?.value.trim();
    const whereValue = document.getElementById('mass-where-value')?.value.trim();

    if (!collection || !field) {
        alert('Please fill in collection and field');
        return;
    }

    if (!confirm(`Update "${field}" to "${value}" in all ${collection} documents?`)) return;

    try {
        const db = firebase.firestore();
        let query = db.collection(collection);

        if (whereField && whereValue) {
            query = query.where(whereField, '==', whereValue);
        }

        const snapshot = await query.get();
        let count = 0;

        for (const doc of snapshot.docs) {
            await doc.ref.update({ [field]: value });
            count++;
        }

        alert(`Updated ${count} documents`);
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

async function executeMassDelete() {
    const collection = document.getElementById('delete-collection')?.value.trim();
    const whereField = document.getElementById('delete-where-field')?.value.trim();
    const whereValue = document.getElementById('delete-where-value')?.value.trim();

    if (!collection || !whereField || !whereValue) {
        alert('Please fill in all fields');
        return;
    }

    const confirm1 = confirm(`Delete all ${collection} where ${whereField} == ${whereValue}?`);
    if (!confirm1) return;

    const confirm2 = prompt('Type "DELETE" to confirm:');
    if (confirm2 !== 'DELETE') return;

    try {
        const snapshot = await firebase.firestore().collection(collection)
            .where(whereField, '==', whereValue)
            .get();

        let count = 0;
        for (const doc of snapshot.docs) {
            await doc.ref.delete();
            count++;
        }

        alert(`Deleted ${count} documents`);
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

async function cloneCollection() {
    const source = document.getElementById('clone-source')?.value.trim();
    const dest = document.getElementById('clone-dest')?.value.trim();

    if (!source || !dest) {
        alert('Please fill in source and destination');
        return;
    }

    if (!confirm(`Clone all documents from "${source}" to "${dest}"?`)) return;

    try {
        const db = firebase.firestore();
        const snapshot = await db.collection(source).get();
        let count = 0;

        for (const doc of snapshot.docs) {
            await db.collection(dest).doc(doc.id).set(doc.data());
            count++;
        }

        alert(`Cloned ${count} documents to ${dest}`);
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

// ============================================
// FEATURE FLAGS
// ============================================
async function loadFeaturesTab(container) {
    container.innerHTML = `
        <div style="display: grid; gap: 20px;">
            <div style="background: var(--bg-secondary); border-radius: 16px; padding: 24px;">
                <h4 style="color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-toggle-on" style="color: #10b981;"></i>
                    Feature Flags
                </h4>
                <p style="color: var(--text-muted); margin-bottom: 20px;">
                    Enable/disable features for all users or specific users
                </p>
                <div id="feature-flags-list">Loading...</div>
            </div>

            <!-- Add Feature Flag -->
            <div style="background: var(--bg-secondary); border-radius: 16px; padding: 24px;">
                <h4 style="color: var(--text-primary); margin-bottom: 12px;">Add Feature Flag</h4>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <input type="text" id="new-flag-name" class="form-input" placeholder="Feature name" style="flex: 1;">
                    <select id="new-flag-status" class="form-input" style="width: 150px;">
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                        <option value="carlos_only">Carlos Only</option>
                    </select>
                    <button onclick="addFeatureFlag()" class="btn-primary">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `;

    await loadFeatureFlags();
}

async function loadFeatureFlags() {
    const container = document.getElementById('feature-flags-list');

    try {
        const doc = await firebase.firestore().collection('system').doc('features').get();
        const flags = doc.exists ? doc.data() : {};

        if (Object.keys(flags).length === 0) {
            container.innerHTML = '<div style="color: var(--text-muted);">No feature flags configured</div>';
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
        for (const [name, value] of Object.entries(flags)) {
            const isEnabled = value === true || value === 'true';
            const isCarlosOnly = value === 'carlos_only';

            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-primary); border-radius: 8px;">
                    <div>
                        <div style="font-weight: 600; color: var(--text-primary);">${name}</div>
                        <div style="font-size: 12px; color: var(--text-muted);">
                            ${isCarlosOnly ? 'Carlos Only' : (isEnabled ? 'Enabled for all' : 'Disabled')}
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="toggleFeatureFlag('${name}', true)" class="btn-secondary" style="font-size: 12px; ${isEnabled && !isCarlosOnly ? 'background: #10b981; color: white;' : ''}">
                            On
                        </button>
                        <button onclick="toggleFeatureFlag('${name}', false)" class="btn-secondary" style="font-size: 12px; ${!isEnabled && !isCarlosOnly ? 'background: #ef4444; color: white;' : ''}">
                            Off
                        </button>
                        <button onclick="toggleFeatureFlag('${name}', 'carlos_only')" class="btn-secondary" style="font-size: 12px; ${isCarlosOnly ? 'background: #8b5cf6; color: white;' : ''}">
                            Carlos
                        </button>
                        <button onclick="deleteFeatureFlag('${name}')" class="btn-secondary" style="font-size: 12px; color: #ef4444;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }
        html += '</div>';
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div style="color: #ef4444;">Error: ${e.message}</div>`;
    }
}

async function toggleFeatureFlag(name, value) {
    try {
        await firebase.firestore().collection('system').doc('features').set({
            [name]: value
        }, { merge: true });
        await loadFeatureFlags();
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

async function addFeatureFlag() {
    const name = document.getElementById('new-flag-name')?.value.trim();
    const status = document.getElementById('new-flag-status')?.value;

    if (!name) {
        alert('Please enter a feature name');
        return;
    }

    let value = status === 'true' ? true : (status === 'false' ? false : status);

    try {
        await firebase.firestore().collection('system').doc('features').set({
            [name]: value
        }, { merge: true });
        document.getElementById('new-flag-name').value = '';
        await loadFeatureFlags();
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

async function deleteFeatureFlag(name) {
    if (!confirm(`Delete feature flag "${name}"?`)) return;

    try {
        await firebase.firestore().collection('system').doc('features').update({
            [name]: firebase.firestore.FieldValue.delete()
        });
        await loadFeatureFlags();
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

// ============================================
// EMPLOYEES TAB (Original functionality)
// ============================================
async function loadEmployeesTab(container) {
    container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <i class="fas fa-spinner fa-spin" style="font-size: 32px;"></i>
            <p style="margin-top: 16px;">Loading all employees...</p>
        </div>
    `;

    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('employees').get();

        let employees = [];
        snapshot.forEach(doc => {
            employees.push({ id: doc.id, ...doc.data() });
        });

        employees.sort((a, b) => {
            if (a.status === 'inactive' && b.status !== 'inactive') return -1;
            if (a.status !== 'inactive' && b.status === 'inactive') return 1;
            return (a.name || '').localeCompare(b.name || '');
        });

        let html = `
            <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div style="color: var(--text-muted);">
                    <i class="fas fa-database"></i> ${employees.length} employees in Firestore
                </div>
                <input type="text" id="sa-search" class="form-input" placeholder="Search..."
                    style="width: 250px;" oninput="filterSuperAdminEmployees()">
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: var(--bg-secondary); border-bottom: 2px solid var(--border-color);">
                            <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: var(--text-muted);">Status</th>
                            <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: var(--text-muted);">Name</th>
                            <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: var(--text-muted);">Email</th>
                            <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: var(--text-muted);">Firebase UID</th>
                            <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: var(--text-muted);">Firestore ID</th>
                            <th style="padding: 12px; text-align: center; font-size: 12px; text-transform: uppercase; color: var(--text-muted);">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="sa-employees-table">
        `;

        employees.forEach(emp => {
            const isInactive = emp.status === 'inactive';
            const rowStyle = isInactive ? 'background: #fef2f2;' : '';
            const nameStyle = isInactive ? 'color: #ef4444; text-decoration: line-through;' : 'color: var(--text-primary);';

            html += `
                <tr class="sa-employee-row" data-name="${(emp.name || '').toLowerCase()}" data-email="${(emp.email || '').toLowerCase()}" style="${rowStyle} border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 12px;">
                        ${isInactive
                            ? '<span style="background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">INACTIVE</span>'
                            : '<span style="background: #dcfce7; color: #16a34a; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">ACTIVE</span>'
                        }
                    </td>
                    <td style="padding: 12px; font-weight: 600; ${nameStyle}">${emp.name || 'No name'}</td>
                    <td style="padding: 12px; font-size: 13px; color: var(--text-secondary);">${emp.email || emp.authEmail || '-'}</td>
                    <td style="padding: 12px; font-family: monospace; font-size: 11px; color: var(--text-muted);">${emp.firebaseUid ? emp.firebaseUid.substring(0, 12) + '...' : '<span style="color: #f59e0b;">No UID</span>'}</td>
                    <td style="padding: 12px; font-family: monospace; font-size: 11px; color: var(--text-muted);">${emp.id.substring(0, 12)}...</td>
                    <td style="padding: 12px; text-align: center;">
                        <div style="display: flex; gap: 6px; justify-content: center;">
                            <button onclick="viewEmployeeDetails('${emp.id}')" style="width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); cursor: pointer; color: var(--text-secondary);" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="quickImpersonate('${emp.id}', '${(emp.name || '').replace(/'/g, "\\'")}', '${emp.email || ''}', '${emp.employeeType || emp.role || 'employee'}', '${emp.store || ''}')" style="width: 32px; height: 32px; border-radius: 8px; border: 1px solid #8b5cf6; background: rgba(139,92,246,0.1); cursor: pointer; color: #8b5cf6;" title="Impersonate">
                                <i class="fas fa-mask"></i>
                            </button>
                            <button onclick="nukeEmployee('${emp.id}', '${emp.firebaseUid || ''}', '${(emp.name || '').replace(/'/g, "\\'")}')" style="width: 32px; height: 32px; border-radius: 8px; border: none; background: #ef4444; cursor: pointer; color: white;" title="DELETE FOREVER">
                                <i class="fas fa-bomb"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading employees:', error);
        container.innerHTML = `<div style="color: #ef4444; padding: 20px;">Error: ${error.message}</div>`;
    }
}

function filterSuperAdminEmployees() {
    const search = document.getElementById('sa-search')?.value.toLowerCase() || '';
    document.querySelectorAll('.sa-employee-row').forEach(row => {
        const name = row.dataset.name || '';
        const email = row.dataset.email || '';
        row.style.display = (name.includes(search) || email.includes(search)) ? '' : 'none';
    });
}

async function viewEmployeeDetails(employeeId) {
    const db = firebase.firestore();

    try {
        const doc = await db.collection('employees').doc(employeeId).get();
        if (!doc.exists) {
            alert('Employee not found');
            return;
        }

        const data = doc.data();

        const [schedules, clockin, dayOffReqs, daysOff] = await Promise.all([
            db.collection('schedules').where('employeeId', '==', employeeId).get(),
            db.collection('clockin').where('employeeId', '==', employeeId).get(),
            db.collection('dayOffRequests').where('employeeId', '==', employeeId).get(),
            db.collection('daysOff').where('employeeId', '==', employeeId).get()
        ]);

        const details = `
EMPLOYEE DETAILS
================
Name: ${data.name || 'N/A'}
Email: ${data.email || 'N/A'}
Auth Email: ${data.authEmail || 'N/A'}
Status: ${data.status || 'active'}
Store: ${data.store || 'N/A'}
Role: ${data.employeeType || data.role || 'N/A'}
Firebase UID: ${data.firebaseUid || 'NONE'}
Firestore ID: ${employeeId}
Hire Date: ${data.hireDate || 'N/A'}
Created: ${data.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}

RELATED DATA
============
Schedules: ${schedules.size}
Clock-in Records: ${clockin.size}
Day Off Requests: ${dayOffReqs.size}
Days Off: ${daysOff.size}
        `;

        alert(details);

    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function nukeEmployee(employeeId, firebaseUid, employeeName) {
    if (!confirm(`⚠️ DANGER! You are about to PERMANENTLY DELETE:\n\n${employeeName}\n\nThis will remove:\n- Firestore employee document\n- All schedules\n- All clock-in records\n- All day off requests\n- All days off\n${firebaseUid ? '- Firebase Auth account (manual)' : ''}\n\nThis CANNOT be undone!`)) {
        return;
    }

    const confirmation = prompt(`Type "${employeeName}" to confirm deletion:`);
    if (confirmation !== employeeName) {
        alert('Deletion cancelled - name did not match');
        return;
    }

    const db = firebase.firestore();

    try {
        console.log('☢️ NUKING employee:', employeeName);

        const schedules = await db.collection('schedules').where('employeeId', '==', employeeId).get();
        for (const doc of schedules.docs) await doc.ref.delete();
        console.log(`✅ Deleted ${schedules.size} schedules`);

        const clockin = await db.collection('clockin').where('employeeId', '==', employeeId).get();
        for (const doc of clockin.docs) await doc.ref.delete();
        console.log(`✅ Deleted ${clockin.size} clock-in records`);

        const dayOffReqs = await db.collection('dayOffRequests').where('employeeId', '==', employeeId).get();
        for (const doc of dayOffReqs.docs) await doc.ref.delete();
        console.log(`✅ Deleted ${dayOffReqs.size} day off requests`);

        const daysOff = await db.collection('daysOff').where('employeeId', '==', employeeId).get();
        for (const doc of daysOff.docs) await doc.ref.delete();
        console.log(`✅ Deleted ${daysOff.size} days off`);

        await db.collection('employees').doc(employeeId).delete();
        console.log('✅ Deleted employee document');

        if (firebaseUid) {
            alert(`✅ Employee deleted from Firestore!\n\n⚠️ IMPORTANT: Manually delete Firebase Auth user:\nUID: ${firebaseUid}\n\nFirebase Console > Authentication > Users`);
        } else {
            alert('✅ Employee completely deleted!');
        }

        await loadSuperAdminTab('employees');

    } catch (error) {
        console.error('Error nuking employee:', error);
        alert('Error: ' + error.message);
    }
}

// ============================================
// TOOLS TAB
// ============================================
function loadToolsTab(container) {
    container.innerHTML = `
        <div style="display: grid; gap: 16px;">
            <div style="background: var(--bg-secondary); border-radius: 16px; padding: 24px;">
                <h3 style="color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-crosshairs" style="color: #ef4444;"></i>
                    Quick Delete by ID
                </h3>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <input type="text" id="quick-delete-id" class="form-input" placeholder="Firestore Document ID" style="flex: 1; min-width: 250px;">
                    <button onclick="quickDeleteById()" class="btn-primary" style="background: #ef4444;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>

            <div style="background: var(--bg-secondary); border-radius: 16px; padding: 24px;">
                <h3 style="color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-exchange-alt" style="color: #3b82f6;"></i>
                    Migrate Employee
                </h3>
                <div style="display: grid; gap: 12px;">
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <input type="text" id="migrate-old-id" class="form-input" placeholder="Old Employee ID" style="flex: 1;">
                        <input type="email" id="migrate-new-email" class="form-input" placeholder="New Email" style="flex: 1;">
                    </div>
                    <button onclick="runMigration()" class="btn-primary">
                        <i class="fas fa-play"></i> Run Migration
                    </button>
                </div>
            </div>

            <div style="background: var(--bg-secondary); border-radius: 16px; padding: 24px;">
                <h3 style="color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-user-plus" style="color: #10b981;"></i>
                    Create Auth User
                </h3>
                <div style="display: grid; gap: 12px;">
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <input type="text" id="create-auth-employee-id" class="form-input" placeholder="Employee Firestore ID" style="flex: 1;">
                        <input type="email" id="create-auth-email" class="form-input" placeholder="Email" style="flex: 1;">
                        <input type="text" id="create-auth-password" class="form-input" placeholder="Temp Password" style="flex: 1;" value="TempPass123!">
                    </div>
                    <button onclick="createAuthUser()" class="btn-primary" style="background: #10b981;">
                        <i class="fas fa-user-plus"></i> Create Auth User
                    </button>
                </div>
            </div>

            <div style="background: var(--bg-secondary); border-radius: 16px; padding: 24px;">
                <h3 style="color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-terminal" style="color: #f59e0b;"></i>
                    Console Commands
                </h3>
                <p style="color: var(--text-muted); margin-bottom: 12px; font-size: 14px;">Useful commands for the browser console:</p>
                <div style="background: var(--bg-primary); border-radius: 8px; padding: 16px; font-family: monospace; font-size: 12px; color: var(--text-secondary);">
                    <div style="margin-bottom: 8px;"><span style="color: #10b981;">// Check God Mode status</span></div>
                    <div style="margin-bottom: 12px;">console.log(godModeActive, impersonatedUser)</div>
                    <div style="margin-bottom: 8px;"><span style="color: #10b981;">// Get current user</span></div>
                    <div style="margin-bottom: 12px;">getCurrentUser()</div>
                    <div style="margin-bottom: 8px;"><span style="color: #10b981;">// Exit God Mode</span></div>
                    <div>exitGodMode()</div>
                </div>
            </div>
        </div>
    `;
}

async function quickDeleteById() {
    const id = document.getElementById('quick-delete-id')?.value.trim();
    if (!id) {
        alert('Please enter a Firestore ID');
        return;
    }

    const db = firebase.firestore();
    const doc = await db.collection('employees').doc(id).get();

    if (!doc.exists) {
        alert('Employee not found with ID: ' + id);
        return;
    }

    const data = doc.data();
    await nukeEmployee(id, data.firebaseUid || '', data.name || 'Unknown');
}

async function runMigration() {
    const oldId = document.getElementById('migrate-old-id')?.value.trim();
    const newEmail = document.getElementById('migrate-new-email')?.value.trim();

    if (!oldId || !newEmail) {
        alert('Please fill in both fields');
        return;
    }

    const db = firebase.firestore();

    try {
        const oldDoc = await db.collection('employees').doc(oldId).get();
        if (!oldDoc.exists) {
            alert('Employee not found');
            return;
        }

        const data = oldDoc.data();
        delete data.firebaseUid;
        data.email = newEmail;
        data.authEmail = newEmail;

        const newDoc = await db.collection('employees').add(data);

        const collections = ['schedules', 'clockin', 'dayOffRequests', 'daysOff'];
        for (const col of collections) {
            const snap = await db.collection(col).where('employeeId', '==', oldId).get();
            for (const doc of snap.docs) {
                await doc.ref.update({ employeeId: newDoc.id });
            }
        }

        alert(`Migration complete!\nNew ID: ${newDoc.id}\n\nDon't forget to delete the old document: ${oldId}`);

    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function createAuthUser() {
    const employeeId = document.getElementById('create-auth-employee-id')?.value.trim();
    const email = document.getElementById('create-auth-email')?.value.trim();
    const password = document.getElementById('create-auth-password')?.value.trim();

    if (!employeeId || !email || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;

        await firebase.firestore().collection('employees').doc(employeeId).update({
            firebaseUid: uid,
            authEmail: email
        });

        await firebase.auth().signOut();

        alert(`✅ Auth user created!\n\nEmail: ${email}\nPassword: ${password}\nUID: ${uid}\n\n⚠️ You have been signed out. Please log in again.`);

    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ============================================
// INITIALIZATION
// ============================================
function checkSuperAdminAccess() {
    const navElement = document.getElementById('super-admin-nav');
    if (!navElement) {
        console.log('👑 Super Admin nav element not found yet');
        return;
    }

    // Try multiple ways to get current user
    let userEmail = '';

    // Method 1: getCurrentUser function
    if (typeof getCurrentUser === 'function') {
        const user = getCurrentUser();
        userEmail = user?.email || user?.authEmail || '';
    }

    // Method 2: authManager
    if (!userEmail && window.authManager?.getCurrentUser) {
        const user = window.authManager.getCurrentUser();
        userEmail = user?.email || user?.authEmail || '';
    }

    // Method 3: Firebase Auth directly
    if (!userEmail && window.firebase?.auth) {
        const fbUser = firebase.auth().currentUser;
        userEmail = fbUser?.email || '';
    }

    console.log('👑 Checking access for:', userEmail);

    if (userEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
        navElement.style.display = 'block';
        console.log('👑 GOD MODE ACCESS GRANTED');
    } else {
        navElement.style.display = 'none';
    }
}

// Check multiple times as auth may load later
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkSuperAdminAccess, 500);
    setTimeout(checkSuperAdminAccess, 1500);
    setTimeout(checkSuperAdminAccess, 3000);
    setTimeout(checkSuperAdminAccess, 5000);
});

// Also check when Firebase auth state changes
if (window.firebase?.auth) {
    firebase.auth().onAuthStateChanged(() => {
        setTimeout(checkSuperAdminAccess, 500);
    });
}

window.checkSuperAdminAccess = checkSuperAdminAccess;
window.exitGodMode = exitGodMode;

// Force check on load
setTimeout(checkSuperAdminAccess, 100);

console.log('👑 Super Admin GOD MODE module loaded');
