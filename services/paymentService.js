// Đây là file giả lập, thực tế bạn sẽ gọi API VietQR hoặc Momo
// Ở đây tôi tạo QR ảo bằng thư viện qrcode
const QRCode = require('qrcode');

module.exports = {
  generateQR: async (code, amount, bankName, accountNo, accountName) => {
    // Nội dung thanh toán theo chuẩn VietQR (có thể dùng thư viện chính thức)
    // Ví dụ đơn giản: tạo QR với nội dung text
    const content = `CT: ${code} - ${amount} VND`;
    const qrImageUrl = await QRCode.toDataURL(content);
    return { qrImageUrl };
  }
};