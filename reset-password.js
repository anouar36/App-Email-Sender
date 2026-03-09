import bcrypt from 'bcryptjs';
import { query } from './backend/src/config/sqlite-database.js';

const resetPassword = async () => {
  try {
    const email = 'anouarechcharai@gmail.com';
    const newPassword = 'anouar123'; // You can change this to whatever you want
    
    console.log(`🔄 Resetting password for: ${email}`);
    console.log(`🔑 New password will be: ${newPassword}`);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password in database
    const result = await query(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
      [hashedPassword, email]
    );
    
    if (result.rowCount > 0) {
      console.log('✅ Password reset successful!');
      console.log('\n📋 Login credentials:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${newPassword}`);
    } else {
      console.log('❌ User not found with that email');
    }
    
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
  } finally {
    process.exit(0);
  }
};

resetPassword();
