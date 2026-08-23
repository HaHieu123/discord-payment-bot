// handlers/selectHandler.js
const User = require('../models/User');
const Product = require('../models/Product');
const Key = require('../models/Key');

module.exports = async function (interaction) {
  if (!interaction.isStringSelectMenu()) return;

  // Chỉ xử lý dropdown có customId = 'buy_product'
  if (interaction.customId !== 'buy_product') return;

  await interaction.deferReply({ ephemeral: true });

  const selectedValue = interaction.values[0]; // ví dụ 'bypass_1d'

  // Ánh xạ value -> productId thật trong database
  const productMap = {
    'bypass_1d':   'PRODUCT_ID_BYPASS_1D',
    'bypass_7d':   'PRODUCT_ID_BYPASS_7D',
    'bypass_30d':  'PRODUCT_ID_BYPASS_30D',
    'modmenu_1d':  'PRODUCT_ID_MODMENU_1D',
    'modmenu_7d':  'PRODUCT_ID_MODMENU_7D',
    'modmenu_30d': 'PRODUCT_ID_MODMENU_30D'
  };

  const productId = productMap[selectedValue];
  if (!productId) {
    return interaction.editReply({ content: '❌ Sản phẩm không hợp lệ.' });
  }

  // Tìm sản phẩm trong DB
  const product = await Product.findOne({ id: productId });
  if (!product) {
    return interaction.editReply({ content: '❌ Sản phẩm không tồn tại.' });
  }
  if (product.stock <= 0) {
    return interaction.editReply({ content: '❌ Sản phẩm đã hết hàng.' });
  }

  // Kiểm tra số dư
  const user = await User.findOne({ userId: interaction.user.id });
  if (!user || user.balance < product.price) {
    return interaction.editReply({
      content: `❌ Số dư không đủ. Cần **${product.price.toLocaleString()} VNĐ**, bạn có **${user?.balance || 0} VNĐ**.`
    });
  }

  // Trừ tiền, giảm stock
  await User.updateOne({ userId: interaction.user.id }, { $inc: { balance: -product.price } });
  await Product.updateOne({ id: productId }, { $inc: { stock: -1 } });

  // Lấy key
  const keyDoc = await Key.findOneAndUpdate(
    { productId, status: 'available' },
    { $set: { status: 'sold', soldTo: interaction.user.id, soldAt: new Date() } },
    { sort: { createdAt: 1 } }
  );
  if (!keyDoc) {
    return interaction.editReply({ content: '❌ Hết key, vui lòng liên hệ Admin.' });
  }

  // Gửi key qua DM
  try {
    await interaction.user.send(`✅ Bạn đã mua **${product.name}** thành công!\n🔑 Key: \`${keyDoc.key}\``);
    await interaction.editReply({ content: '✅ Mua hàng thành công! Kiểm tra DM nhận key.' });
  } catch (e) {
    await interaction.editReply({ content: `✅ Mua thành công! Key: \`${keyDoc.key}\`` });
  }
};