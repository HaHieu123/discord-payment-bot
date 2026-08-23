require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const commandHandler = require('./handlers/commandHandler');
const buttonHandler = require('./handlers/buttonHandler');
const modalHandler = require('./handlers/modalHandler');
const selectHandler = require('./handlers/selectHandler'); // 👈 thêm dòng này
const Transaction = require('./models/Transaction');
const User = require('./models/User');

console.log('Token starts with:', process.env.BOT_TOKEN?.substring(0, 10));

// Kiểm tra biến môi trường
if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN chưa được set trong .env');
  process.exit(1);
}

// Kết nối DB
connectDB();

// Tạo bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Danh sách lệnh
const commands = [
  { name: 'shop', description: 'Xem cửa hàng' },
  { name: 'balance', description: 'Xem số dư' },
  { name: 'deposit', description: 'Nạp tiền' },
  { name: 'support', description: 'Hỗ trợ' }
];

// Sự kiện ready
client.once('ready', async () => {
  console.log(`🤖 Bot ${client.user.tag} đã sẵn sàng!`);

  try {
    await client.application.commands.set(commands);
    console.log('✅ Lệnh Slash đã được đăng ký thành công');
  } catch (error) {
    console.error('❌ Lỗi đăng ký lệnh:', error);
  }
});

// 🟢 MỘT SỰ KIỆN DUY NHẤT cho tất cả interaction
client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    await commandHandler(interaction);
  } else if (interaction.isButton()) {
    await buttonHandler(interaction);
  } else if (interaction.isModalSubmit()) {
    await modalHandler(interaction);
  } else if (interaction.isStringSelectMenu()) {
    await selectHandler(interaction); // 👈 xử lý dropdown
  }
});

client.login(process.env.BOT_TOKEN);

// ========== Webhook server ==========
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