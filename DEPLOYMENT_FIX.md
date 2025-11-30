# Deployment Fix for Register 404 Error

## Issue
Getting `{"success":false,"message":"Resource not found","error":"Route GET /api/auth/register not found"}` when trying to register.

## Root Causes

1. **Frontend Environment Variables Not Set**: Vercel deployment doesn't have `VITE_API_URL` configured
2. **Backend CORS Not Configured**: Backend on Render doesn't allow requests from Vercel domain
3. **API URL Defaulting to Localhost**: Frontend is trying to connect to `http://localhost:3001/api` instead of your Render backend

## Solutions

### 1. Set Vercel Environment Variables

In **Vercel Dashboard** → Your Project → Settings → Environment Variables, add:

```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
VITE_ENV=production
```

**Important**: Replace `your-backend.onrender.com` with your actual Render backend URL.

### 2. Update Backend CORS on Render

In **Render Dashboard** → Your Backend Service → Environment Variables, update:

```
CORS_ORIGIN=https://your-frontend.vercel.app,https://your-frontend.vercel.app/*
```

Or to allow all Vercel preview deployments:

```
CORS_ORIGIN=*
```

**Note**: If using `*`, make sure your backend security allows it (not recommended for production, but okay for personal projects).

### 3. Verify Backend is Running

Check that your Render backend is running and accessible:
- Visit: `https://your-backend.onrender.com/api/health`
- Should return: `{"status":"OK","message":"API is running"}`

### 4. Test the Fix

After setting environment variables:
1. **Redeploy Vercel** (or wait for auto-deploy)
2. **Restart Render backend** (if CORS was changed)
3. Try registering again

## Debugging Steps

### Check Frontend API URL
1. Open browser console on your Vercel site
2. Check Network tab when registering
3. Verify the request URL is `https://your-backend.onrender.com/api/auth/register` (not localhost)

### Check Backend Logs
1. Go to Render Dashboard → Your Backend → Logs
2. Look for CORS errors or 404 errors
3. Verify requests are reaching the backend

### Test Backend Directly
```bash
curl -X POST https://your-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"TestPass123"}'
```

## Common Issues

### Issue: Still getting 404
- **Check**: Is the request method POST? (Check browser Network tab)
- **Check**: Is the API URL correct in Vercel environment variables?
- **Check**: Did you redeploy Vercel after setting environment variables?

### Issue: CORS Error
- **Check**: Is your Vercel domain added to `CORS_ORIGIN` in Render?
- **Check**: Did you restart the Render backend after changing CORS?

### Issue: Network Error
- **Check**: Is your Render backend running? (Check Render dashboard)
- **Check**: Is the backend URL correct? (No typos in Vercel env vars)

