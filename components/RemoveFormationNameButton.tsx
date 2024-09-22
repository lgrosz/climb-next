'use client'

import { removeFormationName } from '@/actions';

export default function DeleteFormationButton({ children, formationId, name }: { formationId: number, name: string, children: React.ReactNode }) {
  const handleClick = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this name?");
    if (!confirmed) return;

    try {
      await removeFormationName(formationId, name)
    } catch (error) {
      console.error("Failed to remove formation name", error)
    }
  }

  return (
    <button onClick={handleClick}>{children}</button>
  )
}
