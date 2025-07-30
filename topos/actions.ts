"use server";

import { graphql } from "@/gql";
import { Scalars, TopoFeatureInput } from "@/gql/graphql";
import { graphqlQuery } from "@/graphql";

export async function create(title: string | null, width: number, height: number) {
  const mutation = graphql(`
    mutation addTopo(
      $title: String
      $width: Float!
      $height: Float!
    ) {
      action: addTopo(
        title: $title
        width: $width
        height: $height
      ) {
        id
      }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    { title, width, height }
  );

  return data.action.id;
}

export async function title(id: Scalars["ID"]["input"], title: string | null) {
  const mutation = graphql(`
    mutation titleTopo(
      $id: ID!,
      $title: String
    ) {
      action: topo(id: $id) {
        title(title: $title) {
          id
        }
      }
    }
  `);

  await graphqlQuery(
    mutation,
    { id, title, }
  );
}

interface Point {
  x: number,
  y: number,
}

interface Rect {
  min: Point,
  max: Point,
}

interface AbstractTopoFeature {
  type: string,
}

interface TopoImageFeature extends AbstractTopoFeature {
  type: "image",
  topoId: Scalars['ID']['input'],
  imageId: Scalars['ID']['input'],
  sourceCrop?: Rect,
  destCrop: Rect,
}

interface TopoPathFeature extends AbstractTopoFeature {
  type: "path"
  climbId: Scalars["ID"]["input"],
  geometry: {
    points: [number, number][],
    degree: number,
    knots: number[],
  }
}

type TopoFeature = 
  | TopoImageFeature
  | TopoPathFeature;

// Converts internal TopoFeature type to GraphQL TopoFeatureInput
function toTopoFeatureInput(feature: TopoFeature) {
  let gqlFeature: TopoFeatureInput = { };

  if (feature.type === "image") {
    gqlFeature.image = {
      imageId: parseInt(feature.imageId),
      dest: feature.destCrop,
      source: feature.sourceCrop
    }
  } else if (feature.type === "path") {
    gqlFeature.path = {
      climbId: feature.climbId,
      geometry: {
        basisSpline: {
          controlPoints: feature.geometry.points.map(p => ({ x: p[0], y: p[1] })),
          degree: feature.geometry.degree,
          knots: [...feature.geometry.knots],
        }
      }
    }
  }

  return gqlFeature;
}

export async function addFeature(topoId: Scalars['ID']['input'], feature: TopoFeature) {
  const mutation = graphql(`
    mutation addTopoFeature(
      $topoId: ID!
      $feature: TopoFeatureInput!
    ) {
      action: topo(id: $topoId) {
        addFeature(feature: $feature) {
          id
        }
      }
    }
  `);

  const gqlFeature = toTopoFeatureInput(feature);

  await graphqlQuery(
    mutation,
    {
      topoId,
      feature: gqlFeature,
    }
  );
}
