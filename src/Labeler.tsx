import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { AppState } from "./AppState";
import { AppStateContext } from "./AppStateContext";
import { Canvas } from "./Canvas";
import { newImageElementFromBlob } from "./constructors";
import { PointTuple } from "./Element";
import { UILayer } from "./UILayer";

export interface LabelerProps {
  imageSrc: string;
  shelves: PointTuple[][];
  onChange: (shelves: PointTuple[][]) => void;
}

export const Labeler = observer(function Labeler(props: LabelerProps) {
  const [state] = useState(() => {
    return { store: new AppState(window.innerWidth, window.innerHeight) };
  });

  useEffect(() => {
    async function initializeAppState() {
      const response = await fetch(props.imageSrc, {
        headers: { "Content-Type": "image/jpeg" },
      });
      const blob = await response.blob();
      const imageElement = await newImageElementFromBlob(blob, state.store);
      state.store.setImageElement(imageElement);
      state.store.initializeShelves(props.shelves);
    }
    state.store.status = "idle";
    initializeAppState().then(() => {
      state.store.status = "ready";
    });
  }, [props.imageSrc, props.shelves, state.store]);

  if (state.store.status === "idle") {
    return <></>;
  }

  return (
    <AppStateContext.Provider value={state}>
      <UILayer />
      <Canvas onChange={props.onChange} />
    </AppStateContext.Provider>
  );
});
