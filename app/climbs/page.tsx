import Link from 'next/link'

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
      <ul>
        {climbs.map((climb, index) => (
          <li key={index}>
            <Link href={`/climb/${climb.id}`}>
              <i>{climb.names.find(Boolean) ?? "Unnamed"}</i>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
