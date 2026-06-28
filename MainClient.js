const { Client, GatewayIntentBits, Collection } = require('discord.js');
const express = require('express');
const path = require('path');
const fs = require('fs');

const roleManager = require('./Handler/roleHandler');
const roleHandler = require('./Handler/roleHandler');

class MainClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.MessageContent
            ]
        });

        this.commands = new Collection();
        this.app = express();
        this.port = process.env.PORT || 3000;

        this.setupWebServer();
        this.registerEvents();
        this.loadCommands();
    }

    setupWebServer() {
        this.app.get('/', (req, res) => res.send("Bot is running!"));
        this.app.listen(this.port, () => console.log("BOT is running on port " + this.port));
    }

    registerEvents() {
        this.once('clientReady', (client) => {
            console.log(`Logged in as ${this.user.tag}`);
        })

        this.on('interactionCreate', async (interaction) => {
            if (!interaction.isChatInputCommand()) return;
            await this.handleSlashCommand(interaction);
        });

        this.on('guildMemberAdd', async (member) => {
            await roleHandler(member);              // ← delegate ra ngoài
        });
    }

    loadCommands() {
        //tạo đường dẫn tuyện đối __dirname == C:/BOT
        const commandsPath = path.join(__dirname, 'commands');
        //fs.readdirSync() đọc toàn bộ file trong thư mục commands
        //ping.js, say.js
        //.filter(f => f.endWith('.js')) lọc file chỉ lấy file có đuôi .js
        const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

        // duyện qua từng file .js file = 'ping.js', file = 'say.js'
        for (const file of commandFiles) {
            //C:/BOT/commands/ping.js C:/BOT/commands/say.jss
            //require() | import file , lấy module.exports 
            // → { data: SlashCommandBuilder, execute: Function }
            const command = require(path.join(commandsPath, file));
            //command.data.name -> "ping", command = { data: SlashCommandBuilder, execute: Function }
            this.commands.set(command.data.name, command);
        }
        console.log(`✅ Đã load ${this.commands.size} slash command`);
    }

    async handleSlashCommand(interaction) {
        //interaction.commandName = "ping"
        //this.commands.get() -> { data: SlashCommandBuilder, execute: Function }
        const command = this.commands.get(interaction.commandName);
        //lệnh đã deploy lên discord nhưng chưa load vào collection
        //lệnh bị xóa file nhưng chưa deploy lại
        if (!command) return;

        try {
            //gọi hàm execute trong folder commands
            await command.execute(interaction);
        } catch (error) {
            console.error(`Lỗi lệnh /${interaction.commandName}:`, error);
            //ephemeral -> chỉ người gọi lệnh thấy
            const msg = { content: '❌ Có lỗi xảy ra!', ephemeral: true };
            //đã reply() hoặc đã deferReply()(tăng thời gian trả lời của 
            // bot khi trường trình lớn, từ 3s lên 15 phút)
            interaction.replied || interaction.deferred
            //followUp -> giữ nguyên tin nhắn cũ và gửi thêm nhiều tin nhắn vào kênh
            // chat | reply -> lần đầu nếu chưa reply | editReply() sửa lại nội
            // dung tin nhắn cũ
                ? await interaction.followUp(msg)
                : await interaction.reply(msg);
        }
    }

    start(token) {
        this.login(token);
    }
}

module.exports = MainClient;

