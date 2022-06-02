const { MessageEmbed } = require("discord.js");

const constants = {
    MODMAIL_SENT: new MessageEmbed()
        .setTitle("Your modmail entry has been sent!")
        .setColor("#00ff00")
        .setTimestamp(),

    MODMAIL_DELETED: new MessageEmbed()
        .setTitle("Your modmail has been deleted!")
        .setColor("#00ff00")
        .setTimestamp(),

    MODMAIL_RETRACTED: new MessageEmbed()
        .setTitle("Modmail Message Retracted")
        .setDescription("Modmail retracted by user")
        .setColor("#ff0000")
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
            if (interaction.customId === "finalize-modmail") {
                activeMessages.delete(interaction.user.id);

                // Remove the buttons
                await interaction.deferUpdate();
                await interaction.editReply({ components: [], ephemeral: true });
                await interaction.followUp({ embeds: [constants.MODMAIL_SENT] });

                return;
            } else {
                // Fetch channel
                const modmailChannel = await client.channels.fetch(process.env.CHANNEL_ID)
                    .catch(() => console.error(constants.NO_CHANNEL_FETCH));
                if (!modmailChannel) return;

                // eslint-disable-next-line no-unused-vars
                const [messageId, previewId, _] = activeMessages.get(interaction.user.id);
                const modmailMessage = await modmailChannel.messages.fetch(messageId);

                const previewMessage = await interaction.channel.messages.fetch(previewId);

                // Clear content of modmail and preview
                activeMessages.delete(interaction.user.id);

                await modmailMessage.edit({ embeds: [constants.MODMAIL_RETRACTED] });
                await previewMessage.edit({ embeds: [constants.MODMAIL_RETRACTED] });

                // Remove buttons
                await interaction.deferUpdate();
                await interaction.editReply({ components: [], ephemeral: true });
                await interaction.followUp({ embeds: [constants.MODMAIL_DELETED] });

                return;
            }
        }

        // Handle slash command interactions
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