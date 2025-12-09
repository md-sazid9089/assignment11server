import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  ticketTitle: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  stripePaymentIntentId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['succeeded', 'pending', 'failed'],
    default: 'succeeded',
  },
}, {
  timestamps: true,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
