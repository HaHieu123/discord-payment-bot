const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = async function (interaction) {
  if (!interaction.isButton()) return;
  const customId = interaction.customId;

  if (customId === 'nap_tien') {
    const modal = new ModalBuilder()
      .setCustomId('depositModal')
      .setTitle('💳 Nạp Tiền Vào Hệ Thống');
    const amountInput = new TextInputBuilder()
      .setCustomId('depositAmount')
      .setLabel('Nhập số tiền muốn nạp (VNĐ)')
      .setPlaceholder('VD: 50000 (Tối thiểu 10,000 VNĐ)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(amountInput));
    return await interaction.showModal(modal);
  }

  if (customId === 'so_du') {
    await interaction.deferReply({ ephemeral: true });
    const user = await User.findOne({ userId: interaction.user.id });
    const embed = new EmbedBuilder()
      .setTitle('💰 Số dư của bạn')
      .setDescription(`**${user?.balance || 0} VNĐ**`)
      .setColor(0x00FF00)
      .setFooter({ text: 'Nhanh Chóng - Bảo Mật - Uy Tín' });
    return await interaction.editReply({ embeds: [embed] });
  }

  // ✅ Nút Hỗ trợ – hiển thị embed có link đến #tao-ticket
  if (customId === 'ho_tro') {
    await interaction.deferReply({ ephemeral: true });

    // Lấy ID kênh từ env
    const channelId = process.env.TICKET_CHANNEL_ID;
    if (!channelId) {
      return interaction.editReply({ content: '❌ Kênh hỗ trợ chưa được cấu hình, vui lòng liên hệ Admin.' });
    }

    const link = `https://discord.com/channels/${interaction.guild.id}/${channelId}`;
    const embed = new EmbedBuilder()
      .setTitle('📞 Hỗ trợ khách hàng')
      .setDescription(
        `🔹 Liên hệ **Admin** qua DM: @kieran2112\n` +
        `🔹 Hoặc tạo ticket tại kênh **[#tao-ticket](${link})**\n` +
        `🔗 [Nhấn vào đây để đến kênh ticket](${link})`
      )
      .setColor(0x0099FF)
      .setFooter({ text: 'Nhanh Chóng - Bảo Mật - Uy Tín' })
      .setTimestamp();

    return await interaction.editReply({ embeds: [embed] });
  }

  // Fallback
  await interaction.reply({ content: 'Chức năng chưa được hỗ trợ.', ephemeral: true });
};