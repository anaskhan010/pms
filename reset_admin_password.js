import db from './config/db.js';
import bcrypt from 'bcryptjs';

const resetAdminPassword = async () => {
  try {
    console.log('🔐 Resetting admin password...');
    
    // New password
    const newPassword = 'admin123';
    
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update admin user password
    const [result] = await db.execute(
      'UPDATE user SET password = ? WHERE email = ?',
      [hashedPassword, 'admin@gmail.com']
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ Admin password updated successfully!');
      console.log('📧 Email: admin@gmail.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('❌ No admin user found with email admin@gmail.com');
    }
    
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
  } finally {
    process.exit(0);
  }
};

resetAdminPassword();
