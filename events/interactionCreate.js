const { MessageEmbed } = require("discord.js");

const constants = {
    MODMAIL_SENT: new MessageEmbed()
        .setTitle("Your modmail entry has been sent!")
        .setColor("#00ff00")
        .setTimestamp(),

    COMMAND_ERROR: new MessageEmbed()
        .setTitle("Something went wrong!")
        .setColor("#ff0000")
        .setDescription("Your command could not be executed. Please try again later.")
        .setTimestamp(),

    COMMAND_NOT_FOUND: new MessageEmbed()
        .setTitle("Something went wrong!")
        .setColor("#ff0000")
        .setDescription("The command you entered could not be found. Please try a different command.")
        .setTimestamp(),
}

module.exports = {
    name: 'interactionCreate',
    async execute(client, activeMessages, interaction) {
        if (interaction.isButton()) {
            activeMessages.delete(interaction.user.id);

            // disable the button
            await interaction.deferUpdate();
            await interaction.editReply({ components: [], ephemeral: true });
            await interaction.followUp({ embeds: [constants.MODMAIL_SENT] });

            return;
        }

        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            await interaction.reply({ embeds: [constants.COMMAND_NOT_FOUND] });
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ embeds: [constants.COMMAND_ERROR], ephemeral: true });
        }
    },
};