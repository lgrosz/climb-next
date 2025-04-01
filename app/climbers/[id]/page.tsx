import { graphql } from '@/gql';
import { graphqlQuery } from '@/graphql';

const query = graphql(`
  query climberData($id: ID!) {
    climber(
      id: $id
    ) {
      id lastName firstName
    }
  }
`);

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await graphqlQuery(
    query,
    { id: params.id }
  );

  const { climber } = data;

  return (
    <h1>{climber.firstName} {climber.lastName}</h1>
  )
}


