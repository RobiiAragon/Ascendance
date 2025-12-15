/**
 * Abundance Cloud Configuration
 *
 * ACTUALIZADO: 15 de Diciembre 2025
 * Sistema completo con Firebase Authentication y Firestore
 * Celeste AI Assistant con Claude
 */

// ═══════════════════════════════════════════════════════════════
// CELESTE AI - API KEYS
// Currently using: OpenAI GPT-4 (switch in js/celeste-ai.js → AI_PROVIDER)
// ═══════════════════════════════════════════════════════════════

// OpenAI API Key (GPT-4) - CURRENTLY ACTIVE
window.OPENAI_API_KEY = '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';

// Anthropic API Key (Claude) - For switching back to Claude
window.ANTHROPIC_API_KEY = 'sk-ant-api03-test-key-placeholder';

// Main Configuration
window.ABUNDANCE_CONFIG = {
    // Backend API Configuration (disabled - using direct Shopify API)
    apiUri: 'http://localhost:3300/', // Your backend API endpoint (not used when useDirectShopifyAPI is true)

    // Shopify Store Configuration - Loyal Vaper (same as shopify-analytics.js)
    shopifyUrl: 'k1xm3v-v0',
    shopifyAdminUrl: 'https://admin.shopify.com/store/k1xm3v-v0',
    shopifyDomain: 'k1xm3v-v0.myshopify.com',
    shopifyAccessToken: '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',

    // Store Information
    storeName: 'Loyal Vaper',
    organizationName: 'Abundance Cloud Engine',

    // Feature Flags
    features: {
        autoRefresh: true,
        refreshInterval: 120000, // 2 minutes in milliseconds
        barcodeScanner: true,
        mockData: false, // Set to true for testing without backend
        debugMode: true, // Enable console logging
        useBackendAPI: false, // Disabled - no backend server required
        useDirectShopifyAPI: true // Enable direct Shopify API (frontend, like Analytics)
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
    databaseURL: window.ENV_FIREBASE_DATABASE_URL,
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
    passwords: 'passwords',     // Firestore collection for password manager
    settings: 'settings'        // Firestore collection for app settings (store locations, geofence config, etc.)
};

// Store Locations for Geofencing (Clock In/Out)
// Each store has coordinates and a radius (in meters) for the geofence
window.STORE_LOCATIONS = {
    'Miramar': {
        name: 'VSU Miramar',
        latitude: 32.8934,      // Update with actual coordinates
        longitude: -117.1489,   // Update with actual coordinates
        radius: 100             // 100 meters radius
    },
    'Morena': {
        name: 'VSU Morena',
        latitude: 32.7657,      // Update with actual coordinates
        longitude: -117.1949,   // Update with actual coordinates
        radius: 100
    },
    'Kearny Mesa': {
        name: 'VSU Kearny Mesa',
        latitude: 32.8225,      // Update with actual coordinates
        longitude: -117.1533,   // Update with actual coordinates
        radius: 100
    },
    'Chula Vista': {
        name: 'VSU Chula Vista',
        latitude: 32.6401,      // Update with actual coordinates
        longitude: -117.0842,   // Update with actual coordinates
        radius: 100
    },
    'North Park': {
        name: 'VSU North Park',
        latitude: 32.7405,      // Update with actual coordinates
        longitude: -117.1292,   // Update with actual coordinates
        radius: 100
    },
    'Miramar Wine & Liquor': {
        name: 'Miramar Wine & Liquor',
        latitude: 32.8934,      // Update with actual coordinates
        longitude: -117.1489,   // Update with actual coordinates
        radius: 100
    }
};

// Geofencing Configuration
window.GEOFENCE_CONFIG = {
    enabled: true,                    // Enable/disable geofencing
    strictMode: false,                // If true, blocks clock-in outside geofence. If false, just warns and records location
    defaultRadius: 100,               // Default radius in meters
    allowLocationOverride: false,     // Allow admins to override location check
    recordLocationAlways: true        // Always record location even if geofencing is disabled
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
        pages: ['celesteai', 'dashboard', 'employees', 'training', 'licenses', 'analytics', 'newstuff', 'restock', 'supplies', 'dailychecklist', 'abundancecloud', 'transfers', 'stores', 'announcements', 'tasks', 'schedule', 'settings', 'help', 'thieves', 'invoices', 'issues', 'vendors', 'clockin', 'dailysales', 'cashout', 'gconomics', 'treasury', 'change', 'gifts', 'risknotes', 'gforce', 'passwords', 'projectanalytics', 'labels']
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
        pages: ['celesteai', 'dashboard', 'employees', 'licenses', 'analytics', 'invoices', 'vendors', 'cashout', 'treasury', 'announcements', 'clockin', 'restock', 'supplies', 'dailychecklist', 'transfers', 'change', 'gifts', 'risknotes', 'gforce', 'passwords', 'projectanalytics', 'issues', 'schedule', 'labels']
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
        pages: ['celesteai', 'clockin', 'newstuff', 'abundancecloud', 'transfers', 'announcements', 'schedule', 'help', 'training', 'supplies', 'dailychecklist', 'change', 'risknotes', 'gforce', 'projectanalytics', 'labels']
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
