'use server';

import { redirect } from "next/navigation";
import { create } from '@/areas/actions';

// TODO I don't know if this should go here... here are some thoughts
// - I like that the submit behavior is next to the page/form responsible for
//   submitting
// - There is much more behavior in here, including creating an area.. maybe
//   that should go to some general @/areas/actions

export async function submitNewArea(formData: FormData)
{
  const name = formData.get('name')?.toString() || null;
  const parentAreaId = Number(formData.get('parent-area-id')?.toString()) || null;

  let id = await create(name ?? undefined, { area: parentAreaId ?? undefined });

  redirect(`/areas/${id}`);
}
