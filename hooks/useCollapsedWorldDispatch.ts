import { ActionDispatch, useCallback, useEffect, useRef } from "react";
import { TopoWorld, TopoWorldAction } from "@/components/context/TopoWorld";

/// Collapses functional world-actions into serializable ones
export function useCollapsedWorldDispatch(
  dispatch: ActionDispatch<[TopoWorldAction]>,
  world: TopoWorld,
): [ActionDispatch<[TopoWorldAction]>] {
  const worldRef = useRef(world);

  useEffect(() => {
    worldRef.current = world;
  }, [world]);

  const redispatch = useCallback((action: TopoWorldAction) => {
    const collapsed = collapse(action, worldRef.current);
    dispatch(collapsed);
  }, [dispatch]);

  return [
    redispatch,
  ];
}

function collapse(action: TopoWorldAction, world: TopoWorld): TopoWorldAction {
  if (action.type === "line" && action.action.type === "update-geometry") {
    const { id, action: lineAction } = action;

    if (typeof lineAction.geometry === "function") {
      const line = world.lines.find(l => l.featureId === id);
      if (!line) {
        return action;
      }

      const resolvedGeometry = lineAction.geometry(line.geometry);
      return {
        ...action,
        action: {
          ...lineAction,
          geometry: {
            // TODO including unchanged geometry isn't this component's job
            ...line.geometry,
            ...resolvedGeometry,
          }
        }
      };
    }
  }

  return action;
}

