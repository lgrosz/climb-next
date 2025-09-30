import { graphql } from "@/gql"
import { create } from "@/sectors/actions";
import { redirect } from "next/navigation";
import { graphqlQuery } from "@/graphql";
import SectorForm from "./SectorForm";

const cragOptions = graphql(`
  query cragOptions {
    crags { id ...NewSectorCragFields }
    regions { id ...NewSectorRegionFields }
  }
`);

export default async function Page()
{
  const { crags, regions } = await graphqlQuery(cragOptions);

  const action = async (formData: FormData) => {
    "use server";

    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const crag_id = formData.get("crag")?.toString();
    if (!crag_id) throw new Error("Please select a crag");

    const id = await create(name, description, crag_id);
    redirect(`/sectors/${id}`);
  }

  return (
    <div>
      <h1>Create a new sector</h1>
      <SectorForm action={action} crags={crags} regions={regions} />
    </div>
  );
}
