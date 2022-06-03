const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Creates a poll with the given options')
        .addStringOption(option => option.setName("question").setDescription("The question to ask").setRequired(true))
        .addStringOption(option => option.setName("q1").setDescription("The first question").setRequired(true))
        .addStringOption(option => option.setName("q2").setDescription("The second question").setRequired(false))
        .addStringOption(option => option.setName("q3").setDescription("The third question").setRequired(false))
        .addStringOption(option => option.setName("q4").setDescription("The fourth question").setRequired(false))
        .addStringOption(option => option.setName("q5").setDescription("The fifth question").setRequired(false))
        .addStringOption(option => option.setName("q6").setDescription("The sixth question").setRequired(false))
        .addStringOption(option => option.setName("q7").setDescription("The seventh question").setRequired(false))
        .addStringOption(option => option.setName("q8").setDescription("The eighth question").setRequired(false))
        .addStringOption(option => option.setName("q9").setDescription("The ninth question").setRequired(false))
        .addStringOption(option => option.setName("q10").setDescription("The tenth question").setRequired(false)),
    async execute(interaction) {
        // const cache = client
        // console.log(cache)

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

        // await interaction.reply({ embeds: [poll] });
        const message = await interaction.channel.send({ embeds: [poll] });

        //TODO: defer interaction bc of rate limit
        // interaction.defer

        if (message) {
            for (const reaction of reactions) {
                // console.log(reaction);
                // const emoji = cache.map(emoji => emoji.name === reaction);
                // console.log(emoji);
                // await message.react(cache.map(e => e.name === reaction).id);
                await message.react(reaction);
            }
        }

        await interaction.reply("Poll created!", { ephemeral: true });

        // for (let i = 0; i < reactions.length; i++) {
        //     await interaction.react(reactions[i]);
        // }
    }
};