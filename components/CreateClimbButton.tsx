'use client'

import { useRouter } from 'next/navigation';
import { addClimb } from '@/actions';

export default function CreateClimbButton({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const handleClick = async () => {
    try {
      let id = await addClimb()
      router.push(`/climb/${id}`)
    } catch (error) {
      console.error("Failed to handle click", error)
    }
  }

  return (
    <button onClick={handleClick}>{children}</button>
  )
}
