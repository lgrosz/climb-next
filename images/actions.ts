"use server";

import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";

export async function prepareImageUpload(name: string, alt?: string, formationIds?: string[]) {
  // TODO Raise error on failure

  const mutation = graphql(`
    mutation prepareImageUpload(
      $name: String!
      $alt: String
      $formationIds: [ID!]
    ) {
      action: prepareImageUpload(
        name: $name
        alt: $alt
        formationIds: $formationIds
      ) {
        image { id }
        uploadUrl
      }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    { name, alt, formationIds }
  );

  return ({
    image: {
      id: data.action.image.id,
    },
    uploadUrl: data.action.uploadUrl,
  })
}
