/**
 * Abundance Cloud Configuration Template
 *
 * INSTRUCTIONS:
 * 1. Copy this file and rename it to 'abundance-config.js'
 * 2. Update all the values below with your actual credentials
 * 3. Link this file in abundance-cloud.html BEFORE abundance-cloud.js
 * 4. DO NOT commit abundance-config.js to version control (add to .gitignore)
 */

// Main Configuration
window.ABUNDANCE_CONFIG = {
    // Backend API Configuration
    apiUri: 'http://localhost:3300/', // Your backend API endpoint

    // Shopify Store Configuration
    shopifyUrl: 'your-store-name', // Just the store name, not the full URL
    shopifyAdminUrl: 'https://admin.shopify.com/store/your-store-name',

    // Store Information
    storeName: 'Your Store Name',
    organizationName: 'Your Organization',

    // Feature Flags
    features: {
        autoRefresh: true,
        refreshInterval: 120000, // 2 minutes in milliseconds
        barcodeScanner: true,
        mockData: false, // Set to true for testing without backend
        debugMode: false // Enable console logging
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

// Firebase Configuration (if using Firebase Auth)
window.FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Firebase Collections Configuration
window.FIREBASE_COLLECTIONS = {
    employees: 'employees',     // Firestore collection for employees
    roles: 'roles'              // Firestore collection for roles
};

// Employee Roles Configuration
window.EMPLOYEE_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    EMPLOYEE: 'employee'
};

// Permissions mapping for roles
window.ROLE_PERMISSIONS = {
    'admin': {
        // Action permissions
        canViewAllEmployees: true,
        canEditAllEmployees: true,
        canDeleteEmployees: true,
        canManageRoles: true,
        canViewReports: true,
        canEditSystem: true,
        label: 'Administrator',
        // Page access permissions
        pages: ['geconomics']
    },
    'manager': {
        // Action permissions
        canViewAllEmployees: true,
        canEditAllEmployees: true,
        canDeleteEmployees: false,
        canManageRoles: false,
        canViewReports: true,
        canEditSystem: false,
        label: 'Manager',
        // Page access permissions
        pages: ['dashboard', 'employees', 'licenses', 'analytics', 'invoices', 'vendors', 'cashout', 'treasury']
    },
    'employee': {
        // Action permissions
        canViewAllEmployees: false,
        canEditAllEmployees: false,
        canDeleteEmployees: false,
        canManageRoles: false,
        canViewReports: false,
        canEditSystem: false,
        label: 'Employee',
        // Page access permissions
        pages: ['clockin', 'newstuff', 'abundancecloud', 'announcements', 'thieves', 'schedule', 'gforce']
    }
};

// Authentication Configuration
window.AUTH_CONFIG = {
    // Choose your auth method: 'firebase', 'custom', 'none'
    method: 'firebase',

    // For custom auth, provide token getter function
    getToken: async function() {
        // Example for custom auth:
        // return localStorage.getItem('authToken');

        // Example for Firebase:
        // const user = firebase.auth().currentUser;
        // if (user) {
        //     return await user.getIdToken();
        // }
        return null;
    }
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
        auth: 'Authentication failed. Please login again.'
    },
    success: {
        markShipping: 'Order marked as prepared successfully!',
        markPickup: 'Order marked ready for pickup successfully!',
        markDelivery: 'Order marked as delivered successfully!',
        orderUpdated: 'Order updated successfully!'
    }
};

// Development/Testing Settings
window.ABUNDANCE_DEV = {
    // Use mock data instead of real API calls
    useMockData: false,

    // Mock delay (milliseconds) to simulate network
    mockDelay: 500,

    // Enable verbose logging
    verboseLogging: false,

    // Skip authentication
    skipAuth: false
};

/**
 * EXAMPLE PRODUCTION CONFIGURATION:
 *
 * window.ABUNDANCE_CONFIG = {
 *     apiUri: 'https://api.yourstore.com/',
 *     shopifyUrl: 'your-store',
 *     shopifyAdminUrl: 'https://admin.shopify.com/store/your-store',
 *     storeName: 'Your Store',
 *     organizationName: 'Your Company',
 *     features: {
 *         autoRefresh: true,
 *         refreshInterval: 120000,
 *         barcodeScanner: true,
 *         mockData: false,
 *         debugMode: false
 *     }
 * };
 */

/**
 * EXAMPLE DEVELOPMENT CONFIGURATION:
 *
 * window.ABUNDANCE_DEV = {
 *     useMockData: true,
 *     mockDelay: 500,
 *     verboseLogging: true,
 *     skipAuth: true
 * };
 */
