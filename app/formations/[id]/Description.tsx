"use client";

import EditableText from "@/components/EditableText";
import { describe } from "@/formations/actions";

export default function Header(
  { id, description }: { id: string, description?: string }
) {
  const action = async (description: string) => {
    await describe(id, description);
    // TODO handle result
  };

  return(
    <EditableText
      action={action}
      as="p"
      value={description}
      emptyValue="No description available"
      placeholder="Describe the formation"
    />
  );
}

