import DeleteFormationButton from '@/components/DeleteFormationButton'
import AddFormationNameForm from '@/components/AddFormationNameForm'
import RemoveFormationNameButton from '@/components/RemoveFormationNameButton'
import { GRAPHQL_ENDPOINT } from '@/constants'

var query = /* GraphQL */`query GetFormation($id: Int!) {
  formation(id: $id) { id, names }
}`

async function FormationNameListItem({ formationId, name, children }: { formationId: number, name: string, children: React.ReactNode }) {
  return (
    <li>
      <div>
        {children}
        <RemoveFormationNameButton formationId={formationId} name={name}>Remove</RemoveFormationNameButton>
      </div>
    </li>
  )
}

export default async function Page({ params }: { params: { id: string } }) {
  let {
    id,
    names
  } = await fetch(GRAPHQL_ENDPOINT, {
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
    .then(json => json.data.formation)

  // We will treat the official name as the first of the names list
  const name = names.find(Boolean)

  return (
    <div>
      <h1>Formation <i>{name}</i></h1>
      <h2>Names</h2>
      <div>
        <ul>
          {names.map((name: string, index: number) => (
            <FormationNameListItem key={index} formationId={id} name={name}>{name}</FormationNameListItem>
          ))}
        </ul>
        <AddFormationNameForm formationId={id} />
      </div>
      <DeleteFormationButton formationId={id}>Delete <i>{name}</i></DeleteFormationButton>
    </div>
  )
}

