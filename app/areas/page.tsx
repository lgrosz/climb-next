import Link from 'next/link'
import CreateAreaButton from '@/components/CreateAreaButton'

var query = /* GraphQL */`query GetAreas {
  areas { id, names }
}`

export default async function Page() {
  let {
    areas
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
      <h1>Areas</h1>
      <ul>
        {areas.map((area: any, index: number) => (
          <li key={index}>
            <Link href={`/area/${area.id}`}>
              <i>{area.names.find(Boolean) ?? "Unnamed"}</i>
            </Link>
          </li>
        ))}
      </ul>
      <CreateAreaButton>Create new area</CreateAreaButton>
    </div>
  );
}

