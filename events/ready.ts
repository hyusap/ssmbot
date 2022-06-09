import { DiscordEvent } from "../types/event";

const constants = {
  STATUS_CONTENT: "modmail | DM to contact staff",
};

// export const name = "ready";
// export const once = true;
// export function execute(client) {
//   client.user.setActivity(constants.STATUS_CONTENT, { type: "PLAYING" });

//   console.log("Bot up and running!");
// }

const ready: DiscordEvent = {
  name: "ready",
  once: true,
  execute: (client) => {
    if (client.user) {
      client.user.setActivity(constants.STATUS_CONTENT, { type: "PLAYING" });

      console.log("Bot up and running!");
    }
  },
};

export default ready;
