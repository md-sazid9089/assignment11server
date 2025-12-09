import User from '../models/User.js';

// Create or update user
export const createOrUpdateUser = async (req, res) => {
  try {
    const { name, email, photoURL, firebaseUid } = req.body;

    let user = await User.findOne({ firebaseUid });

    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.photoURL = photoURL || user.photoURL;
      await user.save();
      console.log('✅ Updated existing user:', email, 'with role:', user.role);
    } else {
      // Create new user
      // Automatically assign admin role to specific email
      const role = email === 'sazid.cse.20230104062@aust.edu' ? 'admin' : 'user';
      
      user = await User.create({
        name,
        email,
        photoURL,
        firebaseUid,
        role,
      });
      console.log('✨ Created new user:', email, 'with role:', role);
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role,
        fraudFlag: user.fraudFlag,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-firebaseUid');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-firebaseUid');
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!['user', 'vendor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-firebaseUid');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark user as fraud (admin only)
export const markUserAsFraud = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { fraudFlag: true },
      { new: true }
    ).select('-firebaseUid');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Hide all tickets if vendor
    if (user.role === 'vendor') {
      const Ticket = (await import('../models/Ticket.js')).default;
      await Ticket.updateMany(
        { vendorId: userId },
        { isHidden: true }
      );
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
