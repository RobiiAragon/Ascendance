// =============================================================================
// DAILY CHECKLIST MODULE
// =============================================================================

let checklistData = {
    tasks: [],      // Task templates
    completions: [] // Today's completions
};
let checklistCurrentStore = 'Miramar';
let checklistCurrentShift = 'opening'; // 'opening' or 'closing'
let checklistSelectedDate = new Date().toISOString().split('T')[0]; // Selected date for viewing

// Default tasks template
const defaultChecklistTasks = {
    opening: [
        { id: 'open-1', task: 'Unlock store and disarm alarm', order: 1 },
        { id: 'open-2', task: 'Turn on all lights and signage', order: 2 },
        { id: 'open-3', task: 'Count opening cash drawer', order: 3 },
        { id: 'open-4', task: 'Check and restock displays', order: 4 },
        { id: 'open-5', task: 'Clean front entrance and windows', order: 5 },
        { id: 'open-6', task: 'Turn on POS systems', order: 6 },
        { id: 'open-7', task: 'Review daily promotions/announcements', order: 7 },
        { id: 'open-8', task: 'Check restroom supplies', order: 8 },
        { id: 'open-9', task: 'Check bathroom', order: 9 }
    ],
    closing: [
        { id: 'close-1', task: 'Count and close cash drawer', order: 1 },
        { id: 'close-2', task: 'Complete daily sales report', order: 2 },
        { id: 'close-3', task: 'Clean and organize store', order: 3 },
        { id: 'close-4', task: 'Take out trash', order: 4 },
        { id: 'close-5', task: 'Restock shelves for next day', order: 5 },
        { id: 'close-6', task: 'Turn off POS systems', order: 6 },
        { id: 'close-7', task: 'Turn off lights and signage', order: 7 },
        { id: 'close-8', task: 'Set alarm and lock store', order: 8 },
        { id: 'close-9', task: 'Clean bathroom', order: 9 }
    ]
};

// Get today's date string
function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}

// Get day name for selected date (used for midshift)
function getCurrentDayName() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(checklistSelectedDate + 'T12:00:00');
    return days[date.getDay()];
}

// Get day key for selected date - Firebase (lowercase)
function getCurrentDayKey() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const date = new Date(checklistSelectedDate + 'T12:00:00');
    return days[date.getDay()];
}

// Load checklist tasks - default tasks + custom tasks from Firebase
async function loadChecklistTasks() {
    const today = getTodayDateString();

    // Start with hardcoded default tasks
    const defaultTasks = [
        { id: 'open-1', task: 'Unlock store and disarm alarm', order: 1, shift: 'opening', store: 'all', duration: 'permanent' },
        { id: 'open-2', task: 'Turn on all lights and signage', order: 2, shift: 'opening', store: 'all', duration: 'permanent' },
        { id: 'open-3', task: 'Count opening cash drawer', order: 3, shift: 'opening', store: 'all', duration: 'permanent' },
        { id: 'open-4', task: 'Check and restock displays', order: 4, shift: 'opening', store: 'all', duration: 'permanent' },
        { id: 'open-5', task: 'Clean front entrance and windows', order: 5, shift: 'opening', store: 'all', duration: 'permanent' },
        { id: 'open-6', task: 'Turn on POS systems', order: 6, shift: 'opening', store: 'all', duration: 'permanent' },
        { id: 'open-7', task: 'Review daily promotions/announcements', order: 7, shift: 'opening', store: 'all', duration: 'permanent' },
        { id: 'open-8', task: 'Check restroom supplies', order: 8, shift: 'opening', store: 'all', duration: 'permanent' },
        { id: 'open-9', task: 'Check bathroom', order: 9, shift: 'opening', store: 'all', duration: 'permanent' },
        { id: 'close-1', task: 'Count and close cash drawer', order: 1, shift: 'closing', store: 'all', duration: 'permanent' },
        { id: 'close-2', task: 'Complete daily sales report', order: 2, shift: 'closing', store: 'all', duration: 'permanent' },
        { id: 'close-3', task: 'Clean and organize store', order: 3, shift: 'closing', store: 'all', duration: 'permanent' },
        { id: 'close-4', task: 'Take out trash', order: 4, shift: 'closing', store: 'all', duration: 'permanent' },
        { id: 'close-5', task: 'Restock shelves for next day', order: 5, shift: 'closing', store: 'all', duration: 'permanent' },
        { id: 'close-6', task: 'Turn off POS systems', order: 6, shift: 'closing', store: 'all', duration: 'permanent' },
        { id: 'close-7', task: 'Turn off lights and signage', order: 7, shift: 'closing', store: 'all', duration: 'permanent' },
        { id: 'close-8', task: 'Set alarm and lock store', order: 8, shift: 'closing', store: 'all', duration: 'permanent' },
        { id: 'close-9', task: 'Clean bathroom', order: 9, shift: 'closing', store: 'all', duration: 'permanent' }
    ];

    // Load custom tasks from Firebase
    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('checklistTasks').get();

        // Load midshift tasks for today's day of week
        const currentDay = getCurrentDayKey();
        const midshiftSnapshot = await db.collection('midshiftTasks').where('dayOfWeek', '==', currentDay).get();
        const midshiftTasks = midshiftSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            shift: 'midshift',
            store: 'all',
            duration: 'permanent'
        }));
        const customTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Load overrides (hidden/edited default tasks)
        const overridesSnapshot = await db.collection('checklistTaskOverrides').get();
        const overrides = {};
        overridesSnapshot.docs.forEach(doc => {
            overrides[doc.id] = doc.data();
        });

        // Get default task IDs to avoid duplicates
        const defaultTaskIds = defaultTasks.map(t => t.id);

        // Filter out hidden default tasks and get replacements
        const replacedDefaultIds = new Set();
        customTasks.forEach(task => {
            if (task.replacesDefault) {
                replacedDefaultIds.add(task.replacesDefault);
            }
        });

        // Filter default tasks - exclude those that are hidden or replaced
        const activeDefaultTasks = defaultTasks.filter(task => {
            if (overrides[task.id]?.hidden) return false;
            if (replacedDefaultIds.has(task.id)) return false;
            return true;
        });

        // Filter custom tasks:
        // - Only include tasks marked as custom (isCustom: true)
        // - Exclude any that match default task IDs
        // - For one-time tasks, only include if created today
        const validCustomTasks = customTasks.filter(task => {
            // Skip if it's a default task ID or not marked as custom
            if (defaultTaskIds.includes(task.id) || !task.isCustom) {
                return false;
            }
            if (task.duration === 'one-time') {
                return task.createdDate === today;
            }
            return true; // Include permanent tasks
        });

        // Clean up expired one-time tasks (older than today)
        const expiredTasks = customTasks.filter(task =>
            task.duration === 'one-time' && task.createdDate && task.createdDate < today
        );
        for (const task of expiredTasks) {
            try {
                await db.collection('checklistTasks').doc(task.id).delete();
                console.log(`[Checklist] Cleaned up expired one-time task: ${task.task}`);
            } catch (e) {
                console.error('Error cleaning up task:', e);
            }
        }

        // Combine active default + custom tasks + midshift tasks
        checklistData.tasks = [...activeDefaultTasks, ...validCustomTasks, ...midshiftTasks];
        console.log(`[Checklist] Loaded ${activeDefaultTasks.length} default + ${validCustomTasks.length} custom + ${midshiftTasks.length} midshift tasks`);

    } catch (error) {
        console.error('Error loading custom tasks:', error);
        checklistData.tasks = defaultTasks;
    }
}

// Load completions for a specific date from Firebase
async function loadCompletionsForDate(dateString) {
    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('checklistCompletions')
            .where('date', '==', dateString)
            .get();

        checklistData.completions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error loading completions:', error);
        checklistData.completions = [];
    }
}

// Load today's completions from Firebase (backwards compatible)
async function loadTodayCompletions() {
    await loadCompletionsForDate(checklistSelectedDate);
}

// Navigate to a specific date
window.navigateChecklistDate = async function(dateString) {
    checklistSelectedDate = dateString;
    // Reload tasks (to get midshift tasks for the correct day of week)
    await loadChecklistTasks();
    await loadCompletionsForDate(dateString);
    renderDailyChecklist();
}

// Navigate to previous day
window.checklistPrevDay = async function() {
    const date = new Date(checklistSelectedDate);
    date.setDate(date.getDate() - 1);
    await navigateChecklistDate(date.toISOString().split('T')[0]);
}

// Navigate to next day
window.checklistNextDay = async function() {
    const date = new Date(checklistSelectedDate);
    date.setDate(date.getDate() + 1);
    // Allow going up to 14 days in the future for planning downtime tasks
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 14);
    if (date <= maxDate) {
        await navigateChecklistDate(date.toISOString().split('T')[0]);
    }
}

// Navigate to today
window.checklistGoToToday = async function() {
    await navigateChecklistDate(new Date().toISOString().split('T')[0]);
}

// Format date for display
function formatChecklistDate(dateString) {
    const date = new Date(dateString + 'T12:00:00');
    const today = new Date().toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (dateString === today) {
        return 'Today';
    } else if (dateString === yesterdayStr) {
        return 'Yesterday';
    } else if (dateString === tomorrowStr) {
        return 'Tomorrow';
    } else if (dateString > today) {
        // Future date - show day name prominently
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    } else {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
}

// Check if selected date is in the future
function isChecklistDateFuture() {
    const today = new Date().toISOString().split('T')[0];
    return checklistSelectedDate > today;
}

// Reset checklist tasks to defaults (admin function)
window.resetChecklistTasks = async function() {
    try {
        const db = firebase.firestore();

        // Delete all existing tasks
        const snapshot = await db.collection('checklistTasks').get();
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        console.log('Deleted', snapshot.docs.length, 'old tasks');

        // Add default tasks
        checklistData.tasks = [];
        const openingTasks = defaultChecklistTasks.opening.map(t => ({ ...t, shift: 'opening', store: 'all' }));
        const closingTasks = defaultChecklistTasks.closing.map(t => ({ ...t, shift: 'closing', store: 'all' }));

        for (const task of openingTasks) {
            const docRef = await db.collection('checklistTasks').add(task);
            checklistData.tasks.push({ ...task, id: docRef.id });
        }
        for (const task of closingTasks) {
            const docRef = await db.collection('checklistTasks').add(task);
            checklistData.tasks.push({ ...task, id: docRef.id });
        }

        console.log('Reset complete! Added', checklistData.tasks.length, 'default tasks');
        showNotification('Checklist tasks reset to defaults!', 'success');
        renderDailyChecklist();
        return true;
    } catch (error) {
        console.error('Error resetting tasks:', error);
        showNotification('Error resetting tasks', 'error');
        return false;
    }
}

// Save completion to Firebase
async function saveChecklistCompletion(taskId, store, shift, photoUrl = null) {
    try {
        const db = firebase.firestore();
        const user = getCurrentUser();
        // Crear timestamp usando la fecha seleccionada + hora actual
        const now = new Date();
        const [year, month, day] = checklistSelectedDate.split('-').map(Number);
        const completionTimestamp = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());

        const completion = {
            taskId,
            store,
            shift,
            date: checklistSelectedDate, // Use selected date instead of always today
            completedBy: user?.name || 'Unknown',
            completedAt: completionTimestamp,
            photoUrl
        };

        const docRef = await db.collection('checklistCompletions').add(completion);
        completion.id = docRef.id;
        checklistData.completions.push(completion);
        return true;
    } catch (error) {
        console.error('Error saving completion:', error);
        return false;
    }
}

// Remove completion from Firebase
async function removeChecklistCompletion(completionId) {
    try {
        const db = firebase.firestore();
        await db.collection('checklistCompletions').doc(completionId).delete();
        checklistData.completions = checklistData.completions.filter(c => c.id !== completionId);
        return true;
    } catch (error) {
        console.error('Error removing completion:', error);
        return false;
    }
}

// Add new task to Firebase
async function addChecklistTask(task, shift, store = 'all', duration = 'permanent') {
    try {
        const db = firebase.firestore();
        const today = getTodayDateString();
        const newTask = {
            task,
            shift,
            store,
            duration, // 'permanent' or 'one-time'
            order: checklistData.tasks.filter(t => t.shift === shift).length + 1,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdDate: today, // For one-time tasks, used to filter by date
            isCustom: true // Mark as user-added task
        };

        const docRef = await db.collection('checklistTasks').add(newTask);
        newTask.id = docRef.id;
        checklistData.tasks.push(newTask);
        return newTask;
    } catch (error) {
        console.error('Error adding task:', error);
        return null;
    }
}

// Delete task from Firebase
async function deleteChecklistTask(taskId) {
    try {
        const db = firebase.firestore();

        // Check if this is a default task
        const isDefaultTask = taskId.startsWith('open-') || taskId.startsWith('close-');

        // Check if this is a midshift task
        const task = checklistData.tasks.find(t => t.id === taskId);
        const isMidshiftTask = task?.shift === 'midshift';

        if (isDefaultTask) {
            // For default tasks, mark as hidden in overrides collection
            await db.collection('checklistTaskOverrides').doc(taskId).set({
                hidden: true,
                deletedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else if (isMidshiftTask) {
            // For midshift tasks, delete from midshiftTasks collection
            await db.collection('midshiftTasks').doc(taskId).delete();
        } else {
            // For custom tasks, delete from Firebase
            await db.collection('checklistTasks').doc(taskId).delete();
        }

        checklistData.tasks = checklistData.tasks.filter(t => t.id !== taskId);
        return true;
    } catch (error) {
        console.error('Error deleting task:', error);
        return false;
    }
}

// Edit task in Firebase
async function editChecklistTask(taskId, newTaskText, newShift) {
    try {
        const db = firebase.firestore();
        const task = checklistData.tasks.find(t => t.id === taskId);

        if (!task) {
            console.error('Task not found:', taskId);
            return false;
        }

        // Check if this is a default task (not in Firebase yet)
        const isDefaultTask = taskId.startsWith('open-') || taskId.startsWith('close-');

        if (isDefaultTask) {
            // For default tasks, we need to create a new custom task and hide the default
            const newTask = {
                task: newTaskText,
                shift: newShift,
                store: 'all',
                duration: 'permanent',
                order: task.order,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdDate: getTodayDateString(),
                isCustom: true,
                replacesDefault: taskId // Track which default it replaces
            };

            const docRef = await db.collection('checklistTasks').add(newTask);
            newTask.id = docRef.id;

            // Also save a record that this default task is hidden
            await db.collection('checklistTaskOverrides').doc(taskId).set({
                hidden: true,
                replacedBy: docRef.id,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update local state
            const taskIndex = checklistData.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                checklistData.tasks[taskIndex] = newTask;
            }
        } else {
            // For custom tasks, just update in Firebase
            await db.collection('checklistTasks').doc(taskId).update({
                task: newTaskText,
                shift: newShift,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update local state
            const taskIndex = checklistData.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                checklistData.tasks[taskIndex].task = newTaskText;
                checklistData.tasks[taskIndex].shift = newShift;
            }
        }

        return true;
    } catch (error) {
        console.error('Error editing task:', error);
        return false;
    }
}

// Open edit task modal
window.openEditTaskModal = function(taskId) {
    const task = checklistData.tasks.find(t => t.id === taskId);
    if (!task) {
        showNotification('Task not found', 'error');
        return;
    }
    openModal('edit-checklist-task', { task });
};

// Save edited task from modal
window.saveEditedChecklistTask = async function() {
    const taskId = document.getElementById('edit-checklist-task-id')?.value;
    const newTaskText = document.getElementById('edit-checklist-task-description')?.value?.trim();
    const newShift = document.getElementById('edit-checklist-task-shift')?.value;

    if (!taskId || !newTaskText) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    const success = await editChecklistTask(taskId, newTaskText, newShift);
    if (success) {
        showNotification('Task updated successfully!', 'success');
        closeModal();
        renderDailyChecklist();
    } else {
        showNotification('Error updating task', 'error');
    }
};

// Render Daily Checklist
window.renderDailyChecklist = async function() {
    const dashboard = document.querySelector('.dashboard');
    const user = getCurrentUser();
    const userRole = user?.role || 'employee';
    const canManageTasks = userRole === 'admin' || userRole === 'manager';

    // Show loading
    dashboard.innerHTML = `
        <div class="page-header">
            <div class="page-header-left">
                <h2 class="section-title"><i class="fas fa-clipboard-check" style="color: var(--accent-primary); margin-right: 10px;"></i>Daily Checklist</h2>
                <p class="section-subtitle">Complete your shift tasks</p>
            </div>
        </div>
        <div style="display: flex; justify-content: center; padding: 60px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--accent-primary);"></i>
        </div>
    `;

    // Load data
    await loadChecklistTasks();
    await loadTodayCompletions();

    const stores = ['Miramar', 'Morena', 'Kearny Mesa', 'Chula Vista', 'North Park'];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Filter tasks by shift and store
    const getTasksForShift = (shift) => {
        const filtered = checklistData.tasks.filter(t => t.shift === shift);
        console.log('Tasks for shift', shift, ':', filtered.length);
        return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    // Check if task is completed for a store
    const isTaskCompleted = (taskId, store, shift) => {
        return checklistData.completions.find(c =>
            c.taskId === taskId &&
            c.store === store &&
            c.shift === shift &&
            c.date === checklistSelectedDate
        );
    };

    // Get completion percentage for a store and shift
    const getCompletionPercentage = (store, shift) => {
        const tasks = getTasksForShift(shift);
        if (tasks.length === 0) return 0;
        const completed = tasks.filter(t => isTaskCompleted(t.id, store, shift)).length;
        return Math.round((completed / tasks.length) * 100);
    };

    // Build tasks HTML for a shift
    const buildTasksHtml = (shift) => {
        const tasks = getTasksForShift(shift);
        const targetStore = checklistCurrentStore;

        if (tasks.length === 0) {
            // Special empty state for midshift with examples
            if (shift === 'midshift') {
                const dayName = getCurrentDayName();
                return `<div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-cloud-sun" style="font-size: 40px; margin-bottom: 16px; color: #f59e0b; opacity: 0.6;"></i>
                    <p style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">No daily goals for ${dayName}</p>
                    <p style="font-size: 13px; margin-bottom: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">
                        Add tasks that change each day of the week.<br>
                        Perfect for inventory counts and weekly duties!
                    </p>
                    <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: left; max-width: 350px; margin-left: auto; margin-right: auto;">
                        <p style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px;">💡 Example tasks:</p>
                        <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.8;">
                            <div>• <strong>Monday:</strong> Count wraps, report low stock</div>
                            <div>• <strong>Tuesday:</strong> Count cones & papers</div>
                            <div>• <strong>Wednesday:</strong> Count grinders</div>
                            <div>• <strong>Thursday:</strong> Count glass pieces</div>
                            <div>• <strong>Friday:</strong> Count vapes & batteries</div>
                        </div>
                    </div>
                    ${canManageTasks ? `<button onclick="openAddTaskModal('${shift}')" class="btn-primary" style="background: linear-gradient(135deg, #f59e0b, #d97706);"><i class="fas fa-plus"></i> Add ${dayName} Goal</button>` : ''}
                </div>`;
            }
            return `<div style="text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fas fa-clipboard" style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;"></i>
                <p>No tasks for this shift yet</p>
                ${canManageTasks ? `<button onclick="openAddTaskModal('${shift}')" class="btn-primary" style="margin-top: 12px;"><i class="fas fa-plus"></i> Add Task</button>` : ''}
            </div>`;
        }

        return tasks.map(task => {
            const completion = isTaskCompleted(task.id, targetStore, shift);
            const isCompleted = !!completion;
            const isOneTime = task.duration === 'one-time';
            const isCustom = task.isCustom === true;

            return `
                <div class="checklist-item" onclick="toggleChecklistTask('${task.id}', '${targetStore}', '${shift}', ${isCompleted ? `'${completion?.id}'` : 'null'})"
                    style="display: flex; align-items: center; gap: 16px; padding: 18px 20px; background: var(--bg-secondary); border-radius: 12px; border-left: 4px solid ${isCompleted ? '#10b981' : isOneTime ? '#f59e0b' : 'var(--accent-primary)'}; transition: all 0.2s; cursor: pointer; user-select: none;"
                    onmouseover="this.style.background='var(--bg-tertiary)'; this.style.transform='translateX(4px)';"
                    onmouseout="this.style.background='var(--bg-secondary)'; this.style.transform='none';">
                    <div style="width: 32px; height: 32px; border-radius: 50%; border: 3px solid ${isCompleted ? '#10b981' : 'var(--border-color)'}; background: ${isCompleted ? '#10b981' : 'transparent'}; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0;">
                        ${isCompleted ? '<i class="fas fa-check" style="color: white; font-size: 14px;"></i>' : '<span style="width: 12px; height: 12px; border-radius: 50%; background: var(--border-color); opacity: 0.3;"></span>'}
                    </div>
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <span style="font-weight: 600; font-size: 15px; ${isCompleted ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${task.task}</span>
                            ${isOneTime ? '<span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600;">TODAY ONLY</span>' : ''}
                            ${isCustom && !isOneTime ? '<span style="background: var(--accent-primary); color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600;">CUSTOM</span>' : ''}
                        </div>
                        ${isCompleted ? `
                            <div style="font-size: 12px; color: #10b981; margin-top: 4px; font-weight: 500;">
                                <i class="fas fa-check-circle"></i>
                                ${completion.completedBy} • ${completion.completedAt?.toDate ? completion.completedAt.toDate().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}) : new Date(completion.completedAt).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}
                            </div>
                        ` : `<div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Click to complete</div>`}
                    </div>
                    ${isCompleted ? '<i class="fas fa-check-double" style="color: #10b981; font-size: 18px;"></i>' : '<i class="fas fa-circle" style="color: var(--text-muted); font-size: 8px; opacity: 0.3;"></i>'}
                    ${canManageTasks ? `
                        <div style="display: flex; gap: 4px;">
                            <button onclick="event.stopPropagation(); openEditTaskModal('${task.id}')"
                                style="width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0.5; transition: opacity 0.2s;"
                                onmouseover="this.style.opacity='1';" onmouseout="this.style.opacity='0.5';" title="Edit task">
                                <i class="fas fa-pen" style="color: var(--accent-primary); font-size: 13px;"></i>
                            </button>
                            <button onclick="event.stopPropagation(); deleteChecklistTaskUI('${task.id}')"
                                style="width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0.5; transition: opacity 0.2s;"
                                onmouseover="this.style.opacity='1';" onmouseout="this.style.opacity='0.5';" title="Delete task">
                                <i class="fas fa-trash" style="color: #ef4444; font-size: 13px;"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    };

    // Store icons and colors - representing San Diego neighborhoods
    const storeIcons = {
        'Miramar': { icon: 'fa-jet-fighter', color: '#3b82f6', bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' },
        'Morena': { icon: 'fa-water', color: '#0891b2', bg: 'linear-gradient(135deg, #cffafe, #a5f3fc)' },
        'Kearny Mesa': { icon: 'fa-bowl-food', color: '#f97316', bg: 'linear-gradient(135deg, #ffedd5, #fed7aa)' },
        'Chula Vista': { icon: 'fa-leaf', color: '#16a34a', bg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' },
        'North Park': { icon: 'fa-beer-mug-empty', color: '#a855f7', bg: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)' }
    };

    // Build store progress cards for overview
    const buildStoreProgressHtml = () => {
        return stores.map(store => {
            const openingPct = getCompletionPercentage(store, 'opening');
            const closingPct = getCompletionPercentage(store, 'closing');
            const totalPct = Math.round((openingPct + closingPct) / 2);
            const storeInfo = storeIcons[store] || { icon: 'fa-store', color: '#6b7280', bg: 'var(--bg-tertiary)', label: '' };

            return `
                <div onclick="filterChecklistByStore('${store}')" style="padding: 16px; background: ${checklistCurrentStore === store ? storeInfo.bg : 'var(--bg-secondary)'}; border-radius: 16px; cursor: pointer; transition: all 0.3s; border: 3px solid ${checklistCurrentStore === store ? storeInfo.color : 'transparent'}; min-width: 160px;"
                    onmouseover="this.style.transform='translateY(-4px) scale(1.02)'; this.style.boxShadow='0 12px 24px rgba(0,0,0,0.15)';"
                    onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <div style="width: 44px; height: 44px; border-radius: 12px; background: ${storeInfo.color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px ${storeInfo.color}40;">
                            <i class="fas ${storeInfo.icon}" style="color: white; font-size: 18px;"></i>
                        </div>
                        <div style="font-weight: 700; font-size: 14px; color: ${checklistCurrentStore === store ? storeInfo.color : 'var(--text-primary)'};">${store}</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="font-size: 11px; color: var(--text-muted);">Progress</div>
                        <div style="font-size: 18px; font-weight: 800; color: ${totalPct === 100 ? '#10b981' : totalPct > 50 ? '#f59e0b' : storeInfo.color};">${totalPct}%</div>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <div style="flex: 1;">
                            <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 3px;"><i class="fas fa-sun" style="color: #f59e0b; margin-right: 3px;"></i>AM</div>
                            <div style="height: 5px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden;">
                                <div style="width: ${openingPct}%; height: 100%; background: ${openingPct === 100 ? '#10b981' : '#f59e0b'}; border-radius: 3px; transition: width 0.3s;"></div>
                            </div>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 3px;"><i class="fas fa-moon" style="color: #8b5cf6; margin-right: 3px;"></i>PM</div>
                            <div style="height: 5px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden;">
                                <div style="width: ${closingPct}%; height: 100%; background: ${closingPct === 100 ? '#10b981' : '#8b5cf6'}; border-radius: 3px; transition: width 0.3s;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    };

    dashboard.innerHTML = `
        <style>
            @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes twinkle { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
            @keyframes steam-rise {
                0% { opacity: 0; transform: translateX(-50%) translateY(0) scale(1); }
                50% { opacity: 0.8; transform: translateX(-50%) translateY(-8px) scale(1.2); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-16px) scale(0.8); }
            }
            @keyframes steam { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
            @keyframes float-gentle { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-2px) rotate(3deg); } }
            @keyframes pulse-glow { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
        </style>
        <div class="page-header" style="margin-bottom: 24px;">
            <div class="page-header-left">
                <h2 class="section-title" style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-clipboard-check" style="color: white; font-size: 20px;"></i>
                    </div>
                    Daily Checklist
                </h2>
                <!-- Date Navigator -->
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                    <button onclick="checklistPrevDay()" style="width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='var(--bg-tertiary)'; this.style.borderColor='var(--accent-primary)';" onmouseout="this.style.background='var(--bg-secondary)'; this.style.borderColor='var(--border-color)';">
                        <i class="fas fa-chevron-left" style="color: var(--text-primary); font-size: 12px;"></i>
                    </button>
                    <div style="position: relative;">
                        <button onclick="document.getElementById('checklist-date-picker').showPicker()" style="padding: 8px 16px; border-radius: 10px; border: 2px solid ${checklistSelectedDate === new Date().toISOString().split('T')[0] ? '#10b981' : 'var(--border-color)'}; background: ${checklistSelectedDate === new Date().toISOString().split('T')[0] ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)'}; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--text-primary); transition: all 0.2s;">
                            <i class="fas fa-calendar-alt" style="color: ${checklistSelectedDate === new Date().toISOString().split('T')[0] ? '#10b981' : 'var(--accent-primary)'};"></i>
                            <span>${formatChecklistDate(checklistSelectedDate)}</span>
                            ${checklistSelectedDate !== new Date().toISOString().split('T')[0] ? `<span style="font-size: 11px; color: var(--text-muted);">(${checklistSelectedDate})</span>` : ''}
                        </button>
                        <input type="date" id="checklist-date-picker" value="${checklistSelectedDate}" max="${(() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0]; })()}" onchange="navigateChecklistDate(this.value)" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
                    </div>
                    <button onclick="checklistNextDay()" style="width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='var(--bg-tertiary)'; this.style.borderColor='var(--accent-primary)';" onmouseout="this.style.background='var(--bg-secondary)'; this.style.borderColor='var(--border-color)';">
                        <i class="fas fa-chevron-right" style="color: var(--text-primary); font-size: 12px;"></i>
                    </button>
                    ${checklistSelectedDate !== new Date().toISOString().split('T')[0] ? `
                        <button onclick="checklistGoToToday()" style="padding: 8px 12px; border-radius: 10px; border: none; background: linear-gradient(135deg, #10b981, #059669); color: white; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 12px; transition: all 0.2s;" onmouseover="this.style.transform='scale(1.05)';" onmouseout="this.style.transform='scale(1)';">
                            <i class="fas fa-calendar-day"></i> Today
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="page-header-right" style="display: flex; gap: 12px;">
                <button onclick="viewChecklistHistory()" class="btn-secondary">
                    <i class="fas fa-history"></i> History
                </button>
                ${canManageTasks ? `
                    <button onclick="openAddTaskModal(checklistCurrentShift)" class="btn-primary">
                        <i class="fas fa-plus"></i> Add Task
                    </button>
                ` : ''}
            </div>
        </div>

        <!-- Store Progress Overview -->
        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-store"></i> Store Progress</h3>
            </div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                    ${buildStoreProgressHtml()}
                </div>
            </div>
        </div>

        <!-- Shift Selector -->
        <div style="margin-bottom: 24px;">
            <label style="display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Select Shift</label>
                <div style="display: flex; gap: 12px;">
                    <!-- Opening / Day Shift -->
                    <button onclick="switchChecklistShift('opening')"
                        style="flex: 1; padding: 16px 20px; border-radius: 16px; border: 3px solid ${checklistCurrentShift === 'opening' ? '#f59e0b' : 'var(--border-color)'};
                        background: ${checklistCurrentShift === 'opening' ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)' : 'var(--bg-secondary)'};
                        cursor: pointer; transition: all 0.3s ease; display: flex; flex-direction: column; align-items: center; gap: 8px;
                        box-shadow: ${checklistCurrentShift === 'opening' ? '0 8px 24px rgba(245, 158, 11, 0.3), inset 0 -2px 8px rgba(0,0,0,0.1)' : 'none'};"
                        onmouseover="this.style.transform='translateY(-3px) scale(1.02)'; this.style.boxShadow='0 12px 28px rgba(245, 158, 11, 0.25)';"
                        onmouseout="this.style.transform='none'; this.style.boxShadow='${checklistCurrentShift === 'opening' ? '0 8px 24px rgba(245, 158, 11, 0.3), inset 0 -2px 8px rgba(0,0,0,0.1)' : 'none'}';">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: ${checklistCurrentShift === 'opening' ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : 'var(--bg-tertiary)'};
                            display: flex; align-items: center; justify-content: center;
                            box-shadow: ${checklistCurrentShift === 'opening' ? '0 0 20px rgba(251, 191, 36, 0.6), 0 0 40px rgba(251, 191, 36, 0.3)' : 'none'};">
                            <i class="fas fa-sun" style="font-size: 22px; color: ${checklistCurrentShift === 'opening' ? 'white' : 'var(--text-muted)'}; ${checklistCurrentShift === 'opening' ? 'animation: spin-slow 10s linear infinite;' : ''}"></i>
                        </div>
                        <div style="font-weight: 700; font-size: 15px; color: ${checklistCurrentShift === 'opening' ? '#92400e' : 'var(--text-primary)'};">Opening</div>
                        <div style="font-size: 11px; color: ${checklistCurrentShift === 'opening' ? '#b45309' : 'var(--text-muted)'}; font-weight: 500;">
                            <i class="fas fa-clock" style="margin-right: 4px;"></i>Day Shift
                        </div>
                    </button>

                    <!-- Mid Shift / Daily Goals -->
                    <button onclick="switchChecklistShift('midshift')"
                        style="flex: 1; padding: 16px 20px; border-radius: 16px; border: 3px solid ${checklistCurrentShift === 'midshift' ? '#f59e0b' : 'var(--border-color)'};
                        background: ${checklistCurrentShift === 'midshift' ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)' : 'var(--bg-secondary)'};
                        cursor: pointer; transition: all 0.3s ease; display: flex; flex-direction: column; align-items: center; gap: 8px;
                        box-shadow: ${checklistCurrentShift === 'midshift' ? '0 8px 24px rgba(245, 158, 11, 0.35), inset 0 -2px 8px rgba(0,0,0,0.1)' : 'none'};"
                        onmouseover="this.style.transform='translateY(-3px) scale(1.02)'; this.style.boxShadow='0 12px 28px rgba(245, 158, 11, 0.3)';"
                        onmouseout="this.style.transform='none'; this.style.boxShadow='${checklistCurrentShift === 'midshift' ? '0 8px 24px rgba(245, 158, 11, 0.35), inset 0 -2px 8px rgba(0,0,0,0.1)' : 'none'}';">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: ${checklistCurrentShift === 'midshift' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'var(--bg-tertiary)'};
                            display: flex; align-items: center; justify-content: center; position: relative;
                            box-shadow: ${checklistCurrentShift === 'midshift' ? '0 0 20px rgba(245, 158, 11, 0.5), 0 0 40px rgba(245, 158, 11, 0.25)' : 'none'};">
                            <i class="fas fa-cloud-sun" style="font-size: 20px; color: ${checklistCurrentShift === 'midshift' ? 'white' : 'var(--text-muted)'}; ${checklistCurrentShift === 'midshift' ? 'animation: float-gentle 3s ease-in-out infinite;' : ''}"></i>
                            ${checklistCurrentShift === 'midshift' ? `
                                <span style="position: absolute; top: 0px; right: 4px; width: 8px; height: 8px; background: #fef3c7; border-radius: 50%; box-shadow: 0 0 8px #fef3c7, 0 0 16px rgba(254, 243, 199, 0.5); animation: pulse-glow 2s ease-in-out infinite;"></span>
                            ` : ''}
                        </div>
                        <div style="font-weight: 700; font-size: 15px; color: ${checklistCurrentShift === 'midshift' ? '#92400e' : 'var(--text-primary)'};">Daily Goals</div>
                        <div style="font-size: 11px; color: ${checklistCurrentShift === 'midshift' ? '#b45309' : 'var(--text-muted)'}; font-weight: 500;">
                            <i class="fas fa-bullseye" style="margin-right: 4px; font-size: 9px;"></i>${getCurrentDayName()}
                        </div>
                    </button>

                    <!-- Closing / Night Shift -->
                    <button onclick="switchChecklistShift('closing')"
                        style="flex: 1; padding: 16px 20px; border-radius: 16px; border: 3px solid ${checklistCurrentShift === 'closing' ? '#8b5cf6' : 'var(--border-color)'};
                        background: ${checklistCurrentShift === 'closing' ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' : 'var(--bg-secondary)'};
                        cursor: pointer; transition: all 0.3s ease; display: flex; flex-direction: column; align-items: center; gap: 8px;
                        box-shadow: ${checklistCurrentShift === 'closing' ? '0 8px 24px rgba(139, 92, 246, 0.4), inset 0 -2px 8px rgba(0,0,0,0.2)' : 'none'};"
                        onmouseover="this.style.transform='translateY(-3px) scale(1.02)'; this.style.boxShadow='0 12px 28px rgba(139, 92, 246, 0.3)';"
                        onmouseout="this.style.transform='none'; this.style.boxShadow='${checklistCurrentShift === 'closing' ? '0 8px 24px rgba(139, 92, 246, 0.4), inset 0 -2px 8px rgba(0,0,0,0.2)' : 'none'}';">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: ${checklistCurrentShift === 'closing' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-tertiary)'};
                            display: flex; align-items: center; justify-content: center; position: relative;
                            box-shadow: ${checklistCurrentShift === 'closing' ? '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.2)' : 'none'};">
                            <i class="fas fa-moon" style="font-size: 20px; color: ${checklistCurrentShift === 'closing' ? '#fef3c7' : 'var(--text-muted)'};"></i>
                            ${checklistCurrentShift === 'closing' ? `
                                <span style="position: absolute; top: 2px; right: 6px; width: 6px; height: 6px; background: #fef3c7; border-radius: 50%; box-shadow: 0 0 6px #fef3c7; animation: twinkle 2s ease-in-out infinite;"></span>
                                <span style="position: absolute; bottom: 8px; left: 4px; width: 4px; height: 4px; background: #fef3c7; border-radius: 50%; box-shadow: 0 0 4px #fef3c7; animation: twinkle 2.5s ease-in-out infinite 0.5s;"></span>
                                <span style="position: absolute; top: 10px; left: 2px; width: 3px; height: 3px; background: #fef3c7; border-radius: 50%; box-shadow: 0 0 3px #fef3c7; animation: twinkle 1.8s ease-in-out infinite 1s;"></span>
                            ` : ''}
                        </div>
                        <div style="font-weight: 700; font-size: 15px; color: ${checklistCurrentShift === 'closing' ? 'white' : 'var(--text-primary)'};">Closing</div>
                        <div style="font-size: 11px; color: ${checklistCurrentShift === 'closing' ? '#c4b5fd' : 'var(--text-muted)'}; font-weight: 500;">
                            <i class="fas fa-star" style="margin-right: 4px; font-size: 9px;"></i>Night Shift
                        </div>
                    </button>
                </div>
        </div>

        <!-- Checklist Tasks -->
        <div class="card">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                <h3 class="card-title">
                    <i class="fas ${checklistCurrentShift === 'opening' ? 'fa-sun' : checklistCurrentShift === 'midshift' ? 'fa-cloud-sun' : 'fa-moon'}" style="color: ${checklistCurrentShift === 'opening' ? '#f59e0b' : checklistCurrentShift === 'midshift' ? '#f59e0b' : '#8b5cf6'};"></i>
                    ${checklistCurrentShift === 'opening' ? 'Opening' : checklistCurrentShift === 'midshift' ? `Daily Goals - ${getCurrentDayName()}` : 'Closing'} Tasks
                </h3>
                <div style="font-size: 14px; color: var(--text-muted);">
                    ${getCompletionPercentage(checklistCurrentStore, checklistCurrentShift)}% complete
                </div>
            </div>
            <div class="card-body">
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${buildTasksHtml(checklistCurrentShift)}
                </div>
            </div>
        </div>

        <!-- Sticky Add Task Button -->
        ${canManageTasks ? `
            <div style="position: fixed; bottom: 24px; right: 24px; z-index: 100;">
                <button onclick="openAddTaskModal(checklistCurrentShift)"
                    style="width: 60px; height: 60px; border-radius: 50%; border: none; background: linear-gradient(135deg, var(--accent-primary), #7c3aed); color: white; font-size: 24px; cursor: pointer; box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4); display: flex; align-items: center; justify-content: center; transition: all 0.3s;"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 12px 32px rgba(139, 92, 246, 0.5)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 8px 24px rgba(139, 92, 246, 0.4)';"
                    title="Add New Task">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        ` : ''}
    `;
}

// Toggle task completion
window.toggleChecklistTask = async function(taskId, store, shift, completionId) {
    // Find the clicked element
    const clickedItem = event?.target?.closest('.checklist-item');

    if (completionId && completionId !== 'null') {
        // Uncomplete the task
        const success = await removeChecklistCompletion(completionId);
        if (success) {
            // Update UI without full reload
            updateChecklistItemUI(clickedItem, taskId, store, shift, false, null);
            updateChecklistProgress();
        }
    } else {
        // Complete the task
        const success = await saveChecklistCompletion(taskId, store, shift);
        if (success) {
            // Get the new completion from the array
            const newCompletion = checklistData.completions.find(c =>
                c.taskId === taskId && c.store === store && c.shift === shift && c.date === checklistSelectedDate
            );
            showNotification('Task completed!', 'success');
            // Update UI without full reload
            updateChecklistItemUI(clickedItem, taskId, store, shift, true, newCompletion);
            updateChecklistProgress();
        }
    }
}

// Update a single checklist item UI without reloading
function updateChecklistItemUI(element, taskId, store, shift, isCompleted, completion) {
    if (!element) return;

    const user = getCurrentUser();
    const canManageTasks = user && (user.role === 'admin' || user.role === 'supervisor');
    const task = checklistData.tasks.find(t => t.id === taskId);
    if (!task) return;

    const completionId = completion?.id || null;
    const timeStr = completion?.completedAt ?
        (completion.completedAt.toDate ? completion.completedAt.toDate() : new Date(completion.completedAt)).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})
        : '';

    // Update the element's onclick
    element.setAttribute('onclick', `toggleChecklistTask('${taskId}', '${store}', '${shift}', ${isCompleted ? `'${completionId}'` : 'null'})`);

    // Update border color
    element.style.borderLeftColor = isCompleted ? '#10b981' : 'var(--accent-primary)';

    // Update checkbox
    const checkbox = element.querySelector('div:first-child');
    if (checkbox) {
        checkbox.style.borderColor = isCompleted ? '#10b981' : 'var(--border-color)';
        checkbox.style.background = isCompleted ? '#10b981' : 'transparent';
        checkbox.innerHTML = isCompleted
            ? '<i class="fas fa-check" style="color: white; font-size: 14px;"></i>'
            : '<span style="width: 12px; height: 12px; border-radius: 50%; background: var(--border-color); opacity: 0.3;"></span>';
    }

    // Update task text area
    const textArea = element.querySelector('div:nth-child(2)');
    if (textArea) {
        const taskTitle = textArea.querySelector('div:first-child');
        if (taskTitle) {
            taskTitle.style.textDecoration = isCompleted ? 'line-through' : 'none';
            taskTitle.style.opacity = isCompleted ? '0.5' : '1';
        }

        // Update or add completion info
        let infoDiv = textArea.querySelector('div:nth-child(2)');
        if (isCompleted) {
            const infoHtml = `<i class="fas fa-check-circle"></i> ${completion?.completedBy || user?.name || 'Unknown'} • ${timeStr}`;
            if (infoDiv) {
                infoDiv.style.color = '#10b981';
                infoDiv.style.fontWeight = '500';
                infoDiv.innerHTML = infoHtml;
            } else {
                infoDiv = document.createElement('div');
                infoDiv.style.cssText = 'font-size: 12px; color: #10b981; margin-top: 4px; font-weight: 500;';
                infoDiv.innerHTML = infoHtml;
                textArea.appendChild(infoDiv);
            }
        } else {
            if (infoDiv) {
                infoDiv.style.color = 'var(--text-muted)';
                infoDiv.style.fontWeight = 'normal';
                infoDiv.innerHTML = 'Click to complete';
            }
        }
    }

    // Update trailing icon (before delete button)
    const icons = element.querySelectorAll(':scope > i.fas');
    icons.forEach(icon => {
        if (icon.classList.contains('fa-check-double') || icon.classList.contains('fa-circle')) {
            if (isCompleted) {
                icon.className = 'fas fa-check-double';
                icon.style.color = '#10b981';
                icon.style.fontSize = '18px';
                icon.style.opacity = '1';
            } else {
                icon.className = 'fas fa-circle';
                icon.style.color = 'var(--text-muted)';
                icon.style.fontSize = '8px';
                icon.style.opacity = '0.3';
            }
        }
    });
}

// Update the progress percentage display without full reload
function updateChecklistProgress() {
    const tasks = checklistData.tasks.filter(t => t.shift === checklistCurrentShift);
    if (tasks.length === 0) return;

    const completed = tasks.filter(t => {
        return checklistData.completions.find(c =>
            c.taskId === t.id &&
            c.store === checklistCurrentStore &&
            c.shift === checklistCurrentShift &&
            c.date === checklistSelectedDate
        );
    }).length;

    const percentage = Math.round((completed / tasks.length) * 100);

    // Update the percentage display in the card header
    const cardHeader = document.querySelector('.card-header > div:last-child');
    if (cardHeader && cardHeader.textContent.includes('% complete')) {
        cardHeader.textContent = `${percentage}% complete`;
    }

    // Update store progress cards if visible
    updateStoreProgressCards();
}

// Update store progress cards
function updateStoreProgressCards() {
    const stores = ['Miramar', 'Morena', 'Kearny Mesa', 'Chula Vista', 'North Park'];

    stores.forEach(store => {
        const getCompletionPct = (targetStore, shift) => {
            const tasks = checklistData.tasks.filter(t => t.shift === shift);
            if (tasks.length === 0) return 0;
            const completed = tasks.filter(t => {
                return checklistData.completions.find(c =>
                    c.taskId === t.id &&
                    c.store === targetStore &&
                    c.shift === shift &&
                    c.date === checklistSelectedDate
                );
            }).length;
            return Math.round((completed / tasks.length) * 100);
        };

        const openingPct = getCompletionPct(store, 'opening');
        const closingPct = getCompletionPct(store, 'closing');
        const totalPct = Math.round((openingPct + closingPct) / 2);

        // Find and update progress bars for this store
        const storeCards = document.querySelectorAll('[onclick*="filterChecklistByStore"]');
        storeCards.forEach(card => {
            if (card.getAttribute('onclick')?.includes(store)) {
                // Update total percentage text
                const pctText = card.querySelector('div[style*="font-weight: 800"]');
                if (pctText) {
                    pctText.textContent = `${totalPct}%`;
                }

                // Update progress bars
                const progressBars = card.querySelectorAll('div[style*="height: 6px"]');
                progressBars.forEach((bar, index) => {
                    const innerBar = bar.querySelector('div');
                    if (innerBar) {
                        innerBar.style.width = `${index === 0 ? openingPct : closingPct}%`;
                    }
                });
            }
        });
    });
}

// Filter by store
window.filterChecklistByStore = function(store) {
    checklistCurrentStore = store;
    renderDailyChecklist();
}

// Switch shift
window.switchChecklistShift = function(shift) {
    checklistCurrentShift = shift;
    renderDailyChecklist();
}

// Open add task modal
window.openAddTaskModal = function(shift) {
    openModal('add-checklist-task', { shift, selectedDate: checklistSelectedDate });
}

// Add task from modal
window.addChecklistTaskFromModal = async function() {
    const task = document.getElementById('checklist-task-description')?.value?.trim();
    const shift = document.getElementById('checklist-task-shift')?.value;

    if (!task) {
        alert('Please enter a task description');
        return;
    }

    // Handle midshift tasks differently - save to midshiftTasks collection
    if (shift === 'midshift') {
        const dayOfWeek = document.querySelector('input[name="midshift-day"]:checked')?.value;
        if (!dayOfWeek) {
            alert('Please select a day of the week');
            return;
        }

        const result = await addMidshiftTask(task, dayOfWeek);
        if (result) {
            closeModal();
            const dayName = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
            showNotification(`Task added for ${dayName}!`, 'success');
            renderDailyChecklist();
        } else {
            alert('Error adding task. Please try again.');
        }
        return;
    }

    // Regular opening/closing tasks
    const duration = document.querySelector('input[name="checklist-task-duration"]:checked')?.value || 'permanent';
    const result = await addChecklistTask(task, shift, 'all', duration);
    if (result) {
        closeModal();
        showNotification(duration === 'one-time' ? 'Task added for today!' : 'Task added permanently!', 'success');
        renderDailyChecklist();
    } else {
        alert('Error adding task. Please try again.');
    }
}

// Add midshift task to Firebase
async function addMidshiftTask(task, dayOfWeek) {
    try {
        const db = firebase.firestore();
        const existingTasks = await db.collection('midshiftTasks').where('dayOfWeek', '==', dayOfWeek).get();
        const order = existingTasks.size + 1;

        const newTask = {
            task,
            dayOfWeek,
            order,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            isCustom: true
        };

        const docRef = await db.collection('midshiftTasks').add(newTask);
        newTask.id = docRef.id;
        newTask.shift = 'midshift';
        newTask.store = 'all';
        newTask.duration = 'permanent';

        // Add to local data if it's today's day
        if (dayOfWeek === getCurrentDayKey()) {
            checklistData.tasks.push(newTask);
        }

        return newTask;
    } catch (error) {
        console.error('Error adding midshift task:', error);
        return null;
    }
}

// Delete task
window.deleteChecklistTaskUI = async function(taskId) {
    if (!confirm('Delete this task? This will remove it for all stores.')) return;

    const success = await deleteChecklistTask(taskId);
    if (success) {
        showNotification('Task deleted', 'success');
        renderDailyChecklist();
    }
}

// Open photo capture for task
window.openPhotoForTask = function(taskId, store, shift) {
    // Store task info for after photo capture
    window.pendingChecklistPhoto = { taskId, store, shift };
    openCameraModal('checklist-photo-preview', 'checklist-photo-input');
}

// View checklist history - Admin sees all stores, others see their store only
window.viewChecklistHistory = async function() {
    const user = getCurrentUser();
    const isAdmin = user?.role === 'admin' || user?.role === 'manager';
    const userStore = user?.store || 'Miramar';

    const modal = document.createElement('div');
    modal.id = 'checklist-history-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    modal.onmousedown = (e) => { if (e.target === modal) modal.remove(); };

    let historyHtml = '<div style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

    modal.innerHTML = `
        <div style="background: var(--bg-primary); border-radius: 20px; max-width: 700px; width: 100%; max-height: 85vh; overflow: hidden; animation: modalSlideIn 0.3s ease;">
            <div style="padding: 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 18px;"><i class="fas fa-history" style="color: var(--accent-primary); margin-right: 8px;"></i> ${isAdmin ? 'All Stores Activity' : 'Checklist History'}</h3>
                <button onclick="document.getElementById('checklist-history-modal').remove()" style="background: none; border: none; cursor: pointer; padding: 8px;">
                    <i class="fas fa-times" style="color: var(--text-muted);"></i>
                </button>
            </div>
            <div id="history-content" style="padding: 16px; max-height: 600px; overflow-y: auto;">
                ${historyHtml}
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Load history
    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('checklistCompletions')
            .orderBy('completedAt', 'desc')
            .limit(100)
            .get();

        let completions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filter by store if not admin
        if (!isAdmin) {
            completions = completions.filter(c => c.store === userStore);
        }

        if (completions.length === 0) {
            historyHtml = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">No activity yet</div>';
        } else if (isAdmin) {
            // Admin view: Group by date, then by store
            const grouped = {};
            completions.forEach(c => {
                const date = c.date || 'Unknown';
                if (!grouped[date]) grouped[date] = {};
                if (!grouped[date][c.store]) grouped[date][c.store] = [];
                grouped[date][c.store].push(c);
            });

            // Store colors for visual distinction
            const storeColors = {
                'Miramar': '#3b82f6',
                'Morena': '#06b6d4',
                'Kearny Mesa': '#f97316',
                'Chula Vista': '#10b981',
                'North Park': '#8b5cf6'
            };

            historyHtml = Object.entries(grouped).map(([date, stores]) => `
                <div style="margin-bottom: 24px;">
                    <div style="font-weight: 600; margin-bottom: 16px; color: var(--text-primary); font-size: 15px; padding-bottom: 8px; border-bottom: 2px solid var(--border-color);">
                        <i class="fas fa-calendar-day" style="margin-right: 8px; color: var(--accent-primary);"></i>
                        ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                    ${Object.entries(stores).map(([store, items]) => `
                        <div style="margin-bottom: 16px; margin-left: 8px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: ${storeColors[store] || '#6b7280'};"></div>
                                <span style="font-weight: 600; color: ${storeColors[store] || '#6b7280'};">${store}</span>
                                <span style="font-size: 12px; color: var(--text-muted);">(${items.length} tasks)</span>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 6px; margin-left: 20px;">
                                ${items.map(item => {
                                    const task = checklistData.tasks.find(t => t.id === item.taskId);
                                    const time = item.completedAt?.toDate ? item.completedAt.toDate().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}) : '';
                                    return `
                                        <div style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--bg-secondary); border-radius: 8px; border-left: 3px solid ${storeColors[store] || '#6b7280'};">
                                            <i class="fas fa-check-circle" style="color: #10b981; font-size: 14px;"></i>
                                            <div style="flex: 1;">
                                                <div style="font-size: 13px; color: var(--text-primary);">${task?.task || 'Unknown task'}</div>
                                                <div style="font-size: 11px; color: var(--text-muted);">
                                                    <i class="fas fa-user" style="margin-right: 4px;"></i>${item.completedBy}
                                                    ${time ? `<span style="margin-left: 8px;"><i class="fas fa-clock" style="margin-right: 4px;"></i>${time}</span>` : ''}
                                                    <span style="margin-left: 8px; text-transform: uppercase; font-size: 10px; background: var(--bg-hover); padding: 2px 6px; border-radius: 4px;">${item.shift}</span>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `).join('');
        } else {
            // Regular user view: Group by date only
            const grouped = {};
            completions.forEach(c => {
                const date = c.date || 'Unknown';
                if (!grouped[date]) grouped[date] = [];
                grouped[date].push(c);
            });

            historyHtml = Object.entries(grouped).map(([date, items]) => `
                <div style="margin-bottom: 20px;">
                    <div style="font-weight: 600; margin-bottom: 12px; color: var(--text-muted); font-size: 13px; text-transform: uppercase;">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${items.map(item => {
                            const task = checklistData.tasks.find(t => t.id === item.taskId);
                            return `
                                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                                    <i class="fas fa-check-circle" style="color: #10b981;"></i>
                                    <div style="flex: 1;">
                                        <div style="font-size: 14px;">${task?.task || 'Unknown task'}</div>
                                        <div style="font-size: 12px; color: var(--text-muted);">${item.shift} - ${item.completedBy}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('');
        }

        document.getElementById('history-content').innerHTML = historyHtml;
    } catch (error) {
        console.error('Error loading checklist history:', error);
        document.getElementById('history-content').innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Error loading history</div>';
    }
}

        let currentRestockTab = 'inventory';
        let selectedStoreFilter = 'all';
        let selectedRestockTypeFilter = 'all'; // 'all', 'product', 'supply'
        let inventorySearchQuery = ''; // Search query for inventory
        let shopifyInventory = []; // Loaded from Shopify API
        let isLoadingInventory = false;
        let inventoryLoadError = null;
        let inventorySortColumn = null; // Current sort column ('stock', 'price', 'brand', 'product', etc.)
        let inventorySortDirection = 'asc'; // 'asc' or 'desc'
        let inventoryStockChart = null; // Chart.js instance for inventory stock chart
        let stockLevelsExpanded = false; // Track if stock levels chart is expanded

        // Toggle the Stock Levels chart dropdown
        function toggleStockLevelsChart() {
            const content = document.getElementById('stockLevelsContent');
            const chevron = document.getElementById('stockLevelsChevron');

            if (!content || !chevron) return;

            stockLevelsExpanded = !stockLevelsExpanded;

            if (stockLevelsExpanded) {
                content.style.display = 'block';
                chevron.style.transform = 'rotate(0deg)';
                // Initialize chart when expanded (if not already)
                displayInventoryStockChart();
            } else {
                content.style.display = 'none';
                chevron.style.transform = 'rotate(-90deg)';
            }
        }

        // Load inventory from Shopify API
        async function loadShopifyInventory(forceRefresh = false) {
            // Check if already loaded and not forcing refresh
            if (shopifyInventory.length > 0 && !forceRefresh) {
                return shopifyInventory;
            }

            // Check if fetchAllStoresInventory is available
            if (typeof fetchAllStoresInventory !== 'function') {
                console.warn('[Restock] fetchAllStoresInventory not available, using fallback');
                return inventory; // Use local fallback
            }

            isLoadingInventory = true;
            inventoryLoadError = null;

            try {
                console.log('[Restock] Loading inventory from all Shopify stores...');
                shopifyInventory = await fetchAllStoresInventory();
                return shopifyInventory;
            } catch (error) {
                console.error('[Restock] Error loading inventory:', error);
                inventoryLoadError = error.message;
                return inventory; // Use local fallback on error
            } finally {
                isLoadingInventory = false;
            }
        }

        // Running Low filter states
        let runningLowFilters = {
            store: 'all',
            urgency: 'all',
            category: 'all',
            orderStatus: 'all',
            dateRange: 'all',
            search: ''
        };

        // Inventory sorting state
        let inventorySortBy = 'date_desc'; // date_desc, date_asc, name_asc, name_desc, store

        // Inventory grouping state
        let inventoryGroupBy = 'none';

        // Multi-select state for bulk actions
        let selectedInventoryItems = new Set();

        // Running Low constants
        const RUNNING_LOW_STORES = ['Miramar', 'Loyal Vaper', 'MMWL', 'CV', 'NP', 'KM', 'MB', 'All Shops'];
        const RUNNING_LOW_URGENCIES = ['Low', 'High Priority', 'Sold Out'];
        const RUNNING_LOW_CATEGORIES = ['Detox', 'Coils/Pods', 'Wraps', 'Disposables', 'Juices', 'Heady', 'Glass', 'Smoke Shop', 'Vape Shop', 'Liquor', 'Cleaning Supplies', 'Office Supplies'];
        const RUNNING_LOW_STATUSES = ['Processing', 'Ordered', 'Not Ordered', 'Received'];
        const RUNNING_LOW_BRANDS = ['Elf Bar', 'Lost Mary', 'Geek Bar', 'Hyde', 'Breeze', 'SMOK', 'Vaporesso', 'JUUL', 'NJOY', 'Puff Bar', 'Flum', 'Funky Republic', 'RAZ', 'Orion Bar', 'Fume', 'Air Bar', 'Naked 100', 'Juice Head', 'Pachamama', 'Candy King', 'RAW', 'Backwoods', 'Dutch Masters', 'Swisher', 'High Hemp', 'King Palm', 'Elements', 'OCB', 'Zig-Zag'];

        async function renderRestockRequests() {
            const dashboard = document.querySelector('.dashboard');
            const user = getCurrentUser();
            const canEditRequests = user && (user.role === 'administrator' || user.role === 'manager' || user.role === 'admin');

            // Get all requests
            let allRequests = [...restockRequests];

            // Apply filters
            let filteredRequests = allRequests.filter(r => {
                // Store filter
                if (runningLowFilters.store !== 'all' && r.store !== runningLowFilters.store) return false;
                // Urgency filter
                if (runningLowFilters.urgency !== 'all' && r.urgency !== runningLowFilters.urgency) return false;
                // Category filter
                if (runningLowFilters.category !== 'all' && r.category !== runningLowFilters.category) return false;
                // Order status filter
                if (runningLowFilters.orderStatus !== 'all' && r.orderStatus !== runningLowFilters.orderStatus) return false;

                // Date range filter
                if (runningLowFilters.dateRange !== 'all' && r.requestDate) {
                    const itemDate = new Date(r.requestDate);
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                    if (runningLowFilters.dateRange === 'today') {
                        if (itemDate < today) return false;
                    } else if (runningLowFilters.dateRange === '7days') {
                        const sevenDaysAgo = new Date(today);
                        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                        if (itemDate < sevenDaysAgo) return false;
                    } else if (runningLowFilters.dateRange === '30days') {
                        const thirtyDaysAgo = new Date(today);
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        if (itemDate < thirtyDaysAgo) return false;
                    } else if (runningLowFilters.dateRange === '3months') {
                        const threeMonthsAgo = new Date(today);
                        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                        if (itemDate < threeMonthsAgo) return false;
                    }
                }

                // Search filter
                if (runningLowFilters.search && runningLowFilters.search.trim()) {
                    const searchLower = runningLowFilters.search.toLowerCase().trim();
                    const productName = (r.productName || r.name || '').toLowerCase();
                    const specifics = (r.specifics || r.quantity || '').toLowerCase();
                    const brand = (r.brand || '').toLowerCase();
                    if (!productName.includes(searchLower) && !specifics.includes(searchLower) && !brand.includes(searchLower)) {
                        return false;
                    }
                }

                return true;
            });

            // Apply sorting
            filteredRequests.sort((a, b) => {
                if (inventorySortBy === 'date_desc') {
                    return new Date(b.requestDate) - new Date(a.requestDate);
                } else if (inventorySortBy === 'date_asc') {
                    return new Date(a.requestDate) - new Date(b.requestDate);
                } else if (inventorySortBy === 'name_asc') {
                    return (a.productName || a.name || '').localeCompare(b.productName || b.name || '');
                } else if (inventorySortBy === 'name_desc') {
                    return (b.productName || b.name || '').localeCompare(a.productName || a.name || '');
                } else if (inventorySortBy === 'store') {
                    const storeCompare = (a.store || '').localeCompare(b.store || '');
                    if (storeCompare !== 0) return storeCompare;
                    return new Date(b.requestDate) - new Date(a.requestDate);
                }
                return new Date(b.requestDate) - new Date(a.requestDate);
            });

            // Apply grouping if selected (re-sort by group first)
            if (inventoryGroupBy !== 'none') {
                filteredRequests = filteredRequests.sort((a, b) => {
                    const aVal = (a[inventoryGroupBy] || 'Unknown').toLowerCase();
                    const bVal = (b[inventoryGroupBy] || 'Unknown').toLowerCase();
                    if (aVal < bVal) return -1;
                    if (aVal > bVal) return 1;
                    // Secondary sort by date
                    return new Date(b.requestDate) - new Date(a.requestDate);
                });
            }

            // Calculate stats
            const totalItems = allRequests.length;
            const lowStockSoldOut = allRequests.filter(r => r.urgency === 'High Priority' || r.urgency === 'Sold Out').length;
            const notOrdered = allRequests.filter(r => r.orderStatus === 'Not Ordered').length;
            const activeInventory = allRequests.filter(r => r.orderStatus !== 'Received').length;

            // Check if any filter is active
            const hasActiveFilters = runningLowFilters.store !== 'all' || runningLowFilters.urgency !== 'all' ||
                                    runningLowFilters.category !== 'all' || runningLowFilters.orderStatus !== 'all' ||
                                    runningLowFilters.dateRange !== 'all' || runningLowFilters.search.trim() !== '' ||
                                    inventorySortBy !== 'date_desc';

            // Color mappings for stores, categories, urgency, and status
            const storeColors = {
                'Loyal Vaper': { bg: '#ec4899', text: '#ffffff' },
                'MMWL': { bg: '#8b5cf6', text: '#ffffff' },
                'CV': { bg: '#06b6d4', text: '#ffffff' },
                'NP': { bg: '#f97316', text: '#ffffff' },
                'KM': { bg: '#84cc16', text: '#ffffff' },
                'MB': { bg: '#6366f1', text: '#ffffff' },
                'Miramar': { bg: '#22c55e', text: '#ffffff' },
                'MM': { bg: '#22c55e', text: '#ffffff' },
                'All Shops': { bg: '#64748b', text: '#ffffff' }
            };

            const categoryColors = {
                'Detox': { bg: '#3b82f6', text: '#ffffff' },
                'Coils/Pods': { bg: '#10b981', text: '#ffffff' },
                'Wraps': { bg: '#f59e0b', text: '#ffffff' },
                'Disposables': { bg: '#ec4899', text: '#ffffff' },
                'Juices': { bg: '#8b5cf6', text: '#ffffff' },
                'Heady': { bg: '#06b6d4', text: '#ffffff' },
                'Glass': { bg: '#6366f1', text: '#ffffff' },
                'Smoke Shop': { bg: '#f97316', text: '#ffffff' },
                'Vape Shop': { bg: '#14b8a6', text: '#ffffff' },
                'Liquor': { bg: '#ef4444', text: '#ffffff' },
                'Cleaning Supplies': { bg: '#0ea5e9', text: '#ffffff' },
                'Office Supplies': { bg: '#22c55e', text: '#ffffff' }
            };

            const urgencyColors = {
                'Low': { bg: '#fbbf24', text: '#1f2937' },
                'High Priority': { bg: '#f97316', text: '#ffffff' },
                'Sold Out': { bg: '#ef4444', text: '#ffffff' }
            };

            const statusColors = {
                'Not Ordered': { bg: '#ef4444', text: '#ffffff' },
                'Processing': { bg: '#f59e0b', text: '#ffffff' },
                'Ordered': { bg: '#22c55e', text: '#ffffff' },
                'Received': { bg: '#3b82f6', text: '#ffffff' }
            };

            dashboard.innerHTML = `
                <style>
                    .inventory-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
                    .inventory-filters { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; align-items: center; }
                    .inventory-filter-select { padding: 10px 14px; font-size: 13px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); cursor: pointer; min-width: 140px; }
                    .inventory-table-header { display: none; }
                    .inventory-card { background: var(--bg-card); border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid var(--border-color); }
                    .inventory-card-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
                    .inventory-card-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
                    .inventory-badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; }
                    .inv-dropdown-wrapper { position: relative; display: inline-block; }
                    .inv-dropdown-trigger { transition: all 0.15s ease; }
                    .inv-dropdown-trigger:hover { opacity: 0.85; transform: scale(1.02); }
                    .inv-dropdown-menu { animation: invDropdownFadeIn 0.15s ease; }
                    .inv-dropdown-item { transition: background 0.12s ease; font-size: 13px; color: var(--text-primary); }
                    .inv-dropdown-item:hover { background: var(--bg-tertiary); }
                    @keyframes invDropdownFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
                    .inv-editable-cell { transition: background 0.15s ease; }
                    .inv-editable-cell:hover { background: var(--bg-tertiary); }
                    .inv-editable-cell .fa-pencil-alt { transition: opacity 0.15s ease; }
                    .inv-editable-cell:hover .fa-pencil-alt { opacity: 1 !important; }
                    .inv-editable-input { padding: 6px 10px; font-size: 13px; border: 2px solid var(--primary-color); border-radius: 6px; background: var(--bg-card); color: var(--text-primary); width: 100%; outline: none; }

                    @media (min-width: 1024px) {
                        .inventory-table-header { display: grid; grid-template-columns: 40px 2fr 1fr 1.2fr 1.2fr 1fr 1.2fr 1fr 1fr 70px; padding: 14px 20px; background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                        .inventory-table-row { display: grid !important; grid-template-columns: 40px 2fr 1fr 1.2fr 1.2fr 1fr 1.2fr 1fr 1fr 70px; padding: 16px 20px; border-bottom: 1px solid var(--border-color); align-items: center; }
                        .inventory-card { display: none; }
                        .inventory-card-label { display: none; }
                    }

                    @media (max-width: 1023px) {
                        .inventory-kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
                        .inventory-table-row { display: none !important; }
                    }

                    @media (max-width: 640px) {
                        .inventory-kpi-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
                        .inventory-filter-select { min-width: calc(50% - 5px); flex: 1; }
                    }
                </style>

                <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
                    <div class="page-header-left">
                        <h2 class="section-title" style="font-size: 26px; font-weight: 700; margin: 0;">Inventory Management</h2>
                        <p style="color: var(--text-muted); font-size: 14px; margin: 4px 0 0 0;">Track stock levels, categorize items, and monitor order statuses</p>
                    </div>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn-secondary" onclick="exportInventoryReport()" style="padding: 12px 20px; border-radius: 10px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-file-export"></i> Export Report
                        </button>
                        <button class="btn-primary" onclick="openNewRestockRequestModal()" style="padding: 12px 24px; border-radius: 10px; font-weight: 600;">
                            <i class="fas fa-plus" style="margin-right: 6px;"></i> New Item
                        </button>
                    </div>
                </div>

                <!-- KPI Stats Cards -->
                <div class="inventory-kpi-grid">
                    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 12px; padding: 20px; color: white;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-box" style="font-size: 18px;"></i>
                            </div>
                            <div>
                                <div style="font-size: 28px; font-weight: 700;">${totalItems}</div>
                                <div style="font-size: 12px; opacity: 0.9;">Total Items</div>
                            </div>
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 12px; padding: 20px; color: white;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-exclamation-triangle" style="font-size: 18px;"></i>
                            </div>
                            <div>
                                <div style="font-size: 28px; font-weight: 700;">${lowStockSoldOut}</div>
                                <div style="font-size: 12px; opacity: 0.9;">Low Stock / Sold Out</div>
                            </div>
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; padding: 20px; color: white;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-shopping-cart" style="font-size: 18px;"></i>
                            </div>
                            <div>
                                <div style="font-size: 28px; font-weight: 700;">${notOrdered}</div>
                                <div style="font-size: 12px; opacity: 0.9;">Not Ordered</div>
                            </div>
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 20px; color: white;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-chart-line" style="font-size: 18px;"></i>
                            </div>
                            <div>
                                <div style="font-size: 28px; font-weight: 700;">${activeInventory}</div>
                                <div style="font-size: 12px; opacity: 0.9;">Active Inventory</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Store Buttons Row -->
                <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                    <button onclick="setRunningLowFilter('store', 'all')" style="padding: 14px 24px; font-size: 14px; font-weight: 600; border-radius: 12px; border: 2px solid ${runningLowFilters.store === 'all' ? '#6366f1' : 'var(--border-color)'}; background: ${runningLowFilters.store === 'all' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-secondary)'}; color: ${runningLowFilters.store === 'all' ? 'white' : 'var(--text-primary)'}; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-store"></i> All Stores
                        <span style="background: ${runningLowFilters.store === 'all' ? 'rgba(255,255,255,0.2)' : 'var(--bg-tertiary)'}; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${allRequests.length}</span>
                    </button>
                    ${RUNNING_LOW_STORES.map(store => {
                        const sc = storeColors[store] || { bg: '#6b7280', text: '#ffffff' };
                        const count = allRequests.filter(r => r.store === store).length;
                        const isActive = runningLowFilters.store === store;
                        return `<button onclick="setRunningLowFilter('store', '${store}')" style="padding: 14px 24px; font-size: 14px; font-weight: 600; border-radius: 12px; border: 2px solid ${isActive ? sc.bg : 'var(--border-color)'}; background: ${isActive ? sc.bg : 'var(--bg-secondary)'}; color: ${isActive ? 'white' : 'var(--text-primary)'}; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; opacity: ${count === 0 ? '0.5' : '1'};">
                            <span style="width: 12px; height: 12px; border-radius: 50%; background: ${sc.bg}; ${isActive ? 'box-shadow: 0 0 0 2px white;' : ''}"></span>
                            ${store}
                            <span style="background: ${isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-tertiary)'}; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${count}</span>
                        </button>`;
                    }).join('')}
                </div>

                <!-- Search & Sort Row -->
                <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;">
                    <div style="position: relative; flex: 1; min-width: 200px; max-width: 400px;">
                        <i class="fas fa-search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 14px;"></i>
                        <input type="text" id="inventory-search" placeholder="Search by name, brand, or specifics..."
                            value="${runningLowFilters.search}"
                            oninput="setRunningLowFilter('search', this.value)"
                            style="width: 100%; padding: 12px 14px 12px 42px; font-size: 14px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary);">
                    </div>
                    <select class="inventory-filter-select" onchange="setRunningLowFilter('dateRange', this.value)" style="background: ${runningLowFilters.dateRange !== 'all' ? 'var(--accent-primary)' : 'var(--bg-secondary)'}; color: ${runningLowFilters.dateRange !== 'all' ? 'white' : 'var(--text-primary)'};">
                        <option value="all" ${runningLowFilters.dateRange === 'all' ? 'selected' : ''}>All Time</option>
                        <option value="today" ${runningLowFilters.dateRange === 'today' ? 'selected' : ''}>Today</option>
                        <option value="7days" ${runningLowFilters.dateRange === '7days' ? 'selected' : ''}>Last 7 Days</option>
                        <option value="30days" ${runningLowFilters.dateRange === '30days' ? 'selected' : ''}>Last 30 Days</option>
                        <option value="3months" ${runningLowFilters.dateRange === '3months' ? 'selected' : ''}>Last 3 Months</option>
                    </select>
                    <select class="inventory-filter-select" onchange="setInventorySortBy(this.value)">
                        <option value="date_desc" ${inventorySortBy === 'date_desc' ? 'selected' : ''}>Newest First</option>
                        <option value="date_asc" ${inventorySortBy === 'date_asc' ? 'selected' : ''}>Oldest First</option>
                        <option value="name_asc" ${inventorySortBy === 'name_asc' ? 'selected' : ''}>Name A-Z</option>
                        <option value="name_desc" ${inventorySortBy === 'name_desc' ? 'selected' : ''}>Name Z-A</option>
                        <option value="store" ${inventorySortBy === 'store' ? 'selected' : ''}>By Store</option>
                    </select>
                    ${hasActiveFilters || inventoryGroupBy !== 'none' ? `
                        <button onclick="clearRunningLowFilters()" style="padding: 10px 16px; font-size: 13px; border-radius: 8px; border: none; background: #ef4444; color: white; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 500;">
                            <i class="fas fa-times" style="font-size: 11px;"></i> Clear All
                        </button>
                    ` : ''}
                </div>

                <!-- Filters Row -->
                <div class="inventory-filters">
                    <select class="inventory-filter-select" onchange="setRunningLowFilter('urgency', this.value)" style="background: ${runningLowFilters.urgency !== 'all' ? 'var(--accent-primary)' : 'var(--bg-secondary)'}; color: ${runningLowFilters.urgency !== 'all' ? 'white' : 'var(--text-primary)'};">
                        <option value="all" ${runningLowFilters.urgency === 'all' ? 'selected' : ''}>All Urgency</option>
                        ${RUNNING_LOW_URGENCIES.map(u => `<option value="${u}" ${runningLowFilters.urgency === u ? 'selected' : ''}>${u}</option>`).join('')}
                    </select>
                    <select class="inventory-filter-select" onchange="setRunningLowFilter('category', this.value)" style="background: ${runningLowFilters.category !== 'all' ? 'var(--accent-primary)' : 'var(--bg-secondary)'}; color: ${runningLowFilters.category !== 'all' ? 'white' : 'var(--text-primary)'};">
                        <option value="all" ${runningLowFilters.category === 'all' ? 'selected' : ''}>All Categories</option>
                        ${RUNNING_LOW_CATEGORIES.map(c => `<option value="${c}" ${runningLowFilters.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                    <select class="inventory-filter-select" onchange="setRunningLowFilter('orderStatus', this.value)" style="background: ${runningLowFilters.orderStatus !== 'all' ? 'var(--accent-primary)' : 'var(--bg-secondary)'}; color: ${runningLowFilters.orderStatus !== 'all' ? 'white' : 'var(--text-primary)'};">
                        <option value="all" ${runningLowFilters.orderStatus === 'all' ? 'selected' : ''}>All Statuses</option>
                        ${RUNNING_LOW_STATUSES.map(s => `<option value="${s}" ${runningLowFilters.orderStatus === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                    <select class="inventory-filter-select" onchange="setInventoryGroupBy(this.value)" style="background: ${inventoryGroupBy !== 'none' ? 'var(--accent-primary)' : 'var(--bg-secondary)'}; color: ${inventoryGroupBy !== 'none' ? 'white' : 'var(--text-primary)'};">
                        <option value="none" ${inventoryGroupBy === 'none' ? 'selected' : ''}>No Grouping</option>
                        <option value="store" ${inventoryGroupBy === 'store' ? 'selected' : ''}>Group by Store</option>
                        <option value="category" ${inventoryGroupBy === 'category' ? 'selected' : ''}>Group by Category</option>
                        <option value="brand" ${inventoryGroupBy === 'brand' ? 'selected' : ''}>Group by Brand</option>
                        <option value="urgency" ${inventoryGroupBy === 'urgency' ? 'selected' : ''}>Group by Urgency</option>
                        <option value="orderStatus" ${inventoryGroupBy === 'orderStatus' ? 'selected' : ''}>Group by Status</option>
                    </select>
                </div>

                <!-- Inventory Items -->
                <div style="background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden;">
                    <div style="padding: 16px 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 600; color: var(--text-primary); font-size: 16px;">Inventory Items</span>
                        <span style="font-size: 13px; color: var(--text-muted);">${filteredRequests.length} items</span>
                    </div>

                    <!-- Bulk Actions Bar (hidden by default) -->
                    <div id="bulk-actions-bar" style="display: none; padding: 12px 20px; background: linear-gradient(135deg, var(--accent-primary), #6366f1); color: white; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); flex-wrap: wrap; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span><strong><span id="selected-count">0</span></strong> items selected</span>
                            <button onclick="clearInventorySelection()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Clear</button>
                        </div>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button onclick="openSendTransferModal()" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                                <i class="fas fa-truck"></i> Send Transfer
                            </button>
                            <button onclick="openBulkActionModal()" style="background: white; color: var(--accent-primary); border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                                <i class="fas fa-edit"></i> Bulk Edit
                            </button>
                        </div>
                    </div>

                    ${filteredRequests.length === 0 ? `
                        <div style="padding: 60px 20px; text-align: center; color: var(--text-muted);">
                            <i class="fas fa-search" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i>
                            <p style="font-size: 15px; margin: 0; font-weight: 600;">No items found</p>
                            <p style="font-size: 13px; margin-top: 8px;">No items available</p>
                        </div>
                    ` : `
                        <!-- Desktop Table Header -->
                        <div class="inventory-table-header" style="grid-template-columns: 40px 2fr 1fr 1.2fr 1.2fr 1fr 1.2fr 1fr 1fr 70px;">
                            <div><input type="checkbox" id="select-all-inventory" onchange="toggleSelectAllInventory(this)" style="width: 18px; height: 18px; cursor: pointer;"></div>
                            <div>Item Name</div>
                            <div>Specifics</div>
                            <div>Store</div>
                            <div>Category</div>
                            <div>Urgency</div>
                            <div>Order Status</div>
                            <div>Date</div>
                            <div>Added By</div>
                            <div></div>
                        </div>

                        <!-- Items -->
                        <div class="inventory-items-container">
                            ${(() => {
                                let lastGroup = null;
                                let output = '';
                                filteredRequests.forEach((request, idx) => {
                                    // Add group header if grouping is enabled
                                    if (inventoryGroupBy !== 'none') {
                                        const currentGroup = request[inventoryGroupBy] || 'Unknown';
                                        if (currentGroup !== lastGroup) {
                                            const groupCount = filteredRequests.filter(r => (r[inventoryGroupBy] || 'Unknown') === currentGroup).length;
                                            output += '<div style="padding: 12px 20px; background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary)); border-bottom: 2px solid var(--accent-primary); margin-top: ' + (idx === 0 ? '0' : '8px') + ';"><span style="font-weight: 700; font-size: 15px; color: var(--accent-primary);">' + currentGroup + '</span><span style="margin-left: 10px; font-size: 13px; color: var(--text-muted);">(' + groupCount + ' items)</span></div>';
                                            lastGroup = currentGroup;
                                        }
                                    }

                                const reqId = request.firestoreId || request.id;
                                const storeStyle = storeColors[request.store] || { bg: '#6b7280', text: '#ffffff' };
                                const catStyle = categoryColors[request.category] || { bg: '#6b7280', text: '#ffffff' };
                                const urgStyle = urgencyColors[request.urgency] || { bg: '#6b7280', text: '#ffffff' };
                                const statStyle = statusColors[request.orderStatus] || statusColors['Not Ordered'];
                                const dateStr = request.requestDate ? new Date(request.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
                                const addedBy = request.requestedBy || request.addedBy || '-';

                                // Generate dropdown options
                                const storeOptions = RUNNING_LOW_STORES.map(s => {
                                    const sc = storeColors[s] || { bg: '#6b7280', text: '#ffffff' };
                                    return '<div class="inv-dropdown-item" onclick="event.stopPropagation(); updateInventoryField(\'' + reqId + '\', \'store\', \'' + s + '\')" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px;"><span style="width: 12px; height: 12px; border-radius: 50%; background: ' + sc.bg + ';"></span>' + s + '</div>';
                                }).join('');

                                const categoryOptions = RUNNING_LOW_CATEGORIES.map(c => {
                                    const cc = categoryColors[c] || { bg: '#6b7280', text: '#ffffff' };
                                    return '<div class="inv-dropdown-item" onclick="event.stopPropagation(); updateInventoryField(\'' + reqId + '\', \'category\', \'' + c + '\')" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px;"><span style="width: 12px; height: 12px; border-radius: 50%; background: ' + cc.bg + ';"></span>' + c + '</div>';
                                }).join('');

                                const urgencyOptions = RUNNING_LOW_URGENCIES.map(u => {
                                    const uc = urgencyColors[u] || { bg: '#6b7280', text: '#ffffff' };
                                    return '<div class="inv-dropdown-item" onclick="event.stopPropagation(); updateInventoryField(\'' + reqId + '\', \'urgency\', \'' + u + '\')" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px;"><span style="width: 12px; height: 12px; border-radius: 50%; background: ' + uc.bg + ';"></span>' + u + '</div>';
                                }).join('');

                                const statusOptions = RUNNING_LOW_STATUSES.map(s => {
                                    const sc = statusColors[s] || { bg: '#6b7280', text: '#ffffff' };
                                    return '<div class="inv-dropdown-item" onclick="event.stopPropagation(); updateInventoryField(\'' + reqId + '\', \'orderStatus\', \'' + s + '\')" style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px;"><span style="width: 12px; height: 12px; border-radius: 50%; background: ' + sc.bg + ';"></span>' + s + '</div>';
                                }).join('');

                                output += `
                                    <!-- Desktop Row -->
                                    <div class="inventory-table-row" style="font-size: 14px;">
                                        <div><input type="checkbox" class="inventory-item-checkbox" data-item-id="${reqId}" onchange="toggleInventoryItemSelect('${reqId}', this)" style="width: 18px; height: 18px; cursor: pointer;"></div>
                                        <div style="font-weight: 600; color: var(--text-primary);">${request.productName || request.name || '-'}</div>
                                        <div class="inv-editable-cell" onclick="makeSpecificsEditable(this, '${reqId}')" style="color: var(--text-secondary); cursor: pointer; padding: 4px 8px; border-radius: 6px; min-width: 60px;" title="Click to edit">
                                            <span class="specifics-display">${request.specifics || request.quantity || '-'}</span>
                                            <i class="fas fa-pencil-alt" style="font-size: 10px; margin-left: 6px; opacity: 0.5;"></i>
                                        </div>

                                        <!-- Store Dropdown -->
                                        <div class="inv-dropdown-wrapper" style="position: relative;">
                                            <span class="inventory-badge inv-dropdown-trigger" onclick="toggleInvDropdown(this)" style="background: ${storeStyle.bg}; color: ${storeStyle.text}; cursor: pointer;">${request.store || '-'} <i class="fas fa-chevron-down" style="font-size: 10px; margin-left: 4px;"></i></span>
                                            <div class="inv-dropdown-menu" style="display: none; position: absolute; top: 100%; left: 0; min-width: 160px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 100; max-height: 320px; overflow-y: auto;">
                                                ${storeOptions}
                                            </div>
                                        </div>

                                        <!-- Category Dropdown -->
                                        <div class="inv-dropdown-wrapper" style="position: relative;">
                                            <span class="inventory-badge inv-dropdown-trigger" onclick="toggleInvDropdown(this)" style="background: ${catStyle.bg}; color: ${catStyle.text}; cursor: pointer;">${request.category || '-'} <i class="fas fa-chevron-down" style="font-size: 10px; margin-left: 4px;"></i></span>
                                            <div class="inv-dropdown-menu" style="display: none; position: absolute; top: 100%; left: 0; min-width: 180px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 100; max-height: 250px; overflow-y: auto;">
                                                ${categoryOptions}
                                            </div>
                                        </div>

                                        <!-- Urgency Dropdown -->
                                        <div class="inv-dropdown-wrapper" style="position: relative;">
                                            <span class="inventory-badge inv-dropdown-trigger" onclick="toggleInvDropdown(this)" style="background: ${urgStyle.bg}; color: ${urgStyle.text}; cursor: pointer;">${request.urgency || '-'} <i class="fas fa-chevron-down" style="font-size: 10px; margin-left: 4px;"></i></span>
                                            <div class="inv-dropdown-menu" style="display: none; position: absolute; top: 100%; left: 0; min-width: 150px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 100;">
                                                ${urgencyOptions}
                                            </div>
                                        </div>

                                        <!-- Order Status Dropdown -->
                                        <div class="inv-dropdown-wrapper" style="position: relative;">
                                            <span class="inventory-badge inv-dropdown-trigger" onclick="toggleInvDropdown(this)" style="background: ${statStyle.bg}; color: ${statStyle.text}; cursor: pointer;">${request.orderStatus || 'Not Ordered'} <i class="fas fa-chevron-down" style="font-size: 10px; margin-left: 4px;"></i></span>
                                            <div class="inv-dropdown-menu" style="display: none; position: absolute; top: 100%; left: 0; min-width: 150px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 100;">
                                                ${statusOptions}
                                            </div>
                                        </div>

                                        <div style="color: var(--text-muted); font-size: 13px;">${dateStr}</div>
                                        <div style="color: var(--text-secondary);">${addedBy}</div>
                                        <div style="display: flex; gap: 4px; justify-content: flex-end;">
                                            <button onclick="openEditInventoryItemModal('${reqId}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px;" title="Edit"><i class="fas fa-pencil-alt"></i></button>
                                            <button onclick="deleteRestockRequest('${reqId}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px;" title="Delete"><i class="fas fa-trash"></i></button>
                                        </div>
                                    </div>

                                    <!-- Mobile Card -->
                                    <div class="inventory-card">
                                        <div style="font-weight: 700; font-size: 16px; color: var(--text-primary); margin-bottom: 12px;">${request.productName || request.name || '-'}</div>
                                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
                                            <div class="inv-dropdown-wrapper" style="position: relative;">
                                                <span class="inventory-badge inv-dropdown-trigger" onclick="toggleInvDropdown(this)" style="background: ${storeStyle.bg}; color: ${storeStyle.text}; cursor: pointer;">${request.store || '-'} <i class="fas fa-chevron-down" style="font-size: 9px; margin-left: 3px;"></i></span>
                                                <div class="inv-dropdown-menu" style="display: none; position: absolute; top: 100%; left: 0; min-width: 150px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 100; max-height: 320px; overflow-y: auto;">
                                                    ${storeOptions}
                                                </div>
                                            </div>
                                            <div class="inv-dropdown-wrapper" style="position: relative;">
                                                <span class="inventory-badge inv-dropdown-trigger" onclick="toggleInvDropdown(this)" style="background: ${catStyle.bg}; color: ${catStyle.text}; cursor: pointer;">${request.category || '-'} <i class="fas fa-chevron-down" style="font-size: 9px; margin-left: 3px;"></i></span>
                                                <div class="inv-dropdown-menu" style="display: none; position: absolute; top: 100%; left: 0; min-width: 160px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 100; max-height: 320px; overflow-y: auto;">
                                                    ${categoryOptions}
                                                </div>
                                            </div>
                                            <div class="inv-dropdown-wrapper" style="position: relative;">
                                                <span class="inventory-badge inv-dropdown-trigger" onclick="toggleInvDropdown(this)" style="background: ${urgStyle.bg}; color: ${urgStyle.text}; cursor: pointer;">${request.urgency || '-'} <i class="fas fa-chevron-down" style="font-size: 9px; margin-left: 3px;"></i></span>
                                                <div class="inv-dropdown-menu" style="display: none; position: absolute; top: 100%; left: 0; min-width: 140px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 100;">
                                                    ${urgencyOptions}
                                                </div>
                                            </div>
                                            <div class="inv-dropdown-wrapper" style="position: relative;">
                                                <span class="inventory-badge inv-dropdown-trigger" onclick="toggleInvDropdown(this)" style="background: ${statStyle.bg}; color: ${statStyle.text}; cursor: pointer;">${request.orderStatus || 'Not Ordered'} <i class="fas fa-chevron-down" style="font-size: 9px; margin-left: 3px;"></i></span>
                                                <div class="inv-dropdown-menu" style="display: none; position: absolute; top: 100%; left: 0; min-width: 140px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 100;">
                                                    ${statusOptions}
                                                </div>
                                            </div>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-muted); margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color);">
                                            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                                <span class="inv-editable-cell" onclick="makeSpecificsEditable(this, '${reqId}')" style="cursor: pointer; padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
                                                    <span class="specifics-display">${request.specifics || request.quantity || 'Add specifics'}</span>
                                                    <i class="fas fa-pencil-alt" style="font-size: 9px; opacity: 0.4;"></i>
                                                </span>
                                                <span style="opacity: 0.5;">•</span>
                                                <span>${dateStr}</span>
                                                <span style="opacity: 0.5;">•</span>
                                                <span>${addedBy}</span>
                                            </div>
                                            <div style="display: flex; gap: 8px;">
                                                <button onclick="openEditInventoryItemModal('${reqId}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;"><i class="fas fa-pencil-alt"></i></button>
                                                <button onclick="deleteRestockRequest('${reqId}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;"><i class="fas fa-trash"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                `;
                                });
                                return output;
                            })()}
                        </div>
                    `}
                </div>
            `;
        }

        // Running Low filter functions
        function setRunningLowFilter(filterType, value) {
            runningLowFilters[filterType] = value;
            renderRestockRequests();
        }

        function clearRunningLowFilters() {
            runningLowFilters = { store: 'all', urgency: 'all', category: 'all', orderStatus: 'all', dateRange: 'all', search: '' };
            inventoryGroupBy = 'none';
            inventorySortBy = 'date_desc';
            renderRestockRequests();
        }

        // Set inventory grouping
        function setInventoryGroupBy(groupBy) {
            inventoryGroupBy = groupBy;
            renderRestockRequests();
        }

        // Set inventory sorting
        function setInventorySortBy(sortBy) {
            inventorySortBy = sortBy;
            renderRestockRequests();
        }

        // Multi-select functions for bulk actions
        function toggleInventoryItemSelect(itemId, checkbox) {
            if (checkbox.checked) {
                selectedInventoryItems.add(itemId);
            } else {
                selectedInventoryItems.delete(itemId);
            }
            updateBulkActionsBar();
            updateSelectAllCheckbox();
        }

        function toggleSelectAllInventory(checkbox) {
            const allCheckboxes = document.querySelectorAll('.inventory-item-checkbox');
            allCheckboxes.forEach(cb => {
                cb.checked = checkbox.checked;
                const itemId = cb.dataset.itemId;
                if (checkbox.checked) {
                    selectedInventoryItems.add(itemId);
                } else {
                    selectedInventoryItems.delete(itemId);
                }
            });
            updateBulkActionsBar();
        }

        function updateSelectAllCheckbox() {
            const selectAllCb = document.getElementById('select-all-inventory');
            const allCheckboxes = document.querySelectorAll('.inventory-item-checkbox');
            if (selectAllCb && allCheckboxes.length > 0) {
                const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
                const someChecked = Array.from(allCheckboxes).some(cb => cb.checked);
                selectAllCb.checked = allChecked;
                selectAllCb.indeterminate = someChecked && !allChecked;
            }
        }

        function updateBulkActionsBar() {
            const bar = document.getElementById('bulk-actions-bar');
            const count = selectedInventoryItems.size;
            if (bar) {
                if (count > 0) {
                    bar.style.display = 'flex';
                    document.getElementById('selected-count').textContent = count;
                } else {
                    bar.style.display = 'none';
                }
            }
        }

        function clearInventorySelection() {
            selectedInventoryItems.clear();
            const allCheckboxes = document.querySelectorAll('.inventory-item-checkbox, #select-all-inventory');
            allCheckboxes.forEach(cb => cb.checked = false);
            updateBulkActionsBar();
        }

        // Send Transfer Modal - creates transfers from Running Low items
        function openSendTransferModal() {
            const count = selectedInventoryItems.size;
            if (count === 0) {
                showNotification('Please select items first', 'warning');
                return;
            }

            // Get selected items
            const selectedItems = restockRequests.filter(r => selectedInventoryItems.has(r.firestoreId || r.id));

            // Get all stores for dropdowns (exclude All Shops)
            const allStores = RUNNING_LOW_STORES.filter(s => s !== 'All Shops');

            // Pre-select destination if all items are from same store
            const itemStores = [...new Set(selectedItems.map(item => item.store))];
            const defaultDestination = itemStores.length === 1 ? itemStores[0] : '';

            const modalHtml = `
                <div id="send-transfer-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;">
                    <div style="background: var(--bg-card); border-radius: 16px; padding: 24px; max-width: 500px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-height: 90vh; overflow-y: auto;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="margin: 0; font-size: 18px;"><i class="fas fa-truck" style="margin-right: 8px; color: #10b981;"></i>Send Transfer</h3>
                            <button onclick="closeSendTransferModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-muted); line-height: 1;">&times;</button>
                        </div>

                        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
                            <div style="font-size: 24px; font-weight: 700;">${count} item${count > 1 ? 's' : ''}</div>
                            <div style="font-size: 13px; opacity: 0.8; margin-top: 4px;">Selected for transfer</div>
                        </div>

                        <div style="background: var(--bg-secondary); border-radius: 10px; padding: 12px; margin-bottom: 20px; max-height: 120px; overflow-y: auto;">
                            <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase;">Items:</div>
                            ${selectedItems.map(item => `
                                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-color); font-size: 13px;">
                                    <span style="font-weight: 500;">${item.productName || item.name}</span>
                                    <span style="color: var(--text-muted);">${item.specifics || item.quantity || '-'}</span>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Store Selection -->
                        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                            <div style="flex: 1;">
                                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 8px;">
                                    <i class="fas fa-sign-out-alt" style="margin-right: 6px; color: #ef4444;"></i>From *
                                </label>
                                <select id="transfer-source-store" class="form-input" style="width: 100%; padding: 12px; font-size: 14px;">
                                    <option value="">-- Origin --</option>
                                    ${allStores.map(s => '<option value="' + s + '">' + s + '</option>').join('')}
                                </select>
                            </div>
                            <div style="display: flex; align-items: center; padding-top: 28px;">
                                <i class="fas fa-arrow-right" style="color: var(--text-muted);"></i>
                            </div>
                            <div style="flex: 1;">
                                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 8px;">
                                    <i class="fas fa-sign-in-alt" style="margin-right: 6px; color: #10b981;"></i>To *
                                </label>
                                <select id="transfer-destination-store" class="form-input" style="width: 100%; padding: 12px; font-size: 14px;">
                                    <option value="">-- Destination --</option>
                                    ${allStores.map(s => '<option value="' + s + '"' + (s === defaultDestination ? ' selected' : '') + '>' + s + '</option>').join('')}
                                </select>
                            </div>
                        </div>

                        <div style="margin-bottom: 16px;">
                            <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 8px;">
                                <i class="fas fa-calendar" style="margin-right: 6px; color: var(--accent-primary);"></i>Ship Date
                            </label>
                            <input type="date" id="transfer-ship-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 12px; font-size: 14px;">
                        </div>

                        <div style="margin-bottom: 20px;">
                            <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 8px;">
                                <i class="fas fa-sticky-note" style="margin-right: 6px; color: var(--accent-primary);"></i>Notes (optional)
                            </label>
                            <textarea id="transfer-notes" class="form-input" rows="2" placeholder="Any additional notes..." style="width: 100%; padding: 12px; font-size: 14px; resize: vertical;"></textarea>
                        </div>

                        <div style="display: flex; gap: 12px;">
                            <button onclick="closeSendTransferModal()" style="flex: 1; padding: 14px; border-radius: 10px; border: 1px solid var(--border-color); background: transparent; cursor: pointer; font-weight: 600; font-size: 14px;">Cancel</button>
                            <button id="create-transfer-btn" onclick="createTransfersFromRunningLow()" style="flex: 1; padding: 14px; border-radius: 10px; border: none; background: #10b981; color: white; cursor: pointer; font-weight: 600; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <i class="fas fa-paper-plane"></i> Create Transfer
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        function closeSendTransferModal() {
            const modal = document.getElementById('send-transfer-modal');
            if (modal) modal.remove();
        }

        async function createTransfersFromRunningLow() {
            const sourceStore = document.getElementById('transfer-source-store').value;
            const destinationStore = document.getElementById('transfer-destination-store').value;
            const shipDate = document.getElementById('transfer-ship-date').value;
            const notes = document.getElementById('transfer-notes').value.trim();

            if (!sourceStore) {
                showNotification('Please select origin store (From)', 'warning');
                return;
            }

            if (!destinationStore) {
                showNotification('Please select destination store (To)', 'warning');
                return;
            }

            if (sourceStore === destinationStore) {
                showNotification('Origin and destination cannot be the same', 'warning');
                return;
            }

            const btn = document.getElementById('create-transfer-btn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

            try {
                // Get selected items
                const selectedItems = restockRequests.filter(r => selectedInventoryItems.has(r.firestoreId || r.id));

                // Get current user
                const user = getCurrentUser();
                const sentBy = user ? (user.name || user.email || 'Unknown') : 'Unknown';

                // Generate folio - get existing transfers count
                let folioNum = 1;
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    const db = firebase.firestore();
                    const snapshot = await db.collection('transfers').get();
                    folioNum = snapshot.size + 1;
                }

                // Create individual transfers for each item
                const createdTransfers = [];
                for (const item of selectedItems) {
                    const folio = 'TR-' + String(folioNum).padStart(4, '0');
                    folioNum++;

                    const transfer = {
                        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
                        folio: folio,
                        storeOrigin: sourceStore,
                        storeDestination: destinationStore,
                        productId: item.firestoreId || item.id,
                        productName: item.productName || item.name,
                        productSku: '',
                        quantity: parseInt(item.specifics) || parseInt(item.quantity) || 1,
                        shipDate: shipDate,
                        sentBy: sentBy,
                        notes: notes ? (notes + ' | From Running Low') : 'From Running Low',
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                        receivedAt: null,
                        receivedBy: null,
                        runningLowId: item.firestoreId || item.id // Link back to Running Low
                    };

                    // Save to Firebase
                    if (typeof firebase !== 'undefined' && firebase.firestore) {
                        const db = firebase.firestore();
                        await db.collection('transfers').doc(transfer.id).set(transfer);
                    }

                    // Also save to localStorage for transfers module
                    const localTransfers = JSON.parse(localStorage.getItem('storeTransfers') || '[]');
                    localTransfers.push(transfer);
                    localStorage.setItem('storeTransfers', JSON.stringify(localTransfers));

                    createdTransfers.push(transfer);
                }

                closeSendTransferModal();
                clearInventorySelection();
                showNotification(`${createdTransfers.length} transfer${createdTransfers.length > 1 ? 's' : ''} created successfully! Folio: ${createdTransfers.map(t => t.folio).join(', ')}`, 'success');

            } catch (error) {
                console.error('Error creating transfers:', error);
                showNotification('Error creating transfers. Please try again.', 'error');
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Create Transfer';
                }
            }
        }

        function openBulkActionModal() {
            const count = selectedInventoryItems.size;
            if (count === 0) return;

            const modalHtml = `
                <div id="bulk-action-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                    <div style="background: var(--bg-card); border-radius: 16px; padding: 24px; max-width: 450px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="margin: 0; font-size: 18px;"><i class="fas fa-layer-group" style="margin-right: 8px; color: var(--accent-primary);"></i>Bulk Actions</h3>
                            <button onclick="closeBulkActionModal()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-muted);">&times;</button>
                        </div>
                        <p style="color: var(--text-muted); margin-bottom: 20px;">${count} item${count > 1 ? 's' : ''} selected</p>

                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div>
                                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Change Store</label>
                                <select id="bulk-store" class="form-input" style="width: 100%;">
                                    <option value="">-- No change --</option>
                                    ${RUNNING_LOW_STORES.map(s => '<option value="' + s + '">' + s + '</option>').join('')}
                                </select>
                            </div>

                            <div>
                                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Change Urgency</label>
                                <select id="bulk-urgency" class="form-input" style="width: 100%;">
                                    <option value="">-- No change --</option>
                                    ${RUNNING_LOW_URGENCIES.map(u => '<option value="' + u + '">' + u + '</option>').join('')}
                                </select>
                            </div>

                            <div>
                                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Change Category</label>
                                <select id="bulk-category" class="form-input" style="width: 100%;">
                                    <option value="">-- No change --</option>
                                    ${RUNNING_LOW_CATEGORIES.map(c => '<option value="' + c + '">' + c + '</option>').join('')}
                                </select>
                            </div>

                            <div>
                                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Change Order Status</label>
                                <select id="bulk-status" class="form-input" style="width: 100%;">
                                    <option value="">-- No change --</option>
                                    ${RUNNING_LOW_STATUSES.map(s => '<option value="' + s + '">' + s + '</option>').join('')}
                                </select>
                            </div>
                        </div>

                        <div style="display: flex; gap: 12px; margin-top: 24px;">
                            <button onclick="closeBulkActionModal()" style="flex: 1; padding: 12px; border-radius: 10px; border: 1px solid var(--border-color); background: transparent; cursor: pointer; font-weight: 600;">Cancel</button>
                            <button onclick="applyBulkActions()" style="flex: 1; padding: 12px; border-radius: 10px; border: none; background: var(--accent-primary); color: white; cursor: pointer; font-weight: 600;">Apply Changes</button>
                        </div>

                        <div style="border-top: 1px solid var(--border-color); margin-top: 20px; padding-top: 16px;">
                            <button onclick="bulkDeleteSelected()" style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ef4444; background: transparent; color: #ef4444; cursor: pointer; font-weight: 600;">
                                <i class="fas fa-trash" style="margin-right: 6px;"></i>Delete Selected Items
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        function closeBulkActionModal() {
            const modal = document.getElementById('bulk-action-modal');
            if (modal) modal.remove();
        }

        async function applyBulkActions() {
            const store = document.getElementById('bulk-store').value;
            const urgency = document.getElementById('bulk-urgency').value;
            const category = document.getElementById('bulk-category').value;
            const status = document.getElementById('bulk-status').value;

            if (!store && !urgency && !category && !status) {
                alert('Please select at least one change to apply');
                return;
            }

            const updates = {};
            if (store) updates.store = store;
            if (urgency) updates.urgency = urgency;
            if (category) updates.category = category;
            if (status) updates.orderStatus = status;

            let successCount = 0;
            for (const itemId of selectedInventoryItems) {
                try {
                    if (firebaseRestockRequestsManager.isInitialized) {
                        await firebaseRestockRequestsManager.updateRestockRequest(itemId, updates);
                    }
                    // Update local array
                    const localItem = restockRequests.find(r => (r.firestoreId || r.id) === itemId);
                    if (localItem) {
                        Object.assign(localItem, updates);
                    }
                    successCount++;
                } catch (error) {
                    console.error('Error updating item:', itemId, error);
                }
            }

            closeBulkActionModal();
            clearInventorySelection();
            renderRestockRequests();
            showNotification(successCount + ' items updated successfully', 'success');
        }

        async function bulkDeleteSelected() {
            const count = selectedInventoryItems.size;
            if (!confirm('Are you sure you want to delete ' + count + ' items? This cannot be undone.')) {
                return;
            }

            let successCount = 0;
            for (const itemId of selectedInventoryItems) {
                try {
                    if (firebaseRestockRequestsManager.isInitialized) {
                        await firebaseRestockRequestsManager.deleteRestockRequest(itemId);
                    }
                    // Remove from local array
                    const idx = restockRequests.findIndex(r => (r.firestoreId || r.id) === itemId);
                    if (idx !== -1) restockRequests.splice(idx, 1);
                    successCount++;
                } catch (error) {
                    console.error('Error deleting item:', itemId, error);
                }
            }

            closeBulkActionModal();
            clearInventorySelection();
            renderRestockRequests();
            showNotification(successCount + ' items deleted', 'success');
        }

        // Expose bulk action functions globally
        window.toggleInventoryItemSelect = toggleInventoryItemSelect;
        window.toggleSelectAllInventory = toggleSelectAllInventory;
        window.openBulkActionModal = openBulkActionModal;
        window.closeBulkActionModal = closeBulkActionModal;
        window.applyBulkActions = applyBulkActions;
        window.bulkDeleteSelected = bulkDeleteSelected;
        window.clearInventorySelection = clearInventorySelection;
        window.openSendTransferModal = openSendTransferModal;
        window.closeSendTransferModal = closeSendTransferModal;
        window.createTransfersFromRunningLow = createTransfersFromRunningLow;

        // Export inventory report to CSV
        function exportInventoryReport() {
            const data = restockRequests;
            if (!data || data.length === 0) {
                showNotification('No inventory data to export', 'warning');
                return;
            }

            // Define CSV headers
            const headers = ['Item Name', 'Brand', 'Specifics', 'Store', 'Category', 'Urgency', 'Order Status', 'Added By', 'Date', 'Notes'];

            // Convert data to CSV rows
            const rows = data.map(item => [
                item.productName || item.name || '',
                item.brand || '',
                item.specifics || item.quantity || '',
                item.store || '',
                item.category || '',
                item.urgency || '',
                item.orderStatus || 'Not Ordered',
                item.requestedBy || item.addedBy || '',
                item.requestDate || '',
                (item.notes || '').replace(/"/g, '""') // Escape quotes
            ]);

            // Build CSV content
            let csvContent = headers.map(h => `"${h}"`).join(',') + '\n';
            rows.forEach(row => {
                csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
            });

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().split('T')[0];
            link.setAttribute('href', url);
            link.setAttribute('download', `inventory-report-${timestamp}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showNotification('Report exported successfully!', 'success');
        }

        // Export functions to window
        window.setInventoryGroupBy = setInventoryGroupBy;
        window.setInventorySortBy = setInventorySortBy;
        window.setRunningLowFilter = setRunningLowFilter;
        window.clearRunningLowFilters = clearRunningLowFilters;
        window.exportInventoryReport = exportInventoryReport;

        // Toggle inline dropdown for inventory management
        function toggleInvDropdown(trigger) {
            const wrapper = trigger.closest('.inv-dropdown-wrapper');
            const menu = wrapper.querySelector('.inv-dropdown-menu');
            const isOpen = menu.style.display === 'block';

            // Close all other dropdowns first
            document.querySelectorAll('.inv-dropdown-menu').forEach(m => {
                m.style.display = 'none';
            });

            // Toggle this dropdown
            if (!isOpen) {
                menu.style.display = 'block';

                // Add click outside listener
                setTimeout(() => {
                    document.addEventListener('click', closeInvDropdownsOnClickOutside);
                }, 10);
            }
        }

        // Close dropdowns when clicking outside
        function closeInvDropdownsOnClickOutside(e) {
            if (!e.target.closest('.inv-dropdown-wrapper')) {
                document.querySelectorAll('.inv-dropdown-menu').forEach(m => {
                    m.style.display = 'none';
                });
                document.removeEventListener('click', closeInvDropdownsOnClickOutside);
            }
        }

        // Make specifics field editable inline
        function makeSpecificsEditable(cell, itemId) {
            // Prevent if already editing
            if (cell.querySelector('.inv-editable-input')) return;

            const displaySpan = cell.querySelector('.specifics-display');
            const currentValue = displaySpan.textContent === '-' || displaySpan.textContent === 'Add specifics' ? '' : displaySpan.textContent;

            // Replace content with input
            cell.innerHTML = '<input type="text" class="inv-editable-input" value="' + currentValue + '" onblur="saveSpecificsField(this, \'' + itemId + '\')" onkeydown="if(event.key === \'Enter\') this.blur(); if(event.key === \'Escape\') { this.dataset.cancelled = \'true\'; this.blur(); }" placeholder="Enter specifics...">';

            const input = cell.querySelector('.inv-editable-input');
            input.focus();
            input.select();
        }

        // Save specifics field after editing
        async function saveSpecificsField(input, itemId) {
            const cell = input.parentElement;
            const newValue = input.value.trim();

            // If cancelled, just re-render
            if (input.dataset.cancelled === 'true') {
                renderRestockRequests();
                return;
            }

            // Update the field
            await updateInventoryField(itemId, 'specifics', newValue || '');
        }

        // Update inventory item field in Firebase
        async function updateInventoryField(itemId, field, value) {
            try {
                // Close the dropdown
                document.querySelectorAll('.inv-dropdown-menu').forEach(m => {
                    m.style.display = 'none';
                });

                // Find the item in local array
                const itemIndex = restockRequests.findIndex(r => (r.firestoreId || r.id) === itemId);
                if (itemIndex === -1) {
                    showNotification('Item not found', 'error');
                    return;
                }

                // Update locally first for instant feedback
                restockRequests[itemIndex][field] = value;

                // Update in Firebase
                if (firebaseRestockRequestsManager && firebaseRestockRequestsManager.isInitialized) {
                    await firebaseRestockRequestsManager.updateRestockRequest(itemId, { [field]: value });
                }

                // Re-render to show updated value
                renderRestockRequests();

                showNotification(`Updated ${field} to ${value}`, 'success');
            } catch (error) {
                console.error('Error updating inventory field:', error);
                showNotification('Error updating item', 'error');
            }
        }

        // Open edit modal for inventory item
        function openEditInventoryItemModal(itemId) {
            const item = restockRequests.find(r => (r.firestoreId || r.id) === itemId);
            if (!item) {
                showNotification('Item not found', 'error');
                return;
            }

            // Helper to escape HTML attributes
            function escapeAttr(str) {
                if (!str) return '';
                return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }

            const itemName = escapeAttr(item.productName || item.name || '');
            const itemSpecifics = escapeAttr(item.specifics || item.quantity || '');
            const itemNotes = escapeAttr(item.notes || '');

            const storeOptions = RUNNING_LOW_STORES.map(s =>
                '<option value="' + s + '"' + (item.store === s ? ' selected' : '') + '>' + s + '</option>'
            ).join('');

            const categoryOptions = RUNNING_LOW_CATEGORIES.map(c =>
                '<option value="' + c + '"' + (item.category === c ? ' selected' : '') + '>' + c + '</option>'
            ).join('');

            const urgencyOptions = RUNNING_LOW_URGENCIES.map(u =>
                '<option value="' + u + '"' + (item.urgency === u ? ' selected' : '') + '>' + u + '</option>'
            ).join('');

            const statusOptions = RUNNING_LOW_STATUSES.map(s =>
                '<option value="' + s + '"' + (item.orderStatus === s ? ' selected' : '') + '>' + s + '</option>'
            ).join('');

            const modalContent = '<div class="modal-header"><h3 style="margin: 0; font-size: 20px; font-weight: 700;">Edit Item</h3><button onclick="closeModal()" class="modal-close-btn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-muted);">&times;</button></div>' +
                '<div class="modal-body" style="padding: 20px;"><div style="display: grid; gap: 16px;">' +
                '<div><label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Item Name</label>' +
                '<input type="text" id="edit-inv-name" value="' + itemName + '" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px;"></div>' +
                '<div><label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Specifics</label>' +
                '<input type="text" id="edit-inv-specifics" value="' + itemSpecifics + '" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px;" placeholder="Size, color, quantity..."></div>' +
                '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">' +
                '<div><label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Store</label>' +
                '<select id="edit-inv-store" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px;"><option value="">Select Store</option>' + storeOptions + '</select></div>' +
                '<div><label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Category</label>' +
                '<select id="edit-inv-category" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px;"><option value="">Select Category</option>' + categoryOptions + '</select></div></div>' +
                '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">' +
                '<div><label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Urgency</label>' +
                '<select id="edit-inv-urgency" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px;"><option value="">Select Urgency</option>' + urgencyOptions + '</select></div>' +
                '<div><label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Order Status</label>' +
                '<select id="edit-inv-status" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px;"><option value="">Select Status</option>' + statusOptions + '</select></div></div>' +
                '<div><label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Notes</label>' +
                '<textarea id="edit-inv-notes" rows="3" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; resize: vertical;">' + itemNotes + '</textarea></div>' +
                '</div></div>' +
                '<div class="modal-footer" style="padding: 16px 20px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 12px;">' +
                '<button onclick="closeModal()" style="padding: 10px 20px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); cursor: pointer; font-weight: 500;">Cancel</button>' +
                '<button onclick="saveEditInventoryItem(\'' + itemId + '\')" style="padding: 10px 20px; border-radius: 8px; border: none; background: var(--primary-color); color: white; cursor: pointer; font-weight: 600;">Save Changes</button></div>';

            openModal('edit-inventory-item', modalContent);
        }

        // Save edited inventory item
        async function saveEditInventoryItem(itemId) {
            const name = document.getElementById('edit-inv-name').value.trim();
            const specifics = document.getElementById('edit-inv-specifics').value.trim();
            const store = document.getElementById('edit-inv-store').value;
            const category = document.getElementById('edit-inv-category').value;
            const urgency = document.getElementById('edit-inv-urgency').value;
            const orderStatus = document.getElementById('edit-inv-status').value;
            const notes = document.getElementById('edit-inv-notes').value.trim();

            if (!name) {
                showNotification('Item name is required', 'error');
                return;
            }

            try {
                const updates = {
                    productName: name,
                    name: name,
                    specifics: specifics,
                    store: store,
                    category: category,
                    urgency: urgency,
                    orderStatus: orderStatus,
                    notes: notes
                };

                // Update locally
                const itemIndex = restockRequests.findIndex(r => (r.firestoreId || r.id) === itemId);
                if (itemIndex !== -1) {
                    Object.assign(restockRequests[itemIndex], updates);
                }

                // Update in Firebase
                if (firebaseRestockRequestsManager && firebaseRestockRequestsManager.isInitialized) {
                    await firebaseRestockRequestsManager.updateRestockRequest(itemId, updates);
                }

                closeModal();
                renderRestockRequests();
                showNotification('Item updated successfully', 'success');
            } catch (error) {
                console.error('Error saving inventory item:', error);
                showNotification('Error saving changes', 'error');
            }
        }

        // Export functions to window for onclick handlers
        window.toggleInvDropdown = toggleInvDropdown;
        window.updateInventoryField = updateInventoryField;
        window.makeSpecificsEditable = makeSpecificsEditable;
        window.saveSpecificsField = saveSpecificsField;
        window.openEditInventoryItemModal = openEditInventoryItemModal;
        window.saveEditInventoryItem = saveEditInventoryItem;

        // Refresh inventory from Shopify
        async function refreshShopifyInventory() {
            const tabContent = document.getElementById('restock-tab-content');
            if (tabContent && currentRestockTab === 'inventory') {
                tabContent.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>Refreshing inventory from Shopify...</p></div>';
            }

            await loadShopifyInventory(true); // Force refresh

            if (tabContent && currentRestockTab === 'inventory') {
                tabContent.innerHTML = renderInventoryTab();
                displayInventoryStockChart();
            }
        }

        function renderInventoryTab() {
            // Use Shopify inventory if loaded, otherwise use local fallback
            const inventoryData = shopifyInventory.length > 0 ? shopifyInventory : inventory;

            // Filter by store
            let filteredInventory = selectedStoreFilter === 'all'
                ? inventoryData
                : inventoryData.filter(item => {
                    // Handle "Vape Smoke Universe" parent filter - show all VSU locations
                    if (selectedStoreFilter === 'VSU') {
                        return item.store.startsWith('VSU ') || item.storeKey === 'vsu';
                    }
                    // Handle specific VSU location filter
                    if (selectedStoreFilter.startsWith('VSU ')) {
                        return item.store === selectedStoreFilter;
                    }
                    // Handle store key or store name
                    return item.store === selectedStoreFilter || item.storeKey === selectedStoreFilter;
                });

            // Apply search filter
            if (inventorySearchQuery.trim()) {
                const query = inventorySearchQuery.toLowerCase().trim();
                filteredInventory = filteredInventory.filter(item => {
                    return (
                        (item.brand && item.brand.toLowerCase().includes(query)) ||
                        (item.productName && item.productName.toLowerCase().includes(query)) ||
                        (item.flavor && item.flavor.toLowerCase().includes(query)) ||
                        (item.sku && item.sku.toLowerCase().includes(query)) ||
                        (item.store && item.store.toLowerCase().includes(query)) ||
                        (item.productType && item.productType.toLowerCase().includes(query))
                    );
                });
            }

            // Apply sorting
            if (inventorySortColumn) {
                filteredInventory = [...filteredInventory].sort((a, b) => {
                    let aVal, bVal;

                    switch (inventorySortColumn) {
                        case 'stock':
                            aVal = parseInt(a.stock) || 0;
                            bVal = parseInt(b.stock) || 0;
                            break;
                        case 'price':
                            aVal = parseFloat(a.unitPrice) || 0;
                            bVal = parseFloat(b.unitPrice) || 0;
                            break;
                        case 'brand':
                            aVal = (a.brand || '').toLowerCase();
                            bVal = (b.brand || '').toLowerCase();
                            break;
                        case 'product':
                            aVal = (a.productName || '').toLowerCase();
                            bVal = (b.productName || '').toLowerCase();
                            break;
                        case 'store':
                            aVal = (a.store || '').toLowerCase();
                            bVal = (b.store || '').toLowerCase();
                            break;
                        default:
                            return 0;
                    }

                    // Compare values
                    if (typeof aVal === 'number' && typeof bVal === 'number') {
                        return inventorySortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                    } else {
                        if (aVal < bVal) return inventorySortDirection === 'asc' ? -1 : 1;
                        if (aVal > bVal) return inventorySortDirection === 'asc' ? 1 : -1;
                        return 0;
                    }
                });
            }

            // Get unique stores for filter dropdown (dynamically from data)
            const stores = [...new Set(inventoryData.map(item => item.store))].sort();

            // Separate VSU locations from other stores
            const vsuLocations = stores.filter(s => s.startsWith('VSU '));
            const otherStores = stores.filter(s => !s.startsWith('VSU '));

            // Count all VSU items
            const vsuCount = inventoryData.filter(i => i.store.startsWith('VSU ') || i.storeKey === 'vsu').length;

            // Build store options with VSU as parent option + individual locations as sub-options
            let storeOptions = '';

            // Add VSU parent option if there are VSU locations
            if (vsuLocations.length > 0) {
                storeOptions += `<option value="VSU" ${selectedStoreFilter === 'VSU' ? 'selected' : ''}>Vape Smoke Universe (${vsuCount})</option>`;
                // Add individual VSU locations as indented sub-options
                vsuLocations.forEach(store => {
                    const count = inventoryData.filter(i => i.store === store).length;
                    storeOptions += `<option value="${store}" ${selectedStoreFilter === store ? 'selected' : ''}>&nbsp;&nbsp;&nbsp;└ ${store.replace('VSU ', '')} (${count})</option>`;
                });
            }

            // Add other stores
            otherStores.forEach(store => {
                const count = inventoryData.filter(i => i.store === store).length;
                storeOptions += `<option value="${store}" ${selectedStoreFilter === store ? 'selected' : ''}>${store} (${count})</option>`;
            });

            // Error message if loading failed
            const errorMessage = inventoryLoadError ? `
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger); border-radius: 8px; padding: 12px; margin-bottom: 16px; color: var(--danger);">
                    <i class="fas fa-exclamation-triangle"></i> Failed to load from Shopify: ${inventoryLoadError}. Showing local data.
                </div>
            ` : '';

            // Data source indicator
            const dataSource = shopifyInventory.length > 0
                ? `<span style="background: var(--success); color: white; font-size: 10px; padding: 2px 8px; border-radius: 4px; margin-left: 8px;"><i class="fas fa-cloud"></i> Live from Shopify</span>`
                : `<span style="background: var(--warning); color: white; font-size: 10px; padding: 2px 8px; border-radius: 4px; margin-left: 8px;"><i class="fas fa-database"></i> Local Data</span>`;

            return `
                ${errorMessage}
                <div style="background: var(--bg-secondary); border-radius: 12px; margin-bottom: 16px; border: 1px solid var(--border-color); overflow: hidden;">
                    <div onclick="toggleStockLevelsChart()" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; cursor: pointer; user-select: none;" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='transparent'">
                        <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: var(--text-primary);">
                            <i class="fas fa-chart-bar" style="margin-right: 8px; color: var(--primary);"></i>
                            Stock Levels (Lowest 20)
                        </h4>
                        <i class="fas fa-chevron-down" id="stockLevelsChevron" style="color: var(--text-muted); transition: transform 0.3s; transform: rotate(-90deg);"></i>
                    </div>
                    <div id="stockLevelsContent" style="display: none; padding: 0 16px 16px 16px;">
                        <div style="position: relative; height: 200px; width: 100%;">
                            <canvas id="inventoryStockChart"></canvas>
                        </div>
                        <div id="inventoryChartImages" style="position: relative; height: 56px; margin-top: 8px;"></div>
                    </div>
                    <!-- Image hover popup -->
                    <div id="inventoryImagePopup" style="display: none; position: fixed; z-index: 9999; pointer-events: none; background: var(--bg-primary); border: 2px solid var(--border-color); border-radius: 12px; padding: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
                        <img id="inventoryImagePopupImg" src="" style="width: 180px; height: 180px; object-fit: contain; border-radius: 8px; display: block;">
                        <div id="inventoryImagePopupText" style="text-align: center; margin-top: 8px; font-size: 12px; color: var(--text-primary); max-width: 180px; word-wrap: break-word;"></div>
                    </div>
                </div>
                <div class="restock-filter-header" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                        <div style="position: relative;">
                            <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 14px;"></i>
                            <input type="text"
                                id="inventory-search"
                                class="form-input"
                                placeholder="Search by name, brand, SKU, variant..."
                                value="${inventorySearchQuery}"
                                oninput="searchInventory(this.value)"
                                style="width: 300px; padding-left: 36px;">
                        </div>
                        <select class="form-input" id="store-filter" onchange="filterInventoryByStore(this.value)" style="width: 200px;">
                            <option value="all" ${selectedStoreFilter === 'all' ? 'selected' : ''}>All Stores (${inventoryData.length})</option>
                            ${storeOptions}
                        </select>
                        ${inventorySearchQuery || selectedStoreFilter !== 'all' ? `
                            <button onclick="clearInventoryFilters()" style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary); color: var(--text-secondary); cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 6px;">
                                <i class="fas fa-times"></i> Clear Filters
                            </button>
                        ` : ''}
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted);">
                        Showing ${filteredInventory.length} ${filteredInventory.length === 1 ? 'item' : 'items'}
                        ${dataSource}
                    </div>
                </div>

                <div class="licenses-table-container" style="max-height: 600px; overflow-y: auto;">
                    <table class="data-table restock-inventory-table">
                        <thead style="position: sticky; top: 0; background: var(--bg-primary); z-index: 10;">
                            <tr>
                                <th onclick="sortInventoryBy('store')" style="cursor: pointer; user-select: none;" title="Click to sort by store">
                                    Store ${inventorySortColumn === 'store' ? (inventorySortDirection === 'asc' ? '<i class="fas fa-sort-up" style="margin-left: 4px;"></i>' : '<i class="fas fa-sort-down" style="margin-left: 4px;"></i>') : '<i class="fas fa-sort" style="margin-left: 4px; opacity: 0.3;"></i>'}
                                </th>
                                <th onclick="sortInventoryBy('brand')" style="cursor: pointer; user-select: none;" title="Click to sort by brand">
                                    Brand ${inventorySortColumn === 'brand' ? (inventorySortDirection === 'asc' ? '<i class="fas fa-sort-up" style="margin-left: 4px;"></i>' : '<i class="fas fa-sort-down" style="margin-left: 4px;"></i>') : '<i class="fas fa-sort" style="margin-left: 4px; opacity: 0.3;"></i>'}
                                </th>
                                <th onclick="sortInventoryBy('product')" style="cursor: pointer; user-select: none;" title="Click to sort by product">
                                    Product Name ${inventorySortColumn === 'product' ? (inventorySortDirection === 'asc' ? '<i class="fas fa-sort-up" style="margin-left: 4px;"></i>' : '<i class="fas fa-sort-down" style="margin-left: 4px;"></i>') : '<i class="fas fa-sort" style="margin-left: 4px; opacity: 0.3;"></i>'}
                                </th>
                                <th>Variant</th>
                                <th>SKU</th>
                                <th onclick="sortInventoryBy('price')" style="cursor: pointer; user-select: none;" title="Click to sort by price">
                                    Unit Price ${inventorySortColumn === 'price' ? (inventorySortDirection === 'asc' ? '<i class="fas fa-sort-up" style="margin-left: 4px;"></i>' : '<i class="fas fa-sort-down" style="margin-left: 4px;"></i>') : '<i class="fas fa-sort" style="margin-left: 4px; opacity: 0.3;"></i>'}
                                </th>
                                <th onclick="sortInventoryBy('stock')" style="cursor: pointer; user-select: none;" title="Click to sort by stock">
                                    Stock ${inventorySortColumn === 'stock' ? (inventorySortDirection === 'asc' ? '<i class="fas fa-sort-up" style="margin-left: 4px;"></i>' : '<i class="fas fa-sort-down" style="margin-left: 4px;"></i>') : '<i class="fas fa-sort" style="margin-left: 4px; opacity: 0.3;"></i>'}
                                </th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredInventory.length > 0 ? filteredInventory.map(item => {
                                // Highlight search matches
                                const highlightText = (text, query) => {
                                    if (!query || !text) return text || '';
                                    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                                    return text.replace(regex, '<mark style="background: var(--warning); color: var(--text-primary); padding: 0 2px; border-radius: 2px;">$1</mark>');
                                };
                                const q = inventorySearchQuery.toLowerCase().trim();

                                return `
                                <tr>
                                    <td data-label="Store">
                                        <span style="font-weight: 600; font-size: 11px; padding: 4px 8px; border-radius: 4px; background: ${getStoreColor(item.store)}; color: white;">
                                            ${item.store}
                                        </span>
                                    </td>
                                    <td data-label="Brand" style="font-weight: 600;">${q ? highlightText(item.brand, q) : item.brand}</td>
                                    <td data-label="Product">${q ? highlightText(item.productName, q) : item.productName}</td>
                                    <td data-label="Variant" style="font-size: 12px; color: var(--text-secondary);">${q ? highlightText(item.flavor || 'N/A', q) : (item.flavor || 'N/A')}</td>
                                    <td data-label="SKU" style="font-size: 11px; font-family: monospace; color: var(--text-muted);">${q ? highlightText(item.sku || '-', q) : (item.sku || '-')}</td>
                                    <td data-label="Price" style="font-weight: 600; color: var(--success);">$${parseFloat(item.unitPrice).toFixed(2)}</td>
                                    <td data-label="Stock">
                                        <span style="font-weight: 600; color: ${item.stock < item.minStock ? 'var(--danger)' : item.stock < item.minStock * 2 ? 'var(--warning)' : 'var(--success)'};">
                                            ${item.stock}
                                        </span>
                                        ${item.stock < item.minStock ? '<i class="fas fa-exclamation-triangle" style="color: var(--danger); margin-left: 4px;" title="Low stock"></i>' : ''}
                                    </td>
                                    <td data-label="Status">
                                        <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: ${item.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)'}; color: ${item.status === 'ACTIVE' ? 'var(--success)' : 'var(--text-muted)'};">
                                            ${item.status || 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            `}).join('') : `
                                <tr>
                                    <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
                                        <i class="fas fa-inbox" style="font-size: 32px; margin-bottom: 12px; display: block;"></i>
                                        ${inventorySearchQuery ? `No items found matching "${inventorySearchQuery}"` : 'No inventory items found'}
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // Dynamic search for inventory
        let inventorySearchTimeout = null;
        function searchInventory(query) {
            // Debounce search to avoid too many re-renders
            clearTimeout(inventorySearchTimeout);
            inventorySearchTimeout = setTimeout(() => {
                inventorySearchQuery = query;
                const tabContent = document.getElementById('restock-tab-content');
                if (tabContent && currentRestockTab === 'inventory') {
                    tabContent.innerHTML = renderInventoryTab();
                    displayInventoryStockChart();
                    // Restore focus to search input
                    const searchInput = document.getElementById('inventory-search');
                    if (searchInput) {
                        searchInput.focus();
                        searchInput.setSelectionRange(query.length, query.length);
                    }
                }
            }, 150);
        }

        // Clear all inventory filters
        function clearInventoryFilters() {
            inventorySearchQuery = '';
            selectedStoreFilter = 'all';
            inventorySortColumn = null;
            inventorySortDirection = 'asc';
            const tabContent = document.getElementById('restock-tab-content');
            if (tabContent && currentRestockTab === 'inventory') {
                tabContent.innerHTML = renderInventoryTab();
                displayInventoryStockChart();
            }
        }

        // Sort inventory by column
        function sortInventoryBy(column) {
            // If clicking the same column, toggle direction
            if (inventorySortColumn === column) {
                inventorySortDirection = inventorySortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                // New column, default to ascending (except stock defaults to ascending to show lowest first)
                inventorySortColumn = column;
                inventorySortDirection = 'asc';
            }

            // Re-render the table
            const tabContent = document.getElementById('restock-tab-content');
            if (tabContent && currentRestockTab === 'inventory') {
                tabContent.innerHTML = renderInventoryTab();
                displayInventoryStockChart();
            }
        }

        // Display inventory stock chart (shows lowest stock items)
        function displayInventoryStockChart() {
            const ctx = document.getElementById('inventoryStockChart');
            const imagesContainer = document.getElementById('inventoryChartImages');
            if (!ctx) return;

            // Get inventory data
            const inventoryData = shopifyInventory.length > 0 ? shopifyInventory : inventory;

            // Filter by current store filter
            let filteredData = selectedStoreFilter === 'all'
                ? inventoryData
                : inventoryData.filter(item => {
                    if (selectedStoreFilter === 'VSU') {
                        return item.store.startsWith('VSU ') || item.storeKey === 'vsu';
                    }
                    if (selectedStoreFilter.startsWith('VSU ')) {
                        return item.store === selectedStoreFilter;
                    }
                    return item.store === selectedStoreFilter || item.storeKey === selectedStoreFilter;
                });

            // Apply search filter if active
            if (inventorySearchQuery.trim()) {
                const query = inventorySearchQuery.toLowerCase().trim();
                filteredData = filteredData.filter(item => {
                    return (
                        (item.brand && item.brand.toLowerCase().includes(query)) ||
                        (item.productName && item.productName.toLowerCase().includes(query)) ||
                        (item.flavor && item.flavor.toLowerCase().includes(query)) ||
                        (item.sku && item.sku.toLowerCase().includes(query)) ||
                        (item.store && item.store.toLowerCase().includes(query))
                    );
                });
            }

            // Sort by stock ascending and take lowest 20
            const lowestStock = [...filteredData]
                .sort((a, b) => (parseInt(a.stock) || 0) - (parseInt(b.stock) || 0))
                .slice(0, 20);

            // Prepare chart data - use empty labels since we'll show images instead
            const labels = lowestStock.map(() => '');

            const stockData = lowestStock.map(item => parseInt(item.stock) || 0);

            // Calculate min/max for symmetric axis around 0
            const minStock = Math.min(...stockData);
            const maxStock = Math.max(...stockData);
            const absMax = Math.max(Math.abs(minStock), Math.abs(maxStock), 10); // At least 10 for visibility

            // Color based on stock level
            const backgroundColors = lowestStock.map(item => {
                const stock = parseInt(item.stock) || 0;
                const itemMinStock = item.minStock || 10;
                if (stock < 0) return 'rgba(248, 87, 87, 1)'; // Red - negative stock
                if (stock === 0) return 'rgba(255, 54, 54, 0.8)'; // Red - out of stock
                if (stock < itemMinStock) return 'rgba(245, 158, 11, 0.8)'; // Orange - low stock
                if (stock < itemMinStock * 2) return 'rgba(234, 179, 8, 0.8)'; // Yellow - getting low
                return 'rgba(34, 197, 94, 0.8)'; // Green - good stock
            });

            const borderColors = backgroundColors.map(c => c.replace('0.8', '1'));

            // Destroy existing chart
            if (inventoryStockChart) {
                inventoryStockChart.destroy();
            }

            // Create new chart
            inventoryStockChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Stock Quantity',
                        data: stockData,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 0,
                        borderRadius: 0,
                        barThickness: 48, // Same width as images (48px)
                        maxBarThickness: 48
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 0 // Disable animation to prevent resize issues
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                title: function(context) {
                                    const idx = context[0].dataIndex;
                                    const item = lowestStock[idx];
                                    return item.productName + (item.flavor && item.flavor !== 'N/A' ? ` - ${item.flavor}` : '');
                                },
                                label: function(context) {
                                    return `Stock: ${context.raw} units`;
                                },
                                afterLabel: function(context) {
                                    const idx = context.dataIndex;
                                    const item = lowestStock[idx];
                                    return `Store: ${item.store}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                display: false // Hide x-axis labels - we'll show images instead
                            }
                        },
                        y: {
                            min: -absMax,
                            max: absMax,
                            grid: {
                                color: function(context) {
                                    // Make the zero line more visible
                                    if (context.tick.value === 0) {
                                        return 'rgba(255, 255, 255, 0.5)';
                                    }
                                    return 'rgba(255, 255, 255, 0.1)';
                                },
                                lineWidth: function(context) {
                                    return context.tick.value === 0 ? 2 : 1;
                                }
                            },
                            ticks: {
                                color: 'var(--text-muted)',
                                font: { size: 11 }
                            }
                        }
                    }
                }
            });

            // Render product images below the chart - positioned to match bar centers
            if (imagesContainer) {
                const defaultImage = 'data:image/svg+xml,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                        <rect fill="#374151" width="48" height="48" rx="6"/>
                        <text x="24" y="30" fill="#9CA3AF" font-size="14" text-anchor="middle" font-family="Arial">?</text>
                    </svg>
                `);

                // Debug: Log image URLs
                console.log('[Inventory Chart] Product images:');
                lowestStock.forEach((item, idx) => {
                    console.log(`  [${idx}] ${item.productName}: imageUrl =`, item.imageUrl);
                });

                // Wait for chart to render, then position images based on bar positions
                setTimeout(() => {
                    const chartArea = inventoryStockChart.chartArea;
                    const xScale = inventoryStockChart.scales.x;

                    if (!chartArea || !xScale) return;

                    // Get the container's position relative to the chart
                    const containerRect = imagesContainer.getBoundingClientRect();
                    const canvasRect = ctx.getBoundingClientRect();
                    const offsetLeft = canvasRect.left - containerRect.left;

                    imagesContainer.innerHTML = lowestStock.map((item, index) => {
                        const imgSrc = item.imageUrl || defaultImage;
                        const title = item.productName + (item.flavor && item.flavor !== 'N/A' ? ` - ${item.flavor}` : '');

                        // Get the x position of each bar from the chart scale
                        const barX = xScale.getPixelForValue(index);
                        const leftPos = barX + offsetLeft - 24; // Center the 48px image on the bar

                        return `
                            <div
                                style="position: absolute; left: ${leftPos}px; top: 0; width: 48px;"
                                onmouseenter="showInventoryImagePopup(event, '${imgSrc.replace(/'/g, "\\'")}', '${title.replace(/'/g, "\\'")}', ${item.stock}, '${item.store}')"
                                onmousemove="moveInventoryImagePopup(event)"
                                onmouseleave="hideInventoryImagePopup()"
                            >
                                <img
                                    src="${imgSrc}"
                                    alt="${title}"
                                    style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-primary); cursor: pointer;"
                                    onerror="this.src='${defaultImage}'"
                                />
                            </div>
                        `;
                    }).join('');
                }, 100);
            }
        }

        // Show image popup on hover
        function showInventoryImagePopup(event, imgSrc, title, stock, store) {
            const popup = document.getElementById('inventoryImagePopup');
            const popupImg = document.getElementById('inventoryImagePopupImg');
            const popupText = document.getElementById('inventoryImagePopupText');

            if (!popup || !popupImg || !popupText) return;

            popupImg.src = imgSrc;
            popupText.innerHTML = `<strong>${title}</strong><br>Stock: ${stock}<br>Store: ${store}`;
            popup.style.display = 'block';

            moveInventoryImagePopup(event);
        }

        // Move popup with mouse
        function moveInventoryImagePopup(event) {
            const popup = document.getElementById('inventoryImagePopup');
            if (!popup) return;

            const x = event.clientX + 15;
            const y = event.clientY - 100;

            // Keep popup within viewport
            const rect = popup.getBoundingClientRect();
            const maxX = window.innerWidth - 220;
            const maxY = window.innerHeight - 250;

            popup.style.left = Math.min(x, maxX) + 'px';
            popup.style.top = Math.max(10, Math.min(y, maxY)) + 'px';
        }

        // Hide image popup
        function hideInventoryImagePopup() {
            const popup = document.getElementById('inventoryImagePopup');
            if (popup) {
                popup.style.display = 'none';
            }
        }

        // Get store color for badges
        function getStoreColor(storeName) {
            const colors = {
                'VSU': '#6366f1',
                'VSU Miramar': '#6366f1',
                'VSU Morena': '#8b5cf6',
                'VSU Kearny Mesa': '#3b82f6',
                'VSU Chula Vista': '#ec4899',
                'VSU North Park': '#14b8a6',
                'Loyal Vaper': '#10b981',
                'Miramar Wine & Liquor': '#f59e0b',
                'Miramar': '#6366f1',
                'Morena': '#8b5cf6',
                'Kearny Mesa': '#3b82f6',
                'Chula Vista': '#ec4899',
                'North Park': '#14b8a6'
            };
            return colors[storeName] || '#6b7280';
        }

        function renderRequestsTab() {
            // Filter requests by type
            const filteredRequests = selectedRestockTypeFilter === 'all'
                ? restockRequests
                : restockRequests.filter(r => (r.itemType || 'product') === selectedRestockTypeFilter);

            // Group by status for summary
            const pendingCount = restockRequests.filter(r => r.status === 'pending').length;
            const approvedCount = restockRequests.filter(r => r.status === 'approved').length;
            const rejectedCount = restockRequests.filter(r => r.status === 'rejected').length;

            // Summary cards and filters
            const headerSection = `
                <!-- Summary Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 24px;">
                    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; padding: 16px; color: white;">
                        <div style="font-size: 28px; font-weight: 700;">${pendingCount}</div>
                        <div style="font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-clock"></i> Pending
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 16px; color: white;">
                        <div style="font-size: 28px; font-weight: 700;">${approvedCount}</div>
                        <div style="font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-check-circle"></i> Approved
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 12px; padding: 16px; color: white;">
                        <div style="font-size: 28px; font-weight: 700;">${rejectedCount}</div>
                        <div style="font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-times-circle"></i> Rejected
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%); border-radius: 12px; padding: 16px; color: white;">
                        <div style="font-size: 28px; font-weight: 700;">${restockRequests.length}</div>
                        <div style="font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-list"></i> Total
                        </div>
                    </div>
                </div>

                <!-- Filter Buttons -->
                <div style="display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button onclick="filterRestockByType('all')" style="padding: 10px 20px; border-radius: 25px; border: 2px solid ${selectedRestockTypeFilter === 'all' ? 'var(--accent-primary)' : 'var(--border-color)'}; background: ${selectedRestockTypeFilter === 'all' ? 'var(--accent-primary)' : 'var(--bg-secondary)'}; color: ${selectedRestockTypeFilter === 'all' ? 'white' : 'var(--text-secondary)'}; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s;">
                            <i class="fas fa-layer-group" style="margin-right: 6px;"></i>All Requests
                        </button>
                        <button onclick="filterRestockByType('product')" style="padding: 10px 20px; border-radius: 25px; border: 2px solid ${selectedRestockTypeFilter === 'product' ? '#10b981' : 'var(--border-color)'}; background: ${selectedRestockTypeFilter === 'product' ? '#10b981' : 'var(--bg-secondary)'}; color: ${selectedRestockTypeFilter === 'product' ? 'white' : 'var(--text-secondary)'}; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s;">
                            <i class="fas fa-box" style="margin-right: 6px;"></i>Products
                        </button>
                        <button onclick="filterRestockByType('supply')" style="padding: 10px 20px; border-radius: 25px; border: 2px solid ${selectedRestockTypeFilter === 'supply' ? '#8b5cf6' : 'var(--border-color)'}; background: ${selectedRestockTypeFilter === 'supply' ? '#8b5cf6' : 'var(--bg-secondary)'}; color: ${selectedRestockTypeFilter === 'supply' ? 'white' : 'var(--text-secondary)'}; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s;">
                            <i class="fas fa-tools" style="margin-right: 6px;"></i>Supplies
                        </button>
                    </div>
                    <button onclick="askRestockAIRequests()" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border: none; padding: 10px 18px; border-radius: 25px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
                        <i class="fas fa-robot"></i> Ask AI
                    </button>
                </div>

                <!-- AI Response Area -->
                <div id="restock-requests-ai-response" style="display: none; margin-bottom: 20px;"></div>
            `;

            if (filteredRequests.length === 0) {
                return `
                    ${headerSection}
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-muted); background: var(--bg-secondary); border-radius: 16px;">
                        <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                        <p style="font-size: 16px; margin: 0;">No ${selectedRestockTypeFilter === 'all' ? '' : selectedRestockTypeFilter + ' '}requests found</p>
                        <p style="font-size: 13px; margin-top: 8px;">Click "Create Restock Request" to add one</p>
                    </div>
                `;
            }

            // Sort: pending first, then by date
            const sortedRequests = [...filteredRequests].sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return new Date(b.requestDate) - new Date(a.requestDate);
            });

            return `
                ${headerSection}
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${sortedRequests.map(request => {
                        const itemType = request.itemType || 'product';
                        const typeColor = itemType === 'supply' ? '#8b5cf6' : '#10b981';
                        const typeIcon = itemType === 'supply' ? 'fa-tools' : 'fa-box';
                        const priorityColor = request.priority === 'high' ? '#ef4444' : request.priority === 'medium' ? '#f59e0b' : '#10b981';
                        const priorityBg = request.priority === 'high' ? '#ef444415' : request.priority === 'medium' ? '#f59e0b15' : '#10b98115';

                        // Status styling
                        let statusBg, statusColor, statusIcon, statusText, borderColor;
                        if (request.status === 'approved') {
                            statusBg = '#10b98120'; statusColor = '#10b981'; statusIcon = 'fa-check-circle'; statusText = 'Approved'; borderColor = '#10b981';
                        } else if (request.status === 'rejected') {
                            statusBg = '#ef444420'; statusColor = '#ef4444'; statusIcon = 'fa-times-circle'; statusText = 'Rejected'; borderColor = '#ef4444';
                        } else {
                            statusBg = '#f59e0b20'; statusColor = '#f59e0b'; statusIcon = 'fa-clock'; statusText = 'Pending Review'; borderColor = '#f59e0b';
                        }

                        return `
                        <div style="background: var(--bg-secondary); border-radius: 16px; border: 1px solid var(--border-color); border-left: 4px solid ${borderColor}; overflow: hidden; transition: all 0.2s;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='none'">
                            <div style="padding: 20px;">
                                <!-- Top Row: Product Name, Type Badge, Status -->
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                                    <div style="flex: 1;">
                                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                            <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: var(--text-primary);">${request.productName}</h3>
                                            <span style="background: ${typeColor}; color: white; font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 20px; display: inline-flex; align-items: center; gap: 4px;">
                                                <i class="fas ${typeIcon}" style="font-size: 9px;"></i>
                                                ${itemType === 'supply' ? 'Supply' : 'Product'}
                                            </span>
                                            <span style="background: ${priorityBg}; color: ${priorityColor}; font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
                                                ${request.priority} Priority
                                            </span>
                                        </div>
                                        <p style="margin: 6px 0 0 0; font-size: 13px; color: var(--text-muted);">
                                            <i class="fas fa-user" style="margin-right: 4px;"></i>${request.requestedBy}
                                            <span style="margin: 0 8px;">•</span>
                                            <i class="fas fa-calendar" style="margin-right: 4px;"></i>${formatDate(request.requestDate)}
                                            <span style="margin: 0 8px;">•</span>
                                            <i class="fas fa-store" style="margin-right: 4px;"></i>${request.store}
                                        </p>
                                    </div>
                                    <div style="background: ${statusBg}; color: ${statusColor}; padding: 8px 16px; border-radius: 25px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
                                        <i class="fas ${statusIcon}"></i>
                                        ${statusText}
                                    </div>
                                </div>

                                <!-- Info Grid -->
                                <div style="display: flex; gap: 24px; padding: 16px 20px; background: var(--bg-primary); border-radius: 12px; margin-bottom: 16px;">
                                    <div style="text-align: center; flex: 1;">
                                        <div style="font-size: 24px; font-weight: 700; color: var(--accent-primary);">${request.quantity}</div>
                                        <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Units Needed</div>
                                    </div>
                                    <div style="width: 1px; background: var(--border-color);"></div>
                                    <div style="text-align: center; flex: 1;">
                                        <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${request.store.replace('VSU ', '')}</div>
                                        <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Store</div>
                                    </div>
                                    <div style="width: 1px; background: var(--border-color);"></div>
                                    <div style="text-align: center; flex: 1;">
                                        <div style="font-size: 24px; font-weight: 700; color: var(--text-primary); font-family: 'Space Mono', monospace;">#${String(request.id).padStart(4, '0')}</div>
                                        <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Request ID</div>
                                    </div>
                                </div>

                                ${request.notes ? `
                                    <div style="padding: 12px 16px; background: var(--bg-primary); border-radius: 10px; margin-bottom: 16px; border-left: 3px solid var(--accent-primary);">
                                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Notes</div>
                                        <div style="font-size: 13px; color: var(--text-secondary);">${request.notes}</div>
                                    </div>
                                ` : ''}

                                <!-- Actions -->
                                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border-color);">
                                    <div style="display: flex; gap: 8px;">
                                        ${request.status === 'pending' ? `
                                            <button onclick="approveRestockRequest('${request.firestoreId || request.id}')" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                                                <i class="fas fa-check"></i> Approve
                                            </button>
                                            <button onclick="rejectRestockRequest('${request.firestoreId || request.id}')" style="background: transparent; color: #ef4444; border: 2px solid #ef4444; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.background='#ef4444'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='#ef4444'">
                                                <i class="fas fa-times"></i> Reject
                                            </button>
                                        ` : `
                                            <span style="font-size: 12px; color: var(--text-muted); font-style: italic;">
                                                ${request.status === 'approved' ? 'This request has been approved' : 'This request was rejected'}
                                            </span>
                                        `}
                                    </div>
                                    <div style="display: flex; gap: 8px;">
                                        <button class="btn-icon" onclick="openEditRestockRequestModal('${request.firestoreId || request.id}')" title="Edit Request" style="width: 38px; height: 38px; border-radius: 10px;">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon danger" onclick="deleteRestockRequest('${request.firestoreId || request.id}')" title="Delete Request" style="width: 38px; height: 38px; border-radius: 10px;">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;}).join('')}
                </div>
            `;
        }

        // State for approved tab month navigation
        let approvedMonthOffset = 0; // 0 = current month, -1 = last month, etc.

        // Render Approved Tab - List of all approved restock requests with month navigation
        function renderApprovedTab() {
            const allApprovedRequests = restockRequests.filter(r => r.status === 'approved');

            // Calculate the target month based on offset
            const now = new Date();
            const targetDate = new Date(now.getFullYear(), now.getMonth() + approvedMonthOffset, 1);
            const targetMonth = targetDate.getMonth();
            const targetYear = targetDate.getFullYear();

            // Filter by selected month
            const approvedRequests = allApprovedRequests.filter(req => {
                const reqDate = new Date(req.requestDate || req.approvedDate || Date.now());
                return reqDate.getMonth() === targetMonth && reqDate.getFullYear() === targetYear;
            });

            // Month names
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                               'July', 'August', 'September', 'October', 'November', 'December'];
            const currentMonthName = monthNames[targetMonth];

            // Header with month navigation
            const headerSection = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
                    <div>
                        <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: var(--text-primary);">
                            <i class="fas fa-check-circle" style="color: #10b981; margin-right: 8px;"></i>Approved Requests
                        </h3>
                        <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-muted);">
                            ${approvedRequests.length} items in ${currentMonthName} ${targetYear}
                        </p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <!-- Month Navigation -->
                        <div style="display: flex; align-items: center; gap: 8px; background: var(--bg-secondary); border-radius: 12px; padding: 6px; border: 1px solid var(--border-color);">
                            <button onclick="navigateApprovedMonth(-1)" style="width: 36px; height: 36px; border-radius: 8px; border: none; background: var(--bg-tertiary); color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='var(--accent-primary)'; this.style.color='white'" onmouseout="this.style.background='var(--bg-tertiary)'; this.style.color='var(--text-primary)'">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <div style="min-width: 140px; text-align: center; font-weight: 600; color: var(--text-primary); font-size: 14px;">
                                ${currentMonthName} ${targetYear}
                            </div>
                            <button onclick="navigateApprovedMonth(1)" ${approvedMonthOffset >= 0 ? 'disabled' : ''} style="width: 36px; height: 36px; border-radius: 8px; border: none; background: ${approvedMonthOffset >= 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)'}; color: ${approvedMonthOffset >= 0 ? 'var(--text-muted)' : 'var(--text-primary)'}; cursor: ${approvedMonthOffset >= 0 ? 'not-allowed' : 'pointer'}; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" ${approvedMonthOffset < 0 ? `onmouseover="this.style.background='var(--accent-primary)'; this.style.color='white'" onmouseout="this.style.background='var(--bg-tertiary)'; this.style.color='var(--text-primary)'"` : ''}>
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                        <button onclick="exportApprovedRequests()" style="background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='var(--bg-secondary)'">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </div>
                </div>
            `;

            if (approvedRequests.length === 0) {
                return `
                    ${headerSection}
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-muted); background: var(--bg-secondary); border-radius: 16px;">
                        <i class="fas fa-clipboard-check" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                        <p style="font-size: 16px; margin: 0;">No approved requests in ${currentMonthName} ${targetYear}</p>
                        <p style="font-size: 13px; margin-top: 8px;">Use the arrows to navigate to other months</p>
                    </div>
                `;
            }

            // Group approved items by store for summary
            const groupedByStore = {};
            approvedRequests.forEach(req => {
                const store = req.store || 'Unknown';
                if (!groupedByStore[store]) {
                    groupedByStore[store] = [];
                }
                groupedByStore[store].push(req);
            });

            // Sort by date (newest first)
            const sortedRequests = [...approvedRequests].sort((a, b) => {
                return new Date(b.requestDate) - new Date(a.requestDate);
            });

            return `
                ${headerSection}

                <!-- Summary Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 16px; color: white;">
                        <div style="font-size: 28px; font-weight: 700;">${approvedRequests.length}</div>
                        <div style="font-size: 12px; opacity: 0.9;"><i class="fas fa-check-circle" style="margin-right: 4px;"></i>Total Approved</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 12px; padding: 16px; color: white;">
                        <div style="font-size: 28px; font-weight: 700;">${approvedRequests.reduce((sum, r) => sum + parseInt(r.quantity || 0), 0)}</div>
                        <div style="font-size: 12px; opacity: 0.9;"><i class="fas fa-boxes" style="margin-right: 4px;"></i>Total Units</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; padding: 16px; color: white;">
                        <div style="font-size: 28px; font-weight: 700;">${Object.keys(groupedByStore).length}</div>
                        <div style="font-size: 12px; opacity: 0.9;"><i class="fas fa-store" style="margin-right: 4px;"></i>Stores</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 12px; padding: 16px; color: white;">
                        <div style="font-size: 28px; font-weight: 700;">${approvedRequests.filter(r => r.priority === 'high').length}</div>
                        <div style="font-size: 12px; opacity: 0.9;"><i class="fas fa-exclamation-triangle" style="margin-right: 4px;"></i>High Priority</div>
                    </div>
                </div>

                <!-- Approved Items Table -->
                <div style="background: var(--bg-secondary); border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color);">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: var(--bg-tertiary);">
                                <th style="padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
                                <th style="padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Type</th>
                                <th style="padding: 14px 16px; text-align: center; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                                <th style="padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Store</th>
                                <th style="padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Priority</th>
                                <th style="padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Approved Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedRequests.map((req, index) => {
                                const itemType = req.itemType || 'product';
                                const typeColor = itemType === 'supply' ? '#8b5cf6' : '#10b981';
                                const typeIcon = itemType === 'supply' ? 'fa-tools' : 'fa-box';
                                const priorityColor = req.priority === 'high' ? '#ef4444' : req.priority === 'medium' ? '#f59e0b' : '#10b981';

                                return `
                                    <tr style="border-bottom: 1px solid var(--border-color);" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='transparent'">
                                        <td style="padding: 14px 16px;">
                                            <div style="font-weight: 600; color: var(--text-primary);">${req.productName}</div>
                                            ${req.notes ? `<div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${req.notes.substring(0, 50)}${req.notes.length > 50 ? '...' : ''}</div>` : ''}
                                        </td>
                                        <td style="padding: 14px 16px;">
                                            <span style="background: ${typeColor}20; color: ${typeColor}; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; display: inline-flex; align-items: center; gap: 4px;">
                                                <i class="fas ${typeIcon}" style="font-size: 10px;"></i>
                                                ${itemType === 'supply' ? 'Supply' : 'Product'}
                                            </span>
                                        </td>
                                        <td style="padding: 14px 16px; text-align: center;">
                                            <span style="font-size: 18px; font-weight: 700; color: var(--accent-primary);">${req.quantity}</span>
                                        </td>
                                        <td style="padding: 14px 16px;">
                                            <span style="font-size: 13px; color: var(--text-secondary);">${req.store}</span>
                                        </td>
                                        <td style="padding: 14px 16px;">
                                            <span style="background: ${priorityColor}20; color: ${priorityColor}; font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
                                                ${req.priority}
                                            </span>
                                        </td>
                                        <td style="padding: 14px 16px;">
                                            <div style="font-size: 13px; color: var(--text-secondary);">${formatDate(req.requestDate)}</div>
                                            <div style="font-size: 11px; color: var(--text-muted);">by ${req.requestedBy}</div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Summary by Store -->
                <div style="margin-top: 24px;">
                    <h4 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: var(--text-secondary);">
                        <i class="fas fa-store" style="margin-right: 8px;"></i>Summary by Store
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        ${Object.entries(groupedByStore).map(([store, items]) => `
                            <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; border: 1px solid var(--border-color);">
                                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">${store}</div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 13px; color: var(--text-muted);">${items.length} items</span>
                                    <span style="font-size: 13px; font-weight: 600; color: var(--accent-primary);">${items.reduce((sum, i) => sum + parseInt(i.quantity || 0), 0)} units</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Navigate approved month
        function navigateApprovedMonth(direction) {
            // direction: -1 for previous month, +1 for next month
            const newOffset = approvedMonthOffset + direction;
            // Don't allow going into the future
            if (newOffset <= 0) {
                approvedMonthOffset = newOffset;
                const tabContent = document.getElementById('restock-tab-content');
                if (tabContent && currentRestockTab === 'approved') {
                    tabContent.innerHTML = renderApprovedTab();
                }
            }
        }

        // Export approved requests to CSV
        function exportApprovedRequests() {
            const approvedRequests = restockRequests.filter(r => r.status === 'approved');

            if (approvedRequests.length === 0) {
                showToast('No approved requests to export', 'warning');
                return;
            }

            const headers = ['Product Name', 'Type', 'Quantity', 'Store', 'Priority', 'Requested By', 'Request Date', 'Notes'];
            const rows = approvedRequests.map(req => [
                req.productName,
                req.itemType || 'product',
                req.quantity,
                req.store,
                req.priority,
                req.requestedBy,
                req.requestDate,
                req.notes || ''
            ]);

            const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `approved_restock_requests_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();

            showToast('Exported approved requests to CSV', 'success');
        }

        // Call AI for restock analysis (uses OpenAI GPT-4)
        async function callRestockAI(prompt) {
            const openaiKey = celesteFirebaseSettings?.openai_api_key || getOpenAIKey();

            if (!openaiKey) {
                throw new Error('OpenAI API key not configured');
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    max_tokens: 500,
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.choices[0].message.content;
            }

            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'OpenAI API failed');
        }

        // AI Assistant for Requests Tab - helps prioritize and analyze pending requests
        async function askRestockAIRequests() {
            const responseDiv = document.getElementById('restock-requests-ai-response');
            if (!responseDiv) return;

            // Show loading state
            responseDiv.style.display = 'block';
            responseDiv.innerHTML = `
                <div style="background: linear-gradient(135deg, #8b5cf620 0%, #7c3aed20 100%); border-radius: 16px; padding: 20px; border: 1px solid #8b5cf640;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-robot" style="color: white; font-size: 18px;"></i>
                        </div>
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">AI Analyzing Requests...</div>
                            <div style="font-size: 13px; color: var(--text-muted);">Evaluating priorities and recommendations</div>
                        </div>
                        <i class="fas fa-spinner fa-spin" style="margin-left: auto; color: #8b5cf6; font-size: 20px;"></i>
                    </div>
                </div>
            `;

            try {
                // Gather data for AI analysis
                const pendingRequests = restockRequests.filter(r => r.status === 'pending');
                const approvedRequests = restockRequests.filter(r => r.status === 'approved');
                const highPriorityPending = pendingRequests.filter(r => r.priority === 'high');

                const dataContext = `
                    Pending Restock Requests (${pendingRequests.length}):
                    ${pendingRequests.map(r => `- ${r.productName}: ${r.quantity} units for ${r.store} (${r.priority} priority) - Requested by ${r.requestedBy} on ${r.requestDate}`).join('\n')}

                    High Priority Pending (${highPriorityPending.length}):
                    ${highPriorityPending.map(r => `- ${r.productName}: ${r.quantity} units for ${r.store}`).join('\n')}

                    Already Approved (${approvedRequests.length}):
                    ${approvedRequests.slice(0, 5).map(r => `- ${r.productName}: ${r.quantity} units`).join('\n')}
                `;

                const prompt = `You are a helpful inventory manager assistant. Analyze these pending restock requests and help the manager decide which ones to prioritize. Be concise and practical.

                ${dataContext}

                Provide:
                1. A quick assessment (1-2 sentences)
                2. Which requests should be approved first and why (top 3 if applicable)
                3. Any patterns or concerns you notice`;

                // Try to call the AI
                const response = await callRestockAI(prompt);

                responseDiv.innerHTML = `
                    <div style="background: linear-gradient(135deg, #8b5cf620 0%, #7c3aed20 100%); border-radius: 16px; padding: 20px; border: 1px solid #8b5cf640;">
                        <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
                            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <i class="fas fa-robot" style="color: white; font-size: 18px;"></i>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">AI Recommendations</div>
                                <div style="font-size: 12px; color: var(--text-muted);">Priority analysis for pending requests</div>
                            </div>
                            <button onclick="document.getElementById('restock-requests-ai-response').style.display='none'" style="background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; white-space: pre-wrap;">${response}</div>
                    </div>
                `;

            } catch (error) {
                console.error('AI Error:', error);
                responseDiv.innerHTML = `
                    <div style="background: #ef444420; border-radius: 16px; padding: 20px; border: 1px solid #ef444440;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-exclamation-circle" style="color: #ef4444; font-size: 20px;"></i>
                            <div>
                                <div style="font-weight: 600; color: #ef4444;">AI Unavailable</div>
                                <div style="font-size: 13px; color: var(--text-muted);">Could not connect to AI service. Check API settings in Project Analytics.</div>
                            </div>
                            <button onclick="document.getElementById('restock-requests-ai-response').style.display='none'" style="background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; margin-left: auto;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `;
            }
        }

        async function switchRestockTab(tab) {
            currentRestockTab = tab;
            await renderRestockRequests();
        }

        function filterInventoryByStore(store) {
            selectedStoreFilter = store;
            // Just update the tab content without re-rendering the whole page
            const tabContent = document.getElementById('restock-tab-content');
            if (tabContent && currentRestockTab === 'inventory') {
                tabContent.innerHTML = renderInventoryTab();
                displayInventoryStockChart();
            }
        }

        function filterRestockByType(type) {
            selectedRestockTypeFilter = type;
            // Just update the tab content without re-rendering the whole page
            const tabContent = document.getElementById('restock-tab-content');
            if (tabContent && currentRestockTab === 'requests') {
                tabContent.innerHTML = renderRequestsTab();
            }
        }

        function approveRestockRequest(requestId) {
            const request = restockRequests.find(r => r.firestoreId === requestId || r.id === requestId);
            if (request) {
                request.status = 'approved';
                
                // Update in Firebase if initialized
                if (firebaseRestockRequestsManager.isInitialized) {
                    firebaseRestockRequestsManager.updateRestockRequest(request.firestoreId || requestId, {
                        status: 'approved'
                    }).then(success => {
                        if (success) {
                            console.log('Request approved in Firebase:', requestId);
                            renderRestockRequests();
                        }
                    }).catch(error => {
                        console.error('Error approving request in Firebase:', error);
                        renderRestockRequests();
                    });
                } else {
                    renderRestockRequests();
                }
            }
        }

        function rejectRestockRequest(requestId) {
            const request = restockRequests.find(r => r.firestoreId === requestId || r.id === requestId);
            if (request) {
                request.status = 'rejected';
                
                // Update in Firebase if initialized
                if (firebaseRestockRequestsManager.isInitialized) {
                    firebaseRestockRequestsManager.updateRestockRequest(request.firestoreId || requestId, {
                        status: 'rejected'
                    }).then(success => {
                        if (success) {
                            console.log('Request rejected in Firebase:', requestId);
                            renderRestockRequests();
                        }
                    }).catch(error => {
                        console.error('Error rejecting request in Firebase:', error);
                        renderRestockRequests();
                    });
                } else {
                    renderRestockRequests();
                }
            }
        }

        // Current priority filter, store filter, division filter, and sort
        let currentRequestPriorityFilter = 'all';
        let currentRequestStoreFilter = 'all';
        let currentRequestDivision = 'all'; // all, vsu, loyalvaper
        let currentRequestSort = 'none'; // none, alpha, qty, store

        // Division store mappings
        const divisionStores = {
            vsu: ['Miramar', 'Chula Vista', 'Morena', 'North Park', 'Kearny Mesa'],
            loyalvaper: ['Loyal Vaper', 'Loyal Vaper SD', 'LV San Diego', 'LV']
        };

        // Set priority filter for requests
        window.setRequestPriorityFilter = function(filter) {
            currentRequestPriorityFilter = filter;

            // Update tab styles
            ['all', 'high', 'medium', 'low', 'pending'].forEach(f => {
                const btn = document.getElementById(`req-filter-${f}`);
                if (btn) {
                    if (f === filter) {
                        if (f === 'high') {
                            btn.style.background = '#ef4444';
                            btn.style.color = 'white';
                        } else if (f === 'medium') {
                            btn.style.background = '#f59e0b';
                            btn.style.color = 'white';
                        } else if (f === 'low') {
                            btn.style.background = '#10b981';
                            btn.style.color = 'white';
                        } else {
                            btn.style.background = 'var(--accent-primary)';
                            btn.style.color = 'white';
                        }
                    } else {
                        btn.style.background = 'var(--bg-secondary)';
                        if (f === 'high') btn.style.color = '#ef4444';
                        else if (f === 'medium') btn.style.color = '#f59e0b';
                        else if (f === 'low') btn.style.color = '#10b981';
                        else btn.style.color = 'var(--text-secondary)';
                    }
                }
            });

            // Filter and re-render the list
            renderFilteredRequests();
        };

        // Set sort option for requests
        window.setRequestSort = function(sort) {
            // Toggle off if clicking same sort
            currentRequestSort = (currentRequestSort === sort) ? 'none' : sort;

            // Update sort button styles
            ['alpha', 'qty', 'store'].forEach(s => {
                const btn = document.getElementById(`req-sort-${s}`);
                if (btn) {
                    if (s === currentRequestSort) {
                        btn.style.background = 'var(--accent-primary)';
                        btn.style.color = 'white';
                    } else {
                        btn.style.background = 'var(--bg-secondary)';
                        btn.style.color = 'var(--text-secondary)';
                    }
                }
            });

            renderFilteredRequests();
        };

        // Set store filter for requests
        window.setRequestStoreFilter = function(store) {
            currentRequestStoreFilter = store;
            renderFilteredRequests();
        };

        // Set division filter for requests (VSU / Loyal Vaper)
        window.setRequestDivision = function(division) {
            currentRequestDivision = division;

            // Update division tab styles
            ['all', 'vsu', 'loyalvaper'].forEach(d => {
                const btn = document.getElementById(`req-division-${d}`);
                if (btn) {
                    if (d === division) {
                        btn.style.background = 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))';
                        btn.style.color = 'white';
                        btn.style.border = 'none';
                        btn.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)';
                    } else {
                        btn.style.background = 'var(--bg-secondary)';
                        btn.style.color = 'var(--text-primary)';
                        btn.style.border = '2px solid var(--border-color)';
                        btn.style.boxShadow = 'none';
                    }
                }
            });

            // Reset store filter when changing division
            currentRequestStoreFilter = 'all';
            const storeDropdown = document.getElementById('req-store-filter');
            if (storeDropdown) storeDropdown.value = 'all';

            renderFilteredRequests();
        };

        // Render filtered requests without full page re-render
        function renderFilteredRequests() {
            const listContainer = document.querySelector('.product-requests-list');
            if (!listContainer) return;

            let filtered = [...restockRequests];

            // Apply division filter first
            if (currentRequestDivision !== 'all') {
                const divisionStoreList = divisionStores[currentRequestDivision] || [];
                filtered = filtered.filter(r => {
                    const store = (r.store || '').toLowerCase();
                    return divisionStoreList.some(ds => store.includes(ds.toLowerCase()));
                });
            }

            // Apply priority filter
            if (currentRequestPriorityFilter === 'pending') {
                filtered = filtered.filter(r => !r.purchased);
            } else if (currentRequestPriorityFilter !== 'all') {
                filtered = filtered.filter(r => r.priority === currentRequestPriorityFilter);
            }

            // Apply store filter
            if (currentRequestStoreFilter !== 'all') {
                filtered = filtered.filter(r => r.store === currentRequestStoreFilter);
            }

            // Apply sorting
            if (currentRequestSort === 'alpha') {
                filtered.sort((a, b) => (a.productName || '').localeCompare(b.productName || ''));
            } else if (currentRequestSort === 'qty') {
                filtered.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
            } else if (currentRequestSort === 'store') {
                filtered.sort((a, b) => (a.store || '').localeCompare(b.store || ''));
            }

            // Update title and count
            const titleEl = document.getElementById('requests-list-title');
            const countEl = document.getElementById('requests-list-count');
            const sortLabel = currentRequestSort !== 'none' ? ` (${currentRequestSort === 'alpha' ? 'A-Z' : currentRequestSort === 'qty' ? 'by Qty' : 'by Store'})` : '';
            if (titleEl) {
                const titles = { all: 'All Requests', high: 'High Priority', medium: 'Medium Priority', low: 'Low Priority', pending: 'Pending' };
                titleEl.textContent = (titles[currentRequestPriorityFilter] || 'All Requests') + sortLabel;
            }
            if (countEl) countEl.textContent = `${filtered.length} items`;

            // Re-render list
            if (filtered.length === 0) {
                listContainer.innerHTML = `
                    <div style="padding: 40px 20px; text-align: center; color: var(--text-muted);">
                        <i class="fas fa-filter" style="font-size: 32px; opacity: 0.3; margin-bottom: 12px;"></i>
                        <p style="font-size: 13px; margin: 0;">No ${currentRequestPriorityFilter} requests</p>
                    </div>
                `;
                return;
            }

            listContainer.innerHTML = filtered.map(request => {
                const priorityColor = request.priority === 'high' ? '#ef4444' : request.priority === 'medium' ? '#f59e0b' : '#10b981';
                const isPurchased = request.purchased || false;
                const rowBg = isPurchased ? 'linear-gradient(90deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))' : 'transparent';
                const rowBorder = isPurchased ? '2px solid #10b981' : '1px solid var(--border-color)';
                return `
                    <div class="request-row" id="request-row-${request.firestoreId || request.id}" style="display: flex; align-items: center; padding: 12px 16px; border-bottom: ${rowBorder}; background: ${rowBg}; gap: 12px; transition: all 0.3s ease;">
                        <div onclick="toggleRequestPurchased('${request.firestoreId || request.id}')" style="cursor: pointer; min-width: 32px; height: 32px; border-radius: 8px; border: 2px solid ${isPurchased ? '#10b981' : 'var(--border-color)'}; background: ${isPurchased ? '#10b981' : 'transparent'}; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                            ${isPurchased ? '<i class="fas fa-check" style="color: white; font-size: 14px;"></i>' : ''}
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 600; color: ${isPurchased ? '#10b981' : 'var(--text-primary)'}; font-size: 14px; ${isPurchased ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${request.productName}</div>
                            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
                                <span style="font-size: 12px; color: var(--text-muted);"><i class="fas fa-store" style="margin-right: 4px;"></i>${request.store || '-'}</span>
                            </div>
                        </div>
                        <div style="text-align: center; min-width: 40px;">
                            <div style="font-weight: 700; font-size: 18px; color: ${isPurchased ? '#10b981' : 'var(--accent-primary)'};">${request.quantity}</div>
                        </div>
                        <div>
                            <span style="background: ${priorityColor}20; color: ${priorityColor}; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; text-transform: uppercase;">${request.priority}</span>
                        </div>
                        <div style="display: flex; gap: 4px;">
                            <button onclick="deleteRestockRequest('${request.firestoreId || request.id}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 8px; border-radius: 6px; font-size: 14px;" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Clear all purchased requests
        window.clearPurchasedRequests = function() {
            const purchasedCount = restockRequests.filter(r => r.purchased).length;
            if (purchasedCount === 0) return;

            showConfirmModal({
                title: 'Clear Purchased Items',
                message: `Delete ${purchasedCount} purchased item${purchasedCount > 1 ? 's' : ''} from the list?`,
                confirmText: 'Clear',
                type: 'danger',
                onConfirm: async () => {
                    const purchasedIds = restockRequests.filter(r => r.purchased).map(r => r.firestoreId || r.id);

                    // Delete from Firebase
                    if (firebaseRestockRequestsManager.isInitialized) {
                        for (const id of purchasedIds) {
                            try {
                                await firebaseRestockRequestsManager.deleteRestockRequest(id);
                            } catch (e) {
                                console.error('Error deleting:', e);
                            }
                        }
                    }

                    // Remove from local array
                    restockRequests = restockRequests.filter(r => !r.purchased);
                    renderRestockRequests();
                    showNotification(`${purchasedCount} items cleared`, 'success');
                }
            });
        };

        // Toggle purchased status for a request (palomita)
        window.toggleRequestPurchased = async function(requestId) {
            const request = restockRequests.find(r => r.firestoreId === requestId || r.id === requestId);
            if (!request) return;

            // Toggle the purchased status
            request.purchased = !request.purchased;

            // Update the row visually immediately
            const row = document.getElementById(`request-row-${requestId}`);
            if (row) {
                if (request.purchased) {
                    row.style.background = 'linear-gradient(90deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))';
                    row.style.borderBottom = '2px solid #10b981';
                } else {
                    row.style.background = 'transparent';
                    row.style.borderBottom = '1px solid var(--border-color)';
                }
            }

            // Save to Firebase
            if (firebaseRestockRequestsManager.isInitialized) {
                try {
                    await firebaseRestockRequestsManager.updateRestockRequest(requestId, { purchased: request.purchased });
                } catch (error) {
                    console.error('Error updating purchased status:', error);
                }
            }

            // Re-render to update all visuals
            renderRestockRequests();
        };

        function deleteRestockRequest(requestId) {
            const request = restockRequests.find(r => r.firestoreId === requestId || r.id === requestId);
            const productName = request?.productName || 'this request';

            showConfirmModal({
                title: 'Delete Restock Request',
                message: `Are you sure you want to delete the restock request for "${productName}"?`,
                confirmText: 'Delete',
                type: 'danger',
                onConfirm: () => {
                    // Remove from local array
                    const index = restockRequests.findIndex(r => r.firestoreId === requestId || r.id === requestId);
                    if (index > -1) {
                        restockRequests.splice(index, 1);
                    }

                    // Delete from Firebase if initialized
                    if (firebaseRestockRequestsManager.isInitialized) {
                        firebaseRestockRequestsManager.deleteRestockRequest(requestId).then(async success => {
                            if (success) {
                                // Log activity
                                if (typeof logActivity === 'function') {
                                    await logActivity(ACTIVITY_TYPES.DELETE, {
                                        message: `Deleted restock request: ${productName}`,
                                        productName: productName,
                                        store: request?.store || 'Unknown'
                                    }, 'restock', requestId);
                                }
                                console.log('Request deleted from Firebase:', requestId);
                                renderRestockRequests();
                            }
                        }).catch(error => {
                            console.error('Error deleting request from Firebase:', error);
                            renderRestockRequests();
                        });
                    } else {
                        renderRestockRequests();
                    }
                }
            });
        }

        let editingRestockRequestId = null;

        // Toggle custom category input visibility
        function toggleCustomCategory(prefix) {
            const select = document.getElementById(`${prefix}-category`);
            const customInput = document.getElementById(`${prefix}-category-custom`);
            if (select && customInput) {
                if (select.value === 'Other') {
                    customInput.style.display = 'block';
                    customInput.focus();
                } else {
                    customInput.style.display = 'none';
                    customInput.value = '';
                }
            }
        }
        window.toggleCustomCategory = toggleCustomCategory;

        function openEditRestockRequestModal(requestId) {
            editingRestockRequestId = requestId;
            const request = restockRequests.find(r => r.firestoreId === requestId || r.id === requestId);

            if (!request) {
                alert('Request not found');
                return;
            }

            openModal('edit-restock-request');

            // Populate form with current values
            setTimeout(() => {
                // Set form values directly - no need to parse brand/flavor
                document.getElementById('edit-restock-product').value = request.productName || '';
                document.getElementById('edit-restock-quantity').value = request.quantity || '';
                document.getElementById('edit-restock-priority').value = request.priority || 'medium';
                document.getElementById('edit-restock-store').value = request.store || '';
                document.getElementById('edit-restock-notes').value = request.notes || '';

                // Set category - check if it's a predefined category or custom
                const categorySelect = document.getElementById('edit-restock-category');
                const categoryCustom = document.getElementById('edit-restock-category-custom');
                const predefinedCategories = ['Disposables', 'Vape Liquids', 'Coils & Pod', 'Smokeshop', 'Rolling Papers', 'Wraps', 'Chips'];

                if (request.category && predefinedCategories.includes(request.category)) {
                    categorySelect.value = request.category;
                    categoryCustom.style.display = 'none';
                } else if (request.category) {
                    categorySelect.value = 'Other';
                    categoryCustom.value = request.category;
                    categoryCustom.style.display = 'block';
                }

                // Populate and set employee dropdown
                populateEmployeeDropdown('edit-restock-requested-by', request.requestedBy || '');
            }, 100);
        }

        function submitEditRestockRequest() {
            const productName = document.getElementById('edit-restock-product').value.trim();
            const quantity = document.getElementById('edit-restock-quantity').value;
            const priority = document.getElementById('edit-restock-priority').value;
            const store = document.getElementById('edit-restock-store').value;
            const requestedByEl = document.getElementById('edit-restock-requested-by');
            const requestedBy = requestedByEl ? requestedByEl.value : '';
            const notes = document.getElementById('edit-restock-notes').value;

            // Get category (use custom if "Other" selected)
            const categorySelect = document.getElementById('edit-restock-category');
            const categoryCustom = document.getElementById('edit-restock-category-custom');
            let category = categorySelect ? categorySelect.value : '';
            if (category === 'Other' && categoryCustom) {
                category = categoryCustom.value.trim() || 'Other';
            }

            // Validation
            if (!productName || !quantity || !store || !category) {
                alert('Please fill in Product Name, Quantity, Category, and Store');
                return;
            }

            // Find and update the request
            const request = restockRequests.find(r => r.firestoreId === editingRestockRequestId || r.id === editingRestockRequestId);
            if (!request) {
                alert('Request not found');
                return;
            }

            // Update local request
            request.productName = productName;
            request.quantity = parseInt(quantity);
            request.priority = priority || 'medium';
            request.store = store;
            request.category = category;
            if (requestedBy) request.requestedBy = requestedBy;
            request.notes = notes;

            // Update in Firebase if initialized
            if (firebaseRestockRequestsManager.isInitialized) {
                const updateData = {
                    productName: productName,
                    quantity: parseInt(quantity),
                    priority: priority || 'medium',
                    store: store,
                    category: category,
                    notes: notes
                };
                if (requestedBy) updateData.requestedBy = requestedBy;

                firebaseRestockRequestsManager.updateRestockRequest(editingRestockRequestId, updateData).then(success => {
                    if (success) {
                        console.log('Request updated in Firebase:', editingRestockRequestId);
                        closeModal();
                        showNotification('Request updated successfully!', 'success');
                        renderRestockRequests();
                    } else {
                        alert('Error updating request. Please try again.');
                    }
                }).catch(error => {
                    console.error('Error updating request in Firebase:', error);
                    alert('Error updating request: ' + error.message);
                });
            } else {
                // Fallback to local storage only
                closeModal();
                showNotification('Request updated successfully!', 'success');
                renderRestockRequests();
            }

            editingRestockRequestId = null;
        }

        // Product name autocomplete - get unique product names from previous requests
        function getUniqueProductNames() {
            const productNames = restockRequests.map(r => r.productName).filter(Boolean);
            // Get unique names and sort alphabetically
            return [...new Set(productNames)].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        }

        // Show product suggestions dropdown
        window.showProductSuggestions = function(inputValue, dropdownId) {
            const dropdown = document.getElementById(dropdownId);
            if (!dropdown) return;

            const query = inputValue.toLowerCase().trim();

            // Hide if query is too short
            if (query.length < 1) {
                dropdown.style.display = 'none';
                return;
            }

            // Get matching products
            const allProducts = getUniqueProductNames();
            const matches = allProducts.filter(name =>
                name.toLowerCase().includes(query)
            ).slice(0, 10); // Limit to 10 suggestions

            if (matches.length === 0) {
                dropdown.style.display = 'none';
                return;
            }

            // Build dropdown HTML
            dropdown.innerHTML = matches.map(name => {
                // Highlight the matching part
                const lowerName = name.toLowerCase();
                const matchIndex = lowerName.indexOf(query);
                let displayName = name;
                if (matchIndex >= 0) {
                    displayName = name.substring(0, matchIndex) +
                        '<strong style="color: var(--accent-primary);">' +
                        name.substring(matchIndex, matchIndex + query.length) +
                        '</strong>' +
                        name.substring(matchIndex + query.length);
                }

                return `
                    <div onclick="selectProductSuggestion('${name.replace(/'/g, "\\'")}', '${dropdownId}')"
                        style="padding: 12px 16px; cursor: pointer; border-bottom: 1px solid var(--border-color); transition: background 0.2s; display: flex; align-items: center; gap: 10px;"
                        onmouseover="this.style.background='var(--bg-secondary)'"
                        onmouseout="this.style.background='transparent'">
                        <i class="fas fa-history" style="color: var(--text-muted); font-size: 12px;"></i>
                        <span style="flex: 1;">${displayName}</span>
                    </div>
                `;
            }).join('');

            dropdown.style.display = 'block';
        };

        // Select a product suggestion
        window.selectProductSuggestion = function(productName, dropdownId) {
            const dropdown = document.getElementById(dropdownId);
            if (!dropdown) return;

            // Find the input associated with this dropdown
            const inputId = dropdownId.replace('-suggestions', '-product');
            const input = document.getElementById(inputId);

            if (input) {
                input.value = productName;
                input.focus();
            }

            dropdown.style.display = 'none';
        };

        // Close suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.form-group')) {
                document.querySelectorAll('.product-suggestions-dropdown').forEach(d => d.style.display = 'none');
            }
        });

        function renderAbundanceCloud() {
            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <!-- Quick Actions -->
                <div class="abundance-quick-actions">
                    <button class="abundance-action-btn shipping" onclick="showMarkAsSection('shipping')">
                        <div class="action-icon">
                            <i class="fas fa-truck"></i>
                        </div>
                        <span>Mark as Prepared</span>
                    </button>
                    <button class="abundance-action-btn pickup" onclick="showMarkAsSection('pickup')">
                        <div class="action-icon">
                            <i class="fas fa-shopping-bag"></i>
                        </div>
                        <span>Mark Ready for Pickup</span>
                    </button>
                    <button class="abundance-action-btn delivered" onclick="showMarkAsSection('delivered')">
                        <div class="action-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <span>Mark Delivered</span>
                    </button>
                    <a href="https://admin.shopify.com/store/k1xm3v-v0/orders" target="_blank" rel="noopener noreferrer" class="abundance-action-btn shopify">
                        <div class="action-icon">
                            <i class="fab fa-shopify"></i>
                        </div>
                        <span>Go to Shopify Admin</span>
                    </a>
                </div>

                <!-- Filter Tabs -->
                <div class="abundance-filter-tabs">
                    <button class="filter-tab active" data-filter="all" onclick="filterOrders('all')">
                        <i class="fas fa-border-all"></i>
                        <span>All</span>
                    </button>
                    <button class="filter-tab" data-filter="shipping" onclick="filterOrders('shipping')">
                        <i class="fas fa-truck"></i>
                        <span>Shipping</span>
                    </button>
                    <button class="filter-tab" data-filter="pickup" onclick="filterOrders('pickup')">
                        <i class="fas fa-store"></i>
                        <span>Pickup</span>
                    </button>
                    <button class="filter-tab" data-filter="manual" onclick="filterOrders('manual')">
                        <i class="fas fa-file-pdf"></i>
                        <span>Manual</span>
                    </button>
                </div>

                <!-- Orders Table Card -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-list"></i>
                            Orders
                        </h3>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <span id="selectedCount" class="text-muted" style="font-size: 13px; display: none;">
                                <span id="selectedNum">0</span> selected
                            </span>
                            <button class="btn-secondary" id="printSelectedBtn" onclick="printSelected()" style="display: none;">
                                <i class="fas fa-print"></i>
                                Print Selected
                            </button>
                            <button class="card-action" onclick="refreshOrders()">
                                <i class="fas fa-sync"></i> Refresh
                            </button>
                        </div>
                    </div>
                    <div class="card-body" style="padding: 0;">
                        <div id="loadingOrders" class="loading-state">
                            <div class="spinner"></div>
                            <span>Loading orders...</span>
                        </div>
                        <div id="ordersTableContainer" style="display: none;">
                            <table class="abundance-table">
                                <thead>
                                    <tr>
                                        <th style="width: 50px;">
                                            <input type="checkbox" id="selectAll" onchange="toggleSelectAll()">
                                        </th>
                                        <th>#</th>
                                        <th>Customer</th>
                                        <th>Line Items</th>
                                        <th>Status</th>
                                        <th>Pickup / Shipping</th>
                                        <th>Taxes</th>
                                        <th>Total</th>
                                        <th style="width: 120px;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="ordersTableBody">
                                    <!-- Orders will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                        <div id="emptyState" class="empty-state" style="display: none;">
                            <i class="fas fa-inbox"></i>
                            <h3>No orders found</h3>
                            <p>Orders will appear here once they are available</p>
                        </div>
                    </div>
                </div>
            `;

            // Initialize Abundance Cloud after rendering
            if (typeof initializeAbundanceCloud === 'function') {
                setTimeout(() => {
                    initializeAbundanceCloud();
                }, 100);
            }
        }

        function renderTaskCard(task) {
            return `
                <div class="task-card priority-${task.priority}">
                    <div class="task-priority ${task.priority}">${task.priority}</div>
                    <h4 class="task-title">${task.title}</h4>
                    <div class="task-meta">
                        <span><i class="fas fa-user"></i> ${task.assignee}</span>
                        <span><i class="fas fa-calendar"></i> ${formatDate(task.due)}</span>
                    </div>
                </div>
            `;
        }

        // Schedules data array
        let schedules = [];
        let daysOff = []; // Array to store employee days off: { employeeId, date, store }
        let currentWeekStart = getWeekStart(new Date());
        let draggedShift = null;

        // Shift types configuration
        const SHIFT_TYPES = {
            opening: {
                name: 'Opening',
                icon: 'fa-sun',
                color: '#f59e0b',
                gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                defaultStart: '09:00',
                defaultEnd: '17:00'
            },
            closing: {
                name: 'Closing',
                icon: 'fa-moon',
                color: '#6366f1',
                gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                defaultStart: '14:00',
                defaultEnd: '22:00'
            }
        };

        function getWeekStart(date) {
            const d = new Date(date);
            const day = d.getDay();
            // Adjust so week starts on Monday (day 1) instead of Sunday (day 0)
            // If today is Sunday (0), go back 6 days to Monday
            // Otherwise, go back (day - 1) days to Monday
            const diff = d.getDate() - (day === 0 ? 6 : day - 1);
            return new Date(d.setDate(diff));
        }

        function getWeekDates(startDate) {
            const dates = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                dates.push(date);
            }
            return dates;
        }

        function formatDateKey(date) {
            // Use local date components to avoid timezone offset issues
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        /**
         * Convert number to ordinal (1st, 2nd, 3rd, etc.)
         */
        function getOrdinal(n) {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        }

        function renderSchedule() {
            const dashboard = document.querySelector('.dashboard');
            const weekDates = getWeekDates(currentWeekStart);
            const weekRangeText = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

            dashboard.innerHTML = `
                <style>
                    /* Schedule Header */
                    .schedule-header-bar {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 24px;
                        flex-wrap: wrap;
                        gap: 16px;
                    }
                    .schedule-title-section h2 {
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 4px;
                    }
                    .schedule-title-section p {
                        color: var(--text-muted);
                        font-size: 14px;
                    }
                    .schedule-controls {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .schedule-controls-row {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .week-nav {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        background: var(--bg-card);
                        padding: 6px;
                        border-radius: 12px;
                        border: 1px solid var(--border-color);
                    }
                    .week-nav-btn {
                        background: transparent;
                        border: none;
                        width: 36px;
                        height: 36px;
                        border-radius: 8px;
                        cursor: pointer;
                        color: var(--text-secondary);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    }
                    .week-nav-btn:hover {
                        background: var(--accent-primary);
                        color: white;
                    }
                    .week-display {
                        font-size: 15px;
                        font-weight: 600;
                        min-width: 180px;
                        text-align: center;
                        color: var(--text-primary);
                    }
                    .store-filter-select {
                        background: var(--bg-card);
                        border: 1px solid var(--border-color);
                        border-radius: 10px;
                        padding: 10px 16px;
                        color: var(--text-primary);
                        font-size: 14px;
                        cursor: pointer;
                        min-width: 160px;
                    }

                    /* Mobile Schedule Controls */
                    @media (max-width: 768px) {
                        .schedule-header-bar {
                            flex-direction: column;
                            align-items: stretch;
                        }
                        .schedule-controls {
                            flex-direction: column;
                            align-items: stretch;
                            gap: 10px;
                        }
                        .schedule-controls-row {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            width: 100%;
                        }
                        .week-nav {
                            width: 100%;
                            justify-content: center;
                        }
                        .week-display {
                            flex: 1;
                            min-width: auto;
                        }
                        .store-filter-select {
                            flex: 1;
                            min-width: auto;
                        }
                        .schedule-controls > .week-nav-btn {
                            margin-right: 0 !important;
                        }
                        /* Mobile Stores Grid */
                        .stores-grid {
                            grid-template-columns: 1fr !important;
                            gap: 16px;
                        }
                        .store-schedule-card {
                            border-radius: 12px;
                        }
                        .store-schedule-header {
                            padding: 12px 16px;
                        }
                        .store-schedule-header h4 {
                            font-size: 14px;
                        }
                        .store-schedule-header .store-icon {
                            width: 28px;
                            height: 28px;
                            font-size: 12px;
                        }
                        .store-schedule-body {
                            padding: 8px;
                        }
                        .store-day-row {
                            gap: 6px;
                            padding: 6px 0;
                        }
                        .store-day-label {
                            width: 52px;
                            font-size: 10px;
                        }
                        .store-shift-slot {
                            min-height: 36px;
                            padding: 4px 6px;
                            font-size: 10px;
                        }
                        .store-shift-name {
                            font-size: 11px;
                        }
                        .store-shift-time {
                            font-size: 9px;
                        }
                        .store-days-off-section {
                            padding: 12px;
                        }
                        .store-day-off-avatar {
                            width: 28px;
                            height: 28px;
                            font-size: 11px;
                        }
                        .store-day-off-name {
                            font-size: 12px;
                        }
                        /* Mobile Day Card */
                        .schedule-day-card {
                            flex: 0 0 280px;
                            min-width: 280px;
                        }
                        .day-card-header {
                            padding: 12px;
                        }
                        .day-card-header .day-number {
                            font-size: 24px;
                        }
                        .day-card-body {
                            padding: 10px;
                            gap: 8px;
                        }
                        .shift-slot {
                            padding: 10px;
                        }
                        .assigned-employee {
                            padding: 6px 10px;
                            gap: 8px;
                        }
                        .assigned-employee-avatar {
                            width: 32px;
                            height: 32px;
                            font-size: 12px;
                        }
                        .assigned-employee-name {
                            font-size: 13px;
                        }
                    }
                    @media (max-width: 480px) {
                        .schedule-title-section h2 {
                            font-size: 18px;
                        }
                        .schedule-title-section p {
                            font-size: 12px;
                        }
                        .week-display {
                            font-size: 13px;
                        }
                        .week-nav-btn {
                            width: 32px;
                            height: 32px;
                        }
                        .store-filter-select {
                            padding: 8px 12px;
                            font-size: 13px;
                        }
                        .store-day-label {
                            width: 44px;
                            font-size: 9px;
                        }
                        .store-shift-slot {
                            min-height: 32px;
                            padding: 3px 5px;
                        }
                        .store-shift-name {
                            font-size: 10px;
                        }
                        .store-shift-time {
                            font-size: 8px;
                        }
                    }

                    /* Days Grid - Horizontal scroll for week */
                    .schedule-days-container {
                        display: flex;
                        gap: 12px;
                        overflow-x: auto;
                        padding-bottom: 12px;
                        scroll-snap-type: x mandatory;
                    }
                    .schedule-days-container::-webkit-scrollbar {
                        height: 6px;
                    }
                    .schedule-days-container::-webkit-scrollbar-track {
                        background: var(--bg-secondary);
                        border-radius: 3px;
                    }
                    .schedule-days-container::-webkit-scrollbar-thumb {
                        background: var(--border-color);
                        border-radius: 3px;
                    }

                    /* Day Card */
                    .schedule-day-card {
                        flex: 0 0 calc(14.28% - 10px);
                        min-width: 200px;
                        background: var(--bg-card);
                        border-radius: 16px;
                        border: 1px solid var(--border-color);
                        overflow: hidden;
                        scroll-snap-align: start;
                        transition: all 0.3s ease;
                    }
                    .schedule-day-card:hover {
                        border-color: var(--accent-primary);
                        box-shadow: 0 8px 32px rgba(99, 102, 241, 0.1);
                    }
                    .schedule-day-card.today {
                        border-color: var(--accent-primary);
                        box-shadow: 0 0 0 2px var(--accent-glow);
                    }
                    .day-card-header {
                        padding: 16px;
                        text-align: center;
                        border-bottom: 1px solid var(--border-color);
                        background: var(--bg-secondary);
                    }
                    .schedule-day-card.today .day-card-header {
                        background: var(--accent-gradient);
                    }
                    .schedule-day-card.today .day-card-header * {
                        color: white !important;
                    }
                    .day-card-header .day-name {
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: var(--text-muted);
                        font-weight: 600;
                    }
                    .day-card-header .day-number {
                        font-size: 28px;
                        font-weight: 700;
                        color: var(--text-primary);
                        line-height: 1.2;
                    }
                    .day-card-body {
                        padding: 12px;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }

                    /* Shift Slot */
                    .shift-slot {
                        border-radius: 12px;
                        padding: 12px;
                        transition: all 0.2s;
                        position: relative;
                    }
                    .shift-slot.opening {
                        background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%);
                        border: 1px solid rgba(245, 158, 11, 0.2);
                    }
                    .shift-slot.closing {
                        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%);
                        border: 1px solid rgba(99, 102, 241, 0.2);
                    }
                    .shift-slot-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 10px;
                    }
                    .shift-type-badge {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .shift-slot.opening .shift-type-badge {
                        color: #f59e0b;
                    }
                    .shift-slot.closing .shift-type-badge {
                        color: #6366f1;
                    }
                    .shift-time-display {
                        font-size: 12px;
                        color: var(--text-muted);
                        font-weight: 500;
                    }

                    /* Employee Drop Zone */
                    .employee-drop-zone {
                        min-height: 50px;
                        border: 2px dashed var(--border-color);
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: all 0.2s;
                        padding: 8px;
                    }
                    .employee-drop-zone:hover {
                        border-color: var(--accent-primary);
                        background: rgba(99, 102, 241, 0.05);
                    }
                    .employee-drop-zone.drag-over {
                        border-color: var(--accent-primary);
                        background: rgba(99, 102, 241, 0.1);
                        border-style: solid;
                    }
                    .employee-drop-zone.empty {
                        color: var(--text-muted);
                        font-size: 13px;
                    }
                    .employee-drop-zone.empty i {
                        margin-right: 6px;
                    }

                    /* Assigned Employee Card */
                    .assigned-employee {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 8px 12px;
                        background: var(--bg-secondary);
                        border-radius: 10px;
                        width: 100%;
                        cursor: grab;
                        transition: all 0.2s;
                        position: relative;
                    }
                    .assigned-employee:hover {
                        background: var(--bg-hover);
                        transform: translateY(-1px);
                    }
                    .assigned-employee:active {
                        cursor: grabbing;
                    }
                    .assigned-employee.dragging {
                        opacity: 0.5;
                        transform: scale(0.98);
                    }
                    .assigned-employee-avatar {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 13px;
                        font-weight: 600;
                        color: white;
                        flex-shrink: 0;
                    }
                    .assigned-employee-info {
                        flex: 1;
                        min-width: 0;
                    }
                    .assigned-employee-name {
                        font-size: 14px;
                        font-weight: 600;
                        color: var(--text-primary);
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .assigned-employee-hours {
                        font-size: 12px;
                        color: var(--text-muted);
                    }
                    .assigned-employee-remove {
                        position: absolute;
                        top: -6px;
                        right: -6px;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: var(--danger);
                        color: white;
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                        opacity: 0;
                        transition: opacity 0.2s;
                    }
                    .assigned-employee:hover .assigned-employee-remove {
                        opacity: 1;
                    }
                    .assigned-employee-clone {
                        position: absolute;
                        top: -6px;
                        right: 18px;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: var(--accent-primary);
                        color: white;
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 9px;
                        opacity: 0;
                        transition: opacity 0.2s;
                    }
                    .assigned-employee:hover .assigned-employee-clone {
                        opacity: 1;
                    }
                    .assigned-employee-clone:hover {
                        background: var(--accent-secondary);
                        transform: scale(1.1);
                    }

                    /* Multi-employee shift slot */
                    .employee-drop-zone.multi-employee {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        padding: 10px;
                    }
                    .employee-drop-zone.multi-employee .assigned-employee {
                        margin-bottom: 0;
                    }
                    .add-more-employee {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 8px;
                        border: 2px dashed var(--border-color);
                        border-radius: 8px;
                        color: var(--text-muted);
                        cursor: pointer;
                        transition: all 0.2s;
                        font-size: 14px;
                    }
                    .add-more-employee:hover {
                        border-color: var(--accent-primary);
                        color: var(--accent-primary);
                        background: var(--bg-hover);
                    }

                    /* Days Off Section */
                    .day-off-section {
                        margin-top: 12px;
                        border-top: 1px solid var(--border-color);
                        padding-top: 12px;
                    }
                    .day-off-header {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 8px 12px;
                        background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%);
                        border-radius: 8px;
                        font-size: 12px;
                        font-weight: 600;
                        color: var(--text-secondary);
                        cursor: pointer;
                        transition: all 0.2s;
                        border: 1px solid rgba(99, 102, 241, 0.15);
                    }
                    .day-off-header:hover {
                        background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%);
                        border-color: var(--accent-primary);
                    }
                    .day-off-employees {
                        margin-top: 8px;
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                    }
                    .day-off-employee-badge {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 6px 10px;
                        background: var(--bg-secondary);
                        border-radius: 8px;
                        font-size: 13px;
                        position: relative;
                        transition: all 0.2s;
                    }
                    .day-off-employee-badge:hover {
                        background: var(--bg-hover);
                    }
                    .day-off-avatar {
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 11px;
                        font-weight: 600;
                        color: white;
                        flex-shrink: 0;
                    }
                    .day-off-name {
                        flex: 1;
                        color: var(--text-primary);
                        font-weight: 500;
                        font-size: 12px;
                    }
                    .day-off-remove {
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        background: var(--danger);
                        color: white;
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 9px;
                        opacity: 0;
                        transition: opacity 0.2s;
                    }
                    .day-off-employee-badge:hover .day-off-remove {
                        opacity: 1;
                    }
                    .day-off-remove:hover {
                        background: #dc2626;
                        transform: scale(1.1);
                    }
                    .day-off-empty {
                        padding: 12px;
                        text-align: center;
                        color: var(--text-muted);
                        font-size: 12px;
                        font-style: italic;
                    }

                    /* Time Slider */
                    .time-slider-container {
                        margin-top: 8px;
                        padding: 12px;
                        background: var(--bg-secondary);
                        border-radius: 10px;
                        display: none;
                    }
                    .time-slider-container.active {
                        display: block;
                    }
                    .time-slider-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 12px;
                    }
                    .time-slider-label {
                        font-size: 11px;
                        font-weight: 600;
                        text-transform: uppercase;
                        color: var(--text-muted);
                    }
                    .time-slider-value {
                        font-size: 14px;
                        font-weight: 700;
                        color: var(--text-primary);
                    }
                    .time-slider-track {
                        position: relative;
                        height: 40px;
                        background: var(--bg-card);
                        border-radius: 8px;
                        border: 1px solid var(--border-color);
                        overflow: hidden;
                    }
                    .time-slider-hours {
                        display: flex;
                        justify-content: space-between;
                        padding: 0 4px;
                        margin-top: 6px;
                    }
                    .time-slider-hours span {
                        font-size: 9px;
                        color: var(--text-muted);
                    }
                    .time-slider-range {
                        position: absolute;
                        top: 4px;
                        bottom: 4px;
                        border-radius: 6px;
                        cursor: move;
                        transition: background 0.2s;
                    }
                    .shift-slot.opening .time-slider-range {
                        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    }
                    .shift-slot.closing .time-slider-range {
                        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    }
                    .time-slider-handle {
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 16px;
                        height: 28px;
                        background: white;
                        border-radius: 4px;
                        cursor: ew-resize;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .time-slider-handle::after {
                        content: '';
                        width: 4px;
                        height: 12px;
                        background: var(--border-color);
                        border-radius: 2px;
                    }
                    .time-slider-handle.start {
                        left: -8px;
                    }
                    .time-slider-handle.end {
                        right: -8px;
                    }
                    .time-slider-actions {
                        display: flex;
                        gap: 8px;
                        margin-top: 12px;
                    }
                    .time-slider-btn {
                        flex: 1;
                        padding: 8px 12px;
                        border-radius: 8px;
                        border: none;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: 600;
                        transition: all 0.2s;
                    }
                    .time-slider-btn.save {
                        background: var(--accent-primary);
                        color: white;
                    }
                    .time-slider-btn.save:hover {
                        background: var(--accent-secondary);
                    }
                    .time-slider-btn.cancel {
                        background: var(--bg-card);
                        color: var(--text-secondary);
                        border: 1px solid var(--border-color);
                    }

                    /* Employee Picker Modal */
                    .employee-picker-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.5);
                        backdrop-filter: blur(4px);
                        z-index: 1000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        opacity: 0;
                        visibility: hidden;
                        transition: all 0.3s;
                    }
                    .employee-picker-overlay.active {
                        opacity: 1;
                        visibility: visible;
                    }
                    .employee-picker {
                        background: var(--bg-card);
                        border-radius: 20px;
                        width: 90%;
                        max-width: 400px;
                        max-height: 80vh;
                        overflow: hidden;
                        transform: scale(0.9);
                        transition: transform 0.3s;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    }
                    .employee-picker-overlay.active .employee-picker {
                        transform: scale(1);
                    }
                    .employee-picker-header {
                        padding: 20px;
                        border-bottom: 1px solid var(--border-color);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .employee-picker-header h3 {
                        font-size: 18px;
                        font-weight: 600;
                    }
                    .employee-picker-close {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        background: var(--bg-secondary);
                        border: none;
                        cursor: pointer;
                        color: var(--text-secondary);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    }
                    .employee-picker-close:hover {
                        background: var(--danger);
                        color: white;
                    }
                    .employee-picker-search {
                        padding: 16px 20px;
                        border-bottom: 1px solid var(--border-color);
                    }
                    .employee-picker-search input {
                        width: 100%;
                        padding: 12px 16px;
                        border-radius: 10px;
                        border: 1px solid var(--border-color);
                        background: var(--bg-secondary);
                        color: var(--text-primary);
                        font-size: 14px;
                    }
                    .employee-picker-search input:focus {
                        outline: none;
                        border-color: var(--accent-primary);
                    }
                    .employee-picker-list {
                        padding: 12px;
                        max-height: 400px;
                        overflow-y: auto;
                    }
                    .employee-picker-item {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px;
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .employee-picker-item:hover {
                        background: var(--bg-hover);
                    }
                    .employee-picker-avatar {
                        width: 44px;
                        height: 44px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        font-weight: 600;
                        color: white;
                    }
                    .employee-picker-info {
                        flex: 1;
                    }
                    .employee-picker-name {
                        font-weight: 600;
                        font-size: 15px;
                    }
                    .employee-picker-store {
                        font-size: 13px;
                        color: var(--text-muted);
                    }

                    /* Multi-select toggle */
                    .multi-select-toggle {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-top: 12px;
                        cursor: pointer;
                        font-size: 13px;
                        color: var(--text-secondary);
                    }
                    .multi-select-toggle input[type="checkbox"] {
                        width: 18px;
                        height: 18px;
                        accent-color: var(--accent-primary);
                        cursor: pointer;
                    }
                    .employee-picker-footer {
                        padding: 16px 20px;
                        border-top: 1px solid var(--border-color);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: var(--bg-secondary);
                        border-radius: 0 0 20px 20px;
                    }
                    .employee-picker-footer #selectedCount {
                        font-size: 14px;
                        color: var(--text-secondary);
                        font-weight: 500;
                    }
                    .assign-selected-btn {
                        padding: 10px 20px;
                        background: var(--accent-primary);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        transition: all 0.2s;
                    }
                    .assign-selected-btn:hover {
                        background: var(--accent-secondary);
                        transform: translateY(-1px);
                    }
                    .assign-selected-btn:disabled {
                        background: var(--text-muted);
                        cursor: not-allowed;
                        transform: none;
                    }
                    .employee-picker-item.multi-select {
                        position: relative;
                    }
                    .employee-picker-item .select-checkbox {
                        width: 22px;
                        height: 22px;
                        border-radius: 6px;
                        border: 2px solid var(--border-color);
                        background: var(--bg-primary);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                        flex-shrink: 0;
                    }
                    .employee-picker-item .select-checkbox i {
                        display: none;
                        color: white;
                        font-size: 12px;
                    }
                    .employee-picker-item.selected .select-checkbox {
                        background: var(--accent-primary);
                        border-color: var(--accent-primary);
                    }
                    .employee-picker-item.selected .select-checkbox i {
                        display: block;
                    }

                    /* Time Editor Modal */
                    .time-editor-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.6);
                        backdrop-filter: blur(8px);
                        z-index: 1001;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        opacity: 0;
                        visibility: hidden;
                        transition: all 0.3s;
                    }
                    .time-editor-overlay.active {
                        opacity: 1;
                        visibility: visible;
                    }
                    .time-editor-modal {
                        background: var(--bg-card);
                        border-radius: 24px;
                        width: 90%;
                        max-width: 480px;
                        overflow: hidden;
                        transform: scale(0.9) translateY(20px);
                        transition: transform 0.3s;
                        box-shadow: 0 25px 80px rgba(0,0,0,0.4);
                    }
                    .time-editor-overlay.active .time-editor-modal {
                        transform: scale(1) translateY(0);
                    }
                    .time-editor-header {
                        padding: 24px;
                        border-bottom: 1px solid var(--border-color);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .time-editor-header h3 {
                        font-size: 20px;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .time-editor-close {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: var(--bg-secondary);
                        border: none;
                        cursor: pointer;
                        color: var(--text-secondary);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        transition: all 0.2s;
                    }
                    .time-editor-close:hover {
                        background: var(--danger);
                        color: white;
                    }
                    .time-editor-body {
                        padding: 24px;
                    }
                    .time-editor-info {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        padding: 16px;
                        background: var(--bg-secondary);
                        border-radius: 16px;
                        margin-bottom: 24px;
                    }
                    .time-editor-avatar {
                        width: 56px;
                        height: 56px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 20px;
                        font-weight: 700;
                        color: white;
                    }
                    .time-editor-details h4 {
                        font-size: 18px;
                        font-weight: 600;
                        margin-bottom: 4px;
                    }
                    .time-editor-details p {
                        font-size: 14px;
                        color: var(--text-muted);
                    }
                    .time-editor-current {
                        text-align: center;
                        margin-bottom: 24px;
                    }
                    .time-editor-current-label {
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: var(--text-muted);
                        margin-bottom: 8px;
                    }
                    .time-editor-current-value {
                        font-size: 32px;
                        font-weight: 700;
                        color: var(--text-primary);
                    }
                    .time-editor-current-hours {
                        font-size: 14px;
                        color: var(--accent-primary);
                        margin-top: 4px;
                    }
                    .time-editor-slider-section {
                        margin-bottom: 24px;
                    }
                    .time-editor-slider-label {
                        font-size: 13px;
                        font-weight: 600;
                        color: var(--text-secondary);
                        margin-bottom: 12px;
                        display: flex;
                        justify-content: space-between;
                    }
                    .time-editor-slider-track {
                        position: relative;
                        height: 56px;
                        background: var(--bg-secondary);
                        border-radius: 12px;
                        border: 2px solid var(--border-color);
                        overflow: hidden;
                        margin-bottom: 8px;
                    }
                    .time-editor-slider-track:hover {
                        border-color: var(--accent-primary);
                    }
                    .time-editor-slider-range {
                        position: absolute;
                        top: 4px;
                        bottom: 4px;
                        border-radius: 8px;
                        cursor: grab;
                    }
                    .time-editor-slider-range:active {
                        cursor: grabbing;
                    }
                    .time-editor-slider-range.opening {
                        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    }
                    .time-editor-slider-range.closing {
                        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    }
                    .time-editor-handle {
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 24px;
                        height: 44px;
                        background: white;
                        border-radius: 8px;
                        cursor: ew-resize;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: box-shadow 0.2s;
                    }
                    .time-editor-handle:hover {
                        box-shadow: 0 6px 20px rgba(0,0,0,0.4);
                    }
                    .time-editor-handle::after {
                        content: '';
                        width: 6px;
                        height: 20px;
                        background: linear-gradient(180deg, var(--border-color) 0%, var(--border-color) 33%, transparent 33%, transparent 66%, var(--border-color) 66%);
                        border-radius: 3px;
                    }
                    .time-editor-handle.start {
                        left: -12px;
                    }
                    .time-editor-handle.end {
                        right: -12px;
                    }
                    .time-editor-hours-ruler {
                        display: flex;
                        justify-content: space-between;
                        padding: 0 4px;
                    }
                    .time-editor-hours-ruler span {
                        font-size: 11px;
                        color: var(--text-muted);
                        font-weight: 500;
                    }
                    .time-editor-presets {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 10px;
                        margin-bottom: 24px;
                    }
                    .time-editor-preset {
                        padding: 12px;
                        border: 2px solid var(--border-color);
                        border-radius: 12px;
                        background: var(--bg-secondary);
                        cursor: pointer;
                        text-align: center;
                        transition: all 0.2s;
                    }
                    .time-editor-preset:hover {
                        border-color: var(--accent-primary);
                        background: rgba(99, 102, 241, 0.1);
                    }
                    .time-editor-preset.active {
                        border-color: var(--accent-primary);
                        background: rgba(99, 102, 241, 0.15);
                    }
                    .time-editor-preset-time {
                        font-size: 14px;
                        font-weight: 700;
                        color: var(--text-primary);
                    }
                    .time-editor-preset-label {
                        font-size: 11px;
                        color: var(--text-muted);
                        margin-top: 2px;
                    }
                    .time-editor-footer {
                        padding: 20px 24px;
                        border-top: 1px solid var(--border-color);
                        display: flex;
                        gap: 12px;
                    }
                    .time-editor-btn {
                        flex: 1;
                        padding: 14px 20px;
                        border-radius: 12px;
                        border: none;
                        cursor: pointer;
                        font-size: 15px;
                        font-weight: 600;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    }
                    .time-editor-btn.cancel {
                        background: var(--bg-secondary);
                        color: var(--text-secondary);
                        border: 1px solid var(--border-color);
                    }
                    .time-editor-btn.cancel:hover {
                        background: var(--bg-hover);
                    }
                    .time-editor-btn.save {
                        background: var(--accent-primary);
                        color: white;
                    }
                    .time-editor-btn.save:hover {
                        background: var(--accent-secondary);
                        transform: translateY(-1px);
                    }
                    .time-editor-btn.delete {
                        background: transparent;
                        color: var(--danger);
                        flex: 0;
                        padding: 14px;
                    }
                    .time-editor-btn.delete:hover {
                        background: rgba(239, 68, 68, 0.1);
                    }

                    /* Clone Modal */
                    .clone-modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.6);
                        backdrop-filter: blur(8px);
                        z-index: 1001;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        opacity: 0;
                        visibility: hidden;
                        transition: all 0.3s;
                    }
                    .clone-modal-overlay.active {
                        opacity: 1;
                        visibility: visible;
                    }
                    .clone-modal {
                        background: var(--bg-card);
                        border-radius: 20px;
                        width: 90%;
                        max-width: 400px;
                        overflow: hidden;
                        transform: scale(0.9);
                        transition: transform 0.3s;
                        box-shadow: 0 25px 80px rgba(0,0,0,0.4);
                    }
                    .clone-modal-overlay.active .clone-modal {
                        transform: scale(1);
                    }
                    .clone-modal-header {
                        padding: 20px 24px;
                        border-bottom: 1px solid var(--border-color);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .clone-modal-header h3 {
                        font-size: 18px;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .clone-modal-body {
                        padding: 24px;
                    }
                    .clone-option {
                        padding: 16px;
                        border: 2px solid var(--border-color);
                        border-radius: 12px;
                        margin-bottom: 12px;
                        cursor: pointer;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 14px;
                    }
                    .clone-option:hover {
                        border-color: var(--accent-primary);
                        background: rgba(99, 102, 241, 0.05);
                    }
                    .clone-option-icon {
                        width: 44px;
                        height: 44px;
                        border-radius: 10px;
                        background: var(--bg-secondary);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                        color: var(--accent-primary);
                    }
                    .clone-option-info h4 {
                        font-size: 15px;
                        font-weight: 600;
                        margin-bottom: 2px;
                    }
                    .clone-option-info p {
                        font-size: 13px;
                        color: var(--text-muted);
                    }
                    .clone-modal-footer {
                        padding: 16px 24px;
                        border-top: 1px solid var(--border-color);
                        display: flex;
                        justify-content: flex-end;
                    }

                    /* All Stores View */
                    .stores-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                        gap: 20px;
                        margin-top: 20px;
                    }
                    .store-schedule-card {
                        background: var(--bg-card);
                        border-radius: 16px;
                        border: 1px solid var(--border-color);
                        overflow: hidden;
                    }
                    .store-schedule-header {
                        padding: 16px 20px;
                        background: var(--bg-secondary);
                        border-bottom: 1px solid var(--border-color);
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }
                    .store-schedule-header h4 {
                        font-size: 16px;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .store-schedule-header .store-icon {
                        width: 32px;
                        height: 32px;
                        border-radius: 8px;
                        background: var(--accent-gradient);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 14px;
                    }
                    .store-schedule-body {
                        padding: 12px;
                    }
                    .store-day-row {
                        display: flex;
                        align-items: stretch;
                        gap: 8px;
                        padding: 8px 0;
                        border-bottom: 1px solid var(--border-color);
                    }
                    .store-day-row:last-child {
                        border-bottom: none;
                    }
                    .store-day-label {
                        width: 60px;
                        font-size: 11px;
                        font-weight: 600;
                        color: var(--text-muted);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        white-space: nowrap;
                    }
                    .store-day-label.today {
                        color: var(--accent-primary);
                    }
                    .store-shifts {
                        flex: 1;
                        display: flex;
                        gap: 6px;
                    }
                    .store-shift-slot {
                        flex: 1;
                        min-height: 40px;
                        border-radius: 8px;
                        padding: 6px 8px;
                        font-size: 11px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .store-shift-slot.opening {
                        background: rgba(245, 158, 11, 0.1);
                        border: 1px solid rgba(245, 158, 11, 0.2);
                    }
                    .store-shift-slot.closing {
                        background: rgba(99, 102, 241, 0.1);
                        border: 1px solid rgba(99, 102, 241, 0.2);
                    }
                    .store-shift-slot.empty {
                        background: var(--bg-secondary);
                        border: 1px dashed var(--border-color);
                        align-items: center;
                        color: var(--text-muted);
                    }
                    .store-shift-slot:hover {
                        transform: scale(1.02);
                    }
                    .store-shift-slot.filled {
                        cursor: grab;
                        position: relative;
                    }
                    .store-shift-slot.filled:active {
                        cursor: grabbing;
                    }
                    .store-shift-slot.filled.dragging {
                        opacity: 0.5;
                        transform: scale(0.95);
                    }
                    .store-shift-slot.empty.drag-over {
                        background: rgba(99, 102, 241, 0.2);
                        border: 2px solid var(--accent-primary);
                        border-style: solid;
                    }
                    .store-shift-name {
                        font-weight: 600;
                        color: var(--text-primary);
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .store-shift-time {
                        color: var(--text-muted);
                        font-size: 10px;
                    }
                    .store-shift-clone {
                        position: absolute;
                        top: 2px;
                        right: 2px;
                        width: 18px;
                        height: 18px;
                        border-radius: 4px;
                        background: rgba(255,255,255,0.9);
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 9px;
                        color: var(--accent-primary);
                        opacity: 0;
                        transition: opacity 0.2s;
                    }
                    .store-shift-slot:hover .store-shift-clone {
                        opacity: 1;
                    }
                    .store-shift-clone:hover {
                        background: var(--accent-primary);
                        color: white;
                    }
                    .store-shift-delete {
                        position: absolute;
                        top: 2px;
                        right: 22px;
                        width: 18px;
                        height: 18px;
                        border-radius: 4px;
                        background: rgba(255,255,255,0.9);
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 9px;
                        color: #ef4444;
                        opacity: 0;
                        transition: opacity 0.2s;
                    }
                    .store-shift-slot:hover .store-shift-delete {
                        opacity: 1;
                    }
                    .store-shift-delete:hover {
                        background: #ef4444;
                        color: white;
                    }

                    /* Multi-employee slot styles */
                    .store-shift-slot.multi-employee {
                        background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.1)) !important;
                        border: 1px solid rgba(139, 92, 246, 0.3) !important;
                        padding: 4px;
                        gap: 4px;
                    }
                    .store-shift-employee {
                        background: transparent;
                        padding: 2px 8px;
                        padding-right: 48px;
                        cursor: pointer;
                        position: relative;
                        transition: all 0.2s;
                    }
                    .store-shift-employee:hover {
                        background: rgba(0,0,0,0.03);
                    }
                    .store-shift-employee .store-shift-clone {
                        position: absolute;
                        top: 50%;
                        right: 24px;
                        transform: translateY(-50%);
                        width: 16px;
                        height: 16px;
                        font-size: 8px;
                    }
                    .store-shift-employee .store-shift-delete {
                        position: absolute;
                        top: 50%;
                        right: 4px;
                        transform: translateY(-50%);
                        width: 16px;
                        height: 16px;
                        font-size: 8px;
                    }
                    .store-shift-employee:hover .store-shift-clone,
                    .store-shift-employee:hover .store-shift-delete {
                        opacity: 1;
                    }
                    .store-shift-add-more {
                        width: 100%;
                        padding: 4px;
                        border: 1px dashed rgba(139, 92, 246, 0.4);
                        border-radius: 6px;
                        background: transparent;
                        color: #8b5cf6;
                        cursor: pointer;
                        font-size: 10px;
                        transition: all 0.2s;
                        margin-top: 2px;
                    }
                    .store-shift-add-more:hover {
                        background: rgba(139, 92, 246, 0.1);
                        border-color: #8b5cf6;
                    }

                    /* Days Off Section for All Stores View */
                    .store-days-off-section {
                        padding: 16px;
                        border-top: 1px solid var(--border-color);
                        background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.02) 100%);
                    }
                    .store-days-off-header {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-bottom: 12px;
                        color: var(--text-secondary);
                    }
                    .store-days-off-header.clickable {
                        cursor: pointer;
                        padding: 8px 12px;
                        background: rgba(99, 102, 241, 0.05);
                        border-radius: 8px;
                        border: 1px solid rgba(99, 102, 241, 0.15);
                        transition: all 0.2s;
                    }
                    .store-days-off-header.clickable:hover {
                        background: rgba(99, 102, 241, 0.1);
                        border-color: var(--accent-primary);
                        transform: translateY(-1px);
                    }
                    .store-days-off-list {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }
                    .store-day-off-item {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 8px 12px;
                        background: var(--bg-card);
                        border-radius: 8px;
                        border: 1px solid var(--border-color);
                        transition: all 0.2s;
                        position: relative;
                    }
                    .store-day-off-item:hover {
                        background: var(--bg-hover);
                        border-color: var(--accent-primary);
                    }
                    .store-day-off-avatar {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        font-weight: 600;
                        color: white;
                        flex-shrink: 0;
                    }
                    .store-day-off-info {
                        flex: 1;
                        min-width: 0;
                    }
                    .store-day-off-name {
                        font-size: 13px;
                        font-weight: 600;
                        color: var(--text-primary);
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .store-day-off-date {
                        font-size: 11px;
                        color: var(--text-muted);
                    }
                    .store-day-off-remove {
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: var(--danger);
                        color: white;
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                        opacity: 0;
                        transition: opacity 0.2s;
                    }
                    .store-day-off-item:hover .store-day-off-remove {
                        opacity: 1;
                    }
                    .store-day-off-remove:hover {
                        background: #dc2626;
                        transform: scale(1.1);
                    }
                    .store-days-off-empty {
                        padding: 16px;
                        text-align: center;
                        color: var(--text-muted);
                        font-size: 12px;
                        font-style: italic;
                    }

                    /* Date Picker Modal for All Stores View */
                    .date-picker-modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        backdrop-filter: blur(4px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10000;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    }
                    .date-picker-modal-overlay.active {
                        opacity: 1;
                    }
                    .date-picker-modal {
                        background: var(--bg-card);
                        border-radius: 16px;
                        border: 1px solid var(--border-color);
                        max-width: 600px;
                        width: 90%;
                        max-height: 80vh;
                        overflow: hidden;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                        transform: scale(0.9);
                        transition: transform 0.3s ease;
                    }
                    .date-picker-modal-overlay.active .date-picker-modal {
                        transform: scale(1);
                    }
                    .date-picker-header {
                        padding: 20px 24px;
                        border-bottom: 1px solid var(--border-color);
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        background: var(--bg-secondary);
                    }
                    .date-picker-header h3 {
                        margin: 0;
                        font-size: 18px;
                        font-weight: 600;
                        color: var(--text-primary);
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .close-modal-btn {
                        width: 32px;
                        height: 32px;
                        border-radius: 8px;
                        background: transparent;
                        border: none;
                        color: var(--text-muted);
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    }
                    .close-modal-btn:hover {
                        background: var(--bg-hover);
                        color: var(--text-primary);
                    }
                    .date-picker-body {
                        padding: 24px;
                    }
                    .date-picker-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                        gap: 12px;
                    }
                    .date-picker-option {
                        padding: 16px;
                        border: 2px solid var(--border-color);
                        border-radius: 12px;
                        cursor: pointer;
                        text-align: center;
                        transition: all 0.2s;
                        background: var(--bg-secondary);
                        position: relative;
                    }
                    .date-picker-option:hover {
                        border-color: var(--accent-primary);
                        background: rgba(99, 102, 241, 0.05);
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
                    }
                    .date-picker-option.today {
                        border-color: var(--accent-primary);
                        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
                    }
                    .date-picker-day {
                        font-size: 14px;
                        font-weight: 600;
                        color: var(--text-primary);
                        margin-bottom: 4px;
                    }
                    .date-picker-date {
                        font-size: 12px;
                        color: var(--text-muted);
                    }
                    .date-picker-today-badge {
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        background: var(--accent-primary);
                        color: white;
                        font-size: 9px;
                        font-weight: 600;
                        padding: 2px 6px;
                        border-radius: 4px;
                        text-transform: uppercase;
                    }

                    /* Hours Summary Panel */
                    .schedule-layout {
                        display: flex;
                        gap: 20px;
                    }
                    .schedule-main {
                        flex: 1;
                        min-width: 0;
                    }
                    .hours-summary-panel {
                        width: 280px;
                        flex-shrink: 0;
                        background: var(--bg-card);
                        border-radius: 16px;
                        border: 1px solid var(--border-color);
                        height: fit-content;
                        position: sticky;
                        top: 20px;
                        max-height: calc(100vh - 200px);
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                    }
                    .hours-panel-header {
                        padding: 16px 20px;
                        border-bottom: 1px solid var(--border-color);
                        background: var(--bg-secondary);
                    }
                    .hours-panel-header h3 {
                        font-size: 15px;
                        font-weight: 700;
                        color: var(--text-primary);
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin: 0;
                    }
                    .hours-panel-header p {
                        font-size: 12px;
                        color: var(--text-muted);
                        margin: 4px 0 0 0;
                    }
                    .hours-panel-list {
                        flex: 1;
                        overflow-y: auto;
                        padding: 12px;
                    }
                    .hours-employee-item {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 10px 12px;
                        border-radius: 10px;
                        margin-bottom: 6px;
                        transition: all 0.2s;
                        background: var(--bg-secondary);
                        border: 1px solid transparent;
                    }
                    .hours-employee-item:hover {
                        background: var(--bg-hover);
                        border-color: var(--border-color);
                    }
                    .hours-employee-item:last-child {
                        margin-bottom: 0;
                    }
                    .hours-employee-avatar {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 13px;
                        font-weight: 600;
                        color: white;
                        flex-shrink: 0;
                    }
                    .hours-employee-info {
                        flex: 1;
                        min-width: 0;
                    }
                    .hours-employee-name {
                        font-size: 13px;
                        font-weight: 600;
                        color: var(--text-primary);
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .hours-employee-store {
                        font-size: 11px;
                        color: var(--text-muted);
                    }
                    .hours-badge {
                        font-size: 14px;
                        font-weight: 700;
                        padding: 6px 10px;
                        border-radius: 8px;
                        background: rgba(99, 102, 241, 0.1);
                        color: var(--accent-primary);
                        white-space: nowrap;
                    }
                    .hours-badge.high {
                        background: rgba(16, 185, 129, 0.1);
                        color: #10b981;
                    }
                    .hours-badge.low {
                        background: rgba(245, 158, 11, 0.1);
                        color: #f59e0b;
                    }
                    .hours-badge.zero {
                        background: rgba(239, 68, 68, 0.1);
                        color: #ef4444;
                    }
                    .hours-total-row {
                        padding: 12px 16px;
                        border-top: 1px solid var(--border-color);
                        background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .hours-total-label {
                        font-size: 13px;
                        font-weight: 600;
                        color: var(--text-secondary);
                    }
                    .hours-total-value {
                        font-size: 18px;
                        font-weight: 700;
                        color: var(--accent-primary);
                    }
                    .hours-panel-empty {
                        padding: 40px 20px;
                        text-align: center;
                        color: var(--text-muted);
                    }
                    .hours-panel-empty i {
                        font-size: 32px;
                        margin-bottom: 12px;
                        opacity: 0.5;
                    }
                    .hours-panel-empty p {
                        font-size: 13px;
                        margin: 0;
                    }
                    @media (max-width: 1024px) {
                        .schedule-layout {
                            flex-direction: column;
                        }
                        .hours-summary-panel {
                            width: 100%;
                            position: relative;
                            top: 0;
                            max-height: 400px;
                            order: -1;
                            margin-bottom: 16px;
                        }
                    }
                    @media (max-width: 768px) {
                        .hours-summary-panel {
                            max-height: 300px;
                        }
                        .hours-panel-list {
                            padding: 8px;
                        }
                        .hours-employee-item {
                            padding: 8px 10px;
                        }
                        .hours-employee-avatar {
                            width: 32px;
                            height: 32px;
                            font-size: 11px;
                        }
                        .hours-employee-name {
                            font-size: 12px;
                        }
                        .hours-badge {
                            font-size: 12px;
                            padding: 4px 8px;
                        }
                    }
                </style>

                <div class="schedule-header-bar">
                    <div class="schedule-title-section">
                        <h2><i class="fas fa-calendar-alt" style="color: var(--accent-primary); margin-right: 10px;"></i>Schedule</h2>
                        <p>Drag employees to Opening or Closing shifts</p>
                    </div>
                    <div class="schedule-controls">
                        <div class="week-nav">
                            <button class="week-nav-btn" onclick="changeWeek(-1)" title="Previous week">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <div class="week-display">${weekRangeText}</div>
                            <button class="week-nav-btn" onclick="changeWeek(1)" title="Next week">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                            <button class="week-nav-btn" onclick="goToToday()" title="Today">
                                <i class="fas fa-calendar-day"></i>
                            </button>
                        </div>
                        <div class="schedule-controls-row">
                            <button class="week-nav-btn" onclick="openCloneModal()" title="Clone from previous week" style="background: var(--bg-card); border: 1px solid var(--border-color);">
                                <i class="fas fa-clone"></i>
                            </button>
                            <a href="schedule.html" target="_blank" class="week-nav-btn" title="Share public schedule" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-share-alt"></i>
                            </a>
                            <select class="store-filter-select" id="schedule-store-filter" onchange="renderScheduleGrid()">
                                <option value="all">All Stores</option>
                                <option value="all-employees">All Employees</option>
                                <option value="employees">Employees Hours</option>
                                <option value="Miramar">VSU Miramar</option>
                                <option value="Morena">VSU Morena</option>
                                <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                <option value="Chula Vista">VSU Chula Vista</option>
                                <option value="North Park">VSU North Park</option>
                                <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                            </select>
                            <select class="store-filter-select" id="schedule-employee-filter" onchange="renderScheduleGrid()" style="min-width: 180px;">
                                <option value="">-- By Employee --</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="schedule-layout">
                    <div class="schedule-main">
                        <div id="schedule-container">
                            <div style="padding: 60px; text-align: center;">
                                <div class="loading-spinner"></div>
                                <p style="color: var(--text-muted); margin-top: 15px;">Loading schedules...</p>
                            </div>
                        </div>
                    </div>
                    <div class="hours-summary-panel" id="hoursSummaryPanel">
                        <div class="hours-panel-header">
                            <h3><i class="fas fa-clock"></i> Hours This Week</h3>
                            <p id="hoursPanelWeekRange">${weekRangeText}</p>
                        </div>
                        <div class="hours-panel-list" id="hoursPanelList">
                            <div class="hours-panel-empty">
                                <i class="fas fa-user-clock"></i>
                                <p>Loading employee hours...</p>
                            </div>
                        </div>
                        <div class="hours-total-row">
                            <span class="hours-total-label">Total Hours</span>
                            <span class="hours-total-value" id="hoursTotalValue">0h</span>
                        </div>
                    </div>
                </div>

                <!-- Employee Picker Modal -->
                <div class="employee-picker-overlay" id="employeePickerOverlay" onmousedown="closeEmployeePicker(event)">
                    <div class="employee-picker" onclick="event.stopPropagation()">
                        <div class="employee-picker-header">
                            <h3><i class="fas fa-user-plus" style="margin-right: 8px; color: var(--accent-primary);"></i>Assign Employee</h3>
                            <button class="employee-picker-close" onclick="closeEmployeePicker()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="employee-picker-search">
                            <input type="text" id="employeePickerSearch" placeholder="Search employee..." oninput="filterEmployeePicker()">
                            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 10px; padding: 10px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.1)); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2);">
                                <i class="fas fa-users" style="color: var(--accent-primary); margin-right: 6px;"></i>
                                <strong>You can add multiple employees!</strong><br>
                                <span style="font-size: 11px; color: var(--text-muted);">Just click on each employee you want to assign to this shift.</span>
                            </div>
                        </div>
                        <div class="employee-picker-list" id="employeePickerList">
                            <!-- Employees will be loaded here -->
                        </div>
                        <div class="employee-picker-footer" id="employeePickerFooter" style="display: none;">
                            <span id="selectedCount">0 selected</span>
                            <button class="assign-selected-btn" onclick="assignSelectedEmployees()">
                                <i class="fas fa-check"></i> Assign Selected
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Time Editor Modal -->
                <div class="time-editor-overlay" id="timeEditorOverlay" onmousedown="closeTimeEditor(event)">
                    <div class="time-editor-modal" onclick="event.stopPropagation()">
                        <div class="time-editor-header">
                            <h3 id="timeEditorTitle"><i class="fas fa-clock"></i> Edit Shift</h3>
                            <button class="time-editor-close" onclick="closeTimeEditor()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="time-editor-body">
                            <div class="time-editor-info" id="timeEditorInfo">
                                <!-- Employee info will be loaded here -->
                            </div>
                            <div class="time-editor-current">
                                <div class="time-editor-current-label">Current Schedule</div>
                                <div class="time-editor-current-value" id="timeEditorCurrentValue">9:00a - 5:00p</div>
                                <div class="time-editor-current-hours" id="timeEditorCurrentHours">8.0 hours</div>
                            </div>
                            <div class="time-editor-presets">
                                <div class="time-editor-preset" onclick="setTimeEditorPreset('08:45', '16:00')">
                                    <div class="time-editor-preset-time">8:45a - 4p</div>
                                    <div class="time-editor-preset-label">Morning</div>
                                </div>
                                <div class="time-editor-preset" onclick="setTimeEditorPreset('09:45', '16:00')">
                                    <div class="time-editor-preset-time">9:45a - 4p</div>
                                    <div class="time-editor-preset-label">Mid AM</div>
                                </div>
                                <div class="time-editor-preset" onclick="setTimeEditorPreset('08:45', '17:00')">
                                    <div class="time-editor-preset-time">8:45a - 5p</div>
                                    <div class="time-editor-preset-label">Full Day</div>
                                </div>
                                <div class="time-editor-preset" onclick="setTimeEditorPreset('16:00', '22:30')">
                                    <div class="time-editor-preset-time">4p - 10:30p</div>
                                    <div class="time-editor-preset-label">Evening</div>
                                </div>
                                <div class="time-editor-preset" onclick="setTimeEditorPreset('17:00', '23:30')">
                                    <div class="time-editor-preset-time">5p - 11:30p</div>
                                    <div class="time-editor-preset-label">Closing</div>
                                </div>
                                <div class="time-editor-preset" onclick="setTimeEditorPreset('18:00', '23:30')">
                                    <div class="time-editor-preset-time">6p - 11:30p</div>
                                    <div class="time-editor-preset-label">Night</div>
                                </div>
                            </div>
                            <div class="time-editor-slider-section">
                                <div class="time-editor-slider-label">
                                    <span>Drag to adjust</span>
                                </div>
                                <div class="time-editor-slider-track" id="timeEditorTrack">
                                    <div class="time-editor-slider-range" id="timeEditorRange">
                                        <div class="time-editor-handle start" id="timeEditorHandleStart"></div>
                                        <div class="time-editor-handle end" id="timeEditorHandleEnd"></div>
                                    </div>
                                </div>
                                <div class="time-editor-hours-ruler">
                                    <span>6am</span>
                                    <span>9am</span>
                                    <span>12pm</span>
                                    <span>3pm</span>
                                    <span>6pm</span>
                                    <span>9pm</span>
                                    <span>12am</span>
                                </div>
                            </div>
                        </div>
                        <div class="time-editor-footer">
                            <button class="time-editor-btn delete" onclick="deleteFromTimeEditor()" title="Remove shift">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="time-editor-btn add-employee" onclick="addAnotherEmployeeFromEditor()" title="Add New Turn" style="background: linear-gradient(135deg, #f97316, #ea580c); color: white;">
                                <i class="fas fa-user-plus"></i> Add New Turn
                            </button>
                            <button class="time-editor-btn save" onclick="saveTimeEditor()">
                                <i class="fas fa-check"></i> Save
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Clone Modal -->
                <div class="clone-modal-overlay" id="cloneModalOverlay" onmousedown="closeCloneModal(event)">
                    <div class="clone-modal" onclick="event.stopPropagation()">
                        <div class="clone-modal-header">
                            <h3><i class="fas fa-clone" style="color: var(--accent-primary);"></i> Clone Schedule</h3>
                            <button class="time-editor-close" onclick="closeCloneModal()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="clone-modal-body">
                            <div class="clone-option" onclick="cloneFromPreviousWeek()">
                                <div class="clone-option-icon">
                                    <i class="fas fa-history"></i>
                                </div>
                                <div class="clone-option-info">
                                    <h4>Clone Previous Week</h4>
                                    <p>Copy all shifts from last week to this week</p>
                                </div>
                            </div>
                            <div class="clone-option" onclick="cloneToNextWeek()">
                                <div class="clone-option-icon">
                                    <i class="fas fa-arrow-right"></i>
                                </div>
                                <div class="clone-option-info">
                                    <h4>Clone to Next Week</h4>
                                    <p>Copy this week's shifts to next week</p>
                                </div>
                            </div>
                            <div class="clone-option" onclick="clearCurrentWeek()">
                                <div class="clone-option-icon" style="color: var(--danger);">
                                    <i class="fas fa-trash-alt"></i>
                                </div>
                                <div class="clone-option-info">
                                    <h4>Clear This Week</h4>
                                    <p>Remove all shifts from current week</p>
                                </div>
                            </div>
                        </div>
                        <div class="clone-modal-footer">
                            <button class="time-editor-btn cancel" onclick="closeCloneModal()">Close</button>
                        </div>
                    </div>
                </div>
            `;
            loadScheduleData();
        }

        function populateEmployeeOptions() {
            const employeeSelect = document.getElementById('schedule-employee-filter');
            if (!employeeSelect) {
                console.log('Employee filter not found');
                return;
            }

            // Get active employees sorted by name (include employees without status or with active status)
            const activeEmployees = employees
                .filter(e => !e.status || e.status === 'active')
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            console.log('Total employees:', employees.length, '| Active:', activeEmployees.length);

            let optionsHtml = '<option value="">-- By Employee --</option>';
            optionsHtml += '<option value="all-employees">All Employees</option>';

            if (activeEmployees.length > 0) {
                optionsHtml += activeEmployees.map(emp =>
                    `<option value="emp_${emp.id}">${emp.name}</option>`
                ).join('');
            }

            employeeSelect.innerHTML = optionsHtml;
        }

        async function loadScheduleData() {
            const container = document.getElementById('schedule-container');
            if (!container) return;

            try {
                // Make sure employees are loaded first
                if (employees.length === 0) {
                    await loadEmployeesFromFirebase();
                }

                // Populate employee dropdown options
                populateEmployeeOptions();

                const db = firebase.firestore();

                // Load schedules
                const schedulesRef = db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules');
                const snapshot = await schedulesRef.get();

                schedules = [];
                snapshot.forEach(doc => {
                    schedules.push({ id: doc.id, ...doc.data() });
                });

                // Load days off
                const daysOffRef = db.collection(window.FIREBASE_COLLECTIONS.daysOff || 'daysOff');
                const daysOffSnapshot = await daysOffRef.get();

                daysOff = [];
                daysOffSnapshot.forEach(doc => {
                    daysOff.push({ id: doc.id, ...doc.data() });
                });

                renderScheduleGrid();
            } catch (error) {
                console.error('Error loading schedules:', error);
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--warning); margin-bottom: 20px;"></i>
                        <h2 style="color: var(--text-secondary); margin-bottom: 10px;">Connection Error</h2>
                        <p style="color: var(--text-muted);">Unable to load schedule data.</p>
                        <button class="btn-primary" style="margin-top: 20px;" onclick="loadScheduleData()"><i class="fas fa-sync"></i> Retry</button>
                    </div>
                `;
            }
        }

        function renderScheduleGrid() {
            const container = document.getElementById('schedule-container');
            if (!container) return;

            const storeFilter = document.getElementById('schedule-store-filter')?.value || 'all';
            const employeeFilter = document.getElementById('schedule-employee-filter')?.value || '';
            const weekDates = getWeekDates(currentWeekStart);
            const today = formatDateKey(new Date());

            // If "All Employees" is selected from the employee dropdown
            if (employeeFilter === 'all-employees') {
                const storeSelect = document.getElementById('schedule-store-filter');
                if (storeSelect && storeSelect.value !== 'all') {
                    storeSelect.value = 'all';
                }
                renderAllEmployeesView(container, weekDates, today);
                return;
            }

            // If employee is selected from the employee dropdown, show their personal schedule
            if (employeeFilter && employeeFilter.startsWith('emp_')) {
                // Reset store filter display
                const storeSelect = document.getElementById('schedule-store-filter');
                if (storeSelect && storeSelect.value !== 'all') {
                    storeSelect.value = 'all';
                }
                const employeeId = employeeFilter.substring(4);
                renderEmployeeScheduleView(container, weekDates, today, employeeId);
                return;
            }

            // If "All Stores" is selected, show the stores grid view
            if (storeFilter === 'all') {
                renderAllStoresView(container, weekDates, today);
                return;
            }

            // If "All Employees" is selected, show all employees grid view
            if (storeFilter === 'all-employees') {
                renderAllEmployeesView(container, weekDates, today);
                return;
            }

            // If "Employees Hours" is selected, show the employees worked hours view
            if (storeFilter === 'employees') {
                renderEmployeesHoursView(container, weekDates, today);
                return;
            }

            // Filter employees by store
            let filteredEmployees = [...employees];
            if (storeFilter !== 'all') {
                filteredEmployees = filteredEmployees.filter(e => e.store === storeFilter);
            }

            if (filteredEmployees.length === 0) {
                container.innerHTML = `
                    <div style="padding: 60px; text-align: center;">
                        <i class="fas fa-users" style="font-size: 48px; color: var(--text-muted); margin-bottom: 20px;"></i>
                        <h3 style="color: var(--text-secondary); margin-bottom: 10px;">No Employees</h3>
                        <p style="color: var(--text-muted);">No employees found for the selected store.</p>
                    </div>
                `;
                return;
            }

            // Build day cards HTML
            let html = '<div class="schedule-days-container">';

            weekDates.forEach(date => {
                const dateKey = formatDateKey(date);
                const isToday = dateKey === today;
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNumber = date.getDate();

                html += `
                    <div class="schedule-day-card ${isToday ? 'today' : ''}" data-date="${dateKey}">
                        <div class="day-card-header">
                            <div class="day-name">${dayName}</div>
                            <div class="day-number">${dayNumber}</div>
                        </div>
                        <div class="day-card-body">
                `;

                // Render both shift slots (Opening and Closing)
                ['opening', 'closing'].forEach(shiftType => {
                    const shiftConfig = SHIFT_TYPES[shiftType];
                    // Find ALL schedules for this day and shift type (supports multiple employees)
                    const slotSchedules = schedules.filter(s =>
                        s.date === dateKey &&
                        s.shiftType === shiftType &&
                        (storeFilter === 'all' || s.store === storeFilter)
                    );

                    const hasSchedules = slotSchedules.length > 0;
                    const firstSchedule = slotSchedules[0];
                    const startTime = firstSchedule?.startTime || shiftConfig.defaultStart;
                    const endTime = firstSchedule?.endTime || shiftConfig.defaultEnd;

                    html += `
                        <div class="shift-slot ${shiftType}" data-date="${dateKey}" data-shift-type="${shiftType}">
                            <div class="shift-slot-header">
                                <div class="shift-type-badge">
                                    <i class="fas ${shiftConfig.icon}"></i>
                                    ${shiftConfig.name}
                                </div>
                                <div class="shift-time-display" id="time-display-${dateKey}-${shiftType}">
                                    ${formatTimeShort(startTime)} - ${formatTimeShort(endTime)}
                                </div>
                            </div>
                            <div class="employee-drop-zone ${hasSchedules ? '' : 'empty'} ${slotSchedules.length > 1 ? 'multi-employee' : ''}"
                                 data-date="${dateKey}"
                                 data-shift-type="${shiftType}"
                                 onclick="openEmployeePicker('${dateKey}', '${shiftType}', '${storeFilter}')"
                                 ondragover="handleShiftDragOver(event)"
                                 ondragleave="handleShiftDragLeave(event)"
                                 ondrop="handleShiftDrop(event, '${dateKey}', '${shiftType}')">
                    `;

                    if (hasSchedules) {
                        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];

                        // Render each employee assigned to this slot
                        slotSchedules.forEach(schedule => {
                            const emp = employees.find(e => e.id === schedule.employeeId);
                            if (!emp) return;

                            const schedStartTime = schedule.startTime || shiftConfig.defaultStart;
                            const schedEndTime = schedule.endTime || shiftConfig.defaultEnd;
                            const hours = calculateHours(schedStartTime, schedEndTime);
                            const colorIndex = emp.name ? emp.name.charCodeAt(0) % colors.length : 0;
                            const initials = emp.name ? emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

                            html += `
                                <div class="assigned-employee"
                                     draggable="true"
                                     data-schedule-id="${schedule.id}"
                                     data-employee-id="${emp.id}"
                                     ondragstart="handleEmployeeDragStart(event, '${schedule.id}')"
                                     ondragend="handleEmployeeDragEnd(event)"
                                     onclick="event.stopPropagation(); openTimeEditor('${schedule.id}')">
                                    <div class="assigned-employee-avatar" style="background: ${colors[colorIndex]};">${initials}</div>
                                    <div class="assigned-employee-info">
                                        <div class="assigned-employee-name">${emp.name}</div>
                                        <div class="assigned-employee-hours">${hours.toFixed(1)}h</div>
                                    </div>
                                    <button class="assigned-employee-clone" onclick="event.stopPropagation(); cloneShift('${schedule.id}')" title="Clone shift">
                                        <i class="fas fa-clone"></i>
                                    </button>
                                    <button class="assigned-employee-remove" onclick="event.stopPropagation(); removeSchedule('${schedule.id}')">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            `;
                        });

                        // Add "Add more" button when there are already employees
                        html += `
                            <div class="add-more-employee" onclick="event.stopPropagation(); openEmployeePicker('${dateKey}', '${shiftType}', '${storeFilter}')">
                                <i class="fas fa-plus"></i>
                            </div>
                        `;
                    } else {
                        html += `<i class="fas fa-plus"></i> Assign`;
                    }

                    html += `</div>`;

                    html += `</div>`;
                });

                // Days off section for this date
                const dayOffEmployees = daysOff.filter(d =>
                    d.date === dateKey &&
                    (storeFilter === 'all' || d.store === storeFilter)
                );

                html += `
                    <div class="day-off-section">
                        <div class="day-off-header" onclick="openDayOffPicker('${dateKey}', '${storeFilter}')">
                            <i class="fas fa-umbrella-beach" style="color: var(--accent-primary);"></i>
                            <span>Days Off</span>
                            <i class="fas fa-plus" style="margin-left: auto; font-size: 12px;"></i>
                        </div>
                        <div class="day-off-employees">
                `;

                if (dayOffEmployees.length > 0) {
                    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
                    dayOffEmployees.forEach(dayOff => {
                        const emp = employees.find(e => e.id === dayOff.employeeId);
                        if (emp) {
                            const colorIndex = emp.name ? emp.name.charCodeAt(0) % colors.length : 0;
                            const initials = emp.name ? emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
                            html += `
                                <div class="day-off-employee-badge">
                                    <div class="day-off-avatar" style="background: ${colors[colorIndex]};">${initials}</div>
                                    <span class="day-off-name">${emp.name}</span>
                                    <button class="day-off-remove" onclick="event.stopPropagation(); removeDayOff('${dayOff.id}')" title="Remove day off">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            `;
                        }
                    });
                } else {
                    html += `<div class="day-off-empty">No days off</div>`;
                }

                html += `
                        </div>
                    </div>
                `;

                html += `
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            container.innerHTML = html;

            // Update hours summary panel
            updateHoursSummaryPanel();
        }

        // Calculate and render hours summary panel - now shows both scheduled AND actual hours
        async function updateHoursSummaryPanel() {
            const panelList = document.getElementById('hoursPanelList');
            const totalValueEl = document.getElementById('hoursTotalValue');
            const weekRangeEl = document.getElementById('hoursPanelWeekRange');

            if (!panelList) return;

            const weekDates = getWeekDates(currentWeekStart);
            const weekRangeText = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

            if (weekRangeEl) {
                weekRangeEl.textContent = weekRangeText;
            }

            // Show loading state
            panelList.innerHTML = `
                <div class="hours-panel-empty">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading hours...</p>
                </div>
            `;

            // Calculate SCHEDULED hours for each employee this week
            const employeeScheduledHours = {};
            const employeeHoursPerDay = {}; // Track hours per employee per day to handle overlapping shifts
            const weekDateKeys = weekDates.map(d => formatDateKey(d));

            // Get all schedules for this week
            const weekSchedules = schedules.filter(s => weekDateKeys.includes(s.date));

            // Sum up SCHEDULED hours per employee, capping at 16 hours per day max
            weekSchedules.forEach(schedule => {
                if (!schedule.employeeId) return;

                const startTime = schedule.startTime || SHIFT_TYPES[schedule.shiftType]?.defaultStart || '09:00';
                const endTime = schedule.endTime || SHIFT_TYPES[schedule.shiftType]?.defaultEnd || '17:00';
                const hours = calculateHours(startTime, endTime);
                const dayKey = `${schedule.employeeId}_${schedule.date}`;

                if (!employeeHoursPerDay[dayKey]) {
                    employeeHoursPerDay[dayKey] = 0;
                }

                // Add hours but cap at 16 per day (to handle overlapping shifts)
                const currentDayHours = employeeHoursPerDay[dayKey];
                const hoursToAdd = Math.min(hours, 16 - currentDayHours);
                if (hoursToAdd > 0) {
                    employeeHoursPerDay[dayKey] += hoursToAdd;

                    if (!employeeScheduledHours[schedule.employeeId]) {
                        employeeScheduledHours[schedule.employeeId] = 0;
                    }
                    employeeScheduledHours[schedule.employeeId] += hoursToAdd;
                }
            });

            // Now calculate ACTUAL hours from clock in/out records
            const employeeActualMinutes = {};
            try {
                // Initialize Firebase Clock In Manager if not already done
                if (typeof firebaseClockInManager !== 'undefined' && !firebaseClockInManager.isInitialized) {
                    await firebaseClockInManager.initialize();
                }

                // Get clock records for each day of the week
                for (const date of weekDates) {
                    const dateKey = formatDateKey(date);
                    try {
                        const records = await firebaseClockInManager.loadClockRecordsByDate(dateKey);
                        records.forEach(record => {
                            // Find matching employee
                            const matchingEmp = employees.find(e => {
                                if (e.firestoreId && e.firestoreId === record.employeeId) return true;
                                if (e.id && e.id === record.employeeId) return true;
                                if (e.name && record.employeeName &&
                                    e.name.toLowerCase().trim() === record.employeeName.toLowerCase().trim()) return true;
                                return false;
                            });

                            if (matchingEmp) {
                                const workedTime = calculateWorkedTimeFromRecord(record);
                                if (workedTime.totalMinutes > 0) {
                                    if (!employeeActualMinutes[matchingEmp.id]) {
                                        employeeActualMinutes[matchingEmp.id] = 0;
                                    }
                                    employeeActualMinutes[matchingEmp.id] += workedTime.totalMinutes;
                                }
                            }
                        });
                    } catch (err) {
                        // Silently handle errors for individual dates
                    }
                }
            } catch (err) {
                console.warn('Could not load clock records for hours panel:', err);
            }

            // Create array of employees with BOTH scheduled and actual hours
            const employeeHoursArray = employees
                .filter(emp => emp.status === 'active')
                .map(emp => {
                    const actualMinutes = employeeActualMinutes[emp.id] || 0;
                    const actualHours = actualMinutes / 60;
                    return {
                        employee: emp,
                        scheduledHours: employeeScheduledHours[emp.id] || 0,
                        actualHours: actualHours,
                        actualMinutes: actualMinutes
                    };
                })
                .sort((a, b) => b.actualHours - a.actualHours); // Sort by actual hours descending

            if (employeeHoursArray.length === 0) {
                panelList.innerHTML = `
                    <div class="hours-panel-empty">
                        <i class="fas fa-user-clock"></i>
                        <p>No employees found</p>
                    </div>
                `;
                if (totalValueEl) totalValueEl.textContent = '0h';
                return;
            }

            const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
            let totalScheduledHours = 0;
            let totalActualMinutes = 0;

            let html = '';
            employeeHoursArray.forEach(item => {
                const emp = item.employee;
                const scheduledHours = item.scheduledHours;
                const actualHours = item.actualHours;
                const actualMinutes = item.actualMinutes;
                totalScheduledHours += scheduledHours;
                totalActualMinutes += actualMinutes;

                const colorIndex = emp.name ? emp.name.charCodeAt(0) % colors.length : 0;
                const initials = emp.name ? emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

                // Format actual hours display
                const actualHoursInt = Math.floor(actualHours);
                const actualMins = Math.floor(actualMinutes % 60);
                let actualDisplay = '-';
                if (actualMinutes > 0) {
                    actualDisplay = actualHoursInt > 0 ? `${actualHoursInt}h ${actualMins}m` : `${actualMins}m`;
                }

                // Determine badge class based on actual hours vs scheduled
                let badgeClass = '';
                if (actualMinutes === 0 && scheduledHours === 0) {
                    badgeClass = 'zero';
                } else if (actualMinutes > 0 && scheduledHours > 0) {
                    // Compare actual vs scheduled
                    const diff = actualHours - scheduledHours;
                    if (diff >= 0) {
                        badgeClass = 'high'; // Met or exceeded scheduled
                    } else {
                        badgeClass = 'low'; // Under scheduled
                    }
                } else if (actualMinutes > 0) {
                    badgeClass = 'high';
                } else {
                    badgeClass = 'zero';
                }

                // Show scheduled hours if they have any
                const scheduledDisplay = scheduledHours > 0 ? `${scheduledHours.toFixed(1)}h` : '-';

                html += `
                    <div class="hours-employee-item" onclick="openEmployeeTimeCard('${emp.id}')" style="cursor: pointer;" title="Click to view time card">
                        ${emp.photo
                            ? `<div class="hours-employee-avatar" style="background-image: url('${emp.photo}'); background-size: cover; background-position: center;"></div>`
                            : `<div class="hours-employee-avatar" style="background: ${colors[colorIndex]};">${initials}</div>`
                        }
                        <div class="hours-employee-info">
                            <div class="hours-employee-name">${emp.name || 'Unknown'}</div>
                            <div class="hours-employee-store">${emp.store || 'No store'}</div>
                        </div>
                        <div class="hours-badges-container">
                            <div class="hours-badge ${badgeClass}" title="Actual worked hours">${actualDisplay}</div>
                            ${scheduledHours > 0 ? `<div class="hours-badge-scheduled" title="Scheduled hours">${scheduledDisplay}</div>` : ''}
                        </div>
                    </div>
                `;
            });

            panelList.innerHTML = html;

            // Format total actual hours
            const totalActualHoursInt = Math.floor(totalActualMinutes / 60);
            const totalActualMinsRemainder = Math.floor(totalActualMinutes % 60);
            const totalActualDisplay = totalActualMinutes > 0
                ? (totalActualHoursInt > 0 ? `${totalActualHoursInt}h ${totalActualMinsRemainder}m` : `${totalActualMinsRemainder}m`)
                : '0h';

            if (totalValueEl) {
                totalValueEl.innerHTML = `
                    <span title="Actual worked">${totalActualDisplay}</span>
                    ${totalScheduledHours > 0 ? `<span style="font-size: 12px; color: var(--text-muted); display: block;">/ ${totalScheduledHours.toFixed(1)}h sched</span>` : ''}
                `;
            }
        }

        // Expose function globally
        window.updateHoursSummaryPanel = updateHoursSummaryPanel;

        // ==========================================
        // EMPLOYEE TIME CARD VIEW
        // ==========================================
        async function openEmployeeTimeCard(employeeId) {
            // Only admins and managers can view time cards
            if (!canEditSchedule()) {
                showNotification('Only managers and admins can view time cards', 'error');
                return;
            }

            const emp = employees.find(e => e.id === employeeId);
            if (!emp) {
                showNotification('Employee not found', 'error');
                return;
            }

            const weekDates = getWeekDates(currentWeekStart);
            const weekRangeText = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            const today = formatDateKey(new Date());

            const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
            const colorIndex = emp.name ? emp.name.charCodeAt(0) % colors.length : 0;
            const initials = emp.name ? emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

            // Get scheduled hours for this employee
            const employeeSchedules = {};
            weekDates.forEach(date => {
                const dateKey = formatDateKey(date);
                const daySchedules = schedules.filter(s => s.date === dateKey && s.employeeId === employeeId);
                employeeSchedules[dateKey] = daySchedules;
            });

            // Get actual clock records for this employee
            const employeeClockRecords = {};
            try {
                if (typeof firebaseClockInManager !== 'undefined' && !firebaseClockInManager.isInitialized) {
                    await firebaseClockInManager.initialize();
                }

                for (const date of weekDates) {
                    const dateKey = formatDateKey(date);
                    try {
                        const records = await firebaseClockInManager.loadClockRecordsByDate(dateKey);
                        const empRecord = records.find(r => {
                            if (emp.firestoreId && emp.firestoreId === r.employeeId) return true;
                            if (emp.id && emp.id === r.employeeId) return true;
                            if (emp.name && r.employeeName &&
                                emp.name.toLowerCase().trim() === r.employeeName.toLowerCase().trim()) return true;
                            return false;
                        });
                        employeeClockRecords[dateKey] = empRecord || null;
                    } catch (err) {
                        employeeClockRecords[dateKey] = null;
                    }
                }
            } catch (err) {
                console.warn('Could not load clock records for time card:', err);
            }

            // Calculate totals
            let totalScheduledMinutes = 0;
            let totalActualMinutes = 0;

            // Build the time card rows
            let rowsHtml = '';
            weekDates.forEach(date => {
                const dateKey = formatDateKey(date);
                const isToday = dateKey === today;
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNumber = date.getDate();
                const daySchedules = employeeSchedules[dateKey] || [];
                const clockRecord = employeeClockRecords[dateKey];

                // Calculate scheduled time
                let scheduledStart = '-';
                let scheduledEnd = '-';
                let scheduledHours = 0;
                if (daySchedules.length > 0) {
                    // Combine all schedules for the day
                    const starts = daySchedules.map(s => s.startTime || SHIFT_TYPES[s.shiftType]?.defaultStart || '09:00');
                    const ends = daySchedules.map(s => s.endTime || SHIFT_TYPES[s.shiftType]?.defaultEnd || '17:00');
                    scheduledStart = formatTimeShort(starts[0]);
                    scheduledEnd = formatTimeShort(ends[ends.length - 1]);
                    daySchedules.forEach(s => {
                        const start = s.startTime || SHIFT_TYPES[s.shiftType]?.defaultStart || '09:00';
                        const end = s.endTime || SHIFT_TYPES[s.shiftType]?.defaultEnd || '17:00';
                        scheduledHours += calculateHours(start, end);
                    });
                    totalScheduledMinutes += scheduledHours * 60;
                }

                // Calculate actual time
                let actualClockIn = '-';
                let actualClockOut = '-';
                let actualLunch = '-';
                let actualHours = 0;
                let actualMinutes = 0;
                let inProgress = false;

                if (clockRecord) {
                    actualClockIn = clockRecord.clockIn || '-';
                    actualClockOut = clockRecord.clockOut || '-';
                    inProgress = clockRecord.clockIn && !clockRecord.clockOut;

                    if (clockRecord.lunchStart && clockRecord.lunchEnd) {
                        actualLunch = `${clockRecord.lunchStart} - ${clockRecord.lunchEnd}`;
                    } else if (clockRecord.lunchStart) {
                        actualLunch = `${clockRecord.lunchStart} - (in progress)`;
                    }

                    const workedTime = calculateWorkedTimeFromRecord(clockRecord);
                    actualHours = workedTime.hours;
                    actualMinutes = workedTime.minutes;
                    totalActualMinutes += workedTime.totalMinutes;
                }

                // Format actual hours display
                let actualDisplay = '-';
                if (inProgress) {
                    actualDisplay = '<span class="in-progress-badge"><i class="fas fa-clock"></i> Active</span>';
                } else if (actualHours > 0 || actualMinutes > 0) {
                    actualDisplay = actualHours > 0 ? `${actualHours}h ${actualMinutes}m` : `${actualMinutes}m`;
                }

                // Calculate variance
                let varianceDisplay = '-';
                let varianceClass = '';
                if (scheduledHours > 0 && (actualHours > 0 || actualMinutes > 0)) {
                    const actualTotalMins = actualHours * 60 + actualMinutes;
                    const scheduledTotalMins = scheduledHours * 60;
                    const diffMins = actualTotalMins - scheduledTotalMins;
                    const diffHours = Math.floor(Math.abs(diffMins) / 60);
                    const diffMinsRemainder = Math.abs(diffMins) % 60;

                    if (diffMins === 0) {
                        varianceDisplay = 'On time';
                        varianceClass = 'on-time';
                    } else if (diffMins > 0) {
                        varianceDisplay = `+${diffHours > 0 ? diffHours + 'h ' : ''}${diffMinsRemainder}m`;
                        varianceClass = 'over';
                    } else {
                        varianceDisplay = `-${diffHours > 0 ? diffHours + 'h ' : ''}${diffMinsRemainder}m`;
                        varianceClass = 'under';
                    }
                }

                // Get the clock record ID for editing
                const clockRecordId = clockRecord?.id || clockRecord?.firestoreId || null;

                rowsHtml += `
                    <tr class="${isToday ? 'today-row' : ''}">
                        <td class="day-cell">
                            <span class="day-name">${dayName}</span>
                            <span class="day-number">${dayNumber}</span>
                        </td>
                        <td class="time-cell scheduled">${scheduledStart !== '-' ? `${scheduledStart} - ${scheduledEnd}` : '-'}</td>
                        <td class="time-cell actual">${actualClockIn !== '-' ? `${actualClockIn} - ${actualClockOut}` : '-'}</td>
                        <td class="time-cell lunch">${actualLunch}</td>
                        <td class="hours-cell scheduled">${scheduledHours > 0 ? scheduledHours.toFixed(1) + 'h' : '-'}</td>
                        <td class="hours-cell actual">${actualDisplay}</td>
                        <td class="variance-cell ${varianceClass}">${varianceDisplay}</td>
                        <td class="action-cell">
                            ${clockRecordId ? `
                                <button class="time-card-edit-btn" onclick="event.stopPropagation(); closeTimeCard(); openEditClockRecordModal('${clockRecordId}')" title="Edit attendance">
                                    <i class="fas fa-edit"></i>
                                </button>
                            ` : '-'}
                        </td>
                    </tr>
                `;
            });

            // Calculate total hours
            const totalScheduledHours = totalScheduledMinutes / 60;
            const totalActualHours = Math.floor(totalActualMinutes / 60);
            const totalActualMinsRemainder = Math.floor(totalActualMinutes % 60);
            const totalActualDisplay = totalActualMinutes > 0
                ? (totalActualHours > 0 ? `${totalActualHours}h ${totalActualMinsRemainder}m` : `${totalActualMinsRemainder}m`)
                : '-';

            // Calculate total variance
            let totalVarianceDisplay = '-';
            let totalVarianceClass = '';
            if (totalScheduledMinutes > 0 && totalActualMinutes > 0) {
                const diffMins = totalActualMinutes - totalScheduledMinutes;
                const diffHours = Math.floor(Math.abs(diffMins) / 60);
                const diffMinsRemainder = Math.floor(Math.abs(diffMins) % 60);

                if (Math.abs(diffMins) < 5) {
                    totalVarianceDisplay = 'On time';
                    totalVarianceClass = 'on-time';
                } else if (diffMins > 0) {
                    totalVarianceDisplay = `+${diffHours > 0 ? diffHours + 'h ' : ''}${diffMinsRemainder}m`;
                    totalVarianceClass = 'over';
                } else {
                    totalVarianceDisplay = `-${diffHours > 0 ? diffHours + 'h ' : ''}${diffMinsRemainder}m`;
                    totalVarianceClass = 'under';
                }
            }

            // Create the modal HTML
            const modalHtml = `
                <style>
                    .time-card-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.6);
                        backdrop-filter: blur(8px);
                        z-index: 1002;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        animation: fadeIn 0.3s ease;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .time-card-modal {
                        background: var(--bg-card);
                        border-radius: 20px;
                        width: 95%;
                        max-width: 900px;
                        max-height: 90vh;
                        overflow: hidden;
                        box-shadow: 0 25px 80px rgba(0,0,0,0.4);
                        animation: slideUp 0.3s ease;
                    }
                    @keyframes slideUp {
                        from { transform: translateY(20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    .time-card-header {
                        padding: 20px 24px;
                        background: linear-gradient(135deg, #10b981, #059669);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .time-card-employee {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                    }
                    .time-card-avatar {
                        width: 56px;
                        height: 56px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 20px;
                        font-weight: 700;
                        color: white;
                        border: 3px solid rgba(255,255,255,0.3);
                    }
                    .time-card-employee-info h3 {
                        color: white;
                        font-size: 20px;
                        font-weight: 700;
                        margin: 0 0 4px 0;
                    }
                    .time-card-employee-info p {
                        color: rgba(255,255,255,0.8);
                        font-size: 14px;
                        margin: 0;
                    }
                    .time-card-close {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: rgba(255,255,255,0.2);
                        border: none;
                        cursor: pointer;
                        color: white;
                        font-size: 18px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    }
                    .time-card-close:hover {
                        background: rgba(255,255,255,0.3);
                        transform: rotate(90deg);
                    }
                    .time-card-body {
                        padding: 20px;
                        overflow-y: auto;
                        max-height: calc(90vh - 200px);
                    }
                    .time-card-table-wrapper {
                        overflow-x: auto;
                    }
                    .time-card-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 14px;
                    }
                    .time-card-table th {
                        padding: 12px 10px;
                        text-align: center;
                        background: var(--bg-secondary);
                        font-weight: 600;
                        color: var(--text-secondary);
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        border-bottom: 2px solid var(--border-color);
                    }
                    .time-card-table td {
                        padding: 12px 10px;
                        text-align: center;
                        border-bottom: 1px solid var(--border-color);
                    }
                    .time-card-table tr.today-row {
                        background: rgba(16, 185, 129, 0.08);
                    }
                    .time-card-table tr.today-row td {
                        border-color: rgba(16, 185, 129, 0.2);
                    }
                    .time-card-table .day-cell {
                        text-align: left;
                        padding-left: 16px;
                    }
                    .time-card-table .day-cell .day-name {
                        font-weight: 600;
                        color: var(--text-primary);
                        display: block;
                    }
                    .time-card-table .day-cell .day-number {
                        font-size: 12px;
                        color: var(--text-muted);
                    }
                    .time-card-table .time-cell {
                        font-size: 13px;
                        color: var(--text-secondary);
                    }
                    .time-card-table .time-cell.scheduled {
                        color: var(--text-muted);
                    }
                    .time-card-table .time-cell.actual {
                        color: var(--text-primary);
                        font-weight: 500;
                    }
                    .time-card-table .hours-cell {
                        font-weight: 600;
                    }
                    .time-card-table .hours-cell.scheduled {
                        color: var(--text-muted);
                    }
                    .time-card-table .hours-cell.actual {
                        color: #10b981;
                    }
                    .time-card-table .variance-cell {
                        font-weight: 600;
                        font-size: 13px;
                    }
                    .time-card-table .variance-cell.on-time {
                        color: #10b981;
                    }
                    .time-card-table .variance-cell.over {
                        color: #3b82f6;
                    }
                    .time-card-table .variance-cell.under {
                        color: #f59e0b;
                    }
                    .time-card-table .action-cell {
                        width: 50px;
                    }
                    .time-card-edit-btn {
                        width: 32px;
                        height: 32px;
                        border-radius: 8px;
                        border: none;
                        background: linear-gradient(135deg, #3b82f6, #6366f1);
                        color: white;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s ease;
                    }
                    .time-card-edit-btn:hover {
                        transform: scale(1.1);
                        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
                    }
                    .time-card-table tfoot td {
                        padding-top: 16px;
                        font-weight: 700;
                        background: var(--bg-secondary);
                        border-top: 2px solid var(--border-color);
                    }
                    .in-progress-badge {
                        background: rgba(245, 158, 11, 0.15);
                        color: #f59e0b;
                        padding: 4px 8px;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 600;
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                        animation: pulse-active 2s infinite;
                    }
                    @media (max-width: 768px) {
                        .time-card-modal {
                            width: 100%;
                            max-width: none;
                            height: 100%;
                            max-height: 100%;
                            border-radius: 0;
                        }
                        .time-card-body {
                            max-height: calc(100vh - 120px);
                        }
                        .time-card-table {
                            font-size: 12px;
                        }
                        .time-card-table th,
                        .time-card-table td {
                            padding: 8px 6px;
                        }
                        .time-card-employee-info h3 {
                            font-size: 16px;
                        }
                        .time-card-avatar {
                            width: 44px;
                            height: 44px;
                            font-size: 16px;
                        }
                    }
                </style>
                <div class="time-card-overlay" id="timeCardOverlay" onclick="closeTimeCard(event)">
                    <div class="time-card-modal" onclick="event.stopPropagation()">
                        <div class="time-card-header">
                            <div class="time-card-employee">
                                ${emp.photo
                                    ? `<div class="time-card-avatar" style="background-image: url('${emp.photo}'); background-size: cover; background-position: center;"></div>`
                                    : `<div class="time-card-avatar" style="background: ${colors[colorIndex]};">${initials}</div>`
                                }
                                <div class="time-card-employee-info">
                                    <h3><i class="fas fa-id-card" style="margin-right: 8px;"></i>${emp.name || 'Unknown'}</h3>
                                    <p>${emp.store || 'No Store'} &bull; ${weekRangeText}</p>
                                </div>
                            </div>
                            <button class="time-card-close" onclick="closeTimeCard()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="time-card-body">
                            <div class="time-card-table-wrapper">
                                <table class="time-card-table">
                                    <thead>
                                        <tr>
                                            <th style="text-align: left; padding-left: 16px;">Day</th>
                                            <th>Scheduled</th>
                                            <th>Actual</th>
                                            <th>Lunch</th>
                                            <th>Sched Hrs</th>
                                            <th>Actual Hrs</th>
                                            <th>Variance</th>
                                            <th>Edit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${rowsHtml}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td style="text-align: left; padding-left: 16px;"><strong>TOTAL</strong></td>
                                            <td>-</td>
                                            <td>-</td>
                                            <td>-</td>
                                            <td class="hours-cell scheduled">${totalScheduledHours > 0 ? totalScheduledHours.toFixed(1) + 'h' : '-'}</td>
                                            <td class="hours-cell actual">${totalActualDisplay}</td>
                                            <td class="variance-cell ${totalVarianceClass}">${totalVarianceDisplay}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Append modal to body
            const modalContainer = document.createElement('div');
            modalContainer.id = 'timeCardModalContainer';
            modalContainer.innerHTML = modalHtml;
            document.body.appendChild(modalContainer);
        }

        function closeTimeCard(event) {
            if (event && event.target !== event.currentTarget) return;
            const container = document.getElementById('timeCardModalContainer');
            if (container) {
                container.remove();
            }
        }

        // Expose functions globally
        window.openEmployeeTimeCard = openEmployeeTimeCard;
        window.closeTimeCard = closeTimeCard;

        // Time editor modal functions
        let currentTimeEditorContext = null;

        function timeToPercent(time) {
            if (!time) return 0;
            const [hours, minutes] = time.split(':').map(Number);
            let totalMinutes = hours * 60 + minutes;
            // Handle midnight (00:00) as end of day
            if (totalMinutes < 360) totalMinutes += 1440;
            // Range: 6am (360) to 12am (1440) = 1080 minutes
            const minMinutes = 360; // 6am
            const maxMinutes = 1440; // 12am (midnight)
            return Math.max(0, Math.min(100, ((totalMinutes - minMinutes) / (maxMinutes - minMinutes)) * 100));
        }

        function percentToTime(percent) {
            const minMinutes = 360; // 6am
            const maxMinutes = 1440; // 12am
            const totalMinutes = Math.round((percent / 100) * (maxMinutes - minMinutes) + minMinutes);
            // Round to nearest 15 minutes
            const roundedMinutes = Math.round(totalMinutes / 15) * 15;
            const hours = Math.floor(roundedMinutes / 60) % 24;
            const minutes = roundedMinutes % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        function openTimeEditor(scheduleId) {
            // Only admins and managers can edit schedules
            if (!canEditSchedule()) {
                showNotification('Only managers and admins can edit schedules', 'error');
                return;
            }

            const schedule = schedules.find(s => s.id === scheduleId);
            if (!schedule) return;

            const emp = employees.find(e => e.id === schedule.employeeId);
            const shiftConfig = SHIFT_TYPES[schedule.shiftType] || SHIFT_TYPES.opening;
            const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
            const colorIndex = emp?.name ? emp.name.charCodeAt(0) % colors.length : 0;
            const initials = emp?.name ? emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

            currentTimeEditorContext = {
                scheduleId,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                shiftType: schedule.shiftType,
                date: schedule.date,
                store: schedule.store
            };

            // Update modal content
            const titleEl = document.getElementById('timeEditorTitle');
            const infoEl = document.getElementById('timeEditorInfo');
            const currentValueEl = document.getElementById('timeEditorCurrentValue');
            const currentHoursEl = document.getElementById('timeEditorCurrentHours');
            const rangeEl = document.getElementById('timeEditorRange');

            if (titleEl) {
                const icon = shiftConfig.icon;
                titleEl.innerHTML = `<i class="fas ${icon}" style="color: ${shiftConfig.color};"></i> Edit ${shiftConfig.name} Shift`;
            }

            if (infoEl) {
                const dateObj = new Date(schedule.date + 'T12:00:00');
                const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                infoEl.innerHTML = `
                    ${emp?.photo
                        ? `<div class="time-editor-avatar" style="background-image: url('${emp.photo}'); background-size: cover; background-position: center;"></div>`
                        : `<div class="time-editor-avatar" style="background: ${colors[colorIndex]};">${initials}</div>`
                    }
                    <div class="time-editor-details">
                        <h4>${emp?.name || 'Unknown'}</h4>
                        <p>${dateStr} &bull; ${schedule.store || ''}</p>
                    </div>
                `;
            }

            // Set initial values
            updateTimeEditorDisplay();

            // Set slider position
            if (rangeEl) {
                rangeEl.className = `time-editor-slider-range ${schedule.shiftType}`;
                updateTimeEditorSlider();
            }

            // Setup slider drag handlers
            setupTimeEditorSlider();

            // Show modal
            document.getElementById('timeEditorOverlay').classList.add('active');
        }

        function closeTimeEditor(event) {
            if (event && event.target !== event.currentTarget) return;
            document.getElementById('timeEditorOverlay').classList.remove('active');
            currentTimeEditorContext = null;
        }

        function updateTimeEditorDisplay() {
            if (!currentTimeEditorContext) return;

            const { startTime, endTime } = currentTimeEditorContext;
            const currentValueEl = document.getElementById('timeEditorCurrentValue');
            const currentHoursEl = document.getElementById('timeEditorCurrentHours');

            if (currentValueEl) {
                currentValueEl.textContent = `${formatTimeShort(startTime)} - ${formatTimeShort(endTime)}`;
            }

            if (currentHoursEl) {
                const hours = calculateHours(startTime, endTime);
                currentHoursEl.textContent = `${hours} hours`;
            }
        }

        function updateTimeEditorSlider() {
            if (!currentTimeEditorContext) return;

            const { startTime, endTime } = currentTimeEditorContext;
            const rangeEl = document.getElementById('timeEditorRange');

            if (rangeEl) {
                const startPercent = timeToPercent(startTime);
                const endPercent = timeToPercent(endTime);
                rangeEl.style.left = `${startPercent}%`;
                rangeEl.style.right = `${100 - endPercent}%`;
            }
        }

        function setupTimeEditorSlider() {
            const track = document.getElementById('timeEditorTrack');
            const range = document.getElementById('timeEditorRange');
            const handleStart = document.getElementById('timeEditorHandleStart');
            const handleEnd = document.getElementById('timeEditorHandleEnd');

            if (!track || !range) return;

            function startDrag(handleType) {
                return function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    const trackRect = track.getBoundingClientRect();

                    function onMouseMove(e) {
                        if (!currentTimeEditorContext) return;

                        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                        const x = Math.max(0, Math.min(clientX - trackRect.left, trackRect.width));
                        const percent = (x / trackRect.width) * 100;

                        let startPercent = timeToPercent(currentTimeEditorContext.startTime);
                        let endPercent = timeToPercent(currentTimeEditorContext.endTime);

                        if (handleType === 'start') {
                            startPercent = Math.min(percent, endPercent - 5);
                            currentTimeEditorContext.startTime = percentToTime(startPercent);
                        } else {
                            endPercent = Math.max(percent, startPercent + 5);
                            currentTimeEditorContext.endTime = percentToTime(endPercent);
                        }

                        updateTimeEditorDisplay();
                        updateTimeEditorSlider();
                    }

                    function onMouseUp() {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                        document.removeEventListener('touchmove', onMouseMove);
                        document.removeEventListener('touchend', onMouseUp);
                    }

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                    document.addEventListener('touchmove', onMouseMove);
                    document.addEventListener('touchend', onMouseUp);
                };
            }

            // Remove old listeners by cloning
            const newHandleStart = handleStart.cloneNode(true);
            const newHandleEnd = handleEnd.cloneNode(true);
            handleStart.parentNode.replaceChild(newHandleStart, handleStart);
            handleEnd.parentNode.replaceChild(newHandleEnd, handleEnd);

            newHandleStart.addEventListener('mousedown', startDrag('start'));
            newHandleStart.addEventListener('touchstart', startDrag('start'));
            newHandleEnd.addEventListener('mousedown', startDrag('end'));
            newHandleEnd.addEventListener('touchstart', startDrag('end'));
        }

        function setTimeEditorPreset(startTime, endTime) {
            if (!currentTimeEditorContext) return;

            currentTimeEditorContext.startTime = startTime;
            currentTimeEditorContext.endTime = endTime;

            updateTimeEditorDisplay();
            updateTimeEditorSlider();

            // Highlight active preset
            document.querySelectorAll('.time-editor-preset').forEach(p => p.classList.remove('active'));
            event.currentTarget.classList.add('active');
        }

        async function saveTimeEditor() {
            if (!currentTimeEditorContext) return;

            const { scheduleId, startTime, endTime } = currentTimeEditorContext;

            try {
                const db = firebase.firestore();
                await db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules').doc(scheduleId).update({
                    startTime,
                    endTime,
                    updatedAt: new Date().toISOString()
                });

                // Update local data
                const schedule = schedules.find(s => s.id === scheduleId);
                if (schedule) {
                    schedule.startTime = startTime;
                    schedule.endTime = endTime;
                }

                showNotification('Schedule updated!', 'success');
                closeTimeEditor();
                renderScheduleGrid();
            } catch (error) {
                console.error('Error updating schedule:', error);
                showNotification('Error updating schedule', 'error');
            }
        }

        async function deleteFromTimeEditor() {
            if (!currentTimeEditorContext) return;

            if (!confirm('Remove this employee from the shift?')) return;

            const { scheduleId } = currentTimeEditorContext;

            try {
                const db = firebase.firestore();
                await db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules').doc(scheduleId).delete();

                schedules = schedules.filter(s => s.id !== scheduleId);
                showNotification('Shift removed', 'success');
                closeTimeEditor();
                renderScheduleGrid();
            } catch (error) {
                console.error('Error removing schedule:', error);
                showNotification('Error removing shift', 'error');
            }
        }

        // Add another employee to the same shift from the time editor
        function addAnotherEmployeeFromEditor() {
            if (!currentTimeEditorContext) return;

            const { date, shiftType, store } = currentTimeEditorContext;

            // Close the time editor
            closeTimeEditor();

            // Open employee picker for the same shift slot
            openEmployeePicker(date, shiftType, store || 'all');
        }

        // Expose to window for onclick handlers
        window.addAnotherEmployeeFromEditor = addAnotherEmployeeFromEditor;

        // All Employees View - Shows all employees with their weekly schedules
        function renderAllEmployeesView(container, weekDates, today) {
            // Get active employees sorted by name
            const activeEmployees = employees
                .filter(e => !e.status || e.status === 'active')
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            if (activeEmployees.length === 0) {
                container.innerHTML = `
                    <div style="padding: 60px; text-align: center;">
                        <i class="fas fa-users" style="font-size: 48px; color: var(--text-muted); margin-bottom: 20px;"></i>
                        <h3 style="color: var(--text-secondary); margin-bottom: 10px;">No Employees</h3>
                        <p style="color: var(--text-muted);">No active employees found.</p>
                    </div>
                `;
                return;
            }

            const weekKeys = weekDates.map(d => formatDateKey(d));

            let html = `
                <div class="all-employees-grid">
                    ${activeEmployees.map(employee => {
                        const empId = employee.id;
                        const employeeSchedules = schedules.filter(s =>
                            weekKeys.includes(s.date) && (s.employeeId === empId || s.employeeId === employee.firestoreId)
                        );
                        const employeeDaysOff = daysOff.filter(d =>
                            weekKeys.includes(d.date) && (d.employeeId === empId || d.employeeId === employee.firestoreId)
                        );

                        // Calculate total hours
                        let totalWeekHours = 0;
                        employeeSchedules.forEach(schedule => {
                            const hours = parseFloat(calculateHours(schedule.startTime, schedule.endTime)) || 0;
                            totalWeekHours += hours;
                        });
                        const totalHrs = Math.floor(totalWeekHours);
                        const totalMins = Math.round((totalWeekHours - totalHrs) * 60);

                        return `
                            <div class="employee-week-card" onclick="document.getElementById('schedule-employee-filter').value='emp_${employee.id}'; renderScheduleGrid();">
                                <div class="emp-card-header">
                                    <div class="emp-card-avatar" style="background: ${employee.color || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'}">
                                        ${employee.initials || employee.name?.substring(0, 2).toUpperCase() || '?'}
                                    </div>
                                    <div class="emp-card-info">
                                        <h4>${employee.name || 'Unknown'}</h4>
                                        <span class="emp-card-role">${employee.role || 'Employee'}</span>
                                    </div>
                                    <div class="emp-card-hours">
                                        <span class="hours-value">${totalHrs}h ${totalMins}m</span>
                                        <span class="hours-label">this week</span>
                                    </div>
                                </div>
                                <div class="emp-card-week">
                                    ${weekDates.map(date => {
                                        const dateKey = formatDateKey(date);
                                        const isToday = dateKey === today;
                                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                                        const daySchedules = employeeSchedules.filter(s => s.date === dateKey);
                                        const isDayOff = employeeDaysOff.some(d => d.date === dateKey);

                                        let dayContent = '';
                                        let dayClass = '';

                                        if (isDayOff) {
                                            dayContent = '<i class="fas fa-umbrella-beach" style="color: #ef4444;"></i>';
                                            dayClass = 'day-off';
                                        } else if (daySchedules.length === 0) {
                                            dayContent = '<span style="color: var(--text-muted);">-</span>';
                                            dayClass = 'no-shift';
                                        } else {
                                            dayContent = daySchedules.map(s => {
                                                const icon = s.shiftType === 'opening' ? 'fa-sun' : 'fa-moon';
                                                const color = s.shiftType === 'opening' ? '#f59e0b' : '#6366f1';
                                                return `<i class="fas ${icon}" style="color: ${color}; font-size: 12px;" title="${s.store}: ${formatTimeShort(s.startTime)}-${formatTimeShort(s.endTime)}"></i>`;
                                            }).join(' ');
                                            dayClass = 'has-shift';
                                        }

                                        return `
                                            <div class="emp-day ${dayClass} ${isToday ? 'today' : ''}">
                                                <span class="emp-day-name">${dayName}</span>
                                                <div class="emp-day-indicator">${dayContent}</div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <style>
                    .all-employees-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                        gap: 16px;
                    }
                    .employee-week-card {
                        background: var(--bg-card);
                        border-radius: 12px;
                        border: 1px solid var(--border-color);
                        padding: 16px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    .employee-week-card:hover {
                        border-color: var(--accent-primary);
                        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
                        transform: translateY(-2px);
                    }
                    .emp-card-header {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        margin-bottom: 16px;
                    }
                    .emp-card-avatar {
                        width: 44px;
                        height: 44px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        font-weight: 700;
                        color: white;
                        flex-shrink: 0;
                    }
                    .emp-card-info {
                        flex: 1;
                        min-width: 0;
                    }
                    .emp-card-info h4 {
                        font-size: 15px;
                        font-weight: 600;
                        margin: 0 0 2px 0;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .emp-card-role {
                        font-size: 12px;
                        color: var(--text-muted);
                    }
                    .emp-card-hours {
                        text-align: right;
                    }
                    .hours-value {
                        display: block;
                        font-size: 16px;
                        font-weight: 700;
                        color: var(--accent-primary);
                    }
                    .hours-label {
                        font-size: 11px;
                        color: var(--text-muted);
                    }
                    .emp-card-week {
                        display: flex;
                        gap: 4px;
                    }
                    .emp-day {
                        flex: 1;
                        text-align: center;
                        padding: 8px 4px;
                        background: var(--bg-main);
                        border-radius: 8px;
                    }
                    .emp-day.today {
                        background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%);
                        border: 1px solid var(--accent-primary);
                    }
                    .emp-day.day-off {
                        background: rgba(239, 68, 68, 0.1);
                    }
                    .emp-day-name {
                        display: block;
                        font-size: 10px;
                        font-weight: 600;
                        color: var(--text-muted);
                        margin-bottom: 4px;
                        text-transform: uppercase;
                    }
                    .emp-day-indicator {
                        min-height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 4px;
                    }
                    @media (max-width: 768px) {
                        .all-employees-grid {
                            grid-template-columns: 1fr;
                        }
                    }
                </style>
            `;

            container.innerHTML = html;

            // Update hours summary panel
            updateHoursSummaryPanel();
        }

        // Individual Employee Schedule View
        function renderEmployeeScheduleView(container, weekDates, today, employeeId) {
            const employee = employees.find(e => e.id === employeeId || e.firestoreId === employeeId || String(e.id) === String(employeeId));

            if (!employee) {
                container.innerHTML = `
                    <div style="padding: 60px; text-align: center;">
                        <i class="fas fa-user-slash" style="font-size: 48px; color: var(--text-muted); margin-bottom: 20px;"></i>
                        <h3 style="color: var(--text-secondary); margin-bottom: 10px;">Employee Not Found</h3>
                        <p style="color: var(--text-muted);">Unable to find the selected employee.</p>
                    </div>
                `;
                return;
            }

            // Get employee's schedules for the week (from all stores)
            // Use the found employee's actual ID for matching
            const empId = employee.id;
            const weekKeys = weekDates.map(d => formatDateKey(d));
            const employeeSchedules = schedules.filter(s =>
                weekKeys.includes(s.date) && (s.employeeId === empId || s.employeeId === employee.firestoreId)
            );

            // Get employee's days off for the week
            const employeeDaysOff = daysOff.filter(d =>
                weekKeys.includes(d.date) && (d.employeeId === empId || d.employeeId === employee.firestoreId)
            );

            // Calculate total hours
            let totalWeekHours = 0;
            employeeSchedules.forEach(schedule => {
                const hours = parseFloat(calculateHours(schedule.startTime, schedule.endTime)) || 0;
                totalWeekHours += hours;
            });
            const totalHours = Math.floor(totalWeekHours);
            const totalMins = Math.round((totalWeekHours - totalHours) * 60);

            let html = `
                <div class="employee-schedule-view">
                    <div class="employee-schedule-header-card">
                        <div class="employee-header-info">
                            <div class="employee-header-avatar" style="background: ${employee.color || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'}">${employee.initials || employee.name?.substring(0, 2).toUpperCase() || '?'}</div>
                            <div class="employee-header-details">
                                <h3>${employee.name || 'Unknown'}</h3>
                                <p><i class="fas fa-briefcase"></i> ${employee.role || 'Employee'}</p>
                                <p><i class="fas fa-store"></i> ${employee.store || 'Not assigned'}</p>
                            </div>
                        </div>
                        <div class="employee-header-stats">
                            <div class="stat-box">
                                <span class="stat-value">${employeeSchedules.length}</span>
                                <span class="stat-label">Shifts</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-value">${totalHours}h ${totalMins}m</span>
                                <span class="stat-label">Total Hours</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-value">${employeeDaysOff.length}</span>
                                <span class="stat-label">Days Off</span>
                            </div>
                        </div>
                    </div>

                    <div class="employee-week-grid">
            `;

            weekDates.forEach(date => {
                const dateKey = formatDateKey(date);
                const isToday = dateKey === today;
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNumber = date.getDate();
                const monthName = date.toLocaleDateString('en-US', { month: 'short' });

                // Find schedules for this day
                const daySchedules = employeeSchedules.filter(s => s.date === dateKey);

                // Check if day off
                const isDayOff = employeeDaysOff.some(d => d.date === dateKey);

                html += `
                    <div class="employee-day-card ${isToday ? 'today' : ''} ${isDayOff ? 'day-off' : ''}">
                        <div class="employee-day-header">
                            <span class="day-name">${dayName}</span>
                            <span class="day-date">${monthName} ${dayNumber}</span>
                        </div>
                        <div class="employee-day-content">
                `;

                if (isDayOff) {
                    html += `
                        <div class="day-off-badge">
                            <i class="fas fa-umbrella-beach"></i>
                            <span>Day Off</span>
                        </div>
                    `;
                } else if (daySchedules.length === 0) {
                    html += `
                        <div class="no-shift">
                            <i class="fas fa-minus"></i>
                            <span>No shift</span>
                        </div>
                    `;
                } else {
                    daySchedules.forEach(schedule => {
                        const shiftConfig = SHIFT_TYPES[schedule.shiftType] || SHIFT_TYPES.opening;
                        const hoursDecimal = parseFloat(calculateHours(schedule.startTime, schedule.endTime)) || 0;
                        const hoursInt = Math.floor(hoursDecimal);
                        const minsInt = Math.round((hoursDecimal - hoursInt) * 60);

                        html += `
                            <div class="employee-shift-card ${schedule.shiftType}" onclick="openTimeEditor('${schedule.id}')" style="cursor: pointer;" title="Click to edit">
                                <div class="shift-type-badge" style="background: ${shiftConfig.gradient}">
                                    <i class="fas ${shiftConfig.icon}"></i>
                                    ${shiftConfig.name}
                                </div>
                                <div class="shift-store">
                                    <i class="fas fa-store"></i>
                                    ${schedule.store || 'Unknown'}
                                </div>
                                <div class="shift-time">
                                    <i class="fas fa-clock"></i>
                                    ${formatTimeShort(schedule.startTime)} - ${formatTimeShort(schedule.endTime)}
                                </div>
                                <div class="shift-hours">
                                    ${hoursInt}h ${minsInt}m
                                </div>
                                <div class="shift-edit-hint">
                                    <i class="fas fa-pencil-alt"></i>
                                </div>
                            </div>
                        `;
                    });
                }

                html += `
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>

                <style>
                    .employee-schedule-view {
                        padding: 0;
                    }
                    .employee-schedule-header-card {
                        background: var(--bg-card);
                        border-radius: 16px;
                        padding: 24px;
                        margin-bottom: 24px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 20px;
                        border: 1px solid var(--border-color);
                    }
                    .employee-header-info {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                    }
                    .employee-header-avatar {
                        width: 64px;
                        height: 64px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        font-weight: 700;
                        color: white;
                    }
                    .employee-header-details h3 {
                        font-size: 20px;
                        font-weight: 700;
                        margin-bottom: 8px;
                    }
                    .employee-header-details p {
                        color: var(--text-muted);
                        font-size: 14px;
                        margin-bottom: 4px;
                    }
                    .employee-header-details p i {
                        width: 16px;
                        margin-right: 8px;
                        color: var(--accent-primary);
                    }
                    .employee-header-stats {
                        display: flex;
                        gap: 24px;
                    }
                    .stat-box {
                        text-align: center;
                        padding: 12px 20px;
                        background: var(--bg-main);
                        border-radius: 12px;
                        min-width: 80px;
                    }
                    .stat-value {
                        display: block;
                        font-size: 24px;
                        font-weight: 700;
                        color: var(--accent-primary);
                    }
                    .stat-label {
                        display: block;
                        font-size: 12px;
                        color: var(--text-muted);
                        margin-top: 4px;
                    }
                    .employee-week-grid {
                        display: grid;
                        grid-template-columns: repeat(7, 1fr);
                        gap: 12px;
                    }
                    @media (max-width: 1200px) {
                        .employee-week-grid {
                            grid-template-columns: repeat(4, 1fr);
                        }
                    }
                    @media (max-width: 768px) {
                        .employee-week-grid {
                            grid-template-columns: repeat(2, 1fr);
                        }
                        .employee-schedule-header-card {
                            flex-direction: column;
                            text-align: center;
                        }
                        .employee-header-info {
                            flex-direction: column;
                        }
                        .employee-header-stats {
                            flex-wrap: wrap;
                            justify-content: center;
                        }
                    }
                    .employee-day-card {
                        background: var(--bg-card);
                        border-radius: 12px;
                        border: 1px solid var(--border-color);
                        overflow: hidden;
                        min-height: 180px;
                    }
                    .employee-day-card.today {
                        border-color: var(--accent-primary);
                        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
                    }
                    .employee-day-card.day-off {
                        background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.1) 100%);
                    }
                    .employee-day-header {
                        padding: 12px 16px;
                        background: var(--bg-main);
                        border-bottom: 1px solid var(--border-color);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .employee-day-card.today .employee-day-header {
                        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
                    }
                    .day-name {
                        font-weight: 600;
                        font-size: 14px;
                    }
                    .day-date {
                        font-size: 12px;
                        color: var(--text-muted);
                    }
                    .employee-day-content {
                        padding: 12px;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }
                    .day-off-badge {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        padding: 20px;
                        color: #ef4444;
                        font-weight: 600;
                    }
                    .day-off-badge i {
                        font-size: 20px;
                    }
                    .no-shift {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        padding: 20px;
                        color: var(--text-muted);
                        font-size: 14px;
                    }
                    .employee-shift-card {
                        background: var(--bg-main);
                        border-radius: 8px;
                        padding: 12px;
                        border-left: 3px solid var(--accent-primary);
                        position: relative;
                        transition: all 0.2s ease;
                    }
                    .employee-shift-card:hover {
                        background: var(--bg-card);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                        transform: translateY(-2px);
                    }
                    .employee-shift-card:hover .shift-edit-hint {
                        opacity: 1;
                    }
                    .shift-edit-hint {
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        opacity: 0;
                        color: var(--accent-primary);
                        font-size: 12px;
                        transition: opacity 0.2s ease;
                    }
                    .employee-shift-card.opening {
                        border-left-color: #f59e0b;
                    }
                    .employee-shift-card.closing {
                        border-left-color: #6366f1;
                    }
                    .shift-type-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 4px 10px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: 600;
                        color: white;
                        margin-bottom: 8px;
                    }
                    .shift-store, .shift-time {
                        font-size: 13px;
                        color: var(--text-secondary);
                        margin-bottom: 4px;
                    }
                    .shift-store i, .shift-time i {
                        width: 14px;
                        margin-right: 6px;
                        color: var(--text-muted);
                    }
                    .shift-hours {
                        font-size: 12px;
                        font-weight: 600;
                        color: var(--accent-primary);
                        text-align: right;
                        margin-top: 6px;
                    }
                </style>
            `;

            container.innerHTML = html;

            // Update hours summary panel
            updateHoursSummaryPanel();
        }

        // All Stores View
        function renderAllStoresView(container, weekDates, today) {
            const stores = ['Miramar', 'Morena', 'Kearny Mesa', 'Chula Vista', 'North Park', 'Miramar Wine & Liquor'];

            let html = '<div class="stores-grid">';

            stores.forEach(store => {
                html += `
                    <div class="store-schedule-card">
                        <div class="store-schedule-header">
                            <h4>
                                <div class="store-icon"><i class="fas fa-store"></i></div>
                                ${store}
                            </h4>
                        </div>
                        <div class="store-schedule-body">
                `;

                weekDates.forEach(date => {
                    const dateKey = formatDateKey(date);
                    const isToday = dateKey === today;
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNumber = date.getDate();
                    const ordinalDay = getOrdinal(dayNumber);

                    html += `
                        <div class="store-day-row">
                            <div class="store-day-label ${isToday ? 'today' : ''}">${dayName} (${ordinalDay})</div>
                            <div class="store-shifts">
                    `;

                    ['opening', 'closing'].forEach(shiftType => {
                        // Get ALL schedules for this slot (supports multiple employees)
                        const slotSchedules = schedules.filter(s =>
                            s.date === dateKey &&
                            s.shiftType === shiftType &&
                            s.store === store
                        );

                        if (slotSchedules.length > 0) {
                            const isMultiple = slotSchedules.length > 1;
                            const multiClass = isMultiple ? 'multi-employee' : '';

                            html += `<div class="store-shift-slot ${shiftType} filled ${multiClass}">`;

                            // Render each employee in this slot
                            slotSchedules.forEach((schedule, idx) => {
                                const emp = employees.find(e => e.id === schedule.employeeId);
                                const empName = emp?.name || schedule.employeeName || schedule.employee || 'Unknown';
                                const firstName = (empName && empName.trim()) ? empName.split(' ')[0] : 'Unknown';
                                const colors = ['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
                                const colorIndex = empName.charCodeAt(0) % colors.length;

                                html += `
                                    <div class="store-shift-employee ${idx > 0 ? 'additional' : ''}"
                                         onclick="openTimeEditor('${schedule.id}')"
                                         style="${isMultiple ? 'border-left: 3px solid ' + colors[colorIndex] + ';' : ''}">
                                        <div class="store-shift-name">${firstName}</div>
                                        <div class="store-shift-time">${formatTimeShort(schedule.startTime)}-${formatTimeShort(schedule.endTime)}</div>
                                        <button class="store-shift-clone" onclick="event.stopPropagation(); cloneShift('${schedule.id}')" title="Clone shift">
                                            <i class="fas fa-clone"></i>
                                        </button>
                                        <button class="store-shift-delete" onclick="event.stopPropagation(); deleteSchedule('${schedule.id}')" title="Remove ${firstName}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                `;
                            });

                            html += `</div>`;
                        } else {
                            html += `
                                <div class="store-shift-slot empty"
                                     data-date="${dateKey}"
                                     data-shift-type="${shiftType}"
                                     data-store="${store}"
                                     ondragover="handleStoreSlotDragOver(event)"
                                     ondragleave="handleStoreSlotDragLeave(event)"
                                     ondrop="handleStoreSlotDrop(event, '${dateKey}', '${shiftType}', '${store}')"
                                     onclick="openEmployeePicker('${dateKey}', '${shiftType}', '${store}')">
                                    <i class="fas fa-plus" style="font-size: 10px;"></i>
                                </div>
                            `;
                        }
                    });

                    html += `
                            </div>
                        </div>
                    `;
                });

                // Days Off section for All Stores view
                html += `
                    <div class="store-days-off-section">
                        <div class="store-days-off-header clickable" onclick="openStoreDayOffPicker('${store}')">
                            <i class="fas fa-umbrella-beach" style="color: var(--accent-primary); font-size: 14px;"></i>
                            <span style="font-weight: 600; font-size: 13px;">Days Off This Week</span>
                            <i class="fas fa-plus" style="margin-left: auto; font-size: 12px; color: var(--accent-primary);"></i>
                        </div>
                        <div class="store-days-off-list">
                `;

                // Get all days off for this store in the current week
                const storeDaysOff = daysOff.filter(d => {
                    const dateInWeek = weekDates.some(date => formatDateKey(date) === d.date);
                    return d.store === store && dateInWeek;
                });

                if (storeDaysOff.length > 0) {
                    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
                    storeDaysOff.forEach(dayOff => {
                        const emp = employees.find(e => e.id === dayOff.employeeId);
                        if (emp) {
                            const colorIndex = emp.name ? emp.name.charCodeAt(0) % colors.length : 0;
                            const initials = emp.name ? emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
                            const dateObj = new Date(dayOff.date + 'T12:00:00');
                            const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                            html += `
                                <div class="store-day-off-item">
                                    <div class="store-day-off-avatar" style="background: ${colors[colorIndex]};">${initials}</div>
                                    <div class="store-day-off-info">
                                        <div class="store-day-off-name">${emp.name}</div>
                                        <div class="store-day-off-date">${dayLabel}</div>
                                    </div>
                                    <button class="store-day-off-remove" onclick="event.stopPropagation(); removeDayOff('${dayOff.id}')" title="Remove day off">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            `;
                        }
                    });
                } else {
                    html += `<div class="store-days-off-empty">No days off this week</div>`;
                }

                html += `
                        </div>
                    </div>
                `;

                html += `
                    </div>
                `;
            });

            html += '</div>';
            container.innerHTML = html;

            // Update hours summary panel
            updateHoursSummaryPanel();
        }

        // Render Employees Hours View - shows worked hours from Clock In/Out data
        async function renderEmployeesHoursView(container, weekDates, today) {
            // Show loading state
            container.innerHTML = `
                <div style="padding: 60px; text-align: center;">
                    <div class="loading-spinner"></div>
                    <p style="color: var(--text-muted); margin-top: 15px;">Loading employee hours...</p>
                </div>
            `;

            try {
                // Initialize Firebase Clock In Manager if not already done
                if (!firebaseClockInManager.isInitialized) {
                    await firebaseClockInManager.initialize();
                }

                // Get all clock records for the week
                const weekClockRecords = {};
                for (const date of weekDates) {
                    const dateKey = formatDateKey(date);
                    // Use the same format as formatDateKey (local date, not UTC)
                    const dateString = dateKey;
                    try {
                        const records = await firebaseClockInManager.loadClockRecordsByDate(dateString);
                        weekClockRecords[dateKey] = records;
                        if (records.length > 0) {
                            console.log(`📅 Loaded ${records.length} clock records for ${dateString}`);
                        }
                    } catch (err) {
                        console.warn(`Could not load clock records for ${dateString}:`, err);
                        weekClockRecords[dateKey] = [];
                    }
                }

                // Calculate hours per employee per day
                const employeeHoursMap = {};

                employees.forEach(emp => {
                    employeeHoursMap[emp.id] = {
                        employee: emp,
                        dailyHours: {},
                        totalHours: 0,
                        totalMinutes: 0
                    };

                    weekDates.forEach(date => {
                        const dateKey = formatDateKey(date);
                        employeeHoursMap[emp.id].dailyHours[dateKey] = { hours: 0, minutes: 0, hasRecord: false };
                    });
                });

                // Process clock records
                for (const dateKey of Object.keys(weekClockRecords)) {
                    const records = weekClockRecords[dateKey];
                    records.forEach(record => {
                        // Find matching employee by multiple criteria for robust matching
                        const matchingEmp = employees.find(e => {
                            // Match by firestoreId (most reliable)
                            if (e.firestoreId && e.firestoreId === record.employeeId) return true;
                            // Match by id
                            if (e.id && e.id === record.employeeId) return true;
                            // Match by name (case-insensitive)
                            if (e.name && record.employeeName &&
                                e.name.toLowerCase().trim() === record.employeeName.toLowerCase().trim()) return true;
                            return false;
                        });

                        if (matchingEmp && employeeHoursMap[matchingEmp.id]) {
                            const workedTime = calculateWorkedTimeFromRecord(record);
                            // Show record even if no clock out yet (in progress)
                            if (workedTime.totalMinutes > 0 || record.clockIn) {
                                employeeHoursMap[matchingEmp.id].dailyHours[dateKey] = {
                                    hours: workedTime.hours,
                                    minutes: workedTime.minutes,
                                    hasRecord: true,
                                    clockIn: record.clockIn,
                                    clockOut: record.clockOut,
                                    inProgress: record.clockIn && !record.clockOut
                                };
                                if (workedTime.totalMinutes > 0) {
                                    employeeHoursMap[matchingEmp.id].totalMinutes += workedTime.totalMinutes;
                                }
                            }
                        }
                    });
                }

                // Calculate total hours for each employee
                Object.values(employeeHoursMap).forEach(empData => {
                    empData.totalHours = Math.floor(empData.totalMinutes / 60);
                    const remainingMinutes = Math.floor(empData.totalMinutes % 60);
                    // Show hours and minutes in a clean format
                    // e.g., "8h 30m" or just "45m" if less than an hour
                    if (empData.totalHours > 0) {
                        empData.totalHoursDisplay = `${empData.totalHours}h ${remainingMinutes}m`;
                    } else if (remainingMinutes > 0) {
                        empData.totalHoursDisplay = `${remainingMinutes}m`;
                    } else {
                        empData.totalHoursDisplay = '-';
                    }
                });

                // Build the HTML table
                let html = `
                    <div class="employees-hours-container">
                        <div class="employees-hours-header">
                            <h3><i class="fas fa-clock" style="color: var(--accent-primary); margin-right: 8px;"></i>Employee Worked Hours</h3>
                            <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">Based on Clock In/Out records for this week</p>
                        </div>
                        <div class="employees-hours-table-wrapper">
                            <table class="employees-hours-table">
                                <thead>
                                    <tr>
                                        <th class="employee-col">Employee</th>
                `;

                // Add day columns
                weekDates.forEach(date => {
                    const dateKey = formatDateKey(date);
                    const isToday = dateKey === today;
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNumber = date.getDate();
                    html += `<th class="day-col ${isToday ? 'today' : ''}">${dayName}<br><span class="day-number">${dayNumber}</span></th>`;
                });

                html += `<th class="total-col">Total</th></tr></thead><tbody>`;

                // Add rows for each employee (sorted by name)
                const sortedEmployees = Object.values(employeeHoursMap)
                    .filter(empData => empData.employee.name)
                    .sort((a, b) => a.employee.name.localeCompare(b.employee.name));

                if (sortedEmployees.length === 0) {
                    html += `
                        <tr>
                            <td colspan="${weekDates.length + 2}" style="text-align: center; padding: 40px; color: var(--text-muted);">
                                <i class="fas fa-users" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
                                No employees found
                            </td>
                        </tr>
                    `;
                } else {
                    sortedEmployees.forEach(empData => {
                        const emp = empData.employee;
                        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
                        const colorIndex = emp.name ? emp.name.charCodeAt(0) % colors.length : 0;
                        const initials = emp.name ? emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

                        html += `
                            <tr>
                                <td class="employee-col">
                                    <div class="emp-info">
                                        <div class="emp-avatar" style="background: ${colors[colorIndex]};">${initials}</div>
                                        <div class="emp-details">
                                            <div class="emp-name">${emp.name}</div>
                                            <div class="emp-store">${emp.store || 'No Store'}</div>
                                        </div>
                                    </div>
                                </td>
                        `;

                        // Add hours for each day
                        weekDates.forEach(date => {
                            const dateKey = formatDateKey(date);
                            const isToday = dateKey === today;
                            const dayData = empData.dailyHours[dateKey];

                            if (dayData.hasRecord) {
                                let hoursDisplay;
                                let cellClass = 'has-hours';

                                if (dayData.inProgress) {
                                    // Employee clocked in but not out yet
                                    hoursDisplay = '<i class="fas fa-clock"></i> Active';
                                    cellClass = 'in-progress';
                                } else if (dayData.hours > 0 || dayData.minutes > 0) {
                                    // Show hours and minutes in a clean format
                                    // e.g., "1h 23m" or just "23m" if less than an hour
                                    if (dayData.hours > 0) {
                                        hoursDisplay = `${dayData.hours}h ${dayData.minutes}m`;
                                    } else {
                                        hoursDisplay = `${dayData.minutes}m`;
                                    }
                                } else {
                                    hoursDisplay = '-';
                                }

                                const tooltipText = dayData.clockIn && dayData.clockOut
                                    ? `${dayData.clockIn} - ${dayData.clockOut}`
                                    : (dayData.clockIn ? `Clocked in: ${dayData.clockIn} (still working)` : '');
                                html += `
                                    <td class="day-col ${isToday ? 'today' : ''} ${cellClass}" title="${tooltipText}">
                                        <span class="hours-value">${hoursDisplay}</span>
                                    </td>
                                `;
                            } else {
                                html += `<td class="day-col ${isToday ? 'today' : ''} no-hours">-</td>`;
                            }
                        });

                        // Add total
                        const hasAnyHours = empData.totalMinutes > 0;
                        html += `
                            <td class="total-col ${hasAnyHours ? 'has-total' : ''}">
                                <span class="total-value">${hasAnyHours ? empData.totalHoursDisplay : '-'}</span>
                            </td>
                        </tr>
                        `;
                    });
                }

                html += `</tbody></table></div></div>`;

                // Add styles for the table
                html += `
                    <style>
                        .employees-hours-container {
                            background: var(--bg-card);
                            border-radius: 16px;
                            padding: 24px;
                            box-shadow: var(--shadow-sm);
                        }
                        .employees-hours-header {
                            margin-bottom: 20px;
                        }
                        .employees-hours-header h3 {
                            font-size: 18px;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                        }
                        .employees-hours-table-wrapper {
                            overflow-x: auto;
                        }
                        .employees-hours-table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 14px;
                        }
                        .employees-hours-table th,
                        .employees-hours-table td {
                            padding: 12px 16px;
                            text-align: center;
                            border-bottom: 1px solid var(--border-color);
                        }
                        .employees-hours-table th {
                            background: var(--bg-secondary);
                            font-weight: 600;
                            color: var(--text-secondary);
                            font-size: 13px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        .employees-hours-table th.today {
                            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
                            color: white;
                        }
                        .employees-hours-table th .day-number {
                            font-size: 16px;
                            font-weight: 700;
                        }
                        .employees-hours-table .employee-col {
                            text-align: left;
                            min-width: 200px;
                        }
                        .employees-hours-table .day-col {
                            min-width: 80px;
                        }
                        .employees-hours-table .total-col {
                            min-width: 100px;
                            background: var(--bg-secondary);
                            font-weight: 600;
                        }
                        .employees-hours-table td.today {
                            background: rgba(79, 70, 229, 0.05);
                        }
                        .employees-hours-table td.has-hours {
                            color: var(--success);
                            font-weight: 500;
                        }
                        .employees-hours-table td.in-progress {
                            color: var(--warning);
                            font-weight: 500;
                        }
                        .employees-hours-table td.in-progress .hours-value {
                            background: rgba(245, 158, 11, 0.15);
                            color: var(--warning);
                            animation: pulse-active 2s infinite;
                        }
                        @keyframes pulse-active {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0.7; }
                        }
                        .employees-hours-table td.no-hours {
                            color: var(--text-muted);
                        }
                        .employees-hours-table td.has-total {
                            color: var(--accent-primary);
                        }
                        .employees-hours-table .hours-value {
                            background: rgba(34, 197, 94, 0.1);
                            padding: 4px 8px;
                            border-radius: 6px;
                            font-size: 13px;
                        }
                        .employees-hours-table .total-value {
                            background: rgba(79, 70, 229, 0.1);
                            padding: 6px 12px;
                            border-radius: 8px;
                            font-weight: 600;
                        }
                        .emp-info {
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        }
                        .emp-avatar {
                            width: 36px;
                            height: 36px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-size: 13px;
                            font-weight: 600;
                        }
                        .emp-details {
                            text-align: left;
                        }
                        .emp-name {
                            font-weight: 600;
                            color: var(--text-primary);
                        }
                        .emp-store {
                            font-size: 12px;
                            color: var(--text-muted);
                        }
                        .employees-hours-table tbody tr:hover {
                            background: var(--bg-hover);
                        }
                    </style>
                `;

                container.innerHTML = html;

                // Update hours summary panel
                updateHoursSummaryPanel();

            } catch (error) {
                console.error('Error rendering employees hours view:', error);
                container.innerHTML = `
                    <div style="padding: 60px; text-align: center;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--warning); margin-bottom: 20px;"></i>
                        <h3 style="color: var(--text-secondary); margin-bottom: 10px;">Error Loading Hours</h3>
                        <p style="color: var(--text-muted);">Unable to load employee hours data.</p>
                        <button class="btn-primary" style="margin-top: 20px;" onclick="renderScheduleGrid()">
                            <i class="fas fa-sync"></i> Retry
                        </button>
                    </div>
                `;
            }
        }

        // Calculate worked time from a clock record
        function calculateWorkedTimeFromRecord(record) {
            if (!record.clockIn) {
                return { hours: 0, minutes: 0, totalMinutes: 0 };
            }

            const clockIn = parseClockTime(record.clockIn);
            const clockOut = record.clockOut ? parseClockTime(record.clockOut) : null;

            if (!clockOut) {
                return { hours: 0, minutes: 0, totalMinutes: 0 };
            }

            let totalMinutes = (clockOut - clockIn) / 1000 / 60;

            // Subtract lunch time if applicable
            if (record.lunchStart && record.lunchEnd) {
                const lunchStart = parseClockTime(record.lunchStart);
                const lunchEnd = parseClockTime(record.lunchEnd);
                const lunchMinutes = (lunchEnd - lunchStart) / 1000 / 60;
                if (lunchMinutes > 0) {
                    totalMinutes -= lunchMinutes;
                }
            }

            // Handle negative or invalid values
            if (totalMinutes < 0) {
                totalMinutes = 0;
            }

            const hours = Math.floor(totalMinutes / 60);
            const minutes = Math.floor(totalMinutes % 60);

            return { hours, minutes, totalMinutes: Math.floor(totalMinutes) };
        }

        // Parse clock time string to Date object
        function parseClockTime(timeString) {
            if (!timeString) return null;
            const today = new Date();
            // Handle 12-hour format (e.g., "2:30 PM") or 24-hour format (e.g., "14:30")
            const match = timeString.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
            if (!match) return null;

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

        // Drag handlers for All Stores view
        function handleStoreSlotDragOver(event) {
            event.preventDefault();
            event.currentTarget.classList.add('drag-over');
        }

        function handleStoreSlotDragLeave(event) {
            event.currentTarget.classList.remove('drag-over');
        }

        async function handleStoreSlotDrop(event, dateKey, shiftType, store) {
            event.preventDefault();
            event.currentTarget.classList.remove('drag-over');

            if (!draggedShift) return;

            const schedule = schedules.find(s => s.id === draggedShift);
            if (!schedule) return;

            const shiftConfig = SHIFT_TYPES[shiftType];

            try {
                const db = firebase.firestore();
                await db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules').doc(draggedShift).update({
                    date: dateKey,
                    shiftType,
                    store,
                    startTime: shiftConfig.defaultStart,
                    endTime: shiftConfig.defaultEnd,
                    updatedAt: new Date().toISOString()
                });

                schedule.date = dateKey;
                schedule.shiftType = shiftType;
                schedule.store = store;
                schedule.startTime = shiftConfig.defaultStart;
                schedule.endTime = shiftConfig.defaultEnd;

                showNotification('Shift moved!', 'success');
                renderScheduleGrid();
            } catch (error) {
                console.error('Error moving shift:', error);
                showNotification('Error moving shift', 'error');
            }
        }

        // Clone individual shift
        async function cloneShift(scheduleId) {
            const schedule = schedules.find(s => s.id === scheduleId);
            if (!schedule) return;

            const weekDates = getWeekDates(currentWeekStart);
            const weekKeys = weekDates.map(d => formatDateKey(d));
            const currentDayIndex = weekKeys.indexOf(schedule.date);

            // Find next available day for same shift type in same store
            let targetDate = null;
            for (let i = currentDayIndex + 1; i < 7; i++) {
                const exists = schedules.find(s =>
                    s.date === weekKeys[i] &&
                    s.shiftType === schedule.shiftType &&
                    s.store === schedule.store
                );
                if (!exists) {
                    targetDate = weekKeys[i];
                    break;
                }
            }

            if (!targetDate) {
                // Try from beginning of week
                for (let i = 0; i < currentDayIndex; i++) {
                    const exists = schedules.find(s =>
                        s.date === weekKeys[i] &&
                        s.shiftType === schedule.shiftType &&
                        s.store === schedule.store
                    );
                    if (!exists) {
                        targetDate = weekKeys[i];
                        break;
                    }
                }
            }

            if (!targetDate) {
                showNotification('No empty slots available this week', 'warning');
                return;
            }

            const currentUser = getCurrentUser();

            try {
                const db = firebase.firestore();
                const newSchedule = {
                    employeeId: schedule.employeeId,
                    employeeName: schedule.employeeName,
                    store: schedule.store,
                    date: targetDate,
                    shiftType: schedule.shiftType,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    createdAt: new Date().toISOString(),
                    createdBy: currentUser?.name || 'Unknown',
                    clonedFrom: scheduleId
                };

                const docRef = await db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules').add(newSchedule);
                schedules.push({ id: docRef.id, ...newSchedule });

                const targetDay = new Date(targetDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
                showNotification(`Shift cloned to ${targetDay}!`, 'success');
                renderScheduleGrid();
            } catch (error) {
                console.error('Error cloning shift:', error);
                showNotification('Error cloning shift', 'error');
            }
        }

        // Clone modal functions
        function openCloneModal() {
            // Only admins and managers can clone schedules
            if (!canEditSchedule()) {
                showNotification('Only managers and admins can edit schedules', 'error');
                return;
            }
            document.getElementById('cloneModalOverlay').classList.add('active');
        }

        function closeCloneModal(event) {
            if (event && event.target !== event.currentTarget) return;
            document.getElementById('cloneModalOverlay').classList.remove('active');
        }

        async function cloneFromPreviousWeek() {
            const previousWeekStart = new Date(currentWeekStart);
            previousWeekStart.setDate(previousWeekStart.getDate() - 7);
            const previousWeekDates = getWeekDates(previousWeekStart);
            const currentWeekDates = getWeekDates(currentWeekStart);

            // Get schedules from previous week
            const previousWeekKeys = previousWeekDates.map(d => formatDateKey(d));
            const previousSchedules = schedules.filter(s => previousWeekKeys.includes(s.date));

            if (previousSchedules.length === 0) {
                showNotification('No schedules found in previous week', 'warning');
                closeCloneModal();
                return;
            }

            const storeFilter = document.getElementById('schedule-store-filter')?.value || 'all';

            try {
                const db = firebase.firestore();
                const currentUser = getCurrentUser();
                let clonedCount = 0;

                for (const prevSchedule of previousSchedules) {
                    // Skip if filtering by store and doesn't match
                    if (storeFilter !== 'all' && prevSchedule.store !== storeFilter) continue;

                    // Calculate new date (same day of week, current week)
                    const prevDateIndex = previousWeekKeys.indexOf(prevSchedule.date);
                    const newDate = formatDateKey(currentWeekDates[prevDateIndex]);

                    // Check if schedule already exists for this slot
                    const exists = schedules.find(s =>
                        s.date === newDate &&
                        s.shiftType === prevSchedule.shiftType &&
                        s.store === prevSchedule.store
                    );

                    if (!exists) {
                        const newSchedule = {
                            employeeId: prevSchedule.employeeId,
                            employeeName: prevSchedule.employeeName,
                            store: prevSchedule.store,
                            date: newDate,
                            shiftType: prevSchedule.shiftType,
                            startTime: prevSchedule.startTime,
                            endTime: prevSchedule.endTime,
                            createdAt: new Date().toISOString(),
                            createdBy: currentUser?.name || 'Unknown',
                            clonedFrom: prevSchedule.id
                        };

                        const docRef = await db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules').add(newSchedule);
                        schedules.push({ id: docRef.id, ...newSchedule });
                        clonedCount++;
                    }
                }

                showNotification(`Cloned ${clonedCount} shifts from previous week!`, 'success');
                closeCloneModal();
                renderScheduleGrid();
            } catch (error) {
                console.error('Error cloning schedules:', error);
                showNotification('Error cloning schedules', 'error');
            }
        }

        async function cloneToNextWeek() {
            const nextWeekStart = new Date(currentWeekStart);
            nextWeekStart.setDate(nextWeekStart.getDate() + 7);
            const nextWeekDates = getWeekDates(nextWeekStart);
            const currentWeekDates = getWeekDates(currentWeekStart);

            // Get schedules from current week
            const currentWeekKeys = currentWeekDates.map(d => formatDateKey(d));
            const currentSchedules = schedules.filter(s => currentWeekKeys.includes(s.date));

            if (currentSchedules.length === 0) {
                showNotification('No schedules in current week to clone', 'warning');
                closeCloneModal();
                return;
            }

            const storeFilter = document.getElementById('schedule-store-filter')?.value || 'all';

            try {
                const db = firebase.firestore();
                const currentUser = getCurrentUser();
                let clonedCount = 0;

                for (const currSchedule of currentSchedules) {
                    if (storeFilter !== 'all' && currSchedule.store !== storeFilter) continue;

                    const currDateIndex = currentWeekKeys.indexOf(currSchedule.date);
                    const newDate = formatDateKey(nextWeekDates[currDateIndex]);

                    const exists = schedules.find(s =>
                        s.date === newDate &&
                        s.shiftType === currSchedule.shiftType &&
                        s.store === currSchedule.store
                    );

                    if (!exists) {
                        const newSchedule = {
                            employeeId: currSchedule.employeeId,
                            employeeName: currSchedule.employeeName,
                            store: currSchedule.store,
                            date: newDate,
                            shiftType: currSchedule.shiftType,
                            startTime: currSchedule.startTime,
                            endTime: currSchedule.endTime,
                            createdAt: new Date().toISOString(),
                            createdBy: currentUser?.name || 'Unknown',
                            clonedFrom: currSchedule.id
                        };

                        const docRef = await db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules').add(newSchedule);
                        schedules.push({ id: docRef.id, ...newSchedule });
                        clonedCount++;
                    }
                }

                showNotification(`Cloned ${clonedCount} shifts to next week!`, 'success');
                closeCloneModal();
                renderScheduleGrid();
            } catch (error) {
                console.error('Error cloning schedules:', error);
                showNotification('Error cloning schedules', 'error');
            }
        }

        async function clearCurrentWeek() {
            if (!confirm('Are you sure you want to remove all shifts from the current week?')) return;

            const currentWeekDates = getWeekDates(currentWeekStart);
            const currentWeekKeys = currentWeekDates.map(d => formatDateKey(d));
            const storeFilter = document.getElementById('schedule-store-filter')?.value || 'all';

            const schedulesToDelete = schedules.filter(s =>
                currentWeekKeys.includes(s.date) &&
                (storeFilter === 'all' || s.store === storeFilter)
            );

            if (schedulesToDelete.length === 0) {
                showNotification('No schedules to clear', 'info');
                closeCloneModal();
                return;
            }

            try {
                const db = firebase.firestore();
                const batch = db.batch();

                schedulesToDelete.forEach(s => {
                    const docRef = db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules').doc(s.id);
                    batch.delete(docRef);
                });

                await batch.commit();

                schedules = schedules.filter(s => !schedulesToDelete.find(d => d.id === s.id));
                showNotification(`Cleared ${schedulesToDelete.length} shifts`, 'success');
                closeCloneModal();
                renderScheduleGrid();
            } catch (error) {
                console.error('Error clearing schedules:', error);
                showNotification('Error clearing schedules', 'error');
            }
        }

        // Employee picker functions
        let currentPickerContext = null;

        // Check if user can edit schedules (admin or manager only)
        function canEditSchedule() {
            const user = getCurrentUser();
            return user?.role === 'admin' || user?.role === 'manager';
        }

        function openEmployeePicker(dateKey, shiftType, storeFilter) {
            // Only admins and managers can assign employees to schedules
            if (!canEditSchedule()) {
                showNotification('Only managers and admins can edit schedules', 'error');
                return;
            }

            currentPickerContext = { dateKey, shiftType, storeFilter };

            const overlay = document.getElementById('employeePickerOverlay');
            const list = document.getElementById('employeePickerList');
            const search = document.getElementById('employeePickerSearch');

            if (search) search.value = '';
            renderEmployeePickerList();

            overlay.classList.add('active');
        }

        function closeEmployeePicker(event) {
            if (event && event.target !== event.currentTarget) return;
            const overlay = document.getElementById('employeePickerOverlay');
            const title = overlay.querySelector('h3');
            const footer = document.getElementById('employeePickerFooter');
            const toggle = document.getElementById('multiSelectToggle');

            // Reset title to default
            if (title) title.textContent = 'Select Employee';

            // Reset multi-select state
            multiSelectMode = false;
            selectedEmployees.clear();
            if (toggle) toggle.checked = false;
            if (footer) footer.style.display = 'none';

            overlay.classList.remove('active');
            currentPickerContext = null;
            currentDayOffContext = null;
        }

        function filterEmployeePicker() {
            if (currentDayOffContext) {
                renderDayOffPickerList();
            } else {
                renderEmployeePickerList();
            }
        }

        // Helper function to check if an employee has approved time off on a specific date
        function getEmployeeTimeOffForDate(employeeId, dateKey) {
            if (!ptoRequests || !dateKey) return null;

            // Convert dateKey (YYYY-MM-DD) to compare with PTO request dates
            return ptoRequests.find(request => {
                if (request.status !== 'approved') return false;

                // Check if employee matches
                const emp = employees.find(e => e.id === employeeId);
                if (!emp) return false;

                const matchesEmployee = request.employeeId === employeeId ||
                                        request.employeeId === emp.firestoreId ||
                                        request.employeeName === emp.name;

                if (!matchesEmployee) return false;

                // Check if date falls within the request range
                const requestStart = new Date(request.startDate);
                const requestEnd = new Date(request.endDate);
                const checkDate = new Date(dateKey);

                return checkDate >= requestStart && checkDate <= requestEnd;
            });
        }

        function renderEmployeePickerList() {
            const list = document.getElementById('employeePickerList');
            const search = document.getElementById('employeePickerSearch')?.value?.toLowerCase() || '';

            if (!currentPickerContext) return;

            let filteredEmployees = [...employees];

            // REMOVED: Filter by store - Show ALL employees from Firebase regardless of store
            // This allows assigning any employee to any shift at any store
            // if (currentPickerContext.storeFilter !== 'all') {
            //     filteredEmployees = filteredEmployees.filter(e => e.store === currentPickerContext.storeFilter);
            //     console.log(`After store filter (${currentPickerContext.storeFilter}):`, filteredEmployees.length, 'employees');
            // }

            // Filter by search only
            if (search) {
                filteredEmployees = filteredEmployees.filter(e =>
                    e.name?.toLowerCase().includes(search)
                );
                console.log(`After search filter (${search}):`, filteredEmployees.length, 'employees');
            }

            // Filter out inactive/terminated employees (only show active)
            filteredEmployees = filteredEmployees.filter(e => e.status === 'active');

            // Filter out employees who have a day off on this date
            if (currentPickerContext.dateKey) {
                console.log('🏖️ Checking days off for date:', currentPickerContext.dateKey);
                console.log('🏖️ All days off in memory:', daysOff);

                const daysOffOnThisDate = daysOff.filter(d => d.date === currentPickerContext.dateKey);
                console.log('🏖️ Days off matching this date:', daysOffOnThisDate);

                const employeesWithDayOff = daysOffOnThisDate.map(d => d.employeeId);
                console.log('🏖️ Employee IDs with day off:', employeesWithDayOff);

                const beforeFilter = filteredEmployees.length;
                filteredEmployees = filteredEmployees.filter(e =>
                    !employeesWithDayOff.includes(e.id) &&
                    !employeesWithDayOff.includes(e.firestoreId)
                );
                console.log(`🏖️ Filtered out ${beforeFilter - filteredEmployees.length} employees with days off`);
            }

            console.log('Final filtered employees:', filteredEmployees);

            const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];

            // Check for employees with approved time off requests
            const employeesWithTimeOff = new Map();
            filteredEmployees.forEach(emp => {
                const timeOffRequest = getEmployeeTimeOffForDate(emp.id, currentPickerContext.dateKey);
                if (timeOffRequest) {
                    employeesWithTimeOff.set(emp.id, timeOffRequest);
                }
            });

            // Check for employees already assigned to ANOTHER store on this date
            const employeesAtOtherStore = new Map();
            const currentStore = currentPickerContext.storeFilter;
            if (currentStore && currentStore !== 'all') {
                filteredEmployees.forEach(emp => {
                    // Find if this employee has a schedule on this date at a DIFFERENT store
                    const otherStoreSchedule = schedules.find(s =>
                        s.date === currentPickerContext.dateKey &&
                        (s.employeeId === emp.id || s.employeeId === emp.firestoreId) &&
                        s.store !== currentStore
                    );
                    if (otherStoreSchedule) {
                        employeesAtOtherStore.set(emp.id, otherStoreSchedule.store);
                    }
                });
            }

            // Sort: available employees first, then time off, then those at other stores
            filteredEmployees.sort((a, b) => {
                const aHasTimeOff = employeesWithTimeOff.has(a.id);
                const bHasTimeOff = employeesWithTimeOff.has(b.id);
                const aAtOtherStore = employeesAtOtherStore.has(a.id);
                const bAtOtherStore = employeesAtOtherStore.has(b.id);

                // Employees at other stores go last
                if (aAtOtherStore && !bAtOtherStore) return 1;
                if (!aAtOtherStore && bAtOtherStore) return -1;

                // Then employees with time off
                if (aHasTimeOff && !bHasTimeOff) return 1;
                if (!aHasTimeOff && bHasTimeOff) return -1;

                return (a.name || '').localeCompare(b.name || '');
            });

            list.innerHTML = filteredEmployees.map(emp => {
                const colorIndex = emp.name ? emp.name.charCodeAt(0) % colors.length : 0;
                const initials = emp.name ? emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
                const isSelected = selectedEmployees.has(emp.id);
                const timeOffRequest = employeesWithTimeOff.get(emp.id);
                const hasTimeOff = !!timeOffRequest;
                const timeOffType = timeOffRequest ? (PTO_REQUEST_TYPES[timeOffRequest.requestType]?.label || 'Time Off') : '';
                const otherStore = employeesAtOtherStore.get(emp.id);
                const isAtOtherStore = !!otherStore;

                // Determine styles based on conflicts
                let itemStyle = '';
                let statusInfo = emp.store || '';
                let nameIcon = '';
                let isDisabled = false;

                if (isAtOtherStore) {
                    // Employee already assigned to another store - show in RED
                    itemStyle = 'opacity: 0.6; border-left: 3px solid #ef4444; background: rgba(239, 68, 68, 0.08);';
                    statusInfo = `<span style="color: #ef4444; font-weight: 600;"><i class="fas fa-store"></i> Already at ${otherStore}</span>`;
                    nameIcon = ` <i class="fas fa-ban" style="color: #ef4444; font-size: 11px;" title="Already scheduled at ${otherStore}"></i>`;
                    isDisabled = true;
                } else if (hasTimeOff) {
                    itemStyle = 'opacity: 0.7; border-left: 3px solid #f59e0b;';
                    statusInfo = `<span style="color: #f59e0b; font-weight: 500;"><i class="fas fa-calendar-times"></i> ${timeOffType}</span>`;
                    nameIcon = ` <i class="fas fa-exclamation-triangle" style="color: #f59e0b; font-size: 11px;" title="${timeOffType} approved"></i>`;
                }

                if (multiSelectMode) {
                    return `
                        <div class="employee-picker-item multi-select ${isSelected ? 'selected' : ''} ${hasTimeOff ? 'has-time-off' : ''} ${isAtOtherStore ? 'at-other-store' : ''}"
                             data-employee-id="${emp.id}"
                             onclick="${isDisabled ? 'showNotification(\'This employee is already scheduled at ' + otherStore + '\', \'error\')' : `toggleEmployeeSelection('${emp.id}')`}"
                             style="${itemStyle}">
                            <div class="select-checkbox">
                                <i class="fas fa-check"></i>
                            </div>
                            <div class="employee-picker-avatar" style="background: ${isAtOtherStore ? '#ef4444' : colors[colorIndex]};">${initials}</div>
                            <div class="employee-picker-info">
                                <div class="employee-picker-name">${emp.name}${nameIcon}</div>
                                <div class="employee-picker-store">${statusInfo}</div>
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="employee-picker-item ${hasTimeOff ? 'has-time-off' : ''} ${isAtOtherStore ? 'at-other-store' : ''}"
                             onclick="${isDisabled ? `showNotification('This employee is already scheduled at ${otherStore}', 'error')` : (hasTimeOff ? `confirmAssignWithTimeOff('${emp.id}', '${timeOffType}')` : `assignEmployee('${emp.id}')`)}"
                             style="${itemStyle}; ${isDisabled ? 'cursor: not-allowed;' : ''}">
                            <div class="employee-picker-avatar" style="background: ${isAtOtherStore ? '#ef4444' : colors[colorIndex]};">${initials}</div>
                            <div class="employee-picker-info">
                                <div class="employee-picker-name">${emp.name}${nameIcon}</div>
                                <div class="employee-picker-store">${statusInfo}</div>
                            </div>
                        </div>
                    `;
                }
            }).join('') || '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No employees found</div>';
        }

        // Show confirmation dialog when assigning employee with time off
        function confirmAssignWithTimeOff(employeeId, timeOffType) {
            const emp = employees.find(e => e.id === employeeId);
            const empName = emp?.name || 'This employee';

            showConfirmModal({
                title: 'Time Off Conflict',
                message: `${empName} has approved ${timeOffType} for this date. Are you sure you want to schedule them anyway?`,
                confirmText: 'Assign Anyway',
                type: 'warning',
                onConfirm: () => {
                    assignEmployee(employeeId);
                }
            });
        }

        // Make function globally accessible
        window.confirmAssignWithTimeOff = confirmAssignWithTimeOff;

        async function assignEmployee(employeeId) {
            if (!currentPickerContext) return;

            const { dateKey, shiftType, storeFilter } = currentPickerContext;
            const emp = employees.find(e => e.id === employeeId);
            const shiftConfig = SHIFT_TYPES[shiftType];
            const store = storeFilter !== 'all' ? storeFilter : emp?.store || '';

            // Check if employee has a day off on this date
            const hasDayOff = daysOff.some(d =>
                d.date === dateKey &&
                (d.employeeId === employeeId || d.employeeId === emp?.firestoreId)
            );

            if (hasDayOff) {
                showNotification('This employee has a day off on this date', 'warning');
                return;
            }

            // Check if THIS EMPLOYEE is already scheduled for this slot (to avoid duplicates)
            const alreadyAssigned = schedules.find(s =>
                s.date === dateKey &&
                s.shiftType === shiftType &&
                s.store === store &&
                s.employeeId === employeeId
            );

            if (alreadyAssigned) {
                showNotification(`${emp?.name || 'Employee'} is already assigned to this shift`, 'warning');
                return;
            }

            const currentUser = getCurrentUser();

            try {
                const db = firebase.firestore();

                // Always create a new schedule (allows multiple employees per shift)
                const scheduleData = {
                    employeeId,
                    employeeName: emp?.name || '',
                    store,
                    date: dateKey,
                    shiftType,
                    startTime: shiftConfig.defaultStart,
                    endTime: shiftConfig.defaultEnd,
                    createdAt: new Date().toISOString(),
                    createdBy: currentUser?.name || 'Unknown'
                };
                const docRef = await db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules').add(scheduleData);
                schedules.push({ id: docRef.id, ...scheduleData });

                let assignedBoth = false;

                // Auto-assign to closing if opening shift ends at or after 2pm (14:00)
                if (shiftType === 'opening' && shiftConfig.defaultEnd >= '14:00') {
                    const closingExistsForThisEmployee = schedules.find(s =>
                        s.date === dateKey &&
                        s.shiftType === 'closing' &&
                        s.store === store &&
                        s.employeeId === employeeId
                    );

                    if (!closingExistsForThisEmployee) {
                        const closingConfig = SHIFT_TYPES.closing;
                        const closingData = {
                            employeeId,
                            employeeName: emp?.name || '',
                            store,
                            date: dateKey,
                            shiftType: 'closing',
                            startTime: closingConfig.defaultStart,
                            endTime: closingConfig.defaultEnd,
                            createdAt: new Date().toISOString(),
                            createdBy: currentUser?.name || 'Unknown',
                            autoAssigned: true
                        };
                        const closingRef = await db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules').add(closingData);
                        schedules.push({ id: closingRef.id, ...closingData });
                        assignedBoth = true;
                    }
                }

                showNotification(assignedBoth ? 'Employee assigned to both shifts!' : 'Employee assigned!', 'success');
                closeEmployeePicker();
                renderScheduleGrid();
            } catch (error) {
                console.error('Error assigning employee:', error);
                showNotification('Error assigning employee', 'error');
            }
        }

        // Multi-select mode state
        let multiSelectMode = false;
        let selectedEmployees = new Set();

        function toggleMultiSelectMode() {
            const toggle = document.getElementById('multiSelectToggle');
            const footer = document.getElementById('employeePickerFooter');

            multiSelectMode = toggle?.checked || false;
            selectedEmployees.clear();

            if (footer) {
                footer.style.display = multiSelectMode ? 'flex' : 'none';
            }

            updateSelectedCount();
            renderEmployeePickerList();
        }

        function toggleEmployeeSelection(employeeId) {
            if (selectedEmployees.has(employeeId)) {
                selectedEmployees.delete(employeeId);
            } else {
                selectedEmployees.add(employeeId);
            }

            // Update UI
            const item = document.querySelector(`.employee-picker-item[data-employee-id="${employeeId}"]`);
            if (item) {
                item.classList.toggle('selected', selectedEmployees.has(employeeId));
            }

            updateSelectedCount();
        }

        function updateSelectedCount() {
            const countEl = document.getElementById('selectedCount');
            const btn = document.querySelector('.assign-selected-btn');

            if (countEl) {
                countEl.textContent = `${selectedEmployees.size} selected`;
            }
            if (btn) {
                btn.disabled = selectedEmployees.size === 0;
            }
        }

        async function assignSelectedEmployees() {
            if (!currentPickerContext || selectedEmployees.size === 0) return;

            const { dateKey, shiftType, storeFilter } = currentPickerContext;
            const shiftConfig = SHIFT_TYPES[shiftType];
            const currentUser = getCurrentUser();
            const db = firebase.firestore();

            let successCount = 0;
            let skipCount = 0;

            try {
                for (const employeeId of selectedEmployees) {
                    const emp = employees.find(e => e.id === employeeId);
                    const store = storeFilter !== 'all' ? storeFilter : emp?.store || '';

                    // Check if employee has a day off on this date
                    const hasDayOff = daysOff.some(d =>
                        d.date === dateKey &&
                        (d.employeeId === employeeId || d.employeeId === emp?.firestoreId)
                    );

                    if (hasDayOff) {
                        skipCount++;
                        continue;
                    }

                    // Check if this employee already has a schedule for this slot
                    const alreadyScheduled = schedules.find(s =>
                        s.date === dateKey &&
                        s.shiftType === shiftType &&
                        s.store === store &&
                        s.employeeId === employeeId
                    );

                    if (alreadyScheduled) {
                        skipCount++;
                        continue;
                    }

                    // Create new schedule for this employee
                    const scheduleData = {
                        employeeId,
                        employeeName: emp?.name || '',
                        store,
                        date: dateKey,
                        shiftType,
                        startTime: shiftConfig.defaultStart,
                        endTime: shiftConfig.defaultEnd,
                        createdAt: new Date().toISOString(),
                        createdBy: currentUser?.name || 'Unknown'
                    };

                    const docRef = await db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules').add(scheduleData);
                    schedules.push({ id: docRef.id, ...scheduleData });
                    successCount++;
                }

                if (successCount > 0) {
                    showNotification(`${successCount} employee${successCount > 1 ? 's' : ''} assigned!${skipCount > 0 ? ` (${skipCount} skipped)` : ''}`, 'success');
                } else if (skipCount > 0) {
                    showNotification('All selected employees were skipped (day off or already scheduled)', 'warning');
                }

                closeEmployeePicker();
                renderScheduleGrid();
            } catch (error) {
                console.error('Error assigning employees:', error);
                showNotification('Error assigning employees', 'error');
            }
        }

        async function removeSchedule(scheduleId) {
            if (!confirm('Remove this employee from the shift?')) return;

            try {
                const db = firebase.firestore();
                await db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules').doc(scheduleId).delete();

                schedules = schedules.filter(s => s.id !== scheduleId);
                showNotification('Shift removed', 'success');
                renderScheduleGrid();
            } catch (error) {
                console.error('Error removing schedule:', error);
                showNotification('Error removing shift', 'error');
            }
        }

        // Days Off Management
        let currentDayOffContext = null;

        function openDayOffPicker(dateKey, storeFilter) {
            currentDayOffContext = { dateKey, storeFilter };

            const overlay = document.getElementById('employeePickerOverlay');
            const list = document.getElementById('employeePickerList');
            const search = document.getElementById('employeePickerSearch');
            const title = overlay.querySelector('h3');

            if (title) title.textContent = 'Select Employee for Day Off';
            if (search) search.value = '';
            renderDayOffPickerList();

            overlay.classList.add('active');
        }

        function renderDayOffPickerList() {
            const list = document.getElementById('employeePickerList');
            const search = document.getElementById('employeePickerSearch')?.value?.toLowerCase() || '';

            if (!currentDayOffContext) return;

            let filteredEmployees = [...employees];

            // Filter by search
            if (search) {
                filteredEmployees = filteredEmployees.filter(e =>
                    e.name?.toLowerCase().includes(search)
                );
            }

            // Filter out inactive/terminated employees (only show active)
            filteredEmployees = filteredEmployees.filter(e => e.status === 'active');

            // Filter out employees who already have a day off on this date
            const existingDayOffs = daysOff.filter(d => d.date === currentDayOffContext.dateKey);
            filteredEmployees = filteredEmployees.filter(e =>
                !existingDayOffs.some(d => d.employeeId === e.id)
            );

            const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];

            list.innerHTML = filteredEmployees.map(emp => {
                const colorIndex = emp.name ? emp.name.charCodeAt(0) % colors.length : 0;
                const initials = emp.name ? emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

                return `
                    <div class="employee-picker-item" onclick="assignDayOff('${emp.id}')">
                        <div class="employee-picker-avatar" style="background: ${colors[colorIndex]};">${initials}</div>
                        <div class="employee-picker-info">
                            <div class="employee-picker-name">${emp.name}</div>
                            <div class="employee-picker-store">${emp.store || ''}</div>
                        </div>
                    </div>
                `;
            }).join('') || '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No employees available</div>';
        }

        async function assignDayOff(employeeId) {
            if (!currentDayOffContext) return;

            const { dateKey, storeFilter } = currentDayOffContext;
            const emp = employees.find(e => e.id === employeeId);
            const store = storeFilter !== 'all' ? storeFilter : emp?.store || '';

            // Check if employee already has a day off
            const existingDayOff = daysOff.find(d =>
                d.date === dateKey &&
                d.employeeId === employeeId
            );

            if (existingDayOff) {
                showNotification('Employee already has a day off on this date', 'warning');
                return;
            }

            const currentUser = getCurrentUser();

            try {
                const db = firebase.firestore();
                const dayOffData = {
                    employeeId,
                    employeeName: emp?.name || '',
                    store,
                    date: dateKey,
                    createdAt: new Date().toISOString(),
                    createdBy: currentUser?.name || 'Unknown'
                };

                const docRef = await db.collection(window.FIREBASE_COLLECTIONS.daysOff || 'daysOff').add(dayOffData);
                daysOff.push({ id: docRef.id, ...dayOffData });

                showNotification('Day off assigned!', 'success');
                closeEmployeePicker();
                currentDayOffContext = null;
                renderScheduleGrid();
            } catch (error) {
                console.error('Error assigning day off:', error);
                showNotification('Error assigning day off', 'error');
            }
        }

        async function removeDayOff(dayOffId) {
            if (!confirm('Remove this day off?')) return;

            try {
                const db = firebase.firestore();
                await db.collection(window.FIREBASE_COLLECTIONS.daysOff || 'daysOff').doc(dayOffId).delete();

                daysOff = daysOff.filter(d => d.id !== dayOffId);
                showNotification('Day off removed', 'success');
                renderScheduleGrid();
            } catch (error) {
                console.error('Error removing day off:', error);
                showNotification('Error removing day off', 'error');
            }
        }

        // =============================================================================
        // MANAGER VIEW SCHEDULE - For managers/admins only
        // =============================================================================

        function renderManagerSchedule() {
            const dashboard = document.querySelector('.dashboard');
            const weekDates = getWeekDates(currentWeekStart);
            const weekRangeText = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

            dashboard.innerHTML = `
                <style>
                    /* Manager Schedule Specific Styles */
                    .manager-schedule-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 24px;
                        flex-wrap: wrap;
                        gap: 16px;
                        padding: 20px;
                        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%);
                        border-radius: 16px;
                        border: 1px solid rgba(99, 102, 241, 0.2);
                    }
                    .manager-schedule-title h2 {
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 4px;
                        color: var(--accent-primary);
                    }
                    .manager-schedule-title h2 i {
                        color: var(--accent-primary);
                        margin-right: 10px;
                    }
                    .manager-schedule-title p {
                        color: var(--text-muted);
                        font-size: 14px;
                    }
                    .manager-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        background: var(--accent-gradient);
                        color: white;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        margin-left: 12px;
                    }
                    .manager-controls {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .manager-week-nav {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        background: var(--bg-card);
                        padding: 6px;
                        border-radius: 12px;
                        border: 1px solid rgba(99, 102, 241, 0.3);
                    }
                    .manager-nav-btn {
                        background: transparent;
                        border: none;
                        width: 36px;
                        height: 36px;
                        border-radius: 8px;
                        cursor: pointer;
                        color: var(--text-secondary);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    }
                    .manager-nav-btn:hover {
                        background: var(--accent-primary);
                        color: white;
                    }
                    .manager-week-display {
                        font-size: 15px;
                        font-weight: 600;
                        min-width: 180px;
                        text-align: center;
                        color: var(--text-primary);
                    }
                    .manager-store-select {
                        background: var(--bg-card);
                        border: 1px solid rgba(99, 102, 241, 0.3);
                        border-radius: 10px;
                        padding: 10px 16px;
                        color: var(--text-primary);
                        font-size: 14px;
                        cursor: pointer;
                        min-width: 160px;
                    }
                    .manager-store-select:focus {
                        outline: none;
                        border-color: var(--accent-primary);
                        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                    }

                    /* Multi-Employee Info Card */
                    .multi-employee-info {
                        background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(79, 70, 229, 0.04) 100%);
                        border: 1px solid rgba(99, 102, 241, 0.2);
                        border-radius: 12px;
                        padding: 16px 20px;
                        margin-bottom: 20px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .multi-employee-info i {
                        font-size: 24px;
                        color: var(--accent-primary);
                    }
                    .multi-employee-info-text {
                        flex: 1;
                    }
                    .multi-employee-info-text h4 {
                        font-size: 14px;
                        font-weight: 600;
                        color: var(--text-primary);
                        margin-bottom: 4px;
                    }
                    .multi-employee-info-text p {
                        font-size: 13px;
                        color: var(--text-muted);
                        margin: 0;
                    }

                    /* Manager Schedule Layout */
                    .manager-schedule-layout {
                        display: flex;
                        gap: 20px;
                    }
                    .manager-schedule-main {
                        flex: 1;
                        min-width: 0;
                    }

                    /* Mobile Manager Schedule */
                    @media (max-width: 768px) {
                        .manager-schedule-header {
                            flex-direction: column;
                            align-items: stretch;
                            padding: 16px;
                        }
                        .manager-controls {
                            flex-direction: column;
                            align-items: stretch;
                            gap: 10px;
                        }
                        .manager-week-nav {
                            width: 100%;
                            justify-content: center;
                        }
                        .manager-week-display {
                            flex: 1;
                            min-width: auto;
                        }
                        .manager-store-select {
                            width: 100%;
                        }
                        .multi-employee-info {
                            flex-direction: column;
                            text-align: center;
                            padding: 14px;
                        }
                        .manager-badge {
                            margin-left: 0;
                            margin-top: 8px;
                        }
                        .manager-schedule-title h2 {
                            font-size: 20px;
                            display: flex;
                            flex-direction: column;
                            align-items: flex-start;
                        }
                    }
                    @media (max-width: 480px) {
                        .manager-schedule-title h2 {
                            font-size: 18px;
                        }
                        .manager-schedule-title p {
                            font-size: 12px;
                        }
                        .manager-week-display {
                            font-size: 13px;
                        }
                        .manager-nav-btn {
                            width: 32px;
                            height: 32px;
                        }
                    }

                    /* Days Grid - Horizontal scroll for week */
                    .schedule-days-container {
                        display: flex;
                        gap: 12px;
                        overflow-x: auto;
                        padding-bottom: 12px;
                        scroll-snap-type: x mandatory;
                    }
                    .schedule-days-container::-webkit-scrollbar {
                        height: 6px;
                    }
                    .schedule-days-container::-webkit-scrollbar-track {
                        background: var(--bg-secondary);
                        border-radius: 3px;
                    }
                    .schedule-days-container::-webkit-scrollbar-thumb {
                        background: var(--border-color);
                        border-radius: 3px;
                    }

                    /* Day Card */
                    .schedule-day-card {
                        flex: 0 0 calc(14.28% - 10px);
                        min-width: 200px;
                        background: var(--bg-card);
                        border-radius: 16px;
                        border: 1px solid var(--border-color);
                        overflow: hidden;
                        scroll-snap-align: start;
                        transition: all 0.3s ease;
                    }
                    .schedule-day-card:hover {
                        border-color: var(--accent-primary);
                        box-shadow: 0 8px 32px rgba(99, 102, 241, 0.1);
                    }
                    .schedule-day-card.today {
                        border-color: var(--accent-primary);
                        box-shadow: 0 0 0 2px var(--accent-glow);
                    }
                    .day-card-header {
                        padding: 16px;
                        text-align: center;
                        border-bottom: 1px solid var(--border-color);
                        background: var(--bg-secondary);
                    }
                    .schedule-day-card.today .day-card-header {
                        background: var(--accent-gradient);
                    }
                    .schedule-day-card.today .day-card-header * {
                        color: white !important;
                    }
                    .day-card-header .day-name {
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: var(--text-muted);
                        font-weight: 600;
                    }
                    .day-card-header .day-number {
                        font-size: 28px;
                        font-weight: 700;
                        color: var(--text-primary);
                        line-height: 1.2;
                    }
                    .day-card-body {
                        padding: 12px;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }

                    /* Shift Slot */
                    .shift-slot {
                        border-radius: 12px;
                        padding: 12px;
                        transition: all 0.2s;
                        position: relative;
                    }
                    .shift-slot.opening {
                        background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%);
                        border: 1px solid rgba(245, 158, 11, 0.2);
                    }
                    .shift-slot.closing {
                        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%);
                        border: 1px solid rgba(99, 102, 241, 0.2);
                    }
                    .shift-slot-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 10px;
                    }
                    .shift-type-badge {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .shift-slot.opening .shift-type-badge {
                        color: #f59e0b;
                    }
                    .shift-slot.closing .shift-type-badge {
                        color: #6366f1;
                    }
                    .shift-time-display {
                        font-size: 12px;
                        color: var(--text-muted);
                        font-weight: 500;
                    }

                    /* Employee Drop Zone */
                    .employee-drop-zone {
                        min-height: 50px;
                        border: 2px dashed var(--border-color);
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: all 0.2s;
                        padding: 8px;
                    }
                    .employee-drop-zone:hover {
                        border-color: var(--accent-primary);
                        background: rgba(99, 102, 241, 0.05);
                    }
                    .employee-drop-zone.drag-over {
                        border-color: var(--accent-primary);
                        background: rgba(99, 102, 241, 0.1);
                        border-style: solid;
                    }
                    .employee-drop-zone.empty {
                        color: var(--text-muted);
                        font-size: 13px;
                    }
                    .employee-drop-zone.empty i {
                        margin-right: 6px;
                    }

                    /* Assigned Employee Card */
                    .assigned-employee {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 8px 12px;
                        background: var(--bg-secondary);
                        border-radius: 10px;
                        width: 100%;
                        cursor: grab;
                        transition: all 0.2s;
                        position: relative;
                    }
                    .assigned-employee:hover {
                        background: var(--bg-hover);
                        transform: translateY(-1px);
                    }
                    .assigned-employee:active {
                        cursor: grabbing;
                    }
                    .assigned-employee.dragging {
                        opacity: 0.5;
                        transform: scale(0.98);
                    }
                    .assigned-employee-avatar {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 13px;
                        font-weight: 600;
                        color: white;
                        flex-shrink: 0;
                    }
                    .assigned-employee-info {
                        flex: 1;
                        min-width: 0;
                    }
                    .assigned-employee-name {
                        font-size: 14px;
                        font-weight: 600;
                        color: var(--text-primary);
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .assigned-employee-hours {
                        font-size: 12px;
                        color: var(--text-muted);
                    }
                    .assigned-employee-remove {
                        position: absolute;
                        top: -6px;
                        right: -6px;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: var(--danger);
                        color: white;
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                        opacity: 0;
                        transition: opacity 0.2s;
                    }
                    .assigned-employee:hover .assigned-employee-remove {
                        opacity: 1;
                    }
                    .assigned-employee-clone {
                        position: absolute;
                        top: -6px;
                        right: 18px;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: #6366f1;
                        color: white;
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 9px;
                        opacity: 0;
                        transition: opacity 0.2s;
                    }
                    .assigned-employee:hover .assigned-employee-clone {
                        opacity: 1;
                    }
                    .assigned-employee-clone:hover {
                        background: #4f46e5;
                        transform: scale(1.1);
                    }

                    /* Multi-employee shift slot */
                    .employee-drop-zone.multi-employee {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        padding: 10px;
                    }
                    .employee-drop-zone.multi-employee .assigned-employee {
                        margin-bottom: 0;
                    }
                    .add-more-employee {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 8px;
                        border: 2px dashed var(--border-color);
                        border-radius: 8px;
                        color: var(--text-muted);
                        cursor: pointer;
                        transition: all 0.2s;
                        font-size: 14px;
                    }
                    .add-more-employee:hover {
                        border-color: var(--accent-primary);
                        color: var(--accent-primary);
                        background: var(--bg-hover);
                    }

                    /* Days Off Section */
                    .day-off-section {
                        margin-top: 12px;
                        border-top: 1px solid var(--border-color);
                        padding-top: 12px;
                    }
                    .day-off-header {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 8px 12px;
                        background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(79, 70, 229, 0.05) 100%);
                        border-radius: 8px;
                        font-size: 12px;
                        font-weight: 600;
                        color: var(--text-secondary);
                        cursor: pointer;
                        transition: all 0.2s;
                        border: 1px solid rgba(99, 102, 241, 0.15);
                    }
                    .day-off-header:hover {
                        background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(79, 70, 229, 0.08) 100%);
                        border-color: var(--accent-primary);
                    }
                    .day-off-employees {
                        margin-top: 8px;
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                    }
                    .day-off-employee-badge {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 6px 10px;
                        background: var(--bg-secondary);
                        border-radius: 8px;
                        font-size: 13px;
                        position: relative;
                        transition: all 0.2s;
                    }
                    .day-off-employee-badge:hover {
                        background: var(--bg-hover);
                    }
                    .day-off-avatar {
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 11px;
                        font-weight: 600;
                        color: white;
                        flex-shrink: 0;
                    }
                    .day-off-name {
                        flex: 1;
                        color: var(--text-primary);
                        font-weight: 500;
                        font-size: 12px;
                    }
                    .day-off-remove {
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        background: var(--danger);
                        color: white;
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 9px;
                        opacity: 0;
                        transition: opacity 0.2s;
                    }
                    .day-off-employee-badge:hover .day-off-remove {
                        opacity: 1;
                    }
                    .day-off-remove:hover {
                        background: #dc2626;
                        transform: scale(1.1);
                    }
                    .day-off-empty {
                        padding: 12px;
                        text-align: center;
                        color: var(--text-muted);
                        font-size: 12px;
                        font-style: italic;
                    }

                    /* Employee Picker Modal */
                    .employee-picker-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.5);
                        backdrop-filter: blur(4px);
                        z-index: 1000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        opacity: 0;
                        visibility: hidden;
                        transition: all 0.3s;
                    }
                    .employee-picker-overlay.active {
                        opacity: 1;
                        visibility: visible;
                    }
                    .employee-picker {
                        background: var(--bg-card);
                        border-radius: 20px;
                        width: 90%;
                        max-width: 400px;
                        max-height: 80vh;
                        overflow: hidden;
                        transform: scale(0.9);
                        transition: transform 0.3s;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    }
                    .employee-picker-overlay.active .employee-picker {
                        transform: scale(1);
                    }
                    .employee-picker-header {
                        padding: 20px;
                        border-bottom: 1px solid var(--border-color);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .employee-picker-header h3 {
                        font-size: 18px;
                        font-weight: 600;
                    }
                    .employee-picker-close {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        background: var(--bg-secondary);
                        border: none;
                        cursor: pointer;
                        color: var(--text-secondary);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    }
                    .employee-picker-close:hover {
                        background: var(--danger);
                        color: white;
                    }
                    .employee-picker-search {
                        padding: 16px 20px;
                        border-bottom: 1px solid var(--border-color);
                    }
                    .employee-picker-search input {
                        width: 100%;
                        padding: 12px 16px;
                        border-radius: 10px;
                        border: 1px solid var(--border-color);
                        background: var(--bg-secondary);
                        color: var(--text-primary);
                        font-size: 14px;
                    }
                    .employee-picker-search input:focus {
                        outline: none;
                        border-color: var(--accent-primary);
                    }
                    .employee-picker-list {
                        padding: 12px;
                        max-height: 400px;
                        overflow-y: auto;
                    }
                    .employee-picker-item {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px;
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .employee-picker-item:hover {
                        background: var(--bg-hover);
                    }
                    .employee-picker-avatar {
                        width: 44px;
                        height: 44px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        font-weight: 600;
                        color: white;
                    }
                    .employee-picker-info {
                        flex: 1;
                    }
                    .employee-picker-name {
                        font-weight: 600;
                        font-size: 15px;
                    }
                    .employee-picker-store {
                        font-size: 13px;
                        color: var(--text-muted);
                    }

                    /* Multi-select toggle */
                    .multi-select-toggle {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-top: 12px;
                        cursor: pointer;
                        font-size: 13px;
                        color: var(--text-secondary);
                    }
                    .multi-select-toggle input[type="checkbox"] {
                        width: 18px;
                        height: 18px;
                        accent-color: var(--accent-primary);
                        cursor: pointer;
                    }
                    .employee-picker-footer {
                        padding: 16px 20px;
                        border-top: 1px solid var(--border-color);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: var(--bg-secondary);
                        border-radius: 0 0 20px 20px;
                    }
                    .employee-picker-footer #selectedCount {
                        font-size: 14px;
                        color: var(--text-secondary);
                        font-weight: 500;
                    }
                    .assign-selected-btn {
                        padding: 10px 20px;
                        background: #6366f1;
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        transition: all 0.2s;
                    }
                    .assign-selected-btn:hover {
                        background: #4f46e5;
                        transform: translateY(-1px);
                    }
                    .assign-selected-btn:disabled {
                        background: var(--text-muted);
                        cursor: not-allowed;
                        transform: none;
                    }
                    .employee-picker-item.multi-select {
                        position: relative;
                    }
                    .employee-picker-item .select-checkbox {
                        width: 22px;
                        height: 22px;
                        border-radius: 6px;
                        border: 2px solid var(--border-color);
                        background: var(--bg-primary);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                        flex-shrink: 0;
                    }
                    .employee-picker-item .select-checkbox i {
                        display: none;
                        color: white;
                        font-size: 12px;
                    }
                    .employee-picker-item.selected .select-checkbox {
                        background: #6366f1;
                        border-color: #6366f1;
                    }
                    .employee-picker-item.selected .select-checkbox i {
                        display: block;
                    }

                    /* Time Editor Modal */
                    .time-editor-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.6);
                        backdrop-filter: blur(8px);
                        z-index: 1001;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        opacity: 0;
                        visibility: hidden;
                        transition: all 0.3s;
                    }
                    .time-editor-overlay.active {
                        opacity: 1;
                        visibility: visible;
                    }
                    .time-editor-modal {
                        background: var(--bg-card);
                        border-radius: 24px;
                        width: 90%;
                        max-width: 480px;
                        overflow: hidden;
                        transform: scale(0.9) translateY(20px);
                        transition: transform 0.3s;
                        box-shadow: 0 25px 80px rgba(0,0,0,0.4);
                    }
                    .time-editor-overlay.active .time-editor-modal {
                        transform: scale(1) translateY(0);
                    }
                    .time-editor-header {
                        padding: 24px;
                        border-bottom: 1px solid var(--border-color);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .time-editor-header h3 {
                        font-size: 20px;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .time-editor-close {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: var(--bg-secondary);
                        border: none;
                        cursor: pointer;
                        color: var(--text-secondary);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        transition: all 0.2s;
                    }
                    .time-editor-close:hover {
                        background: var(--danger);
                        color: white;
                    }
                    .time-editor-body {
                        padding: 24px;
                    }
                    .time-editor-info {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        padding: 16px;
                        background: var(--bg-secondary);
                        border-radius: 16px;
                        margin-bottom: 24px;
                    }
                    .time-editor-avatar {
                        width: 56px;
                        height: 56px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 20px;
                        font-weight: 700;
                        color: white;
                    }
                    .time-editor-details h4 {
                        font-size: 18px;
                        font-weight: 600;
                        margin-bottom: 4px;
                    }
                    .time-editor-details p {
                        font-size: 14px;
                        color: var(--text-muted);
                    }
                    .time-editor-current {
                        text-align: center;
                        margin-bottom: 24px;
                    }
                    .time-editor-current-label {
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: var(--text-muted);
                        margin-bottom: 8px;
                    }
                    .time-editor-current-value {
                        font-size: 32px;
                        font-weight: 700;
                        color: var(--text-primary);
                    }
                    .time-editor-current-hours {
                        font-size: 14px;
                        color: var(--accent-primary);
                        margin-top: 4px;
                    }
                    .time-editor-slider-section {
                        margin-bottom: 24px;
                    }
                    .time-editor-slider-label {
                        font-size: 13px;
                        font-weight: 600;
                        color: var(--text-secondary);
                        margin-bottom: 12px;
                        display: flex;
                        justify-content: space-between;
                    }
                    .time-editor-slider-track {
                        position: relative;
                        height: 56px;
                        background: var(--bg-secondary);
                        border-radius: 12px;
                        border: 2px solid var(--border-color);
                        overflow: hidden;
                        margin-bottom: 8px;
                    }
                    .time-editor-slider-track:hover {
                        border-color: var(--accent-primary);
                    }
                    .time-editor-slider-range {
                        position: absolute;
                        top: 4px;
                        bottom: 4px;
                        border-radius: 8px;
                        cursor: grab;
                        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    }
                    .time-editor-slider-range:active {
                        cursor: grabbing;
                    }
                    .time-editor-slider-range.opening {
                        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    }
                    .time-editor-slider-range.closing {
                        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    }
                    .time-editor-handle {
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 24px;
                        height: 44px;
                        background: white;
                        border-radius: 8px;
                        cursor: ew-resize;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: box-shadow 0.2s;
                    }
                    .time-editor-handle:hover {
                        box-shadow: 0 6px 20px rgba(0,0,0,0.4);
                    }
                    .time-editor-handle::after {
                        content: '';
                        width: 6px;
                        height: 20px;
                        background: linear-gradient(180deg, var(--border-color) 0%, var(--border-color) 33%, transparent 33%, transparent 66%, var(--border-color) 66%);
                        border-radius: 3px;
                    }
                    .time-editor-handle.start {
                        left: -12px;
                    }
                    .time-editor-handle.end {
                        right: -12px;
                    }
                    .time-editor-hours-ruler {
                        display: flex;
                        justify-content: space-between;
                        padding: 0 4px;
                    }
                    .time-editor-hours-ruler span {
                        font-size: 11px;
                        color: var(--text-muted);
                        font-weight: 500;
                    }
                    .time-editor-presets {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 10px;
                        margin-bottom: 24px;
                    }
                    .time-editor-preset {
                        padding: 12px;
                        border: 2px solid var(--border-color);
                        border-radius: 12px;
                        background: var(--bg-secondary);
                        cursor: pointer;
                        text-align: center;
                        transition: all 0.2s;
                    }
                    .time-editor-preset:hover {
                        border-color: var(--accent-primary);
                        background: rgba(99, 102, 241, 0.1);
                    }
                    .time-editor-preset.active {
                        border-color: var(--accent-primary);
                        background: rgba(99, 102, 241, 0.15);
                    }
                    .time-editor-preset-time {
                        font-size: 14px;
                        font-weight: 700;
                        color: var(--text-primary);
                    }
                    .time-editor-preset-label {
                        font-size: 11px;
                        color: var(--text-muted);
                        margin-top: 2px;
                    }
                    .time-editor-footer {
                        padding: 20px 24px;
                        border-top: 1px solid var(--border-color);
                        display: flex;
                        gap: 12px;
                    }
                    .time-editor-btn {
                        flex: 1;
                        padding: 14px 20px;
                        border-radius: 12px;
                        border: none;
                        cursor: pointer;
                        font-size: 15px;
                        font-weight: 600;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    }
                    .time-editor-btn.cancel {
                        background: var(--bg-secondary);
                        color: var(--text-secondary);
                        border: 1px solid var(--border-color);
                    }
                    .time-editor-btn.cancel:hover {
                        background: var(--bg-hover);
                    }
                    .time-editor-btn.save {
                        background: #6366f1;
                        color: white;
                    }
                    .time-editor-btn.save:hover {
                        background: #4f46e5;
                        transform: translateY(-1px);
                    }
                    .time-editor-btn.delete {
                        background: transparent;
                        color: var(--danger);
                        flex: 0;
                        padding: 14px;
                    }
                    .time-editor-btn.delete:hover {
                        background: rgba(239, 68, 68, 0.1);
                    }

                    /* Clone Modal */
                    .clone-modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.6);
                        backdrop-filter: blur(8px);
                        z-index: 1001;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        opacity: 0;
                        visibility: hidden;
                        transition: all 0.3s;
                    }
                    .clone-modal-overlay.active {
                        opacity: 1;
                        visibility: visible;
                    }
                    .clone-modal {
                        background: var(--bg-card);
                        border-radius: 20px;
                        width: 90%;
                        max-width: 400px;
                        overflow: hidden;
                        transform: scale(0.9);
                        transition: transform 0.3s;
                        box-shadow: 0 25px 80px rgba(0,0,0,0.4);
                    }
                    .clone-modal-overlay.active .clone-modal {
                        transform: scale(1);
                    }
                    .clone-modal-header {
                        padding: 20px 24px;
                        border-bottom: 1px solid var(--border-color);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .clone-modal-header h3 {
                        font-size: 18px;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .clone-modal-body {
                        padding: 24px;
                    }
                    .clone-option {
                        padding: 16px;
                        border: 2px solid var(--border-color);
                        border-radius: 12px;
                        margin-bottom: 12px;
                        cursor: pointer;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 14px;
                    }
                    .clone-option:hover {
                        border-color: var(--accent-primary);
                        background: rgba(99, 102, 241, 0.05);
                    }
                    .clone-option-icon {
                        width: 44px;
                        height: 44px;
                        border-radius: 10px;
                        background: var(--bg-secondary);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                        color: var(--accent-primary);
                    }
                    .clone-option-info h4 {
                        font-size: 15px;
                        font-weight: 600;
                        margin-bottom: 2px;
                    }
                    .clone-option-info p {
                        font-size: 13px;
                        color: var(--text-muted);
                    }
                    .clone-modal-footer {
                        padding: 16px 24px;
                        border-top: 1px solid var(--border-color);
                        display: flex;
                        justify-content: flex-end;
                    }

                    /* All Stores View */
                    .stores-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                        gap: 20px;
                        margin-top: 20px;
                    }
                    .store-schedule-card {
                        background: var(--bg-card);
                        border-radius: 16px;
                        border: 1px solid var(--border-color);
                        overflow: hidden;
                    }
                    .store-schedule-header {
                        padding: 16px 20px;
                        background: var(--bg-secondary);
                        border-bottom: 1px solid var(--border-color);
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }
                    .store-schedule-header h4 {
                        font-size: 16px;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .store-schedule-header .store-icon {
                        width: 32px;
                        height: 32px;
                        border-radius: 8px;
                        background: var(--accent-gradient);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 14px;
                    }
                    .store-schedule-body {
                        padding: 12px;
                    }
                    .store-day-row {
                        display: flex;
                        align-items: stretch;
                        gap: 8px;
                        padding: 8px 0;
                        border-bottom: 1px solid var(--border-color);
                    }
                    .store-day-row:last-child {
                        border-bottom: none;
                    }
                    .store-day-label {
                        width: 60px;
                        font-size: 11px;
                        font-weight: 600;
                        color: var(--text-muted);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        white-space: nowrap;
                    }
                    .store-day-label.today {
                        color: var(--accent-primary);
                    }
                    .store-shifts {
                        flex: 1;
                        display: flex;
                        gap: 6px;
                    }
                    .store-shift-slot {
                        flex: 1;
                        min-height: 40px;
                        border-radius: 8px;
                        padding: 6px 8px;
                        font-size: 11px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .store-shift-slot.opening {
                        background: rgba(245, 158, 11, 0.1);
                        border: 1px solid rgba(245, 158, 11, 0.2);
                    }
                    .store-shift-slot.closing {
                        background: rgba(99, 102, 241, 0.1);
                        border: 1px solid rgba(99, 102, 241, 0.2);
                    }
                    .store-shift-slot.empty {
                        background: var(--bg-secondary);
                        border: 1px dashed var(--border-color);
                        align-items: center;
                        color: var(--text-muted);
                    }
                    .store-shift-slot:hover {
                        transform: scale(1.02);
                    }
                    .store-shift-slot.filled {
                        cursor: grab;
                        position: relative;
                    }
                    .store-shift-slot.filled:active {
                        cursor: grabbing;
                    }
                    .store-shift-name {
                        font-weight: 600;
                        color: var(--text-primary);
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .store-shift-time {
                        color: var(--text-muted);
                        font-size: 10px;
                    }
                    .store-shift-clone {
                        position: absolute;
                        top: 2px;
                        right: 2px;
                        width: 18px;
                        height: 18px;
                        border-radius: 4px;
                        background: rgba(255,255,255,0.9);
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 9px;
                        color: var(--accent-primary);
                        opacity: 0;
                        transition: opacity 0.2s;
                    }
                    .store-shift-slot:hover .store-shift-clone {
                        opacity: 1;
                    }
                    .store-shift-clone:hover {
                        background: var(--accent-primary);
                        color: white;
                    }
                    .store-shift-delete {
                        position: absolute;
                        top: 2px;
                        right: 22px;
                        width: 18px;
                        height: 18px;
                        border-radius: 4px;
                        background: rgba(255,255,255,0.9);
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 9px;
                        color: #ef4444;
                        opacity: 0;
                        transition: opacity 0.2s;
                    }
                    .store-shift-slot:hover .store-shift-delete {
                        opacity: 1;
                    }
                    .store-shift-delete:hover {
                        background: #ef4444;
                        color: white;
                    }
                    /* Multi-employee slot styles */
                    .store-shift-slot.multi-employee {
                        background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.1)) !important;
                        border: 1px solid rgba(139, 92, 246, 0.3) !important;
                        padding: 4px;
                        gap: 4px;
                    }
                    .store-shift-employee {
                        background: transparent;
                        padding: 2px 8px;
                        padding-right: 48px;
                        cursor: pointer;
                        position: relative;
                        transition: all 0.2s;
                    }
                    .store-shift-employee:hover {
                        background: rgba(0,0,0,0.03);
                    }
                    .store-shift-employee .store-shift-clone {
                        position: absolute;
                        top: 50%;
                        right: 24px;
                        transform: translateY(-50%);
                        width: 16px;
                        height: 16px;
                        font-size: 8px;
                    }
                    .store-shift-employee .store-shift-delete {
                        position: absolute;
                        top: 50%;
                        right: 4px;
                        transform: translateY(-50%);
                        width: 16px;
                        height: 16px;
                        font-size: 8px;
                    }
                    .store-shift-employee:hover .store-shift-clone,
                    .store-shift-employee:hover .store-shift-delete {
                        opacity: 1;
                    }
                    .store-shift-add-more {
                        width: 100%;
                        padding: 4px;
                        border: 1px dashed rgba(139, 92, 246, 0.4);
                        border-radius: 6px;
                        background: transparent;
                        color: #8b5cf6;
                        cursor: pointer;
                        font-size: 10px;
                        transition: all 0.2s;
                        margin-top: 2px;
                    }
                    .store-shift-add-more:hover {
                        background: rgba(139, 92, 246, 0.1);
                        border-color: #8b5cf6;
                    }

                    /* Hours Summary Panel for Manager */
                    .hours-summary-panel {
                        width: 280px;
                        flex-shrink: 0;
                        background: var(--bg-card);
                        border-radius: 16px;
                        border: 1px solid var(--border-color);
                        height: fit-content;
                        position: sticky;
                        top: 20px;
                        max-height: calc(100vh - 200px);
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                    }
                    .hours-panel-header {
                        padding: 16px 20px;
                        border-bottom: 1px solid var(--border-color);
                        background: var(--bg-secondary);
                    }
                    .hours-panel-header h3 {
                        font-size: 15px;
                        font-weight: 700;
                        color: white;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin: 0;
                    }
                    .hours-panel-header p {
                        font-size: 12px;
                        color: rgba(255,255,255,0.8);
                        margin: 4px 0 0 0;
                    }
                    .hours-panel-list {
                        flex: 1;
                        overflow-y: auto;
                        padding: 12px;
                    }
                    .hours-employee-item {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 10px 12px;
                        border-radius: 10px;
                        margin-bottom: 6px;
                        transition: all 0.2s;
                        background: var(--bg-secondary);
                        border: 1px solid transparent;
                    }
                    .hours-employee-item:hover {
                        background: var(--bg-hover);
                        border-color: var(--border-color);
                    }
                    .hours-employee-item:last-child {
                        margin-bottom: 0;
                    }
                    .hours-employee-avatar {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 13px;
                        font-weight: 600;
                        color: white;
                        flex-shrink: 0;
                    }
                    .hours-employee-info {
                        flex: 1;
                        min-width: 0;
                    }
                    .hours-employee-name {
                        font-size: 13px;
                        font-weight: 600;
                        color: var(--text-primary);
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .hours-employee-store {
                        font-size: 11px;
                        color: var(--text-muted);
                    }
                    .hours-badge {
                        font-size: 14px;
                        font-weight: 700;
                        padding: 6px 10px;
                        border-radius: 8px;
                        background: rgba(99, 102, 241, 0.1);
                        color: #6366f1;
                        white-space: nowrap;
                    }
                    .hours-badge.high {
                        background: rgba(99, 102, 241, 0.1);
                        color: #6366f1;
                    }
                    .hours-badge.low {
                        background: rgba(245, 158, 11, 0.1);
                        color: #f59e0b;
                    }
                    .hours-badge.zero {
                        background: rgba(239, 68, 68, 0.1);
                        color: #ef4444;
                    }
                    .hours-badges-container {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-end;
                        gap: 4px;
                    }
                    .hours-badge-scheduled {
                        font-size: 11px;
                        font-weight: 500;
                        padding: 2px 6px;
                        border-radius: 4px;
                        background: rgba(148, 163, 184, 0.15);
                        color: var(--text-muted);
                        white-space: nowrap;
                    }
                    .hours-badge-scheduled::before {
                        content: 'Sched: ';
                        font-weight: 400;
                    }
                    .hours-total-row {
                        padding: 12px 16px;
                        border-top: 1px solid var(--border-color);
                        background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(79, 70, 229, 0.05) 100%);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .hours-total-label {
                        font-size: 13px;
                        font-weight: 600;
                        color: var(--text-secondary);
                    }
                    .hours-total-value {
                        font-size: 18px;
                        font-weight: 700;
                        color: var(--accent-primary);
                    }
                    .hours-panel-empty {
                        padding: 40px 20px;
                        text-align: center;
                        color: var(--text-muted);
                    }
                    .hours-panel-empty i {
                        font-size: 32px;
                        margin-bottom: 12px;
                        opacity: 0.5;
                    }
                    .hours-panel-empty p {
                        font-size: 13px;
                        margin: 0;
                    }

                    /* Responsive for Manager Schedule */
                    @media (max-width: 1024px) {
                        .manager-schedule-layout {
                            flex-direction: column;
                        }
                        .hours-summary-panel {
                            width: 100%;
                            position: relative;
                            top: 0;
                            max-height: 400px;
                            order: -1;
                            margin-bottom: 16px;
                        }
                    }
                    @media (max-width: 768px) {
                        .schedule-day-card {
                            flex: 0 0 280px;
                            min-width: 280px;
                        }
                        .hours-summary-panel {
                            max-height: 300px;
                        }
                        .hours-panel-list {
                            padding: 8px;
                        }
                        .hours-employee-item {
                            padding: 8px 10px;
                        }
                        .hours-employee-avatar {
                            width: 32px;
                            height: 32px;
                            font-size: 11px;
                        }
                        .hours-employee-name {
                            font-size: 12px;
                        }
                        .hours-badge {
                            font-size: 12px;
                            padding: 4px 8px;
                        }
                        .hours-badges-container {
                            gap: 2px;
                        }
                        .hours-badge-scheduled {
                            font-size: 10px;
                            padding: 2px 4px;
                        }
                        .stores-grid {
                            grid-template-columns: 1fr !important;
                            gap: 16px;
                        }
                    }
                </style>

                <div class="manager-schedule-header">
                    <div class="manager-schedule-title">
                        <h2>
                            <i class="fas fa-calendar-check"></i>Manager View Schedule
                            <span class="manager-badge"><i class="fas fa-shield-alt"></i> Manager Only</span>
                        </h2>
                        <p>Full schedule management with multi-employee shifts</p>
                    </div>
                    <div class="manager-controls">
                        <div class="manager-week-nav">
                            <button class="manager-nav-btn" onclick="changeWeek(-1)" title="Previous week">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <div class="manager-week-display">${weekRangeText}</div>
                            <button class="manager-nav-btn" onclick="changeWeek(1)" title="Next week">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                            <button class="manager-nav-btn" onclick="goToToday()" title="Today">
                                <i class="fas fa-calendar-day"></i>
                            </button>
                        </div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="manager-nav-btn" onclick="openCloneModal()" title="Clone from previous week" style="background: var(--bg-card); border: 1px solid rgba(99, 102, 241, 0.3);">
                                <i class="fas fa-clone"></i>
                            </button>
                            <a href="schedule.html" target="_blank" class="manager-nav-btn" title="Share public schedule" style="background: var(--accent-gradient); color: white; text-decoration: none; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-share-alt"></i>
                            </a>
                            <select class="manager-store-select" id="schedule-store-filter" onchange="renderManagerScheduleGrid()">
                                <option value="all">All Stores</option>
                                <option value="all-employees">All Employees</option>
                                <option value="employees">Employees Hours</option>
                                <option value="Miramar">VSU Miramar</option>
                                <option value="Morena">VSU Morena</option>
                                <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                <option value="Chula Vista">VSU Chula Vista</option>
                                <option value="North Park">VSU North Park</option>
                                <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                            </select>
                            <select class="manager-store-select" id="schedule-employee-filter" onchange="renderManagerScheduleGrid()" style="min-width: 180px;">
                                <option value="">-- By Employee --</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="multi-employee-info">
                    <i class="fas fa-users"></i>
                    <div class="multi-employee-info-text">
                        <h4>Multi-Employee Shifts Enabled</h4>
                        <p>Click on any shift slot and enable "Multi-select" to assign multiple employees to the same shift (e.g., Giselle and Lauren opening Miramar on Friday).</p>
                    </div>
                </div>

                <div class="manager-schedule-layout">
                    <div class="manager-schedule-main">
                        <div id="schedule-container">
                            <div style="padding: 60px; text-align: center;">
                                <div class="loading-spinner"></div>
                                <p style="color: var(--text-muted); margin-top: 15px;">Loading schedules...</p>
                            </div>
                        </div>
                    </div>
                    <div class="hours-summary-panel" id="hoursSummaryPanel">
                        <div class="hours-panel-header" style="background: var(--accent-gradient);">
                            <h3><i class="fas fa-clock"></i> Hours This Week</h3>
                            <p id="hoursPanelWeekRange">${weekRangeText}</p>
                            <p style="font-size: 10px; margin-top: 4px; opacity: 0.8;"><i class="fas fa-info-circle"></i> Click employee for Time Card</p>
                        </div>
                        <div class="hours-panel-list" id="hoursPanelList">
                            <div class="hours-panel-empty">
                                <i class="fas fa-user-clock"></i>
                                <p>Loading employee hours...</p>
                            </div>
                        </div>
                        <div class="hours-total-row">
                            <span class="hours-total-label">Total Hours</span>
                            <span class="hours-total-value" id="hoursTotalValue">0h</span>
                        </div>
                    </div>
                </div>

                <!-- Employee Picker Modal -->
                <div class="employee-picker-overlay" id="employeePickerOverlay" onmousedown="closeEmployeePicker(event)">
                    <div class="employee-picker" onclick="event.stopPropagation()">
                        <div class="employee-picker-header" style="background: var(--accent-gradient);">
                            <h3><i class="fas fa-user-plus" style="margin-right: 8px;"></i>Assign Employee(s)</h3>
                            <button class="employee-picker-close" onclick="closeEmployeePicker()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="employee-picker-search">
                            <input type="text" id="employeePickerSearch" placeholder="Search employee..." oninput="filterEmployeePicker()">
                            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 10px; padding: 10px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.1)); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2);">
                                <i class="fas fa-users" style="color: var(--accent-primary); margin-right: 6px;"></i>
                                <strong>You can add multiple employees!</strong><br>
                                <span style="font-size: 11px; color: var(--text-muted);">Just click on each employee you want to assign to this shift.</span>
                            </div>
                        </div>
                        <div class="employee-picker-list" id="employeePickerList">
                            <!-- Employees will be loaded here -->
                        </div>
                        <div class="employee-picker-footer" id="employeePickerFooter" style="display: none;">
                            <span id="selectedCount">0 selected</span>
                            <button class="assign-selected-btn" onclick="assignSelectedEmployees()" style="background: var(--accent-gradient);">
                                <i class="fas fa-check"></i> Assign Selected
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Time Editor Modal -->
                <div class="time-editor-overlay" id="timeEditorOverlay" onmousedown="closeTimeEditor(event)">
                    <div class="time-editor-modal" onclick="event.stopPropagation()">
                        <div class="time-editor-header">
                            <h3 id="timeEditorTitle"><i class="fas fa-clock"></i> Edit Shift</h3>
                            <button class="time-editor-close" onclick="closeTimeEditor()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="time-editor-body">
                            <div class="time-editor-info" id="timeEditorInfo">
                                <!-- Employee info will be loaded here -->
                            </div>
                            <div class="time-editor-current">
                                <div class="time-editor-current-label">Current Schedule</div>
                                <div class="time-editor-current-value" id="timeEditorCurrentValue">9:00a - 5:00p</div>
                                <div class="time-editor-current-hours" id="timeEditorCurrentHours">8.0 hours</div>
                            </div>
                            <div class="time-editor-presets">
                                <div class="time-editor-preset" onclick="setTimeEditorPreset('08:45', '16:00')">
                                    <div class="time-editor-preset-time">8:45a - 4p</div>
                                    <div class="time-editor-preset-label">Morning</div>
                                </div>
                                <div class="time-editor-preset" onclick="setTimeEditorPreset('09:45', '16:00')">
                                    <div class="time-editor-preset-time">9:45a - 4p</div>
                                    <div class="time-editor-preset-label">Mid AM</div>
                                </div>
                                <div class="time-editor-preset" onclick="setTimeEditorPreset('08:45', '17:00')">
                                    <div class="time-editor-preset-time">8:45a - 5p</div>
                                    <div class="time-editor-preset-label">Full Day</div>
                                </div>
                                <div class="time-editor-preset" onclick="setTimeEditorPreset('16:00', '22:30')">
                                    <div class="time-editor-preset-time">4p - 10:30p</div>
                                    <div class="time-editor-preset-label">Evening</div>
                                </div>
                                <div class="time-editor-preset" onclick="setTimeEditorPreset('17:00', '23:30')">
                                    <div class="time-editor-preset-time">5p - 11:30p</div>
                                    <div class="time-editor-preset-label">Closing</div>
                                </div>
                                <div class="time-editor-preset" onclick="setTimeEditorPreset('18:00', '23:30')">
                                    <div class="time-editor-preset-time">6p - 11:30p</div>
                                    <div class="time-editor-preset-label">Night</div>
                                </div>
                            </div>
                            <div class="time-editor-slider-section">
                                <div class="time-editor-slider-label">
                                    <span>Drag to adjust</span>
                                </div>
                                <div class="time-editor-slider-track" id="timeEditorTrack">
                                    <div class="time-editor-slider-range" id="timeEditorRange">
                                        <div class="time-editor-handle start" id="timeEditorHandleStart"></div>
                                        <div class="time-editor-handle end" id="timeEditorHandleEnd"></div>
                                    </div>
                                </div>
                                <div class="time-editor-hours-ruler">
                                    <span>6am</span>
                                    <span>9am</span>
                                    <span>12pm</span>
                                    <span>3pm</span>
                                    <span>6pm</span>
                                    <span>9pm</span>
                                    <span>12am</span>
                                </div>
                            </div>
                        </div>
                        <div class="time-editor-footer">
                            <button class="time-editor-btn delete" onclick="deleteFromTimeEditor()" title="Remove shift">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="time-editor-btn add-employee" onclick="addAnotherEmployeeFromEditor()" title="Add New Turn" style="background: linear-gradient(135deg, #f97316, #ea580c); color: white;">
                                <i class="fas fa-user-plus"></i> Add New Turn
                            </button>
                            <button class="time-editor-btn save" onclick="saveTimeEditor()" style="background: var(--accent-gradient);">
                                <i class="fas fa-check"></i> Save
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Clone Modal -->
                <div class="clone-modal-overlay" id="cloneModalOverlay" onmousedown="closeCloneModal(event)">
                    <div class="clone-modal" onclick="event.stopPropagation()">
                        <div class="clone-modal-header" style="background: var(--accent-gradient);">
                            <h3><i class="fas fa-clone"></i> Clone Schedule</h3>
                            <button class="time-editor-close" onclick="closeCloneModal()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="clone-modal-body">
                            <div class="clone-option" onclick="cloneFromPreviousWeek()">
                                <div class="clone-option-icon" style="color: var(--accent-primary);">
                                    <i class="fas fa-history"></i>
                                </div>
                                <div class="clone-option-info">
                                    <h4>Clone Previous Week</h4>
                                    <p>Copy all shifts from last week to this week</p>
                                </div>
                            </div>
                            <div class="clone-option" onclick="cloneToNextWeek()">
                                <div class="clone-option-icon" style="color: var(--accent-primary);">
                                    <i class="fas fa-arrow-right"></i>
                                </div>
                                <div class="clone-option-info">
                                    <h4>Clone to Next Week</h4>
                                    <p>Copy this week's shifts to next week</p>
                                </div>
                            </div>
                            <div class="clone-option" onclick="clearCurrentWeek()">
                                <div class="clone-option-icon" style="color: var(--danger);">
                                    <i class="fas fa-trash-alt"></i>
                                </div>
                                <div class="clone-option-info">
                                    <h4>Clear This Week</h4>
                                    <p>Remove all shifts from current week</p>
                                </div>
                            </div>
                        </div>
                        <div class="clone-modal-footer">
                            <button class="time-editor-btn cancel" onclick="closeCloneModal()">Close</button>
                        </div>
                    </div>
                </div>
            `;
            loadManagerScheduleData();
        }

        async function loadManagerScheduleData() {
            const container = document.getElementById('schedule-container');
            if (!container) return;

            try {
                // Make sure employees are loaded first
                if (employees.length === 0) {
                    await loadEmployeesFromFirebase();
                }

                // Populate employee dropdown options
                populateEmployeeOptions();

                const db = firebase.firestore();

                // Load schedules
                const schedulesRef = db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules');
                const snapshot = await schedulesRef.get();

                schedules = [];
                snapshot.forEach(doc => {
                    schedules.push({ id: doc.id, ...doc.data() });
                });

                // Load days off
                const daysOffRef = db.collection(window.FIREBASE_COLLECTIONS.daysOff || 'daysOff');
                const daysOffSnapshot = await daysOffRef.get();

                daysOff = [];
                daysOffSnapshot.forEach(doc => {
                    daysOff.push({ id: doc.id, ...doc.data() });
                });

                renderManagerScheduleGrid();
            } catch (error) {
                console.error('Error loading schedules:', error);
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--warning); margin-bottom: 20px;"></i>
                        <h2 style="color: var(--text-secondary); margin-bottom: 10px;">Connection Error</h2>
                        <p style="color: var(--text-muted);">Unable to load schedule data.</p>
                        <button class="btn-primary" style="margin-top: 20px; background: var(--accent-gradient);" onclick="loadManagerScheduleData()"><i class="fas fa-sync"></i> Retry</button>
                    </div>
                `;
            }
        }

        function renderManagerScheduleGrid() {
            // Uses the same grid rendering as renderScheduleGrid
            // This allows reusing all existing schedule functionality
            renderScheduleGrid();

            // Update hours panel header color for manager view
            const hoursPanelHeader = document.querySelector('.hours-panel-header');
            if (hoursPanelHeader) {
                hoursPanelHeader.style.background = 'var(--accent-gradient)';
            }
        }

