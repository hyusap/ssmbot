import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export interface SlashCommand {
  data:
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    | SlashCommandSubcommandsOnlyBuilder;
  execute(interaction: CommandInteraction): Promise<void>;
}
