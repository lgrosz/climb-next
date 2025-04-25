'use client';

import Header from './Header';
import CanvasArea from './CanvasArea';
import PropertiesPanel from './PropertiesPanel';
import { TopoWorld, TopoWorldContext } from '../context/TopoWorld';
import { useCallback, useState } from 'react';
import { SessionEvent, TopoSessionContext } from '../context/TopoSession';
import { Tool } from '@/lib/tools';

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

  const [tool, setTool] = useState<Tool | null>(null);

  const dispatch = useCallback((e: SessionEvent) => {
    if (tool?.handle(e)) {
      return true;
    }

    return false;
  }, [tool]);

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

