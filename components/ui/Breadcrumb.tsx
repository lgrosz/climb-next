import { ReactNode } from "react";

export default function Breadcrumb(
  { 
    children
  }: {
    children?: ReactNode,
  }
) {
  return (
    <div>
      { children }
    </div>
  );
}
