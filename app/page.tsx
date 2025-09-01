import React from 'react'
import Link from 'next/link'
import { graphqlQuery } from '@/graphql'
import { graphql } from '@/gql'

interface TreeNode {
  id: string,
  name: string | null,
  type:
    "area" |
    "formation" |
    "climb"
  children: TreeNode[]
}

// TODO This can probably come from a graphql-codegen fragment
type Areas = {
    __typename?: "Area";
    id: string;
    name?: string | null;
    parent?: {
        __typename: "Area";
        id: string;
    } | null;
}[];

// TODO This can probably come from a graphql-codegen fragment
type Formations = {
    __typename?: "Formation";
    id: string;
    name?: string | null;
    parent?: {
        __typename: "Area";
        id: string;
    } | {
        __typename: "Formation";
        id: string;
    } | null;
}[];

// TODO This can probably come from a graphql-codegen fragment
type Climbs = {
    __typename?: "Climb";
    id: string;
    name?: string | null;
    parent?: {
        __typename: "Area";
        id: string;
    } | {
        __typename: "Formation";
        id: string;
    } | null;
}[];

function buildTree(areas: Areas, formations: Formations, climbs: Climbs): TreeNode[] {
  const areaMap: Map<string, TreeNode> = new Map();
  const formationMap: Map<string, TreeNode> = new Map();
  const climbMap: Map<string, TreeNode> = new Map();

  areas.forEach(area => {
    if (area.id !== undefined && area.name !== undefined) {
      areaMap.set(area.id, {
        id: area.id,
        name: area.name,
        type: 'area',
        children: []
      });
    }
  });

  formations.forEach(formation => {
    if (formation.id !== undefined && formation.name !== undefined) {
      formationMap.set(formation.id, {
        id: formation.id,
        name: formation.name,
        type: 'formation',
        children: []
      });
    }
  });

  climbs.forEach(climb => {
    if (climb.id !== undefined && climb.name !== undefined) {
      climbMap.set(climb.id, {
        id: climb.id,
        name: climb.name,
        type: 'climb',
        children: []
      });
    }
  });

  const roots: TreeNode[] = [];

  climbs.forEach(climb => {
    if (climb.id === undefined) return;
    const node = climbMap.get(climb.id);
    if (!node) return;

    const parentId = climb.parent?.id;
    if (parentId !== undefined) {
      if (climb.parent?.__typename === "Formation") {
        formationMap.get(parentId)?.children.push(node);
      } else if (climb.parent?.__typename === "Area") {
        areaMap.get(parentId)?.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  formations.forEach(formation => {
    if (formation.id === undefined) return;
    const node = formationMap.get(formation.id);
    if (!node) return;

    if (formation.parent?.id !== undefined) {
      if (formation.parent.__typename === "Formation") {
        formationMap.get(formation.parent.id)?.children.push(node);
      } else {
        areaMap.get(formation.parent.id)?.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  areas.forEach(area => {
    if (area.id === undefined) return;
    const node = areaMap.get(area.id);
    if (!node) return;

    if (area.parent?.id !== undefined && area.parent.__typename === "Area") {
      areaMap.get(area.parent.id)?.children.push(node);
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

const allEntities = graphql(`
  query allEntities {
    formations {
      id
      name
      parent {
        __typename
        ... on Formation { id }
      }
    }
    climbs {
      id
      name
      parent {
        __typename
        ... on Formation { id }
      }
    }
  }
`);

export default async function Page() {
  const data = await graphqlQuery(allEntities)

  const { formations, climbs } = data;
  const roots = buildTree([], formations, climbs)

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


