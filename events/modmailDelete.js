const { MessageEmbed } = require("discord.js");

const constants = {
    NO_CHANNEL_FETCH: "Couldn't fetch channel, check value of CHANNEL_ID in .env",
}

module.exports = {
    name: 'messageDelete',
    async execute(client, activeMessages, message) {
        // return if the message is not a modmail message or by the bot
        if (!activeMessages.has(message.author.id) || message.channel.type !== "DM" || message.author.bot) return;

        // load channel, annoying error handling
        const modmailChannel = await client.channels.fetch(process.env.CHANNEL_ID)
            .catch(() => console.error(constants.NO_CHANNEL_FETCH));
        if (!modmailChannel) return;

        // eslint-disable-next-line no-unused-vars
        const [messageId, previewId, _] = activeMessages.get(message.author.id);
        const modmailMessage = await modmailChannel.messages.fetch(messageId);
        const modmailEmbed = modmailMessage.embeds[0];

        const previewMessage = await message.channel.messages.fetch(previewId);
        const previewEmbed = previewMessage.embeds[0];

        const newModmailEmbed = new MessageEmbed(modmailEmbed)
            .setDescription(modmailEmbed.description.replace(message.content, ""))
            .setTimestamp();

        const newPreviewEmbed = new MessageEmbed(previewEmbed)
            .setDescription(previewEmbed.description.replace(message.content, ""))
            .setTimestamp();

        await modmailMessage.edit({ embeds: [newModmailEmbed] });
        await previewMessage.edit({ embeds: [newPreviewEmbed] });
    }
}
