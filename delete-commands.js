// delete-commands.js
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

console.log('Token từ BOT_TOKEN:', process.env.BOT_TOKEN ? 'Có token' : 'Không có token');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Lấy GUILD_ID từ biến môi trường, nếu không có thì dùng giá trị mặc định (hoặc báo lỗi)
const GUILD_ID = process.env.GUILD_ID;
if (!GUILD_ID) {
    console.error('❌ Thiếu GUILD_ID trong file .env');
    process.exit(1);
}

client.once('ready', async () => {
    console.log(`✅ Bot ${client.user.tag} đã sẵn sàng!`);
    
    try {
        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild) {
            console.log('❌ Không tìm thấy Server. Kiểm tra lại ID.');
            process.exit(1);
        }

        // Xóa lệnh trên server
        await guild.commands.set([]);
        console.log('✅ Đã xóa lệnh trên server');

        // Xóa lệnh toàn cục (global)
        await client.application.commands.set([]);
        console.log('✅ Đã xóa lệnh toàn cục');

        // Kiểm tra lại số lệnh còn lại
        const cmdsServer = await guild.commands.fetch();
        console.log(`Số lệnh còn lại trên server: ${cmdsServer.size}`);
        const cmdsGlobal = await client.application.commands.fetch();
        console.log(`Số lệnh toàn cục còn lại: ${cmdsGlobal.size}`);

        console.log('✅ Đã xóa TOÀN BỘ lệnh Slash thành công!');
        
    } catch (error) {
        console.error('❌ Có lỗi:', error);
    } finally {
        client.destroy();
        process.exit(0);
    }
});

client.login(process.env.BOT_TOKEN);