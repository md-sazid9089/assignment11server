import mongoose from 'mongoose';
import { generateUniqueBookingId } from '../utils/bookingUtils.js';

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: false, // Will be auto-generated in pre-save hook
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  ticketTitle: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Cancelled', 'Paid'],
    default: 'Pending',
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Helper function to generate unique booking ID directly in model
const generateBookingId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'UR-';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Pre-save hook to generate unique bookingId
bookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    let attempts = 0;
    const maxAttempts = 10;
    let isUnique = false;

    while (!isUnique && attempts < maxAttempts) {
      const newBookingId = generateBookingId();
      
      // Use this.constructor to avoid circular reference
      const existingBooking = await this.constructor.findOne({ bookingId: newBookingId });
      
      if (!existingBooking) {
        this.bookingId = newBookingId;
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return next(new Error('Failed to generate unique booking ID after multiple attempts'));
    }
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
