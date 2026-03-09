# Render Deployment Checklist ✅

## Pre-Deployment Setup

### 1. Repository Preparation
- [ ] Git repository initialized
- [ ] All code committed and pushed to GitHub
- [ ] .gitignore includes .env files and node_modules
- [ ] No sensitive data in repository

### 2. Environment Variables Ready
- [ ] Strong JWT_SECRET prepared (32+ characters)
- [ ] Gmail credentials ready (use App Passwords)
- [ ] Frontend and backend URLs planned

### 3. Code Preparation
- [ ] Backend CORS updated for production
- [ ] Frontend API configuration set up
- [ ] Build scripts tested locally
- [ ] Health check endpoint working

## Deployment Steps

### Backend Deployment (Do this first!)
1. [ ] Go to render.com → New Web Service
2. [ ] Connect GitHub repository
3. [ ] Configure service:
   - Name: `email-sender-backend`
   - Root Directory: `backend`
   - Build Command: `npm ci`
   - Start Command: `npm start`
4. [ ] Set environment variables:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=[your-strong-secret]
   DATABASE_URL=sqlite:./email_sender.db
   ```
5. [ ] Deploy and test
6. [ ] Copy backend URL: `https://your-backend.onrender.com`

### Frontend Deployment (Do this second!)
1. [ ] Go to render.com → New Static Site
2. [ ] Connect same GitHub repository
3. [ ] Configure service:
   - Name: `email-sender-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `dist`
4. [ ] Set environment variables:
   ```
   NODE_ENV=production
   VITE_API_URL=[your-backend-url]
   ```
5. [ ] Deploy and test

### Post-Deployment
1. [ ] Update backend CORS with actual frontend URL
2. [ ] Test full application flow:
   - [ ] User registration
   - [ ] User login
   - [ ] Add email sender
   - [ ] Send test email
   - [ ] View analytics
3. [ ] Configure custom domain (optional)
4. [ ] Set up monitoring/alerts

## Important URLs
- Backend: `https://email-sender-backend-[hash].onrender.com`
- Frontend: `https://email-sender-frontend-[hash].onrender.com`

## Troubleshooting
- Build errors → Check build logs in Render dashboard
- CORS errors → Update backend CORS configuration
- API errors → Check environment variables
- Email sending issues → Verify Gmail App Password

## Free Tier Considerations
- ⚠️ Services sleep after 15 minutes of inactivity
- ⚠️ SQLite data may not persist across restarts
- ⚠️ Consider upgrading for production use

## Security Notes
- ✅ Use strong, unique JWT_SECRET
- ✅ Use Gmail App Passwords, not regular passwords
- ✅ Never commit .env files to repository
- ✅ HTTPS is enabled by default on Render

Your app will be live at: `https://your-frontend-name.onrender.com` 🚀
