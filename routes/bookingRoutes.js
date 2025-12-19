import express from 'express';
import {
  createBooking,
  getUserBookings,
  getVendorBookings,
  updateBookingStatus,
  getBookingById,
  deleteBooking,
  confirmBooking,
  getAllBookings,
} from '../controllers/bookingController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Admin routes (must come before parameterized routes)
router.get('/admin/all', verifyToken, getAllBookings);

// Vendor routes (must come before parameterized routes)
router.get('/vendor', verifyToken, requireRole('vendor'), getVendorBookings);
router.get('/vendor/requests', verifyToken, requireRole('vendor'), getVendorBookings);
router.put('/vendor/status', verifyToken, requireRole('vendor'), updateBookingStatus);

// User routes
router.post('/', verifyToken, createBooking);
router.post('/confirm', verifyToken, confirmBooking);
router.get('/my-bookings', verifyToken, getUserBookings);
router.get('/:id', verifyToken, getBookingById);
router.delete('/:id', verifyToken, deleteBooking);

export default router;
