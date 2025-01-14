'use server'

import { revalidatePath } from 'next/cache'
import { GRAPHQL_ENDPOINT } from '@/constants'
import { query } from '@/graphql';

export async function renameClimb(climbId: number, name: string) {
  const dataQuery = `
    mutation(
      $id: Int!
      $name: String
    ) {
      action: renameClimb(
        id: $id
        name: $name
      ) {
        name
      }
    }
  `;

  const result = await query(GRAPHQL_ENDPOINT, dataQuery, {
    id: climbId,
    name: name || null,
  })
    .then(r => r.json());

  const { data, errors } = result;

  if (errors) {
    console.error(JSON.stringify(errors, null, 2));
  }

  revalidatePath('/')
  revalidatePath(`/climbs/${climbId}`)

  if (data?.action?.parent?.__typename == "Area") {
    const parentAreaId = data?.action?.parent?.id;
    if (parentAreaId) {
      revalidatePath(`/areas/${parentAreaId}`)
    }
  } else if (data?.action?.parent?.__typename == "Formation") {
    const parentFormationId = data?.action?.parent?.id;
    if (parentFormationId) {
      revalidatePath(`/formations/${parentFormationId}`)
    }
  }

  return data?.action?.name ?? "";
}
 
export async function renameFormation(formationId: number, name: string) {
  const dataQuery = `
    mutation(
      $id: Int!
      $name: String
    ) {
      action: renameFormation(
        id: $id
        name: $name
      ) {
        name
        parent {
          __typename
          ... on Area {
            id
          }
          ... on Formation {
            id
          }
        }
        formations { id }
        climbs { id }
      }
    }
  `;

  const result = await query(GRAPHQL_ENDPOINT, dataQuery, {
    id: formationId,
    name: name || null,
  })
    .then(r => r.json());

  const { data, errors } = result;

  if (errors) {
    console.error(JSON.stringify(errors, null, 2));
  }

  revalidatePath('/')
  revalidatePath(`/formations/${formationId}`)

  if (data?.action?.parent?.__typename == "Area") {
    const parentAreaId = data?.action?.parent?.id;
    if (parentAreaId) {
      revalidatePath(`/areas/${parentAreaId}`)
    }
  } else if (data?.action?.parent?.__typename == "Formation") {
    const parentFormationId = data?.action?.parent?.id;
    if (parentFormationId) {
      revalidatePath(`/formations/${parentFormationId}`)
    }
  }

  const childFormations = data?.action?.formations ?? []
  for (const child of childFormations) {
    const childFormationId = child?.id
    if (childFormationId) {
      revalidatePath(`/formations/${childFormationId}`)
    }
  }

  const childClimbs = data?.action?.climbs ?? []
  for (const child of childClimbs) {
    const childClimbId = child?.id
    if (childClimbId) {
      revalidatePath(`/climbs/${childClimbId}`)
    }
  }

  return data?.action?.name ?? "";
}
