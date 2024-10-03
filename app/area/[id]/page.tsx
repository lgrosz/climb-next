import DeleteAreaButton from '@/components/DeleteAreaButton'
import AddAreaNameForm from '@/components/AddAreaNameForm'
import RemoveAreaNameButton from '@/components/RemoveAreaNameButton'
import { GRAPHQL_ENDPOINT } from '@/constants'
import Link from 'next/link'

async function AreaNameListItem({ areaId, name, children }: { areaId: number, name: string, children: React.ReactNode }) {
  return (
    <li>
      <div>
        {children}
        <RemoveAreaNameButton areaId={areaId} name={name}>Remove</RemoveAreaNameButton>
      </div>
    </li>
  )
}

interface Area {
  id: number,
  names: string[],
  superArea: {
    id: number,
    names: string[]
  } | null,
  subAreas: {
    id: number,
    names: string[]
  }[],
  formations: {
    id: number,
    names: string[]
  }[],
  climbs: {
    id: number,
    names: string[]
  }[],
}

export default async function Page({ params }: { params: { id: string } }) {
  let area: Area = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `query GetArea($id: Int!) {
        area(
          id: $id
        ) {
          id names
          superArea { id names }
          subAreas { id names }
          formations { id names }
          climbs { id names }
        }
      }`,
      variables: { id: parseInt(params.id) }
    })
  })
    .then(r => r.json())
    .then(json => json.data.area)

  // We will treat the official name as the first of the names list
  const name = area.names.find(Boolean)

  return (
    <div>
      <h1>Area <i>{name}</i></h1>
      <h2>Names</h2>
      <div>
        <ul>
          {area.names.map((name: string, index: number) => (
            <AreaNameListItem key={index} areaId={area.id} name={name}>{name}</AreaNameListItem>
          ))}
        </ul>
        <AddAreaNameForm areaId={area.id} />
      </div>
      <h2>Super Area</h2>
      {area.superArea ?
        <Link href={`/area/${area.superArea.id}`}>{area.superArea.names.find(Boolean) ?? "Unnamed"}</Link>
        :
        "No ancestor"
      }
      <h2>Sub Areas</h2>
      <ul>
        {area.subAreas.map((subarea) => (
          <li key={`subarea-${subarea.id}`}>
            <Link href={`/area/${subarea.id}`}>{subarea.names.find(Boolean) ?? "Unnamed"}</Link>
          </li>
        ))}
        <li>
          <Link
            href={{
              pathname: "/areas/create",
              query: { "super-area-id": area.id },
            }}
          >
            Create sub area
          </Link>
        </li>
      </ul>
      <h2>Formations</h2>
      <ul>
        {area.formations.map((formation) => (
          <li key={`formation-${formation.id}`}>
            <Link href={`/formation/${formation.id}`}>{formation.names.find(Boolean) ?? "Unnamed"}</Link>
          </li>
        ))}
        <li>
          <Link
            href={{
              pathname: "/formations/create",
              query: { "area-id": area.id },
            }}
          >
            Create formation
          </Link>
        </li>
      </ul>
      <h2>Climbs</h2>
      <ul>
        {area.climbs.map((climb) => (
          <li key={`climb-${climb.id}`}>
            <Link href={`/climb/${climb.id}`}>{climb.names.find(Boolean) ?? "Unnamed"}</Link>
          </li>
        ))}
        <li>
          <Link
            href={{
              pathname: "/climbs/create",
              query: { "area-id": area.id },
            }}
          >
            Create climb
          </Link>
        </li>
      </ul>
      <hr />
      <DeleteAreaButton areaId={area.id}>Delete <i>{name}</i></DeleteAreaButton>
    </div>
  )
}

