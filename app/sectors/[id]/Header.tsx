"use client";

import EditableHeader from "@/components/EditableHeader";
import { rename } from "@/sectors/actions";

export default function Header(
  { id, name }: { id: string, name?: string }
) {
  const action = async (name: string) => {
    await rename(id, name);
    // TODO handle result
  };

  return(
    <EditableHeader
      action={action}
      as="h1"
      value={name}
      emptyValue="Anonymous Sector"
      placeholder="Enter sector name"
    />
  );
}

