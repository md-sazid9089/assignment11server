import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create Admin User
    const adminEmail = 'sazid98@gmail.com';
    let existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('✅ Updated existing user to admin role');
    } else {
      const admin = new User({
        name: 'Admin User',
        email: adminEmail,
        photoURL: 'https://i.ibb.co/KyrMvxz/admin-avatar.png',
        role: 'admin',
        fraudFlag: false,
        firebaseUid: 'admin-firebase-uid-' + Date.now(),
      });
      
      await admin.save();
      console.log('✅ Admin user created successfully');
    }

    // Create Vendor User
    const vendorEmail = 'vendor@test.com';
    let existingVendor = await User.findOne({ email: vendorEmail });
    
    if (existingVendor) {
      existingVendor.role = 'vendor';
      await existingVendor.save();
      console.log('✅ Updated existing user to vendor role');
    } else {
      const vendor = new User({
        name: 'Test Vendor',
        email: vendorEmail,
        photoURL: 'https://i.ibb.co/QkTw5Dv/vendor-avatar.png',
        role: 'vendor',
        fraudFlag: false,
        firebaseUid: 'vendor-firebase-uid-' + Date.now(),
      });
      
      await vendor.save();
      console.log('✅ Vendor user created successfully');
    }

    // Create Regular User
    const userEmail = 'user@test.com';
    let existingUser = await User.findOne({ email: userEmail });
    
    if (existingUser) {
      existingUser.role = 'user';
      await existingUser.save();
      console.log('✅ Updated existing user to user role');
    } else {
      const user = new User({
        name: 'Test User',
        email: userEmail,
        photoURL: 'https://i.ibb.co/p1wNQw5/user-avatar.png',
        role: 'user',
        fraudFlag: false,
        firebaseUid: 'user-firebase-uid-' + Date.now(),
      });
      
      await user.save();
      console.log('✅ Regular user created successfully');
    }

    console.log('\n🎉 All test users created/updated successfully!');
    console.log('\nTest credentials:');
    console.log('👑 Admin: sazid98@gmail.com');
    console.log('🏢 Vendor: vendor@test.com');
    console.log('👤 User: user@test.com');
    console.log('\n📝 Note: Create these users in Firebase Authentication with your preferred passwords.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();