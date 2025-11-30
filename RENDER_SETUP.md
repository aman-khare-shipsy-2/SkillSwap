# Render Deployment Setup Guide

## Issue: package.json not found

If you're getting the error:
```
npm error path /opt/render/project/src/skill-swap-backend/package.json
npm error enoent Could not read package.json
```

## Solution 1: Manual Setup in Render Dashboard (Recommended)

1. **Go to your Render service settings**
   - Navigate to your service in the Render dashboard
   - Click on "Settings" tab

2. **Set the Root Directory**
   - Find "Root Directory" field
   - Set it to: `skill-swap-backend`
   - This tells Render where to find your `package.json`

3. **Verify Build and Start Commands**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - These should be relative to the root directory you set

4. **Environment Variables**
   Make sure these are set in the Render dashboard:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = (your MongoDB connection string)
   - `JWT_SECRET` = (your JWT secret)
   - `JWT_EXPIRES_IN` = `7d`
   - `PORT` = (leave empty, Render will set this automatically)
   - `CORS_ORIGIN` = (your frontend URL, e.g., `https://your-frontend.onrender.com`)
   - `UPLOAD_PATH` = `./uploads`
   - `MAX_FILE_SIZE` = `20971520`

5. **Save and Redeploy**
   - Click "Save Changes"
   - Trigger a manual deploy or push a new commit

## Solution 2: Using Blueprint (render.yaml)

If you're using Blueprint deployment, the `render.yaml` at the root should work with the updated commands:

```yaml
buildCommand: cd skill-swap-backend && npm install && npm run build
startCommand: cd skill-swap-backend && npm start
```

However, if Blueprint isn't working, use Solution 1 (Manual Setup) instead.

## Verify Your Repository Structure

Your repository should look like this:
```
SkillSwap/
├── render.yaml (at root)
├── skill-swap-backend/
│   ├── package.json  ← Render needs to find this
│   ├── src/
│   └── ...
└── skill-swap-frontend/
    └── ...
```

## Troubleshooting

- **If Root Directory setting doesn't exist:** You might be on an older Render plan. Try using the `cd` commands in build/start instead.
- **If still not working:** Check that `skill-swap-backend/package.json` exists in your GitHub repository
- **Check Render logs:** Look at the build logs to see what directory Render is starting from

