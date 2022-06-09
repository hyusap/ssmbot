import { SlashCommand } from "../types/slashCommand";

import { SlashCommandBuilder } from "@discordjs/builders";

const test: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Replies with a message"),
  async execute(interaction) {
    await interaction.reply("asdfiaushdfui!");
  },
};

export default test;
