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
        <Link href={`/areas`}>Back to areas</Link>
      }
      <h2>Sub Areas</h2>
      {area.subAreas.length < 1 ? <p>No sub areas</p> : null}
      <ul>
        {area.subAreas.map((subarea) => (
          <li key={`subarea-${subarea.id}`}>
            <Link href={`/area/${subarea.id}`}>{subarea.names.find(Boolean) ?? "Unnamed"}</Link>
          </li>
        ))}
        { /* TODO add-subarea by linking to create area form with some query parameters */ }
      </ul>
      <h2>Formations</h2>
      {area.formations.length < 1 ? <p>No formations</p> : null}
      <ul>
        {area.formations.map((formation) => (
          <li key={`formation-${formation.id}`}>
            <Link href={`/formation/${formation.id}`}>{formation.names.find(Boolean) ?? "Unnamed"}</Link>
          </li>
        ))}
        { /* TODO add-formation by linking to create formation form with some query parameters */ }
      </ul>
      <h2>Climbs</h2>
      {area.climbs.length < 1 ? <p>No climbs</p> : null}
      <ul>
        {area.climbs.map((climb) => (
          <li key={`climb-${climb.id}`}>
            <Link href={`/climb/${climb.id}`}>{climb.names.find(Boolean) ?? "Unnamed"}</Link>
          </li>
        ))}
        { /* TODO add-climb by linking to create climb form with some query parameters */ }
      </ul>
      <hr />
      <DeleteAreaButton areaId={area.id}>Delete <i>{name}</i></DeleteAreaButton>
    </div>
  )
}

