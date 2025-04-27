'use client';

import Header from './Header';
import CanvasArea from './CanvasArea';
import PropertiesPanel from './PropertiesPanel';
import { TopoWorld, TopoWorldContext } from '../context/TopoWorld';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SessionEvent, TopoSessionContext } from '../context/TopoSession';
import { Tool } from '@/lib/tools';
import { Selection, SelectionTool } from '@/lib/tools/Select';
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
  // keep refs up-to-date, this is necessary for methods being passed
  // to tools..
  useEffect(() => {
    worldRef.current = world;
  }, [world]);


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

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "s") {
        setTool(new SelectionTool(onSelect));
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
  }, [onSelect, tool]);

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

