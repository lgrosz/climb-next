'use client';

import Header from './Header';
import CanvasArea from './CanvasArea';
import PropertiesPanel from './PropertiesPanel';
import { TopoWorld, TopoWorldContext } from '../context/TopoWorld';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SessionEvent, TopoSessionContext } from '../context/TopoSession';
import { Tool, TransformObjects } from '@/lib/tools';
import { Selection } from '@/lib/tools/Select';
import { Selection as SessionSelection } from '../context/TopoSession';
import { BasisSpline } from '@/lib/BasisSpline';

function isPointOnBasisSpline(
  spline: BasisSpline,
  point: [number, number],
  tolerance: number = 5
): boolean {
  const samples = spline.sample();
  const [px, py] = point;
  const toleranceSq = tolerance * tolerance;

  for (const [sx, sy] of samples) {
    const dx = sx - px;
    const dy = sy - py;
    const distSq = dx * dx + dy * dy;
    if (distSq <= toleranceSq) {
      return true;
    }
  }

  return false;
}

function boxContains(
  container: [[number, number], [number, number]],
  contained: [[number, number], [number, number]]
) {
  const [containerMin, containerMax] = container;
  const [containedMin, containedMax] = contained;

  return (
    containerMin[0] <= containedMin[0] &&
    containerMin[1] <= containedMin[1] &&
    containerMax[0] >= containedMax[0] &&
    containerMax[1] >= containedMax[1]
  );
}

export default function TopoEditor(
  {
    availableClimbs
  }: {
    availableClimbs: {
      id: string,
      name: string,
    }[]
  }
) {
  const [world, setWorld] = useState<TopoWorld>({
    title: "",
    climbs: [],
  });
  const worldRef = useRef(world);

  const [tool, setTool] = useState<Tool | null>(null);

  const [selection, setSelection] = useState<SessionSelection>({ climbs: [] });
  const selectionRef = useRef(selection);

  // keep refs up-to-date, this is necessary for methods being passed
  // to tools..
  useEffect(() => {
    worldRef.current = world;
  }, [world]);

  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  const dispatch = useCallback((e: SessionEvent) => {
    if (tool?.handle(e)) {
      return true;
    }

    return false;
  }, [tool]);

  const onSelect = useCallback((selection: Selection) => {
    const newSelection: SessionSelection = { climbs: [] };

    worldRef.current.climbs.forEach(climb => {
      climb.geometries.forEach((geometry, index) => {
        if (selection.type === "point" && isPointOnBasisSpline(geometry, selection.data)) {
          // TODO this should only select the first one
          newSelection.climbs.push({ id: climb.id, geometries: [{ index }] });
        }

        if (selection.type === "box" && boxContains(selection.data, geometry.bounds())) {
          newSelection.climbs.push({ id: climb.id, geometries: [{ index }] });
        }
      });
    });

    setSelection(newSelection);

    // TODO
    // - selection.merge determines if the selection should be merged instead of replaced
  }, []);

  const selectionHitTest = useCallback((point: [number, number]) => {
    for (const sClimb of selectionRef.current.climbs) {
      const climb = worldRef.current.climbs.find(c => c.id === sClimb.id);
      if (!climb) continue;

      for (const { index } of sClimb.geometries) {
        const geometry = climb.geometries.at(index);
        if (!geometry) continue;

        if (isPointOnBasisSpline(geometry, point)) {
          return true;
        }
      }
    }

    return false;
  }, []);

  const onTransform = useCallback((offset: [number, number]) => {
    setWorld(prev => ({
      ...prev,
      climbs: prev.climbs.map(climb => {
        const sClimb = selectionRef.current.climbs.find(c => c.id === climb.id);
        if (!sClimb) return climb;

        return {
          ...climb,
          geometries: climb.geometries.map((geom, i) => {
            const sGeom = sClimb.geometries.find(g => g.index === i);
            if (!sGeom) return geom;

            const controls: [number, number][] = geom.control.map(control => {
              return [control[0] + offset[0], control[1] + offset[1]];
            });

            return new BasisSpline(controls, geom.degree, geom.knots);
          })
        }
      }),
    }));
  }, []);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "s") {
        setTool(new TransformObjects(selectionHitTest, onSelect, onTransform));
        e.stopPropagation();
        e.preventDefault();
      }

      if (e.key === "Escape") {
        if (tool) {
          setTool(null);
          e.stopPropagation();
          e.preventDefault();
        }
      }
    }

    addEventListener("keydown", handle);

    return () => {
      removeEventListener("keydown", handle);
    }
  }, [onSelect, tool, onTransform, selectionHitTest]);

  // TODO I can either define the interaction between the session and the world
  // here, or I can do so within the session by defining a custom "provider"
  // component. Doing so would reduce the overhead of creating another
  // World->Session combination down the line, but could mask the granularity of
  // doing so based on the context they're used.

  return (
    <TopoWorldContext.Provider
      value={{
        world,
        setWorld
      }}>
      <TopoSessionContext.Provider
        value={{
          availableClimbs,
          tool,
          setTool,
          dispatch,
          selection,
          setSelection,
        }}>
        <div className="w-full h-full flex flex-col bg-white">
          <Header />
          <div className="flex-1 flex overflow-hidden p-4">
            <CanvasArea />
            <PropertiesPanel />
          </div>
        </div>
      </TopoSessionContext.Provider>
    </TopoWorldContext.Provider>
  );
}

