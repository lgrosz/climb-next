'use client';

import { useState } from "react";

export default function TopoEditor() {
  const [title, setTitle] = useState("");

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header / Toolbar */}
      <div className="p-4 border-b">Topo Editor: {title}</div>

      {/* Main Editing Panel */}
      <div className="flex-1 flex overflow-hidden p-4">
        {/* Canvas Area */}
        <div className="flex-1 bg-gray-100 overflow-hidden relative">
          <canvas className="w-full h-full block" />
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-white border-l p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Properties</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={title}
                className="w-full"
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            {/* Add more editable fields here as necessary */}
          </div>
        </div>
      </div>
    </div>
  );
}

