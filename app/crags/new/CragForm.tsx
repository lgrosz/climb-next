"use client"

import { FragmentType, getFragmentData, graphql } from "@/gql"
import { useSearchParams } from "next/navigation";

const RegionFieldsForCragFormFragment = graphql(`
  fragment RegionFieldsForCragFormFragment on Region {
    id name
  }
`);

export default function CragForm({
  action,
  ...props
}: {
  action: (_: FormData) => Promise<void>
  regions: Array<FragmentType<typeof RegionFieldsForCragFormFragment>>
}) {
  const searchParams = useSearchParams();
  const regions = props.regions.map(f => getFragmentData(RegionFieldsForCragFormFragment, f));
  const defaultRegion = searchParams.get("region") || undefined;

  return (
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
	<select name="region" defaultValue={defaultRegion}>
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
  );
}

