import DeleteClimbButton from '@/components/DeleteClimbButton'
import AddClimbNameForm from '@/components/AddClimbNameForm'

var query = /* GraphQL */`query GetClimb($id: Int!) {
  climb(id: $id) { id, names }
}`

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
            <li key={index}>{name}</li>
          ))}
        </ul>
        <AddClimbNameForm climbId={id} />
      </div>
      <DeleteClimbButton climbId={id}>Delete <i>{name}</i></DeleteClimbButton>
    </div>
  )
}

