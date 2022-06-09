import { MessageEmbed } from "discord.js";
import { previewContent, cancellationTimeout } from "./modmail.js";

export const name = "messageDelete";
export async function execute(client, activeMessages, message) {
  if (message.channel.type !== "DM" || message.author.bot) return;

  // return if a modmail is not active for this user
  if (!activeMessages.has(message.author.id)) return;

  // load message content and preview
  const { modmailContent, previewId, timeoutHandle } = activeMessages.get(
    message.author.id
  );

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
