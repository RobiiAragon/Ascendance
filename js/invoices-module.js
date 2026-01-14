// =============================================================================
// GCONOMICS - Expense Planner
// =============================================================================

// Expense categories
var GCONOMICS_CATEGORIES = [
    { id: 'food', name: 'Food', icon: 'fa-utensils', color: '#f59e0b' },
    { id: 'home', name: 'Home', icon: 'fa-home', color: '#3b82f6' },
    { id: 'subscriptions', name: 'Subscriptions', icon: 'fa-credit-card', color: '#8b5cf6' },
    { id: 'health', name: 'Health', icon: 'fa-heart-pulse', color: '#ef4444' },
    { id: 'gifts', name: 'Gifts', icon: 'fa-gift', color: '#ec4899' },
    { id: 'other', name: 'Other', icon: 'fa-ellipsis', color: '#6b7280' }
];

// Gconomics state
var gconomicsState = {
    expenses: JSON.parse(localStorage.getItem('gconomicsExpenses')) || [],
    currentMonth: '2025-12', // December 2025
    selectedCategory: 'all',
    editingExpenseId: null
};

// Save expenses to localStorage
function saveGconomicsExpenses() {
    const expensesWithTimestamp = gconomicsState.expenses.map(exp => ({
        ...exp,
        updatedAt: exp.updatedAt || new Date().toISOString()
    }));
    localStorage.setItem('gconomicsExpenses', JSON.stringify(expensesWithTimestamp));
}

// Initialize Gconomics Firebase sync
async function initializeGconomicsFirebase(userId, userEmail) {
    if (!window.gconomicsFirebase) {
        console.warn('Gconomics Firebase module not loaded');
        return false;
    }

    // Guard against gconomicsState not yet initialized
    if (typeof gconomicsState === 'undefined' || !gconomicsState) {
        console.warn('Gconomics state not yet initialized');
        return false;
    }

    try {
        const initialized = await window.gconomicsFirebase.initialize();
        if (!initialized) return false;

        window.gconomicsFirebase.setCurrentUser(userId, userEmail);

        // Sync existing local expenses to Firebase
        if (gconomicsState.expenses && gconomicsState.expenses.length > 0) {
            await window.gconomicsFirebase.syncExpensesToFirestore(gconomicsState.expenses);
        }

        return true;
    } catch (error) {
        console.error('Error initializing Gconomics Firebase:', error);
        return false;
    }
}

// Load Gconomics expenses from Firebase
async function loadGconomicsFromFirebase() {
    if (!window.gconomicsFirebase) {
        console.warn('Gconomics Firebase module not available');
        return false;
    }

    // Guard against gconomicsState not yet initialized
    if (typeof gconomicsState === 'undefined' || !gconomicsState) {
        console.warn('Gconomics state not yet initialized');
        return false;
    }

    // Initialize Firebase if not already done
    if (!window.gconomicsFirebase.isInitialized) {
        const initialized = await window.gconomicsFirebase.initialize();
        if (!initialized) {
            console.warn('Failed to initialize Gconomics Firebase');
            return false;
        }
    }

    try {
        const firebaseExpenses = await window.gconomicsFirebase.loadExpensesFromFirestore();

        if (firebaseExpenses.length === 0) {
            console.log('No expenses found in Firebase');
            return true;
        }

        // Create a map of existing local expenses by ID
        const localMap = new Map((gconomicsState.expenses || []).map(e => [String(e.id), e]));

        // Merge Firebase expenses - Firebase takes priority for existing items
        firebaseExpenses.forEach(fbExp => {
            const expId = String(fbExp.id);
            const localExp = localMap.get(expId);

            if (!localExp) {
                // New expense from Firebase
                gconomicsState.expenses.push(fbExp);
            } else {
                // Update existing if Firebase is newer
                const fbDate = new Date(fbExp.updatedAt || fbExp.syncedAt?.toDate?.() || 0);
                const localDate = new Date(localExp.updatedAt || 0);
                if (fbDate > localDate) {
                    const index = gconomicsState.expenses.findIndex(e => String(e.id) === expId);
                    if (index > -1) {
                        gconomicsState.expenses[index] = { ...localExp, ...fbExp };
                    }
                }
            }
        });

        saveGconomicsExpenses();
        return true;
    } catch (error) {
        console.error('Error loading expenses from Firebase:', error);
        return false;
    }
}

// Get expense statistics from Firebase
async function getGconomicsStatsFromFirebase(monthString) {
    if (!window.gconomicsFirebase || !window.gconomicsFirebase.isInitialized) {
        console.warn('Gconomics Firebase not initialized');
        return null;
    }

    try {
        const stats = await window.gconomicsFirebase.getMonthlyStats(monthString);
        return stats;
    } catch (error) {
        console.error('Error getting Firebase stats:', error);
        return null;
    }
}

// Get expenses for current month
function getMonthlyExpenses(month = gconomicsState.currentMonth) {
    return gconomicsState.expenses.filter(exp => exp.date.startsWith(month));
}

// Get total for current month
function getMonthlyTotal(month = gconomicsState.currentMonth) {
    return getMonthlyExpenses(month).reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
}

// Get total by category for current month
function getCategoryTotals(month = gconomicsState.currentMonth) {
    const expenses = getMonthlyExpenses(month);
    const totals = {};
    GCONOMICS_CATEGORIES.forEach(cat => {
        totals[cat.id] = expenses
            .filter(exp => exp.category === cat.id)
            .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    });
    return totals;
}

// Get available months from expenses
function getAvailableMonths() {
    const months = new Set();
    gconomicsState.expenses.forEach(exp => {
        months.add(exp.date.slice(0, 7));
    });
    // Add current month if not present
    months.add(gconomicsState.currentMonth);
    return Array.from(months).sort().reverse();
}

// Render Gconomics page
async function renderGconomics() {
    const dashboard = document.querySelector('.dashboard');

    // Ensure Firebase is initialized for Gconomics
    if (window.gconomicsFirebase && !window.gconomicsFirebase.currentUser) {
        const user = JSON.parse(localStorage.getItem('ascendance_user') || '{}');
        if (user && (user.userId || user.id)) {
            try {
                await initializeGconomicsFirebase(user.userId || user.id, user.email);
                // Load expenses from Firebase after initialization
                await loadGconomicsFromFirebase();
            } catch (error) {
                console.warn('Failed to initialize Gconomics Firebase:', error);
            }
        }
    }

    const monthlyExpenses = getMonthlyExpenses();
    const monthlyTotal = getMonthlyTotal();
    const categoryTotals = getCategoryTotals();
    const availableMonths = getAvailableMonths();

    // Filter expenses by category if selected
    let displayExpenses = monthlyExpenses;
    if (gconomicsState.selectedCategory !== 'all') {
        displayExpenses = monthlyExpenses.filter(exp => exp.category === gconomicsState.selectedCategory);
    }

    // Sort by date descending
    displayExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    const currentMonthName = new Date(gconomicsState.currentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    dashboard.innerHTML = `
        <div class="page-header gconomics-page-header">
            <div class="page-header-left">
                <h2 class="section-title">
                    <i class="fas fa-wallet" style="color: var(--accent-primary);"></i>
                    Gconomics
                </h2>
                <p class="section-subtitle">Personal Expense Tracker</p>
            </div>
            <div class="page-header-right" style="display: flex; gap: 12px; align-items: center;">
                <select class="form-input" style="width: 160px;" onchange="changeGconomicsMonth(this.value)">
                    ${availableMonths.map(month => {
                        const [year, monthNum] = month.split('-');
                        const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
                        const displayMonth = date.toLocaleDateString('en-US', { month: 'short' });
                        const displayYear = date.getFullYear();
                        const label = `${displayMonth} ${displayYear}`;
                        return `<option value="${month}" ${month === gconomicsState.currentMonth ? 'selected' : ''}>${label}</option>`;
                    }).join('')}
                </select>
                <button class="btn-primary floating-add-btn" onclick="openAddExpenseModal()">
                    <i class="fas fa-plus"></i> New Expense
                </button>
            </div>
        </div>

        <!-- Monthly Summary Card -->
        <div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); color: white; overflow: hidden; position: relative;">
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 120px; height: 120px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
            <div class="card-body" style="padding: 32px; position: relative; z-index: 1;">
                <div class="gconomics-summary-content" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px;">
                    <div>
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">${currentMonthName}</div>
                        <div style="font-size: 42px; font-weight: 700;">${formatCurrencyGconomics(monthlyTotal)}</div>
                        <div style="font-size: 13px; opacity: 0.8; margin-top: 8px;">${displayExpenses.length} expense${displayExpenses.length !== 1 ? 's' : ''} this month</div>
                    </div>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        ${GCONOMICS_CATEGORIES.slice(0, 4).map(cat => {
                            const amount = categoryTotals[cat.id] || 0;
                            if (amount === 0) return '';
                            return `
                                <div style="background: rgba(255,255,255,0.15); padding: 12px 16px; border-radius: 12px; text-align: center; min-width: 80px;">
                                    <div style="font-size: 20px; margin-bottom: 4px;"><i class="fas ${cat.icon}"></i></div>
                                    <div style="font-size: 14px; font-weight: 600;">${formatCurrencyGconomics(amount)}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>

        <!-- Chart Section -->
        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-chart-pie"></i>
                    Spending Breakdown
                </h3>
            </div>
            <div class="card-body">
                ${monthlyTotal === 0 ? `
                    <div style="text-align: center; padding: 30px; color: var(--text-muted);">
                        <i class="fas fa-chart-pie" style="font-size: 40px; opacity: 0.3; margin-bottom: 12px; display: block;"></i>
                        <p>No expenses to display</p>
                    </div>
                ` : `
                    <div class="gconomics-chart-grid" style="display: grid; grid-template-columns: 200px 1fr; gap: 32px; align-items: center;">
                        <!-- Donut Chart -->
                        <div style="position: relative; width: 180px; height: 180px; margin: 0 auto;">
                            <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                                ${renderDonutChart(categoryTotals, monthlyTotal)}
                            </svg>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                                <div style="font-size: 10px; color: var(--text-muted);">Total</div>
                                <div style="font-size: 14px; font-weight: 700;">${formatCurrencyGconomics(monthlyTotal)}</div>
                            </div>
                        </div>
                        <!-- Legend with Bar Chart -->
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            ${GCONOMICS_CATEGORIES.map(cat => {
                                const amount = categoryTotals[cat.id] || 0;
                                if (amount === 0) return '';
                                const percentage = ((amount / monthlyTotal) * 100).toFixed(1);
                                return `
                                    <div style="cursor: pointer;" onclick="filterGconomicsByCategory('${cat.id}')">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <div style="width: 10px; height: 10px; border-radius: 2px; background: ${cat.color};"></div>
                                                <span style="font-size: 13px; font-weight: 500;">${cat.name}</span>
                                            </div>
                                            <div style="font-size: 13px;">
                                                <span style="font-weight: 600;">${formatCurrencyGconomics(amount)}</span>
                                                <span style="color: var(--text-muted); margin-left: 8px;">${percentage}%</span>
                                            </div>
                                        </div>
                                        <div style="height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;">
                                            <div style="height: 100%; width: ${percentage}%; background: ${cat.color}; border-radius: 4px; transition: width 0.3s;"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `}
            </div>
        </div>

        <!-- Category Filter Pills -->
        <div class="gconomics-category-pills" style="display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap;">
            <button onclick="filterGconomicsByCategory('all')" style="padding: 10px 20px; font-family: Outfit; border-radius: 25px; border: 2px solid ${gconomicsState.selectedCategory === 'all' ? 'var(--accent-primary)' : 'var(--border-color)'}; background: ${gconomicsState.selectedCategory === 'all' ? 'var(--accent-primary)' : 'var(--bg-secondary)'}; color: ${gconomicsState.selectedCategory === 'all' ? 'white' : 'var(--text-primary)'}; cursor: pointer; font-weight: 500; transition: all 0.2s;">
                <i class="fas fa-th-large"></i> All
            </button>
            ${GCONOMICS_CATEGORIES.map(cat => `
                <button onclick="filterGconomicsByCategory('${cat.id}')" style="font-family: Outfit; padding: 10px 20px; border-radius: 25px; border: 2px solid ${gconomicsState.selectedCategory === cat.id ? cat.color : 'var(--border-color)'}; background: ${gconomicsState.selectedCategory === cat.id ? cat.color : 'var(--bg-secondary)'}; color: ${gconomicsState.selectedCategory === cat.id ? 'white' : 'var(--text-primary)'}; cursor: pointer; font-weight: 500; transition: all 0.2s;">
                    <i class="fas ${cat.icon}"></i> ${cat.name}
                </button>
            `).join('')}
        </div>

        <!-- Expenses Grid -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-receipt"></i>
                    Recent Expenses
                    ${gconomicsState.selectedCategory !== 'all' ? `<span style="background: var(--accent-primary); color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-left: 8px;">${GCONOMICS_CATEGORIES.find(c => c.id === gconomicsState.selectedCategory)?.name}</span>` : ''}
                </h3>
            </div>
            <div class="card-body">
                ${displayExpenses.length === 0 ? `
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                        <i class="fas fa-receipt" style="font-size: 56px; margin-bottom: 20px; display: block; opacity: 0.3;"></i>
                        <div style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">No expenses yet</div>
                        <div style="font-size: 14px;">Click "New Expense" to start tracking</div>
                    </div>
                ` : `
                    <div class="gconomics-expenses-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
                        ${displayExpenses.map(expense => {
                            const category = GCONOMICS_CATEGORIES.find(c => c.id === expense.category) || GCONOMICS_CATEGORIES[5];
                            const expenseDate = new Date(expense.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                            return `
                                <div style="background: var(--bg-secondary); border-radius: 16px; padding: 20px; border-left: 4px solid ${category.color}; transition: all 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'" onclick="viewExpenseDetails('${expense.id}')">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <div style="width: 44px; height: 44px; background: ${category.color}20; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                                <i class="fas ${category.icon}" style="color: ${category.color}; font-size: 18px;"></i>
                                            </div>
                                            <div>
                                                <div style="font-weight: 600; font-size: 15px; margin-bottom: 2px;">${expense.description}</div>
                                                <div style="font-size: 12px; color: var(--text-muted);">${expenseDate}</div>
                                            </div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-size: 18px; font-weight: 700; color: ${category.color};">${formatCurrencyGconomics(expense.amount)}</div>
                                        </div>
                                    </div>
                                    ${expense.photo ? `
                                        <div style="margin-top: 12px; border-radius: 10px; overflow: hidden; max-height: 120px;">
                                            <img src="${expense.photo}" alt="Receipt" style="width: 100%; height: 120px; object-fit: cover;">
                                        </div>
                                    ` : ''}
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                                        <span style="background: ${category.color}20; color: ${category.color}; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600;">${category.name}</span>
                                        <div style="display: flex; gap: 8px;">
                                            <button class="btn-icon" onclick="event.stopPropagation(); editExpense('${expense.id}')" title="Edit" style="width: 32px; height: 32px;">
                                                <i class="fas fa-pen" style="font-size: 12px;"></i>
                                            </button>
                                            <button class="btn-icon danger" onclick="event.stopPropagation(); deleteExpense('${expense.id}')" title="Delete" style="width: 32px; height: 32px;">
                                                <i class="fas fa-trash" style="font-size: 12px;"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
        </div>

        <!-- Add/Edit Expense Modal -->
        <div class="modal" id="expenseModal">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2 id="expenseModalTitle">
                        <i class="fas fa-plus-circle"></i> Add Expense
                    </h2>
                    <button class="modal-close" onclick="closeExpenseModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <!-- AI Scan Section -->
                    <div style="margin-bottom: 20px; padding: 16px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-wand-magic-sparkles" style="color: white; font-size: 14px;"></i>
                                </div>
                                <div>
                                    <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">AI Receipt Scanner</div>
                                    <div style="font-size: 12px; color: var(--text-muted);">Auto-fill from receipt photo</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <input type="file" id="gconomicsAiPhoto" accept="image/*" style="display: none;" onchange="scanGconomicsReceiptWithAI(this)">
                                <button type="button" onclick="document.getElementById('gconomicsAiPhoto').click()" style="padding: 10px 16px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border: none; color: white; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(139,92,246,0.4)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
                                    <i class="fas fa-camera"></i> Scan Receipt
                                </button>
                            </div>
                        </div>
                        <div id="gconomics-ai-status" style="display: none; margin-top: 12px; padding: 10px; background: var(--bg-secondary); border-radius: 8px; font-size: 13px;"></div>
                    </div>

                    <form id="expenseForm" onsubmit="saveExpense(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="expenseDate">Date</label>
                                <input type="date" id="expenseDate" class="form-input">
                            </div>
                            <div class="form-group">
                                <label for="expenseAmount">Amount</label>
                                <input type="number" id="expenseAmount" class="form-input" placeholder="0.00" step="0.01" min="0">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="expenseDescription">Description</label>
                            <input type="text" id="expenseDescription" class="form-input" placeholder="What did you spend on?">
                        </div>
                        <div class="form-group">
                            <label for="expenseCategory">Category</label>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;" id="categorySelector">
                                ${GCONOMICS_CATEGORIES.map(cat => `
                                    <button type="button" class="category-select-btn" data-category="${cat.id}" onclick="selectExpenseCategory('${cat.id}')" style="padding: 14px 10px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); cursor: pointer; transition: all 0.2s; text-align: center;">
                                        <div style="font-size: 20px; margin-bottom: 4px; color: ${cat.color};"><i class="fas ${cat.icon}"></i></div>
                                        <div style="font-family: Outfit; font-size: 11px; font-weight: 500;">${cat.name}</div>
                                    </button>
                                `).join('')}
                            </div>
                            <input type="hidden" id="expenseCategory" value="">
                        </div>
                        <div class="form-group">
                            <label>Receipt Photo</label>
                            <div style="border: 2px dashed var(--border-color); border-radius: 12px; padding: 20px; text-align: center; background: var(--bg-hover);">
                                <input type="file" id="expensePhoto" accept="image/*" onchange="previewExpensePhoto(this)" style="display: none;">
                                <div id="expense-photo-preview" style="display: none; margin-bottom: 12px;">
                                    <img id="expense-photo-img" style="max-width: 100%; max-height: 150px; border-radius: 8px; object-fit: cover;">
                                </div>
                                <button type="button" class="btn-secondary" onclick="document.getElementById('expensePhoto').click()" style="margin: 0;">
                                    <i class="fas fa-camera"></i> Upload Receipt
                                </button>
                                <p style="margin: 8px 0 0 0; color: var(--text-muted); font-size: 12px;">Take a photo of your receipt (optional)</p>
                            </div>
                        </div>
                        <div id="expenseMessage" class="alert" style="display: none;"></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="closeExpenseModal()">Cancel</button>
                    <button type="submit" form="expenseForm" class="btn-primary">
                        <i class="fas fa-check"></i> Save Expense
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Preview expense photo
function previewExpensePhoto(input) {
    const preview = document.getElementById('expense-photo-preview');
    const img = document.getElementById('expense-photo-img');

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.style.display = 'none';
    }
}

// Select expense category
function selectExpenseCategory(categoryId) {
    document.getElementById('expenseCategory').value = categoryId;
    const buttons = document.querySelectorAll('.category-select-btn');
    buttons.forEach(btn => {
        const cat = GCONOMICS_CATEGORIES.find(c => c.id === btn.dataset.category);
        if (btn.dataset.category === categoryId) {
            btn.style.borderColor = cat.color;
            btn.style.background = cat.color + '20';
        } else {
            btn.style.borderColor = 'var(--border-color)';
            btn.style.background = 'var(--bg-secondary)';
        }
    });
}

// View expense details
function viewExpenseDetails(expenseId) {
    const expense = gconomicsState.expenses.find(e => e.id === expenseId);
    if (!expense) return;

    const category = GCONOMICS_CATEGORIES.find(c => c.id === expense.category) || GCONOMICS_CATEGORIES[5];
    const expenseDate = new Date(expense.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    modalContent.innerHTML = `
        <div class="modal-header">
            <h2 style="display: flex; align-items: center; gap: 10px;">
                <i class="fas ${category.icon}" style="color: ${category.color};"></i>
                Expense Details
            </h2>
            <button class="modal-close" onclick="closeModal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            ${expense.photo ? `
                <div style="margin-bottom: 20px; border-radius: 12px; overflow: hidden;">
                    <img src="${expense.photo}" alt="Receipt" style="width: 100%; max-height: 250px; object-fit: cover; cursor: pointer;" onclick="window.open('${expense.photo}', '_blank')">
                </div>
            ` : ''}
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <div style="font-size: 32px; font-weight: 700; color: ${category.color}; margin-bottom: 8px;">${formatCurrencyGconomics(expense.amount)}</div>
                <div style="font-size: 18px; font-weight: 500; margin-bottom: 4px;">${expense.description}</div>
                <div style="font-size: 14px; color: var(--text-muted);">${expenseDate}</div>
            </div>
            <div style="display: flex; gap: 12px;">
                <span style="background: ${category.color}20; color: ${category.color}; padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 600;">
                    <i class="fas ${category.icon}"></i> ${category.name}
                </span>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-secondary" onclick="closeModal(); editExpense('${expense.id}');">
                <i class="fas fa-pen"></i> Edit
            </button>
            <button class="btn-primary" onclick="closeModal();">
                <i class="fas fa-check"></i> Done
            </button>
        </div>
    `;
    modal.classList.add('active');
}

// Render donut chart SVG
function renderDonutChart(categoryTotals, total) {
    if (total === 0) return '';

    let accumulated = 0;
    return GCONOMICS_CATEGORIES.map(cat => {
        const amount = categoryTotals[cat.id] || 0;
        if (amount === 0) return '';
        const percentage = (amount / total) * 100;
        const dashArray = percentage + ' ' + (100 - percentage);
        const dashOffset = -accumulated;
        accumulated += percentage;
        return `<circle cx="18" cy="18" r="15.9" fill="none" stroke="${cat.color}" stroke-width="3.5" stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}" />`;
    }).join('');
}

// Render simple bar chart
function renderGconomicsChart(categoryTotals, total) {
    if (total === 0) {
        return '<p class="chart-empty">No expenses to display</p>';
    }

    return `
        <div class="gconomics-bar-chart">
            ${GCONOMICS_CATEGORIES.map(cat => {
                const amount = categoryTotals[cat.id] || 0;
                const percentage = total > 0 ? (amount / total * 100) : 0;
                if (amount === 0) return '';
                return `
                    <div class="chart-bar-item">
                        <div class="chart-bar-header">
                            <span class="chart-bar-label">
                                <i class="fas ${cat.icon}" style="color: ${cat.color};"></i>
                                ${cat.name}
                            </span>
                            <span class="chart-bar-value">${percentage.toFixed(0)}%</span>
                        </div>
                        <div class="chart-bar-track">
                            <div class="chart-bar-fill" style="width: ${percentage}%; background: ${cat.color};"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Format currency
function formatCurrencyGconomics(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Filter by category
function filterGconomicsByCategory(categoryId) {
    gconomicsState.selectedCategory = categoryId;
    renderGconomics();
}

// Change month
function changeGconomicsMonth(month) {
    gconomicsState.currentMonth = month;
    gconomicsState.selectedCategory = 'all';
    renderGconomics();
}

// Open add expense modal
function openAddExpenseModal() {
    gconomicsState.editingExpenseId = null;
    document.getElementById('expenseModalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Add Expense';
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('expenseMessage').style.display = 'none';
    // Reset AI status
    const aiStatus = document.getElementById('gconomics-ai-status');
    if (aiStatus) {
        aiStatus.style.display = 'none';
        aiStatus.innerHTML = '';
    }
    // Reset category selection
    document.querySelectorAll('.category-select-btn').forEach(btn => {
        btn.style.borderColor = 'var(--border-color)';
        btn.style.background = 'var(--bg-secondary)';
    });
    // Reset photo preview
    const preview = document.getElementById('expense-photo-preview');
    if (preview) preview.style.display = 'none';
    document.getElementById('expenseModal').classList.add('active');
}

// Scan receipt with AI for Gconomics
async function scanGconomicsReceiptWithAI(input) {
    if (!input.files || !input.files[0]) return;

    const statusDiv = document.getElementById('gconomics-ai-status');
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: #8b5cf6;"></i> <span style="color: var(--text-primary);">Analyzing receipt with AI...</span>';

    try {
        // Check for API key
        const apiKey = getOpenAIKey();
        if (!apiKey) {
            statusDiv.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #f59e0b;"></i> <span style="color: var(--text-primary);">Please configure your OpenAI API key in Project Analytics > Settings</span>';
            return;
        }

        // Read the file as base64
        const file = input.files[0];
        const base64Image = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        // Also set the photo preview
        const previewDiv = document.getElementById('expense-photo-preview');
        const previewImg = document.getElementById('expense-photo-img');
        if (previewDiv && previewImg) {
            previewImg.src = base64Image;
            previewDiv.style.display = 'block';
        }

        // Copy the file to the main photo input for saving
        const mainPhotoInput = document.getElementById('expensePhoto');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        mainPhotoInput.files = dataTransfer.files;

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                max_tokens: 1024,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: base64Image
                                }
                            },
                            {
                                type: 'text',
                                text: `Analyze this receipt/expense image and extract the following information. Return ONLY a JSON object with these fields (use null for any field you cannot find):

{
    "total": "the total amount as a number (no currency symbols)",
    "date": "the date in YYYY-MM-DD format",
    "description": "a brief description of what was purchased (store name + main items)",
    "category": "one of: food, transport, shopping, entertainment, bills, other"
}

Category guidelines:
- food: restaurants, groceries, coffee shops, food delivery
- transport: gas, uber, parking, public transit
- shopping: clothes, electronics, personal items
- entertainment: movies, games, subscriptions, events
- bills: utilities, phone, internet, insurance
- other: anything that doesn't fit above

Return ONLY the JSON object, no additional text.`
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Parse the JSON response
        let receiptData;
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                receiptData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('Error parsing AI response:', content);
            throw new Error('Could not parse receipt data from AI response');
        }

        // Fill in the form fields
        if (receiptData.total) {
            const amount = parseFloat(receiptData.total.toString().replace(/[^0-9.]/g, ''));
            if (!isNaN(amount)) {
                document.getElementById('expenseAmount').value = amount.toFixed(2);
            }
        }

        if (receiptData.date) {
            document.getElementById('expenseDate').value = receiptData.date;
        }

        if (receiptData.description) {
            document.getElementById('expenseDescription').value = receiptData.description;
        }

        if (receiptData.category) {
            const categoryId = receiptData.category.toLowerCase();
            // Map AI categories to Gconomics categories
            const categoryMap = {
                'food': 'food',
                'transport': 'transport',
                'shopping': 'shopping',
                'entertainment': 'entertainment',
                'bills': 'bills',
                'other': 'other'
            };
            const mappedCategory = categoryMap[categoryId] || 'other';
            selectExpenseCategory(mappedCategory);
        }

        // Show success message
        statusDiv.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> <span style="color: var(--text-primary);">Receipt scanned successfully! Review and save.</span>';

    } catch (error) {
        console.error('Error scanning receipt with AI:', error);
        statusDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">Error: ${error.message}</span>`;
    }

    // Clear the file input for next use
    input.value = '';
}

// Close expense modal
function closeExpenseModal(forceClose = false) {
    // Reset form protection before closing
    if (typeof formProtectionManager !== 'undefined') {
        formProtectionManager.resetProtection();
    }
    document.getElementById('expenseModal').classList.remove('active');
    gconomicsState.editingExpenseId = null;
}

// Edit expense
function editExpense(expenseId) {
    const expense = gconomicsState.expenses.find(e => e.id === expenseId);
    if (!expense) return;

    gconomicsState.editingExpenseId = expenseId;
    document.getElementById('expenseModalTitle').innerHTML = '<i class="fas fa-pen"></i> Edit Expense';
    document.getElementById('expenseDate').value = expense.date;
    document.getElementById('expenseDescription').value = expense.description;
    document.getElementById('expenseCategory').value = expense.category;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('expenseMessage').style.display = 'none';
    document.getElementById('expenseModal').classList.add('active');
}

// Delete expense
function deleteExpense(expenseId) {
    showConfirmModal({
        title: 'Delete Expense',
        message: 'Are you sure you want to delete this expense? This action cannot be undone.',
        confirmText: 'Delete',
        type: 'danger',
        onConfirm: () => {
            gconomicsState.expenses = gconomicsState.expenses.filter(e => e.id !== expenseId);
            saveGconomicsExpenses();

            // Delete from Firebase if available
            if (window.gconomicsFirebase && window.gconomicsFirebase.isInitialized && window.gconomicsFirebase.currentUser) {
                window.gconomicsFirebase.deleteExpenseFromFirestore(expenseId).catch(error => {
                    console.warn('Expense deleted locally but not from Firebase:', error);
                });
            } else if (window.gconomicsFirebase && !window.gconomicsFirebase.currentUser) {
                // Try to initialize with current user if available
                const user = JSON.parse(localStorage.getItem('ascendance_user') || '{}');
                if (user && (user.userId || user.id)) {
                    initializeGconomicsFirebase(user.userId || user.id, user.email).then(() => {
                        window.gconomicsFirebase.deleteExpenseFromFirestore(expenseId).catch(error => {
                            console.warn('Expense deleted locally but not from Firebase:', error);
                        });
                    });
                }
            }

            renderGconomics();
        }
    });
}

// Save expense
function saveExpense(event) {
    event.preventDefault();
    console.log('saveExpense called');

    const date = document.getElementById('expenseDate').value || new Date().toISOString().split('T')[0];
    const description = document.getElementById('expenseDescription').value.trim();
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value) || 0;
    const photoInput = document.getElementById('expensePhoto');

    // Validation
    const messageDiv = document.getElementById('expenseMessage');
    messageDiv.style.display = 'none';

    console.log('Form values:', { date, description, category, amount });

    if (!date) {
        messageDiv.style.display = 'block';
        messageDiv.className = 'alert alert-danger';
        messageDiv.textContent = 'Please select a date';
        return;
    }

    if (!description) {
        messageDiv.style.display = 'block';
        messageDiv.className = 'alert alert-danger';
        messageDiv.textContent = 'Please enter a description';
        return;
    }

    if (!category) {
        messageDiv.style.display = 'block';
        messageDiv.className = 'alert alert-danger';
        messageDiv.textContent = 'Please select a category';
        return;
    }

    if (amount <= 0) {
        messageDiv.style.display = 'block';
        messageDiv.className = 'alert alert-danger';
        messageDiv.textContent = 'Please enter a valid amount';
        return;
    }

    console.log('Validation passed, processing photo...');

    // Get photo if uploaded
    if (photoInput && photoInput.files && photoInput.files[0]) {
        console.log('Photo file found, reading...');
        const reader = new FileReader();
        reader.onerror = function(e) {
            console.error('FileReader error:', e);
            saveExpenseWithPhoto(date, description, category, amount, null);
        };
        reader.onload = function(e) {
            console.log('Photo read complete');
            const photoData = e.target.result;
            // Call saveExpenseWithPhoto without awaiting
            saveExpenseWithPhoto(date, description, category, amount, photoData);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        console.log('No photo, saving without image');
        // Check if editing and preserve existing photo
        let existingPhoto = null;
        if (gconomicsState.editingExpenseId) {
            const existing = gconomicsState.expenses.find(e => e.id === gconomicsState.editingExpenseId);
            if (existing) existingPhoto = existing.photo;
        }
        saveExpenseWithPhoto(date, description, category, amount, existingPhoto);
    }
}

async function saveExpenseWithPhoto(date, description, category, amount, photo) {
    // Show saving indicator
    const saveBtn = document.querySelector('#expenseForm button[type="submit"]');
    const originalBtnText = saveBtn ? saveBtn.innerHTML : '';
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    }

    let photoUrl = photo;
    let photoPath = null;

    try {
        console.log('Entering saveExpenseWithPhoto try block');
        
        // Don't wait for photo operations - do them in background
        if (photo && photo.startsWith('data:image')) {
            console.log('Photo found, will process in background');
            // Fire and forget photo upload
            uploadExpensePhotoAsync(photo, gconomicsState.editingExpenseId || Date.now().toString());
        }

        // Create or update expense object
        let expenseToSync = null;

        if (gconomicsState.editingExpenseId) {
            // Update existing expense
            console.log('Updating existing expense');
            const index = gconomicsState.expenses.findIndex(e => e.id === gconomicsState.editingExpenseId);
            if (index > -1) {
                gconomicsState.expenses[index] = {
                    ...gconomicsState.expenses[index],
                    date,
                    description: description || 'Expense',
                    category: category || 'other',
                    amount,
                    photo: photo,
                    photoPath: photoPath || gconomicsState.expenses[index].photoPath,
                    updatedAt: new Date().toISOString()
                };
                expenseToSync = gconomicsState.expenses[index];
                console.log('Updated expense:', expenseToSync.id);
            }
        } else {
            // Add new expense
            console.log('Creating new expense');
            const newExpense = {
                id: Date.now().toString(),
                date,
                description: description || 'Expense',
                category: category || 'other',
                amount,
                photo: photo,
                photoPath: photoPath,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            gconomicsState.expenses.push(newExpense);
            expenseToSync = newExpense;
            console.log('New expense created:', newExpense.id);
        }

        // Save to localStorage immediately
        saveGconomicsExpenses();

        // Close modal and refresh UI immediately (don't wait for Firebase)
        closeExpenseModal();
        
        // Switch to the month of the expense if different
        const expenseMonth = date.slice(0, 7);
        if (expenseMonth !== gconomicsState.currentMonth) {
            gconomicsState.currentMonth = expenseMonth;
        }

        renderGconomics();

        // Show success message
        showNotification('Expense saved successfully', 'success');

        // Now sync to Firebase in background (don't wait)
        console.log('Starting background Firebase sync...');
        if (expenseToSync) {
            syncExpenseToFirebaseAsync(expenseToSync).catch(err => {
                console.warn('Firebase sync failed:', err);
            });
        }

    } catch (error) {
        console.error('Error saving expense:', error);
        const messageDiv = document.getElementById('expenseMessage');
        if (messageDiv) {
            messageDiv.style.display = 'block';
            messageDiv.className = 'alert alert-danger';
            messageDiv.textContent = 'Error saving expense: ' + error.message;
        }
    } finally {
        // Restore button state
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalBtnText || '<i class="fas fa-check"></i> Save Expense';
        }
    }
}

/**
 * Upload expense photo to Firebase Storage (async, non-blocking)
 */
async function uploadExpensePhotoAsync(photoData, expenseId) {
    try {
        if (typeof firebaseStorageHelper === 'undefined') {
            console.warn('Firebase Storage Helper not available');
            return null;
        }

        if (!firebaseStorageHelper.isInitialized) {
            console.log('Initializing Firebase Storage Helper...');
            firebaseStorageHelper.initialize();
        }

        if (!firebaseStorageHelper.storage) {
            console.error('Firebase Storage not available');
            return null;
        }

        const uploadId = expenseId || Date.now().toString();
        console.log('Starting photo upload for expense:', uploadId);

        const uploadResult = await firebaseStorageHelper.uploadImage(
            photoData,
            'expenses/receipts',
            uploadId,
            500,
            false // Don't show overlay since we already closed the modal
        );
        
        return uploadResult;
    } catch (error) {
        console.error('❌ Error uploading expense photo to Storage:', error);
        console.error('Error details:', error.message);
        return null;
    }
}

/**
 * Sync expense to Firebase Firestore (async, non-blocking)
 */
async function syncExpenseToFirebaseAsync(expenseToSync) {
    try {
        if (typeof window.gconomicsFirebase === 'undefined' || !window.gconomicsFirebase) {
            console.warn('Gconomics Firebase not available');
            return false;
        }

        // Initialize Firebase if needed
        if (!window.gconomicsFirebase.isInitialized) {
            console.log('Initializing Gconomics Firebase...');
            const initialized = await window.gconomicsFirebase.initialize();
            if (!initialized) {
                console.error('Failed to initialize Gconomics Firebase');
                return false;
            }
        }

        // Set current user if not set
        if (!window.gconomicsFirebase.currentUser) {
            const user = JSON.parse(localStorage.getItem('ascendance_user') || '{}');
            if (user && (user.userId || user.id)) {
                window.gconomicsFirebase.setCurrentUser(user.userId || user.id, user.email);
            } else {
                console.warn('No user found in localStorage');
                return false;
            }
        }

        // Sync to Firestore
        if (window.gconomicsFirebase.isInitialized && expenseToSync) {
            const success = await window.gconomicsFirebase.saveExpenseToFirestore(expenseToSync);
            if (success) {
                return true;
            } else {
                console.warn('Firestore sync returned false');
                return false;
            }
        }
    } catch (error) {
        console.error('Error syncing to Firebase:', error);
        return false;
    }
}

