const { MessageFlags } = require('discord.js');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Load tất cả lệnh từ thư mục commands
const commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  if (command.data && command.execute) {
    commands.set(command.data.name, command);
  }
}

module.exports = async function (interaction) {
  const { user } = interaction;

  // Tạo user nếu chưa có
  const existingUser = await User.findOne({ userId: user.id });
  if (!existingUser) {
    await User.create({
      userId: user.id,
      username: user.username,
      balance: 0
    });
  }

  const command = commands.get(interaction.commandName);
  if (command) {
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ Có lỗi xảy ra khi thực thi lệnh.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};