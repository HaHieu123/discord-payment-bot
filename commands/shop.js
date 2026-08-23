const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Product = require('../models/Product');

module.exports = {
  name: 'shop',
  description: 'Xem danh sách sản phẩm',
  async execute(interaction) {
    const products = await Product.find().sort({ category: 1, price: 1 });

    const embed = new EmbedBuilder()
      .setTitle('🛒 Ha Hieu AutoBuy APP')
      .setDescription('**Hệ Thống Thanh Toán Tự Động 24/7**\nNhấn **Nạp tiền** để nạp thêm số dư\nNhấn **Số dư** để kiểm tra số dư\nNhấn **Hỗ trợ** để tạo ticket')
      .setColor('#FFA500')
      .addFields(
        { name: '📦 Bypass Emulator', value: products.filter(p => p.category === 'bypass').map(p => `${p.name} : ${p.price.toLocaleString()} VNĐ | Kho: ${p.stock}`).join('\n'), inline: false },
        { name: '🎮 ModMenu PC', value: products.filter(p => p.category === 'modmenu').map(p => `${p.name} : ${p.price.toLocaleString()} VNĐ | Kho: ${p.stock}`).join('\n'), inline: false }
      )
      .setFooter({ text: 'Nhanh Chóng - Bảo Mật - Uy Tín' });

    // === Hàng 1: Các nút chức năng chính ===
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('deposit').setLabel('Nạp Tiền').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('balance').setLabel('Số Dư').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('support').setLabel('Hỗ Trợ').setStyle(ButtonStyle.Secondary)
      );

    // === Hàng 2, 3, ...: Nút mua hàng (tối đa 5 nút/hàng) ===
    const productRows = [];
    let currentRow = new ActionRowBuilder();
    let buttonCount = 0;

    products.forEach(p => {
      if (p.stock > 0) {
        const button = new ButtonBuilder()
          .setCustomId(`buy_${p.id}`)
          .setLabel(p.name)
          .setStyle(ButtonStyle.Primary);

        currentRow.addComponents(button);
        buttonCount++;

        // Nếu đã đủ 5 nút, đẩy row hiện tại vào mảng và tạo row mới
        if (buttonCount === 5) {
          productRows.push(currentRow);
          currentRow = new ActionRowBuilder();
          buttonCount = 0;
        }
      }
    });

    // Đẩy row cuối cùng (nếu còn nút) vào mảng
    if (buttonCount > 0) {
      productRows.push(currentRow);
    }

    // Ghép tất cả rows lại: row1 + productRows
    const components = [row1, ...productRows];

    await interaction.reply({
      embeds: [embed],
      components: components
    });
  }
};