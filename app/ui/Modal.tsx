"use client";

import { ReactNode } from "react";

export default function Modal(
  {
    header,
    children,
    footer,
  }: {
    header: ReactNode,
    children: ReactNode,
    footer: ReactNode,
  }
) {
  return (
    <div>
      <div>
        {header}
      </div>
      <div>
        {children}
      </div>
      <div>
        {footer}
      </div>
    </div>
  );
}
