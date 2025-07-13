import { api, tokenManager, handleAPIRequest, APIError } from "./api.js";

// Authentication service class
class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} remember - Whether to remember the user
   * @returns {Promise<Object>} User data and token
   */
  async login(email, password, remember = false) {
    return handleAPIRequest(async () => {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, data: userData } = response.data;

      if (token) {
        // Store token
        tokenManager.setToken(token, remember);
        console.log(
          `Token stored in ${remember ? "localStorage" : "sessionStorage"}:`,
          token.substring(0, 20) + "..."
        );

        // Store user data
        this.currentUser = userData;
        this.isAuthenticated = true;

        // Store user data in storage
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem("currentUser", JSON.stringify(userData));
        console.log("User data stored:", userData);
      }

      return response;
    });
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User data and token
   */
  async register(userData) {
    return handleAPIRequest(async () => {
      const response = await api.post("/auth/register", userData);

      const { token, data: newUserData } = response.data;

      if (token) {
        // Store token (default to session storage for new registrations)
        tokenManager.setToken(token, false);
        console.log(
          "Registration token stored in sessionStorage:",
          token.substring(0, 20) + "..."
        );

        // Store user data
        this.currentUser = newUserData;
        this.isAuthenticated = true;

        // Store user data in session storage
        sessionStorage.setItem("currentUser", JSON.stringify(newUserData));
        console.log("Registration user data stored:", newUserData);
      }

      return response;
    });
  }

  /**
   * Logout current user
   * @returns {Promise<Object>} Logout response
   */
  async logout() {
    try {
      // Call logout endpoint to invalidate server-side session
      await handleAPIRequest(async () => {
        return await api.get("/auth/logout");
      });
    } catch (error) {
      // Continue with client-side logout even if server request fails
      console.warn(
        "Server logout failed, proceeding with client-side logout:",
        error.message
      );
    } finally {
      // Clear client-side data
      this.clearAuthData();
    }

    return { success: true, message: "Logged out successfully" };
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} Current user data
   */
  async getCurrentUser() {
    return handleAPIRequest(async () => {
      const response = await api.get("/auth/me");

      // Update stored user data
      this.currentUser = response.data.data;
      const storage = localStorage.getItem("authToken")
        ? localStorage
        : sessionStorage;
      storage.setItem("currentUser", JSON.stringify(this.currentUser));

      return response;
    });
  }

  /**
   * Update user details
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user data
   */
  async updateUserDetails(updateData) {
    return handleAPIRequest(async () => {
      const response = await api.put("/auth/updatedetails", updateData);

      // Update stored user data
      this.currentUser = response.data.data;
      const storage = localStorage.getItem("authToken")
        ? localStorage
        : sessionStorage;
      storage.setItem("currentUser", JSON.stringify(this.currentUser));

      return response;
    });
  }

  /**
   * Update user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Update response
   */
  async updatePassword(currentPassword, newPassword) {
    return handleAPIRequest(async () => {
      const response = await api.put("/auth/updatepassword", {
        currentPassword,
        newPassword,
      });

      // Update token if new one is provided
      if (response.data.token) {
        const remember = !!localStorage.getItem("authToken");
        tokenManager.setToken(response.data.token, remember);
      }

      return response;
    });
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset response
   */
  async forgotPassword(email) {
    return handleAPIRequest(async () => {
      return await api.post("/auth/forgotpassword", { email });
    });
  }

  /**
   * Reset password with token
   * @param {string} resetToken - Password reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Reset response
   */
  async resetPassword(resetToken, newPassword) {
    return handleAPIRequest(async () => {
      return await api.put(`/auth/resetpassword/${resetToken}`, {
        password: newPassword,
      });
    });
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isUserAuthenticated() {
    const token = tokenManager.getToken();

    if (!token || tokenManager.isTokenExpired(token)) {
      this.clearAuthData();
      return false;
    }

    // Load user data from storage if not in memory
    if (!this.currentUser) {
      this.loadUserFromStorage();
    }

    return !!token && !!this.currentUser;
  }

  /**
   * Get current user data
   * @returns {Object|null} Current user data
   */
  getCurrentUserData() {
    if (!this.currentUser) {
      this.loadUserFromStorage();
    }
    return this.currentUser;
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Whether user has the role
   */
  hasRole(role) {
    const user = this.getCurrentUserData();
    return user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   * @param {Array<string>} roles - Roles to check
   * @returns {boolean} Whether user has any of the roles
   */
  hasAnyRole(roles) {
    const user = this.getCurrentUserData();
    return roles.includes(user?.role);
  }

  /**
   * Load user data from storage
   * @private
   */
  loadUserFromStorage() {
    try {
      const userData =
        localStorage.getItem("currentUser") ||
        sessionStorage.getItem("currentUser");

      if (userData) {
        this.currentUser = JSON.parse(userData);
        this.isAuthenticated = true;
      }
    } catch (error) {
      console.error("Error loading user data from storage:", error);
      this.clearAuthData();
    }
  }

  /**
   * Clear all authentication data
   * @private
   */
  clearAuthData() {
    tokenManager.removeToken();
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  /**
   * Initialize auth service (call on app startup)
   */
  initialize() {
    if (this.isUserAuthenticated()) {
      this.isAuthenticated = true;
      console.log("User authenticated on app startup");
    } else {
      console.log("No valid authentication found");
    }
  }

  /**
   * Debug method to check current storage state
   * @returns {Object} Current storage state
   */
  getStorageDebugInfo() {
    return {
      localStorage: {
        authToken: localStorage.getItem("authToken"),
        currentUser: localStorage.getItem("currentUser"),
      },
      sessionStorage: {
        authToken: sessionStorage.getItem("authToken"),
        currentUser: sessionStorage.getItem("currentUser"),
      },
      currentUser: this.currentUser,
      isAuthenticated: this.isAuthenticated,
    };
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
