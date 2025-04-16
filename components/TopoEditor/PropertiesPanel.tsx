import PropertyInput from './PropertyInput';
import ClimbProperties from './ClimbProperties';
import { useTopoWorld } from '../context/TopoWorld';
import { useTopoSession } from '../context/TopoSession';

export default function PropertiesPanel() {
  const { world, setWorld } = useTopoWorld();
  const { availableClimbs } = useTopoSession();

  return (
    <div className="w-80 bg-white border-l p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <div className="space-y-4">
        <PropertyInput
          label="Title"
          value={world.title}
          onChange={e => setWorld({ ...world, title: e.target.value })}
        />
        <h3 className="text-lg font-semibold mb-4">Climbs</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const climbId = formData.get("climb");
            const climb = availableClimbs.find((c) => c.id === climbId);
            if (!climb) return;
            setWorld({ ...world, climbs: [...world.climbs, { ...climb } ] })
          }}
        >
          <select name="climb">
          {availableClimbs.map(({ id, name }) => (
            <option key={`climb-${id}`} value={id}>{name}</option>
          ))}
          </select>
          <button>
            Add climb
          </button>
        </form>
        <div>
          {world.climbs.map(climb => (
            <ClimbProperties key={climb.id} id={climb.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

