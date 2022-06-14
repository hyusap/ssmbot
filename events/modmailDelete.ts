import { Client, Message, MessageEmbed } from "discord.js";
import { DiscordEvent } from "../types/event.js";
import {
  previewContent,
  cancellationTimeout,
  ActiveModmail,
} from "./modmail.js";

export const name = "messageDelete";
export async function execute(
  client: Client,
  activeMessages: Map<string, ActiveModmail>,
  message: Message
) {
  if (message.channel.type !== "DM" || message.author.bot) return;

  // return if a modmail is not active for this user
  const currentMessage = activeMessages.get(message.author.id);
  if (!currentMessage) return;

  // load message content and preview

  const { modmailContent, previewId, timeoutHandle } = currentMessage;
  // edit the modmail content to include the new changes
  const newModmailContent = modmailContent.replace(message.content, "");

  const previewMessage = await message.channel.messages.fetch(previewId);
  const previewEmbed = previewMessage.embeds[0];

  const newPreviewEmbed = new MessageEmbed(previewEmbed)
    .setDescription(previewContent(newModmailContent))
    .setTimestamp();

  await previewMessage.edit({ embeds: [newPreviewEmbed] });

  // renew timeout
  clearTimeout(timeoutHandle);
  const newTimeoutHandle = cancellationTimeout(
    activeMessages,
    message.author.id,
    message.channel,
    previewMessage
  );

  // update activeMessages
  activeMessages.set(message.author.id, {
    modmailContent: newModmailContent,
    previewId: previewMessage.id,
    timeoutHandle: newTimeoutHandle,
  });
}

const modmailDelete: DiscordEvent = {
  name: "messageDelete",
  once: false,
  execute: async (client, { activeMessages }, message: Message) => {
    if (message.channel.type !== "DM" || message.author.bot) return;

    // return if a modmail is not active for this user
    const currentMessage = activeMessages.get(message.author.id);
    if (!currentMessage) return;

    // load message content and preview

    const { modmailContent, previewId, timeoutHandle } = currentMessage;
    // edit the modmail content to include the new changes
    const newModmailContent = modmailContent.replace(message.content, "");

    const previewMessage = await message.channel.messages.fetch(previewId);
    const previewEmbed = previewMessage.embeds[0];

    const newPreviewEmbed = new MessageEmbed(previewEmbed)
      .setDescription(previewContent(newModmailContent))
      .setTimestamp();

    await previewMessage.edit({ embeds: [newPreviewEmbed] });

    // renew timeout
    clearTimeout(timeoutHandle);
    const newTimeoutHandle = cancellationTimeout(
      activeMessages,
      message.author.id,
      message.channel,
      previewMessage
    );

    // update activeMessages
    activeMessages.set(message.author.id, {
      modmailContent: newModmailContent,
      previewId: previewMessage.id,
      timeoutHandle: newTimeoutHandle,
    });
  },
};

export default modmailDelete;
