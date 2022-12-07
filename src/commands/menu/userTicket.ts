import type{ UserMenuCommand } from ".";
import handleTicket from "./ticket";

export default {
  name: "Create Ticket",
  type: "user",
  async execute(interaction, target) {
    await handleTicket(interaction, target);
  },

} as UserMenuCommand;
