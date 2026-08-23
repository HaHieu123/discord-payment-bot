const mongoose = require('mongoose');
const Product = require('./models/Product');
const Key = require('./models/Key');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Product.deleteMany({});
  await Key.deleteMany({});

  const products = [
    { id: 'bypass_1d', name: 'Bypass Emulator - 1 Ngày', category: 'bypass', price: 15000, stock: 36 },
    { id: 'bypass_7d', name: 'Bypass Emulator - 7 Ngày', category: 'bypass', price: 70000, stock: 10 },
    { id: 'bypass_30d', name: 'Bypass Emulator - 30 Ngày', category: 'bypass', price: 220000, stock: 24 },
    { id: 'modmenu_1d', name: 'ModMenu PC - 1 Ngày', category: 'modmenu', price: 25000, stock: 7 },
    { id: 'modmenu_7d', name: 'ModMenu PC - 7 Ngày', category: 'modmenu', price: 120000, stock: 0 },
    { id: 'modmenu_30d', name: 'ModMenu PC - 30 Ngày', category: 'modmenu', price: 350000, stock: 0 }
  ];
  await Product.insertMany(products);

  // ✅ Tạo key cho từng sản phẩm dựa trên stock (chỉ tạo key nếu stock > 0)
  const keys = [];
  for (const p of products) {
    if (p.stock > 0) {
      // Tạo số lượng key bằng stock (có thể dùng vòng lặp)
      for (let i = 0; i < p.stock; i++) {
        keys.push({
          productId: p.id,
          key: generateKey(), // hàm tạo key ngẫu nhiên
          status: 'available'
        });
      }
    }
  }
  await Key.insertMany(keys);

  console.log(`✅ Seed done: ${products.length} products, ${keys.length} keys`);
  process.exit(0);
}

// Hàm tạo key ngẫu nhiên (ví dụ: XXXX-YYYY-ZZZZ-WWWW)
function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];
  for (let i = 0; i < 4; i++) {
    let seg = '';
    for (let j = 0; j < 4; j++) {
      seg += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(seg);
  }
  return segments.join('-');
}

seed();