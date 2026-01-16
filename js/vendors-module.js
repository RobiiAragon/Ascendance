        // ==========================================
        // EMPLOYEE PURCHASES MODULE
        // ==========================================

        let employeePurchases = [];
        let employeePurchasesCurrentMonth = new Date().toISOString().slice(0, 7);
        let employeePurchasesStoreFilter = 'all';

        // Initialize Firebase collection for employee purchases
        async function loadEmployeePurchases() {
            try {
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    const db = firebase.firestore();
                    const snapshot = await db.collection('employeePurchases').orderBy('date', 'desc').get();
                    employeePurchases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                }
            } catch (error) {
                console.error('Error loading employee purchases:', error);
            }
        }

        function renderEmployeePurchases() {
            const dashboard = document.querySelector('.dashboard');

            // Check user role - only managers and admins can view purchase records
            const currentUser = authManager.getCurrentUser();
            const userRole = currentUser?.role || 'employee';
            const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager';

            // If employee, show only the submission form view
            if (!isManagerOrAdmin) {
                dashboard.innerHTML = `
                    <div class="page-header">
                        <div class="page-header-left">
                            <h2 class="section-title">Employee Purchases</h2>
                            <p class="section-subtitle">Submit your employee purchases</p>
                        </div>
                    </div>

                    <!-- Submit Purchase Card -->
                    <div class="card" style="max-width: 600px; margin: 40px auto; padding: 40px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                                <i class="fas fa-shopping-bag" style="font-size: 32px; color: white;"></i>
                            </div>
                            <h3 style="margin: 0 0 8px; color: var(--text-primary);">Submit a Purchase</h3>
                            <p style="margin: 0; color: var(--text-muted);">Record your employee purchase for manager review</p>
                        </div>
                        <button class="btn-primary" onclick="openModal('add-employee-purchase')" style="width: 100%; padding: 16px; font-size: 16px;">
                            <i class="fas fa-plus"></i>
                            New Purchase
                        </button>
                    </div>
                `;
                return;
            }

            // Manager/Admin view - show full dashboard with records
            // Filter by month
            const monthlyRecords = employeePurchases.filter(r => r.date && r.date.startsWith(employeePurchasesCurrentMonth));

            // Filter by store
            let filteredRecords = [...monthlyRecords];
            if (employeePurchasesStoreFilter !== 'all') {
                filteredRecords = monthlyRecords.filter(r => r.store === employeePurchasesStoreFilter);
            }

            const monthlyTotal = filteredRecords.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
            const monthName = new Date(employeePurchasesCurrentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Employee Purchases</h2>
                        <p class="section-subtitle">Track all employee purchases and discounts</p>
                    </div>
                    <button class="btn-primary floating-add-btn" onclick="openModal('add-employee-purchase')">
                        <i class="fas fa-plus"></i>
                        New Purchase
                    </button>
                </div>

                <!-- Monthly Total Card -->
                <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px; padding: 30px 40px; margin-bottom: 24px; position: relative; overflow: hidden;">
                    <div style="position: absolute; right: -30px; top: 50%; transform: translateY(-50%); width: 180px; height: 180px; border-radius: 50%; background: rgba(255,255,255,0.1);"></div>
                    <div style="position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="color: rgba(255,255,255,0.8); font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">${monthName}</div>
                            <div style="color: white; font-size: 42px; font-weight: 700; margin-top: 4px;">$${monthlyTotal.toFixed(2)}</div>
                            <div style="color: rgba(255,255,255,0.8); font-size: 13px; margin-top: 4px;">${filteredRecords.length} purchase${filteredRecords.length !== 1 ? 's' : ''} this month</div>
                        </div>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <button onclick="changeEmployeePurchasesMonth(-1)" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 8px; cursor: pointer; font-size: 16px;">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button onclick="changeEmployeePurchasesMonth(1)" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 8px; cursor: pointer; font-size: 16px;">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div style="display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; align-items: flex-end;">
                    <div style="min-width: 180px;">
                        <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">Month</label>
                        <input type="month" id="emp-purchases-month-filter" value="${employeePurchasesCurrentMonth}" onchange="jumpToEmployeePurchasesMonth(this.value)" style="padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary);">
                    </div>
                    <div style="min-width: 200px;">
                        <label style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">Store</label>
                        <select id="emp-purchases-store-filter" onchange="filterEmployeePurchasesByStore(this.value)" style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary);">
                            <option value="all">All Stores</option>
                            <option value="Miramar" ${employeePurchasesStoreFilter === 'Miramar' ? 'selected' : ''}>VSU Miramar</option>
                            <option value="Morena" ${employeePurchasesStoreFilter === 'Morena' ? 'selected' : ''}>VSU Morena</option>
                            <option value="Kearny Mesa" ${employeePurchasesStoreFilter === 'Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                            <option value="Chula Vista" ${employeePurchasesStoreFilter === 'Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                            <option value="North Park" ${employeePurchasesStoreFilter === 'North Park' ? 'selected' : ''}>VSU North Park</option>
                            <option value="Miramar Wine & Liquor" ${employeePurchasesStoreFilter === 'Miramar Wine & Liquor' ? 'selected' : ''}>Miramar Wine & Liquor</option>
                        </select>
                    </div>
                </div>

                <!-- Records List -->
                <div class="card" style="padding: 0; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: var(--bg-secondary);">
                                <th style="padding: 14px 16px; text-align: left; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color);">Date</th>
                                <th style="padding: 14px 16px; text-align: left; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color);">Employee</th>
                                <th style="padding: 14px 16px; text-align: left; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color);">Store</th>
                                <th style="padding: 14px 16px; text-align: left; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color);">Items</th>
                                <th style="padding: 14px 16px; text-align: right; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color);">Amount</th>
                                <th style="padding: 14px 16px; text-align: center; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color);">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredRecords.length > 0 ? filteredRecords.map(record => `
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 14px 16px; color: var(--text-primary);">${formatDate(record.date)}</td>
                                    <td style="padding: 14px 16px; color: var(--text-primary); font-weight: 500;">${record.employeeName || 'Unknown'}</td>
                                    <td style="padding: 14px 16px;"><span style="padding: 4px 10px; border-radius: 6px; font-size: 12px; background: var(--bg-secondary); color: var(--text-secondary);">${record.store || 'N/A'}</span></td>
                                    <td style="padding: 14px 16px; color: var(--text-secondary);">${record.items || record.description || 'N/A'}</td>
                                    <td style="padding: 14px 16px; text-align: right; font-weight: 600; color: var(--accent-primary);">$${(parseFloat(record.amount) || 0).toFixed(2)}</td>
                                    <td style="padding: 14px 16px; text-align: center;">
                                        <button onclick="deleteEmployeePurchase('${record.id}')" class="btn-icon" style="color: var(--danger);" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="6" style="padding: 40px; text-align: center; color: var(--text-muted);">
                                        <i class="fas fa-shopping-bag" style="font-size: 32px; opacity: 0.3; margin-bottom: 12px;"></i>
                                        <p style="margin: 0;">No employee purchases recorded this month</p>
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            `;
        }

        function changeEmployeePurchasesMonth(delta) {
            const date = new Date(employeePurchasesCurrentMonth + '-01');
            date.setMonth(date.getMonth() + delta);
            employeePurchasesCurrentMonth = date.toISOString().slice(0, 7);
            renderEmployeePurchases();
        }

        window.jumpToEmployeePurchasesMonth = function(month) {
            if (month) {
                employeePurchasesCurrentMonth = month;
                renderEmployeePurchases();
            }
        }

        function filterEmployeePurchasesByStore(store) {
            employeePurchasesStoreFilter = store;
            renderEmployeePurchases();
        }

        async function saveEmployeePurchase() {
            const employeeId = document.getElementById('emp-purchase-employee').value;
            const store = document.getElementById('emp-purchase-store').value;
            const date = document.getElementById('emp-purchase-date').value;
            const items = document.getElementById('emp-purchase-items').value.trim();
            const amount = parseFloat(document.getElementById('emp-purchase-amount').value) || 0;

            if (!employeeId || !store || !date || !amount) {
                alert('Please fill in all required fields');
                return;
            }

            const emp = employees.find(e => e.id === employeeId || e.firestoreId === employeeId);

            const purchaseData = {
                employeeId,
                employeeName: emp ? emp.name : 'Unknown',
                store,
                date,
                items,
                amount,
                createdAt: new Date().toISOString(),
                createdBy: authManager.getCurrentUser()?.name || 'Unknown'
            };

            try {
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    const db = firebase.firestore();
                    await db.collection('employeePurchases').add(purchaseData);
                }
                employeePurchases.unshift(purchaseData);
                closeModal();
                showNotification('Employee purchase recorded!', 'success');
                renderEmployeePurchases();
            } catch (error) {
                console.error('Error saving employee purchase:', error);
                alert('Error saving purchase. Please try again.');
            }
        }

        async function deleteEmployeePurchase(purchaseId) {
            if (!confirm('Are you sure you want to delete this purchase record?')) return;

            try {
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    const db = firebase.firestore();
                    await db.collection('employeePurchases').doc(purchaseId).delete();
                }
                employeePurchases = employeePurchases.filter(p => p.id !== purchaseId);
                showNotification('Purchase deleted', 'success');
                renderEmployeePurchases();
            } catch (error) {
                console.error('Error deleting purchase:', error);
                alert('Error deleting purchase');
            }
        }

        // Make functions globally available
        window.renderEmployeePurchases = renderEmployeePurchases;
        window.changeEmployeePurchasesMonth = changeEmployeePurchasesMonth;
        window.filterEmployeePurchasesByStore = filterEmployeePurchasesByStore;
        window.saveEmployeePurchase = saveEmployeePurchase;
        window.deleteEmployeePurchase = deleteEmployeePurchase;
        window.loadEmployeePurchases = loadEmployeePurchases;

        // Cash Out Functions
        function renderCashOut() {
            const dashboard = document.querySelector('.dashboard');

            // Filter by store first
            let filteredRecords = [...cashOutRecords];
            if (currentCashOutStoreFilter !== 'all') {
                filteredRecords = cashOutRecords.filter(r => r.store === currentCashOutStoreFilter);
            }

            // Calculate monthly total (from filtered records)
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const monthlyRecords = filteredRecords.filter(r => {
                const date = new Date(r.createdDate);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            });
            const monthlyTotal = monthlyRecords.reduce((sum, r) => sum + r.amount, 0);
            const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Cash Control</h2>
                        <p class="section-subtitle">Track and manage store cash flow</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('create-cashout')">
                        <i class="fas fa-plus"></i>
                        Add Expense
                    </button>
                </div>

                <!-- Monthly Total Card -->
                <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); border-radius: 16px; padding: 30px 40px; margin-bottom: 24px; position: relative; overflow: hidden;">
                    <div style="position: absolute; right: -30px; top: 50%; transform: translateY(-50%); width: 180px; height: 180px; border-radius: 50%; background: rgba(255,255,255,0.1);"></div>
                    <div style="position: relative; z-index: 1;">
                        <div style="color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; letter-spacing: 1px; margin-bottom: 8px;">
                            ${monthName} ${currentCashOutStoreFilter !== 'all' ? `· ${currentCashOutStoreFilter}` : ''}
                        </div>
                        <div style="color: white; font-size: 42px; font-weight: 700; margin-bottom: 4px;">$${monthlyTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 14px;">${monthlyRecords.length} expense${monthlyRecords.length !== 1 ? 's' : ''} this month</div>
                    </div>
                </div>

                <!-- Store Filter -->
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-body" style="padding: 16px;">
                        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-store" style="color: var(--text-muted);"></i>
                                <span style="font-weight: 500; color: var(--text-secondary);">Filter by Store:</span>
                            </div>
                            <select id="cashout-store-filter" class="form-input" onchange="filterCashOutByStore(this.value)" style="width: 220px;">
                                <option value="all" ${currentCashOutStoreFilter === 'all' ? 'selected' : ''}>All Stores</option>
                                <option value="Miramar" ${currentCashOutStoreFilter === 'Miramar' ? 'selected' : ''}>VSU Miramar</option>
                                <option value="Morena" ${currentCashOutStoreFilter === 'Morena' ? 'selected' : ''}>VSU Morena</option>
                                <option value="Kearny Mesa" ${currentCashOutStoreFilter === 'Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                                <option value="Chula Vista" ${currentCashOutStoreFilter === 'Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                                <option value="North Park" ${currentCashOutStoreFilter === 'North Park' ? 'selected' : ''}>VSU North Park</option>
                                <option value="Miramar Wine & Liquor" ${currentCashOutStoreFilter === 'Miramar Wine & Liquor' ? 'selected' : ''}>Miramar Wine & Liquor</option>
                            </select>
                            ${currentCashOutStoreFilter !== 'all' ? `
                                <button onclick="filterCashOutByStore('all')" class="btn-secondary" style="padding: 8px 12px;">
                                    <i class="fas fa-times"></i> Clear Filter
                                </button>
                                <span style="margin-left: auto; font-size: 13px; color: var(--text-muted);">
                                    Showing ${filteredRecords.length} of ${cashOutRecords.length} records
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <!-- Money Flying Animation Container -->
                <div id="money-flying-container" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; overflow: hidden;"></div>

                <!-- Charts Card -->
                <div class="card" style="margin-bottom: 24px; ${cashOutViewState.expenseAnalysisExpanded ? 'border: 2px solid var(--accent-primary); box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);' : ''}">
                    <div class="card-header" style="cursor: pointer; user-select: none; ${cashOutViewState.expenseAnalysisExpanded ? 'background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);' : ''}" onclick="toggleCashOutExpenseAnalysisWithEffect()">
                        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                            <div style="width: 40px; height: 40px; background: ${cashOutViewState.expenseAnalysisExpanded ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'var(--bg-secondary)'}; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: all 0.3s;">
                                <i class="fas fa-chart-line" style="color: ${cashOutViewState.expenseAnalysisExpanded ? 'white' : 'var(--accent-primary)'}; font-size: 16px;"></i>
                            </div>
                            <div>
                                <h3 class="card-title" style="margin: 0; font-size: 16px;">Expense Analysis</h3>
                                <span style="font-size: 12px; color: var(--text-muted);">${cashOutViewState.expenseAnalysisExpanded ? 'Click to collapse' : 'Click to expand charts & insights'}</span>
                            </div>
                            <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
                                ${!cashOutViewState.expenseAnalysisExpanded ? '<span style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">VIEW CHARTS</span>' : ''}
                                <i class="fas fa-chevron-down" style="transition: transform 0.3s ease; transform: ${cashOutViewState.expenseAnalysisExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}; color: var(--text-muted);"></i>
                            </div>
                        </div>
                    </div>

                    ${cashOutViewState.expenseAnalysisExpanded ? `
                    <div class="card-body" style="padding: 16px;">
                        <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
                            <!-- View Toggle Buttons -->
                            <button class="cashout-filter-btn ${cashOutViewState.viewType === 'week' ? 'active' : ''}"
                                    onclick="switchCashOutView('week')"
                                    id="cashout-week-btn">
                                <i class="fas fa-calendar-week"></i> Week
                            </button>
                            <button class="cashout-filter-btn ${cashOutViewState.viewType === 'month' ? 'active' : ''}"
                                    onclick="switchCashOutView('month')"
                                    id="cashout-month-btn">
                                <i class="fas fa-calendar"></i> Month
                            </button>
                        </div>

                        ${cashOutRecords.length === 0 ? `
                            <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                                <i class="fas fa-chart-line" style="font-size: 48px; margin-bottom: 16px; display: block; opacity: 0.5;"></i>
                                <p>No expense data available yet</p>
                            </div>
                        ` : `
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 20px;">
                                <!-- Daily/Weekly Expenses Chart -->
                                <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px;">
                                    <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px;">
                                        ${cashOutViewState.viewType === 'week' ? 'Daily Expenses This Week' : 'Daily Expenses This Month'}
                                    </div>
                                    <canvas id="cashout-daily-chart" style="max-height: 200px;"></canvas>
                                </div>

                                <!-- Store Breakdown Chart -->
                                <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px;">
                                    <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px;">
                                        Expenses by Store
                                    </div>
                                    <canvas id="cashout-store-chart" style="max-height: 200px;"></canvas>
                                </div>
                            </div>

                            <!-- Trend Chart (Full Width) -->
                            <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px;">
                                    Expense Trend
                                </div>
                                <canvas id="cashout-trend-chart" style="max-height: 250px;"></canvas>
                            </div>
                        `}
                    </div>
                    ` : ''}
                </div>

                <!-- Data Table/Grid Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary);">
                        <i class="fas fa-receipt" style="margin-right: 8px; color: var(--accent-primary);"></i>
                        Cash Removed
                    </h3>
                    <!-- View Toggle -->
                    <div style="display: flex; background: var(--bg-secondary); border-radius: 8px; padding: 3px; border: 1px solid var(--border-color);">
                        <button onclick="setCashOutDisplayMode('list')" id="cashout-view-list-btn" style="width: 34px; height: 34px; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; ${cashOutViewState.displayMode === 'list' ? 'background: var(--accent-primary); color: white;' : 'background: transparent; color: var(--text-muted);'}" title="List View">
                            <i class="fas fa-list"></i>
                        </button>
                        <button onclick="setCashOutDisplayMode('grid')" id="cashout-view-grid-btn" style="width: 34px; height: 34px; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; ${cashOutViewState.displayMode === 'grid' ? 'background: var(--accent-primary); color: white;' : 'background: transparent; color: var(--text-muted);'}" title="Grid View">
                            <i class="fas fa-th-large"></i>
                        </button>
                    </div>
                </div>

                <!-- Data Table/Grid Card -->
                <div class="card">
                    <div class="card-body" style="padding: ${cashOutViewState.displayMode === 'grid' ? '20px' : '0'};">
                        ${filteredRecords.length === 0 ? `
                            <div style="text-align: center; padding: 60px; color: var(--text-muted);">
                                <i class="fas fa-money-bill-wave" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                                <h3 style="margin-bottom: 8px; color: var(--text-secondary);">No Expenses Yet</h3>
                                <p>Click "Add Expense" to create a new record</p>
                            </div>
                        ` : cashOutViewState.displayMode === 'grid' ? `
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                                ${filteredRecords.map(record => renderCashOutCard(record)).join('')}
                            </div>
                        ` : `
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th>Source</th>
                                        <th>Store</th>
                                        <th>Created By</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${filteredRecords.map(record => {
                                        const recordId = record.firestoreId || record.id;
                                        const recordTime = record.createdTime || (record.createdAt?.toDate ? record.createdAt.toDate().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}) : '--');
                                        const source = record.source || 'register';
                                        const sourceIcon = source === 'envelope' ? 'fa-envelope' : 'fa-cash-register';
                                        const sourceColor = source === 'envelope' ? '#f59e0b' : '#3b82f6';
                                        const sourceLabel = source === 'envelope' ? 'Envelope' : 'Register';
                                        return `
                                        <tr>
                                            <td>${formatDate(record.createdDate)}</td>
                                            <td style="font-size: 13px; color: var(--text-secondary);">${recordTime}</td>
                                            <td>
                                                <div style="display: flex; align-items: center; gap: 8px;">
                                                    ${record.photoUrl ? `<img src="${record.photoUrl}" style="width: 32px; height: 32px; border-radius: 6px; object-fit: cover; cursor: pointer;" onclick="viewCashOutPhoto('${record.photoUrl}')" title="View photo">` : ''}
                                                    <div>
                                                        <strong>${record.name}</strong>
                                                        ${record.reason ? `<div style="font-size: 12px; color: var(--text-muted);">${record.reason}</div>` : ''}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style="font-weight: 600; color: var(--danger);">
                                                $${record.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                            </td>
                                            <td>
                                                <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; background: ${sourceColor}15; color: ${sourceColor};">
                                                    <i class="fas ${sourceIcon}"></i> ${sourceLabel}
                                                </span>
                                            </td>
                                            <td><span class="status-badge">${record.store || 'N/A'}</span></td>
                                            <td>${record.createdBy}</td>
                                            <td>
                                                <div class="action-buttons">
                                                    <button class="btn-icon" onclick="viewCashOutDetails('${recordId}')" title="View Details">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                    <button class="btn-icon" onclick="editCashOut('${recordId}')" title="Edit">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button class="btn-icon btn-danger" onclick="deleteCashOut('${recordId}')" title="Delete">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `}).join('')}
                                </tbody>
                            </table>
                        `}
                    </div>
                </div>
            `;

            // Initialize charts after DOM is rendered
            setTimeout(() => initializeCashOutCharts(), 100);
        }

        // Filter cash out by store
        function filterCashOutByStore(store) {
            currentCashOutStoreFilter = store;
            renderCashOut();
        }

        // Switch cash out view between week and month
        function switchCashOutView(viewType) {
            cashOutViewState.viewType = viewType;
            renderCashOut();
        }

        // Toggle expense analysis expansion
        function toggleCashOutExpenseAnalysis() {
            cashOutViewState.expenseAnalysisExpanded = !cashOutViewState.expenseAnalysisExpanded;
            renderCashOut();

            // Initialize charts after expansion if needed
            if (cashOutViewState.expenseAnalysisExpanded) {
                setTimeout(() => initializeCashOutCharts(), 100);
            }
        }

        // Toggle expense analysis with flying money effect
        function toggleCashOutExpenseAnalysisWithEffect() {
            // Trigger flying money effect
            createFlyingMoneyEffect();

            // Toggle after a small delay for effect
            setTimeout(() => {
                toggleCashOutExpenseAnalysis();
            }, 100);
        }

        // Create flying money effect
        function createFlyingMoneyEffect() {
            const container = document.getElementById('money-flying-container');
            if (!container) return;

            // Clear any existing money
            container.innerHTML = '';

            const moneyEmojis = ['💵', '💸', '💰', '🤑', '💲', '🪙', '💎'];
            const numBills = 20;

            for (let i = 0; i < numBills; i++) {
                setTimeout(() => {
                    const money = document.createElement('div');
                    const emoji = moneyEmojis[Math.floor(Math.random() * moneyEmojis.length)];
                    const startX = 20 + Math.random() * 60; // Start from middle area
                    const endX = (Math.random() - 0.5) * 200; // Drift left or right
                    const duration = 1.5 + Math.random() * 1;
                    const size = 24 + Math.random() * 24;
                    const rotation = (Math.random() - 0.5) * 720;
                    const animId = `flyMoney_${Date.now()}_${i}`;

                    money.innerHTML = emoji;
                    money.style.cssText = `
                        position: fixed;
                        font-size: ${size}px;
                        left: ${startX}%;
                        top: 60%;
                        pointer-events: none;
                        z-index: 10000;
                        animation: ${animId} ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                        text-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    `;

                    // Create unique keyframes for each emoji
                    const keyframes = document.createElement('style');
                    keyframes.textContent = `
                        @keyframes ${animId} {
                            0% {
                                transform: translateY(0) translateX(0) rotate(0deg) scale(0.5);
                                opacity: 0;
                            }
                            10% {
                                opacity: 1;
                                transform: translateY(-50px) translateX(${endX * 0.1}px) rotate(${rotation * 0.1}deg) scale(1);
                            }
                            80% {
                                opacity: 1;
                            }
                            100% {
                                transform: translateY(-500px) translateX(${endX}px) rotate(${rotation}deg) scale(0.3);
                                opacity: 0;
                            }
                        }
                    `;
                    document.head.appendChild(keyframes);

                    container.appendChild(money);

                    // Remove after animation
                    setTimeout(() => {
                        money.remove();
                        keyframes.remove();
                    }, duration * 1000 + 100);
                }, i * 80);
            }
        }

        // Set Cash Out display mode (list or grid)
        function setCashOutDisplayMode(mode) {
            cashOutViewState.displayMode = mode;
            renderCashOut();
        }

        // Render cash out record as grid card
        function renderCashOutCard(record) {
            const recordId = record.firestoreId || record.id;
            const recordDate = new Date(record.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const recordTime = record.createdTime || '--';
            const source = record.source || 'register';
            const sourceIcon = source === 'envelope' ? 'fa-envelope' : 'fa-cash-register';
            const sourceColor = source === 'envelope' ? '#f59e0b' : '#3b82f6';
            const sourceLabel = source === 'envelope' ? 'Envelope' : 'Register';

            return `
                <div class="cashout-grid-card" style="background: var(--bg-secondary); border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); transition: all 0.2s; display: flex; flex-direction: column;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 20px; color: white; position: relative;">
                        ${record.photoUrl ? `<div style="position: absolute; top: 10px; right: 10px; width: 40px; height: 40px; border-radius: 8px; overflow: hidden; border: 2px solid rgba(255,255,255,0.3); cursor: pointer;" onclick="viewCashOutPhoto('${record.photoUrl}')"><img src="${record.photoUrl}" style="width: 100%; height: 100%; object-fit: cover;"></div>` : ''}
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">${recordDate} · ${recordTime}</div>
                                <div style="font-size: 28px; font-weight: 700;">$${record.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                            </div>
                            <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; ${record.photoUrl ? 'margin-right: 45px;' : ''}">
                                <i class="fas fa-money-bill-wave" style="font-size: 20px;"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Body -->
                    <div style="padding: 16px 20px; flex: 1;">
                        <!-- Name -->
                        <div style="font-weight: 600; font-size: 15px; color: var(--text-primary); margin-bottom: 8px;">
                            ${record.name}
                        </div>

                        <!-- Reason -->
                        ${record.reason ? `
                            <div style="font-size: 13px; color: var(--text-muted); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin-bottom: 12px;">
                                ${record.reason}
                            </div>
                        ` : ''}

                        <!-- Meta Info -->
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
                            <span style="background: var(--accent-primary); color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                                ${record.store || 'N/A'}
                            </span>
                            <span style="background: ${sourceColor}20; color: ${sourceColor}; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="fas ${sourceIcon}" style="font-size: 10px;"></i> ${sourceLabel}
                            </span>
                        </div>

                        <!-- Created By -->
                        <div style="font-size: 12px; color: var(--text-muted);">
                            <i class="fas fa-user" style="margin-right: 6px;"></i>${record.createdBy}
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="padding: 12px 20px; border-top: 1px solid var(--border-color); display: flex; gap: 8px; justify-content: flex-end;">
                        <button onclick="viewCashOutDetails('${recordId}')" class="btn-icon" title="View Details" style="width: 32px; height: 32px;">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="editCashOut('${recordId}')" class="btn-icon" title="Edit" style="width: 32px; height: 32px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteCashOut('${recordId}')" class="btn-icon" title="Delete" style="width: 32px; height: 32px; color: var(--danger);">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        // Get date range based on view type
        function getCashOutDateRange() {
            const now = new Date();
            let startDate, endDate = new Date(now);

            if (cashOutViewState.viewType === 'week') {
                // Get start of current week (Sunday)
                const day = now.getDay();
                startDate = new Date(now);
                startDate.setDate(now.getDate() - day);
                startDate.setHours(0, 0, 0, 0);
            } else {
                // Get start of current month
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            }

            endDate.setHours(23, 59, 59, 999);
            return { startDate, endDate };
        }

        // Initialize cashout charts
        function initializeCashOutCharts() {
            // Destroy existing charts
            Object.values(cashOutCharts).forEach(chart => {
                if (chart) chart.destroy();
            });

            // Apply store filter
            let filtered = cashOutRecords;
            if (currentCashOutStoreFilter !== 'all') {
                filtered = cashOutRecords.filter(r => r.store === currentCashOutStoreFilter);
            }

            if (filtered.length === 0) return;

            const { startDate, endDate } = getCashOutDateRange();

            // Filter records by date range
            const rangeFiltered = filtered.filter(r => {
                const recordDate = new Date(r.createdDate);
                return recordDate >= startDate && recordDate <= endDate;
            });

            // 1. Daily Expenses Chart
            initializeDailyExpensesChart(rangeFiltered);

            // 2. Store Breakdown Chart (use all records for store breakdown, but respect store filter)
            initializeStoreBreakdownChart(filtered);

            // 3. Trend Chart
            initializeTrendChart(filtered);
        }

        // Daily expenses bar chart
        function initializeDailyExpensesChart(records) {
            const dailyCtx = document.getElementById('cashout-daily-chart');
            if (!dailyCtx) return;

            // Group by day
            const dailyData = {};
            records.forEach(r => {
                const dateStr = new Date(r.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                dailyData[dateStr] = (dailyData[dateStr] || 0) + r.amount;
            });

            const labels = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b));
            const data = labels.map(label => dailyData[label]);

            cashOutCharts.dailyChart = new Chart(dailyCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Amount ($)',
                        data: data,
                        backgroundColor: '#8b5cf6',
                        borderColor: '#7c3aed',
                        borderWidth: 1,
                        borderRadius: 6,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'x',
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return '$' + context.parsed.y.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});
                                }
                            }
                        }
                    }
                }
            });
        }

        // Store breakdown pie chart
        function initializeStoreBreakdownChart(records) {
            const storeCtx = document.getElementById('cashout-store-chart');
            if (!storeCtx) return;

            // Group by store
            const storeData = {};
            records.forEach(r => {
                const store = r.store || 'Unknown';
                storeData[store] = (storeData[store] || 0) + r.amount;
            });

            const labels = Object.keys(storeData);
            const data = Object.values(storeData);

            // Color palette
            const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4'];

            cashOutCharts.storeChart = new Chart(storeCtx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: colors.slice(0, labels.length),
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 12,
                                font: { size: 12 }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return '$' + value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' (' + percentage + '%)';
                                }
                            }
                        }
                    }
                }
            });
        }

        // Trend line chart (last 30 days)
        function initializeTrendChart(records) {
            const trendCtx = document.getElementById('cashout-trend-chart');
            if (!trendCtx) return;

            // Get last 30 days
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            const trendData = {};
            for (let i = 29; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                trendData[dateStr] = 0;
            }

            records.forEach(r => {
                const recordDate = new Date(r.createdDate);
                if (recordDate >= thirtyDaysAgo) {
                    const dateStr = recordDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    if (trendData.hasOwnProperty(dateStr)) {
                        trendData[dateStr] += r.amount;
                    }
                }
            });

            const labels = Object.keys(trendData);
            const data = Object.values(trendData);

            // Calculate cumulative sum
            let cumulative = 0;
            const cumulativeData = data.map(val => cumulative += val);

            cashOutCharts.trendChart = new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Cumulative Total ($)',
                        data: cumulativeData,
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#8b5cf6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return '$' + context.parsed.y.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});
                                }
                            }
                        }
                    }
                }
            });
        }

        async function deleteCashOut(id) {
            showConfirmModal({
                title: 'Delete Cash Out',
                message: 'Are you sure you want to delete this cash out record? This action cannot be undone.',
                confirmText: 'Delete',
                type: 'danger',
                onConfirm: async () => {
                    try {
                        // Delete from Firebase
                        if (typeof firebaseCashOutManager !== 'undefined' && firebaseCashOutManager.isInitialized) {
                            const success = await firebaseCashOutManager.deleteCashOutRecord(id);
                            if (success) {
                                cashOutRecords = cashOutRecords.filter(r => r.id !== id && r.firestoreId !== id);
                                renderCashOut();
                                showNotification('Cash out deleted', 'success');
                            } else {
                                showNotification('Error deleting from Firebase', 'error');
                            }
                        } else {
                            // Fallback to local deletion
                            cashOutRecords = cashOutRecords.filter(r => r.id !== id && r.firestoreId !== id);
                            renderCashOut();
                            showNotification('Cash out deleted', 'success');
                        }
                    } catch (error) {
                        console.error('Error deleting cash out:', error);
                        showNotification('Error deleting cash out', 'error');
                    }
                }
            });
        }

        // AI scan for Cash Out - analyze receipt to auto-fill (photo not saved)
        async function scanCashOutWithAI() {
            const photoInput = document.getElementById('cashout-ai-photo');

            if (!photoInput || !photoInput.files || !photoInput.files[0]) {
                alert('Please upload a receipt image first.');
                return;
            }

            const file = photoInput.files[0];
            const isPdf = file.type === 'application/pdf';
            if (isPdf) {
                alert('Please upload an image file (JPG, PNG), not a PDF.');
                return;
            }

            // Show loading state
            const scanBtn = document.getElementById('cashout-ai-scan-btn');
            const originalText = scanBtn ? scanBtn.innerHTML : '';
            if (scanBtn) {
                scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
                scanBtn.disabled = true;
            }

            try {
                // Convert image to base64
                const base64Image = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                const apiKey = getOpenAIKey();

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
                                        image_url: { url: base64Image }
                                    },
                                    {
                                        type: 'text',
                                        text: `Analyze this receipt/expense image and extract the following information. Return ONLY a JSON object with these fields (use null for any field you cannot find):

{
    "total": "the total amount as a number (no currency symbols)",
    "date": "the date in YYYY-MM-DD format",
    "description": "the store name or a brief description of what was purchased",
    "notes": "any relevant details like items purchased, payment method, etc."
}

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
                if (receiptData.description) {
                    document.getElementById('cashout-name').value = receiptData.description;
                }
                if (receiptData.total) {
                    const amount = parseFloat(receiptData.total.toString().replace(/[^0-9.]/g, ''));
                    if (!isNaN(amount)) {
                        document.getElementById('cashout-amount').value = amount.toFixed(2);
                    }
                }
                if (receiptData.date) {
                    document.getElementById('cashout-date').value = receiptData.date;
                }
                if (receiptData.notes) {
                    document.getElementById('cashout-reason').value = receiptData.notes;
                }

                // Clear the file input (photo won't be saved)
                photoInput.value = '';

                alert('Receipt scanned successfully! Please review the values.');

            } catch (error) {
                console.error('Error scanning receipt with AI:', error);
                alert('Error scanning: ' + error.message);
            } finally {
                if (scanBtn) {
                    scanBtn.innerHTML = originalText || '<i class="fas fa-magic"></i> Scan Receipt';
                    scanBtn.disabled = false;
                }
            }
        }

        // Helper functions for cashout photo and source selection
        let cashoutSelectedPhoto = null;

        window.selectCashOutSource = function(source) {
            document.getElementById('cashout-source-register').checked = (source === 'register');
            document.getElementById('cashout-source-envelope').checked = (source === 'envelope');

            // Update visual styles
            const registerIcon = document.getElementById('source-icon-register');
            const envelopeIcon = document.getElementById('source-icon-envelope');

            if (source === 'register') {
                registerIcon.style.background = '#3b82f620';
                registerIcon.querySelector('i').style.color = '#3b82f6';
                registerIcon.parentElement.style.borderColor = '#3b82f6';
                envelopeIcon.style.background = 'var(--bg-hover)';
                envelopeIcon.querySelector('i').style.color = 'var(--text-muted)';
                envelopeIcon.parentElement.style.borderColor = 'var(--border-color)';
            } else {
                envelopeIcon.style.background = '#f59e0b20';
                envelopeIcon.querySelector('i').style.color = '#f59e0b';
                envelopeIcon.parentElement.style.borderColor = '#f59e0b';
                registerIcon.style.background = 'var(--bg-hover)';
                registerIcon.querySelector('i').style.color = 'var(--text-muted)';
                registerIcon.parentElement.style.borderColor = 'var(--border-color)';
            }
        }

        window.previewCashOutPhoto = function(input) {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                cashoutSelectedPhoto = file;

                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('cashout-photo-img').src = e.target.result;
                    document.getElementById('cashout-photo-preview').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        }

        window.removeCashOutPhoto = function() {
            cashoutSelectedPhoto = null;
            document.getElementById('cashout-photo').value = '';
            document.getElementById('cashout-photo-preview').style.display = 'none';
            document.getElementById('cashout-photo-img').src = '';
        }

        window.viewCashOutPhoto = function(url) {
            openModal('image-viewer', { url: url, title: 'Cash Out Photo' });
        }

        // Upload photo to Firebase Storage
        async function uploadCashOutPhoto(file, recordId) {
            if (!file || !firebase.storage) {
                console.warn('Firebase Storage not available or no file');
                return null;
            }

            try {
                const storageRef = firebase.storage().ref();
                const timestamp = Date.now();
                const fileName = `cashout_${recordId}_${timestamp}.${file.name.split('.').pop()}`;
                const photoRef = storageRef.child(`cashout-photos/${fileName}`);

                const snapshot = await photoRef.put(file);
                const downloadUrl = await snapshot.ref.getDownloadURL();
                return downloadUrl;
            } catch (error) {
                console.error('Error uploading photo:', error);
                return null;
            }
        }

        async function createCashOut() {
            const name = document.getElementById('cashout-name').value.trim();
            const amount = parseFloat(document.getElementById('cashout-amount').value);
            const store = document.getElementById('cashout-store').value;
            const date = document.getElementById('cashout-date').value;
            const time = document.getElementById('cashout-time')?.value || new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
            const reason = document.getElementById('cashout-reason').value.trim();
            const source = document.querySelector('input[name="cashout-source"]:checked')?.value || 'register';

            if (!name || !amount || !store) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            if (amount <= 0) {
                showNotification('Amount must be greater than zero', 'error');
                return;
            }

            // Get current user
            const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

            const newRecord = {
                name,
                amount,
                store,
                reason,
                source,
                createdDate: date || new Date().toISOString().split('T')[0],
                createdTime: time,
                createdBy: user?.name || 'Unknown',
                status: 'open',
                closedDate: null,
                receiptPhoto: null,
                photoUrl: null,
                amountSpent: null,
                moneyLeft: null,
                hasMoneyLeft: null
            };

            try {
                // Save to Firebase
                if (typeof firebaseCashOutManager !== 'undefined' && firebaseCashOutManager.isInitialized) {
                    const docId = await firebaseCashOutManager.addCashOutRecord(newRecord);
                    if (docId) {
                        newRecord.id = docId;
                        newRecord.firestoreId = docId;

                        // Upload photo if selected
                        if (cashoutSelectedPhoto) {
                            showNotification('Uploading photo...', 'info');
                            const photoUrl = await uploadCashOutPhoto(cashoutSelectedPhoto, docId);
                            if (photoUrl) {
                                newRecord.photoUrl = photoUrl;
                                // Update the record with the photo URL
                                await firebaseCashOutManager.updateCashOutRecord(docId, { photoUrl: photoUrl });
                            }
                        }

                        cashOutRecords.unshift(newRecord);
                        cashoutSelectedPhoto = null;
                        closeModal();
                        renderCashOut();
                        showNotification('Cash out added!', 'success');
                    } else {
                        showNotification('Error saving to Firebase', 'error');
                    }
                } else {
                    // Fallback to local storage
                    newRecord.id = cashOutRecords.length > 0 ? Math.max(...cashOutRecords.map(r => r.id || 0)) + 1 : 1;
                    cashOutRecords.unshift(newRecord);
                    cashoutSelectedPhoto = null;
                    closeModal();
                    renderCashOut();
                    showNotification('Cash out added!', 'success');
                }
            } catch (error) {
                console.error('Error creating cash out:', error);
                showNotification('Error creating cash out', 'error');
            }
        }

        async function closeCashOut(recordId) {
            const amountSpent = parseFloat(document.getElementById('cashout-amount-spent').value);
            const hasMoneyLeft = document.getElementById('cashout-money-left-yes').checked;
            const receiptInput = document.getElementById('cashout-receipt-photo');

            if (isNaN(amountSpent)) {
                showNotification('Please enter the amount spent', 'error');
                return;
            }

            const record = cashOutRecords.find(r => r.id === recordId || r.firestoreId === recordId);
            if (!record) return;

            // Check if amount exceeds and show warning modal
            if (amountSpent > record.amount) {
                showConfirmModal({
                    title: 'Amount Exceeds Original',
                    message: `Amount spent ($${amountSpent.toFixed(2)}) exceeds the original amount ($${record.amount.toFixed(2)}). Are you sure you want to continue?`,
                    confirmText: 'Continue',
                    type: 'warning',
                    onConfirm: () => {
                        processCloseCashOut(recordId, amountSpent, hasMoneyLeft, receiptInput, record);
                    }
                });
                return;
            }

            processCloseCashOut(recordId, amountSpent, hasMoneyLeft, receiptInput, record);
        }

        async function processCloseCashOut(recordId, amountSpent, hasMoneyLeft, receiptInput, record) {

            // Upload receipt to Firebase Storage if provided
            let receiptUrl = null;
            let receiptPath = null;
            if (receiptInput && receiptInput.files && receiptInput.files[0]) {
                const rawBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(receiptInput.files[0]);
                });

                // Initialize storage helper if needed
                if (!firebaseStorageHelper.isInitialized) {
                    firebaseStorageHelper.initialize();
                }

                try {
                    const uploadResult = await firebaseStorageHelper.uploadImage(
                        rawBase64,
                        'cashout/receipts',
                        recordId.toString()
                    );
                    receiptUrl = uploadResult.url;
                    receiptPath = uploadResult.path;
                } catch (err) {
                    console.error('Error uploading cash out receipt to Storage:', err);
                    // Fallback to compressed base64
                    try {
                        receiptUrl = await compressImage(rawBase64);
                    } catch (compressErr) {
                        console.error('Error compressing receipt image:', compressErr);
                        receiptUrl = rawBase64;
                    }
                }
            }

            const updateData = {
                status: 'closed',
                closedDate: new Date().toISOString().split('T')[0],
                amountSpent: amountSpent,
                moneyLeft: record.amount - amountSpent,
                hasMoneyLeft: hasMoneyLeft,
                receiptPhoto: receiptUrl,     // Now stores URL instead of base64
                receiptPath: receiptPath      // For future deletion
            };

            try {
                // Update in Firebase
                const firestoreId = record.firestoreId || record.id;
                if (typeof firebaseCashOutManager !== 'undefined' && firebaseCashOutManager.isInitialized) {
                    const success = await firebaseCashOutManager.updateCashOutRecord(firestoreId, updateData);
                    if (success) {
                        // Update local record
                        Object.assign(record, updateData);
                        closeModal();
                        renderCashOut();
                        showNotification('Cash out closed successfully', 'success');
                    } else {
                        showNotification('Error updating in Firebase', 'error');
                    }
                } else {
                    // Fallback to local update
                    Object.assign(record, updateData);
                    closeModal();
                    renderCashOut();
                    showNotification('Cash out closed successfully', 'success');
                }
            } catch (error) {
                console.error('Error closing cash out:', error);
                showNotification('Error closing cash out', 'error');
            }
        }

        // Edit Cash Out function
        function editCashOut(recordId) {
            const record = cashOutRecords.find(r => r.id === recordId || r.firestoreId === recordId || String(r.id) === String(recordId) || String(r.firestoreId) === String(recordId));

            if (!record) {
                console.error('Record not found for ID:', recordId);
                showNotification('Record not found', 'error');
                return;
            }

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            if (!modal || !modalContent) {
                console.error('Modal elements not found');
                return;
            }

            const firestoreId = record.firestoreId || record.id;

            modalContent.innerHTML = `
                <div class="modal-header" style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 20px 24px; margin: -20px -24px 20px -24px; border-radius: 12px 12px 0 0;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-edit" style="font-size: 20px;"></i>
                        </div>
                        <div>
                            <h2 style="margin: 0; font-size: 20px;">Edit Expense</h2>
                            <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">Modify expense details</p>
                        </div>
                    </div>
                    <button class="modal-close" onclick="closeModal()" style="color: white;"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <form id="edit-cashout-form" onsubmit="event.preventDefault(); saveCashOutChanges('${firestoreId}');">
                        <div class="form-group">
                            <label class="form-label">Expense Name / Description *</label>
                            <input type="text" class="form-input" id="edit-cashout-name" value="${record.name || ''}" required placeholder="e.g., Office Supplies">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Amount *</label>
                                <div style="position: relative;">
                                    <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-weight: 600;">$</span>
                                    <input type="number" step="0.01" class="form-input" id="edit-cashout-amount" value="${record.amount || ''}" required style="padding-left: 28px;" placeholder="0.00">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Date</label>
                                <input type="date" class="form-input" id="edit-cashout-date" value="${record.createdDate || ''}">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Store *</label>
                            <select class="form-input" id="edit-cashout-store" required>
                                <option value="">Select store...</option>
                                <option value="Miramar" ${record.store === 'Miramar' ? 'selected' : ''}>VSU Miramar</option>
                                <option value="Morena" ${record.store === 'Morena' ? 'selected' : ''}>VSU Morena</option>
                                <option value="Kearny Mesa" ${record.store === 'Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                                <option value="Chula Vista" ${record.store === 'Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                                <option value="North Park" ${record.store === 'North Park' ? 'selected' : ''}>VSU North Park</option>
                                <option value="Miramar Wine & Liquor" ${record.store === 'Miramar Wine & Liquor' ? 'selected' : ''}>Miramar Wine & Liquor</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Reason / Notes</label>
                            <textarea class="form-input" id="edit-cashout-reason" rows="3" placeholder="Describe the expense...">${record.reason || ''}</textarea>
                        </div>

                        <div class="form-actions" style="margin-top: 24px; display: flex; gap: 12px; justify-content: flex-end;">
                            <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="btn-primary" style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); border: none;">
                                <i class="fas fa-save"></i> Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            `;

            modal.classList.add('active');
        }

        // Save Cash Out changes
        async function saveCashOutChanges(recordId) {
            const name = document.getElementById('edit-cashout-name').value.trim();
            const amount = parseFloat(document.getElementById('edit-cashout-amount').value);
            const store = document.getElementById('edit-cashout-store').value;
            const date = document.getElementById('edit-cashout-date').value;
            const reason = document.getElementById('edit-cashout-reason').value.trim();

            if (!name || !amount || !store) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            if (amount <= 0) {
                showNotification('Amount must be greater than zero', 'error');
                return;
            }

            const updateData = {
                name,
                amount,
                store,
                reason,
                createdDate: date || new Date().toISOString().split('T')[0]
            };

            try {
                // Update in Firebase
                if (typeof firebaseCashOutManager !== 'undefined' && firebaseCashOutManager.isInitialized) {
                    const success = await firebaseCashOutManager.updateCashOutRecord(recordId, updateData);
                    if (success) {
                        // Update local state
                        const idx = cashOutRecords.findIndex(r => r.id === recordId || r.firestoreId === recordId);
                        if (idx !== -1) {
                            cashOutRecords[idx] = { ...cashOutRecords[idx], ...updateData };
                        }
                        closeModal();
                        renderCashOut();
                        showNotification('Expense updated successfully!', 'success');
                    } else {
                        showNotification('Error updating expense', 'error');
                    }
                } else {
                    // Fallback to local only
                    const idx = cashOutRecords.findIndex(r => r.id === recordId || r.firestoreId === recordId);
                    if (idx !== -1) {
                        cashOutRecords[idx] = { ...cashOutRecords[idx], ...updateData };
                    }
                    closeModal();
                    renderCashOut();
                    showNotification('Expense updated locally', 'success');
                }
            } catch (error) {
                console.error('Error saving expense changes:', error);
                showNotification('Error saving changes', 'error');
            }
        }

        function viewCashOutDetails(recordId) {
            const record = cashOutRecords.find(r => r.id === recordId || r.firestoreId === recordId || String(r.id) === String(recordId) || String(r.firestoreId) === String(recordId));

            if (!record) {
                console.error('Record not found for ID:', recordId);
                showNotification('Record not found', 'error');
                return;
            }

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            if (!modal || !modalContent) {
                console.error('Modal elements not found');
                return;
            }

            const receiptDisplay = record.receiptPhoto
                ? `<img src="${record.receiptPhoto}" style="width: 100%; max-width: 400px; border-radius: 8px; margin-top: 8px;" alt="Receipt">`
                : '<div style="color: var(--text-muted); font-style: italic;">No receipt uploaded</div>';

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-info-circle"></i> Cash Out Details</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; gap: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Cash Out Name</div>
                                <div style="font-size: 18px; font-weight: 600;">${record.name}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Store</div>
                                <span class="badge" style="background: var(--accent-primary);">
                                    <i class="fas fa-store"></i> ${record.store || 'N/A'}
                                </span>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Created By</div>
                                <div style="font-weight: 500;">${record.createdBy}</div>
                            </div>
                            <div>
                                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Created Date</div>
                                <div style="font-weight: 500;">${formatDate(record.createdDate)}</div>
                            </div>
                        </div>

                        <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px;">
                            <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Reason</div>
                            <div style="font-size: 14px;">${record.reason || 'No reason provided'}</div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Amount Given</div>
                                <div style="font-size: 24px; font-weight: 700; color: var(--accent-primary);">
                                    $${record.amount ? record.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
                                </div>
                            </div>
                            <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Status</div>
                                <span class="badge" style="background: ${record.status === 'open' ? 'var(--warning)' : 'var(--success)'}; font-size: 14px; padding: 8px 16px;">
                                    ${record.status === 'open' ? 'Open' : 'Closed'}
                                </span>
                            </div>
                        </div>

                        ${record.status === 'closed' ? `
                            <div style="border-top: 2px solid var(--border-color); padding-top: 16px; margin-top: 8px;">
                                <h3 style="font-size: 16px; margin-bottom: 16px;">Closure Details</h3>

                                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                    <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; text-align: center;">
                                        <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Amount Spent</div>
                                        <div style="font-size: 20px; font-weight: 700; color: var(--danger);">
                                            $${(record.amountSpent || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </div>
                                    </div>
                                    <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; text-align: center;">
                                        <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Money Left</div>
                                        <div style="font-size: 20px; font-weight: 700; color: ${record.hasMoneyLeft ? 'var(--success)' : 'var(--text-muted)'};">
                                            $${(record.moneyLeft || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </div>
                                    </div>
                                    <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; text-align: center;">
                                        <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Closed Date</div>
                                        <div style="font-size: 14px; font-weight: 600;">
                                            ${formatDate(record.closedDate)}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Receipt Photo</div>
                                    ${receiptDisplay}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    ${record.status === 'open' ? `
                        <button class="btn-primary" onclick="closeModal(); setTimeout(() => openModal('close-cashout', '${record.firestoreId || record.id}'), 100);">
                            <i class="fas fa-check"></i> Close Cash Out
                        </button>
                    ` : ''}
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                </div>
            `;

            modal.classList.add('active');
        }

        // Issues Functions
        // Issue status configuration
        const issueStatusConfig = {
            'open': { label: 'Open', icon: 'fa-circle-exclamation', color: '#ef4444', bg: '#ef444420' },
            'follow-up': { label: 'Need Follow Up', icon: 'fa-clock', color: '#f59e0b', bg: '#f59e0b20' },
            'resolved': { label: 'Resolved', icon: 'fa-circle-check', color: '#10b981', bg: '#10b98120' }
        };

        // Current filter for issues
        let currentIssueStatusFilter = 'all';
        let currentIssueStoreFilter = 'all';
        let issuesFirebaseInitialized = false;
        let issuesViewMode = 'gallery'; // 'gallery' or 'table'

        async function renderIssues() {
            // Initialize Firebase for issues on first render
            if (!issuesFirebaseInitialized) {
                issuesFirebaseInitialized = true;
                await initializeFirebaseIssues();
            }
            const dashboard = document.querySelector('.dashboard');

            // Filter issues based on store filter first (for accurate counts)
            let storeFilteredIssues = [...issues];
            if (currentIssueStoreFilter !== 'all') {
                storeFilteredIssues = issues.filter(i => i.store === currentIssueStoreFilter);
            }

            // Count issues by status (after store filter)
            const openCount = storeFilteredIssues.filter(i => !i.status || i.status === 'open').length;
            const followUpCount = storeFilteredIssues.filter(i => i.status === 'follow-up').length;
            const resolvedCount = storeFilteredIssues.filter(i => i.status === 'resolved').length;

            // Filter issues based on status filter
            let filteredIssues = [...storeFilteredIssues];
            if (currentIssueStatusFilter !== 'all') {
                if (currentIssueStatusFilter === 'open') {
                    filteredIssues = storeFilteredIssues.filter(i => !i.status || i.status === 'open');
                } else {
                    filteredIssues = storeFilteredIssues.filter(i => i.status === currentIssueStatusFilter);
                }
            }

            // Sort issues by date, most recent first
            const sortedIssues = filteredIssues.sort((a, b) => new Date(b.incidentDate) - new Date(a.incidentDate));

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Customer Issue Log</h2>
                        <p class="section-subtitle">Track orders needing follow-up</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('create-issue')">
                        <i class="fas fa-plus"></i>
                        New Issue
                    </button>
                </div>

                <!-- Status Summary Cards -->
                <div class="issues-status-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div class="card" onclick="filterIssuesByStatus('open')" style="cursor: pointer; transition: all 0.2s; ${currentIssueStatusFilter === 'open' ? 'border: 2px solid #ef4444;' : ''}">
                        <div class="card-body" style="padding: 20px; display: flex; align-items: center; gap: 16px;">
                            <div style="width: 50px; height: 50px; background: #ef444420; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-circle-exclamation" style="font-size: 24px; color: #ef4444;"></i>
                            </div>
                            <div>
                                <div style="font-size: 28px; font-weight: 700; color: #ef4444;">${openCount}</div>
                                <div style="font-size: 13px; color: var(--text-muted);">Open</div>
                            </div>
                        </div>
                    </div>
                    <div class="card" onclick="filterIssuesByStatus('follow-up')" style="cursor: pointer; transition: all 0.2s; ${currentIssueStatusFilter === 'follow-up' ? 'border: 2px solid #f59e0b;' : ''}">
                        <div class="card-body" style="padding: 20px; display: flex; align-items: center; gap: 16px;">
                            <div style="width: 50px; height: 50px; background: #f59e0b20; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-clock" style="font-size: 24px; color: #f59e0b;"></i>
                            </div>
                            <div>
                                <div style="font-size: 28px; font-weight: 700; color: #f59e0b;">${followUpCount}</div>
                                <div style="font-size: 13px; color: var(--text-muted);">Need Follow Up</div>
                            </div>
                        </div>
                    </div>
                    <div class="card" onclick="filterIssuesByStatus('resolved')" style="cursor: pointer; transition: all 0.2s; ${currentIssueStatusFilter === 'resolved' ? 'border: 2px solid #10b981;' : ''}">
                        <div class="card-body" style="padding: 20px; display: flex; align-items: center; gap: 16px;">
                            <div style="width: 50px; height: 50px; background: #10b98120; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-circle-check" style="font-size: 24px; color: #10b981;"></i>
                            </div>
                            <div>
                                <div style="font-size: 28px; font-weight: 700; color: #10b981;">${resolvedCount}</div>
                                <div style="font-size: 13px; color: var(--text-muted);">Resolved</div>
                            </div>
                        </div>
                    </div>
                    <div class="card" onclick="filterIssuesByStatus('all')" style="cursor: pointer; transition: all 0.2s; ${currentIssueStatusFilter === 'all' ? 'border: 2px solid var(--accent-primary);' : ''}">
                        <div class="card-body" style="padding: 20px; display: flex; align-items: center; gap: 16px;">
                            <div style="width: 50px; height: 50px; background: var(--accent-primary)20; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-list" style="font-size: 24px; color: var(--accent-primary);"></i>
                            </div>
                            <div>
                                <div style="font-size: 28px; font-weight: 700; color: var(--accent-primary);">${storeFilteredIssues.length}</div>
                                <div style="font-size: 13px; color: var(--text-muted);">All Issues</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Customer Response Chart -->
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-header issues-card-header" style="flex-wrap: wrap; gap: 12px;">
                        <div>
                            <h3 class="card-title">
                                <i class="fas fa-comments"></i>
                                Customer Response
                            </h3>
                            <span style="font-size: 13px; color: var(--text-muted);">How customers felt when leaving</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
                            <select id="issue-store-filter" class="form-input" onchange="filterIssuesByStore(this.value)" style="width: 200px; padding: 8px 12px; font-size: 13px;">
                                <option value="all" ${currentIssueStoreFilter === 'all' ? 'selected' : ''}>All Stores</option>
                                <option value="Miramar" ${currentIssueStoreFilter === 'Miramar' ? 'selected' : ''}>VSU Miramar</option>
                                <option value="Morena" ${currentIssueStoreFilter === 'Morena' ? 'selected' : ''}>VSU Morena</option>
                                <option value="Kearny Mesa" ${currentIssueStoreFilter === 'Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                                <option value="Chula Vista" ${currentIssueStoreFilter === 'Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                                <option value="North Park" ${currentIssueStoreFilter === 'North Park' ? 'selected' : ''}>VSU North Park</option>
                                <option value="Miramar Wine & Liquor" ${currentIssueStoreFilter === 'Miramar Wine & Liquor' ? 'selected' : ''}>Miramar Wine & Liquor</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-body issues-perception-chart">
                        ${renderPerceptionGanttChart()}
                    </div>
                </div>

                <!-- Order Issues List -->
                <div class="card">
                    <div class="card-header" style="justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <h3 class="card-title">
                                <i class="fas fa-clipboard-list"></i>
                                ${currentIssueStatusFilter === 'all' ? 'Order Issues' : issueStatusConfig[currentIssueStatusFilter]?.label || 'Order Issues'}
                            </h3>
                            <span class="badge" style="background: var(--accent-primary);">${sortedIssues.length} ${sortedIssues.length === 1 ? 'Issue' : 'Issues'}</span>
                        </div>
                        <div class="view-toggle" style="display: flex; gap: 4px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 4px;">
                            <button class="view-toggle-btn ${issuesViewMode === 'gallery' ? 'active' : ''}" onclick="toggleIssuesView('gallery')" title="Gallery View">
                                <i class="fas fa-th-large"></i>
                            </button>
                            <button class="view-toggle-btn ${issuesViewMode === 'table' ? 'active' : ''}" onclick="toggleIssuesView('table')" title="Table View">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body" style="padding: ${issuesViewMode === 'gallery' ? '20px' : '0'};">
                        ${sortedIssues.length === 0 ? `
                            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                                No issues ${currentIssueStatusFilter !== 'all' ? 'with this status' : 'recorded yet'}
                            </div>
                        ` : issuesViewMode === 'table' ? `
                            <table class="data-table issues-table">
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Order #</th>
                                        <th>Store</th>
                                        <th>Customer</th>
                                        <th>Phone</th>
                                        <th>Type</th>
                                        <th>Description</th>
                                        <th>Response</th>
                                        <th style="width: 180px;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${sortedIssues.map(issue => {
                                        const status = issue.status || 'open';
                                        const statusConfig = issueStatusConfig[status] || issueStatusConfig['open'];
                                        return `
                                        <tr onclick="viewIssueDetails('${issue.firestoreId || issue.id}')" style="cursor: pointer;">
                                            <td data-label="Status">
                                                <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: ${statusConfig.bg}; color: ${statusConfig.color}; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                                    <i class="fas ${statusConfig.icon}"></i>
                                                    ${statusConfig.label}
                                                </span>
                                            </td>
                                            <td data-label="Date" style="white-space: nowrap;">${formatDate(issue.incidentDate)}</td>
                                            <td data-label="Order #" style="font-weight: 600; color: var(--accent-primary);">${issue.orderNumber || '-'}</td>
                                            <td data-label="Store">
                                                ${issue.store ? `
                                                    <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-secondary);">
                                                        <i class="fas fa-store" style="color: var(--accent-primary);"></i>
                                                        ${issue.store}
                                                    </span>
                                                ` : '<span style="color: var(--text-muted);">-</span>'}
                                            </td>
                                            <td data-label="Customer"><strong>${issue.customer}</strong></td>
                                            <td data-label="Phone">
                                                ${issue.phone ? `<a href="tel:${issue.phone}" style="color: var(--accent-primary); text-decoration: none;"><i class="fas fa-phone"></i> ${issue.phone}</a>` : '-'}
                                            </td>
                                            <td data-label="Type">
                                                <span class="badge" style="background: ${issue.type === 'In Store' ? 'var(--accent-primary)' : 'var(--info)'};">
                                                    <i class="fas fa-${issue.type === 'In Store' ? 'store' : 'globe'}"></i>
                                                    ${issue.type}
                                                </span>
                                            </td>
                                            <td data-label="Description" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${issue.description || '-'}</td>
                                            <td data-label="Response" style="text-align: center; font-size: 24px;">
                                                ${issue.perception ? getPerceptionEmoji(issue.perception) : '-'}
                                            </td>
                                            <td data-label="Actions" onclick="event.stopPropagation()">
                                                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                                                    ${status !== 'follow-up' ? `
                                                        <button class="btn-icon" onclick="event.stopPropagation(); updateIssueStatus('${issue.firestoreId || issue.id}', 'follow-up')" title="Mark as Need Follow Up" style="background: #f59e0b20; color: #f59e0b; border: 1px solid #f59e0b50;">
                                                            <i class="fas fa-clock"></i>
                                                        </button>
                                                    ` : ''}
                                                    ${status !== 'resolved' ? `
                                                        <button class="btn-icon" onclick="event.stopPropagation(); updateIssueStatus('${issue.firestoreId || issue.id}', 'resolved')" title="Mark as Resolved" style="background: #10b98120; color: #10b981; border: 1px solid #10b98150;">
                                                            <i class="fas fa-check"></i>
                                                        </button>
                                                    ` : ''}
                                                    ${status !== 'open' ? `
                                                        <button class="btn-icon" onclick="event.stopPropagation(); updateIssueStatus('${issue.firestoreId || issue.id}', 'open')" title="Reopen Issue" style="background: #ef444420; color: #ef4444; border: 1px solid #ef444450;">
                                                            <i class="fas fa-rotate-left"></i>
                                                        </button>
                                                    ` : ''}
                                                    <button class="btn-icon" onclick="event.stopPropagation(); viewIssueDetails('${issue.firestoreId || issue.id}')" title="View Details">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                    <button class="btn-icon danger" onclick="event.stopPropagation(); deleteIssue('${issue.firestoreId || issue.id}')" title="Delete">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `}).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <!-- Gallery View -->
                            <div class="issues-gallery" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                                ${sortedIssues.map(issue => {
                                    const status = issue.status || 'open';
                                    const statusConfig = issueStatusConfig[status] || issueStatusConfig['open'];
                                    return `
                                    <div class="issue-card" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; transition: all 0.2s; cursor: pointer; position: relative; overflow: hidden;" onclick="viewIssueDetails('${issue.firestoreId || issue.id}')">
                                        <!-- Status Badge -->
                                        <div style="position: absolute; top: 12px; right: 12px;">
                                            <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: ${statusConfig.bg}; color: ${statusConfig.color}; border-radius: 20px; font-size: 11px; font-weight: 600;">
                                                <i class="fas ${statusConfig.icon}"></i>
                                                ${statusConfig.label}
                                            </span>
                                        </div>

                                        <!-- Customer Info -->
                                        <div style="margin-bottom: 16px; padding-right: 80px;">
                                            <h4 style="font-size: 18px; font-weight: 600; margin: 0 0 4px 0; color: var(--text-primary);">${issue.customer}</h4>
                                            <div style="font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                                <span><i class="fas fa-calendar"></i> ${formatDate(issue.incidentDate)}</span>
                                                ${issue.store ? `<span><i class="fas fa-store"></i> ${issue.store}</span>` : ''}
                                            </div>
                                        </div>

                                        <!-- Issue Type -->
                                        <div style="margin-bottom: 12px;">
                                            <span class="badge" style="background: ${issue.type === 'In Store' ? 'var(--accent-primary)' : 'var(--info)'}; font-size: 11px;">
                                                <i class="fas fa-${issue.type === 'In Store' ? 'store' : 'globe'}"></i>
                                                ${issue.type}
                                            </span>
                                        </div>

                                        <!-- Description -->
                                        <div style="margin-bottom: 16px; font-size: 14px; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                                            ${issue.description || 'No description provided'}
                                        </div>

                                        <!-- Customer Perception -->
                                        <div style="margin-bottom: 16px; padding: 12px; background: var(--bg-secondary); border-radius: 8px; text-align: center;">
                                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Customer Perception</div>
                                            <div style="font-size: 32px;">
                                                ${issue.perception ? getPerceptionEmoji(issue.perception) : '❓'}
                                            </div>
                                            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                                                ${issue.perception ? getPerceptionLabel(issue.perception) : 'Not Set'}
                                            </div>
                                        </div>

                                        <!-- Contact Info -->
                                        ${issue.phone ? `
                                            <div style="margin-bottom: 16px; padding: 10px; background: var(--bg-secondary); border-radius: 8px; display: flex; align-items: center; gap: 8px;">
                                                <i class="fas fa-phone" style="color: var(--accent-primary);"></i>
                                                <a href="tel:${issue.phone}" style="color: var(--text-primary); text-decoration: none; font-size: 13px;" onclick="event.stopPropagation();">${issue.phone}</a>
                                            </div>
                                        ` : ''}

                                        <!-- Actions -->
                                        <div style="display: flex; gap: 6px; justify-content: space-between; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);" onclick="event.stopPropagation();">
                                            ${status !== 'follow-up' ? `
                                                <button class="btn-icon" onclick="updateIssueStatus('${issue.firestoreId || issue.id}', 'follow-up'); event.stopPropagation();" title="Mark as Need Follow Up" style="background: #f59e0b20; color: #f59e0b; border: 1px solid #f59e0b50; flex: 1;">
                                                    <i class="fas fa-clock"></i>
                                                </button>
                                            ` : ''}
                                            ${status !== 'resolved' ? `
                                                <button class="btn-icon" onclick="updateIssueStatus('${issue.firestoreId || issue.id}', 'resolved'); event.stopPropagation();" title="Mark as Resolved" style="background: #10b98120; color: #10b981; border: 1px solid #10b98150; flex: 1;">
                                                    <i class="fas fa-check"></i>
                                                </button>
                                            ` : ''}
                                            ${status !== 'open' ? `
                                                <button class="btn-icon" onclick="updateIssueStatus('${issue.firestoreId || issue.id}', 'open'); event.stopPropagation();" title="Reopen Issue" style="background: #ef444420; color: #ef4444; border: 1px solid #ef444450; flex: 1;">
                                                    <i class="fas fa-rotate-left"></i>
                                                </button>
                                            ` : ''}
                                            <button class="btn-icon danger" onclick="deleteIssue('${issue.firestoreId || issue.id}'); event.stopPropagation();" title="Delete" style="flex: 1;">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    `}).join('')}
                            </div>
                        `}
                    </div>
                </div>
            `;

            // Update sidebar badge
            updateIssuesSidebarBadge();
        }

        // Toggle issues view mode
        function toggleIssuesView(mode) {
            issuesViewMode = mode;
            renderIssues();
        }

        // Filter issues by status
        function filterIssuesByStatus(status) {
            currentIssueStatusFilter = status;
            renderIssues();
        }

        // Filter issues by store
        function filterIssuesByStore(store) {
            currentIssueStoreFilter = store;
            renderIssues();
        }

        // Update issue status
        async function updateIssueStatus(issueId, newStatus) {
            const issue = issues.find(i => i.firestoreId === issueId || i.id === issueId);
            if (!issue) return;

            try {
                // Update locally
                issue.status = newStatus;
                if (!issue.statusHistory) issue.statusHistory = [];
                issue.statusHistory.push({
                    status: newStatus,
                    timestamp: new Date().toISOString(),
                    updatedBy: getCurrentUser()?.name || 'Unknown'
                });

                // Update in Firebase
                if (firebaseIssuesManager && firebaseIssuesManager.isInitialized && issue.firestoreId) {
                    await firebaseIssuesManager.updateIssue(issue.firestoreId, {
                        status: newStatus,
                        statusHistory: issue.statusHistory
                    });
                }

                renderIssues();

                const statusLabel = issueStatusConfig[newStatus]?.label || newStatus;
                showIssueToast(`Issue marked as "${statusLabel}"`, 'success');
            } catch (error) {
                console.error('Error updating issue status:', error);
                showIssueToast('Error updating status', 'error');
            }
        }

        // Update sidebar badge for issues needing follow up
        function updateIssuesSidebarBadge() {
            const followUpCount = issues.filter(i => i.status === 'follow-up').length;
            const openCount = issues.filter(i => !i.status || i.status === 'open').length;
            const totalPending = followUpCount + openCount;

            // Find the issues nav item
            const issuesNavItem = document.querySelector('.nav-item[data-page="issues"]');
            if (issuesNavItem) {
                // Remove existing badge
                const existingBadge = issuesNavItem.querySelector('.issues-badge');
                if (existingBadge) existingBadge.remove();

                // Add badge if there are pending issues
                if (totalPending > 0) {
                    const badge = document.createElement('span');
                    badge.className = 'issues-badge';
                    badge.style.cssText = `
                        position: absolute;
                        right: 8px;
                        background: ${followUpCount > 0 ? '#f59e0b' : '#ef4444'};
                        color: white;
                        font-size: 11px;
                        font-weight: 700;
                        padding: 2px 6px;
                        border-radius: 10px;
                        min-width: 18px;
                        text-align: center;
                    `;
                    badge.textContent = totalPending;
                    issuesNavItem.style.position = 'relative';
                    issuesNavItem.appendChild(badge);
                }
            }
        }

        // Toast notification for issues
        function showIssueToast(message, type = 'info') {
            let toastContainer = document.getElementById('issue-toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'issue-toast-container';
                toastContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px;';
                document.body.appendChild(toastContainer);
            }

            const toast = document.createElement('div');
            const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
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
                animation: issueSlideIn 0.3s ease;
            `;
            const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
            toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
            toastContainer.appendChild(toast);
            setTimeout(() => {
                toast.style.animation = 'issueSlideOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // Add CSS for issue toast animations
        const issueToastStyles = document.createElement('style');
        issueToastStyles.textContent = `
            @keyframes issueSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes issueSlideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        `;
        document.head.appendChild(issueToastStyles);

        function selectPerception(value) {
            // Update hidden input
            document.getElementById('issue-perception').value = value;

            // Update button styles
            const buttons = document.querySelectorAll('.perception-btn');
            buttons.forEach(btn => {
                const btnValue = parseInt(btn.dataset.value);
                if (btnValue === value) {
                    btn.style.borderColor = 'var(--accent-primary)';
                    btn.style.background = 'rgba(99, 102, 241, 0.1)';
                    btn.style.transform = 'scale(1.05)';
                } else {
                    btn.style.borderColor = 'var(--border-color)';
                    btn.style.background = 'var(--bg-secondary)';
                    btn.style.transform = 'scale(1)';
                }
            });
        }

        function getPerceptionEmoji(value) {
            const icons = {
                1: '<i class="fas fa-face-angry"></i>',
                2: '<i class="fas fa-face-frown"></i>',
                3: '<i class="fas fa-face-meh"></i>',
                4: '<i class="fas fa-face-smile"></i>',
                5: '<i class="fas fa-face-grin-beam"></i>'
            };
            return icons[value] || '<i class="fas fa-question"></i>';
        }

        function getPerceptionLabel(value) {
            const labels = {
                1: 'Very Upset',
                2: 'Upset',
                3: 'Neutral',
                4: 'Satisfied',
                5: 'Happy'
            };
            return labels[value] || 'Unknown';
        }

        function getPerceptionColor(value) {
            const colors = {
                1: '#ef4444',
                2: '#f97316',
                3: '#eab308',
                4: '#22c55e',
                5: '#10b981'
            };
            return colors[value] || '#6b7280';
        }

        function renderPerceptionGanttChart() {
            // Get issues with perception data, filtered by store
            let issuesWithPerception = issues
                .filter(i => i.perception !== null && i.perception !== undefined);

            // Apply store filter
            if (currentIssueStoreFilter !== 'all') {
                issuesWithPerception = issuesWithPerception.filter(i => i.store === currentIssueStoreFilter);
            }

            // Determine the store label for display
            const storeLabel = currentIssueStoreFilter === 'all' ? 'All Stores' : `VSU ${currentIssueStoreFilter}`;

            if (issuesWithPerception.length === 0) {
                return `
                    <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                        <i class="fas fa-chart-bar" style="font-size: 48px; margin-bottom: 16px; display: block; opacity: 0.5;"></i>
                        <p>No perception data recorded yet</p>
                        <p style="font-size: 13px;">Create issues with customer perception to see the chart</p>
                    </div>
                `;
            }

            // Calculate perception distribution for filtered issues
            const perceptionCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
            let totalSum = 0;
            issuesWithPerception.forEach(i => {
                if (perceptionCounts[i.perception] !== undefined) {
                    perceptionCounts[i.perception]++;
                    totalSum += i.perception;
                }
            });

            const total = issuesWithPerception.length;
            const average = total > 0 ? (totalSum / total) : 0;
            const averageRounded = Math.round(average * 10) / 10; // Round to 1 decimal
            const averageColor = getPerceptionColor(Math.round(average));
            const averageEmoji = getPerceptionEmoji(Math.round(average));
            const averagePercentage = (average / 5) * 100;

            return `
                <!-- Average Score Display -->
                <div style="display: flex; align-items: center; justify-content: center; gap: 24px; margin-bottom: 24px; padding: 24px; background: linear-gradient(135deg, ${averageColor}15, ${averageColor}08); border: 2px solid ${averageColor}40; border-radius: 16px;">
                    <div style="text-align: center; color: ${averageColor};">
                        <div style="font-size: 56px; line-height: 1;">${averageEmoji}</div>
                    </div>
                    <div style="text-align: left;">
                        <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px;">Average Score for ${storeLabel}</div>
                        <div style="font-size: 48px; font-weight: 800; color: ${averageColor}; line-height: 1;">${averageRounded}</div>
                        <div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">out of 5.0 · ${total} interactions</div>
                    </div>
                    <div style="flex: 1; max-width: 300px;">
                        <div style="background: var(--bg-tertiary); border-radius: 12px; height: 24px; overflow: hidden; position: relative;">
                            <div style="width: ${averagePercentage}%; height: 100%; background: linear-gradient(90deg, ${averageColor}88, ${averageColor}); border-radius: 12px; transition: width 0.5s ease;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 11px; color: var(--text-muted);">
                            <span>1.0</span>
                            <span>5.0</span>
                        </div>
                    </div>
                </div>

                <!-- Perception Distribution -->
                <div style="margin-bottom: 16px;">
                    <h4 style="font-size: 14px; margin-bottom: 12px; color: var(--text-secondary);">
                        <i class="fas fa-chart-pie"></i> Perception Distribution
                    </h4>
                </div>

                <div class="perception-distribution-grid">
                    ${[1, 2, 3, 4, 5].map(level => {
                        const count = perceptionCounts[level];
                        const barHeight = total > 0 ? Math.max((count / Math.max(...Object.values(perceptionCounts))) * 100, 5) : 5;
                        const levelColor = getPerceptionColor(level);
                        return `
                            <div class="perception-item" style="text-align: center; padding: 16px; background: var(--bg-secondary); border-radius: 12px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                                <div style="font-size: 28px; margin-bottom: 8px; color: ${levelColor};">${getPerceptionEmoji(level)}</div>
                                <div style="height: 60px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 8px;">
                                    <div style="width: 40px; height: ${barHeight}%; background: ${levelColor}; border-radius: 6px 6px 0 0; min-height: 4px;"></div>
                                </div>
                                <div style="font-size: 24px; font-weight: 700; color: ${levelColor};">${count}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        async function createIssue() {
            const customer = document.getElementById('issue-customer').value.trim();
            const phone = document.getElementById('issue-phone').value.trim();
            const orderNumber = document.getElementById('issue-order-number')?.value.trim() || '';
            const type = document.getElementById('issue-type').value;
            const store = document.getElementById('issue-store').value;
            const description = document.getElementById('issue-description').value.trim();
            const incidentDate = document.getElementById('issue-incident-date').value;
            const perception = document.getElementById('issue-perception').value;

            // Get current user
            const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

            const newIssue = {
                customer: customer || 'Anonymous',
                phone: phone || '',
                orderNumber: orderNumber || '',
                type: type || 'In Store',
                store: store || '',
                description: description || '',
                incidentDate: incidentDate || new Date().toISOString().split('T')[0],
                perception: perception ? parseInt(perception) : null,
                status: 'open',
                createdBy: user?.name || 'Unknown',
                createdDate: new Date().toISOString().split('T')[0],
                solution: null,
                resolvedBy: null,
                resolutionDate: null
            };

            // Try to save to Firebase
            if (typeof firebaseIssuesManager !== 'undefined' && firebaseIssuesManager.isInitialized) {
                const firestoreId = await firebaseIssuesManager.addIssue(newIssue);
                if (firestoreId) {
                    newIssue.id = firestoreId;
                    newIssue.firestoreId = firestoreId;
                    issues.unshift(newIssue);
                    closeModal();
                    renderIssues();
                    return;
                }
            }

            // Fallback to local storage
            newIssue.id = issues.length > 0 ? Math.max(...issues.map(i => typeof i.id === 'number' ? i.id : 0)) + 1 : 1;
            issues.unshift(newIssue);
            closeModal();
            renderIssues();
        }

        function deleteIssue(issueId) {
            const issue = issues.find(i => String(i.id) === String(issueId) || i.firestoreId === issueId);
            const customerName = issue?.customer || 'this issue';

            showConfirmModal({
                title: 'Delete Issue',
                message: `Are you sure you want to delete the issue reported by "${customerName}"? This action cannot be undone.`,
                confirmText: 'Delete',
                type: 'danger',
                onConfirm: async () => {
                    // Try to delete from Firebase using firestoreId
                    if (typeof firebaseIssuesManager !== 'undefined' && firebaseIssuesManager.isInitialized && issue?.firestoreId) {
                        const success = await firebaseIssuesManager.deleteIssue(issue.firestoreId);
                        if (success) {
                            issues = issues.filter(i => i.firestoreId !== issue.firestoreId);
                            showNotification('Issue deleted successfully', 'success');
                            renderIssues();
                            return;
                        } else {
                            showNotification('Failed to delete issue from Firebase', 'error');
                            return;
                        }
                    }

                    // Fallback to local deletion
                    issues = issues.filter(i => String(i.id) !== String(issueId) && i.firestoreId !== issueId);
                    showNotification('Issue deleted locally', 'success');
                    renderIssues();
                }
            });
        }

        async function resolveIssue(issueId) {
            const solution = document.getElementById('issue-solution').value.trim();
            const resolvedBy = document.getElementById('issue-resolved-by').value.trim();

            if (!solution || !resolvedBy) {
                alert('Please fill in all required fields');
                return;
            }

            const issue = issues.find(i => String(i.id) === String(issueId) || i.firestoreId === issueId);
            if (!issue) return;

            const updateData = {
                status: 'resolved',
                solution: solution,
                resolvedBy: resolvedBy,
                resolutionDate: new Date().toISOString().split('T')[0]
            };

            // Try to update in Firebase
            const firestoreId = issue.firestoreId || issueId;
            if (typeof firebaseIssuesManager !== 'undefined' && firebaseIssuesManager.isInitialized && firestoreId) {
                const success = await firebaseIssuesManager.updateIssue(firestoreId, updateData);
                if (success) {
                    // Update local data
                    Object.assign(issue, updateData);
                    closeModal();
                    renderIssues();
                    return;
                }
            }

            // Fallback to local update
            Object.assign(issue, updateData);
            closeModal();
            renderIssues();
        }

        function viewIssueDetails(issueId) {
            const issue = issues.find(i => String(i.id) === String(issueId) || i.firestoreId === issueId);
            if (!issue) {
                console.error('Issue not found:', issueId);
                return;
            }

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            const status = issue.status || 'open';
            const statusConfig = issueStatusConfig[status] || issueStatusConfig['open'];

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-info-circle"></i> Issue Details</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; gap: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Customer Name</div>
                                <div style="font-size: 18px; font-weight: 600;">${issue.customer}</div>
                            </div>
                            <span style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: ${statusConfig.bg}; color: ${statusConfig.color}; border-radius: 20px; font-size: 14px; font-weight: 600;">
                                <i class="fas ${statusConfig.icon}"></i>
                                ${statusConfig.label}
                            </span>
                        </div>

                        <!-- Quick Status Actions -->
                        <div style="display: flex; gap: 8px; padding: 12px; background: var(--bg-tertiary); border-radius: 8px;">
                            <span style="color: var(--text-muted); font-size: 13px; display: flex; align-items: center;">Change Status:</span>
                            ${status !== 'open' ? `
                                <button onclick="updateIssueStatusFromModal('${issue.firestoreId || issue.id}', 'open')" style="padding: 6px 12px; background: #ef444420; color: #ef4444; border: 1px solid #ef444450; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                                    <i class="fas fa-circle-exclamation"></i> Open
                                </button>
                            ` : ''}
                            ${status !== 'follow-up' ? `
                                <button onclick="updateIssueStatusFromModal('${issue.firestoreId || issue.id}', 'follow-up')" style="padding: 6px 12px; background: #f59e0b20; color: #f59e0b; border: 1px solid #f59e0b50; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                                    <i class="fas fa-clock"></i> Need Follow Up
                                </button>
                            ` : ''}
                            ${status !== 'resolved' ? `
                                <button onclick="updateIssueStatusFromModal('${issue.firestoreId || issue.id}', 'resolved')" style="padding: 6px 12px; background: #10b98120; color: #10b981; border: 1px solid #10b98150; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                                    <i class="fas fa-circle-check"></i> Resolved
                                </button>
                            ` : ''}
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px;">
                            <div>
                                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Phone Number</div>
                                <div style="font-weight: 500;">${issue.phone ? `<a href="tel:${issue.phone}" style="color: var(--accent-primary); text-decoration: none;"><i class="fas fa-phone"></i> ${issue.phone}</a>` : '-'}</div>
                            </div>
                            <div>
                                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Store</div>
                                <div style="font-weight: 500;">
                                    ${issue.store ? `<span style="display: inline-flex; align-items: center; gap: 4px;"><i class="fas fa-store" style="color: var(--accent-primary);"></i> ${issue.store}</span>` : '-'}
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Issue Type</div>
                                <span class="badge" style="background: ${issue.type === 'In Store' ? 'var(--accent-primary)' : 'var(--info)'};">
                                    <i class="fas fa-${issue.type === 'In Store' ? 'store' : 'globe'}"></i>
                                    ${issue.type}
                                </span>
                            </div>
                            <div>
                                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Incident Date</div>
                                <div style="font-weight: 500;">${formatDate(issue.incidentDate)}</div>
                            </div>
                        </div>

                        <!-- Editable Customer Perception -->
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <div style="font-size: 13px; color: var(--text-muted);">Customer Perception</div>
                                <button onclick="togglePerceptionEdit('${issue.firestoreId || issue.id}')" class="btn-secondary" style="padding: 4px 10px; font-size: 12px;">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                            </div>

                            <!-- Current Perception Display -->
                            <div id="perception-display-${issue.firestoreId || issue.id}" style="text-align: center;">
                                ${issue.perception ? `
                                    <div style="font-size: 48px;">${getPerceptionEmoji(issue.perception)}</div>
                                    <div style="font-size: 14px; font-weight: 500; margin-top: 4px;">${getPerceptionLabel(issue.perception)}</div>
                                ` : `
                                    <div style="color: var(--text-muted); padding: 16px;">No perception recorded</div>
                                `}
                            </div>

                            <!-- Perception Editor (hidden by default) -->
                            <div id="perception-edit-${issue.firestoreId || issue.id}" style="display: none;">
                                <div style="display: flex; justify-content: space-between; gap: 8px; margin-bottom: 12px;">
                                    ${[1, 2, 3, 4, 5].map(level => `
                                        <button type="button"
                                            class="perception-edit-btn"
                                            data-issue-id="${issue.firestoreId || issue.id}"
                                            data-value="${level}"
                                            onclick="selectPerceptionForEdit('${issue.firestoreId || issue.id}', ${level})"
                                            style="flex: 1; padding: 12px 8px; border: 2px solid ${issue.perception === level ? 'var(--accent-primary)' : 'var(--border-color)'}; border-radius: 12px; background: ${issue.perception === level ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)'}; cursor: pointer; transition: all 0.2s; transform: ${issue.perception === level ? 'scale(1.05)' : 'scale(1)'};">
                                            <div style="font-size: 28px; margin-bottom: 4px;">${getPerceptionEmoji(level)}</div>
                                            <div style="font-size: 10px; color: var(--text-muted);">${getPerceptionLabel(level)}</div>
                                        </button>
                                    `).join('')}
                                </div>
                                <input type="hidden" id="perception-value-${issue.firestoreId || issue.id}" value="${issue.perception || ''}">
                                <div style="display: flex; gap: 8px; justify-content: center;">
                                    <button onclick="savePerceptionEdit('${issue.firestoreId || issue.id}')" class="btn-primary" style="padding: 8px 16px;">
                                        <i class="fas fa-save"></i> Save
                                    </button>
                                    <button onclick="togglePerceptionEdit('${issue.firestoreId || issue.id}')" class="btn-secondary" style="padding: 8px 16px;">
                                        <i class="fas fa-times"></i> Cancel
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px;">
                            <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Description</div>
                            <div style="font-size: 14px; line-height: 1.6;">${issue.description}</div>
                        </div>

                        <!-- Follow Up Notes Section -->
                        <div style="border: 2px solid ${status === 'follow-up' ? '#f59e0b' : 'var(--border-color)'}; border-radius: 8px; padding: 16px; ${status === 'follow-up' ? 'background: #f59e0b08;' : ''}">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <div style="font-size: 14px; font-weight: 600; color: ${status === 'follow-up' ? '#f59e0b' : 'var(--text-primary)'};">
                                    <i class="fas fa-sticky-note"></i> Follow Up Notes
                                </div>
                            </div>
                            <textarea id="issue-followup-notes" class="form-input" placeholder="Add notes about follow-up actions, calls made, updates..." style="min-height: 80px; resize: vertical;">${issue.followUpNotes || ''}</textarea>
                            <button onclick="saveFollowUpNotes('${issue.firestoreId || issue.id}')" class="btn-secondary" style="margin-top: 8px;">
                                <i class="fas fa-save"></i> Save Notes
                            </button>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Created By</div>
                                <div style="font-weight: 500;">${issue.createdBy}</div>
                            </div>
                            <div>
                                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Created Date</div>
                                <div style="font-weight: 500;">${formatDate(issue.createdDate)}</div>
                            </div>
                        </div>

                        ${issue.status === 'resolved' && issue.solution ? `
                            <div style="border-top: 2px solid var(--border-color); padding-top: 16px; margin-top: 8px;">
                                <h3 style="font-size: 16px; margin-bottom: 16px; color: var(--success);">
                                    <i class="fas fa-check-circle"></i> Resolution Details
                                </h3>

                                <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                                    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">How it was resolved</div>
                                    <div style="font-size: 14px; line-height: 1.6;">${issue.solution}</div>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                    <div>
                                        <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Resolved By</div>
                                        <div style="font-weight: 600; color: var(--success);">${issue.resolvedBy || '-'}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Resolution Date</div>
                                        <div style="font-weight: 600; color: var(--success);">${issue.resolutionDate ? formatDate(issue.resolutionDate) : '-'}</div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}

                        ${issue.statusHistory && issue.statusHistory.length > 0 ? `
                            <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 8px;">
                                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">
                                    <i class="fas fa-history"></i> Status History
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 8px; max-height: 150px; overflow-y: auto;">
                                    ${issue.statusHistory.slice().reverse().map(h => {
                                        const hConfig = issueStatusConfig[h.status] || issueStatusConfig['open'];
                                        return `
                                            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 6px 10px; background: var(--bg-tertiary); border-radius: 6px;">
                                                <span style="color: ${hConfig.color};"><i class="fas ${hConfig.icon}"></i></span>
                                                <span style="font-weight: 500;">${hConfig.label}</span>
                                                <span style="color: var(--text-muted);">by ${h.updatedBy}</span>
                                                <span style="color: var(--text-muted); margin-left: auto;">${new Date(h.timestamp).toLocaleString()}</span>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                    <button class="btn-primary" onclick="editIssueDetails('${issue.firestoreId || issue.id}')">
                        <i class="fas fa-edit"></i> Edit Issue
                    </button>
                    <button class="btn-primary" onclick="closeModal()" style="background: var(--success);">
                        <i class="fas fa-check"></i> Accept
                    </button>
                </div>
            `;

            modal.classList.add('active');
        }

        // Edit issue details modal
        function editIssueDetails(issueId) {
            const issue = issues.find(i => String(i.id) === String(issueId) || i.firestoreId === issueId);
            if (!issue) return;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-edit"></i> Edit Issue</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; gap: 16px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label class="form-label">Customer Name</label>
                                <input type="text" class="form-input" id="edit-issue-customer" value="${issue.customer || ''}" placeholder="Customer name">
                            </div>
                            <div>
                                <label class="form-label">Phone Number</label>
                                <input type="tel" class="form-input" id="edit-issue-phone" value="${issue.phone || ''}" placeholder="Phone number">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label class="form-label">Order #</label>
                                <input type="text" class="form-input" id="edit-issue-order-number" value="${issue.orderNumber || ''}" placeholder="Order number">
                            </div>
                            <div>
                                <label class="form-label">Incident Date</label>
                                <input type="date" class="form-input" id="edit-issue-incident-date" value="${issue.incidentDate || ''}">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label class="form-label">Store</label>
                                <select class="form-input" id="edit-issue-store">
                                    <option value="" ${!issue.store ? 'selected' : ''}>Select Store</option>
                                    <option value="Miramar" ${issue.store === 'Miramar' ? 'selected' : ''}>VSU Miramar</option>
                                    <option value="Morena" ${issue.store === 'Morena' ? 'selected' : ''}>VSU Morena</option>
                                    <option value="Kearny Mesa" ${issue.store === 'Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                                    <option value="Chula Vista" ${issue.store === 'Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                                    <option value="North Park" ${issue.store === 'North Park' ? 'selected' : ''}>VSU North Park</option>
                                    <option value="Miramar Wine & Liquor" ${issue.store === 'Miramar Wine & Liquor' ? 'selected' : ''}>Miramar Wine & Liquor</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Issue Type</label>
                                <select class="form-input" id="edit-issue-type">
                                    <option value="In Store" ${issue.type === 'In Store' ? 'selected' : ''}>In Store</option>
                                    <option value="Online" ${issue.type === 'Online' ? 'selected' : ''}>Online</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="form-label">Description</label>
                            <textarea class="form-input" id="edit-issue-description" rows="4" placeholder="Describe the issue...">${issue.description || ''}</textarea>
                        </div>

                        <div>
                            <label class="form-label">Customer Response</label>
                            <div style="display: flex; justify-content: space-between; gap: 8px;">
                                ${[1, 2, 3, 4, 5].map(level => `
                                    <button type="button"
                                        class="edit-issue-perception-btn"
                                        data-value="${level}"
                                        onclick="selectEditIssuePerception(${level})"
                                        style="flex: 1; padding: 12px 8px; border: 2px solid ${issue.perception === level ? 'var(--accent-primary)' : 'var(--border-color)'}; border-radius: 12px; background: ${issue.perception === level ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-secondary)'}; cursor: pointer; transition: all 0.2s;">
                                        <div style="font-size: 28px; margin-bottom: 4px;">${getPerceptionEmoji(level)}</div>
                                        <div style="font-size: 10px; color: var(--text-muted);">${getPerceptionLabel(level)}</div>
                                    </button>
                                `).join('')}
                            </div>
                            <input type="hidden" id="edit-issue-perception" value="${issue.perception || ''}">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="viewIssueDetails('${issueId}')">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <button class="btn-primary" onclick="saveIssueEdit('${issue.firestoreId || issue.id}')">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            `;

            modal.classList.add('active');
        }

        // Select perception in edit mode
        function selectEditIssuePerception(level) {
            document.getElementById('edit-issue-perception').value = level;
            document.querySelectorAll('.edit-issue-perception-btn').forEach(btn => {
                const btnLevel = parseInt(btn.dataset.value);
                if (btnLevel === level) {
                    btn.style.borderColor = 'var(--accent-primary)';
                    btn.style.background = 'rgba(99, 102, 241, 0.1)';
                } else {
                    btn.style.borderColor = 'var(--border-color)';
                    btn.style.background = 'var(--bg-secondary)';
                }
            });
        }

        // Save issue edit
        async function saveIssueEdit(issueId) {
            const customer = document.getElementById('edit-issue-customer').value.trim();
            const phone = document.getElementById('edit-issue-phone').value.trim();
            const orderNumber = document.getElementById('edit-issue-order-number')?.value.trim() || '';
            const store = document.getElementById('edit-issue-store').value;
            const type = document.getElementById('edit-issue-type').value;
            const incidentDate = document.getElementById('edit-issue-incident-date').value;
            const description = document.getElementById('edit-issue-description').value.trim();
            const perception = document.getElementById('edit-issue-perception').value;

            // Find the issue to get the firestoreId
            const issue = issues.find(i => String(i.id) === String(issueId) || i.firestoreId === issueId);
            if (!issue) {
                showNotification('Issue not found', 'error');
                return;
            }

            const updateData = {
                customer: customer || 'Anonymous',
                phone: phone || '',
                orderNumber: orderNumber || '',
                store: store || '',
                type: type || 'In Store',
                incidentDate: incidentDate || '',
                description: description || '',
                perception: perception ? parseInt(perception) : null
            };

            // Update in Firebase using firestoreId
            if (typeof firebaseIssuesManager !== 'undefined' && firebaseIssuesManager.isInitialized && issue.firestoreId) {
                const success = await firebaseIssuesManager.updateIssue(issue.firestoreId, updateData);
                if (success) {
                    // Update local array
                    Object.assign(issue, updateData);
                    showNotification('Issue updated successfully', 'success');
                    closeModal();
                    renderIssues();
                    return;
                } else {
                    showNotification('Failed to update issue in Firebase', 'error');
                    return;
                }
            }

            // Fallback to local update if no Firebase
            Object.assign(issue, updateData);
            showNotification('Issue updated locally', 'success');
            closeModal();
            renderIssues();
        }

        // Update issue status from modal
        async function updateIssueStatusFromModal(issueId, newStatus) {
            await updateIssueStatus(issueId, newStatus);
            viewIssueDetails(issueId); // Refresh modal
        }

        // Save follow up notes
        async function saveFollowUpNotes(issueId) {
            const issue = issues.find(i => i.firestoreId === issueId || i.id === issueId);
            if (!issue) return;

            const notes = document.getElementById('issue-followup-notes')?.value || '';

            try {
                issue.followUpNotes = notes;

                if (firebaseIssuesManager && firebaseIssuesManager.isInitialized && issue.firestoreId) {
                    await firebaseIssuesManager.updateIssue(issue.firestoreId, {
                        followUpNotes: notes
                    });
                }

                showIssueToast('Follow up notes saved!', 'success');
            } catch (error) {
                console.error('Error saving follow up notes:', error);
                showIssueToast('Error saving notes', 'error');
            }
        }

        // Toggle perception edit mode
        function togglePerceptionEdit(issueId) {
            const displayEl = document.getElementById(`perception-display-${issueId}`);
            const editEl = document.getElementById(`perception-edit-${issueId}`);

            if (displayEl && editEl) {
                if (editEl.style.display === 'none') {
                    displayEl.style.display = 'none';
                    editEl.style.display = 'block';
                } else {
                    displayEl.style.display = 'block';
                    editEl.style.display = 'none';
                }
            }
        }

        // Select perception value for editing
        function selectPerceptionForEdit(issueId, value) {
            // Update hidden input
            const hiddenInput = document.getElementById(`perception-value-${issueId}`);
            if (hiddenInput) {
                hiddenInput.value = value;
            }

            // Update button styles
            const buttons = document.querySelectorAll(`.perception-edit-btn[data-issue-id="${issueId}"]`);
            buttons.forEach(btn => {
                const btnValue = parseInt(btn.dataset.value);
                if (btnValue === value) {
                    btn.style.borderColor = 'var(--accent-primary)';
                    btn.style.background = 'rgba(99, 102, 241, 0.1)';
                    btn.style.transform = 'scale(1.05)';
                } else {
                    btn.style.borderColor = 'var(--border-color)';
                    btn.style.background = 'var(--bg-tertiary)';
                    btn.style.transform = 'scale(1)';
                }
            });
        }

        // Save perception edit
        async function savePerceptionEdit(issueId) {
            const issue = issues.find(i => i.firestoreId === issueId || i.id === issueId);
            if (!issue) return;

            const hiddenInput = document.getElementById(`perception-value-${issueId}`);
            const newPerception = hiddenInput ? parseInt(hiddenInput.value) : null;

            if (!newPerception || newPerception < 1 || newPerception > 5) {
                showIssueToast('Please select a perception level', 'warning');
                return;
            }

            try {
                const oldPerception = issue.perception;
                issue.perception = newPerception;

                // Update in Firebase
                if (firebaseIssuesManager && firebaseIssuesManager.isInitialized && issue.firestoreId) {
                    await firebaseIssuesManager.updateIssue(issue.firestoreId, {
                        perception: newPerception
                    });
                }

                // Update the display
                const displayEl = document.getElementById(`perception-display-${issueId}`);
                if (displayEl) {
                    displayEl.innerHTML = `
                        <div style="font-size: 48px;">${getPerceptionEmoji(newPerception)}</div>
                        <div style="font-size: 14px; font-weight: 500; margin-top: 4px;">${getPerceptionLabel(newPerception)}</div>
                    `;
                }

                // Toggle back to display mode
                togglePerceptionEdit(issueId);

                // Re-render the issues list to update the chart
                renderIssues();

                // Re-open the modal to show updated data
                setTimeout(() => viewIssueDetails(issueId), 100);

                showIssueToast(`Perception updated: ${getPerceptionLabel(oldPerception || 0)} → ${getPerceptionLabel(newPerception)}`, 'success');
            } catch (error) {
                console.error('Error saving perception:', error);
                showIssueToast('Error saving perception', 'error');
            }
        }

        // Vendors Functions
        let vendorSearchTerm = '';
        let vendorCategoryFilter = 'all';
        let vendorTypeFilter = 'all'; // 'all', 'vendor', 'service'
        let vendorViewMode = 'grid'; // 'grid' or 'list'
        let firebaseVendors = [];

        async function initVendors() {
            try {
                // Initialize Firebase if not already done
                if (!firebaseVendorsManager.isInitialized) {
                    console.log('Initializing Firebase Vendors Manager...');
                    await firebaseVendorsManager.initialize();
                }
                
                // Load vendors from Firebase
                if (firebaseVendorsManager.isInitialized) {
                    firebaseVendors = await firebaseVendorsManager.loadVendors();
                } else {
                    console.warn('⚠️ Firebase not initialized.');
                    firebaseVendors = [];
                }
            } catch (error) {
                console.error('Error loading vendors:', error);
                firebaseVendors = [];
            }
        }

        async function renderVendors() {
            const dashboard = document.querySelector('.dashboard');
            
            // Load vendors from Firebase
            try {
                await initVendors();
            } catch (error) {
                console.error('Error initializing vendors:', error);
            }

            const categories = [...new Set(firebaseVendors.map(v => v.category))];

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Vendors & Suppliers</h2>
                        <p class="section-subtitle">Manage your supplier contacts and information</p>
                    </div>
                    <button class="btn-primary floating-add-btn" onclick="openAddVendorModal()">
                        <i class="fas fa-plus"></i>
                        Add Vendor
                    </button>
                </div>

                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-body">
                        <div class="vendor-type-filters" style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
                            <button class="vendor-filter-btn ${vendorTypeFilter === 'all' ? 'active' : ''}" onclick="filterVendorsByType('all')">
                                <i class="fas fa-th-large"></i> All
                            </button>
                            <button class="vendor-filter-btn ${vendorTypeFilter === 'vendor' ? 'active' : ''}" onclick="filterVendorsByType('vendor')">
                                <i class="fas fa-truck"></i> Vendors
                            </button>
                            <button class="vendor-filter-btn ${vendorTypeFilter === 'service' ? 'active' : ''}" onclick="filterVendorsByType('service')">
                                <i class="fas fa-wrench"></i> Services
                            </button>
                        </div>
                        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                            <div style="flex: 1; min-width: 250px;">
                                <div style="position: relative;">
                                    <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                                    <input
                                        type="text"
                                        class="form-input"
                                        placeholder="Search by vendor name..."
                                        style="padding-left: 40px;"
                                        oninput="searchVendors(this.value)"
                                        value="${vendorSearchTerm}"
                                    >
                                </div>
                            </div>
                            <div style="min-width: 200px;">
                                <select class="form-input" onchange="filterVendorsByCategory(this.value)">
                                    <option value="all" ${vendorCategoryFilter === 'all' ? 'selected' : ''}>All Categories</option>
                                    ${categories.map(cat => `
                                        <option value="${cat}" ${vendorCategoryFilter === cat ? 'selected' : ''}>${cat}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div style="display: flex; gap: 4px; background: var(--bg-secondary); padding: 4px; border-radius: 8px;">
                                <button class="vendor-view-btn ${vendorViewMode === 'grid' ? 'active' : ''}" onclick="toggleVendorView('grid')" title="Grid View" style="padding: 8px 12px; border: none; background: ${vendorViewMode === 'grid' ? 'var(--accent-primary)' : 'transparent'}; color: ${vendorViewMode === 'grid' ? 'white' : 'var(--text-muted)'}; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
                                    <i class="fas fa-th-large"></i>
                                </button>
                                <button class="vendor-view-btn ${vendorViewMode === 'list' ? 'active' : ''}" onclick="toggleVendorView('list')" title="List View" style="padding: 8px 12px; border: none; background: ${vendorViewMode === 'list' ? 'var(--accent-primary)' : 'transparent'}; color: ${vendorViewMode === 'list' ? 'white' : 'var(--text-muted)'}; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
                                    <i class="fas fa-list"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="vendors-list">
                    ${renderVendorsList()}
                </div>
            `;
        }

        function renderVendorsList() {
            let filteredVendors = firebaseVendors;

            // Apply type filter (vendor/service)
            if (vendorTypeFilter !== 'all') {
                filteredVendors = filteredVendors.filter(v => (v.type || 'vendor') === vendorTypeFilter);
            }

            // Apply category filter
            if (vendorCategoryFilter !== 'all') {
                filteredVendors = filteredVendors.filter(v => v.category === vendorCategoryFilter);
            }

            // Apply search filter
            if (vendorSearchTerm) {
                filteredVendors = filteredVendors.filter(v =>
                    v.name.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
                    v.contact.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
                    v.category.toLowerCase().includes(vendorSearchTerm.toLowerCase())
                );
            }

            if (filteredVendors.length === 0) {
                return `
                    <div class="card">
                        <div class="card-body" style="text-align: center; padding: 60px 20px;">
                            <i class="fas fa-search" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px; display: block;"></i>
                            <div style="font-size: 16px; color: var(--text-muted);">No vendors found</div>
                            <div style="font-size: 14px; color: var(--text-muted); margin-top: 8px;">Try adjusting your search or filter</div>
                        </div>
                    </div>
                `;
            }

            // Vibrant gradient colors for each category with better icons
            const categoryGradients = {
                'Vape Products': { from: '#667eea', to: '#764ba2', icon: 'fa-wind' },
                'Tobacco Products': { from: '#f093fb', to: '#f5576c', icon: 'fa-smoking' },
                'Beverages': { from: '#4facfe', to: '#00f2fe', icon: 'fa-bottle-water' },
                'Snacks & Candy': { from: '#fa709a', to: '#fee140', icon: 'fa-cookie-bite' },
                'Store Supplies': { from: '#38f9d7', to: '#43e97b', icon: 'fa-box-open' },
                'Glass & Accessories': { from: '#a855f7', to: '#6366f1', icon: 'fa-bong' },
                'CBD Products': { from: '#10b981', to: '#34d399', icon: 'fa-leaf' },
                'Delta Products': { from: '#f59e0b', to: '#fbbf24', icon: 'fa-cannabis' },
                'Kratom': { from: '#84cc16', to: '#a3e635', icon: 'fa-seedling' },
                'Electronics': { from: '#3b82f6', to: '#60a5fa', icon: 'fa-plug' },
                'Merchandise': { from: '#ec4899', to: '#f472b6', icon: 'fa-shirt' },
                'Services': { from: '#8b5cf6', to: '#a78bfa', icon: 'fa-wrench' },
                'Wholesale': { from: '#14b8a6', to: '#2dd4bf', icon: 'fa-warehouse' },
                'Distribution': { from: '#f97316', to: '#fb923c', icon: 'fa-truck-fast' },
                'Marketing': { from: '#06b6d4', to: '#22d3ee', icon: 'fa-bullhorn' },
                'Packaging': { from: '#78716c', to: '#a8a29e', icon: 'fa-box' },
                'Cleaning': { from: '#0ea5e9', to: '#38bdf8', icon: 'fa-spray-can-sparkles' },
                'Security': { from: '#dc2626', to: '#f87171', icon: 'fa-shield-halved' },
                'IT & Tech': { from: '#6366f1', to: '#818cf8', icon: 'fa-laptop-code' },
                'Legal': { from: '#475569', to: '#64748b', icon: 'fa-gavel' },
                'Accounting': { from: '#059669', to: '#34d399', icon: 'fa-calculator' },
                'Insurance': { from: '#7c3aed', to: '#a78bfa', icon: 'fa-umbrella' },
                'Products/Services': { from: '#8b5cf6', to: '#a78bfa', icon: 'fa-cubes' }
            };

            // Extra gradient colors for custom categories
            const customGradients = [
                { from: '#ff6b6b', to: '#feca57', icon: 'fa-store' },
                { from: '#5f27cd', to: '#48dbfb', icon: 'fa-gem' },
                { from: '#ff9ff3', to: '#ffeaa7', icon: 'fa-handshake' },
                { from: '#00d2d3', to: '#54a0ff', icon: 'fa-building' },
                { from: '#ff6b81', to: '#c44569', icon: 'fa-industry' },
                { from: '#a29bfe', to: '#6c5ce7', icon: 'fa-briefcase' },
                { from: '#fdcb6e', to: '#e17055', icon: 'fa-tags' }
            ];

            // Function to get gradient for any category (including custom)
            function getCategoryGradient(category) {
                if (categoryGradients[category]) return categoryGradients[category];
                // Generate consistent gradient for custom categories based on name
                const hash = category.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
                return customGradients[hash % customGradients.length];
            }

            // Simple color for backwards compatibility
            function getCategoryColor(category) {
                const gradient = getCategoryGradient(category);
                return gradient.from;
            }

            const typeColors = {
                'vendor': '#10b981',
                'service': '#8b5cf6'
            };

            // List View
            if (vendorViewMode === 'list') {
                return `
                    <div class="card" style="overflow: hidden;">
                        <!-- List Header - Desktop -->
                        <div class="vendor-list-header" style="display: grid; grid-template-columns: 50px 1.5fr 1fr 1fr 1fr 80px; gap: 16px; padding: 14px 20px; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color); font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
                            <div></div>
                            <div>Vendor</div>
                            <div>Category</div>
                            <div>Contact</div>
                            <div>Phone</div>
                            <div style="text-align: center;">Type</div>
                        </div>
                        <div class="vendor-list-body">
                            ${filteredVendors.map(vendor => {
                                const vendorType = vendor.type || 'vendor';
                                const vendorCategories = vendor.categories || (vendor.category ? [vendor.category] : ['General']);
                                const primaryCategory = vendorCategories[0] || 'General';
                                const gradient = getCategoryGradient(primaryCategory);
                                return `
                                <div class="vendor-list-row" onclick="viewVendorDetails('${vendor.firestoreId}')" style="display: grid; grid-template-columns: 50px 1.5fr 1fr 1fr 1fr 80px; gap: 16px; padding: 14px 20px; border-bottom: 1px solid var(--border-color); align-items: center; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
                                    <!-- Avatar -->
                                    <div style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, ${gradient.from}, ${gradient.to}); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
                                        ${vendor.image
                                            ? `<img src="${vendor.image}" style="width: 100%; height: 100%; object-fit: cover;">`
                                            : `<i class="fas ${gradient.icon || 'fa-building'}" style="font-size: 14px; color: white;"></i>`
                                        }
                                    </div>
                                    <!-- Vendor Name -->
                                    <div style="min-width: 0;">
                                        <div style="font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${vendor.name}</div>
                                        <div class="vendor-list-mobile-info" style="display: none; font-size: 12px; color: var(--text-muted); margin-top: 2px;">${primaryCategory}</div>
                                    </div>
                                    <!-- Category -->
                                    <div class="vendor-list-desktop-only" style="min-width: 0;">
                                        <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: ${gradient.from}15; color: ${gradient.from}; border-radius: 6px; font-size: 12px; font-weight: 500;">
                                            <i class="fas ${gradient.icon || 'fa-tag'}" style="font-size: 10px;"></i>
                                            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;">${primaryCategory}</span>
                                        </span>
                                    </div>
                                    <!-- Contact -->
                                    <div class="vendor-list-desktop-only" style="color: var(--text-secondary); font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        ${vendor.contact || '-'}
                                    </div>
                                    <!-- Phone -->
                                    <div class="vendor-list-desktop-only" style="color: var(--text-secondary); font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        ${vendor.phone || '-'}
                                    </div>
                                    <!-- Type Badge -->
                                    <div style="text-align: center;">
                                        <span style="display: inline-block; padding: 4px 8px; background: ${vendorType === 'service' ? '#8b5cf620' : '#10b98120'}; color: ${vendorType === 'service' ? '#8b5cf6' : '#10b981'}; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
                                            ${vendorType === 'service' ? 'SVC' : 'VND'}
                                        </span>
                                    </div>
                                </div>
                            `}).join('')}
                        </div>
                    </div>
                    <style>
                        @media (max-width: 768px) {
                            .vendor-list-header { display: none !important; }
                            .vendor-list-row {
                                grid-template-columns: 44px 1fr 60px !important;
                                gap: 12px !important;
                                padding: 12px 16px !important;
                            }
                            .vendor-list-desktop-only { display: none !important; }
                            .vendor-list-mobile-info { display: block !important; }
                        }
                    </style>
                `;
            }

            // Grid View (original)
            return `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">
                    ${filteredVendors.map(vendor => {
                        const vendorType = vendor.type || 'vendor';
                        const typeLabel = vendorType === 'service' ? 'SERVICE PROVIDER' : 'VENDOR';
                        const typeColor = typeColors[vendorType] || typeColors['vendor'];
                        const vendorCategories = vendor.categories || (vendor.category ? [vendor.category] : ['General']);
                        const primaryCategory = vendorCategories[0] || 'General';
                        const gradient = getCategoryGradient(primaryCategory);
                        const categoryColor = gradient.from;
                        return `
                        <div class="card" style="cursor: pointer; transition: all 0.3s; overflow: hidden; border: none;" onclick="viewVendorDetails('${vendor.firestoreId}')" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 40px ${gradient.from}30';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
                            <!-- Category/Service Banner - VIBRANT GRADIENT -->
                            <div style="background: linear-gradient(135deg, ${gradient.from}, ${gradient.to}); padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; position: relative; overflow: hidden;">
                                <!-- Decorative circles -->
                                <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                                <div style="position: absolute; bottom: -30px; right: 40px; width: 60px; height: 60px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>

                                <div style="flex: 1; z-index: 1;">
                                    <div style="font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.9); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">
                                        ${typeLabel}
                                    </div>
                                    <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
                                        ${vendorCategories.map((cat, idx) => `
                                            <span style="font-size: ${idx === 0 ? '17px' : '11px'}; font-weight: ${idx === 0 ? '800' : '600'}; color: white; ${idx > 0 ? 'background: rgba(255,255,255,0.25); padding: 3px 10px; border-radius: 20px;' : ''} text-transform: uppercase; letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                                ${cat}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                                <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; z-index: 1;">
                                    <i class="fas ${gradient.icon || (vendorType === 'service' ? 'fa-wrench' : 'fa-boxes-stacked')}" style="font-size: 22px; color: white;"></i>
                                </div>
                            </div>

                            <div class="card-body">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 14px;">
                                    <div style="display: flex; align-items: center; gap: 14px; flex: 1;">
                                        <!-- Vendor Image -->
                                        <div style="width: 52px; height: 52px; border-radius: 12px; background: linear-gradient(135deg, ${gradient.from}20, ${gradient.to}20); border: 2px solid ${gradient.from}40; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
                                            ${vendor.image
                                                ? `<img src="${vendor.image}" style="width: 100%; height: 100%; object-fit: cover;">`
                                                : `<i class="fas fa-building" style="font-size: 18px; color: ${gradient.from};"></i>`
                                            }
                                        </div>
                                        <div style="flex: 1; min-width: 0;">
                                            <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 2px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                                ${vendor.name}
                                            </h3>
                                            <div style="font-size: 13px; color: var(--text-muted);">
                                                ${vendor.products ? vendor.products.split(',').slice(0, 2).join(', ') + (vendor.products.split(',').length > 2 ? '...' : '') : 'Products/Services'}
                                            </div>
                                        </div>
                                    </div>
                                    <i class="fas fa-chevron-right" style="color: var(--text-muted); font-size: 14px;"></i>
                                </div>

                                <div style="padding-top: 14px; border-top: 1px solid var(--border-color);">
                                    <div style="display: grid; gap: 8px;">
                                        <div style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
                                            <i class="fas fa-user" style="width: 16px; color: ${categoryColor};"></i>
                                            <span style="color: var(--text-secondary);">${vendor.contact || 'No contact'}</span>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
                                            <i class="fas fa-phone" style="width: 16px; color: ${categoryColor};"></i>
                                            <span style="color: var(--text-secondary);">${vendor.phone || 'No phone'}</span>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
                                            <i class="fas fa-envelope" style="width: 16px; color: ${categoryColor};"></i>
                                            <span style="color: var(--text-secondary);">${vendor.email || 'No email'}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    `}).join('')}
                </div>
            `;
        }

        function searchVendors(searchTerm) {
            vendorSearchTerm = searchTerm;
            const vendorsList = document.getElementById('vendors-list');
            if (vendorsList) {
                vendorsList.innerHTML = renderVendorsList();
            }
        }

        function filterVendorsByCategory(category) {
            vendorCategoryFilter = category;
            const vendorsList = document.getElementById('vendors-list');
            if (vendorsList) {
                vendorsList.innerHTML = renderVendorsList();
            }
        }

        function filterVendorsByType(type) {
            vendorTypeFilter = type;
            // Update button active states
            document.querySelectorAll('.vendor-filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.currentTarget.classList.add('active');
            // Re-render the vendors list
            const vendorsList = document.getElementById('vendors-list');
            if (vendorsList) {
                vendorsList.innerHTML = renderVendorsList();
            }
        }

        function toggleVendorView(mode) {
            vendorViewMode = mode;
            // Re-render the entire vendors section to update button states
            renderVendors();
        }

        function openAddVendorModal() {
            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-plus-circle"></i> Add New Vendor</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
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
                                    <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">AI Invoice Scanner</div>
                                    <div style="font-size: 12px; color: var(--text-muted);">Auto-fill vendor info from invoice/receipt</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <input type="file" id="vendorAiPhoto" accept="image/*" style="display: none;" onchange="scanVendorInvoiceWithAI(this)">
                                <button type="button" onclick="document.getElementById('vendorAiPhoto').click()" style="padding: 10px 16px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border: none; color: white; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(139,92,246,0.4)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
                                    <i class="fas fa-file-invoice"></i> Scan Invoice
                                </button>
                            </div>
                        </div>
                        <div id="vendor-ai-status" style="display: none; margin-top: 12px; padding: 10px; background: var(--bg-secondary); border-radius: 8px; font-size: 13px;"></div>
                    </div>

                    <form id="add-vendor-form" style="display: grid; gap: 16px;">
                        <!-- Vendor Image Upload -->
                        <div>
                            <label class="form-label">Vendor Logo/Image</label>
                            <div style="display: flex; align-items: start; gap: 16px;">
                                <div id="vendor-image-preview" style="width: 100px; height: 100px; border-radius: 12px; border: 2px dashed var(--border-color); display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); overflow: hidden; flex-shrink: 0;">
                                    <i class="fas fa-building" style="font-size: 32px; color: var(--text-muted);"></i>
                                </div>
                                <div style="flex: 1;">
                                    <input type="file" id="vendor-image" accept="image/*" style="display: none;" onchange="previewVendorImage(this, 'vendor-image-preview')">
                                    <button type="button" class="btn-secondary" onclick="document.getElementById('vendor-image').click()" style="margin-bottom: 8px;">
                                        <i class="fas fa-upload"></i> Upload Image
                                    </button>
                                    <p style="font-size: 12px; color: var(--text-muted); margin: 0;">Recommended: Square image, max 2MB</p>
                                </div>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label class="form-label">Vendor Name</label>
                                <input type="text" id="vendor-name" class="form-input" placeholder="Enter vendor name">
                            </div>
                            <div>
                                <label class="form-label">Type</label>
                                <select id="vendor-type" class="form-input">
                                    <option value="vendor">Vendor</option>
                                    <option value="service">Service</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="form-label">Categories (select all that apply)</label>
                            <div id="vendor-categories-container" style="display: flex; flex-wrap: wrap; gap: 10px; padding: 12px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 8px;">
                                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 6px 12px; background: var(--bg-primary); border-radius: 6px; font-size: 14px;">
                                    <input type="checkbox" name="vendor-category" value="Vape Products"> Vape Products
                                </label>
                                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 6px 12px; background: var(--bg-primary); border-radius: 6px; font-size: 14px;">
                                    <input type="checkbox" name="vendor-category" value="Tobacco Products"> Tobacco Products
                                </label>
                                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 6px 12px; background: var(--bg-primary); border-radius: 6px; font-size: 14px;">
                                    <input type="checkbox" name="vendor-category" value="Beverages"> Beverages
                                </label>
                                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 6px 12px; background: var(--bg-primary); border-radius: 6px; font-size: 14px;">
                                    <input type="checkbox" name="vendor-category" value="Snacks & Candy"> Snacks & Candy
                                </label>
                                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 6px 12px; background: var(--bg-primary); border-radius: 6px; font-size: 14px;">
                                    <input type="checkbox" name="vendor-category" value="Store Supplies"> Store Supplies
                                </label>
                            </div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <input type="text" id="vendor-custom-category" class="form-input" placeholder="Add custom category..." style="flex: 1;">
                                <button type="button" class="btn-secondary" onclick="addCustomCategoryCheckbox('vendor-categories-container', 'vendor-custom-category')" style="white-space: nowrap;">
                                    <i class="fas fa-plus"></i> Add
                                </button>
                            </div>
                        </div>

                        <div>
                            <label class="form-label">Contact Person</label>
                            <input type="text" id="vendor-contact" class="form-input" placeholder="Enter contact name">
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label class="form-label">Phone</label>
                                <input type="tel" id="vendor-phone" class="form-input" placeholder="(800) 555-0000" oninput="formatPhoneNumber(this)" maxlength="14">
                            </div>
                            <div>
                                <label class="form-label">Phone 2 <span style="color: var(--text-muted); font-weight: 400;">(optional)</span></label>
                                <input type="tel" id="vendor-phone2" class="form-input" placeholder="(800) 555-0000" oninput="formatPhoneNumber(this)" maxlength="14">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label class="form-label">Email</label>
                                <input type="email" id="vendor-email" class="form-input" placeholder="contact@vendor.com">
                            </div>
                            <div>
                                <label class="form-label">Website</label>
                                <input type="url" id="vendor-website" class="form-input" placeholder="https://www.vendor.com" pattern="https?://.+">
                            </div>
                        </div>

                        <div>
                            <label class="form-label">Access Information</label>
                            <textarea id="vendor-access" class="form-input" placeholder="Account details, login info, etc." style="min-height: 80px;"></textarea>
                        </div>

                        <div>
                            <label class="form-label">Products/Services</label>
                            <textarea id="vendor-products" class="form-input" placeholder="What products/services do you buy from this vendor?" style="min-height: 80px;"></textarea>
                        </div>

                        <div>
                            <label class="form-label">Order Methods</label>
                            <textarea id="vendor-order-methods" class="form-input" placeholder="How to order (phone, email, online, etc.)" style="min-height: 80px;"></textarea>
                        </div>

                        <div>
                            <label class="form-label">Additional Notes</label>
                            <textarea id="vendor-notes" class="form-input" placeholder="Payment terms, delivery schedule, discounts, etc." style="min-height: 80px;"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="createVendor()">
                        <i class="fas fa-save"></i> Save Vendor
                    </button>
                    <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            `;

            modal.classList.add('active');
        }

        /**
         * Preview vendor image before upload
         */
        function previewVendorImage(input, previewId) {
            const preview = document.getElementById(previewId);
            if (!preview) return;

            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        // Add custom category checkbox dynamically
        function addCustomCategoryCheckbox(containerId, inputId) {
            const container = document.getElementById(containerId);
            const input = document.getElementById(inputId);
            const customCategory = input.value.trim();

            if (!customCategory) {
                alert('Please enter a category name');
                return;
            }

            // Check if category already exists
            const existingCheckboxes = container.querySelectorAll('input[type="checkbox"]');
            for (let cb of existingCheckboxes) {
                if (cb.value.toLowerCase() === customCategory.toLowerCase()) {
                    alert('This category already exists');
                    return;
                }
            }

            // Create new checkbox label
            const label = document.createElement('label');
            label.style.cssText = 'display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 6px 12px; background: var(--bg-primary); border-radius: 6px; font-size: 14px; border: 1px solid var(--accent-primary);';
            label.innerHTML = `
                <input type="checkbox" name="vendor-category" value="${customCategory}" checked> ${customCategory}
                <i class="fas fa-times" style="margin-left: 4px; color: var(--text-muted); cursor: pointer;" onclick="this.parentElement.remove(); event.stopPropagation();"></i>
            `;
            container.appendChild(label);
            input.value = '';
        }

        // Get all selected categories from checkboxes
        function getSelectedCategories(containerId) {
            const container = document.getElementById(containerId);
            const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
            return Array.from(checkboxes).map(cb => cb.value);
        }

        async function createVendor() {
            const name = document.getElementById('vendor-name').value.trim();
            const type = document.getElementById('vendor-type').value;

            // Get selected categories (multiple)
            const categories = getSelectedCategories('vendor-categories-container');
            // For backwards compatibility, also store first category as 'category'
            const category = categories.length > 0 ? categories[0] : '';

            if (categories.length === 0) {
                alert('Please select at least one category');
                return;
            }

            const contact = document.getElementById('vendor-contact').value.trim();
            const phone = document.getElementById('vendor-phone').value.trim();
            const phone2 = document.getElementById('vendor-phone2').value.trim();
            const email = document.getElementById('vendor-email').value.trim();
            const website = document.getElementById('vendor-website').value.trim();
            const access = document.getElementById('vendor-access').value.trim();
            const products = document.getElementById('vendor-products').value.trim();
            const orderMethods = document.getElementById('vendor-order-methods').value.trim();
            const notes = document.getElementById('vendor-notes').value.trim();
            const imageInput = document.getElementById('vendor-image');

            // Validate required field
            if (!name) {
                alert('Please enter a vendor name');
                return;
            }

            // Validate email format if provided
            if (email && !isValidEmail(email)) {
                alert('Please enter a valid email address (e.g., contact@company.com)');
                return;
            }

            // Validate website format if provided
            if (website && !isValidUrl(website)) {
                alert('Please enter a valid website URL (e.g., https://www.company.com)');
                return;
            }

            try {
                // Upload image to Firebase Storage if provided
                let imageUrl = null;
                let imagePath = null;
                if (imageInput.files && imageInput.files.length > 0) {
                    // Initialize storage helper if needed
                    if (!firebaseStorageHelper.isInitialized) {
                        firebaseStorageHelper.initialize();
                    }

                    const rawBase64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(imageInput.files[0]);
                    });

                    try {
                        const tempId = Date.now().toString();
                        const uploadResult = await firebaseStorageHelper.uploadImage(
                            rawBase64,
                            'vendors/images',
                            tempId
                        );
                        imageUrl = uploadResult.url;
                        imagePath = uploadResult.path;
                    } catch (err) {
                        console.error('Error uploading vendor image to Storage:', err);
                        // Fallback to compressed base64 for Firestore
                        imageUrl = await compressImage(rawBase64);
                    }
                }

                const newVendor = {
                    name,
                    type,
                    category,           // First category for backwards compatibility
                    categories,         // Array of all selected categories
                    contact,
                    phone,
                    phone2,
                    email,
                    website,
                    access,
                    products,
                    orderMethods,
                    notes,
                    image: imageUrl,      // Now stores URL instead of base64
                    imagePath: imagePath  // For future deletion
                };

                await firebaseVendorsManager.addVendor(newVendor);

                // Reload vendors
                firebaseVendors = await firebaseVendorsManager.loadVendors();
                closeModal();
                renderVendors();
            } catch (error) {
                console.error('Error creating vendor:', error);
                alert('Error creating vendor: ' + error.message);
            }
        }

        // Scan invoice/receipt with AI to auto-fill vendor information
        async function scanVendorInvoiceWithAI(input) {
            if (!input.files || !input.files[0]) return;

            const statusDiv = document.getElementById('vendor-ai-status');
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: #8b5cf6;"></i> <span style="color: var(--text-primary);">Analyzing invoice with AI...</span>';

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
                                        text: `Analyze this invoice/receipt/bill image and extract vendor/supplier information. Return ONLY a JSON object with these fields (use null for any field you cannot find):

{
    "vendorName": "the company/vendor/supplier name",
    "contactPerson": "contact person name if visible",
    "phone": "phone number in format (XXX) XXX-XXXX",
    "email": "email address if visible",
    "website": "website URL if visible (include https://)",
    "category": "one of: Vape Products, Tobacco Products, Beverages, Snacks & Candy, Store Supplies",
    "type": "vendor or service",
    "products": "list of products/services mentioned on the invoice",
    "notes": "any relevant details like payment terms, account numbers, etc."
}

Category guidelines:
- Vape Products: vape supplies, e-liquids, vape hardware
- Tobacco Products: cigarettes, cigars, tobacco
- Beverages: drinks, sodas, energy drinks, water
- Snacks & Candy: food items, snacks, candy, chips
- Store Supplies: cleaning supplies, bags, equipment, office supplies

Type guidelines:
- vendor: sells physical products
- service: provides services (repairs, maintenance, utilities, etc.)

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
                let vendorData;
                try {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        vendorData = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('No JSON found in response');
                    }
                } catch (parseError) {
                    console.error('Error parsing AI response:', content);
                    throw new Error('Could not parse vendor data from AI response');
                }

                // Fill in the form fields
                if (vendorData.vendorName) {
                    document.getElementById('vendor-name').value = vendorData.vendorName;
                }

                if (vendorData.type) {
                    const typeSelect = document.getElementById('vendor-type');
                    const typeValue = vendorData.type.toLowerCase();
                    if (typeValue === 'vendor' || typeValue === 'service') {
                        typeSelect.value = typeValue;
                    }
                }

                if (vendorData.category) {
                    const categorySelect = document.getElementById('vendor-category');
                    // Find matching option
                    for (let option of categorySelect.options) {
                        if (option.value.toLowerCase() === vendorData.category.toLowerCase() ||
                            option.value === vendorData.category) {
                            categorySelect.value = option.value;
                            break;
                        }
                    }
                }

                if (vendorData.contactPerson) {
                    document.getElementById('vendor-contact').value = vendorData.contactPerson;
                }

                if (vendorData.phone) {
                    document.getElementById('vendor-phone').value = vendorData.phone;
                }

                if (vendorData.email) {
                    document.getElementById('vendor-email').value = vendorData.email;
                }

                if (vendorData.website) {
                    document.getElementById('vendor-website').value = vendorData.website;
                }

                if (vendorData.products) {
                    document.getElementById('vendor-products').value = vendorData.products;
                }

                if (vendorData.notes) {
                    document.getElementById('vendor-notes').value = vendorData.notes;
                }

                // Auto-set the scanned image as the vendor logo
                const vendorImageInput = document.getElementById('vendor-image');
                const vendorImagePreview = document.getElementById('vendor-image-preview');

                if (vendorImageInput && file) {
                    // Create a new FileList with the scanned file
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    vendorImageInput.files = dataTransfer.files;

                    // Show preview in the container div
                    if (vendorImagePreview) {
                        vendorImagePreview.innerHTML = `<img src="${base64Image}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    }
                }

                // Show success message
                statusDiv.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> <span style="color: var(--text-primary);">Vendor info extracted & image set as logo! Review and save.</span>';

            } catch (error) {
                console.error('Error scanning invoice with AI:', error);
                statusDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">Error: ${error.message}</span>`;
            }

            // Don't clear the AI scan file input - keep it for reference
            // input.value = '';
        }

        async function viewVendorDetails(firestoreId) {
            const vendor = firebaseVendors.find(v => v.firestoreId === firestoreId);
            if (!vendor) return;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            const categoryColors = {
                'Vape Products': '#6366f1',
                'Tobacco Products': '#8b5cf6',
                'Beverages': '#3b82f6',
                'Snacks & Candy': '#f59e0b',
                'Store Supplies': '#10b981'
            };

            const typeColors = {
                'vendor': '#10b981',
                'service': '#8b5cf6'
            };

            const vendorType = vendor.type || 'vendor';
            const typeLabel = vendorType === 'service' ? 'Service' : 'Vendor';
            const typeColor = typeColors[vendorType] || typeColors['vendor'];
            const typeIcon = vendorType === 'service' ? 'fa-wrench' : 'fa-truck';
            const vendorCategories = vendor.categories || (vendor.category ? [vendor.category] : ['General']);

            // Helper function for category colors in modal
            function getModalCategoryColor(category) {
                if (categoryColors[category]) return categoryColors[category];
                const customColors = ['#ef4444', '#ec4899', '#14b8a6', '#0ea5e9', '#84cc16', '#a855f7', '#f97316'];
                const hash = category.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
                return customColors[hash % customColors.length];
            }

            modalContent.innerHTML = `
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h2><i class="fas ${typeIcon}"></i> ${vendor.name}</h2>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button class="btn-primary" style="padding: 8px 14px; font-size: 13px;" onclick="closeModal(); setTimeout(() => editVendorModal('${vendor.firestoreId}'), 100);">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-danger" style="padding: 8px 14px; font-size: 13px;" onclick="deleteVendorConfirm('${vendor.firestoreId}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                        <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="modal-body">
                    <div style="display: grid; gap: 20px;">
                        <!-- Header with Image and Category -->
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
                            <div style="width: 100px; height: 100px; border-radius: 16px; background: var(--bg-secondary); border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                ${vendor.image
                                    ? `<img src="${vendor.image}" style="width: 100%; height: 100%; object-fit: cover;">`
                                    : `<i class="fas fa-building" style="font-size: 40px; color: var(--text-muted);"></i>`
                                }
                            </div>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                                <span class="badge" style="background: ${typeColor}; font-size: 14px; padding: 8px 16px;">
                                    <i class="fas ${typeIcon}" style="margin-right: 6px;"></i>${typeLabel}
                                </span>
                                ${vendorCategories.map(cat => `
                                    <span class="badge" style="background: ${getModalCategoryColor(cat)}; font-size: 14px; padding: 8px 16px;">
                                        ${cat}
                                    </span>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Contact Information -->
                        <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px;">
                            <h3 style="font-size: 15px; font-weight: 600; margin-bottom: 16px; color: var(--accent-primary);">
                                <i class="fas fa-address-book"></i> Contact Information
                            </h3>
                            <div style="display: grid; gap: 12px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <i class="fas fa-user" style="width: 20px; color: var(--text-muted);"></i>
                                    <div>
                                        <div style="font-size: 12px; color: var(--text-muted);">Contact Person</div>
                                        <div style="font-weight: 500;">${vendor.contact}</div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <i class="fas fa-phone" style="width: 20px; color: var(--text-muted);"></i>
                                    <div>
                                        <div style="font-size: 12px; color: var(--text-muted);">Phone</div>
                                        <a href="tel:${vendor.phone}" style="font-weight: 500; color: var(--accent-primary); text-decoration: none;">${vendor.phone}</a>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <i class="fas fa-envelope" style="width: 20px; color: var(--text-muted);"></i>
                                    <div>
                                        <div style="font-size: 12px; color: var(--text-muted);">Email</div>
                                        <a href="mailto:${vendor.email}" style="font-weight: 500; color: var(--accent-primary); text-decoration: none;">${vendor.email}</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Website & Access -->
                        <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px;">
                            <h3 style="font-size: 15px; font-weight: 600; margin-bottom: 16px; color: var(--accent-primary);">
                                <i class="fas fa-key"></i> Access Information
                            </h3>
                            <div style="display: grid; gap: 12px;">
                                ${vendor.website ? `
                                    <div>
                                        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Website</div>
                                        <a href="${vendor.website}" target="_blank" style="color: var(--accent-primary); text-decoration: none; display: flex; align-items: center; gap: 8px;">
                                            <i class="fas fa-external-link-alt"></i>
                                            ${vendor.website}
                                        </a>
                                    </div>
                                ` : ''}
                                ${vendor.access ? `
                                    <div>
                                        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Access Details</div>
                                        <div style="font-size: 14px; padding: 10px; background: var(--bg-primary); border-radius: 6px; font-family: monospace;">
                                            ${vendor.access}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Products -->
                        <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px;">
                            <h3 style="font-size: 15px; font-weight: 600; margin-bottom: 16px; color: var(--accent-primary);">
                                <i class="fas fa-boxes"></i> What We Buy
                            </h3>
                            <div style="font-size: 14px; line-height: 1.6; color: var(--text-secondary);">
                                ${vendor.products}
                            </div>
                        </div>

                        <!-- Order Methods -->
                        <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px;">
                            <h3 style="font-size: 15px; font-weight: 600; margin-bottom: 16px; color: var(--accent-primary);">
                                <i class="fas fa-shopping-cart"></i> How to Order
                            </h3>
                            <div style="font-size: 14px; line-height: 1.6; color: var(--text-secondary);">
                                ${vendor.orderMethods}
                            </div>
                        </div>

                        <!-- Notes -->
                        ${vendor.notes ? `
                            <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px;">
                                <h3 style="font-size: 15px; font-weight: 600; margin-bottom: 16px; color: var(--accent-primary);">
                                    <i class="fas fa-sticky-note"></i> Additional Notes
                                </h3>
                                <div style="font-size: 14px; line-height: 1.6; color: var(--text-secondary);">
                                    ${vendor.notes}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            modal.classList.add('active');
        }

        function editVendorModal(firestoreId) {
            const vendor = firebaseVendors.find(v => v.firestoreId === firestoreId);
            if (!vendor) return;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-edit"></i> Edit Vendor</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <form id="edit-vendor-form" style="display: grid; gap: 16px;">
                        <!-- Vendor Image Upload -->
                        <div>
                            <label class="form-label">Vendor Logo/Image</label>
                            <div style="display: flex; align-items: start; gap: 16px;">
                                <div id="edit-vendor-image-preview" style="width: 100px; height: 100px; border-radius: 12px; border: 2px dashed var(--border-color); display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); overflow: hidden; flex-shrink: 0;">
                                    ${vendor.image ? `<img src="${vendor.image}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i class="fas fa-building" style="font-size: 32px; color: var(--text-muted);"></i>`}
                                </div>
                                <div style="flex: 1;">
                                    <input type="file" id="edit-vendor-image" accept="image/*" style="display: none;" onchange="previewVendorImage(this, 'edit-vendor-image-preview')">
                                    <button type="button" class="btn-secondary" onclick="document.getElementById('edit-vendor-image').click()" style="margin-bottom: 8px;">
                                        <i class="fas fa-upload"></i> ${vendor.image ? 'Change Image' : 'Upload Image'}
                                    </button>
                                    ${vendor.image ? `<button type="button" class="btn-secondary" onclick="removeVendorImage('edit')" style="margin-left: 8px; margin-bottom: 8px;"><i class="fas fa-trash"></i></button>` : ''}
                                    <p style="font-size: 12px; color: var(--text-muted); margin: 0;">Recommended: Square image, max 2MB</p>
                                </div>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label class="form-label">Vendor Name</label>
                                <input type="text" id="edit-vendor-name" class="form-input" value="${vendor.name}" placeholder="Enter vendor name">
                            </div>
                            <div>
                                <label class="form-label">Type</label>
                                <select id="edit-vendor-type" class="form-input">
                                    <option value="vendor" ${vendor.type === 'vendor' || !vendor.type ? 'selected' : ''}>Vendor</option>
                                    <option value="service" ${vendor.type === 'service' ? 'selected' : ''}>Service</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="form-label">Categories (select all that apply)</label>
                            ${(() => {
                                const predefinedCategories = ['Vape Products', 'Tobacco Products', 'Beverages', 'Snacks & Candy', 'Store Supplies'];
                                const vendorCategories = vendor.categories || (vendor.category ? [vendor.category] : []);
                                const customCategories = vendorCategories.filter(c => !predefinedCategories.includes(c));

                                return `
                                    <div id="edit-vendor-categories-container" style="display: flex; flex-wrap: wrap; gap: 10px; padding: 12px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 8px;">
                                        ${predefinedCategories.map(cat => `
                                            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 6px 12px; background: var(--bg-primary); border-radius: 6px; font-size: 14px;">
                                                <input type="checkbox" name="edit-vendor-category" value="${cat}" ${vendorCategories.includes(cat) ? 'checked' : ''}> ${cat}
                                            </label>
                                        `).join('')}
                                        ${customCategories.map(cat => `
                                            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 6px 12px; background: var(--bg-primary); border-radius: 6px; font-size: 14px; border: 1px solid var(--accent-primary);">
                                                <input type="checkbox" name="edit-vendor-category" value="${cat}" checked> ${cat}
                                                <i class="fas fa-times" style="margin-left: 4px; color: var(--text-muted); cursor: pointer;" onclick="this.parentElement.remove(); event.stopPropagation();"></i>
                                            </label>
                                        `).join('')}
                                    </div>
                                    <div style="display: flex; gap: 8px; align-items: center;">
                                        <input type="text" id="edit-vendor-custom-category" class="form-input" placeholder="Add custom category..." style="flex: 1;">
                                        <button type="button" class="btn-secondary" onclick="addCustomCategoryCheckbox('edit-vendor-categories-container', 'edit-vendor-custom-category')" style="white-space: nowrap;">
                                            <i class="fas fa-plus"></i> Add
                                        </button>
                                    </div>
                                `;
                            })()}
                        </div>

                        <div>
                            <label class="form-label">Contact Person</label>
                            <input type="text" id="edit-vendor-contact" class="form-input" value="${vendor.contact}" placeholder="Enter contact name">
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label class="form-label">Phone</label>
                                <input type="tel" id="edit-vendor-phone" class="form-input" value="${vendor.phone}" placeholder="(800) 555-0000" oninput="formatPhoneNumber(this)" maxlength="14">
                            </div>
                            <div>
                                <label class="form-label">Phone 2 <span style="color: var(--text-muted); font-weight: 400;">(optional)</span></label>
                                <input type="tel" id="edit-vendor-phone2" class="form-input" value="${vendor.phone2 || ''}" placeholder="(800) 555-0000" oninput="formatPhoneNumber(this)" maxlength="14">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label class="form-label">Email</label>
                                <input type="email" id="edit-vendor-email" class="form-input" value="${vendor.email}" placeholder="contact@vendor.com">
                            </div>
                            <div>
                                <label class="form-label">Website</label>
                                <input type="url" id="edit-vendor-website" class="form-input" value="${vendor.website || ''}" placeholder="https://www.vendor.com" pattern="https?://.+">
                            </div>
                        </div>

                        <div>
                            <label class="form-label">Access Information</label>
                            <textarea id="edit-vendor-access" class="form-input" placeholder="Account details, login info, etc." style="min-height: 80px;">${vendor.access || ''}</textarea>
                        </div>

                        <div>
                            <label class="form-label">Products/Services</label>
                            <textarea id="edit-vendor-products" class="form-input" placeholder="What products/services do you buy from this vendor?" style="min-height: 80px;">${vendor.products}</textarea>
                        </div>

                        <div>
                            <label class="form-label">Order Methods</label>
                            <textarea id="edit-vendor-order-methods" class="form-input" placeholder="How to order (phone, email, online, etc.)" style="min-height: 80px;">${vendor.orderMethods}</textarea>
                        </div>

                        <div>
                            <label class="form-label">Additional Notes</label>
                            <textarea id="edit-vendor-notes" class="form-input" placeholder="Payment terms, delivery schedule, discounts, etc." style="min-height: 80px;">${vendor.notes || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer" style="justify-content: space-between;">
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-primary" onclick="saveVendorChanges('${vendor.firestoreId}')">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                    </div>
                    <button class="btn-danger" onclick="deleteVendorConfirm('${vendor.firestoreId}')">
                        <i class="fas fa-trash"></i> Delete Vendor
                    </button>
                </div>
            `;

            modal.classList.add('active');
        }

        /**
         * Remove vendor image from preview
         */
        function removeVendorImage(mode) {
            const previewId = mode === 'edit' ? 'edit-vendor-image-preview' : 'vendor-image-preview';
            const inputId = mode === 'edit' ? 'edit-vendor-image' : 'vendor-image';
            const preview = document.getElementById(previewId);
            const input = document.getElementById(inputId);

            if (preview) {
                preview.innerHTML = `<i class="fas fa-building" style="font-size: 32px; color: var(--text-muted);"></i>`;
                preview.setAttribute('data-removed', 'true');
            }
            if (input) {
                input.value = '';
            }
        }

        async function saveVendorChanges(firestoreId) {
            const name = document.getElementById('edit-vendor-name').value.trim();
            const type = document.getElementById('edit-vendor-type').value;

            // Get selected categories (multiple)
            const categories = getSelectedCategories('edit-vendor-categories-container');
            // For backwards compatibility, also store first category as 'category'
            const category = categories.length > 0 ? categories[0] : '';

            if (categories.length === 0) {
                alert('Please select at least one category');
                return;
            }

            const contact = document.getElementById('edit-vendor-contact').value.trim();
            const phone = document.getElementById('edit-vendor-phone').value.trim();
            const phone2 = document.getElementById('edit-vendor-phone2').value.trim();
            const email = document.getElementById('edit-vendor-email').value.trim();
            const website = document.getElementById('edit-vendor-website').value.trim();
            const access = document.getElementById('edit-vendor-access').value.trim();
            const products = document.getElementById('edit-vendor-products').value.trim();
            const orderMethods = document.getElementById('edit-vendor-order-methods').value.trim();
            const notes = document.getElementById('edit-vendor-notes').value.trim();
            const imageInput = document.getElementById('edit-vendor-image');
            const imagePreview = document.getElementById('edit-vendor-image-preview');

            // Validate required field
            if (!name) {
                alert('Please enter a vendor name');
                return;
            }

            // Validate email format if provided
            if (email && !isValidEmail(email)) {
                alert('Please enter a valid email address (e.g., contact@company.com)');
                return;
            }

            // Validate website format if provided
            if (website && !isValidUrl(website)) {
                alert('Please enter a valid website URL (e.g., https://www.company.com)');
                return;
            }

            try {
                const existingVendor = firebaseVendors.find(v => v.firestoreId === firestoreId);

                // Determine image value
                let imageUrl = null;
                let imagePath = null;
                const wasRemoved = imagePreview?.getAttribute('data-removed') === 'true';

                if (wasRemoved) {
                    // Image was explicitly removed - delete from Storage if exists
                    if (existingVendor?.imagePath) {
                        try {
                            if (!firebaseStorageHelper.isInitialized) {
                                firebaseStorageHelper.initialize();
                            }
                            await firebaseStorageHelper.deleteFile(existingVendor.imagePath);
                        } catch (err) {
                            console.error('Error deleting old vendor image from Storage:', err);
                        }
                    }
                    imageUrl = null;
                    imagePath = null;
                } else if (imageInput?.files && imageInput.files.length > 0) {
                    // New image uploaded - upload to Firebase Storage
                    if (!firebaseStorageHelper.isInitialized) {
                        firebaseStorageHelper.initialize();
                    }

                    // Delete old image from Storage if exists
                    if (existingVendor?.imagePath) {
                        try {
                            await firebaseStorageHelper.deleteFile(existingVendor.imagePath);
                        } catch (err) {
                            console.error('Error deleting old vendor image from Storage:', err);
                        }
                    }

                    const rawBase64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(imageInput.files[0]);
                    });

                    try {
                        const uploadResult = await firebaseStorageHelper.uploadImage(
                            rawBase64,
                            'vendors/images',
                            firestoreId
                        );
                        imageUrl = uploadResult.url;
                        imagePath = uploadResult.path;
                    } catch (err) {
                        console.error('Error uploading vendor image to Storage:', err);
                        // Fallback to compressed base64
                        imageUrl = await compressImage(rawBase64);
                    }
                } else {
                    // Keep existing image
                    imageUrl = existingVendor?.image || null;
                    imagePath = existingVendor?.imagePath || null;
                }

                const updateData = {
                    name,
                    type,
                    category,           // First category for backwards compatibility
                    categories,         // Array of all selected categories
                    contact,
                    phone,
                    phone2,
                    email,
                    website,
                    access,
                    products,
                    orderMethods,
                    notes,
                    image: imageUrl,
                    imagePath: imagePath
                };

                await firebaseVendorsManager.updateVendor(firestoreId, updateData);

                // Reload vendors
                firebaseVendors = await firebaseVendorsManager.loadVendors();
                closeModal();
                renderVendors();
            } catch (error) {
                console.error('Error updating vendor:', error);
                alert('Error updating vendor: ' + error.message);
            }
        }

        function deleteVendorConfirm(firestoreId) {
            const vendor = firebaseVendors.find(v => v.firestoreId === firestoreId);
            if (!vendor) return;

            showConfirmModal({
                title: 'Delete Vendor',
                message: `Are you sure you want to delete "${vendor.name}"? This action cannot be undone.`,
                confirmText: 'Delete',
                type: 'danger',
                onConfirm: () => deleteVendor(firestoreId)
            });
        }

        async function deleteVendor(firestoreId) {
            try {
                await firebaseVendorsManager.deleteVendor(firestoreId);

                // Reload vendors
                firebaseVendors = await firebaseVendorsManager.loadVendors();
                closeModal();
                renderVendors();
            } catch (error) {
                console.error('Error deleting vendor:', error);
            }
        }

        // Helper functions
        function isValidUrl(string) {
            // Accept URLs with or without protocol
            // Valid: google.com, www.google.com, https://google.com
            const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+([\/\w\-._~:?#[\]@!$&'()*+,;=]*)?$/;
            return urlPattern.test(string);
        }

        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        function formatDate(dateStr) {
            // Format date string directly without using Date object to avoid timezone issues
            if (!dateStr) return 'Not Specified';

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            // Handle Date objects
            if (dateStr instanceof Date) {
                if (isNaN(dateStr.getTime())) return 'Not Specified';
                const monthName = monthNames[dateStr.getMonth()];
                const dayNum = dateStr.getDate();
                const year = dateStr.getFullYear();
                return `${monthName} ${dayNum}, ${year}`;
            }

            // Handle Firestore Timestamp objects
            if (dateStr && typeof dateStr.toDate === 'function') {
                const date = dateStr.toDate();
                if (isNaN(date.getTime())) return 'Not Specified';
                const monthName = monthNames[date.getMonth()];
                const dayNum = date.getDate();
                const year = date.getFullYear();
                return `${monthName} ${dayNum}, ${year}`;
            }

            // Handle string format "YYYY-MM-DD"
            if (typeof dateStr === 'string' && dateStr.includes('-')) {
                const [year, month, day] = dateStr.split('-');
                const monthIndex = parseInt(month, 10) - 1;
                const dayNum = parseInt(day, 10);
                // Validate the parsed values
                if (isNaN(monthIndex) || isNaN(dayNum) || monthIndex < 0 || monthIndex > 11) {
                    return 'Not Specified';
                }
                const monthName = monthNames[monthIndex];
                return `${monthName} ${dayNum}, ${year}`;
            }

            // Check if it's "Invalid Date" string
            const strValue = String(dateStr);
            if (strValue === 'Invalid Date' || strValue === 'NaN') {
                return 'Not Specified';
            }

            return strValue;
        }

        // Format phone number to US format (XXX) XXX-XXXX
        function formatPhoneNumber(input) {
            // Remove all non-digit characters
            let value = input.value.replace(/\D/g, '');

            // Limit to 10 digits
            if (value.length > 10) {
                value = value.substring(0, 10);
            }

            // Format the number
            if (value.length === 0) {
                input.value = '';
            } else if (value.length <= 3) {
                input.value = '(' + value;
            } else if (value.length <= 6) {
                input.value = '(' + value.substring(0, 3) + ') ' + value.substring(3);
            } else {
                input.value = '(' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6);
            }
        }

        // Helper function to extract emergency contact name from combined string
        function getEmergencyContactName(emergencyContact) {
            if (!emergencyContact) return '';
            // Format is typically "Name - (XXX) XXX-XXXX" or "Name - Phone"
            const parts = emergencyContact.split(' - ');
            return parts[0] || '';
        }

        // Helper function to extract emergency contact phone from combined string
        function getEmergencyContactPhone(emergencyContact) {
            if (!emergencyContact) return '';
            // Format is typically "Name - (XXX) XXX-XXXX" or "Name - Phone"
            const parts = emergencyContact.split(' - ');
            return parts[1] || '';
        }

        // Helper function to combine emergency contact name and phone
        function combineEmergencyContact(name, phone) {
            if (!name && !phone) return 'Not provided';
            if (!name) return phone;
            if (!phone) return name;
            return `${name} - ${phone}`;
        }

        // Toast notification function
        function showToast(message, type = 'info') {
            // Remove any existing toast
            const existingToast = document.querySelector('.toast-notification');
            if (existingToast) {
                existingToast.remove();
            }

            // Create toast element
            const toast = document.createElement('div');
            toast.className = `toast-notification toast-${type}`;

            // Determine icon based on type
            let icon = 'fa-info-circle';
            if (type === 'success') icon = 'fa-check-circle';
            else if (type === 'error') icon = 'fa-exclamation-circle';
            else if (type === 'warning') icon = 'fa-exclamation-triangle';

            toast.innerHTML = `
                <i class="fas ${icon}"></i>
                <span>${message}</span>
            `;

            // Add to body
            document.body.appendChild(toast);

            // Show toast with animation
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);

            // Auto-hide after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 3000);
        }

        // Variable to track employee being edited
        let editingEmployeeId = null;

        // Variables to store selected files for employee paperwork
        let selectedEmployeePaperworkFiles = [];
        let editEmployeePaperworkFiles = [];

        // Helper function to render existing paperwork
        function renderExistingPaperwork(employeeData) {
            const paperwork = employeeData.paperwork || [];
            if (paperwork.length === 0) {
                return '<p style="color: var(--text-muted); font-size: 14px; padding: 12px; background: var(--surface-secondary); border-radius: 8px;">No documents uploaded yet</p>';
            }

            return `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${paperwork.map((doc, index) => `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--surface-secondary); border-radius: 8px; border: 1px solid var(--border-color);">
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                                <i class="fas ${getFileIcon(doc.fileType)}" style="color: var(--accent-primary); font-size: 18px;"></i>
                                <div style="flex: 1;">
                                    <div style="font-weight: 500; color: var(--text-primary); font-size: 14px;">${doc.fileName}</div>
                                    <div style="font-size: 12px; color: var(--text-muted);">
                                        ${doc.documentType || 'Document'} • ${formatFileSize(doc.fileSize)} • ${formatDate(doc.uploadedAt.toDate ? doc.uploadedAt.toDate() : doc.uploadedAt)}
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn-icon" onclick="showDocumentPreview({ url: '${doc.downloadURL}', fileName: '${doc.fileName}', fileType: '${doc.fileType || ''}', fileSize: ${doc.fileSize || 0}, documentType: '${doc.documentType || 'Document'}', uploadedAt: '${doc.uploadedAt?.toDate ? doc.uploadedAt.toDate().toISOString() : doc.uploadedAt}' })" title="View">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon danger" onclick="deleteEmployeePaperwork('${employeeData.id || employeeData.firestoreId}', '${doc.storagePath}', ${index})" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Helper function to get file icon based on file type
        function getFileIcon(fileType) {
            if (!fileType) return 'fa-file';
            if (fileType.includes('pdf')) return 'fa-file-pdf';
            if (fileType.includes('word') || fileType.includes('doc')) return 'fa-file-word';
            if (fileType.includes('image') || fileType.includes('jpg') || fileType.includes('jpeg') || fileType.includes('png')) return 'fa-file-image';
            return 'fa-file';
        }

        // Helper function to format file size
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        }

        // Handle file selection for add employee paperwork
        function handleEmployeePaperworkSelect(input) {
            const files = Array.from(input.files);
            const maxSize = 10 * 1024 * 1024; // 10MB

            // Validate files
            const validFiles = files.filter(file => {
                if (file.size > maxSize) {
                    alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
                    return false;
                }
                return true;
            });

            // Add to selected files
            selectedEmployeePaperworkFiles = [...selectedEmployeePaperworkFiles, ...validFiles];

            // Update UI
            updateEmployeePaperworkList();
        }

        // Handle file selection for edit employee paperwork
        function handleEditEmployeePaperworkSelect(input) {
            const files = Array.from(input.files);
            const maxSize = 10 * 1024 * 1024; // 10MB

            // Validate files
            const validFiles = files.filter(file => {
                if (file.size > maxSize) {
                    alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
                    return false;
                }
                return true;
            });

            // Add to selected files
            editEmployeePaperworkFiles = [...editEmployeePaperworkFiles, ...validFiles];

            // Update UI
            updateEditEmployeePaperworkList();
        }

        // Update paperwork list display for add employee
        function updateEmployeePaperworkList() {
            const listContainer = document.getElementById('emp-paperwork-list');
            if (!listContainer) return;

            if (selectedEmployeePaperworkFiles.length === 0) {
                listContainer.innerHTML = '';
                return;
            }

            listContainer.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${selectedEmployeePaperworkFiles.map((file, index) => `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--surface-secondary); border-radius: 8px; border: 1px solid var(--border-color);">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <i class="fas ${getFileIcon(file.type)}" style="color: var(--accent-primary); font-size: 18px;"></i>
                                <div>
                                    <div style="font-weight: 500; color: var(--text-primary); font-size: 14px;">${file.name}</div>
                                    <div style="font-size: 12px; color: var(--text-muted);">${formatFileSize(file.size)}</div>
                                </div>
                            </div>
                            <button class="btn-icon danger" onclick="removeEmployeePaperwork(${index})" title="Remove">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Update paperwork list display for edit employee
        function updateEditEmployeePaperworkList() {
            const listContainer = document.getElementById('edit-emp-paperwork-list');
            if (!listContainer) return;

            if (editEmployeePaperworkFiles.length === 0) {
                listContainer.innerHTML = '';
                return;
            }

            listContainer.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${editEmployeePaperworkFiles.map((file, index) => `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--surface-secondary); border-radius: 8px; border: 1px solid var(--border-color);">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <i class="fas ${getFileIcon(file.type)}" style="color: var(--accent-primary); font-size: 18px;"></i>
                                <div>
                                    <div style="font-weight: 500; color: var(--text-primary); font-size: 14px;">${file.name}</div>
                                    <div style="font-size: 12px; color: var(--text-muted);">${formatFileSize(file.size)}</div>
                                </div>
                            </div>
                            <button class="btn-icon danger" onclick="removeEditEmployeePaperwork(${index})" title="Remove">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Remove file from add employee paperwork list
        function removeEmployeePaperwork(index) {
            selectedEmployeePaperworkFiles.splice(index, 1);
            updateEmployeePaperworkList();
        }

        // Remove file from edit employee paperwork list
        function removeEditEmployeePaperwork(index) {
            editEmployeePaperworkFiles.splice(index, 1);
            updateEditEmployeePaperworkList();
        }

        // Delete existing employee paperwork
        async function deleteEmployeePaperwork(employeeId, storagePath, index) {
            if (!confirm('Are you sure you want to delete this document?')) {
                return;
            }

            try {
                const success = await firebaseEmployeeManager.deletePaperwork(employeeId, storagePath);
                if (success) {
                    showNotification('Document deleted successfully', 'success');
                    // Refresh the modal with updated data
                    const emp = employees.find(e => e.id === employeeId || e.firestoreId === employeeId);
                    if (emp) {
                        // Reload employee data from Firebase
                        const updatedEmp = await firebaseEmployeeManager.getEmployee(employeeId);
                        if (updatedEmp) {
                            // Update local array
                            const localIndex = employees.findIndex(e => e.id === employeeId || e.firestoreId === employeeId);
                            if (localIndex !== -1) {
                                employees[localIndex] = updatedEmp;
                            }
                            // Re-render the existing paperwork section
                            const existingPaperworkDiv = document.getElementById('edit-emp-existing-paperwork');
                            if (existingPaperworkDiv) {
                                existingPaperworkDiv.innerHTML = renderExistingPaperwork(updatedEmp);
                            }
                        }
                    }
                } else {
                    alert('Failed to delete document. Please try again.');
                }
            } catch (error) {
                console.error('Error deleting document:', error);
                alert('Error deleting document. Please try again.');
            }
        }

        window.openModal = function(type, data = null) {
            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            let content = '';
            switch(type) {
                case 'edit-employee':
                    if (!data) {
                        alert('No employee data provided');
                        return;
                    }
                    // Split name into first and last
                    const nameParts = data.name.split(' ');
                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';

                    content = `
                        <div class="modal-header">
                            <h2>Edit Employee</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <!-- Profile Photo Section -->
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label>Profile Photo</label>
                                <div style="display: flex; align-items: flex-start; gap: 16px;">
                                    <div id="edit-emp-photo-preview" style="width: 100px; height: 100px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 3px ${data.photo ? 'solid var(--accent-primary)' : 'dashed var(--border-color)'}; cursor: pointer;" onclick="document.getElementById('edit-emp-photo').click()">
                                        ${data.photo ? `<img src="${data.photo}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i class="fas fa-user" style="font-size: 40px; color: var(--text-muted);"></i>`}
                                    </div>
                                    <div style="flex: 1;">
                                        <input type="file" id="edit-emp-photo" accept="image/*" style="display: none;" onchange="previewEditEmployeePhoto(this)">
                                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                                            <button type="button" class="btn-secondary" onclick="document.getElementById('edit-emp-photo').click()">
                                                <i class="fas fa-upload"></i> Upload
                                            </button>
                                            <button type="button" class="btn-secondary" onclick="openCameraModal('edit-emp-photo-preview', 'edit-emp-photo')">
                                                <i class="fas fa-camera"></i> Camera
                                            </button>
                                            <button type="button" class="btn-secondary" onclick="removeEditEmployeePhoto()">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                        <p style="font-size: 12px; color: var(--text-muted); margin: 0;">JPG, PNG (max 5MB). Photo will be cropped to circle.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="form-divider"></div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>First Name *</label>
                                    <input type="text" class="form-input" id="edit-emp-first-name" value="${firstName}" placeholder="John">
                                </div>
                                <div class="form-group">
                                    <label>Last Name *</label>
                                    <input type="text" class="form-input" id="edit-emp-last-name" value="${lastName}" placeholder="Doe">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Login Email *</label>
                                    <input type="email" class="form-input" id="edit-emp-email" value="${data.authEmail || data.email || ''}" placeholder="john@vsu.com">
                                </div>
                                <div class="form-group">
                                    <label>Phone *</label>
                                    <input type="tel" class="form-input" id="edit-emp-phone" value="${data.phone || ''}" placeholder="(619) 555-0000" oninput="formatPhoneNumber(this)" maxlength="14">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Reset Password</label>
                                    <input type="password" class="form-input" id="edit-emp-password" placeholder="Enter new password to send reset email">
                                    <small style="color: var(--text-muted); font-size: 11px; margin-top: 4px; display: block;">
                                        <i class="fas fa-info-circle"></i> Entering a password will send a reset email to the employee
                                    </small>
                                </div>
                                <div class="form-group">
                                    <label>Confirm Password</label>
                                    <input type="password" class="form-input" id="edit-emp-confirm-password" placeholder="Confirm new password">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Job Title *</label>
                                    <input type="text" class="form-input" id="edit-emp-role" value="${data.role || ''}" placeholder="e.g., Store Manager, Sales Associate...">
                                </div>
                                <div class="form-group">
                                    <label>Permission Level *</label>
                                    <select class="form-input" id="edit-emp-employee-type">
                                        <option value="">Select permission level...</option>
                                        <option value="admin" ${data.employeeType === 'admin' ? 'selected' : ''}>👑 Admin - Full System Access</option>
                                        <option value="manager" ${data.employeeType === 'manager' ? 'selected' : ''}>📊 Manager - Employee Management</option>
                                        <option value="employee" ${data.employeeType === 'employee' ? 'selected' : ''}>👤 Employee - Limited Access</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Store *</label>
                                    <select class="form-input" id="edit-emp-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar" ${data.store === 'Miramar' ? 'selected' : ''}>VSU Miramar</option>
                                        <option value="Morena" ${data.store === 'Morena' ? 'selected' : ''}>VSU Morena</option>
                                        <option value="Kearny Mesa" ${data.store === 'Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                                        <option value="Chula Vista" ${data.store === 'Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                                        <option value="North Park" ${data.store === 'North Park' ? 'selected' : ''}>VSU North Park</option>
                                        <option value="Miramar Wine & Liquor" ${data.store === 'Miramar Wine & Liquor' ? 'selected' : ''}>Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Status *</label>
                                    <select class="form-input" id="edit-emp-status">
                                        <option value="active" ${data.status === 'active' ? 'selected' : ''}>Active</option>
                                        <option value="inactive" ${data.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Hire Date</label>
                                <input type="date" class="form-input" id="edit-emp-hire-date" value="${data.hireDate || ''}">
                            </div>
                            <div class="form-divider"></div>
                            <h3 class="form-section-title">Emergency Information</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Emergency Contact Name</label>
                                    <input type="text" class="form-input" id="edit-emp-emergency-name" value="${getEmergencyContactName(data.emergencyContact)}" placeholder="Contact name">
                                </div>
                                <div class="form-group">
                                    <label>Emergency Contact Phone</label>
                                    <input type="tel" class="form-input" id="edit-emp-emergency-phone" value="${getEmergencyContactPhone(data.emergencyContact)}" placeholder="(555) 555-5555" oninput="formatPhoneNumber(this)" maxlength="14">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Medical Conditions</label>
                                <textarea class="form-input" id="edit-emp-medical-conditions" rows="2" placeholder="Any medical conditions or notes...">${data.medicalConditions || data.allergies || ''}</textarea>
                            </div>
                            <div class="form-divider"></div>
                            <h3 class="form-section-title">Employee Paperwork</h3>
                            <div class="form-group">
                                <label>Existing Documents</label>
                                <div id="edit-emp-existing-paperwork" style="margin-bottom: 12px;">
                                    ${renderExistingPaperwork(data)}
                                </div>
                                <label>Upload New Documents <span style="font-size: 12px; color: var(--text-muted);">(ID, contracts, certificates, etc.)</span></label>
                                <div class="file-upload-area" id="edit-emp-paperwork-upload" onclick="document.getElementById('edit-emp-paperwork-files').click()">
                                    <input type="file" id="edit-emp-paperwork-files" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style="display: none;" onchange="handleEditEmployeePaperworkSelect(this)">
                                    <div class="file-upload-content">
                                        <i class="fas fa-cloud-upload-alt" style="font-size: 32px; color: var(--accent-primary); margin-bottom: 8px;"></i>
                                        <span style="color: var(--text-secondary);">Click to upload or drag and drop</span>
                                        <span style="color: var(--text-muted); font-size: 12px;">PDF, DOC, DOCX, JPG, PNG files (max 10MB each)</span>
                                    </div>
                                </div>
                                <div id="edit-emp-paperwork-list" style="margin-top: 12px;"></div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveEditedEmployee()">Save Changes</button>
                        </div>
                    `;
                    break;
                case 'offboarding':
                    const offboardingEmp = data;
                    content = `
                        <div class="modal-header">
                            <h2 style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-user-minus" style="color: #ef4444;"></i>
                                Employee Offboarding
                            </h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <i class="fas fa-info-circle" style="color: #ef4444;"></i>
                                    <span style="font-size: 13px; color: #991b1b;">Documenting exit for <strong>${offboardingEmp.name}</strong></span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Reason for Leaving *</label>
                                <select class="form-input" id="offboard-reason" required>
                                    <option value="">Select reason...</option>
                                    <option value="resignation">Resignation</option>
                                    <option value="termination">Termination</option>
                                    <option value="contract_end">End of Contract</option>
                                    <option value="abandonment">Job Abandonment</option>
                                    <option value="mutual">Mutual Agreement</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group" id="offboard-other-reason-container" style="display: none;">
                                <label>Specify Reason *</label>
                                <input type="text" class="form-input" id="offboard-other-reason" placeholder="Please specify...">
                            </div>
                            <div class="form-group">
                                <label>Last Day Worked *</label>
                                <input type="date" class="form-input" id="offboard-last-day" value="${new Date().toISOString().split('T')[0]}" required>
                            </div>

                            <div class="form-divider"></div>

                            <div class="form-group">
                                <label style="display: flex; align-items: center; gap: 8px;">
                                    <input type="checkbox" id="offboard-keys" style="width: 18px; height: 18px;">
                                    <span><i class="fas fa-key" style="color: var(--accent-primary); margin-right: 4px;"></i> Keys Returned</span>
                                </label>
                            </div>

                            <div class="form-group">
                                <label>Received By *</label>
                                <input type="text" class="form-input" id="offboard-received-by" placeholder="Name of person who received items" required>
                            </div>

                            <div class="form-group">
                                <label>Notes</label>
                                <textarea class="form-input" id="offboard-notes" rows="2" placeholder="Any additional notes..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="cancelOffboarding()">Cancel</button>
                            <button class="btn-primary" style="background: #ef4444; border-color: #ef4444;" onclick="confirmOffboarding()">
                                <i class="fas fa-check"></i> Complete
                            </button>
                        </div>
                    `;

                    // Add event listener for reason change after modal renders
                    setTimeout(() => {
                        const reasonSelect = document.getElementById('offboard-reason');
                        if (reasonSelect) {
                            reasonSelect.addEventListener('change', function() {
                                const otherContainer = document.getElementById('offboard-other-reason-container');
                                otherContainer.style.display = this.value === 'other' ? 'block' : 'none';
                            });
                        }
                    }, 100);
                    break;
                case 'inactive-employees':
                    const inactiveEmps = data || [];
                    content = `
                        <div class="modal-header">
                            <h2 style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-user-slash" style="color: #ef4444;"></i>
                                Inactive Employees
                            </h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
                            ${inactiveEmps.length === 0 ? `
                                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                                    <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 16px; color: var(--success);"></i>
                                    <p>No inactive employees</p>
                                </div>
                            ` : `
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    ${inactiveEmps.map(emp => {
                                        const empId = emp.firestoreId || emp.id;
                                        const hasOffboarding = emp.offboarding && emp.offboarding.reason;
                                        return `
                                            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px;">
                                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                                    <div style="display: flex; align-items: center; gap: 12px;">
                                                        <div class="avatar avatar-${emp.color || 'a'}" style="width: 40px; height: 40px; font-size: 14px;">${emp.initials || 'XX'}</div>
                                                        <div>
                                                            <div style="font-weight: 600; color: var(--text-primary);">${emp.name || 'Unknown'}</div>
                                                            <div style="font-size: 12px; color: var(--text-muted);">${emp.role || 'N/A'} - ${emp.store || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                    <div style="display: flex; gap: 8px;">
                                                        ${hasOffboarding ? `
                                                            <button class="btn-secondary" onclick="viewOffboardingDetails('${empId}')" style="font-size: 12px; padding: 6px 12px;">
                                                                <i class="fas fa-file-alt"></i> View Details
                                                            </button>
                                                        ` : `
                                                            <span style="font-size: 11px; color: var(--text-muted); padding: 6px 12px;">No offboarding data</span>
                                                        `}
                                                        <button class="btn-icon success" onclick="activateEmployee('${empId}'); closeModal();" title="Reactivate">
                                                            <i class="fas fa-user-check"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                ${hasOffboarding ? `
                                                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); font-size: 12px; color: var(--text-secondary);">
                                                        <span style="background: #fef2f2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-weight: 500;">
                                                            ${emp.offboarding.reasonText || emp.offboarding.reason}
                                                        </span>
                                                        <span style="margin-left: 12px;">Last day: ${formatDate(emp.offboarding.lastDayWorked)}</span>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            `}
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Close</button>
                        </div>
                    `;
                    break;
                case 'offboarding-details':
                    const offEmp = data;
                    const offData = offEmp.offboarding || {};
                    content = `
                        <div class="modal-header">
                            <h2 style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-file-alt" style="color: var(--accent-primary);"></i>
                                Offboarding Details
                            </h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div style="background: var(--bg-secondary); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                    <div class="avatar avatar-${offEmp.color || 'a'}" style="width: 48px; height: 48px; font-size: 16px;">${offEmp.initials || 'XX'}</div>
                                    <div>
                                        <div style="font-weight: 600; font-size: 18px; color: var(--text-primary);">${offEmp.name || 'Unknown'}</div>
                                        <div style="font-size: 13px; color: var(--text-muted);">${offEmp.role || 'N/A'} - ${offEmp.store || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>

                            <div style="display: grid; gap: 16px;">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                    <div>
                                        <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Reason for Leaving</label>
                                        <div style="background: #fef2f2; color: #991b1b; padding: 8px 12px; border-radius: 6px; font-weight: 500;">
                                            ${offData.reasonText || offData.reason || 'Not specified'}
                                        </div>
                                    </div>
                                    <div>
                                        <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Last Day Worked</label>
                                        <div style="background: var(--bg-secondary); padding: 8px 12px; border-radius: 6px; font-weight: 500;">
                                            ${offData.lastDayWorked ? formatDate(offData.lastDayWorked) : 'Not specified'}
                                        </div>
                                    </div>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                    <div>
                                        <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Keys Returned</label>
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <i class="fas ${offData.keysReturned ? 'fa-check-circle' : 'fa-times-circle'}" style="color: ${offData.keysReturned ? 'var(--success)' : 'var(--danger)'}; font-size: 18px;"></i>
                                            <span>${offData.keysReturned ? 'Yes' : 'No'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Received By</label>
                                        <div style="background: var(--bg-secondary); padding: 8px 12px; border-radius: 6px;">
                                            ${offData.receivedBy || 'Not specified'}
                                        </div>
                                    </div>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                    <div>
                                        <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Offboarding Date</label>
                                        <div style="background: var(--bg-secondary); padding: 8px 12px; border-radius: 6px;">
                                            ${offData.offboardingDate ? formatDate(offData.offboardingDate.split('T')[0]) : 'Not specified'}
                                        </div>
                                    </div>
                                    <div>
                                        <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Processed By</label>
                                        <div style="background: var(--bg-secondary); padding: 8px 12px; border-radius: 6px;">
                                            ${offData.offboardingBy || 'Not specified'}
                                        </div>
                                    </div>
                                </div>

                                ${offData.notes ? `
                                    <div>
                                        <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Notes</label>
                                        <div style="background: var(--bg-secondary); padding: 12px; border-radius: 6px; white-space: pre-wrap;">
                                            ${offData.notes}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="openInactiveEmployeesModal()">
                                <i class="fas fa-arrow-left"></i> Back to List
                            </button>
                            <button class="btn-danger" onclick="confirmDeleteEmployee('${offEmp.firestoreId || offEmp.id}', '${offEmp.name.replace(/'/g, "\\'")}');" style="background: #dc2626; color: white;">
                                <i class="fas fa-trash-alt"></i> Delete Employee
                            </button>
                            <button class="btn-primary" onclick="activateEmployee('${offEmp.firestoreId || offEmp.id}'); closeModal();">
                                <i class="fas fa-user-check"></i> Reactivate Employee
                            </button>
                        </div>
                    `;
                    break;
                case 'add-employee':
                    content = `
                        <div class="modal-header">
                            <h2>Add New Employee</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <!-- Profile Photo Section -->
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label>Profile Photo</label>
                                <div style="display: flex; align-items: flex-start; gap: 16px;">
                                    <div id="emp-photo-preview" style="width: 100px; height: 100px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 3px dashed var(--border-color); cursor: pointer;" onclick="document.getElementById('emp-photo').click()">
                                        <i class="fas fa-user" style="font-size: 40px; color: var(--text-muted);"></i>
                                    </div>
                                    <div style="flex: 1;">
                                        <input type="file" id="emp-photo" accept="image/*" style="display: none;" onchange="previewEmployeePhoto(this)">
                                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                                            <button type="button" class="btn-secondary" onclick="document.getElementById('emp-photo').click()">
                                                <i class="fas fa-upload"></i> Upload
                                            </button>
                                            <button type="button" class="btn-secondary" onclick="openCameraModal('emp-photo-preview', 'emp-photo')">
                                                <i class="fas fa-camera"></i> Camera
                                            </button>
                                            <button type="button" class="btn-secondary" onclick="removeEmployeePhoto()">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                        <p style="font-size: 12px; color: var(--text-muted); margin: 0;">JPG, PNG (max 5MB). Photo will be cropped to circle.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="form-divider"></div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>First Name *</label>
                                    <input type="text" class="form-input" id="emp-first-name" placeholder="John">
                                </div>
                                <div class="form-group">
                                    <label>Last Name *</label>
                                    <input type="text" class="form-input" id="emp-last-name" placeholder="Doe">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Email *</label>
                                    <input type="email" class="form-input" id="emp-email" placeholder="john@vsu.com">
                                </div>
                                <div class="form-group">
                                    <label>Phone *</label>
                                    <input type="tel" class="form-input" id="emp-phone" placeholder="(619) 555-0000" oninput="formatPhoneNumber(this)" maxlength="14">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Password *</label>
                                    <div style="position: relative;">
                                        <input type="password" class="form-input" id="emp-password" placeholder="Enter a secure password" style="padding-right: 40px;">
                                        <button type="button" class="password-toggle" onclick="togglePasswordVisibility('emp-password', 'emp-password-toggle')" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 18px; padding: 8px;">
                                            <i class="fas fa-eye" id="emp-password-toggle"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Confirm Password *</label>
                                    <div style="position: relative;">
                                        <input type="password" class="form-input" id="emp-confirm-password" placeholder="Confirm password" style="padding-right: 40px;">
                                        <button type="button" class="password-toggle" onclick="togglePasswordVisibility('emp-confirm-password', 'emp-confirm-password-toggle')" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 18px; padding: 8px;">
                                            <i class="fas fa-eye" id="emp-confirm-password-toggle"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Job Title *</label>
                                    <input type="text" class="form-input" id="emp-role" placeholder="e.g., Store Manager, Sales Associate...">
                                </div>
                                <div class="form-group">
                                    <label>Permission Level * <i class="fas fa-info-circle" style="color: var(--accent-primary); font-size: 12px; cursor: help;" title="Admin: Full access | Manager: Can manage employees | Employee: Limited access"></i></label>
                                    <select class="form-input" id="emp-employee-type">
                                        <option value="">Select permission level...</option>
                                        <option value="admin">👑 Admin - Full System Access</option>
                                        <option value="manager">📊 Manager - Employee Management</option>
                                        <option value="employee">👤 Employee - Limited Access</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Store *</label>
                                    <select class="form-input" id="emp-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar">VSU Miramar</option>
                                        <option value="Morena">VSU Morena</option>
                                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                        <option value="Chula Vista">VSU Chula Vista</option>
                                        <option value="North Park">VSU North Park</option>
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Hire Date *</label>
                                    <input type="date" class="form-input" id="emp-hire-date">
                                </div>
                            </div>
                            <div class="form-divider"></div>
                            <h3 class="form-section-title">Emergency Information</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Emergency Contact Name</label>
                                    <input type="text" class="form-input" id="emp-emergency-name" placeholder="Contact name">
                                </div>
                                <div class="form-group">
                                    <label>Emergency Contact Phone</label>
                                    <input type="tel" class="form-input" id="emp-emergency-phone" placeholder="(555) 555-5555" oninput="formatPhoneNumber(this)" maxlength="14">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Medical Conditions</label>
                                <textarea class="form-input" id="emp-medical-conditions" rows="2" placeholder="Any medical conditions or notes..."></textarea>
                            </div>
                            <div class="form-divider"></div>
                            <h3 class="form-section-title">Employee Paperwork</h3>
                            <div class="form-group">
                                <label>Upload Documents <span style="font-size: 12px; color: var(--text-muted);">(ID, contracts, certificates, etc.)</span></label>
                                <div class="file-upload-area" id="emp-paperwork-upload" onclick="document.getElementById('emp-paperwork-files').click()">
                                    <input type="file" id="emp-paperwork-files" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style="display: none;" onchange="handleEmployeePaperworkSelect(this)">
                                    <div class="file-upload-content">
                                        <i class="fas fa-cloud-upload-alt" style="font-size: 32px; color: var(--accent-primary); margin-bottom: 8px;"></i>
                                        <span style="color: var(--text-secondary);">Click to upload or drag and drop</span>
                                        <span style="color: var(--text-muted); font-size: 12px;">PDF, DOC, DOCX, JPG, PNG files (max 10MB each)</span>
                                    </div>
                                </div>
                                <div id="emp-paperwork-list" style="margin-top: 12px;"></div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveEmployee()">Add Employee</button>
                        </div>
                    `;
                    break;
                case 'add-supply':
                    const supplyUser = getCurrentUser();
                    const userStore = supplyUser?.store || 'Miramar';
                    const isAdmin = supplyUser?.role === 'admin';

                    // Predefined supplies list with categories and priority
                    const supplyCategories = [
                        {
                            name: 'Critical Operations',
                            icon: 'fa-exclamation-triangle',
                            color: '#ef4444',
                            priority: 'critical',
                            items: [
                                { id: 'trash_bags', name: 'Black Trash Bags', unit: 'pack' },
                                { id: 'small_bags', name: 'Small Bags (for product)', unit: 'pack' },
                                { id: 'receipt_paper', name: 'Receipt Printer Paper', unit: 'roll' },
                                { id: 'label_paper', name: 'Label Paper', unit: 'roll' },
                                { id: 'large_boxes', name: 'Large Boxes', unit: 'unit' },
                                { id: 'medium_boxes', name: 'Medium Boxes', unit: 'unit' },
                                { id: 'small_boxes', name: 'Small Boxes', unit: 'unit' },
                                { id: 'packing_tape', name: 'Packing Tape', unit: 'roll' },
                                { id: 'bubble_wrap', name: 'Bubble Wrap', unit: 'roll' }
                            ]
                        },
                        {
                            name: 'Cleaning',
                            icon: 'fa-broom',
                            color: '#3b82f6',
                            priority: 'normal',
                            items: [
                                { id: 'windex', name: 'Windex / Glass Cleaner', unit: 'bottle' },
                                { id: 'lysol', name: 'Lysol / Disinfectant', unit: 'bottle' },
                                { id: 'paper_towels', name: 'Paper Towels', unit: 'roll' },
                                { id: 'broom', name: 'Broom', unit: 'unit' },
                                { id: 'mop', name: 'Mop', unit: 'unit' },
                                { id: 'bucket', name: 'Bucket', unit: 'unit' },
                                { id: 'hand_soap', name: 'Hand Soap', unit: 'bottle' },
                                { id: 'gloves', name: 'Cleaning Gloves', unit: 'pair' },
                                { id: 'air_freshener', name: 'Air Freshener', unit: 'unit' }
                            ]
                        },
                        {
                            name: 'Office',
                            icon: 'fa-pen',
                            color: '#8b5cf6',
                            priority: 'normal',
                            items: [
                                { id: 'pens', name: 'Pens', unit: 'pack' },
                                { id: 'sharpies', name: 'Sharpie Markers', unit: 'pack' },
                                { id: 'printer_paper', name: 'Printer Paper', unit: 'ream' },
                                { id: 'envelopes', name: 'Envelopes', unit: 'pack' },
                                { id: 'stapler', name: 'Stapler', unit: 'unit' },
                                { id: 'staples', name: 'Staples', unit: 'box' },
                                { id: 'clips', name: 'Paper Clips', unit: 'box' },
                                { id: 'post_its', name: 'Post-its / Sticky Notes', unit: 'pack' },
                                { id: 'folders', name: 'Folders', unit: 'pack' }
                            ]
                        },
                        {
                            name: 'Miscellaneous',
                            icon: 'fa-box',
                            color: '#f59e0b',
                            priority: 'normal',
                            items: [
                                { id: 'batteries_aa', name: 'AA Batteries', unit: 'pack' },
                                { id: 'batteries_aaa', name: 'AAA Batteries', unit: 'pack' },
                                { id: 'extension_cord', name: 'Extension Cord', unit: 'unit' },
                                { id: 'light_bulbs', name: 'Light Bulbs', unit: 'unit' },
                                { id: 'scissors', name: 'Scissors', unit: 'unit' },
                                { id: 'box_cutter', name: 'Box Cutter / Exacto', unit: 'unit' },
                                { id: 'scotch_tape', name: 'Scotch Tape', unit: 'roll' }
                            ]
                        }
                    ];

                    let supplyCategoriesHtml = '';
                    supplyCategories.forEach(cat => {
                        supplyCategoriesHtml += `
                            <div class="supply-category" style="margin-bottom: 16px;">
                                <div class="supply-category-header" style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding: 8px 12px; background: ${cat.color}15; border-radius: 8px; border-left: 3px solid ${cat.color};">
                                    <i class="fas ${cat.icon}" style="color: ${cat.color};"></i>
                                    <span style="font-weight: 600; color: var(--text-primary);">${cat.name}</span>
                                    ${cat.priority === 'critical' ? '<span style="font-size: 10px; background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; margin-left: auto;">CRITICAL</span>' : ''}
                                </div>
                                <div class="supply-items-grid" style="display: grid; gap: 8px;">
                        `;
                        cat.items.forEach(item => {
                            supplyCategoriesHtml += `
                                <div class="supply-item-row" style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--bg-secondary); border-radius: 8px; transition: all 0.2s;">
                                    <input type="checkbox" id="supply-${item.id}" data-name="${item.name}" data-priority="${cat.priority}" style="width: 18px; height: 18px; cursor: pointer;">
                                    <label for="supply-${item.id}" style="flex: 1; cursor: pointer; font-size: 14px;">${item.name}</label>
                                    <div style="display: flex; align-items: center; gap: 4px;">
                                        <button type="button" onclick="adjustSupplyQty('${item.id}', -1)" style="width: 24px; height: 24px; border: none; background: var(--bg-hover); border-radius: 4px; cursor: pointer; color: var(--text-secondary);">-</button>
                                        <input type="number" id="qty-${item.id}" value="1" min="1" max="99" style="width: 40px; text-align: center; border: 1px solid var(--border-color); border-radius: 4px; padding: 2px; background: var(--bg-card);">
                                        <button type="button" onclick="adjustSupplyQty('${item.id}', 1)" style="width: 24px; height: 24px; border: none; background: var(--bg-hover); border-radius: 4px; cursor: pointer; color: var(--text-secondary);">+</button>
                                    </div>
                                    <span style="font-size: 11px; color: var(--text-muted); min-width: 50px;">${item.unit}</span>
                                </div>
                            `;
                        });
                        supplyCategoriesHtml += '</div></div>';
                    });

                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-clipboard-list" style="margin-right: 10px; color: var(--accent-primary);"></i>Request Supplies</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
                            <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05)); padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; border: 1px solid rgba(99, 102, 241, 0.2);">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                    <i class="fas fa-info-circle" style="color: var(--accent-primary);"></i>
                                    <span style="font-weight: 600; font-size: 14px;">Select items and quantities</span>
                                </div>
                                <p style="font-size: 12px; color: var(--text-muted); margin: 0;">Items marked as <span style="color: #ef4444; font-weight: 600;">CRITICAL</span> affect daily operations and will be prioritized.</p>
                            </div>

                            <div class="form-group" style="margin-bottom: 16px;">
                                <label>Store</label>
                                ${isAdmin ? `
                                    <select class="form-input" id="supply-store">
                                        <option value="Miramar" ${userStore === 'Miramar' ? 'selected' : ''}>VSU Miramar</option>
                                        <option value="Morena" ${userStore === 'Morena' ? 'selected' : ''}>VSU Morena</option>
                                        <option value="Kearny Mesa" ${userStore === 'Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                                        <option value="Chula Vista" ${userStore === 'Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                                        <option value="North Park" ${userStore === 'North Park' ? 'selected' : ''}>VSU North Park</option>
                                        <option value="Loyal Vaper" ${userStore === 'Loyal Vaper' ? 'selected' : ''}>Loyal Vaper</option>
                                        <option value="Miramar Wine & Liquor" ${userStore === 'Miramar Wine & Liquor' ? 'selected' : ''}>Miramar Wine & Liquor</option>
                                    </select>
                                ` : `
                                    <input type="text" class="form-input" id="supply-store" value="${userStore}" readonly style="background: var(--bg-secondary); cursor: not-allowed;">
                                `}
                            </div>

                            ${supplyCategoriesHtml}
                        </div>
                        <div class="modal-footer">
                            <div id="supply-selection-count" style="flex: 1; font-size: 13px; color: var(--text-muted);">0 items selected</div>
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="addSupplyFromList()">
                                <i class="fas fa-paper-plane"></i> Send Request
                            </button>
                        </div>
                    `;
                    break;
                case 'edit-supply':
                    const supply = data;
                    const editSupplyUser = getCurrentUser();
                    const editUserStore = editSupplyUser?.store || 'Miramar';
                    const isEditAdmin = editSupplyUser?.role === 'admin';
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-edit" style="margin-right: 10px; color: var(--accent-primary);"></i>Edit Supply</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="edit-supply-id" value="${supply.id}">
                            <div class="form-group">
                                <label>Description</label>
                                <textarea class="form-input" id="edit-supply-description" rows="5" style="resize: vertical; min-height: 120px;">${supply.name || supply.description || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label>Store</label>
                                ${isEditAdmin ? `
                                    <select class="form-input" id="edit-supply-store">
                                        <option value="Miramar" ${supply.store === 'Miramar' ? 'selected' : ''}>VSU Miramar</option>
                                        <option value="Morena" ${supply.store === 'Morena' ? 'selected' : ''}>VSU Morena</option>
                                        <option value="Kearny Mesa" ${supply.store === 'Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                                        <option value="Chula Vista" ${supply.store === 'Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                                        <option value="North Park" ${supply.store === 'North Park' ? 'selected' : ''}>VSU North Park</option>
                                        <option value="Loyal Vaper" ${supply.store === 'Loyal Vaper' ? 'selected' : ''}>Loyal Vaper</option>
                                        <option value="Miramar Wine & Liquor" ${supply.store === 'Miramar Wine & Liquor' ? 'selected' : ''}>Miramar Wine & Liquor</option>
                                    </select>
                                ` : `
                                    <input type="text" class="form-input" id="edit-supply-store" value="${supply.store}" readonly style="background: var(--bg-secondary); cursor: not-allowed;">
                                `}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveSupplyEdit()">
                                <i class="fas fa-save"></i> Save Changes
                            </button>
                        </div>
                    `;
                    break;
                case 'partial-supply':
                    const partialSupply = data;
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-exclamation-triangle" style="margin-right: 10px; color: #f97316;"></i>Partial Delivery</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="partial-supply-id" value="${partialSupply.id}">
                            <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                                <div style="font-weight: 600; margin-bottom: 4px;">Original Request:</div>
                                <div style="white-space: pre-wrap; color: var(--text-secondary);">${partialSupply.name || partialSupply.description}</div>
                                <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
                                    <i class="fas fa-store"></i> ${partialSupply.store} • <i class="fas fa-user"></i> ${partialSupply.addedBy || 'Unknown'}
                                </div>
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-sticky-note" style="color: #f97316;"></i> What couldn't be delivered? *</label>
                                <textarea class="form-input" id="partial-supply-notes" rows="4" placeholder="Explain what items couldn't be sent and why...&#10;&#10;Example:&#10;Only sent 3 of 5 boxes - out of stock&#10;Windex sold out, arrives Tuesday" style="resize: vertical;"></textarea>
                            </div>
                            <div style="background: rgba(249, 115, 22, 0.1); border: 1px solid #f97316; padding: 12px; border-radius: 8px; font-size: 13px; color: #f97316;">
                                <i class="fas fa-info-circle"></i> The store will see this note and must confirm reception of the partial delivery.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="markSupplyPartial()" style="background: #f97316;">
                                <i class="fas fa-exclamation-triangle"></i> Mark as Partial
                            </button>
                        </div>
                    `;
                    break;
                case 'add-checklist-task':
                    const shiftForTask = data?.shift || 'opening';
                    const isMidshift = shiftForTask === 'midshift';
                    const shiftTitle = shiftForTask === 'midshift' ? 'Daily Goal' : shiftForTask.charAt(0).toUpperCase() + shiftForTask.slice(1);
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas ${shiftForTask === 'opening' ? 'fa-sun' : shiftForTask === 'midshift' ? 'fa-cloud-sun' : 'fa-moon'}" style="margin-right: 8px; color: ${shiftForTask === 'opening' ? '#f59e0b' : shiftForTask === 'midshift' ? '#f59e0b' : '#8b5cf6'};"></i>Add ${shiftTitle} Task</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Task Description *</label>
                                <input type="text" class="form-input" id="checklist-task-description" placeholder="${isMidshift ? 'e.g., Count wraps and report low stock...' : 'e.g., Check inventory levels...'}">
                            </div>
                            <input type="hidden" id="checklist-task-shift" value="${shiftForTask}">

                            ${isMidshift ? (() => {
                                // Calculate dates for each day of the current week
                                const today = new Date();
                                const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
                                const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
                                const monday = new Date(today);
                                monday.setDate(today.getDate() + mondayOffset);

                                const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => {
                                    const date = new Date(monday);
                                    date.setDate(monday.getDate() + idx);
                                    return {
                                        name: day,
                                        short: day.substring(0, 3),
                                        date: date.getDate(),
                                        month: date.toLocaleDateString('en-US', { month: 'short' }),
                                        isToday: date.toDateString() === today.toDateString()
                                    };
                                });

                                // Find today's index to pre-select it
                                const todayIdx = weekDays.findIndex(d => d.isToday);
                                const defaultIdx = todayIdx >= 0 ? todayIdx : 0;

                                return `
                                <div class="form-group" style="margin-top: 16px;">
                                    <label>Day of Week *</label>
                                    <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">This goal will only appear on the selected day</p>
                                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 8px;">
                                        ${weekDays.map((day, idx) => `
                                            <label style="cursor: pointer;">
                                                <input type="radio" name="midshift-day" value="${day.name.toLowerCase()}" ${idx === defaultIdx ? 'checked' : ''} style="display: none;">
                                                <div class="day-option" style="padding: 12px 8px; border: 2px solid ${idx === defaultIdx ? '#f59e0b' : 'var(--border-color)'}; border-radius: 10px; background: ${idx === defaultIdx ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)'}; text-align: center; transition: all 0.2s; color: ${idx === defaultIdx ? '#f59e0b' : 'var(--text-primary)'};">
                                                    <div style="font-size: 11px; font-weight: 600;">${day.short}</div>
                                                    <div style="font-size: 14px; font-weight: 700;">${day.date}</div>
                                                    <div style="font-size: 9px; color: ${idx === defaultIdx ? '#f59e0b' : 'var(--text-muted)'};">${day.month}</div>
                                                </div>
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>
                            `;
                            })() : `
                                <div class="form-group" style="margin-top: 16px;">
                                    <label>Task Duration *</label>
                                    <div style="display: flex; gap: 12px; margin-top: 8px;">
                                        <label style="flex: 1; cursor: pointer;">
                                            <input type="radio" name="checklist-task-duration" value="permanent" checked style="display: none;">
                                            <div class="duration-option" style="padding: 16px; border: 2px solid var(--accent-primary); border-radius: 12px; background: var(--bg-secondary); text-align: center; transition: all 0.2s;">
                                                <i class="fas fa-infinity" style="font-size: 24px; color: var(--accent-primary); margin-bottom: 8px; display: block;"></i>
                                                <div style="font-weight: 600; margin-bottom: 4px;">Permanent</div>
                                                <div style="font-size: 11px; color: var(--text-muted);">Shows every day</div>
                                            </div>
                                        </label>
                                        <label style="flex: 1; cursor: pointer;">
                                            <input type="radio" name="checklist-task-duration" value="one-time" style="display: none;">
                                            <div class="duration-option" style="padding: 16px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); text-align: center; transition: all 0.2s;">
                                                <i class="fas fa-calendar-day" style="font-size: 24px; color: var(--text-muted); margin-bottom: 8px; display: block;"></i>
                                                <div style="font-weight: 600; margin-bottom: 4px;">Just Today</div>
                                                <div style="font-size: 11px; color: var(--text-muted);">One time only</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            `}
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="addChecklistTaskFromModal()">
                                <i class="fas fa-plus"></i> Add Task
                            </button>
                        </div>
                    `;

                    // Add event listeners after modal renders
                    setTimeout(() => {
                        // Duration option listeners (for opening/closing)
                        document.querySelectorAll('input[name="checklist-task-duration"]').forEach(radio => {
                            radio.addEventListener('change', function() {
                                document.querySelectorAll('.duration-option').forEach(opt => {
                                    opt.style.borderColor = 'var(--border-color)';
                                    opt.querySelector('i').style.color = 'var(--text-muted)';
                                });
                                const selected = this.closest('label').querySelector('.duration-option');
                                selected.style.borderColor = 'var(--accent-primary)';
                                selected.querySelector('i').style.color = 'var(--accent-primary)';
                            });
                        });
                        // Day option listeners (for midshift/daily goals)
                        document.querySelectorAll('input[name="midshift-day"]').forEach(radio => {
                            radio.addEventListener('change', function() {
                                document.querySelectorAll('.day-option').forEach(opt => {
                                    opt.style.borderColor = 'var(--border-color)';
                                    opt.style.background = 'var(--bg-secondary)';
                                    opt.style.color = 'var(--text-primary)';
                                });
                                const selected = this.closest('label').querySelector('.day-option');
                                selected.style.borderColor = '#f59e0b';
                                selected.style.background = 'rgba(245, 158, 11, 0.1)';
                                selected.style.color = '#f59e0b';
                            });
                        });
                    }, 100);
                    break;
                case 'edit-checklist-task':
                    const taskToEdit = data?.task;
                    if (!taskToEdit) {
                        content = `<div class="modal-header"><h2>Error</h2></div><div class="modal-body"><p>Task not found</p></div>`;
                        break;
                    }
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-pen" style="margin-right: 8px; color: var(--accent-primary);"></i>Edit Task</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="edit-checklist-task-id" value="${taskToEdit.id}">
                            <div class="form-group">
                                <label>Task Description *</label>
                                <input type="text" class="form-input" id="edit-checklist-task-description" value="${taskToEdit.task.replace(/"/g, '&quot;')}" placeholder="e.g., Check inventory levels...">
                            </div>

                            <div class="form-group" style="margin-top: 16px;">
                                <label>Shift *</label>
                                <div style="display: flex; gap: 12px; margin-top: 8px;">
                                    <label style="flex: 1; cursor: pointer;">
                                        <input type="radio" name="edit-checklist-shift" value="opening" ${taskToEdit.shift === 'opening' ? 'checked' : ''} style="display: none;">
                                        <div class="shift-option" style="padding: 16px; border: 2px solid ${taskToEdit.shift === 'opening' ? '#f59e0b' : 'var(--border-color)'}; border-radius: 12px; background: var(--bg-secondary); text-align: center; transition: all 0.2s;">
                                            <i class="fas fa-sun" style="font-size: 24px; color: ${taskToEdit.shift === 'opening' ? '#f59e0b' : 'var(--text-muted)'}; margin-bottom: 8px; display: block;"></i>
                                            <div style="font-weight: 600; margin-bottom: 4px;">Opening</div>
                                            <div style="font-size: 11px; color: var(--text-muted);">Morning shift</div>
                                        </div>
                                    </label>
                                    <label style="flex: 1; cursor: pointer;">
                                        <input type="radio" name="edit-checklist-shift" value="closing" ${taskToEdit.shift === 'closing' ? 'checked' : ''} style="display: none;">
                                        <div class="shift-option" style="padding: 16px; border: 2px solid ${taskToEdit.shift === 'closing' ? '#8b5cf6' : 'var(--border-color)'}; border-radius: 12px; background: var(--bg-secondary); text-align: center; transition: all 0.2s;">
                                            <i class="fas fa-moon" style="font-size: 24px; color: ${taskToEdit.shift === 'closing' ? '#8b5cf6' : 'var(--text-muted)'}; margin-bottom: 8px; display: block;"></i>
                                            <div style="font-weight: 600; margin-bottom: 4px;">Closing</div>
                                            <div style="font-size: 11px; color: var(--text-muted);">Evening shift</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveEditedChecklistTask()">
                                <i class="fas fa-save"></i> Save Changes
                            </button>
                        </div>
                    `;

                    // Add event listeners for shift selection after modal renders
                    setTimeout(() => {
                        document.querySelectorAll('input[name="edit-checklist-shift"]').forEach(radio => {
                            radio.addEventListener('change', function() {
                                document.querySelectorAll('.shift-option').forEach(opt => {
                                    opt.style.borderColor = 'var(--border-color)';
                                    opt.querySelector('i').style.color = 'var(--text-muted)';
                                });
                                const selected = this.closest('label').querySelector('.shift-option');
                                const color = this.value === 'opening' ? '#f59e0b' : '#8b5cf6';
                                selected.style.borderColor = color;
                                selected.querySelector('i').style.color = color;
                            });
                        });

                        // Also set hidden shift field
                        const shiftInput = document.getElementById('edit-checklist-task-shift');
                        if (!shiftInput) {
                            const hiddenShift = document.createElement('input');
                            hiddenShift.type = 'hidden';
                            hiddenShift.id = 'edit-checklist-task-shift';
                            hiddenShift.value = taskToEdit.shift;
                            document.querySelector('.modal-body').appendChild(hiddenShift);
                        }

                        document.querySelectorAll('input[name="edit-checklist-shift"]').forEach(radio => {
                            radio.addEventListener('change', function() {
                                document.getElementById('edit-checklist-task-shift').value = this.value;
                            });
                        });
                    }, 100);
                    break;
                case 'add-training':
                    content = `
                        <div class="modal-header">
                            <h2>Add Training Material</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Title *</label>
                                <input type="text" class="form-input" id="training-title" placeholder="Training name...">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Type *</label>
                                    <select class="form-input" id="training-type" onchange="toggleTrainingTypeFields()">
                                        <option value="video">Video (YouTube/Vimeo)</option>
                                        <option value="document">Document (PDF)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group" id="training-url-group">
                                <label>Video URL *</label>
                                <input type="url" class="form-input" id="training-url" placeholder="https://youtube.com/watch?v=...">
                                <small style="color: var(--text-muted); font-size: 12px; margin-top: 4px; display: block;">Supports YouTube and Vimeo links</small>
                            </div>
                            <div class="form-group" id="training-file-group" style="display: none;">
                                <label>PDF File *</label>
                                <div class="file-upload" id="training-file-upload" onclick="document.getElementById('training-file').click()">
                                    <input type="file" id="training-file" accept=".pdf" style="display: none;" onchange="handleTrainingFileSelect(this)">
                                    <div class="file-upload-content" id="training-file-content">
                                        <i class="fas fa-cloud-upload-alt" style="font-size: 32px; color: var(--accent-primary); margin-bottom: 8px;"></i>
                                        <span style="color: var(--text-secondary);">Click to upload or drag and drop</span>
                                        <span style="color: var(--text-muted); font-size: 12px;">PDF files only (max 50MB)</span>
                                    </div>
                                </div>
                                <div id="training-upload-progress" style="display: none; margin-top: 12px;">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div class="progress-bar" style="flex: 1; height: 8px;">
                                            <div class="progress-fill" id="training-progress-fill" style="width: 0%;"></div>
                                        </div>
                                        <span id="training-progress-text" style="font-size: 12px; color: var(--text-muted);">0%</span>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea class="form-input" id="training-description" rows="3" placeholder="Brief description of the training content..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" id="save-training-btn" onclick="saveTraining()">
                                <span id="save-training-text">Add Training</span>
                                <i class="fas fa-spinner fa-spin" id="save-training-spinner" style="display: none;"></i>
                            </button>
                        </div>
                    `;
                    break;
                case 'add-license':
                    content = `
                        <div class="modal-header">
                            <h2>Add License / Document</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Document Name *</label>
                                <input type="text" class="form-input" id="license-name" placeholder="Business License">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Store *</label>
                                    <select class="form-input" id="license-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar">VSU Miramar</option>
                                        <option value="Morena">VSU Morena</option>
                                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                        <option value="Chula Vista">VSU Chula Vista</option>
                                        <option value="North Park">VSU North Park</option>
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Expiration Date *</label>
                                    <input type="date" class="form-input" id="license-expires">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Upload PDF</label>
                                <div class="file-upload">
                                    <input type="file" id="license-file" accept=".pdf">
                                    <div class="file-upload-content">
                                        <i class="fas fa-cloud-upload-alt"></i>
                                        <span>Click to upload or drag and drop</span>
                                        <small>PDF files only (optional)</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveLicense()">Upload License</button>
                        </div>
                    `;
                    break;
                case 'add-announcement':
                    content = `
                        <div class="modal-header">
                            <h2>New Announcement</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Title *</label>
                                <input type="text" class="form-input" id="announcement-title" placeholder="Announcement title...">
                            </div>
                            <div class="form-group">
                                <label>Message *</label>
                                <textarea class="form-input" id="announcement-content" rows="5" placeholder="Write your announcement..."></textarea>
                            </div>
                            <div class="form-group">
                                <label>Target Stores</label>
                                <select class="form-input" id="announcement-stores">
                                    <option value="all">All Stores</option>
                                    <option value="Miramar">VSU Miramar</option>
                                    <option value="Morena">VSU Morena</option>
                                    <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                    <option value="Chula Vista">VSU Chula Vista</option>
                                    <option value="North Park">VSU North Park</option>
                                    <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveAnnouncement()">Post Announcement</button>
                        </div>
                    `;
                    break;
                case 'add-product':
                    content = `
                        <div class="modal-header">
                            <h2>Add New Product</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Product Name *</label>
                                    <input type="text" class="form-input" id="new-product-name" placeholder="Enter product name...">
                                </div>
                                <div class="form-group">
                                    <label>Category</label>
                                    <select class="form-input" id="new-product-category">
                                        <option value="">Select category...</option>
                                        <option value="Vape Devices">Vape Devices</option>
                                        <option value="Vape Pods">Vape Pods</option>
                                        <option value="Disposables">Disposables</option>
                                        <option value="Cigarettes">Cigarettes</option>
                                        <option value="Accessories">Accessories</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Estimated Price</label>
                                    <input type="number" step="0.01" class="form-input" id="new-product-price" placeholder="0.00">
                                </div>
                                <div class="form-group">
                                    <label>Estimated Arrival</label>
                                    <input type="date" class="form-input" id="new-product-arrival">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Estimated Deals</label>
                                    <input type="text" class="form-input" id="new-product-deals" placeholder="e.g., 2x1, 20% off, Buy 3 get 1 free...">
                                </div>
                                <div class="form-group">
                                    <label>Product URL</label>
                                    <input type="url" class="form-input" id="new-product-url" placeholder="https://example.com/product">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Supplier</label>
                                <input type="text" class="form-input" id="new-product-supplier" placeholder="Enter supplier name...">
                            </div>
                            <div class="form-group">
                                <label>Product Image (optional)</label>
                                <div style="border: 2px dashed var(--border-color); border-radius: 8px; padding: 16px; text-align: center; background: var(--bg-hover);">
                                    <input type="file" class="form-input" id="new-product-image" accept="image/*" onchange="previewProductImage(this)" style="display: none;">
                                    <div id="product-image-preview" style="display: none; margin-bottom: 12px;">
                                        <img id="product-image-img" style="max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: cover;">
                                    </div>
                                    <button type="button" class="btn-secondary" onclick="document.getElementById('new-product-image').click()" style="margin: 0;">
                                        <i class="fas fa-image"></i> Choose Photo
                                    </button>
                                    <p style="margin: 8px 0 0 0; color: var(--text-muted); font-size: 12px;">Optional - Click to select an image</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" id="save-product-btn" onclick="saveProduct()">
                                <i class="fas fa-plus"></i> Add Product
                            </button>
                        </div>
                    `;
                    break;
                case 'add-thief':
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-user-secret"></i> Add Theft Record</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Name *</label>
                                    <input type="text" class="form-input" id="thief-name" placeholder="Enter name or description...">
                                </div>
                                <div class="form-group">
                                    <label>Date of Incident *</label>
                                    <input type="date" class="form-input" id="thief-date" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Store *</label>
                                    <select class="form-input" id="thief-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar">VSU Miramar</option>
                                        <option value="Morena">VSU Morena</option>
                                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                        <option value="Chula Vista">VSU Chula Vista</option>
                                        <option value="North Park">VSU North Park</option>
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Incident *</label>
                                    <select class="form-input" id="thief-crime-type">
                                        <option value="">Select type...</option>
                                        <option value="Shoplifting">Shoplifting</option>
                                        <option value="Attempted Theft">Attempted Theft</option>
                                        <option value="Robbery">Robbery</option>
                                        <option value="Fraud">Fraud</option>
                                        <option value="Disrespect/Harassment">Disrespect/Harassment</option>
                                        <option value="Refusal">Refusal</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Items Stolen *</label>
                                    <input type="text" class="form-input" id="thief-items" placeholder="e.g., Vape devices (2x)">
                                </div>
                                <div class="form-group">
                                    <label>Estimated Value ($) *</label>
                                    <input type="number" step="0.01" class="form-input" id="thief-value" placeholder="0.00">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Description *</label>
                                <textarea class="form-input" id="thief-description" rows="3" placeholder="Describe the incident in detail..."></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Police Report #</label>
                                    <input type="text" class="form-input" id="thief-police-report" placeholder="e.g., PR-2025-12-10-001">
                                </div>
                                <div class="form-group">
                                    <label>Status *</label>
                                    <select class="form-input" id="thief-status">
                                        <option value="banned">Banned</option>
                                        <option value="warning">Warning</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Photo (Optional)</label>
                                <input type="file" class="form-input" id="thief-photo" accept="image/*" onchange="previewThiefPhoto(this)">
                                <div id="thief-photo-preview" style="margin-top: 10px; display: none;">
                                    <img id="thief-photo-img" style="max-width: 200px; max-height: 200px; border-radius: 8px; object-fit: cover;">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveThief()">
                                <i class="fas fa-plus"></i> Add Record
                            </button>
                        </div>
                    `;
                    break;
                case 'edit-thief':
                    if (!data) {
                        alert('No thief data provided');
                        return;
                    }
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-user-secret"></i> Edit Theft Record</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Name</label>
                                    <input type="text" class="form-input" id="edit-thief-name" value="${data.name || ''}" placeholder="Enter name or description...">
                                </div>
                                <div class="form-group">
                                    <label>Date of Incident</label>
                                    <input type="date" class="form-input" id="edit-thief-date" value="${data.date || ''}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Store</label>
                                    <select class="form-input" id="edit-thief-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar" ${data.store === 'Miramar' ? 'selected' : ''}>VSU Miramar</option>
                                        <option value="Morena" ${data.store === 'Morena' ? 'selected' : ''}>VSU Morena</option>
                                        <option value="Kearny Mesa" ${data.store === 'Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                                        <option value="Chula Vista" ${data.store === 'Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                                        <option value="North Park" ${data.store === 'North Park' ? 'selected' : ''}>VSU North Park</option>
                                        <option value="Miramar Wine & Liquor" ${data.store === 'Miramar Wine & Liquor' ? 'selected' : ''}>Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Incident</label>
                                    <select class="form-input" id="edit-thief-crime-type">
                                        <option value="">Select type...</option>
                                        <option value="Shoplifting" ${data.crimeType === 'Shoplifting' ? 'selected' : ''}>Shoplifting</option>
                                        <option value="Attempted Theft" ${data.crimeType === 'Attempted Theft' ? 'selected' : ''}>Attempted Theft</option>
                                        <option value="Robbery" ${data.crimeType === 'Robbery' ? 'selected' : ''}>Robbery</option>
                                        <option value="Fraud" ${data.crimeType === 'Fraud' ? 'selected' : ''}>Fraud</option>
                                        <option value="Disrespect/Harassment" ${data.crimeType === 'Disrespect/Harassment' ? 'selected' : ''}>Disrespect/Harassment</option>
                                        <option value="Refusal" ${data.crimeType === 'Refusal' ? 'selected' : ''}>Refusal</option>
                                        <option value="Other" ${data.crimeType === 'Other' ? 'selected' : ''}>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Items Stolen</label>
                                    <input type="text" class="form-input" id="edit-thief-items" value="${data.itemsStolen || ''}" placeholder="e.g., Vape devices (2x)">
                                </div>
                                <div class="form-group">
                                    <label>Estimated Value ($)</label>
                                    <input type="number" step="0.01" class="form-input" id="edit-thief-value" value="${data.estimatedValue || ''}" placeholder="0.00">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea class="form-input" id="edit-thief-description" rows="3" placeholder="Describe the incident in detail...">${data.description || ''}</textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Police Report #</label>
                                    <input type="text" class="form-input" id="edit-thief-police-report" value="${data.policeReport || ''}" placeholder="e.g., PR-2025-12-10-001">
                                </div>
                                <div class="form-group">
                                    <label>Status</label>
                                    <select class="form-input" id="edit-thief-status">
                                        <option value="banned" ${data.banned ? 'selected' : ''}>Banned</option>
                                        <option value="warning" ${!data.banned ? 'selected' : ''}>Warning</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Photo (leave empty to keep current)</label>
                                <input type="file" class="form-input" id="edit-thief-photo" accept="image/*" onchange="previewEditThiefPhoto(this)">
                                <div id="edit-thief-photo-preview" style="margin-top: 10px; ${data.photo ? '' : 'display: none;'}">
                                    <img id="edit-thief-photo-img" src="${data.photo || ''}" style="max-width: 200px; max-height: 200px; border-radius: 8px; object-fit: cover;">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveEditedThief()">
                                <i class="fas fa-save"></i> Save Changes
                            </button>
                        </div>
                    `;
                    break;
                case 'add-invoice':
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-file-invoice-dollar"></i> Add Invoice</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Invoice Number</label>
                                    <input type="text" class="form-input" id="invoice-number" placeholder="e.g., INV-2025-004">
                                </div>
                                <div class="form-group">
                                    <label>Vendor</label>
                                    <input type="text" class="form-input" id="invoice-vendor" placeholder="Enter vendor name...">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Product</label>
                                <input type="text" class="form-input" id="invoice-product" placeholder="Enter product name...">
                            </div>
                            <div class="form-group">
                                <label>Categories <span style="font-weight: 400; color: var(--text-muted); font-size: 12px;">(select one or more)</span></label>
                                ${renderInvoiceCategoryCheckboxes([], 'invoice-categories-container')}
                            </div>
                            <div class="form-group">
                                <label>Store</label>
                                <select class="form-input" id="invoice-store" onchange="toggleMultipleLocations(this)">
                                    <option value="">Unassigned</option>
                                    <option value="All Locations">All Locations</option>
                                    <option value="Miramar">VSU Miramar</option>
                                    <option value="Morena">VSU Morena</option>
                                    <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                    <option value="Chula Vista">VSU Chula Vista</option>
                                    <option value="North Park">VSU North Park</option>
                                    <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    <option value="Multiple">Multiple Locations...</option>
                                </select>
                                <div id="invoice-stores-checkboxes" style="display: none; margin-top: 8px; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                                    <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Select locations:</p>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
                                            <input type="checkbox" class="invoice-store-checkbox" value="Miramar"> VSU Miramar
                                        </label>
                                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
                                            <input type="checkbox" class="invoice-store-checkbox" value="Morena"> VSU Morena
                                        </label>
                                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
                                            <input type="checkbox" class="invoice-store-checkbox" value="Kearny Mesa"> VSU Kearny Mesa
                                        </label>
                                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
                                            <input type="checkbox" class="invoice-store-checkbox" value="Chula Vista"> VSU Chula Vista
                                        </label>
                                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
                                            <input type="checkbox" class="invoice-store-checkbox" value="North Park"> VSU North Park
                                        </label>
                                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
                                            <input type="checkbox" class="invoice-store-checkbox" value="Miramar Wine & Liquor"> MW&L
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Amount ($)</label>
                                    <input type="number" step="0.01" class="form-input" id="invoice-amount" placeholder="0.00">
                                </div>
                                <div class="form-group">
                                    <label>Invoice Date</label>
                                    <input type="date" class="form-input" id="invoice-date">
                                </div>
                                <div class="form-group">
                                    <label>Due Date</label>
                                    <input type="date" class="form-input" id="invoice-due-date">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <input type="text" class="form-input" id="invoice-description" placeholder="Enter description...">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Status</label>
                                    <select class="form-input" id="invoice-status">
                                        <option value="pending">Pending</option>
                                        <option value="partial">Partial</option>
                                        <option value="paid">Paid</option>
                                        <option value="overdue">Overdue</option>
                                        <option value="filed">Filed</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Payment Account</label>
                                    <select class="form-input" id="invoice-payment-account">
                                        <option value="">Select account...</option>
                                        <option value="Shop App">Shop App</option>
                                        <option value="Personal Account">Personal Account</option>
                                        <option value="Business Account">Business Account</option>
                                        <option value="Zelle">Zelle</option>
                                        <option value="PayPal">PayPal</option>
                                        <option value="Credit Card">Credit Card</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Check">Check</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label style="display: flex; align-items: center; gap: 8px;">
                                    <input type="checkbox" id="invoice-recurring" style="width: 18px; height: 18px; accent-color: var(--accent-primary);">
                                    <span>Recurring Invoice</span>
                                </label>
                            </div>
                            <div class="form-group">
                                <label>Invoice File (Photo or PDF)</label>
                                <div style="border: 2px dashed var(--border-color); border-radius: 8px; padding: 16px; text-align: center; background: var(--bg-hover);">
                                    <input type="file" class="form-input" id="invoice-photo" accept="image/*,.pdf,application/pdf" onchange="previewInvoiceFile(this)" style="display: none;">
                                    <div id="invoice-photo-preview" style="display: none; margin-bottom: 12px;">
                                        <img id="invoice-photo-img" style="max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: cover;">
                                    </div>
                                    <div id="invoice-pdf-preview" style="display: none; margin-bottom: 12px;">
                                        <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 8px; display: flex; align-items: center; gap: 12px;">
                                            <i class="fas fa-file-pdf" style="font-size: 32px; color: #ef4444;"></i>
                                            <div style="text-align: left;">
                                                <div id="invoice-pdf-name" style="font-weight: 600;"></div>
                                                <div id="invoice-pdf-size" style="font-size: 12px; color: var(--text-muted);"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                                        <button type="button" class="btn-secondary" onclick="document.getElementById('invoice-photo').click()" style="margin: 0;">
                                            <i class="fas fa-upload"></i> Upload File
                                        </button>
                                        <input type="file" id="invoice-camera" accept="image/*" capture="environment" style="display: none;" onchange="handleInvoiceCameraCapture(this)">
                                        <button type="button" class="btn-secondary" onclick="document.getElementById('invoice-camera').click()" style="margin: 0; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none;">
                                            <i class="fas fa-camera"></i> Take Photo
                                        </button>
                                        <button type="button" id="ai-scan-btn" class="btn-secondary" onclick="scanInvoiceWithAI()" style="margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none;">
                                            <i class="fas fa-magic"></i> Scan with AI
                                        </button>
                                    </div>
                                    <p style="margin: 8px 0 0 0; color: var(--text-muted); font-size: 12px;">Take a photo or upload a file, then click "Scan with AI" to auto-fill</p>
                                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border-color);">
                                        <button type="button" onclick="closeModal(); openBulkInvoiceUpload();" style="width: 100%; padding: 12px; border-radius: 8px; border: 2px dashed #8b5cf6; background: rgba(139, 92, 246, 0.1); color: #8b5cf6; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                            <i class="fas fa-layer-group"></i> Bulk Upload Multiple Invoices
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Notes</label>
                                <textarea class="form-input" id="invoice-notes" rows="2" placeholder="Add any additional notes..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Close</button>
                            <button class="btn-primary" onclick="saveInvoice()">
                                <i class="fas fa-plus"></i> Add Invoice
                            </button>
                        </div>
                    `;
                    break;
                case 'restock-request':
                    const itemId = modal.dataset.itemId;
                    const item = inventory.find(i => i.id == itemId);
                    content = `
                        <div class="modal-header">
                            <h2>New Restock Request</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Item *</label>
                                <input type="text" class="form-input" id="restock-item" value="${item.brand} ${item.productName} - ${item.flavor}" readonly style="background: var(--bg-hover);">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date *</label>
                                    <input type="date" class="form-input" id="restock-date" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div class="form-group">
                                    <label>Store *</label>
                                    <select class="form-input" id="restock-modal-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar">VSU Miramar</option>
                                        <option value="Morena">VSU Morena</option>
                                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                        <option value="Chula Vista">VSU Chula Vista</option>
                                        <option value="North Park">VSU North Park</option>
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Qty on Hand *</label>
                                    <input type="number" class="form-input" id="restock-qty-hand" placeholder="Current quantity in stock" value="${item.stock}">
                                </div>
                                <div class="form-group">
                                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                        <input type="checkbox" id="customer-request" style="width: 18px; height: 18px; accent-color: var(--accent-primary);">
                                        <span>Customer Request</span>
                                    </label>
                                    <input type="text" class="form-input" id="customer-info" placeholder="Customer name or info..." disabled style="background: var(--bg-hover);">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Notes (Optional)</label>
                                <textarea class="form-input" id="restock-modal-notes" rows="3" placeholder="Add any additional notes..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="submitRestockFromModal('${itemId}')">Request</button>
                        </div>
                    `;
                    break;
                case 'new-restock-request':
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-box"></i> New Inventory Item</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group" style="position: relative;">
                                <label>Item Name *</label>
                                <input type="text" class="form-input" id="new-restock-product" placeholder="Start typing to see suggestions..." autocomplete="off" oninput="showProductSuggestions(this.value, 'new-restock-suggestions')">
                                <div id="new-restock-suggestions" class="product-suggestions-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 1000; box-shadow: 0 8px 24px rgba(0,0,0,0.2);"></div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Specifics</label>
                                    <input type="text" class="form-input" id="new-restock-specifics" placeholder="e.g., 375ml, fgh, z.02...">
                                </div>
                                <div class="form-group">
                                    <label>Store *</label>
                                    <select class="form-input" id="new-restock-store">
                                        <option value="">Select store...</option>
                                        <option value="Loyal Vaper">Loyal Vaper</option>
                                        <option value="MMWL">MMWL</option>
                                        <option value="CV">CV</option>
                                        <option value="NP">NP</option>
                                        <option value="KM">KM</option>
                                        <option value="MB">MB</option>
                                        <option value="MM">MM</option>
                                        <option value="All Shops">All Shops</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Category *</label>
                                    <select class="form-input" id="new-restock-category">
                                        <option value="">Select category...</option>
                                        <option value="Detox">Detox</option>
                                        <option value="Coils/Pods">Coils/Pods</option>
                                        <option value="Wraps">Wraps</option>
                                        <option value="Disposables">Disposables</option>
                                        <option value="Juices">Juices</option>
                                        <option value="Heady">Heady</option>
                                        <option value="Glass">Glass</option>
                                        <option value="Smoke Shop">Smoke Shop</option>
                                        <option value="Vape Shop">Vape Shop</option>
                                        <option value="Liquor">Liquor</option>
                                        <option value="Cleaning Supplies">Cleaning Supplies</option>
                                        <option value="Office Supplies">Office Supplies</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Urgency</label>
                                    <select class="form-input" id="new-restock-urgency">
                                        <option value="Low">Low</option>
                                        <option value="High Priority">High Priority</option>
                                        <option value="Sold Out">Sold Out</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Order Status</label>
                                    <select class="form-input" id="new-restock-order-status">
                                        <option value="Not Ordered" selected>Not Ordered</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Ordered">Ordered</option>
                                        <option value="Received">Received</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Added By</label>
                                    <select class="form-input" id="new-restock-requested-by">
                                        <option value="">Select employee...</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Notes (Optional)</label>
                                <textarea class="form-input" id="new-restock-notes" rows="2" placeholder="Any additional details..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="submitNewRestockRequest()">Add Item</button>
                        </div>
                    `;
                    break;
                case 'edit-restock-request':
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-edit"></i> Edit Request</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group" style="position: relative;">
                                <label>Product Name *</label>
                                <input type="text" class="form-input" id="edit-restock-product" placeholder="Start typing to see suggestions..." autocomplete="off" oninput="showProductSuggestions(this.value, 'edit-restock-suggestions')">
                                <div id="edit-restock-suggestions" class="product-suggestions-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 1000; box-shadow: 0 8px 24px rgba(0,0,0,0.2);"></div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Quantity *</label>
                                    <input type="number" class="form-input" id="edit-restock-quantity" placeholder="0" min="1">
                                </div>
                                <div class="form-group">
                                    <label>Priority</label>
                                    <select class="form-input" id="edit-restock-priority">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="must_haves">Must Haves</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Category *</label>
                                    <select class="form-input" id="edit-restock-category" onchange="toggleCustomCategory('edit-restock')">
                                        <option value="">Select category...</option>
                                        <option value="Disposables">Disposables</option>
                                        <option value="Vape Liquids">Vape Liquids</option>
                                        <option value="Coils & Pod">Coils & Pod</option>
                                        <option value="Smokeshop">Smokeshop</option>
                                        <option value="Rolling Papers">Rolling Papers</option>
                                        <option value="Wraps">Wraps</option>
                                        <option value="Chips">Chips</option>
                                        <option value="Other">Other (type your own)</option>
                                    </select>
                                    <input type="text" class="form-input" id="edit-restock-category-custom" placeholder="Type custom category..." style="display: none; margin-top: 8px;">
                                </div>
                                <div class="form-group">
                                    <label>Store *</label>
                                    <select class="form-input" id="edit-restock-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar">VSU Miramar</option>
                                        <option value="Morena">VSU Morena</option>
                                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                        <option value="Chula Vista">VSU Chula Vista</option>
                                        <option value="North Park">VSU North Park</option>
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                        <option value="Loyal Vaper">Loyal Vaper</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Requested By</label>
                                    <select class="form-input" id="edit-restock-requested-by">
                                        <option value="">Select employee...</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Notes (Optional)</label>
                                <textarea class="form-input" id="edit-restock-notes" rows="2" placeholder="Any additional details..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="submitEditRestockRequest()">Save Changes</button>
                        </div>
                    `;
                    break;
                case 'create-cashout':
                    // Initialize voice assistant for cashout form
                    setTimeout(() => {
                        VoiceAssistant.init('cashout', {
                            title: 'AI Voice Assistant',
                            subtitle: 'Speak to auto-fill the expense form',
                            buttonColor: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            listeningText: 'Listening... Describe the expense',
                            systemPrompt: 'You are an assistant helping to document cash out expenses at a retail store. Extract structured information from voice transcripts about expenses and cash withdrawals.',
                            prompt: `Analyze this voice transcript about an expense/cash out and extract the information. Return ONLY a JSON object with these fields (use null for any field you cannot determine):

Transcript: "{transcript}"

{
    "description": "clear description of the expense (e.g., Office Supplies from Staples, Bank Deposit, Cleaning Supplies)",
    "amount": "the amount as a number (no currency symbols)",
    "store": "one of: Miramar, Morena, Kearny Mesa, Chula Vista, North Park, Miramar Wine & Liquor (if mentioned)",
    "notes": "any additional relevant details"
}

Return ONLY the JSON object, no additional text.`,
                            onFill: (data) => {
                                if (data.description) document.getElementById('cashout-name').value = data.description;
                                else if (data._transcript) document.getElementById('cashout-name').value = data._transcript;
                                if (data.amount) {
                                    const amt = parseFloat(data.amount.toString().replace(/[^0-9.]/g, ''));
                                    if (!isNaN(amt)) document.getElementById('cashout-amount').value = amt.toFixed(2);
                                }
                                if (data.store) {
                                    const storeSelect = document.getElementById('cashout-store');
                                    for (let opt of storeSelect.options) {
                                        if (opt.value.toLowerCase().includes(data.store.toLowerCase()) || data.store.toLowerCase().includes(opt.value.toLowerCase())) {
                                            storeSelect.value = opt.value; break;
                                        }
                                    }
                                }
                                if (data.notes) document.getElementById('cashout-reason').value = data.notes;
                            }
                        });
                    }, 100);

                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-money-bill-wave"></i> Add Cash Out</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <!-- AI Tools Section -->
                            <div style="margin-bottom: 20px; padding: 16px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px;">
                                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                            <i class="fas fa-wand-magic-sparkles" style="color: white; font-size: 14px;"></i>
                                        </div>
                                        <div>
                                            <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">AI Assistant</div>
                                            <div style="font-size: 12px; color: var(--text-muted);">Scan receipt or speak to auto-fill</div>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                        <input type="file" id="cashout-ai-photo" accept="image/*" style="display: none;" onchange="scanCashOutWithAI()">
                                        <button type="button" id="cashout-ai-scan-btn" onclick="document.getElementById('cashout-ai-photo').click()" style="padding: 10px 16px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border: none; color: white; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(139,92,246,0.4)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
                                            <i class="fas fa-camera"></i> Scan
                                        </button>
                                        <button type="button" id="va-btn-cashout" onclick="VoiceAssistant.toggle('cashout')" style="padding: 10px 16px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border: none; color: white; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(139,92,246,0.4)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
                                            <i class="fas fa-microphone" id="va-icon-cashout"></i> <span id="va-text-cashout">Voice</span>
                                        </button>
                                    </div>
                                </div>
                                <div id="va-status-cashout" style="display: none; margin-top: 12px; padding: 10px; background: var(--bg-secondary); border-radius: 8px; font-size: 13px;"></div>
                                <div id="va-transcript-cashout" style="display: none; margin-top: 12px; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px;">
                                    <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">What you said:</div>
                                    <div id="va-transcript-text-cashout" style="font-size: 13px; color: var(--text-primary); line-height: 1.5;"></div>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group" style="flex: 2;">
                                    <label>Description *</label>
                                    <input type="text" class="form-input" id="cashout-name" placeholder="e.g., Office Supplies, Bank Deposit... or use voice!">
                                </div>
                                <div class="form-group">
                                    <label>Amount *</label>
                                    <input type="number" step="0.01" class="form-input" id="cashout-amount" placeholder="0.00">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Store *</label>
                                    <select class="form-input" id="cashout-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar">VSU Miramar</option>
                                        <option value="Morena">VSU Morena</option>
                                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                        <option value="Chula Vista">VSU Chula Vista</option>
                                        <option value="North Park">VSU North Park</option>
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Source *</label>
                                    <div style="display: flex; gap: 10px;">
                                        <label style="flex: 1; display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: var(--bg-secondary); border: 2px solid var(--border-color); border-radius: 10px; cursor: pointer; transition: all 0.2s;" onclick="selectCashOutSource('register')">
                                            <input type="radio" name="cashout-source" id="cashout-source-register" value="register" checked style="display: none;">
                                            <div id="source-icon-register" style="width: 36px; height: 36px; background: #3b82f620; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                                <i class="fas fa-cash-register" style="color: #3b82f6;"></i>
                                            </div>
                                            <span style="font-weight: 500;">Register</span>
                                        </label>
                                        <label style="flex: 1; display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: var(--bg-secondary); border: 2px solid var(--border-color); border-radius: 10px; cursor: pointer; transition: all 0.2s;" onclick="selectCashOutSource('envelope')">
                                            <input type="radio" name="cashout-source" id="cashout-source-envelope" value="envelope" style="display: none;">
                                            <div id="source-icon-envelope" style="width: 36px; height: 36px; background: var(--bg-hover); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                                <i class="fas fa-envelope" style="color: var(--text-muted);"></i>
                                            </div>
                                            <span style="font-weight: 500;">Envelope</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date</label>
                                    <input type="date" class="form-input" id="cashout-date" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div class="form-group">
                                    <label>Time</label>
                                    <input type="time" class="form-input" id="cashout-time" value="${new Date().toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit'})}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Notes</label>
                                <textarea class="form-input" id="cashout-reason" rows="2" placeholder="Additional notes (optional)..."></textarea>
                            </div>
                            <div class="form-group">
                                <label>Photo/Receipt (optional)</label>
                                <div id="cashout-photo-preview" style="display: none; margin-bottom: 10px; position: relative;">
                                    <img id="cashout-photo-img" style="max-width: 100%; max-height: 200px; border-radius: 10px; border: 1px solid var(--border-color);">
                                    <button type="button" onclick="removeCashOutPhoto()" style="position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border-radius: 50%; background: rgba(239, 68, 68, 0.9); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                                <div style="display: flex; gap: 10px;">
                                    <input type="file" id="cashout-photo" accept="image/*" style="display: none;" onchange="previewCashOutPhoto(this)">
                                    <button type="button" onclick="document.getElementById('cashout-photo').click()" style="flex: 1; padding: 12px; background: var(--bg-secondary); border: 2px dashed var(--border-color); border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--text-secondary); transition: all 0.2s;" onmouseover="this.style.borderColor='var(--accent-primary)'; this.style.color='var(--accent-primary)';" onmouseout="this.style.borderColor='var(--border-color)'; this.style.color='var(--text-secondary)';">
                                        <i class="fas fa-camera"></i> Take Photo
                                    </button>
                                    <button type="button" onclick="document.getElementById('cashout-photo').click()" style="flex: 1; padding: 12px; background: var(--bg-secondary); border: 2px dashed var(--border-color); border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--text-secondary); transition: all 0.2s;" onmouseover="this.style.borderColor='var(--accent-primary)'; this.style.color='var(--accent-primary)';" onmouseout="this.style.borderColor='var(--border-color)'; this.style.color='var(--text-secondary)';">
                                        <i class="fas fa-upload"></i> Upload
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="createCashOut()">
                                <i class="fas fa-save"></i> Save
                            </button>
                        </div>
                    `;
                    break;
                case 'close-cashout':
                    const cashoutId = arguments[1];
                    const cashoutRecord = cashOutRecords.find(r => r.id === cashoutId || r.firestoreId === cashoutId);
                    if (!cashoutRecord) break;

                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-check-circle"></i> Close Cash Out</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="color: var(--text-muted);">Cash Out Name:</span>
                                    <strong>${cashoutRecord.name}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: var(--text-muted);">Amount Given:</span>
                                    <strong style="color: var(--accent-primary); font-size: 18px;">$${cashoutRecord.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Receipt Photo *</label>
                                <div class="file-upload">
                                    <input type="file" id="cashout-receipt-photo" accept="image/*">
                                    <div class="file-upload-content">
                                        <i class="fas fa-camera"></i>
                                        <span>Click to upload receipt photo</span>
                                        <small>JPG, PNG, or GIF</small>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Amount Spent *</label>
                                <input type="number" step="0.01" class="form-input" id="cashout-amount-spent" placeholder="0.00" max="${cashoutRecord.amount}">
                                <small style="color: var(--text-muted); display: block; margin-top: 4px;">
                                    Maximum: $${cashoutRecord.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </small>
                            </div>

                            <div class="form-group">
                                <label>Is there money left? *</label>
                                <div style="display: flex; gap: 24px; margin-top: 8px;">
                                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                        <input type="radio" name="money-left" id="cashout-money-left-yes" value="yes" style="width: 18px; height: 18px; accent-color: var(--accent-primary);">
                                        <span>Yes, there is money left</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                        <input type="radio" name="money-left" id="cashout-money-left-no" value="no" checked style="width: 18px; height: 18px; accent-color: var(--accent-primary);">
                                        <span>No, all money was spent</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="closeCashOut('${cashoutRecord.firestoreId || cashoutRecord.id}')">
                                <i class="fas fa-check"></i>
                                Close Cash Out
                            </button>
                        </div>
                    `;
                    break;
                case 'create-issue':
                    // Initialize voice assistant for issue form
                    setTimeout(() => {
                        VoiceAssistant.init('issue', {
                            title: 'AI Voice Assistant',
                            subtitle: 'Speak to auto-fill the issue form',
                            buttonColor: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                            listeningText: 'Listening... Describe the issue',
                            systemPrompt: 'You are an assistant helping to document customer issues at a retail store. Extract structured information from voice transcripts about customer complaints, returns, or service issues.',
                            prompt: `Analyze this voice transcript about a customer issue and extract the information. Return ONLY a JSON object with these fields (use null for any field you cannot determine):

Transcript: "{transcript}"

{
    "customerName": "the customer's name if mentioned",
    "phone": "phone number if mentioned",
    "issueType": "one of: In Store, Online",
    "store": "one of: Miramar, Morena, Kearny Mesa, Chula Vista, North Park, Miramar Wine & Liquor (if mentioned)",
    "description": "a clear description of the issue",
    "perception": "1-5 where 1=Very Upset, 2=Upset, 3=Neutral, 4=Satisfied, 5=Happy (based on how the customer left)"
}

Return ONLY the JSON object, no additional text.`,
                            onFill: (data) => {
                                if (data.customerName) document.getElementById('issue-customer').value = data.customerName;
                                if (data.phone) document.getElementById('issue-phone').value = data.phone;
                                if (data.issueType) {
                                    const typeSelect = document.getElementById('issue-type');
                                    for (let opt of typeSelect.options) {
                                        if (opt.value.toLowerCase() === data.issueType.toLowerCase()) { typeSelect.value = opt.value; break; }
                                    }
                                }
                                if (data.store) {
                                    const storeSelect = document.getElementById('issue-store');
                                    for (let opt of storeSelect.options) {
                                        if (opt.value.toLowerCase().includes(data.store.toLowerCase()) || data.store.toLowerCase().includes(opt.value.toLowerCase())) {
                                            storeSelect.value = opt.value; break;
                                        }
                                    }
                                }
                                if (data.description) document.getElementById('issue-description').value = data.description;
                                else if (data._transcript) document.getElementById('issue-description').value = data._transcript;
                                if (data.perception) {
                                    const p = parseInt(data.perception);
                                    if (p >= 1 && p <= 5) selectPerception(p);
                                }
                            }
                        });
                    }, 100);

                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-exclamation-triangle"></i> Create Issue</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <!-- AI Voice Assistant Section -->
                            ${VoiceAssistant.getHTML('issue', { title: 'AI Voice Assistant', subtitle: 'Speak to auto-fill the issue form', buttonColor: 'linear-gradient(135deg, #ef4444, #f59e0b)' })}

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Customer Name</label>
                                    <input type="text" class="form-input" id="issue-customer" placeholder="Enter customer name...">
                                </div>
                                <div class="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" class="form-input" id="issue-phone" placeholder="(555) 555-5555" oninput="formatPhoneNumber(this)" maxlength="14">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Order #</label>
                                    <input type="text" class="form-input" id="issue-order-number" placeholder="Enter order number...">
                                </div>
                                <div class="form-group">
                                    <label>Incident Date</label>
                                    <input type="date" class="form-input" id="issue-incident-date" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Issue Type</label>
                                    <select class="form-input" id="issue-type">
                                        <option value="">Select type...</option>
                                        <option value="In Store">In Store</option>
                                        <option value="Online">Online</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Store</label>
                                    <select class="form-input" id="issue-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar">VSU Miramar</option>
                                        <option value="Morena">VSU Morena</option>
                                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                        <option value="Chula Vista">VSU Chula Vista</option>
                                        <option value="North Park">VSU North Park</option>
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Brief Description</label>
                                <textarea class="form-input" id="issue-description" rows="3" placeholder="Describe the issue... or use voice above!"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Customer Response When Leaving</label>
                                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">How did the customer feel when leaving the store?</p>
                                <div id="perception-selector" style="display: flex; justify-content: space-between; gap: 8px;">
                                    <button type="button" class="perception-btn" data-value="1" onclick="selectPerception(1)" style="flex: 1; padding: 16px 8px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); cursor: pointer; transition: all 0.2s;">
                                        <div style="font-size: 28px; margin-bottom: 4px; color: #ef4444;"><i class="fas fa-face-angry"></i></div>
                                        <div style="font-size: 11px; color: var(--text-muted);">Very Upset</div>
                                    </button>
                                    <button type="button" class="perception-btn" data-value="2" onclick="selectPerception(2)" style="flex: 1; padding: 16px 8px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); cursor: pointer; transition: all 0.2s;">
                                        <div style="font-size: 28px; margin-bottom: 4px; color: #f97316;"><i class="fas fa-face-frown"></i></div>
                                        <div style="font-size: 11px; color: var(--text-muted);">Upset</div>
                                    </button>
                                    <button type="button" class="perception-btn" data-value="3" onclick="selectPerception(3)" style="flex: 1; padding: 16px 8px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); cursor: pointer; transition: all 0.2s;">
                                        <div style="font-size: 28px; margin-bottom: 4px; color: #eab308;"><i class="fas fa-face-meh"></i></div>
                                        <div style="font-size: 11px; color: var(--text-muted);">Neutral</div>
                                    </button>
                                    <button type="button" class="perception-btn" data-value="4" onclick="selectPerception(4)" style="flex: 1; padding: 16px 8px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); cursor: pointer; transition: all 0.2s;">
                                        <div style="font-size: 28px; margin-bottom: 4px; color: #22c55e;"><i class="fas fa-face-smile"></i></div>
                                        <div style="font-size: 11px; color: var(--text-muted);">Satisfied</div>
                                    </button>
                                    <button type="button" class="perception-btn" data-value="5" onclick="selectPerception(5)" style="flex: 1; padding: 16px 8px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); cursor: pointer; transition: all 0.2s;">
                                        <div style="font-size: 28px; margin-bottom: 4px; color: #10b981;"><i class="fas fa-face-grin-beam"></i></div>
                                        <div style="font-size: 11px; color: var(--text-muted);">Happy</div>
                                    </button>
                                </div>
                                <input type="hidden" id="issue-perception" value="">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="createIssue()">
                                <i class="fas fa-plus"></i>
                                Create Issue
                            </button>
                        </div>
                    `;
                    break;
                case 'resolve-issue':
                    const issueId = arguments[1];
                    const issue = issues.find(i => String(i.id) === String(issueId) || i.firestoreId === issueId);
                    if (!issue) break;

                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-check-circle"></i> Resolve Issue</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="color: var(--text-muted);">Customer:</span>
                                    <strong>${issue.customer}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="color: var(--text-muted);">Type:</span>
                                    <span class="badge" style="background: ${issue.type === 'In Store' ? 'var(--accent-primary)' : 'var(--info)'};">
                                        ${issue.type}
                                    </span>
                                </div>
                                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                                    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Issue Description:</div>
                                    <div style="font-size: 14px;">${issue.description}</div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>How was it resolved? *</label>
                                <textarea class="form-input" id="issue-solution" rows="4" placeholder="Describe how the issue was resolved..."></textarea>
                            </div>

                            <div class="form-group">
                                <label>Responsible Person *</label>
                                <input type="text" class="form-input" id="issue-resolved-by" placeholder="Who handled this issue?" value="VSU Admin">
                            </div>

                            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
                                <div style="font-size: 13px; color: var(--text-muted);">
                                    <i class="fas fa-info-circle"></i>
                                    Resolution date will be set to today automatically
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="resolveIssue('${issueId}')">
                                <i class="fas fa-check"></i>
                                Mark as Resolved
                            </button>
                        </div>
                    `;
                    break;
                case 'create-vendor':
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-truck"></i> Add Vendor</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Vendor Name *</label>
                                <input type="text" class="form-input" id="vendor-name" placeholder="Enter vendor name...">
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Category *</label>
                                    <select class="form-input" id="vendor-category">
                                        <option value="">Select category...</option>
                                        <option value="Vape Products">Vape Products</option>
                                        <option value="Tobacco Products">Tobacco Products</option>
                                        <option value="Beverages">Beverages</option>
                                        <option value="Snacks & Candy">Snacks & Candy</option>
                                        <option value="Store Supplies">Store Supplies</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Contact Person *</label>
                                    <input type="text" class="form-input" id="vendor-contact" placeholder="Contact name...">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Phone *</label>
                                    <input type="tel" class="form-input" id="vendor-phone" placeholder="(800) 555-0000" oninput="formatPhoneNumber(this)" maxlength="14">
                                </div>
                                <div class="form-group">
                                    <label>Email *</label>
                                    <input type="email" class="form-input" id="vendor-email" placeholder="contact@vendor.com">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Website (Optional)</label>
                                    <input type="url" class="form-input" id="vendor-website" placeholder="https://www.vendor.com" pattern="https?://.+">
                                </div>
                                <div class="form-group">
                                    <label>Access Info (Optional)</label>
                                    <input type="text" class="form-input" id="vendor-access" placeholder="Account #, login details, etc.">
                                </div>
                            </div>

                            <div class="form-group">
                                <label>What We Buy *</label>
                                <textarea class="form-input" id="vendor-products" rows="3" placeholder="List products purchased from this vendor..."></textarea>
                            </div>

                            <div class="form-group">
                                <label>How to Order *</label>
                                <textarea class="form-input" id="vendor-order-methods" rows="2" placeholder="Online portal, phone, email, etc."></textarea>
                            </div>

                            <div class="form-group">
                                <label>Additional Notes (Optional)</label>
                                <textarea class="form-input" id="vendor-notes" rows="2" placeholder="Payment terms, delivery schedules, etc."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="createVendor()">
                                <i class="fas fa-plus"></i>
                                Add Vendor
                            </button>
                        </div>
                    `;
                    break;
                case 'edit-vendor':
                    const editVendorId = arguments[1];
                    const editVendor = vendors.find(v => v.id === editVendorId);
                    if (!editVendor) break;

                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-edit"></i> Edit Vendor</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Vendor Name *</label>
                                <input type="text" class="form-input" id="edit-vendor-name" placeholder="Enter vendor name..." value="${editVendor.name}">
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Category *</label>
                                    <select class="form-input" id="edit-vendor-category">
                                        <option value="">Select category...</option>
                                        <option value="Vape Products" ${editVendor.category === 'Vape Products' ? 'selected' : ''}>Vape Products</option>
                                        <option value="Tobacco Products" ${editVendor.category === 'Tobacco Products' ? 'selected' : ''}>Tobacco Products</option>
                                        <option value="Beverages" ${editVendor.category === 'Beverages' ? 'selected' : ''}>Beverages</option>
                                        <option value="Snacks & Candy" ${editVendor.category === 'Snacks & Candy' ? 'selected' : ''}>Snacks & Candy</option>
                                        <option value="Store Supplies" ${editVendor.category === 'Store Supplies' ? 'selected' : ''}>Store Supplies</option>
                                        <option value="Other" ${editVendor.category === 'Other' ? 'selected' : ''}>Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Contact Person *</label>
                                    <input type="text" class="form-input" id="edit-vendor-contact" placeholder="Contact name..." value="${editVendor.contact}">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Phone *</label>
                                    <input type="tel" class="form-input" id="edit-vendor-phone" placeholder="(800) 555-0000" oninput="formatPhoneNumber(this)" maxlength="14" value="${editVendor.phone}">
                                </div>
                                <div class="form-group">
                                    <label>Email *</label>
                                    <input type="email" class="form-input" id="edit-vendor-email" placeholder="contact@vendor.com" value="${editVendor.email}">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Website (Optional)</label>
                                    <input type="url" class="form-input" id="edit-vendor-website" placeholder="https://www.vendor.com" pattern="https?://.+" value="${editVendor.website || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Access Info (Optional)</label>
                                    <input type="text" class="form-input" id="edit-vendor-access" placeholder="Account #, login details, etc." value="${editVendor.access || ''}">
                                </div>
                            </div>

                            <div class="form-group">
                                <label>What We Buy *</label>
                                <textarea class="form-input" id="edit-vendor-products" rows="3" placeholder="List products purchased from this vendor...">${editVendor.products}</textarea>
                            </div>

                            <div class="form-group">
                                <label>How to Order *</label>
                                <textarea class="form-input" id="edit-vendor-order-methods" rows="2" placeholder="Online portal, phone, email, etc.">${editVendor.orderMethods}</textarea>
                            </div>

                            <div class="form-group">
                                <label>Additional Notes (Optional)</label>
                                <textarea class="form-input" id="edit-vendor-notes" rows="2" placeholder="Payment terms, delivery schedules, etc.">${editVendor.notes || ''}</textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="editVendor('${editVendorId}')">
                                <i class="fas fa-save"></i>
                                Save Changes
                            </button>
                        </div>
                    `;
                    break;
                case 'add-expense':
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-wallet"></i> New Expense</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Description *</label>
                                <input type="text" class="form-input" id="expense-description" placeholder="What did you spend on?">
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Amount *</label>
                                    <input type="number" step="0.01" class="form-input" id="expense-amount" placeholder="0.00">
                                </div>
                                <div class="form-group">
                                    <label>Category *</label>
                                    <select class="form-input" id="expense-category">
                                        <option value="">Select category...</option>
                                        <option value="Food">🍔 Food</option>
                                        <option value="Home">🏠 Home</option>
                                        <option value="Subscriptions">📺 Subscriptions</option>
                                        <option value="Health">💊 Health</option>
                                        <option value="Gifts">🎁 Gifts</option>
                                        <option value="Others">📦 Others</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Date *</label>
                                <input type="date" class="form-input" id="expense-date" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="addExpense()">
                                <i class="fas fa-plus"></i>
                                Add Expense
                            </button>
                        </div>
                    `;
                    break;
                case 'add-treasury':
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-gem"></i> Add Heady Piece</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <!-- Image Upload Section -->
                            <div class="form-group">
                                <label>Piece Image</label>
                                <div style="display: flex; align-items: start; gap: 16px;">
                                    <div id="treasury-image-preview" style="width: 120px; height: 120px; border-radius: 12px; border: 2px dashed var(--border-color); display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); overflow: hidden; flex-shrink: 0;">
                                        <i class="fas fa-gem" style="font-size: 36px; color: var(--text-muted);"></i>
                                    </div>
                                    <div style="flex: 1;">
                                        <input type="file" id="treasury-image" accept="image/*" style="display: none;" onchange="previewTreasuryImage(this)">
                                        <button type="button" class="btn-secondary" onclick="document.getElementById('treasury-image').click()" style="margin-bottom: 8px;">
                                            <i class="fas fa-upload"></i> Upload Image
                                        </button>
                                        <p style="font-size: 12px; color: var(--text-muted); margin: 0;">Recommended: Square image, max 2MB</p>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Artwork Name *</label>
                                <input type="text" class="form-input" id="treasury-artwork-name" placeholder="Enter artwork name...">
                            </div>
                            <div class="form-group">
                                <label>Artist</label>
                                <input type="text" class="form-input" id="treasury-artist" placeholder="Artist name...">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Acquisition Date</label>
                                    <input type="date" class="form-input" id="treasury-acquisition-date">
                                </div>
                                <div class="form-group">
                                    <label>Estimated Value (USD)</label>
                                    <input type="number" step="0.01" class="form-input" id="treasury-value" placeholder="0.00">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Current Location *</label>
                                <select class="form-input" id="treasury-location">
                                    <option value="">Select location...</option>
                                    <option value="VSU Miramar">VSU Miramar</option>
                                    <option value="VSU Morena">VSU Morena</option>
                                    <option value="VSU Kearny Mesa">VSU Kearny Mesa</option>
                                    <option value="VSU North Park">VSU North Park</option>
                                    <option value="VSU Chula Vista">VSU Chula Vista</option>
                                    <option value="VSU North Park">VSU North Park</option>
                                    <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea class="form-input" id="treasury-description" rows="4" placeholder="Add details about the piece..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveTreasuryItem(false)">
                                <i class="fas fa-save"></i>
                                Add Piece
                            </button>
                        </div>
                    `;
                    break;
                case 'edit-treasury':
                    const treasuryId = data;
                    const treasuryItem = treasuryItems.find(t => t.firestoreId === treasuryId || t.id === treasuryId);
                    if (!treasuryItem) break;

                    // Get the main image (first photo or image field)
                    const treasuryEditImage = treasuryItem.image || (treasuryItem.photos && treasuryItem.photos.length > 0 ? treasuryItem.photos[0] : null);

                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-edit"></i> Edit Heady Piece</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <!-- Image Upload Section -->
                            <div class="form-group">
                                <label>Piece Image</label>
                                <div style="display: flex; align-items: start; gap: 16px;">
                                    <div id="treasury-image-preview" style="width: 120px; height: 120px; border-radius: 12px; border: 2px dashed var(--border-color); display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); overflow: hidden; flex-shrink: 0;">
                                        ${treasuryEditImage ? `<img src="${treasuryEditImage}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i class="fas fa-gem" style="font-size: 36px; color: var(--text-muted);"></i>`}
                                    </div>
                                    <div style="flex: 1;">
                                        <input type="file" id="treasury-image" accept="image/*" style="display: none;" onchange="previewTreasuryImage(this)">
                                        <button type="button" class="btn-secondary" onclick="document.getElementById('treasury-image').click()" style="margin-bottom: 8px;">
                                            <i class="fas fa-upload"></i> ${treasuryEditImage ? 'Change Image' : 'Upload Image'}
                                        </button>
                                        ${treasuryEditImage ? `<button type="button" class="btn-secondary" onclick="removeTreasuryImage()" style="margin-left: 8px; margin-bottom: 8px;"><i class="fas fa-trash"></i></button>` : ''}
                                        <p style="font-size: 12px; color: var(--text-muted); margin: 0;">Recommended: Square image, max 2MB</p>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Artwork Name *</label>
                                <input type="text" class="form-input" id="treasury-artwork-name" placeholder="Enter artwork name..." value="${treasuryItem.artworkName || ''}">
                            </div>
                            <div class="form-group">
                                <label>Artist</label>
                                <input type="text" class="form-input" id="treasury-artist" placeholder="Artist name..." value="${treasuryItem.artist || ''}">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Acquisition Date</label>
                                    <input type="date" class="form-input" id="treasury-acquisition-date" value="${treasuryItem.acquisitionDate || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Estimated Value (USD)</label>
                                    <input type="number" step="0.01" class="form-input" id="treasury-value" placeholder="0.00" value="${treasuryItem.value || ''}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Current Location *</label>
                                <select class="form-input" id="treasury-location">
                                    <option value="">Select location...</option>
                                    <option value="VSU Miramar" ${treasuryItem.location === 'VSU Miramar' ? 'selected' : ''}>VSU Miramar</option>
                                    <option value="VSU Morena" ${treasuryItem.location === 'VSU Morena' ? 'selected' : ''}>VSU Morena</option>
                                    <option value="VSU Kearny Mesa" ${treasuryItem.location === 'VSU Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                                    <option value="VSU North Park" ${treasuryItem.location === 'VSU North Park' ? 'selected' : ''}>VSU North Park</option>
                                    <option value="VSU Chula Vista" ${treasuryItem.location === 'VSU Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                                    <option value="Miramar Wine & Liquor" ${treasuryItem.location === 'Miramar Wine & Liquor' ? 'selected' : ''}>Miramar Wine & Liquor</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea class="form-input" id="treasury-description" rows="4" placeholder="Add details about the piece...">${treasuryItem.description || ''}</textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveTreasuryItem(true, '${treasuryId}')">
                                <i class="fas fa-save"></i>
                                Update Piece
                            </button>
                        </div>
                    `;
                    break;
                case 'add-change':
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-coins"></i> Add Change Record</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Photo of Money/Envelope</label>
                                <div style="display: flex; align-items: flex-start; gap: 16px;">
                                    <div id="change-photo-preview" style="width: 120px; height: 120px; border-radius: 12px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px dashed var(--border-color); cursor: pointer;" onclick="document.getElementById('change-photo').click()">
                                        <i class="fas fa-coins" style="font-size: 36px; color: var(--text-muted);"></i>
                                    </div>
                                    <div style="flex: 1;">
                                        <input type="file" id="change-photo" accept="image/*" style="display: none;" onchange="previewChangePhoto(this)">
                                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                                            <button type="button" class="btn-secondary" onclick="document.getElementById('change-photo').click()">
                                                <i class="fas fa-upload"></i> Upload
                                            </button>
                                            <button type="button" id="change-ai-scan-btn" class="btn-secondary" onclick="scanChangeWithAI()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none;">
                                                <i class="fas fa-magic"></i> Scan with AI
                                            </button>
                                            <button type="button" class="btn-secondary" onclick="removeChangePhoto()">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                        <p style="font-size: 12px; color: var(--text-muted); margin: 0;">Upload a photo of the money, then click "Scan with AI" to auto-count bills & coins</p>
                                    </div>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Store / Location *</label>
                                    <select class="form-input" id="change-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar">VSU Miramar</option>
                                        <option value="Morena">VSU Morena</option>
                                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                        <option value="Chula Vista">VSU Chula Vista</option>
                                        <option value="North Park">VSU North Park</option>
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Date *</label>
                                    <input type="date" class="form-input" id="change-date" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                            </div>

                            <!-- Currency Breakdown Section -->
                            <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin: 16px 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                                    <label style="font-weight: 600; color: var(--text-primary); margin: 0;">
                                        <i class="fas fa-money-bill-wave" style="color: var(--success);"></i> Currency Breakdown *
                                    </label>
                                    <div style="font-size: 18px; font-weight: 700; color: var(--accent-primary);">
                                        Total: $<span id="change-total-display">0.00</span>
                                    </div>
                                </div>

                                <!-- Bills -->
                                <div style="margin-bottom: 16px;">
                                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Bills</div>
                                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                                        <div style="text-align: center;">
                                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">$100</div>
                                            <input type="number" min="0" class="form-input change-denomination" data-value="100" id="change-bills-100" placeholder="0" style="text-align: center; padding: 8px;" onchange="calculateChangeTotal()" oninput="calculateChangeTotal()">
                                        </div>
                                        <div style="text-align: center;">
                                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">$50</div>
                                            <input type="number" min="0" class="form-input change-denomination" data-value="50" id="change-bills-50" placeholder="0" style="text-align: center; padding: 8px;" onchange="calculateChangeTotal()" oninput="calculateChangeTotal()">
                                        </div>
                                        <div style="text-align: center;">
                                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">$20</div>
                                            <input type="number" min="0" class="form-input change-denomination" data-value="20" id="change-bills-20" placeholder="0" style="text-align: center; padding: 8px;" onchange="calculateChangeTotal()" oninput="calculateChangeTotal()">
                                        </div>
                                        <div style="text-align: center;">
                                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">$10</div>
                                            <input type="number" min="0" class="form-input change-denomination" data-value="10" id="change-bills-10" placeholder="0" style="text-align: center; padding: 8px;" onchange="calculateChangeTotal()" oninput="calculateChangeTotal()">
                                        </div>
                                        <div style="text-align: center;">
                                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">$5</div>
                                            <input type="number" min="0" class="form-input change-denomination" data-value="5" id="change-bills-5" placeholder="0" style="text-align: center; padding: 8px;" onchange="calculateChangeTotal()" oninput="calculateChangeTotal()">
                                        </div>
                                        <div style="text-align: center;">
                                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">$2</div>
                                            <input type="number" min="0" class="form-input change-denomination" data-value="2" id="change-bills-2" placeholder="0" style="text-align: center; padding: 8px;" onchange="calculateChangeTotal()" oninput="calculateChangeTotal()">
                                        </div>
                                        <div style="text-align: center;">
                                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">$1</div>
                                            <input type="number" min="0" class="form-input change-denomination" data-value="1" id="change-bills-1" placeholder="0" style="text-align: center; padding: 8px;" onchange="calculateChangeTotal()" oninput="calculateChangeTotal()">
                                        </div>
                                    </div>
                                </div>

                                <!-- Coins -->
                                <div>
                                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Coins</div>
                                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;">
                                        <div style="text-align: center;">
                                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">$1 coin</div>
                                            <input type="number" min="0" class="form-input change-denomination" data-value="1" id="change-coins-100" placeholder="0" style="text-align: center; padding: 8px;" onchange="calculateChangeTotal()" oninput="calculateChangeTotal()">
                                        </div>
                                        <div style="text-align: center;">
                                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">50¢</div>
                                            <input type="number" min="0" class="form-input change-denomination" data-value="0.50" id="change-coins-50" placeholder="0" style="text-align: center; padding: 8px;" onchange="calculateChangeTotal()" oninput="calculateChangeTotal()">
                                        </div>
                                        <div style="text-align: center;">
                                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">25¢</div>
                                            <input type="number" min="0" class="form-input change-denomination" data-value="0.25" id="change-coins-25" placeholder="0" style="text-align: center; padding: 8px;" onchange="calculateChangeTotal()" oninput="calculateChangeTotal()">
                                        </div>
                                        <div style="text-align: center;">
                                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">10¢</div>
                                            <input type="number" min="0" class="form-input change-denomination" data-value="0.10" id="change-coins-10" placeholder="0" style="text-align: center; padding: 8px;" onchange="calculateChangeTotal()" oninput="calculateChangeTotal()">
                                        </div>
                                        <div style="text-align: center;">
                                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">5¢</div>
                                            <input type="number" min="0" class="form-input change-denomination" data-value="0.05" id="change-coins-5" placeholder="0" style="text-align: center; padding: 8px;" onchange="calculateChangeTotal()" oninput="calculateChangeTotal()">
                                        </div>
                                        <div style="text-align: center;">
                                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">1¢</div>
                                            <input type="number" min="0" class="form-input change-denomination" data-value="0.01" id="change-coins-1" placeholder="0" style="text-align: center; padding: 8px;" onchange="calculateChangeTotal()" oninput="calculateChangeTotal()">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Change in Store Section -->
                            <div style="background: linear-gradient(135deg, #10b98115, #10b98108); border: 2px solid #10b98140; border-radius: 12px; padding: 16px; margin: 16px 0;">
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                    <div style="width: 40px; height: 40px; background: #10b98120; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-cash-register" style="color: #10b981; font-size: 18px;"></i>
                                    </div>
                                    <div>
                                        <label style="font-weight: 600; color: var(--text-primary); margin: 0; display: block;">Change in Store</label>
                                        <span style="font-size: 12px; color: var(--text-muted);">Amount of change currently available in the register</span>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 24px; font-weight: 600; color: #10b981;">$</span>
                                    <input type="number" step="0.01" min="0" class="form-input" id="change-in-store" placeholder="0.00" style="font-size: 20px; font-weight: 600; text-align: center; max-width: 200px;">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Left By (Person who left the change) *</label>
                                    <input type="text" class="form-input" id="change-left-by" placeholder="Name of person...">
                                </div>
                                <div class="form-group">
                                    <label>Received By (Person who received it) *</label>
                                    <input type="text" class="form-input" id="change-received-by" placeholder="Name of person...">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Notes (Optional)</label>
                                <textarea class="form-input" id="change-notes" rows="3" placeholder="e.g., 'Left in drawer 1', 'Added extra due to lack of change'..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveChangeRecord()">
                                <i class="fas fa-save"></i>
                                Save Record
                            </button>
                        </div>
                    `;
                    break;

                case 'add-risknote':
                    // Initialize voice assistant for risk note form
                    setTimeout(() => {
                        VoiceAssistant.init('risknote', {
                            title: 'AI Voice Assistant',
                            subtitle: 'Speak to auto-fill the form',
                            buttonColor: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                            listeningText: 'Listening... Describe the incident',
                            systemPrompt: 'You are a security assistant helping to document risk notes for a retail store. Extract structured information from voice transcripts about suspicious activity or policy violations.',
                            prompt: `Analyze this voice transcript about a risk/security incident and extract the information. Return ONLY a JSON object with these fields (use null for any field you cannot determine):

Transcript: "{transcript}"

{
    "store": "one of: Miramar, Morena, Kearny Mesa, Chula Vista, North Park, Miramar Wine & Liquor (if mentioned)",
    "behaviorType": "one of: strange_questions, unusual_purchase, recording, policy_violation, suspicious_attitude, other",
    "description": "a clear, professional description of what happened based on the transcript",
    "riskLevel": "low, medium, or high based on severity",
    "reportedBy": "name of the person reporting if mentioned"
}

Behavior type guidelines:
- strange_questions: asking unusual questions about security, schedules, or policies
- unusual_purchase: suspicious buying patterns, bulk purchases, specific combinations
- recording: taking photos/videos without permission
- policy_violation: attempting to violate store policies
- suspicious_attitude: nervous behavior, watching cameras, avoiding eye contact
- other: anything that doesn't fit above

Risk level guidelines:
- low: minor concern, document for awareness
- medium: notable concern, should monitor
- high: immediate concern, requires action

Return ONLY the JSON object, no additional text.`,
                            onFill: (data) => {
                                if (data.store) {
                                    const storeSelect = document.getElementById('risknote-store');
                                    for (let opt of storeSelect.options) {
                                        if (opt.value.toLowerCase().includes(data.store.toLowerCase()) || data.store.toLowerCase().includes(opt.value.toLowerCase())) {
                                            storeSelect.value = opt.value; break;
                                        }
                                    }
                                }
                                if (data.behaviorType) {
                                    const typeSelect = document.getElementById('risknote-type');
                                    const typeValue = data.behaviorType.toLowerCase().replace(/\s+/g, '_');
                                    for (let opt of typeSelect.options) {
                                        if (opt.value === typeValue) { typeSelect.value = opt.value; break; }
                                    }
                                }
                                if (data.description) document.getElementById('risknote-description').value = data.description;
                                else if (data._transcript) document.getElementById('risknote-description').value = data._transcript;
                                if (data.riskLevel) selectRiskLevel(data.riskLevel.toLowerCase());
                                if (data.reportedBy) document.getElementById('risknote-reporter').value = data.reportedBy;
                            }
                        });
                    }, 100);

                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-shield-halved"></i> New Risk Note</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <!-- AI Voice Assistant Section -->
                            ${VoiceAssistant.getHTML('risknote', { title: 'AI Voice Assistant', subtitle: 'Speak to auto-fill the form', buttonColor: 'linear-gradient(135deg, #8b5cf6, #ec4899)' })}

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date</label>
                                    <input type="date" class="form-input" id="risknote-date" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div class="form-group">
                                    <label>Store</label>
                                    <select class="form-input" id="risknote-store">
                                        <option value="Miramar">VSU Miramar</option>
                                        <option value="Morena">VSU Morena</option>
                                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                        <option value="Chula Vista">VSU Chula Vista</option>
                                        <option value="North Park">VSU North Park</option>
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Type of Behavior</label>
                                <select class="form-input" id="risknote-type">
                                    <option value="strange_questions">Strange Questions</option>
                                    <option value="unusual_purchase">Unusual Purchase</option>
                                    <option value="recording">Recording / Taking Photos</option>
                                    <option value="policy_violation">Policy Violation Attempt</option>
                                    <option value="suspicious_attitude">Suspicious Attitude</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea class="form-input" id="risknote-description" rows="3" placeholder="Describe what happened... or use the voice assistant above!"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Risk Level</label>
                                <div style="display: flex; gap: 12px;">
                                    <button type="button" class="risk-level-btn" data-level="low" onclick="selectRiskLevel('low')" style="flex: 1; padding: 14px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); cursor: pointer; transition: all 0.2s;">
                                        <div style="font-size: 20px; margin-bottom: 4px; color: #22c55e;">🟢</div>
                                        <div style="font-size: 12px; font-family: Outfit;">Low</div>
                                    </button>
                                    <button type="button" class="risk-level-btn" data-level="medium" onclick="selectRiskLevel('medium')" style="flex: 1; padding: 14px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); cursor: pointer; transition: all 0.2s;">
                                        <div style="font-size: 20px; margin-bottom: 4px; color: #f59e0b;">🟡</div>
                                        <div style="font-size: 12px; font-family: Outfit;">Medium</div>
                                    </button>
                                    <button type="button" class="risk-level-btn" data-level="high" onclick="selectRiskLevel('high')" style="flex: 1; padding: 14px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); cursor: pointer; transition: all 0.2s;">
                                        <div style="font-size: 20px; margin-bottom: 4px; color: #ef4444; font-family: Outfit;">🔴</div>
                                        <div style="font-size: 12px; font-family: Outfit;">High</div>
                                    </button>
                                </div>
                                <input type="hidden" id="risknote-level" value="low">
                            </div>
                            <div class="form-group">
                                <label>Reported By</label>
                                <input type="text" class="form-input" id="risknote-reporter" placeholder="Your name...">
                            </div>
                            <div class="form-group">
                                <label>Photo (Optional)</label>
                                <div style="border: 2px dashed var(--border-color); border-radius: 12px; padding: 16px; text-align: center; background: var(--bg-hover);">
                                    <input type="file" id="risknote-photo" accept="image/*" onchange="previewRiskNotePhoto(this)" style="display: none;">
                                    <div id="risknote-photo-preview" style="display: none; margin-bottom: 12px;">
                                        <img id="risknote-photo-img" style="max-width: 100%; max-height: 150px; border-radius: 8px; object-fit: cover;">
                                    </div>
                                    <button type="button" class="btn-secondary" onclick="document.getElementById('risknote-photo').click()" style="margin: 0;">
                                        <i class="fas fa-camera"></i> Upload Photo
                                    </button>
                                    <p style="margin: 8px 0 0 0; color: var(--text-muted); font-size: 12px;">Add photo evidence if available</p>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Manager Note (Optional)</label>
                                <textarea class="form-input" id="risknote-manager-note" rows="2" placeholder="Internal notes for management..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveRiskNote()">
                                <i class="fas fa-save"></i> Save Note
                            </button>
                        </div>
                    `;
                    break;

                case 'add-gift':
                    // Initialize voice assistant for gift form
                    setTimeout(() => {
                        VoiceAssistant.init('gift', {
                            title: 'AI Voice Assistant',
                            subtitle: 'Speak to auto-fill the gift form',
                            buttonColor: 'linear-gradient(135deg, #ec4899, #f59e0b)',
                            listeningText: 'Listening... Describe the gift',
                            systemPrompt: 'You are an assistant helping to document gifts given at a retail store. Extract structured information from voice transcripts about gifts given to customers, vendors, or employees.',
                            prompt: `Analyze this voice transcript about a gift and extract the information. Return ONLY a JSON object with these fields (use null for any field you cannot determine):

Transcript: "{transcript}"

{
    "productName": "the product being given as a gift",
    "quantity": "number of items (default 1)",
    "value": "estimated value in dollars as a number",
    "recipientName": "name of person receiving the gift",
    "recipientType": "one of: customer, vendor, employee, other",
    "reason": "clear explanation of why the gift was given",
    "store": "one of: Miramar, Morena, Kearny Mesa, Chula Vista, North Park, Miramar Wine & Liquor (if mentioned)",
    "notes": "any additional relevant details"
}

Return ONLY the JSON object, no additional text.`,
                            onFill: (data) => {
                                if (data.productName) document.getElementById('gift-product').value = data.productName;
                                if (data.quantity) {
                                    const qty = parseInt(data.quantity);
                                    if (!isNaN(qty) && qty > 0) document.getElementById('gift-quantity').value = qty;
                                }
                                if (data.value) {
                                    const val = parseFloat(data.value.toString().replace(/[^0-9.]/g, ''));
                                    if (!isNaN(val)) document.getElementById('gift-value').value = val.toFixed(2);
                                }
                                if (data.recipientName) document.getElementById('gift-recipient').value = data.recipientName;
                                if (data.recipientType) {
                                    const typeSelect = document.getElementById('gift-recipient-type');
                                    for (let opt of typeSelect.options) {
                                        if (opt.value === data.recipientType.toLowerCase()) { typeSelect.value = opt.value; break; }
                                    }
                                }
                                if (data.reason) document.getElementById('gift-reason').value = data.reason;
                                else if (data._transcript) document.getElementById('gift-reason').value = data._transcript;
                                if (data.store) {
                                    const storeSelect = document.getElementById('gift-store');
                                    for (let opt of storeSelect.options) {
                                        if (opt.value.toLowerCase().includes(data.store.toLowerCase()) || data.store.toLowerCase().includes(opt.value.toLowerCase())) {
                                            storeSelect.value = opt.value; break;
                                        }
                                    }
                                }
                                if (data.notes) document.getElementById('gift-notes').value = data.notes;
                            }
                        });
                    }, 100);

                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-gift"></i> Register Comp</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <!-- AI Voice Assistant Section -->
                            ${VoiceAssistant.getHTML('gift', { title: 'AI Voice Assistant', subtitle: 'Speak to auto-fill the comp form', buttonColor: 'linear-gradient(135deg, #ec4899, #f59e0b)' })}

                            <div class="form-row">
                                <div class="form-group" style="flex: 2;">
                                    <label>Product Name</label>
                                    <input type="text" class="form-input" id="gift-product" placeholder="e.g., Vape Pen SMOK Nord 4">
                                </div>
                                <div class="form-group">
                                    <label>Quantity</label>
                                    <input type="number" class="form-input" id="gift-quantity" value="1" min="1">
                                </div>
                                <div class="form-group">
                                    <label>Cost ($)</label>
                                    <input type="number" step="0.01" class="form-input" id="gift-value" placeholder="0.00">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Recipient Name</label>
                                    <input type="text" class="form-input" id="gift-recipient" placeholder="Name of person receiving the comp">
                                </div>
                                <div class="form-group">
                                    <label>Recipient Type</label>
                                    <select class="form-input" id="gift-recipient-type">
                                        <option value="">Select type...</option>
                                        <option value="customer">Customer</option>
                                        <option value="vendor">Vendor</option>
                                        <option value="employee">Employee</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Reason for Comp</label>
                                <textarea class="form-input" id="gift-reason" rows="2" placeholder="e.g., Defective product replacement, compensation for error... or use voice above!"></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Store</label>
                                    <select class="form-input" id="gift-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar">VSU Miramar</option>
                                        <option value="Morena">VSU Morena</option>
                                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                        <option value="Chula Vista">VSU Chula Vista</option>
                                        <option value="North Park">VSU North Park</option>
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Date</label>
                                    <input type="date" class="form-input" id="gift-date" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Approved By</label>
                                <input type="text" class="form-input" id="gift-approved-by" placeholder="Manager who approved this comp">
                            </div>
                            <div class="form-group">
                                <label>Additional Notes</label>
                                <textarea class="form-input" id="gift-notes" rows="2" placeholder="Any additional details..."></textarea>
                            </div>
                            <div class="form-group">
                                <label>Photo of Gift</label>
                                <div class="file-upload">
                                    <input type="file" id="gift-photo" accept="image/*">
                                    <div class="file-upload-content">
                                        <i class="fas fa-camera"></i>
                                        <span>Click to upload photo</span>
                                        <small>JPG, PNG, GIF accepted</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveGift()">
                                <i class="fas fa-save"></i>
                                Save Comp
                            </button>
                        </div>
                    `;
                    break;

                case 'add-incident-log':
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-clipboard-list"></i> Log Incident</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date *</label>
                                    <input type="date" class="form-input" id="incident-log-date" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div class="form-group">
                                    <label>Time</label>
                                    <input type="time" class="form-input" id="incident-log-time">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Store *</label>
                                <select class="form-input" id="incident-log-store">
                                    <option value="">Select store...</option>
                                    <option value="Miramar">VSU Miramar</option>
                                    <option value="Chula Vista">VSU Chula Vista</option>
                                    <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                    <option value="North Park">VSU North Park</option>
                                    <option value="Morena">VSU Morena</option>
                                    <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Incident Description *</label>
                                <textarea class="form-input" id="incident-log-incident" rows="3" placeholder="Describe what happened..."></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Informed Manager/Owner Name</label>
                                    <input type="text" class="form-input" id="incident-log-manager" placeholder="Who was notified?">
                                </div>
                                <div class="form-group">
                                    <label>Cameras Reviewed?</label>
                                    <select class="form-input" id="incident-log-cameras">
                                        <option value="">Select...</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                        <option value="N/A">N/A</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Conclusion</label>
                                <textarea class="form-input" id="incident-log-conclusion" rows="2" placeholder="How was it resolved?"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveIncidentLog()">
                                <i class="fas fa-save"></i>
                                Save Incident
                            </button>
                        </div>
                    `;
                    break;

                case 'add-employee-purchase':
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-shopping-bag"></i> New Employee Purchase</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Employee *</label>
                                    <select class="form-input" id="emp-purchase-employee">
                                        <option value="">Select employee...</option>
                                        ${employees.filter(e => e.status === 'active').map(emp => `
                                            <option value="${emp.id || emp.firestoreId}">${emp.name}</option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Store *</label>
                                    <select class="form-input" id="emp-purchase-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar">VSU Miramar</option>
                                        <option value="Chula Vista">VSU Chula Vista</option>
                                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                        <option value="North Park">VSU North Park</option>
                                        <option value="Morena">VSU Morena</option>
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date *</label>
                                    <input type="date" class="form-input" id="emp-purchase-date" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div class="form-group">
                                    <label>Amount ($) *</label>
                                    <input type="number" step="0.01" class="form-input" id="emp-purchase-amount" placeholder="0.00">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Items Purchased</label>
                                <textarea class="form-input" id="emp-purchase-items" rows="2" placeholder="List of items purchased..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveEmployeePurchase()">
                                <i class="fas fa-save"></i>
                                Save Purchase
                            </button>
                        </div>
                    `;
                    break;

                case 'edit-gift':
                    const editGiftRecord = giftsRecords.find(r => r.id === data);
                    if (!editGiftRecord) {
                        content = '<div class="modal-body"><p>Gift record not found</p></div>';
                        break;
                    }
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-edit"></i> Edit Gift</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-row">
                                <div class="form-group" style="flex: 2;">
                                    <label>Product Name</label>
                                    <input type="text" class="form-input" id="gift-product" value="${editGiftRecord.product || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Quantity</label>
                                    <input type="number" class="form-input" id="gift-quantity" value="${editGiftRecord.quantity || 1}" min="1">
                                </div>
                                <div class="form-group">
                                    <label>Value ($)</label>
                                    <input type="number" step="0.01" class="form-input" id="gift-value" value="${editGiftRecord.value || ''}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Recipient Name</label>
                                    <input type="text" class="form-input" id="gift-recipient" value="${editGiftRecord.recipient || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Recipient Type</label>
                                    <select class="form-input" id="gift-recipient-type">
                                        <option value="">Select type...</option>
                                        <option value="customer" ${editGiftRecord.recipientType === 'customer' ? 'selected' : ''}>Customer</option>
                                        <option value="vendor" ${editGiftRecord.recipientType === 'vendor' ? 'selected' : ''}>Vendor</option>
                                        <option value="employee" ${editGiftRecord.recipientType === 'employee' ? 'selected' : ''}>Employee</option>
                                        <option value="other" ${editGiftRecord.recipientType === 'other' ? 'selected' : ''}>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Reason for Gift</label>
                                <textarea class="form-input" id="gift-reason" rows="2">${editGiftRecord.reason || ''}</textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Store</label>
                                    <select class="form-input" id="gift-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar" ${editGiftRecord.store === 'Miramar' ? 'selected' : ''}>VSU Miramar</option>
                                        <option value="Morena" ${editGiftRecord.store === 'Morena' ? 'selected' : ''}>VSU Morena</option>
                                        <option value="Kearny Mesa" ${editGiftRecord.store === 'Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                                        <option value="Chula Vista" ${editGiftRecord.store === 'Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                                        <option value="North Park" ${editGiftRecord.store === 'North Park' ? 'selected' : ''}>VSU North Park</option>
                                        <option value="Miramar Wine & Liquor" ${editGiftRecord.store === 'Miramar Wine & Liquor' ? 'selected' : ''}>Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Date</label>
                                    <input type="date" class="form-input" id="gift-date" value="${editGiftRecord.date || ''}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Additional Notes</label>
                                <textarea class="form-input" id="gift-notes" rows="2">${editGiftRecord.notes || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label>Photo of Gift</label>
                                <div class="file-upload">
                                    <input type="file" id="gift-photo" accept="image/*">
                                    <div class="file-upload-content">
                                        <i class="fas fa-camera"></i>
                                        <span>Click to upload new photo</span>
                                        <small>JPG, PNG, GIF accepted</small>
                                    </div>
                                </div>
                                ${editGiftRecord.photo ? `<img src="${editGiftRecord.photo}" style="max-width: 200px; margin-top: 10px; border-radius: 8px;">` : ''}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveGift(true, '${String(editGiftRecord.id).replace(/'/g, "\\'")}')">
                                <i class="fas fa-save"></i>
                                Update Gift
                            </button>
                        </div>
                    `;
                    break;

                case 'add-schedule':
                    const scheduleEmployeeOptions = employees.map(emp =>
                        `<option value="${emp.id}">${emp.name} - ${emp.store}</option>`
                    ).join('');
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-calendar-plus"></i> Add Schedule</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-row">
                                <div class="form-group" style="flex: 2;">
                                    <label>Employee *</label>
                                    <select class="form-input" id="schedule-employee">
                                        <option value="">Select employee...</option>
                                        ${scheduleEmployeeOptions}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Store *</label>
                                    <select class="form-input" id="schedule-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar">VSU Miramar</option>
                                        <option value="Morena">VSU Morena</option>
                                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                        <option value="Chula Vista">VSU Chula Vista</option>
                                        <option value="North Park">VSU North Park</option>
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date *</label>
                                    <input type="date" class="form-input" id="schedule-date" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div class="form-group">
                                    <label>Start Time *</label>
                                    <input type="time" class="form-input" id="schedule-start" value="09:00">
                                </div>
                                <div class="form-group">
                                    <label>End Time *</label>
                                    <input type="time" class="form-input" id="schedule-end" value="17:00">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveSchedule()">
                                <i class="fas fa-save"></i>
                                Save
                            </button>
                        </div>
                    `;
                    break;

                case 'quick-add-schedule':
                    const quickData = data || {};
                    const dayName = quickData.date ? new Date(quickData.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : '';
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-clock"></i> Add Shift</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div style="background: var(--bg-hover); padding: 12px 15px; border-radius: 8px; margin-bottom: 15px;">
                                <div style="font-weight: 600; color: var(--text-primary);">${quickData.employeeName || 'Employee'}</div>
                                <div style="font-size: 13px; color: var(--text-muted);">${dayName} @ ${quickData.store || ''}</div>
                            </div>
                            <input type="hidden" id="schedule-employee" value="${quickData.employeeId || ''}">
                            <input type="hidden" id="schedule-store" value="${quickData.store || ''}">
                            <input type="hidden" id="schedule-date" value="${quickData.date || ''}">
                            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                                <button type="button" class="shift-preset-btn" onclick="setShiftPreset('09:00', '17:00')" style="flex: 1; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card); cursor: pointer; transition: all 0.2s;">
                                    <div style="font-weight: 600;">Morning</div>
                                    <div style="font-size: 12px; color: var(--text-muted);">9am - 5pm</div>
                                </button>
                                <button type="button" class="shift-preset-btn" onclick="setShiftPreset('14:00', '22:00')" style="flex: 1; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card); cursor: pointer; transition: all 0.2s;">
                                    <div style="font-weight: 600;">Evening</div>
                                    <div style="font-size: 12px; color: var(--text-muted);">2pm - 10pm</div>
                                </button>
                                <button type="button" class="shift-preset-btn" onclick="setShiftPreset('10:00', '19:00')" style="flex: 1; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card); cursor: pointer; transition: all 0.2s;">
                                    <div style="font-weight: 600;">Mid</div>
                                    <div style="font-size: 12px; color: var(--text-muted);">10am - 7pm</div>
                                </button>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Start Time</label>
                                    <input type="time" class="form-input" id="schedule-start" value="09:00" style="font-size: 18px; padding: 12px;">
                                </div>
                                <div class="form-group">
                                    <label>End Time</label>
                                    <input type="time" class="form-input" id="schedule-end" value="17:00" style="font-size: 18px; padding: 12px;">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveSchedule()" style="min-width: 120px;">
                                <i class="fas fa-plus"></i> Add Shift
                            </button>
                        </div>
                    `;
                    break;

                case 'edit-schedule':
                    const editSchedule = schedules.find(s => s.id === data);
                    if (!editSchedule) {
                        content = '<div class="modal-body"><p>Schedule not found</p></div>';
                        break;
                    }
                    const editScheduleEmployeeOptions = employees.map(emp =>
                        `<option value="${emp.id}" ${emp.id === editSchedule.employeeId ? 'selected' : ''}>${emp.name} - ${emp.store}</option>`
                    ).join('');
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-calendar-edit"></i> Edit Schedule</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-row">
                                <div class="form-group" style="flex: 2;">
                                    <label>Employee *</label>
                                    <select class="form-input" id="schedule-employee">
                                        <option value="">Select employee...</option>
                                        ${editScheduleEmployeeOptions}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Store *</label>
                                    <select class="form-input" id="schedule-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar" ${editSchedule.store === 'Miramar' ? 'selected' : ''}>VSU Miramar</option>
                                        <option value="Morena" ${editSchedule.store === 'Morena' ? 'selected' : ''}>VSU Morena</option>
                                        <option value="Kearny Mesa" ${editSchedule.store === 'Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                                        <option value="Chula Vista" ${editSchedule.store === 'Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                                        <option value="North Park" ${editSchedule.store === 'North Park' ? 'selected' : ''}>VSU North Park</option>
                                        <option value="Miramar Wine & Liquor" ${editSchedule.store === 'Miramar Wine & Liquor' ? 'selected' : ''}>Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date *</label>
                                    <input type="date" class="form-input" id="schedule-date" value="${editSchedule.date || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Start Time *</label>
                                    <input type="time" class="form-input" id="schedule-start" value="${editSchedule.startTime || '09:00'}">
                                </div>
                                <div class="form-group">
                                    <label>End Time *</label>
                                    <input type="time" class="form-input" id="schedule-end" value="${editSchedule.endTime || '17:00'}">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="updateSchedule('${editSchedule.id}')">
                                <i class="fas fa-save"></i>
                                Update
                            </button>
                        </div>
                    `;
                    break;
            }

            modalContent.innerHTML = content;
            modal.classList.add('active');

            // Add event listener for customer request checkbox if it exists
            const customerCheckbox = document.getElementById('customer-request');
            if (customerCheckbox) {
                customerCheckbox.addEventListener('change', function() {
                    const customerInfo = document.getElementById('customer-info');
                    customerInfo.disabled = !this.checked;
                    if (!this.checked) {
                        customerInfo.value = '';
                        customerInfo.style.background = 'var(--bg-hover)';
                    } else {
                        customerInfo.style.background = 'var(--bg-card)';
                    }
                });
            }
        }

        function closeModal(forceClose = false) {
            // Reset form protection before closing
            if (typeof formProtectionManager !== 'undefined') {
                formProtectionManager.resetProtection();
            }

            document.getElementById('modal').classList.remove('active');
        }

        function viewEmployee(id) {
            const emp = employees.find(e => e.id === id);
            if (!emp) return;
            
            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');
            
            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2>Employee Profile</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="employee-profile">
                        <div class="profile-header">
                            ${emp.photo
                                ? `<div class="employee-avatar-xl" style="background-image: url('${emp.photo}'); background-size: cover; background-position: center; cursor: pointer;" onclick="showImageModal('${emp.photo}', '${emp.name}')"></div>`
                                : `<div class="employee-avatar-xl ${emp.color}">${emp.initials}</div>`
                            }
                            <div class="profile-info">
                                <h2>${emp.name}</h2>
                                <p>${emp.role} @ ${emp.store}</p>
                                <span class="status-badge ${emp.status}">${emp.status}</span>
                            </div>
                        </div>
                        <div class="profile-details">
                            <div class="detail-row">
                                <i class="fas fa-envelope"></i>
                                <span>${emp.authEmail}</span>
                            </div>
                            <div class="detail-row">
                                <i class="fas fa-phone"></i>
                                <span>${emp.phone}</span>
                            </div>
                            <div class="detail-row">
                                <i class="fas fa-calendar"></i>
                                <span>Hired: ${formatDate(emp.hireDate)}</span>
                            </div>
                            <div class="detail-row">
                                <i class="fas fa-ambulance"></i>
                                <span>Emergency: ${emp.emergencyContact}</span>
                            </div>
                            <div class="detail-row">
                                <i class="fas fa-notes-medical"></i>
                                <span>Medical Conditions: ${emp.medicalConditions || emp.allergies || 'None'}</span>
                            </div>
                        </div>

                        ${emp.paperwork && emp.paperwork.length > 0 ? `
                        <div class="form-divider"></div>
                        <h3 class="form-section-title">Employee Paperwork</h3>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${emp.paperwork.map((doc, index) => `
                                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--surface-secondary); border-radius: 8px; border: 1px solid var(--border-color);">
                                    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                                        <i class="fas ${getFileIcon(doc.fileType)}" style="color: var(--accent-primary); font-size: 18px;"></i>
                                        <div style="flex: 1;">
                                            <div style="font-weight: 500; color: var(--text-primary); font-size: 14px;">${doc.fileName}</div>
                                            <div style="font-size: 12px; color: var(--text-muted);">
                                                ${doc.documentType || 'Document'} • ${formatFileSize(doc.fileSize)} • ${formatDate(doc.uploadedAt.toDate ? doc.uploadedAt.toDate() : doc.uploadedAt)}
                                            </div>
                                        </div>
                                    </div>
                                    <button class="btn-icon" onclick="showDocumentPreview({ url: '${doc.downloadURL}', fileName: '${doc.fileName}', fileType: '${doc.fileType || ''}', fileSize: ${doc.fileSize || 0}, documentType: '${doc.documentType || 'Document'}', uploadedAt: '${doc.uploadedAt?.toDate ? doc.uploadedAt.toDate().toISOString() : doc.uploadedAt}' })" title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                    <button class="btn-secondary" onclick="openPTORequestModal('${emp.id}')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none;"><i class="fas fa-umbrella-beach"></i> Request Time Off</button>
                    <button class="btn-primary" onclick="editEmployee('${emp.id}')"><i class="fas fa-edit"></i> Edit</button>
                </div>
            `;
            modal.classList.add('active');
        }

        // Certification Management Functions
        function openAddCertificationModal(employeeId) {
            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-certificate" style="color: #f59e0b;"></i> Add Certification</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Certification Name *</label>
                        <input type="text" class="form-input" id="cert-name" placeholder="e.g., Alcohol Sales License, Food Handler's Permit">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Issued By</label>
                            <input type="text" class="form-input" id="cert-issued-by" placeholder="e.g., State of California, ABC Board">
                        </div>
                        <div class="form-group">
                            <label>Issue Date</label>
                            <input type="date" class="form-input" id="cert-issue-date">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Expiration Date</label>
                            <input type="date" class="form-input" id="cert-expiration-date">
                        </div>
                        <div class="form-group">
                            <label>Certificate Number</label>
                            <input type="text" class="form-input" id="cert-number" placeholder="Optional">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Upload Certificate (Optional)</label>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <input type="file" id="cert-file" accept="image/*,.pdf" style="display: none;" onchange="previewCertFile(this)">
                            <button type="button" class="btn-secondary" onclick="document.getElementById('cert-file').click()">
                                <i class="fas fa-upload"></i> Upload File
                            </button>
                            <input type="file" id="cert-camera" accept="image/*" capture="environment" style="display: none;" onchange="previewCertFile(this)">
                            <button type="button" class="btn-secondary" onclick="document.getElementById('cert-camera').click()" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none;">
                                <i class="fas fa-camera"></i> Take Photo
                            </button>
                        </div>
                        <div id="cert-file-preview" style="margin-top: 12px;"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="viewEmployee('${employeeId}')">Cancel</button>
                    <button class="btn-primary" onclick="saveCertification('${employeeId}')">
                        <i class="fas fa-save"></i> Save Certification
                    </button>
                </div>
            `;
            modal.classList.add('active');
        }

        function previewCertFile(input) {
            const preview = document.getElementById('cert-file-preview');
            if (input.files && input.files[0]) {
                const file = input.files[0];
                const isImage = file.type.startsWith('image/');

                if (isImage) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        preview.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                                <img src="${e.target.result}" style="max-width: 80px; max-height: 80px; border-radius: 6px; object-fit: cover;">
                                <div>
                                    <div style="font-weight: 500; color: var(--text-primary);">${file.name}</div>
                                    <div style="font-size: 12px; color: var(--text-muted);">${(file.size / 1024).toFixed(1)} KB</div>
                                </div>
                            </div>
                        `;
                    };
                    reader.readAsDataURL(file);
                } else {
                    preview.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                            <i class="fas fa-file-pdf" style="font-size: 32px; color: #ef4444;"></i>
                            <div>
                                <div style="font-weight: 500; color: var(--text-primary);">${file.name}</div>
                                <div style="font-size: 12px; color: var(--text-muted);">${(file.size / 1024).toFixed(1)} KB</div>
                            </div>
                        </div>
                    `;
                }
            }
        }

        async function saveCertification(employeeId) {
            const name = document.getElementById('cert-name').value.trim();
            const issuedBy = document.getElementById('cert-issued-by').value.trim();
            const issueDate = document.getElementById('cert-issue-date').value;
            const expirationDate = document.getElementById('cert-expiration-date').value;
            const certNumber = document.getElementById('cert-number').value.trim();
            const fileInput = document.getElementById('cert-file');
            const cameraInput = document.getElementById('cert-camera');

            if (!name) {
                alert('Please enter a certification name');
                return;
            }

            const saveBtn = document.querySelector('.modal-footer .btn-primary');
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            saveBtn.disabled = true;

            try {
                let fileURL = null;

                // Upload file if provided
                const file = (fileInput && fileInput.files[0]) || (cameraInput && cameraInput.files[0]);
                if (file) {
                    // Convert to base64
                    const base64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(file);
                    });

                    // Initialize storage helper if needed
                    if (!firebaseStorageHelper.isInitialized) {
                        firebaseStorageHelper.initialize();
                    }

                    const uploadResult = await firebaseStorageHelper.uploadImage(
                        base64,
                        'employees/certifications',
                        employeeId + '_' + Date.now()
                    );

                    if (uploadResult && uploadResult.url) {
                        fileURL = uploadResult.url;
                    }
                }

                // Create certification object
                const certification = {
                    name,
                    issuedBy: issuedBy || null,
                    issueDate: issueDate || null,
                    expirationDate: expirationDate || null,
                    certNumber: certNumber || null,
                    fileURL,
                    addedAt: new Date().toISOString()
                };

                // Find employee and add certification
                const emp = employees.find(e => e.id === employeeId);
                if (emp) {
                    if (!emp.certifications) emp.certifications = [];
                    emp.certifications.push(certification);

                    // Save to Firebase
                    if (firebaseEmployeeManager.isInitialized) {
                        await firebaseEmployeeManager.updateEmployee(employeeId, {
                            certifications: emp.certifications
                        });
                    }
                }

                // Refresh the employee view
                viewEmployee(employeeId);

            } catch (error) {
                console.error('Error saving certification:', error);
                alert('Error saving certification: ' + error.message);
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
            }
        }

        async function deleteCertification(employeeId, certIndex) {
            if (!confirm('Are you sure you want to delete this certification?')) return;

            try {
                const emp = employees.find(e => e.id === employeeId);
                if (emp && emp.certifications) {
                    emp.certifications.splice(certIndex, 1);

                    // Save to Firebase
                    if (firebaseEmployeeManager.isInitialized) {
                        await firebaseEmployeeManager.updateEmployee(employeeId, {
                            certifications: emp.certifications
                        });
                    }

                    // Refresh the employee view
                    viewEmployee(employeeId);
                }
            } catch (error) {
                console.error('Error deleting certification:', error);
                alert('Error deleting certification: ' + error.message);
            }
        }

        /**
         * Get current user info (simulated - would come from Firebase Auth in production)
         */
        function getCurrentUser() {
            // Get user from authentication manager
            const user = authManager.getCurrentUser();
            
            if (user) {
                return user;
            }
            
            // Fallback if not authenticated (should redirect to login)
            return {
                id: null,
                name: 'Unknown',
                email: 'unknown@vsu.com',
                role: 'employee'
            };
        }

        /**
         * Check if current user has permission for an action
         */
        function checkPermission(permission) {
            const currentUser = getCurrentUser();
            const permissions = window.ROLE_PERMISSIONS?.[currentUser.role];
            
            if (!permissions) {
                console.warn('No permissions found for role:', currentUser.role);
                return false;
            }

            return permissions[permission] === true;
        }

        /**
         * Show permission denied message
         */
        function showPermissionDenied(action = 'perform this action') {
            const currentUser = getCurrentUser();
            const roleLabel = window.ROLE_PERMISSIONS?.[currentUser.role]?.label || currentUser.role;
            
            alert(`❌ Permission Denied\n\nYour role (${roleLabel}) does not have permission to ${action}.\n\nPlease contact an Administrator for assistance.`);
        }

        /**
         * Filter navigation menu based on user role
         * Show/hide menu items that user doesn't have access to
         */
        function filterNavigationByRole() {
            const user = getCurrentUser();

            // If no user, don't filter navigation (show all for debugging or show nothing)
            if (!user) {
                console.warn('⚠️ filterNavigationByRole: No user found, skipping navigation filter');
                return;
            }

            // Super admin bypass - carlos@calidevs.com sees everything
            const userEmail = (user.email || user.authEmail || '').toLowerCase();
            const isSuperAdmin = userEmail === 'carlos@calidevs.com';

            if (isSuperAdmin) {
                console.log('👑 Super Admin detected - showing all navigation items');
                // Show all nav items for super admin
                document.querySelectorAll('.nav-section a, .nav-section div').forEach(item => {
                    if (!item.classList.contains('nav-label')) {
                        item.style.display = '';
                    }
                });
                return;
            }

            const userRole = user.role || 'employee';
            const userPermissions = window.ROLE_PERMISSIONS[userRole] || window.ROLE_PERMISSIONS['employee'];
            const allowedPages = userPermissions.pages || [];

            // Hide all nav items first (except super-admin-nav which has its own visibility logic)
            document.querySelectorAll('.nav-section a, .nav-section div').forEach(item => {
                if (!item.classList.contains('nav-label') && !item.closest('#super-admin-nav') && item.id !== 'super-admin-nav') {
                    item.style.display = 'none';
                }
            });

            // Always show Celeste AI (it's available to all roles if in their permissions)
            if (allowedPages.includes('celesteai')) {
                const celesteItem = document.querySelector('.nav-item[data-page="celesteai"]');
                if (celesteItem) {
                    celesteItem.style.display = '';
                }
            }

            // Show only allowed pages using data-page attribute
            allowedPages.forEach(page => {
                document.querySelectorAll(`.nav-item[data-page="${page}"], .nav-dropdown-item[data-page="${page}"]`).forEach(item => {
                    item.style.display = '';

                    // Show parent div if it's a nav-item
                    if (item.classList.contains('nav-item') && item.parentElement.tagName === 'DIV') {
                        item.parentElement.style.display = '';
                    }

                    // If it's a dropdown item, show parent dropdown and parent nav-item
                    if (item.classList.contains('nav-dropdown-item')) {
                        const dropdownContainer = item.closest('.nav-dropdown');
                        if (dropdownContainer) {
                            dropdownContainer.style.display = '';
                            // Find and show the parent nav-item that triggers this dropdown
                            const parentNavItem = dropdownContainer.previousElementSibling;
                            if (parentNavItem && parentNavItem.classList.contains('nav-item')) {
                                parentNavItem.style.display = '';
                                if (parentNavItem.parentElement.tagName === 'DIV') {
                                    parentNavItem.parentElement.style.display = '';
                                }
                            }
                        }
                    }
                });
            });

            // Show parent divs that contain visible nav-items
            document.querySelectorAll('.nav-section > div').forEach(div => {
                const hasVisibleItems = div.querySelector('.nav-item:not([style*="display: none"])');
                if (hasVisibleItems) {
                    div.style.display = '';
                }
            });

            // Ensure only current page has active class
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.page === currentPage) {
                    item.classList.add('active');
                }
            });
        }

        // Expose filterNavigationByRole globally
        window.filterNavigationByRole = filterNavigationByRole;

        function editEmployee(id) {
            // Check permission
            if (!checkPermission('canEditAllEmployees')) {
                showPermissionDenied('edit employees');
                return;
            }

            // Find employee by id or firestoreId
            const emp = employees.find(e => e.id === id || e.firestoreId === id);
            if (!emp) {
                alert('Employee not found');
                return;
            }

            // Store the employee being edited (using the global variable declared in openModal section)
            editingEmployeeId = emp.firestoreId || emp.id;

            // Open modal with edit form
            openModal('edit-employee', emp);
        }

        /**
         * Save edited employee to Firebase
         */
        async function saveEditedEmployee() {
            if (!editingEmployeeId) {
                alert('No employee selected for editing');
                return;
            }
            const employeeId = editingEmployeeId;

            // Get the current employee data
            const currentEmployee = employees.find(e => e.id === employeeId || e.firestoreId === employeeId);
            if (!currentEmployee) {
                alert('Employee not found');
                return;
            }

            // Get current name parts for fallback
            const currentNameParts = (currentEmployee.name || '').split(' ');
            const currentFirstName = currentNameParts[0] || '';
            const currentLastName = currentNameParts.slice(1).join(' ') || '';

            const firstName = document.getElementById('edit-emp-first-name').value.trim() || currentFirstName;
            const lastName = document.getElementById('edit-emp-last-name').value.trim() || currentLastName;
            const authEmail = document.getElementById('edit-emp-email').value.trim() || currentEmployee.authEmail;
            const phone = document.getElementById('edit-emp-phone').value.trim() || currentEmployee.phone;
            const password = document.getElementById('edit-emp-password').value.trim();
            const confirmPassword = document.getElementById('edit-emp-confirm-password').value.trim();
            const role = document.getElementById('edit-emp-role').value || currentEmployee.role;
            const employeeType = document.getElementById('edit-emp-employee-type')?.value || currentEmployee.employeeType || 'employee';
            const store = document.getElementById('edit-emp-store').value || currentEmployee.store;
            const status = document.getElementById('edit-emp-status').value || currentEmployee.status;
            const hireDate = document.getElementById('edit-emp-hire-date').value || currentEmployee.hireDate;
            const emergencyName = document.getElementById('edit-emp-emergency-name').value.trim();
            const emergencyPhone = document.getElementById('edit-emp-emergency-phone').value.trim();
            const medicalConditions = document.getElementById('edit-emp-medical-conditions').value.trim();

            // Check if status is changing from active to inactive - trigger offboarding
            if (currentEmployee.status === 'active' && status === 'inactive') {
                // Store the pending update data temporarily
                window.pendingOffboardingData = {
                    employeeId,
                    currentEmployee,
                    updatedData: {
                        firstName, lastName, authEmail, phone, password, confirmPassword,
                        role, employeeType, store, status, hireDate, emergencyName, emergencyPhone, medicalConditions
                    }
                };
                // Close current modal and open offboarding modal
                closeModal();
                setTimeout(() => {
                    openModal('offboarding', currentEmployee);
                }, 100);
                return;
            }

            // If new password is provided, validate it
            if (password && !confirmPassword) {
                alert('Please confirm the new password');
                return;
            }

            if (password && password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            if (password && password.length < 6) {
                alert('Password must be at least 6 characters long');
                return;
            }

            const updatedData = {
                name: `${firstName} ${lastName}`,
                initials: `${firstName[0]}${lastName[0]}`.toUpperCase(),
                authEmail,
                phone,
                role,
                employeeType,
                store,
                status,
                hireDate: hireDate || new Date().toISOString().split('T')[0],
                emergencyContact: combineEmergencyContact(emergencyName, emergencyPhone) || currentEmployee.emergencyContact || 'Not provided',
                medicalConditions: medicalConditions || currentEmployee.medicalConditions || 'None'
            };

            // Only include password if it's being changed
            // Note: This will trigger a password reset email to be sent to the employee
            let passwordResetRequested = false;
            if (password) {
                updatedData.password = password;
                passwordResetRequested = true;
            }

            // Show saving indicator
            const saveBtn = document.querySelector('.modal-footer .btn-primary');
            const originalText = saveBtn ? saveBtn.innerHTML : '';
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                saveBtn.disabled = true;
            }

            try {
                // Update in Firebase
                if (firebaseEmployeeManager.isInitialized) {
                    // Handle profile photo upload/removal
                    const photoPreview = document.getElementById('edit-emp-photo-preview');
                    const photoInput = document.getElementById('edit-emp-photo');
                    const hasFilePhoto = photoInput && photoInput.files && photoInput.files[0];
                    const hasCapturedPhoto = window.capturedEmployeePhoto && window.capturedPhotoTarget === 'edit-emp-photo';

                    // Check if photo was removed
                    if (photoPreview && photoPreview.getAttribute('data-removed') === 'true') {
                        // Delete old photo from storage if exists
                        if (currentEmployee.photoPath) {
                            try {
                                await firebaseStorageHelper.deleteFile(currentEmployee.photoPath);
                            } catch (err) {
                                console.error('Error deleting old photo:', err);
                            }
                        }
                        updatedData.photo = null;
                        updatedData.photoPath = null;
                    }
                    // Check if new photo was uploaded (from file or camera)
                    else if (hasFilePhoto || hasCapturedPhoto) {
                        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading photo...';
                        try {
                            let photoBase64;
                            if (hasCapturedPhoto) {
                                photoBase64 = window.capturedEmployeePhoto;
                                // Clear captured photo
                                window.capturedEmployeePhoto = null;
                                window.capturedPhotoTarget = null;
                            } else {
                                const photoFile = photoInput.files[0];
                                const reader = new FileReader();
                                photoBase64 = await new Promise((resolve) => {
                                    reader.onload = (e) => resolve(e.target.result);
                                    reader.readAsDataURL(photoFile);
                                });
                            }

                            // Delete old photo from storage if exists
                            if (currentEmployee.photoPath) {
                                try {
                                    await firebaseStorageHelper.deleteFile(currentEmployee.photoPath);
                                } catch (err) {
                                    console.error('Error deleting old photo:', err);
                                }
                            }

                            // Initialize storage helper if needed
                            if (!firebaseStorageHelper.isInitialized) {
                                firebaseStorageHelper.initialize();
                            }

                            const uploadResult = await firebaseStorageHelper.uploadImage(
                                photoBase64,
                                'employees/photos',
                                employeeId,
                                500,  // maxSizeKB
                                false // showOverlay - we're showing our own spinner
                            );

                            if (uploadResult && uploadResult.url) {
                                updatedData.photo = uploadResult.url;
                                updatedData.photoPath = uploadResult.path;
                                console.log('Employee photo uploaded to Firebase Storage:', uploadResult.url);
                            }
                        } catch (photoError) {
                            console.error('Error uploading employee photo:', photoError);
                            showNotification('Error uploading photo', 'warning');
                        }
                    }

                    const success = await firebaseEmployeeManager.updateEmployee(employeeId, updatedData);
                    if (!success) {
                        throw new Error('Failed to update in Firebase');
                    }

                    // Upload new paperwork files if any
                    if (editEmployeePaperworkFiles.length > 0) {
                        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading documents...';

                        for (const file of editEmployeePaperworkFiles) {
                            try {
                                await firebaseEmployeeManager.uploadPaperwork(employeeId, file, 'Document');
                            } catch (uploadError) {
                                console.error('Error uploading file:', file.name, uploadError);
                                // Continue with other files even if one fails
                            }
                        }

                        // Clear the selected files after upload
                        editEmployeePaperworkFiles = [];
                    }
                }

                // Reload employee data to get latest paperwork
                let updatedEmployee = updatedData;
                if (firebaseEmployeeManager.isInitialized) {
                    const freshData = await firebaseEmployeeManager.getEmployee(employeeId);
                    if (freshData) {
                        updatedEmployee = freshData;
                    }
                }

                // Update local array
                const index = employees.findIndex(e => e.id === employeeId || e.firestoreId === employeeId);
                if (index !== -1) {
                    employees[index] = {
                        ...employees[index],
                        ...updatedEmployee
                    };
                }

                // Clear editing state
                editingEmployeeId = null;

                // Log activity
                try {
                    if (typeof logActivity === 'function') {
                        await logActivity(ACTIVITY_TYPES.UPDATE, {
                            message: `Updated employee: ${updatedData.name}`,
                            employeeName: updatedData.name,
                            changes: passwordResetRequested ? 'Password reset included' : 'Profile updated'
                        }, 'employee', employeeId);
                    }
                } catch (logError) {
                    console.warn('⚠️ Failed to log employee update:', logError);
                }

                closeModal();
                renderPage(currentPage);

                // Show appropriate notification based on whether password reset was requested
                if (passwordResetRequested) {
                    showNotification('Employee updated! A password reset email has been sent to the employee.', 'success');
                } else {
                    showNotification('Employee updated successfully!', 'success');
                }
            } catch (error) {
                console.error('Error updating employee:', error);
                alert('Error updating employee. Please try again.');

                if (saveBtn) {
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                }
            }
        }

        // Offboarding Functions
        function cancelOffboarding() {
            window.pendingOffboardingData = null;
            closeModal();
            showNotification('Offboarding cancelled. Employee status unchanged.', 'info');
        }

        async function confirmOffboarding() {
            const pendingData = window.pendingOffboardingData;
            if (!pendingData) {
                alert('No pending offboarding data found');
                closeModal();
                return;
            }

            // Validate required fields
            const reason = document.getElementById('offboard-reason').value;
            const lastDay = document.getElementById('offboard-last-day').value;
            const receivedBy = document.getElementById('offboard-received-by').value.trim();
            const otherReason = document.getElementById('offboard-other-reason')?.value || '';

            if (!reason) {
                alert('Please select a reason for leaving');
                return;
            }

            if (reason === 'other' && !otherReason.trim()) {
                alert('Please specify the reason for leaving');
                return;
            }

            if (!lastDay) {
                alert('Please enter the last day worked');
                return;
            }

            if (!receivedBy) {
                alert('Please enter who received the items');
                return;
            }

            // Collect offboarding data
            const offboardingData = {
                reason: reason,
                reasonText: reason === 'other' ? otherReason : getOffboardingReasonText(reason),
                lastDayWorked: lastDay,
                keysReturned: document.getElementById('offboard-keys').checked,
                receivedBy: receivedBy,
                notes: document.getElementById('offboard-notes').value.trim(),
                offboardingDate: new Date().toISOString(),
                offboardingBy: getCurrentUser().name || 'Admin'
            };

            // Show saving indicator
            const saveBtn = document.querySelector('.modal-footer .btn-primary');
            const originalText = saveBtn ? saveBtn.innerHTML : '';
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                saveBtn.disabled = true;
            }

            try {
                const { employeeId, currentEmployee, updatedData } = pendingData;

                // Build the full update object
                const fullUpdatedData = {
                    name: `${updatedData.firstName} ${updatedData.lastName}`,
                    initials: `${updatedData.firstName[0]}${updatedData.lastName[0]}`.toUpperCase(),
                    authEmail: updatedData.authEmail || currentEmployee.authEmail,
                    phone: updatedData.phone,
                    role: updatedData.role,
                    employeeType: updatedData.employeeType,
                    store: updatedData.store,
                    status: 'inactive',
                    hireDate: updatedData.hireDate || new Date().toISOString().split('T')[0],
                    emergencyContact: combineEmergencyContact(updatedData.emergencyName, updatedData.emergencyPhone) || currentEmployee.emergencyContact || 'Not provided',
                    allergies: updatedData.allergies || currentEmployee.allergies || 'None',
                    offboarding: offboardingData
                };

                // Only include password if it's being changed
                if (updatedData.password) {
                    fullUpdatedData.password = updatedData.password;
                }

                // Update in Firebase
                if (firebaseEmployeeManager.isInitialized) {
                    const success = await firebaseEmployeeManager.updateEmployee(employeeId, fullUpdatedData);
                    if (!success) {
                        throw new Error('Failed to update in Firebase');
                    }
                }

                // Update local array
                const index = employees.findIndex(e => e.id === employeeId || e.firestoreId === employeeId);
                if (index !== -1) {
                    employees[index] = {
                        ...employees[index],
                        ...fullUpdatedData
                    };
                }

                // Clear pending data
                window.pendingOffboardingData = null;
                editingEmployeeId = null;

                // Log activity
                try {
                    if (typeof logActivity === 'function') {
                        await logActivity(ACTIVITY_TYPES.DELETE, {
                            message: `Offboarded employee: ${currentEmployee.name}`,
                            employeeName: currentEmployee.name,
                            reason: offboardingData.reasonText,
                            lastDayWorked: offboardingData.lastDayWorked
                        }, 'employee', employeeId);
                    }
                } catch (logError) {
                    console.warn('⚠️ Failed to log employee offboarding:', logError);
                }

                closeModal();
                renderPage(currentPage);
                updateEmployeeCountBadge();
                showNotification(`${currentEmployee.name} has been deactivated and offboarding documented.`, 'success');
            } catch (error) {
                console.error('Error during offboarding:', error);
                alert('Error completing offboarding. Please try again.');

                if (saveBtn) {
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                }
            }
        }

        function getOffboardingReasonText(reason) {
            const reasons = {
                'resignation': 'Resignation',
                'termination': 'Termination',
                'contract_end': 'End of Contract',
                'abandonment': 'Job Abandonment',
                'mutual': 'Mutual Agreement',
                'other': 'Other'
            };
            return reasons[reason] || reason;
        }

        function deleteEmployee(id) {
            // Check permission
            if (!checkPermission('canDeleteEmployees')) {
                showPermissionDenied('delete employees');
                return;
            }

            // Find employee by id or firestoreId
            const emp = employees.find(e => e.id === id || e.firestoreId === id);
            if (!emp) return;

            // Store pending offboarding data and open offboarding modal
            window.pendingOffboardingData = {
                employeeId: emp.firestoreId || emp.id,
                currentEmployee: emp,
                updatedData: {
                    firstName: emp.name?.split(' ')[0] || '',
                    lastName: emp.name?.split(' ').slice(1).join(' ') || '',
                    authEmail: emp.authEmail,
                    phone: emp.phone,
                    role: emp.role,
                    employeeType: emp.employeeType || 'employee',
                    store: emp.store,
                    status: 'inactive',
                    hireDate: emp.hireDate,
                    emergencyName: emp.emergencyContact?.split(' - ')[0] || '',
                    emergencyPhone: emp.emergencyContact?.split(' - ')[1] || '',
                    allergies: emp.allergies
                }
            };

            // Open offboarding modal
            openModal('offboarding', emp);
        }

        function activateEmployee(id) {
            // Check permission
            if (!checkPermission('canEditAllEmployees')) {
                showPermissionDenied('activate employees');
                return;
            }

            // Find employee by id or firestoreId
            const emp = employees.find(e => e.id === id || e.firestoreId === id);
            if (!emp) return;

            showConfirmModal({
                title: 'Activate Employee',
                message: `Are you sure you want to activate "${emp.name}"? The employee status will be changed to active.`,
                confirmText: 'Activate',
                type: 'info',
                onConfirm: async () => {
                    try {
                        // Mark as active in Firebase
                        const firestoreId = emp.firestoreId || emp.id;
                        if (firebaseEmployeeManager.isInitialized) {
                            const updated = await firebaseEmployeeManager.updateEmployee(firestoreId, { status: 'active' });
                            if (!updated) {
                                throw new Error('Failed to activate employee');
                            }
                        }

                        // Update in local array
                        const empIndex = employees.findIndex(e => e.id === id || e.firestoreId === id);
                        if (empIndex !== -1) {
                            employees[empIndex].status = 'active';
                        }

                        // Update employee count badge
                        updateEmployeeCountBadge();

                        // Log activity
                        try {
                            if (typeof logActivity === 'function') {
                                await logActivity(ACTIVITY_TYPES.UPDATE, {
                                    message: `Activated employee: ${emp.name}`,
                                    employeeName: emp.name,
                                    previousStatus: 'inactive',
                                    newStatus: 'active'
                                }, 'employee', firestoreId);
                            }
                        } catch (logError) {
                            console.warn('⚠️ Failed to log employee activation:', logError);
                        }

                        // Re-render page
                        renderPage(currentPage);
                        showNotification('Employee activated successfully', 'success');
                    } catch (error) {
                        console.error('Error activating employee:', error);
                    }
                }
            });
        }

        function filterEmployees() {
            const search = document.getElementById('employee-search').value.toLowerCase();
            const store = document.getElementById('store-filter').value;
            const status = document.getElementById('status-filter').value;

            // Always exclude inactive employees from main view - they only show in Inactive modal
            const filtered = employees.filter(emp => {
                if (emp.status === 'inactive') return false; // Never show inactive in main view
                const matchSearch = emp.name.toLowerCase().includes(search) || emp.role.toLowerCase().includes(search);
                const matchStore = !store || emp.store === store;
                const matchStatus = !status || emp.status === status;
                return matchSearch && matchStore && matchStatus;
            });

            const grid = document.getElementById('employees-grid');
            if (employeeViewMode === 'list') {
                grid.className = 'employees-list';
                grid.innerHTML = `
                    <div class="card" style="overflow-x: auto;">
                        <table class="data-table" style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                            <thead>
                                <tr style="background: var(--bg-secondary); border-bottom: 2px solid var(--border-color);">
                                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: var(--text-primary); width: 22%;">Employee</th>
                                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: var(--text-primary); width: 14%;">Role</th>
                                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: var(--text-primary); width: 12%;">Store</th>
                                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: var(--text-primary); width: 10%;">Type</th>
                                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: var(--text-primary); width: 10%;">Status</th>
                                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: var(--text-primary); width: 14%;">Phone</th>
                                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: var(--text-primary); width: 18%;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filtered.map(emp => renderEmployeeListRow(emp)).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                grid.className = 'employees-grid';
                grid.innerHTML = filtered.map(emp => renderEmployeeCard(emp)).join('');
            }
        }

        /**
         * Open modal showing inactive employees with their offboarding details
         */
        function openInactiveEmployeesModal() {
            const inactiveEmployees = employees.filter(emp => emp.status === 'inactive');
            openModal('inactive-employees', inactiveEmployees);
        }

        /**
         * View offboarding details for a specific employee
         */
        function viewOffboardingDetails(employeeId) {
            const emp = employees.find(e => e.id === employeeId || e.firestoreId === employeeId);
            if (!emp || !emp.offboarding) {
                showNotification('No offboarding information available', 'warning');
                return;
            }
            openModal('offboarding-details', emp);
        }

        /**
         * Confirm and permanently delete an employee
         */
        function confirmDeleteEmployee(employeeId, employeeName) {
            showConfirmModal({
                title: 'Delete Employee',
                message: `Are you sure you want to permanently delete "${employeeName}"? This action cannot be undone.`,
                confirmText: 'Delete',
                type: 'danger',
                onConfirm: async () => {
                    try {
                        // Delete from Firebase if initialized
                        if (firebaseEmployeeManager && firebaseEmployeeManager.isInitialized) {
                            const success = await firebaseEmployeeManager.deleteEmployee(employeeId);
                            if (success) {
                                // Remove from local array
                                employees = employees.filter(e => e.firestoreId !== employeeId && e.id !== employeeId);
                                showNotification(`${employeeName} has been permanently deleted.`, 'success');
                                closeModal();
                                renderEmployees();
                                return;
                            } else {
                                showNotification('Failed to delete employee from Firebase', 'error');
                                return;
                            }
                        }

                        // Fallback to local deletion if no Firebase
                        employees = employees.filter(e => e.firestoreId !== employeeId && e.id !== employeeId);
                        showNotification(`${employeeName} has been deleted locally.`, 'success');
                        closeModal();
                        renderEmployees();

                    } catch (error) {
                        console.error('Error deleting employee:', error);
                        showNotification('Error deleting employee. Please try again.', 'error');
                    }
                }
            });
        }

        /**
         * View employee paperwork/documents
         */
        async function viewEmployeePaperwork(employeeId) {
            const emp = employees.find(e => e.id === employeeId || e.firestoreId === employeeId);
            if (!emp) {
                showNotification('Employee not found', 'error');
                return;
            }

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            // Show loading state
            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2>Employee Documents</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; padding: 40px;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--accent-primary); margin-bottom: 16px;"></i>
                        <p style="color: var(--text-muted);">Loading documents...</p>
                    </div>
                </div>
            `;
            modal.classList.add('active');

            try {
                // Get paperwork from Firebase
                let paperwork = [];
                if (firebaseEmployeeManager.isInitialized) {
                    paperwork = await firebaseEmployeeManager.getPaperwork(employeeId);
                }

                modalContent.innerHTML = `
                    <div class="modal-header">
                        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                            <div class="employee-avatar-lg ${emp.color}">${emp.initials}</div>
                            <div>
                                <h2 style="margin: 0; font-size: 20px;">${emp.name}</h2>
                                <p style="margin: 4px 0 0 0; color: var(--text-muted); font-size: 13px;">${emp.role} @ ${emp.store}</p>
                            </div>
                        </div>
                        <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <div style="margin-bottom: 24px;">
                            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-file-contract" style="color: var(--accent-primary);"></i>
                                Employee Paperwork & Documents
                            </h3>
                            <p style="color: var(--text-muted); font-size: 13px; margin: 0;">
                                Registered documents: ${paperwork.length}
                            </p>
                        </div>

                        ${paperwork && paperwork.length > 0 ? `
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                ${paperwork.map((doc, index) => `
                                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: var(--surface-secondary); border-radius: 8px; border: 1px solid var(--border-color); transition: all 0.2s;">
                                        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                                            <div style="width: 48px; height: 48px; background: ${getDocumentColor(doc.fileType)}; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                                <i class="fas ${getFileIcon(doc.fileType)}" style="color: white; font-size: 20px;"></i>
                                            </div>
                                            <div style="flex: 1;">
                                                <div style="font-weight: 600; font-size: 14px; color: var(--text-primary); margin-bottom: 4px;">
                                                    ${doc.fileName}
                                                </div>
                                                <div style="display: flex; gap: 12px; font-size: 12px; color: var(--text-muted);">
                                                    <span>${doc.documentType || 'Document'}</span>
                                                    <span>•</span>
                                                    <span>${formatFileSize(doc.fileSize)}</span>
                                                    <span>•</span>
                                                    <span>Uploaded ${formatDate(doc.uploadedAt?.toDate ? doc.uploadedAt.toDate() : doc.uploadedAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style="display: flex; gap: 8px;">
                                            <button class="btn-icon" onclick="showDocumentPreview({ url: '${doc.downloadURL}', fileName: '${doc.fileName}', fileType: '${doc.fileType || ''}', fileSize: ${doc.fileSize || 0}, documentType: '${doc.documentType || 'Document'}', uploadedAt: '${doc.uploadedAt?.toDate ? doc.uploadedAt.toDate().toISOString() : doc.uploadedAt}' })" title="View Document">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div style="text-align: center; padding: 40px; background: var(--bg-secondary); border-radius: 8px;">
                                <i class="fas fa-inbox" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px; display: block;"></i>
                                <h3 style="color: var(--text-muted); font-size: 16px; margin-bottom: 8px;">No Documents Yet</h3>
                                <p style="color: var(--text-muted); font-size: 13px; margin: 0;">No paperwork has been uploaded for this employee yet.</p>
                            </div>
                        `}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Close</button>
                    </div>
                `;
            } catch (error) {
                console.error('Error loading documents:', error);
                modalContent.innerHTML = `
                    <div class="modal-header">
                        <h2>Employee Documents</h2>
                        <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <div style="text-align: center; padding: 40px;">
                            <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #ef4444; margin-bottom: 16px;"></i>
                            <p>Error loading documents</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Close</button>
                    </div>
                `;
            }
        }

        // Employee photo preview functions

        // Camera modal for taking photos
        function openCameraModal(targetPreviewId, targetInputId) {
            // Remove existing camera modal if any
            const existing = document.getElementById('camera-modal');
            if (existing) existing.remove();

            const modal = document.createElement('div');
            modal.id = 'camera-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                padding: 20px;
                box-sizing: border-box;
            `;
            modal.innerHTML = `
                <div style="position: absolute; top: 20px; right: 20px;">
                    <button onclick="closeCameraModal()" style="background: none; border: none; color: white; font-size: 28px; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="color: white; font-size: 18px; margin-bottom: 15px; text-align: center;">
                    <i class="fas fa-camera"></i> Take Photo
                </div>
                <div style="position: relative; max-width: 500px; width: 100%;">
                    <video id="camera-video" autoplay playsinline style="width: 100%; border-radius: 12px; transform: scaleX(-1);"></video>
                    <canvas id="camera-canvas" style="display: none;"></canvas>
                </div>
                <div style="margin-top: 20px; display: flex; gap: 16px;">
                    <button onclick="capturePhoto('${targetPreviewId}', '${targetInputId}')" style="background: var(--accent-primary); color: white; border: none; padding: 16px 32px; border-radius: 50px; font-size: 16px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-camera"></i> Capture
                    </button>
                    <button onclick="switchCamera()" style="background: var(--bg-secondary); color: white; border: none; padding: 16px 20px; border-radius: 50px; font-size: 16px; cursor: pointer;">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                <div style="color: var(--text-muted); font-size: 12px; margin-top: 12px;">
                    Click capture or press Space to take photo
                </div>
            `;

            document.body.appendChild(modal);

            // Start camera
            window.currentCameraFacing = 'user';
            startCamera();

            // Handle keyboard
            const handleKeydown = (e) => {
                if (e.code === 'Space' || e.key === ' ') {
                    e.preventDefault();
                    capturePhoto(targetPreviewId, targetInputId);
                } else if (e.key === 'Escape') {
                    closeCameraModal();
                }
            };
            document.addEventListener('keydown', handleKeydown);
            modal.setAttribute('data-keyhandler', 'true');
            window.cameraKeyHandler = handleKeydown;
        }

        async function startCamera() {
            try {
                const video = document.getElementById('camera-video');
                if (!video) return;

                // Stop any existing stream
                if (window.cameraStream) {
                    window.cameraStream.getTracks().forEach(track => track.stop());
                }

                const constraints = {
                    video: {
                        facingMode: window.currentCameraFacing || 'user',
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    }
                };

                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                window.cameraStream = stream;
                video.srcObject = stream;
            } catch (err) {
                console.error('Error accessing camera:', err);
                alert('Could not access camera. Please make sure you have granted camera permissions.');
                closeCameraModal();
            }
        }

        function switchCamera() {
            window.currentCameraFacing = window.currentCameraFacing === 'user' ? 'environment' : 'user';
            startCamera();
        }

        function capturePhoto(targetPreviewId, targetInputId) {
            const video = document.getElementById('camera-video');
            const canvas = document.getElementById('camera-canvas');
            if (!video || !canvas) return;

            // Set canvas size to video size
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw video frame to canvas (flip horizontally to match preview)
            const ctx = canvas.getContext('2d');
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0);

            // Get image data
            const imageData = canvas.toDataURL('image/jpeg', 0.8);

            // Update preview
            const preview = document.getElementById(targetPreviewId);
            if (preview) {
                preview.innerHTML = `<img src="${imageData}" style="width: 100%; height: 100%; object-fit: cover;">`;
                preview.style.border = '3px solid var(--accent-primary)';
                if (targetPreviewId.includes('edit')) {
                    preview.setAttribute('data-new-photo', 'true');
                }
            }

            // Store image data for later upload
            window.capturedEmployeePhoto = imageData;
            window.capturedPhotoTarget = targetInputId;

            closeCameraModal();
        }

        function closeCameraModal() {
            // Stop camera stream
            if (window.cameraStream) {
                window.cameraStream.getTracks().forEach(track => track.stop());
                window.cameraStream = null;
            }

            // Remove keyboard handler
            if (window.cameraKeyHandler) {
                document.removeEventListener('keydown', window.cameraKeyHandler);
                window.cameraKeyHandler = null;
            }

            // Remove modal
            const modal = document.getElementById('camera-modal');
            if (modal) modal.remove();
        }

        function previewEmployeePhoto(input) {
            const preview = document.getElementById('emp-photo-preview');
            if (!preview) return;

            if (input.files && input.files[0]) {
                const file = input.files[0];
                if (file.size > 5 * 1024 * 1024) {
                    alert('Photo must be less than 5MB');
                    input.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    preview.style.border = '3px solid var(--accent-primary)';
                };
                reader.readAsDataURL(file);
            }
        }

        function removeEmployeePhoto() {
            const preview = document.getElementById('emp-photo-preview');
            const input = document.getElementById('emp-photo');
            if (preview) {
                preview.innerHTML = `<i class="fas fa-user" style="font-size: 40px; color: var(--text-muted);"></i>`;
                preview.style.border = '3px dashed var(--border-color)';
            }
            if (input) {
                input.value = '';
            }
            // Clear captured photo from camera
            if (window.capturedPhotoTarget === 'emp-photo') {
                window.capturedEmployeePhoto = null;
                window.capturedPhotoTarget = null;
            }
        }

        function togglePasswordVisibility(fieldId, iconId) {
            const field = document.getElementById(fieldId);
            const icon = document.getElementById(iconId);
            if (field && icon) {
                if (field.type === 'password') {
                    field.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    field.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        }

        function previewEditEmployeePhoto(input) {
            const preview = document.getElementById('edit-emp-photo-preview');
            if (!preview) return;

            if (input.files && input.files[0]) {
                const file = input.files[0];
                if (file.size > 5 * 1024 * 1024) {
                    alert('Photo must be less than 5MB');
                    input.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    preview.style.border = '3px solid var(--accent-primary)';
                    preview.setAttribute('data-new-photo', 'true');
                };
                reader.readAsDataURL(file);
            }
        }

        function removeEditEmployeePhoto() {
            const preview = document.getElementById('edit-emp-photo-preview');
            const input = document.getElementById('edit-emp-photo');
            if (preview) {
                preview.innerHTML = `<i class="fas fa-user" style="font-size: 40px; color: var(--text-muted);"></i>`;
                preview.style.border = '3px dashed var(--border-color)';
                preview.setAttribute('data-removed', 'true');
            }
            if (input) {
                input.value = '';
            }
            // Clear captured photo from camera
            if (window.capturedPhotoTarget === 'edit-emp-photo') {
                window.capturedEmployeePhoto = null;
                window.capturedPhotoTarget = null;
            }
        }

        // Save functions
        async function saveEmployee() {
            const firstName = document.getElementById('emp-first-name').value.trim();
            const lastName = document.getElementById('emp-last-name').value.trim();
            const email = document.getElementById('emp-email').value.trim();
            const phone = document.getElementById('emp-phone').value.trim();
            const password = document.getElementById('emp-password').value.trim();
            const confirmPassword = document.getElementById('emp-confirm-password').value.trim();
            const role = document.getElementById('emp-role').value;
            const employeeType = document.getElementById('emp-employee-type')?.value || 'employee';
            const store = document.getElementById('emp-store').value;
            const hireDate = document.getElementById('emp-hire-date').value;
            const emergencyName = document.getElementById('emp-emergency-name').value.trim();
            const emergencyPhone = document.getElementById('emp-emergency-phone').value.trim();
            const medicalConditions = document.getElementById('emp-medical-conditions').value.trim();

            if (!firstName || !lastName || !email || !phone || !role || !store || !password) {
                alert('Please fill in all required fields');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            if (password.length < 6) {
                alert('Password must be at least 6 characters long');
                return;
            }

            const newEmployee = {
                name: `${firstName} ${lastName}`,
                initials: `${firstName[0]}${lastName[0]}`.toUpperCase(),
                email,
                phone,
                role,                                    // Job position (Store Manager, Sales Associate, etc)
                employeeType: employeeType,              // Permission level (admin, manager, employee)
                store,
                hireDate: hireDate || new Date().toISOString().split('T')[0],
                emergencyContact: combineEmergencyContact(emergencyName, emergencyPhone),
                medicalConditions: medicalConditions || 'None',
                status: 'active',
                color: ['a', 'b', 'c', 'd', 'e'][Math.floor(Math.random() * 5)]
            };

            // Show saving indicator
            const saveBtn = document.querySelector('.modal-footer .btn-primary');
            const originalText = saveBtn ? saveBtn.innerHTML : '';
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                saveBtn.disabled = true;
            }

            try {
                // Initialize Firebase if needed
                if (!firebaseEmployeeManager.isInitialized) {
                    await firebaseEmployeeManager.initialize();
                }

                // Save to Firebase
                if (firebaseEmployeeManager.isInitialized) {
                    const firestoreId = await firebaseEmployeeManager.addEmployee(newEmployee, email, password);
                    if (firestoreId) {
                        newEmployee.id = firestoreId;
                        newEmployee.firestoreId = firestoreId;
                        console.log('Employee saved to Firebase:', firestoreId);

                        // Upload profile photo if provided (check file input or captured photo from camera)
                        const photoInput = document.getElementById('emp-photo');
                        const hasFilePhoto = photoInput && photoInput.files && photoInput.files[0];
                        const hasCapturedPhoto = window.capturedEmployeePhoto && window.capturedPhotoTarget === 'emp-photo';

                        if (hasFilePhoto || hasCapturedPhoto) {
                            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading photo...';
                            try {
                                let photoBase64;
                                if (hasCapturedPhoto) {
                                    photoBase64 = window.capturedEmployeePhoto;
                                    // Clear captured photo
                                    window.capturedEmployeePhoto = null;
                                    window.capturedPhotoTarget = null;
                                } else {
                                    const photoFile = photoInput.files[0];
                                    const reader = new FileReader();
                                    photoBase64 = await new Promise((resolve) => {
                                        reader.onload = (e) => resolve(e.target.result);
                                        reader.readAsDataURL(photoFile);
                                    });
                                }

                                // Initialize storage helper if needed
                                if (!firebaseStorageHelper.isInitialized) {
                                    firebaseStorageHelper.initialize();
                                }

                                const uploadResult = await firebaseStorageHelper.uploadImage(
                                    photoBase64,
                                    'employees/photos',
                                    firestoreId,
                                    500,  // maxSizeKB
                                    false // showOverlay - we're showing our own spinner
                                );

                                // Update employee with photo URL
                                if (uploadResult && uploadResult.url) {
                                    newEmployee.photo = uploadResult.url;
                                    newEmployee.photoPath = uploadResult.path;
                                    await firebaseEmployeeManager.updateEmployee(firestoreId, {
                                        photo: uploadResult.url,
                                        photoPath: uploadResult.path
                                    });
                                    console.log('Employee photo uploaded to Firebase Storage:', uploadResult.url);
                                }
                            } catch (photoError) {
                                console.error('Error uploading employee photo:', photoError);
                                showNotification('Error uploading photo, but employee was saved', 'warning');
                            }
                        }

                        // Upload paperwork files if any
                        if (selectedEmployeePaperworkFiles.length > 0) {
                            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading documents...';

                            for (const file of selectedEmployeePaperworkFiles) {
                                try {
                                    await firebaseEmployeeManager.uploadPaperwork(firestoreId, file, 'Document');
                                } catch (uploadError) {
                                    console.error('Error uploading file:', file.name, uploadError);
                                    // Continue with other files even if one fails
                                }
                            }

                            // Clear the selected files after upload
                            selectedEmployeePaperworkFiles = [];

                            // Reload employee data to get updated paperwork
                            const updatedEmployee = await firebaseEmployeeManager.getEmployee(firestoreId);
                            if (updatedEmployee) {
                                newEmployee.paperwork = updatedEmployee.paperwork;
                            }
                        }

                        // Add to local array
                        employees.push(newEmployee);

                        // Update employee count badge
                        updateEmployeeCountBadge();

                        // Log activity
                        try {
                            if (typeof logActivity === 'function') {
                                await logActivity(ACTIVITY_TYPES.CREATE, {
                                    message: `Added new employee: ${newEmployee.name}`,
                                    employeeName: newEmployee.name,
                                    role: newEmployee.role,
                                    store: newEmployee.store
                                }, 'employee', firestoreId);
                            }
                        } catch (logError) {
                            console.warn('⚠️ Failed to log employee creation:', logError);
                        }

                        closeModal();
                        renderPage(currentPage);

                        // Show success message
                        if (newEmployee.firebaseUid) {
                            showNotification('Employee added with login account created!', 'success');
                        } else {
                            showNotification('Employee added successfully!', 'success');
                        }
                    } else {
                        throw new Error('Failed to get Firestore ID');
                    }
                } else {
                    // Fallback: save locally only
                    newEmployee.id = Date.now().toString();
                    employees.push(newEmployee);

                    // Update employee count badge
                    updateEmployeeCountBadge();

                    closeModal();
                    renderPage(currentPage);
                    showNotification('Employee added (offline mode)', 'warning');
                }
            } catch (error) {
                console.error('Error saving employee:', error);
                
                // Show specific error message
                let errorMessage = error.message || 'Error saving employee. Please try again.';
                alert(errorMessage);

                // Reset button
                if (saveBtn) {
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                }
            }
        }

        /**
         * Show image in fullscreen modal
         */
        function showImageModal(imageUrl, title = 'Image') {
            // Remove existing image modal if any
            const existing = document.getElementById('image-fullscreen-modal');
            if (existing) existing.remove();

            const modal = document.createElement('div');
            modal.id = 'image-fullscreen-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
                box-sizing: border-box;
            `;
            modal.innerHTML = `
                <div style="position: absolute; top: 20px; right: 20px; display: flex; gap: 10px;">
                    <a href="${imageUrl}" download style="color: white; font-size: 24px; cursor: pointer; text-decoration: none;" title="Download">
                        <i class="fas fa-download"></i>
                    </a>
                    <span onclick="document.getElementById('image-fullscreen-modal').remove()" style="color: white; font-size: 28px; cursor: pointer;" title="Close">
                        <i class="fas fa-times"></i>
                    </span>
                </div>
                <div style="color: white; font-size: 18px; margin-bottom: 15px; text-align: center;">${title}</div>
                <img src="${imageUrl}" alt="${title}" style="max-width: 90%; max-height: 80%; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
            `;

            // Close on background click
            modal.addEventListener('mousedown', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            // Close on Escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    modal.remove();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);

            document.body.appendChild(modal);
        }

        /**
         * Show notification toast
         */
        function showNotification(message, type = 'info') {
            // Remove existing notifications
            const existing = document.querySelector('.notification-toast');
            if (existing) existing.remove();

            const toast = document.createElement('div');
            toast.className = `notification-toast ${type}`;
            toast.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            `;
            document.body.appendChild(toast);

            // Auto remove after 3 seconds
            setTimeout(() => {
                toast.classList.add('fade-out');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // Variable to store selected training file
        let selectedTrainingFile = null;

        // Toggle between video URL and PDF file upload fields
        function toggleTrainingTypeFields() {
            const type = document.getElementById('training-type').value;
            const urlGroup = document.getElementById('training-url-group');
            const fileGroup = document.getElementById('training-file-group');

            if (type === 'video') {
                urlGroup.style.display = 'block';
                fileGroup.style.display = 'none';
            } else {
                urlGroup.style.display = 'none';
                fileGroup.style.display = 'block';
            }
        }

        // Handle training file selection
        function handleTrainingFileSelect(input) {
            const file = input.files[0];
            if (!file) return;

            // Validate file type
            if (file.type !== 'application/pdf') {
                showToast('Please select a PDF file', 'error');
                input.value = '';
                return;
            }

            // Validate file size (max 50MB)
            const maxSize = 50 * 1024 * 1024; // 50MB
            if (file.size > maxSize) {
                showToast('File size exceeds 50MB limit', 'error');
                input.value = '';
                return;
            }

            selectedTrainingFile = file;

            // Update UI to show selected file
            const fileContent = document.getElementById('training-file-content');
            const fileSize = (file.size / 1024 / 1024).toFixed(2);
            fileContent.innerHTML = `
                <i class="fas fa-file-pdf" style="font-size: 32px; color: #ef4444; margin-bottom: 8px;"></i>
                <span style="color: var(--text-primary); font-weight: 500;">${file.name}</span>
                <span style="color: var(--text-muted); font-size: 12px;">${fileSize} MB</span>
            `;
        }

        // Format file size for display
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        async function saveTraining() {
            const title = document.getElementById('training-title').value.trim();
            const type = document.getElementById('training-type').value;
            const url = document.getElementById('training-url').value.trim();
            const description = document.getElementById('training-description')?.value.trim() || '';

            // Validation
            if (!title) {
                showToast('Please enter a training title', 'error');
                return;
            }

            if (type === 'video' && !url) {
                showToast('Please enter a video URL', 'error');
                return;
            }

            // Validate URL format
            if (type === 'video' && url) {
                if (!isValidUrl(url)) {
                    showToast('Please enter a valid URL (e.g., https://youtube.com/watch?v=...)', 'error');
                    return;
                }
            }

            if (type === 'document' && !selectedTrainingFile) {
                showToast('Please select a PDF file', 'error');
                return;
            }

            // Show loading state
            const saveBtn = document.getElementById('save-training-btn');
            const saveText = document.getElementById('save-training-text');
            const saveSpinner = document.getElementById('save-training-spinner');

            if (saveBtn) saveBtn.disabled = true;
            if (saveText) saveText.textContent = 'Saving...';
            if (saveSpinner) saveSpinner.style.display = 'inline-block';

            // Show upload progress for PDF files
            if (type === 'document') {
                const progressDiv = document.getElementById('training-upload-progress');
                if (progressDiv) progressDiv.style.display = 'block';

                // Listen for upload progress
                const progressHandler = (e) => {
                    const progress = e.detail.progress;
                    const progressFill = document.getElementById('training-progress-fill');
                    const progressText = document.getElementById('training-progress-text');
                    if (progressFill) progressFill.style.width = progress + '%';
                    if (progressText) progressText.textContent = Math.round(progress) + '%';
                };
                window.addEventListener('uploadProgress', progressHandler);

                try {
                    // Initialize Firebase Training Manager if not already
                    if (!firebaseTrainingManager.isInitialized) {
                        await firebaseTrainingManager.initialize();
                    }

                    // Prepare training data
                    const trainingData = {
                        title,
                        type,
                        url: type === 'video' ? url : '',
                        completion: 0,
                        description
                    };

                    // Save to Firebase with file
                    const newId = await firebaseTrainingManager.addTraining(trainingData, selectedTrainingFile);

                    if (newId) {
                        showToast('Training material added successfully!', 'success');
                        selectedTrainingFile = null;
                        closeModal();
                        await loadTrainingsFromFirebase();
                        renderPage(currentPage);
                    } else {
                        throw new Error('Failed to save training');
                    }

                    window.removeEventListener('uploadProgress', progressHandler);
                } catch (error) {
                    console.error('Error saving training:', error);
                    showToast('Error saving training: ' + error.message, 'error');
                    window.removeEventListener('uploadProgress', progressHandler);

                    // Reset button state
                    if (saveBtn) saveBtn.disabled = false;
                    if (saveText) saveText.textContent = 'Add Training';
                    if (saveSpinner) saveSpinner.style.display = 'none';
                }
            } else {
                // Video type - no file upload needed
                try {
                    if (!firebaseTrainingManager.isInitialized) {
                        await firebaseTrainingManager.initialize();
                    }

                    const trainingData = {
                        title,
                        type,
                        url,
                        completion: 0,
                        description
                    };

                    const newId = await firebaseTrainingManager.addTraining(trainingData);

                    if (newId) {
                        showToast('Training material added successfully!', 'success');
                        closeModal();
                        await loadTrainingsFromFirebase();
                        renderPage(currentPage);
                    } else {
                        throw new Error('Failed to save training');
                    }
                } catch (error) {
                    console.error('Error saving training:', error);
                    showToast('Error saving training: ' + error.message, 'error');

                    // Reset button state
                    if (saveBtn) saveBtn.disabled = false;
                    if (saveText) saveText.textContent = 'Add Training';
                    if (saveSpinner) saveSpinner.style.display = 'none';
                }
            }
        }

        // Load trainings from Firebase
        async function loadTrainingsFromFirebase() {
            try {
                if (!firebaseTrainingManager.isInitialized) {
                    await firebaseTrainingManager.initialize();
                }

                const firebaseTrainings = await firebaseTrainingManager.loadTrainings();

                if (firebaseTrainings.length > 0) {
                    trainings = firebaseTrainings;
                    console.log('Loaded trainings from Firebase:', trainings.length);
                } else {
                    console.log('No trainings in Firebase, using default data');
                }
            } catch (error) {
                console.error('Error loading trainings from Firebase:', error);
            }
        }

        async function saveLicense() {
            const name = document.getElementById('license-name').value;
            const store = document.getElementById('license-store').value;
            const expires = document.getElementById('license-expires').value;
            const fileInput = document.getElementById('license-file');

            if (!name || !store || !expires) {
                showToast('Please fill in all required fields', 'error');
                return;
            }

            const expiresDate = new Date(expires);
            const today = new Date();
            const daysUntilExpiry = Math.ceil((expiresDate - today) / (1000 * 60 * 60 * 24));

            let status = 'valid';
            if (daysUntilExpiry < 0) status = 'expired';
            else if (daysUntilExpiry < 60) status = 'expiring';

            // Get current user info
            const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
            const uploadedBy = user?.name || user?.email || 'Unknown';

            try {
                // Initialize Firebase if needed
                if (!firebaseLicensesManager.isInitialized) {
                    await firebaseLicensesManager.initialize();
                }

                let file = null;
                if (fileInput && fileInput.files.length > 0) {
                    file = fileInput.files[0];

                    // Validate file type
                    if (file.type !== 'application/pdf') {
                        showToast('Please select a PDF file', 'error');
                        return;
                    }

                    // Check file size (max 50MB for Storage)
                    const maxSize = 50 * 1024 * 1024; // 50MB
                    if (file.size > maxSize) {
                        showToast('File size exceeds 50MB limit', 'error');
                        return;
                    }
                }

                const licenseData = {
                    name,
                    store,
                    expires,
                    status,
                    file: file ? file.name : null,
                    uploadedBy: uploadedBy
                };

                // Save to Firebase (with or without file)
                const docId = await firebaseLicensesManager.addLicense(licenseData, file);

                if (docId) {
                    showToast('License uploaded successfully!', 'success');

                    // Reload licenses from Firebase
                    const updatedLicenses = await firebaseLicensesManager.loadLicenses();
                    if (updatedLicenses && updatedLicenses.length > 0) {
                        licenses = updatedLicenses;
                    }

                    closeModal();
                    renderPage(currentPage);
                } else {
                    throw new Error('Failed to save license');
                }
            } catch (error) {
                console.error('Error saving license:', error);
                showToast('Error saving license: ' + error.message, 'error');
            }
        }

        // Legacy function kept for compatibility
        async function saveLicenseOld() {
            const name = document.getElementById('license-name').value;
            const store = document.getElementById('license-store').value;
            const expires = document.getElementById('license-expires').value;
            const fileInput = document.getElementById('license-file');

            if (!name || !store || !expires) {
                alert('Please fill in all required fields');
                return;
            }

            const expiresDate = new Date(expires);
            const today = new Date();
            const daysUntilExpiry = Math.ceil((expiresDate - today) / (1000 * 60 * 60 * 24));

            let status = 'valid';
            if (daysUntilExpiry < 0) status = 'expired';
            else if (daysUntilExpiry < 60) status = 'expiring';

            // Get current user info
            const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
            const uploadedBy = user?.name || user?.email || 'Unknown';

            // No file uploaded
            const licenseData = {
                name,
                store,
                expires,
                status,
                file: null,
                fileName: null,
                fileType: null,
                fileData: null,
                uploadedBy: uploadedBy
            };

            // Save to Firebase
            if (firebaseLicensesManager && firebaseLicensesManager.isInitialized) {
                try {
                    const docId = await firebaseLicensesManager.addLicense(licenseData);
                    if (docId) {
                        // Reload licenses from Firebase
                        const updatedLicenses = await firebaseLicensesManager.loadLicenses();
                        if (updatedLicenses && updatedLicenses.length > 0) {
                            licenses = updatedLicenses;
                        }
                    }
                } catch (error) {
                    console.error('Error saving license to Firebase:', error);
                    // Fallback to local
                    licenses.push({
                        id: Date.now().toString(),
                        ...licenseData
                    });
                }
            } else {
                // Fallback to local storage
                licenses.push({
                    id: Date.now().toString(),
                    ...licenseData
                });
            }

            closeModal();
            renderPage(currentPage);
        }

        async function saveAnnouncement() {
            const title = document.getElementById('announcement-title').value;
            const content = document.getElementById('announcement-content').value;
            const targetStores = document.getElementById('announcement-stores')?.value || 'all';

            if (!title || !content) {
                alert('Please fill in all required fields');
                return;
            }

            // Get current user info for author
            const user = authManager.getCurrentUser();
            const authorName = user?.name || user?.email?.split('@')[0] || 'Unknown';

            const announcementData = {
                date: new Date().toISOString().split('T')[0],
                title,
                content,
                author: authorName,
                targetStores
            };

            try {
                // Save to Firebase
                if (firebaseAnnouncementsManager.isInitialized) {
                    const docId = await firebaseAnnouncementsManager.addAnnouncement(announcementData);
                    if (docId) {
                        // Log activity
                        if (typeof logActivity === 'function') {
                            await logActivity(ACTIVITY_TYPES.CREATE, {
                                message: `Created announcement: ${title}`,
                                announcementTitle: title,
                                targetStores: targetStores
                            }, 'announcement', docId);
                        }
                        // Reload announcements from Firebase
                        const updatedAnnouncements = await firebaseAnnouncementsManager.loadAnnouncements();
                        if (updatedAnnouncements && updatedAnnouncements.length > 0) {
                            announcements = updatedAnnouncements;
                        }
                        console.log('Announcement saved to Firebase with ID:', docId);
                    }
                } else {
                    // Fallback to local storage
                    announcements.unshift({
                        id: announcements.length + 1,
                        ...announcementData
                    });
                }

                closeModal();
                renderPage(currentPage);
                updateAnnouncementsBadge();
                populateAnnouncementsDropdown();
            } catch (error) {
                console.error('Error saving announcement:', error);
                alert('Failed to save announcement. Please try again.');
            }
        }

        async function saveAnnouncementInline() {
            const title = document.getElementById('new-announcement-title').value;
            const content = document.getElementById('new-announcement-content').value;

            if (!title || !content) {
                alert('Please fill in both title and content');
                return;
            }

            // Get current user info for author
            const user = authManager.getCurrentUser();
            const authorName = user?.name || user?.email?.split('@')[0] || 'Unknown';

            const announcementData = {
                date: new Date().toISOString().split('T')[0],
                title,
                content,
                author: authorName,
                targetStores: 'all'
            };

            try {
                // Save to Firebase
                if (firebaseAnnouncementsManager.isInitialized) {
                    const docId = await firebaseAnnouncementsManager.addAnnouncement(announcementData);
                    if (docId) {
                        // Log activity
                        if (typeof logActivity === 'function') {
                            await logActivity(ACTIVITY_TYPES.CREATE, {
                                message: `Created announcement: ${title}`,
                                announcementTitle: title,
                                targetStores: 'all'
                            }, 'announcement', docId);
                        }
                        // Reload announcements from Firebase
                        const updatedAnnouncements = await firebaseAnnouncementsManager.loadAnnouncements();
                        if (updatedAnnouncements && updatedAnnouncements.length > 0) {
                            announcements = updatedAnnouncements;
                        }
                        console.log('Announcement saved to Firebase with ID:', docId);
                    }
                } else {
                    // Fallback to local storage
                    announcements.unshift({
                        id: announcements.length + 1,
                        ...announcementData
                    });
                }

                renderAnnouncements();
                updateAnnouncementsBadge();
                populateAnnouncementsDropdown();
            } catch (error) {
                console.error('Error saving announcement:', error);
                alert('Failed to save announcement. Please try again.');
            }
        }

        // Make announcement functions globally accessible
        window.saveAnnouncement = saveAnnouncement;
        window.saveAnnouncementInline = saveAnnouncementInline;

        async function saveProduct() {
            const name = document.getElementById('new-product-name').value.trim();
            const category = document.getElementById('new-product-category').value;
            const price = document.getElementById('new-product-price').value;
            const arrivalDate = document.getElementById('new-product-arrival').value;
            const estimatedDeals = document.getElementById('new-product-deals')?.value || '';
            const url = document.getElementById('new-product-url')?.value.trim() || '';
            const supplier = document.getElementById('new-product-supplier')?.value.trim() || '';
            const imageInput = document.getElementById('new-product-image');

            if (!name) {
                alert('Please enter a product name');
                return;
            }

            // Validate URL format if provided
            if (url && !isValidUrl(url)) {
                alert('Please enter a valid URL (e.g., https://example.com)');
                return;
            }

            // Show loading state
            const saveBtn = document.getElementById('save-product-btn');
            const originalText = saveBtn.innerHTML;
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            try {
                // Upload image to Firebase Storage if provided
                let imageUrl = null;
                let imagePath = null;
                const imageImg = document.getElementById('product-image-img');
                if (imageImg && imageImg.src && imageInput && imageInput.files && imageInput.files.length > 0 && imageImg.src.startsWith('data:')) {
                    // Initialize storage helper if needed
                    if (!firebaseStorageHelper.isInitialized) {
                        firebaseStorageHelper.initialize();
                    }

                    try {
                        const tempId = Date.now().toString();
                        const uploadResult = await firebaseStorageHelper.uploadImage(
                            imageImg.src,
                            'products/images',
                            tempId
                        );
                        imageUrl = uploadResult.url;
                        imagePath = uploadResult.path;
                    } catch (err) {
                        console.error('Error uploading product image to Storage:', err);
                        // Fallback to compressed base64
                        imageUrl = await compressImage(imageImg.src);
                    }
                }

                // Create product data object
                const productData = {
                    name,
                    category: category || '',
                    price: parseFloat(price) || 0,
                    arrivalDate: arrivalDate || '',
                    estimatedDeals: estimatedDeals || '',
                    url: url || '',
                    supplier: supplier || '',
                    image: imageUrl,      // Now stores URL instead of base64
                    imagePath: imagePath, // For future deletion
                    status: 'pending'
                };

                // Ensure Firebase Product Manager is initialized
                if (!firebaseProductManager.isInitialized) {
                    const initialized = await firebaseProductManager.initialize();
                    if (!initialized) {
                        throw new Error('Failed to initialize Firebase Product Manager');
                    }
                }

                // Save to Firebase Firestore
                console.log('💾 Saving product to Firestore...');
                const savedProduct = await firebaseProductManager.saveProduct(productData);

                if (savedProduct) {
                    showToast('Product added successfully!', 'success');
                    closeModal();
                    // Reload products from Firebase and render
                    await loadProductsFromFirebase();
                    renderNewStuff();
                } else {
                    throw new Error('Failed to save product');
                }
            } catch (error) {
                console.error('Error saving product:', error);
                showToast('Error saving product: ' + error.message, 'error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalText;
            }
        }

        /**
         * Preview product image (converts to Base64 for direct Firestore storage)
         */
        function previewProductImage(input) {
            const preview = document.getElementById('product-image-preview');
            const img = document.getElementById('product-image-img');

            if (input.files && input.files[0]) {
                const file = input.files[0];

                const reader = new FileReader();
                reader.onload = function(e) {
                    img.src = e.target.result;  // Base64 DataURL
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                preview.style.display = 'none';
            }
        }

        /**
         * View product image in a modal
         */
        function viewProductImage(imageUrl) {
            if (!imageUrl) {
                alert('No image available');
                return;
            }

            openModal('view-image');
            setTimeout(() => {
                const modal = document.getElementById('modal');
                const modalContent = modal.querySelector('.modal-content');
                modalContent.innerHTML = `
                    <div style="padding: 20px; text-align: center;">
                        <img src="${imageUrl}" alt="Product" style="max-width: 100%; max-height: 80vh; border-radius: 12px;">
                        <button class="btn-secondary" onclick="closeModal()" style="margin-top: 20px; width: 100%;">Close</button>
                    </div>
                `;
            }, 100);
        }

        /**
         * Load products from Firebase
         */
        async function loadProductsFromFirebase() {
            try {
                if (!firebaseProductManager.isInitialized) {
                    const initialized = await firebaseProductManager.initialize();
                    if (!initialized) {
                        console.warn('Firebase not initialized, using empty local products');
                        products = [];
                        return Promise.resolve();
                    }
                }

                console.log('📦 Loading products from Firebase...');
                const firebaseProducts = await firebaseProductManager.loadProducts();
                
                // Replace local products with Firebase products
                products = firebaseProducts || [];
                
                return Promise.resolve();
            } catch (error) {
                console.error('Error loading products from Firebase:', error);
                products = [];
                return Promise.resolve();
            }
        }

        /**
         * Delete product from Firebase
         */
        async function deleteProductFromFirebase(productId) {
            showConfirmModal({
                title: 'Delete Product',
                message: 'Are you sure you want to delete this product? This action cannot be undone.',
                confirmText: 'Delete',
                type: 'danger',
                onConfirm: async () => {
                    try {
                        if (!firebaseProductManager.isInitialized) {
                            const initialized = await firebaseProductManager.initialize();
                            if (!initialized) {
                                showNotification('Firebase not initialized', 'error');
                                return;
                            }
                        }

                        console.log(`🗑️ Deleting product: ${productId}`);
                        const success = await firebaseProductManager.deleteProduct(productId);

                        if (success) {
                            // Remove from local array
                            products = products.filter(p => p.id !== productId);
                            renderNewStuff();
                        } else {
                            showNotification('Error deleting product', 'error');
                        }
                    } catch (error) {
                        console.error('Error deleting product:', error);
                        showNotification('Error deleting product', 'error');
                    }
                }
            });
        }

        // Variable to store the product being edited
        let editingProductId = null;

        /**
         * Preview edit product image (converts to Base64)
         */
        function previewEditProductImage(input) {
            const preview = document.getElementById('edit-product-image-preview');
            const img = document.getElementById('edit-product-image-img');

            if (input.files && input.files[0]) {
                const file = input.files[0];

                const reader = new FileReader();
                reader.onload = function(e) {
                    img.src = e.target.result;  // Base64 DataURL
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        }

        /**
         * Get unique supplier options from existing products
         */
        function getSupplierOptions(currentSupplier = '') {
            // Get unique suppliers from existing products
            const suppliers = [...new Set(products.map(p => p.supplier).filter(s => s && s.trim()))];

            // Add some default suppliers if not already in the list
            const defaultSuppliers = ['Direct Import', 'Local Vendor', 'Wholesale'];
            defaultSuppliers.forEach(s => {
                if (!suppliers.includes(s)) suppliers.push(s);
            });

            // Sort alphabetically
            suppliers.sort((a, b) => a.localeCompare(b));

            // Generate options HTML
            return suppliers.map(supplier =>
                `<option value="${supplier}" ${currentSupplier === supplier ? 'selected' : ''}>${supplier}</option>`
            ).join('');
        }

        /**
         * Edit product
         */
        function editProduct(productId) {
            const product = products.find(p => p.id === productId || p.firestoreId === productId);
            if (!product) {
                alert('Product not found');
                return;
            }

            editingProductId = productId;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2 style="display: flex; align-items: center; gap: 12px; margin: 0;">
                        <i class="fas fa-edit" style="color: var(--accent-primary); font-size: 24px;"></i>
                        Edit Product
                    </h2>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="edit-product-form" style="display: flex; flex-direction: column; gap: 20px;">
                        <div>
                            <label style="display: block; color: var(--text-muted); font-size: 12px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">Product Name</label>
                            <input type="text" id="edit-product-name" value="${product.name || ''}" class="form-input" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit;">
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="display: block; color: var(--text-muted); font-size: 12px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">Category</label>
                                <select id="edit-product-category" class="form-input" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit;">
                                    <option value="">Select category...</option>
                                    <option value="Vape Devices" ${product.category === 'Vape Devices' ? 'selected' : ''}>Vape Devices</option>
                                    <option value="Vape Pods" ${product.category === 'Vape Pods' ? 'selected' : ''}>Vape Pods</option>
                                    <option value="Disposables" ${product.category === 'Disposables' ? 'selected' : ''}>Disposables</option>
                                    <option value="Cigarettes" ${product.category === 'Cigarettes' ? 'selected' : ''}>Cigarettes</option>
                                    <option value="Accessories" ${product.category === 'Accessories' ? 'selected' : ''}>Accessories</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; color: var(--text-muted); font-size: 12px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">Quantity</label>
                                <input type="number" id="edit-product-quantity" value="${product.quantity || 0}" class="form-input" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit;">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="display: block; color: var(--text-muted); font-size: 12px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">Price</label>
                                <input type="number" id="edit-product-price" value="${product.price || 0}" step="0.01" class="form-input" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit;">
                            </div>
                            <div>
                                <label style="display: block; color: var(--text-muted); font-size: 12px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">Store</label>
                                <select id="edit-product-store" class="form-input" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit;">
                                    <option value="">Select store...</option>
                                    <option value="Miramar" ${product.store === 'Miramar' ? 'selected' : ''}>VSU Miramar</option>
                                    <option value="Morena" ${product.store === 'Morena' ? 'selected' : ''}>VSU Morena</option>
                                    <option value="Kearny Mesa" ${product.store === 'Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                                    <option value="Chula Vista" ${product.store === 'Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                                    <option value="North Park" ${product.store === 'North Park' ? 'selected' : ''}>VSU North Park</option>
                                    <option value="Miramar Wine & Liquor" ${product.store === 'Miramar Wine & Liquor' ? 'selected' : ''}>Miramar Wine & Liquor</option>
                                </select>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="display: block; color: var(--text-muted); font-size: 12px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">Arrival Date</label>
                                <input type="date" id="edit-product-arrival-date" value="${product.arrivalDate || ''}" class="form-input" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit;">
                            </div>
                            <div>
                                <label style="display: block; color: var(--text-muted); font-size: 12px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">Supplier</label>
                                <select id="edit-product-supplier" class="form-input" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit;">
                                    <option value="">Select supplier...</option>
                                    ${getSupplierOptions(product.supplier)}
                                </select>
                            </div>
                        </div>

                        <!-- Image Upload Section -->
                        <div>
                            <label style="display: block; color: var(--text-muted); font-size: 12px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">Product Image (leave empty to keep current)</label>
                            <input type="file" class="form-input" id="edit-product-image" accept="image/*" onchange="previewEditProductImage(this)" style="display: none;">
                            <div id="edit-product-image-preview" style="margin-bottom: 12px; ${product.image ? '' : 'display: none;'}">
                                <img id="edit-product-image-img" src="${product.image || ''}" style="max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: cover;">
                            </div>
                            <button type="button" class="btn-secondary" onclick="document.getElementById('edit-product-image').click()" style="margin: 0;">
                                <i class="fas fa-image"></i> ${product.image ? 'Change Image' : 'Select Image'}
                            </button>
                            <small style="display: block; margin-top: 8px; color: var(--text-muted);">Stored securely in cloud storage</small>
                        </div>

                        <div>
                            <label style="display: block; color: var(--text-muted); font-size: 12px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">Description</label>
                            <textarea id="edit-product-description" class="form-input" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit; min-height: 100px; resize: vertical;">${product.description || ''}</textarea>
                        </div>
                    </form>

                    <div style="display: flex; gap: 12px; margin-top: 20px;">
                        <button class="btn-primary" style="
                            flex: 1;
                            padding: 12px 16px;
                            border-radius: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            border: none;
                            transition: all 0.2s ease;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                        " onclick="saveProductChanges('${productId}')">
                            <i class="fas fa-check"></i>
                            Save Changes
                        </button>
                        <button style="
                            flex: 1;
                            background: var(--bg-secondary);
                            color: var(--text-primary);
                            border: 1px solid var(--border-color);
                            padding: 12px 16px;
                            border-radius: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                            transition: all 0.2s ease;
                        " onclick="closeModal()">
                            <i class="fas fa-times"></i>
                            Cancel
                        </button>
                    </div>
                </div>
            `;

            modal.classList.add('active');
        }

        async function saveProductChanges(productId) {
            const product = products.find(p => p.id === productId || p.firestoreId === productId);
            if (!product) {
                showToast('Product not found', 'error');
                return;
            }

            const imageInput = document.getElementById('edit-product-image');

            // Upload image to Firebase Storage if new one provided
            let imageUrl = product.image;
            let imagePath = product.imagePath || null;
            const imageImg = document.getElementById('edit-product-image-img');
            if (imageInput && imageInput.files && imageInput.files.length > 0 && imageImg && imageImg.src && imageImg.src.startsWith('data:')) {
                // Initialize storage helper if needed
                if (!firebaseStorageHelper.isInitialized) {
                    firebaseStorageHelper.initialize();
                }

                // Delete old image from Storage if exists
                if (product.imagePath) {
                    try {
                        await firebaseStorageHelper.deleteFile(product.imagePath);
                    } catch (err) {
                        console.error('Error deleting old product image from Storage:', err);
                    }
                }

                try {
                    const firestoreId = product.firestoreId || productId;
                    const uploadResult = await firebaseStorageHelper.uploadImage(
                        imageImg.src,
                        'products/images',
                        firestoreId
                    );
                    imageUrl = uploadResult.url;
                    imagePath = uploadResult.path;
                } catch (err) {
                    console.error('Error uploading product image to Storage:', err);
                    // Fallback to compressed base64
                    imageUrl = await compressImage(imageImg.src);
                }
            }

            // Update product with new values
            const updatedData = {
                name: document.getElementById('edit-product-name').value.trim() || product.name,
                category: document.getElementById('edit-product-category').value.trim() || product.category,
                quantity: parseInt(document.getElementById('edit-product-quantity').value) || 0,
                price: parseFloat(document.getElementById('edit-product-price').value) || 0,
                store: document.getElementById('edit-product-store').value.trim() || product.store,
                arrivalDate: document.getElementById('edit-product-arrival-date').value || product.arrivalDate,
                supplier: document.getElementById('edit-product-supplier').value.trim() || product.supplier,
                description: document.getElementById('edit-product-description').value.trim() || '',
                image: imageUrl,      // Now stores URL instead of base64
                imagePath: imagePath  // For future deletion
            };

            // Update local product
            const productIndex = products.findIndex(p => p.id === productId || p.firestoreId === productId);
            if (productIndex !== -1) {
                products[productIndex] = {
                    ...products[productIndex],
                    ...updatedData
                };
            }

            // Save to Firebase
            try {
                if (firebaseProductManager && firebaseProductManager.isInitialized) {
                    const firestoreId = product.firestoreId || productId;
                    await firebaseProductManager.updateProduct(String(firestoreId), updatedData);
                    showToast('Product updated successfully!', 'success');
                } else {
                    console.warn('⚠️ Firebase not initialized, saving locally only');
                    showToast('Product updated locally', 'success');
                }
            } catch (error) {
                console.error('Error updating product in Firebase:', error);
                showToast('Error updating product: ' + error.message, 'error');
            }

            editingProductId = null;
            closeModal();
            renderNewStuff();
        }

        function openRestockModal(itemId) {
            const modal = document.getElementById('modal');
            modal.dataset.itemId = itemId;
            openModal('restock-request');
        }

        function submitRestockFromModal(itemId) {
            const item = inventory.find(i => i.id == itemId);
            const date = document.getElementById('restock-date').value;
            const store = document.getElementById('restock-modal-store').value;
            const qtyHand = document.getElementById('restock-qty-hand').value;
            const isCustomerRequest = document.getElementById('customer-request').checked;
            const customerInfo = document.getElementById('customer-info').value;
            const notes = document.getElementById('restock-modal-notes').value;

            if (!date || !store || !qtyHand) {
                alert('Please fill in all required fields');
                return;
            }

            if (isCustomerRequest && !customerInfo) {
                alert('Please provide customer information');
                return;
            }

            const productName = `${item.brand} ${item.productName} - ${item.flavor}`;
            const noteText = isCustomerRequest
                ? `Customer Request: ${customerInfo}${notes ? '\n' + notes : ''}`
                : notes;

            const newRequest = {
                productName: productName,
                quantity: item.minStock - parseInt(qtyHand),
                store,
                requestedBy: 'VSU Admin',
                requestDate: date,
                status: 'pending',
                priority: parseInt(qtyHand) < item.minStock * 0.3 ? 'high' : parseInt(qtyHand) < item.minStock * 0.6 ? 'medium' : 'low',
                notes: noteText
            };

            // Save to Firebase if initialized
            if (firebaseRestockRequestsManager.isInitialized) {
                firebaseRestockRequestsManager.addRestockRequest(newRequest).then(async newId => {
                    if (newId) {
                        // Log activity
                        if (typeof logActivity === 'function') {
                            await logActivity(ACTIVITY_TYPES.CREATE, {
                                message: `Created restock request: ${newRequest.productName}`,
                                productName: newRequest.productName,
                                quantity: newRequest.quantity,
                                store: newRequest.store,
                                priority: newRequest.priority
                            }, 'restock', newId);
                        }
                        restockRequests.unshift({
                            id: newId,
                            firestoreId: newId,
                            ...newRequest
                        });
                        closeModal();
                        currentRestockTab = 'requests';
                        renderRestockRequests();
                    }
                }).catch(error => {
                    console.error('Error creating restock request in Firebase:', error);
                    alert('Error creating restock request: ' + error.message);
                });
            } else {
                // Fallback to local storage only
                restockRequests.unshift({
                    id: restockRequests.length + 1,
                    ...newRequest
                });
                closeModal();
                currentRestockTab = 'requests';
                renderRestockRequests();
            }
        }

        // Helper function to populate employee dropdown for restock requests
        function populateEmployeeDropdown(selectId, selectedValue = '') {
            const select = document.getElementById(selectId);
            if (!select) return;

            // Clear existing options except the first placeholder
            select.innerHTML = '<option value="">Select employee...</option>';

            // Add active employees from the employees array
            const activeEmployees = employees.filter(emp => emp.status === 'active');
            activeEmployees.forEach(emp => {
                const option = document.createElement('option');
                option.value = emp.name;
                option.textContent = `${emp.name} (${emp.store})`;
                if (emp.name === selectedValue) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        }

        function openNewRestockRequestModal() {
            openModal('new-restock-request');

            // Populate employee dropdown and enable/disable customer info field
            setTimeout(() => {
                // Populate employee dropdown
                populateEmployeeDropdown('new-restock-requested-by');

                const checkbox = document.getElementById('new-restock-customer-request');
                const customerInfo = document.getElementById('new-restock-customer-info');

                if (checkbox && customerInfo) {
                    checkbox.addEventListener('change', function() {
                        customerInfo.disabled = !this.checked;
                        customerInfo.style.background = this.checked ? 'var(--bg-primary)' : 'var(--bg-hover)';
                        if (!this.checked) customerInfo.value = '';
                    });
                }
            }, 100);
        }

        function toggleCustomBrandInput() {
            const brandSelect = document.getElementById('new-restock-brand');
            const customBrandInput = document.getElementById('new-restock-custom-brand');
            if (brandSelect && customBrandInput) {
                if (brandSelect.value === 'Other') {
                    customBrandInput.style.display = 'block';
                    customBrandInput.focus();
                } else {
                    customBrandInput.style.display = 'none';
                    customBrandInput.value = '';
                }
            }
        }

        function submitNewRestockRequest() {
            const product = document.getElementById('new-restock-product').value;
            const specifics = document.getElementById('new-restock-specifics')?.value || '';
            const store = document.getElementById('new-restock-store').value;
            const category = document.getElementById('new-restock-category').value;
            const urgency = document.getElementById('new-restock-urgency')?.value || 'Low';
            const orderStatus = document.getElementById('new-restock-order-status')?.value || 'Not Ordered';
            const requestedByEl = document.getElementById('new-restock-requested-by');
            const requestedBy = requestedByEl ? requestedByEl.value : '';
            const notes = document.getElementById('new-restock-notes').value;

            // Validation
            if (!product || !store || !category) {
                alert('Please fill in Item Name, Store and Category');
                return;
            }

            // Create request object with new fields
            const newRequest = {
                productName: product,
                specifics,
                store,
                category,
                urgency,
                orderStatus,
                requestedBy: requestedBy || 'Unknown',
                addedBy: requestedBy || 'Unknown',
                requestDate: new Date().toISOString().split('T')[0],
                notes: notes || ''
            };

            // Save to Firebase if initialized
            if (firebaseRestockRequestsManager.isInitialized) {
                firebaseRestockRequestsManager.addRestockRequest(newRequest).then(async newId => {
                    if (newId) {
                        // Log activity
                        if (typeof logActivity === 'function') {
                            await logActivity(ACTIVITY_TYPES.CREATE, {
                                message: `Created restock request: ${newRequest.productName}`,
                                productName: newRequest.productName,
                                quantity: newRequest.quantity,
                                store: newRequest.store,
                                priority: newRequest.priority
                            }, 'restock', newId);
                        }
                        restockRequests.unshift({
                            id: newId,
                            firestoreId: newId,
                            ...newRequest
                        });
                        closeModal();
                        renderRestockRequests();
                    } else {
                        alert('Error creating request. Please try again.');
                    }
                }).catch(error => {
                    console.error('Error creating request:', error);
                    alert('Error: ' + error.message);
                });
            } else {
                restockRequests.unshift({
                    id: restockRequests.length + 1,
                    ...newRequest
                });
                closeModal();
                renderRestockRequests();
            }
        }

        // Initialize navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            const iconEl = item.querySelector('.nav-icon i');
            if (!iconEl) return; // Skip if no icon element found
            const page = iconEl.className.split(' ')[1].replace('fa-', '');
            const pageMap = {
                'th-large': 'dashboard',
                'users': 'employees',
                'graduation-cap': 'training',
                'folder-open': 'licenses',
                'chart-line': 'analytics',
                'box': 'newstuff',
                'boxes': 'restock',
                'shopping-basket': 'supplies',
                'cloud': 'abundancecloud',
                'store': 'stores',
                'bullhorn': 'announcements',
                'calendar-alt': 'schedule',
                'user-secret': 'thieves',
                'file-invoice-dollar': 'invoices',
                'exclamation-triangle': 'issues',
                'wallet': 'gconomics',
                'truck': 'vendors',
                'clock': 'clockin',
                'chart-bar': 'dailysales',
                'money-bill-wave': 'cashout',
                'vault': 'treasury',
                'coins': 'change',
                'gift': 'customercare',
                'key': 'passwords',
                'bolt': 'gforce',
                'code': 'projectanalytics'
            };
            // Only set data-page if not already set, to preserve existing values
            if (!item.dataset.page) {
                item.dataset.page = pageMap[page] || 'dashboard';
            }
            
            item.addEventListener('click', function(e) {
                // Allow external links (like Abundance Cloud) to navigate normally
                if (this.classList.contains('external-link') || this.getAttribute('href') !== '#') {
                    return; // Let the browser handle the navigation
                }
                e.preventDefault();
                navigateTo(this.dataset.page);
            });
        });

        // Check URL for page parameter and navigate if present
        const urlParams = new URLSearchParams(window.location.search);
        const pageFromUrl = urlParams.get('page');
        if (pageFromUrl) {
            // Small delay to ensure everything is initialized
            setTimeout(() => {
                navigateTo(pageFromUrl);
            }, 100);
        }

        // Close modal on background click
        const modal = document.getElementById('modal');
        if (modal) {
            modal.addEventListener('mousedown', function(e) {
                if (e.target === this) {
                    // Check form protection before closing
                    if (typeof formProtectionManager !== 'undefined' && formProtectionManager.shouldPreventClose()) {
                        formProtectionManager.showConfirmDialog();
                        return;
                    }
                    closeModal();
                }
            });
        }

        // Close expense modal on background click
        const expenseModal = document.getElementById('expenseModal');
        if (expenseModal) {
            expenseModal.addEventListener('mousedown', function(e) {
                if (e.target === this) {
                    // Check form protection before closing
                    if (typeof formProtectionManager !== 'undefined' && formProtectionManager.shouldPreventClose()) {
                        formProtectionManager.showConfirmDialog();
                        return;
                    }
                    closeExpenseModal();
                }
            });
        }

        // Training video player functions
        function getVideoEmbedUrl(url) {
            // Detect YouTube URLs
            const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const youtubeMatch = url.match(youtubeRegex);

            if (youtubeMatch) {
                return {
                    type: 'youtube',
                    videoId: youtubeMatch[1],
                    embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`
                };
            }

            // Detect Vimeo URLs
            const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
            const vimeoMatch = url.match(vimeoRegex);

            if (vimeoMatch) {
                return {
                    type: 'vimeo',
                    videoId: vimeoMatch[1],
                    embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
                };
            }

            return null;
        }

        // Set training view mode (grid or list)
        function setTrainingViewMode(mode) {
            trainingViewMode = mode;
            renderTraining();
        }

        // Get video thumbnail URL
        function getVideoThumbnail(url) {
            const videoInfo = getVideoEmbedUrl(url);
            if (!videoInfo) return null;

            if (videoInfo.type === 'youtube') {
                // YouTube thumbnail - hqdefault is more reliable
                return `https://img.youtube.com/vi/${videoInfo.videoId}/hqdefault.jpg`;
            }

            if (videoInfo.type === 'vimeo') {
                // Return vimeo ID to load async
                return `vimeo:${videoInfo.videoId}`;
            }

            return null;
        }

        // Load Vimeo thumbnails async after page renders
        async function loadVimeoThumbnails() {
            const vimeoElements = document.querySelectorAll('[data-vimeo-id]');
            for (const el of vimeoElements) {
                const vimeoId = el.dataset.vimeoId;
                try {
                    const response = await fetch(`https://vimeo.com/api/v2/video/${vimeoId}.json`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data[0] && data[0].thumbnail_large) {
                            el.style.backgroundImage = `url('${data[0].thumbnail_large}')`;
                            el.style.backgroundSize = 'cover';
                            el.style.backgroundPosition = 'center';
                        }
                    }
                } catch (error) {
                    console.log('Could not load Vimeo thumbnail:', vimeoId);
                }
            }
        }

        function playTrainingVideo(trainingId) {
            const training = trainings.find(t => t.id === trainingId || t.id === parseInt(trainingId));
            if (!training || training.type !== 'video') return;

            const videoInfo = getVideoEmbedUrl(training.url);
            if (!videoInfo) {
                showToast('Invalid video URL. Please use a YouTube or Vimeo link.', 'error');
                return;
            }

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2>${training.title}</h2>
                    <button class="modal-close" onclick="closeVideoPlayer()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body" style="padding: 0;">
                    <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
                        <iframe
                            src="${videoInfo.embedUrl}"
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                            frameborder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowfullscreen>
                        </iframe>
                    </div>
                </div>
                <div class="modal-footer" style="padding: 16px 24px;">
                    <div style="display: flex; justify-content: flex-end; align-items: center; width: 100%;">
                        <button class="btn-primary" onclick="closeVideoPlayer()">Close</button>
                    </div>
                </div>
            `;
            modal.classList.add('active');
        }

        function closeVideoPlayer() {
            closeModal();
        }

        function viewTraining(trainingId) {
            const training = trainings.find(t => t.id === trainingId || t.id === parseInt(trainingId));
            if (!training) {
                showToast('Training not found', 'error');
                return;
            }

            if (training.type === 'video') {
                playTrainingVideo(trainingId);
            } else {
                // For document type, show PDF preview modal
                showTrainingDetailsModal(training);
            }
        }

        // Show training details modal with PDF preview
        function showTrainingDetailsModal(training) {
            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            const hasPdf = training.fileUrl && training.type === 'document';
            const fileSize = training.fileSize ? formatFileSize(training.fileSize) : 'N/A';

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-file-pdf" style="color: #ef4444; margin-right: 10px;"></i>${training.title}</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    ${hasPdf ? `
                        <div style="background: var(--bg-tertiary); border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
                            <iframe
                                src="${training.fileUrl}"
                                style="width: 100%; height: 500px; border: none;"
                                title="PDF Preview">
                            </iframe>
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 60px 20px; background: var(--bg-tertiary); border-radius: 12px; margin-bottom: 20px;">
                            <i class="fas fa-file-pdf" style="font-size: 64px; color: #ef4444; margin-bottom: 16px;"></i>
                            <p style="color: var(--text-muted);">No PDF file available for preview</p>
                        </div>
                    `}

                    <div class="card" style="margin-bottom: 16px;">
                        <div class="card-body">
                            <h4 style="margin-bottom: 16px; color: var(--text-primary);">Training Details</h4>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Type</label>
                                    <span style="font-weight: 500; color: var(--text-primary);">${(training.type || 'Document').toUpperCase()}</span>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Completion</label>
                                    <span style="font-weight: 500; color: var(--text-primary);">${training.completion || 0}%</span>
                                </div>
                                ${training.fileName ? `
                                    <div style="grid-column: span 2;">
                                        <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">File</label>
                                        <span style="font-weight: 500; color: var(--text-primary);">
                                            <i class="fas fa-file-pdf" style="color: #ef4444;"></i> ${training.fileName} (${fileSize})
                                        </span>
                                    </div>
                                ` : ''}
                                ${training.description ? `
                                    <div style="grid-column: span 2;">
                                        <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Description</label>
                                        <p style="color: var(--text-secondary); margin: 0; line-height: 1.6;">${training.description}</p>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                </div>
                <div class="modal-footer">
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <div style="display: flex; gap: 8px;">
                            ${hasPdf ? `
                                <a href="${training.fileUrl}" target="_blank" class="btn-secondary" style="text-decoration: none;">
                                    <i class="fas fa-external-link-alt"></i> Open in New Tab
                                </a>
                                <a href="${training.fileUrl}" download="${training.fileName || 'training.pdf'}" class="btn-secondary" style="text-decoration: none;">
                                    <i class="fas fa-download"></i> Download
                                </a>
                            ` : ''}
                        </div>
                        <button class="btn-primary" onclick="closeModal()">Close</button>
                    </div>
                </div>
            `;
            modal.classList.add('active');
        }

        // Edit training function
        function editTraining(trainingId) {
            const training = trainings.find(t => t.id === trainingId || t.id === parseInt(trainingId));
            if (!training) {
                showToast('Training not found', 'error');
                return;
            }

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2>Edit Training Material</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Title *</label>
                        <input type="text" class="form-input" id="edit-training-title" value="${training.title || ''}" placeholder="Training name...">
                    </div>
                    <div class="form-group">
                        <label>Type</label>
                        <input type="text" class="form-input" value="${(training.type || 'document').toUpperCase()}" disabled style="background: var(--bg-tertiary);">
                    </div>
                    ${training.type === 'video' ? `
                        <div class="form-group">
                            <label>Video URL</label>
                            <input type="url" class="form-input" id="edit-training-url" value="${training.url || ''}" placeholder="https://youtube.com/watch?v=...">
                        </div>
                    ` : ''}
                    ${training.fileName ? `
                        <div class="form-group">
                            <label>Current File</label>
                            <div style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px; display: flex; align-items: center; gap: 12px;">
                                <i class="fas fa-file-pdf" style="font-size: 24px; color: #ef4444;"></i>
                                <div>
                                    <div style="font-weight: 500; color: var(--text-primary);">${training.fileName}</div>
                                    <div style="font-size: 12px; color: var(--text-muted);">${training.fileSize ? formatFileSize(training.fileSize) : 'Unknown size'}</div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    <div class="form-group">
                        <label>Description</label>
                        <textarea class="form-input" id="edit-training-description" rows="3" placeholder="Brief description...">${training.description || ''}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                    <button class="btn-primary" onclick="updateTraining('${trainingId}')">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            `;
            modal.classList.add('active');
        }

        // Update training in Firebase
        async function updateTraining(trainingId) {
            const title = document.getElementById('edit-training-title').value.trim();
            const urlInput = document.getElementById('edit-training-url');
            const url = urlInput ? urlInput.value.trim() : '';
            const description = document.getElementById('edit-training-description').value.trim();

            if (!title) {
                showToast('Please enter a title', 'error');
                return;
            }

            // Validate URL format if provided
            if (url && !isValidUrl(url)) {
                showToast('Please enter a valid URL (e.g., https://youtube.com/watch?v=...)', 'error');
                return;
            }

            // Check if this is a mock training (numeric ID like "1", "2", etc.)
            const isMockTraining = /^\d+$/.test(String(trainingId));

            if (isMockTraining) {
                showToast('Cannot edit demo training. Please delete it and create a new one in Firebase.', 'warning');
                closeModal();
                return;
            }

            try {
                if (!firebaseTrainingManager.isInitialized) {
                    await firebaseTrainingManager.initialize();
                }

                const updateData = {
                    title,
                    description
                };

                if (url) {
                    updateData.url = url;
                }

                const success = await firebaseTrainingManager.updateTraining(trainingId, updateData);

                if (success) {
                    showToast('Training updated successfully!', 'success');
                    closeModal();
                    await loadTrainingsFromFirebase();
                    renderPage(currentPage);
                } else {
                    throw new Error('Failed to update training');
                }
            } catch (error) {
                console.error('Error updating training:', error);

                // Check if error is "document not found"
                if (error.message && error.message.includes('No document to update')) {
                    showToast('This training does not exist in Firebase. Please create a new one.', 'warning');
                } else {
                    showToast('Error updating training: ' + error.message, 'error');
                }
            }
        }

        // Delete training from Firebase
        async function deleteTraining(trainingId) {
            const training = trainings.find(t => t.id === trainingId || t.id === parseInt(trainingId));
            if (!training) {
                showToast('Training not found', 'error');
                return;
            }

            if (!confirm(`Are you sure you want to delete "${training.title}"?\n\nThis action cannot be undone.`)) {
                return;
            }

            try {
                if (!firebaseTrainingManager.isInitialized) {
                    await firebaseTrainingManager.initialize();
                }

                        const success = await firebaseTrainingManager.deleteTraining(trainingId);

                if (success) {
                    showToast('Training deleted successfully!', 'success');
                    await loadTrainingsFromFirebase();
                    renderPage(currentPage);
                } else {
                    throw new Error('Failed to delete training');
                }
            } catch (error) {
                console.error('Error deleting training:', error);
                showToast('Error deleting training: ' + error.message, 'error');
            }
        }

        // Render training completion summary
        function renderTrainingCompletionSummary(training) {
            const completions = training.completions || [];
            const totalEmployees = employees.length;
            const completedCount = completions.length;
            const completionPercentage = totalEmployees > 0 ? Math.round((completedCount / totalEmployees) * 100) : 0;

            return `
                <div style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 14px; color: var(--text-secondary);">Completion Progress</span>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">${completedCount} / ${totalEmployees} employees (${completionPercentage}%)</span>
                    </div>
                    <div style="background: var(--bg-tertiary); border-radius: 8px; height: 12px; overflow: hidden;">
                        <div style="background: ${completionPercentage === 100 ? '#10b981' : '#6366f1'}; height: 100%; width: ${completionPercentage}%; transition: width 0.3s;"></div>
                    </div>
                </div>
                ${completedCount > 0 ? `
                    <div style="max-height: 200px; overflow-y: auto;">
                        <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Recently Completed:</div>
                        ${completions.slice(0, 5).map(c => {
                            const emp = employees.find(e => (e.firestoreId || e.id) === c.employeeId);
                            const completedDate = c.completedAt ? (c.completedAt.toDate ? c.completedAt.toDate() : new Date(c.completedAt)) : null;
                            return `
                                <div style="display: flex; justify-content: space-between; padding: 8px; background: var(--bg-tertiary); border-radius: 6px; margin-bottom: 4px;">
                                    <span style="font-size: 13px; color: var(--text-primary);">
                                        <i class="fas fa-check-circle" style="color: #10b981;"></i> ${emp ? emp.name : 'Unknown Employee'}
                                    </span>
                                    <span style="font-size: 12px; color: var(--text-muted);">${completedDate ? formatDate(completedDate) : 'N/A'}</span>
                                </div>
                            `;
                        }).join('')}
                        ${completedCount > 5 ? `<div style="font-size: 12px; color: var(--text-muted); text-align: center; margin-top: 8px;">+${completedCount - 5} more</div>` : ''}
                    </div>
                ` : '<div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 14px;">No employees have completed this training yet</div>'}
            `;
        }

        // Open training completion modal
        function openTrainingCompletionModal(trainingId) {
            const training = trainings.find(t => t.id === trainingId || t.firestoreId === trainingId);
            if (!training) {
                showToast('Training not found', 'error');
                return;
            }

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            const completions = training.completions || [];
            const employeesWithStatus = employees.map(emp => {
                const empId = emp.firestoreId || emp.id;
                const completion = completions.find(c => c.employeeId === empId);
                return {
                    ...emp,
                    completed: !!completion,
                    completedAt: completion ? (completion.completedAt.toDate ? completion.completedAt.toDate() : new Date(completion.completedAt)) : null
                };
            });

            const completedEmployees = employeesWithStatus.filter(e => e.completed);
            const pendingEmployees = employeesWithStatus.filter(e => !e.completed);

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-check-circle"></i> Manage Completions: ${training.title}</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                            <div style="flex: 1; padding: 16px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; color: white;">
                                <div style="font-size: 28px; font-weight: 700;">${completedEmployees.length}</div>
                                <div style="font-size: 13px; opacity: 0.9;">Completed</div>
                            </div>
                            <div style="flex: 1; padding: 16px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 12px; color: white;">
                                <div style="font-size: 28px; font-weight: 700;">${pendingEmployees.length}</div>
                                <div style="font-size: 13px; opacity: 0.9;">Pending</div>
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 16px;">
                        <input type="text" id="completion-search" class="form-input" placeholder="Search employees..." oninput="filterCompletionList()">
                    </div>

                    <div id="completion-list" style="max-height: 400px; overflow-y: auto;">
                        ${employeesWithStatus.map(emp => `
                            <div class="completion-item" data-employee-name="${emp.name.toLowerCase()}">
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 8px;">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 500; color: var(--text-primary);">${emp.name}</div>
                                        <div style="font-size: 12px; color: var(--text-muted);">${emp.role} • ${emp.store}</div>
                                        ${emp.completed ? `<div style="font-size: 12px; color: #10b981; margin-top: 4px;"><i class="fas fa-check-circle"></i> Completed on ${formatDate(emp.completedAt)}</div>` : ''}
                                    </div>
                                    <div>
                                        ${emp.completed ? `
                                            <button class="btn-secondary" onclick="toggleEmployeeCompletion('${training.id}', '${emp.firestoreId || emp.id}', false)">
                                                <i class="fas fa-times"></i> Remove
                                            </button>
                                        ` : `
                                            <button class="btn-primary" onclick="toggleEmployeeCompletion('${training.id}', '${emp.firestoreId || emp.id}', true)">
                                                <i class="fas fa-check"></i> Mark Complete
                                            </button>
                                        `}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                </div>
            `;

            modal.classList.add('active');
        }

        // Filter completion list
        function filterCompletionList() {
            const search = document.getElementById('completion-search').value.toLowerCase();
            const items = document.querySelectorAll('.completion-item');

            items.forEach(item => {
                const name = item.dataset.employeeName;
                if (name.includes(search)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        }

        // Toggle employee completion
        async function toggleEmployeeCompletion(trainingId, employeeId, markComplete) {
            try {
                if (!firebaseTrainingManager.isInitialized) {
                    await firebaseTrainingManager.initialize();
                }

                let success;
                if (markComplete) {
                    success = await firebaseTrainingManager.markEmployeeCompleted(trainingId, employeeId);
                } else {
                    success = await firebaseTrainingManager.removeEmployeeCompletion(trainingId, employeeId);
                }

                if (success) {
                    showToast(markComplete ? 'Employee marked as completed' : 'Completion removed', 'success');

                    // Reload trainings to get updated completion data
                    await loadTrainingsFromFirebase();

                    // Re-open the modal with updated data
                    openTrainingCompletionModal(trainingId);
                } else {
                    throw new Error('Failed to update completion status');
                }
            } catch (error) {
                console.error('Error toggling completion:', error);
                showToast('Error updating completion status', 'error');
            }
        }

        // Theme toggle functionality
        function toggleTheme() {
            const body = document.body;
            const themeIcon = document.getElementById('theme-icon');

            if (body.classList.contains('light-theme')) {
                // Switch to dark theme
                body.classList.remove('light-theme');
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                // Switch to light theme
                body.classList.add('light-theme');
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                localStorage.setItem('theme', 'light');
            }
        }

        // Load theme on page load
        function loadTheme() {
            const savedTheme = localStorage.getItem('theme');
            const themeIcon = document.getElementById('theme-icon');

            // Default to light theme if no saved preference
            if (!savedTheme || savedTheme === 'light') {
                document.body.classList.add('light-theme');
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                if (!savedTheme) {
                    localStorage.setItem('theme', 'light');
                }
            }
        }

        // Sidebar collapse functionality (Desktop only)
        function toggleSidebarCollapse() {
            // Don't collapse on mobile
            if (window.innerWidth <= 768) return;

            const sidebar = document.querySelector('.sidebar');
            const body = document.body;

            sidebar.classList.toggle('collapsed');
            body.classList.toggle('sidebar-collapsed');

            // Save state to localStorage
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);

            // Update tooltip
            const collapseBtn = document.querySelector('.sidebar-collapse-btn');
            if (collapseBtn) {
                collapseBtn.title = isCollapsed ? 'Expand Menu' : 'Collapse Menu';
            }
        }

        // Load sidebar collapse state on page load
        function loadSidebarState() {
            // Only apply on desktop
            if (window.innerWidth <= 768) return;

            // Add data-tooltip to all nav-items for collapsed state
            document.querySelectorAll('.nav-item').forEach(item => {
                const text = item.textContent.trim();
                if (text && !item.hasAttribute('data-tooltip')) {
                    item.setAttribute('data-tooltip', text);
                }
            });

            const savedState = localStorage.getItem('sidebarCollapsed');
            if (savedState === 'true') {
                const sidebar = document.querySelector('.sidebar');
                const body = document.body;

                if (sidebar) {
                    sidebar.classList.add('collapsed');
                    body.classList.add('sidebar-collapsed');

                    const collapseBtn = document.querySelector('.sidebar-collapse-btn');
                    if (collapseBtn) {
                        collapseBtn.title = 'Expand Menu';
                    }
                }
            }
        }

        // Initialize sidebar state
        document.addEventListener('DOMContentLoaded', loadSidebarState);

        // Reset collapse on resize to mobile
        window.addEventListener('resize', function() {
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.sidebar');
                const body = document.body;
                if (sidebar) {
                    sidebar.classList.remove('collapsed');
                    body.classList.remove('sidebar-collapsed');
                }
            }
        });

        // Expose functions globally
        window.toggleSidebarCollapse = toggleSidebarCollapse;
        window.loadSidebarState = loadSidebarState;

        // User menu dropdown functionality
        function toggleUserMenu() {
            const container = document.querySelector('.user-menu-container');
            if (container) {
                container.classList.toggle('open');
            }
        }

        function closeUserMenu() {
            const container = document.querySelector('.user-menu-container');
            if (container) {
                container.classList.remove('open');
            }
        }

        // Close user menu when clicking outside
        document.addEventListener('click', function(e) {
            const container = document.querySelector('.user-menu-container');
            if (container && !container.contains(e.target)) {
                container.classList.remove('open');
            }
        });

        // Logout functionality
        async function logout() {
            // Log the logout activity before clearing session
            try {
                const user = getCurrentUser();
                if (user && typeof logActivity === 'function') {
                    await logActivity(ACTIVITY_TYPES.LOGOUT, {
                        message: 'User logged out'
                    }, 'user', user.userId || user.id);
                }
            } catch (error) {
                console.error('Error logging logout activity:', error);
            }

            // Clear auth data
            if (typeof authManager !== 'undefined') {
                authManager.logout();
            }

            // Clear all localStorage data for security
            localStorage.clear();

            // Also clear sessionStorage to ensure clean state
            sessionStorage.clear();

            // Redirect to login page
            window.location.href = 'login.html';
        }

        // Global Search Functionality
        let searchTimeout = null;

        function handleGlobalSearch(query) {
            // Clear previous timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            // Debounce search for better performance
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 150);
        }

        function performSearch(query) {
            const dropdown = document.getElementById('search-results-dropdown');
            const resultsList = document.getElementById('search-results-list');

            if (!query || query.trim().length < 2) {
                dropdown.classList.remove('show');
                return;
            }

            const searchTerm = query.toLowerCase().trim();
            const results = [];

            // Search Employees
            const employeeResults = employees.filter(emp =>
                (emp.name && emp.name.toLowerCase().includes(searchTerm)) ||
                (emp.role && emp.role.toLowerCase().includes(searchTerm)) ||
                (emp.store && emp.store.toLowerCase().includes(searchTerm)) ||
                (emp.authEmail && emp.authEmail.toLowerCase().includes(searchTerm))
            ).slice(0, 5);

            if (employeeResults.length > 0) {
                results.push({
                    category: 'Employees',
                    icon: 'fa-users',
                    page: 'employees',
                    items: employeeResults.map(emp => ({
                        id: emp.id,
                        title: emp.name,
                        subtitle: `${emp.role} - ${emp.store}`,
                        status: emp.status
                    }))
                });
            }

            // Search Thieves Database
            const thiefResults = thieves.filter(thief =>
                (thief.name && thief.name.toLowerCase().includes(searchTerm)) ||
                (thief.store && thief.store.toLowerCase().includes(searchTerm)) ||
                (thief.crimeType && thief.crimeType.toLowerCase().includes(searchTerm)) ||
                (thief.itemsStolen && thief.itemsStolen.toLowerCase().includes(searchTerm))
            ).slice(0, 5);

            if (thiefResults.length > 0) {
                results.push({
                    category: 'Thief Database',
                    icon: 'fa-user-secret',
                    page: 'thieves',
                    items: thiefResults.map(thief => ({
                        id: thief.id,
                        title: thief.name,
                        subtitle: `${thief.crimeType} - ${thief.store}`,
                        status: thief.banned ? 'banned' : 'active'
                    }))
                });
            }

            // Search Invoices
            const invoiceResults = invoices.filter(inv =>
                (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(searchTerm)) ||
                (inv.vendor && inv.vendor.toLowerCase().includes(searchTerm)) ||
                (inv.category && inv.category.toLowerCase().includes(searchTerm)) ||
                (inv.description && inv.description.toLowerCase().includes(searchTerm))
            ).slice(0, 5);

            if (invoiceResults.length > 0) {
                results.push({
                    category: 'Invoices',
                    icon: 'fa-file-invoice-dollar',
                    page: 'invoices',
                    items: invoiceResults.map(inv => ({
                        id: inv.id,
                        title: inv.invoiceNumber,
                        subtitle: `${inv.vendor} - $${inv.amount.toFixed(2)}`,
                        status: inv.status
                    }))
                });
            }

            // Search Products (New Stuff)
            const productResults = products.filter(prod =>
                (prod.name && prod.name.toLowerCase().includes(searchTerm)) ||
                (prod.category && prod.category.toLowerCase().includes(searchTerm)) ||
                (prod.store && prod.store.toLowerCase().includes(searchTerm)) ||
                (prod.supplier && prod.supplier.toLowerCase().includes(searchTerm))
            ).slice(0, 5);

            if (productResults.length > 0) {
                results.push({
                    category: 'New Products',
                    icon: 'fa-box-open',
                    page: 'newstuff',
                    items: productResults.map(prod => ({
                        id: prod.id,
                        title: prod.name,
                        subtitle: `${prod.category} - ${prod.store}`,
                        status: prod.status
                    }))
                });
            }

            // Search Inventory
            const inventoryResults = inventory.filter(item =>
                (item.brand && item.brand.toLowerCase().includes(searchTerm)) ||
                (item.productName && item.productName.toLowerCase().includes(searchTerm)) ||
                (item.flavor && item.flavor.toLowerCase().includes(searchTerm)) ||
                (item.store && item.store.toLowerCase().includes(searchTerm))
            ).slice(0, 5);

            if (inventoryResults.length > 0) {
                results.push({
                    category: 'Inventory',
                    icon: 'fa-warehouse',
                    page: 'restock',
                    items: inventoryResults.map(item => ({
                        id: item.id,
                        title: `${item.brand} ${item.productName}`,
                        subtitle: `${item.flavor} - ${item.store} (${item.stock} in stock)`,
                        status: item.stock <= item.minStock ? 'low' : 'ok'
                    }))
                });
            }

            // Search Announcements
            const announcementResults = announcements.filter(ann =>
                (ann.title && ann.title.toLowerCase().includes(searchTerm)) ||
                (ann.content && ann.content.toLowerCase().includes(searchTerm)) ||
                (ann.author && ann.author.toLowerCase().includes(searchTerm))
            ).slice(0, 5);

            if (announcementResults.length > 0) {
                results.push({
                    category: 'Announcements',
                    icon: 'fa-bullhorn',
                    page: 'announcements',
                    items: announcementResults.map(ann => ({
                        id: ann.id,
                        title: ann.title,
                        subtitle: `${ann.date} - ${ann.author}`,
                        status: 'info'
                    }))
                });
            }

            // Search Modules
            const modules = [
                { name: 'Dashboard', page: 'dashboard', icon: 'fa-th-large' },
                { name: 'Employees', page: 'employees', icon: 'fa-users' },
                { name: 'Schedule', page: 'schedule', icon: 'fa-calendar-alt' },
                { name: 'Clock In/Out', page: 'clockin', icon: 'fa-clock' },
                { name: 'Training Center', page: 'training', icon: 'fa-graduation-cap' },
                { name: 'Licenses & Docs', page: 'licenses', icon: 'fa-folder-open' },
                { name: 'Sales & Analytics', page: 'analytics', icon: 'fa-chart-line' },
                { name: 'Product Requests', page: 'restock', icon: 'fa-boxes' },
                { name: 'Supplies', page: 'supplies', icon: 'fa-shopping-basket' },
                { name: 'Daily Checklist', page: 'dailychecklist', icon: 'fa-clipboard-check' },
                { name: 'Abundance Cloud', page: 'abundancecloud', icon: 'fa-cloud' },
                { name: 'Announcements', page: 'announcements', icon: 'fa-bullhorn' },
                { name: 'Thief Database', page: 'thieves', icon: 'fa-user-secret' },
                { name: 'Invoices & Payments', page: 'invoices', icon: 'fa-file-invoice-dollar' },
                { name: 'Issues Registry', page: 'issues', icon: 'fa-exclamation-triangle' },
                { name: 'Gconomics', page: 'gconomics', icon: 'fa-wallet' },
                { name: 'Vendors & Suppliers', page: 'vendors', icon: 'fa-truck' },
                { name: 'Cash Control', page: 'cashout', icon: 'fa-money-bill-wave' },
                { name: 'Heady Pieces', page: 'treasury', icon: 'fa-vault' },
                { name: 'Change Records', page: 'change', icon: 'fa-coins' },
                { name: 'Customer Care', page: 'customercare', icon: 'fa-heart' },
                { name: 'Password Manager', page: 'passwords', icon: 'fa-key' },
                { name: 'G Force', page: 'gforce', icon: 'fa-bolt' },
                { name: 'Project Analytics', page: 'projectanalytics', icon: 'fa-code' }
            ];

            const moduleResults = modules.filter(mod =>
                mod.name.toLowerCase().includes(searchTerm)
            ).slice(0, 10);

            if (moduleResults.length > 0) {
                results.push({
                    category: 'Modules',
                    icon: 'fa-cube',
                    page: 'module',
                    items: moduleResults.map(mod => ({
                        id: mod.page,
                        title: mod.name,
                        subtitle: 'Navigate to module',
                        status: 'info',
                        moduleIcon: mod.icon
                    }))
                });
            }

            // Render results
            renderSearchResults(results, resultsList, dropdown);
        }

        function renderSearchResults(results, resultsList, dropdown) {
            if (results.length === 0) {
                resultsList.innerHTML = `
                    <div class="search-empty">
                        <i class="fas fa-search"></i>
                        <p>No results found</p>
                    </div>
                `;
                dropdown.classList.add('show');
                return;
            }

            let html = '';

            results.forEach(category => {
                html += `<div class="search-category">${category.category}</div>`;

                category.items.forEach(item => {
                    const statusClass = getStatusClass(item.status);
                    const iconClass = item.moduleIcon || category.icon;
                    html += `
                        <div class="search-result-item" onclick="navigateToSearchResult('${category.page}', ${typeof item.id === 'string' ? `'${item.id}'` : item.id})">
                            <div class="search-result-icon">
                                <i class="fas ${iconClass}"></i>
                            </div>
                            <div class="search-result-info">
                                <div class="search-result-title">${escapeHtml(item.title)}</div>
                                <div class="search-result-subtitle">${escapeHtml(item.subtitle)}</div>
                            </div>
                            <span class="search-result-status ${statusClass}">${item.status}</span>
                        </div>
                    `;
                });
            });

            html += `
                <div class="search-shortcut-hint" style="text-align: center;">
                    <span><kbd>Esc</kbd> to close</span>
                </div>
            `;

            resultsList.innerHTML = html;
            dropdown.classList.add('show');
        }

        function getStatusClass(status) {
            const statusMap = {
                'active': 'status-active',
                'inactive': 'status-inactive',
                'banned': 'status-banned',
                'pending': 'status-pending',
                'paid': 'status-paid',
                'overdue': 'status-overdue',
                'arrived': 'status-arrived',
                'low': 'status-low',
                'ok': 'status-ok',
                'info': 'status-info'
            };
            return statusMap[status] || 'status-default';
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function navigateToSearchResult(page, itemId) {
            // Hide search dropdown
            hideSearchResults();

            // Clear both search inputs (desktop and mobile)
            const searchInput = document.getElementById('global-search');
            const mobileSearchInput = document.getElementById('mobile-global-search');
            if (searchInput) {
                searchInput.value = '';
            }
            if (mobileSearchInput) {
                mobileSearchInput.value = '';
            }

            // If it's a module search result, navigate directly to that module
            if (page === 'module') {
                navigateTo(itemId);
            } else {
                // Navigate to the page
                navigateTo(page);

                // Open the specific item after navigation
                if (itemId) {
                    setTimeout(() => {
                        if (page === 'invoices' && typeof viewInvoice === 'function') {
                            viewInvoice(itemId);
                        } else if (page === 'employees' && typeof viewEmployeeDetails === 'function') {
                            viewEmployeeDetails(itemId);
                        } else if (page === 'thieves' && typeof viewThiefDetails === 'function') {
                            viewThiefDetails(itemId);
                        } else if (page === 'treasury' && typeof viewTreasuryPiece === 'function') {
                            viewTreasuryPiece(itemId);
                        }
                    }, 300);
                }
            }
        }

        function showSearchResults() {
            const dropdown = document.getElementById('search-results-dropdown');
            const searchInput = document.getElementById('global-search');
            const mobileSearchInput = document.getElementById('mobile-global-search');

            // Check both desktop and mobile inputs
            const desktopQuery = searchInput ? searchInput.value.trim() : '';
            const mobileQuery = mobileSearchInput ? mobileSearchInput.value.trim() : '';
            const query = desktopQuery || mobileQuery;

            if (query.length >= 2) {
                performSearch(query);
            }
        }

        function hideSearchResults() {
            const dropdown = document.getElementById('search-results-dropdown');
            if (dropdown) {
                dropdown.classList.remove('show');
            }
        }

        // Close search dropdown when clicking outside
        document.addEventListener('click', function(e) {
            const searchContainer = document.querySelector('.search-bar-container');
            const mobileSearchContainer = document.querySelector('.mobile-header-search');
            const clickedInSearch = (searchContainer && searchContainer.contains(e.target)) ||
                                   (mobileSearchContainer && mobileSearchContainer.contains(e.target));
            if (!clickedInSearch) {
                hideSearchResults();
            }
        });

        // Keyboard shortcuts for search
        document.addEventListener('keydown', function(e) {
            const dropdown = document.getElementById('search-results-dropdown');
            const isDropdownVisible = dropdown && dropdown.classList.contains('show');
            
            // Ctrl+K or Cmd+K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                // Focus appropriate search based on screen size
                const mobileSearch = document.getElementById('mobile-global-search');
                const desktopSearch = document.getElementById('global-search');
                const isMobile = window.innerWidth <= 768;

                if (isMobile && mobileSearch) {
                    mobileSearch.focus();
                    mobileSearch.select();
                } else if (desktopSearch) {
                    desktopSearch.focus();
                    desktopSearch.select();
                }
            }

            // Escape to close search dropdown
            if (e.key === 'Escape') {
                hideSearchResults();
                const searchInput = document.getElementById('global-search');
                const mobileSearchInput = document.getElementById('mobile-global-search');
                if (searchInput) {
                    searchInput.blur();
                }
                if (mobileSearchInput) {
                    mobileSearchInput.blur();
                }
            }
        });

        // Load theme on page initialization
        loadTheme();

        // Mobile menu toggle
        function toggleMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('mobile-open');
        }

        // Close mobile menu when clicking nav items (with delay for navigation to complete)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    const sidebar = document.querySelector('.sidebar');
                    // Small delay to ensure navigation starts before closing
                    setTimeout(() => {
                        sidebar.classList.remove('mobile-open');
                    }, 150);
                }
            });
        });

        // Close mobile menu when clicking outside (but not during scroll)
        let lastTouchY = 0;
        let isScrolling = false;

        document.addEventListener('touchstart', function(e) {
            lastTouchY = e.touches[0].clientY;
            isScrolling = false;
        }, { passive: true });

        document.addEventListener('touchmove', function(e) {
            const deltaY = Math.abs(e.touches[0].clientY - lastTouchY);
            if (deltaY > 10) {
                isScrolling = true;
            }
        }, { passive: true });

        document.addEventListener('click', function(event) {
            if (window.innerWidth <= 768) {
                // Don't close if user was scrolling
                if (isScrolling) {
                    isScrolling = false;
                    return;
                }

                const sidebar = document.querySelector('.sidebar');
                const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

                // Check if sidebar is open and click is outside sidebar and menu button
                if (sidebar && sidebar.classList.contains('mobile-open') &&
                    !sidebar.contains(event.target) &&
                    mobileMenuBtn && !mobileMenuBtn.contains(event.target)) {
                    sidebar.classList.remove('mobile-open');
                }
            }
        });

        // Dropdown toggle functionality
        function toggleDropdown(event, dropdownId) {
            event.preventDefault();
            const dropdown = document.getElementById(`dropdown-${dropdownId}`);
            const navItem = event.currentTarget;
            const icon = navItem.querySelector('.dropdown-icon');

            // Close all other dropdowns
            document.querySelectorAll('.nav-dropdown').forEach(dd => {
                if (dd !== dropdown) {
                    dd.classList.remove('open');
                    const otherIcon = dd.previousElementSibling.querySelector('.dropdown-icon');
                    if (otherIcon) otherIcon.style.transform = '';
                }
            });

            // Toggle current dropdown
            dropdown.classList.toggle('open');
            if (dropdown.classList.contains('open')) {
                icon.style.transform = 'rotate(180deg)';
            } else {
                icon.style.transform = '';
            }
        }

        // Make toggleDropdown globally accessible
        window.toggleDropdown = toggleDropdown;

        // Drag and drop functionality for licenses
        let draggedLicenseId = null;
        let licensesEditMode = false;  // Edit mode toggle for drag and drop

        function handleLicenseDragStart(event, licenseId) {
            if (!licensesEditMode) {
                event.preventDefault();
                return;
            }
            draggedLicenseId = licenseId;
            event.target.classList.add('dragging');
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', licenseId);
        }

        function handleLicenseDragEnd(event) {
            event.target.classList.remove('dragging');
            draggedLicenseId = null;
            // Remove drag-over class from all zones
            document.querySelectorAll('.license-store-zone').forEach(zone => {
                zone.classList.remove('drag-over');
            });
        }

        function handleLicenseDragOver(event) {
            if (!licensesEditMode) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            const dropZone = event.currentTarget;
            dropZone.classList.add('drag-over');
        }

        function handleLicenseDragLeave(event) {
            const dropZone = event.currentTarget;
            dropZone.classList.remove('drag-over');
        }

        async function handleLicenseDrop(event, targetStore) {
            if (!licensesEditMode) return;
            event.preventDefault();
            const dropZone = event.currentTarget;
            dropZone.classList.remove('drag-over');

            if (draggedLicenseId !== null) {
                const license = licenses.find(l => l.id === draggedLicenseId || l.firestoreId === draggedLicenseId);
                if (license && license.store !== targetStore) {
                    const oldStore = license.store;
                    const licenseName = license.name;
                    const licenseFirestoreId = license.firestoreId || license.id;

                    // Update local state immediately
                    license.store = targetStore;
                    renderLicenses();

                    // Save to Firebase immediately
                    try {
                        if (firebaseLicensesManager && firebaseLicensesManager.isInitialized) {
                            await firebaseLicensesManager.updateLicense(licenseFirestoreId, { store: targetStore });
                            showToast(`"${licenseName}" moved to ${targetStore}`, 'success');
                        }
                    } catch (error) {
                        console.error('❌ Error saving license move to Firebase:', error);
                        // Revert local change on error
                        license.store = oldStore;
                        renderLicenses();
                        showToast('Error saving change. Please try again.', 'error');
                    }
                }
                draggedLicenseId = null;
            }
        }

        function toggleLicensesEditMode() {
            licensesEditMode = !licensesEditMode;
            renderLicenses();
        }

        function viewLicense(licenseId) {
            const license = licenses.find(l => l.id === licenseId || l.firestoreId === licenseId);
            if (!license) return;

            // Always show the aesthetic modal preview
            viewLicensePdf(licenseId);
        }

        // Note: deleteLicense is defined earlier in the file with Firebase support

        // RISK NOTES FUNCTIONALITY
        const RISK_BEHAVIOR_TYPES = [
            { id: 'strange_questions', label: 'Strange Questions', icon: 'fa-question-circle', color: '#f59e0b' },
            { id: 'unusual_purchase', label: 'Unusual Purchase', icon: 'fa-shopping-cart', color: '#3b82f6' },
            { id: 'recording', label: 'Recording / Taking Photos', icon: 'fa-camera', color: '#8b5cf6' },
            { id: 'policy_violation', label: 'Policy Violation Attempt', icon: 'fa-ban', color: '#ef4444' },
            { id: 'suspicious_attitude', label: 'Suspicious Attitude', icon: 'fa-user-secret', color: '#ec4899' },
            { id: 'other', label: 'Other', icon: 'fa-ellipsis', color: '#6b7280' }
        ];

        const RISK_LEVELS = [
            { id: 'low', label: 'Low', color: '#22c55e', icon: 'fa-circle' },
            { id: 'medium', label: 'Medium', color: '#f59e0b', icon: 'fa-circle' },
            { id: 'high', label: 'High', color: '#ef4444', icon: 'fa-circle' }
        ];

        const RISK_STORES = [
            'Miramar',
            'Morena',
            'Kearny Mesa',
            'Chula Vista',
            'North Park',
            'Miramar Wine & Liquor'
        ];

        // IndexedDB setup for storing images
        let riskPhotoDB = null;
        const initRiskPhotoDB = async () => {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open('RiskNotesDB', 1);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => {
                    riskPhotoDB = request.result;
                    resolve(riskPhotoDB);
                };
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('photos')) {
                        db.createObjectStore('photos', { keyPath: 'id' });
                    }
                };
            });
        };

        const savePhotoToIndexedDB = async (noteId, photoData) => {
            if (!riskPhotoDB) await initRiskPhotoDB();
            return new Promise((resolve, reject) => {
                const tx = riskPhotoDB.transaction('photos', 'readwrite');
                const store = tx.objectStore('photos');
                store.put({ id: noteId, data: photoData });
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        };

        const getPhotoFromIndexedDB = async (noteId) => {
            if (!riskPhotoDB) await initRiskPhotoDB();
            return new Promise((resolve, reject) => {
                const tx = riskPhotoDB.transaction('photos', 'readonly');
                const store = tx.objectStore('photos');
                const request = store.get(noteId);
                request.onsuccess = () => resolve(request.result?.data);
                request.onerror = () => reject(request.error);
            });
        };

        const deletePhotoFromIndexedDB = async (noteId) => {
            if (!riskPhotoDB) await initRiskPhotoDB();
            return new Promise((resolve, reject) => {
                const tx = riskPhotoDB.transaction('photos', 'readwrite');
                const store = tx.objectStore('photos');
                const request = store.delete(noteId);
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        };

        // Initialize IndexedDB on page load
        initRiskPhotoDB().catch(err => {
            console.error('Failed to initialize IndexedDB:', err);
        });

        var riskNotesState = {
            notes: [], // Start empty, will be populated from Firebase
            filterStore: 'all',
            filterLevel: 'all',
            filterType: 'all',
            viewMode: 'list', // 'list' or 'grid'
            isLoading: true // Flag to show loading state
        };

        // Load from localStorage only as fallback until Firebase loads
        (function loadInitialRiskNotes() {
            const localNotes = JSON.parse(localStorage.getItem('riskNotes')) || [];
            if (localNotes.length > 0) {
                riskNotesState.notes = localNotes;
            }
        })();

        // Load risk notes from Firebase when available
        async function loadRiskNotesFromFirebase() {
            // Wait for firebaseSyncManager to be initialized
            if (typeof firebaseSyncManager === 'undefined') {
                console.log('FirebaseSyncManager not available');
                return;
            }

            // If not initialized yet, try to initialize
            if (!firebaseSyncManager.isInitialized) {
                try {
                    await firebaseSyncManager.initialize();
                } catch (err) {
                    console.error('Failed to initialize firebaseSyncManager:', err);
                    return;
                }
            }

            if (!firebaseSyncManager.isInitialized) {
                console.log('FirebaseSyncManager could not be initialized');
                return;
            }

            try {
                console.log('📥 Loading risk notes from Firebase...');
                const firebaseNotes = await firebaseSyncManager.loadRiskNotesFromFirestore();

                // Firebase is the SINGLE source of truth
                // Clear localStorage first to prevent zombie data
                localStorage.removeItem('riskNotes');

                if (firebaseNotes && firebaseNotes.length >= 0) {
                    // Use Firebase data directly (even if empty - that means all were deleted)
                    riskNotesState.notes = firebaseNotes;
                    riskNotesState.isLoading = false;
                    saveRiskNotes();
                    console.log(`✅ Loaded ${firebaseNotes.length} risk notes from Firebase`);
                }

                // Re-render if on risknotes page
                if (window.currentPage === 'risknotes') {
                    renderRiskNotes();
                }
            } catch (error) {
                console.error('Error loading risk notes from Firebase:', error);
            }
        }

        // Listen for Firebase sync ready event
        window.addEventListener('firebaseSyncReady', () => {
            console.log('🔥 Firebase sync ready - loading risk notes');
            loadRiskNotesFromFirebase();
        });

        // Also try to load after a delay as fallback
        setTimeout(() => {
            if (riskNotesState.notes.length === 0 || !riskNotesState.notes.some(n => n.firestoreId)) {
                loadRiskNotesFromFirebase();
            }
        }, 2000);

        function saveRiskNotes() {
            // Store notes WITHOUT photo data in localStorage (only metadata)
            const notesForStorage = riskNotesState.notes.map(note => {
                const { photo, ...noteData } = note;
                return noteData;
            });
            localStorage.setItem('riskNotes', JSON.stringify(notesForStorage));
        }

