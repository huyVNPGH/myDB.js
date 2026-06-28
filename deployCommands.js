require('dotenv').config();
const { REST, Routes } = require('discord.js');
const path = require('path');
const fs = require('fs');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (!command.data || !command.execute) {
        console.warn(`⚠️ Bỏ qua ${file}`);
        continue;
    }
    commands.push(command.data.toJSON());
}

// Lưu commands ra file JSON để kiểm tra
const outputPath = path.join(__dirname, 'commands.json');
fs.writeFileSync(outputPath, JSON.stringify(commands, null, 2), 'utf-8');
console.log(`📄 Đã lưu commands.json`);

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`Đang đăng ký ${commands.length} slash command toàn cầu...`);

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID), // ← Global, không cần GUILD_ID
            { body: commands }
        );

        console.log('✅ Đăng ký global thành công! (có hiệu lực sau ~1 giờ)');
    } catch (error) {
        console.error('❌ Lỗi:', error);
    }
})();