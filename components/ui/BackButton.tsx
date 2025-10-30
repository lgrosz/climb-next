"use client";

import { useRouter } from "next/navigation"
import { ReactNode } from "react";

export default function BackButton({
  children
}: {
  children?: ReactNode
}) {
  const router = useRouter();

  return (
    <button onClick={router.back}>{children}</button>
  )
}
