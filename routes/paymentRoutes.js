import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getUserTransactions,
  getVendorRevenue,
  processDummyPayment,
} from '../controllers/paymentController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/create-intent', verifyToken, createPaymentIntent);
router.post('/confirm', verifyToken, confirmPayment);
router.post('/dummy', verifyToken, processDummyPayment); // Dummy payment endpoint
router.post('/', verifyToken, processDummyPayment); // Direct payment endpoint (same as dummy)
router.get('/transactions', verifyToken, getUserTransactions);

// Vendor routes
router.get('/vendor/revenue', verifyToken, requireRole('vendor'), getVendorRevenue);

export default router;
