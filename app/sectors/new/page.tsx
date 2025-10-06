import { graphql } from "@/gql"
import { redirect } from "next/navigation";
import { graphqlQuery } from "@/graphql";
import SectorForm from "./SectorForm";
import { toSectorParentOptions } from "./SectorParentOptions";
import { submitNewSectorForm } from "./actions";

const query = graphql(`
  query NewSectorPageData {
    crags { id ...CragSectorParentOptionFields }
    regions { id ...RegionSectorParentOptionFields }
  }
`);

export default async function Page()
{
  const result = await graphqlQuery(query);
  const parentOptions = toSectorParentOptions(result);

  const action = async (formData: FormData) => {
    "use server";
    const id = await submitNewSectorForm(formData);
    redirect(`/sectors/${id}`);
  }

  return (
    <div>
      <h1>Create a new sector</h1>
      <SectorForm id="new-sector-form" action={action} parentOptions={parentOptions} />
      <div className="flex justify-end">
        <button form="new-sector-form" type="submit">
          Create
        </button>
      </div>
    </div>
  );
}
