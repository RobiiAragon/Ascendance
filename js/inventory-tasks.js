/**
 * Inventory Tasks Module
 * Daily inventory count tasks for all stores
 *
 * Collections:
 * - inventoryTasks: Task definitions (category, description, shift, stores)
 * - inventoryCompletions: Completion records per store/shift/date
 */

// ============================================
// STATE VARIABLES
// ============================================
let inventoryTasksData = {
    tasks: [],
    completions: []
};

let inventoryTasksSelectedDate = new Date().toISOString().split('T')[0];
let inventoryTasksCurrentShift = 'opening';
let inventoryTasksCurrentView = 'main'; // 'main' or 'detail'
let inventoryTasksSelectedStore = null;

// Store configuration with unique icons and colors
const INVENTORY_STORES = [
    { id: 'Miramar', name: 'VSU Miramar', shortName: 'Miramar', icon: 'fa-jet-fighter', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
    { id: 'Kearny Mesa', name: 'VSU Kearny Mesa', shortName: 'Kearny Mesa', icon: 'fa-utensils', color: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
    { id: 'Chula Vista', name: 'VSU Chula Vista', shortName: 'Chula Vista', icon: 'fa-leaf', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    { id: 'North Park', name: 'VSU North Park', shortName: 'North Park', icon: 'fa-tree-city', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
    { id: 'Morena', name: 'VSU Morena', shortName: 'Morena', icon: 'fa-water', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
    { id: 'Loyal Vaper', name: 'Loyal Vaper', shortName: 'Loyal Vaper', icon: 'fa-crown', color: '#eab308', gradient: 'linear-gradient(135deg, #eab308, #ca8a04)' },
    { id: 'Miramar Wine & Liquor', name: 'Miramar Wine & Liquor', shortName: 'MMWL', icon: 'fa-wine-bottle', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' }
];

// Shift configuration
const INVENTORY_SHIFTS = {
    opening: {
        name: 'AM Shift',
        icon: 'fa-sun',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        deadline: '14:00',
        deadlineLabel: '2:00 PM'
    },
    closing: {
        name: 'PM Shift',
        icon: 'fa-moon',
        color: '#8b5cf6',
        bgColor: 'rgba(139, 92, 246, 0.1)',
        deadline: '21:00',
        deadlineLabel: '9:00 PM'
    }
};

// ============================================
// INITIALIZATION
// ============================================
async function initializeInventoryTasks() {
    console.log('[InventoryTasks] Initializing module...');
    await loadInventoryTasks();
    await loadInventoryCompletions();
    renderInventoryTasksModule();
}

// ============================================
// FIREBASE DATA LOADING
// ============================================
async function loadInventoryTasks() {
    try {
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.error('[InventoryTasks] Firebase not initialized');
            return;
        }
        const db = firebase.firestore();
        const snapshot = await db.collection('inventoryTasks')
            .where('active', '==', true)
            .orderBy('createdAt', 'desc')
            .get();
        inventoryTasksData.tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`[InventoryTasks] Loaded ${inventoryTasksData.tasks.length} tasks`);
    } catch (error) {
        console.error('[InventoryTasks] Error loading tasks:', error);
        inventoryTasksData.tasks = [];
    }
}

async function loadInventoryCompletions() {
    try {
        if (typeof firebase === 'undefined' || !firebase.firestore) return;
        const db = firebase.firestore();
        const snapshot = await db.collection('inventoryCompletions')
            .where('date', '==', inventoryTasksSelectedDate)
            .get();
        inventoryTasksData.completions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`[InventoryTasks] Loaded ${inventoryTasksData.completions.length} completions`);
    } catch (error) {
        console.error('[InventoryTasks] Error loading completions:', error);
        inventoryTasksData.completions = [];
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getTasksForShift(shift, storeId = null) {
    const today = inventoryTasksSelectedDate;
    return inventoryTasksData.tasks.filter(task => {
        if (task.shift !== shift) return false;
        if (task.duration === 'one-time' && task.createdDate !== today) return false;
        // Filter by store if specified
        if (storeId) {
            if (task.stores === 'all') return true;
            if (Array.isArray(task.stores) && task.stores.includes(storeId)) return true;
            return false;
        }
        return true;
    });
}

function getTasksForStore(storeId, shift) {
    return getTasksForShift(shift, storeId);
}

function getStoreCompletion(store, shift, taskId) {
    return inventoryTasksData.completions.find(c =>
        c.store === store && c.shift === shift && c.taskId === taskId && c.date === inventoryTasksSelectedDate
    );
}

function getStoreStatus(store, shift) {
    // Get tasks assigned to this specific store
    const tasks = getTasksForStore(store, shift);
    if (tasks.length === 0) return { status: 'no-tasks', completed: 0, total: 0 };

    const completedCount = tasks.filter(task => getStoreCompletion(store, shift, task.id)).length;

    if (completedCount === tasks.length) return { status: 'completed', completed: completedCount, total: tasks.length };

    const now = new Date();
    const shiftConfig = INVENTORY_SHIFTS[shift];
    const [deadlineHour, deadlineMin] = shiftConfig.deadline.split(':').map(Number);
    const deadline = new Date();
    deadline.setHours(deadlineHour, deadlineMin, 0, 0);

    const isToday = inventoryTasksSelectedDate === new Date().toISOString().split('T')[0];
    if (isToday && now > deadline && completedCount < tasks.length) {
        return { status: 'missed', completed: completedCount, total: tasks.length };
    }

    return { status: 'pending', completed: completedCount, total: tasks.length };
}

function getOverallStats(shift) {
    let completed = 0, pending = 0, missed = 0;
    INVENTORY_STORES.forEach(store => {
        const { status } = getStoreStatus(store.id, shift);
        if (status === 'completed') completed++;
        else if (status === 'missed') missed++;
        else if (status === 'pending') pending++;
    });
    return { completed, pending, missed, total: INVENTORY_STORES.length };
}

function canManageInventoryTasks() {
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    return user && (user.role === 'admin' || user.role === 'manager');
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDateShort(dateString) {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateLong(dateString) {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTaskStores(stores) {
    if (stores === 'all') return 'All Stores';
    if (!Array.isArray(stores)) return 'Unknown';
    if (stores.length === INVENTORY_STORES.length) return 'All Stores';
    if (stores.length === 1) {
        const store = INVENTORY_STORES.find(s => s.id === stores[0]);
        return store ? store.shortName : stores[0];
    }
    if (stores.length <= 3) {
        return stores.map(id => {
            const store = INVENTORY_STORES.find(s => s.id === id);
            return store ? store.shortName : id;
        }).join(', ');
    }
    return `${stores.length} stores`;
}

// ============================================
// MAIN RENDER FUNCTION
// ============================================
function renderInventoryTasksModule() {
    const dashboard = document.querySelector('.dashboard');
    if (!dashboard) return;

    if (inventoryTasksCurrentView === 'detail' && inventoryTasksSelectedStore) {
        renderStoreDetailView();
    } else {
        renderMainView();
    }
}

// ============================================
// MAIN VIEW
// ============================================
function renderMainView() {
    const dashboard = document.querySelector('.dashboard');
    const canManage = canManageInventoryTasks();
    const isToday = inventoryTasksSelectedDate === new Date().toISOString().split('T')[0];
    const shiftTasks = getTasksForShift(inventoryTasksCurrentShift);
    const currentTask = shiftTasks[0];
    const stats = getOverallStats(inventoryTasksCurrentShift);
    const shiftConfig = INVENTORY_SHIFTS[inventoryTasksCurrentShift];

    dashboard.innerHTML = `
        <style>
            .inv-tasks-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
            .inv-tasks-header h1 { font-size: 32px; }
            .inv-stores-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
            .inv-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
            .inv-controls { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }

            @media (max-width: 768px) {
                .inv-tasks-container { padding: 16px; }
                .inv-tasks-header h1 { font-size: 24px; }
                .inv-stores-grid { grid-template-columns: 1fr; }
                .inv-stats-grid { grid-template-columns: repeat(2, 1fr); }
                .inv-controls { flex-direction: column; align-items: stretch; }
                .inv-shift-toggle { width: 100%; justify-content: center; }
                .inv-date-nav { justify-content: center; }
            }

            @media (max-width: 480px) {
                .inv-tasks-container { padding: 12px; }
                .inv-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
            }
        </style>
        <div class="inv-tasks-container">

            <!-- Header -->
            <div class="inv-tasks-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h1 style="font-weight: 800; margin: 0; color: var(--text-primary);">
                        Inventory Tasks
                    </h1>
                    <p style="color: var(--text-muted); margin-top: 8px; font-size: 15px;">
                        Track daily inventory counts across all stores
                    </p>
                </div>

                ${canManage ? `
                    <button onclick="openCreateInventoryTaskModal()"
                            style="background: var(--accent-primary); color: white; border: none; padding: 14px 24px;
                                   border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 14px;
                                   display: flex; align-items: center; gap: 10px; transition: all 0.2s;
                                   box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(99, 102, 241, 0.35)';"
                            onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 12px rgba(99, 102, 241, 0.25)';">
                        <i class="fas fa-plus"></i> New Task
                    </button>
                ` : ''}
            </div>

            <!-- Date & Shift Controls -->
            <div class="card" style="margin-bottom: 24px; padding: 20px;">
                <div class="inv-controls">

                    <!-- Date Navigation -->
                    <div class="inv-date-nav" style="display: flex; align-items: center; gap: 12px;">
                        <button onclick="inventoryTasksPrevDay()"
                                style="width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--border-color);
                                       background: var(--bg-secondary); cursor: pointer; display: flex; align-items: center;
                                       justify-content: center; color: var(--text-secondary); transition: all 0.2s;"
                                onmouseover="this.style.background='var(--bg-tertiary)'"
                                onmouseout="this.style.background='var(--bg-secondary)'">
                            <i class="fas fa-chevron-left"></i>
                        </button>

                        <div style="text-align: center; min-width: 160px;">
                            <div style="font-weight: 700; font-size: 16px; color: var(--text-primary);">
                                ${formatDateShort(inventoryTasksSelectedDate)}
                            </div>
                            <div style="font-size: 12px; color: var(--text-muted);">
                                ${isToday ? 'Today' : formatDateLong(inventoryTasksSelectedDate).split(',')[0]}
                            </div>
                        </div>

                        <button onclick="inventoryTasksNextDay()"
                                style="width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--border-color);
                                       background: var(--bg-secondary); cursor: pointer; display: flex; align-items: center;
                                       justify-content: center; color: var(--text-secondary); transition: all 0.2s;"
                                onmouseover="this.style.background='var(--bg-tertiary)'"
                                onmouseout="this.style.background='var(--bg-secondary)'">
                            <i class="fas fa-chevron-right"></i>
                        </button>

                        ${!isToday ? `
                            <button onclick="inventoryTasksGoToToday()"
                                    style="padding: 8px 16px; border-radius: 8px; border: none; background: var(--accent-primary);
                                           color: white; cursor: pointer; font-size: 13px; font-weight: 600; margin-left: 8px;">
                                Today
                            </button>
                        ` : ''}
                    </div>

                    <!-- Shift Toggle -->
                    <div class="inv-shift-toggle" style="display: flex; background: var(--bg-secondary); border-radius: 12px; padding: 4px;">
                        <button onclick="switchInventoryShift('opening')"
                                style="padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600;
                                       font-size: 13px; display: flex; align-items: center; gap: 8px; transition: all 0.2s;
                                       background: ${inventoryTasksCurrentShift === 'opening' ? '#f59e0b' : 'transparent'};
                                       color: ${inventoryTasksCurrentShift === 'opening' ? 'white' : 'var(--text-secondary)'};">
                            <i class="fas fa-sun"></i> AM
                        </button>
                        <button onclick="switchInventoryShift('closing')"
                                style="padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600;
                                       font-size: 13px; display: flex; align-items: center; gap: 8px; transition: all 0.2s;
                                       background: ${inventoryTasksCurrentShift === 'closing' ? '#8b5cf6' : 'transparent'};
                                       color: ${inventoryTasksCurrentShift === 'closing' ? 'white' : 'var(--text-secondary)'};">
                            <i class="fas fa-moon"></i> PM
                        </button>
                    </div>
                </div>
            </div>

            <!-- Store Cards Grid - FIRST -->
            <div class="inv-stores-grid" style="margin-bottom: 24px;">
                ${INVENTORY_STORES.map(store => renderStoreCard(store)).join('')}
            </div>

            <!-- Current Task Banner -->
            ${currentTask ? `
                <div class="card" style="margin-bottom: 24px; padding: 24px; border-left: 4px solid ${shiftConfig.color};">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <span style="background: ${shiftConfig.color}; color: white; padding: 4px 10px; border-radius: 6px;
                                     font-size: 11px; font-weight: 700; text-transform: uppercase;">
                            ${shiftConfig.name} Task
                        </span>
                        ${currentTask.duration === 'one-time' ? `
                            <span style="background: #f59e0b; color: white; padding: 4px 10px; border-radius: 6px;
                                         font-size: 11px; font-weight: 700;">TODAY ONLY</span>
                        ` : ''}
                    </div>
                    <h2 style="font-size: 22px; font-weight: 700; margin: 0 0 8px 0; color: var(--text-primary);">
                        ${currentTask.category}
                    </h2>
                    <p style="color: var(--text-secondary); margin: 0; font-size: 14px; line-height: 1.5;">
                        ${currentTask.description || 'Count all items in this category'}
                    </p>
                </div>
            ` : `
                <div class="card" style="margin-bottom: 24px; padding: 40px; text-align: center; border: 2px dashed var(--border-color); background: transparent;">
                    <i class="fas fa-clipboard-list" style="font-size: 40px; color: var(--text-muted); margin-bottom: 12px;"></i>
                    <h3 style="color: var(--text-secondary); margin: 0 0 8px 0; font-size: 16px;">No Tasks for ${shiftConfig.name}</h3>
                    <p style="color: var(--text-muted); margin: 0; font-size: 13px;">
                        ${canManage ? 'Create a new task to get started' : 'Check back later for assigned tasks'}
                    </p>
                </div>
            `}

            <!-- Stats Summary -->
            <div class="inv-stats-grid" style="margin-bottom: 24px;">
                <div class="card" style="padding: 16px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 800; color: #10b981;">${stats.completed}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Completed</div>
                </div>
                <div class="card" style="padding: 16px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 800; color: var(--text-muted);">${stats.pending}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Pending</div>
                </div>
                <div class="card" style="padding: 16px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 800; color: #ef4444;">${stats.missed}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Missed</div>
                </div>
                <div class="card" style="padding: 16px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 800; color: ${shiftConfig.color};">${shiftConfig.deadlineLabel}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Deadline</div>
                </div>
            </div>

            <!-- Active Tasks List (Admin/Manager only) -->
            ${canManage && shiftTasks.length > 0 ? `
                <div style="margin-top: 32px;">
                    <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px; color: var(--text-primary);">
                        Manage Tasks
                    </h3>
                    <div class="card" style="overflow: hidden;">
                        ${shiftTasks.map((task, idx) => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px;
                                        ${idx > 0 ? 'border-top: 1px solid var(--border-color);' : ''}">
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">
                                        ${task.category}
                                    </div>
                                    <div style="font-size: 13px; color: var(--text-muted);">
                                        ${task.description || 'No description'}
                                    </div>
                                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; display: flex; flex-wrap: wrap; gap: 12px;">
                                        <span>${task.duration === 'one-time' ? '<i class="fas fa-calendar-day" style="color: #f59e0b;"></i> One-time' : '<i class="fas fa-sync" style="color: #10b981;"></i> Recurring'}</span>
                                        <span><i class="fas fa-store"></i> ${formatTaskStores(task.stores)}</span>
                                        <span><i class="fas fa-user"></i> ${task.createdBy || 'Unknown'}</span>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button onclick="editInventoryTask('${task.id}')"
                                            style="width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--border-color);
                                                   background: var(--bg-secondary); cursor: pointer; color: var(--text-muted);"
                                            title="Edit">
                                        <i class="fas fa-pen"></i>
                                    </button>
                                    <button onclick="deleteInventoryTask('${task.id}')"
                                            style="width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--border-color);
                                                   background: var(--bg-secondary); cursor: pointer; color: #ef4444;"
                                            title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function renderStoreCard(store) {
    const { status, completed, total } = getStoreStatus(store.id, inventoryTasksCurrentShift);
    const hasTasksForShift = total > 0;

    // Status badge
    let statusBadge = '';
    let statusStyle = '';

    if (status === 'completed') {
        statusBadge = `<span style="background: #10b981; color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;">
            <i class="fas fa-check"></i> Done
        </span>`;
        statusStyle = 'border-left: 4px solid #10b981;';
    } else if (status === 'missed') {
        statusBadge = `<span style="background: #ef4444; color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;">
            <i class="fas fa-times"></i> Missed
        </span>`;
        statusStyle = 'border-left: 4px solid #ef4444;';
    } else if (status === 'pending' && hasTasksForShift) {
        statusBadge = `<span style="background: var(--bg-tertiary); color: var(--text-secondary); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;">
            ${completed}/${total} Done
        </span>`;
        statusStyle = 'border-left: 4px solid var(--border-color);';
    } else {
        statusBadge = `<span style="background: var(--bg-tertiary); color: var(--text-muted); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;">
            No Tasks
        </span>`;
        statusStyle = 'border-left: 4px solid var(--border-color); opacity: 0.7;';
    }

    return `
        <div onclick="openStoreDetail('${store.id}')" class="card"
             style="padding: 0; cursor: pointer; transition: all 0.2s; overflow: hidden; ${statusStyle}"
             onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)';"
             onmouseout="this.style.transform='none'; this.style.boxShadow='none';">

            <div style="padding: 20px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <!-- Store Icon -->
                    <div style="width: 48px; height: 48px; border-radius: 12px; background: ${store.gradient};
                                display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas ${store.icon}" style="color: white; font-size: 20px;"></i>
                    </div>

                    <!-- Store Info -->
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 700; font-size: 15px; color: var(--text-primary); margin-bottom: 4px;">
                            ${store.shortName}
                        </div>
                        ${statusBadge}
                    </div>

                    <!-- Arrow -->
                    <i class="fas fa-chevron-right" style="color: var(--text-muted); font-size: 14px;"></i>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// STORE DETAIL VIEW
// ============================================
function renderStoreDetailView() {
    const dashboard = document.querySelector('.dashboard');
    const store = INVENTORY_STORES.find(s => s.id === inventoryTasksSelectedStore);
    if (!store) return;

    // Get tasks specific to this store
    const shiftTasks = getTasksForStore(store.id, inventoryTasksCurrentShift);
    const shiftConfig = INVENTORY_SHIFTS[inventoryTasksCurrentShift];

    dashboard.innerHTML = `
        <div style="padding: 24px; max-width: 700px; margin: 0 auto;">

            <!-- Back Button & Header -->
            <div style="margin-bottom: 24px;">
                <button onclick="backToMainView()"
                        style="background: none; border: none; cursor: pointer; color: var(--text-muted);
                               font-size: 14px; padding: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"
                        onmouseover="this.style.color='var(--text-primary)'"
                        onmouseout="this.style.color='var(--text-muted)'">
                    <i class="fas fa-arrow-left"></i> Back to all stores
                </button>

                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 56px; height: 56px; border-radius: 14px; background: ${store.gradient};
                                display: flex; align-items: center; justify-content: center;">
                        <i class="fas ${store.icon}" style="color: white; font-size: 24px;"></i>
                    </div>
                    <div>
                        <h1 style="font-size: 24px; font-weight: 800; margin: 0; color: var(--text-primary);">
                            ${store.name}
                        </h1>
                        <p style="color: var(--text-muted); margin: 4px 0 0 0; font-size: 14px;">
                            ${formatDateLong(inventoryTasksSelectedDate)}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Shift Toggle -->
            <div class="card" style="padding: 6px; margin-bottom: 24px;">
                <div style="display: flex; gap: 6px;">
                    <button onclick="switchInventoryShift('opening'); renderStoreDetailView();"
                            style="flex: 1; padding: 14px; border-radius: 10px; border: none; cursor: pointer;
                                   font-weight: 600; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 10px;
                                   background: ${inventoryTasksCurrentShift === 'opening' ? '#f59e0b' : 'transparent'};
                                   color: ${inventoryTasksCurrentShift === 'opening' ? 'white' : 'var(--text-secondary)'};">
                        <i class="fas fa-sun"></i> AM Shift
                    </button>
                    <button onclick="switchInventoryShift('closing'); renderStoreDetailView();"
                            style="flex: 1; padding: 14px; border-radius: 10px; border: none; cursor: pointer;
                                   font-weight: 600; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 10px;
                                   background: ${inventoryTasksCurrentShift === 'closing' ? '#8b5cf6' : 'transparent'};
                                   color: ${inventoryTasksCurrentShift === 'closing' ? 'white' : 'var(--text-secondary)'};">
                        <i class="fas fa-moon"></i> PM Shift
                    </button>
                </div>
            </div>

            <!-- Tasks -->
            ${shiftTasks.length > 0 ? shiftTasks.map(task => {
                const completion = getStoreCompletion(store.id, inventoryTasksCurrentShift, task.id);
                const isCompleted = !!completion;

                return `
                    <div class="card" style="margin-bottom: 16px; padding: 24px; ${isCompleted ? 'border: 2px solid #10b981;' : ''}">

                        <!-- Task Header -->
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                            <div>
                                <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 6px 0; color: var(--text-primary);">
                                    ${task.category}
                                </h3>
                                <p style="color: var(--text-muted); margin: 0; font-size: 14px;">
                                    ${task.description || 'Count all items in this category'}
                                </p>
                            </div>
                            <div style="text-align: right; flex-shrink: 0; margin-left: 16px;">
                                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
                                    Deadline
                                </div>
                                <div style="font-weight: 700; color: ${shiftConfig.color}; font-size: 15px;">
                                    ${shiftConfig.deadlineLabel}
                                </div>
                            </div>
                        </div>

                        <!-- Completion Status -->
                        ${isCompleted ? `
                            <div style="background: rgba(16, 185, 129, 0.1); border-radius: 12px; padding: 16px;
                                        display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center; gap: 14px;">
                                    <div style="width: 44px; height: 44px; border-radius: 50%; background: #10b981;
                                                display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-check" style="color: white; font-size: 18px;"></i>
                                    </div>
                                    <div>
                                        <div style="font-weight: 600; color: #10b981; font-size: 14px;">Completed</div>
                                        <div style="font-size: 13px; color: var(--text-muted);">
                                            by ${completion.completedBy} at ${formatTime(completion.completedAt)}
                                        </div>
                                    </div>
                                </div>
                                <button onclick="undoInventoryCompletion('${completion.id}', '${task.id}')"
                                        style="background: transparent; border: 1px solid #10b981; color: #10b981;
                                               padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500;">
                                    Undo
                                </button>
                            </div>
                        ` : `
                            <button onclick="markInventoryComplete('${task.id}', '${store.id}')"
                                    style="width: 100%; background: #10b981; color: white; border: none; padding: 16px;
                                           border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 15px;
                                           display: flex; align-items: center; justify-content: center; gap: 10px;
                                           transition: all 0.2s;"
                                    onmouseover="this.style.background='#059669'"
                                    onmouseout="this.style.background='#10b981'">
                                <i class="fas fa-check-circle"></i> Mark as Completed
                            </button>
                        `}
                    </div>
                `;
            }).join('') : `
                <div class="card" style="padding: 48px; text-align: center;">
                    <i class="fas fa-clipboard-check" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                    <h3 style="color: var(--text-secondary); margin: 0 0 8px 0; font-size: 16px;">
                        No Tasks for ${shiftConfig.name}
                    </h3>
                    <p style="color: var(--text-muted); margin: 0 0 20px 0; font-size: 14px;">
                        There are no inventory tasks assigned for this shift.
                    </p>
                    ${canManageInventoryTasks() ? `
                        <button onclick="openCreateInventoryTaskModalForStore('${store.id}')"
                                style="background: var(--accent-primary); color: white; border: none; padding: 12px 24px;
                                       border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px;
                                       display: inline-flex; align-items: center; gap: 8px;">
                            <i class="fas fa-plus"></i> Create Task for ${store.shortName}
                        </button>
                    ` : ''}
                </div>
            `}
        </div>
    `;
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================
window.openStoreDetail = function(storeId) {
    inventoryTasksSelectedStore = storeId;
    inventoryTasksCurrentView = 'detail';
    renderInventoryTasksModule();
};

window.backToMainView = function() {
    inventoryTasksCurrentView = 'main';
    inventoryTasksSelectedStore = null;
    renderInventoryTasksModule();
};

window.switchInventoryShift = function(shift) {
    inventoryTasksCurrentShift = shift;
    if (inventoryTasksCurrentView === 'main') {
        renderMainView();
    }
};

window.inventoryTasksPrevDay = async function() {
    const date = new Date(inventoryTasksSelectedDate);
    date.setDate(date.getDate() - 1);
    inventoryTasksSelectedDate = date.toISOString().split('T')[0];
    await loadInventoryCompletions();
    renderInventoryTasksModule();
};

window.inventoryTasksNextDay = async function() {
    const date = new Date(inventoryTasksSelectedDate);
    date.setDate(date.getDate() + 1);
    inventoryTasksSelectedDate = date.toISOString().split('T')[0];
    await loadInventoryCompletions();
    renderInventoryTasksModule();
};

window.inventoryTasksGoToToday = async function() {
    inventoryTasksSelectedDate = new Date().toISOString().split('T')[0];
    await loadInventoryCompletions();
    renderInventoryTasksModule();
};

// ============================================
// CREATE TASK MODAL
// ============================================
window.openCreateInventoryTaskModal = function() {
    const modal = document.getElementById('modal');
    if (!modal) return;

    modal.innerHTML = `
        <style>
            .inv-modal-stores-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
            @media (max-width: 500px) {
                .inv-modal-stores-grid { grid-template-columns: 1fr; }
            }
        </style>
        <div class="modal-content" style="max-width: 480px;">
            <div class="modal-header">
                <h2 style="display: flex; align-items: center; gap: 10px; font-size: 18px;">
                    <i class="fas fa-plus-circle" style="color: var(--accent-primary);"></i>
                    New Inventory Task
                </h2>
                <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body" style="padding: 24px;">

                <div class="form-group">
                    <label style="font-weight: 600; margin-bottom: 8px; display: block; font-size: 14px;">
                        Category Name <span style="color: #ef4444;">*</span>
                    </label>
                    <input type="text" class="form-input" id="inv-task-category"
                           placeholder="e.g., Herbal Vaporizers" style="width: 100%;">
                </div>

                <div class="form-group" style="margin-top: 20px;">
                    <label style="font-weight: 600; margin-bottom: 8px; display: block; font-size: 14px;">
                        Description <span style="color: var(--text-muted); font-weight: 400;">(optional)</span>
                    </label>
                    <textarea class="form-input" id="inv-task-description" rows="3"
                              placeholder="e.g., Pax, Storz & Bickel, Puffco, Focus V, Yocan"
                              style="width: 100%; resize: vertical;"></textarea>
                </div>

                <div class="form-group" style="margin-top: 20px;">
                    <label style="font-weight: 600; margin-bottom: 10px; display: block; font-size: 14px;">Shift</label>
                    <div style="display: flex; gap: 12px;">
                        <label style="flex: 1; cursor: pointer;">
                            <input type="radio" name="inv-task-shift" value="opening" checked style="display: none;">
                            <div class="shift-option" style="padding: 14px; border: 2px solid #f59e0b; border-radius: 10px;
                                        background: rgba(245, 158, 11, 0.1); text-align: center;">
                                <i class="fas fa-sun" style="font-size: 20px; color: #f59e0b; margin-bottom: 6px; display: block;"></i>
                                <div style="font-weight: 600; font-size: 13px;">AM Shift</div>
                            </div>
                        </label>
                        <label style="flex: 1; cursor: pointer;">
                            <input type="radio" name="inv-task-shift" value="closing" style="display: none;">
                            <div class="shift-option" style="padding: 14px; border: 2px solid var(--border-color); border-radius: 10px;
                                        background: var(--bg-secondary); text-align: center;">
                                <i class="fas fa-moon" style="font-size: 20px; color: var(--text-muted); margin-bottom: 6px; display: block;"></i>
                                <div style="font-weight: 600; font-size: 13px;">PM Shift</div>
                            </div>
                        </label>
                    </div>
                </div>

                <div class="form-group" style="margin-top: 20px;">
                    <label style="font-weight: 600; margin-bottom: 10px; display: block; font-size: 14px;">Duration</label>
                    <div style="display: flex; gap: 12px;">
                        <label style="flex: 1; cursor: pointer;">
                            <input type="radio" name="inv-task-duration" value="recurring" checked style="display: none;">
                            <div class="duration-option" style="padding: 14px; border: 2px solid var(--accent-primary); border-radius: 10px;
                                        background: rgba(99, 102, 241, 0.1); text-align: center;">
                                <i class="fas fa-sync" style="font-size: 20px; color: var(--accent-primary); margin-bottom: 6px; display: block;"></i>
                                <div style="font-weight: 600; font-size: 13px;">Recurring</div>
                            </div>
                        </label>
                        <label style="flex: 1; cursor: pointer;">
                            <input type="radio" name="inv-task-duration" value="one-time" style="display: none;">
                            <div class="duration-option" style="padding: 14px; border: 2px solid var(--border-color); border-radius: 10px;
                                        background: var(--bg-secondary); text-align: center;">
                                <i class="fas fa-calendar-day" style="font-size: 20px; color: var(--text-muted); margin-bottom: 6px; display: block;"></i>
                                <div style="font-weight: 600; font-size: 13px;">Today Only</div>
                            </div>
                        </label>
                    </div>
                </div>

                <div class="form-group" style="margin-top: 20px;">
                    <label style="font-weight: 600; margin-bottom: 10px; display: block; font-size: 14px;">
                        Assign to Stores <span style="color: #ef4444;">*</span>
                    </label>
                    <div class="inv-modal-stores-grid">
                        ${INVENTORY_STORES.map(store => `
                            <label style="display: flex; align-items: center; gap: 10px; padding: 10px 12px;
                                          border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer;
                                          transition: all 0.2s;" class="store-checkbox-label"
                                   onmouseover="this.style.background='var(--bg-tertiary)'"
                                   onmouseout="if(!this.querySelector('input').checked) this.style.background='transparent'">
                                <input type="checkbox" name="inv-task-stores" value="${store.id}"
                                       style="width: 18px; height: 18px; accent-color: ${store.color};"
                                       onchange="updateStoreCheckboxStyle(this)">
                                <div style="width: 28px; height: 28px; border-radius: 6px; background: ${store.gradient};
                                            display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <i class="fas ${store.icon}" style="color: white; font-size: 12px;"></i>
                                </div>
                                <span style="font-size: 13px; font-weight: 500;">${store.shortName}</span>
                            </label>
                        `).join('')}
                    </div>
                    <button type="button" onclick="selectAllStores()"
                            style="margin-top: 10px; background: none; border: none; color: var(--accent-primary);
                                   cursor: pointer; font-size: 13px; font-weight: 500; padding: 0;">
                        <i class="fas fa-check-double"></i> Select All
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="saveInventoryTask()">
                    <i class="fas fa-plus"></i> Create Task
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');
    setupModalRadioListeners();
};

window.updateStoreCheckboxStyle = function(checkbox) {
    const label = checkbox.closest('.store-checkbox-label');
    if (checkbox.checked) {
        label.style.background = 'var(--bg-tertiary)';
        label.style.borderColor = 'var(--accent-primary)';
    } else {
        label.style.background = 'transparent';
        label.style.borderColor = 'var(--border-color)';
    }
};

window.selectAllStores = function() {
    document.querySelectorAll('input[name="inv-task-stores"]').forEach(cb => {
        cb.checked = true;
        updateStoreCheckboxStyle(cb);
    });
};

window.openCreateInventoryTaskModalForStore = function(storeId) {
    // Open the regular modal first
    openCreateInventoryTaskModal();

    // Then pre-select just this store after a small delay to ensure DOM is ready
    setTimeout(() => {
        const checkbox = document.querySelector(`input[name="inv-task-stores"][value="${storeId}"]`);
        if (checkbox) {
            checkbox.checked = true;
            updateStoreCheckboxStyle(checkbox);
        }
    }, 50);
};

function setupModalRadioListeners() {
    document.querySelectorAll('input[name="inv-task-shift"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('input[name="inv-task-shift"]').forEach(r => {
                const opt = r.closest('label').querySelector('.shift-option');
                if (r.checked) {
                    const color = r.value === 'opening' ? '#f59e0b' : '#8b5cf6';
                    opt.style.borderColor = color;
                    opt.style.background = r.value === 'opening' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(139, 92, 246, 0.1)';
                    opt.querySelector('i').style.color = color;
                } else {
                    opt.style.borderColor = 'var(--border-color)';
                    opt.style.background = 'var(--bg-secondary)';
                    opt.querySelector('i').style.color = 'var(--text-muted)';
                }
            });
        });
    });

    document.querySelectorAll('input[name="inv-task-duration"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('input[name="inv-task-duration"]').forEach(r => {
                const opt = r.closest('label').querySelector('.duration-option');
                if (r.checked) {
                    opt.style.borderColor = 'var(--accent-primary)';
                    opt.style.background = 'rgba(99, 102, 241, 0.1)';
                    opt.querySelector('i').style.color = 'var(--accent-primary)';
                } else {
                    opt.style.borderColor = 'var(--border-color)';
                    opt.style.background = 'var(--bg-secondary)';
                    opt.querySelector('i').style.color = 'var(--text-muted)';
                }
            });
        });
    });
}

// ============================================
// FIREBASE OPERATIONS
// ============================================
window.saveInventoryTask = async function() {
    const category = document.getElementById('inv-task-category')?.value?.trim();
    const description = document.getElementById('inv-task-description')?.value?.trim();
    const shift = document.querySelector('input[name="inv-task-shift"]:checked')?.value;
    const duration = document.querySelector('input[name="inv-task-duration"]:checked')?.value;

    // Get selected stores
    const selectedStores = Array.from(document.querySelectorAll('input[name="inv-task-stores"]:checked')).map(cb => cb.value);

    if (!category) {
        if (typeof showNotification === 'function') showNotification('Please enter a category name', 'error');
        return;
    }

    if (selectedStores.length === 0) {
        if (typeof showNotification === 'function') showNotification('Please select at least one store', 'error');
        return;
    }

    try {
        const db = firebase.firestore();
        const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

        const taskData = {
            category,
            description: description || '',
            shift: shift || 'opening',
            duration: duration || 'recurring',
            stores: selectedStores,
            active: true,
            createdDate: inventoryTasksSelectedDate,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: user?.name || 'Unknown'
        };

        const docRef = await db.collection('inventoryTasks').add(taskData);
        taskData.id = docRef.id;
        inventoryTasksData.tasks.unshift(taskData);

        if (typeof logActivity === 'function') {
            await logActivity('inventory_task_create', {
                message: `Created inventory task: ${category}`,
                taskId: docRef.id,
                category,
                shift
            }, 'inventory', docRef.id);
        }

        if (typeof closeModal === 'function') closeModal();
        if (typeof showNotification === 'function') showNotification('Task created successfully!', 'success');
        renderInventoryTasksModule();
    } catch (error) {
        console.error('[InventoryTasks] Error saving task:', error);
        if (typeof showNotification === 'function') showNotification('Error creating task', 'error');
    }
};

window.deleteInventoryTask = async function(taskId) {
    if (!confirm('Delete this task?')) return;

    try {
        const db = firebase.firestore();
        await db.collection('inventoryTasks').doc(taskId).update({ active: false });
        inventoryTasksData.tasks = inventoryTasksData.tasks.filter(t => t.id !== taskId);
        if (typeof showNotification === 'function') showNotification('Task deleted', 'success');
        renderInventoryTasksModule();
    } catch (error) {
        console.error('[InventoryTasks] Error deleting task:', error);
        if (typeof showNotification === 'function') showNotification('Error deleting task', 'error');
    }
};

window.editInventoryTask = function(taskId) {
    const task = inventoryTasksData.tasks.find(t => t.id === taskId);
    if (!task) return;

    const modal = document.getElementById('modal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 480px;">
            <div class="modal-header">
                <h2 style="display: flex; align-items: center; gap: 10px; font-size: 18px;">
                    <i class="fas fa-pen" style="color: var(--accent-primary);"></i>
                    Edit Task
                </h2>
                <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body" style="padding: 24px;">
                <input type="hidden" id="edit-inv-task-id" value="${taskId}">

                <div class="form-group">
                    <label style="font-weight: 600; margin-bottom: 8px; display: block; font-size: 14px;">Category Name</label>
                    <input type="text" class="form-input" id="edit-inv-task-category" value="${task.category}" style="width: 100%;">
                </div>

                <div class="form-group" style="margin-top: 20px;">
                    <label style="font-weight: 600; margin-bottom: 8px; display: block; font-size: 14px;">Description</label>
                    <textarea class="form-input" id="edit-inv-task-description" rows="3" style="width: 100%;">${task.description || ''}</textarea>
                </div>

                <div class="form-group" style="margin-top: 20px;">
                    <label style="font-weight: 600; margin-bottom: 10px; display: block; font-size: 14px;">Shift</label>
                    <div style="display: flex; gap: 12px;">
                        <label style="flex: 1; cursor: pointer;">
                            <input type="radio" name="edit-inv-task-shift" value="opening" ${task.shift === 'opening' ? 'checked' : ''} style="display: none;">
                            <div class="shift-option" style="padding: 14px; border: 2px solid ${task.shift === 'opening' ? '#f59e0b' : 'var(--border-color)'};
                                        border-radius: 10px; background: ${task.shift === 'opening' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)'}; text-align: center;">
                                <i class="fas fa-sun" style="font-size: 20px; color: ${task.shift === 'opening' ? '#f59e0b' : 'var(--text-muted)'}; margin-bottom: 6px; display: block;"></i>
                                <div style="font-weight: 600; font-size: 13px;">AM Shift</div>
                            </div>
                        </label>
                        <label style="flex: 1; cursor: pointer;">
                            <input type="radio" name="edit-inv-task-shift" value="closing" ${task.shift === 'closing' ? 'checked' : ''} style="display: none;">
                            <div class="shift-option" style="padding: 14px; border: 2px solid ${task.shift === 'closing' ? '#8b5cf6' : 'var(--border-color)'};
                                        border-radius: 10px; background: ${task.shift === 'closing' ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-secondary)'}; text-align: center;">
                                <i class="fas fa-moon" style="font-size: 20px; color: ${task.shift === 'closing' ? '#8b5cf6' : 'var(--text-muted)'}; margin-bottom: 6px; display: block;"></i>
                                <div style="font-weight: 600; font-size: 13px;">PM Shift</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="updateInventoryTask()">
                    <i class="fas fa-save"></i> Save
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');

    document.querySelectorAll('input[name="edit-inv-task-shift"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('input[name="edit-inv-task-shift"]').forEach(r => {
                const opt = r.closest('label').querySelector('.shift-option');
                if (r.checked) {
                    const color = r.value === 'opening' ? '#f59e0b' : '#8b5cf6';
                    opt.style.borderColor = color;
                    opt.style.background = r.value === 'opening' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(139, 92, 246, 0.1)';
                    opt.querySelector('i').style.color = color;
                } else {
                    opt.style.borderColor = 'var(--border-color)';
                    opt.style.background = 'var(--bg-secondary)';
                    opt.querySelector('i').style.color = 'var(--text-muted)';
                }
            });
        });
    });
};

window.updateInventoryTask = async function() {
    const taskId = document.getElementById('edit-inv-task-id')?.value;
    const category = document.getElementById('edit-inv-task-category')?.value?.trim();
    const description = document.getElementById('edit-inv-task-description')?.value?.trim();
    const shift = document.querySelector('input[name="edit-inv-task-shift"]:checked')?.value;

    if (!taskId || !category) {
        if (typeof showNotification === 'function') showNotification('Please enter a category name', 'error');
        return;
    }

    try {
        const db = firebase.firestore();
        await db.collection('inventoryTasks').doc(taskId).update({
            category, description: description || '', shift,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        const idx = inventoryTasksData.tasks.findIndex(t => t.id === taskId);
        if (idx >= 0) {
            inventoryTasksData.tasks[idx] = { ...inventoryTasksData.tasks[idx], category, description, shift };
        }

        if (typeof closeModal === 'function') closeModal();
        if (typeof showNotification === 'function') showNotification('Task updated!', 'success');
        renderInventoryTasksModule();
    } catch (error) {
        console.error('[InventoryTasks] Error updating task:', error);
        if (typeof showNotification === 'function') showNotification('Error updating task', 'error');
    }
};

window.markInventoryComplete = async function(taskId, storeId) {
    try {
        const db = firebase.firestore();
        const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

        const completionData = {
            taskId, store: storeId, shift: inventoryTasksCurrentShift,
            date: inventoryTasksSelectedDate, completedBy: user?.name || 'Unknown',
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('inventoryCompletions').add(completionData);
        completionData.id = docRef.id;
        completionData.completedAt = new Date();
        inventoryTasksData.completions.push(completionData);

        if (typeof logActivity === 'function') {
            const task = inventoryTasksData.tasks.find(t => t.id === taskId);
            await logActivity('inventory_complete', {
                message: `Completed inventory: ${task?.category || taskId} at ${storeId}`,
                taskId, store: storeId, shift: inventoryTasksCurrentShift, date: inventoryTasksSelectedDate
            }, 'inventory', docRef.id);
        }

        if (typeof showNotification === 'function') showNotification('Marked as complete!', 'success');
        renderStoreDetailView();
    } catch (error) {
        console.error('[InventoryTasks] Error:', error);
        if (typeof showNotification === 'function') showNotification('Error saving', 'error');
    }
};

window.undoInventoryCompletion = async function(completionId, taskId) {
    try {
        const db = firebase.firestore();
        await db.collection('inventoryCompletions').doc(completionId).delete();
        inventoryTasksData.completions = inventoryTasksData.completions.filter(c => c.id !== completionId);
        if (typeof showNotification === 'function') showNotification('Undone', 'info');
        renderStoreDetailView();
    } catch (error) {
        console.error('[InventoryTasks] Error:', error);
        if (typeof showNotification === 'function') showNotification('Error', 'error');
    }
};

// ============================================
// EXPOSE FUNCTIONS GLOBALLY
// ============================================
window.initializeInventoryTasks = initializeInventoryTasks;
window.renderInventoryTasksModule = renderInventoryTasksModule;

console.log('[InventoryTasks] Module loaded');
