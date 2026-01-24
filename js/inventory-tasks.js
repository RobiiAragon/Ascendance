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

// Store configuration
const INVENTORY_STORES = [
    { id: 'Miramar', name: 'MIRAMAR VSU', shortName: 'MIRAMAR' },
    { id: 'Kearny Mesa', name: 'KEARNY MESA', shortName: 'KEARNY MESA' },
    { id: 'Chula Vista', name: 'CHULA VISTA', shortName: 'CHULA VISTA' },
    { id: 'North Park', name: 'NORTH PARK', shortName: 'NORTH PARK' },
    { id: 'Morena', name: 'MORENA BLVD', shortName: 'MORENA BLVD' },
    { id: 'Loyal Vaper', name: 'LOYAL VSU', shortName: 'LOYAL VSU' },
    { id: 'Miramar Wine & Liquor', name: 'MMWL', shortName: 'MMWL' }
];

// Shift configuration
const INVENTORY_SHIFTS = {
    opening: {
        name: 'AM Shift',
        icon: 'fa-sun',
        color: '#f59e0b',
        deadline: '14:00'
    },
    closing: {
        name: 'PM Shift',
        icon: 'fa-moon',
        color: '#8b5cf6',
        deadline: '21:00'
    }
};

// ============================================
// INITIALIZATION
// ============================================
async function initializeInventoryTasks() {
    console.log('[InventoryTasks] Initializing module...');

    // Load data from Firebase
    await loadInventoryTasks();
    await loadInventoryCompletions();

    // Render the module
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

        inventoryTasksData.tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`[InventoryTasks] Loaded ${inventoryTasksData.tasks.length} tasks`);
    } catch (error) {
        console.error('[InventoryTasks] Error loading tasks:', error);
        inventoryTasksData.tasks = [];
    }
}

async function loadInventoryCompletions() {
    try {
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.error('[InventoryTasks] Firebase not initialized');
            return;
        }

        const db = firebase.firestore();
        const snapshot = await db.collection('inventoryCompletions')
            .where('date', '==', inventoryTasksSelectedDate)
            .get();

        inventoryTasksData.completions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`[InventoryTasks] Loaded ${inventoryTasksData.completions.length} completions for ${inventoryTasksSelectedDate}`);
    } catch (error) {
        console.error('[InventoryTasks] Error loading completions:', error);
        inventoryTasksData.completions = [];
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getTasksForShift(shift) {
    const today = inventoryTasksSelectedDate;
    return inventoryTasksData.tasks.filter(task => {
        // Check shift
        if (task.shift !== shift) return false;

        // Check duration
        if (task.duration === 'one-time' && task.createdDate !== today) return false;

        return true;
    });
}

function getStoreCompletion(store, shift, taskId) {
    return inventoryTasksData.completions.find(c =>
        c.store === store &&
        c.shift === shift &&
        c.taskId === taskId &&
        c.date === inventoryTasksSelectedDate
    );
}

function getStoreStatus(store, shift) {
    const tasks = getTasksForShift(shift);
    if (tasks.length === 0) return 'no-tasks';

    const completedCount = tasks.filter(task => {
        const completion = getStoreCompletion(store, shift, task.id);
        return completion !== undefined;
    }).length;

    if (completedCount === tasks.length) return 'completed';

    // Check if past deadline
    const now = new Date();
    const shiftConfig = INVENTORY_SHIFTS[shift];
    const [deadlineHour, deadlineMin] = shiftConfig.deadline.split(':').map(Number);
    const deadline = new Date();
    deadline.setHours(deadlineHour, deadlineMin, 0, 0);

    const isToday = inventoryTasksSelectedDate === new Date().toISOString().split('T')[0];
    if (isToday && now > deadline && completedCount < tasks.length) {
        return 'missed';
    }

    return 'pending';
}

function canManageInventoryTasks() {
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (!user) return false;
    return user.role === 'admin' || user.role === 'manager';
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
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
// MAIN VIEW (Store Grid)
// ============================================
function renderMainView() {
    const dashboard = document.querySelector('.dashboard');
    const canManage = canManageInventoryTasks();
    const isToday = inventoryTasksSelectedDate === new Date().toISOString().split('T')[0];

    // Get tasks for current shift
    const shiftTasks = getTasksForShift(inventoryTasksCurrentShift);
    const currentTask = shiftTasks[0]; // Show first task in header

    dashboard.innerHTML = `
        <div style="padding: 24px; max-width: 1400px; margin: 0 auto;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h1 style="font-size: 28px; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-clipboard-check" style="color: #7c3aed;"></i>
                        Inventory Tasks
                    </h1>
                    <p style="color: var(--text-muted); margin-top: 4px;">Daily inventory counts by store and shift</p>
                </div>

                <div style="display: flex; gap: 12px; align-items: center;">
                    <!-- Date Navigation -->
                    <div style="display: flex; align-items: center; gap: 8px; background: var(--bg-secondary); padding: 8px 16px; border-radius: 12px;">
                        <button onclick="inventoryTasksPrevDay()" style="background: none; border: none; cursor: pointer; padding: 4px 8px; color: var(--text-secondary);">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <span style="font-weight: 600; min-width: 180px; text-align: center;">
                            ${formatDate(inventoryTasksSelectedDate)}
                        </span>
                        <button onclick="inventoryTasksNextDay()" style="background: none; border: none; cursor: pointer; padding: 4px 8px; color: var(--text-secondary);">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        ${!isToday ? `
                            <button onclick="inventoryTasksGoToToday()" style="background: var(--accent-primary); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; margin-left: 8px;">
                                Today
                            </button>
                        ` : ''}
                    </div>

                    ${canManage ? `
                        <button onclick="openCreateInventoryTaskModal()" style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; border: none; padding: 12px 20px; border-radius: 12px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                            <i class="fas fa-plus"></i> Create Task
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- Today's Task Info -->
            ${currentTask ? `
                <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(124, 58, 237, 0.3);">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <span style="background: #7c3aed; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                            ${INVENTORY_SHIFTS[inventoryTasksCurrentShift].name.toUpperCase()}
                        </span>
                        <span style="color: var(--text-muted); font-size: 14px;">
                            Deadline: ${INVENTORY_SHIFTS[inventoryTasksCurrentShift].deadline.replace(':', ':')}
                            ${inventoryTasksCurrentShift === 'opening' ? 'PM' : 'PM'}
                        </span>
                    </div>
                    <h2 style="font-size: 24px; font-weight: 700; color: white; margin: 0 0 8px 0;">
                        Today: ${currentTask.category}
                    </h2>
                    <p style="color: #a5b4fc; margin: 0; font-size: 15px;">
                        ${currentTask.description}
                    </p>
                </div>
            ` : `
                <div style="background: var(--bg-secondary); border-radius: 16px; padding: 32px; margin-bottom: 24px; text-align: center; border: 2px dashed var(--border-color);">
                    <i class="fas fa-clipboard-list" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                    <h3 style="color: var(--text-secondary); margin: 0 0 8px 0;">No tasks for ${INVENTORY_SHIFTS[inventoryTasksCurrentShift].name}</h3>
                    <p style="color: var(--text-muted); margin: 0;">
                        ${canManage ? 'Click "Create Task" to add an inventory task for this shift.' : 'No inventory tasks have been assigned for this shift.'}
                    </p>
                </div>
            `}

            <!-- Shift Toggle -->
            <div style="display: flex; gap: 12px; margin-bottom: 24px;">
                <button onclick="switchInventoryShift('opening')"
                        style="flex: 1; padding: 16px; border-radius: 12px; border: 3px solid ${inventoryTasksCurrentShift === 'opening' ? '#f59e0b' : 'var(--border-color)'};
                               background: ${inventoryTasksCurrentShift === 'opening' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)'};
                               cursor: pointer; transition: all 0.2s;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
                        <i class="fas fa-sun" style="font-size: 24px; color: ${inventoryTasksCurrentShift === 'opening' ? '#f59e0b' : 'var(--text-muted)'};"></i>
                        <div style="text-align: left;">
                            <div style="font-weight: 700; color: ${inventoryTasksCurrentShift === 'opening' ? '#f59e0b' : 'var(--text-primary)'};">AM SHIFT</div>
                            <div style="font-size: 12px; color: var(--text-muted);">09:00 - 14:00</div>
                        </div>
                    </div>
                </button>
                <button onclick="switchInventoryShift('closing')"
                        style="flex: 1; padding: 16px; border-radius: 12px; border: 3px solid ${inventoryTasksCurrentShift === 'closing' ? '#8b5cf6' : 'var(--border-color)'};
                               background: ${inventoryTasksCurrentShift === 'closing' ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-secondary)'};
                               cursor: pointer; transition: all 0.2s;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
                        <i class="fas fa-moon" style="font-size: 24px; color: ${inventoryTasksCurrentShift === 'closing' ? '#8b5cf6' : 'var(--text-muted)'};"></i>
                        <div style="text-align: left;">
                            <div style="font-weight: 700; color: ${inventoryTasksCurrentShift === 'closing' ? '#8b5cf6' : 'var(--text-primary)'};">PM SHIFT</div>
                            <div style="font-size: 12px; color: var(--text-muted);">14:00 - 22:00</div>
                        </div>
                    </div>
                </button>
            </div>

            <!-- Store Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px;">
                ${INVENTORY_STORES.map(store => renderStoreCard(store)).join('')}
            </div>

            <!-- Task List for Admins -->
            ${canManage && shiftTasks.length > 0 ? `
                <div style="margin-top: 32px;">
                    <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-list" style="color: var(--accent-primary);"></i>
                        Active Tasks for ${INVENTORY_SHIFTS[inventoryTasksCurrentShift].name}
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${shiftTasks.map(task => `
                            <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 600; margin-bottom: 4px;">${task.category}</div>
                                    <div style="font-size: 13px; color: var(--text-muted);">${task.description}</div>
                                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                                        ${task.duration === 'one-time' ? '<span style="color: #f59e0b;">One-time</span>' : '<span style="color: #10b981;">Recurring</span>'}
                                        &bull; Created by ${task.createdBy || 'Unknown'}
                                    </div>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button onclick="editInventoryTask('${task.id}')" style="background: none; border: none; cursor: pointer; padding: 8px; color: var(--text-muted);" title="Edit">
                                        <i class="fas fa-pen"></i>
                                    </button>
                                    <button onclick="deleteInventoryTask('${task.id}')" style="background: none; border: none; cursor: pointer; padding: 8px; color: #ef4444;" title="Delete">
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
    const status = getStoreStatus(store.id, inventoryTasksCurrentShift);
    const amStatus = getStoreStatus(store.id, 'opening');
    const pmStatus = getStoreStatus(store.id, 'closing');

    // Status styling
    let statusIcon = '';
    let statusColor = '#7c3aed';
    let bgGradient = 'linear-gradient(135deg, #7c3aed, #6d28d9)';

    if (status === 'completed') {
        statusIcon = '<i class="fas fa-check" style="font-size: 48px; color: #86efac; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"></i>';
        bgGradient = 'linear-gradient(135deg, #7c3aed, #6d28d9)';
    } else if (status === 'missed') {
        statusIcon = '<i class="fas fa-times" style="font-size: 48px; color: #fca5a5; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"></i>';
        bgGradient = 'linear-gradient(135deg, #7c3aed, #6d28d9)';
    } else if (status === 'no-tasks') {
        statusIcon = '';
    }

    // Status dot helper
    const getStatusDot = (s) => {
        if (s === 'completed') return '<span style="width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></span>';
        if (s === 'missed') return '<span style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></span>';
        return '<span style="width: 10px; height: 10px; border-radius: 50%; background: var(--text-muted); opacity: 0.5;"></span>';
    };

    return `
        <div onclick="openStoreDetail('${store.id}')"
             style="background: ${bgGradient}; border-radius: 20px; padding: 24px; cursor: pointer;
                    transition: all 0.3s; min-height: 160px; display: flex; flex-direction: column;
                    justify-content: space-between; position: relative; overflow: hidden;
                    box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3);"
             onmouseover="this.style.transform='translateY(-4px) scale(1.02)'; this.style.boxShadow='0 12px 30px rgba(124, 58, 237, 0.4)';"
             onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 20px rgba(124, 58, 237, 0.3)';">

            <!-- Status Icon -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.9;">
                ${statusIcon}
            </div>

            <!-- Store Name -->
            <div style="position: relative; z-index: 1;">
                <div style="font-weight: 800; font-size: 16px; color: white; text-align: center; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    ${store.shortName}
                </div>
            </div>

            <!-- Shift Status Indicators -->
            <div style="display: flex; justify-content: center; gap: 16px; position: relative; z-index: 1;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 11px; color: rgba(255,255,255,0.8);">AM</span>
                    ${getStatusDot(amStatus)}
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 11px; color: rgba(255,255,255,0.8);">PM</span>
                    ${getStatusDot(pmStatus)}
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

    const shiftTasks = getTasksForShift(inventoryTasksCurrentShift);
    const shiftConfig = INVENTORY_SHIFTS[inventoryTasksCurrentShift];
    const isToday = inventoryTasksSelectedDate === new Date().toISOString().split('T')[0];

    dashboard.innerHTML = `
        <div style="padding: 24px; max-width: 800px; margin: 0 auto;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <button onclick="backToMainView()" style="background: var(--bg-secondary); border: none; padding: 12px; border-radius: 12px; cursor: pointer; color: var(--text-primary);">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <h1 style="font-size: 24px; font-weight: 800; margin: 0;">
                            ${store.name}
                        </h1>
                        <p style="color: var(--text-muted); margin-top: 4px;">Inventory Count</p>
                    </div>
                </div>

                <!-- Date -->
                <div style="display: flex; align-items: center; gap: 8px; background: var(--bg-secondary); padding: 8px 16px; border-radius: 12px;">
                    <i class="fas fa-calendar"></i>
                    <span style="font-weight: 600;">${formatDate(inventoryTasksSelectedDate)}</span>
                </div>
            </div>

            <!-- Shift Toggle -->
            <div style="display: flex; gap: 12px; margin-bottom: 24px;">
                <button onclick="switchInventoryShift('opening'); renderStoreDetailView();"
                        style="flex: 1; padding: 16px; border-radius: 12px; border: 3px solid ${inventoryTasksCurrentShift === 'opening' ? '#f59e0b' : 'var(--border-color)'};
                               background: ${inventoryTasksCurrentShift === 'opening' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)'};
                               cursor: pointer; transition: all 0.2s;">
                    <i class="fas fa-sun" style="color: ${inventoryTasksCurrentShift === 'opening' ? '#f59e0b' : 'var(--text-muted)'}; margin-right: 8px;"></i>
                    <span style="font-weight: 600; color: ${inventoryTasksCurrentShift === 'opening' ? '#f59e0b' : 'var(--text-primary)'};">AM Shift</span>
                </button>
                <button onclick="switchInventoryShift('closing'); renderStoreDetailView();"
                        style="flex: 1; padding: 16px; border-radius: 12px; border: 3px solid ${inventoryTasksCurrentShift === 'closing' ? '#8b5cf6' : 'var(--border-color)'};
                               background: ${inventoryTasksCurrentShift === 'closing' ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-secondary)'};
                               cursor: pointer; transition: all 0.2s;">
                    <i class="fas fa-moon" style="color: ${inventoryTasksCurrentShift === 'closing' ? '#8b5cf6' : 'var(--text-muted)'}; margin-right: 8px;"></i>
                    <span style="font-weight: 600; color: ${inventoryTasksCurrentShift === 'closing' ? '#8b5cf6' : 'var(--text-primary)'};">PM Shift</span>
                </button>
            </div>

            <!-- Tasks -->
            ${shiftTasks.length > 0 ? shiftTasks.map(task => {
                const completion = getStoreCompletion(store.id, inventoryTasksCurrentShift, task.id);
                const isCompleted = !!completion;

                return `
                    <div style="background: var(--bg-secondary); border-radius: 16px; padding: 24px; margin-bottom: 16px; border-left: 4px solid ${isCompleted ? '#10b981' : shiftConfig.color};">
                        <!-- Task Header -->
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                            <div>
                                <h3 style="font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">${task.category}</h3>
                                <p style="color: var(--text-muted); margin: 0;">${task.description}</p>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 12px; color: var(--text-muted);">Deadline</div>
                                <div style="font-weight: 600; color: ${shiftConfig.color};">${shiftConfig.deadline.replace(':', ':')} ${inventoryTasksCurrentShift === 'opening' ? 'PM' : 'PM'}</div>
                            </div>
                        </div>

                        <!-- Instructions -->
                        <div style="background: var(--bg-tertiary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                            <div style="font-size: 13px; color: var(--text-secondary);">
                                <i class="fas fa-info-circle" style="margin-right: 8px; color: var(--accent-primary);"></i>
                                Count all items in this category and mark complete when done. Report any discrepancies to your manager.
                            </div>
                        </div>

                        <!-- Completion Status / Button -->
                        ${isCompleted ? `
                            <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(16, 185, 129, 0.1); border-radius: 12px; padding: 16px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="width: 48px; height: 48px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-check" style="color: white; font-size: 20px;"></i>
                                    </div>
                                    <div>
                                        <div style="font-weight: 600; color: #10b981;">Completed</div>
                                        <div style="font-size: 13px; color: var(--text-muted);">
                                            ${completion.completedBy} &bull; ${formatTime(completion.completedAt)}
                                        </div>
                                    </div>
                                </div>
                                <button onclick="undoInventoryCompletion('${completion.id}', '${task.id}')"
                                        style="background: none; border: 1px solid #10b981; color: #10b981; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px;">
                                    <i class="fas fa-undo"></i> Undo
                                </button>
                            </div>
                        ` : `
                            <button onclick="markInventoryComplete('${task.id}', '${store.id}')"
                                    style="width: 100%; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none;
                                           padding: 16px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 16px;
                                           display: flex; align-items: center; justify-content: center; gap: 8px;
                                           box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                <i class="fas fa-check-circle"></i> Mark as Completed
                            </button>
                        `}
                    </div>
                `;
            }).join('') : `
                <div style="background: var(--bg-secondary); border-radius: 16px; padding: 48px; text-align: center;">
                    <i class="fas fa-clipboard-list" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                    <h3 style="color: var(--text-secondary); margin: 0 0 8px 0;">No Tasks Assigned</h3>
                    <p style="color: var(--text-muted); margin: 0;">There are no inventory tasks for the ${shiftConfig.name} today.</p>
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
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2 style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-plus-circle" style="color: #7c3aed;"></i>
                    Create Inventory Task
                </h2>
                <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <!-- Category Name -->
                <div class="form-group">
                    <label style="font-weight: 600; margin-bottom: 8px; display: block;">Category Name *</label>
                    <input type="text" class="form-input" id="inv-task-category"
                           placeholder="e.g., Herbal Vaporizers" style="width: 100%;">
                </div>

                <!-- Description -->
                <div class="form-group" style="margin-top: 16px;">
                    <label style="font-weight: 600; margin-bottom: 8px; display: block;">Description (brands/items to count)</label>
                    <textarea class="form-input" id="inv-task-description" rows="3"
                              placeholder="e.g., Pax, Storz & Bickel, Puffco, Focus V, Yocan, Lookah" style="width: 100%; resize: vertical;"></textarea>
                </div>

                <!-- Shift Selection -->
                <div class="form-group" style="margin-top: 16px;">
                    <label style="font-weight: 600; margin-bottom: 8px; display: block;">Shift *</label>
                    <div style="display: flex; gap: 12px;">
                        <label style="flex: 1; cursor: pointer;">
                            <input type="radio" name="inv-task-shift" value="opening" checked style="display: none;">
                            <div class="shift-option" style="padding: 16px; border: 2px solid #f59e0b; border-radius: 12px; background: rgba(245, 158, 11, 0.1); text-align: center; transition: all 0.2s;">
                                <i class="fas fa-sun" style="font-size: 24px; color: #f59e0b; margin-bottom: 8px; display: block;"></i>
                                <div style="font-weight: 600;">AM Shift</div>
                                <div style="font-size: 11px; color: var(--text-muted);">Opening</div>
                            </div>
                        </label>
                        <label style="flex: 1; cursor: pointer;">
                            <input type="radio" name="inv-task-shift" value="closing" style="display: none;">
                            <div class="shift-option" style="padding: 16px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); text-align: center; transition: all 0.2s;">
                                <i class="fas fa-moon" style="font-size: 24px; color: var(--text-muted); margin-bottom: 8px; display: block;"></i>
                                <div style="font-weight: 600;">PM Shift</div>
                                <div style="font-size: 11px; color: var(--text-muted);">Closing</div>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Duration -->
                <div class="form-group" style="margin-top: 16px;">
                    <label style="font-weight: 600; margin-bottom: 8px; display: block;">Duration *</label>
                    <div style="display: flex; gap: 12px;">
                        <label style="flex: 1; cursor: pointer;">
                            <input type="radio" name="inv-task-duration" value="recurring" checked style="display: none;">
                            <div class="duration-option" style="padding: 16px; border: 2px solid var(--accent-primary); border-radius: 12px; background: rgba(99, 102, 241, 0.1); text-align: center; transition: all 0.2s;">
                                <i class="fas fa-infinity" style="font-size: 24px; color: var(--accent-primary); margin-bottom: 8px; display: block;"></i>
                                <div style="font-weight: 600;">Daily</div>
                                <div style="font-size: 11px; color: var(--text-muted);">Recurring</div>
                            </div>
                        </label>
                        <label style="flex: 1; cursor: pointer;">
                            <input type="radio" name="inv-task-duration" value="one-time" style="display: none;">
                            <div class="duration-option" style="padding: 16px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); text-align: center; transition: all 0.2s;">
                                <i class="fas fa-calendar-day" style="font-size: 24px; color: var(--text-muted); margin-bottom: 8px; display: block;"></i>
                                <div style="font-weight: 600;">One-time</div>
                                <div style="font-size: 11px; color: var(--text-muted);">Today only</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="saveInventoryTask()" style="background: linear-gradient(135deg, #7c3aed, #6d28d9);">
                    <i class="fas fa-plus"></i> Create Task
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');

    // Add event listeners for radio buttons
    setupModalRadioListeners();
};

function setupModalRadioListeners() {
    // Shift options
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

    // Duration options
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

    if (!category) {
        if (typeof showNotification === 'function') {
            showNotification('Please enter a category name', 'error');
        }
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
            stores: 'all',
            active: true,
            createdDate: inventoryTasksSelectedDate,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: user?.name || 'Unknown'
        };

        const docRef = await db.collection('inventoryTasks').add(taskData);
        console.log('[InventoryTasks] Task created:', docRef.id);

        // Add to local data
        taskData.id = docRef.id;
        inventoryTasksData.tasks.unshift(taskData);

        // Log activity
        if (typeof logActivity === 'function') {
            await logActivity('inventory_task_create', {
                message: `Created inventory task: ${category}`,
                taskId: docRef.id,
                category: category,
                shift: shift
            }, 'inventory', docRef.id);
        }

        if (typeof closeModal === 'function') closeModal();
        if (typeof showNotification === 'function') {
            showNotification('Inventory task created successfully!', 'success');
        }

        renderInventoryTasksModule();
    } catch (error) {
        console.error('[InventoryTasks] Error saving task:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error creating task. Please try again.', 'error');
        }
    }
};

window.deleteInventoryTask = async function(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const db = firebase.firestore();
        await db.collection('inventoryTasks').doc(taskId).update({ active: false });

        // Remove from local data
        inventoryTasksData.tasks = inventoryTasksData.tasks.filter(t => t.id !== taskId);

        if (typeof showNotification === 'function') {
            showNotification('Task deleted successfully', 'success');
        }

        renderInventoryTasksModule();
    } catch (error) {
        console.error('[InventoryTasks] Error deleting task:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error deleting task', 'error');
        }
    }
};

window.editInventoryTask = function(taskId) {
    const task = inventoryTasksData.tasks.find(t => t.id === taskId);
    if (!task) return;

    const modal = document.getElementById('modal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2 style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-pen" style="color: #7c3aed;"></i>
                    Edit Inventory Task
                </h2>
                <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="edit-inv-task-id" value="${taskId}">

                <!-- Category Name -->
                <div class="form-group">
                    <label style="font-weight: 600; margin-bottom: 8px; display: block;">Category Name *</label>
                    <input type="text" class="form-input" id="edit-inv-task-category"
                           value="${task.category}" style="width: 100%;">
                </div>

                <!-- Description -->
                <div class="form-group" style="margin-top: 16px;">
                    <label style="font-weight: 600; margin-bottom: 8px; display: block;">Description</label>
                    <textarea class="form-input" id="edit-inv-task-description" rows="3"
                              style="width: 100%; resize: vertical;">${task.description || ''}</textarea>
                </div>

                <!-- Shift Selection -->
                <div class="form-group" style="margin-top: 16px;">
                    <label style="font-weight: 600; margin-bottom: 8px; display: block;">Shift *</label>
                    <div style="display: flex; gap: 12px;">
                        <label style="flex: 1; cursor: pointer;">
                            <input type="radio" name="edit-inv-task-shift" value="opening" ${task.shift === 'opening' ? 'checked' : ''} style="display: none;">
                            <div class="shift-option" style="padding: 16px; border: 2px solid ${task.shift === 'opening' ? '#f59e0b' : 'var(--border-color)'}; border-radius: 12px; background: ${task.shift === 'opening' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)'}; text-align: center; transition: all 0.2s;">
                                <i class="fas fa-sun" style="font-size: 24px; color: ${task.shift === 'opening' ? '#f59e0b' : 'var(--text-muted)'}; margin-bottom: 8px; display: block;"></i>
                                <div style="font-weight: 600;">AM Shift</div>
                            </div>
                        </label>
                        <label style="flex: 1; cursor: pointer;">
                            <input type="radio" name="edit-inv-task-shift" value="closing" ${task.shift === 'closing' ? 'checked' : ''} style="display: none;">
                            <div class="shift-option" style="padding: 16px; border: 2px solid ${task.shift === 'closing' ? '#8b5cf6' : 'var(--border-color)'}; border-radius: 12px; background: ${task.shift === 'closing' ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-secondary)'}; text-align: center; transition: all 0.2s;">
                                <i class="fas fa-moon" style="font-size: 24px; color: ${task.shift === 'closing' ? '#8b5cf6' : 'var(--text-muted)'}; margin-bottom: 8px; display: block;"></i>
                                <div style="font-weight: 600;">PM Shift</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="updateInventoryTask()" style="background: linear-gradient(135deg, #7c3aed, #6d28d9);">
                    <i class="fas fa-save"></i> Save Changes
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');

    // Setup radio listeners
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
        if (typeof showNotification === 'function') {
            showNotification('Please enter a category name', 'error');
        }
        return;
    }

    try {
        const db = firebase.firestore();

        await db.collection('inventoryTasks').doc(taskId).update({
            category,
            description: description || '',
            shift,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update local data
        const taskIndex = inventoryTasksData.tasks.findIndex(t => t.id === taskId);
        if (taskIndex >= 0) {
            inventoryTasksData.tasks[taskIndex] = {
                ...inventoryTasksData.tasks[taskIndex],
                category,
                description,
                shift
            };
        }

        if (typeof closeModal === 'function') closeModal();
        if (typeof showNotification === 'function') {
            showNotification('Task updated successfully!', 'success');
        }

        renderInventoryTasksModule();
    } catch (error) {
        console.error('[InventoryTasks] Error updating task:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error updating task', 'error');
        }
    }
};

window.markInventoryComplete = async function(taskId, storeId) {
    try {
        const db = firebase.firestore();
        const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

        const completionData = {
            taskId,
            store: storeId,
            shift: inventoryTasksCurrentShift,
            date: inventoryTasksSelectedDate,
            completedBy: user?.name || 'Unknown',
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('inventoryCompletions').add(completionData);
        console.log('[InventoryTasks] Completion saved:', docRef.id);

        // Add to local data
        completionData.id = docRef.id;
        completionData.completedAt = new Date();
        inventoryTasksData.completions.push(completionData);

        // Log activity
        if (typeof logActivity === 'function') {
            const task = inventoryTasksData.tasks.find(t => t.id === taskId);
            await logActivity('inventory_complete', {
                message: `Completed inventory: ${task?.category || taskId} at ${storeId}`,
                taskId: taskId,
                store: storeId,
                shift: inventoryTasksCurrentShift,
                date: inventoryTasksSelectedDate
            }, 'inventory', docRef.id);
        }

        if (typeof showNotification === 'function') {
            showNotification('Inventory count marked as complete!', 'success');
        }

        renderStoreDetailView();
    } catch (error) {
        console.error('[InventoryTasks] Error marking complete:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error saving completion', 'error');
        }
    }
};

window.undoInventoryCompletion = async function(completionId, taskId) {
    try {
        const db = firebase.firestore();
        await db.collection('inventoryCompletions').doc(completionId).delete();

        // Remove from local data
        inventoryTasksData.completions = inventoryTasksData.completions.filter(c => c.id !== completionId);

        if (typeof showNotification === 'function') {
            showNotification('Completion undone', 'info');
        }

        renderStoreDetailView();
    } catch (error) {
        console.error('[InventoryTasks] Error undoing completion:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error undoing completion', 'error');
        }
    }
};

// ============================================
// EXPOSE FUNCTIONS GLOBALLY
// ============================================
window.initializeInventoryTasks = initializeInventoryTasks;
window.renderInventoryTasksModule = renderInventoryTasksModule;

console.log('[InventoryTasks] Module loaded');
