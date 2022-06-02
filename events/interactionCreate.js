module.exports = {
	name: 'interactionCreate',
	async execute(client, activeMessages, interaction) {
        // console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

        if (interaction.isButton()) {
            activeMessages.delete(interaction.user.id);

            // disable the button
            await interaction.deferUpdate();
            await interaction.editReply({ components: [], ephemeral: true });
            await interaction.followUp({ content: 'Modmail message has been sent!', ephemeral: true });
    
            return;
        }
    
        if (!interaction.isCommand()) return;
    
        const command = client.commands.get(interaction.commandName);
    
        if (!command) return;
    
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
        },
};