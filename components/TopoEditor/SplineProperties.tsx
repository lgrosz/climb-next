import { BasisSpline } from "@/lib/BasisSpline";
import { ChangeEvent, useCallback } from "react";

export default function SplineProperties({
  spline,
  onChange,
}: {
  spline: BasisSpline;
  onChange: (spline: BasisSpline) => void;
}) {

  const updateDegree = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    // TODO Not passing knots because they depend on the degree, perhaps some
    // better logic can be ecapsulated in a static method of `BasisSpline`
    onChange(new BasisSpline(spline.control, parseInt(e.target.value)));
  }, [spline.control, onChange]);

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
          defaultValue={spline.degree}
          min={1}
          max={spline.control.length - 1}
          onChange={updateDegree}
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

