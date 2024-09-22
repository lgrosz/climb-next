'use client'

import { FormEvent, useState } from 'react'
import { addFormationName } from '@/actions'

export default function AddFormationNameForm({ formationId }: { formationId: number }) {
  const [value, setValue] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await addFormationName(formationId, value)
    } catch (error) {
      console.error("Failed to add formation name", error)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Add formation name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  )
}

