require('dotenv').config();
//REST -> gửi http request lên discord API
// Routes -> tạo đường dẫn API chuẩn
const { REST, Routes } = require('discord.js');
//path -> xử lý đường dẫn file
//fs -> đọc/ghi file trên máy
const path = require('path');
const fs = require('fs');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    // nếu thiếu data hoặc execute sẽ bỏ qua tránh crash
    if (!command.data || !command.execute) {
        console.warn(`⚠️ Bỏ qua ${file}`);
        continue;
    }
    // chuyển slashCommandBuilder thành JSON và đẩy vào mảng
    commands.push(command.data.toJSON());
}

// Lưu commands ra file JSON để kiểm tra
const outputPath = path.join(__dirname, 'commands.json');
//commands -> dữ liệu cần ghi, null -> không filter field, 2 -> thụt lề 2 space
fs.writeFileSync(outputPath, JSON.stringify(commands, null, 2), 'utf-8');
console.log(`📄 Đã lưu commands.json`);

//tạo REST và xác thực bằng token
const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`Đang đăng ký ${commands.length} slash command toàn cầu...`);
        
        //rest.put() -> http put -> ghi đè toàn bộ danh sách lệnh 
        //thay vì post chỉ thêm lệnh
        //Routes.____ -> URL:/applications/{client_id}/commands
        // body: commands -> nội dung lệnh
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID), // ← Global, không cần GUILD_ID
            { body: commands }
        );

        console.log('✅ Đăng ký global thành công! (có hiệu lực sau ~1 giờ)');
    } catch (error) {
        console.error('❌ Lỗi:', error);
    }
})();