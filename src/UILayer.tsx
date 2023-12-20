import { MousePointer, Square, Trash } from "lucide-react";
import { observer } from "mobx-react-lite";
import { PropsWithChildren } from "react";
import { useAppState } from "./AppStateContext";
import { Zoom } from "./Zoom";

interface ToolbarButtonProps extends PropsWithChildren {
  onClick?: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
}

function ToolbarButton(props: ToolbarButtonProps) {
  return (
    <button
      className={`${props.isActive ? "bg-indigo-100" : "bg-white"}`
        + " p-2 rounded-md hover:bg-indigo-50" + " disabled:opacity-50"}
      onClick={props.onClick}
      disabled={props.isDisabled}
    >
      {props.children}
    </button>
  );
}

const tools = [{ name: "selection", Icon: MousePointer }, { name: "draw", Icon: Square }] as const;

export const Toolbar = observer(function Toolbar() {
  const appState = useAppState();

  return (
    <div className={"flex items-center justify-center gap-4"}>
      <div className={"bg-white flex shadow-sm border border-slate-200 p-1 gap-1 rounded-md pointer-events-auto z-20"}>
        <ToolbarButton
          isDisabled={!appState.selectedElement}
          onClick={() => {
            appState.removeCurrentElement();
          }}
        >
          <Trash />
        </ToolbarButton>
        {tools.map((tool) => (
          <ToolbarButton
            key={tool.name}
            isActive={appState.tool === tool.name}
            onClick={() => {
              appState.tool = tool.name;
            }}
          >
            <tool.Icon fill={appState.tool === tool.name ? "black" : "white"} />
          </ToolbarButton>
        ))}
      </div>
    </div>
  );
});

export const UILayer = observer(function UILayer() {
  return (
    <div className={"absolute z-20 w-full h-full pointer-events-none"}>
      <div className={"absolute pointer-events-none p-4 bottom-0 top-0 left-0 right-0"}>
        <Toolbar />
        <Zoom />
      </div>
    </div>
  );
});
