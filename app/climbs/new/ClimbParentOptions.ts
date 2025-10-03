// Exports type representation of parents of a climb intended to be used as <option>s alongside
// helpful graphql fragments and conversion functions to use create these types easily

import { FragmentType, getFragmentData, graphql } from "@/gql";

type Option = {
  id: string,
  name?: string,
}

export type FormationClimbParentOption = Option;

export type SectorClimbParentOption = Option & {
  formations: Array<FormationClimbParentOption>
}

export type CragClimbParentOption = Option & {
  sectors: Array<SectorClimbParentOption>
  formations: Array<FormationClimbParentOption>
}

export type RegionClimbParentOption = Option & {
  crags: Array<CragClimbParentOption>
  formations: Array<FormationClimbParentOption>
}

export type ClimbParentOptions = {
  regions: Array<RegionClimbParentOption>,
  crags: Array<CragClimbParentOption>,
  formations: Array<FormationClimbParentOption>,
};

const FormationFieldsFragment = graphql(`
  fragment FormationClimbParentOptionFields on Formation {
    id name
  }
`);

const SectorFieldsFragment = graphql(`
  fragment SectorClimbParentOptionFields on Sector {
    id name
    formations { id ...FormationClimbParentOptionFields }
  }
`);

const CragFieldsFragment = graphql(`
  fragment CragClimbParentOptionFields on Crag {
    id name
    sectors { id ...SectorClimbParentOptionFields }
    formations { id ...FormationClimbParentOptionFields }
  }
`);

const RegionFieldsFragment = graphql(`
  fragment RegionClimbParentOptionFields on Region {
    id name
    crags { id ...CragClimbParentOptionFields }
    formations { id ...FormationClimbParentOptionFields }
  }
`);


function toFormationParentOption(frag: FragmentType<typeof FormationFieldsFragment>) {
  const f = getFragmentData(FormationFieldsFragment, frag);

  return {
    id: f.id,
    name: f.name ?? undefined,
  }
}

function toSectorParentOption(frag: FragmentType<typeof SectorFieldsFragment>) {
  const s = getFragmentData(SectorFieldsFragment, frag);

  return {
    id: s.id,
    name: s.name ?? undefined,
    formations: s.formations.map(toFormationParentOption),
  }
}

function toCragParentOption(frag: FragmentType<typeof CragFieldsFragment>) {
  const c = getFragmentData(CragFieldsFragment, frag);

  return {
    id: c.id,
    name: c.name ?? undefined,
    sectors: c.sectors.map(toSectorParentOption),
    formations: c.formations.map(toFormationParentOption),
  }
}

function toRegionParentOption(frag: FragmentType<typeof RegionFieldsFragment>) {
  const r = getFragmentData(RegionFieldsFragment, frag);

  return {
    id: r.id,
    name: r.name ?? undefined,
    crags: r.crags.map(toCragParentOption),
    formations: r.formations.map(toFormationParentOption),
  }
}

export function toClimbParentOptions({
  regions,
  crags,
  formations,
}: {
  regions: Array<FragmentType<typeof RegionFieldsFragment>>,
  crags: Array<FragmentType<typeof CragFieldsFragment>>,
  formations: Array<FragmentType<typeof FormationFieldsFragment>>,
}): ClimbParentOptions {
  return {
    regions: regions.map(toRegionParentOption),
    crags: crags.map(toCragParentOption),
    formations: formations.map(toFormationParentOption),
  }
}
