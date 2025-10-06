"use server";

import { create } from "@/sectors/actions";

export async function submitNewSectorForm(formData: FormData)
{
  const name = formData.get('name')?.toString() || undefined;
  const description = formData.get('description')?.toString() || undefined;
  const crag = formData.get("crag")?.toString();

  if (!crag) throw new Error("No crag");

  return await create(
    name,
    description,
    crag,
  );
}
