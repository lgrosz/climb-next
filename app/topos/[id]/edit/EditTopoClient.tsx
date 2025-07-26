"use client";

import { TopoWorld } from "@/components/context/TopoWorld";
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
      <TopoEditor
        availableClimbs={availableClimbs}
        world={world}
      />
    </div>
  );
}

