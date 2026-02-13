# Login API Troubleshooting Guide

## Issue
Login API not working - need to diagnose and fix

## Diagnostic Steps

### 1. Check if Backend Server is Running

**Windows PowerShell:**
```powershell
# Navigate to backend directory
cd e:\AI\adv\backendService

# Check if server process is running
Get-Process -Name node -ErrorAction SilentlyContinue

# If not running, start it
npm run dev
```

**Expected Output:**
```
Server is running on http://localhost:3001
Routes registered: /api/auth, /api/applications, ...
```

### 2. Install Missing Dependencies

The OneDrive integration requires axios, which may not be installed:

```powershell
# Fix PowerShell execution policy (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install axios
npm install axios

# Restart server
npm run dev
```

### 3. Test Login API Manually

**Using PowerShell (curl equivalent):**
```powershell
# Test with admin user
$body = @{
    email = "ravi@gmail.com"
    password = "Test@123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

**Using Browser Console / Postman:**
```javascript
// Login Request
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "ravi@gmail.com",
  "password": "Test@123"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1770292803275,
    "email": "ravi@gmail.com",
    "role": "Admin",
    "firstName": "Ravi",
    "permissions": [...]
  }
}
```

### 4. Check Backend Console Logs

With the enhanced logging I added, you should see:

```
[LOGIN] Received login request: { email: 'ravi@gmail.com' }
[LOGIN] Total users in database: 2
[LOGIN] User found: { id: 1770292803275, email: 'ravi@gmail.com', status: 'active' }
[LOGIN] Password matched, generating token
[LOGIN] User role: Admin Permissions count: X
[LOGIN] Login successful for user: ravi@gmail.com
```

## Common Issues & Solutions

### Issue 1: Server Not Running
**Symptoms:** Connection refused, ECONNREFUSED
**Solution:**
```powershell
cd e:\AI\adv\backendService
npm run dev
```

### Issue 2: Port Already in Use
**Symptoms:** Error: listen EADDRINUSE: address already in use :::3001
**Solution:**
```powershell
# Find process on port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Restart server
npm run dev
```

### Issue 3: CORS Error
**Symptoms:** Access blocked by CORS policy
**Solution:** Already configured in server.js for localhost:5173 and localhost:3000

### Issue 4: Invalid Credentials
**Symptoms:** 401 status, "Invalid credentials" message
**Possible Causes:**
1. Wrong email or password
2. User doesn't exist in users.json
3. Account status is not "active"

**Test Users:**
- **Admin:** ravi@gmail.com / Test@123
- **Staff:** sagar@gmail.com / Test@123

### Issue 5: Validation Errors
**Symptoms:** 400 status, "Invalid input"
**Solution:** Ensure request body includes:
- Valid email format
- Password field present

## Frontend Login Check

If backend is working but frontend login fails, check:

### 1. API Configuration
Check `webapp/src/api/axios.ts` or similar:
```typescript
const baseURL = 'http://localhost:3001/api';
```

### 2. Login Form Submission
Check network tab in browser DevTools:
- Request URL should be: http://localhost:3001/api/auth/login
- Method: POST
- Request payload should contain email and password
- Response should return token and user object

### 3. Redux/State Management
Check if login action properly stores token and user data

## Quick Fix Commands

```powershell
# Complete reset and restart
cd e:\AI\adv\backendService

# Install all dependencies
npm install

# Install axios for OneDrive
npm install axios

# Start server
npm run dev
```

## Test Script

After installing axios, you can run the test script:

```powershell
cd e:\AI\adv\backendService
node scripts/testLogin.js
```

This will test:
1. Admin login
2. Staff login
3. Invalid credentials (should fail)
4. Server health check

## Verification Checklist

- [ ] Backend server is running on port 3001
- [ ] Users exist in `data/users.json`
- [ ] User status is "active"
- [ ] Correct email and password are provided
- [ ] Request reaches the server (check console logs)
- [ ] Token is generated and returned
- [ ] Frontend receives and stores the token

## Need More Help?

1. **Check server console** for [LOGIN] log messages
2. **Check browser console** for network errors
3. **Check browser Network tab** for request/response details
4. **Verify .env file** has JWT_SECRET configured

## Alternative: Reset User Password

If you're unsure of the password, you can reset it:

```javascript
// Run this in Node REPL or create a script
const bcrypt = require('bcryptjs');
bcrypt.hash('NewPassword@123', 10).then(hash => console.log(hash));

// Then update users.json with the new hash
```

## Current Working Credentials

Based on the users.json file:
- Email: `ravi@gmail.com` | Password: `Test@123` (hashed)
- Email: `sagar@gmail.com` | Password: `Test@123` (hashed)

The password hash suggests the password is likely `Test@123` for both users.
