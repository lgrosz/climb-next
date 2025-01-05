'use server';

import { GRAPHQL_ENDPOINT } from "@/constants";
import { query } from "@/graphql";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// TODO I don't know if this should go here... here are some thoughts
// - I like that the submit behavior is next to the page/form responsible for
//   submitting
// - There is much more behavior in here, including creating an area.. maybe
//   that should go to some general @/areas/actions

export async function submitNewArea(formData: FormData)
{
  const name = formData.get('name')?.toString() || null;
  const parentAreaId = Number(formData.get('parent-area-id')?.toString()) || null;

  // Build up the request based on the inputs... This doesn't feel so great.
  // I'm not sure if this is because of 1. bad GraphQL API design; 2. not using
  // a GraphQL client library to build requests; or 3. I'm just overlooking some
  // easy was of doing it.
  let mutationParameters;
  let actionParameters;

  if (parentAreaId) {
    mutationParameters = `
      $name: String
      $area: Int!
    `
    actionParameters = `
      name: $name
      parent: { area: $area }
    `
  } else {
    mutationParameters = `
      $name: String
    `
    actionParameters = `
      name: $name
    `
  }

  const mutation = `
    mutation(
      ${mutationParameters}
    ) {
      action: addArea(
        ${actionParameters}
      ) {
        id
        parent {
          ... on Area { id }
        }
      }
    }
  `

  const result = await query(GRAPHQL_ENDPOINT, mutation, {
    name: name,
    area: parentAreaId,
  })
    .then(r => r.json());

  const { data, errors } = result;

  if (errors) {
    console.error(errors);
  }

  let id = data?.action?.id;
  let parentId = data?.action?.parent?.id;

  if (id) {
    revalidatePath(`/areas/${id}`);
  }

  if (parentId) {
    revalidatePath(`/areas/${parentId}`);
  }

  revalidatePath('/table-of-contents');
  redirect(`/areas/${id}`);
}
