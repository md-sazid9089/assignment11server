import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: false, // Allow direct payments without booking
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['bKash', 'Nagad', 'Visa', 'Mastercard', 'Stripe'],
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['Success', 'Failed', 'Pending'],
    default: 'Success',
  },
  ticketTitle: {
    type: String,
    required: true,
  },
  bookingReference: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

// Index for efficient user-specific queries
transactionSchema.index({ userId: 1, createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
