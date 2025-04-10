import PropertyInput from './PropertyInput';
import { SplineReducerActionType, useTopoEditor } from '../context/TopoEditorContext';
import { BasisSpline } from '@/lib/BasisSpline';
import { useEffect } from 'react';

export default function PropertiesPanel() {
  const {
    title,
    setTitle,
    splines,
    setSplines,
  } = useTopoEditor();

  const addSpline = () => {
    setSplines({
      type: SplineReducerActionType.Add,
      spline: new BasisSpline,
    })
  }

  useEffect(() => {
    console.log('splines changed', splines);
  }, [splines]);

  return (
    <div className="w-80 bg-white border-l p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <div className="space-y-4">
        <PropertyInput label="Title" value={title} onChange={setTitle} />
        { /* TODO I'd rather have a context menu to add a spline that would start some interactive spline creator */}
        <button onClick={addSpline}>Add spline</button>
      </div>
    </div>
  );
}

