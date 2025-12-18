import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT token
export const generateJWT = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        photoURL: user.photoURL
      }
    });
  } catch (error) {
    console.error('JWT Generation Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Create or update user
export const createOrUpdateUser = async (req, res) => {
  try {
    const { name, email, photoURL, firebaseUid } = req.body;

    console.log('📥 Received user create request:', { name, email, firebaseUid: firebaseUid ? '✓' : '✗' });

    // Validate required fields
    if (!email || !firebaseUid) {
      console.error('❌ Missing required fields:', { email: !!email, firebaseUid: !!firebaseUid });
      return res.status(400).json({ 
        success: false, 
        message: 'Email and firebaseUid are required' 
      });
    }

    let user = await User.findOne({ firebaseUid });

    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.photoURL = photoURL || user.photoURL;
      await user.save();
      console.log('✅ Updated existing user:', email, 'with role:', user.role);
    } else {
      // Check if email already exists with different firebaseUid
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser) {
        console.warn('⚠️ Email exists with different firebaseUid:', { 
          email, 
          existingUid: existingEmailUser.firebaseUid,
          newUid: firebaseUid 
        });
        // Update the firebaseUid for existing user (in case of firebase re-authentication)
        existingEmailUser.firebaseUid = firebaseUid;
        existingEmailUser.name = name || existingEmailUser.name;
        existingEmailUser.photoURL = photoURL || existingEmailUser.photoURL;
        await existingEmailUser.save();
        user = existingEmailUser;
        console.log('✅ Updated firebaseUid for existing user:', email);
      } else {
        // Create new user
        // Automatically assign admin role to specific email, vendor role to vendor email
        const role = email === 'sazid98@gmail.com' ? 'admin' : email === 'abrar98@gmail.com' ? 'vendor' : 'user';
        
        user = await User.create({
          name,
          email,
          photoURL,
          firebaseUid,
          role,
        });
        console.log('✨ Created new user:', email, 'with role:', role);
      }
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
    console.error('❌ Error in createOrUpdateUser:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(409).json({ 
        success: false, 
        message: `User with this ${field} already exists`,
        errorCode: 'DUPLICATE_KEY'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: error.message,
        errorCode: 'VALIDATION_ERROR'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error',
      errorCode: 'INTERNAL_ERROR'
    });
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
