const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hihi')
        .setDescription('hihihiha'),

    async execute(interaction) {
        await interaction.reply('hihihiha! 🏓');
    }
};