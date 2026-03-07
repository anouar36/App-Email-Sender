import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js'; // Assuming pool is exported from a db module

// Configure storage for profile images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads/profiles');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export const updateProfile = async (req, res) => {
  try {
    console.log("=== UPDATE PROFILE REQUEST ===");
    const userId = req.user.id;
    console.log("User ID:", userId);
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    const { name, email, password } = req.body;
    let avatarUrl = null;

    if (req.file) {
      // Store relative path
      avatarUrl = `/uploads/profiles/${req.file.filename}`;
      console.log("Avatar file uploaded:", req.file.filename);
      console.log("Avatar URL to be saved:", avatarUrl);
    }

    // Update user in database using userId
    let query = 'UPDATE users SET full_name = COALESCE($1, full_name)';
    const params = [name];
    let paramIndex = 2;

    if (avatarUrl) {
      query += `, avatar_url = $${paramIndex}`;
      params.push(avatarUrl);
      paramIndex++;
    }

    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query += `, password = $${paramIndex}`;
        params.push(hashedPassword);
        paramIndex++;
        console.log("Password will be updated");
    }
    
    query += ` WHERE id = $${paramIndex} RETURNING id, username, email, full_name, avatar_url`;
    params.push(userId);

    console.log("Executing query:", query);
    console.log("Query params:", params);

    const result = await pool.query(query, params);
    
    console.log("Database update result:", result.rows[0]);
    
    // Return updated user data
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: result.rows[0].id,
        name: result.rows[0].full_name,
        email: result.rows[0].email,
        avatarUrl: result.rows[0].avatar_url
      }
    });
    
    console.log("=== UPDATE PROFILE SUCCESS ===\n");

  } catch (error) {
    console.error("=== UPDATE PROFILE ERROR ===");
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};
