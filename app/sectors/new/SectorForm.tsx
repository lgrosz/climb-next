"use client";

import { FragmentType, getFragmentData, graphql } from "@/gql"
import { useSearchParams } from "next/navigation";

const CragFieldsFragment = graphql(`
  fragment NewSectorCragFields on Crag {
    id name
  }
`);

const RegionFieldsFragment = graphql(`
  fragment NewSectorRegionFields on Region {
    id name
    crags { id ...NewSectorCragFields }
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

export default function SectorForm(
  {
    action,
    ...props
  } : {
    action: (_: FormData) => Promise<void>,
    crags: Array<FragmentType<typeof CragFieldsFragment>>,
    regions: Array<FragmentType<typeof RegionFieldsFragment>>,
  }
) {
  const searchParams = useSearchParams();
  const defaultCrag = searchParams.get("crag") || undefined;
  const crags = props.crags.map(c => getFragmentData(CragFieldsFragment, c));
  const regions = props.regions.map(r => getFragmentData(RegionFieldsFragment, r));

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
	  htmlFor="crag"
	>
	  Select a crag
	</label>
	<select required name="crag" defaultValue={defaultCrag}>
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
  );
}

