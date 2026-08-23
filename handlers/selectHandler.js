const User = require('../models/User');
const Product = require('../models/Product');
const Key = require('../models/Key');

module.exports = async function (interaction) {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== 'buy_product') return;

  await interaction.deferReply({ ephemeral: true });

  const selectedValue = interaction.values[0]; // ví dụ 'bypass_1d'

  // ✅ Tìm sản phẩm theo trường id (khớp với giá trị dropdown)
  const product = await Product.findOne({ id: selectedValue });
  if (!product) {
    return interaction.editReply({ content: '❌ Sản phẩm không tồn tại trong hệ thống.' });
  }
  if (product.stock <= 0) {
    return interaction.editReply({ content: '❌ Sản phẩm đã hết hàng.' });
  }

  const user = await User.findOne({ userId: interaction.user.id });
  if (!user || user.balance < product.price) {
    return interaction.editReply({
      content: `❌ Số dư không đủ. Cần **${product.price.toLocaleString()} VNĐ**, bạn có **${user?.balance || 0} VNĐ**.`
    });
  }

  // Trừ tiền, giảm stock
  await User.updateOne({ userId: interaction.user.id }, { $inc: { balance: -product.price } });
  await Product.updateOne({ id: selectedValue }, { $inc: { stock: -1 } });

  // ✅ Lấy key theo productId (trường productId trong Key khớp với id của Product)
  const keyDoc = await Key.findOneAndUpdate(
    { productId: selectedValue, status: 'available' },
    { $set: { status: 'sold', soldTo: interaction.user.id, soldAt: new Date() } },
    { sort: { createdAt: 1 } }
  );
  if (!keyDoc) {
    return interaction.editReply({ content: '❌ Hết key, vui lòng liên hệ Admin.' });
  }

  try {
    await interaction.user.send(`✅ Bạn đã mua **${product.name}** thành công!\n🔑 Key: \`${keyDoc.key}\``);
    await interaction.editReply({ content: '✅ Mua hàng thành công! Kiểm tra DM nhận key.' });
  } catch (e) {
    await interaction.editReply({ content: `✅ Mua thành công! Key: \`${keyDoc.key}\`` });
  }
};