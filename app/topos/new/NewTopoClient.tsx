"use client";

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
      <TopoEditor
        availableClimbs={availableClimbs}
      />
    </div>
  );
}

