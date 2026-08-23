const User = require('../models/User');
const Product = require('../models/Product');
const Key = require('../models/Key');

module.exports = async function (interaction) {
  if (!interaction.isModalSubmit()) return;

  const customId = interaction.customId;

  // Nếu có modal nạp tiền (deposit)
  if (customId === 'depositModal') {
    // Giữ nguyên logic nạp tiền của bạn (nếu có)
    // ... code xử lý deposit
    return;
  }

  // Xử lý modal mua hàng (customId bắt đầu bằng 'buy_confirm_')
  if (customId.startsWith('buy_confirm_')) {
    await interaction.deferReply({ ephemeral: true });

    const productId = customId.replace('buy_confirm_', '');
    const quantityInput = interaction.fields.getTextInputValue('quantity');
    const quantity = parseInt(quantityInput);

    // Kiểm tra số lượng hợp lệ
    if (isNaN(quantity) || quantity < 1) {
      return interaction.editReply({ content: '❌ Vui lòng nhập số lượng hợp lệ (>=1).' });
    }

    // Lấy sản phẩm
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return interaction.editReply({ content: '❌ Sản phẩm không tồn tại.' });
    }
    if (product.stock < quantity) {
      return interaction.editReply({ content: `❌ Không đủ hàng. Hiện còn ${product.stock} sản phẩm.` });
    }

    // Kiểm tra số dư
    const user = await User.findOne({ userId: interaction.user.id });
    const totalPrice = product.price * quantity;
    if (!user || user.balance < totalPrice) {
      return interaction.editReply({
        content: `❌ Số dư không đủ. Cần **${totalPrice.toLocaleString()} VNĐ**, bạn có **${user?.balance || 0} VNĐ**.`
      });
    }

    // Lấy đủ số lượng key
    const keys = await Key.find({ productId, status: 'available' }).limit(quantity);
    if (keys.length < quantity) {
      return interaction.editReply({ content: '❌ Hệ thống đang thiếu key, vui lòng liên hệ Admin.' });
    }

    // Cập nhật giao dịch
    await User.updateOne({ userId: interaction.user.id }, { $inc: { balance: -totalPrice } });
    await Product.updateOne({ id: productId }, { $inc: { stock: -quantity } });

    const keyIds = keys.map(k => k._id);
    await Key.updateMany(
      { _id: { $in: keyIds } },
      { $set: { status: 'sold', soldTo: interaction.user.id, soldAt: new Date() } }
    );

    // Gửi danh sách key qua DM
    const keyList = keys.map(k => `\`${k.key}\``).join('\n');
    try {
      await interaction.user.send(`✅ Bạn đã mua **${quantity}** sản phẩm **${product.name}** thành công!\n🔑 Các key:\n${keyList}`);
      await interaction.editReply({ content: `✅ Mua thành công ${quantity} sản phẩm! Kiểm tra DM để nhận key.` });
    } catch (e) {
      // Nếu không gửi DM được, gửi key ngay trong reply (có thể bị lộ nhưng an toàn)
      await interaction.editReply({ content: `✅ Mua thành công! Key:\n${keyList}` });
    }
  }
};