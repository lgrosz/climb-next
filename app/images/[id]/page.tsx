import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";

const query = graphql(`
  query imageDownloadUrl(
    $id: ID!
  ){
    image(id: $id) {
      downloadUrl
      alt
    }
  }
`)

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const { image } = await graphqlQuery(query, { id: id });

  return (
    <img alt={image.alt ?? undefined} src={image.downloadUrl ?? undefined} />
  );
}
