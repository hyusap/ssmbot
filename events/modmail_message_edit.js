const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'messageUpdate',
    async execute(client, activeMessages, oldMessage, newMessage) {
        if (oldMessage.channel.type !== "DM" || oldMessage.author.bot) return;

        // return if the a modmail is not active for this user
        if (!activeMessages.has(newMessage.author.id)) return;

        // load channel, annoying error handling
        const modmailChannel = await client.channels.fetch(process.env.CHANNEL_ID)
            .catch(() => console.error('Couldn\'t fetch channel, check CHANNEL_ID in .env'));
        if (!modmailChannel) return;

        // eslint-disable-next-line no-unused-vars
        const [messageId, previewId, _] = activeMessages.get(oldMessage.author.id);
        const modmailMessage = await modmailChannel.messages.fetch(messageId);
        const modmailEmbed = modmailMessage.embeds[0];

        const previewMessage = await oldMessage.channel.messages.fetch(previewId);
        const previewEmbed = previewMessage.embeds[0];

        const newModmailEmbed = new MessageEmbed(modmailEmbed)
            .setDescription(modmailEmbed.description.replace(oldMessage.content, newMessage.content))
            .setTimestamp();

        const newPreviewEmbed = new MessageEmbed(previewEmbed)
            .setDescription(previewEmbed.description.replace(oldMessage.content, newMessage.content))
            .setTimestamp();

        // Just ignore the edit if the edit makes the message too long
        const descriptionSize = newModmailEmbed.description.length;
        if (descriptionSize > 4096) {
            await newMessage.author.send(`Your message is too long to edit, and has not been added into the modmail. Please send a new message instead.`);
            return;
        }

        await modmailMessage.edit({ embeds: [newModmailEmbed] });
        await previewMessage.edit({ embeds: [newPreviewEmbed] });
    }
};