'use client';

import Header from './Header';
import CanvasArea from './CanvasArea';
import PropertiesPanel from './PropertiesPanel';
import { TopoWorld, TopoWorldContext } from '../context/TopoWorld';
import { useState } from 'react';

export default function TopoEditor() {
  const [world, setWorld] = useState<TopoWorld>({
    title: "",
  });

  return (
    <TopoWorldContext.Provider
      value={{
        world,
        setWorld
      }}>
      <div className="w-full h-full flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex overflow-hidden p-4">
          <CanvasArea />
          <PropertiesPanel />
        </div>
      </div>
    </TopoWorldContext.Provider>
  );
}

