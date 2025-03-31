import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";
import { revalidatePath } from "next/cache";

export async function create(
  firstName: string,
  lastName: string,
) {
  const mutation = graphql(`
    mutation addClimber(
      $firstName: String!
      $lastName: String!
    ) {
      action: addClimber(
        firstName: $firstName
        lastName: $lastName
      ) { id }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    {
      firstName: firstName,
      lastName: lastName
    }
  );

  revalidatePath("/climbers");

  return data.action.id;
}
