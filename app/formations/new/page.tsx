import { redirect } from "next/navigation";
import FormationForm from './FormationForm';
import { graphql } from '@/gql';
import { graphqlQuery } from '@/graphql';
import { toFormationParentOptions } from "./FormationParentOptions";
import { submitNewFormationForm } from "./actions";

const query = graphql(`
  query NewFormationPageData {
    regions { ...RegionFormationParentOptionFields }
    crags { ...CragFormationParentOptionFields }
  }
`);

export default async function Page() {
  const result = await graphqlQuery(query);
  const parentOptions = toFormationParentOptions(result);

  const action = async (formData: FormData) => {
    'use server';
    const id = await submitNewFormationForm(formData);
    redirect(`/formations/${id}`);
  }

  return (
    <div>
      <h1>Create a new formation</h1>
      <FormationForm
        id="new-formation-form"
        action={action}
        parentOptions={parentOptions}
      />
      <div className="flex justify-end">
        <button form="new-formation-form" type="submit">
          Create
        </button>
      </div>
    </div>
  )
}

