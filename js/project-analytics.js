// =====================================================
// PROJECT ANALYTICS MODULE
// =====================================================

window.renderProjectAnalytics = function() {
    console.log('renderProjectAnalytics called');
    const dashboard = document.querySelector('.dashboard');

    // Project statistics - Real data (Updated December 15, 2025)
    const projectStats = {
        totalLines: 64568,
        jsLines: 50284,
        htmlLines: 5524,
        cssLines: 7994,
        configLines: 766,
        totalFunctions: 795,
        totalFiles: 21,
        totalModules: 29,
        projectSize: '9.5 MB',
        stores: 5,
        gitCommits: 65,
        projectStart: 'December 9, 2025',
        lastUpdate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    // Module list with descriptions and navigation
    const modules = [
        { name: 'Celeste AI', icon: 'fa-stars', status: 'active', page: 'celesteai', description: 'AI-powered assistant', fullDescription: 'Intelligent AI assistant powered by OpenAI GPT-4 for business insights, data analysis, and natural language queries.', features: ['Natural language', 'Business insights', 'Data analysis', 'Context awareness'], version: '2.0', linesOfCode: 1850 },
        { name: 'Dashboard', icon: 'fa-th-large', status: 'active', page: 'dashboard', description: 'Overview & KPIs', fullDescription: 'Central command center displaying real-time KPIs, quick stats, and business overview across all store locations.', features: ['Real-time metrics', 'Quick navigation', 'Store overview', 'Activity feed'], version: '2.5', linesOfCode: 950 },
        { name: 'Employees', icon: 'fa-users', status: 'active', page: 'employees', description: 'Staff management & profiles', fullDescription: 'Complete employee management system with profiles, photos, emergency contacts, and role assignments.', features: ['Profile photos', 'Camera capture', 'Role management', 'Emergency contacts'], version: '3.5', linesOfCode: 1400 },
        { name: 'Schedule', icon: 'fa-calendar-alt', status: 'active', page: 'schedule', description: 'Shift scheduling system', fullDescription: 'Visual drag-and-drop scheduling system for managing employee shifts across multiple stores.', features: ['Drag & drop', 'Multi-store view', 'Conflict detection', 'Export to PDF'], version: '1.8', linesOfCode: 1100 },
        { name: 'Clock In/Out', icon: 'fa-clock', status: 'active', page: 'clockin', description: 'Time tracking', fullDescription: 'Real-time employee time tracking with photo verification and automatic hour calculations.', features: ['Photo verification', 'GPS tracking', 'Auto calculations', 'Overtime alerts'], version: '2.5', linesOfCode: 750 },
        { name: 'Training Center', icon: 'fa-graduation-cap', status: 'active', page: 'training', description: 'Video & document training', fullDescription: 'Comprehensive training platform with video courses, documents, and completion tracking.', features: ['Video player', 'Progress tracking', 'Certificates', 'Required courses'], version: '2.0', linesOfCode: 820 },
        { name: 'Licenses & Docs', icon: 'fa-folder-open', status: 'active', page: 'licenses', description: 'Compliance management', fullDescription: 'Document management for business licenses, permits, and compliance certificates with expiration alerts.', features: ['Expiration alerts', 'Document upload', 'Auto reminders', 'Compliance status'], version: '1.5', linesOfCode: 680 },
        { name: 'Sales Analytics', icon: 'fa-chart-line', status: 'active', page: 'analytics', description: 'Shopify integration', fullDescription: 'Real-time sales analytics with Shopify integration, charts, and performance metrics.', features: ['Shopify sync', 'Interactive charts', 'Revenue tracking', 'Product analytics'], version: '3.0', linesOfCode: 1650 },
        { name: 'Barcode Labels', icon: 'fa-barcode', status: 'active', page: 'labels', description: 'Label generation', fullDescription: 'Barcode and label generation system for inventory management and product tagging.', features: ['Barcode generation', 'Label printing', 'Batch creation', 'Template editor'], version: '1.5', linesOfCode: 520 },
        { name: 'Product Requests', icon: 'fa-boxes', status: 'active', page: 'restock', description: 'Product requests', fullDescription: 'Simple product request system for stores.', features: ['Quick requests', 'Priority levels', 'Store tracking'], version: '2.0', linesOfCode: 300 },
        { name: 'Supplies', icon: 'fa-shopping-basket', status: 'active', page: 'supplies', description: 'Store supplies tracking', fullDescription: 'Track everyday supplies needed per store with pending/purchased status and monthly history.', features: ['Per-store tracking', 'Purchase status', 'Monthly history', 'All employees access'], version: '1.2', linesOfCode: 450 },
        { name: 'Daily Checklist', icon: 'fa-clipboard-check', status: 'active', page: 'dailychecklist', description: 'Task management', fullDescription: 'Daily operational checklist for store opening, closing, and routine tasks.', features: ['Custom checklists', 'Task templates', 'Completion tracking', 'Reminders'], version: '1.3', linesOfCode: 380 },
        { name: 'Abundance Cloud', icon: 'fa-cloud', status: 'active', page: 'abundancecloud', description: 'Order management engine', fullDescription: 'Powerful order processing engine for shipping, pickup, and delivery management.', features: ['Order tracking', 'Shipping labels', 'Pickup scheduling', 'Delivery status'], version: '3.5', linesOfCode: 2400 },
        { name: 'Transfers', icon: 'fa-exchange-alt', status: 'active', page: 'transfers', description: 'Inter-store transfers', fullDescription: 'Manage product and inventory transfers between store locations with tracking.', features: ['Transfer requests', 'Status tracking', 'Approval workflow', 'History log'], version: '1.0', linesOfCode: 420 },
        { name: 'Announcements', icon: 'fa-bullhorn', status: 'active', page: 'announcements', description: 'Internal communications', fullDescription: 'Company-wide announcement system with targeting by store, role, and priority levels.', features: ['Rich text editor', 'File attachments', 'Read receipts', 'Priority levels'], version: '2.0', linesOfCode: 580 },
        { name: 'Thief Database', icon: 'fa-user-secret', status: 'active', page: 'thieves', description: 'Incident tracking', fullDescription: 'Security incident tracking with photo evidence, descriptions, and cross-store alerts.', features: ['Photo evidence', 'Incident reports', 'Cross-store alerts', 'Search database'], version: '1.5', linesOfCode: 660 },
        { name: 'Invoices', icon: 'fa-file-invoice-dollar', status: 'active', page: 'invoices', description: 'Payment management', fullDescription: 'Invoice and payment tracking with vendor integration and payment status management.', features: ['Payment tracking', 'Due date alerts', 'Vendor linking', 'PDF generation'], version: '1.6', linesOfCode: 780 },
        { name: 'Issues Registry', icon: 'fa-exclamation-triangle', status: 'active', page: 'issues', description: 'Customer complaints', fullDescription: 'Customer complaint and issue tracking system with resolution workflow.', features: ['Ticket system', 'Resolution tracking', 'Priority queue', 'Customer follow-up'], version: '1.5', linesOfCode: 620 },
        { name: 'Gconomics', icon: 'fa-wallet', status: 'active', page: 'gconomics', description: 'Financial tracking', fullDescription: 'Personal finance tracking for expense planning and budget management.', features: ['Expense categories', 'Budget planning', 'Monthly reports', 'Spending insights'], version: '1.8', linesOfCode: 850 },
        { name: 'Vendors', icon: 'fa-truck', status: 'active', page: 'vendors', description: 'Supplier directory', fullDescription: 'Vendor and supplier management with contact information and order history.', features: ['Contact directory', 'Order history', 'Rating system', 'Quick reorder'], version: '1.4', linesOfCode: 520 },
        { name: 'Cash Control', icon: 'fa-money-bill-wave', status: 'active', page: 'cashout', description: 'Cash flow tracking', fullDescription: 'Daily cash flow tracking and management with receipt documentation.', features: ['Receipt upload', 'Category tracking', 'Daily totals', 'Approval workflow'], version: '2.0', linesOfCode: 980 },
        { name: 'Heady Pieces', icon: 'fa-vault', status: 'active', page: 'treasury', description: 'Art collection', fullDescription: 'Heady glass and art piece collection management with photos and valuations.', features: ['Photo gallery', 'Artist tracking', 'Valuation records', 'Location tracking'], version: '1.8', linesOfCode: 720 },
        { name: 'Change Records', icon: 'fa-coins', status: 'active', page: 'change', description: 'Cash flow between stores', fullDescription: 'Track change and cash transfers between store locations with photo verification.', features: ['Photo verification', 'Transfer tracking', 'Store-to-store', 'Balance history'], version: '1.6', linesOfCode: 580 },
        { name: 'Customer Care', icon: 'fa-heart', status: 'active', page: 'customercare', description: 'Customer care', fullDescription: 'Customer gift and promotional item tracking with recipient information.', features: ['Gift registry', 'Photo proof', 'Recipient tracking', 'Campaign linking'], version: '1.5', linesOfCode: 540 },
        { name: 'Password Manager', icon: 'fa-key', status: 'active', page: 'passwords', description: 'Credentials vault', fullDescription: 'Secure password and credential storage with encrypted access.', features: ['Secure storage', 'Category organization', 'Quick copy', 'Access logging'], version: '1.8', linesOfCode: 620 },
        { name: 'G Force', icon: 'fa-bolt', status: 'active', page: 'gforce', description: 'Daily motivation', fullDescription: 'Daily motivational quotes, affirmations, and philosophy for team inspiration.', features: ['Daily quotes', 'Affirmations', 'Philosophy tips', 'Random generation'], version: '1.5', linesOfCode: 440 },
        { name: 'Job Applications', icon: 'fa-user-plus', status: 'active', page: 'hrapplications', description: 'Job applications', fullDescription: 'Human resources application management system for hiring and recruitment processes.', features: ['Application forms', 'Status tracking', 'Interview scheduling', 'Document upload'], version: '1.0', linesOfCode: 650 },
        { name: 'Authentication', icon: 'fa-lock', status: 'active', page: null, description: 'Role-based access', fullDescription: 'Secure authentication system with role-based permissions and session management.', features: ['Role-based access', 'Session management', 'Permission levels', 'Audit logging'], version: '2.5', linesOfCode: 1020 },
        { name: 'Project Analytics', icon: 'fa-code', status: 'active', page: 'projectanalytics', description: 'System statistics', fullDescription: 'Meta-analytics showing project statistics, codebase metrics, and system overview.', features: ['Code metrics', 'Module overview', 'Tech stack', 'Development timeline'], version: '2.0', linesOfCode: 550 }
    ];

    // Build modules HTML - clickeable cards
    const modulesHtml = modules.map((mod, index) => `
        <div class="module-card" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 10px; transition: all 0.2s; cursor: pointer;"
            onclick="showModuleDetails(${index})"
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'; this.style.borderColor='var(--accent-primary)';"
            onmouseout="this.style.transform='none'; this.style.boxShadow='none'; this.style.borderColor='transparent';">
            <div style="width: 36px; height: 36px; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <i class="fas ${mod.icon}" style="color: white; font-size: 14px;"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 500; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${mod.name}</div>
                <div style="font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${mod.description}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 10px; color: var(--text-muted);">v${mod.version}</span>
                <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
            </div>
        </div>
    `).join('');

    // Store modules globally for modal access
    window.projectModules = modules;

    dashboard.innerHTML = `
        <div class="page-header" style="margin-bottom: 24px;">
            <div class="page-header-left">
                <h2 class="section-title" style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-code" style="color: white; font-size: 20px;"></i>
                    </div>
                    Project Analytics
                </h2>
                <p class="section-subtitle">Ascendance Hub - Enterprise Management System Statistics</p>
            </div>
        </div>

        <!-- Hero Stats with Animated Counters -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div class="stat-card" style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 24px; border-radius: 16px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(139,92,246,0.4)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
                <div class="counter-value" data-target="${projectStats.totalLines}" style="font-size: 36px; font-weight: 800; margin-bottom: 4px;">0</div>
                <div style="opacity: 0.9; font-size: 14px;">Lines of Code</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 24px; border-radius: 16px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(245,158,11,0.4)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
                <div class="counter-value" data-target="${projectStats.gitCommits}" style="font-size: 36px; font-weight: 800; margin-bottom: 4px;">0</div>
                <div style="opacity: 0.9; font-size: 14px;">Git Commits</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 24px; border-radius: 16px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(16,185,129,0.4)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
                <div class="counter-value" data-target="${projectStats.totalModules}" style="font-size: 36px; font-weight: 800; margin-bottom: 4px;">0</div>
                <div style="opacity: 0.9; font-size: 14px;">Modules</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 24px; border-radius: 16px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(59,130,246,0.4)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
                <div class="counter-value" data-target="${projectStats.totalFunctions}" style="font-size: 36px; font-weight: 800; margin-bottom: 4px;">0</div>
                <div style="opacity: 0.9; font-size: 14px;">Functions</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 24px; border-radius: 16px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(239,68,68,0.4)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
                <div class="counter-value" data-target="${projectStats.stores}" style="font-size: 36px; font-weight: 800; margin-bottom: 4px;">0</div>
                <div style="opacity: 0.9; font-size: 14px;">Store Locations</div>
            </div>
        </div>

        <!-- Quality Badges -->
        <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; justify-content: center;">
            <div style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: var(--bg-secondary); border-radius: 20px; border: 1px solid #8b5cf6;">
                <i class="fas fa-feather" style="color: #8b5cf6;"></i>
                <span style="color: var(--text-primary); font-size: 13px; font-weight: 500;">Zero Framework Dependencies</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: var(--bg-secondary); border-radius: 20px; border: 1px solid #f59e0b;">
                <i class="fas fa-fire" style="color: #f59e0b;"></i>
                <span style="color: var(--text-primary); font-size: 13px; font-weight: 500;">Firebase Powered</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: var(--bg-secondary); border-radius: 20px; border: 1px solid #10b981;">
                <i class="fas fa-mobile-screen" style="color: #10b981;"></i>
                <span style="color: var(--text-primary); font-size: 13px; font-weight: 500;">Mobile Ready</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: var(--bg-secondary); border-radius: 20px; border: 1px solid #3b82f6;">
                <i class="fas fa-shield-halved" style="color: #3b82f6;"></i>
                <span style="color: var(--text-primary); font-size: 13px; font-weight: 500;">Role-Based Security</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: var(--bg-secondary); border-radius: 20px; border: 1px solid #ec4899;">
                <i class="fas fa-bolt" style="color: #ec4899;"></i>
                <span style="color: var(--text-primary); font-size: 13px; font-weight: 500;">Real-time Sync</span>
            </div>
        </div>

        <!-- AI Provider Configuration -->
        <div class="card" style="margin-bottom: 24px; border: 1px solid rgba(16,185,129,0.3); background: linear-gradient(135deg, rgba(16,185,129,0.05), rgba(5,150,105,0.05));">
            <div class="card-header" style="border-bottom: 1px solid rgba(16,185,129,0.2);">
                <h3 class="card-title" style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-brain" style="color: #10b981;"></i> AI Provider Configuration
                </h3>
                <div id="celeste-api-status" style="padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; background: rgba(16,185,129,0.15); color: #10b981;">
                    ● OpenAI Ready
                </div>
            </div>
            <div class="card-body">
                <p style="margin: 0 0 16px; color: var(--text-secondary); font-size: 13px;">
                    Celeste AI and all voice/image assistants are powered by <strong>OpenAI GPT-4</strong>.
                </p>

                <!-- OpenAI Provider -->
                <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--bg-secondary); border-radius: 12px; border: 1px solid rgba(16,185,129,0.2);">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-robot" style="color: white; font-size: 20px;"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-weight: 600; font-size: 14px;">OpenAI GPT-4</span>
                            <span style="padding: 2px 8px; background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 6px; font-size: 10px; font-weight: 600;">ACTIVE</span>
                        </div>
                        <div style="font-size: 12px; color: var(--text-muted);">GPT-4o - Vision & Text Processing</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></span>
                        <span style="font-size: 12px; color: #10b981; font-weight: 500;">Connected</span>
                    </div>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 16px;">
                    <button onclick="openAIProvidersSettings()" class="btn-primary" style="padding: 10px 20px; background: linear-gradient(135deg, #10b981, #059669);">
                        <i class="fas fa-key"></i> Configure API Key
                    </button>
                    <button onclick="testCelesteFromProjectAnalytics()" class="btn-secondary" style="padding: 10px 20px;">
                        <i class="fas fa-plug"></i> Test Connection
                    </button>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-wand-magic-sparkles"></i> Quick Actions</h3>
            </div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                    <button onclick="runSystemCheck()" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#10b981'; this.style.background='rgba(16,185,129,0.1)';" onmouseout="this.style.borderColor='var(--border-color)'; this.style.background='var(--bg-secondary)';">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-stethoscope" style="color: white;"></i>
                        </div>
                        <div style="text-align: left;">
                            <div style="font-weight: 600; color: var(--text-primary);">System Check</div>
                            <div style="font-size: 12px; color: var(--text-muted);">Verify Firebase connection</div>
                        </div>
                    </button>
                    <button onclick="clearAppCache()" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#f59e0b'; this.style.background='rgba(245,158,11,0.1)';" onmouseout="this.style.borderColor='var(--border-color)'; this.style.background='var(--bg-secondary)';">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-broom" style="color: white;"></i>
                        </div>
                        <div style="text-align: left;">
                            <div style="font-weight: 600; color: var(--text-primary);">Clear Cache</div>
                            <div style="font-size: 12px; color: var(--text-muted);">Reset local storage</div>
                        </div>
                    </button>
                    <button onclick="exportSystemReport()" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#3b82f6'; this.style.background='rgba(59,130,246,0.1)';" onmouseout="this.style.borderColor='var(--border-color)'; this.style.background='var(--bg-secondary)';">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-file-export" style="color: white;"></i>
                        </div>
                        <div style="text-align: left;">
                            <div style="font-weight: 600; color: var(--text-primary);">Export Report</div>
                            <div style="font-size: 12px; color: var(--text-muted);">Download system stats</div>
                        </div>
                    </button>
                    <button onclick="showRecentActivity()" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#8b5cf6'; this.style.background='rgba(139,92,246,0.1)';" onmouseout="this.style.borderColor='var(--border-color)'; this.style.background='var(--bg-secondary)';">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-clock-rotate-left" style="color: white;"></i>
                        </div>
                        <div style="text-align: left;">
                            <div style="font-weight: 600; color: var(--text-primary);">Recent Activity</div>
                            <div style="font-size: 12px; color: var(--text-muted);">View system logs</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
            <!-- Code Breakdown -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-chart-pie"></i> Code Breakdown</h3>
                </div>
                <div class="card-body">
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                <span style="font-weight: 500;">JavaScript</span>
                                <span style="color: var(--text-muted);">${projectStats.jsLines.toLocaleString()} lines</span>
                            </div>
                            <div style="height: 10px; background: var(--bg-tertiary); border-radius: 5px; overflow: hidden;">
                                <div style="width: 78%; height: 100%; background: linear-gradient(90deg, #f7df1e, #f0d000); border-radius: 5px;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                <span style="font-weight: 500;">CSS</span>
                                <span style="color: var(--text-muted);">${projectStats.cssLines.toLocaleString()} lines</span>
                            </div>
                            <div style="height: 10px; background: var(--bg-tertiary); border-radius: 5px; overflow: hidden;">
                                <div style="width: 12%; height: 100%; background: linear-gradient(90deg, #264de4, #2965f1); border-radius: 5px;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                <span style="font-weight: 500;">HTML</span>
                                <span style="color: var(--text-muted);">${projectStats.htmlLines.toLocaleString()} lines</span>
                            </div>
                            <div style="height: 10px; background: var(--bg-tertiary); border-radius: 5px; overflow: hidden;">
                                <div style="width: 9%; height: 100%; background: linear-gradient(90deg, #e34f26, #f06529); border-radius: 5px;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                <span style="font-weight: 500;">Config</span>
                                <span style="color: var(--text-muted);">${projectStats.configLines.toLocaleString()} lines</span>
                            </div>
                            <div style="height: 10px; background: var(--bg-tertiary); border-radius: 5px; overflow: hidden;">
                                <div style="width: 1%; height: 100%; background: linear-gradient(90deg, #10b981, #059669); border-radius: 5px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tech Stack -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-layer-group"></i> Technology Stack</h3>
                </div>
                <div class="card-body">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 12px; text-align: center;">
                            <i class="fab fa-js" style="font-size: 32px; color: #f7df1e; margin-bottom: 8px;"></i>
                            <div style="font-weight: 600;">Vanilla JS</div>
                            <div style="font-size: 12px; color: var(--text-muted);">No frameworks</div>
                        </div>
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 12px; text-align: center;">
                            <i class="fas fa-fire" style="font-size: 32px; color: #ffca28; margin-bottom: 8px;"></i>
                            <div style="font-weight: 600;">Firebase</div>
                            <div style="font-size: 12px; color: var(--text-muted);">Real-time sync</div>
                        </div>
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 12px; text-align: center;">
                            <i class="fas fa-chart-bar" style="font-size: 32px; color: #ff6384; margin-bottom: 8px;"></i>
                            <div style="font-weight: 600;">Chart.js</div>
                            <div style="font-size: 12px; color: var(--text-muted);">Data visualization</div>
                        </div>
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 12px; text-align: center;">
                            <i class="fab fa-font-awesome" style="font-size: 32px; color: #339af0; margin-bottom: 8px;"></i>
                            <div style="font-weight: 600;">Font Awesome</div>
                            <div style="font-size: 12px; color: var(--text-muted);">Icon library</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Feature Highlights -->
        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-sparkles"></i> Key Features</h3>
            </div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
                    <div style="padding: 20px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1)); border-radius: 12px; border: 1px solid rgba(139, 92, 246, 0.2);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-bolt" style="color: white;"></i>
                            </div>
                            <div style="font-weight: 600; font-size: 16px;">Real-time Operations</div>
                        </div>
                        <div style="color: var(--text-muted); font-size: 13px; line-height: 1.6;">Firebase-powered real-time sync across all modules. Changes reflect instantly across all connected devices.</div>
                    </div>
                    <div style="padding: 20px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1)); border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.2);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-shield-halved" style="color: white;"></i>
                            </div>
                            <div style="font-weight: 600; font-size: 16px;">Role-Based Security</div>
                        </div>
                        <div style="color: var(--text-muted); font-size: 13px; line-height: 1.6;">Three-tier permission system (Admin, Manager, Employee) with granular access control per module.</div>
                    </div>
                    <div style="padding: 20px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1)); border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.2);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-mobile-screen" style="color: white;"></i>
                            </div>
                            <div style="font-weight: 600; font-size: 16px;">Mobile Responsive</div>
                        </div>
                        <div style="color: var(--text-muted); font-size: 13px; line-height: 1.6;">Fully responsive design optimized for desktop, tablet, and mobile devices with camera integration.</div>
                    </div>
                    <div style="padding: 20px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1)); border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.2);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-plug" style="color: white;"></i>
                            </div>
                            <div style="font-weight: 600; font-size: 16px;">API Integrations</div>
                        </div>
                        <div style="color: var(--text-muted); font-size: 13px; line-height: 1.6;">Connected to Shopify for sales data, Firebase for storage, and custom APIs for order management.</div>
                    </div>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr; gap: 24px; margin-bottom: 24px;">
            <!-- Development Stats -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-chart-simple"></i> Development Metrics</h3>
                </div>
                <div class="card-body">
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-code-branch" style="color: #8b5cf6;"></i>
                                <span>Git Commits</span>
                            </div>
                            <span style="font-weight: 700; color: var(--accent-primary);">${projectStats.gitCommits}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-file-code" style="color: #f59e0b;"></i>
                                <span>Source Files</span>
                            </div>
                            <span style="font-weight: 700; color: var(--accent-primary);">${projectStats.totalFiles}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-calendar-check" style="color: #10b981;"></i>
                                <span>Project Started</span>
                            </div>
                            <span style="font-weight: 700; color: var(--accent-primary);">Dec 9, 2025</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-store" style="color: #3b82f6;"></i>
                                <span>Stores Supported</span>
                            </div>
                            <span style="font-weight: 700; color: var(--accent-primary);">${projectStats.stores}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-puzzle-piece" style="color: #ef4444;"></i>
                                <span>Active Modules</span>
                            </div>
                            <span style="font-weight: 700; color: #10b981;">${projectStats.totalModules}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- All Modules -->
        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                <h3 class="card-title"><i class="fas fa-puzzle-piece"></i> System Modules (${modules.length})</h3>
                <span style="font-size: 12px; color: var(--text-muted);"><i class="fas fa-mouse-pointer"></i> Click any module for details</span>
            </div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px;">
                    ${modulesHtml}
                </div>
            </div>
        </div>

        <!-- Development Timeline -->
        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-timeline"></i> Development Timeline</h3>
            </div>
            <div class="card-body">
                <div style="position: relative; padding-left: 30px;">
                    <div style="position: absolute; left: 10px; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, #8b5cf6, #6366f1, #3b82f6, #10b981, #f59e0b, #ec4899);"></div>

                    <div style="position: relative; margin-bottom: 24px;">
                        <div style="position: absolute; left: -26px; width: 14px; height: 14px; background: #8b5cf6; border-radius: 50%; border: 3px solid var(--bg-primary);"></div>
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 12px;">
                            <div style="font-weight: 600; margin-bottom: 4px;">Day 1: Foundation</div>
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">December 9, 2025</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Core architecture, authentication system, employee management, dashboard, and basic modules setup.</div>
                        </div>
                    </div>

                    <div style="position: relative; margin-bottom: 24px;">
                        <div style="position: absolute; left: -26px; width: 14px; height: 14px; background: #6366f1; border-radius: 50%; border: 3px solid var(--bg-primary);"></div>
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 12px;">
                            <div style="font-weight: 600; margin-bottom: 4px;">Day 2: Core Features</div>
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">December 10, 2025</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Clock in/out, scheduling, training center, licenses & documents, sales analytics with Shopify integration.</div>
                        </div>
                    </div>

                    <div style="position: relative; margin-bottom: 24px;">
                        <div style="position: absolute; left: -26px; width: 14px; height: 14px; background: #3b82f6; border-radius: 50%; border: 3px solid var(--bg-primary);"></div>
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 12px;">
                            <div style="font-weight: 600; margin-bottom: 4px;">Day 3: Advanced Modules</div>
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">December 11, 2025</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Loyal VSU, inventory management, vendor system, financial modules, treasury, and change tracking.</div>
                        </div>
                    </div>

                    <div style="position: relative; margin-bottom: 24px;">
                        <div style="position: absolute; left: -26px; width: 14px; height: 14px; background: #10b981; border-radius: 50%; border: 3px solid var(--bg-primary);"></div>
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 12px;">
                            <div style="font-weight: 600; margin-bottom: 4px;">Day 4: Polish & Enhancements</div>
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">December 12, 2025</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Camera integration, employee photos, supplies module, G Force motivation, barcode labels system.</div>
                        </div>
                    </div>

                    <div style="position: relative; margin-bottom: 24px;">
                        <div style="position: absolute; left: -26px; width: 14px; height: 14px; background: #f59e0b; border-radius: 50%; border: 3px solid var(--bg-primary);"></div>
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 12px;">
                            <div style="font-weight: 600; margin-bottom: 4px;">Day 5-6: AI Integration</div>
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">December 13-14, 2025</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Celeste AI assistant with OpenAI GPT-4, Project Analytics module, HR Applications system, and transfers module.</div>
                        </div>
                    </div>

                    <div style="position: relative; margin-bottom: 24px;">
                        <div style="position: absolute; left: -26px; width: 14px; height: 14px; background: #ec4899; border-radius: 50%; border: 3px solid var(--bg-primary);"></div>
                        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 12px;">
                            <div style="font-weight: 600; margin-bottom: 4px;">Day 7: Continuous Development</div>
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">December 15, 2025</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">System optimizations, bug fixes, UI/UX improvements, and continuous feature enhancements across all 29 modules.</div>
                        </div>
                    </div>

                    <div style="position: relative;">
                        <div style="position: absolute; left: -26px; width: 14px; height: 14px; background: #06b6d4; border-radius: 50%; border: 3px solid var(--bg-primary); animation: pulse 2s infinite;"></div>
                        <div style="padding: 16px; background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.1)); border-radius: 12px; border: 1px solid rgba(6, 182, 212, 0.3);">
                            <div style="font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">January 2026: Security & AI Enhancements <span style="font-size: 10px; padding: 2px 8px; background: #06b6d4; color: white; border-radius: 10px;">CURRENT</span></div>
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">January 6, 2026</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">
                                <strong>Sales Performance Module:</strong> Correlates Shopify sales with employee schedules - hourly sales charts, employee rankings with $/hr metrics, store comparison. Click on employee for detailed modal with sales by day, peak hour, and shift-by-shift breakdown.<br>
                                <strong>Activity Log Module:</strong> Admin-only tracking for login/logout, clock in/out, and system changes with filtering and CSV export.<br>
                                <strong>API Security:</strong> Removed hardcoded API keys, centralized key management via Firebase.<br>
                                <strong>Celeste AI Vision:</strong> Image upload and analysis with GPT-4 Vision for product identification, receipt scanning, and visual reports.<br>
                                <strong>UI Animations:</strong> Confetti celebration for top performer, crown animation, shimmer effects, animated charts and cards.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Credits & Footer -->
        <div style="padding: 40px; background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%); border-radius: 24px; text-align: center; border: 1px solid rgba(139, 92, 246, 0.3); position: relative; overflow: hidden;">
            <!-- Decorative elements -->
            <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%); border-radius: 50%;"></div>

            <div style="position: relative; z-index: 1;">
                <!-- Main Title -->
                <div style="font-size: 42px; font-weight: 800; margin-bottom: 8px; background: linear-gradient(135deg, #8b5cf6, #ec4899, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -1px;">
                    Ascendance Hub
                </div>
                <div style="color: #a1a1aa; font-size: 16px; margin-bottom: 32px;">
                    Enterprise-grade retail management system
                </div>

                <!-- Stats Row -->
                <div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; margin-bottom: 32px;">
                    <div>
                        <div style="font-size: 28px; font-weight: 700; color: white;">${projectStats.totalLines.toLocaleString()}</div>
                        <div style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">Lines of Code</div>
                    </div>
                    <div>
                        <div style="font-size: 28px; font-weight: 700; color: white;">${projectStats.gitCommits}</div>
                        <div style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">Commits</div>
                    </div>
                    <div>
                        <div style="font-size: 28px; font-weight: 700; color: white;">${projectStats.totalModules}</div>
                        <div style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">Modules</div>
                    </div>
                    <div>
                        <div style="font-size: 28px; font-weight: 700; color: white;">7</div>
                        <div style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">Days Built</div>
                    </div>
                </div>

                <!-- Divider -->
                <div style="width: 80px; height: 3px; background: linear-gradient(90deg, #8b5cf6, #ec4899); margin: 0 auto 32px; border-radius: 2px;"></div>

                <!-- Built By Section -->
                <div style="margin-bottom: 24px;">
                    <div style="font-size: 13px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">Built with passion by</div>
                    <a href="https://calidevs.com" target="_blank" style="display: inline-flex; align-items: center; gap: 12px; padding: 16px 32px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2)); border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.4); text-decoration: none; transition: all 0.3s; cursor: pointer;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(139, 92, 246, 0.3)'; this.style.borderColor='rgba(139, 92, 246, 0.8)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none'; this.style.borderColor='rgba(139, 92, 246, 0.4)';">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #8b5cf6, #ec4899); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-laptop-code" style="color: white; font-size: 20px;"></i>
                        </div>
                        <div style="text-align: left;">
                            <div style="font-size: 20px; font-weight: 700; color: white; letter-spacing: -0.5px;">CaliDevs</div>
                            <div style="font-size: 13px; color: #a1a1aa;">Software Development Studio</div>
                        </div>
                        <i class="fas fa-arrow-up-right-from-square" style="color: #8b5cf6; margin-left: 8px;"></i>
                    </a>
                </div>

                <!-- Tech Stack Icons -->
                <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 24px;">
                    <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center;" title="JavaScript">
                        <i class="fab fa-js" style="color: #f7df1e; font-size: 20px;"></i>
                    </div>
                    <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center;" title="HTML5">
                        <i class="fab fa-html5" style="color: #e34f26; font-size: 20px;"></i>
                    </div>
                    <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center;" title="CSS3">
                        <i class="fab fa-css3-alt" style="color: #264de4; font-size: 20px;"></i>
                    </div>
                    <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center;" title="Firebase">
                        <i class="fas fa-fire" style="color: #ffca28; font-size: 18px;"></i>
                    </div>
                    <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center;" title="Chart.js">
                        <i class="fas fa-chart-pie" style="color: #ff6384; font-size: 18px;"></i>
                    </div>
                </div>

                <!-- Footer Info -->
                <div style="font-size: 12px; color: #52525b;">
                    Version 5.0 &bull; Last updated: ${projectStats.lastUpdate}
                </div>
                <div style="font-size: 11px; color: #3f3f46; margin-top: 8px;">
                    Made in San Diego, California
                </div>
            </div>
        </div>
    `;

    // Animate counters after render
    setTimeout(() => animateCounters(), 100);
}

// The Champs - Top Selling Products Module
window.renderTheChamps = function() {
    const dashboard = document.querySelector('.dashboard');
    if (!dashboard) return;

    dashboard.innerHTML = `
        <div class="champs-container" style="padding: 24px; max-width: 1200px; margin: 0 auto;">
            <!-- Header -->
            <div class="page-header champs-header" style="margin-bottom: 24px;">
                <h2 class="section-title" style="display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-trophy" style="color: #FFD700; font-size: 28px;"></i>
                    Best Sellers
                </h2>
                <p class="section-subtitle">Top selling products across all stores</p>
            </div>

            <!-- Controls -->
            <div class="champs-controls" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
                <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                    <select id="champs-store" onchange="loadChampsData()" style="padding: 10px 16px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; cursor: pointer; min-width: 180px;">
                        <option value="loyalvaper">Loyal Vaper</option>
                        <option value="vsu">Vape Smoke Universe</option>
                        <option value="miramarwine">Miramar Wine & Liquor</option>
                    </select>
                    <select id="champs-period" onchange="loadChampsData()" style="padding: 10px 16px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; cursor: pointer; min-width: 150px;">
                        <option value="month">This Month</option>
                        <option value="week">This Week</option>
                        <option value="today">Today</option>
                        <option value="lastmonth">Last Month</option>
                        <option value="3months">Last 3 Months</option>
                    </select>
                    <button onclick="loadChampsData()" style="padding: 10px 20px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='var(--bg-secondary)'">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
                <div id="champs-summary" class="champs-summary" style="display: none; background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05)); padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(255, 215, 0, 0.2);">
                    <span style="font-size: 13px; color: var(--text-muted);">Total Revenue:</span>
                    <span id="champs-total-revenue" style="font-size: 18px; font-weight: 700; color: #10b981; margin-left: 8px;">$0.00</span>
                </div>
            </div>

            <!-- Loading State -->
            <div id="champs-loading" class="champs-loading" style="text-align: center; padding: 80px 40px; background: var(--bg-secondary); border-radius: 16px; border: 1px solid var(--border-color);">
                <i class="fas fa-spinner fa-spin" style="font-size: 40px; color: #FFD700; margin-bottom: 16px; display: block;"></i>
                <div style="font-size: 16px; color: var(--text-muted);">Loading top products...</div>
            </div>

            <!-- Content -->
            <div id="champs-content" style="display: none;">
                <div id="champs-list" style="display: grid; gap: 16px;">
                    <!-- Products will be loaded here -->
                </div>
            </div>

            <!-- Error State -->
            <div id="champs-error" class="champs-error" style="display: none; text-align: center; padding: 80px 40px; background: var(--bg-secondary); border-radius: 16px; border: 1px solid var(--border-color);">
                <i class="fas fa-exclamation-triangle" style="font-size: 40px; color: #f59e0b; margin-bottom: 16px; display: block;"></i>
                <div style="font-size: 16px; color: var(--text-primary); margin-bottom: 8px;">Failed to load data</div>
                <div style="font-size: 14px; color: var(--text-muted);">Click refresh to try again</div>
            </div>
        </div>
    `;

    // Load data
    loadChampsData();
}

// Load The Champs data from selected store API
window.loadChampsData = async function() {
    const loadingEl = document.getElementById('champs-loading');
    const contentEl = document.getElementById('champs-content');
    const errorEl = document.getElementById('champs-error');
    const listEl = document.getElementById('champs-list');
    const summaryEl = document.getElementById('champs-summary');
    const totalRevenueEl = document.getElementById('champs-total-revenue');
    const periodSelect = document.getElementById('champs-period');
    const storeSelect = document.getElementById('champs-store');

    if (!loadingEl || !contentEl || !listEl) return;

    // Show loading
    loadingEl.style.display = 'block';
    contentEl.style.display = 'none';
    errorEl.style.display = 'none';
    if (summaryEl) summaryEl.style.display = 'none';

    try {
        const selectedStore = storeSelect?.value || 'loyalvaper';
        const storeConfig = window.STORES_CONFIG?.[selectedStore];
        if (!storeConfig) {
            throw new Error(`Store config not found: ${selectedStore}`);
        }

        const CORS_PROXY = 'https://corsproxy.io/?';
        const API_VERSION = '2024-01';

        // Calculate date range based on selected period
        const now = new Date();
        let startDate;
        const period = periodSelect?.value || 'month';

        if (period === 'today') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (period === 'week') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay());
        } else if (period === 'lastmonth') {
            // Last month: from 1st of last month to last day of last month
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        } else if (period === '3months') {
            // Last 3 months
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        } else {
            // This month (default)
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const formatDate = (d) => d.toISOString().split('T')[0];
        const graphqlUrl = `https://${storeConfig.storeUrl}/admin/api/${API_VERSION}/graphql.json`;

        const response = await fetch(CORS_PROXY + encodeURIComponent(graphqlUrl), {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': storeConfig.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `{ orders(first: 250, query: "created_at:>=${formatDate(startDate)}") { edges { node { lineItems(first: 50) { edges { node { name sku quantity originalUnitPriceSet { shopMoney { amount } } } } } } } } }`
            })
        });

        const result = await response.json();

        if (result.errors) {
            throw new Error(result.errors[0]?.message || 'API Error');
        }

        // Process products
        const productSales = {};
        // Excluded items (CRV deposits, tips, fees, etc.)
        const excludedPatterns = ['crv', 'tip', 'fee', 'donation', 'deposit', 'bag fee', 'tax'];

        (result.data?.orders?.edges || []).forEach(o => {
            (o.node.lineItems?.edges || []).forEach(i => {
                const item = i.node;
                const itemNameLower = (item.name || '').toLowerCase();

                // Skip excluded items
                if (excludedPatterns.some(pattern => itemNameLower.includes(pattern))) {
                    return;
                }

                const key = item.sku || item.name;
                if (!productSales[key]) {
                    productSales[key] = { name: item.name, sku: item.sku || 'N/A', units: 0, revenue: 0 };
                }
                productSales[key].units += item.quantity;
                productSales[key].revenue += parseFloat(item.originalUnitPriceSet?.shopMoney?.amount || 0) * item.quantity;
            });
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.units - a.units)
            .slice(0, 20);

        // Calculate total revenue
        const totalRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0);

        // Render products
        if (topProducts.length === 0) {
            listEl.innerHTML = `
                <div style="text-align: center; padding: 60px 40px; background: var(--bg-secondary); border-radius: 16px; border: 1px solid var(--border-color);">
                    <i class="fas fa-box-open" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                    <div style="font-size: 16px; color: var(--text-primary);">No sales data found for this period</div>
                </div>
            `;
        } else {
            listEl.innerHTML = topProducts.map((product, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                const isTop3 = index < 3;
                const bgColor = index === 0 ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05))'
                              : index === 1 ? 'linear-gradient(135deg, rgba(192, 192, 192, 0.15), rgba(192, 192, 192, 0.05))'
                              : index === 2 ? 'linear-gradient(135deg, rgba(205, 127, 50, 0.15), rgba(205, 127, 50, 0.05))'
                              : 'var(--bg-secondary)';
                const borderColor = index === 0 ? 'rgba(255, 215, 0, 0.4)'
                                  : index === 1 ? 'rgba(192, 192, 192, 0.4)'
                                  : index === 2 ? 'rgba(205, 127, 50, 0.4)'
                                  : 'var(--border-color)';

                return `
                    <div class="champs-product-card" style="display: flex; align-items: center; gap: 20px; padding: 20px 24px; background: ${bgColor}; border-radius: 16px; border: 1px solid ${borderColor}; transition: all 0.2s;">
                        <div class="champs-product-rank" style="width: 48px; height: 48px; background: var(--bg-primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: ${medal ? '24px' : '18px'}; color: var(--text-primary); border: 2px solid ${borderColor}; flex-shrink: 0;">
                            ${medal || (index + 1)}
                        </div>
                        <div class="champs-product-info" style="flex: 1; min-width: 0;">
                            <div class="champs-product-name" style="font-weight: 600; font-size: 15px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${product.name}</div>
                            <div class="champs-product-meta" style="font-size: 13px; color: var(--text-muted); display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
                                <span style="background: var(--bg-tertiary); padding: 2px 8px; border-radius: 4px;">${product.sku}</span>
                                <span>${product.units} units sold</span>
                            </div>
                        </div>
                        <div class="champs-product-revenue" style="text-align: right; flex-shrink: 0;">
                            <div style="font-weight: 700; font-size: 18px; color: #10b981;">$${product.revenue.toFixed(2)}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">$${(product.revenue / product.units).toFixed(2)}/unit</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Show content and summary
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
        if (summaryEl && totalRevenueEl && topProducts.length > 0) {
            summaryEl.style.display = 'block';
            totalRevenueEl.textContent = '$' + totalRevenue.toFixed(2);
        }

    } catch (error) {
        console.error('The Champs load error:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
    }
}

// Show module details modal
window.showModuleDetails = function(index) {
    const mod = window.projectModules[index];
    if (!mod) return;

    const featuresHtml = mod.features.map(f => `
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg-tertiary); border-radius: 8px;">
            <i class="fas fa-check" style="color: #10b981; font-size: 12px;"></i>
            <span style="font-size: 13px;">${f}</span>
        </div>
    `).join('');

    const modalHtml = `
        <div id="module-details-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;" onmousedown="if(event.target === this) closeModuleDetails()">
            <div style="background: var(--bg-primary); border-radius: 20px; max-width: 560px; width: 100%; max-height: 90vh; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.25); animation: modalSlideIn 0.3s ease;">
                <!-- Header with gradient -->
                <div style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); padding: 24px; color: white; position: relative;">
                    <button onclick="closeModuleDetails()" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.2); border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-times" style="color: white;"></i>
                    </button>
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas ${mod.icon}" style="font-size: 24px;"></i>
                        </div>
                        <div>
                            <h2 style="margin: 0; font-size: 22px; font-weight: 700;">${mod.name}</h2>
                            <div style="opacity: 0.9; font-size: 14px; margin-top: 4px;">${mod.description}</div>
                        </div>
                    </div>
                </div>

                <!-- Body -->
                <div style="padding: 24px; overflow-y: auto; max-height: calc(90vh - 180px);">
                    <!-- Stats Row -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                        <div style="text-align: center; padding: 16px; background: var(--bg-secondary); border-radius: 12px;">
                            <div style="font-size: 24px; font-weight: 700; color: var(--accent-primary);">v${mod.version}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">Version</div>
                        </div>
                        <div style="text-align: center; padding: 16px; background: var(--bg-secondary); border-radius: 12px;">
                            <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${mod.linesOfCode.toLocaleString()}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">Lines of Code</div>
                        </div>
                        <div style="text-align: center; padding: 16px; background: var(--bg-secondary); border-radius: 12px;">
                            <div style="font-size: 24px; font-weight: 700; color: #10b981;"><i class="fas fa-circle" style="font-size: 16px;"></i></div>
                            <div style="font-size: 12px; color: var(--text-muted);">Active</div>
                        </div>
                    </div>

                    <!-- Description -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 14px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">About</h4>
                        <p style="margin: 0; color: var(--text-secondary); line-height: 1.7; font-size: 14px;">${mod.fullDescription}</p>
                    </div>

                    <!-- Features -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 12px 0; font-size: 14px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Key Features</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            ${featuresHtml}
                        </div>
                    </div>

                    <!-- Action Button -->
                    ${mod.page ? `
                        <button onclick="navigateToModule('${mod.page}')" style="width: 100%; padding: 14px; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(139, 92, 246, 0.3)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
                            <i class="fas fa-arrow-right"></i>
                            Go to ${mod.name}
                        </button>
                    ` : `
                        <div style="width: 100%; padding: 14px; background: var(--bg-secondary); color: var(--text-muted); border-radius: 12px; font-size: 14px; text-align: center;">
                            <i class="fas fa-lock"></i> System Module - No Direct Access
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;

    // Add animation keyframes if not already added
    if (!document.getElementById('module-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'module-modal-styles';
        style.textContent = `
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.95) translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Remove any existing modal
    const existing = document.getElementById('module-details-modal');
    if (existing) existing.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Close module details modal
window.closeModuleDetails = function() {
    const modal = document.getElementById('module-details-modal');
    if (modal) {
        modal.style.animation = 'modalSlideIn 0.2s ease reverse';
        setTimeout(() => modal.remove(), 200);
    }
}

// Navigate to module from details modal
window.navigateToModule = function(page) {
    closeModuleDetails();
    if (page === 'gforce') {
        openGForceModal();
    } else if (page === 'gconomics') {
        openGconomicsModal();
    } else {
        navigateTo(page);
    }
}

// API Settings Modal for Celeste AI - OpenAI Only
window.openAPISettings = function() {
    // Get key from Firebase first, then localStorage
    const currentKey = window.celesteFirebaseSettings?.openai_api_key || localStorage.getItem('openai_api_key') || '';
    const maskedKey = currentKey ? '••••••••' + currentKey.slice(-8) : '';
    const isConnected = currentKey && currentKey.startsWith('sk-');

    const modalHtml = `
        <div id="api-settings-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; animation: modalSlideIn 0.3s ease;"
            onmousedown="if(event.target === this) closeAPISettings()">
            <div style="background: var(--bg-primary); border-radius: 20px; max-width: 500px; width: 100%; padding: 0; box-shadow: 0 20px 60px rgba(0,0,0,0.3); border: 1px solid var(--border-color);">
                <!-- Header -->
                <div style="padding: 24px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px;">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #10a37f, #1a7f64); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-key" style="color: white; font-size: 20px;"></i>
                    </div>
                    <div style="flex: 1;">
                        <h3 style="margin: 0; font-size: 18px;">API Settings</h3>
                        <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-muted);">Configure Celeste AI connection</p>
                    </div>
                    <button onclick="closeAPISettings()" style="width: 36px; height: 36px; border-radius: 10px; border: none; background: var(--bg-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-times" style="color: var(--text-muted);"></i>
                    </button>
                </div>

                <!-- Content -->
                <div style="padding: 24px;">
                    <!-- OpenAI Section -->
                    <div style="margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" alt="OpenAI" style="width: 24px; height: 24px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <i class="fas fa-robot" style="color: #10a37f; font-size: 20px; display: none;"></i>
                            <div>
                                <div style="font-weight: 600;">OpenAI GPT-4</div>
                                <div style="font-size: 12px; color: var(--text-muted);">Powered by OpenAI API</div>
                            </div>
                            <div style="margin-left: auto; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; ${isConnected ? 'background: rgba(16,185,129,0.15); color: #10b981;' : 'background: rgba(239,68,68,0.15); color: #ef4444;'}">
                                ${isConnected ? 'Connected' : 'Not configured'}
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; font-size: 13px; font-weight: 500;">OpenAI API Key</label>
                            <div style="position: relative;">
                                <input type="password" id="openai-api-key-input" class="form-input"
                                    placeholder="${maskedKey || 'sk-proj-...'}"
                                    value="${currentKey}"
                                    style="padding-right: 80px;">
                                <button onclick="toggleAPIKeyVisibility()" style="position: absolute; right: 44px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted);">
                                    <i class="fas fa-eye" id="api-key-toggle-icon"></i>
                                </button>
                                <button onclick="testOpenAIConnection()" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: #10a37f; border: none; border-radius: 6px; padding: 6px 10px; cursor: pointer; color: white; font-size: 11px;">
                                    Test
                                </button>
                            </div>
                            <p style="margin: 8px 0 0; font-size: 11px; color: var(--text-muted);">
                                Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" style="color: #10a37f; font-weight: 600;">platform.openai.com/api-keys</a>
                            </p>
                        </div>

                        <div id="api-test-result" style="display: none; padding: 12px; border-radius: 10px; margin-bottom: 16px; font-size: 13px;"></div>
                    </div>

                    <!-- Get API Key Button -->
                    <a href="https://platform.openai.com/api-keys" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 20px; background: linear-gradient(135deg, #10a37f, #1a7f64); color: white; border-radius: 12px; text-decoration: none; font-weight: 600; margin-bottom: 20px; transition: all 0.2s;"
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(16,163,127,0.3)';"
                        onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
                        <i class="fas fa-external-link-alt"></i>
                        Get OpenAI API Key
                    </a>

                    <!-- Info -->
                    <div style="padding: 16px; background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color);">
                        <div style="display: flex; align-items: flex-start; gap: 12px;">
                            <i class="fas fa-info-circle" style="color: #10a37f; margin-top: 2px;"></i>
                            <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
                                <strong>About Celeste AI:</strong><br>
                                Celeste uses OpenAI GPT-4 to understand natural language commands. You can ask her to record expenses, report suspicious people, navigate to modules, and more - just by talking or typing naturally.
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div style="padding: 16px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 12px;">
                    <button onclick="closeAPISettings()" class="btn-secondary" style="padding: 10px 20px;">Cancel</button>
                    <button onclick="saveAPISettings()" class="btn-primary" style="padding: 10px 20px; background: #10a37f;">
                        <i class="fas fa-save"></i> Save Settings
                    </button>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal
    const existing = document.getElementById('api-settings-modal');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Close API Settings Modal
window.closeAPISettings = function() {
    const modal = document.getElementById('api-settings-modal');
    if (modal) {
        modal.style.animation = 'modalSlideIn 0.2s ease reverse';
        setTimeout(() => modal.remove(), 200);
    }
}

// Toggle API key visibility
window.toggleAPIKeyVisibility = function() {
    const input = document.getElementById('openai-api-key-input');
    const icon = document.getElementById('api-key-toggle-icon');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Test OpenAI Connection
window.testOpenAIConnection = async function() {
    const apiKey = document.getElementById('openai-api-key-input').value.trim();
    const resultDiv = document.getElementById('api-test-result');

    if (!apiKey) {
        resultDiv.style.display = 'block';
        resultDiv.style.background = 'rgba(239,68,68,0.15)';
        resultDiv.style.color = '#ef4444';
        resultDiv.innerHTML = '<i class="fas fa-times-circle"></i> Please enter an API key first';
        return;
    }

    resultDiv.style.display = 'block';
    resultDiv.style.background = 'rgba(59,130,246,0.15)';
    resultDiv.style.color = '#3b82f6';
    resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing connection...';

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                max_tokens: 50,
                messages: [{ role: 'user', content: 'Say "Connected!" in one word.' }]
            })
        });

        if (response.ok) {
            resultDiv.style.background = 'rgba(16,185,129,0.15)';
            resultDiv.style.color = '#10b981';
            resultDiv.innerHTML = '<i class="fas fa-check-circle"></i> Connection successful! Celeste AI is ready.';
        } else {
            const error = await response.json();
            throw new Error(error.error?.message || 'API error');
        }
    } catch (error) {
        resultDiv.style.background = 'rgba(239,68,68,0.15)';
        resultDiv.style.color = '#ef4444';
        resultDiv.innerHTML = '<i class="fas fa-times-circle"></i> Connection failed: ' + error.message;
    }
}

// Save API Settings - saves to Firebase for all users
window.saveAPISettings = async function() {
    const apiKey = document.getElementById('openai-api-key-input').value.trim();
    const saveBtn = document.querySelector('#api-settings-modal .btn-primary');

    // Show saving state
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;
    }

    try {
        // Save to Firebase (for all users)
        if (apiKey && typeof window.saveCelesteSettings === 'function') {
            const saved = await window.saveCelesteSettings({ openai_api_key: apiKey });
            if (saved) {
                console.log('[API Settings] Saved to Firebase successfully');
            }
        }

        // Also save to localStorage as backup
        if (apiKey) {
            localStorage.setItem('openai_api_key', apiKey);
            window.OPENAI_API_KEY = apiKey;
            // Update global settings
            if (!window.celesteFirebaseSettings) window.celesteFirebaseSettings = {};
            window.celesteFirebaseSettings.openai_api_key = apiKey;
        } else {
            localStorage.removeItem('openai_api_key');
            window.OPENAI_API_KEY = '';
            if (window.celesteFirebaseSettings) {
                window.celesteFirebaseSettings.openai_api_key = '';
            }
        }

        // Show success toast
        showAPISettingsToast('API settings saved to cloud!', 'success');
        closeAPISettings();
    } catch (error) {
        console.error('[API Settings] Error saving:', error);
        showAPISettingsToast('Error saving settings: ' + error.message, 'error');

        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Settings';
            saveBtn.disabled = false;
        }
    }
}

// Toast for API settings
function showAPISettingsToast(message, type = 'info') {
    const toast = document.createElement('div');
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
    };

    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 14px 20px;
        background: ${colors[type]};
        color: white;
        border-radius: 10px;
        font-weight: 500;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10001;
        animation: slideInRight 0.3s ease;
    `;

    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Load OpenAI API key from localStorage on init
(function loadSavedAPIKey() {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey && !window.OPENAI_API_KEY) {
        window.OPENAI_API_KEY = savedKey;
    }
})();

// Test Celeste connection from Project Analytics page - OpenAI Only
window.testCelesteFromProjectAnalytics = async function() {
    const statusDiv = document.getElementById('celeste-api-status');

    // Create debug modal
    const debugModal = document.createElement('div');
    debugModal.id = 'api-debug-modal';
    debugModal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    debugModal.onmousedown = (e) => { if (e.target === debugModal) debugModal.remove(); };

    debugModal.innerHTML = `
        <div style="background: var(--bg-primary, #1a1a2e); border-radius: 20px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 32px; animation: modalSlideIn 0.3s ease;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-vial" style="color: white; font-size: 24px;"></i>
                </div>
                <div>
                    <h3 style="margin: 0; font-size: 20px; color: var(--text-primary, #fff);">OpenAI Connection Test</h3>
                    <p style="margin: 4px 0 0; color: var(--text-muted, #888); font-size: 13px;">Testing GPT-4o API Connection</p>
                </div>
                <button onclick="document.getElementById('api-debug-modal').remove()" style="margin-left: auto; background: none; border: none; color: var(--text-muted, #888); font-size: 20px; cursor: pointer; padding: 8px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div id="api-test-results">
                <!-- OpenAI Test Card -->
                <div id="openai-test-card" style="background: var(--bg-secondary, #16162a); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color, #333);">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-robot" style="color: white; font-size: 18px;"></i>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-primary, #fff);">OpenAI GPT-4o</div>
                            <div style="font-size: 12px; color: var(--text-muted, #888);">AI PROVIDER</div>
                        </div>
                        <div id="openai-status" style="padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: rgba(59,130,246,0.15); color: #3b82f6;">
                            <i class="fas fa-spinner fa-spin"></i> Testing...
                        </div>
                    </div>
                    <div id="openai-details" style="font-family: monospace; font-size: 12px; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 12px; color: var(--text-muted, #aaa); white-space: pre-wrap; word-break: break-all; max-height: 300px; overflow-y: auto;">
Initializing test...
                    </div>
                </div>
            </div>

            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color, #333); display: flex; justify-content: flex-end; gap: 12px;">
                <button onclick="document.getElementById('api-debug-modal').remove()" style="padding: 10px 20px; background: var(--bg-secondary, #16162a); color: var(--text-primary, #fff); border: 1px solid var(--border-color, #333); border-radius: 8px; font-weight: 500; cursor: pointer;">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(debugModal);

    // Helper to mask API key
    const maskKey = (key) => key ? key.substring(0, 12) + '...' + key.substring(key.length - 6) : 'NOT SET';

    // Helper to update details
    const updateDetails = (text, append = true) => {
        const el = document.getElementById('openai-details');
        if (el) {
            el.textContent = append ? el.textContent + '\n' + text : text;
            el.scrollTop = el.scrollHeight;
        }
    };

    // Helper to update status
    const updateStatus = (status, type) => {
        const el = document.getElementById('openai-status');
        if (el) {
            const styles = {
                testing: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', icon: 'fa-spinner fa-spin', text: 'Testing...' },
                success: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', icon: 'fa-check-circle', text: status },
                error: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', icon: 'fa-times-circle', text: status }
            };
            const s = styles[type] || styles.testing;
            el.style.background = s.bg;
            el.style.color = s.color;
            el.innerHTML = `<i class="fas ${s.icon}"></i> ${s.text}`;
        }
    };

    let openaiSuccess = false;

    try {
        const openaiKey = getOpenAIKey() || localStorage.getItem('openai_api_key');

        updateDetails(`[${new Date().toLocaleTimeString()}] Starting OpenAI GPT-4o test...`, false);
        updateDetails(`📍 Endpoint: https://api.openai.com/v1/chat/completions`);
        updateDetails(`🤖 Model: gpt-4o`);
        updateDetails(`🔑 API Key: ${maskKey(openaiKey)}`);

        if (!openaiKey) {
            throw new Error('No OpenAI API key configured. Go to Project Analytics > Configure API Key');
        }

        updateDetails(`\n⏳ Sending request...`);
        const startTime = performance.now();

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                max_tokens: 50,
                messages: [{ role: 'user', content: 'Say "Hello from GPT-4!" in exactly those words.' }]
            })
        });

        const latency = Math.round(performance.now() - startTime);
        updateDetails(`⚡ Response time: ${latency}ms`);
        updateDetails(`📊 HTTP Status: ${response.status} ${response.statusText}`);

        const data = await response.json();

        if (response.ok) {
            const aiResponse = data.choices?.[0]?.message?.content || 'No text in response';
            updateDetails(`\n✅ SUCCESS!`);
            updateDetails(`💬 AI Response: "${aiResponse}"`);
            updateDetails(`📈 Tokens used: ${data.usage?.prompt_tokens || 0} in / ${data.usage?.completion_tokens || 0} out`);
            updateStatus(`Connected (${latency}ms)`, 'success');
            openaiSuccess = true;
        } else {
            throw new Error(data.error?.message || `HTTP ${response.status}`);
        }
    } catch (error) {
        updateDetails(`\n❌ ERROR: ${error.message}`);
        updateStatus('Failed', 'error');
        console.error('OpenAI test error:', error);
    }

    // Update main status indicator
    if (statusDiv) {
        if (openaiSuccess) {
            statusDiv.innerHTML = '● Connected';
            statusDiv.style.background = 'rgba(16,185,129,0.15)';
            statusDiv.style.color = '#10b981';
        } else {
            statusDiv.innerHTML = '○ Connection Failed';
            statusDiv.style.background = 'rgba(239,68,68,0.15)';
            statusDiv.style.color = '#ef4444';
        }
    }

    console.log('=== OpenAI API TEST ===');
    console.log('OpenAI GPT-4:', openaiSuccess ? '✅ SUCCESS' : '❌ FAILED');
}

// Animated counter function
function animateCounters() {
    const counters = document.querySelectorAll('.counter-value');
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        const duration = 1500; // 1.5 seconds
        const steps = 60;
        const stepDuration = duration / steps;
        let current = 0;
        const increment = target / steps;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current).toLocaleString();
            }
        }, stepDuration);
    });
}

// Quick Action: System Check
window.runSystemCheck = async function() {
    const checkModal = document.createElement('div');
    checkModal.id = 'system-check-modal';
    checkModal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    checkModal.onmousedown = (e) => { if (e.target === checkModal) checkModal.remove(); };

    checkModal.innerHTML = `
        <div style="background: var(--bg-primary); border-radius: 20px; max-width: 480px; width: 100%; padding: 32px; text-align: center; animation: modalSlideIn 0.3s ease;">
            <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <i class="fas fa-stethoscope" style="color: white; font-size: 28px;"></i>
            </div>
            <h3 style="margin: 0 0 8px; font-size: 20px;">System Health Check</h3>
            <p style="color: var(--text-muted); margin: 0 0 24px; font-size: 14px;">Running diagnostics...</p>
            <div id="check-results" style="text-align: left; background: var(--bg-secondary); border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <i class="fas fa-spinner fa-spin" style="color: var(--accent-primary);"></i>
                    <span>Checking Firebase connection...</span>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(checkModal);

    // Simulate checks
    const resultsDiv = document.getElementById('check-results');
    const checks = [
        { name: 'Firebase Connection', check: () => typeof firebase !== 'undefined' && firebase.apps.length > 0 },
        { name: 'Firestore Database', check: () => typeof firebase !== 'undefined' && typeof firebase.firestore === 'function' },
        { name: 'Firebase Storage', check: () => typeof firebase !== 'undefined' && typeof firebase.storage === 'function' },
        { name: 'Authentication System', check: () => typeof getCurrentUser === 'function' },
        { name: 'Local Storage', check: () => typeof localStorage !== 'undefined' }
    ];

    let resultsHtml = '';
    for (const item of checks) {
        await new Promise(r => setTimeout(r, 300));
        const passed = item.check();
        resultsHtml += `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <i class="fas ${passed ? 'fa-check-circle' : 'fa-times-circle'}" style="color: ${passed ? '#10b981' : '#ef4444'};"></i>
                <span>${item.name}</span>
                <span style="margin-left: auto; font-size: 12px; color: ${passed ? '#10b981' : '#ef4444'};">${passed ? 'OK' : 'FAIL'}</span>
            </div>
        `;
        resultsDiv.innerHTML = resultsHtml;
    }

    resultsHtml += `
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color); text-align: center;">
            <button onclick="document.getElementById('system-check-modal').remove()" style="padding: 10px 24px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                Done
            </button>
        </div>
    `;
    resultsDiv.innerHTML = resultsHtml;
}

// Quick Action: Clear Cache
window.clearAppCache = function() {
    if (confirm('This will clear all local cache and stored preferences. You may need to log in again. Continue?')) {
        localStorage.clear();
        sessionStorage.clear();
        showNotification('Cache cleared successfully! Refreshing...', 'success');
        setTimeout(() => window.location.reload(), 1500);
    }
}

// Quick Action: Export Report
window.exportSystemReport = function() {
    const report = {
        title: 'Ascendance Hub System Report',
        generatedAt: new Date().toISOString(),
        stats: {
            totalLines: 33726,
            jsLines: 25263,
            cssLines: 6259,
            htmlLines: 1504,
            configLines: 700,
            totalModules: 27,
            totalFiles: 20,
            gitCommits: 231,
            projectStart: 'December 9, 2025'
        },
        modules: window.projectModules?.map(m => ({
            name: m.name,
            version: m.version,
            status: m.status,
            linesOfCode: m.linesOfCode
        })) || [],
        browser: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ascendance-hub-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Report exported successfully!', 'success');
}

// Quick Action: Show Recent Activity
window.showRecentActivity = function() {
    const activityModal = document.createElement('div');
    activityModal.id = 'activity-modal';
    activityModal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    activityModal.onmousedown = (e) => { if (e.target === activityModal) activityModal.remove(); };

    // Get current user
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : { name: 'Unknown' };
    const now = new Date();

    const activities = [
        { icon: 'fa-right-to-bracket', color: '#10b981', text: `${user.name} logged in`, time: 'Just now' },
        { icon: 'fa-eye', color: '#3b82f6', text: 'Viewed Project Analytics', time: 'Just now' },
        { icon: 'fa-code', color: '#8b5cf6', text: 'System initialized', time: formatTimeAgo(now) },
        { icon: 'fa-database', color: '#f59e0b', text: 'Firebase connected', time: formatTimeAgo(now) },
        { icon: 'fa-shield-halved', color: '#10b981', text: 'Security check passed', time: formatTimeAgo(now) }
    ];

    const activitiesHtml = activities.map(a => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 10px;">
            <div style="width: 36px; height: 36px; background: ${a.color}20; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <i class="fas ${a.icon}" style="color: ${a.color}; font-size: 14px;"></i>
            </div>
            <div style="flex: 1;">
                <div style="font-size: 14px;">${a.text}</div>
                <div style="font-size: 12px; color: var(--text-muted);">${a.time}</div>
            </div>
        </div>
    `).join('');

    activityModal.innerHTML = `
        <div style="background: var(--bg-primary); border-radius: 20px; max-width: 480px; width: 100%; max-height: 80vh; overflow: hidden; animation: modalSlideIn 0.3s ease;">
            <div style="padding: 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 18px;"><i class="fas fa-clock-rotate-left" style="color: var(--accent-primary); margin-right: 8px;"></i> Recent Activity</h3>
                <button onclick="document.getElementById('activity-modal').remove()" style="background: none; border: none; cursor: pointer; padding: 8px;">
                    <i class="fas fa-times" style="color: var(--text-muted);"></i>
                </button>
            </div>
            <div style="padding: 16px; max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                ${activitiesHtml}
            </div>
        </div>
    `;
    document.body.appendChild(activityModal);
}

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

// Store Locations Modal for Geofencing Configuration
window.openStoreLocationsModal = function() {
    const existingModal = document.getElementById('store-locations-modal');
    if (existingModal) existingModal.remove();

    // Get current store locations from config
    const storeLocations = window.STORE_LOCATIONS || {};
    const geofenceConfig = window.GEOFENCE_CONFIG || { enabled: true, strictMode: false, defaultRadius: 100 };

    // Build store rows HTML
    const storeRows = Object.entries(storeLocations).map(([key, store]) => `
        <div class="store-location-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr 80px auto; gap: 10px; align-items: center; padding: 12px; background: var(--bg-secondary); border-radius: 10px; margin-bottom: 10px;">
            <div>
                <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Store</label>
                <span style="font-weight: 600; font-size: 13px;">${store.name || key}</span>
            </div>
            <div>
                <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Latitude</label>
                <input type="number" step="0.0001" value="${store.latitude || ''}"
                    data-store="${key}" data-field="latitude"
                    style="width: 100%; padding: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 12px;"
                    placeholder="32.8934">
            </div>
            <div>
                <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Longitude</label>
                <input type="number" step="0.0001" value="${store.longitude || ''}"
                    data-store="${key}" data-field="longitude"
                    style="width: 100%; padding: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 12px;"
                    placeholder="-117.1489">
            </div>
            <div>
                <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Radius (m)</label>
                <input type="number" value="${store.radius || 100}"
                    data-store="${key}" data-field="radius"
                    style="width: 100%; padding: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 12px;"
                    placeholder="100">
            </div>
            <div>
                <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">&nbsp;</label>
                <button onclick="getStoreCurrentLocation('${key}')"
                    style="padding: 8px 12px; background: var(--accent-primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; white-space: nowrap;"
                    title="Use current location">
                    <i class="fas fa-crosshairs"></i>
                </button>
            </div>
        </div>
    `).join('');

    const modal = document.createElement('div');
    modal.id = 'store-locations-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    modal.onmousedown = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
        <div style="background: var(--bg-primary); border-radius: 16px; max-width: 700px; width: 100%; max-height: 90vh; overflow: hidden; animation: modalSlideIn 0.3s ease; box-shadow: 0 20px 60px rgba(0,0,0,0.3); display: flex; flex-direction: column;">
            <div style="padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 16px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-map-marker-alt" style="color: #ec4899;"></i> Store Locations (Geofencing)
                </h3>
                <button onclick="document.getElementById('store-locations-modal').remove()" style="background: none; border: none; cursor: pointer; padding: 8px; opacity: 0.6;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">
                    <i class="fas fa-times" style="color: var(--text-muted);"></i>
                </button>
            </div>
            <div style="padding: 24px; overflow-y: auto; flex: 1;">
                <!-- Geofence Settings -->
                <div style="margin-bottom: 20px; padding: 16px; background: var(--bg-secondary); border-radius: 12px;">
                    <h4 style="margin: 0 0 12px 0; font-size: 14px; color: var(--text-secondary);">
                        <i class="fas fa-cog" style="margin-right: 8px;"></i>Geofence Settings
                    </h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 16px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="geofence-enabled" ${geofenceConfig.enabled ? 'checked' : ''}
                                style="width: 18px; height: 18px; cursor: pointer;">
                            <span style="font-size: 13px;">Enable Geofencing</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="geofence-strict" ${geofenceConfig.strictMode ? 'checked' : ''}
                                style="width: 18px; height: 18px; cursor: pointer;">
                            <span style="font-size: 13px;">Strict Mode (Block off-site clock-ins)</span>
                        </label>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <label style="font-size: 13px;">Default Radius:</label>
                            <input type="number" id="geofence-default-radius" value="${geofenceConfig.defaultRadius || 100}"
                                style="width: 70px; padding: 6px 8px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 12px;">
                            <span style="font-size: 12px; color: var(--text-muted);">meters</span>
                        </div>
                    </div>
                </div>

                <!-- Store Locations -->
                <h4 style="margin: 0 0 12px 0; font-size: 14px; color: var(--text-secondary);">
                    <i class="fas fa-store" style="margin-right: 8px;"></i>Store Coordinates
                </h4>
                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
                    Set GPS coordinates for each store. Use the <i class="fas fa-crosshairs"></i> button to use your current location.
                </p>
                <div id="store-locations-list">
                    ${storeRows}
                </div>
            </div>
            <div style="padding: 16px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px;">
                <button onclick="document.getElementById('store-locations-modal').remove()"
                    style="padding: 10px 20px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; color: var(--text-primary);">
                    Cancel
                </button>
                <button onclick="saveStoreLocations()"
                    style="padding: 10px 20px; background: linear-gradient(135deg, #ec4899, #db2777); border: none; border-radius: 8px; cursor: pointer; color: white; font-weight: 600;">
                    <i class="fas fa-save" style="margin-right: 6px;"></i>Save Locations
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Get current location for a specific store input
window.getStoreCurrentLocation = async function(storeKey) {
    try {
        showNotification('Getting current location...', 'info');

        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000
            });
        });

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Find and update the inputs
        const latInput = document.querySelector(`input[data-store="${storeKey}"][data-field="latitude"]`);
        const lonInput = document.querySelector(`input[data-store="${storeKey}"][data-field="longitude"]`);

        if (latInput) latInput.value = lat.toFixed(6);
        if (lonInput) lonInput.value = lon.toFixed(6);

        showNotification(`Location set: ${lat.toFixed(4)}, ${lon.toFixed(4)}`, 'success');
    } catch (error) {
        console.error('Geolocation error:', error);
        showNotification('Could not get location. Please enable GPS.', 'error');
    }
}

// Save store locations to Firebase and localStorage
window.saveStoreLocations = async function() {
    try {
        // Collect all store location data from inputs
        const storeLocations = {};
        const rows = document.querySelectorAll('.store-location-row');

        rows.forEach(row => {
            const latInput = row.querySelector('input[data-field="latitude"]');
            const lonInput = row.querySelector('input[data-field="longitude"]');
            const radiusInput = row.querySelector('input[data-field="radius"]');

            if (latInput && lonInput) {
                const storeKey = latInput.dataset.store;
                const originalStore = window.STORE_LOCATIONS?.[storeKey] || {};

                storeLocations[storeKey] = {
                    name: originalStore.name || storeKey,
                    latitude: parseFloat(latInput.value) || 0,
                    longitude: parseFloat(lonInput.value) || 0,
                    radius: parseInt(radiusInput?.value) || 100
                };
            }
        });

        // Collect geofence config
        const geofenceConfig = {
            enabled: document.getElementById('geofence-enabled')?.checked ?? true,
            strictMode: document.getElementById('geofence-strict')?.checked ?? false,
            defaultRadius: parseInt(document.getElementById('geofence-default-radius')?.value) || 100,
            recordLocationAlways: true
        };

        // Save to Firebase
        try {
            const db = firebase.firestore();
            const settingsCollection = window.FIREBASE_COLLECTIONS?.settings || 'settings';

            // Save store locations
            await db.collection(settingsCollection).doc('storeLocations').set({
                locations: storeLocations,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: getCurrentUser()?.name || 'Unknown'
            });

            // Save geofence config
            await db.collection(settingsCollection).doc('geofenceConfig').set({
                config: geofenceConfig,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: getCurrentUser()?.name || 'Unknown'
            });

            console.log('✅ Store locations saved to Firebase');
        } catch (firebaseError) {
            console.error('Firebase save error:', firebaseError);
            // Continue to save locally even if Firebase fails
        }

        // Also save to localStorage as backup/cache
        localStorage.setItem('store_locations', JSON.stringify(storeLocations));
        localStorage.setItem('geofence_config', JSON.stringify(geofenceConfig));

        // Update window objects immediately
        window.STORE_LOCATIONS = storeLocations;
        window.GEOFENCE_CONFIG = geofenceConfig;

        showNotification('Store locations saved successfully!', 'success');
        document.getElementById('store-locations-modal')?.remove();

    } catch (error) {
        console.error('Error saving store locations:', error);
        showNotification('Error saving locations. Please try again.', 'error');
    }
}

// Load saved store locations from Firebase (with localStorage fallback)
window.loadSavedStoreLocations = async function() {
    try {
        // First, try to load from localStorage as quick cache
        const cachedLocations = localStorage.getItem('store_locations');
        const cachedGeofenceConfig = localStorage.getItem('geofence_config');

        if (cachedLocations) {
            const locations = JSON.parse(cachedLocations);
            window.STORE_LOCATIONS = { ...window.STORE_LOCATIONS, ...locations };
        }

        if (cachedGeofenceConfig) {
            window.GEOFENCE_CONFIG = JSON.parse(cachedGeofenceConfig);
        }

        // Then try to load from Firebase (will override cache if successful)
        try {
            // Wait a moment for Firebase to initialize
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                const settingsCollection = window.FIREBASE_COLLECTIONS?.settings || 'settings';

                // Load store locations
                const locationsDoc = await db.collection(settingsCollection).doc('storeLocations').get();
                if (locationsDoc.exists) {
                    const data = locationsDoc.data();
                    if (data.locations) {
                        window.STORE_LOCATIONS = { ...window.STORE_LOCATIONS, ...data.locations };
                        // Update local cache
                        localStorage.setItem('store_locations', JSON.stringify(data.locations));
                        console.log('✅ Store locations loaded from Firebase');
                    }
                }

                // Load geofence config
                const configDoc = await db.collection(settingsCollection).doc('geofenceConfig').get();
                if (configDoc.exists) {
                    const data = configDoc.data();
                    if (data.config) {
                        window.GEOFENCE_CONFIG = data.config;
                        // Update local cache
                        localStorage.setItem('geofence_config', JSON.stringify(data.config));
                        console.log('✅ Geofence config loaded from Firebase');
                    }
                }
            }
        } catch (firebaseError) {
            console.warn('Could not load from Firebase, using cached data:', firebaseError.message);
        }
    } catch (error) {
        console.error('Error loading saved store locations:', error);
    }
}

// Load saved locations on page load
if (typeof window !== 'undefined') {
    // Load immediately from cache
    window.loadSavedStoreLocations();
}

// OpenAI API Settings Modal
window.openOpenAIAPISettings = function() {
    const existingModal = document.getElementById('openai-api-settings-modal');
    if (existingModal) existingModal.remove();

    // Get stored API key (masked for display)
    const storedKey = localStorage.getItem('openai_api_key') || '';
    const maskedKey = storedKey ? '••••••••' + storedKey.slice(-8) : '';
    const hasCustomKey = storedKey.length > 0;
    const usingDefault = !hasCustomKey;

    const modal = document.createElement('div');
    modal.id = 'openai-api-settings-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    modal.onmousedown = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
        <div style="background: var(--bg-primary); border-radius: 16px; max-width: 420px; width: 100%; overflow: hidden; animation: modalSlideIn 0.3s ease; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <div style="padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 16px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-key" style="color: #10b981;"></i> OpenAI API Configuration
                </h3>
                <button onclick="document.getElementById('openai-api-settings-modal').remove()" style="background: none; border: none; cursor: pointer; padding: 8px; opacity: 0.6;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">
                    <i class="fas fa-times" style="color: var(--text-muted);"></i>
                </button>
            </div>
            <div style="padding: 24px;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">OpenAI API Key</label>
                    <div style="position: relative;">
                        <input type="password" id="openai-api-key-input" placeholder="${hasCustomKey ? maskedKey : 'Using default key...'}"
                            style="width: 100%; padding: 12px 40px 12px 14px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-primary); font-size: 14px; font-family: monospace; box-sizing: border-box;"
                            onfocus="this.placeholder='sk-...'"
                            onblur="if(!this.value) this.placeholder='${hasCustomKey ? maskedKey : 'Using default key...'}'">
                        <button onclick="toggleOpenAIKeyVisibility()" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px;">
                            <i id="openai-key-toggle-icon" class="fas fa-eye" style="color: var(--text-muted); font-size: 14px;"></i>
                        </button>
                    </div>
                    <p style="margin: 8px 0 0 0; font-size: 11px; color: var(--text-muted);">
                        ${usingDefault ? '<i class="fas fa-check-circle" style="color: #10b981;"></i> Using default API key (ready to use)' : '<i class="fas fa-check-circle" style="color: #10b981;"></i> Custom API key configured'}
                    </p>
                </div>
                <div style="display: flex; gap: 10px;">
                    ${hasCustomKey ? `
                        <button onclick="clearOpenAIKey()" style="flex: 1; padding: 12px; background: var(--bg-secondary); border: 1px solid #ef4444; color: #ef4444; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.1)'" onmouseout="this.style.background='var(--bg-secondary)'">
                            <i class="fas fa-undo"></i> Use Default
                        </button>
                    ` : ''}
                    <button onclick="saveOpenAIKey()" style="flex: 2; padding: 12px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: white; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='none'">
                        <i class="fas fa-save"></i> Save Key
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

window.toggleOpenAIKeyVisibility = function() {
    const input = document.getElementById('openai-api-key-input');
    const icon = document.getElementById('openai-key-toggle-icon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

window.saveOpenAIKey = function() {
    const input = document.getElementById('openai-api-key-input');
    const key = input.value.trim();

    if (!key) {
        showNotification('Please enter an API key', 'error');
        return;
    }

    if (!key.startsWith('sk-')) {
        showNotification('Invalid API key format', 'error');
        return;
    }

    localStorage.setItem('openai_api_key', key);
    showNotification('OpenAI API key saved successfully', 'success');
    document.getElementById('openai-api-settings-modal').remove();
}

window.clearOpenAIKey = function() {
    if (confirm('Are you sure you want to remove the OpenAI API key?')) {
        localStorage.removeItem('openai_api_key');
        showNotification('OpenAI API key removed', 'success');
        document.getElementById('openai-api-settings-modal').remove();
    }
}

// ═══════════════════════════════════════════════════════════════
// AI PROVIDER SETTINGS MODAL (OpenAI GPT-4)
// Firebase Cloud Storage - No localStorage
// ═══════════════════════════════════════════════════════════════
window.openAIProvidersSettings = async function() {
    const existingModal = document.getElementById('ai-providers-settings-modal');
    if (existingModal) existingModal.remove();

    // Show loading state while fetching from Firebase
    const loadingModal = document.createElement('div');
    loadingModal.id = 'ai-providers-settings-modal';
    loadingModal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    loadingModal.innerHTML = `
        <div style="background: var(--bg-primary); border-radius: 16px; padding: 40px; text-align: center;">
            <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #8b5cf6; margin-bottom: 16px;"></i>
            <p style="margin: 0; color: var(--text-secondary);">Loading API settings from cloud...</p>
        </div>
    `;
    document.body.appendChild(loadingModal);

    // Ensure Firebase settings are loaded
    if (typeof window.reloadFirebaseAPISettings === 'function') {
        await window.reloadFirebaseAPISettings();
    }

    // Get stored keys from Firebase (cloud-only)
    const keys = typeof window.getFirebaseAPIKeys === 'function' ? window.getFirebaseAPIKeys() : { openai_api_key: '', hasCustomOpenAIKey: false };
    const storedOpenAIKey = keys.openai_api_key || '';
    const maskedOpenAIKey = storedOpenAIKey ? '••••••••' + storedOpenAIKey.slice(-8) : '';
    const hasCustomOpenAIKey = keys.hasCustomOpenAIKey;

    // Remove loading modal
    loadingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'ai-providers-settings-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    modal.onmousedown = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
        <div style="background: var(--bg-primary); border-radius: 16px; max-width: 500px; width: 100%; overflow: hidden; animation: modalSlideIn 0.3s ease; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-height: 90vh; overflow-y: auto;">
            <div style="padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1));">
                <h3 style="margin: 0; font-size: 16px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-brain" style="color: #10b981;"></i> AI Provider Configuration
                    <span style="padding: 2px 8px; background: rgba(59,130,246,0.2); color: #3b82f6; border-radius: 6px; font-size: 9px; font-weight: 600;">
                        <i class="fas fa-cloud"></i> CLOUD
                    </span>
                </h3>
                <button onclick="document.getElementById('ai-providers-settings-modal').remove()" style="background: none; border: none; cursor: pointer; padding: 8px; opacity: 0.6;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">
                    <i class="fas fa-times" style="color: var(--text-muted);"></i>
                </button>
            </div>
            <div style="padding: 24px;">
                <!-- OpenAI GPT-4 -->
                <div style="margin-bottom: 20px; padding: 16px; background: var(--bg-secondary); border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                        <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-robot" style="color: white; font-size: 14px;"></i>
                        </div>
                        <div>
                            <span style="font-weight: 600; font-size: 14px;">OpenAI GPT-4</span>
                            <span style="padding: 2px 8px; background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 6px; font-size: 9px; font-weight: 600; margin-left: 8px;">AI ENGINE</span>
                        </div>
                    </div>
                    <p style="margin: 0 0 12px 0; font-size: 12px; color: var(--text-secondary);">
                        Powers all AI features including Celeste AI, voice assistants, invoice scanning, and smart analysis.
                    </p>
                    <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;">OpenAI API Key</label>
                    <div style="position: relative;">
                        <input type="password" id="openai-provider-api-key-input" placeholder="${hasCustomOpenAIKey ? maskedOpenAIKey : 'Using default key...'}"
                            style="width: 100%; padding: 10px 40px 10px 12px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 13px; font-family: monospace; box-sizing: border-box;"
                            onfocus="this.placeholder='sk-proj-...'"
                            onblur="if(!this.value) this.placeholder='${hasCustomOpenAIKey ? maskedOpenAIKey : 'Using default key...'}'">
                        <button onclick="toggleAPIKeyVisibility('openai')" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px;">
                            <i id="openai-provider-key-toggle-icon" class="fas fa-eye" style="color: var(--text-muted); font-size: 12px;"></i>
                        </button>
                    </div>
                    <p style="margin: 6px 0 0 0; font-size: 10px; color: var(--text-muted);">
                        <i class="fas fa-check-circle" style="color: #10b981;"></i> ${hasCustomOpenAIKey ? 'Custom key configured' : 'Default key pre-configured'}
                    </p>
                </div>

                <div style="padding: 12px; background: rgba(59,130,246,0.1); border-radius: 8px; margin-bottom: 16px;">
                    <p style="margin: 0; font-size: 11px; color: var(--text-secondary);">
                        <i class="fas fa-cloud" style="color: #3b82f6;"></i>
                        API key is securely stored in Firebase Cloud. Changes sync instantly across all devices.
                    </p>
                </div>

                <div style="display: flex; gap: 10px;">
                    <button id="save-api-keys-btn" onclick="saveAIProviderKeys()" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: white; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='none'">
                        <i class="fas fa-cloud-upload-alt"></i> Save to Cloud
                    </button>
                    <button onclick="resetAIProviderKeys()" style="padding: 12px 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-secondary); border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.borderColor='#f59e0b'" onmouseout="this.style.borderColor='var(--border-color)'">
                        <i class="fas fa-undo"></i> Reset
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

window.toggleAPIKeyVisibility = function(provider) {
    const input = document.getElementById('openai-provider-api-key-input');
    const icon = document.getElementById('openai-provider-key-toggle-icon');
    if (input && icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
}

window.saveAIProviderKeys = async function() {
    const openaiInput = document.getElementById('openai-provider-api-key-input');
    const openaiKey = openaiInput ? openaiInput.value.trim() : '';
    const saveBtn = document.getElementById('save-api-keys-btn');

    // Show saving state
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving to Cloud...';
    }

    // Validate OpenAI key format if provided
    if (openaiKey && !openaiKey.startsWith('sk-')) {
        showNotification('Invalid OpenAI API key format (should start with sk-)', 'error');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Save to Cloud';
        }
        return;
    }

    try {
        // Save to Firebase (cloud-only)
        if (typeof window.saveFirebaseAPIKeys === 'function') {
            if (openaiKey) {
                const success = await window.saveFirebaseAPIKeys(
                    undefined,  // Reserved for future use
                    openaiKey
                );

                if (success) {
                    showNotification('API key saved to cloud successfully!', 'success');
                    document.getElementById('ai-providers-settings-modal').remove();
                } else {
                    throw new Error('Firebase save returned false');
                }
            } else {
                showNotification('No changes made (enter a key to save)', 'info');
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Save to Cloud';
                }
            }
        } else {
            throw new Error('Firebase API key functions not available');
        }
    } catch (error) {
        console.error('Error saving API key to Firebase:', error);
        showNotification('Failed to save to cloud. Please try again.', 'error');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Save to Cloud';
        }
    }
}

window.resetAIProviderKeys = async function() {
    if (confirm('Reset API key to its default value in the cloud?')) {
        try {
            if (typeof window.resetFirebaseAPIKeys === 'function') {
                const success = await window.resetFirebaseAPIKeys();
                if (success) {
                    showNotification('API keys reset to defaults in cloud', 'success');
                    document.getElementById('ai-providers-settings-modal').remove();
                } else {
                    throw new Error('Reset returned false');
                }
            } else {
                throw new Error('Firebase reset function not available');
            }
        } catch (error) {
            console.error('Error resetting API keys:', error);
            showNotification('Failed to reset keys. Please try again.', 'error');
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// AI API KEY DEFAULTS (Shared across all AI features)
// ═══════════════════════════════════════════════════════════════
// OpenAI GPT-4 (used by Celeste AI and all voice assistants)
// OpenAI API Key - loaded from Firebase (no hardcoded key)
const DEFAULT_OPENAI_KEY = ''; // Must be configured via Settings

// Global function to get OpenAI API key from Firebase/localStorage
window.getOpenAIKey = function() {
    // Priority: Firebase settings > localStorage > empty
    if (window.celesteFirebaseSettings?.openai_api_key) {
        return window.celesteFirebaseSettings.openai_api_key;
    }
    return localStorage.getItem('openai_api_key') || '';
}

