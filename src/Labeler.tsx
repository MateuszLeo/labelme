import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { newShelfFromTuples } from "./Element";
import { UILayer } from "./UILayer";
import { PointTuple, UIStateStore } from "./UIState";
import { UIStateContext } from "./UIStateContext";
import { useAddImage } from "./useAddImage";

export interface LabelerProps {
  imageSrc: string;
  shelves: PointTuple[][];
  onChange: (shelves: PointTuple[][]) => void;
}

export const Labeler = observer(function Labeler(props: LabelerProps) {
  const [state] = useState(() => {
    const elements = [];
    for (const element of props.shelves) {
      elements.push(...newShelfFromTuples(element));
    }
    return { store: new UIStateStore(window.innerWidth, window.innerHeight, elements) };
  });

  return (
    <UIStateContext.Provider value={state}>
      <Root {...props} />
    </UIStateContext.Provider>
  );
});

const Root = observer(function Root(props: LabelerProps) {
  const addImage = useAddImage();

  useEffect(() => {
    async function getExample() {
      const response = await fetch(props.imageSrc, {
        headers: { "Content-Type": "image/jpeg" },
      });
      const blob = await response.blob();
      await addImage(blob);
    }
    getExample();
  }, []);

  return (
    <>
      <UILayer />
      <Canvas onChange={props.onChange} />
    </>
  );
});
