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

/**
 * Firebase Clock In/Out Manager
 * Handles Firebase Firestore operations for clock in/out attendance records
 */
class FirebaseClockInManager {
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
                console.log('✅ Firebase Clock In Manager initialized successfully');
                return true;
            } else {
                console.error('Firebase not loaded for Clock In Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Clock In Manager:', error);
            return false;
        }
    }

    /**
     * Save clock in/out record to Firestore
     * @param {Object} clockRecord - Clock record data
     * @returns {Promise<Object>} Saved record with ID
     */
    async saveClockRecord(clockRecord) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Clock In Manager not initialized.');
                throw new Error('Firebase not initialized');
            }

            // Prepare record data
            const recordData = {
                employeeId: clockRecord.employeeId,
                employeeName: clockRecord.employeeName,
                employeeRole: clockRecord.employeeRole,
                store: clockRecord.store,
                date: clockRecord.date, // Store date as string (YYYY-MM-DD)
                timestamp: new Date(), // Server timestamp for ordering
                clockIn: clockRecord.clockIn || null,
                lunchStart: clockRecord.lunchStart || null,
                lunchEnd: clockRecord.lunchEnd || null,
                clockOut: clockRecord.clockOut || null,
                notes: clockRecord.notes || '',
                updatedAt: new Date()
            };

            const clockinCollection = window.FIREBASE_COLLECTIONS?.clockin || 'clockin';
            
            // Try to find existing record for this employee on this date
            const snapshot = await this.db.collection(clockinCollection)
                .where('employeeId', '==', clockRecord.employeeId)
                .where('date', '==', clockRecord.date)
                .get();

            let docRef;
            if (snapshot.empty) {
                // Create new record
                recordData.createdAt = new Date();
                docRef = await this.db.collection(clockinCollection).add(recordData);
                console.log('✅ New clock record created with ID:', docRef.id);
                return {
                    id: docRef.id,
                    ...recordData
                };
            } else {
                // Update existing record
                const existingDoc = snapshot.docs[0];
                await existingDoc.ref.update(recordData);
                console.log('✅ Clock record updated:', existingDoc.id);
                return {
                    id: existingDoc.id,
                    ...recordData
                };
            }
        } catch (error) {
            console.error('Error saving clock record to Firebase:', error);
            throw error;
        }
    }

    /**
     * Load clock in/out records from Firestore for a specific date
     * @param {string} date - Date string (YYYY-MM-DD format)
     * @returns {Promise<Array>} Array of clock records
     */
    async loadClockRecordsByDate(date) {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Clock In Manager not initialized. Using fallback data.');
                return [];
            }

            const clockinCollection = window.FIREBASE_COLLECTIONS?.clockin || 'clockin';
            const snapshot = await this.db.collection(clockinCollection)
                .where('date', '==', date)
                .get();

            const records = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                records.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    ...data
                });
            });

            // Sort by updatedAt in memory instead of in query
            records.sort((a, b) => {
                const timeA = a.updatedAt?.toDate?.() || new Date(0);
                const timeB = b.updatedAt?.toDate?.() || new Date(0);
                return timeB - timeA;
            });

            console.log(`✅ Loaded ${records.length} clock records from Firebase for date: ${date}`);
            return records;
        } catch (error) {
            console.error('Error loading clock records from Firestore:', error);
            return [];
        }
    }

    /**
     * Load clock in/out records for a specific employee
     * @param {string} employeeId - Employee ID
     * @param {string} startDate - Start date (YYYY-MM-DD format)
     * @param {string} endDate - End date (YYYY-MM-DD format)
     * @returns {Promise<Array>} Array of clock records
     */
    async loadEmployeeClockRecords(employeeId, startDate, endDate) {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Clock In Manager not initialized.');
                return [];
            }

            const clockinCollection = window.FIREBASE_COLLECTIONS?.clockin || 'clockin';
            const snapshot = await this.db.collection(clockinCollection)
                .where('employeeId', '==', employeeId)
                .get();

            const records = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // Filter by date range in memory
                if (data.date >= startDate && data.date <= endDate) {
                    records.push({
                        id: doc.id,
                        firestoreId: doc.id,
                        ...data
                    });
                }
            });

            // Sort by date in memory
            records.sort((a, b) => {
                return b.date.localeCompare(a.date);
            });

            console.log(`✅ Loaded ${records.length} clock records for employee: ${employeeId}`);
            return records;
        } catch (error) {
            console.error('Error loading employee clock records:', error);
            return [];
        }
    }

    /**
     * Delete clock record from Firestore
     * @param {string} recordId - Record Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteClockRecord(recordId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Clock In Manager not initialized.');
                return false;
            }

            const clockinCollection = window.FIREBASE_COLLECTIONS?.clockin || 'clockin';
            await this.db.collection(clockinCollection).doc(recordId).delete();

            console.log('✅ Clock record deleted:', recordId);
            return true;
        } catch (error) {
            console.error('Error deleting clock record:', error);
            return false;
        }
    }

    /**
     * Set up real-time listener for clock records of a specific date
     * @param {string} date - Date string (YYYY-MM-DD format)
     * @param {Function} callback - Function to call when data changes
     * @returns {Function} Unsubscribe function
     */
    onClockRecordsChange(date, callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Clock In Manager not initialized.');
                return null;
            }

            const clockinCollection = window.FIREBASE_COLLECTIONS?.clockin || 'clockin';
            return this.db.collection(clockinCollection)
                .where('date', '==', date)
                .onSnapshot(snapshot => {
                    const records = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        records.push({
                            id: doc.id,
                            firestoreId: doc.id,
                            ...data
                        });
                    });
                    callback(records);
                }, error => {
                    console.error('Error listening to clock records:', error);
                });
        } catch (error) {
            console.error('Error setting up clock records listener:', error);
            return null;
        }
    }
}

/**
 * Firebase Product Manager
 * Handles Firestore operations for products and image uploads to Storage
 */
class FirebaseProductManager {
    constructor() {
        this.db = null;
        this.storage = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase
     */
    async initialize() {
        try {
            if (typeof firebase !== 'undefined') {
                const config = window.FIREBASE_CONFIG;
                
                // Check if already initialized
                if (!firebase.apps || firebase.apps.length === 0) {
                    firebase.initializeApp(config);
                    console.log('✅ Firebase app initialized');
                }
                
                // Get references to Firestore and Storage
                this.db = firebase.firestore();
                
                // Initialize Firebase Storage - compat version
                try {
                    this.storage = firebase.storage();
                    console.log('✅ Firebase Storage initialized successfully');
                } catch (storageError) {
                    console.warn('⚠️ Firebase Storage initialization failed:', storageError.message);
                    console.warn('   Make sure Firebase Storage is enabled in your Firebase project');
                    console.warn('   Go to: https://console.firebase.google.com/ → Storage');
                    this.storage = null;
                }
                
                this.isInitialized = true;
                console.log('🛍️ Firebase Product Manager initialized');
                return true;
            } else {
                console.error('Firebase not loaded');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Product Manager:', error);
            return false;
        }
    }

    /**
     * Upload product image to Firebase Storage
     * @param {File} imageFile - Image file to upload
     * @param {string} productName - Product name for file naming
     * @returns {Promise<string>} Download URL of the uploaded image
     */
    async uploadProductImage(imageFile, productName) {
        try {
            if (!this.isInitialized) {
                console.error('Firebase not initialized');
                return null;
            }
            
            if (!this.storage) {
                console.error('Firebase Storage not available');
                return null;
            }

            if (!imageFile) {
                console.warn('No image file provided');
                return null;
            }

            // Create a unique filename
            const timestamp = Date.now();
            const sanitizedName = productName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const filename = `products/${sanitizedName}_${timestamp}.${imageFile.name.split('.').pop()}`;

            console.log(`📸 Uploading image: ${filename}`);

            // Upload to Storage
            const storageRef = this.storage.ref(filename);
            const snapshot = await storageRef.put(imageFile);

            // Get download URL
            const downloadUrl = await snapshot.ref.getDownloadURL();
            console.log(`✅ Image uploaded successfully: ${downloadUrl}`);

            return downloadUrl;
        } catch (error) {
            console.error('Error uploading product image:', error);
            return null;
        }
    }

    /**
     * Save product to Firestore
     * @param {Object} productData - Product data to save
     * @returns {Promise<Object>} Saved product with Firestore ID
     */
    async saveProduct(productData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firestore not initialized');
                return null;
            }

            const productsCollection = window.FIREBASE_COLLECTIONS?.products || 'products';

            // Add timestamp
            const dataWithTimestamp = {
                ...productData,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            console.log(`💾 Saving product to Firestore: ${productData.name}`);

            // Save to Firestore
            const docRef = await this.db.collection(productsCollection).add(dataWithTimestamp);

            console.log(`✅ Product saved successfully with ID: ${docRef.id}`);

            return {
                id: docRef.id,
                firestoreId: docRef.id,
                ...dataWithTimestamp
            };
        } catch (error) {
            console.error('Error saving product to Firestore:', error);
            return null;
        }
    }

    /**
     * Load all products from Firestore
     * @returns {Promise<Array>} Array of products
     */
    async loadProducts() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firestore not initialized');
                return [];
            }

            const productsCollection = window.FIREBASE_COLLECTIONS?.products || 'products';
            const snapshot = await this.db.collection(productsCollection).get();

            const products = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                products.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    ...data
                });
            });

            console.log(`📦 Loaded ${products.length} products from Firestore`);
            return products;
        } catch (error) {
            console.error('Error loading products from Firestore:', error);
            return [];
        }
    }

    /**
     * Get a single product by ID
     * @param {string} productId - Product ID from Firestore
     * @returns {Promise<Object>} Product data
     */
    async getProduct(productId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firestore not initialized');
                return null;
            }

            const productsCollection = window.FIREBASE_COLLECTIONS?.products || 'products';
            const doc = await this.db.collection(productsCollection).doc(productId).get();

            if (doc.exists) {
                return {
                    id: doc.id,
                    firestoreId: doc.id,
                    ...doc.data()
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting product:', error);
            return null;
        }
    }

    /**
     * Update a product in Firestore
     * @param {string} productId - Product ID from Firestore
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated product
     */
    async updateProduct(productId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firestore not initialized');
                return null;
            }

            const productsCollection = window.FIREBASE_COLLECTIONS?.products || 'products';

            const dataWithTimestamp = {
                ...updateData,
                updatedAt: new Date()
            };

            console.log(`✏️ Updating product: ${productId}`);

            await this.db.collection(productsCollection).doc(productId).update(dataWithTimestamp);

            console.log(`✅ Product updated successfully`);

            return await this.getProduct(productId);
        } catch (error) {
            console.error('Error updating product:', error);
            return null;
        }
    }

    /**
     * Delete a product from Firestore
     * @param {string} productId - Product ID from Firestore
     * @returns {Promise<boolean>} Success status
     */
    async deleteProduct(productId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firestore not initialized');
                return false;
            }

            const productsCollection = window.FIREBASE_COLLECTIONS?.products || 'products';

            console.log(`🗑️ Deleting product: ${productId}`);

            await this.db.collection(productsCollection).doc(productId).delete();

            console.log(`✅ Product deleted successfully`);
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            return false;
        }
    }

    /**
     * Set up real-time listener for products
     * @param {Function} callback - Function to call when products change
     * @returns {Function} Unsubscribe function
     */
    onProductsChange(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firestore not initialized');
                return null;
            }

            const productsCollection = window.FIREBASE_COLLECTIONS?.products || 'products';
            return this.db.collection(productsCollection).onSnapshot(snapshot => {
                const products = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    products.push({
                        id: doc.id,
                        firestoreId: doc.id,
                        ...data
                    });
                });
                callback(products);
            }, error => {
                console.error('Error listening to products:', error);
            });
        } catch (error) {
            console.error('Error setting up products listener:', error);
            return null;
        }
    }
}

// Initialize global Firebase Product Manager
const firebaseProductManager = new FirebaseProductManager();

// Initialize global Firebase Clock In Manager
const firebaseClockInManager = new FirebaseClockInManager();

/**
 * Firebase Training Manager
 * Handles Firebase Firestore and Storage operations for training materials
 */
class FirebaseTrainingManager {
    constructor() {
        this.db = null;
        this.storage = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Firebase (uses shared Firebase instance)
     */
    async initialize() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                this.db = firebase.firestore();
                this.storage = firebase.storage();
                this.isInitialized = true;
                console.log('Firebase Training Manager initialized successfully');
                return true;
            } else {
                console.error('Firebase not loaded for Training Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Training Manager:', error);
            return false;
        }
    }

    /**
     * Load trainings from Firestore
     * @returns {Promise<Array>} Array of training records
     */
    async loadTrainings() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Training Manager not initialized. Using fallback data.');
                return [];
            }

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';
            const snapshot = await this.db.collection(trainingsCollection)
                .orderBy('createdAt', 'desc')
                .get();

            const trainings = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                trainings.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    title: data.title || '',
                    type: data.type || 'video',
                    url: data.url || '',
                    fileUrl: data.fileUrl || null,
                    fileName: data.fileName || null,
                    fileSize: data.fileSize || null,
                    duration: data.duration || '30 min',
                    completion: data.completion || 0,
                    required: data.required !== undefined ? data.required : true,
                    description: data.description || '',
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                });
            });

            console.log(`Loaded ${trainings.length} training records from Firestore`);
            return trainings;
        } catch (error) {
            console.error('Error loading trainings from Firestore:', error);
            return [];
        }
    }

    /**
     * Upload file to Firebase Storage
     * @param {File} file - File to upload
     * @param {string} trainingId - Training ID for path organization
     * @returns {Promise<Object>} Upload result with URL and metadata
     */
    async uploadFile(file, trainingId = null) {
        try {
            if (!this.isInitialized || !this.storage) {
                throw new Error('Firebase Storage not initialized');
            }

            // Generate unique filename
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const path = `trainings/${trainingId || 'temp'}/${timestamp}_${safeName}`;

            const storageRef = this.storage.ref(path);

            // Upload file with progress tracking
            const uploadTask = storageRef.put(file);

            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Progress tracking
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log(`Upload progress: ${progress.toFixed(1)}%`);

                        // Dispatch custom event for progress UI
                        window.dispatchEvent(new CustomEvent('uploadProgress', {
                            detail: { progress, fileName: file.name }
                        }));
                    },
                    (error) => {
                        console.error('Upload error:', error);
                        reject(error);
                    },
                    async () => {
                        // Get download URL
                        const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();
                        resolve({
                            url: downloadUrl,
                            path: path,
                            fileName: file.name,
                            fileSize: file.size,
                            fileType: file.type
                        });
                    }
                );
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    /**
     * Add new training record to Firestore
     * @param {Object} trainingData - Training data to add
     * @param {File} file - Optional PDF file to upload
     * @returns {Promise<string>} New document ID
     */
    async addTraining(trainingData, file = null) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Training Manager not initialized.');
                return null;
            }

            // If there's a file, upload it first
            if (file) {
                const tempId = Date.now().toString();
                const uploadResult = await this.uploadFile(file, tempId);
                trainingData.fileUrl = uploadResult.url;
                trainingData.filePath = uploadResult.path;
                trainingData.fileName = uploadResult.fileName;
                trainingData.fileSize = uploadResult.fileSize;
                trainingData.fileType = uploadResult.fileType;
            }

            trainingData.createdAt = new Date();
            trainingData.updatedAt = new Date();

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';
            const docRef = await this.db.collection(trainingsCollection).add(trainingData);

            // If we uploaded to a temp path, we could move it here (optional optimization)
            console.log('Training record added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding training record:', error);
            throw error;
        }
    }

    /**
     * Update training record in Firestore
     * @param {string} trainingId - Training Firestore ID
     * @param {Object} updateData - Data to update
     * @param {File} newFile - Optional new PDF file to upload
     * @returns {Promise<boolean>} Success status
     */
    async updateTraining(trainingId, updateData, newFile = null) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Training Manager not initialized.');
                return false;
            }

            // If there's a new file, upload it
            if (newFile) {
                const uploadResult = await this.uploadFile(newFile, trainingId);
                updateData.fileUrl = uploadResult.url;
                updateData.filePath = uploadResult.path;
                updateData.fileName = uploadResult.fileName;
                updateData.fileSize = uploadResult.fileSize;
                updateData.fileType = uploadResult.fileType;
            }

            updateData.updatedAt = new Date();

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';
            await this.db.collection(trainingsCollection).doc(trainingId).update(updateData);

            console.log('Training record updated:', trainingId);
            return true;
        } catch (error) {
            console.error('Error updating training record:', error);
            return false;
        }
    }

    /**
     * Delete training record from Firestore (and associated file)
     * @param {string} trainingId - Training Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteTraining(trainingId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Training Manager not initialized.');
                return false;
            }

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';

            // Get the training to check for associated file
            const doc = await this.db.collection(trainingsCollection).doc(trainingId).get();
            if (doc.exists) {
                const data = doc.data();

                // Delete associated file from Storage if exists
                if (data.filePath && this.storage) {
                    try {
                        await this.storage.ref(data.filePath).delete();
                        console.log('Associated file deleted:', data.filePath);
                    } catch (fileError) {
                        console.warn('Could not delete associated file:', fileError);
                    }
                }
            }

            // Delete the Firestore document
            await this.db.collection(trainingsCollection).doc(trainingId).delete();

            console.log('Training record deleted:', trainingId);
            return true;
        } catch (error) {
            console.error('Error deleting training record:', error);
            return false;
        }
    }

    /**
     * Get a single training by ID
     * @param {string} trainingId - Training Firestore ID
     * @returns {Promise<Object>} Training data
     */
    async getTraining(trainingId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Training Manager not initialized.');
                return null;
            }

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';
            const doc = await this.db.collection(trainingsCollection).doc(trainingId).get();

            if (doc.exists) {
                const data = doc.data();
                return {
                    id: doc.id,
                    firestoreId: doc.id,
                    ...data
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting training:', error);
            return null;
        }
    }

    /**
     * Update training completion percentage
     * @param {string} trainingId - Training Firestore ID
     * @param {number} completion - Completion percentage (0-100)
     * @returns {Promise<boolean>} Success status
     */
    async updateCompletion(trainingId, completion) {
        try {
            if (!this.isInitialized || !this.db) {
                return false;
            }

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';
            await this.db.collection(trainingsCollection).doc(trainingId).update({
                completion: Math.min(100, Math.max(0, completion)),
                updatedAt: new Date()
            });

            return true;
        } catch (error) {
            console.error('Error updating completion:', error);
            return false;
        }
    }

    /**
     * Set up real-time listener for trainings
     * @param {Function} callback - Function to call when data changes
     * @returns {Function} Unsubscribe function
     */
    onTrainingsChange(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Training Manager not initialized.');
                return null;
            }

            const trainingsCollection = window.FIREBASE_COLLECTIONS?.trainings || 'trainings';
            return this.db.collection(trainingsCollection)
                .orderBy('createdAt', 'desc')
                .onSnapshot(snapshot => {
                    const trainings = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        trainings.push({
                            id: doc.id,
                            firestoreId: doc.id,
                            ...data
                        });
                    });
                    callback(trainings);
                }, error => {
                    console.error('Error listening to trainings:', error);
                });
        } catch (error) {
            console.error('Error setting up trainings listener:', error);
            return null;
        }
    }
}

/**
 * Firebase Vendors Manager
 * Handles Firestore operations for vendors management
 */
class FirebaseVendorsManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.vendorsListener = null;
    }

    /**
     * Initialize Firebase
     */
    async initialize() {
        try {
            if (typeof firebase !== 'undefined' && firebase.initializeApp) {
                const config = window.FIREBASE_CONFIG;
                
                if (!firebase.apps || firebase.apps.length === 0) {
                    firebase.initializeApp(config);
                }
                
                this.db = firebase.firestore();
                this.isInitialized = true;
                console.log('Firebase initialized successfully for Vendors');
                return true;
            } else {
                console.error('Firebase not loaded');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase:', error);
            return false;
        }
    }

    /**
     * Load vendors from Firestore
     * @returns {Promise<Array>} Array of vendors
     */
    async loadVendors() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase not initialized. Using fallback data.');
                return [];
            }

            const vendorsCollection = window.FIREBASE_COLLECTIONS?.vendors || 'vendors';
            const snapshot = await this.db.collection(vendorsCollection).get();
            
            const vendors = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                vendors.push({
                    firestoreId: doc.id,
                    ...data
                });
            });

            console.log(`Loaded ${vendors.length} vendors from Firestore`);
            return vendors;
        } catch (error) {
            console.error('Error loading vendors from Firestore:', error);
            return [];
        }
    }

    /**
     * Get a single vendor by Firestore ID
     * @param {string} vendorId - Vendor Firestore ID
     * @returns {Promise<Object>} Vendor data
     */
    async getVendor(vendorId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase not initialized.');
                return null;
            }

            const vendorsCollection = window.FIREBASE_COLLECTIONS?.vendors || 'vendors';
            const doc = await this.db.collection(vendorsCollection).doc(vendorId).get();
            
            if (doc.exists) {
                return {
                    firestoreId: doc.id,
                    ...doc.data()
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting vendor:', error);
            return null;
        }
    }

    /**
     * Add new vendor to Firestore
     * @param {Object} vendorData - Vendor data to add
     * @returns {Promise<string>} New document ID
     */
    async addVendor(vendorData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return null;
            }

            vendorData.createdAt = new Date();
            vendorData.updatedAt = new Date();

            const vendorsCollection = window.FIREBASE_COLLECTIONS?.vendors || 'vendors';
            const docRef = await this.db.collection(vendorsCollection).add(vendorData);
            
            console.log('Vendor added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding vendor:', error);
            throw error;
        }
    }

    /**
     * Update vendor in Firestore
     * @param {string} vendorId - Vendor Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateVendor(vendorId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const vendorsCollection = window.FIREBASE_COLLECTIONS?.vendors || 'vendors';
            await this.db.collection(vendorsCollection).doc(vendorId).update(updateData);
            
            console.log('Vendor updated:', vendorId);
            return true;
        } catch (error) {
            console.error('Error updating vendor:', error);
            return false;
        }
    }

    /**
     * Delete vendor from Firestore
     * @param {string} vendorId - Vendor Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteVendor(vendorId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase not initialized.');
                return false;
            }

            const vendorsCollection = window.FIREBASE_COLLECTIONS?.vendors || 'vendors';
            await this.db.collection(vendorsCollection).doc(vendorId).delete();
            
            console.log('Vendor deleted:', vendorId);
            return true;
        } catch (error) {
            console.error('Error deleting vendor:', error);
            return false;
        }
    }

    /**
     * Set up real-time listener for vendors
     * @param {Function} callback - Callback function when vendors change
     * @returns {Function} Unsubscribe function
     */
    setupVendorsListener(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase not initialized.');
                return null;
            }

            const vendorsCollection = window.FIREBASE_COLLECTIONS?.vendors || 'vendors';
            this.vendorsListener = this.db.collection(vendorsCollection)
                .onSnapshot(snapshot => {
                    const vendors = [];
                    snapshot.forEach(doc => {
                        vendors.push({
                            firestoreId: doc.id,
                            ...doc.data()
                        });
                    });
                    callback(vendors);
                });

            return () => {
                if (this.vendorsListener) {
                    this.vendorsListener();
                }
            };
        } catch (error) {
            console.error('Error setting up vendors listener:', error);
            return null;
        }
    }

    /**
     * Create sample vendors for testing (if collection is empty)
     * @returns {Promise<void>}
     */
    async createSampleVendors() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase not initialized.');
                return;
            }

            const vendorsCollection = window.FIREBASE_COLLECTIONS?.vendors || 'vendors';
            
            try {
                const snapshot = await this.db.collection(vendorsCollection).get();

                // Only add samples if collection is empty
                if (snapshot.empty) {
                    console.log('Creating sample vendors...');
                    this.addSampleVendorsToCollection(vendorsCollection);
                }
            } catch (err) {
                // Collection doesn't exist, create it with sample data
                console.log('Vendors collection does not exist. Creating it with sample vendors...');
                this.addSampleVendorsToCollection(vendorsCollection);
            }
        } catch (error) {
            console.error('Error in createSampleVendors:', error);
        }
    }

    /**
     * Helper function to add sample vendors to collection
     * @private
     */
    async addSampleVendorsToCollection(vendorsCollection) {
        try {
            const sampleVendors = [
                {
                    name: 'VaporHub Distributors',
                    category: 'Vape Products',
                    contact: 'John Martinez',
                    phone: '(800) 555-0101',
                    email: 'sales@vaporhub.com',
                    website: 'https://www.vaporhub.com',
                    access: 'Online Portal - Account #VH12345',
                    products: 'Disposable vapes, Pod systems, E-liquids, Accessories',
                    orderMethods: 'Online portal, Phone orders, Email orders',
                    notes: 'Net 30 payment terms, Free shipping over $500',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: 'Premium Tobacco Supply',
                    category: 'Tobacco Products',
                    contact: 'Sarah Johnson',
                    phone: '(800) 555-0202',
                    email: 'orders@premiumtobacco.com',
                    website: 'https://www.premiumtobacco.com',
                    access: 'Account Manager: Sarah - Direct line (800) 555-0203',
                    products: 'Cigarettes, Cigars, Rolling papers, Lighters',
                    orderMethods: 'Phone orders (preferred), Email',
                    notes: 'Minimum order $1000, Weekly deliveries on Thursdays',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: 'Beverage Wholesale Direct',
                    category: 'Beverages',
                    contact: 'Mike Chen',
                    phone: '(800) 555-0303',
                    email: 'info@beveragewholesale.com',
                    website: 'https://www.beveragewholesale.com',
                    access: 'Online ordering system - Username: VSU_Admin',
                    products: 'Energy drinks, Sodas, Water, Sports drinks, Coffee',
                    orderMethods: 'Online portal (24/7), Phone (business hours)',
                    notes: 'Next day delivery available, Volume discounts',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: 'Snack Solutions Inc',
                    category: 'Snacks & Candy',
                    contact: 'Lisa Rodriguez',
                    phone: '(800) 555-0404',
                    email: 'sales@snacksolutions.com',
                    website: 'https://www.snacksolutions.com',
                    access: 'Rep visits monthly, Online catalog access',
                    products: 'Chips, Candy bars, Gum, Cookies, Nuts',
                    orderMethods: 'Mobile app, Website, Sales rep',
                    notes: 'Flexible payment terms, Returns accepted',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: 'General Supplies Co',
                    category: 'Store Supplies',
                    contact: 'David Park',
                    phone: '(800) 555-0505',
                    email: 'support@generalsupplies.com',
                    website: 'https://www.generalsupplies.com',
                    access: 'Amazon Business account linked',
                    products: 'Bags, Receipt paper, Cleaning supplies, Office supplies',
                    orderMethods: 'Amazon Business, Direct website, Phone',
                    notes: 'Prime shipping available, Bulk discounts',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            // Add each sample vendor - this will create the collection if it doesn't exist
            let count = 0;
            for (const vendor of sampleVendors) {
                await this.db.collection(vendorsCollection).add(vendor);
                count++;
            }

            console.log(`✅ Created ${count} sample vendors in new collection`);
        } catch (error) {
            console.error('Error adding sample vendors to collection:', error);
        }
    }
}

// Initialize global Firebase Vendors Manager
const firebaseVendorsManager = new FirebaseVendorsManager();

// Initialize global Firebase Training Manager
const firebaseTrainingManager = new FirebaseTrainingManager();

/**
 * Firebase Invoice Manager
 * Handles Firebase Firestore operations for invoice management with Base64 image storage
 */
class FirebaseInvoiceManager {
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
                console.log('Firebase Invoice Manager initialized successfully');
                return true;
            } else {
                console.error('Firebase not loaded for Invoice Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Invoice Manager:', error);
            return false;
        }
    }

    /**
     * Load invoices from Firestore
     * @returns {Promise<Array>} Array of invoice records
     */
    async loadInvoices() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Invoice Manager not initialized. Using fallback data.');
                return [];
            }

            const invoicesCollection = window.FIREBASE_COLLECTIONS?.invoices || 'invoices';
            const snapshot = await this.db.collection(invoicesCollection)
                .orderBy('createdAt', 'desc')
                .get();

            const invoices = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                invoices.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    invoiceNumber: data.invoiceNumber || '',
                    vendor: data.vendor || '',
                    category: data.category || '',
                    description: data.description || '',
                    amount: data.amount || 0,
                    dueDate: data.dueDate || '',
                    paidDate: data.paidDate || null,
                    status: data.status || 'pending',
                    recurring: data.recurring || false,
                    notes: data.notes || '',
                    photo: data.photo || null,
                    fileType: data.fileType || null,  // 'pdf' or 'image' or null
                    fileName: data.fileName || null,  // Original filename for PDFs
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                });
            });

            console.log(`Loaded ${invoices.length} invoice records from Firestore`);
            return invoices;
        } catch (error) {
            console.error('Error loading invoices from Firestore:', error);
            return [];
        }
    }

    /**
     * Add new invoice record to Firestore
     * @param {Object} invoiceData - Invoice data to add (with Base64 photo)
     * @returns {Promise<string>} New document ID
     */
    async addInvoice(invoiceData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Invoice Manager not initialized.');
                return null;
            }

            invoiceData.createdAt = new Date();
            invoiceData.updatedAt = new Date();

            const invoicesCollection = window.FIREBASE_COLLECTIONS?.invoices || 'invoices';
            const docRef = await this.db.collection(invoicesCollection).add(invoiceData);

            console.log('Invoice record added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding invoice record:', error);
            return null;
        }
    }

    /**
     * Update invoice record in Firestore
     * @param {string} invoiceId - Invoice Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateInvoice(invoiceId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Invoice Manager not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const invoicesCollection = window.FIREBASE_COLLECTIONS?.invoices || 'invoices';
            await this.db.collection(invoicesCollection).doc(invoiceId).update(updateData);

            console.log('Invoice record updated:', invoiceId);
            return true;
        } catch (error) {
            console.error('Error updating invoice record:', error);
            return false;
        }
    }

    /**
     * Delete invoice record from Firestore
     * @param {string} invoiceId - Invoice Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteInvoice(invoiceId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Invoice Manager not initialized.');
                return false;
            }

            const invoicesCollection = window.FIREBASE_COLLECTIONS?.invoices || 'invoices';
            await this.db.collection(invoicesCollection).doc(invoiceId).delete();

            console.log('Invoice record deleted:', invoiceId);
            return true;
        } catch (error) {
            console.error('Error deleting invoice record:', error);
            return false;
        }
    }

    /**
     * Mark invoice as paid in Firestore
     * @param {string} invoiceId - Invoice Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async markInvoicePaid(invoiceId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Invoice Manager not initialized.');
                return false;
            }

            const updateData = {
                status: 'paid',
                paidDate: new Date().toISOString().split('T')[0],
                updatedAt: new Date()
            };

            const invoicesCollection = window.FIREBASE_COLLECTIONS?.invoices || 'invoices';
            await this.db.collection(invoicesCollection).doc(invoiceId).update(updateData);

            console.log('Invoice marked as paid:', invoiceId);
            return true;
        } catch (error) {
            console.error('Error marking invoice as paid:', error);
            return false;
        }
    }

    /**
     * Listen to invoices collection for real-time updates
     * @param {Function} callback - Function to call with updated invoices array
     * @returns {Function} Unsubscribe function
     */
    listenToInvoices(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Invoice Manager not initialized.');
                return null;
            }

            const invoicesCollection = window.FIREBASE_COLLECTIONS?.invoices || 'invoices';
            return this.db.collection(invoicesCollection)
                .orderBy('createdAt', 'desc')
                .onSnapshot(snapshot => {
                    const invoices = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        invoices.push({
                            id: doc.id,
                            firestoreId: doc.id,
                            invoiceNumber: data.invoiceNumber || '',
                            vendor: data.vendor || '',
                            category: data.category || '',
                            description: data.description || '',
                            amount: data.amount || 0,
                            dueDate: data.dueDate || '',
                            paidDate: data.paidDate || null,
                            status: data.status || 'pending',
                            recurring: data.recurring || false,
                            notes: data.notes || '',
                            photo: data.photo || null,
                            fileType: data.fileType || null,
                            fileName: data.fileName || null,
                            createdAt: data.createdAt,
                            updatedAt: data.updatedAt
                        });
                    });
                    callback(invoices);
                }, error => {
                    console.error('Error listening to invoices:', error);
                });
        } catch (error) {
            console.error('Error setting up invoices listener:', error);
            return null;
        }
    }
}

// Initialize global Firebase Invoice Manager
const firebaseInvoiceManager = new FirebaseInvoiceManager();

/**
 * Firebase Announcements Manager
 * Handles Firebase Firestore operations for announcements
 */
class FirebaseAnnouncementsManager {
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
                console.log('Firebase Announcements Manager initialized successfully');
                return true;
            } else {
                console.error('Firebase not loaded for Announcements Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Announcements Manager:', error);
            return false;
        }
    }

    /**
     * Load announcements from Firestore
     * @returns {Promise<Array>} Array of announcement records
     */
    async loadAnnouncements() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Announcements Manager not initialized. Using fallback data.');
                return [];
            }

            const announcementsCollection = window.FIREBASE_COLLECTIONS?.announcements || 'announcements';
            const snapshot = await this.db.collection(announcementsCollection)
                .orderBy('date', 'desc')
                .get();

            const announcements = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                announcements.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    date: data.date || '',
                    title: data.title || '',
                    content: data.content || '',
                    author: data.author || 'Unknown',
                    targetStores: data.targetStores || 'all',
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                });
            });

            console.log(`Loaded ${announcements.length} announcements from Firestore`);
            return announcements;
        } catch (error) {
            console.error('Error loading announcements from Firestore:', error);
            return [];
        }
    }

    /**
     * Add new announcement to Firestore
     * @param {Object} announcementData - Announcement data to add
     * @returns {Promise<string>} New document ID
     */
    async addAnnouncement(announcementData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Announcements Manager not initialized.');
                return null;
            }

            announcementData.createdAt = new Date();
            announcementData.updatedAt = new Date();

            const announcementsCollection = window.FIREBASE_COLLECTIONS?.announcements || 'announcements';
            const docRef = await this.db.collection(announcementsCollection).add(announcementData);

            console.log('Announcement added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding announcement:', error);
            return null;
        }
    }

    /**
     * Update announcement in Firestore
     * @param {string} announcementId - Announcement Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateAnnouncement(announcementId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Announcements Manager not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const announcementsCollection = window.FIREBASE_COLLECTIONS?.announcements || 'announcements';
            await this.db.collection(announcementsCollection).doc(announcementId).update(updateData);

            console.log('Announcement updated:', announcementId);
            return true;
        } catch (error) {
            console.error('Error updating announcement:', error);
            return false;
        }
    }

    /**
     * Delete announcement from Firestore
     * @param {string} announcementId - Announcement Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteAnnouncement(announcementId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Announcements Manager not initialized.');
                return false;
            }

            const announcementsCollection = window.FIREBASE_COLLECTIONS?.announcements || 'announcements';
            await this.db.collection(announcementsCollection).doc(announcementId).delete();

            console.log('Announcement deleted:', announcementId);
            return true;
        } catch (error) {
            console.error('Error deleting announcement:', error);
            return false;
        }
    }

    /**
     * Listen to announcements collection for real-time updates
     * @param {Function} callback - Function to call with updated announcements array
     * @returns {Function} Unsubscribe function
     */
    listenToAnnouncements(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Announcements Manager not initialized.');
                return null;
            }

            const announcementsCollection = window.FIREBASE_COLLECTIONS?.announcements || 'announcements';
            return this.db.collection(announcementsCollection)
                .orderBy('date', 'desc')
                .onSnapshot(snapshot => {
                    const announcements = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        announcements.push({
                            id: doc.id,
                            firestoreId: doc.id,
                            date: data.date || '',
                            title: data.title || '',
                            content: data.content || '',
                            author: data.author || 'Unknown',
                            targetStores: data.targetStores || 'all',
                            createdAt: data.createdAt,
                            updatedAt: data.updatedAt
                        });
                    });
                    callback(announcements);
                }, error => {
                    console.error('Error listening to announcements:', error);
                });
        } catch (error) {
            console.error('Error setting up announcements listener:', error);
            return null;
        }
    }
}

// Initialize global Firebase Announcements Manager
const firebaseAnnouncementsManager = new FirebaseAnnouncementsManager();

class FirebaseRestockRequestsManager {
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
                console.log('Firebase Restock Requests Manager initialized successfully');
                return true;
            } else {
                console.error('Firebase not loaded for Restock Requests Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Restock Requests Manager:', error);
            return false;
        }
    }

    /**
     * Load restock requests from Firestore
     * @returns {Promise<Array>} Array of restock requests
     */
    async loadRestockRequests() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Restock Requests Manager not initialized. Using fallback data.');
                return [];
            }

            const requestsCollection = window.FIREBASE_COLLECTIONS?.restockRequests || 'restockRequests';
            const snapshot = await this.db.collection(requestsCollection)
                .orderBy('requestDate', 'desc')
                .get();

            const requests = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                requests.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    productName: data.productName || '',
                    quantity: data.quantity || 0,
                    store: data.store || '',
                    requestedBy: data.requestedBy || '',
                    requestDate: data.requestDate || '',
                    status: data.status || 'pending',
                    priority: data.priority || 'medium',
                    notes: data.notes || ''
                });
            });

            console.log(`Loaded ${requests.length} restock requests from Firestore`);
            return requests;
        } catch (error) {
            console.error('Error loading restock requests from Firestore:', error);
            return [];
        }
    }

    /**
     * Add new restock request to Firestore
     * @param {Object} requestData - Request data to add
     * @returns {Promise<string>} New document ID
     */
    async addRestockRequest(requestData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Restock Requests Manager not initialized.');
                return null;
            }

            requestData.createdAt = new Date();
            requestData.updatedAt = new Date();

            const requestsCollection = window.FIREBASE_COLLECTIONS?.restockRequests || 'restockRequests';
            const docRef = await this.db.collection(requestsCollection).add(requestData);

            console.log('Restock request added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding restock request:', error);
            return null;
        }
    }

    /**
     * Update restock request in Firestore
     * @param {string} requestId - Request Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateRestockRequest(requestId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Restock Requests Manager not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const requestsCollection = window.FIREBASE_COLLECTIONS?.restockRequests || 'restockRequests';
            await this.db.collection(requestsCollection).doc(requestId).update(updateData);

            console.log('Restock request updated:', requestId);
            return true;
        } catch (error) {
            console.error('Error updating restock request:', error);
            return false;
        }
    }

    /**
     * Delete restock request from Firestore
     * @param {string} requestId - Request Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteRestockRequest(requestId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Restock Requests Manager not initialized.');
                return false;
            }

            const requestsCollection = window.FIREBASE_COLLECTIONS?.restockRequests || 'restockRequests';
            await this.db.collection(requestsCollection).doc(requestId).delete();

            console.log('Restock request deleted:', requestId);
            return true;
        } catch (error) {
            console.error('Error deleting restock request:', error);
            return false;
        }
    }

    /**
     * Listen to real-time updates for restock requests
     * @param {Function} callback - Callback function to handle updates
     * @returns {Function} Unsubscribe function
     */
    listenToRestockRequests(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Restock Requests Manager not initialized.');
                return null;
            }

            const requestsCollection = window.FIREBASE_COLLECTIONS?.restockRequests || 'restockRequests';
            return this.db.collection(requestsCollection)
                .orderBy('requestDate', 'desc')
                .onSnapshot(snapshot => {
                    const requests = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        requests.push({
                            id: doc.id,
                            firestoreId: doc.id,
                            productName: data.productName || '',
                            quantity: data.quantity || 0,
                            store: data.store || '',
                            requestedBy: data.requestedBy || '',
                            requestDate: data.requestDate || '',
                            status: data.status || 'pending',
                            priority: data.priority || 'medium',
                            notes: data.notes || ''
                        });
                    });
                    callback(requests);
                }, error => {
                    console.error('Error listening to restock requests:', error);
                });
        } catch (error) {
            console.error('Error setting up restock requests listener:', error);
            return null;
        }
    }
}

// Initialize global Firebase Restock Requests Manager
const firebaseRestockRequestsManager = new FirebaseRestockRequestsManager();

/**
 * Firebase Change Records Manager
 * Handles Firebase Firestore operations for change records (cambio dejado en Campos)
 */
class FirebaseChangeRecordsManager {
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
                console.log('Firebase Change Records Manager initialized successfully');
                return true;
            } else {
                console.error('Firebase not loaded for Change Records Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Change Records Manager:', error);
            return false;
        }
    }

    /**
     * Load change records from Firestore
     * @returns {Promise<Array>} Array of change records
     */
    async loadChangeRecords() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Change Records Manager not initialized. Using fallback data.');
                return [];
            }

            const changeCollection = window.FIREBASE_COLLECTIONS?.changeRecords || 'changeRecords';
            const snapshot = await this.db.collection(changeCollection)
                .orderBy('date', 'desc')
                .get();

            const records = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                records.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    store: data.store || '',
                    amount: data.amount || 0,
                    date: data.date || '',
                    leftBy: data.leftBy || '',
                    receivedBy: data.receivedBy || '',
                    notes: data.notes || '',
                    photo: data.photo || null,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                });
            });

            console.log(`Loaded ${records.length} change records from Firestore`);
            return records;
        } catch (error) {
            console.error('Error loading change records from Firestore:', error);
            return [];
        }
    }

    /**
     * Add new change record to Firestore
     * @param {Object} recordData - Record data to add
     * @returns {Promise<string>} New document ID
     */
    async addChangeRecord(recordData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Change Records Manager not initialized.');
                return null;
            }

            recordData.createdAt = new Date();
            recordData.updatedAt = new Date();

            const changeCollection = window.FIREBASE_COLLECTIONS?.changeRecords || 'changeRecords';
            const docRef = await this.db.collection(changeCollection).add(recordData);

            console.log('Change record added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding change record:', error);
            return null;
        }
    }

    /**
     * Update change record in Firestore
     * @param {string} recordId - Record Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateChangeRecord(recordId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Change Records Manager not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const changeCollection = window.FIREBASE_COLLECTIONS?.changeRecords || 'changeRecords';
            await this.db.collection(changeCollection).doc(recordId).update(updateData);

            console.log('Change record updated:', recordId);
            return true;
        } catch (error) {
            console.error('Error updating change record:', error);
            return false;
        }
    }

    /**
     * Delete change record from Firestore
     * @param {string} recordId - Record Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteChangeRecord(recordId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Change Records Manager not initialized.');
                return false;
            }

            const changeCollection = window.FIREBASE_COLLECTIONS?.changeRecords || 'changeRecords';
            await this.db.collection(changeCollection).doc(recordId).delete();

            console.log('Change record deleted:', recordId);
            return true;
        } catch (error) {
            console.error('Error deleting change record:', error);
            return false;
        }
    }

    /**
     * Listen to real-time updates for change records
     * @param {Function} callback - Callback function to handle updates
     * @returns {Function} Unsubscribe function
     */
    listenToChangeRecords(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Change Records Manager not initialized.');
                return null;
            }

            const changeCollection = window.FIREBASE_COLLECTIONS?.changeRecords || 'changeRecords';
            return this.db.collection(changeCollection)
                .orderBy('date', 'desc')
                .onSnapshot(snapshot => {
                    const records = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        records.push({
                            id: doc.id,
                            firestoreId: doc.id,
                            store: data.store || '',
                            amount: data.amount || 0,
                            date: data.date || '',
                            leftBy: data.leftBy || '',
                            receivedBy: data.receivedBy || '',
                            notes: data.notes || '',
                            photo: data.photo || null,
                            createdAt: data.createdAt,
                            updatedAt: data.updatedAt
                        });
                    });
                    callback(records);
                }, error => {
                    console.error('Error listening to change records:', error);
                });
        } catch (error) {
            console.error('Error setting up change records listener:', error);
            return null;
        }
    }
}

// Initialize global Firebase Change Records Manager
const firebaseChangeRecordsManager = new FirebaseChangeRecordsManager();

/**
 * Firebase Cash Out Manager
 * Handles Firebase Firestore operations for cash out records
 */
class FirebaseCashOutManager {
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
                console.log('Firebase Cash Out Manager initialized successfully');
                return true;
            } else {
                console.error('Firebase not loaded for Cash Out Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Cash Out Manager:', error);
            return false;
        }
    }

    /**
     * Load cash out records from Firestore
     * @returns {Promise<Array>} Array of cash out records
     */
    async loadCashOutRecords() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Cash Out Manager not initialized. Using fallback data.');
                return [];
            }

            const cashOutCollection = window.FIREBASE_COLLECTIONS?.cashOut || 'cashOut';
            const snapshot = await this.db.collection(cashOutCollection)
                .orderBy('createdDate', 'desc')
                .get();

            const records = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                records.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    name: data.name || '',
                    amount: data.amount || 0,
                    reason: data.reason || '',
                    createdDate: data.createdDate || '',
                    createdBy: data.createdBy || '',
                    store: data.store || '',
                    status: data.status || 'open',
                    closedDate: data.closedDate || null,
                    receiptPhoto: data.receiptPhoto || null,
                    amountSpent: data.amountSpent || null,
                    moneyLeft: data.moneyLeft || null,
                    hasMoneyLeft: data.hasMoneyLeft || null,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                });
            });

            console.log(`Loaded ${records.length} cash out records from Firestore`);
            return records;
        } catch (error) {
            console.error('Error loading cash out records from Firestore:', error);
            return [];
        }
    }

    /**
     * Add new cash out record to Firestore
     * @param {Object} recordData - Record data to add
     * @returns {Promise<string>} New document ID
     */
    async addCashOutRecord(recordData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Cash Out Manager not initialized.');
                return null;
            }

            recordData.createdAt = new Date();
            recordData.updatedAt = new Date();

            const cashOutCollection = window.FIREBASE_COLLECTIONS?.cashOut || 'cashOut';
            const docRef = await this.db.collection(cashOutCollection).add(recordData);

            console.log('Cash out record added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding cash out record:', error);
            return null;
        }
    }

    /**
     * Update cash out record in Firestore
     * @param {string} recordId - Record Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateCashOutRecord(recordId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Cash Out Manager not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const cashOutCollection = window.FIREBASE_COLLECTIONS?.cashOut || 'cashOut';
            await this.db.collection(cashOutCollection).doc(recordId).update(updateData);

            console.log('Cash out record updated:', recordId);
            return true;
        } catch (error) {
            console.error('Error updating cash out record:', error);
            return false;
        }
    }

    /**
     * Delete cash out record from Firestore
     * @param {string} recordId - Record Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteCashOutRecord(recordId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Cash Out Manager not initialized.');
                return false;
            }

            const cashOutCollection = window.FIREBASE_COLLECTIONS?.cashOut || 'cashOut';
            await this.db.collection(cashOutCollection).doc(recordId).delete();

            console.log('Cash out record deleted:', recordId);
            return true;
        } catch (error) {
            console.error('Error deleting cash out record:', error);
            return false;
        }
    }

    /**
     * Listen to real-time updates for cash out records
     * @param {Function} callback - Callback function to handle updates
     * @returns {Function} Unsubscribe function
     */
    listenToCashOutRecords(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Cash Out Manager not initialized.');
                return null;
            }

            const cashOutCollection = window.FIREBASE_COLLECTIONS?.cashOut || 'cashOut';
            return this.db.collection(cashOutCollection)
                .orderBy('createdDate', 'desc')
                .onSnapshot(snapshot => {
                    const records = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        records.push({
                            id: doc.id,
                            firestoreId: doc.id,
                            name: data.name || '',
                            amount: data.amount || 0,
                            reason: data.reason || '',
                            createdDate: data.createdDate || '',
                            createdBy: data.createdBy || '',
                            store: data.store || '',
                            status: data.status || 'open',
                            closedDate: data.closedDate || null,
                            receiptPhoto: data.receiptPhoto || null,
                            amountSpent: data.amountSpent || null,
                            moneyLeft: data.moneyLeft || null,
                            hasMoneyLeft: data.hasMoneyLeft || null,
                            createdAt: data.createdAt,
                            updatedAt: data.updatedAt
                        });
                    });
                    callback(records);
                }, error => {
                    console.error('Error listening to cash out records:', error);
                });
        } catch (error) {
            console.error('Error setting up cash out records listener:', error);
            return null;
        }
    }
}

// Initialize global Firebase Cash Out Manager
const firebaseCashOutManager = new FirebaseCashOutManager();

/**
 * Firebase Gifts Manager
 * Handles all gifts (Control de Regalos en Especie) operations with Firestore
 */
class FirebaseGiftsManager {
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
                console.log('Firebase Gifts Manager initialized successfully');
                return true;
            } else {
                console.error('Firebase not loaded for Gifts Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Gifts Manager:', error);
            return false;
        }
    }

    /**
     * Load gifts from Firestore
     * @returns {Promise<Array>} Array of gift records
     */
    async loadGifts() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Gifts Manager not initialized. Using fallback data.');
                return [];
            }

            const giftsCollection = window.FIREBASE_COLLECTIONS?.gifts || 'gifts';
            const snapshot = await this.db.collection(giftsCollection)
                .orderBy('date', 'desc')
                .get();

            const gifts = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                gifts.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    product: data.product || '',
                    quantity: data.quantity || 0,
                    value: data.value || 0,
                    recipient: data.recipient || '',
                    recipientType: data.recipientType || 'customer',
                    reason: data.reason || '',
                    store: data.store || '',
                    date: data.date || '',
                    notes: data.notes || '',
                    photo: data.photo || null
                });
            });

            console.log(`Loaded ${gifts.length} gift records from Firestore`);
            return gifts;
        } catch (error) {
            console.error('Error loading gifts from Firestore:', error);
            return [];
        }
    }

    /**
     * Add new gift record to Firestore
     * @param {Object} giftData - Gift data to add
     * @returns {Promise<string>} New document ID
     */
    async addGift(giftData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Gifts Manager not initialized.');
                return null;
            }

            giftData.createdAt = new Date();
            giftData.updatedAt = new Date();

            const giftsCollection = window.FIREBASE_COLLECTIONS?.gifts || 'gifts';
            const docRef = await this.db.collection(giftsCollection).add(giftData);

            console.log('Gift record added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding gift record:', error);
            return null;
        }
    }

    /**
     * Update gift record in Firestore
     * @param {string} giftId - Gift Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateGift(giftId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Gifts Manager not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const giftsCollection = window.FIREBASE_COLLECTIONS?.gifts || 'gifts';
            await this.db.collection(giftsCollection).doc(giftId).update(updateData);

            console.log('Gift record updated:', giftId);
            return true;
        } catch (error) {
            console.error('Error updating gift record:', error);
            return false;
        }
    }

    /**
     * Delete gift record from Firestore
     * @param {string} giftId - Gift Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteGift(giftId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Gifts Manager not initialized.');
                return false;
            }

            const giftsCollection = window.FIREBASE_COLLECTIONS?.gifts || 'gifts';
            await this.db.collection(giftsCollection).doc(giftId).delete();

            console.log('Gift record deleted:', giftId);
            return true;
        } catch (error) {
            console.error('Error deleting gift record:', error);
            return false;
        }
    }
}

// Initialize global Firebase Gifts Manager
const firebaseGiftsManager = new FirebaseGiftsManager();

/**
 * Firebase Issues Manager
 * Handles Firebase Firestore operations for issues registry
 */
class FirebaseIssuesManager {
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
                console.log('Firebase Issues Manager initialized successfully');
                return true;
            } else {
                console.error('Firebase not loaded for Issues Manager');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Firebase Issues Manager:', error);
            return false;
        }
    }

    /**
     * Load issues from Firestore
     * @returns {Promise<Array>} Array of issue records
     */
    async loadIssues() {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('Firebase Issues Manager not initialized. Using fallback data.');
                return [];
            }

            const issuesCollection = window.FIREBASE_COLLECTIONS?.issues || 'issues';
            const snapshot = await this.db.collection(issuesCollection)
                .orderBy('incidentDate', 'desc')
                .get();

            const issues = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                issues.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    customer: data.customer || 'Anonymous',
                    phone: data.phone || '',
                    type: data.type || 'In Store',
                    description: data.description || '',
                    incidentDate: data.incidentDate || '',
                    perception: data.perception || null,
                    status: data.status || 'open',
                    createdBy: data.createdBy || '',
                    createdDate: data.createdDate || '',
                    solution: data.solution || null,
                    resolvedBy: data.resolvedBy || null,
                    resolutionDate: data.resolutionDate || null,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                });
            });

            console.log(`Loaded ${issues.length} issues from Firestore`);
            return issues;
        } catch (error) {
            console.error('Error loading issues from Firestore:', error);
            return [];
        }
    }

    /**
     * Add new issue to Firestore
     * @param {Object} issueData - Issue data to add
     * @returns {Promise<string>} New document ID
     */
    async addIssue(issueData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Issues Manager not initialized.');
                return null;
            }

            issueData.createdAt = new Date();
            issueData.updatedAt = new Date();

            const issuesCollection = window.FIREBASE_COLLECTIONS?.issues || 'issues';
            const docRef = await this.db.collection(issuesCollection).add(issueData);

            console.log('Issue added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding issue:', error);
            return null;
        }
    }

    /**
     * Update issue in Firestore
     * @param {string} issueId - Issue Firestore ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async updateIssue(issueId, updateData) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Issues Manager not initialized.');
                return false;
            }

            updateData.updatedAt = new Date();

            const issuesCollection = window.FIREBASE_COLLECTIONS?.issues || 'issues';
            await this.db.collection(issuesCollection).doc(issueId).update(updateData);

            console.log('Issue updated:', issueId);
            return true;
        } catch (error) {
            console.error('Error updating issue:', error);
            return false;
        }
    }

    /**
     * Delete issue from Firestore
     * @param {string} issueId - Issue Firestore ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteIssue(issueId) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Issues Manager not initialized.');
                return false;
            }

            const issuesCollection = window.FIREBASE_COLLECTIONS?.issues || 'issues';
            await this.db.collection(issuesCollection).doc(issueId).delete();

            console.log('Issue deleted:', issueId);
            return true;
        } catch (error) {
            console.error('Error deleting issue:', error);
            return false;
        }
    }

    /**
     * Listen to real-time updates for issues
     * @param {Function} callback - Callback function to handle updates
     * @returns {Function} Unsubscribe function
     */
    listenToIssues(callback) {
        try {
            if (!this.isInitialized || !this.db) {
                console.error('Firebase Issues Manager not initialized.');
                return null;
            }

            const issuesCollection = window.FIREBASE_COLLECTIONS?.issues || 'issues';
            return this.db.collection(issuesCollection)
                .orderBy('incidentDate', 'desc')
                .onSnapshot(snapshot => {
                    const issues = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        issues.push({
                            id: doc.id,
                            firestoreId: doc.id,
                            customer: data.customer || 'Anonymous',
                            phone: data.phone || '',
                            type: data.type || 'In Store',
                            description: data.description || '',
                            incidentDate: data.incidentDate || '',
                            perception: data.perception || null,
                            status: data.status || 'open',
                            createdBy: data.createdBy || '',
                            createdDate: data.createdDate || '',
                            solution: data.solution || null,
                            resolvedBy: data.resolvedBy || null,
                            resolutionDate: data.resolutionDate || null,
                            createdAt: data.createdAt,
                            updatedAt: data.updatedAt
                        });
                    });
                    callback(issues);
                }, error => {
                    console.error('Error listening to issues:', error);
                });
        } catch (error) {
            console.error('Error setting up issues listener:', error);
            return null;
        }
    }
}

// Initialize global Firebase Issues Manager
const firebaseIssuesManager = new FirebaseIssuesManager();
