import CreateAreaForm from "@/components/CreateAreaForm"
import { GRAPHQL_ENDPOINT } from "@/constants";

interface Area {
  id: number,
  names: string[],
}

export default async function Form() {
  let areas: Area[] = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `query GetAreas {
        areas { id names }
      }`
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

