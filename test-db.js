require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi kết nối:', err.message);
    process.exit(1);
  }
}
test();