import { Tool } from "@/lib/tools";
import { createContext, Dispatch, SetStateAction, useContext } from "react";

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

interface GeometrySelection {
  index: number;
}

interface ClimbSelection {
  geometries: GeometrySelection[];
}

export interface Selection {
  // TODO TypeScript thinks that _every_ string is valid with this typing
  climbs: Record<string, ClimbSelection>;
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
}

export const TopoSessionContext = createContext<TopoSessionContextType | undefined>(undefined);

export const useTopoSession = () => {
  const context = useContext(TopoSessionContext);

  if (!context) {
    throw new Error("useTopoSession must be used within a TopoSessionContext.Provider");
  }

  return context;
};
