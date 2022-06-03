const { MessageEmbed } = require("discord.js");
const { previewContent, cancellationTimeout } = require('./modmail.js');

const constants = {
    NO_CHANNEL_FETCH: "Couldn't fetch channel, check value of CHANNEL_ID in .env",
}

module.exports = {
    name: 'messageDelete',
    async execute(client, activeMessages, message) {
        if (message.channel.type !== "DM" || message.author.bot) return;

        // return if a modmail is not active for this user
        if (!activeMessages.has(message.author.id)) return;

        // load message content and preview
        const { modmailContent, previewId, timeoutHandle } = activeMessages.get(message.author.id);

        // edit the modmail content to include the new changes and handle the edit being too long
        const newModmailContent = modmailContent.replace(message.content, '');
        if (newModmailContent.length > 4096) {
            await message.channel.send({ embeds: [constants.EDIT_TOO_LONG] });
            return;
        }

        const previewMessage = await message.channel.messages.fetch(previewId);
        const previewEmbed = previewMessage.embeds[0];

        const newPreviewEmbed = new MessageEmbed(previewEmbed)
            .setDescription(previewContent(newModmailContent))
            .setTimestamp();

        await previewMessage.edit({ embeds: [newPreviewEmbed] });

        // renew timeout
        clearTimeout(timeoutHandle);
        const newTimeoutHandle = cancellationTimeout(activeMessages, message.author.id, message.channel, previewMessage);
        
        // update activeMessages
        activeMessages.set(message.author.id, { modmailContent: newModmailContent, previewId: previewMessage.id, timeoutHandle: newTimeoutHandle });
    }
}
