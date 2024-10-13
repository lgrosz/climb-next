'use client'

import { FormEvent, useState } from 'react'
import { addClimbVerminGrade } from '@/actions'
import VerminGrade from '@/vermin-grade';

export default function AddVerminGradeForm({ climbId }: { climbId: number }) {
  const [value, setValue] = useState<string>();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (value) {
        let grade = VerminGrade.fromString(value)
        await addClimbVerminGrade(climbId, { value: grade.getValue() })
      } else {
        console.warn("No valid grade value")
      }
    } catch (error) {
      console.error("Failed to add climb vermin grade", error)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Add V-grade"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  )
}


