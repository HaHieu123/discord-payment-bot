const { SlashCommandBuilder } = require('discord.js');
const renderShop = require('../utils/renderShop');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Xem danh sách sản phẩm và chọn mua'),
  async execute(interaction) {
    const shopData = await renderShop(interaction);
    await interaction.reply(shopData);
  }
};