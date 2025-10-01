"use client";

import { FragmentType, getFragmentData, graphql } from "@/gql";
import { useState } from "react";

const FormationFieldsFragment = graphql(`
  fragment NewClimbFormationFields on Formation {
    id name
  }
`);

const SectorFieldsFragment = graphql(`
  fragment NewClimbSectorFields on Sector {
    id name
    formations { ...NewClimbFormationFields }
  }
`);

const CragFieldsFragment = graphql(`
  fragment NewClimbCragFields on Crag {
    id name
    sectors { ...NewClimbSectorFields }
    formations { ...NewClimbFormationFields }
  }
`);

const RegionFieldsFragment = graphql(`
  fragment NewClimbRegionFields on Region {
    id name
    crags { ...NewClimbCragFields }
    formations { ...NewClimbFormationFields }
  }
`);

export default function ClimbForm(
  {
    action,
    ...props
  } : {
    action: (_: FormData) => Promise<void>
    regions: Array<FragmentType<typeof RegionFieldsFragment>>,
    crags: Array<FragmentType<typeof CragFieldsFragment>>,
    formations: Array<FragmentType<typeof FormationFieldsFragment>>,
  }
) {
  const regions = props.regions.map(r => getFragmentData(RegionFieldsFragment, r));

  const [region, setRegion] = useState<string>();
  const crags = region !== undefined
    ? regions.find(r => r.id === region)?.crags.map(c => getFragmentData(CragFieldsFragment, c)) ?? []
    : props.crags.map(c => getFragmentData(CragFieldsFragment, c));

  const [crag, setCrag] = useState<string>();
  const sectors = crag !== undefined
    ? crags.find(c => c.id === crag)?.sectors.map(s => getFragmentData(SectorFieldsFragment, s)) ?? []
    : [];

  const [sector, setSector] = useState<string>();
  const formations =
    sector !== undefined
      ? sectors.find(s => s.id === sector)?.formations.map(f => getFragmentData(FormationFieldsFragment, f)) ?? []
    : crag !== undefined
      ? crags.find(c => c.id === crag)?.formations.map(f => getFragmentData(FormationFieldsFragment, f)) ?? []
    : region !== undefined
      ? regions.find(r => r.id === region)?.formations.map(f => getFragmentData(FormationFieldsFragment, f)) ?? []
    : props.formations.map(f => getFragmentData(FormationFieldsFragment, f));

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
            <select
              name="region"
              onChange={e => {
                setRegion(e.target.value)
                setCrag(undefined)
              }}
            >
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
            <select
              name="crag"
              onChange={e => setCrag(e.target.value)}
            >
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
            <select
              name="sector"
              onChange={e => setSector(e.target.value)}
            >
              <option value={undefined} label="No sector" />
              {sectors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="formation">
              Select a formation
            </label>
            <select name="formation">
              <option value={undefined} label="No formation" />
              {formations.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
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
  )
}
