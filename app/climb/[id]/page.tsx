import DeleteClimbButton from '@/components/DeleteClimbButton'
import AddClimbNameForm from '@/components/AddClimbNameForm'
import RemoveClimbNameButton from '@/components/RemoveClimbNameButton'
import { GRAPHQL_ENDPOINT } from '@/constants'

var query = /* GraphQL */`query GetClimb($id: Int!) {
  climb(id: $id) { id, names }
}`

async function ClimbNameListItem({ climbId, name, children }: { climbId: number, name: string, children: React.ReactNode }) {
  return (
    <li>
      <div>
        {children}
        <RemoveClimbNameButton climbId={climbId} name={name}>Remove</RemoveClimbNameButton>
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
    .then(json => json.data.climb)

  // We will treat the official name as the first of the names list
  const name = names.find(Boolean)

  return (
    <div>
      <h1>Climb <i>{name}</i></h1>
      <h2>Names</h2>
      <div>
        <ul>
          {names.map((name: string, index: number) => (
            <ClimbNameListItem key={index} climbId={id} name={name}>{name}</ClimbNameListItem>
          ))}
        </ul>
        <AddClimbNameForm climbId={id} />
      </div>
      <DeleteClimbButton climbId={id}>Delete <i>{name}</i></DeleteClimbButton>
    </div>
  )
}

