const { Client, GatewayIntentBits, Collection } = require('discord.js');
const express = require('express');
const path = require('path');
const fs = require('fs');

const roleManager = require('./Handler/roleHandler');

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
            await roleManager(member);              // ← delegate ra ngoài
        });
    }

    loadCommands() {
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            this.commands.set(command.data.name, command);
        }
        console.log(`✅ Đã load ${this.commands.size} slash command`);
    }

    async handleSlashCommand(interaction) {
        const command = this.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Lỗi lệnh /${interaction.commandName}:`, error);
            const msg = { content: '❌ Có lỗi xảy ra!', ephemeral: true };
            interaction.replied || interaction.deferred
                ? await interaction.followUp(msg)
                : await interaction.reply(msg);
        }
    }

    start(token) {
        this.login(token);
    }
}

module.exports = MainClient;

