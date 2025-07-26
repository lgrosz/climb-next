"use client";

import { TopoSessionProvider } from "@/components/context/TopoSession";
import { TopoWorld, TopoWorldProvider } from "@/components/context/TopoWorld";
import TopoEditor from "@/components/TopoEditor/TopoEditor";

export default function EditTopoClient({
    availableClimbs,
    world,
}: {
    availableClimbs: {
        id: string,
	name: string,
    }[],
    world: TopoWorld,
}) {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <TopoWorldProvider initial={world}>
        <TopoSessionProvider availableClimbs={availableClimbs} >
          <TopoEditor />
        </TopoSessionProvider>
      </TopoWorldProvider>
    </div>
  );
}

