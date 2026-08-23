const QRCode = require('qrcode'); // vẫn giữ, có thể dùng sau

const BANK_ID = process.env.BANK_ID || '970422';
const ACCOUNT_NO = process.env.ACCOUNT_NO || '0123456789';
const ACCOUNT_NAME = process.env.ACCOUNT_NAME || 'DEMO ACCOUNT';

module.exports.generateQR = async (code, amount) => {
  try {
    // Sử dụng template 'compact' (có thể đổi thành 'qr_only' nếu muốn)
    const template = 'compact';
    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(code)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;
    console.log('✅ Generated QR URL:', qrUrl);
    return { qrImageUrl: qrUrl };
  } catch (error) {
    console.error('❌ Lỗi generate QR:', error);
    throw error;
  }
};