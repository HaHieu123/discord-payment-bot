const User = require('../models/User');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const Key = require('../models/Key');
const paymentService = require('../services/paymentService');
const { EmbedBuilder } = require('discord.js');

module.exports = async function (interaction) {
  if (!interaction.isButton()) return;
  const customId = interaction.customId;

  // Các nút chức năng chính
  if (customId === 'deposit') {
    // Gọi lại lệnh deposit (có thể dùng command hoặc modal)
    // Tạo modal ngay tại đây
    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
    const modal = new ModalBuilder()
      .setCustomId('depositModal')
      .setTitle('Nạp Tiền Vào Hệ Thống');
    const amountInput = new TextInputBuilder()
      .setCustomId('depositAmount')
      .setLabel('Nhập số tiền muốn nạp (VNĐ)')
      .setPlaceholder('VD: 50000 (Tối thiểu 10,000 VNĐ)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(amountInput));
    return await interaction.showModal(modal);
  }

  if (customId === 'balance') {
    const user = await User.findOne({ userId: interaction.user.id });
    const embed = new EmbedBuilder()
      .setTitle('💰 Số dư')
      .setDescription(`Số dư của bạn: ${user?.balance || 0} VNĐ`);
    return await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (customId === 'support') {
    // Tạo ticket hoặc hướng dẫn
    return await interaction.reply({ content: 'Vui lòng liên hệ Admin qua DM hoặc tạo ticket.', ephemeral: true });
  }

  // Xử lý mua hàng: customId có dạng 'buy_xxx'
  if (customId.startsWith('buy_')) {
    const productId = customId.replace('buy_', '');
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return await interaction.reply({ content: 'Sản phẩm không tồn tại.', ephemeral: true });
    }
    if (product.stock <= 0) {
      return await interaction.reply({ content: 'Sản phẩm đã hết hàng.', ephemeral: true });
    }

    const user = await User.findOne({ userId: interaction.user.id });
    if (!user || user.balance < product.price) {
      return await interaction.reply({
        content: `Số dư không đủ. Cần ${product.price.toLocaleString()} VNĐ, bạn có ${user?.balance || 0} VNĐ.`,
        ephemeral: true
      });
    }

    // Tiến hành mua
    // Trừ tiền
    await User.updateOne({ userId: interaction.user.id }, { $inc: { balance: -product.price } });
    // Giảm stock
    await Product.updateOne({ id: productId }, { $inc: { stock: -1 } });
    // Lấy key
    const keyDoc = await Key.findOneAndUpdate(
      { productId, status: 'available' },
      { $set: { status: 'sold', soldTo: interaction.user.id, soldAt: new Date() } },
      { sort: { createdAt: 1 } }
    );
    if (!keyDoc) {
      return await interaction.reply({ content: '❌ Hết key, vui lòng liên hệ Admin.', ephemeral: true });
    }

    // Gửi key qua DM
    try {
      await interaction.user.send(`✅ Bạn đã mua **${product.name}** thành công!\n🔑 Key: \`${keyDoc.key}\``);
    } catch (e) {
      // Nếu user chặn DM, thông báo công khai (ít bảo mật hơn)
      await interaction.reply({ content: `✅ Mua thành công! Key: ${keyDoc.key}`, ephemeral: true });
      return;
    }
    await interaction.reply({ content: '✅ Mua hàng thành công! Kiểm tra DM nhận key.', ephemeral: true });
  }
};