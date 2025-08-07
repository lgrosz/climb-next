import { Image, Line, TopoWorld } from "@/components/context/TopoWorld";
import { FragmentType, graphql, useFragment } from "@/gql";

/** A query for a complete TopoWorld */
const Topo_CompleteFragment = graphql(`
  fragment Topo_CompleteFragment on Topo {
    title
    height
    width
    features {
      __typename id
      ... on TopoImageFeature {
        image { id alt }
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
`);

export function fromGql(frag: FragmentType<typeof Topo_CompleteFragment>): TopoWorld {
  const {
    title,
    width,
    height,
    features,
  } = useFragment(Topo_CompleteFragment, frag);

  const images: Image[] = features
    .filter(f => f.__typename === "TopoImageFeature")
    .map(f => ({
      featureId: f.id,
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
      featureId: f.id,
      geometry: {
        points: f.geometry.controlPoints
          .map(p => ([ p.x, p.y ])),
        degree: f.geometry.degree,
        knots: f.geometry.knots,
      },
      climbId: f.climb.id,
    }));

  const world: TopoWorld = {
      title: title ?? "",
      lines,
      images,
      size: { width, height },
  };

  return world;
}
