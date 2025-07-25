import { Tool } from "@/lib/tools";
import { ActionDispatch, createContext, Dispatch, SetStateAction, useCallback, useContext, useState } from "react";
import { TopoWorldAction, useTopoWorldDispatch } from "./TopoWorld";

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
  index: number;
  nodes?: NodeSelection[];
}

interface LineSelection {
  geometry: GeometrySelection;
}

export interface Selection {
  // TODO TypeScript thinks that _every_ string is valid with this typing
  lines: Record<number, LineSelection>;
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
  const dispatchWorld = useTopoWorldDispatch();

  const dispatch = useCallback((e: SessionEvent) => {
    if (tool?.handle(e)) {
      return true;
    }

    return false;
  }, [tool]);

  const [selection, setSelection] = useState<Selection>({ lines: { } });

  return (
    <TopoSessionContext value={{
      availableClimbs,
      tool,
      setTool,
      dispatch,
      selection,
      setSelection,
      dispatchWorld,
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
