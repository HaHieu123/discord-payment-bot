const { EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../models/User');
const Product = require('../models/Product');
const Key = require('../models/Key');

module.exports = async function (interaction) {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== 'buy_product') return;

  // Defer update để có thời gian xử lý (tránh lỗi timeout)
  await interaction.deferUpdate();

  const productId = interaction.values[0];
  if (productId === 'no_product') {
    // Không có sản phẩm: gửi ephemeral và giữ nguyên shop
    await interaction.followUp({
      content: 'Hiện tại chưa có sản phẩm nào để mua.',
      flags: MessageFlags.Ephemeral
    });
    // Giữ nguyên giao diện shop (render lại)
    const renderShop = require('../utils/renderShop');
    const shopData = await renderShop(interaction);
    await interaction.editReply(shopData);
    return;
  }

  // Tìm sản phẩm
  const product = await Product.findOne({ id: productId });
  if (!product) {
    await interaction.followUp({
      content: '❌ Sản phẩm không tồn tại.',
      flags: MessageFlags.Ephemeral
    });
    const renderShop = require('../utils/renderShop');
    const shopData = await renderShop(interaction);
    await interaction.editReply(shopData);
    return;
  }
  if (product.stock <= 0) {
    await interaction.followUp({
      content: '❌ Sản phẩm đã hết hàng.',
      flags: MessageFlags.Ephemeral
    });
    const renderShop = require('../utils/renderShop');
    const shopData = await renderShop(interaction);
    await interaction.editReply(shopData);
    return;
  }

  // Kiểm tra số dư
  const user = await User.findOne({ userId: interaction.user.id });
  if (!user || user.balance < product.price) {
    await interaction.followUp({
      content: `❌ Số dư không đủ. Cần ${product.price.toLocaleString()} VNĐ, bạn có ${user?.balance || 0} VNĐ. Vui lòng nạp thêm tiền.`,
      flags: MessageFlags.Ephemeral
    });
    const renderShop = require('../utils/renderShop');
    const shopData = await renderShop(interaction);
    await interaction.editReply(shopData);
    return;
  }

  // === Tiến hành mua hàng ===
  // Trừ tiền, giảm stock
  await User.updateOne({ userId: interaction.user.id }, { $inc: { balance: -product.price } });
  await Product.updateOne({ id: productId }, { $inc: { stock: -1 } });

  // Lấy key
  const keyDoc = await Key.findOneAndUpdate(
    { productId, status: 'available' },
    { $set: { status: 'sold', soldTo: interaction.user.id, soldAt: new Date() } },
    { sort: { createdAt: 1 } }
  );
  if (!keyDoc) {
    await interaction.followUp({
      content: '❌ Hết key, vui lòng liên hệ Admin.',
      flags: MessageFlags.Ephemeral
    });
    // Vẫn giữ nguyên shop (render lại) vì có thể các sản phẩm khác vẫn còn
    const renderShop = require('../utils/renderShop');
    const shopData = await renderShop(interaction);
    await interaction.editReply(shopData);
    return;
  }

  // Gửi key qua DM
  try {
    await interaction.user.send(`✅ Bạn đã mua **${product.name}** thành công!\n🔑 Key: \`${keyDoc.key}\``);
  } catch (e) {
    // Nếu không DM được, hiển thị key công khai (kém an toàn hơn)
    await interaction.editReply({
      content: `✅ Mua thành công! Key: ${keyDoc.key}`,
      components: []
    });
    return;
  }

  // === Tạo Embed xác nhận ===
  const embed = new EmbedBuilder()
    .setTitle('✅ Mua hàng thành công!')
    .setDescription(`Bạn đã mua **${product.name}**`)
    .setColor('#00ff00')
    .addFields(
      { name: '💰 Giá', value: `${product.price.toLocaleString()} VNĐ`, inline: true },
      { name: '💳 Số dư còn lại', value: `${(user.balance - product.price).toLocaleString()} VNĐ`, inline: true },
      { name: '📦 Tồn kho còn lại', value: `${product.stock - 1}`, inline: true }
    )
    .setFooter({ text: '🔑 Key đã được gửi qua DM' });

  // Thêm nút "Tiếp tục mua" để quay lại shop
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('refresh_shop')
        .setLabel('🔄 Tiếp tục mua')
        .setStyle(ButtonStyle.Primary)
    );

  // Cập nhật tin nhắn shop gốc thành xác nhận thành công
  await interaction.editReply({
    embeds: [embed],
    components: [row],
    content: null
  });
};