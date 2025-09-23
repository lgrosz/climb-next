"use server";

import { graphql } from "@/gql";
import { Scalars } from "@/gql/graphql";
import { graphqlQuery } from "@/graphql";
import { revalidatePath } from "next/cache";


export async function rename(cragId: Scalars["ID"]["input"], name: string) {
  const mutation = graphql(`
    mutation renameCrag(
      $id: ID!
      $name: String
    ) {
      action: renameCrag(
        id: $id
        name: $name
      ) {
        id name
      }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    {
      id: cragId,
      name: name || null,
    }
  );

  revalidatePath(`/crags/${data.action.id}`);

  return data.action.name;
}
