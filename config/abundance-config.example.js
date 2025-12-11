/**
 * Abundance Cloud Configuration Example
 * 
 * INSTRUCTIONS:
 * 1. Copy this file and rename it to 'abundance-config.js'
 * 2. Update all the Firebase values below with your actual credentials
 * 3. Replace placeholder values with your real Firebase project details
 * 4. DO NOT commit abundance-config.js to version control (add to .gitignore)
 * 
 * To get your Firebase credentials:
 * 1. Go to Firebase Console (https://console.firebase.google.com/)
 * 2. Click on your project settings (gear icon)
 * 3. Go to "Service Accounts" tab
 * 4. Copy the config values from there
 */

// Main Configuration
window.ABUNDANCE_CONFIG = {
    // Backend API Configuration
    apiUri: 'http://localhost:3300/', // Your backend API endpoint

    // Shopify Store Configuration
    shopifyUrl: 'your-store-name', // Just the store name, not the full URL
    shopifyAdminUrl: 'https://admin.shopify.com/store/your-store-name',

    // Store Information
    storeName: 'VSU - Your Store Name',
    organizationName: 'Your Organization Name',

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

// Firebase Configuration - REPLACE WITH YOUR ACTUAL CREDENTIALS
window.FIREBASE_CONFIG = {
    apiKey: "YOUR_FIREBASE_API_KEY_HERE",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
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
        // Action Permissions
        canViewAllEmployees: true,
        canEditAllEmployees: true,
        canDeleteEmployees: true,
        canManageRoles: true,
        canViewReports: true,
        canEditSystem: true,
        label: 'Administrator',
        // Page Access Permissions
        pages: ['geconomics']
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
        // Page Access Permissions
        pages: ['dashboard', 'employees', 'licenses', 'analytics', 'invoices', 'vendors', 'cashout', 'treasury']
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
        // Page Access Permissions
        pages: ['clockin', 'newstuff', 'abundancecloud', 'announcements', 'thieves', 'schedule', 'gforce']
    }
};

// Authentication Configuration
window.AUTH_CONFIG = {
    // Choose your auth method: 'firebase', 'custom', 'none'
    method: 'firebase',

    // For custom auth, provide token getter function
    getToken: async function() {
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
