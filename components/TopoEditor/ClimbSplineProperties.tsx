"use client";

import { useCallback } from "react";
import { useTopoWorld } from "../context/TopoWorld";
import { BasisSpline } from "@/lib/BasisSpline";

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

  const updateDegree = useCallback((degree: number) => {
    const climb = world.climbs.find(climb => climb.id === climbId);
    const spline = climb?.geometries.at(index);

    if (!spline) return;

    let updated;
    try {
      updated = new BasisSpline(spline.control, degree);
    } catch {
      return;
    }

    setWorld({
      ...world,
      climbs: world.climbs.map(climb => {
        if (climb.id !== climbId) return climb;

        return {
          ...climb,
          geometries: [
            ...climb.geometries.slice(0, index),
            updated,
            ...climb.geometries.slice(index + 1),
          ]
        }
      }),
    })

  }, [climbId, index, world, setWorld]);

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
      <div className="flex items-center space-x-2">
        <span className="text-sm">Degree</span>
        <input
          type="number"
          className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
          value={spline.degree}
          min={1}
          max={spline.control.length - 1}
          onChange={(e) => updateDegree(parseInt(e.target.value))}
        />
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
