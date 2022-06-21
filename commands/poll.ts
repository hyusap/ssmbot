import { SlashCommandStringOption } from "@discordjs/builders";
import { GuildMember } from "discord.js";
import { SlashCommand } from "../types/slashCommand";

import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";

const poll: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Creates a poll with the given options")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("question")
        .setDescription("The question to ask")
        .setRequired(true)
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("a1").setDescription("Answer 1").setRequired(true)
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("a2").setDescription("Answer 2").setRequired(true)
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("a3").setDescription("Answer 3").setRequired(false)
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("a4").setDescription("Answer 4").setRequired(false)
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("a5").setDescription("Answer 5").setRequired(false)
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("a6").setDescription("Answer 6").setRequired(false)
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("a7").setDescription("Answer 7").setRequired(false)
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("a8").setDescription("Answer 8").setRequired(false)
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("a9").setDescription("Answer 9").setRequired(false)
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("a10").setDescription("Answer 10").setRequired(false)
    ),
  async execute(interaction) {
    if (interaction.member instanceof GuildMember && interaction.channel) {
      const numbers = [
        "1️⃣",
        "2️⃣",
        "3️⃣",
        "4️⃣",
        "5️⃣",
        "6️⃣",
        "7️⃣",
        "8️⃣",
        "9️⃣",
        "🔟",
      ];

      var reactions = [];
      const poll = new MessageEmbed()
        .setTitle(`Poll: ${interaction.options.getString("question")}`)
        .setAuthor(
          interaction.member.nickname || interaction.user.username,
          interaction.user.avatarURL({ dynamic: true })!
        );

      for (let i = 1; i <= 10; i++) {
        const option = interaction.options.getString(`a${i}`);
        if (option) {
          poll.addField(`${numbers[i - 1]}`, `${option}`);
          reactions.push(numbers[i - 1]);
        }
      }

      const message = await interaction.channel.send({ embeds: [poll] });
      await interaction.deferReply({ ephemeral: true });

      if (message) {
        for (const reaction of reactions) {
          await message.react(reaction);
        }
      }

      await interaction.editReply("Poll created!");
    }
  },
};

export default poll;
