import { reaction, toJS } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { detectElement } from "./detect";
import { drawElements } from "./draw";
import { newShelfFromTuples, ShelfElement } from "./Element";
import { useImageCache } from "./file";
import { PointTuple } from "./UIState";
import { useUIStateStore } from "./UIStateContext";

function pointFromEvent(e: Pick<PointerEvent, "clientX" | "clientY">): PointTuple {
  return [Math.round(e.clientX), Math.round(e.clientY)];
}

export interface CanvasProps {
  onChange: (elements: PointTuple[][]) => void;
}

interface PointerDownState {
  lastPointerCords: PointTuple;
  onMove: ((e: PointerEvent) => void) | null;
  onUp: (() => void) | null;
  move: { id: string };
  create: { id: string };
}

export const Canvas = observer(function Canvas(props: CanvasProps) {
  const uiStore = useUIStateStore();
  const imageCache = useImageCache();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const dispose = reaction(() => {
      const elements = toJS(uiStore.elements);
      const shelves = elements.filter((e): e is ShelfElement => e.type === "shelf").map((shelf) => {
        const points = uiStore.getShelfPoints(shelf.id);
        return points.map((point) => [point.x, point.y] as PointTuple);
      });
      return { elements, shelves, selectedElementId: uiStore.selectedElement?.id ?? null };
    }, ({ elements, selectedElementId, shelves }) => {
      props.onChange(shelves);
      drawElements({ canvas, elements, imageCache, selectedElementId });
    });
    return () => {
      dispose();
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

      if (state.create.id) {
        uiStore.drawShelfElement(state.create.id, point);
        return;
      }

      if (state.move.id) {
        uiStore.mutateElement(state.move.id, delta);
      }
    };
  }

  function makePointerUpEvent(state: PointerDownState) {
    return () => {
      uiStore.tool = "selection";
      if (state.create.id) {
        uiStore.selectedElement = uiStore.elementById.get(state.create.id) ?? null;
      }
      window.removeEventListener("pointermove", state.onMove!);
      window.removeEventListener("pointerup", state.onUp!);
    };
  }

  function handleDraw(pointerDownState: PointerDownState) {
    const elements = newShelfFromTuples(
      Array.from({ length: 4 }, () => pointerDownState.lastPointerCords),
    );
    uiStore.addElements(...elements);
    pointerDownState.create.id = elements[0].id;
  }

  function handleSelection(pointerDownState: PointerDownState) {
    const detected = detectElement(
      pointerDownState.lastPointerCords,
      uiStore.elements,
    );

    if (!detected || detected.type === "shelf") {
      uiStore.selectedElement = detected;
    }

    if (detected) {
      pointerDownState.move.id = detected.id;
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const state: PointerDownState = {
      lastPointerCords: pointFromEvent(e),
      onMove: null,
      onUp: null,
      create: { id: "" },
      move: { id: "" },
    };

    const pointerMoveEventHandler = makePointerMoveEvent(state);
    const pointerUpEventHandler = makePointerUpEvent(state);

    state.onMove = pointerMoveEventHandler;
    state.onUp = pointerUpEventHandler;

    if (uiStore.tool === "selection") {
      handleSelection(state);
    } else if (uiStore.tool === "draw") {
      handleDraw(state);
    }

    window.addEventListener("pointermove", pointerMoveEventHandler);
    window.addEventListener("pointerup", pointerUpEventHandler);
  }

  return (
    <canvas
      className={"absolute z-10"}
      ref={canvasRef}
      style={{
        width: uiStore.width,
        height: uiStore.height,
        background: "white",
      }}
      width={uiStore.width}
      height={uiStore.height}
      onPointerDown={handlePointerDown}
    >
      canvas
    </canvas>
  );
});
