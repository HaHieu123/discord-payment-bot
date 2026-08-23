require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const commandHandler = require('./handlers/commandHandler');
const buttonHandler = require('./handlers/buttonHandler');
const modalHandler = require('./handlers/modalHandler');
const selectHandler = require('./handlers/selectHandler');
const Transaction = require('./models/Transaction');
const User = require('./models/User');

console.log('Token starts with:', process.env.BOT_TOKEN?.substring(0, 10));

if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN chưa được set trong .env');
  process.exit(1);
}

connectDB();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', async () => {
  console.log(`🤖 Bot ${client.user.tag} đã sẵn sàng!`);

  // Load tất cả lệnh
  const commands = [];
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data) {
      commands.push(command.data.toJSON());
    }
  }

  // Đăng ký lệnh cho guild cụ thể (để test nhanh)
  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
  try {
    console.log('🔁 Đang đăng ký lệnh Slash cho guild...');
    const GUILD_ID = '1540995170504409158'; // Lấy từ ảnh bạn gửi, thay nếu khác
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, GUILD_ID),
      { body: commands }
    );
    console.log(`✅ Đã đăng ký ${commands.length} lệnh Slash cho guild thành công!`);
  } catch (error) {
    console.error('❌ Lỗi đăng ký lệnh:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    await commandHandler(interaction);
  } else if (interaction.isButton()) {
    await buttonHandler(interaction);
  } else if (interaction.isModalSubmit()) {
    await modalHandler(interaction);
  } else if (interaction.isStringSelectMenu()) {
    await selectHandler(interaction);
  }
});

client.login(process.env.BOT_TOKEN);

// Webhook
const app = express();
app.use(bodyParser.json());

app.post('/webhook/payment', async (req, res) => {
  const { code, status } = req.body;
  if (status === 'paid') {
    const transaction = await Transaction.findOne({ code });
    if (transaction && transaction.status === 'pending') {
      await Transaction.updateOne({ code }, { $set: { status: 'paid', completedAt: new Date() } });
      await User.updateOne(
        { userId: transaction.userId },
        { $inc: { balance: transaction.amount } }
      );
      const user = await client.users.fetch(transaction.userId);
      if (user) {
        const updatedUser = await User.findOne({ userId: transaction.userId });
        await user.send(`✅ Nạp tiền thành công! Số dư mới: ${updatedUser.balance} VNĐ`);
      }
    }
  }
  res.send('OK');
});

const PORT = process.env.WEBHOOK_PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Webhook server đang chạy cổng ${PORT}`);
});