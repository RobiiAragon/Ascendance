/**
 * Gconomics Firebase Integration
 * Handles synchronization of expenses with Firebase Firestore
 */

class GconomicsFirebaseManager {
    constructor() {
        this.db = null;
        this.currentUser = null;
        this.isInitialized = false;
        this.collectionName = 'gconomics_expenses';
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
                this.isInitialized = true;
                console.log('✅ Gconomics Firebase already initialized');
                return true;
            }

            firebase.initializeApp(config);
            this.db = firebase.firestore();
            this.isInitialized = true;
            console.log('✅ Gconomics Firebase initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing Gconomics Firebase:', error);
            return false;
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
            const userExpensesRef = this.db.collection('users')
                .doc(this.currentUser.id)
                .collection(this.collectionName);

            const promises = [];

            for (const expense of expenses) {
                const expenseData = {
                    ...expense,
                    userId: this.currentUser.id,
                    userEmail: this.currentUser.email,
                    syncedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    localId: expense.id
                };

                promises.push(
                    userExpensesRef.doc(expense.id).set(expenseData, { merge: true })
                );
            }

            await Promise.all(promises);
            console.log(`✅ Synced ${expenses.length} expenses to Firestore`);
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
        if (!this.isInitialized || !this.currentUser) {
            console.warn('Firebase not initialized or user not set');
            return false;
        }

        try {
            const expenseData = {
                ...expense,
                userId: this.currentUser.id,
                userEmail: this.currentUser.email,
                syncedAt: firebase.firestore.FieldValue.serverTimestamp(),
                localId: expense.id
            };

            await this.db.collection('users')
                .doc(this.currentUser.id)
                .collection(this.collectionName)
                .doc(expense.id)
                .set(expenseData, { merge: true });

            console.log('✅ Expense saved to Firestore:', expense.id);
            return true;
        } catch (error) {
            console.error('Error saving expense to Firestore:', error);
            return false;
        }
    }

    /**
     * Delete expense from Firestore
     */
    async deleteExpenseFromFirestore(expenseId) {
        if (!this.isInitialized || !this.currentUser) {
            console.warn('Firebase not initialized or user not set');
            return false;
        }

        try {
            await this.db.collection('users')
                .doc(this.currentUser.id)
                .collection(this.collectionName)
                .doc(expenseId)
                .delete();

            console.log('✅ Expense deleted from Firestore:', expenseId);
            return true;
        } catch (error) {
            console.error('Error deleting expense from Firestore:', error);
            return false;
        }
    }

    /**
     * Load expenses from Firestore
     */
    async loadExpensesFromFirestore() {
        if (!this.isInitialized || !this.currentUser) {
            console.warn('Firebase not initialized or user not set');
            return [];
        }

        try {
            const snapshot = await this.db.collection('users')
                .doc(this.currentUser.id)
                .collection(this.collectionName)
                .get();

            const expenses = [];
            snapshot.forEach(doc => {
                expenses.push({
                    ...doc.data(),
                    id: doc.id
                });
            });

            console.log(`✅ Loaded ${expenses.length} expenses from Firestore`);
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
            const snapshot = await this.db.collection('users')
                .doc(this.currentUser.id)
                .collection(this.collectionName)
                .where('date', '>=', monthString)
                .where('date', '<', this.getNextMonth(monthString))
                .get();

            const expenses = [];
            snapshot.forEach(doc => {
                expenses.push({
                    ...doc.data(),
                    id: doc.id
                });
            });

            console.log(`✅ Loaded ${expenses.length} expenses for ${monthString} from Firestore`);
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

        const unsubscribe = this.db.collection('users')
            .doc(this.currentUser.id)
            .collection(this.collectionName)
            .orderBy('date', 'desc')
            .onSnapshot(snapshot => {
                const expenses = [];
                snapshot.forEach(doc => {
                    expenses.push({
                        ...doc.data(),
                        id: doc.id
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
        if (!this.isInitialized || !this.currentUser) {
            console.warn('Firebase not initialized or user not set');
            return localExpenses;
        }

        try {
            // Get all Firebase expenses
            const firebaseExpenses = await this.loadExpensesFromFirestore();
            
            // Create maps for easier comparison
            const localMap = new Map(localExpenses.map(e => [e.id, e]));
            const firebaseMap = new Map(firebaseExpenses.map(e => [e.id, e]));

            // Find expenses to upload (in local but not in Firebase, or newer)
            const toUpload = [];
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
            const snapshot = await this.db.collection('users')
                .doc(this.currentUser.id)
                .collection(this.collectionName)
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
            const snapshot = await this.db.collection('users')
                .doc(this.currentUser.id)
                .collection(this.collectionName)
                .get();

            const batch = this.db.batch();
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            console.log('✅ All expenses cleared from Firestore');
            return true;
        } catch (error) {
            console.error('Error clearing expenses:', error);
            return false;
        }
    }
}

// Create global instance
const gconomicsFirebase = new GconomicsFirebaseManager();
