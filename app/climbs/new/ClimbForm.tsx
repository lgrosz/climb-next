"use client";

import { FragmentType, getFragmentData, graphql } from "@/gql";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const FormationFieldsFragment = graphql(`
  fragment NewClimbFormationFields on Formation {
    id name
  }
`);

const SectorFieldsFragment = graphql(`
  fragment NewClimbSectorFields on Sector {
    id name
    formations { id ...NewClimbFormationFields }
  }
`);

const CragFieldsFragment = graphql(`
  fragment NewClimbCragFields on Crag {
    id name
    sectors { id ...NewClimbSectorFields }
    formations { id ...NewClimbFormationFields }
  }
`);

const RegionFieldsFragment = graphql(`
  fragment NewClimbRegionFields on Region {
    id name
    crags { id ...NewClimbCragFields }
    formations { id ...NewClimbFormationFields }
  }
`);

function findSectorWithFormationInCrags(
  crags: Array<FragmentType<typeof CragFieldsFragment>>,
  formationId: string
) {
  for (const c of crags) {
    const crag = getFragmentData(CragFieldsFragment, c);
    const sector = crag.sectors
      .map(s => getFragmentData(SectorFieldsFragment, s))
      .find(s => s.formations.some(f => f.id === formationId));
    if (sector) return sector.id;
  }
}

function findCragWithFormationInCrags(
  crags: Array<FragmentType<typeof CragFieldsFragment>>,
  formationId: string
) {
  const crag = crags
    .map(c => getFragmentData(CragFieldsFragment, c))
    .find(c => c.formations.some(f => f.id === formationId))

  return crag?.id;
}

function findCragWithSectorInCrags(
  crags: Array<FragmentType<typeof CragFieldsFragment>>,
  sectorId: string
) {
  const crag = crags
    .map(c => getFragmentData(CragFieldsFragment, c))
    .find(c => c.sectors.some(s => s.id === sectorId))

  return crag?.id;
}

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
  const searchParams = useSearchParams();
  const defaultFormation = searchParams.get("formation") || undefined;

  const defaultSector = defaultFormation
    ? (() => {
        const sector = findSectorWithFormationInCrags(props.crags, defaultFormation)
        if (sector) return sector;

        for (const r of props.regions) {
          const region = getFragmentData(RegionFieldsFragment, r);
          const sector = findSectorWithFormationInCrags(region.crags, defaultFormation);
          if (sector) return sector;
        }

        return undefined
      })()
    : searchParams.get("sector") || undefined;

  const defaultCrag =
    defaultSector
      ? (() => {
          const crag = findCragWithSectorInCrags(props.crags, defaultSector);
          if (crag) return crag;

          for (const r of props.regions) {
            const region = getFragmentData(RegionFieldsFragment, r);
            const crag = findCragWithSectorInCrags(region.crags, defaultSector);
            if (crag) return crag;
          }

          return undefined;
        })()
    : defaultFormation
      ? (() => {
          const crag = findCragWithFormationInCrags(props.crags, defaultFormation);
          if (crag) return crag;

          for (const r of props.regions) {
            const region = getFragmentData(RegionFieldsFragment, r);
            const crag = findCragWithFormationInCrags(region.crags, defaultFormation);
            if (crag) return crag;
          }

          return undefined;
        })()
    : searchParams.get("crag") || undefined;

  const defaultRegion =
    defaultCrag
      ? props.regions
          .map(c => getFragmentData(RegionFieldsFragment, c))
          .find(c => c.crags.some(s => s.id === defaultCrag))?.id
    : defaultFormation
      ? props.regions
          .map(r => getFragmentData(RegionFieldsFragment, r))
          .find(r => r.formations.some(f => f.id === defaultFormation))?.id
    : searchParams.get("region") || undefined;

  const regions = props.regions.map(r => getFragmentData(RegionFieldsFragment, r));

  const [region, setRegion] = useState<string | undefined>(defaultRegion);
  const crags = region !== undefined
    ? regions.find(r => r.id === region)?.crags.map(c => getFragmentData(CragFieldsFragment, c)) ?? []
    : props.crags.map(c => getFragmentData(CragFieldsFragment, c));

  const [crag, setCrag] = useState<string | undefined>(defaultCrag);
  const sectors = crag !== undefined
    ? crags.find(c => c.id === crag)?.sectors.map(s => getFragmentData(SectorFieldsFragment, s)) ?? []
    : [];

  const [sector, setSector] = useState<string | undefined>(defaultSector);
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
              defaultValue={defaultRegion}
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
              defaultValue={defaultCrag}
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
              defaultValue={defaultSector}
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
            <select
              defaultValue={defaultFormation}
              name="formation"
            >
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
