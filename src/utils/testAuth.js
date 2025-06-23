/**
 * Test utilities for authentication functionality
 * This file contains functions to test the authentication integration
 */

import authService from '../services/authService.js';
import { api } from '../services/api.js';

/**
 * Test the API connection to the backend
 */
export const testAPIConnection = async () => {
  console.log('🔍 Testing API connection...');
  
  try {
    const response = await api.get('/health');
    console.log('✅ API connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ API connection failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Test user registration
 */
export const testRegistration = async (testUser = null) => {
  console.log('🔍 Testing user registration...');
  
  const defaultTestUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'testpassword123',
    first_name: 'Test',
    last_name: 'User',
    role: 'tenant',
    phone_number: '+1234567890'
  };

  const userData = testUser || defaultTestUser;

  try {
    const response = await authService.register(userData);
    console.log('✅ Registration successful:', response.data);
    return { success: true, data: response.data, user: userData };
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    return { success: false, error: error.message, user: userData };
  }
};

/**
 * Test user login
 */
export const testLogin = async (credentials = null) => {
  console.log('🔍 Testing user login...');
  
  const defaultCredentials = {
    email: 'admin@gmail.com',
    password: 'admin'
  };

  const loginData = credentials || defaultCredentials;

  try {
    const response = await authService.login(loginData.email, loginData.password, false);
    console.log('✅ Login successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Test getting current user
 */
export const testGetCurrentUser = async () => {
  console.log('🔍 Testing get current user...');
  
  try {
    const response = await authService.getCurrentUser();
    console.log('✅ Get current user successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Get current user failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Test logout
 */
export const testLogout = async () => {
  console.log('🔍 Testing logout...');
  
  try {
    const response = await authService.logout();
    console.log('✅ Logout successful:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Logout failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Test authentication flow (register -> login -> get user -> logout)
 */
export const testFullAuthFlow = async () => {
  console.log('🚀 Starting full authentication flow test...');
  
  const results = {
    apiConnection: null,
    registration: null,
    login: null,
    getCurrentUser: null,
    logout: null
  };

  // Test API connection
  results.apiConnection = await testAPIConnection();
  if (!results.apiConnection.success) {
    console.log('❌ Stopping test - API connection failed');
    return results;
  }

  // Test registration
  results.registration = await testRegistration();
  if (!results.registration.success) {
    console.log('⚠️ Registration failed, trying with existing user login');
  }

  // Test login (use registered user or default credentials)
  const loginCredentials = results.registration.success 
    ? { 
        email: results.registration.user.email, 
        password: results.registration.user.password 
      }
    : null;
  
  results.login = await testLogin(loginCredentials);
  if (!results.login.success) {
    console.log('❌ Stopping test - Login failed');
    return results;
  }

  // Test get current user
  results.getCurrentUser = await testGetCurrentUser();

  // Test logout
  results.logout = await testLogout();

  console.log('🏁 Full authentication flow test completed');
  console.log('📊 Results summary:', {
    apiConnection: results.apiConnection.success ? '✅' : '❌',
    registration: results.registration.success ? '✅' : '❌',
    login: results.login.success ? '✅' : '❌',
    getCurrentUser: results.getCurrentUser.success ? '✅' : '❌',
    logout: results.logout.success ? '✅' : '❌'
  });

  return results;
};

/**
 * Test protected route access
 */
export const testProtectedRoute = async (endpoint = '/properties') => {
  console.log(`🔍 Testing protected route access: ${endpoint}`);
  
  try {
    const response = await api.get(endpoint);
    console.log('✅ Protected route access successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Protected route access failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Test token persistence
 */
export const testTokenPersistence = () => {
  console.log('🔍 Testing token persistence...');
  
  const localToken = localStorage.getItem('authToken');
  const sessionToken = sessionStorage.getItem('authToken');
  const isAuthenticated = authService.isUserAuthenticated();
  const currentUser = authService.getCurrentUserData();

  const results = {
    localToken: !!localToken,
    sessionToken: !!sessionToken,
    isAuthenticated,
    hasUserData: !!currentUser,
    userRole: currentUser?.role
  };

  console.log('📊 Token persistence results:', results);
  return results;
};

/**
 * Run all authentication tests
 */
export const runAllTests = async () => {
  console.log('🧪 Running all authentication tests...');
  
  const startTime = Date.now();
  
  try {
    // Test token persistence first
    const persistenceResults = testTokenPersistence();
    
    // Run full auth flow
    const authFlowResults = await testFullAuthFlow();
    
    // Test protected route if logged in
    let protectedRouteResults = null;
    if (authFlowResults.login?.success) {
      protectedRouteResults = await testProtectedRoute();
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    const summary = {
      duration: `${duration}ms`,
      tokenPersistence: persistenceResults,
      authFlow: authFlowResults,
      protectedRoute: protectedRouteResults,
      overallSuccess: authFlowResults.login?.success && authFlowResults.logout?.success
    };

    console.log('🎯 All tests completed:', summary);
    return summary;
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    return { error: error.message };
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.authTests = {
    testAPIConnection,
    testRegistration,
    testLogin,
    testGetCurrentUser,
    testLogout,
    testFullAuthFlow,
    testProtectedRoute,
    testTokenPersistence,
    runAllTests
  };
  
  console.log('🔧 Auth tests available in window.authTests');
}
