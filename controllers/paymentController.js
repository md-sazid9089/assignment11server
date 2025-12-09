import stripe from '../config/stripe.js';
import Booking from '../models/Booking.js';
import Ticket from '../models/Ticket.js';
import Transaction from '../models/Transaction.js';

// Create payment intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('ticketId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Booking not accepted yet' });
    }

    if (booking.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Already paid' });
    }

    // Check if departure time has passed
    const ticket = booking.ticketId;
    const departureDateTime = new Date(`${ticket.departureDate.toISOString().split('T')[0]}T${ticket.departureTime}`);
    
    if (new Date() > departureDateTime) {
      return res.status(400).json({ success: false, message: 'Cannot pay for past tickets' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Confirm payment
export const confirmPayment = async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    const booking = await Booking.findById(bookingId).populate('ticketId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: 'Payment not successful' });
    }

    // Update booking status
    booking.status = 'paid';
    await booking.save();

    // Decrease ticket quantity
    const ticket = await Ticket.findById(booking.ticketId);
    ticket.quantity -= booking.quantity;
    await ticket.save();

    // Create transaction record
    const transaction = await Transaction.create({
      userId: req.user._id,
      bookingId: booking._id,
      ticketTitle: booking.ticketTitle,
      amount: booking.totalPrice,
      stripePaymentIntentId: paymentIntentId,
      status: 'succeeded',
    });

    res.status(200).json({
      success: true,
      booking,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user transactions
export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get vendor revenue stats
export const getVendorRevenue = async (req, res) => {
  try {
    // Get all paid bookings for vendor's tickets
    const paidBookings = await Booking.find({
      vendorId: req.user._id,
      status: 'paid',
    });

    const totalRevenue = paidBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const totalTicketsSold = paidBookings.reduce((sum, booking) => sum + booking.quantity, 0);
    
    // Get total tickets added by vendor
    const totalTicketsAdded = await Ticket.countDocuments({ vendorId: req.user._id });

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalTicketsSold,
        totalTicketsAdded,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dummy payment (no real payment gateway)
export const processDummyPayment = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    const booking = await Booking.findById(bookingId).populate('ticketId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Booking not accepted yet' });
    }

    if (booking.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Already paid' });
    }

    // Check if departure time has passed
    const ticket = booking.ticketId;
    const departureDateTime = new Date(`${ticket.departureDate.toISOString().split('T')[0]}T${ticket.departureTime}`);
    
    if (new Date() > departureDateTime) {
      return res.status(400).json({ success: false, message: 'Cannot pay for past tickets' });
    }

    // Update booking status
    booking.status = 'paid';
    await booking.save();

    // Decrease ticket quantity
    ticket.quantity -= booking.quantity;
    await ticket.save();

    // Create transaction record with dummy payment ID
    const transaction = await Transaction.create({
      userId: req.user._id,
      bookingId: booking._id,
      ticketTitle: booking.ticketTitle,
      amount: amount,
      stripePaymentIntentId: `DUMMY-${Date.now()}`,
      status: 'succeeded',
    });

    res.status(200).json({
      success: true,
      message: 'Dummy payment processed successfully',
      booking,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
