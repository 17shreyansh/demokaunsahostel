# Kaunsa College - Deployment Guide

## ✅ JWT & Authentication Setup

### Current Implementation:
- ✅ Backend uses JWT with HTTP-only cookies
- ✅ Frontend configured with `withCredentials: true`
- ✅ Proper CORS setup for credential handling
- ✅ Request/Response interceptors for auth management

### Security Features:
- HTTP-only cookies prevent XSS attacks
- Secure cookie settings for production
- Automatic token refresh handling
- Protected route authentication

## 🔧 Development Setup

### Prerequisites:
- Node.js 16+ 
- MongoDB (local or cloud)
- Git

### Quick Start:
```bash
# Run the setup script
./setup-dev.bat

# Or manually:
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

### Environment Variables:

**Backend (.env):**
```
MONGODB_URI=mongodb://localhost:27017/hostel_enquiry
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=5000
```

**Frontend (.env):**
```
VITE_API_URL=/api
VITE_UPLOADS_BASE_URL=/uploads
VITE_BACKEND_URL=http://localhost:5000
```

## 🚀 Production Deployment

### Backend (Vercel/Railway/Heroku):
1. Set environment variables:
   - `MONGODB_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET` (strong secret key)
   - `NODE_ENV=production`

2. Update CORS origins in `server.js`
3. Deploy backend first

### Frontend (Vercel/Netlify):
1. Update `.env.production`:
   ```
   VITE_API_URL=https://your-backend-domain.vercel.app/api
   VITE_UPLOADS_BASE_URL=https://your-backend-domain.vercel.app/uploads
   ```

2. Build and deploy:
   ```bash
   npm run build:prod
   ```

## 🔄 DevOps & Connection Flow

### Development Flow:
```
Frontend (localhost:3000) 
    ↓ Vite Proxy
Backend (localhost:5000)
    ↓ 
MongoDB (local/cloud)
```

### Production Flow:
```
Frontend (Vercel) 
    ↓ API Calls
Backend (Vercel/Railway) 
    ↓ 
MongoDB Atlas
```

## 🛠 Key Improvements Made:

1. **Replaced Vercel Proxy with Vite Proxy:**
   - Better development experience
   - Proper credential handling
   - Faster hot reloading

2. **Centralized API Client:**
   - Single axios instance
   - Consistent JWT handling
   - Better error management

3. **Performance Optimizations:**
   - Combined filter operations
   - Reduced API calls
   - Better caching

4. **Security Enhancements:**
   - Proper URL encoding
   - CORS configuration
   - HTTP-only cookies

## 🧪 Testing Authentication:

1. Start both servers
2. Visit: http://localhost:3000/admin/login
3. Use demo credentials:
   - Username: `admin`
   - Password: `admin123`
4. Check browser cookies for `authToken`
5. Test protected routes

## 📝 Admin Panel Access:
- URL: `/admin/login`
- Demo Credentials: admin/admin123
- Features: Hostel management, enquiries, leads, settings

## 🔍 Troubleshooting:

### CORS Issues:
- Check backend CORS configuration
- Verify frontend origin in backend

### JWT Issues:
- Check cookie settings
- Verify JWT_SECRET in backend
- Check browser developer tools

### Proxy Issues:
- Ensure Vite proxy is configured
- Check backend server is running
- Verify API endpoints