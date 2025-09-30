import { graphql } from "@/gql"
import { create } from "@/crags/actions";
import { redirect } from "next/navigation";
import { graphqlQuery } from "@/graphql";
import CragForm from "./CragForm";

const regionOptions = graphql(`
  query regionOptions {
    regions { ...RegionFieldsForCragFormFragment }
  }
`);

export default async function Page()
{
  const { regions } = await graphqlQuery(regionOptions);

  const action = async (formData: FormData) => {
    "use server";

    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const region_id = formData.get("region")?.toString();

    const id = await create(name, description, region_id);
    redirect(`/crags/${id}`);
  }

  return (
    <div>
      <h1>Create a new crag</h1>
      <CragForm action={action} regions={regions} />
    </div>
  );
}
