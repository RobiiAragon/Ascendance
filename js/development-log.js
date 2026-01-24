// ==========================================
// DEVELOPMENT LOG MODULE
// Track all development work and system changes
// ==========================================

const DEV_LOG_CATEGORIES = {
    feature: { label: 'New Feature', icon: 'fa-star', color: '#10b981' },
    fix: { label: 'Bug Fix', icon: 'fa-bug', color: '#ef4444' },
    enhancement: { label: 'Enhancement', icon: 'fa-arrow-up', color: '#6366f1' },
    ui: { label: 'UI/UX', icon: 'fa-paint-brush', color: '#ec4899' },
    security: { label: 'Security', icon: 'fa-shield-alt', color: '#f59e0b' },
    performance: { label: 'Performance', icon: 'fa-tachometer-alt', color: '#3b82f6' },
    refactor: { label: 'Refactor', icon: 'fa-code', color: '#8b5cf6' },
    migration: { label: 'Migration', icon: 'fa-database', color: '#14b8a6' }
};

let developmentLogs = [];

// Load development logs from Firebase
async function loadDevelopmentLogs() {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            const snapshot = await db.collection('developmentLogs')
                .orderBy('date', 'desc')
                .get();

            developmentLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // If no logs exist, populate with initial data
            if (developmentLogs.length === 0) {
                await populateInitialLogs();
            }
        }
    } catch (error) {
        console.error('Error loading development logs:', error);
        // Use local data as fallback
        if (developmentLogs.length === 0) {
            developmentLogs = getInitialLogs();
        }
    }
    return developmentLogs;
}

// Get initial logs data
function getInitialLogs() {
    return [
        // January 2026
        {
            id: 'log_034',
            date: '2026-01-24',
            title: 'Inventory Tasks Module',
            description: 'New module for daily inventory count tasks. Admins/managers can create inventory tasks by category (e.g., Herbal Vaporizers, Disposables) and assign them to AM or PM shifts. All stores see a grid view showing completion status with green checks for completed, red X for missed, and pending indicators. Employees click their store to view task details and mark as complete. Features include date navigation, recurring vs one-time tasks, activity logging, and Firebase integration for real-time sync across all stores.',
            category: 'feature',
            files: ['js/inventory-tasks.js', 'index.html', 'js/script.js', 'config/abundance-config.js'],
            developer: 'Carlos',
            requestedBy: 'Lauren'
        },
        {
            id: 'log_033',
            date: '2026-01-21',
            title: 'My Profile Modal',
            description: 'Added a My Profile modal that opens when clicking "My Profile" in the user dropdown menu. The modal displays the user\'s initials in a colored avatar, their name, role badge, email, assigned store, and employee ID. Clean modern design with icon labels.',
            category: 'feature',
            files: ['index.html', 'js/vendors-module.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_032',
            date: '2026-01-21',
            title: 'Add New Turn Button - Orange Color & Remove Cancel',
            description: 'Changed the "Add New Turn" button in the time editor modal from purple to orange gradient for better visual contrast with the Save button. Removed the Cancel button since the X close button at the top serves the same purpose, reducing UI clutter.',
            category: 'ui',
            files: ['js/daily-checklist.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_031',
            date: '2026-01-21',
            title: 'Multi-Employee Shift Display with Colors',
            description: 'Enhanced the schedule view to show ALL employees assigned to the same shift slot. Each employee now displays with their name, time range, and a colored left border (based on name hash) to distinguish them. Multiple employees in the same slot get a purple background. Clone and delete buttons properly positioned for each employee entry.',
            category: 'feature',
            files: ['js/daily-checklist.js'],
            developer: 'Carlos',
            requestedBy: 'Lauren'
        },
        {
            id: 'log_030',
            date: '2026-01-21',
            title: 'Schedule Slot UI Cleanup',
            description: 'Removed unnecessary box borders from individual shift employee entries for a cleaner aesthetic. Fixed clone/delete button overlap by adding proper CSS positioning. Clone button now at right:24px, delete at right:4px with appropriate padding.',
            category: 'ui',
            files: ['js/daily-checklist.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_029',
            date: '2026-01-21',
            title: 'Add New Turn Button Text',
            description: 'Added visible "Add New Turn" text to the button in the time editor modal. Previously only showed the user-plus icon which wasn\'t clear enough for users.',
            category: 'ui',
            files: ['js/daily-checklist.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_028',
            date: '2026-01-21',
            title: 'Add Another Employee Button in Edit Shift Modal',
            description: 'Added a purple "Add Another Employee" button (user-plus icon) to the Edit Shift modal. When editing an existing shift, users can now click this button to open the employee picker and add another person to the same shift slot. This makes it much easier to assign multiple employees to the same shift without having to navigate back to the schedule grid.',
            category: 'feature',
            files: ['js/daily-checklist.js'],
            developer: 'Carlos',
            requestedBy: 'Titi'
        },
        {
            id: 'log_027',
            date: '2026-01-21',
            title: 'Multi-Employee Shift - ADD Instead of REPLACE',
            description: 'Fixed critical issue where assigning an employee to a shift would REPLACE the existing employee instead of ADDING them. Now clicking on any employee in the picker adds them to the shift, allowing multiple employees per shift. Also added a helpful message: "You can add multiple employees! Just click on each employee you want to assign." Removed unused Incident Log from Security menu.',
            category: 'fix',
            files: ['js/daily-checklist.js', 'index.html'],
            developer: 'Carlos',
            requestedBy: 'Titi'
        },
        {
            id: 'log_025',
            date: '2026-01-21',
            title: 'Time Card Edit Buttons & PTO Edit Fix',
            description: 'Added edit buttons to the weekly employee time card view, allowing managers to edit attendance records directly from the time card modal. Also fixed a bug where approved PTO requests could not be edited - the system now properly handles locked date fields for approved requests while still allowing edits to the request type and notes.',
            category: 'fix',
            files: ['js/daily-checklist.js', 'js/pto-system.js'],
            developer: 'Carlos',
            requestedBy: 'Titi'
        },
        {
            id: 'log_024',
            date: '2026-01-21',
            title: 'Schedule View - Missing Employee Names Fix',
            description: 'Fixed an issue in the All Stores schedule view where some shift cards were showing only times without employee names. The fix now shows filled slots even when the employee lookup fails, using multiple fallbacks (employee record, schedule.employeeName, or "Unknown") to ensure names are always displayed.',
            category: 'fix',
            files: ['js/daily-checklist.js'],
            developer: 'Carlos',
            requestedBy: 'Titi'
        },
        {
            id: 'log_023',
            date: '2026-01-21',
            title: 'Attendance Edit - Record Not Found Fix',
            description: 'Fixed the "Record not found" error that occurred when trying to edit attendance records. The issue was caused by type mismatches between string and number IDs. Added robust ID comparison that handles both types, plus a Firebase fallback that loads records directly when not found in the local array.',
            category: 'fix',
            files: ['js/script.js'],
            developer: 'Carlos',
            requestedBy: 'Titi'
        },
        {
            id: 'log_022',
            date: '2026-01-21',
            title: 'Hours Calculation Fix for Firebase shiftStart/shiftEnd',
            description: 'Fixed a bug in hours calculation where Firebase schedules using shiftStart/shiftEnd field names were not being properly recognized. The system now checks for both startTime/endTime and shiftStart/shiftEnd field names when calculating scheduled hours.',
            category: 'fix',
            files: ['js/script.js'],
            developer: 'Carlos',
            requestedBy: 'Lauren'
        },
        {
            id: 'log_021',
            date: '2026-01-19',
            title: 'Attendance Breakdown & Inventory Improvements',
            description: 'Added detailed attendance breakdown view showing scheduled vs actual hours with variance tracking. Improved inventory module with better product categorization and stock level alerts. Various UI improvements per Lauren\'s requests.',
            category: 'enhancement',
            files: ['js/vendors-module.js', 'js/daily-checklist.js'],
            developer: 'Carlos',
            requestedBy: 'Lauren'
        },
        {
            id: 'log_020',
            date: '2026-01-17',
            title: 'User Menu Logout Dropdown',
            description: 'Added a clickable dropdown menu to the user profile section in the header. Clicking on the user name/avatar now opens a dropdown with "My Profile" and "Logout" options. This makes the logout option more visible and accessible since users were not finding it in the sidebar.',
            category: 'ui',
            files: ['index.html', 'js/vendors-module.js'],
            developer: 'Carlos',
            requestedBy: 'Daniel Barrantes'
        },
        {
            id: 'log_019',
            date: '2026-01-17',
            title: 'Customer Log - Simplified Rating Display',
            description: 'Removed emoji faces and star icons from the Customer Log perception ratings. The display now shows simple text labels (Very Upset, Upset, Neutral, Satisfied, Happy) for a cleaner, more professional look. Also changed the default view from gallery (boxes) to table (list) format for better tracking and readability.',
            category: 'ui',
            files: ['js/vendors-module.js'],
            developer: 'Carlos',
            requestedBy: 'Daniel Barrantes'
        },
        {
            id: 'log_018',
            date: '2026-01-17',
            title: 'Customer Log Menu Reorganization',
            description: 'Renamed "Customer Issue Log" to "Customer Log" and moved it from the Security section to the top of the Team section for better accessibility and organization.',
            category: 'ui',
            files: ['index.html', 'js/script.js'],
            developer: 'Carlos',
            requestedBy: 'Daniel Barrantes'
        },
        {
            id: 'log_017',
            date: '2026-01-16',
            title: 'Shift Exchanges Module Fix - Menu, Render & Responsive',
            description: 'Fixed multiple issues with the Shift Exchanges module that prevented it from working. 1) Menu Visibility: Added super admin bypass in filterNavigationByRole() so carlos@calidevs.com sees all menu items without role filtering. 2) Page Not Rendering: Changed DOM selector from getElementById("main-content") to querySelector(".dashboard") to match the actual HTML structure used by other pages. 3) Global Functions: Exposed all shift exchange functions (renderShiftExchangesPage, openRequestCoverageModal, approveShiftExchange, etc.) to the window object for proper navigation access. 4) Responsive Design: Improved mobile CSS with better breakpoints - stats grid shows 2x2 on mobile, filter tabs display as 2x2 grid on small screens, better spacing and sizing for cards and buttons on mobile devices.',
            category: 'fix',
            files: ['js/shift-exchanges.js', 'js/vendors-module.js', 'index.html'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_016',
            date: '2026-01-15',
            title: 'Pod Matcher Rewrite - Device vs Pods Mode',
            description: 'Complete rewrite of the Pod Matcher module with a new simpler flow designed for store employees. The old "compare 2 devices" mode was confusing for staff. New flow: Step 1 - upload 1 photo of customer\'s device (purple section), Step 2 - upload up to 4 photos of pods you have available (green 2x2 grid). AI then analyzes and ranks which pods are compatible with the device. Results show each pod with Compatible (green), Maybe (yellow), or Not Compatible (red) badges. The best compatible pod is highlighted with a trophy icon. Includes "Start Over" button, mobile responsive design with sticky analyze button, and clear step badges for guidance.',
            category: 'feature',
            files: ['js/pod-matcher.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_015',
            date: '2026-01-15',
            title: 'Announcement Likes/Comments Fix',
            description: 'Fixed critical bug where likes and comments on announcements were not working. The issue was caused by duplicate function definitions - toggleAnnouncementLike, toggleAnnouncementComments, addAnnouncementComment, and deleteAnnouncementComment were defined in both script.js and pod-matcher.js. Since pod-matcher.js loads after script.js, its versions would overwrite the correct ones. The pod-matcher.js versions only updated window.announcements but not the local announcements variable used by renderAnnouncements(), causing the UI to render with stale data. Removed the duplicate functions from pod-matcher.js so the properly synced versions in script.js are used.',
            category: 'fix',
            files: ['js/pod-matcher.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_014',
            date: '2026-01-15',
            title: 'Collapsible Sidebar Feature',
            description: 'Added ability to collapse the sidebar to show only icons, giving users more screen space for content. Click the collapse button (double arrows) at the bottom of the sidebar to toggle. When collapsed, the sidebar shrinks to 72px width showing only navigation icons. Hovering over icons shows a tooltip with the full name. The collapse state persists in localStorage so it remembers your preference. This feature only works on desktop - mobile devices keep the standard slide-out sidebar behavior. Fixed an issue where text was still visible when collapsed by using font-size: 0 technique since nav item text was not wrapped in spans.',
            category: 'feature',
            files: ['css/styles.css', 'js/vendors-module.js', 'index.html'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_013',
            date: '2026-01-15',
            title: 'Customer Issue Log - Removed Emojis',
            description: 'Replaced emoji faces in the Customer Issue Log perception ratings with Font Awesome icons for a more professional/sober appearance. The getPerceptionEmoji() function now returns Font Awesome icon HTML instead of emoji characters. Updated the perception distribution grid in the statistics section and the rating selector in the issue form. Icons used: fa-face-angry (1), fa-face-frown (2), fa-face-meh (3), fa-face-smile (4), fa-face-grin-beam (5).',
            category: 'ui',
            files: ['js/vendors-module.js'],
            developer: 'Carlos',
            requestedBy: 'Staff'
        },
        {
            id: 'log_012',
            date: '2026-01-15',
            title: 'Blank Excel Double-Click Fix',
            description: 'Fixed bug where the Blank Excel (G-Labs) module required clicking twice in the menu to open properly. The issue was that renderGLabs() was calling glabsLoadData() without awaiting it, so the first click would render the UI with no data, and only the second click would show the loaded data. Made both renderGLabs() and glabsLoadData() async functions and added proper await to ensure data is loaded before rendering.',
            category: 'fix',
            files: ['js/activity-log.js', 'js/g-labs.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_041',
            date: '2026-01-23',
            title: 'Cache-Busting and Project Documentation',
            description: 'Added version numbers to all JS script tags for cache-busting, ensuring users see the latest changes immediately. Created CLAUDE.md file with project instructions and custom rules for AI assistant including: mobile-first development, not breaking existing features, thinking before complex changes, and documenting in Development Log.',
            category: 'enhancement',
            files: ['index.html', 'CLAUDE.md'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_040',
            date: '2026-01-23',
            title: 'Running Low Bulk Actions',
            description: 'Added multi-select functionality to the Inventory Management (Running Low) module. Features include: checkbox on each row for individual selection, "Select All" checkbox in header, floating action bar showing selected count, bulk action modal to change Store/Urgency/Category/Order Status for multiple items at once, and bulk delete option. All changes sync to Firebase.',
            category: 'feature',
            files: ['js/daily-checklist.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_039',
            date: '2026-01-23',
            title: 'Push Notifications System Improvements',
            description: 'Fixed push notifications by adding missing Firebase Messaging SDK. Added automatic notification permission prompt modal that appears after login asking users to enable notifications. Modal displays in English with "Enable Notifications" and "Not now" options. Remembers dismissal for 7 days. Improved test notification function to properly save FCM token and test full end-to-end flow.',
            category: 'feature',
            files: ['index.html', 'js/notifications.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_038',
            date: '2026-01-23',
            title: 'Dashboard Redesign',
            description: 'Redesigned dashboard to show more useful information. Replaced Shopify-dependent Store Performance widget with Customer Issues widget showing open/follow-up counts. Replaced Sales Goal widget with PTO Requests showing pending approvals. Limited Recent Announcements to 4 most recent. Removed Shopify API calls that were not working for non-VSU stores.',
            category: 'enhancement',
            files: ['js/script.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_037',
            date: '2026-01-23',
            title: 'Customer Log Table Layout Fix',
            description: 'Fixed overlapping columns in the Customer Log (Order Issues) table. Added minimum widths to all columns and wrapped table in scrollable container for smaller screens. Columns now have proper spacing and text no longer overlaps.',
            category: 'fix',
            files: ['js/vendors-module.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_036',
            date: '2026-01-23',
            title: 'Attendance Location Column Update',
            description: 'Changed the Location column in attendance records to show the employee assigned store name (Miramar, Kearny Mesa, etc.) instead of GPS data. Disabled GPS location tracking as it was not being used. Simplified the getLocationDisplayForRecord() function.',
            category: 'enhancement',
            files: ['js/script.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_035',
            date: '2026-01-23',
            title: 'Clock Edit Bug Fix',
            description: 'Fixed "No changes detected" error when trying to edit clock in/out times. The issue was comparing null/undefined/empty values inconsistently. Added normalize() helper function to standardize comparison of empty values. Now users can properly edit clock records to add missing clock out times.',
            category: 'fix',
            files: ['js/script.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_034',
            date: '2026-01-23',
            title: 'Menu Cleanup and Reorganization',
            description: 'Hid unused menu items that are not being used: Celeste AI, Sales & Analytics, Best Sellers, Sales Performance, G-conomics. Items are commented out so they can be re-enabled later if needed. Moved Development Log and God Mode options to the bottom of the navigation menu for cleaner organization.',
            category: 'enhancement',
            files: ['index.html'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_011',
            date: '2026-01-15',
            title: 'Schedule/PTO Integration Fix',
            description: 'Fixed bug where approved days off were not properly blocking employees from being scheduled on those dates. The issue was that the day-off checks were only comparing employeeId against e.id, but some employees use firestoreId as their identifier. Updated the filtering logic in daily-checklist.js to check both e.id and e.firestoreId when determining if an employee has an approved day off. This fix was applied in three locations: the employee filter for scheduling, the day-off indicator display, and the scheduling validation.',
            category: 'fix',
            files: ['js/daily-checklist.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_010b',
            date: '2026-01-15',
            title: 'God Mode Navigation Fix',
            description: 'Fixed issue where clicking on God Mode menu items would not navigate to the page. The navigateTo() function was checking role permissions and blocking access because "superadmin" and "devlog" pages were not in the ROLE_PERMISSIONS allowed pages list. Added a special bypass for super admin pages that checks if the user email is carlos@calidevs.com before allowing access, maintaining security while enabling God Mode functionality.',
            category: 'fix',
            files: ['js/script.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_001',
            date: '2026-01-14',
            title: 'Development Log Module Created',
            description: 'Built a comprehensive Development Log module to track and document all system changes, bug fixes, new features, and improvements. The module includes a timeline view organized by month, category filters (Feature, Bug Fix, Enhancement, UI/UX, Security, Performance, Refactor, Migration), statistics cards showing total changes and monthly activity, and a modal form for adding new entries. Each entry displays the date, category badge, developer name, who requested the change, detailed description, and list of modified files. Also added a quick utility function logDevWork() for programmatic entry creation. This module serves as proof of all the work being done on the system.',
            category: 'feature',
            files: ['js/development-log.js', 'index.html', 'js/script.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_002',
            date: '2026-01-14',
            title: 'PTO Date Timezone Bug Fix',
            description: 'Fixed a critical timezone bug in the PTO (Paid Time Off) request system where dates were appearing as the previous day. The issue occurred because JavaScript was parsing date strings like "2026-01-14" as UTC midnight, which when converted to US timezones (UTC-5 to UTC-8) would display as January 13th instead of January 14th. Created a new parseLocalDate() helper function that splits the YYYY-MM-DD string and constructs a Date object using local time components. Updated 10+ locations throughout pto-system.js including renderPTORequestCard(), updatePTODuration(), updateEditPTODuration(), updateSelfPTODuration(), approvePTORequest(), and all date validation checks. This fix ensures employees see the correct dates they requested for their time off.',
            category: 'fix',
            files: ['js/pto-system.js'],
            developer: 'Carlos',
            requestedBy: 'Tiana Estrada'
        },
        {
            id: 'log_003',
            date: '2026-01-14',
            title: 'Pod Matcher - Dual Device Comparison Mode',
            description: 'Complete rewrite of the Pod Matcher module to support analyzing and comparing 2 vape devices simultaneously. Added a toggle button to switch between "Single Device" and "Compare 2 Devices" modes. In comparison mode, users can upload photos of two different devices, each with its own color-coded upload zone (Device 1 in purple, Device 2 in pink). The AI analyzes both devices separately using OpenAI Vision API, then merges the compatible product results. Products are tagged to show which device they work with - purple dot for Device 1, pink dot for Device 2, or a gradient dot for products compatible with both. Results are sorted to show dual-compatible products first. Added full responsive design with media queries for 900px and 600px breakpoints, including a sticky analyze button on mobile devices for easy access.',
            category: 'feature',
            files: ['js/pod-matcher.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_004',
            date: '2026-01-13',
            title: 'Super Admin God Mode Module',
            description: 'Created a comprehensive Super Admin module exclusively for carlos@calidevs.com with extensive administrative powers. Features include: (1) God Mode - ability to impersonate any user in the system and see the app from their perspective, (2) Database Explorer - browse, view, edit, and delete documents from any Firestore collection with real-time data display, (3) Live Monitor - real-time activity feed showing user actions, clock-ins, and system events using Firestore listeners, (4) Emergency Controls - maintenance mode toggle to lock out users, broadcast system-wide announcements, and force logout all users, (5) Mass Operations - bulk update or delete documents across collections, clone entire collections for backup, (6) Feature Flags - toggle system features on/off without code deployment, (7) Employee Management - view all employees with ability to permanently delete ("nuke") user accounts including all associated data. The module is completely hidden from non-super-admin users.',
            category: 'feature',
            files: ['js/super-admin.js', 'index.html', 'js/script.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_005',
            date: '2026-01-13',
            title: 'Employee Migration Utility',
            description: 'Developed a specialized migration utility for handling employee account changes when their email or authentication needs to be updated. The utility creates a new employee document with the updated email while preserving all historical data. It automatically migrates all related records across multiple collections: schedules (work shifts), clock-in/clock-out records (attendance history), day off requests (PTO submissions), and approved days off. Each migrated record is tagged with the original employee ID for audit trail purposes. Successfully used this utility to migrate Danny Barrantes from his old email (dbarrantes99@gmail.com) to his new work email (danny@mmwineliquor.com), transferring 2 schedules and preserving all his attendance history. The utility runs from the browser console while logged in as admin.',
            category: 'migration',
            files: ['js/migrate-employee.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_006',
            date: '2026-01-13',
            title: 'Password Manager Mobile Responsive Design',
            description: 'Implemented comprehensive mobile responsive styles for the Password Manager module to improve usability on smartphones and tablets. Added CSS classes to the filter bar elements for better targeting. Created media queries for 768px breakpoint (tablets) and 480px breakpoint (small phones). Changes include: filter bar stacks vertically on mobile with full-width search input, password list items reorganize with improved touch targets, grid cards adjust column count based on screen width, action buttons stack properly, modal dialogs are full-width on mobile with proper padding, and form inputs are sized appropriately for touch interaction. The password copy buttons and visibility toggles remain easily accessible on all screen sizes.',
            category: 'ui',
            files: ['css/styles.css', 'js/password-manager.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_007',
            date: '2026-01-10',
            title: 'Announcement Social Features - Likes & Comments',
            description: 'Added social interaction features to the announcements system, transforming it into a more engaging communication platform. Users can now like announcements with a single click, and their name is recorded with the like. The like count displays with a heart icon and shows who liked it on hover. Added a full commenting system where users can write comments, see all comments in a threaded view, and delete their own comments. Comments show the author name, relative timestamp (e.g., "2h ago", "3d ago"), and comment text. All likes and comments sync in real-time with Firebase Firestore, so changes appear instantly for all users viewing the announcement. Added formatRelativeTime() utility function for human-readable timestamps.',
            category: 'feature',
            files: ['js/pod-matcher.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_008',
            date: '2026-01-08',
            title: 'Daily Checklist Module Enhancements',
            description: 'Implemented multiple enhancements to the daily checklist module to improve store operations tracking. Added store-specific task lists so each location can have customized daily requirements. Implemented completion tracking with timestamps and employee attribution - managers can see who completed each task and when. Added manager approval workflow where supervisors can review and sign off on completed checklists. Created a history view showing past checklists with completion rates and any notes. Tasks can now be marked as critical (must complete) or optional. Added visual progress indicators showing percentage of tasks completed. The checklist resets daily at midnight local time, and incomplete critical tasks trigger notifications to managers.',
            category: 'enhancement',
            files: ['js/daily-checklist.js'],
            developer: 'Carlos',
            requestedBy: 'Management'
        },
        {
            id: 'log_009',
            date: '2026-01-05',
            title: 'PTO Request System - Complete Implementation',
            description: 'Built a complete PTO (Paid Time Off) / vacation request system from scratch. Employees can submit their own time off requests through a self-service interface, selecting request type (Vacation, Sick Leave, Personal Day, PTO), start date, end date, and optional reason. The system enforces a 30-day advance notice requirement for all requests. Managers receive pending requests in their dashboard and can approve or reject with optional notes. Approved requests automatically create entries in the days off calendar and block scheduling for those dates. Request cards show color-coded status (Pending in yellow, Approved in green, Rejected in red), duration calculation, and full audit trail of any edits. Employees can edit pending requests, and the system tracks edit history with timestamps and change descriptions.',
            category: 'feature',
            files: ['js/pto-system.js'],
            developer: 'Carlos',
            requestedBy: 'HR'
        },
        {
            id: 'log_010',
            date: '2026-01-03',
            title: 'Firebase Authentication Integration',
            description: 'Integrated Firebase Authentication to replace the previous authentication system, providing secure and scalable user management. Implemented email/password authentication with proper error handling for common issues (wrong password, user not found, email already in use). Added role-based access control (RBAC) with roles including employee, manager, admin, and super-admin. Each role has different permissions throughout the app - employees see their own data, managers see their store\'s data, admins see everything. Created employee self-registration flow where new hires can create their account using their work email, which automatically links to their employee record in Firestore. Added persistent sessions so users stay logged in across browser refreshes. Implemented secure logout that clears all local state and Firebase auth tokens.',
            category: 'security',
            files: ['js/firebase-utils.js', 'js/script.js'],
            developer: 'Carlos',
            requestedBy: 'Carlos'
        },
        {
            id: 'log_011',
            date: '2026-01-02',
            title: 'Vendor Invoice Management System',
            description: 'Created a comprehensive vendor invoice tracking system to manage accounts payable. Features include: adding invoices with vendor name, invoice number, amount, due date, and category assignment. Invoices can be marked with status (Pending, Partial, Paid, Overdue) and the system automatically flags overdue invoices based on due date. Added support for recurring invoices that automatically generate new entries on a schedule (weekly, monthly, quarterly). Built a financial projections view showing expected payments for the coming months based on recurring invoices and due dates. Added payment tracking where partial payments can be recorded against an invoice. Dashboard shows total outstanding balance, overdue amount, and payments due this week. Invoice cards display vendor info, amount, due date with color coding (red for overdue, yellow for due soon), and payment history.',
            category: 'feature',
            files: ['js/vendors-module.js', 'js/pto-system.js'],
            developer: 'Carlos',
            requestedBy: 'Accounting'
        }
    ];
}

// Populate initial logs to Firebase
async function populateInitialLogs() {
    const initialLogs = getInitialLogs();

    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            const batch = db.batch();

            initialLogs.forEach(log => {
                const docRef = db.collection('developmentLogs').doc(log.id);
                batch.set(docRef, {
                    ...log,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });

            await batch.commit();
            developmentLogs = initialLogs;
            console.log('Development logs populated successfully');
        }
    } catch (error) {
        console.error('Error populating development logs:', error);
        developmentLogs = initialLogs;
    }
}

// Sync missing logs to Firebase (adds new entries that don't exist yet)
async function syncDevelopmentLogs() {
    const initialLogs = getInitialLogs();

    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            const existingIds = developmentLogs.map(l => l.id);
            const newLogs = initialLogs.filter(l => !existingIds.includes(l.id));

            if (newLogs.length > 0) {
                const batch = db.batch();
                newLogs.forEach(log => {
                    const docRef = db.collection('developmentLogs').doc(log.id);
                    batch.set(docRef, {
                        ...log,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                });
                await batch.commit();
                console.log(`Synced ${newLogs.length} new development logs`);
                // Reload logs
                await loadDevelopmentLogs();
            }
        }
    } catch (error) {
        console.error('Error syncing development logs:', error);
    }
}
window.syncDevelopmentLogs = syncDevelopmentLogs;

// Render Development Log page
async function renderDevelopmentLog() {
    const dashboard = document.querySelector('.dashboard');

    // Show loading
    dashboard.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 300px;">
            <div style="text-align: center;">
                <i class="fas fa-code fa-3x fa-spin" style="color: var(--accent-primary); margin-bottom: 16px;"></i>
                <p style="color: var(--text-muted);">Loading development log...</p>
            </div>
        </div>
    `;

    await loadDevelopmentLogs();
    await syncDevelopmentLogs(); // Sync any new entries from code

    // Group logs by month
    const logsByMonth = {};
    developmentLogs.forEach(log => {
        const date = new Date(log.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        if (!logsByMonth[monthKey]) {
            logsByMonth[monthKey] = { label: monthLabel, logs: [] };
        }
        logsByMonth[monthKey].logs.push(log);
    });

    // Calculate stats
    const totalLogs = developmentLogs.length;
    const thisMonth = developmentLogs.filter(l => {
        const d = new Date(l.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const categoryStats = {};
    developmentLogs.forEach(log => {
        categoryStats[log.category] = (categoryStats[log.category] || 0) + 1;
    });

    dashboard.innerHTML = `
        <div class="page-header">
            <div class="page-header-left">
                <h2 class="section-title"><i class="fas fa-code" style="margin-right: 10px; color: var(--accent-primary);"></i>Development Log</h2>
                <p class="section-subtitle">Complete history of all system changes, features, and improvements</p>
            </div>
            <div class="page-header-right">
                <button onclick="openAddDevLogModal()" class="btn-primary" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-plus"></i> Add Entry
                </button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div class="card" style="padding: 20px; text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: var(--accent-primary);">${totalLogs}</div>
                <div style="font-size: 13px; color: var(--text-muted);">Total Changes</div>
            </div>
            <div class="card" style="padding: 20px; text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #10b981;">${thisMonth}</div>
                <div style="font-size: 13px; color: var(--text-muted);">This Month</div>
            </div>
            <div class="card" style="padding: 20px; text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #6366f1;">${categoryStats.feature || 0}</div>
                <div style="font-size: 13px; color: var(--text-muted);">New Features</div>
            </div>
            <div class="card" style="padding: 20px; text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #ef4444;">${categoryStats.fix || 0}</div>
                <div style="font-size: 13px; color: var(--text-muted);">Bug Fixes</div>
            </div>
        </div>

        <!-- Category Filter -->
        <div class="card" style="padding: 16px; margin-bottom: 20px;">
            <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
                <span style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-right: 8px;">Filter:</span>
                <button onclick="filterDevLogs('all')" class="dev-log-filter-btn active" data-filter="all">
                    <i class="fas fa-list"></i> All
                </button>
                ${Object.entries(DEV_LOG_CATEGORIES).map(([key, cat]) => `
                    <button onclick="filterDevLogs('${key}')" class="dev-log-filter-btn" data-filter="${key}" style="--cat-color: ${cat.color}">
                        <i class="fas ${cat.icon}"></i> ${cat.label}
                    </button>
                `).join('')}
            </div>
        </div>

        <!-- Timeline -->
        <div id="devLogTimeline" class="dev-log-timeline">
            ${Object.entries(logsByMonth).sort((a, b) => b[0].localeCompare(a[0])).map(([monthKey, monthData]) => `
                <div class="dev-log-month" data-month="${monthKey}">
                    <h3 class="dev-log-month-header">
                        <i class="fas fa-calendar-alt"></i> ${monthData.label}
                        <span class="dev-log-month-count">${monthData.logs.length} changes</span>
                    </h3>
                    <div class="dev-log-entries">
                        ${monthData.logs.map(log => renderDevLogEntry(log)).join('')}
                    </div>
                </div>
            `).join('')}
        </div>

        <style>
            .dev-log-filter-btn {
                padding: 6px 12px;
                border: 1px solid var(--border-color);
                border-radius: 20px;
                background: var(--bg-secondary);
                color: var(--text-secondary);
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .dev-log-filter-btn:hover {
                border-color: var(--accent-primary);
                color: var(--accent-primary);
            }

            .dev-log-filter-btn.active {
                background: var(--accent-primary);
                border-color: var(--accent-primary);
                color: white;
            }

            .dev-log-timeline {
                position: relative;
            }

            .dev-log-month {
                margin-bottom: 32px;
            }

            .dev-log-month-header {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 18px;
                font-weight: 700;
                color: var(--text-primary);
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 2px solid var(--accent-primary);
            }

            .dev-log-month-count {
                font-size: 12px;
                font-weight: 500;
                color: var(--text-muted);
                background: var(--bg-secondary);
                padding: 4px 10px;
                border-radius: 12px;
                margin-left: auto;
            }

            .dev-log-entries {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .dev-log-entry {
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 16px;
                position: relative;
                transition: all 0.2s;
            }

            .dev-log-entry:hover {
                border-color: var(--accent-primary);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
            }

            .dev-log-entry-header {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                margin-bottom: 10px;
            }

            .dev-log-category-icon {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .dev-log-category-icon i {
                color: white;
                font-size: 16px;
            }

            .dev-log-entry-title {
                font-size: 15px;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 4px;
            }

            .dev-log-entry-meta {
                font-size: 12px;
                color: var(--text-muted);
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
            }

            .dev-log-entry-description {
                font-size: 13px;
                color: var(--text-secondary);
                line-height: 1.6;
                margin-bottom: 12px;
            }

            .dev-log-entry-files {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }

            .dev-log-file-tag {
                font-size: 11px;
                padding: 3px 8px;
                background: var(--bg-secondary);
                border-radius: 4px;
                color: var(--text-muted);
                font-family: monospace;
            }

            @media (max-width: 600px) {
                .dev-log-entry-header {
                    flex-direction: column;
                }

                .dev-log-category-icon {
                    width: 32px;
                    height: 32px;
                }

                .dev-log-entry-meta {
                    flex-direction: column;
                    gap: 4px;
                }
            }
        </style>
    `;
}

// Render a single dev log entry
function renderDevLogEntry(log) {
    const category = DEV_LOG_CATEGORIES[log.category] || DEV_LOG_CATEGORIES.feature;
    const date = new Date(log.date);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    // Note: We filter out 'Claude AI' and 'Claude' from developer/requestedBy fields
    return `
        <div class="dev-log-entry" data-category="${log.category}">
            <div class="dev-log-entry-header">
                <div class="dev-log-category-icon" style="background: ${category.color};">
                    <i class="fas ${category.icon}"></i>
                </div>
                <div style="flex: 1;">
                    <div class="dev-log-entry-title">${log.title}</div>
                    <div class="dev-log-entry-meta">
                        <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                        <span><i class="fas fa-tag"></i> ${category.label}</span>
                        ${log.developer && log.developer !== 'Claude AI' && log.developer !== 'Claude' ? `<span><i class="fas fa-user-cog"></i> ${log.developer}</span>` : ''}
                        ${log.requestedBy && log.requestedBy !== 'Claude AI' && log.requestedBy !== 'Claude' ? `<span><i class="fas fa-user"></i> Requested by ${log.requestedBy}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="dev-log-entry-description">${log.description}</div>
            ${log.files && log.files.length > 0 ? `
                <div class="dev-log-entry-files">
                    ${log.files.map(f => `<span class="dev-log-file-tag"><i class="fas fa-file-code"></i> ${f}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// Filter logs by category
function filterDevLogs(category) {
    // Update active button
    document.querySelectorAll('.dev-log-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
    });

    // Filter entries
    document.querySelectorAll('.dev-log-entry').forEach(entry => {
        if (category === 'all' || entry.dataset.category === category) {
            entry.style.display = 'block';
        } else {
            entry.style.display = 'none';
        }
    });

    // Hide empty months
    document.querySelectorAll('.dev-log-month').forEach(month => {
        const visibleEntries = month.querySelectorAll('.dev-log-entry[style="display: block;"], .dev-log-entry:not([style])');
        const hasVisible = Array.from(visibleEntries).some(e => e.style.display !== 'none');
        month.style.display = hasVisible ? 'block' : 'none';
    });
}

// Open modal to add new dev log entry
function openAddDevLogModal() {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    const today = new Date().toISOString().split('T')[0];

    modalContent.innerHTML = `
        <div class="modal-header">
            <h2><i class="fas fa-plus-circle" style="color: var(--accent-primary);"></i> Add Development Entry</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Date *</label>
                <input type="date" class="form-input" id="dev-log-date" value="${today}">
            </div>

            <div class="form-group">
                <label>Title *</label>
                <input type="text" class="form-input" id="dev-log-title" placeholder="Brief title of the change...">
            </div>

            <div class="form-group">
                <label>Category *</label>
                <select class="form-input" id="dev-log-category">
                    ${Object.entries(DEV_LOG_CATEGORIES).map(([key, cat]) => `
                        <option value="${key}">${cat.label}</option>
                    `).join('')}
                </select>
            </div>

            <div class="form-group">
                <label>Description *</label>
                <textarea class="form-input" id="dev-log-description" rows="5" placeholder="Detailed description of what was done, why it was needed, and how it was implemented..."></textarea>
            </div>

            <div class="form-group">
                <label>Files Modified (comma-separated)</label>
                <input type="text" class="form-input" id="dev-log-files" placeholder="js/script.js, css/styles.css">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group">
                    <label>Developer</label>
                    <input type="text" class="form-input" id="dev-log-developer" value="Carlos">
                </div>
                <div class="form-group">
                    <label>Requested By</label>
                    <input type="text" class="form-input" id="dev-log-requested-by" placeholder="Who requested this change?">
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="saveDevLogEntry()">
                <i class="fas fa-save"></i> Save Entry
            </button>
        </div>
    `;

    modal.classList.add('active');
}

// Save new dev log entry
async function saveDevLogEntry() {
    const date = document.getElementById('dev-log-date')?.value;
    const title = document.getElementById('dev-log-title')?.value?.trim();
    const category = document.getElementById('dev-log-category')?.value;
    const description = document.getElementById('dev-log-description')?.value?.trim();
    const filesRaw = document.getElementById('dev-log-files')?.value?.trim();
    const developer = document.getElementById('dev-log-developer')?.value?.trim();
    const requestedBy = document.getElementById('dev-log-requested-by')?.value?.trim();

    if (!date || !title || !category || !description) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }

    const files = filesRaw ? filesRaw.split(',').map(f => f.trim()).filter(f => f) : [];

    const newLog = {
        id: 'log_' + Date.now(),
        date,
        title,
        category,
        description,
        files,
        developer: developer || 'Carlos',
        requestedBy: requestedBy || null,
        createdAt: new Date().toISOString()
    };

    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            await db.collection('developmentLogs').doc(newLog.id).set({
                ...newLog,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        developmentLogs.unshift(newLog);
        showNotification('Development entry added successfully!', 'success');
        closeModal();
        renderDevelopmentLog();

    } catch (error) {
        console.error('Error saving dev log:', error);
        showNotification('Error saving entry. Please try again.', 'error');
    }
}

// ==========================================
// QUICK ADD UTILITY - For logging work
// ==========================================

/**
 * Quick add a development log entry
 * Usage: await logDevWork('Title', 'Description', 'feature', ['file1.js'], 'Carlos')
 * Categories: feature, fix, enhancement, ui, security, performance, refactor, migration
 */
async function logDevWork(title, description, category = 'feature', files = [], requestedBy = 'Carlos') {
    const today = new Date().toISOString().split('T')[0];

    const newLog = {
        id: 'log_' + Date.now(),
        date: today,
        title,
        description,
        category,
        files: Array.isArray(files) ? files : [files],
        developer: 'Carlos',
        requestedBy,
        createdAt: new Date().toISOString()
    };

    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            await db.collection('developmentLogs').doc(newLog.id).set({
                ...newLog,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Dev log added:', title);
            developmentLogs.unshift(newLog);
            return true;
        }
    } catch (error) {
        console.error('Error adding dev log:', error);
    }
    return false;
}

// Make functions globally available
window.renderDevelopmentLog = renderDevelopmentLog;
window.openAddDevLogModal = openAddDevLogModal;
window.saveDevLogEntry = saveDevLogEntry;
window.filterDevLogs = filterDevLogs;
window.loadDevelopmentLogs = loadDevelopmentLogs;
window.logDevWork = logDevWork;

// ==========================================
// END DEVELOPMENT LOG MODULE
// ==========================================
