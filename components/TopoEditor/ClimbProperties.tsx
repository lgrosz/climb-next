'use client';

import { CreateSplineTool } from "@/lib/tools";
import { useTopoSession } from "../context/TopoSession";
import { useTopoWorld } from "../context/TopoWorld";
import { useCallback, useEffect, useRef } from "react";
import { BasisSpline } from "@/lib/BasisSpline";

export default function ClimbProperties({ id }: { id: string }) {
  const { world, setWorld } = useTopoWorld();
  const { tool, setTool } = useTopoSession();
  const addSplineTool = useRef(new CreateSplineTool);

  const name = world.climbs.find(climb => climb.id === id)?.name;
  const geometries = world.climbs.find(climb => climb.id === id)?.geometries;

  const addSplineGeometry = useCallback((spline: BasisSpline) => {
    setWorld(prev => ({
      ...prev,
      climbs: prev.climbs.map(climb => {
        if (climb.id !== id) return climb;

        return {
          ...climb,
          geometries: [...climb.geometries, spline],
        };
      }),
    }));
  }, [id, setWorld]);

  useEffect(() => {
    const tool = addSplineTool.current;
    tool.subscribe(addSplineGeometry);

    return () => {
      tool.unsubscribe(addSplineGeometry);
    }
  }, [addSplineGeometry]);

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
      <button
        disabled={tool instanceof CreateSplineTool}
        onClick={() => setTool(addSplineTool.current)}
      >
        Add spline
      </button>
      { tool instanceof CreateSplineTool &&
        <button
          disabled={!(tool instanceof CreateSplineTool)}
          onClick={() => setTool(null)}
        >
          Done
        </button>
      }
    </div>
  );
}
