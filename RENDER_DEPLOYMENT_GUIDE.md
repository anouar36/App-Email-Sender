# Deploy Email Sender App to Render

## Prerequisites
1. GitHub account
2. Render account (free at render.com)
3. Your app code ready

## Step 1: Prepare Your Repository

1. **Initialize Git Repository (if not already done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository:**
   - Go to github.com
   - Create a new repository named "email-sender-app"
   - Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/email-sender-app.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy Backend API

1. **Go to Render Dashboard:**
   - Visit render.com and sign in
   - Click "New +" → "Web Service"

2. **Connect Repository:**
   - Connect your GitHub account
   - Select your "email-sender-app" repository
   - Click "Connect"

3. **Configure Backend Service:**
   - **Name:** `email-sender-backend`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (or upgrade as needed)

4. **Environment Variables:**
   Add these in the Environment tab:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   DATABASE_URL=sqlite:./email_sender.db
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://email-sender-backend-XXXX.onrender.com`

## Step 3: Deploy Frontend

1. **Create Static Site:**
   - In Render Dashboard, click "New +" → "Static Site"
   - Connect same repository
   - Click "Connect"

2. **Configure Frontend Service:**
   - **Name:** `email-sender-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

3. **Environment Variables:**
   Add this in the Environment tab:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
   (Replace with your actual backend URL from Step 2)

4. **Deploy:**
   - Click "Create Static Site"
   - Wait for deployment (5-10 minutes)
   - Note your frontend URL: `https://email-sender-frontend-XXXX.onrender.com`

## Step 4: Update CORS Settings

1. **Update Backend CORS:**
   After deployment, update your backend CORS settings to include your frontend URL.

2. **Test the Application:**
   - Visit your frontend URL
   - Try logging in and sending emails
   - Check both services are communicating

## Step 5: Configure Custom Domain (Optional)

1. **In Render Dashboard:**
   - Go to your frontend service
   - Click "Settings" → "Custom Domains"
   - Add your domain name

2. **Update DNS:**
   - Add CNAME record pointing to your Render URL

## Important Notes

### Free Tier Limitations:
- Services sleep after 15 minutes of inactivity
- 750 hours/month limit
- Slower cold starts

### Database Considerations:
- SQLite files are ephemeral on free tier
- Consider upgrading to PostgreSQL for production
- Data may be lost on service restarts

### Gmail Configuration:
- Use App Passwords, not regular passwords
- Enable 2FA on Gmail account
- Generate app-specific passwords

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check build logs in Render dashboard
   - Verify package.json scripts
   - Ensure all dependencies are listed

2. **Environment Variables:**
   - Check spelling and values
   - Restart services after changes
   - Use Render's environment variable interface

3. **CORS Errors:**
   - Update backend CORS settings
   - Verify frontend API URL configuration

4. **Database Issues:**
   - Check SQLite database initialization
   - Verify file permissions
   - Consider using PostgreSQL for persistence

### Service URLs:
- Backend: https://email-sender-backend-XXXX.onrender.com
- Frontend: https://email-sender-frontend-XXXX.onrender.com

Replace XXXX with your actual service identifiers.

## Security Checklist

- ✅ Strong JWT secret
- ✅ Environment variables set
- ✅ CORS properly configured
- ✅ .env files in .gitignore
- ✅ Database access restricted
- ✅ HTTPS enabled (automatic on Render)

Your Email Sender App is now live! 🚀
