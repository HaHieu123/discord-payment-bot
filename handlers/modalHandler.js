const User = require('../models/User');
const Product = require('../models/Product');
const Key = require('../models/Key');
const Transaction = require('../models/Transaction');
const paymentService = require('../services/paymentService');
const { EmbedBuilder } = require('discord.js');

module.exports = async function (interaction) {
  if (!interaction.isModalSubmit()) return;
  const customId = interaction.customId;

  // 🏦 MODAL NẠP TIỀN
  if (customId === 'depositModal') {
    await interaction.deferReply({ ephemeral: true });

    try {
      const amount = parseInt(interaction.fields.getTextInputValue('depositAmount'));
      if (isNaN(amount) || amount < 10000) {
        return interaction.editReply({ content: '❌ Số tiền tối thiểu là 10,000 VNĐ.' });
      }

      // Tạo mã giao dịch
      const code = `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // ✅ THÊM TRƯỜNG `type` VÀO TRANSACTION
      const transaction = new Transaction({
        userId: interaction.user.id,
        code,
        amount,
        status: 'pending',
        type: 'deposit',         // 👈 THÊM DÒNG NÀY
        createdAt: new Date()
      });
      await transaction.save();

      // Tạo QR từ paymentService
      const qrData = await paymentService.generateQR(code, amount);
      
      const embed = new EmbedBuilder()
        .setTitle('💳 Nạp tiền')
        .setDescription(
          `Mã giao dịch: \`${code}\`\n` +
          `Số tiền: **${amount.toLocaleString()} VNĐ**\n\n` +
          `Vui lòng chuyển khoản đến số tài khoản bên dưới.`
        )
        .setImage(qrData.qrImageUrl)
        .setColor(0x00AAFF)
        .setFooter({ text: 'Sau khi chuyển khoản, hệ thống sẽ tự động cập nhật.' });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('❌ Lỗi xử lý nạp tiền:', error);
      // Kiểm tra lỗi validation cụ thể
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message).join(', ');
        await interaction.editReply({ content: `❌ Lỗi dữ liệu: ${messages}` });
      } else {
        await interaction.editReply({ content: '❌ Lỗi tạo giao dịch, vui lòng thử lại sau.' });
      }
    }
    return;
  }

  // 🛒 MODAL MUA HÀNG (buy_confirm_*)
  if (customId.startsWith('buy_confirm_')) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const productId = customId.replace('buy_confirm_', '');
      const quantity = parseInt(interaction.fields.getTextInputValue('quantity'));

      if (isNaN(quantity) || quantity < 1) {
        return interaction.editReply({ content: '❌ Số lượng không hợp lệ.' });
      }

      const product = await Product.findOne({ id: productId });
      if (!product) {
        return interaction.editReply({ content: '❌ Sản phẩm không tồn tại.' });
      }
      if (product.stock < quantity) {
        return interaction.editReply({ content: `❌ Không đủ hàng (còn ${product.stock}).` });
      }

      const user = await User.findOne({ userId: interaction.user.id });
      const totalPrice = product.price * quantity;
      if (!user || user.balance < totalPrice) {
        return interaction.editReply({
          content: `❌ Số dư không đủ. Cần **${totalPrice.toLocaleString()} VNĐ**, bạn có **${user?.balance || 0} VNĐ**.`
        });
      }

      // Lấy key
      const keys = await Key.find({ productId, status: 'available' }).limit(quantity);
      if (keys.length < quantity) {
        return interaction.editReply({ content: '❌ Hết key, vui lòng liên hệ Admin.' });
      }

      // Trừ tiền, giảm stock, đánh dấu key đã bán
      await User.updateOne({ userId: interaction.user.id }, { $inc: { balance: -totalPrice } });
      await Product.updateOne({ id: productId }, { $inc: { stock: -quantity } });
      await Key.updateMany(
        { _id: { $in: keys.map(k => k._id) } },
        { $set: { status: 'sold', soldTo: interaction.user.id, soldAt: new Date() } }
      );

      const keyList = keys.map(k => `\`${k.key}\``).join('\n');
      try {
        await interaction.user.send(`✅ Bạn đã mua **${quantity}** sản phẩm **${product.name}**\n🔑 Key:\n${keyList}`);
        await interaction.editReply({ content: '✅ Mua thành công! Kiểm tra DM để nhận key.' });
      } catch (e) {
        await interaction.editReply({ content: `✅ Mua thành công! Key:\n${keyList}` });
      }
    } catch (error) {
      console.error('❌ Lỗi mua hàng:', error);
      await interaction.editReply({ content: '❌ Có lỗi xảy ra khi mua hàng, vui lòng thử lại.' });
    }
  }
};