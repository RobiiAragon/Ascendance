/**
 * HR Applications Module - Job Applications Management
 * Manages job applications submitted via the public joinus.html page
 */

// HR Applications State
let hrApplications = [];
let hrCurrentFilter = 'all';
let hrCurrentSort = 'newest';
let hrSelectedApplication = null;

// Application status configuration
const HR_STATUS_CONFIG = {
    'new': { label: 'New', color: '#3b82f6', icon: 'fa-star' },
    'reviewing': { label: 'Reviewing', color: '#f59e0b', icon: 'fa-eye' },
    'interview': { label: 'Interview Scheduled', color: '#8b5cf6', icon: 'fa-calendar-check' },
    'hired': { label: 'Hired', color: '#10b981', icon: 'fa-check-circle' },
    'rejected': { label: 'Rejected', color: '#ef4444', icon: 'fa-times-circle' },
    'on_hold': { label: 'On Hold', color: '#6b7280', icon: 'fa-pause-circle' }
};

/**
 * Initialize HR Applications Module
 */
async function initializeHRApplications() {
    console.log('Initializing HR Applications module...');
    await loadHRApplications();
}

/**
 * Load applications from Firebase
 */
async function loadHRApplications() {
    const db = window.db || (typeof firebase !== 'undefined' ? firebase.firestore() : null);
    if (!db) {
        console.error('Firebase not available');
        return;
    }

    try {
        const snapshot = await db.collection('job_applications')
            .orderBy('submittedAt', 'desc')
            .get();

        hrApplications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`Loaded ${hrApplications.length} job applications`);
        renderHRApplications();
    } catch (error) {
        console.error('Error loading applications:', error);
    }
}

/**
 * Render HR Applications page
 */
function renderHRApplications() {
    const container = document.querySelector('.dashboard');
    if (!container) return;

    const stats = getApplicationStats();
    const filteredApps = filterAndSortApplications();

    container.innerHTML = `
        <div class="page-content" style="padding: 24px;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 4px;">
                        <i class="fas fa-user-plus" style="color: var(--accent-primary); margin-right: 12px;"></i>
                        Job Applications
                    </h1>
                    <p style="color: var(--text-muted);">Review and manage job applications from candidates</p>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button onclick="copyApplicationLink()" class="btn-secondary" style="padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-link"></i> Copy Public Link
                    </button>
                    <button onclick="loadHRApplications()" class="btn-secondary" style="padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div onclick="setHRFilter('all')" style="background: var(--bg-secondary); border: 1px solid ${hrCurrentFilter === 'all' ? 'var(--accent-primary)' : 'var(--border-color)'}; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s;">
                    <div style="font-size: 28px; font-weight: 700; color: var(--text-primary);">${stats.total}</div>
                    <div style="font-size: 13px; color: var(--text-muted);">Total Applications</div>
                </div>
                <div onclick="setHRFilter('new')" style="background: var(--bg-secondary); border: 1px solid ${hrCurrentFilter === 'new' ? '#3b82f6' : 'var(--border-color)'}; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s;">
                    <div style="font-size: 28px; font-weight: 700; color: #3b82f6;">${stats.new}</div>
                    <div style="font-size: 13px; color: var(--text-muted);">New</div>
                </div>
                <div onclick="setHRFilter('reviewing')" style="background: var(--bg-secondary); border: 1px solid ${hrCurrentFilter === 'reviewing' ? '#f59e0b' : 'var(--border-color)'}; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s;">
                    <div style="font-size: 28px; font-weight: 700; color: #f59e0b;">${stats.reviewing}</div>
                    <div style="font-size: 13px; color: var(--text-muted);">Reviewing</div>
                </div>
                <div onclick="setHRFilter('interview')" style="background: var(--bg-secondary); border: 1px solid ${hrCurrentFilter === 'interview' ? '#8b5cf6' : 'var(--border-color)'}; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s;">
                    <div style="font-size: 28px; font-weight: 700; color: #8b5cf6;">${stats.interview}</div>
                    <div style="font-size: 13px; color: var(--text-muted);">Interview</div>
                </div>
                <div onclick="setHRFilter('hired')" style="background: var(--bg-secondary); border: 1px solid ${hrCurrentFilter === 'hired' ? '#10b981' : 'var(--border-color)'}; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s;">
                    <div style="font-size: 28px; font-weight: 700; color: #10b981;">${stats.hired}</div>
                    <div style="font-size: 13px; color: var(--text-muted);">Hired</div>
                </div>
            </div>

            <!-- Filters & Search -->
            <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                    <input type="text" id="hr-search" placeholder="Search by name, email, position..."
                        oninput="renderHRApplications()"
                        style="width: 100%; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px;">
                </div>
                <select id="hr-sort" onchange="hrCurrentSort = this.value; renderHRApplications()"
                    style="padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; cursor: pointer;">
                    <option value="newest" ${hrCurrentSort === 'newest' ? 'selected' : ''}>Newest First</option>
                    <option value="oldest" ${hrCurrentSort === 'oldest' ? 'selected' : ''}>Oldest First</option>
                    <option value="name" ${hrCurrentSort === 'name' ? 'selected' : ''}>By Name</option>
                    <option value="rating" ${hrCurrentSort === 'rating' ? 'selected' : ''}>By Rating</option>
                </select>
            </div>

            <!-- Applications List -->
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden;">
                ${filteredApps.length === 0 ? `
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                        <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                        <p style="font-size: 16px;">No applications found</p>
                        <p style="font-size: 13px; margin-top: 8px;">Share the application link to start receiving candidates</p>
                    </div>
                ` : `
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color);">
                                <th style="padding: 14px 16px; text-align: left; font-weight: 600; font-size: 13px; color: var(--text-muted);">Candidate</th>
                                <th style="padding: 14px 16px; text-align: left; font-weight: 600; font-size: 13px; color: var(--text-muted);">Position</th>
                                <th style="padding: 14px 16px; text-align: left; font-weight: 600; font-size: 13px; color: var(--text-muted);">Location</th>
                                <th style="padding: 14px 16px; text-align: left; font-weight: 600; font-size: 13px; color: var(--text-muted);">Status</th>
                                <th style="padding: 14px 16px; text-align: left; font-weight: 600; font-size: 13px; color: var(--text-muted);">Rating</th>
                                <th style="padding: 14px 16px; text-align: left; font-weight: 600; font-size: 13px; color: var(--text-muted);">Submitted</th>
                                <th style="padding: 14px 16px; text-align: center; font-weight: 600; font-size: 13px; color: var(--text-muted);">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredApps.map(app => renderApplicationRow(app)).join('')}
                        </tbody>
                    </table>
                `}
            </div>
        </div>

        <!-- Application Detail Modal -->
        <div id="hr-detail-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 1000; overflow-y: auto; padding: 20px;">
            <div id="hr-detail-content" style="max-width: 700px; margin: 20px auto; background: var(--bg-primary); border-radius: 16px; overflow: hidden;">
                <!-- Content injected by openApplicationDetail -->
            </div>
        </div>
    `;
}

/**
 * Render a single application row
 */
function renderApplicationRow(app) {
    const status = HR_STATUS_CONFIG[app.status] || HR_STATUS_CONFIG['new'];
    const submitted = app.submittedAt?.toDate ? app.submittedAt.toDate() : new Date(app.submittedAtLocal);
    const timeAgo = getTimeAgo(submitted);

    return `
        <tr onclick="openApplicationDetail('${app.id}')" style="border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='transparent'">
            <td style="padding: 14px 16px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px;">
                        ${app.firstName?.charAt(0) || '?'}${app.lastName?.charAt(0) || ''}
                    </div>
                    <div>
                        <div style="font-weight: 600; color: var(--text-primary);">${app.firstName} ${app.lastName}</div>
                        <div style="font-size: 12px; color: var(--text-muted);">${app.email}</div>
                    </div>
                </div>
            </td>
            <td style="padding: 14px 16px; color: var(--text-secondary); font-size: 14px;">${app.position || 'N/A'}</td>
            <td style="padding: 14px 16px; color: var(--text-secondary); font-size: 14px;">${app.preferredStore || 'Any'}</td>
            <td style="padding: 14px 16px;">
                <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; background: ${status.color}20; color: ${status.color}; font-size: 12px; font-weight: 500;">
                    <i class="fas ${status.icon}" style="font-size: 10px;"></i>
                    ${status.label}
                </span>
            </td>
            <td style="padding: 14px 16px;">
                ${renderStarRating(app.rating || 0, true)}
            </td>
            <td style="padding: 14px 16px; color: var(--text-muted); font-size: 13px;">${timeAgo}</td>
            <td style="padding: 14px 16px; text-align: center;">
                <div style="display: flex; gap: 8px; justify-content: center;" onclick="event.stopPropagation()">
                    ${app.resumeUrl ? `
                        <a href="${app.resumeUrl}" target="_blank" title="View Resume" style="width: 32px; height: 32px; border-radius: 6px; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--text-muted); text-decoration: none;">
                            <i class="fas fa-file-pdf"></i>
                        </a>
                    ` : ''}
                    <button onclick="openApplicationDetail('${app.id}')" title="View Details" style="width: 32px; height: 32px; border-radius: 6px; background: var(--bg-tertiary); border: none; cursor: pointer; color: var(--text-muted);">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Render star rating
 */
function renderStarRating(rating, small = false) {
    const size = small ? '12px' : '16px';
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        const color = i <= rating ? '#f59e0b' : 'var(--border-color)';
        stars += `<i class="fas fa-star" style="font-size: ${size}; color: ${color};"></i>`;
    }
    return `<div style="display: flex; gap: 2px;">${stars}</div>`;
}

/**
 * Open application detail modal
 */
function openApplicationDetail(appId) {
    const app = hrApplications.find(a => a.id === appId);
    if (!app) return;

    hrSelectedApplication = app;
    const status = HR_STATUS_CONFIG[app.status] || HR_STATUS_CONFIG['new'];
    const submitted = app.submittedAt?.toDate ? app.submittedAt.toDate() : new Date(app.submittedAtLocal);

    const modal = document.getElementById('hr-detail-modal');
    const content = document.getElementById('hr-detail-content');

    content.innerHTML = `
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 24px; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="display: flex; gap: 16px; align-items: center;">
                    <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700;">
                        ${app.firstName?.charAt(0) || '?'}${app.lastName?.charAt(0) || ''}
                    </div>
                    <div>
                        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 4px;">${app.firstName} ${app.lastName}</h2>
                        <p style="opacity: 0.9;">${app.position} • ${app.preferredStore}</p>
                        <p style="font-size: 12px; opacity: 0.7; margin-top: 4px;">Ref: ${app.refNumber}</p>
                    </div>
                </div>
                <button onclick="closeApplicationDetail()" style="background: rgba(255,255,255,0.2); border: none; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; color: white; font-size: 16px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>

        <!-- Content -->
        <div style="padding: 24px;">
            <!-- Status & Rating -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                <div>
                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 8px;">Status</label>
                    <select id="app-status-select" onchange="updateApplicationStatus('${app.id}', this.value)"
                        style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; cursor: pointer;">
                        ${Object.entries(HR_STATUS_CONFIG).map(([key, val]) => `
                            <option value="${key}" ${app.status === key ? 'selected' : ''}>${val.label}</option>
                        `).join('')}
                    </select>
                </div>
                <div>
                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 8px;">Rating</label>
                    <div style="display: flex; gap: 8px;">
                        ${[1,2,3,4,5].map(i => `
                            <button onclick="updateApplicationRating('${app.id}', ${i})"
                                style="background: none; border: none; cursor: pointer; padding: 4px; font-size: 20px; color: ${i <= (app.rating || 0) ? '#f59e0b' : 'var(--border-color)'};">
                                <i class="fas fa-star"></i>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Contact Info -->
            <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted);">
                    <i class="fas fa-address-card" style="margin-right: 8px;"></i>Contact Information
                </h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <span style="font-size: 12px; color: var(--text-muted);">Email</span>
                        <p style="color: var(--text-primary);"><a href="mailto:${app.email}" style="color: var(--accent-primary); text-decoration: none;">${app.email}</a></p>
                    </div>
                    <div>
                        <span style="font-size: 12px; color: var(--text-muted);">Phone</span>
                        <p style="color: var(--text-primary);"><a href="tel:${app.phone}" style="color: var(--accent-primary); text-decoration: none;">${app.phone}</a></p>
                    </div>
                    <div>
                        <span style="font-size: 12px; color: var(--text-muted);">Availability</span>
                        <p style="color: var(--text-primary);">${app.availability || 'Not specified'}</p>
                    </div>
                    <div>
                        <span style="font-size: 12px; color: var(--text-muted);">Submitted</span>
                        <p style="color: var(--text-primary);">${submitted.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </div>
            </div>

            <!-- Experience -->
            ${app.experience ? `
                <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted);">
                        <i class="fas fa-briefcase" style="margin-right: 8px;"></i>Experience
                    </h4>
                    <p style="color: var(--text-primary); white-space: pre-wrap; line-height: 1.6;">${app.experience}</p>
                </div>
            ` : ''}

            <!-- Why Join -->
            ${app.whyJoin ? `
                <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted);">
                        <i class="fas fa-heart" style="margin-right: 8px;"></i>Why They Want to Join
                    </h4>
                    <p style="color: var(--text-primary); white-space: pre-wrap; line-height: 1.6;">${app.whyJoin}</p>
                </div>
            ` : ''}

            <!-- Resume -->
            ${app.resumeUrl ? `
                <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted);">
                        <i class="fas fa-file-pdf" style="margin-right: 8px;"></i>Resume
                    </h4>
                    <a href="${app.resumeUrl}" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: var(--accent-primary); color: white; text-decoration: none; border-radius: 8px; font-size: 14px;">
                        <i class="fas fa-download"></i> Download Resume
                    </a>
                    <span style="margin-left: 12px; color: var(--text-muted); font-size: 13px;">${app.resumeFileName || 'resume.pdf'}</span>
                </div>
            ` : ''}

            <!-- Notes -->
            <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted);">
                    <i class="fas fa-sticky-note" style="margin-right: 8px;"></i>Internal Notes
                </h4>
                <textarea id="app-notes" placeholder="Add notes about this candidate..."
                    style="width: 100%; min-height: 100px; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); font-size: 14px; resize: vertical; font-family: inherit;">${app.notes || ''}</textarea>
                <button onclick="saveApplicationNotes('${app.id}')" style="margin-top: 12px; padding: 10px 20px; background: var(--accent-primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
                    <i class="fas fa-save" style="margin-right: 6px;"></i>Save Notes
                </button>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 12px; flex-wrap: wrap; padding-top: 16px; border-top: 1px solid var(--border-color);">
                <a href="mailto:${app.email}?subject=Your Application at VSU - ${app.refNumber}" style="flex: 1; min-width: 150px; padding: 12px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 8px; text-decoration: none; color: white; text-align: center; font-size: 14px;">
                    <i class="fas fa-envelope" style="margin-right: 6px;"></i>Send Email
                </a>
                <button onclick="deleteApplication('${app.id}')" style="flex: 1; min-width: 150px; padding: 12px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; cursor: pointer; color: #ef4444; font-size: 14px;">
                    <i class="fas fa-trash" style="margin-right: 6px;"></i>Delete
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Close on backdrop click
    modal.onclick = (e) => {
        if (e.target === modal) closeApplicationDetail();
    };
}

/**
 * Close application detail modal
 */
function closeApplicationDetail() {
    const modal = document.getElementById('hr-detail-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    hrSelectedApplication = null;
}

/**
 * Update application status
 */
async function updateApplicationStatus(appId, newStatus) {
    const db = window.db || firebase.firestore();
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : { name: 'System' };

    try {
        await db.collection('job_applications').doc(appId).update({
            status: newStatus,
            reviewedBy: currentUser.name,
            reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
            reviewed: true
        });

        // Update local state
        const app = hrApplications.find(a => a.id === appId);
        if (app) {
            app.status = newStatus;
            app.reviewed = true;
        }

        showToast(`Status updated to ${HR_STATUS_CONFIG[newStatus].label}`, 'success');
        renderHRApplications();

        // Refresh modal if open
        if (hrSelectedApplication && hrSelectedApplication.id === appId) {
            openApplicationDetail(appId);
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showToast('Error updating status', 'error');
    }
}

/**
 * Update application rating
 */
async function updateApplicationRating(appId, rating) {
    const db = window.db || firebase.firestore();

    try {
        await db.collection('job_applications').doc(appId).update({ rating });

        const app = hrApplications.find(a => a.id === appId);
        if (app) app.rating = rating;

        renderHRApplications();

        if (hrSelectedApplication && hrSelectedApplication.id === appId) {
            openApplicationDetail(appId);
        }
    } catch (error) {
        console.error('Error updating rating:', error);
        showToast('Error updating rating', 'error');
    }
}

/**
 * Save application notes
 */
async function saveApplicationNotes(appId) {
    const db = window.db || firebase.firestore();
    const notes = document.getElementById('app-notes').value;

    try {
        await db.collection('job_applications').doc(appId).update({ notes });

        const app = hrApplications.find(a => a.id === appId);
        if (app) app.notes = notes;

        showToast('Notes saved successfully', 'success');
    } catch (error) {
        console.error('Error saving notes:', error);
        showToast('Error saving notes', 'error');
    }
}

/**
 * Delete application
 */
async function deleteApplication(appId) {
    if (!confirm('Are you sure you want to delete this application? This cannot be undone.')) return;

    const db = window.db || firebase.firestore();

    try {
        await db.collection('job_applications').doc(appId).delete();
        hrApplications = hrApplications.filter(a => a.id !== appId);
        closeApplicationDetail();
        renderHRApplications();
        showToast('Application deleted', 'success');
    } catch (error) {
        console.error('Error deleting application:', error);
        showToast('Error deleting application', 'error');
    }
}

/**
 * Copy public application link
 */
function copyApplicationLink() {
    const link = window.location.origin + '/joinus.html';
    navigator.clipboard.writeText(link).then(() => {
        showToast('Application link copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback
        prompt('Copy this link:', link);
    });
}

/**
 * Set filter and re-render
 */
function setHRFilter(filter) {
    hrCurrentFilter = filter;
    renderHRApplications();
}

/**
 * Filter and sort applications
 */
function filterAndSortApplications() {
    let filtered = [...hrApplications];

    // Search filter
    const searchInput = document.getElementById('hr-search');
    if (searchInput && searchInput.value) {
        const query = searchInput.value.toLowerCase();
        filtered = filtered.filter(app =>
            (app.firstName + ' ' + app.lastName).toLowerCase().includes(query) ||
            app.email?.toLowerCase().includes(query) ||
            app.position?.toLowerCase().includes(query) ||
            app.refNumber?.toLowerCase().includes(query)
        );
    }

    // Status filter
    if (hrCurrentFilter !== 'all') {
        filtered = filtered.filter(app => app.status === hrCurrentFilter);
    }

    // Sort
    switch (hrCurrentSort) {
        case 'newest':
            filtered.sort((a, b) => {
                const dateA = a.submittedAt?.toDate?.() || new Date(a.submittedAtLocal);
                const dateB = b.submittedAt?.toDate?.() || new Date(b.submittedAtLocal);
                return dateB - dateA;
            });
            break;
        case 'oldest':
            filtered.sort((a, b) => {
                const dateA = a.submittedAt?.toDate?.() || new Date(a.submittedAtLocal);
                const dateB = b.submittedAt?.toDate?.() || new Date(b.submittedAtLocal);
                return dateA - dateB;
            });
            break;
        case 'name':
            filtered.sort((a, b) => (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName));
            break;
        case 'rating':
            filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
    }

    return filtered;
}

/**
 * Get application statistics
 */
function getApplicationStats() {
    return {
        total: hrApplications.length,
        new: hrApplications.filter(a => a.status === 'new').length,
        reviewing: hrApplications.filter(a => a.status === 'reviewing').length,
        interview: hrApplications.filter(a => a.status === 'interview').length,
        hired: hrApplications.filter(a => a.status === 'hired').length,
        rejected: hrApplications.filter(a => a.status === 'rejected').length
    };
}

/**
 * Get relative time
 */
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 14px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        font-size: 14px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}" style="margin-right: 8px;"></i>${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animation styles
const hrStyles = document.createElement('style');
hrStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(hrStyles);

// Export functions
window.initializeHRApplications = initializeHRApplications;
window.loadHRApplications = loadHRApplications;
window.renderHRApplications = renderHRApplications;
window.openApplicationDetail = openApplicationDetail;
window.closeApplicationDetail = closeApplicationDetail;
window.updateApplicationStatus = updateApplicationStatus;
window.updateApplicationRating = updateApplicationRating;
window.saveApplicationNotes = saveApplicationNotes;
window.deleteApplication = deleteApplication;
window.copyApplicationLink = copyApplicationLink;
window.setHRFilter = setHRFilter;
