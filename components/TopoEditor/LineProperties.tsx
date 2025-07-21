import { useCallback } from "react";
import { Line } from "../context/TopoWorld";
import SplineProperties from "./SplineProperties";

export default function LineProperties(
  {
    line,
    availableClimbs,
    onClimbChanged,
    onGeometryChanged,
  } : {
    line: Line,
    availableClimbs: { id: string, name: string }[],
    onClimbChanged: (id: string) => void,
    onGeometryChanged: (geometry: Line["geometry"]) => void,
  }
) {
  const updateSpline = useCallback((changes: Partial<{
    points: [number, number][],
    degree: number,
    knots: number[],
  }>) => {
    onGeometryChanged({ ...line.geometry, ...changes });
  }, [line, onGeometryChanged]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <h4>Line</h4>
      </div>
      <h5>References</h5>
      <div>
        <select
          defaultValue={line.climbId ?? ""}
          onChange={e => onClimbChanged(e.target.value)}
        >
          <option value="">
            Select a climb
          </option>
          {availableClimbs.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <h5>Geometry</h5>
      <div>
        <SplineProperties
          points={line.geometry.points}
          degree={line.geometry.degree}
          knots={line.geometry.knots}
          onChange={updateSpline}
        />
      </div>
    </div>
  );
}

