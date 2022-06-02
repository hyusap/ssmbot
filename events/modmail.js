const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

const timeoutMillseconds = process.env.TIMEOUT_MINUTES * 60 * 1000;

const constants = {
    NO_CHANNEL_FETCH: "Couldn't fetch channel, check value of CHANNEL_ID in .env",
    NO_GUILD_FETCH: "Couldn't fetch server, check value of SERVER_ID in .env",

    INSTRUCTIONS_COLOR: "#eeff00",
    INSTRUCTIONS_TITLE: "Modmail Instructions",
    INSTRUCTIONS_BODY: `Your message has just been sent to the server moderators. If you have additional details, just keep sending messages in this DM.

    A preview embed of what is being sent to the mods will be sent to you. Both sending more messages and editing your existing messages will update the preview.
    
    If your message becomes more than 4096 characters long, it will be split into multiple messages and a new preview embed will be sent.
    
    To finalize the modmail, just press the "Finalize Modmail" button at the bottom of the preview embeds.
    
    Note: if you edit a message, and the modmail content exceeds 4096 characters, the change will not be made.`,

    MESSAGE_COLOR: "#00ffff",
    MESSAGE_TITLE: "Modmail Message",

    BUTTON_TEXT: "Finalize Modmail",
}

module.exports = {
    name: 'messageCreate',
    async execute(client, activeMessages, message) {
        if (message.channel.type !== "DM" || message.author.bot) return;

        // Message part for splitting
        let messagePart = 0;

        // load channel, server, and author -- annoying error handling
        const modmailChannel = await client.channels.fetch(process.env.CHANNEL_ID)
            .catch(() => console.error(constants.NO_CHANNEL_FETCH));
        if (!modmailChannel) return;

        const server = await client.guilds.fetch(process.env.SERVER_ID)
            .catch(() => console.error(constants.NO_GUILD_FETCH));
        if (!server) return;

        const author = await server.members.fetch({ user: message.author.id, force: true })
            .catch(() => { });
        if (!author) return;

        // Create new modmail ticket if author is present
        if (activeMessages.has(message.author.id)) {
            try {
                const [messageId, previewId, part] = activeMessages.get(message.author.id);
                const modmailMessage = await modmailChannel.messages.fetch(messageId);
                const modmailEmbed = modmailMessage.embeds[0];

                const previewMessage = await message.channel.messages.fetch(previewId);
                const previewEmbed = previewMessage.embeds[0];

                const newModmailEmbed = new MessageEmbed(modmailEmbed)
                    .setDescription(`${modmailEmbed.description}\n${message.content}`)
                    .setTimestamp();

                const newPreviewEmbed = new MessageEmbed(previewEmbed)
                    .setDescription(`${previewEmbed.description}\n${message.content}`)
                    .setTimestamp();

                // Split to a new message if the message is too long
                const descriptionSize = newModmailEmbed.description.length;
                if (descriptionSize > 4096) {
                    messagePart = part + 1;
                } else {
                    await modmailMessage.edit({ embeds: [newModmailEmbed] });
                    await previewMessage.edit({ embeds: [newPreviewEmbed] });

                    return;
                }
            } catch (error) {
                console.error(error);
            }
        }

        if (!activeMessages.has(message.author.id)) {
            const instructionsEmbed = new MessageEmbed()
                .setColor(constants.INSTRUCTIONS_COLOR)
                .setTitle(constants.INSTRUCTIONS_TITLE)
                .setDescription(constants.INSTRUCTIONS_BODY);

            await message.channel.send({ embeds: [instructionsEmbed] });
        }

        // Set author title to include part if applicable
        let authorTitle = author.nickname || author.user.username;
        if (messagePart > 0)
            authorTitle += ` (Part ${messagePart + 1})`;

        const authorIcon = author.user.avatarURL({ dynamic: true });

        const modmailEmbed = new MessageEmbed()
            .setColor(constants.MESSAGE_COLOR)
            .setTitle(constants.MESSAGE_TITLE)
            .setAuthor({ name: authorTitle, iconURL: authorIcon })
            .setDescription(message.content)
            .setTimestamp();

        const modmailMessage = await modmailChannel.send({ embeds: [modmailEmbed] });

        const preview = new MessageEmbed(modmailEmbed)
            .setTitle(constants.MESSAGE_TITLE + " Preview")
            .setDescription(message.content);

        const sendButton = new MessageButton()
            .setLabel(constants.BUTTON_TEXT)
            .setStyle('PRIMARY')
            .setCustomId('finalize-modmail');

        const buttonRow = new MessageActionRow()
            .addComponents(sendButton);

        const previewMessage = await message.channel.send({ embeds: [preview], components: [buttonRow] });

        // Set the current user's active modmail to the message ID
        activeMessages.set(message.author.id, [modmailMessage.id, previewMessage.id, messagePart]);

        // Set a timeout to remove the active modmail message after timeoutMillseconds if messagePart is 0
        // also send the user a preview of the modmail message
        if (messagePart === 0)
            setTimeout(() => activeMessages.delete(message.author.id), timeoutMillseconds);
    },
};