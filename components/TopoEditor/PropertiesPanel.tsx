import PropertyInput from './PropertyInput';
import { Line, useTopoWorld } from '../context/TopoWorld';
import LineProperties from './LineProperties';
import { useCallback, useMemo } from 'react';
import { useTopoSession } from '../context/TopoSession';
import { Image } from "@/components/context/TopoWorld";
import BackgroundProperties from './BackgroundProperties';

export default function PropertiesPanel() {
  const { world, setWorld } = useTopoWorld();
  const { availableClimbs, availableImages } = useTopoSession();

  const lineAtIndexChanged = useMemo(() => {
    return world.lines.map((_, index) =>
      (line: Line) => {
        const lines = [...world.lines];
        lines[index] = line;
        setWorld({ ...world, lines });
      }
    );
  }, [world, setWorld]);

  const backgroundChanged = useCallback((image: Image | null) => {
    setWorld({ ...world, background: image ?? undefined })
  }, [setWorld, world]);

  return (
    <div className="w-80 bg-white border-l p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <div className="space-y-4">
        <PropertyInput
          label="Title"
          value={world.title}
          onChange={e => setWorld({ ...world, title: e.target.value })}
        />
        <h3 className="text-lg font-semibold mb-4">Background</h3>
        <div>
          <BackgroundProperties
            value={world.background}
            availableImages={availableImages.map(({ id, alt }) => ({ id, alt: alt ?? "" }))}
            onChange={backgroundChanged}
          />
        </div>
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

