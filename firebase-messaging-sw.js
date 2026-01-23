// Firebase Messaging Service Worker
// This runs in the background to receive push notifications

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase config will be passed when initializing
// We'll use a placeholder that gets replaced or use messaging directly
let firebaseConfig = null;

// Listen for config from main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'FIREBASE_CONFIG') {
        firebaseConfig = event.data.config;
        initializeFirebase();
    }
});

function initializeFirebase() {
    if (!firebaseConfig) {
        console.warn('[SW] No Firebase config available');
        return;
    }

    try {
        firebase.initializeApp(firebaseConfig);
        const messaging = firebase.messaging();

        // Handle background messages
        messaging.onBackgroundMessage((payload) => {
            console.log('[SW] Background message received:', payload);

            const notificationTitle = payload.notification?.title || payload.data?.title || 'Ascendance';
            const notificationOptions = {
                body: payload.notification?.body || payload.data?.body || '',
                icon: payload.data?.icon || '/img/icon-192.png',
                badge: '/img/icon-192.png',
                tag: payload.data?.tag || 'ascendance-notification',
                data: payload.data || {},
                vibrate: [200, 100, 200],
                actions: getNotificationActions(payload.data?.type)
            };

            return self.registration.showNotification(notificationTitle, notificationOptions);
        });

        console.log('[SW] Firebase Messaging initialized');
    } catch (error) {
        console.error('[SW] Error initializing Firebase:', error);
    }
}

// Get actions based on notification type
function getNotificationActions(type) {
    switch (type) {
        case 'clockin_reminder':
            return [
                { action: 'clockin', title: 'Clock In Now' },
                { action: 'dismiss', title: 'Dismiss' }
            ];
        case 'clockout_reminder':
            return [
                { action: 'clockout', title: 'Clock Out Now' },
                { action: 'dismiss', title: 'Dismiss' }
            ];
        case 'schedule':
            return [
                { action: 'view_schedule', title: 'View Schedule' },
                { action: 'dismiss', title: 'Dismiss' }
            ];
        default:
            return [
                { action: 'open', title: 'Open App' },
                { action: 'dismiss', title: 'Dismiss' }
            ];
    }
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);
    event.notification.close();

    const action = event.action;
    const data = event.notification.data || {};
    let urlToOpen = '/index.html';

    // Determine URL based on action
    switch (action) {
        case 'clockin':
        case 'clockout':
            urlToOpen = '/index.html?page=clockin';
            break;
        case 'view_schedule':
            urlToOpen = '/index.html?page=schedule';
            break;
        case 'dismiss':
            return; // Just close, don't open anything
        default:
            if (data.url) {
                urlToOpen = data.url;
            } else if (data.page) {
                urlToOpen = `/index.html?page=${data.page}`;
            }
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If app is already open, focus it
            for (const client of clientList) {
                if (client.url.includes('index.html') && 'focus' in client) {
                    client.postMessage({ type: 'NOTIFICATION_CLICK', action, data });
                    return client.focus();
                }
            }
            // Otherwise open new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Service worker install
self.addEventListener('install', (event) => {
    console.log('[SW] Service Worker installed');
    self.skipWaiting();
});

// Service worker activate
self.addEventListener('activate', (event) => {
    console.log('[SW] Service Worker activated');
    event.waitUntil(clients.claim());
});
