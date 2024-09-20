'use client'

import { FormEvent, useState } from 'react'
import { addClimbName } from '@/actions'

export default function AddClimbNameForm({ climbId }: { climbId: number }) {
  const [value, setValue] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await addClimbName(climbId, value)
    } catch (error) {
      console.error("Failed to add climb name", error)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Add climb name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  )
}

