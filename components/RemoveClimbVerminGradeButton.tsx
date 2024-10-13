'use client'

import { removeClimbVerminGrade } from '@/actions';

interface VerminGradeData {
  value: number,
}

export default function RemoveClimbVerminGradeButton({ climbId, data, children }: { climbId: number, data: VerminGradeData, children: React.ReactNode }) {
  const handleClick = async () => {
    const confirmed = window.confirm("Are you sure you want to remove this grade from this climb?");
    if (!confirmed) return;

    try {
      await removeClimbVerminGrade(climbId, data)
    } catch (error) {
      console.error("Failed to remove climb vermin grade", error)
    }
  }

  return (
    <button onClick={handleClick}>{children}</button>
  )
}
