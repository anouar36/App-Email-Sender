import { query } from '../config/sqlite-database.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only')),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const getProfile = async (req, res) => {
  try {
    const result = await query('SELECT id, username, email, full_name, avatar_url, created_at FROM users WHERE id = ?', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { full_name, password } = req.body;
    const userId = req.user.id;
    let avatarUrl = null;
    if (req.file) avatarUrl = `/uploads/profiles/${req.file.filename}`;

    // Build dynamic update
    const fields = [];
    const params = [];

    if (full_name) { fields.push('full_name = ?'); params.push(full_name); }
    if (avatarUrl) { fields.push('avatar_url = ?'); params.push(avatarUrl); }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push('password = ?');
      params.push(hashed);
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(userId);

    if (fields.length > 1) {
      await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    const result = await query('SELECT id, username, email, full_name, avatar_url FROM users WHERE id = ?', [userId]);
    res.json({ success: true, message: 'Profile updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};
