/**
 * Firebase Configuration for Kanban
 * Standalone configuration file
 */

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

// Firebase Collections Configuration for Kanban
window.FIREBASE_COLLECTIONS = {
    tasks: 'kanban_tasks',
    projects: 'kanban_projects',
    team: 'kanban_team'
};
