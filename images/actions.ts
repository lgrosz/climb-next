import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";

export async function prepareImageUpload(name: string, alt?: string) {
  // TODO Raise error on failure

  const mutation = graphql(`
    mutation prepareImageUpload(
      $name: String!
      $alt: String
    ) {
      action: prepareImageUpload(
        name: $name
        alt: $alt
      ) {
        image { id }
        uploadUrl
      }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    { name, alt }
  );

  return ({
    image: {
      id: data.action.image.id,
    },
    uploadUrl: data.action.uploadUrl,
  })
}
