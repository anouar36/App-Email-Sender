import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../email_sender.db');

let db;

export const getDb = () => {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
  }
  return db;
};

export const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    try {
      console.log('📊 Initializing SQLite database...');
      const db = getDb();

      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          full_name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.exec(`
        CREATE TABLE IF NOT EXISTS senders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          password TEXT NOT NULL,
          provider TEXT DEFAULT 'gmail',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      db.exec(`
        CREATE TABLE IF NOT EXISTS email_campaigns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          sender_id INTEGER NOT NULL,
          subject TEXT NOT NULL,
          content TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          total_recipients INTEGER DEFAULT 0,
          sent_count INTEGER DEFAULT 0,
          failed_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (sender_id) REFERENCES senders(id) ON DELETE CASCADE
        )
      `);

      db.exec(`
        CREATE TABLE IF NOT EXISTS emails (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          campaign_id INTEGER NOT NULL,
          recipient_email TEXT NOT NULL,
          recipient_name TEXT,
          company_name TEXT,
          status TEXT DEFAULT 'pending',
          error_message TEXT,
          sent_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE
        )
      `);

      db.exec(`
        CREATE TABLE IF NOT EXISTS templates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          subject TEXT NOT NULL,
          body TEXT NOT NULL,
          type TEXT DEFAULT 'custom',
          is_default INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      db.exec(`
        CREATE TABLE IF NOT EXISTS config (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          config_key TEXT UNIQUE NOT NULL,
          config_value TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Database initialized successfully');
      resolve();
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      reject(error);
    }
  });
};

// Async query wrapper for better-sqlite3 (to maintain compatibility)
export const query = async (sql, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      const db = getDb();
      const upper = sql.trim().toUpperCase();
      if (upper.startsWith('SELECT')) {
        const stmt = db.prepare(sql);
        const rows = stmt.all(params);
        resolve({ rows });
      } else if (upper.startsWith('INSERT')) {
        const stmt = db.prepare(sql);
        const result = stmt.run(params);
        const tableName = sql.match(/INSERT INTO (\w+)/i)?.[1];
        if (tableName && result.lastInsertRowid) {
          const selectStmt = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`);
          const row = selectStmt.get(result.lastInsertRowid);
          resolve({ rows: row ? [row] : [], lastInsertId: result.lastInsertRowid });
        } else {
          resolve({ rows: [], lastInsertId: result.lastInsertRowid });
        }
      } else {
        const stmt = db.prepare(sql);
        const result = stmt.run(params);
        resolve({ rows: [], rowCount: result.changes });
      }
    } catch (error) {
      console.error('Query error:', error);
      reject(error);
    }
  });
};

export default { query, initializeDatabase };
