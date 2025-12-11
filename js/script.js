        // Page/View System
        const pages = {
            dashboard: document.getElementById('page-dashboard'),
            employees: null,
            training: null,
            licenses: null,
            analytics: null,
            newstuff: null,
            restock: null,
            abundancecloud: null,
            stores: null,
            announcements: null,
            tasks: null,
            schedule: null,
            settings: null,
            help: null,
            thieves: null,
            invoices: null,
            issues: null,
            gsuite: null,
            vendors: null,
            clockin: null,
            dailysales: null,
            cashout: null
        };

        // Current state
        let currentPage = 'dashboard';
        let employees = [
            { id: 1, name: 'Marcus Rodriguez', initials: 'MR', role: 'Store Manager', store: 'Miramar', status: 'active', email: 'marcus@vsu.com', phone: '(619) 555-0101', emergencyContact: 'Maria Rodriguez - (619) 555-0102', allergies: 'None', hireDate: '2023-01-15', color: 'a' },
            { id: 2, name: 'Sarah Kim', initials: 'SK', role: 'Sales Associate', store: 'Morena', status: 'active', email: 'sarah@vsu.com', phone: '(619) 555-0103', emergencyContact: 'John Kim - (619) 555-0104', allergies: 'Peanuts', hireDate: '2023-03-20', color: 'b' },
            { id: 3, name: 'James Thompson', initials: 'JT', role: 'Shift Lead', store: 'Kearny Mesa', status: 'active', email: 'james@vsu.com', phone: '(619) 555-0105', emergencyContact: 'Lisa Thompson - (619) 555-0106', allergies: 'None', hireDate: '2023-02-10', color: 'c' },
            { id: 4, name: 'Amanda Lopez', initials: 'AL', role: 'Sales Associate', store: 'Chula Vista', status: 'inactive', email: 'amanda@vsu.com', phone: '(619) 555-0107', emergencyContact: 'Carlos Lopez - (619) 555-0108', allergies: 'Shellfish', hireDate: '2023-05-01', color: 'd' },
            { id: 5, name: 'David Nguyen', initials: 'DN', role: 'Inventory Specialist', store: 'Miramar', status: 'active', email: 'david@vsu.com', phone: '(619) 555-0109', emergencyContact: 'Linh Nguyen - (619) 555-0110', allergies: 'None', hireDate: '2023-04-15', color: 'e' }
        ];

        let trainings = [
            { id: 1, title: 'Product Knowledge 101', type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '45 min', completion: 92, required: true },
            { id: 2, title: 'Customer Service Excellence', type: 'video', url: 'https://vimeo.com/148751763', duration: '30 min', completion: 78, required: true },
            { id: 3, title: 'Safety & Compliance', type: 'document', url: '#', duration: '20 min', completion: 85, required: true },
            { id: 4, title: 'POS System Training', type: 'video', url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', duration: '60 min', completion: 64, required: true }
        ];

        let licenses = [
            { id: 1, name: 'Business License', store: 'Miramar', expires: '2025-12-31', status: 'valid', file: 'business_license_miramar.pdf' },
            { id: 2, name: 'Tobacco License', store: 'Morena', expires: '2026-01-15', status: 'expiring', file: 'tobacco_license_morena.pdf' },
            { id: 3, name: 'Health Permit', store: 'Kearny Mesa', expires: '2026-03-20', status: 'valid', file: 'health_permit_kearny.pdf' },
            { id: 4, name: 'Fire Safety Certificate', store: 'Chula Vista', expires: '2026-02-10', status: 'expiring', file: 'fire_safety_chula.pdf' },
            { id: 5, name: 'Business License', store: 'Morena', expires: '2025-11-30', status: 'valid', file: 'business_license_morena.pdf' },
            { id: 6, name: 'Business License', store: 'Kearny Mesa', expires: '2026-06-15', status: 'valid', file: 'business_license_kearny.pdf' }
        ];

        let announcements = [
            { id: 1, date: '2025-12-02', title: 'Holiday Schedule', content: 'Holiday schedule updates have been posted. Please check your shifts for the upcoming weeks.', author: 'Carlos Admin' },
            { id: 2, date: '2025-11-28', title: 'New Product Line', content: 'New product line arriving next week - mandatory training session on Thursday.', author: 'Carlos Admin' },
            { id: 3, date: '2025-11-25', title: 'Q4 Achievement', content: 'Congratulations to VSU Miramar for hitting Q4 sales targets! 🎉', author: 'Carlos Admin' }
        ];

        let products = [
            { id: 1, name: 'JUUL Starter Kit', category: 'Vape Devices', quantity: 24, arrivalDate: '2025-12-10', store: 'Miramar', status: 'pending', supplier: 'JUUL Labs', price: 34.99 },
            { id: 2, name: 'VUSE Alto Pods - Menthol', category: 'Vape Pods', quantity: 48, arrivalDate: '2025-12-08', store: 'Morena', status: 'arrived', supplier: 'VUSE', price: 12.99 },
            { id: 3, name: 'Elf Bar BC5000 - Mixed Flavors', category: 'Disposables', quantity: 120, arrivalDate: '2025-12-15', store: 'Kearny Mesa', status: 'pending', supplier: 'Elf Bar', price: 15.99 },
            { id: 4, name: 'Marlboro Red Box', category: 'Cigarettes', quantity: 200, arrivalDate: '2025-12-12', store: 'Chula Vista', status: 'pending', supplier: 'Philip Morris', price: 8.99 },
            { id: 5, name: 'Puff Bar Plus', category: 'Disposables', quantity: 80, arrivalDate: '2025-12-07', store: 'Miramar', status: 'arrived', supplier: 'Puff Bar', price: 13.99 },
            { id: 6, name: 'SMOK Nord 4 Kit', category: 'Vape Devices', quantity: 15, arrivalDate: '2025-12-20', store: 'Morena', status: 'pending', supplier: 'SMOK', price: 42.99 }
        ];

        let inventory = [
            { id: 1, brand: 'JUUL', productName: 'JUUL Starter Kit', flavor: 'Virginia Tobacco', volume: '0.7ml', nicotine: '5%', unitPrice: 34.99, minStock: 10, stock: 5, store: 'Miramar' },
            { id: 2, brand: 'VUSE', productName: 'Alto Pods', flavor: 'Menthol', volume: '1.8ml', nicotine: '5%', unitPrice: 12.99, minStock: 20, stock: 15, store: 'Morena' },
            { id: 3, brand: 'Elf Bar', productName: 'BC5000', flavor: 'Blue Razz Ice', volume: '13ml', nicotine: '50mg', unitPrice: 15.99, minStock: 50, stock: 45, store: 'Kearny Mesa' },
            { id: 4, brand: 'Marlboro', productName: 'Red Box', flavor: 'Original', volume: 'N/A', nicotine: 'Full', unitPrice: 8.99, minStock: 100, stock: 80, store: 'Chula Vista' },
            { id: 5, brand: 'Puff Bar', productName: 'Puff Plus', flavor: 'Mango', volume: '3.2ml', nicotine: '50mg', unitPrice: 13.99, minStock: 30, stock: 12, store: 'Miramar' },
            { id: 6, brand: 'SMOK', productName: 'Nord 4 Kit', flavor: 'N/A', volume: 'N/A', nicotine: 'N/A', unitPrice: 42.99, minStock: 15, stock: 8, store: 'Morena' },
            { id: 7, brand: 'Newport', productName: 'Menthol', flavor: 'Menthol', volume: 'N/A', nicotine: 'Full', unitPrice: 9.49, minStock: 100, stock: 120, store: 'Miramar' },
            { id: 8, brand: 'Hyde', productName: 'Edge Rave', flavor: 'Strawberry Kiwi', volume: '10ml', nicotine: '50mg', unitPrice: 14.99, minStock: 40, stock: 25, store: 'Kearny Mesa' },
            { id: 9, brand: 'RELX', productName: 'Infinity', flavor: 'Classic Tobacco', volume: '1.9ml', nicotine: '3%', unitPrice: 39.99, minStock: 12, stock: 3, store: 'Chula Vista' },
            { id: 10, brand: 'Camel', productName: 'Blue', flavor: 'Light', volume: 'N/A', nicotine: 'Light', unitPrice: 8.49, minStock: 80, stock: 95, store: 'Morena' },
            { id: 11, brand: 'Lost Mary', productName: 'OS5000', flavor: 'Watermelon Ice', volume: '13ml', nicotine: '50mg', unitPrice: 16.99, minStock: 35, stock: 42, store: 'Miramar' },
            { id: 12, brand: 'Geek Bar', productName: 'Pulse', flavor: 'Fcuking Fab', volume: '16ml', nicotine: '50mg', unitPrice: 18.99, minStock: 25, stock: 18, store: 'Kearny Mesa' },
            { id: 13, brand: 'JUUL', productName: 'JUUL Starter Kit', flavor: 'Virginia Tobacco', volume: '0.7ml', nicotine: '5%', unitPrice: 34.99, minStock: 10, stock: 8, store: 'Morena' },
            { id: 14, brand: 'Elf Bar', productName: 'BC5000', flavor: 'Blue Razz Ice', volume: '13ml', nicotine: '50mg', unitPrice: 15.99, minStock: 50, stock: 52, store: 'Miramar' },
            { id: 15, brand: 'Marlboro', productName: 'Red Box', flavor: 'Original', volume: 'N/A', nicotine: 'Full', unitPrice: 8.99, minStock: 100, stock: 105, store: 'Miramar' },
            { id: 16, brand: 'VUSE', productName: 'Alto Pods', flavor: 'Menthol', volume: '1.8ml', nicotine: '5%', unitPrice: 12.99, minStock: 20, stock: 22, store: 'Chula Vista' }
        ];

        let restockRequests = [
            { id: 1, productName: 'JUUL Starter Kit', quantity: 20, store: 'Miramar', requestedBy: 'Marcus Rodriguez', requestDate: '2025-12-03', status: 'pending', priority: 'high', notes: 'Running low, high demand' },
            { id: 2, productName: 'Puff Bar Plus', quantity: 30, store: 'Morena', requestedBy: 'Sarah Kim', requestDate: '2025-12-02', status: 'approved', priority: 'medium', notes: 'Restock for weekend rush' },
            { id: 3, productName: 'RELX Infinity', quantity: 15, store: 'Kearny Mesa', requestedBy: 'James Thompson', requestDate: '2025-12-01', status: 'pending', priority: 'high', notes: 'Stock critically low' }
        ];

        // Treasury - Select Pieces Collection
        let treasuryItems = [
            {
                id: 1,
                artworkName: 'Vintage Tobacco Advertisement',
                artist: 'Unknown',
                manufacturer: 'Philip Morris',
                acquisitionDate: '2024-03-15',
                value: 2500.00,
                location: 'VSU Kearny Mesa',
                photos: [],
                description: 'Original 1940s tobacco advertisement poster in excellent condition'
            },
            {
                id: 2,
                artworkName: 'Neon Sign Collection',
                artist: 'Custom Neon Works',
                manufacturer: 'SignCraft Industries',
                acquisitionDate: '2023-11-20',
                value: 4800.00,
                location: 'VSU Miramar',
                photos: [],
                description: 'Set of three vintage neon signs from the 1960s'
            }
        ];

        // Cash Out Records
        let cashOutRecords = [
            {
                id: 1,
                name: 'Office Supplies',
                amount: 150.00,
                reason: 'Printer paper and ink cartridges',
                createdDate: '2025-12-08',
                createdBy: 'Carlos Admin',
                status: 'open',
                closedDate: null,
                receiptPhoto: null,
                amountSpent: null,
                moneyLeft: null,
                hasMoneyLeft: null
            },
            {
                id: 2,
                name: 'Store Maintenance',
                amount: 300.00,
                reason: 'Cleaning supplies and minor repairs',
                createdDate: '2025-12-05',
                createdBy: 'Marcus Rodriguez',
                status: 'closed',
                closedDate: '2025-12-06',
                receiptPhoto: null,
                amountSpent: 285.50,
                moneyLeft: 14.50,
                hasMoneyLeft: true
            },
            {
                id: 3,
                name: 'Team Lunch',
                amount: 200.00,
                reason: 'Employee appreciation lunch',
                createdDate: '2025-12-03',
                createdBy: 'Sarah Kim',
                status: 'closed',
                closedDate: '2025-12-03',
                receiptPhoto: null,
                amountSpent: 200.00,
                moneyLeft: 0.00,
                hasMoneyLeft: false
            }
        ];

        // Issues Database
        let issues = [
            {
                id: 1,
                customer: 'John Smith',
                type: 'In Store',
                description: 'Customer received wrong product in their order',
                incidentDate: '2025-12-08',
                status: 'open',
                createdBy: 'Marcus Rodriguez',
                createdDate: '2025-12-08',
                solution: null,
                resolvedBy: null,
                resolutionDate: null
            },
            {
                id: 2,
                customer: 'Maria Garcia',
                type: 'Online',
                description: 'Payment was charged twice for the same order',
                incidentDate: '2025-12-07',
                status: 'in_progress',
                createdBy: 'Sarah Kim',
                createdDate: '2025-12-07',
                solution: null,
                resolvedBy: null,
                resolutionDate: null
            },
            {
                id: 3,
                customer: 'Robert Johnson',
                type: 'In Store',
                description: 'Product defective - vape device not working',
                incidentDate: '2025-12-05',
                status: 'resolved',
                createdBy: 'James Thompson',
                createdDate: '2025-12-05',
                solution: 'Replaced device with new unit and tested before customer left',
                resolvedBy: 'James Thompson',
                resolutionDate: '2025-12-05'
            }
        ];

        // Vendors Database
        let vendors = [
            {
                id: 1,
                name: 'VaporHub Distributors',
                category: 'Vape Products',
                contact: 'John Martinez',
                phone: '(800) 555-0101',
                email: 'sales@vaporhub.com',
                website: 'https://www.vaporhub.com',
                access: 'Online Portal - Account #VH12345',
                products: 'Disposable vapes, Pod systems, E-liquids, Accessories',
                orderMethods: 'Online portal, Phone orders, Email orders',
                notes: 'Net 30 payment terms, Free shipping over $500'
            },
            {
                id: 2,
                name: 'Premium Tobacco Supply',
                category: 'Tobacco Products',
                contact: 'Sarah Johnson',
                phone: '(800) 555-0202',
                email: 'orders@premiumtobacco.com',
                website: 'https://www.premiumtobacco.com',
                access: 'Account Manager: Sarah - Direct line (800) 555-0203',
                products: 'Cigarettes, Cigars, Rolling papers, Lighters',
                orderMethods: 'Phone orders (preferred), Email',
                notes: 'Minimum order $1000, Weekly deliveries on Thursdays'
            },
            {
                id: 3,
                name: 'Beverage Wholesale Direct',
                category: 'Beverages',
                contact: 'Mike Chen',
                phone: '(800) 555-0303',
                email: 'info@beveragewholesale.com',
                website: 'https://www.beveragewholesale.com',
                access: 'Online ordering system - Username: VSU_Admin',
                products: 'Energy drinks, Sodas, Water, Sports drinks, Coffee',
                orderMethods: 'Online portal (24/7), Phone (business hours)',
                notes: 'Next day delivery available, Volume discounts'
            },
            {
                id: 4,
                name: 'Snack Solutions Inc',
                category: 'Snacks & Candy',
                contact: 'Lisa Rodriguez',
                phone: '(800) 555-0404',
                email: 'sales@snacksolutions.com',
                website: 'https://www.snacksolutions.com',
                access: 'Rep visits monthly, Online catalog access',
                products: 'Chips, Candy bars, Gum, Cookies, Nuts',
                orderMethods: 'Mobile app, Website, Sales rep',
                notes: 'Flexible payment terms, Returns accepted'
            },
            {
                id: 5,
                name: 'General Supplies Co',
                category: 'Store Supplies',
                contact: 'David Park',
                phone: '(800) 555-0505',
                email: 'support@generalsupplies.com',
                website: 'https://www.generalsupplies.com',
                access: 'Amazon Business account linked',
                products: 'Bags, Receipt paper, Cleaning supplies, Office supplies',
                orderMethods: 'Amazon Business, Direct website, Phone',
                notes: 'Prime shipping available, Bulk discounts'
            }
        ];

        /**
         * Initialize Firebase and load employees from Firestore
         * This function is called when the page loads
         */
        async function initializeFirebaseEmployees() {
            console.log('Initializing Firebase for employee management...');
            
            // Initialize Firebase manager
            const initialized = await firebaseEmployeeManager.initialize();
            
            if (initialized) {
                try {
                    // Load employees from Firestore
                    const firestoreEmployees = await firebaseEmployeeManager.loadEmployees();
                    
                    if (firestoreEmployees && firestoreEmployees.length > 0) {
                        console.log('Loaded employees from Firestore:', firestoreEmployees);
                        
                        // Map Firestore data to the local employees array
                        // This maintains compatibility with existing code while loading from Firebase
                        employees = firestoreEmployees.map(emp => ({
                            id: emp.firestoreId || emp.id,
                            firestoreId: emp.firestoreId || emp.id,
                            name: emp.name || '',
                            email: emp.email || '',
                            phone: emp.phone || '',
                            store: emp.store || 'Miramar',
                            status: emp.status || 'active',
                            role: emp.role || window.EMPLOYEE_ROLES?.EMPLOYEE || 'employee', // Role from Firestore
                            employeeType: emp.employeeType || 'regular', // admin, manager, employee
                            hireDate: emp.hireDate || new Date().toISOString().split('T')[0],
                            emergencyContact: emp.emergencyContact || '',
                            allergies: emp.allergies || 'None',
                            initials: (emp.name || 'X').split(' ').map(n => n[0]).join(''),
                            color: emp.color || ['a', 'b', 'c', 'd', 'e'][Math.floor(Math.random() * 5)]
                        }));
                        
                        console.log(`Successfully loaded ${employees.length} employees from Firestore`);
                        return true;
                    }
                } catch (error) {
                    console.error('Error loading employees from Firestore:', error);
                }
            } else {
                console.warn('Firebase not available. Using fallback data.');
            }
            
            return false;
        }

        /**
         * Save employee to Firebase
         */
        async function saveEmployeeToFirebase(employeeData) {
            if (!firebaseEmployeeManager.isInitialized) {
                console.warn('Firebase not initialized');
                return null;
            }

            try {
                if (employeeData.firestoreId) {
                    // Update existing
                    const success = await firebaseEmployeeManager.updateEmployee(
                        employeeData.firestoreId,
                        employeeData
                    );
                    return success ? employeeData.firestoreId : null;
                } else {
                    // Create new
                    const newId = await firebaseEmployeeManager.addEmployee(employeeData);
                    return newId;
                }
            } catch (error) {
                console.error('Error saving employee to Firebase:', error);
                return null;
            }
        }

        /**
         * Delete employee from Firebase
         */
        async function deleteEmployeeFromFirebase(firestoreId) {
            if (!firebaseEmployeeManager.isInitialized) {
                console.warn('Firebase not initialized');
                return false;
            }

            try {
                return await firebaseEmployeeManager.deleteEmployee(firestoreId);
            } catch (error) {
                console.error('Error deleting employee from Firebase:', error);
                return false;
            }
        }

        /**
         * Update employee role in Firebase
         */
        async function updateEmployeeRoleInFirebase(firestoreId, newRole) {
            if (!firebaseEmployeeManager.isInitialized) {
                console.warn('Firebase not initialized');
                return false;
            }

            try {
                return await firebaseEmployeeManager.updateEmployeeRole(firestoreId, newRole);
            } catch (error) {
                console.error('Error updating employee role in Firebase:', error);
                return false;
            }
        }

        // Navigation handler
        function navigateTo(page) {
            // Check if user has permission to access this page
            const user = getCurrentUser();
            const userRole = user.role || 'employee';
            const userPermissions = window.ROLE_PERMISSIONS[userRole] || window.ROLE_PERMISSIONS['employee'];
            const allowedPages = userPermissions.pages || [];
            
            // If page not in allowed list, deny access
            if (!allowedPages.includes(page)) {
                alert(`❌ Acceso denegado. Tu rol de ${userPermissions.label} no tiene permiso para acceder a esta página.`);
                return;
            }
            
            currentPage = page;
            
            // Update nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.page === page) {
                    item.classList.add('active');
                }
            });

            // Update page title
            const titles = {
                dashboard: 'Dashboard',
                employees: 'Employees',
                training: 'Training Center',
                licenses: 'Licenses & Documents',
                analytics: 'Sales Analytics',
                stores: 'Store Management',
                announcements: 'Announcements',
                tasks: 'Tasks & Checklists',
                schedule: 'Schedule',
                settings: 'Settings',
                help: 'Help Center',
                thieves: 'Thieves Database',
                invoices: 'Invoices',
                issues: 'Issues',
                vendors: 'Vendors',
                clockin: 'Clock In/Out',
                dailysales: 'Daily Sales',
                cashout: 'Cash Out',
                treasury: 'Treasury - Select Pieces',
                gconomics: 'Gconomics',
                gforce: 'G Force',
                abundancecloud: 'Abundance Cloud',
                newstuff: 'New Stuff'
            };
            document.querySelector('.page-title').textContent = titles[page] || 'Dashboard';

            // Render page content
            renderPage(page);
        }

        function renderPage(page) {
            console.log('renderPage called with:', page);
            const dashboard = document.querySelector('.dashboard');

            switch(page) {
                case 'dashboard':
                    renderDashboard();
                    break;
                case 'employees':
                    renderEmployees();
                    break;
                case 'training':
                    renderTraining();
                    break;
                case 'licenses':
                    renderLicenses();
                    break;
                case 'analytics':
                    if (typeof renderAnalyticsWithData === 'function') { renderAnalyticsWithData(); } else { renderAnalytics(); }
                    break;
                case 'newstuff':
                    renderNewStuff();
                    break;
                case 'restock':
                    renderRestockRequests();
                    break;
                case 'abundancecloud':
                    renderAbundanceCloud();
                    break;
                case 'stores':
                    renderStores();
                    break;
                case 'announcements':
                    renderAnnouncements();
                    break;
                case 'schedule':
                    renderSchedule();
                    break;
                case 'thieves':
                    renderThieves();
                    break;
                case 'invoices':
                    renderInvoices();
                    break;
                case 'issues':
                    renderIssues();
                    break;
                case 'gconomics':
                    renderGconomics();
                    break;
                case 'vendors':
                    renderVendors();
                    break;
                case 'clockin':
                    renderClockIn();
                    break;
                case 'dailysales':
                    renderDailySales();
                    break;
                case 'cashout':
                    renderCashOut();
                    break;
                case 'treasury':
                    renderTreasury();
                    break;
                default:
                    renderDashboard();
            }
        }

        function renderDashboard() {
            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <!-- Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon purple"><i class="fas fa-users"></i></div>
                            <div class="stat-trend up"><i class="fas fa-arrow-up"></i> +2</div>
                        </div>
                        <div class="stat-value">${employees.length}</div>
                        <div class="stat-label">Total Employees</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon green"><i class="fas fa-dollar-sign"></i></div>
                            <div class="stat-trend up"><i class="fas fa-arrow-up"></i> +12.5%</div>
                        </div>
                        <div class="stat-value">$48.2K</div>
                        <div class="stat-label">Monthly Revenue</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon blue"><i class="fas fa-file-alt"></i></div>
                            <div class="stat-trend down"><i class="fas fa-exclamation"></i> 2 expiring</div>
                        </div>
                        <div class="stat-value">${licenses.length}</div>
                        <div class="stat-label">Active Licenses</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <a href="#" class="quick-action" onclick="navigateTo('employees'); setTimeout(() => openModal('add-employee'), 100); return false;">
                        <div class="quick-action-icon"><i class="fas fa-user-plus"></i></div>
                        <span class="quick-action-label">Add Employee</span>
                    </a>
                    <a href="#" class="quick-action" onclick="navigateTo('training'); setTimeout(() => openModal('add-training'), 100); return false;">
                        <div class="quick-action-icon"><i class="fas fa-video"></i></div>
                        <span class="quick-action-label">Upload Training</span>
                    </a>
                    <a href="#" class="quick-action" onclick="navigateTo('licenses'); setTimeout(() => openModal('add-license'), 100); return false;">
                        <div class="quick-action-icon"><i class="fas fa-file-upload"></i></div>
                        <span class="quick-action-label">Add License</span>
                    </a>
                    <a href="#" class="quick-action" onclick="navigateTo('analytics'); return false;">
                        <div class="quick-action-icon"><i class="fas fa-chart-bar"></i></div>
                        <span class="quick-action-label">View Reports</span>
                    </a>
                </div>

                <!-- Cards Grid -->
                <div class="cards-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-users"></i> Recent Employees</h3>
                            <button class="card-action" onclick="navigateTo('employees')">View All</button>
                        </div>
                        <div class="card-body">
                            <div class="employee-list">
                                ${employees.slice(0, 5).map(emp => `
                                    <div class="employee-item" onclick="viewEmployee(${emp.id})">
                                        <div class="employee-avatar ${emp.color}">${emp.initials}</div>
                                        <div class="employee-info">
                                            <div class="employee-name">${emp.name}</div>
                                            <div class="employee-role">${emp.role}</div>
                                        </div>
                                        <span class="employee-store">${emp.store}</span>
                                        <div class="employee-status ${emp.status}"></div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    
                </div>

                <!-- Bottom Grid -->
                <div class="bottom-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-trophy"></i> Store Performance</h3>
                            <button class="card-action" onclick="navigateTo('analytics')">Details</button>
                        </div>
                        <div class="card-body">
                            <div class="store-performance">
                                <div class="store-item">
                                    <div class="store-rank first">1</div>
                                    <div class="store-details">
                                        <div class="store-name">VSU Miramar</div>
                                        <div class="store-sales">142 orders this week</div>
                                    </div>
                                    <div class="store-amount">$15,420</div>
                                </div>
                                <div class="store-item">
                                    <div class="store-rank second">2</div>
                                    <div class="store-details">
                                        <div class="store-name">VSU Kearny Mesa</div>
                                        <div class="store-sales">118 orders this week</div>
                                    </div>
                                    <div class="store-amount">$12,890</div>
                                </div>
                                <div class="store-item">
                                    <div class="store-rank third">3</div>
                                    <div class="store-details">
                                        <div class="store-name">VSU Chula Vista</div>
                                        <div class="store-sales">96 orders this week</div>
                                    </div>
                                    <div class="store-amount">$10,340</div>
                                </div>
                                <div class="store-item">
                                    <div class="store-rank fourth">4</div>
                                    <div class="store-details">
                                        <div class="store-name">VSU Morena</div>
                                        <div class="store-sales">87 orders this week</div>
                                    </div>
                                    <div class="store-amount">$9,550</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-file-certificate"></i> Licenses Status</h3>
                            <button class="card-action" onclick="navigateTo('licenses')">Upload</button>
                        </div>
                        <div class="card-body">
                            <div class="licenses-grid">
                                ${licenses.slice(0, 4).map(lic => `
                                    <div class="license-card">
                                        <div class="license-icon ${lic.status}">
                                            <i class="fas fa-${lic.status === 'valid' ? 'check-circle' : 'clock'}"></i>
                                        </div>
                                        <div class="license-info">
                                            <div class="license-name">${lic.name} - ${lic.store}</div>
                                            <div class="license-meta">Expires: ${formatDate(lic.expires)}</div>
                                        </div>
                                        <span class="license-status ${lic.status}">${lic.status.charAt(0).toUpperCase() + lic.status.slice(1)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-bullhorn"></i> Recent Announcements</h3>
                            <button class="card-action" onclick="navigateTo('announcements')">Post New</button>
                        </div>
                        <div class="card-body">
                            <div class="announcement-list">
                                ${announcements.map(ann => `
                                    <div class="announcement-item">
                                        <div class="announcement-date">${formatDate(ann.date)}</div>
                                        <div class="announcement-text">${ann.content}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        async function renderEmployees() {
            const dashboard = document.querySelector('.dashboard');

            // Show loading state first
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Employee Directory</h2>
                        <p class="section-subtitle">Manage your team across all stores</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('add-employee')">
                        <i class="fas fa-plus"></i> Add Employee
                    </button>
                </div>

                <div class="filters-bar">
                    <div class="search-filter">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Search employees..." id="employee-search" onkeyup="filterEmployees()">
                    </div>
                    <select class="filter-select" id="store-filter" onchange="filterEmployees()">
                        <option value="">All Stores</option>
                        <option value="Miramar">VSU Miramar</option>
                        <option value="Morena">VSU Morena</option>
                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                        <option value="Chula Vista">VSU Chula Vista</option>
                    </select>
                    <select class="filter-select" id="status-filter" onchange="filterEmployees()">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <button class="btn-secondary" onclick="refreshEmployeesFromFirebase()" title="Refresh from database">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>

                <div class="employees-grid" id="employees-grid">
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading employees...</p>
                    </div>
                </div>
            `;

            // Load employees from Firebase
            await loadEmployeesFromFirebase();

            // Render employees grid
            const grid = document.getElementById('employees-grid');
            if (grid) {
                if (employees.length === 0) {
                    grid.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <h3>No employees yet</h3>
                            <p>Add your first employee to get started</p>
                            <button class="btn-primary" onclick="openModal('add-employee')">
                                <i class="fas fa-plus"></i> Add Employee
                            </button>
                        </div>
                    `;
                } else {
                    grid.innerHTML = employees.map(emp => renderEmployeeCard(emp)).join('');
                }
            }
        }

        /**
         * Load employees from Firebase and update local array
         */
        async function loadEmployeesFromFirebase() {
            if (!firebaseEmployeeManager.isInitialized) {
                await firebaseEmployeeManager.initialize();
            }

            if (firebaseEmployeeManager.isInitialized) {
                try {
                    const firestoreEmployees = await firebaseEmployeeManager.loadEmployees();
                    if (firestoreEmployees && firestoreEmployees.length > 0) {
                        employees = firestoreEmployees.map(emp => ({
                            id: emp.firestoreId || emp.id,
                            firestoreId: emp.firestoreId || emp.id,
                            name: emp.name || '',
                            email: emp.email || '',
                            phone: emp.phone || '',
                            store: emp.store || 'Miramar',
                            status: emp.status || 'active',
                            role: emp.role || 'Sales Associate',
                            employeeType: emp.employeeType || 'employee',
                            hireDate: emp.hireDate || new Date().toISOString().split('T')[0],
                            emergencyContact: emp.emergencyContact || '',
                            allergies: emp.allergies || 'None',
                            initials: (emp.name || 'XX').split(' ').map(n => n[0] || '').join('').substring(0, 2).toUpperCase(),
                            color: emp.color || ['a', 'b', 'c', 'd', 'e'][Math.floor(Math.random() * 5)]
                        }));
                        console.log(`Loaded ${employees.length} employees from Firebase`);
                    }
                } catch (error) {
                    console.error('Error loading employees from Firebase:', error);
                }
            }
        }

        /**
         * Refresh employees from Firebase (manual refresh button)
         */
        async function refreshEmployeesFromFirebase() {
            const grid = document.getElementById('employees-grid');
            if (grid) {
                grid.innerHTML = `
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Refreshing...</p>
                    </div>
                `;
            }

            await loadEmployeesFromFirebase();

            if (grid) {
                grid.innerHTML = employees.map(emp => renderEmployeeCard(emp)).join('');
            }
        }

        function renderEmployeeCard(emp) {
            // Get role badge color based on employeeType
            const getRoleColor = () => {
                const colors = {
                    'admin': '#ef4444',      // Red
                    'manager': '#f59e0b',    // Amber
                    'employee': '#3b82f6'    // Blue
                };
                return colors[emp.employeeType] || '#6b7280';
            };

            const getRoleIcon = () => {
                const icons = {
                    'admin': 'crown',
                    'manager': 'chart-bar',
                    'employee': 'user'
                };
                return icons[emp.employeeType] || 'user';
            };

            const getRoleLabel = () => {
                const labels = {
                    'admin': 'Administrator',
                    'manager': 'Manager',
                    'employee': 'Employee'
                };
                return labels[emp.employeeType] || 'Employee';
            };

            const empId = emp.firestoreId || emp.id;
            return `
                <div class="employee-card" onclick="viewEmployee('${empId}')">
                    <div class="employee-card-header">
                        <div class="employee-avatar-lg ${emp.color}">${emp.initials}</div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <div class="employee-status-badge ${emp.status}">${emp.status}</div>
                            <div class="badge" style="background: ${getRoleColor()}; color: white; font-size: 11px; padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px;">
                                <i class="fas fa-${getRoleIcon()}"></i>
                                ${getRoleLabel()}
                            </div>
                        </div>
                    </div>
                    <div class="employee-card-body">
                        <h3 class="employee-card-name">${emp.name}</h3>
                        <p class="employee-card-role">${emp.role}</p>
                        <div class="employee-card-store">
                            <i class="fas fa-store"></i> ${emp.store}
                        </div>
                        <div class="employee-card-meta">
                            <span><i class="fas fa-envelope"></i> ${emp.email}</span>
                            <span><i class="fas fa-phone"></i> ${emp.phone}</span>
                        </div>
                    </div>
                    <div class="employee-card-footer">
                        <button class="btn-icon" onclick="event.stopPropagation(); editEmployee('${empId}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon danger" onclick="event.stopPropagation(); deleteEmployee('${empId}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        }

        function renderTraining() {
            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Training Center</h2>
                        <p class="section-subtitle">Videos, documents, and courses for your team</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('add-training')">
                        <i class="fas fa-plus"></i> Add Training
                    </button>
                </div>

                <div class="training-stats">
                    <div class="training-stat-card">
                        <div class="training-stat-icon"><i class="fas fa-video"></i></div>
                        <div class="training-stat-value">${trainings.filter(t => t.type === 'video').length}</div>
                        <div class="training-stat-label">Video Courses</div>
                    </div>
                    <div class="training-stat-card">
                        <div class="training-stat-icon"><i class="fas fa-file-pdf"></i></div>
                        <div class="training-stat-value">${trainings.filter(t => t.type === 'document').length}</div>
                        <div class="training-stat-label">Documents</div>
                    </div>
                    <div class="training-stat-card">
                        <div class="training-stat-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="training-stat-value">${Math.round(trainings.reduce((acc, t) => acc + t.completion, 0) / trainings.length)}%</div>
                        <div class="training-stat-label">Avg. Completion</div>
                    </div>
                    <div class="training-stat-card">
                        <div class="training-stat-icon"><i class="fas fa-users"></i></div>
                        <div class="training-stat-value">${employees.length}</div>
                        <div class="training-stat-label">Enrolled</div>
                    </div>
                </div>

                <div class="training-grid">
                    ${trainings.map(t => `
                        <div class="training-card" onclick="${t.type === 'video' ? `playTrainingVideo(${t.id})` : `viewTraining(${t.id})`}" style="cursor: pointer;">
                            <div class="training-card-thumbnail ${t.type}">
                                <i class="fas fa-${t.type === 'video' ? 'play-circle' : 'file-pdf'}"></i>
                            </div>
                            <div class="training-card-body">
                                <div class="training-card-type">${t.type.toUpperCase()}</div>
                                <h3 class="training-card-title">${t.title}</h3>
                                <div class="training-card-meta">
                                    <span><i class="fas fa-clock"></i> ${t.duration}</span>
                                    <span class="${t.required ? 'required' : ''}"><i class="fas fa-${t.required ? 'exclamation-circle' : 'check'}"></i> ${t.required ? 'Required' : 'Optional'}</span>
                                </div>
                                <div class="training-card-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${t.completion}%;"></div>
                                    </div>
                                    <span>${t.completion}% completed</span>
                                </div>
                            </div>
                            <div class="training-card-footer">
                                <button class="btn-secondary" onclick="event.stopPropagation(); viewTraining(${t.id})">View Details</button>
                                <button class="btn-icon" onclick="event.stopPropagation(); editTraining(${t.id})"><i class="fas fa-edit"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function renderLicenses() {
            const stores = ['Miramar', 'Morena', 'Kearny Mesa', 'Chula Vista'];

            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Licenses & Documents</h2>
                        <p class="section-subtitle">Drag and drop documents between stores</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('add-license')">
                        <i class="fas fa-plus"></i> Add Document
                    </button>
                </div>

                <div class="license-summary">
                    <div class="license-summary-card valid">
                        <i class="fas fa-check-circle"></i>
                        <span class="count">${licenses.filter(l => l.status === 'valid').length}</span>
                        <span class="label">Valid</span>
                    </div>
                    <div class="license-summary-card expiring">
                        <i class="fas fa-clock"></i>
                        <span class="count">${licenses.filter(l => l.status === 'expiring').length}</span>
                        <span class="label">Expiring Soon</span>
                    </div>
                    <div class="license-summary-card expired">
                        <i class="fas fa-times-circle"></i>
                        <span class="count">${licenses.filter(l => l.status === 'expired').length}</span>
                        <span class="label">Expired</span>
                    </div>
                </div>

                <div class="license-stores-grid">
                    ${stores.map(store => {
                        const storeLicenses = licenses.filter(l => l.store === store);
                        return `
                            <div class="license-store-zone"
                                 data-store="${store}"
                                 ondrop="handleLicenseDrop(event, '${store}')"
                                 ondragover="handleLicenseDragOver(event)"
                                 ondragleave="handleLicenseDragLeave(event)">
                                <div class="license-store-header">
                                    <div class="license-store-title">
                                        <i class="fas fa-store"></i>
                                        <span>VSU ${store}</span>
                                    </div>
                                    <div class="license-store-count">
                                        <span class="count-badge">${storeLicenses.length}</span>
                                    </div>
                                </div>
                                <div class="license-drop-area">
                                    ${storeLicenses.length === 0 ? `
                                        <div class="license-empty-state">
                                            <i class="fas fa-file-upload"></i>
                                            <span>Drop documents here</span>
                                        </div>
                                    ` : ''}
                                    ${storeLicenses.map(lic => `
                                        <div class="license-item"
                                             draggable="true"
                                             data-license-id="${lic.id}"
                                             ondragstart="handleLicenseDragStart(event, ${lic.id})">
                                            <div class="license-item-header">
                                                <div class="license-item-name">
                                                    <i class="fas fa-file-pdf"></i>
                                                    <span>${lic.name}</span>
                                                </div>
                                                <div class="license-item-status">
                                                    <div class="status-dot ${lic.status}" title="${lic.status}"></div>
                                                </div>
                                            </div>
                                            <div class="license-item-footer">
                                                <span class="license-expires">
                                                    <i class="fas fa-calendar"></i>
                                                    ${formatDate(lic.expires)}
                                                </span>
                                                <div class="license-item-actions">
                                                    <button class="btn-icon-sm" onclick="event.stopPropagation(); viewLicense(${lic.id})" title="View">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                    <button class="btn-icon-sm" onclick="event.stopPropagation(); deleteLicense(${lic.id})" title="Delete">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        function renderAnalytics() {
            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Sales Analytics</h2>
                        <p class="section-subtitle">Performance insights from your Shopify stores</p>
                    </div>
                    <div class="date-range-picker">
                        <button class="date-btn active">Today</button>
                        <button class="date-btn">This Week</button>
                        <button class="date-btn">This Month</button>
                        <button class="date-btn">Custom</button>
                    </div>
                </div>

                <div class="analytics-grid">
                    <div class="analytics-card revenue">
                        <div class="analytics-card-header">
                            <h3>Total Revenue</h3>
                            <span class="trend up"><i class="fas fa-arrow-up"></i> 12.5%</span>
                        </div>
                        <div class="analytics-value">$48,200</div>
                        <div class="analytics-chart">
                            <div class="chart-bar" style="height: 40%;"></div>
                            <div class="chart-bar" style="height: 55%;"></div>
                            <div class="chart-bar" style="height: 45%;"></div>
                            <div class="chart-bar" style="height: 70%;"></div>
                            <div class="chart-bar" style="height: 65%;"></div>
                            <div class="chart-bar" style="height: 80%;"></div>
                            <div class="chart-bar active" style="height: 90%;"></div>
                        </div>
                    </div>

                    <div class="analytics-card orders">
                        <div class="analytics-card-header">
                            <h3>Total Orders</h3>
                            <span class="trend up"><i class="fas fa-arrow-up"></i> 8.3%</span>
                        </div>
                        <div class="analytics-value">443</div>
                        <div class="analytics-breakdown">
                            <div class="breakdown-item">
                                <span class="breakdown-label">Miramar</span>
                                <span class="breakdown-value">142</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="breakdown-label">Kearny Mesa</span>
                                <span class="breakdown-value">118</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="breakdown-label">Chula Vista</span>
                                <span class="breakdown-value">96</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="breakdown-label">Morena</span>
                                <span class="breakdown-value">87</span>
                            </div>
                        </div>
                    </div>

                    <div class="analytics-card aov">
                        <div class="analytics-card-header">
                            <h3>Avg. Order Value</h3>
                            <span class="trend up"><i class="fas fa-arrow-up"></i> 4.2%</span>
                        </div>
                        <div class="analytics-value">$108.79</div>
                        <div class="analytics-comparison">
                            <span>vs last month: $104.35</span>
                        </div>
                    </div>

                    <div class="analytics-card customers">
                        <div class="analytics-card-header">
                            <h3>New Customers</h3>
                            <span class="trend up"><i class="fas fa-arrow-up"></i> 15.7%</span>
                        </div>
                        <div class="analytics-value">89</div>
                        <div class="analytics-comparison">
                            <span>Returning: 354</span>
                        </div>
                    </div>
                </div>

                <div class="analytics-stores">
                    <h3 class="section-subtitle-alt">Store Performance Comparison</h3>
                    <div class="store-bars">
                        <div class="store-bar-item">
                            <div class="store-bar-label">
                                <span>VSU Miramar</span>
                                <span>$15,420</span>
                            </div>
                            <div class="store-bar-track">
                                <div class="store-bar-fill miramar" style="width: 100%;"></div>
                            </div>
                        </div>
                        <div class="store-bar-item">
                            <div class="store-bar-label">
                                <span>VSU Kearny Mesa</span>
                                <span>$12,890</span>
                            </div>
                            <div class="store-bar-track">
                                <div class="store-bar-fill kearny" style="width: 83%;"></div>
                            </div>
                        </div>
                        <div class="store-bar-item">
                            <div class="store-bar-label">
                                <span>VSU Chula Vista</span>
                                <span>$10,340</span>
                            </div>
                            <div class="store-bar-track">
                                <div class="store-bar-fill chula" style="width: 67%;"></div>
                            </div>
                        </div>
                        <div class="store-bar-item">
                            <div class="store-bar-label">
                                <span>VSU Morena</span>
                                <span>$9,550</span>
                            </div>
                            <div class="store-bar-track">
                                <div class="store-bar-fill morena" style="width: 62%;"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="shopify-connect">
                    <div class="shopify-icon"><i class="fab fa-shopify"></i></div>
                    <div class="shopify-text">
                        <h4>Connect to Shopify</h4>
                        <p>Sync real-time sales data from your stores</p>
                    </div>
                    <button class="btn-primary">Connect Store</button>
                </div>
            `;
        }

        function renderStores() {
            const stores = [
                { name: 'VSU Miramar', address: '8250 Camino Santa Fe, San Diego, CA 92121', manager: 'Marcus Rodriguez', employees: 6, status: 'open', isHQ: true },
                { name: 'VSU Morena', address: '5050 Morena Blvd, San Diego, CA 92117', manager: 'Sarah Kim', employees: 5, status: 'open', isHQ: false },
                { name: 'VSU Kearny Mesa', address: '4747 Convoy St, San Diego, CA 92111', manager: 'James Thompson', employees: 5, status: 'open', isHQ: false },
                { name: 'VSU Chula Vista', address: '555 Broadway, Chula Vista, CA 91910', manager: 'Amanda Lopez', employees: 4, status: 'open', isHQ: false }
            ];

            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Store Management</h2>
                        <p class="section-subtitle">Manage your VSU locations</p>
                    </div>
                </div>

                <div class="stores-grid">
                    ${stores.map(store => `
                        <div class="store-card ${store.isHQ ? 'hq' : ''}">
                            ${store.isHQ ? '<div class="hq-badge">HEADQUARTERS</div>' : ''}
                            <div class="store-card-header">
                                <h3>${store.name}</h3>
                                <span class="store-status ${store.status}">${store.status}</span>
                            </div>
                            <div class="store-card-body">
                                <div class="store-info-row">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${store.address}</span>
                                </div>
                                <div class="store-info-row">
                                    <i class="fas fa-user-tie"></i>
                                    <span>Manager: ${store.manager}</span>
                                </div>
                                <div class="store-info-row">
                                    <i class="fas fa-users"></i>
                                    <span>${store.employees} Employees</span>
                                </div>
                            </div>
                            <div class="store-card-footer">
                                <button class="btn-secondary">View Details</button>
                                <button class="btn-icon"><i class="fas fa-edit"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function renderAnnouncements() {
            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Announcements</h2>
                        <p class="section-subtitle">Company-wide communications</p>
                    </div>
                </div>

                <div class="announcements-list">
                    <div class="announcement-card" style="border: 2px dashed var(--border-color); background: var(--bg-secondary);">
                        <div class="announcement-card-header">
                            <div class="announcement-author">
                                <div class="author-avatar">CA</div>
                                <div class="author-info">
                                    <span class="author-name">Carlos Admin</span>
                                    <span class="announcement-date">New Announcement</span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 12px;">
                            <input type="text" class="form-input" id="new-announcement-title" placeholder="Announcement title..." style="font-size: 16px; font-weight: 600;">
                        </div>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <textarea class="form-input" id="new-announcement-content" placeholder="Write your announcement here..." style="min-height: 80px; resize: vertical;"></textarea>
                        </div>
                        <div style="display: flex; justify-content: flex-end;">
                            <button class="btn-primary" onclick="saveAnnouncementInline()">
                                <i class="fas fa-paper-plane"></i> Post Announcement
                            </button>
                        </div>
                    </div>

                    ${announcements.map(ann => `
                        <div class="announcement-card">
                            <div class="announcement-card-header">
                                <div class="announcement-author">
                                    <div class="author-avatar">CA</div>
                                    <div class="author-info">
                                        <span class="author-name">${ann.author}</span>
                                        <span class="announcement-date">${formatDate(ann.date)}</span>
                                    </div>
                                </div>
                                <div class="announcement-actions">
                                    <button class="btn-icon"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon danger"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                            <h3 class="announcement-title">${ann.title}</h3>
                            <p class="announcement-content">${ann.content}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // ==========================================
        // CLOCK IN/OUT FUNCTIONALITY
        // ==========================================

        // Clock In attendance records storage
        let clockinAttendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        let currentClockAction = '';
        let clockInterval = null;

        function renderClockIn() {
            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Clock In/Out</h2>
                        <p class="section-subtitle">Manage employee attendance</p>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <div class="search-filter">
                            <i class="fas fa-search"></i>
                            <input type="text" placeholder="Search employees..." id="attendanceSearch" onkeyup="filterAttendanceSearch()">
                        </div>
                    </div>
                </div>

                <!-- Current Time Display -->
                <div class="time-display-card">
                    <div class="current-time">
                        <div class="time-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="time-info">
                            <div class="current-date" id="currentDate">Loading...</div>
                            <div class="current-clock" id="currentClock">00:00:00 AM</div>
                        </div>
                    </div>
                </div>

                <!-- Quick Clock Actions -->
                <div class="clock-quick-actions">
                    <button class="clock-action-btn clock-in" onclick="showClockModal('in')">
                        <div class="action-icon">
                            <i class="fas fa-sign-in-alt"></i>
                        </div>
                        <span>Clock In</span>
                    </button>
                    <button class="clock-action-btn lunch-start" onclick="showClockModal('lunch-start')">
                        <div class="action-icon">
                            <i class="fas fa-utensils"></i>
                        </div>
                        <span>Start Lunch</span>
                    </button>
                    <button class="clock-action-btn lunch-end" onclick="showClockModal('lunch-end')">
                        <div class="action-icon">
                            <i class="fas fa-utensils"></i>
                        </div>
                        <span>End Lunch</span>
                    </button>
                    <button class="clock-action-btn clock-out" onclick="showClockModal('out')">
                        <div class="action-icon">
                            <i class="fas fa-sign-out-alt"></i>
                        </div>
                        <span>Clock Out</span>
                    </button>
                </div>

                <!-- Stats Grid -->
                <div class="attendance-stats-grid">
                    <div class="attendance-stat-card">
                        <div class="stat-icon-container clocked-in">
                            <i class="fas fa-user-check"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="clockedInCount">0</div>
                            <div class="stat-label">Clocked In</div>
                        </div>
                    </div>
                    <div class="attendance-stat-card">
                        <div class="stat-icon-container on-lunch">
                            <i class="fas fa-coffee"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="onLunchCount">0</div>
                            <div class="stat-label">On Lunch</div>
                        </div>
                    </div>
                    <div class="attendance-stat-card">
                        <div class="stat-icon-container clocked-out">
                            <i class="fas fa-user-clock"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="clockedOutCount">0</div>
                            <div class="stat-label">Clocked Out</div>
                        </div>
                    </div>
                    <div class="attendance-stat-card">
                        <div class="stat-icon-container total">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="totalEmployeesCount">0</div>
                            <div class="stat-label">Total Employees</div>
                        </div>
                    </div>
                </div>

                <!-- Attendance Table -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-clipboard-list"></i>
                            Today's Attendance
                        </h3>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <button class="btn-secondary" onclick="exportAttendance()">
                                <i class="fas fa-download"></i>
                                Export
                            </button>
                            <button class="card-action" onclick="refreshAttendance()">
                                <i class="fas fa-sync"></i> Refresh
                            </button>
                        </div>
                    </div>
                    <div class="card-body" style="padding: 0;">
                        <div id="loadingAttendance" class="loading-state">
                            <div class="spinner"></div>
                            <span>Loading attendance...</span>
                        </div>
                        <div id="attendanceTableContainer" style="display: none;">
                            <table class="attendance-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Store</th>
                                        <th>Clock In</th>
                                        <th>Lunch Start</th>
                                        <th>Lunch End</th>
                                        <th>Clock Out</th>
                                        <th>Total Hours</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="attendanceTableBody">
                                </tbody>
                            </table>
                        </div>
                        <div id="emptyAttendanceState" class="empty-state" style="display: none;">
                            <i class="fas fa-clipboard"></i>
                            <h3>No attendance records today</h3>
                            <p>Records will appear here once employees clock in</p>
                        </div>
                    </div>
                </div>
            `;

            // Initialize clock and load data
            initializeClockIn();
        }

        function initializeClockIn() {
            updateClockDisplay();
            // Clear any existing interval
            if (clockInterval) clearInterval(clockInterval);
            clockInterval = setInterval(updateClockDisplay, 1000);
            loadAttendanceData();
        }

        function updateClockDisplay() {
            const now = new Date();
            const dateEl = document.getElementById('currentDate');
            const clockEl = document.getElementById('currentClock');

            if (!dateEl || !clockEl) return;

            // Format date
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateEl.textContent = now.toLocaleDateString('en-US', options);

            // Format time
            let hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;

            clockEl.textContent = `${padZeroTime(hours)}:${padZeroTime(minutes)}:${padZeroTime(seconds)} ${ampm}`;
        }

        function padZeroTime(num) {
            return num.toString().padStart(2, '0');
        }

        function showClockModal(action) {
            currentClockAction = action;

            const actionTitles = {
                'in': 'Clock In',
                'lunch-start': 'Start Lunch Break',
                'lunch-end': 'End Lunch Break',
                'out': 'Clock Out'
            };

            // Create modal HTML
            const modalHtml = `
                <div class="modal active" id="clockModal">
                    <div class="modal-content" style="max-width: 500px;">
                        <div class="modal-header">
                            <h2><i class="fas fa-clock"></i> ${actionTitles[action]}</h2>
                            <button class="modal-close" onclick="closeClockModal()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="clockForm">
                                <div class="form-group">
                                    <label>Employee:</label>
                                    <select id="employeeSelect" class="form-input" required>
                                        <option value="">Select employee...</option>
                                        ${employees.map(emp => `<option value="${emp.id}">${emp.name} - ${emp.role}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Store:</label>
                                    <select id="storeSelect" class="form-input" required>
                                        <option value="">Select store...</option>
                                        <option value="VSU Miramar">VSU Miramar</option>
                                        <option value="VSU Chulavista">VSU Chulavista</option>
                                        <option value="VSU North Park">VSU North Park</option>
                                        <option value="VSU Morena">VSU Morena</option>
                                        <option value="VSU Kearny Mesa">VSU Kearny Mesa</option>
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Time:</label>
                                    <input type="time" id="clockTime" class="form-input" required value="${new Date().toTimeString().slice(0, 5)}">
                                </div>
                                <div class="form-group">
                                    <label>Notes (Optional):</label>
                                    <textarea id="clockNotes" class="form-input" rows="3" placeholder="Add any notes..."></textarea>
                                </div>
                                <div id="clockMessage" class="alert" style="display: none;"></div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary" onclick="closeClockModal()">Cancel</button>
                            <button type="button" class="btn-primary" onclick="submitClockAction()">
                                <i class="fas fa-check"></i> ${actionTitles[action]}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Remove existing modal if any
            const existingModal = document.getElementById('clockModal');
            if (existingModal) existingModal.remove();

            // Add modal to body
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        function closeClockModal() {
            const modal = document.getElementById('clockModal');
            if (modal) modal.remove();
        }

        function submitClockAction() {
            const employeeId = parseInt(document.getElementById('employeeSelect').value);
            const store = document.getElementById('storeSelect').value;
            const time = document.getElementById('clockTime').value;
            const notes = document.getElementById('clockNotes').value;
            const messageDiv = document.getElementById('clockMessage');

            // Validation
            if (!employeeId || !store || !time) {
                messageDiv.className = 'alert error';
                messageDiv.textContent = 'Please fill in all required fields';
                messageDiv.style.display = 'block';
                return;
            }

            const employee = employees.find(e => e.id === employeeId);
            if (!employee) {
                messageDiv.className = 'alert error';
                messageDiv.textContent = 'Employee not found';
                messageDiv.style.display = 'block';
                return;
            }

            const today = new Date().toDateString();
            let record = clockinAttendanceRecords.find(r => r.employeeId === employeeId && r.date === today);

            // Create new record if doesn't exist
            if (!record) {
                record = {
                    id: Date.now(),
                    employeeId: employeeId,
                    employeeName: employee.name,
                    employeeRole: employee.role,
                    employeeInitials: employee.initials,
                    store: store,
                    date: today,
                    clockIn: null,
                    lunchStart: null,
                    lunchEnd: null,
                    clockOut: null,
                    notes: notes
                };
                clockinAttendanceRecords.push(record);
            }

            // Update record based on action
            switch(currentClockAction) {
                case 'in':
                    if (record.clockIn) {
                        messageDiv.className = 'alert error';
                        messageDiv.textContent = 'Employee already clocked in today';
                        messageDiv.style.display = 'block';
                        return;
                    }
                    record.clockIn = time;
                    break;
                case 'lunch-start':
                    if (!record.clockIn) {
                        messageDiv.className = 'alert error';
                        messageDiv.textContent = 'Employee must clock in first';
                        messageDiv.style.display = 'block';
                        return;
                    }
                    if (record.lunchStart) {
                        messageDiv.className = 'alert error';
                        messageDiv.textContent = 'Lunch break already started';
                        messageDiv.style.display = 'block';
                        return;
                    }
                    record.lunchStart = time;
                    break;
                case 'lunch-end':
                    if (!record.lunchStart) {
                        messageDiv.className = 'alert error';
                        messageDiv.textContent = 'Lunch break not started yet';
                        messageDiv.style.display = 'block';
                        return;
                    }
                    if (record.lunchEnd) {
                        messageDiv.className = 'alert error';
                        messageDiv.textContent = 'Lunch break already ended';
                        messageDiv.style.display = 'block';
                        return;
                    }
                    record.lunchEnd = time;
                    break;
                case 'out':
                    if (!record.clockIn) {
                        messageDiv.className = 'alert error';
                        messageDiv.textContent = 'Employee must clock in first';
                        messageDiv.style.display = 'block';
                        return;
                    }
                    if (record.clockOut) {
                        messageDiv.className = 'alert error';
                        messageDiv.textContent = 'Employee already clocked out today';
                        messageDiv.style.display = 'block';
                        return;
                    }
                    record.clockOut = time;
                    break;
            }

            // Save to localStorage
            localStorage.setItem('attendanceRecords', JSON.stringify(clockinAttendanceRecords));

            // Show success message
            messageDiv.className = 'alert success';
            messageDiv.textContent = 'Clock action recorded successfully!';
            messageDiv.style.display = 'block';

            // Reload attendance table
            setTimeout(() => {
                closeClockModal();
                loadAttendanceData();
            }, 1000);
        }

        function loadAttendanceData() {
            const today = new Date().toDateString();
            const todayRecords = clockinAttendanceRecords.filter(r => r.date === today);

            const loadingDiv = document.getElementById('loadingAttendance');
            const tableContainer = document.getElementById('attendanceTableContainer');
            const emptyState = document.getElementById('emptyAttendanceState');

            if (!loadingDiv) return;

            // Show loading
            loadingDiv.style.display = 'flex';
            tableContainer.style.display = 'none';
            emptyState.style.display = 'none';

            // Simulate loading delay
            setTimeout(() => {
                loadingDiv.style.display = 'none';

                if (todayRecords.length === 0) {
                    emptyState.style.display = 'flex';
                } else {
                    tableContainer.style.display = 'block';
                    renderAttendanceTableRows(todayRecords);
                }

                updateAttendanceStats(todayRecords);
            }, 300);
        }

        function renderAttendanceTableRows(records) {
            const tableBody = document.getElementById('attendanceTableBody');
            if (!tableBody) return;

            tableBody.innerHTML = records.map(record => {
                const status = getAttendanceStatus(record);
                const totalHours = calculateAttendanceTotalHours(record);

                return `
                    <tr>
                        <td>
                            <div class="employee-table-info">
                                <div class="employee-table-avatar">${record.employeeInitials}</div>
                                <div class="employee-table-details">
                                    <div class="employee-table-name">${record.employeeName}</div>
                                    <div class="employee-table-role">${record.employeeRole}</div>
                                </div>
                            </div>
                        </td>
                        <td><span class="store-badge">${record.store}</span></td>
                        <td><span class="time-cell ${!record.clockIn ? 'empty' : ''}">${record.clockIn || '-'}</span></td>
                        <td><span class="time-cell ${!record.lunchStart ? 'empty' : ''}">${record.lunchStart || '-'}</span></td>
                        <td><span class="time-cell ${!record.lunchEnd ? 'empty' : ''}">${record.lunchEnd || '-'}</span></td>
                        <td><span class="time-cell ${!record.clockOut ? 'empty' : ''}">${record.clockOut || '-'}</span></td>
                        <td><span class="total-hours">${totalHours}</span></td>
                        <td><span class="status-badge ${status.class}">${status.text}</span></td>
                        <td>
                            <button class="table-action-btn" onclick="viewAttendanceDetails(${record.id})">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function getAttendanceStatus(record) {
            if (record.clockOut) {
                return { text: 'Clocked Out', class: 'clocked-out' };
            }
            if (record.lunchStart && !record.lunchEnd) {
                return { text: 'On Lunch', class: 'on-lunch' };
            }
            if (record.clockIn) {
                return { text: 'Clocked In', class: 'clocked-in' };
            }
            return { text: 'Not Started', class: 'not-started' };
        }

        function calculateAttendanceTotalHours(record) {
            if (!record.clockIn) return '-';

            const clockIn = parseAttendanceTime(record.clockIn);
            const clockOut = record.clockOut ? parseAttendanceTime(record.clockOut) : new Date();

            let totalMinutes = (clockOut - clockIn) / 1000 / 60;

            // Subtract lunch time if applicable
            if (record.lunchStart && record.lunchEnd) {
                const lunchStart = parseAttendanceTime(record.lunchStart);
                const lunchEnd = parseAttendanceTime(record.lunchEnd);
                const lunchMinutes = (lunchEnd - lunchStart) / 1000 / 60;
                totalMinutes -= lunchMinutes;
            }

            const hours = Math.floor(totalMinutes / 60);
            const minutes = Math.floor(totalMinutes % 60);

            return `${hours}h ${minutes}m`;
        }

        function parseAttendanceTime(timeString) {
            const today = new Date();
            const [hours, minutes] = timeString.split(':');
            today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            return today;
        }

        function updateAttendanceStats(records) {
            const clockedInCount = records.filter(r => r.clockIn && !r.clockOut).length;
            const onLunchCount = records.filter(r => r.lunchStart && !r.lunchEnd).length;
            const clockedOutCount = records.filter(r => r.clockOut).length;

            const clockedInEl = document.getElementById('clockedInCount');
            const onLunchEl = document.getElementById('onLunchCount');
            const clockedOutEl = document.getElementById('clockedOutCount');
            const totalEl = document.getElementById('totalEmployeesCount');

            if (clockedInEl) clockedInEl.textContent = clockedInCount;
            if (onLunchEl) onLunchEl.textContent = onLunchCount;
            if (clockedOutEl) clockedOutEl.textContent = clockedOutCount;
            if (totalEl) totalEl.textContent = employees.length;
        }

        function viewAttendanceDetails(recordId) {
            const record = clockinAttendanceRecords.find(r => r.id === recordId);
            if (!record) return;

            alert(`Employee: ${record.employeeName}
Store: ${record.store}
Date: ${record.date}
Clock In: ${record.clockIn || '-'}
Lunch Start: ${record.lunchStart || '-'}
Lunch End: ${record.lunchEnd || '-'}
Clock Out: ${record.clockOut || '-'}
Total Hours: ${calculateAttendanceTotalHours(record)}
${record.notes ? 'Notes: ' + record.notes : ''}`);
        }

        function refreshAttendance() {
            loadAttendanceData();
        }

        function exportAttendance() {
            const today = new Date().toDateString();
            const todayRecords = clockinAttendanceRecords.filter(r => r.date === today);

            if (todayRecords.length === 0) {
                alert('No attendance records to export');
                return;
            }

            // Create CSV content
            let csv = 'Employee,Role,Store,Clock In,Lunch Start,Lunch End,Clock Out,Total Hours,Status\n';

            todayRecords.forEach(record => {
                const status = getAttendanceStatus(record);
                const totalHours = calculateAttendanceTotalHours(record);

                csv += `"${record.employeeName}","${record.employeeRole}","${record.store}",`;
                csv += `"${record.clockIn || '-'}","${record.lunchStart || '-'}","${record.lunchEnd || '-'}",`;
                csv += `"${record.clockOut || '-'}","${totalHours}","${status.text}"\n`;
            });

            // Download CSV
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }

        function filterAttendanceSearch() {
            const searchInput = document.getElementById('attendanceSearch');
            if (!searchInput) return;

            const searchTerm = searchInput.value.toLowerCase();
            const today = new Date().toDateString();
            let records = clockinAttendanceRecords.filter(r => r.date === today);

            if (searchTerm) {
                records = records.filter(r =>
                    r.employeeName.toLowerCase().includes(searchTerm) ||
                    r.employeeRole.toLowerCase().includes(searchTerm) ||
                    r.store.toLowerCase().includes(searchTerm)
                );
            }

            renderAttendanceTableRows(records);
            updateAttendanceStats(records);
        }

        // ==========================================
        // END CLOCK IN/OUT FUNCTIONALITY
        // ==========================================

        function renderNewStuff() {
            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">New Stuff</h2>
                        <p class="section-subtitle">Incoming products and inventory</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('add-product')">
                        <i class="fas fa-plus"></i> Add Product
                    </button>
                </div>

                <div class="employees-grid">
                    ${products.map(product => `
                        <div class="card">
                            <div class="card-header" style="background: ${product.status === 'arrived' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'};">
                                <h3 class="card-title" style="font-size: 16px; font-weight: 600;">
                                    ${product.name}
                                </h3>
                                <span class="status-badge ${product.status === 'arrived' ? 'valid' : 'expiring'}">
                                    ${product.status}
                                </span>
                            </div>
                            <div class="card-body">
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                                        <span style="color: var(--text-muted); font-size: 13px;">Category:</span>
                                        <span style="font-weight: 600; font-size: 13px;">${product.category}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                                        <span style="color: var(--text-muted); font-size: 13px;">Quantity:</span>
                                        <span style="font-weight: 600; font-size: 13px; color: var(--accent-primary);">${product.quantity} units</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                                        <span style="color: var(--text-muted); font-size: 13px;">Price:</span>
                                        <span style="font-weight: 600; font-size: 13px; color: var(--success);">$${product.price}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                                        <span style="color: var(--text-muted); font-size: 13px;">Store:</span>
                                        <span style="font-weight: 600; font-size: 13px;">${product.store}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                                        <span style="color: var(--text-muted); font-size: 13px;">Arrival Date:</span>
                                        <span style="font-weight: 600; font-size: 13px;">${formatDate(product.arrivalDate)}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                                        <span style="color: var(--text-muted); font-size: 13px;">Supplier:</span>
                                        <span style="font-weight: 600; font-size: 13px;">${product.supplier}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer" style="padding: 16px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 8px;">
                                <button class="btn-icon"><i class="fas fa-edit"></i></button>
                                <button class="btn-icon danger"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        let currentRestockTab = 'inventory';
        let selectedStoreFilter = 'all';

        function renderRestockRequests() {
            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Inventory & Restock</h2>
                        <p class="section-subtitle">Manage inventory and restock requests</p>
                    </div>
                    <button class="btn-primary" onclick="openNewRestockRequestModal()">
                        <i class="fas fa-plus"></i> Create Restock Request
                    </button>
                </div>

                <div style="display: flex; gap: 16px; margin-bottom: 24px; border-bottom: 2px solid var(--border-color);">
                    <button onclick="switchRestockTab('inventory')" class="tab-btn ${currentRestockTab === 'inventory' ? 'active' : ''}" style="padding: 12px 24px; background: none; border: none; border-bottom: 3px solid ${currentRestockTab === 'inventory' ? 'var(--accent-primary)' : 'transparent'}; color: ${currentRestockTab === 'inventory' ? 'var(--accent-primary)' : 'var(--text-secondary)'}; font-weight: 600; font-size: 14px; cursor: pointer; margin-bottom: -2px; transition: all 0.2s;">
                        <i class="fas fa-boxes"></i> Inventory
                    </button>
                    <button onclick="switchRestockTab('requests')" class="tab-btn ${currentRestockTab === 'requests' ? 'active' : ''}" style="padding: 12px 24px; background: none; border: none; border-bottom: 3px solid ${currentRestockTab === 'requests' ? 'var(--accent-primary)' : 'transparent'}; color: ${currentRestockTab === 'requests' ? 'var(--accent-primary)' : 'var(--text-secondary)'}; font-weight: 600; font-size: 14px; cursor: pointer; margin-bottom: -2px; transition: all 0.2s;">
                        <i class="fas fa-list"></i> Requests <span style="background: var(--accent-gradient); color: white; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 10px; margin-left: 6px;">${restockRequests.length}</span>
                    </button>
                </div>

                <div id="restock-tab-content">
                    ${currentRestockTab === 'inventory' ? renderInventoryTab() : renderRequestsTab()}
                </div>
            `;
        }

        function renderInventoryTab() {
            const filteredInventory = selectedStoreFilter === 'all'
                ? inventory
                : inventory.filter(item => item.store === selectedStoreFilter);

            return `
                <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <label style="font-weight: 600; font-size: 14px; color: var(--text-secondary);">
                            <i class="fas fa-filter"></i> Filter by Store:
                        </label>
                        <select class="form-input" id="store-filter" onchange="filterInventoryByStore(this.value)" style="width: 200px;">
                            <option value="all" ${selectedStoreFilter === 'all' ? 'selected' : ''}>All Stores</option>
                            <option value="Miramar" ${selectedStoreFilter === 'Miramar' ? 'selected' : ''}>VSU Miramar</option>
                            <option value="Morena" ${selectedStoreFilter === 'Morena' ? 'selected' : ''}>VSU Morena</option>
                            <option value="Kearny Mesa" ${selectedStoreFilter === 'Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                            <option value="Chula Vista" ${selectedStoreFilter === 'Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                        </select>
                    </div>
                    <div style="font-size: 13px; color: var(--text-muted);">
                        Showing ${filteredInventory.length} ${filteredInventory.length === 1 ? 'item' : 'items'}
                    </div>
                </div>

                <div class="licenses-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Brand</th>
                                <th>Product Name</th>
                                <th>Flavor</th>
                                <th>Volume</th>
                                <th>Nicotine</th>
                                <th>Unit Price</th>
                                <th>Min Stock</th>
                                <th>Stock</th>
                                <th>Store</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredInventory.map(item => `
                                <tr>
                                    <td style="font-weight: 600;">${item.brand}</td>
                                    <td>${item.productName}</td>
                                    <td>${item.flavor}</td>
                                    <td>${item.volume}</td>
                                    <td>${item.nicotine}</td>
                                    <td style="font-weight: 600; color: var(--success);">$${item.unitPrice}</td>
                                    <td>${item.minStock}</td>
                                    <td>
                                        <span style="font-weight: 600; color: ${item.stock < item.minStock ? 'var(--danger)' : 'var(--success)'};">
                                            ${item.stock}
                                        </span>
                                    </td>
                                    <td style="font-weight: 500; font-size: 12px;">${item.store}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        function renderRequestsTab() {
            return `
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    ${restockRequests.map(request => `
                        <div class="card">
                            <div class="card-body">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                                    <div>
                                        <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;">${request.productName}</div>
                                        <div style="font-size: 13px; color: var(--text-muted);">
                                            Requested by ${request.requestedBy} on ${formatDate(request.requestDate)}
                                        </div>
                                    </div>
                                    <span class="status-badge ${request.status === 'approved' ? 'valid' : request.status === 'rejected' ? 'expired' : 'expiring'}">
                                        ${request.status}
                                    </span>
                                </div>
                                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 16px; background: var(--bg-secondary); border-radius: 8px;">
                                    <div>
                                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Quantity</div>
                                        <div style="font-weight: 600; font-size: 14px; color: var(--accent-primary);">${request.quantity} units</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Store</div>
                                        <div style="font-weight: 600; font-size: 14px;">${request.store}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Priority</div>
                                        <div style="font-weight: 600; font-size: 14px; text-transform: capitalize; color: ${request.priority === 'high' ? 'var(--danger)' : request.priority === 'medium' ? 'var(--warning)' : 'var(--success)'};">${request.priority}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Request ID</div>
                                        <div style="font-weight: 600; font-size: 14px; font-family: 'Space Mono', monospace;">#${String(request.id).padStart(4, '0')}</div>
                                    </div>
                                </div>
                                ${request.notes ? `
                                    <div style="margin-top: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Notes:</div>
                                        <div style="font-size: 13px; color: var(--text-secondary);">${request.notes}</div>
                                    </div>
                                ` : ''}
                                <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);">
                                    ${request.status === 'pending' ? `
                                        <button class="btn-secondary" style="font-size: 13px;">
                                            <i class="fas fa-check"></i> Approve
                                        </button>
                                        <button class="btn-secondary" style="font-size: 13px;">
                                            <i class="fas fa-times"></i> Reject
                                        </button>
                                    ` : ''}
                                    <button class="btn-icon"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon danger"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function switchRestockTab(tab) {
            currentRestockTab = tab;
            renderRestockRequests();
        }

        function filterInventoryByStore(store) {
            selectedStoreFilter = store;
            renderRestockRequests();
        }

        function renderAbundanceCloud() {
            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Abundance Cloud</h2>
                        <p class="section-subtitle">Custom app integration</p>
                    </div>
                </div>

                <div class="card">
                    <div class="card-body" style="text-align: center; padding: 60px 20px;">
                        <i class="fas fa-cloud" style="font-size: 64px; color: var(--accent-primary); margin-bottom: 24px;"></i>
                        <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 12px;">Abundance Cloud</h3>
                        <p style="color: var(--text-muted); font-size: 15px; max-width: 500px; margin: 0 auto;">
                            This module is currently under development. Check back soon for updates.
                        </p>
                    </div>
                </div>
            `;
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

        function renderSchedule() {
            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Schedule</h2>
                        <p class="section-subtitle">Employee shifts and availability</p>
                    </div>
                </div>
                <div id="schedule-container" class="card" style="padding: 60px; text-align: center;">
                    <div class="loading-spinner"></div>
                    <h2 style="color: var(--text-secondary); margin: 20px 0 10px;">Connecting to Schedule API...</h2>
                    <p style="color: var(--text-muted);">Loading schedule data</p>
                </div>
            `;
            loadScheduleData();
        }

        async function loadScheduleData() {
            const container = document.getElementById('schedule-container');
            if (!container) return;
            
            try {
                // TODO: Replace with actual API endpoint
                // const response = await fetch('YOUR_API_ENDPOINT');
                // const data = await response.json();
                // renderScheduleData(data);
                
                console.log('Schedule API ready for integration');
            } catch (error) {
                container.innerHTML = `
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--warning); margin-bottom: 20px;"></i>
                    <h2 style="color: var(--text-secondary); margin-bottom: 10px;">Connection Error</h2>
                    <p style="color: var(--text-muted);">Unable to load schedule data.</p>
                    <button class="btn-primary" style="margin-top: 20px;" onclick="loadScheduleData()"><i class="fas fa-sync"></i> Retry</button>
                `;
            }
        }

        function renderScheduleData(data) {
            // TODO: Render schedule grid with API data
        }

        // Thieves database
        let thieves = [
            {
                id: 1,
                name: 'John Doe',
                photo: null,
                date: '2025-11-15',
                store: 'Miramar',
                crimeType: 'Shoplifting',
                itemsStolen: 'Vape devices (2x)',
                estimatedValue: 89.98,
                description: 'Subject entered store around 3:45 PM, concealed two vape devices in jacket pocket. Left without paying.',
                policeReport: 'PR-2025-11-15-001',
                banned: true
            },
            {
                id: 2,
                name: 'Jane Smith',
                photo: null,
                date: '2025-10-28',
                store: 'Morena',
                crimeType: 'Attempted Theft',
                itemsStolen: 'E-liquid bottles (3x)',
                estimatedValue: 65.00,
                description: 'Individual attempted to leave with items in bag. Stopped by staff, returned items and left premises.',
                policeReport: null,
                banned: true
            }
        ];

        function renderThieves() {
            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Thieves Database</h2>
                        <p class="section-subtitle">Track and manage theft incidents</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('add-thief')">
                        <i class="fas fa-plus"></i>
                        Add New Record
                    </button>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
                    <select class="form-input" style="width: 180px;" id="thieves-filter" onchange="filterThieves(this.value)">
                        <option value="all">All Stores</option>
                        <option value="Miramar">Miramar</option>
                        <option value="Morena">Morena</option>
                        <option value="Kearny Mesa">Kearny Mesa</option>
                        <option value="Chula Vista">Chula Vista</option>
                    </select>
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
                                    <button class="btn-secondary" onclick="viewThief(${thief.id})" style="padding: 8px 16px; font-size: 13px;">
                                        <i class="fas fa-eye"></i> View Details
                                    </button>
                                    <button class="btn-icon danger" onclick="deleteThief(${thief.id})" title="Delete">
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
            const thief = thieves.find(t => t.id === id);
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

            modal.style.display = 'flex';
        }

        function deleteThief(id) {
            if (confirm('Are you sure you want to delete this record?')) {
                thieves = thieves.filter(t => t.id !== id);
                renderThieves();
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

        function renderInvoices() {
            const dashboard = document.querySelector('.dashboard');

            const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
            const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);
            const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Invoices</h2>
                        <p class="section-subtitle">Track and manage payments</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('add-invoice')">
                        <i class="fas fa-plus"></i>
                        Add Invoice
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 24px;">
                    <div class="stat-card" style="background: linear-gradient(135deg, var(--warning) 0%, #f59e0b 100%);">
                        <div class="stat-icon"><i class="fas fa-clock"></i></div>
                        <div class="stat-content">
                            <div class="stat-label">Pending</div>
                            <div class="stat-value">$${totalPending.toFixed(2)}</div>
                        </div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, var(--error) 0%, #dc2626 100%);">
                        <div class="stat-icon"><i class="fas fa-exclamation-circle"></i></div>
                        <div class="stat-content">
                            <div class="stat-label">Overdue</div>
                            <div class="stat-value">$${totalOverdue.toFixed(2)}</div>
                        </div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, var(--success) 0%, #10b981 100%);">
                        <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="stat-content">
                            <div class="stat-label">Paid This Month</div>
                            <div class="stat-value">$${totalPaid.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-file-invoice-dollar"></i>
                            All Invoices
                        </h3>
                        <div style="display: flex; gap: 12px;">
                            <select class="form-input" style="width: 150px;" onchange="filterInvoices(this.value)">
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-body" style="padding: 0;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Vendor</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th style="width: 100px;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="invoicesTableBody">
                                ${renderInvoicesTable()}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        function renderInvoicesTable(filter = 'all') {
            const filteredInvoices = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);

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
                const statusColors = {
                    paid: 'var(--success)',
                    pending: 'var(--warning)',
                    overdue: 'var(--error)'
                };

                return `
                    <tr>
                        <td><strong>${invoice.invoiceNumber}</strong></td>
                        <td>${invoice.vendor}</td>
                        <td>
                            <span class="badge" style="background: var(--accent-primary);">${invoice.category}</span>
                        </td>
                        <td>${invoice.description}</td>
                        <td style="font-weight: 600;">$${invoice.amount.toFixed(2)}</td>
                        <td>${formatDate(invoice.dueDate)}</td>
                        <td>
                            <span class="badge" style="background: ${statusColors[invoice.status]};">${invoice.status.toUpperCase()}</span>
                            ${invoice.recurring ? '<i class="fas fa-sync-alt" style="margin-left: 8px; color: var(--text-muted);" title="Recurring"></i>' : ''}
                        </td>
                        <td>
                            ${invoice.status !== 'paid' ? `<button class="btn-icon" onclick="markInvoicePaid(${invoice.id})" title="Mark Paid"><i class="fas fa-check"></i></button>` : ''}
                            <button class="btn-icon" onclick="viewInvoice(${invoice.id})" title="View Details"><i class="fas fa-eye"></i></button>
                            <button class="btn-icon" onclick="deleteInvoice(${invoice.id})" title="Delete"><i class="fas fa-trash"></i></button>
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

        function markInvoicePaid(id) {
            const invoice = invoices.find(i => i.id === id);
            if (invoice) {
                invoice.status = 'paid';
                invoice.paidDate = new Date().toISOString().split('T')[0];
                renderInvoices();
            }
        }

        function viewInvoice(id) {
            const invoice = invoices.find(i => i.id === id);
            if (!invoice) return;

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
                                    <div>${invoice.vendor}</div>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Category</label>
                                    <div>${invoice.category}</div>
                                </div>
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
                        </div>
                    </div>

                    ${invoice.status !== 'paid' ? `
                        <button class="btn-primary" style="width: 100%;" onclick="markInvoicePaid(${invoice.id}); closeModal();">
                            <i class="fas fa-check"></i>
                            Mark as Paid
                        </button>
                    ` : ''}
                </div>
            `;

            modal.style.display = 'flex';
        }

        function deleteInvoice(id) {
            if (confirm('Are you sure you want to delete this invoice?')) {
                invoices = invoices.filter(i => i.id !== id);
                renderInvoices();
            }
        }

        // Treasury Functions
        function renderTreasury() {
            console.log('renderTreasury called');
            console.log('treasuryItems:', treasuryItems);
            const dashboard = document.querySelector('.dashboard');

            const totalValue = treasuryItems.reduce((sum, item) => sum + item.value, 0);
            const itemsByLocation = {
                'VSU Kearny Mesa': treasuryItems.filter(i => i.location === 'VSU Kearny Mesa').length,
                'VSU Miramar': treasuryItems.filter(i => i.location === 'VSU Miramar').length,
                'VSU Morena': treasuryItems.filter(i => i.location === 'VSU Morena').length,
                'VSU North Park': treasuryItems.filter(i => i.location === 'VSU North Park').length
            };

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Treasury - Select Pieces</h2>
                        <p class="section-subtitle">Manage your valuable collection</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('add-treasury')">
                        <i class="fas fa-plus"></i>
                        Add Piece
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px;">
                    <div class="stat-card" style="background: linear-gradient(135deg, var(--accent-primary) 0%, #818cf8 100%); text-align: center; padding: 32px 24px;">
                        <div class="stat-icon" style="margin: 0 auto 16px; background: rgba(255, 255, 255, 0.2);"><i class="fas fa-vault"></i></div>
                        <div class="stat-content">
                            <div class="stat-label" style="color: rgba(255, 255, 255, 0.9);">Total Value</div>
                            <div class="stat-value" style="color: white;">$${totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        </div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); text-align: center; padding: 32px 24px;">
                        <div class="stat-icon" style="margin: 0 auto 16px; background: rgba(255, 255, 255, 0.2);"><i class="fas fa-gem"></i></div>
                        <div class="stat-content">
                            <div class="stat-label" style="color: rgba(255, 255, 255, 0.9);">Total Pieces</div>
                            <div class="stat-value" style="color: white;">${treasuryItems.length}</div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-images"></i>
                            Collection Inventory
                        </h3>
                        <div style="display: flex; gap: 12px;">
                            <select class="form-input" style="width: 200px;" onchange="filterTreasury(this.value)">
                                <option value="all">All Locations</option>
                                <option value="VSU Kearny Mesa">VSU Kearny Mesa (${itemsByLocation['VSU Kearny Mesa']})</option>
                                <option value="VSU Miramar">VSU Miramar (${itemsByLocation['VSU Miramar']})</option>
                                <option value="VSU Morena">VSU Morena (${itemsByLocation['VSU Morena']})</option>
                                <option value="VSU North Park">VSU North Park (${itemsByLocation['VSU North Park']})</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-body" style="padding: 0;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th style="width: 80px;">Photo</th>
                                    <th>Artwork Name</th>
                                    <th>Artist / Manufacturer</th>
                                    <th>Acquisition Date</th>
                                    <th>Value (USD)</th>
                                    <th>Location</th>
                                    <th style="width: 120px;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="treasuryTableBody">
                                ${renderTreasuryTable()}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        function renderTreasuryTable(filter = 'all') {
            const filteredItems = filter === 'all' ? treasuryItems : treasuryItems.filter(i => i.location === filter);

            if (filteredItems.length === 0) {
                return `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                            <i class="fas fa-gem" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                            No pieces found
                        </td>
                    </tr>
                `;
            }

            return filteredItems.map(item => {
                const photoDisplay = item.photos && item.photos.length > 0
                    ? `<img src="${item.photos[0]}" style="width: 100%; height: 100%; object-fit: cover;" alt="${item.artworkName}">`
                    : `<i class="fas fa-image" style="color: var(--text-muted); font-size: 24px;"></i>`;

                return `
                    <tr>
                        <td>
                            <div style="width: 60px; height: 60px; border-radius: 8px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                ${photoDisplay}
                            </div>
                        </td>
                        <td><strong>${item.artworkName}</strong></td>
                        <td>
                            <div>${item.artist}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">${item.manufacturer}</div>
                        </td>
                        <td>${formatDate(item.acquisitionDate)}</td>
                        <td style="font-weight: 600; color: var(--success);">$${item.value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td>
                            <span class="badge" style="background: var(--accent-primary);">${item.location}</span>
                        </td>
                        <td>
                            <button class="btn-icon" onclick="viewTreasuryItem(${item.id})" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" onclick="editTreasuryItem(${item.id})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="deleteTreasuryItem(${item.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function filterTreasury(location) {
            const tbody = document.getElementById('treasuryTableBody');
            if (tbody) {
                tbody.innerHTML = renderTreasuryTable(location);
            }
        }

        function viewTreasuryItem(id) {
            const item = treasuryItems.find(t => t.id === id);
            if (!item) return;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            const photosDisplay = item.photos && item.photos.length > 0
                ? item.photos.map(photo => `
                    <img src="${photo}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 12px;" alt="${item.artworkName}">
                `).join('')
                : `<div style="text-align: center; padding: 40px; background: var(--bg-secondary); border-radius: 8px; color: var(--text-muted);">
                    <i class="fas fa-image" style="font-size: 48px; margin-bottom: 12px; display: block;"></i>
                    No photos available
                </div>`;

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-gem"></i> ${item.artworkName}</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 24px;">
                        ${photosDisplay}
                    </div>

                    <div class="card" style="margin-bottom: 16px;">
                        <div class="card-body">
                            <h4 style="margin: 0 0 16px; font-size: 14px; color: var(--text-muted);">Piece Information</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px;">
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Artist</label>
                                    <div style="font-weight: 500;">${item.artist}</div>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Manufacturer</label>
                                    <div>${item.manufacturer}</div>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Acquisition Date</label>
                                    <div>${formatDate(item.acquisitionDate)}</div>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Estimated Value</label>
                                    <div style="font-weight: 600; color: var(--success); font-size: 18px;">$${item.value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Current Location</label>
                                    <div><span class="badge" style="background: var(--accent-primary);">${item.location}</span></div>
                                </div>
                            </div>

                            ${item.description ? `
                                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color);">
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 8px;">Description</label>
                                    <p style="margin: 0; line-height: 1.6; color: var(--text-secondary);">${item.description}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <div style="display: flex; gap: 12px;">
                        <button class="btn-secondary" style="flex: 1;" onclick="editTreasuryItem(${item.id})">
                            <i class="fas fa-edit"></i>
                            Edit Piece
                        </button>
                        <button class="btn-secondary" style="flex: 1; background: var(--danger); color: white; border-color: var(--danger);" onclick="if(confirm('Are you sure you want to delete this piece?')) { deleteTreasuryItem(${item.id}); closeModal(); }">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            `;

            modal.classList.add('active');
        }

        function editTreasuryItem(id) {
            closeModal();
            setTimeout(() => openModal('edit-treasury', id), 100);
        }

        function deleteTreasuryItem(id) {
            if (confirm('Are you sure you want to delete this piece from the collection?')) {
                treasuryItems = treasuryItems.filter(t => t.id !== id);
                renderTreasury();
            }
        }

        function saveTreasuryItem(isEdit = false, itemId = null) {
            const artworkName = document.getElementById('treasury-artwork-name').value.trim();
            const artist = document.getElementById('treasury-artist').value.trim();
            const manufacturer = document.getElementById('treasury-manufacturer').value.trim();
            const acquisitionDate = document.getElementById('treasury-acquisition-date').value;
            const value = parseFloat(document.getElementById('treasury-value').value);
            const location = document.getElementById('treasury-location').value;
            const description = document.getElementById('treasury-description').value.trim();

            if (!artworkName || !artist || !manufacturer || !acquisitionDate || !value || !location) {
                alert('Please fill in all required fields');
                return;
            }

            const photoInput = document.getElementById('treasury-photos');
            const existingPhotos = isEdit ? treasuryItems.find(t => t.id === itemId).photos : [];

            if (isEdit) {
                const item = treasuryItems.find(t => t.id === itemId);
                item.artworkName = artworkName;
                item.artist = artist;
                item.manufacturer = manufacturer;
                item.acquisitionDate = acquisitionDate;
                item.value = value;
                item.location = location;
                item.description = description;

                if (photoInput.files.length > 0) {
                    const newPhotos = Array.from(photoInput.files).map(file => URL.createObjectURL(file));
                    item.photos = [...existingPhotos, ...newPhotos];
                }
            } else {
                const newItem = {
                    id: treasuryItems.length > 0 ? Math.max(...treasuryItems.map(t => t.id)) + 1 : 1,
                    artworkName,
                    artist,
                    manufacturer,
                    acquisitionDate,
                    value,
                    location,
                    description,
                    photos: photoInput.files.length > 0 ? Array.from(photoInput.files).map(file => URL.createObjectURL(file)) : []
                };
                treasuryItems.push(newItem);
            }

            closeModal();
            renderTreasury();
        }

        // Cash Out Functions
        function renderCashOut() {
            const dashboard = document.querySelector('.dashboard');

            const openRecords = cashOutRecords.filter(r => r.status === 'open');
            const closedRecords = cashOutRecords.filter(r => r.status === 'closed');
            const totalOpen = openRecords.reduce((sum, r) => sum + r.amount, 0);
            const totalClosed = closedRecords.reduce((sum, r) => sum + r.amountSpent, 0);

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Cash Out Management</h2>
                        <p class="section-subtitle">Track and manage cash disbursements</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('create-cashout')">
                        <i class="fas fa-plus"></i>
                        Create Cash Out
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 32px;">
                    <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                        <div class="stat-content">
                            <div class="stat-label" style="color: rgba(255, 255, 255, 0.9);">Open Cash Outs</div>
                            <div class="stat-value" style="color: white;">${openRecords.length}</div>
                            <div style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin-top: 8px;">
                                Total: $${totalOpen.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </div>
                        </div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                        <div class="stat-content">
                            <div class="stat-label" style="color: rgba(255, 255, 255, 0.9);">Closed Cash Outs</div>
                            <div class="stat-value" style="color: white;">${closedRecords.length}</div>
                            <div style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin-top: 8px;">
                                Total Spent: $${totalClosed.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </div>
                        </div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, var(--accent-primary) 0%, #818cf8 100%);">
                        <div class="stat-content">
                            <div class="stat-label" style="color: rgba(255, 255, 255, 0.9);">Total Records</div>
                            <div class="stat-value" style="color: white;">${cashOutRecords.length}</div>
                            <div style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin-top: 8px;">
                                All time tracking
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Open Cash Outs -->
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-folder-open"></i>
                            Open Cash Outs
                        </h3>
                        <span class="badge" style="background: var(--warning);">${openRecords.length} Open</span>
                    </div>
                    <div class="card-body">
                        ${openRecords.length === 0 ? `
                            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                                No open cash outs
                            </div>
                        ` : `
                            <div style="display: grid; gap: 16px;">
                                ${openRecords.map(record => `
                                    <div class="card" style="border-left: 4px solid var(--warning);">
                                        <div class="card-body">
                                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                                <div>
                                                    <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">${record.name}</h4>
                                                    <div style="font-size: 13px; color: var(--text-muted);">
                                                        <i class="fas fa-user"></i> ${record.createdBy} •
                                                        <i class="fas fa-calendar"></i> ${formatDate(record.createdDate)}
                                                    </div>
                                                </div>
                                                <div style="text-align: right;">
                                                    <div style="font-size: 24px; font-weight: 700; color: var(--warning);">
                                                        $${record.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                    </div>
                                                    <span class="badge" style="background: var(--warning); margin-top: 4px;">Open</span>
                                                </div>
                                            </div>
                                            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                                                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Reason:</div>
                                                <div style="font-size: 14px;">${record.reason}</div>
                                            </div>
                                            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                                                <button class="btn-secondary" onclick="viewCashOutDetails(${record.id})">
                                                    <i class="fas fa-eye"></i> View
                                                </button>
                                                <button class="btn-primary" onclick="openModal('close-cashout', ${record.id})">
                                                    <i class="fas fa-check"></i> Close Cash Out
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>

                <!-- Closed Cash Outs -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-check-circle"></i>
                            Closed Cash Outs
                        </h3>
                        <span class="badge" style="background: var(--success);">${closedRecords.length} Closed</span>
                    </div>
                    <div class="card-body" style="padding: 0;">
                        ${closedRecords.length === 0 ? `
                            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                                No closed cash outs yet
                            </div>
                        ` : `
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Created By</th>
                                        <th>Amount Given</th>
                                        <th>Amount Spent</th>
                                        <th>Money Left</th>
                                        <th>Closed Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${closedRecords.map(record => `
                                        <tr>
                                            <td><strong>${record.name}</strong></td>
                                            <td>${record.createdBy}</td>
                                            <td style="font-weight: 600;">$${record.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                            <td style="font-weight: 600; color: var(--danger);">$${record.amountSpent.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                            <td>
                                                ${record.hasMoneyLeft
                                                    ? `<span style="color: var(--success); font-weight: 600;">$${record.moneyLeft.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>`
                                                    : `<span style="color: var(--text-muted);">$0.00</span>`
                                                }
                                            </td>
                                            <td>${formatDate(record.closedDate)}</td>
                                            <td>
                                                <button class="btn-icon" onclick="viewCashOutDetails(${record.id})" title="View Details">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        `}
                    </div>
                </div>
            `;
        }

        function createCashOut() {
            const name = document.getElementById('cashout-name').value.trim();
            const amount = parseFloat(document.getElementById('cashout-amount').value);
            const reason = document.getElementById('cashout-reason').value.trim();

            if (!name || !amount || !reason) {
                alert('Please fill in all required fields');
                return;
            }

            if (amount <= 0) {
                alert('Amount must be greater than zero');
                return;
            }

            const newRecord = {
                id: cashOutRecords.length > 0 ? Math.max(...cashOutRecords.map(r => r.id)) + 1 : 1,
                name,
                amount,
                reason,
                createdDate: new Date().toISOString().split('T')[0],
                createdBy: 'Carlos Admin', // This should be dynamic based on logged-in user
                status: 'open',
                closedDate: null,
                receiptPhoto: null,
                amountSpent: null,
                moneyLeft: null,
                hasMoneyLeft: null
            };

            cashOutRecords.unshift(newRecord);
            closeModal();
            renderCashOut();
        }

        function closeCashOut(recordId) {
            const amountSpent = parseFloat(document.getElementById('cashout-amount-spent').value);
            const hasMoneyLeft = document.getElementById('cashout-money-left-yes').checked;
            const receiptInput = document.getElementById('cashout-receipt-photo');

            if (isNaN(amountSpent)) {
                alert('Please enter the amount spent');
                return;
            }

            const record = cashOutRecords.find(r => r.id === recordId);
            if (!record) return;

            if (amountSpent > record.amount) {
                if (!confirm(`Amount spent ($${amountSpent}) exceeds the original amount ($${record.amount}). Continue?`)) {
                    return;
                }
            }

            record.status = 'closed';
            record.closedDate = new Date().toISOString().split('T')[0];
            record.amountSpent = amountSpent;
            record.moneyLeft = record.amount - amountSpent;
            record.hasMoneyLeft = hasMoneyLeft;

            if (receiptInput.files.length > 0) {
                record.receiptPhoto = URL.createObjectURL(receiptInput.files[0]);
            }

            closeModal();
            renderCashOut();
        }

        function viewCashOutDetails(recordId) {
            const record = cashOutRecords.find(r => r.id === recordId);
            if (!record) return;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

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
                        <div>
                            <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Cash Out Name</div>
                            <div style="font-size: 18px; font-weight: 600;">${record.name}</div>
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
                            <div style="font-size: 14px;">${record.reason}</div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Amount Given</div>
                                <div style="font-size: 24px; font-weight: 700; color: var(--accent-primary);">
                                    $${record.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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
                                            $${record.amountSpent.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </div>
                                    </div>
                                    <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; text-align: center;">
                                        <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Money Left</div>
                                        <div style="font-size: 20px; font-weight: 700; color: ${record.hasMoneyLeft ? 'var(--success)' : 'var(--text-muted)'};">
                                            $${record.moneyLeft.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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
                        <button class="btn-primary" onclick="closeModal(); setTimeout(() => openModal('close-cashout', ${record.id}), 100);">
                            <i class="fas fa-check"></i> Close Cash Out
                        </button>
                    ` : ''}
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                </div>
            `;

            modal.style.display = 'flex';
        }

        // Issues Functions
        function renderIssues() {
            const dashboard = document.querySelector('.dashboard');

            const openIssues = issues.filter(i => i.status === 'open');
            const inProgressIssues = issues.filter(i => i.status === 'in_progress');
            const resolvedIssues = issues.filter(i => i.status === 'resolved');

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Issues Management</h2>
                        <p class="section-subtitle">Track and resolve customer issues</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('create-issue')">
                        <i class="fas fa-plus"></i>
                        Create Issue
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px;">
                    <div class="stat-card" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                        <div class="stat-content">
                            <div class="stat-label" style="color: rgba(255, 255, 255, 0.9);">Open Issues</div>
                            <div class="stat-value" style="color: white;">${openIssues.length}</div>
                            <div style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin-top: 8px;">
                                Needs attention
                            </div>
                        </div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                        <div class="stat-content">
                            <div class="stat-label" style="color: rgba(255, 255, 255, 0.9);">In Progress</div>
                            <div class="stat-value" style="color: white;">${inProgressIssues.length}</div>
                            <div style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin-top: 8px;">
                                Being handled
                            </div>
                        </div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                        <div class="stat-content">
                            <div class="stat-label" style="color: rgba(255, 255, 255, 0.9);">Resolved</div>
                            <div class="stat-value" style="color: white;">${resolvedIssues.length}</div>
                            <div style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin-top: 8px;">
                                Successfully closed
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Open Issues -->
                ${openIssues.length > 0 ? `
                    <div class="card" style="margin-bottom: 24px;">
                        <div class="card-header">
                            <h3 class="card-title">
                                <i class="fas fa-exclamation-circle"></i>
                                Open Issues
                            </h3>
                            <span class="badge" style="background: var(--danger);">${openIssues.length} Open</span>
                        </div>
                        <div class="card-body">
                            <div style="display: grid; gap: 16px;">
                                ${openIssues.map(issue => `
                                    <div class="card" style="border-left: 4px solid var(--danger);">
                                        <div class="card-body">
                                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                                <div style="flex: 1;">
                                                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                                        <h4 style="font-size: 16px; font-weight: 600; margin: 0;">${issue.customer}</h4>
                                                        <span class="badge" style="background: ${issue.type === 'In Store' ? 'var(--accent-primary)' : 'var(--info)'}; font-size: 12px;">
                                                            <i class="fas fa-${issue.type === 'In Store' ? 'store' : 'globe'}"></i>
                                                            ${issue.type}
                                                        </span>
                                                    </div>
                                                    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
                                                        <i class="fas fa-calendar"></i> Incident: ${formatDate(issue.incidentDate)} •
                                                        <i class="fas fa-user"></i> Created by: ${issue.createdBy}
                                                    </div>
                                                    <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px;">
                                                        <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Description:</div>
                                                        <div style="font-size: 14px;">${issue.description}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                                                <button class="btn-secondary" onclick="updateIssueStatus(${issue.id}, 'in_progress')">
                                                    <i class="fas fa-play"></i> Start Working
                                                </button>
                                                <button class="btn-primary" onclick="openModal('resolve-issue', ${issue.id})">
                                                    <i class="fas fa-check"></i> Resolve
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- In Progress Issues -->
                ${inProgressIssues.length > 0 ? `
                    <div class="card" style="margin-bottom: 24px;">
                        <div class="card-header">
                            <h3 class="card-title">
                                <i class="fas fa-spinner"></i>
                                In Progress
                            </h3>
                            <span class="badge" style="background: var(--warning);">${inProgressIssues.length} Active</span>
                        </div>
                        <div class="card-body">
                            <div style="display: grid; gap: 16px;">
                                ${inProgressIssues.map(issue => `
                                    <div class="card" style="border-left: 4px solid var(--warning);">
                                        <div class="card-body">
                                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                                <div style="flex: 1;">
                                                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                                        <h4 style="font-size: 16px; font-weight: 600; margin: 0;">${issue.customer}</h4>
                                                        <span class="badge" style="background: ${issue.type === 'In Store' ? 'var(--accent-primary)' : 'var(--info)'}; font-size: 12px;">
                                                            <i class="fas fa-${issue.type === 'In Store' ? 'store' : 'globe'}"></i>
                                                            ${issue.type}
                                                        </span>
                                                    </div>
                                                    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
                                                        <i class="fas fa-calendar"></i> Incident: ${formatDate(issue.incidentDate)} •
                                                        <i class="fas fa-user"></i> Created by: ${issue.createdBy}
                                                    </div>
                                                    <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px;">
                                                        <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Description:</div>
                                                        <div style="font-size: 14px;">${issue.description}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                                                <button class="btn-secondary" onclick="updateIssueStatus(${issue.id}, 'open')">
                                                    <i class="fas fa-arrow-left"></i> Back to Open
                                                </button>
                                                <button class="btn-primary" onclick="openModal('resolve-issue', ${issue.id})">
                                                    <i class="fas fa-check"></i> Resolve
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Resolved Issues -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-check-circle"></i>
                            Resolved Issues
                        </h3>
                        <span class="badge" style="background: var(--success);">${resolvedIssues.length} Resolved</span>
                    </div>
                    <div class="card-body" style="padding: 0;">
                        ${resolvedIssues.length === 0 ? `
                            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                                No resolved issues yet
                            </div>
                        ` : `
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Type</th>
                                        <th>Description</th>
                                        <th>Incident Date</th>
                                        <th>Resolved By</th>
                                        <th>Resolution Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${resolvedIssues.map(issue => `
                                        <tr>
                                            <td><strong>${issue.customer}</strong></td>
                                            <td>
                                                <span class="badge" style="background: ${issue.type === 'In Store' ? 'var(--accent-primary)' : 'var(--info)'};">
                                                    ${issue.type}
                                                </span>
                                            </td>
                                            <td style="max-width: 300px;">${issue.description}</td>
                                            <td>${formatDate(issue.incidentDate)}</td>
                                            <td>${issue.resolvedBy}</td>
                                            <td>${formatDate(issue.resolutionDate)}</td>
                                            <td>
                                                <button class="btn-icon" onclick="viewIssueDetails(${issue.id})" title="View Details">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        `}
                    </div>
                </div>
            `;
        }

        function createIssue() {
            const customer = document.getElementById('issue-customer').value.trim();
            const type = document.getElementById('issue-type').value;
            const description = document.getElementById('issue-description').value.trim();
            const incidentDate = document.getElementById('issue-incident-date').value;

            if (!customer || !type || !description || !incidentDate) {
                alert('Please fill in all required fields');
                return;
            }

            const newIssue = {
                id: issues.length > 0 ? Math.max(...issues.map(i => i.id)) + 1 : 1,
                customer,
                type,
                description,
                incidentDate,
                status: 'open',
                createdBy: 'Carlos Admin', // This should be dynamic based on logged-in user
                createdDate: new Date().toISOString().split('T')[0],
                solution: null,
                resolvedBy: null,
                resolutionDate: null
            };

            issues.unshift(newIssue);
            closeModal();
            renderIssues();
        }

        function updateIssueStatus(issueId, newStatus) {
            const issue = issues.find(i => i.id === issueId);
            if (!issue) return;

            issue.status = newStatus;
            renderIssues();
        }

        function resolveIssue(issueId) {
            const solution = document.getElementById('issue-solution').value.trim();
            const resolvedBy = document.getElementById('issue-resolved-by').value.trim();

            if (!solution || !resolvedBy) {
                alert('Please fill in all required fields');
                return;
            }

            const issue = issues.find(i => i.id === issueId);
            if (!issue) return;

            issue.status = 'resolved';
            issue.solution = solution;
            issue.resolvedBy = resolvedBy;
            issue.resolutionDate = new Date().toISOString().split('T')[0];

            closeModal();
            renderIssues();
        }

        function viewIssueDetails(issueId) {
            const issue = issues.find(i => i.id === issueId);
            if (!issue) return;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            const statusColors = {
                'open': 'var(--danger)',
                'in_progress': 'var(--warning)',
                'resolved': 'var(--success)'
            };

            const statusLabels = {
                'open': 'Open',
                'in_progress': 'In Progress',
                'resolved': 'Resolved'
            };

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
                            <span class="badge" style="background: ${statusColors[issue.status]}; font-size: 14px; padding: 8px 16px;">
                                ${statusLabels[issue.status]}
                            </span>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
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

                        <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px;">
                            <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Description</div>
                            <div style="font-size: 14px; line-height: 1.6;">${issue.description}</div>
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

                        ${issue.status === 'resolved' ? `
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
                                        <div style="font-weight: 600; color: var(--success);">${issue.resolvedBy}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Resolution Date</div>
                                        <div style="font-weight: 600; color: var(--success);">${formatDate(issue.resolutionDate)}</div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    ${issue.status !== 'resolved' ? `
                        <button class="btn-primary" onclick="closeModal(); setTimeout(() => openModal('resolve-issue', ${issue.id}), 100);">
                            <i class="fas fa-check"></i> Resolve Issue
                        </button>
                    ` : ''}
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                </div>
            `;

            modal.style.display = 'flex';
        }

        // Vendors Functions
        let vendorSearchTerm = '';
        let vendorCategoryFilter = 'all';

        function renderVendors() {
            const dashboard = document.querySelector('.dashboard');

            const categories = [...new Set(vendors.map(v => v.category))];

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Vendors</h2>
                        <p class="section-subtitle">Manage your supplier contacts and information</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('create-vendor')">
                        <i class="fas fa-plus"></i>
                        Add Vendor
                    </button>
                </div>

                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-body">
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
                        </div>
                    </div>
                </div>

                <div id="vendors-list">
                    ${renderVendorsList()}
                </div>
            `;
        }

        function renderVendorsList() {
            let filteredVendors = vendors;

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

            const categoryColors = {
                'Vape Products': '#6366f1',
                'Tobacco Products': '#8b5cf6',
                'Beverages': '#3b82f6',
                'Snacks & Candy': '#f59e0b',
                'Store Supplies': '#10b981'
            };

            return `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">
                    ${filteredVendors.map(vendor => `
                        <div class="card" style="cursor: pointer; transition: all 0.2s; border-left: 4px solid ${categoryColors[vendor.category] || 'var(--accent-primary)'};" onclick="viewVendorDetails(${vendor.id})">
                            <div class="card-body">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                    <div style="flex: 1;">
                                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">
                                            ${vendor.name}
                                        </h3>
                                        <span class="badge" style="background: ${categoryColors[vendor.category] || 'var(--accent-primary)'};">
                                            ${vendor.category}
                                        </span>
                                    </div>
                                    <i class="fas fa-chevron-right" style="color: var(--text-muted); font-size: 14px;"></i>
                                </div>

                                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);">
                                    <div style="display: grid; gap: 8px;">
                                        <div style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
                                            <i class="fas fa-user" style="width: 16px; color: var(--text-muted);"></i>
                                            <span style="color: var(--text-secondary);">${vendor.contact}</span>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
                                            <i class="fas fa-phone" style="width: 16px; color: var(--text-muted);"></i>
                                            <span style="color: var(--text-secondary);">${vendor.phone}</span>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
                                            <i class="fas fa-envelope" style="width: 16px; color: var(--text-muted);"></i>
                                            <span style="color: var(--text-secondary);">${vendor.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);">
                                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Products</div>
                                    <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">
                                        ${vendor.products.split(',').slice(0, 2).join(',')}${vendor.products.split(',').length > 2 ? '...' : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
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

        function createVendor() {
            const name = document.getElementById('vendor-name').value.trim();
            const category = document.getElementById('vendor-category').value;
            const contact = document.getElementById('vendor-contact').value.trim();
            const phone = document.getElementById('vendor-phone').value.trim();
            const email = document.getElementById('vendor-email').value.trim();
            const website = document.getElementById('vendor-website').value.trim();
            const access = document.getElementById('vendor-access').value.trim();
            const products = document.getElementById('vendor-products').value.trim();
            const orderMethods = document.getElementById('vendor-order-methods').value.trim();
            const notes = document.getElementById('vendor-notes').value.trim();

            if (!name || !category || !contact || !phone || !email || !products || !orderMethods) {
                alert('Please fill in all required fields');
                return;
            }

            const newVendor = {
                id: vendors.length > 0 ? Math.max(...vendors.map(v => v.id)) + 1 : 1,
                name,
                category,
                contact,
                phone,
                email,
                website,
                access,
                products,
                orderMethods,
                notes
            };

            vendors.push(newVendor);
            closeModal();
            renderVendors();
        }

        function viewVendorDetails(vendorId) {
            const vendor = vendors.find(v => v.id === vendorId);
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

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-truck"></i> ${vendor.name}</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; gap: 20px;">
                        <!-- Header with Category -->
                        <div style="text-align: center;">
                            <span class="badge" style="background: ${categoryColors[vendor.category] || 'var(--accent-primary)'}; font-size: 14px; padding: 8px 16px;">
                                ${vendor.category}
                            </span>
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
                <div class="modal-footer">
                    <button class="btn-primary" onclick="closeModal(); setTimeout(() => openModal('edit-vendor', ${vendor.id}), 100);">
                        <i class="fas fa-edit"></i> Edit Vendor
                    </button>
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                </div>
            `;

            modal.style.display = 'flex';
        }

        function editVendor(vendorId) {
            const name = document.getElementById('edit-vendor-name').value.trim();
            const category = document.getElementById('edit-vendor-category').value;
            const contact = document.getElementById('edit-vendor-contact').value.trim();
            const phone = document.getElementById('edit-vendor-phone').value.trim();
            const email = document.getElementById('edit-vendor-email').value.trim();
            const website = document.getElementById('edit-vendor-website').value.trim();
            const access = document.getElementById('edit-vendor-access').value.trim();
            const products = document.getElementById('edit-vendor-products').value.trim();
            const orderMethods = document.getElementById('edit-vendor-order-methods').value.trim();
            const notes = document.getElementById('edit-vendor-notes').value.trim();

            if (!name || !category || !contact || !phone || !email || !products || !orderMethods) {
                alert('Please fill in all required fields');
                return;
            }

            const vendor = vendors.find(v => v.id === vendorId);
            if (!vendor) return;

            vendor.name = name;
            vendor.category = category;
            vendor.contact = contact;
            vendor.phone = phone;
            vendor.email = email;
            vendor.website = website;
            vendor.access = access;
            vendor.products = products;
            vendor.orderMethods = orderMethods;
            vendor.notes = notes;

            closeModal();
            renderVendors();
        }

        // Gconomics Functions
        function renderGconomics() {
            const dashboard = document.querySelector('.dashboard');

            const filteredExpenses = getFilteredExpenses();
            const monthTotal = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

            const categories = ['Food', 'Home', 'Subscriptions', 'Health', 'Gifts', 'Others'];
            const categoryTotals = {};
            categories.forEach(cat => {
                categoryTotals[cat] = filteredExpenses
                    .filter(e => e.category === cat)
                    .reduce((sum, e) => sum + e.amount, 0);
            });

            const availableMonths = [...new Set(expenses.map(e => e.month))].sort().reverse();

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Gconomics - Expense Planner</h2>
                        <p class="section-subtitle">Track and manage your monthly expenses</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('add-expense')">
                        <i class="fas fa-plus"></i>
                        New Expense
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 300px; gap: 24px;">
                    <!-- Main Content -->
                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        <!-- Expenses Table -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-receipt"></i>
                                    Expenses
                                </h3>
                                <div style="display: flex; gap: 12px;">
                                    <select class="form-input" style="width: 150px;" onchange="filterExpensesByMonth(this.value)">
                                        ${availableMonths.map(month => `
                                            <option value="${month}" ${currentExpenseMonth === month ? 'selected' : ''}>
                                                ${new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="card-body" style="padding: 0;">
                                ${renderExpensesTable()}
                            </div>
                        </div>

                        <!-- Monthly Total -->
                        <div class="card" style="background: linear-gradient(135deg, var(--accent-primary) 0%, #818cf8 100%); color: white;">
                            <div class="card-body" style="text-align: center; padding: 32px;">
                                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Total This Month</div>
                                <div style="font-size: 48px; font-weight: 700;">
                                    $${monthTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        <!-- Categories Filter -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-filter"></i>
                                    Categories
                                </h3>
                            </div>
                            <div class="card-body">
                                <div style="display: flex; flex-direction: column; gap: 8px;">
                                    <button
                                        class="btn-secondary"
                                        style="${currentExpenseCategory === 'all' ? 'background: var(--accent-primary); color: white; border-color: var(--accent-primary);' : ''}"
                                        onclick="filterExpensesByCategory('all')"
                                    >
                                        All Categories
                                    </button>
                                    ${categories.map(cat => `
                                        <button
                                            class="btn-secondary"
                                            style="${currentExpenseCategory === cat ? 'background: var(--accent-primary); color: white; border-color: var(--accent-primary);' : ''}"
                                            onclick="filterExpensesByCategory('${cat}')"
                                        >
                                            ${cat}
                                            <span style="float: right; font-weight: 600;">$${categoryTotals[cat].toFixed(2)}</span>
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Chart -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-chart-pie"></i>
                                    Breakdown
                                </h3>
                            </div>
                            <div class="card-body">
                                ${renderExpenseChart(categoryTotals, monthTotal)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function getFilteredExpenses() {
            return expenses.filter(exp => {
                const monthMatch = exp.month === currentExpenseMonth;
                const categoryMatch = currentExpenseCategory === 'all' || exp.category === currentExpenseCategory;
                return monthMatch && categoryMatch;
            });
        }

        function renderExpensesTable() {
            const filteredExpenses = getFilteredExpenses();

            if (filteredExpenses.length === 0) {
                return `
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                        <i class="fas fa-receipt" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                        <div style="font-size: 16px;">No expenses found</div>
                        <div style="font-size: 14px; margin-top: 8px;">Add your first expense to get started</div>
                    </div>
                `;
            }

            const categoryColors = {
                'Food': '#10b981',
                'Home': '#3b82f6',
                'Subscriptions': '#8b5cf6',
                'Health': '#ef4444',
                'Gifts': '#f59e0b',
                'Others': '#6b7280'
            };

            return `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th style="width: 80px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => `
                            <tr>
                                <td>${formatDate(expense.date)}</td>
                                <td><strong>${expense.description}</strong></td>
                                <td>
                                    <span class="badge" style="background: ${categoryColors[expense.category] || '#6b7280'};">
                                        ${expense.category}
                                    </span>
                                </td>
                                <td style="font-weight: 600; color: var(--danger);">
                                    $${expense.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </td>
                                <td>
                                    <button class="btn-icon" onclick="deleteExpense(${expense.id})" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        function renderExpenseChart(categoryTotals, total) {
            if (total === 0) {
                return `<div style="text-align: center; padding: 20px; color: var(--text-muted);">No data to display</div>`;
            }

            const categoryColors = {
                'Food': '#10b981',
                'Home': '#3b82f6',
                'Subscriptions': '#8b5cf6',
                'Health': '#ef4444',
                'Gifts': '#f59e0b',
                'Others': '#6b7280'
            };

            return `
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${Object.entries(categoryTotals)
                        .filter(([_, amount]) => amount > 0)
                        .sort((a, b) => b[1] - a[1])
                        .map(([category, amount]) => {
                            const percentage = (amount / total * 100).toFixed(1);
                            return `
                                <div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
                                        <span style="font-weight: 500;">${category}</span>
                                        <span style="color: var(--text-muted);">${percentage}%</span>
                                    </div>
                                    <div style="background: var(--bg-secondary); height: 8px; border-radius: 4px; overflow: hidden;">
                                        <div style="background: ${categoryColors[category]}; height: 100%; width: ${percentage}%; transition: width 0.3s;"></div>
                                    </div>
                                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                                        $${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                </div>
            `;
        }

        function filterExpensesByMonth(month) {
            currentExpenseMonth = month;
            renderGconomics();
        }

        function filterExpensesByCategory(category) {
            currentExpenseCategory = category;
            renderGconomics();
        }

        function addExpense() {
            const description = document.getElementById('expense-description').value.trim();
            const amount = parseFloat(document.getElementById('expense-amount').value);
            const category = document.getElementById('expense-category').value;
            const date = document.getElementById('expense-date').value;

            if (!description || !amount || !category || !date) {
                alert('Please fill in all required fields');
                return;
            }

            if (amount <= 0) {
                alert('Amount must be greater than zero');
                return;
            }

            const month = date.substring(0, 7); // Extract YYYY-MM

            const newExpense = {
                id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
                description,
                amount,
                category,
                date,
                month
            };

            expenses.push(newExpense);
            closeModal();
            renderGconomics();
        }

        function deleteExpense(expenseId) {
            if (confirm('Are you sure you want to delete this expense?')) {
                expenses = expenses.filter(e => e.id !== expenseId);
                renderGconomics();
            }
        }

        // Helper functions
        function formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        // Variable to track employee being edited
        let editingEmployeeId = null;

        function openModal(type, data = null) {
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
                                    <label>Email *</label>
                                    <input type="email" class="form-input" id="edit-emp-email" value="${data.email || ''}" placeholder="john@vsu.com">
                                </div>
                                <div class="form-group">
                                    <label>Phone *</label>
                                    <input type="tel" class="form-input" id="edit-emp-phone" value="${data.phone || ''}" placeholder="(619) 555-0000">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Password (leave blank to keep current)</label>
                                    <input type="password" class="form-input" id="edit-emp-password" placeholder="Enter new password or leave blank">
                                </div>
                                <div class="form-group">
                                    <label>Confirm Password</label>
                                    <input type="password" class="form-input" id="edit-emp-confirm-password" placeholder="Confirm new password">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Job Position/Role *</label>
                                    <select class="form-input" id="edit-emp-role">
                                        <option value="">Select role...</option>
                                        <option value="Store Manager" ${data.role === 'Store Manager' ? 'selected' : ''}>Store Manager</option>
                                        <option value="Shift Lead" ${data.role === 'Shift Lead' ? 'selected' : ''}>Shift Lead</option>
                                        <option value="Sales Associate" ${data.role === 'Sales Associate' ? 'selected' : ''}>Sales Associate</option>
                                        <option value="Inventory Specialist" ${data.role === 'Inventory Specialist' ? 'selected' : ''}>Inventory Specialist</option>
                                    </select>
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
                            <div class="form-group">
                                <label>Emergency Contact</label>
                                <input type="text" class="form-input" id="edit-emp-emergency" value="${data.emergencyContact || ''}" placeholder="Name - Phone">
                            </div>
                            <div class="form-group">
                                <label>Allergies / Medical Notes</label>
                                <textarea class="form-input" id="edit-emp-allergies" rows="2" placeholder="Any allergies or medical conditions...">${data.allergies || ''}</textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveEditedEmployee()">Save Changes</button>
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
                                    <input type="tel" class="form-input" id="emp-phone" placeholder="(619) 555-0000">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Password *</label>
                                    <input type="password" class="form-input" id="emp-password" placeholder="Enter a secure password">
                                </div>
                                <div class="form-group">
                                    <label>Confirm Password *</label>
                                    <input type="password" class="form-input" id="emp-confirm-password" placeholder="Confirm password">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Job Position/Role *</label>
                                    <select class="form-input" id="emp-role">
                                        <option value="">Select role...</option>
                                        <option value="Store Manager">Store Manager</option>
                                        <option value="Shift Lead">Shift Lead</option>
                                        <option value="Sales Associate">Sales Associate</option>
                                        <option value="Inventory Specialist">Inventory Specialist</option>
                                    </select>
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
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Hire Date *</label>
                                    <input type="date" class="form-input" id="emp-hire-date">
                                </div>
                            </div>
                            <div class="form-divider"></div>
                            <h3 class="form-section-title">Emergency Information</h3>
                            <div class="form-group">
                                <label>Emergency Contact</label>
                                <input type="text" class="form-input" id="emp-emergency" placeholder="Name - Phone">
                            </div>
                            <div class="form-group">
                                <label>Allergies / Medical Notes</label>
                                <textarea class="form-input" id="emp-allergies" rows="2" placeholder="Any allergies or medical conditions..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveEmployee()">Add Employee</button>
                        </div>
                    `;
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
                                    <select class="form-input" id="training-type">
                                        <option value="video">Video (YouTube/Vimeo)</option>
                                        <option value="document">Document (PDF)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Duration</label>
                                    <input type="text" class="form-input" id="training-duration" placeholder="30 min">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>URL / Link *</label>
                                <input type="url" class="form-input" id="training-url" placeholder="https://youtube.com/watch?v=...">
                            </div>
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="training-required" checked>
                                    <span>Required for all employees</span>
                                </label>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveTraining()">Add Training</button>
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
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Expiration Date *</label>
                                    <input type="date" class="form-input" id="license-expires">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Upload PDF *</label>
                                <div class="file-upload">
                                    <input type="file" id="license-file" accept=".pdf">
                                    <div class="file-upload-content">
                                        <i class="fas fa-cloud-upload-alt"></i>
                                        <span>Click to upload or drag and drop</span>
                                        <small>PDF files only</small>
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
                                    <label>Category *</label>
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
                                    <label>Quantity *</label>
                                    <input type="number" class="form-input" id="new-product-quantity" placeholder="0">
                                </div>
                                <div class="form-group">
                                    <label>Price *</label>
                                    <input type="number" step="0.01" class="form-input" id="new-product-price" placeholder="0.00">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Store *</label>
                                    <select class="form-input" id="new-product-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar">VSU Miramar</option>
                                        <option value="Morena">VSU Morena</option>
                                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                        <option value="Chula Vista">VSU Chula Vista</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Arrival Date *</label>
                                    <input type="date" class="form-input" id="new-product-arrival">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Supplier *</label>
                                <input type="text" class="form-input" id="new-product-supplier" placeholder="Enter supplier name...">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveProduct()">Add Product</button>
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
                            <button class="btn-primary" onclick="submitRestockFromModal(${itemId})">Request</button>
                        </div>
                    `;
                    break;
                case 'new-restock-request':
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-box"></i> New Restock Request</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Product Name *</label>
                                <input type="text" class="form-input" id="new-restock-product" placeholder="Enter product name...">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Brand</label>
                                    <input type="text" class="form-input" id="new-restock-brand" placeholder="Enter brand...">
                                </div>
                                <div class="form-group">
                                    <label>Flavor/Variant</label>
                                    <input type="text" class="form-input" id="new-restock-flavor" placeholder="Enter flavor or variant...">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Quantity Requested *</label>
                                    <input type="number" class="form-input" id="new-restock-quantity" placeholder="Enter quantity...">
                                </div>
                                <div class="form-group">
                                    <label>Priority *</label>
                                    <select class="form-input" id="new-restock-priority">
                                        <option value="">Select priority...</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date *</label>
                                    <input type="date" class="form-input" id="new-restock-date" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div class="form-group">
                                    <label>Store *</label>
                                    <select class="form-input" id="new-restock-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar">VSU Miramar</option>
                                        <option value="Morena">VSU Morena</option>
                                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                        <option value="Chula Vista">VSU Chula Vista</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Requested By *</label>
                                    <input type="text" class="form-input" id="new-restock-requested-by" placeholder="Your name...">
                                </div>
                                <div class="form-group">
                                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                        <input type="checkbox" id="new-restock-customer-request" style="width: 18px; height: 18px; accent-color: var(--accent-primary);">
                                        <span>Customer Request</span>
                                    </label>
                                    <input type="text" class="form-input" id="new-restock-customer-info" placeholder="Customer name or info..." disabled style="background: var(--bg-hover);">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Notes (Optional)</label>
                                <textarea class="form-input" id="new-restock-notes" rows="3" placeholder="Add any additional notes..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="submitNewRestockRequest()">Submit Request</button>
                        </div>
                    `;
                    break;
                case 'create-cashout':
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-money-bill-wave"></i> Create Cash Out</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Name *</label>
                                <input type="text" class="form-input" id="cashout-name" placeholder="Enter cash out name (e.g., Office Supplies)...">
                            </div>
                            <div class="form-group">
                                <label>Amount *</label>
                                <input type="number" step="0.01" class="form-input" id="cashout-amount" placeholder="0.00">
                            </div>
                            <div class="form-group">
                                <label>Reason *</label>
                                <textarea class="form-input" id="cashout-reason" rows="4" placeholder="Enter the reason for this cash out..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="createCashOut()">
                                <i class="fas fa-plus"></i>
                                Create Cash Out
                            </button>
                        </div>
                    `;
                    break;
                case 'close-cashout':
                    const cashoutId = arguments[1];
                    const cashoutRecord = cashOutRecords.find(r => r.id === cashoutId);
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
                            <button class="btn-primary" onclick="closeCashOut(${cashoutId})">
                                <i class="fas fa-check"></i>
                                Close Cash Out
                            </button>
                        </div>
                    `;
                    break;
                case 'create-issue':
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-exclamation-triangle"></i> Create Issue</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Customer Name *</label>
                                <input type="text" class="form-input" id="issue-customer" placeholder="Enter customer name...">
                            </div>
                            <div class="form-group">
                                <label>Issue Type *</label>
                                <select class="form-input" id="issue-type">
                                    <option value="">Select type...</option>
                                    <option value="In Store">In Store</option>
                                    <option value="Online">Online</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Brief Description *</label>
                                <textarea class="form-input" id="issue-description" rows="4" placeholder="Describe the issue briefly..."></textarea>
                            </div>
                            <div class="form-group">
                                <label>Incident Date *</label>
                                <input type="date" class="form-input" id="issue-incident-date" value="${new Date().toISOString().split('T')[0]}">
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
                    const issue = issues.find(i => i.id === issueId);
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
                                <input type="text" class="form-input" id="issue-resolved-by" placeholder="Who handled this issue?" value="Carlos Admin">
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
                            <button class="btn-primary" onclick="resolveIssue(${issueId})">
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
                                    <input type="tel" class="form-input" id="vendor-phone" placeholder="(800) 555-0000">
                                </div>
                                <div class="form-group">
                                    <label>Email *</label>
                                    <input type="email" class="form-input" id="vendor-email" placeholder="email@vendor.com">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Website (Optional)</label>
                                    <input type="url" class="form-input" id="vendor-website" placeholder="https://...">
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
                                    <input type="tel" class="form-input" id="edit-vendor-phone" placeholder="(800) 555-0000" value="${editVendor.phone}">
                                </div>
                                <div class="form-group">
                                    <label>Email *</label>
                                    <input type="email" class="form-input" id="edit-vendor-email" placeholder="email@vendor.com" value="${editVendor.email}">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Website (Optional)</label>
                                    <input type="url" class="form-input" id="edit-vendor-website" placeholder="https://..." value="${editVendor.website || ''}">
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
                            <button class="btn-primary" onclick="editVendor(${editVendorId})">
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
                            <h2><i class="fas fa-gem"></i> Add Treasury Piece</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Artwork Name *</label>
                                <input type="text" class="form-input" id="treasury-artwork-name" placeholder="Enter artwork name...">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Artist *</label>
                                    <input type="text" class="form-input" id="treasury-artist" placeholder="Artist name...">
                                </div>
                                <div class="form-group">
                                    <label>Manufacturer *</label>
                                    <input type="text" class="form-input" id="treasury-manufacturer" placeholder="Manufacturer...">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Acquisition Date *</label>
                                    <input type="date" class="form-input" id="treasury-acquisition-date">
                                </div>
                                <div class="form-group">
                                    <label>Estimated Value (USD) *</label>
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
                                    <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Description (Optional)</label>
                                <textarea class="form-input" id="treasury-description" rows="4" placeholder="Add details about the piece..."></textarea>
                            </div>
                            <div class="form-group">
                                <label>Photos (Optional)</label>
                                <div class="file-upload">
                                    <input type="file" id="treasury-photos" accept="image/*" multiple>
                                    <div class="file-upload-content">
                                        <i class="fas fa-images"></i>
                                        <span>Click to upload or drag and drop</span>
                                        <small>Multiple images allowed (JPG, PNG, GIF)</small>
                                    </div>
                                </div>
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
                    const treasuryId = arguments[1];
                    const treasuryItem = treasuryItems.find(t => t.id === treasuryId);
                    if (!treasuryItem) break;

                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-edit"></i> Edit Treasury Piece</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Artwork Name *</label>
                                <input type="text" class="form-input" id="treasury-artwork-name" placeholder="Enter artwork name..." value="${treasuryItem.artworkName}">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Artist *</label>
                                    <input type="text" class="form-input" id="treasury-artist" placeholder="Artist name..." value="${treasuryItem.artist}">
                                </div>
                                <div class="form-group">
                                    <label>Manufacturer *</label>
                                    <input type="text" class="form-input" id="treasury-manufacturer" placeholder="Manufacturer..." value="${treasuryItem.manufacturer}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Acquisition Date *</label>
                                    <input type="date" class="form-input" id="treasury-acquisition-date" value="${treasuryItem.acquisitionDate}">
                                </div>
                                <div class="form-group">
                                    <label>Estimated Value (USD) *</label>
                                    <input type="number" step="0.01" class="form-input" id="treasury-value" placeholder="0.00" value="${treasuryItem.value}">
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
                                <label>Description (Optional)</label>
                                <textarea class="form-input" id="treasury-description" rows="4" placeholder="Add details about the piece...">${treasuryItem.description || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label>Photos (Optional)</label>
                                ${treasuryItem.photos && treasuryItem.photos.length > 0 ? `
                                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px; margin-bottom: 12px;">
                                        ${treasuryItem.photos.map(photo => `
                                            <div style="position: relative; padding-bottom: 100%; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color);">
                                                <img src="${photo}" style="position: absolute; width: 100%; height: 100%; object-fit: cover;" alt="Treasury photo">
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                <div class="file-upload">
                                    <input type="file" id="treasury-photos" accept="image/*" multiple>
                                    <div class="file-upload-content">
                                        <i class="fas fa-images"></i>
                                        <span>Click to upload more photos</span>
                                        <small>Multiple images allowed (JPG, PNG, GIF)</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveTreasuryItem(true, ${treasuryId})">
                                <i class="fas fa-save"></i>
                                Update Piece
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

        function closeModal() {
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
                            <div class="employee-avatar-xl ${emp.color}">${emp.initials}</div>
                            <div class="profile-info">
                                <h2>${emp.name}</h2>
                                <p>${emp.role} @ ${emp.store}</p>
                                <span class="status-badge ${emp.status}">${emp.status}</span>
                            </div>
                        </div>
                        <div class="profile-details">
                            <div class="detail-row">
                                <i class="fas fa-envelope"></i>
                                <span>${emp.email}</span>
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
                                <i class="fas fa-allergies"></i>
                                <span>Allergies: ${emp.allergies}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                    <button class="btn-primary" onclick="editEmployee(${emp.id})"><i class="fas fa-edit"></i> Edit</button>
                </div>
            `;
            modal.classList.add('active');
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
            const userRole = user.role || 'employee';
            const userPermissions = window.ROLE_PERMISSIONS[userRole] || window.ROLE_PERMISSIONS['employee'];
            const allowedPages = userPermissions.pages || [];

            // Map of data-page attribute to menu item selectors
            const pageElementMap = {
                'dashboard': 'a[onclick*="navigateTo(\'dashboard\')"]',
                'employees': 'a[onclick*="navigateTo(\'employees\')"]',
                'licenses': 'a[class*="folder-open"]',
                'analytics': 'a[onclick*="navigateTo(\'analytics\')"]',
                'newstuff': 'a[class*="box"][not([class*="boxes"])]',
                'abundancecloud': 'a[href*="abundance-cloud.html"]',
                'announcements': 'a[class*="bullhorn"]',
                'thieves': 'a[onclick*="navigateTo(\'thieves\')"]',
                'invoices': 'a[onclick*="navigateTo(\'invoices\')"]',
                'vendors': 'a[onclick*="navigateTo(\'vendors\')"]',
                'cashout': 'a[onclick*="navigateTo(\'cashout\')"]',
                'treasury': 'a[onclick*="navigateTo(\'treasury\')"]',
                'clockin': 'a[onclick*="navigateTo(\'clockin\')"]',
                'schedule': 'a[onclick*="navigateTo(\'schedule\')"]',
                'gforce': 'a[onclick*="openGForceModal"]',
                'geconomics': 'a[onclick*="navigateTo(\'geconomics\')"]'
            };

            // Hide all nav items first
            document.querySelectorAll('.nav-section a, .nav-section div').forEach(item => {
                // Don't hide nav-label or divs that contain nav items
                if (!item.classList.contains('nav-label') && item.tagName !== 'DIV' || item.classList.contains('nav-item')) {
                    item.style.display = 'none';
                }
            });

            // Show only allowed pages
            allowedPages.forEach(page => {
                // Special handling for items with specific text content
                let found = false;

                // Check for nav-item with data-page attribute
                document.querySelectorAll('.nav-item').forEach(item => {
                    if (item.dataset.page === page) {
                        item.style.display = '';
                        found = true;
                    }
                });

                // If not found by data-page, try by text content
                if (!found) {
                    const pageLabels = {
                        'dashboard': 'Dashboard',
                        'employees': 'Employees',
                        'licenses': 'Licenses & Docs',
                        'analytics': 'Sales Analytics',
                        'newstuff': 'New Stuff',
                        'abundancecloud': 'Abundance Cloud Engine',
                        'announcements': 'Announcements',
                        'thieves': 'Thieves',
                        'invoices': 'Invoices',
                        'vendors': 'Vendors',
                        'cashout': 'Cash Out',
                        'treasury': 'Treasury',
                        'clockin': 'Clock In/Out',
                        'schedule': 'Schedule',
                        'gforce': 'G Force'
                    };

                    const label = pageLabels[page];
                    if (label) {
                        document.querySelectorAll('.nav-item').forEach(item => {
                            if (item.textContent.includes(label)) {
                                item.style.display = '';
                                // Also show parent div if it exists
                                if (item.parentElement.tagName === 'DIV') {
                                    item.parentElement.style.display = '';
                                }
                            }
                        });
                    }
                }
            });

            // Show parent divs (dropdowns) if they contain visible items
            document.querySelectorAll('.nav-section > div').forEach(div => {
                const hasVisibleItems = div.querySelector('.nav-item[style=""], .nav-item:not([style*="display: none"])');
                if (hasVisibleItems) {
                    div.style.display = '';
                }
            });

            // Always show Clock In/Out if employee has access to clockin page
            if (allowedPages.includes('clockin')) {
                // Show the Clock In/Out dropdown item (using navigateTo)
                const clockinDropdownItem = document.querySelector('.nav-dropdown-item[onclick*="navigateTo(\'clockin\')"]');
                if (clockinDropdownItem) {
                    clockinDropdownItem.style.display = '';
                }
                // Show the parent dropdown container
                const employeesDropdown = document.getElementById('dropdown-employees');
                if (employeesDropdown) {
                    employeesDropdown.style.display = '';
                }
                // Show the Employees nav item (parent of dropdown)
                const employeesNavItem = document.querySelector('a.nav-item.has-dropdown[onclick*="employees"]');
                if (employeesNavItem) {
                    employeesNavItem.style.display = '';
                    if (employeesNavItem.parentElement.tagName === 'DIV') {
                        employeesNavItem.parentElement.style.display = '';
                    }
                }
            }

            // Show All Employees dropdown item if user has access to employees page
            if (allowedPages.includes('employees')) {
                // Show the main Employees nav item with dropdown
                const employeesNavItem = document.querySelector('a.nav-item.has-dropdown[onclick*="employees"]');
                if (employeesNavItem) {
                    employeesNavItem.style.display = '';
                    // Show parent div
                    if (employeesNavItem.parentElement.tagName === 'DIV') {
                        employeesNavItem.parentElement.style.display = '';
                    }
                }
                // Show the "All Employees" dropdown item
                const allEmployeesItem = document.querySelector('.nav-dropdown-item[onclick*="navigateTo(\'employees\')"]');
                if (allEmployeesItem) {
                    allEmployeesItem.style.display = '';
                }
                // Show the dropdown container
                const employeesDropdown = document.getElementById('dropdown-employees');
                if (employeesDropdown) {
                    employeesDropdown.style.display = '';
                }
            }

            // Always show external links like Abundance Cloud
            if (allowedPages.includes('abundancecloud')) {
                const cloudLink = document.querySelector('a[href*="abundance-cloud.html"]');
                if (cloudLink) {
                    cloudLink.style.display = '';
                }
            }

            // Show Dashboard to all users
            const dashboardLink = document.querySelector('.nav-item.active');
            if (dashboardLink) {
                dashboardLink.style.display = '';
            }
        }

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

            const firstName = document.getElementById('edit-emp-first-name').value.trim();
            const lastName = document.getElementById('edit-emp-last-name').value.trim();
            const email = document.getElementById('edit-emp-email').value.trim();
            const phone = document.getElementById('edit-emp-phone').value.trim();
            const password = document.getElementById('edit-emp-password').value.trim();
            const confirmPassword = document.getElementById('edit-emp-confirm-password').value.trim();
            const role = document.getElementById('edit-emp-role').value;
            const employeeType = document.getElementById('edit-emp-employee-type')?.value || 'employee';
            const store = document.getElementById('edit-emp-store').value;
            const status = document.getElementById('edit-emp-status').value;
            const hireDate = document.getElementById('edit-emp-hire-date').value;
            const emergency = document.getElementById('edit-emp-emergency').value.trim();
            const allergies = document.getElementById('edit-emp-allergies').value.trim();

            if (!firstName || !lastName || !email || !phone || !role || !store) {
                alert('Please fill in all required fields');
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
                email,
                phone,
                role,
                employeeType,
                store,
                status,
                hireDate: hireDate || new Date().toISOString().split('T')[0],
                emergencyContact: emergency || 'Not provided',
                allergies: allergies || 'None'
            };

            // Only include password if it's being changed
            if (password) {
                updatedData.password = password;
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
                    const success = await firebaseEmployeeManager.updateEmployee(employeeId, updatedData);
                    if (!success) {
                        throw new Error('Failed to update in Firebase');
                    }
                }

                // Update local array
                const index = employees.findIndex(e => e.id === employeeId || e.firestoreId === employeeId);
                if (index !== -1) {
                    employees[index] = {
                        ...employees[index],
                        ...updatedData
                    };
                }

                // Clear editing state
                editingEmployeeId = null;

                closeModal();
                renderPage(currentPage);
                showNotification('Employee updated successfully!', 'success');
            } catch (error) {
                console.error('Error updating employee:', error);
                alert('Error updating employee. Please try again.');

                if (saveBtn) {
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                }
            }
        }

        async function deleteEmployee(id) {
            // Check permission
            if (!checkPermission('canDeleteEmployees')) {
                showPermissionDenied('delete employees');
                return;
            }

            // Find employee by id or firestoreId
            const emp = employees.find(e => e.id === id || e.firestoreId === id);
            if (!emp) {
                alert('Employee not found');
                return;
            }

            if (confirm(`Are you sure you want to delete ${emp.name}? This action cannot be undone.`)) {
                try {
                    // Delete from Firebase first
                    const firestoreId = emp.firestoreId || emp.id;
                    if (firebaseEmployeeManager.isInitialized) {
                        const deleted = await firebaseEmployeeManager.deleteEmployee(firestoreId);
                        if (!deleted) {
                            throw new Error('Failed to delete from Firebase');
                        }
                    }

                    // Remove from local array
                    employees = employees.filter(e => e.id !== id && e.firestoreId !== id);

                    // Re-render page
                    renderPage(currentPage);
                    showNotification('Employee deleted successfully', 'success');
                } catch (error) {
                    console.error('Error deleting employee:', error);
                    alert('Error deleting employee. Please try again.');
                }
            }
        }

        function filterEmployees() {
            const search = document.getElementById('employee-search').value.toLowerCase();
            const store = document.getElementById('store-filter').value;
            const status = document.getElementById('status-filter').value;

            const filtered = employees.filter(emp => {
                const matchSearch = emp.name.toLowerCase().includes(search) || emp.role.toLowerCase().includes(search);
                const matchStore = !store || emp.store === store;
                const matchStatus = !status || emp.status === status;
                return matchSearch && matchStore && matchStatus;
            });

            document.getElementById('employees-grid').innerHTML = filtered.map(emp => renderEmployeeCard(emp)).join('');
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
            const emergency = document.getElementById('emp-emergency').value.trim();
            const allergies = document.getElementById('emp-allergies').value.trim();

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
                password,  // Store the password in Firebase
                role,                                    // Job position (Store Manager, Sales Associate, etc)
                employeeType: employeeType,              // Permission level (admin, manager, employee)
                store,
                hireDate: hireDate || new Date().toISOString().split('T')[0],
                emergencyContact: emergency || 'Not provided',
                allergies: allergies || 'None',
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
                    const firestoreId = await firebaseEmployeeManager.addEmployee(newEmployee);
                    if (firestoreId) {
                        newEmployee.id = firestoreId;
                        newEmployee.firestoreId = firestoreId;
                        console.log('Employee saved to Firebase:', firestoreId);

                        // Add to local array
                        employees.push(newEmployee);

                        closeModal();
                        renderPage(currentPage);

                        // Show success message
                        showNotification('Employee added successfully!', 'success');
                    } else {
                        throw new Error('Failed to get Firestore ID');
                    }
                } else {
                    // Fallback: save locally only
                    newEmployee.id = Date.now().toString();
                    employees.push(newEmployee);
                    closeModal();
                    renderPage(currentPage);
                    showNotification('Employee added (offline mode)', 'warning');
                }
            } catch (error) {
                console.error('Error saving employee:', error);
                alert('Error saving employee. Please try again.');

                // Reset button
                if (saveBtn) {
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                }
            }
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

        function saveTraining() {
            const title = document.getElementById('training-title').value;
            const type = document.getElementById('training-type').value;
            const duration = document.getElementById('training-duration').value;
            const url = document.getElementById('training-url').value;
            const required = document.getElementById('training-required').checked;

            if (!title || !url) {
                alert('Please fill in all required fields');
                return;
            }

            trainings.push({
                id: trainings.length + 1,
                title, type, url,
                duration: duration || '30 min',
                completion: 0,
                required
            });

            closeModal();
            renderPage(currentPage);
        }

        function saveLicense() {
            const name = document.getElementById('license-name').value;
            const store = document.getElementById('license-store').value;
            const expires = document.getElementById('license-expires').value;

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

            licenses.push({
                id: licenses.length + 1,
                name, store, expires, status,
                file: `${name.toLowerCase().replace(/\s+/g, '_')}_${store.toLowerCase()}.pdf`
            });

            closeModal();
            renderPage(currentPage);
        }

        function saveAnnouncement() {
            const title = document.getElementById('announcement-title').value;
            const content = document.getElementById('announcement-content').value;

            if (!title || !content) {
                alert('Please fill in all required fields');
                return;
            }

            announcements.unshift({
                id: announcements.length + 1,
                date: new Date().toISOString().split('T')[0],
                title, content,
                author: 'Carlos Admin'
            });

            closeModal();
            renderPage(currentPage);
        }

        function saveAnnouncementInline() {
            const title = document.getElementById('new-announcement-title').value;
            const content = document.getElementById('new-announcement-content').value;

            if (!title || !content) {
                alert('Please fill in both title and content');
                return;
            }

            announcements.unshift({
                id: announcements.length + 1,
                date: new Date().toISOString().split('T')[0],
                title, content,
                author: 'Carlos Admin'
            });

            renderAnnouncements();
        }

        function saveProduct() {
            const name = document.getElementById('new-product-name').value;
            const category = document.getElementById('new-product-category').value;
            const quantity = document.getElementById('new-product-quantity').value;
            const price = document.getElementById('new-product-price').value;
            const store = document.getElementById('new-product-store').value;
            const arrivalDate = document.getElementById('new-product-arrival').value;
            const supplier = document.getElementById('new-product-supplier').value;

            if (!name || !category || !quantity || !price || !store || !arrivalDate || !supplier) {
                alert('Please fill in all required fields');
                return;
            }

            products.unshift({
                id: products.length + 1,
                name,
                category,
                quantity: parseInt(quantity),
                price: parseFloat(price),
                store,
                arrivalDate,
                supplier,
                status: 'pending'
            });

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

            restockRequests.unshift({
                id: restockRequests.length + 1,
                productName: productName,
                quantity: item.minStock - parseInt(qtyHand),
                store,
                requestedBy: 'Carlos Admin',
                requestDate: date,
                status: 'pending',
                priority: parseInt(qtyHand) < item.minStock * 0.3 ? 'high' : parseInt(qtyHand) < item.minStock * 0.6 ? 'medium' : 'low',
                notes: noteText
            });

            closeModal();
            currentRestockTab = 'requests';
            renderRestockRequests();
        }

        function openNewRestockRequestModal() {
            openModal('new-restock-request');

            // Enable/disable customer info field based on checkbox
            setTimeout(() => {
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

        function submitNewRestockRequest() {
            const product = document.getElementById('new-restock-product').value;
            const brand = document.getElementById('new-restock-brand').value;
            const flavor = document.getElementById('new-restock-flavor').value;
            const quantity = document.getElementById('new-restock-quantity').value;
            const priority = document.getElementById('new-restock-priority').value;
            const date = document.getElementById('new-restock-date').value;
            const store = document.getElementById('new-restock-store').value;
            const requestedBy = document.getElementById('new-restock-requested-by').value;
            const isCustomerRequest = document.getElementById('new-restock-customer-request').checked;
            const customerInfo = document.getElementById('new-restock-customer-info').value;
            const notes = document.getElementById('new-restock-notes').value;

            // Validation
            if (!product || !quantity || !priority || !date || !store || !requestedBy) {
                alert('Please fill in all required fields');
                return;
            }

            if (isCustomerRequest && !customerInfo) {
                alert('Please provide customer information');
                return;
            }

            // Build product name
            let productName = product;
            if (brand) productName = `${brand} ${productName}`;
            if (flavor) productName = `${productName} - ${flavor}`;

            // Build notes
            const noteText = isCustomerRequest
                ? `Customer Request: ${customerInfo}${notes ? '\n' + notes : ''}`
                : notes;

            // Add to requests array
            restockRequests.unshift({
                id: restockRequests.length + 1,
                productName: productName,
                quantity: parseInt(quantity),
                store,
                requestedBy,
                requestDate: date,
                status: 'pending',
                priority,
                notes: noteText
            });

            closeModal();
            currentRestockTab = 'requests';
            renderRestockRequests();
        }

        // Initialize navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            const page = item.querySelector('.nav-icon i').className.split(' ')[1].replace('fa-', '');
            const pageMap = {
                'th-large': 'dashboard',
                'users': 'employees',
                'graduation-cap': 'training',
                'folder-open': 'licenses',
                'chart-line': 'analytics',
                'box': 'newstuff',
                'boxes': 'restock',
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
                'vault': 'treasury'
            };
            item.dataset.page = pageMap[page] || 'dashboard';
            
            item.addEventListener('click', function(e) {
                // Allow external links (like Abundance Cloud) to navigate normally
                if (this.classList.contains('external-link') || this.getAttribute('href') !== '#') {
                    return; // Let the browser handle the navigation
                }
                e.preventDefault();
                navigateTo(this.dataset.page);
            });
        });

        // Close modal on background click
        const modal = document.getElementById('modal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) closeModal();
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
                    embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`
                };
            }

            // Detect Vimeo URLs
            const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
            const vimeoMatch = url.match(vimeoRegex);

            if (vimeoMatch) {
                return {
                    type: 'vimeo',
                    embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
                };
            }

            return null;
        }

        function playTrainingVideo(trainingId) {
            const training = trainings.find(t => t.id === trainingId);
            if (!training || training.type !== 'video') return;

            const videoInfo = getVideoEmbedUrl(training.url);
            if (!videoInfo) {
                alert('Invalid video URL. Please use a YouTube or Vimeo link.');
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
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <span style="color: var(--text-muted); font-size: 13px;">
                                <i class="fas fa-clock"></i> ${training.duration}
                            </span>
                            <span style="color: var(--text-muted); font-size: 13px;">
                                <i class="fas fa-${training.required ? 'exclamation-circle' : 'check'}"></i> ${training.required ? 'Required' : 'Optional'}
                            </span>
                        </div>
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
            const training = trainings.find(t => t.id === trainingId);
            if (!training) return;

            if (training.type === 'video') {
                playTrainingVideo(trainingId);
            } else {
                // For document type, show details
                alert(`Viewing training: ${training.title}\nType: ${training.type}\nDuration: ${training.duration}`);
            }
        }

        function editTraining(trainingId) {
            alert('Edit training #' + trainingId + ' - Coming soon!');
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

        // Logout functionality
        function logout() {
            if (confirm('Are you sure you want to logout?')) {
                // Clear any saved data if needed
                localStorage.removeItem('userSession');

                // Show logout message
                alert('You have been logged out successfully.');

                // In a real app, redirect to login page
                // window.location.href = '/login';
            }
        }

        // Load theme on page initialization
        loadTheme();

        // Mobile menu toggle
        function toggleMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('mobile-open');
        }

        // Close mobile menu when clicking nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            const existingListener = item.onclick;
            item.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    const sidebar = document.querySelector('.sidebar');
                    sidebar.classList.remove('mobile-open');
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.sidebar');
                const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

                // Check if sidebar is open and click is outside sidebar and menu button
                if (sidebar.classList.contains('mobile-open') &&
                    !sidebar.contains(event.target) &&
                    !mobileMenuBtn.contains(event.target)) {
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

        function handleLicenseDragStart(event, licenseId) {
            draggedLicenseId = licenseId;
            event.target.classList.add('dragging');
            event.dataTransfer.effectAllowed = 'move';
        }

        function handleLicenseDragOver(event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            const dropZone = event.currentTarget;
            dropZone.classList.add('drag-over');
        }

        function handleLicenseDragLeave(event) {
            const dropZone = event.currentTarget;
            dropZone.classList.remove('drag-over');
        }

        function handleLicenseDrop(event, targetStore) {
            event.preventDefault();
            const dropZone = event.currentTarget;
            dropZone.classList.remove('drag-over');

            if (draggedLicenseId !== null) {
                const license = licenses.find(l => l.id === draggedLicenseId);
                if (license && license.store !== targetStore) {
                    license.store = targetStore;
                    renderLicenses();
                }
                draggedLicenseId = null;
            }
        }

        function viewLicense(licenseId) {
            const license = licenses.find(l => l.id === licenseId);
            if (!license) return;

            alert(`License: ${license.name}\nStore: ${license.store}\nExpires: ${formatDate(license.expires)}\nStatus: ${license.status}`);
        }

        function deleteLicense(licenseId) {
            if (confirm('Are you sure you want to delete this license?')) {
                const index = licenses.findIndex(l => l.id === licenseId);
                if (index !== -1) {
                    licenses.splice(index, 1);
                    renderLicenses();
                }
            }
        }

        // G FORCE FUNCTIONALITY
        const gforceQuotes = [
            { text: "Abundance is not something we acquire, it is something we tune into.", author: "Wayne Dyer" },
            { text: "The universe is always conspiring in your favor when you raise your vibration.", author: "Anonymous" },
            { text: "What you think, you create. What you feel, you attract. What you imagine, you become.", author: "Buddha" },
            { text: "Gratitude is the key that unlocks the door to infinite abundance.", author: "Melody Beattie" },
            { text: "You are a living magnet. What you attract into your life is in harmony with your dominant thoughts.", author: "Brian Tracy" },
            { text: "Money is energy, and energy flows where you put your attention.", author: "Deepak Chopra" },
            { text: "Don't look for happiness outside yourself. Abundance begins within.", author: "Rumi" },
            { text: "When you change the way you look at things, the things you look at change.", author: "Wayne Dyer" },
            { text: "The universe returns what you radiate. Be the energy you want to attract.", author: "G Force Original" },
            { text: "Prosperity is a state of mind before it becomes a physical reality.", author: "Napoleon Hill" },
            { text: "Every moment is an opportunity to align with universal abundance.", author: "G Force Original" },
            { text: "Your vibrational frequency determines your reality. Choose thoughts of abundance.", author: "G Force Original" },
            { text: "The universe doesn't give you what you ask for, it gives you what you are.", author: "G Force Original" },
            { text: "Gratitude transforms what you have into enough, and more.", author: "G Force Original" },
            { text: "You are not a drop in the ocean, you are the entire ocean in a drop.", author: "Rumi" },
            { text: "Energy flows where your focus goes. Focus on abundance.", author: "Tony Robbins" },
            { text: "Your intention creates your reality. Declare your prosperity now.", author: "G Force Original" },
            { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
            { text: "When you connect with your purpose, the universe supports you.", author: "G Force Original" },
            { text: "Abundance is your birthright. Claim it with confidence.", author: "Louise Hay" }
        ];

        const gforceAffirmations = [
            "I am a magnet for infinite abundance and prosperity",
            "The universe is constantly working in my favor",
            "I deserve all the good things coming into my life",
            "My energy attracts wonderful opportunities every day",
            "I trust in the perfect process of the universe",
            "I am aligned with the frequency of abundance",
            "I release everything that no longer serves me and embrace the new",
            "My mind is at peace, my heart is calm",
            "I am worthy of receiving everything I desire and more",
            "Every day I become more prosperous in all aspects of my life",
            "Money flows to me easily and naturally",
            "I am surrounded by love, light, and abundance",
            "My present is full of blessings that I recognize with gratitude",
            "I have everything I need in this moment",
            "My thoughts create my reality and I choose thoughts of abundance",
            "I am an open channel for universal prosperity",
            "Each breath connects me more deeply with my inner peace",
            "I trust in my ability to create the life I desire",
            "Success and abundance are my natural state",
            "I am exactly where I need to be in this moment"
        ];

        const gforcePhilosophies = [
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
            }
        ];

        let currentGForceQuoteIndex = -1;
        let currentGForcePhilosophyIndex = -1;

        function getGForceDate() {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return new Date().toLocaleDateString('en-US', options);
        }

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

        function generateGForceQuote() {
            displayGForceQuote(getRandomGForceQuote());
        }

        function generateGForceAffirmations() {
            displayGForceAffirmations(getRandomGForceAffirmations(5));
        }

        function generateGForcePhilosophy() {
            displayGForcePhilosophy(getRandomGForcePhilosophy());
        }

        function openGForceModal() {
            document.getElementById('gforce-date').textContent = getGForceDate();
            generateGForceQuote();
            generateGForceAffirmations();
            generateGForcePhilosophy();
            document.getElementById('gforce-modal').classList.add('active');
        }

        function closeGForceModal() {
            document.getElementById('gforce-modal').classList.remove('active');
        }

        // Close modal when clicking outside
        document.getElementById('gforce-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeGForceModal();
            }
        });

// =============================================================================
// GCONOMICS - Expense Planner
// =============================================================================

// Expense categories
const GCONOMICS_CATEGORIES = [
    { id: 'food', name: 'Food', icon: 'fa-utensils', color: '#f59e0b' },
    { id: 'home', name: 'Home', icon: 'fa-home', color: '#3b82f6' },
    { id: 'subscriptions', name: 'Subscriptions', icon: 'fa-credit-card', color: '#8b5cf6' },
    { id: 'health', name: 'Health', icon: 'fa-heart-pulse', color: '#ef4444' },
    { id: 'gifts', name: 'Gifts', icon: 'fa-gift', color: '#ec4899' },
    { id: 'other', name: 'Other', icon: 'fa-ellipsis', color: '#6b7280' }
];

// Gconomics state
let gconomicsState = {
    expenses: JSON.parse(localStorage.getItem('gconomicsExpenses')) || [],
    currentMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
    selectedCategory: 'all',
    editingExpenseId: null
};

// Save expenses to localStorage
function saveGconomicsExpenses() {
    localStorage.setItem('gconomicsExpenses', JSON.stringify(gconomicsState.expenses));
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
function renderGconomics() {
    const dashboard = document.querySelector('.dashboard');
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
        <div class="page-header">
            <div class="page-header-left">
                <h2 class="section-title">Gconomics</h2>
                <p class="section-subtitle">Expense Planner - ${currentMonthName}</p>
            </div>
            <div class="page-header-actions">
                <button class="btn-primary" onclick="openAddExpenseModal()">
                    <i class="fas fa-plus"></i> New Expense
                </button>
            </div>
        </div>

        <div class="gconomics-layout">
            <!-- Sidebar -->
            <div class="gconomics-sidebar">
                <!-- Categories -->
                <div class="gconomics-sidebar-section">
                    <h3 class="gconomics-sidebar-title">
                        <i class="fas fa-tags"></i> Categories
                    </h3>
                    <div class="gconomics-category-list">
                        <button class="gconomics-category-btn ${gconomicsState.selectedCategory === 'all' ? 'active' : ''}"
                                onclick="filterGconomicsByCategory('all')">
                            <span class="category-icon" style="background: var(--accent-primary);">
                                <i class="fas fa-border-all"></i>
                            </span>
                            <span class="category-name">All</span>
                            <span class="category-amount">${formatCurrencyGconomics(monthlyTotal)}</span>
                        </button>
                        ${GCONOMICS_CATEGORIES.map(cat => `
                            <button class="gconomics-category-btn ${gconomicsState.selectedCategory === cat.id ? 'active' : ''}"
                                    onclick="filterGconomicsByCategory('${cat.id}')">
                                <span class="category-icon" style="background: ${cat.color};">
                                    <i class="fas ${cat.icon}"></i>
                                </span>
                                <span class="category-name">${cat.name}</span>
                                <span class="category-amount">${formatCurrencyGconomics(categoryTotals[cat.id] || 0)}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Previous Months -->
                <div class="gconomics-sidebar-section">
                    <h3 class="gconomics-sidebar-title">
                        <i class="fas fa-calendar-alt"></i> Previous Months
                    </h3>
                    <div class="gconomics-month-list">
                        ${availableMonths.map(month => {
                            const monthTotal = getMonthlyTotal(month);
                            const monthName = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                            const isActive = month === gconomicsState.currentMonth;
                            return `
                                <button class="gconomics-month-btn ${isActive ? 'active' : ''}"
                                        onclick="changeGconomicsMonth('${month}')">
                                    <span class="month-name">${monthName}</span>
                                    <span class="month-amount">${formatCurrencyGconomics(monthTotal)}</span>
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Chart -->
                <div class="gconomics-sidebar-section">
                    <h3 class="gconomics-sidebar-title">
                        <i class="fas fa-chart-pie"></i> Breakdown
                    </h3>
                    <div class="gconomics-chart">
                        ${renderGconomicsChart(categoryTotals, monthlyTotal)}
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="gconomics-main">
                <!-- Expenses Table -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-receipt"></i>
                            Expenses
                            ${gconomicsState.selectedCategory !== 'all' ? `<span class="filter-badge">${GCONOMICS_CATEGORIES.find(c => c.id === gconomicsState.selectedCategory)?.name}</span>` : ''}
                        </h3>
                        <span class="expense-count">${displayExpenses.length} expense${displayExpenses.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="card-body" style="padding: 0;">
                        ${displayExpenses.length === 0 ? `
                            <div class="empty-state">
                                <i class="fas fa-receipt"></i>
                                <h3>No expenses yet</h3>
                                <p>Click "New Expense" to add your first expense</p>
                            </div>
                        ` : `
                            <table class="gconomics-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Category</th>
                                        <th style="text-align: right;">Amount</th>
                                        <th style="width: 100px;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${displayExpenses.map(expense => {
                                        const category = GCONOMICS_CATEGORIES.find(c => c.id === expense.category) || GCONOMICS_CATEGORIES[5];
                                        const expenseDate = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                        return `
                                            <tr>
                                                <td class="expense-date">${expenseDate}</td>
                                                <td class="expense-description">${expense.description}</td>
                                                <td>
                                                    <span class="expense-category-badge" style="background: ${category.color}20; color: ${category.color};">
                                                        <i class="fas ${category.icon}"></i>
                                                        ${category.name}
                                                    </span>
                                                </td>
                                                <td class="expense-amount">${formatCurrencyGconomics(expense.amount)}</td>
                                                <td class="expense-actions">
                                                    <button class="action-btn edit" onclick="editExpense('${expense.id}')" title="Edit">
                                                        <i class="fas fa-pen"></i>
                                                    </button>
                                                    <button class="action-btn delete" onclick="deleteExpense('${expense.id}')" title="Delete">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        `}
                    </div>
                </div>

                <!-- Monthly Total -->
                <div class="gconomics-total-card">
                    <div class="total-icon">
                        <i class="fas fa-calculator"></i>
                    </div>
                    <div class="total-info">
                        <span class="total-label">${currentMonthName} Total</span>
                        <span class="total-value">${formatCurrencyGconomics(monthlyTotal)}</span>
                    </div>
                </div>
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
                    <form id="expenseForm" onsubmit="saveExpense(event)">
                        <div class="form-group">
                            <label for="expenseDate">Date</label>
                            <input type="date" id="expenseDate" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label for="expenseDescription">Description</label>
                            <input type="text" id="expenseDescription" class="form-input" placeholder="What did you spend on?" required>
                        </div>
                        <div class="form-group">
                            <label for="expenseCategory">Category</label>
                            <select id="expenseCategory" class="form-input" required>
                                ${GCONOMICS_CATEGORIES.map(cat => `
                                    <option value="${cat.id}">${cat.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="expenseAmount">Amount</label>
                            <input type="number" id="expenseAmount" class="form-input" placeholder="0.00" step="0.01" min="0" required>
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
    document.getElementById('expenseModal').classList.add('active');
}

// Close expense modal
function closeExpenseModal() {
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
    if (!confirm('Are you sure you want to delete this expense?')) return;

    gconomicsState.expenses = gconomicsState.expenses.filter(e => e.id !== expenseId);
    saveGconomicsExpenses();
    renderGconomics();
}

// Save expense
function saveExpense(event) {
    event.preventDefault();

    const date = document.getElementById('expenseDate').value;
    const description = document.getElementById('expenseDescription').value.trim();
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);

    if (!date || !description || !category || isNaN(amount) || amount <= 0) {
        const msg = document.getElementById('expenseMessage');
        msg.className = 'alert error';
        msg.textContent = 'Please fill in all fields correctly';
        msg.style.display = 'block';
        return;
    }

    if (gconomicsState.editingExpenseId) {
        // Update existing expense
        const index = gconomicsState.expenses.findIndex(e => e.id === gconomicsState.editingExpenseId);
        if (index > -1) {
            gconomicsState.expenses[index] = {
                ...gconomicsState.expenses[index],
                date,
                description,
                category,
                amount
            };
        }
    } else {
        // Add new expense
        const newExpense = {
            id: Date.now().toString(),
            date,
            description,
            category,
            amount,
            createdAt: new Date().toISOString()
        };
        gconomicsState.expenses.push(newExpense);
    }

    saveGconomicsExpenses();
    closeExpenseModal();

    // Switch to the month of the expense if different
    const expenseMonth = date.slice(0, 7);
    if (expenseMonth !== gconomicsState.currentMonth) {
        gconomicsState.currentMonth = expenseMonth;
    }

    renderGconomics();
}
