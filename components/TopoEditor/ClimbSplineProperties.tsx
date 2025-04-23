"use client";

import { useTopoWorld } from "../context/TopoWorld";

export default function ClimbSplineProperties({
  climbId,
  index,
}: {
  climbId: string,
  index: number,
}) {
  const { world } = useTopoWorld();

  const climb = world.climbs.find(climb => climb.id === climbId);
  if (!climb) return;

  const spline = climb.geometries.at(index);
  if (!spline) return;

  return (
    <div>
      <h6>Spline { index + 1 }</h6>
    </div>
  );
}
