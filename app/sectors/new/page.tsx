import { FragmentType, getFragmentData, graphql } from "@/gql"
import { create } from "@/sectors/actions";
import { redirect } from "next/navigation";
import { graphqlQuery } from "@/graphql";

const CragFieldsFragment = graphql(`
  fragment NewSectorCragFields on Crag {
    id name
  }
`);

const RegionFieldsFragment = graphql(`
  fragment NewSectorRegionFields on Region {
    name
    crags { id ...NewSectorCragFields }
  }
`);

const cragOptions = graphql(`
  query cragOptions {
    crags { id ...NewSectorCragFields }
    regions { id ...NewSectorRegionFields }
  }
`);

function CragItem(frag: FragmentType<typeof CragFieldsFragment>) {
  const {
    id,
    name
  } = getFragmentData(CragFieldsFragment, frag);
  return (
    <option id={id} label={name ?? ""} value={id} />
  );
}

function RegionItem(frag: FragmentType<typeof RegionFieldsFragment>) {
  const {
    name,
    crags
  } = getFragmentData(RegionFieldsFragment, frag);
  return (
    <optgroup label={name ?? ""}>
      {crags.map(c => (
	<CragItem key={c.id} {...c} />
      ))}
    </optgroup>
  );
}

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
	    htmlFor="crag"
	  >
	    Select a crag
	  </label>
	  <select required name="crag">
	    {crags.map(c => (
	      <CragItem key={c.id} {...c} />
	    ))}
	    {regions.map(r => (
	      <RegionItem key={r.id} {...r} />
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
