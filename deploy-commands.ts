import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { readdirSync } from "node:fs";
import "dotenv/config";

if (process.env.CLIENT_ID && process.env.TOKEN && process.env.SERVER_ID) {
  const commands = [];
  const commandFiles = readdirSync("./commands").filter(
    (file) => file.endsWith(".js") || file.endsWith(".ts")
  );

  for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    commands.push(command.default.data.toJSON());
  }

  const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

  rest
    .put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.SERVER_ID
      ),
      { body: commands }
    )
    .then(() => console.log("Successfully registered application commands."))
    .catch(console.error);
} else {
  console.error(
    "Missing environment variables. Please set CLIENT_ID, TOKEN, and SERVER_ID."
  );
}
