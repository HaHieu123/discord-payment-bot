const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true // ID Discord của người dùng
  },
  username: { 
    type: String, 
    default: '' 
  },
  balance: { 
    type: Number, 
    default: 0 // Số dư tính bằng VNĐ
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', UserSchema);