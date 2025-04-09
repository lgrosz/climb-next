import PropertyInput from './PropertyInput';
import { useTopoEditor } from '../context/TopoEditorContext';

export default function PropertiesPanel() {
  const { title, setTitle } = useTopoEditor();

  return (
    <div className="w-80 bg-white border-l p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <div className="space-y-4">
        <PropertyInput label="Title" value={title} onChange={setTitle} />
        {/* Add more PropertyInput components here as necessary */}
      </div>
    </div>
  );
}

