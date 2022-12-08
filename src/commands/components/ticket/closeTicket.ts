import { ButtonBuilder, ButtonStyle } from "discord.js";
import type{ ButtonInteraction, ThreadChannel } from "discord.js";
import type{ ButtonComponent } from "../../../handlers/interactions/components";
import { buttonComponents } from "../../../handlers/interactions/components";

export default {
  customId: "closeTicket",
  allowedUsers: "all",
  persistent: true,
  callback(interaction) {
    const thread = interaction.channel as ThreadChannel | undefined;
    if (!thread?.isThread() || !thread.viewable || thread.archived) return;
    if (!thread.manageable) {
      return void interaction.reply("⚠ I do not have permission to close this ticket.");
    }

    const yesButton = new ButtonBuilder()
      .setCustomId(`${interaction.id}-yes`)
      .setLabel("Yes")
      .setStyle(ButtonStyle.Primary);
    const noButton = new ButtonBuilder()
      .setCustomId(`${interaction.id}-no`)
      .setLabel("No")
      .setStyle(ButtonStyle.Secondary);

    return void interaction.reply({
      content: "⚠ Are you sure you want to close this ticket?\n(Only moderators can reopen tickets)",
      components: [{ type: 1, components: [yesButton, noButton]}],
      ephemeral: true,
    }).then(() => {
      buttonComponents.set(`${interaction.id}-yes`, {
        allowedUsers: [interaction.user.id],
        callback: yesInteraction => {
          void yesInteraction.update({ content: "⌛ Closing ticket...", components: []})
            .then(() => closeTicket(yesInteraction, thread));
        },
      });

      buttonComponents.set(`${interaction.id}-no`, {
        allowedUsers: [interaction.user.id],
        callback: noInteraction => void noInteraction
          .update({ content: "⚠ Closing ticket cancelled.", components: []}),
      });
    });
  },
} as ButtonComponent;

async function closeTicket(interaction: ButtonInteraction, thread: ThreadChannel): Promise<void> {
  await thread.setArchived(true, `Archived by ${interaction.user.tag}.`)
    .catch(() => interaction.followUp("⚠ An error occurred while closing this ticket."));
}
