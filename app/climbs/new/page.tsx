import { create } from '@/climbs/actions';
import { redirect } from "next/navigation";
import ClimbForm from './ClimbForm';
import { graphql } from '@/gql';
import { graphqlQuery } from '@/graphql';

const query = graphql(`
  query NewClimbPageData {
    regions { ...NewClimbRegionFields }
    crags { ...NewClimbCragFields }
    formations { ...NewClimbFormationFields }
  }
`);

export default async function Page() {
  const result = await graphqlQuery(query);
  const {
    regions,
    crags,
    formations,
  } = result;

  const action = async (formData: FormData) => {
    'use server';
    const name = formData.get('name')?.toString();

    let parent;

    const formation = formData.get("formation")?.toString();
    const sector = formData.get("sector")?.toString();
    const crag = formData.get("crag")?.toString();
    const region = formData.get("region")?.toString();

    if (formation) {
      parent = { type: "formation", id: formation } as const;
    } else if (sector) {
      parent = { type: "sector", id: sector } as const;
    } else if (crag) {
      parent = { type: "crag", id: crag } as const;
    } else if (region) {
      parent = { type: "region", id: region } as const;
    } else {
      parent = undefined;
    }

    const id = await create(
      name ?? undefined,
      parent,
    );


    redirect(`/climbs/${id}`);
  }

  return (
    <ClimbForm
      action={action}
      regions={regions}
      crags={crags}
      formations={formations}
    />
  )
}

