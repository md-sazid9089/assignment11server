const API_BASE = 'http://localhost:5000/api';
const VENDOR_USER_ID = '69446689e4ad9cac42e3420b'; // From the sample data output

const testVendorEndpoints = async () => {
  console.log('🔬 Testing Vendor Dashboard API Endpoints...\n');

  const headers = {
    'x-user-id': VENDOR_USER_ID,
    'Content-Type': 'application/json'
  };

  try {
    // Test 1: Vendor Tickets
    console.log('📋 Testing GET /tickets/vendor/my-tickets');
    try {
      const ticketsResponse = await fetch(`${API_BASE}/tickets/vendor/my-tickets`, { headers });
      const ticketsData = await ticketsResponse.json();
      console.log('✅ Tickets endpoint working');
      console.log(`   - Status: ${ticketsResponse.status}`);
      console.log(`   - Tickets count: ${ticketsData.tickets?.length || 0}`);
      console.log(`   - Sample ticket:`, ticketsData.tickets?.[0]?.title || 'None');
    } catch (error) {
      console.log('❌ Tickets endpoint failed:', error.message);
    }

    // Test 2: Vendor Bookings
    console.log('\n📝 Testing GET /bookings/vendor');
    try {
      const bookingsResponse = await fetch(`${API_BASE}/bookings/vendor`, { headers });
      const bookingsData = await bookingsResponse.json();
      console.log('✅ Bookings endpoint working');
      console.log(`   - Status: ${bookingsResponse.status}`);
      console.log(`   - Bookings count: ${bookingsData.bookings?.length || 0}`);
      console.log(`   - Sample booking:`, bookingsData.bookings?.[0]?.bookingId || 'None');
    } catch (error) {
      console.log('❌ Bookings endpoint failed:', error.message);
    }

    // Test 3: Vendor Transactions
    console.log('\n💰 Testing GET /transactions/vendor/my-transactions');
    try {
      const transactionsResponse = await fetch(`${API_BASE}/transactions/vendor/my-transactions`, { headers });
      const transactionsData = await transactionsResponse.json();
      console.log('✅ Transactions endpoint working');
      console.log(`   - Status: ${transactionsResponse.status}`);
      console.log(`   - Transactions count: ${transactionsData.transactions?.length || 0}`);
      console.log(`   - Sample transaction:`, transactionsData.transactions?.[0]?.transactionId || 'None');
    } catch (error) {
      console.log('❌ Transactions endpoint failed:', error.message);
    }

    console.log('\n🎯 Vendor Dashboard API Test Complete!');

  } catch (error) {
    console.error('❌ Test setup error:', error.message);
  }
};

testVendorEndpoints();