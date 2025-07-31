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
    // NOTE the ordering of the reducer rules may matter and it is important
    // that their operations are well-tested and though about thoroughly..
    const reducedChanges = [
      squashClimbAssign,
      keepLatestTitle,
    ].reduce((acc, rule) => rule.apply(acc), changes)

    const actions = reducedChanges.map(changeToAction);

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

type ChangeReducerRule = {
  apply: ((_: TopoChange[]) => TopoChange[]),
};

const keepLatestTitle: ChangeReducerRule = {
  apply: (changes) => changes
    .reduce<TopoChange[]>((acc, change) => {
      if (change.action.type === "title") {
        return [...acc.filter(c => c.action.type !== "title"), change];
      }

      return [...acc, change];
    }, []),
}

const squashClimbAssign: ChangeReducerRule = {
  apply: (changes: TopoChange[]) => {
    const result: TopoChange[] = [];

    for (const change of changes) {
      if (
        change.action.type === "line" &&
        change.action.action.type === "assign-climb"
      ) {
        const { id: featureId, action: { id: climbId } } = change.action;

        const index = result.findIndex(c =>
          c.action.type === "add-line" &&
          c.action.line.featureId === featureId
        );

        if (index !== -1) {
          const existing = result[index];

          if (existing.action.type !== "add-line") {
            continue;
          }

          result[index] = {
            ...existing,
            action: {
              ...existing.action,
              line: {
                ...existing.action.line,
                climbId,
              }
            }
          };

          continue;
        }
      }

      // Otherwise, just add the change
      result.push(change);
    }

    return result;
  }
};

export const __internal = { keepLatestTitle, squashClimbAssign };
