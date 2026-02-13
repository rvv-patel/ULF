# Admin Login Issue - Quick Fix

## Problem
Admin cannot login. The login controller checks user status, and the middleware also checks status.

## Admin User Credentials

Based on users.json:

**Email:** `ravi@gmail.com`
**Password:** (the one you set)
**Role:** Admin
**Status:** active ✅

## Quick Test

Try logging in with:
- Email: `ravi@gmail.com`
- Password: `admin123` (or whatever password was set)

## If Login Still Fails:

### Check 1: Backend Console
Look for error messages in the backend terminal:
```
[LOGIN] Received login request: { email: 'ravi@gmail.com' }
[LOGIN] User found: { id: ..., status: 'active' }
[LOGIN] Password matched, generating token
[LOGIN] Login successful
```

### Check 2: Browser Console  
Open F12 → Console tab, look for:
```
POST http://localhost:3001/api/auth/login
Status: 403 or 401
Response: "Account is inactive" or other error
```

### Check 3: Network Tab
F12 → Network tab:
- Find the login request
- Check Status code
- Check Response body

## Manual Fix - Activate Admin

If for some reason the admin got deactivated, manually fix it:

1. **Stop the backend** (Ctrl+C)

2. **Edit users.json:**
   ```json
   {
     "id": 1770292803275,
     "email": "ravi@gmail.com",
     "status": "active",  ← Make sure this is "active"
     "role": "Admin"
   }
   ```

3. **Remove lastForcedLogoutAt if present:**
   Delete this line if it exists:
   ```json
   "lastForcedLogoutAt": "...",  ← DELETE THIS LINE
   ```

4. **Save the file**

5. **Restart backend:**
   ```bash
   cd backendService
   npm run dev
   ```

6. **Try login again**

## Create New Admin User

If needed, I can create a fresh admin user:

```json
{
  "id": 9999999,
  "email": "admin@admin.com",
  "password": "$2b$10$HICSU45ALGi4WhwKCq5dAeNStFKZssFaJy9DS.Xuyhq9jArrqyL36",
  "role": "Admin",
  "firstName": "Super",
  "lastName": "Admin",
  "status": "active",
  "phone": "0000000000",
  "dateJoined": "2026-02-10",
  "permissions": [],
  "address": "Office"
}
```

Password for this user: `admin123`

## Credentials to Try:

**Option 1:**
- Email: `ravi@gmail.com`
- Password: (your password)

**Option 2 (if password forgotten):**
- Email: `sagar@gmail.com`
- Status: Need to change to "active" first
- Password: (their password)

## What Error Are You Getting?

Please tell me:
1. What error message you see when trying to login
2. What email you're using
3. Check backend terminal for error logs

I'll help you fix it based on the specific error!
