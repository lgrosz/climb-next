'use client'

import { useRouter } from 'next/navigation';
import { removeArea } from '@/actions';

export default function DeleteAreaButton({ children, areaId }: { areaId: number, children: React.ReactNode }) {
  const router = useRouter()

  const handleClick = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this area?");
    if (!confirmed) return;

    try {
      await removeArea(areaId)
      router.push("/areas")
    } catch (error) {
      console.error("Failed to handle click", error)
    }
  }

  return (
    <button onClick={handleClick}>{children}</button>
  )
}
