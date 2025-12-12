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
            cashout: null,
            change: null
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
            { id: 1, name: 'JUUL Starter Kit', category: 'Vape Devices', quantity: 24, arrivalDate: '2025-12-10', store: 'Miramar', status: 'pending', supplier: 'JUUL Labs', price: 34.99, image: 'https://images.unsplash.com/photo-1560913210-fd4c0e4c3f75?w=400&h=300&fit=crop' },
            { id: 3, name: 'Elf Bar BC5000 - Mixed Flavors', category: 'Disposables', quantity: 120, arrivalDate: '2025-12-15', store: 'Kearny Mesa', status: 'pending', supplier: 'Elf Bar', price: 15.99, image: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&h=300&fit=crop' },
            { id: 4, name: 'Marlboro Red Box', category: 'Cigarettes', quantity: 200, arrivalDate: '2025-12-12', store: 'Chula Vista', status: 'pending', supplier: 'Philip Morris', price: 8.99, image: 'https://images.unsplash.com/photo-1571941736487-969c8e1d8e9f?w=400&h=300&fit=crop' },
            { id: 5, name: 'Puff Bar Plus', category: 'Disposables', quantity: 80, arrivalDate: '2025-12-07', store: 'Miramar', status: 'arrived', supplier: 'Puff Bar', price: 13.99, image: 'https://images.unsplash.com/photo-1606235727737-4c2b7a0ecab7?w=400&h=300&fit=crop' },
            { id: 6, name: 'SMOK Nord 4 Kit', category: 'Vape Devices', quantity: 15, arrivalDate: '2025-12-20', store: 'Morena', status: 'pending', supplier: 'SMOK', price: 42.99, image: 'https://images.unsplash.com/photo-1559813114-caa66ac94942?w=400&h=300&fit=crop' }
        ];

        let inventory = [
            { id: 1, brand: 'JUUL', productName: 'JUUL Starter Kit', flavor: 'Virginia Tobacco', volume: '0.7ml', nicotine: '5%', unitPrice: 34.99, minStock: 10, stock: 5, store: 'Miramar' },
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

        // Change Records - Cambio dejado en Campos
        let changeRecords = [
            {
                id: 1,
                store: 'Miramar',
                amount: 500.00,
                date: '2025-12-10',
                leftBy: 'Marcus Rodriguez',
                receivedBy: 'Sarah Kim',
                notes: 'Se dejó en caja 1',
                photo: null
            },
            {
                id: 2,
                store: 'Morena',
                amount: 300.00,
                date: '2025-12-09',
                leftBy: 'James Thompson',
                receivedBy: 'Amanda Lopez',
                notes: 'Se metió extra por falta de cambio',
                photo: null
            },
            {
                id: 3,
                store: 'Kearny Mesa',
                amount: 400.00,
                date: '2025-12-08',
                leftBy: 'David Nguyen',
                receivedBy: 'Marcus Rodriguez',
                notes: '',
                photo: null
            }
        ];

        // Gifts Records - Control de Regalos en Especie
        let giftsCurrentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        let giftsRecords = [
            {
                id: 1,
                product: 'Vape Pen SMOK Nord 4',
                quantity: 1,
                value: 45.99,
                recipient: 'Juan Pérez',
                recipientType: 'customer',
                reason: 'Producto defectuoso - reemplazo por garantía',
                store: 'Miramar',
                date: '2025-12-10',
                notes: 'Cliente habitual, su vape dejó de funcionar después de 2 semanas',
                photo: null
            },
            {
                id: 2,
                product: 'E-Liquid 60ml Naked 100',
                quantity: 2,
                value: 39.98,
                recipient: 'María García',
                recipientType: 'customer',
                reason: 'Compensación por error en pedido',
                store: 'Morena',
                date: '2025-12-09',
                notes: 'Se le envió sabor equivocado, se le regaló el correcto + el erróneo',
                photo: null
            },
            {
                id: 3,
                product: 'Coils para Caliburn',
                quantity: 5,
                value: 24.95,
                recipient: 'Carlos López',
                recipientType: 'vendor',
                reason: 'Regalo a proveedor por colaboración',
                store: 'Kearny Mesa',
                date: '2025-12-08',
                notes: 'Proveedor nos ayudó con entrega urgente',
                photo: null
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
            
            // If page not in allowed list, silently deny access and return to current page
            if (!allowedPages.includes(page)) {
                console.warn(`⚠️ Access denied: ${userPermissions.label} role cannot access ${page}`);
                return;
            }
            
            currentPage = page;
            
            // Save current page to sessionStorage (persists on refresh, clears on tab close)
            sessionStorage.setItem('ascendance_current_page', page);
            
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
                newstuff: 'New Stuff',
                change: 'Change',
                gifts: 'Gifts',
                risknotes: 'Risk Notes'
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
                case 'change':
                    renderChange();
                    break;
                case 'gifts':
                    renderGifts();
                    break;
                case 'gforce':
                    renderGForce();
                    break;
                case 'risknotes':
                    renderRiskNotes();
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
                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
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

        async function renderTraining() {
            const dashboard = document.querySelector('.dashboard');

            // Show loading state
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
                <div style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--accent-primary);"></i>
                    <p style="color: var(--text-muted); margin-top: 16px;">Loading training materials...</p>
                </div>
            `;

            // Load trainings from Firebase
            await loadTrainingsFromFirebase();

            // Render the trainings grid
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

                ${trainings.length === 0 ? `
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                        <i class="fas fa-graduation-cap" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                        <div style="font-size: 16px;">No training materials yet</div>
                        <div style="font-size: 14px; margin-top: 8px;">Click "Add Training" to create your first training material</div>
                    </div>
                ` : `
                    <div class="training-grid">
                        ${trainings.map(t => `
                            <div class="training-card" onclick="${t.type === 'video' ? `playTrainingVideo('${t.id}')` : `viewTraining('${t.id}')`}" style="cursor: pointer;">
                                <div class="training-card-thumbnail ${t.type}">
                                    <i class="fas fa-${t.type === 'video' ? 'play-circle' : 'file-pdf'}"></i>
                                </div>
                                <div class="training-card-body">
                                    <div class="training-card-type">${(t.type || 'document').toUpperCase()}</div>
                                    <h3 class="training-card-title">${t.title}</h3>
                                    <div class="training-card-meta">
                                        <span><i class="fas fa-clock"></i> ${t.duration || '30 min'}</span>
                                        <span class="${t.required ? 'required' : ''}"><i class="fas fa-${t.required ? 'exclamation-circle' : 'check'}"></i> ${t.required ? 'Required' : 'Optional'}</span>
                                    </div>
                                    ${t.fileName ? `
                                        <div style="margin-top: 8px; font-size: 12px; color: var(--text-muted);">
                                            <i class="fas fa-file-pdf"></i> ${t.fileName}
                                        </div>
                                    ` : ''}
                                    <div class="training-card-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${t.completion || 0}%;"></div>
                                        </div>
                                        <span>${t.completion || 0}% completed</span>
                                    </div>
                                </div>
                                <div class="training-card-footer">
                                    <button class="btn-secondary" onclick="event.stopPropagation(); viewTraining('${t.id}')">View Details</button>
                                    <button class="btn-icon" onclick="event.stopPropagation(); editTraining('${t.id}')"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon danger" onclick="event.stopPropagation(); deleteTraining('${t.id}')"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            `;
        }

        function renderLicenses() {
            const stores = ['Miramar', 'Miramar Wine & Liquor', 'Morena', 'Kearny Mesa', 'Chula Vista'];

            const dashboard = document.querySelector('.dashboard');
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Licenses & Documents</h2>
                        <div style="display: flex; align-items: center; gap: 16px; margin-top: 12px;">
                            <p class="section-subtitle">Drag and drop documents between stores</p>
                            <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg-secondary); border-radius: 6px;">
                                <span style="font-size: 13px; font-weight: 500; color: var(--text-secondary);">Edit Mode:</span>
                                <button onclick="toggleLicensesEditMode()" style="background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center;">
                                    <div style="width: 44px; height: 24px; background: ${licensesEditMode ? '#10b981' : '#ef4444'}; border-radius: 12px; position: relative; transition: background 0.3s;">
                                        <div style="width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; ${licensesEditMode ? 'right: 2px;' : 'left: 2px;'} transition: all 0.3s;"></div>
                                    </div>
                                </button>
                                <span style="font-size: 12px; color: ${licensesEditMode ? '#10b981' : '#ef4444'}; font-weight: 600; min-width: 60px;">${licensesEditMode ? '✓ EDITABLE' : '✗ LOCKED'}</span>
                            </div>
                        </div>
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
                                             draggable="${licensesEditMode ? 'true' : 'false'}"
                                             data-license-id="${lic.id}"
                                             ondragstart="handleLicenseDragStart(event, ${lic.id})"
                                             style="cursor: ${licensesEditMode ? 'grab' : 'default'}; opacity: ${licensesEditMode ? '1' : '0.85'}; ${!licensesEditMode ? 'pointer-events: none;' : ''}">
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
                    <div class="page-header-right">
                        <button class="btn-primary" onclick="openModal('add-announcement')">
                            <i class="fas fa-plus"></i> New Announcement
                        </button>
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
            // No modal - directly submit with current user and time
            submitClockAction(action);
        }

        function closeClockModal() {
            // Not needed anymore, but kept for compatibility
        }

        async function submitClockAction(action = null) {
            // Use the action passed as parameter if available
            if (action) {
                currentClockAction = action;
            }

            // Get current logged-in user
            const currentUser = getCurrentUser();
            
            if (!currentUser || (!currentUser.userId && !currentUser.id)) {
                console.error('No user logged in');
                showNotification('Error: No user logged in', 'error');
                return;
            }

            // Get current time in HH:MM format
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const time = `${hours}:${minutes}`;

            // Get employee info from current user
            // Priority: Name (main identifier) -> ID -> Email -> Create fallback
            let employee = null;
            
            // 1. First try to find by NAME (this is the primary identifier to avoid duplicates)
            if (currentUser.name) {
                employee = employees.find(e => e.name === currentUser.name);
                if (employee) console.log('✅ Found employee by name:', currentUser.name);
            }
            
            // 2. If not found by name, try by ID
            if (!employee) {
                const userId = currentUser.userId || currentUser.id;
                if (userId) {
                    employee = employees.find(e => String(e.id) === String(userId));
                    if (employee) console.log('✅ Found employee by ID:', userId);
                }
            }

            // 3. If still not found, try by email
            if (!employee && currentUser.email) {
                employee = employees.find(e => e.email === currentUser.email);
                if (employee) console.log('✅ Found employee by email:', currentUser.email);
            }

            // 4. If still not found, create a minimal employee object
            if (!employee) {
                const userId = currentUser.userId || currentUser.id;
                console.warn('⚠️ Employee not found in database, creating fallback record');
                employee = {
                    id: userId,
                    name: currentUser.name || 'Current User',
                    role: currentUser.role || 'Employee',
                    initials: (currentUser.name || 'CU')?.substring(0, 2).toUpperCase() || 'CU',
                    store: currentUser.store || 'VSU Miramar',
                    email: currentUser.email
                };
            }

            const store = employee.store || 'VSU Miramar';

            console.log('✅ Clock action for user:', employee.name, 'at', time, 'Action:', currentClockAction);

            // Format date as YYYY-MM-DD for consistency
            const today = new Date();
            const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
            const dateDisplayString = today.toDateString();

            // Find record by EMPLOYEE NAME (primary identifier to avoid duplicates)
            let record = clockinAttendanceRecords.find(r => r.employeeName === employee.name && r.date === dateDisplayString);

            // Create new record if doesn't exist
            if (!record) {
                record = {
                    id: Date.now(),
                    employeeId: employee.id,
                    employeeName: employee.name,
                    employeeRole: employee.role,
                    employeeInitials: employee.initials || employee.name?.substring(0, 2).toUpperCase() || '',
                    store: store,
                    date: dateDisplayString,
                    clockIn: null,
                    lunchStart: null,
                    lunchEnd: null,
                    clockOut: null,
                    notes: ''
                };
                clockinAttendanceRecords.push(record);
            } else {
                // Update existing record's store
                if (store) record.store = store;
            }

            // Update record based on action
            switch(currentClockAction) {
                case 'in':
                    if (record.clockIn) {
                        console.warn('Employee already clocked in today');
                        showNotification('You are already clocked in', 'warning');
                        return;
                    }
                    record.clockIn = time;
                    console.log('⏱️ Clocking in:', record.employeeName, 'at', time);
                    break;
                case 'lunch-start':
                    if (!record.clockIn) {
                        console.warn('Lunch start attempted without clock in');
                        showNotification('Please clock in first', 'warning');
                        return;
                    }
                    if (record.lunchStart) {
                        console.warn('Lunch break already started');
                        showNotification('Lunch break already started', 'warning');
                        return;
                    }
                    record.lunchStart = time;
                    console.log('🍽️ Lunch start:', record.employeeName, 'at', time);
                    break;
                case 'lunch-end':
                    if (!record.lunchStart) {
                        console.warn('Lunch break not started yet');
                        showNotification('Lunch break not started yet', 'warning');
                        return;
                    }
                    if (record.lunchEnd) {
                        console.warn('Lunch break already ended');
                        showNotification('Lunch break already ended', 'warning');
                        return;
                    }
                    record.lunchEnd = time;
                    console.log('🍽️ Lunch end:', record.employeeName, 'at', time);
                    break;
                case 'out':
                    if (!record.clockIn) {
                        console.warn('Clock out attempted without clock in');
                        showNotification('Please clock in first', 'warning');
                        return;
                    }
                    if (record.clockOut) {
                        console.warn('Employee already clocked out today');
                        showNotification('You are already clocked out', 'warning');
                        return;
                    }
                    record.clockOut = time;
                    console.log('⏱️ Clocking out:', record.employeeName, 'at', time);
                    break;
            }

            // Save to localStorage
            localStorage.setItem('attendanceRecords', JSON.stringify(clockinAttendanceRecords));

            // Save to Firebase
            try {
                // Initialize Firebase Clock In Manager if not already done
                if (!firebaseClockInManager.isInitialized) {
                    await firebaseClockInManager.initialize();
                }

                // Prepare clock record for Firebase
                const firebaseRecord = {
                    employeeId: employee.id,
                    employeeName: employee.name,
                    employeeRole: employee.role,
                    store: store,
                    date: dateString, // YYYY-MM-DD format
                    clockIn: record.clockIn,
                    lunchStart: record.lunchStart,
                    lunchEnd: record.lunchEnd,
                    clockOut: record.clockOut,
                    notes: record.notes || ''
                };

                // Save to Firebase
                await firebaseClockInManager.saveClockRecord(firebaseRecord);
                console.log('✅ Clock record saved to Firebase successfully');
                
                // Reload from Firebase immediately to sync state across devices/reloads
                try {
                    const updatedRecords = await firebaseClockInManager.loadClockRecordsByDate(dateString);
                    console.log('✅ Reloaded updated records from Firebase:', updatedRecords.length);
                    
                    if (updatedRecords.length > 0) {
                        // Update local records with Firebase data
                        const today = new Date().toDateString();
                        const updatedArray = [];
                        const processedNames = new Set();
                        
                        updatedRecords.forEach(rec => {
                            processedNames.add(rec.employeeName);
                            updatedArray.push({
                                id: rec.id || Date.now(),
                                employeeId: rec.employeeId,
                                employeeName: rec.employeeName,
                                employeeRole: rec.employeeRole,
                                employeeInitials: rec.employeeName?.substring(0, 2).toUpperCase() || '',
                                store: rec.store,
                                date: today,
                                clockIn: rec.clockIn || null,
                                lunchStart: rec.lunchStart || null,
                                lunchEnd: rec.lunchEnd || null,
                                clockOut: rec.clockOut || null,
                                notes: rec.notes || ''
                            });
                        });
                        
                        // Add any local-only records
                        clockinAttendanceRecords.forEach(localRec => {
                            if (!processedNames.has(localRec.employeeName) && localRec.date === today) {
                                updatedArray.push(localRec);
                            }
                        });
                        
                        clockinAttendanceRecords = updatedArray;
                        localStorage.setItem('attendanceRecords', JSON.stringify(clockinAttendanceRecords));
                    }
                } catch (reloadError) {
                    console.warn('⚠️ Could not reload from Firebase after save:', reloadError);
                }
            } catch (error) {
                console.error('⚠️ Error saving to Firebase:', error);
                // Don't prevent saving to localStorage if Firebase fails
                // The user will still see success message but data is local only
            }

            // Show success message and reload
            showNotification('Action recorded successfully!', 'success');
            
            // Reload attendance table
            setTimeout(() => {
                loadAttendanceData();
            }, 500);
        }

        async function loadAttendanceData() {
            const today = new Date().toDateString();
            const dateString = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
            
            const loadingDiv = document.getElementById('loadingAttendance');
            const tableContainer = document.getElementById('attendanceTableContainer');
            const emptyState = document.getElementById('emptyAttendanceState');

            if (!loadingDiv) return;

            // Show loading
            loadingDiv.style.display = 'flex';
            tableContainer.style.display = 'none';
            emptyState.style.display = 'none';

            try {
                // Initialize Firebase Clock In Manager if not already done
                if (!firebaseClockInManager.isInitialized) {
                    await firebaseClockInManager.initialize();
                }

                // Try to load from Firebase first
                let firebaseRecords = [];
                try {
                    firebaseRecords = await firebaseClockInManager.loadClockRecordsByDate(dateString);
                    console.log('✅ Loaded clock records from Firebase:', firebaseRecords.length);
                    
                    // Merge Firebase records with local records intelligently
                    if (firebaseRecords.length > 0) {
                        // Create a map of Firebase records by EMPLOYEE NAME (primary identifier)
                        const firebaseMap = {};
                        firebaseRecords.forEach(rec => {
                            firebaseMap[rec.employeeName] = rec;
                        });
                        
                        // Update or add records
                        const updatedRecords = [];
                        const processedNames = new Set();
                        
                        // First, process Firebase records (they're latest)
                        firebaseRecords.forEach(rec => {
                            processedNames.add(rec.employeeName);
                            updatedRecords.push({
                                id: rec.id || Date.now(),
                                employeeId: rec.employeeId,
                                employeeName: rec.employeeName,
                                employeeRole: rec.employeeRole,
                                employeeInitials: rec.employeeName?.substring(0, 2).toUpperCase() || '',
                                store: rec.store,
                                date: today, // Use display format for local tracking
                                clockIn: rec.clockIn || null,
                                lunchStart: rec.lunchStart || null,
                                lunchEnd: rec.lunchEnd || null,
                                clockOut: rec.clockOut || null,
                                notes: rec.notes || ''
                            });
                        });
                        
                        // Then, add any local-only records
                        clockinAttendanceRecords.forEach(localRec => {
                            if (!processedNames.has(localRec.employeeName) && localRec.date === today) {
                                updatedRecords.push(localRec);
                            }
                        });
                        
                        clockinAttendanceRecords = updatedRecords;
                        // Save merged data to localStorage for fallback
                        localStorage.setItem('attendanceRecords', JSON.stringify(clockinAttendanceRecords));
                    }
                } catch (firebaseError) {
                    console.warn('⚠️ Could not load from Firebase, using local data:', firebaseError);
                    // Fall back to localStorage - filter only today's records
                    clockinAttendanceRecords = clockinAttendanceRecords.filter(r => r.date === today);
                }
            } catch (error) {
                console.error('Error in loadAttendanceData:', error);
            }

            // Get today's records
            const todayRecords = clockinAttendanceRecords.filter(r => r.date === today);

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

            // Show loading state
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
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 16px;"></i>
                    <p>Loading products from Firebase...</p>
                </div>
            `;

            // Load products from Firebase
            loadProductsFromFirebase().then(() => {
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

                    ${products.length === 0 ? `
                        <div style="text-align: center; padding: 60px 20px; background: var(--bg-hover); border-radius: 12px;">
                            <i class="fas fa-box-open" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                            <h3 style="color: var(--text-secondary);">No Products Yet</h3>
                            <p style="color: var(--text-muted); margin-bottom: 20px;">Add your first product to get started</p>
                            <button class="btn-primary" onclick="openModal('add-product')">
                                <i class="fas fa-plus"></i> Add First Product
                            </button>
                        </div>
                    ` : `
                        <div class="employees-grid">
                            ${products.map(product => `
                                <div class="card" onclick="viewProductDetails('${product.id}')" style="cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='';">
                                    <div class="product-image-container" style="position: relative; width: 100%; height: 180px; overflow: hidden; border-radius: 12px 12px 0 0;">
                                        <img src="${product.image || 'https://via.placeholder.com/400x300?text=No+Image'}"
                                             alt="${product.name}"
                                             style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;"
                                             onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                                    </div>
                                    <div class="card-header" style="background: rgba(139, 92, 246, 0.1); border-radius: 0;">
                                        <h3 class="card-title" style="font-size: 16px; font-weight: 600;">
                                            ${product.name}
                                        </h3>
                                    </div>
                                    <div class="card-body">
                                        <div style="display: flex; flex-direction: column; gap: 8px;">
                                            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-color);">
                                                <span style="color: var(--text-muted); font-size: 13px;">Category:</span>
                                                <span style="font-weight: 600; font-size: 13px;">${product.category || '-'}</span>
                                            </div>
                                            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-color);">
                                                <span style="color: var(--text-muted); font-size: 13px;">Quantity:</span>
                                                <span style="font-weight: 600; font-size: 13px; color: var(--accent-primary);">${product.quantity || 0} units</span>
                                            </div>
                                            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-color);">
                                                <span style="color: var(--text-muted); font-size: 13px;">Price:</span>
                                                <span style="font-weight: 600; font-size: 13px; color: var(--success);">$${product.price || 0}</span>
                                            </div>
                                            <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                                                <span style="color: var(--text-muted); font-size: 13px;">Store:</span>
                                                <span style="font-weight: 600; font-size: 13px;">${product.store || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card-footer" style="padding: 12px 16px; border-top: 1px solid var(--border-color); text-align: center;">
                                        <span style="color: var(--text-muted); font-size: 12px;">
                                            <i class="fas fa-hand-pointer"></i> Click to view details
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                `;
            });
        }

        function viewProductDetails(productId) {
            const product = products.find(p => p.id === productId);
            if (!product) return;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2 style="display: flex; align-items: center; gap: 12px; margin: 0;">
                        <i class="fas fa-box" style="color: var(--accent-primary); font-size: 24px;"></i>
                        Product Details
                    </h2>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${product.image ? `
                        <div style="
                            margin-bottom: 24px;
                            border-radius: 16px;
                            overflow: hidden;
                            background: var(--bg-secondary);
                            position: relative;
                            aspect-ratio: 16 / 10;
                        ">
                            <img 
                                src="${product.image}" 
                                alt="${product.name}" 
                                style="
                                    width: 100%;
                                    height: 100%;
                                    object-fit: cover;
                                    display: block;
                                " 
                                onerror="this.style.display='none'">
                        </div>
                    ` : `
                        <div style="
                            margin-bottom: 24px;
                            border-radius: 16px;
                            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
                            height: 200px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            <i class="fas fa-image" style="font-size: 48px; color: rgba(255,255,255,0.5);"></i>
                        </div>
                    `}

                    <div style="margin-bottom: 24px;">
                        <h3 style="
                            margin: 0 0 8px 0;
                            font-size: 24px;
                            font-weight: 700;
                            color: var(--text-primary);
                        ">${product.name}</h3>
                        <p style="
                            margin: 0;
                            color: var(--text-muted);
                            font-size: 14px;
                        ">Product Reference ID: #${product.id}</p>
                    </div>

                    <div style="
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 16px;
                        margin-bottom: 24px;
                    ">
                        <!-- Category -->
                        <div style="
                            background: var(--bg-secondary);
                            border: 1px solid var(--border-color);
                            border-radius: 14px;
                            padding: 16px;
                            transition: all 0.2s ease;
                        ">
                            <div style="
                                color: var(--text-muted);
                                font-size: 11px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                margin-bottom: 8px;
                            ">Category</div>
                            <div style="
                                font-weight: 600;
                                font-size: 15px;
                                color: var(--text-primary);
                            ">${product.category || '-'}</div>
                        </div>

                        <!-- Quantity -->
                        <div style="
                            background: var(--bg-secondary);
                            border: 1px solid var(--border-color);
                            border-radius: 14px;
                            padding: 16px;
                            transition: all 0.2s ease;
                        ">
                            <div style="
                                color: var(--text-muted);
                                font-size: 11px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                margin-bottom: 8px;
                            ">Quantity</div>
                            <div style="
                                font-weight: 600;
                                font-size: 18px;
                                color: var(--accent-primary);
                            ">${product.quantity || 0} <span style="font-size: 14px; color: var(--text-muted); font-weight: 500;">units</span></div>
                        </div>

                        <!-- Price -->
                        <div style="
                            background: var(--bg-secondary);
                            border: 1px solid var(--border-color);
                            border-radius: 14px;
                            padding: 16px;
                            transition: all 0.2s ease;
                        ">
                            <div style="
                                color: var(--text-muted);
                                font-size: 11px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                margin-bottom: 8px;
                            ">Unit Price</div>
                            <div style="
                                font-weight: 600;
                                font-size: 18px;
                                color: var(--success);
                            ">$${(product.price || 0).toFixed(2)}</div>
                        </div>

                        <!-- Store -->
                        <div style="
                            background: var(--bg-secondary);
                            border: 1px solid var(--border-color);
                            border-radius: 14px;
                            padding: 16px;
                            transition: all 0.2s ease;
                        ">
                            <div style="
                                color: var(--text-muted);
                                font-size: 11px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                margin-bottom: 8px;
                            ">Store Location</div>
                            <div style="
                                font-weight: 600;
                                font-size: 15px;
                                color: var(--text-primary);
                            ">${product.store || '-'}</div>
                        </div>
                    </div>

                    <div style="
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 16px;
                        margin-bottom: 24px;
                    ">
                        <!-- Arrival Date -->
                        <div style="
                            background: var(--bg-secondary);
                            border: 1px solid var(--border-color);
                            border-radius: 14px;
                            padding: 16px;
                        ">
                            <div style="
                                color: var(--text-muted);
                                font-size: 11px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                margin-bottom: 8px;
                            ">
                                <i class="fas fa-calendar" style="margin-right: 6px; font-size: 12px;"></i>Arrival Date
                            </div>
                            <div style="
                                font-weight: 600;
                                font-size: 15px;
                                color: var(--text-primary);
                            ">${product.arrivalDate ? formatDate(product.arrivalDate) : '-'}</div>
                        </div>

                        <!-- Supplier -->
                        <div style="
                            background: var(--bg-secondary);
                            border: 1px solid var(--border-color);
                            border-radius: 14px;
                            padding: 16px;
                        ">
                            <div style="
                                color: var(--text-muted);
                                font-size: 11px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                margin-bottom: 8px;
                            ">
                                <i class="fas fa-truck" style="margin-right: 6px; font-size: 12px;"></i>Supplier
                            </div>
                            <div style="
                                font-weight: 600;
                                font-size: 15px;
                                color: var(--text-primary);
                            ">${product.supplier || '-'}</div>
                        </div>
                    </div>

                    ${product.description ? `
                        <div style="
                            background: var(--bg-secondary);
                            border: 1px solid var(--border-color);
                            border-radius: 14px;
                            padding: 16px;
                            margin-bottom: 24px;
                        ">
                            <div style="
                                color: var(--text-muted);
                                font-size: 11px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                margin-bottom: 12px;
                            ">Description</div>
                            <p style="
                                margin: 0;
                                line-height: 1.6;
                                color: var(--text-secondary);
                                font-size: 14px;
                            ">${product.description}</p>
                        </div>
                    ` : ''}

                    <div style="display: flex; gap: 12px;">
                        <button class="btn-primary" style="
                            flex: 1;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                            padding: 12px 16px;
                            border-radius: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            border: none;
                            transition: all 0.2s ease;
                        " onclick="closeModal(); editProduct('${product.id}');">
                            <i class="fas fa-edit"></i>
                            Edit Product
                        </button>
                        <button style="
                            flex: 1;
                            background: var(--danger);
                            color: white;
                            border: none;
                            padding: 12px 16px;
                            border-radius: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                            transition: all 0.2s ease;
                        " onclick="if(confirm('Are you sure you want to delete this product?')) { deleteProductFromFirebase('${product.id}'); closeModal(); }" onhover="this.style.opacity='0.9'">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            `;

            modal.classList.add('active');
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
                            <option value="Miramar Wine & Liquor" ${selectedStoreFilter === 'Miramar Wine & Liquor' ? 'selected' : ''}>Miramar Wine & Liquor</option>
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

        // Schedules data array
        let schedules = [];
        let currentWeekStart = getWeekStart(new Date());
        let draggedShift = null;

        function getWeekStart(date) {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day;
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
            return date.toISOString().split('T')[0];
        }

        function renderSchedule() {
            const dashboard = document.querySelector('.dashboard');
            const weekDates = getWeekDates(currentWeekStart);
            const weekRangeText = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

            dashboard.innerHTML = `
                <style>
                    .schedule-week-grid {
                        display: grid;
                        grid-template-columns: 180px repeat(7, 1fr);
                        gap: 1px;
                        background: var(--border-color);
                        border-radius: 12px;
                        overflow: hidden;
                    }
                    .schedule-header-cell {
                        background: var(--bg-hover);
                        padding: 12px 8px;
                        text-align: center;
                        font-weight: 600;
                        color: var(--text-primary);
                    }
                    .schedule-header-cell.today {
                        background: var(--primary);
                        color: white;
                    }
                    .schedule-header-cell .day-name {
                        font-size: 11px;
                        text-transform: uppercase;
                        opacity: 0.7;
                    }
                    .schedule-header-cell .day-number {
                        font-size: 18px;
                        margin-top: 2px;
                    }
                    .schedule-employee-cell {
                        background: var(--bg-card);
                        padding: 10px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-weight: 500;
                        border-right: 2px solid var(--border-color);
                    }
                    .schedule-employee-avatar {
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
                    .schedule-employee-info {
                        overflow: hidden;
                    }
                    .schedule-employee-name {
                        font-size: 13px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .schedule-employee-store {
                        font-size: 10px;
                        color: var(--text-muted);
                    }
                    .schedule-day-cell {
                        background: var(--bg-card);
                        min-height: 70px;
                        padding: 6px;
                        position: relative;
                        transition: background 0.2s;
                        cursor: pointer;
                    }
                    .schedule-day-cell:hover {
                        background: var(--bg-hover);
                    }
                    .schedule-day-cell.drag-over {
                        background: rgba(59, 130, 246, 0.1);
                        outline: 2px dashed var(--primary);
                    }
                    .shift-block {
                        background: linear-gradient(135deg, var(--primary), #6366f1);
                        color: white;
                        padding: 6px 8px;
                        border-radius: 6px;
                        font-size: 11px;
                        cursor: grab;
                        margin-bottom: 4px;
                        position: relative;
                        transition: transform 0.15s, box-shadow 0.15s;
                    }
                    .shift-block:hover {
                        transform: scale(1.02);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    }
                    .shift-block:active {
                        cursor: grabbing;
                    }
                    .shift-block.dragging {
                        opacity: 0.5;
                        transform: scale(0.95);
                    }
                    .shift-block .shift-time {
                        font-weight: 600;
                    }
                    .shift-block .shift-hours {
                        font-size: 10px;
                        opacity: 0.8;
                    }
                    .shift-block .shift-delete {
                        position: absolute;
                        top: 2px;
                        right: 4px;
                        opacity: 0;
                        cursor: pointer;
                        font-size: 10px;
                        transition: opacity 0.2s;
                    }
                    .shift-block:hover .shift-delete {
                        opacity: 1;
                    }
                    .add-shift-btn {
                        width: 100%;
                        padding: 4px;
                        border: 1px dashed var(--border-color);
                        border-radius: 4px;
                        background: transparent;
                        color: var(--text-muted);
                        font-size: 11px;
                        cursor: pointer;
                        opacity: 0;
                        transition: opacity 0.2s;
                    }
                    .schedule-day-cell:hover .add-shift-btn {
                        opacity: 1;
                    }
                    .add-shift-btn:hover {
                        background: var(--bg-hover);
                        color: var(--primary);
                        border-color: var(--primary);
                    }
                    .week-nav {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                    }
                    .week-nav-btn {
                        background: var(--bg-hover);
                        border: none;
                        width: 36px;
                        height: 36px;
                        border-radius: 8px;
                        cursor: pointer;
                        color: var(--text-primary);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    }
                    .week-nav-btn:hover {
                        background: var(--primary);
                        color: white;
                    }
                    .week-display {
                        font-size: 16px;
                        font-weight: 600;
                        min-width: 200px;
                        text-align: center;
                    }
                    .schedule-filters {
                        display: flex;
                        gap: 10px;
                        align-items: center;
                    }
                    .employee-sidebar {
                        background: var(--bg-card);
                        border-radius: 12px;
                        padding: 15px;
                        margin-bottom: 20px;
                    }
                    .employee-sidebar h4 {
                        margin-bottom: 10px;
                        font-size: 12px;
                        text-transform: uppercase;
                        color: var(--text-muted);
                    }
                    .draggable-employee {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 8px 10px;
                        background: var(--bg-hover);
                        border-radius: 8px;
                        margin-bottom: 6px;
                        cursor: grab;
                        transition: all 0.2s;
                    }
                    .draggable-employee:hover {
                        background: var(--primary);
                        color: white;
                    }
                    .draggable-employee:active {
                        cursor: grabbing;
                    }
                    .total-hours {
                        font-size: 11px;
                        color: var(--text-muted);
                        text-align: right;
                        padding: 4px 8px;
                    }
                </style>

                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Schedule</h2>
                        <p class="section-subtitle">Drag & drop to assign shifts</p>
                    </div>
                    <div class="page-header-right" style="display: flex; gap: 15px; align-items: center;">
                        <div class="week-nav">
                            <button class="week-nav-btn" onclick="changeWeek(-1)">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <div class="week-display">${weekRangeText}</div>
                            <button class="week-nav-btn" onclick="changeWeek(1)">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                            <button class="week-nav-btn" onclick="goToToday()" title="Today">
                                <i class="fas fa-calendar-day"></i>
                            </button>
                        </div>
                        <select class="form-input" id="schedule-store-filter" onchange="renderScheduleGrid()" style="width: 150px;">
                            <option value="all">All Stores</option>
                            <option value="Miramar">VSU Miramar</option>
                            <option value="Morena">VSU Morena</option>
                            <option value="Kearny Mesa">VSU Kearny Mesa</option>
                            <option value="Chula Vista">VSU Chula Vista</option>
                            <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                        </select>
                    </div>
                </div>

                <div id="schedule-container" class="card" style="padding: 15px;">
                    <div style="padding: 40px; text-align: center;">
                        <div class="loading-spinner"></div>
                        <p style="color: var(--text-muted); margin-top: 15px;">Loading schedules...</p>
                    </div>
                </div>
            `;
            loadScheduleData();
        }

        async function loadScheduleData() {
            const container = document.getElementById('schedule-container');
            if (!container) return;

            try {
                // Make sure employees are loaded first
                if (employees.length === 0) {
                    console.log('Loading employees for schedule...');
                    await loadEmployeesFromFirebase();
                }

                const db = firebase.firestore();
                const schedulesRef = db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules');
                const snapshot = await schedulesRef.get();

                schedules = [];
                snapshot.forEach(doc => {
                    schedules.push({ id: doc.id, ...doc.data() });
                });

                console.log('Loaded schedules from Firestore:', schedules.length);
                console.log('Employees available:', employees.length);
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
            const weekDates = getWeekDates(currentWeekStart);
            const today = formatDateKey(new Date());

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

            // Build grid HTML
            let gridHTML = '<div class="schedule-week-grid">';

            // Header row
            gridHTML += '<div class="schedule-header-cell" style="background: var(--bg-card);"><i class="fas fa-users"></i> Team</div>';
            weekDates.forEach(date => {
                const dateKey = formatDateKey(date);
                const isToday = dateKey === today;
                gridHTML += `
                    <div class="schedule-header-cell ${isToday ? 'today' : ''}">
                        <div class="day-name">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div class="day-number">${date.getDate()}</div>
                    </div>
                `;
            });

            // Employee rows
            filteredEmployees.forEach(emp => {
                const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
                const colorIndex = emp.name ? emp.name.charCodeAt(0) % colors.length : 0;
                const initials = emp.name ? emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

                // Employee cell
                gridHTML += `
                    <div class="schedule-employee-cell">
                        <div class="schedule-employee-avatar" style="background: ${colors[colorIndex]};">${initials}</div>
                        <div class="schedule-employee-info">
                            <div class="schedule-employee-name">${emp.name || 'Unknown'}</div>
                            <div class="schedule-employee-store">${emp.store || ''}</div>
                        </div>
                    </div>
                `;

                // Day cells for this employee
                let weekTotalHours = 0;
                weekDates.forEach(date => {
                    const dateKey = formatDateKey(date);
                    const daySchedules = schedules.filter(s => s.employeeId === emp.id && s.date === dateKey);

                    gridHTML += `
                        <div class="schedule-day-cell"
                             data-employee-id="${emp.id}"
                             data-date="${dateKey}"
                             ondragover="handleDragOver(event)"
                             ondragleave="handleDragLeave(event)"
                             ondrop="handleDrop(event)">
                    `;

                    daySchedules.forEach(schedule => {
                        const hours = calculateHours(schedule.startTime, schedule.endTime);
                        weekTotalHours += parseFloat(hours);
                        gridHTML += `
                            <div class="shift-block"
                                 draggable="true"
                                 data-schedule-id="${schedule.id}"
                                 ondragstart="handleDragStart(event, '${schedule.id}')"
                                 ondragend="handleDragEnd(event)"
                                 onclick="openModal('edit-schedule', '${schedule.id}')">
                                <div class="shift-time">${formatTimeShort(schedule.startTime)} - ${formatTimeShort(schedule.endTime)}</div>
                                <div class="shift-hours">${hours}h</div>
                                <span class="shift-delete" onclick="event.stopPropagation(); deleteSchedule('${schedule.id}')">
                                    <i class="fas fa-times"></i>
                                </span>
                            </div>
                        `;
                    });

                    gridHTML += `
                            <button class="add-shift-btn" onclick="quickAddShift('${emp.id}', '${dateKey}', '${emp.store}')">
                                <i class="fas fa-plus"></i> Add
                            </button>
                        </div>
                    `;
                });
            });

            gridHTML += '</div>';

            container.innerHTML = gridHTML;
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
            const [hours, minutes] = time.split(':');
            const h = parseInt(hours);
            const ampm = h >= 12 ? 'p' : 'a';
            const h12 = h % 12 || 12;
            return `${h12}:${minutes}${ampm}`;
        }

        function calculateHours(startTime, endTime) {
            if (!startTime || !endTime) return 0;
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            const diff = endMinutes - startMinutes;
            return (diff / 60).toFixed(1);
        }

        function formatTime(time) {
            if (!time) return '--';
            const [hours, minutes] = time.split(':');
            const h = parseInt(hours);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${minutes} ${ampm}`;
        }

        // Drag and Drop handlers
        function handleDragStart(event, scheduleId) {
            draggedShift = scheduleId;
            event.target.classList.add('dragging');
            event.dataTransfer.effectAllowed = 'move';
        }

        function handleDragEnd(event) {
            event.target.classList.remove('dragging');
            document.querySelectorAll('.schedule-day-cell').forEach(cell => {
                cell.classList.remove('drag-over');
            });
        }

        function handleDragOver(event) {
            event.preventDefault();
            event.currentTarget.classList.add('drag-over');
        }

        function handleDragLeave(event) {
            event.currentTarget.classList.remove('drag-over');
        }

        async function handleDrop(event) {
            event.preventDefault();
            event.currentTarget.classList.remove('drag-over');

            if (!draggedShift) return;

            const newEmployeeId = event.currentTarget.dataset.employeeId;
            const newDate = event.currentTarget.dataset.date;
            const schedule = schedules.find(s => s.id === draggedShift);

            if (!schedule) return;

            // Update in Firestore
            try {
                const db = firebase.firestore();
                const emp = employees.find(e => e.id === newEmployeeId);

                await db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules').doc(draggedShift).update({
                    employeeId: newEmployeeId,
                    employeeName: emp ? emp.name : '',
                    date: newDate,
                    updatedAt: new Date().toISOString()
                });

                // Update local data
                schedule.employeeId = newEmployeeId;
                schedule.employeeName = emp ? emp.name : '';
                schedule.date = newDate;

                showNotification('Shift moved successfully!', 'success');
                renderScheduleGrid();
            } catch (error) {
                console.error('Error moving shift:', error);
                showNotification('Error moving shift', 'error');
            }

            draggedShift = null;
        }

        function quickAddShift(employeeId, date, store) {
            const emp = employees.find(e => e.id === employeeId);
            openModal('quick-add-schedule', { employeeId, date, store, employeeName: emp?.name });
        }

        function setShiftPreset(startTime, endTime) {
            document.getElementById('schedule-start').value = startTime;
            document.getElementById('schedule-end').value = endTime;
            // Highlight selected preset
            document.querySelectorAll('.shift-preset-btn').forEach(btn => {
                btn.style.borderColor = 'var(--border-color)';
                btn.style.background = 'var(--bg-card)';
            });
            event.currentTarget.style.borderColor = 'var(--primary)';
            event.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
        }

        async function saveSchedule(isQuick = false) {
            const employeeId = document.getElementById('schedule-employee')?.value;
            const store = document.getElementById('schedule-store')?.value;
            const date = document.getElementById('schedule-date')?.value;
            const startTime = document.getElementById('schedule-start')?.value;
            const endTime = document.getElementById('schedule-end')?.value;

            console.log('Saving schedule:', { employeeId, store, date, startTime, endTime });

            if (!employeeId || !store || !date || !startTime || !endTime) {
                showNotification('Please fill in all fields', 'error');
                console.log('Missing fields:', { employeeId: !employeeId, store: !store, date: !date, startTime: !startTime, endTime: !endTime });
                return;
            }

            const emp = employees.find(e => e.id === employeeId || e.firestoreId === employeeId);
            console.log('Found employee:', emp);

            const scheduleData = {
                employeeId,
                employeeName: emp ? emp.name : '',
                store,
                date,
                startTime,
                endTime,
                createdAt: new Date().toISOString(),
                createdBy: currentUser?.name || 'Unknown'
            };

            console.log('Schedule data to save:', scheduleData);

            try {
                const db = firebase.firestore();
                const docRef = await db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules').add(scheduleData);
                console.log('Schedule saved with ID:', docRef.id);

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

                showNotification('Shift updated!', 'success');
                closeModal();
                loadScheduleData();
            } catch (error) {
                console.error('Error updating schedule:', error);
                showNotification('Error updating schedule', 'error');
            }
        }

        async function deleteSchedule(scheduleId) {
            if (!confirm('Delete this shift?')) return;

            try {
                const db = firebase.firestore();
                await db.collection(window.FIREBASE_COLLECTIONS.schedules || 'schedules').doc(scheduleId).delete();

                showNotification('Shift deleted!', 'success');
                loadScheduleData();
            } catch (error) {
                console.error('Error deleting schedule:', error);
                showNotification('Error deleting schedule', 'error');
            }
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

        /**
         * Initialize Firebase and load thieves from Firestore
         */
        async function initializeFirebaseThieves() {
            console.log('Initializing Firebase for thieves database...');

            const initialized = await firebaseThievesManager.initialize();

            if (initialized) {
                try {
                    const firestoreThieves = await firebaseThievesManager.loadThieves();

                    if (firestoreThieves && firestoreThieves.length > 0) {
                        console.log('Loaded thieves from Firestore:', firestoreThieves);
                        thieves = firestoreThieves;
                        console.log(`Successfully loaded ${thieves.length} thief records from Firestore`);
                        return true;
                    } else {
                        console.log('No thieves found in Firestore, using fallback data');
                    }
                } catch (error) {
                    console.error('Error loading thieves from Firestore:', error);
                }
            } else {
                console.warn('Firebase not available for thieves. Using fallback data.');
            }

            return false;
        }

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
                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
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

            modal.style.display = 'flex';
        }

        async function deleteThief(id) {
            if (confirm('Are you sure you want to delete this record?')) {
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

            // Get photo - use new one if uploaded, otherwise keep current
            let photo = currentThief.photo;
            const photoImg = document.getElementById('edit-thief-photo-img');
            if (photoInput.files && photoInput.files.length > 0 && photoImg && photoImg.src) {
                photo = photoImg.src;
            }

            const updatedData = {
                name: name,
                photo: photo,
                date: date,
                store: store,
                crimeType: crimeType,
                itemsStolen: items,
                estimatedValue: value ? parseFloat(value) : currentThief.estimatedValue,
                description: description,
                policeReport: policeReport || currentThief.policeReport || null,
                banned: status === 'banned'
            };

            // Show saving indicator
            const saveBtn = document.querySelector('.modal-footer .btn-primary');
            const originalText = saveBtn ? saveBtn.innerHTML : '';
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                saveBtn.disabled = true;
            }

            try {
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

            // Get photo as base64 if uploaded
            let photo = null;
            const photoImg = document.getElementById('thief-photo-img');
            if (photoImg && photoImg.src && photoInput.files.length > 0) {
                photo = photoImg.src;
            }

            // Create thief data object
            const thiefData = {
                name: name,
                photo: photo,
                date: date,
                store: store,
                crimeType: crimeType,
                itemsStolen: items,
                estimatedValue: parseFloat(value),
                description: description,
                policeReport: policeReport || null,
                banned: status === 'banned'
            };

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

        async function renderInvoices() {
            const dashboard = document.querySelector('.dashboard');

            // Load invoices from Firebase if available
            await loadInvoicesFromFirebase();

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
                    <div class="stat-card" style="background: linear-gradient(135deg, var(--warning) 0%, #f59e0b 100%); color: #fff;">
                        <div class="stat-icon" style="color: #fff;"><i class="fas fa-clock"></i></div>
                        <div class="stat-content">
                            <div class="stat-label" style="color: rgba(255,255,255,0.8);">Pending</div>
                            <div class="stat-value" style="color: #fff;">$${totalPending.toFixed(2)}</div>
                        </div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, var(--error) 0%, #dc2626 100%); color: #000;">
                        <div class="stat-icon" style="color: #000;"><i class="fas fa-exclamation-circle"></i></div>
                        <div class="stat-content">
                            <div class="stat-label" style="color: rgba(0,0,0,0.7);">Overdue</div>
                            <div class="stat-value" style="color: #000;">$${totalOverdue.toFixed(2)}</div>
                        </div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, var(--success) 0%, #10b981 100%); color: #fff;">
                        <div class="stat-icon" style="color: #fff;"><i class="fas fa-check-circle"></i></div>
                        <div class="stat-content">
                            <div class="stat-label" style="color: rgba(255,255,255,0.8);">Paid This Month</div>
                            <div class="stat-value" style="color: #fff;">$${totalPaid.toFixed(2)}</div>
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
                                    <th style="width: 60px;">Photo</th>
                                    <th>Invoice #</th>
                                    <th>Vendor</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th style="width: 120px;">Actions</th>
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
                        <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
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
                    overdue: 'background: var(--error); color: #fff;'
                };

                const invoiceId = invoice.firestoreId || invoice.id;

                return `
                    <tr>
                        <td>
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
                        <td><strong>${invoice.invoiceNumber}</strong></td>
                        <td>${invoice.vendor}</td>
                        <td>
                            <span class="badge" style="background: var(--accent-primary); color: #fff;">${invoice.category}</span>
                        </td>
                        <td>${invoice.description}</td>
                        <td style="font-weight: 600;">$${invoice.amount.toFixed(2)}</td>
                        <td>${formatDate(invoice.dueDate)}</td>
                        <td>
                            <span class="badge" style="${statusStyles[invoice.status]}">${invoice.status.toUpperCase()}</span>
                            ${invoice.recurring ? '<i class="fas fa-sync-alt" style="margin-left: 8px; color: var(--text-muted);" title="Recurring"></i>' : ''}
                        </td>
                        <td>
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
                                            <div style="width: 100%; height: 450px; position: relative;">
                                                <embed src="${invoice.photo}" type="application/pdf" style="width: 100%; height: 100%;" />
                                                <div id="pdf-fallback-${invoiceId}" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: var(--bg-secondary); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center;">
                                                    <i class="fas fa-file-pdf" style="font-size: 64px; color: #ef4444; margin-bottom: 16px;"></i>
                                                    <p style="margin-bottom: 16px; color: var(--text-secondary);">PDF preview not available in this browser.</p>
                                                    <button class="btn-primary" onclick="openPdfInNewTab('${invoice.photo.replace(/'/g, "\\'")}')">
                                                        <i class="fas fa-external-link-alt"></i> Open PDF
                                                    </button>
                                                </div>
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

                    ${invoice.status !== 'paid' ? `
                        <button class="btn-primary" style="width: 100%;" onclick="markInvoicePaid('${invoiceId}'); closeModal();">
                            <i class="fas fa-check"></i>
                            Mark as Paid
                        </button>
                    ` : ''}
                </div>
            `;

            modal.style.display = 'flex';
            modal.classList.add('active');

            // Reset zoom level for new invoice
            invoiceZoomLevel = 1;
        }

        async function deleteInvoice(id) {
            if (confirm('Are you sure you want to delete this invoice?')) {
                const numericId = !isNaN(id) ? parseInt(id, 10) : id;
                // Delete from Firebase
                if (typeof firebaseInvoiceManager !== 'undefined' && firebaseInvoiceManager.isInitialized) {
                    const success = await firebaseInvoiceManager.deleteInvoice(id);
                    if (success) {
                        // Update local state
                        invoices = invoices.filter(i => i.id !== id && i.id !== numericId && i.firestoreId !== id);
                        renderInvoices();
                    } else {
                        alert('Error deleting invoice');
                    }
                } else {
                    // Fallback to local only
                    invoices = invoices.filter(i => i.id !== id && i.id !== numericId && i.firestoreId !== id);
                    renderInvoices();
                }
            }
        }

        async function saveInvoice() {
            const invoiceNumber = document.getElementById('invoice-number').value.trim();
            const vendor = document.getElementById('invoice-vendor').value.trim();
            const category = document.getElementById('invoice-category').value;
            const amount = document.getElementById('invoice-amount').value;
            const description = document.getElementById('invoice-description').value.trim();
            const dueDate = document.getElementById('invoice-due-date').value;
            const status = document.getElementById('invoice-status').value;
            const recurring = document.getElementById('invoice-recurring').checked;
            const notes = document.getElementById('invoice-notes').value.trim();

            // Validate required fields
            if (!invoiceNumber || !vendor || !amount) {
                alert('Please fill in all required fields (Invoice #, Vendor, Amount)');
                return;
            }

            // Get file if uploaded (Base64 encoding for both images and PDFs)
            const fileInput = document.getElementById('invoice-photo');
            let fileData = null;
            let fileType = null;
            let fileName = null;

            if (fileInput && fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];

                // Validate file size (max 1MB for Firestore)
                if (file.size > 1024 * 1024) {
                    alert('File is too large. Please use a file smaller than 1MB.');
                    return;
                }

                // Determine file type
                const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                fileType = isPdf ? 'pdf' : 'image';
                fileName = file.name;

                // Convert to Base64
                fileData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = (e) => reject(e);
                    reader.readAsDataURL(file);
                });
            }

            await createInvoiceRecord(invoiceNumber, vendor, category, amount, description, dueDate, status, recurring, notes, fileData, fileType, fileName);
        }

        async function createInvoiceRecord(invoiceNumber, vendor, category, amount, description, dueDate, status, recurring, notes, photo, fileType = null, fileName = null) {
            // Create invoice data object
            const invoiceData = {
                invoiceNumber: invoiceNumber || '',
                vendor: vendor || '',
                category: category || '',
                description: description || '',
                amount: parseFloat(amount) || 0,
                dueDate: dueDate || '',
                paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : null,
                status: status || 'pending',
                recurring: recurring,
                notes: notes || '',
                photo: photo,
                fileType: fileType,  // 'pdf' or 'image' or null
                fileName: fileName   // Original filename for PDFs
            };

            // Save to Firebase
            if (typeof firebaseInvoiceManager !== 'undefined' && firebaseInvoiceManager.isInitialized) {
                const docId = await firebaseInvoiceManager.addInvoice(invoiceData);
                if (docId) {
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

                // Validate file size (max 1MB for Firestore)
                if (file.size > 1024 * 1024) {
                    alert('File is too large. Please use a file smaller than 1MB.');
                    input.value = '';
                    return;
                }

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

        // Open PDF in a new browser tab
        function openPdfInNewTab(base64Data) {
            // Create a blob from the base64 data
            try {
                const byteCharacters = atob(base64Data.split(',')[1]);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
            } catch (error) {
                console.error('Error opening PDF:', error);
                // Fallback to direct base64 URL
                window.open(base64Data, '_blank');
            }
        }

        // Download PDF file
        function downloadPdf(base64Data, fileName) {
            try {
                const byteCharacters = atob(base64Data.split(',')[1]);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });

                // Create download link
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = fileName || 'invoice.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            } catch (error) {
                console.error('Error downloading PDF:', error);
                alert('Error downloading PDF. Please try the "Open in Tab" option instead.');
            }
        }

        // Invoice Image Zoom Controls
        let invoiceZoomLevel = 1;
        let isImageDragging = false;
        let imageDragStartX = 0;
        let imageDragStartY = 0;
        let imageTranslateX = 0;
        let imageTranslateY = 0;
        let imageStartTranslateX = 0;
        let imageStartTranslateY = 0;

        function zoomInvoiceImage(delta) {
            const img = document.getElementById('invoice-zoom-image');
            const zoomDisplay = document.getElementById('invoice-zoom-level');

            if (!img) return;

            // Calculate new zoom level (min 0.5, max 4)
            const newZoom = Math.max(0.5, Math.min(4, invoiceZoomLevel + delta));

            // If zooming out to 1 or less, reset position
            if (newZoom <= 1) {
                imageTranslateX = 0;
                imageTranslateY = 0;
            }

            invoiceZoomLevel = newZoom;

            // Apply zoom with transform
            img.style.transform = `scale(${invoiceZoomLevel}) translate(${imageTranslateX}px, ${imageTranslateY}px)`;

            // Update display
            if (zoomDisplay) {
                zoomDisplay.textContent = `${Math.round(invoiceZoomLevel * 100)}%`;
            }

            // Update cursor based on zoom level
            img.style.cursor = invoiceZoomLevel > 1 ? 'grab' : 'default';
        }

        function resetInvoiceZoom() {
            const img = document.getElementById('invoice-zoom-image');
            const zoomDisplay = document.getElementById('invoice-zoom-level');

            if (!img) return;

            invoiceZoomLevel = 1;
            imageTranslateX = 0;
            imageTranslateY = 0;
            img.style.transform = 'scale(1) translate(0px, 0px)';
            img.style.cursor = 'default';

            if (zoomDisplay) {
                zoomDisplay.textContent = '100%';
            }
        }

        function startImageDrag(event) {
            const img = document.getElementById('invoice-zoom-image');
            if (!img || invoiceZoomLevel <= 1) return;

            isImageDragging = true;
            img.style.cursor = 'grabbing';
            img.style.transition = 'none'; // Disable transition during drag for smooth movement
            imageDragStartX = event.clientX;
            imageDragStartY = event.clientY;
            imageStartTranslateX = imageTranslateX;
            imageStartTranslateY = imageTranslateY;
            event.preventDefault();

            // Add document-level listeners so dragging continues even outside the image
            document.addEventListener('mousemove', dragImage);
            document.addEventListener('mouseup', stopImageDrag);
        }

        function dragImage(event) {
            if (!isImageDragging) return;

            const img = document.getElementById('invoice-zoom-image');
            if (!img) return;

            // Calculate delta and apply to translate (divide by zoom to keep movement proportional)
            const deltaX = (event.clientX - imageDragStartX) / invoiceZoomLevel;
            const deltaY = (event.clientY - imageDragStartY) / invoiceZoomLevel;

            imageTranslateX = imageStartTranslateX + deltaX;
            imageTranslateY = imageStartTranslateY + deltaY;

            img.style.transform = `scale(${invoiceZoomLevel}) translate(${imageTranslateX}px, ${imageTranslateY}px)`;
        }

        function stopImageDrag() {
            const img = document.getElementById('invoice-zoom-image');
            if (img) {
                img.style.cursor = invoiceZoomLevel > 1 ? 'grab' : 'default';
                img.style.transition = 'transform 0.15s ease'; // Re-enable smooth transition
            }
            isImageDragging = false;

            // Remove document-level listeners
            document.removeEventListener('mousemove', dragImage);
            document.removeEventListener('mouseup', stopImageDrag);
        }

        function openInvoiceImageFullSize() {
            const img = document.getElementById('invoice-zoom-image');
            if (!img || !img.src) return;

            const base64Data = img.src;

            // Check if it's a base64 image
            if (base64Data.startsWith('data:image')) {
                // Convert base64 to blob and open in new tab
                try {
                    const parts = base64Data.split(',');
                    const mimeMatch = parts[0].match(/:(.*?);/);
                    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
                    const byteString = atob(parts[1]);
                    const byteNumbers = new Array(byteString.length);

                    for (let i = 0; i < byteString.length; i++) {
                        byteNumbers[i] = byteString.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: mimeType });
                    const blobUrl = URL.createObjectURL(blob);

                    // Open in new tab
                    const newTab = window.open(blobUrl, '_blank');

                    // Clean up blob URL after a delay
                    if (newTab) {
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
                    }
                } catch (error) {
                    console.error('Error opening image:', error);
                    // Fallback: try opening directly
                    window.open(base64Data, '_blank');
                }
            } else {
                // It's a regular URL, just open it
                window.open(base64Data, '_blank');
            }
        }

        function editInvoice(id) {
            const numericId = !isNaN(id) ? parseInt(id, 10) : id;
            const invoice = invoices.find(i => i.id === id || i.id === numericId || i.firestoreId === id);
            if (!invoice) return;

            const invoiceId = invoice.firestoreId || invoice.id;
            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2>Edit Invoice</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <form id="edit-invoice-form" onsubmit="event.preventDefault(); saveInvoiceChanges('${invoiceId}');">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Invoice Number *</label>
                                <input type="text" class="form-input" id="edit-invoice-number" value="${invoice.invoiceNumber || ''}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Vendor *</label>
                                <input type="text" class="form-input" id="edit-invoice-vendor" value="${invoice.vendor || ''}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Category</label>
                                <select class="form-input" id="edit-invoice-category">
                                    <option value="utilities" ${invoice.category === 'utilities' ? 'selected' : ''}>Utilities</option>
                                    <option value="rent" ${invoice.category === 'rent' ? 'selected' : ''}>Rent</option>
                                    <option value="supplies" ${invoice.category === 'supplies' ? 'selected' : ''}>Supplies</option>
                                    <option value="inventory" ${invoice.category === 'inventory' ? 'selected' : ''}>Inventory</option>
                                    <option value="services" ${invoice.category === 'services' ? 'selected' : ''}>Services</option>
                                    <option value="equipment" ${invoice.category === 'equipment' ? 'selected' : ''}>Equipment</option>
                                    <option value="other" ${invoice.category === 'other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Amount *</label>
                                <input type="number" step="0.01" class="form-input" id="edit-invoice-amount" value="${invoice.amount || ''}" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <input type="text" class="form-input" id="edit-invoice-description" value="${invoice.description || ''}">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Due Date</label>
                                <input type="date" class="form-input" id="edit-invoice-due-date" value="${invoice.dueDate || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Status</label>
                                <select class="form-input" id="edit-invoice-status">
                                    <option value="pending" ${invoice.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="overdue" ${invoice.status === 'overdue' ? 'selected' : ''}>Overdue</option>
                                    <option value="paid" ${invoice.status === 'paid' ? 'selected' : ''}>Paid</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <input type="checkbox" id="edit-invoice-recurring" ${invoice.recurring ? 'checked' : ''}>
                                Recurring Invoice
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea class="form-input" id="edit-invoice-notes" rows="3">${invoice.notes || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Invoice File (Photo or PDF)</label>
                            ${invoice.photo ? `
                                <div id="edit-invoice-current-file" style="margin-bottom: 10px;">
                                    ${invoice.fileType === 'pdf' ? `
                                        <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px; display: flex; align-items: center; gap: 12px;">
                                            <i class="fas fa-file-pdf" style="font-size: 32px; color: #ef4444;"></i>
                                            <div>
                                                <div style="font-weight: 500;">${invoice.fileName || 'Invoice.pdf'}</div>
                                                <p style="font-size: 12px; color: var(--text-muted); margin: 4px 0 0 0;">Current PDF (upload new to replace)</p>
                                            </div>
                                        </div>
                                    ` : `
                                        <img src="${invoice.photo}" alt="Current Invoice Photo" style="max-width: 200px; max-height: 150px; border-radius: 8px; object-fit: contain;">
                                        <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Current photo (upload new to replace)</p>
                                    `}
                                </div>
                            ` : ''}
                            <input type="file" class="form-input" id="edit-invoice-photo" accept="image/*,.pdf,application/pdf" onchange="previewEditInvoiceFile(this)">
                            <div id="edit-invoice-photo-preview" style="margin-top: 10px; display: none;">
                                <img id="edit-invoice-photo-img" src="" alt="New Photo Preview" style="max-width: 200px; max-height: 150px; border-radius: 8px; object-fit: contain;">
                                <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">New photo preview</p>
                            </div>
                            <div id="edit-invoice-pdf-preview" style="margin-top: 10px; display: none;">
                                <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px; display: flex; align-items: center; gap: 12px;">
                                    <i class="fas fa-file-pdf" style="font-size: 32px; color: #ef4444;"></i>
                                    <div>
                                        <div id="edit-invoice-pdf-name" style="font-weight: 500;"></div>
                                        <div id="edit-invoice-pdf-size" style="font-size: 12px; color: var(--text-muted);"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-actions" style="margin-top: 24px;">
                            <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save"></i>
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            `;

            modal.style.display = 'flex';
            modal.classList.add('active');
        }

        function previewEditInvoiceFile(input) {
            const photoPreview = document.getElementById('edit-invoice-photo-preview');
            const pdfPreview = document.getElementById('edit-invoice-pdf-preview');
            const img = document.getElementById('edit-invoice-photo-img');
            const pdfName = document.getElementById('edit-invoice-pdf-name');
            const pdfSize = document.getElementById('edit-invoice-pdf-size');

            // Hide both previews initially
            if (photoPreview) photoPreview.style.display = 'none';
            if (pdfPreview) pdfPreview.style.display = 'none';

            if (input.files && input.files[0]) {
                const file = input.files[0];

                // Validate file size (max 1MB for Firestore)
                if (file.size > 1024 * 1024) {
                    alert('File is too large. Please use a file smaller than 1MB.');
                    input.value = '';
                    return;
                }

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

        // Keep old function name for backwards compatibility
        function previewEditInvoicePhoto(input) {
            previewEditInvoiceFile(input);
        }

        async function saveInvoiceChanges(invoiceId) {
            const invoiceNumber = document.getElementById('edit-invoice-number').value.trim();
            const vendor = document.getElementById('edit-invoice-vendor').value.trim();
            const category = document.getElementById('edit-invoice-category').value;
            const amount = document.getElementById('edit-invoice-amount').value;
            const description = document.getElementById('edit-invoice-description').value.trim();
            const dueDate = document.getElementById('edit-invoice-due-date').value;
            const status = document.getElementById('edit-invoice-status').value;
            const recurring = document.getElementById('edit-invoice-recurring').checked;
            const notes = document.getElementById('edit-invoice-notes').value.trim();

            // Validate required fields
            if (!invoiceNumber || !vendor || !amount) {
                alert('Please fill in all required fields (Invoice #, Vendor, Amount)');
                return;
            }

            // Find the invoice to get current file data
            const numericId = !isNaN(invoiceId) ? parseInt(invoiceId, 10) : invoiceId;
            const invoice = invoices.find(i => i.id === invoiceId || i.id === numericId || i.firestoreId === invoiceId);

            // Get new file if uploaded (Base64 encoding for both images and PDFs)
            const fileInput = document.getElementById('edit-invoice-photo');
            let fileData = invoice ? invoice.photo : null; // Keep existing file by default
            let fileType = invoice ? invoice.fileType : null;
            let fileName = invoice ? invoice.fileName : null;

            if (fileInput && fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];

                // Validate file size (max 1MB for Firestore)
                if (file.size > 1024 * 1024) {
                    alert('File is too large. Please use a file smaller than 1MB.');
                    return;
                }

                // Determine file type
                const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                fileType = isPdf ? 'pdf' : 'image';
                fileName = file.name;

                // Convert to Base64
                fileData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = (e) => reject(e);
                    reader.readAsDataURL(file);
                });
            }

            // Create update data object
            const updateData = {
                invoiceNumber: invoiceNumber || '',
                vendor: vendor || '',
                category: category || '',
                description: description || '',
                amount: parseFloat(amount) || 0,
                dueDate: dueDate || '',
                paidDate: status === 'paid' ? (invoice && invoice.paidDate ? invoice.paidDate : new Date().toISOString().split('T')[0]) : null,
                status: status || 'pending',
                recurring: recurring,
                notes: notes || '',
                photo: fileData,
                fileType: fileType,
                fileName: fileName
            };

            // Update in Firebase
            if (typeof firebaseInvoiceManager !== 'undefined' && firebaseInvoiceManager.isInitialized) {
                const success = await firebaseInvoiceManager.updateInvoice(invoiceId, updateData);
                if (success) {
                    // Update local state
                    const idx = invoices.findIndex(i => i.id === invoiceId || i.firestoreId === invoiceId);
                    if (idx !== -1) {
                        invoices[idx] = { ...invoices[idx], ...updateData };
                    }
                    closeModal();
                    renderInvoices();
                } else {
                    alert('Error updating invoice');
                }
            } else {
                // Fallback to local only
                const idx = invoices.findIndex(i => i.id === invoiceId || i.firestoreId === invoiceId);
                if (idx !== -1) {
                    invoices[idx] = { ...invoices[idx], ...updateData };
                }
                closeModal();
                renderInvoices();
            }
        }

        // Load invoices from Firebase
        async function loadInvoicesFromFirebase() {
            try {
                if (typeof firebaseInvoiceManager === 'undefined') {
                    console.log('Firebase Invoice Manager not available');
                    return;
                }

                if (!firebaseInvoiceManager.isInitialized) {
                    await firebaseInvoiceManager.initialize();
                }

                const firebaseInvoices = await firebaseInvoiceManager.loadInvoices();

                if (firebaseInvoices.length > 0) {
                    // Replace local invoices with Firebase data
                    invoices = firebaseInvoices;
                    console.log('Loaded', firebaseInvoices.length, 'invoices from Firebase');
                }
            } catch (error) {
                console.error('Error loading invoices from Firebase:', error);
            }
        }

        // Treasury Functions
        async function loadTreasuryItemsFromFirebase() {
            try {
                console.log('🔄 Loading treasury from Firebase...');
                if (typeof firebase === 'undefined' || !firebase.firestore) {
                    console.warn('⚠️ Firebase not available for treasury');
                    return false;
                }

                const db = firebase.firestore();
                const treasuryCollection = window.FIREBASE_COLLECTIONS?.treasury || 'treasury';
                
                const snapshot = await db.collection(treasuryCollection).get();
                const items = [];
                
                snapshot.forEach(doc => {
                    items.push({
                        id: items.length > 0 ? Math.max(...items.map(i => i.id || 0)) + 1 : 1,
                        firestoreId: doc.id,
                        ...doc.data()
                    });
                });

                treasuryItems = items;
                console.log('✅ Loaded treasury items from Firebase:', treasuryItems.length);
                return true;
            } catch (error) {
                console.error('❌ Error loading treasury items from Firebase:', error);
                return false;
            }
        }

        function renderTreasury() {
            console.log('🚀 renderTreasury called');
            // Load from Firebase first
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                loadTreasuryItemsFromFirebase().then(() => {
                    console.log('📊 Firebase load complete, rendering content');
                    renderTreasuryContent();
                }).catch(error => {
                    console.error('❌ Error in renderTreasury:', error);
                    renderTreasuryContent(); // Still render even if Firebase fails
                });
            } else {
                console.warn('⚠️ Firebase not initialized, rendering with local data');
                // If Firebase not available, just render with existing data
                renderTreasuryContent();
            }
        }

        function renderTreasuryContent() {
            console.log('📝 renderTreasuryContent called with', treasuryItems.length, 'items');
            const dashboard = document.querySelector('.dashboard');
            
            if (!dashboard) {
                console.error('❌ Dashboard element not found!');
                return;
            }

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
                                    <th>Artist</th>
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

                const itemValue = parseFloat(item.value) || 0;
                const itemName = item.artworkName || 'Unknown';
                const itemArtist = item.artist || '-';
                const itemDate = item.acquisitionDate || '-';
                const itemLocation = item.location || 'Unknown';

                return `
                    <tr>
                        <td>
                            <div style="width: 60px; height: 60px; border-radius: 8px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                ${photoDisplay}
                            </div>
                        </td>
                        <td><strong>${itemName}</strong></td>
                        <td>${itemArtist}</td>
                        <td>${formatDate(itemDate)}</td>
                        <td style="font-weight: 600; color: var(--success);">$${itemValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td>
                            <span class="badge" style="background: var(--accent-primary);">${itemLocation}</span>
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
                                    <div style="font-weight: 500;">${item.artist || 'Unknown'}</div>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Acquisition Date</label>
                                    <div>${formatDate(item.acquisitionDate) || '-'}</div>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Estimated Value</label>
                                    <div style="font-weight: 600; color: var(--success); font-size: 18px;">$${(parseFloat(item.value) || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Current Location</label>
                                    <div><span class="badge" style="background: var(--accent-primary);">${item.location || 'Unknown'}</span></div>
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

        async function deleteTreasuryItem(id) {
            if (confirm('Are you sure you want to delete this piece from the collection?')) {
                try {
                    // Find the item to get firestoreId
                    const item = treasuryItems.find(t => t.id === id);
                    
                    // Delete from Firebase if firestoreId exists
                    if (item && item.firestoreId && typeof firebase !== 'undefined' && firebase.firestore) {
                        const db = firebase.firestore();
                        const treasuryCollection = window.FIREBASE_COLLECTIONS?.treasury || 'treasury';
                        await db.collection(treasuryCollection).doc(item.firestoreId).delete();
                        console.log('✅ Treasury item deleted from Firebase');
                    }

                    // Remove from local array
                    treasuryItems = treasuryItems.filter(t => t.id !== id);
                    
                    await loadTreasuryItemsFromFirebase();
                    renderTreasuryContent();
                } catch (error) {
                    console.error('Error deleting treasury item:', error);
                    alert('Error deleting item. Please try again.');
                }
            }
        }

        async function saveTreasuryItem(isEdit = false, itemId = null) {
            const artworkName = document.getElementById('treasury-artwork-name').value.trim();
            const artist = document.getElementById('treasury-artist').value.trim();
            const acquisitionDate = document.getElementById('treasury-acquisition-date').value;
            const value = parseFloat(document.getElementById('treasury-value').value) || 0;
            const location = document.getElementById('treasury-location').value;
            const description = document.getElementById('treasury-description').value.trim();

            const photoInput = document.getElementById('treasury-photos');
            const existingPhotos = isEdit ? treasuryItems.find(t => t.id === itemId)?.photos || [] : [];

            // Prepare photos for Firebase (convert blobs to base64)
            let photosData = [...existingPhotos];
            if (photoInput.files.length > 0) {
                for (let file of photoInput.files) {
                    const base64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    });
                    photosData.push(base64);
                }
            }

            try {
                if (isEdit) {
                    const item = treasuryItems.find(t => t.id === itemId);
                    if (item) {
                        item.artworkName = artworkName;
                        item.artist = artist;
                        item.acquisitionDate = acquisitionDate;
                        item.value = value;
                        item.location = location;
                        item.description = description;
                        item.photos = photosData;

                        // Update in Firebase
                        if (typeof firebase !== 'undefined' && firebase.firestore) {
                            const db = firebase.firestore();
                            const treasuryCollection = window.FIREBASE_COLLECTIONS?.treasury || 'treasury';
                            
                            // Use firestoreId if available, otherwise create new
                            if (item.firestoreId) {
                                await db.collection(treasuryCollection).doc(item.firestoreId).update({
                                    artworkName,
                                    artist,
                                    acquisitionDate,
                                    value,
                                    location,
                                    description,
                                    photos: photosData,
                                    updatedAt: new Date()
                                });
                                console.log('✅ Treasury item updated in Firebase');
                            } else {
                                // If no firestoreId, save as new
                                const docRef = await db.collection(treasuryCollection).add({
                                    artworkName,
                                    artist,
                                    acquisitionDate,
                                    value,
                                    location,
                                    description,
                                    photos: photosData,
                                    createdAt: new Date(),
                                    updatedAt: new Date()
                                });
                                item.firestoreId = docRef.id;
                                console.log('✅ Treasury item created in Firebase');
                            }
                        }
                    }
                } else {
                    const newItem = {
                        id: treasuryItems.length > 0 ? Math.max(...treasuryItems.map(t => t.id)) + 1 : 1,
                        artworkName,
                        artist,
                        acquisitionDate,
                        value,
                        location,
                        description,
                        photos: photosData
                    };

                    // Save to Firebase
                    if (typeof firebase !== 'undefined' && firebase.firestore) {
                        const db = firebase.firestore();
                        const treasuryCollection = window.FIREBASE_COLLECTIONS?.treasury || 'treasury';
                        
                        const docRef = await db.collection(treasuryCollection).add({
                            artworkName,
                            artist,
                            acquisitionDate,
                            value,
                            location,
                            description,
                            photos: photosData,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                        newItem.firestoreId = docRef.id;
                        console.log('✅ Treasury item saved to Firebase');
                    }

                    treasuryItems.push(newItem);
                }

                closeModal();
                await loadTreasuryItemsFromFirebase();
                renderTreasuryContent();
            } catch (error) {
                console.error('Error saving treasury item:', error);
                alert('Error saving treasury item. Please try again.');
            }
        }

        // Change Functions - Cambio dejado en Campos
        function renderChange() {
            const dashboard = document.querySelector('.dashboard');

            const totalChange = changeRecords.reduce((sum, r) => sum + r.amount, 0);
            const recordsByStore = {};
            changeRecords.forEach(r => {
                recordsByStore[r.store] = (recordsByStore[r.store] || 0) + r.amount;
            });

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Change Management</h2>
                        <p class="section-subtitle">Track change left at Campos</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('add-change')">
                        <i class="fas fa-plus"></i>
                        Add Change Record
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px;">
                    <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); text-align: center; padding: 32px 24px;">
                        <div class="stat-icon" style="margin: 0 auto 16px; background: rgba(255, 255, 255, 0.2);"><i class="fas fa-coins"></i></div>
                        <div class="stat-content">
                            <div class="stat-label" style="color: rgba(255, 255, 255, 0.9);">Total Change</div>
                            <div class="stat-value" style="color: white;">$${totalChange.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        </div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); text-align: center; padding: 32px 24px;">
                        <div class="stat-icon" style="margin: 0 auto 16px; background: rgba(255, 255, 255, 0.2);"><i class="fas fa-receipt"></i></div>
                        <div class="stat-content">
                            <div class="stat-label" style="color: rgba(255, 255, 255, 0.9);">Total Records</div>
                            <div class="stat-value" style="color: white;">${changeRecords.length}</div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-list"></i>
                            Change Records
                        </h3>
                        <div style="display: flex; gap: 12px;">
                            <select class="form-input" style="width: 200px;" onchange="filterChangeRecords(this.value)">
                                <option value="all">All Stores</option>
                                <option value="Miramar">VSU Miramar</option>
                                <option value="Morena">VSU Morena</option>
                                <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                <option value="Chula Vista">VSU Chula Vista</option>
                                <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-body" style="padding: 0;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th style="width: 80px;">Photo</th>
                                    <th>Store</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Left By</th>
                                    <th>Received By</th>
                                    <th>Notes</th>
                                    <th style="width: 100px;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="changeTableBody">
                                ${renderChangeTable()}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        function renderChangeTable(filter = 'all') {
            const filteredRecords = filter === 'all' ? changeRecords : changeRecords.filter(r => r.store === filter);

            if (filteredRecords.length === 0) {
                return `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
                            <i class="fas fa-coins" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                            No change records found
                        </td>
                    </tr>
                `;
            }

            return filteredRecords.map(record => {
                const photoDisplay = record.photo
                    ? `<img src="${record.photo}" style="width: 100%; height: 100%; object-fit: cover;" alt="Change photo">`
                    : `<i class="fas fa-image" style="color: var(--text-muted); font-size: 24px;"></i>`;

                return `
                    <tr>
                        <td>
                            <div style="width: 60px; height: 60px; border-radius: 8px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: ${record.photo ? 'pointer' : 'default'};" ${record.photo ? `onclick="viewChangePhoto(${record.id})"` : ''}>
                                ${photoDisplay}
                            </div>
                        </td>
                        <td>
                            <span class="badge" style="background: var(--accent-primary);">VSU ${record.store}</span>
                        </td>
                        <td style="font-weight: 600; color: var(--success);">$${record.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td>${formatDate(record.date)}</td>
                        <td>${record.leftBy}</td>
                        <td>${record.receivedBy}</td>
                        <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${record.notes || ''}">${record.notes || '-'}</td>
                        <td>
                            <button class="btn-icon" onclick="viewChangeRecord(${record.id})" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" onclick="deleteChangeRecord(${record.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function filterChangeRecords(store) {
            const tbody = document.getElementById('changeTableBody');
            if (tbody) {
                tbody.innerHTML = renderChangeTable(store);
            }
        }

        function viewChangeRecord(id) {
            const record = changeRecords.find(r => r.id === id);
            if (!record) return;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            const photoDisplay = record.photo
                ? `<img src="${record.photo}" style="width: 100%; max-height: 300px; object-fit: contain; border-radius: 8px;" alt="Change photo">`
                : `<div style="text-align: center; padding: 40px; background: var(--bg-secondary); border-radius: 8px; color: var(--text-muted);">
                    <i class="fas fa-image" style="font-size: 48px; margin-bottom: 12px; display: block;"></i>
                    No photo available
                </div>`;

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-coins"></i> Change Record Details</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px;">
                        ${photoDisplay}
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div>
                            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Store</label>
                            <p style="margin: 0; font-weight: 500;">VSU ${record.store}</p>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Amount</label>
                            <p style="margin: 0; font-weight: 600; color: var(--success); font-size: 20px;">$${record.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Date</label>
                            <p style="margin: 0; font-weight: 500;">${formatDate(record.date)}</p>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Left By</label>
                            <p style="margin: 0; font-weight: 500;">${record.leftBy}</p>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Received By</label>
                            <p style="margin: 0; font-weight: 500;">${record.receivedBy}</p>
                        </div>
                    </div>

                    ${record.notes ? `
                        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color);">
                            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 8px;">Notes</label>
                            <p style="margin: 0; line-height: 1.6; color: var(--text-secondary);">${record.notes}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                    <button class="btn-primary" style="background: var(--danger); border-color: var(--danger);" onclick="if(confirm('Are you sure you want to delete this record?')) { deleteChangeRecord(${record.id}); closeModal(); }">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;

            modal.classList.add('active');
        }

        function viewChangePhoto(id) {
            const record = changeRecords.find(r => r.id === id);
            if (!record || !record.photo) return;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-image"></i> Change Photo</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body" style="padding: 0;">
                    <img src="${record.photo}" style="width: 100%; height: auto; display: block;" alt="Change photo">
                </div>
            `;

            modal.classList.add('active');
        }

        function deleteChangeRecord(id) {
            if (confirm('Are you sure you want to delete this change record?')) {
                changeRecords = changeRecords.filter(r => r.id !== id);
                renderChange();
            }
        }

        function saveChangeRecord() {
            const store = document.getElementById('change-store').value;
            const amount = parseFloat(document.getElementById('change-amount').value);
            const date = document.getElementById('change-date').value;
            const leftBy = document.getElementById('change-left-by').value.trim();
            const receivedBy = document.getElementById('change-received-by').value.trim();
            const notes = document.getElementById('change-notes').value.trim();
            const photoInput = document.getElementById('change-photo');

            if (!store || !amount || !date || !leftBy || !receivedBy) {
                alert('Please fill in all required fields');
                return;
            }

            const newRecord = {
                id: Math.max(0, ...changeRecords.map(r => r.id)) + 1,
                store,
                amount,
                date,
                leftBy,
                receivedBy,
                notes,
                photo: photoInput.files.length > 0 ? URL.createObjectURL(photoInput.files[0]) : null
            };

            changeRecords.unshift(newRecord);
            closeModal();
            renderChange();
        }

        // Gifts Functions - Control de Regalos en Especie
        function getGiftsAvailableMonths() {
            const months = new Set();
            giftsRecords.forEach(r => {
                if (r.date) months.add(r.date.slice(0, 7));
            });
            months.add(new Date().toISOString().slice(0, 7));
            return Array.from(months).sort().reverse();
        }

        function changeGiftsMonth(month) {
            giftsCurrentMonth = month;
            renderGifts();
        }

        function renderGifts() {
            const dashboard = document.querySelector('.dashboard');

            // Filter by current month
            const monthlyRecords = giftsRecords.filter(r => r.date && r.date.startsWith(giftsCurrentMonth));
            const monthlyTotal = monthlyRecords.reduce((sum, r) => sum + r.value, 0);
            const monthlyItems = monthlyRecords.reduce((sum, r) => sum + r.quantity, 0);
            const monthName = new Date(giftsCurrentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
            const availableMonths = getGiftsAvailableMonths();

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Gifts</h2>
                        <p class="section-subtitle">Control de Regalos en Especie</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('add-gift')">
                        <i class="fas fa-plus"></i>
                        Register Gift
                    </button>
                </div>

                <!-- Monthly Total Card -->
                <div style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); border-radius: 16px; padding: 30px 40px; margin-bottom: 24px; position: relative; overflow: hidden;">
                    <div style="position: absolute; right: -30px; top: 50%; transform: translateY(-50%); width: 180px; height: 180px; border-radius: 50%; background: rgba(255,255,255,0.1);"></div>
                    <div style="position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; letter-spacing: 1px; margin-bottom: 8px;">${monthName}</div>
                            <div style="color: white; font-size: 42px; font-weight: 700; margin-bottom: 4px;">$${monthlyTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            <div style="color: rgba(255,255,255,0.8); font-size: 14px;">${monthlyRecords.length} gift${monthlyRecords.length !== 1 ? 's' : ''} (${monthlyItems} items) this month</div>
                        </div>
                        <select class="form-input" style="width: 150px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white;" onchange="changeGiftsMonth(this.value)">
                            ${availableMonths.map(month => {
                                const mName = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                                return `<option value="${month}" ${month === giftsCurrentMonth ? 'selected' : ''} style="color: black;">${mName}</option>`;
                            }).join('')}
                        </select>
                    </div>
                </div>

                <!-- Filters -->
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-body" style="padding: 12px 16px;">
                        <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <label style="font-weight: 500; color: var(--text-secondary);">Store:</label>
                                <select class="form-input" id="gifts-store-filter" style="width: 180px;" onchange="filterGiftsTable()">
                                    <option value="all">All Stores</option>
                                    <option value="Miramar">Miramar</option>
                                    <option value="Morena">Morena</option>
                                    <option value="Kearny Mesa">Kearny Mesa</option>
                                    <option value="Chula Vista">Chula Vista</option>
                                    <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                </select>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <label style="font-weight: 500; color: var(--text-secondary);">Recipient:</label>
                                <select class="form-input" id="gifts-type-filter" style="width: 150px;" onchange="filterGiftsTable()">
                                    <option value="all">All Types</option>
                                    <option value="customer">Customer</option>
                                    <option value="vendor">Vendor</option>
                                    <option value="employee">Employee</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Gifts Table -->
                <div class="card">
                    <div class="card-body" style="padding: 0;">
                        ${monthlyRecords.length === 0 ? `
                            <div style="padding: 60px; text-align: center; color: var(--text-muted);">
                                <i class="fas fa-gift" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                                <h3 style="margin-bottom: 8px; color: var(--text-secondary);">No Gifts This Month</h3>
                                <p>Click "Register Gift" to add a new record</p>
                            </div>
                        ` : `
                            <table class="data-table" style="width: 100%;">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Product</th>
                                        <th>Qty</th>
                                        <th>Value</th>
                                        <th>Recipient</th>
                                        <th>Type</th>
                                        <th>Store</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="giftsTableBody">
                                    ${renderGiftsTableRows(monthlyRecords)}
                                </tbody>
                            </table>
                        `}
                    </div>
                </div>
            `;
        }

        function renderGiftsTableRows(records) {
            if (records.length === 0) return '';

            return records.map(gift => `
                <tr>
                    <td>${new Date(gift.date).toLocaleDateString()}</td>
                    <td>
                        <div style="font-weight: 500;">${gift.product}</div>
                        ${gift.notes ? `<div style="font-size: 11px; color: var(--text-muted); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${gift.notes}</div>` : ''}
                    </td>
                    <td style="text-align: center;">${gift.quantity}</td>
                    <td style="font-weight: 600; color: var(--danger);">$${gift.value.toFixed(2)}</td>
                    <td>${gift.recipient}</td>
                    <td>
                        <span class="status-badge ${gift.recipientType === 'customer' ? 'active' : gift.recipientType === 'vendor' ? 'warning' : 'inactive'}">
                            ${gift.recipientType.charAt(0).toUpperCase() + gift.recipientType.slice(1)}
                        </span>
                    </td>
                    <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${gift.reason}">${gift.reason}</td>
                    <td>
                        <span style="background: var(--bg-tertiary); padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                            ${gift.store}
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-icon" onclick="viewGiftDetails(${gift.id})" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" onclick="editGift(${gift.id})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="deleteGift(${gift.id})" title="Delete" style="color: var(--danger);">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        function filterGiftsTable() {
            const storeFilter = document.getElementById('gifts-store-filter')?.value || 'all';
            const typeFilter = document.getElementById('gifts-type-filter')?.value || 'all';

            // Start with monthly records
            let filteredRecords = giftsRecords.filter(r => r.date && r.date.startsWith(giftsCurrentMonth));

            // Apply store filter
            if (storeFilter !== 'all') {
                filteredRecords = filteredRecords.filter(r => r.store === storeFilter);
            }

            // Apply type filter
            if (typeFilter !== 'all') {
                filteredRecords = filteredRecords.filter(r => r.recipientType === typeFilter);
            }

            const tbody = document.getElementById('giftsTableBody');
            if (tbody) {
                tbody.innerHTML = renderGiftsTableRows(filteredRecords);
            }
        }

        function viewGiftDetails(id) {
            const gift = giftsRecords.find(r => r.id === id);
            if (!gift) return;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2 style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-gift" style="color: var(--accent-primary);"></i>
                        Gift Details
                    </h2>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; gap: 16px;">
                        <div class="card" style="background: var(--bg-tertiary);">
                            <div class="card-body">
                                <h3 style="margin: 0 0 12px 0; color: var(--text-primary);">${gift.product}</h3>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                                    <div>
                                        <div style="color: var(--text-muted); font-size: 12px;">Quantity</div>
                                        <div style="font-weight: 600;">${gift.quantity}</div>
                                    </div>
                                    <div>
                                        <div style="color: var(--text-muted); font-size: 12px;">Value</div>
                                        <div style="font-weight: 600; color: var(--danger);">$${gift.value.toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <div style="color: var(--text-muted); font-size: 12px;">Date</div>
                                        <div style="font-weight: 500;">${new Date(gift.date).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <div style="color: var(--text-muted); font-size: 12px;">Store</div>
                                        <div style="font-weight: 500;">${gift.store}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card" style="background: var(--bg-tertiary);">
                            <div class="card-body">
                                <h4 style="margin: 0 0 12px 0; color: var(--text-primary);">
                                    <i class="fas fa-user" style="margin-right: 8px;"></i>Recipient
                                </h4>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                                    <div>
                                        <div style="color: var(--text-muted); font-size: 12px;">Name</div>
                                        <div style="font-weight: 600;">${gift.recipient}</div>
                                    </div>
                                    <div>
                                        <div style="color: var(--text-muted); font-size: 12px;">Type</div>
                                        <span class="status-badge ${gift.recipientType === 'customer' ? 'active' : gift.recipientType === 'vendor' ? 'warning' : 'inactive'}">
                                            ${gift.recipientType.charAt(0).toUpperCase() + gift.recipientType.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card" style="background: var(--bg-tertiary);">
                            <div class="card-body">
                                <h4 style="margin: 0 0 12px 0; color: var(--text-primary);">
                                    <i class="fas fa-clipboard-list" style="margin-right: 8px;"></i>Reason
                                </h4>
                                <p style="margin: 0; line-height: 1.6; color: var(--text-secondary);">${gift.reason}</p>
                            </div>
                        </div>

                        ${gift.notes ? `
                            <div class="card" style="background: var(--bg-tertiary);">
                                <div class="card-body">
                                    <h4 style="margin: 0 0 12px 0; color: var(--text-primary);">
                                        <i class="fas fa-sticky-note" style="margin-right: 8px;"></i>Notes
                                    </h4>
                                    <p style="margin: 0; line-height: 1.6; color: var(--text-secondary);">${gift.notes}</p>
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <div style="display: flex; gap: 12px; margin-top: 20px;">
                        <button class="btn-secondary" style="flex: 1;" onclick="editGift(${gift.id}); closeModal();">
                            <i class="fas fa-edit"></i>
                            Edit Gift
                        </button>
                        <button class="btn-secondary" style="flex: 1; background: var(--danger); color: white; border-color: var(--danger);" onclick="if(confirm('Are you sure you want to delete this gift record?')) { deleteGift(${gift.id}); closeModal(); }">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            `;

            modal.classList.add('active');
        }

        function editGift(id) {
            closeModal();
            setTimeout(() => openModal('edit-gift', id), 100);
        }

        function deleteGift(id) {
            if (confirm('Are you sure you want to delete this gift record?')) {
                giftsRecords = giftsRecords.filter(r => r.id !== id);
                renderGifts();
            }
        }

        function saveGift(isEdit = false, giftId = null) {
            const product = document.getElementById('gift-product').value.trim();
            const quantity = parseInt(document.getElementById('gift-quantity').value);
            const value = parseFloat(document.getElementById('gift-value').value);
            const recipient = document.getElementById('gift-recipient').value.trim();
            const recipientType = document.getElementById('gift-recipient-type').value;
            const reason = document.getElementById('gift-reason').value.trim();
            const store = document.getElementById('gift-store').value;
            const date = document.getElementById('gift-date').value;
            const notes = document.getElementById('gift-notes').value.trim();
            const photoInput = document.getElementById('gift-photo');

            if (!product) {
                alert('Please enter a product name');
                return;
            }

            if (isEdit && giftId) {
                const gift = giftsRecords.find(r => r.id === giftId);
                if (gift) {
                    gift.product = product;
                    gift.quantity = quantity;
                    gift.value = value;
                    gift.recipient = recipient;
                    gift.recipientType = recipientType;
                    gift.reason = reason;
                    gift.store = store;
                    gift.date = date;
                    gift.notes = notes;
                    if (photoInput && photoInput.files.length > 0) {
                        gift.photo = URL.createObjectURL(photoInput.files[0]);
                    }
                }
            } else {
                const newGift = {
                    id: Math.max(0, ...giftsRecords.map(r => r.id)) + 1,
                    product,
                    quantity,
                    value,
                    recipient,
                    recipientType,
                    reason,
                    store,
                    date,
                    notes,
                    photo: photoInput && photoInput.files.length > 0 ? URL.createObjectURL(photoInput.files[0]) : null
                };
                giftsRecords.unshift(newGift);
            }

            closeModal();
            renderGifts();
        }

        // Cash Out Functions
        function renderCashOut() {
            const dashboard = document.querySelector('.dashboard');

            // Calculate monthly total
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const monthlyRecords = cashOutRecords.filter(r => {
                const date = new Date(r.createdDate);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            });
            const monthlyTotal = monthlyRecords.reduce((sum, r) => sum + r.amount, 0);
            const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Cash Out</h2>
                        <p class="section-subtitle">Cash disbursements record</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('create-cashout')">
                        <i class="fas fa-plus"></i>
                        Add Cash Out
                    </button>
                </div>

                <!-- Monthly Total Card -->
                <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); border-radius: 16px; padding: 30px 40px; margin-bottom: 24px; position: relative; overflow: hidden;">
                    <div style="position: absolute; right: -30px; top: 50%; transform: translateY(-50%); width: 180px; height: 180px; border-radius: 50%; background: rgba(255,255,255,0.1);"></div>
                    <div style="position: relative; z-index: 1;">
                        <div style="color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; letter-spacing: 1px; margin-bottom: 8px;">${monthName}</div>
                        <div style="color: white; font-size: 42px; font-weight: 700; margin-bottom: 4px;">$${monthlyTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 14px;">${monthlyRecords.length} expense${monthlyRecords.length !== 1 ? 's' : ''} this month</div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-body" style="padding: 0;">
                        ${cashOutRecords.length === 0 ? `
                            <div style="text-align: center; padding: 60px; color: var(--text-muted);">
                                <i class="fas fa-money-bill-wave" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                                <h3 style="margin-bottom: 8px; color: var(--text-secondary);">No Cash Outs Yet</h3>
                                <p>Click "Add Cash Out" to create a new record</p>
                            </div>
                        ` : `
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th>Store</th>
                                        <th>Created By</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${cashOutRecords.map(record => `
                                        <tr>
                                            <td>${formatDate(record.createdDate)}</td>
                                            <td>
                                                <strong>${record.name}</strong>
                                                ${record.reason ? `<div style="font-size: 12px; color: var(--text-muted);">${record.reason}</div>` : ''}
                                            </td>
                                            <td style="font-weight: 600; color: var(--danger);">
                                                $${record.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                            </td>
                                            <td><span class="status-badge">${record.store || 'N/A'}</span></td>
                                            <td>${record.createdBy}</td>
                                            <td>
                                                <div class="action-buttons">
                                                    <button class="btn-icon btn-danger" onclick="deleteCashOut(${record.id})" title="Delete">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
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

        function deleteCashOut(id) {
            if (!confirm('Are you sure you want to delete this cash out record?')) return;
            cashOutRecords = cashOutRecords.filter(r => r.id !== id);
            renderCashOut();
            showNotification('Cash out deleted', 'success');
        }

        function createCashOut() {
            const name = document.getElementById('cashout-name').value.trim();
            const amount = parseFloat(document.getElementById('cashout-amount').value);
            const store = document.getElementById('cashout-store').value;
            const date = document.getElementById('cashout-date').value;
            const reason = document.getElementById('cashout-reason').value.trim();

            if (!name || !amount || !store) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            if (amount <= 0) {
                showNotification('Amount must be greater than zero', 'error');
                return;
            }

            const newRecord = {
                id: cashOutRecords.length > 0 ? Math.max(...cashOutRecords.map(r => r.id)) + 1 : 1,
                name,
                amount,
                store,
                reason,
                createdDate: date || new Date().toISOString().split('T')[0],
                createdBy: currentUser?.name || 'Unknown'
            };

            cashOutRecords.unshift(newRecord);
            closeModal();
            renderCashOut();
            showNotification('Cash out added!', 'success');
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

            // Sort issues by date, most recent first
            const sortedIssues = [...issues].sort((a, b) => new Date(b.incidentDate) - new Date(a.incidentDate));

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Issues</h2>
                        <p class="section-subtitle">Customer incident documentation</p>
                    </div>
                    <button class="btn-primary" onclick="openModal('create-issue')">
                        <i class="fas fa-plus"></i>
                        New Issue
                    </button>
                </div>

                <!-- Customer Perception Chart -->
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-smile"></i>
                            Customer Perception
                        </h3>
                        <span style="font-size: 13px; color: var(--text-muted);">How customers felt when leaving</span>
                    </div>
                    <div class="card-body">
                        ${renderPerceptionGanttChart()}
                    </div>
                </div>

                <!-- All Issues List -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-list"></i>
                            All Issues
                        </h3>
                        <span class="badge" style="background: var(--accent-primary);">${issues.length} Total</span>
                    </div>
                    <div class="card-body" style="padding: 0;">
                        ${sortedIssues.length === 0 ? `
                            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                                No issues recorded yet
                            </div>
                        ` : `
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Customer</th>
                                        <th>Phone</th>
                                        <th>Type</th>
                                        <th>Description</th>
                                        <th>Perception</th>
                                        <th style="width: 80px;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${sortedIssues.map(issue => `
                                        <tr>
                                            <td style="white-space: nowrap;">${formatDate(issue.incidentDate)}</td>
                                            <td><strong>${issue.customer}</strong></td>
                                            <td>
                                                ${issue.phone ? `<a href="tel:${issue.phone}" style="color: var(--accent-primary); text-decoration: none;"><i class="fas fa-phone"></i> ${issue.phone}</a>` : '-'}
                                            </td>
                                            <td>
                                                <span class="badge" style="background: ${issue.type === 'In Store' ? 'var(--accent-primary)' : 'var(--info)'};">
                                                    <i class="fas fa-${issue.type === 'In Store' ? 'store' : 'globe'}"></i>
                                                    ${issue.type}
                                                </span>
                                            </td>
                                            <td style="max-width: 250px;">${issue.description || '-'}</td>
                                            <td style="text-align: center; font-size: 24px;">
                                                ${issue.perception ? getPerceptionEmoji(issue.perception) : '-'}
                                            </td>
                                            <td>
                                                <button class="btn-icon" onclick="viewIssueDetails(${issue.id})" title="View Details">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button class="btn-icon danger" onclick="deleteIssue(${issue.id})" title="Delete">
                                                    <i class="fas fa-trash"></i>
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
            const emojis = {
                1: '😡',
                2: '😠',
                3: '😐',
                4: '🙂',
                5: '😊'
            };
            return emojis[value] || '❓';
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
            // Get issues with perception data, sorted by date
            const issuesWithPerception = issues
                .filter(i => i.perception !== null && i.perception !== undefined)
                .sort((a, b) => new Date(a.incidentDate) - new Date(b.incidentDate))
                .slice(-15); // Last 15 issues

            if (issuesWithPerception.length === 0) {
                return `
                    <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                        <i class="fas fa-chart-bar" style="font-size: 48px; margin-bottom: 16px; display: block; opacity: 0.5;"></i>
                        <p>No perception data recorded yet</p>
                        <p style="font-size: 13px;">Create issues with customer perception to see the chart</p>
                    </div>
                `;
            }

            // Calculate perception distribution
            const perceptionCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
            issuesWithPerception.forEach(i => {
                if (perceptionCounts[i.perception] !== undefined) {
                    perceptionCounts[i.perception]++;
                }
            });

            const total = issuesWithPerception.length;

            return `
                <!-- Perception Summary -->
                <div style="display: flex; justify-content: space-around; margin-bottom: 24px; padding: 16px; background: var(--bg-secondary); border-radius: 12px;">
                    ${[1, 2, 3, 4, 5].map(level => `
                        <div style="text-align: center;">
                            <div style="font-size: 28px; margin-bottom: 4px;">${getPerceptionEmoji(level)}</div>
                            <div style="font-size: 20px; font-weight: 700; color: ${getPerceptionColor(level)};">${perceptionCounts[level]}</div>
                            <div style="font-size: 11px; color: var(--text-muted);">${getPerceptionLabel(level)}</div>
                        </div>
                    `).join('')}
                </div>

                <!-- Gantt-style Timeline Chart -->
                <div style="margin-bottom: 16px;">
                    <h4 style="font-size: 14px; margin-bottom: 12px; color: var(--text-secondary);">
                        <i class="fas fa-stream"></i> Recent Customer Experiences
                    </h4>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${issuesWithPerception.map(issue => {
                        const barWidth = (issue.perception / 5) * 100;
                        const color = getPerceptionColor(issue.perception);
                        return `
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 100px; font-size: 12px; color: var(--text-muted); text-align: right; flex-shrink: 0;">
                                    ${formatDate(issue.incidentDate)}
                                </div>
                                <div style="flex: 1; background: var(--bg-secondary); border-radius: 8px; height: 36px; position: relative; overflow: hidden;">
                                    <div style="width: ${barWidth}%; height: 100%; background: linear-gradient(90deg, ${color}88, ${color}); border-radius: 8px; display: flex; align-items: center; padding-left: 12px; transition: width 0.3s ease;">
                                        <span style="font-size: 20px;">${getPerceptionEmoji(issue.perception)}</span>
                                    </div>
                                </div>
                                <div style="width: 140px; font-size: 12px; color: var(--text-secondary); flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${issue.customer}">
                                    ${issue.customer}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Perception Scale Legend -->
                <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: center; gap: 24px; font-size: 12px; color: var(--text-muted);">
                        <span><span style="display: inline-block; width: 12px; height: 12px; background: #ef4444; border-radius: 3px; margin-right: 4px;"></span> Very Upset</span>
                        <span><span style="display: inline-block; width: 12px; height: 12px; background: #f97316; border-radius: 3px; margin-right: 4px;"></span> Upset</span>
                        <span><span style="display: inline-block; width: 12px; height: 12px; background: #eab308; border-radius: 3px; margin-right: 4px;"></span> Neutral</span>
                        <span><span style="display: inline-block; width: 12px; height: 12px; background: #22c55e; border-radius: 3px; margin-right: 4px;"></span> Satisfied</span>
                        <span><span style="display: inline-block; width: 12px; height: 12px; background: #10b981; border-radius: 3px; margin-right: 4px;"></span> Happy</span>
                    </div>
                </div>
            `;
        }

        function createIssue() {
            const customer = document.getElementById('issue-customer').value.trim();
            const phone = document.getElementById('issue-phone').value.trim();
            const type = document.getElementById('issue-type').value;
            const description = document.getElementById('issue-description').value.trim();
            const incidentDate = document.getElementById('issue-incident-date').value;
            const perception = document.getElementById('issue-perception').value;

            const newIssue = {
                id: issues.length > 0 ? Math.max(...issues.map(i => i.id)) + 1 : 1,
                customer: customer || 'Anonymous',
                phone: phone || '',
                type: type || 'In Store',
                description: description || '',
                incidentDate: incidentDate || new Date().toISOString().split('T')[0],
                perception: perception ? parseInt(perception) : null,
                createdBy: 'Carlos Admin',
                createdDate: new Date().toISOString().split('T')[0]
            };

            issues.unshift(newIssue);
            closeModal();
            renderIssues();
        }

        function deleteIssue(issueId) {
            if (confirm('Are you sure you want to delete this issue?')) {
                issues = issues.filter(i => i.id !== issueId);
                renderIssues();
            }
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
                    console.log(`✅ Loaded ${firebaseVendors.length} vendors from Firebase`);
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
                        <h2 class="section-title">Vendors</h2>
                        <p class="section-subtitle">Manage your supplier contacts and information</p>
                    </div>
                    <button class="btn-primary" onclick="openAddVendorModal()">
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
            let filteredVendors = firebaseVendors;

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
                        <div class="card" style="cursor: pointer; transition: all 0.2s; border-left: 4px solid ${categoryColors[vendor.category] || 'var(--accent-primary)'};" onclick="viewVendorDetails('${vendor.firestoreId}')">
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

        function openAddVendorModal() {
            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-plus-circle"></i> Add New Vendor</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <form id="add-vendor-form" style="display: grid; gap: 16px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label class="form-label">Vendor Name *</label>
                                <input type="text" id="vendor-name" class="form-input" placeholder="Enter vendor name" required>
                            </div>
                            <div>
                                <label class="form-label">Category *</label>
                                <select id="vendor-category" class="form-input" required>
                                    <option value="">Select category</option>
                                    <option value="Vape Products">Vape Products</option>
                                    <option value="Tobacco Products">Tobacco Products</option>
                                    <option value="Beverages">Beverages</option>
                                    <option value="Snacks & Candy">Snacks & Candy</option>
                                    <option value="Store Supplies">Store Supplies</option>
                                </select>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label class="form-label">Contact Person *</label>
                                <input type="text" id="vendor-contact" class="form-input" placeholder="Enter contact name" required>
                            </div>
                            <div>
                                <label class="form-label">Phone *</label>
                                <input type="tel" id="vendor-phone" class="form-input" placeholder="Enter phone number" required>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label class="form-label">Email *</label>
                                <input type="email" id="vendor-email" class="form-input" placeholder="Enter email" required>
                            </div>
                            <div>
                                <label class="form-label">Website</label>
                                <input type="url" id="vendor-website" class="form-input" placeholder="https://example.com">
                            </div>
                        </div>

                        <div>
                            <label class="form-label">Access Information</label>
                            <textarea id="vendor-access" class="form-input" placeholder="Account details, login info, etc." style="min-height: 80px;"></textarea>
                        </div>

                        <div>
                            <label class="form-label">Products/Services *</label>
                            <textarea id="vendor-products" class="form-input" placeholder="What products/services do you buy from this vendor?" style="min-height: 80px;" required></textarea>
                        </div>

                        <div>
                            <label class="form-label">Order Methods *</label>
                            <textarea id="vendor-order-methods" class="form-input" placeholder="How to order (phone, email, online, etc.)" style="min-height: 80px;" required></textarea>
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

        async function createVendor() {
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

            try {
                const newVendor = {
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
                    <button class="btn-primary" onclick="closeModal(); setTimeout(() => editVendorModal('${vendor.firestoreId}'), 100);">
                        <i class="fas fa-edit"></i> Edit Vendor
                    </button>
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
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
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label class="form-label">Vendor Name *</label>
                                <input type="text" id="edit-vendor-name" class="form-input" value="${vendor.name}" placeholder="Enter vendor name" required>
                            </div>
                            <div>
                                <label class="form-label">Category *</label>
                                <select id="edit-vendor-category" class="form-input" required>
                                    <option value="">Select category</option>
                                    <option value="Vape Products" ${vendor.category === 'Vape Products' ? 'selected' : ''}>Vape Products</option>
                                    <option value="Tobacco Products" ${vendor.category === 'Tobacco Products' ? 'selected' : ''}>Tobacco Products</option>
                                    <option value="Beverages" ${vendor.category === 'Beverages' ? 'selected' : ''}>Beverages</option>
                                    <option value="Snacks & Candy" ${vendor.category === 'Snacks & Candy' ? 'selected' : ''}>Snacks & Candy</option>
                                    <option value="Store Supplies" ${vendor.category === 'Store Supplies' ? 'selected' : ''}>Store Supplies</option>
                                </select>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label class="form-label">Contact Person *</label>
                                <input type="text" id="edit-vendor-contact" class="form-input" value="${vendor.contact}" placeholder="Enter contact name" required>
                            </div>
                            <div>
                                <label class="form-label">Phone *</label>
                                <input type="tel" id="edit-vendor-phone" class="form-input" value="${vendor.phone}" placeholder="Enter phone number" required>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label class="form-label">Email *</label>
                                <input type="email" id="edit-vendor-email" class="form-input" value="${vendor.email}" placeholder="Enter email" required>
                            </div>
                            <div>
                                <label class="form-label">Website</label>
                                <input type="url" id="edit-vendor-website" class="form-input" value="${vendor.website || ''}" placeholder="https://example.com">
                            </div>
                        </div>

                        <div>
                            <label class="form-label">Access Information</label>
                            <textarea id="edit-vendor-access" class="form-input" placeholder="Account details, login info, etc." style="min-height: 80px;">${vendor.access || ''}</textarea>
                        </div>

                        <div>
                            <label class="form-label">Products/Services *</label>
                            <textarea id="edit-vendor-products" class="form-input" placeholder="What products/services do you buy from this vendor?" style="min-height: 80px;" required>${vendor.products}</textarea>
                        </div>

                        <div>
                            <label class="form-label">Order Methods *</label>
                            <textarea id="edit-vendor-order-methods" class="form-input" placeholder="How to order (phone, email, online, etc.)" style="min-height: 80px;" required>${vendor.orderMethods}</textarea>
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

        async function saveVendorChanges(firestoreId) {
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

            try {
                const updateData = {
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

            if (confirm(`Are you sure you want to delete "${vendor.name}"? This action cannot be undone.`)) {
                deleteVendor(firestoreId);
            }
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
                alert('Error deleting vendor: ' + error.message);
            }
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
                                    <select class="form-input" id="training-type" onchange="toggleTrainingTypeFields()">
                                        <option value="video">Video (YouTube/Vimeo)</option>
                                        <option value="document">Document (PDF)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Duration</label>
                                    <input type="text" class="form-input" id="training-duration" placeholder="30 min">
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
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="training-required" checked>
                                    <span>Required for all employees</span>
                                </label>
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
                                    <label>Product Name</label>
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
                                    <label>Quantity</label>
                                    <input type="number" class="form-input" id="new-product-quantity" placeholder="0">
                                </div>
                                <div class="form-group">
                                    <label>Price</label>
                                    <input type="number" step="0.01" class="form-input" id="new-product-price" placeholder="0.00">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Store</label>
                                    <select class="form-input" id="new-product-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar">VSU Miramar</option>
                                        <option value="Morena">VSU Morena</option>
                                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                        <option value="Chula Vista">VSU Chula Vista</option>
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Arrival Date</label>
                                    <input type="date" class="form-input" id="new-product-arrival">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Supplier</label>
                                <input type="text" class="form-input" id="new-product-supplier" placeholder="Enter supplier name...">
                            </div>
                            <div class="form-group">
                                <label>Product Image</label>
                                <label>Product Photo *</label>
                                <div style="border: 2px dashed var(--border-color); border-radius: 8px; padding: 16px; text-align: center; background: var(--bg-hover);">
                                    <input type="file" class="form-input" id="new-product-image" accept="image/*" onchange="previewProductImage(this)" style="display: none;">
                                    <div id="product-image-preview" style="display: none; margin-bottom: 12px;">
                                        <img id="product-image-img" style="max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: cover;">
                                    </div>
                                    <button type="button" class="btn-secondary" onclick="document.getElementById('new-product-image').click()" style="margin: 0;">
                                        <i class="fas fa-image"></i> Choose Photo
                                    </button>
                                    <p style="margin: 8px 0 0 0; color: var(--text-muted); font-size: 12px;">Click to select an image (optional)</p>
                                    <p style="margin: 8px 0 0 0; color: var(--text-muted); font-size: 12px;">Click to select an image (JPG, PNG up to 5MB)</p>
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
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Crime Type *</label>
                                    <select class="form-input" id="thief-crime-type">
                                        <option value="">Select type...</option>
                                        <option value="Shoplifting">Shoplifting</option>
                                        <option value="Attempted Theft">Attempted Theft</option>
                                        <option value="Robbery">Robbery</option>
                                        <option value="Fraud">Fraud</option>
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
                                        <option value="Miramar Wine & Liquor" ${data.store === 'Miramar Wine & Liquor' ? 'selected' : ''}>Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Crime Type</label>
                                    <select class="form-input" id="edit-thief-crime-type">
                                        <option value="">Select type...</option>
                                        <option value="Shoplifting" ${data.crimeType === 'Shoplifting' ? 'selected' : ''}>Shoplifting</option>
                                        <option value="Attempted Theft" ${data.crimeType === 'Attempted Theft' ? 'selected' : ''}>Attempted Theft</option>
                                        <option value="Robbery" ${data.crimeType === 'Robbery' ? 'selected' : ''}>Robbery</option>
                                        <option value="Fraud" ${data.crimeType === 'Fraud' ? 'selected' : ''}>Fraud</option>
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
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Category</label>
                                    <select class="form-input" id="invoice-category">
                                        <option value="">Select category...</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Office">Office</option>
                                        <option value="Utilities">Utilities</option>
                                        <option value="Rent">Rent</option>
                                        <option value="Insurance">Insurance</option>
                                        <option value="Supplies">Supplies</option>
                                        <option value="Services">Services</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Amount ($)</label>
                                    <input type="number" step="0.01" class="form-input" id="invoice-amount" placeholder="0.00">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <input type="text" class="form-input" id="invoice-description" placeholder="Enter description...">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Due Date</label>
                                    <input type="date" class="form-input" id="invoice-due-date">
                                </div>
                                <div class="form-group">
                                    <label>Status</label>
                                    <select class="form-input" id="invoice-status">
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="overdue">Overdue</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label style="display: flex; align-items: center; gap: 8px;">
                                        <input type="checkbox" id="invoice-recurring" style="width: 18px; height: 18px; accent-color: var(--accent-primary);">
                                        <span>Recurring Invoice</span>
                                    </label>
                                </div>
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
                                    <button type="button" class="btn-secondary" onclick="document.getElementById('invoice-photo').click()" style="margin: 0;">
                                        <i class="fas fa-upload"></i> Upload File
                                    </button>
                                    <p style="margin: 8px 0 0 0; color: var(--text-muted); font-size: 12px;">Upload a photo or PDF of the invoice (max 1MB)</p>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Notes</label>
                                <textarea class="form-input" id="invoice-notes" rows="2" placeholder="Add any additional notes..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
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
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
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
                            <h2><i class="fas fa-money-bill-wave"></i> Add Cash Out</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-row">
                                <div class="form-group" style="flex: 2;">
                                    <label>Description *</label>
                                    <input type="text" class="form-input" id="cashout-name" placeholder="e.g., Office Supplies, Bank Deposit...">
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
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Date</label>
                                    <input type="date" class="form-input" id="cashout-date" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Notes</label>
                                <textarea class="form-input" id="cashout-reason" rows="2" placeholder="Additional notes (optional)..."></textarea>
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
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Customer Name</label>
                                    <input type="text" class="form-input" id="issue-customer" placeholder="Enter customer name...">
                                </div>
                                <div class="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" class="form-input" id="issue-phone" placeholder="(555) 555-5555">
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
                                    <label>Incident Date</label>
                                    <input type="date" class="form-input" id="issue-incident-date" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Brief Description</label>
                                <textarea class="form-input" id="issue-description" rows="3" placeholder="Describe the issue briefly..."></textarea>
                            </div>
                            <div class="form-group">
                                <label>Customer Perception When Leaving</label>
                                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">How did the customer feel when leaving the store?</p>
                                <div id="perception-selector" style="display: flex; justify-content: space-between; gap: 8px;">
                                    <button type="button" class="perception-btn" data-value="1" onclick="selectPerception(1)" style="flex: 1; padding: 16px 8px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); cursor: pointer; transition: all 0.2s;">
                                        <div style="font-size: 32px; margin-bottom: 4px;">😡</div>
                                        <div style="font-size: 11px; color: var(--text-muted);">Very Upset</div>
                                    </button>
                                    <button type="button" class="perception-btn" data-value="2" onclick="selectPerception(2)" style="flex: 1; padding: 16px 8px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); cursor: pointer; transition: all 0.2s;">
                                        <div style="font-size: 32px; margin-bottom: 4px;">😠</div>
                                        <div style="font-size: 11px; color: var(--text-muted);">Upset</div>
                                    </button>
                                    <button type="button" class="perception-btn" data-value="3" onclick="selectPerception(3)" style="flex: 1; padding: 16px 8px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); cursor: pointer; transition: all 0.2s;">
                                        <div style="font-size: 32px; margin-bottom: 4px;">😐</div>
                                        <div style="font-size: 11px; color: var(--text-muted);">Neutral</div>
                                    </button>
                                    <button type="button" class="perception-btn" data-value="4" onclick="selectPerception(4)" style="flex: 1; padding: 16px 8px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); cursor: pointer; transition: all 0.2s;">
                                        <div style="font-size: 32px; margin-bottom: 4px;">🙂</div>
                                        <div style="font-size: 11px; color: var(--text-muted);">Satisfied</div>
                                    </button>
                                    <button type="button" class="perception-btn" data-value="5" onclick="selectPerception(5)" style="flex: 1; padding: 16px 8px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); cursor: pointer; transition: all 0.2s;">
                                        <div style="font-size: 32px; margin-bottom: 4px;">😊</div>
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
                                <label>Artwork Name</label>
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
                                <label>Current Location</label>
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
                                <label>Description</label>
                                <textarea class="form-input" id="treasury-description" rows="4" placeholder="Add details about the piece..."></textarea>
                            </div>
                            <div class="form-group">
                                <label>Photos</label>
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
                                <label>Artwork Name</label>
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
                                <label>Current Location</label>
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
                            <div class="form-group">
                                <label>Photos</label>
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
                case 'add-change':
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-coins"></i> Add Change Record</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Store / Location *</label>
                                    <select class="form-input" id="change-store">
                                        <option value="">Select store...</option>
                                        <option value="Miramar">VSU Miramar</option>
                                        <option value="Morena">VSU Morena</option>
                                        <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                        <option value="Chula Vista">VSU Chula Vista</option>
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Amount *</label>
                                    <input type="number" step="0.01" class="form-input" id="change-amount" placeholder="0.00">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date *</label>
                                    <input type="date" class="form-input" id="change-date" value="${new Date().toISOString().split('T')[0]}">
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
                                <textarea class="form-input" id="change-notes" rows="3" placeholder="e.g., 'Se dejó en caja 1', 'Se metió extra por falta de cambio'..."></textarea>
                            </div>
                            <div class="form-group">
                                <label>Photo of Envelope/Receipt (Optional)</label>
                                <div class="file-upload">
                                    <input type="file" id="change-photo" accept="image/*">
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
                            <button class="btn-primary" onclick="saveChangeRecord()">
                                <i class="fas fa-save"></i>
                                Save Record
                            </button>
                        </div>
                    `;
                    break;

                case 'add-risknote':
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-shield-halved"></i> New Risk Note</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
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
                                <textarea class="form-input" id="risknote-description" rows="3" placeholder="Describe what happened..."></textarea>
                            </div>
                            <div class="form-group">
                                <label>Risk Level</label>
                                <div style="display: flex; gap: 12px;">
                                    <button type="button" class="risk-level-btn" data-level="low" onclick="selectRiskLevel('low')" style="flex: 1; padding: 14px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); cursor: pointer; transition: all 0.2s;">
                                        <div style="font-size: 20px; margin-bottom: 4px; color: #22c55e;">🟢</div>
                                        <div style="font-size: 12px; font-weight: 600;">Low</div>
                                    </button>
                                    <button type="button" class="risk-level-btn" data-level="medium" onclick="selectRiskLevel('medium')" style="flex: 1; padding: 14px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); cursor: pointer; transition: all 0.2s;">
                                        <div style="font-size: 20px; margin-bottom: 4px; color: #f59e0b;">🟡</div>
                                        <div style="font-size: 12px; font-weight: 600;">Medium</div>
                                    </button>
                                    <button type="button" class="risk-level-btn" data-level="high" onclick="selectRiskLevel('high')" style="flex: 1; padding: 14px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); cursor: pointer; transition: all 0.2s;">
                                        <div style="font-size: 20px; margin-bottom: 4px; color: #ef4444;">🔴</div>
                                        <div style="font-size: 12px; font-weight: 600;">High</div>
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
                    content = `
                        <div class="modal-header">
                            <h2><i class="fas fa-gift"></i> Register Gift</h2>
                            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
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
                                    <label>Value ($)</label>
                                    <input type="number" step="0.01" class="form-input" id="gift-value" placeholder="0.00">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Recipient Name</label>
                                    <input type="text" class="form-input" id="gift-recipient" placeholder="Name of person receiving the gift">
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
                                <label>Reason for Gift</label>
                                <textarea class="form-input" id="gift-reason" rows="2" placeholder="e.g., Defective product replacement, compensation for error, promotional gift..."></textarea>
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
                                        <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Date</label>
                                    <input type="date" class="form-input" id="gift-date" value="${new Date().toISOString().split('T')[0]}">
                                </div>
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
                                Save Gift
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
                            <button class="btn-primary" onclick="saveGift(true, ${editGiftRecord.id})">
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

            // Hide all nav items first
            document.querySelectorAll('.nav-section a, .nav-section div').forEach(item => {
                if (!item.classList.contains('nav-label')) {
                    item.style.display = 'none';
                }
            });

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
            const email = document.getElementById('edit-emp-email').value.trim() || currentEmployee.email;
            const phone = document.getElementById('edit-emp-phone').value.trim() || currentEmployee.phone;
            const password = document.getElementById('edit-emp-password').value.trim();
            const confirmPassword = document.getElementById('edit-emp-confirm-password').value.trim();
            const role = document.getElementById('edit-emp-role').value || currentEmployee.role;
            const employeeType = document.getElementById('edit-emp-employee-type')?.value || currentEmployee.employeeType || 'employee';
            const store = document.getElementById('edit-emp-store').value || currentEmployee.store;
            const status = document.getElementById('edit-emp-status').value || currentEmployee.status;
            const hireDate = document.getElementById('edit-emp-hire-date').value || currentEmployee.hireDate;
            const emergency = document.getElementById('edit-emp-emergency').value.trim();
            const allergies = document.getElementById('edit-emp-allergies').value.trim();

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
                emergencyContact: emergency || currentEmployee.emergencyContact || 'Not provided',
                allergies: allergies || currentEmployee.allergies || 'None'
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
                    const firestoreId = await firebaseEmployeeManager.addEmployee(newEmployee, email, password);
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
            const duration = document.getElementById('training-duration').value.trim();
            const url = document.getElementById('training-url').value.trim();
            const description = document.getElementById('training-description')?.value.trim() || '';
            const required = document.getElementById('training-required').checked;

            // Validation
            if (!title) {
                showToast('Please enter a training title', 'error');
                return;
            }

            if (type === 'video' && !url) {
                showToast('Please enter a video URL', 'error');
                return;
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
                        duration: duration || '30 min',
                        completion: 0,
                        required,
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
                        duration: duration || '30 min',
                        completion: 0,
                        required,
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

        function saveLicense() {
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

            // Handle file - use uploaded file name or generate placeholder
            let fileName = null;
            if (fileInput && fileInput.files.length > 0) {
                fileName = fileInput.files[0].name;
            }

            licenses.push({
                id: licenses.length + 1,
                name, store, expires, status,
                file: fileName
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

        async function saveProduct() {
            const name = document.getElementById('new-product-name').value.trim();
            const category = document.getElementById('new-product-category').value;
            const quantity = document.getElementById('new-product-quantity').value;
            const price = document.getElementById('new-product-price').value;
            const store = document.getElementById('new-product-store').value;
            const arrivalDate = document.getElementById('new-product-arrival').value;
            const supplier = document.getElementById('new-product-supplier').value.trim();
            const imageInput = document.getElementById('new-product-image');

            if (!name) {
                alert('Please enter a product name');
                return;
            }

            // Show loading state
            const saveBtn = document.getElementById('save-product-btn');
            const originalText = saveBtn.innerHTML;
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            try {
                // Get image as base64 if uploaded (same approach as thieves)
                let image = null;
                const imageImg = document.getElementById('product-image-img');
                if (imageImg && imageImg.src && imageInput.files && imageInput.files.length > 0) {
                    image = imageImg.src;  // Base64 DataURL from preview
                }

                // Create product data object
                const productData = {
                    name,
                    category: category || '',
                    quantity: parseInt(quantity) || 0,
                    price: parseFloat(price) || 0,
                    store: store || '',
                    arrivalDate: arrivalDate || '',
                    supplier: supplier || '',
                    image: image,  // Base64 image stored directly in Firestore
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
                    console.log('✅ Product saved successfully:', savedProduct);
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

                // Validate file size (max 1MB for Firestore document limit)
                const maxSize = 1 * 1024 * 1024; // 1MB
                if (file.size > maxSize) {
                    showToast('Image too large. Please use an image under 1MB.', 'error');
                    input.value = '';
                    preview.style.display = 'none';
                    return;
                }

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
                
                console.log(`✅ Loaded ${products.length} products from Firebase`);
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
            if (!confirm('Are you sure you want to delete this product?')) {
                return;
            }

            try {
                if (!firebaseProductManager.isInitialized) {
                    const initialized = await firebaseProductManager.initialize();
                    if (!initialized) {
                        alert('Firebase not initialized');
                        return;
                    }
                }

                console.log(`🗑️ Deleting product: ${productId}`);
                const success = await firebaseProductManager.deleteProduct(productId);
                
                if (success) {
                    console.log('✅ Product deleted successfully');
                    // Remove from local array
                    products = products.filter(p => p.id !== productId);
                    renderNewStuff();
                } else {
                    alert('Error deleting product');
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Error deleting product');
            }
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

                // Validate file size (max 1MB for Firestore document limit)
                const maxSize = 1 * 1024 * 1024; // 1MB
                if (file.size > maxSize) {
                    showToast('Image too large. Please use an image under 1MB.', 'error');
                    input.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    img.src = e.target.result;  // Base64 DataURL
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
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
                                <input type="text" id="edit-product-category" value="${product.category || ''}" class="form-input" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit;">
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
                                <input type="text" id="edit-product-store" value="${product.store || ''}" class="form-input" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit;">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="display: block; color: var(--text-muted); font-size: 12px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">Arrival Date</label>
                                <input type="date" id="edit-product-arrival-date" value="${product.arrivalDate || ''}" class="form-input" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit;">
                            </div>
                            <div>
                                <label style="display: block; color: var(--text-muted); font-size: 12px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">Supplier</label>
                                <input type="text" id="edit-product-supplier" value="${product.supplier || ''}" class="form-input" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit;">
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
                            <small style="display: block; margin-top: 8px; color: var(--text-muted);">Max file size: 1MB</small>
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

            // Get image - use new one if uploaded, otherwise keep current (same approach as thieves)
            let image = product.image;
            const imageImg = document.getElementById('edit-product-image-img');
            if (imageInput && imageInput.files && imageInput.files.length > 0 && imageImg && imageImg.src) {
                image = imageImg.src;  // New Base64 DataURL
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
                image: image  // Base64 image
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
                    console.log('✅ Product updated in Firebase');
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
                'vault': 'treasury',
                'coins': 'change',
                'gift': 'gifts',
                'shield-halved': 'risknotes',
                'bolt': 'gforce'
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
            modal.addEventListener('mousedown', function(e) {
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
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <span style="color: var(--text-muted); font-size: 13px;">
                                <i class="fas fa-clock"></i> ${training.duration || '30 min'}
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
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Duration</label>
                                    <span style="font-weight: 500; color: var(--text-primary);">${training.duration || '30 min'}</span>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Status</label>
                                    <span class="badge ${training.required ? 'danger' : 'success'}">${training.required ? 'Required' : 'Optional'}</span>
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

                    <div class="training-card-progress" style="margin-bottom: 0;">
                        <div class="progress-bar" style="height: 10px;">
                            <div class="progress-fill" style="width: ${training.completion || 0}%;"></div>
                        </div>
                        <span style="text-align: center; display: block; margin-top: 8px;">${training.completion || 0}% completed</span>
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
                    <div class="form-row">
                        <div class="form-group">
                            <label>Type</label>
                            <input type="text" class="form-input" value="${(training.type || 'document').toUpperCase()}" disabled style="background: var(--bg-tertiary);">
                        </div>
                        <div class="form-group">
                            <label>Duration</label>
                            <input type="text" class="form-input" id="edit-training-duration" value="${training.duration || '30 min'}" placeholder="30 min">
                        </div>
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
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="edit-training-required" ${training.required ? 'checked' : ''}>
                            <span>Required for all employees</span>
                        </label>
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
            const duration = document.getElementById('edit-training-duration').value.trim();
            const urlInput = document.getElementById('edit-training-url');
            const url = urlInput ? urlInput.value.trim() : '';
            const description = document.getElementById('edit-training-description').value.trim();
            const required = document.getElementById('edit-training-required').checked;

            if (!title) {
                showToast('Please enter a title', 'error');
                return;
            }

            try {
                if (!firebaseTrainingManager.isInitialized) {
                    await firebaseTrainingManager.initialize();
                }

                const updateData = {
                    title,
                    duration: duration || '30 min',
                    description,
                    required
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
                showToast('Error updating training: ' + error.message, 'error');
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
        function logout() {
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
                emp.name.toLowerCase().includes(searchTerm) ||
                emp.role.toLowerCase().includes(searchTerm) ||
                emp.store.toLowerCase().includes(searchTerm) ||
                emp.email.toLowerCase().includes(searchTerm)
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
                thief.name.toLowerCase().includes(searchTerm) ||
                thief.store.toLowerCase().includes(searchTerm) ||
                thief.crimeType.toLowerCase().includes(searchTerm) ||
                (thief.itemsStolen && thief.itemsStolen.toLowerCase().includes(searchTerm))
            ).slice(0, 5);

            if (thiefResults.length > 0) {
                results.push({
                    category: 'Thieves Database',
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
                inv.invoiceNumber.toLowerCase().includes(searchTerm) ||
                inv.vendor.toLowerCase().includes(searchTerm) ||
                inv.category.toLowerCase().includes(searchTerm) ||
                inv.description.toLowerCase().includes(searchTerm)
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
                prod.name.toLowerCase().includes(searchTerm) ||
                prod.category.toLowerCase().includes(searchTerm) ||
                prod.store.toLowerCase().includes(searchTerm) ||
                prod.supplier.toLowerCase().includes(searchTerm)
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
                item.brand.toLowerCase().includes(searchTerm) ||
                item.productName.toLowerCase().includes(searchTerm) ||
                item.flavor.toLowerCase().includes(searchTerm) ||
                item.store.toLowerCase().includes(searchTerm)
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
                ann.title.toLowerCase().includes(searchTerm) ||
                ann.content.toLowerCase().includes(searchTerm) ||
                ann.author.toLowerCase().includes(searchTerm)
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
                    html += `
                        <div class="search-result-item" onclick="navigateToSearchResult('${category.page}', ${item.id})">
                            <div class="search-result-icon">
                                <i class="fas ${category.icon}"></i>
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
                <div class="search-shortcut-hint">
                    <span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
                    <span><kbd>Enter</kbd> to select</span>
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

            // Clear search input
            const searchInput = document.getElementById('global-search');
            if (searchInput) {
                searchInput.value = '';
            }

            // Navigate to the page
            navigateTo(page);

            // Optionally highlight or scroll to the item (future enhancement)
            console.log(`Navigated to ${page}, item ID: ${itemId}`);
        }

        function showSearchResults() {
            const dropdown = document.getElementById('search-results-dropdown');
            const searchInput = document.getElementById('global-search');

            if (searchInput && searchInput.value.trim().length >= 2) {
                performSearch(searchInput.value);
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
            if (searchContainer && !searchContainer.contains(e.target)) {
                hideSearchResults();
            }
        });

        // Keyboard shortcuts for search
        document.addEventListener('keydown', function(e) {
            // Ctrl+K or Cmd+K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('global-search');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }

            // Escape to close search dropdown
            if (e.key === 'Escape') {
                hideSearchResults();
                const searchInput = document.getElementById('global-search');
                if (searchInput) {
                    searchInput.blur();
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
        let licensesEditMode = false;  // Edit mode toggle for drag and drop

        function handleLicenseDragStart(event, licenseId) {
            if (!licensesEditMode) {
                event.preventDefault();
                return;
            }
            draggedLicenseId = licenseId;
            event.target.classList.add('dragging');
            event.dataTransfer.effectAllowed = 'move';
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

        function handleLicenseDrop(event, targetStore) {
            if (!licensesEditMode) return;
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

        function toggleLicensesEditMode() {
            licensesEditMode = !licensesEditMode;
            renderLicenses();
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
            'Miramar Wine & Liquor'
        ];

        let riskNotesState = {
            notes: JSON.parse(localStorage.getItem('riskNotes')) || [],
            filterStore: 'all',
            filterLevel: 'all',
            filterType: 'all'
        };

        function saveRiskNotes() {
            localStorage.setItem('riskNotes', JSON.stringify(riskNotesState.notes));
        }

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
                        <button class="btn-primary" onclick="openModal('add-risknote')">
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
                            <button class="btn-secondary" onclick="resetRiskNotesFilters()" style="margin-left: auto;">
                                <i class="fas fa-refresh"></i> Reset
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Risk Notes List -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-list"></i>
                            Recent Activity Notes
                        </h3>
                        <span class="badge" style="background: var(--accent-primary);">${filteredNotes.length} Notes</span>
                    </div>
                    <div class="card-body">
                        ${filteredNotes.length === 0 ? `
                            <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                                <i class="fas fa-shield-halved" style="font-size: 56px; margin-bottom: 20px; display: block; opacity: 0.3;"></i>
                                <div style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">No risk notes yet</div>
                                <div style="font-size: 14px;">Click "New Risk Note" to document unusual activity</div>
                            </div>
                        ` : `
                            <div style="display: grid; gap: 16px;">
                                ${filteredNotes.map(note => {
                                    const behaviorType = RISK_BEHAVIOR_TYPES.find(t => t.id === note.behaviorType) || RISK_BEHAVIOR_TYPES[5];
                                    const level = RISK_LEVELS.find(l => l.id === note.level) || RISK_LEVELS[0];
                                    const noteDate = new Date(note.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                                    return `
                                        <div style="background: var(--bg-secondary); border-radius: 16px; padding: 20px; border-left: 4px solid ${level.color}; transition: all 0.2s; cursor: pointer;" onclick="viewRiskNote('${note.id}')" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='translateX(0)'">
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
                                                    ${note.photo ? '<i class="fas fa-image" style="color: var(--text-muted); font-size: 12px;" title="Has photo"></i>' : ''}
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

        function resetRiskNotesFilters() {
            riskNotesState.filterStore = 'all';
            riskNotesState.filterLevel = 'all';
            riskNotesState.filterType = 'all';
            renderRiskNotes();
        }

        function deleteRiskNote(noteId) {
            if (confirm('Are you sure you want to delete this risk note?')) {
                riskNotesState.notes = riskNotesState.notes.filter(n => n.id !== noteId);
                saveRiskNotes();
                renderRiskNotes();
            }
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

        function createRiskNote(date, store, behaviorType, description, level, reportedBy, managerNote, photo) {
            const newNote = {
                id: Date.now().toString(),
                date,
                store: store || 'Miramar',
                behaviorType: behaviorType || 'other',
                description: description || '',
                level: level || 'low',
                reportedBy: reportedBy || 'Staff',
                managerNote,
                photo,
                createdAt: new Date().toISOString()
            };

            riskNotesState.notes.unshift(newNote);
            saveRiskNotes();
            closeModal();
            renderRiskNotes();
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

        function viewRiskNote(noteId) {
            const note = riskNotesState.notes.find(n => n.id === noteId);
            if (!note) return;

            const behaviorType = RISK_BEHAVIOR_TYPES.find(t => t.id === note.behaviorType) || RISK_BEHAVIOR_TYPES[5];
            const level = RISK_LEVELS.find(l => l.id === note.level) || RISK_LEVELS[0];
            const noteDate = new Date(note.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
            const createdDate = note.createdAt ? new Date(note.createdAt).toLocaleString('en-US') : 'Unknown';

            const modal = document.getElementById('modal');
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

                        ${note.photo ? `
                            <!-- Photo Evidence -->
                            <div style="margin-bottom: 20px;">
                                <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Photo Evidence</label>
                                <div style="border-radius: 12px; overflow: hidden; background: var(--bg-secondary);">
                                    <img src="${note.photo}" alt="Evidence" style="width: 100%; max-height: 350px; object-fit: contain; cursor: pointer;" onclick="window.open('${note.photo}', '_blank')">
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

        // G FORCE FUNCTIONALITY
        function renderGForce() {
            const dashboard = document.querySelector('.dashboard');
            const quote = getRandomGForceQuote();
            const affirmations = getRandomGForceAffirmations(5);
            const philosophy = getRandomGForcePhilosophy();

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
                        <button class="btn-secondary" onclick="refreshGForceQuote()" style="margin-top: 20px;">
                            <i class="fas fa-sync-alt"></i> New Quote
                        </button>
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
                            <button class="btn-icon" onclick="refreshGForceAffirmations()" title="New Affirmations">
                                <i class="fas fa-sync-alt"></i>
                            </button>
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
                            <button class="btn-icon" onclick="refreshGForcePhilosophy()" title="New Philosophy">
                                <i class="fas fa-sync-alt"></i>
                            </button>
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
        document.getElementById('gforce-modal').addEventListener('mousedown', function(e) {
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
                <h2 class="section-title">
                    <i class="fas fa-wallet" style="color: var(--accent-primary);"></i>
                    Gconomics
                </h2>
                <p class="section-subtitle">Personal Expense Tracker</p>
            </div>
            <div class="page-header-right" style="display: flex; gap: 12px; align-items: center;">
                <select class="form-input" style="width: 160px;" onchange="changeGconomicsMonth(this.value)">
                    ${availableMonths.map(month => {
                        const monthName = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                        return `<option value="${month}" ${month === gconomicsState.currentMonth ? 'selected' : ''}>${monthName}</option>`;
                    }).join('')}
                </select>
                <button class="btn-primary" onclick="openAddExpenseModal()">
                    <i class="fas fa-plus"></i> New Expense
                </button>
            </div>
        </div>

        <!-- Monthly Summary Card -->
        <div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); color: white; overflow: hidden; position: relative;">
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 120px; height: 120px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
            <div class="card-body" style="padding: 32px; position: relative; z-index: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px;">
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
                    <div style="display: grid; grid-template-columns: 200px 1fr; gap: 32px; align-items: center;">
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
        <div style="display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap;">
            <button onclick="filterGconomicsByCategory('all')" style="padding: 10px 20px; border-radius: 25px; border: 2px solid ${gconomicsState.selectedCategory === 'all' ? 'var(--accent-primary)' : 'var(--border-color)'}; background: ${gconomicsState.selectedCategory === 'all' ? 'var(--accent-primary)' : 'var(--bg-secondary)'}; color: ${gconomicsState.selectedCategory === 'all' ? 'white' : 'var(--text-primary)'}; cursor: pointer; font-weight: 500; transition: all 0.2s;">
                <i class="fas fa-th-large"></i> All
            </button>
            ${GCONOMICS_CATEGORIES.map(cat => `
                <button onclick="filterGconomicsByCategory('${cat.id}')" style="padding: 10px 20px; border-radius: 25px; border: 2px solid ${gconomicsState.selectedCategory === cat.id ? cat.color : 'var(--border-color)'}; background: ${gconomicsState.selectedCategory === cat.id ? cat.color : 'var(--bg-secondary)'}; color: ${gconomicsState.selectedCategory === cat.id ? 'white' : 'var(--text-primary)'}; cursor: pointer; font-weight: 500; transition: all 0.2s;">
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
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
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
                                        <div style="font-size: 11px; font-weight: 500;">${cat.name}</div>
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

    const date = document.getElementById('expenseDate').value || new Date().toISOString().split('T')[0];
    const description = document.getElementById('expenseDescription').value.trim();
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value) || 0;
    const photoInput = document.getElementById('expensePhoto');

    // Get photo if uploaded
    if (photoInput && photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoData = e.target.result;
            saveExpenseWithPhoto(date, description, category, amount, photoData);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        // Check if editing and preserve existing photo
        let existingPhoto = null;
        if (gconomicsState.editingExpenseId) {
            const existing = gconomicsState.expenses.find(e => e.id === gconomicsState.editingExpenseId);
            if (existing) existingPhoto = existing.photo;
        }
        saveExpenseWithPhoto(date, description, category, amount, existingPhoto);
    }
}

function saveExpenseWithPhoto(date, description, category, amount, photo) {
    if (gconomicsState.editingExpenseId) {
        // Update existing expense
        const index = gconomicsState.expenses.findIndex(e => e.id === gconomicsState.editingExpenseId);
        if (index > -1) {
            gconomicsState.expenses[index] = {
                ...gconomicsState.expenses[index],
                date,
                description: description || 'Expense',
                category: category || 'other',
                amount,
                photo
            };
        }
    } else {
        // Add new expense
        const newExpense = {
            id: Date.now().toString(),
            date,
            description: description || 'Expense',
            category: category || 'other',
            amount,
            photo,
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
