const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const Product = require('../models/Product');
const User = require('../models/User');

module.exports = async function renderShop(interaction) {
  const products = await Product.find().sort({ category: 1, price: 1 });
  const user = await User.findOne({ userId: interaction.user.id });
  const balance = user?.balance || 0;

  const embed = new EmbedBuilder()
    .setTitle('🛒 HaHieu AutoBuy APP')
    .setDescription('**Hệ Thống Thanh Toán Tự Động 24/7**\nNhấn **Nạp tiền** để nạp thêm số dư\nNhấn **Số dư** để kiểm tra số dư\nNhấn **Hỗ trợ** để tạo ticket')
    .setColor('#FFA500')
    .addFields(
      { name: '📦 Bảng giá Bypass Emulator', value: products.filter(p => p.category === 'bypass').map(p => `${p.name} : ${p.price.toLocaleString()} VNĐ | Kho: ${p.stock}`).join('\n') || 'Không có sản phẩm', inline: false },
      { name: '🎮 Bảng Giá ModMenu PC', value: products.filter(p => p.category === 'modmenu').map(p => `${p.name} : ${p.price.toLocaleString()} VNĐ | Kho: ${p.stock}`).join('\n') || 'Không có sản phẩm', inline: false },
      { name: '💰 Số dư của bạn', value: `${balance.toLocaleString()} VNĐ`, inline: false }
    )
    .setFooter({ text: 'Nhanh Chóng - Bảo Mật - Uy Tín' });

  const row1 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('deposit').setLabel('Nạp Tiền').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('balance').setLabel('Số Dư').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('support').setLabel('Hỗ Trợ').setStyle(ButtonStyle.Secondary)
    );

  const menu = new StringSelectMenuBuilder()
    .setCustomId('buy_product')
    .setPlaceholder('Chọn gói sản phẩm bạn muốn mua')
    .setMinValues(1)
    .setMaxValues(1);

  products.forEach(p => {
    if (p.stock > 0) {
      menu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(p.name)
          .setDescription(`Giá: ${p.price.toLocaleString()} VNĐ | Kho: ${p.stock}`)
          .setValue(p.id)
      );
    }
  });

  if (menu.options.length === 0) {
    menu.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Hiện tại chưa có sản phẩm nào')
        .setDescription('Vui lòng quay lại sau')
        .setValue('no_product')
    );
  }

  const row2 = new ActionRowBuilder().addComponents(menu);
  return { embeds: [embed], components: [row1, row2] };
};