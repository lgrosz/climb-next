"use client";

import Link from "next/link";
import { AscentTable, UpdateAscentAction } from "./AscentTable";
import { ComponentProps, useCallback, useState } from "react";
import { deleteAscents, markFirstAscent, verifyAscent } from "@/ascents/actions";

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

  const onDeleteAscents = useCallback(async () => {
    const confirmed = confirm(`Are you sure you want to delete (${selectedAscents.size}) ascents?`)

    if (confirmed) {
      await deleteAscents([...selectedAscents])
    }
  }, [selectedAscents]);

  const updateAscent = useCallback<UpdateAscentAction>(async (id , changes) => {
    if (changes.verified !== undefined) {
      verifyAscent(id, changes.verified);
    }

    if (changes.firstAscent !== undefined) {
      markFirstAscent(id, changes.firstAscent);
    }

    // TODO who is responsible for eagerly updating the ascents?
  }, []);

  return (
    <div>
      <AscentTable
        ascents={ascents}
        selected={selectedAscents}
        toggleSelectAction={toggleSelection}
        updateAscentAction={updateAscent}
        className="w-full"
      />
      <div className="flex justify-end">
        { !!climbId &&
          <Link href={`/climbs/${climbId}/add-ascent`}>Add ascent</Link>
        }
        { !!selectedAscents.size &&
          <button onClick={onDeleteAscents}>Delete ascents</button>
        }
      </div>
    </div>
  );
}
