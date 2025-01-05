import React from 'react'
import Link from 'next/link'
import { GRAPHQL_ENDPOINT } from '@/constants'
import { query } from '@/graphql'

interface AreaParent {
  __typename: string,
  id: number
}

interface Area {
  id: number,
  name: string | null,
  parent: AreaParent | null,
}

interface FormationParent {
  __typename: string,
  id: number
}

interface Formation {
  id: number,
  name: string | null,
  parent: FormationParent | null,
}

interface ClimbParent {
  __typename: string,
  id: number,
}

interface Climb {
  id: number,
  name: string | null,
  parent: ClimbParent | null,
}

interface TreeNode {
  id: number,
  name: string | null,
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
      name: area.name,
      type: 'area',
      children: []
    });
  });

  formations.forEach(formation => {
    formationMap.set(formation.id, {
      id: formation.id,
      name: formation.name,
      type: 'formation',
      children: []
    });
  });

  climbs.forEach(climb => {
    climbMap.set(climb.id, {
      id: climb.id,
      name: climb.name,
      type: 'climb',
      children: []
    });
  });

  let roots: TreeNode[] = [];

  climbs.forEach(climb => {
    const node = climbMap.get(climb.id)!;

    if (climb.parent) {
      if (climb.parent.__typename == "Formation") {
        formationMap.get(climb.parent.id)?.children.push(node);
      } else if (climb.parent.__typename == "Area") {
        areaMap.get(climb.parent.id)?.children.push(node);
      }
    } else {
      roots.push(node);
    }
  })

  formations.forEach(formation => {
    const node = formationMap.get(formation.id)!;

    if (formation.parent) {
      if (formation.parent.__typename == "Formation") {
        formationMap.get(formation.parent.id)?.children.push(node);
      } else {
        areaMap.get(formation.parent.id)?.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  areas.forEach(area => {
    const node = areaMap.get(area.id)!;

    if (area.parent) {
      if (area.parent.__typename == "Area") {
        areaMap.get(area.parent.id)?.children.push(node);
      }
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
    href = "/areas/"
  } else if (node.type == "formation") {
    text = "[f]"
    href = "/formations/"
  } else if (node.type == "climb") {
    text = "[c]"
    href = "/climbs/"
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

const dataQuery = `
  query {
    areas {
      id
      name
      parent {
        __typename
        ... on Area { id }
      }
    }
    formations {
      id
      name
      parent {
        __typename
        ... on Area { id }
        ... on Formation { id }
      }
    }
    climbs {
      id
      name
      parent {
        __typename
        ... on Area { id }
        ... on Formation { id }
      }
    }
  }
`

export default async function Page() {
  const result = await query(GRAPHQL_ENDPOINT, dataQuery, null)
    .then(r => r.json());
  const { data, errors } = result;

  if (errors) {
    console.error(errors);
    return <div>There was an error generating the page.</div>
  }

  const { areas, formations, climbs } = data;
  const roots = buildTree(areas, formations, climbs)

  return (
    <div>
      <h1>Content</h1>
      <ul>
        {roots.map((node, index) => (
          <Node key={index} node={node} />
        ))}
      </ul>
    </div>
  );
}


