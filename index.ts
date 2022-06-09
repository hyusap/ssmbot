import { readdirSync } from "node:fs";
import { join } from "node:path";
import { Client, Collection, Intents } from "discord.js";
import "dotenv/config";

import path from "path";
import { fileURLToPath } from "url";
import { DiscordEvent } from "./types/event";
import { SlashCommand } from "./types/slashCommand";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

declare module "discord.js" {
  export interface Client {
    commands: Collection<unknown, any>;
  }
}

// Map's user ID to the active modmail ID and embed if there is one
const activeMessages = new Map();

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

client.commands = new Collection();

// Set command handling
const commandsPath = join(__dirname, "commands");
const commandFiles = readdirSync(commandsPath).filter((file) =>
  file.endsWith(".ts")
);

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const commandComplete = await import(filePath);
  const command: SlashCommand = commandComplete.default;
  client.commands.set(command.data.name, command);
}

// Set event handling
const eventsPath = join(__dirname, "events");
const eventFiles = readdirSync(eventsPath).filter((file) =>
  file.endsWith(".ts")
);

for (const file of eventFiles) {
  const filePath = join(eventsPath, file);
  const eventComplete = await import(filePath);
  const event: DiscordEvent = eventComplete.default;
  if (event.once) {
    client.once(event.name, (...args) => event.execute(client, ...args));
  } else {
    client.on(event.name, (...args) =>
      event.execute(client, activeMessages, ...args)
    );
  }
}

client.login(process.env.TOKEN);
