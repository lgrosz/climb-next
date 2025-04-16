'use client';

import Header from './Header';
import CanvasArea from './CanvasArea';
import PropertiesPanel from './PropertiesPanel';
import { TopoWorld, TopoWorldContext } from '../context/TopoWorld';
import { useState } from 'react';
import { TopoSessionContext } from '../context/TopoSession';

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

  return (
    <TopoWorldContext.Provider
      value={{
        world,
        setWorld
      }}>
      <TopoSessionContext.Provider
        value={{
          availableClimbs,
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

