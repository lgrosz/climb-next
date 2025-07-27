/// Contexts for the topo editor, to avoid extraneous prop-drilling

import { createContext, ReactNode, useContext } from "react";

const FinishTopoEditorContext = createContext<(() => void) | undefined>(undefined);

export function FinishTopoEditorProvider({
  onFinish,
  children,
}: {
  onFinish?: () => void,
  children: ReactNode,
}) {
  return (
    <FinishTopoEditorContext value={onFinish}>
      { children }
    </FinishTopoEditorContext>
  );
}

export const useFinishTopoEditor = () => {
  return useContext(FinishTopoEditorContext);
}

