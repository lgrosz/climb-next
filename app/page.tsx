import { FragmentType, graphql, getFragmentData } from '@/gql'
import { graphqlQuery } from '@/graphql'
import Link from 'next/link';

const ClimbFieldsFragment = graphql(`
  fragment ClimbFields on Climb {
    id name
  }`);

const FormationFieldsFragment = graphql(`
  fragment FormationFields on Formation {
    id name
    climbs { id ...ClimbFields }
  }`);

const SectorFieldsFragment = graphql(`
  fragment SectorFields on Sector {
    id name
    formations { id ...FormationFields }
    climbs { id ...ClimbFields }
  }`);

const CragFieldsFragment = graphql(`
  fragment CragFields on Crag {
    id name
    sectors { id ...SectorFields }
    formations { id ...FormationFields }
    climbs { id ...ClimbFields }
  }`);

const RegionFieldsFragment = graphql(`
  fragment RegionFields on Region {
    id name
    crags { id ...CragFields }
    formations { id ...FormationFields }
    climbs { id ...ClimbFields }
  }`);

const allEntities = graphql(`
  query allEntities {
    regions { id ...RegionFields }
    crags { id ...CragFields }
    formations { id ...FormationFields }
    climbs { id ...ClimbFields }
  }
`);

function ClimbItem(frag: FragmentType<typeof ClimbFieldsFragment>) {
  const {
    id,
    name,
  } = getFragmentData(ClimbFieldsFragment, frag);

  return (
    <li>
      <Link href={`/climbs/${id}`}>{ name }</Link>
    </li>
  )
}

function FormationItem(frag: FragmentType<typeof FormationFieldsFragment>) {
  const {
    id,
    name,
    climbs,
  } = getFragmentData(FormationFieldsFragment, frag);

  return (
    <li>
      <Link href={`/formations/${id}`}>{ name }</Link>
      <ul>
        { climbs.map(c => <ClimbItem key={`climb/${c.id}`} { ...c } />) }
      </ul>
    </li>
  )
}

function SectorItem(frag: FragmentType<typeof SectorFieldsFragment>) {
  const {
    id,
    name,
    formations,
    climbs,
  } = getFragmentData(SectorFieldsFragment, frag);

  return (
    <li>
      <Link href={`/sectors/${id}`}>{ name }</Link>
      <ul>
        { formations.map(f => <FormationItem key={`formation/${f.id}`} { ...f } />) }
        { climbs.map(c => <ClimbItem key={`climb/${c.id}`} { ...c } />) }
      </ul>
    </li>
  )
}

function CragItem(frag: FragmentType<typeof CragFieldsFragment>) {
  const {
    id,
    name,
    sectors,
    formations,
    climbs,
  } = getFragmentData(CragFieldsFragment, frag);

  return (
    <li>
      <Link href={`crags/${id}`}>{ name }</Link>
      <ul>
        { sectors.map(s => <SectorItem key={`sector/${s.id}`} { ...s } />) }
        { formations.map(f => <FormationItem key={`formation/${f.id}`} { ...f } />) }
        { climbs.map(c => <ClimbItem key={`climb/${c.id}`} { ...c } />) }
      </ul>
    </li>
  )
}

function RegionItem(frag: FragmentType<typeof RegionFieldsFragment>) {
  const {
    id,
    name,
    crags,
    formations,
    climbs,
  } = getFragmentData(RegionFieldsFragment, frag);

  return (
    <li>
      <Link href={`/regions/${id}`}>{ name }</Link>
      <ul>
        { crags.map(c => <CragItem key={`crag/${c.id}`} { ...c } />) }
        { formations.map(f => <FormationItem key={`formation/${f.id}`} { ...f } />) }
        { climbs.map(c => <ClimbItem key={`climb/${c.id}`} { ...c } />) }
      </ul>
    </li>
  )
}

export default async function Page() {
  const data = await graphqlQuery(allEntities)

  const {
    regions,
    crags,
    formations,
    climbs,
  } = data;

  return (
    <div>
      <h1>Content</h1>
      <ul>
        <li>
          <a href="/regions/new">Create new region</a>
        </li>
        <hr />
        { regions.map(r => <RegionItem key={`region/${r.id}`} { ...r } />) }
        { crags.map(c => <CragItem key={`crag/${c.id}`} { ...c } />) }
        { formations.map(f => <FormationItem key={`formation/${f.id}`} { ...f } />) }
        { climbs.map(c => <ClimbItem key={`climb/${c.id}`} { ...c } />) }
      </ul>
    </div>
  );
}


