'use client'

import { useRouter } from 'next/navigation';
import { removeFormation } from '@/actions';

export default function DeleteFormationButton({ children, formationId }: { formationId: number, children: React.ReactNode }) {
  const router = useRouter()

  const handleClick = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this formation?");
    if (!confirmed) return;

    try {
      await removeFormation(formationId)
      router.push("/formations")
    } catch (error) {
      console.error("Failed to handle click", error)
    }
  }

  return (
    <button onClick={handleClick}>{children}</button>
  )
}
