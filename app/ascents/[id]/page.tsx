import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";

const query = graphql(`
  query ascentData($id: ID!) {
    ascent (
      id: $id
    ) {
      climber { firstName lastName }
      climb { name }
    }
  }
`);

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await graphqlQuery(
    query,
    { id:  params.id }
  );

  const { ascent } = data;

  return (
    <div>Details the ascent of {ascent.climb.name} by {ascent.climber.firstName} {ascent.climber.lastName}</div>
  );
}
