'use client'

import StringArrayInput from "@/components/StringArrayInput";
import TreeRadioFieldsetInput, { ValueNode } from "@/components/TreeRadioFieldsetInput";
import { ChangeEvent, useState } from "react";
import { addFormation } from "@/actions";
import { useRouter } from "next/navigation";

interface Node {
  id: number,
  names: string[],
  type: "area" | "formation",
  children: Node[],
}

interface CreateAreaFormProperties {
  roots: Node[],
  areaId?: number,
  superFormationId?: number,
}

function nodeAsRadioProps(node: Node): ValueNode {
  return {
    props: {
      id: node.id.toString(),
      name: node.type === "area" ? "area" : "superFormation",
      value: `${node.type}-${node.id}`,
      label: node.names.find(Boolean) ?? "Unnamed",
    },
    children: node.children.map(node => nodeAsRadioProps(node)),
  };
}

export default function CreateAreaForm(props: CreateAreaFormProperties) {
  const router = useRouter();
  const [names, setNames] = useState<string[] | undefined>();
  const [areaId, setAreaId] = useState<number | undefined>(props.areaId);
  const [superFormationId, setSuperFormationId] = useState<number | undefined>(props.superFormationId);

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      let id = await addFormation(names, areaId, superFormationId)
      router.push(`/formations/${id}`)
    } catch (error) {
      console.error("Failed to add formation", error)
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
        <label htmlFor="areaId">Area or Super Formation</label>
        <TreeRadioFieldsetInput
          caption="Select an area:"
          value={areaId ? `area-${areaId}` : superFormationId ? `formation-${superFormationId}` : undefined}
          nodes={props.roots.map(nodeAsRadioProps)}
          onChange={(value) => {
            if (value?.toString().startsWith("area-")) {
              const id = parseInt(value.toString().slice("area-".length), 10);

              if (!isNaN(id)) {
                setAreaId(id);
              } else {
                setAreaId(undefined);
              }

              setSuperFormationId(undefined);
            } else if (value?.toString().startsWith("formation-")) {
              setAreaId(undefined);

              const id = parseInt(value.toString().slice("formation-".length), 10);

              if (!isNaN(id)) {
                setSuperFormationId(id);
              } else {
                setSuperFormationId(undefined);
              }
            } else {
              setAreaId(undefined);
              setSuperFormationId(undefined);
            }
          }}
        />
        <button type="button" onClick={() => setAreaId(undefined)}>Clear selection</button>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}
