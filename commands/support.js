const { EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  name: 'support',
  description: 'Hỗ trợ tạo ticket',
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🆘 Hỗ Trợ')
      .setDescription('Liên hệ Admin:\n- Cá nhân: @ADMIN\n- Tạo ticket: nhấn nút bên dưới')
      .setColor('#ff0000');
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};