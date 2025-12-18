import express from 'express';
import { 
  getUserTransactions, 
  getTransactionById, 
  getTransactionStats 
} from '../controllers/transactionController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's transaction history
router.get('/user/:userId', verifyToken, getUserTransactions);

// Get user's transactions (alternative route with header auth)
router.get('/my-transactions', verifyToken, getUserTransactions);

// Get transaction by ID
router.get('/:id', verifyToken, getTransactionById);

// Get transaction statistics
router.get('/stats/summary', verifyToken, getTransactionStats);

export default router;