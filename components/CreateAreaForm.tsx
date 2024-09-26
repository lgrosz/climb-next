'use client'

import StringArrayInput from "@/components/StringArrayInput";
import RadioFieldsetInput from "@/components/RadioFieldsetInput";
import { ChangeEvent, useState } from "react";
import { addArea } from "@/actions";
import { useRouter } from "next/navigation";

interface IdentifiableNamedArea {
  id: number,
  name: string,
}

interface CreateAreaFormProperties {
  areas: IdentifiableNamedArea[],
}

export default function CreateAreaForm(props: CreateAreaFormProperties) {
  const router = useRouter();
  const [names, setNames] = useState<string[] | undefined>();
  const [superAreaId, setSuperAreaId] = useState<number | undefined>();

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('submitting', names, superAreaId)

    try {
      let id = await addArea(names, superAreaId)
      router.push(`/area/${id}`)
    } catch (error) {
      console.error("Failed to add area", error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="names">Names:</label>
        <StringArrayInput
          value={names ?? []}
          onChange={setNames}
          addStringPlaceholder="Add name"
        />
      </div>
      <div>
        <label htmlFor="superAreaId">Super Area:</label>
        <RadioFieldsetInput
          caption="Select an area:"
          value={superAreaId}
          values={props.areas.map(area => ({
            id: `${area.id}`,
            name: "superArea",
            value: area.id,
            label: area.name,
          }))}
          onChange={(value) => setSuperAreaId(Number(value))}
        />
        <button type="button" onClick={() => setSuperAreaId(undefined)}>Clear selection</button>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}
