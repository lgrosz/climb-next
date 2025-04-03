import { graphql } from "@/gql";
import { ClimbParentInput, GradeInput, InputMaybe, Scalars } from "@/gql/graphql";
import { graphqlQuery } from "@/graphql";
import { revalidatePath } from "next/cache";

export async function create(
  name?: string,
  parent?: ClimbParentInput
) {
  // TODO Raise error on failure

  const mutation = graphql(`
    mutation addClimb(
      $name: String
      $parent: ClimbParentInput
    ) {
      action: addClimb(
        name: $name
        parent: $parent
      ) {
        id
        parent {
          __typename
          ... on Area { id }
          ... on Formation { id }
        }
      }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    {
      name: name,
      parent: parent
    }
  );

  let id = data.action.id;
  let parentId = data.action.parent?.id;
  let parentType = data.action.parent?.__typename;

  if (id) {
    revalidatePath(`/areas/${id}`);
  }

  if (parentType === "Area") {
    if (parentId) {
      revalidatePath(`/areas/${parentId}`);
    }
  } else if (parentType === "Formation"){
    if (parentId) {
      revalidatePath(`/formations/${parentId}`);
    }
  }

  revalidatePath('/');

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
        parent {
          __typename
          ... on Area { id }
          ... on Formation { id }
        }
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

  if (data.action.parent?.__typename == "Area") {
    const parentAreaId = data.action.parent.id;
    if (parentAreaId) {
      revalidatePath(`/areas/${parentAreaId}`)
    }
  } else if (data.action.parent?.__typename == "Formation") {
    const parentFormationId = data.action.parent.id;
    if (parentFormationId) {
      revalidatePath(`/formations/${parentFormationId}`)
    }
  }

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
