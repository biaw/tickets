import type{ ChatInput } from "..";
import add from "./add";

export default {
  name: "channels",
  description: "Add/Remove channels to the ticket system",
  subcommands: [add],
} as ChatInput;
