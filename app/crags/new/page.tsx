import { graphql } from "@/gql"
import { redirect } from "next/navigation";
import { graphqlQuery } from "@/graphql";
import CragForm from "./CragForm";
import { submitNewCragForm } from "./actions";
import { toCragParentOptions } from "./CragParentOptions";

const query = graphql(`
  query NewCragPageData {
    regions { ...RegionCragParentOptionFields }
  }
`);

export default async function Page()
{
  const result = await graphqlQuery(query);
  const parentOptions = toCragParentOptions(result);

  const action = async (formData: FormData) => {
    "use server";
    const id = await submitNewCragForm(formData);
    redirect(`/crags/${id}`);
  }

  return (
    <div>
      <h1>Create a new crag</h1>
      <CragForm id="new-crag-form" action={action} parentOptions={parentOptions} />
      <div className="flex justify-end">
        <button form="new-crag-form" type="submit">
          Create
        </button>
      </div>
    </div>
  );
}
