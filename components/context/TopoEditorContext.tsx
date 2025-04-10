import { BasisSpline } from "@/lib/BasisSpline";
import React, { createContext, useContext, useState, ReactNode, useReducer } from "react";

interface TopoEditorContextType {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  splines: BasisSpline[],
  setSplines: React.ActionDispatch<[action: SplineReducerAction]>,
  activeSplineIndex: number | null,
  setActiveSplineIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

const TopoEditorContext = createContext<TopoEditorContextType | undefined>(undefined);

export const useTopoEditor = () => {
  const context = useContext(TopoEditorContext);
  if (!context) {
    throw new Error("useTopoEditor must be used within a TopoEditorProvider");
  }
  return context;
};

interface TopoEditorProviderProps {
  children: ReactNode;
}

export enum SplineReducerActionType {
  Add,
  Remove,
  Update,
}

interface SplineReducerAddSpline {
  type: SplineReducerActionType.Add;
  spline: BasisSpline;
}

interface SplineReducerRemoveSpline {
  type: SplineReducerActionType.Remove;
  index: number;
}

interface SplineReducerUpdateSpline {
  type: SplineReducerActionType.Update;
  index: number;
  spline: BasisSpline;
}

export type SplineReducerAction =
  | SplineReducerAddSpline
  | SplineReducerRemoveSpline
  | SplineReducerUpdateSpline;

function splinesReducer(state: BasisSpline[], action: SplineReducerAction) {
  switch(action.type) {
    case SplineReducerActionType.Add:
      return [...state, action.spline];
    case SplineReducerActionType.Remove:
      return [...state.slice(0, action.index), ...state.slice(action.index + 1)]
    case SplineReducerActionType.Update:
      return [...state.slice(0, action.index), action.spline, ...state.slice(action.index + 1)]
  }
}

export const TopoEditorProvider = ({ children }: TopoEditorProviderProps) => {
  const [title, setTitle] = useState("");
  const [splines, setSplines] = useReducer(splinesReducer, []);
  const [activeSplineIndex, setActiveSplineIndex] = useState<number | null>(null);

  return (
    <TopoEditorContext.Provider
      value={
        {
          title,
          setTitle,
          splines,
          setSplines,
          activeSplineIndex,
          setActiveSplineIndex,
        }
      }
    >
      {children}
    </TopoEditorContext.Provider>
  );
};

