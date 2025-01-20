import { GRAPHQL_ENDPOINT } from '@/constants'
import Link from 'next/link'
import { query } from '@/graphql'
import RenameHeader from '@/components/RenameHeader'
import RelocateHeader from '@/components/RelocateHeader'
import EditableTextArea from '@/components/EditableTextArea';
import {
  rename as renameFormation,
  describe as describeFormation,
  relocate as relocateFormation,
} from '@/formations/actions'

interface FormationParent {
  __typename: string,
  id: number,
  name: string | null
}

interface SubFormation {
  id: number,
  name: string | null
}

interface Climb {
  id: number,
  name: string | null
}

interface Coordinate {
  latitude: number,
  longitude: number,
}

interface Formation {
  id: number,
  name: string | null,
  description: string | null,
  location: Coordinate | null,
  parent: FormationParent | null,
  formations: SubFormation[],
  climbs: Climb[],
}

const dataQuery = `
  query($id: Int!) {
    formation(
      id: $id
    ) {
      id name description
      location { latitude longitude }
      formations { id name }
      climbs { id name }
      parent {
        __typename
        ... on Area { id name }
        ... on Formation { id name }
      }
    }
  }
`

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const result = await query(GRAPHQL_ENDPOINT, dataQuery, { id: parseInt(params.id) })
    .then(r => r.json());
  const { data, errors } = result;

  if (errors) {
    console.error(JSON.stringify(errors, null, 2));
    return <div>There was an error generating the page.</div>
  }

  const { formation }: { formation: Formation } = data;

  let parentHref: string | null = null;
  if (formation?.parent?.__typename == "Area") {
    parentHref = `/areas/${formation.parent.id}`
  } else if (formation?.parent?.__typename == "Formation") {
    parentHref = `/formations/${formation.parent.id}`
  }

  const rename = async (name: string) => {
    'use server';
    return await renameFormation(formation.id, name);
  }

  const describe = async (description: string) => {
    'use server';
    return await describeFormation(formation.id, description);
  }

  const relocate = async (location: Coordinate | null) => {
    'use server';
    return await relocateFormation(formation.id, location);
  }

  return (
    <div>
      <RenameHeader
        name={formation.name ?? ""}
        placeholder="Unnamed formation"
        as="h1"
        rename={rename}
      />
      <RelocateHeader
        location={formation.location}
        placeholder="No location"
        as="h3"
        relocate={relocate}
      />
      {
        formation.parent ?
        <h2><Link href={`${parentHref}`}>{formation.parent.name}</Link></h2> :
        null
      }
      <div>
        <h3>Description</h3>
        <EditableTextArea
          text={formation.description ?? ""}
          placeholder="No description available"
          as="p"
          onSave={describe}
        />
      </div>
      <div>
        <h3>Formations</h3>
        <Link href="/formations/new">New formation</Link>
      </div>
      <ul>
        {formation.formations.map((formation) => (
          <li key={`formations-${formation.id}`}>
            <Link href={`/formations/${formation.id}`}>{formation.name}</Link>
          </li>
        ))}
      </ul>
      <div>
        <h3>Climbs</h3>
        <Link href="/climbs/new">New climb</Link>
      </div>
      <ul>
        {formation.climbs.map((climb) => (
          <li key={`climb-${climb.id}`}>
            <Link href={`/climbs/${climb.id}`}>{climb.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

