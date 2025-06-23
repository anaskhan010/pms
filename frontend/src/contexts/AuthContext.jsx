import React, { createContext, useContext, useReducer, useEffect } from "react";
import authService from "../services/authService.js";

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  REGISTER_START: "REGISTER_START",
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  REGISTER_FAILURE: "REGISTER_FAILURE",
  UPDATE_USER: "UPDATE_USER",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  INITIALIZE: "INITIALIZE",
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload.user,
        error: null,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload.error,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.INITIALIZE:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: action.payload.isAuthenticated,
        isLoading: false,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication on app startup
  useEffect(() => {
    const initializeAuth = () => {
      try {
        authService.initialize();
        const isAuthenticated = authService.isUserAuthenticated();
        const user = authService.getCurrentUserData();

        dispatch({
          type: AUTH_ACTIONS.INITIALIZE,
          payload: {
            user,
            isAuthenticated,
          },
        });
      } catch (error) {
        console.error("Error initializing auth:", error);
        dispatch({
          type: AUTH_ACTIONS.INITIALIZE,
          payload: {
            user: null,
            isAuthenticated: false,
          },
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password, remember = false) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await authService.login(email, password, remember);
      const user = authService.getCurrentUserData();

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user },
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const response = await authService.register(userData);
      const user = authService.getCurrentUserData();

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user },
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { isLoading: true } });

    try {
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if server request fails
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update user details
  const updateUserDetails = async (updateData) => {
    try {
      const response = await authService.updateUserDetails(updateData);
      const user = authService.getCurrentUserData();

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: { user },
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: { error: error.message },
      });
      throw error;
    }
  };

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.updatePassword(
        currentPassword,
        newPassword
      );
      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: { error: error.message },
      });
      throw error;
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: { error: error.message },
      });
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (resetToken, newPassword) => {
    try {
      const response = await authService.resetPassword(resetToken, newPassword);
      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: { error: error.message },
      });
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return authService.hasRole(role);
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return authService.hasAnyRole(roles);
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      const user = authService.getCurrentUserData();

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: { user },
      });

      return response;
    } catch (error) {
      // If refresh fails due to invalid token, logout
      if (error.status === 401) {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
      throw error;
    }
  };

  // Context value
  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    register,
    logout,
    updateUserDetails,
    updatePassword,
    forgotPassword,
    resetPassword,
    clearError,
    hasRole,
    hasAnyRole,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
