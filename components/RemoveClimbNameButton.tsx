'use client'

import { removeClimbName } from '@/actions';

export default function DeleteClimbButton({ children, climbId, name }: { climbId: number, name: string, children: React.ReactNode }) {
  const handleClick = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this name?");
    if (!confirmed) return;

    try {
      await removeClimbName(climbId, name)
    } catch (error) {
      console.error("Failed to remove climb name", error)
    }
  }

  return (
    <button onClick={handleClick}>{children}</button>
  )
}
