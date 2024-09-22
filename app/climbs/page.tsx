import Link from 'next/link'
import CreateClimbButton from '@/components/CreateClimbButton'

var query = /* GraphQL */`query GetClimbs {
  climbs { id, names }
}`

export default async function Page() {
  let {
    climbs
  } = await fetch("http://127.0.0.1:8000/", {
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

  return (
    <div>
      <h1>Climbs</h1>
      <ul>
        {climbs.map((climb: any, index: number) => (
          <li key={index}>
            <Link href={`/climb/${climb.id}`}>
              <i>{climb.names.find(Boolean) ?? "Unnamed"}</i>
            </Link>
          </li>
        ))}
      </ul>
      <CreateClimbButton>Create new climb</CreateClimbButton>
    </div>
  );
}

