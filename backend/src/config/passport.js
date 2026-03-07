import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from './database.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    proxy: true // Need this if behind a proxy/load balancer
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const googleId = profile.id;
      const name = profile.displayName;
      const picture = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

      // Check if user exists
      const userExists = await pool.query(
        'SELECT * FROM users WHERE google_id = $1 OR email = $2',
        [googleId, email]
      );

      if (userExists.rows.length > 0) {
        let user = userExists.rows[0];
        // If user has no google_id yet (signed up with email/pass), link it now
        if (!user.google_id) {
            await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
            user.google_id = googleId;
        }
        // Update avatar if not present or changed? Maybe just keep existing valid user.
        return done(null, user);
      }

      // Create new user if not exists
      // Generate a random password since they use Google Auth
      const randomPassword = uuidv4();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      const username = email.split('@')[0] + '_' + Math.floor(Math.random() * 10000); // ensure some uniqueness

      const result = await pool.query(
        'INSERT INTO users (username, email, password, full_name, avatar_url, google_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [username, email, hashedPassword, name, picture, googleId]
      );

      return done(null, result.rows[0]);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Although we won't heavily use sessions because we issue JWTs, passport requires these sometimes.
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, result.rows[0]);
    } catch (err) {
        done(err, null);
    }
});
