'use server'

import { revalidatePath } from 'next/cache'

export async function removeClimb(id: number) {
  const response = await fetch("http://127.0.0.1:8000/", {
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

export async function addClimb() {
  const response = await fetch("http://127.0.0.1:8000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `mutation { addClimb { id }}`
    })
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
  const response = await fetch("http://127.0.0.1:8000/", {
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
  const response = await fetch("http://127.0.0.1:8000/", {
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
  const response = await fetch("http://127.0.0.1:8000/", {
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

export async function addArea() {
  const response = await fetch("http://127.0.0.1:8000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `mutation { addArea { id }}`
    })
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
  const response = await fetch("http://127.0.0.1:8000/", {
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
  const response = await fetch("http://127.0.0.1:8000/", {
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
