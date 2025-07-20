import PropertyInput from './PropertyInput';
import { Line, useTopoWorld, useTopoWorldDispatch } from '../context/TopoWorld';
import LineProperties from './LineProperties';
import { useMemo } from 'react';
import { useTopoSession } from '../context/TopoSession';

export default function PropertiesPanel() {
  const world = useTopoWorld();
  const dispatch = useTopoWorldDispatch();
  const { availableClimbs } = useTopoSession();

  const lineAtIndexChanged = useMemo(() => {
    return world.lines.map((_, index) =>
      (line: Line) => {
        const lines = [...world.lines];
        lines[index] = line;
        dispatch({ type: "set", world: { ...world, lines } });
      }
    );
  }, [world, dispatch]);


  return (
    <div className="w-80 bg-white border-l p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <div className="space-y-4">
        <PropertyInput
          label="Title"
          value={world.title}
          onChange={e => dispatch({ type: "title", title: e.target.value })}
        />
        <h3 className="text-lg font-semibold mb-4">Lines</h3>
        <div>
          {world.lines.map((line, index) => (
            <LineProperties
              key={`line-${index}`}
              availableClimbs={availableClimbs}
              line={line}
              onChange={lineAtIndexChanged[index]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

