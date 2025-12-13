/**
 * Abundance Cloud Configuration
 * 
 * ACTUALIZADO: 10 de Diciembre 2025
 * Sistema completo con Firebase Authentication y Firestore
 */

// Main Configuration
window.ABUNDANCE_CONFIG = {
    // Backend API Configuration
    apiUri: 'http://localhost:3300/', // Your backend API endpoint

    // Shopify Store Configuration
    shopifyUrl: 'vsu-store', // Just the store name, not the full URL
    shopifyAdminUrl: 'https://admin.shopify.com/store/vsu-store',

    // Store Information
    storeName: 'VSU - Vapor Store USA',
    organizationName: 'Vapor Store USA Inc.',

    // Feature Flags
    features: {
        autoRefresh: true,
        refreshInterval: 120000, // 2 minutes in milliseconds
        barcodeScanner: true,
        mockData: false, // Set to true for testing without backend
        debugMode: true // Enable console logging
    },

    // Order Filters
    filters: {
        available: ['all', 'shipping', 'pickup', 'manual'],
        default: 'all'
    },

    // Print Settings
    print: {
        includeBarcode: true,
        includeCustomerInfo: true,
        paperSize: 'A4' // or 'Letter'
    }
};

// Firebase Configuration - Loaded from env.js
window.FIREBASE_CONFIG = {
    apiKey: window.ENV_FIREBASE_API_KEY,
    authDomain: window.ENV_FIREBASE_AUTH_DOMAIN,
    projectId: window.ENV_FIREBASE_PROJECT_ID,
    storageBucket: window.ENV_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: window.ENV_FIREBASE_MESSAGING_SENDER_ID,
    appId: window.ENV_FIREBASE_APP_ID,
    measurementId: window.ENV_FIREBASE_MEASUREMENT_ID
};

// Firebase Collections Configuration
window.FIREBASE_COLLECTIONS = {
    employees: 'employees',     // Firestore collection for employees
    roles: 'roles',             // Firestore collection for roles
    users: 'users',             // Firestore collection for auth users
    thieves: 'thieves',         // Firestore collection for thieves database
    clockin: 'clockin',         // Firestore collection for clock in/out records
    products: 'products',       // Firestore collection for products
    trainings: 'trainings',     // Firestore collection for trainings
    schedules: 'schedules',     // Firestore collection for employee schedules
    dayOffRequests: 'dayOffRequests', // Firestore collection for day off requests
    treasury: 'treasury',       // Firestore collection for treasury pieces
    announcements: 'announcements', // Firestore collection for announcements
    changeRecords: 'changeRecords', // Firestore collection for change records
    cashOut: 'cashOut', // Firestore collection for cash out records
    gifts: 'gifts',             // Firestore collection for gifts (Control de Regalos en Especie)
    issues: 'issues',           // Firestore collection for issues registry
    gconomics: 'gconomics',     // Firestore collection for personal expense tracking
    licenses: 'licenses',       // Firestore collection for licenses and documents
    passwords: 'passwords'      // Firestore collection for password manager
};

// Employee Roles Configuration
window.EMPLOYEE_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    EMPLOYEE: 'employee'
};

// Users Database (In-memory - for demo, normally in Firebase)
window.USERS_DATABASE = {
    'admin@vsu.com': {
        id: 'admin-001',
        email: 'admin@vsu.com',
        password: 'Admin@123', // hashed in production
        name: 'Carlos Admin',
        role: 'admin',
        employeeType: 'admin',
        store: 'Miramar',
        status: 'active',
        hireDate: '2022-01-01'
    },
    'manager@vsu.com': {
        id: 'manager-001',
        email: 'manager@vsu.com',
        password: 'Manager@123', // hashed in production
        name: 'Marcus Rodriguez',
        role: 'manager',
        employeeType: 'manager',
        store: 'Miramar',
        status: 'active',
        hireDate: '2023-01-15'
    },
    'employee@vsu.com': {
        id: 'employee-001',
        email: 'employee@vsu.com',
        password: 'Employee@123', // hashed in production
        name: 'Sarah Kim',
        role: 'employee',
        employeeType: 'employee',
        store: 'Morena',
        status: 'active',
        hireDate: '2023-03-20'
    }
};

// Permissions mapping for roles
window.ROLE_PERMISSIONS = {
    'admin': {
        // Action Permissions
        canViewAllEmployees: true,
        canEditAllEmployees: true,
        canDeleteEmployees: true,
        canManageRoles: true,
        canViewReports: true,
        canEditSystem: true,
        label: 'Administrator',
        description: 'Full system access',
        color: '#ef4444', // Red
        // Page Access Permissions
        pages: ['dashboard', 'employees', 'training', 'licenses', 'analytics', 'newstuff', 'restock', 'abundancecloud', 'stores', 'announcements', 'tasks', 'schedule', 'settings', 'help', 'thieves', 'invoices', 'issues', 'vendors', 'clockin', 'dailysales', 'cashout', 'gconomics', 'treasury', 'change', 'gifts', 'risknotes', 'gforce', 'passwords']
    },
    'manager': {
        // Action Permissions
        canViewAllEmployees: true,
        canEditAllEmployees: true,
        canDeleteEmployees: false,
        canManageRoles: false,
        canViewReports: true,
        canEditSystem: false,
        label: 'Manager',
        description: 'Can manage employees and view reports',
        color: '#f59e0b', // Amber
        // Page Access Permissions
        pages: ['dashboard', 'employees', 'licenses', 'analytics', 'invoices', 'vendors', 'cashout', 'treasury', 'announcements', 'clockin', 'restock', 'change', 'gifts', 'risknotes', 'gforce', 'passwords']
    },
    'employee': {
        // Action Permissions
        canViewAllEmployees: false,
        canEditAllEmployees: false,
        canDeleteEmployees: false,
        canManageRoles: false,
        canViewReports: false,
        canEditSystem: false,
        label: 'Employee',
        description: 'Limited access',
        color: '#3b82f6', // Blue
        // Page Access Permissions
        pages: ['clockin', 'newstuff', 'abundancecloud', 'announcements', 'schedule', 'help', 'training', 'change', 'risknotes', 'gforce']
    }
};

// Authentication Configuration
window.AUTH_CONFIG = {
    // Choose your auth method: 'firebase', 'custom', 'none'
    method: 'custom', // Using custom in-memory auth for demo
    
    // For custom auth, provide token getter function
    getToken: async function() {
        // Get from localStorage
        return localStorage.getItem('authToken');
    }
};

// Session Management
window.SESSION_CONFIG = {
    // Session timeout in milliseconds (30 minutes)
    timeout: 30 * 60 * 1000,
    // Enable session persistence
    persistence: true,
    // Session storage key
    storageKey: 'ascendance_session'
};

// UI Customization
window.ABUNDANCE_UI = {
    // Theme colors (uses Ascendance variables by default)
    colors: {
        shipping: '#f97316', // Orange
        pickup: '#10b981',   // Green
        delivered: '#3b82f6', // Blue
        manual: '#71717a'    // Gray
    },

    // Table settings
    table: {
        rowsPerPage: 50,
        showSelectAll: true,
        showPrintButton: true
    },

    // Modal settings
    modal: {
        closeOnBackdropClick: true,
        showCloseButton: true
    }
};

// API Endpoints (relative to apiUri)
window.ABUNDANCE_ENDPOINTS = {
    getOrders: 'get-orders',
    getOrder: 'get-order',
    markShipping: 'mark-shipping',
    markPickup: 'mark-pickup',
    markDelivery: 'mark-delivery',
    getProducts: 'get-products'
};

// Error Messages
window.ABUNDANCE_MESSAGES = {
    errors: {
        loadOrders: 'Failed to load orders. Please try again.',
        markShipping: 'Failed to mark order as prepared.',
        markPickup: 'Failed to mark order ready for pickup.',
        markDelivery: 'Failed to mark order as delivered.',
        noCamera: 'Unable to access camera. Please check permissions.',
        noOrders: 'No orders found matching your criteria.',
        network: 'Network error. Please check your connection.',
        auth: 'Authentication failed. Please login again.',
        invalidCredentials: 'Email or password is incorrect.',
        userNotFound: 'User not found. Please check your email.'
    },
    success: {
        markShipping: 'Order marked as prepared successfully!',
        markPickup: 'Order marked ready for pickup successfully!',
        markDelivery: 'Order marked as delivered successfully!',
        orderUpdated: 'Order updated successfully!',
        loginSuccess: 'Login successful! Redirecting...'
    }
};

// Development/Testing Settings
window.ABUNDANCE_DEV = {
    // Use mock data instead of real API calls
    useMockData: false,

    // Mock delay (milliseconds) to simulate network
    mockDelay: 500,

    // Enable verbose logging
    verboseLogging: true,

    // Skip authentication
    skipAuth: false
};
