import useSpline from "@/hooks/useSpline";
import { BasisSpline } from "@/lib/BasisSpline";
import { ChangeEvent, useCallback } from "react";

export default function SplineProperties({
  points,
  degree,
  knots,
  onChange,
}: {
  points: [number, number][],
  degree: number,
  knots: number[],
  onChange: (changes: Partial<{
    points: [number, number][],
    degree: number,
    knots: number[],
  }>) => void;
}) {
  const [spline] = useSpline(points, degree, knots);

  const updateDegree = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const degree = parseInt(e.target.value);
    const knots = BasisSpline.openUniformKnots(points.length, degree);

    onChange({ degree, knots });
  }, [points.length, onChange]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <h6>Spline</h6>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm">Degree</span>
        <input
          type="number"
          className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
          defaultValue={degree}
          min={1}
          max={points.length - 1}
          onChange={updateDegree}
        />
      </div>
      <div className="space-y-1 text-sm">
        <div className="font-medium">Knots</div>
        <div className="break-all">{knots.join(', ')}</div>
        <div className="flex items-center gap-2 mt-2">
          <span>Open:</span>
          <span>
            {spline?.isOpen() ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Uniform:</span>
          <span>
            {spline?.isUniform() ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </div>
  );
}

