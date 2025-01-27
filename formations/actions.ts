import { GRAPHQL_ENDPOINT } from "@/constants";
import { query } from "@/graphql";
import { revalidatePath } from "next/cache";

export async function create(
  name?: string,
  parent?: {
    area?: number
    formation?: number
  }
) {
  // TODO Raise error on failure
  const mutationParameters = [];
  const actionParameters = [];

  if (name) {
    mutationParameters.push('$name: String');
    actionParameters.push('name: $name');
  }

  if (parent?.area) {
    mutationParameters.push('$area: Int!');
    actionParameters.push('parent: { area: $area }');
  } else if (parent?.formation) {
    mutationParameters.push('$formation: Int!');
    actionParameters.push('parent: { formation: $formation }');
  }

  // TODO The () shouldn't be there if parameters are empty
  const mutation = `
    mutation(
      ${mutationParameters.join(' ')}
    ) {
      action: addFormation(
        ${actionParameters.join(' ')}
      ) {
        id
        parent {
          __typename
          ... on Area { id }
          ... on Formation { id }
        }
      }
    }
  `

  const result = await query(GRAPHQL_ENDPOINT, mutation, {
    name: name,
    area: parent?.area,
    formation: parent?.formation,
  })
    .then(r => r.json());

  const { data, errors } = result;

  if (errors) {
    console.error(errors);
  }

  let id = data?.action?.id;
  let parentId = data?.action?.parent?.id;
  let parentType = data?.action?.parent?.__typename;

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

export async function rename(formationId: number, name: string) {
  const dataQuery = `
    mutation(
      $id: Int!
      $name: String
    ) {
      action: renameFormation(
        id: $id
        name: $name
      ) {
        name
        parent {
          __typename
          ... on Area {
            id
          }
          ... on Formation {
            id
          }
        }
        formations { id }
        climbs { id }
      }
    }
  `;

  const result = await query(GRAPHQL_ENDPOINT, dataQuery, {
    id: formationId,
    name: name || null,
  })
    .then(r => r.json());

  const { data, errors } = result;

  if (errors) {
    console.error(JSON.stringify(errors, null, 2));
  }

  revalidatePath('/')
  revalidatePath(`/formations/${formationId}`)

  if (data?.action?.parent?.__typename == "Area") {
    const parentAreaId = data?.action?.parent?.id;
    if (parentAreaId) {
      revalidatePath(`/areas/${parentAreaId}`)
    }
  } else if (data?.action?.parent?.__typename == "Formation") {
    const parentFormationId = data?.action?.parent?.id;
    if (parentFormationId) {
      revalidatePath(`/formations/${parentFormationId}`)
    }
  }

  const childFormations = data?.action?.formations ?? []
  for (const child of childFormations) {
    const childFormationId = child?.id
    if (childFormationId) {
      revalidatePath(`/formations/${childFormationId}`)
    }
  }

  const childClimbs = data?.action?.climbs ?? []
  for (const child of childClimbs) {
    const childClimbId = child?.id
    if (childClimbId) {
      revalidatePath(`/climbs/${childClimbId}`)
    }
  }

  return data?.action?.name ?? "";
}

export async function describe(formationId: number, description: string) {
  const dataQuery = `
    mutation(
      $id: Int!
      $description: String
    ) {
      action: describeFormation(
        id: $id
        description: $description
      ) {
        description
      }
    }
  `;

  const result = await query(GRAPHQL_ENDPOINT, dataQuery, {
    id: formationId,
    description: description || null,
  })
    .then(r => r.json());

  const { data, errors } = result;

  if (errors) {
    console.error(JSON.stringify(errors, null, 2));
  }

  revalidatePath('/')
  revalidatePath(`/formations/${formationId}`)

  return data?.action?.description ?? "";
}

export async function relocate(formationId: number, location: { latitude: number, longitude: number } | null) {
  const dataQuery = `
    mutation(
      $id: Int!
      $location: CoordinateInput
    ) {
      action: relocateFormation(
        id: $id
        location: $location
      ) {
        location { latitude longitude }
      }
    }
  `;

  const result = await query(GRAPHQL_ENDPOINT, dataQuery, {
    id: formationId,
    location: location,
  })
    .then(r => r.json());

  const { data, errors } = result;

  if (errors) {
    console.error(JSON.stringify(errors, null, 2));
  }

  revalidatePath('/')
  revalidatePath(`/formations/${formationId}`)

  return data?.action?.location ?? null;
}
