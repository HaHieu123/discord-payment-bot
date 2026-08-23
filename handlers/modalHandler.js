const { EmbedBuilder, MessageFlags } = require('discord.js');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const paymentService = require('../services/paymentService');

module.exports = async function (interaction) {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId === 'depositModal') {
    try {
      const amount = parseInt(interaction.fields.getTextInputValue('depositAmount'));
      if (isNaN(amount) || amount < 10000) {
        return await interaction.reply({
          content: '⚠️ Số tiền phải là số và tối thiểu 10,000 VNĐ.',
          flags: MessageFlags.Ephemeral
        });
      }

      // Tạo mã giao dịch
      const code = `NAP_${interaction.user.id}_${Date.now()}`;
      // Lưu transaction
      await Transaction.create({
        code,
        userId: interaction.user.id,
        amount,
        type: 'deposit',
        status: 'pending'
      });

      // Tạo QR thanh toán
      const qrData = await paymentService.generateQR(code, amount);
      console.log('QR Data:', qrData); // Debug

      const embed = new EmbedBuilder()
        .setTitle('💳 Nạp Tiền')
        .setDescription(`Số tiền: ${amount.toLocaleString()} VNĐ`)
        .addFields(
          { name: '📌 Nội dung chuyển khoản', value: `\`${code}\`` },
          { name: '🏦 Quét mã QR để thanh toán', value: 'Sau khi chuyển, bot sẽ tự động cập nhật số dư (có thể mất vài phút).' }
        )
        .setImage(qrData.qrImageUrl)
        .setColor('#00ccff');

      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('Lỗi trong modalHandler:', error);
      await interaction.reply({
        content: '❌ Có lỗi xảy ra khi tạo QR. Vui lòng thử lại sau.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};