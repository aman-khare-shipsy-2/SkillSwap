# Vercel Deployment Guide

## Configuration Files

### vercel.json
The `vercel.json` file has been created to handle client-side routing for the React SPA. This ensures all routes are properly handled by React Router.

## Environment Variables

Set these environment variables in your Vercel project settings:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the following variables:

### Required Variables:

- **VITE_API_URL**
  - Value: Your Render backend API URL
  - Example: `https://your-backend.onrender.com/api`
  - Note: Make sure to include `/api` at the end

- **VITE_SOCKET_URL**
  - Value: Your Render backend URL (without `/api`)
  - Example: `https://your-backend.onrender.com`
  - Note: Used for Socket.io connections

- **VITE_ENV**
  - Value: `production`
  - Note: Sets the environment mode

## Build Settings

In Vercel Dashboard → Your Project → Settings → General:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Root Directory:** `skill-swap-frontend` (if deploying from monorepo root)

## CORS Configuration

Make sure your backend (Render) has CORS configured to allow your Vercel domain:

In your backend `.env` or Render environment variables:
```
CORS_ORIGIN=https://your-frontend.vercel.app,https://your-custom-domain.com
```

Or if you want to allow all Vercel preview deployments:
```
CORS_ORIGIN=*
```

## Deployment Steps

1. **Push the vercel.json file to your repository**
2. **Set environment variables in Vercel Dashboard**
3. **Connect your GitHub repository to Vercel** (if not already done)
4. **Deploy** - Vercel will automatically deploy on push

## Troubleshooting

### 404 Errors
- Ensure `vercel.json` is in the frontend root directory
- Check that the rewrite rule is correct
- Verify the build output directory is `dist`

### API Connection Issues
- Verify `VITE_API_URL` is set correctly in Vercel
- Check backend CORS settings
- Ensure backend is running and accessible
- Check browser console for CORS errors

### Build Failures
- Check that all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18+ by default)
- Check build logs in Vercel dashboard

## Testing

After deployment:
1. Visit your Vercel URL
2. Check that routes like `/login`, `/dashboard` work
3. Test API calls from browser console
4. Verify Socket.io connections (if using chat)

