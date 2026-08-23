const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Product = require('../models/Product');

module.exports = {
  name: 'shop',
  description: 'Xem danh sách sản phẩm',
  async execute(interaction) {
    const products = await Product.find().sort({ category: 1, price: 1 });

    const embed = new EmbedBuilder()
      .setTitle('🛒 Berserk AutoBuy APP')
      .setDescription('**Hệ Thống Thanh Toán Tự Động 24/7**\nNhấn **Nạp tiền** để nạp thêm số dư\nNhấn **Số dư** để kiểm tra số dư\nNhấn **Hỗ trợ** để tạo ticket')
      .setColor('#FFA500')
      .addFields(
        { name: '📦 Bypass Emulator', value: products.filter(p => p.category === 'bypass').map(p => `${p.name} : ${p.price.toLocaleString()} VNĐ | Kho: ${p.stock}`).join('\n'), inline: false },
        { name: '🎮 ModMenu PC', value: products.filter(p => p.category === 'modmenu').map(p => `${p.name} : ${p.price.toLocaleString()} VNĐ | Kho: ${p.stock}`).join('\n'), inline: false }
      )
      .setFooter({ text: 'Nhanh Chóng - Bảo Mật - Uy Tín' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('deposit').setLabel('Nạp Tiền').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('balance').setLabel('Số Dư').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('support').setLabel('Hỗ Trợ').setStyle(ButtonStyle.Secondary)
      );

    // Thêm nút mua hàng cho từng sản phẩm (có thể thêm vào hàng khác)
    const productRow = new ActionRowBuilder();
    products.forEach(p => {
      if (p.stock > 0) {
        productRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`buy_${p.id}`)
            .setLabel(p.name)
            .setStyle(ButtonStyle.Primary)
        );
      }
    });

    await interaction.reply({
      embeds: [embed],
      components: [row, productRow]
    });
  }
};