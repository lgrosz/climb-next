"use server";

import { create } from "@/climbs/actions";

export async function submitNewClimbForm(formData: FormData)
{
  const name = formData.get('name')?.toString();
  const description = formData.get('description')?.toString();

  let parent;

  const formation = formData.get("formation")?.toString();
  const sector = formData.get("sector")?.toString();
  const crag = formData.get("crag")?.toString();
  const region = formData.get("region")?.toString();

  if (formation) {
    parent = { type: "formation", id: formation } as const;
  } else if (sector) {
    parent = { type: "sector", id: sector } as const;
  } else if (crag) {
    parent = { type: "crag", id: crag } as const;
  } else if (region) {
    parent = { type: "region", id: region } as const;
  } else {
    parent = undefined;
  }

  return await create(
    name ?? undefined,
    description ?? undefined,
    parent,
  );
}
