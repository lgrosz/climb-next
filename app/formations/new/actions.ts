"use server";

import { create } from "@/formations/actions";

export async function submitNewFormationForm(formData: FormData)
{
  const name = formData.get('name')?.toString() || undefined;
  const description = formData.get('description')?.toString() || undefined;

  const location = (() => {
    const latitude = Number(formData.get("latitude") ?? NaN);
    const longitude = Number(formData.get("longitude") ?? NaN);
    return !isNaN(latitude) && !isNaN(longitude) ? { latitude, longitude } : undefined;
  })();

  let parent;

  const sector = formData.get("sector")?.toString();
  const crag = formData.get("crag")?.toString();
  const region = formData.get("region")?.toString();

  if (sector) {
    parent = { type: "sector", id: sector } as const;
  } else if (crag) {
    parent = { type: "crag", id: crag } as const;
  } else if (region) {
    parent = { type: "region", id: region } as const;
  } else {
    parent = undefined;
  }

  return await create(
    name,
    description,
    location,
    parent,
  );
}
