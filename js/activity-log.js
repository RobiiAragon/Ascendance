// ==========================================
// ACTIVITY LOG MODULE
// ==========================================

// Note: ACTIVITY_TYPES is defined at the top of this file to avoid initialization errors

// Log activity to Firebase
async function logActivity(type, details = {}, entityType = null, entityId = null) {
    try {
        // Get user from multiple sources for reliability
        let user = getCurrentUser();

        // Fallback to localStorage if getCurrentUser fails (e.g., during login)
        if (!user) {
            try {
                const sessionUser = localStorage.getItem('ascendance_user');
                if (sessionUser) {
                    user = JSON.parse(sessionUser);
                }
            } catch (e) {
                console.warn('Could not get user from localStorage:', e);
            }
        }

        // If still no user and details has user info, use that (for login events)
        if (!user && details.userName) {
            user = {
                id: details.userId || 'unknown',
                name: details.userName,
                email: details.userEmail || 'unknown',
                role: details.userRole || 'unknown',
                store: details.store || 'Unknown'
            };
        }

        // Skip logging if no user context at all (except for system events)
        if (!user && type !== 'system') {
            console.warn('Cannot log activity without user context:', type);
            return;
        }

        const activityData = {
            type: type,
            userId: user?.id || user?.userId || user?.firestoreId || 'unknown',
            userName: user?.name || 'Unknown User',
            userEmail: user?.email || user?.authEmail || 'unknown',
            userRole: user?.role || user?.employeeType || 'unknown',
            entityType: entityType,
            entityId: entityId,
            details: details,
            timestamp: new Date().toISOString(),
            store: user?.store || details?.store || null,
            ipAddress: null,
            userAgent: navigator.userAgent
        };

        // Save to Firebase
        if (window.firebase && firebase.firestore) {
            await firebase.firestore().collection('activityLogs').add(activityData);
        }

        // Also keep in localStorage for quick access
        const localLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        localLogs.unshift(activityData);
        // Keep only last 500 local entries
        if (localLogs.length > 500) localLogs.length = 500;
        localStorage.setItem('activityLogs', JSON.stringify(localLogs));

        console.log('📝 Activity logged:', type, details);
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

// Load activity logs from Firebase
async function loadActivityLogs(filters = {}) {
    try {
        let logs = [];

        if (window.firebase && firebase.firestore) {
            let query = firebase.firestore().collection('activityLogs')
                .orderBy('timestamp', 'desc')
                .limit(filters.limit || 100);

            if (filters.type) {
                query = query.where('type', '==', filters.type);
            }
            if (filters.userId) {
                query = query.where('userId', '==', filters.userId);
            }
            if (filters.startDate) {
                query = query.where('timestamp', '>=', filters.startDate);
            }
            if (filters.endDate) {
                query = query.where('timestamp', '<=', filters.endDate);
            }

            const snapshot = await query.get();
            logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        // Fallback to localStorage if no Firebase logs
        if (logs.length === 0) {
            logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        }

        return logs;
    } catch (error) {
        console.error('Error loading activity logs:', error);
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('activityLogs') || '[]');
    }
}

// Render Activity Log page
async function renderActivityLog() {
    const dashboard = document.querySelector('.dashboard');

    dashboard.innerHTML = `
        <div class="page-header activity-log-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div class="page-header-left">
                <h2 class="section-title"><i class="fas fa-history" style="color: var(--accent-primary);"></i> Activity Log</h2>
                <p class="section-subtitle">Track all system activities and user actions</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn-secondary" onclick="exportActivityLog()">
                    <i class="fas fa-download"></i> <span class="btn-text">Export</span>
                </button>
                <button class="btn-secondary" onclick="renderActivityLog()">
                    <i class="fas fa-sync-alt"></i> <span class="btn-text">Refresh</span>
                </button>
            </div>
        </div>

        <!-- Filters -->
        <div class="card" style="margin-bottom: 20px; padding: 16px;">
            <div class="activity-filters" style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                <div class="search-filter" style="flex: 1; min-width: 200px;">
                    <i class="fas fa-search"></i>
                    <input type="text" id="activity-search" placeholder="Search by user, action..." onkeyup="filterActivityLogs()">
                </div>
                <select class="filter-select" id="activity-type-filter" onchange="filterActivityLogs()">
                    <option value="">All Activities</option>
                    <option value="login">Logins</option>
                    <option value="logout">Logouts</option>
                    <option value="clock_in">Clock In</option>
                    <option value="clock_out">Clock Out</option>
                    <option value="create">Created</option>
                    <option value="update">Updated</option>
                    <option value="delete">Deleted</option>
                    <option value="view">Page Views</option>
                    <option value="export">Exports</option>
                    <option value="schedule">Schedule Changes</option>
                    <option value="announcement">Announcements</option>
                    <option value="invoice">Invoices</option>
                    <option value="inventory">Inventory</option>
                    <option value="restock">Restocks</option>
                    <option value="transfer">Transfers</option>
                </select>
                <select class="filter-select" id="activity-user-filter" onchange="filterActivityLogs()">
                    <option value="">All Users</option>
                </select>
                <input type="date" class="form-input" id="activity-date-filter" onchange="filterActivityLogs()" style="width: auto;">
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid activity-stats-grid" id="activity-stats" style="margin-bottom: 20px;">
            <div class="stat-card activity-stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #10b981, #059669);"><i class="fas fa-sign-in-alt"></i></div>
                <div class="stat-content">
                    <span class="stat-value" id="stat-logins">-</span>
                    <span class="stat-label">Logins Today</span>
                </div>
            </div>
            <div class="stat-card activity-stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);"><i class="fas fa-clock"></i></div>
                <div class="stat-content">
                    <span class="stat-value" id="stat-clockins">-</span>
                    <span class="stat-label">Clock Ins Today</span>
                </div>
            </div>
            <div class="stat-card activity-stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);"><i class="fas fa-edit"></i></div>
                <div class="stat-content">
                    <span class="stat-value" id="stat-changes">-</span>
                    <span class="stat-label">Changes Today</span>
                </div>
            </div>
            <div class="stat-card activity-stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);"><i class="fas fa-users"></i></div>
                <div class="stat-content">
                    <span class="stat-value" id="stat-active-users">-</span>
                    <span class="stat-label">Active Users</span>
                </div>
            </div>
        </div>

        <!-- Activity Table -->
        <div class="card" style="overflow: hidden;">
            <div class="card-header" style="padding: 16px 20px; border-bottom: 1px solid var(--border-color);">
                <h3 style="font-size: 16px; font-weight: 600;">Recent Activity</h3>
            </div>
            <div id="activity-log-container" style="overflow-x: auto;">
                <div style="padding: 40px; text-align: center;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: var(--text-muted);"></i>
                    <p style="color: var(--text-muted); margin-top: 10px;">Loading activities...</p>
                </div>
            </div>
        </div>
    `;

    // Load and display activity logs
    await loadAndDisplayActivityLogs();
}

// Load and display activity logs with stats
async function loadAndDisplayActivityLogs() {
    const logs = await loadActivityLogs({ limit: 200 });
    const container = document.getElementById('activity-log-container');
    const userFilter = document.getElementById('activity-user-filter');

    // Calculate stats
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(log => log.timestamp && log.timestamp.startsWith(today));

    const loginsToday = todayLogs.filter(l => l.type === 'login').length;
    const clockInsToday = todayLogs.filter(l => l.type === 'clock_in').length;
    const changesToday = todayLogs.filter(l => ['create', 'update', 'delete'].includes(l.type)).length;
    const activeUsers = new Set(todayLogs.map(l => l.userId)).size;

    // Update stats
    document.getElementById('stat-logins').textContent = loginsToday;
    document.getElementById('stat-clockins').textContent = clockInsToday;
    document.getElementById('stat-changes').textContent = changesToday;
    document.getElementById('stat-active-users').textContent = activeUsers;

    // Populate user filter
    const users = [...new Set(logs.map(l => l.userName).filter(Boolean))];
    userFilter.innerHTML = '<option value="">All Users</option>' +
        users.map(u => `<option value="${u}">${u}</option>`).join('');

    // Store logs globally for filtering
    window.activityLogs = logs;

    // Render table
    renderActivityTable(logs);
}

// Render activity table
function renderActivityTable(logs) {
    const container = document.getElementById('activity-log-container');

    if (!logs || logs.length === 0) {
        container.innerHTML = `
            <div style="padding: 60px; text-align: center;">
                <i class="fas fa-clipboard-list" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                <h3 style="color: var(--text-primary); margin-bottom: 8px;">No Activity Yet</h3>
                <p style="color: var(--text-muted);">Activities will appear here as users interact with the system.</p>
            </div>
        `;
        return;
    }

    const getActivityIcon = (type) => {
        const icons = {
            'login': '<i class="fas fa-sign-in-alt" style="color: #10b981;"></i>',
            'logout': '<i class="fas fa-sign-out-alt" style="color: #6b7280;"></i>',
            'clock_in': '<i class="fas fa-clock" style="color: #3b82f6;"></i>',
            'clock_out': '<i class="fas fa-clock" style="color: #f59e0b;"></i>',
            'create': '<i class="fas fa-plus-circle" style="color: #10b981;"></i>',
            'update': '<i class="fas fa-edit" style="color: #3b82f6;"></i>',
            'delete': '<i class="fas fa-trash" style="color: #ef4444;"></i>',
            'view': '<i class="fas fa-eye" style="color: #8b5cf6;"></i>',
            'export': '<i class="fas fa-download" style="color: #06b6d4;"></i>',
            'schedule': '<i class="fas fa-calendar-alt" style="color: #ec4899;"></i>',
            'announcement': '<i class="fas fa-bullhorn" style="color: #f97316;"></i>',
            'invoice': '<i class="fas fa-file-invoice-dollar" style="color: #84cc16;"></i>',
            'inventory': '<i class="fas fa-boxes" style="color: #a855f7;"></i>',
            'restock': '<i class="fas fa-truck-loading" style="color: #14b8a6;"></i>',
            'transfer': '<i class="fas fa-exchange-alt" style="color: #6366f1;"></i>'
        };
        return icons[type] || '<i class="fas fa-circle" style="color: var(--text-muted);"></i>';
    };

    const getActivityLabel = (type) => {
        const labels = {
            'login': 'Logged In',
            'logout': 'Logged Out',
            'clock_in': 'Clocked In',
            'clock_out': 'Clocked Out',
            'create': 'Created',
            'update': 'Updated',
            'delete': 'Deleted',
            'view': 'Viewed',
            'export': 'Exported',
            'schedule': 'Schedule',
            'announcement': 'Announcement',
            'invoice': 'Invoice',
            'inventory': 'Inventory',
            'restock': 'Restock',
            'transfer': 'Transfer'
        };
        return labels[type] || type;
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        if (isToday) {
            return 'Today ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
               date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    container.innerHTML = `
        <table class="activity-log-table" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: var(--bg-secondary);">
                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; font-size: 13px; color: var(--text-muted);">Time</th>
                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; font-size: 13px; color: var(--text-muted);">User</th>
                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; font-size: 13px; color: var(--text-muted);">Action</th>
                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; font-size: 13px; color: var(--text-muted);">Details</th>
                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; font-size: 13px; color: var(--text-muted);">Store</th>
                </tr>
            </thead>
            <tbody>
                ${logs.map(log => `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 12px 16px; font-size: 13px; color: var(--text-muted); white-space: nowrap;">
                            ${formatTimestamp(log.timestamp)}
                        </td>
                        <td style="padding: 12px 16px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div class="user-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 600; flex-shrink: 0;">
                                    ${log.userName ? log.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'}
                                </div>
                                <div>
                                    <div style="font-weight: 500; font-size: 13px; color: var(--text-primary);">${log.userName || 'Unknown'}</div>
                                    <div style="font-size: 11px; color: var(--text-muted);">${log.userRole || '-'}</div>
                                </div>
                            </div>
                        </td>
                        <td style="padding: 12px 16px;">
                            <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px;">
                                ${getActivityIcon(log.type)}
                                ${getActivityLabel(log.type)}
                            </span>
                        </td>
                        <td style="padding: 12px 16px; font-size: 13px; color: var(--text-secondary); max-width: 300px;">
                            ${log.entityType ? `<span style="background: var(--bg-secondary); padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 6px;">${log.entityType}</span>` : ''}
                            ${log.details && typeof log.details === 'object' ?
                                (log.details.description || log.details.name || log.details.message || JSON.stringify(log.details).substring(0, 50)) :
                                (log.details || '-')}
                        </td>
                        <td style="padding: 12px 16px; font-size: 13px; color: var(--text-muted);">
                            ${log.store || '-'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Filter activity logs
window.filterActivityLogs = function() {
    const search = document.getElementById('activity-search').value.toLowerCase();
    const type = document.getElementById('activity-type-filter').value;
    const user = document.getElementById('activity-user-filter').value;
    const date = document.getElementById('activity-date-filter').value;

    let filtered = window.activityLogs || [];

    if (search) {
        filtered = filtered.filter(log =>
            (log.userName && log.userName.toLowerCase().includes(search)) ||
            (log.type && log.type.toLowerCase().includes(search)) ||
            (log.entityType && log.entityType.toLowerCase().includes(search)) ||
            (log.details && JSON.stringify(log.details).toLowerCase().includes(search))
        );
    }

    if (type) {
        filtered = filtered.filter(log => log.type === type);
    }

    if (user) {
        filtered = filtered.filter(log => log.userName === user);
    }

    if (date) {
        filtered = filtered.filter(log => log.timestamp && log.timestamp.startsWith(date));
    }

    renderActivityTable(filtered);
};

// Export activity log
window.exportActivityLog = async function() {
    const logs = window.activityLogs || [];
    if (logs.length === 0) {
        showNotification('No activities to export', 'warning');
        return;
    }

    const csv = [
        ['Timestamp', 'User', 'Role', 'Action', 'Entity Type', 'Details', 'Store'].join(','),
        ...logs.map(log => [
            log.timestamp,
            log.userName,
            log.userRole,
            log.type,
            log.entityType || '',
            JSON.stringify(log.details || '').replace(/,/g, ';'),
            log.store || ''
        ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    // Log the export activity
    if (typeof logActivity === 'function') {
        await logActivity(ACTIVITY_TYPES.EXPORT, {
            message: 'Exported activity log',
            recordCount: logs.length,
            format: 'CSV'
        }, 'activityLog', null);
    }

    showNotification('Activity log exported!', 'success');
};

// Make logActivity and ACTIVITY_TYPES globally available
window.logActivity = logActivity;
window.ACTIVITY_TYPES = ACTIVITY_TYPES;

// ==========================================
// END ACTIVITY LOG MODULE
// ==========================================

// Multi-selection state
let glabsSelectionStart = null;
let glabsSelectionEnd = null;
let glabsIsSelecting = false;
let glabsSelectedCells = [];

async function renderGLabs() {
    const dashboard = document.querySelector('.dashboard');

    // Register keyboard handler (only once)
    if (!window.glabsKeyboardRegistered) {
        document.addEventListener('keydown', glabsKeyboardHandler);
        window.glabsKeyboardRegistered = true;
    }

    // Load data and wait for it
    await glabsLoadData();

    const sheet = glabsSheets[glabsCurrentSheet];
    const glabsData = sheet.data;
    const actualRows = glabsData.length || glabsRows;
    const actualCols = glabsData[0]?.length || glabsCols;

    // Column letters
    const colLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Sheet tabs HTML
    const sheetTabs = Object.keys(glabsSheets).map(name => `
        <button class="glabs-sheet-tab ${name === glabsCurrentSheet ? 'active' : ''}"
                onclick="glabsSwitchSheet('${name}')"
                ondblclick="glabsRenameSheet('${name}')">
            ${name}
            ${Object.keys(glabsSheets).length > 1 ? `<span class="glabs-tab-close" onclick="event.stopPropagation(); glabsDeleteSheet('${name}')">&times;</span>` : ''}
        </button>
    `).join('');

    dashboard.innerHTML = `
        <!-- Header with gradient -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 24px 32px; margin-bottom: 20px; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="margin: 0; font-size: 28px; font-weight: 700; display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-table"></i> Blank Excel
                    </h2>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Professional spreadsheet for data crunching</p>
                </div>

                <!-- Month Navigation -->
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button onclick="glabsPrevMonth()" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; width: 40px; height: 40px; border-radius: 8px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div style="text-align: center; min-width: 150px;">
                        <span style="font-size: 18px; font-weight: 600;">${glabsGetMonthName()}</span>
                    </div>
                    <button onclick="glabsNextMonth()" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; width: 40px; height: 40px; border-radius: 8px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <button onclick="glabsGoToCurrentMonth()" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-calendar-day"></i> Today
                    </button>
                </div>

                <div style="display: flex; gap: 10px;">
                    <button onclick="glabsExportCSV()" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-download"></i> Export CSV
                    </button>
                    <button onclick="glabsClearAll()" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-trash"></i> Clear
                    </button>
                </div>
            </div>
        </div>

        <!-- Toolbar -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; padding: 12px 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
            <!-- Cell Reference -->
            <span id="glabs-cell-ref" style="font-family: monospace; font-weight: 700; color: var(--accent-primary); min-width: 45px; font-size: 15px; background: var(--bg-tertiary); padding: 6px 12px; border-radius: 6px;">A1</span>

            <!-- Formula Bar -->
            <input type="text" id="glabs-formula-bar" placeholder="Enter value, text, or formula (=SUM, =AVG, =A1+B1...)"
                style="flex: 1; min-width: 200px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px; padding: 8px 12px; color: var(--text-primary); font-family: 'Outfit', sans-serif; font-size: 14px;"
                onkeydown="if(event.key === 'Enter') glabsApplyFormula()">

            <div style="display: flex; gap: 8px; align-items: center;">
                <!-- Color Picker -->
                <div style="position: relative;">
                    <button id="glabs-color-btn" onclick="glabsToggleColorPicker()" title="Cell Color" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; color: var(--text-primary);">
                        <i class="fas fa-fill-drip"></i>
                        <span id="glabs-color-preview" style="width: 16px; height: 16px; border-radius: 3px; background: #ffffff; border: 1px solid var(--border-color);"></span>
                    </button>
                    <div id="glabs-color-picker" style="display: none; position: absolute; top: 100%; left: 0; margin-top: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px;">
                            ${['#ffffff', '#f3f4f6', '#fef3c7', '#fce7f3', '#dbeafe', '#d1fae5',
                               '#fbbf24', '#f97316', '#ef4444', '#ec4899', '#8b5cf6', '#3b82f6',
                               '#10b981', '#14b8a6', '#06b6d4', '#6366f1', '#a855f7', '#d946ef',
                               '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db'].map(color => `
                                <button onclick="glabsSetCellColor('${color}')"
                                    style="width: 28px; height: 28px; border-radius: 4px; background: ${color}; border: 1px solid var(--border-color); cursor: pointer;"
                                    title="${color}"></button>
                            `).join('')}
                        </div>
                        <button onclick="glabsSetCellColor('')" style="margin-top: 8px; width: 100%; padding: 6px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 4px; cursor: pointer; color: var(--text-primary); font-size: 12px;">
                            <i class="fas fa-times"></i> No Color
                        </button>
                    </div>
                </div>

                <!-- Text Color -->
                <div style="position: relative;">
                    <button onclick="glabsToggleTextColorPicker()" title="Text Color" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; color: var(--text-primary);">
                        <i class="fas fa-font"></i>
                        <span id="glabs-text-color-preview" style="width: 16px; height: 16px; border-radius: 3px; background: #000000; border: 1px solid var(--border-color);"></span>
                    </button>
                    <div id="glabs-text-color-picker" style="display: none; position: absolute; top: 100%; left: 0; margin-top: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px;">
                            ${['#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#ffffff',
                               '#dc2626', '#ea580c', '#d97706', '#65a30d', '#059669', '#0891b2',
                               '#2563eb', '#7c3aed', '#c026d3', '#db2777', '#e11d48', '#f43f5e'].map(color => `
                                <button onclick="glabsSetTextColor('${color}')"
                                    style="width: 28px; height: 28px; border-radius: 4px; background: ${color}; border: 1px solid var(--border-color); cursor: pointer;"
                                    title="${color}"></button>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Column Width -->
                <select id="glabs-col-width" onchange="glabsSetColumnWidth(this.value)" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 6px; color: var(--text-primary); font-size: 13px; cursor: pointer;">
                    <option value="">Col Width</option>
                    <option value="60">Narrow</option>
                    <option value="100">Normal</option>
                    <option value="150">Wide</option>
                    <option value="200">Extra Wide</option>
                </select>

                <!-- Row/Column Actions -->
                <button onclick="glabsAddRow()" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 6px; cursor: pointer; color: var(--text-primary); font-size: 13px;">
                    <i class="fas fa-plus"></i> Row
                </button>
                <button onclick="glabsAddColumn()" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 6px; cursor: pointer; color: var(--text-primary); font-size: 13px;">
                    <i class="fas fa-plus"></i> Col
                </button>
            </div>
        </div>

        <!-- Selection Stats Bar -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; margin-bottom: 12px; overflow: hidden;">
            <div style="display: flex; align-items: stretch; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 100px; padding: 12px 16px; border-right: 1px solid var(--border-color); text-align: center;">
                    <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Sum</div>
                    <div id="glabs-sum" style="font-size: 18px; font-weight: 700; color: var(--accent-primary);">-</div>
                </div>
                <div style="flex: 1; min-width: 100px; padding: 12px 16px; border-right: 1px solid var(--border-color); text-align: center;">
                    <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Average</div>
                    <div id="glabs-avg" style="font-size: 18px; font-weight: 700; color: #10b981;">-</div>
                </div>
                <div style="flex: 1; min-width: 100px; padding: 12px 16px; border-right: 1px solid var(--border-color); text-align: center;">
                    <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Min</div>
                    <div id="glabs-min" style="font-size: 18px; font-weight: 700; color: #f59e0b;">-</div>
                </div>
                <div style="flex: 1; min-width: 100px; padding: 12px 16px; border-right: 1px solid var(--border-color); text-align: center;">
                    <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Max</div>
                    <div id="glabs-max" style="font-size: 18px; font-weight: 700; color: #ef4444;">-</div>
                </div>
                <div style="flex: 1; min-width: 100px; padding: 12px 16px; border-right: 1px solid var(--border-color); text-align: center;">
                    <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Count</div>
                    <div id="glabs-count" style="font-size: 18px; font-weight: 700; color: #8b5cf6;">-</div>
                </div>
                <div style="flex: 1.5; min-width: 150px; padding: 12px 16px; text-align: center; background: var(--bg-tertiary);">
                    <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Selection</div>
                    <div id="glabs-selection-range" style="font-size: 14px; font-weight: 600; color: var(--text-primary);">-</div>
                </div>
            </div>
            <div id="glabs-formula-suggestion" style="display: none; padding: 8px 16px; background: var(--bg-tertiary); border-top: 1px solid var(--border-color); font-size: 12px; color: var(--text-muted);">
                <span style="margin-right: 8px;"><i class="fas fa-lightbulb" style="color: #f59e0b;"></i> Tip:</span>
                <span id="glabs-formula-text">Select cells to see formula suggestions</span>
                <button id="glabs-insert-formula-btn" onclick="glabsInsertSuggestedFormula()" style="margin-left: 12px; padding: 4px 12px; background: var(--accent-primary); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; display: none;">
                    <i class="fas fa-plus"></i> Insert
                </button>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 16px; background: linear-gradient(90deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%); border-top: 1px solid var(--border-color);">
                <span id="glabs-saved" style="font-size: 11px; color: #10b981;"><i class="fas fa-check-circle"></i> Auto-saved</span>
                <span style="font-size: 11px; color: var(--text-muted);">
                    <i class="fas fa-keyboard"></i> Ctrl+Z Undo | Ctrl+F Find | Arrow keys Navigate
                </span>
            </div>
        </div>

        <!-- Find Dialog -->
        <div id="glabs-find-dialog" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; z-index: 1001; box-shadow: 0 8px 32px rgba(0,0,0,0.2); min-width: 350px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; color: var(--text-primary); font-size: 16px;"><i class="fas fa-search"></i> Find & Replace</h3>
                <button onclick="glabsCloseFindDialog()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 18px;">&times;</button>
            </div>
            <div style="margin-bottom: 12px;">
                <label style="display: block; color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">Find:</label>
                <input type="text" id="glabs-find-input" placeholder="Search text..." style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-tertiary); color: var(--text-primary); font-size: 14px; box-sizing: border-box;" onkeydown="if(event.key === 'Enter') glabsFindNext()">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; color: var(--text-muted); font-size: 12px; margin-bottom: 4px;">Replace with:</label>
                <input type="text" id="glabs-replace-input" placeholder="Replace text..." style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-tertiary); color: var(--text-primary); font-size: 14px; box-sizing: border-box;">
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button onclick="glabsFindNext()" style="flex: 1; padding: 10px 16px; background: var(--accent-primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">Find Next</button>
                <button onclick="glabsReplace()" style="flex: 1; padding: 10px 16px; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; font-size: 13px;">Replace</button>
                <button onclick="glabsReplaceAll()" style="flex: 1; padding: 10px 16px; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; font-size: 13px;">Replace All</button>
            </div>
            <div id="glabs-find-status" style="margin-top: 12px; color: var(--text-muted); font-size: 12px; text-align: center;"></div>
        </div>

        <!-- Context Menu -->
        <div id="glabs-context-menu" style="display: none; position: fixed; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 0; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 180px; max-height: 60vh; overflow-y: auto;">
            <div class="glabs-ctx-item" onclick="glabsFormatCurrency()"><i class="fas fa-dollar-sign" style="width: 20px;"></i> Currency ($)</div>
            <div class="glabs-ctx-item" onclick="glabsFormatPercent()"><i class="fas fa-percent" style="width: 20px;"></i> Percentage (%)</div>
            <div class="glabs-ctx-item" onclick="glabsFormatNumber()"><i class="fas fa-hashtag" style="width: 20px;"></i> Number (1,000)</div>
            <div class="glabs-ctx-item" onclick="glabsFormatDecimal()"><i class="fas fa-calculator" style="width: 20px;"></i> Decimal (0.00)</div>
            <div style="border-top: 1px solid var(--border-color); margin: 6px 0;"></div>
            <div class="glabs-ctx-item" onclick="glabsFormatBold()"><i class="fas fa-bold" style="width: 20px;"></i> Bold</div>
            <div class="glabs-ctx-item" onclick="glabsFormatItalic()"><i class="fas fa-italic" style="width: 20px;"></i> Italic</div>
            <div style="border-top: 1px solid var(--border-color); margin: 6px 0;"></div>
            <div class="glabs-ctx-item" onclick="glabsAlignLeft()"><i class="fas fa-align-left" style="width: 20px;"></i> Align Left</div>
            <div class="glabs-ctx-item" onclick="glabsAlignCenter()"><i class="fas fa-align-center" style="width: 20px;"></i> Align Center</div>
            <div class="glabs-ctx-item" onclick="glabsAlignRight()"><i class="fas fa-align-right" style="width: 20px;"></i> Align Right</div>
            <div style="border-top: 1px solid var(--border-color); margin: 6px 0;"></div>
            <div class="glabs-ctx-item" onclick="glabsSortAZ()"><i class="fas fa-sort-alpha-down" style="width: 20px;"></i> Sort A → Z</div>
            <div class="glabs-ctx-item" onclick="glabsSortZA()"><i class="fas fa-sort-alpha-up" style="width: 20px;"></i> Sort Z → A</div>
            <div class="glabs-ctx-item" onclick="glabsSortNumAsc()"><i class="fas fa-sort-numeric-down" style="width: 20px;"></i> Sort Small → Large</div>
            <div class="glabs-ctx-item" onclick="glabsSortNumDesc()"><i class="fas fa-sort-numeric-up" style="width: 20px;"></i> Sort Large → Small</div>
            <div style="border-top: 1px solid var(--border-color); margin: 6px 0;"></div>
            <div class="glabs-ctx-item" onclick="glabsInsertRowAbove()"><i class="fas fa-arrow-up" style="width: 20px;"></i> Insert Row Above</div>
            <div class="glabs-ctx-item" onclick="glabsInsertRowBelow()"><i class="fas fa-arrow-down" style="width: 20px;"></i> Insert Row Below</div>
            <div class="glabs-ctx-item" onclick="glabsInsertColLeft()"><i class="fas fa-arrow-left" style="width: 20px;"></i> Insert Column Left</div>
            <div class="glabs-ctx-item" onclick="glabsInsertColRight()"><i class="fas fa-arrow-right" style="width: 20px;"></i> Insert Column Right</div>
            <div style="border-top: 1px solid var(--border-color); margin: 6px 0;"></div>
            <div class="glabs-ctx-item" onclick="glabsDeleteRow()"><i class="fas fa-minus" style="width: 20px;"></i> Delete Row</div>
            <div class="glabs-ctx-item" onclick="glabsDeleteCol()"><i class="fas fa-minus" style="width: 20px;"></i> Delete Column</div>
            <div class="glabs-ctx-item" onclick="glabsMergeCells()"><i class="fas fa-compress-alt" style="width: 20px;"></i> Merge Cells</div>
            <div class="glabs-ctx-item" onclick="glabsUnmergeCells()"><i class="fas fa-expand-alt" style="width: 20px;"></i> Unmerge Cells</div>
            <div style="border-top: 1px solid var(--border-color); margin: 6px 0;"></div>
            <div class="glabs-ctx-item" onclick="glabsClearFormat()"><i class="fas fa-eraser" style="width: 20px;"></i> Clear Format</div>
            <div class="glabs-ctx-item" onclick="glabsDeleteCellContent()"><i class="fas fa-trash" style="width: 20px;"></i> Delete Content</div>
        </div>

        <!-- Spreadsheet Grid -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden;">
            <div id="glabs-grid-container" style="overflow: auto; max-height: 55vh;" onmouseup="glabsEndSelection()">
                <table id="glabs-table" style="width: 100%; border-collapse: collapse; font-family: 'Outfit', sans-serif; user-select: none;">
                    <thead style="position: sticky; top: 0; z-index: 10;">
                        <tr style="background: var(--bg-tertiary);">
                            <th onclick="glabsSelectAll()" style="width: 50px; padding: 10px; border: 1px solid var(--border-color); color: var(--text-muted); font-weight: 600; font-size: 12px; position: sticky; left: 0; background: var(--bg-tertiary); z-index: 11; cursor: pointer;" title="Select All"></th>
                            ${Array.from({length: actualCols}, (_, i) => {
                                const width = sheet.colWidths?.[i] || 100;
                                return `
                                <th onclick="glabsSelectColumn(${i})" style="min-width: ${width}px; width: ${width}px; padding: 10px; border: 1px solid var(--border-color); color: var(--text-muted); font-weight: 600; font-size: 12px; text-align: center; position: relative; cursor: pointer;" data-col="${i}" title="Click to select column ${colLetters[i]}">
                                    ${colLetters[i] || 'Z' + (i - 25)}
                                    <div class="glabs-resize-handle" onmousedown="event.stopPropagation(); glabsStartResize(event, ${i})" style="position: absolute; right: 0; top: 0; bottom: 0; width: 5px; cursor: col-resize; background: transparent;"></div>
                                </th>
                            `}).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${Array.from({length: actualRows}, (_, rowIdx) => `
                            <tr>
                                <td onclick="glabsSelectRow(${rowIdx})" style="padding: 8px 10px; border: 1px solid var(--border-color); background: var(--bg-tertiary); color: var(--text-muted); font-weight: 600; font-size: 12px; text-align: center; position: sticky; left: 0; z-index: 5; cursor: pointer;" title="Click to select row ${rowIdx + 1}">
                                    ${rowIdx + 1}
                                </td>
                                ${Array.from({length: actualCols}, (_, colIdx) => {
                                    // Check if this cell is part of a merge (but not the main cell)
                                    if (glabsIsMergedSlave(rowIdx, colIdx, sheet)) {
                                        return ''; // Don't render slave cells
                                    }

                                    const cellId = `${colLetters[colIdx]}${rowIdx + 1}`;
                                    const value = glabsData[rowIdx]?.[colIdx] || '';
                                    const cellStyle = sheet.cellStyles?.[`${rowIdx}-${colIdx}`] || {};
                                    const displayValue = glabsFormatValue(glabsEvaluateCell(value, rowIdx, colIdx), cellStyle.format);
                                    const bgColor = cellStyle.bg || '';
                                    const textColor = cellStyle.color || '';
                                    const bold = cellStyle.bold ? 'font-weight: 700;' : '';
                                    const italic = cellStyle.italic ? 'font-style: italic;' : '';
                                    const align = cellStyle.align || 'left';
                                    const width = sheet.colWidths?.[colIdx] || 100;

                                    // Check if this cell is the start of a merge
                                    const merge = glabsGetMerge(rowIdx, colIdx, sheet);
                                    const colspan = merge ? (merge.endCol - merge.startCol + 1) : 1;
                                    const rowspan = merge ? (merge.endRow - merge.startRow + 1) : 1;
                                    const mergeAttr = merge ? `colspan="${colspan}" rowspan="${rowspan}"` : '';

                                    return `
                                        <td class="glabs-cell ${merge ? 'glabs-merged' : ''}" data-row="${rowIdx}" data-col="${colIdx}" data-cell="${cellId}" ${mergeAttr}
                                            onmousedown="glabsStartSelection(event, ${rowIdx}, ${colIdx})"
                                            onmouseover="glabsUpdateSelection(event, ${rowIdx}, ${colIdx})"
                                            ondblclick="glabsEditCellDirectly(${rowIdx}, ${colIdx}, this)"
                                            oncontextmenu="glabsShowContextMenu(event, ${rowIdx}, ${colIdx})"
                                            style="padding: 0; border: 1px solid var(--border-color); cursor: cell; position: relative; min-width: ${width}px; ${bgColor ? 'background: ' + bgColor + ';' : ''}">
                                            <div class="glabs-cell-content" style="padding: 8px 10px; min-height: 24px; font-size: 13px; text-align: ${align}; ${textColor ? 'color: ' + textColor + ';' : 'color: var(--text-primary);'} ${bold} ${italic} white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                                ${displayValue}
                                            </div>
                                            <div class="glabs-autofill-handle" onmousedown="event.stopPropagation(); glabsStartAutofill(event, ${rowIdx}, ${colIdx})" style="display: none; position: absolute; right: -3px; bottom: -3px; width: 8px; height: 8px; background: var(--accent-primary); border: 1px solid white; cursor: crosshair; z-index: 5;"></div>
                                        </td>
                                    `;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Sheet Tabs -->
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg-tertiary); border-top: 1px solid var(--border-color);">
                ${sheetTabs}
                <button onclick="glabsAddSheet()" style="background: transparent; border: 1px dashed var(--border-color); padding: 6px 12px; border-radius: 6px; cursor: pointer; color: var(--text-muted); font-size: 12px;">
                    <i class="fas fa-plus"></i> New Sheet
                </button>
            </div>
        </div>


        <style>
            .glabs-cell:hover {
                background: var(--bg-hover) !important;
            }
            .glabs-cell.selected {
                outline: 2px solid var(--accent-primary) !important;
                outline-offset: -2px;
                background: rgba(96, 165, 250, 0.15) !important;
            }
            .glabs-cell.in-selection {
                background: rgba(96, 165, 250, 0.25) !important;
            }
            .glabs-cell input {
                width: 100%;
                height: 100%;
                border: none;
                background: white;
                padding: 8px 10px;
                font-family: 'Outfit', sans-serif;
                font-size: 13px;
                outline: none;
                color: #000;
            }
            .glabs-sheet-tab {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                padding: 6px 14px;
                border-radius: 6px 6px 0 0;
                cursor: pointer;
                color: var(--text-muted);
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }
            .glabs-sheet-tab:hover {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }
            .glabs-sheet-tab.active {
                background: var(--bg-secondary);
                color: var(--accent-primary);
                border-bottom-color: var(--bg-secondary);
                font-weight: 600;
            }
            .glabs-tab-close {
                font-size: 14px;
                opacity: 0.5;
                margin-left: 4px;
            }
            .glabs-tab-close:hover {
                opacity: 1;
                color: #ef4444;
            }
            .glabs-resize-handle:hover {
                background: var(--accent-primary) !important;
            }
            .glabs-ctx-item {
                padding: 8px 16px;
                cursor: pointer;
                color: var(--text-primary);
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .glabs-ctx-item:hover {
                background: var(--bg-hover);
            }
            .glabs-sheet-tab.drag-over {
                background: var(--accent-primary) !important;
                color: white !important;
            }
            .glabs-sheet-tab[draggable="true"] {
                cursor: grab;
            }
            .glabs-sheet-tab[draggable="true"]:active {
                cursor: grabbing;
            }
        </style>
    `;

    // Close context menu on click outside
    document.addEventListener('click', glabsHideContextMenu);

    // Initialize sheet drag and drop
    setTimeout(() => glabsInitSheetDrag(), 100);
}

// Format value based on format type
function glabsFormatValue(value, format) {
    if (!format) return value;
    if (value === '' || value === null || value === undefined) return '';

    // Remove existing format symbols to get raw number
    const cleanValue = String(value).replace(/[$,%]/g, '').replace(/,/g, '').trim();
    const num = parseFloat(cleanValue);

    if (isNaN(num)) return value; // Return original if not a number

    switch (format) {
        case 'currency':
            return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        case 'percent':
            // Don't multiply by 100 - user enters the number they want to see
            return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + '%';
        case 'number':
            return num.toLocaleString('en-US');
        case 'decimal':
            return num.toFixed(2);
        default:
            return value;
    }
}

// Track drag state
let glabsIsDragging = false;

// Start multi-cell selection
function glabsStartSelection(event, row, col) {
    if (event.button === 2) return; // Ignore right click

    // Check if clicking on an input (already editing)
    if (event.target.tagName === 'INPUT') return;

    // If clicking on already selected cell, enter edit mode directly
    if (glabsSelectedCell && glabsSelectedCell.row === row && glabsSelectedCell.col === col) {
        const td = document.querySelector(`.glabs-cell[data-row="${row}"][data-col="${col}"]`);
        if (td) {
            glabsEditCellDirectly(row, col, td);
        }
        return;
    }

    glabsIsSelecting = true;
    glabsIsDragging = false;
    glabsSelectionStart = { row, col };
    glabsSelectionEnd = { row, col };
    glabsSelectedCells = [{ row, col }];

    // Clear previous selection
    document.querySelectorAll('.glabs-cell.selected, .glabs-cell.in-selection').forEach(el => {
        el.classList.remove('selected', 'in-selection');
    });

    const td = document.querySelector(`.glabs-cell[data-row="${row}"][data-col="${col}"]`);
    if (td) {
        td.classList.add('selected');
        glabsSelectedCell = { row, col, element: td };
    }

    // Update formula bar
    const colLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const cellRef = `${colLetters[col]}${row + 1}`;
    document.getElementById('glabs-cell-ref').textContent = cellRef;

    const sheet = glabsSheets[glabsCurrentSheet];
    document.getElementById('glabs-formula-bar').value = sheet.data[row]?.[col] || '';
}

// Update selection while dragging
function glabsUpdateSelection(event, row, col) {
    if (!glabsIsSelecting) return;

    // Mark as dragging if moved to different cell
    if (glabsSelectionStart && (glabsSelectionStart.row !== row || glabsSelectionStart.col !== col)) {
        glabsIsDragging = true;
    }

    glabsSelectionEnd = { row, col };

    // Clear previous in-selection
    document.querySelectorAll('.glabs-cell.in-selection').forEach(el => {
        el.classList.remove('in-selection');
    });

    // Calculate selection range
    const minRow = Math.min(glabsSelectionStart.row, glabsSelectionEnd.row);
    const maxRow = Math.max(glabsSelectionStart.row, glabsSelectionEnd.row);
    const minCol = Math.min(glabsSelectionStart.col, glabsSelectionEnd.col);
    const maxCol = Math.max(glabsSelectionStart.col, glabsSelectionEnd.col);

    glabsSelectedCells = [];
    for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
            glabsSelectedCells.push({ row: r, col: c });
            const cell = document.querySelector(`.glabs-cell[data-row="${r}"][data-col="${c}"]`);
            if (cell) cell.classList.add('in-selection');
        }
    }

    // Update stats for selected range
    glabsUpdateSelectionStats();

    // Update cell ref to show range
    const colLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (minRow !== maxRow || minCol !== maxCol) {
        document.getElementById('glabs-cell-ref').textContent =
            `${colLetters[minCol]}${minRow + 1}:${colLetters[maxCol]}${maxRow + 1}`;
    }
}

// End selection
function glabsEndSelection() {
    glabsIsSelecting = false;
    glabsIsDragging = false;

    // Show autofill handle on selected cell
    glabsShowAutofillHandle();
}

// Show autofill handle on the last selected cell
function glabsShowAutofillHandle() {
    // Hide all autofill handles first
    document.querySelectorAll('.glabs-autofill-handle').forEach(h => h.style.display = 'none');

    // Show handle on the last selected cell
    if (glabsSelectedCell) {
        const cell = document.querySelector(`[data-row="${glabsSelectedCell.row}"][data-col="${glabsSelectedCell.col}"]`);
        if (cell) {
            const handle = cell.querySelector('.glabs-autofill-handle');
            if (handle) handle.style.display = 'block';
        }
    }
}

// Select a specific cell (helper function)
function glabsSelectCell(row, col, element) {
    const sheet = glabsSheets[glabsCurrentSheet];
    const colLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Clear previous selection
    document.querySelectorAll('.glabs-cell').forEach(cell => {
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        cell.style.outline = '';
        cell.style.background = sheet.cellStyles?.[`${r}-${c}`]?.bg || '';
    });

    // Set new selection
    glabsSelectedCell = { row, col, element };
    glabsSelectionStart = { row, col };
    glabsSelectionEnd = { row, col };
    glabsSelectedCells = [{ row, col }];

    // Highlight the cell
    element.style.outline = '2px solid var(--accent-primary)';

    // Update formula bar
    const cellRef = `${colLetters[col]}${row + 1}`;
    document.getElementById('glabs-cell-ref').textContent = cellRef;

    const value = sheet.data[row]?.[col] || '';
    document.getElementById('glabs-formula-bar').value = value;

    // Show autofill handle
    glabsShowAutofillHandle();
}

// Store suggested formula for insertion
let glabsSuggestedFormula = '';

// Update stats for selected cells
function glabsUpdateSelectionStats() {
    const sheet = glabsSheets[glabsCurrentSheet];
    let sum = 0, count = 0, numCount = 0;
    let min = Infinity, max = -Infinity;
    let numbers = [];

    glabsSelectedCells.forEach(({ row, col }) => {
        const value = sheet.data[row]?.[col] || '';
        const evaluated = glabsEvaluateCell(value, row, col);
        const num = parseFloat(String(evaluated).replace(/[$,%]/g, '').replace(/,/g, ''));
        if (!isNaN(num)) {
            sum += num;
            numCount++;
            numbers.push(num);
            if (num < min) min = num;
            if (num > max) max = num;
        }
        if (value) count++;
    });

    document.getElementById('glabs-sum').textContent = numCount > 0 ? sum.toLocaleString() : '-';
    document.getElementById('glabs-avg').textContent = numCount > 0 ? (sum / numCount).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-';
    document.getElementById('glabs-min').textContent = numCount > 0 ? min.toLocaleString() : '-';
    document.getElementById('glabs-max').textContent = numCount > 0 ? max.toLocaleString() : '-';
    document.getElementById('glabs-count').textContent = count > 0 ? count : '-';

    // Update selection range display
    const colLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const selectionEl = document.getElementById('glabs-selection-range');
    const formulaSuggestion = document.getElementById('glabs-formula-suggestion');
    const formulaText = document.getElementById('glabs-formula-text');
    const insertBtn = document.getElementById('glabs-insert-formula-btn');

    if (glabsSelectedCells.length === 0) {
        selectionEl.textContent = '-';
        formulaSuggestion.style.display = 'none';
    } else if (glabsSelectedCells.length === 1) {
        const cell = glabsSelectedCells[0];
        selectionEl.textContent = `${colLetters[cell.col] || 'Z'}${cell.row + 1}`;
        formulaSuggestion.style.display = 'none';
    } else {
        // Find range bounds
        const rows = glabsSelectedCells.map(c => c.row);
        const cols = glabsSelectedCells.map(c => c.col);
        const minRow = Math.min(...rows);
        const maxRow = Math.max(...rows);
        const minCol = Math.min(...cols);
        const maxCol = Math.max(...cols);

        const startCell = `${colLetters[minCol] || 'Z'}${minRow + 1}`;
        const endCell = `${colLetters[maxCol] || 'Z'}${maxRow + 1}`;
        selectionEl.textContent = `${startCell}:${endCell}`;

        // Show formula suggestion if numeric values
        if (numCount > 1) {
            glabsSuggestedFormula = `=SUM(${startCell}:${endCell})`;
            formulaText.innerHTML = `To sum these cells, use: <code style="background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; color: var(--accent-primary);">${glabsSuggestedFormula}</code>`;
            formulaSuggestion.style.display = 'block';
            insertBtn.style.display = 'inline-block';
        } else {
            formulaSuggestion.style.display = 'none';
        }
    }
}

// Insert suggested formula into cell below selection
function glabsInsertSuggestedFormula() {
    if (!glabsSuggestedFormula || glabsSelectedCells.length === 0) {
        console.log('No formula or selection');
        return;
    }

    const sheet = glabsSheets[glabsCurrentSheet];

    // Find the bottom of the selection to insert below
    const rows = glabsSelectedCells.map(c => c.row);
    const cols = glabsSelectedCells.map(c => c.col);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);

    // Target cell is one row below the selection, in the first column of selection
    const targetRow = maxRow + 1;
    const targetCol = minCol;

    // Ensure row exists
    while (sheet.data.length <= targetRow) {
        sheet.data.push(Array(glabsCols).fill(''));
    }

    // Save state for undo
    glabsSaveState();

    // Insert formula
    sheet.data[targetRow][targetCol] = glabsSuggestedFormula;

    // Update display
    glabsSaveData();
    renderGLabs();

    // Select the cell with formula
    setTimeout(() => {
        glabsSelectCell(targetRow, targetCol);
    }, 50);
}

// Show context menu
function glabsShowContextMenu(event, row, col) {
    event.preventDefault();

    // Select the cell if not already selected
    if (!glabsSelectedCells.some(c => c.row === row && c.col === col)) {
        glabsSelectedCells = [{ row, col }];
        glabsSelectedCell = { row, col };
        document.querySelectorAll('.glabs-cell.selected, .glabs-cell.in-selection').forEach(el => {
            el.classList.remove('selected', 'in-selection');
        });
        const td = document.querySelector(`.glabs-cell[data-row="${row}"][data-col="${col}"]`);
        if (td) td.classList.add('selected');
    }

    const menu = document.getElementById('glabs-context-menu');
    menu.style.display = 'block';

    // Position menu, ensuring it doesn't go off screen
    const menuHeight = menu.offsetHeight || 400;
    const menuWidth = menu.offsetWidth || 180;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    let left = event.clientX;
    let top = event.clientY;

    // Adjust if menu would go off right edge
    if (left + menuWidth > windowWidth) {
        left = windowWidth - menuWidth - 10;
    }

    // Adjust if menu would go off bottom edge
    if (top + menuHeight > windowHeight) {
        top = windowHeight - menuHeight - 10;
    }

    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
}

// Hide context menu
function glabsHideContextMenu() {
    const menu = document.getElementById('glabs-context-menu');
    if (menu) menu.style.display = 'none';
}

// Format functions
function glabsApplyFormat(formatType, styleKey, styleValue) {
    glabsSaveUndoState();

    const sheet = glabsSheets[glabsCurrentSheet];
    if (!sheet.cellStyles) sheet.cellStyles = {};

    glabsSelectedCells.forEach(({ row, col }) => {
        const key = `${row}-${col}`;
        if (!sheet.cellStyles[key]) sheet.cellStyles[key] = {};
        if (formatType) sheet.cellStyles[key].format = formatType;
        if (styleKey) sheet.cellStyles[key][styleKey] = styleValue;
    });

    glabsSaveData();
    glabsHideContextMenu();
    renderGLabs();
}

function glabsFormatCurrency() { glabsApplyFormat('currency'); }
function glabsFormatPercent() { glabsApplyFormat('percent'); }
function glabsFormatNumber() { glabsApplyFormat('number'); }
function glabsFormatDecimal() { glabsApplyFormat('decimal'); }
function glabsFormatBold() { glabsApplyFormat(null, 'bold', true); }
function glabsFormatItalic() { glabsApplyFormat(null, 'italic', true); }
function glabsAlignLeft() { glabsApplyFormat(null, 'align', 'left'); }
function glabsAlignCenter() { glabsApplyFormat(null, 'align', 'center'); }
function glabsAlignRight() { glabsApplyFormat(null, 'align', 'right'); }

// Select entire row
function glabsSelectRow(rowIdx) {
    const sheet = glabsSheets[glabsCurrentSheet];
    const cols = sheet.data[0]?.length || glabsCols;

    glabsSelectionStart = { row: rowIdx, col: 0 };
    glabsSelectionEnd = { row: rowIdx, col: cols - 1 };
    glabsSelectedCells = [];

    for (let c = 0; c < cols; c++) {
        glabsSelectedCells.push({ row: rowIdx, col: c });
    }

    // Highlight cells
    document.querySelectorAll('.glabs-cell').forEach(cell => {
        const r = parseInt(cell.dataset.row);
        if (r === rowIdx) {
            cell.style.outline = '2px solid var(--accent-primary)';
            cell.style.background = 'rgba(99, 102, 241, 0.1)';
        } else {
            cell.style.outline = '';
            cell.style.background = sheet.cellStyles?.[`${r}-${cell.dataset.col}`]?.bg || '';
        }
    });

    // Set first cell as selected for formula bar
    const firstCell = document.querySelector(`[data-row="${rowIdx}"][data-col="0"]`);
    if (firstCell) glabsSelectCell(rowIdx, 0, firstCell);

    document.getElementById('glabs-cell-ref').textContent = `${rowIdx + 1}:${rowIdx + 1}`;
}

// Select entire column
function glabsSelectColumn(colIdx) {
    const sheet = glabsSheets[glabsCurrentSheet];
    const rows = sheet.data.length || glabsRows;
    const colLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    glabsSelectionStart = { row: 0, col: colIdx };
    glabsSelectionEnd = { row: rows - 1, col: colIdx };
    glabsSelectedCells = [];

    for (let r = 0; r < rows; r++) {
        glabsSelectedCells.push({ row: r, col: colIdx });
    }

    // Highlight cells
    document.querySelectorAll('.glabs-cell').forEach(cell => {
        const c = parseInt(cell.dataset.col);
        const r = parseInt(cell.dataset.row);
        if (c === colIdx) {
            cell.style.outline = '2px solid var(--accent-primary)';
            cell.style.background = 'rgba(99, 102, 241, 0.1)';
        } else {
            cell.style.outline = '';
            cell.style.background = sheet.cellStyles?.[`${r}-${c}`]?.bg || '';
        }
    });

    // Set first cell as selected for formula bar
    const firstCell = document.querySelector(`[data-row="0"][data-col="${colIdx}"]`);
    if (firstCell) glabsSelectCell(0, colIdx, firstCell);

    document.getElementById('glabs-cell-ref').textContent = `${colLetters[colIdx]}:${colLetters[colIdx]}`;
}

// Select all cells
function glabsSelectAll() {
    const sheet = glabsSheets[glabsCurrentSheet];
    const rows = sheet.data.length || glabsRows;
    const cols = sheet.data[0]?.length || glabsCols;

    glabsSelectionStart = { row: 0, col: 0 };
    glabsSelectionEnd = { row: rows - 1, col: cols - 1 };
    glabsSelectedCells = [];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            glabsSelectedCells.push({ row: r, col: c });
        }
    }

    // Highlight all cells
    document.querySelectorAll('.glabs-cell').forEach(cell => {
        cell.style.outline = '2px solid var(--accent-primary)';
        cell.style.background = 'rgba(99, 102, 241, 0.1)';
    });

    document.getElementById('glabs-cell-ref').textContent = 'All';
}

// Autofill state
let glabsAutofillStart = null;
let glabsAutofillEnd = null;
let glabsIsAutofilling = false;

// Start autofill
function glabsStartAutofill(event, row, col) {
    event.preventDefault();
    glabsIsAutofilling = true;
    glabsAutofillStart = { row, col };
    glabsAutofillEnd = { row, col };

    document.addEventListener('mousemove', glabsAutofillMove);
    document.addEventListener('mouseup', glabsAutofillFinish);
}

function glabsAutofillMove(event) {
    if (!glabsIsAutofilling) return;

    const cell = document.elementFromPoint(event.clientX, event.clientY);
    if (cell && cell.classList.contains('glabs-cell')) {
        glabsAutofillEnd = {
            row: parseInt(cell.dataset.row),
            col: parseInt(cell.dataset.col)
        };

        // Highlight autofill range
        document.querySelectorAll('.glabs-cell').forEach(c => {
            const r = parseInt(c.dataset.row);
            const col = parseInt(c.dataset.col);
            const inRange = isInAutofillRange(r, col);
            if (inRange) {
                c.style.outline = '2px dashed var(--accent-primary)';
            } else {
                c.style.outline = '';
            }
        });
    }
}

function isInAutofillRange(row, col) {
    if (!glabsAutofillStart || !glabsAutofillEnd) return false;

    const startRow = glabsAutofillStart.row;
    const startCol = glabsAutofillStart.col;
    const endRow = glabsAutofillEnd.row;
    const endCol = glabsAutofillEnd.col;

    // Autofill either horizontally or vertically
    if (startCol === endCol) {
        // Vertical autofill
        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        return col === startCol && row >= minRow && row <= maxRow;
    } else if (startRow === endRow) {
        // Horizontal autofill
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);
        return row === startRow && col >= minCol && col <= maxCol;
    }
    return false;
}

function glabsAutofillFinish() {
    if (!glabsIsAutofilling) return;

    document.removeEventListener('mousemove', glabsAutofillMove);
    document.removeEventListener('mouseup', glabsAutofillFinish);

    glabsIsAutofilling = false;

    if (!glabsAutofillStart || !glabsAutofillEnd) return;
    if (glabsAutofillStart.row === glabsAutofillEnd.row && glabsAutofillStart.col === glabsAutofillEnd.col) return;

    glabsSaveUndoState();

    const sheet = glabsSheets[glabsCurrentSheet];
    const sourceValue = sheet.data[glabsAutofillStart.row]?.[glabsAutofillStart.col] || '';
    const sourceStyle = sheet.cellStyles?.[`${glabsAutofillStart.row}-${glabsAutofillStart.col}`] || {};

    // Detect if value is a number for incrementing
    const numMatch = sourceValue.match(/^(\D*)(\d+)(\D*)$/);
    let baseText = '';
    let baseNum = null;
    let suffix = '';

    if (numMatch) {
        baseText = numMatch[1];
        baseNum = parseInt(numMatch[2]);
        suffix = numMatch[3];
    }

    const startRow = glabsAutofillStart.row;
    const startCol = glabsAutofillStart.col;
    const endRow = glabsAutofillEnd.row;
    const endCol = glabsAutofillEnd.col;

    if (!sheet.cellStyles) sheet.cellStyles = {};

    if (startCol === endCol) {
        // Vertical autofill
        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        const direction = endRow > startRow ? 1 : -1;

        for (let r = minRow; r <= maxRow; r++) {
            if (r === startRow) continue;
            if (!sheet.data[r]) sheet.data[r] = [];

            const offset = (r - startRow) * direction;
            if (baseNum !== null) {
                sheet.data[r][startCol] = baseText + (baseNum + offset) + suffix;
            } else {
                sheet.data[r][startCol] = sourceValue;
            }
            sheet.cellStyles[`${r}-${startCol}`] = { ...sourceStyle };
        }
    } else if (startRow === endRow) {
        // Horizontal autofill
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);
        const direction = endCol > startCol ? 1 : -1;

        for (let c = minCol; c <= maxCol; c++) {
            if (c === startCol) continue;
            if (!sheet.data[startRow]) sheet.data[startRow] = [];

            const offset = (c - startCol) * direction;
            if (baseNum !== null) {
                sheet.data[startRow][c] = baseText + (baseNum + offset) + suffix;
            } else {
                sheet.data[startRow][c] = sourceValue;
            }
            sheet.cellStyles[`${startRow}-${c}`] = { ...sourceStyle };
        }
    }

    glabsAutofillStart = null;
    glabsAutofillEnd = null;

    glabsSaveData();
    renderGLabs();
}

// ==================== SORT FUNCTIONS ====================

// Sort column A-Z (alphabetically)
function glabsSortAZ() {
    if (!glabsSelectedCell) return;
    glabsSortColumn(glabsSelectedCell.col, 'az');
}

// Sort column Z-A (alphabetically descending)
function glabsSortZA() {
    if (!glabsSelectedCell) return;
    glabsSortColumn(glabsSelectedCell.col, 'za');
}

// Sort column numerically ascending
function glabsSortNumAsc() {
    if (!glabsSelectedCell) return;
    glabsSortColumn(glabsSelectedCell.col, 'numasc');
}

// Sort column numerically descending
function glabsSortNumDesc() {
    if (!glabsSelectedCell) return;
    glabsSortColumn(glabsSelectedCell.col, 'numdesc');
}

// Generic sort function
function glabsSortColumn(colIdx, sortType) {
    glabsSaveUndoState();

    const sheet = glabsSheets[glabsCurrentSheet];
    const data = sheet.data;

    // Get all rows with their original indices
    const rows = data.map((row, idx) => ({ row, idx, styles: {} }));

    // Store styles for each row
    rows.forEach((item, rowIdx) => {
        const numCols = item.row?.length || 0;
        for (let c = 0; c < numCols; c++) {
            const styleKey = `${rowIdx}-${c}`;
            if (sheet.cellStyles?.[styleKey]) {
                item.styles[c] = { ...sheet.cellStyles[styleKey] };
            }
        }
    });

    // Sort based on the specified column
    rows.sort((a, b) => {
        const valA = a.row?.[colIdx] || '';
        const valB = b.row?.[colIdx] || '';

        // Clean values for comparison
        const cleanA = String(valA).replace(/[$,%]/g, '').replace(/,/g, '');
        const cleanB = String(valB).replace(/[$,%]/g, '').replace(/,/g, '');

        if (sortType === 'az') {
            return String(valA).localeCompare(String(valB));
        } else if (sortType === 'za') {
            return String(valB).localeCompare(String(valA));
        } else if (sortType === 'numasc') {
            const numA = parseFloat(cleanA) || 0;
            const numB = parseFloat(cleanB) || 0;
            return numA - numB;
        } else if (sortType === 'numdesc') {
            const numA = parseFloat(cleanA) || 0;
            const numB = parseFloat(cleanB) || 0;
            return numB - numA;
        }
        return 0;
    });

    // Rebuild data and styles
    sheet.data = rows.map(item => item.row);
    sheet.cellStyles = {};

    rows.forEach((item, newRowIdx) => {
        Object.keys(item.styles).forEach(colKey => {
            sheet.cellStyles[`${newRowIdx}-${colKey}`] = item.styles[colKey];
        });
    });

    glabsSaveData();
    glabsHideContextMenu();
    renderGLabs();
}

// ==================== INSERT/DELETE FUNCTIONS ====================

// Insert row above selected row
function glabsInsertRowAbove() {
    if (!glabsSelectedCell) return;
    glabsInsertRow(glabsSelectedCell.row);
}

// Insert row below selected row
function glabsInsertRowBelow() {
    if (!glabsSelectedCell) return;
    glabsInsertRow(glabsSelectedCell.row + 1);
}

// Insert row at index
function glabsInsertRow(atIndex) {
    glabsSaveUndoState();

    const sheet = glabsSheets[glabsCurrentSheet];
    const numCols = sheet.data[0]?.length || glabsCols;

    // Create new empty row
    const newRow = Array(numCols).fill('');

    // Insert the row
    sheet.data.splice(atIndex, 0, newRow);

    // Shift cell styles down
    const newStyles = {};
    Object.keys(sheet.cellStyles || {}).forEach(key => {
        const [r, c] = key.split('-').map(Number);
        if (r >= atIndex) {
            newStyles[`${r + 1}-${c}`] = sheet.cellStyles[key];
        } else {
            newStyles[key] = sheet.cellStyles[key];
        }
    });
    sheet.cellStyles = newStyles;

    // Shift merged cells
    if (sheet.mergedCells) {
        sheet.mergedCells = sheet.mergedCells.map(merge => {
            if (merge.startRow >= atIndex) {
                return { ...merge, startRow: merge.startRow + 1, endRow: merge.endRow + 1 };
            } else if (merge.endRow >= atIndex) {
                return { ...merge, endRow: merge.endRow + 1 };
            }
            return merge;
        });
    }

    glabsSaveData();
    glabsHideContextMenu();
    renderGLabs();
}

// Insert column left of selected column
function glabsInsertColLeft() {
    if (!glabsSelectedCell) return;
    glabsInsertCol(glabsSelectedCell.col);
}

// Insert column right of selected column
function glabsInsertColRight() {
    if (!glabsSelectedCell) return;
    glabsInsertCol(glabsSelectedCell.col + 1);
}

// Insert column at index
function glabsInsertCol(atIndex) {
    glabsSaveUndoState();

    const sheet = glabsSheets[glabsCurrentSheet];

    // Insert empty cell in each row
    sheet.data.forEach(row => {
        if (row) row.splice(atIndex, 0, '');
    });

    // Shift cell styles right
    const newStyles = {};
    Object.keys(sheet.cellStyles || {}).forEach(key => {
        const [r, c] = key.split('-').map(Number);
        if (c >= atIndex) {
            newStyles[`${r}-${c + 1}`] = sheet.cellStyles[key];
        } else {
            newStyles[key] = sheet.cellStyles[key];
        }
    });
    sheet.cellStyles = newStyles;

    // Shift column widths
    const newWidths = {};
    Object.keys(sheet.colWidths || {}).forEach(key => {
        const c = parseInt(key);
        if (c >= atIndex) {
            newWidths[c + 1] = sheet.colWidths[key];
        } else {
            newWidths[c] = sheet.colWidths[key];
        }
    });
    sheet.colWidths = newWidths;

    // Shift merged cells
    if (sheet.mergedCells) {
        sheet.mergedCells = sheet.mergedCells.map(merge => {
            if (merge.startCol >= atIndex) {
                return { ...merge, startCol: merge.startCol + 1, endCol: merge.endCol + 1 };
            } else if (merge.endCol >= atIndex) {
                return { ...merge, endCol: merge.endCol + 1 };
            }
            return merge;
        });
    }

    glabsSaveData();
    glabsHideContextMenu();
    renderGLabs();
}

// Delete selected row
function glabsDeleteRow() {
    if (!glabsSelectedCell) return;

    glabsSaveUndoState();

    const sheet = glabsSheets[glabsCurrentSheet];
    const rowIdx = glabsSelectedCell.row;

    // Remove the row
    sheet.data.splice(rowIdx, 1);

    // Ensure at least one row exists
    if (sheet.data.length === 0) {
        sheet.data.push(Array(glabsCols).fill(''));
    }

    // Shift cell styles up
    const newStyles = {};
    Object.keys(sheet.cellStyles || {}).forEach(key => {
        const [r, c] = key.split('-').map(Number);
        if (r > rowIdx) {
            newStyles[`${r - 1}-${c}`] = sheet.cellStyles[key];
        } else if (r < rowIdx) {
            newStyles[key] = sheet.cellStyles[key];
        }
        // Skip styles for deleted row
    });
    sheet.cellStyles = newStyles;

    // Update merged cells
    if (sheet.mergedCells) {
        sheet.mergedCells = sheet.mergedCells
            .filter(merge => !(merge.startRow <= rowIdx && merge.endRow >= rowIdx))
            .map(merge => {
                if (merge.startRow > rowIdx) {
                    return { ...merge, startRow: merge.startRow - 1, endRow: merge.endRow - 1 };
                }
                return merge;
            });
    }

    glabsSaveData();
    glabsHideContextMenu();
    renderGLabs();
}

// Delete selected column
function glabsDeleteCol() {
    if (!glabsSelectedCell) return;

    glabsSaveUndoState();

    const sheet = glabsSheets[glabsCurrentSheet];
    const colIdx = glabsSelectedCell.col;

    // Remove cell from each row
    sheet.data.forEach(row => {
        if (row && row.length > colIdx) {
            row.splice(colIdx, 1);
        }
    });

    // Ensure at least one column exists
    if (sheet.data[0]?.length === 0) {
        sheet.data.forEach(row => row.push(''));
    }

    // Shift cell styles left
    const newStyles = {};
    Object.keys(sheet.cellStyles || {}).forEach(key => {
        const [r, c] = key.split('-').map(Number);
        if (c > colIdx) {
            newStyles[`${r}-${c - 1}`] = sheet.cellStyles[key];
        } else if (c < colIdx) {
            newStyles[key] = sheet.cellStyles[key];
        }
    });
    sheet.cellStyles = newStyles;

    // Shift column widths
    const newWidths = {};
    Object.keys(sheet.colWidths || {}).forEach(key => {
        const c = parseInt(key);
        if (c > colIdx) {
            newWidths[c - 1] = sheet.colWidths[key];
        } else if (c < colIdx) {
            newWidths[c] = sheet.colWidths[key];
        }
    });
    sheet.colWidths = newWidths;

    // Update merged cells
    if (sheet.mergedCells) {
        sheet.mergedCells = sheet.mergedCells
            .filter(merge => !(merge.startCol <= colIdx && merge.endCol >= colIdx))
            .map(merge => {
                if (merge.startCol > colIdx) {
                    return { ...merge, startCol: merge.startCol - 1, endCol: merge.endCol - 1 };
                }
                return merge;
            });
    }

    glabsSaveData();
    glabsHideContextMenu();
    renderGLabs();
}

// ==================== MERGE CELLS FUNCTIONS ====================

// Merge selected cells
function glabsMergeCells() {
    if (!glabsSelectionStart || !glabsSelectionEnd) return;
    if (glabsSelectionStart.row === glabsSelectionEnd.row && glabsSelectionStart.col === glabsSelectionEnd.col) return;

    glabsSaveUndoState();

    const sheet = glabsSheets[glabsCurrentSheet];
    if (!sheet.mergedCells) sheet.mergedCells = [];

    const startRow = Math.min(glabsSelectionStart.row, glabsSelectionEnd.row);
    const endRow = Math.max(glabsSelectionStart.row, glabsSelectionEnd.row);
    const startCol = Math.min(glabsSelectionStart.col, glabsSelectionEnd.col);
    const endCol = Math.max(glabsSelectionStart.col, glabsSelectionEnd.col);

    // Check if any cell in the range is already merged
    const hasOverlap = sheet.mergedCells.some(merge => {
        return !(merge.endRow < startRow || merge.startRow > endRow ||
                 merge.endCol < startCol || merge.startCol > endCol);
    });

    if (hasOverlap) {
        alert('Cannot merge: Some cells are already merged');
        glabsHideContextMenu();
        return;
    }

    // Keep value of first cell, clear others
    const firstValue = sheet.data[startRow]?.[startCol] || '';
    for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
            if (r === startRow && c === startCol) continue;
            if (sheet.data[r]) sheet.data[r][c] = '';
        }
    }

    // Add merge record
    sheet.mergedCells.push({ startRow, endRow, startCol, endCol });

    glabsSaveData();
    glabsHideContextMenu();
    renderGLabs();
}

// Unmerge cells
function glabsUnmergeCells() {
    if (!glabsSelectedCell) return;

    const sheet = glabsSheets[glabsCurrentSheet];
    if (!sheet.mergedCells) return;

    const { row, col } = glabsSelectedCell;

    // Find merge that contains this cell
    const mergeIdx = sheet.mergedCells.findIndex(merge => {
        return row >= merge.startRow && row <= merge.endRow &&
               col >= merge.startCol && col <= merge.endCol;
    });

    if (mergeIdx === -1) return;

    glabsSaveUndoState();

    // Remove the merge
    sheet.mergedCells.splice(mergeIdx, 1);

    glabsSaveData();
    glabsHideContextMenu();
    renderGLabs();
}

// Check if cell is part of a merge (but not the main cell)
function glabsIsMergedSlave(row, col, sheet) {
    if (!sheet.mergedCells) return false;

    return sheet.mergedCells.some(merge => {
        if (row === merge.startRow && col === merge.startCol) return false; // Main cell
        return row >= merge.startRow && row <= merge.endRow &&
               col >= merge.startCol && col <= merge.endCol;
    });
}

// Get merge info for a cell
function glabsGetMerge(row, col, sheet) {
    if (!sheet.mergedCells) return null;

    return sheet.mergedCells.find(merge => {
        return row === merge.startRow && col === merge.startCol;
    });
}

// ==================== FIND & REPLACE FUNCTIONS ====================

let glabsFindIndex = -1;
let glabsFindResults = [];

// Show find dialog
function glabsShowFindDialog() {
    const dialog = document.getElementById('glabs-find-dialog');
    dialog.style.display = 'block';
    document.getElementById('glabs-find-input').focus();
    document.getElementById('glabs-find-status').textContent = '';
}

// Close find dialog
function glabsCloseFindDialog() {
    document.getElementById('glabs-find-dialog').style.display = 'none';
    glabsFindIndex = -1;
    glabsFindResults = [];

    // Clear highlights
    document.querySelectorAll('.glabs-cell').forEach(cell => {
        cell.classList.remove('glabs-find-highlight');
    });
}

// Find all matches
function glabsFindAll(searchText) {
    if (!searchText) return [];

    const sheet = glabsSheets[glabsCurrentSheet];
    const results = [];
    const searchLower = searchText.toLowerCase();

    sheet.data.forEach((row, rowIdx) => {
        if (!row) return;
        row.forEach((cell, colIdx) => {
            if (cell && String(cell).toLowerCase().includes(searchLower)) {
                results.push({ row: rowIdx, col: colIdx });
            }
        });
    });

    return results;
}

// Find next match
function glabsFindNext() {
    const searchText = document.getElementById('glabs-find-input').value;
    if (!searchText) {
        document.getElementById('glabs-find-status').textContent = 'Enter text to search';
        return;
    }

    glabsFindResults = glabsFindAll(searchText);

    if (glabsFindResults.length === 0) {
        document.getElementById('glabs-find-status').textContent = 'No matches found';
        return;
    }

    // Move to next result
    glabsFindIndex = (glabsFindIndex + 1) % glabsFindResults.length;

    const match = glabsFindResults[glabsFindIndex];

    // Clear previous highlights
    document.querySelectorAll('.glabs-cell').forEach(cell => {
        cell.style.background = '';
    });

    // Highlight all matches lightly
    glabsFindResults.forEach(({ row, col }) => {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) cell.style.background = 'rgba(255, 193, 7, 0.2)';
    });

    // Highlight current match
    const currentCell = document.querySelector(`[data-row="${match.row}"][data-col="${match.col}"]`);
    if (currentCell) {
        currentCell.style.background = 'rgba(255, 193, 7, 0.5)';
        currentCell.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Select the cell
        glabsSelectCell(match.row, match.col, currentCell);
    }

    document.getElementById('glabs-find-status').textContent =
        `${glabsFindIndex + 1} of ${glabsFindResults.length} matches`;
}

// Replace current match
function glabsReplace() {
    if (glabsFindResults.length === 0 || glabsFindIndex < 0) {
        glabsFindNext();
        return;
    }

    const searchText = document.getElementById('glabs-find-input').value;
    const replaceText = document.getElementById('glabs-replace-input').value;

    if (!searchText) return;

    glabsSaveUndoState();

    const match = glabsFindResults[glabsFindIndex];
    const sheet = glabsSheets[glabsCurrentSheet];

    // Replace in the cell
    const currentValue = sheet.data[match.row]?.[match.col] || '';
    const newValue = currentValue.replace(new RegExp(searchText, 'gi'), replaceText);

    if (!sheet.data[match.row]) sheet.data[match.row] = [];
    sheet.data[match.row][match.col] = newValue;

    glabsSaveData();

    // Remove this match from results
    glabsFindResults.splice(glabsFindIndex, 1);

    // Adjust index
    if (glabsFindIndex >= glabsFindResults.length) {
        glabsFindIndex = 0;
    }

    // Find next or update status
    if (glabsFindResults.length > 0) {
        glabsFindIndex--; // Will be incremented in findNext
        glabsFindNext();
    } else {
        document.getElementById('glabs-find-status').textContent = 'All matches replaced';
        renderGLabs();
    }
}

// Replace all matches
function glabsReplaceAll() {
    const searchText = document.getElementById('glabs-find-input').value;
    const replaceText = document.getElementById('glabs-replace-input').value;

    if (!searchText) {
        document.getElementById('glabs-find-status').textContent = 'Enter text to search';
        return;
    }

    const results = glabsFindAll(searchText);

    if (results.length === 0) {
        document.getElementById('glabs-find-status').textContent = 'No matches found';
        return;
    }

    glabsSaveUndoState();

    const sheet = glabsSheets[glabsCurrentSheet];
    let count = 0;

    results.forEach(({ row, col }) => {
        const currentValue = sheet.data[row]?.[col] || '';
        const newValue = currentValue.replace(new RegExp(searchText, 'gi'), replaceText);

        if (!sheet.data[row]) sheet.data[row] = [];
        sheet.data[row][col] = newValue;
        count++;
    });

    glabsSaveData();
    glabsFindResults = [];
    glabsFindIndex = -1;

    document.getElementById('glabs-find-status').textContent = `Replaced ${count} matches`;
    renderGLabs();
}

function glabsClearFormat() {
    const sheet = glabsSheets[glabsCurrentSheet];
    glabsSelectedCells.forEach(({ row, col }) => {
        const key = `${row}-${col}`;
        if (sheet.cellStyles?.[key]) {
            delete sheet.cellStyles[key].format;
            delete sheet.cellStyles[key].bold;
            delete sheet.cellStyles[key].italic;
        }
    });
    glabsSaveData();
    glabsHideContextMenu();
    renderGLabs();
}

function glabsDeleteCellContent() {
    const sheet = glabsSheets[glabsCurrentSheet];
    glabsSelectedCells.forEach(({ row, col }) => {
        if (sheet.data[row]) sheet.data[row][col] = '';
    });
    glabsSaveData();
    glabsHideContextMenu();
    renderGLabs();
}

// Edit a cell (single click)
function glabsEditCell(td, row, col) {
    if (!td) return;
    const sheet = glabsSheets[glabsCurrentSheet];
    const currentValue = sheet.data[row]?.[col] || '';
    const contentDiv = td.querySelector('.glabs-cell-content');
    if (!contentDiv) return;

    // Use a safer way to handle the value with special characters
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.onblur = function() { glabsSaveCell(this, row, col); };
    input.onkeydown = function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            glabsSaveCell(this, row, col);
            // Move to next row
            const nextCell = document.querySelector(`.glabs-cell[data-row="${row + 1}"][data-col="${col}"]`);
            if (nextCell) {
                glabsStartSelection({ button: 0 }, row + 1, col);
            }
        } else if (event.key === 'Tab') {
            event.preventDefault();
            glabsSaveCell(this, row, col);
            glabsMoveNext(row, col, event.shiftKey);
        } else if (event.key === 'Escape') {
            renderGLabs();
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            glabsSaveCell(this, row, col);
            const nextCell = document.querySelector(`.glabs-cell[data-row="${row + 1}"][data-col="${col}"]`);
            if (nextCell) glabsStartSelection({ button: 0 }, row + 1, col);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            glabsSaveCell(this, row, col);
            const nextCell = document.querySelector(`.glabs-cell[data-row="${row - 1}"][data-col="${col}"]`);
            if (nextCell) glabsStartSelection({ button: 0 }, row - 1, col);
        } else if (event.key === 'ArrowRight' && this.selectionStart === this.value.length) {
            event.preventDefault();
            glabsSaveCell(this, row, col);
            glabsMoveNext(row, col, false);
        } else if (event.key === 'ArrowLeft' && this.selectionStart === 0) {
            event.preventDefault();
            glabsSaveCell(this, row, col);
            glabsMoveNext(row, col, true);
        }
    };

    contentDiv.innerHTML = '';
    contentDiv.appendChild(input);
    input.focus();
    input.select();
}

// Save cell value
function glabsSaveCell(input, row, col) {
    const value = input.value;
    const sheet = glabsSheets[glabsCurrentSheet];

    // Save undo state before modifying
    glabsSaveUndoState();

    // Ensure row exists
    if (!sheet.data[row]) {
        sheet.data[row] = [];
    }

    sheet.data[row][col] = value;

    // Save to localStorage
    glabsSaveData();

    // Re-render the cell with proper formatting
    const evaluatedValue = glabsEvaluateCell(value, row, col);
    const cellStyle = sheet.cellStyles?.[`${row}-${col}`] || {};
    const displayValue = glabsFormatValue(evaluatedValue, cellStyle.format);
    const textColor = cellStyle.color || '';
    const bold = cellStyle.bold ? 'font-weight: 700;' : '';
    const italic = cellStyle.italic ? 'font-style: italic;' : '';

    if (input.parentElement) {
        input.parentElement.innerHTML = `<span style="${textColor ? 'color: ' + textColor + ';' : ''} ${bold} ${italic}">${displayValue}</span>`;
    }

    // Show saved indicator
    const savedEl = document.getElementById('glabs-saved');
    if (savedEl) savedEl.innerHTML = '<i class="fas fa-check-circle"></i> Saved';
}

// Move to next cell
function glabsMoveNext(row, col, backwards) {
    const sheet = glabsSheets[glabsCurrentSheet];
    const actualCols = sheet.data[0]?.length || glabsCols;
    const nextCol = backwards ? col - 1 : col + 1;
    const nextRow = row;

    if (nextCol >= 0 && nextCol < actualCols) {
        const nextCell = document.querySelector(`.glabs-cell[data-row="${nextRow}"][data-col="${nextCol}"]`);
        if (nextCell) {
            glabsSelectCell(nextCell, nextRow, nextCol);
            glabsEditCell(nextCell, nextRow, nextCol);
        }
    }
}

// Toggle color picker
function glabsToggleColorPicker() {
    const picker = document.getElementById('glabs-color-picker');
    const textPicker = document.getElementById('glabs-text-color-picker');
    if (textPicker) textPicker.style.display = 'none';
    picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
}

// Toggle text color picker
function glabsToggleTextColorPicker() {
    const picker = document.getElementById('glabs-text-color-picker');
    const bgPicker = document.getElementById('glabs-color-picker');
    if (bgPicker) bgPicker.style.display = 'none';
    picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
}

// Set cell background color
function glabsSetCellColor(color) {
    if (!glabsSelectedCell) return;

    glabsSaveUndoState();

    const { row, col, element } = glabsSelectedCell;
    const sheet = glabsSheets[glabsCurrentSheet];

    if (!sheet.cellStyles) sheet.cellStyles = {};
    if (!sheet.cellStyles[`${row}-${col}`]) sheet.cellStyles[`${row}-${col}`] = {};

    sheet.cellStyles[`${row}-${col}`].bg = color;

    if (color) {
        element.style.background = color;
    } else {
        element.style.background = '';
    }

    glabsSaveData();
    document.getElementById('glabs-color-picker').style.display = 'none';
    document.getElementById('glabs-color-preview').style.background = color || '#ffffff';
}

// Set cell text color
function glabsSetTextColor(color) {
    if (!glabsSelectedCell) return;

    glabsSaveUndoState();

    const { row, col, element } = glabsSelectedCell;
    const sheet = glabsSheets[glabsCurrentSheet];

    if (!sheet.cellStyles) sheet.cellStyles = {};
    if (!sheet.cellStyles[`${row}-${col}`]) sheet.cellStyles[`${row}-${col}`] = {};

    sheet.cellStyles[`${row}-${col}`].color = color;

    const contentDiv = element.querySelector('.glabs-cell-content');
    if (contentDiv) {
        contentDiv.style.color = color || '';
    }

    glabsSaveData();
    document.getElementById('glabs-text-color-picker').style.display = 'none';
    document.getElementById('glabs-text-color-preview').style.background = color || '#000000';
}

// Set column width
function glabsSetColumnWidth(width) {
    if (!glabsSelectedCell || !width) return;

    const { col } = glabsSelectedCell;
    const sheet = glabsSheets[glabsCurrentSheet];

    if (!sheet.colWidths) sheet.colWidths = {};
    sheet.colWidths[col] = parseInt(width);

    glabsSaveData();
    renderGLabs();
}

// Column resize functionality
let glabsResizing = null;

function glabsStartResize(event, colIndex) {
    event.preventDefault();
    glabsResizing = { col: colIndex, startX: event.clientX };

    document.addEventListener('mousemove', glabsDoResize);
    document.addEventListener('mouseup', glabsStopResize);
}

function glabsDoResize(event) {
    if (!glabsResizing) return;

    const sheet = glabsSheets[glabsCurrentSheet];
    const currentWidth = sheet.colWidths?.[glabsResizing.col] || 100;
    const diff = event.clientX - glabsResizing.startX;
    const newWidth = Math.max(40, currentWidth + diff);

    // Update all cells in this column
    const cells = document.querySelectorAll(`th[data-col="${glabsResizing.col}"], td[data-col="${glabsResizing.col}"]`);
    cells.forEach(cell => {
        cell.style.minWidth = newWidth + 'px';
        cell.style.width = newWidth + 'px';
    });

    glabsResizing.startX = event.clientX;
    if (!sheet.colWidths) sheet.colWidths = {};
    sheet.colWidths[glabsResizing.col] = newWidth;
}

function glabsStopResize() {
    if (glabsResizing) {
        glabsSaveData();
        glabsResizing = null;
    }
    document.removeEventListener('mousemove', glabsDoResize);
    document.removeEventListener('mouseup', glabsStopResize);
}

// Sheet management
function glabsAddSheet() {
    const sheetCount = Object.keys(glabsSheets).length + 1;
    let newName = `Sheet ${sheetCount}`;

    // Find unique name
    while (glabsSheets[newName]) {
        newName = `Sheet ${sheetCount + Math.floor(Math.random() * 100)}`;
    }

    glabsInitSheet(newName);
    glabsCurrentSheet = newName;
    glabsSaveData();
    renderGLabs();
}

function glabsSwitchSheet(name) {
    if (glabsSheets[name]) {
        glabsCurrentSheet = name;
        glabsSaveData();
        renderGLabs();
    }
}

function glabsRenameSheet(oldName) {
    const newName = prompt('Nuevo nombre de la hoja:', oldName);
    if (newName && newName !== oldName && !glabsSheets[newName]) {
        glabsSheets[newName] = glabsSheets[oldName];
        delete glabsSheets[oldName];
        if (glabsCurrentSheet === oldName) {
            glabsCurrentSheet = newName;
        }
        glabsSaveData();
        renderGLabs();
    }
}

function glabsDeleteSheet(name) {
    if (Object.keys(glabsSheets).length <= 1) {
        alert('You cannot delete the only sheet.');
        return;
    }

    if (confirm(`Delete sheet "${name}"?`)) {
        delete glabsSheets[name];
        if (glabsCurrentSheet === name) {
            glabsCurrentSheet = Object.keys(glabsSheets)[0];
        }
        glabsSaveData();
        renderGLabs();
    }
}

// Drag and drop sheet reordering
let glabsDraggedSheet = null;

function glabsInitSheetDrag() {
    const tabs = document.querySelectorAll('.glabs-sheet-tab');
    tabs.forEach(tab => {
        tab.setAttribute('draggable', 'true');
        tab.addEventListener('dragstart', glabsSheetDragStart);
        tab.addEventListener('dragover', glabsSheetDragOver);
        tab.addEventListener('drop', glabsSheetDrop);
        tab.addEventListener('dragend', glabsSheetDragEnd);
    });
}

function glabsSheetDragStart(e) {
    glabsDraggedSheet = e.target.textContent.trim().replace('×', '').trim();
    e.target.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
}

function glabsSheetDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.target.closest('.glabs-sheet-tab')?.classList.add('drag-over');
}

function glabsSheetDrop(e) {
    e.preventDefault();
    const targetTab = e.target.closest('.glabs-sheet-tab');
    if (!targetTab) return;

    const targetSheet = targetTab.textContent.trim().replace('×', '').trim();
    if (glabsDraggedSheet && targetSheet && glabsDraggedSheet !== targetSheet) {
        // Reorder sheets
        const sheetNames = Object.keys(glabsSheets);
        const draggedIndex = sheetNames.indexOf(glabsDraggedSheet);
        const targetIndex = sheetNames.indexOf(targetSheet);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            // Create new order
            sheetNames.splice(draggedIndex, 1);
            sheetNames.splice(targetIndex, 0, glabsDraggedSheet);

            // Rebuild sheets object in new order
            const newSheets = {};
            sheetNames.forEach(name => {
                newSheets[name] = glabsSheets[name];
            });
            glabsSheets = newSheets;
            glabsSaveData();
            renderGLabs();
        }
    }
    targetTab.classList.remove('drag-over');
}

function glabsSheetDragEnd(e) {
    e.target.style.opacity = '1';
    document.querySelectorAll('.glabs-sheet-tab').forEach(tab => {
        tab.classList.remove('drag-over');
    });
    glabsDraggedSheet = null;
}

// Evaluate cell value (handle formulas)
function glabsEvaluateCell(value, row, col) {
    if (!value || typeof value !== 'string') return value || '';

    if (!value.startsWith('=')) return value;

    try {
        const sheet = glabsSheets[glabsCurrentSheet];
        const glabsData = sheet?.data || [];
        const formula = value.substring(1).toUpperCase();

        // Parse cell references like A1, B2, etc.
        const colLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        // Helper to clean formatted values (remove $, %, commas)
        function cleanVal(rawVal) {
            if (!rawVal) return 0;
            const cleaned = String(rawVal).replace(/[$,%]/g, '').replace(/,/g, '');
            return parseFloat(cleaned) || 0;
        }

        // Handle SUM(A1:A10)
        const sumMatch = formula.match(/SUM\(([A-Z])(\d+):([A-Z])(\d+)\)/);
        if (sumMatch) {
            const [_, startCol, startRow, endCol, endRow] = sumMatch;
            let sum = 0;
            const sc = colLetters.indexOf(startCol);
            const ec = colLetters.indexOf(endCol);
            const sr = parseInt(startRow) - 1;
            const er = parseInt(endRow) - 1;

            for (let r = sr; r <= er; r++) {
                for (let c = sc; c <= ec; c++) {
                    sum += cleanVal(glabsData[r]?.[c]);
                }
            }
            return sum.toLocaleString();
        }

        // Handle AVG(A1:A10)
        const avgMatch = formula.match(/AVG\(([A-Z])(\d+):([A-Z])(\d+)\)/);
        if (avgMatch) {
            const [_, startCol, startRow, endCol, endRow] = avgMatch;
            let sum = 0, count = 0;
            const sc = colLetters.indexOf(startCol);
            const ec = colLetters.indexOf(endCol);
            const sr = parseInt(startRow) - 1;
            const er = parseInt(endRow) - 1;

            for (let r = sr; r <= er; r++) {
                for (let c = sc; c <= ec; c++) {
                    const val = cleanVal(glabsData[r]?.[c]);
                    if (val !== 0 || glabsData[r]?.[c]) { sum += val; count++; }
                }
            }
            return count > 0 ? (sum / count).toLocaleString(undefined, {maximumFractionDigits: 2}) : '0';
        }

        // Handle MAX(A1:A10)
        const maxMatch = formula.match(/MAX\(([A-Z])(\d+):([A-Z])(\d+)\)/);
        if (maxMatch) {
            const [_, startCol, startRow, endCol, endRow] = maxMatch;
            let max = -Infinity;
            const sc = colLetters.indexOf(startCol);
            const ec = colLetters.indexOf(endCol);
            const sr = parseInt(startRow) - 1;
            const er = parseInt(endRow) - 1;

            for (let r = sr; r <= er; r++) {
                for (let c = sc; c <= ec; c++) {
                    const val = cleanVal(glabsData[r]?.[c]);
                    if (val > max) max = val;
                }
            }
            return max === -Infinity ? '0' : max.toLocaleString();
        }

        // Handle MIN(A1:A10)
        const minMatch = formula.match(/MIN\(([A-Z])(\d+):([A-Z])(\d+)\)/);
        if (minMatch) {
            const [_, startCol, startRow, endCol, endRow] = minMatch;
            let min = Infinity;
            const sc = colLetters.indexOf(startCol);
            const ec = colLetters.indexOf(endCol);
            const sr = parseInt(startRow) - 1;
            const er = parseInt(endRow) - 1;

            for (let r = sr; r <= er; r++) {
                for (let c = sc; c <= ec; c++) {
                    if (glabsData[r]?.[c]) {
                        const val = cleanVal(glabsData[r]?.[c]);
                        if (val < min) min = val;
                    }
                }
            }
            return min === Infinity ? '0' : min.toLocaleString();
        }

        // Handle COUNT(A1:A10)
        const countMatch = formula.match(/COUNT\(([A-Z])(\d+):([A-Z])(\d+)\)/);
        if (countMatch) {
            const [_, startCol, startRow, endCol, endRow] = countMatch;
            let count = 0;
            const sc = colLetters.indexOf(startCol);
            const ec = colLetters.indexOf(endCol);
            const sr = parseInt(startRow) - 1;
            const er = parseInt(endRow) - 1;

            for (let r = sr; r <= er; r++) {
                for (let c = sc; c <= ec; c++) {
                    if (glabsData[r]?.[c]) count++;
                }
            }
            return count.toString();
        }

        // Handle simple range without function (D1:D4) - auto SUM
        const rangeMatch = formula.match(/^([A-Z])(\d+):([A-Z])(\d+)$/);
        if (rangeMatch) {
            const [_, startCol, startRow, endCol, endRow] = rangeMatch;
            let sum = 0;
            const sc = colLetters.indexOf(startCol);
            const ec = colLetters.indexOf(endCol);
            const sr = parseInt(startRow) - 1;
            const er = parseInt(endRow) - 1;

            for (let r = sr; r <= er; r++) {
                for (let c = sc; c <= ec; c++) {
                    sum += cleanVal(glabsData[r]?.[c]);
                }
            }
            return sum.toLocaleString(undefined, {maximumFractionDigits: 2});
        }

        // Handle simple math with cell references (A1+B1, A1*2, etc.)
        let evalFormula = formula;
        const cellRefs = formula.match(/[A-Z]\d+/g) || [];
        cellRefs.forEach(ref => {
            const c = colLetters.indexOf(ref[0]);
            const r = parseInt(ref.substring(1)) - 1;
            const val = cleanVal(glabsData[r]?.[c]);
            evalFormula = evalFormula.replace(ref, val);
        });

        // Safe eval for math only
        const result = Function('"use strict"; return (' + evalFormula + ')')();
        return typeof result === 'number' ? result.toLocaleString(undefined, {maximumFractionDigits: 2}) : result;

    } catch (e) {
        return '#ERROR';
    }
}

// Apply formula from formula bar
function glabsApplyFormula() {
    if (!glabsSelectedCell) return;

    glabsSaveUndoState();

    const { row, col, element } = glabsSelectedCell;
    const value = document.getElementById('glabs-formula-bar').value;
    const sheet = glabsSheets[glabsCurrentSheet];

    if (!sheet.data[row]) sheet.data[row] = [];
    sheet.data[row][col] = value;

    // Save to localStorage
    glabsSaveData();

    // Update display with proper formatting
    const evaluatedValue = glabsEvaluateCell(value, row, col);
    const cellStyle = sheet.cellStyles?.[`${row}-${col}`] || {};
    const displayValue = glabsFormatValue(evaluatedValue, cellStyle.format);
    const textColor = cellStyle.color || '';
    const bold = cellStyle.bold ? 'font-weight: 700;' : '';
    const italic = cellStyle.italic ? 'font-style: italic;' : '';

    const contentEl = element?.querySelector('.glabs-cell-content');
    if (contentEl) {
        contentEl.innerHTML = `<span style="${textColor ? 'color: ' + textColor + ';' : ''} ${bold} ${italic}">${displayValue}</span>`;
    }

    // Update quick stats
    const numValue = parseFloat(String(evaluatedValue).replace(/[$,%]/g, '').replace(/,/g, ''));
    if (!isNaN(numValue)) {
        document.getElementById('glabs-sum').textContent = numValue.toLocaleString();
        document.getElementById('glabs-avg').textContent = numValue.toLocaleString();
        document.getElementById('glabs-count').textContent = '1';
    }

    document.getElementById('glabs-saved').innerHTML = '<i class="fas fa-check-circle"></i> Saved';
}

// Add row
function glabsAddRow() {
    const sheet = glabsSheets[glabsCurrentSheet];
    const currentCols = sheet.data[0]?.length || glabsCols;
    sheet.data.push(Array(currentCols).fill(''));
    glabsSaveData();
    renderGLabs();
}

// Add column
function glabsAddColumn() {
    const sheet = glabsSheets[glabsCurrentSheet];
    const currentCols = sheet.data[0]?.length || glabsCols;
    if (currentCols >= 26) return; // Max 26 columns (A-Z)
    sheet.data.forEach(row => row.push(''));
    glabsSaveData();
    renderGLabs();
}

// Clear all data
function glabsClearAll() {
    if (!confirm('Are you sure you want to clear all data in this sheet? This cannot be undone.')) return;

    const sheet = glabsSheets[glabsCurrentSheet];
    const rows = sheet.data.length || glabsRows;
    const cols = sheet.data[0]?.length || glabsCols;

    sheet.data = [];
    for (let i = 0; i < rows; i++) {
        sheet.data[i] = Array(cols).fill('');
    }
    sheet.cellStyles = {};
    glabsSaveData();
    renderGLabs();
}

// Export to CSV
function glabsExportCSV() {
    const sheet = glabsSheets[glabsCurrentSheet];
    const glabsData = sheet.data;
    const colLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numCols = glabsData[0]?.length || glabsCols;
    let csv = '';

    // Header row
    csv += ',' + Array.from({length: numCols}, (_, i) => colLetters[i]).join(',') + '\n';

    // Data rows
    glabsData.forEach((row, idx) => {
        const rowData = [idx + 1];
        for (let c = 0; c < numCols; c++) {
            const val = String(glabsEvaluateCell(row[c] || '', idx, c));
            // Escape commas and quotes
            if (val.includes(',') || val.includes('"')) {
                rowData.push(`"${val.replace(/"/g, '""')}"`);
            } else {
                rowData.push(val);
            }
        }
        csv += rowData.join(',') + '\n';
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glabs_${glabsCurrentSheet.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

