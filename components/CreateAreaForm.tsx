'use client'

import StringArrayInput from "@/components/StringArrayInput";
import TreeRadioFieldsetInput, { ValueNode } from "@/components/TreeRadioFieldsetInput";
import { ChangeEvent, useState } from "react";
import { addArea } from "@/actions";
import { useRouter } from "next/navigation";

interface AreaNode {
  id: number,
  names: string[],
  subAreas: AreaNode[],
}

interface CreateAreaFormProperties {
  areas: AreaNode[],
  superAreaId?: number,
}

function areaAsRadioProps(areaNode: AreaNode): ValueNode {
  return {
    props: {
      id: areaNode.id.toString(),
      name: "superArea",
      value: areaNode.id,
      label: areaNode.names.find(Boolean) ?? "Unnamed",
    },
    children: areaNode.subAreas.map(subArea => areaAsRadioProps(subArea)),
  };
}


export default function CreateAreaForm(props: CreateAreaFormProperties) {
  const router = useRouter();
  const [names, setNames] = useState<string[] | undefined>();
  const [superAreaId, setSuperAreaId] = useState<number | undefined>(props.superAreaId);

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      let id = await addArea(names, superAreaId)
      router.push(`/areas/${id}`)
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
        <TreeRadioFieldsetInput
          caption="Select an area:"
          value={superAreaId}
          nodes={props.areas.map(areaAsRadioProps)}
          onChange={(value) => setSuperAreaId(Number(value))}
        />
        <button type="button" onClick={() => setSuperAreaId(undefined)}>Clear selection</button>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}
