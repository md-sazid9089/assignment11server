import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    let userId = req.headers['x-user-id'];
    
    // Try to get user from JWT token first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (jwtError) {
        console.log('JWT verification failed, falling back to x-user-id header');
      }
    }

    if (!userId) {
      return res.status(401).json({ message: 'No user ID or token provided' });
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
