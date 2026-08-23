const { EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const User = require('../models/User');
const Product = require('../models/Product');
const Key = require('../models/Key');

module.exports = async function (interaction) {
  if (!interaction.isButton()) return;
  const customId = interaction.customId;

  // Nút Nạp tiền → modal
  if (customId === 'nap_tien') {
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

  // Nút Số dư (xanh lá)
  if (customId === 'so_du') {
    await interaction.deferReply({ ephemeral: true });
    const user = await User.findOne({ userId: interaction.user.id });
    const embed = new EmbedBuilder()
      .setTitle('💰 Số dư')
      .setDescription(`Số dư của bạn: ${user?.balance || 0} VNĐ`)
      .setColor(0x00FF00)
      .setFooter({ text: 'Nhanh Chóng - Bảo Mật - Uy Tín' });
    return await interaction.editReply({ embeds: [embed] });
  }

  // ✅ Nút Hỗ trợ – hiện embed hướng dẫn
  if (customId === 'ho_tro') {
    await interaction.deferReply({ ephemeral: true });

    // Lấy ID server và kênh #tao-ticket (bạn cần thay CHANNEL_ID thực tế)
    const guildId = interaction.guild.id;
    const channelId = 'CHANNEL_ID_CUA_TAO_TICKET'; // 👈 thay bằng ID thật của kênh

    // Tạo link đến kênh (có thể click)
    const ticketLink = `https://discord.com/channels/${guildId}/${channelId}`;

    const embed = new EmbedBuilder()
      .setTitle('📞 Hỗ trợ khách hàng')
      .setDescription(
        `📌 **Admin hỗ trợ:** @kieran2112\n` +
        `🔗 **Hoặc bấm vào đây để đến kênh ticket:** [Nhấn vào đây](${ticketLink})`
      )
      .setColor(0x0099FF)
      .setFooter({ text: 'Nhanh Chóng - Bảo Mật - Uy Tín' })
      .setTimestamp();

    return await interaction.editReply({ embeds: [embed] });
  }

  // Nút mua hàng (buy_...)
  if (customId.startsWith('buy_')) {
    // ... giữ nguyên logic bạn đã có
    // (Tôi đã viết ở các phần trước, bạn có thể copy từ file cũ)
  }

  // Nút refresh_shop
  if (customId === 'refresh_shop') {
    const renderShop = require('../utils/renderShop');
    const shopData = await renderShop(interaction);
    return await interaction.update(shopData);
  }

  // Fallback
  await interaction.reply({
    content: 'Chức năng chưa được hỗ trợ hoặc button không hợp lệ.',
    ephemeral: true
  });
};