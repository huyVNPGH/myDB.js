const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const express = require('express');
const path = require('path');
const fs = require('fs');

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
        
        this.on('messageCreate', async(message) => {
            await this.demoBeforeInUse(message);
        })
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

    async demoBeforeInUse(message) {
        const PREFIX = '!';
        if (message.author.bot || !message.content.startsWith(PREFIX)) return;

        // 3. Tách lệnh (command) và các tham số (args) người dùng nhập vào
        // Ví dụ người dùng gõ: !say hello world
        // -> args = ['hello', 'world']
        // -> command = 'say'
        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // 4. Xử lý các lệnh cụ thể
        // if (command === 'test') {
        //     // Trả lời trực tiếp vào kênh chat
        //     const serverName = message.guild.name;
        //     const defaultAvatar = `https://cdn.discordapp.com/embed/avatars/${Number(message.guild.id) % 5}.png`;
        //     const serverAvatar = message.guild.iconURL({dynamic: true, size: 1024}) ?? defaultAvatar;
        //     const serverDescription = message.guild.description || "No description for this server";
        //     const serverMembersCount = message.guild.memberCount;
        //     const serverMembersOnlineCount = message.guild.members.cache.filter((m) => m.presence?.status !== 'offline' && !m.user.bot).size;
        //     const serverCreateDate = message.guild.createdAt.toLocaleDateString('vi-VN', {day: '2-digit',month: '2-digit',year: 'numeric'});
            
        //     const newMember = message.author.username;
        //     const emp = new EmbedBuilder()
        //         .setColor(0x0099ff)
        //         .setTitle(':loudspeaker::tada: Everyone welcome our new member! :loudspeaker::tada: ' + newMember)
        //         .setAuthor({ name: serverName, iconURL: serverAvatar})
        //         .setDescription(serverDescription)
        //         .setThumbnail(serverAvatar)
        //         .addFields(
        //             { name: `Members:white_circle:: ${serverMembersCount} Online:green_circle:: ${serverMembersOnlineCount}`, value: `Est: ${serverCreateDate}` },
        //             //{ name: '\u200B', value: '\u200B' },
        //             //{ name: 'Inline field title', value: 'Some value here', inline: true },
        //         )
        //         .setImage('https://preview.redd.it/please-give-us-the-old-king-thumbs-up-sound-effect-the-new-v0-08kqgn4ad6511.png?auto=webp&s=e5d2593e728505a382222b58c209462d94faeb7f')
        //         .setTimestamp()
        //         .setFooter({ text: 'Thanks for joined our community!', iconURL: serverAvatar});

        //     await message.channel.send({embeds: [emp]});
        // }
        
    }

    start(token) {
        this.login(token);
    }
}

module.exports = MainClient;

