const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Creates a poll with the given options')
        .addStringOption(option => option.setName("question").setDescription("The question to ask").setRequired(true))
        .addStringOption(option => option.setName("q1").setDescription("Question 1").setRequired(true))
        .addStringOption(option => option.setName("q2").setDescription("Question 2").setRequired(false))
        .addStringOption(option => option.setName("q3").setDescription("Question 3").setRequired(false))
        .addStringOption(option => option.setName("q4").setDescription("Question 4").setRequired(false))
        .addStringOption(option => option.setName("q5").setDescription("Question 5").setRequired(false))
        .addStringOption(option => option.setName("q6").setDescription("Question 6").setRequired(false))
        .addStringOption(option => option.setName("q7").setDescription("Question 7").setRequired(false))
        .addStringOption(option => option.setName("q8").setDescription("Question 8").setRequired(false))
        .addStringOption(option => option.setName("q9").setDescription("Question 9").setRequired(false))
        .addStringOption(option => option.setName("q10").setDescription("Question 10").setRequired(false)),
    async execute(interaction) {
        const numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

        var reactions = [];
        const poll = new MessageEmbed()
            .setTitle(`Poll: ${interaction.options.getString("question")}`)
            .setAuthor({ name: interaction.member.nickname || interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true }) })

        for (let i = 1; i <= 10; i++) {
            const option = interaction.options.getString(`q${i}`);
            if (option) {
                poll.addField(`${numbers[i - 1]}`, `${option}`);
                reactions.push(numbers[i - 1]);
            }
        }

        const message = await interaction.channel.send({ embeds: [poll] });
        await interaction.deferReply();

        if (message) {
            for (const reaction of reactions) {
                await message.react(reaction);
            }
        }

        await interaction.editReply("Poll created!", { ephemeral: true });
    }
};