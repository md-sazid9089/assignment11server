import express from 'express';
import { 
  getUserTransactions, 
  getTransactionById, 
  getTransactionStats,
  getAdminTransactions,
  getVendorTransactions
} from '../controllers/transactionController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Admin transaction routes (must come before parameterized routes)
router.get('/admin/all', verifyToken, getAdminTransactions);

// Vendor transaction routes
router.get('/vendor/my-transactions', verifyToken, getVendorTransactions);

// Get user's transaction history
router.get('/user/:userId', verifyToken, getUserTransactions);

// Get user's transactions (alternative route with header auth)
router.get('/my-transactions', verifyToken, getUserTransactions);

// Get transaction statistics
router.get('/stats/summary', verifyToken, getTransactionStats);

// Get transaction by ID (must be last to avoid conflicts)
router.get('/:id', verifyToken, getTransactionById);

export default router;