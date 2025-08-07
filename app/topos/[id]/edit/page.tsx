import { graphqlQuery } from "@/graphql";
import EditTopoClient from "./EditTopoClient";
import { graphql } from "@/gql";
import { fromGql } from "@/lib/TopoWorld";

const query = graphql(`
  query Topo_ById($id: ID!) {
    topo(id: $id) {
      features {
        __typename
        ... on TopoImageFeature {
          image {
            formations {
              climbs { id name }
            }
          }
        }
        ... on TopoPathFeature {
          climb { id name }
        }
      }
      ...Topo_CompleteFragment
    }
  }
`);

export default async function Page(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await graphqlQuery(query, { id });
  const world = fromGql(result.topo);

  const climbs = result.topo.features
    .map(f => {
      if (f.__typename === "TopoImageFeature") {
        return f.image.formations
          .map(f => f.climbs)
          .flat()
          .map(c => ({ id: c.id, name: c.name ?? "" }))
      } else if (f.__typename === "TopoPathFeature") {
        return { id: f.climb.id, name: f.climb.name ?? "" }
      } else {
        return null
      }
    })
    .flat()
    .filter(f => f !== null)
    .reduce((acc, curr) => {
      if (!acc.some(c => c.id === curr.id)) {
        acc.push(curr);
      }

      return acc;
    }, [] as { id: string; name: string }[]);

  return (
    <EditTopoClient
      availableClimbs={climbs}
      world={world}
    />
  );
}

