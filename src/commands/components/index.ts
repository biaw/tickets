import type{ AnySelectMenuComponent, ButtonComponent } from "../../handlers/interactions/components";
import addServer from "./thread/addServer";
import closeThread from "./thread/closeThread";

export const allButtonComponents: ButtonComponent[] = [closeThread, addServer];
export const allSelectMenuComponents: AnySelectMenuComponent[] = [];
