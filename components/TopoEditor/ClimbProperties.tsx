'use client';

import { useTopoWorld } from "../context/TopoWorld";
import { useCallback } from "react";

export default function ClimbProperties({ id }: { id: string }) {
  const { world, setWorld } = useTopoWorld();

  const name = world.climbs.find(climb => climb.id === id)?.name;
  const geometries = world.climbs.find(climb => climb.id === id)?.geometries;

  const remove = useCallback(() => {
    if (confirm("Remove climb?")) {
      setWorld({
        ...world,
        climbs: world.climbs.filter(climb => climb.id != id)
      });
    }
  }, [setWorld, world, id]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <h4>{name}</h4>
        <button onClick={remove}>
          Remove
        </button>
      </div>
      <h5>Geometries</h5>
      <div>
      {geometries?.map((_, i) => (
        <div key={`climb-${id}-geom-${i}`}>
          Spline {i + 1}
        </div>
      ))}
      </div>
    </div>
  );
}
