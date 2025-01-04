'use server'

import { revalidatePath } from 'next/cache'
import { GRAPHQL_ENDPOINT } from '@/constants'

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
 
export async function addArea(names?: String[], superAreaId?: number) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `mutation AddArea(
        $names: [String]
        $superAreaId: Int
      ) {
        addArea(
          names: $names
          superAreaId: $superAreaId
        ) {
          id
        }
      }`,
      variables: {
        names: names ?? null,
        superAreaId: superAreaId ?? null,
      },
    }),
  })

  const result = await response.json()

  if (response.ok) {
    let id = result.data.addArea.id
    revalidatePath("/areas")
    revalidatePath(`/areas/${id}`)
    return id;
  } else {
    throw(result.errors)
  }
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
