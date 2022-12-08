import type{ AnySelectMenuComponent, ButtonComponent } from "../../handlers/interactions/components";
import addServer from "./ticket/addServer";
import closeTicket from "./ticket/closeTicket";

export const allButtonComponents: ButtonComponent[] = [closeTicket, addServer];
export const allSelectMenuComponents: AnySelectMenuComponent[] = [];
