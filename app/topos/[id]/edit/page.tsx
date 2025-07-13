import { TopoWorld } from "@/components/context/TopoWorld";
import TopoEditor from "@/components/TopoEditor/TopoEditor";
import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";

const QUERY = graphql(`
    query topoById($id: ID!) {
      topo(id: $id) {
        title
        height
        width
      }
    }
`);

export default async function Page(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await graphqlQuery(QUERY, { id })

  const {
    title,
    width,
    height
  } = data.topo;

  const world: TopoWorld = {
      title: title ?? "",
      lines: [],
      images: [],
      size: { width, height },
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      <TopoEditor
        availableClimbs={[]}
        world={world}
      />
    </div>
  );
}

