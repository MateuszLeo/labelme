import { reaction, toJS } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { useAppState } from "./AppStateContext";
import { imageCache, newShelfElement, newZoomElement } from "./constructors";
import { drawElements } from "./draw";
import { PointTuple } from "./Element";
import { getHitAtPosition, Hit } from "./hit";

function pointFromEvent(e: Pick<PointerEvent, "clientX" | "clientY">): PointTuple {
  return [Math.round(e.clientX), Math.round(e.clientY)];
}

interface PointerDownState {
  lastPointerCords: PointTuple;
  onMove: ((e: PointerEvent) => void) | null;
  onUp: (() => void) | null;
  hit: Hit | null;
}

export interface CanvasProps {
  onChange: (elements: PointTuple[][]) => void;
}

export const Canvas = observer(function Canvas(props: CanvasProps) {
  const appState = useAppState();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const drawReactionDispose = reaction(() => {
      return {
        elements: toJS(appState.elements),
        selectedElement: toJS(appState.selectedElement),
        editingElement: toJS(appState.editingElement),
        zoomElement: toJS(appState.zoomElement),
      };
    }, () => {
      drawElements({ canvas, imageCache, appState });
    }, {
      fireImmediately: true,
    });

    const changeReactionDispose = reaction(() => {
      return toJS(appState.shelvesPoints);
    }, (points) => {
      props.onChange(points);
    });

    return () => {
      drawReactionDispose();
      changeReactionDispose();
    };
  }, []);

  function makePointerMoveEvent(state: PointerDownState) {
    return (e: PointerEvent) => {
      const point = pointFromEvent(e);
      const delta: PointTuple = [
        point[0] - state.lastPointerCords[0],
        point[1] - state.lastPointerCords[1],
      ];
      state.lastPointerCords = point;

      if (appState.editingElement) {
        appState.drawShelfElement(appState.editingElement, point);
        return;
      }

      if (!appState.selectedElement || !state.hit) {
        return;
      }

      if (state.hit.type === "resize") {
        appState.mutatePoints(delta, state.hit.point);
        appState.zoomElement = newZoomElement(state.lastPointerCords);
      } else if (state.hit.type === "move") {
        appState.mutateElement(state.hit.element, delta);
      }
    };
  }

  function makePointerUpEvent(state: PointerDownState) {
    return () => {
      appState.tool = "selection";

      if (appState.editingElement) {
        appState.selectedElement = appState.editingElement;
        appState.editingElement = null;
      }

      appState.zoomElement = null;

      window.removeEventListener("pointermove", state.onMove!);
      window.removeEventListener("pointerup", state.onUp!);
    };
  }

  function createElement(pointerDownState: PointerDownState) {
    if (appState.tool === "selection") {
      appState.editingElement = null;
      appState.selectedElement = pointerDownState.hit?.element ?? null;
    } else if (appState.tool === "draw") {
      const shelf = newShelfElement(
        Array.from({ length: 4 }, () => [...pointerDownState.lastPointerCords]),
      );
      appState.selectedElement = null;
      appState.editingElement = shelf;
      appState.addElements(appState.editingElement);
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const state: PointerDownState = {
      lastPointerCords: pointFromEvent(e),
      onMove: null,
      onUp: null,
      hit: null,
    };

    state.hit = getHitAtPosition(state.lastPointerCords, appState.elements);
    createElement(state);

    const pointerMoveEventHandler = makePointerMoveEvent(state);
    const pointerUpEventHandler = makePointerUpEvent(state);

    state.onMove = pointerMoveEventHandler;
    state.onUp = pointerUpEventHandler;

    window.addEventListener("pointermove", pointerMoveEventHandler);
    window.addEventListener("pointerup", pointerUpEventHandler);
  }

  return (
    <canvas
      className={"absolute z-10"}
      ref={canvasRef}
      style={{
        touchAction: "none",
        width: appState.width,
        height: appState.height,
        background: "transparent",
      }}
      width={appState.width}
      height={appState.height}
      onPointerDown={handlePointerDown}
    />
  );
});
