import Link from 'next/link'
import CreateFormationButton from '@/components/CreateFormationButton'

var query = /* GraphQL */`query GetFormations {
  formations { id, names }
}`

export default async function Page() {
  let {
    formations
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
      <h1>Formations</h1>
      <ul>
        {formations.map((formation: any, index: number) => (
          <li key={index}>
            <Link href={`/formation/${formation.id}`}>
              <i>{formation.names.find(Boolean) ?? "Unnamed"}</i>
            </Link>
          </li>
        ))}
      </ul>
      <CreateFormationButton>Create new formation</CreateFormationButton>
    </div>
  );
}

