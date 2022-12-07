import type{ ChatInputSubcommand } from "..";

export default {
  name: "list",
  description: "List all channels in the ticket system",
  async execute(interaction) {
    await interaction.reply("This command is not yet implemented");
  },
} as ChatInputSubcommand;
