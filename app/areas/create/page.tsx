import CreateAreaForm from "@/components/CreateAreaForm"
import { GRAPHQL_ENDPOINT } from "@/constants";

var query = /* GraphQL */`query GetAreas {
  areas {
    id
    names
  }
}`

export default async function Form() {
  let {
    areas
  }: { areas: { id: number, names: string[] }[] } = await fetch(GRAPHQL_ENDPOINT, {
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
      <h1>Create area</h1>
      <CreateAreaForm
        areas={areas.map(area => ({
          id: area.id,
          name: area.names.find(Boolean) ?? "Unnamed"
        }))}
      />
    </div>
  );
}

