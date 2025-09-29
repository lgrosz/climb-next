import { graphql } from "@/gql"
import { create } from "@/crags/actions";
import { redirect } from "next/navigation";
import { graphqlQuery } from "@/graphql";

const regionOptions = graphql(`
  query regionOptions {
    regions { id name }
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
      <form action={action}>
	<div>
	  <label
	    className="block"
	    htmlFor="name"
	  >
	    Add a name
	  </label>
	  <input
	    id="name"
	    type="text"
	    className="w-full"
	    name="name"
	  />
	  <label
	    className="block"
	    htmlFor="description"
	  >
	    Add a description
	  </label>
	  <textarea
	    id="description"
	    className="w-full resize-y"
	    name="description"
	  />
	  <label
	    className="block"
	    htmlFor="region"
	  >
	    Select a region
	  </label>
	  <select name="region">
	    <option label="No region" value={undefined} />
	    {regions.map(r => (
	      <option key={r.id} label={r.name ?? ""} value={r.id} />
	    ))}
	  </select>
	</div>
	<div className="flex justify-end">
	  <button type="button">
	    Cancel
	  </button>
	  <button type="submit">
	    Create
	  </button>
	</div>
      </form>
    </div>
  );
}
