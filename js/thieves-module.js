        // ==========================================
        // INCIDENT LOG MODULE
        // ==========================================

        let incidentLogs = [];
        let incidentLogCurrentMonth = new Date().toISOString().slice(0, 7);

        async function loadIncidentLogs() {
            try {
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    const db = firebase.firestore();
                    const snapshot = await db.collection('incidentLogs').orderBy('date', 'desc').get();
                    incidentLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                }
            } catch (error) {
                console.error('Error loading incident logs:', error);
            }
        }

        function renderIncidentLog() {
            const dashboard = document.querySelector('.dashboard');

            // Filter by month
            const monthlyLogs = incidentLogs.filter(log => log.date && log.date.startsWith(incidentLogCurrentMonth));
            const monthName = new Date(incidentLogCurrentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Incident Log</h2>
                        <p class="section-subtitle">Log and track store incidents</p>
                    </div>
                    <button class="btn-primary floating-add-btn" onclick="openModal('add-incident-log')">
                        <i class="fas fa-plus"></i>
                        New Incident
                    </button>
                </div>

                <!-- Month Navigation -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <button onclick="changeIncidentLogMonth(-1)" style="background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); width: 40px; height: 40px; border-radius: 8px; cursor: pointer; font-size: 16px;">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <span style="font-size: 18px; font-weight: 600; min-width: 150px; text-align: center;">${monthName}</span>
                        <button onclick="changeIncidentLogMonth(1)" style="background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); width: 40px; height: 40px; border-radius: 8px; cursor: pointer; font-size: 16px;">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    <span style="color: var(--text-muted);">${monthlyLogs.length} incident${monthlyLogs.length !== 1 ? 's' : ''}</span>
                </div>

                <!-- Incident List Table -->
                <div class="card" style="padding: 0; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: var(--bg-secondary);">
                                <th style="padding: 14px 16px; text-align: left; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color);">Date</th>
                                <th style="padding: 14px 16px; text-align: left; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color);">Time</th>
                                <th style="padding: 14px 16px; text-align: left; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color);">Store</th>
                                <th style="padding: 14px 16px; text-align: left; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color);">Incident</th>
                                <th style="padding: 14px 16px; text-align: left; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color);">Informed Manager</th>
                                <th style="padding: 14px 16px; text-align: left; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color);">Cameras Reviewed</th>
                                <th style="padding: 14px 16px; text-align: left; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color);">Conclusion</th>
                                <th style="padding: 14px 16px; text-align: center; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color);">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${monthlyLogs.length > 0 ? monthlyLogs.map(log => `
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 14px 16px; color: var(--text-primary);">${formatDate(log.date)}</td>
                                    <td style="padding: 14px 16px; color: var(--text-secondary);">${log.time || 'N/A'}</td>
                                    <td style="padding: 14px 16px;"><span style="padding: 4px 10px; border-radius: 6px; font-size: 12px; background: var(--bg-secondary); color: var(--text-secondary);">${log.store || 'N/A'}</span></td>
                                    <td style="padding: 14px 16px; color: var(--text-primary); max-width: 250px;">${log.incident || 'N/A'}</td>
                                    <td style="padding: 14px 16px; color: var(--text-secondary);">${log.informedManager || 'N/A'}</td>
                                    <td style="padding: 14px 16px;"><span style="color: ${log.camerasReviewed === 'Yes' ? '#10b981' : '#f59e0b'};">${log.camerasReviewed || 'N/A'}</span></td>
                                    <td style="padding: 14px 16px; color: var(--text-secondary);">${log.conclusion || 'Pending'}</td>
                                    <td style="padding: 14px 16px; text-align: center;">
                                        <button onclick="deleteIncidentLog('${log.id}')" class="btn-icon" style="color: var(--danger);" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="8" style="padding: 40px; text-align: center; color: var(--text-muted);">
                                        <i class="fas fa-clipboard-list" style="font-size: 32px; opacity: 0.3; margin-bottom: 12px;"></i>
                                        <p style="margin: 0;">No incidents logged this month</p>
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            `;
        }

        function changeIncidentLogMonth(delta) {
            const date = new Date(incidentLogCurrentMonth + '-01');
            date.setMonth(date.getMonth() + delta);
            incidentLogCurrentMonth = date.toISOString().slice(0, 7);
            renderIncidentLog();
        }

        async function saveIncidentLog() {
            const date = document.getElementById('incident-log-date').value;
            const time = document.getElementById('incident-log-time').value;
            const store = document.getElementById('incident-log-store').value;
            const incident = document.getElementById('incident-log-incident').value.trim();
            const informedManager = document.getElementById('incident-log-manager').value.trim();
            const camerasReviewed = document.getElementById('incident-log-cameras').value;
            const conclusion = document.getElementById('incident-log-conclusion').value.trim();

            if (!date || !store || !incident) {
                alert('Please fill in Date, Store, and Incident fields');
                return;
            }

            const logData = {
                date,
                time,
                store,
                incident,
                informedManager,
                camerasReviewed,
                conclusion,
                createdAt: new Date().toISOString(),
                createdBy: authManager.getCurrentUser()?.name || 'Unknown'
            };

            try {
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    const db = firebase.firestore();
                    const docRef = await db.collection('incidentLogs').add(logData);
                    logData.id = docRef.id;
                }
                incidentLogs.unshift(logData);
                closeModal();
                showNotification('Incident logged!', 'success');
                renderIncidentLog();
            } catch (error) {
                console.error('Error saving incident log:', error);
                alert('Error saving incident. Please try again.');
            }
        }

        async function deleteIncidentLog(logId) {
            if (!confirm('Are you sure you want to delete this incident?')) return;

            try {
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    const db = firebase.firestore();
                    await db.collection('incidentLogs').doc(logId).delete();
                }
                incidentLogs = incidentLogs.filter(l => l.id !== logId);
                showNotification('Incident deleted', 'success');
                renderIncidentLog();
            } catch (error) {
                console.error('Error deleting incident:', error);
                alert('Error deleting incident');
            }
        }

        // Make functions globally available
        window.renderIncidentLog = renderIncidentLog;
        window.changeIncidentLogMonth = changeIncidentLogMonth;
        window.saveIncidentLog = saveIncidentLog;
        window.deleteIncidentLog = deleteIncidentLog;
        window.loadIncidentLogs = loadIncidentLogs;

        function renderRiskNotes() {
            const dashboard = document.querySelector('.dashboard');
            const currentMonth = new Date().toISOString().slice(0, 7);

            // Filter notes
            let filteredNotes = riskNotesState.notes.filter(note => {
                const storeMatch = riskNotesState.filterStore === 'all' || note.store === riskNotesState.filterStore;
                const levelMatch = riskNotesState.filterLevel === 'all' || note.level === riskNotesState.filterLevel;
                const typeMatch = riskNotesState.filterType === 'all' || note.behaviorType === riskNotesState.filterType;
                return storeMatch && levelMatch && typeMatch;
            });

            // Sort by date descending
            filteredNotes.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Monthly stats
            const monthlyNotes = riskNotesState.notes.filter(n => n.date && n.date.startsWith(currentMonth));
            const storeCounts = {};
            const typeCounts = {};

            monthlyNotes.forEach(note => {
                storeCounts[note.store] = (storeCounts[note.store] || 0) + 1;
                typeCounts[note.behaviorType] = (typeCounts[note.behaviorType] || 0) + 1;
            });

            const topStore = Object.entries(storeCounts).sort((a, b) => b[1] - a[1])[0];
            const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">
                            <i class="fas fa-shield-halved" style="color: var(--accent-primary);"></i>
                            Risk Notes
                        </h2>
                        <p class="section-subtitle">Document unusual activity and stay alert</p>
                    </div>
                    <div class="page-header-right">
                        <button class="btn-primary floating-add-btn" onclick="openModal('add-risknote')">
                            <i class="fas fa-plus"></i> New Risk Note
                        </button>
                    </div>
                </div>

                <!-- Safety Guidelines -->
                <div class="card" style="margin-bottom: 24px; border-left: 4px solid var(--warning); background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, var(--bg-secondary) 100%);">
                    <div class="card-body" style="padding: 20px;">
                        <div style="display: flex; align-items: start; gap: 16px;">
                            <div style="font-size: 32px;">⚠️</div>
                            <div>
                                <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">General Safety Recommendations</h4>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; font-size: 13px; color: var(--text-secondary);">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <i class="fas fa-check" style="color: var(--success);"></i>
                                        <span>Never sell to customers without a valid account</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <i class="fas fa-check" style="color: var(--success);"></i>
                                        <span>Always verify ID for age-restricted products</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <i class="fas fa-check" style="color: var(--success);"></i>
                                        <span>Trust your instincts - if something feels off, report it</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <i class="fas fa-check" style="color: var(--success);"></i>
                                        <span>Document everything - dates, times, descriptions</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <i class="fas fa-check" style="color: var(--success);"></i>
                                        <span>Alert manager immediately for high-risk situations</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <i class="fas fa-check" style="color: var(--success);"></i>
                                        <span>Never confront suspicious individuals directly</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Monthly Summary -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div class="card" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white;">
                        <div class="card-body" style="padding: 20px; text-align: center;">
                            <div style="font-size: 36px; font-weight: 700;">${monthlyNotes.length}</div>
                            <div style="font-size: 13px; opacity: 0.9;">Notes This Month</div>
                        </div>
                    </div>
                    <div class="card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white;">
                        <div class="card-body" style="padding: 20px; text-align: center;">
                            <div style="font-size: 36px; font-weight: 700;">${topStore ? topStore[1] : 0}</div>
                            <div style="font-size: 13px; opacity: 0.9;">${topStore ? topStore[0] : 'No data'}</div>
                            <div style="font-size: 11px; opacity: 0.7;">Most Cases</div>
                        </div>
                    </div>
                    <div class="card" style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white;">
                        <div class="card-body" style="padding: 20px; text-align: center;">
                            <div style="font-size: 36px; font-weight: 700;">${topType ? topType[1] : 0}</div>
                            <div style="font-size: 13px; opacity: 0.9;">${topType ? RISK_BEHAVIOR_TYPES.find(t => t.id === topType[0])?.label || 'Unknown' : 'No data'}</div>
                            <div style="font-size: 11px; opacity: 0.7;">Most Common Type</div>
                        </div>
                    </div>
                    <div class="card" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white;">
                        <div class="card-body" style="padding: 20px; text-align: center;">
                            <div style="font-size: 36px; font-weight: 700;">${monthlyNotes.filter(n => n.level === 'high').length}</div>
                            <div style="font-size: 13px; opacity: 0.9;">High Risk</div>
                            <div style="font-size: 11px; opacity: 0.7;">Needs Attention</div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-body" style="padding: 16px;">
                        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 500;">Store:</label>
                                <select class="form-input" style="width: 160px;" onchange="filterRiskNotes('store', this.value)">
                                    <option value="all" ${riskNotesState.filterStore === 'all' ? 'selected' : ''}>All Stores</option>
                                    ${RISK_STORES.map(store => `
                                        <option value="${store}" ${riskNotesState.filterStore === store ? 'selected' : ''}>${store}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 500;">Level:</label>
                                <select class="form-input" style="width: 140px;" onchange="filterRiskNotes('level', this.value)">
                                    <option value="all" ${riskNotesState.filterLevel === 'all' ? 'selected' : ''}>All Levels</option>
                                    ${RISK_LEVELS.map(level => `
                                        <option value="${level.id}" ${riskNotesState.filterLevel === level.id ? 'selected' : ''}>${level.label}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 500;">Type:</label>
                                <select class="form-input" style="width: 180px;" onchange="filterRiskNotes('type', this.value)">
                                    <option value="all" ${riskNotesState.filterType === 'all' ? 'selected' : ''}>All Types</option>
                                    ${RISK_BEHAVIOR_TYPES.map(type => `
                                        <option value="${type.id}" ${riskNotesState.filterType === type.id ? 'selected' : ''}>${type.label}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div style="display: flex; gap: 8px; margin-left: auto; align-items: center;">
                                <button class="btn-secondary" onclick="resetRiskNotesFilters()">
                                    <i class="fas fa-refresh"></i> Reset
                                </button>
                                <!-- View Toggle -->
                                <div style="display: flex; background: var(--bg-primary); border-radius: 8px; padding: 3px; border: 1px solid var(--border-color);">
                                    <button onclick="setRiskNotesViewMode('list')" id="risk-view-list-btn" style="width: 34px; height: 34px; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; ${riskNotesState.viewMode === 'list' ? 'background: var(--accent-primary); color: white;' : 'background: transparent; color: var(--text-muted);'}" title="List View">
                                        <i class="fas fa-list"></i>
                                    </button>
                                    <button onclick="setRiskNotesViewMode('grid')" id="risk-view-grid-btn" style="width: 34px; height: 34px; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; ${riskNotesState.viewMode === 'grid' ? 'background: var(--accent-primary); color: white;' : 'background: transparent; color: var(--text-muted);'}" title="Grid View">
                                        <i class="fas fa-th-large"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Risk Notes List/Grid -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-${riskNotesState.viewMode === 'grid' ? 'th-large' : 'list'}"></i>
                            Recent Activity Notes
                        </h3>
                        <span class="badge" style="background: var(--accent-primary);">${filteredNotes.length} Notes</span>
                    </div>
                    <div class="card-body" id="risk-notes-container">
                        ${filteredNotes.length === 0 ? `
                            <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                                <i class="fas fa-shield-halved" style="font-size: 56px; margin-bottom: 20px; display: block; opacity: 0.3;"></i>
                                <div style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">No risk notes yet</div>
                                <div style="font-size: 14px;">Click "New Risk Note" to document unusual activity</div>
                            </div>
                        ` : riskNotesState.viewMode === 'grid' ? `
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
                                ${filteredNotes.map(note => {
                                    const behaviorType = RISK_BEHAVIOR_TYPES.find(t => t.id === note.behaviorType) || RISK_BEHAVIOR_TYPES[5];
                                    const level = RISK_LEVELS.find(l => l.id === note.level) || RISK_LEVELS[0];
                                    const noteDate = new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                    return `
                                        <div class="risk-grid-card" style="background: var(--bg-secondary); border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); transition: all 0.2s; cursor: pointer; display: flex; flex-direction: column;" onclick="viewRiskNote('${note.id}')" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                                            <!-- Header with level color -->
                                            <div style="height: 6px; background: ${level.color};"></div>

                                            <!-- Card Content -->
                                            <div style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
                                                <!-- Icon and Type -->
                                                <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
                                                    <div style="width: 52px; height: 52px; background: ${behaviorType.color}15; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                                        <i class="fas ${behaviorType.icon}" style="color: ${behaviorType.color}; font-size: 22px;"></i>
                                                    </div>
                                                    <div style="flex: 1; min-width: 0;">
                                                        <div style="font-weight: 600; font-size: 15px; color: var(--text-primary); margin-bottom: 4px;">${behaviorType.label}</div>
                                                        <span style="background: ${level.color}20; color: ${level.color}; padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 600; text-transform: uppercase;">
                                                            <i class="fas ${level.icon}" style="font-size: 8px;"></i> ${level.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                <!-- Description -->
                                                <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; flex: 1; margin-bottom: 16px;">
                                                    ${note.description || 'No description provided'}
                                                </div>

                                                <!-- Meta Info -->
                                                <div style="display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: var(--text-muted); padding-top: 12px; border-top: 1px solid var(--border-color);">
                                                    <span><i class="fas fa-store" style="margin-right: 4px;"></i>${note.store}</span>
                                                    <span><i class="fas fa-calendar" style="margin-right: 4px;"></i>${noteDate}</span>
                                                    <span><i class="fas fa-user" style="margin-right: 4px;"></i>${note.reportedBy || 'Anonymous'}</span>
                                                </div>

                                                <!-- Indicators -->
                                                ${note.hasPhoto || note.managerNote ? `
                                                    <div style="display: flex; gap: 8px; margin-top: 12px;">
                                                        ${note.hasPhoto ? '<span style="background: var(--bg-primary); padding: 4px 8px; border-radius: 6px; font-size: 11px; color: var(--text-muted);"><i class="fas fa-image"></i> Photo</span>' : ''}
                                                        ${note.managerNote ? '<span style="background: rgba(245, 158, 11, 0.15); padding: 4px 8px; border-radius: 6px; font-size: 11px; color: var(--warning);"><i class="fas fa-comment"></i> Note</span>' : ''}
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : `
                            <div style="display: grid; gap: 16px;">
                                ${filteredNotes.map(note => {
                                    const behaviorType = RISK_BEHAVIOR_TYPES.find(t => t.id === note.behaviorType) || RISK_BEHAVIOR_TYPES[5];
                                    const level = RISK_LEVELS.find(l => l.id === note.level) || RISK_LEVELS[0];
                                    const noteDate = new Date(note.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                                    return `
                                        <div class="risk-list-item" style="background: var(--bg-secondary); border-radius: 16px; padding: 20px; border-left: 4px solid ${level.color}; transition: all 0.2s; cursor: pointer;" onclick="viewRiskNote('${note.id}')" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='translateX(0)'">
                                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                                <div style="display: flex; align-items: center; gap: 12px;">
                                                    <div style="width: 48px; height: 48px; background: ${behaviorType.color}20; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                                        <i class="fas ${behaviorType.icon}" style="color: ${behaviorType.color}; font-size: 20px;"></i>
                                                    </div>
                                                    <div>
                                                        <div style="font-weight: 600; font-size: 15px; margin-bottom: 4px;">${behaviorType.label}</div>
                                                        <div style="font-size: 12px; color: var(--text-muted);">
                                                            <i class="fas fa-store"></i> ${note.store} •
                                                            <i class="fas fa-calendar"></i> ${noteDate}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span style="background: ${level.color}20; color: ${level.color}; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                                    <i class="fas ${level.icon}" style="font-size: 8px;"></i> ${level.label} Risk
                                                </span>
                                            </div>
                                            <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                                                ${note.description || 'No description'}
                                            </div>
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                                                <div style="font-size: 12px; color: var(--text-muted);">
                                                    <i class="fas fa-user"></i> ${note.reportedBy || 'Anonymous'}
                                                </div>
                                                <div style="display: flex; align-items: center; gap: 8px;">
                                                    ${note.hasPhoto ? '<i class="fas fa-image" style="color: var(--text-muted); font-size: 12px;" title="Has photo"></i>' : ''}
                                                    ${note.managerNote ? '<i class="fas fa-comment" style="color: var(--warning); font-size: 12px;" title="Has manager note"></i>' : ''}
                                                    <span style="font-size: 11px; color: var(--text-muted);">Click to view</span>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `}
                    </div>
                </div>
            `;
        }

        function filterRiskNotes(filterType, value) {
            if (filterType === 'store') riskNotesState.filterStore = value;
            if (filterType === 'level') riskNotesState.filterLevel = value;
            if (filterType === 'type') riskNotesState.filterType = value;
            renderRiskNotes();
        }

        // Set Risk Notes view mode (list or grid)
        function setRiskNotesViewMode(mode) {
            riskNotesState.viewMode = mode;

            // Update button styles
            const listBtn = document.getElementById('risk-view-list-btn');
            const gridBtn = document.getElementById('risk-view-grid-btn');

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

            // Re-render the page
            renderRiskNotes();
        }

        function resetRiskNotesFilters() {
            riskNotesState.filterStore = 'all';
            riskNotesState.filterLevel = 'all';
            riskNotesState.filterType = 'all';
            renderRiskNotes();
        }

        function deleteRiskNote(noteId) {
            showConfirmModal({
                title: 'Delete Risk Note',
                message: 'Are you sure you want to delete this risk note? This action cannot be undone.',
                confirmText: 'Delete',
                type: 'danger',
                onConfirm: async () => {
                    const note = riskNotesState.notes.find(n => n.id === noteId);

                    // Delete photo from Firebase Storage first if it exists
                    if (note && note.photoPath && typeof firebaseStorageHelper !== 'undefined') {
                        try {
                            await firebaseStorageHelper.deleteFile(note.photoPath);
                        } catch (storageErr) {
                            console.error('Error deleting photo from Storage:', storageErr);
                        }
                    }

                    // Delete from Firebase Firestore if it has a firestoreId
                    if (note && note.firestoreId && typeof firebaseSyncManager !== 'undefined' && firebaseSyncManager.isInitialized) {
                        try {
                            await firebaseSyncManager.deleteRiskNoteFromFirestore(note.firestoreId);
                        } catch (error) {
                            console.error('Error deleting risk note from Firebase:', error);
                        }
                    }

                    riskNotesState.notes = riskNotesState.notes.filter(n => n.id !== noteId);

                    // Delete photo from IndexedDB if it exists (legacy fallback)
                    if (note && note.hasPhoto && !note.photoPath) {
                        deletePhotoFromIndexedDB(noteId).catch(err => {
                            console.error('Error deleting photo from IndexedDB:', err);
                        });
                    }

                    saveRiskNotes();
                    renderRiskNotes();

                    // Show success notification
                    if (typeof showNotification === 'function') {
                        showNotification('Risk note deleted successfully', 'success');
                    }
                }
            });
        }

        function saveRiskNote() {
            const date = document.getElementById('risknote-date').value || new Date().toISOString().split('T')[0];
            const store = document.getElementById('risknote-store').value;
            const behaviorType = document.getElementById('risknote-type').value;
            const description = document.getElementById('risknote-description').value.trim();
            const level = document.getElementById('risknote-level').value;
            const reportedBy = document.getElementById('risknote-reporter').value.trim();
            const managerNote = document.getElementById('risknote-manager-note')?.value.trim() || '';
            const photoInput = document.getElementById('risknote-photo');

            if (photoInput && photoInput.files && photoInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    createRiskNote(date, store, behaviorType, description, level, reportedBy, managerNote, e.target.result);
                };
                reader.readAsDataURL(photoInput.files[0]);
            } else {
                createRiskNote(date, store, behaviorType, description, level, reportedBy, managerNote, null);
            }
        }

        async function createRiskNote(date, store, behaviorType, description, level, reportedBy, managerNote, photo) {
            const noteId = Date.now().toString();

            // Upload photo to Firebase Storage if provided
            let photoUrl = null;
            let photoPath = null;
            if (photo) {
                // Initialize storage helper if needed
                if (!firebaseStorageHelper.isInitialized) {
                    firebaseStorageHelper.initialize();
                }

                try {
                    const uploadResult = await firebaseStorageHelper.uploadImage(
                        photo,
                        'risk-notes/photos',
                        noteId
                    );
                    photoUrl = uploadResult.url;
                    photoPath = uploadResult.path;
                } catch (err) {
                    console.error('Error uploading risk note photo to Storage:', err);
                    // Fallback to IndexedDB if Storage fails
                    try {
                        await savePhotoToIndexedDB(noteId, photo);
                    } catch (indexedErr) {
                        console.error('Error saving photo to IndexedDB:', indexedErr);
                    }
                }
            }

            const newNote = {
                id: noteId,
                date,
                store: store || 'Miramar',
                behaviorType: behaviorType || 'other',
                description: description || '',
                level: level || 'low',
                reportedBy: reportedBy || 'Staff',
                managerNote,
                hasPhoto: !!photo,
                photo: photoUrl,        // Firebase Storage URL
                photoPath: photoPath,   // For future deletion
                createdAt: new Date().toISOString()
            };

            // Save to Firebase first
            if (typeof firebaseSyncManager !== 'undefined') {
                // Initialize if needed
                if (!firebaseSyncManager.isInitialized) {
                    try {
                        await firebaseSyncManager.initialize();
                    } catch (initErr) {
                        console.error('Error initializing firebaseSyncManager:', initErr);
                    }
                }

                if (firebaseSyncManager.isInitialized) {
                    try {
                        const firestoreId = await firebaseSyncManager.saveRiskNoteToFirestore(newNote);
                        if (firestoreId) {
                            newNote.firestoreId = firestoreId;
                        }
                    } catch (error) {
                        console.error('Error saving risk note to Firebase:', error);
                    }
                }
            }

            riskNotesState.notes.unshift(newNote);

            saveRiskNotes();
            closeModal();
            renderRiskNotes();

            // Show success notification
            if (typeof showNotification === 'function') {
                showNotification('Risk note created successfully!', 'success');
            }
        }

        function previewRiskNotePhoto(input) {
            const preview = document.getElementById('risknote-photo-preview');
            const img = document.getElementById('risknote-photo-img');

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

        function selectRiskLevel(level) {
            document.getElementById('risknote-level').value = level;
            const buttons = document.querySelectorAll('.risk-level-btn');
            buttons.forEach(btn => {
                const btnLevel = RISK_LEVELS.find(l => l.id === btn.dataset.level);
                if (btn.dataset.level === level) {
                    btn.style.borderColor = btnLevel.color;
                    btn.style.background = btnLevel.color + '20';
                } else {
                    btn.style.borderColor = 'var(--border-color)';
                    btn.style.background = 'var(--bg-secondary)';
                }
            });
        }

        // ========== Risk Note Voice Assistant ==========
        let riskNoteVoiceRecognition = null;
        let riskNoteIsRecording = false;
        let riskNoteTranscript = '';
        let riskNoteStoppedByUser = false;

        function toggleRiskNoteVoiceRecording() {
            if (riskNoteIsRecording) {
                stopRiskNoteVoiceRecording();
            } else {
                startRiskNoteVoiceRecording();
            }
        }

        function startRiskNoteVoiceRecording() {
            // Check for browser support
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                const statusDiv = document.getElementById('risknote-voice-status');
                if (statusDiv) {
                    statusDiv.style.display = 'block';
                    statusDiv.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">Voice recognition not supported. Try Chrome or Edge.</span>';
                }
                return;
            }

            try {
                riskNoteVoiceRecognition = new SpeechRecognition();
                riskNoteVoiceRecognition.continuous = true;
                riskNoteVoiceRecognition.interimResults = true;
                riskNoteVoiceRecognition.lang = 'en-US';
                riskNoteVoiceRecognition.maxAlternatives = 1;

                const btn = document.getElementById('risknote-voice-btn');
                const icon = document.getElementById('risknote-voice-icon');
                const text = document.getElementById('risknote-voice-text');
                const statusDiv = document.getElementById('risknote-voice-status');
                const transcriptPreview = document.getElementById('risknote-transcript-preview');
                const transcriptText = document.getElementById('risknote-transcript-text');

                riskNoteTranscript = '';
                riskNoteStoppedByUser = false;

                riskNoteVoiceRecognition.onstart = () => {
                    riskNoteIsRecording = true;
                    if (btn) btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                    if (icon) icon.className = 'fas fa-stop';
                    if (text) text.textContent = 'Stop Recording';
                    if (statusDiv) {
                        statusDiv.style.display = 'block';
                        statusDiv.innerHTML = '<i class="fas fa-circle" style="color: #ef4444; animation: pulse 1s infinite;"></i> <span style="color: var(--text-primary);">Listening... Speak now</span>';
                    }
                    if (transcriptPreview) transcriptPreview.style.display = 'none';
                };

                riskNoteVoiceRecognition.onresult = (event) => {
                    let interimTranscript = '';
                    let finalTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + ' ';
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    if (finalTranscript) {
                        riskNoteTranscript += finalTranscript;
                    }

                    // Show real-time transcript
                    if (transcriptPreview && transcriptText) {
                        transcriptPreview.style.display = 'block';
                        transcriptText.innerHTML = riskNoteTranscript + '<span style="color: var(--text-muted); font-style: italic;">' + interimTranscript + '</span>';
                    }
                };

                riskNoteVoiceRecognition.onerror = (event) => {
                    console.error('Voice recognition error:', event.error);
                    // Don't show error for 'aborted' or 'no-speech' - these are normal
                    if (event.error !== 'aborted' && event.error !== 'no-speech') {
                        if (statusDiv) {
                            statusDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">Error: ${event.error}. Try again.</span>`;
                        }
                    }
                };

                riskNoteVoiceRecognition.onend = () => {
                    // If user stopped it, processing is already handled in stopRiskNoteVoiceRecording
                    if (riskNoteStoppedByUser) {
                        return;
                    }

                    // Auto-restart if it ended unexpectedly (browser timeout) and still recording
                    if (riskNoteIsRecording) {
                        try {
                            riskNoteVoiceRecognition.start();
                            return;
                        } catch (e) {
                            console.log('Could not restart recognition:', e);
                        }
                    }
                    resetRiskNoteVoiceUI();
                };

                riskNoteVoiceRecognition.start();
            } catch (error) {
                console.error('Error starting voice recognition:', error);
                const statusDiv = document.getElementById('risknote-voice-status');
                if (statusDiv) {
                    statusDiv.style.display = 'block';
                    statusDiv.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">Could not start voice recording. Check microphone permissions.</span>';
                }
            }
        }

        function stopRiskNoteVoiceRecording() {
            riskNoteStoppedByUser = true;
            riskNoteIsRecording = false;

            // Stop the recognition
            if (riskNoteVoiceRecognition) {
                try {
                    riskNoteVoiceRecognition.stop();
                } catch (e) {
                    console.log('Error stopping recognition:', e);
                }
            }

            // Reset the UI immediately
            const btn = document.getElementById('risknote-voice-btn');
            const icon = document.getElementById('risknote-voice-icon');
            const text = document.getElementById('risknote-voice-text');
            const statusDiv = document.getElementById('risknote-voice-status');

            if (btn) btn.style.background = 'linear-gradient(135deg, #8b5cf6, #ec4899)';
            if (icon) icon.className = 'fas fa-microphone';
            if (text) text.textContent = 'Start Recording';

            // If we have transcript, process it with AI
            if (riskNoteTranscript.trim()) {
                if (statusDiv) {
                    statusDiv.style.display = 'block';
                    statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: #8b5cf6;"></i> <span style="color: var(--text-primary);">Processing your voice note with AI...</span>';
                }
                processRiskNoteWithAI(riskNoteTranscript.trim());
            } else {
                if (statusDiv) {
                    statusDiv.innerHTML = '<i class="fas fa-info-circle" style="color: #f59e0b;"></i> <span style="color: var(--text-primary);">No speech detected. Please try again.</span>';
                }
            }
        }

        function resetRiskNoteVoiceUI() {
            riskNoteIsRecording = false;
            const btn = document.getElementById('risknote-voice-btn');
            const icon = document.getElementById('risknote-voice-icon');
            const text = document.getElementById('risknote-voice-text');

            if (btn) {
                btn.style.background = 'linear-gradient(135deg, #8b5cf6, #ec4899)';
            }
            if (icon) {
                icon.className = 'fas fa-microphone';
            }
            if (text) {
                text.textContent = 'Start Recording';
            }
        }

        async function processRiskNoteWithAI(transcript) {
            const statusDiv = document.getElementById('risknote-voice-status');
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: #8b5cf6;"></i> <span style="color: var(--text-primary);">AI is processing your report...</span>';

            try {
                // Get API key from Firebase/localStorage (no hardcoded key)
                const apiKey = (typeof window.getOpenAIKey === 'function') ? window.getOpenAIKey() : '';

                if (!apiKey) {
                    // If no API key, just put the transcript in description
                    document.getElementById('risknote-description').value = transcript;
                    statusDiv.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> <span style="color: var(--text-primary);">Transcript added to description. Configure API key for AI auto-fill.</span>';
                    return;
                }

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
                                role: 'system',
                                content: `You are a security assistant helping to document risk notes for a retail store. Extract structured information from voice transcripts about suspicious activity or policy violations.`
                            },
                            {
                                role: 'user',
                                content: `Analyze this voice transcript about a risk/security incident and extract the information. Return ONLY a JSON object with these fields (use null for any field you cannot determine):

Transcript: "${transcript}"

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

Return ONLY the JSON object, no additional text.`
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
                let riskData;
                try {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        riskData = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('No JSON found in response');
                    }
                } catch (parseError) {
                    console.error('Error parsing AI response:', content);
                    // Fallback: just use transcript as description
                    document.getElementById('risknote-description').value = transcript;
                    statusDiv.innerHTML = '<i class="fas fa-check-circle" style="color: #f59e0b;"></i> <span style="color: var(--text-primary);">Transcript added. AI parsing failed.</span>';
                    return;
                }

                // Fill in the form fields
                if (riskData.store) {
                    const storeSelect = document.getElementById('risknote-store');
                    for (let option of storeSelect.options) {
                        if (option.value.toLowerCase().includes(riskData.store.toLowerCase()) ||
                            riskData.store.toLowerCase().includes(option.value.toLowerCase())) {
                            storeSelect.value = option.value;
                            break;
                        }
                    }
                }

                if (riskData.behaviorType) {
                    const typeSelect = document.getElementById('risknote-type');
                    const typeValue = riskData.behaviorType.toLowerCase().replace(/\s+/g, '_');
                    for (let option of typeSelect.options) {
                        if (option.value === typeValue) {
                            typeSelect.value = option.value;
                            break;
                        }
                    }
                }

                if (riskData.description) {
                    document.getElementById('risknote-description').value = riskData.description;
                } else {
                    document.getElementById('risknote-description').value = transcript;
                }

                if (riskData.riskLevel) {
                    selectRiskLevel(riskData.riskLevel.toLowerCase());
                }

                if (riskData.reportedBy) {
                    document.getElementById('risknote-reporter').value = riskData.reportedBy;
                }

                statusDiv.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> <span style="color: var(--text-primary);">Form auto-filled! Review and save.</span>';

            } catch (error) {
                console.error('Error processing with AI:', error);
                // Fallback: just use transcript as description
                document.getElementById('risknote-description').value = transcript;
                statusDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #f59e0b;"></i> <span style="color: var(--text-primary);">AI error. Transcript added to description.</span>`;
            }
        }
        // ========== End Risk Note Voice Assistant ==========

        // ========== Gift Voice Assistant ==========
        let giftVoiceRecognition = null;
        let giftIsRecording = false;
        let giftTranscript = '';
        let giftStoppedByUser = false;

        function toggleGiftVoiceRecording() {
            if (giftIsRecording) {
                stopGiftVoiceRecording();
            } else {
                startGiftVoiceRecording();
            }
        }

        function startGiftVoiceRecording() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                const statusDiv = document.getElementById('gift-voice-status');
                if (statusDiv) {
                    statusDiv.style.display = 'block';
                    statusDiv.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">Voice recognition not supported. Try Chrome or Edge.</span>';
                }
                return;
            }

            try {
                giftVoiceRecognition = new SpeechRecognition();
                giftVoiceRecognition.continuous = true;
                giftVoiceRecognition.interimResults = true;
                giftVoiceRecognition.lang = 'en-US';
                giftVoiceRecognition.maxAlternatives = 1;

                const btn = document.getElementById('gift-voice-btn');
                const icon = document.getElementById('gift-voice-icon');
                const text = document.getElementById('gift-voice-text');
                const statusDiv = document.getElementById('gift-voice-status');
                const transcriptPreview = document.getElementById('gift-transcript-preview');
                const transcriptText = document.getElementById('gift-transcript-text');

                giftTranscript = '';
                giftStoppedByUser = false;

                giftVoiceRecognition.onstart = () => {
                    giftIsRecording = true;
                    if (btn) btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                    if (icon) icon.className = 'fas fa-stop';
                    if (text) text.textContent = 'Stop Recording';
                    if (statusDiv) {
                        statusDiv.style.display = 'block';
                        statusDiv.innerHTML = '<i class="fas fa-circle" style="color: #ef4444; animation: pulse 1s infinite;"></i> <span style="color: var(--text-primary);">Listening... Describe the gift</span>';
                    }
                    if (transcriptPreview) transcriptPreview.style.display = 'none';
                };

                giftVoiceRecognition.onresult = (event) => {
                    let interimTranscript = '';
                    let finalTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + ' ';
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    if (finalTranscript) {
                        giftTranscript += finalTranscript;
                    }

                    if (transcriptPreview && transcriptText) {
                        transcriptPreview.style.display = 'block';
                        transcriptText.innerHTML = giftTranscript + '<span style="color: var(--text-muted); font-style: italic;">' + interimTranscript + '</span>';
                    }
                };

                giftVoiceRecognition.onerror = (event) => {
                    console.error('Gift voice recognition error:', event.error);
                    if (event.error !== 'aborted' && event.error !== 'no-speech') {
                        if (statusDiv) {
                            statusDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">Error: ${event.error}. Try again.</span>`;
                        }
                    }
                };

                giftVoiceRecognition.onend = () => {
                    if (giftStoppedByUser && giftTranscript.trim()) {
                        processGiftWithAI(giftTranscript.trim());
                    } else if (!giftStoppedByUser && giftIsRecording) {
                        try {
                            giftVoiceRecognition.start();
                            return;
                        } catch (e) {
                            console.log('Could not restart gift recognition:', e);
                        }
                    }
                    resetGiftVoiceUI();
                };

                giftVoiceRecognition.start();
            } catch (error) {
                console.error('Error starting gift voice recognition:', error);
                const statusDiv = document.getElementById('gift-voice-status');
                if (statusDiv) {
                    statusDiv.style.display = 'block';
                    statusDiv.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">Could not start voice recording. Check microphone permissions.</span>';
                }
            }
        }

        function stopGiftVoiceRecording() {
            giftStoppedByUser = true;
            giftIsRecording = false;
            if (giftVoiceRecognition) {
                try {
                    giftVoiceRecognition.stop();
                } catch (e) {
                    console.log('Error stopping gift recognition:', e);
                }
            }
            if (giftTranscript.trim()) {
                processGiftWithAI(giftTranscript.trim());
            }
        }

        function resetGiftVoiceUI() {
            giftIsRecording = false;
            const btn = document.getElementById('gift-voice-btn');
            const icon = document.getElementById('gift-voice-icon');
            const text = document.getElementById('gift-voice-text');

            if (btn) {
                btn.style.background = 'linear-gradient(135deg, #ec4899, #f59e0b)';
            }
            if (icon) {
                icon.className = 'fas fa-microphone';
            }
            if (text) {
                text.textContent = 'Start Recording';
            }
        }

        async function processGiftWithAI(transcript) {
            const statusDiv = document.getElementById('gift-voice-status');
            if (statusDiv) {
                statusDiv.style.display = 'block';
                statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: #ec4899;"></i> <span style="color: var(--text-primary);">AI is processing your gift info...</span>';
            }

            try {
                const apiKey = getOpenAIKey();
                if (!apiKey) {
                    document.getElementById('gift-reason').value = transcript;
                    if (statusDiv) {
                        statusDiv.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> <span style="color: var(--text-primary);">Transcript added to reason. Configure API key for AI auto-fill.</span>';
                    }
                    return;
                }

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
                                role: 'system',
                                content: `You are an assistant helping to document gifts given at a retail store. Extract structured information from voice transcripts about gifts given to customers, vendors, or employees.`
                            },
                            {
                                role: 'user',
                                content: `Analyze this voice transcript about a gift and extract the information. Return ONLY a JSON object with these fields (use null for any field you cannot determine):

Transcript: "${transcript}"

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

Recipient type guidelines:
- customer: regular customer, buyer
- vendor: supplier, sales rep
- employee: staff member, worker
- other: anyone else

Return ONLY the JSON object, no additional text.`
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

                let giftData;
                try {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        giftData = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('No JSON found in response');
                    }
                } catch (parseError) {
                    console.error('Error parsing AI response:', content);
                    document.getElementById('gift-reason').value = transcript;
                    if (statusDiv) {
                        statusDiv.innerHTML = '<i class="fas fa-check-circle" style="color: #f59e0b;"></i> <span style="color: var(--text-primary);">Transcript added. AI parsing failed.</span>';
                    }
                    return;
                }

                // Fill in the form fields
                if (giftData.productName) {
                    document.getElementById('gift-product').value = giftData.productName;
                }

                if (giftData.quantity) {
                    const qty = parseInt(giftData.quantity);
                    if (!isNaN(qty) && qty > 0) {
                        document.getElementById('gift-quantity').value = qty;
                    }
                }

                if (giftData.value) {
                    const val = parseFloat(giftData.value.toString().replace(/[^0-9.]/g, ''));
                    if (!isNaN(val)) {
                        document.getElementById('gift-value').value = val.toFixed(2);
                    }
                }

                if (giftData.recipientName) {
                    document.getElementById('gift-recipient').value = giftData.recipientName;
                }

                if (giftData.recipientType) {
                    const typeSelect = document.getElementById('gift-recipient-type');
                    const typeValue = giftData.recipientType.toLowerCase();
                    for (let option of typeSelect.options) {
                        if (option.value === typeValue) {
                            typeSelect.value = option.value;
                            break;
                        }
                    }
                }

                if (giftData.reason) {
                    document.getElementById('gift-reason').value = giftData.reason;
                } else {
                    document.getElementById('gift-reason').value = transcript;
                }

                if (giftData.store) {
                    const storeSelect = document.getElementById('gift-store');
                    for (let option of storeSelect.options) {
                        if (option.value.toLowerCase().includes(giftData.store.toLowerCase()) ||
                            giftData.store.toLowerCase().includes(option.value.toLowerCase())) {
                            storeSelect.value = option.value;
                            break;
                        }
                    }
                }

                if (giftData.notes) {
                    document.getElementById('gift-notes').value = giftData.notes;
                }

                if (statusDiv) {
                    statusDiv.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> <span style="color: var(--text-primary);">Gift form auto-filled! Review and save.</span>';
                }

            } catch (error) {
                console.error('Error processing gift with AI:', error);
                document.getElementById('gift-reason').value = transcript;
                if (statusDiv) {
                    statusDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #f59e0b;"></i> <span style="color: var(--text-primary);">AI error. Transcript added to reason.</span>`;
                }
            }
        }
        // ========== End Gift Voice Assistant ==========

        // ========== Cashout (Cash Control) Voice Assistant ==========
        let cashoutVoiceRecognition = null;
        let cashoutIsRecording = false;
        let cashoutTranscript = '';
        let cashoutStoppedByUser = false;

        function toggleCashoutVoiceRecording() {
            if (cashoutIsRecording) {
                stopCashoutVoiceRecording();
            } else {
                startCashoutVoiceRecording();
            }
        }

        function startCashoutVoiceRecording() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                const statusDiv = document.getElementById('cashout-voice-status');
                if (statusDiv) {
                    statusDiv.style.display = 'block';
                    statusDiv.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">Voice recognition not supported. Try Chrome or Edge.</span>';
                }
                return;
            }

            try {
                cashoutVoiceRecognition = new SpeechRecognition();
                cashoutVoiceRecognition.continuous = true;
                cashoutVoiceRecognition.interimResults = true;
                cashoutVoiceRecognition.lang = 'en-US';
                cashoutVoiceRecognition.maxAlternatives = 1;

                const btn = document.getElementById('cashout-voice-btn');
                const icon = document.getElementById('cashout-voice-icon');
                const text = document.getElementById('cashout-voice-text');
                const statusDiv = document.getElementById('cashout-voice-status');
                const transcriptPreview = document.getElementById('cashout-transcript-preview');
                const transcriptText = document.getElementById('cashout-transcript-text');

                cashoutTranscript = '';
                cashoutStoppedByUser = false;

                cashoutVoiceRecognition.onstart = () => {
                    cashoutIsRecording = true;
                    if (btn) btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                    if (icon) icon.className = 'fas fa-stop';
                    if (text) text.textContent = 'Stop';
                    if (statusDiv) {
                        statusDiv.style.display = 'block';
                        statusDiv.innerHTML = '<i class="fas fa-circle" style="color: #ef4444; animation: pulse 1s infinite;"></i> <span style="color: var(--text-primary);">Listening... Describe the expense</span>';
                    }
                    if (transcriptPreview) transcriptPreview.style.display = 'none';
                };

                cashoutVoiceRecognition.onresult = (event) => {
                    let interimTranscript = '';
                    let finalTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + ' ';
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    if (finalTranscript) {
                        cashoutTranscript += finalTranscript;
                    }

                    if (transcriptPreview && transcriptText) {
                        transcriptPreview.style.display = 'block';
                        transcriptText.innerHTML = cashoutTranscript + '<span style="color: var(--text-muted); font-style: italic;">' + interimTranscript + '</span>';
                    }
                };

                cashoutVoiceRecognition.onerror = (event) => {
                    console.error('Cashout voice recognition error:', event.error);
                    if (event.error !== 'aborted' && event.error !== 'no-speech') {
                        if (statusDiv) {
                            statusDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">Error: ${event.error}. Try again.</span>`;
                        }
                    }
                };

                cashoutVoiceRecognition.onend = () => {
                    if (cashoutStoppedByUser && cashoutTranscript.trim()) {
                        processCashoutWithAI(cashoutTranscript.trim());
                    } else if (!cashoutStoppedByUser && cashoutIsRecording) {
                        try {
                            cashoutVoiceRecognition.start();
                            return;
                        } catch (e) {
                            console.log('Could not restart cashout recognition:', e);
                        }
                    }
                    resetCashoutVoiceUI();
                };

                cashoutVoiceRecognition.start();
            } catch (error) {
                console.error('Error starting cashout voice recognition:', error);
                const statusDiv = document.getElementById('cashout-voice-status');
                if (statusDiv) {
                    statusDiv.style.display = 'block';
                    statusDiv.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">Could not start voice recording. Check microphone permissions.</span>';
                }
            }
        }

        function stopCashoutVoiceRecording() {
            cashoutStoppedByUser = true;
            cashoutIsRecording = false;
            if (cashoutVoiceRecognition) {
                try {
                    cashoutVoiceRecognition.stop();
                } catch (e) {
                    console.log('Error stopping cashout recognition:', e);
                }
            }
            if (cashoutTranscript.trim()) {
                processCashoutWithAI(cashoutTranscript.trim());
            }
        }

        function resetCashoutVoiceUI() {
            cashoutIsRecording = false;
            const btn = document.getElementById('cashout-voice-btn');
            const icon = document.getElementById('cashout-voice-icon');
            const text = document.getElementById('cashout-voice-text');

            if (btn) {
                btn.style.background = 'linear-gradient(135deg, #ec4899, #f59e0b)';
            }
            if (icon) {
                icon.className = 'fas fa-microphone';
            }
            if (text) {
                text.textContent = 'Voice';
            }
        }

        async function processCashoutWithAI(transcript) {
            const statusDiv = document.getElementById('cashout-voice-status');
            if (statusDiv) {
                statusDiv.style.display = 'block';
                statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: #8b5cf6;"></i> <span style="color: var(--text-primary);">AI is processing your expense...</span>';
            }

            try {
                const apiKey = getOpenAIKey();
                if (!apiKey) {
                    document.getElementById('cashout-name').value = transcript;
                    if (statusDiv) {
                        statusDiv.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> <span style="color: var(--text-primary);">Transcript added. Configure API key for AI auto-fill.</span>';
                    }
                    return;
                }

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
                                role: 'system',
                                content: `You are an assistant helping to document cash out expenses at a retail store. Extract structured information from voice transcripts about expenses and cash withdrawals.`
                            },
                            {
                                role: 'user',
                                content: `Analyze this voice transcript about an expense/cash out and extract the information. Return ONLY a JSON object with these fields (use null for any field you cannot determine):

Transcript: "${transcript}"

{
    "description": "clear description of the expense (e.g., Office Supplies from Staples, Bank Deposit, Cleaning Supplies)",
    "amount": "the amount as a number (no currency symbols)",
    "store": "one of: Miramar, Morena, Kearny Mesa, Chula Vista, North Park, Miramar Wine & Liquor (if mentioned)",
    "notes": "any additional relevant details"
}

Return ONLY the JSON object, no additional text.`
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

                let cashoutData;
                try {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        cashoutData = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('No JSON found in response');
                    }
                } catch (parseError) {
                    console.error('Error parsing AI response:', content);
                    document.getElementById('cashout-name').value = transcript;
                    if (statusDiv) {
                        statusDiv.innerHTML = '<i class="fas fa-check-circle" style="color: #f59e0b;"></i> <span style="color: var(--text-primary);">Transcript added. AI parsing failed.</span>';
                    }
                    return;
                }

                // Fill in the form fields
                if (cashoutData.description) {
                    document.getElementById('cashout-name').value = cashoutData.description;
                } else {
                    document.getElementById('cashout-name').value = transcript;
                }

                if (cashoutData.amount) {
                    const amount = parseFloat(cashoutData.amount.toString().replace(/[^0-9.]/g, ''));
                    if (!isNaN(amount)) {
                        document.getElementById('cashout-amount').value = amount.toFixed(2);
                    }
                }

                if (cashoutData.store) {
                    const storeSelect = document.getElementById('cashout-store');
                    for (let option of storeSelect.options) {
                        if (option.value.toLowerCase().includes(cashoutData.store.toLowerCase()) ||
                            cashoutData.store.toLowerCase().includes(option.value.toLowerCase())) {
                            storeSelect.value = option.value;
                            break;
                        }
                    }
                }

                if (cashoutData.notes) {
                    document.getElementById('cashout-reason').value = cashoutData.notes;
                }

                if (statusDiv) {
                    statusDiv.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> <span style="color: var(--text-primary);">Expense form auto-filled! Review and save.</span>';
                }

            } catch (error) {
                console.error('Error processing cashout with AI:', error);
                document.getElementById('cashout-name').value = transcript;
                if (statusDiv) {
                    statusDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #f59e0b;"></i> <span style="color: var(--text-primary);">AI error. Transcript added to description.</span>`;
                }
            }
        }
        // ========== End Cashout Voice Assistant ==========

        // ========== Issue Voice Assistant ==========
        let issueVoiceRecognition = null;
        let issueIsRecording = false;
        let issueTranscript = '';
        let issueStoppedByUser = false;

        function toggleIssueVoiceRecording() {
            if (issueIsRecording) {
                stopIssueVoiceRecording();
            } else {
                startIssueVoiceRecording();
            }
        }

        function startIssueVoiceRecording() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                const statusDiv = document.getElementById('issue-voice-status');
                if (statusDiv) {
                    statusDiv.style.display = 'block';
                    statusDiv.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">Voice recognition not supported. Try Chrome or Edge.</span>';
                }
                return;
            }

            try {
                issueVoiceRecognition = new SpeechRecognition();
                issueVoiceRecognition.continuous = true;
                issueVoiceRecognition.interimResults = true;
                issueVoiceRecognition.lang = 'en-US';
                issueVoiceRecognition.maxAlternatives = 1;

                const btn = document.getElementById('issue-voice-btn');
                const icon = document.getElementById('issue-voice-icon');
                const text = document.getElementById('issue-voice-text');
                const statusDiv = document.getElementById('issue-voice-status');
                const transcriptPreview = document.getElementById('issue-transcript-preview');
                const transcriptText = document.getElementById('issue-transcript-text');

                issueTranscript = '';
                issueStoppedByUser = false;

                issueVoiceRecognition.onstart = () => {
                    issueIsRecording = true;
                    if (btn) btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                    if (icon) icon.className = 'fas fa-stop';
                    if (text) text.textContent = 'Stop Recording';
                    if (statusDiv) {
                        statusDiv.style.display = 'block';
                        statusDiv.innerHTML = '<i class="fas fa-circle" style="color: #ef4444; animation: pulse 1s infinite;"></i> <span style="color: var(--text-primary);">Listening... Describe the issue</span>';
                    }
                    if (transcriptPreview) transcriptPreview.style.display = 'none';
                };

                issueVoiceRecognition.onresult = (event) => {
                    let interimTranscript = '';
                    let finalTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + ' ';
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    if (finalTranscript) {
                        issueTranscript += finalTranscript;
                    }

                    if (transcriptPreview && transcriptText) {
                        transcriptPreview.style.display = 'block';
                        transcriptText.innerHTML = issueTranscript + '<span style="color: var(--text-muted); font-style: italic;">' + interimTranscript + '</span>';
                    }
                };

                issueVoiceRecognition.onerror = (event) => {
                    console.error('Issue voice recognition error:', event.error);
                    if (event.error !== 'aborted' && event.error !== 'no-speech') {
                        if (statusDiv) {
                            statusDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">Error: ${event.error}. Try again.</span>`;
                        }
                    }
                };

                issueVoiceRecognition.onend = () => {
                    if (issueStoppedByUser && issueTranscript.trim()) {
                        processIssueWithAI(issueTranscript.trim());
                    } else if (!issueStoppedByUser && issueIsRecording) {
                        try {
                            issueVoiceRecognition.start();
                            return;
                        } catch (e) {
                            console.log('Could not restart issue recognition:', e);
                        }
                    }
                    resetIssueVoiceUI();
                };

                issueVoiceRecognition.start();
            } catch (error) {
                console.error('Error starting issue voice recognition:', error);
                const statusDiv = document.getElementById('issue-voice-status');
                if (statusDiv) {
                    statusDiv.style.display = 'block';
                    statusDiv.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">Could not start voice recording. Check microphone permissions.</span>';
                }
            }
        }

        function stopIssueVoiceRecording() {
            issueStoppedByUser = true;
            issueIsRecording = false;
            if (issueVoiceRecognition) {
                try {
                    issueVoiceRecognition.stop();
                } catch (e) {
                    console.log('Error stopping issue recognition:', e);
                }
            }
            if (issueTranscript.trim()) {
                processIssueWithAI(issueTranscript.trim());
            }
        }

        function resetIssueVoiceUI() {
            issueIsRecording = false;
            const btn = document.getElementById('issue-voice-btn');
            const icon = document.getElementById('issue-voice-icon');
            const text = document.getElementById('issue-voice-text');

            if (btn) {
                btn.style.background = 'linear-gradient(135deg, #ef4444, #f59e0b)';
            }
            if (icon) {
                icon.className = 'fas fa-microphone';
            }
            if (text) {
                text.textContent = 'Start Recording';
            }
        }

        async function processIssueWithAI(transcript) {
            const statusDiv = document.getElementById('issue-voice-status');
            if (statusDiv) {
                statusDiv.style.display = 'block';
                statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: #ef4444;"></i> <span style="color: var(--text-primary);">AI is processing your issue report...</span>';
            }

            try {
                const apiKey = getOpenAIKey();
                if (!apiKey) {
                    document.getElementById('issue-description').value = transcript;
                    if (statusDiv) {
                        statusDiv.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> <span style="color: var(--text-primary);">Transcript added. Configure API key for AI auto-fill.</span>';
                    }
                    return;
                }

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
                                role: 'system',
                                content: `You are an assistant helping to document customer issues at a retail store. Extract structured information from voice transcripts about customer complaints, problems, or incidents.`
                            },
                            {
                                role: 'user',
                                content: `Analyze this voice transcript about a customer issue and extract the information. Return ONLY a JSON object with these fields (use null for any field you cannot determine):

Transcript: "${transcript}"

{
    "customerName": "name of the customer if mentioned",
    "phone": "phone number if mentioned (format: (XXX) XXX-XXXX)",
    "issueType": "In Store or Online",
    "store": "one of: Miramar, Morena, Kearny Mesa, Chula Vista, North Park, Miramar Wine & Liquor (if mentioned)",
    "description": "clear, professional description of the issue",
    "perception": "1-5 based on how upset the customer seemed (1=Very Upset, 2=Upset, 3=Neutral, 4=Satisfied, 5=Happy)"
}

Perception guidelines:
- 1 (Very Upset): Customer was extremely angry, yelling, threatening
- 2 (Upset): Customer was clearly frustrated or disappointed
- 3 (Neutral): Customer was calm, just reporting an issue
- 4 (Satisfied): Customer seemed okay after resolution
- 5 (Happy): Customer was pleased with how it was handled

Return ONLY the JSON object, no additional text.`
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

                let issueData;
                try {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        issueData = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('No JSON found in response');
                    }
                } catch (parseError) {
                    console.error('Error parsing AI response:', content);
                    document.getElementById('issue-description').value = transcript;
                    if (statusDiv) {
                        statusDiv.innerHTML = '<i class="fas fa-check-circle" style="color: #f59e0b;"></i> <span style="color: var(--text-primary);">Transcript added. AI parsing failed.</span>';
                    }
                    return;
                }

                // Fill in the form fields
                if (issueData.customerName) {
                    document.getElementById('issue-customer').value = issueData.customerName;
                }

                if (issueData.phone) {
                    document.getElementById('issue-phone').value = issueData.phone;
                }

                if (issueData.issueType) {
                    const typeSelect = document.getElementById('issue-type');
                    const typeValue = issueData.issueType;
                    for (let option of typeSelect.options) {
                        if (option.value.toLowerCase() === typeValue.toLowerCase()) {
                            typeSelect.value = option.value;
                            break;
                        }
                    }
                }

                if (issueData.store) {
                    const storeSelect = document.getElementById('issue-store');
                    for (let option of storeSelect.options) {
                        if (option.value.toLowerCase().includes(issueData.store.toLowerCase()) ||
                            issueData.store.toLowerCase().includes(option.value.toLowerCase())) {
                            storeSelect.value = option.value;
                            break;
                        }
                    }
                }

                if (issueData.description) {
                    document.getElementById('issue-description').value = issueData.description;
                } else {
                    document.getElementById('issue-description').value = transcript;
                }

                if (issueData.perception) {
                    const perceptionValue = parseInt(issueData.perception);
                    if (perceptionValue >= 1 && perceptionValue <= 5) {
                        selectPerception(perceptionValue);
                    }
                }

                if (statusDiv) {
                    statusDiv.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> <span style="color: var(--text-primary);">Issue form auto-filled! Review and save.</span>';
                }

            } catch (error) {
                console.error('Error processing issue with AI:', error);
                document.getElementById('issue-description').value = transcript;
                if (statusDiv) {
                    statusDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #f59e0b;"></i> <span style="color: var(--text-primary);">AI error. Transcript added to description.</span>`;
                }
            }
        }
        // ========== End Issue Voice Assistant ==========

        function viewRiskNote(noteId) {
            const note = riskNotesState.notes.find(n => n.id === noteId);
            if (!note) return;

            const behaviorType = RISK_BEHAVIOR_TYPES.find(t => t.id === note.behaviorType) || RISK_BEHAVIOR_TYPES[5];
            const level = RISK_LEVELS.find(l => l.id === note.level) || RISK_LEVELS[0];
            const noteDate = new Date(note.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
            const createdDate = note.createdAt ? new Date(note.createdAt).toLocaleString('en-US') : 'Unknown';

            const modal = document.getElementById('modal');

            // Load photo - prefer Firebase Storage URL, fallback to IndexedDB
            const loadPhotoAndRender = async () => {
                let photoUrl = null;

                // First check if we have a Firebase Storage URL
                if (note.photo) {
                    photoUrl = note.photo;
                } else if (note.hasPhoto) {
                    // Fallback to IndexedDB for older notes
                    try {
                        photoUrl = await getPhotoFromIndexedDB(noteId);
                    } catch (err) {
                        console.error('Error loading photo from IndexedDB:', err);
                    }
                }

                renderNoteModal(modal, note, behaviorType, level, noteDate, createdDate, photoUrl);
            };

            loadPhotoAndRender();
        }

        function renderNoteModal(modal, note, behaviorType, level, noteDate, createdDate, photoUrl) {
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header" style="background: linear-gradient(135deg, ${level.color}20 0%, var(--bg-secondary) 100%); border-bottom: 3px solid ${level.color};">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="width: 56px; height: 56px; background: ${behaviorType.color}20; border-radius: 14px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas ${behaviorType.icon}" style="color: ${behaviorType.color}; font-size: 24px;"></i>
                            </div>
                            <div>
                                <h2 style="margin: 0; font-size: 20px;">${behaviorType.label}</h2>
                                <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
                                    <i class="fas fa-store"></i> ${note.store}
                                </div>
                            </div>
                        </div>
                        <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body" style="padding: 24px;">
                        <!-- Risk Level Badge -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <span style="background: ${level.color}20; color: ${level.color}; padding: 8px 20px; border-radius: 25px; font-size: 14px; font-weight: 600;">
                                <i class="fas ${level.icon}" style="font-size: 10px;"></i> ${level.label} Risk
                            </span>
                            <span style="font-size: 13px; color: var(--text-muted);">
                                <i class="fas fa-calendar"></i> ${noteDate}
                            </span>
                        </div>

                        <!-- Description -->
                        <div style="margin-bottom: 20px;">
                            <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Description</label>
                            <div style="background: var(--bg-secondary); padding: 16px; border-radius: 12px; font-size: 14px; line-height: 1.7;">
                                ${note.description || 'No description provided'}
                            </div>
                        </div>

                        ${photoUrl ? `
                            <!-- Photo Evidence -->
                            <div style="margin-bottom: 20px;">
                                <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Photo Evidence</label>
                                <div style="border-radius: 12px; overflow: hidden; background: var(--bg-secondary);">
                                    <img src="${photoUrl}" alt="Evidence" style="width: 100%; max-height: 350px; object-fit: contain; cursor: pointer;" onclick="window.open('${photoUrl}', '_blank')">
                                </div>
                                <div style="text-align: center; margin-top: 8px;">
                                    <span style="font-size: 11px; color: var(--text-muted);">Click image to view full size</span>
                                </div>
                            </div>
                        ` : ''}

                        ${note.managerNote ? `
                            <!-- Manager Note -->
                            <div style="margin-bottom: 20px;">
                                <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Manager Note</label>
                                <div style="background: rgba(245, 158, 11, 0.1); padding: 16px; border-radius: 12px; border-left: 4px solid var(--warning);">
                                    <div style="font-size: 14px; line-height: 1.6;">${note.managerNote}</div>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Meta Info -->
                        <div style="background: var(--bg-secondary); padding: 16px; border-radius: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Reported By</div>
                                <div style="font-size: 14px; font-weight: 500;"><i class="fas fa-user" style="margin-right: 8px; color: var(--accent-primary);"></i>${note.reportedBy || 'Anonymous'}</div>
                            </div>
                            <div>
                                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Created</div>
                                <div style="font-size: 14px; font-weight: 500;"><i class="fas fa-clock" style="margin-right: 8px; color: var(--accent-primary);"></i>${createdDate}</div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer" style="display: flex; justify-content: space-between;">
                        <button class="btn-secondary danger" onclick="closeModal(); deleteRiskNote('${note.id}');">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                        <button class="btn-primary" onclick="closeModal()">
                            <i class="fas fa-check"></i> Close
                        </button>
                    </div>
                </div>
            `;
            modal.classList.add('active');
        }

        // G FORCE DATA - Must be declared before renderGForce
        var gforceQuotes = [
            // Abundance & Prosperity
            { text: "Abundance is not something we acquire, it is something we tune into.", author: "Wayne Dyer" },
            { text: "The universe is always conspiring in your favor when you raise your vibration.", author: "G Force" },
            { text: "What you think, you create. What you feel, you attract. What you imagine, you become.", author: "Buddha" },
            { text: "Gratitude is the key that unlocks the door to infinite abundance.", author: "Melody Beattie" },
            { text: "You are a living magnet. What you attract into your life is in harmony with your dominant thoughts.", author: "Brian Tracy" },
            { text: "Money is energy, and energy flows where you put your attention.", author: "Deepak Chopra" },
            { text: "Don't look for happiness outside yourself. Abundance begins within.", author: "Rumi" },
            { text: "When you change the way you look at things, the things you look at change.", author: "Wayne Dyer" },
            { text: "The universe returns what you radiate. Be the energy you want to attract.", author: "G Force" },
            { text: "Prosperity is a state of mind before it becomes a physical reality.", author: "Napoleon Hill" },
            { text: "Every moment is an opportunity to align with universal abundance.", author: "G Force" },
            { text: "Your vibrational frequency determines your reality. Choose thoughts of abundance.", author: "G Force" },
            { text: "The universe doesn't give you what you ask for, it gives you what you are.", author: "G Force" },
            { text: "Gratitude transforms what you have into enough, and more.", author: "G Force" },
            { text: "You are not a drop in the ocean, you are the entire ocean in a drop.", author: "Rumi" },
            { text: "Energy flows where your focus goes. Focus on abundance.", author: "Tony Robbins" },
            { text: "Your intention creates your reality. Declare your prosperity now.", author: "G Force" },
            { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
            { text: "When you connect with your purpose, the universe supports you.", author: "G Force" },
            { text: "Abundance is your birthright. Claim it with confidence.", author: "Louise Hay" },
            // Self-Love & Inner Peace
            { text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.", author: "Buddha" },
            { text: "The most powerful relationship you will ever have is the relationship with yourself.", author: "Steve Maraboli" },
            { text: "Self-care is not selfish. You cannot serve from an empty vessel.", author: "Eleanor Brown" },
            { text: "Be gentle with yourself. You're doing the best you can.", author: "G Force" },
            { text: "Your value doesn't decrease based on someone's inability to see your worth.", author: "G Force" },
            { text: "The way you speak to yourself matters. Choose words of love and encouragement.", author: "G Force" },
            { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
            { text: "In the midst of movement and chaos, keep stillness inside of you.", author: "Deepak Chopra" },
            { text: "You are enough just as you are. Each emotion, each moment, each experience.", author: "G Force" },
            { text: "Loving yourself isn't vanity; it's sanity.", author: "Katrina Mayer" },
            // Manifestation & Power
            { text: "Everything you can imagine is real.", author: "Pablo Picasso" },
            { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
            { text: "You have within you right now, everything you need to deal with whatever the world throws at you.", author: "Brian Tracy" },
            { text: "The mind is everything. What you think you become.", author: "Buddha" },
            { text: "Your thoughts are the architects of your destiny.", author: "David O. McKay" },
            { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
            { text: "Whatever the mind can conceive and believe, it can achieve.", author: "Napoleon Hill" },
            { text: "You are the creator of your own reality. Choose wisely.", author: "G Force" },
            { text: "The universe rearranges itself to accommodate your picture of reality.", author: "G Force" },
            { text: "Your imagination is your preview of life's coming attractions.", author: "Albert Einstein" },
            // Growth & Transformation
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "Growth is painful. Change is painful. But nothing is as painful as staying stuck.", author: "G Force" },
            { text: "Every adversity carries with it the seed of an equal or greater benefit.", author: "Napoleon Hill" },
            { text: "Your current situation is not your final destination.", author: "G Force" },
            { text: "The butterfly counts not months but moments, and has time enough.", author: "Rabindranath Tagore" },
            { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
            { text: "The secret of change is to focus all your energy not on fighting the old, but on building the new.", author: "Socrates" },
            { text: "Every morning brings new potential, but if you dwell on yesterday's misfortunes, you tend to overlook today's opportunities.", author: "G Force" },
            { text: "Stars can't shine without darkness. Your struggles are preparing you for greatness.", author: "G Force" },
            { text: "Trust the timing of your life. Everything is unfolding exactly as it should.", author: "G Force" },
            // Courage & Strength
            { text: "She remembered who she was and the game changed.", author: "Lalah Delia" },
            { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne" },
            { text: "Courage doesn't always roar. Sometimes it's the quiet voice saying 'I will try again tomorrow.'", author: "Mary Anne Radmacher" },
            { text: "You didn't come this far to only come this far.", author: "G Force" },
            { text: "The woman who doesn't require validation from anyone is the most feared individual on the planet.", author: "Mohadesa Najumi" },
            { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
            { text: "Life shrinks or expands in proportion to one's courage.", author: "Anaïs Nin" },
            { text: "You have been assigned this mountain to show others it can be moved.", author: "G Force" },
            { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
            { text: "Your wings already exist. All you have to do is fly.", author: "G Force" }
        ];

        var gforceAffirmations = [
            // Abundance & Prosperity
            "I am a magnet for infinite abundance and prosperity",
            "The universe is constantly working in my favor",
            "I deserve all the good things coming into my life",
            "My energy attracts wonderful opportunities every day",
            "I trust in the perfect process of the universe",
            "I am aligned with the frequency of abundance",
            "Money flows to me easily and naturally",
            "I am surrounded by love, light, and abundance",
            "My thoughts create my reality and I choose thoughts of abundance",
            "I am an open channel for universal prosperity",
            "Success and abundance are my natural state",
            "Wealth constantly flows into my life from expected and unexpected sources",
            "I am grateful for the abundance that surrounds me",
            "Every dollar I spend comes back to me multiplied",
            "I attract lucrative opportunities effortlessly",
            // Self-Love & Worth
            "I release everything that no longer serves me and embrace the new",
            "My mind is at peace, my heart is calm",
            "I am worthy of receiving everything I desire and more",
            "Every day I become more prosperous in all aspects of my life",
            "My present is full of blessings that I recognize with gratitude",
            "I have everything I need in this moment",
            "Each breath connects me more deeply with my inner peace",
            "I trust in my ability to create the life I desire",
            "I am exactly where I need to be in this moment",
            "I love and accept myself unconditionally",
            "I am deserving of happiness, love, and success",
            "My self-worth is not determined by others' opinions",
            "I honor my needs and take time for self-care",
            "I am complete and whole just as I am",
            "I forgive myself and release all guilt",
            // Power & Manifestation
            "I am the architect of my own destiny",
            "My dreams are manifesting into reality right now",
            "I have the power to create positive change in my life",
            "I am confident in my ability to achieve my goals",
            "Every challenge I face makes me stronger and wiser",
            "I attract the right people and circumstances into my life",
            "My potential is limitless",
            "I transform obstacles into opportunities",
            "I am creating the life of my dreams one day at a time",
            "The universe supports my highest good",
            // Peace & Gratitude
            "I choose peace over worry, love over fear",
            "I am grateful for this beautiful day and all it brings",
            "I release anxiety and embrace calm",
            "Today I choose joy and positivity",
            "I am blessed with an amazing support system",
            "Every experience teaches me something valuable",
            "I radiate positive energy wherever I go",
            "I am at peace with my past and excited for my future",
            "Happiness flows through me naturally",
            "I appreciate the small miracles in everyday life",
            // Strength & Courage
            "I am brave, bold, and unstoppable",
            "I face challenges with courage and determination",
            "My inner strength is greater than any obstacle",
            "I trust myself to make the right decisions",
            "I am resilient and bounce back from setbacks quickly",
            "Fear does not control me; I control my response to fear",
            "I embrace change as an opportunity for growth",
            "I am becoming the best version of myself every day",
            "My voice matters and deserves to be heard",
            "I stand in my power with grace and confidence"
        ];

        var gforcePhilosophies = [
            {
                text: "Self-love is not selfish; it's the foundation of all healthy relationships. When you fill your own cup first, you overflow with love and kindness for others. Remember that caring for yourself allows you to show up fully in the world.",
                tips: [
                    { icon: "🛁", text: "Take a 20-minute break today just for you - no phone, no tasks, just pure presence with yourself" },
                    { icon: "💭", text: "Write down three things you appreciate about yourself right now, focusing on your inner qualities" },
                    { icon: "🌸", text: "Practice saying 'no' to something that drains your energy, creating space for what nourishes you" }
                ]
            },
            {
                text: "Your body is a sacred temple that carries you through life. Treat it with reverence and gratitude. Every cell in your being responds to love and care, creating harmony from within that radiates outward.",
                tips: [
                    { icon: "💧", text: "Drink a full glass of water mindfully, thanking your body for all it does for you each day" },
                    { icon: "🧘", text: "Spend 5 minutes stretching gently, breathing deeply into any areas of tension or discomfort" },
                    { icon: "🥗", text: "Choose one meal today to eat slowly and mindfully, savoring each bite with appreciation" }
                ]
            },
            {
                text: "Emotional wellness begins with accepting all your feelings without judgment. Every emotion is a messenger bringing you important information. Welcome them, listen to them, and let them flow through you naturally.",
                tips: [
                    { icon: "📔", text: "Journal for 10 minutes about what you're feeling right now, without censoring or editing yourself" },
                    { icon: "🎵", text: "Create a playlist that matches your current mood and let the music help you process your emotions" },
                    { icon: "🤗", text: "Give yourself a gentle hug or place your hand on your heart, offering yourself compassion" }
                ]
            },
            {
                text: "Rest is not laziness; it's a sacred act of self-preservation. In a world that glorifies hustle, choosing rest is revolutionary. Your worth is not measured by productivity but by your inherent value as a human being.",
                tips: [
                    { icon: "😴", text: "Set a consistent bedtime tonight, creating a calming evening ritual that honors your need for rest" },
                    { icon: "📵", text: "Take a digital detox for one hour, allowing your mind to rest from constant stimulation" },
                    { icon: "☕", text: "Enjoy a warm beverage slowly, giving yourself permission to simply be without doing" }
                ]
            },
            {
                text: "Gratitude is the fastest path to contentment. What you appreciate, appreciates in value. When you focus on what you have rather than what you lack, abundance becomes your reality.",
                tips: [
                    { icon: "📝", text: "Write down 5 things you're grateful for right now, including the smallest blessings" },
                    { icon: "💌", text: "Send a message of appreciation to someone who has positively impacted your life" },
                    { icon: "🌅", text: "Start each morning by naming three good things before checking your phone" }
                ]
            },
            {
                text: "Your thoughts shape your reality more than you realize. Every thought is a seed planted in the garden of your mind. Choose to plant flowers of positivity, hope, and possibility rather than weeds of doubt and fear.",
                tips: [
                    { icon: "🧠", text: "Notice negative self-talk today and consciously replace it with a positive alternative" },
                    { icon: "✨", text: "Visualize your ideal day for 5 minutes this morning, feeling the emotions of success" },
                    { icon: "🪞", text: "Look in the mirror and speak three kind affirmations to yourself out loud" }
                ]
            },
            {
                text: "Boundaries are not walls that keep people out; they are bridges that define where you end and others begin. Setting healthy boundaries is an act of self-respect that teaches others how to treat you.",
                tips: [
                    { icon: "🚧", text: "Identify one area where you need stronger boundaries and commit to honoring it today" },
                    { icon: "💬", text: "Practice expressing your needs clearly and calmly without over-explaining or apologizing" },
                    { icon: "🛡️", text: "Remember: 'No' is a complete sentence. You don't owe anyone an explanation for protecting your energy" }
                ]
            },
            {
                text: "Connection with nature is medicine for the soul. In the natural world, you remember that you are part of something greater than yourself. Let the earth ground you and the sky remind you of infinite possibilities.",
                tips: [
                    { icon: "🌳", text: "Spend 10 minutes outside today, whether it's a walk, sitting in the sun, or tending to plants" },
                    { icon: "🌊", text: "Listen to nature sounds while working or relaxing to bring calm energy into your space" },
                    { icon: "🌻", text: "Bring a piece of nature indoors - a flower, a plant, or even a beautiful stone" }
                ]
            },
            {
                text: "Forgiveness is not about condoning what happened; it's about freeing yourself from carrying the weight of resentment. When you forgive, you release the chains that bind you to the past and step into freedom.",
                tips: [
                    { icon: "🕊️", text: "Write a letter of forgiveness to someone who hurt you (you don't need to send it)" },
                    { icon: "💝", text: "Forgive yourself for one past mistake. Say out loud: 'I release this and move forward with love'" },
                    { icon: "🌈", text: "Recognize that holding onto anger hurts you more than anyone else - choose peace today" }
                ]
            },
            {
                text: "Your intuition is your inner compass, a gift that guides you toward your highest good. In a world full of noise, learning to listen to your inner voice is a superpower. Trust yourself - you know more than you think.",
                tips: [
                    { icon: "🔮", text: "Before making a decision today, pause and ask yourself: 'What does my gut tell me?'" },
                    { icon: "🧘‍♀️", text: "Spend 5 minutes in silence, breathing deeply, and notice what thoughts or feelings arise" },
                    { icon: "📿", text: "Practice trusting a small intuitive nudge today and observe the outcome" }
                ]
            },
            {
                text: "Creativity is not reserved for artists; it is the essence of being human. Every time you solve a problem, cook a meal, or rearrange your space, you are creating. Honor your creative spirit by making time to play.",
                tips: [
                    { icon: "🎨", text: "Do something creative today with no expectation of perfection - doodle, sing, write, dance" },
                    { icon: "🎭", text: "Try something new that slightly scares you - creativity lives at the edge of comfort" },
                    { icon: "🌈", text: "Give yourself permission to be a beginner at something. Mastery isn't the goal - joy is" }
                ]
            },
            {
                text: "Patience is the art of trusting the timing of your life. Like a seed beneath the soil, growth is happening even when you cannot see it. Have faith that everything is unfolding exactly as it should.",
                tips: [
                    { icon: "🌱", text: "When feeling impatient today, take three deep breaths and say: 'Everything is working out for me'" },
                    { icon: "⏳", text: "Reflect on a past situation that felt frustrating but eventually revealed its purpose" },
                    { icon: "🦋", text: "Remember: the caterpillar doesn't know it will become a butterfly. Trust your transformation" }
                ]
            },
            {
                text: "Joy is not something to be pursued; it is something to be allowed. It already exists within you, waiting to be uncovered. Strip away the layers of worry and obligation, and you will find joy has been there all along.",
                tips: [
                    { icon: "😊", text: "Do one thing today purely because it brings you joy, with no productivity attached" },
                    { icon: "🎉", text: "Celebrate a small win from this week - no achievement is too small to acknowledge" },
                    { icon: "💃", text: "Move your body in a way that feels good - dance, stretch, walk - and notice how joy follows" }
                ]
            },
            {
                text: "Vulnerability is not weakness; it is the birthplace of connection, creativity, and courage. When you allow yourself to be seen - truly seen - you open the door to authentic relationships and deep fulfillment.",
                tips: [
                    { icon: "💗", text: "Share something honest with a trusted person today, even if it feels uncomfortable" },
                    { icon: "🎭", text: "Notice where you wear masks to hide your true self. Ask: 'What would happen if I took it off?'" },
                    { icon: "🌸", text: "Embrace imperfection today. Done is better than perfect, and real is better than polished" }
                ]
            },
            {
                text: "Abundance is a mindset before it becomes a reality. When you shift from scarcity thinking to abundance thinking, you open yourself to receiving more of everything - love, opportunities, wealth, and happiness.",
                tips: [
                    { icon: "💰", text: "Replace 'I can't afford it' with 'How can I afford it?' to open your mind to possibilities" },
                    { icon: "🙏", text: "Express gratitude for your current blessings, no matter how small - this attracts more" },
                    { icon: "🎁", text: "Give something away today - generosity signals to the universe that you have plenty to share" }
                ]
            }
        ];

        // G FORCE FUNCTIONALITY
        function renderGForce() {
            const dashboard = document.querySelector('.dashboard');
            const quote = getGForceModuleQuote();
            const affirmations = getDailyGForceAffirmations(5);
            const philosophy = getDailyGForcePhilosophy();

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">
                            <i class="fas fa-bolt" style="color: var(--accent-primary);"></i>
                            G Force - Giselle's Daily Motivation
                        </h2>
                        <p class="section-subtitle">${getGForceDate()}</p>
                    </div>
                </div>

                <!-- Quote Card -->
                <div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);">
                    <div class="card-body" style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">✨</div>
                        <div id="gforce-quote-text" style="font-size: 1.6rem; line-height: 1.7; margin-bottom: 20px; font-weight: 300; color: var(--text-primary);">"${quote.text}"</div>
                        <div id="gforce-quote-author" style="text-align: right; color: var(--accent-primary); font-size: 1.1rem; font-style: italic;">— ${quote.author}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px;">
                    <!-- Affirmations Card -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">
                                <i class="fas fa-heart" style="color: #ec4899;"></i>
                                Today's Affirmations
                            </h3>
                        </div>
                        <div class="card-body">
                            <div id="gforce-affirmations-page">
                                ${affirmations.map(aff => `
                                    <div style="background: var(--bg-secondary); padding: 14px 18px; border-radius: 10px; margin-bottom: 12px; font-size: 14px; border-left: 4px solid var(--accent-primary); transition: transform 0.2s; cursor: default;" onmouseover="this.style.transform='translateX(6px)'" onmouseout="this.style.transform='translateX(0)'">
                                        <span style="color: var(--success); margin-right: 8px;">✓</span> ${aff}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Philosophy Card -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">
                                <i class="fas fa-lightbulb" style="color: #f59e0b;"></i>
                                Self-Care Philosophy
                            </h3>
                        </div>
                        <div class="card-body">
                            <div id="gforce-philosophy-page-text" style="font-size: 15px; line-height: 1.8; margin-bottom: 24px; color: var(--text-secondary);">${philosophy.text}</div>
                            <div id="gforce-tips-page">
                                ${philosophy.tips.map(tip => `
                                    <div style="background: var(--bg-secondary); padding: 16px 20px; border-radius: 12px; display: flex; align-items: flex-start; gap: 14px; margin-bottom: 12px; transition: all 0.2s; cursor: default;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 16px rgba(99, 102, 241, 0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                                        <div style="font-size: 1.8rem; flex-shrink: 0;">${tip.icon}</div>
                                        <div style="font-size: 14px; line-height: 1.6;">${tip.text}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Motivational Footer -->
                <div style="text-align: center; margin-top: 32px; padding: 24px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%); border-radius: 16px;">
                    <div style="font-size: 32px; margin-bottom: 12px;">🌟</div>
                    <div style="font-size: 18px; font-weight: 500; color: var(--text-primary);">Remember: You are capable of amazing things!</div>
                    <div style="font-size: 14px; color: var(--text-muted); margin-top: 8px;">Take a deep breath and embrace today with gratitude.</div>
                </div>
            `;
        }

        function refreshGForceQuote() {
            const quote = getRandomGForceQuote();
            document.getElementById('gforce-quote-text').textContent = '"' + quote.text + '"';
            document.getElementById('gforce-quote-author').textContent = '— ' + quote.author;
        }

        function refreshGForceAffirmations() {
            const affirmations = getRandomGForceAffirmations(5);
            const container = document.getElementById('gforce-affirmations-page');
            container.innerHTML = affirmations.map(aff => `
                <div style="background: var(--bg-secondary); padding: 14px 18px; border-radius: 10px; margin-bottom: 12px; font-size: 14px; border-left: 4px solid var(--accent-primary); transition: transform 0.2s; cursor: default;" onmouseover="this.style.transform='translateX(6px)'" onmouseout="this.style.transform='translateX(0)'">
                    <span style="color: var(--success); margin-right: 8px;">✓</span> ${aff}
                </div>
            `).join('');
        }

        function refreshGForcePhilosophy() {
            const philosophy = getRandomGForcePhilosophy();
            document.getElementById('gforce-philosophy-page-text').textContent = philosophy.text;
            const tipsContainer = document.getElementById('gforce-tips-page');
            tipsContainer.innerHTML = philosophy.tips.map(tip => `
                <div style="background: var(--bg-secondary); padding: 16px 20px; border-radius: 12px; display: flex; align-items: flex-start; gap: 14px; margin-bottom: 12px; transition: all 0.2s; cursor: default;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 16px rgba(99, 102, 241, 0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    <div style="font-size: 1.8rem; flex-shrink: 0;">${tip.icon}</div>
                    <div style="font-size: 14px; line-height: 1.6;">${tip.text}</div>
                </div>
            `).join('');
        }

        // Get day of year for consistent daily content
        function getDayOfYear() {
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 0);
            const diff = now - start;
            const oneDay = 1000 * 60 * 60 * 24;
            return Math.floor(diff / oneDay);
        }

        function getGForceDate() {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return new Date().toLocaleDateString('en-US', options);
        }

        // Daily functions - content changes each day but stays consistent throughout the day
        function getGForceModuleQuote() {
            const dayOfYear = getDayOfYear();
            const index = dayOfYear % gforceQuotes.length;
            return gforceQuotes[index];
        }

        function getDailyGForceAffirmations(count = 5) {
            const dayOfYear = getDayOfYear();
            const result = [];
            for (let i = 0; i < count; i++) {
                const index = (dayOfYear + i * 7) % gforceAffirmations.length;
                result.push(gforceAffirmations[index]);
            }
            return result;
        }

        function getDailyGForcePhilosophy() {
            const dayOfYear = getDayOfYear();
            const index = dayOfYear % gforcePhilosophies.length;
            return gforcePhilosophies[index];
        }

        // Keep random functions for backwards compatibility
        let currentGForceQuoteIndex = -1;
        let currentGForcePhilosophyIndex = -1;

        function getRandomGForceQuote() {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * gforceQuotes.length);
            } while (newIndex === currentGForceQuoteIndex && gforceQuotes.length > 1);
            currentGForceQuoteIndex = newIndex;
            return gforceQuotes[currentGForceQuoteIndex];
        }

        function getRandomGForceAffirmations(count = 5) {
            const shuffled = [...gforceAffirmations].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, count);
        }

        function getRandomGForcePhilosophy() {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * gforcePhilosophies.length);
            } while (newIndex === currentGForcePhilosophyIndex && gforcePhilosophies.length > 1);
            currentGForcePhilosophyIndex = newIndex;
            return gforcePhilosophies[currentGForcePhilosophyIndex];
        }

        function displayGForceQuote(quote) {
            document.getElementById('gforce-quote-text').textContent = `"${quote.text}"`;
            document.getElementById('gforce-quote-author').textContent = `— ${quote.author}`;
        }

        function displayGForceAffirmations(affirmations) {
            const container = document.getElementById('gforce-affirmations');
            container.innerHTML = affirmations.map(aff =>
                `<div style="background: var(--bg-secondary); padding: 12px 16px; border-radius: 10px; margin-bottom: 10px; font-size: 14px; border-left: 3px solid var(--accent-primary); transition: transform 0.2s; cursor: default;" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='translateX(0)'">
                    ✓ ${aff}
                </div>`
            ).join('');
        }

        function displayGForcePhilosophy(philosophy) {
            document.getElementById('gforce-philosophy-text').textContent = philosophy.text;
            const tipsContainer = document.getElementById('gforce-tips');
            tipsContainer.innerHTML = philosophy.tips.map(tip =>
                `<div style="background: var(--bg-secondary); padding: 14px 18px; border-radius: 10px; display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; transition: all 0.2s; cursor: default;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(99, 102, 241, 0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    <div style="font-size: 1.5rem; flex-shrink: 0;">${tip.icon}</div>
                    <div style="font-size: 13px; line-height: 1.5; color: var(--text-secondary);">${tip.text}</div>
                </div>`
            ).join('');
        }

        window.generateGForceQuote = function() {
            displayGForceQuote(getRandomGForceQuote());
        }

        window.generateGForceAffirmations = function() {
            displayGForceAffirmations(getRandomGForceAffirmations(5));
        }

        window.generateGForcePhilosophy = function() {
            displayGForcePhilosophy(getRandomGForcePhilosophy());
        }

        window.openGForceModal = function() {
            document.getElementById('gforce-date').textContent = getGForceDate();
            generateGForceQuote();
            generateGForceAffirmations();
            generateGForcePhilosophy();
            document.getElementById('gforce-modal').classList.add('active');
        }

        window.closeGForceModal = function() {
            document.getElementById('gforce-modal').classList.remove('active');
        }

        // Close modal when clicking outside
        document.getElementById('gforce-modal').addEventListener('mousedown', function(e) {
            if (e.target === this) {
                closeGForceModal();
            }
        });

