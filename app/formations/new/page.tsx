import { create } from '@/formations/actions';
import { redirect } from "next/navigation";
import FormationForm from './FormationForm';
import { graphql } from '@/gql';
import { graphqlQuery } from '@/graphql';

const query = graphql(`
  query NewFormationPage {
    crags { id ...NewFormationCragFields }
    regions { id ...NewFormationRegionFields }
  }
`);

export default async function Page() {
  const { crags, regions } = await graphqlQuery(query);

  const action = async (formData: FormData) => {
    'use server';

    const name = formData.get('name')?.toString();
    const description = formData.get('description')?.toString();

    let parent;

    const sector = formData.get("sector")?.toString();
    const crag = formData.get("crag")?.toString();
    const region = formData.get("region")?.toString();

    if (sector) {
      parent = { type: "sector", id: sector } as const;
    } else if (crag) {
      parent = { type: "crag", id: crag } as const;
    } else if (region) {
      parent = { type: "region", id: region } as const;
    } else {
      parent = undefined;
    }

    const id = await create(
      name || undefined,
      description || undefined,
      parent,
    );

    redirect(`/formations/${id}`);
  }

  return (
    <FormationForm
      action={action}
      regions={regions}
      crags={crags}
    />
  )
}

