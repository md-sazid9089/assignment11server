import express from 'express';
import {
  createBooking,
  getUserBookings,
  getVendorBookings,
  updateBookingStatus,
  getBookingById,
  deleteBooking,
} from '../controllers/bookingController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/', verifyToken, createBooking);
router.get('/my-bookings', verifyToken, getUserBookings);
router.get('/:id', verifyToken, getBookingById);
router.delete('/:id', verifyToken, deleteBooking);

// Vendor routes
router.get('/vendor/requests', verifyToken, requireRole('vendor'), getVendorBookings);
router.put('/vendor/status', verifyToken, requireRole('vendor'), updateBookingStatus);

export default router;
