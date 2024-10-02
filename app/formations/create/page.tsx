import CreateFormationForm from "@/components/CreateFormationForm"
import { GRAPHQL_ENDPOINT } from "@/constants";

interface Area {
  id: number,
  names: string[],
  superArea: { id: number } | null;
}

interface Formation {
  id: number,
  names: string[],
  area: { id: number } | null;
  superFormation: { id: number } | null;
}

interface TreeNode {
  id: number,
  names: string[],
  type: "area" | "formation",
  children: TreeNode[],
}

function buildTree(areas: Area[], formations: Formation[]): TreeNode[] {
  const areaMap: Map<number, TreeNode> = new Map();
  const formationMap: Map<number, TreeNode> = new Map();

  areas.forEach(area => {
    areaMap.set(area.id, {
      id: area.id,
      names: area.names,
      type: 'area',
      children: []
    });
  });

  formations.forEach(formation => {
    formationMap.set(formation.id, {
      id: formation.id,
      names: formation.names,
      type: 'formation',
      children: []
    });
  });

  formations.forEach(formation => {
    const node = formationMap.get(formation.id)!;
    if (formation.superFormation) {
      formationMap.get(formation.superFormation.id)?.children.push(node);
    } else if (formation.area) {
      areaMap.get(formation.area.id)?.children.push(node);
    }
  });

  areas.forEach(area => {
    const node = areaMap.get(area.id)!;
    if (area.superArea) {
      areaMap.get(area.superArea.id)?.children.push(node);
    }
  });

  return Array.from(areaMap.values()).filter(area => !areas.find(a => a.id === area.id)?.superArea);
}

interface SearchParams {
  "area-id"?: string,
  "super-formation-id"?: string,
}

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams,
}) {
  let {
    areas,
    formations
  }: {
    areas: Area[],
    formations: Formation[]
  } = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `query GetAreasAndFormations {
        areas {
          id
          names
          superArea { id }
        }
        formations {
          id
          names
          area { id }
          superFormation { id }
        }
      }`
    })
  })
    .then(r => r.json())
    .then(json => json.data)

  const roots = buildTree(areas, formations)

  const areaId: number | undefined = searchParams["area-id"]
    ? parseInt(searchParams["area-id"], 10)
    : undefined;

  const superFormationId: number | undefined = searchParams["super-formation-id"]
    ? parseInt(searchParams["super-formation-id"], 10)
    : undefined;

  return (
    <div>
      <h1>Create formation</h1>
      <CreateFormationForm
        roots={roots}
        areaId={areaId}
        superFormationId={superFormationId}
      />
    </div>
  );
}


