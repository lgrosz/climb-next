import CreateAreaForm from "@/components/CreateAreaForm"
import { GRAPHQL_ENDPOINT } from "@/constants";

interface Area {
  id: number,
  names: string[],
  superArea: { id: number } | null,
}

interface Node extends Area {
  subAreas: Node[]
}

function buildTree(areas: Area[]): Node[] {
  const areaMap = new Map<number, Node>()

  areas.forEach(area => {
    areaMap.set(area.id, { ...area, subAreas: [] })
  })

  const roots: Node[] = []

  areas.forEach(area => {
    const areaRef = areaMap.get(area.id)
    if (!areaRef) return

    if (area.superArea) {
      const superArea = areaMap.get(area.superArea.id)

      if (superArea) {
        superArea.subAreas.push(areaRef)
      }
    } else {
      roots.push(areaRef)
    }
  })

  return roots
}

export default async function Form() {
  let { areas }: { areas: Area[] } = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `query GetAreas {
        areas {
          id
          names
          superArea { id }
        }
      }`
    })
  })
    .then(r => r.json())
    .then(json => json.data)

  const roots = buildTree(areas)

  return (
    <div>
      <h1>Create area</h1>
      <CreateAreaForm areas={roots} />
    </div>
  );
}
