const constants = {
    MODMAIL_SENT: "Your modmail entry has been sent!",
    COMMAND_ERROR: "Your command could not be executed. Please try again later.",
    COMMAND_NOT_FOUND: "The command you entered could not be found. Please try a different command.",
}

module.exports = {
    name: 'interactionCreate',
    async execute(client, activeMessages, interaction) {
        if (interaction.isButton()) {
            activeMessages.delete(interaction.user.id);

            // disable the button
            await interaction.deferUpdate();
            await interaction.editReply({ components: [], ephemeral: true });
            await interaction.followUp(constants.MODMAIL_SENT);

            return;
        }

        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            await interaction.reply(constants.COMMAND_NOT_FOUND);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply(constants.COMMAND_ERROR, { ephemeral: true });
        }
    },
};