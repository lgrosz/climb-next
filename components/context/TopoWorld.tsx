import { BasisSpline } from "@/lib/BasisSpline";
import { createContext, Dispatch, SetStateAction, useContext } from "react";

interface Size {
  width: number;
  height: number;
}

interface Point2D {
  x: number;
  y: number;
}

interface Rect {
  min: Point2D;
  max: Point2D;
}

type Geometry =
  | BasisSpline;

export interface Line {
  climbId?: string,
  geometry: Geometry,
}

export interface Image {
  id: string,
  alt?: string,
  dest: Rect,
  source?: Rect,
};

export interface TopoWorld {
  title: string,
  images: Image[],
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
