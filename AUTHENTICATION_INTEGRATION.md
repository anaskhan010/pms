# Authentication Integration Documentation

## Overview

This document describes the authentication integration implemented for the Property Management System (PMS) frontend. The integration connects the React frontend with the Node.js/Express backend API to provide secure user authentication and authorization.

## Phase 1: Authentication Integration - COMPLETED

### 1. API Service Layer ✅

**Files Created:**
- `src/services/api.js` - Axios configuration with interceptors
- `src/services/authService.js` - Authentication service methods

**Features Implemented:**
- Base API configuration pointing to `http://localhost:5000/api/v1`
- Request/response interceptors for automatic token handling
- Token management utilities (get, set, remove, expiration check)
- Automatic retry logic for network failures
- Comprehensive error handling with custom APIError class
- Request timeout and retry mechanisms

### 2. Authentication Context & State Management ✅

**Files Created:**
- `src/contexts/AuthContext.jsx` - React Context for auth state
- `src/hooks/useAuthUtils.js` - Custom hook for auth utilities

**Features Implemented:**
- Centralized authentication state management
- User state persistence using localStorage/sessionStorage
- Role-based access control functions
- Authentication status checking
- User profile management

### 3. Login Component Integration ✅

**Files Updated:**
- `src/components/auth/LoginPage.jsx` - Enhanced with real API integration

**Features Implemented:**
- Real API authentication calls
- Form validation and error handling
- Loading states during authentication
- Secure token storage
- Role-based redirection after login
- Password visibility toggle
- Remember me functionality

### 4. Protected Routes Implementation ✅

**Files Created:**
- `src/components/auth/ProtectedRoute.jsx` - Route protection component
- `src/components/auth/RegisterPage.jsx` - User registration component

**Features Implemented:**
- Authentication status checking
- Role-based route protection
- Automatic redirection for unauthorized users
- Loading states during auth checks
- Unauthorized access handling
- Higher-order component for route protection

### 5. Security Considerations ✅

**Security Features Implemented:**
- JWT tokens stored in localStorage/sessionStorage with expiration checking
- Automatic token refresh on API calls
- Request/response interceptors for token management
- Automatic logout on token expiration
- CORS configuration for secure API communication
- Input validation and sanitization

## File Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginPage.jsx          # Enhanced login with API integration
│   │   ├── RegisterPage.jsx       # User registration component
│   │   └── ProtectedRoute.jsx     # Route protection component
│   └── common/
│       ├── ErrorBoundary.jsx      # Error boundary for error handling
│       └── LoadingSpinner.jsx     # Loading components
├── contexts/
│   └── AuthContext.jsx            # Authentication context provider
├── hooks/
│   └── useAuthUtils.js             # Authentication utility hooks
├── services/
│   ├── api.js                      # Axios configuration and interceptors
│   └── authService.js              # Authentication service methods
└── utils/
    └── testAuth.js                 # Authentication testing utilities
```

## API Integration

### Backend Endpoints Used

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/updatedetails` - Update user details
- `PUT /api/v1/auth/updatepassword` - Update password
- `GET /api/v1/auth/logout` - User logout
- `GET /api/v1/health` - API health check

### Authentication Flow

1. **Login Process:**
   - User enters credentials
   - Frontend validates form data
   - API call to `/auth/login`
   - JWT token received and stored
   - User data stored in context
   - Redirect based on user role

2. **Protected Route Access:**
   - Route component checks authentication status
   - Token validation and expiration check
   - Role-based access control
   - Automatic redirect if unauthorized

3. **Token Management:**
   - Automatic token inclusion in API requests
   - Token expiration monitoring
   - Automatic logout on token expiry
   - Refresh token handling

## User Roles and Permissions

### Role Hierarchy
1. **super_admin** - Full system access
2. **admin** - Administrative access
3. **manager** - Property management access
4. **owner** - Property owner access
5. **tenant** - Tenant-specific access

### Route Protection
- `/home` - Tenant only
- `/admin/*` - Admin, Manager, Owner only
- `/` and `/register` - Public access

## Testing

### Manual Testing
Use the browser console to run authentication tests:

```javascript
// Run all authentication tests
window.authTests.runAllTests();

// Test individual components
window.authTests.testAPIConnection();
window.authTests.testLogin();
window.authTests.testRegistration();
```

### Test Scenarios
1. API connection verification
2. User registration flow
3. Login with valid/invalid credentials
4. Protected route access
5. Token persistence
6. Automatic logout on token expiration

## Configuration

### Environment Variables
Ensure the backend is running on `http://localhost:5000` or update the API base URL in `src/services/api.js`.

### CORS Configuration
The backend should allow requests from the frontend origin (typically `http://localhost:3000` for development).

## Error Handling

### Error Types
- **Network Errors** - Automatic retry with exponential backoff
- **Authentication Errors** - Automatic logout and redirect
- **Validation Errors** - Form-level error display
- **API Errors** - User-friendly error messages

### Error Boundary
Global error boundary implemented to catch and handle React errors gracefully.

## Next Steps (Phase 2)

1. **User Profile Management**
   - Profile editing interface
   - Password change functionality
   - User preferences

2. **Role-based Navigation**
   - Dynamic menu based on user role
   - Feature visibility control
   - Admin-specific components

3. **Enhanced Security**
   - Password strength validation
   - Account lockout mechanisms
   - Session timeout warnings

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Verify backend is running on port 5000
   - Check CORS configuration
   - Verify network connectivity

2. **Login Failed**
   - Check user credentials
   - Verify user exists in database
   - Check backend logs for errors

3. **Token Issues**
   - Clear browser storage
   - Check token expiration
   - Verify JWT secret configuration

### Debug Tools

Use browser developer tools to:
- Check network requests in Network tab
- Inspect stored tokens in Application tab
- View console logs for detailed error information
- Use `window.authTests` for testing authentication flow

## Security Best Practices

1. **Token Storage** - Tokens stored with expiration checking
2. **Input Validation** - All user inputs validated
3. **Error Handling** - No sensitive information in error messages
4. **HTTPS** - Use HTTPS in production
5. **Token Expiration** - Automatic logout on token expiry
6. **CORS** - Proper CORS configuration
7. **Rate Limiting** - Backend implements rate limiting

## Conclusion

The authentication integration provides a secure, user-friendly authentication system with proper error handling, loading states, and role-based access control. The implementation follows React best practices and provides a solid foundation for the remaining application features.
