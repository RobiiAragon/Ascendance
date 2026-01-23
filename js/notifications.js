// ==========================================
// PUSH NOTIFICATIONS MODULE
// Handles FCM setup, permissions, and sending
// ==========================================

let notificationsState = {
    messaging: null,
    token: null,
    permission: 'default',
    supported: false,
    initialized: false
};

// Check if notifications are supported
function checkNotificationSupport() {
    return 'Notification' in window &&
           'serviceWorker' in navigator &&
           'PushManager' in window;
}

// Initialize Firebase Messaging
async function initializeNotifications() {
    if (notificationsState.initialized) return notificationsState.token;

    if (!checkNotificationSupport()) {
        console.warn('[Notifications] Push notifications not supported');
        return null;
    }

    notificationsState.supported = true;

    try {
        // Register service worker first
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('[Notifications] Service Worker registered:', registration.scope);

        // Send Firebase config to service worker
        if (registration.active) {
            registration.active.postMessage({
                type: 'FIREBASE_CONFIG',
                config: window.FIREBASE_CONFIG
            });
        }

        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;

        // Initialize Firebase Messaging
        if (typeof firebase !== 'undefined' && firebase.messaging) {
            notificationsState.messaging = firebase.messaging();
            notificationsState.initialized = true;

            // Handle foreground messages
            notificationsState.messaging.onMessage((payload) => {
                console.log('[Notifications] Foreground message:', payload);
                showForegroundNotification(payload);
            });

            console.log('[Notifications] Firebase Messaging initialized');
        }

        // Check current permission
        notificationsState.permission = Notification.permission;

        return notificationsState.token;
    } catch (error) {
        console.error('[Notifications] Init error:', error);
        return null;
    }
}

// Request notification permission and get token
async function requestNotificationPermission() {
    if (!notificationsState.supported) {
        showNotificationToast('Tu navegador no soporta notificaciones push', 'warning');
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        notificationsState.permission = permission;

        if (permission !== 'granted') {
            console.log('[Notifications] Permission denied');
            showNotificationToast('Notificaciones bloqueadas. Actívalas en configuración del navegador.', 'warning');
            return null;
        }

        // Get FCM token
        const token = await getFCMToken();

        if (token) {
            // Save token to user's profile in Firebase
            await saveUserPushToken(token);
            showNotificationToast('Notificaciones activadas!', 'success');
        }

        return token;
    } catch (error) {
        console.error('[Notifications] Permission error:', error);
        showNotificationToast('Error al activar notificaciones', 'error');
        return null;
    }
}

// Get FCM token
async function getFCMToken() {
    if (!notificationsState.messaging) {
        await initializeNotifications();
    }

    if (!notificationsState.messaging) {
        console.error('[Notifications] Messaging not initialized');
        return null;
    }

    try {
        // You need to get VAPID key from Firebase Console > Project Settings > Cloud Messaging
        const vapidKey = window.FIREBASE_VAPID_KEY || window.ENV_FIREBASE_VAPID_KEY;

        if (!vapidKey) {
            console.warn('[Notifications] VAPID key not configured. Add FIREBASE_VAPID_KEY to env.js');
            // Still try to get token without VAPID for development
        }

        const token = await notificationsState.messaging.getToken({
            vapidKey: vapidKey,
            serviceWorkerRegistration: await navigator.serviceWorker.ready
        });

        notificationsState.token = token;
        console.log('[Notifications] FCM Token:', token);
        return token;
    } catch (error) {
        console.error('[Notifications] Token error:', error);
        return null;
    }
}

// Save user's push token to Firebase
async function saveUserPushToken(token) {
    try {
        const user = JSON.parse(localStorage.getItem('ascendance_user') || '{}');
        if (!user.id && !user.odooId) {
            console.warn('[Notifications] No user logged in');
            return;
        }

        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            const userId = user.id || user.odooId;

            // Save to user's document
            await db.collection('employees').doc(userId).update({
                pushToken: token,
                pushTokenUpdated: new Date().toISOString(),
                notificationsEnabled: true
            });

            // Also save to push_tokens collection for easy querying
            await db.collection('push_tokens').doc(token).set({
                token: token,
                odooId: user.odooId || null,
                name: user.name || 'Unknown',
                email: user.email || null,
                role: user.role || 'employee',
                storeId: user.storeId || null,
                storeName: user.storeName || null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                platform: detectPlatform(),
                userAgent: navigator.userAgent
            }, { merge: true });

            console.log('[Notifications] Token saved to Firebase');
        }
    } catch (error) {
        console.error('[Notifications] Error saving token:', error);
    }
}

// Detect platform
function detectPlatform() {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    if (/Windows/.test(ua)) return 'windows';
    if (/Mac/.test(ua)) return 'mac';
    return 'web';
}

// Show notification in foreground (when app is open)
function showForegroundNotification(payload) {
    const title = payload.notification?.title || payload.data?.title || 'Ascendance';
    const body = payload.notification?.body || payload.data?.body || '';
    const type = payload.data?.type || 'info';

    // Show in-app toast
    showNotificationToast(`${title}: ${body}`, type === 'clockin_reminder' || type === 'clockout_reminder' ? 'warning' : 'info');

    // Also show browser notification if permitted
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: '/img/AH.png',
            badge: '/img/AH.png',
            tag: payload.data?.tag || 'ascendance-foreground',
            data: payload.data
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
            handleNotificationAction(payload.data);
        };
    }
}

// Handle notification action
function handleNotificationAction(data) {
    if (!data) return;

    if (data.page && typeof window.navigateTo === 'function') {
        window.navigateTo(data.page);
    } else if (data.url) {
        window.location.href = data.url;
    }
}

// Show notification toast (in-app)
function showNotificationToast(message, type = 'info') {
    // Use existing toast function if available
    if (typeof showTransferToast === 'function') {
        showTransferToast(message, type);
        return;
    }

    // Fallback toast
    const toast = document.createElement('div');
    toast.className = 'notification-toast';

    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#6366f1'
    };

    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 14px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 10001;
        animation: slideIn 0.3s ease-out;
        max-width: 350px;
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ==========================================
// SEND NOTIFICATIONS (Server-side required)
// These functions prepare the notification data
// Actual sending requires Firebase Cloud Functions
// ==========================================

// Send notification to specific user
async function sendNotificationToUser(userId, notification) {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();

            // Queue notification for Cloud Function to process
            await db.collection('notification_queue').add({
                type: 'single',
                targetUserId: userId,
                notification: notification,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('[Notifications] Queued notification for user:', userId);
            return true;
        }
    } catch (error) {
        console.error('[Notifications] Error queuing notification:', error);
        return false;
    }
}

// Send notification to all users with specific role
async function sendNotificationToRole(role, notification) {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();

            await db.collection('notification_queue').add({
                type: 'role',
                targetRole: role,
                notification: notification,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('[Notifications] Queued notification for role:', role);
            return true;
        }
    } catch (error) {
        console.error('[Notifications] Error queuing notification:', error);
        return false;
    }
}

// Send notification to specific store
async function sendNotificationToStore(storeId, notification) {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();

            await db.collection('notification_queue').add({
                type: 'store',
                targetStoreId: storeId,
                notification: notification,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('[Notifications] Queued notification for store:', storeId);
            return true;
        }
    } catch (error) {
        console.error('[Notifications] Error queuing notification:', error);
        return false;
    }
}

// Send notification to all employees
async function sendNotificationToAll(notification) {
    return sendNotificationToRole('employee', notification);
}

// ==========================================
// SCHEDULED NOTIFICATIONS
// ==========================================

// Schedule clock-in reminder (call this from schedule module)
async function scheduleClockInReminder(employeeId, shiftStartTime, shiftDate) {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();

            // Calculate reminder time (15 minutes before shift)
            const shiftDateTime = new Date(`${shiftDate}T${shiftStartTime}`);
            const reminderTime = new Date(shiftDateTime.getTime() - 15 * 60 * 1000);

            await db.collection('scheduled_notifications').add({
                type: 'clockin_reminder',
                employeeId: employeeId,
                scheduledFor: reminderTime.toISOString(),
                shiftStart: shiftDateTime.toISOString(),
                notification: {
                    title: 'Clock In Reminder',
                    body: `Your shift starts at ${shiftStartTime}. Don't forget to clock in!`,
                    type: 'clockin_reminder',
                    page: 'clockin'
                },
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('[Notifications] Scheduled clock-in reminder for:', employeeId);
        }
    } catch (error) {
        console.error('[Notifications] Error scheduling reminder:', error);
    }
}

// Schedule clock-out reminder
async function scheduleClockOutReminder(employeeId, shiftEndTime, shiftDate) {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();

            const shiftDateTime = new Date(`${shiftDate}T${shiftEndTime}`);
            // Reminder 5 minutes after shift end if not clocked out
            const reminderTime = new Date(shiftDateTime.getTime() + 5 * 60 * 1000);

            await db.collection('scheduled_notifications').add({
                type: 'clockout_reminder',
                employeeId: employeeId,
                scheduledFor: reminderTime.toISOString(),
                shiftEnd: shiftDateTime.toISOString(),
                notification: {
                    title: 'Clock Out Reminder',
                    body: `Your shift ended at ${shiftEndTime}. Don't forget to clock out!`,
                    type: 'clockout_reminder',
                    page: 'clockin'
                },
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('[Notifications] Scheduled clock-out reminder for:', employeeId);
        }
    } catch (error) {
        console.error('[Notifications] Error scheduling reminder:', error);
    }
}

// Send weekly schedule notification (Sundays)
async function sendWeeklyScheduleNotification() {
    const notification = {
        title: 'Weekly Schedule Available',
        body: 'Your schedule for this week has been posted. Tap to view.',
        type: 'schedule',
        page: 'schedule'
    };

    return sendNotificationToRole('employee', notification);
}

// ==========================================
// MANUAL NOTIFICATIONS (Admin)
// ==========================================

// Send custom notification (admin only)
async function sendCustomNotification(title, body, targetType, targetId) {
    const notification = {
        title: title,
        body: body,
        type: 'announcement',
        page: 'announcements'
    };

    switch (targetType) {
        case 'all':
            return sendNotificationToAll(notification);
        case 'role':
            return sendNotificationToRole(targetId, notification);
        case 'store':
            return sendNotificationToStore(targetId, notification);
        case 'user':
            return sendNotificationToUser(targetId, notification);
        default:
            return sendNotificationToAll(notification);
    }
}

// ==========================================
// UI COMPONENTS
// ==========================================

// Render notification settings button
function renderNotificationButton() {
    const permission = Notification.permission;
    const isEnabled = permission === 'granted';
    const isDenied = permission === 'denied';

    return `
        <button onclick="toggleNotifications()" class="notification-toggle-btn" style="
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: ${isEnabled ? 'linear-gradient(135deg, #10b981, #059669)' : isDenied ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)'};
            color: ${isDenied ? 'var(--text-muted)' : 'white'};
            border: none;
            border-radius: 10px;
            cursor: ${isDenied ? 'not-allowed' : 'pointer'};
            font-weight: 600;
            font-size: 13px;
        " ${isDenied ? 'disabled title="Notifications blocked. Enable in browser settings."' : ''}>
            <i class="fas ${isEnabled ? 'fa-bell' : isDenied ? 'fa-bell-slash' : 'fa-bell'}"></i>
            ${isEnabled ? 'Notifications On' : isDenied ? 'Blocked' : 'Enable Notifications'}
        </button>
    `;
}

// Toggle notifications
async function toggleNotifications() {
    if (Notification.permission === 'denied') {
        showNotificationToast('Notificaciones bloqueadas. Ve a configuración del navegador para activarlas.', 'warning');
        return;
    }

    if (Notification.permission === 'granted') {
        // Already enabled, could show settings
        showNotificationToast('Notificaciones ya están activadas', 'info');
        return;
    }

    await requestNotificationPermission();
    updateNotificationButtonUI();
}

// Test notification - sends via FCM Cloud Function for real end-to-end test
async function testNotification() {
    console.log('[Test] Starting FCM notification test...');
    console.log('[Test] Current permission:', Notification.permission);

    // Check permission
    if (Notification.permission === 'denied') {
        showNotificationToast('Notificaciones bloqueadas. Ve a Configuración del navegador.', 'error');
        alert('Las notificaciones están BLOQUEADAS.\n\nPara activarlas:\n1. Click en el candado en la barra de direcciones\n2. Busca "Notificaciones"\n3. Cambia a "Permitir"');
        return;
    }

    if (Notification.permission !== 'granted') {
        console.log('[Test] Requesting permission...');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            showNotificationToast('Permiso denegado.', 'warning');
            return;
        }
    }

    try {
        // Get current user
        const user = JSON.parse(localStorage.getItem('ascendance_user') || '{}');
        console.log('[Test] User:', user.name, user.email);

        // Ensure we have a token
        if (!notificationsState.token) {
            console.log('[Test] No token, getting one...');
            await initializeNotifications();
            const token = await getFCMToken();
            if (token) {
                await saveUserPushToken(token);
                console.log('[Test] Token saved:', token.substring(0, 20) + '...');
            }
        }

        // Check if token exists in Firestore
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();

            // First, make sure we have a valid token
            let currentToken = notificationsState.token;
            if (!currentToken) {
                console.log('[Test] Getting new FCM token...');
                currentToken = await getFCMToken();
            }

            if (!currentToken) {
                console.error('[Test] Could not get FCM token');
                showNotificationToast('Error obteniendo token FCM. Revisa la consola.', 'error');
                return;
            }

            console.log('[Test] Current token:', currentToken.substring(0, 30) + '...');

            // Save token to Firestore
            console.log('[Test] Saving token to Firestore...');
            await db.collection('push_tokens').doc(currentToken.substring(0, 50)).set({
                token: currentToken,
                odooId: user.odooId || user.id || null,
                name: user.name || 'Unknown',
                email: user.email || null,
                role: user.role || 'employee',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                platform: /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'ios' :
                         /Android/.test(navigator.userAgent) ? 'android' : 'web'
            }, { merge: true });
            console.log('[Test] Token saved!');

            const savedToken = currentToken;

            // Create test notification in queue (triggers Cloud Function)
            const notificationDoc = await db.collection('notification_queue').add({
                type: 'test',
                targetType: 'specific_user',
                targetEmail: user.email,
                notification: {
                    title: 'Test de Ascendance',
                    body: 'Si ves esto, FCM funciona correctamente!',
                    type: 'test',
                    page: 'dashboard'
                },
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: user.email
            });

            console.log('[Test] Notification queued:', notificationDoc.id);
            showNotificationToast('Notificación enviada via FCM. Espera 5-10 segundos...', 'success');

            // Also show local notification as backup
            setTimeout(async () => {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    await registration.showNotification('Test Local - Ascendance', {
                        body: 'Esta es la notificación local de respaldo',
                        icon: '/img/AH.png',
                        tag: 'test-local-' + Date.now()
                    });
                } catch (e) {
                    console.warn('[Test] Local backup failed:', e);
                }
            }, 2000);
        }
    } catch (error) {
        console.error('[Test] Error:', error);
        showNotificationToast('Error: ' + error.message, 'error');
    }
}

// Update notification button in user menu
function updateNotificationButtonUI() {
    const btn = document.getElementById('notificationToggleBtn');
    const text = document.getElementById('notificationToggleText');
    const icon = btn?.querySelector('i');

    if (!btn || !text) return;

    const permission = Notification.permission;

    if (permission === 'granted') {
        text.textContent = 'Notifications On';
        if (icon) {
            icon.className = 'fas fa-bell';
            icon.style.color = '#10b981';
        }
        btn.style.color = '#10b981';
    } else if (permission === 'denied') {
        text.textContent = 'Notifications Blocked';
        if (icon) {
            icon.className = 'fas fa-bell-slash';
            icon.style.color = '#ef4444';
        }
        btn.style.color = '#ef4444';
    } else {
        text.textContent = 'Enable Notifications';
        if (icon) {
            icon.className = 'fas fa-bell';
            icon.style.color = '';
        }
        btn.style.color = '';
    }
}

// ==========================================
// INITIALIZATION
// ==========================================

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', async () => {
    // Small delay to let Firebase initialize first
    setTimeout(async () => {
        await initializeNotifications();

        // Update UI based on current permission
        updateNotificationButtonUI();

        // If already granted, get token
        if (Notification.permission === 'granted') {
            await getFCMToken();
        }
    }, 2000);
});

// Listen for notification clicks from service worker
navigator.serviceWorker?.addEventListener('message', (event) => {
    if (event.data?.type === 'NOTIFICATION_CLICK') {
        handleNotificationAction(event.data.data);
    }
});

// Expose functions globally
window.initializeNotifications = initializeNotifications;
window.requestNotificationPermission = requestNotificationPermission;
window.sendNotificationToUser = sendNotificationToUser;
window.sendNotificationToRole = sendNotificationToRole;
window.sendNotificationToStore = sendNotificationToStore;
window.sendNotificationToAll = sendNotificationToAll;
window.sendCustomNotification = sendCustomNotification;
window.scheduleClockInReminder = scheduleClockInReminder;
window.scheduleClockOutReminder = scheduleClockOutReminder;
window.sendWeeklyScheduleNotification = sendWeeklyScheduleNotification;
window.renderNotificationButton = renderNotificationButton;
window.toggleNotifications = toggleNotifications;
window.showNotificationToast = showNotificationToast;
window.updateNotificationButtonUI = updateNotificationButtonUI;
window.testNotification = testNotification;
