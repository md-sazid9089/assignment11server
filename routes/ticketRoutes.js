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

// Public routes
router.get('/approved', getAllApprovedTickets);
router.get('/advertised', getAdvertisedTickets);
router.get('/latest', getLatestTickets);
router.get('/:id', getTicketById);

// Vendor routes
router.post('/', verifyToken, requireRole('vendor'), checkFraudStatus, createTicket);
router.get('/vendor/my-tickets', verifyToken, requireRole('vendor'), getVendorTickets);
router.put('/:id', verifyToken, requireRole('vendor'), checkFraudStatus, updateTicket);
router.delete('/:id', verifyToken, requireRole('vendor'), deleteTicket);

// Admin routes
router.get('/admin/all', verifyToken, requireRole('admin'), getAllTicketsAdmin);
router.put('/admin/status', verifyToken, requireRole('admin'), updateTicketStatus);
router.put('/admin/advertise', verifyToken, requireRole('admin'), toggleAdvertise);

export default router;
