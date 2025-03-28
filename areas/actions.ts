import { graphql } from "@/gql";
import { InputMaybe, AreaParentInput, Scalars } from "@/gql/graphql";
import { graphqlQuery } from "@/graphql";
import { revalidatePath } from "next/cache";

export async function create(
  name?: string,
  parent?: AreaParentInput
) {
  // TODO Raise error on failure

  const mutation = graphql(`
    mutation addArea(
      $name: String
      $parent: AreaParentInput
    ) {
      action: addArea(
        name: $name
        parent: $parent
      ) {
        id
        parent {
          ... on Area { id }
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

  if (id) {
    revalidatePath(`/areas/${id}`);
  }

  if (parentId) {
    revalidatePath(`/areas/${parentId}`);
  }

  revalidatePath('/');

  return id;
}

export async function rename(areaId: number, name: string) {
  // TODO Raise error on failure

  const mutation = graphql(`
    mutation renameArea(
      $id: ID!
      $name: String
    ) {
      action: renameArea(
        id: $id
        name: $name
      ) {
        name
        parent {
          __typename
          ... on Area {
            id
          }
        }
        areas { id }
        formations { id }
        climbs { id }
      }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    {
      id: `${areaId}`,
      name: name || null
    }
  );

  revalidatePath('/')
  revalidatePath(`/areas/${areaId}`)

  if (data.action.parent?.__typename == "Area") {
    const parentAreaId = data.action.parent.id;
    if (parentAreaId) {
      revalidatePath(`/areas/${parentAreaId}`)
    }
  }

  const childAreas = data.action.areas
  for (const child of childAreas) {
    const childAreaId = child.id
    if (childAreaId) {
      revalidatePath(`/areas/${childAreaId}`)
    }
  }

  const childFormations = data.action.formations
  for (const child of childFormations) {
    const childFormationId = child.id
    if (childFormationId) {
      revalidatePath(`/formations/${childFormationId}`)
    }
  }

  const childClimbs = data.action.climbs
  for (const child of childClimbs) {
    const childClimbId = child.id
    if (childClimbId) {
      revalidatePath(`/climbs/${childClimbId}`)
    }
  }

  return data.action.name;
}

export async function describe(areaId: number, description: string) {
  // TODO Raise error on failure

  const mutation = graphql(`
    mutation describeArea(
      $id: ID!
      $description: String
    ) {
      action: describeArea(
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
      id: `${areaId}`,
      description: description || null,
    }
  );

  revalidatePath('/')
  revalidatePath(`/areas/${areaId}`)

  return data.action.description;
}

export async function move(areaId: Scalars['ID']['input'], parent: InputMaybe<AreaParentInput>) {
  // TODO Raise error on failure

  const mutation = graphql(`
    mutation moveArea(
      $id: ID!
      $parent: AreaParentInput
    ) {
      action: moveArea(
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
      id: `${areaId}`,
      parent: parent
    }
  );

  // TODO revalidate
  // - revalidate path of old parent area
  // - revalidate path of new parent area
  revalidatePath('/')
  revalidatePath(`/areas/${areaId}`)
}


