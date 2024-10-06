import Link from 'next/link'
import DeleteClimbButton from '@/components/DeleteClimbButton'
import AddClimbNameForm from '@/components/AddClimbNameForm'
import RemoveClimbNameButton from '@/components/RemoveClimbNameButton'
import { GRAPHQL_ENDPOINT } from '@/constants'

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

interface Climb {
  id: number,
  names: string[],
  area: { id: number, names: string[] } | null,
  formation: { id: number, names: string[] } | null,
}

export default async function Page({ params }: { params: { id: string } }) {
  let {
    id,
    names,
    ...climb
  }: Climb = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `query GetClimb($id: Int!) {
        climb(
          id: $id
        ) {
          id names
          area { id names }
          formation { id names }
        }
      }`,
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
      <h2>{climb.area ? "Area" : climb.formation ? "Formation" : "No ancestor" }</h2>
      {climb.area ?
        <Link href={`/area/${climb.area.id}`}>{climb.area.names.find(Boolean) ?? "Unnamed"}</Link>
        : climb.formation ?
        <Link href={`/formation/${climb.formation.id}`}>{climb.formation.names.find(Boolean) ?? "Unnamed"}</Link>
        :
        "No ancestor"
      }
      <hr />
      <DeleteClimbButton climbId={id}>Delete <i>{name}</i></DeleteClimbButton>
    </div>
  )
}

