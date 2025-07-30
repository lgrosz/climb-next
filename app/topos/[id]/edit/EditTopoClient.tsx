"use client";

import { TopoSessionProvider, useTopoSession } from "@/components/context/TopoSession";
import { TopoWorld, TopoWorldProvider } from "@/components/context/TopoWorld";
import TopoEditor from "@/components/TopoEditor/TopoEditor";
import { TopoChange } from "@/hooks/useTopoHistory";
import { addFeature, title } from "@/topos/actions";
import { useParams } from "next/navigation";
import { useCallback } from "react";

function EditTopoClientInner({
  id,
}: {
  id: string,
}) {
  const { changes } = useTopoSession();

  const changeToAction = useCallback((change: TopoChange) => {
    const action = change.action;

    const noApply = async () => { console.log("Will not apply", change) };

    switch (action.type) {
      case "title":
        return () => title(id, action.title)
      case "add-line":
        const climbId = action.line.climbId;
        if (!climbId) return noApply;

        return () => addFeature(id, {
          type: "path",
          climbId,
          geometry: action.line.geometry
        })
    }

    return noApply;
  }, [id]);

  const finish = useCallback(async () => {
    const actions = changes
      .reduce(changeReducer, [])
      .map(changeToAction);

    for (const action of actions) {
      await action();
    }
  }, [changes, changeToAction]);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <TopoEditor onFinish={finish} />
    </div>
  );
}

export default function EditTopoClient({
    availableClimbs,
    world,
}: {
    availableClimbs: {
        id: string,
	name: string,
    }[],
    world: TopoWorld,
}) {
  const { id } = useParams<{ id: string }>();

  return (
    <TopoWorldProvider initial={world}>
      <TopoSessionProvider availableClimbs={availableClimbs} >
        <EditTopoClientInner id={id} />
      </TopoSessionProvider>
    </TopoWorldProvider>
  );
}

const changeReducer = (
  prev: TopoChange[],
  curr: TopoChange,
  ..._: [number, TopoChange[]]
) => {
  // Only keep the latest title action
  if (curr.action.type === "title") {
    return [...prev.filter(c => c.action.type !== "title"), curr];
  }

  if (curr.action.type === "line") {
    const { id, action: subAction } = curr.action;

    // Squash assign-climb into last add-line
    if (subAction.type === "assign-climb") {
      const shouldSquash = ((c: TopoChange) => c.action.type === "add-line" && c.action.line.featureId === id)
      const canSquash = prev.some(shouldSquash);

      if (canSquash) {
        return prev.map(c => {
          // TODO I wish I could use `shouldSquash` here
          if (c.action.type === "add-line" && c.action.line.featureId === id) {
            return {
              ...c,
              action: {
                ...c.action,
                line: {
                  ...c.action.line,
                  climbId: subAction.id
                }
              }
            }
          } else {
            return c;
          }
        });
      }
    }
  }

  return [...prev, curr];
}

export const __internal = { changeReducer };
