const { MessageEmbed } = require("discord.js");

const constants = {
    MODMAIL_SENT: "Your modmail entry has been sent!",
    COMMAND_ERROR: new MessageEmbed()
        .setColor("#ff0000")
        .setTitle("Command error!")
        .setDescription("Your command could not be executed. Please try again later.")
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
            await interaction.followUp(constants.MODMAIL_SENT);

            return;
        }

        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ embed: constants.COMMAND_ERROR, ephemeral: true });
        }
    },
};