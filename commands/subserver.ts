import { SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import { SlashCommand } from "../types/slashCommand";

const subserver: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("subserver")
    .setDescription("Get access to the server"),
  async execute(interaction: CommandInteraction) {
    if (interaction.memberPermissions?.has("ADMINISTRATOR")) {
      const buttons = new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel("Verify")
          .setStyle("PRIMARY")
          .setCustomId("subserver-verify")
          .setEmoji("✅")
      );

      await interaction.reply({
        embeds: [
          {
            title: "Verification",
            description:
              "Please press the button below to verify your account. You must be in the main server.",
            color: "#00ff00",
          },
        ],
        components: [buttons],
      });
    }
  },
};

export default subserver;
