import DeleteAreaButton from '@/components/DeleteAreaButton'
import AddAreaNameForm from '@/components/AddAreaNameForm'
import RemoveAreaNameButton from '@/components/RemoveAreaNameButton'

var query = /* GraphQL */`query GetArea($id: Int!) {
  area(id: $id) { id, names }
}`

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

export default async function Page({ params }: { params: { id: string } }) {
  let {
    id,
    names
  } = await fetch("http://127.0.0.1:8000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: query,
      variables: { id: parseInt(params.id) }
    })
  })
    .then(r => r.json())
    .then(json => json.data.area)

  // We will treat the official name as the first of the names list
  const name = names.find(Boolean)

  return (
    <div>
      <h1>Area <i>{name}</i></h1>
      <h2>Names</h2>
      <div>
        <ul>
          {names.map((name: string, index: number) => (
            <AreaNameListItem key={index} areaId={id} name={name}>{name}</AreaNameListItem>
          ))}
        </ul>
        <AddAreaNameForm areaId={id} />
      </div>
      <DeleteAreaButton areaId={id}>Delete <i>{name}</i></DeleteAreaButton>
    </div>
  )
}

