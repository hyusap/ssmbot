import { readdirSync } from "node:fs";
import { join } from "node:path";
import { Client, Collection, Intents } from "discord.js";
import "dotenv/config";

import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { DiscordEvent } from "./types/event";
import { SlashCommand } from "./types/slashCommand";
import { ActiveModmail } from "./events/modmail";
import { globalState } from "./state";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

declare module "discord.js" {
  export interface Client {
    commands: Collection<unknown, any>;
  }
}

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
const commandFiles = readdirSync(commandsPath).filter(
  (file) => file.endsWith(".ts") || file.endsWith(".js")
);

for (const file of commandFiles) {
  const filePath = pathToFileURL(join(commandsPath, file)).href;
  const commandComplete = await import(filePath);
  const command: SlashCommand = commandComplete.default;
  client.commands.set(command.data.name, command);
}

// Set event handling
const eventsPath = join(__dirname, "events");
const eventFiles = readdirSync(eventsPath).filter(
  (file) => file.endsWith(".ts") || file.endsWith(".js")
);

for (const file of eventFiles) {
  const filePath = pathToFileURL(join(eventsPath, file)).href;
  const eventComplete = await import(filePath);
  const event: DiscordEvent = eventComplete.default;
  if (event.once) {
    client.once(event.name, (...args) =>
      event.execute(client, globalState, ...args)
    );
  } else {
    client.on(event.name, (...args) =>
      event.execute(client, globalState, ...args)
    );
  }
}

client.login(process.env.TOKEN);
