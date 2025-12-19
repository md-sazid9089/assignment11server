const testVendorEndpoint = async () => {
  const VENDOR_USER_ID = '69446689e4ad9cac42e3420b'; // Test Vendor ID
  const API_BASE = 'http://localhost:5000/api';

  try {
    console.log('🧪 Testing vendor bookings endpoint...');
    console.log('📝 Using Vendor ID:', VENDOR_USER_ID);

    const response = await fetch(`${API_BASE}/bookings/vendor`, {
      headers: {
        'x-user-id': VENDOR_USER_ID,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Response Status:', response.status);
    
    const data = await response.json();
    console.log('📋 Response Data:', JSON.stringify(data, null, 2));

    if (data.success && data.bookings) {
      console.log(`\n✅ Found ${data.bookings.length} bookings for vendor`);
      data.bookings.forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.bookingId} - ${booking.ticketTitle} (${booking.status})`);
      });
    }

  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
  }
};

testVendorEndpoint();