const User = require('../models/User');
const Product = require('../models/Product');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = async function (interaction) {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== 'buy_product') return;

  const selectedValue = interaction.values[0]; // ví dụ 'bypass_1d'

  // Kiểm tra sản phẩm có tồn tại và còn hàng
  const product = await Product.findOne({ id: selectedValue });
  if (!product) {
    return interaction.reply({ content: '❌ Sản phẩm không tồn tại.', ephemeral: true });
  }
  if (product.stock <= 0) {
    return interaction.reply({ content: '❌ Sản phẩm đã hết hàng.', ephemeral: true });
  }

  // Tạo modal nhập số lượng
  const modal = new ModalBuilder()
    .setCustomId(`buy_confirm_${selectedValue}`)
    .setTitle(`🛒 Mua ${product.name}`);

  const quantityInput = new TextInputBuilder()
    .setCustomId('quantity')
    .setLabel('Nhập số lượng muốn mua')
    .setPlaceholder(`Tối đa ${product.stock} sản phẩm`)
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMinLength(1)
    .setMaxLength(3); // giới hạn 999

  const row = new ActionRowBuilder().addComponents(quantityInput);
  modal.addComponents(row);

  // Hiển thị modal
  await interaction.showModal(modal);
};