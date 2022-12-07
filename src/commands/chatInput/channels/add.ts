import { ApplicationCommandOptionType } from "discord.js";
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
    await interaction.reply("This command is not yet implemented");
  },
} as ChatInputSubcommand;
