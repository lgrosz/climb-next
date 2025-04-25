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
  type: "click" | "dblclick" | "contextmenu" | "mousemove"
  x: number
  y: number
}

interface CancelEvent extends Event {
  type: "cancel";
}

export type SessionEvent = CursorEvent | CancelEvent;

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
}

export const TopoSessionContext = createContext<TopoSessionContextType | undefined>(undefined);

export const useTopoSession = () => {
  const context = useContext(TopoSessionContext);

  if (!context) {
    throw new Error("useTopoSession must be used within a TopoSessionContext.Provider");
  }

  return context;
};
