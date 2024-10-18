'use client'

import { removeAscent } from '@/actions';

export default function RemoveAscentButton({ children, ascentId }: { ascentId: number, children: React.ReactNode }) {
  const handleClick = async () => {
    const confirmed = window.confirm("Are you sure you want to remove this ascent?");
    if (!confirmed) return;

    try {
      await removeAscent(ascentId)
    } catch (error) {
      console.error("Failed to remove ascent", error)
    }
  }

  return (
    <button onClick={handleClick}>{children}</button>
  )
}
