import { createContext, Dispatch, useContext } from "react";

export interface TopoWorld {
  title: string,
}

interface TopoWorldContextType {
  world: TopoWorld,
  setWorld: Dispatch<TopoWorld>,
}

export const TopoWorldContext = createContext<TopoWorldContextType | undefined>(undefined);

export const useTopoWorld = () => {
  const context = useContext(TopoWorldContext);

  if (!context) {
    throw new Error("useTopoWorld must be used within a TopoWorldContext.Provider");
  }

  return context;
};
