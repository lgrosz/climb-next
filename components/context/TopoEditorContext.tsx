import React, { createContext, useContext, useState, ReactNode } from "react";

interface TopoEditorContextType {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
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

export const TopoEditorProvider = ({ children }: TopoEditorProviderProps) => {
  const [title, setTitle] = useState("");

  return (
    <TopoEditorContext.Provider value={{ title, setTitle }}>
      {children}
    </TopoEditorContext.Provider>
  );
};

