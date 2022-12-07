import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import type{ GuildMember, TextChannel } from "discord.js";
import ChannelModel from "../../../database/channels";
import type{ ChatInputSubcommand } from "..";

export default {
  name: "add",
  description: "Add a channel to the ticket system",
  options: [
    {
      type: ApplicationCommandOptionType.Channel,
      name: "channel",
      description: "The channel to add",
      required: true,
    },
  ],
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel", true) as TextChannel;
    const doc = await ChannelModel.findOne({ guildId: interaction.guildId });
    if (!channel.isTextBased() || channel.isDMBased() || channel.isThread()) {
      return void interaction.reply("❌ You can only add text channels to the ticket system");
    }
    if (!hasPermissionToCreateThread(channel, interaction.guild.members.me!)) {
      return void interaction.reply([
        "⚠ I'm missing one of the following permissions in that channel:",
        "• Create Public Threads",
        "• Create Private Threads",
        "• Send Messages in Threads",
      ].join("\n"));
    }
    await interaction.deferReply();
    if (!doc) {
      const newDoc = new ChannelModel({
        guildId: interaction.guildId,
        channels: [channel.id],
      });
      await newDoc.save();
    } else if (doc.channels.includes(channel.id)) {
      return void interaction.editReply(`⚠ <#${channel.id}> is already in the ticket system`);
    } else {
      doc.channels.push(channel.id);
      await doc.save();
    }

    return void interaction.editReply(`✅ Added <#${channel.id}> to the ticket system`);
  },
} as ChatInputSubcommand;

export function hasPermissionToCreateThread(channel: TextChannel, member: GuildMember): boolean {
  return channel
    .permissionsFor(member, true)
    .has([
      PermissionFlagsBits.CreatePublicThreads,
      PermissionFlagsBits.CreatePrivateThreads,
      PermissionFlagsBits.SendMessagesInThreads,
    ]);
}
