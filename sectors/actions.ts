"use server";

import { graphql } from "@/gql";
import { Scalars } from "@/gql/graphql";
import { graphqlQuery } from "@/graphql";
import { revalidatePath } from "next/cache";


export async function rename(sectorId: Scalars["ID"]["input"], name: string) {
  const mutation = graphql(`
    mutation renameSector(
      $id: ID!
      $name: String
    ) {
      action: renameSector(
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
      id: sectorId,
      name: name || null,
    }
  );

  revalidatePath(`/sectors/${data.action.id}`);

  return data.action.name;
}
