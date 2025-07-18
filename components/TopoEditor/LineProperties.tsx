import { ChangeEvent, useCallback } from "react";
import { Line } from "../context/TopoWorld";
import SplineProperties from "./SplineProperties";

export default function LineProperties(
  {
    line,
    availableClimbs,
    onChange,
  } : {
    line: Line,
    availableClimbs: { id: string, name: string }[],
    onChange: (line: Line) => void,
  }
) {
  const updateSpline = useCallback((changes: Partial<{
    control: [number, number][],
    degree: number,
    knots: number[],
  }>) => {
    onChange({ ...line, geometry: { ...line.geometry, ...changes } });
  }, [line, onChange]);

  const updateClimb = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...line, climbId: e.target.value || undefined });
  }, [line, onChange]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <h4>Line</h4>
      </div>
      <h5>References</h5>
      <div>
        <select onChange={updateClimb}>
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
          control={line.geometry.control}
          degree={line.geometry.degree}
          knots={line.geometry.knots}
          onChange={updateSpline}
        />
      </div>
    </div>
  );
}

