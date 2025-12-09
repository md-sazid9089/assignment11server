import express from 'express';
import {
  createBooking,
  getUserBookings,
  getVendorBookings,
  updateBookingStatus,
  getBookingById,
} from '../controllers/bookingController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/', verifyToken, createBooking);
router.get('/my-bookings', verifyToken, getUserBookings);
router.get('/:id', verifyToken, getBookingById);

// Vendor routes
router.get('/vendor/requests', verifyToken, requireRole('vendor'), getVendorBookings);
router.put('/vendor/status', verifyToken, requireRole('vendor'), updateBookingStatus);

export default router;
