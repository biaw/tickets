import type{ ChatInput } from "..";
import add from "./add";
import list from "./list";

export default {
  name: "channels",
  description: "Add/Remove channels to the ticket system",
  subcommands: [add, list],
} as ChatInput;
