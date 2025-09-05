"use client";

import { TopoSessionProvider, useTopoSession } from "@/components/context/TopoSession";
import { TopoWorld, TopoWorldProvider } from "@/components/context/TopoWorld";
import TopoEditor from "@/components/TopoEditor/TopoEditor";
import { TopoChange } from "@/hooks/useTopoHistory";
import { addFeature, assignClimb, removeFeature, title, updateGeometry } from "@/topos/actions";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";

function EditTopoClientInner({
  id,
  availableClimbs,
}: {
  id: string;
  availableClimbs: { id: string; name: string }[];
}) {
  const { changes } = useTopoSession();

  const [showConfirm, setShowConfirm] = useState(false);
  const [reducedChanges, setReducedChanges] = useState<TopoChange[]>([]);

  const changeToAction = useCallback((change: TopoChange) => {
    const action = change.action;

    const noApply = async () => { console.log("Will not apply", change) };

    switch (action.type) {
      case "title":
        return () => title(id, action.title)
      case "line":
        const subAction = action.action;

        switch (subAction.type) {
          case "add":
            const climbId = subAction.climbId;
            if (!climbId) return noApply;

            return () => addFeature(id, {
              type: "path",
              climbId,
              geometry: subAction.geometry
            })
          case "assign-climb":
            return () => assignClimb(id, action.id, subAction.id)
          case "update-geometry":
            // Cannot deal with this right now
            const geom = subAction.geometry;
            if (typeof geom === "function") {
              return noApply;
            }

            return () => updateGeometry(id, action.id, {
              points: geom.points ?? [],
              knots: geom.knots ?? [],
              degree: geom.degree ?? 1,
            })
          case "remove":
            return () => removeFeature(id, action.id);
        }
    }

    return noApply;
  }, [id]);

  const finish = useCallback(async () => {
    // NOTE the ordering of the reducer rules may matter and it is important
    // that their operations are well-tested and though about thoroughly..
    const reduced = [
      squashClimbAssign,
      squashClimbGeometryUpdate,
      keepLatestTitle,
      keepLatestClimbAssignment,
      keepLatestPathGeometryUpdate,
      removeAllLineChangesForRemovedLine,
    ].reduce((acc, rule) => rule.apply(acc), changes);

    setReducedChanges(reduced);
    setShowConfirm(true);
  }, [changes]);

  const applyChanges = useCallback(async () => {
    const actions = reducedChanges.map(changeToAction);
    for (const action of actions) {
      await action();
    }
    setShowConfirm(false);
  }, [reducedChanges, changeToAction]);

  const cancelChanges = () => {
    setShowConfirm(false);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <TopoEditor onFinish={finish} />
      {showConfirm && (
        <ConfirmChangesModal
        changes={reducedChanges}
        availableClimbs={availableClimbs}
        onConfirm={applyChanges}
        onCancel={cancelChanges}
        />
      )}
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
        <EditTopoClientInner
          id={id}
          availableClimbs={availableClimbs}
        />
      </TopoSessionProvider>
    </TopoWorldProvider>
  );
}

function ConfirmChangesModal({
  changes,
  availableClimbs,
  onConfirm,
  onCancel,
}: {
  changes: TopoChange[];
  availableClimbs: { id: string; name: string }[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const renderChangeDescription = (change: TopoChange) => {
    const action = change.action;
    switch (action.type) {
      case "title":
        return `Change topo title to "${action.title}"`;
      case "line": {
        const sub = action.action;
        switch (sub.type) {
          case "add": {
            const climbName = availableClimbs.find(c => c.id === sub.climbId)?.name ?? "unknown climb";
            return `Add path linked to climb "${climbName}"`;
          }
          case "assign-climb": {
            const climbName = availableClimbs.find(c => c.id === sub.id)?.name ?? "unknown climb";
            return `Assign climb "${climbName}" to path ${action.id}`;
          }
          case "update-geometry":
            return `Update geometry of path ${action.id}`;
          case "remove":
            return `Remove path ${action.id}`;
          default:
            return `Unknown line action`;
        }
      }
      default:
        return `Unknown action type`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div className="bg-white rounded p-4 max-w-lg w-full max-h-[80vh] overflow-auto">
        <h2 className="text-lg font-bold mb-4">Confirm Changes</h2>
          <ul className="mb-4 list-disc list-inside space-y-1">
          {changes.map((change, i) => (
            <li key={i}>{renderChangeDescription(change)}</li>
          ))}
          </ul>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
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

const keepLatestClimbAssignment: ChangeReducerRule = {
  apply: (changes) => changes
    .reduce<TopoChange[]>((acc, change) => {
      const action = change.action;

      if (
        action.type === "line" &&
        action.action.type === "assign-climb"
      ) {
        return [...acc.filter(c =>
          c.action.type !== "line" ||
          c.action.id !== action.id ||
          c.action.action.type !== "assign-climb"
        ), change];
      }

      return [...acc, change];
    }, []),
}

const keepLatestPathGeometryUpdate: ChangeReducerRule = {
  apply: (changes) => changes
    .reduce<TopoChange[]>((acc, change) => {
      const action = change.action;

      if (
        action.type === "line" &&
        action.action.type === "update-geometry"
      ) {
        return [...acc.filter(c =>
          c.action.type !== "line" ||
          c.action.id !== action.id ||
          c.action.action.type !== "update-geometry"
        ), change];
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
          c.action.type === "line" &&
          c.action.id === featureId &&
          c.action.action.type === "add"
        );

        if (index !== -1) {
          const existing = result[index];

          if (existing.action.type !== "line" || existing.action.action.type !== "add") {
            continue;
          }

          result[index] = {
            ...existing,
            action: {
              ...existing.action,
              action: {
                ...existing.action.action,
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

const squashClimbGeometryUpdate: ChangeReducerRule = {
  apply: (changes: TopoChange[]) => {
    const result: TopoChange[] = [];

    for (const change of changes) {
      if (
        change.action.type === "line" &&
        change.action.action.type === "update-geometry"
      ) {
        const { id: featureId, action: { geometry } } = change.action;

        const index = result.findIndex(c =>
          c.action.type === "line" &&
          c.action.id === featureId &&
          c.action.action.type === "add"
        );

        if (index !== -1) {
          const existing = result[index];

          if (existing.action.type !== "line" || existing.action.action.type !== "add") {
            continue;
          }

          result[index] = {
            ...existing,
            action: {
              ...existing.action,
              action: {
                ...existing.action.action,
                geometry: {
                  ...existing.action.action.geometry,
                  ...geometry
                },
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

const removeAllLineChangesForRemovedLine: ChangeReducerRule = {
    apply: function(changes: TopoChange[]): TopoChange[] {
        const newChanges: TopoChange[] = [];

        // TODO can do memoization to avoid needing to `.some` so often

        for (const change of changes) {
          const action = change.action;

          if (action.type === "line") {
            const subAction = action.action;

            if (subAction.type === "remove") {
              const isObselete = changes.some(c =>
                c.action.type === "line" &&
                c.action.id === action.id &&
                c.action.action.type === "add"
              );

              if (isObselete) continue;
            } else {
              const isObselete = changes.some(c =>
                c.action.type === "line" &&
                c.action.id === action.id &&
                c.action.action.type === "remove"
              );

              if (isObselete) continue;
            }
          }

          newChanges.push(change);
        }

        return newChanges;
    }
}

export const __internal = {
  keepLatestTitle,
  keepLatestClimbAssignment,
  squashClimbAssign,
  removeAllLineChangesForRemovedLine,
};
