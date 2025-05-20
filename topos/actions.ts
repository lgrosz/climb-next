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

type TopoFeature = TopoImageFeature;

// Converts internal TopoFeature type to GraphQL TopoFeatureInput
function toTopoFeatureInput(feature: TopoFeature) {
  let gqlFeature: TopoFeatureInput = { };

  if (feature.type === "image") {
    gqlFeature.image = {
      imageId: parseInt(feature.imageId),
      dest: feature.destCrop,
      source: feature.sourceCrop
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
