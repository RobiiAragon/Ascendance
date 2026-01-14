        // ==========================================
        // PTO / VACATION REQUEST SYSTEM
        // ==========================================

        const PTO_REQUEST_TYPES = {
            vacation: { label: 'Vacation', icon: 'fa-umbrella-beach', color: '#10b981' },
            sick: { label: 'Sick Leave', icon: 'fa-briefcase-medical', color: '#ef4444' },
            personal: { label: 'Personal Day', icon: 'fa-user', color: '#6366f1' },
            pto: { label: 'PTO', icon: 'fa-calendar-check', color: '#f59e0b' }
        };

        const PTO_STATUS_CONFIG = {
            pending: { label: 'Pending', color: '#f59e0b', icon: 'fa-clock' },
            approved: { label: 'Approved', color: '#10b981', icon: 'fa-check-circle' },
            rejected: { label: 'Rejected', color: '#ef4444', icon: 'fa-times-circle' }
        };

        let ptoRequests = [];

        /**
         * Parse a YYYY-MM-DD date string as LOCAL time (not UTC)
         * This fixes the timezone bug where dates appear as the previous day
         */
        function parseLocalDate(dateString) {
            if (!dateString) return new Date();
            // Split the date string and create a local date
            const [year, month, day] = dateString.split('-').map(Number);
            return new Date(year, month - 1, day); // month is 0-indexed
        }

        function openPTORequestModal(employeeId) {
            const emp = employees.find(e => e.id === employeeId || e.firestoreId === employeeId);
            if (!emp) {
                showNotification('Employee not found', 'error');
                return;
            }

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');
            // Minimum date is 30 days from today
            const minDate = new Date();
            minDate.setDate(minDate.getDate() + 30);
            const minDateStr = minDate.toISOString().split('T')[0];

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-umbrella-beach" style="color: #10b981;"></i> Request Time Off</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div style="padding: 12px 16px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-exclamation-triangle" style="color: #f59e0b; font-size: 18px;"></i>
                            <div>
                                <div style="font-weight: 600; color: #f59e0b;">30-Day Advance Notice Required</div>
                                <div style="font-size: 13px; color: var(--text-secondary);">Time off requests must be submitted at least 30 days in advance.</div>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 12px; background: var(--bg-main); border-radius: 8px;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: ${emp.color || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
                            ${emp.initials || emp.name?.substring(0, 2).toUpperCase() || '?'}
                        </div>
                        <div>
                            <div style="font-weight: 600;">${emp.name}</div>
                            <div style="font-size: 13px; color: var(--text-muted);">${emp.store || 'No store'}</div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Request Type *</label>
                        <div class="pto-type-selector" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                            ${Object.entries(PTO_REQUEST_TYPES).map(([key, config]) => `
                                <label class="pto-type-option" style="display: flex; align-items: center; gap: 10px; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                                    <input type="radio" name="pto-type" value="${key}" style="display: none;" onchange="this.closest('.pto-type-option').style.borderColor='${config.color}'">
                                    <i class="fas ${config.icon}" style="color: ${config.color}; font-size: 18px;"></i>
                                    <span>${config.label}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label>Start Date *</label>
                            <input type="date" class="form-input" id="pto-start-date" min="${minDateStr}" onchange="updatePTODuration()">
                        </div>
                        <div class="form-group">
                            <label>End Date *</label>
                            <input type="date" class="form-input" id="pto-end-date" min="${minDateStr}" onchange="updatePTODuration()">
                        </div>
                    </div>

                    <div id="pto-duration-display" style="padding: 12px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%); border-radius: 8px; text-align: center; margin-bottom: 16px; display: none;">
                        <span style="font-size: 24px; font-weight: 700; color: var(--accent-primary);" id="pto-days-count">0</span>
                        <span style="color: var(--text-muted);"> day(s) requested</span>
                    </div>

                    <div class="form-group">
                        <label>Reason / Notes</label>
                        <textarea class="form-input" id="pto-reason" rows="3" placeholder="Optional: Add any notes or reason for your request..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                    <button class="btn-primary" onclick="submitPTORequest('${emp.id}')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                        <i class="fas fa-paper-plane"></i> Submit Request
                    </button>
                </div>

                <style>
                    .pto-type-option:has(input:checked) {
                        background: var(--bg-main);
                        border-width: 2px;
                    }
                    .pto-type-option:hover {
                        background: var(--bg-main);
                    }
                </style>
            `;
            modal.classList.add('active');

            // Set default type
            const firstRadio = document.querySelector('input[name="pto-type"]');
            if (firstRadio) {
                firstRadio.checked = true;
                firstRadio.closest('.pto-type-option').style.borderColor = '#10b981';
            }
        }

        function updatePTODuration() {
            const startDate = document.getElementById('pto-start-date')?.value;
            const endDate = document.getElementById('pto-end-date')?.value;
            const display = document.getElementById('pto-duration-display');
            const countEl = document.getElementById('pto-days-count');

            if (startDate && endDate && display && countEl) {
                const start = parseLocalDate(startDate);
                const end = parseLocalDate(endDate);
                const diffTime = end - start;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                if (diffDays > 0) {
                    countEl.textContent = diffDays;
                    display.style.display = 'block';
                } else {
                    display.style.display = 'none';
                }
            }
        }

        async function submitPTORequest(employeeId) {
            const emp = employees.find(e => e.id === employeeId || e.firestoreId === employeeId);
            if (!emp) {
                showNotification('Employee not found', 'error');
                return;
            }

            const requestType = document.querySelector('input[name="pto-type"]:checked')?.value;
            const startDate = document.getElementById('pto-start-date')?.value;
            const endDate = document.getElementById('pto-end-date')?.value;
            const reason = document.getElementById('pto-reason')?.value || '';

            if (!requestType) {
                showNotification('Please select a request type', 'warning');
                return;
            }

            if (!startDate || !endDate) {
                showNotification('Please select start and end dates', 'warning');
                return;
            }

            if (parseLocalDate(endDate) < parseLocalDate(startDate)) {
                showNotification('End date must be after start date', 'warning');
                return;
            }

            const currentUser = getCurrentUser();

            const requestData = {
                employeeId: emp.id || emp.firestoreId,
                employeeName: emp.name,
                employeeStore: emp.store || '',
                requestType: requestType,
                startDate: startDate,
                endDate: endDate,
                reason: reason,
                status: 'pending',
                requestedAt: firebase.firestore.FieldValue.serverTimestamp(),
                requestedBy: currentUser?.name || emp.name,
                reviewedAt: null,
                reviewedBy: null,
                reviewNotes: ''
            };

            try {
                const db = firebase.firestore();
                await db.collection(window.FIREBASE_COLLECTIONS?.dayOffRequests || 'dayOffRequests').add(requestData);

                showNotification('Time off request submitted successfully!', 'success');
                closeModal();

                // Reload PTO requests if on that page
                if (typeof loadPTORequests === 'function') {
                    loadPTORequests();
                }
            } catch (error) {
                console.error('Error submitting PTO request:', error);
                showNotification('Error submitting request. Please try again.', 'error');
            }
        }

        async function loadPTORequests() {
            try {
                const db = firebase.firestore();
                const snapshot = await db.collection(window.FIREBASE_COLLECTIONS?.dayOffRequests || 'dayOffRequests')
                    .orderBy('requestedAt', 'desc')
                    .get();

                ptoRequests = [];
                snapshot.forEach(doc => {
                    ptoRequests.push({ id: doc.id, ...doc.data() });
                });

                updatePTOPendingBadge();
                return ptoRequests;
            } catch (error) {
                console.error('Error loading PTO requests:', error);
                return [];
            }
        }

        function updatePTOPendingBadge() {
            const badge = document.getElementById('pto-pending-badge');
            if (badge) {
                const pendingCount = ptoRequests.filter(r => r.status === 'pending').length;
                badge.textContent = pendingCount;
                badge.style.display = pendingCount > 0 ? 'inline-flex' : 'none';
            }
        }

        async function approvePTORequest(requestId) {
            const currentUser = getCurrentUser();

            try {
                const db = firebase.firestore();
                const request = ptoRequests.find(r => r.id === requestId);

                await db.collection(window.FIREBASE_COLLECTIONS?.dayOffRequests || 'dayOffRequests').doc(requestId).update({
                    status: 'approved',
                    reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    reviewedBy: currentUser?.name || 'Manager'
                });

                // Also add to daysOff collection for each day in the range
                if (request) {
                    const start = parseLocalDate(request.startDate);
                    const end = parseLocalDate(request.endDate);

                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                        const dateKey = formatDateKey(d);
                        const dayOffData = {
                            employeeId: request.employeeId,
                            employeeName: request.employeeName,
                            store: request.employeeStore,
                            date: dateKey,
                            createdAt: new Date().toISOString(),
                            createdBy: currentUser?.name || 'Manager',
                            ptoRequestId: requestId
                        };
                        await db.collection(window.FIREBASE_COLLECTIONS?.daysOff || 'daysOff').add(dayOffData);
                    }
                }

                showNotification('Request approved!', 'success');
                await loadPTORequests();
                renderPTORequestsPage();
            } catch (error) {
                console.error('Error approving request:', error);
                showNotification('Error approving request', 'error');
            }
        }

        async function rejectPTORequest(requestId, reason = '') {
            const currentUser = getCurrentUser();

            try {
                const db = firebase.firestore();
                await db.collection(window.FIREBASE_COLLECTIONS?.dayOffRequests || 'dayOffRequests').doc(requestId).update({
                    status: 'rejected',
                    reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    reviewedBy: currentUser?.name || 'Manager',
                    reviewNotes: reason
                });

                showNotification('Request rejected', 'info');
                await loadPTORequests();
                renderPTORequestsPage();
            } catch (error) {
                console.error('Error rejecting request:', error);
                showNotification('Error rejecting request', 'error');
            }
        }

        function openEditPTOModal(requestId) {
            const request = ptoRequests.find(r => r.id === requestId);
            if (!request) {
                showNotification('Request not found', 'error');
                return;
            }

            const currentUser = getCurrentUser();
            const isManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';
            const isOwner = request.employeeId === currentUser?.id ||
                           request.employeeId === currentUser?.firestoreId ||
                           request.requestedBy === currentUser?.name;

            // Only owner or manager can edit
            if (!isManager && !isOwner) {
                showNotification('You can only edit your own requests', 'error');
                return;
            }

            // If approved, dates cannot be changed - must create new request
            const isApproved = request.status === 'approved';
            const dateFieldsDisabled = isApproved ? 'disabled' : '';
            const dateWarning = isApproved ? `
                <div style="padding: 12px 16px; background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2); margin-bottom: 16px; display: flex; align-items: flex-start; gap: 12px;">
                    <i class="fas fa-lock" style="color: #ef4444; font-size: 18px;"></i>
                    <div>
                        <div style="font-weight: 600; color: #ef4444;">Dates Locked</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">This request has been approved. To change dates, you must create a new request.</div>
                    </div>
                </div>
            ` : '';

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            const typeConfig = PTO_REQUEST_TYPES[request.requestType] || PTO_REQUEST_TYPES.pto;

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-edit" style="color: #6366f1;"></i> Edit Time Off Request</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    ${dateWarning}

                    <div class="form-group">
                        <label>Request Type *</label>
                        <div class="pto-type-selector" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                            ${Object.entries(PTO_REQUEST_TYPES).map(([key, config]) => `
                                <label class="pto-type-option" style="display: flex; align-items: center; gap: 10px; padding: 12px; border: 2px solid ${request.requestType === key ? config.color : 'var(--border-color)'}; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                                    <input type="radio" name="edit-pto-type" value="${key}" ${request.requestType === key ? 'checked' : ''} style="display: none;" onchange="this.closest('.pto-type-selector').querySelectorAll('.pto-type-option').forEach(o => o.style.borderColor = 'var(--border-color)'); this.closest('.pto-type-option').style.borderColor='${config.color}'">
                                    <i class="fas ${config.icon}" style="color: ${config.color}; font-size: 18px;"></i>
                                    <span>${config.label}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label>Start Date *</label>
                            <input type="date" class="form-input" id="edit-pto-start-date" value="${request.startDate}" ${dateFieldsDisabled} onchange="updateEditPTODuration()">
                        </div>
                        <div class="form-group">
                            <label>End Date *</label>
                            <input type="date" class="form-input" id="edit-pto-end-date" value="${request.endDate}" ${dateFieldsDisabled} onchange="updateEditPTODuration()">
                        </div>
                    </div>

                    <div id="edit-pto-duration-display" style="padding: 12px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%); border-radius: 8px; text-align: center; margin-bottom: 16px;">
                        <span style="font-size: 24px; font-weight: 700; color: var(--accent-primary);" id="edit-pto-days-count">${Math.ceil((parseLocalDate(request.endDate) - parseLocalDate(request.startDate)) / (1000 * 60 * 60 * 24)) + 1}</span>
                        <span style="color: var(--text-muted);"> day(s) requested</span>
                    </div>

                    <div class="form-group">
                        <label>Reason / Notes</label>
                        <textarea class="form-input" id="edit-pto-reason" rows="3" placeholder="Optional: Add any notes or reason for your request...">${request.reason || ''}</textarea>
                    </div>

                    ${request.editHistory && request.editHistory.length > 0 ? `
                        <div style="margin-top: 16px; padding: 12px; background: var(--bg-main); border-radius: 8px;">
                            <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px;">
                                <i class="fas fa-history"></i> Edit History
                            </div>
                            ${request.editHistory.map(edit => `
                                <div style="font-size: 11px; color: var(--text-secondary); padding: 4px 0; border-bottom: 1px solid var(--border-color);">
                                    ${edit.editedBy} - ${new Date(edit.editedAt?.toDate ? edit.editedAt.toDate() : edit.editedAt).toLocaleDateString()} - ${edit.changes}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                    <button class="btn-primary" onclick="updatePTORequest('${request.id}')" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            `;
            modal.classList.add('active');
        }

        function updateEditPTODuration() {
            const startDate = document.getElementById('edit-pto-start-date')?.value;
            const endDate = document.getElementById('edit-pto-end-date')?.value;
            const display = document.getElementById('edit-pto-duration-display');
            const daysCount = document.getElementById('edit-pto-days-count');

            if (startDate && endDate && display && daysCount) {
                const start = parseLocalDate(startDate);
                const end = parseLocalDate(endDate);
                const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

                if (diffDays > 0) {
                    daysCount.textContent = diffDays;
                    display.style.display = 'block';
                } else {
                    display.style.display = 'none';
                }
            }
        }

        async function updatePTORequest(requestId) {
            const request = ptoRequests.find(r => r.id === requestId);
            if (!request) {
                showNotification('Request not found', 'error');
                return;
            }

            const currentUser = getCurrentUser();
            const requestType = document.querySelector('input[name="edit-pto-type"]:checked')?.value;
            const startDate = document.getElementById('edit-pto-start-date')?.value;
            const endDate = document.getElementById('edit-pto-end-date')?.value;
            const reason = document.getElementById('edit-pto-reason')?.value?.trim();

            if (!requestType || !startDate || !endDate) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            if (parseLocalDate(endDate) < parseLocalDate(startDate)) {
                showNotification('End date must be after start date', 'error');
                return;
            }

            // Track what changed for history
            const changes = [];
            if (request.requestType !== requestType) changes.push(`Type: ${request.requestType} → ${requestType}`);
            if (request.startDate !== startDate) changes.push(`Start: ${request.startDate} → ${startDate}`);
            if (request.endDate !== endDate) changes.push(`End: ${request.endDate} → ${endDate}`);
            if ((request.reason || '') !== reason) changes.push('Notes updated');

            if (changes.length === 0) {
                showNotification('No changes detected', 'info');
                closeModal();
                return;
            }

            try {
                const db = firebase.firestore();
                const editEntry = {
                    editedBy: currentUser?.name || 'Unknown',
                    editedAt: new Date(),
                    changes: changes.join(', ')
                };

                await db.collection(window.FIREBASE_COLLECTIONS?.dayOffRequests || 'dayOffRequests').doc(requestId).update({
                    requestType,
                    startDate,
                    endDate,
                    reason,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    editHistory: firebase.firestore.FieldValue.arrayUnion(editEntry)
                });

                showNotification('Request updated successfully!', 'success');
                closeModal();
                await loadPTORequests();
                renderPTORequestsPage();
            } catch (error) {
                console.error('Error updating PTO request:', error);
                showNotification('Error updating request. Please try again.', 'error');
            }
        }

        async function deletePTORequest(requestId) {
            const request = ptoRequests.find(r => r.id === requestId);
            if (!request) {
                showNotification('Request not found', 'error');
                return;
            }

            const currentUser = getCurrentUser();
            const isManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';
            const isOwner = request.employeeId === currentUser?.id ||
                           request.employeeId === currentUser?.firestoreId ||
                           request.requestedBy === currentUser?.name;

            if (!isManager && !isOwner) {
                showNotification('You can only delete your own requests', 'error');
                return;
            }

            showConfirmModal({
                title: 'Delete Time Off Request',
                message: `Are you sure you want to delete this ${PTO_REQUEST_TYPES[request.requestType]?.label || 'time off'} request for ${request.startDate} - ${request.endDate}?`,
                confirmText: 'Delete',
                type: 'danger',
                onConfirm: async () => {
                    try {
                        const db = firebase.firestore();
                        await db.collection(window.FIREBASE_COLLECTIONS?.dayOffRequests || 'dayOffRequests').doc(requestId).delete();
                        showNotification('Request deleted', 'success');
                        await loadPTORequests();
                        renderPTORequestsPage();
                    } catch (error) {
                        console.error('Error deleting PTO request:', error);
                        showNotification('Error deleting request', 'error');
                    }
                }
            });
        }

        function renderPTORequestsPage() {
            const dashboard = document.querySelector('.dashboard');
            if (!dashboard) return;

            const currentUser = getCurrentUser();
            const userRole = currentUser?.role || 'employee';
            const isManager = userRole === 'admin' || userRole === 'manager';

            const pendingRequests = ptoRequests.filter(r => r.status === 'pending');
            const processedRequests = ptoRequests.filter(r => r.status !== 'pending');

            // Get user's own requests
            const myRequests = ptoRequests.filter(r =>
                r.employeeId === currentUser?.id ||
                r.employeeId === currentUser?.firestoreId ||
                r.requestedBy === currentUser?.name
            );

            // Calculate min date (30 days from now)
            const minDate = new Date();
            minDate.setDate(minDate.getDate() + 30);
            const minDateStr = minDate.toISOString().split('T')[0];

            dashboard.innerHTML = `
                <div class="pto-requests-page">
                    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
                        <div>
                            <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 4px;">
                                <i class="fas fa-calendar-check" style="color: var(--accent-primary); margin-right: 8px;"></i>
                                Time Off Requests
                            </h2>
                            <p style="color: var(--text-muted);">Review and manage employee time off requests</p>
                        </div>
                        <button class="btn-secondary" onclick="loadPTORequests().then(() => renderPTORequestsPage())">
                            <i class="fas fa-sync"></i> Refresh
                        </button>
                    </div>

                    <!-- Request Time Off Form -->
                    <div style="background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-color); padding: 24px; margin-bottom: 32px;">
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-paper-plane" style="color: var(--accent-primary);"></i>
                            Request Time Off
                        </h3>
                        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">
                            <i class="fas fa-info-circle" style="color: #f59e0b;"></i>
                            Requests must be submitted at least <strong>30 days in advance</strong>
                        </p>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
                            <!-- Request Type -->
                            <div class="form-group" style="margin: 0;">
                                <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Type</label>
                                <select id="self-pto-type" class="form-input" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-primary);">
                                    <option value="vacation">🏖️ Vacation</option>
                                    <option value="sick">🏥 Sick Leave</option>
                                    <option value="personal">👤 Personal Day</option>
                                    <option value="pto">📅 PTO</option>
                                </select>
                            </div>

                            <!-- Start Date -->
                            <div class="form-group" style="margin: 0;">
                                <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Start Date</label>
                                <input type="date" id="self-pto-start" class="form-input" min="${minDateStr}"
                                    style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-primary);"
                                    onchange="updateSelfPTODuration()">
                            </div>

                            <!-- End Date -->
                            <div class="form-group" style="margin: 0;">
                                <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">End Date</label>
                                <input type="date" id="self-pto-end" class="form-input" min="${minDateStr}"
                                    style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-primary);"
                                    onchange="updateSelfPTODuration()">
                            </div>

                            <!-- Duration Display -->
                            <div class="form-group" style="margin: 0;">
                                <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Duration</label>
                                <div id="self-pto-duration" style="padding: 12px; border-radius: 8px; background: var(--bg-main); border: 1px solid var(--border-color); font-weight: 500; color: var(--text-muted);">
                                    Select dates
                                </div>
                            </div>
                        </div>

                        <!-- Reason -->
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Reason (Optional)</label>
                            <textarea id="self-pto-reason" class="form-input" rows="2" placeholder="Add any notes or reason for your request..."
                                style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-primary); resize: vertical;"></textarea>
                        </div>

                        <button onclick="submitSelfPTORequest()" style="padding: 12px 24px; border: none; border-radius: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-paper-plane"></i> Submit Request
                        </button>
                    </div>

                    <!-- My Requests Section -->
                    ${myRequests.length > 0 ? `
                        <div class="pto-section" style="margin-bottom: 32px;">
                            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: var(--accent-primary);">
                                <i class="fas fa-user"></i> My Requests (${myRequests.length})
                            </h3>
                            <div class="pto-requests-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px;">
                                ${myRequests.slice(0, 5).map(request => renderPTORequestCard(request, false, true)).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${isManager ? `
                        ${pendingRequests.length > 0 ? `
                            <div class="pto-section" style="margin-bottom: 32px;">
                                <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #f59e0b;">
                                    <i class="fas fa-clock"></i> Pending Requests (${pendingRequests.length})
                                </h3>
                                <div class="pto-requests-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px;">
                                    ${pendingRequests.map(request => renderPTORequestCard(request, true, true)).join('')}
                                </div>
                            </div>
                        ` : `
                            <div style="padding: 40px; text-align: center; background: var(--bg-card); border-radius: 12px; margin-bottom: 32px;">
                                <i class="fas fa-check-circle" style="font-size: 48px; color: #10b981; margin-bottom: 16px;"></i>
                                <h3 style="color: var(--text-secondary);">No Pending Requests</h3>
                                <p style="color: var(--text-muted);">All time off requests have been processed</p>
                            </div>
                        `}

                        ${processedRequests.length > 0 ? `
                            <div class="pto-section">
                                <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: var(--text-secondary);">
                                    <i class="fas fa-history"></i> Recent History
                                </h3>
                                <div class="pto-requests-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px;">
                                    ${processedRequests.slice(0, 10).map(request => renderPTORequestCard(request, false, isManager)).join('')}
                                </div>
                            </div>
                        ` : ''}
                    ` : ''}
                </div>
            `;
        }

        // Update duration display for self PTO request
        function updateSelfPTODuration() {
            const startDate = document.getElementById('self-pto-start')?.value;
            const endDate = document.getElementById('self-pto-end')?.value;
            const durationDiv = document.getElementById('self-pto-duration');

            if (durationDiv && startDate && endDate) {
                const start = parseLocalDate(startDate);
                const end = parseLocalDate(endDate);
                const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

                if (diffDays > 0) {
                    durationDiv.innerHTML = `<span style="color: var(--accent-primary); font-weight: 600;">${diffDays} day${diffDays > 1 ? 's' : ''}</span>`;
                } else {
                    durationDiv.innerHTML = '<span style="color: #ef4444;">Invalid dates</span>';
                }
            }
        }

        // Submit PTO request for current user
        async function submitSelfPTORequest() {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                showNotification('Please log in to submit a request', 'error');
                return;
            }

            const requestType = document.getElementById('self-pto-type')?.value;
            const startDate = document.getElementById('self-pto-start')?.value;
            const endDate = document.getElementById('self-pto-end')?.value;
            const reason = document.getElementById('self-pto-reason')?.value || '';

            if (!startDate || !endDate) {
                showNotification('Please select start and end dates', 'warning');
                return;
            }

            // Validate 30 days in advance
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startDateObj = parseLocalDate(startDate);
            const daysDiff = Math.ceil((startDateObj - today) / (1000 * 60 * 60 * 24));

            if (daysDiff < 30) {
                showNotification('Requests must be submitted at least 30 days in advance', 'warning');
                return;
            }

            if (parseLocalDate(endDate) < parseLocalDate(startDate)) {
                showNotification('End date must be after start date', 'warning');
                return;
            }

            const requestData = {
                employeeId: currentUser.id || currentUser.firestoreId || currentUser.email,
                employeeName: currentUser.name || currentUser.displayName || 'Unknown',
                employeeStore: currentUser.store || '',
                requestType: requestType,
                startDate: startDate,
                endDate: endDate,
                reason: reason,
                status: 'pending',
                requestedAt: firebase.firestore.FieldValue.serverTimestamp(),
                requestedBy: currentUser.name || currentUser.displayName || 'Unknown',
                reviewedAt: null,
                reviewedBy: null,
                reviewNotes: ''
            };

            try {
                const db = firebase.firestore();
                await db.collection(window.FIREBASE_COLLECTIONS?.dayOffRequests || 'dayOffRequests').add(requestData);

                showNotification('Time off request submitted successfully!', 'success');

                // Clear form
                document.getElementById('self-pto-start').value = '';
                document.getElementById('self-pto-end').value = '';
                document.getElementById('self-pto-reason').value = '';
                document.getElementById('self-pto-duration').innerHTML = 'Select dates';

                // Reload requests
                await loadPTORequests();
                renderPTORequestsPage();
            } catch (error) {
                console.error('Error submitting PTO request:', error);
                showNotification('Error submitting request. Please try again.', 'error');
            }
        }

        window.updateSelfPTODuration = updateSelfPTODuration;
        window.submitSelfPTORequest = submitSelfPTORequest;

        function renderPTORequestCard(request, showActions = false, canEdit = false) {
            const typeConfig = PTO_REQUEST_TYPES[request.requestType] || PTO_REQUEST_TYPES.pto;
            const statusConfig = PTO_STATUS_CONFIG[request.status] || PTO_STATUS_CONFIG.pending;

            const start = parseLocalDate(request.startDate);
            const end = parseLocalDate(request.endDate);
            const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

            const requestedDate = request.requestedAt?.toDate ? request.requestedAt.toDate() : new Date(request.requestedAt);

            const emp = employees.find(e => e.id === request.employeeId || e.firestoreId === request.employeeId);

            // Show edit/delete buttons for owner or manager (not for rejected requests)
            const showEditButtons = canEdit && request.status !== 'rejected';

            return `
                <div class="pto-request-card" style="background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden;">
                    <div style="padding: 16px; border-bottom: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: ${emp?.color || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px;">
                                    ${emp?.initials || request.employeeName?.substring(0, 2).toUpperCase() || '?'}
                                </div>
                                <div>
                                    <div style="font-weight: 600;">${request.employeeName}</div>
                                    <div style="font-size: 12px; color: var(--text-muted);">${request.employeeStore || 'No store'}</div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                ${showEditButtons ? `
                                    <button onclick="openEditPTOModal('${request.id}')" style="padding: 6px 10px; border: none; border-radius: 6px; background: var(--bg-main); color: var(--text-secondary); cursor: pointer; font-size: 12px;" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deletePTORequest('${request.id}')" style="padding: 6px 10px; border: none; border-radius: 6px; background: var(--bg-main); color: #ef4444; cursor: pointer; font-size: 12px;" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                                <span style="padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: ${statusConfig.color}20; color: ${statusConfig.color};">
                                    <i class="fas ${statusConfig.icon}"></i> ${statusConfig.label}
                                </span>
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; background: ${typeConfig.color}20; color: ${typeConfig.color};">
                                <i class="fas ${typeConfig.icon}"></i> ${typeConfig.label}
                            </span>
                            <span style="font-size: 13px; color: var(--text-muted);">${diffDays} day${diffDays > 1 ? 's' : ''}</span>
                        </div>

                        <div style="font-size: 14px; color: var(--text-secondary);">
                            <i class="fas fa-calendar" style="width: 16px; color: var(--text-muted);"></i>
                            ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>

                        ${request.reason ? `
                            <div style="margin-top: 10px; padding: 10px; background: var(--bg-main); border-radius: 6px; font-size: 13px; color: var(--text-secondary);">
                                <i class="fas fa-quote-left" style="color: var(--text-muted); font-size: 10px;"></i>
                                ${request.reason}
                            </div>
                        ` : ''}

                        ${request.editHistory && request.editHistory.length > 0 ? `
                            <div style="margin-top: 8px; font-size: 11px; color: var(--text-muted);">
                                <i class="fas fa-history"></i> Edited ${request.editHistory.length} time${request.editHistory.length > 1 ? 's' : ''}
                            </div>
                        ` : ''}
                    </div>

                    <div style="padding: 12px 16px; background: var(--bg-main); font-size: 12px; color: var(--text-muted);">
                        <i class="fas fa-clock"></i> Requested ${requestedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${requestedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        ${request.reviewedBy ? `<br><i class="fas fa-user-check"></i> ${request.status === 'approved' ? 'Approved' : 'Rejected'} by ${request.reviewedBy}` : ''}
                    </div>

                    ${showActions ? `
                        <div style="padding: 12px 16px; display: flex; gap: 8px; border-top: 1px solid var(--border-color);">
                            <button onclick="approvePTORequest('${request.id}')" style="flex: 1; padding: 10px; border: none; border-radius: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; font-weight: 600; cursor: pointer;">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button onclick="openRejectModal('${request.id}')" style="flex: 1; padding: 10px; border: none; border-radius: 8px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-secondary); font-weight: 600; cursor: pointer;">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        function openRejectModal(requestId) {
            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-times-circle" style="color: #ef4444;"></i> Reject Request</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Reason for Rejection (Optional)</label>
                        <textarea class="form-input" id="reject-reason" rows="3" placeholder="Provide a reason for the rejection..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                    <button class="btn-primary" onclick="rejectPTORequest('${requestId}', document.getElementById('reject-reason')?.value || '')" style="background: #ef4444;">
                        <i class="fas fa-times"></i> Reject Request
                    </button>
                </div>
            `;
            modal.classList.add('active');
        }

        async function renderTimeOffRequests() {
            await loadPTORequests();
            renderPTORequestsPage();
        }

        // Make functions globally available
        window.openPTORequestModal = openPTORequestModal;
        window.submitPTORequest = submitPTORequest;
        window.updatePTODuration = updatePTODuration;
        window.approvePTORequest = approvePTORequest;
        window.rejectPTORequest = rejectPTORequest;
        window.loadPTORequests = loadPTORequests;
        window.openRejectModal = openRejectModal;
        window.renderTimeOffRequests = renderTimeOffRequests;
        window.openEditPTOModal = openEditPTOModal;
        window.updateEditPTODuration = updateEditPTODuration;
        window.updatePTORequest = updatePTORequest;
        window.deletePTORequest = deletePTORequest;

        // Open day off picker for All Stores view - shows date selector modal
        function openStoreDayOffPicker(store) {
            // Create a modal to select the date for the day off
            const weekDates = getWeekDates(currentWeekStart);
            const today = formatDateKey(new Date());

            let modalHTML = `
                <div class="date-picker-modal-overlay" id="datePickerOverlay" onmousedown="closeDatePicker(event)">
                    <div class="date-picker-modal">
                        <div class="date-picker-header">
                            <h3><i class="fas fa-calendar-day" style="color: var(--accent-primary);"></i> Select Day Off Date</h3>
                            <button onclick="closeDatePicker()" class="close-modal-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="date-picker-body">
                            <p style="margin-bottom: 16px; color: var(--text-secondary);">Select a date for the day off at <strong>${store}</strong></p>
                            <div class="date-picker-grid">
            `;

            weekDates.forEach(date => {
                const dateKey = formatDateKey(date);
                const isToday = dateKey === today;
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                modalHTML += `
                    <div class="date-picker-option ${isToday ? 'today' : ''}" onclick="selectDayOffDate('${dateKey}', '${store}')">
                        <div class="date-picker-day">${dayName}</div>
                        <div class="date-picker-date">${monthDay}</div>
                        ${isToday ? '<div class="date-picker-today-badge">Today</div>' : ''}
                    </div>
                `;
            });

            modalHTML += `
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Insert modal into document
            const existingModal = document.getElementById('datePickerOverlay');
            if (existingModal) {
                existingModal.remove();
            }

            document.body.insertAdjacentHTML('beforeend', modalHTML);
            setTimeout(() => {
                document.getElementById('datePickerOverlay').classList.add('active');
            }, 10);
        }

        function closeDatePicker(event) {
            if (event && event.target !== event.currentTarget) return;
            const overlay = document.getElementById('datePickerOverlay');
            if (overlay) {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
            }
        }

        function selectDayOffDate(dateKey, store) {
            closeDatePicker();
            // Now open the employee picker for this specific date and store
            openDayOffPicker(dateKey, store);
        }

        // Drag and drop for employees between shifts
        function handleEmployeeDragStart(event, scheduleId) {
            draggedShift = scheduleId;
            event.target.classList.add('dragging');
            event.dataTransfer.effectAllowed = 'move';
        }

        function handleEmployeeDragEnd(event) {
            event.target.classList.remove('dragging');
            document.querySelectorAll('.employee-drop-zone').forEach(zone => {
                zone.classList.remove('drag-over');
            });
            draggedShift = null;
        }

        function handleShiftDragOver(event) {
            event.preventDefault();
            event.currentTarget.classList.add('drag-over');
        }

        function handleShiftDragLeave(event) {
            event.currentTarget.classList.remove('drag-over');
        }

        async function handleShiftDrop(event, dateKey, shiftType) {
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
                    startTime: shiftConfig.defaultStart,
                    endTime: shiftConfig.defaultEnd,
                    updatedAt: new Date().toISOString()
                });

                schedule.date = dateKey;
                schedule.shiftType = shiftType;
                schedule.startTime = shiftConfig.defaultStart;
                schedule.endTime = shiftConfig.defaultEnd;

                showNotification('Shift moved!', 'success');
                renderScheduleGrid();
            } catch (error) {
                console.error('Error moving shift:', error);
                showNotification('Error moving shift', 'error');
            }
        }

        function changeWeek(direction) {
            currentWeekStart.setDate(currentWeekStart.getDate() + (direction * 7));
            renderSchedule();
        }

        function goToToday() {
            currentWeekStart = getWeekStart(new Date());
            renderSchedule();
        }

        function formatTimeShort(time) {
            if (!time) return '--';

            const t = time.toString().toLowerCase().trim();

            // Check if already in short format like "9:00a" or "5:00p"
            if (t.match(/^\d{1,2}:\d{2}[ap]$/)) {
                return time;
            }

            // Check for AM/PM formats like "9:00 AM" or "5:00 PM"
            const isPM = t.includes('p');
            const isAM = t.includes('a');

            // Clean and parse
            const cleanTime = t.replace(/[ap]m?/gi, '').trim();
            const parts = cleanTime.split(':');

            let h = parseInt(parts[0]) || 0;
            const minutes = parts[1] ? parts[1].padStart(2, '0') : '00';

            // Determine AM/PM
            let ampm;
            if (isPM || isAM) {
                ampm = isPM ? 'p' : 'a';
                // Already in 12-hour format
                if (h === 0) h = 12;
            } else {
                // 24-hour format
                ampm = h >= 12 ? 'p' : 'a';
                h = h % 12 || 12;
            }

            return `${h}:${minutes}${ampm}`;
        }

        function calculateHours(startTime, endTime) {
            if (!startTime || !endTime) return 0;

            // Parse time that could be in formats: "14:00", "2:00p", "2:00 PM", etc.
            function parseTime(timeStr) {
                if (!timeStr) return 0;
                // Remove spaces and convert to lowercase
                const t = timeStr.toString().toLowerCase().trim();

                // Check for AM/PM formats
                const isPM = t.includes('p');
                const isAM = t.includes('a');

                // Extract numbers only
                const cleanTime = t.replace(/[ap]m?/gi, '').trim();
                const parts = cleanTime.split(':');

                let hours = parseInt(parts[0]) || 0;
                let minutes = parseInt(parts[1]) || 0;

                // Convert to 24-hour if PM
                if (isPM && hours < 12) hours += 12;
                if (isAM && hours === 12) hours = 0;

                return hours * 60 + minutes;
            }

            const startMinutes = parseTime(startTime);
            const endMinutes = parseTime(endTime);
            let diff = endMinutes - startMinutes;
            // Handle overnight shifts (end time is next day)
            if (diff < 0) diff += 24 * 60;
            const hours = diff / 60;
            // Sanity check: cap at 16 hours max per shift
            return Math.min(hours, 16);
        }

        function formatTime(time) {
            if (!time) return '--';
            const [hours, minutes] = time.split(':');
            const h = parseInt(hours);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${minutes} ${ampm}`;
        }

        // Legacy function kept for modal compatibility
        async function saveSchedule(isQuick = false) {
            // Only admins and managers can save schedules
            if (!canEditSchedule()) {
                showNotification('Only managers and admins can edit schedules', 'error');
                return;
            }

            const employeeId = document.getElementById('schedule-employee')?.value;
            const store = document.getElementById('schedule-store')?.value;
            const date = document.getElementById('schedule-date')?.value;
            const startTime = document.getElementById('schedule-start')?.value;
            const endTime = document.getElementById('schedule-end')?.value;

            console.log('Saving schedule:', { employeeId, store, date, startTime, endTime });

            if (!employeeId || !store || !date || !startTime || !endTime) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            const emp = employees.find(e => e.id === employeeId || e.firestoreId === employeeId);

            const currentUser = getCurrentUser();
            const scheduleData = {
                employeeId,
                employeeName: emp ? emp.name : '',
                store,
                date,
                startTime,
                endTime,
                shiftType: startTime < '14:00' ? 'opening' : 'closing',
                createdAt: new Date().toISOString(),
                createdBy: currentUser?.name || 'Unknown'
            };

            console.log('Schedule data to save:', scheduleData);

            try {
                const db = firebase.firestore();
                const docRef = await db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules').add(scheduleData);
                console.log('Schedule saved with ID:', docRef.id);

                // Log activity
                if (typeof logActivity === 'function') {
                    await logActivity(ACTIVITY_TYPES.SCHEDULE, {
                        message: `Created schedule for ${scheduleData.employeeName}`,
                        employeeName: scheduleData.employeeName,
                        store: scheduleData.store,
                        date: scheduleData.date,
                        shift: `${startTime} - ${endTime}`
                    }, 'schedule', docRef.id);
                }

                showNotification('Shift added!', 'success');
                closeModal();
                loadScheduleData();
            } catch (error) {
                console.error('Error saving schedule:', error);
                showNotification('Error: ' + error.message, 'error');
            }
        }

        async function updateSchedule(scheduleId) {
            const employeeId = document.getElementById('schedule-employee').value;
            const store = document.getElementById('schedule-store').value;
            const date = document.getElementById('schedule-date').value;
            const startTime = document.getElementById('schedule-start').value;
            const endTime = document.getElementById('schedule-end').value;

            if (!employeeId || !store || !date || !startTime || !endTime) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            const emp = employees.find(e => e.id === employeeId);

            try {
                const db = firebase.firestore();
                await db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules').doc(scheduleId).update({
                    employeeId,
                    employeeName: emp ? emp.name : '',
                    store,
                    date,
                    startTime,
                    endTime,
                    updatedAt: new Date().toISOString()
                });

                // Log activity
                if (typeof logActivity === 'function') {
                    await logActivity(ACTIVITY_TYPES.SCHEDULE, {
                        message: `Updated schedule for ${emp ? emp.name : 'employee'}`,
                        employeeName: emp ? emp.name : 'Unknown',
                        store: store,
                        date: date,
                        shift: `${startTime} - ${endTime}`,
                        action: 'update'
                    }, 'schedule', scheduleId);
                }

                showNotification('Shift updated!', 'success');
                closeModal();
                loadScheduleData();
            } catch (error) {
                console.error('Error updating schedule:', error);
                showNotification('Error updating schedule', 'error');
            }
        }

        async function deleteSchedule(scheduleId) {
            // Only admins and managers can delete schedules
            if (!canEditSchedule()) {
                showNotification('Only managers and admins can edit schedules', 'error');
                return;
            }

            showConfirmModal({
                title: 'Delete Shift',
                message: 'Are you sure you want to delete this shift?',
                confirmText: 'Delete',
                type: 'danger',
                onConfirm: async () => {
                    try {
                        const db = firebase.firestore();
                        await db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules').doc(scheduleId).delete();

                        // Log activity
                        if (typeof logActivity === 'function') {
                            await logActivity(ACTIVITY_TYPES.DELETE, {
                                message: 'Deleted schedule shift',
                                action: 'delete'
                            }, 'schedule', scheduleId);
                        }

                        showNotification('Shift deleted!', 'success');
                        loadScheduleData();
                    } catch (error) {
                        console.error('Error deleting schedule:', error);
                        showNotification('Error deleting schedule', 'error');
                    }
                }
            });
        }

        // Note: thieves array is initialized at the top of this file

        /**
         * Initialize Firebase and load thieves from Firestore
         */
        async function initializeFirebaseThieves() {

            const initialized = await firebaseThievesManager.initialize();

            if (initialized) {
                try {
                    const firestoreThieves = await firebaseThievesManager.loadThieves();

                    if (firestoreThieves && firestoreThieves.length > 0) {
                        thieves = firestoreThieves;
                    } else {
                        thieves = [];
                        console.log('No thieves found in Firestore');
                    }
                    return true;
                } catch (error) {
                    console.error('Error loading thieves from Firestore:', error);
                }
            } else {
                console.warn('Firebase not available for thieves.');
            }

            return false;
        }
        window.initializeFirebaseThieves = initializeFirebaseThieves;

        /**
         * Save thief record to Firebase
         */
        async function saveThiefToFirebase(thiefData) {
            if (!firebaseThievesManager.isInitialized) {
                console.warn('Firebase Thieves Manager not initialized');
                return null;
            }

            try {
                if (thiefData.firestoreId) {
                    // Update existing
                    const success = await firebaseThievesManager.updateThief(
                        thiefData.firestoreId,
                        thiefData
                    );
                    return success ? thiefData.firestoreId : null;
                } else {
                    // Create new
                    const newId = await firebaseThievesManager.addThief(thiefData);
                    return newId;
                }
            } catch (error) {
                console.error('Error saving thief to Firebase:', error);
                return null;
            }
        }

        /**
         * Delete thief record from Firebase
         */
        async function deleteThiefFromFirebase(firestoreId) {
            if (!firebaseThievesManager.isInitialized) {
                console.warn('Firebase Thieves Manager not initialized');
                return false;
            }

            try {
                return await firebaseThievesManager.deleteThief(firestoreId);
            } catch (error) {
                console.error('Error deleting thief from Firebase:', error);
                return false;
            }
        }

        function renderThieves() {
            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <div class="page-header thieves-page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Banned Customers</h2>
                        <p class="section-subtitle">Track and manage banned customer incidents</p>
                        <select class="form-input thieves-filter-select" id="thieves-filter" onchange="filterThieves(this.value)">
                            <option value="all">All Stores</option>
                            <option value="Miramar">Miramar</option>
                            <option value="Morena">Morena</option>
                            <option value="Kearny Mesa">Kearny Mesa</option>
                            <option value="Chula Vista">Chula Vista</option>
                            <option value="North Park">North Park</option>
                            <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                        </select>
                    </div>
                    <button class="btn-primary floating-add-btn thieves-add-btn" onclick="openModal('add-thief')">
                        <i class="fas fa-plus"></i>
                        Add New Record
                    </button>
                </div>

                <div id="thievesCardsContainer">
                    ${renderThievesCards()}
                </div>
            `;
        }

        function renderThievesCards(filter = 'all') {
            const filteredThieves = filter === 'all' ? thieves : thieves.filter(t => t.store === filter);

            if (filteredThieves.length === 0) {
                return `
                    <div class="card" style="padding: 60px; text-align: center;">
                        <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; color: var(--text-muted);"></i>
                        <p style="color: var(--text-muted);">No records found</p>
                    </div>
                `;
            }

            return `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">
                    ${filteredThieves.map(thief => `
                        <div class="card" style="overflow: hidden;">
                            <div style="width: 100%; height: 200px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                ${thief.photo ? `<img src="${thief.photo}" style="width: 100%; height: 100%; object-fit: cover;" alt="${thief.name}">` : `<i class="fas fa-user" style="font-size: 64px; color: var(--text-muted);"></i>`}
                            </div>
                            <div class="card-body">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                    <div>
                                        <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${thief.name}</h3>
                                        <span style="font-size: 12px; color: var(--text-muted);">${formatDate(thief.date)}</span>
                                    </div>
                                    ${thief.banned
                                        ? '<span class="badge" style="background: var(--error); color: var(--text-primary);">Banned</span>'
                                        : '<span class="badge" style="background: var(--warning); color: var(--text-primary);">Warning</span>'}
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                                        <span style="color: var(--text-muted); font-size: 13px;">Store</span>
                                        <span style="font-weight: 600; font-size: 13px;">${thief.store}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                                        <span style="color: var(--text-muted); font-size: 13px;">Crime Type</span>
                                        <span style="font-weight: 600; font-size: 13px;">${thief.crimeType}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                                        <span style="color: var(--text-muted); font-size: 13px;">Items Stolen</span>
                                        <span style="font-weight: 600; font-size: 13px;">${thief.itemsStolen}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                                        <span style="color: var(--text-muted); font-size: 13px;">Estimated Value</span>
                                        <span style="font-weight: 600; font-size: 13px; color: var(--error);">$${thief.estimatedValue.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 8px; justify-content: flex-end;">
                                    <button class="btn-secondary" onclick="viewThief('${thief.firestoreId || thief.id}')" style="padding: 8px 16px; font-size: 13px;">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                    <button class="btn-icon" onclick="editThief('${thief.firestoreId || thief.id}')" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon danger" onclick="deleteThief('${thief.firestoreId || thief.id}')" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function filterThieves(store) {
            const container = document.getElementById('thievesCardsContainer');
            if (container) {
                container.innerHTML = renderThievesCards(store);
            }
        }

        function viewThief(id) {
            const thief = thieves.find(t => t.id === id || t.firestoreId === id);
            if (!thief) return;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2>Theft Record Details</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: 120px 1fr; gap: 24px; margin-bottom: 24px;">
                        <div style="width: 120px; height: 120px; border-radius: 12px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                            ${thief.photo ? `<img src="${thief.photo}" style="width: 100%; height: 100%; object-fit: cover;" alt="${thief.name}">` : `<i class="fas fa-user" style="font-size: 48px; color: var(--text-muted);"></i>`}
                        </div>
                        <div>
                            <h3 style="margin: 0 0 8px;">${thief.name}</h3>
                            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                                <span class="badge" style="background: var(--accent-primary);">${thief.store}</span>
                                ${thief.banned ? '<span class="badge" style="background: var(--error);">Banned</span>' : '<span class="badge" style="background: var(--warning);">Warning</span>'}
                            </div>
                            <p style="color: var(--text-muted); margin: 0;"><i class="fas fa-calendar"></i> ${formatDate(thief.date)}</p>
                        </div>
                    </div>

                    <div class="card" style="margin-bottom: 16px;">
                        <div class="card-body">
                            <h4 style="margin: 0 0 12px; font-size: 14px; color: var(--text-muted);">Crime Details</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Crime Type</label>
                                    <div>${thief.crimeType}</div>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Estimated Value</label>
                                    <div style="color: var(--error); font-weight: 600;">$${thief.estimatedValue.toFixed(2)}</div>
                                </div>
                            </div>
                            <div style="margin-bottom: 16px;">
                                <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Items Stolen</label>
                                <div>${thief.itemsStolen}</div>
                            </div>
                            ${thief.policeReport ? `
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Police Report #</label>
                                    <div>${thief.policeReport}</div>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-body">
                            <h4 style="margin: 0 0 12px; font-size: 14px; color: var(--text-muted);">Description</h4>
                            <p style="margin: 0; line-height: 1.6;">${thief.description}</p>
                        </div>
                    </div>
                </div>
            `;

            modal.classList.add('active');
        }

        async function deleteThief(id) {
            showConfirmModal({
                title: 'Delete Record',
                message: 'Are you sure you want to delete this thief record? This action cannot be undone.',
                confirmText: 'Delete',
                type: 'danger',
                onConfirm: async () => {
                    // Find the thief to get the firestoreId
                    const thief = thieves.find(t => t.id === id || t.firestoreId === id);

                    if (thief && thief.firestoreId) {
                        // Delete from Firebase
                        const deleted = await deleteThiefFromFirebase(thief.firestoreId);
                        if (deleted) {
                            console.log('Thief record deleted from Firebase:', thief.firestoreId);
                        } else {
                            console.warn('Failed to delete from Firebase, removing locally');
                        }
                    }

                    // Remove from local array
                    thieves = thieves.filter(t => t.id !== id && t.firestoreId !== id);
                    renderThieves();
                }
            });
        }

        function previewThiefPhoto(input) {
            const preview = document.getElementById('thief-photo-preview');
            const img = document.getElementById('thief-photo-img');

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

        function previewEditThiefPhoto(input) {
            const preview = document.getElementById('edit-thief-photo-preview');
            const img = document.getElementById('edit-thief-photo-img');

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

        // Variable to store the thief being edited
        let editingThiefId = null;

        function editThief(id) {
            // Find thief by id or firestoreId
            const thief = thieves.find(t => t.id === id || t.firestoreId === id);
            if (!thief) {
                alert('Thief record not found');
                return;
            }

            // Store the thief being edited
            editingThiefId = thief.firestoreId || thief.id;

            // Open modal with edit form
            openModal('edit-thief', thief);
        }

        async function saveEditedThief() {
            if (!editingThiefId) {
                alert('No thief record selected for editing');
                return;
            }

            // Get the current thief data
            const currentThief = thieves.find(t => t.id === editingThiefId || t.firestoreId === editingThiefId);
            if (!currentThief) {
                alert('Thief record not found');
                return;
            }

            // Get form values (use current values as fallback if empty)
            const name = document.getElementById('edit-thief-name').value.trim() || currentThief.name;
            const date = document.getElementById('edit-thief-date').value || currentThief.date;
            const store = document.getElementById('edit-thief-store').value || currentThief.store;
            const crimeType = document.getElementById('edit-thief-crime-type').value || currentThief.crimeType;
            const items = document.getElementById('edit-thief-items').value.trim() || currentThief.itemsStolen;
            const value = document.getElementById('edit-thief-value').value;
            const description = document.getElementById('edit-thief-description').value.trim() || currentThief.description;
            const policeReport = document.getElementById('edit-thief-police-report').value.trim();
            const status = document.getElementById('edit-thief-status').value;
            const photoInput = document.getElementById('edit-thief-photo');

            // Show saving indicator
            const saveBtn = document.querySelector('.modal-footer .btn-primary');
            const originalText = saveBtn ? saveBtn.innerHTML : '';
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                saveBtn.disabled = true;
            }

            try {
                // Get photo - use new one if uploaded, otherwise keep current
                let photoUrl = currentThief.photo;
                let photoPath = currentThief.photoPath || null;
                const photoImg = document.getElementById('edit-thief-photo-img');

                // Check if a new photo was uploaded (it will be base64)
                if (photoInput.files && photoInput.files.length > 0 && photoImg && photoImg.src && photoImg.src.startsWith('data:')) {
                    if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading photo...';

                    // Initialize storage if needed
                    if (!firebaseStorageHelper.isInitialized) {
                        firebaseStorageHelper.initialize();
                    }

                    // Delete old photo from storage if it exists
                    if (currentThief.photoPath) {
                        try {
                            await firebaseStorageHelper.deleteFile(currentThief.photoPath);
                        } catch (e) {
                            console.warn('Could not delete old photo:', e);
                        }
                    }

                    // Upload new photo
                    const tempId = currentThief.firestoreId || Date.now().toString();
                    const uploadResult = await firebaseStorageHelper.uploadImage(
                        photoImg.src,
                        'thieves/photos',
                        tempId
                    );
                    photoUrl = uploadResult.url;
                    photoPath = uploadResult.path;
                }

                const updatedData = {
                    name: name,
                    photo: photoUrl,
                    photoPath: photoPath,
                    date: date,
                    store: store,
                    crimeType: crimeType,
                    itemsStolen: items,
                    estimatedValue: value ? parseFloat(value) : currentThief.estimatedValue,
                    description: description,
                    policeReport: policeReport || currentThief.policeReport || null,
                    banned: status === 'banned'
                };

                if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

                // Update in Firebase
                if (firebaseThievesManager.isInitialized && currentThief.firestoreId) {
                    const success = await firebaseThievesManager.updateThief(currentThief.firestoreId, updatedData);
                    if (!success) {
                        throw new Error('Failed to update in Firebase');
                    }
                    console.log('Thief record updated in Firebase:', currentThief.firestoreId);
                }

                // Update local array
                const index = thieves.findIndex(t => t.id === editingThiefId || t.firestoreId === editingThiefId);
                if (index !== -1) {
                    thieves[index] = {
                        ...thieves[index],
                        ...updatedData
                    };
                }

                // Clear editing state
                editingThiefId = null;

                closeModal();
                renderThieves();

                // Show success notification if available
                if (typeof showNotification === 'function') {
                    showNotification('Thief record updated successfully!', 'success');
                }
            } catch (error) {
                console.error('Error updating thief record:', error);
                alert('Error updating thief record. Please try again.');

                if (saveBtn) {
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                }
            }
        }

        async function saveThief() {
            const name = document.getElementById('thief-name').value.trim();
            const date = document.getElementById('thief-date').value;
            const store = document.getElementById('thief-store').value;
            const crimeType = document.getElementById('thief-crime-type').value;
            const items = document.getElementById('thief-items').value.trim();
            const value = document.getElementById('thief-value').value;
            const description = document.getElementById('thief-description').value.trim();
            const policeReport = document.getElementById('thief-police-report').value.trim();
            const status = document.getElementById('thief-status').value;
            const photoInput = document.getElementById('thief-photo');

            // Validation
            if (!name || !date || !store || !crimeType || !items || !value || !description) {
                alert('Please fill in all required fields');
                return;
            }

            // Show saving indicator
            const saveBtn = document.querySelector('#add-thief-modal .btn-primary, .modal-footer .btn-primary');
            const originalText = saveBtn ? saveBtn.innerHTML : '';
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                saveBtn.disabled = true;
            }

            try {
                // Get photo and upload to Firebase Storage if available
                let photoUrl = null;
                let photoPath = null;
                const photoImg = document.getElementById('thief-photo-img');
                if (photoImg && photoImg.src && photoInput.files.length > 0 && photoImg.src.startsWith('data:')) {
                    if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading photo...';

                    // Initialize storage if needed
                    if (!firebaseStorageHelper.isInitialized) {
                        firebaseStorageHelper.initialize();
                    }

                    // Generate a temporary ID for the file name
                    const tempId = Date.now().toString();
                    const uploadResult = await firebaseStorageHelper.uploadImage(
                        photoImg.src,
                        'thieves/photos',
                        tempId
                    );
                    photoUrl = uploadResult.url;
                    photoPath = uploadResult.path;
                }

                // Create thief data object with Storage URL instead of base64
                const thiefData = {
                    name: name,
                    photo: photoUrl,           // Now stores URL instead of base64
                    photoPath: photoPath,      // Store path for future deletion
                    date: date,
                    store: store,
                    crimeType: crimeType,
                    itemsStolen: items,
                    estimatedValue: parseFloat(value),
                    description: description,
                    policeReport: policeReport || null,
                    banned: status === 'banned'
                };

                if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving record...';

                // Try to save to Firebase
                const firestoreId = await saveThiefToFirebase(thiefData);

                if (firestoreId) {
                    // Successfully saved to Firebase
                    thiefData.id = firestoreId;
                    thiefData.firestoreId = firestoreId;
                    console.log('Thief record saved to Firebase with ID:', firestoreId);
                } else {
                    // Fallback to local ID
                    const newId = thieves.length > 0 ? Math.max(...thieves.map(t => typeof t.id === 'number' ? t.id : 0)) + 1 : 1;
                    thiefData.id = newId;
                    console.log('Thief record saved locally with ID:', newId);
                }

                // Add to local array
                thieves.unshift(thiefData);

                closeModal();
                renderThieves();
            } catch (error) {
                console.error('Error saving thief:', error);
                alert('Error saving record. Please try again.');
            } finally {
                // Restore button state
                if (saveBtn) {
                    saveBtn.innerHTML = originalText || '<i class="fas fa-save"></i> Save';
                    saveBtn.disabled = false;
                }
            }
        }

        // Invoices database
        let invoices = [
            {
                id: 1,
                invoiceNumber: 'INV-2025-001',
                vendor: 'Cloud Services Inc.',
                category: 'Technology',
                description: 'Cloud storage subscription',
                amount: 299.99,
                dueDate: '2025-12-15',
                paidDate: null,
                status: 'pending',
                recurring: true,
                notes: 'Monthly subscription'
            },
            {
                id: 2,
                invoiceNumber: 'INV-2025-002',
                vendor: 'Office Supplies Co.',
                category: 'Office',
                description: 'Office supplies and equipment',
                amount: 456.50,
                dueDate: '2025-12-10',
                paidDate: '2025-12-08',
                status: 'paid',
                recurring: false,
                notes: ''
            },
            {
                id: 3,
                invoiceNumber: 'INV-2025-003',
                vendor: 'Utilities Provider',
                category: 'Utilities',
                description: 'Monthly electricity bill',
                amount: 523.75,
                dueDate: '2025-12-20',
                paidDate: null,
                status: 'overdue',
                recurring: true,
                notes: 'Store: Miramar'
            }
        ];

        // Invoice filter state
        let invoiceFilters = {
            store: 'all',
            timePeriod: 'all',
            vendor: 'all',
            category: 'all',
            status: 'all',
            minAmount: null,
            maxAmount: null,
            activeTab: 'current', // 'current' or 'recurring'
            sortBy: 'createdAt-desc', // default sort - most recent first
            recurringMonth: 'all' // Filter for recurring projections by month
        };

        // Default invoice categories
        const DEFAULT_INVOICE_CATEGORIES = [
            { id: 'utilities', name: 'Utilities', icon: 'fa-bolt' },
            { id: 'supplies', name: 'Supplies', icon: 'fa-box' },
            { id: 'product', name: 'Product', icon: 'fa-cube' },
            { id: 'services', name: 'Services', icon: 'fa-concierge-bell' },
            { id: 'equipment', name: 'Equipment', icon: 'fa-tools' },
            { id: 'marketing', name: 'Marketing', icon: 'fa-bullhorn' },
            { id: 'insurance', name: 'Insurance', icon: 'fa-shield-alt' },
            { id: 'taxes', name: 'Taxes', icon: 'fa-file-invoice-dollar' },
            { id: 'payroll', name: 'Payroll', icon: 'fa-users' },
            { id: 'other', name: 'Other', icon: 'fa-ellipsis-h' }
        ];

        // Custom invoice categories (loaded from Firebase)
        let customInvoiceCategories = [];

        // Load custom invoice categories from Firebase
        async function loadInvoiceCategories() {
            try {
                const snapshot = await db.collection('invoiceCategories').orderBy('name').get();
                customInvoiceCategories = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                console.log(`[Invoices] Loaded ${customInvoiceCategories.length} custom categories`);
            } catch (error) {
                console.error('[Invoices] Error loading categories:', error);
                customInvoiceCategories = [];
            }
        }

        // Get all invoice categories (default + custom)
        function getAllInvoiceCategories() {
            return [...DEFAULT_INVOICE_CATEGORIES, ...customInvoiceCategories];
        }

        // Add new custom category
        async function addInvoiceCategory(name) {
            if (!name || name.trim() === '') return null;

            const trimmedName = name.trim();
            const categoryId = trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '-');

            // Check if already exists
            const allCategories = getAllInvoiceCategories();
            if (allCategories.some(c => c.id === categoryId || c.name.toLowerCase() === trimmedName.toLowerCase())) {
                showToast('Category already exists', 'warning');
                return null;
            }

            // Check if Firebase is available
            if (typeof db === 'undefined' || !db) {
                // Fallback to local storage if Firebase not available
                const newCategory = { id: categoryId, name: trimmedName, icon: 'fa-tag' };
                customInvoiceCategories.push(newCategory);
                // Save to localStorage as backup
                try {
                    localStorage.setItem('customInvoiceCategories', JSON.stringify(customInvoiceCategories));
                } catch (e) {
                    console.warn('Could not save to localStorage:', e);
                }
                showToast(`Category "${trimmedName}" added`, 'success');
                return newCategory;
            }

            try {
                const docRef = await db.collection('invoiceCategories').add({
                    name: trimmedName,
                    icon: 'fa-tag',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                const newCategory = { id: docRef.id, name: trimmedName, icon: 'fa-tag' };
                customInvoiceCategories.push(newCategory);

                showToast(`Category "${trimmedName}" added`, 'success');
                return newCategory;
            } catch (error) {
                console.error('[Invoices] Error adding category:', error);
                showToast('Error adding category', 'error');
                return null;
            }
        }

        // Delete custom category
        async function deleteInvoiceCategory(categoryId) {
            // Prevent deleting default categories
            if (DEFAULT_INVOICE_CATEGORIES.some(c => c.id === categoryId)) {
                showToast('Cannot delete default categories', 'warning');
                return false;
            }

            try {
                await db.collection('invoiceCategories').doc(categoryId).delete();
                customInvoiceCategories = customInvoiceCategories.filter(c => c.id !== categoryId);
                showToast('Category deleted', 'success');
                return true;
            } catch (error) {
                console.error('[Invoices] Error deleting category:', error);
                showToast('Error deleting category', 'error');
                return false;
            }
        }

        // Show add category modal
        window.showAddInvoiceCategoryModal = function() {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.id = 'add-category-modal';
            modal.innerHTML = `
                <div class="modal" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-plus-circle"></i> Add New Category</h3>
                        <button class="modal-close" onclick="closeAddCategoryModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Category Name</label>
                            <input type="text" class="form-input" id="new-category-name" placeholder="e.g., Marketing, Insurance, Taxes..." autofocus>
                        </div>
                        <div style="margin-top: 16px;">
                            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
                                <i class="fas fa-info-circle"></i> Custom categories you add will be available for all invoices.
                            </p>
                            ${customInvoiceCategories.length > 0 ? `
                                <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px;">
                                    <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Your custom categories:</p>
                                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                        ${customInvoiceCategories.map(c => `
                                            <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: var(--bg-card); border-radius: 16px; font-size: 12px;">
                                                ${c.name}
                                                <button onclick="confirmDeleteCategory('${c.id}', '${c.name}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0; font-size: 14px;" title="Delete">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="closeAddCategoryModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="saveNewInvoiceCategory()">
                            <i class="fas fa-plus"></i> Add Category
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Focus input and add enter key handler
            setTimeout(() => {
                const input = document.getElementById('new-category-name');
                if (input) {
                    input.focus();
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') saveNewInvoiceCategory();
                    });
                }
            }, 100);
        };

        window.closeAddCategoryModal = function() {
            const modal = document.getElementById('add-category-modal');
            if (modal) modal.remove();
        };

        window.confirmDeleteCategory = function(categoryId, categoryName) {
            if (confirm(`Delete category "${categoryName}"? Invoices using this category will keep their current category.`)) {
                deleteInvoiceCategory(categoryId).then(success => {
                    if (success) {
                        closeAddCategoryModal();
                        showAddInvoiceCategoryModal(); // Refresh the modal
                    }
                });
            }
        };

        window.saveNewInvoiceCategory = async function() {
            const input = document.getElementById('new-category-name');
            if (!input) return;

            const name = input.value.trim();
            if (!name) {
                showToast('Please enter a category name', 'warning');
                input.focus();
                return;
            }

            const newCategory = await addInvoiceCategory(name);
            if (newCategory) {
                closeAddCategoryModal();
                // Refresh the invoice form if open
                updateInvoiceCategorySelects();
            }
        };

        // Update all category selects in the page
        function updateInvoiceCategorySelects() {
            const allCategories = getAllInvoiceCategories();
            const selects = document.querySelectorAll('#invoice-category, #edit-invoice-category');

            selects.forEach(select => {
                const currentValue = select.value;
                select.innerHTML = `
                    <option value="">Select category...</option>
                    ${allCategories.map(c => `
                        <option value="${c.id}" ${currentValue === c.id ? 'selected' : ''}>${c.name}</option>
                    `).join('')}
                `;
            });
        }

        // Render invoice category checkboxes with custom category option
        function renderInvoiceCategoryCheckboxes(selectedCategories = [], containerId = 'invoice-categories-container') {
            const allCategories = getAllInvoiceCategories();
            // Normalize selectedCategories to array
            let selected = [];
            if (Array.isArray(selectedCategories)) {
                selected = selectedCategories;
            } else if (typeof selectedCategories === 'string' && selectedCategories) {
                selected = [selectedCategories];
            }

            return `
                <div id="${containerId}" style="display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; background: var(--bg-hover); border-radius: 8px; border: 1px solid var(--border-color);">
                    ${allCategories.map(c => `
                        <label style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: var(--bg-card); border-radius: 8px; cursor: pointer; border: 2px solid ${selected.includes(c.id) || selected.includes(c.name) ? 'var(--accent-primary)' : 'var(--border-color)'}; transition: all 0.2s;">
                            <input type="checkbox" value="${c.name}" ${selected.includes(c.id) || selected.includes(c.name) ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--accent-primary);" onchange="updateInvoiceCategoryCheckboxStyle(this)">
                            <span style="font-size: 13px; font-weight: 500;">${c.name}</span>
                        </label>
                    `).join('')}
                </div>
                <div style="display: flex; gap: 8px; margin-top: 10px;">
                    <input type="text" class="form-input" id="${containerId}-custom-input" placeholder="Add custom category..." style="flex: 1;">
                    <button type="button" class="btn-secondary" onclick="addInvoiceCustomCategoryCheckbox('${containerId}')" style="white-space: nowrap;">
                        <i class="fas fa-plus"></i> Add
                    </button>
                    <button type="button" class="btn-secondary" onclick="showAddInvoiceCategoryModal()" style="white-space: nowrap;" title="Manage custom categories">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            `;
        }

        // Update checkbox label style when checked/unchecked
        window.updateInvoiceCategoryCheckboxStyle = function(checkbox) {
            const label = checkbox.parentElement;
            if (checkbox.checked) {
                label.style.borderColor = 'var(--accent-primary)';
            } else {
                label.style.borderColor = 'var(--border-color)';
            }
        };

        // Add custom category checkbox
        window.addInvoiceCustomCategoryCheckbox = async function(containerId) {
            const input = document.getElementById(`${containerId}-custom-input`);
            const container = document.getElementById(containerId);
            const customCategory = input.value.trim();

            if (!customCategory) {
                showNotification('Please enter a category name', 'warning');
                return;
            }

            // Check if already exists
            const existingCheckbox = container.querySelector(`input[value="${customCategory}"]`);
            if (existingCheckbox) {
                existingCheckbox.checked = true;
                updateInvoiceCategoryCheckboxStyle(existingCheckbox);
                input.value = '';
                showNotification('Category already exists, selected it', 'info');
                return;
            }

            // Add to Firebase
            const newCategory = await addInvoiceCategory(customCategory);

            if (newCategory) {
                // Add new checkbox
                const newLabel = document.createElement('label');
                newLabel.style.cssText = 'display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: var(--bg-card); border-radius: 8px; cursor: pointer; border: 2px solid var(--accent-primary); transition: all 0.2s;';
                newLabel.innerHTML = `
                    <input type="checkbox" value="${customCategory}" checked style="width: 16px; height: 16px; accent-color: var(--accent-primary);" onchange="updateInvoiceCategoryCheckboxStyle(this)">
                    <span style="font-size: 13px; font-weight: 500;">${customCategory}</span>
                `;
                container.appendChild(newLabel);
                input.value = '';
            }
        };

        // Get selected invoice categories from checkboxes
        function getSelectedInvoiceCategories(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return [];
            const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
            return Array.from(checkboxes).map(cb => cb.value);
        }

        // Legacy function for backwards compatibility
        function renderInvoiceCategorySelect(selectedValue = '', selectId = 'invoice-category') {
            // Convert to checkbox format
            return renderInvoiceCategoryCheckboxes(selectedValue ? [selectedValue] : [], selectId.replace('-category', '-categories-container'));
        }

        // Render invoice categories as badges (for display in tables/cards)
        function renderInvoiceCategoryBadges(invoice) {
            // Support both single category and multiple categories
            const cats = invoice.categories && invoice.categories.length > 0
                ? invoice.categories
                : (invoice.category ? [invoice.category] : []);

            if (cats.length === 0) {
                return '<span style="color: var(--text-muted); font-size: 11px;">No category</span>';
            }

            // Category colors for visual variety
            const categoryColors = {
                'Utilities': '#f59e0b',
                'Supplies': '#84cc16',
                'Services': '#10b981',
                'Equipment': '#8b5cf6',
                'Marketing': '#ec4899',
                'Insurance': '#14b8a6',
                'Taxes': '#f97316',
                'Payroll': '#06b6d4',
                'Other': '#6b7280'
            };

            return cats.map((cat, idx) => {
                const color = categoryColors[cat] || '#6366f1';
                const isFirst = idx === 0;
                return `<span class="badge" style="background: ${color}; color: #fff; font-size: ${isFirst ? '11px' : '10px'}; opacity: ${isFirst ? 1 : 0.85}; margin-right: 4px;">${cat}</span>`;
            }).join('');
        }

        // Chart instances (for cleanup)
        let invoiceCharts = {
            statusChart: null,
            timeChart: null,
            vendorChart: null,
            trendChart: null,
            categoryChart: null
        };

        // Helper function to get filtered invoices
        function getFilteredInvoices() {
            let filtered = [...invoices];

            // Filter by store
            if (invoiceFilters.store !== 'all') {
                filtered = filtered.filter(i => i.store === invoiceFilters.store);
            }

            // Filter by time period
            if (invoiceFilters.timePeriod !== 'all') {
                const now = new Date();
                const filterDate = new Date();

                switch (invoiceFilters.timePeriod) {
                    case '7days':
                        filterDate.setDate(now.getDate() - 7);
                        break;
                    case 'thisMonth':
                        filterDate.setDate(1);
                        break;
                    case 'lastMonth':
                        filterDate.setMonth(now.getMonth() - 1);
                        filterDate.setDate(1);
                        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                        filtered = filtered.filter(i => {
                            const date = new Date(i.dueDate);
                            return date >= filterDate && date <= lastMonthEnd;
                        });
                        return filtered;
                    case 'thisQuarter':
                        const quarter = Math.floor(now.getMonth() / 3);
                        filterDate.setMonth(quarter * 3);
                        filterDate.setDate(1);
                        break;
                    case 'thisYear':
                        filterDate.setMonth(0);
                        filterDate.setDate(1);
                        break;
                }

                filtered = filtered.filter(i => new Date(i.dueDate) >= filterDate);
            }

            // Filter by vendor
            if (invoiceFilters.vendor !== 'all') {
                filtered = filtered.filter(i => i.vendor === invoiceFilters.vendor);
            }

            // Filter by category (supports multiple categories)
            if (invoiceFilters.category !== 'all') {
                filtered = filtered.filter(i => {
                    const cats = i.categories && i.categories.length > 0 ? i.categories : (i.category ? [i.category] : []);
                    return cats.some(c => c.toLowerCase() === invoiceFilters.category.toLowerCase());
                });
            }

            // Filter by status
            if (invoiceFilters.status !== 'all') {
                filtered = filtered.filter(i => i.status === invoiceFilters.status);
            }

            // Filter by amount range
            if (invoiceFilters.minAmount !== null) {
                filtered = filtered.filter(i => i.amount >= invoiceFilters.minAmount);
            }
            if (invoiceFilters.maxAmount !== null) {
                filtered = filtered.filter(i => i.amount <= invoiceFilters.maxAmount);
            }

            return filtered;
        }

        // Update invoice filter and re-render
        function updateInvoiceFilter(filterKey, value) {
            invoiceFilters[filterKey] = value;
            renderInvoices();
        }
        window.updateInvoiceFilter = updateInvoiceFilter;

        // Reset all invoice filters
        function resetInvoiceFilters() {
            invoiceFilters = {
                store: 'all',
                timePeriod: 'all',
                vendor: 'all',
                category: 'all',
                status: 'all',
                minAmount: null,
                maxAmount: null,
                activeTab: invoiceFilters.activeTab,
                sortBy: 'dueDate-asc'
            };
            renderInvoices();
        }
        window.resetInvoiceFilters = resetInvoiceFilters;

        // Switch invoice tab
        function switchInvoiceTab(tab) {
            invoiceFilters.activeTab = tab;
            renderInvoices();
        }
        window.switchInvoiceTab = switchInvoiceTab;

        // Update invoice sort
        function updateInvoiceSort(sortValue) {
            invoiceFilters.sortBy = sortValue;
            renderInvoices();
        }
        window.updateInvoiceSort = updateInvoiceSort;

        // Sort invoices based on current sortBy filter
        function sortInvoices(invoicesList) {
            const [field, direction] = invoiceFilters.sortBy.split('-');
            const multiplier = direction === 'desc' ? -1 : 1;

            return [...invoicesList].sort((a, b) => {
                let valA, valB;

                switch (field) {
                    case 'createdAt':
                        valA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()) : 0;
                        valB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()) : 0;
                        break;
                    case 'dueDate':
                        valA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                        valB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                        break;
                    case 'invoiceDate':
                        valA = a.invoiceDate ? new Date(a.invoiceDate).getTime() : 0;
                        valB = b.invoiceDate ? new Date(b.invoiceDate).getTime() : 0;
                        break;
                    case 'vendor':
                        valA = (a.vendor || '').toLowerCase();
                        valB = (b.vendor || '').toLowerCase();
                        return multiplier * valA.localeCompare(valB);
                    case 'invoiceNumber':
                        valA = a.invoiceNumber || '';
                        valB = b.invoiceNumber || '';
                        return multiplier * valA.localeCompare(valB, undefined, { numeric: true });
                    case 'amount':
                        valA = parseFloat(a.amount) || 0;
                        valB = parseFloat(b.amount) || 0;
                        break;
                    default:
                        // Default to createdAt desc if field not recognized
                        valA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()) : 0;
                        valB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()) : 0;
                }

                return multiplier * (valA - valB);
            });
        }

        // Render current invoices table
        function renderCurrentInvoicesTable(filteredInvoices) {
            if (filteredInvoices.length === 0) {
                return `
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                        <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                        <div style="font-size: 16px;">No invoices found</div>
                        <div style="font-size: 14px; margin-top: 8px;">Try adjusting your filters</div>
                    </div>
                `;
            }

            return `
                <table class="data-table invoices-table">
                    <thead>
                        <tr>
                            <th style="width: 60px;">File</th>
                            <th>Invoice #</th>
                            <th>Vendor</th>
                            <th>Category</th>
                            <th>Store</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th style="width: 140px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredInvoices.map(invoice => {
                            const statusStyles = {
                                paid: 'background: #10b981; color: #fff;',
                                pending: 'background: #f59e0b; color: #000;',
                                overdue: 'background: #ef4444; color: #fff;',
                                filed: 'background: #6366f1; color: #fff;'
                            };
                            const invoiceId = invoice.firestoreId || invoice.id;

                            return `
                                <tr>
                                    <td data-label="">
                                        ${invoice.photo ? (invoice.fileType === 'pdf' ? `
                                            <div style="width: 40px; height: 40px; background: var(--bg-tertiary); border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="viewInvoice('${invoiceId}')" title="PDF">
                                                <i class="fas fa-file-pdf" style="font-size: 20px; color: #ef4444;"></i>
                                            </div>
                                        ` : `
                                            <img src="${invoice.photo}" alt="Invoice" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; cursor: pointer;" onclick="viewInvoice('${invoiceId}')">
                                        `) : `
                                            <div style="width: 40px; height: 40px; background: var(--bg-tertiary); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                                                <i class="fas fa-file-invoice" style="color: var(--text-muted);"></i>
                                            </div>
                                        `}
                                    </td>
                                    <td data-label="Invoice #"><strong>${invoice.invoiceNumber}</strong></td>
                                    <td data-label="Vendor">${invoice.vendor}</td>
                                    <td data-label="Category">${renderInvoiceCategoryBadges(invoice)}</td>
                                    <td data-label="Store">${invoice.store || '<span style="color: var(--text-muted);">Unassigned</span>'}</td>
                                    <td data-label="Amount" style="font-weight: 600;">$${invoice.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                    <td data-label="Due Date">${formatDate(invoice.dueDate)}</td>
                                    <td data-label="Status">
                                        <span class="badge" style="${statusStyles[invoice.status]}; font-size: 11px;">${invoice.status.toUpperCase()}</span>
                                        ${invoice.recurring ? '<i class="fas fa-sync-alt" style="margin-left: 6px; color: var(--text-muted); font-size: 12px;" title="Recurring"></i>' : ''}
                                    </td>
                                    <td data-label="">
                                        ${invoice.status !== 'paid' ? `<button class="btn-icon" onclick="markInvoicePaid('${invoiceId}')" title="Mark Paid"><i class="fas fa-check"></i></button>` : ''}
                                        <button class="btn-icon" onclick="viewInvoice('${invoiceId}')" title="View"><i class="fas fa-eye"></i></button>
                                        <button class="btn-icon" onclick="editInvoice('${invoiceId}')" title="Edit"><i class="fas fa-edit"></i></button>
                                        <button class="btn-icon danger" onclick="deleteInvoice('${invoiceId}')" title="Delete"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }

        // Render recurring projections
        function renderRecurringProjections() {
            const recurringInvoices = invoices.filter(i => i.recurring);

            if (recurringInvoices.length === 0) {
                return `
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                        <i class="fas fa-sync-alt" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                        <div style="font-size: 16px;">No recurring invoices found</div>
                        <div style="font-size: 14px; margin-top: 8px;">Mark invoices as recurring to see future projections</div>
                    </div>
                `;
            }

            // Generate next 6 months of projections
            const projections = [];
            const today = new Date();

            // Generate month options for filter
            const monthOptions = [];
            for (let i = 1; i <= 6; i++) {
                const monthDate = new Date(today);
                monthDate.setMonth(today.getMonth() + i);
                const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
                const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                monthOptions.push({ key: monthKey, label: monthLabel });
            }

            recurringInvoices.forEach(invoice => {
                for (let i = 1; i <= 6; i++) {
                    const projectionDate = new Date(today);
                    projectionDate.setMonth(today.getMonth() + i);

                    projections.push({
                        ...invoice,
                        projectedDate: projectionDate,
                        monthKey: `${projectionDate.getFullYear()}-${String(projectionDate.getMonth() + 1).padStart(2, '0')}`,
                        isProjection: true
                    });
                }
            });

            // Filter by selected month if not 'all'
            let filteredProjections = projections;
            if (invoiceFilters.recurringMonth && invoiceFilters.recurringMonth !== 'all') {
                filteredProjections = projections.filter(p => p.monthKey === invoiceFilters.recurringMonth);
            }

            // Sort by date
            filteredProjections.sort((a, b) => a.projectedDate - b.projectedDate);

            // Calculate totals for display
            const displayTotal = filteredProjections.reduce((sum, p) => sum + p.amount, 0);
            const totalProjected = projections.reduce((sum, p) => sum + p.amount, 0);

            return `
                <div style="padding: 20px;">
                    <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <i class="fas fa-info-circle" style="color: var(--accent-primary); font-size: 20px;"></i>
                                <div>
                                    <div style="font-weight: 600; margin-bottom: 4px;">Recurring Invoice Projections</div>
                                    <div style="font-size: 13px; color: var(--text-muted);">Showing projected invoices for the next 6 months based on monthly recurrence</div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <label style="font-size: 13px; color: var(--text-muted); white-space: nowrap;">
                                    <i class="fas fa-calendar-alt" style="margin-right: 6px;"></i>Filter by Month:
                                </label>
                                <select id="recurring-month-filter" onchange="filterRecurringByMonth(this.value)"
                                        style="padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); font-size: 13px; min-width: 160px;">
                                    <option value="all" ${invoiceFilters.recurringMonth === 'all' ? 'selected' : ''}>All Months</option>
                                    ${monthOptions.map(m => `
                                        <option value="${m.key}" ${invoiceFilters.recurringMonth === m.key ? 'selected' : ''}>${m.label}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 12px;">
                            <div style="background: var(--bg-primary); padding: 12px; border-radius: 8px;">
                                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">
                                    ${invoiceFilters.recurringMonth === 'all' ? 'Total Projected (6mo)' : 'Total for Selected Month'}
                                </div>
                                <div style="font-size: 20px; font-weight: 700; color: var(--accent-primary);">
                                    $${displayTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                </div>
                            </div>
                            <div style="background: var(--bg-primary); padding: 12px; border-radius: 8px;">
                                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Recurring Invoices</div>
                                <div style="font-size: 20px; font-weight: 700;">${recurringInvoices.length}</div>
                            </div>
                            ${invoiceFilters.recurringMonth !== 'all' ? `
                            <div style="background: var(--bg-primary); padding: 12px; border-radius: 8px;">
                                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Invoices This Month</div>
                                <div style="font-size: 20px; font-weight: 700;">${filteredProjections.length}</div>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    ${filteredProjections.length === 0 ? `
                        <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                            <i class="fas fa-calendar-times" style="font-size: 36px; margin-bottom: 12px; display: block;"></i>
                            <div style="font-size: 14px;">No projections for the selected month</div>
                        </div>
                    ` : `
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Projected Date</th>
                                <th>Invoice #</th>
                                <th>Vendor</th>
                                <th>Category</th>
                                <th>Store</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredProjections.map(proj => `
                                <tr>
                                    <td><strong>${formatDate(proj.projectedDate)}</strong></td>
                                    <td>${proj.invoiceNumber} <span style="font-size: 11px; color: var(--text-muted);">(recurring)</span></td>
                                    <td>${proj.vendor}</td>
                                    <td><span class="badge" style="background: var(--accent-primary); color: #fff; font-size: 11px;">${proj.category}</span></td>
                                    <td>${proj.store || '<span style="color: var(--text-muted);">Unassigned</span>'}</td>
                                    <td style="font-weight: 600;">$${proj.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    `}
                </div>
            `;
        }

        // Filter recurring projections by month
        function filterRecurringByMonth(month) {
            invoiceFilters.recurringMonth = month;
            const container = document.getElementById('invoice-content-area');
            if (container) {
                container.innerHTML = renderRecurringProjections();
            }
        }

        // Initialize all invoice charts
        function initializeInvoiceCharts(filteredInvoices) {
            // Destroy existing charts
            Object.values(invoiceCharts).forEach(chart => {
                if (chart) chart.destroy();
            });

            // Status Breakdown (Donut Chart)
            const statusCtx = document.getElementById('invoice-status-chart');
            if (statusCtx) {
                const statusCounts = {
                    paid: filteredInvoices.filter(i => i.status === 'paid').length,
                    pending: filteredInvoices.filter(i => i.status === 'pending').length,
                    overdue: filteredInvoices.filter(i => i.status === 'overdue').length
                };

                invoiceCharts.statusChart = new Chart(statusCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Paid', 'Pending', 'Overdue'],
                        datasets: [{
                            data: [statusCounts.paid, statusCounts.pending, statusCounts.overdue],
                            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }

            // Category Breakdown (Pie Chart)
            const categoryCtx = document.getElementById('invoice-category-chart');
            if (categoryCtx) {
                const categoryData = {};
                filteredInvoices.forEach(inv => {
                    const cat = inv.category || 'Other';
                    categoryData[cat] = (categoryData[cat] || 0) + inv.amount;
                });

                const categoryLabels = Object.keys(categoryData);
                const categoryValues = Object.values(categoryData);
                const categoryColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

                invoiceCharts.categoryChart = new Chart(categoryCtx, {
                    type: 'pie',
                    data: {
                        labels: categoryLabels,
                        datasets: [{
                            data: categoryValues,
                            backgroundColor: categoryColors.slice(0, categoryLabels.length),
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.label + ': $' + context.parsed.toLocaleString('en-US', {minimumFractionDigits: 2});
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Amount Over Time (Bar Chart - Weekly)
            const timeCtx = document.getElementById('invoice-time-chart');
            if (timeCtx) {
                // Get last 8 weeks of data
                const weeks = [];
                const now = new Date();

                for (let i = 7; i >= 0; i--) {
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - (i * 7));
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);

                    const weekInvoices = filteredInvoices.filter(inv => {
                        const invDate = new Date(inv.dueDate);
                        return invDate >= weekStart && invDate <= weekEnd;
                    });

                    const weekTotal = weekInvoices.reduce((sum, inv) => sum + inv.amount, 0);

                    weeks.push({
                        label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
                        total: weekTotal
                    });
                }

                invoiceCharts.timeChart = new Chart(timeCtx, {
                    type: 'bar',
                    data: {
                        labels: weeks.map(w => w.label),
                        datasets: [{
                            label: 'Amount',
                            data: weeks.map(w => w.total),
                            backgroundColor: '#6366f1',
                            borderRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return '$' + context.parsed.y.toLocaleString('en-US', {minimumFractionDigits: 2});
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '$' + value.toLocaleString();
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Trend Analysis (Line Chart)
            const trendCtx = document.getElementById('invoice-trend-chart');
            if (trendCtx) {
                // Get last 12 weeks cumulative
                const trendWeeks = [];
                const now = new Date();
                let cumulative = 0;

                for (let i = 11; i >= 0; i--) {
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - (i * 7));
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);

                    const weekInvoices = filteredInvoices.filter(inv => {
                        const invDate = new Date(inv.dueDate);
                        return invDate >= weekStart && invDate <= weekEnd;
                    });

                    const weekTotal = weekInvoices.reduce((sum, inv) => sum + inv.amount, 0);
                    cumulative += weekTotal;

                    trendWeeks.push({
                        label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
                        cumulative: cumulative
                    });
                }

                invoiceCharts.trendChart = new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: trendWeeks.map(w => w.label),
                        datasets: [{
                            label: 'Cumulative Amount',
                            data: trendWeeks.map(w => w.cumulative),
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return '$' + context.parsed.y.toLocaleString('en-US', {minimumFractionDigits: 2});
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '$' + value.toLocaleString();
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Top Vendors (Horizontal Bar Chart)
            const vendorCtx = document.getElementById('invoice-vendor-chart');
            if (vendorCtx) {
                const vendorData = {};
                filteredInvoices.forEach(inv => {
                    vendorData[inv.vendor] = (vendorData[inv.vendor] || 0) + inv.amount;
                });

                const sortedVendors = Object.entries(vendorData)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10);

                invoiceCharts.vendorChart = new Chart(vendorCtx, {
                    type: 'bar',
                    data: {
                        labels: sortedVendors.map(v => v[0]),
                        datasets: [{
                            label: 'Total Amount',
                            data: sortedVendors.map(v => v[1]),
                            backgroundColor: '#8b5cf6',
                            borderRadius: 6
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return '$' + context.parsed.x.toLocaleString('en-US', {minimumFractionDigits: 2});
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '$' + value.toLocaleString();
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }

        async function renderInvoices() {
            const dashboard = document.querySelector('.dashboard');

            // Load invoices and categories from Firebase
            await Promise.all([
                loadInvoicesFromFirebase(),
                loadInvoiceCategories()
            ]);

            // Get filtered invoices
            const filteredInvoices = getFilteredInvoices();

            // Calculate metrics - considering partial payments
            const totalAmount = filteredInvoices.reduce((sum, i) => sum + i.amount, 0);
            // Total paid = fully paid invoices + partial payments made
            const totalPaid = filteredInvoices.reduce((sum, i) => {
                if (i.status === 'paid') return sum + i.amount;
                return sum + (i.amountPaid || 0); // Add partial payments
            }, 0);
            // Total pending = balance remaining on pending, partial, and overdue invoices
            const totalPending = filteredInvoices.reduce((sum, i) => {
                if (i.status === 'pending' || i.status === 'overdue' || i.status === 'partial') {
                    return sum + (i.amount - (i.amountPaid || 0));
                }
                return sum;
            }, 0);
            const overdueCount = filteredInvoices.filter(i => i.status === 'overdue').length;

            // Get unique values for filters
            const stores = ['All Stores', ...new Set(invoices.filter(i => i.store).map(i => i.store))];
            const vendors = [...new Set(invoices.map(i => i.vendor))].sort();
            const categories = getAllInvoiceCategories();

            // Calculate pending payments for tab badge
            const pendingPaymentsCount = invoices.filter(i => i.status === 'pending' || i.status === 'overdue' || (i.status === 'partial' && (i.amountPaid || 0) < i.amount)).length;

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Invoices & Payments</h2>
                        <p class="section-subtitle">Track and manage all your invoices and payments</p>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <button onclick="exportInvoicesToExcel()" style="padding: 10px 16px; border-radius: 8px; border: 1px solid #10b981; background: rgba(16, 185, 129, 0.1); color: #10b981; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; transition: all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='white';" onmouseout="this.style.background='rgba(16, 185, 129, 0.1)'; this.style.color='#10b981';">
                            <i class="fas fa-file-excel"></i> Excel
                        </button>
                        <button onclick="exportInvoicesToPDF()" style="padding: 10px 16px; border-radius: 8px; border: 1px solid #ef4444; background: rgba(239, 68, 68, 0.1); color: #ef4444; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; transition: all 0.2s;" onmouseover="this.style.background='#ef4444'; this.style.color='white';" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'; this.style.color='#ef4444';">
                            <i class="fas fa-file-pdf"></i> PDF
                        </button>
                        <button onclick="openBulkInvoiceUpload()" style="padding: 10px 16px; border-radius: 8px; border: 1px solid #8b5cf6; background: rgba(139, 92, 246, 0.1); color: #8b5cf6; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; transition: all 0.2s;" onmouseover="this.style.background='#8b5cf6'; this.style.color='white';" onmouseout="this.style.background='rgba(139, 92, 246, 0.1)'; this.style.color='#8b5cf6';">
                            <i class="fas fa-layer-group"></i> Bulk Upload
                        </button>
                        <button class="btn-primary floating-add-btn" onclick="openModal('add-invoice')">
                            <i class="fas fa-plus"></i> Add Invoice
                        </button>
                    </div>
                </div>

                <!-- MAIN TABS NAVIGATION -->
                <div style="display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap;">
                    <button onclick="switchInvoiceMainTab('all')" class="invoice-main-tab ${!invoiceFilters.mainTab || invoiceFilters.mainTab === 'all' ? 'active' : ''}" style="padding: 12px 24px; border-radius: 12px; border: 2px solid ${!invoiceFilters.mainTab || invoiceFilters.mainTab === 'all' ? '#6366f1' : 'var(--border-color)'}; background: ${!invoiceFilters.mainTab || invoiceFilters.mainTab === 'all' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-card)'}; color: ${!invoiceFilters.mainTab || invoiceFilters.mainTab === 'all' ? 'white' : 'var(--text-primary)'}; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s;">
                        <i class="fas fa-file-invoice"></i> Invoices
                    </button>
                    <button onclick="switchInvoiceMainTab('pending')" class="invoice-main-tab ${invoiceFilters.mainTab === 'pending' ? 'active' : ''}" style="padding: 12px 24px; border-radius: 12px; border: 2px solid ${invoiceFilters.mainTab === 'pending' ? '#f59e0b' : 'var(--border-color)'}; background: ${invoiceFilters.mainTab === 'pending' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'var(--bg-card)'}; color: ${invoiceFilters.mainTab === 'pending' ? 'white' : 'var(--text-primary)'}; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s;">
                        <i class="fas fa-clock"></i> Pending Payments
                        ${pendingPaymentsCount > 0 ? `<span style="background: ${invoiceFilters.mainTab === 'pending' ? 'rgba(255,255,255,0.3)' : '#ef4444'}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${pendingPaymentsCount}</span>` : ''}
                    </button>
                    <button onclick="switchInvoiceMainTab('recurring')" class="invoice-main-tab ${invoiceFilters.mainTab === 'recurring' ? 'active' : ''}" style="padding: 12px 24px; border-radius: 12px; border: 2px solid ${invoiceFilters.mainTab === 'recurring' ? '#8b5cf6' : 'var(--border-color)'}; background: ${invoiceFilters.mainTab === 'recurring' ? 'linear-gradient(135deg, #8b5cf6, #a855f7)' : 'var(--bg-card)'}; color: ${invoiceFilters.mainTab === 'recurring' ? 'white' : 'var(--text-primary)'}; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s;">
                        <i class="fas fa-sync-alt"></i> Recurring
                    </button>
                    <button onclick="switchInvoiceMainTab('analytics')" class="invoice-main-tab ${invoiceFilters.mainTab === 'analytics' ? 'active' : ''}" style="padding: 12px 24px; border-radius: 12px; border: 2px solid ${invoiceFilters.mainTab === 'analytics' ? '#10b981' : 'var(--border-color)'}; background: ${invoiceFilters.mainTab === 'analytics' ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--bg-card)'}; color: ${invoiceFilters.mainTab === 'analytics' ? 'white' : 'var(--text-primary)'}; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s;">
                        <i class="fas fa-chart-pie"></i> Analytics
                    </button>

                    <!-- Store Quick Filters -->
                    <div style="display: flex; gap: 6px; margin-left: auto; flex-wrap: wrap;">
                        <button onclick="filterInvoicesByStore('all')" style="padding: 8px 12px; border-radius: 8px; border: none; background: ${invoiceFilters.store === 'all' ? '#10b981' : '#e5e7eb'}; color: ${invoiceFilters.store === 'all' ? 'white' : '#374151'}; font-weight: 600; font-size: 11px; cursor: pointer; text-transform: uppercase;">Cash Expense</button>
                        <button onclick="filterInvoicesByStore('Miramar')" style="padding: 8px 12px; border-radius: 8px; border: none; background: ${invoiceFilters.store === 'Miramar' ? '#8b5cf6' : '#e5e7eb'}; color: ${invoiceFilters.store === 'Miramar' ? 'white' : '#374151'}; font-weight: 600; font-size: 11px; cursor: pointer; text-transform: uppercase;">MM Expenses</button>
                        <button onclick="filterInvoicesByStore('Chula Vista')" style="padding: 8px 12px; border-radius: 8px; border: none; background: ${invoiceFilters.store === 'Chula Vista' ? '#ec4899' : '#e5e7eb'}; color: ${invoiceFilters.store === 'Chula Vista' ? 'white' : '#374151'}; font-weight: 600; font-size: 11px; cursor: pointer; text-transform: uppercase;">CV Expenses</button>
                        <button onclick="filterInvoicesByStore('North Park')" style="padding: 8px 12px; border-radius: 8px; border: none; background: ${invoiceFilters.store === 'North Park' ? '#f59e0b' : '#e5e7eb'}; color: ${invoiceFilters.store === 'North Park' ? 'white' : '#374151'}; font-weight: 600; font-size: 11px; cursor: pointer; text-transform: uppercase;">NP Expenses</button>
                        <button onclick="filterInvoicesByStore('Morena')" style="padding: 8px 12px; border-radius: 8px; border: none; background: ${invoiceFilters.store === 'Morena' ? '#3b82f6' : '#e5e7eb'}; color: ${invoiceFilters.store === 'Morena' ? 'white' : '#374151'}; font-weight: 600; font-size: 11px; cursor: pointer; text-transform: uppercase;">MB Expenses</button>
                        <button onclick="filterInvoicesByStore('Kearny Mesa')" style="padding: 8px 12px; border-radius: 8px; border: none; background: ${invoiceFilters.store === 'Kearny Mesa' ? '#14b8a6' : '#e5e7eb'}; color: ${invoiceFilters.store === 'Kearny Mesa' ? 'white' : '#374151'}; font-weight: 600; font-size: 11px; cursor: pointer; text-transform: uppercase;">KM Expenses</button>
                        <button onclick="filterInvoicesByStore('Miramar Wine & Liquor')" style="padding: 8px 12px; border-radius: 8px; border: none; background: ${invoiceFilters.store === 'Miramar Wine & Liquor' ? '#7c3aed' : '#e5e7eb'}; color: ${invoiceFilters.store === 'Miramar Wine & Liquor' ? 'white' : '#374151'}; font-weight: 600; font-size: 11px; cursor: pointer; text-transform: uppercase;">Liquor Expenses</button>
                    </div>
                </div>

                <!-- Summary Cards - Always visible -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px;">
                    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; padding: 16px; color: white; display: flex; align-items: center; gap: 12px;">
                        <div style="width: 42px; height: 42px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas fa-file-invoice-dollar" style="font-size: 18px;"></i>
                        </div>
                        <div>
                            <div style="font-size: 11px; opacity: 0.9;">Total</div>
                            <div style="font-size: 20px; font-weight: 700;">$${totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 16px; color: white; display: flex; align-items: center; gap: 12px;">
                        <div style="width: 42px; height: 42px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas fa-check-circle" style="font-size: 18px;"></i>
                        </div>
                        <div>
                            <div style="font-size: 11px; opacity: 0.9;">Paid</div>
                            <div style="font-size: 20px; font-weight: 700;">$${totalPaid.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; padding: 16px; color: white; display: flex; align-items: center; gap: 12px;">
                        <div style="width: 42px; height: 42px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas fa-clock" style="font-size: 18px;"></i>
                        </div>
                        <div>
                            <div style="font-size: 11px; opacity: 0.9;">Pending</div>
                            <div style="font-size: 20px; font-weight: 700;">$${totalPending.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 12px; padding: 16px; color: white; display: flex; align-items: center; gap: 12px;">
                        <div style="width: 42px; height: 42px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 18px;"></i>
                        </div>
                        <div>
                            <div style="font-size: 11px; opacity: 0.9;">Overdue</div>
                            <div style="font-size: 20px; font-weight: 700;">${overdueCount}</div>
                        </div>
                    </div>
                </div>

                <!-- TAB CONTENT -->
                <div id="invoice-main-tab-content">
                    ${renderInvoiceTabContent(invoiceFilters.mainTab || 'pending', filteredInvoices, stores, vendors, categories)}
                </div>
            `;

            // Initialize charts if on analytics tab
            if (invoiceFilters.mainTab === 'analytics') {
                setTimeout(() => initializeInvoiceCharts(filteredInvoices), 100);
            }
        }

        // Function to render tab content based on active tab
        function renderInvoiceTabContent(tab, filteredInvoices, stores, vendors, categories) {
            if (tab === 'pending') {
                return renderPendingPaymentsTab();
            } else if (tab === 'all') {
                return renderAllInvoicesTab(filteredInvoices, stores, vendors, categories);
            } else if (tab === 'recurring') {
                return renderRecurringTab();
            } else if (tab === 'analytics') {
                return renderAnalyticsTab(filteredInvoices);
            }
            return renderPendingPaymentsTab();
        }

        // Pending Payments Tab Content
        function renderPendingPaymentsTab() {
            // First filter by store if a store filter is active
            let filteredInvoices = invoices;
            if (invoiceFilters.store && invoiceFilters.store !== 'all') {
                filteredInvoices = invoices.filter(i => i.store === invoiceFilters.store);
            }
            // Then filter for pending/overdue/partial
            const pendingPayments = filteredInvoices.filter(i => i.status === 'pending' || i.status === 'overdue' || (i.status === 'partial' && (i.amountPaid || 0) < i.amount));
            const totalOwed = pendingPayments.reduce((sum, i) => sum + (i.amount - (i.amountPaid || 0)), 0);
            const overduePayments = pendingPayments.filter(i => {
                const dueDate = i.dueDate ? new Date(i.dueDate) : null;
                return dueDate && dueDate < new Date();
            });
            const overdueAmount = overduePayments.reduce((sum, i) => sum + (i.amount - (i.amountPaid || 0)), 0);

            if (pendingPayments.length === 0) return `
                <div class="card" style="border: 2px solid #10b981; background: linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%);">
                    <div class="card-body" style="text-align: center; padding: 60px;">
                        <i class="fas fa-check-circle" style="font-size: 64px; color: #10b981; margin-bottom: 20px;"></i>
                        <h3 style="color: #10b981; margin-bottom: 8px; font-size: 24px;">All Caught Up!</h3>
                        <p style="color: var(--text-muted); font-size: 16px;">No pending payments at this time.</p>
                    </div>
                </div>
            `;

            return `
                <div class="card" style="border: 2px solid #f59e0b; background: linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(217,119,6,0.03) 100%); overflow: hidden;">
                    <!-- Header Banner -->
                    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-clock" style="font-size: 28px; color: white;"></i>
                            </div>
                            <div>
                                <h3 style="color: white; font-size: 22px; font-weight: 700; margin: 0;">Pending Payments</h3>
                                <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 4px 0 0 0;">${pendingPayments.length} invoice${pendingPayments.length !== 1 ? 's' : ''} awaiting payment</p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                            <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 12px 20px; border-radius: 12px; text-align: center;">
                                <div style="font-size: 11px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px;">Total Owed</div>
                                <div style="font-size: 24px; font-weight: 800; color: white;">$${totalOwed.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                            </div>
                            ${overduePayments.length > 0 ? `
                            <div style="background: rgba(239,68,68,0.9); padding: 12px 20px; border-radius: 12px; text-align: center;">
                                <div style="font-size: 11px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 1px;">Overdue</div>
                                <div style="font-size: 24px; font-weight: 800; color: white;">$${overdueAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Table -->
                    <div class="card-body" style="padding: 0; max-height: 500px; overflow-y: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead style="background: rgba(245,158,11,0.1); position: sticky; top: 0; z-index: 10;">
                                <tr>
                                    <th style="padding: 14px 16px; text-align: left; font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Vendor</th>
                                    <th style="padding: 14px 16px; text-align: left; font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Invoice #</th>
                                    <th style="padding: 14px 16px; text-align: left; font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Store</th>
                                    <th style="padding: 14px 16px; text-align: right; font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Amount</th>
                                    <th style="padding: 14px 16px; text-align: right; font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Balance</th>
                                    <th style="padding: 14px 16px; text-align: center; font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Due Date</th>
                                    <th style="padding: 14px 16px; text-align: center; font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Status</th>
                                    <th style="padding: 14px 16px; text-align: center; font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pendingPayments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map(inv => {
                                    const balance = inv.amount - (inv.amountPaid || 0);
                                    const dueDate = inv.dueDate ? new Date(inv.dueDate) : null;
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const daysUntilDue = dueDate ? Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)) : null;
                                    const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
                                    const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7;

                                    let statusColor, statusText, statusBg;
                                    if (isOverdue) {
                                        statusColor = '#ef4444';
                                        statusBg = 'rgba(239,68,68,0.15)';
                                        statusText = Math.abs(daysUntilDue) + 'd overdue';
                                    } else if (inv.status === 'partial') {
                                        statusColor = '#8b5cf6';
                                        statusBg = 'rgba(139,92,246,0.15)';
                                        statusText = 'Partial';
                                    } else if (isDueSoon) {
                                        statusColor = '#f59e0b';
                                        statusBg = 'rgba(245,158,11,0.15)';
                                        statusText = daysUntilDue === 0 ? 'Due today' : daysUntilDue + 'd left';
                                    } else {
                                        statusColor = '#6366f1';
                                        statusBg = 'rgba(99,102,241,0.15)';
                                        statusText = 'Pending';
                                    }

                                    return `
                                <tr style="border-bottom: 1px solid var(--border-color); ${isOverdue ? 'background: rgba(239,68,68,0.05);' : ''}" onmouseover="this.style.background='${isOverdue ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.05)'}'" onmouseout="this.style.background='${isOverdue ? 'rgba(239,68,68,0.05)' : 'transparent'}'">
                                    <td style="padding: 14px 16px;"><div style="font-weight: 600; color: var(--text-primary);">${inv.vendor || 'Unknown'}</div></td>
                                    <td style="padding: 14px 16px; color: var(--text-secondary); font-family: monospace; font-size: 13px;">${inv.invoiceNumber || '-'}</td>
                                    <td style="padding: 14px 16px; color: var(--text-secondary); font-size: 13px;">${inv.store || '-'}</td>
                                    <td style="padding: 14px 16px; text-align: right; color: var(--text-primary); font-weight: 500;">$${inv.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                    <td style="padding: 14px 16px; text-align: right; font-weight: 700; color: ${isOverdue ? '#ef4444' : '#f59e0b'};">$${balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                    <td style="padding: 14px 16px; text-align: center; color: ${isOverdue ? '#ef4444' : 'var(--text-secondary)'}; font-size: 13px; font-weight: ${isOverdue ? '600' : '400'};">
                                        ${inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : '-'}
                                    </td>
                                    <td style="padding: 14px 16px; text-align: center;">
                                        <span style="background: ${statusBg}; color: ${statusColor}; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase;">${statusText}</span>
                                    </td>
                                    <td style="padding: 14px 12px; text-align: center; white-space: nowrap;">
                                        <button onclick="openRecordPaymentModal('${inv.id || inv.firestoreId}')" style="background: linear-gradient(135deg, #10b981, #059669); border: none; color: white; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; margin-right: 4px;" title="Record Payment">
                                            <i class="fas fa-credit-card"></i> Pay
                                        </button>
                                        <button class="btn-icon" onclick="viewInvoice('${inv.id || inv.firestoreId}')" title="View Details" style="padding: 6px; margin: 0 2px;"><i class="fas fa-eye" style="font-size: 12px;"></i></button>
                                        <button class="btn-icon" onclick="editInvoice('${inv.id || inv.firestoreId}')" title="Edit" style="padding: 6px; margin: 0 2px;"><i class="fas fa-edit" style="font-size: 12px;"></i></button>
                                        <button class="btn-icon" onclick="deleteInvoice('${inv.id || inv.firestoreId}')" title="Delete" style="padding: 6px; margin: 0 2px;"><i class="fas fa-trash" style="font-size: 12px;"></i></button>
                                    </td>
                                </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // All Invoices Tab Content
        function renderAllInvoicesTab(filteredInvoices, stores, vendors, categories) {
            const storeOptions = stores.map(s => `<option value="${s === 'All Stores' ? 'all' : s}" ${invoiceFilters.store === (s === 'All Stores' ? 'all' : s) ? 'selected' : ''}>${s}</option>`).join('');
            const vendorOptions = vendors.map(v => `<option value="${v}">${v}</option>`).join('');

            return `
                <!-- Filters Bar -->
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-body">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; align-items: end;">
                            <div>
                                <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Store</label>
                                <select class="form-input" onchange="updateInvoiceFilter('store', this.value)">
                                    ${storeOptions}
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Period</label>
                                <select class="form-input" onchange="updateInvoiceFilter('timePeriod', this.value)">
                                    <option value="all" ${invoiceFilters.timePeriod === 'all' ? 'selected' : ''}>All Time</option>
                                    <option value="thisMonth" ${invoiceFilters.timePeriod === 'thisMonth' ? 'selected' : ''}>This Month</option>
                                    <option value="lastMonth" ${invoiceFilters.timePeriod === 'lastMonth' ? 'selected' : ''}>Last Month</option>
                                    <option value="thisYear" ${invoiceFilters.timePeriod === 'thisYear' ? 'selected' : ''}>This Year</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Vendor</label>
                                <select class="form-input" onchange="updateInvoiceFilter('vendor', this.value)">
                                    <option value="all" ${invoiceFilters.vendor === 'all' ? 'selected' : ''}>All Vendors</option>
                                    ${vendors.map(v => `<option value="${v}" ${invoiceFilters.vendor === v ? 'selected' : ''}>${v}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Status</label>
                                <select class="form-input" onchange="updateInvoiceFilter('status', this.value)">
                                    <option value="all" ${invoiceFilters.status === 'all' ? 'selected' : ''}>All Status</option>
                                    <option value="pending" ${invoiceFilters.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="partial" ${invoiceFilters.status === 'partial' ? 'selected' : ''}>Partial</option>
                                    <option value="paid" ${invoiceFilters.status === 'paid' ? 'selected' : ''}>Paid</option>
                                    <option value="overdue" ${invoiceFilters.status === 'overdue' ? 'selected' : ''}>Overdue</option>
                                    <option value="filed" ${invoiceFilters.status === 'filed' ? 'selected' : ''}>Filed</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Sort By</label>
                                <select class="form-input" onchange="updateInvoiceSort(this.value)">
                                    <option value="createdAt-desc" ${invoiceFilters.sortBy === 'createdAt-desc' ? 'selected' : ''}>Date Added (Newest)</option>
                                    <option value="createdAt-asc" ${invoiceFilters.sortBy === 'createdAt-asc' ? 'selected' : ''}>Date Added (Oldest)</option>
                                    <option value="dueDate-asc" ${invoiceFilters.sortBy === 'dueDate-asc' ? 'selected' : ''}>Due Date (Oldest)</option>
                                    <option value="dueDate-desc" ${invoiceFilters.sortBy === 'dueDate-desc' ? 'selected' : ''}>Due Date (Newest)</option>
                                    <option value="invoiceDate-desc" ${invoiceFilters.sortBy === 'invoiceDate-desc' ? 'selected' : ''}>Invoice Date (Newest)</option>
                                    <option value="invoiceDate-asc" ${invoiceFilters.sortBy === 'invoiceDate-asc' ? 'selected' : ''}>Invoice Date (Oldest)</option>
                                    <option value="vendor-asc" ${invoiceFilters.sortBy === 'vendor-asc' ? 'selected' : ''}>Vendor (A-Z)</option>
                                    <option value="vendor-desc" ${invoiceFilters.sortBy === 'vendor-desc' ? 'selected' : ''}>Vendor (Z-A)</option>
                                    <option value="invoiceNumber-asc" ${invoiceFilters.sortBy === 'invoiceNumber-asc' ? 'selected' : ''}>Invoice # (Asc)</option>
                                    <option value="invoiceNumber-desc" ${invoiceFilters.sortBy === 'invoiceNumber-desc' ? 'selected' : ''}>Invoice # (Desc)</option>
                                    <option value="amount-desc" ${invoiceFilters.sortBy === 'amount-desc' ? 'selected' : ''}>Amount (High-Low)</option>
                                    <option value="amount-asc" ${invoiceFilters.sortBy === 'amount-asc' ? 'selected' : ''}>Amount (Low-High)</option>
                                </select>
                            </div>
                            <button class="btn-secondary" onclick="resetInvoiceFilters()" style="height: 40px;">
                                <i class="fas fa-redo"></i> Reset
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Invoices Table -->
                <div class="card">
                    <div class="card-body" style="padding: 0; overflow-x: auto;">
                        <table class="data-table invoices-table-compact" style="width: 100%; min-width: 800px;">
                            <thead>
                                <tr>
                                    <th style="width: 55px;"></th>
                                    <th style="min-width: 180px;">Vendor</th>
                                    <th style="width: 100px;">Category</th>
                                    <th style="width: 90px;">Store</th>
                                    <th style="width: 90px; text-align: right;">Amount</th>
                                    <th style="width: 95px;">Due Date</th>
                                    <th style="width: 85px; text-align: center;">Status</th>
                                    <th style="width: 120px; text-align: center;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${renderInvoicesTableCompact('all')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // Recurring Tab Content
        function renderRecurringTab() {
            return renderRecurringProjections();
        }

        // Analytics Tab Content
        function renderAnalyticsTab(filteredInvoices) {
            return `
                <!-- Charts Section -->
                <div class="charts-grid-2col" style="margin-bottom: 24px;">
                    <!-- Status Breakdown (Donut) -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-chart-pie"></i> Payment Status</h3>
                        </div>
                        <div class="card-body">
                            <canvas id="invoice-status-chart" height="250"></canvas>
                        </div>
                    </div>

                    <!-- Category Breakdown -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-tags"></i> By Category</h3>
                        </div>
                        <div class="card-body">
                            <canvas id="invoice-category-chart" height="250"></canvas>
                        </div>
                    </div>
                </div>

                <div class="charts-grid-2col" style="margin-bottom: 24px;">
                    <!-- Amount Over Time (Bar) -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-chart-bar"></i> Amount Over Time</h3>
                        </div>
                        <div class="card-body">
                            <canvas id="invoice-time-chart" height="200"></canvas>
                        </div>
                    </div>

                    <!-- Trend Line Chart -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-chart-line"></i> Trend Analysis</h3>
                        </div>
                        <div class="card-body">
                            <canvas id="invoice-trend-chart" height="200"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Top Vendors -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-chart-bar"></i> Top Vendors by Amount</h3>
                    </div>
                    <div class="card-body">
                        <canvas id="invoice-vendor-chart" height="150"></canvas>
                    </div>
                </div>
            `;
        }

        // Switch main invoice tab
        function switchInvoiceMainTab(tab) {
            invoiceFilters.mainTab = tab;
            renderInvoices();
        }

        // Filter invoices by store (quick filter buttons)
        function filterInvoicesByStore(store) {
            invoiceFilters.store = store;
            renderInvoices();
        }

        function renderInvoicesTableCompact(filter = 'all') {
            let baseInvoices = invoices;
            if (invoiceFilters.store && invoiceFilters.store !== 'all') {
                baseInvoices = invoices.filter(i => i.store === invoiceFilters.store);
            }
            // Apply sorting
            baseInvoices = sortInvoices(baseInvoices);
            const filteredInvoices = filter === 'all' ? baseInvoices : baseInvoices.filter(i => i.status === filter);

            if (filteredInvoices.length === 0) {
                return `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
                            <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                            No invoices found
                        </td>
                    </tr>
                `;
            }

            return filteredInvoices.map(invoice => {
                const statusStyles = {
                    paid: 'background: var(--success); color: #fff;',
                    pending: 'background: var(--warning); color: #000;',
                    overdue: 'background: var(--danger); color: #fff;',
                    partial: 'background: #8b5cf6; color: #fff;',
                    filed: 'background: #6366f1; color: #fff;'
                };
                const invoiceId = invoice.firestoreId || invoice.id;

                return `
                    <tr>
                        <td style="padding: 10px 12px;">
                            ${invoice.photo ? (invoice.fileType === 'pdf' ? `
                                <div style="width: 40px; height: 40px; background: var(--bg-tertiary); border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="viewInvoice('${invoiceId}')" title="View PDF">
                                    <i class="fas fa-file-pdf" style="font-size: 18px; color: #ef4444;"></i>
                                </div>
                            ` : `
                                <img src="${invoice.photo}" alt="Invoice" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; cursor: pointer;" onclick="viewInvoice('${invoiceId}')" title="View">
                            `) : `
                                <div style="width: 40px; height: 40px; background: var(--bg-tertiary); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-file-invoice" style="color: var(--text-muted); font-size: 16px;"></i>
                                </div>
                            `}
                        </td>
                        <td style="padding: 10px 12px;">
                            <div style="font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${invoice.vendor}</div>
                            <div style="font-size: 11px; color: var(--text-muted); font-family: monospace;">#${invoice.invoiceNumber}</div>
                        </td>
                        <td style="padding: 10px 12px;">
                            <span style="display: inline-block; padding: 3px 8px; background: #10b98120; color: #10b981; border-radius: 4px; font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90px;">
                                ${invoice.category || 'General'}
                            </span>
                        </td>
                        <td style="padding: 10px 12px; font-size: 13px; color: var(--text-secondary);">${invoice.store || '-'}</td>
                        <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: var(--text-primary);">$${invoice.amount.toFixed(2)}</td>
                        <td style="padding: 10px 12px; font-size: 12px; color: var(--text-secondary);">${formatDate(invoice.dueDate)}</td>
                        <td style="padding: 10px 12px; text-align: center;">
                            <span class="badge" style="${statusStyles[invoice.status]} padding: 4px 8px; font-size: 10px; border-radius: 4px;">${invoice.status.toUpperCase()}</span>
                        </td>
                        <td style="padding: 10px 8px; text-align: center; white-space: nowrap;">
                            ${invoice.status !== 'paid' ? `<button class="btn-icon" onclick="markInvoicePaid('${invoiceId}')" title="Mark Paid" style="padding: 6px; margin: 0 1px;"><i class="fas fa-check" style="font-size: 12px;"></i></button>` : ''}
                            <button class="btn-icon" onclick="viewInvoice('${invoiceId}')" title="View" style="padding: 6px; margin: 0 1px;"><i class="fas fa-eye" style="font-size: 12px;"></i></button>
                            <button class="btn-icon" onclick="editInvoice('${invoiceId}')" title="Edit" style="padding: 6px; margin: 0 1px;"><i class="fas fa-edit" style="font-size: 12px;"></i></button>
                            <button class="btn-icon" onclick="deleteInvoice('${invoiceId}')" title="Delete" style="padding: 6px; margin: 0 1px;"><i class="fas fa-trash" style="font-size: 12px;"></i></button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function renderInvoicesTable(filter = 'all') {
            // First apply store filter from invoiceFilters
            let baseInvoices = invoices;
            if (invoiceFilters.store && invoiceFilters.store !== 'all') {
                baseInvoices = invoices.filter(i => i.store === invoiceFilters.store);
            }
            // Then apply status filter if specified
            const filteredInvoices = filter === 'all' ? baseInvoices : baseInvoices.filter(i => i.status === filter);

            if (filteredInvoices.length === 0) {
                return `
                    <tr>
                        <td colspan="10" style="text-align: center; padding: 40px; color: var(--text-muted);">
                            <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                            No invoices found
                        </td>
                    </tr>
                `;
            }

            return filteredInvoices.map(invoice => {
                const statusStyles = {
                    paid: 'background: var(--success); color: #fff;',
                    pending: 'background: var(--warning); color: #000;',
                    overdue: 'background: var(--danger); color: #fff;',
                    filed: 'background: #6366f1; color: #fff;'
                };

                const invoiceId = invoice.firestoreId || invoice.id;

                return `
                    <tr>
                        <td data-label="">
                            ${invoice.photo ? (invoice.fileType === 'pdf' ? `
                                <div style="width: 50px; height: 50px; background: var(--bg-tertiary); border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="viewInvoice('${invoiceId}')" title="Click to view PDF">
                                    <i class="fas fa-file-pdf" style="font-size: 24px; color: #ef4444;"></i>
                                </div>
                            ` : `
                                <img src="${invoice.photo}" alt="Invoice" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; cursor: pointer;" onclick="viewInvoice('${invoiceId}')" title="Click to view details">
                            `) : `
                                <div style="width: 50px; height: 50px; background: var(--bg-tertiary); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-file-invoice" style="color: var(--text-muted);"></i>
                                </div>
                            `}
                        </td>
                        <td data-label="Invoice #"><strong>${invoice.invoiceNumber}</strong></td>
                        <td data-label="Vendor">${invoice.vendor}</td>
                        <td data-label="Category">
                            ${renderInvoiceCategoryBadges(invoice)}
                        </td>
                        <td data-label="Store">${invoice.store || '-'}</td>
                        <td data-label="Amount" style="font-weight: 600;">$${invoice.amount.toFixed(2)}</td>
                        <td data-label="Due Date">${formatDate(invoice.dueDate)}</td>
                        <td data-label="Status">
                            <span class="badge" style="${statusStyles[invoice.status]}">${invoice.status.toUpperCase()}</span>
                            ${invoice.recurring ? '<i class="fas fa-sync-alt" style="margin-left: 8px; color: var(--text-muted);" title="Recurring"></i>' : ''}
                        </td>
                        <td data-label="">
                            ${invoice.status !== 'paid' ? `<button class="btn-icon" onclick="markInvoicePaid('${invoiceId}')" title="Mark Paid"><i class="fas fa-check"></i></button>` : ''}
                            <button class="btn-icon" onclick="viewInvoice('${invoiceId}')" title="View Details"><i class="fas fa-eye"></i></button>
                            <button class="btn-icon" onclick="editInvoice('${invoiceId}')" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon" onclick="deleteInvoice('${invoiceId}')" title="Delete"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function filterInvoices(status) {
            const tbody = document.getElementById('invoicesTableBody');
            if (tbody) {
                tbody.innerHTML = renderInvoicesTable(status);
            }
        }

        async function markInvoicePaid(id) {
            const numericId = !isNaN(id) ? parseInt(id, 10) : id;
            const invoice = invoices.find(i => i.id === id || i.id === numericId || i.firestoreId === id);
            if (invoice) {
                // Update in Firebase
                if (typeof firebaseInvoiceManager !== 'undefined' && firebaseInvoiceManager.isInitialized) {
                    const firestoreId = invoice.firestoreId || id;
                    const success = await firebaseInvoiceManager.markInvoicePaid(firestoreId);
                    if (success) {
                        // Update local state
                        invoice.status = 'paid';
                        invoice.paidDate = new Date().toISOString().split('T')[0];
                        renderInvoices();
                    } else {
                        alert('Error marking invoice as paid');
                    }
                } else {
                    // Fallback to local only
                    invoice.status = 'paid';
                    invoice.paidDate = new Date().toISOString().split('T')[0];
                    renderInvoices();
                }
            }
        }

        function viewInvoice(id) {
            // Convert id to number if it's a numeric string for comparison with numeric IDs
            const numericId = !isNaN(id) ? parseInt(id, 10) : id;
            const invoice = invoices.find(i => i.id === id || i.id === numericId || i.firestoreId === id);

            if (!invoice) {
                console.error('Invoice not found with ID:', id);
                return;
            }

            const invoiceId = invoice.firestoreId || invoice.id;
            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2>Invoice Details</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="card" style="margin-bottom: 16px;">
                        <div class="card-body">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
                                <div>
                                    <h3 style="margin: 0 0 8px;">${invoice.invoiceNumber}</h3>
                                    <div style="display: flex; gap: 8px;">
                                        <span class="badge" style="background: ${invoice.status === 'paid' ? 'var(--success)' : invoice.status === 'pending' ? 'var(--warning)' : 'var(--error)'};">${invoice.status.toUpperCase()}</span>
                                        ${invoice.recurring ? '<span class="badge" style="background: var(--accent-primary);"><i class="fas fa-sync-alt"></i> Recurring</span>' : ''}
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">$${invoice.amount.toFixed(2)}</div>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Vendor</label>
                                    <div style="font-weight: 500;">${invoice.vendor}</div>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Categories</label>
                                    <div>${renderInvoiceCategoryBadges(invoice)}</div>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Store</label>
                                    <div>${invoice.store || '<span style="color: var(--text-muted);">Unassigned</span>'}</div>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Payment Account</label>
                                    <div>${invoice.paymentAccount || '<span style="color: var(--text-muted);">Not set</span>'}</div>
                                </div>
                                ${invoice.invoiceDate ? `
                                    <div>
                                        <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Invoice Date</label>
                                        <div>${formatDate(invoice.invoiceDate)}</div>
                                    </div>
                                ` : ''}
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Due Date</label>
                                    <div>${formatDate(invoice.dueDate)}</div>
                                </div>
                                ${invoice.paidDate ? `
                                    <div>
                                        <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Paid Date</label>
                                        <div style="color: var(--success);">${formatDate(invoice.paidDate)}</div>
                                    </div>
                                ` : ''}
                                ${invoice.amountPaid && invoice.amountPaid > 0 && invoice.amountPaid < invoice.amount ? `
                                    <div>
                                        <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Amount Paid</label>
                                        <div style="color: var(--success);">$${invoice.amountPaid.toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Balance Due</label>
                                        <div style="color: #f59e0b; font-weight: 600;">$${(invoice.amount - invoice.amountPaid).toFixed(2)}</div>
                                    </div>
                                ` : ''}
                            </div>

                            ${invoice.description ? `
                                <div style="margin-top: 20px;">
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Description</label>
                                    <div>${invoice.description}</div>
                                </div>
                            ` : ''}

                            ${invoice.notes ? `
                                <div style="margin-top: 20px;">
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Notes</label>
                                    <div style="color: var(--text-secondary);">${invoice.notes}</div>
                                </div>
                            ` : ''}

                            ${invoice.photo ? `
                                <div style="margin-top: 20px;">
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 8px;">Invoice File</label>
                                    ${invoice.fileType === 'pdf' ? `
                                        <div style="border-radius: 8px; overflow: hidden; background: var(--bg-tertiary);">
                                            <div style="padding: 12px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color);">
                                                <div style="display: flex; align-items: center; gap: 12px;">
                                                    <i class="fas fa-file-pdf" style="font-size: 24px; color: #ef4444;"></i>
                                                    <span style="font-weight: 500;">${invoice.fileName || 'Invoice.pdf'}</span>
                                                </div>
                                                <div style="display: flex; gap: 8px;">
                                                    <button class="btn-secondary" onclick="openPdfInNewTab('${invoice.photo.replace(/'/g, "\\'")}')" style="padding: 6px 12px;">
                                                        <i class="fas fa-external-link-alt"></i> Open in Tab
                                                    </button>
                                                    <button class="btn-primary" onclick="downloadPdf('${invoice.photo.replace(/'/g, "\\'")}', '${(invoice.fileName || 'Invoice.pdf').replace(/'/g, "\\'")}')" style="padding: 6px 12px;">
                                                        <i class="fas fa-download"></i> Download
                                                    </button>
                                                </div>
                                            </div>
                                            <div style="width: 100%; height: 600px; position: relative; background: #525659; border-radius: 0 0 8px 8px; overflow: hidden;">
                                                <iframe
                                                    src="${invoice.photo}#toolbar=0&navpanes=0&scrollbar=0"
                                                    type="application/pdf"
                                                    style="width: 100%; height: 100%; border: none; display: block;"
                                                    frameborder="0"
                                                    allowfullscreen>
                                                </iframe>
                                            </div>
                                        </div>
                                    ` : `
                                        <div style="border-radius: 8px; overflow: hidden; background: var(--bg-tertiary);">
                                            <!-- Zoom Controls -->
                                            <div style="padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color);">
                                                <div style="display: flex; align-items: center; gap: 8px;">
                                                    <i class="fas fa-image" style="color: var(--text-muted);"></i>
                                                    <span style="font-size: 13px; color: var(--text-secondary);">Invoice Image</span>
                                                </div>
                                                <div style="display: flex; align-items: center; gap: 8px;">
                                                    <button class="btn-icon" onclick="zoomInvoiceImage(-0.25)" title="Zoom Out" style="width: 32px; height: 32px;">
                                                        <i class="fas fa-search-minus"></i>
                                                    </button>
                                                    <span id="invoice-zoom-level" style="font-size: 12px; color: var(--text-muted); min-width: 45px; text-align: center;">100%</span>
                                                    <button class="btn-icon" onclick="zoomInvoiceImage(0.25)" title="Zoom In" style="width: 32px; height: 32px;">
                                                        <i class="fas fa-search-plus"></i>
                                                    </button>
                                                    <button class="btn-icon" onclick="resetInvoiceZoom()" title="Reset Zoom" style="width: 32px; height: 32px;">
                                                        <i class="fas fa-compress-arrows-alt"></i>
                                                    </button>
                                                    <button class="btn-icon" onclick="openInvoiceImageFullSize()" title="Open Full Size" style="width: 32px; height: 32px;">
                                                        <i class="fas fa-external-link-alt"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <!-- Image Container with Zoom -->
                                            <div id="invoice-image-container" style="overflow: hidden; max-height: 400px; position: relative;">
                                                <img id="invoice-zoom-image" src="${invoice.photo}" alt="Invoice Photo" style="width: 100%; transform-origin: top left; transition: transform 0.15s ease; cursor: default; user-select: none;" ondragstart="return false;" onmousedown="startImageDrag(event)">
                                            </div>
                                        </div>
                                    `}
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px;">
                        ${invoice.status !== 'paid' ? `
                            <button class="btn-primary" style="flex: 1; min-width: 140px;" onclick="markInvoicePaid('${invoiceId}'); closeModal();">
                                <i class="fas fa-check"></i> Mark as Paid
                            </button>
                            <button class="btn-secondary" style="flex: 1; min-width: 140px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none;" onclick="openRecordPaymentModal('${invoiceId}')">
                                <i class="fas fa-credit-card"></i> Record Payment
                            </button>
                        ` : ''}
                        <button class="btn-secondary" style="flex: 1; min-width: 100px;" onclick="closeModal(); editInvoice('${invoiceId}');">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-secondary" style="flex: 1; min-width: 100px; color: #ef4444;" onclick="if(confirm('Delete this invoice?')) { deleteInvoice('${invoiceId}'); closeModal(); }">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;

            modal.classList.add('active');

            // Reset zoom level for new invoice
            invoiceZoomLevel = 1;
        }

        async function deleteInvoice(id) {
            const invoice = invoices.find(i => i.id === id || i.firestoreId === id);
            const invoiceNumber = invoice?.invoiceNumber || id;

            showConfirmModal({
                title: 'Delete Invoice',
                message: 'Are you sure you want to delete this invoice? This action cannot be undone.',
                confirmText: 'Delete',
                type: 'danger',
                onConfirm: async () => {
                    const numericId = !isNaN(id) ? parseInt(id, 10) : id;
                    // Delete from Firebase
                    if (typeof firebaseInvoiceManager !== 'undefined' && firebaseInvoiceManager.isInitialized) {
                        const success = await firebaseInvoiceManager.deleteInvoice(id);
                        if (success) {
                            // Log activity
                            if (typeof logActivity === 'function') {
                                await logActivity(ACTIVITY_TYPES.DELETE, {
                                    message: `Deleted invoice: ${invoiceNumber}`,
                                    invoiceNumber: invoiceNumber,
                                    vendor: invoice?.vendor || 'Unknown'
                                }, 'invoice', id);
                            }
                            // Update local state
                            invoices = invoices.filter(i => i.id !== id && i.id !== numericId && i.firestoreId !== id);
                            renderInvoices();
                        } else {
                            showNotification('Error deleting invoice', 'error');
                        }
                    } else {
                        // Fallback to local only
                        invoices = invoices.filter(i => i.id !== id && i.id !== numericId && i.firestoreId !== id);
                        renderInvoices();
                    }
                }
            });
        }

        // Toggle multiple locations checkboxes
        function toggleMultipleLocations(selectElement) {
            const checkboxesDiv = document.getElementById('invoice-stores-checkboxes') || document.getElementById('edit-invoice-stores-checkboxes');
            if (checkboxesDiv) {
                checkboxesDiv.style.display = selectElement.value === 'Multiple' ? 'block' : 'none';
            }
        }

        // Get selected stores (handles both single and multiple selection)
        function getSelectedStores(formPrefix = '') {
            const selectId = formPrefix ? `${formPrefix}-invoice-store` : 'invoice-store';
            const checkboxesId = formPrefix ? `${formPrefix}-invoice-stores-checkboxes` : 'invoice-stores-checkboxes';

            const select = document.getElementById(selectId);
            if (!select) return null;

            if (select.value === 'Multiple') {
                const checkboxes = document.querySelectorAll(`#${checkboxesId} .invoice-store-checkbox:checked`);
                const stores = Array.from(checkboxes).map(cb => cb.value);
                return stores.length > 0 ? stores.join(', ') : null;
            }

            return select.value || null;
        }

        async function saveInvoice() {
            const invoiceNumber = document.getElementById('invoice-number').value.trim();
            const vendor = document.getElementById('invoice-vendor').value.trim();
            const product = document.getElementById('invoice-product').value.trim();
            const categories = getSelectedInvoiceCategories('invoice-categories-container');
            const category = categories.length > 0 ? categories[0] : ''; // Primary category for backwards compatibility
            const store = getSelectedStores() || null;
            const amount = document.getElementById('invoice-amount').value;
            const description = document.getElementById('invoice-description').value.trim();
            const invoiceDate = document.getElementById('invoice-date').value;
            const dueDate = document.getElementById('invoice-due-date').value;
            const status = document.getElementById('invoice-status').value;
            const paymentAccount = document.getElementById('invoice-payment-account').value;
            const recurring = document.getElementById('invoice-recurring').checked;
            const notes = document.getElementById('invoice-notes').value.trim();

            // Validate required fields - only invoice number OR image required
            const fileInput = document.getElementById('invoice-photo');
            const hasFile = fileInput && fileInput.files && fileInput.files[0];
            if (!invoiceNumber && !hasFile) {
                alert('Please enter an Invoice # or upload an image');
                return;
            }

            // Show saving indicator
            const saveBtn = document.querySelector('.modal-footer .btn-primary');
            const originalText = saveBtn ? saveBtn.innerHTML : '';
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                saveBtn.disabled = true;
            }

            try {
                // Get file if uploaded - upload to Firebase Storage
                let fileUrl = null;
                let filePath = null;
                let fileType = null;
                let fileName = null;

                if (fileInput && fileInput.files && fileInput.files[0]) {
                    const file = fileInput.files[0];

                    // Validate file size (max 20MB for Storage)
                    if (file.size > 20 * 1024 * 1024) {
                        showNotification('El archivo es muy grande. Por favor usa un archivo menor a 20MB.', 'error');
                        if (saveBtn) {
                            saveBtn.innerHTML = originalText;
                            saveBtn.disabled = false;
                        }
                        return;
                    }

                    if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading file...';

                    try {
                        // Initialize storage if needed
                        if (!firebaseStorageHelper.isInitialized) {
                            firebaseStorageHelper.initialize();
                        }

                        // Determine file type
                        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                        fileType = isPdf ? 'pdf' : 'image';
                        fileName = file.name;

                        // Upload to Firebase Storage (disable overlay to prevent UI blocking)
                        const uploadResult = await firebaseStorageHelper.uploadDocument(
                            file,
                            'invoices/attachments',
                            invoiceNumber.replace(/[^a-zA-Z0-9]/g, '_') + '_',
                            false  // Don't show overlay - we have our own saving indicator
                        );

                        if (!uploadResult || !uploadResult.url) {
                            throw new Error('Upload failed - no URL returned');
                        }

                        fileUrl = uploadResult.url;
                        filePath = uploadResult.path;
                    } catch (uploadError) {
                        console.error('Error uploading file:', uploadError);
                        console.error('Upload error details:', {
                            message: uploadError.message,
                            code: uploadError.code,
                            name: uploadError.name,
                            stack: uploadError.stack
                        });
                        if (saveBtn) {
                            saveBtn.innerHTML = originalText || 'Save Invoice';
                            saveBtn.disabled = false;
                        }

                        // Show specific error message in Spanish
                        let errorMessage = 'Error al subir el archivo. ';
                        if (uploadError.code === 'storage/unauthorized') {
                            errorMessage += 'No tienes permiso para subir archivos. Contacta al administrador.';
                        } else if (uploadError.code === 'storage/canceled') {
                            errorMessage += 'La subida fue cancelada.';
                        } else if (uploadError.code === 'storage/unknown' || uploadError.message?.includes('Firebase Storage')) {
                            errorMessage += 'Firebase Storage no está configurado correctamente. Contacta al administrador.';
                        } else {
                            errorMessage += 'Por favor verifica tu conexión e intenta de nuevo.';
                        }

                        showNotification(errorMessage, 'error');
                        return;
                    }
                }

                if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving invoice...';

                await createInvoiceRecord(invoiceNumber, vendor, product, category, categories, store, amount, description, invoiceDate, dueDate, status, paymentAccount, recurring, notes, fileUrl, fileType, fileName, filePath);
            } catch (error) {
                console.error('Error saving invoice:', error);
                showNotification('Error al guardar el invoice. Por favor verifica todos los campos e intenta de nuevo.', 'error');
            } finally {
                if (saveBtn) {
                    saveBtn.innerHTML = originalText || 'Save Invoice';
                    saveBtn.disabled = false;
                }
            }
        }

        async function createInvoiceRecord(invoiceNumber, vendor, product, category, categories, store, amount, description, invoiceDate, dueDate, status, paymentAccount, recurring, notes, photo, fileType = null, fileName = null, filePath = null) {
            // Create invoice data object
            const invoiceData = {
                invoiceNumber: invoiceNumber || '',
                vendor: vendor || '',
                product: product || '',
                category: category || '', // Primary category for backwards compatibility
                categories: categories || [], // All selected categories
                store: store || null,
                description: description || '',
                amount: parseFloat(amount) || 0,
                invoiceDate: invoiceDate || '',
                dueDate: dueDate || '',
                paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : null,
                status: status || 'pending',
                paymentAccount: paymentAccount || '',
                recurring: recurring,
                notes: notes || '',
                photo: photo,           // Now stores URL instead of base64
                filePath: filePath,     // Storage path for deletion
                fileType: fileType,     // 'pdf' or 'image' or null
                fileName: fileName      // Original filename for PDFs
            };

            // Save to Firebase
            if (typeof firebaseInvoiceManager !== 'undefined' && firebaseInvoiceManager.isInitialized) {
                const docId = await firebaseInvoiceManager.addInvoice(invoiceData);
                if (docId) {
                    // Log activity
                    if (typeof logActivity === 'function') {
                        await logActivity(ACTIVITY_TYPES.CREATE, {
                            message: `Created invoice: ${invoiceNumber || 'No number'}`,
                            invoiceNumber: invoiceNumber,
                            vendor: vendor,
                            amount: amount,
                            store: store
                        }, 'invoice', docId);
                    }
                    // Add to local array with Firebase ID
                    invoiceData.id = docId;
                    invoiceData.firestoreId = docId;
                    invoices.unshift(invoiceData);
                    closeModal();
                    renderInvoices();
                } else {
                    alert('Error saving invoice to Firebase');
                }
            } else {
                // Fallback to local only
                const newId = invoices.length > 0 ? Math.max(...invoices.map(i => typeof i.id === 'number' ? i.id : 0)) + 1 : 1;
                invoiceData.id = newId;
                invoices.unshift(invoiceData);
                closeModal();
                renderInvoices();
            }
        }

        function previewInvoiceFile(input) {
            const photoPreview = document.getElementById('invoice-photo-preview');
            const pdfPreview = document.getElementById('invoice-pdf-preview');
            const img = document.getElementById('invoice-photo-img');
            const pdfName = document.getElementById('invoice-pdf-name');
            const pdfSize = document.getElementById('invoice-pdf-size');

            // Hide both previews initially
            if (photoPreview) photoPreview.style.display = 'none';
            if (pdfPreview) pdfPreview.style.display = 'none';

            if (input.files && input.files[0]) {
                const file = input.files[0];

                // Check if it's a PDF
                if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                    // Show PDF preview
                    if (pdfPreview && pdfName && pdfSize) {
                        pdfName.textContent = file.name;
                        pdfSize.textContent = formatFileSize(file.size);
                        pdfPreview.style.display = 'block';
                    }
                } else {
                    // Show image preview
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        if (img && photoPreview) {
                            img.src = e.target.result;
                            photoPreview.style.display = 'block';
                        }
                    };
                    reader.readAsDataURL(file);
                }
            }
        }

        // Helper function to format file size
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Keep old function name for backwards compatibility
        function previewInvoicePhoto(input) {
            previewInvoiceFile(input);
        }

