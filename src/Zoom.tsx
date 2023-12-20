import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { useAppState } from "./AppStateContext";
import { drawZoom } from "./draw";

const mousePointerOffset = 20;
export const Zoom = observer(function Zoom() {
  const ref = useRef<HTMLCanvasElement>(null);
  const appState = useAppState();

  useEffect(() => {
    if (!appState.zoomElement || !ref.current) {
      return;
    }
    drawZoom(appState.zoomElement, appState.canvas, ref.current);
  });

  if (!appState.zoomElement) {
    return null;
  }

  return (
    <canvas
      ref={ref}
      style={{
        left: `${appState.zoomElement.point.x + mousePointerOffset}px`,
        top: `${appState.zoomElement.point.y + mousePointerOffset}px`,
      }}
      className={"shadow-md border-indigo rounded-xl absolute"}
      width={appState.zoomElement.point.radius * appState.zoomElement.size}
      height={appState.zoomElement.point.radius * appState.zoomElement.size}
    />
  );
});
