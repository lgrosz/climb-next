import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";

export async function prepareImageUpload(name: string) {
  // TODO Raise error on failure

  const mutation = graphql(`
    mutation prepareImageUpload(
      $name: String!
    ) {
      action: prepareImageUpload(
        name: $name
      ) {
        image { id }
        uploadUrl
      }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    { name: name }
  );

  return ({
    image: {
      id: data.action.image.id,
    },
    uploadUrl: data.action.uploadUrl,
  })
}
