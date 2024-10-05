'use server'

import { revalidatePath } from 'next/cache'
import { GRAPHQL_ENDPOINT } from '@/constants'

export async function removeClimb(id: number) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `mutation { removeClimb(id: ${id}) { id }}`
    })
  })

  const result = await response.json()

  if (response.ok) {
    // TODO
    // - How can I revalidate everything that may reference
    //   this climb??
    revalidatePath("/climbs")
    revalidatePath(`/climb/${id}`)
  } else {
    throw(result.errors)
  }
}

export async function addClimb(names?: string[], areaId?: number, formationId?: number) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `mutation AddClimb(
        $names: [String]
        $areaId: Int
        $formationId: Int
      ) {
        addClimb(
          names: $names
          areaId: $areaId
          formationId: $formationId
        ) {
          id
        }
      }`,
      variables: {
        names: names ?? null,
        areaId: areaId ?? null,
        formationId: formationId ?? null,
      },
    }),
  })

  const result = await response.json()

  if (response.ok) {
    let id = result.data.addClimb.id
    revalidatePath("/climbs")
    revalidatePath(`/climb/${id}`)
    return id;
  } else {
    throw(result.errors)
  }
}
 
export async function addClimbName(id: number, name: string) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `mutation { addClimbName(id: ${id}, name: "${name}") { id }}`
    })
  })

  const result = await response.json()

  if (response.ok) {
    let id = result.data.addClimbName.id
    revalidatePath("/climbs")
    revalidatePath(`/climb/${id}`)
    return id;
  } else {
    throw(result.errors)
  }
}

export async function removeClimbName(id: number, name: string) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `mutation { removeClimbName(id: ${id}, name: "${name}") { id }}`
    })
  })

  const result = await response.json()

  if (response.ok) {
    let id = result.data.removeClimbName.id
    revalidatePath("/climbs")
    revalidatePath(`/climb/${id}`)
    return id;
  } else {
    throw(result.errors)
  }
}

export async function removeArea(id: number) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `mutation { removeArea(id: ${id}) { id }}`
    })
  })

  const result = await response.json()

  if (response.ok) {
    // TODO
    // - How can I revalidate everything that may reference
    //   this area??
    revalidatePath("/areas")
    revalidatePath(`/area/${id}`)
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
    revalidatePath(`/area/${id}`)
    return id;
  } else {
    throw(result.errors)
  }
}

export async function addAreaName(id: number, name: string) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `mutation { addAreaName(id: ${id}, name: "${name}") { id }}`
    })
  })

  const result = await response.json()

  if (response.ok) {
    let id = result.data.addAreaName.id
    revalidatePath("/areas")
    revalidatePath(`/area/${id}`)
    return id;
  } else {
    throw(result.errors)
  }
}

export async function removeAreaName(id: number, name: string) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `mutation { removeAreaName(id: ${id}, name: "${name}") { id }}`
    })
  })

  const result = await response.json()

  if (response.ok) {
    let id = result.data.removeAreaName.id
    revalidatePath("/areas")
    revalidatePath(`/area/${id}`)
    return id;
  } else {
    throw(result.errors)
  }
}

export async function removeFormation(id: number) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `mutation { removeFormation(id: ${id}) { id }}`
    })
  })

  const result = await response.json()

  if (response.ok) {
    // TODO
    // - How can I revalidate everything that may reference
    //   this formation??
    revalidatePath("/formations")
    revalidatePath(`/formation/${id}`)
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
    revalidatePath(`/formation/${id}`)
    return id;
  } else {
    throw(result.errors)
  }
}

export async function addFormationName(id: number, name: string) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `mutation { addFormationName(id: ${id}, name: "${name}") { id }}`
    })
  })

  const result = await response.json()

  if (response.ok) {
    let id = result.data.addFormationName.id
    revalidatePath("/formations")
    revalidatePath(`/formation/${id}`)
    return id;
  } else {
    throw(result.errors)
  }
}

export async function removeFormationName(id: number, name: string) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `mutation { removeFormationName(id: ${id}, name: "${name}") { id }}`
    })
  })

  const result = await response.json()

  if (response.ok) {
    let id = result.data.removeFormationName.id
    revalidatePath("/formations")
    revalidatePath(`/formation/${id}`)
    return id;
  } else {
    throw(result.errors)
  }
}
