require('dotenv').config();
console.log('BOT_TOKEN:', process.env.BOT_TOKEN ? 'OK' : 'MISSING');
console.log('CLIENT_ID:', process.env.CLIENT_ID || 'MISSING');
console.log('GUILD_ID:', process.env.GUILD_ID || 'MISSING');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'OK' : 'MISSING');