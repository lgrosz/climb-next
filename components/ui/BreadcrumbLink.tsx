import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";

export default function BreadcrumbLink(
  {
    children,
    ...props
  }: {
    children: ReactNode,
  } & LinkProps
) {
  return (
    <Link {...props}>
      { children }
    </Link>
  );
}

