import { TextInputBuilder, TextInputStyle } from "discord.js";
import type{ ButtonComponent } from "../../../handlers/interactions/components";
import type{ ModalSubmitInteraction } from "discord.js";
import { modals } from "../../../handlers/interactions/modals";

export default {
  customId: "addServer",
  allowedUsers: "all",
  persistent: true,
  callback(interaction) {
    const textInput = new TextInputBuilder()
      .setCustomId("invite")
      .setLabel("Server Invite")
      .setPlaceholder("https://discord.gg/invite")
      .setStyle(TextInputStyle.Short);

    return void interaction.showModal({
      customId: interaction.id,
      title: "Add Server",
      components: [{ type: 1, components: [textInput]}],
    })
      .then(() => modals.set(interaction.id, modal => handleModal(modal)));
  },
} as ButtonComponent;

async function handleModal(modal: ModalSubmitInteraction<"cached">) {
  await modal.deferReply({ ephemeral: true });
  modal.client.fetchInvite(modal.fields.getTextInputValue("invite"))
    .then(async invite => {
      await modal.editReply("✅ Invite added");
      const inviteMessage = await modal.followUp(`🌐 Invite Added by ${modal.user.tag}: discord.gg/${invite.code}`);
      void inviteMessage.pin(`Invite added by ${modal.user.tag}`).catch();
    })
    .catch(() => modal.editReply({ content: "❌ Invalid invite" }));
}
