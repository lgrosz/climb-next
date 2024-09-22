'use client'

import { useRouter } from 'next/navigation';
import { addFormation } from '@/actions';

export default function CreateFormationButton({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const handleClick = async () => {
    try {
      let id = await addFormation()
      router.push(`/formation/${id}`)
    } catch (error) {
      console.error("Failed to handle click", error)
    }
  }

  return (
    <button onClick={handleClick}>{children}</button>
  )
}
