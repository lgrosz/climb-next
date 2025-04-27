import { useCallback } from "react";
import { Line } from "../context/TopoWorld";
import SplineProperties from "./SplineProperties";
import { BasisSpline } from "@/lib/BasisSpline";

export default function LineProperties(
  {
    line,
    onChange,
  } : {
    line: Line,
    onChange: (line: Line) => void,
  }
) {
  const updateSpline = useCallback((spline: BasisSpline) => {
    onChange({ ...line, geometry: spline });
  }, [line, onChange]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <h4>Line</h4>
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

