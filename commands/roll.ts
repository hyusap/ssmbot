import { SlashCommandBuilder } from "@discordjs/builders";
import { SlashCommand } from "../types/slashCommand";

const roll: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription(
      "Generates a random number from 1 to the specified number (defaults to 6)."
    )
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription("The number to roll from")
        .setRequired(false)
    ),
  async execute(interaction) {
    // default to 6
    const option = interaction.options.getInteger("number") || 6;
    const number = Math.floor(Math.random() * option) + 1;

    await interaction.reply({
      embeds: [
        {
          title: `Result of rolling a ${option}-sided die:`,
          description: `You rolled a ${number}!`,
          color: "#000099",
        },
      ],
    });
  },
};

export default roll;
