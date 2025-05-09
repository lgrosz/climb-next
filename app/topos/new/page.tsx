import TopoEditor from "@/components/TopoEditor/TopoEditor";
import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";

const query = graphql(`
  query newTopoClimbs {
    climbs { id name }
    images { id alt downloadUrl }
  }
`)

export default async function Page() {
  const { climbs, images } = await graphqlQuery(query);

  const availableClimbs = climbs.map(climb => ({
    id: climb.id,
    name: climb.name ?? ""
  }))

  const availableImages = images.map(({ id, alt, downloadUrl: src }) => ({
    id,
    alt: alt || undefined,
    src: src || undefined,
  }))

  return (
    <div className="w-screen h-screen overflow-hidden">
      <TopoEditor
        availableClimbs={availableClimbs}
        availableImages={availableImages}
      />
    </div>
  );
}
