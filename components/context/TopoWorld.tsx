import { ActionDispatch, createContext, useContext, useReducer } from "react";

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

interface Feature {
  featureId: string,
}

export interface Line extends Feature {
  climbId?: string,
  geometry: Geometry,
}

export interface Image extends Feature {
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

type BaseTopoWorldAction<T extends string> = {
  type: T,
}

// TODO remove this when nothing else uses it as it is sort of a catch-all and
// could be quite error prone with the deeply nested nature of `TopoWorld`
type SetTopoWorldAction = BaseTopoWorldAction<"set"> & {
  world: TopoWorld | ((prev: TopoWorld) => TopoWorld),
};

type TitleTopoWorldAction = BaseTopoWorldAction<"title"> & {
  title: string,
}

type AddLineTopoWorldAction = BaseTopoWorldAction<"add-line"> & {
  line: Line,
}

type BaseTopoWorldLineAction<T extends string> = {
  type: T,
};

type AssignClimbTopoWorldLineAction = BaseTopoWorldLineAction<"assign-climb"> & {
  id: string,
}

type UpdateGeometryTopoWorldLineAction = BaseTopoWorldLineAction<"update-geometry"> & {
  geometry: Partial<Geometry> | ((prev: Geometry) => Partial<Geometry>),
}

type RemoveTopoWorldLineAction = BaseTopoWorldLineAction<"remove"> & { };

type TopoWorldLineAction = BaseTopoWorldAction<"line"> & {
  index: number,
  action:
    | AssignClimbTopoWorldLineAction
    | UpdateGeometryTopoWorldLineAction
    | RemoveTopoWorldLineAction,
};

export type TopoWorldAction =
  | SetTopoWorldAction
  | TitleTopoWorldAction
  | TopoWorldLineAction
  | AddLineTopoWorldAction;

export const TopoWorldContext = createContext<TopoWorld | undefined>(undefined);

export const TopoWorldDispatchContext = createContext<ActionDispatch<[TopoWorldAction]> | undefined>(undefined);

export function TopoWorldProvider({
  initial,
  children
}: {
  initial?: TopoWorld
  children: React.ReactNode
}) {
  const [state, dispatch] = useReducer(reducer, initial ?? {
    title: "",
    lines: [],
    images: [],
    size: { width: 4000, height: 3000 },
  });

  return (
    <TopoWorldContext value={state}>
      <TopoWorldDispatchContext value={dispatch}>
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

function reducer(state: TopoWorld, action: TopoWorldAction) {
  switch (action.type) {
    case "set":
      return typeof action.world === "function" ?
        action.world(state) : { ...action.world };
    case "title":
      return { ...state, title: action.title };
    case "add-line":
      return { ...state, lines: [ ...state.lines, action.line ] };
    case "line":
      // TODO This basically a `Line`-reducer, can probably extract it as such
      const lineIndex = action.index;
      const lineAction = action.action;

      switch (lineAction.type) {
        case "assign-climb":
          return {
            ...state,
            lines: state.lines.map((l, i) =>
              i === lineIndex ? {
                ...l,
                climbId: lineAction.id
              } : l
            )
          };
        case "update-geometry":
          return {
            ...state,
            lines: state.lines.map((l, i) =>
              i === lineIndex ? {
                ...l,
                geometry: {
                  ...l.geometry,
                  ...(typeof lineAction.geometry === "function" ?
                      lineAction.geometry(l.geometry) : lineAction.geometry),
                }
              } : l
            )
          };
        case "remove":
          return {
            ...state,
            lines: state.lines.filter((_, i) => i !== lineIndex)
          }
      }
  }
}
