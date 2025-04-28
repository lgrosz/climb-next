'use client';

import Header from './Header';
import CanvasArea from './CanvasArea';
import PropertiesPanel from './PropertiesPanel';
import { TopoWorld, TopoWorldContext } from '../context/TopoWorld';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SessionEvent, TopoSessionContext } from '../context/TopoSession';
import { EditPaths, Tool, TransformObjects } from '@/lib/tools';
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

function selectObjects(world: TopoWorld, selection: Selection) {
  const ret: SessionSelection = { climbs: {} };

  world.climbs.forEach(climb => {
    climb.geometries.forEach((geometry, index) => {
      if (selection.type === "point" && isPointOnBasisSpline(geometry, selection.data)) {
        ret.climbs[climb.id] = ({ geometries: [{ index }] });
      }

      if (selection.type === "box" && boxContains(selection.data, geometry.bounds())) {
        if (!ret.climbs[climb.id]) {
          ret.climbs[climb.id] = { geometries: [] };
        }

        ret.climbs[climb.id].geometries.push({ index });
      }
    });
  });

  return ret;
}

function pointIsOnPoint(
  p1: [number, number],
  p2: [number, number],
  tolerance: number = 5,
) {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  const toleranceSq = tolerance * tolerance;
  const distSq = dx * dx + dy * dy;

  return distSq <= toleranceSq;
}

function isNodeSelected(node: [number, number], selection: Selection) {
  if (selection.type === "point") {
    return pointIsOnPoint(selection.data, node);
  }

  if (selection.type === "box") {
    return boxContains(selection.data, [node, node]);
  }
}

function selectNodes(world: TopoWorld, sessionSelection: SessionSelection, selection: Selection) {
  const ret: SessionSelection = {
    climbs: Object.fromEntries(
      Object.entries(sessionSelection.climbs).map(([id, cs]) => {
        return [id, {
          geometries: cs.geometries.map(gs => {
            const geom = world.climbs.find(c => c.id === id)?.geometries.at(gs.index)

            if (!geom) return gs;

            const hitNodes = geom.control
              .map((node, nodeIndex) => {
                return isNodeSelected(node, selection) ? { index: nodeIndex } : null;
              })
              .filter(nodeSelection => nodeSelection !== null);

            return {
              ...gs,
              nodes: hitNodes,
            };
          })
        }]
      })
    )
  };

  return ret;
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

  const [selection, setSelection] = useState<SessionSelection>({ climbs: { } });
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
    setSelection(selectObjects(worldRef.current, selection));
  }, []);

  const selectionHitTest = useCallback((point: [number, number]) => {
    for (const [climbId, { geometries }] of Object.entries(selectionRef.current.climbs)) {
      const climb = worldRef.current.climbs.find(c => c.id === climbId);
      if (!climb) continue;

      for (const { index } of geometries) {
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
        const sClimb = selectionRef.current.climbs[climb.id];
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

  const onNodeSelect = useCallback((selection: Selection) => {
    const hasSelectedNodes = (s: SessionSelection) =>
      Object.values(s.climbs).some(climb =>
        climb.geometries.some(geom =>
          Array.isArray(geom.nodes) && geom.nodes.length > 0
        )
      );

    let sessionSelection: SessionSelection;

    if (Object.keys(selectionRef.current.climbs).length < 1) {
      sessionSelection = selectObjects(worldRef.current, selection);
    } else {
      sessionSelection = selectNodes(worldRef.current, selectionRef.current, selection);

      if (
        selection.type === "point" &&
        !hasSelectedNodes(selectionRef.current) &&
        !hasSelectedNodes(sessionSelection)
      ) {
        sessionSelection = { climbs: {} };
      }
    }

    setSelection(sessionSelection);
  }, []);

  const selectedNodeHitTest = useCallback((point: [number, number]) => {
    for (const [climbId, { geometries }] of Object.entries(selectionRef.current.climbs)) {
      const climb = worldRef.current.climbs.find(c => c.id === climbId);
      if (!climb) continue;

      for (const { index: gi, nodes } of geometries) {
        const geometry = climb.geometries.at(gi);
        if (!geometry || !nodes) continue;

        for (const { index: ni }  of nodes) {
          const node = geometry.control.at(ni);
          if (!node) continue;

          if (pointIsOnPoint(node, point)) {
            return true;
          }
        }
      }
    }

    return false;
  }, []);

  const onNodeTransform = useCallback((offset: [number, number]) => {
    setWorld(prev => ({
      ...prev,
      climbs: prev.climbs.map(climb => {
        const sClimb = selectionRef.current.climbs[climb.id];
        if (!sClimb) return climb;

        return {
          ...climb,
          geometries: climb.geometries.map((geom, i) => {
            const sGeom = sClimb.geometries.find(g => g.index === i);
            if (!sGeom || !sGeom.nodes) return geom;

            const controls: [number, number][] = geom.control.map((control, index) => {
              const selected = sGeom.nodes?.some(n => n.index === index);

              if (selected) {
                return [control[0] + offset[0], control[1] + offset[1]];
              } else {
                return control;
              }
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
      } else if (e.key === "n") {
        setTool(new EditPaths(selectedNodeHitTest, onNodeSelect, onNodeTransform));
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
  }, [onSelect, tool, onTransform, selectionHitTest, selectedNodeHitTest, onNodeSelect, onNodeTransform]);

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

