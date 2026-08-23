// handlers/commandHandler.js
const User = require('../models/User');

// Danh sách các lệnh
const commands = {
  shop: require('../commands/shop'),
  balance: require('../commands/balance'),
  deposit: require('../commands/deposit'),
  support: require('../commands/support')
};

module.exports = async function (interaction) {
  const { commandName, user } = interaction;

  // Kiểm tra user trong DB, nếu chưa có thì tạo mới
  const existingUser = await User.findOne({ userId: user.id });
  if (!existingUser) {
    await User.create({
      userId: user.id,
      username: user.username,
      balance: 0
    });
  }

  const command = commands[commandName];
  if (command) {
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Có lỗi xảy ra khi thực thi lệnh.',
        ephemeral: true
      });
    }
  }
};