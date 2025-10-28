import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";
import AddAscentModal from "./AddAscentModal";

const query = graphql(`
  query AddAscentPageData($id: ID!) {
    climb(id: $id) { name }
    climbers {
      id firstName lastName
    }
  }
`);

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await graphqlQuery(query, { id });
  const { climb, climbers } = result;

  return (
    <AddAscentModal
      id={id}
      climb={{ name: climb.name ?? undefined }}
      climbers={climbers.map(c => ({
        id: c.id,
        firstName: c.firstName ?? "",
        lastName: c.lastName ?? "",
      }))}
    />
  );
}
