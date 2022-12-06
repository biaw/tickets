import type{ MessageMenuCommand } from ".";

export default {
  name: "Create-Ticket",
  type: "message",
  execute(interaction) {
    return void interaction.reply("Hello world!");
  },
} as MessageMenuCommand;
