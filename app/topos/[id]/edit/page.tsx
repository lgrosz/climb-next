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
            image { id alt }
            dest { min { x y } max { x y } }
            source { min { x y } max { x y } }
          }
          ... on TopoPathFeature {
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

  // TODO get all available climbs
  // - those already in the lines
  // - climbs of the formations in the image

  const world: TopoWorld = {
      title: title ?? "",
      lines,
      images,
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

