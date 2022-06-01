const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'messageCreate',
	async execute(client, message) {
        if (message.channel.type !== "DM" || message.author.bot) return;
  
        const server = await client.guilds.fetch(process.env.SERVER_ID)
          .catch(() => console.error('Couldn\'t fetch server, check SERVER_ID in .env'));
        if (!server) return;
      
        const modmailChannel = await client.channels.fetch(process.env.CHANNEL_ID)
          .catch(() => console.error('Couldn\'t fetch channel, check CHANNEL_ID in .env'));
        if (!modmailChannel) return;
      
        const author = await server.members.fetch({ user: message.author.id, force: true })
          .catch(() => {});
        if (!author) return;
      
        const authorName = author.nickname || author.user.username;
        const authorIcon = author.user.avatarURL({ dynamic: true });
      
        const modmailEmbed = new MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Modmail Message')
          .setAuthor({ name: authorName, iconURL: authorIcon })
          .setDescription(message.content)
          .setTimestamp();
      
        modmailChannel.send({ embeds: [modmailEmbed] });
	},
};