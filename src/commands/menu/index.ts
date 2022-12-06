import type{ Awaitable, GuildMember, Message, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from "discord.js";
import { readdir } from "fs/promises";

interface BaseMenuCommand {
  name: string;
  public?: true;
}

export interface UserMenuCommand extends BaseMenuCommand {
  type: "user";
  execute(interaction: UserContextMenuCommandInteraction<"cached">, target: GuildMember): Awaitable<void>;
}

export interface MessageMenuCommand extends BaseMenuCommand {
  type: "message";
  execute(interaction: MessageContextMenuCommandInteraction<"cached">, target: Message<true>): Awaitable<void>;
}

export type MenuCommand = MessageMenuCommand | UserMenuCommand;

export const allMenuCommands: MenuCommand[] = [];

void readdir(__dirname).then(async files => {
  for (const file of files) {
    if (file.endsWith(".js") && file !== "index.js") {
      const { default: command } = await import(`./${file}`) as { default: MenuCommand };
      allMenuCommands.push(command);
    }
  }
});
