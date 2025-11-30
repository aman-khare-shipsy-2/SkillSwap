# Render Deployment Guide for Skill Swap Backend

This guide will help you deploy the Skill Swap Backend to Render for free.

## Prerequisites

1. A GitHub account
2. A Render account (sign up at [render.com](https://render.com))
3. A MongoDB database (MongoDB Atlas free tier recommended)

## Step 1: Prepare Your Repository

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Ensure all files are committed**, including:
   - `package.json`
   - `tsconfig.json`
   - `render.yaml`
   - All source files in `src/`

## Step 2: Set Up MongoDB Atlas (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (choose the free M0 tier)
4. Create a database user:
   - Go to Database Access
   - Add New Database User
   - Choose Password authentication
   - Save the username and password
5. Whitelist IP addresses:
   - Go to Network Access
   - Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
6. Get your connection string:
   - Go to Clusters
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `skill-swap` or your preferred database name

## Step 3: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. **Connect GitHub to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select your repository
   - Render will automatically detect `render.yaml`

2. **Configure Environment Variables:**
   - After creating the service, go to Environment
   - Add the following environment variables:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skill-swap?retryWrites=true&w=majority
     JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
     CORS_ORIGIN=https://your-frontend-domain.com,http://localhost:3000
     NODE_ENV=production
     PORT=10000
     JWT_EXPIRES_IN=7d
     UPLOAD_PATH=./uploads
     MAX_FILE_SIZE=20971520
     ```

3. **Deploy:**
   - Render will automatically build and deploy
   - Monitor the build logs
   - Once deployed, you'll get a URL like: `https://skill-swap-backend.onrender.com`

### Option B: Manual Setup

1. **Create a Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

2. **Configure Service:**
   - **Name:** `skill-swap-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

3. **Set Environment Variables:**
   - Click on "Environment"
   - Add all environment variables listed in Option A

4. **Deploy:**
   - Click "Create Web Service"
   - Render will build and deploy your application

## Step 4: Configure Environment Variables

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/skill-swap` |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) | `your-super-secret-key-here` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `https://yourdomain.com,http://localhost:3000` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (auto-set by Render) | `10000` |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |
| `UPLOAD_PATH` | File upload directory | `./uploads` |
| `MAX_FILE_SIZE` | Max file size in bytes | `20971520` (20MB) |

### Generating JWT_SECRET

You can generate a secure JWT secret using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use an online generator: https://generate-secret.vercel.app/32

## Step 5: Verify Deployment

1. **Check Health Endpoint:**
   ```
   GET https://your-app.onrender.com/api/health
   ```
   Should return:
   ```json
   {
     "status": "OK",
     "message": "API is running",
     "timestamp": "2024-01-01T00:00:00.000Z"
   }
   ```

2. **Test API Endpoints:**
   - Register a user: `POST /api/auth/register`
   - Login: `POST /api/auth/login`
   - Test authenticated endpoints

## Step 6: Configure Custom Domain (Optional)

1. Go to your service settings
2. Click "Custom Domains"
3. Add your domain
4. Follow DNS configuration instructions

## Important Notes for Free Tier

### Render Free Tier Limitations:
- **Spins down after 15 minutes of inactivity**
- **Takes 30-60 seconds to spin up** when receiving first request after inactivity
- **512 MB RAM limit**
- **0.1 CPU share**

### Recommendations:
1. **Use MongoDB Atlas Free Tier** (512 MB storage, shared cluster)
2. **Monitor your usage** to stay within free tier limits
3. **Consider upgrading** if you need:
   - No spin-down (always-on)
   - More resources
   - Better performance

### Handling Spin-Down:
- First request after inactivity will be slow (cold start)
- Consider using a service like [UptimeRobot](https://uptimerobot.com) to ping your health endpoint every 5 minutes to keep it alive
- Or upgrade to a paid plan for always-on service

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation works locally: `npm run build`

### Application Crashes
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure MongoDB connection string is correct
- Check that MongoDB Atlas allows connections from Render IPs

### Database Connection Issues
- Verify MongoDB Atlas network access allows all IPs (0.0.0.0/0)
- Check database user credentials
- Ensure connection string format is correct

### File Upload Issues
- Free tier has limited disk space
- Consider using cloud storage (AWS S3, Cloudinary) for production
- Files in `./uploads` directory are ephemeral on free tier

### CORS Issues
- Verify `CORS_ORIGIN` includes your frontend URL
- Include both production and development URLs if needed
- Format: `https://domain.com,http://localhost:3000`

## Monitoring

1. **View Logs:**
   - Go to your service in Render dashboard
   - Click "Logs" tab
   - Monitor real-time logs

2. **Metrics:**
   - View CPU, Memory, and Request metrics
   - Monitor for performance issues

3. **Alerts:**
   - Set up email alerts for service failures
   - Monitor error rates

## Next Steps

1. **Set up your frontend** to use the deployed API
2. **Configure environment variables** in your frontend
3. **Test all endpoints** to ensure everything works
4. **Set up monitoring** and alerts
5. **Consider upgrading** if you need better performance

## Support

- Render Documentation: https://render.com/docs
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com
- Project Issues: Check GitHub issues or create a new one

## Security Checklist

- [x] Strong JWT_SECRET (32+ characters)
- [x] MongoDB Atlas network access configured
- [x] CORS origins restricted to your domains
- [x] Environment variables secured (not in code)
- [x] HTTPS enabled (automatic on Render)
- [x] Rate limiting enabled
- [x] Input validation enabled
- [x] Error messages don't expose sensitive info

---

**Your API will be available at:** `https://your-app-name.onrender.com`

**Health Check:** `https://your-app-name.onrender.com/api/health`

