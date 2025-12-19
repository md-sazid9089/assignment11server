import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import Booking from '../models/Booking.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

const createSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the vendor user
    const vendor = await User.findOne({ email: 'vendor@test.com' });
    const user = await User.findOne({ email: 'user@test.com' });

    if (!vendor || !user) {
      console.log('❌ Vendor or User not found. Run createTestUsers.js first.');
      process.exit(1);
    }

    console.log('👤 Found vendor:', vendor.name);
    console.log('👤 Found user:', user.name);

    // Clean existing vendor data to prevent duplicates
    await Ticket.deleteMany({ vendorId: vendor._id });
    await Booking.deleteMany({ vendorId: vendor._id });
    await Transaction.deleteMany({ userId: user._id });
    console.log('🧹 Cleaned existing sample data');

    // Create sample tickets for vendor
    const sampleTickets = [
      {
        title: 'Dhaka to Chittagong - Green Line Express',
        from: 'Dhaka',
        to: 'Chittagong',
        transportType: 'bus',
        pricePerUnit: 800,
        quantity: 40,
        departureDate: new Date('2024-12-25'),
        departureTime: '08:00 AM',
        imageUrl: 'https://i.ibb.co/QkTw5Dv/bus-image1.jpg',
        vendorName: vendor.name,
        vendorEmail: vendor.email,
        vendorId: vendor._id,
        verificationStatus: 'approved',
        isAdvertised: true,
        perks: ['AC', 'WiFi', 'Comfortable Seats'],
      },
      {
        title: 'Chittagong to Sylhet - Shyamoli Paribahan',
        from: 'Chittagong',
        to: 'Sylhet',
        transportType: 'bus',
        pricePerUnit: 600,
        quantity: 35,
        departureDate: new Date('2024-12-26'),
        departureTime: '10:00 AM',
        imageUrl: 'https://i.ibb.co/QkTw5Dv/bus-image2.jpg',
        vendorName: vendor.name,
        vendorEmail: vendor.email,
        vendorId: vendor._id,
        verificationStatus: 'approved',
        isAdvertised: false,
        perks: ['AC', 'Reading Light'],
      },
      {
        title: 'Dhaka to Sylhet - Ena Transport',
        from: 'Dhaka',
        to: 'Sylhet',
        transportType: 'bus',
        pricePerUnit: 900,
        quantity: 30,
        departureDate: new Date('2024-12-27'),
        departureTime: '06:00 PM',
        imageUrl: 'https://i.ibb.co/QkTw5Dv/bus-image3.jpg',
        vendorName: vendor.name,
        vendorEmail: vendor.email,
        vendorId: vendor._id,
        verificationStatus: 'pending',
        isAdvertised: false,
        perks: ['AC', 'WiFi', 'TV', 'Comfortable Seats'],
      }
    ];

    // Insert tickets
    const createdTickets = await Ticket.insertMany(sampleTickets);
    console.log('✅ Created', createdTickets.length, 'sample tickets');

    // Create sample bookings
    const sampleBookings = [
      {
        ticketId: createdTickets[0]._id,
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        ticketTitle: createdTickets[0].title,
        quantity: 2,
        totalPrice: 1600,
        status: 'paid',
        vendorId: vendor._id,
        bookingId: 'UR-ABC123',
      },
      {
        ticketId: createdTickets[1]._id,
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        ticketTitle: createdTickets[1].title,
        quantity: 1,
        totalPrice: 600,
        status: 'accepted',
        vendorId: vendor._id,
        bookingId: 'UR-ABC124',
      },
      {
        ticketId: createdTickets[0]._id,
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        ticketTitle: createdTickets[0].title,
        quantity: 3,
        totalPrice: 2400,
        status: 'pending',
        vendorId: vendor._id,
        bookingId: 'UR-ABC125',
      }
    ];

    const createdBookings = await Booking.insertMany(sampleBookings);
    console.log('✅ Created', createdBookings.length, 'sample bookings');

    // Create sample transactions
    const sampleTransactions = [
      {
        userId: user._id,
        bookingId: createdBookings[0]._id,
        amount: 1600,
        paymentMethod: 'bKash',
        transactionId: 'UR-ABC123',
        status: 'Success',
        ticketTitle: createdTickets[0].title,
        bookingReference: createdBookings[0].bookingId,
      },
      {
        userId: user._id,
        bookingId: createdBookings[1]._id,
        amount: 600,
        paymentMethod: 'Nagad',
        transactionId: 'UR-ABC124',
        status: 'Success',
        ticketTitle: createdTickets[1].title,
        bookingReference: createdBookings[1].bookingId,
      }
    ];

    const createdTransactions = await Transaction.insertMany(sampleTransactions);
    console.log('✅ Created', createdTransactions.length, 'sample transactions');

    console.log('\n🎉 Sample data created successfully!');
    console.log('📊 Summary:');
    console.log('- Vendor:', vendor.name, `(${vendor._id})`);
    console.log('- Tickets:', createdTickets.length);
    console.log('- Bookings:', createdBookings.length);
    console.log('- Transactions:', createdTransactions.length);
    console.log('\n🔗 You can now test the vendor dashboard with real data!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
};

createSampleData();