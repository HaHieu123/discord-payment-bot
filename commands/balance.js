const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Kiểm tra số dư'),
  async execute(interaction) {
    // Lấy user từ database (nếu có)
    const user = await User.findOne({ userId: interaction.user.id });

    // Tạo embed với thiết kế mới, hiện đại hơn
    const embed = new EmbedBuilder()
      .setTitle('🌟 Thông Tin Tài Khoản')
      .setDescription(`Xin chào **${interaction.user.username}**!`)
      .setColor(0x2B2D31) // màu nền tối (Discord dark theme)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields(
        {
          name: '🆔 Tên hiển thị',
          value: interaction.member?.displayName || interaction.user.username,
          inline: true
        },
        {
          name: '📅 Ngày tham gia Discord',
          value: `<t:${Math.floor(interaction.user.createdTimestamp / 1000)}:D>`,
          inline: true
        },
        {
          name: '🔰 Vai trò cao nhất',
          value: interaction.member?.roles?.highest?.name || 'Không có',
          inline: true
        },
        // ❌ ĐÃ LOẠI BỎ FIELD SỐ DƯ HOÀN TOÀN
        // (không hiển thị bất kỳ thông tin về số dư)
        {
          name: '📋 Trạng thái',
          value: user ? '✅ Đã đăng ký' : '❌ Chưa đăng ký',
          inline: false
        }
      )
      .setFooter({
        text: 'Nhanh Chóng - Bảo Mật - Uy Tín',
        iconURL: 'https://cdn.discordapp.com/embed/avatars/0.png'
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};