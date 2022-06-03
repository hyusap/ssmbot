const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

// Might want to send an explicit message to the user if they're not in the server instead of doing nothing

const constants = {
    // we have to multiply by 1.56 to account for some weird timeout behavior, idk why lol.
    TIMEOUT_MILLISECONDS: 1.56 * process.env.TIMEOUT_MINUTES * 60 * 1000,

    NO_CHANNEL_FETCH: "Couldn't fetch channel, check value of CHANNEL_ID in .env",
    NO_GUILD_FETCH: "Couldn't fetch server, check value of SERVER_ID in .env",

    MODMAIL_COMMAND: '!modmail',

    INSTRUCTIONS: new MessageEmbed()
        .setColor("#eeff00")
        .setTitle("Modmail Instructions")
        .setDescription(`Welcome to modmail! Just send messages in this DM to create your modmail ticket.

To send the modmail, just press the "Send Modmail" button. To cancel the modmail, press the "Cancel Modmail" button. **Modmails are currently not anonymous, with reports being tied to your name on Discord.**

**A preview of what will be sent to the mods will be sent to you immediately.** Sending additional messages, editing your existing messages, and deleting your messages will update the preview.

Once sent, your modmail ***cannot*** be deleted, unless you request that it be done by the mods. Note that some admins in this server have message loggers, so **your message might still be visible to some admins even after being deleted.**

After 15 minutes or more of inactivity, the modmail will be automatically canceled.


Note: Deleting messages can be buggy depending on message content. If your modmail ticket ends in an undesirable position, please cancel the modmail and try again.

Note: If your message becomes more than 4096 characters long, the preview embed will be cut off to that length. However, any overflowing messages will still be sent to the mods.`),
    INTRO: new MessageEmbed()
        .setColor("#00ff00")
        .setTitle("Modmail Instructions")
        .setDescription("Welcome to modmail! type `!modmail` to start a new modmail."),

    MESSAGE_COLOR: "#00ffff",
    MESSAGE_TITLE: "Modmail Message",

    DEFAULT_MODMAIL_TEXT: "Start sending messages to be included in the modmail, and they will show up here replacing this message in the preview.",
    MODMAIL_LENGTH_EXCEEDED: `The modmail preview content has been shortened due to the 4096 character limit. Don't worry though, any more messages will still be shown in your modmail, they just won't show up in the preview.`,

    MODMAIL_FAILED: new MessageEmbed()
        .setColor("#ff0000")
        .setTitle("Modmail Failed")
        .setDescription("Something went wrong when sending the modmail. Please try again later."),
    MODMAIL_CANCELED_INACTIVITY: new MessageEmbed()
        .setColor("#ff0000")
        .setTitle("Modmail Canceled")
        .setDescription("This modmail has been canceled due to inactivity."),
    MODMAIL_CANCELED_NEW: new MessageEmbed()
        .setColor("#ff0000")
        .setTitle("Modmail Canceled")
        .setDescription("This modmail has been canceled because you started a new one."),

    BUTTON_ROW: new MessageActionRow()
        .addComponents(new MessageButton()
            .setLabel("Send Modmail")
            .setStyle('PRIMARY')
            .setCustomId('send-modmail'))
        .addComponents(new MessageButton()
            .setLabel("Cancel Modmail")
            .setStyle('DANGER')
            .setCustomId('cancel-modmail'))
}

// set timeout to automatically cancel modmail
function setCancellationTimeout(activeMessages, userId, dmChannel, previewMessage) {
    const previewEmbed = previewMessage.embeds[0];
    const newPreviewEmbed = new MessageEmbed(previewEmbed)
        .setFooter({ text: (previewEmbed.footer ? previewEmbed.footer.text : '') + '\n' + '(canceled)' })
        .setTimestamp();

    const timeoutHandle = setTimeout(() => {
        activeMessages.delete(userId);

        // send cancellation message and remove buttons
        dmChannel.send({ embeds: [constants.MODMAIL_CANCELED_INACTIVITY.setTimestamp()] }).catch(console.error);
        previewMessage.edit({ embeds: [newPreviewEmbed], components: [] }).catch(console.error);

    }, constants.TIMEOUT_MILLISECONDS);

    return timeoutHandle;
}

// Shorten modmail content if it's too long
function getPreviewContent(modmailContent) {
    return modmailContent.length > 4096 ? (modmailContent.slice(0, 4096 - 4) + ' ...') : modmailContent;
}

async function newModmail(client, activeMessages, message) {
    // load channel, server, and author -- annoying error handling
    const server = await client.guilds.fetch(process.env.SERVER_ID)
        .catch(() => console.error(constants.NO_GUILD_FETCH));
    if (!server) return;

    const author = await server.members.fetch({ user: message.author.id, force: true })
        .catch(() => { });
    if (!author) return;

    await message.channel.send({ embeds: [constants.INSTRUCTIONS] });

    // handle preview
    const authorIcon = author.user.avatarURL({ dynamic: true });
    const authorTitle = author.nickname || author.user.username;

    const previewEmbed = new MessageEmbed()
        .setColor(constants.MESSAGE_COLOR)
        .setTitle(constants.MESSAGE_TITLE)
        .setDescription(constants.DEFAULT_MODMAIL_TEXT)
        .setAuthor({ name: authorTitle, iconURL: authorIcon })
        .setTimestamp();

    const previewMessage = await message.channel.send({ embeds: [previewEmbed] });

    // set timeout
    const timeoutHandle = setCancellationTimeout(activeMessages, message.author.id, message.channel, previewMessage);

    // put a new modmail object in activeMessages
    activeMessages.set(message.author.id, { modmailContent: '', previewId: previewMessage.id, timeoutHandle });
}

async function updateModmail(client, activeMessages, message) {
    const { modmailContent, previewId, timeoutHandle } = activeMessages.get(message.author.id);

    // load channel, server, and author -- annoying error handling
    const server = await client.guilds.fetch(process.env.SERVER_ID)
        .catch(() => console.error(constants.NO_GUILD_FETCH));
    if (!server) return;

    const author = await server.members.fetch({ user: message.author.id, force: true })
        .catch(() => { });
    if (!author) return;

    const newModmailContent = modmailContent + '\n' + message.content;

    // update preview
    const previewMessage = await message.channel.messages.fetch(previewId);
    const newPreviewEmbed = new MessageEmbed(previewMessage.embeds[0])
        .setDescription(getPreviewContent(newModmailContent))
        .setFooter({ text: `${newModmailContent.length} characters` })
        .setTimestamp();

    if (newModmailContent.length > 4092)
        newPreviewEmbed.setFooter({ text: newPreviewEmbed.footer.text + '\n' + constants.MODMAIL_LENGTH_EXCEEDED });

    await previewMessage.edit({ embeds: [newPreviewEmbed], components: [constants.BUTTON_ROW] });

    // renew timeout
    clearTimeout(timeoutHandle);
    const newTimeoutHandle = setCancellationTimeout(activeMessages, message.author.id, message.channel, previewMessage);

    // update activeMessages with new modmail content
    activeMessages.set(message.author.id, { modmailContent: newModmailContent, previewId: previewMessage.id, timeoutHandle: newTimeoutHandle });
}

module.exports = {
    name: 'messageCreate',
    getPreviewContent(modmailContent) {
        return modmailContent.length > 4096 ? (modmailContent.slice(0, 4096 - 4) + ' ...') : modmailContent;
    },

    async execute(client, activeMessages, message) {
        if (message.channel.type !== "DM" || message.author.bot) return;

        if (message.content.startsWith(constants.MODMAIL_COMMAND)) {
            if (activeMessages.has(message.author.id)) {
                const { previewId, timeoutHandle } = activeMessages.get(message.author.id);
                activeMessages.delete(message.author.id);

                // send cancellation message and remove buttons
                const previewMessage = await message.channel.messages.fetch(previewId);
                const previewEmbed = previewMessage.embeds[0];

                const newPreviewEmbed = new MessageEmbed(previewEmbed)
                    .setFooter({ text: (previewEmbed.footer ? previewEmbed.footer.text : '') + '\n' + '(canceled)' })
                    .setTimestamp();

                message.channel.send({ embeds: [constants.MODMAIL_CANCELED_NEW] }).catch(console.error);
                previewMessage.edit({ embeds: [newPreviewEmbed], components: [] }).catch(console.error);

                // clear timeout
                clearTimeout(timeoutHandle);
            }
            await newModmail(client, activeMessages, message);
        } else if (activeMessages.has(message.author.id)) {
            await updateModmail(client, activeMessages, message);
        } else {
            await message.channel.send({ embeds: [constants.INTRO] });
        }
    },
    previewContent: getPreviewContent,
    cancellationTimeout: setCancellationTimeout,
};
