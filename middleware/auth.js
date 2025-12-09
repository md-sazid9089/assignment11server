import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ message: 'No user ID provided' });
    }

    // Find user in database
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = {
      _id: user._id,
      email: user.email,
      role: user.role,
      fraudFlag: user.fraudFlag,
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

export const checkFraudStatus = (req, res, next) => {
  if (req.user.fraudFlag) {
    return res.status(403).json({ message: 'Account flagged. Contact support.' });
  }
  next();
};
