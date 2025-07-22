'use client';

import Header from './Header';
import CanvasArea from './CanvasArea';
import PropertiesPanel from './PropertiesPanel';
import { TopoWorld, TopoWorldProvider, useTopoWorld, useTopoWorldDispatch } from '../context/TopoWorld';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SessionEvent, TopoSessionContext } from '../context/TopoSession';
import { CreateSplineTool, EditPaths, Tool, TransformObjects } from '@/lib/tools';
import { Selection } from '@/lib/tools/Select';
import { Selection as SessionSelection } from '../context/TopoSession';
import { BasisSpline } from '@/lib/BasisSpline';

function isPointOnBasisSpline(
  spline: BasisSpline,
  point: [number, number],
  tolerance: number = 15
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
  const ret: SessionSelection = { lines: {} };

  world.lines.forEach(({ geometry }, index) => {
    const spline = new BasisSpline(geometry.points, geometry.degree, geometry.knots);
    if (selection.type === "point" && isPointOnBasisSpline(spline, selection.data)) {
      ret.lines[index] = { geometry: { index } };
    }

    if (selection.type === "box" && boxContains(selection.data, spline.bounds())) {
      ret.lines[index] = { geometry: { index } };
    }
  });

  return ret;
}

function pointIsOnPoint(
  p1: [number, number],
  p2: [number, number],
  tolerance: number = 15,
) {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  const toleranceSq = tolerance * tolerance;
  const distSq = dx * dx + dy * dy;

  return distSq <= toleranceSq;
}

function pointIsOnLine(
  point: [number, number],
  segment: [[number, number], [number, number]],
  tolerance: number = 15,
): boolean {
  const [px, py] = point;
  const [[x1, y1], [x2, y2]] = segment;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return pointIsOnPoint(point, [x1, y1], tolerance);
  }

  const t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  const tClamped = Math.max(0, Math.min(1, t));

  const closestX = x1 + tClamped * dx;
  const closestY = y1 + tClamped * dy;

  const dxToPoint = px - closestX;
  const dyToPoint = py - closestY;
  const distSq = dxToPoint * dxToPoint + dyToPoint * dyToPoint;

  return distSq <= tolerance * tolerance;
}

function isNodeSelected(node: [number, number], selection: Selection) {
  if (selection.type === "point") {
    return pointIsOnPoint(selection.data, node);
  }

  if (selection.type === "box") {
    return boxContains(selection.data, [node, node]);
  }
}

function isSegmentSelected(segment: [[number, number], [number, number]], selection: Selection) {
  if (selection.type === "box") return false;
  return pointIsOnLine(selection.data, segment);
}

function selectNodes(world: TopoWorld, sessionSelection: SessionSelection, selection: Selection) {
  const ret: SessionSelection = {
    lines: Object.fromEntries(
      Object.entries(sessionSelection.lines).map(([id, cs]) => {
        return [id, {
          geometry: (gs => {
            const geom = world.lines.at(gs.index)?.geometry;

            if (!geom) return gs;

            let hitNodes = geom.points
              .map((node, nodeIndex) => {
                return isNodeSelected(node, selection) ? { index: nodeIndex } : null;
              })
              .filter(nodeSelection => nodeSelection !== null);

            if (hitNodes.length < 1) {
              hitNodes = geom.points
                .map((node, i, nodes) => {
                  const next = nodes.at(i + 1);
                  if (!next) return null;

                  if (isSegmentSelected([node, next], selection)) {
                    return [{ index: i }, { index: i + 1}];
                  }

                  return null;
                })
                .filter(n => n !== null)
                .flat();
            }

            return {
              ...gs,
              nodes: hitNodes,
            };
          })(cs.geometry)
        }]
      })
    )
  };

  return ret;
}

// Need this as I refactor the not-so-ideal implementation
function InnerTopoEditor(
  {
    availableClimbs,
  }: {
    availableClimbs: {
      id: string,
      name: string,
    }[],
  }
) {
  const world = useTopoWorld();
  const dispatchWorld = useTopoWorldDispatch();
  const worldRef = useRef(world);

  const [tool, setTool] = useState<Tool | null>(null);

  const [selection, setSelection] = useState<SessionSelection>({ lines: { } });
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
    for (const index of Object.keys(selectionRef.current.lines)) {
      const geometry = worldRef.current.lines.at(Number(index))?.geometry;

      if (!geometry) continue;

      const spline = new BasisSpline(geometry.points, geometry.degree, geometry.knots);

      if (isPointOnBasisSpline(spline, point)) {
        return true;
      }
    }

    return false;
  }, []);

  const onTransform = useCallback((offset: [number, number]) => {
    dispatchWorld({ type: "set", world: prev => ({
      ...prev,
      lines: prev.lines.map((line, index) => {
        const sLine = selectionRef.current.lines[index];
        if (!sLine) return line;

        return {
          ...line,
          geometry: ((geom) => {
            const points: [number, number][] = geom.points.map(p => {
              return [p[0] + offset[0], p[1] + offset[1]];
            });

            return { points, degree: geom.degree, knots: geom.knots };
          })(line.geometry)
        }
      }),
    })});
  }, [dispatchWorld]);

  const onNodeSelect = useCallback((selection: Selection) => {
    const hasSelectedNodes = (s: SessionSelection) =>
      Object.values(s.lines).some(line =>
        line.geometry.nodes && line.geometry.nodes.length > 0
      );

    let sessionSelection: SessionSelection;

    if (Object.keys(selectionRef.current.lines).length < 1) {
      sessionSelection = selectObjects(worldRef.current, selection);
    } else {
      sessionSelection = selectNodes(worldRef.current, selectionRef.current, selection);

      if (
        selection.type === "point" &&
        !hasSelectedNodes(selectionRef.current) &&
        !hasSelectedNodes(sessionSelection)
      ) {
        sessionSelection = { lines: {} };
      }
    }

    setSelection(sessionSelection);
  }, []);

  const selectedNodeHitTest = useCallback((point: [number, number]) => {
    for (const [index, { geometry: gs }] of Object.entries(selectionRef.current.lines)) {
      const geometry = worldRef.current.lines.at(Number(index))?.geometry;
      if (!geometry) continue;

      if (!geometry || !gs.nodes) continue;

      for (const { index: ni } of gs.nodes) {
        const node = geometry.points.at(ni);
        if (!node) continue;

        if (pointIsOnPoint(node, point)) {
          return true;
        }
      }
    }

    return false;
  }, []);

  const onNodeTransform = useCallback((offset: [number, number]) => {
    dispatchWorld({ type: "set", world: prev => ({
      ...prev,
      lines: prev.lines.map((line, index) => {
        const sLine = selectionRef.current.lines[index];
        if (!sLine) return line;

        return {
          ...line,
          geometry: (geom => {
            const sGeom = sLine.geometry;
            if (!sGeom.nodes) return geom;

            const points: [number, number][] = geom.points.map((p, i) => {
              const selected = sGeom.nodes?.some(n => n.index === i);

              if (selected) {
                return [p[0] + offset[0], p[1] + offset[1]];
              } else {
                return p;
              }
            });

            return { points, degree: geom.degree, knots: geom.knots };
          })(line.geometry)
        }
      }),
    })});
  }, [dispatchWorld]);

  const addSplineGeometry = useCallback((spline: BasisSpline) => {
    dispatchWorld({ type: "set", world: prev => ({
      ...prev,
      lines: [...prev.lines, { geometry: { points: spline.points, degree: spline.degree, knots: spline.knots } }],
    })});
  }, [dispatchWorld]);

  const deleteSelection = useCallback(() => {
    if (Object.keys(selection.lines).length < 1) return false;

    if (tool instanceof EditPaths) {
      dispatchWorld({ type: "set", world: {
        ...world,
        lines: world.lines.map((line, li) => {
          const lineSelection = selection.lines[li];
          if (!lineSelection?.geometry?.nodes) return line;

          const toDelete = new Set(lineSelection.geometry.nodes.map(n => n.index));
          const remaining = line.geometry.points.filter((_, ni) => !toDelete.has(ni));

          // Only apply deletion if at least 2 control points would remain
          if (remaining.length > 1) {
            const degree = Math.min(line.geometry.degree, remaining.length - 1);
            const spline = new BasisSpline(remaining, degree);

            return {
              ...line,
              geometry: { points: spline.points, degree: spline.degree, knots: spline.knots }
            };
          } else {
            return line;
          }
        })
      }});
    } else if (tool instanceof TransformObjects) {
      // TODO ideally, this is a single dispatch as it's one action
      const sortedIndeces = Object.keys(selectionRef.current.lines)
        .map(i => Number(i))
        .toSorted()
        .toReversed();

      for (const index of sortedIndeces) {
        dispatchWorld({
          type: "line",
          index: Number(index),
          action: { type: "remove" }
        });
      }
    }

    return true;
  }, [selection.lines, tool, world, dispatchWorld]);

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
      } else if (e.key === "b") {
        setTool(new CreateSplineTool(addSplineGeometry))
        e.stopPropagation();
        e.preventDefault();
      } else if (e.key === "Backspace") {
        if (deleteSelection()) {
          setSelection({ lines: { } })
          e.stopPropagation();
          e.preventDefault();
        }
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
  }, [onSelect, tool, onTransform, selectionHitTest, selectedNodeHitTest, onNodeSelect, onNodeTransform, addSplineGeometry, selection.lines, deleteSelection]);

  // TODO I can either define the interaction between the session and the world
  // here, or I can do so within the session by defining a custom "provider"
  // component. Doing so would reduce the overhead of creating another
  // World->Session combination down the line, but could mask the granularity of
  // doing so based on the context they're used.

  return (
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
  );
}

export default function TopoEditor(
  {
    availableClimbs,
    world: initialWorld,
  }: {
    availableClimbs: {
      id: string,
      name: string,
    }[],
    world?: TopoWorld,
  }
) {
  return (
    <TopoWorldProvider initial={initialWorld}>
      <InnerTopoEditor availableClimbs={availableClimbs} />
    </TopoWorldProvider>
  );
}

