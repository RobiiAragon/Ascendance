/**
 * Firebase Sync Manager
 * Handles synchronization of users and employees with Firebase Firestore
 */

class FirebaseSyncManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase connection
     */
    async initialize() {
        try {
            if (typeof firebase === 'undefined' || !firebase.initializeApp) {
                console.error('Firebase SDK not loaded');
                return false;
            }

            const config = window.FIREBASE_CONFIG;
            if (!config) {
                console.error('Firebase config not found');
                return false;
            }

            // Check if already initialized
            if (firebase.apps && firebase.apps.length > 0) {
                this.db = firebase.firestore();
                this.isInitialized = true;
                console.log('Firebase already initialized');
                return true;
            }

            firebase.initializeApp(config);
            this.db = firebase.firestore();
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing Firebase:', error);
            return false;
        }
    }

    /**
     * Sync users to Firestore
     */
    async syncUsersToFirestore() {
        if (!this.isInitialized) {
            console.error('Firebase not initialized');
            return false;
        }

        try {
            const usersDB = window.USERS_DATABASE;
            if (!usersDB) {
                console.error('USERS_DATABASE not found in config');
                return false;
            }

            const usersCollection = window.FIREBASE_COLLECTIONS?.users || 'users';
            const promises = [];

            for (const [email, user] of Object.entries(usersDB)) {
                // Prepare user data for Firestore (exclude password in production)
                const userData = {
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    employeeType: user.employeeType,
                    store: user.store,
                    status: user.status,
                    hireDate: user.hireDate,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    // Note: Never store plain passwords in production!
                    // Use Firebase Authentication instead
                };

                // Set or merge document
                promises.push(
                    this.db.collection(usersCollection).doc(user.id).set(userData, { merge: true })
                );
            }

            await Promise.all(promises);
            console.log('✅ Users synced to Firestore successfully');
            return true;
        } catch (error) {
            console.error('Error syncing users to Firestore:', error);
            return false;
        }
    }

    /**
     * Sync employees to Firestore
     */
    async syncEmployeesToFirestore(employees) {
        if (!this.isInitialized) {
            console.error('Firebase not initialized');
            return false;
        }

        try {
            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            const promises = [];

            for (const employee of employees) {
                const employeeData = {
                    ...employee,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                // Remove firestoreId if it exists
                delete employeeData.firestoreId;

                promises.push(
                    this.db.collection(employeesCollection).add(employeeData)
                );
            }

            const results = await Promise.all(promises);
            console.log(`✅ ${results.length} employees synced to Firestore successfully`);
            return true;
        } catch (error) {
            console.error('Error syncing employees to Firestore:', error);
            return false;
        }
    }

    /**
     * Load users from Firestore
     */
    async loadUsersFromFirestore() {
        if (!this.isInitialized) {
            console.error('Firebase not initialized');
            return [];
        }

        try {
            const usersCollection = window.FIREBASE_COLLECTIONS?.users || 'users';
            const snapshot = await this.db.collection(usersCollection).get();
            
            const users = [];
            snapshot.forEach(doc => {
                users.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            console.log(`✅ Loaded ${users.length} users from Firestore`);
            return users;
        } catch (error) {
            console.error('Error loading users from Firestore:', error);
            return [];
        }
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email) {
        if (!this.isInitialized) {
            console.error('Firebase not initialized');
            return null;
        }

        try {
            const usersCollection = window.FIREBASE_COLLECTIONS?.users || 'users';
            const snapshot = await this.db.collection(usersCollection)
                .where('email', '==', email)
                .limit(1)
                .get();

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error('Error getting user by email:', error);
            return null;
        }
    }

    /**
     * Get users by role
     */
    async getUsersByRole(role) {
        if (!this.isInitialized) {
            console.error('Firebase not initialized');
            return [];
        }

        try {
            const usersCollection = window.FIREBASE_COLLECTIONS?.users || 'users';
            const snapshot = await this.db.collection(usersCollection)
                .where('role', '==', role)
                .get();

            const users = [];
            snapshot.forEach(doc => {
                users.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return users;
        } catch (error) {
            console.error('Error getting users by role:', error);
            return [];
        }
    }

    /**
     * Delete all users (for testing)
     */
    async deleteAllUsers() {
        if (!this.isInitialized) {
            console.error('Firebase not initialized');
            return false;
        }

        try {
            const usersCollection = window.FIREBASE_COLLECTIONS?.users || 'users';
            const snapshot = await this.db.collection(usersCollection).get();
            
            const batch = this.db.batch();
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            console.log('✅ All users deleted from Firestore');
            return true;
        } catch (error) {
            console.error('Error deleting users:', error);
            return false;
        }
    }

    /**
     * Reset users to default sample data
     */
    async resetUsersToDefaults() {
        try {
            // Delete all existing users
            await this.deleteAllUsers();

            // Sync default users
            await this.syncUsersToFirestore();

            console.log('✅ Users reset to default sample data');
            return true;
        } catch (error) {
            console.error('Error resetting users:', error);
            return false;
        }
    }

    // ==================== RISK NOTES ====================

    /**
     * Save a risk note to Firestore
     */
    async saveRiskNoteToFirestore(note) {
        if (!this.isInitialized) {
            console.error('Firebase not initialized');
            return null;
        }

        try {
            const riskNotesCollection = window.FIREBASE_COLLECTIONS?.riskNotes || 'riskNotes';
            const noteData = {
                ...note,
                updatedAt: new Date()
            };

            // If note has firestoreId, update existing document
            if (note.firestoreId) {
                await this.db.collection(riskNotesCollection).doc(note.firestoreId).set(noteData, { merge: true });
                console.log('✅ Risk note updated in Firestore');
                return note.firestoreId;
            } else {
                // Create new document
                noteData.createdAt = new Date();
                const docRef = await this.db.collection(riskNotesCollection).add(noteData);
                console.log('✅ Risk note saved to Firestore:', docRef.id);
                return docRef.id;
            }
        } catch (error) {
            console.error('Error saving risk note to Firestore:', error);
            return null;
        }
    }

    /**
     * Delete a risk note from Firestore
     */
    async deleteRiskNoteFromFirestore(firestoreId) {
        if (!this.isInitialized) {
            console.error('Firebase not initialized');
            return false;
        }

        try {
            const riskNotesCollection = window.FIREBASE_COLLECTIONS?.riskNotes || 'riskNotes';
            await this.db.collection(riskNotesCollection).doc(firestoreId).delete();
            console.log('✅ Risk note deleted from Firestore');
            return true;
        } catch (error) {
            console.error('Error deleting risk note from Firestore:', error);
            return false;
        }
    }

    /**
     * Load all risk notes from Firestore
     */
    async loadRiskNotesFromFirestore() {
        if (!this.isInitialized) {
            console.error('Firebase not initialized');
            return [];
        }

        try {
            const riskNotesCollection = window.FIREBASE_COLLECTIONS?.riskNotes || 'riskNotes';
            const snapshot = await this.db.collection(riskNotesCollection)
                .orderBy('date', 'desc')
                .get();

            const notes = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                notes.push({
                    ...data,
                    firestoreId: doc.id,
                    // Convert Firestore timestamps to ISO strings
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
                });
            });

            console.log(`✅ Loaded ${notes.length} risk notes from Firestore`);
            return notes;
        } catch (error) {
            console.error('Error loading risk notes from Firestore:', error);
            return [];
        }
    }

    /**
     * Sync local risk notes to Firestore (for migration)
     */
    async syncLocalRiskNotesToFirestore(localNotes) {
        if (!this.isInitialized) {
            console.error('Firebase not initialized');
            return false;
        }

        try {
            const riskNotesCollection = window.FIREBASE_COLLECTIONS?.riskNotes || 'riskNotes';
            const promises = [];

            for (const note of localNotes) {
                if (!note.firestoreId) {
                    const noteData = {
                        ...note,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    promises.push(this.db.collection(riskNotesCollection).add(noteData));
                }
            }

            const results = await Promise.all(promises);
            console.log(`✅ ${results.length} local risk notes synced to Firestore`);
            return true;
        } catch (error) {
            console.error('Error syncing local risk notes to Firestore:', error);
            return false;
        }
    }
}

// Initialize global Firebase sync manager
const firebaseSyncManager = new FirebaseSyncManager();

// Auto-initialize when DOM is ready
(async function initFirebaseSyncManager() {
    // Wait for Firebase SDK to be loaded
    const waitForFirebase = () => {
        return new Promise((resolve) => {
            if (typeof firebase !== 'undefined' && firebase.initializeApp) {
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
                // Timeout after 10 seconds
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve();
                }, 10000);
            }
        });
    };

    await waitForFirebase();

    // Initialize the sync manager
    const initialized = await firebaseSyncManager.initialize();
    if (initialized) {
        // Dispatch event to notify other scripts
        window.dispatchEvent(new CustomEvent('firebaseSyncReady'));
    }
})();
