"use client";

import { useToggle } from "@/hooks/useToggle";
import { ElementType } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

function Inputs({
  defaultValue,
  onCancel,
  placeholder,
}: {
  defaultValue?: string,
  onCancel?: () => void,
  placeholder?: string,
}) {
  const { pending } = useFormStatus();

  return (
      <div className="w-full p-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
        <Input className="w-full" type="text" name="value" defaultValue={defaultValue} placeholder={placeholder} disabled={pending} />
        <div className="flex gap-2 flex-row">
          { onCancel && <Button variant="secondary" onClick={onCancel} disabled={pending}>Cancel</Button> }
          <Button type="submit" disabled={pending}>Save</Button>
        </div>
      </div>
  );
}

export default function EditableHeader({
  action,
  as: Tag,
  value,
  emptyValue,
  placeholder,
}: {
  action?: (value: string) => Promise<void> | void,
  as: ElementType,
  value?: string,
  emptyValue?: string,
  placeholder?: string,
}) {
  const [editing, toggleEditing] = useToggle();

  if (editing) {
    return (
      <form action={async (formData: FormData) => {
        const name = formData.get("value")?.toString() ?? "";
        await action?.(name);
        toggleEditing();
      }}>
        <Inputs
          defaultValue={value}
          placeholder={placeholder}
          onCancel={toggleEditing}
        />
      </form>
    );
  }

  return (
    <div className="w-full p-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
      <Tag className="flex-1">{value ?? <i>{emptyValue}</i>}</Tag>
      <div className="flex gap-2 flex-wrap">
        <Button variant="secondary" onClick={toggleEditing}>Edit</Button>
      </div>
    </div>
  );
}
