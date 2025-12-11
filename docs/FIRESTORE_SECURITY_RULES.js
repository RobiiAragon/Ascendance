/**
 * Firestore Security Rules
 * 
 * Copy these rules to your Firestore Security Rules console
 * Customize based on your authentication system
 */

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    /**
     * User Authentication Helper
     */
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isManager() {
      let userRole = get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
      return isAuthenticated() && (userRole == 'manager' || userRole == 'admin');
    }
    
    /**
     * Employees Collection Rules
     */
    match /employees/{document=**} {
      
      // Allow read if authenticated and has appropriate role
      allow read: if isAuthenticated() && (isAdmin() || isManager());
      
      // Allow create if admin
      allow create: if isAuthenticated() && isAdmin();
      
      // Allow update if admin or own document with limited fields
      allow update: if isAuthenticated() && (
        isAdmin() || 
        (isManager() && request.auth.uid == resource.data.userId)
      );
      
      // Allow delete if admin only
      allow delete: if isAuthenticated() && isAdmin();
    }
    
    /**
     * Users Collection Rules (for storing user roles)
     */
    match /users/{userId} {
      
      // Users can read their own document
      allow read: if request.auth.uid == userId;
      
      // Only admins can write user documents
      allow write: if isAuthenticated() && isAdmin();
    }
    
    /**
     * Roles Collection Rules
     */
    match /roles/{document=**} {
      
      // Anyone authenticated can read roles
      allow read: if isAuthenticated();
      
      // Only admins can modify roles
      allow write: if isAuthenticated() && isAdmin();
    }
    
    /**
     * Default: Deny all other access
     */
    match /{document=**} {
      allow read, write: if false;
    }
  }
}


/**
 * ALTERNATIVE: Simple Rules for Testing/Development
 * 
 * WARNING: Use only in development!
 * In production, replace with the rules above
 */

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes for testing
    match /{document=**} {
      allow read, write: if true;
    }
  }
}


/**
 * ALTERNATIVE: Role-Based Rules Without Authentication
 * 
 * For use without Firebase Authentication
 * Uses custom claims or user document for role checking
 */

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Employees collection
    match /employees/{employeeId} {
      // Everyone can read employees for display
      allow read: if true;
      
      // Only allow writes from backend (use Firebase Admin SDK)
      // This prevents direct client writes
      allow write: if false;
    }
    
    // User roles collection (for reference)
    match /roles/{roleId} {
      allow read: if true;
      allow write: if false;
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}


/**
 * Database Structure for User Roles
 * 
 * If using Firebase Authentication, create a users collection:
 */

/*
users/
├── userId1/
│   ├── name: "Marcus Rodriguez"
│   ├── email: "marcus@vsu.com"
│   ├── role: "admin"
│   └── createdAt: timestamp
│
├── userId2/
│   ├── name: "Sarah Kim"
│   ├── email: "sarah@vsu.com"
│   ├── role: "manager"
│   └── createdAt: timestamp
│
└── userId3/
    ├── name: "James Thompson"
    ├── email: "james@vsu.com"
    ├── role: "employee"
    └── createdAt: timestamp
*/


/**
 * Implementation Guide
 * 
 * Step 1: Go to Firebase Console
 * Step 2: Select your project
 * Step 3: Go to Firestore Database
 * Step 4: Click on "Rules" tab
 * Step 5: Copy and paste one of the rule sets above
 * Step 6: Click "Publish"
 * 
 * For Testing:
 * - Use "Anonymous Authentication" or custom rules
 * - Start with simple rules, make stricter as needed
 * 
 * For Production:
 * - Enable Firebase Authentication
 * - Use the authenticated rules (first option)
 * - Implement proper role checks
 * - Test thoroughly before deploying
 */
