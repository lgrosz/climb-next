import { graphql } from "@/gql";
import { CoordinateInput, FormationParentInput, InputMaybe, Scalars } from "@/gql/graphql";
import { graphqlQuery } from "@/graphql";
import { revalidatePath } from "next/cache";

export async function create(
  name?: string,
  parent?: FormationParentInput
) {
  const mutation = graphql(`
    mutation addFormation(
      $name: String
      $parent: FormationParentInput
    ) {
      action: addFormation(
        name: $name
        parent: $parent
      ) {
        id
        parent {
          __typename
          ... on Formation { id }
        }
      }
    }
  `);

  const data = await graphqlQuery(
    mutation,
    {
      name: name,
      area: parent?.area,
      formation: parent?.formation,
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
        parent {
          __typename
          ... on Formation {
            id
          }
        }
        formations { id }
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
