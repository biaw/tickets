import type{ ContextMenuCommandInteraction, GuildMember, Message, TextChannel, ThreadChannel } from "discord.js";
import {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ThreadAutoArchiveDuration,
} from "discord.js";
import ChannelModel from "../../database/channels";
import { hasPermissionToCreateThread } from "../chatInput/channels/add";
import { selectMenuComponents } from "../../handlers/interactions/components";

export default async function handleTicket(
  interaction: ContextMenuCommandInteraction,
  target: GuildMember,
  message?: Message<true>,
): Promise<void> {
  await interaction.deferReply({ ephemeral: true });
  const doc = await ChannelModel.findOne({ guildId: interaction.guildId });
  if (!doc) return void interaction.editReply("⚠ There are no channels in the ticket system");
  if (doc.channels.length > 1) return multiChannel(interaction, doc, target, message);

  const channel = interaction.guild!.channels.cache.get(doc.channels[0]!) as TextChannel | undefined;
  if (!channel) {
    return void interaction.editReply(
      `⚠ The channel with ID ${doc.channels[0]!} is no longer available`,
    );
  }
  if (!hasPermissionToCreateThread(channel, interaction.guild!.members.me!)) {
    return void interaction.editReply([
      "⚠ I'm missing one of the following permissions in that channel:",
      "• Create Public Threads",
      "• Create Private Threads",
      "• Send Messages in Threads",
    ].join("\n"));
  }
  const ticket = await createThread(channel, interaction.user.tag, target);
  return void interaction.editReply(`✅ Created ticket <#${ticket.id}>`);
}

function multiChannel(
  interaction: ContextMenuCommandInteraction,
  doc: TicketDocument,
  target: GuildMember,
  message?: Message<true>,
) {
  const selectMenu = new StringSelectMenuBuilder()
    .setPlaceholder("Select a channel to create a ticket in")
    .setCustomId(interaction.id)
    .addOptions(
      doc.channels.map((id, i) => new StringSelectMenuOptionBuilder()
        .setLabel(`${i + 1}. ${interaction.guild!.channels.cache.get(id)?.name ?? `ID: ${id}`}`)
        .setValue(id)),
    );
  return void interaction
    .editReply({ components: [{ type: 1, components: [selectMenu]}]})
    .then(() => selectMenuComponents.set(interaction.id, {
      allowedUsers: [interaction.user.id],
      selectType: "string",
      async callback(selectInteraction) {
        const { values } = selectInteraction;
        const channel = interaction.guild!.channels.cache.get(values[0]!) as TextChannel | undefined;
        if (!channel) {
          return void selectInteraction.update({
            content: `⚠ The channel with ID ${values[0]!} is no longer available`,
            components: [],
          });
        }

        const ticket = await createThread(channel, interaction.user.tag, target, message);
        return void selectInteraction.update({
          content: `✅ Created ticket <#${ticket.id}>`,
          components: [],
        });
      },
    }));
}

async function createThread(
  channel: TextChannel,
  creatorName: string,
  target: GuildMember,
  message?: Message<true>,
) {
  const ticket = await channel.threads.create({
    name: target.displayName,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
    reason: `Ticket created by ${creatorName}`,
  });
  await ticket.members.add(target, `Ticket created by ${creatorName}`);
  if (message) await sendTicketMessage(ticket, creatorName, target, message);
  return ticket;
}

async function sendTicketMessage(ticket: ThreadChannel, creator: string, target: GuildMember, message?: Message<true>) {
  await ticket.send({
    content: [
      `**Ticket created by ${creator} for ${target.toString()}**`,
      message ? `*Context:*\n> ${message.content}` : "",
    ].join("\n"),
  });
}

interface TicketDocument {
  guildId: string;
  channels: string[];
}
