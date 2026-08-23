const mongoose = require('mongoose');

const KeySchema = new mongoose.Schema({
  productId: { 
    type: String, 
    required: true // Liên kết với Product.id
  },
  key: { 
    type: String, 
    required: true, 
    unique: true // Mã key của sản phẩm
  },
  status: { 
    type: String, 
    enum: ['available', 'sold'], 
    default: 'available' // available: còn, sold: đã bán
  },
  soldTo: { 
    type: String, 
    default: null // userId của người đã mua
  },
  soldAt: { 
    type: Date, 
    default: null 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Key', KeySchema);