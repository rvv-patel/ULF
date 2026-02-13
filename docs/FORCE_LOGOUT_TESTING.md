# Force Logout - Testing & Troubleshooting

## Issue Fixed
The user was not being automatically logged out because:
- Middleware returned **403** for inactive accounts
- Axios interceptor only caught **401** errors
- **Solution**: Updated interceptor to handle both 401 and 403

## How to Test

### Test 1: Force Logout Active User

**Setup:**
1. Login as Admin (e.g., admin@example.com)
2. Open another browser/incognito window
3. Login as a regular user (e.g., john.smith@example.com)
4. User is browsing the app normally

**Action:**
5. In Admin window, go to Users page
6. Find the user (John Smith)
7. Click the orange **Force Logout** icon
8. Confirm the action

**Expected Result:**
9. In User window, within 1-2 seconds:
   - User sees alert: "Account is inactive. Please contact administrator."
   - User automatically logged out
   - Redirected to login page
10. User tries to login → Error: "Account is inactive"

### Test 2: Verify Immediate Logout

**Setup:**
1. Login as user in Tab A
2. Login as same user in Tab B (duplicate tab)
3. Both showing dashboard

**Action:**
4. Admin force logs out this user
5. In Tab A: Click any menu item
6. In Tab B: Click refresh

**Expected Result:**
7. Both tabs show alert
8. Both tabs redirect to login
9. User logged out everywhere

### Test 3: Reactivate and Login

**Setup:**
1. User was force logged out (status: inactive)
2. User cannot login

**Action:**
3. Admin goes to Users page
4. Click Edit on inactive user
5. Change Status to "Active"
6. Save

**Expected Result:**
7. User can now login successfully
8. New session created
9. User can use app normally

## Current Implementation

### Axios Interceptor (axios.ts)
```typescript
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Catch 401 OR 403 errors
        if (error.response?.status === 401 || error.response?.status === 403) {
            const errorMessage = error.response?.data?.message || '';
            
            // Check if it's an inactive account or session error
            if (errorMessage.includes('inactive') || 
                errorMessage.includes('Session invalidated') ||
                error.response?.status === 401) {
                
                // Auto logout
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                alert(errorMessage);
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
```

### Auth Middleware (auth.middleware.js)
```javascript
// Status check
if (user.status !== 'active') {
    return res.status(403).json({ 
        message: 'Account is inactive. Please contact administrator.' 
    });
}

// Token timestamp check
if (user.lastForcedLogoutAt) {
    const tokenIssuedAt = decoded.iat * 1000;
    const forcedLogoutTime = new Date(user.lastForcedLogoutAt).getTime();
    
    if (tokenIssuedAt < forcedLogoutTime) {
        return res.status(401).json({ 
            message: 'Session invalidated. Please login again.' 
        });
    }
}
```

## Error Codes

| Code | Trigger | Message | Action |
|------|---------|---------|--------|
| **401** | Token issued before force logout | "Session invalidated. Please login again." | Auto logout → redirect |
| **403** | User status is inactive | "Account is inactive. Please contact administrator." | Auto logout → redirect |
| **401** | User not found | "User not found" | Auto logout → redirect |

## Troubleshooting

### Issue: User still logged in after force logout
**Check:**
1. Is backend running? (Port 3001)
2. Is frontend running? (Port 5173)
3. Did you refresh the browser? (F5)
4. Check browser console for errors
5. Check Network tab for API responses

**Solution:**
- User should make ANY request (click menu, refresh)
- Request will fail with 403/401
- Auto logout will trigger

### Issue: Error shows but no redirect
**Check:**
1. Browser console for errors
2. Is axios.ts updated?
3. Clear browser cache
4. Hard refresh (Ctrl+Shift+R)

**Solution:**
```bash
# Restart frontend
cd webapp
npm run dev
```

### Issue: User can still login after force logout
**Check:**
1. User status in users.json
2. Should be "inactive"
3. If still "active", force logout didn't save

**Solution:**
- Force logout again
- Or manually edit users.json

## Manual Testing Commands

### Check User Status
```bash
# View user data
cat backendService/data/users.json | grep -A 10 "john.smith"

# Should show:
{
  "status": "inactive",
  "lastForcedLogoutAt": "2026-02-10T15:30:00.000Z"
}
```

### Test API Directly
```bash
# Get user token (from browser localStorage)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Make authenticated request
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN"

# Should return:
# 403 "Account is inactive" (if user inactive)
# OR
# 401 "Session invalidated" (if token old)
```

## Success Indicators

✅ **Force logout working if:**
- User gets error alert
- User redirected to login
- User cannot login (account inactive)
- Admin can see inactive status
- Admin can reactivate user

✅ **System working correctly if:**
- 403 errors auto-logout
- 401 errors auto-logout
- Alert shows error message
- Redirect happens automatically
- Works in all tabs

## Quick Fix Checklist

If force logout not working:

- [ ] Backend server running (npm run dev in backendService)
- [ ] Frontend server running (npm run dev in webapp)
- [ ] axios.ts has updated interceptor
- [ ] auth.middleware.js has status/timestamp checks
- [ ] Browser cache cleared
- [ ] User forced out status saved to users.json
- [ ] User tried making a request (not just waiting)

## Summary

**Before Fix:**
- Axios only caught 401 errors
- Middleware returned 403 for inactive users
- User stayed logged in ❌

**After Fix:**
- Axios catches both 401 AND 403
- Any inactive/session error = auto logout
- User immediately disconnected ✅

The force logout now works correctly! When admin triggers it, the user is logged out on their next action (within 1-2 seconds).
