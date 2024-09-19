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
    except(result.errors)
  }
}
 