const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hihihiha')
        .setDescription('hihihiha'),

    async execute(interaction) {
        await interaction.reply('hihihiha! 🏓');
    }
};