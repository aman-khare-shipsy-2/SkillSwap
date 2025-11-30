# Quick Start: Deploy to Render (5 Minutes)

## Prerequisites
- GitHub account
- Render account (free at render.com)
- MongoDB Atlas account (free at mongodb.com/cloud/atlas)

## Step 1: Push to GitHub (2 min)

```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/yourusername/skill-swap-backend.git
git push -u origin main
```

## Step 2: MongoDB Atlas Setup (2 min)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (M0)
3. Create database user (Database Access → Add New User)
4. Whitelist IP: Network Access → Add IP → Allow from anywhere (0.0.0.0/0)
5. Get connection string: Clusters → Connect → Connect your application
6. Copy connection string (replace `<password>` and `<dbname>`)

## Step 3: Deploy to Render (1 min)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub → Select your repository
4. Configure:
   - **Name:** `skill-swap-backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
5. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/skill-swap
   JWT_SECRET=<generate-32-char-secret>
   CORS_ORIGIN=https://your-frontend.com,http://localhost:3000
   NODE_ENV=production
   ```
6. Click "Create Web Service"
7. Wait for deployment (2-3 minutes)

## Step 4: Test Deployment

```bash
curl https://your-app.onrender.com/api/health
```

Should return:
```json
{"status":"OK","message":"API is running","timestamp":"..."}
```

## Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or visit: https://generate-secret.vercel.app/32

## Your API URL

After deployment, your API will be available at:
```
https://your-app-name.onrender.com
```

Health check: `https://your-app-name.onrender.com/api/health`

## Important Notes

⚠️ **Free Tier Limitations:**
- Spins down after 15 min inactivity
- Takes 30-60 seconds to wake up
- 512 MB RAM limit

💡 **Keep It Alive:**
- Use [UptimeRobot](https://uptimerobot.com) to ping `/api/health` every 5 minutes
- Or upgrade to paid plan for always-on

## Troubleshooting

**Build fails?**
- Check logs in Render dashboard
- Ensure all dependencies are in package.json

**App crashes?**
- Check environment variables are set
- Verify MongoDB connection string
- Check MongoDB Atlas network access

**Need help?**
- See full guide: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
- Check Render docs: https://render.com/docs

