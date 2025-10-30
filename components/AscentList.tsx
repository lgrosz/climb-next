"use client";

import Link from "next/link";
import { AscentTable } from "./AscentTable";
import { ComponentProps } from "react";

export default function AscentList({
  climbId,
  ascents,
}: {
  climbId?: string,
  ascents: ComponentProps<typeof AscentTable>["ascents"]
})
{
  return (
    <div>
      <AscentTable ascents={ascents} className="w-full" />
      <div className="flex justify-end">
        { !!climbId &&
          <Link href={`/climbs/${climbId}/add-ascent`}>Add ascent</Link>
        }
      </div>
    </div>
  );
}
