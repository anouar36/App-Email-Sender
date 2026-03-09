# 🚨 Render Deployment Error Fix Guide

## Common Build Errors and Solutions

### Error: better-sqlite3 compilation failed
**Symptoms:** npm errors related to better-sqlite3, node-gyp, python, or C++ compiler issues

**Solution:**
1. Update your Render service build command to:
   ```
   cd backend && npm install && npm rebuild better-sqlite3 --build-from-source
   ```

2. Add environment variable in Render:
   ```
   PYTHON=/usr/bin/python3
   ```

### Error: Package.json syntax errors
**Symptoms:** JSON parsing errors, unexpected tokens

**✅ Fixed:** Updated package.json files with proper formatting

### Error: Node.js version mismatch
**Symptoms:** Unsupported Node.js features, module errors

**✅ Fixed:** Added engines specification and .nvmrc file

## Quick Fix Steps for Your Current Deployment:

### 1. Update Your Render Backend Service:
Go to your backend service in Render dashboard:
- Navigate to "Settings" → "Build & Deploy"
- Update **Build Command** to:
  ```
  cd backend && npm install && npm rebuild better-sqlite3 --build-from-source
  ```
- Add Environment Variable:
  ```
  PYTHON=/usr/bin/python3
  ```

### 2. Redeploy:
- Go to "Manual Deploy" 
- Click "Deploy latest commit"
- Wait and monitor the logs

### 3. If Still Failing - Alternative Approach:

Use this simplified build command instead:
```
cd backend && npm install --production
```

And add this environment variable:
```
npm_config_build_from_source=true
```

## Alternative: Deploy Without render.yaml

If the render.yaml is causing issues, deploy manually:

### Backend Service:
- **Name:** email-sender-backend
- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && npm start`
- **Environment Variables:**
  ```
  NODE_ENV=production
  PORT=10000
  JWT_SECRET=ijLTzntwO=4c#RQ5?YEW$NoD0pgXG%%V*_SI!UKC1b87Jka^eylsuPH9mB6+vv2Aqd
  DATABASE_URL=sqlite:./email_sender.db
  PYTHON=/usr/bin/python3
  ```

### Frontend Service:
- **Name:** email-sender-frontend
- **Build Command:** `cd frontend && npm install && npm run build`
- **Publish Directory:** `frontend/dist`
- **Environment Variables:**
  ```
  NODE_ENV=production
  VITE_API_URL=https://your-backend-url.onrender.com
  ```

## Monitor Deployment:
Watch the logs in real-time:
1. Go to your service in Render dashboard
2. Click on "Logs" tab
3. Monitor for any new errors

## If All Else Fails - SQLite Alternative:
Consider switching to PostgreSQL (Render provides free PostgreSQL):
1. Create a PostgreSQL database in Render
2. Update your database connection code
3. This eliminates better-sqlite3 compilation issues

## Current Status:
✅ Package.json files fixed
✅ Build commands updated  
✅ Node.js version specified
✅ Environment variables ready

**Next Step:** Update your Render service settings and redeploy!
