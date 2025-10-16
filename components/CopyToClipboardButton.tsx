"use client";

import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from "react";

export function CopyToClipboardButton(
  {
    children,
    content,
    ...buttonProps
  }: {
    children: ReactNode,
    content: string,
  } & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) {
  const onClick = async function () {
    await navigator.clipboard.writeText(content);
  }

  return (
    <button {...buttonProps} onClick={onClick}>
      { children }
    </button>
  );
}
