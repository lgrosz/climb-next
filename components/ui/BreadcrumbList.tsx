import { ReactNode } from "react";

export default function BreadcrumbList(
  {
    children
  }: {
    children: ReactNode,
  }
) {
  return (
    <div>
      { children }
    </div>
  )
}
