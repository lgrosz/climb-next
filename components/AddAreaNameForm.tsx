'use client'

import { FormEvent, useState } from 'react'
import { addAreaName } from '@/actions'

export default function AddAreaNameForm({ areaId }: { areaId: number }) {
  const [value, setValue] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await addAreaName(areaId, value)
    } catch (error) {
      console.error("Failed to add area name", error)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Add area name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  )
}

