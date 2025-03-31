import { graphql } from "@/gql";
import { Scalars } from "@/gql/graphql";
import { graphqlQuery } from "@/graphql";
import { revalidatePath } from "next/cache";

export async function create(
  climbId: Scalars["ID"]["input"],
  climberId: Scalars["ID"]["input"]
) {
  // TODO Raise error on failure

  const mutation = graphql(`
    mutation addAscent(
      $climbId: ID!
      $climberId: ID!
    ) {
      action: addAscent(
        climbId: $climbId
        climberId: $climberId
      ) { id }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    {
      climbId: climbId,
      climberId: climberId
    }
  );

  let id = data.action.id;

  revalidatePath(`/climb/${climbId}`);

  return id;
}

