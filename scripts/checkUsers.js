import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all test users
    const users = await User.find({ 
      email: { $in: ['vendor@test.com', 'user@test.com', 'sazid98@gmail.com'] }
    });

    console.log('\n🔍 Found test users:');
    users.forEach(user => {
      console.log(`👤 ${user.role.toUpperCase()}: ${user.name} (${user.email})`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Role: ${user.role}`);
      console.log('');
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkUsers();