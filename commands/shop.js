const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../models/User');
const path = require('path'); // 👈 thêm dòng này

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Xem cửa hàng sản phẩm'),
  async execute(interaction) {
    const user = await User.findOne({ userId: interaction.user.id });

    const embed = new EmbedBuilder()
      .setTitle('🛒 HaHieu AutoBuy - Cửa Hàng')
      .setDescription('**Hệ Thống Thanh Toán Tự Động 24/7**\nNhấn **Nạp tiền** để nạp thêm số dư\nNhấn **Số dư** để kiểm tra số dư\nNhấn **Hỗ trợ** để tạo ticket')
      .setColor(0xFF0000)
      .setThumbnail('attachment://cid.jpg') // 👈 dùng ảnh local
      .addFields(
        {
          name: '🎮 Bảng giá Bypass Emulator',
          value: '• Bypass Emulator - 1 Ngày : 15,000 VNĐ | Kho: 35\n• Bypass Emulator - 7 Ngày : 70,000 VNĐ | Kho: 10\n• Bypass Emulator - 30 Ngày : 220,000 VNĐ | Kho: 24',
          inline: false
        },
        {
          name: '🖥️ Bảng Giá ModMenu PC',
          value: '• ModMenu PC - 1 Ngày : 25,000 VNĐ | Kho: 7\n• ModMenu PC - 7 Ngày : 120,000 VNĐ | Kho: 0\n• ModMenu PC - 30 Ngày : 350,000 VNĐ | Kho: 0',
          inline: false
        },
        {
          name: '📞 Hỗ trợ',
          value: '• Cá Nhân : @kieran2112\n• Hệ Thống : #tao-ticket',
          inline: false
        },
        {
          name: '📋 Trạng thái tài khoản',
          value: user ? '✅ Đã đăng ký' : '❌ Chưa đăng ký (vui lòng nạp tiền lần đầu)',
          inline: false
        }
      )
      .setFooter({ text: 'Nhanh Chóng - Bảo Mật - Uy Tín' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('nap_tien')
          .setLabel('Nạp Tiền')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('so_du')
          .setLabel('Số Dư')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setLabel('Hỗ Trợ')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.gg/your-support-link')
      );

    // Gửi kèm file ảnh
    await interaction.reply({
      embeds: [embed],
      components: [row],
      files: [path.join('C:', 'Users', 'hieuh', 'Downloads', 'cid.jpg')] // 👈 đính kèm ảnh
    });
  }
};