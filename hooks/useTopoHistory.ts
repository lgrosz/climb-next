import { ActionDispatch, useCallback, useState } from "react";
import { TopoWorldAction } from "@/components/context/TopoWorld";

export interface TopoChange {
  action: TopoWorldAction;
}

export function useTopoHistory({
  dispatch,
}: {
  dispatch: ActionDispatch<[TopoWorldAction]>;
}): [ActionDispatch<[TopoWorldAction]>, TopoChange[]] {
  const [changes, setChanges] = useState<TopoChange[]>([]);

  const redispatch = useCallback((action: TopoWorldAction) => {
    const change = { action };

    setChanges(prev => {
      return [...prev, change]
    });

    dispatch(action);
  }, [dispatch]);

  return [
    redispatch,
    changes,
  ];
}

