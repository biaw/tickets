import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
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
    const channel = interaction.options.getChannel("channel", true);
    const doc = await ChannelModel.findOne({ guildId: interaction.guildId });
    if (!channel.isTextBased() || channel.isDMBased() || channel.isThread()) {
      return void interaction.reply("❌ You can only add text channels to the ticket system");
    }
    if (
      !channel
        .permissionsFor(interaction.guild.members.me!, true)
        .has([PermissionFlagsBits.CreatePublicThreads, PermissionFlagsBits.CreatePrivateThreads])
    ) {
      return void interaction.reply(
        "⚠ I need permissions to create public and private threads in that channel",
      );
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
