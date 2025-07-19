import { TopoWorld, Image, Line } from "@/components/context/TopoWorld";
import TopoEditor from "@/components/TopoEditor/TopoEditor";
import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";

const QUERY = graphql(`
    query topoById($id: ID!) {
      topo(id: $id) {
        title
        height
        width
        features {
          __typename
          ... on TopoImageFeature {
            image {
              id
              alt
              formations {
                climbs { id name }
              }
            }
            dest { min { x y } max { x y } }
            source { min { x y } max { x y } }
          }
          ... on TopoPathFeature {
            climb { id name }
            geometry {
              __typename
              ... on BasisSpline {
                degree knots
                controlPoints { x y }
              }
            }
          }
        }
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
    height,
    features,
  } = data.topo;

  const images: Image[] = features
    .filter(f => f.__typename === "TopoImageFeature")
    .map(f => ({
      id: f.image.id,
      alt: f.image.alt ?? undefined,
      dest: {
        min: { x: f.dest.min.x, y: f.dest.min.y },
        max: { x: f.dest.max.x, y: f.dest.max.y }
      },
      source: f.source ? {
        min: { x: f.source.min.x, y: f.source.min.y },
        max: { x: f.source.max.x, y: f.source.max.y }
      } : undefined,
    }));

  const lines: Line[] = features
    .filter(f => f.__typename === "TopoPathFeature")
    .map(f => ({
      geometry: {
        points: f.geometry.controlPoints
          .map(p => ([ p.x, p.y ])),
        degree: f.geometry.degree,
        knots: f.geometry.knots,
      },
      climbId: f.climb.id,
    }));

  const climbs = features
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

  const world: TopoWorld = {
      title: title ?? "",
      lines,
      images,
      size: { width, height },
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      <TopoEditor
        availableClimbs={climbs}
        world={world}
      />
    </div>
  );
}

