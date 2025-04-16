import TopoEditor from "@/components/TopoEditor/TopoEditor";
import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";

const query = graphql(`
  query newTopoClimbs {
    climbs { id name }
  }
`)

export default async function Page() {
  const { climbs } = await graphqlQuery(query);
  const availableClimbs = climbs.map(climb => ({
    id: climb.id,
    name: climb.name ?? ""
  }))

  return (
    <div className="w-screen h-screen overflow-hidden">
      <TopoEditor
        availableClimbs={availableClimbs}
      />
    </div>
  );
}
