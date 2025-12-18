/**
 * Generate a unique human-readable booking ID
 * Format: UR-XXXXXX (where X is alphanumeric)
 * @returns {string} Unique booking ID
 */
export const generateBookingId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'UR-';
  
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

/**
 * Check if a booking ID already exists in the database
 * @param {string} bookingId - The booking ID to check
 * @param {object} BookingModel - Mongoose Booking model
 * @returns {Promise<boolean>} True if ID exists, false otherwise
 */
export const isBookingIdUnique = async (bookingId, BookingModel) => {
  const existingBooking = await BookingModel.findOne({ bookingId });
  return !existingBooking;
};

/**
 * Generate a unique booking ID with collision detection
 * @param {object} BookingModel - Mongoose Booking model
 * @param {number} maxAttempts - Maximum attempts to generate unique ID (default: 10)
 * @returns {Promise<string>} Unique booking ID
 */
export const generateUniqueBookingId = async (BookingModel, maxAttempts = 10) => {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const bookingId = generateBookingId();
    const isUnique = await isBookingIdUnique(bookingId, BookingModel);
    
    if (isUnique) {
      return bookingId;
    }
    
    attempts++;
  }
  
  throw new Error('Failed to generate unique booking ID after multiple attempts');
};

/**
 * Format booking ID for display (add highlighting, etc.)
 * @param {string} bookingId - The booking ID
 * @returns {string} Formatted booking ID
 */
export const formatBookingId = (bookingId) => {
  if (!bookingId) return 'N/A';
  
  // Ensure it follows our format
  if (bookingId.startsWith('UR-')) {
    return bookingId;
  }
  
  // If it's a MongoDB ObjectId, format it nicely
  if (bookingId.length === 24) {
    return `ID-${bookingId.slice(-8)}`;
  }
  
  return bookingId;
};