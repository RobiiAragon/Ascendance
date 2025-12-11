/**
 * Firebase Utilities
 * Handles Firebase Firestore operations for employees and roles management
 */

class FirebaseEmployeeManager {
    constructor() {
        this.db = null;
        this.currentUser = null;
        this.currentUserRole = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase
     */
    async initialize() {
        try {
            // Import Firebase modules
            if (typeof firebase !== 'undefined' && firebase.initializeApp) {
                const config = window.FIREBASE_CONFIG;
                
                // Check if already initialized
                if (!firebase.apps || firebase.apps.length === 0) {
                    firebase.initializeApp(config);
                }
                
                this.db = firebase.firestore();
                this.isInitialized = true;
                console.log('Firebase initialized successfully');
                return true;
            } else {
                console.error('Firebase not loaded. Make sure to include Firebase scripts in your HTML.');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase:', error);
            return false;
        }
    }

    /**
     * Load employees from Firestore
     * @returns {Promise<Array>} Array of employees with their roles
     */
    async loadEmployees() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase not initialized. Using fallback data.');
                return [];
            }

            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            const snapshot = await this.db.collection(employeesCollection).get();
            
            const employees = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                employees.push({
                    id: doc.id,
                    ...data,
                    firestoreId: doc.id
                });
            });

            console.log(`Loaded ${employees.length} employees from Firestore`);
            return employees;
        } catch (error) {
            console.error('Error loading employees from Firestore:', error);
            return [];
        }
    }

    /**
     * Load a specific employee by ID
     * @param {string} employeeId - Employee ID from Firestore
     * @returns {Promise<Object>} Employee data with role
     */
    async getEmployee(employeeId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase not initialized.');
                return null;
            }

            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            const doc = await this.db.collection(employeesCollection).doc(employeeId).get();
            
            if (doc.exists) {
                return {
                    id: doc.id,
                    ...doc.data(),
                    firestoreId: doc.id
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting employee:', error);
            return null;
        }
    }

    /**
     * Add new employee to Firestore
     * @param {Object} employeeData - Employee data to add
     * @returns {Promise<string>} New document ID
     */
    async addEmployee(employeeData, email = null, password = null) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return null;
            }

            // Set default role if not provided
            if (!employeeData.role) {
                employeeData.role = window.EMPLOYEE_ROLES?.EMPLOYEE || 'employee';
            }

            employeeData.createdAt = new Date();
            employeeData.updatedAt = new Date();

            // Create user in Firebase Authentication if email and password provided
            if (email && password) {
                try {
                    console.log('Creating Firebase Authentication user for:', email);
                    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                    const userId = userCredential.user.uid;
                    
                    // Add the Firebase Auth UID to the employee data
                    employeeData.firebaseUid = userId;
                    employeeData.authEmail = email;
                    
                    console.log('Firebase Auth user created with UID:', userId);
                } catch (authError) {
                    // Check if email already exists or other auth errors
                    if (authError.code === 'auth/email-already-in-use') {
                        throw new Error('Email already registered. Please use a different email or login with existing account.');
                    } else if (authError.code === 'auth/weak-password') {
                        throw new Error('Password is too weak. Please use a stronger password (minimum 6 characters).');
                    } else if (authError.code === 'auth/invalid-email') {
                        throw new Error('Invalid email format. Please provide a valid email address.');
                    } else {
                        throw new Error(`Authentication error: ${authError.message}`);
                    }
                }
            }

            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            const docRef = await this.db.collection(employeesCollection).add(employeeData);
            
            console.log('Employee added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding employee:', error);
            throw error; // Re-throw to let caller handle it
        }
    }

    /**
     * Update employee in Firestore
     * @param {string} employeeId - Employee Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateEmployee(employeeId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            await this.db.collection(employeesCollection).doc(employeeId).update(updateData);
            
            console.log('Employee updated:', employeeId);
            return true;
        } catch (error) {
            console.error('Error updating employee:', error);
            return false;
        }
    }

    /**
     * Delete employee from Firestore
     * @param {string} employeeId - Employee Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteEmployee(employeeId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return false;
            }

            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            await this.db.collection(employeesCollection).doc(employeeId).delete();
            
            console.log('Employee deleted:', employeeId);
            return true;
        } catch (error) {
            console.error('Error deleting employee:', error);
            return false;
        }
    }

    /**
     * Get employees by role
     * @param {string} role - Role to filter by (admin, manager, employee)
     * @returns {Promise<Array>} Filtered employees
     */
    async getEmployeesByRole(role) {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase not initialized.');
                return [];
            }

            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            const snapshot = await this.db.collection(employeesCollection)
                .where('role', '==', role)
                .get();
            
            const employees = [];
            snapshot.forEach(doc => {
                employees.push({
                    id: doc.id,
                    ...doc.data(),
                    firestoreId: doc.id
                });
            });

            return employees;
        } catch (error) {
            console.error('Error getting employees by role:', error);
            return [];
        }
    }

    /**
     * Update employee role
     * @param {string} employeeId - Employee Firestore ID
     * @param {string} newRole - New role (admin, manager, employee)
     * @returns {Promise<boolean>} Success status
     */
    async updateEmployeeRole(employeeId, newRole) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return false;
            }

            // Validate role
            const validRoles = Object.values(window.EMPLOYEE_ROLES || {});
            if (!validRoles.includes(newRole)) {
                console.error('Invalid role:', newRole);
                return false;
            }

            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            await this.db.collection(employeesCollection).doc(employeeId).update({
                role: newRole,
                updatedAt: new Date()
            });
            
            console.log('Employee role updated:', employeeId, 'to', newRole);
            return true;
        } catch (error) {
            console.error('Error updating employee role:', error);
            return false;
        }
    }

    /**
     * Set up real-time listener for employees
     * @param {Function} callback - Function to call when data changes
     * @returns {Function} Unsubscribe function
     */
    onEmployeesChange(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return null;
            }

            const employeesCollection = window.FIREBASE_COLLECTIONS?.employees || 'employees';
            return this.db.collection(employeesCollection).onSnapshot(snapshot => {
                const employees = [];
                snapshot.forEach(doc => {
                    employees.push({
                        id: doc.id,
                        ...doc.data(),
                        firestoreId: doc.id
                    });
                });
                callback(employees);
            }, error => {
                console.error('Error listening to employees:', error);
            });
        } catch (error) {
            console.error('Error setting up listener:', error);
            return null;
        }
    }

    /**
     * Check if user has permission
     * @param {string} permission - Permission to check (e.g., 'canEditAllEmployees')
     * @param {string} role - User's role
     * @returns {boolean} Whether user has permission
     */
    hasPermission(permission, role) {
        const rolePermissions = window.ROLE_PERMISSIONS?.[role];
        if (!rolePermissions) {
            return false;
        }
        return rolePermissions[permission] === true;
    }

    /**
     * Get role label
     * @param {string} role - Role key
     * @returns {string} Readable role label
     */
    getRoleLabel(role) {
        return window.ROLE_PERMISSIONS?.[role]?.label || role;
    }

    /**
     * Get role color (for UI purposes)
     * @param {string} role - Role key
     * @returns {string} Color code or CSS variable
     */
    getRoleColor(role) {
        const colors = {
            'admin': '#ef4444',      // Red
            'manager': '#f59e0b',    // Amber
            'employee': '#3b82f6'    // Blue
        };
        return colors[role] || '#6b7280';
    }
}

// Initialize global Firebase manager
const firebaseEmployeeManager = new FirebaseEmployeeManager();

/**
 * Firebase Thieves Manager
 * Handles Firebase Firestore operations for thieves database
 */
class FirebaseThievesManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase (uses shared Firebase instance)
     */
    async initialize() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                this.db = firebase.firestore();
                this.isInitialized = true;
                console.log('Firebase Thieves Manager initialized successfully');
                return true;
            } else {
                console.error('Firebase not loaded for Thieves Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Thieves Manager:', error);
            return false;
        }
    }

    /**
     * Load thieves from Firestore
     * @returns {Promise<Array>} Array of thief records
     */
    async loadThieves() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Thieves Manager not initialized. Using fallback data.');
                return [];
            }

            const thievesCollection = window.FIREBASE_COLLECTIONS?.thieves || 'thieves';
            const snapshot = await this.db.collection(thievesCollection)
                .orderBy('date', 'desc')
                .get();

            const thieves = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                thieves.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    name: data.name || '',
                    photo: data.photo || null,
                    date: data.date || '',
                    store: data.store || '',
                    crimeType: data.crimeType || '',
                    itemsStolen: data.itemsStolen || '',
                    estimatedValue: data.estimatedValue || 0,
                    description: data.description || '',
                    policeReport: data.policeReport || null,
                    banned: data.banned !== undefined ? data.banned : true
                });
            });

            console.log(`Loaded ${thieves.length} thief records from Firestore`);
            return thieves;
        } catch (error) {
            console.error('Error loading thieves from Firestore:', error);
            return [];
        }
    }

    /**
     * Add new thief record to Firestore
     * @param {Object} thiefData - Thief data to add
     * @returns {Promise<string>} New document ID
     */
    async addThief(thiefData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Thieves Manager not initialized.');
                return null;
            }

            thiefData.createdAt = new Date();
            thiefData.updatedAt = new Date();

            const thievesCollection = window.FIREBASE_COLLECTIONS?.thieves || 'thieves';
            const docRef = await this.db.collection(thievesCollection).add(thiefData);

            console.log('Thief record added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding thief record:', error);
            return null;
        }
    }

    /**
     * Update thief record in Firestore
     * @param {string} thiefId - Thief Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateThief(thiefId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Thieves Manager not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const thievesCollection = window.FIREBASE_COLLECTIONS?.thieves || 'thieves';
            await this.db.collection(thievesCollection).doc(thiefId).update(updateData);

            console.log('Thief record updated:', thiefId);
            return true;
        } catch (error) {
            console.error('Error updating thief record:', error);
            return false;
        }
    }

    /**
     * Delete thief record from Firestore
     * @param {string} thiefId - Thief Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteThief(thiefId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Thieves Manager not initialized.');
                return false;
            }

            const thievesCollection = window.FIREBASE_COLLECTIONS?.thieves || 'thieves';
            await this.db.collection(thievesCollection).doc(thiefId).delete();

            console.log('Thief record deleted:', thiefId);
            return true;
        } catch (error) {
            console.error('Error deleting thief record:', error);
            return false;
        }
    }
}

// Initialize global Firebase Thieves manager
const firebaseThievesManager = new FirebaseThievesManager();
