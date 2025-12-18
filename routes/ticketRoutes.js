import express from 'express';
import {
  createTicket,
  getAllApprovedTickets,
  getAdvertisedTickets,
  getLatestTickets,
  getTicketById,
  getVendorTickets,
  updateTicket,
  deleteTicket,
  getAllTicketsAdmin,
  updateTicketStatus,
  toggleAdvertise,
} from '../controllers/ticketController.js';
import { verifyToken, requireRole, checkFraudStatus } from '../middleware/auth.js';

const router = express.Router();

// Admin routes - MUST be before dynamic routes
router.get('/admin/all', verifyToken, requireRole('admin'), getAllTicketsAdmin);
router.put('/admin/status', verifyToken, requireRole('admin'), updateTicketStatus);
router.put('/admin/advertise', verifyToken, requireRole('admin'), toggleAdvertise);

// Vendor routes - MUST be before dynamic routes
router.post('/', verifyToken, requireRole('vendor'), checkFraudStatus, createTicket);
router.get('/vendor/my-tickets', verifyToken, requireRole('vendor'), getVendorTickets);
router.put('/:id', verifyToken, requireRole('vendor'), checkFraudStatus, updateTicket);
router.delete('/:id', verifyToken, requireRole('vendor'), deleteTicket);

// Public routes
router.get('/approved', getAllApprovedTickets);
router.get('/advertised', getAdvertisedTickets);
router.get('/latest', getLatestTickets);

// Dynamic route - MUST be last to avoid catching specific routes
router.get('/:id', getTicketById);

export default router;
