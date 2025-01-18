import { GRAPHQL_ENDPOINT } from "@/constants";
import { query } from "@/graphql";
import { revalidatePath } from "next/cache";

export async function create(
  name?: string,
  parent?: { area?: number }
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
  }

  // TODO The () shouldn't be there if parameters are empty
  const mutation = `
    mutation(
      ${mutationParameters.join(' ')}
    ) {
      action: addArea(
        ${actionParameters.join(' ')}
      ) {
        id
        parent {
          ... on Area { id }
        }
      }
    }
  `

  const result = await query(GRAPHQL_ENDPOINT, mutation, {
    name: name,
    area: parent?.area,
  })
    .then(r => r.json());

  const { data, errors } = result;

  if (errors) {
    console.error(errors);
  }

  let id = data?.action?.id;
  let parentId = data?.action?.parent?.id;

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

  const dataQuery = `
    mutation(
      $id: Int!
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
  `;

  const result = await query(GRAPHQL_ENDPOINT, dataQuery, {
    id: areaId,
    name: name || null,
  })
    .then(r => r.json());

  const { data, errors } = result;

  if (errors) {
    console.error(JSON.stringify(errors, null, 2));
  }

  revalidatePath('/')
  revalidatePath(`/areas/${areaId}`)

  if (data?.action?.parent?.__typename == "Area") {
    const parentAreaId = data?.action?.parent?.id;
    if (parentAreaId) {
      revalidatePath(`/areas/${parentAreaId}`)
    }
  }

  const childAreas = data?.action?.areas ?? []
  for (const child of childAreas) {
    const childAreaId = child?.id
    if (childAreaId) {
      revalidatePath(`/areas/${childAreaId}`)
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

export async function describe(areaId: number, description: string) {
  // TODO Raise error on failure

  const dataQuery = `
    mutation(
      $id: Int!
      $description: String
    ) {
      action: describeArea(
        id: $id
        description: $description
      ) {
        description
      }
    }
  `;

  const result = await query(GRAPHQL_ENDPOINT, dataQuery, {
    id: areaId,
    description: description || null,
  })
    .then(r => r.json());

  const { data, errors } = result;

  if (errors) {
    console.error(JSON.stringify(errors, null, 2));
  }

  revalidatePath('/')
  revalidatePath(`/areas/${areaId}`)

  return data?.action?.description ?? "";
}


