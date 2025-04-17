import { CreateSplineTool } from "@/lib/tools";
import { createContext, Dispatch, SetStateAction, useContext } from "react";

interface Climb {
  id: string,
  name: string,
}

interface TopoSessionContextType {
  /**
   * Climbs that are available in the session context
   */
  availableClimbs: Climb[],

  /**
   * The active tool
   */
  tool: CreateSplineTool | null,

  /**
   * Set the active tool
   */
  setTool: Dispatch<SetStateAction<CreateSplineTool | null>>;
}

export const TopoSessionContext = createContext<TopoSessionContextType | undefined>(undefined);

export const useTopoSession = () => {
  const context = useContext(TopoSessionContext);

  if (!context) {
    throw new Error("useTopoSession must be used within a TopoSessionContext.Provider");
  }

  return context;
};
