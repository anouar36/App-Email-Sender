import { query } from './backend/src/config/sqlite-database.js';

const checkDatabase = async () => {
  try {
    console.log('🔍 Checking database contents...\n');
    
    // Check users table
    console.log('👥 USERS TABLE:');
    console.log('================');
    const users = await query('SELECT id, username, email, full_name, created_at FROM users ORDER BY id');
    if (users.rows.length === 0) {
      console.log('❌ No users found in the database');
    } else {
      users.rows.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Full Name: ${user.full_name || 'Not set'}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('   ---');
      });
    }
    
    // Check templates table
    console.log('\n📄 TEMPLATES TABLE:');
    console.log('===================');
    const templates = await query('SELECT id, user_id, name, subject, created_at FROM templates ORDER BY id');
    if (templates.rows.length === 0) {
      console.log('❌ No templates found in the database');
    } else {
      templates.rows.forEach((template, index) => {
        console.log(`${index + 1}. ID: ${template.id} | User ID: ${template.user_id}`);
        console.log(`   Name: ${template.name}`);
        console.log(`   Subject: ${template.subject}`);
        console.log(`   Created: ${template.created_at}`);
        console.log('   ---');
      });
    }
    
    // Check senders table
    console.log('\n📧 SENDERS TABLE:');
    console.log('=================');
    const senders = await query('SELECT id, user_id, name, email, provider, created_at FROM senders ORDER BY id');
    if (senders.rows.length === 0) {
      console.log('❌ No senders found in the database');
    } else {
      senders.rows.forEach((sender, index) => {
        console.log(`${index + 1}. ID: ${sender.id} | User ID: ${sender.user_id}`);
        console.log(`   Name: ${sender.name}`);
        console.log(`   Email: ${sender.email}`);
        console.log(`   Provider: ${sender.provider}`);
        console.log(`   Created: ${sender.created_at}`);
        console.log('   ---');
      });
    }
    
    // Check emails table
    console.log('\n✉️ EMAILS TABLE:');
    console.log('================');
    const emails = await query('SELECT id, user_id, subject, status, created_at FROM emails ORDER BY id LIMIT 10');
    if (emails.rows.length === 0) {
      console.log('❌ No emails found in the database');
    } else {
      console.log(`Showing first 10 emails (total might be more):`);
      emails.rows.forEach((email, index) => {
        console.log(`${index + 1}. ID: ${email.id} | User ID: ${email.user_id}`);
        console.log(`   Subject: ${email.subject}`);
        console.log(`   Status: ${email.status}`);
        console.log(`   Created: ${email.created_at}`);
        console.log('   ---');
      });
    }
    
    // Show total counts
    console.log('\n📊 SUMMARY COUNTS:');
    console.log('==================');
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    const templateCount = await query('SELECT COUNT(*) as count FROM templates');
    const senderCount = await query('SELECT COUNT(*) as count FROM senders');
    const emailCount = await query('SELECT COUNT(*) as count FROM emails');
    
    console.log(`👥 Users: ${userCount.rows[0].count}`);
    console.log(`📄 Templates: ${templateCount.rows[0].count}`);
    console.log(`📧 Senders: ${senderCount.rows[0].count}`);
    console.log(`✉️ Emails: ${emailCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    process.exit(0);
  }
};

checkDatabase();
