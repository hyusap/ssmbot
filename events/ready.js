const constants = {
  STATUS_CONTENT: "modmail | DM to contact staff",
};

export const name = "ready";
export const once = true;
export function execute(client) {
  client.user.setActivity(constants.STATUS_CONTENT, { type: "PLAYING" });

  console.log("Bot up and running!");
}
