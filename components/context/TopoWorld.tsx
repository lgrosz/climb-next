import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

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

interface BasisSpline {
  points: [number, number][];
  knots: number[];
  degree: number;
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

export const TopoWorldContext = createContext<TopoWorld | undefined>(undefined);

export const TopoWorldDispatchContext = createContext<Dispatch<SetStateAction<TopoWorld>> | undefined>(undefined);

export function TopoWorldProvider({
  initial,
  children
}: {
  initial?: TopoWorld
  children: React.ReactNode
}) {
  const [world, setWorld] = useState<TopoWorld>(initial ?? {
    title: "",
    lines: [],
    images: [],
    size: { width: 4000, height: 3000 },
  });

  return (
    <TopoWorldContext value={world}>
      <TopoWorldDispatchContext value={setWorld}>
        { children }
      </TopoWorldDispatchContext>
    </TopoWorldContext>
  )
}

export const useTopoWorld = () => {
  const context =  useContext(TopoWorldContext);

  if (!context) {
    throw new Error("useTopoWorld must be used within a TopoWorldContext provider");
  }

  return context;
};

export const useTopoWorldDispatch = () => {
  const context = useContext(TopoWorldDispatchContext);

  if (!context) {
    throw new Error("useTopoWorldDispatch must be used within a TopoWorldDispatchContext provider");
  }

  return context;
};
