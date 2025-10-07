"use server";

import { create } from "@/regions/actions";

export async function submitNewRegionForm(formData: FormData)
{
  const name = formData.get("name")?.toString() || undefined;
  const description = formData.get("description")?.toString() || undefined;

  return await create(
    name,
    description,
  );
}
