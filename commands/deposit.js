const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'deposit',
  description: 'Nạp tiền vào tài khoản',
  async execute(interaction) {
    // Tạo modal nhập số tiền
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

    await interaction.showModal(modal);
  }
};