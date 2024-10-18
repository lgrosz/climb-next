'use client'

import { FormEvent, useState } from 'react'
import { addAscent } from '@/actions'

export default function AddClimbAscentForm({ climbId }: { climbId: number }) {
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const ascentDate = (start && end) ? {
      start: new Date(start),
      end: new Date(end),
    } : undefined;

    try {
      await addAscent(climbId, ascentDate)
    } catch (error) {
      console.error("Failed to add climb name", error)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        type="date"
        placeholder="Start date"
        value={start}
        onChange={(e) => setStart(e.target.value)}
      />
      -
      <input
        type="date"
        placeholder="Start date"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  )
}

