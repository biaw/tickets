import type{ AnySelectMenuInteraction, Awaitable, ButtonInteraction, ChannelSelectMenuInteraction, MentionableSelectMenuInteraction, RoleSelectMenuInteraction, Snowflake, StringSelectMenuInteraction, UserSelectMenuInteraction } from "discord.js";
import { allButtonComponents, allSelectMenuComponents } from "../../commands/components";
import { ComponentType } from "discord.js";

interface BaseComponent {
  customId?: string;
  allowedUsers: "all" | [Snowflake, ...Snowflake[]];
  persistent?: true;
}

export interface ButtonComponent extends BaseComponent {
  callback(interaction: ButtonInteraction<"cached">): Awaitable<void>;
}

interface ChannelSelectMenuComponent extends BaseComponent {
  selectType: "channel";
  callback(interaction: ChannelSelectMenuInteraction<"cached">): Awaitable<void>;
}

interface MentionableSelectMenuComponent extends BaseComponent {
  selectType: "mentionable";
  callback(interaction: MentionableSelectMenuInteraction<"cached">): Awaitable<void>;
}

interface RoleSelectMenuComponent extends BaseComponent {
  selectType: "role";
  callback(interaction: RoleSelectMenuInteraction<"cached">): Awaitable<void>;
}

interface StringSelectMenuComponent extends BaseComponent {
  selectType: "string";
  callback(interaction: StringSelectMenuInteraction<"cached">): Awaitable<void>;
}

interface UserSelectMenuComponent extends BaseComponent {
  selectType: "user";
  callback(interaction: UserSelectMenuInteraction<"cached">): Awaitable<void>;
}

export type AnySelectMenuComponent = ChannelSelectMenuComponent | MentionableSelectMenuComponent | RoleSelectMenuComponent | StringSelectMenuComponent | UserSelectMenuComponent;

export const buttonComponents = new Map<string, ButtonComponent>();
allButtonComponents.forEach(component => {
  buttonComponents.set(component.customId!, component);
});
export const selectMenuComponents = new Map<string, AnySelectMenuComponent>();
allSelectMenuComponents.forEach(component => {
  selectMenuComponents.set(component.customId!, component);
});

export default function componentHandler(interaction: AnySelectMenuInteraction<"cached"> | ButtonInteraction<"cached">): void {
  if (interaction.isButton()) {
    const component = buttonComponents.get(interaction.customId);
    if (component && (component.allowedUsers === "all" || component.allowedUsers.includes(interaction.user.id))) void component.callback(interaction);
    if (!component?.persistent) buttonComponents.delete(interaction.customId);
  } else if (interaction.isAnySelectMenu()) {
    const component = selectMenuComponents.get(interaction.customId);
    if (component && (component.allowedUsers === "all" || component.allowedUsers.includes(interaction.user.id)) && selectComponentMatchesInteractionType(interaction, component)) void component.callback(interaction as never);
    if (!component?.persistent) selectMenuComponents.delete(interaction.customId);
  }
}

const selectTypes: Record<(ChannelSelectMenuComponent | MentionableSelectMenuComponent | RoleSelectMenuComponent | StringSelectMenuComponent | UserSelectMenuComponent)["selectType"], ComponentType> = {
  channel: ComponentType.ChannelSelect,
  mentionable: ComponentType.MentionableSelect,
  role: ComponentType.RoleSelect,
  string: ComponentType.StringSelect,
  user: ComponentType.UserSelect,
};

function selectComponentMatchesInteractionType(interaction: AnySelectMenuInteraction<"cached">, component: ChannelSelectMenuComponent | MentionableSelectMenuComponent | RoleSelectMenuComponent | StringSelectMenuComponent | UserSelectMenuComponent): boolean {
  return selectTypes[component.selectType] === interaction.componentType;
}
