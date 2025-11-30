# MongoDB Connection Fix Guide

## Issue
You're getting: `Operation users.findOne() buffering timed out after 10000ms`

This error occurs because your IP address is not whitelisted in MongoDB Atlas.

## Solution

### Step 1: Get Your Current IP Address
Your current IP address is needed to whitelist it in MongoDB Atlas.

### Step 2: Whitelist Your IP in MongoDB Atlas

1. **Log in to MongoDB Atlas**
   - Go to https://cloud.mongodb.com
   - Sign in with your account

2. **Navigate to Network Access**
   - Click on your project
   - Go to **Network Access** in the left sidebar
   - Click **Add IP Address**

3. **Add Your IP**
   - Click **Add Current IP Address** (recommended)
   - OR manually enter your IP address
   - Click **Confirm**

4. **For Development (Less Secure)**
   - You can temporarily allow all IPs by adding `0.0.0.0/0`
   - ⚠️ **Warning**: Only use this for development, never in production!

### Step 3: Verify Connection String

Make sure your `.env` file has the correct MongoDB URI:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xaokebn.mongodb.net/skill-swap
```

### Step 4: Restart the Backend

After whitelisting your IP:
```bash
cd skill-swap-backend
npm run dev
```

## Alternative: Use Local MongoDB (For Development)

If you want to use a local MongoDB instance instead:

1. **Install MongoDB locally**
   ```bash
   # macOS
   brew install mongodb-community
   
   # Start MongoDB
   brew services start mongodb-community
   ```

2. **Update .env**
   ```env
   MONGODB_URI=mongodb://localhost:27017/skill-swap
   ```

3. **Restart backend**

## Connection Timeout Settings

The connection has been updated with better timeout settings:
- `serverSelectionTimeoutMS: 30000` (30 seconds)
- `socketTimeoutMS: 45000` (45 seconds)
- `connectTimeoutMS: 30000` (30 seconds)

These settings give more time for the connection to establish, especially if there are network delays.

## Troubleshooting

If you still have issues:

1. **Check MongoDB Atlas Status**
   - Ensure your cluster is running
   - Check for any service alerts

2. **Verify Credentials**
   - Double-check username and password in connection string
   - Ensure special characters are URL-encoded (e.g., `@` becomes `%40`)

3. **Check Firewall/VPN**
   - If using a VPN, you may need to whitelist the VPN IP
   - Corporate firewalls might block MongoDB connections

4. **Test Connection**
   ```bash
   # Test MongoDB connection directly
   mongosh "mongodb+srv://username:password@cluster0.xaokebn.mongodb.net/skill-swap"
   ```

## Quick Fix Command

To quickly allow all IPs (development only):
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Enter `0.0.0.0/0`
4. Add comment: "Development - Allow all IPs"
5. Click "Confirm"

⚠️ **Remember to remove this after development!**

