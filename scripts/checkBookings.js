import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';

dotenv.config();

const checkBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all bookings
    const bookings = await Booking.find({})
      .populate('userId', 'name email role')
      .populate('vendorId', 'name email role')
      .populate('ticketId', 'title from to vendorId')
      .sort({ createdAt: -1 });

    console.log(`\n📋 Found ${bookings.length} total bookings:`);
    
    bookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. Booking: ${booking.bookingId || booking._id.toString().slice(-8)}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   User: ${booking.userId?.name} (${booking.userId?.email})`);
      console.log(`   Vendor: ${booking.vendorId?.name} (${booking.vendorId?.email})`);
      console.log(`   Ticket: ${booking.ticketTitle}`);
      console.log(`   Amount: ৳${booking.totalPrice}`);
      console.log(`   Created: ${booking.createdAt}`);
      
      // Check if ticket's vendorId matches booking's vendorId
      if (booking.ticketId && booking.vendorId) {
        const ticketVendorId = booking.ticketId.vendorId?.toString();
        const bookingVendorId = booking.vendorId._id?.toString();
        console.log(`   ⚠️  Vendor ID Match: ${ticketVendorId === bookingVendorId ? '✅' : '❌'}`);
      }
    });

    // Check vendor-specific bookings
    const vendorId = '69446689e4ad9cac42e3420b'; // Test Vendor ID
    console.log(`\n🔍 Checking bookings for vendor ID: ${vendorId}`);
    
    const vendorBookings = await Booking.find({ vendorId: vendorId })
      .populate('userId', 'name email')
      .populate('ticketId')
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${vendorBookings.length} bookings for this vendor:`);
    vendorBookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.bookingId} - ${booking.ticketTitle} (${booking.status})`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkBookings();