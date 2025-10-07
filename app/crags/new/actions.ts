"use server";

import { create } from "@/crags/actions";

export async function submitNewCragForm(formData: FormData)
{
  const name = formData.get("name")?.toString() || undefined;
  const description = formData.get("description")?.toString() || undefined;
  const region = formData.get("region")?.toString() || undefined;

  return await create(
    name,
    description,
    region,
  );
}
