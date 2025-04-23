"use client";

import { useCallback } from "react";
import { useTopoWorld } from "../context/TopoWorld";

export default function ClimbSplineProperties({
  climbId,
  index,
}: {
  climbId: string,
  index: number,
}) {
  const { world, setWorld } = useTopoWorld();

  const remove = useCallback(() => {
    if (confirm("Remove geometry?")) {
      setWorld({
        ...world,
        climbs:world.climbs.map(climb => {
          if (climb.id !== climbId) return climb;

          return {
            ...climb,
            geometries: [
              ...climb.geometries.slice(0, index),
              ...climb.geometries.slice(index + 1),
            ]
          }
        }),
      });
    }
  }, [world, setWorld, climbId, index]);

  const climb = world.climbs.find(climb => climb.id === climbId);
  if (!climb) return;

  const spline = climb.geometries.at(index);
  if (!spline) return;

  return (
    <div>
      <div className="flex items-center gap-2">
        <h6>Spline { index + 1 }</h6>
        <button onClick={remove}>
          Remove
        </button>
      </div>
      <div className="space-y-1 text-sm font-medium">
        Degree {spline.degree}
      </div>
      <div className="space-y-1 text-sm">
        <div className="font-medium">Knots</div>
        <div className="break-all">{spline.knots.join(', ')}</div>
        <div className="flex items-center gap-2 mt-2">
          <span>Open:</span>
          <span>
            {spline.isOpen() ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Uniform:</span>
          <span>
            {spline.isUniform() ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </div>
  );
}
