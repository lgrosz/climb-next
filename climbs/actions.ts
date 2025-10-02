"use server";

import { graphql } from "@/gql";
import { ClimbParentInput, GradeInput, InputMaybe, Scalars } from "@/gql/graphql";
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

type FormationParent = IParent & {
  type: "formation",
};

type Parent = |
  RegionParent |
  CragParent |
  SectorParent |
  FormationParent

export async function create(
  name?: string,
  description?: string,
  parent?: Parent
) {
  // TODO Raise error on failure

  const mutation = graphql(`
    mutation addClimb(
      $name: String
      $description: String
      $parent: ClimbParentInput
    ) {
      action: addClimb(
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
    formation: parent.type === "formation" ? parent.id : undefined,
  } : undefined;

  const { action: { id } } = await graphqlQuery(
    mutation,
    {
      name,
      description,
      parent: parentVar
    }
  );

  revalidatePath(`/climbs/${id}`);

  return id;
}

export async function move(climbId: Scalars["ID"]["input"], parent: InputMaybe<ClimbParentInput>) {
  // TODO Raise error on failure

  const mutation = graphql(`
    mutation moveClimb(
      $id: ID!
      $parent: ClimbParentInput
    ) {
      action: moveClimb(
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
      id: climbId,
      parent: parent
    }
  );

  // TODO revalidate
  // - revalidate path of old parent
  // - revalidate path of new parent
  revalidatePath('/')
  revalidatePath(`/climbs/${climbId}`)
}

export async function rename(climbId: Scalars["ID"]["input"], name: string) {
  const mutation = graphql(`
    mutation renameClimb(
      $id: ID!
      $name: String
    ) {
      action: renameClimb(
        id: $id
        name: $name
      ) {
        name
      }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    {
      id: climbId,
      name: name || null,
    }
  );

  revalidatePath('/')
  revalidatePath(`/climbs/${climbId}`)

  return data.action.name;
}

export async function describe(climbId: Scalars["ID"]["input"], description: string) {
  const mutation = graphql(`
    mutation describeClimb(
      $id: ID!
      $description: String
    ) {
      action: describeClimb(
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
      id: climbId,
      description: description || null,
    }
  );

  revalidatePath('/')
  revalidatePath(`/climbs/${climbId}`)

  return data.action.description;
}

export async function addGrade(climbId: Scalars["ID"]["input"], grade: GradeInput)
{
  const mutation = graphql(`
    mutation addClimbGrade(
      $id: ID!
      $grade: GradeInput!
    ) {
      action: addClimbGrade(
        id: $id
        grade: $grade
      ) { id }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    {
      id: climbId,
      grade: grade,
    }
  )

  return data.action.id;
}

export async function removeGrade(climbId: Scalars["ID"]["input"], grade: GradeInput)
{
  const mutation = graphql(`
    mutation removeClimbGrade(
      $id: ID!
      $grade: GradeInput!
    ) {
      action: removeClimbGrade(
        id: $id
        grade: $grade
      ) { id }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    {
      id: climbId,
      grade: grade,
    }
  )

  return data.action.id;
}
