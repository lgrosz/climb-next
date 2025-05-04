import { BasisSpline } from "@/lib/BasisSpline";
import { createContext, Dispatch, SetStateAction, useContext } from "react";

interface Size {
  width: number;
  height: number;
}

type Geometry =
  | BasisSpline;

export interface Line {
  climbId?: string,
  geometry: Geometry,
}

export interface TopoWorld {
  title: string,
  lines: Line[],
  size: Size,
}

interface TopoWorldContextType {
  world: TopoWorld,
  setWorld: Dispatch<SetStateAction<TopoWorld>>,
}

export const TopoWorldContext = createContext<TopoWorldContextType | undefined>(undefined);

export const useTopoWorld = () => {
  const context = useContext(TopoWorldContext);

  if (!context) {
    throw new Error("useTopoWorld must be used within a TopoWorldContext.Provider");
  }

  return context;
};
