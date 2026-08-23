const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const User = require('../models/User');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Xem cửa hàng sản phẩm'),
  async execute(interaction) {
    await interaction.deferReply();

    try {
      const user = await User.findOne({ userId: interaction.user.id });
      const imagePath = path.resolve('C:', 'Users', 'hieuh', 'Downloads', 'cid.jpg');

      // Embed chính (không có số dư)
      const embed = new EmbedBuilder()
        .setTitle('🛒 HaHieu AutoBuy - Cửa Hàng')
        .setDescription('**Hệ Thống Thanh Toán Tự Động 24/7**\nNhấn **Nạp tiền** để nạp thêm số dư\nNhấn **Số dư** để kiểm tra số dư\nNhấn **Hỗ trợ** để tạo ticket')
        .setColor(0xFF0000)
        .setThumbnail('attachment://cid.jpg')
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

      // ------------------- DROPDOWN CHỌN SẢN PHẨM -------------------
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('buy_product')
        .setPlaceholder('📦 Chọn gói sản phẩm bạn muốn mua')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Bypass Emulator - 1 Ngày')
            .setDescription('15,000 VNĐ | Kho: 35')
            .setValue('bypass_1d')
            .setEmoji('🎮'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Bypass Emulator - 7 Ngày')
            .setDescription('70,000 VNĐ | Kho: 10')
            .setValue('bypass_7d')
            .setEmoji('🎮'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Bypass Emulator - 30 Ngày')
            .setDescription('220,000 VNĐ | Kho: 24')
            .setValue('bypass_30d')
            .setEmoji('🎮'),
          new StringSelectMenuOptionBuilder()
            .setLabel('ModMenu PC - 1 Ngày')
            .setDescription('25,000 VNĐ | Kho: 7')
            .setValue('modmenu_1d')
            .setEmoji('🖥️'),
          new StringSelectMenuOptionBuilder()
            .setLabel('ModMenu PC - 7 Ngày')
            .setDescription('120,000 VNĐ | Kho: 0')
            .setValue('modmenu_7d')
            .setEmoji('🖥️'),
          new StringSelectMenuOptionBuilder()
            .setLabel('ModMenu PC - 30 Ngày')
            .setDescription('350,000 VNĐ | Kho: 0')
            .setValue('modmenu_30d')
            .setEmoji('🖥️')
        );

      // Hàng 1: dropdown
      const row1 = new ActionRowBuilder().addComponents(selectMenu);

      // Hàng 2: 3 nút (Nạp tiền, Số dư, Hỗ trợ)
      const row2 = new ActionRowBuilder()
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
            .setCustomId('ho_tro')          // tương tác, không phải link
            .setLabel('🎫 Hỗ Trợ')
            .setStyle(ButtonStyle.Secondary)
        );

      // Reply với 2 hàng (dropdown + buttons)
      await interaction.editReply({
        embeds: [embed],
        components: [row1, row2],
        files: [imagePath]
      });

    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: '❌ Đã xảy ra lỗi, vui lòng thử lại sau.' });
    }
  }
};