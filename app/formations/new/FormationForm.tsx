"use client";

import { FragmentType, getFragmentData, graphql } from "@/gql";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

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
  const searchParams = useSearchParams();

  const defaultSector = searchParams.get("sector") || undefined;

  // TODO This logic is a bit messy and could be better. Really, in both of these cases, we know
  // what the default-region is, so we don't need to calculate that afterward.
  const defaultCrag = defaultSector
    ? (() => {
        // check root crags first
        const crag = props.crags
          .map(c => getFragmentData(CragFieldsFragment, c))
          .find(c => c.sectors.some(s => s.id === defaultSector));
        if (crag) return crag.id;

        // check crags nested under regions
        for (const r of props.regions) {
          // TODO technically, here we also know the default-region
          const region = getFragmentData(RegionFieldsFragment, r);
          const crag = region.crags
            .map(c => getFragmentData(CragFieldsFragment, c))
            .find(c => c.sectors.some(s => s.id === defaultSector));
          if (crag) return crag.id;
        }

        return undefined;
      })()
    : searchParams.get("crag") || undefined;

  const defaultRegion = defaultCrag
    ? props.regions
        .map(c => getFragmentData(RegionFieldsFragment, c))
        .find(c => c.crags.some(s => s.id === defaultCrag))?.id
    : searchParams.get("region") || undefined;

  const regions = props.regions.map(r => getFragmentData(RegionFieldsFragment, r));

  const [region, setRegion] = useState<string | undefined>(defaultRegion);
  const crags = region !== undefined
    ? regions.find(r => r.id === region)?.crags.map(c => getFragmentData(CragFieldsFragment, c)) ?? []
    : props.crags.map(c => getFragmentData(CragFieldsFragment, c));

  const [crag, setCrag] = useState<string | undefined>(defaultCrag);
  const sectors = crag !== undefined
    ? crags.find(c => c.id === crag)?.sectors.map(s => getFragmentData(SectorFieldsFragment, s)) ??[]
    : [];

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
              defaultValue={defaultRegion}
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
              defaultValue={defaultCrag}
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
              defaultValue={defaultSector}
            >
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
