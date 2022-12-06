import type{ UserMenuCommand } from ".";


export default {
  name: "Create Ticket",
  type: "user",
  execute(interaction) {
    return void interaction.reply("Hello world!");
  },

} as UserMenuCommand;
