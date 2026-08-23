// seed.js
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

  // Tạo key mẫu cho từng sản phẩm (chỉ cho những sản phẩm có stock > 0)
  const keys = [
    { productId: 'bypass_1d', key: 'ABCD-1234-EFGH-5678' },
    { productId: 'bypass_1d', key: 'IJKL-9012-MNOP-3456' },
    // ... thêm key cho các sản phẩm khác
  ];
  await Key.insertMany(keys);

  console.log('✅ Seed done');
  process.exit(0);
}
seed();