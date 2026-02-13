# Backend Restart Instructions

## The API is not responding. Here's how to fix it:

### Option 1: Restart Backend Server

1. **Stop the current backend:**
   - Find the terminal running backend
   - Press `Ctrl + C`

2. **Restart it:**
   ```bash
   cd backendService
   npm run dev
   ```

3. **You should see:**
   ```
   Server is running on http://localhost:3001
   Registered routes:
   - /api/auth
   - /api/users
   - /api/roles
   - /api/applications
   - /api/companies
   - /api/branches
   - /api/dashboard
   ```

### Option 2: Check for Errors

If the server won't start, check for errors in the terminal.

Common issues:
- Port 3001 already in use
- Syntax error in middleware
- Missing dependencies

### Option 3: Kill All Node Processes and Restart

```bash
# Kill all node processes
taskkill /F /IM node.exe

# Wait 2 seconds
# Then restart backend
cd backendService
npm run dev

# In another terminal, restart frontend
cd webapp
npm run dev
```

### Quick Test After Restart

Open browser console and run:
```javascript
fetch('http://localhost:3001/api/users', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(d => console.log('API Response:', d))
.catch(e => console.error('API Error:', e));
```

If you see a response, the API is working!

### Check Backend Terminal

You should see logs like:
```
[LOGIN] Received login request: { email: '...' }
[LOGIN] User found: { id: ..., email: '...' }
```

If you see errors, send me the error message.

## What Might Have Happened

The middleware changes I made could cause the server to:
1. Crash on startup (syntax error)
2. Rate limit responses (too many file reads)
3. Block all requests (logic error)

The most likely issue is that the middleware is reading users.json on EVERY request, which might be slow or causing rate limiting.

Let me know what you see when you restart the backend!
