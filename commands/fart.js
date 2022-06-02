const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with asdfiaushdfui!'),
    async execute(interaction) {
        await interaction.reply('asdfiaushdfui!');
    },
};