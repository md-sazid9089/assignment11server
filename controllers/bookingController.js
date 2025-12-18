import Booking from '../models/Booking.js';
import Ticket from '../models/Ticket.js';

// Create booking
export const createBooking = async (req, res) => {
  try {
    console.log('📝 Creating booking with body:', req.body);
    console.log('👤 User ID from middleware:', req.user._id);
    
    const { ticketId, quantity, userName, userEmail, ticketTitle, totalPrice, vendorId } = req.body;

    // Validate required fields
    if (!ticketId || !quantity || !userName || !userEmail || !ticketTitle || !totalPrice || !vendorId) {
      console.error('❌ Missing required fields:', { ticketId, quantity, userName, userEmail, ticketTitle, totalPrice, vendorId });
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields. Please provide ticketId, quantity, userName, userEmail, ticketTitle, totalPrice, and vendorId' 
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      console.error('❌ Ticket not found:', ticketId);
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (ticket.quantity < quantity) {
      console.error('❌ Insufficient quantity. Available:', ticket.quantity, 'Requested:', quantity);
      return res.status(400).json({ success: false, message: 'Insufficient ticket quantity' });
    }

    console.log('📋 Creating booking with data:', {
      userId: req.user._id,
      ticketId,
      userName,
      userEmail,
      ticketTitle,
      quantity,
      totalPrice,
      vendorId,
    });

    const booking = await Booking.create({
      userId: req.user._id,
      ticketId,
      userName,
      userEmail,
      ticketTitle,
      quantity,
      totalPrice,
      vendorId,
    });

    console.log('✅ Booking created successfully:', {
      bookingId: booking.bookingId,
      mongoId: booking._id,
      ticketId: booking.ticketId,
      quantity: booking.quantity,
      status: booking.status
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    console.log('📋 Fetching bookings for user:', req.user._id);
    
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('ticketId')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${bookings.length} bookings for user`);
    
    if (bookings.length > 0) {
      console.log('📝 Sample booking:', {
        bookingId: bookings[0].bookingId,
        id: bookings[0]._id,
        ticketTitle: bookings[0].ticketTitle,
        quantity: bookings[0].quantity,
        status: bookings[0].status,
        hasTicketData: !!bookings[0].ticketId
      });
    }

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error('❌ Error fetching user bookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get vendor's booking requests
export const getVendorBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ vendorId: req.user._id })
      .populate('userId', 'name email')
      .populate('ticketId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept/reject booking (vendor only)
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('ticketId')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
