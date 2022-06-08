import { readdirSync } from "node:fs";
import { join } from "node:path";
import { Client, Collection, Intents } from "discord.js";
import "dotenv/config";

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
  file.endsWith(".js")
);

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

// Set event handling
const eventsPath = join(__dirname, "events");
const eventFiles = readdirSync(eventsPath).filter((file) =>
  file.endsWith(".js")
);

for (const file of eventFiles) {
  const filePath = join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(client, ...args));
  } else {
    client.on(event.name, (...args) =>
      event.execute(client, activeMessages, ...args)
    );
  }
}

client.login(process.env.TOKEN);
