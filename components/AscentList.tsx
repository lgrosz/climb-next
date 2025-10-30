"use client";

import Link from "next/link";
import { AscentTable } from "./AscentTable";
import { ComponentProps, useState } from "react";

export default function AscentList({
  climbId,
  ascents,
}: {
  climbId?: string,
  ascents: ComponentProps<typeof AscentTable>["ascents"]
})
{
  const [selectedAscents, setSelectedAscents] = useState<Set<string>>(new Set);

  const toggleSelection = (id: string) => {
    setSelectedAscents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <AscentTable
        ascents={ascents}
        selected={selectedAscents}
        toggleSelect={toggleSelection}
        className="w-full"
      />
      <div className="flex justify-end">
        { !!climbId &&
          <Link href={`/climbs/${climbId}/add-ascent`}>Add ascent</Link>
        }
      </div>
    </div>
  );
}
