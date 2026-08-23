const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Kiểm tra số dư'),
  async execute(interaction) {
    const user = await User.findOne({ userId: interaction.user.id });
    const embed = new EmbedBuilder()
      .setTitle('💰 Thông Tin Tài Khoản')
      .setDescription(`Khách hàng: ${interaction.user.username}`)
      .addFields({ name: 'Số dư khả dụng', value: `${user?.balance || 0} VNĐ` })
      .setColor('#0099ff')
      .setFooter({ text: 'Nhanh Chóng - Bảo Mật - Uy Tín' });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};