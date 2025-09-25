"use server";

import { graphql } from "@/gql";
import { Scalars } from "@/gql/graphql";
import { graphqlQuery } from "@/graphql";
import { revalidatePath } from "next/cache";

export async function create(name?: string, description?: string)
{
  const mutation = graphql(`
    mutation addRegion(
      $name: String
      $description: String
    ) {
      action: addRegion(
        name: $name
        description: $description
      ) {
        id
      }
    }
  `);

  const data = await graphqlQuery(mutation, { name, description })
  return data.action.id;
}

export async function describe(regionId: Scalars["ID"]["input"], description: string) {
  const mutation = graphql(`
    mutation describeRegion(
      $id: ID!
      $description: String
    ) {
      action: describeRegion(
        id: $id
        description: $description
      ) {
        id description
      }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    {
      id: regionId,
      description: description || null,
    }
  );

  revalidatePath(`/regions/${data.action.id}`);

  return data.action.description;
}

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
