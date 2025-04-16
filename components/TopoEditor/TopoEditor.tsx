'use client';

import Header from './Header';
import CanvasArea from './CanvasArea';
import PropertiesPanel from './PropertiesPanel';

export default function TopoEditor() {
  return (
    <div className="w-full h-full flex flex-col bg-white">
      <Header />
      <div className="flex-1 flex overflow-hidden p-4">
        <CanvasArea />
        <PropertiesPanel />
      </div>
    </div>
  );
}

