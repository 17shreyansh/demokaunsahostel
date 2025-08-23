# JWT Authentication & API Optimization

## Overview
This update implements secure JWT authentication with HTTP-only cookies and a centralized API client for improved security and maintainability.

## 🔐 Security Improvements

### Backend Changes
1. **HTTP-Only Cookies**: JWT tokens are now stored in secure HTTP-only cookies instead of localStorage
2. **Cookie Parser**: Added `cookie-parser` middleware for secure cookie handling
3. **Enhanced Auth Middleware**: Updated to check cookies first, with fallback to Authorization header
4. **Logout Endpoint**: Added proper logout functionality that clears cookies

### Frontend Changes
1. **Centralized API Client**: New `apiClient.js` provides a single point for all API calls
2. **Authentication Context**: React context manages auth state globally
3. **Automatic Token Handling**: No manual token management required
4. **Secure Cookie Storage**: Tokens stored in HTTP-only cookies (not accessible via JavaScript)

## 🚀 Performance & Maintainability

### Centralized API Management
- Single configuration point for API base URL
- Consistent error handling across all requests
- Automatic authentication header injection
- Organized API methods by feature

### Reduced Code Duplication
- No more repeated API URL configurations
- Consistent request/response handling
- Centralized loading and error states

## 📁 File Structure

```
project/
├── backend/
│   ├── middleware/auth.js          # Updated JWT middleware
│   ├── routes/auth.js             # Added logout endpoint
│   └── server.js                  # Added cookie-parser
├── frontend/
│   ├── src/
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx    # New auth context
│   │   ├── services/
│   │   │   ├── apiClient.js       # New centralized API client
│   │   │   └── api.js             # Updated legacy API
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx # Updated to use auth context
│   │   └── pages/
│   │       ├── AdminLogin.jsx     # Updated login flow
│   │       └── AdminLayout.jsx    # Updated logout flow
│   └── .env                       # API URL configuration
└── install-dependencies.bat       # Dependency installer
```

## 🔧 Installation & Setup

### 1. Install Dependencies
```bash
# Run the installation script
./install-dependencies.bat

# Or manually:
cd backend && npm install cookie-parser
```

### 2. Environment Configuration
Update your `.env` files:

**Backend (.env):**
```env
JWT_SECRET=your-secret-key
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_UPLOADS_BASE_URL=http://localhost:5000/uploads
```

### 3. Start the Application
```bash
# Backend
cd backend && npm run dev

# Frontend (in new terminal)
cd frontend && npm run dev
```

## 🔄 Migration Guide

### For Existing Components
Replace old API imports:
```javascript
// Old way
import { hostelAPI } from '../services/api'

// New way (recommended)
import apiClient from '../services/apiClient'

// Usage
const hostels = await apiClient.hostels.getAll()
```

### Authentication Usage
```javascript
// Use auth context
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth()
  
  // Login
  await login({ username, password })
  
  // Logout
  await logout()
}
```

## 🛡️ Security Features

1. **HTTP-Only Cookies**: Prevents XSS attacks by making tokens inaccessible to JavaScript
2. **Secure Flag**: Cookies marked secure in production
3. **SameSite Protection**: CSRF protection with SameSite=Lax
4. **Automatic Expiry**: Tokens expire after 24 hours
5. **Proper Logout**: Server-side cookie clearing

## 📊 API Client Features

### Organized Methods
```javascript
// Authentication
apiClient.auth.login(credentials)
apiClient.auth.logout()
apiClient.auth.getProfile()

// Hostels
apiClient.hostels.getAll(params)
apiClient.hostels.getById(id)
apiClient.hostels.create(data)

// Leads
apiClient.leads.getAll(params)
apiClient.leads.updateStatus(id, status)

// And more...
```

### Error Handling
- Automatic 401 redirect to login
- Consistent error responses
- Network timeout handling

## 🔍 Testing

1. **Login Flow**: Test with demo credentials (admin/admin123)
2. **Token Persistence**: Refresh page to verify auth state
3. **Logout**: Ensure proper cleanup and redirect
4. **API Calls**: Verify all admin functions work correctly

## 🚨 Breaking Changes

1. **localStorage**: No longer used for token storage
2. **Manual Token Management**: Removed from all components
3. **API Imports**: Legacy API still works but new apiClient recommended

## 📈 Benefits

✅ **Enhanced Security**: HTTP-only cookies prevent token theft
✅ **Better UX**: Seamless authentication without manual token handling  
✅ **Maintainable Code**: Centralized API management
✅ **Consistent Errors**: Unified error handling across app
✅ **Future-Proof**: Easy to extend and modify

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `credentials: true` in CORS config
2. **Cookie Not Set**: Check domain and secure flag settings
3. **401 Errors**: Verify JWT_SECRET matches between requests
4. **API Calls Fail**: Check VITE_API_URL in frontend .env

### Debug Tips
```javascript
// Check auth state
console.log('Auth state:', useAuth())

// Check cookies (in browser dev tools)
document.cookie

// Test API directly
apiClient.health().then(console.log)
```

## 📝 Next Steps

1. **Rate Limiting**: Add request rate limiting
2. **Refresh Tokens**: Implement token refresh mechanism
3. **Session Management**: Add session timeout warnings
4. **API Caching**: Implement response caching for better performance