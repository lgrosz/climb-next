import PropertyInput from './PropertyInput';
import { Line, useTopoWorld } from '../context/TopoWorld';
import LineProperties from './LineProperties';
import { useMemo } from 'react';
import { useTopoSession } from '../context/TopoSession';
import { useFinishTopoEditor } from './Contexts';

export default function PropertiesPanel() {
  const world = useTopoWorld();
  const { availableClimbs, dispatchWorld } = useTopoSession();
  const finish = useFinishTopoEditor()

  const climbAtIndexChanged = useMemo(() => {
    return world.lines.map((_, index) =>
      (id: string) => {
        dispatchWorld({
          type: "line",
          index: index,
          action: {
            type: "assign-climb",
            id,
          }
        });
      }
    );
  }, [world, dispatchWorld]);

  const geometryAtIndexChanged = useMemo(() => {
    return world.lines.map((_, index) =>
      (geometry: Line["geometry"]) => {
        dispatchWorld({
          type: "line",
          index: index,
          action: {
            type: "update-geometry",
            geometry,
          }
        });
      }
    );
  }, [world, dispatchWorld]);

  return (
    <div className="w-80 bg-white border-l p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <div className="space-y-4">
        <PropertyInput
          label="Title"
          value={world.title}
          onChange={e => dispatchWorld({ type: "title", title: e.target.value })}
        />
        <h3 className="text-lg font-semibold mb-4">Lines</h3>
        <div>
          {world.lines.map((line, index) => (
            <LineProperties
              key={`line-${index}`}
              availableClimbs={availableClimbs}
              line={line}
              onClimbChanged={climbAtIndexChanged[index]}
              onGeometryChanged={geometryAtIndexChanged[index]}
            />
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <button
            disabled={!finish}
            onClick={finish}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

