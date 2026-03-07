# Avatar Upload & Display Debugging Guide

## Console Logging Points

### Frontend - CyberpunkDashboard.jsx

#### 1. User Effect (When component loads or user changes)
```
=== USER EFFECT TRIGGERED ===
- Raw user object
- user.avatarUrl
- Computed Avatar Source
- Updated profileForm
=== USER EFFECT COMPLETE ===
```

#### 2. Avatar Change (When selecting a file)
```
=== AVATAR CHANGE TRIGGERED ===
- Selected file details (name, size, type)
- FileReader progress
- Avatar preview set
=== AVATAR CHANGE COMPLETE ===
```

#### 3. Save Profile (When clicking SAVE_CHANGES)
```
=== SAVE PROFILE TRIGGERED ===
- Profile name being saved
- Password update status
- Avatar file detected
- FormData contents
- Backend response
- Updated user context
- Avatar preview URL
=== SAVE PROFILE COMPLETE ===
```

#### 4. Image Loading Events
- ✅ Sidebar avatar loaded successfully
- ❌ Sidebar avatar failed to load
- ✅ Header avatar loaded successfully  
- ❌ Header avatar failed to load
- ✅ Profile avatar preview loaded
- ❌ Profile avatar preview failed to load

### Backend - userController.js

#### Profile Update Endpoint
```
=== UPDATE PROFILE REQUEST ===
- User ID
- Request body
- Request file (if uploaded)
- Avatar URL to be saved
- Query execution
- Database update result
=== UPDATE PROFILE SUCCESS ===
```

### Backend - authController.js

#### Get Current User Endpoint
```
=== GET CURRENT USER ===
- User ID from token
- User data from DB
=== GET CURRENT USER SUCCESS ===
```

## Common Issues & Solutions

### Issue 1: Image shows as path instead of image
**Symptoms:** You see the file path like `/uploads/profiles/profile-123.jpg` instead of the actual image

**Debug Steps:**
1. Check browser console for "❌ avatar failed to load" messages
2. Check the computed avatar source in console
3. Verify the backend is running on port 5000
4. Check if `/uploads` folder exists in backend directory
5. Verify the image file exists in `backend/uploads/profiles/`

**Solution:** 
- The avatar URL should be prefixed with `http://localhost:5000` in the frontend
- Backend should serve static files from `/uploads` route
- Check CORS settings allow cross-origin resource access

### Issue 2: Avatar doesn't update after save
**Symptoms:** Image uploads successfully but doesn't show in dashboard

**Debug Steps:**
1. Check "Backend response user data" in console
2. Verify "Avatar URL from backend" is correct
3. Check "Updating user context with" shows the new avatarUrl
4. Verify "Setting avatar preview to" has the full URL

**Solution:**
- Ensure `updateUser()` is called with the new avatar URL
- Check that the user context is properly updated
- Verify the avatar preview is set with full URL (http://localhost:5000...)

### Issue 3: Image doesn't load (CORS errors)
**Symptoms:** Browser console shows CORS errors or image load failures

**Debug Steps:**
1. Check Network tab in browser DevTools
2. Look for failed requests to `/uploads/profiles/...`
3. Check response headers for CORS configuration

**Solution:**
- Backend server.js should have:
  ```javascript
  app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, path, stat) => {
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  }));
  ```

## Testing Steps

1. **Open browser DevTools (F12)**
2. **Go to Console tab**
3. **Upload an image:**
   - Watch for "AVATAR CHANGE TRIGGERED"
   - Verify "FileReader finished" shows data
   - Check "Avatar preview set to" has base64 data

4. **Click SAVE_CHANGES:**
   - Watch for "SAVE PROFILE TRIGGERED"
   - Check "Backend response user data"
   - Verify "Avatar URL from backend" is present
   - Confirm "Setting avatar preview to" has full URL

5. **Check image displays:**
   - Look for "✅ avatar loaded successfully" messages
   - If you see "❌ avatar failed to load", check the URL in the error

## Expected Console Output (Success Flow)

```
=== AVATAR CHANGE TRIGGERED ===
Selected file: File { ... }
File details: { name: "photo.jpg", size: 245678, type: "image/jpeg" }
Reading file as DataURL...
FileReader finished. Result length: 327560
Preview URL (first 100 chars): data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...
Profile form updated with new avatar preview
=== AVATAR CHANGE COMPLETE ===

=== SAVE PROFILE TRIGGERED ===
Profile name being saved: John Doe
Avatar file detected: { name: "photo.jpg", size: 245678, type: "image/jpeg" }
FormData contents:
name: John Doe
avatar: [object File]
Sending PUT request to /auth/profile...

Backend response received: { success: true, user: {...} }
Backend response user data: { id: 1, name: "John Doe", avatarUrl: "/uploads/profiles/profile-123.jpg" }
Avatar URL from backend: /uploads/profiles/profile-123.jpg
Updating user context with: { ..., avatarUrl: "/uploads/profiles/profile-123.jpg" }
Setting avatar preview to: http://localhost:5000/uploads/profiles/profile-123.jpg
Profile form state updated successfully
=== SAVE PROFILE COMPLETE ===

✅ Sidebar avatar loaded successfully: http://localhost:5000/uploads/profiles/profile-123.jpg
✅ Header avatar loaded successfully: http://localhost:5000/uploads/profiles/profile-123.jpg
✅ Profile avatar preview loaded: http://localhost:5000/uploads/profiles/profile-123.jpg
```

## Files Modified

### Frontend
- `frontend/src/pages/CyberpunkDashboard.jsx` - Added comprehensive logging
- `frontend/src/styles/index.css` - Added fallback icon CSS

### Backend  
- `backend/src/controllers/userController.js` - Added upload logging
- `backend/src/controllers/authController.js` - Added user fetch logging

## Quick Fix Checklist

- [ ] Backend server is running on port 5000
- [ ] Frontend is making requests to http://localhost:5000
- [ ] `/uploads/profiles/` folder exists in backend
- [ ] Static file serving is configured in server.js
- [ ] CORS is properly configured
- [ ] Image file was successfully uploaded to backend
- [ ] Database has avatar_url column
- [ ] User context is updating after save
- [ ] Avatar URLs are being prefixed with full domain
