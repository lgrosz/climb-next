"use server";

import { graphql } from "@/gql";
import { Scalars } from "@/gql/graphql";
import { graphqlQuery } from "@/graphql";
import { revalidatePath } from "next/cache";


export async function rename(regionId: Scalars["ID"]["input"], name: string) {
  const mutation = graphql(`
    mutation renameRegion(
      $id: ID!
      $name: String
    ) {
      action: renameRegion(
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
      id: regionId,
      name: name || null,
    }
  );

  revalidatePath(`/regions/${data.action.id}`);

  return data.action.name;
}
