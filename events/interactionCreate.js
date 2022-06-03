const { MessageEmbed } = require("discord.js");
const { chunkSubstr } = require("../util.js");

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
            // check that the modmail is still active
            if (!activeMessages.has(interaction.user.id)) {
                await interaction.deferUpdate();
                await interaction.editReply({ components: [], ephemeral: true });
                await interaction.followUp({ embeds: [constants.COMMAND_ERROR] });

                return;
            }

            if (interaction.customId === "send-modmail") {
                // load message content and preview
                const { modmailContent, previewId, timeoutHandle } = activeMessages.get(interaction.user.id);
                const previewMessage = await interaction.channel.messages.fetch(previewId);
                const previewEmbed = previewMessage.embeds[0];

                // split the modmail content into strings of 4096 or less characters
                const modmailContentChunks = chunkSubstr(modmailContent, 4096);
                
                // map each chunk to an embed
                const modmailContentEmbeds = modmailContentChunks.map((chunk, index) => {
                    // change author title to include message part
                    const authorTitle = previewEmbed.title + (modmailContentChunks.length === 1 ? '' : ` (Part ${index + 1})`);

                    return new MessageEmbed(previewEmbed)
                        .setTitle(authorTitle)
                        .setDescription(chunk)
                        .setFooter({ text: `${chunk.length} characters.` })
                        .setTimestamp();
                });

                // load modmail channel
                const modmailChannel = await client.channels.fetch(process.env.CHANNEL_ID)
                    .catch(() => console.error(constants.NO_CHANNEL_FETCH));
                if (!modmailChannel) return;

                // send each embed in a message in the modmail channel
                for (const embed of modmailContentEmbeds)
                    await modmailChannel.send({ embeds: [embed] });

                // Remove the buttons
                await interaction.deferUpdate();
                await interaction.editReply({ components: [], ephemeral: true });
                await interaction.followUp({ embeds: [constants.MODMAIL_SENT] });

                // remove the modmail from the active messages
                activeMessages.delete(interaction.user.id);

                // clear the timeout
                clearTimeout(timeoutHandle);

                return;
            } else if (interaction.customId === "cancel-modmail") {
                const { previewId, timeoutHandle } = activeMessages.get(interaction.user.id);

                // retract preview message
                const previewMessage = await interaction.channel.messages.fetch(previewId);
                const retractionEmbed = new MessageEmbed(constants.MODMAIL_RETRACTED)
                    .setTimestamp();

                await previewMessage.edit({ embeds: [retractionEmbed] });

                // Cancel modmail and clear the timeout
                activeMessages.delete(interaction.user.id);
                clearTimeout(timeoutHandle);

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