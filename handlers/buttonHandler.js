const { EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const User = require('../models/User');
const Product = require('../models/Product');
const Key = require('../models/Key');

module.exports = async function (interaction) {
  if (!interaction.isButton()) return;
  const customId = interaction.customId;

  // Nút Nạp tiền → mở modal
  if (customId === 'deposit') {
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

  // Nút Số dư
  if (customId === 'balance') {
    const user = await User.findOne({ userId: interaction.user.id });
    const embed = new EmbedBuilder()
      .setTitle('💰 Số dư')
      .setDescription(`Số dư của bạn: ${user?.balance || 0} VNĐ`);
    return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  // Nút Hỗ trợ
  if (customId === 'support') {
    return await interaction.reply({
      content: 'Vui lòng liên hệ Admin qua DM hoặc tạo ticket.',
      flags: MessageFlags.Ephemeral
    });
  }

  // Nút mua hàng (nếu bạn vẫn giữ cơ chế nút mua riêng) – không cần thiết vì đã dùng dropdown, nhưng giữ lại để tương thích
  if (customId.startsWith('buy_')) {
    const productId = customId.replace('buy_', '');
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return await interaction.reply({ content: 'Sản phẩm không tồn tại.', flags: MessageFlags.Ephemeral });
    }
    if (product.stock <= 0) {
      return await interaction.reply({ content: 'Sản phẩm đã hết hàng.', flags: MessageFlags.Ephemeral });
    }

    const user = await User.findOne({ userId: interaction.user.id });
    if (!user || user.balance < product.price) {
      return await interaction.reply({
        content: `Số dư không đủ. Cần ${product.price.toLocaleString()} VNĐ, bạn có ${user?.balance || 0} VNĐ.`,
        flags: MessageFlags.Ephemeral
      });
    }

    await User.updateOne({ userId: interaction.user.id }, { $inc: { balance: -product.price } });
    await Product.updateOne({ id: productId }, { $inc: { stock: -1 } });

    const keyDoc = await Key.findOneAndUpdate(
      { productId, status: 'available' },
      { $set: { status: 'sold', soldTo: interaction.user.id, soldAt: new Date() } },
      { sort: { createdAt: 1 } }
    );
    if (!keyDoc) {
      return await interaction.reply({ content: '❌ Hết key, vui lòng liên hệ Admin.', flags: MessageFlags.Ephemeral });
    }

    try {
      await interaction.user.send(`✅ Bạn đã mua **${product.name}** thành công!\n🔑 Key: \`${keyDoc.key}\``);
    } catch (e) {
      return await interaction.reply({ content: `✅ Mua thành công! Key: ${keyDoc.key}`, flags: MessageFlags.Ephemeral });
    }
    return await interaction.reply({ content: '✅ Mua hàng thành công! Kiểm tra DM nhận key.', flags: MessageFlags.Ephemeral });
  }

  // Xử lý nút "Tiếp tục mua" (refresh shop) – nếu bạn đã có
  if (customId === 'refresh_shop') {
    const renderShop = require('../utils/renderShop');
    const shopData = await renderShop(interaction);
    return await interaction.update(shopData);
  }
};