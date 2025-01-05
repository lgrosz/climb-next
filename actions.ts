'use server'

import { revalidatePath } from 'next/cache'
import { GRAPHQL_ENDPOINT } from '@/constants'
import { query } from '@/graphql';

interface GradeData {
  type: "VERMIN",
  value: string,
}

export async function addClimb(names?: string[], grades?: GradeData[], areaId?: number, formationId?: number) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `mutation AddClimb(
        $names: [String]
        $grades: [GradeInput]
        $areaId: Int
        $formationId: Int
      ) {
        addClimb(
          names: $names
          grades: $grades
          areaId: $areaId
          formationId: $formationId
        ) {
          id
        }
      }`,
      variables: {
        names: names ?? null,
        grades: grades ?? null,
        areaId: areaId ?? null,
        formationId: formationId ?? null,
      },
    }),
  })

  const result = await response.json()

  if (response.ok) {
    let id = result.data.addClimb.id
    revalidatePath("/climbs")
    revalidatePath(`/climbs/${id}`)
    return id;
  } else {
    throw(result.errors)
  }
}

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

  revalidatePath('/table-of-contents')
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
 
export async function addFormation(names?: String[], areaId?: number, superFormationId?: number) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `mutation AddFormation(
        $names: [String]
        $areaId: Int
        $superFormationId: Int
      ) {
        addFormation(
          names: $names
          areaId: $areaId
          superFormationId: $superFormationId
        ) {
          id
        }
      }`,
      variables: {
        names: names ?? null,
        areaId: areaId ?? null,
        superFormationId: superFormationId ?? null,
      },
    }),
  })

  const result = await response.json()

  if (response.ok) {
    let id = result.data.addFormation.id
    revalidatePath("/formations")
    revalidatePath(`/formations/${id}`)
    return id;
  } else {
    throw(result.errors)
  }
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

  revalidatePath('/table-of-contents')
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
