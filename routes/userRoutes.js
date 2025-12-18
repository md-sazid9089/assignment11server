import express from 'express';
import {
  createOrUpdateUser,
  getUserProfile,
  getAllUsers,
  updateUserRole,
  markUserAsFraud,
  generateJWT,
} from '../controllers/userController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/create', createOrUpdateUser);
router.post('/jwt', generateJWT);

// Protected routes
router.get('/profile', verifyToken, getUserProfile);

// Admin routes
router.get('/all', verifyToken, requireRole('admin'), getAllUsers);
router.put('/role', verifyToken, requireRole('admin'), updateUserRole);
router.put('/fraud', verifyToken, requireRole('admin'), markUserAsFraud);

export default router;
