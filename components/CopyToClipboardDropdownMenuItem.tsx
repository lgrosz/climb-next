"use client";

import { ComponentProps } from "react";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export function CopyToClipboardDropdownMenuItem(
  {
    content,
    ...props
  }: ComponentProps<typeof DropdownMenuItem> & {
    content: string,
  } 
) {
  const onClick = async function () {
    await navigator.clipboard.writeText(content);
  }

  return (
    <DropdownMenuItem onClick={onClick} {...props} />
  );
}
