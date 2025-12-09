import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  transportType: {
    type: String,
    enum: ['bus', 'train', 'launch', 'plane'],
    required: true,
  },
  pricePerUnit: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  departureDate: {
    type: Date,
    required: true,
  },
  departureTime: {
    type: String,
    required: true,
  },
  perks: {
    type: [String],
    default: [],
  },
  imageUrl: {
    type: String,
    required: true,
  },
  vendorName: {
    type: String,
    required: true,
  },
  vendorEmail: {
    type: String,
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  isAdvertised: {
    type: Boolean,
    default: false,
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
