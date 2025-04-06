import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";

const query = graphql(`
  query imageDownloadUrl(
    $id: ID!
  ){
    image(id: $id) {
      downloadUrl
    }
  }
`)

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const data = await graphqlQuery(query, { id: id });

  // TODO alt text
  return (
    <img src={data.image.downloadUrl ?? undefined}>
    </img>
  );
}
