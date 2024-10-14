"use client"

import VerminGrade from '@/vermin-grade';
import { useState } from 'react'

interface GradeArrayInputProperties {
  value: VerminGrade[],
  onChange: (newValue: VerminGrade[]) => void,
  addStringPlaceholder?: string,
}

export default function GradeArrayInput(props: GradeArrayInputProperties) {
  const [newString, setNewString] = useState("")

  const handleAddGrade = () => {
    try {
      let newGrade = VerminGrade.fromString(newString.trim())
      const updatedGrades = [...(props.value) || [], newGrade]
      props.onChange(updatedGrades)
    } catch (error) {
      console.warn("Invalid grade syntax")
    } finally {
      setNewString("")
    }
  }

  const handleRemoveGrade = (index: number) => {
    const updatedGrades = props.value.filter((_, i) => i !== index)
    props.onChange(updatedGrades)
  }

  return (
    <ul>
      {props.value.map((grade, index) => (
        <li key={index}>
          <span>{grade.toString()}</span>
          <button type="button" onClick={() => handleRemoveGrade(index)}>
            Remove
          </button>
        </li>
      ))}
      <li>
        <input
          type="text"
          value={newString}
          onChange={(e) => setNewString(e.target.value)}
          placeholder={props.addStringPlaceholder}
        />
        <button type="button" onClick={handleAddGrade}>Add Grade</button>
      </li>
    </ul>
  )
}
