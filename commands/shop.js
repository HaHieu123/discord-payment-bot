const renderShop = require('../utils/renderShop');

module.exports = {
  name: 'shop',
  description: 'Xem danh sách sản phẩm và chọn mua',
  async execute(interaction) {
    const shopData = await renderShop(interaction);
    await interaction.reply(shopData);
  }
};