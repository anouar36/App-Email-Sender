import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database setup
const dbPath = join(__dirname, 'email_tracking.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
export function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Main emails table
            db.run(`
                CREATE TABLE IF NOT EXISTS emails (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    to_email TEXT NOT NULL,
                    company_name TEXT,
                    subject TEXT,
                    body TEXT,
                    sent_date TEXT,
                    sent_time TEXT,
                    status TEXT DEFAULT 'sent',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('❌ Database initialization error:', err);
                    reject(err);
                } else {
                    console.log('✅ Database initialized successfully');
                    resolve();
                }
            });

            // Create index for faster queries
            db.run(`CREATE INDEX IF NOT EXISTS idx_email_date ON emails(sent_date)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_company ON emails(company_name)`);
        });
    });
}

// Save email data to database
export function saveEmailData(emailData) {
    return new Promise((resolve, reject) => {
        const {
            to_email,
            company_name,
            subject,
            body,
            sent_date,
            sent_time
        } = emailData;

        const query = `
            INSERT INTO emails (to_email, company_name, subject, body, sent_date, sent_time)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(query, [to_email, company_name, subject, body, sent_date, sent_time], function(err) {
            if (err) {
                console.error('❌ Error saving email to database:', err);
                reject(err);
            } else {
                console.log(`✅ Email saved to database with ID: ${this.lastID}`);
                resolve({
                    id: this.lastID,
                    success: true,
                    message: 'Email data saved successfully'
                });
            }
        });
    });
}

// Get all emails with optional filters
export function getEmails(filters = {}) {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM emails';
        let params = [];
        let conditions = [];

        // Add filters if provided
        if (filters.company_name) {
            conditions.push('company_name LIKE ?');
            params.push(`%${filters.company_name}%`);
        }

        if (filters.date_from) {
            conditions.push('sent_date >= ?');
            params.push(filters.date_from);
        }

        if (filters.date_to) {
            conditions.push('sent_date <= ?');
            params.push(filters.date_to);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('❌ Error retrieving emails:', err);
                reject(err);
            } else {
                console.log(`✅ Retrieved ${rows.length} emails from database`);
                resolve(rows);
            }
        });
    });
}

// Get email statistics
export function getEmailStats() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const stats = {};

            // Total emails sent
            db.get('SELECT COUNT(*) as total FROM emails', (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                stats.totalEmails = row.total;

                // Emails by company
                db.all(`
                    SELECT company_name, COUNT(*) as count 
                    FROM emails 
                    WHERE company_name IS NOT NULL 
                    GROUP BY company_name 
                    ORDER BY count DESC
                `, (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    stats.emailsByCompany = rows;

                    // Emails by date (last 30 days)
                    db.all(`
                        SELECT sent_date, COUNT(*) as count 
                        FROM emails 
                        WHERE sent_date >= date('now', '-30 days')
                        GROUP BY sent_date 
                        ORDER BY sent_date DESC
                    `, (err, rows) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        stats.emailsByDate = rows;

                        console.log('✅ Email statistics retrieved successfully');
                        resolve(stats);
                    });
                });
            });
        });
    });
}

// Delete old emails (optional cleanup function)
export function cleanupOldEmails(daysOld = 90) {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM emails WHERE created_at < date('now', '-${daysOld} days')`;
        
        db.run(query, function(err) {
            if (err) {
                console.error('❌ Error cleaning up old emails:', err);
                reject(err);
            } else {
                console.log(`✅ Cleaned up ${this.changes} old emails (older than ${daysOld} days)`);
                resolve({
                    deleted: this.changes,
                    message: `Cleaned up ${this.changes} old emails`
                });
            }
        });
    });
}

// Close database connection
export function closeDatabase() {
    return new Promise((resolve) => {
        db.close((err) => {
            if (err) {
                console.error('❌ Error closing database:', err);
            } else {
                console.log('✅ Database connection closed');
            }
            resolve();
        });
    });
}

// Export database instance for direct queries if needed
export { db };
