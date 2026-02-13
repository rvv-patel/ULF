# Force Logout - Immediate Fix Steps

## Issue: Blank Page Instead of Redirect

The axios interceptor has been updated with better error handling and logging.

## Steps to Test NOW:

### 1. Open Browser Console
- Press `F12` on your keyboard
- Click on "Console" tab
- Keep it open

### 2. Force Logout a User
**As Admin:**
- Go to Users page
- Find an active user
- Click Force Logout (orange icon)
- Confirm

**As the User (in different browser/tab):**
- Try to click anything or refresh the page

### 3. Check Console Logs
You should see:
```
[Axios Interceptor] Auth error detected: {status: 403, message: "Account is inactive..."}
[Axios Interceptor] Clearing session and redirecting to login...
[Axios Interceptor] Redirecting now...
```

### 4. What Should Happen
1. Alert shows: "Account is inactive. Please contact administrator."
2. Page redirects to `/login`
3. Login page appears

## If Still Blank Page:

### Quick Fix 1: Hard Refresh
```bash
# In browser
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### Quick Fix 2: Clear Cache
```bash
# In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Quick Fix 3: Restart Frontend
```bash
# In terminal
cd webapp
# Press Ctrl+C to stop
npm run dev
```

## Debug Steps:

### Check 1: Is interceptor loaded?
In browser console, type:
```javascript
localStorage.clear();
window.location.href = '/login';
```
If this works, the issue is with the interceptor.

### Check 2: Check localStorage
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

### Check 3: Manual redirect
```javascript
window.location.replace('/login');
```

### Check 4: Check if on correct URL
```javascript
console.log('Current URL:', window.location.href);
console.log('Expected:', 'http://localhost:5173/login');
```

## Updated Code Summary:

The axios interceptor now:
- ✅ Catches 401 AND 403 errors
- ✅ Logs to console for debugging
- ✅ Checks error messages (case-insensitive)
- ✅ Uses `_retry` flag to prevent loops
- ✅ Clears both localStorage AND sessionStorage
- ✅ Uses `window.location.replace()` instead of `.href`
- ✅ Has 100ms timeout for reliability
- ✅ Returns Promise.reject properly

## Expected Behavior:

```
User makes request
  ↓
Gets 403 "Account is inactive"
  ↓
Axios interceptor catches it
  ↓
Console logs appear
  ↓
Alert shows
  ↓
Redirects to /login
  ↓
Login page displays
```

## If STILL Not Working:

Try this manual test:
1. Open browser console
2. Paste this code:
```javascript
// Force logout manually
localStorage.removeItem('token');
localStorage.removeItem('user');
alert('Logged out!');
window.location.replace('/login');
```
3. Press Enter

If this works but force logout doesn't, the issue is with the backend response or the force logout button itself.

## Check Backend Response:

In Network tab (F12 → Network):
1. Force logout a user
2. Look for the API call (should be PUT /api/users/{id})
3. Check Response:
   - Status should be 200 (success)
   - User status should be "inactive"
   - lastForcedLogoutAt should have timestamp

## Next Request Check:

After force logout, make any request (click menu, etc):
1. Check Network tab
2. Find the failing API call
3. Check Response:
   - Status: Should be 403 or 401
   - Message: Should include "inactive" or "session"

If you see the error but no redirect, then the interceptor isn't working.

## Nuclear Option:

If nothing works:
```bash
# Stop everything
Ctrl+C (in both backend and frontend terminals)

# Clear node modules and reinstall
cd webapp
rm -rf node_modules
npm install

# Restart
npm run dev
```

Let me know what you see in the console when you trigger force logout!
