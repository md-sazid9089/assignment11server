import Ticket from '../models/Ticket.js';

// Create ticket (vendor only)
export const createTicket = async (req, res) => {
  try {
    const {
      title,
      from,
      to,
      transportType,
      pricePerUnit,
      quantity,
      departureDate,
      departureTime,
      perks,
      imageUrl,
      vendorName,
      vendorEmail,
    } = req.body;

    console.log('📥 Received ticket data:', req.body);

    const ticket = await Ticket.create({
      title,
      from,
      to,
      transportType,
      pricePerUnit,
      quantity,
      departureDate,
      departureTime,
      perks: perks || [],
      imageUrl,
      vendorName,
      vendorEmail,
      vendorId: req.user._id,
      verificationStatus: 'approved', // Auto-approve vendor tickets
    });

    console.log('✅ Ticket created successfully:', ticket._id);
    res.status(201).json({ success: true, ticket });
  } catch (error) {
    console.error('❌ Ticket creation error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all approved tickets (public - shows only approved & not hidden)
export const getAllApprovedTickets = async (req, res) => {
  try {
    const {
      search,
      transportType,
      sortBy,
      page = 1,
      limit = 9,
    } = req.query;

    console.log('🔍 Fetching approved tickets with query:', { search, transportType, sortBy, page, limit });

    let query = {
      verificationStatus: 'approved',
      isHidden: false,
    };

    // Search by from/to
    if (search) {
      query.$or = [
        { from: { $regex: search, $options: 'i' } },
        { to: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by transport type
    if (transportType && transportType !== 'all') {
      query.transportType = transportType;
    }

    let sortOptions = {};
    if (sortBy === 'price-asc') {
      sortOptions.pricePerUnit = 1;
    } else if (sortBy === 'price-desc') {
      sortOptions.pricePerUnit = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const tickets = await Ticket.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ticket.countDocuments(query);

    console.log(`✅ Found ${tickets.length} approved tickets out of ${total} total`);

    res.status(200).json({
      success: true,
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching approved tickets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get advertised tickets (homepage)
export const getAdvertisedTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      verificationStatus: 'approved',
      isAdvertised: true,
      isHidden: false,
    }).limit(6);

    res.status(200).json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get latest tickets
export const getLatestTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      verificationStatus: 'approved',
      isHidden: false,
    })
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get ticket by ID
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get vendor's tickets
export const getVendorTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ vendorId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update ticket (vendor only)
export const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (ticket.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (ticket.verificationStatus === 'rejected') {
      return res.status(400).json({ success: false, message: 'Cannot update rejected ticket' });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, ticket: updatedTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete ticket (vendor only)
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (ticket.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (ticket.verificationStatus === 'rejected') {
      return res.status(400).json({ success: false, message: 'Cannot delete rejected ticket' });
    }

    await Ticket.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all tickets for admin
export const getAllTicketsAdmin = async (req, res) => {
  try {
    console.log('🔐 Admin fetching all tickets...');
    const tickets = await Ticket.find({}).sort({ createdAt: -1 });
    console.log(`✅ Admin Dashboard: Found ${tickets.length} total tickets in MongoDB`);
    console.log('Sample ticket:', tickets[0] ? {
      id: tickets[0]._id,
      title: tickets[0].title,
      status: tickets[0].verificationStatus,
      vendor: tickets[0].vendorEmail
    } : 'No tickets');
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error('❌ Error fetching admin tickets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve/reject ticket (admin only)
export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId, status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { verificationStatus: status },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle advertise (admin only)
export const toggleAdvertise = async (req, res) => {
  try {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (ticket.verificationStatus !== 'approved') {
      return res.status(400).json({ success: false, message: 'Only approved tickets can be advertised' });
    }

    // Check current advertised count
    if (!ticket.isAdvertised) {
      const advertisedCount = await Ticket.countDocuments({ isAdvertised: true });
      if (advertisedCount >= 6) {
        return res.status(400).json({ success: false, message: 'Maximum 6 tickets can be advertised' });
      }
    }

    ticket.isAdvertised = !ticket.isAdvertised;
    await ticket.save();

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
