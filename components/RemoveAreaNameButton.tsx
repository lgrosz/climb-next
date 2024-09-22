'use client'

import { removeAreaName } from '@/actions';

export default function DeleteAreaButton({ children, areaId, name }: { areaId: number, name: string, children: React.ReactNode }) {
  const handleClick = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this name?");
    if (!confirmed) return;

    try {
      await removeAreaName(areaId, name)
    } catch (error) {
      console.error("Failed to remove area name", error)
    }
  }

  return (
    <button onClick={handleClick}>{children}</button>
  )
}
