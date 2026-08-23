const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setbalance')
    .setDescription('Set số dư cho người dùng (chỉ Admin)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Người dùng cần set số dư')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Số tiền (VNĐ)')
        .setRequired(true)
        .setMinValue(0))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    let user = await User.findOne({ userId: targetUser.id });
    if (!user) {
      user = await User.create({
        userId: targetUser.id,
        username: targetUser.username,
        balance: 0
      });
    }

    user.balance = amount;
    await user.save();

    const embed = new EmbedBuilder()
      .setTitle('✅ Đã set số dư')
      .setDescription(`Số dư của **${targetUser.username}** đã set thành **${amount.toLocaleString()} VNĐ**`)
      .setColor('#00ff00')
      .setFooter({ text: `Thực hiện bởi ${interaction.user.username}` });

    await interaction.reply({ embeds: [embed], ephemeral: true });

    try {
      await targetUser.send(`🔔 Số dư của bạn đã được admin set thành **${amount.toLocaleString()} VNĐ**.`);
    } catch (e) {}
  }
};