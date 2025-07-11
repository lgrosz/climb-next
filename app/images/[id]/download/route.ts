import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";

const QUERY = graphql(`
  query downloadUrlByImageId($id: ID!) {
    image(id: $id) { downloadUrl }
  }
`);

// TODO We need to do some sort of caching to avoid hammering the GraphQL
// server.. here are some solutions..
// - Get the TTL from the GraphQL query
// - Use the X-Amz-Expires parameter of the download url
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await graphqlQuery(QUERY, { id })
  const url = new URL(data.image.downloadUrl ?? "");

  return Response.redirect(url, 307);
}
