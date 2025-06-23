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
    // Mock authentication for development
    if (email === "admin@gmail.com" && password === "admin123") {
      return this.mockLogin(email, password, remember, "admin");
    }

    // Mock owner authentication
    if (email === "owner@gmail.com" && password === "owner123") {
      return this.mockLogin(email, password, remember, "owner");
    }

    return handleAPIRequest(async () => {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, data: userData } = response.data;

      if (token) {
        // Store token
        tokenManager.setToken(token, remember);

        // Store user data
        this.currentUser = userData;
        this.isAuthenticated = true;

        // Store user data in storage
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem("currentUser", JSON.stringify(userData));
      }

      return response;
    });
  }

  /**
   * Mock login for development
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} remember - Whether to remember the user
   * @param {string} role - User role (admin, owner, tenant, etc.)
   * @returns {Promise<Object>} Mock user data and token
   */
  async mockLogin(email, password, remember = false, role = "tenant") {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockToken = "mock-jwt-token-" + Date.now();

    // Create user data based on role
    let mockUserData;

    if (role === "admin") {
      mockUserData = {
        id: 1,
        username: "admin",
        email: "admin@gmail.com",
        first_name: "Admin",
        last_name: "User",
        role: "admin",
        phone_number: "+966 50 123 4567",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else if (role === "owner") {
      mockUserData = {
        id: 2,
        username: "owner",
        email: "owner@gmail.com",
        first_name: "Ahmed",
        last_name: "Al-Rashid",
        role: "owner",
        phone_number: "+966 55 987 6543",
        company_name: "Al-Rashid Properties",
        license_number: "CR-2023-001234",
        properties_count: 12,
        total_units: 45,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else if (role === "tenant") {
      mockUserData = {
        id: 3,
        username: "tenant",
        email: "tenant@gmail.com",
        first_name: "Sarah",
        last_name: "Johnson",
        role: "tenant",
        phone_number: "+966 56 789 0123",
        nationality: "American",
        emirates_id: "784-1990-1234567-8",
        emergency_contact: "+966 57 890 1234",
        preferred_language: "English",
        move_in_date: "2023-06-15T00:00:00Z",
        current_property: "Al-Noor Residential Complex",
        unit_number: "A-205",
        lease_start: "2023-06-15T00:00:00Z",
        lease_end: "2024-06-14T23:59:59Z",
        monthly_rent: 2400,
        deposit_amount: 4800,
        ejari_number: "EJ-2023-789456",
        ejari_expiry: "2024-06-14T23:59:59Z",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      mockUserData = {
        id: 4,
        username: email.split("@")[0],
        email: email,
        first_name: "User",
        last_name: "Name",
        role: role,
        phone_number: "+966 50 000 0000",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // Store token
    tokenManager.setToken(mockToken, remember);

    // Store user data
    this.currentUser = mockUserData;
    this.isAuthenticated = true;

    // Store user data in storage
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("currentUser", JSON.stringify(mockUserData));

    return {
      success: true,
      data: mockUserData,
      token: mockToken,
      message: "Login successful",
    };
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User data and token
   */
  async register(userData) {
    // Mock registration for development
    if (
      process.env.NODE_ENV === "development" ||
      !process.env.REACT_APP_API_URL
    ) {
      return this.mockRegister(userData);
    }

    return handleAPIRequest(async () => {
      const response = await api.post("/auth/register", userData);

      const { token, data: newUserData } = response.data;

      if (token) {
        // Store token (default to session storage for new registrations)
        tokenManager.setToken(token, false);

        // Store user data
        this.currentUser = newUserData;
        this.isAuthenticated = true;

        // Store user data in session storage
        sessionStorage.setItem("currentUser", JSON.stringify(newUserData));
      }

      return response;
    });
  }

  /**
   * Mock registration for development
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Mock user data and token
   */
  async mockRegister(userData) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockToken = "mock-jwt-token-" + Date.now();
    const mockUserData = {
      id: Date.now(),
      username: userData.username,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role || "tenant",
      phone_number: userData.phone_number,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store token (default to session storage for new registrations)
    tokenManager.setToken(mockToken, false);

    // Store user data
    this.currentUser = mockUserData;
    this.isAuthenticated = true;

    // Store user data in session storage
    sessionStorage.setItem("currentUser", JSON.stringify(mockUserData));

    return {
      success: true,
      data: mockUserData,
      token: mockToken,
      message: "Registration successful",
    };
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
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
