import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";
import Link from "next/link";

const query = graphql(`
  query imageDownloadUrl(
    $id: ID!
  ){
    image(id: $id) {
      alt
      formations { id name }
    }
  }
`)

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const { image } = await graphqlQuery(query, { id: id });

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <img
        src={`/images/${id}/download`}
        alt={image.alt ?? ""}
        className="w-full h-auto block"
      />
      {image.formations.length > 0 && (
        <div className="mt-6">
          <h2>Formations in this image</h2>
          <ul>
            {image.formations.map((formation) => (
              <li key={formation.id}>
                <Link href={`/formations/${formation.id}`}>
                  {formation.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
