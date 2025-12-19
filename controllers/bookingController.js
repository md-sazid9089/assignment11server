import Booking from '../models/Booking.js';
import Ticket from '../models/Ticket.js';
import { createTransaction } from './transactionController.js';

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

    // Decrease ticket quantity after successful booking
    ticket.quantity -= quantity;
    await ticket.save();
    
    console.log('✅ Booking created successfully and ticket quantity decreased:', {
      bookingId: booking.bookingId,
      mongoId: booking._id,
      ticketId: booking.ticketId,
      quantity: booking.quantity,
      remainingTickets: ticket.quantity,
      status: booking.status,
      vendorId: booking.vendorId,
      userId: booking.userId
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Confirm booking with payment and create transaction
export const confirmBooking = async (req, res) => {
  try {
    console.log('💳 Confirming booking payment:', req.body);
    
    const { bookingId, paymentMethod } = req.body;
    const userId = req.headers['x-user-id'];

    if (!bookingId || !paymentMethod || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: bookingId, paymentMethod' 
      });
    }

    // Find and update booking
    const booking = await Booking.findById(bookingId).populate('ticketId');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if booking belongs to user
    if (booking.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update booking status to paid
    booking.status = 'Paid';
    await booking.save();

    // Create transaction record using booking's unique bookingId as transactionId
    const transactionData = {
      userId: userId,
      bookingId: booking._id,
      amount: booking.totalPrice,
      paymentMethod: paymentMethod,
      transactionId: booking.bookingId, // Use booking's unique ID as transaction ID
      status: 'Success',
      ticketTitle: booking.ticketTitle,
      bookingReference: booking.bookingId
    };

    const transaction = await createTransaction(transactionData);

    console.log('✅ Booking confirmed and transaction recorded:', {
      bookingId: booking.bookingId,
      transactionId: transaction.transactionId,
      amount: transaction.amount
    });

    res.status(200).json({ 
      success: true, 
      booking: booking,
      transaction: transaction,
      message: 'Booking confirmed and payment processed successfully'
    });

  } catch (error) {
    console.error('❌ Error confirming booking:', error);
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
    console.log('🔍 Fetching vendor bookings for vendor ID:', req.user._id);
    
    const bookings = await Booking.find({ vendorId: req.user._id })
      .populate('userId', 'name email')
      .populate('ticketId')
      .sort({ createdAt: -1 });

    console.log('📊 Found', bookings.length, 'bookings for vendor:', req.user._id);
    console.log('📋 Booking IDs:', bookings.map(b => ({ id: b._id, bookingId: b.bookingId, status: b.status })));

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error('❌ Error fetching vendor bookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept/reject booking (vendor only)
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    if (!['Approved', 'Cancelled'].includes(status)) {
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

// Get all bookings (Admin only)
export const getAllBookings = async (req, res) => {
  try {
    console.log('📊 Admin fetching all bookings...');
    
    const bookings = await Booking.find({})
      .populate('userId', 'name email')
      .populate('ticketId', 'title from to')
      .sort({ createdAt: -1 });

    // Format bookings with proper field names for frontend
    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      bookingId: booking.bookingId, // This is the unique ID like "UR-ABC123"
      userName: booking.userName || booking.userId?.name || 'Unknown User',
      userEmail: booking.userEmail || booking.userId?.email || 'No Email',
      ticketTitle: booking.ticketTitle || booking.ticketId?.title || 'Unknown Ticket',
      ticketRoute: booking.ticketId ? `${booking.ticketId.from} to ${booking.ticketId.to}` : 'Unknown Route',
      quantity: booking.quantity,
      totalAmount: booking.totalPrice, // Map totalPrice to totalAmount for frontend consistency
      totalPrice: booking.totalPrice,
      status: booking.status,
      vendorId: booking.vendorId,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));

    console.log(`✅ Admin bookings fetched: ${formattedBookings.length}`);
    console.log('Sample booking:', formattedBookings[0] ? {
      bookingId: formattedBookings[0].bookingId,
      userName: formattedBookings[0].userName,
      status: formattedBookings[0].status
    } : 'No bookings found');
    
    res.status(200).json({ 
      success: true, 
      data: formattedBookings,
      count: formattedBookings.length
    });
  } catch (error) {
    console.error('❌ Error fetching admin bookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete booking (Cancel ticket)
export const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const booking = await Booking.findById(bookingId).populate('ticketId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if the user is admin or the booking owner
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin && booking.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this booking' });
    }

    // Check if booking is already cancelled (only for non-admin users)
    if (!isAdmin && booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Delete the booking
    await Booking.findByIdAndDelete(bookingId);

    const actionMessage = isAdmin ? 'deleted' : 'cancelled';
    res.status(200).json({ 
      success: true, 
      message: `Booking ${actionMessage} successfully`,
      bookingId: booking.bookingId
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update booking status (Approve/Cancel)
export const updateBookingStatusAdmin = async (req, res) => {
  try {
    console.log('🔄 Admin updating booking status:', req.params.id);
    console.log('👤 Admin user:', req.user.email, 'Role:', req.user.role);
    console.log('📝 Status update:', req.body);

    const { id } = req.params;
    const { status } = req.body;

    // Validate status value
    if (!status || !['Approved', 'Cancelled'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be either "Approved" or "Cancelled"' 
      });
    }

    // Find the booking
    const booking = await Booking.findById(id).populate('ticketId', 'title price');

    if (!booking) {
      console.error('❌ Booking not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check if booking is in Pending status
    if (booking.status !== 'Pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot update booking status. Current status is "${booking.status}"` 
      });
    }

    // Update the booking status
    booking.status = status;
    await booking.save();

    console.log('✅ Booking status updated:', {
      bookingId: booking.bookingId,
      previousStatus: 'Pending',
      newStatus: status,
      admin: req.user.email
    });

    res.status(200).json({
      success: true,
      message: `Booking ${status.toLowerCase()} successfully`,
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        ticketTitle: booking.ticketTitle,
        userName: booking.userName,
        quantity: booking.quantity,
        totalPrice: booking.totalPrice
      }
    });
  } catch (error) {
    console.error('❌ Update booking status error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
