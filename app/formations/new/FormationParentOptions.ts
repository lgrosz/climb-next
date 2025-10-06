// Exports type representation of parents of a formation intended to be used as <option>s alongside
// helpful graphql fragments and conversion functions to use create these types easily

import { FragmentType, getFragmentData, graphql } from "@/gql";

type Option = {
  id: string,
  name?: string,
}

export type SectorFormationParentOption = Option;

export type CragFormationParentOption = Option & {
  sectors: Array<SectorFormationParentOption>
}

export type RegionFormationParentOption = Option & {
  crags: Array<CragFormationParentOption>
}

export type FormationParentOptions = {
  regions: Array<RegionFormationParentOption>,
  crags: Array<CragFormationParentOption>,
};

const SectorFieldsFragment = graphql(`
  fragment SectorFormationParentOptionFields on Sector {
    id name
  }
`);

const CragFieldsFragment = graphql(`
  fragment CragFormationParentOptionFields on Crag {
    id name
    sectors { id ...SectorFormationParentOptionFields }
  }
`);

const RegionFieldsFragment = graphql(`
  fragment RegionFormationParentOptionFields on Region {
    id name
    crags { id ...CragFormationParentOptionFields }
  }
`);

function toSectorParentOption(frag: FragmentType<typeof SectorFieldsFragment>) {
  const s = getFragmentData(SectorFieldsFragment, frag);

  return {
    id: s.id,
    name: s.name ?? undefined,
  }
}

function toCragParentOption(frag: FragmentType<typeof CragFieldsFragment>) {
  const c = getFragmentData(CragFieldsFragment, frag);

  return {
    id: c.id,
    name: c.name ?? undefined,
    sectors: c.sectors.map(toSectorParentOption),
  }
}

function toRegionParentOption(frag: FragmentType<typeof RegionFieldsFragment>) {
  const r = getFragmentData(RegionFieldsFragment, frag);

  return {
    id: r.id,
    name: r.name ?? undefined,
    crags: r.crags.map(toCragParentOption),
  }
}

export function toFormationParentOptions({
  regions,
  crags,
}: {
  regions: Array<FragmentType<typeof RegionFieldsFragment>>,
  crags: Array<FragmentType<typeof CragFieldsFragment>>,
}): FormationParentOptions {
  return {
    regions: regions.map(toRegionParentOption),
    crags: crags.map(toCragParentOption),
  }
}
