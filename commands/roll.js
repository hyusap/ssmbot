const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Generates a random number from 1 to the specified number (defaults to 6).')
        .addUserOption(option => option.setName('number')
            .setDescription('The number to roll from')
            .setRequired(false)),
    async execute(interaction) {
        // default to 6
        const option = interaction.getUserOption('number') + 1 || 7
        const number = Math.floor(Math.random() * (option));

        await interaction.reply({
            embeds: [{
                title: `Result of rolling a ${option}-sided die:`,
                description: `You rolled a ${number}!`,
                color: '#000099'
            }]
        });
    },
};