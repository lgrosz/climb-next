'use client'

import { useRouter } from 'next/navigation';
import { removeClimb } from '@/actions';

export default function DeleteClimbButton({ children, climbId }: { climbId: number, children: React.ReactNode }) {
  const router = useRouter()

  const handleClick = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this climb?");
    if (!confirmed) return;

    try {
      await removeClimb(climbId)
      router.push("/climbs")
    } catch (error) {
      console.error("Failed to handle click", error)
    }
  }

  return (
    <button onClick={handleClick}>{children}</button>
  )
}
