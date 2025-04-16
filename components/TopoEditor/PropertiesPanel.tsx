import PropertyInput from './PropertyInput';
import { useTopoWorld } from '../context/TopoWorld';

export default function PropertiesPanel() {
  const { world, setWorld } = useTopoWorld();

  return (
    <div className="w-80 bg-white border-l p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <div className="space-y-4">
        <PropertyInput
          label="Title"
          value={world.title}
          onChange={e => setWorld({ ...world, title: e.target.value })}
        />
      </div>
    </div>
  );
}

