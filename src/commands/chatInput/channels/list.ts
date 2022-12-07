import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import ChannelModel from "../../../database/channels";
import type{ ChatInputSubcommand } from "..";
import { selectMenuComponents } from "../../../handlers/interactions/components";

export default {
  name: "list",
  description: "List all channels in the ticket system",
  async execute(interaction) {
    await interaction.deferReply();
    const doc = await ChannelModel.findOne({ guildId: interaction.guildId });
    if (!doc?.channels.length) return void interaction.editReply("⚠ There are no channels in the ticket system");
    const channels = doc.channels.map((id, i) => `\`${i + 1}.\` <#${id}>`).join("\n");
    const selectMenu = new StringSelectMenuBuilder()
      .setPlaceholder("Select channels to remove")
      .setCustomId(interaction.id)
      .setMinValues(1)
      .setMaxValues(doc.channels.length)
      .addOptions(
        doc.channels.map((id, i) => new StringSelectMenuOptionBuilder()
          .setLabel(`${i + 1}. ${interaction.guild.channels.cache.get(id)?.name ?? `ID: ${id}`}`)
          .setValue(id)),
      );

    return void interaction.editReply({
      content: `Channels in the ticket system:\n\n${channels}`,
      components: [{ type: 1, components: [selectMenu]}],
    })
      .then(() => selectMenuComponents.set(interaction.id, {
        allowedUsers: [interaction.user.id],
        selectType: "string",
        async callback(selectInteraction) {
          const { values } = selectInteraction;
          const newChannels = doc.channels.filter(id => !values.includes(id));
          doc.channels = newChannels;
          await doc.save();
          return void selectInteraction.update({
            content: [
              `💥 Removed \`${values.length}\` channel${values.length === 1 ? "" : "s"} from the ticket system`,
              "Removed Channels:",
              String(values.map((id, i) => `\`${i + 1}.\` <#${id}> (ID: ${id})`).join("\n")),
            ].join("\n"),
            components: [],
          });
        },
      }));
  },
} as ChatInputSubcommand;
