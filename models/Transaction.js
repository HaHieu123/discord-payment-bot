const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true // Mã giao dịch (VD: NAP_123_xxx)
  },
  userId: { 
    type: String, 
    required: true // ID Discord của người dùng
  },
  amount: { 
    type: Number, 
    required: true // Số tiền giao dịch
  },
  type: { 
    type: String, 
    enum: ['deposit', 'purchase'], 
    required: true // deposit: nạp tiền, purchase: mua hàng
  },
  productId: { 
    type: String, 
    default: null // Nếu mua hàng, lưu id sản phẩm
  },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'completed', 'failed'], 
    default: 'pending' // Trạng thái thanh toán
  },
  paymentMethod: { 
    type: String, 
    default: 'vietqr' // Phương thức thanh toán
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: { 
    type: Date, 
    default: null 
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);