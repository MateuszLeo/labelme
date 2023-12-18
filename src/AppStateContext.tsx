import { createContext, useContext } from "react";
import { AppState } from "./AppState.ts";

export interface UIStateContextValue {
  store: AppState;
}

export const AppStateContext = createContext<UIStateContextValue>({
  store: new AppState(window.innerWidth, window.innerHeight),
});

export function useAppStateContext() {
  return useContext(AppStateContext);
}

export function useAppState() {
  return useAppStateContext().store;
}
