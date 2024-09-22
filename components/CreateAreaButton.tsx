'use client'

import { useRouter } from 'next/navigation';
import { addArea } from '@/actions';

export default function CreateAreaButton({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const handleClick = async () => {
    try {
      let id = await addArea()
      router.push(`/area/${id}`)
    } catch (error) {
      console.error("Failed to handle click", error)
    }
  }

  return (
    <button onClick={handleClick}>{children}</button>
  )
}
