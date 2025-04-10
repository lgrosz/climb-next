import PropertyInput from './PropertyInput';
import { SplineReducerActionType, useTopoEditor } from '../context/TopoEditorContext';
import { BasisSpline } from '@/lib/BasisSpline';

export default function PropertiesPanel() {
  const {
    title,
    setTitle,
    splines,
    setSplines,
    activeSplineIndex,
    setActiveSplineIndex,
  } = useTopoEditor();

  const addSpline = () => {
    setSplines({
      type: SplineReducerActionType.Add,
      spline: new BasisSpline,
    })
  }

  return (
    <div className="w-80 bg-white border-l p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <div className="space-y-4">
        <PropertyInput label="Title" value={title} onChange={setTitle} />
        { /* TODO I'd rather have a context menu to add a spline that would start some interactive spline creator */}
        <button onClick={addSpline}>Add spline</button>
        <div className="mt-4">
          <h3 className="font-medium mb-2">Splines</h3>
          <div role="radiogroup" className="space-y-1">
            {splines.map((_, index) => (
              <label
                key={`spline-${index}`}
                className="flex items-center space-x-2 cursor-pointer p-1 rounded"
              >
                <input
                  type="radio"
                  checked={activeSplineIndex === index}
                  onChange={() => setActiveSplineIndex(index)}
                />
                <span>Spline {index + 1}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

