'use client'

import StringArrayInput from "@/components/StringArrayInput";
import GradeArrayInput from "@/components/GradeArrayInput";
import TreeRadioFieldsetInput, { ValueNode } from "@/components/TreeRadioFieldsetInput";
import { ChangeEvent, useState } from "react";
import { addClimb } from "@/actions";
import { useRouter } from "next/navigation";
import VerminGrade from "@/vermin-grade";

interface Node {
  id: number,
  names: string[],
  type: "area" | "formation",
  children: Node[],
}

interface CreateClimbFormProperties {
  roots: Node[],
  areaId?: number,
  formationId?: number,
}

function nodeAsRadioProps(node: Node): ValueNode {
  return {
    props: {
      id: node.id.toString(),
      name: node.type === "area" ? "area" : "formation",
      value: `${node.type}-${node.id}`,
      label: node.names.find(Boolean) ?? "Unnamed",
    },
    children: node.children.map(node => nodeAsRadioProps(node)),
  };
}

export default function CreateClimbForm(props: CreateClimbFormProperties) {
  const router = useRouter();
  const [names, setNames] = useState<string[] | undefined>();
  const [grades, setGrades] = useState<VerminGrade[] | undefined>();
  const [areaId, setAreaId] = useState<number | undefined>(props.areaId);
  const [formationId, setformationId] = useState<number | undefined>(props.formationId);

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      let id = await addClimb(
        names,
        grades?.map(grade => ({ type: "VERMIN", value: grade.toString() })),
        areaId,
        formationId
      )
      router.push(`/climb/${id}`)
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
        <label htmlFor="grades">Grades:</label>
        <GradeArrayInput
          value={grades ?? []}
          onChange={setGrades}
          addStringPlaceholder="Add grade"
        />
      </div>
      <div>
        <label htmlFor="areaId">Area or Formation</label>
        <TreeRadioFieldsetInput
          caption="Select an area:"
          value={areaId ? `area-${areaId}` : formationId ? `formation-${formationId}` : undefined}
          nodes={props.roots.map(nodeAsRadioProps)}
          onChange={(value) => {
            if (value?.toString().startsWith("area-")) {
              const id = parseInt(value.toString().slice("area-".length), 10);

              if (!isNaN(id)) {
                setAreaId(id);
              } else {
                setAreaId(undefined);
              }

              setformationId(undefined);
            } else if (value?.toString().startsWith("formation-")) {
              const id = parseInt(value.toString().slice("formation-".length), 10);

              if (!isNaN(id)) {
                setformationId(id);
              } else {
                setformationId(undefined);
              }

              setAreaId(undefined);
            } else {
              setAreaId(undefined);
              setformationId(undefined);
            }
          }}
        />
        <button type="button" onClick={() => setAreaId(undefined)}>Clear selection</button>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}
