import { Client } from "discord.js";
import { GlobalState } from "../state";

export interface DiscordEvent {
  name: string;
  once: boolean;
  execute: (client: Client, state: GlobalState, ...args: any[]) => void;
}
