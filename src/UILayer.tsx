import { MousePointer, Square, Trash } from "lucide-react";
import { observer } from "mobx-react-lite";
import { PropsWithChildren } from "react";
import { useUIStateStore } from "./UIStateContext";

interface ToolbarButtonProps extends PropsWithChildren {
  onClick?: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
}

function ToolbarButton(props: ToolbarButtonProps) {
  return (
    <button
      className={`${props.isActive ? "bg-indigo-100" : "bg-white"}`
        + " p-2 rounded-md hover:bg-indigo-50" + (props.isDisabled ? " opacity-50" : "")}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

export const Toolbar = observer(function Toolbar() {
  const uiStore = useUIStateStore();

  return (
    <div className={"flex items-center justify-center gap-4"}>
      <div className={"bg-white flex shadow-sm border border-slate-200 p-1 gap-1 rounded-md pointer-events-auto z-20"}>
        <ToolbarButton
          isDisabled={!uiStore.selectedElement}
          onClick={() => {
            uiStore.deleteCurrentElement();
          }}
        >
          <Trash />
        </ToolbarButton>
        <ToolbarButton
          isActive={uiStore.tool === "selection"}
          onClick={() => {
            uiStore.tool = "selection";
          }}
        >
          <MousePointer fill={uiStore.tool === "selection" ? "black" : "white"} />
        </ToolbarButton>
        <ToolbarButton
          isActive={uiStore.tool === "draw"}
          onClick={() => {
            uiStore.tool = "draw";
          }}
        >
          <Square fill={uiStore.tool === "draw" ? "black" : "white"} />
        </ToolbarButton>
      </div>
    </div>
  );
});

export const Zoom = observer(function Zoom() {
  return (
    <div className={"fixed bottom-10 left-10 flex gap-4"}>
      <button>+</button>
      <button>-</button>
    </div>
  );
});

export const UILayer = observer(function UILayer() {
  return (
    <div className={"absolute z-20 w-full h-full pointer-events-none"}>
      <div className={"absolute pointer-events-none p-4 bottom-0 top-0 left-0 right-0"}>
        <Toolbar />
      </div>
    </div>
  );
});
