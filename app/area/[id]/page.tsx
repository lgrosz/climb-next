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
          id
          names
          superArea {
            id
            names
          }
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
      <hr />
      <DeleteAreaButton areaId={area.id}>Delete <i>{name}</i></DeleteAreaButton>
    </div>
  )
}

