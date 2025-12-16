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
                        <p style="color: var(--text-primary);">${app.phone}</p>
                    </div>
                    <div style="grid-column: span 2;">
                        <span style="font-size: 12px; color: var(--text-muted);">Address</span>
                        <p style="color: var(--text-primary);">${app.streetAddress || ''} ${app.city || ''}, ${app.state || ''} ${app.zipCode || ''}</p>
                    </div>
                    <div>
                        <span style="font-size: 12px; color: var(--text-muted);">Emergency Contact</span>
                        <p style="color: var(--text-primary);">${app.emergencyContact || 'Not provided'}</p>
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

            <!-- Legal & Background -->
            <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted);">
                    <i class="fas fa-gavel" style="margin-right: 8px;"></i>Legal & Background
                </h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <span style="font-size: 12px; color: var(--text-muted);">U.S. Citizen</span>
                        <p style="color: var(--text-primary);">${app.usCitizen || 'Not answered'}</p>
                    </div>
                    <div>
                        <span style="font-size: 12px; color: var(--text-muted);">Authorized to Work in U.S.</span>
                        <p style="color: var(--text-primary);">${app.workAuthorized || 'Not answered'}</p>
                    </div>
                    <div>
                        <span style="font-size: 12px; color: var(--text-muted);">Worked for VSU Before</span>
                        <p style="color: var(--text-primary);">${app.workedBefore || 'No'} ${app.workedBeforeDetails ? `(${app.workedBeforeDetails})` : ''}</p>
                    </div>
                    <div>
                        <span style="font-size: 12px; color: var(--text-muted);">Felony Conviction</span>
                        <p style="color: ${app.felonyConviction === 'Yes' ? '#ef4444' : 'var(--text-primary)'};">${app.felonyConviction || 'No'}</p>
                    </div>
                    ${app.felonyDetails ? `
                        <div style="grid-column: span 2;">
                            <span style="font-size: 12px; color: var(--text-muted);">Felony Details</span>
                            <p style="color: var(--text-primary); white-space: pre-wrap;">${app.felonyDetails}</p>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Education -->
            <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted);">
                    <i class="fas fa-graduation-cap" style="margin-right: 8px;"></i>Education
                </h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <span style="font-size: 12px; color: var(--text-muted);">Level</span>
                        <p style="color: var(--text-primary);">${app.educationLevel || 'Not specified'}</p>
                    </div>
                    <div>
                        <span style="font-size: 12px; color: var(--text-muted);">School</span>
                        <p style="color: var(--text-primary);">${app.schoolName || 'Not specified'}</p>
                    </div>
                    ${app.schoolAddress ? `
                        <div style="grid-column: span 2;">
                            <span style="font-size: 12px; color: var(--text-muted);">School Address</span>
                            <p style="color: var(--text-primary);">${app.schoolAddress}</p>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Previous Employment -->
            ${app.previousJobs && app.previousJobs.length > 0 ? `
                <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted);">
                        <i class="fas fa-building" style="margin-right: 8px;"></i>Previous Employment
                    </h4>
                    ${app.previousJobs.map((job, index) => `
                        <div style="padding: 12px; background: var(--bg-primary); border-radius: 8px; margin-bottom: 8px; border: 1px solid var(--border-color);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <strong style="color: var(--text-primary);">${job.title || 'Position'} at ${job.company || 'Company'}</strong>
                                <span style="font-size: 12px; color: var(--text-muted);">${job.startDate || ''} - ${job.endDate || ''}</span>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
                                <div><span style="color: var(--text-muted);">Supervisor:</span> ${job.supervisor || 'N/A'}</div>
                                <div><span style="color: var(--text-muted);">Can Contact:</span> ${job.canContact || 'N/A'}</div>
                                <div style="grid-column: span 2;"><span style="color: var(--text-muted);">Reason for Leaving:</span> ${job.reasonLeaving || 'N/A'}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- References -->
            ${app.references && app.references.length > 0 ? `
                <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted);">
                        <i class="fas fa-users" style="margin-right: 8px;"></i>Professional References
                    </h4>
                    ${app.references.map((ref, index) => ref.name ? `
                        <div style="padding: 12px; background: var(--bg-primary); border-radius: 8px; margin-bottom: 8px; border: 1px solid var(--border-color);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <strong style="color: var(--text-primary);">${ref.name}</strong>
                                <span style="font-size: 12px; color: var(--accent-primary);">${ref.relationship || ''}</span>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
                                <div><span style="color: var(--text-muted);">Company:</span> ${ref.company || 'N/A'}</div>
                                <div><span style="color: var(--text-muted);">Phone:</span> ${ref.phone || 'N/A'}</div>
                                ${ref.address ? `<div style="grid-column: span 2;"><span style="color: var(--text-muted);">Address:</span> ${ref.address}</div>` : ''}
                            </div>
                        </div>
                    ` : '').join('')}
                </div>
            ` : ''}

            <!-- Availability Schedule -->
            ${app.availabilitySchedule ? `
                <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted);">
                        <i class="fas fa-calendar-alt" style="margin-right: 8px;"></i>Weekly Availability
                    </h4>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                            <thead>
                                <tr style="background: var(--bg-tertiary);">
                                    <th style="padding: 8px; border: 1px solid var(--border-color); text-align: left;">Day</th>
                                    <th style="padding: 8px; border: 1px solid var(--border-color);">All Day</th>
                                    <th style="padding: 8px; border: 1px solid var(--border-color);">Morning</th>
                                    <th style="padding: 8px; border: 1px solid var(--border-color);">Night</th>
                                    <th style="padding: 8px; border: 1px solid var(--border-color);">Other</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => `
                                    <tr>
                                        <td style="padding: 8px; border: 1px solid var(--border-color); font-weight: 500; text-transform: capitalize;">${day}</td>
                                        <td style="padding: 8px; border: 1px solid var(--border-color); text-align: center; color: ${app.availabilitySchedule[day]?.allDay ? '#10b981' : 'var(--text-muted)'};">${app.availabilitySchedule[day]?.allDay ? '✓' : '—'}</td>
                                        <td style="padding: 8px; border: 1px solid var(--border-color); text-align: center; color: ${app.availabilitySchedule[day]?.morning ? '#10b981' : 'var(--text-muted)'};">${app.availabilitySchedule[day]?.morning ? '✓' : '—'}</td>
                                        <td style="padding: 8px; border: 1px solid var(--border-color); text-align: center; color: ${app.availabilitySchedule[day]?.night ? '#10b981' : 'var(--text-muted)'};">${app.availabilitySchedule[day]?.night ? '✓' : '—'}</td>
                                        <td style="padding: 8px; border: 1px solid var(--border-color); text-align: center; color: ${app.availabilitySchedule[day]?.other ? '#10b981' : 'var(--text-muted)'};">${app.availabilitySchedule[day]?.other ? '✓' : '—'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ${app.locationPreferenceCommute ? `
                        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                            <span style="font-size: 12px; color: var(--text-muted);">Location Preference (Commute):</span>
                            <p style="color: var(--text-primary); margin-top: 4px;">${app.locationPreferenceCommute}</p>
                        </div>
                    ` : ''}
                </div>
            ` : ''}

            <!-- Product Knowledge Quiz -->
            ${app.productKnowledge ? `
                <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted);">
                        <i class="fas fa-clipboard-list" style="margin-right: 8px;"></i>Product Knowledge Quiz
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px;">
                        ${Object.entries({
                            'Disposable Vapes': app.productKnowledge.disposableVapes,
                            'Rechargeable Disposable': app.productKnowledge.rechargeableDisposable,
                            'Sub Ohm Juice': app.productKnowledge.subOhmJuice,
                            'Salt Nicotine': app.productKnowledge.saltNicotine,
                            'Pod/Mod Devices': app.productKnowledge.podModDevices,
                            'Sub Ohm Devices': app.productKnowledge.subOhmDevices,
                            'Replaceable Coils': app.productKnowledge.replaceableCoils,
                            'RDA': app.productKnowledge.rda,
                            'RDTA': app.productKnowledge.rdta,
                            'Squonk Mods': app.productKnowledge.squonkMods,
                            'Mechanical Mods': app.productKnowledge.mechanicalMods,
                            'Refillable Pods': app.productKnowledge.refillablePods,
                            'Water Pipes': app.productKnowledge.waterPipes,
                            'Bubblers': app.productKnowledge.bubblers,
                            'Bangers': app.productKnowledge.bangers,
                            'Detox Drinks': app.productKnowledge.detoxDrinks,
                            'Rigs': app.productKnowledge.rigs,
                            'Herbal Vaporizers': app.productKnowledge.herbalVaporizers,
                            'Wax Vapes': app.productKnowledge.waxVapes,
                            'Hookah': app.productKnowledge.hookah,
                            'Shisha': app.productKnowledge.shisha,
                            'Nectar Collectors': app.productKnowledge.nectarCollectors,
                            'One Hitters': app.productKnowledge.oneHitters,
                            'Rolling Papers': app.productKnowledge.rollingPapers,
                            'Cleaners': app.productKnowledge.cleaners,
                            'Blunts/Wraps': app.productKnowledge.bluntsWraps
                        }).map(([product, score]) => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--bg-primary); border-radius: 6px; border: 1px solid var(--border-color);">
                                <span style="font-size: 11px; color: var(--text-primary);">${product}</span>
                                <span style="font-size: 12px; font-weight: 600; color: ${score >= 7 ? '#10b981' : score >= 4 ? '#f59e0b' : 'var(--text-muted)'};">${score || 0}/10</span>
                            </div>
                        `).join('')}
                    </div>
                    ${app.additionalProductKnowledge ? `
                        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                            <span style="font-size: 12px; color: var(--text-muted);">Additional Product Knowledge:</span>
                            <p style="color: var(--text-primary); margin-top: 4px; white-space: pre-wrap;">${app.additionalProductKnowledge}</p>
                        </div>
                    ` : ''}
                    <div style="margin-top: 12px; padding: 10px; background: var(--bg-primary); border-radius: 8px; border: 1px solid var(--border-color);">
                        <span style="font-size: 12px; color: var(--text-muted);">First time working in vape/smoke shop:</span>
                        <span style="font-size: 13px; font-weight: 600; color: ${app.firstTimeVapeShop === 'No' ? '#10b981' : '#f59e0b'}; margin-left: 8px;">${app.firstTimeVapeShop || 'Not answered'}</span>
                    </div>
                </div>
            ` : ''}

            <!-- Military Service -->
            ${app.militaryService === 'Yes' ? `
                <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted);">
                        <i class="fas fa-medal" style="margin-right: 8px;"></i>Military Service
                    </h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <span style="font-size: 12px; color: var(--text-muted);">Branch</span>
                            <p style="color: var(--text-primary);">${app.militaryBranch || 'Not specified'}</p>
                        </div>
                        <div>
                            <span style="font-size: 12px; color: var(--text-muted);">Rank at Discharge</span>
                            <p style="color: var(--text-primary);">${app.militaryRank || 'Not specified'}</p>
                        </div>
                        <div>
                            <span style="font-size: 12px; color: var(--text-muted);">Service Period</span>
                            <p style="color: var(--text-primary);">${app.militaryFrom || '?'} - ${app.militaryTo || '?'}</p>
                        </div>
                        <div>
                            <span style="font-size: 12px; color: var(--text-muted);">Type of Discharge</span>
                            <p style="color: ${app.dischargeType === 'Honorable' ? '#10b981' : app.dischargeType === 'General' ? '#f59e0b' : '#ef4444'};">${app.dischargeType || 'Not specified'}</p>
                        </div>
                        ${app.dischargeExplanation ? `
                            <div style="grid-column: span 2;">
                                <span style="font-size: 12px; color: var(--text-muted);">Discharge Explanation</span>
                                <p style="color: var(--text-primary); white-space: pre-wrap;">${app.dischargeExplanation}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}

            <!-- Essay Questions -->
            ${(app.essayContribution || app.essayMultitasking) ? `
                <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted);">
                        <i class="fas fa-pen-fancy" style="margin-right: 8px;"></i>Essay Questions
                    </h4>
                    ${app.essayContribution ? `
                        <div style="margin-bottom: 16px;">
                            <span style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 8px;">How can your experience contribute to our company's growth?</span>
                            <p style="color: var(--text-primary); white-space: pre-wrap; line-height: 1.6; padding: 12px; background: var(--bg-primary); border-radius: 8px; border: 1px solid var(--border-color);">${app.essayContribution}</p>
                        </div>
                    ` : ''}
                    ${app.essayMultitasking ? `
                        <div>
                            <span style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 8px;">Can you work efficiently with multiple customers? What skills will you implement?</span>
                            <p style="color: var(--text-primary); white-space: pre-wrap; line-height: 1.6; padding: 12px; background: var(--bg-primary); border-radius: 8px; border: 1px solid var(--border-color);">${app.essayMultitasking}</p>
                        </div>
                    ` : ''}
                </div>
            ` : ''}

            <!-- Additional Info -->
            ${app.additionalInfo ? `
                <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted);">
                        <i class="fas fa-info-circle" style="margin-right: 8px;"></i>Additional Information
                    </h4>
                    <p style="color: var(--text-primary); white-space: pre-wrap; line-height: 1.6;">${app.additionalInfo}</p>
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

            <!-- Signature -->
            ${app.signatureName ? `
                <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted);">
                        <i class="fas fa-file-signature" style="margin-right: 8px;"></i>Signature & Certification
                    </h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <span style="font-size: 12px; color: var(--text-muted);">Digital Signature</span>
                            <p style="color: var(--text-primary); font-style: italic; font-size: 16px;">${app.signatureName}</p>
                        </div>
                        <div>
                            <span style="font-size: 12px; color: var(--text-muted);">Date Signed</span>
                            <p style="color: var(--text-primary);">${app.signatureDate || 'Not recorded'}</p>
                        </div>
                    </div>
                    <div style="margin-top: 12px; padding: 10px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2);">
                        <p style="font-size: 12px; color: #10b981;">
                            <i class="fas fa-check-circle" style="margin-right: 6px;"></i>
                            Applicant has certified all information is accurate and authorized background check
                        </p>
                    </div>
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
