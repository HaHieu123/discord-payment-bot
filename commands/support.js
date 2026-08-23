const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('support')
    .setDescription('Hỗ trợ tạo ticket'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🆘 Hỗ Trợ')
      .setDescription('Liên hệ Admin:\n- Cá nhân: @kieran2112\n- Tạo ticket: nhấn nút bên dưới')
      .setColor('#ff0000');
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};