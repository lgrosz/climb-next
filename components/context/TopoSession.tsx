import { Tool } from "@/lib/tools";
import { ActionDispatch, createContext, Dispatch, SetStateAction, useCallback, useContext, useState } from "react";
import { TopoWorldAction, useTopoWorld, useTopoWorldDispatch } from "./TopoWorld";
import { TopoChange, useTopoHistory } from "@/hooks/useTopoHistory";
import { useCollapsedWorldDispatch } from "@/hooks/useCollapsedWorldDispatch";

interface Climb {
  id: string,
  name: string,
}

interface Event {
  type: string;
}

interface CursorEvent extends Event {
  type: "click" | "dblclick" | "contextmenu" | "mousemove" | "mousedown" | "mouseup"
  x: number
  y: number
  shiftKey: boolean
}

interface CancelEvent extends Event {
  type: "cancel";
}

export type SessionEvent = CursorEvent | CancelEvent;

interface NodeSelection {
  index: number,
}

interface GeometrySelection {
  nodes?: NodeSelection[];
}

interface LineSelection {
  id: string;
  geometry: GeometrySelection;
}

export interface Selection {
  lines: LineSelection[];
}

interface TopoSessionContextType {
  /**
   * Climbs that are available in the session context
   */
  availableClimbs: Climb[],

  /**
   * The active tool
   */
  tool: Tool | null,

  /**
   * Set the active tool
   */
  setTool: Dispatch<SetStateAction<Tool | null>>;

  /**
   * Dispatches event
   */
   dispatch: (event: SessionEvent) => boolean;

   /**
    * Currently selected objects and nodes
    */
   selection: Selection;

   /**
    * Set the current selection
    */
   setSelection: Dispatch<SetStateAction<Selection>>;

   /**
    * Dispatches a world action
    */
    dispatchWorld: ActionDispatch<[TopoWorldAction]>;

    /**
     * Changes during a session
     */
    changes: TopoChange[],
}

export const TopoSessionContext = createContext<TopoSessionContextType | undefined>(undefined);

// TODO feels bloated, need to really decide what belongs to the session..
export function TopoSessionProvider({
  availableClimbs,
  children,
}: {
  availableClimbs: Climb[],
  children: React.ReactNode,
}) {
  const [tool, setTool] = useState<Tool | null>(null);

  // TODO some sort of "middleware" pattern would probably be a better fit here
  const originalDispatchWorld = useTopoWorldDispatch();
  const [historicWorldDispatch, changes] = useTopoHistory({ dispatch: originalDispatchWorld });
  const world = useTopoWorld();
  const [collapsedWorldDispatch] = useCollapsedWorldDispatch(historicWorldDispatch, world);

  const dispatch = useCallback((e: SessionEvent) => {
    if (tool?.handle(e)) {
      return true;
    }

    return false;
  }, [tool]);

  const [selection, setSelection] = useState<Selection>({ lines: [ ] });

  return (
    <TopoSessionContext value={{
      availableClimbs,
      tool,
      setTool,
      dispatch,
      selection,
      setSelection,
      dispatchWorld: collapsedWorldDispatch,
      changes,
    }}>
      { children }
    </TopoSessionContext>
  );
}

export const useTopoSession = () => {
  const context = useContext(TopoSessionContext);

  if (!context) {
    throw new Error("useTopoSession must be used within a TopoSessionContext.Provider");
  }

  return context;
};
