"use client";

import { FragmentType, getFragmentData, graphql } from "@/gql";
import { useEffect, useState } from "react";

const SectorFieldsFragment = graphql(`
  fragment NewFormationSectorFields on Sector {
    id name
  }
`);

const CragFieldsFragment = graphql(`
  fragment NewFormationCragFields on Crag {
    id name
    sectors { id ...NewFormationSectorFields }
  }
`);

const RegionFieldsFragment = graphql(`
  fragment NewFormationRegionFields on Region {
    id name
    crags { id ...NewFormationCragFields }
  }
`);

export default function FormationForm(
  {
    action,
    ...props
  } : {
    action: (_: FormData) => Promise<void>,
    regions: Array<FragmentType<typeof RegionFieldsFragment>>,
    crags: Array<FragmentType<typeof CragFieldsFragment>>,
  }
) {
  const regions = props.regions.map(r => getFragmentData(RegionFieldsFragment, r));

  const [region, setRegion] = useState<string>();
  const crags = region !== undefined
    ? regions.find(r => r.id === region)?.crags.map(c => getFragmentData(CragFieldsFragment, c)) ?? []
    : props.crags.map(c => getFragmentData(CragFieldsFragment, c));

  const [crag, setCrag] = useState<string>();
  const sectors = crag !== undefined
    ? crags.find(c => c.id === crag)?.sectors.map(s => getFragmentData(SectorFieldsFragment, s)) ??[]
    : [];

  // TODO There has to be a neater way of doing this
  // To avoid issues with keeping state from old selections
  useEffect(() => {
    setCrag(undefined);
  }, [region])

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
        <fieldset>
          <legend>Select a parent</legend>
          <div>
            <label htmlFor="region">
              Region
            </label>
            <select name="region" onChange={e => setRegion(e.target.value)}>
              <option value={undefined} label="No region" />
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="crag">
              Crag
            </label>
            <select name="crag" onChange={e => setCrag(e.target.value)}>
              <option value={undefined} label="No crag" />
              {crags.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sector">
              Select a sector
            </label>
            <select name="sector">
              <option value={undefined} label="No sector" />
              {sectors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </fieldset>
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
