/**
 * Gconomics Firebase Integration
 * Handles synchronization of expenses with Firebase Firestore
 * Uses top-level 'gconomics' collection for easy visibility
 */

class GconomicsFirebaseManager {
    constructor() {
        this.db = null;
        this.storage = null;
        this.currentUser = null;
        this.isInitialized = false;
        this.collectionName = 'gconomics';
        this.syncInProgress = false;
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
                try {
                    this.storage = firebase.storage();
                } catch (err) {
                    console.warn('Firebase Storage not available:', err);
                }
                this.isInitialized = true;
                
                // Verify collection exists by creating it if empty
                await this.ensureCollectionExists();
                return true;
            }

            firebase.initializeApp(config);
            this.db = firebase.firestore();
            try {
                this.storage = firebase.storage();
            } catch (err) {
                console.warn('Firebase Storage not available:', err);
            }
            this.isInitialized = true;
            
            // Ensure collection exists
            await this.ensureCollectionExists();
            return true;
        } catch (error) {
            console.error('Error initializing Gconomics Firebase:', error);
            return false;
        }
    }

    /**
     * Ensure the gconomics collection exists by creating a test document
     */
    async ensureCollectionExists() {
        try {
            if (!this.db) {
                console.warn('Database not initialized');
                return false;
            }

            // Try to read from collection to verify it exists
            const snapshot = await this.db.collection(this.collectionName).limit(1).get();
            return true;
        } catch (error) {
            console.warn('Collection check failed, will create on first write:', error);
            return true; // We'll create it when we save
        }
    }

    /**
     * Set current user (usually from auth manager)
     */
    setCurrentUser(userId, userEmail) {
        this.currentUser = {
            id: userId,
            email: userEmail
        };
    }

    /**
     * Sync all expenses to Firestore
     */
    async syncExpensesToFirestore(expenses) {
        if (!this.isInitialized || !this.currentUser) {
            console.warn('Firebase not initialized or user not set');
            return false;
        }

        if (this.syncInProgress) {
            console.warn('Sync already in progress');
            return false;
        }

        this.syncInProgress = true;

        try {
            const promises = [];

            for (const expense of expenses) {
                const expenseData = {
                    ...expense,
                    odooId: expense.id,
                    odooUserId: this.currentUser.id,
                    userEmail: this.currentUser.email,
                    syncedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                // Remove undefined values
                Object.keys(expenseData).forEach(key => {
                    if (expenseData[key] === undefined) {
                        delete expenseData[key];
                    }
                });

                promises.push(
                    this.db.collection(this.collectionName)
                        .doc(expense.id)
                        .set(expenseData, { merge: true })
                );
            }

            await Promise.all(promises);
            this.syncInProgress = false;
            return true;
        } catch (error) {
            console.error('Error syncing expenses to Firestore:', error);
            this.syncInProgress = false;
            return false;
        }
    }

    /**
     * Save single expense to Firestore
     */
    async saveExpenseToFirestore(expense) {
        if (!this.isInitialized) {
            console.warn('Firebase not initialized, attempting to initialize...');
            // Try to initialize
            const initialized = await this.initialize();
            if (!initialized) {
                console.error('Failed to initialize Firebase');
                return false;
            }
        }

        if (!this.currentUser) {
            console.warn('Current user not set, using guest');
            this.currentUser = { id: 'guest', email: 'guest@ascendance.local' };
        }

        if (!this.db) {
            console.error('Firestore database not available');
            return false;
        }

        try {
            const expenseData = {
                ...expense,
                odooId: expense.id,
                odooUserId: this.currentUser.id,
                userEmail: this.currentUser.email,
                syncedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Remove undefined values
            Object.keys(expenseData).forEach(key => {
                if (expenseData[key] === undefined) {
                    delete expenseData[key];
                }
            });

            console.log('Saving expense to Firestore:', expense.id, 'Collection:', this.collectionName);
            console.log('Expense data:', expenseData);

            // Write to Firestore
            const result = await this.db.collection(this.collectionName)
                .doc(expense.id)
                .set(expenseData, { merge: true });

            return true;
        } catch (error) {
            console.error('Error saving expense to Firestore:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            // Log detailed error info
            if (error.code === 'permission-denied') {
                console.error('❌ Permission denied - check Firestore rules');
            } else if (error.code === 'not-found') {
                console.error('❌ Database not found - check Firebase configuration');
            }
            
            return false;
        }
    }

    /**
     * Delete expense from Firestore
     */
    async deleteExpenseFromFirestore(expenseId) {
        if (!this.isInitialized) {
            console.warn('Firebase not initialized');
            return false;
        }

        try {
            await this.db.collection(this.collectionName)
                .doc(expenseId)
                .delete();

            return true;
        } catch (error) {
            console.error('Error deleting expense from Firestore:', error);
            return false;
        }
    }

    /**
     * Load expenses from Firestore for current user
     */
    async loadExpensesFromFirestore() {
        if (!this.isInitialized) {
            console.warn('Firebase not initialized');
            return [];
        }

        try {
            // First try to load user-specific expenses
            let snapshot;
            if (this.currentUser && this.currentUser.id) {
                snapshot = await this.db.collection(this.collectionName)
                    .where('odooUserId', '==', this.currentUser.id)
                    .get();
            }

            // If no user-specific expenses found, load all expenses
            if (!snapshot || snapshot.empty) {
                console.log('Loading all expenses from collection...');
                snapshot = await this.db.collection(this.collectionName).get();
            }

            const expenses = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                expenses.push({
                    ...data,
                    id: data.id || doc.id,
                    firestoreId: doc.id
                });
            });

            return expenses;
        } catch (error) {
            console.error('Error loading expenses from Firestore:', error);
            return [];
        }
    }

    /**
     * Load expenses for specific month from Firestore
     */
    async loadExpensesForMonth(monthString) {
        if (!this.isInitialized || !this.currentUser) {
            console.warn('Firebase not initialized or user not set');
            return [];
        }

        try {
            const snapshot = await this.db.collection(this.collectionName)
                .where('odooUserId', '==', this.currentUser.id)
                .where('date', '>=', monthString)
                .where('date', '<', this.getNextMonth(monthString))
                .get();

            const expenses = [];
            snapshot.forEach(doc => {
                expenses.push({
                    ...doc.data(),
                    id: doc.id,
                    firestoreId: doc.id
                });
            });

            return expenses;
        } catch (error) {
            console.error('Error loading monthly expenses from Firestore:', error);
            return [];
        }
    }

    /**
     * Get next month string
     */
    getNextMonth(monthString) {
        const [year, month] = monthString.split('-');
        const date = new Date(year, parseInt(month), 1);
        date.setMonth(date.getMonth() + 1);
        return date.toISOString().slice(0, 7);
    }

    /**
     * Listen to real-time updates for expenses
     */
    listenToExpenses(callback) {
        if (!this.isInitialized || !this.currentUser) {
            console.warn('Firebase not initialized or user not set');
            return null;
        }

        const unsubscribe = this.db.collection(this.collectionName)
            .where('odooUserId', '==', this.currentUser.id)
            .orderBy('date', 'desc')
            .onSnapshot(snapshot => {
                const expenses = [];
                snapshot.forEach(doc => {
                    expenses.push({
                        ...doc.data(),
                        id: doc.id,
                        firestoreId: doc.id
                    });
                });
                callback(expenses);
            }, error => {
                console.error('Error listening to expenses:', error);
            });

        return unsubscribe;
    }

    /**
     * Get expense statistics for a month
     */
    async getMonthlyStats(monthString) {
        if (!this.isInitialized || !this.currentUser) {
            console.warn('Firebase not initialized or user not set');
            return null;
        }

        try {
            const expenses = await this.loadExpensesForMonth(monthString);

            const stats = {
                total: 0,
                byCategory: {},
                count: expenses.length,
                expenses: expenses
            };

            expenses.forEach(exp => {
                stats.total += parseFloat(exp.amount) || 0;
                stats.byCategory[exp.category] = (stats.byCategory[exp.category] || 0) + parseFloat(exp.amount);
            });

            return stats;
        } catch (error) {
            console.error('Error getting monthly stats:', error);
            return null;
        }
    }

    /**
     * Sync local expenses with Firebase (bi-directional)
     */
    async syncWithFirebase(localExpenses) {
        if (!this.isInitialized) {
            console.warn('Firebase not initialized');
            return localExpenses;
        }

        try {
            // Get all Firebase expenses
            const firebaseExpenses = await this.loadExpensesFromFirestore();

            // Create maps for easier comparison using string IDs for consistency
            const localMap = new Map(localExpenses.map(e => [String(e.id), e]));
            const firebaseMap = new Map(firebaseExpenses.map(e => [String(e.id), e]));

            // Find expenses to upload (in local but not in Firebase, or newer)
            const toUpload = [];
            if (this.currentUser) {
                for (const [id, localExp] of localMap) {
                    const firebaseExp = firebaseMap.get(id);
                    if (!firebaseExp || new Date(localExp.updatedAt) > new Date(firebaseExp.updatedAt)) {
                        toUpload.push(localExp);
                    }
                }

                // Upload new/updated expenses
                if (toUpload.length > 0) {
                    await this.syncExpensesToFirestore(toUpload);
                }
            }

            // Merge Firebase expenses that don't exist locally
            const merged = [...localExpenses];
            for (const [id, firebaseExp] of firebaseMap) {
                if (!localMap.has(id)) {
                    merged.push(firebaseExp);
                }
            }

            return merged;
        } catch (error) {
            console.error('Error syncing with Firebase:', error);
            return localExpenses;
        }
    }

    /**
     * Check if user has expenses in Firebase
     */
    async hasExpenses() {
        if (!this.isInitialized || !this.currentUser) {
            console.warn('Firebase not initialized or user not set');
            return false;
        }

        try {
            const snapshot = await this.db.collection(this.collectionName)
                .where('odooUserId', '==', this.currentUser.id)
                .limit(1)
                .get();

            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking if user has expenses:', error);
            return false;
        }
    }

    /**
     * Export expenses as JSON
     */
    async exportExpensesAsJson() {
        if (!this.isInitialized || !this.currentUser) {
            console.warn('Firebase not initialized or user not set');
            return null;
        }

        try {
            const expenses = await this.loadExpensesFromFirestore();
            return {
                user: this.currentUser.email,
                exportDate: new Date().toISOString(),
                count: expenses.length,
                expenses: expenses
            };
        } catch (error) {
            console.error('Error exporting expenses:', error);
            return null;
        }
    }

    /**
     * Clear all expenses for user (WARNING: Irreversible)
     */
    async clearAllExpenses() {
        if (!this.isInitialized || !this.currentUser) {
            console.warn('Firebase not initialized or user not set');
            return false;
        }

        try {
            const snapshot = await this.db.collection(this.collectionName)
                .where('odooUserId', '==', this.currentUser.id)
                .get();

            const batch = this.db.batch();
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            return true;
        } catch (error) {
            console.error('Error clearing expenses:', error);
            return false;
        }
    }
}

// Create global instance
window.gconomicsFirebase = new GconomicsFirebaseManager();
