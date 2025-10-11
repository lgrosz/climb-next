import { ReactNode } from "react";

export default function BreadcrumbPage(
  {
    children
  }: {
    children: ReactNode,
  }
) {
  return (
    <span>
      { children }
    </span>
  )
}
