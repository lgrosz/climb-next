import ClimbForm from './ClimbForm';
import { graphql } from '@/gql';
import { graphqlQuery } from '@/graphql';
import { submitNewClimbForm } from './actions';
import { redirect } from 'next/navigation';
import { toClimbParentOptions } from './ClimbParentOptions';
import { Suspense } from 'react';

const query = graphql(`
  query NewClimbPageData {
    regions { ...RegionClimbParentOptionFields }
    crags { ...CragClimbParentOptionFields }
    formations { ...FormationClimbParentOptionFields }
  }
`);

export default async function Page() {
  const result = await graphqlQuery(query);
  const parentOptions = toClimbParentOptions(result);

  const action = async (formData: FormData) => {
    "use server";
    const id = await submitNewClimbForm(formData);
    redirect(`/climbs/${id}`);
  }

  return (
    <div>
      <h1>Create a new climb</h1>
      <Suspense>
        <ClimbForm
          id="new-climb-form"
          action={action}
          parentOptions={parentOptions}
        />
      </Suspense>
      <div className="flex justify-end">
        <button form="new-climb-form" type="submit">
          Create
        </button>
      </div>
    </div>
  )
}

