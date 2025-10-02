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

    const location = (() => {
      const latitude = Number(formData.get("latitude") ?? NaN);
      const longitude = Number(formData.get("longitude") ?? NaN);
      return !isNaN(latitude) && !isNaN(longitude) ? { latitude, longitude } : undefined;
    })();

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
      location,
      parent,
    );

    redirect(`/formations/${id}`);
  }

  return (
    <div>
      <h1>Create a new formation</h1>
      <FormationForm
        action={action}
        regions={regions}
        crags={crags}
      />
    </div>
  )
}

