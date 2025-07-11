const dotenv = require('dotenv');
const colors = require('colors');

dotenv.config({ path: './config/config.env' });

const db = require('../config/db');
const User = require('../models/user/User');

const createAdminUser = async () => {
  try {
    await db.connect();

    const existingAdmin = await User.findByEmail('admin@pms.com');
    
    if (existingAdmin) {
      console.log('Admin user already exists!'.yellow);
      process.exit(0);
    }

    const adminData = {
      username: 'admin',
      email: 'admin@pms.com',
      password: 'Admin123!',
      role: 'admin',
      first_name: 'System',
      last_name: 'Administrator',
      phone_number: '+1234567890'
    };

    const admin = await User.create(adminData);
    
    console.log('Admin user created successfully!'.green);
    console.log('Email: admin@pms.com'.cyan);
    console.log('Password: Admin123!'.cyan);
    console.log('Please change the password after first login!'.yellow);

    process.exit(0);
  } catch (error) {
    console.error(`Error creating admin user: ${error.message}`.red);
    process.exit(1);
  }
};

createAdminUser();
