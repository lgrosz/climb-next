import { DateInterval } from "@/date-interval";
import { graphql } from "@/gql";
import { Scalars } from "@/gql/graphql";
import { graphqlQuery } from "@/graphql";
import { revalidatePath } from "next/cache";

export async function create(
  climbId: Scalars["ID"]["input"],
  climberId: Scalars["ID"]["input"],
  dateWindow?: DateInterval | null
) {
  // TODO Raise error on failure

  const mutation = graphql(`
    mutation addAscent(
      $climbId: ID!
      $climberId: ID!
      $dateWindow: DateInterval
    ) {
      action: addAscent(
        climbId: $climbId
        climberId: $climberId
        dateWindow: $dateWindow
      ) { id }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    {
      climbId: climbId,
      climberId: climberId,
      dateWindow: dateWindow ? dateWindow.toISOString() : null
    }
  );

  let id = data.action.id;

  revalidatePath(`/climb/${climbId}`);

  return id;
}

