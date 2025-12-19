import stripe from '../config/stripe.js';
import Booking from '../models/Booking.js';
import Ticket from '../models/Ticket.js';
import Transaction from '../models/Transaction.js';

// Create payment intent
export const createPaymentIntent = async (req, res) => {
  try {
    console.log('💳 Creating payment intent:', req.body);
    const { amount, currency = 'usd', bookingId } = req.body;

    // Validate required fields
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    let booking = null;
    
    // If bookingId provided, validate the booking
    if (bookingId) {
      booking = await Booking.findById(bookingId).populate('ticketId');

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      if (booking.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      if (booking.status === 'paid') {
        return res.status(400).json({ success: false, message: 'Already paid' });
      }

      // Check if departure time has passed
      const ticket = booking.ticketId;
      if (ticket && ticket.departureDate && ticket.departureTime) {
        const departureDateTime = new Date(`${ticket.departureDate.toISOString().split('T')[0]}T${ticket.departureTime}`);
        
        if (new Date() > departureDateTime) {
          return res.status(400).json({ success: false, message: 'Cannot pay for past tickets' });
        }
      }
    }

    // Convert BDT to USD for Stripe (approximate conversion)
    const convertedAmount = currency.toLowerCase() === 'bdt' 
      ? Math.round((amount / 110) * 100) // 1 USD ≈ 110 BDT, convert to cents
      : Math.round(amount * 100); // USD to cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: convertedAmount,
      currency: currency.toLowerCase() === 'bdt' ? 'usd' : currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: bookingId || 'direct_payment',
        userId: req.user._id.toString(),
        originalAmount: amount.toString(),
        originalCurrency: currency.toLowerCase(),
      },
    });

    console.log('✅ Payment intent created:', paymentIntent.id);

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Confirm payment
export const confirmPayment = async (req, res) => {
  try {
    console.log('✅ Confirming payment:', req.body);
    const { bookingId, paymentIntentId, paymentMethod = 'Stripe' } = req.body;

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      console.error('❌ Payment not successful:', paymentIntent.status);
      return res.status(400).json({ 
        success: false, 
        message: 'Payment not successful', 
        paymentStatus: paymentIntent.status 
      });
    }

    console.log('💳 Payment verified with Stripe:', paymentIntentId);

    let booking = null;
    let transaction = null;

    // If booking exists, process booking confirmation
    if (bookingId && bookingId !== 'direct_payment') {
      booking = await Booking.findById(bookingId).populate('ticketId');

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      if (booking.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      // Update booking status
      booking.status = 'paid';
      await booking.save();

      // Decrease ticket quantity
      if (booking.ticketId) {
        const ticket = await Ticket.findById(booking.ticketId);
        if (ticket) {
          ticket.quantity = Math.max(0, ticket.quantity - booking.quantity);
          await ticket.save();
          console.log('🎫 Updated ticket quantity:', ticket.quantity);
        }
      }

      // Create transaction record
      transaction = await Transaction.create({
        userId: req.user._id,
        bookingId: booking._id,
        ticketTitle: booking.ticketTitle,
        amount: parseFloat(paymentIntent.metadata.originalAmount) || booking.totalPrice,
        paymentMethod: paymentMethod,
        transactionId: paymentIntentId,
        status: 'Success',
      });

      console.log('📊 Transaction created:', transaction.transactionId);
    } else {
      // Handle direct payments without booking
      transaction = await Transaction.create({
        userId: req.user._id,
        bookingId: null,
        ticketTitle: 'Direct Payment',
        amount: parseFloat(paymentIntent.metadata.originalAmount) || (paymentIntent.amount / 100),
        paymentMethod: paymentMethod,
        transactionId: paymentIntentId,
        status: 'Success',
      });

      console.log('💰 Direct payment transaction created:', transaction.transactionId);
    }

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      booking,
      transaction,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
      },
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
