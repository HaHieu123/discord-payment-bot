const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true // Ví dụ: 'bypass_1d'
  },
  name: { 
    type: String, 
    required: true // Tên hiển thị: 'Bypass Emulator - 1 Ngày'
  },
  category: { 
    type: String, 
    enum: ['bypass', 'modmenu'], 
    required: true 
  },
  price: { 
    type: Number, 
    required: true // Giá bán (VNĐ)
  },
  stock: { 
    type: Number, 
    default: 0 // Số lượng còn trong kho
  },
  description: { 
    type: String, 
    default: '' 
  }
});

module.exports = mongoose.model('Product', ProductSchema);