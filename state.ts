import { ActiveModmail } from "./events/modmail";

export interface GlobalState {
  activeMessages: Map<string, ActiveModmail>;
}

export const globalState: GlobalState = {
  activeMessages: new Map(),
};
