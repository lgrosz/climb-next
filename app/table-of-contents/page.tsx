import React from 'react'
import Link from 'next/link'
import { GRAPHQL_ENDPOINT } from '@/constants'

interface Area {
  id: number,
  names: string[],
  superArea: { id: number } | null
}

interface Formation {
  id: number,
  names: string[],
  area: { id: number } | null;
  superFormation: { id: number } | null;
}

interface Climb {
  id: number,
  names: string[],
  area: { id: number } | null;
  formation: { id: number } | null;
}

interface TreeNode {
  id: number,
  name: string,
  type:
    "area" |
    "formation" |
    "climb"
  children: TreeNode[]
}

function buildTree(areas: Area[], formations: Formation[], climbs: Climb[]): TreeNode[] {
  const areaMap: Map<number, TreeNode> = new Map();
  const formationMap: Map<number, TreeNode> = new Map();
  const climbMap: Map<number, TreeNode> = new Map();

  areas.forEach(area => {
    areaMap.set(area.id, {
      id: area.id,
      name: area.names.find(Boolean) ?? "Unnamed",
      type: 'area',
      children: []
    });
  });

  formations.forEach(formation => {
    formationMap.set(formation.id, {
      id: formation.id,
      name: formation.names.find(Boolean) ?? "Unnamed",
      type: 'formation',
      children: []
    });
  });

  climbs.forEach(climb => {
    climbMap.set(climb.id, {
      id: climb.id,
      name: climb.names.find(Boolean) ?? "Unnamed",
      type: 'climb',
      children: []
    });
  });

  let roots: TreeNode[] = [];

  climbs.forEach(climb => {
    const node = climbMap.get(climb.id)!;
    if(climb.formation) {
      formationMap.get(climb.formation.id)?.children.push(node);
    } else if (climb.area) {
      areaMap.get(climb.area.id)?.children.push(node);
    } else {
      roots.push(node);
    }
  })

  formations.forEach(formation => {
    const node = formationMap.get(formation.id)!;
    if (formation.superFormation) {
      formationMap.get(formation.superFormation.id)?.children.push(node);
    } else if (formation.area) {
      areaMap.get(formation.area.id)?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  areas.forEach(area => {
    const node = areaMap.get(area.id)!;
    if (area.superArea) {
      areaMap.get(area.superArea.id)?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

async function Node({ node }: { node : TreeNode }) {
  let text = "";
  let href = "/";

  if (node.type == "area") {
    text = "[a]"
    href = "/area/"
  } else if (node.type == "formation") {
    text = "[f]"
    href = "/formation/"
  } else if (node.type == "climb") {
    text = "[c]"
    href = "/climb/"
  }

  text = `${text} ${node.name}`
  href = `${href}${node.id}`

  return (
    <li>
      <Link href={href}>{text}</Link>
      <ul>
      {node.children.map((child, index) => (
        <Node key={index} node={child} />
      ))}
      </ul>
    </li>
  );
}

export default async function Page() {
  let {
    areas,
    formations,
    climbs,
  }: {
    areas: Area[],
    formations: Formation[],
    climbs: Climb[]
  } = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `query GetEntities {
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
        climbs {
          id
          names
          area { id }
          formation { id }
        }
      }`
    })
  })
    .then(r => r.json())
    .then(json => json.data)

  const roots = buildTree(areas, formations, climbs)

  return (
    <div>
      <h1>Table of Contents</h1>
      <ul>
        {roots.map((node, index) => (
          <Node key={index} node={node} />
        ))}
      </ul>
    </div>
  );
}

