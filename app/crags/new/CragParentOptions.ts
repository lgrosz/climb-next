// Exports type representation of parents of a crag intended to be used as <option>s alongside
// helpful graphql fragments and conversion functions to use create these types easily

import { FragmentType, getFragmentData, graphql } from "@/gql";

type Option = {
  id: string,
  name?: string,
}

export type RegionCragParentOption = Option;

export type CragParentOptions = {
  regions: Array<RegionCragParentOption>,
};

const RegionFieldsFragment = graphql(`
  fragment RegionCragParentOptionFields on Region {
    id name
  }
`);

function toRegionParentOption(frag: FragmentType<typeof RegionFieldsFragment>) {
  const r = getFragmentData(RegionFieldsFragment, frag);

  return {
    id: r.id,
    name: r.name ?? undefined,
  }
}

export function toCragParentOptions({
  regions,
}: {
  regions: Array<FragmentType<typeof RegionFieldsFragment>>,
}): CragParentOptions {
  return {
    regions: regions.map(toRegionParentOption),
  }
}
