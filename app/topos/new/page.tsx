import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";
import NewTopoClient from "./NewTopoClient";

const query = graphql(`
  query newTopoClimbs {
    climbs { id name }
  }
`)

export default async function Page() {
  const { climbs } = await graphqlQuery(query);
  const availableClimbs = climbs.map(climb => ({
    id: climb.id,
    name: climb.name ?? ""
  }))

  return (
    <NewTopoClient
      availableClimbs={availableClimbs}
    />
  );
}
