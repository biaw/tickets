import type{ MessageMenuCommand } from ".";
import handleTicket from "./ticket";

export default {
  name: "Create Ticket",
  type: "message",
  async execute(interaction, message) {
    const member = message.member ?? await interaction.guild.members.fetch(message.author.id);
    await handleTicket(interaction, member, message);
  },
} as MessageMenuCommand;
