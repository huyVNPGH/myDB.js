const { SlashCommandBuilder } = require('discord.js');
const VoiceManager = require('../VoiceManager');

const voiceManager = new VoiceManager();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Bot tham gia kênh thoại của bạn'),

    async execute(interaction) {
        if (!interaction.inGuild()) {
            return interaction.reply({
                content: 'Lệnh này chỉ hoạt động trong server.',
                ephemeral: true
            });
        }

        const member = interaction.member;
        const channel = member?.voice?.channel;

        if (!channel) {
            return interaction.reply({
                content: 'Bạn cần ở trong một kênh thoại trước khi gọi lệnh này.',
                ephemeral: true
            });
        }

        const alreadyConnected = voiceManager.connections.has(interaction.guildId);
        if (alreadyConnected) {
            return interaction.reply({
                content: 'Bot đã đang ở trong một kênh thoại của server này.',
                ephemeral: true
            });
        }

        voiceManager.connect(channel);

        await interaction.reply(`Đã tham gia kênh thoại: ${channel.name}`);
    }
};
