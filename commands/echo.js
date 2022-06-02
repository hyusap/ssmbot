const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Replies with the same message')
        .addStringOption(option => option
            .setName('message')
            .setDescription('The message to reply with')),
    async execute(interaction) {
        await interaction.reply(interaction.options.getString('message'), { ephemeral: true });
    },
};