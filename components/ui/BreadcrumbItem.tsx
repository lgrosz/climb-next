import { ReactNode } from "react";

export default function BreadcrumbItem(
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
