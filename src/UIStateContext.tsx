import { createContext, useContext } from "react";
import { UIStateStore } from "./UIState";

export interface UIStateContextValue {
  store: UIStateStore;
}

export const UIStateContext = createContext<UIStateContextValue>({
  store: new UIStateStore(window.innerWidth, window.innerHeight),
});

export function useUIStateContext() {
  return useContext(UIStateContext);
}

export function useUIStateStore() {
  return useUIStateContext().store;
}
