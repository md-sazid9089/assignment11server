import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'sazid98@gmail.com' });
    
    if (existingAdmin) {
      // Update existing user to admin
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Updated existing user to admin role');
    } else {
      // Create new admin user
      const admin = new User({
        name: 'Admin User',
        email: 'sazid98@gmail.com',
        photoURL: 'https://i.ibb.co/KyrMvxz/admin-avatar.png',
        role: 'admin',
        fraudFlag: false,
        firebaseUid: 'admin-firebase-uid-' + Date.now(),
      });
      
      await admin.save();
      console.log('Admin user created successfully');
    }

    console.log('\nAdmin credentials:');
    console.log('Email: sazid98@gmail.com');
    console.log('Password: admin123');
    console.log('\nNote: You need to create this user in Firebase Authentication manually.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
