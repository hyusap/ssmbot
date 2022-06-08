import { SlashCommandStringOption } from "@discordjs/builders";
import { SlashCommand } from "../types/slashCommand";

const { SlashCommandBuilder } = require("@discordjs/builders");

const echo: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("echo")
    .setDescription("Replies with the same message")
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("message").setDescription("The message to reply with")
    ),
  async execute(interaction) {
    await interaction.reply({
      content: interaction.options.getString("message"),
      ephemeral: true,
    });
  },
};

export default echo;
