"use client";

import { TopoSessionProvider } from "@/components/context/TopoSession";
import { TopoWorldProvider } from "@/components/context/TopoWorld";
import TopoEditor from "@/components/TopoEditor/TopoEditor";

export default function NewTopoClient({
  availableClimbs,
}: {
  availableClimbs: {
    id: string,
    name: string,
  }[]
}) {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <TopoWorldProvider>
        <TopoSessionProvider availableClimbs={availableClimbs} >
          <TopoEditor />
        </TopoSessionProvider>
      </TopoWorldProvider>
    </div>
  );
}

