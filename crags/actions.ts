"use server";

import { graphql } from "@/gql";
import { Scalars } from "@/gql/graphql";
import { graphqlQuery } from "@/graphql";
import { revalidatePath } from "next/cache";

export async function create(
  name?: string,
  description?: string,
  regionId?: Scalars["ID"]["input"]
) {
  const mutation = graphql(`
    mutation addCrag(
      $name: String
      $description: String
      $regionId: ID
    ) {
      action: addCrag(
        name: $name
        description: $description
        regionId: $regionId
      ) {
        id
      }
    }
  `);

  const {
    action: { id }
  } = await graphqlQuery(mutation, { name, description, regionId });

  return id;
}

export async function describe(cragId: Scalars["ID"]["input"], description: string) {
  const mutation = graphql(`
    mutation describeCrag(
      $id: ID!
      $description: String
    ) {
      action: describeCrag(
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
      id: cragId,
      description: description || null,
    }
  );

  revalidatePath(`/crags/${data.action.id}`);

  return data.action.description;
}

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
