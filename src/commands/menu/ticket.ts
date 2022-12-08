import { ButtonBuilder, ButtonStyle } from "discord.js";
import type{ ContextMenuCommandInteraction, GuildMember, Message, StringSelectMenuInteraction, TextChannel, ThreadChannel } from "discord.js";
import {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ThreadAutoArchiveDuration,
} from "discord.js";
import ChannelModel from "../../database/channels";
import { ChannelType } from "discord.js";
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

  const channel = interaction.guild!.channels.cache.get(doc.channels[0]!) as TextChannel;

  const canContinue = checkPermissions(interaction, channel, doc.channels[0]!);
  if (!canContinue) return;

  const ticket = await createThread(channel, interaction.user.tag, target);
  return void interaction.editReply(`✅ Created ticket <#${ticket.id}>`);

}

function checkPermissions(
  interaction: ContextMenuCommandInteraction | StringSelectMenuInteraction<"cached">,
  channel: TextChannel | undefined, id: string,
): boolean {
  if (!channel) {
    respond(`⚠ The channel with ID ${id} is no longer available`);
    return false;
  }
  if (!hasPermissionToCreateThread(channel, interaction.guild!.members.me!)) {
    respond([
      "⚠ I'm missing one of the following permissions in that channel:",
      "• Create Public Threads",
      "• Create Private Threads",
      "• Send Messages in Threads",
    ].join("\n"));
    return false;
  }
  return true;

  function respond(msg: string) {
    if (interaction.isContextMenuCommand()) void interaction.editReply(msg);
    else void interaction.update({ content: msg, components: []});
  }
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
        const channel = interaction.guild!.channels.cache.get(values[0]!) as TextChannel;
        const canContinue = checkPermissions(selectInteraction, channel, values[0]!);
        if (!canContinue) return;

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
    type: ChannelType.PrivateThread,
    invitable: false,
    reason: `Ticket created by ${creatorName}`,
  });
  await ticket.members.add(target, `Ticket created by ${creatorName}`);
  await sendTicketMessage(ticket, creatorName, target, message);
  return ticket;
}

async function sendTicketMessage(ticket: ThreadChannel, creator: string, target: GuildMember, message?: Message<true>) {
  const addServer = new ButtonBuilder()
    .setCustomId("addServer")
    .setLabel("Add Server")
    .setStyle(ButtonStyle.Primary);
    // callback is defined in src/commands/components/thread/addServer.ts
  const closeThreadButton = new ButtonBuilder()
    .setCustomId("closeThread")
    .setLabel("Close Thread")
    .setStyle(ButtonStyle.Danger);
    // callback is defined in src/commands/components/thread/closeThread.ts
  await ticket.send({
    content: [
      `**Ticket created by ${creator} for ${target.toString()}**`,
      message ? `*Context:*\n> ${message.content}` : "",
    ].join("\n"),
    components: [{ type: 1, components: [addServer, closeThreadButton]}],
  });
}

interface TicketDocument {
  guildId: string;
  channels: string[];
}
