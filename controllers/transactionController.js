import Transaction from '../models/Transaction.js';
import Booking from '../models/Booking.js';

// Create transaction (used internally after successful booking)
export const createTransaction = async (transactionData) => {
  try {
    console.log('💳 Creating transaction:', transactionData);
    
    const transaction = await Transaction.create(transactionData);
    
    console.log('✅ Transaction created successfully:', {
      transactionId: transaction.transactionId,
      amount: transaction.amount,
      method: transaction.paymentMethod,
      status: transaction.status
    });
    
    return transaction;
  } catch (error) {
    console.error('❌ Error creating transaction:', error);
    throw error;
  }
};

// Get user's transaction history
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.params.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User authentication required' 
      });
    }

    console.log('📊 Fetching transactions for user:', userId);
    
    const transactions = await Transaction.find({ userId })
      .populate({
        path: 'bookingId',
        select: 'bookingId ticketTitle'
      })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${transactions.length} transactions for user`);
    
    // Format transactions for frontend
    const formattedTransactions = transactions.map(transaction => ({
      _id: transaction._id,
      date: transaction.createdAt,
      bookingId: transaction.bookingId?.bookingId || transaction.bookingReference || 'N/A',
      ticketTitle: transaction.ticketTitle,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      transactionId: transaction.transactionId,
      status: transaction.status,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    }));

    res.status(200).json({ 
      success: true, 
      transactions: formattedTransactions,
      total: formattedTransactions.length
    });
  } catch (error) {
    console.error('❌ Error fetching user transactions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User authentication required' 
      });
    }

    const transaction = await Transaction.findOne({ 
      _id: id, 
      userId 
    }).populate('bookingId');

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    res.status(200).json({ success: true, transaction });
  } catch (error) {
    console.error('❌ Error fetching transaction:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get transaction statistics for user
export const getTransactionStats = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User authentication required' 
      });
    }

    const stats = await Transaction.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          successfulTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'Success'] }, 1, 0] }
          },
          failedTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalTransactions: 0,
      totalAmount: 0,
      successfulTransactions: 0,
      failedTransactions: 0
    };

    res.status(200).json({ success: true, stats: result });
  } catch (error) {
    console.error('❌ Error fetching transaction stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};