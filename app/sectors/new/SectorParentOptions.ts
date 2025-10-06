// Exports type representation of parents of a sector intended to be used as <option>s alongside
// helpful graphql fragments and conversion functions to use create these types easily

import { FragmentType, getFragmentData, graphql } from "@/gql";

type Option = {
  id: string,
  name?: string,
}

export type CragSectorParentOption = Option;

export type RegionSectorParentOption = Option & {
  crags: Array<CragSectorParentOption>
}

export type SectorParentOptions = {
  regions: Array<RegionSectorParentOption>,
  crags: Array<CragSectorParentOption>,
};

const CragFieldsFragment = graphql(`
  fragment CragSectorParentOptionFields on Crag {
    id name
  }
`);

const RegionFieldsFragment = graphql(`
  fragment RegionSectorParentOptionFields on Region {
    id name
    crags { id ...CragSectorParentOptionFields }
  }
`);

function toCragParentOption(frag: FragmentType<typeof CragFieldsFragment>) {
  const c = getFragmentData(CragFieldsFragment, frag);

  return {
    id: c.id,
    name: c.name ?? undefined,
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

export function toSectorParentOptions({
  regions,
  crags,
}: {
  regions: Array<FragmentType<typeof RegionFieldsFragment>>,
  crags: Array<FragmentType<typeof CragFieldsFragment>>,
}): SectorParentOptions {
  return {
    regions: regions.map(toRegionParentOption),
    crags: crags.map(toCragParentOption),
  }
}
