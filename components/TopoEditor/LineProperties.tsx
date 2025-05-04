import { ChangeEvent, useCallback } from "react";
import { Line } from "../context/TopoWorld";
import SplineProperties from "./SplineProperties";
import { BasisSpline } from "@/lib/BasisSpline";

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
  const updateSpline = useCallback((spline: BasisSpline) => {
    onChange({ ...line, geometry: spline });
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
          spline={line.geometry}
          onChange={updateSpline}
        />
      </div>
    </div>
  );
}

