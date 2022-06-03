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
        .setDescription(`Welcome to modmail! type \`!modmail\` to start a new modmail.
                        
                        After that, just start sending messages in this DM to create your modmail.

                        A preview embed of what is being sent to the mods will be sent to you. Both sending more messages and editing your existing messages will update the preview.
                        
                        If your message becomes more than 4096 characters long, the preview embed will be shortened, but any overflowing messages will still be sent to the mods.
                        
                        To send the modmail, just press the "Send Modmail" button at the bottom of the preview.
                        To cancel the modmail, just press the "Cancel Modmail" button at the bottom of the preview.

                        After about 15 minutes of inactivity, the modmail will be automatically cancelled.
                        `),

    MESSAGE_COLOR: "#00ffff",
    MESSAGE_TITLE: "Modmail Message",

    SEND_BUTTON_TEXT: "Send Modmail",
    CANCEL_BUTTON_TEXT: "Cancel Modmail",

    DEFAULT_MODMAIL_TEXT: "Start sending messages to be included in the modmail, and they will show up here replacing this message in the preview.",
    MODMAIL_LENGTH_EXCEEDED: `The Modmail preview content has been shortened due to the 4096 character limit. Don't worry though, any more messages will still be shown in your modmail, they just won't show up in the preview.`,

    MODMAIL_FAILED: new MessageEmbed()
        .setColor("#ff0000")
        .setTitle("Modmail Failed")
        .setDescription("Something went wrong when sending the modmail. Please try again later."),

    MODMAIL_CANCELED: new MessageEmbed()
        .setColor("#ff0000")
        .setTitle("Modmail Canceled")
        .setDescription("This modmail has been canceled."),
}

// set timeout to automatically cancel modmail
function setCancellationTimeout(activeMessages, userId, dmChannel, previewMessage) {
    const previewEmbed = previewMessage.embeds[0];
    const newPreviewEmbed = new MessageEmbed(previewEmbed)
        .setFooter({ text: (previewEmbed.footer ? previewEmbed.footer.text : '') + '\n' + '(cancelled)'})
        .setTimestamp();

    const timeoutHandle = setTimeout(() => {
        activeMessages.delete(userId);

        // send cancellation message and remove buttons
        const cancellationEmbed = new MessageEmbed(constants.MODMAIL_CANCELED)
            .setDescription(`This modmail has been canceled due to inactivity.`)
            .setTimestamp();

        dmChannel.send({ embeds: [cancellationEmbed] }).catch(console.error);
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

async function udpateModmail(client, activeMessages, message) {
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
        .setFooter({ text: `${newModmailContent.length} characters`})
        .setTimestamp();
    
    if (newModmailContent.length > 4092)
        newPreviewEmbed.setFooter({ text: newPreviewEmbed.footer.text + '\n' + constants.MODMAIL_LENGTH_EXCEEDED });

    const sendButton = new MessageButton()
        .setLabel(constants.SEND_BUTTON_TEXT)
        .setStyle('PRIMARY')
        .setCustomId('send-modmail');

    const cancelButton = new MessageButton()
        .setLabel(constants.CANCEL_BUTTON_TEXT)
        .setStyle('DANGER')
        .setCustomId('cancel-modmail');

    const buttonRow = new MessageActionRow()
        .addComponents(sendButton)
        .addComponents(cancelButton);

    await previewMessage.edit({ embeds: [newPreviewEmbed], components: [buttonRow] });

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
                    .setFooter({ text: (previewEmbed.footer ? previewEmbed.footer.text : '') + '\n' + '(cancelled)'})
                    .setTimestamp();

                const cancellationEmbed = new MessageEmbed(constants.MODMAIL_CANCELED)
                    .setDescription(`This modmail has been canceled since you started a new one.`)
                    .setTimestamp();

                message.channel.send({ embeds: [cancellationEmbed] }).catch(console.error);
                previewMessage.edit({ embeds: [newPreviewEmbed], components: [] }).catch(console.error);

                // clear timeout
                clearTimeout(timeoutHandle);
            }
            await newModmail(client, activeMessages, message);
        } else if (activeMessages.has(message.author.id)) {
            await udpateModmail(client, activeMessages, message);
        } else {
            await message.channel.send({ embeds: [constants.INSTRUCTIONS] });
        }
    },
    previewContent: getPreviewContent,
    cancellationTimeout: setCancellationTimeout,
};
