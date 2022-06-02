const { MessageEmbed } = require('discord.js');

// Map's user ID to the active modmail ID and embed if there is one
const activeMessages = new Map();

module.exports = {
	name: 'messageCreate',
	async execute(client, message) {
        if (message.channel.type !== "DM" || message.author.bot) return;

        let messagePart = 0;

        // load channel, annoying error handling
        const modmailChannel = await client.channels.fetch(process.env.CHANNEL_ID)
            .catch(() => console.error('Couldn\'t fetch channel, check CHANNEL_ID in .env'));
        if (!modmailChannel) return;

        if (activeMessages.has(message.author.id)) {
            try {
                const [messageId, part] = activeMessages.get(message.author.id);
                const modmailMessage = await modmailChannel.messages.fetch(messageId);
                const modmailEmbed = modmailMessage.embeds[0];

                const newModmailEmbed = new MessageEmbed(modmailEmbed)
                    .setDescription(`${modmailEmbed.description}\n\n${message.content}`);
                
                const descriptionSize = newModmailEmbed.description.length;
                if (descriptionSize > 4096) {
                    messagePart = part + 1;
                } else {
                    await modmailMessage.edit({ embeds: [newModmailEmbed] });

                    return;
                }
            } catch (error) {
                console.error(error);
            }
        }
        
        // load server and author, this error handing is annoying af
        const server = await client.guilds.fetch(process.env.SERVER_ID)
          .catch(() => console.error('Couldn\'t fetch server, check SERVER_ID in .env'));
        if (!server) return;
      
        const author = await server.members.fetch({ user: message.author.id, force: true })
          .catch(() => {});
        if (!author) return;
      
        let authorTitle = author.nickname || author.user.username;
        if (messagePart > 0)
            authorTitle += ` (Part ${messagePart + 1})`;

        const authorIcon = author.user.avatarURL({ dynamic: true });
      
        const modmailEmbed = new MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Modmail Message')
          .setAuthor({ name: authorTitle, iconURL: authorIcon })
          .setDescription(message.content)
          .setTimestamp();
      
        const modmailMessage = await modmailChannel.send({ embeds: [modmailEmbed] });
        
        // Set the current user's active modmail to the message ID
        activeMessages.set(message.author.id, [ modmailMessage.id, messagePart ]);

        // Set a timeout to remove the active modmail message after 30 seconds if messagePart is 0
        if (messagePart === 0)
            setTimeout(() => activeMessages.delete(message.author.id), 30000);
	},
};