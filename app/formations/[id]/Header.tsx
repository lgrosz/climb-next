"use client";

import { rename } from "@/formations/actions";
import { useToggle } from "@/hooks/useToggle";
import { useFormStatus } from "react-dom";

function RenameForm({
  id,
  name,
  onCancel
}: {
  id: string,
  name?: string,
  onCancel?: () => void,
}) {
  const { pending } = useFormStatus();
  return (
    <div className="w-full p-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
      <input type="hidden" name="id" value={id} disabled={pending} />
      <input className="w-full" type="text" name="name" defaultValue={name} placeholder="Formation name" disabled={pending} />
      <div className="flex gap-2 flex-row">
        { onCancel && <button onClick={onCancel} disabled={pending}>Cancel</button> }
        <input type="submit" value="Save" disabled={pending} />
      </div>
    </div>
  );
}

export default function Header(
  { id, name }: { id: string, name?: string }
) {
  const [editing, toggleEditing] = useToggle();

  const action = async (formData: FormData) => {
    const id = formData.get("id")?.toString() ?? "";
    const name = formData.get("name")?.toString() ?? "";
    await rename(id, name);

    // TODO
    // - on success, set the name
    // - on error, display error

    toggleEditing();
  };

  if (editing) {
    return (
      <form action={action}>
        <RenameForm
          id={id}
          name={name}
          onCancel={toggleEditing}
        />
      </form>
    );
  }

  return (
    <div className="w-full p-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="flex-1"><h1>{name ?? <i>Anonymous Formation</i>}</h1></div>
      <div className="flex gap-2 flex-wrap"><button onClick={toggleEditing}>Edit</button></div>
    </div>
  );
}

