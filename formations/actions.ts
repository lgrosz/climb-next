"use server";

import { graphql } from "@/gql";
import { CoordinateInput, FormationParentInput, InputMaybe, Scalars } from "@/gql/graphql";
import { graphqlQuery } from "@/graphql";
import { revalidatePath } from "next/cache";

interface IParent {
  id: Scalars["ID"]["input"],
}

type RegionParent = IParent & {
  type: "region",
};

type CragParent = IParent & {
  type: "crag",
};

type SectorParent = IParent & {
  type: "sector",
};

type Parent = |
  RegionParent |
  CragParent |
  SectorParent

export async function create(
  name?: string,
  description?: string,
  parent?: Parent
) {
  const mutation = graphql(`
    mutation addFormation(
      $name: String
      $description: String
      $parent: FormationParentInput
    ) {
      action: addFormation(
        name: $name
        description: $description
        parent: $parent
      ) {
        id
      }
    }
  `);

  const parentVar = parent ? {
    region: parent.type === "region" ? parent.id : undefined,
    crag: parent.type === "crag" ? parent.id : undefined,
    sector: parent.type === "sector" ? parent.id : undefined,
  } : undefined;

  const { action: { id } } = await graphqlQuery(
    mutation,
    {
      name,
      description,
      parent: parentVar,
    }
  );

  revalidatePath(`/formations/${id}`);

  return id;
}

export async function move(formationId: Scalars["ID"]["input"], parent: InputMaybe<FormationParentInput>) {
  // TODO Raise error on failure

  const mutation = graphql(`
    mutation moveFormation(
      $id: ID!
      $parent: FormationParentInput
    ) {
      action: moveFormation(
        id: $id
        parent: $parent
      ) {
        id
      }
    }
  `);

  await graphqlQuery(
    mutation,
    {
      id: formationId,
      parent: parent
    }
  );

  // TODO revalidate
  // - revalidate path of old parent
  // - revalidate path of new parent
  revalidatePath('/')
  revalidatePath(`/formations/${formationId}`)
}

export async function rename(formationId: Scalars["ID"]["input"], name: string) {
  "use server";

  const mutation = graphql(`
    mutation renameFormation(
      $id: ID!
      $name: String
    ) {
      action: renameFormation(
        id: $id
        name: $name
      ) {
        name
        climbs { id }
      }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    {
      id: formationId,
      name: name || null,
    }
  );

  revalidatePath('/')
  revalidatePath(`/formations/${formationId}`)

  const childClimbs = data.action.climbs
  for (const child of childClimbs) {
    const childClimbId = child.id
    if (childClimbId) {
      revalidatePath(`/climbs/${childClimbId}`)
    }
  }

  return data.action.name;
}

export async function describe(formationId: Scalars["ID"]["input"], description: string) {
  const mutation = graphql(`
    mutation describeFormation(
      $id: ID!
      $description: String
    ) {
      action: describeFormation(
        id: $id
        description: $description
      ) {
        description
      }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    {
      id: formationId,
      description: description || null,
    }
  );

  revalidatePath('/')
  revalidatePath(`/formations/${formationId}`)

  return data.action.description ?? "";
}

export async function relocate(formationId: Scalars["ID"]["input"], location: InputMaybe<CoordinateInput>) {
  const mutation = graphql(`
    mutation relocateFormation(
      $id: ID!
      $location: CoordinateInput
    ) {
      action: relocateFormation(
        id: $id
        location: $location
      ) {
        location { latitude longitude }
      }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    {
      id: formationId,
      location: location,
    }
  );

  revalidatePath('/')
  revalidatePath(`/formations/${formationId}`)

  return data.action.location;
}
