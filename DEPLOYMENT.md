# 🚀 Deployment Guide

## Quick Deploy to Render.com

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project
3. Enable Authentication (Email/Password)
4. Create Realtime Database
5. Get your credentials from Project Settings

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Major upgrade: auth, animations, multi-user"
git push origin feature/major-upgrade
```

### Step 3: Deploy on Render
1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Select your repository
5. Fill in service details:
   - **Name**: savings-dashboard-pro
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 4: Set Environment Variables
In Render dashboard, add:

```
FIREBASE_API_KEY=your_value
FIREBASE_AUTH_DOMAIN=your_value
FIREBASE_PROJECT_ID=your_value
FIREBASE_STORAGE_BUCKET=your_value
FIREBASE_MESSAGING_SENDER_ID=your_value
FIREBASE_APP_ID=your_value
FIREBASE_DATABASE_URL=your_value
JWT_SECRET=generate_random_string
CORS_ORIGIN=your_deploy_url.onrender.com
NODE_ENV=production
```

### Step 5: Deploy
Click "Create Web Service" and wait for deployment ✅

## Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Fill in Firebase credentials
nano .env

# Start dev server
npm run dev

# Open http://localhost:3000
```

## Production Checklist

- [ ] Firebase rules are restrictive (not open)
- [ ] JWT_SECRET is strong (32+ chars)
- [ ] CORS_ORIGIN is set to your domain
- [ ] Environment variables are set
- [ ] Database backups enabled
- [ ] Error logging configured
- [ ] HTTPS enabled (automatic on Render)
- [ ] Rate limiting configured
- [ ] Helmet security headers enabled

## Monitoring

In Render Dashboard:
- View logs: Real-time server output
- Check metrics: CPU, memory, build time
- Monitor uptime: 99.9% SLA on paid plans

## Troubleshooting

### "Firebase credentials error"
- Verify all environment variables are set
- Check project ID matches
- Ensure database URL is correct

### "Connection refused"
- Check if port 3000 is available
- Verify Node.js version >= 18

### "Rate limit exceeded"
- Check if multiple deploys happening
- Wait 30 minutes before retry

## Scaling

When you need more:
1. Upgrade Render plan (paid)
2. Add caching layer (Redis)
3. Implement database indexing
4. Use CDN for static files

---

**Need help?** Check Render docs or Firebase docs
