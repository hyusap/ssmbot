const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Replies with a message'),
    async execute(interaction) {
        await interaction.reply('asdfiaushdfui!');
    },
};