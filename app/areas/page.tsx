import React from 'react'
import Link from 'next/link'
import CreateAreaButton from '@/components/CreateAreaButton'
import { GRAPHQL_ENDPOINT } from '@/constants'

var query = /* GraphQL */`query GetAreas {
  areas {
    id
    names
    superArea {
      id
    }
  }
}`

interface Area {
  id: number,
  names: string[],
  superArea: {
    id: number
  } | null
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

    if (area.superArea === null) {
      roots.push(areaRef)
    } else {
      const superArea = areaMap.get(area.superArea.id)

      if (superArea) {
        superArea.subAreas.push(areaRef)
      }
    }
  })

  return roots
}

async function NodeList({ nodes } : { nodes: Node[] }) {
  return (
    <ul>
      {nodes.map((node: Node) => (
        <React.Fragment key={`area-${node.id}`}>
          <li>
            <Link href={`/area/${node.id}`}>
              <i>{node.names.find(Boolean) ?? "Unnamed"}</i>
            </Link>
          </li>
          { node.subAreas ? <NodeList nodes={node.subAreas} /> : null }
        </React.Fragment>
      ))}
    </ul>
  )
}

export default async function Page() {
  let {
    areas
  }: { areas: Area[] } = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: query
    })
  })
    .then(r => r.json())
    .then(json => json.data)

  const roots = buildTree(areas)

  return (
    <div>
      <h1>Areas</h1>
      <NodeList nodes={roots} />
      <h2>Management</h2>
      <Link href={`/areas/create`}>Create area</Link>
    </div>
  );
}

