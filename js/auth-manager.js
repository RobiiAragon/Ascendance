/**
 * Authentication Manager
 * Handles user authentication, session management, and role-based access control
 */

class AuthenticationManager {
    constructor() {
        this.currentUser = null;
        this.currentUserRole = null;
        this.isInitialized = false;
    }

    /**
     * Initialize authentication manager
     */
    initialize() {
        this.restoreSession();
        this.isInitialized = true;
        return this.currentUser !== null;
    }

    /**
     * Restore user session from storage
     */
    restoreSession() {
        try {
            const sessionData = sessionStorage.getItem('ascendance_user');
            if (sessionData) {
                this.currentUser = JSON.parse(sessionData);
                this.currentUserRole = this.currentUser.role;
                console.log('Session restored for user:', this.currentUser.email);
                return true;
            }
        } catch (error) {
            console.error('Error restoring session:', error);
        }
        return false;
    }

    /**
     * Get current authenticated user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Get current user's role
     */
    getCurrentUserRole() {
        return this.currentUserRole;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null && this.currentUser.userId;
    }

    /**
     * Check if user has a specific role
     */
    hasRole(role) {
        return this.currentUserRole === role;
    }

    /**
     * Check if user has permission for an action
     */
    hasPermission(permission) {
        if (!this.currentUserRole) return false;
        
        const rolePerms = window.ROLE_PERMISSIONS?.[this.currentUserRole];
        if (!rolePerms) return false;

        return rolePerms[permission] === true;
    }

    /**
     * Check if user can access a page
     */
    canAccessPage(pageId) {
        if (!this.currentUserRole) return false;

        const rolePerms = window.ROLE_PERMISSIONS?.[this.currentUserRole];
        if (!rolePerms || !rolePerms.pages) return false;

        return rolePerms.pages.includes(pageId);
    }

    /**
     * Get permitted pages for user
     */
    getPermittedPages() {
        if (!this.currentUserRole) return [];

        const rolePerms = window.ROLE_PERMISSIONS?.[this.currentUserRole];
        return rolePerms?.pages || [];
    }

    /**
     * Get role information
     */
    getRoleInfo() {
        if (!this.currentUserRole) return null;
        return window.ROLE_PERMISSIONS?.[this.currentUserRole] || null;
    }

    /**
     * Logout user
     */
    logout() {
        try {
            sessionStorage.removeItem('ascendance_user');
            sessionStorage.removeItem('authToken');
            this.currentUser = null;
            this.currentUserRole = null;
            console.log('User logged out');
            return true;
        } catch (error) {
            console.error('Error logging out:', error);
            return false;
        }
    }

    /**
     * Force logout and redirect to login
     */
    forceLogout() {
        this.logout();
        window.location.href = 'login.html';
    }

    /**
     * Check session validity
     */
    isSessionValid() {
        if (!this.currentUser) return false;

        const loginTime = new Date(this.currentUser.loginTime);
        const now = new Date();
        const sessionTimeout = window.SESSION_CONFIG?.timeout || 30 * 60 * 1000;

        return (now - loginTime) < sessionTimeout;
    }

    /**
     * Extend session
     */
    extendSession() {
        if (this.currentUser) {
            this.currentUser.loginTime = new Date().toISOString();
            sessionStorage.setItem('ascendance_user', JSON.stringify(this.currentUser));
        }
    }

    /**
     * Get role label
     */
    getRoleLabel() {
        const roleInfo = this.getRoleInfo();
        return roleInfo?.label || this.currentUserRole || 'Unknown';
    }

    /**
     * Get role description
     */
    getRoleDescription() {
        const roleInfo = this.getRoleInfo();
        return roleInfo?.description || '';
    }

    /**
     * Get role color
     */
    getRoleColor() {
        const roleInfo = this.getRoleInfo();
        return roleInfo?.color || '#6b7280';
    }
}

// Initialize global authentication manager
const authManager = new AuthenticationManager();
